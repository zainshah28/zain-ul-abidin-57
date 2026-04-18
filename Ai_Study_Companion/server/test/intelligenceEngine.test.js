import test from "node:test";
import assert from "node:assert/strict";

import { buildOptimizedSchedule, buildPredictions } from "../src/utils/intelligenceEngine.js";

const now = new Date("2026-04-18T09:00:00.000Z");

test("buildOptimizedSchedule prioritizes pending tasks", () => {
  const tasks = [
    {
      _id: "t1",
      subject: "Math",
      topic: "Calculus",
      studyHours: 3,
      status: "pending",
      deadline: new Date("2026-04-19T10:00:00.000Z")
    },
    {
      _id: "t2",
      subject: "History",
      topic: "WWII",
      studyHours: 2,
      status: "completed",
      deadline: new Date("2026-04-22T10:00:00.000Z")
    }
  ];

  const quizzes = [{ subject: "Math", score: 45 }];

  const schedule = buildOptimizedSchedule({
    tasks,
    quizzes,
    focusSessions: [],
    weeklyGoalHours: 6,
    days: 3,
    now
  });

  assert.equal(schedule.plan.length, 3);
  assert.equal(schedule.plan[0].blocks[0].subject, "Math");
});

test("buildPredictions includes deadline risks and retention", () => {
  const tasks = [
    {
      _id: "t1",
      subject: "Physics",
      topic: "Kinematics",
      studyHours: 4,
      status: "pending",
      deadline: new Date("2026-04-18T18:00:00.000Z")
    }
  ];

  const predictions = buildPredictions({
    tasks,
    quizzes: [{ subject: "Physics", score: 52 }],
    focusSessions: [{ qualityScore: 70 }],
    memories: [{ dueDate: new Date("2026-04-17T00:00:00.000Z"), recallProbability: 0.62 }],
    now
  });

  assert.ok(predictions.deadlineRisks.length > 0);
  assert.ok(predictions.retentionForecast.expectedRetentionRate > 0);
});
