import { PayPalAgentToolkit, ALL_TOOLS_ENABLED } from "@paypal/agent-toolkit/ai-sdk";

export function paypalToolkit() {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env (see .env.example)");
  }
  return new PayPalAgentToolkit({
    clientId: PAYPAL_CLIENT_ID,
    clientSecret: PAYPAL_CLIENT_SECRET,
    // Sandbox only: this project never touches live PayPal.
    configuration: { actions: ALL_TOOLS_ENABLED, context: { sandbox: true } },
  });
}

let toolkit: ReturnType<typeof paypalToolkit> | undefined;

// Runs a toolkit tool and returns its parsed JSON; throws if PayPal returned an error.
export async function call(name: string, args: Record<string, unknown>): Promise<any> {
  toolkit ??= paypalToolkit();
  const tool = toolkit.getTools()[name] as any;
  if (!tool) throw new Error(`unknown tool: ${name}`);
  const out = await tool.execute(args, {});
  const data = typeof out === "string" ? JSON.parse(out) : out;
  if (data?.name && data?.message && data?.debug_id) throw new Error(`${name}: ${data.name} ${data.message}`);
  return data;
}

// Raw REST for endpoints the toolkit does not wrap (e.g. plan price updates).
export async function rest(method: string, path: string, body?: unknown): Promise<any> {
  toolkit ??= paypalToolkit();
  const res = await fetch(toolkit.client.getBaseUrl() + path, {
    method,
    headers: await toolkit.client.getHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}
