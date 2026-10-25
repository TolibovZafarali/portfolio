import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const responsive = (desktop: number, mobile: number) => () => window.innerWidth > 768 ? desktop : mobile;

export function createChoreography(root: HTMLElement) {
  let context: gsap.Context | undefined;
  let cleanups: (() => void)[] = [];
  let frame = 0;
  let initialAnchorFrame = 0;
  let disposed = false;
  const initialHash = window.location.hash;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const progress = root.querySelector<HTMLElement>("[data-page-progress]");

  function updateProgress() {
    frame = 0;
    const maximum = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (progress) progress.style.transform = `scaleX(${Math.min(window.scrollY / maximum, 1)})`;
  }

  function requestProgress() {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  }

  function clearEffects() {
    cleanups.forEach((cleanup) => cleanup());
    cleanups = [];
    context?.revert();
    context = undefined;
    delete root.dataset.heroVisible;
    delete root.dataset.pageHidden;
  }

  function setup() {
    clearEffects();
    const preference = document.documentElement.dataset.motionPreference;
    const reduced = preference === "reduce" || (media.matches && preference !== "full");
    root.dataset.motion = reduced ? "reduced" : "ready";
    if (reduced) return;

    context = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>(".hero")!;
      const ribbon = root.querySelector<HTMLElement>(".motion-ribbon")!;
      const entrance = gsap.timeline({ defaults: { ease: "power4.out" } });
      entrance
        .from(".hero .motion-letter", {
          yPercent: 115, rotationX: -65, rotation: 6, opacity: 0,
          duration: 1.05, stagger: .035, clearProps: "transform,opacity",
        }, .05)
        .from(".monogram__solid", {
          rotationY: -115, rotationZ: 20, scale: .55, opacity: 0,
          duration: 1.5, clearProps: "transform,opacity",
        }, .18)
        .from("[data-hero-intro], .hero__eyebrow", {
          opacity: 0, y: 24, duration: .9, stagger: .12, clearProps: "opacity,transform",
        }, .55);

      gsap.to('[data-hero-line="first"]', {
        xPercent: -12, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .7 },
      });
      gsap.to('[data-hero-line="second"]', {
        xPercent: 12, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .7 },
      });
      gsap.to(".hero__sculpture", {
        y: responsive(-100, -45), rotation: -24, scale: .8, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .8, invalidateOnRefresh: true },
      });

      const marquee = gsap.to(".motion-ribbon__track", {
        xPercent: -50, duration: 28, ease: "none", repeat: -1, paused: true,
      });
      let marqueeVisible = false;
      const syncMarquee = () => {
        const running = marqueeVisible && !document.hidden;
        marquee.paused(!running);
        ribbon.dataset.running = String(running);
      };
      const ribbonTrigger = ScrollTrigger.create({
        trigger: ribbon, start: "top bottom", end: "bottom top",
        onToggle: (self) => { marqueeVisible = self.isActive; syncMarquee(); },
      });
      marqueeVisible = ribbonTrigger.isActive;
      const heroVisibility = ScrollTrigger.create({
        trigger: hero, start: "top bottom", end: "bottom top",
        onToggle: (self) => { root.dataset.heroVisible = String(self.isActive); },
      });
      root.dataset.heroVisible = String(heroVisibility.isActive);
      const syncVisibility = () => {
        root.dataset.pageHidden = String(document.hidden);
        syncMarquee();
      };
      document.addEventListener("visibilitychange", syncVisibility);
      cleanups.push(() => {
        document.removeEventListener("visibilitychange", syncVisibility);
        delete ribbon.dataset.running;
      });
      syncVisibility();
      gsap.fromTo(ribbon, { rotation: -2, scale: 1.04 }, {
        rotation: 1, scale: 1.04, ease: "none",
        scrollTrigger: { trigger: ribbon, start: "top bottom", end: "bottom top", scrub: .8 },
      });
      gsap.to(".motion-ribbon__phrase i", {
        rotation: 180, ease: "none",
        scrollTrigger: { trigger: ribbon, start: "top bottom", end: "bottom top", scrub: .8 },
      });

      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        const siblings = element.parentElement?.classList.contains("principles")
          ? Array.from(element.parentElement.children).indexOf(element) : 0;
        gsap.from(element, {
          y: 45, opacity: 0, duration: .9, delay: siblings * .12, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 96%", once: true },
          clearProps: "transform,opacity",
        });
      });

      root.querySelectorAll<HTMLElement>("[data-stage]").forEach((stage) => {
        const visual = stage.querySelector<HTMLElement>("[data-project-visual]");
        gsap.fromTo(stage, { clipPath: "inset(10% 8% 10% 8% round 46px)" }, {
          clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
          scrollTrigger: { trigger: stage, start: "top 95%", end: "top 30%", scrub: .65 },
        });
        gsap.fromTo(visual, { y: responsive(80, 34), scale: .88 }, {
          y: responsive(-50, -18), scale: 1.03, ease: "none",
          scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: .8, invalidateOnRefresh: true },
        });
      });

      gsap.fromTo(".browser-frame", { rotationY: -18, rotationX: 14, rotationZ: -8 }, {
        rotationY: 0, rotationX: 2, rotationZ: 1, ease: "none",
        scrollTrigger: { trigger: ".venfour-stage", start: "top 95%", end: "bottom top", scrub: .9 },
      });
      gsap.fromTo(".venfour-stage__badge", { y: 45, rotation: 14, scale: .85 }, {
        y: -45, rotation: -5, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".venfour-stage", start: "top bottom", end: "bottom top", scrub: 1 },
      });
      gsap.fromTo(".stage-grid", { yPercent: 12, scale: 1.3 }, {
        yPercent: -12, ease: "none",
        scrollTrigger: { trigger: ".venfour-stage", start: "top bottom", end: "bottom top", scrub: 1 },
      });

      const fanTrigger = { trigger: ".imposter-stage", start: "top 92%", end: "top 18%", scrub: .9 };
      gsap.fromTo(".imposter-poster--left", { xPercent: 80, rotation: -2, y: 25 }, {
        xPercent: 0, rotation: -12, y: 0, ease: "none", scrollTrigger: { ...fanTrigger },
      });
      gsap.fromTo(".imposter-poster--right", { xPercent: -80, rotation: 2, y: 25 }, {
        xPercent: 0, rotation: 12, y: 0, ease: "none", scrollTrigger: { ...fanTrigger },
      });
      gsap.fromTo(".imposter-poster--center", { y: 65, scale: .93, rotation: -3 }, {
        y: 0, scale: 1, rotation: 0, ease: "none", scrollTrigger: { ...fanTrigger },
      });
      gsap.fromTo(".imposter-stage__cat", { y: 65, rotation: -28, scale: .7 }, {
        y: -30, rotation: 12, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".imposter-stage", start: "top 85%", end: "bottom top", scrub: 1 },
      });
      gsap.fromTo(".imposter-stage__ghost", { xPercent: -10 }, {
        xPercent: 8, ease: "none",
        scrollTrigger: { trigger: ".imposter-stage", start: "top bottom", end: "bottom top", scrub: 1.1 },
      });

      root.querySelectorAll<HTMLElement>(".ink-reveal").forEach((line) => {
        gsap.fromTo(line, { backgroundPosition: "100% 0" }, {
          backgroundPosition: "0% 0", ease: "none",
          scrollTrigger: { trigger: line, start: "top 88%", end: "top 52%", scrub: .45 },
        });
      });
      root.querySelectorAll<HTMLElement>(".principle").forEach((principle, index) => {
        const shapes = principle.querySelectorAll(".principle__graphic i");
        const trigger = { trigger: principle, start: "top 90%", end: "bottom 35%", scrub: .8 };
        if (index === 0) {
          gsap.fromTo(shapes, { x: (i) => (i - 1) * 20, scale: .65 }, {
            x: 0, scale: 1, stagger: .1, ease: "none", scrollTrigger: trigger,
          });
        } else if (index === 1) {
          gsap.fromTo(shapes, { y: (i) => i * 22, rotation: (i) => i * -12 }, {
            y: 0, rotation: 0, stagger: .1, ease: "none", scrollTrigger: trigger,
          });
        } else {
          gsap.fromTo(shapes, { rotation: (i) => i * 30 }, {
            rotation: (i) => i * 30 + 180, ease: "none", scrollTrigger: trigger,
          });
        }
      });
      gsap.from(".closing .motion-letter, .closing__period", {
        yPercent: 115, rotationX: -70, rotation: 5, opacity: 0, duration: 1.05,
        stagger: .035, ease: "power4.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".closing__cta", start: "top 93%", once: true },
      });
      gsap.from(".closing__arrow-wrap", {
        y: 60, rotation: 80, scale: .4, opacity: 0, duration: 1.2, ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".closing__cta", start: "top 93%", once: true },
      });

      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const sculpture = root.querySelector<HTMLElement>("[data-sculpture]");
        if (sculpture) {
          const rotateX = gsap.quickTo(sculpture, "rotationX", { duration: .8, ease: "power3.out" });
          const rotateY = gsap.quickTo(sculpture, "rotationY", { duration: .8, ease: "power3.out" });
          const move = (event: PointerEvent) => {
            const bounds = hero.getBoundingClientRect();
            rotateX((event.clientY - bounds.top - bounds.height / 2) / bounds.height * -28);
            rotateY((event.clientX - bounds.left - bounds.width / 2) / bounds.width * 42);
          };
          const leave = () => { rotateX(0); rotateY(0); };
          hero.addEventListener("pointermove", move, { passive: true });
          hero.addEventListener("pointerleave", leave);
          cleanups.push(() => { hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave); });
        }

        root.querySelectorAll<HTMLElement>("[data-stage]").forEach((stage) => {
          const depth = stage.querySelector<HTMLElement>(".project-depth")!;
          const cursor = stage.querySelector<HTMLElement>(".project-cursor")!;
          gsap.set(depth, { transformPerspective: 1200 });
          gsap.set(cursor, { x: 0, y: 0 });
          const tiltX = gsap.quickTo(depth, "rotationX", { duration: .8, ease: "power3.out" });
          const tiltY = gsap.quickTo(depth, "rotationY", { duration: .8, ease: "power3.out" });
          const cursorX = gsap.quickTo(cursor, "x", { duration: .35, ease: "power3.out" });
          const cursorY = gsap.quickTo(cursor, "y", { duration: .35, ease: "power3.out" });
          const cursorReveal = gsap.fromTo(cursor, { autoAlpha: 0, scale: .5 }, {
            autoAlpha: 1, scale: 1, duration: .3, ease: "power2.out", paused: true,
          });
          const move = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            const bounds = stage.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            tiltX((y / bounds.height - .5) * -9);
            tiltY((x / bounds.width - .5) * 12);
            cursorX(Math.max(50, Math.min(x, bounds.width - 50)));
            cursorY(Math.max(50, Math.min(y, bounds.height - 50)));
            cursorReveal.play();
          };
          const leave = () => { tiltX(0); tiltY(0); cursorReveal.reverse(); };
          stage.addEventListener("pointermove", move, { passive: true });
          stage.addEventListener("pointerleave", leave);
          stage.addEventListener("blur", leave);
          cleanups.push(() => {
            stage.removeEventListener("pointermove", move);
            stage.removeEventListener("pointerleave", leave);
            stage.removeEventListener("blur", leave);
          });
        });

        root.querySelectorAll<HTMLElement>(".text-link, .closing__cta").forEach((link) => {
          const arrow = link.querySelector<HTMLElement>(".closing__arrow") ?? link.querySelector<HTMLElement>("span");
          if (!arrow) return;
          const distance = link.classList.contains("closing__cta") ? 22 : 8;
          const x = gsap.quickTo(arrow, "x", { duration: .5, ease: "power3.out" });
          const y = gsap.quickTo(arrow, "y", { duration: .5, ease: "power3.out" });
          const move = (event: PointerEvent) => {
            const bounds = link.getBoundingClientRect();
            x((event.clientX - bounds.left - bounds.width / 2) / bounds.width * distance);
            y((event.clientY - bounds.top - bounds.height / 2) / bounds.height * distance);
          };
          const leave = () => { x(0); y(0); };
          link.addEventListener("pointermove", move, { passive: true });
          link.addEventListener("pointerleave", leave);
          cleanups.push(() => { link.removeEventListener("pointermove", move); link.removeEventListener("pointerleave", leave); });
        });
      }
    }, root);
    ScrollTrigger.refresh();
  }

  const details = root.querySelectorAll("details");
  const refreshLayout = () => ScrollTrigger.refresh();
  details.forEach((detail) => detail.addEventListener("toggle", refreshLayout));
  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", requestProgress, { passive: true });
  window.addEventListener("motionpreferencechange", setup);
  media.addEventListener("change", setup);
  setup();
  updateProgress();
  void document.fonts.ready.then(() => {
    if (disposed || !root.isConnected) return;
    initialAnchorFrame = requestAnimationFrame(() => {
      if (disposed || !root.isConnected) return;
      ScrollTrigger.refresh();
      if (!initialHash || window.location.hash !== initialHash) return;
      let id: string;
      try {
        id = decodeURIComponent(initialHash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (target && root.contains(target)) {
        target.scrollIntoView({ behavior: "instant", block: "start" });
        ScrollTrigger.update();
      }
    });
  });

  return () => {
    disposed = true;
    clearEffects();
    window.removeEventListener("scroll", requestProgress);
    window.removeEventListener("resize", requestProgress);
    window.removeEventListener("motionpreferencechange", setup);
    media.removeEventListener("change", setup);
    details.forEach((detail) => detail.removeEventListener("toggle", refreshLayout));
    cancelAnimationFrame(frame);
    cancelAnimationFrame(initialAnchorFrame);
    root.dataset.motion = "static";
  };
}
