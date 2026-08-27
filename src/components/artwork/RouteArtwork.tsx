interface RouteArtworkProps {
  readonly mediaLabel: string;
}

export function RouteArtwork({ mediaLabel }: RouteArtworkProps) {
  return (
    <div className="route-art" role="img" aria-label={mediaLabel}>
      <div className="route-art__aperture" data-route-aperture aria-hidden="true">
        <div className="route-art__grid" />
        <span className="route-segment route-segment--a" />
        <span className="route-segment route-segment--b" />
        <span className="route-segment route-segment--c" />
        <span className="route-segment route-segment--d" />
        <span className="route-segment route-segment--e" />
        <span className="route-node route-node--one">01</span>
        <span className="route-node route-node--two" data-route-node>
          02
        </span>
        <span className="route-node route-node--three">03</span>
        <span className="route-art__origin">IN</span>
        <span className="route-art__endpoint">OUT</span>
      </div>
      <span className="route-art__exit" aria-hidden="true" />
    </div>
  );
}
