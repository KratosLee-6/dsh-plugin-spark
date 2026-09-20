import { describe, expect, it } from "vitest";
import { previewMarkdown } from "../src/markdown.js";
import { skillMarkdown, validateSkill, collide, grow } from "../src/core.js";
import { examples } from "../src/examples.js";
import { readFileSync } from "node:fs";

describe("reviewable SKILL.md import", () => {
  it.each(examples)("round trips every field of $id", (skill) => {
    const preview = previewMarkdown(skillMarkdown(skill));
    expect(preview.valid).toBe(true);
    expect(preview.unparsed).toEqual([]);
    expect(preview.warnings).toEqual([]);
    expect(validateSkill(preview.draft)).toEqual(skill);
  });
  it("round trips grown lineage, tags and multiline steps", () => {
    const child = grow(
      collide(examples[0]!, examples[1]!, "Prototype"),
      "Child",
    );
    child.steps = ["First line\nsecond line\n\nlast line"];
    child.description = 'A "quoted"\ndescription';
    const result = previewMarkdown(skillMarkdown(child));
    expect(result.draft).toEqual(child);
    expect(result.valid).toBe(true);
  });
  it("leaves absent contracts empty and exposes unknown metadata and prose", () => {
    const source = readFileSync("examples/reviewable-skill.md", "utf8");
    const result = previewMarkdown(source);
    expect(result.draft.id).toBe("evidence-review");
    expect(result.draft.inputs).toEqual([]);
    expect(result.draft.outputs).toEqual([]);
    expect(result.valid).toBe(false);
    expect(result.unparsed.map((x) => x.text).join("\n")).toContain(
      "allowed-tools:",
    );
    expect(result.unparsed.map((x) => x.text).join("\n")).toContain(
      "Review the supplied evidence",
    );
    expect(result.warnings).toHaveLength(2);
  });
  it("keeps fences and their fake contracts inert, including mismatched closing fences", () => {
    const result = previewMarkdown(
      "# Data\n````md\n## Inputs\n- fake\n```\n## Outputs\n- fake\n````\n## Inputs\n- real\n~~~sh\nrm -rf /\n~~~",
    );
    expect(result.draft.inputs).toEqual(["real"]);
    expect(result.draft.outputs).toEqual([]);
    expect(result.unparsed.map((x) => x.text)).toContain("rm -rf /");
  });
  it("reports unclosed fences and does not treat their contents as fields", () => {
    const result = previewMarkdown("```\n## Inputs\n- fake");
    expect(result.draft.inputs).toEqual([]);
    expect(result.warnings).toContain("Unclosed code fence / 代码围栏未闭合");
  });
  it("supports Chinese headings, ordered items, BOM and CRLF", () => {
    const result = previewMarkdown(
      "\uFEFF---\r\nname: demo\r\ndescription: 'It''s useful'\r\n---\r\n# 示例\r\n## 输入\r\n1. brief\r\n## 输出\r\n1) plan\r\n## 步骤\r\n* Review\r\n## 约束\r\n+ Stay local\r\n## 标签\r\n- local\r\n## 来源\r\n- root",
    );
    expect(result.valid).toBe(true);
    expect(result.draft.description).toBe("It's useful");
    expect(result.draft.constraints).toEqual(["Stay local"]);
  });
  it.each([
    "description: |\n  Multi line",
    "description: [array]",
    'description: "unterminated',
    "description: 'unterminated",
    "description: &alias",
    "description: value # comment",
    'description:  ""',
    'description: "ok"\ndescription: duplicate',
  ])("exposes unsupported or duplicate frontmatter: %s", (metadata) => {
    const result = previewMarkdown(`---\nname: demo\n${metadata}\n---\n`);
    expect(result.unparsed.length).toBeGreaterThan(0);
  });
  it("does not silently assign sections below unknown headings", () => {
    const result = previewMarkdown(
      "## Inputs\n- brief\n## Unknown\n- not-an-input\n## Outputs\n- plan\n### Notes\n- not-an-output\n# Heading\n# Another heading\ntext",
    );
    expect(result.draft.inputs).toEqual(["brief"]);
    expect(result.draft.outputs).toEqual(["plan"]);
    expect(result.unparsed.map((x) => x.text)).toContain("- not-an-input");
  });
  it("reports limits without discarding oversized parsed fields", () => {
    const source = skillMarkdown(examples[0]!).replace(
      "## Inputs / 输入",
      "## Inputs / 输入\n" + "- extra\n".repeat(33),
    );
    const result = previewMarkdown(source);
    expect(result.valid).toBe(false);
    expect(result.draft.inputs.length).toBeGreaterThan(32);
  });
  it("fingerprints the exact source and never normalizes it silently", () => {
    const source = skillMarkdown(examples[0]!);
    expect(previewMarkdown(source).sourceFingerprint).toHaveLength(64);
    expect(previewMarkdown(source).sourceFingerprint).not.toBe(
      previewMarkdown(source + "\n").sourceFingerprint,
    );
  });
  it.each(["", " \n", "x\0y", "---\nname: a", "中".repeat(22000)])(
    "rejects empty, unclosed or oversized sources",
    (source) => {
      expect(() => previewMarkdown(source)).toThrow();
    },
  );
  it("rejects non-string values at runtime", () => {
    // @ts-expect-error runtime boundary
    expect(() => previewMarkdown(null)).toThrow();
  });
});

it.each(["constructor", "__proto__", "toString"])(
  "treats prototype-named headings as unknown: %s",
  (heading) => {
    const result = previewMarkdown(`## ${heading}\n- inert`);
    expect(result.unparsed).toHaveLength(2);
  },
);
it("preserves multiline display names without turning them into contract headings", () => {
  const skill = { ...examples[0]!, name: "Original\n## Inputs\n- unexpected" };
  const result = previewMarkdown(skillMarkdown(skill));
  expect(result.draft).toEqual(skill);
  expect(result.unparsed).toEqual([]);
});
it("preserves fenced code inside exported list continuations as inert text", () => {
  const skill = {
    ...examples[0]!,
    steps: ["Review sample\n```json\n{}\n```\nContinue"],
  };
  const result = previewMarkdown(skillMarkdown(skill));
  expect(result.draft).toEqual(skill);
  expect(result.unparsed).toEqual([]);
});
it("keeps unindented fake headings inside a list-owned fence inert", () => {
  const result = previewMarkdown(
    "---\nname: fence-owner\ndescription: Keep code inert\n---\n## Steps\n- review\n  ```md\n## Inputs\n- fake\n  ```\n## Outputs\n- real",
  );
  expect(result.draft.inputs).toEqual([]);
  expect(result.draft.outputs).toEqual(["real"]);
  expect(result.draft.steps).toEqual(["review\n```md\n## Inputs\n- fake\n```"]);
});
it("reports an unclosed list-owned fence without parsing contracts inside it", () => {
  const result = previewMarkdown(
    "## Steps\n- review\n  ```\n## Inputs\n- fake",
  );
  expect(result.draft.inputs).toEqual([]);
  expect(result.warnings).toContain("Unclosed code fence / 代码围栏未闭合");
});

it.each(["```", "~~~"])(
  "round-trips a list item starting with %s and the following contracts",
  (marker) => {
    const skill = {
      ...examples[0]!,
      steps: [`${marker}json\n{}\n${marker}`],
      constraints: ["local"],
      tags: ["test"],
      parents: ["parent"],
    };
    const result = previewMarkdown(skillMarkdown(skill));
    expect(result.draft).toEqual(skill);
    expect(result.warnings).toEqual([]);
  },
);

it.each(["```echo hello```", "Review\n```echo hello```"])(
  "keeps inline backtick spans literal: %s",
  (step) => {
    const skill = {
      ...examples[0]!,
      steps: [step],
      constraints: ["local"],
      tags: ["test"],
      parents: ["parent"],
    };
    const result = previewMarkdown(skillMarkdown(skill));
    expect(result.draft).toEqual(skill);
    expect(result.warnings).toEqual([]);
  },
);
it("does not start a standalone fence for an inline backtick span", () => {
  const result = previewMarkdown("```echo hello```\n## Inputs\n- actual");
  expect(result.draft.inputs).toEqual(["actual"]);
  expect(result.unparsed.map((item) => item.text)).toEqual([
    "```echo hello```",
  ]);
  expect(result.warnings).not.toContain("Unclosed code fence / 代码围栏未闭合");
});
