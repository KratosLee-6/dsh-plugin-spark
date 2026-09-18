import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  collide,
  grow,
  validateSkill,
  SparkError,
  type Collision,
  type Language,
  type Skill,
} from "./core.js";

export class SparkStore {
  private db: DatabaseSync;
  constructor(path: string, seed: Skill[] = []) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA busy_timeout=3000; PRAGMA foreign_keys=ON;");
    const version = this.db.prepare("PRAGMA user_version").get() as {
      user_version: number;
    };
    if (version.user_version > 1) {
      this.db.close();
      throw new SparkError(
        "FUTURE_SCHEMA",
        "Database is newer than this Spark version",
      );
    }
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS skills (id TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS collisions (id TEXT PRIMARY KEY, value TEXT NOT NULL); PRAGMA user_version=1;",
    );
    for (const s of seed) {
      const validated = validateSkill(s);
      this.db
        .prepare("INSERT OR IGNORE INTO skills VALUES (?, ?)")
        .run(validated.id, JSON.stringify(validated));
    }
  }
  close(): void {
    this.db.close();
  }
  skills(query = ""): Skill[] {
    if (typeof query !== "string" || query.length > 200)
      throw new SparkError(
        "INVALID_QUERY",
        "Query must be at most 200 characters",
      );
    const q = query.normalize("NFKC").toLowerCase().trim();
    return (
      this.db.prepare("SELECT value FROM skills ORDER BY id").all() as {
        value: string;
      }[]
    )
      .map((row) => validateSkill(JSON.parse(row.value)))
      .filter(
        (s) =>
          !q ||
          [s.name, s.description, ...s.tags, ...s.inputs, ...s.outputs]
            .join(" ")
            .normalize("NFKC")
            .toLowerCase()
            .includes(q),
      );
  }
  skill(id: string): Skill {
    const row = this.db
      .prepare("SELECT value FROM skills WHERE id=?")
      .get(id) as { value: string } | undefined;
    if (!row) throw new SparkError("NOT_FOUND", "Skill not found / 找不到技能");
    return validateSkill(JSON.parse(row.value));
  }
  put(value: unknown): { skill: Skill; created: boolean } {
    const skill = validateSkill(value);
    const row = this.db
      .prepare("SELECT value FROM skills WHERE id=?")
      .get(skill.id) as { value: string } | undefined;
    if (row && row.value !== JSON.stringify(skill))
      throw new SparkError(
        "ID_CONFLICT",
        "This ID already belongs to different content; use a new ID / 编号冲突，请使用新编号",
      );
    const result = this.db
      .prepare("INSERT OR IGNORE INTO skills VALUES (?, ?)")
      .run(skill.id, JSON.stringify(skill));
    return { skill, created: result.changes === 1 };
  }
  preview(a: string, b: string, goal: string, language: Language): Collision {
    return collide(this.skill(a), this.skill(b), goal, language);
  }
  save(
    a: string,
    b: string,
    goal: string,
    language: Language,
  ): { collision: Collision; created: boolean } {
    const collision = this.preview(a, b, goal, language);
    const result = this.db
      .prepare("INSERT OR IGNORE INTO collisions VALUES (?, ?)")
      .run(collision.id, JSON.stringify(collision));
    return { collision, created: result.changes === 1 };
  }
  collision(id: string): Collision {
    const row = this.db
      .prepare("SELECT value FROM collisions WHERE id=?")
      .get(id) as { value: string } | undefined;
    if (!row)
      throw new SparkError(
        "NOT_FOUND",
        "Save a collision before growing it / 请先保存碰撞",
      );
    return JSON.parse(row.value) as Collision;
  }
  history(): Collision[] {
    return (
      this.db
        .prepare("SELECT value FROM collisions ORDER BY rowid DESC LIMIT 100")
        .all() as { value: string }[]
    ).map((row) => JSON.parse(row.value) as Collision);
  }
  grow(id: string, name: string): { skill: Skill; created: boolean } {
    return this.put(grow(this.collision(id), name));
  }
}
