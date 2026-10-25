import { portfolioContent } from "../../content/portfolio";
import { MotionLetters } from "../artwork/MotionLetters";

export function ClosingScene() {
  return (
    <footer className="closing" id="contact" data-scene="contact">
      <div className="section-kicker"><span>HAVE SOMETHING IN MIND?</span><span>LET’S MAKE IT REAL.</span></div>
      <a className="closing__cta" href={`mailto:${portfolioContent.email}`} aria-label="Email Zafarali Tolibov"><span className="closing__words"><MotionLetters text="Let’s build" /><span className="serif closing__period">.</span></span><span className="closing__arrow-wrap" aria-hidden="true"><span className="closing__arrow">↗</span></span></a>
      <div className="closing__links"><div><p>Good things start with a conversation.</p><a className="closing__email" href={`mailto:${portfolioContent.email}`}>{portfolioContent.email}</a></div><div className="closing__socials"><a className="text-link" href={portfolioContent.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a><a className="text-link" href={portfolioContent.linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></div></div>
      <div className="closing__bottom"><span>© {new Date().getFullYear()} ZAFARALI TOLIBOV</span><span>BUILT WITH INTENTION.</span><a href="#top">BACK TO TOP <span aria-hidden="true">↑</span></a></div>
    </footer>
  );
}
