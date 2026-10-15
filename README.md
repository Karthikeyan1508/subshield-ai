# SubShield AI

Autonomous subscription and dark-pattern defense for PayPal (sandbox only).

SubShield reads your PayPal subscriptions, scores each one for predatory behaviour (price hikes, trials about to convert), alerts you through Zapier, and cancels through PayPal when you say so.

| | |
| :--- | :--- |
| Live app | https://subshield-web.onrender.com |
| Live API | https://subshield-api.onrender.com (`/health`, `/api/subscriptions`) |
| API spec | [`openapi.yaml`](openapi.yaml) |
| Postman | [`postman/SubShield_AI.postman_collection.json`](postman/SubShield_AI.postman_collection.json) |
| SDKs (APIMatic) | [`sdk/typescript`](sdk/typescript), [`sdk/python`](sdk/python), [`sdk/java`](sdk/java) |
| Demo script | [`DEMO.md`](DEMO.md) |

The free Render plan sleeps when idle, so the first request can take about 50 seconds.

## How it works

```
Next.js dashboard ──► Express API ──► PayPal Agent Toolkit (sandbox)
 AG Grid + Bryntum      ledger +        list/show subscription, cancel_subscription
                        scoring
                           └────────► Zapier webhook ──► your phone
```

- **Auditor**: reads subscription and plan details through `@paypal/agent-toolkit` and keeps a price history.
- **Detective**: scores 0-100 from the size of the price hike and how soon a free trial converts.
- **Defender**: `POST /api/subscriptions/:id/cancel` calls PayPal `cancel_subscription`; `POST /api/alerts/run` sends one Zapier alert per newly risky price.

## Sponsor tech used

- **PayPal Agent Toolkit**: all PayPal reads and cancellations.
- **AG Grid**: subscription matrix with custom renderers, price sparklines, risk bars, search and CSV export.
- **Bryntum Scheduler**: renewal timeline with trial windows, projected renewals, tooltips, a now line and zoom. Linked to the grid by selection.
- **Zapier**: alert webhook.
- **Render**: hosts the web app and API (`render.yaml`).
- **APIMatic**: TypeScript, Python and Java SDKs generated from `openapi.yaml`.
- **Postman**: collection that runs against the live API.

Not integrated: Elastic, Channel3.

## Try the live API

```bash
curl https://subshield-api.onrender.com/health
curl https://subshield-api.onrender.com/api/subscriptions
npx newman run postman/SubShield_AI.postman_collection.json
```

The three demo subscriptions (Streamify, CloudNotes, FitPass) are created in the PayPal sandbox when the API boots. A subscription stays `APPROVAL_PENDING` until a sandbox buyer approves it with the "Approve" button; only then can it be cancelled. Sandbox buyer credentials are provided in the submission form, not in this repo.

## Run locally

```bash
npm install
cp .env.example .env        # PayPal sandbox client id/secret, optional Zapier hook
npm run smoke               # toolkit tools + live sandbox call
npm run dev:api             # http://localhost:4000, seeds demo subscriptions if none exist
npm run dev:web             # http://localhost:3000
npm test -w api
```

`npm run hike -w api -- Streamify 6.66` fakes an earlier price so the current one reads as a hike (PayPal rejects plan price updates here). The Streamify hike in the demo uses the same idea: it is seeded history, not a real price change.

## Deploy on Render

1. Create a Blueprint from `render.yaml`.
2. Set `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `ZAPIER_WEBHOOK_URL` on `subshield-api`.
3. Set `NEXT_PUBLIC_API_URL` on `subshield-web`, and `WEB_ORIGIN` / `PUBLIC_API_URL` on the API, to the two https URLs.

The ledger is a file on the instance, so it is lost on restart. The API reseeds it on boot.

## Known limits

- Sandbox only. The POST routes have no authentication.
- The price-hike demo uses seeded history.
- Not built: Elastic ToS scoring, Channel3 merchant lookup, WhatsApp reply-to-cancel. The APIMatic CLI has no Swift target.
