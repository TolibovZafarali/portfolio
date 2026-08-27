interface PlaneArtworkProps {
  readonly compact?: boolean;
  readonly mediaLabel?: string;
}

export function PlaneArtwork({ compact = false, mediaLabel }: PlaneArtworkProps) {
  return (
    <div
      className={`plane-art${compact ? " plane-art--compact" : ""}`}
      role={mediaLabel ? "img" : undefined}
      aria-label={mediaLabel}
      aria-hidden={mediaLabel ? undefined : true}
    >
      <div className="plane-art__slab" data-plane-slab>
        <span className="plane-art__cut" />
      </div>
      <span className="plane-art__band" data-plane-band />
      <span className="plane-art__counter">01</span>
      <span className="plane-art__rule" />
    </div>
  );
}
