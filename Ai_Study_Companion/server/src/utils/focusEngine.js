const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const calculateFocusQuality = ({
  plannedMinutes,
  actualMinutes,
  distractionCount,
  completedPlannedTask,
  selfRating
}) => {
  const planAdherence = plannedMinutes > 0 ? Math.min(actualMinutes / plannedMinutes, 1.2) : 0;
  const adherenceScore = clamp(planAdherence * 50, 0, 50);
  const distractionPenalty = Math.min(distractionCount * 4, 25);
  const completionScore = completedPlannedTask ? 15 : 0;
  const ratingScore = clamp((selfRating / 5) * 10, 0, 10);

  return clamp(adherenceScore - distractionPenalty + completionScore + ratingScore, 0, 100);
};

export const buildFocusInsights = ({ sessions }) => {
  if (!sessions.length) {
    return {
      metrics: {
        averageQuality: 0,
        averageDistractions: 0,
        completionRate: 0
      },
      suggestedBreakMinutes: 5,
      bestHour: 20,
      recommendations: ["Log at least 3 focus sessions to unlock personalized insights."]
    };
  }

  const totalQuality = sessions.reduce((sum, session) => sum + session.qualityScore, 0);
  const averageQuality = Math.round((totalQuality / sessions.length) * 100) / 100;

  const averageDistractions = Math.round(
    (sessions.reduce((sum, session) => sum + session.distractionCount, 0) / sessions.length) * 100
  ) / 100;

  const completionRate = Math.round(
    ((sessions.filter((session) => session.completedPlannedTask).length / sessions.length) * 100) * 100
  ) / 100;

  const byHour = new Map();
  sessions.forEach((session) => {
    const hour = new Date(session.startedAt).getHours();
    if (!byHour.has(hour)) {
      byHour.set(hour, []);
    }
    byHour.get(hour).push(session.qualityScore);
  });

  let bestHour = 20;
  let bestScore = -1;
  for (const [hour, scores] of byHour.entries()) {
    const hourAvg = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    if (hourAvg > bestScore) {
      bestScore = hourAvg;
      bestHour = hour;
    }
  }

  const suggestedBreakMinutes = averageQuality < 55 ? 10 : averageQuality < 75 ? 7 : 5;
  const recommendations = [];

  if (averageDistractions > 4) {
    recommendations.push("High distraction load detected. Try app/site blocking for your next session.");
  }
  if (completionRate < 60) {
    recommendations.push("Break tasks into smaller outcomes to improve completion rate.");
  }
  if (averageQuality >= 80) {
    recommendations.push("Excellent focus consistency. Extend one deep-work block by 15 minutes.");
  }

  if (!recommendations.length) {
    recommendations.push("Maintain current cadence and review focus quality weekly.");
  }

  return {
    metrics: {
      averageQuality,
      averageDistractions,
      completionRate
    },
    suggestedBreakMinutes,
    bestHour,
    recommendations
  };
};
