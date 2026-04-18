import test from "node:test";
import assert from "node:assert/strict";

import { applySm2Review } from "../src/utils/spacedRepetitionEngine.js";

test("SM-2 increases interval on good recall", () => {
  const memory = {
    repetitions: 2,
    intervalDays: 6,
    easeFactor: 2.5,
    lastReviewedAt: new Date("2026-04-10T09:00:00.000Z")
  };

  const result = applySm2Review({
    memory,
    quality: 5,
    reviewedAt: new Date("2026-04-12T09:00:00.000Z")
  });

  assert.equal(result.repetitions, 3);
  assert.ok(result.intervalDays >= 15);
  assert.ok(result.easeFactor >= 2.5);
});

test("SM-2 resets interval on low recall", () => {
  const memory = {
    repetitions: 4,
    intervalDays: 21,
    easeFactor: 2.4,
    lastReviewedAt: new Date("2026-04-10T09:00:00.000Z")
  };

  const result = applySm2Review({ memory, quality: 2 });

  assert.equal(result.repetitions, 0);
  assert.equal(result.intervalDays, 1);
  assert.ok(result.easeFactor >= 1.3);
});
