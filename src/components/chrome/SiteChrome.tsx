import type { NavigationItem } from "../../content/portfolio";

interface SiteChromeProps {
  readonly items: readonly NavigationItem[];
}

export function SiteChrome({ items }: SiteChromeProps) {
  return (
    <>
      <a className="skip-link" href="#project-index">
        Skip to selected structures
      </a>

      <header className="site-chrome">
        <a className="site-chrome__mark" href="#top" aria-label="Return to opening">
          PF <span aria-hidden="true">/</span> INDEX
        </a>

        <nav className="scene-index" aria-label="Scene index">
          <ol>
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  data-nav-scene={item.id}
                  aria-label={`${item.index} — ${item.label}`}
                >
                  <span>{item.index}</span>
                  <em aria-hidden="true">{item.label}</em>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <span className="site-chrome__count" aria-hidden="true">
          00—05
        </span>
      </header>

      <div className="page-progress" aria-hidden="true">
        <span data-page-progress />
      </div>
    </>
  );
}
