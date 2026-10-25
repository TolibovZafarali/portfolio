import { expect, test, type Page } from "@playwright/test";

async function centerElement(page: Page, selector: string) {
  await page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top - Math.max(24, (window.innerHeight - rect.height) / 2), behavior: "instant" });
  });
}

async function assertLocalArtwork(page: Page, project: "venfour" | "imposter") {
  const stage = page.locator(`#${project} .project-stage`);
  await centerElement(page, `#${project} .project-stage`);
  await expect(stage).toHaveCSS("opacity", "1");
  await expect(stage.locator(".project-depth")).toBeVisible();
  await expect(stage.locator(".project-depth")).toHaveCSS("opacity", "1");
  for (const image of await stage.locator("[data-project-visual] img").all()) {
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator(".continuity-frame")).toHaveCSS("opacity", "0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

test("keeps projects and the ending compact and in natural document flow", async ({ page }) => {
  await page.goto("/#work");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".project-handoff, .contact-bridge, .process-navigation")).toHaveCount(0);
  for (const project of ["venfour", "imposter"]) {
    const stage = page.locator(`#${project} .project-stage`);
    await expect(stage).toHaveCSS("position", "relative");
    const layout = await stage.evaluate((element) => ({
      stage: (element as HTMLElement).offsetHeight,
      screen: element.parentElement!.offsetHeight,
      viewport: window.innerHeight,
    }));
    expect(Math.abs(layout.screen - layout.stage)).toBeLessThan(2);
    expect(layout.stage).toBeGreaterThan(240);
    expect(layout.stage).toBeLessThan(layout.viewport);
  }
  const geometry = await page.evaluate(() => {
    const work = document.querySelector("#work")!.getBoundingClientRect();
    const about = document.querySelector("#about")!.getBoundingClientRect();
    const contact = document.querySelector("#contact")!.getBoundingClientRect();
    return { readingDistance: contact.bottom - work.top, about: about.height, viewport: innerHeight };
  });
  expect(geometry.readingDistance / geometry.viewport).toBeLessThan(7);
  expect(geometry.about / geometry.viewport).toBeLessThan(2);
});

test("shows each project's own artwork when scrolling forward, backward, and resizing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#venfour");
  await assertLocalArtwork(page, "venfour");
  await assertLocalArtwork(page, "imposter");
  await assertLocalArtwork(page, "venfour");
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.width - 20, height: viewport.height - 30 });
  await assertLocalArtwork(page, "imposter");
  expect(errors).toEqual([]);
});

test("keeps About readable together and leads directly to contact", async ({ page }) => {
  await page.goto("/#about");
  await expect(page.locator("#about-title")).toBeInViewport();
  await expect(page.locator(".about__intro")).toHaveCSS("position", "static");
  const paragraphs = page.locator(".about__intro p, .principle p");
  await expect(paragraphs).toHaveCount(4);
  for (const principle of await page.locator(".principle").all()) {
    await principle.scrollIntoViewIfNeeded();
    await expect(principle).toHaveCSS("opacity", "1");
    expect(await principle.evaluate((element) => getComputedStyle(element).position)).not.toBe("absolute");
  }
  const overlap = await page.locator(".principle").evaluateAll((elements) => {
    const bounds = elements.map((element) => element.getBoundingClientRect());
    return bounds.some((a, index) => bounds.slice(index + 1).some((b) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
      && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1,
    ));
  });
  expect(overlap).toBe(false);
  await page.goto("/#contact");
  await expect(page.getByRole("link", { name: "Email Zafarali Tolibov", exact: true })).toBeInViewport();
  await expect(page.locator(".closing__arrow-wrap")).toHaveCSS("visibility", "visible");
  await expect(page.locator(".closing__email")).toHaveAttribute("href", "mailto:zafaralit67@gmail.com");
});

test("preserves reading position when motion is paused throughout the project and ending sections", async ({ page }) => {
  await page.goto("/#work");
  await page.evaluate(() => document.fonts.ready);
  for (const selector of [".work-intro", "#venfour .project__description", "#imposter .project-stage", ".principle:nth-child(2)", ".closing__cta"]) {
    await centerElement(page, selector);
    const content = page.locator(selector);
    await expect(content).toHaveCSS("opacity", "1");
    const before = await content.evaluate((element) => element.getBoundingClientRect().top);
    await page.getByRole("button", { name: "Pause animations" }).click();
    await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
    await expect(content).toBeInViewport();
    expect(Math.abs(await content.evaluate((element) => element.getBoundingClientRect().top) - before)).toBeLessThan(4);
    await page.getByRole("button", { name: "Enable animations" }).click();
    await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
    await expect(content).toBeInViewport();
    expect(Math.abs(await content.evaluate((element) => element.getBoundingClientRect().top) - before)).toBeLessThan(4);
  }
});
