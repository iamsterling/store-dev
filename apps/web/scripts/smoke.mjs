import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";

// Reserve an available local port; fail if another process claims it before Next starts.
const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const address = reservation.address();
assert(address && typeof address === "object");
const { port } = address;
await new Promise((resolve, reject) =>
  reservation.close((error) => (error ? reject(error) : resolve())),
);

const require = createRequire(import.meta.url);
const child = spawn(
  process.execPath,
  [
    require.resolve("next/dist/bin/next"),
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
let startupError;
child.on("error", (error) => {
  startupError = error;
});
child.stdout.on("data", (chunk) => {
  logs += chunk;
});
child.stderr.on("data", (chunk) => {
  logs += chunk;
});
const base = `http://127.0.0.1:${port}`;

try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (startupError) throw startupError;
    if (child.exitCode !== null)
      throw new Error(`Next exited during startup: ${logs}`);
    try {
      const response = await fetch(base, { signal: AbortSignal.timeout(1000) });
      ready = response.ok;
    } catch {
      /* Wait for the server to bind its port. */
    }
    if (ready) break;
    await delay(250);
  }
  assert(ready, `Production server failed to become ready: ${logs}`);
  const routes = [
    ["/", 200, "Let’s build your next chapter."],
    ["/catalog", 200, "Your catalog starts here"],
    ["/orders", 200, "Ready for your first order"],
    ["/suppliers", 200, "Great operations start with great suppliers"],
    ["/setup", 200, "Build on solid ground."],
    ["/does-not-exist", 404, "Nothing here just yet."],
    ["/toString", 404, "Nothing here just yet."],
  ];
  for (const [path, status, text] of routes) {
    const response = await fetch(`${base}${path}`, {
      signal: AbortSignal.timeout(5000),
    });
    const html = await response.text();
    assert.equal(response.status, status, path);
    assert(html.includes(text), `Missing page content: ${path}`);
    assert(
      html.includes('id="main-content"'),
      `Missing main landmark: ${path}`,
    );
    assert.equal(response.headers.get("x-powered-by"), null);
    if (path === "/") {
      const stylesheet = html.match(/href="([^"]+\.css(?:\?[^"]*)?)"/);
      assert(stylesheet?.[1], "Missing CSS asset");
      const css = await fetch(
        new URL(stylesheet[1].replaceAll("&amp;", "&"), base),
      );
      assert.equal(css.status, 200);
      assert(
        (await css.text()).includes(".bg-primary"),
        "Shared Tailwind components not scanned",
      );
    }
    console.log(`PASS ${status} ${path}`);
  }
  console.log(
    "Production HTTP smoke passed (7 routes + shared stylesheet). This is not a browser E2E or DB test.",
  );
} finally {
  if (child.exitCode === null && !startupError) {
    const closed = once(child, "close");
    child.kill("SIGTERM");
    await closed;
  }
}
