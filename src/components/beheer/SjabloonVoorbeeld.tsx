"use client";

/**
 * Live voorbeeld van tien sommen.
 *
 * Draait volledig in de browser: de generatoren zijn puur rekenwerk zonder
 * database, dus het voorbeeld ververst meteen bij elke wijziging, zonder
 * wachten en zonder dat er iets wordt opgeslagen.
 */

import { useMemo } from "react";
import { BosBeeld } from "@/components/oefenen/BosSpel";
import { Bus, Kralenrij, Splitsboom } from "@/components/oefenen/Figuurtekening";
import { Telrij } from "@/components/oefenen/Telfiguren";
import { Steenrij } from "@/components/oefenen/Stapstenen";
import { Plaatjesraster } from "@/components/oefenen/Plaatjesraster";
import { Blokkenvak } from "@/components/oefenen/Mabblokken";
import { Huizenrij } from "@/components/oefenen/Huizenrij";
import { Visvijver } from "@/components/oefenen/Visvijver";
import { Trein } from "@/components/oefenen/Trein";
import { Getallenlijnbeeld } from "@/components/oefenen/Getallenlijn";
import { Vakken } from "@/components/oefenen/Vakken";
import { Bioscoop } from "@/components/oefenen/Bioscoop";
import { zoekGenerator } from "@/lib/generatoren";
import { vulAanMetDubbele } from "@/lib/generatoren/soort";
import type { Instellingen } from "@/lib/generatoren/soort";

export function SjabloonVoorbeeld({
  soort,
  instellingen,
  aantal = 10,
  /*
    Voor welke groep het voorbeeld is; bepaalt welke vraagzin je ziet.

    Zonder groep valt het terug op 0. Dat is met opzet geen bestaande groep:
    er is dan geen groepszin die past, dus zie je de gezamenlijke zin — precies
    wat er ook gebeurt zolang je in het formulier nog geen groep hebt gekozen.
    Een standaard van 5 zou stilletjes de zin van groep 5 laten zien.
  */
  groep = 0,
  standaardvos,
  terugval = {},
}: {
  soort: string;
  instellingen: Instellingen;
  aantal?: number;
  groep?: number;
  /** De vos die geldt als het sjabloon zelf niets invult; alleen om te tonen. */
  standaardvos?: { vangend: string | null; wachtend: string | null; blij: string | null };
  /**
   * Wat er geldt als een mascotteveld leeg blijft, per veldsleutel.
   *
   * Zonder dit staat er in het voorbeeld geen vos terwijl het kind hem straks
   * wél ziet: bij het echte maken van de sommen wordt dezelfde aanvulling
   * gedaan, maar dan op de server. Zie `metStandaardmascottes`.
   */
  terugval?: Record<string, string>;
}) {
  const generator = zoekGenerator(soort);

  const sommen = useMemo(() => {
    if (!generator) return [];
    /*
      Eerst de standaardmascotte van dit type erbij, precies zoals de server
      dat straks doet. Wat het sjabloon zelf invult blijft staan.
    */
    const metVos: Instellingen = { ...instellingen };
    for (const [sleutel, waarde] of Object.entries(terugval)) {
      const eigen = metVos[sleutel];
      if (typeof eigen === "string" && eigen.trim() !== "") continue;
      metVos[sleutel] = waarde;
    }
    /*
      Vast zaad: het voorbeeld springt dan niet rond bij elke toetsaanslag.

      Zijn er minder verschillende sommen mogelijk dan er gevraagd zijn, dan
      wordt er aangevuld met dubbele — precies zoals bij Genereren. Zo laat het
      voorbeeld zien wat je straks ook echt krijgt, in plaats van een kortere
      lijst waarvan je moet raden wat er gebeurt.
    */
    const gemaakt = generator.maak(metVos, aantal, new Set(), 20260101, groep);
    return vulAanMetDubbele(gemaakt, gemaakt, aantal);
  }, [generator, instellingen, aantal, groep, terugval]);

  const maximum = generator?.maximum(instellingen) ?? null;
  /* Iets om op te letten terwijl er wél sommen uitkomen; zie `letOp` in `soort.ts`. */
  const letOp = generator?.letOp?.(instellingen) ?? null;
  /* Hoeveel er in deze lijst dubbel staan; zie de regel onder het lijstje. */
  const dubbel = sommen.length - new Set(sommen.map((s) => s.handtekening)).size;

  if (!generator) return null;

  if (sommen.length === 0) {
    /*
      Zegt het type zelf wat er mis is, dan staat dát er. Anders blijft de
      algemene zin staan die er altijd stond; zie `waarschuwing` in `soort.ts`.
    */
    return (
      <p className="rounded-md border border-oranje/40 bg-oranje-zacht px-3 py-2 text-sm text-oranje-diep">
        {generator.waarschuwing?.(instellingen) ??
          "Met deze instellingen komen er geen sommen uit. Vink bijvoorbeeld een tafel aan, of maak het bereik ruimer."}
      </p>
    );
  }

  return (
    <div>
      {/* Er komen sommen uit, maar er valt iets op; zie `letOp` in `soort.ts`. */}
      {letOp && (
        <p className="mb-3 rounded-md border border-oranje/50 bg-oranje-zacht px-3 py-2 text-sm text-oranje-diep">
          {letOp}
        </p>
      )}
      <ol className="divide-y divide-beheer-rand-zacht rounded-md border border-beheer-rand">
        {sommen.map((som, i) => {
          const antwoord =
            som.vorm === "meerkeuze"
              ? (som.opties?.[Number(som.antwoord)]?.tekst ?? "?")
              : som.antwoord;

          return (
            /* De handtekening kan nu twee keer voorkomen; de plek erbij houdt de sleutel uniek. */
            <li key={`${som.handtekening}:${i}`} className="flex items-start gap-3 px-3 py-2">
              <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-beheer-zacht">
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{som.vraagtekst}</p>
                {som.figuur?.soort === "bosspel" && <div className="mt-2 max-w-md"><BosBeeld figuur={som.figuur}/></div>}

                {som.figuur?.soort === "splitsboom" && (
                  <div className="mt-1 w-32">
                    <Splitsboom figuur={som.figuur} />
                  </div>
                )}

                {/*
                  Een kralenketting is breed; die krijgt meer ruimte dan de
                  splitsboom, anders zijn de kralen niet te tellen.
                */}
                {som.figuur?.soort === "kralenrij" && (
                  <div className="mt-1 w-full max-w-sm">
                    <Kralenrij figuur={som.figuur} pijlBeweegt={false} />
                  </div>
                )}

                {/*
                  De bus is nog breder dan de ketting: hij groeit met elk raam
                  mee. Daarom de volle kolombreedte, anders worden de poppetjes
                  in het voorbeeld te klein om te tellen.
                */}
                {som.figuur?.soort === "bus" && (
                  <div className="mt-1 w-full">
                    <Bus figuur={som.figuur} />
                  </div>
                )}

                {/*
                  De stenenrij op volle breedte: bij een grote sprong liggen de
                  stenen ver uit elkaar en wordt de rij breed.
                */}
                {som.figuur?.soort === "stapstenen" && (
                  <div className="mt-1 w-full">
                    {/* Zelfde beeld als in de oefening: oever links, gespiegeld bij terugtellen. */}
                    <Steenrij figuur={som.figuur} startoever spiegelen />
                  </div>
                )}

                {/*
                  Het plaatjesraster op halve breedte: genoeg om te zien of de
                  opstelling klopt — rijen van vijf, van tien of verspreid —
                  zonder dat het voorbeeld de hele lijst uit elkaar duwt. Niet
                  aantikbaar: in het voorbeeld valt er niets te tellen.
                */}
                {som.figuur?.soort === "plaatjesraster" && (
                  <div className="mt-1 w-full max-w-xs">
                    <Plaatjesraster
                      aantal={som.figuur.aantal}
                      plaatje={som.figuur.plaatje}
                      afbeelding={som.figuur.afbeelding}
                      perRij={som.figuur.perRij}
                      groepsruimte={som.figuur.groepsruimte}
                      aantikbaar={false}
                      beweegt={false}
                    />
                  </div>
                )}

                {/*
                  De blokken op halve breedte: genoeg om te zien of het getal
                  klopt — zoveel staven links, zoveel losse rechts. Stilstaand,
                  want in het voorbeeld hoeft Vos niets te bouwen.
                */}
                {/* De straat op halve breedte: genoeg om de nummers te zien kloppen. */}
                {som.figuur?.soort === "huizenrij" && (
                  <div className="mt-1 w-full max-w-sm">
                    <Huizenrij
                      huizen={som.figuur.huizen}
                      gevraagd={som.figuur.gevraagd}
                      gevraagden={som.figuur.gevraagden}
                      vos={som.figuur.vos.vangend ? som.figuur.vos : standaardvos}
                      beweegt={false}
                    />
                  </div>
                )}

                {/* De vijver op halve breedte: genoeg om de getallen te zien. */}
                {som.figuur?.soort === "visvijver" && (
                  <div className="mt-1 w-full max-w-sm">
                    <Visvijver
                      vissen={som.figuur.vissen}
                      gekozen=""
                      vos={som.figuur.vos.vangend ? som.figuur.vos : standaardvos}
                      hengel={som.figuur.hengel}
                    />
                  </div>
                )}

                {/*
                  De getallenlijn op volle breedte: de getallen moeten leesbaar
                  blijven. Vos staat waar het kind hem straks aantreft — aan het
                  begin van de lijn — met het gezochte getal op zijn vlaggetje.
                */}
                {som.figuur?.soort === "getallenlijn" &&
                  (som.figuur.stand === "schatten" ? (
                    /* De schatstand: een kale lijn met Vos en zijn vlaggetje aan het begin. */
                    <div className="mt-1 w-full">
                      <Getallenlijnbeeld
                        start={som.figuur.start}
                        eind={som.figuur.eind}
                        stap={som.figuur.stap}
                        zichtbaar={som.figuur.zichtbaar}
                        vrij
                        hulplijnen={som.figuur.hulplijnen ?? []}
                        vosBij={som.figuur.start}
                        vlag={som.figuur.doel}
                        vos={
                          som.figuur.vos.wachtend || som.figuur.vos.blij
                            ? {
                                vangend: som.figuur.vos.wachtend ?? som.figuur.vos.blij,
                                wachtend: som.figuur.vos.wachtend,
                                blij: som.figuur.vos.blij,
                              }
                            : (standaardvos ?? null)
                        }
                      />
                    </div>
                  ) : som.figuur.stand === "tussen" ? (
                    /* De tussenstand: het wijzertje met twee lege vakjes op de lijn. */
                    <div className="mt-1 w-full">
                      <Getallenlijnbeeld
                        start={som.figuur.start}
                        eind={som.figuur.eind}
                        stap={som.figuur.stap}
                        zichtbaar={som.figuur.zichtbaar}
                        wijzer={{ getal: som.figuur.wijzer ?? som.figuur.doel }}
                        vakjes={som.figuur.gevraagd ?? [som.figuur.doel]}
                        getypt={(som.figuur.gevraagd ?? [som.figuur.doel]).map(() => "")}
                        opDeLijn
                      />
                    </div>
                  ) : som.figuur.stand === "invullen" ? (
                    /* De invulstand: lege vakjes met een pijltje, zoals het kind ze krijgt. */
                    <div className="mt-1 w-full">
                      <Getallenlijnbeeld
                        start={som.figuur.start}
                        eind={som.figuur.eind}
                        stap={som.figuur.stap}
                        zichtbaar={som.figuur.zichtbaar}
                        vakjes={som.figuur.gevraagd ?? [som.figuur.doel]}
                        getypt={(som.figuur.gevraagd ?? [som.figuur.doel]).map(() => "")}
                      />
                    </div>
                  ) : (
                    <div className="mt-1 w-full">
                      <Getallenlijnbeeld
                        start={som.figuur.start}
                        eind={som.figuur.eind}
                        stap={som.figuur.stap}
                        zichtbaar={som.figuur.zichtbaar}
                        vosBij={som.figuur.start}
                        vlag={som.figuur.doel}
                        vos={
                          som.figuur.vos.wachtend || som.figuur.vos.blij
                            ? {
                                vangend: som.figuur.vos.wachtend ?? som.figuur.vos.blij,
                                wachtend: som.figuur.vos.wachtend,
                                blij: som.figuur.vos.blij,
                              }
                            : (standaardvos ?? null)
                        }
                      />
                    </div>
                  ))}

                {/* De trein op volle breedte: de wagons moeten leesbaar blijven. */}
                {som.figuur?.soort === "trein" && (
                  <div className="mt-1 w-full">
                    <Trein
                      wagons={som.figuur.wagons}
                      ingevuld={som.figuur.wagons.map(() => null)}
                      vos={som.figuur.vos.vangend ? som.figuur.vos : standaardvos}
                      machinist={som.figuur.machinist}
                    />
                  </div>
                )}

                {/* De vakken op volle breedte: de inhoud moet te tellen zijn. */}
                {som.figuur?.soort === "vakken" && (
                  <div className="mt-1 w-full">
                    <Vakken
                      vakken={som.figuur.vakken}
                      soort={som.figuur.materiaal as "telplaatjes" | "kralen" | "blokken"}
                      plaatje={som.figuur.plaatje}
                      perRij={som.figuur.perRij}
                      gevraagd={som.figuur.kaart}
                      gekozen=""
                      vos={som.figuur.vos.vangend ? som.figuur.vos : standaardvos}
                    />
                  </div>
                )}

                {/* De zaal op volle breedte: de stoelen moeten aan te wijzen zijn. */}
                {som.figuur?.soort === "bioscoop" && (
                  <div className="mt-1 w-full">
                    <Bioscoop
                      aantal={som.figuur.aantal}
                      perRij={som.figuur.perRij}
                      zichtbaar={som.figuur.zichtbaar}
                      gezocht={som.figuur.gezocht}
                      gekozen=""
                      vos={som.figuur.vos.vangend ? som.figuur.vos : standaardvos}
                    />
                  </div>
                )}

                {som.figuur?.soort === "mabblokken" && (
                  <div className="mt-1 w-full max-w-xs">
                    <Blokkenvak
                      tientallen={som.figuur.tientallen}
                      eenheden={som.figuur.eenheden}
                      stand="tellen"
                      beweegt={false}
                    />
                  </div>
                )}

                {som.figuur?.soort === "telrij" && (
                  <div className="mt-1">
                    <Telrij figuur={som.figuur} />
                  </div>
                )}

                {som.vorm === "meerkeuze" && (
                  <p className="mt-0.5 text-xs text-beheer-zacht">
                    Keuzes: {(som.opties ?? []).map((o) => o.tekst).join(" · ")}
                  </p>
                )}
              </div>

              <span className="shrink-0 rounded bg-groen-zacht px-2 py-0.5 text-xs font-semibold text-groen-diep">
                {antwoord}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-2 text-xs text-beheer-zacht">
        {maximum === null
          ? "Er zijn heel veel verschillende sommen mogelijk met deze instellingen."
          : `Met deze instellingen zijn er in totaal ${maximum} verschillende sommen mogelijk.`}
        {/*
          Staan er dubbele in de lijst, dan hoort erbij waaróm. Anders lijkt het
          alsof het voorbeeld zich vergist.
        */}
        {dubbel > 0 &&
          (dubbel === 1
            ? " Er zit er daarom 1 dubbel in dit voorbeeld."
            : ` Er zitten er daarom ${dubbel} dubbel in dit voorbeeld.`)}
      </p>
    </div>
  );
}
