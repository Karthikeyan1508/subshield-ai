import test from "node:test";
import assert from "node:assert/strict";
import { normalize } from "./ledger.js";

const entry = { subscriptionId: "I-1", planId: "P-1", merchant: "FitPass", approveUrl: "http://x" };
const plan = {
  billing_cycles: [
    { tenure_type: "TRIAL", frequency: { interval_unit: "DAY", interval_count: 2 }, total_cycles: 1 },
    { tenure_type: "REGULAR", frequency: { interval_unit: "MONTH", interval_count: 1 }, pricing_scheme: { fixed_price: { value: "14.99", currency_code: "USD" } } },
  ],
};

test("normalize: trial + price + approve link while pending", () => {
  const s = normalize(entry, { status: "APPROVAL_PENDING", start_time: "2026-10-15T00:00:00Z" }, plan);
  assert.equal(s.price, 14.99);
  assert.equal(s.interval, "1 MONTH");
  assert.equal(s.trialEndsAt, "2026-10-17T00:00:00.000Z");
  assert.equal(s.approveUrl, "http://x");
});

test("normalize: no trial, active hides approve link", () => {
  const s = normalize(entry, { status: "ACTIVE" }, { billing_cycles: [plan.billing_cycles[1]] });
  assert.equal(s.trialEndsAt, null);
  assert.equal(s.approveUrl, null);
});
