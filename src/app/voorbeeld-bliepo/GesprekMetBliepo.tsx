"use client";

/**
 * Voorbeeld "Gesprek met Bliepo" (24 oktober 2026, opdracht eigenaar; akkoord
 * met aanpassingen). Sinds het akkoord gebruikt het voorbeeld het gedeelde
 * onderdeel components/gesprek (BliepoGesprek), dat ook klaarstaat voor alle
 * nieuwe lessen en opdrachten:
 * - een paar korte zinnen na elkaar, links boven Bliepo, zonder ballon; de
 *   oudste schuiven rustig weg;
 * - meelezen: gedimd → wit, het woord van nu oranje (tijden van ElevenLabs);
 * - grote ronde antwoordknoppen (niet voorgelezen);
 * - een ronde microfoonknop naast Bliepo: één keer tikken, hij stopt vanzelf
 *   na een tel stilte; Bliepo luistert met zijn hoofd schuin en de stem van
 *   het kind als golfjes op zijn scherm. De eerste keer wijst hij de knop aan.
 *
 * Hier wijst Bliepo de knop bij elke start aan (om het te kunnen zien); bij een
 * kind alleen de eerste keer op een apparaat.
 */

import { useCallback, useState } from "react";
import { Bliepo3DGedeeld } from "@/components/zappie/bliepo/Bliepo3DGedeeld";
import { BliepoGesprek } from "@/components/gesprek/Gesprek";
import { useOplichten } from "@/components/oefenen/BliepoTekst";
import { GESPREK } from "./gesprek-tekst";
import "./gesprek.css";

export function GesprekMetBliepo() {
  const voorkeur = useOplichten();
  const [oplichtenEigen, zetOplichtenEigen] = useState<boolean | null>(null);
  const oplichten = oplichtenEigen ?? voorkeur;
  const [begin, zetBegin] = useState(0);
  const [gebaar, zetGebaar] = useState<{ naam: string; n: number; opStem: boolean } | null>(null);
  const opGebaar = useCallback((naam: string, opStem: boolean) => zetGebaar((g) => ({ naam, n: (g?.n ?? 0) + 1, opStem })), []);

  return (
    <section id="gesprek" className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/20 bg-white/5 p-5" aria-labelledby="kop-gesprek">
      <h2 id="kop-gesprek" className="text-xl font-bold">
        Gesprek met Bliepo
      </h2>
      <p className="mt-1 text-sm text-white/75">
        Bliepo voert een kort gesprek bij de start van een les. Wat hij nog niet zei is grijs, het woord van nu oranje. Antwoord met
        de knoppen, of tik op de microfoon naast Bliepo en zeg het zelf (hij stopt vanzelf als je even stil bent).
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => zetBegin((b) => b + 1)}
          className="min-h-11 rounded-full bg-orange-500 px-5 font-extrabold text-white hover:bg-orange-600"
        >
          {begin ? "Begin opnieuw" : "Start het gesprek"}
        </button>
        <button
          type="button"
          aria-pressed={oplichten}
          onClick={() => zetOplichtenEigen(!oplichten)}
          className="min-h-11 rounded-full border border-white/40 px-4 text-sm font-bold hover:bg-white/10"
        >
          Woorden oplichten: {oplichten ? "aan" : "uit"}
        </button>
      </div>

      <div className="gmb-houder mt-4">
        <div className="gmb-scene">
          {/* eslint-disable-next-line @next/next/no-img-element -- dezelfde achtergrond als de opdrachten */}
          <img className="gmb-achtergrond" src="/assets/bliepo/achtergrond-opdracht/liggend-1280.webp" alt="" />

          <div className="gmb-bord" aria-label="Twee groepjes stippen: links vijf, rechts drie">
            <p className="gmb-bord-titel">Groepjes vergelijken</p>
            <div className="gmb-groepjes">
              <div className="gmb-groepje">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className="gmb-stip gmb-stip-rood" />
                ))}
              </div>
              <div className="gmb-groepje">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className="gmb-stip gmb-stip-blauw" />
                ))}
              </div>
            </div>
          </div>

          <div className="gmb-kolom">
            <BliepoGesprek
              stappen={GESPREK}
              begin={begin}
              oplichten={oplichten}
              uitlegAltijd
              onGebaar={opGebaar}
              onderwerp={{ opgaveId: "demo:gesprek-groepjes", domein: "getallen", leerdoel: "Groepjes en getallen vergelijken", demo: true, groep: 3 }}
              leeg={<p className="gmb-uitleg">Tik op &quot;Start het gesprek&quot;.</p>}
            >
              <Bliepo3DGedeeld rustig={false} rusthoek={-Math.PI / 9} volgMuis={false} gebaar={gebaar} geenTiktekst />
            </BliepoGesprek>
          </div>
        </div>
      </div>
    </section>
  );
}
