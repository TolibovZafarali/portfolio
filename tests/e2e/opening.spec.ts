import { expect, test, type Page } from "@playwright/test";

async function readFrame(page: Page) {
  return page.locator(".continuity-frame").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const front = element.querySelector(".monogram__face--front")!.getBoundingClientRect();
    const entrance = getComputedStyle(element.querySelector(".monogram__entrance")!).transform;
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      front: { x: front.x, y: front.y, width: front.width, height: front.height }, entrance };
  });
}

async function settleFrame(page: Page) {
  let previous: Awaited<ReturnType<typeof readFrame>> | undefined;
  let stable = 0;
  await expect.poll(async () => {
    const current = await readFrame(page);
    const unchanged = previous && current.entrance === "none" && (["x", "y", "width", "height"] as const)
      .every((key) => Math.abs(current[key] - previous![key]) < .15
        && Math.abs(current.front[key] - previous!.front[key]) < .15);
    stable = unchanged ? stable + 1 : 0;
    previous = current;
    return stable;
  }, { intervals: [120], timeout: 6000 }).toBeGreaterThanOrEqual(2);
  return readFrame(page);
}

type EntranceSample = {
  opacity: number;
  transform: string;
  assembly: { opacity: string; transformStyle: string }[];
  front: { x: number; y: number; width: number; height: number };
};

test("keeps the Z three-dimensional throughout its fade and settles without a final snap", async ({ page }) => {
  await page.addInitScript(() => {
    const samples: EntranceSample[] = [];
    Object.defineProperty(window, "__monogramEntranceSamples", { value: samples });
    let started = false;
    const capture = () => {
      const monogram = document.querySelector<HTMLElement>(".continuous-artwork .monogram");
      const entrance = monogram?.querySelector<HTMLElement>(".monogram__entrance");
      if (monogram && entrance) {
        const opacity = Number(getComputedStyle(monogram).opacity);
        const transform = getComputedStyle(entrance).transform;
        if (opacity > 0 && opacity < 1) started = true;
        if (started) {
          const front = monogram.querySelector(".monogram__face--front")!.getBoundingClientRect();
          samples.push({
            opacity, transform,
            assembly: [...monogram.querySelectorAll(".monogram__orbit, .monogram__pointer, .monogram__float, .monogram__entrance, .monogram__solid")].map((element) => {
              const style = getComputedStyle(element);
              return { opacity: style.opacity, transformStyle: style.transformStyle };
            }),
            front: { x: front.x, y: front.y, width: front.width, height: front.height },
          });
          if (opacity === 1 && transform === "none") return;
        }
      }
      requestAnimationFrame(capture);
    };
    requestAnimationFrame(capture);
  });
  await page.goto("/");
  await expect(page.locator(".continuous-artwork .monogram__entrance")).toHaveCSS("transform", "none");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __monogramEntranceSamples: EntranceSample[] }).__monogramEntranceSamples.at(-1)?.transform)).toBe("none");
  const samples = await page.evaluate(() => (window as unknown as { __monogramEntranceSamples: EntranceSample[] }).__monogramEntranceSamples);
  const fading = samples.filter((sample) => sample.opacity > .05 && sample.opacity < .95);
  expect(fading.length).toBeGreaterThan(3);
  for (const sample of fading) {
    expect(sample.assembly).toHaveLength(5);
    expect(sample.assembly.every((element) => element.opacity === "1" && element.transformStyle === "preserve-3d")).toBe(true);
  }
  const final = samples.at(-1)!;
  const previous = samples.at(-2)!;
  expect(final.opacity).toBe(1);
  expect(final.transform).toBe("none");
  for (const key of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(final.front[key] - previous.front[key]), `The visible face must not jump at entrance completion (${key})`).toBeLessThan(Math.max(4, final.front.width * .04));
  }
});

test("lets the Z finish smoothly when scrolling starts during its entrance", async ({ page }) => {
  type ScrollSample = { scroll: number; transform: string; opacity: number };
  await page.addInitScript(() => {
    const state: { result: ScrollSample | null } = { result: null };
    Object.defineProperty(window, "__earlyMonogramScroll", { value: state });
    const findFade = () => {
      const monogram = document.querySelector<HTMLElement>(".continuous-artwork .monogram");
      const entrance = monogram?.querySelector<HTMLElement>(".monogram__entrance");
      if (monogram && entrance) {
        const opacity = Number(getComputedStyle(monogram).opacity);
        if (opacity > .05 && opacity < .7) {
          window.scrollTo({ top: 48, behavior: "instant" });
          requestAnimationFrame(() => requestAnimationFrame(() => {
            state.result = { scroll: window.scrollY, transform: getComputedStyle(entrance).transform, opacity: Number(getComputedStyle(monogram).opacity) };
          }));
          return;
        }
      }
      requestAnimationFrame(findFade);
    };
    requestAnimationFrame(findFade);
  });
  await page.goto("/");
  const readResult = () => page.evaluate(() => (window as unknown as { __earlyMonogramScroll: { result: ScrollSample | null } }).__earlyMonogramScroll.result);
  await expect.poll(readResult).not.toBeNull();
  const result = (await readResult())!;
  expect(result.scroll).toBeGreaterThan(24);
  expect(result.transform).not.toBe("none");
  expect(result.opacity).toBeLessThan(.95);
  await expect(page.locator(".continuous-artwork .monogram__entrance")).toHaveCSS("transform", "none");
  await expect(page.locator(".continuous-artwork .monogram")).toHaveCSS("opacity", "1");
});

test("carries exactly one visible monogram through the opening boundary without a geometry jump", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".site")).toHaveAttribute("data-motion", "ready");
  await expect(page.locator(".continuous-artwork .monogram__entrance")).toHaveCSS("transform", "none");
  const initialBounds = await page.evaluate(() => ({
    frame: document.querySelector(".continuity-frame")!.getBoundingClientRect().toJSON(),
    source: document.querySelector(".hero__sculpture")!.getBoundingClientRect().toJSON(),
  }));
  for (const key of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(initialBounds.frame[key] - initialBounds.source[key]), `Fresh-load frame ${key} must match the hero before scrolling`).toBeLessThan(1);
  }
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
