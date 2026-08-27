import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION } from "./tokens";

gsap.registerPlugin(ScrollTrigger);

type Axis = "desktop" | "mobile";

function queryRequired<T extends Element>(scope: ParentNode, selector: string): T {
  const element = scope.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing choreography target: ${selector}`);
  }

  return element;
}

function createTimeline(trigger: HTMLElement) {
  return gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "bottom bottom",
      scrub: MOTION.scrub,
      invalidateOnRefresh: true,
    },
  });
}

function setupHero(root: HTMLElement, axis: Axis) {
  const scene = queryRequired<HTMLElement>(root, '[data-scene="top"]');
  const lead = queryRequired<HTMLElement>(scene, '[data-hero-panel="lead"]');
  const trail = queryRequired<HTMLElement>(scene, '[data-hero-panel="trail"]');
  const underlay = queryRequired<HTMLElement>(scene, "[data-hero-underlay]");
  const incision = queryRequired<HTMLElement>(scene, "[data-hero-incision]");
  const travel = MOTION[axis].heroPanelTravel;
  const horizontal = axis === "desktop";

  gsap.set([lead, trail], { clearProps: "transform" });
  gsap.set(underlay, { scale: 1.055, transformOrigin: "50% 50%" });

  const timeline = createTimeline(scene);

  timeline
    .to(
      lead,
      horizontal
        ? { xPercent: -travel, duration: MOTION.hero.travel }
        : { yPercent: -travel, duration: MOTION.hero.travel },
      MOTION.hero.dwell,
    )
    .to(
      trail,
      horizontal
        ? { xPercent: travel, duration: MOTION.hero.travel }
        : { yPercent: travel, duration: MOTION.hero.travel },
      MOTION.hero.dwell,
    )
    .to(
      underlay,
      { scale: 1, duration: MOTION.hero.travel + MOTION.hero.settle },
      MOTION.hero.dwell,
    )
    .to(
      incision,
      horizontal
        ? { x: "7vw", scaleY: 0.7, duration: MOTION.hero.travel }
        : { y: "7svh", scaleX: 0.7, duration: MOTION.hero.travel },
      MOTION.hero.dwell,
    );
}

function setupPlane(root: HTMLElement, axis: Axis) {
  const scene = queryRequired<HTMLElement>(root, '[data-scene="plane"]');
  const slab = queryRequired<HTMLElement>(scene, "[data-plane-slab]");
  const band = queryRequired<HTMLElement>(scene, "[data-plane-band]");
  const horizontal = axis === "desktop";

  gsap.set(
    slab,
    horizontal
      ? { xPercent: MOTION.desktop.planeStart }
      : { yPercent: MOTION.mobile.planeStart },
  );
  gsap.set(
    band,
    horizontal
      ? { xPercent: MOTION.desktop.bandStart }
      : { yPercent: MOTION.mobile.bandStart },
  );

  const timeline = createTimeline(scene);

  timeline
    .to(
      slab,
      horizontal
        ? { xPercent: MOTION.desktop.planeEnd, duration: MOTION.project.travel }
        : { yPercent: MOTION.mobile.planeEnd, duration: MOTION.project.travel },
      MOTION.project.dwell,
    )
    .to(
      band,
      horizontal
        ? { xPercent: MOTION.desktop.bandEnd, duration: MOTION.project.travel }
        : { yPercent: MOTION.mobile.bandEnd, duration: MOTION.project.travel },
      MOTION.project.dwell,
    );
}

function setupType(root: HTMLElement, axis: Axis) {
  const scene = queryRequired<HTMLElement>(root, '[data-scene="type"]');
  const sweep = queryRequired<HTMLElement>(scene, "[data-type-sweep]");
  const carrier = queryRequired<HTMLElement>(scene, "[data-type-carrier]");
  const horizontal = axis === "desktop";
  gsap.set(sweep, { "--type-clip": "100%" });
  gsap.set(carrier, horizontal ? { x: "-1rem" } : { y: "-1rem" });

  const timeline = createTimeline(scene);

  timeline
    .to(
      sweep,
      { "--type-clip": "0%", duration: MOTION.project.travel },
      MOTION.project.dwell,
    )
    .to(
      carrier,
      horizontal
        ? { x: "100vw", duration: MOTION.project.travel }
        : { y: "100svh", duration: MOTION.project.travel },
      MOTION.project.dwell,
    );
}

function setupRoute(root: HTMLElement, axis: Axis) {
  const scene = queryRequired<HTMLElement>(root, '[data-scene="route"]');
  const aperture = queryRequired<HTMLElement>(scene, "[data-route-aperture]");
  const node = queryRequired<HTMLElement>(scene, "[data-route-node]");
  const horizontal = axis === "desktop";
  const inset = MOTION[axis].routeInset;

  gsap.set(aperture, { "--route-inset": `${inset}%` });
  gsap.set(node, horizontal ? { xPercent: -MOTION.desktop.routeNodeTravel } : { yPercent: -MOTION.mobile.routeNodeTravel });

  const timeline = createTimeline(scene);

  timeline
    .to(
      aperture,
      { "--route-inset": "0%", duration: MOTION.project.travel },
      MOTION.project.dwell,
    )
    .to(
      node,
      horizontal
        ? { xPercent: MOTION.desktop.routeNodeTravel, duration: 0.28 }
        : { yPercent: MOTION.mobile.routeNodeTravel, duration: 0.28 },
      0.56,
    );
}

function setupSystem(root: HTMLElement) {
  const scene = queryRequired<HTMLElement>(root, '[data-scene="operations"]');
  const carrier = queryRequired<HTMLElement>(scene, "[data-system-carrier]");
  const rows = Array.from(scene.querySelectorAll<HTMLElement>("[data-system-row]"));

  gsap.set(carrier, { top: `${MOTION.system.carrierStart}%`, y: 0 });
  gsap.set(rows, {
    "--row-weight": 430,
    "--row-shift": "0rem",
    "--row-reveal": "0%",
  });

  const timeline = createTimeline(scene);
  timeline.to(
    carrier,
    {
      y: () =>
        (carrier.parentElement?.getBoundingClientRect().height ?? window.innerHeight) *
        ((MOTION.system.carrierEnd - MOTION.system.carrierStart) / 100),
      duration: 0.8,
    },
    0.1,
  );

  rows.forEach((row, index) => {
    const available = 0.72;
    const step = rows.length > 1 ? available / (rows.length - 1) : MOTION.system.rowStep;
    const start = MOTION.system.rowStart + index * step;
    timeline
      .to(
        row,
        {
          "--row-weight": 760,
          "--row-shift": "0.35rem",
          "--row-reveal": "100%",
          duration: MOTION.system.rowPeak,
        },
        start,
      )
      .to(
        row,
        {
          "--row-weight": 430,
          "--row-shift": "0rem",
          "--row-reveal": "0%",
          duration: MOTION.system.rowPeak,
        },
        start + MOTION.system.rowPeak,
      );
  });
}

function setupClosing(root: HTMLElement, axis: Axis) {
  const scene = queryRequired<HTMLElement>(root, '[data-scene="close"]');
  const lead = queryRequired<HTMLElement>(scene, '[data-closing-panel="lead"]');
  const trail = queryRequired<HTMLElement>(scene, '[data-closing-panel="trail"]');
  const incision = queryRequired<HTMLElement>(scene, "[data-closing-incision]");
  const horizontal = axis === "desktop";
  const travel = MOTION[axis].heroPanelTravel;

  gsap.set(lead, horizontal ? { xPercent: -travel } : { yPercent: -travel });
  gsap.set(trail, horizontal ? { xPercent: travel } : { yPercent: travel });
  gsap.set(incision, horizontal ? { scaleY: 0.35 } : { scaleX: 0.35 });

  const timeline = createTimeline(scene);

  timeline
    .to(
      [lead, trail],
      horizontal
        ? { xPercent: 0, duration: MOTION.hero.travel }
        : { yPercent: 0, duration: MOTION.hero.travel },
      MOTION.hero.dwell,
    )
    .to(
      incision,
      horizontal
        ? { scaleY: 1, duration: MOTION.hero.travel }
        : { scaleX: 1, duration: MOTION.hero.travel },
      MOTION.hero.dwell,
    );
}

function setupAxis(root: HTMLElement, axis: Axis) {
  setupHero(root, axis);
  setupPlane(root, axis);
  setupType(root, axis);
  setupRoute(root, axis);
  setupSystem(root);
  setupClosing(root, axis);
  ScrollTrigger.refresh();
}

function setupScrollStatus(root: HTMLElement) {
  const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-nav-scene]"));
  const progress = queryRequired<HTMLElement>(root, "[data-page-progress]");
  let frame = 0;

  const update = () => {
    frame = 0;
    const center = window.innerHeight * 0.5;
    let currentId = sections[0]?.id ?? "top";
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      const distance = Math.abs(bounds.top + bounds.height * 0.5 - center);

      if (distance < closestDistance) {
        closestDistance = distance;
        currentId = section.id;
      }
    });

    links.forEach((link) => {
      const active = link.dataset.navScene === currentId;
      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const reduceMotion = window.matchMedia(MOTION.reducedQuery).matches;

    if (!reduceMotion) {
      const maximum = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const pageProgress = Math.min(Math.max(window.scrollY / maximum, 0), 1);
      progress.style.transform = `scaleX(${pageProgress})`;
    } else {
      progress.style.removeProperty("transform");
    }
  };

  const requestUpdate = () => {
    if (frame === 0) {
      frame = window.requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  return () => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    if (frame !== 0) window.cancelAnimationFrame(frame);
  };
}

export function createChoreography(root: HTMLElement) {
  const cleanupStatus = setupScrollStatus(root);
  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    media.add(MOTION.desktopQuery, () => {
      root.dataset.motion = "ready";
      setupAxis(root, "desktop");
    });

    media.add(MOTION.mobileQuery, () => {
      root.dataset.motion = "ready";
      setupAxis(root, "mobile");
    });

    media.add(MOTION.reducedQuery, () => {
      root.dataset.motion = "reduced";
    });
  }, root);

  return () => {
    cleanupStatus();
    media.revert();
    context.revert();
    root.dataset.motion = "static";
  };
}
