import { createHash } from "node:crypto";

export type Language = "en" | "zh";
/**
 * Where a grown draft's steps come from. Registered in the AI--boom product
 * repository on 2026-10-31 (owner ruling): parent skills are sources,
 * inspiration and optional methods — never a bloodline constraint. A grown
 * Skill may combine both parents, extend one, or stand alone as long as its
 * own contract is complete and reviewable.
 */
export type Relationship =
  "derived_from_parents" | "novel_extension" | "independent_new_skill";
export const RELATIONSHIPS: Relationship[] = [
  "derived_from_parents",
  "novel_extension",
  "independent_new_skill",
];
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
  relationship?: Relationship;
  /** Collision that triggered the draft when parents are inspiration only. */
  inspiredBy?: string;
}
export interface IndependentDraft {
  inputs: string[];
  outputs: string[];
  steps: string[];
}
export interface GrowOptions {
  /** Defaults to "derived_from_parents" for backward compatibility. */
  relationship?: Relationship | undefined;
  /** Required when relationship is "novel_extension": which parent's steps extend. */
  extend?: "a" | "b" | undefined;
  /** Required when relationship is "independent_new_skill": author-supplied contract. */
  draft?: IndependentDraft | undefined;
}
export interface GrowthAssessment {
  allowed: boolean;
  reason: string | null;
}
/**
 * Author-approved contract bridge: A's declared output feeds B's declared input
 * under different names. The note records WHY the human approved the mapping;
 * the engine never invents one. Bridges are declarations, not verified conversions.
 */
export interface Bridge {
  fromOutput: string;
  toInput: string;
  note: string;
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
  /** Author-approved bridges from this collision; absent on pre-0.4.0 records. */
  bridges?: Bridge[];
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
  let relationship: Relationship | undefined;
  if (s.relationship !== undefined) {
    if (
      typeof s.relationship !== "string" ||
      !RELATIONSHIPS.includes(s.relationship as Relationship)
    )
      throw new SparkError(
        "INVALID_RELATIONSHIP",
        `relationship must be one of: ${RELATIONSHIPS.join(", ")}`,
      );
    relationship = s.relationship as Relationship;
  }
  let inspiredBy: string | undefined;
  if (s.inspiredBy !== undefined) {
    inspiredBy = text(s.inspiredBy, "inspiredBy", 120);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(inspiredBy))
      throw new SparkError(
        "INVALID_ID",
        "inspiredBy must use the same character rules as a skill ID",
      );
  }
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
    ...(relationship ? { relationship } : {}),
    ...(inspiredBy ? { inspiredBy } : {}),
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

/**
 * Validate author-supplied bridges against the two contracts. Mismatches fail
 * visibly: every fromOutput must be a declared output of A, every toInput a
 * declared input of B that exact-name matching did NOT already cover.
 */
function bridges(
  raw: unknown,
  a: Skill,
  b: Skill,
  handoffs: string[],
): Bridge[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > 32)
    throw new SparkError(
      "INVALID_BRIDGE",
      "Bridges must be an array of at most 32 items / 桥接为数组，最多 32 条",
    );
  const seen = new Set<string>();
  const field = (value: unknown, name: string) => {
    try {
      return text(value, name, 500);
    } catch (error) {
      // Field-level problems still report as bridge errors: the caller passed
      // a bridge, and "INVALID_INPUT" would hide which feature failed.
      if (error instanceof SparkError && error.code === "INVALID_INPUT")
        throw new SparkError(
          "INVALID_BRIDGE",
          `Bridge ${name}: expected 1–500 characters / 桥接字段为空或超长`,
        );
      throw error;
    }
  };
  return raw.map((value) => {
    const bridge = object(value);
    const fromOutput = field(bridge.fromOutput, "fromOutput");
    const toInput = field(bridge.toInput, "toInput");
    const note = field(bridge.note, "note");
    if (!a.outputs.includes(fromOutput))
      throw new SparkError(
        "INVALID_BRIDGE",
        `Bridge output "${fromOutput}" is not declared by A / 桥接来源不在 A 的输出清单中`,
      );
    if (!b.inputs.includes(toInput))
      throw new SparkError(
        "INVALID_BRIDGE",
        `Bridge input "${toInput}" is not declared by B / 桥接目标不在 B 的输入清单中`,
      );
    if (handoffs.includes(toInput))
      throw new SparkError(
        "INVALID_BRIDGE",
        `Bridge input "${toInput}" already matches by name; a bridge is redundant / 该输入已按名称匹配，无需桥接`,
      );
    if (seen.has(toInput))
      throw new SparkError(
        "INVALID_BRIDGE",
        `Duplicate bridge for input "${toInput}" / 同一输入重复桥接`,
      );
    seen.add(toInput);
    return { fromOutput, toInput, note };
  });
}

/** Compose declared contracts. Never executes Skill instructions or claims semantic compatibility. */
export function collide(
  first: Skill,
  second: Skill,
  rawGoal: string,
  language: Language = "en",
  rawBridges?: unknown,
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
  const approved = bridges(rawBridges, a, b, handoffs).sort((x, y) =>
    x.toInput < y.toInput ? -1 : x.toInput > y.toInput ? 1 : 0,
  );
  const bridged = approved.map((bridge) => bridge.toInput);
  const gaps = b.inputs.filter(
    (input) => !handoffs.includes(input) && !bridged.includes(input),
  );
  // Bridges join the fingerprint only when present, so bridge-free collisions
  // keep the IDs they had before 0.4.0 and old saved history stays matched.
  const fingerprint = digest({
    engine: "spark-rules/1",
    a,
    b,
    goal,
    language,
    ...(approved.length ? { bridges: approved } : {}),
  });
  const connected = gaps.length === 0;
  const zh = language === "zh";
  const bridgeLine = approved.length
    ? zh
      ? `以下契约桥由作者批准（仅声明，未经执行验证）：${approved.map((x) => `${x.fromOutput} → ${x.toInput}（${x.note}）`).join("；")}。`
      : `Author-approved contract bridges (declarations, not verified conversions): ${approved.map((x) => `${x.fromOutput} -> ${x.toInput} (${x.note})`).join("; ")}.`
    : null;
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
    bridges: approved,
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
          ...(bridgeLine ? [bridgeLine] : []),
          `依照 ${b.name} 的步骤生成 ${b.outputs.join("、")}，用下列检查项人工验收。`,
        ]
      : [
          `Prepare ${a.inputs.join(", ")}. Use “${goal}” as the acceptance goal.`,
          `Follow ${a.name} to produce ${a.outputs.join(", ")}.`,
          gaps.length
            ? `Supply or transform the missing inputs: ${gaps.join(", ")} before ${b.name}. Do not execute an unverified bridge.`
            : `Inspect the handoff (${handoffs.join(", ")}) before passing it to ${b.name}.`,
          ...(bridgeLine ? [bridgeLine] : []),
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

export function grow(
  collision: Collision,
  rawName: string,
  options: GrowOptions = {},
): Skill {
  const name = text(rawName, "name", 120);
  const relationship = options.relationship ?? "derived_from_parents";
  if (!RELATIONSHIPS.includes(relationship))
    throw new SparkError(
      "INVALID_RELATIONSHIP",
      `relationship must be one of: ${RELATIONSHIPS.join(", ")}`,
    );
  const [a, b] = collision.parents;
  // Different relationships from the same collision are different drafts:
  // the id must not collide when a user grows more than one lineage.
  const baseId = `grown-${digest({
    collision: collision.fingerprint,
    name,
    relationship,
  }).slice(0, 20)}`;
  const zh = collision.language === "zh";
  try {
    if (relationship === "independent_new_skill") {
      if (options.extend)
        throw new SparkError(
          "INVALID_GROW_OPTIONS",
          'extend applies only to relationship "novel_extension"',
        );
      if (!options.draft)
        throw new SparkError(
          "INVALID_GROW_OPTIONS",
          'relationship "independent_new_skill" requires a draft with inputs, outputs and steps supplied by the author; the engine never invents them. / 独立草案需要作者自备 inputs/outputs/steps，引擎不代拟。',
        );
      const draft = options.draft;
      return validateSkill({
        id: `independent-${digest({
          collision: collision.fingerprint,
          name,
          relationship,
        }).slice(0, 20)}`,
        name,
        description: collision.goal,
        inputs: draft.inputs,
        outputs: draft.outputs,
        steps: draft.steps,
        constraints: [...new Set(collision.constraints.map((c) => c.text))],
        tags: ["spark-grown", "unverified-draft", "independent-draft"],
        parents: [],
        relationship,
        inspiredBy: collision.id,
      });
    }
    if (relationship === "novel_extension") {
      if (options.draft)
        throw new SparkError(
          "INVALID_GROW_OPTIONS",
          'draft applies only to relationship "independent_new_skill"',
        );
      if (options.extend !== "a" && options.extend !== "b")
        throw new SparkError(
          "INVALID_GROW_OPTIONS",
          'relationship "novel_extension" requires extend: "a" or "b" (whose steps this draft extends)',
        );
      const base = options.extend === "a" ? a : b;
      const other = options.extend === "a" ? b : a;
      const inspirationStep = zh
        ? `灵感来源 / 灵感来源说明：父级「${other.name}」启发了本目标，但其步骤未并入本草案。`
        : `Inspiration: parent "${other.name}" informed this goal; its steps are intentionally not included.`;
      return validateSkill({
        id: baseId,
        name,
        description: collision.goal,
        inputs:
          options.extend === "b"
            ? [...new Set([...base.inputs, ...collision.gaps])]
            : base.inputs,
        outputs: base.outputs,
        steps: [
          ...base.steps.map(
            (step) => `[${options.extend!.toUpperCase()}] ${step}`,
          ),
          inspirationStep,
        ],
        constraints: [...new Set(collision.constraints.map((c) => c.text))],
        tags: ["spark-grown", "unverified-draft"],
        parents: [a.id, b.id],
        relationship,
      });
    }
    if (options.extend || options.draft)
      throw new SparkError(
        "INVALID_GROW_OPTIONS",
        'extend/draft apply only to "novel_extension" / "independent_new_skill"',
      );
    return validateSkill({
      id: baseId,
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
      relationship,
    });
  } catch (error) {
    if (!(error instanceof SparkError)) throw error;
    if (
      error.code === "INVALID_GROW_OPTIONS" ||
      error.code === "INVALID_RELATIONSHIP" ||
      error.code === "INVALID_ID"
    )
      throw error;
    if (error.code === "INVALID_INPUT")
      throw new SparkError(
        "GROWTH_LIMIT",
        options.draft
          ? `GROWTH_LIMIT: The supplied independent draft exceeds Skill limits. Trim it, then grow again. Nothing was truncated. / 独立草案超出技能容量，请精简后重试，内容未截断。 (${error.message})`
          : `GROWTH_LIMIT: Combined contract exceeds Skill limits. Split or shorten the parent Skills, then collide again. Nothing was truncated. / 组合超出技能容量，请拆分或缩短父级后重新碰撞，内容未截断。 (${error.message})`,
      );
    throw error;
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
  const relationship: Relationship | undefined = s.relationship;
  const relationshipText: Record<Relationship, string> = {
    derived_from_parents:
      "Both parents' steps are included. / 两侧父级步骤均并入本草案。",
    novel_extension:
      "Extends one parent's steps; the other parent informed the goal as inspiration only. / 延伸一侧父级的步骤；另一侧仅作为灵感来源。",
    independent_new_skill:
      "Independent draft: the contract was supplied by the author; parents are inspiration only. / 独立草案：契约由作者提供；父级仅作灵感来源。",
  };
  const relationshipSection = relationship
    ? `## Relationship / 来源关系\n- spark-relationship: ${relationship}\n- ${relationshipText[relationship]}${
        s.inspiredBy
          ? `\n- Inspired by collision / 由碰撞触发: ${s.inspiredBy}`
          : ""
      }\n\n`
    : "";
  return `---\nname: ${JSON.stringify(s.id)}\ndescription: ${JSON.stringify(s.description)}\ndisplay-name: ${JSON.stringify(s.name)}${
    relationship ? `\nspark-relationship: ${relationship}` : ""
  }\n---\n\n# ${s.name.replace(/\r\n?|\n/g, " ")}\n\n> Unverified composition draft / 未验证的组合草案\n\n${relationshipSection}## Inputs / 输入\n${bullets(s.inputs)}\n\n## Outputs / 输出\n${bullets(s.outputs)}\n\n## Steps / 步骤\n${bullets(s.steps)}\n\n## Constraints / 约束\n${bullets(s.constraints)}\n\n## Tags / 标签\n${bullets(s.tags)}\n\n## Parents / 来源\n${bullets(s.parents)}\n`;
}
