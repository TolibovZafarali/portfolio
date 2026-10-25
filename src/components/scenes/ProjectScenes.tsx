import type { Project } from "../../content/portfolio";

function ProjectDetails({ project }: { readonly project: Project }) {
  return (
    <details className="project-details">
      <summary><span>A closer look</span><span className="project-details__plus" aria-hidden="true">+</span></summary>
      <div className="project-details__body">
        {project.details.map((detail) => <div key={detail.title}><h4>{detail.title}</h4><p>{detail.description}</p></div>)}
      </div>
    </details>
  );
}

function ProjectCopy({ project }: { readonly project: Project }) {
  return (
    <div className="project__copy">
      <div className="project__statement" data-reveal><span className="eyebrow">{project.category}</span><h3>{project.headline}</h3></div>
      <div className="project__description" data-reveal>
        <p>{project.description}</p>
        <ul className="tech-list" aria-label={`${project.name} technologies`}>{project.stack.map((tech) => <li key={tech}>{tech}</li>)}</ul>
        <div className="project__links"><a className="text-link" href={project.url} target="_blank" rel="noreferrer">{project.linkLabel}<span aria-hidden="true">↗</span></a><a className="source-link" href={project.repository} target="_blank" rel="noreferrer">Source code <span aria-hidden="true">↗</span></a></div>
        <ProjectDetails project={project} />
      </div>
    </div>
  );
}

export function VenfourScene({ project }: { readonly project: Project }) {
  return (
    <article className="project project--venfour" id="venfour" aria-labelledby="venfour-title" data-project>
      <div className="project__heading" data-reveal><h2 id="venfour-title"><span className="project__number">{project.index}</span>{project.name}</h2></div>
      <div className="project__body">
      <div className="project-screen">
      <a className="project-stage venfour-stage" href={project.url} target="_blank" rel="noreferrer" aria-label="Visit Venfour — opens in a new tab" data-stage>
        <div className="stage-grid" aria-hidden="true" />
        <div className="venfour-stage__top"><img src="/projects/venfour-wordmark.svg" width="160" height="42" alt="Venfour" /><span>CONFIDENCE STARTS WITH CLARITY.</span></div>
        <div className="project-depth">
        <div className="browser-frame" data-project-visual>
          <div className="browser-frame__bar"><div aria-hidden="true"><i /><i /><i /></div><span>venfour.com</span><span aria-hidden="true">↗</span></div>
          <img className="browser-frame__screen" src="/projects/venfour-home.jpg" width="1280" height="720" alt="Venfour homepage: Your Vehicle’s Value, Made Clear. Start a total-loss review." loading="lazy" />
        </div>
        </div>
        <span className="stage-caption">01 / INDEPENDENT VALUATION REVIEW</span>
        <span className="stage-visit" aria-hidden="true">EXPLORE PROJECT <span>↗</span></span>
      </a>
      </div>
      <ProjectCopy project={project} />
      </div>
    </article>
  );
}

export function ImposterScene({ project }: { readonly project: Project }) {
  return (
    <article className="project project--imposter" id="imposter" aria-labelledby="imposter-title" data-project>
      <div className="project__heading" data-reveal><h2 id="imposter-title"><span className="project__number">{project.index}</span>Imposter<span className="project__subtitle">All Languages</span></h2></div>
      <div className="project__body">
      <div className="project-screen">
      <a className="project-stage imposter-stage" href={project.url} target="_blank" rel="noreferrer" aria-label="View Imposter: All Languages on the App Store — opens in a new tab" data-stage>
        <div className="imposter-stage__top"><span><i className="status-dot" /> ONE PHONE. EVERYONE PLAYS.</span><span>AVAILABLE ON iOS ↗</span></div>
        <div className="project-depth">
        <div className="imposter-posters" data-project-visual>
          <div className="imposter-poster imposter-poster--left"><img src="/projects/imposter-languages.jpg" width="554" height="1200" alt="Different languages, same game: individual language selection" loading="lazy" /></div>
          <div className="imposter-poster imposter-poster--center"><img src="/projects/imposter-bluffing.jpg" width="554" height="1200" alt="One friend is bluffing: Imposter characters around a phone" loading="lazy" /></div>
          <div className="imposter-poster imposter-poster--right"><img src="/projects/imposter-reveal.jpg" width="554" height="1200" alt="Did you catch them? The final imposter reveal" loading="lazy" /></div>
        </div>
        </div>
        <span className="stage-caption">02 / A MULTILINGUAL PARTY GAME</span>
        <span className="stage-visit" aria-hidden="true">MEET THE IMPOSTER <span>↗</span></span>
      </a>
      </div>
      <ProjectCopy project={project} />
      </div>
    </article>
  );
}
