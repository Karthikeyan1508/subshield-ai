import "./env.js";
import express from "express";
import cors from "cors";
import { loadSubscriptions } from "./ledger.js";

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/subscriptions", async (_req, res, next) => {
  try {
    res.json(await loadSubscriptions());
  } catch (e) {
    next(e);
  }
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(502).json({ error: err.message });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`api on :${port}`));
