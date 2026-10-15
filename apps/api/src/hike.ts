// Demo helper: raise a seeded merchant's plan price on PayPal. Usage: npm run hike -w api -- FitPass 19.99
import "./env.js";
import { call, rest } from "./paypal.js";
import { readLedger } from "./ledger.js";

const [merchant, value] = process.argv.slice(2);
if (!merchant || !Number.isFinite(Number(value))) throw new Error("usage: hike <merchant> <new price>");

const entry = (await readLedger()).find((e) => e.merchant.toLowerCase() === merchant.toLowerCase());
if (!entry) throw new Error(`no ledger entry for ${merchant}`);

const plan = await call("show_subscription_plan_details", { plan_id: entry.planId });
const regular = plan.billing_cycles.find((c: any) => c.tenure_type === "REGULAR");
await rest("POST", `/v1/billing/plans/${entry.planId}/update-pricing-schemes`, {
  pricing_schemes: [
    {
      billing_cycle_sequence: regular.sequence,
      pricing_scheme: { fixed_price: { value: Number(value).toFixed(2), currency_code: regular.pricing_scheme.fixed_price.currency_code } },
    },
  ],
});
console.log(`${entry.merchant}: ${regular.pricing_scheme.fixed_price.value} -> ${Number(value).toFixed(2)}`);
