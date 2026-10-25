import { expect, test, type Page } from "@playwright/test";

async function readFrame(page: Page) {
  return page.locator(".continuity-frame").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const card = getComputedStyle(document.querySelector(".continuity-card")!);
    const left = document.querySelector(".continuity-card-left")!.getBoundingClientRect();
    const right = document.querySelector(".continuity-card-right")!.getBoundingClientRect();
    return {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      panelWidth: parseFloat(style.width), panelHeight: parseFloat(style.height),
      opacity: Number(style.opacity), clip: card.clipPath,
      browserOpacity: Number(getComputedStyle(document.querySelector(".continuity-browser")!).opacity),
      cardOpacity: Number(card.opacity), left: left.x, right: right.x,
    };
  });
}

async function settleFrame(page: Page) {
  let previous: Awaited<ReturnType<typeof readFrame>> | undefined;
  let stable = 0;
  await expect.poll(async () => {
    const current = await readFrame(page);
    const unchanged = previous && ["x", "y", "width", "height", "left", "right", "browserOpacity", "cardOpacity"]
      .every((key) => Math.abs(Number(current[key as keyof typeof current]) - Number(previous![key as keyof typeof current])) < .15)
      && previous.clip === current.clip;
    stable = unchanged ? stable + 1 : 0;
    previous = current;
    return stable;
  }, { intervals: [120], timeout: 6000 }).toBeGreaterThanOrEqual(2);
  return readFrame(page);
}

async function handoffGeometry(page: Page) {
  return page.locator(".project-handoff").evaluate((element) => {
    const scene = element.querySelector<HTMLElement>(".handoff-scene")!;
    return {
      top: element.getBoundingClientRect().top + window.scrollY,
      distance: (element as HTMLElement).offsetHeight - scene.offsetHeight,
      viewport: scene.offsetHeight,
    };
  });
}

async function scrollMorph(page: Page, fraction: number) {
  const geometry = await handoffGeometry(page);
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), geometry.top + geometry.distance * fraction);
  return settleFrame(page);
}

test("slowly transforms one browser into a masked card and an unfolding deck", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  const geometry = await handoffGeometry(page);
  expect(geometry.distance / geometry.viewport).toBeGreaterThanOrEqual(1.8);

  const browser = await scrollMorph(page, .08);
  expect(browser.panelWidth / browser.panelHeight).toBeGreaterThan(1.3);
  expect(browser.browserOpacity).toBeGreaterThan(.99);
  const middle = await scrollMorph(page, .43);
  expect(middle.panelWidth / middle.panelHeight).toBeLessThan(browser.panelWidth / browser.panelHeight);
  expect(middle.clip).not.toBe("none");
  const card = await scrollMorph(page, .68);
  expect(card.panelWidth / card.panelHeight).toBeLessThan(.65);
  expect(card.cardOpacity).toBeGreaterThan(.99);
  expect(middle.clip).not.toBe(card.clip);

  const deck = await scrollMorph(page, .95);
  expect(deck.left).toBeLessThan(deck.x - deck.width * .3);
  expect(deck.right).toBeGreaterThan(deck.x + deck.width * .3);
  await expect(page.locator(".continuity-card-left")).toBeVisible();
  await expect(page.locator(".continuity-card-right")).toBeVisible();

  const reversed = await scrollMorph(page, .08);
  for (const key of ["x", "y", "width", "height", "panelWidth", "panelHeight"] as const) {
    expect(Math.abs(reversed[key] - browser[key]), `Reverse morph must return the same ${key}`).toBeLessThan(1);
  }
  expect(reversed.browserOpacity).toBeGreaterThan(.99);

  const seam = geometry.top + geometry.distance * .58;
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), seam - 2);
  const before = await settleFrame(page);
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), seam + 2);
  const after = await settleFrame(page);
  for (const key of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(after[key] - before[key]), `Morph ${key} must not jump between adjacent scroll positions`).toBeLessThan(14);
  }
});

test("recovers from rapid reversals and a resize during the morph", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/#imposter");
  await expect(page.locator("#imposter-title")).toBeInViewport();
  const geometry = await handoffGeometry(page);
  await page.evaluate(async ({ top, distance }) => {
    for (const fraction of [.95, .05, .8, .2, .68]) {
      window.scrollTo({ top: top + distance * fraction, behavior: "instant" });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  }, geometry);
  const final = await settleFrame(page);
  expect(final.cardOpacity).toBeGreaterThan(.99);
  expect(final.browserOpacity).toBeLessThan(.01);
  expect(final.panelWidth / final.panelHeight).toBeLessThan(.65);

  await scrollMorph(page, .43);
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.width - 30, height: viewport.height - 40 });
  const resized = await scrollMorph(page, .43);
  expect([resized.x, resized.y, resized.width, resized.height].every(Number.isFinite)).toBe(true);
  await expect(page.locator(".continuity-frame")).toBeInViewport();
  const resizedCard = await scrollMorph(page, .68);
  expect(resizedCard.panelWidth / resizedCard.panelHeight).toBeLessThan(.65);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("keeps reading context when pausing from the introduction or the morph", async ({ page }) => {
  await page.goto("/#work");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".work-intro")).toBeInViewport();
  await expect(page.locator(".work-intro")).toHaveCSS("opacity", "1");
  await expect(page.locator(".work-intro")).toHaveCSS("transform", "none");
  const introductionTop = await page.locator(".work-intro").evaluate((element) => element.getBoundingClientRect().top);
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator(".work-intro")).toBeInViewport();
  expect(Math.abs(await page.locator(".work-intro").evaluate((element) => element.getBoundingClientRect().top) - introductionTop)).toBeLessThan(40);

  await page.getByRole("button", { name: "Enable animations" }).click();
  await scrollMorph(page, .45);
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator(".project-handoff")).toHaveCSS("display", "none");
  await expect(page.locator(".continuous-artwork")).toHaveCSS("display", "none");
  await expect(page.locator(".imposter-stage")).toBeInViewport();
  await expect(page.locator(".imposter-poster--center img")).toBeVisible();

  await page.getByRole("button", { name: "Enable animations" }).click();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  await expect(page.locator(".imposter-stage")).toBeInViewport();
  await expect(page.locator(".continuity-card")).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

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
