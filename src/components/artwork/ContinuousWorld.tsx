import { Monogram } from "./Monogram";

export function ContinuousWorld() {
  return (
    <>
      <div className="continuous-backdrop" aria-hidden="true" />
      <div className="continuous-artwork" aria-hidden="true">
        <div className="continuity-frame">
          <div className="continuity-z"><Monogram /></div>
        </div>
      </div>
    </>
  );
}
