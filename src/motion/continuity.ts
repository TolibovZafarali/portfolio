import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Pose = {
  at: number; x: number; y: number; width: number; height: number; rotation: number;
  z: number; browser: number; card: number; rings: number; arrow: number; fan: number; alpha: number;
  reveal: number; pitch: number; yaw: number;
};
type Palette = { at: number; background: string; ink: string; quiet: string; line: string };
const clamp = gsap.utils.clamp(0, 1);
const blend = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function createContinuity(root: HTMLElement) {
  const find = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const frame = find<HTMLElement>(".continuity-frame");
  const sculpture = find<HTMLElement>(".hero__sculpture");
  const left = find<HTMLElement>(".continuity-card-left");
  const right = find<HTMLElement>(".continuity-card-right");
  const cat = find<HTMLElement>(".continuity-cat");
  const sheen = find<HTMLElement>(".continuity-sheen");
  const toolbar = find<HTMLElement>(".continuity-browser__bar");
  const handoff = find<HTMLElement>(".project-handoff");
  const handoffScene = find<HTMLElement>(".handoff-scene");
  const clarity = find<HTMLElement>(".handoff-word--clarity");
  const chaos = find<HTMLElement>(".handoff-word--chaos");
  const orbit = find<HTMLElement>(".handoff-orbit");
  const lightField = find<HTMLElement>(".handoff-light");
  const handoffProgress = find<HTMLElement>(".handoff-progress i");
  const handoffLabels = find<HTMLElement>(".handoff-labels");
  const handoffFooter = find<HTMLElement>(".handoff-footer");
  const faces = ["z", "browser", "card", "rings", "arrow"] as const;
  const faceElements = faces.map((name) => find<HTMLElement>(`.continuity-${name}`));
  const driver = { progress: 0 };
  const pointer = { x: 0, y: 0 };
  let poses: Pose[] = [];
  let palettes: Palette[] = [];
  let maximum = 1;
  let heroEnd = 0;
  let viewportHeight = 1;
  let viewportWidth = 1;
  let footerArrow = { x: 0, y: 0, width: 0, height: 0 };
  let footerStart = 0;
  let handoffStart = 0;
  let handoffDistance = 1;

  const documentTop = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;
  const layoutPosition = (element: HTMLElement) => {
    let x = 0, y = 0;
    for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    return { x, y, width: element.offsetWidth, height: element.offsetHeight };
  };

  function measure() {
    const w = document.documentElement.clientWidth, h = find<HTMLElement>(".hero").offsetHeight;
    viewportWidth = w;
    viewportHeight = h;
    maximum = Math.max(1, ScrollTrigger.maxScroll(window));
    const mobile = window.innerWidth <= 768;
    const journey = find<HTMLElement>(".hero-journey");
    heroEnd = documentTop(journey) + journey.offsetHeight - find<HTMLElement>(".hero").offsetHeight;
    const venfour = find<HTMLElement>(".project--venfour .project-screen");
    const imposter = find<HTMLElement>(".project--imposter .project-screen");
    const v = documentTop(venfour), ve = v + venfour.offsetHeight - venfour.querySelector<HTMLElement>(".project-stage")!.offsetHeight;
    const i = documentTop(imposter), ie = i + imposter.offsetHeight - imposter.querySelector<HTMLElement>(".project-stage")!.offsetHeight;
    handoffStart = documentTop(handoff);
    handoffDistance = handoff.offsetHeight - handoffScene.offsetHeight;
    const beat = (fraction: number) => handoffStart + handoffDistance * fraction;
    const about = documentTop(find<HTMLElement>(".about"));
    const closing = documentTop(find<HTMLElement>(".closing"));
    footerStart = Math.min(closing - h * .22, maximum - h * .12);
    footerArrow = layoutPosition(find<HTMLElement>(".closing__arrow-wrap"));
    const gutter = w - (mobile ? 12 : 27);
    const tiny = mobile ? 18 : 36;
    const browserWidth = Math.min(w * (w < 600 ? 1.14 : mobile ? .9 : .72), 1180);
    const browserHeight = browserWidth * .589;
    const cardWidth = Math.min(w * (mobile ? .48 : .22), h * .3);
    const cardHeight = cardWidth * 1200 / 554;
    const sculptureScale = mobile ? 1.05 : 1.65;
    const initial: Omit<Pose, "at"> = { x: w * (mobile ? .63 : .77), y: h * (mobile ? .69 : .52), width: sculpture.offsetWidth * sculptureScale, height: sculpture.offsetHeight * sculptureScale, rotation: 0, z: 1, browser: 0, card: 0, rings: 0, arrow: 0, fan: 0, alpha: 1, reveal: 0, pitch: 0, yaw: 0 };
    poses = [];
    const add = (at: number, changes: Partial<Omit<Pose, "at">>) => {
      poses.push({ ...(poses.at(-1) ?? initial), ...changes, at });
    };
    add(0, {});
    add(heroEnd, {});
    add(heroEnd + h * .2, { y: initial.y - h * .2 });
    add(Math.min(heroEnd + h * .78, v - h * .55), { x: gutter, y: h * .56, width: tiny, height: tiny, rotation: 90 });
    add(v - h * .45, {});
    add(v + h * .06, { x: w * .5, y: h * .51, width: browserWidth, height: browserHeight, rotation: -4, z: 0, browser: 1 });
    add(ve, { y: h * .47, rotation: 1 });
    add(ve + h * .45, { x: gutter, y: h * .5, width: tiny, height: tiny * 1.2, rotation: 90 });
    add(handoffStart - h * .45, { rotation: 35 });
    add(beat(.08), { x: w * .5, y: h * .49, width: browserWidth, height: browserHeight, rotation: -3 });
    add(beat(.28), { width: browserWidth * .72, height: blend(browserHeight, cardHeight, .35), rotation: -5, pitch: 7, yaw: -19, card: 1 });
    add(beat(.58), { width: cardWidth * 1.06, height: cardHeight * 1.06, rotation: 3, pitch: -3, yaw: 13, reveal: 1 });
    add(beat(.68), { width: cardWidth, height: cardHeight, rotation: 0, pitch: 0, yaw: 0, browser: 0 });
    add(beat(.95), { fan: 1 });
    add(ie, {});
    add(ie + h * .45, { x: gutter, y: h * .5, width: tiny, height: tiny * 1.2, rotation: 90, fan: 0 });
    add(about - h * .18, { x: w - tiny * 1.1, width: tiny * 1.8, height: tiny * 1.8, card: 0, rings: 1, rotation: 180 });
    add(Math.min(about + h * .25, footerStart - h * .4), { rotation: 250 });
    add(footerStart - h * .35, { rotation: 360 });
    add(footerStart, { x: footerArrow.x + footerArrow.width / 2, y: footerArrow.y + footerArrow.height / 2 - footerStart, width: footerArrow.width, height: footerArrow.height, rings: 0, arrow: 1, rotation: 0 });
    add(maximum, { y: footerArrow.y + footerArrow.height / 2 - maximum });
    poses.sort((a, b) => a.at - b.at);
    const paper = { background: "#f7f7f2", ink: "#1c1c1a", quiet: "#686862", line: "#d9d9d2" };
    const dark = { background: "#151613", ink: "#f7f7f2", quiet: "#c1c3b9", line: "#4c5046" };
    const sage = { ...paper, background: "#dfe5de", line: "#b8c2b5" };
    const warm = { ...paper, background: "#e9e9e1", line: "#cacac1" };
    palettes = [
      { at: 0, ...paper }, { at: heroEnd - h * .45, ...paper }, { at: heroEnd, ...dark },
      { at: v - h * .7, ...dark }, { at: v + h * .03, ...sage },
      { at: beat(.12), ...sage }, { at: beat(.62), ...dark },
      { at: about - h * .65, ...dark }, { at: about + h * .05, ...warm },
      { at: closing - h * .8, ...warm }, { at: Math.min(closing - h * .1, maximum), ...dark },
      { at: maximum, ...dark },
    ].sort((a, b) => a.at - b.at);
    driver.progress = clamp(window.scrollY / maximum);
    render();
  }

  const visibility = (element: HTMLElement, alpha: number) => {
    element.style.opacity = String(alpha);
    element.style.visibility = alpha > .001 ? "visible" : "hidden";
  };
  const geometry = (element: HTMLElement, x: number, y: number, width: number, height: number, rotation: number, tilt = 0, pitch = 0, yaw = 0) => {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.transform = `translate3d(${x - width / 2}px,${y - height / 2}px,0) rotateX(${pitch + pointer.y * tilt}deg) rotateY(${yaw + pointer.x * tilt}deg) rotate(${rotation}deg)`;
  };
  function segment<T extends { at: number }>(stops: T[], scroll: number) {
    const index = stops.findIndex((stop) => stop.at > scroll);
    const a = stops[Math.max(0, index < 0 ? stops.length - 1 : index - 1)]!;
    const b = stops[index < 0 ? stops.length - 1 : index]!;
    return { a, b, t: smooth(clamp((scroll - a.at) / Math.max(1, b.at - a.at))) };
  }
  function render() {
    if (!poses.length) return;
    const scroll = driver.progress * maximum;
    const { a, b, t } = segment(poses, scroll);
    const values = Object.fromEntries(Object.keys(a).map((key) => [key, blend(a[key as keyof Pose], b[key as keyof Pose], t)])) as Pose;
    if (scroll <= heroEnd) {
      const source = sculpture.getBoundingClientRect();
      values.x = source.left + source.width / 2;
      values.y = source.top + source.height / 2 + Math.max(0, window.scrollY - heroEnd);
      values.width = source.width;
      values.height = source.height;
      values.rotation = 0;
    }
    if (scroll >= footerStart) values.y = footerArrow.y + footerArrow.height / 2 - scroll;
    const { x, y, width, height, rotation, fan, alpha } = values;
    const tilt = clamp(values.browser + values.card) * Math.min(1, width / 200);
    geometry(frame, x, y, width, height, rotation, tilt, values.pitch, values.yaw);
    frame.style.setProperty("--monogram-perspective", `${1100 * width / Math.max(1, sculpture.offsetWidth)}px`);
    frame.style.borderRadius = `${blend(10, 17, values.card)}px`;
    frame.style.boxShadow = `0 30px 70px -25px rgb(0 0 0 / ${clamp(values.browser + values.card) * .26})`;
    visibility(frame, alpha);
    faces.forEach((name, index) => visibility(faceElements[index]!, values[name]));
    const crop = (1 - values.reveal) * 50;
    faceElements[2]!.style.clipPath = `inset(${crop}% 0 ${crop}% 0)`;
    toolbar.style.opacity = String(1 - values.reveal);
    toolbar.style.transform = `translateY(${-values.reveal * 30}px)`;
    const progress = clamp((scroll - handoffStart) / handoffDistance);
    const exit = 1 - smooth(clamp((progress - .94) / .06));
    const wipe = clamp((progress - .28) / .3);
    sheen.style.opacity = String(Math.sin(wipe * Math.PI) * .6);
    sheen.style.backgroundPosition = `${140 - wipe * 220}% 0`;
    clarity.style.opacity = String((1 - smooth(clamp((progress - .25) / .3))) * .08 * exit);
    chaos.style.opacity = String(smooth(clamp((progress - .45) / .25)) * .1 * exit);
    clarity.style.transform = `translateX(${-50 - progress * 8}%)`;
    chaos.style.transform = `translateX(${-43 - progress * 7}%)`;
    orbit.style.opacity = String(Math.sin(progress * Math.PI) * .14);
    orbit.style.transform = `translate(-50%, -50%) rotate(${-16 + progress * 74}deg) scale(${1 + Math.sin(progress * Math.PI) * .15})`;
    lightField.style.opacity = String(Math.sin(progress * Math.PI));
    handoffProgress.style.transform = `scaleX(${progress})`;
    handoffLabels.style.opacity = String(exit);
    handoffFooter.style.opacity = String(exit);
    const wingWidth = width * .94;
    const leftFan = smooth(clamp(fan / .85));
    const rightFan = smooth(clamp((fan - .12) / .88));
    geometry(left, x - width * .9 * leftFan, y + 29 * leftFan, wingWidth, height * .94, rotation - leftFan * 13, 0, 0, -8 * (1 - leftFan));
    geometry(right, x + width * .9 * rightFan, y + 37 * rightFan, wingWidth, height * .94, rotation + rightFan * 13, 0, 0, 8 * (1 - rightFan));
    visibility(left, fan * alpha);
    visibility(right, fan * alpha);
    const catSize = Math.min(viewportWidth * (viewportWidth <= 768 ? .24 : .16), 190);
    geometry(cat, viewportWidth * .13, viewportHeight * (viewportWidth <= 768 ? .8 : .73), catSize, catSize, -15 + fan * 25);
    visibility(cat, fan * alpha);
    const palette = segment(palettes, scroll);
    const background = gsap.utils.interpolate(palette.a.background, palette.b.background, palette.t);
    const channels = (background.match(/[\d.]+/g) ?? []).slice(0, 3).map((value) => {
      const channel = Number(value) / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    const luminance = (channels[0] ?? 1) * .2126 + (channels[1] ?? 1) * .7152 + (channels[2] ?? 1) * .0722;
    const light = luminance > .179;
    const ink = light ? (luminance > .3 ? "#1c1c1a" : "#000000") : (luminance < .1 ? "#f7f7f2" : "#ffffff");
    root.style.setProperty("--journey-bg", background);
    root.style.setProperty("--journey-ink", ink);
    root.style.setProperty("--journey-quiet", luminance > .4 ? "#4f514b" : luminance < .08 ? "#d0d2c9" : ink);
    root.style.setProperty("--journey-line", gsap.utils.interpolate(palette.a.line, palette.b.line, palette.t));
  }

  measure();
  const animation = gsap.fromTo(driver, { progress: 0 }, {
    progress: 1, ease: "none", onUpdate: render,
    scrollTrigger: { start: 0, end: () => ScrollTrigger.maxScroll(window), scrub: .8, onRefresh: measure },
  });
  const tiltX = gsap.quickTo(pointer, "x", { duration: .65, ease: "power3.out", onUpdate: render });
  const tiltY = gsap.quickTo(pointer, "y", { duration: .65, ease: "power3.out", onUpdate: render });
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    tiltX((event.clientX / viewportWidth - .5) * 12);
    tiltY((.5 - event.clientY / viewportHeight) * 10);
  };
  const leave = () => { tiltX(0); tiltY(0); };
  const stages = root.querySelectorAll<HTMLElement>("[data-stage]");
  stages.forEach((stage) => { stage.addEventListener("pointermove", move, { passive: true }); stage.addEventListener("pointerleave", leave); stage.addEventListener("blur", leave); });
  window.addEventListener("blur", leave);
  window.addEventListener("resize", leave, { passive: true });
  return () => {
    animation.scrollTrigger?.kill();
    animation.kill();
    tiltX.tween.kill();
    tiltY.tween.kill();
    stages.forEach((stage) => { stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", leave); stage.removeEventListener("blur", leave); });
    window.removeEventListener("blur", leave);
    window.removeEventListener("resize", leave);
    [frame, left, right, cat, sheen, toolbar, clarity, chaos, orbit, lightField, handoffProgress, handoffLabels, handoffFooter, ...faceElements].forEach((element) => element.removeAttribute("style"));
    ["--journey-bg", "--journey-ink", "--journey-quiet", "--journey-line"].forEach((property) => root.style.removeProperty(property));
  };
}
