import Goal from "../models/Goal.js";
import Quiz from "../models/Quiz.js";
import Task from "../models/Task.js";
import FocusSession from "../models/FocusSession.js";
import TopicMemory from "../models/TopicMemory.js";
import { calculateFocusQuality, buildFocusInsights } from "../utils/focusEngine.js";
import { buildOptimizedSchedule, buildPredictions } from "../utils/intelligenceEngine.js";
import { applySm2Review, getDueTopics } from "../utils/spacedRepetitionEngine.js";

const getCurrentWeekBounds = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { weekStart, weekEnd };
};

export const getOptimizedSchedule = async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days || 7), 14);

    const { weekStart, weekEnd } = getCurrentWeekBounds();
    const goal = await Goal.findOne({
      userId: req.user.id,
      weekStartDate: { $gte: weekStart, $lt: weekEnd }
    });

    const [tasks, quizzes, focusSessions] = await Promise.all([
      Task.find({ userId: req.user.id }).sort({ deadline: 1 }).lean(),
      Quiz.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean(),
      FocusSession.find({ userId: req.user.id }).sort({ startedAt: -1 }).limit(50).lean()
    ]);

    const schedule = buildOptimizedSchedule({
      tasks,
      quizzes,
      focusSessions,
      weeklyGoalHours: goal?.targetHours || 14,
      days
    });

    return res.json(schedule);
  } catch (error) {
    return next(error);
  }
};

export const getPredictions = async (req, res, next) => {
  try {
    const [tasks, quizzes, focusSessions, memories] = await Promise.all([
      Task.find({ userId: req.user.id }).sort({ deadline: 1 }).lean(),
      Quiz.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean(),
      FocusSession.find({ userId: req.user.id }).sort({ startedAt: -1 }).limit(80).lean(),
      TopicMemory.find({ userId: req.user.id }).sort({ dueDate: 1 }).lean()
    ]);

    const predictions = buildPredictions({
      tasks,
      quizzes,
      focusSessions,
      memories
    });

    return res.json(predictions);
  } catch (error) {
    return next(error);
  }
};

export const recordFocusSession = async (req, res, next) => {
  try {
    const {
      subject,
      topic,
      startedAt,
      endedAt,
      plannedMinutes,
      actualMinutes,
      distractionCount = 0,
      completedPlannedTask = false,
      selfRating = 3
    } = req.body;

    if (!endedAt || !plannedMinutes || !actualMinutes) {
      return res.status(400).json({ message: "endedAt, plannedMinutes, and actualMinutes are required." });
    }

    const qualityScore = calculateFocusQuality({
      plannedMinutes,
      actualMinutes,
      distractionCount,
      completedPlannedTask,
      selfRating
    });

    const session = await FocusSession.create({
      userId: req.user.id,
      subject: subject || "General",
      topic: topic || "",
      startedAt: startedAt || new Date(Date.now() - actualMinutes * 60 * 1000),
      endedAt,
      plannedMinutes,
      actualMinutes,
      distractionCount,
      completedPlannedTask,
      selfRating,
      qualityScore
    });

    return res.status(201).json(session);
  } catch (error) {
    return next(error);
  }
};

export const getFocusInsights = async (req, res, next) => {
  try {
    const sessions = await FocusSession.find({ userId: req.user.id }).sort({ startedAt: -1 }).limit(80).lean();
    const insights = buildFocusInsights({ sessions });
    return res.json(insights);
  } catch (error) {
    return next(error);
  }
};

export const reviewTopic = async (req, res, next) => {
  try {
    const { subject, topic, quality } = req.body;

    if (!subject || !topic || quality === undefined) {
      return res.status(400).json({ message: "subject, topic, and quality are required." });
    }

    const parsedQuality = Number(quality);
    if (Number.isNaN(parsedQuality) || parsedQuality < 0 || parsedQuality > 5) {
      return res.status(400).json({ message: "quality must be a number from 0 to 5." });
    }

    let memory = await TopicMemory.findOne({ userId: req.user.id, subject, topic });
    if (!memory) {
      memory = await TopicMemory.create({
        userId: req.user.id,
        subject,
        topic
      });
    }

    const review = applySm2Review({ memory, quality: parsedQuality });

    memory.repetitions = review.repetitions;
    memory.intervalDays = review.intervalDays;
    memory.easeFactor = review.easeFactor;
    memory.dueDate = review.dueDate;
    memory.lastReviewedAt = review.reviewEvent.reviewedAt;
    memory.recallProbability = review.recallProbability;
    memory.reviewHistory.push(review.reviewEvent);

    await memory.save();

    return res.json(memory);
  } catch (error) {
    return next(error);
  }
};

export const getDueReviews = async (req, res, next) => {
  try {
    const memories = await TopicMemory.find({ userId: req.user.id }).sort({ dueDate: 1 }).lean();
    const due = getDueTopics({ memories });

    return res.json({
      dueCount: due.length,
      items: due
    });
  } catch (error) {
    return next(error);
  }
};
