import "./env.js";
import { paypalToolkit } from "./paypal.js";

const tools = paypalToolkit().getTools();
const names = Object.keys(tools);
console.log(`${names.length} tools:`, names.join(", "));

for (const need of ["list_subscription_plans", "cancel_subscription", "list_disputes"]) {
  if (!names.includes(need)) throw new Error(`missing tool: ${need}`);
}

// Live sandbox call: proves creds + network.
const res = await (tools.list_subscription_plans as any).execute({ page_size: 1 }, {});
console.log("list_subscription_plans ->", String(res).slice(0, 300));
