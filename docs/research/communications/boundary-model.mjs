// Research-only executable model. No network, files, database, secrets or real actions.
// Passing assertions proves these toy invariants, not a deployed implementation.
import assert from "node:assert/strict";

let passed = 0;
function check(name, run) {
  run();
  passed += 1;
  console.log(`PASS ${name}`);
}

check("split receipt/work commits exhibit a lost-work crash window", () => {
  const receipt = new Set(["delivery-1"]);
  const work = new Set(); // crash after receipt commit, before work insert
  if (!receipt.has("delivery-1")) work.add("delivery-1"); // duplicate-only handler
  assert.equal(work.size, 0); // counterexample, NOT a safe implementation
});

check("modeled atomic receipt/work rolls back or commits both", () => {
  let state = { receipts: [], work: [] };
  function accept(crashBeforeCommit) {
    const transaction = structuredClone(state);
    if (!transaction.receipts.includes("delivery-1")) {
      transaction.receipts.push("delivery-1");
      transaction.work.push("normalize-1");
    }
    if (!crashBeforeCommit) state = transaction;
  }
  accept(true);
  assert.deepEqual(state, { receipts: [], work: [] });
  accept(false);
  accept(false); // acknowledgement lost; retry same event
  assert.deepEqual(state, {
    receipts: ["delivery-1"],
    work: ["normalize-1"],
  });
});

check(
  "provider acceptance plus lost result makes blind retry duplicate",
  () => {
    const provider = [];
    provider.push("intent-1"); // accepted externally, local process then crashes
    const localOutcome = "unknown";
    provider.push("intent-1"); // naive resend after lease expiration
    assert.equal(localOutcome, "unknown");
    assert.equal(provider.length, 2); // proves why local leases alone cannot suffice
  },
);

check(
  "mocked idempotency suppresses retries only inside its assumed window",
  () => {
    const seen = new Map();
    let externalSends = 0;
    function send(key, now) {
      if (seen.has(key) && now - seen.get(key) < 100) return;
      externalSends += 1;
      seen.set(key, now);
    }
    send("intent-1", 0);
    send("intent-1", 50);
    assert.equal(externalSends, 1);
    send("intent-1", 101);
    assert.equal(externalSends, 2); // units/window synthetic, not any provider SLA
  },
);

check(
  "exact-version owner approval expires; spoofed mail is not authority",
  () => {
    const action = { digest: "fixture-version-A", expiresAt: 100 };
    function allowed(actor, digest, now, approved) {
      return (
        actor === "authenticated-owner" &&
        approved === true &&
        digest === action.digest &&
        now < action.expiresAt
      );
    }
    assert.equal(allowed("authenticated-owner", action.digest, 99, true), true);
    assert.equal(allowed("email-claims-owner", action.digest, 99, true), false);
    assert.equal(
      allowed("authenticated-owner", "fixture-version-B", 99, true),
      false,
    );
    assert.equal(
      allowed("authenticated-owner", action.digest, 100, true),
      false,
    );
    assert.equal(
      allowed("authenticated-owner", action.digest, 99, false),
      false,
    );
  },
);

check(
  "append-only delivery facts do not clear complaint on delayed delivery",
  () => {
    const facts = ["complained", "delivered"];
    assert.equal(facts.includes("complained"), true);
    assert.equal(new Set(facts).size, 2);
    const lastWriteWins = facts.at(-1);
    assert.equal(lastWriteWins, "delivered"); // unsafe projection loses restriction
  },
);

console.log(`${passed} model checks passed; 0 live-provider guarantees tested`);
