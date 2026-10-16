import { deepEqual, equal, match } from "node:assert/strict";
import { Webhook } from "svix";
import { createWebhookHandler, type Receipt } from "./handler.ts";

// Synthetic test key only, unrelated to Resend or any deployed endpoint.
const secret = `whsec_${btoa("synthetic-test-signing-key-32bytes")}`;
const event = {
  type: "email.delivered",
  created_at: "2026-10-15T12:00:00.000Z",
  data: {
    email_id: "11111111-1111-4111-8111-111111111111",
    to: ["fixture@example.test"],
    subject: "Never store this",
  },
};

function signedRequest(
  body = JSON.stringify(event),
  options: { timestamp?: Date; id?: string; key?: string } = {},
) {
  const timestamp = options.timestamp ?? new Date();
  const id = options.id ?? "msg_synthetic_receipt";
  const signature = new Webhook(options.key ?? secret).sign(
    id,
    timestamp,
    body,
  );
  return new Request("http://localhost/resend-webhook", {
    method: "POST",
    headers: {
      "svix-id": id,
      "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
      "svix-signature": signature,
    },
    body,
  });
}

function setup(signingSecret: string | undefined = secret) {
  const receipts: Receipt[] = [];
  const errors: string[] = [];
  const handler = createWebhookHandler({
    signingSecret,
    persist: (receipt) => {
      receipts.push(receipt);
      return Promise.resolve(true);
    },
    reportFailure: (code) => errors.push(code),
  });
  return { receipts, errors, handler };
}

Deno.test("valid signed event persists only minimal metadata", async () => {
  const { handler, receipts } = setup();
  const response = await handler(signedRequest());
  equal(response.status, 200);
  equal(response.headers.get("cache-control"), "no-store");
  deepEqual(await response.json(), { received: true, duplicate: false });
  equal(receipts.length, 1);
  deepEqual(Object.keys(receipts[0]).sort(), [
    "emailId",
    "eventId",
    "eventType",
    "occurredAt",
    "payloadSha256",
  ]);
  match(receipts[0].payloadSha256, /^[a-f0-9]{64}$/);
});

Deno.test(
  "duplicate database receipt is acknowledged without another workflow",
  async () => {
    const handler = createWebhookHandler({
      signingSecret: secret,
      persist: () => Promise.resolve(false),
      reportFailure: () => {},
    });
    deepEqual(await (await handler(signedRequest())).json(), {
      received: true,
      duplicate: true,
    });
  },
);

Deno.test("non-POST methods are rejected", async () => {
  const { handler, receipts } = setup();
  const response = await handler(
    new Request("http://localhost", { method: "GET" }),
  );
  equal(response.status, 405);
  equal(response.headers.get("allow"), "POST");
  equal(receipts.length, 0);
});

Deno.test("missing configuration fails closed", async () => {
  const { handler, receipts } = setup("");
  equal((await handler(signedRequest())).status, 503);
  equal(receipts.length, 0);
});

Deno.test("invalid secret configuration fails closed", async () => {
  const { handler, errors } = setup("whsec_%%%%");
  equal((await handler(signedRequest())).status, 503);
  deepEqual(errors, ["webhook_secret_invalid"]);
});

Deno.test("missing signature is denied", async () => {
  const { handler, receipts } = setup();
  equal(
    (
      await handler(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify(event),
        }),
      )
    ).status,
    400,
  );
  equal(receipts.length, 0);
});

Deno.test("a signature made with a different key is denied", async () => {
  const { handler, receipts } = setup();
  equal(
    (
      await handler(
        signedRequest(undefined, {
          key: `whsec_${btoa("another-synthetic-secret")}`,
        }),
      )
    ).status,
    400,
  );
  equal(receipts.length, 0);
});

Deno.test("raw body tampering is denied", async () => {
  const original = signedRequest();
  const tampered = new Request(original.url, {
    method: "POST",
    headers: original.headers,
    body: JSON.stringify({ ...event, type: "email.bounced" }),
  });
  const { handler, receipts } = setup();
  equal((await handler(tampered)).status, 400);
  equal(receipts.length, 0);
});

Deno.test("expired and future replay timestamps are denied", async () => {
  const { handler, receipts } = setup();
  for (const offset of [-600_000, 600_000])
    equal(
      (
        await handler(
          signedRequest(undefined, {
            timestamp: new Date(Date.now() + offset),
          }),
        )
      ).status,
      400,
    );
  equal(receipts.length, 0);
});

Deno.test(
  "signed malformed JSON and invalid event fields are denied",
  async () => {
    const { handler, receipts } = setup();
    for (const value of [
      "{bad-json",
      "null",
      "[]",
      JSON.stringify({ ...event, data: { email_id: "not-a-uuid" } }),
      JSON.stringify({ ...event, created_at: "yesterday" }),
      JSON.stringify({ ...event, type: "email." }),
    ]) {
      equal((await handler(signedRequest(value))).status, 400);
    }
    equal(receipts.length, 0);
  },
);

Deno.test("a correctly signed non-email event is ignored", async () => {
  const { handler, receipts } = setup();
  deepEqual(
    await (
      await handler(signedRequest(JSON.stringify({ type: "contact.created" })))
    ).json(),
    { received: true, ignored: true },
  );
  equal(receipts.length, 0);
});

Deno.test(
  "future email event types are captured without a fragile enum",
  async () => {
    const { handler, receipts } = setup();
    equal(
      (
        await handler(
          signedRequest(
            JSON.stringify({ ...event, type: "email.some_future_event" }),
          ),
        )
      ).status,
      200,
    );
    equal(receipts.length, 1);
  },
);

Deno.test(
  "untrimmed raw JSON is verified without reserialization",
  async () => {
    const { handler, receipts } = setup();
    equal(
      (await handler(signedRequest(`\n ${JSON.stringify(event, null, 2)} \n`)))
        .status,
      200,
    );
    equal(receipts.length, 1);
  },
);

Deno.test(
  "oversize body without Content-Length is rejected before persistence",
  async () => {
    const { handler, receipts } = setup();
    equal(
      (await handler(signedRequest("x".repeat(256 * 1024 + 1)))).status,
      413,
    );
    equal(receipts.length, 0);
  },
);

Deno.test("oversize declared Content-Length is rejected", async () => {
  const { handler, receipts } = setup();
  const request = signedRequest();
  request.headers.set("content-length", "999999");
  equal((await handler(request)).status, 413);
  equal(receipts.length, 0);
});

Deno.test("database errors are retryable and do not leak details", async () => {
  const errors: string[] = [];
  const handler = createWebhookHandler({
    signingSecret: secret,
    persist: () => Promise.reject(new Error("sensitive database details")),
    reportFailure: (code) => errors.push(code),
  });
  const response = await handler(signedRequest());
  equal(response.status, 503);
  deepEqual(await response.json(), {
    error: "Unable to accept event; retry later",
  });
  deepEqual(errors, ["resend_receipt_persist_failed"]);
});
