import Quiz from "../models/Quiz.js";
import Task from "../models/Task.js";
import { buildAnalysis } from "../utils/aiEngine.js";

export const addQuizScore = async (req, res, next) => {
  try {
    const { subject, score, assessmentType = "quiz" } = req.body;

    if (!subject || score === undefined) {
      return res.status(400).json({ message: "subject and score are required." });
    }

    const numericScore = Number(score);
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      return res.status(400).json({ message: "score must be between 0 and 10." });
    }

    if (!["quiz", "assignment"].includes(assessmentType)) {
      return res.status(400).json({ message: "assessmentType must be quiz or assignment." });
    }

    const quiz = await Quiz.create({
      userId: req.user.id,
      subject: subject.trim(),
      assessmentType,
      score: numericScore
    });

    return res.status(201).json(quiz);
  } catch (error) {
    return next(error);
  }
};

export const getQuizHistory = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const normalized = quizzes.map((item) => ({
      ...item.toObject(),
      score: item.score > 10 ? item.score / 10 : item.score,
      assessmentType: item.assessmentType || "quiz"
    }));
    return res.json(normalized);
  } catch (error) {
    return next(error);
  }
};

export const deleteQuizScore = async (req, res, next) => {
  try {
    const record = await Quiz.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) {
      return res.status(404).json({ message: "Score record not found." });
    }
    return res.json({ message: "Score deleted." });
  } catch (error) {
    return next(error);
  }
};

export const getAnalysis = async (req, res, next) => {
  try {
    const [tasks, quizzes] = await Promise.all([
      Task.find({ userId: req.user.id }).sort({ createdAt: -1 }),
      Quiz.find({ userId: req.user.id }).sort({ createdAt: -1 })
    ]);

    const studyHoursThreshold = Number(process.env.STUDY_HOURS_THRESHOLD || 2);
    const analysis = buildAnalysis({ tasks, quizzes, studyHoursThreshold });

    return res.json(analysis);
  } catch (error) {
    return next(error);
  }
};
