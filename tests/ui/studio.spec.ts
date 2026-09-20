import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";

// Capture within a document-sized viewport: avoids Edge's beyond-viewport capture failure.
// Restore the test viewport so evidence generation does not change later interaction assertions.
async function captureDocument(page: Page, path: string) {
  const viewport = page.viewportSize()!;
  const height = await page.evaluate(() =>
    Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
  );
  try {
    await page.setViewportSize({ width: viewport.width, height });
    await page.screenshot({ path, animations: "disabled" });
  } finally {
    await page.setViewportSize(viewport);
  }
}

test("desktop bilingual collision, save, grow and export; local resources only", async ({
  page,
}) => {
  const failures: string[] = [],
    external: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  await page.route("**/*", (route) => {
    if (new URL(route.request().url()).hostname !== "127.0.0.1") {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/");
  await expect(page.locator(".skill-card").first()).toBeVisible();
  mkdirSync("docs/screenshots", { recursive: true });
  await captureDocument(page, "docs/screenshots/studio-en.png");
  await page.getByRole("button", { name: "Create a spark" }).click();
  await expect(page.locator("#stage")).toHaveClass(/running/);
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#result")).toContainText("evidence-brief");
  await page.locator("#save").click();
  await expect(page.locator("#save")).toBeDisabled();
  await page.locator("#grow").click();
  await expect(page.locator("#download")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.locator("#download").click();
  expect((await download).suggestedFilename()).toBe("SKILL.md");
  await page.reload();
  await expect(page.locator(".history-card").first()).toBeVisible();
  await page.locator("#language").click();
  await page.locator("#collide").click();
  await expect(page.locator("#result")).toContainText("确定性规则草案");
  await captureDocument(page, "docs/screenshots/collision-zh.png");
  expect(external).toEqual([]);
  expect(failures).toEqual([]);
});
test("cancellation, duplicate prevention and reduced-motion result", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#collide").click();
  await page.locator("#cancel").click();
  await expect(page.locator("#result")).toBeHidden();
  await expect(page.locator("#stage")).not.toHaveClass(/running/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#collide").click();
  await expect(page.locator("#result")).toBeVisible();
  await page.locator("#second").selectOption("research-synthesis");
  await expect(page.locator("#collide")).toBeDisabled();
});
test("mobile layout, gap disclosure and escaped imported content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#second").selectOption("release-story");
  await page.locator("#collide").click();
  await expect(page.locator("#result")).toContainText("verified-results");
  await expect(page.locator("#result")).toContainText("A bridge is needed");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await captureDocument(page, "docs/screenshots/mobile-en.png");
  await page.locator("#import-open").click();
  await page.locator("#import-json").fill(
    JSON.stringify({
      id: "ui-inert",
      name: "<img src=x onerror=alert(1)>",
      description: "Synthetic test",
      inputs: ["brief"],
      outputs: ["plan"],
      steps: ["Keep as text"],
      constraints: [],
      tags: [],
    }),
  );
  await page.getByRole("button", { name: "Import locally" }).click();
  await expect(page.locator("#import-dialog")).not.toBeVisible();
  await page.locator("#search").fill("<img");
  await expect(page.locator(".skill-card")).toHaveCount(1);
  await expect(page.locator(".skill-card img")).toHaveCount(0);
});
test("keyboard dialog dismiss and save failure never reports success", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#import-open").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#import-dialog")).toBeHidden();
  await page.locator("#goal").fill("Unique failed-save scenario");
  await page.locator("#collide").click();
  await expect(page.locator("#result")).toBeVisible();
  await page.route("**/api/save", (r) =>
    r.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error: "STORAGE_ERROR",
        message: "Test write failure",
      }),
    }),
  );
  await page.locator("#save").click();
  await expect(page.locator("#status")).toContainText("Test write failure");
  await expect(page.locator("#save")).toBeEnabled();
  await expect(page.locator("#grow")).toBeDisabled();
});
test("WCAG A/AA automated checks on the workspace, result and import dialog", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const state of ["workspace", "result", "dialog"]) {
    if (state === "result") {
      await page.locator("#collide").click();
      await expect(page.locator("#result")).toBeVisible();
    }
    if (state === "dialog") await page.locator("#import-open").click();
    const report = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      report.violations.map((v) => ({
        id: v.id,
        help: v.help,
        nodes: v.nodes.map((n) => n.target),
      })),
      state,
    ).toEqual([]);
  }
});
test("Markdown file preview, reviewed contracts, duplicate safety and bilingual screenshot", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#language").click();
  await page.locator("#import-open").click();
  await page
    .locator("#import-file")
    .setInputFiles("examples/reviewable-skill.md");
  await expect(page.locator("#import-format")).toHaveValue("markdown");
  await expect(page.locator("#import-save")).toBeDisabled();
  await page.locator("#import-preview").click();
  await expect(page.locator("#import-review")).toBeVisible();
  await expect(page.locator("#import-warnings")).toContainText("不会保存");
  await page.locator("#unmapped-details summary").click();
  await expect(page.locator("#import-unparsed")).toContainText("allowed-tools");
  await page.locator("#contract-inputs textarea").fill("evidence-brief");
  await page.locator("#contract-outputs textarea").fill("action-plan");
  await page.locator("#import-confirm").check();
  await page.locator("#contract-name").fill("证据审阅");
  await expect(page.locator("#import-confirm")).not.toBeChecked();
  await expect(page.locator("#import-save")).toBeDisabled();
  await page.locator("#import-confirm").check();
  await page.locator("#import-dialog").evaluate((el) => (el.scrollTop = 0));
  await expect(page.locator("#import-title")).toBeInViewport();
  await page
    .locator("#import-dialog")
    .screenshot({ path: "docs/screenshots/import-review-zh.png" });
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.locator("#import-save").click();
  await expect(page.locator("#import-dialog")).toBeHidden();
  await page.reload();
  await page.locator("#search").fill("证据审阅");
  await expect(page.locator(".skill-card")).toHaveCount(1);
  await page.locator("#second").selectOption("evidence-review");
  await page.locator("#collide").click();
  await expect(page.locator("#result")).toContainText("evidence-brief");
});

test("mobile Markdown preview stays inert and source edits invalidate review", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#import-open").click();
  await page.locator("#import-format").selectOption("markdown");
  const source =
    "---\nname: ui-markdown\ndescription: Read only\n---\n# <img src=x onerror=alert(1)>\n## Inputs\n- brief\n## Outputs\n- plan\n## Steps\n- Read\n## Unknown\n<script>alert(1)</script>";
  await page.locator("#import-json").fill(source);
  await page.locator("#import-preview").click();
  await expect(page.locator("#import-review")).toBeVisible();
  await expect(page.locator("#contract-name")).toHaveValue(
    "<img src=x onerror=alert(1)>",
  );
  await expect(
    page.locator("#import-review img, #import-review script"),
  ).toHaveCount(0);
  await page.locator("#import-confirm").check();
  await page.locator("#import-source summary").click();
  await page.locator("#import-json").fill(source + "\nChanged");
  await expect(page.locator("#import-review")).toBeHidden();
  await expect(page.locator("#import-save")).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.route("**/api/import-preview", async (route) => {
    await page.locator("#import-json").fill("# A newer source");
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ message: "stale failure" }),
    });
  });
  await page.locator("#import-preview").click();
  await expect(page.locator("#import-error")).toBeEmpty();
  await expect(page.locator("#import-save")).toBeDisabled();
});
test("Markdown save errors preserve review, and switching format removes obsolete validation", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#import-open").click();
  await page.locator("#import-file").setInputFiles({
    name: "oversized.md",
    mimeType: "text/markdown",
    buffer: Buffer.alloc(64001, 65),
  });
  await expect(page.locator("#import-error")).toContainText("64 KB");
  await page.locator("#import-format").selectOption("markdown");
  await page
    .locator("#import-json")
    .fill(
      "---\nname: evidence-planner\ndescription: Turn a brief into an evidence-led action plan.\n---\n# Evidence Planner\n## Inputs\n- brief\n## Outputs\n- plan\n## Steps\n- Review evidence",
    );
  await page.locator("#import-preview").click();
  await expect(page.locator("#import-review")).toBeVisible();
  await page.locator("#import-dialog").evaluate((el) => (el.scrollTop = 0));
  await page
    .locator("#import-dialog")
    .screenshot({ path: "docs/screenshots/import-review-en.png" });
  await page.locator("#import-confirm").check();
  await page.route("**/api/import", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Synthetic save failure" }),
    }),
  );
  await page.locator("#import-save").click();
  await expect(page.locator("#import-error")).toContainText(
    "Synthetic save failure",
  );
  await expect(page.locator("#contract-id")).toHaveValue("evidence-planner");
  await expect(page.locator("#import-save")).toBeEnabled();
  await page.unroute("**/api/import");
  await page.locator("#import-source summary").click();
  await page.locator("#import-json").fill("# No metadata");
  await page.locator("#import-preview").click();
  await expect(page.locator("#contract-id")).toHaveValue("");
  await page.locator("#import-source summary").click();
  await page.locator("#import-format").selectOption("json");
  await page.locator("#import-json").fill(
    JSON.stringify({
      id: "after-review",
      name: "JSON after review",
      description: "A synthetic example",
      inputs: ["brief"],
      outputs: ["plan"],
      steps: ["Review"],
      constraints: [],
      tags: [],
    }),
  );
  await page.locator("#import-save").click();
  await expect(page.locator("#import-dialog")).toBeHidden();
});
test("a successful save stays successful when the subsequent view refresh fails", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#goal").fill("Refresh boundary audit");
  await page.locator("#collide").click();
  await expect(page.locator("#result")).toBeVisible();
  await page.route("**/api/state", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Synthetic read failure" }),
    }),
  );
  await page.locator("#save").click();
  await expect(page.locator("#status")).toContainText("Saved locally");
  await expect(page.locator("#status")).toContainText("could not refresh");
  await expect(page.locator("#save")).toBeDisabled();
  await expect(page.locator("#grow")).toBeEnabled();
  await page.unroute("**/api/state");
  await page.reload();
  await expect(page.locator("#history")).toContainText(
    "Refresh boundary audit",
  );
});

test("growth limits are disclosed before saving and remain after reopening history", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#import-open").click();
  await page.locator("#import-json").fill(
    JSON.stringify({
      id: "capacity-parent",
      name: "Capacity parent",
      description: "Synthetic 32-step boundary",
      inputs: ["brief"],
      outputs: ["evidence-brief"],
      steps: Array.from({ length: 32 }, (_, i) => `Step ${i}`),
      constraints: [],
      tags: [],
    }),
  );
  await page.locator("#import-save").click();
  await expect(page.locator("#import-dialog")).toBeHidden();
  await page.locator("#first").selectOption("capacity-parent");
  await page.locator("#collide").click();
  await expect(page.locator("#result")).toContainText("GROWTH_LIMIT");
  await page.locator("#save").click();
  await expect(page.locator("#save")).toBeDisabled();
  await expect(page.locator("#grow")).toBeDisabled();
  await page.reload();
  await page
    .locator(".history-card")
    .filter({ hasText: "Capacity parent" })
    .getByRole("button")
    .click();
  await expect(page.locator("#result")).toContainText("Nothing was truncated");
  await expect(page.locator("#grow")).toBeDisabled();
});

test("multiline display names remain literal in the preview editor and saved Skill", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#import-open").click();
  await page.locator("#import-format").selectOption("markdown");
  const name = "Literal\n## Inputs\n- not-a-contract";
  await page
    .locator("#import-json")
    .fill(
      `---\nname: literal-name\ndescription: Preserve text\ndisplay-name: ${JSON.stringify(name)}\n---\n# Literal name\n## Inputs\n- brief\n## Outputs\n- plan\n## Steps\n- Review`,
    );
  await page.locator("#import-preview").click();
  await expect(page.locator("#contract-name")).toHaveValue(name);
  await expect(page.locator("#contract-inputs textarea")).toHaveCount(1);
  await page.locator("#import-confirm").check();
  await page.locator("#import-save").click();
  await expect(page.locator("#import-dialog")).toBeHidden();
  const state = await (await page.request.get("/api/state")).json();
  expect(
    state.skills.find((s: { id: string }) => s.id === "literal-name").name,
  ).toBe(name);
});
