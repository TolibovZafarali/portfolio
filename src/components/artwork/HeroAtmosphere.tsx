import { useEffect, useRef } from "react";
import gsap from "gsap";
import "../../styles/atmosphere.css";

const TAU = Math.PI * 2;
const clamp = (value: number, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const smoothstep = (from: number, to: number, value: number) => {
  const amount = clamp((value - from) / (to - from));
  return amount * amount * (3 - 2 * amount);
};

type ProjectedPoint = { x: number; y: number; depth: number };

export function HeroAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    const hero = canvas?.closest<HTMLElement>(".hero");
    const site = canvas?.closest<HTMLElement>(".site");
    if (!canvas || !context || !hero || !site) return;

    const palette = getComputedStyle(site);
    const accentColor = gsap.utils.splitColor(palette.getPropertyValue("--accent-on-dark").trim()).slice(0, 3).join(", ");
    const lineStart = gsap.utils.splitColor(palette.getPropertyValue("--ink").trim()).slice(0, 3);
    const lineEnd = gsap.utils.splitColor(palette.getPropertyValue("--accent-highlight").trim()).slice(0, 3);
    const reducedMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let disposed = false;
    let inView = hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < window.innerHeight;
    let targetProgress = clamp(Number(hero.dataset.journeyProgress) || 0);
    let progress = targetProgress;
    let pointerStrength = 0;
    const pointer = { x: 0, y: 0, active: false };

    const motionEnabled = () => {
      const preference = document.documentElement.dataset.motionPreference;
      const reduced = preference === "reduce" || (reducedMedia.matches && preference !== "full");
      return !disposed && !document.hidden && inView && !reduced && site.dataset.motion === "ready";
    };

    function draw(now: number) {
      frame = 0;
      if (!motionEnabled() || !width || !height) return;
      const delta = lastTime ? Math.min(now - lastTime, 40) / 1000 : 0;
      lastTime = now;
      elapsed += delta;
      progress += (targetProgress - progress) * Math.min(1, delta * 10 + .02);
      pointerStrength += ((pointer.active ? 1 : 0) - pointerStrength) * .09;

      context!.clearRect(0, 0, width, height);
      const mobile = width <= 768;
      const expansion = smoothstep(.02, .82, progress);
      const burst = Math.sin(clamp(progress / .9) * Math.PI) * .22;
      const tint = smoothstep(.12, .43, progress);
      const baseRadius = Math.min(width * (mobile ? .37 : .165), height * .32);
      const radius = baseRadius * (1 + expansion * 1.25 + burst);
      const centerX = width * mix(mobile ? .63 : .84, .55, smoothstep(0, .55, progress));
      const centerY = height * mix(mobile ? .58 : .55, .5, smoothstep(0, .55, progress));
      const lineColor = lineStart.map((channel, index) => Math.round(mix(channel, lineEnd[index]!, tint))).join(", ");
      const perspective = Math.max(width, height) * 1.35;
      const arcSegments = mobile ? 56 : 76;

      const project = (angle: number, orbit: number, radial = 1): ProjectedPoint => {
        const ringRadius = radius * (.83 + orbit * .135) * radial;
        const plane = orbit * .63 + .34 + elapsed * .025;
        const tilt = .78 + orbit * .32 + Math.sin(elapsed * .18 + orbit) * .13;
        const rotation = elapsed * .045 + progress * 1.8;
        const x = Math.cos(angle) * ringRadius;
        const y = Math.sin(angle) * ringRadius * Math.cos(tilt);
        const z = Math.sin(angle) * ringRadius * Math.sin(tilt);
        const turnedX = x * Math.cos(plane) - y * Math.sin(plane);
        const turnedY = x * Math.sin(plane) + y * Math.cos(plane);
        const spunX = turnedX * Math.cos(rotation) - z * Math.sin(rotation);
        const spunZ = turnedX * Math.sin(rotation) + z * Math.cos(rotation);
        const scale = perspective / (perspective + spunZ);
        return { x: centerX + spunX * scale, y: centerY + turnedY * scale, depth: scale };
      };

      for (let orbit = 0; orbit < 4; orbit += 1) {
        context!.beginPath();
        for (let step = 0; step <= arcSegments; step += 1) {
          const point = project((step / arcSegments) * TAU, orbit);
          if (step === 0) context!.moveTo(point.x, point.y);
          else context!.lineTo(point.x, point.y);
        }
        context!.lineWidth = orbit === 0 ? .85 : .65;
        context!.strokeStyle = `rgba(${lineColor}, ${mix(.19, .23, tint) - orbit * .018})`;
        context!.setLineDash(orbit === 3 ? [2, 7] : []);
        context!.stroke();
        context!.setLineDash([]);

        const arcStart = elapsed * (.16 + orbit * .035) + orbit * 1.7;
        context!.beginPath();
        for (let step = 0; step <= 14; step += 1) {
          const point = project(arcStart + (step / 14) * .48, orbit);
          if (step === 0) context!.moveTo(point.x, point.y);
          else context!.lineTo(point.x, point.y);
        }
        context!.lineWidth = 1.25;
        context!.strokeStyle = tint > .75 && orbit === 1
          ? `rgba(${accentColor}, ${.48 * tint})`
          : `rgba(${lineColor}, ${mix(.38, .52, tint)})`;
        context!.stroke();
      }

      const particleCount = mobile ? 48 : 96;
      for (let index = 0; index < particleCount; index += 1) {
        const orbit = index % 4;
        const phase = index * 2.399963229728653 + elapsed * (.11 + orbit * .027) * (orbit % 2 ? -1 : 1);
        const radial = 1 + Math.sin(index * 1.31) * .13 * expansion;
        const point = project(phase, orbit, radial);
        const dx = point.x - pointer.x;
        const dy = point.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const force = Math.pow(Math.max(0, 1 - distance / 150), 2) * 36 * pointerStrength;
        const x = point.x + (distance > 0 ? dx / distance * force : 0);
        const y = point.y + (distance > 0 ? dy / distance * force : 0);
        const accent = index % 17 === 0 && tint > .5;
        const alpha = clamp(.48 + (point.depth - .8) * .8, .32, .9);
        context!.fillStyle = accent ? `rgba(${accentColor}, ${alpha})` : `rgba(${lineColor}, ${alpha})`;
        const size = (index % 13 === 0 ? 2.4 : 1.1) * point.depth;
        context!.beginPath();
        context!.arc(x, y, size, 0, TAU);
        context!.fill();

        if (index % 24 === 0) {
          context!.strokeStyle = `rgba(${lineColor}, ${alpha * .38})`;
          context!.lineWidth = .65;
          context!.beginPath();
          context!.arc(x, y, size + 5.5, 0, TAU);
          context!.stroke();
        }
      }

      frame = requestAnimationFrame(draw);
    }

    function sync() {
      if (site!.dataset.motion !== "ready") {
        targetProgress = clamp(Number(hero!.dataset.journeyProgress) || 0);
        progress = targetProgress;
      }
      if (motionEnabled()) {
        if (!frame) {
          lastTime = 0;
          frame = requestAnimationFrame(draw);
        }
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      }
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      sync();
    };
    const onProgress = (event: Event) => {
      const value = (event as CustomEvent<number>).detail;
      if (typeof value === "number" && Number.isFinite(value)) targetProgress = clamp(value);
    };
    const move = (event: PointerEvent) => {
      if (!pointerMedia.matches || event.pointerType === "touch") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    };
    const leave = () => { pointer.active = false; };
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      sync();
    }, { threshold: 0 });
    const motion = new MutationObserver(sync);
    const size = new ResizeObserver(resize);

    hero.addEventListener("heroprogress", onProgress);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    reducedMedia.addEventListener("change", sync);
    visibility.observe(hero);
    motion.observe(site, { attributes: true, attributeFilter: ["data-motion"] });
    size.observe(canvas);
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      visibility.disconnect();
      motion.disconnect();
      size.disconnect();
      hero.removeEventListener("heroprogress", onProgress);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync);
      reducedMedia.removeEventListener("change", sync);
      context.clearRect(0, 0, width, height);
    };
  }, []);

  return <canvas className="hero-atmosphere" ref={canvasRef} aria-hidden="true" />;
}
