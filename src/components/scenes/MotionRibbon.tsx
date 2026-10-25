export function MotionRibbon() {
  return (
    <div className="motion-ribbon" aria-hidden="true">
      <div className="motion-ribbon__track">
        {[0, 1].map((group) => (
          <div className="motion-ribbon__group" key={group}>
            {[0, 1].map((repeat) => (
              <span className="motion-ribbon__phrase" key={repeat}>
                <span>THINK.</span><i>✳</i><span className="motion-ribbon__outline">BUILD.</span><i>✳</i><span>REFINE.</span><i>✳</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
