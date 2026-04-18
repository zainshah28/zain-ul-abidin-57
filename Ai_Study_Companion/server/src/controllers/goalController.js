import Goal from "../models/Goal.js";

export const setWeeklyGoal = async (req, res, next) => {
  try {
    const { targetHours } = req.body;

    if (!targetHours || targetHours <= 0) {
      return res.status(400).json({ message: "targetHours must be greater than 0." });
    }

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    let goal = await Goal.findOne({
      userId: req.user.id,
      weekStartDate: {
        $gte: weekStart,
        $lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    if (goal) {
      goal.targetHours = targetHours;
      await goal.save();
    } else {
      goal = await Goal.create({
        userId: req.user.id,
        weekStartDate: weekStart,
        targetHours
      });
    }

    return res.json(goal);
  } catch (error) {
    return next(error);
  }
};

export const getWeeklyGoal = async (req, res, next) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const goal = await Goal.findOne({
      userId: req.user.id,
      weekStartDate: {
        $gte: weekStart,
        $lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.json(goal || { targetHours: 0, actualHours: 0 });
  } catch (error) {
    return next(error);
  }
};
