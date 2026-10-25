import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContinuity } from "./continuity";

gsap.registerPlugin(ScrollTrigger);

const responsive = (desktop: number, mobile: number) => () => window.innerWidth > 768 ? desktop : mobile;

export function createChoreography(root: HTMLElement) {
  let context: gsap.Context | undefined;
  let cleanups: (() => void)[] = [];
  let frame = 0;
  let initialAnchorFrame = 0;
  let disposed = false;
  let initialized = false;
  const revealedElements = new WeakSet<HTMLElement>();
  let closingRevealed = false;
  const initialHash = window.location.hash;
  let initialAnchorAllowed = true;
  const cancelInitialAnchor = () => { initialAnchorAllowed = false; };
  const initialInteractions = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  const releaseInitialAnchor = () => initialInteractions.forEach((event) => window.removeEventListener(event, cancelInitialAnchor));
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cinematicMedia = window.matchMedia("(min-height: 601px)");
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
    delete root.dataset.journeyActive;
    const hero = root.querySelector<HTMLElement>(".hero");
    if (hero) {
      hero.dataset.journeyProgress = "0";
      hero.dispatchEvent(new CustomEvent("heroprogress", { detail: 0 }));
    }
  }

  function readingAnchor() {
    const selector = ".hero, .motion-ribbon, .work-intro, .project__heading, .project-stage, .project__copy, .about .section-kicker, .about__intro, .principle, .about__footnote, .closing";
    const center = window.innerHeight * .5;
    const readingStart = [...root.querySelectorAll<HTMLElement>(".work-intro, .project__heading")]
      .map((element) => ({ element, bounds: element.getBoundingClientRect() }))
      .filter(({ bounds }) => bounds.height > 0 && bounds.top >= -24 && bounds.top < Math.min(140, window.innerHeight * .2))
      .sort((a, b) => Math.abs(a.bounds.top - 24) - Math.abs(b.bounds.top - 24));
    if (readingStart[0]) return readingStart[0].element;
    const pointed = document.elementFromPoint(window.innerWidth * .35, center)?.closest<HTMLElement>(selector);
    if (pointed && root.contains(pointed)) return pointed;
    const candidates = [...root.querySelectorAll<HTMLElement>(selector)]
      .map((element) => ({ element, bounds: element.getBoundingClientRect() }))
      .filter(({ bounds }) => bounds.height > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight)
      .sort((a, b) => {
        const distance = (bounds: DOMRect) => Math.max(bounds.top - center, center - bounds.bottom, 0);
        return distance(a.bounds) - distance(b.bounds);
      });
    return candidates[0]?.element
      ?? document.elementFromPoint(window.innerWidth * .35, center)?.closest<HTMLElement>(".project, .selected-work, .about");
  }

  function setup() {
    const handoff = initialized ? root.querySelector<HTMLElement>(".project-handoff")?.getBoundingClientRect() : undefined;
    const insideHandoff = handoff && handoff.height > 0 && handoff.top <= window.innerHeight * .5 && handoff.bottom > window.innerHeight * .5;
    const visibleAnchor = insideHandoff
      ? root.querySelector<HTMLElement>("#imposter .project-stage")
      : initialized ? readingAnchor() : null;
    const previousTop = insideHandoff ? 24 : visibleAnchor?.getBoundingClientRect().top;
    const restorePosition = () => {
      if (visibleAnchor?.isConnected && previousTop !== undefined) {
        const adjustment = visibleAnchor.getBoundingClientRect().top - previousTop;
        if (Math.abs(adjustment) > 1) window.scrollBy({ top: adjustment, behavior: "instant" });
        ScrollTrigger.update();
      }
      initialized = true;
      requestProgress();
    };
    clearEffects();
    const preference = document.documentElement.dataset.motionPreference;
    const reduced = preference === "reduce" || (media.matches && preference !== "full");
    root.dataset.motion = reduced ? "reduced" : "ready";
    if (reduced) {
      restorePosition();
      return;
    }

    context = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>(".hero")!;
      const journey = root.querySelector<HTMLElement>(".hero-journey")!;
      const cinematic = cinematicMedia.matches;
      const monogram = cinematic ? ".continuous-artwork .monogram" : ".hero .monogram";
      const ribbon = root.querySelector<HTMLElement>(".motion-ribbon")!;
      if (!initialized && window.scrollY < 10 && (!initialHash || initialHash === "#top")) {
        const entrance = gsap.timeline({ defaults: { ease: "power4.out" } });
        entrance
        .from(".hero .motion-letter", {
          yPercent: 115, rotationX: -65, rotation: 6, opacity: 0,
          duration: 1.05, stagger: .035, clearProps: "transform,opacity",
        }, .05)
        .from(`${monogram} .monogram__solid`, {
          rotationY: -115, rotationZ: 20, scale: .55, opacity: 0,
          duration: 1.5, clearProps: "transform,opacity",
        }, .18)
        .from("[data-hero-intro] > *, .hero__eyebrow > span", {
          opacity: 0, y: 24, duration: .9, stagger: .12, clearProps: "opacity,transform",
        }, .55);
        const finishEntrance = () => {
          if (window.scrollY <= 24) return;
          entrance.progress(1).kill();
          window.removeEventListener("scroll", finishEntrance);
        };
        window.addEventListener("scroll", finishEntrance, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", finishEntrance));
      }

      if (cinematic) {
        const sculpture = root.querySelector<HTMLElement>(".hero__sculpture")!;
        const composition = root.querySelector<HTMLElement>(".hero__composition")!;
        const centerX = (fraction: number) => hero.clientWidth * fraction - composition.offsetLeft - sculpture.offsetLeft - sculpture.offsetWidth / 2;
        const centerY = (fraction: number) => hero.clientHeight * fraction - composition.offsetTop - sculpture.offsetTop - sculpture.offsetHeight / 2;
        const chapter = root.querySelector<HTMLElement>(".hero__chapter")!;
        const publishProgress = (value: number) => {
          hero.dataset.journeyProgress = value.toFixed(4);
          root.dataset.journeyActive = String(value > .02);
          hero.dispatchEvent(new CustomEvent("heroprogress", { detail: value }));
        };
        const journeyTimeline = gsap.timeline({
          defaults: { ease: "power1.inOut" },
          scrollTrigger: { trigger: journey, start: "top top", end: "bottom bottom", scrub: .7, invalidateOnRefresh: true },
          onUpdate: function (this: gsap.core.Timeline) { publishProgress(this.progress()); },
        });
        journeyTimeline
          .to('[data-hero-line="first"]', { xPercent: -65, opacity: 0, rotation: -5, duration: .32 }, .025)
          .to('[data-hero-line="second"]', { xPercent: 65, opacity: 0, rotation: 5, duration: .32 }, .055)
          .fromTo(".hero__eyebrow", { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -25, duration: .18 }, .025)
          .fromTo("[data-hero-intro]", { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 35, duration: .2 }, .025)
          .to(".hero__iris", { scale: 1, duration: .4 }, .12)
          .to(sculpture, { x: () => centerX(.53), y: () => centerY(.5), scale: 1.35, duration: .5 }, 0)
          .to(sculpture, { x: () => centerX(window.innerWidth > 768 ? .77 : .63), y: () => centerY(window.innerWidth > 768 ? .52 : .69), scale: responsive(1.65, 1.05), duration: .45 }, .5)
          .to(`${monogram} .monogram__orbit`, { rotationY: 360, rotationX: 14, rotationZ: -10, duration: .88 }, .05)
          .to(`${monogram} .monogram__shadow`, { opacity: 0, duration: .2 }, .05)
          .to(`${monogram} .monogram__surface`, { fill: "#d8efac", stroke: "#edf4d9", duration: .28 }, .24)
          .to(`${monogram} .monogram__face--back`, { fill: "#a8b69b", duration: .28 }, .24)
          .to(`${monogram} .monogram__highlight`, { stroke: "#f0f8dd", duration: .28 }, .24)
          .to(`${monogram} .monogram__edge`, { backgroundColor: (i) => `hsl(80, 12%, ${53 + (i % 3) * 9}%)`, duration: .28 }, .24)
          .fromTo(chapter, { autoAlpha: 0, y: 45 }, { autoAlpha: 1, y: 0, duration: .28 }, .54)
          .fromTo(chapter.querySelectorAll("p > span"), { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .22, stagger: .055 }, .56)
          .to(".hero__sequence", { opacity: 1, duration: .25 }, .54)
          .to(".hero__sequence-line i", { scaleX: 1, duration: 1, ease: "none" }, 0);
        publishProgress(journeyTimeline.progress());
      } else {
        gsap.to('[data-hero-line="first"]', { xPercent: -12, ease: "none", scrollTrigger: { trigger: journey, start: "top top", end: "bottom top", scrub: .7 } });
        gsap.to('[data-hero-line="second"]', { xPercent: 12, ease: "none", scrollTrigger: { trigger: journey, start: "top top", end: "bottom top", scrub: .7 } });
        gsap.to(".hero__sculpture", { y: -45, rotation: -24, scale: .8, ease: "none", scrollTrigger: { trigger: journey, start: "top top", end: "bottom top", scrub: .8 } });
      }

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
        trigger: journey, start: "top bottom", end: "bottom top",
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
        if (revealedElements.has(element) || (initialized && element.getBoundingClientRect().top < window.innerHeight * .96)) {
          revealedElements.add(element);
          return;
        }
        const siblings = element.parentElement?.classList.contains("principles")
          ? Array.from(element.parentElement.children).indexOf(element) : 0;
        gsap.from(element, {
          y: 45, opacity: 0, duration: .9, delay: siblings * .12, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 96%", once: true, onEnter: () => { revealedElements.add(element); } },
          clearProps: "transform,opacity",
        });
      });

      root.querySelectorAll<HTMLElement>("[data-stage]").forEach((stage) => {
        const screen = stage.closest<HTMLElement>(".project-screen")!;
        const visual = stage.querySelector<HTMLElement>("[data-project-visual]");
        if (!cinematic) gsap.fromTo(stage, { clipPath: "inset(10% 8% 10% 8% round 46px)" }, {
          clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
          scrollTrigger: { trigger: screen, start: "top 95%", end: "top 10%", scrub: .65 },
        });
        if (!cinematic) gsap.fromTo(visual, { y: responsive(80, 34), scale: .88 }, {
          y: responsive(-50, -18), scale: 1.03, ease: "none",
          scrollTrigger: { trigger: screen, start: "top bottom", end: "bottom top", scrub: .8, invalidateOnRefresh: true },
        });
        gsap.to(stage.querySelector(".project-timeline i"), {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: screen, start: cinematic ? "top top" : "top 85%", end: cinematic ? "bottom bottom" : "bottom 20%", scrub: .3 },
        });
      });

      if (!cinematic) gsap.fromTo(".browser-frame", { rotationY: -18, rotationX: 14, rotationZ: -8 }, {
        rotationY: 0, rotationX: 2, rotationZ: 1, ease: "none",
        scrollTrigger: { trigger: ".project--venfour .project-screen", start: "top 95%", end: "bottom bottom", scrub: .9 },
      });
      if (!cinematic) gsap.fromTo(".venfour-stage__badge", { y: 45, rotation: 14, scale: .85 }, {
        y: -45, rotation: -5, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".project--venfour .project-screen", start: "top bottom", end: "bottom top", scrub: 1 },
      });
      gsap.fromTo(".stage-grid", { yPercent: 12, scale: 1.3 }, {
        yPercent: -12, ease: "none",
        scrollTrigger: { trigger: ".project--venfour .project-screen", start: "top bottom", end: "bottom top", scrub: 1 },
      });

      if (!cinematic) {
        const fanTrigger = { trigger: ".project--imposter .project-screen", start: "top 92%", end: "top 18%", scrub: .9 };
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
          scrollTrigger: { trigger: ".project--imposter .project-screen", start: "top 85%", end: "bottom top", scrub: 1 },
        });
      }
      gsap.fromTo(".imposter-stage__ghost", { xPercent: -10 }, {
        xPercent: 8, ease: "none",
        scrollTrigger: { trigger: ".project--imposter .project-screen", start: "top bottom", end: "bottom top", scrub: 1.1 },
      });
      gsap.fromTo(".project-cinematic-title", { xPercent: -12 }, {
        xPercent: 12, ease: "none",
        scrollTrigger: { trigger: ".project--venfour .project-screen", start: "top bottom", end: "bottom top", scrub: 1 },
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
      const closing = root.querySelector<HTMLElement>(".closing__cta")!;
      if (!closingRevealed && !(initialized && closing.getBoundingClientRect().top < window.innerHeight * .93)) {
        gsap.from(".closing .motion-letter, .closing__period", {
          yPercent: 115, rotationX: -70, rotation: 5, opacity: 0, duration: 1.05,
          stagger: .035, ease: "power4.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: closing, start: "top 93%", once: true, onEnter: () => { closingRevealed = true; } },
        });
        if (!cinematic) gsap.from(".closing__arrow-wrap", {
          y: 60, rotation: 80, scale: .4, opacity: 0, duration: 1.2, ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: ".closing__cta", start: "top 93%", once: true },
        });
      } else {
        closingRevealed = true;
      }

      if (cinematic) cleanups.push(createContinuity(root));

      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const sculpture = root.querySelector<HTMLElement>(`${monogram} [data-sculpture]`);
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
          if (!cinematic) gsap.set(depth, { transformPerspective: 1200 });
          gsap.set(cursor, { x: 0, y: 0 });
          const tiltX = cinematic ? undefined : gsap.quickTo(depth, "rotationX", { duration: .8, ease: "power3.out" });
          const tiltY = cinematic ? undefined : gsap.quickTo(depth, "rotationY", { duration: .8, ease: "power3.out" });
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
            tiltX?.((y / bounds.height - .5) * -9);
            tiltY?.((x / bounds.width - .5) * 12);
            cursorX(Math.max(50, Math.min(x, bounds.width - 50)));
            cursorY(Math.max(50, Math.min(y, bounds.height - 50)));
            cursorReveal.play();
          };
          const leave = () => { tiltX?.(0); tiltY?.(0); cursorReveal.reverse(); };
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
          if (cinematic && link.classList.contains("closing__cta")) return;
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
    restorePosition();
  }

  const details = root.querySelectorAll("details");
  const refreshLayout = () => { ScrollTrigger.refresh(); requestProgress(); };
  details.forEach((detail) => detail.addEventListener("toggle", refreshLayout));
  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", requestProgress, { passive: true });
  window.addEventListener("motionpreferencechange", setup);
  media.addEventListener("change", setup);
  cinematicMedia.addEventListener("change", setup);
  initialInteractions.forEach((event) => window.addEventListener(event, cancelInitialAnchor, { passive: true }));
  setup();
  updateProgress();
  void document.fonts.ready.then(() => {
    if (disposed || !root.isConnected) return;
    initialAnchorFrame = requestAnimationFrame(() => {
      if (disposed || !root.isConnected) return;
      ScrollTrigger.refresh();
      releaseInitialAnchor();
      if (!initialAnchorAllowed || !initialHash || window.location.hash !== initialHash) return;
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
    cinematicMedia.removeEventListener("change", setup);
    details.forEach((detail) => detail.removeEventListener("toggle", refreshLayout));
    cancelAnimationFrame(frame);
    cancelAnimationFrame(initialAnchorFrame);
    releaseInitialAnchor();
    root.dataset.motion = "static";
  };
}
