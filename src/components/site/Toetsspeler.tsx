"use client";

/**
 * De gratis niveautest: vraag voor vraag, en pas aan het eind de uitslag.
 *
 * De vragen staan er precies zo als bij het oefenen: dezelfde tekening,
 * dezelfde vraagzin en dezelfde antwoordvelden (`Antwoordvelden` uit de
 * oefenspeler). Wat anders is, hoort bij een toets:
 *
 * - geen goed of fout tussendoor, geen tip, geen uitleg en geen feest; het
 *   antwoord gaat mee naar de uitslag;
 * - bij elke vraag de knop Volgende, ook bij meerkeuze: een mis getikte keuze
 *   kan nog worden veranderd (ONTWERPREGELS: geen keuze die meteen nakijkt);
 * - "Weet ik niet" om door te gaan zonder te gokken; dat telt als niet goed.
 *
 * Er wordt niets bewaard: geen antwoorden, geen uitslag. Nakijken gebeurt hier
 * in de browser met `isGoed`, net als bij het oefenen.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { Antwoordvelden } from "@/components/oefenen/OefenSpeler";
import { Figuurtekening, beschrijfFiguur, figuurIsTekenbaar } from "@/components/oefenen/Figuurtekening";
import { IcoonPijl } from "@/components/site/Iconen";
import { isGoed } from "@/lib/antwoord";
import {
  BEOORDELING_LABEL,
  berekenUitslag,
  type Uitslag,
} from "@/lib/niveautest-uitslag";
import type { OefenVraag } from "@/lib/vraagtypes";

export type Toetsvraag = OefenVraag & { onderdeelId: string };

export type Toetsgegevens = {
  groep: number;
  onderdelen: { id: string; titel: string; niveau: string; aantal: number }[];
  vragen: Toetsvraag[];
};

type Stand = "uitleg" | "bezig" | "klaar";

export function Toetsspeler({ toets }: { toets: Toetsgegevens }) {
  const [stand, zetStand] = useState<Stand>("uitleg");
  const [index, zetIndex] = useState(0);
  const [antwoord, zetAntwoord] = useState("");
  const [gegeven, zetGegeven] = useState<{ onderdeelId: string; goed: boolean }[]>([]);

  const uitslag = useMemo(
    () => (stand === "klaar" ? berekenUitslag(toets.onderdelen, gegeven) : null),
    [stand, toets.onderdelen, gegeven],
  );

  const totaal = toets.vragen.length;
  const minuten = Math.max(5, Math.round((totaal * 50) / 60 / 5) * 5);

  function volgende(weetIkNiet = false) {
    const vraag = toets.vragen[index];
    if (!weetIkNiet && antwoord.trim() === "") return;
    const goed = !weetIkNiet && isGoed(vraag, antwoord);
    const nieuw = [...gegeven, { onderdeelId: vraag.onderdeelId, goed }];
    zetGegeven(nieuw);
    zetAntwoord("");
    if (index + 1 >= totaal) {
      zetStand("klaar");
    } else {
      zetIndex(index + 1);
    }
    window.scrollTo({ top: 0 });
  }

  /* Nog een keer: de pagina opnieuw, zodat er andere vragen uit de toets komen. */
  function opnieuw() {
    window.location.reload();
  }

  if (stand === "uitleg") {
    return (
      <div className="st-nt-uitleg st-glas">
        <p className="st-boventitel">Groep {toets.groep}</p>
        <h1 className="st-h1 st-titel">
          De gratis <em>niveautest</em>
        </h1>
        <ul className="st-nt-feiten">
          <li>
            <strong>{totaal}</strong> {totaal === 1 ? "vraag" : "vragen"}
          </li>
          <li>
            <strong>{toets.onderdelen.length}</strong> {toets.onderdelen.length === 1 ? "onderdeel" : "onderdelen"}
          </li>
          <li>
            ongeveer <strong>{minuten}</strong> minuten
          </li>
        </ul>
        <p>
          Je kind maakt de vragen zelf, in een rustig tempo. Tussendoor staat er niet of het goed of fout is; dat zie
          je samen aan het eind. Weet je kind iets niet, dan kiest het <strong>Weet ik niet</strong>. Dat is beter dan
          gokken, want dan klopt de uitslag.
        </p>
        <p className="st-nt-klein">
          Er wordt niets bewaard: geen antwoorden en geen uitslag. Dit is een indicatie van het niveau, geen officiële
          toets.
        </p>
        <button type="button" className="st-knop st-knop-goud" onClick={() => zetStand("bezig")}>
          Begin de toets
          <IcoonPijl />
        </button>
      </div>
    );
  }

  if (stand === "klaar" && uitslag) {
    return <Toetsuitslag groep={toets.groep} uitslag={uitslag} onOpnieuw={opnieuw} />;
  }

  const vraag = toets.vragen[index];
  return (
    <div className="st-nt-speler">
      <h1 className="st-sr">Niveautest groep {toets.groep}</h1>
      <div className="st-nt-voortgang">
        <p>
          Vraag <strong>{index + 1}</strong> van {totaal}
        </p>
        <div
          className="st-nt-balk"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totaal}
          aria-valuenow={index}
          aria-label="Voortgang"
        >
          <span style={{ width: `${(index / totaal) * 100}%` }} />
        </div>
        <Link href="/niveautest" className="st-nt-stop">
          Stoppen
        </Link>
      </div>

      {/* Een eigen sleutel per vraag: alles in de kaart begint opnieuw, net als bij het oefenen. */}
      <Toetsvraagkaart
        key={`${vraag.id}:${index}`}
        vraag={vraag}
        groep={toets.groep}
        antwoord={antwoord}
        laatste={index + 1 >= totaal}
        onKies={zetAntwoord}
        onVolgende={volgende}
      />
    </div>
  );
}

function Toetsvraagkaart({
  vraag,
  groep,
  antwoord,
  laatste,
  onKies,
  onVolgende,
}: {
  vraag: Toetsvraag;
  groep: number;
  antwoord: string;
  laatste: boolean;
  onKies: (waarde: string) => void;
  onVolgende: (weetIkNiet?: boolean) => void;
}) {
  /* Dezelfde regels als in de oefenspeler. */
  const invulbaar =
    vraag.vorm === "bosspel" ||
    (vraag.vorm === "open" && vraag.figuur !== null && beschrijfFiguur(vraag.figuur).invulvak !== null);
  const heeftBeeld = Boolean(vraag.afbeelding || (vraag.figuur && (invulbaar || figuurIsTekenbaar(vraag.figuur))));
  const jong = groep <= 4;
  const magDoor = antwoord.trim() !== "";

  const velden = (
    <Antwoordvelden
      vraag={vraag}
      antwoord={antwoord}
      fase="bezig"
      markeer={false}
      invulbaar={invulbaar}
      onKies={onKies}
      onBevestig={() => {
        if (magDoor) onVolgende();
      }}
    />
  );

  return (
    <div className="st-nt-kaart rounded-groot border border-rand bg-kaart p-5 shadow-op sm:p-8 lg:p-10">
      <div className="mt-1 flex flex-col gap-5">
        {heeftBeeld && (
          <div className="mx-auto w-full max-w-[30rem] rounded-groot border border-rand bg-room/50 p-4 sm:p-5">
            {invulbaar && vraag.figuur ? (
              velden
            ) : vraag.afbeelding ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={`/vragen/${vraag.afbeelding}`} alt="" className="mx-auto h-auto w-full rounded-xl object-contain" />
            ) : (
              vraag.figuur && <Figuurtekening figuur={vraag.figuur} />
            )}
          </div>
        )}

        <h2
          className={`text-center font-extrabold leading-snug break-words ${
            vraag.figuur?.soort === "verhaaltje"
              ? "text-2xl leading-relaxed sm:text-3xl"
              : jong
                ? "text-3xl sm:text-4xl"
                : "text-2xl sm:text-3xl"
          } ${vraag.figuur?.soort === "deelsom" && vraag.figuur.stil ? "sr-only" : ""}`}
        >
          {vraag.vraagtekst}
        </h2>

        {!invulbaar && velden}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onVolgende(true)}
          className="inline-flex min-h-12 items-center rounded-full border-2 border-rand bg-white px-5 py-3 text-base font-extrabold text-inkt-zacht transition hover:border-huisstijl hover:text-huisstijl-diep"
        >
          Weet ik niet
        </button>
        <button
          type="button"
          /* Hieraan vindt `useInBeeld` de knop terug, net als Controleer bij het oefenen. */
          data-controleer=""
          onClick={() => onVolgende()}
          disabled={!magDoor}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-huisstijl-diep px-6 py-3 text-base font-extrabold text-white transition hover:bg-huisstijl-donker disabled:cursor-not-allowed disabled:opacity-45"
        >
          {laatste ? "Klaar" : "Volgende"}
        </button>
      </div>
    </div>
  );
}

function Toetsuitslag({ groep, uitslag, onOpnieuw }: { groep: number; uitslag: Uitslag; onOpnieuw: () => void }) {
  return (
    <div className="st-nt-uitslag">
      <div className="st-nt-uitleg st-glas">
        <p className="st-boventitel">Uitslag groep {groep}</p>
        <h1 className="st-h1 st-titel">
          <em>{uitslag.goed}</em> van de {uitslag.totaal} goed
        </h1>

        {uitslag.niveaus.length > 0 && (
          <ul className="st-nt-niveaus" aria-label="Per referentieniveau">
            {uitslag.niveaus.map((n) => (
              <li key={n.niveau} data-beheerst={n.beheerst ? "ja" : "nee"}>
                <span className="st-nt-niveau st-titel">{n.niveau}</span>
                <span>
                  {n.beheerst ? "Beheerst" : "Nog niet beheerst"}
                  <small>
                    {n.goed} van de {n.totaal} goed
                  </small>
                </span>
              </li>
            ))}
          </ul>
        )}

        <table className="st-nt-tabel">
          <caption className="st-sr">Per onderdeel</caption>
          <thead>
            <tr>
              <th scope="col">Onderdeel</th>
              <th scope="col">Goed</th>
              <th scope="col">Uitslag</th>
            </tr>
          </thead>
          <tbody>
            {uitslag.onderdelen.map((o) => (
              <tr key={o.id}>
                <th scope="row">
                  {o.titel}
                  {o.niveau && <span className="st-nt-label">{o.niveau}</span>}
                </th>
                <td>
                  {o.goed}/{o.totaal}
                </td>
                <td>
                  <span className="st-nt-oordeel" data-oordeel={o.beoordeling}>
                    {BEOORDELING_LABEL[o.beoordeling]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {uitslag.oefenpunten.length > 0 ? (
          <div className="st-nt-advies">
            <h2 className="st-titel">Hier valt de meeste winst te halen</h2>
            <ul>
              {uitslag.oefenpunten.map((o) => (
                <li key={o.id}>{o.titel}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="st-nt-advies">
            <h2 className="st-titel">Alles beheerst</h2>
            <p>Mooi werk. Probeer gerust de toets van een groep hoger, of oefen verder met wat er in de klas komt.</p>
          </div>
        )}

        <p className="st-nt-klein">
          Dit is een indicatie, geen officiële toets. Er is niets bewaard: sluit je deze pagina, dan is de uitslag weg.
        </p>

        <div className="st-nt-knoppen">
          <Link href="/scholen" className="st-knop st-knop-goud">
            Oefen met de methode van school
            <IcoonPijl />
          </Link>
          <Link href="/#prijzen" className="st-knop st-knop-glas">
            Bekijk de abonnementen
          </Link>
          <button type="button" className="st-knop st-knop-glas" onClick={onOpnieuw}>
            Nog een keer
          </button>
        </div>
      </div>
    </div>
  );
}
