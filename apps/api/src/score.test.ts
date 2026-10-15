import test from "node:test";
import assert from "node:assert/strict";
import { detectHike, predatoryScore } from "./score.js";

test("detectHike: 9.99 -> 14.99 is +50%", () => {
  assert.deepEqual(detectHike([9.99, 14.99]), { from: 9.99, to: 14.99, pct: 50 });
});

test("detectHike: none for single price, same price, or a drop", () => {
  assert.equal(detectHike([9.99]), null);
  assert.equal(detectHike([9.99, 9.99]), null);
  assert.equal(detectHike([14.99, 9.99]), null);
});

test("predatoryScore: hike only, hike + trial in 24h, capped, no signals", () => {
  assert.equal(predatoryScore(50, null), 50);
  assert.equal(predatoryScore(50, 24), 68);
  assert.equal(predatoryScore(500, 0), 85);
  assert.equal(predatoryScore(0, 72), 0);
});
