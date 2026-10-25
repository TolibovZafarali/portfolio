import { useRef } from "react";
import { ContinuousWorld } from "./components/artwork/ContinuousWorld";
import { SiteChrome } from "./components/chrome/SiteChrome";
import { ClosingScene } from "./components/scenes/ClosingScene";
import { HeroScene } from "./components/scenes/HeroScene";
import { MotionRibbon } from "./components/scenes/MotionRibbon";
import { ImposterScene, VenfourScene } from "./components/scenes/ProjectScenes";
import { SystemScene } from "./components/scenes/SystemScene";
import { portfolioContent } from "./content/portfolio";
import { useChoreography } from "./motion/useChoreography";

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  useChoreography(rootRef);
  const [venfour, imposter] = portfolioContent.projects;

  return (
    <div className="site" ref={rootRef} data-motion="static">
      <ContinuousWorld />
      <SiteChrome items={portfolioContent.navigation} />
      <main>
        <HeroScene />
        <MotionRibbon />
        <section className="selected-work" id="work" tabIndex={-1} data-scene="work" aria-label="Selected work">
          <div className="work-intro" data-reveal><span className="eyebrow">A FEW THINGS I’VE BUILT</span><p>Different problems.<br /><span className="serif">The same attention to detail.</span></p><span className="work-intro__count">SELECTED WORK [02]</span></div>
          <VenfourScene project={venfour} />
          <ImposterScene project={imposter} />
        </section>
        <SystemScene />
      </main>
      <ClosingScene />
    </div>
  );
}
