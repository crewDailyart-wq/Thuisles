/**
 * Kleine gele "glitter-streepjes", zoals rond de iconen en de titel.
 * Drie streepjes in een waaier; `kant` bepaalt of ze naar links of rechts wijzen.
 */
export function Glitter({
  className = "",
  kant = "rechts",
  kleur = "var(--av-glitter)",
}: {
  className?: string;
  kant?: "links" | "rechts";
  kleur?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
      style={kant === "links" ? { transform: "scaleX(-1)" } : undefined}
    >
      <g stroke={kleur} strokeWidth="4.5" strokeLinecap="round">
        <path d="M8 22 L4 30" />
        <path d="M18 18 L26 8" />
        <path d="M24 26 L35 22" />
      </g>
    </svg>
  );
}
