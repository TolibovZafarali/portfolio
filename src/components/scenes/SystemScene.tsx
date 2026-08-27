interface SystemSceneProps {
  readonly operations: readonly string[];
}

export function SystemScene({ operations }: SystemSceneProps) {
  return (
    <section
      className="system-scene scene"
      id="operations"
      data-scene="operations"
      aria-labelledby="operations-title"
    >
      <div className="scene__pin system-scene__pin">
        <header className="system-scene__header">
          <span aria-hidden="true">04</span>
          <h2 id="operations-title">Operations</h2>
          <p>Structure / Method</p>
        </header>

        <span className="system-spine" aria-hidden="true">
          <i data-system-carrier />
        </span>

        <ol className="system-ledger">
          {operations.map((operation, index) => (
            <li key={operation} data-system-row>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{operation}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
