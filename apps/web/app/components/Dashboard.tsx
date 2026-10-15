"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ALERT_THRESHOLD, API, COLOR, STATUS, charges, money, urgency, type Subscription } from "../lib";
import Matrix from "./Matrix";
import TrendChart from "./TrendChart";

// Bryntum touches the DOM at import time, so it must skip server rendering.
const Timeline = dynamic(() => import("./Timeline"), { ssr: false, loading: () => <section className="card" style={{ height: 240 }} /> });

const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => (
  <span className="avatar" style={{ width: size, height: size, background: `hsl(${hue(name)} 60% 46%)`, fontSize: size * 0.4 }}>{name[0]}</span>
);

const NAV = [
  ["Home", "#top", "⌂"],
  ["Timeline", "#timeline", "▦"],
  ["Subscriptions", "#matrix", "☰"],
  ["Alerts", "#defender", "◔"],
] as const;

export default function Dashboard() {
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [error, setError] = useState<string>();
  const [selected, setSelected] = useState<string>();
  const [loadedAt, setLoadedAt] = useState<Date>();
  const [days, setDays] = useState(90);
  const [sweep, setSweep] = useState<{ busy?: boolean; msg?: string }>({});

  const load = useCallback(
    () =>
      fetch(`${API}/api/subscriptions`)
        .then((r) => (r.ok ? r.json() : r.json().then((b) => Promise.reject(new Error(b.error ?? r.statusText)))))
        .then((d) => {
          setSubs(d);
          setError(undefined);
          setLoadedAt(new Date());
        })
        .catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (s: Subscription) => {
    if (!confirm(`Cancel ${s.merchant} through PayPal?`)) return;
    const res = await fetch(`${API}/api/subscriptions/${s.id}/cancel`, { method: "POST" });
    if (!res.ok) alert(`Cancel failed: ${(await res.json()).error}`);
    load();
  };

  const runAlerts = async () => {
    setSweep({ busy: true });
    try {
      const res = await fetch(`${API}/api/alerts/run`, { method: "POST" });
      const body = await res.json();
      setSweep({ msg: res.ok ? (body.sent.length ? `Sent ${body.sent.length} alert${body.sent.length > 1 ? "s" : ""} to Zapier.` : "No new alerts. Everything risky was already reported.") : `Failed: ${body.error}` });
    } catch (e) {
      setSweep({ msg: `Failed: ${(e as Error).message}` });
    }
  };

  const live = useMemo(() => subs?.filter((s) => s.status !== "CANCELLED" && s.status !== "EXPIRED") ?? [], [subs]);
  const monthly = live.reduce((t, s) => t + (s.price ?? 0), 0);
  const hikes = live.filter((s) => s.hike);
  const hikeMonthly = hikes.reduce((t, s) => t + (s.hike!.to - s.hike!.from), 0);
  const trials = live.filter((s) => urgency(s) === "red");
  const top = [...live].sort((a, b) => b.predatoryScore - a.predatoryScore)[0];
  const threat = top && top.predatoryScore >= ALERT_THRESHOLD ? top : undefined;
  const focus = live.find((s) => s.id === selected) ?? top;

  const trend = useMemo(() => {
    const start = Date.now();
    let total = 0;
    const pts = [{ t: start, v: 0 }, ...charges(live, days).map((c) => ({ t: c.t, v: (total += c.amount) }))];
    pts.push({ t: start + days * 864e5, v: total });
    return pts;
  }, [live, days]);

  return (
    <div className="shell" id="top">
      <aside className="side">
        <div className="brand">
          <div className="logo" aria-hidden>🛡️</div>
          <b>SubShield</b>
        </div>
        <nav aria-label="Sections">
          {NAV.map(([label, href, icon], i) => (
            <a key={label} href={href} className={i === 0 ? "on" : ""}><span aria-hidden>{icon}</span>{label}</a>
          ))}
        </nav>
        <div className="side-foot">
          <span className="pill">PayPal Sandbox</span>
          <small>Subscriptions are read live from PayPal.</small>
        </div>
      </aside>

      <main className="content">
        <header className="bar">
          <input className="search" placeholder="Search" aria-label="Search" disabled />
          <div className="who">
            {loadedAt && <small>Updated {loadedAt.toLocaleTimeString()}</small>}
            <span className="chip"><Avatar name="Karthikeyan" size={28} />Karthikeyan</span>
          </div>
        </header>

        {error && <p role="alert" className="notice bad">Could not load subscriptions: {error}</p>}
        {!subs && !error && <p className="notice">Loading…</p>}

        {subs && (
          <div className="cols">
            <div className="stack">
              <section className="card hero">
                <div className="label">Total monthly spend</div>
                <div className="big mono">{money(monthly)} <span className={`delta${hikes.length ? " bad" : ""}`}>{hikes.length ? `+${money(hikeMonthly)} from hikes` : "No hikes"}</span></div>
                <div className="actions">
                  <button className="dark" onClick={load}>↻ Scan now</button>
                  <button onClick={runAlerts} disabled={sweep.busy}>{sweep.busy ? "Sending…" : "✉ Send alerts"}</button>
                  {threat?.status === "ACTIVE" && <button className="danger" onClick={() => cancel(threat)}>Cancel {threat.merchant}</button>}
                </div>
                {sweep.msg && <p className="note" role="status">{sweep.msg}</p>}
                {threat?.hike && (
                  <p className="note warn" role="status">
                    ⚠ {threat.merchant} raised your rate by {threat.hike.pct}% ({money(threat.hike.from)} → {money(threat.hike.to)}), {money((threat.hike.to - threat.hike.from) * 12)} more a year. Risk {threat.predatoryScore}/100.
                  </p>
                )}
              </section>

              <div className="mini-row">
                {live.map((s) => (
                  <button key={s.id} className={`mini${s.id === focus?.id ? " on" : ""}`} onClick={() => setSelected(s.id)} aria-pressed={s.id === focus?.id}>
                    <span className="mini-top"><Avatar name={s.merchant} size={26} />{s.merchant}<i className="dot" style={{ background: COLOR[urgency(s)] }} /></span>
                    <span className="mono mini-val">{s.price ? money(s.price) : "—"}</span>
                    <span className="mini-sub">Risk {s.predatoryScore}/100 · {STATUS[s.status]?.label ?? s.status}</span>
                  </button>
                ))}
              </div>
              <section className="promo">
                <h3>Let the agents watch for you</h3>
                <p>Price hikes and ending trials are scored and sent to your phone through Zapier.</p>
                <button className="dark" onClick={runAlerts} disabled={sweep.busy}>Run alert sweep ↗</button>
              </section>
            </div>

            <div className="stack">
              <section className="card pad">
                <div className="row-between">
                  <h2>Spend outlook</h2>
                  <select aria-label="Chart range" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
                <p className="sub">Cumulative charges expected from your subscriptions.</p>
                <TrendChart points={trend} />
              </section>

              <section className="card pad" id="defender">
                <h2>Defender</h2>
                {focus && (
                  <>
                    <div className="people" role="group" aria-label="Choose a subscription">
                      {live.map((s) => (
                        <button key={s.id} className={`person${s.id === focus.id ? " on" : ""}`} onClick={() => setSelected(s.id)}>
                          <Avatar name={s.merchant} size={40} />
                          <small>{s.merchant}</small>
                        </button>
                      ))}
                    </div>
                    <div className="kv"><span>Price</span><b className="mono">{focus.price ? money(focus.price) : "—"}</b></div>
                    <div className="kv"><span>Risk score</span><b className="mono" style={{ color: COLOR[urgency(focus)] }}>{focus.predatoryScore}/100</b></div>
                    <div className="kv"><span>Status</span><b>{STATUS[focus.status]?.label ?? focus.status}</b></div>
                    {focus.status === "ACTIVE" || focus.status === "SUSPENDED" ? (
                      <button className="dark wide" onClick={() => cancel(focus)}>Cancel {focus.merchant}</button>
                    ) : focus.approveUrl ? (
                      <a className="btn dark wide" href={focus.approveUrl} target="_blank" rel="noreferrer">Approve {focus.merchant} on PayPal ↗</a>
                    ) : (
                      <button className="dark wide" disabled>Nothing to do</button>
                    )}
                  </>
                )}
              </section>
            </div>
          </div>
        )}

        {subs && (
          <>
            <div id="timeline"><Timeline subs={subs} selectedId={selected} onSelect={setSelected} /></div>
            <div id="matrix"><Matrix subs={subs} selectedId={selected} onSelect={setSelected} onCancel={cancel} /></div>
          </>
        )}
      </main>
    </div>
  );
}
