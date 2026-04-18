import cors from "cors";
import express from "express";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import intelligenceRoutes from "./routes/intelligenceRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorMiddleware.js";
import { sanitizeMiddleware } from "./middleware/sanitizeMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(sanitizeMiddleware);
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "AI Study Companion Agent API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api", performanceRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
