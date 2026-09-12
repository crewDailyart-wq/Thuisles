/**
 * Voortgangsindicatie bij een domein of onderwerp.
 *
 * Toont altijd het aantal in woorden ("1 van 2 beheerst") naast de balk. De
 * balk alleen zou voor een kind te weinig zeggen, en een voorleesprogramma
 * kan er niets mee.
 */

export function Voortgangsbalk({
  beheerst,
  totaal,
  eenheid = "beheerst",
}: {
  beheerst: number;
  totaal: number;
  eenheid?: string;
}) {
  const procent = totaal > 0 ? Math.round((beheerst / totaal) * 100) : 0;
  const label = `${beheerst} van ${totaal} ${eenheid}`;

  return (
    <span className="block">
      <span
        role="img"
        aria-label={label}
        className="block h-1.5 w-full overflow-hidden rounded-full bg-rand"
      >
        <span
          className="block h-full rounded-full bg-groen"
          style={{ width: `${procent}%` }}
        />
      </span>
      <span className="mt-1 block text-[0.7rem] font-bold text-inkt-zacht">
        {label}
      </span>
    </span>
  );
}
