import { Webhook } from "svix";

const MAX_BODY_BYTES = 256 * 1024;
const encoder = new TextEncoder();

export type Receipt = {
  eventId: string;
  emailId: string;
  eventType: string;
  occurredAt: string;
  payloadSha256: string;
};

type Dependencies = {
  signingSecret: string | undefined;
  persist: (receipt: Receipt) => Promise<boolean>;
  reportFailure: (code: string) => void;
};

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

class BodyTooLarge extends Error {}

// Enforce the limit while streaming too; Content-Length is not trustworthy.
async function boundedBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new BodyTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function emailMetadata(value: unknown) {
  if (!isRecord(value) || typeof value.type !== "string") return null;
  if (!/^email\.[a-z_]{1,80}$/.test(value.type)) return null;
  if (!isRecord(value.data) || typeof value.data.email_id !== "string")
    return null;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value.data.email_id,
    )
  )
    return null;
  if (
    typeof value.created_at !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value.created_at)
  )
    return null;
  const time = Date.parse(value.created_at);
  if (!Number.isFinite(time)) return null;
  return {
    emailId: value.data.email_id,
    eventType: value.type,
    occurredAt: new Date(time).toISOString(),
  };
}

async function bodyHash(body: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(body));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function createWebhookHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") {
      return new Response(null, {
        status: 405,
        headers: { Allow: "POST", "Cache-Control": "no-store" },
      });
    }
    if (!deps.signingSecret)
      return json(503, { error: "Webhook not configured" });
    const id = request.headers.get("svix-id");
    const timestamp = request.headers.get("svix-timestamp");
    const signature = request.headers.get("svix-signature");
    if (
      !id ||
      id.length > 200 ||
      !timestamp ||
      timestamp.length > 20 ||
      !signature ||
      signature.length > 4096
    ) {
      return json(400, { error: "Invalid webhook headers" });
    }
    if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
      return json(413, { error: "Payload too large" });

    let verifier: Webhook;
    try {
      verifier = new Webhook(deps.signingSecret);
    } catch {
      deps.reportFailure("webhook_secret_invalid");
      return json(503, { error: "Webhook not configured" });
    }
    let body: string;
    try {
      body = await boundedBody(request);
    } catch (error) {
      return json(error instanceof BodyTooLarge ? 413 : 400, {
        error: "Invalid request body",
      });
    }
    let event: unknown;
    try {
      // Svix authenticates body + ID + timestamp and enforces its replay time window.
      verifier.verify(body, {
        "svix-id": id,
        "svix-timestamp": timestamp,
        "svix-signature": signature,
      });
      // Svix 2 verifies without returning parsed JSON. Parse only AFTER verification.
      event = JSON.parse(body);
    } catch {
      return json(400, { error: "Invalid webhook signature or payload" });
    }
    // This endpoint is for email events, not contact/domain management events.
    if (
      isRecord(event) &&
      typeof event.type === "string" &&
      !event.type.startsWith("email.")
    ) {
      return json(200, { received: true, ignored: true });
    }
    const metadata = emailMetadata(event);
    if (!metadata) return json(400, { error: "Invalid email event" });
    try {
      const inserted = await deps.persist({
        eventId: id,
        ...metadata,
        payloadSha256: await bodyHash(body),
      });
      return json(200, { received: true, duplicate: !inserted });
    } catch {
      // No provider body, addresses, keys, or database error details in logs/responses.
      deps.reportFailure("resend_receipt_persist_failed");
      return json(503, { error: "Unable to accept event; retry later" });
    }
  };
}
