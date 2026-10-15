import { readFile, writeFile, mkdir } from "node:fs/promises";
import { call } from "./paypal.js";

const FILE = new URL("../data/ledger.json", import.meta.url);

// PayPal has no "list subscriptions" API, so we remember the ids we created.
// shortcut: local JSON file, swap for a DB when users link real accounts.
export type LedgerEntry = { subscriptionId: string; planId: string; merchant: string; approveUrl?: string };

export async function readLedger(): Promise<LedgerEntry[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8"));
  } catch (e: any) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

export async function writeLedger(entries: LedgerEntry[]) {
  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  await writeFile(FILE, JSON.stringify(entries, null, 2));
}

export type Subscription = {
  id: string;
  merchant: string;
  status: string;
  price: number | null;
  currency: string | null;
  interval: string | null;
  nextBillingTime: string | null;
  trialEndsAt: string | null;
  approveUrl: string | null;
};

// sub = PayPal subscription details, plan = PayPal plan details.
export function normalize(entry: LedgerEntry, sub: any, plan: any): Subscription {
  const cycles: any[] = plan?.billing_cycles ?? [];
  const regular = cycles.find((c) => c.tenure_type === "REGULAR");
  const trial = cycles.find((c) => c.tenure_type === "TRIAL");
  const fixed = regular?.pricing_scheme?.fixed_price;
  const start = sub.start_time ? Date.parse(sub.start_time) : NaN;
  const days =
    trial?.frequency?.interval_unit === "DAY" ? trial.frequency.interval_count * (trial.total_cycles ?? 1) : null;
  return {
    id: entry.subscriptionId,
    merchant: entry.merchant,
    status: sub.status,
    price: fixed ? Number(fixed.value) : null,
    currency: fixed?.currency_code ?? null,
    interval: regular ? `${regular.frequency.interval_count} ${regular.frequency.interval_unit}` : null,
    nextBillingTime: sub.billing_info?.next_billing_time ?? null,
    trialEndsAt: days !== null && !Number.isNaN(start) ? new Date(start + days * 864e5).toISOString() : null,
    approveUrl: sub.status === "APPROVAL_PENDING" ? (entry.approveUrl ?? null) : null,
  };
}

export async function loadSubscriptions(): Promise<Subscription[]> {
  const entries = await readLedger();
  const plans = new Map<string, Promise<any>>();
  return Promise.all(
    entries.map(async (e) => {
      if (!plans.has(e.planId)) plans.set(e.planId, call("show_subscription_plan_details", { plan_id: e.planId }));
      const [sub, plan] = await Promise.all([
        call("show_subscription_details", { subscription_id: e.subscriptionId }),
        plans.get(e.planId),
      ]);
      return normalize(e, sub, plan);
    }),
  );
}
