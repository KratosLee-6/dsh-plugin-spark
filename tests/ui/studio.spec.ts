import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
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
  await page.screenshot({
    path: "docs/screenshots/studio-en.png",
    fullPage: true,
    animations: "disabled",
  });
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
  await page.screenshot({
    path: "docs/screenshots/collision-zh.png",
    fullPage: true,
    animations: "disabled",
  });
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
  await page.screenshot({
    path: "docs/screenshots/mobile-en.png",
    fullPage: true,
    animations: "disabled",
  });
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
