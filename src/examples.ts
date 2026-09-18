import type { Skill } from "./core.js";

/** Original, synthetic examples. No client records or private Skill contents. */
export const examples: Skill[] = [
  {
    id: "research-synthesis",
    name: "Research Synthesis",
    description:
      "Turn a small set of public observations into an evidence brief. / 将公开观察整理为证据简报。",
    inputs: ["research-notes"],
    outputs: ["evidence-brief"],
    steps: [
      "Group observations by user need.",
      "Separate direct evidence from assumptions.",
      "Cite the source of every finding.",
    ],
    constraints: [
      "Use public or explicitly permitted source material.",
      "Mark uncertainty; never invent evidence.",
    ],
    tags: ["research", "研究", "evidence"],
    parents: [],
  },
  {
    id: "prototype-builder",
    name: "Prototype Builder",
    description:
      "Turn an evidence brief into a small, testable interaction. / 将证据简报变成可测试交互。",
    inputs: ["evidence-brief"],
    outputs: ["interactive-prototype", "test-checklist"],
    steps: [
      "Choose one user task.",
      "Build its smallest interactive flow.",
      "Write observable acceptance checks.",
    ],
    constraints: [
      "Use synthetic data in public demos.",
      "Support keyboard navigation and reduced motion.",
    ],
    tags: ["design", "设计", "prototype"],
    parents: [],
  },
  {
    id: "accessibility-review",
    name: "Accessibility Review",
    description:
      "Review a prototype with a test checklist. / 按清单检查原型的无障碍体验。",
    inputs: ["interactive-prototype", "test-checklist"],
    outputs: ["accessibility-report"],
    steps: [
      "Walk the task using only a keyboard.",
      "Check text, focus and reduced motion.",
      "Record reproducible issues.",
    ],
    constraints: [
      "A checklist is not certification.",
      "Include manual assistive-technology testing before release.",
    ],
    tags: ["accessibility", "无障碍", "quality"],
    parents: [],
  },
  {
    id: "release-story",
    name: "Release Story",
    description:
      "Shape verified outcomes into a bilingual release story. / 将已验证成果写成双语发布故事。",
    inputs: ["verified-results"],
    outputs: ["release-notes"],
    steps: [
      "Describe the concrete user problem.",
      "Attach evidence and known limitations.",
      "Write Chinese and English versions.",
    ],
    constraints: [
      "Do not present a planned capability as shipped.",
      "Only use screenshots from the running product.",
    ],
    tags: ["writing", "写作", "release"],
    parents: [],
  },
];
