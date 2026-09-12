/**
 * Tijdelijke pagina voor schermen die nog gebouwd moeten worden.
 * Zo werkt de navigatie al volledig zonder dat er iets wordt beloofd.
 */

export function BinnenkortPagina({
  emoji,
  titel,
  tekst,
}: {
  emoji: string;
  titel: string;
  tekst: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-kaart border border-dashed border-rand bg-kaart p-10 text-center shadow-zacht">
      <p className="text-5xl" aria-hidden="true">
        {emoji}
      </p>
      <h1 className="mt-4 text-2xl font-extrabold">{titel}</h1>
      <p className="mt-2 text-sm font-semibold text-inkt-zacht">{tekst}</p>
      <p className="mt-6 inline-block rounded-full bg-viool-zacht px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-viool-diep">
        Dit scherm bouwen we hierna
      </p>
    </div>
  );
}
