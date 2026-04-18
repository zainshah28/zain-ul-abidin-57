const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const round2 = (value) => Math.round(value * 100) / 100;
const toPercentScore = (score) => (score > 10 ? score : score * 10);

const average = (values) => {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getSubjectStats = ({ quizzes, tasks }) => {
  const stats = new Map();

  quizzes.forEach((quiz) => {
    if (!stats.has(quiz.subject)) {
      stats.set(quiz.subject, { scores: [], pendingHours: 0, pendingTasks: 0 });
    }
    stats.get(quiz.subject).scores.push(toPercentScore(quiz.score));
  });

  tasks.forEach((task) => {
    if (!stats.has(task.subject)) {
      stats.set(task.subject, { scores: [], pendingHours: 0, pendingTasks: 0 });
    }
    if (task.status !== "completed") {
      stats.get(task.subject).pendingHours += task.studyHours;
      stats.get(task.subject).pendingTasks += 1;
    }
  });

  return stats;
};

const getBestHours = (focusSessions) => {
  if (!focusSessions.length) {
    return [9, 11, 16, 20];
  }

  const map = new Map();
  focusSessions.forEach((session) => {
    const hour = new Date(session.startedAt).getHours();
    if (!map.has(hour)) {
      map.set(hour, []);
    }
    map.get(hour).push(session.qualityScore);
  });

  return [...map.entries()]
    .map(([hour, scores]) => ({ hour, score: average(scores) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.hour);
};

const calculateTaskPriority = ({ task, statsBySubject, now }) => {
  const subjectStats = statsBySubject.get(task.subject) || { scores: [], pendingHours: 0 };
  const avgScore = average(subjectStats.scores);
  const difficultyWeight = clamp(1 + ((70 - avgScore) / 50), 0.6, 1.8);

  const deadlineHours = (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
  const urgencyWeight = deadlineHours <= 0 ? 2.3 : clamp(1 + (72 - deadlineHours) / 72, 0.8, 2.3);

  const sizeWeight = clamp(task.studyHours / 2, 0.6, 1.8);

  return round2(difficultyWeight * urgencyWeight * sizeWeight);
};

export const buildOptimizedSchedule = ({
  tasks,
  quizzes,
  focusSessions,
  weeklyGoalHours = 14,
  days = 7,
  now = new Date()
}) => {
  const pendingTasks = tasks.filter((task) => task.status !== "completed");
  const statsBySubject = getSubjectStats({ quizzes, tasks });
  const bestHours = getBestHours(focusSessions);

  const prioritizedTasks = pendingTasks
    .map((task) => ({
      task,
      priorityScore: calculateTaskPriority({ task, statsBySubject, now })
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const totalHours = Math.max(weeklyGoalHours, pendingTasks.reduce((sum, task) => sum + task.studyHours, 0));
  const hoursPerDay = totalHours / Math.max(days, 1);

  let cursor = 0;
  const plan = [];

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0);

    let remainingHours = round2(hoursPerDay);
    const blocks = [];

    while (remainingHours > 0 && cursor < prioritizedTasks.length) {
      const candidate = prioritizedTasks[cursor];
      const alloc = Math.min(remainingHours, Math.max(0.5, candidate.task.studyHours));
      const preferredHour = bestHours[(blocks.length + dayIndex) % bestHours.length];

      blocks.push({
        taskId: candidate.task._id,
        subject: candidate.task.subject,
        topic: candidate.task.topic,
        allocatedHours: round2(alloc),
        preferredStartHour: preferredHour,
        deadline: candidate.task.deadline,
        priorityScore: candidate.priorityScore
      });

      remainingHours = round2(remainingHours - alloc);
      cursor += 1;
    }

    plan.push({
      date: date.toISOString().slice(0, 10),
      targetHours: round2(hoursPerDay),
      blocks
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    assumptions: {
      weeklyGoalHours,
      days,
      bestHours
    },
    plan
  };
};

const confidenceBand = (mean, confidence) => {
  const margin = (1 - confidence) * 20;
  return {
    lower: round2(clamp(mean - margin, 0, 100)),
    upper: round2(clamp(mean + margin, 0, 100))
  };
};

export const buildPredictions = ({ tasks, quizzes, focusSessions, memories, now = new Date() }) => {
  const subjectStats = getSubjectStats({ quizzes, tasks });

  const examOutlook = [...subjectStats.entries()].map(([subject, stats]) => {
    const avgScore = average(stats.scores);
    const performanceProbability = clamp((avgScore / 100) * 0.75 + 0.2, 0.05, 0.98);
    const confidence = clamp(stats.scores.length / 8, 0.45, 0.9);

    return {
      subject,
      examSuccessProbability: round2(performanceProbability * 100),
      confidence: round2(confidence),
      confidenceInterval: confidenceBand(performanceProbability * 100, confidence)
    };
  });

  const deadlineRisks = tasks
    .filter((task) => task.status !== "completed")
    .map((task) => {
      const hoursLeft = (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      const studyPressure = task.studyHours / Math.max(hoursLeft / 24, 0.5);
      const riskScore = clamp((studyPressure / 6) * 100, 5, 99);
      const confidence = clamp(0.55 + (hoursLeft < 72 ? 0.2 : 0), 0.5, 0.92);

      return {
        taskId: task._id,
        subject: task.subject,
        topic: task.topic,
        deadline: task.deadline,
        missDeadlineRisk: round2(riskScore),
        confidence: round2(confidence),
        confidenceInterval: confidenceBand(riskScore, confidence)
      };
    })
    .sort((a, b) => b.missDeadlineRisk - a.missDeadlineRisk);

  const focusAvg = average(focusSessions.map((session) => session.qualityScore));
  const studyEffectiveness = round2(
    clamp((focusAvg || 50) * 0.6 + average(quizzes.map((quiz) => toPercentScore(quiz.score))) * 0.4, 0, 100)
  );

  const dueMemories = memories.filter((memory) => new Date(memory.dueDate) <= now);
  const retentionRate = memories.length
    ? round2((average(memories.map((memory) => memory.recallProbability || 0.5))) * 100)
    : 50;

  return {
    generatedAt: new Date().toISOString(),
    examOutlook,
    deadlineRisks,
    studySessionEffectiveness: {
      expectedScore: studyEffectiveness,
      confidence: round2(clamp(focusSessions.length / 12, 0.4, 0.88)),
      trend: studyEffectiveness > 70 ? "improving" : studyEffectiveness > 50 ? "stable" : "declining"
    },
    retentionForecast: {
      expectedRetentionRate: retentionRate,
      dueReviews: dueMemories.length,
      confidence: round2(clamp(memories.length / 20, 0.35, 0.9))
    },
    warnings: {
      atRiskSubjects: examOutlook.filter((item) => item.examSuccessProbability < 60).map((item) => item.subject),
      highRiskDeadlines: deadlineRisks.filter((item) => item.missDeadlineRisk >= 70)
    }
  };
};
