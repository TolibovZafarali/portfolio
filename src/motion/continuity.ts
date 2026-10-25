import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const clamp = gsap.utils.clamp(0, 1);
const smooth = (value: number) => value * value * (3 - 2 * value);

export function createContinuity(root: HTMLElement) {
  const frame = root.querySelector<HTMLElement>(".continuity-frame")!;
  const sculpture = root.querySelector<HTMLElement>(".hero__sculpture")!;
  const hero = root.querySelector<HTMLElement>(".hero")!;
  const journey = root.querySelector<HTMLElement>(".hero-journey")!;
  const work = root.querySelector<HTMLElement>(".selected-work")!;
  const driver = { progress: 0 };
  let maximum = 1;
  let heroEnd = 0;
  let height = 1;
  let paperAt = 1;
  let disposed = false;

  const documentTop = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;

  function measure() {
    height = hero.offsetHeight;
    maximum = Math.max(1, ScrollTrigger.maxScroll(window));
    heroEnd = documentTop(journey) + journey.offsetHeight - height;
    paperAt = Math.max(heroEnd + height * .55, documentTop(work) - height * .5);
    driver.progress = clamp(window.scrollY / maximum);
    render();
  }

  function render() {
    if (disposed) return;
    const scroll = driver.progress * maximum;
    const exit = Math.max(0, scroll - heroEnd);
    const opacity = 1 - smooth(clamp(exit / (height * .55)));
    frame.style.opacity = String(opacity);
    frame.style.visibility = opacity > .001 ? "visible" : "hidden";
    if (opacity > .001) {
      const source = sculpture.getBoundingClientRect();
      const top = source.top + Math.max(0, window.scrollY - heroEnd) - exit;
      frame.style.width = `${source.width}px`;
      frame.style.height = `${source.height}px`;
      frame.style.transform = `translate3d(${source.left}px,${top}px,0)`;
      frame.style.setProperty("--monogram-perspective", `${1100 * source.width / Math.max(1, sculpture.offsetWidth)}px`);
    }

    const darken = smooth(clamp((scroll - (heroEnd - height * .45)) / (height * .45)));
    const lighten = smooth(clamp((scroll - (heroEnd + height * .1)) / Math.max(1, paperAt - heroEnd - height * .1)));
    const darkness = darken * (1 - lighten);
    const background = gsap.utils.interpolate("#f7f7f2", "#151613", darkness);
    const channels = (background.match(/[\d.]+/g) ?? []).slice(0, 3).map((value) => {
      const channel = Number(value) / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    const luminance = (channels[0] ?? 1) * .2126 + (channels[1] ?? 1) * .7152 + (channels[2] ?? 1) * .0722;
    const ink = luminance > .179 ? (luminance > .3 ? "#1c1c1a" : "#000000") : (luminance < .1 ? "#f7f7f2" : "#ffffff");
    root.style.setProperty("--journey-bg", background);
    root.style.setProperty("--journey-ink", ink);
    root.style.setProperty("--journey-quiet", luminance > .4 ? "#4f514b" : luminance < .08 ? "#d0d2c9" : ink);
    root.style.setProperty("--journey-line", gsap.utils.interpolate("#d9d9d2", "#4c5046", darkness));
  }

  measure();
  const animation = gsap.fromTo(driver, { progress: 0 }, {
    progress: 1,
    ease: "none",
    onUpdate: render,
    scrollTrigger: { start: 0, end: () => ScrollTrigger.maxScroll(window), scrub: .8, onRefresh: measure },
  });

  return () => {
    disposed = true;
    animation.scrollTrigger?.kill();
    animation.kill();
    frame.removeAttribute("style");
    ["--journey-bg", "--journey-ink", "--journey-quiet", "--journey-line"].forEach((property) => root.style.removeProperty(property));
  };
}
