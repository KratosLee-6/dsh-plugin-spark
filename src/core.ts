import { createHash } from "node:crypto";

export type Language = "en" | "zh";
export interface Skill {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  steps: string[];
  constraints: string[];
  tags: string[];
  parents: string[];
}
export interface GrowthAssessment {
  allowed: boolean;
  reason: string | null;
}
export interface Collision {
  growth?: GrowthAssessment;
  id: string;
  engine: "spark-rules/1";
  language: Language;
  mode: "connected" | "bridge-needed";
  title: string;
  goal: string;
  parents: [Skill, Skill];
  fingerprint: string;
  handoffs: string[];
  gaps: string[];
  constraints: { skillId: string; text: string }[];
  plan: string[];
  checks: string[];
  disclaimer: string;
}

export class SparkError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "SparkError";
  }
}
export const digest = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new SparkError("INVALID_INPUT", "Expected an object / 需要对象");
  return value as Record<string, unknown>;
};
export function text(value: unknown, field: string, max = 2000): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > max ||
    value.includes("\0")
  ) {
    throw new SparkError(
      "INVALID_INPUT",
      `${field}: expected 1–${max} characters / 字段为空或超长`,
    );
  }
  return value.trim();
}
function list(value: unknown, field: string, required = false): string[] {
  if (
    !Array.isArray(value) ||
    value.length > 32 ||
    (required && value.length === 0)
  )
    throw new SparkError(
      "INVALID_INPUT",
      `${field}: expected ${required ? "1" : "0"}–32 items`,
    );
  return [...new Set(value.map((v) => text(v, field, 500)))];
}
export function validateSkill(value: unknown): Skill {
  const s = object(value);
  const id = text(s.id, "id", 80);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id))
    throw new SparkError(
      "INVALID_ID",
      "Use lowercase letters, digits and hyphens for the skill ID",
    );
  return {
    id,
    name: text(s.name, "name", 120),
    description: text(s.description, "description"),
    inputs: list(s.inputs, "inputs", true),
    outputs: list(s.outputs, "outputs", true),
    steps: list(s.steps, "steps", true),
    constraints: list(s.constraints, "constraints"),
    tags: list(s.tags, "tags"),
    parents: list(s.parents ?? [], "parents"),
  };
}
export function parseSkillJSON(source: string): Skill {
  if (typeof source !== "string" || Buffer.byteLength(source, "utf8") > 64000)
    throw new SparkError("INPUT_TOO_LARGE", "Skill JSON must be at most 64 KB");
  try {
    return validateSkill(JSON.parse(source));
  } catch (error) {
    if (error instanceof SparkError) throw error;
    throw new SparkError(
      "INVALID_JSON",
      "Invalid Skill JSON / Skill JSON 格式错误",
    );
  }
}
const token = (s: string) =>
  s.normalize("NFKC").trim().toLocaleLowerCase("en-US");

/** Compose declared contracts. Never executes Skill instructions or claims semantic compatibility. */
export function collide(
  first: Skill,
  second: Skill,
  rawGoal: string,
  language: Language = "en",
): Collision {
  const a = validateSkill(first),
    b = validateSkill(second);
  const goal = text(rawGoal, "goal", 1000);
  if (a.id === b.id)
    throw new SparkError(
      "SAME_SKILL",
      "Choose two different skills / 请选择两个不同技能",
    );
  if (language !== "en" && language !== "zh")
    throw new SparkError("INVALID_LANGUAGE", "language must be en or zh");
  const handoffs = b.inputs.filter((input) =>
    a.outputs.some((output) => token(output) === token(input)),
  );
  const gaps = b.inputs.filter((input) => !handoffs.includes(input));
  const fingerprint = digest({ engine: "spark-rules/1", a, b, goal, language });
  const connected = gaps.length === 0;
  const zh = language === "zh";
  const collision: Collision = {
    growth: { allowed: true, reason: null },
    id: `spark-${fingerprint.slice(0, 24)}`,
    engine: "spark-rules/1",
    language,
    mode: connected ? "connected" : "bridge-needed",
    title: `${a.name} × ${b.name}`,
    goal,
    parents: [a, b],
    fingerprint,
    handoffs,
    gaps,
    constraints: [a, b].flatMap((s) =>
      s.constraints.map((c) => ({ skillId: s.id, text: c })),
    ),
    plan: zh
      ? [
          `准备输入：${a.inputs.join("、")}。以“${goal}”作为验收目标。`,
          `依照 ${a.name} 的步骤生成：${a.outputs.join("、")}。`,
          gaps.length
            ? `先补充或转换缺失输入：${gaps.join("、")}，再交给 ${b.name}；未验证前不要自动执行。`
            : `检查交接内容 ${handoffs.join("、")}，再交给 ${b.name}。`,
          `依照 ${b.name} 的步骤生成 ${b.outputs.join("、")}，用下列检查项人工验收。`,
        ]
      : [
          `Prepare ${a.inputs.join(", ")}. Use “${goal}” as the acceptance goal.`,
          `Follow ${a.name} to produce ${a.outputs.join(", ")}.`,
          gaps.length
            ? `Supply or transform the missing inputs: ${gaps.join(", ")} before ${b.name}. Do not execute an unverified bridge.`
            : `Inspect the handoff (${handoffs.join(", ")}) before passing it to ${b.name}.`,
          `Follow ${b.name} to produce ${b.outputs.join(", ")} and review the checks below.`,
        ],
    checks: zh
      ? [
          "用一份合成样本走通；逐项核对输入和输出的实际格式。",
          "检查双方约束是否冲突；本引擎只保留原文，不自动裁决。",
          "记录成功标准、失败样例和人工判断，再将草案用于真实工作。",
        ]
      : [
          "Try one synthetic sample; inspect the actual format of every input and output.",
          "Review both sets of constraints for conflicts; this engine preserves them without resolving them.",
          "Record acceptance criteria, a failure example and human review before real use.",
        ],
    disclaimer: zh
      ? "确定性规则草案：按声明的输入/输出名称匹配，未执行技能、未验证语义或效果。"
      : "Deterministic rule draft: matches declared input/output names. Skills were not executed; semantics and effectiveness are unverified.",
  };
  collision.growth = assessGrowth(collision);
  return collision;
}

export function grow(collision: Collision, rawName: string): Skill {
  const name = text(rawName, "name", 120);
  const [a, b] = collision.parents;
  const id = `grown-${digest({ collision: collision.fingerprint, name }).slice(0, 20)}`;
  try {
    return validateSkill({
      id,
      name,
      description: collision.goal,
      inputs: [...new Set([...a.inputs, ...collision.gaps])],
      outputs: b.outputs,
      steps: [
        ...a.steps.map((step) => `[A] ${step}`),
        collision.gaps.length
          ? `Bridge / 补充交接: ${collision.gaps.join(", ")}`
          : `Review handoff / 检查交接: ${collision.handoffs.join(", ")}`,
        ...b.steps.map((step) => `[B] ${step}`),
      ],
      constraints: [...new Set(collision.constraints.map((c) => c.text))],
      tags: ["spark-grown", "unverified-draft"],
      parents: [a.id, b.id],
    });
  } catch (error) {
    if (!(error instanceof SparkError)) throw error;
    throw new SparkError(
      "GROWTH_LIMIT",
      `GROWTH_LIMIT: Combined contract exceeds Skill limits. Split or shorten the parent Skills, then collide again. Nothing was truncated. / 组合超出技能容量，请拆分或缩短父级后重新碰撞，内容未截断。 (${error.message})`,
    );
  }
}
export function assessGrowth(collision: Collision): GrowthAssessment {
  try {
    grow(collision, "Capacity check");
    return { allowed: true, reason: null };
  } catch (error) {
    if (!(error instanceof SparkError) || error.code !== "GROWTH_LIMIT")
      throw error;
    return { allowed: false, reason: error.message };
  }
}

export function skillMarkdown(skill: Skill): string {
  const s = validateSkill(skill);
  const bullets = (items: string[]) =>
    items.map((v) => `- ${v.replaceAll("\n", "\n  ")}`).join("\n");
  return `---\nname: ${JSON.stringify(s.id)}\ndescription: ${JSON.stringify(s.description)}\ndisplay-name: ${JSON.stringify(s.name)}\n---\n\n# ${s.name.replace(/\r\n?|\n/g, " ")}\n\n> Unverified composition draft / 未验证的组合草案\n\n## Inputs / 输入\n${bullets(s.inputs)}\n\n## Outputs / 输出\n${bullets(s.outputs)}\n\n## Steps / 步骤\n${bullets(s.steps)}\n\n## Constraints / 约束\n${bullets(s.constraints)}\n\n## Tags / 标签\n${bullets(s.tags)}\n\n## Parents / 来源\n${bullets(s.parents)}\n`;
}
