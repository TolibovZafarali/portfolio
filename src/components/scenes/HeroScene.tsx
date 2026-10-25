import { HeroAtmosphere } from "../artwork/HeroAtmosphere";
import { Monogram } from "../artwork/Monogram";
import { MotionLetters } from "../artwork/MotionLetters";

export function HeroScene() {
  return (
    <section className="hero-journey" id="top" data-scene="top" aria-labelledby="hero-title">
      <div className="hero">
        <div className="hero__iris" aria-hidden="true" />
        <HeroAtmosphere />
        <div className="hero__eyebrow"><span><i className="status-dot" /> INDEPENDENT DEVELOPER & PRODUCT BUILDER</span><span className="hero__edition">SELECTED WORK / 2026</span></div>
        <div className="hero__composition">
          <h1 id="hero-title" aria-label="Zafarali Tolibov">
            <span className="hero__line"><span data-hero-line="first"><MotionLetters text="ZAFARALI" /></span></span>
            <span className="hero__line hero__line--second"><span data-hero-line="second"><MotionLetters text="TOLIBOV." /></span></span>
          </h1>
          <div className="hero__sculpture"><Monogram /></div>
        </div>
        <div className="hero__chapter" aria-hidden="true">
          <span className="hero__chapter-kicker">A LITTLE CURIOSITY. A LOT OF MAKING.</span>
          <p><span>IDEAS.</span><span>MADE <i>REAL.</i></span></p>
          <span className="hero__chapter-note">From a valuation platform<br />to a party in your pocket.</span>
        </div>
        <div className="hero__bottom" data-hero-intro>
          <a className="hero__scroll" href="#work"><span className="circle-arrow" aria-hidden="true">↓</span><span>SCROLL TO<br />EXPLORE THE WORK</span></a>
          <p>I turn complex ideas into<br />products that <span className="serif">feel simple.</span></p>
          <div className="hero__intro"><span>From the first sketch to the final ship.</span><span>Thoughtful interfaces. Solid engineering.<br />A little obsession with the details.</span></div>
        </div>
        <div className="hero__sequence" aria-hidden="true"><span>THE WORK IS JUST A SCROLL AWAY</span><span className="hero__sequence-line"><i /></span><span>↓</span></div>
      </div>
    </section>
  );
}
