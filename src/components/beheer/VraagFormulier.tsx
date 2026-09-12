"use client";

/**
 * Formulier om één vraag toe te voegen.
 *
 * Eerst het vraagtype, daarna alleen de velden die daarbij horen. Bij een open
 * vraag zie je dus geen antwoordopties, en bij waar/niet waar geen invulveld.
 * Dat scheelt fouten en maakt het scherm rustiger.
 *
 * De controle gebeurt op de server (`controleerVraag`), zodat het formulier en
 * de bulk-upload nooit uit elkaar kunnen lopen. Wat je hier ziet zijn dus geen
 * losse regels, maar dezelfde regels.
 */

import { useActionState, useState } from "react";
import { voegVraagToe, type FormulierUitslag } from "@/app/admin/acties";
import { useRouter } from "next/navigation";
import { AfbeeldingKiezer } from "@/components/beheer/AfbeeldingKiezer";
import { SnelLeerdoel } from "@/components/beheer/SnelLeerdoel";
import {
  VORM_LABEL,
  VORM_UITLEG,
  VRAAGVORMEN,
  type Vraagvorm,
} from "@/lib/vraagtypes";
import type { LeerdoelRegel } from "@/lib/data/vragen";

const veld =
  "w-full rounded-md border border-beheer-rand bg-white px-3 py-2 text-sm text-beheer-inkt outline-none transition placeholder:text-beheer-zacht/70 focus:border-viool focus:ring-2 focus:ring-viool/20";

function Label({
  titel,
  hulp,
  children,
}: {
  titel: string;
  hulp?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-beheer-zacht">
        {titel}
      </span>
      {children}
      {hulp && <span className="mt-1 block text-xs text-beheer-zacht">{hulp}</span>}
    </label>
  );
}

function Blok({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-beheer-rand bg-beheer-kaart p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold">{titel}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function VraagFormulier({
  leerdoelen,
  vakId,
  afbeeldingen,
  startVorm = "",
  startLeerdoelId = "",
}: {
  leerdoelen: LeerdoelRegel[];
  /** Het vak waaronder nieuwe domeinen worden gemaakt. */
  vakId: string;
  /** Zo kun je vanaf het overzicht meteen bij het juiste leerdoel beginnen. */
  startLeerdoelId?: string;
  /** Bestandsnamen uit `public/vragen`, voor de keuzelijstjes. */
  afbeeldingen: string[];
  /** Zo kun je rechtstreeks naar een formulier voor één vraagtype linken. */
  startVorm?: Vraagvorm | "";
}) {
  const [uitslag, verstuur, bezig] = useActionState<FormulierUitslag, FormData>(
    voegVraagToe,
    null,
  );

  const router = useRouter();
  const [vorm, setVorm] = useState<Vraagvorm | "">(startVorm);
  /*
    Ook de leerdoelenlijst staat in de state. Maak je er hier eentje bij, dan
    staat hij meteen in de keuzelijst en is hij al geselecteerd — zonder de
    pagina te verversen en zonder wat je al had ingevuld kwijt te raken.
  */
  const [lijst, setLijst] = useState<LeerdoelRegel[]>(leerdoelen);
  /*
    De lijst met beschikbare bestanden staat in de state, niet alleen in de
    eigenschap. Zo verschijnt een zojuist geüploade afbeelding meteen in alle
    keuzelijstjes, zonder de pagina te verversen.
  */
  const [beschikbaar, setBeschikbaar] = useState<string[]>(afbeeldingen);
  const [vraagBeeld, setVraagBeeld] = useState("");
  const [uitlegBeeld, setUitlegBeeld] = useState("");

  function voegToeAanLijst(bestandsnaam: string) {
    setBeschikbaar((lijst) =>
      lijst.includes(bestandsnaam) ? lijst : [...lijst, bestandsnaam].sort(),
    );
  }
  const [leerdoelId, setLeerdoelId] = useState(startLeerdoelId);
  const [opties, setOpties] = useState<string[]>(["", "", "", ""]);
  const [optieBeelden, setOptieBeelden] = useState<string[]>(["", "", "", ""]);
  const [goed, setGoed] = useState(0);

  function wijzigOptie(i: number, waarde: string) {
    setOpties(opties.map((o, j) => (j === i ? waarde : o)));
  }

  function wijzigBeeld(i: number, waarde: string) {
    setOptieBeelden(optieBeelden.map((o, j) => (j === i ? waarde : o)));
  }

  const leerdoel = lijst.find((l) => l.id === leerdoelId);
  const groepen = leerdoel
    ? Array.from(
        { length: leerdoel.groepTot - leerdoel.groepVan + 1 },
        (_, i) => leerdoel.groepVan + i,
      )
    : [];

  return (
    <form action={verstuur} className="flex flex-col gap-4">
      {uitslag?.fouten?.length ? (
        <div className="rounded-md border border-roze/40 bg-roze-zacht px-3 py-2.5">
          <p className="text-sm font-semibold text-roze">
            De vraag is niet opgeslagen:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-roze">
            {uitslag.fouten.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Stap 1 — vraagtype */}
      <Blok titel="1. Wat voor vraag wordt het?">
        <div className="grid gap-2.5 sm:grid-cols-3">
          {VRAAGVORMEN.map((v) => {
            const gekozen = vorm === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVorm(v)}
                aria-pressed={gekozen}
                className={`rounded-md border p-3 text-left transition ${
                  gekozen
                    ? "border-viool bg-viool/6 ring-2 ring-viool/25"
                    : "border-beheer-rand bg-white hover:border-viool/50"
                }`}
              >
                <span className="block text-sm font-semibold">{VORM_LABEL[v]}</span>
                <span className="mt-0.5 block text-xs leading-snug text-beheer-zacht">
                  {VORM_UITLEG[v]}
                </span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="vorm" value={vorm} />
      </Blok>

      {/* De rest verschijnt pas als het type bekend is. */}
      {vorm && (
        <>
          <Blok titel="2. Waar hoort de vraag bij?">
            <Label
              titel="Leerdoel"
              hulp="Hiermee ligt ook het vak, het domein en het subdomein vast."
            >
              <select
                name="leerdoelId"
                required
                value={leerdoelId}
                onChange={(e) => setLeerdoelId(e.target.value)}
                className={veld}
              >
                <option value="">Kies een leerdoel…</option>
                {lijst.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.vakNaam} › {l.domeinNaam} › {l.subdomeinNaam} — {l.titel}
                  </option>
                ))}
              </select>
            </Label>

            <SnelLeerdoel
              vakId={vakId}
              leerdoelen={lijst}
              onNieuwLeerdoel={(regel) => {
                setLijst((huidig) => [...huidig, regel]);
                setLeerdoelId(regel.id);
              }}
              onStructuurGewijzigd={() => router.refresh()}
            />

            {leerdoel && (
              <p className="-mt-1 rounded-md bg-beheer-vlak px-3 py-2 text-xs text-beheer-zacht">
                Code <span className="font-mono font-medium text-beheer-inkt">{leerdoel.code}</span>
                {" · "}relevant voor groep {leerdoel.groepVan} tot en met {leerdoel.groepTot}
                {" · "}{leerdoel.aantalVragen} vragen
              </p>
            )}

            <Label titel="Groep" hulp="Alleen groepen die bij dit leerdoel horen.">
              <select name="groep" required disabled={!leerdoel} className={veld}>
                {!leerdoel && <option value="">Kies eerst een leerdoel…</option>}
                {groepen.map((g) => (
                  <option key={g} value={g}>
                    Groep {g}
                  </option>
                ))}
              </select>
            </Label>
          </Blok>

          <Blok titel="3. De vraag zelf">
            <Label titel="Vraagtekst">
              <textarea
                name="vraagtekst"
                required
                rows={2}
                placeholder={
                  vorm === "waar_niet_waar"
                    ? "Bijvoorbeeld: 7 × 8 is 54"
                    : "Bijvoorbeeld: Hoeveel is 7 × 8?"
                }
                className={veld}
              />
            </Label>

            {/* Alleen bij meerkeuze: de antwoordopties. */}
            {vorm === "meerkeuze" && (
              <div>
                <span className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Antwoorden
                </span>
                <p className="mb-2 text-xs text-beheer-zacht">
                  Vink aan welk antwoord goed is. Twee tot zes antwoorden. Per
                  antwoord kun je tekst invullen, een afbeelding kiezen, of
                  allebei. Staat de afbeelding er nog niet bij? Klik dan op
                  Uploaden — hij staat er meteen in.
                </p>
                <div className="flex flex-col gap-2.5">
                  {opties.map((waarde, i) => {
                    const beeld = optieBeelden[i] ?? "";
                    return (
                      <div
                        key={i}
                        className="rounded-md border border-beheer-rand bg-beheer-vlak/60 p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="antwoord"
                            value={i}
                            checked={goed === i}
                            onChange={() => setGoed(i)}
                            aria-label={`Antwoord ${i + 1} is goed`}
                            className="size-4 accent-[#5b3fd6]"
                          />
                          <input
                            type="text"
                            name={`optie-${i}`}
                            value={waarde}
                            onChange={(e) => wijzigOptie(i, e.target.value)}
                            placeholder={`Antwoord ${i + 1} (tekst, mag leeg bij een plaatje)`}
                            className={veld}
                          />
                          {opties.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpties(opties.filter((_, j) => j !== i));
                                setOptieBeelden(optieBeelden.filter((_, j) => j !== i));
                                if (goed >= opties.length - 1) setGoed(0);
                              }}
                              aria-label={`Antwoord ${i + 1} verwijderen`}
                              className="shrink-0 rounded px-2 py-1 text-xs text-beheer-zacht transition hover:bg-roze/10 hover:text-roze"
                            >
                              Weg
                            </button>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2 pl-6">
                          <AfbeeldingKiezer
                            naam={`optie-afbeelding-${i}`}
                            waarde={beeld}
                            beschikbaar={beschikbaar}
                            compact
                            onWijzig={(v) => wijzigBeeld(i, v)}
                            onNieuw={(bestandsnaam) => {
                              voegToeAanLijst(bestandsnaam);
                              wijzigBeeld(i, bestandsnaam);
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {opties.length < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpties([...opties, ""]);
                      setOptieBeelden([...optieBeelden, ""]);
                    }}
                    className="mt-2 rounded-md border border-beheer-rand px-2.5 py-1.5 text-xs font-medium transition hover:border-viool hover:text-viool"
                  >
                    + Antwoord toevoegen
                  </button>
                )}
              </div>
            )}

            {/* Alleen bij een open vraag: de goede antwoorden. */}
            {vorm === "open" && (
              <Label
                titel="Goed antwoord"
                hulp="Meerdere schrijfwijzen mogen goed zijn. Scheid ze met een liggend streepje, bijvoorbeeld: 56|zesenvijftig"
              >
                <input type="text" name="antwoord" required placeholder="56" className={veld} />
              </Label>
            )}

            {/* Alleen bij waar/niet waar: de stelling klopt wel of niet. */}
            {vorm === "waar_niet_waar" && (
              <div>
                <span className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Klopt de stelling?
                </span>
                <div className="flex gap-2">
                  {[
                    { waarde: "waar", label: "Waar" },
                    { waarde: "niet_waar", label: "Niet waar" },
                  ].map((o) => (
                    <label
                      key={o.waarde}
                      className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-beheer-rand bg-white px-3 py-2 text-sm transition has-checked:border-viool has-checked:bg-viool/6"
                    >
                      <input
                        type="radio"
                        name="antwoord"
                        value={o.waarde}
                        required
                        className="size-4 accent-[#5b3fd6]"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </Blok>

          <Blok titel="4. Extra (mag leeg blijven)">
            <Label
              titel="Hint"
              hulp="Verschijnt wanneer het kind er niet uitkomt. Nooit alleen 'fout' — altijd een steuntje."
            >
              <input
                type="text"
                name="hint"
                placeholder="Denk aan de tafel van 7."
                className={veld}
              />
            </Label>

            <Label
              titel="Uitleg bij een fout antwoord"
              hulp="Zo los je deze som op. Laat je dit leeg, dan krijgt het kind alleen het goede antwoord met de hint."
            >
              <textarea
                name="uitleg"
                rows={2}
                placeholder="Bijvoorbeeld: Tel eerst de rode knikkers, dan de blauwe, en tel die twee bij elkaar op."
                className={veld}
              />
            </Label>

            <Label
              titel="Uitlegafbeelding"
              hulp="Optioneel. Wordt getoond bij een fout antwoord."
            >
              <AfbeeldingKiezer
                naam="uitlegAfbeelding"
                waarde={uitlegBeeld}
                beschikbaar={beschikbaar}
                onWijzig={setUitlegBeeld}
                onNieuw={(bestandsnaam) => {
                  voegToeAanLijst(bestandsnaam);
                  setUitlegBeeld(bestandsnaam);
                }}
              />
            </Label>

            <Label
              titel="Afbeelding bij de vraag"
              hulp="Kies een bestaande afbeelding of upload er een vanaf je computer."
            >
              <AfbeeldingKiezer
                naam="afbeelding"
                waarde={vraagBeeld}
                beschikbaar={beschikbaar}
                onWijzig={setVraagBeeld}
                onNieuw={(bestandsnaam) => {
                  voegToeAanLijst(bestandsnaam);
                  setVraagBeeld(bestandsnaam);
                }}
              />
            </Label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="status"
                value="gepubliceerd"
                className="size-4 accent-[#5b3fd6]"
              />
              Meteen publiceren (anders blijft de vraag een concept)
            </label>
          </Blok>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={bezig}
              className="inline-flex h-9 items-center rounded-md bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
            >
              {bezig ? "Bezig met opslaan…" : "Vraag opslaan"}
            </button>
            <span className="text-xs text-beheer-zacht">
              De vraag komt in de database te staan, gekoppeld aan het gekozen leerdoel.
            </span>
          </div>
        </>
      )}
    </form>
  );
}
