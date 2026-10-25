import { Monogram } from "./Monogram";

export function ContinuousWorld() {
  return (
    <>
      <div className="continuous-backdrop" aria-hidden="true" />
      <div className="continuous-artwork" aria-hidden="true">
        <div className="continuity-card-left">
          <img src="/projects/imposter-languages.jpg" width="554" height="1200" alt="" />
        </div>
        <div className="continuity-card-right">
          <img src="/projects/imposter-reveal.jpg" width="554" height="1200" alt="" />
        </div>
        <img className="continuity-cat" src="/projects/imposter-cat.png" width="256" height="256" alt="" />
        <div className="continuity-frame">
          <div className="continuity-z"><Monogram /></div>
          <div className="continuity-browser">
            <div className="continuity-browser__bar"><span><i /><i /><i /></span><span>venfour.com</span><span>↗</span></div>
            <img src="/projects/venfour-home.jpg" width="1280" height="720" alt="" />
          </div>
          <div className="continuity-card">
            <img src="/projects/imposter-bluffing.jpg" width="554" height="1200" alt="" />
          </div>
          <span className="continuity-sheen" />
          <svg className="continuity-rings" viewBox="0 0 240 240" fill="none">
            <circle cx="88" cy="120" r="68" />
            <circle cx="120" cy="120" r="68" />
            <circle cx="152" cy="120" r="68" />
            <circle className="continuity-rings__orbit" cx="120" cy="120" r="111" />
            <circle className="continuity-rings__point" cx="120" cy="9" r="4" />
          </svg>
          <svg className="continuity-arrow" viewBox="0 0 240 240" fill="none">
            <path d="M42 198 194 46M49 44h147v147" />
          </svg>
        </div>
      </div>
    </>
  );
}
