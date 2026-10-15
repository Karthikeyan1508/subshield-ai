export type Hike = { from: number; to: number; pct: number };

// Latest price vs the one before it; null unless it went up.
export function detectHike(prices: number[]): Hike | null {
  const to = prices.at(-1);
  const from = prices.at(-2);
  if (to === undefined || from === undefined || to <= from) return null;
  return { from, to, pct: Math.round(((to - from) / from) * 100) };
}

// 0-100. Hike up to 50 pts (1 pt per %), trial ending within 48h up to 35 pts.
// shortcut: ToS dark-pattern clauses (Elastic, up to 15 pts) not wired yet, add in the Detective step.
export function predatoryScore(hikePct: number, trialHoursLeft: number | null): number {
  const hike = Math.min(50, Math.max(0, hikePct));
  const trial = trialHoursLeft !== null && trialHoursLeft >= 0 && trialHoursLeft < 48 ? 35 * (1 - trialHoursLeft / 48) : 0;
  return Math.round(Math.min(100, hike + trial));
}
