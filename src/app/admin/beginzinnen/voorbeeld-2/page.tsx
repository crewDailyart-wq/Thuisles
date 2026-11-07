import Link from "next/link";
import { notFound } from "next/navigation";
import alleLessen from "../../../../../public/beginzinnen/lijst.json";
import versie1 from "./versie-1.json";
import voorstellen from "./voorstellen.json";

export default function TweedeVoorbeeld() {
  if (process.env.NODE_ENV === "production") notFound();
  const lessen = alleLessen.filter((les) => Object.hasOwn(voorstellen, les.id));
  const onderwerpen = [...new Set(lessen.map((les) => les.onderwerp))];

  return (
    <main className="mx-auto w-full max-w-6xl">
      <Link href="/admin/beginzinnen" className="inline-flex min-h-11 items-center text-sm underline">
        ← Terug naar versie 1
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Beginzinnen · tweede voorbeeld</h1>
      <p className="mt-3 max-w-3xl leading-relaxed">
        Vergelijk de 30 lesopeningen. Versie 2 heeft kortere vragen, meer afwisseling en geen ‘zelf’.
        Bij rekenen staat duidelijk wat het kind uitrekent. Versie 2 is gekozen en wordt nu in de Squla-lessen gebruikt. Versie 1 blijft hier staan om te vergelijken.
      </p>
      <p className="mt-2 text-sm text-slate-600">Bij beide versies: Ja = beginnen met oefenen, Nee = eerst uitleg.</p>

      {onderwerpen.map((onderwerp) => (
        <section key={onderwerp} className="mt-10">
          <h2 className="text-xl font-bold">{onderwerp}</h2>
          {lessen.filter((les) => les.onderwerp === onderwerp).map((les) => {
            const huidig = versie1[les.id as keyof typeof versie1];
            const nieuw = voorstellen[les.id as keyof typeof voorstellen];
            return (
              <article key={les.id} className="mt-4 min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                <h3 className="text-lg font-bold">{les.titel}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{les.uitleg}</p>
                <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-2">
                  <div className="min-w-0 rounded-lg bg-slate-100 p-4">
                    <h4 className="text-sm font-semibold text-slate-600">Versie 1 · eerder</h4>
                    <p className="mt-3 leading-relaxed">{huidig?.zin1}</p>
                    <p className="mt-3 text-lg font-semibold leading-relaxed">{huidig?.zin2}</p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <h4 className="text-sm font-semibold text-teal-800">Versie 2 · gekozen</h4>
                    <p className="mt-3 leading-relaxed">{nieuw.zin1}</p>
                    <p className="mt-3 text-lg font-semibold leading-relaxed text-teal-950">{nieuw.zin2}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </main>
  );
}
