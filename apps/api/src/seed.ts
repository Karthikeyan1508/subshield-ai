import "./env.js";
import { call } from "./paypal.js";
import { readLedger, writeLedger, type LedgerEntry } from "./ledger.js";

const price = (value: string) => ({ fixed_price: { value, currency_code: "USD" } });
const month = { interval_unit: "MONTH", interval_count: 1 };

const MERCHANTS = [
  { name: "Streamify", price: "9.99", trialDays: 0 },
  { name: "CloudNotes", price: "4.99", trialDays: 0 },
  { name: "FitPass", price: "14.99", trialDays: 2 }, // short trial -> "expiring in <48h" demo case
];

if ((await readLedger()).length) {
  console.log("ledger.json already has subscriptions; delete apps/api/data/ledger.json to reseed");
  process.exit(0);
}

const entries: LedgerEntry[] = [];
for (const m of MERCHANTS) {
  const product = await call("create_product", { name: m.name, type: "SERVICE", description: `${m.name} demo subscription` });
  const regular = { frequency: month, tenure_type: "REGULAR", sequence: m.trialDays ? 2 : 1, total_cycles: 0, pricing_scheme: price(m.price) };
  const trial = { frequency: { interval_unit: "DAY", interval_count: m.trialDays }, tenure_type: "TRIAL", sequence: 1, total_cycles: 1, pricing_scheme: price("0") };
  const plan = await call("create_subscription_plan", {
    product_id: product.id,
    name: `${m.name} Monthly`,
    billing_cycles: m.trialDays ? [trial, regular] : [regular],
    payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 3 },
  });
  const sub = await call("create_subscription", {
    plan_id: plan.id,
    subscriber: { name: { given_name: "Demo", surname: "Buyer" }, email_address: "demo-buyer@example.com" },
    application_context: { return_url: "http://localhost:3000", cancel_url: "http://localhost:3000", user_action: "SUBSCRIBE_NOW" },
  });
  const approveUrl = sub.links?.find((l: any) => l.rel === "approve")?.href;
  entries.push({ subscriptionId: sub.id, planId: plan.id, merchant: m.name, approveUrl });
  console.log(`${m.name}: ${sub.id} (${sub.status})\n  approve: ${approveUrl}`);
}
await writeLedger(entries);
console.log("saved apps/api/data/ledger.json");
