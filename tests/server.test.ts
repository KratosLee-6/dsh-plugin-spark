import { afterEach, expect, it, vi } from "vitest";
import { once } from "node:events";
import { request } from "node:http";
import { SparkStore } from "../src/store.js";
import { createStudio } from "../src/server.js";
import { examples } from "../src/examples.js";
const close: (() => Promise<void>)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const fn of close.splice(0)) await fn();
});
async function studio() {
  const store = new SparkStore(":memory:", examples),
    server = createStudio(store);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as { port: number },
    url = `http://127.0.0.1:${address.port}`;
  close.push(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    store.close();
  });
  const page = await fetch(url),
    html = await page.text(),
    token = html.match(/name="spark-token" content="([a-f0-9]+)"/)![1]!;
  const post = (
    path: string,
    body: unknown,
    headers: Record<string, string> = {},
  ) =>
    fetch(url + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Spark-Token": token,
        ...headers,
      },
      body: JSON.stringify(body),
    });
  return { store, url, post, token, page };
}
it("serves only bundled assets with a restrictive CSP and completes the persistent loop", async () => {
  const { url, post, page } = await studio();
  expect(page.headers.get("content-security-policy")).toContain(
    "frame-ancestors 'none'",
  );
  for (const path of ["/studio.js", "/styles.css", "/mark.svg"])
    expect((await fetch(url + path)).status).toBe(200);
  expect((await fetch(url + "/package.json")).status).toBe(404);
  const args = {
    first: "research-synthesis",
    second: "prototype-builder",
    goal: "Prototype",
    language: "en",
  };
  const preview = await (await post("/api/collide", args)).json();
  expect(preview.collision.mode).toBe("connected");
  expect((await (await fetch(url + "/api/state")).json()).history).toHaveLength(
    0,
  );
  const saved = await (await post("/api/save", args)).json();
  expect(saved.created).toBe(true);
  expect(
    (
      await (
        await post("/api/grow", { id: saved.collision.id, name: "Child" })
      ).json()
    ).markdown,
  ).toContain("Parents");
  expect(
    (
      await (
        await post("/api/import", {
          json: JSON.stringify({ ...examples[0], id: "new" }),
        })
      ).json()
    ).created,
  ).toBe(true);
});
it("rejects cross-origin, spoofed Host and missing/incorrect write tokens", async () => {
  const { url, post } = await studio();
  expect(
    (await post("/api/import", {}, { Origin: "https://untrusted.example" }))
      .status,
  ).toBe(403);
  const status = await new Promise<number | undefined>((resolve) => {
    const req = request(
      url,
      { headers: { Host: "untrusted.example" } },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      },
    );
    req.end();
  });
  expect(status).toBe(403);
  expect(
    (await fetch(url + "/api/import", { method: "POST", body: "{}" })).status,
  ).toBe(403);
  expect(
    (await post("/api/import", {}, { "X-Spark-Token": "0".repeat(64) })).status,
  ).toBe(403);
  expect(
    (await post("/api/import", {}, { "Content-Type": "text/plain" })).status,
  ).toBe(415);
});
it("bounds input and reports actionable failures without raw database errors", async () => {
  const { url, post, token, store } = await studio();
  expect((await post("/api/missing", {})).status).toBe(404);
  expect(
    (
      await post("/api/collide", {
        first: "research-synthesis",
        second: "prototype-builder",
        goal: "Make",
        language: "xx",
      })
    ).status,
  ).toBe(400);
  expect((await post("/api/import", { json: "x".repeat(71000) })).status).toBe(
    400,
  );
  for (const body of ["{", "[]", "null"])
    expect(
      (
        await fetch(url + "/api/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Spark-Token": token,
          },
          body,
        })
      ).status,
    ).toBe(400);
  vi.spyOn(store, "save").mockImplementation(() => {
    throw new Error("private path");
  });
  const response = await post("/api/save", {
    first: "research-synthesis",
    second: "prototype-builder",
    goal: "Make",
    language: "zh",
  });
  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain("private path");
});
it("previews Markdown without writes, then validates explicit reviewed JSON", async () => {
  const { store, post } = await studio();
  const count = store.skills().length;
  const source =
    "---\nname: reviewed\ndescription: Review only\n---\n## Steps\n- Examine\n## Extra\n<img src=x onerror=alert(1)>\n";
  const response = await post("/api/import-preview", { markdown: source });
  expect(response.status).toBe(200);
  const preview = await response.json();
  expect(preview.valid).toBe(false);
  expect(preview.unparsed).toContainEqual({
    line: 8,
    text: "<img src=x onerror=alert(1)>",
  });
  expect(store.skills()).toHaveLength(count);
  expect(
    (await post("/api/import", { json: JSON.stringify(preview.draft) })).status,
  ).toBe(400);
  const reviewed = { ...preview.draft, inputs: ["brief"], outputs: ["plan"] };
  expect(
    (
      await (
        await post("/api/import", { json: JSON.stringify(reviewed) })
      ).json()
    ).created,
  ).toBe(true);
  expect(
    (
      await (
        await post("/api/import", { json: JSON.stringify(reviewed) })
      ).json()
    ).created,
  ).toBe(false);
  expect((await post("/api/import-preview", { markdown: null })).status).toBe(
    400,
  );
  expect(
    (await post("/api/import-preview", { markdown: "---\nname: a" })).status,
  ).toBe(400);
});
