import Task from "../models/Task.js";

export const createTask = async (req, res, next) => {
  try {
    const { subject, topic, studyHours, deadline, status } = req.body;

    if (!subject || !topic || studyHours === undefined || !deadline) {
      return res.status(400).json({ message: "subject, topic, studyHours, and deadline are required." });
    }

    const task = await Task.create({
      userId: req.user.id,
      subject,
      topic,
      studyHours,
      deadline,
      status: status || "pending"
    });

    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ deadline: 1 });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const updates = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.json(task);
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.json({ message: "Task deleted." });
  } catch (error) {
    return next(error);
  }
};
