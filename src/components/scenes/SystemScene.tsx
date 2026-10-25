export function SystemScene() {
  return (
    <section className="about" id="about" data-scene="about" aria-labelledby="about-title">
      <div className="section-kicker" data-reveal><span>03 / THE APPROACH</span></div>
      <div className="about__intro">
        <h2 id="about-title" data-reveal><span>Different products.</span><br /><span className="serif">The same approach.</span></h2>
        <p data-reveal>I’m Zafarali, an independent developer who cares as much about how a product feels as how it works. I build across web and mobile, connecting the interface, the logic, and all the details in between.</p>
      </div>
      <div className="principles">
        <div className="principle" data-reveal><span className="principle__number">01 / UNDERSTAND</span><h3>Find the real problem.</h3><p>Start with the person using it. Make the complicated parts clear, and give every feature a reason to exist.</p><span className="principle__graphic principle__graphic--focus" aria-hidden="true"><i /><i /><i /></span></div>
        <div className="principle" data-reveal><span className="principle__number">02 / BUILD</span><h3>Care about the details.</h3><p>The right interaction. The readable screen. The system underneath. Small decisions make the whole experience.</p><span className="principle__graphic principle__graphic--build" aria-hidden="true"><i /><i /><i /></span></div>
        <div className="principle" data-reveal><span className="principle__number">03 / REFINE</span><h3>Make it feel effortless.</h3><p>Test, listen, and keep improving. The goal is a useful product that feels natural from the very first tap.</p><span className="principle__graphic principle__graphic--refine" aria-hidden="true"><i /><i /><i /></span></div>
      </div>
    </section>
  );
}
