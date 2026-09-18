import { afterEach, expect, it } from "vitest";
import { Context } from "@deepseek-ai/cordis";
import { ToolRuntime } from "@deepseek-ai/dsh-tools";
import SystemPrompt from "@deepseek-ai/dsh-system-prompt";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as spark from "../src/index.js";
import { examples } from "../src/examples.js";
const contexts: Context[] = [],
  dirs: string[] = [];
afterEach(async () => {
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose();
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});
async function host(config: spark.Config = {}) {
  const ctx = new Context();
  contexts.push(ctx);
  await ctx.plugin(SystemPrompt, {}).await();
  await ctx.plugin(ToolRuntime, { mode: "native" }).await();
  const dataDir = mkdtempSync(join(tmpdir(), "spark-host-"));
  dirs.push(dataDir);
  const plugin = ctx.plugin(spark, { dataDir, ...config });
  await plugin.await();
  const call = (
    name: string,
    args: unknown = {},
    signal = new AbortController().signal,
  ) =>
    ctx.tools.execute({
      callId: "spark-test" as never,
      name,
      arguments: args,
      signal,
    });
  return { ctx, plugin, call };
}
it("loads in the real Cordis + DSH ToolRuntime, dispatches the whole growth loop and unloads cleanly", async () => {
  const { ctx, plugin, call } = await host();
  for (const name of [
    "spark_search",
    "spark_inspect",
    "spark_import",
    "spark_collide",
    "spark_grow",
    "spark_history",
  ])
    expect(ctx.tools.get(name)).toBeDefined();
  const search = await call("spark_search", { query: "research" });
  expect(search.isError).toBe(false);
  expect(
    await call("spark_inspect", { id: "research-synthesis" }),
  ).toMatchObject({ isError: false });
  const preview = await call("spark_collide", {
    first: "research-synthesis",
    second: "prototype-builder",
    goal: "Make",
  });
  expect(preview.isError).toBe(false);
  const saved = await call("spark_collide", {
    first: "research-synthesis",
    second: "prototype-builder",
    goal: "Make",
    save: true,
    language: "zh",
  });
  expect(saved.isError).toBe(false);
  const data = JSON.parse((saved.content[0] as { text: string }).text);
  const grown = await call("spark_grow", {
    collision_id: data.collision.id,
    name: "Research to prototype",
  });
  expect(grown.isError).toBe(false);
  expect(
    JSON.parse((grown.content[0] as { text: string }).text).markdown,
  ).toContain("Parents");
  expect((await call("spark_history")).isError).toBe(false);
  expect(
    (
      await call("spark_import", {
        skill_json: JSON.stringify({ ...examples[0], id: "imported-skill" }),
      })
    ).isError,
  ).toBe(false);
  await plugin.dispose();
  expect(ctx.tools.get("spark_search")).toBeUndefined();
  expect((await call("spark_search")).isError).toBe(true);
});
it("rejects invalid arguments and cancellation without writing", async () => {
  const { call } = await host();
  expect((await call("spark_collide", { first: "a" })).isError).toBe(true);
  expect((await call("spark_import", { skill_json: "{" })).isError).toBe(true);
  const c = new AbortController();
  c.abort();
  expect(
    (
      await call(
        "spark_import",
        { skill_json: JSON.stringify({ ...examples[0], id: "cancelled" }) },
        c.signal,
      )
    ).isError,
  ).toBe(true);
  expect((await call("spark_inspect", { id: "cancelled" })).isError).toBe(true);
});
it("supports a completely empty library", async () => {
  const { call } = await host({ seedExamples: false });
  const r = await call("spark_search");
  expect(JSON.parse((r.content[0] as { text: string }).text)).toEqual([]);
});
it("reloads repeatedly without duplicate registrations or lost records", async () => {
  const { plugin, call } = await host();
  const args = {
    first: "research-synthesis",
    second: "prototype-builder",
    goal: "Keep through reloads",
    save: true,
  };
  expect((await call("spark_collide", args)).isError).toBe(false);
  for (let i = 0; i < 10; i++) {
    await plugin.restart();
    expect((await call("spark_search")).isError).toBe(false);
  }
  const saved = await call("spark_collide", args);
  expect(JSON.parse((saved.content[0] as { text: string }).text).created).toBe(
    false,
  );
  const history = await call("spark_history");
  expect(
    JSON.parse((history.content[0] as { text: string }).text),
  ).toHaveLength(1);
});
it.each([{ dataDir: "" }, { seedExamples: "yes" }])(
  "rejects invalid plugin configuration %j",
  async (config) => {
    await expect(host(config as spark.Config)).rejects.toThrow();
  },
);
