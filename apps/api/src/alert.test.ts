import test from "node:test";
import assert from "node:assert/strict";
import { alertPayload, sendAlert, shouldAlert } from "./alert.js";

const entry = { subscriptionId: "I-1", planId: "P-1", merchant: "Streamify" };
const sub: any = { id: "I-1", merchant: "Streamify", predatoryScore: 67, hike: { from: 9.99, to: 14.99, pct: 50 }, trialEndsAt: null };

test("shouldAlert: high score once per price", () => {
  assert.equal(shouldAlert(sub, entry), true);
  assert.equal(shouldAlert(sub, { ...entry, alertedFor: 14.99 } as any), false);
  assert.equal(shouldAlert({ ...sub, predatoryScore: 10 }, entry), false);
  assert.equal(shouldAlert({ ...sub, hike: null }, entry), false);
});

test("alertPayload: message and cancel url", () => {
  const p = alertPayload(sub, "http://api");
  assert.match(p.message, /raised your rate by 50% \(\$9\.99 -> \$14\.99\)/);
  assert.equal(p.cancelUrl, "http://api/api/subscriptions/I-1/cancel");
});

test("sendAlert: throws on non-2xx", async () => {
  await assert.rejects(sendAlert("http://z", {}, (async () => new Response("no", { status: 500 })) as any), /500/);
  await sendAlert("http://z", {}, (async () => new Response("ok")) as any);
});
