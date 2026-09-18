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
      "Paste a structured Skill JSON. Imported instructions are stored as data, never executed.",
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
    importHelp: "粘贴结构化 Skill JSON。技能内容只作为资料保存，不会自动执行。",
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
$("import-open").addEventListener("click", () => {
  $("import-error").textContent = "";
  $("import-dialog").showModal();
});
$("import-close").addEventListener("click", () => $("import-dialog").close());
$("import-json").placeholder = JSON.stringify(
  {
    id: "my-skill",
    name: "My Skill",
    description: "What this skill does",
    inputs: ["evidence-brief"],
    outputs: ["action-plan"],
    steps: ["Review the brief", "Write an action plan"],
    constraints: ["Use permitted material"],
    tags: ["planning"],
  },
  null,
  2,
);
$("import-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    await api("import", { json: $("import-json").value });
    await refresh();
    $("import-dialog").close();
    $("import-json").value = "";
    notify(t("imported"));
  } catch (error) {
    $("import-error").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
try {
  await refresh();
  translate();
} catch (error) {
  notify(error.message);
  $("collide").disabled = true;
}
