import { SparkError, digest, validateSkill, type Skill } from "./core.js";

export interface ImportPreview {
  draft: Skill;
  warnings: string[];
  unparsed: { line: number; text: string }[];
  sourceFingerprint: string;
  valid: boolean;
  validationError: string | null;
}
const sections: Record<
  string,
  keyof Pick<
    Skill,
    "inputs" | "outputs" | "steps" | "constraints" | "tags" | "parents"
  >
> = {
  inputs: "inputs",
  输入: "inputs",
  outputs: "outputs",
  输出: "outputs",
  steps: "steps",
  步骤: "steps",
  constraints: "constraints",
  约束: "constraints",
  tags: "tags",
  标签: "tags",
  parents: "parents",
  来源: "parents",
};

/** Restricted Markdown reader. No YAML evaluation, HTML rendering, file access or execution. */
function fenceOpening(line: string): string | undefined {
  const match = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match || (match[1]![0] === "`" && match[2]!.includes("`")))
    return undefined;
  return match[1];
}

export function previewMarkdown(source: string): ImportPreview {
  if (typeof source !== "string" || Buffer.byteLength(source, "utf8") > 64000)
    throw new SparkError(
      "INPUT_TOO_LARGE",
      "SKILL.md must be at most 64 KB / 文件最大 64 KB",
    );
  if (!source.trim() || source.includes("\0"))
    throw new SparkError(
      "INVALID_MARKDOWN",
      "Empty or invalid Markdown / Markdown 为空或含空字符",
    );
  const lines = source
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const draft: Skill = {
    id: "",
    name: "",
    description: "",
    inputs: [],
    outputs: [],
    steps: [],
    constraints: [],
    tags: [],
    parents: [],
  };
  const warnings: string[] = [];
  const unparsed: ImportPreview["unparsed"] = [];
  const retain = (i: number) => {
    if (lines[i]?.trim()) unparsed.push({ line: i + 1, text: lines[i]! });
  };
  let start = 0;
  let explicitDisplayName = false;
  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    if (end < 0)
      throw new SparkError(
        "INVALID_MARKDOWN",
        "Unclosed frontmatter / 元数据分隔符未闭合",
      );
    const seen = new Set<string>();
    for (let i = 1; i < end; i++) {
      const match = /^(name|description|display-name):\s*(.+)$/.exec(lines[i]!);
      if (!match || seen.has(match[1]!)) {
        retain(i);
        continue;
      }
      const key = match[1]!,
        raw = match[2]!;
      let value: unknown = raw;
      if (raw.startsWith('"')) {
        try {
          value = JSON.parse(raw);
        } catch {
          retain(i);
          continue;
        }
      } else if (/^[\[\]{|>&*!#]/.test(raw) || raw.includes(" #")) {
        retain(i);
        continue;
      } else if (raw.startsWith("'")) {
        if (!raw.endsWith("'") || raw.length < 2) {
          retain(i);
          continue;
        }
        value = raw.slice(1, -1).replaceAll("''", "'");
      }
      if (typeof value !== "string" || !value.trim()) {
        retain(i);
        continue;
      }
      seen.add(key);
      if (key === "name") {
        draft.id = value.trim();
        if (!explicitDisplayName) draft.name = value.trim();
      } else if (key === "display-name") {
        draft.name = value;
        explicitDisplayName = true;
      } else draft.description = value;
    }
    start = end + 1;
  }
  let section: (typeof sections)[string] | undefined;
  let titled = false;
  let fence:
    | {
        char: string;
        length: number;
        owner?: { section: NonNullable<typeof section>; index: number };
      }
    | undefined;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    const marker = fenceOpening(line);
    if (fence) {
      if (fence.owner) {
        const { section: owner, index } = fence.owner;
        draft[owner][index] +=
          "\n" + (line.startsWith("  ") ? line.slice(2) : line);
      } else retain(i);
      if (new RegExp(`^\\s*${fence.char}{${fence.length},}\\s*$`).test(line))
        fence = undefined;
      continue;
    }
    if (section && line.startsWith("  ") && draft[section].length) {
      const index = draft[section].length - 1;
      draft[section][index] += "\n" + line.slice(2);
      if (marker)
        fence = {
          char: marker[0]!,
          length: marker.length,
          owner: { section, index },
        };
      continue;
    }
    if (marker) {
      fence = { char: marker[0]!, length: marker.length };
      retain(i);
      continue;
    }
    const title = /^# (.+)$/.exec(line);
    if (title && !titled) {
      if (!explicitDisplayName) draft.name = title[1]!;
      titled = true;
      section = undefined;
      continue;
    }
    const heading = /^## (.+)$/.exec(line);
    if (heading) {
      const key = heading[1]!.split("/")[0]!.trim().toLowerCase();
      section = Object.hasOwn(sections, key) ? sections[key] : undefined;
      if (!section) retain(i);
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      section = undefined;
      retain(i);
      continue;
    }
    const bullet = /^(?:[-*+] |\d+[.)] )(.+)$/.exec(line);
    if (section && bullet) {
      draft[section].push(bullet[1]!);
      const opening = fenceOpening(bullet[1]!);
      if (opening)
        fence = {
          char: opening[0]!,
          length: opening.length,
          owner: { section, index: draft[section].length - 1 },
        };
      continue;
    }
    if (line === "> Unverified composition draft / 未验证的组合草案") continue;
    retain(i);
  }
  if (unparsed.length)
    warnings.push(
      "Unmapped content is shown below and will NOT be saved. Copy any needed instructions or constraints into the editable fields. / 下方未映射内容不会保存，请将需要的指令和约束补入字段。",
    );
  if (fence) warnings.push("Unclosed code fence / 代码围栏未闭合");
  let validationError: string | null = null;
  try {
    validateSkill(draft);
  } catch (error) {
    validationError = (error as Error).message;
  }
  if (validationError)
    warnings.push(
      "Complete or correct the contract before saving. No missing inputs, outputs or steps were inferred. / 保存前请补全契约；不会推测缺失的输入、输出或步骤。",
    );
  return {
    draft,
    warnings,
    unparsed,
    sourceFingerprint: digest(source),
    valid: validationError === null,
    validationError,
  };
}
