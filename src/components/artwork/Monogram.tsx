import type { CSSProperties } from "react";
import "../../styles/monogram.css";

const outline = [
  [0, 0],
  [260, 0],
  [260, 56],
  [92, 226],
  [260, 226],
  [260, 282],
  [0, 282],
  [0, 226],
  [168, 56],
  [0, 56],
] as const;

const silhouette = "M0 0H260V56L92 226H260V282H0V226L168 56H0Z";

export function Monogram({ className = "" }: { readonly className?: string }) {
  return (
    <div className={`monogram ${className}`} aria-hidden="true">
      <div className="monogram__shadow" />
      <div className="monogram__pointer" data-sculpture>
        <div className="monogram__float">
          <div className="monogram__solid">
            <svg className="monogram__face monogram__face--back" viewBox="0 0 260 282">
              <path d={silhouette} />
            </svg>
            {outline.map(([x, y], index) => {
              const [nextX, nextY] = outline[(index + 1) % outline.length] ?? outline[0];
              const angle = (Math.atan2(nextY - y, nextX - x) * 180) / Math.PI;
              const length = Math.hypot(nextX - x, nextY - y) / 260;
              const light = Math.round(48 + ((Math.cos((angle * Math.PI) / 180) + 1) / 2) * 76);
              const style = {
                left: `${(x / 260) * 100}%`,
                top: `${(y / 282) * 100}%`,
                width: `calc(var(--solid-width) * ${length})`,
                backgroundColor: `rgb(${light} ${light + 1} ${light})`,
                transform: `translateZ(calc(var(--solid-depth) / 2)) rotateZ(${angle}deg) rotateX(-90deg)`,
              } satisfies CSSProperties;

              return <div className="monogram__edge" style={style} key={index} />;
            })}
            <svg className="monogram__face monogram__face--front" viewBox="0 0 260 282">
              <path className="monogram__surface" d={silhouette} />
              <path className="monogram__highlight" d="M1 1H259M1 57H166M1 227L169 57M93 227H259M1 281H259" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
