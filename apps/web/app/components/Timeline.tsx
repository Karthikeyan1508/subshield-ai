"use client";
import "@bryntum/scheduler/scheduler.css";
import "@bryntum/scheduler/svalbard-dark.css";
import { BryntumScheduler } from "@bryntum/scheduler-react";
import { urgency, type Subscription } from "../lib";

const COLOR = { red: "red", yellow: "orange", green: "green" } as const;
const DAY = 864e5;

export default function Timeline({ subs }: { subs: Subscription[] }) {
  const now = Date.now();
  const dated = subs.filter((s) => s.nextBillingTime);
  const resources = dated.map((s) => ({ id: s.id, name: s.merchant }));
  const events = dated.map((s) => {
    const start = new Date(s.nextBillingTime!);
    return {
      id: s.id,
      resourceId: s.id,
      name: s.price ? `$${s.price.toFixed(2)}` : "Renewal",
      startDate: start,
      endDate: new Date(start.getTime() + DAY),
      eventColor: COLOR[urgency(s, now)],
    };
  });

  return (
    <BryntumScheduler
      height={Math.max(180, 90 + dated.length * 50)}
      startDate={new Date(now - 2 * DAY)}
      endDate={new Date(now + 30 * DAY)}
      viewPreset="dayAndWeek"
      rowHeight={46}
      columns={[{ text: "Merchant", field: "name", width: 140 }]}
      resources={resources}
      events={events}
      readOnly
    />
  );
}
