import { expect, test, type Page } from "@playwright/test";

async function readFrame(page: Page) {
  return page.locator(".continuity-frame").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
}

async function settleFrame(page: Page) {
  let previous: Awaited<ReturnType<typeof readFrame>> | undefined;
  let stable = 0;
  await expect.poll(async () => {
    const current = await readFrame(page);
    const unchanged = previous && (["x", "y", "width", "height"] as const)
      .every((key) => Math.abs(current[key] - previous![key]) < .15);
    stable = unchanged ? stable + 1 : 0;
    previous = current;
    return stable;
  }, { intervals: [120], timeout: 6000 }).toBeGreaterThanOrEqual(2);
  return readFrame(page);
}

test("carries exactly one visible monogram through the opening boundary without a geometry jump", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  const boundary = await page.locator(".hero-journey").evaluate((element) =>
    element.getBoundingClientRect().top + window.scrollY + (element as HTMLElement).offsetHeight
      - element.querySelector<HTMLElement>(".hero")!.offsetHeight,
  );
  const samples = [];
  for (const position of [boundary - 2, boundary + 2, boundary - 2]) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), position);
    const frame = await settleFrame(page);
    await expect(page.locator(".hero__sculpture")).toHaveCSS("opacity", "0");
    await expect(page.locator(".continuity-z")).toHaveCSS("opacity", "1");
    const visible = await page.locator(".monogram").evaluateAll((monograms) => monograms.filter((monogram) => {
      const rect = monogram.getBoundingClientRect();
      let alpha = 1;
      for (let node: Element | null = monogram; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return false;
        alpha *= Number(style.opacity);
      }
      return alpha > .01 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    }).length);
    expect(visible).toBe(1);
    const front = await page.locator(".continuity-z .monogram__face--front").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    samples.push({ frame, front });
  }
  for (const sample of samples.slice(1)) {
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(sample.frame[key] - samples[0]!.frame[key]), `Shared frame ${key} must remain continuous at the hero boundary`).toBeLessThan(14);
      expect(Math.abs(sample.front[key] - samples[0]!.front[key]), `Visible monogram ${key} must remain continuous at the hero boundary`).toBeLessThan(14);
    }
  }
});
