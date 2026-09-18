import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { SparkStore } from "../src/store.js";
import { examples } from "../src/examples.js";
const dirs: string[] = [],
  stores: SparkStore[] = [];
const open = (path = ":memory:") => {
  const s = new SparkStore(path, examples);
  stores.push(s);
  return s;
};
afterEach(() => {
  for (const s of stores.splice(0)) s.close();
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
describe("SQLite persistence", () => {
  it("searches bilingual fields and validates query length", () => {
    const s = open();
    expect(s.skills("研究")).toHaveLength(1);
    expect(s.skills("NOPE")).toHaveLength(0);
    expect(s.skills()).toHaveLength(4);
    expect(() => s.skills("a".repeat(201))).toThrow();
  });
  it("protects existing IDs and makes identical imports idempotent", () => {
    const s = open();
    expect(s.put(examples[0]).created).toBe(false);
    expect(() => s.put({ ...examples[0], name: "Changed" })).toThrow(
      "different content",
    );
    expect(s.skill(examples[0]!.id).name).toBe(examples[0]!.name);
    expect(() => s.skill("missing")).toThrow();
  });
  it("does not persist previews; repeated saves and growth do not duplicate records", () => {
    const s = open(),
      a = examples[0]!.id,
      b = examples[1]!.id;
    const preview = s.preview(a, b, "Prototype", "en");
    expect(s.history()).toEqual([]);
    expect(() => s.grow(preview.id, "Child")).toThrow("Save");
    expect(s.save(a, b, "Prototype", "en").created).toBe(true);
    expect(s.save(a, b, "Prototype", "en").created).toBe(false);
    expect(s.history()).toHaveLength(1);
    expect(s.grow(preview.id, "Child").created).toBe(true);
    expect(s.grow(preview.id, "Child").created).toBe(false);
    expect(s.skills()).toHaveLength(5);
  });
  it("survives closing/reopening; two connections share committed records", () => {
    const dir = mkdtempSync(join(tmpdir(), "spark-test-"));
    dirs.push(dir);
    const path = join(dir, "nested", "spark.db");
    const s = open(path),
      saved = s.save(examples[0]!.id, examples[1]!.id, "Keep", "zh").collision;
    const other = open(path);
    expect(other.collision(saved.id)).toEqual(saved);
    s.close();
    stores.splice(stores.indexOf(s), 1);
    const reopened = open(path);
    expect(reopened.history()[0]).toEqual(saved);
    expect(reopened.skills()).toHaveLength(4);
  });
  it("does not partially write invalid imports and rejects future schemas", () => {
    const s = open();
    expect(() => s.put({ id: "invalid" })).toThrow();
    expect(s.skills()).toHaveLength(4);
    const dir = mkdtempSync(join(tmpdir(), "spark-future-"));
    dirs.push(dir);
    const path = join(dir, "db");
    const db = new DatabaseSync(path);
    db.exec("PRAGMA user_version=99");
    db.close();
    expect(() => new SparkStore(path)).toThrow("newer");
  });
});
