export function MotionLetters({ text }: { readonly text: string }) {
  return (
    <span className="motion-letters" aria-hidden="true">
      {Array.from(text).map((letter, index) => (
        <span className={letter === " " ? "motion-letter motion-letter--space" : "motion-letter"} key={`${index}-${letter}`}>{letter === " " ? "\u00a0" : letter}</span>
      ))}
    </span>
  );
}
