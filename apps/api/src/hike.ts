// Demo only: PayPal refuses plan price updates here, so pretend the merchant used to charge less.
// Usage: npm run hike -w api -- Streamify 6.66   (current price then reads as a hike from 6.66)
import "./env.js";
import { readLedger, writeLedger } from "./ledger.js";

const [merchant, previous] = process.argv.slice(2);
if (!merchant || !(Number(previous) > 0)) throw new Error("usage: hike <merchant> <previous price>");

const entries = await readLedger();
const entry = entries.find((e) => e.merchant.toLowerCase() === merchant.toLowerCase());
if (!entry) throw new Error(`no ledger entry for ${merchant}`);

(entry.prices ??= []).unshift({ at: new Date(Date.now() - 30 * 864e5).toISOString(), price: Number(previous) });
await writeLedger(entries);
console.log(`${entry.merchant}: history now ${entry.prices.map((p) => p.price).join(" -> ")}`);
