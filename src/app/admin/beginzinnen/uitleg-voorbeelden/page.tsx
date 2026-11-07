import Link from "next/link";
import { notFound } from "next/navigation";
import voorbeelden from "./voorstellen.json";

export default function UitlegVoorbeelden() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/beginzinnen" className="inline-flex min-h-11 items-center underline">
        ← Terug naar de beginzinnen
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Na ‘Nee’ · tien voorbeelden</h1>
      <p className="mt-3 max-w-3xl leading-relaxed">
        Links staat de oude uitleg. Rechts staat het goedgekeurde ontwerp: korte uitleg,
        iets laten zien en het kind een kleine stap laten doen. De woorden van
        Bliepo staan tussen aanhalingstekens. Wat er in beeld gebeurt, staat er apart bij.
      </p>
      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 leading-relaxed text-amber-950">
        <strong>Toegepast op 135 Squla-lessen.</strong> Na ‘Nee’ krijgt het kind uitleg bij het beeld
        en doet het een begeleide oefening. Een bevestiging volgt pas na een goed antwoord.
        Hieronder blijven de tien goedgekeurde ontwerpvoorbeelden staan; de precieze woorden
        en handelingen zijn per les afgestemd. Open een les om de uitgewerkte versie te bekijken.
      </p>

      <nav aria-label="Kies een voorbeeld" className="mt-5 grid gap-2 sm:grid-cols-2">
        {voorbeelden.map((les, i) => (
          <a key={les.id} href={`#${les.id}`} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm underline hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <span className="font-bold text-slate-500">{i + 1}.</span> {les.titel}
          </a>
        ))}
      </nav>

      {voorbeelden.map((les, i) => (
        <section key={les.id} id={les.id} aria-labelledby={`${les.id}-titel`} className="mt-10 scroll-mt-5">
          <p className="text-sm font-semibold text-slate-600">Voorbeeld {i + 1} van 10</p>
          <h2 id={`${les.id}-titel`} className="mt-1 text-xl font-bold">{les.titel}</h2>
          <p className="mt-1 text-sm text-slate-600">{les.onderwerp}</p>
          <Link href={`/voorbeeld/les/${les.id}`} className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-900">Bekijk de aangepaste les</Link>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="font-bold text-slate-800">Oude uitleg na ‘Nee’</h3>
              <blockquote className="mt-4 space-y-2 border-l-2 border-slate-300 pl-4 leading-relaxed">
                {les.oud.map((zin, index) => <p key={index}>“{zin}”</p>)}
              </blockquote>
              <div className="mt-5 rounded-lg bg-slate-100 p-3 text-sm leading-relaxed text-slate-700">
                <p className="font-semibold">Wat er eerder in beeld gebeurde</p>
                <p className="mt-1">{les.huidigBeeld}</p>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-teal-200 bg-teal-50 p-4 sm:p-5">
              <h3 className="font-bold text-teal-950">Goedgekeurd ontwerp · samen stap voor stap</h3>
              <ol className="mt-4 space-y-5">
                {les.stappen.map((stap, index) => (
                  <li key={index} className="border-t border-teal-200 pt-4 first:border-0 first:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Stap {index + 1} · Bliepo zegt</p>
                    <p className="mt-1 font-medium leading-relaxed text-teal-950">“{stap.zeg}”</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700"><strong>In beeld:</strong> {stap.beeld}</p>
                    {stap.kind && <p className="mt-2 text-sm leading-relaxed text-slate-700"><strong>Het kind doet:</strong> {stap.kind}</p>}
                    {stap.goed && (
                      <div className="mt-3 rounded-lg border border-teal-200 bg-white p-3">
                        <p className="text-xs font-semibold text-teal-800">Bliepo, na een goed antwoord</p>
                        <p className="mt-1 leading-relaxed">“{stap.goed}”</p>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              <div className="mt-5 border-t border-teal-200 pt-4">
                <h4 className="text-sm font-semibold text-teal-900">Extra hulp als het nog niet lukt</h4>
                <p className="mt-2 leading-relaxed">“{les.tip}”</p>
                <p className="mt-2 text-sm text-slate-600">Daarna probeert het kind dezelfde stap opnieuw.</p>
              </div>
            </div>
          </div>
        </section>
      ))}
      <p className="mt-10 text-sm leading-relaxed text-slate-600">
        Deze vergelijking gaat alleen over de uitleg na ‘Nee’. De beginzinnen en
        de Synthesis-lessen zijn bij deze aanpassing behouden.
      </p>
    </div>
  );
}
