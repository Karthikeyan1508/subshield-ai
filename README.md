# SubShield AI

Autonomous subscription and dark-pattern defense agent for PayPal (sandbox only).

- `apps/web` — Next.js dashboard: Bryntum renewal timeline + AG Grid subscription table (port 3000)
- `apps/api` — Express + TypeScript API (port 4000) on `@paypal/agent-toolkit`
- `openapi.yaml` — API spec
- `sdk/` — client SDKs (TypeScript, Python, Java) generated from the spec with APIMatic
- `postman/` — Postman collection (`npx newman run postman/SubShield_AI.postman_collection.json`)
- `render.yaml` — Render blueprint (api + web)

## Run locally

```bash
npm install
cp .env.example .env        # PayPal sandbox client id/secret, optional Zapier hook
npm run smoke               # toolkit tools + live sandbox call
npm run seed -w api         # creates 3 sandbox subscriptions, prints buyer approve links
npm run dev:api
npm run dev:web             # http://localhost:3000
npm test -w api
```

`npm run hike -w api -- Streamify 6.66` fakes an earlier price so the current one reads as a hike
(PayPal rejects plan price updates on pending plans).

## API

| Route | What |
| :--- | :--- |
| `GET /api/subscriptions` | Ledger with price history, hike, predatory score |
| `POST /api/subscriptions/:id/cancel` | PayPal `cancel_subscription` (ACTIVE/SUSPENDED only) |
| `POST /api/alerts/run` | Zapier webhook for each subscription newly over the score threshold |

## Deploy on Render

1. Push the repo, create a Blueprint from `render.yaml`.
2. Set `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `ZAPIER_WEBHOOK_URL` on `subshield-api`.
3. Set `NEXT_PUBLIC_API_URL` on `subshield-web` to the api's https URL, and `WEB_ORIGIN` / `PUBLIC_API_URL` on the api to the web and api URLs.
4. Run `npm run seed -w api` in the api's Render shell. The ledger is a local file, so on the free plan it is lost on every restart; reseed after a redeploy.

## Known limits

- Subscriptions stay `APPROVAL_PENDING` until a sandbox buyer approves them on PayPal.
- Not built: Elastic ToS scoring, Channel3 merchant lookup, WhatsApp replies. APIMatic CLI has no Swift target.
- The POST routes have no authentication.
