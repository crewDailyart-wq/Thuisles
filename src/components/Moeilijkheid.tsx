/**
 * De moeilijkheidsgraad als bolletjes.
 *
 * Vijf bolletjes, waarvan er een paar gevuld zijn. Zonder cijfer en zonder
 * woord: een kind van zes leest "moeilijkheid 3 van 5" niet, maar ziet in één
 * oogopslag dat er hier meer bolletjes vol staan dan daar. Dezelfde vorm die
 * oefensites al jaren gebruiken, dus ook een ouder hoeft er niets bij te leren.
 *
 * Is er geen moeilijkheidsgraad ingevuld, dan komt hier niets — liever niets
 * dan vijf lege bolletjes die zeggen "heel makkelijk".
 *
 * Voor wie het niet ziet staat er een gewone zin in plaats van de bolletjes.
 */
export function Moeilijkheid({
  waarde,
  maat = "klein",
}: {
  waarde: number | null | undefined;
  /** Klein staat naast een statuspil; ruim staat op een eigen regel. */
  maat?: "klein" | "ruim";
}) {
  if (waarde === null || waarde === undefined) return null;

  const vol = Math.max(1, Math.min(5, Math.round(waarde)));
  const grootte = maat === "ruim" ? "size-2.5" : "size-1.5";

  return (
    <span
      className={`inline-flex shrink-0 items-center ${maat === "ruim" ? "gap-1" : "gap-0.5"}`}
      role="img"
      aria-label={`Moeilijkheid ${vol} van 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          className={`${grootte} rounded-full ${
            n <= vol ? "bg-huisstijl-diep" : "bg-huisstijl-diep/20"
          }`}
        />
      ))}
    </span>
  );
}
