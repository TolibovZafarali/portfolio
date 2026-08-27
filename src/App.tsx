import { useRef } from "react";
import { SiteChrome } from "./components/chrome/SiteChrome";
import { ClosingScene } from "./components/scenes/ClosingScene";
import { HeroScene } from "./components/scenes/HeroScene";
import { PlaneScene, RouteScene, TypeScene } from "./components/scenes/ProjectScenes";
import { SystemScene } from "./components/scenes/SystemScene";
import { portfolioContent } from "./content/portfolio";
import { useChoreography } from "./motion/useChoreography";

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  useChoreography(rootRef);

  const [plane, type, route] = portfolioContent.projects;

  return (
    <div className="site" ref={rootRef} data-motion="static">
      <SiteChrome items={portfolioContent.navigation} />
      <main>
        <HeroScene />
        <div id="project-index" tabIndex={-1}>
          <PlaneScene project={plane} />
          <TypeScene project={type} />
          <RouteScene project={route} />
        </div>
        <SystemScene operations={portfolioContent.operations} />
        <ClosingScene />
      </main>
    </div>
  );
}
