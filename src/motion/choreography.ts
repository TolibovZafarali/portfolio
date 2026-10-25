import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContinuity } from "./continuity";

gsap.registerPlugin(ScrollTrigger);

const responsive = (desktop: number, mobile: number) => () => window.innerWidth > 768 ? desktop : mobile;

export function createChoreography(root: HTMLElement) {
  let context: gsap.Context | undefined;
  let cleanups: (() => void)[] = [];
  let frame = 0;
  let layoutFrame = 0;
  let initialAnchorFrame = 0;
  let disposed = false;
  let initialized = false;
  let cachedReadingAnchor: HTMLElement | null = null;
  let cachedReadingTop = 24;
  const revealedElements = new WeakSet<HTMLElement>();
  let closingRevealed = false;
  const initialHash = window.location.hash;
  let initialAnchorAllowed = true;
  const cancelInitialAnchor = () => { initialAnchorAllowed = false; };
  const initialInteractions = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  const releaseInitialAnchor = () => initialInteractions.forEach((event) => window.removeEventListener(event, cancelInitialAnchor));
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cinematicMedia = window.matchMedia("(min-height: 601px)");
  let previousCinematicMedia = cinematicMedia.matches;
  const progress = root.querySelector<HTMLElement>("[data-page-progress]");

  function updateProgress() {
    frame = 0;
    const maximum = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (progress) progress.style.transform = `scaleX(${Math.min(window.scrollY / maximum, 1)})`;
    if (initialized && previousCinematicMedia === cinematicMedia.matches) {
      cachedReadingAnchor = readingAnchor() ?? null;
      cachedReadingTop = cachedReadingAnchor?.getBoundingClientRect().top ?? 24;
    }
  }

  function requestProgress() {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  }

  function clearEffects() {
    context?.revert({ suppressEvents: true });
    context = undefined;
    cleanups.forEach((cleanup) => cleanup());
    cleanups = [];
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
    const pointedProcess = document.elementFromPoint(window.innerWidth * .35, center)
      ?.closest<HTMLElement>(".about__intro, .principle");
    if (pointedProcess && root.contains(pointedProcess)) return pointedProcess;
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
    const preference = document.documentElement.dataset.motionPreference;
    const reduced = preference === "reduce" || (media.matches && preference !== "full");
    const breakpointChanged = previousCinematicMedia !== cinematicMedia.matches;
    const cachedAnchor = breakpointChanged && cachedReadingAnchor?.isConnected ? cachedReadingAnchor : null;
    const visibleAnchor = initialized ? cachedAnchor ?? readingAnchor() : null;
    const previousTop = cachedAnchor ? cachedReadingTop : visibleAnchor?.getBoundingClientRect().top;
    const settleScroll = () => {
      ScrollTrigger.update();
      ScrollTrigger.getAll().forEach((trigger) => {
        const tween = trigger.getTween();
        if (tween && typeof tween.progress === "function") tween.progress(1);
      });
    };
    const restorePosition = () => {
      if (visibleAnchor?.isConnected && previousTop !== undefined) {
        const adjustment = visibleAnchor.getBoundingClientRect().top - previousTop;
        if (Math.abs(adjustment) > 1) window.scrollBy({ top: adjustment, behavior: "instant" });
        settleScroll();
      }
      initialized = true;
      previousCinematicMedia = cinematicMedia.matches;
      requestProgress();
    };
    clearEffects();
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
        .from("[data-hero-intro] > *, .hero__eyebrow > span", {
          opacity: 0, y: 24, duration: .9, stagger: .12, clearProps: "opacity,transform",
        }, .55);
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(monogram, { opacity: 0, duration: 1.5, clearProps: "opacity" }, .18)
          .from(`${monogram} .monogram__entrance`, {
            rotationY: -88, rotationZ: 31, scale: .55,
            duration: 1.5, clearProps: "transform",
          }, .18);
        const finishEntrance = () => {
          if (window.scrollY <= 24) return;
          entrance.progress(1).kill();
          window.removeEventListener("scroll", finishEntrance);
        };
        window.addEventListener("scroll", finishEntrance, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", finishEntrance));
      }

      if (cinematic) {
        const palette = getComputedStyle(root);
        const accentFront = palette.getPropertyValue("--accent-on-dark").trim();
        const accentDepth = palette.getPropertyValue("--accent-depth").trim();
        const accentHighlight = palette.getPropertyValue("--accent-highlight").trim();
        const edgeShades = Array.from({ length: 3 }, (_, index) => gsap.utils.interpolate(accentDepth, accentFront, index / 3));
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
          .to(`${monogram} .monogram__surface`, { fill: accentFront, stroke: accentHighlight, duration: .28 }, .24)
          .to(`${monogram} .monogram__face--back`, { fill: accentDepth, duration: .28 }, .24)
          .to(`${monogram} .monogram__highlight`, { stroke: accentHighlight, duration: .28 }, .24)
          .to(`${monogram} .monogram__edge`, { backgroundColor: (i) => edgeShades[i % edgeShades.length]!, duration: .28 }, .24)
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

      root.querySelectorAll<HTMLElement>("[data-reveal], [data-stage]").forEach((element) => {
        if (revealedElements.has(element) || (initialized && element.getBoundingClientRect().top < window.innerHeight * .96)) {
          revealedElements.add(element);
          return;
        }
        const siblings = element.parentElement?.classList.contains("principles")
          ? Array.from(element.parentElement.children).indexOf(element) : 0;
        gsap.from(element, {
          y: 20, opacity: 0, duration: .55, delay: siblings * .06, ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 96%", once: true, onEnter: () => { revealedElements.add(element); } },
          clearProps: "transform,opacity",
        });
      });
      const closing = root.querySelector<HTMLElement>(".closing__cta")!;
      if (!closingRevealed && !(initialized && closing.getBoundingClientRect().top < window.innerHeight * .93)) {
        gsap.from(closing, {
          y: 20, opacity: 0, duration: .6, ease: "power2.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: closing, start: "top 93%", once: true, onEnter: () => { closingRevealed = true; } },
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
          const depth = stage.querySelector<HTMLElement>(".project-depth");
          if (!depth) return;
          gsap.set(depth, { transformPerspective: 1600 });
          const tiltX = gsap.quickTo(depth, "rotationX", { duration: .7, ease: "power3.out" });
          const tiltY = gsap.quickTo(depth, "rotationY", { duration: .7, ease: "power3.out" });
          const move = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            const bounds = stage.getBoundingClientRect();
            tiltX((event.clientY - bounds.top - bounds.height / 2) / bounds.height * -4);
            tiltY((event.clientX - bounds.left - bounds.width / 2) / bounds.width * 4);
          };
          const leave = () => { tiltX(0); tiltY(0); };
          stage.addEventListener("pointermove", move, { passive: true });
          stage.addEventListener("pointerleave", leave);
          stage.addEventListener("blur", leave);
          window.addEventListener("blur", leave);
          cleanups.push(() => {
            stage.removeEventListener("pointermove", move);
            stage.removeEventListener("pointerleave", leave);
            stage.removeEventListener("blur", leave);
            window.removeEventListener("blur", leave);
          });
        });
      }
    }, root);
    ScrollTrigger.refresh();
    restorePosition();
  }

  const details = root.querySelectorAll("details");
  const refreshLayout = () => { ScrollTrigger.refresh(); requestProgress(); };
  const requestLayoutRefresh = () => {
    if (layoutFrame) return;
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = 0;
      if (!disposed) refreshLayout();
    });
  };
  details.forEach((detail) => detail.addEventListener("toggle", refreshLayout));
  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", requestLayoutRefresh, { passive: true });
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
    window.removeEventListener("resize", requestLayoutRefresh);
    window.removeEventListener("motionpreferencechange", setup);
    media.removeEventListener("change", setup);
    cinematicMedia.removeEventListener("change", setup);
    details.forEach((detail) => detail.removeEventListener("toggle", refreshLayout));
    cancelAnimationFrame(frame);
    cancelAnimationFrame(layoutFrame);
    cancelAnimationFrame(initialAnchorFrame);
    releaseInitialAnchor();
    root.dataset.motion = "static";
  };
}
