import { expect, test, type Page } from "@playwright/test";

async function scrollToStage(page: Page, project: "venfour" | "imposter") {
  await page.evaluate((name) => {
    const screen = document.querySelector<HTMLElement>(`.project--${name} .project-screen`)!;
    const stage = screen.querySelector<HTMLElement>(".project-stage")!;
    const top = screen.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (screen.offsetHeight - stage.offsetHeight) * .5, behavior: "instant" });
  }, project);
}

async function frameAt(page: Page, top: number) {
  await page.evaluate((position) => window.scrollTo({ top: position, behavior: "instant" }), top);
  const readFrame = () => page.locator(".continuity-frame").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, opacity: Number(style.opacity) };
  });
  let previous: Awaited<ReturnType<typeof readFrame>> | undefined;
  let stableSamples = 0;
  await expect.poll(async () => {
    const current = await readFrame();
    const settled = previous && ["x", "y", "width", "height"].every((key) =>
      Math.abs(current[key as keyof typeof current] - previous![key as keyof typeof current]) < .2,
    );
    stableSamples = settled ? stableSamples + 1 : 0;
    previous = current;
    return stableSamples;
  }, { intervals: [120], timeout: 4000 }).toBeGreaterThanOrEqual(2);
  return readFrame();
}

test("carries one visible artwork continuously between projects and reverses it", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".continuous-artwork")).toHaveCSS("pointer-events", "none");
  await expect(page.locator(".continuous-artwork")).toHaveAttribute("aria-hidden", "true");

  await scrollToStage(page, "venfour");
  await expect(page.locator(".continuity-browser")).toHaveCSS("opacity", "1");
  await expect(page.locator(".continuity-card")).toHaveCSS("opacity", "0");
  const venfourBackground = await page.locator(".continuous-backdrop").evaluate((element) => getComputedStyle(element).backgroundColor);

  const positions = await page.evaluate(() => {
    const outgoing = document.querySelector<HTMLElement>(".project--venfour .project-screen")!;
    const incoming = document.querySelector<HTMLElement>(".project--imposter .project-screen")!;
    const outgoingEnd = outgoing.getBoundingClientRect().top + window.scrollY + outgoing.offsetHeight - outgoing.querySelector<HTMLElement>(".project-stage")!.offsetHeight;
    const incomingStart = incoming.getBoundingClientRect().top + window.scrollY;
    return [outgoingEnd, (outgoingEnd + incomingStart) / 2, incomingStart];
  });

  for (const position of positions) {
    const before = await frameAt(page, position - 2);
    const after = await frameAt(page, position + 2);
    expect(before.opacity).toBeGreaterThan(.2);
    expect(after.opacity).toBeGreaterThan(.2);
    expect(before.width).toBeGreaterThan(12);
    expect(before.height).toBeGreaterThan(12);
    for (const dimension of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(after[dimension] - before[dimension]), `Artwork ${dimension} jumps at scroll position ${position}`).toBeLessThan(24);
    }
  }

  await scrollToStage(page, "imposter");
  await expect(page.locator(".continuity-card")).toHaveCSS("opacity", "1");
  await expect(page.locator(".continuity-browser")).toHaveCSS("opacity", "0");
  const imposterBackground = await page.locator(".continuous-backdrop").evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(imposterBackground).not.toBe(venfourBackground);
  await expect(page.locator(".continuity-card-left")).toBeVisible();
  await expect(page.locator(".continuity-card-right")).toBeVisible();

  await scrollToStage(page, "venfour");
  await expect(page.locator(".continuity-browser")).toHaveCSS("opacity", "1");
  await expect(page.locator(".continuity-card")).toHaveCSS("opacity", "0");
  await expect(page.locator(".continuous-backdrop")).toHaveCSS("background-color", venfourBackground);
});

test("preserves artwork, navigation, and layout when the continuous view changes", async ({ page }) => {
  await page.goto("/#imposter");
  await expect(page.locator("#imposter-title")).toBeInViewport();
  await scrollToStage(page, "imposter");
  await expect(page.locator(".continuity-card")).toHaveCSS("opacity", "1");

  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator(".continuous-artwork")).toHaveCSS("display", "none");
  await expect(page.locator(".continuous-backdrop")).toHaveCSS("display", "none");
  await expect(page.locator(".imposter-stage .project-depth")).toHaveCSS("visibility", "visible");
  await expect(page.locator(".imposter-poster--center img")).toBeVisible();

  await page.getByRole("button", { name: "Enable animations" }).click();
  const details = page.locator("#venfour details");
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await scrollToStage(page, "imposter");
  await expect(page.locator(".continuity-card")).toHaveCSS("opacity", "1");

  const originalViewport = page.viewportSize()!;
  await page.setViewportSize({ width: originalViewport.width - 24, height: originalViewport.height - 32 });
  await scrollToStage(page, "imposter");
  await expect(page.locator(".continuity-card")).toHaveCSS("opacity", "1");
  await expect(page.locator(".continuity-frame")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator(".continuous-artwork")).toHaveCSS("display", "none");
  await expect(page.locator(".continuous-backdrop")).toHaveCSS("display", "none");
  await expect(page.locator(".imposter-stage .project-depth")).toHaveCSS("visibility", "visible");
  await expect(page.locator("#imposter-title")).toBeInViewport();

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.reload();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  await expect(page.locator(".continuous-artwork")).toHaveCSS("display", "none");
  await expect(page.locator(".continuous-backdrop")).toHaveCSS("display", "none");
  await expect(page.locator(".imposter-stage .project-depth")).toHaveCSS("visibility", "visible");
  await expect(page.locator("#imposter-title")).toBeInViewport();
});
