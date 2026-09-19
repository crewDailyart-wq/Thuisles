"use client";

/**
 * Detail van één sjabloon: gegevens, instellingen aanpassen, nog meer sommen
 * maken, alles publiceren, of het sjabloon weggooien inclusief zijn sommen.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  bewerkSjabloon,
  werkTekstenBij,
  genereer,
  publiceerAlles,
  wegSjabloon,
} from "@/app/admin/sjabloonacties";
import { Gegevens, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { SjabloonInstellingen } from "@/components/beheer/SjabloonInstellingen";
import { SjabloonVoorbeeld } from "@/components/beheer/SjabloonVoorbeeld";
import { UitlegVoorbeeld } from "@/components/beheer/UitlegVoorbeeld";
import { MAX_SOMMEN_PER_KEER, neemVraagtekstenOver } from "@/lib/generatoren/soort";
import { Figuurtekening } from "@/components/oefenen/Figuurtekening";
import { zoekGenerator } from "@/lib/generatoren";
import type { Instellingen } from "@/lib/generatoren/soort";
import type { GenereerUitslag, SjabloonInContext } from "@/lib/data/sjablonen";
import type { VraagInContext } from "@/lib/vraagtypes";
import { STATUS_LABEL, VORM_LABEL, antwoordInTekst } from "@/lib/vraagtypes";

/**
 * Wat er na het genereren in beeld komt.
 *
 * Zijn er minder verschillende sommen mogelijk dan er gevraagd zijn, dan komen
 * er dubbele in de reeks. Dat staat er met zoveel woorden bij: zo zie je dat de
 * instellingen weinig variatie geven en kun je ze ruimer zetten.
 */
function berichtNaGenereren(u: GenereerUitslag): string {
  if (u.dubbel === 0) return "Sommen toegevoegd. Ze staan als concept klaar.";
  return `${u.gemaakt} sommen toegevoegd, waarvan ${u.dubbel} dubbel: er zijn maar ${u.verschillend} verschillende sommen mogelijk met deze instellingen. Ze staan als concept klaar.`;
}

export function SjabloonDetail({
  sjabloon,
  vragen,
  vakSlug,
  algemeenAantal,
  afbeeldingen = [],
  terugval = {},
}: {
  sjabloon: SjabloonInContext;
  vragen: VraagInContext[];
  vakSlug: string;
  /** De algemene standaard, om te tonen wat 'leeg' betekent. */
  algemeenAantal: number;
  /** Bestaande afbeeldingen, voor een instelling van het soort "afbeelding". */
  afbeeldingen?: string[];
  /**
   * Wat er geldt als een mascotteveld leeg blijft, per veldsleutel.
   *
   * Zo is te zien dát er een vos staat zonder dat er iets ingevuld hoeft te
   * worden; zie `SjabloonInstellingen`.
   */
  terugval?: Record<string, string>;
}) {
  const router = useRouter();
  const [bezig, start] = useTransition();
  const [bericht, setBericht] = useState("");
  const [fout, setFout] = useState("");
  const [bewerken, setBewerken] = useState(false);
  /* Eerste klik vraagt om bevestiging, tweede voert uit. */
  const [bevestigTeksten, setBevestigTeksten] = useState(false);
  /* Leeg = volg de algemene standaard; wordt op het leerdoel bewaard. */
  const [perSessie, setPerSessie] = useState(
    sjabloon.vragenPerSessie === null ? "" : String(sjabloon.vragenPerSessie),
  );

  const [naam, setNaam] = useState(sjabloon.naam);
  const [hint, setHint] = useState(sjabloon.hint);
  /*
    De vraagtekst kon vroeger alleen per groepsblok (3-4, 5-6, 7-8); nu per
    losse groep. `neemVraagtekstenOver` zet een zin die nog onder een blok
    staat alvast op de bijbehorende groepen, zodat je hem hier meteen ziet
    staan en hij bij het opslaan mee overgaat.

    Bewust hier en niet als migratie op de database: er verandert pas iets aan
    wat er is opgeslagen als jij zelf op opslaan drukt.

    Wat er nog niet is opgeslagen, komt van de standaard van het type.

    Dat is nodig zodra er een instelling bij een type bij komt: die staat dan
    nog niet in dit sjabloon, en het formulier liet hem tot nu toe leeg zien —
    een getalveld zelfs op zijn laagste waarde. Wie daarna op opslaan drukte,
    schreef die lege waarde eroverheen en raakte een instelling kwijt die hij
    nooit had aangeraakt. Wat hier ingevuld raakt is precies wat de oefening
    tóch al gebruikt zolang er niets staat, dus voor het kind verandert er
    niets; alleen is nu te zien wat er geldt.
  */
  const [instellingen, setInstellingen] = useState<Instellingen>(() =>
    neemVraagtekstenOver({
      ...(zoekGenerator(sjabloon.soort)?.standaard ?? {}),
      ...sjabloon.instellingen,
    }),
  );
  const [aantal, setAantal] = useState(30);

  const generator = zoekGenerator(sjabloon.soort);
  // Een echte som uit dit sjabloon, zodat het voorbeeld klopt met wat je maakt.
  const eersteSom = vragen.find((v) => v.somgegevens)?.somgegevens ?? null;
  const maximum = generator?.maximum(instellingen) ?? null;

  /* `na` krijgt de uitslag mee, zodat een melding kan zeggen wát er gebeurde. */
  function doe<T extends { ok: boolean; fout?: string }>(
    actie: () => Promise<T>,
    na?: (uitslag: T) => void,
  ) {
    setFout("");
    setBericht("");
    start(async () => {
      const u = await actie();
      if (!u.ok) return setFout(u.fout ?? "Er ging iets mis.");
      na?.(u);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {(bericht || fout) && (
        <p
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            fout
              ? "border border-roze/40 bg-roze-zacht text-roze"
              : "border border-groen/30 bg-groen-zacht text-groen-diep"
          }`}
        >
          {fout || bericht}
        </p>
      )}

      <Paneel
        titel="Gegevens"
        acties={
          <button type="button" onClick={() => setBewerken(!bewerken)} className={stijl.knopStil}>
            {bewerken ? "Sluiten" : "Bewerken"}
          </button>
        }
      >
        <Gegevens
          rijen={[
            ["Naam", sjabloon.naam],
            ["Soort sommen", generator?.naam ?? sjabloon.soort],
            ["Leerdoel", `${sjabloon.leerdoelCode} — ${sjabloon.leerdoelTitel}`],
            ["Groep", `Groep ${sjabloon.groep}`],
            ["Hint", sjabloon.hint || <span className="text-beheer-zacht">geen</span>],
            [
              /*
                Ook in het leesblok, niet alleen achter Bewerken. Een instelling
                die je pas ziet na een klik, lijkt er niet te zijn.
              */
              "Vragen per oefensessie",
              sjabloon.vragenPerSessie === null ? (
                <span key="p" className="text-beheer-zacht">
                  Volgt de algemene standaard ({algemeenAantal})
                </span>
              ) : (
                sjabloon.vragenPerSessie
              ),
            ],
            [
              "Sommen",
              `${sjabloon.aantalVragen} (${sjabloon.aantalVragen - sjabloon.aantalConcept} gepubliceerd)`,
            ],
          ]}
        />

        {/*
          Bewust niet afhankelijk van `generator`. Kent de code het soort sommen
          niet (meer), dan moeten naam, hint en vragen per oefensessie nog
          steeds aan te passen zijn; alleen de instellingen en het voorbeeld
          kunnen dan niet getoond worden.
        */}
        {bewerken && (
          <div className="mt-4 border-t border-beheer-rand pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Naam
                </span>
                <input value={naam} onChange={(e) => setNaam(e.target.value)} className={stijl.veld} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Hint bij een fout antwoord
                </span>
                <input value={hint} onChange={(e) => setHint(e.target.value)} className={stijl.veld} />
              </label>

              {/*
                Het aantal hoort bij het LEERDOEL, niet bij dit sjabloon: een
                oefensessie gaat over het leerdoel, ook als er meerdere
                sjablonen onder hangen. Je stelt het hier in omdat je hier toch
                al bezig bent; het wordt op het leerdoel opgeslagen.
              */}
              <label className="block">
                <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Vragen per oefensessie
                </span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={perSessie}
                  placeholder={String(algemeenAantal)}
                  onChange={(e) => setPerSessie(e.target.value)}
                  className={`${stijl.veld} max-w-40`}
                />
                <span className="mt-1 block text-xs text-beheer-zacht">
                  Leeg laten = de algemene standaard ({algemeenAantal}). Geldt voor het
                  leerdoel {sjabloon.leerdoelCode}. Zijn er minder gepubliceerde vragen,
                  dan komen ze gewoon allemaal langs. Je kunt dit altijd aanpassen,
                  ook als de vragen al gepubliceerd zijn.
                </span>
              </label>
            </div>

            {generator && (
            <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
                  Instellingen
                </p>
                <SjabloonInstellingen
                  afbeeldingen={afbeeldingen}
                  velden={generator.velden}
                  waarden={instellingen}
                  terugval={terugval}
                  onWijzig={(s, w) => setInstellingen((h) => ({ ...h, [s]: w }))}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
                  Voorbeeld
                </p>
                <SjabloonVoorbeeld
                  soort={sjabloon.soort}
                  instellingen={instellingen}
                  groep={sjabloon.groep}
                  terugval={terugval}
                />
              </div>
            </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={bezig}
                onClick={() =>
                  doe(
                    () => {
                      const d = new FormData();
                      d.set("id", sjabloon.id);
                      d.set("naam", naam);
                      d.set("hint", hint);
                      d.set("instellingen", JSON.stringify(instellingen));
                      d.set("vragenPerSessie", perSessie);
                      return bewerkSjabloon(d);
                    },
                    () => {
                      setBewerken(false);
                      setBericht("Instellingen opgeslagen. Nieuwe sommen volgen deze instellingen.");
                    },
                  )
                }
                className={stijl.knop}
              >
                Opslaan
              </button>

              {/*
                Opslaan raakt alleen nieuwe sommen. Verandert er een vraagtekst,
                dan wil je die soms ook bij de sommen die er al staan; soms juist
                niet, want daar kunnen gepubliceerde vragen bij zitten die
                kinderen al hebben gezien. Daarom een aparte knop met een
                bevestiging, en geen automatisme.
              */}
              <button
                type="button"
                disabled={bezig || sjabloon.aantalVragen === 0}
                onClick={() => {
                  /*
                    Twee klikken in plaats van een systeemdialoog: de eerste
                    klik vraagt om bevestiging in de knop zelf. Onder de
                    bestaande sommen kunnen gepubliceerde vragen zitten die
                    kinderen al hebben gezien, dus dit gebeurt nooit per
                    ongeluk — maar het hoeft ook geen pop-up te zijn.
                  */
                  if (!bevestigTeksten) {
                    setBevestigTeksten(true);
                    return;
                  }
                  setBevestigTeksten(false);
                  doe(
                    () => {
                      const d = new FormData();
                      d.set("id", sjabloon.id);
                      return werkTekstenBij(d);
                    },
                    (u) =>
                      setBericht(
                        !u.ok || u.waarde === 0
                          ? "De bestaande sommen hadden deze tekst al."
                          : `${u.waarde} bestaande ${u.waarde === 1 ? "som" : "sommen"} bijgewerkt.`,
                      ),
                  );
                }}
                className={bevestigTeksten ? stijl.knop : stijl.knopStil}
                title="Pas de nieuwe vraagtekst ook toe op de sommen die er al staan"
              >
                {bevestigTeksten
                  ? `Zeker weten? Werk ${sjabloon.aantalVragen} sommen bij`
                  : "Ook bestaande sommen bijwerken"}
              </button>
              <button
                type="button"
                onClick={() =>
                  doe(
                    () => {
                      const d = new FormData();
                      d.set("id", sjabloon.id);
                      return wegSjabloon(d);
                    },
                    () => router.push(`/admin/${vakSlug}/sjablonen`),
                  )
                }
                className="inline-flex h-8 items-center rounded-md px-2 text-xs text-beheer-zacht transition hover:text-roze"
              >
                Sjabloon en alle {sjabloon.aantalVragen} sommen verwijderen
              </button>
            </div>
          </div>
        )}
      </Paneel>

      <Paneel
        titel="Uitleg bij een fout antwoord"
        bijschrift="Zo ziet de animatie eruit die een kind krijgt. Je kunt per groepsvorm en strategie kijken."
      >
        {eersteSom ? (
          <UitlegVoorbeeld soort={sjabloon.soort} voorbeeld={eersteSom} />
        ) : (
          <p className="text-sm text-beheer-zacht">
            Maak eerst een paar sommen; dan kun je de uitleg bekijken.
          </p>
        )}
      </Paneel>

      <Paneel titel="Meer sommen maken" bijschrift="Nieuwe sommen zijn altijd anders dan wat er al staat.">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              Hoeveel erbij
            </span>
            <input
              type="number"
              min={1}
              max={MAX_SOMMEN_PER_KEER}
              value={aantal}
              onChange={(e) => setAantal(Number(e.target.value))}
              className={`${stijl.veld} w-28`}
            />
          </label>

          <button
            type="button"
            disabled={bezig}
            onClick={() =>
              doe(
                () => {
                  const d = new FormData();
                  d.set("id", sjabloon.id);
                  d.set("aantal", String(aantal));
                  return genereer(d);
                },
                (u) => setBericht(u.ok ? berichtNaGenereren(u.waarde) : ""),
              )
            }
            className={stijl.knopGroot}
          >
            Genereren
          </button>

          {sjabloon.aantalConcept > 0 && (
            <button
              type="button"
              disabled={bezig}
              onClick={() =>
                doe(
                  () => {
                    const d = new FormData();
                    d.set("id", sjabloon.id);
                    return publiceerAlles(d);
                  },
                  () => setBericht("Alle sommen van dit sjabloon zijn gepubliceerd."),
                )
              }
              className="inline-flex h-9 items-center rounded-md border border-groen px-3.5 text-sm font-semibold text-groen-diep transition hover:bg-groen-zacht"
            >
              Alle {sjabloon.aantalConcept} concepten publiceren
            </button>
          )}
        </div>

        {maximum !== null && (
          <p className="mt-2 text-xs text-beheer-zacht">
            Met deze instellingen bestaan er {maximum} verschillende sommen; er
            staan er al {sjabloon.aantalVragen}.
            {/*
              Wat er gebeurt als je er meer vraagt dan er bestaan. Vroeger
              kwamen er dan minder uit; nu krijg je het aantal dat je vraagt,
              met een paar dubbele erbij. Het getal hierboven blijft staan,
              zodat je nog steeds ziet dat de instellingen weinig variatie
              geven en je ze ruimer kunt zetten.
            */}{" "}
            Vraag je er meer dan {maximum}, dan komen er een paar dubbel in te
            zitten.
          </p>
        )}
      </Paneel>

      <Paneel
        titel="Gemaakte sommen"
        bijschrift={`${vragen.length} bij dit sjabloon`}
        acties={
          <Link href={`/admin/${vakSlug}/vragen?leerdoel=${sjabloon.leerdoelId}`} className={stijl.knopStil}>
            In het vragenoverzicht
          </Link>
        }
        geenVulling
      >
        {vragen.length === 0 ? (
          <Leeg tekst="Nog geen sommen gemaakt." hint="Klik hierboven op Genereren." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <Tabelkop kolommen={["Som", "Antwoord", "Type", "Status"]} />
              <tbody>
                {vragen.map((v) => (
                  <tr key={v.id} className="border-b border-beheer-rand-zacht last:border-0">
                    <td className="px-3 py-2">
                      <span className="block font-medium">{v.vraagtekst}</span>
                      {v.figuur && (
                        <span className="mt-1 block w-24">
                          <Figuurtekening figuur={v.figuur} />
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium">{antwoordInTekst(v)}</td>
                    <td className="px-3 py-2 text-xs text-beheer-zacht">{VORM_LABEL[v.vorm]}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
                          v.status === "gepubliceerd"
                            ? "bg-groen-zacht text-groen-diep"
                            : "bg-beheer-vlak text-beheer-zacht"
                        }`}
                      >
                        {STATUS_LABEL[v.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paneel>
    </div>
  );
}
