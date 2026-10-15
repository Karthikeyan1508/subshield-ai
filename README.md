# SubShield AI

Autonomous subscription and dark-pattern defense agent for PayPal (sandbox).

- `apps/web` — Next.js frontend (port 3000)
- `apps/api` — Express + TypeScript backend (port 4000), uses `@paypal/agent-toolkit`

## Setup

```bash
npm install
cp .env.example .env   # fill PayPal sandbox client id/secret
npm run smoke          # verifies toolkit tools + live sandbox call
npm run dev:api
npm run dev:web
```
