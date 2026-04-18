import express from "express";

import { getWeeklyGoal, setWeeklyGoal } from "../controllers/goalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", setWeeklyGoal);
router.get("/", getWeeklyGoal);

export default router;
