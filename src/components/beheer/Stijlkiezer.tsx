"use client";

/**
 * De stijlkiezer (24 oktober 2026, uitgebreid 26 oktober 2026, opdracht
 * eigenaar): lettertypes voor titels en leestekst, lettergrootte, kleuren,
 * knopvorm en knopstijl, de praatknop en de grootte van Bliepo, voor de hele
 * kinderkant. Rechts een echt opdrachtscherm (/voorbeeld/stijl, in een
 * venster) dat meteen meeverandert, als laptop of als telefoon. Pas na
 * Bewaren zien de kinderen het.
 */

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { bewaarStijl, slaThemaOp, stijlTerug, vorigeStijlTerug } from "@/app/admin/stijlacties";
import { STIJL_KANAAL } from "@/components/stijl/StijlVerversen";
import type { Thema } from "@/lib/data/stijl";
import {
  BLIEPO_MATEN,
  GROOTTES,
  isStandaard,
  KNOPSTIJLEN,
  KNOPVORMEN,
  LETTERTYPES,
  letterLabel,
  PRAATKNOPPEN,
  STANDAARD_STIJL,
  zelfdeStijl,
  type Lettertype,
  type Stijl,
} from "@/lib/stijl";

const KLEUREN: { sleutel: keyof Stijl; label: string; uitleg: string }[] = [
  { sleutel: "hoofd", label: "Hoofdkleur", uitleg: "Bovenbalk, de ruimte en het profielscherm." },
  { sleutel: "accent", label: "Accentkleur", uitleg: "Woord van nu, Controleer en de grote startknop." },
  { sleutel: "goed", label: "Goed antwoord", uitleg: "Het bord gloeit in deze kleur." },
  { sleutel: "fout", label: "Fout antwoord", uitleg: "Zacht, het kind mag het nog eens proberen." },
  { sleutel: "tekst", label: "Tekst van Bliepo", uitleg: "Wat hij zegt en al gezegd heeft." },
  { sleutel: "gedimd", label: "Nog niet gezegd", uitleg: "Wordt half doorzichtig getoond." },
  { sleutel: "knop", label: "Antwoordknop", uitleg: "De kleur van de antwoordknoppen." },
  { sleutel: "knoptekst", label: "Tekst op de knop", uitleg: "" },
  { sleutel: "microfoon", label: "Microfoontje", uitleg: "Op de witte praatknop." },
];

const SCHERMEN = {
  laptop: { label: "Laptop", b: 1280, h: 800 },
  telefoon: { label: "Telefoon", b: 390, h: 844 },
} as const;

type Keuze<K extends string> = Record<K, { label: string; uitleg?: string }>;

function Rondjes<K extends string>({ naam, label, keuzes, waarde, onKies, vorm }: { naam: string; label: string; keuzes: Keuze<K>; waarde: K; onKies: (k: K) => void; vorm?: (k: K) => string }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {(Object.keys(keuzes) as K[]).map((k) => (
          <label
            key={k}
            title={keuzes[k].uitleg}
            className={`flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm ${waarde === k ? "border-viool bg-viool/10 font-semibold" : "border-beheer-rand"}`}
            style={{ borderRadius: vorm ? vorm(k) : 8 }}
          >
            <input type="radio" name={naam} className="sr-only" checked={waarde === k} onChange={() => onKies(k)} />
            {keuzes[k].label}
          </label>
        ))}
      </div>
      {keuzes[waarde].uitleg && <span className="text-xs text-beheer-zacht">{keuzes[waarde].uitleg}</span>}
    </fieldset>
  );
}


export function Stijlkiezer({ begin, vorige: beginVorige, themas: beginThemas }: { begin: Stijl; vorige: number; themas: Thema[] }) {
  const [stijl, zetStijl] = useState<Stijl>(begin);
  const [bewaard, zetBewaard] = useState<Stijl>(begin);
  const [vorige, zetVorige] = useState(beginVorige);
  const [themas, zetThemas] = useState(beginThemas);
  const [themaNaam, zetThemaNaam] = useState("");
  const [bezig, start] = useTransition();
  const [melding, zetMelding] = useState("");
  const [scherm, zetScherm] = useState<keyof typeof SCHERMEN>("laptop");

  /* Het voorbeeld: een echt opdrachtscherm in een venster, geschaald tot het past. */
  const venster = useRef<HTMLIFrameElement>(null);
  const vak = useRef<HTMLDivElement>(null);
  const [breedte, zetBreedte] = useState(0);
  useEffect(() => {
    const el = vak.current;
    if (!el) return;
    const ro = new ResizeObserver(() => zetBreedte(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const stuur = useCallback((s: Stijl) => venster.current?.contentWindow?.postMessage({ soort: "stijl", stijl: s }, window.location.origin), []);
  useEffect(() => stuur(stijl), [stijl, stuur]);
  useEffect(() => {
    const op = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.soort === "voorbeeld-klaar") stuur(stijl);
    };
    window.addEventListener("message", op);
    return () => window.removeEventListener("message", op);
  }, [stijl, stuur]);

  const zet = <K extends keyof Stijl>(k: K, v: Stijl[K]) => {
    zetStijl((s) => ({ ...s, [k]: v }));
    zetMelding("");
  };
  const veranderd = !zelfdeStijl(stijl, bewaard);

  /* Na bewaren: open tabbladen van de kinderkant in deze browser verversen meteen. */
  const meldBewaard = (s: Stijl, aantal: number, tekst: string) => {
    zetStijl(s);
    zetBewaard(s);
    zetVorige(aantal);
    zetMelding(tekst);
    try {
      const kanaal = new BroadcastChannel(STIJL_KANAAL);
      kanaal.postMessage("bewaard");
      kanaal.close();
    } catch {
      /* oudere browser: dan ziet een open tabblad het na verversen */
    }
  };

  const veld = "rounded-md border border-beheer-rand bg-white px-2 py-1.5 text-sm";
  const ma = SCHERMEN[scherm];
  const schaal = breedte ? Math.min(1, breedte / ma.b) : 0.5;

  const letterKeuze = (label: string, waarde: Lettertype | "standaard", onKies: (v: Lettertype | "standaard") => void, metStandaard: boolean) => {
    const familie = waarde === "standaard" ? LETTERTYPES.lexend.familie : LETTERTYPES[waarde].familie;
    return (
      <label className="flex flex-col gap-1 text-sm font-semibold">
        {label}
        <select className={veld} value={waarde} onChange={(e) => onKies(e.target.value as Lettertype | "standaard")}>
          {metStandaard && <option value="standaard">Zoals nu (Lexend; Bliepo in het titellettertype)</option>}
          {(Object.keys(LETTERTYPES) as Lettertype[]).map((k) => (
            <option key={k} value={k} style={{ fontFamily: LETTERTYPES[k].familie }}>
              {letterLabel(k)}
            </option>
          ))}
        </select>
        <span className="rounded-md bg-beheer-vlak px-3 py-2 text-xl font-normal" style={{ fontFamily: `${familie}, system-ui` }}>
          Aa Gg · een appel en een geit
        </span>
        {waarde !== "standaard" && <span className="text-xs font-normal text-beheer-zacht">{LETTERTYPES[waarde].uitleg}</span>}
      </label>
    );
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4 rounded-lg border border-beheer-rand bg-white p-4">
        {letterKeuze("Lettertype voor titels en knoppen", stijl.titelLetter, (v) => zet("titelLetter", v as Lettertype), false)}
        {letterKeuze("Lettertype voor leestekst", stijl.leesLetter, (v) => zet("leesLetter", v), true)}
        <Rondjes naam="grootte" label="Lettergrootte" keuzes={GROOTTES} waarde={stijl.grootte} onKies={(k) => zet("grootte", k)} />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold">Kleuren</legend>
          {KLEUREN.map((k) => (
            <label key={k.sleutel} className="flex items-center gap-3 text-sm">
              <input
                type="color"
                value={stijl[k.sleutel] as string}
                onChange={(e) => zet(k.sleutel, e.target.value as never)}
                className="h-9 w-12 shrink-0 cursor-pointer rounded border border-beheer-rand bg-white p-0.5"
              />
              <span className="flex flex-col">
                <span className="font-medium">{k.label}</span>
                {k.uitleg && <span className="text-xs text-beheer-zacht">{k.uitleg}</span>}
              </span>
              <span className="ml-auto font-mono text-xs text-beheer-zacht">{stijl[k.sleutel] as string}</span>
            </label>
          ))}
        </fieldset>

        <Rondjes naam="knopvorm" label="Knopvorm" keuzes={KNOPVORMEN} waarde={stijl.knopvorm} onKies={(k) => zet("knopvorm", k)} vorm={(k) => KNOPVORMEN[k].css} />
        <Rondjes naam="knopstijl" label="Knopstijl" keuzes={KNOPSTIJLEN} waarde={stijl.knopstijl} onKies={(k) => zet("knopstijl", k)} />
        <Rondjes naam="praatknop" label="Praatknop" keuzes={PRAATKNOPPEN} waarde={stijl.praatknop} onKies={(k) => zet("praatknop", k)} />
        <Rondjes naam="bliepo" label="Grootte van Bliepo" keuzes={BLIEPO_MATEN} waarde={stijl.bliepo} onKies={(k) => zet("bliepo", k)} />

        <div className="flex flex-wrap items-center gap-2 border-t border-beheer-rand pt-3">
          <button
            type="button"
            disabled={bezig || !veranderd}
            onClick={() =>
              start(async () => {
                const uit = await bewaarStijl(stijl);
                meldBewaard(uit.stijl, uit.vorige, "Bewaard. De kinderen zien de nieuwe stijl vanaf nu, overal.");
              })
            }
            className="rounded-md bg-viool px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Bewaren
          </button>
          <button
            type="button"
            disabled={bezig || vorige === 0}
            title={vorige === 0 ? "Er is nog geen vorige versie bewaard." : `Er ${vorige === 1 ? "is 1 vorige versie" : `zijn ${vorige} vorige versies`} bewaard.`}
            onClick={() =>
              start(async () => {
                const uit = await vorigeStijlTerug();
                if (uit.ok) meldBewaard(uit.stijl, uit.vorige, "De vorige versie staat weer aan.");
              })
            }
            className="rounded-md border border-beheer-rand px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Terug naar vorige versie
          </button>
          <button
            type="button"
            disabled={bezig || isStandaard(stijl)}
            onClick={() => {
              if (isStandaard(bewaard)) {
                zetStijl(STANDAARD_STIJL);
                return;
              }
              start(async () => {
                const uit = await stijlTerug();
                meldBewaard(uit.stijl, uit.vorige, "Terug naar de standaard (het goedgekeurde ontwerp).");
              });
            }}
            className="rounded-md border border-beheer-rand px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Terug naar de standaard
          </button>
          {veranderd && !melding && <span className="text-xs text-beheer-zacht">Nog niet bewaard.</span>}
          {melding && (
            <span role="status" className="text-xs font-semibold text-groen">
              {melding}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-beheer-rand pt-3">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Opslaan als thema
            <span className="flex gap-2">
              <input className={`${veld} min-w-0 flex-1`} value={themaNaam} maxLength={40} placeholder="Naam, bijvoorbeeld Herfst" onChange={(e) => zetThemaNaam(e.target.value)} />
              <button
                type="button"
                disabled={bezig || !themaNaam.trim()}
                onClick={() =>
                  start(async () => {
                    zetThemas(await slaThemaOp(themaNaam, stijl));
                    zetMelding(`Thema "${themaNaam.trim()}" opgeslagen.`);
                    zetThemaNaam("");
                  })
                }
                className="rounded-md border border-beheer-rand px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
              >
                Opslaan als thema
              </button>
            </span>
          </label>
          {themas.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-beheer-zacht">Jouw thema&apos;s (kies er een, en klik daarna op Bewaren):</span>
              <div className="flex flex-wrap gap-2">
                {themas.map((t) => (
                  <button
                    key={t.naam}
                    type="button"
                    onClick={() => {
                      zetStijl(t.stijl);
                      zetMelding("");
                    }}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm ${zelfdeStijl(t.stijl, stijl) ? "border-viool bg-viool/10 font-semibold" : "border-beheer-rand"}`}
                  >
                    <span className="size-3 rounded-full" style={{ background: t.stijl.hoofd }} />
                    <span className="size-3 rounded-full" style={{ background: t.stijl.accent }} />
                    {t.naam}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 self-start xl:sticky xl:top-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Voorbeeld als</span>
          {(Object.keys(SCHERMEN) as (keyof typeof SCHERMEN)[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={scherm === k}
              onClick={() => zetScherm(k)}
              className={`rounded-md border px-3 py-1 text-sm ${scherm === k ? "border-viool bg-viool/10 font-semibold" : "border-beheer-rand bg-white"}`}
            >
              {SCHERMEN[k].label}
            </button>
          ))}
          <span className="ml-auto flex gap-2">
            {(["goed", "fout"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => venster.current?.contentWindow?.postMessage({ soort: "fase", fase: f }, window.location.origin)}
                className="rounded-md border border-beheer-rand bg-white px-3 py-1 text-sm"
              >
                Toon {f} antwoord
              </button>
            ))}
          </span>
        </div>
        <div ref={vak} aria-label="Voorbeeld" className="w-full">
          <div className="mx-auto overflow-hidden rounded-xl border border-beheer-rand bg-[#0b3fc4] shadow-sm" style={{ width: ma.b * schaal, height: ma.h * schaal }}>
            <iframe
              ref={venster}
              key={scherm}
              title={`Voorbeeld van een opdracht op een ${ma.label.toLowerCase()}`}
              src="/voorbeeld/stijl"
              onLoad={() => stuur(stijl)}
              style={{ width: ma.b, height: ma.h, border: 0, transform: `scale(${schaal})`, transformOrigin: "0 0" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
