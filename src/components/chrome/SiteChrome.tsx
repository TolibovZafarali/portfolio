import { useEffect, useState } from "react";
import type { NavigationItem } from "../../content/portfolio";

export function SiteChrome({ items }: { readonly items: readonly NavigationItem[] }) {
  const [motionOff, setMotionOff] = useState(() => {
    const preference = document.documentElement.dataset.motionPreference;
    return preference ? preference === "reduce" : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      const preference = document.documentElement.dataset.motionPreference;
      setMotionOff(preference ? preference === "reduce" : media.matches);
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  function toggleMotion() {
    const next = !motionOff;
    setMotionOff(next);
    document.documentElement.dataset.motionPreference = next ? "reduce" : "full";
    window.dispatchEvent(new Event("motionpreferencechange"));
  }

  return (
    <>
      <a className="skip-link" href="#work">Skip to selected work</a>
      <header className="site-chrome">
        <a className="site-chrome__mark" href="#top" aria-label="Zafarali Tolibov — back to top">zt<span>.</span></a>
        <span className="site-chrome__descriptor">DESIGN MINDED.<br />DEVELOPMENT DRIVEN.</span>
        <nav aria-label="Main navigation">
          {items.map((item) => <a key={item.id} href={`#${item.id}`} data-nav-scene={item.id}>{item.label}<span aria-hidden="true">↗</span></a>)}
        </nav>
        <button className="motion-toggle" type="button" onClick={toggleMotion} aria-pressed={motionOff} aria-label={motionOff ? "Enable animations" : "Pause animations"} title={motionOff ? "Enable animations" : "Pause animations"}>
          <span className="motion-toggle__icon" aria-hidden="true">{motionOff ? "▶" : "Ⅱ"}</span><span>Motion {motionOff ? "off" : "on"}</span>
        </button>
      </header>
      <div className="page-progress" aria-hidden="true"><span data-page-progress /></div>
    </>
  );
}
