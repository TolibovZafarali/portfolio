interface SceneLabelProps {
  readonly index: string;
  readonly label: string;
  readonly descriptor: string;
  readonly headingId: string;
  readonly tone?: "paper" | "carbon";
}

export function SceneLabel({
  index,
  label,
  descriptor,
  headingId,
  tone = "paper",
}: SceneLabelProps) {
  return (
    <header className={`scene-label scene-label--${tone}`}>
      <span className="scene-label__index" aria-hidden="true">
        {index}
      </span>
      <h2 id={headingId}>{label}</h2>
      <p>{descriptor}</p>
    </header>
  );
}
