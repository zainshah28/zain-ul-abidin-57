import express from "express";

import {
  getFocusInsights,
  getOptimizedSchedule,
  getPredictions,
  getDueReviews,
  recordFocusSession,
  reviewTopic
} from "../controllers/intelligenceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/schedule", getOptimizedSchedule);
router.get("/predictions", getPredictions);
router.post("/focus/sessions", recordFocusSession);
router.get("/focus/insights", getFocusInsights);
router.get("/spaced-repetition/due", getDueReviews);
router.post("/spaced-repetition/review", reviewTopic);

export default router;
