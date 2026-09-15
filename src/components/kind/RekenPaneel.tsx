/**
 * Rekenpaneel: twee kaarten naast elkaar.
 *
 * Links "Vrij oefenen" als raster van tegels met pictogram, naam en een dunne
 * voortgangsbalk. Rechts "Oefenen volgens je methode" als verticale lijst:
 * groen vinkje = voltooid, oranje cirkel met nummer = waar het kind nu is,
 * hangslotje = nog op slot.
 *
 * HARDE PROJECTREGEL, hier afgedwongen: is de rekenmethode van de school niet
 * betrouwbaar bekend, dan verschijnt letterlijk "Rekenmethode nog niet
 * bekend." Er wordt nooit een methode geraden.
 */

import Link from "next/link";
import {
  BLOK_LABEL,
  BLOK_RAND,
  BlokMerk,
  MethodeOnbekend,
} from "@/components/kind/Methodeblok";
import { Icoon } from "@/components/kind/Icoon";
import { Pictogram } from "@/components/kind/Pictogram";
import type {
  MethodeBlok,
  MethodeKoppeling,
  SubdomeinMetVoortgang,
} from "@/lib/types";

function Kaart({
  titel,
  bijschrift,
  children,
}: {
  titel: string;
  bijschrift: string;
  children: React.ReactNode;
}) {
  return (
    <section className="@container rounded-groot border border-rand bg-kaart p-5 shadow-zacht sm:p-6">
      <h3 className="text-lg font-extrabold">{titel}</h3>
      <p className="mt-0.5 mb-4 text-sm font-semibold text-inkt-zacht">
        {bijschrift}
      </p>
      {children}
    </section>
  );
}

function VrijOefenen({ items }: { items: SubdomeinMetVoortgang[] }) {
  /*
    Leeg is geen fout: er is nog geen inhoud gemaakt voor deze groep. Zonder
    dit blok zou hier alleen witruimte onder de kop staan.
  */
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rand bg-room/50 px-5 py-8 text-center">
        <p className="text-sm font-extrabold">Nog geen onderwerpen beschikbaar</p>
        <p className="mx-auto mt-1 max-w-xs text-sm font-semibold text-inkt-zacht">
          Voor jouw groep staat er nog niets klaar. Zodra er onderwerpen zijn,
          verschijnen ze hier vanzelf.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2.5 @sm:grid-cols-2">
      {items.map(({ subdomein, domein, aantalLeerdoelen, aantalBeheerst }) => {
        const procent = aantalLeerdoelen
          ? Math.round((aantalBeheerst / aantalLeerdoelen) * 100)
          : 0;

        return (
          <li key={subdomein.id}>
            <Link
              href={`/oefenen/rekenen/${domein.slug}/${subdomein.slug}`}
              className="flex h-full w-full flex-col gap-3 rounded-2xl border border-rand bg-room/50 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-huisstijl hover:bg-huisstijl-zacht"
            >
              <span className="flex items-center gap-2.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-kaart shadow-zacht">
                  <Pictogram naam={subdomein.icoon} className="size-7" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold leading-tight">
                    {subdomein.naam}
                  </span>
                  <span className="block text-xs font-semibold text-inkt-zacht">
                    {subdomein.omschrijving}
                  </span>
                </span>
              </span>

              <span className="mt-auto block">
                <span
                  className="block h-1.5 w-full overflow-hidden rounded-full bg-rand"
                  role="img"
                  aria-label={`${aantalBeheerst} van ${aantalLeerdoelen} leerdoelen beheerst`}
                >
                  <span
                    className="block h-full rounded-full bg-groen"
                    style={{ width: `${procent}%` }}
                  />
                </span>
                <span className="mt-1 block text-[0.7rem] font-bold text-inkt-zacht">
                  {aantalBeheerst} van {aantalLeerdoelen} beheerst
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function MethodeVolgorde({
  methode,
  blokken,
}: {
  methode: MethodeKoppeling;
  blokken: MethodeBlok[];
}) {
  // Onbekend blijft onbekend. Nooit invullen, nooit suggereren.
  if (methode.herkomst === "onbekend" || blokken.length === 0) {
    return <MethodeOnbekend />;
  }

  return (
    <>
      <ol className="flex flex-col gap-2.5">
        {blokken.map((blok) => (
          <li key={blok.id}>
            <button
              type="button"
              disabled={blok.status === "gesloten"}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-zacht disabled:cursor-not-allowed ${BLOK_RAND[blok.status]}`}
            >
              <BlokMerk blok={blok} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold leading-tight">
                  Blok {blok.nummer} — {blok.titel}
                </span>
                <span className="block text-xs font-bold text-inkt-zacht">
                  {BLOK_LABEL[blok.status]}
                </span>
              </span>
              {blok.status !== "gesloten" && (
                <Icoon naam="pijl" className="size-4 shrink-0 text-inkt-zacht" />
              )}
            </button>
          </li>
        ))}
      </ol>

      {methode.herkomst === "opgegeven_door_ouder" && (
        <p className="mt-3 rounded-xl bg-room/70 px-3 py-2 text-[0.7rem] font-semibold leading-relaxed text-inkt-zacht">
          Deze volgorde is gebaseerd op wat je ouder heeft ingevuld over school.
          Thuisles heeft dat niet gecontroleerd. De oefeningen zelf zijn altijd
          van Thuisles.
        </p>
      )}
    </>
  );
}

export function RekenPaneel({
  subdomeinen,
  methode,
  blokken,
}: {
  subdomeinen: SubdomeinMetVoortgang[];
  methode: MethodeKoppeling;
  blokken: MethodeBlok[];
}) {
  return (
    <section aria-labelledby="kop-rekenen">
      <h2 id="kop-rekenen" className="sr-only">
        Rekenen
      </h2>

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <Kaart
          titel="Vrij oefenen"
          bijschrift="Kies zelf een onderwerp om aan te werken."
        >
          <VrijOefenen items={subdomeinen} />
        </Kaart>

        <Kaart
          titel="Oefenen volgens je methode"
          bijschrift="Dezelfde volgorde als op school."
        >
          <MethodeVolgorde methode={methode} blokken={blokken} />
        </Kaart>
      </div>
    </section>
  );
}
