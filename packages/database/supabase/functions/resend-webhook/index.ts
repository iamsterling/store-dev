import { createWebhookHandler, type Receipt } from "./handler.ts";

const url = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

async function persist(receipt: Receipt): Promise<boolean> {
  if (!url || !serviceKey) throw new Error("Missing database credentials");
  // Use a service-only RPC rather than exposing the integrations schema to PostgREST.
  const response = await fetch(`${url}/rest/v1/rpc/record_resend_event`, {
    method: "POST",
    signal: AbortSignal.timeout(10_000),
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_event_id: receipt.eventId,
      p_email_id: receipt.emailId,
      p_event_type: receipt.eventType,
      p_occurred_at: receipt.occurredAt,
      p_payload_sha256: receipt.payloadSha256,
    }),
  });
  if (!response.ok) throw new Error("Receipt persistence failed");
  const result: unknown = await response.json();
  if (typeof result !== "boolean") throw new Error("Unexpected receipt result");
  return result;
}

Deno.serve(
  createWebhookHandler({
    signingSecret: Deno.env.get("RESEND_WEBHOOK_SECRET"),
    persist,
    reportFailure: (code) => console.error(JSON.stringify({ code })),
  }),
);
