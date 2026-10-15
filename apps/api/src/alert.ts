import type { LedgerEntry, Subscription } from "./ledger.js";

// shortcut: fixed threshold, make it per-user config when there are users.
export const ALERT_THRESHOLD = 50;

// Alert once per price: the score stays high until the price changes again.
export function shouldAlert(sub: Subscription, entry: LedgerEntry): boolean {
  return sub.predatoryScore >= ALERT_THRESHOLD && !!sub.hike && entry.alertedFor !== sub.hike.to;
}

export function alertPayload(sub: Subscription, apiBase: string) {
  const h = sub.hike;
  const hike = h ? `${sub.merchant} raised your rate by ${h.pct}% ($${h.from.toFixed(2)} -> $${h.to.toFixed(2)}).` : `${sub.merchant} needs a look.`;
  const trial = sub.trialEndsAt ? ` Trial ends ${new Date(sub.trialEndsAt).toUTCString()}.` : "";
  return {
    subscriptionId: sub.id,
    merchant: sub.merchant,
    predatoryScore: sub.predatoryScore,
    message: `SubShield alert: ${hike}${trial}`,
    cancelUrl: `${apiBase}/api/subscriptions/${sub.id}/cancel`,
  };
}

export async function sendAlert(webhookUrl: string, payload: object, post: typeof fetch = fetch) {
  const res = await post(webhookUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`zapier webhook ${res.status}`);
}
