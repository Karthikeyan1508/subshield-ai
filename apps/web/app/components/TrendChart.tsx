"use client";
import { useId, useState } from "react";
import { money } from "../lib";

export type Point = { t: number; v: number };

const W = 320, H = 150, PAD = 14;

// Smooth stepped curve: horizontal tangents at every point, so it never overshoots.
function curve(xy: number[][]) {
  return xy.reduce((d, [x, y], i) => {
    if (!i) return `M${x},${y}`;
    const [px, py] = xy[i - 1];
    const mx = (px + x) / 2;
    return `${d} C${mx},${py} ${mx},${y} ${x},${y}`;
  }, "");
}

export default function TrendChart({ points }: { points: Point[] }) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number>();
  if (points.length < 2) return <p className="empty">No upcoming charges.</p>;

  const t0 = points[0].t, t1 = points[points.length - 1].t;
  const max = Math.max(...points.map((p) => p.v), 1);
  const xy = points.map((p) => [PAD + ((p.t - t0) / (t1 - t0 || 1)) * (W - 2 * PAD), H - 24 - (p.v / max) * (H - 54)]);
  const line = curve(xy);
  const area = `${line} L${xy[xy.length - 1][0]},${H - 24} L${xy[0][0]},${H - 24} Z`;
  const h = hover === undefined ? undefined : points[hover];
  const fmt = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const ticks = [0, 1 / 3, 2 / 3, 1].map((f) => t0 + f * (t1 - t0));

  const move = (e: React.MouseEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    setHover(xy.reduce((best, [px], i) => (Math.abs(px - x) < Math.abs(xy[best][0] - x) ? i : best), 0));
  };

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative projected spend">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fe870" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d6f56b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={gid + "s"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2f8a1f" />
            <stop offset="60%" stopColor="#5fd05a" />
            <stop offset="100%" stopColor="#b6e82a" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={`url(#${gid}s)`} strokeWidth="3" strokeLinecap="round" />
        {ticks.map((t, i) => (
          <text key={i} x={PAD + (i / 3) * (W - 2 * PAD)} y={H - 4} textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} className="tick">{fmt(t)}</text>
        ))}
        {hover !== undefined && (
          <>
            <line x1={xy[hover][0]} x2={xy[hover][0]} y1={10} y2={H - 24} stroke="#163300" strokeOpacity="0.3" strokeDasharray="3 3" />
            <circle cx={xy[hover][0]} cy={xy[hover][1]} r="4.5" fill="#163300" stroke="#fff" strokeWidth="2" />
          </>
        )}
        <rect x="0" y="0" width={W} height={H} fill="transparent" onMouseMove={move} onMouseLeave={() => setHover(undefined)} />
      </svg>
      {h && hover !== undefined && (
        <div className="chart-tip" style={{ left: `${(xy[hover][0] / W) * 100}%` }}>
          <span>{fmt(h.t)}</span>
          <b className="mono">{money(h.v)}</b>
        </div>
      )}
    </div>
  );
}
