const roundTo2 = (value) => Math.round(value * 100) / 100;
const normalizeTo10 = (score) => (score > 10 ? score / 10 : score);

const getLast7DaysLabels = () => {
  const labels = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toISOString().slice(0, 10));
  }
  return labels;
};

export const buildAnalysis = ({ tasks, quizzes, studyHoursThreshold = 2 }) => {
  const weakSubjects = new Set();
  const strongSubjects = new Set();

  const subjectScores = {};
  quizzes.forEach((quiz) => {
    if (!subjectScores[quiz.subject]) {
      subjectScores[quiz.subject] = [];
    }
    subjectScores[quiz.subject].push(quiz.score);
  });

  Object.entries(subjectScores).forEach(([subject, scores]) => {
    const avgOutOf10 = scores.reduce((sum, score) => sum + normalizeTo10(score), 0) / scores.length;
    if (avgOutOf10 < 5) {
      weakSubjects.add(subject);
    } else if (avgOutOf10 >= 7.5) {
      strongSubjects.add(subject);
    }
  });

  const now = new Date();
  const suggestionSet = new Set();
  const procrastinationRisks = [];

  tasks.forEach((task) => {
    if (task.studyHours < studyHoursThreshold) {
      suggestionSet.add(`Increase study time for ${task.subject} (${task.topic}).`);
    }

    const hoursUntilDeadline = (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
    if (task.status !== "completed" && hoursUntilDeadline <= 24) {
      const warning = `Procrastination Risk: Complete ${task.subject} - ${task.topic} before deadline.`;
      suggestionSet.add(warning);
      procrastinationRisks.push({
        taskId: task._id,
        subject: task.subject,
        topic: task.topic,
        deadline: task.deadline,
        status: task.status
      });
    }
  });

  weakSubjects.forEach((subject) => {
    suggestionSet.add(`Revise ${subject} today.`);
  });

  if (tasks.length > 0) {
    suggestionSet.add("Study at 8 PM (your most productive time based on consistency).");
  }

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const completionRate = tasks.length === 0 ? 0 : completedTasks / tasks.length;
  const totalStudyHours = tasks.reduce((sum, task) => sum + task.studyHours, 0);

  const dailyHoursMap = Object.fromEntries(getLast7DaysLabels().map((label) => [label, 0]));

  tasks.forEach((task) => {
    const key = new Date(task.createdAt).toISOString().slice(0, 10);
    if (dailyHoursMap[key] !== undefined) {
      dailyHoursMap[key] += task.studyHours;
    }
  });

  const studyHoursByDay = getLast7DaysLabels().map((label) => ({
    date: label,
    hours: roundTo2(dailyHoursMap[label] || 0)
  }));

  const activeDays = studyHoursByDay.filter((d) => d.hours > 0).length;
  const consistencyScore = (activeDays / 7) * 100;
  const productivityScore = roundTo2((completionRate * 60) + ((consistencyScore / 100) * 40));

  const allScoresOutOf10 = quizzes.map((quiz) => normalizeTo10(quiz.score));
  const performanceScore = allScoresOutOf10.length === 0
    ? 0
    : roundTo2(allScoresOutOf10.reduce((sum, value) => sum + value, 0) / allScoresOutOf10.length);
  const performancePercentage = roundTo2(performanceScore * 10);

  return {
    metrics: {
      totalStudyHours: roundTo2(totalStudyHours),
      weakSubjectsCount: weakSubjects.size,
      tasksPending: tasks.length - completedTasks,
      productivityScore,
      performanceScore,
      performancePercentage
    },
    studyHoursByDay,
    subjects: {
      weak: [...weakSubjects],
      strong: [...strongSubjects]
    },
    suggestions: [...suggestionSet],
    procrastinationRisks
  };
};
