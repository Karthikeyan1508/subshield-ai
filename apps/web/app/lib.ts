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

// Mirrors the API's alert threshold.
export const ALERT_THRESHOLD = 50;

export type Urgency = "red" | "yellow" | "green";

// Red: trial ends in <48h. Yellow: price went up. Green: nothing to worry about.
export function urgency(s: Subscription, now = Date.now()): Urgency {
  const left = s.trialEndsAt ? Date.parse(s.trialEndsAt) - now : null;
  if (left !== null && left >= 0 && left < 48 * 36e5) return "red";
  return s.hike ? "yellow" : "green";
}

export const COLOR = { red: "#d63a3a", yellow: "#f59e0b", green: "#2f8a1f" } as const;

// Flat avatar colour from a name.
export const avatarBg = (name: string) => `hsl(${[...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7)} 45% 46%)`;

export const money = (n: number) => `$${n.toFixed(2)}`;

export const STATUS: Record<string, { label: string; tone: "ok" | "warn" | "off" }> = {
  ACTIVE: { label: "Active", tone: "ok" },
  APPROVAL_PENDING: { label: "Awaiting approval", tone: "warn" },
  SUSPENDED: { label: "Suspended", tone: "warn" },
  CANCELLED: { label: "Cancelled", tone: "off" },
  EXPIRED: { label: "Expired", tone: "off" },
};

// "1 MONTH" -> 1; any other interval is not projected.
export function monthStep(interval: string | null) {
  const m = interval?.match(/^(\d+) MONTH$/);
  return m ? Number(m[1]) : null;
}

// Every charge expected within `days` from today, oldest first.
export function charges(subs: Subscription[], days: number) {
  const end = Date.now() + days * 864e5;
  const out: { t: number; amount: number; merchant: string }[] = [];
  for (const s of subs) {
    if (!s.nextBillingTime || !s.price) continue;
    const step = monthStep(s.interval);
    for (let i = 0; i < (step ? 12 : 1); i++) {
      const d = new Date(s.nextBillingTime);
      if (step) d.setMonth(d.getMonth() + i * step);
      if (d.getTime() > end) break;
      out.push({ t: d.getTime(), amount: s.price, merchant: s.merchant });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}
