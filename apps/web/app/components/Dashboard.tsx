"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ALERT_THRESHOLD, API, COLOR, STATUS, avatarBg, charges, money, urgency, type Subscription } from "../lib";
import Matrix from "./Matrix";
import TrendChart from "./TrendChart";

// Bryntum touches the DOM at import time, so it must skip server rendering.
const Timeline = dynamic(() => import("./Timeline"), { ssr: false, loading: () => <section className="card" style={{ height: 240 }} /> });

const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => (
  <span className="avatar" style={{ width: size, height: size, background: avatarBg(name), fontSize: size * 0.5 }}>{name[0]}</span>
);

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
    <div className="page" id="top">
      <header className="nav glass">
        <b className="wordmark">SubShield</b>
        <nav aria-label="Sections">
          <a href="#timeline">Timeline</a>
          <a href="#outlook">Outlook</a>
          <a href="#matrix">Subscriptions</a>
        </nav>
        <span className="pill">PayPal sandbox</span>
      </header>

      <section className="intro">
        <div>
          <h1>Subscriptions</h1>
          <p>Three agents watch your PayPal subscriptions{loadedAt ? ` · updated ${loadedAt.toLocaleTimeString()}` : ""}</p>
        </div>
        <div className="actions">
          <button className="primary" onClick={load}>Scan now</button>
          <button onClick={runAlerts} disabled={sweep.busy}>{sweep.busy ? "Sending…" : "Send alerts"}</button>
        </div>
      </section>

      {sweep.msg && <p className="notice glass" role="status">{sweep.msg}</p>}
      {error && <p role="alert" className="notice glass bad">Could not load subscriptions: {error}</p>}
      {!subs && !error && <p className="notice glass">Loading…</p>}

      {subs && (
        <>
          {threat?.hike && (
            <div className="alert glass" role="status">
              <div>
                <b>{threat.merchant} raised your rate by {threat.hike.pct}%</b>
                <span>{money(threat.hike.from)} → {money(threat.hike.to)} a month, {money((threat.hike.to - threat.hike.from) * 12)} more a year. Risk {threat.predatoryScore}/100.</span>
              </div>
              {threat.status === "ACTIVE" && <button className="danger" onClick={() => cancel(threat)}>Cancel {threat.merchant}</button>}
            </div>
          )}

          <div className="tiles">
            <div className="tile glass"><span>Monthly spend</span><b>{money(monthly)}</b><small>{live.length} subscriptions</small></div>
            <div className="tile glass"><span>Price hikes</span><b className={hikes.length ? "bad" : ""}>{hikes.length}</b><small>{hikes.length ? `+${money(hikeMonthly)} a month` : "None detected"}</small></div>
            <div className="tile glass"><span>Trials ending</span><b className={trials.length ? "bad" : ""}>{trials.length}</b><small>Within 48 hours</small></div>
            <div className="tile glass"><span>Highest risk</span><b>{top?.predatoryScore ?? 0}<i>/100</i></b><small>{top?.merchant ?? "—"}</small></div>
          </div>

          <div id="timeline"><Timeline subs={subs} selectedId={selected} onSelect={setSelected} /></div>

          <div className="two" id="outlook">
            <section className="card glass pad">
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

            <section className="card glass pad" id="defender">
              <h2>Defender</h2>
              {focus && (
                <>
                  <div className="people" role="group" aria-label="Choose a subscription">
                    {live.map((s) => (
                      <button key={s.id} className={`person${s.id === focus.id ? " on" : ""}`} onClick={() => setSelected(s.id)}>
                        <Avatar name={s.merchant} size={34} />
                        {s.merchant}
                      </button>
                    ))}
                  </div>
                  <div className="kv"><span>Price</span><b>{focus.price ? money(focus.price) : "—"}</b></div>
                  <div className="kv"><span>Status</span><b>{STATUS[focus.status]?.label ?? focus.status}</b></div>
                  <div className="kv"><span>Price change</span><b>{focus.hike ? `+${focus.hike.pct}%` : "None"}</b></div>
                  <div className="kv"><span>Risk score</span><b style={{ color: COLOR[urgency(focus)] }}>{focus.predatoryScore} / 100</b></div>
                  {focus.status === "ACTIVE" || focus.status === "SUSPENDED" ? (
                    <button className="primary wide" onClick={() => cancel(focus)}>Cancel {focus.merchant}</button>
                  ) : focus.approveUrl ? (
                    <a className="btn primary wide" href={focus.approveUrl} target="_blank" rel="noreferrer">Approve on PayPal</a>
                  ) : (
                    <button className="primary wide" disabled>Nothing to do</button>
                  )}
                </>
              )}
            </section>
          </div>

          <div id="matrix"><Matrix subs={subs} selectedId={selected} onSelect={setSelected} onCancel={cancel} /></div>
        </>
      )}
    </div>
  );
}
