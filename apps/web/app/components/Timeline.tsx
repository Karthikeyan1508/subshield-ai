"use client";
import "@bryntum/scheduler/scheduler.css";
import "@bryntum/scheduler/svalbard-light.css";
import { BryntumScheduler } from "@bryntum/scheduler-react";
import { useMemo, useState } from "react";
import { COLOR, STATUS, avatarBg, money, monthStep, urgency, type Subscription } from "../lib";

const DAY = 864e5;
const RANGES = {
  "2 weeks": { days: 14, preset: "dayAndWeek" },
  "30 days": { days: 30, preset: "dayAndWeek" },
  "90 days": { days: 90, preset: "weekAndMonth" },
} as const;
type Range = keyof typeof RANGES;

const EVENT_COLOR = { red: "red", yellow: "orange", green: "lime" } as const;
const day = (iso: string | Date) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export default function Timeline({
  subs,
  selectedId,
  onSelect,
}: {
  subs: Subscription[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [range, setRange] = useState<Range>("30 days");
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

  const { resources, events } = useMemo(() => {
    const now = Date.now();
    const dated = subs.filter((s) => s.nextBillingTime);
    const resources = dated.map((s) => ({ id: s.id, name: s.merchant, merchant: s.merchant }));
    const events = dated.flatMap((s) => {
      const level = urgency(s, now);
      const first = new Date(s.nextBillingTime!);
      const step = monthStep(s.interval);
      const sel = s.id === selectedId ? " sel" : "";
      const out: Record<string, unknown>[] = [];

      if (s.trialEndsAt && Date.parse(s.trialEndsAt) > now)
        out.push({
          id: `${s.id}:trial`,
          resourceId: s.id,
          name: "Free trial",
          startDate: new Date(now),
          endDate: new Date(s.trialEndsAt),
          eventColor: EVENT_COLOR[level],
          eventStyle: "dashed",
          cls: `trial${sel}`,
          tip: `<b>${s.merchant} free trial</b><br>Ends ${day(s.trialEndsAt)}. It then bills ${s.price ? money(s.price) : "the full price"}.`,
        });

      for (let i = 0; i < (step ? 3 : 1); i++) {
        const start = new Date(first);
        if (step) start.setMonth(start.getMonth() + i * step);
        out.push({
          id: `${s.id}:r${i}`,
          resourceId: s.id,
          name: s.price ? money(s.price) : "Renewal",
          startDate: start,
          endDate: new Date(start.getTime() + DAY),
          eventColor: i === 0 ? EVENT_COLOR[level] : s.hike ? "orange" : "lime",
          cls: `renewal${i ? " projected" : ""}${sel}`,
          tip:
            `<b>${s.merchant}${i ? " (projected)" : ""}</b><br>${day(start)} · ${s.price ? money(s.price) : "—"}<br>` +
            `Status: ${STATUS[s.status]?.label ?? s.status}` +
            (s.hike ? `<br><span style="color:${COLOR.red}">Price up ${s.hike.pct}% (${money(s.hike.from)} → ${money(s.hike.to)})</span>` : "") +
            `<br>Risk score: ${s.predatoryScore}/100`,
        });
      }
      return out;
    });
    return { resources, events };
  }, [subs, selectedId]);

  const { days, preset } = RANGES[range];

  return (
    <section className="card glass">
      <div className="card-head">
        <div>
          <h2>Renewal timeline</h2>
          <p>Every charge and trial deadline, colour coded by urgency. Hover for details, click to select.</p>
        </div>
        <div className="seg" role="group" aria-label="Timeline range">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button key={r} className={r === range ? "on" : ""} aria-pressed={r === range} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>
      <BryntumScheduler
        autoHeight
        readOnly
        startDate={new Date(today.getTime() - 2 * DAY)}
        endDate={new Date(today.getTime() + days * DAY)}
        viewPreset={preset}
        rowHeight={58}
        barMargin={10}
        eventStyle="rounded"
        columns={[
          {
            text: "Merchant",
            field: "name",
            width: 170,
            htmlEncode: false,
            renderer: ({ record }: { record: { get(k: string): unknown } }) => {
              const name = String(record.get("name"));
              return `<div class="merchant"><span class="avatar" style="background:${avatarBg(name)}">${name[0]}</span>${name}</div>`;
            },
          },
        ]}
        resources={resources}
        events={events}
        timeRangesFeature={{ showCurrentTimeLine: true }}
        eventTooltipFeature={{ template: ({ eventRecord }: { eventRecord: { get: (k: string) => string } }) => `<div class="tip">${eventRecord.get("tip")}</div>` }}
        onEventClick={({ eventRecord }: { eventRecord: { resourceId: string | number } }) => onSelect(String(eventRecord.resourceId))}
      />
      <div className="legend">
        <span><i className="dot" style={{ background: COLOR.red }} />Trial ends in under 48h</span>
        <span><i className="dot" style={{ background: COLOR.yellow }} />Price hike</span>
        <span><i className="dot" style={{ background: COLOR.green }} />On track</span>
        <span>Faded bars are projected renewals</span>
      </div>
    </section>
  );
}
