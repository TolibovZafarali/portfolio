import { expect, test } from "@playwright/test";

const sectionIds = ["top", "work", "venfour", "imposter", "about", "contact"] as const;

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("presents the developer and real projects in the requested order", async ({ page }) => {
  await expect(page).toHaveTitle("Zafarali Tolibov — Developer & Product Builder");
  await expect(page.getByRole("heading", { level: 1, name: "Zafarali Tolibov" })).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.locator("[data-project]")).toHaveCount(2);
  expect(await page.locator("[data-project]").evaluateAll((projects) => projects.map((project) => project.id))).toEqual(["venfour", "imposter"]);
  await expect(page.getByRole("link", { name: "Explore Venfour", exact: true })).toHaveAttribute("href", "https://venfour.com");
  await expect(page.getByRole("link", { name: "View on the App Store", exact: true })).toHaveAttribute("href", "https://apps.apple.com/us/app/imposter-all-languages/id6771144493");

  const anchorsResolve = await page.locator('a[href^="#"]').evaluateAll((anchors) =>
    anchors.every((anchor) => {
      const target = anchor.getAttribute("href");
      return Boolean(target && document.querySelector(target));
    }),
  );
  expect(anchorsResolve).toBe(true);
});

test("keeps all sections and project artwork within the viewport", async ({ page }) => {
  for (const sectionId of sectionIds) {
    await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }

  for (const image of await page.locator("[data-project] img:not([aria-hidden])").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
});

test("animates the opening through native scrolling", async ({ page }) => {
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  const firstLine = page.locator('[data-hero-line="first"]');
  await page.waitForTimeout(1700);
  const initialTransform = await firstLine.evaluate((element) => getComputedStyle(element).transform);
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.42, behavior: "instant" }));
  await page.waitForTimeout(900);

  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  expect(await firstLine.evaluate((element) => getComputedStyle(element).transform)).not.toBe(initialTransform);
  const progressScale = await page.locator("[data-page-progress]").evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a);
  expect(progressScale).toBeGreaterThan(0);
  expect(progressScale).toBeLessThan(1);
});

test("keeps content readable and artwork still with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
  await expect(page.getByRole("button", { name: "Enable animations" })).toHaveAttribute("aria-pressed", "true");

  for (const sectionId of sectionIds) await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  const state = await page.evaluate(() => ({
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    contentReadable: [...document.querySelectorAll<HTMLElement>("[data-reveal]")].every((element) => getComputedStyle(element).opacity === "1"),
    titleTransform: getComputedStyle(document.querySelector<HTMLElement>('[data-hero-line="first"]')!).transform,
    sculptureAnimation: getComputedStyle(document.querySelector<HTMLElement>(".hero .monogram__float")!).animationName,
  }));
  expect(state.scrollBehavior).toBe("auto");
  expect(state.contentReadable).toBe(true);
  expect(state.titleTransform).toBe("none");
  expect(state.sculptureAnimation).toBe("none");
});

test("lets visitors pause and re-enable motion", async ({ page }) => {
  const firstLine = page.locator('[data-hero-line="first"]');
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await page.getByRole("button", { name: "Pause animations" }).click();
    await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
    await expect(page.getByRole("button", { name: "Enable animations" })).toHaveAttribute("aria-pressed", "true");
    expect(await page.locator("[data-reveal]").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).opacity === "1"))).toBe(true);
    const initialTransform = await firstLine.evaluate((element) => getComputedStyle(element).transform);
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.42, behavior: "instant" }));
    await page.waitForTimeout(150);
    expect(await firstLine.evaluate((element) => getComputedStyle(element).transform)).toBe(initialTransform);

    await page.getByRole("button", { name: "Enable animations" }).click();
    await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
    await expect(page.getByRole("button", { name: "Pause animations" })).toHaveAttribute("aria-pressed", "false");
  }
  for (const projectId of ["venfour", "imposter"]) {
    const projectHeading = page.locator(`#${projectId} .project__heading`);
    await projectHeading.scrollIntoViewIfNeeded();
    await expect(projectHeading).toHaveCSS("opacity", "1");
  }
});

test("supports keyboard entry, navigation, and the closing return", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to selected work" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work")).toBeFocused();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Connect" }).click();
  await expect(page).toHaveURL(/#contact$/);
  await page.getByRole("link", { name: "BACK TO TOP", exact: true }).click();
  await expect(page).toHaveURL(/#top$/);
});

test("expands and closes project details with the keyboard", async ({ page }) => {
  for (const projectId of ["venfour", "imposter"]) {
    const details = page.locator(`#${projectId} details`);
    const summary = details.locator("summary");
    await summary.scrollIntoViewIfNeeded();
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await expect(details.getByRole("heading").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(details).not.toHaveAttribute("open");
  }
});

test("runs without runtime exceptions or console errors", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(message.text());
  });
  await page.reload();
  for (const sectionId of sectionIds) await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  expect(failures).toEqual([]);
});

test("restores split lettering and unclipped projects when motion is paused", async ({ page }) => {
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");

  const letters = page.locator(".motion-letter");
  const projects = page.locator("[data-stage]");
  expect(await letters.evaluateAll((elements) => elements.every((element) => {
    const style = getComputedStyle(element);
    return style.opacity === "1" && style.transform === "none";
  }))).toBe(true);
  expect(await projects.evaluateAll((elements) => elements.every((element) => getComputedStyle(element).clipPath === "none"))).toBe(true);
  expect(await page.locator(".ink-reveal").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).color !== "rgba(0, 0, 0, 0)"))).toBe(true);

  await page.goto("/#contact");
  await page.reload();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  await expect(page.locator(".closing__words")).toBeInViewport();
  await expect.poll(() => page.locator(".closing .motion-letter").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).opacity === "1"))).toBe(true);
  await expect(page.getByRole("link", { name: "Email Zafarali Tolibov", exact: true })).toBeVisible();
});

test("runs ribbon and pointer effects only while motion is enabled", async ({ page }) => {
  const ribbon = page.locator(".motion-ribbon");
  const track = page.locator(".motion-ribbon__track");
  await ribbon.scrollIntoViewIfNeeded();
  await expect(ribbon).toHaveAttribute("data-running", "true");
  const movingStart = await track.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(180);
  expect(await track.evaluate((element) => getComputedStyle(element).transform)).not.toBe(movingStart);

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(ribbon).toHaveAttribute("data-running", "false");
  const stoppedStart = await track.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(180);
  expect(await track.evaluate((element) => getComputedStyle(element).transform)).toBe(stoppedStart);

  const pointerAvailable = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  const stage = page.locator(".venfour-stage");
  if (pointerAvailable) {
    await stage.scrollIntoViewIfNeeded();
    const bounds = await stage.boundingBox();
    expect(bounds).not.toBeNull();
    await page.mouse.move(bounds!.x + bounds!.width * .75, bounds!.y + bounds!.height * .35);
    await expect(stage.locator(".project-cursor")).toHaveCSS("opacity", "1");
    const cinematic = await page.evaluate(() => matchMedia("(min-height: 601px)").matches);
    const visibleArtwork = cinematic ? page.locator(".continuity-frame") : stage.locator(".project-depth");
    if (cinematic) await expect(visibleArtwork).toBeVisible();
    await expect.poll(() => visibleArtwork.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return Math.abs(matrix.m13) + Math.abs(matrix.m23);
    })).toBeGreaterThan(.01);
  }

  await page.getByRole("button", { name: "Pause animations" }).click();
  if (pointerAvailable) {
    await stage.scrollIntoViewIfNeeded();
    const bounds = await stage.boundingBox();
    await page.mouse.move(bounds!.x + bounds!.width * .25, bounds!.y + bounds!.height * .65);
    await expect(stage.locator(".project-depth")).toHaveCSS("transform", "none");
    await expect(stage.locator(".project-cursor")).toHaveCSS("opacity", "0");
  }
  await ribbon.scrollIntoViewIfNeeded();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
  const pausedStart = await track.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(180);
  expect(await track.evaluate((element) => getComputedStyle(element).transform)).toBe(pausedStart);
  expect(pausedStart).toBe("none");
});

test("plays and rewinds the cinematic opening and preserves context when paused", async ({ page }) => {
  const hero = page.locator(".hero");
  const chapter = page.locator(".hero__chapter");
  const firstLine = page.locator('[data-hero-line="first"]');
  const scrollJourney = async (progress: number) => {
    await page.evaluate((fraction) => {
      const journey = document.querySelector<HTMLElement>(".hero-journey")!;
      const heroElement = document.querySelector<HTMLElement>(".hero")!;
      const top = journey.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (journey.offsetHeight - heroElement.offsetHeight) * fraction, behavior: "instant" });
    }, progress);
    await expect.poll(async () => Number(await hero.getAttribute("data-journey-progress"))).toBeCloseTo(progress, 2);
  };

  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  await page.waitForTimeout(2100);
  await expect(page.locator(".hero .motion-letter").last()).toHaveCSS("opacity", "1");
  await scrollJourney(.65);
  expect(await hero.evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(1);
  await expect(firstLine).toHaveCSS("opacity", "0");
  expect(await page.locator(".hero__iris").evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeGreaterThan(.95);
  expect(await chapter.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(.2);
  await expect(page.locator(".hero-atmosphere")).toBeVisible();

  await scrollJourney(.99);
  await expect(chapter).toHaveCSS("opacity", "1");
  await expect(page.locator(".continuous-artwork .monogram__orbit")).not.toHaveCSS("transform", "none");
  await scrollJourney(0);
  await expect(firstLine).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero__eyebrow")).toHaveCSS("opacity", "1");
  await expect(page.locator("[data-hero-intro]")).toHaveCSS("opacity", "1");
  expect(await page.locator("[data-hero-intro] > *, .hero__eyebrow > span").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).opacity === "1"))).toBe(true);
  await expect(chapter).toHaveCSS("visibility", "hidden");
  expect(await page.locator(".hero__iris").evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeLessThan(.01);

  await scrollJourney(.65);
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
  await expect(page.getByRole("heading", { level: 1, name: "Zafarali Tolibov" })).toBeInViewport();
  await expect(firstLine).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero__iris")).toHaveCSS("display", "none");
  await expect(page.locator(".hero-atmosphere")).toHaveCSS("visibility", "hidden");
  expect(await page.evaluate(() => Math.abs(document.querySelector<HTMLElement>(".hero-journey")!.offsetHeight - document.querySelector<HTMLElement>(".hero")!.offsetHeight))).toBeLessThan(1);

  await page.getByRole("button", { name: "Enable animations" }).click();
  await page.evaluate(() => {
    const screen = document.querySelector<HTMLElement>(".project--venfour .project-screen")!;
    const stage = screen.querySelector<HTMLElement>(".project-stage")!;
    window.scrollTo({ top: screen.getBoundingClientRect().top + window.scrollY + (screen.offsetHeight - stage.offsetHeight) * .5, behavior: "instant" });
  });
  await expect(page.locator(".venfour-stage")).toBeInViewport();
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator(".venfour-stage")).toBeInViewport();
  expect(await page.locator(".venfour-stage").evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(3);
});

test("keeps narrow headers and short landscape screens navigable", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const navigation = await page.getByRole("navigation", { name: "Main navigation" }).boundingBox();
  const toggle = await page.getByRole("button", { name: "Pause animations" }).boundingBox();
  expect(navigation).not.toBeNull();
  expect(toggle).not.toBeNull();
  expect(navigation!.x + navigation!.width).toBeLessThanOrEqual(toggle!.x);
  expect(toggle!.x + toggle!.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator(".hero")).toHaveCSS("position", "relative");
  await expect(page.locator(".hero__iris")).toHaveCSS("display", "none");
  expect(await page.evaluate(() => Math.abs(document.querySelector<HTMLElement>(".hero-journey")!.offsetHeight - document.querySelector<HTMLElement>(".hero")!.offsetHeight))).toBeLessThan(1);

  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Work", exact: true }).click();
  await expect(page).toHaveURL(/#work$/);
  for (const sectionId of ["venfour", "imposter", "about", "contact"]) {
    await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
  await expect(page.locator(".venfour-stage")).toHaveCSS("position", "relative");
  await expect(page.getByRole("link", { name: "Email Zafarali Tolibov", exact: true })).toBeInViewport();
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "reduced");
  await expect(page.getByRole("link", { name: "Email Zafarali Tolibov", exact: true })).toBeInViewport();
});
