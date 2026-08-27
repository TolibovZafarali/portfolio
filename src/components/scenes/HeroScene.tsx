import { portfolioContent } from "../../content/portfolio";
import { PlaneArtwork } from "../artwork/PlaneArtwork";

export function HeroScene() {
  return (
    <section className="hero scene" id="top" data-scene="top" aria-labelledby="hero-title">
      <div className="scene__pin hero__pin">
        <h1 id="hero-title" className="visually-hidden">
          Portfolio
        </h1>

        <div className="hero__underlay" data-hero-underlay aria-hidden="true">
          <PlaneArtwork compact />
        </div>

        <div className="hero__panel hero__panel--lead" data-hero-panel="lead" aria-hidden="true">
          <span className="hero__word hero__word--lead">PORT</span>
          <span className="hero__meta hero__meta--index">INDEX / 00—05</span>
          <span className="hero__meta hero__meta--prompt">{portfolioContent.openingPrompt}</span>
        </div>

        <div className="hero__panel hero__panel--trail" data-hero-panel="trail" aria-hidden="true">
          <span className="hero__word hero__word--trail">FOLIO</span>
          <span className="hero__meta hero__meta--eyebrow">{portfolioContent.eyebrow}</span>
          <span className="hero__meta hero__meta--position">00 / RESERVED</span>
        </div>

        <span className="hero__incision" data-hero-incision aria-hidden="true">
          <i />
        </span>
      </div>
    </section>
  );
}
