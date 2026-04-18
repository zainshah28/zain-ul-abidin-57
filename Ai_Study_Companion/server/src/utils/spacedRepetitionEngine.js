const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const calcRecallProbability = ({ intervalDays, elapsedDays, easeFactor }) => {
  if (intervalDays <= 0) {
    return 0;
  }

  const decayFactor = Math.max(0.1, easeFactor / 2.5);
  const retention = Math.exp((-elapsedDays / intervalDays) / decayFactor);
  return clamp(retention, 0, 1);
};

export const applySm2Review = ({ memory, quality, reviewedAt = new Date() }) => {
  const safeQuality = clamp(Math.round(quality), 0, 5);
  const reviewDate = toDate(reviewedAt);

  let repetitions = memory.repetitions || 0;
  let easeFactor = memory.easeFactor || 2.5;
  let intervalDays = memory.intervalDays || 1;

  if (safeQuality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  }

  easeFactor += 0.1 - (5 - safeQuality) * (0.08 + (5 - safeQuality) * 0.02);
  easeFactor = Math.max(1.3, easeFactor);

  const dueDate = new Date(reviewDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const elapsedMs = Math.max(0, reviewDate.getTime() - (memory.lastReviewedAt ? toDate(memory.lastReviewedAt).getTime() : reviewDate.getTime()));
  const elapsedDays = elapsedMs / (24 * 60 * 60 * 1000);

  return {
    repetitions,
    intervalDays,
    easeFactor,
    dueDate,
    recallProbability: calcRecallProbability({ intervalDays, elapsedDays, easeFactor }),
    reviewEvent: {
      quality: safeQuality,
      reviewedAt: reviewDate,
      intervalDays,
      easeFactor
    }
  };
};

export const getDueTopics = ({ memories, now = new Date() }) => {
  const nowDate = toDate(now);
  return memories
    .filter((memory) => toDate(memory.dueDate) <= nowDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};
