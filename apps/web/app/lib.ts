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
  priceHistory: { at: string; price: number }[];
  hike: { from: number; to: number; pct: number } | null;
  predatoryScore: number;
};

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Urgency = "red" | "yellow" | "green";

// Red: trial ends in <48h. Yellow: price went up. Green: nothing to worry about.
export function urgency(s: Subscription, now = Date.now()): Urgency {
  const left = s.trialEndsAt ? Date.parse(s.trialEndsAt) - now : null;
  if (left !== null && left >= 0 && left < 48 * 36e5) return "red";
  return s.hike ? "yellow" : "green";
}
