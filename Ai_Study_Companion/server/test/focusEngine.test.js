import test from "node:test";
import assert from "node:assert/strict";

import { buildFocusInsights, calculateFocusQuality } from "../src/utils/focusEngine.js";

test("calculateFocusQuality rewards adherence and completion", () => {
  const score = calculateFocusQuality({
    plannedMinutes: 50,
    actualMinutes: 50,
    distractionCount: 1,
    completedPlannedTask: true,
    selfRating: 4
  });

  assert.ok(score >= 65);
});

test("buildFocusInsights returns recommendations", () => {
  const insights = buildFocusInsights({
    sessions: [
      {
        qualityScore: 58,
        distractionCount: 5,
        completedPlannedTask: false,
        startedAt: new Date("2026-04-18T21:00:00.000Z")
      }
    ]
  });

  assert.ok(insights.recommendations.length > 0);
  assert.equal(typeof insights.bestHour, "number");
});
