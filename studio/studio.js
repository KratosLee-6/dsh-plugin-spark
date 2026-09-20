const $ = (id) => document.getElementById(id);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const copy = {
  en: {
    sourceDocument: "Source document · stays on this device",
    contractConstraints: "Constraints",
    importFormat: "Source format",
    importFile: "Open a local file · 64 KB max",
    importPreview: "Preview contract",
    reviewTitle: "Review the connection points",
    reviewHelp:
      "One box per item. Complete the missing contract. Nothing executes; only confirmed fields are saved.",
    unmapped: "Unmapped content · not saved",
    confirmReview: "I reviewed the contract and any unmapped content.",
    addItem: "Add item",
    id: "Skill ID",
    name: "Display name",
    description: "Description",
    inputs: "Inputs",
    outputs: "Outputs",
    steps: "Steps",
    tags: "Tags",
    parents: "Parent IDs",
    importTooLarge: "File must be at most 64 KB.",
    previewRequired: "Preview and review this source before saving.",

    local: "Local by design",
    headline: "Good skills.<br>A little more possibility.",
    intro:
      "Bring two skills together. See what connects.<br>Grow something worth trying.",
    tag1: "Local-first",
    tag2: "Traceable by default",
    tag3: "Made to compose",
    collection: "YOUR INGREDIENTS",
    library: "Skill library",
    import: "＋ Import a Skill",
    synthetic:
      "Four original examples to start.<br>Your own skills stay on this device.",
    playground: "THE PLAYGROUND",
    collision: "A spark starts here.",
    rule: "Rule-based · no model needed",
    first: "01 · START WITH",
    second: "02 · BRING IN",
    goalLabel: "What would you like to make?",
    hint: "A small experiment. A new direction.",
    collide: "Create a spark",
    cancel: "Cancel",
    emptyTitle: "Room for something new.",
    emptyBody:
      "Your connection, missing pieces and next steps will appear here.",
    gardenOver: "IDEAS WITH ROOTS",
    garden: "Your growing collection",
    gardenNote: "Every spark remembers where it began.",
    footer: "Let skills meet, collide, and grow.",
    studioNote: "Companion Studio · same engine as the DSH tools",
    importTitle: "Bring your own Skill",
    importHelp:
      "Paste JSON to import, or preview SKILL.md and review its contract. Content stays local and never executes.",
    importSubmit: "Import locally",
    search: "Find a skill…",
    defaultGoal: "Turn research into an accessible prototype people can test.",
    nothing: "No matching skills.",
    ready: "Declared contracts connect",
    gap: "A bridge is needed",
    handoff: "Handoff",
    missing: "Missing inputs",
    none: "No matching contract",
    constraints: "Source constraints & review checks",
    save: "Save this spark",
    saved: "Saved locally",
    grow: "Grow a Skill",
    download: "Export SKILL.md",
    grown: "New Skill added to your library. It is an unverified draft.",
    noHistory: "No saved sparks yet. Start with a small experiment.",
    open: "Open spark",
    working: "Finding the connection…",
    cancelled: "Collision cancelled.",
    imported: "Skill imported locally.",
    start: "Use as A",
    end: "Use as B",
    runError: "Could not complete this operation.",
    source: "Source",
    draft: "Unverified draft",
  },
  zh: {
    sourceDocument: "资料原文 · 留在这台设备上",
    contractConstraints: "约束",
    importFormat: "资料格式",
    importFile: "打开本地文件 · 最大 64 KB",
    importPreview: "预览技能契约",
    reviewTitle: "看清每一个连接点",
    reviewHelp:
      "每个文本框代表一项，请补全缺失契约。内容不会执行，只保存确认后的字段。",
    unmapped: "未映射的内容 · 不会保存",
    confirmReview: "我已核对契约和未映射内容。",
    addItem: "添加一项",
    id: "技能编号",
    name: "显示名称",
    description: "技能描述",
    inputs: "输入",
    outputs: "输出",
    steps: "步骤",
    tags: "标签",
    parents: "父级编号",
    importTooLarge: "文件不能超过 64 KB。",
    previewRequired: "请先预览并确认当前资料。",

    local: "本地运行，自在探索",
    headline: "让技能相遇，<br>让可能性生长。",
    intro:
      "把两个 Skill 放在一起，发现彼此的连接。<br>从一个小小的闪光，长出值得尝试的新方向。",
    tag1: "本地优先",
    tag2: "来源可追溯",
    tag3: "为组合而生",
    collection: "灵感的原料",
    library: "Skill 资料库",
    import: "＋ 导入一个 Skill",
    synthetic: "从四个原创示例开始。<br>你导入的技能，保存在这台设备上。",
    playground: "碰撞实验室",
    collision: "一个闪光，从这里开始。",
    rule: "本地规则 · 无需模型",
    first: "01 · 从这里出发",
    second: "02 · 带来新可能",
    goalLabel: "这一次，你想做出什么？",
    hint: "一次小实验，一个新方向。",
    collide: "让灵感碰撞",
    cancel: "取消",
    emptyTitle: "给新的可能，留一点空间。",
    emptyBody: "交接点、待补条件与行动步骤，将在这里呈现。",
    gardenOver: "让想法扎根",
    garden: "正在生长的灵感",
    gardenNote: "每个闪光，都记得它的来处。",
    footer: "让 Skill 相遇、碰撞、生长。",
    studioNote: "独立体验工作室 · 与 DSH 工具共用核心",
    importTitle: "带入你的 Skill",
    importHelp:
      "粘贴 JSON，或预览 SKILL.md 并核对契约。内容留在本地，不会执行。",
    importSubmit: "导入到本地",
    search: "寻找一个技能…",
    defaultGoal: "把用户研究变成可供体验的无障碍交互原型。",
    nothing: "没有匹配的技能。",
    ready: "声明的契约已连接",
    gap: "还需要一座桥",
    handoff: "交接点",
    missing: "待补输入",
    none: "暂无匹配契约",
    constraints: "来源约束与验收检查",
    save: "保存这个闪光",
    saved: "已保存到本地",
    grow: "生长为新 Skill",
    download: "导出 SKILL.md",
    grown: "新 Skill 已加入资料库，状态为未验证草案。",
    noHistory: "还没有保存的闪光。从一次小实验开始吧。",
    open: "打开闪光",
    working: "正在寻找连接…",
    cancelled: "已取消碰撞。",
    imported: "Skill 已导入本地。",
    start: "设为 A",
    end: "设为 B",
    runError: "本次操作未能完成。",
    source: "来源",
    draft: "未验证草案",
  },
};
let lang = "en",
  state = { skills: [], history: [] },
  result,
  saved = false,
  grown,
  controller,
  toastTimer;
const t = (key) => copy[lang][key];
const token = document.querySelector('meta[name="spark-token"]').content;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
async function api(path, body, signal) {
  const response = await fetch(
    `/api/${path}`,
    body === undefined
      ? { signal }
      : {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Spark-Token": token,
          },
          body: JSON.stringify(body),
          signal,
        },
  );
  const data = await response.json();
  if (!response.ok) throw Error(data.message || data.error || t("runError"));
  return data;
}
function notify(message) {
  clearTimeout(toastTimer);
  $("status").textContent = message;
  toastTimer = setTimeout(() => ($("status").textContent = ""), 4500);
}
function translate() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  for (const el of document.querySelectorAll("[data-i18n]"))
    el.innerHTML = t(el.dataset.i18n);
  $("language").textContent = lang === "en" ? "中文" : "English";
  $("search").placeholder = t("search");
  $("search").setAttribute("aria-label", t("search"));
  renderLibrary();
  renderHistory();
  if (result) renderResult();
}
function options() {
  const a = $("first").value,
    b = $("second").value;
  for (const id of ["first", "second"])
    $(id).innerHTML = state.skills
      .map((s) => `<option value="${escape(s.id)}">${escape(s.name)}</option>`)
      .join("");
  $("first").value = state.skills.some((s) => s.id === a)
    ? a
    : "research-synthesis";
  $("second").value = state.skills.some((s) => s.id === b)
    ? b
    : "prototype-builder";
  if (!$("first").value) $("first").selectedIndex = 0;
  if (!$("second").value)
    $("second").selectedIndex = Math.min(1, state.skills.length - 1);
  contracts();
}
function contracts() {
  const a = state.skills.find((s) => s.id === $("first").value),
    b = state.skills.find((s) => s.id === $("second").value);
  $("first-output").textContent = a ? `↗ ${a.outputs.join(" · ")}` : "";
  $("second-input").textContent = b ? `↳ ${b.inputs.join(" · ")}` : "";
  $("collide").disabled =
    !a || !b || a.id === b.id || !$("goal").value.trim() || !!controller;
}
function renderLibrary() {
  const query = $("search").value.trim().toLowerCase();
  const found = state.skills.filter((s) =>
    [s.name, s.description, ...s.tags].join(" ").toLowerCase().includes(query),
  );
  $("count").textContent = state.skills.length;
  $("skills").innerHTML = found.length
    ? found
        .map((s) => {
          const selected =
            s.id === $("first").value
              ? "A"
              : s.id === $("second").value
                ? "B"
                : "";
          return `<article class="skill-card ${selected ? "selected" : ""}"><div class="skill-top"><span class="skill-glyph" aria-hidden="true">${s.parents.length ? "✦" : "◇"}</span><span>${selected ? `SLOT ${selected}` : s.parents.length ? "GROWN" : "SKILL"}</span></div><h3>${escape(s.name)}</h3><p>${escape(s.tags.slice(0, 2).join(" / "))}</p><div class="skill-actions"><button data-use="first" data-id="${escape(s.id)}" aria-label="${escape(t("start") + " · " + s.name)}">${t("start")}</button><button data-use="second" data-id="${escape(s.id)}" aria-label="${escape(t("end") + " · " + s.name)}">${t("end")}</button></div></article>`;
        })
        .join("")
    : `<p class="subtle">${t("nothing")}</p>`;
}
function renderHistory() {
  $("history").innerHTML = state.history.length
    ? state.history
        .map(
          (r) =>
            `<article class="history-card"><span class="overline">✦ ${escape(r.id.slice(6, 14))}</span><p><strong>${escape(r.title)}</strong></p><p>${escape(r.goal)}</p><button class="quiet" data-open="${escape(r.id)}">${t("open")} ↗</button></article>`,
        )
        .join("")
    : `<div class="history-empty">${t("noHistory")}</div>`;
}
function renderResult() {
  if (!result) return;
  $("empty-result").hidden = true;
  $("result").hidden = false;
  $("result").innerHTML =
    `<div class="result-header"><h3 id="result-title">${escape(result.title)}</h3><span class="match ${result.gaps.length ? "gap" : ""}">${t(result.gaps.length ? "gap" : "ready")}</span></div><p class="disclaimer">${escape(result.disclaimer)}</p><div class="handoff"><strong>${t("handoff")}</strong> · ${escape(result.handoffs.join(" → ") || t("none"))}${result.gaps.length ? `<br><strong>${t("missing")}</strong> · ${escape(result.gaps.join(" · "))}` : ""}</div><ol class="plan">${result.plan.map((p) => `<li>${escape(p)}</li>`).join("")}</ol><details><summary>${t("constraints")}</summary><ul>${result.constraints.map((c) => `<li><strong>${escape(c.skillId)}</strong> · ${escape(c.text)}</li>`).join("")}${result.checks.map((c) => `<li>${escape(c)}</li>`).join("")}</ul></details><div class="result-buttons"><button id="save" class="primary" ${saved ? "disabled" : ""}>${t(saved ? "saved" : "save")}</button><button id="grow" class="quiet" ${!saved || grown ? "disabled" : ""}>${t("grow")} ↗</button>${grown ? `<button id="download" class="quiet">${t("download")} ↓</button>` : ""}</div>`;
}
function busy(value) {
  $("first").disabled = value;
  $("second").disabled = value;
  $("goal").disabled = value;
  $("cancel").hidden = !value;
  $("hint").textContent = t(value ? "working" : "hint");
  $("stage").classList.toggle("running", value);
  contracts();
}
function cancel() {
  if (controller) {
    controller.abort();
    controller = undefined;
    busy(false);
  }
}
function invalidate() {
  cancel();
  result = undefined;
  saved = false;
  grown = undefined;
  $("result").hidden = true;
  $("empty-result").hidden = false;
  contracts();
  renderLibrary();
}
async function refresh() {
  state = await api("state");
  options();
  renderLibrary();
  renderHistory();
}
async function run() {
  if (controller) return;
  const snapshot = {
    first: $("first").value,
    second: $("second").value,
    goal: $("goal").value,
    language: lang,
  };
  result = undefined;
  grown = undefined;
  saved = false;
  $("result").hidden = true;
  $("empty-result").hidden = false;
  const current = new AbortController();
  controller = current;
  busy(true);
  try {
    const animation = new Promise((resolve) => {
      const timer = setTimeout(resolve, reduced.matches ? 0 : 820);
      current.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
    });
    const [data] = await Promise.all([
      api("collide", snapshot, current.signal),
      animation,
    ]);
    if (controller !== current || current.signal.aborted) return;
    result = data.collision;
    saved = state.history.some((r) => r.id === result.id);
    renderResult();
    $("result").classList.remove("reveal");
    void $("result").offsetWidth;
    $("result").classList.add("reveal");
  } catch (error) {
    if (!current.signal.aborted) notify(error.message);
  } finally {
    if (controller === current) {
      controller = undefined;
      busy(false);
    }
  }
}
$("collide").addEventListener("click", run);
$("cancel").addEventListener("click", () => {
  cancel();
  notify(t("cancelled"));
});
for (const id of ["first", "second"])
  $(id).addEventListener("change", invalidate);
$("goal").addEventListener("input", invalidate);
$("search").addEventListener("input", renderLibrary);
$("language").addEventListener("click", () => {
  cancel();
  const old = t("defaultGoal");
  lang = lang === "en" ? "zh" : "en";
  if ($("goal").value === old) $("goal").value = t("defaultGoal");
  invalidate();
  translate();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancel();
});
window.addEventListener("pagehide", cancel);
document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.use) {
    $(button.dataset.use).value = button.dataset.id;
    invalidate();
  }
  if (button.dataset.open) {
    cancel();
    result = state.history.find((r) => r.id === button.dataset.open);
    saved = true;
    grown = undefined;
    renderResult();
    $("result").scrollIntoView({
      behavior: reduced.matches ? "instant" : "smooth",
      block: "nearest",
    });
  }
  if (button.id === "save" && result) {
    button.disabled = true;
    const snapshot = result;
    try {
      await api("save", {
        first: snapshot.parents[0].id,
        second: snapshot.parents[1].id,
        goal: snapshot.goal,
        language: snapshot.language,
      });
      if (result === snapshot) {
        saved = true;
        renderResult();
      }
      await refresh();
      notify(t("saved"));
    } catch (error) {
      notify(error.message);
      if (result === snapshot) button.disabled = false;
    }
  }
  if (button.id === "grow" && result && saved) {
    button.disabled = true;
    const snapshot = result;
    try {
      const name =
        `${snapshot.parents[0].name} + ${snapshot.parents[1].name}`.slice(
          0,
          120,
        );
      const data = await api("grow", { id: snapshot.id, name });
      if (result === snapshot) {
        grown = data;
        renderResult();
      }
      await refresh();
      notify(t("grown"));
    } catch (error) {
      notify(error.message);
      if (result === snapshot) button.disabled = false;
    }
  }
  if (button.id === "download" && grown) {
    const url = URL.createObjectURL(
      new Blob([grown.markdown], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "SKILL.md";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});
let importRevision = 0,
  reviewedSource,
  fileRevision = 0;
const arrayFields = [
  "inputs",
  "outputs",
  "steps",
  "constraints",
  "tags",
  "parents",
];
function updateImportGate() {
  $("import-save").disabled =
    $("import-format").value === "markdown" &&
    (reviewedSource !== $("import-json").value || !$("import-confirm").checked);
}
function invalidateImport() {
  importRevision++;
  reviewedSource = undefined;
  $("import-source").open = true;
  $("contract-fields").replaceChildren();
  $("import-review").hidden = true;
  $("import-confirm").checked = false;
  $("import-error").textContent = "";
  $("import-preview").hidden = $("import-format").value !== "markdown";
  $("import-preview").disabled = false;
  $("import-json").setAttribute(
    "aria-label",
    $("import-format").value === "markdown" ? "SKILL.md" : "Skill JSON",
  );
  updateImportGate();
}
const fieldLabel = (field) =>
  t(field === "constraints" ? "contractConstraints" : field);
function addContractItem(field, value = "") {
  const container = $("contract-" + field);
  const index = container.querySelectorAll("textarea").length;
  if (index >= 32 && !value) return;
  const label = document.createElement("label");
  label.textContent = `${fieldLabel(field)} ${index + 1}`;
  const input = document.createElement("textarea");
  input.rows = 2;
  input.maxLength = 500;
  input.value = value;
  input.dataset.field = field;
  label.append(input);
  container.append(label);
}
function showImportPreview(data) {
  $("import-warnings").textContent = [
    ...data.warnings,
    data.validationError || "",
  ]
    .filter(Boolean)
    .join("\n");
  $("import-unparsed").textContent = data.unparsed
    .map((item) => `${item.line}: ${item.text}`)
    .join("\n");
  $("unmapped-details").hidden = !data.unparsed.length;
  const fields = $("contract-fields");
  fields.replaceChildren();
  for (const field of ["id", "name", "description"]) {
    const label = document.createElement("label");
    label.textContent = t(field);
    const input = document.createElement(
      field === "description" ? "textarea" : "input",
    );
    input.id = "contract-" + field;
    input.value = data.draft[field];
    input.required = true;
    input.maxLength = field === "id" ? 80 : field === "name" ? 120 : 2000;
    label.append(input);
    fields.append(label);
  }
  for (const field of arrayFields) {
    const group = document.createElement("fieldset");
    group.dataset.field = field;
    const legend = document.createElement("legend");
    legend.textContent = fieldLabel(field);
    const container = document.createElement("div");
    container.id = "contract-" + field;
    const add = document.createElement("button");
    add.type = "button";
    add.className = "quiet";
    add.textContent = `${t("addItem")} · ${fieldLabel(field)}`;
    add.addEventListener("click", () => {
      addContractItem(field);
      $("import-confirm").checked = false;
      updateImportGate();
    });
    group.append(legend, container, add);
    fields.append(group);
    for (const value of data.draft[field].length
      ? data.draft[field]
      : ["inputs", "outputs", "steps"].includes(field)
        ? [""]
        : [])
      addContractItem(field, value);
  }
  $("import-confirm").checked = false;
  $("import-review").hidden = false;
  $("import-source").open = false;
  updateImportGate();
  $("contract-id").focus();
}
$("import-open").addEventListener("click", () => {
  invalidateImport();
  $("import-dialog").showModal();
});
$("import-close").addEventListener("click", () => $("import-dialog").close());
$("import-dialog").addEventListener("close", () => {
  fileRevision++;
  invalidateImport();
});
$("import-json").addEventListener("input", () => {
  fileRevision++;
  invalidateImport();
});
$("import-format").addEventListener("change", () => {
  fileRevision++;
  invalidateImport();
});
$("import-confirm").addEventListener("change", updateImportGate);
$("contract-fields").addEventListener("input", () => {
  $("import-confirm").checked = false;
  updateImportGate();
});
$("import-file").addEventListener("change", async () => {
  const file = $("import-file").files[0];
  const revision = ++fileRevision;
  invalidateImport();
  if (!file) return;
  try {
    if (file.size > 64000) throw Error(t("importTooLarge"));
    const source = await file.text();
    if (revision !== fileRevision) return;
    $("import-format").value = /\.json$/i.test(file.name) ? "json" : "markdown";
    $("import-json").value = source;
    invalidateImport();
  } catch (error) {
    if (revision === fileRevision)
      $("import-error").textContent = error.message;
  } finally {
    $("import-file").value = "";
  }
});
$("import-preview").addEventListener("click", async () => {
  invalidateImport();
  const revision = importRevision,
    source = $("import-json").value;
  $("import-preview").disabled = true;
  try {
    const data = await api("import-preview", { markdown: source });
    if (revision !== importRevision) return;
    reviewedSource = source;
    showImportPreview(data);
  } catch (error) {
    if (revision === importRevision)
      $("import-error").textContent = error.message;
  } finally {
    if (revision === importRevision) $("import-preview").disabled = false;
  }
});
$("import-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if ($("import-controls").disabled) return;
  let json = $("import-json").value;
  if ($("import-format").value === "markdown") {
    if (reviewedSource !== json || !$("import-confirm").checked) {
      $("import-error").textContent = t("previewRequired");
      return;
    }
    const skill = {};
    for (const field of ["id", "name", "description"])
      skill[field] = $("contract-" + field).value;
    for (const field of arrayFields)
      skill[field] = [...$("contract-" + field).querySelectorAll("textarea")]
        .map((input) => input.value)
        .filter((value) => value.trim());
    json = JSON.stringify(skill);
  }
  const revision = importRevision;
  $("import-controls").disabled = true;
  $("import-error").textContent = "";
  try {
    await api("import", { json });
    if (revision === importRevision) {
      $("import-dialog").close();
      $("import-json").value = "";
    }
    notify(t("imported"));
    await refresh();
  } catch (error) {
    if (revision === importRevision)
      $("import-error").textContent = error.message;
    else notify(error.message);
  } finally {
    $("import-controls").disabled = false;
    updateImportGate();
  }
});

try {
  await refresh();
  translate();
} catch (error) {
  notify(error.message);
  $("collide").disabled = true;
}
