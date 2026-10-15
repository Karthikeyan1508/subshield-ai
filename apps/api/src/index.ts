import "./env.js";
import express from "express";
import cors from "cors";
import { loadSubscriptions, readLedger, writeLedger } from "./ledger.js";
import { call } from "./paypal.js";
import { alertPayload, sendAlert, shouldAlert } from "./alert.js";

const port = Number(process.env.PORT ?? 4000);
const app = express();
app.use(cors({ origin: ["http://localhost:3000", "http://127.0.0.1:3000"] }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/subscriptions", async (_req, res, next) => {
  try {
    res.json(await loadSubscriptions());
  } catch (e) {
    next(e);
  }
});

// shortcut: no auth on POST routes, fine for a sandbox-only demo; add a key or user session before real accounts.
app.post("/api/subscriptions/:id/cancel", async (req, res, next) => {
  try {
    const entry = (await readLedger()).find((e) => e.subscriptionId === req.params.id);
    if (!entry) return void res.status(404).json({ error: "unknown subscription" });
    await call("cancel_subscription", { subscription_id: entry.subscriptionId, payload: { reason: "Cancelled via SubShield AI" } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Sends a Zapier alert for each newly high-risk subscription. Call it from a cron (Render) or by hand.
app.post("/api/alerts/run", async (_req, res, next) => {
  try {
    const url = process.env.ZAPIER_WEBHOOK_URL;
    if (!url) return void res.status(503).json({ error: "ZAPIER_WEBHOOK_URL not set" });
    const base = process.env.PUBLIC_API_URL ?? `http://localhost:${port}`;
    const subs = await loadSubscriptions();
    const entries = await readLedger();
    const sent: string[] = [];
    for (const s of subs) {
      const entry = entries.find((e) => e.subscriptionId === s.id)!;
      if (!shouldAlert(s, entry)) continue;
      await sendAlert(url, alertPayload(s, base));
      entry.alertedFor = s.hike!.to;
      sent.push(s.id);
    }
    if (sent.length) await writeLedger(entries);
    res.json({ sent });
  } catch (e) {
    next(e);
  }
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(502).json({ error: err.message });
});

app.listen(port, () => console.log(`api on :${port}`));
