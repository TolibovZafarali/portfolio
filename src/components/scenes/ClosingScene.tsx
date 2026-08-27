import { portfolioContent } from "../../content/portfolio";

export function ClosingScene() {
  return (
    <section
      className="closing scene"
      id="close"
      data-scene="close"
      aria-labelledby="closing-title"
    >
      <div className="scene__pin closing__pin">
        <h2 id="closing-title" className="visually-hidden">
          {portfolioContent.completionLabel}
        </h2>

        <div className="closing__field" aria-hidden="true">
          <span>05</span>
          <i />
        </div>

        <div className="closing__panel closing__panel--lead" data-closing-panel="lead">
          <span className="closing__word closing__word--lead" aria-hidden="true">
            PORT
          </span>
          <span className="closing__meta">INDEX / 05—05</span>
          <span className="closing__meta closing__meta--complete">
            {portfolioContent.completionLabel}
          </span>
        </div>

        <div className="closing__panel closing__panel--trail" data-closing-panel="trail">
          <span className="closing__word closing__word--trail" aria-hidden="true">
            FOLIO
          </span>
          <a className="closing__return" href="#top">
            Return / top <span aria-hidden="true">↑</span>
          </a>
          <span className="closing__meta closing__meta--end">END / REST</span>
        </div>

        <span className="closing__incision" data-closing-incision aria-hidden="true">
          <i />
        </span>
      </div>
    </section>
  );
}
