import express from "express";

import {
	addQuizScore,
	deleteQuizScore,
	getAnalysis,
	getQuizHistory
} from "../controllers/performanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/quiz", addQuizScore);
router.get("/quiz", getQuizHistory);
router.delete("/quiz/:id", deleteQuizScore);
router.get("/analysis", getAnalysis);

export default router;
