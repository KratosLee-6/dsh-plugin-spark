import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";

const dir = resolve(".host-test", `smoke-${Date.now()}`);
mkdirSync(dir, { recursive: true });
const patch = join(dir, "spark.patch.yml");
writeFileSync(
  patch,
  `- insert:\n    - id: spark\n      name: ${JSON.stringify(resolve("dist/index.js").replaceAll("\\", "/"))}\n      config:\n        dataDir: ${JSON.stringify(join(dir, "data").replaceAll("\\", "/"))}\n`,
);
const child = spawn(
  process.execPath,
  [
    resolve("node_modules/@deepseek-ai/dsh/lib/bin.js"),
    "web",
    "--patch",
    patch,
    "--no-open",
    "--port",
    "0",
  ],
  {
    env: { ...process.env, DSH_HOME: join(dir, "home") },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);
let output = "";
try {
  const url = await new Promise((accept, reject) => {
    const timer = setTimeout(
      () => reject(Error("DSH startup timed out after 120 seconds")),
      120000,
    );
    const inspect = (chunk) => {
      output += chunk.toString();
      const match = output.match(
        /dsh web: (http:\/\/127\.0\.0\.1:\d+\/[^\s]*)/,
      );
      if (match) {
        clearTimeout(timer);
        accept(match[1]);
      }
    };
    child.stdout.on("data", inspect);
    child.stderr.on("data", inspect);
    child.once("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(Error(`DSH exited during startup (${code})`));
    });
  });
  const bootstrap = await fetch(url, { redirect: "manual" });
  const location = bootstrap.headers.get("location");
  let response = bootstrap;
  if (location && bootstrap.status >= 300 && bootstrap.status < 400) {
    const next = new URL(location, url);
    assert.equal(
      next.origin,
      new URL(url).origin,
      "Only follow local host redirects",
    );
    const cookie = bootstrap.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    response = await fetch(next, {
      headers: { Cookie: cookie },
      redirect: "error",
    });
  }
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html/i);
  const dbPath = join(dir, "data", "spark.db");
  assert(existsSync(dbPath), "Plugin must create its configured database");
  const db = new DatabaseSync(dbPath, { readOnly: true });
  assert.equal(db.prepare("SELECT count(*) AS n FROM skills").get().n, 4);
  db.close();
  assert(
    !/\[E\]|failed to load.*spark|cannot find module/i.test(output),
    "Host logged a plugin startup failure",
  );
  console.log(
    "PASS: pinned DSH CLI boots a fresh isolated profile, loads the absolute-path Spark patch, initializes 4 synthetic Skills, and serves HTTP 200. No model request was made.",
  );
} finally {
  if (child.exitCode === null) {
    if (process.platform === "win32") {
      try {
        execFileSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
          stdio: "ignore",
          windowsHide: true,
        });
      } catch {}
    } else child.kill("SIGTERM");
  }
}
