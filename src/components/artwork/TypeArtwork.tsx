interface TypeArtworkProps {
  readonly mediaLabel: string;
}

function MonumentalType({ inverse = false }: { readonly inverse?: boolean }) {
  return (
    <div className={`type-art__word${inverse ? " type-art__word--inverse" : ""}`}>
      <span>PROJ</span>
      <span>ECT</span>
      <span className="type-art__number">02</span>
    </div>
  );
}

export function TypeArtwork({ mediaLabel }: TypeArtworkProps) {
  return (
    <div className="type-art" role="img" aria-label={mediaLabel}>
      <div aria-hidden="true">
        <MonumentalType />
        <div className="type-art__sweep" data-type-sweep>
          <MonumentalType inverse />
        </div>
        <span className="type-art__carrier" data-type-carrier />
        <span className="type-art__terminal" />
      </div>
    </div>
  );
}
