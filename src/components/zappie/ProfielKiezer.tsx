"use client";

/**
 * "Wie gaat er oefenen?" (23 oktober 2026, opdracht eigenaar), zoals bij
 * Netflix: verschijnt altijd eerst als de site opent of ververst wordt, met de
 * kinderen van het account als grote ronde profielen en Bliepo die zwaait.
 *
 * Waarom: browsers spelen geen geluid af voordat er op de pagina getikt is.
 * De tik op het profiel geeft het geluid vrij (binnen die tik), daarna gaat de
 * startpagina open zonder de pagina te herladen en zegt Bliepo meteen hallo.
 *
 * Heeft een kind een kindcode, dan vraagt het scherm eerst om die code (een
 * echt invoerveld met alleen cijfers, regel 5).
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { kiesProfielOpStart } from "@/app/(toegang)/acties";
import { Pictogram } from "@/components/kind/Pictogram";
import type { PictogramNaam } from "@/lib/types";
import { BliepoFilm } from "@/components/zappie/bliepo/BliepoFilm";
import { bliepoGeluidKlaar } from "@/lib/bliepo-geluid";
import { ontgrendelGeluid, zetProfielGekozen } from "@/components/zappie/profielkeuze";

export type Profiel = { id: string; naam: string; avatar: PictogramNaam; code: boolean };

export function ProfielKiezer({ profielen, rustig }: { profielen: Profiel[]; rustig: boolean }) {
  const router = useRouter();
  const [bezig, zetBezig] = useState<string | null>(null);
  const [codeVoor, zetCodeVoor] = useState<Profiel | null>(null);
  const [code, zetCode] = useState("");
  const [fout, zetFout] = useState("");
  /*
    Bliepo zwaaide hier om de paar tellen; sinds 26 oktober 2026 (opdracht
    eigenaar) zwaait hij alleen nog op een groetwoord. Hier staat hij rustig
    (het rust-filmpje: ademen en rondkijken).
  */

  /* Niet scrollen achter het scherm. */
  useEffect(() => {
    const oud = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = oud;
    };
  }, []);

  async function kies(p: Profiel, metCode = "") {
    /* Eerst, nog binnen de tik: het geluid vrijgeven. */
    ontgrendelGeluid(bliepoGeluidKlaar);
    zetBezig(p.id);
    zetFout("");
    const uit = await kiesProfielOpStart(p.id, metCode).catch(() => ({ fout: "Dat lukte even niet. Probeer het nog eens." }));
    zetBezig(null);
    if ("code" in uit) {
      zetCodeVoor(p);
      return;
    }
    if ("fout" in uit) {
      zetFout(uit.fout);
      return;
    }
    zetProfielGekozen();
    /* Naam en plaatje rechtsboven bijwerken, zonder de pagina te herladen. */
    router.refresh();
  }

  const groot = profielen.length === 1;
  return (
    <div className="zp-wie" role="dialog" aria-modal="true" aria-labelledby="zp-wie-kop">
      <div className="zp-wie-bliepo" aria-hidden="true">
        <BliepoFilm houding="rust" rustig={rustig} className="h-full w-full" />
      </div>
      <h1 id="zp-wie-kop" className="zp-titel zp-wie-kop">
        {codeVoor ? `Hoi ${codeVoor.naam}!` : "Wie gaat er oefenen?"}
      </h1>

      {codeVoor ? (
        <form
          className="zp-wie-code"
          onSubmit={(e) => {
            e.preventDefault();
            void kies(codeVoor, code);
          }}
        >
          <label htmlFor="zp-kindcode">Typ je code van vier cijfers</label>
          <input
            id="zp-kindcode"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={4}
            value={code}
            onChange={(e) => zetCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            autoFocus
          />
          <button type="submit" className="zp-wie-verder" disabled={code.length < 4 || bezig !== null}>
            Verder
          </button>
          <button type="button" className="zp-wie-terug" onClick={() => (zetCodeVoor(null), zetCode(""), zetFout(""))}>
            Toch een ander profiel
          </button>
        </form>
      ) : (
        <ul className={`zp-wie-lijst${groot ? " zp-wie-groot" : ""}`}>
          {profielen.map((p) => (
            <li key={p.id}>
              <button type="button" className="zp-wie-profiel" onClick={() => void kies(p)} disabled={bezig !== null} aria-busy={bezig === p.id}>
                <span className="zp-wie-profiel-rond">
                  <Pictogram naam={p.avatar} className="size-[62%]" />
                </span>
                <span className="zp-wie-profiel-naam">{p.naam}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {fout && (
        <p className="zp-wie-fout" role="alert">
          {fout}
        </p>
      )}
    </div>
  );
}
