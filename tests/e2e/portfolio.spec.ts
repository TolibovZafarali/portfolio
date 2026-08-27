import { expect, test } from "@playwright/test";

const sceneIds = ["top", "plane", "type", "route", "operations", "close"] as const;

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("renders the complete semantic one-page structure", async ({ page }) => {
  await expect(page).toHaveTitle("Portfolio — Motion Prototype");
  await expect(page.getByRole("heading", { level: 1, name: "Portfolio" })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
  await expect(page.getByRole("navigation", { name: "Scene index" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return / top" })).toBeAttached();

  const anchorsResolve = await page.locator('a[href^="#"]').evaluateAll((anchors) =>
    anchors.every((anchor) => {
      const target = anchor.getAttribute("href");
      return Boolean(target && document.querySelector(target));
    }),
  );

  expect(anchorsResolve).toBe(true);
});

test("keeps every scene readable without horizontal overflow", async ({ page }) => {
  for (const sceneId of sceneIds) {
    await page.locator(`#${sceneId}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("transforms the opening through native scrolling", async ({ page }) => {
  const site = page.locator(".site");
  const leadPanel = page.locator('[data-hero-panel="lead"]');
  const initialTransform = await leadPanel.evaluate((element) => getComputedStyle(element).transform);

  await expect(site).toHaveAttribute("data-motion", "ready");
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.42, behavior: "instant" }));
  await page.waitForTimeout(750);

  const transformed = await leadPanel.evaluate((element) => getComputedStyle(element).transform);
  expect(transformed).not.toBe(initialTransform);

  const progressScale = await page
    .locator("[data-page-progress]")
    .evaluate((element) => getComputedStyle(element).transform);
  expect(progressScale).not.toBe("none");
});

test("provides a deliberate reduced-motion presentation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
  await page.locator("#type").scrollIntoViewIfNeeded();

  const state = await page.evaluate(() => ({
    pinPosition: getComputedStyle(document.querySelector<HTMLElement>(".scene__pin")!).position,
    routeClip: getComputedStyle(
      document.querySelector<HTMLElement>("[data-route-aperture]")!,
    ).clipPath,
    progressVisible: getComputedStyle(
      document.querySelector<HTMLElement>(".page-progress")!,
    ).display,
    typeLabelColor: getComputedStyle(
      document.querySelector<HTMLElement>("#type .scene-label")!,
    ).color,
    typeLabelBackground: getComputedStyle(
      document.elementFromPoint(
        document.querySelector<HTMLElement>("#type .scene-label")!.getBoundingClientRect().left,
        document.querySelector<HTMLElement>("#type .scene-label")!.getBoundingClientRect().top,
      )!,
    ).backgroundColor,
  }));

  expect(state.pinPosition).toBe("relative");
  expect(state.routeClip).toBe("none");
  expect(state.progressVisible).toBe("none");
  expect(state.typeLabelColor).not.toBe(state.typeLabelBackground);
});

test("supports keyboard entry and a functional closing return", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to selected structures" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#project-index$/);

  await page.getByRole("link", { name: "05 — Closure" }).click();
  await expect(page).toHaveURL(/#close$/);
  await page.getByRole("link", { name: "Return / top" }).click();
  await expect(page).toHaveURL(/#top$/);
});

test("runs without runtime exceptions or console errors", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(message.text());
  });

  await page.reload();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(750);

  expect(failures).toEqual([]);
});
