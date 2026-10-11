"use client";

/**
 * Het maatje voor alles aan of uit, met wat er klaarstaat.
 *
 * Staat op het scherm Vakken, bij de andere instellingen die voor alles
 * gelden. Per leerdoel zet je het maatje aan of uit op het leerdoelscherm.
 */

import { useState } from "react";
import { Paneel } from "@/components/beheer/Bouwstenen";
import { Fout, useActie } from "@/components/beheer/RegelFormulier";
import { zetMaatjeAlles } from "@/app/admin/instellingacties";

export function MaatjeInstelling({
  aan,
  leerdoelenAan,
  leerdoelenTotaal,
  onbekend,
}: {
  aan: boolean;
  leerdoelenAan: number;
  leerdoelenTotaal: number;
  onbekend: { vraagtekst: string | null; leerdoel: string | null; antwoord: string; aangemaaktOp: string }[];
}) {
  const { doe, bezig, fout } = useActie();
  const [stand, setStand] = useState(aan);

  return (
    <Paneel titel="Het maatje" bijschrift="Vos helpt bij het oefenen: hij leest voor, zegt iets bij goed en fout, en geeft na 30 seconden een tip.">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="maatje"
          checked={stand}
          disabled={bezig}
          onChange={(e) => {
            const nieuw = e.target.checked;
            setStand(nieuw);
            doe(() => {
              const d = new FormData();
              d.set("maatje", nieuw ? "1" : "0");
              return zetMaatjeAlles(d);
            });
          }}
        />
        <span className="font-semibold">Maatje aan voor alle oefeningen</span>
      </label>
      <Fout tekst={fout} />
      <p className="mt-2 text-xs text-beheer-zacht">
        {stand
          ? `Het maatje staat aan bij ${leerdoelenAan} van de ${leerdoelenTotaal} leerdoelen. Per leerdoel zet je het aan of uit op het leerdoelscherm.`
          : `Het maatje staat nu overal uit. Wat je per leerdoel hebt ingesteld (${leerdoelenAan} aan), blijft bewaard voor als je het weer aanzet.`}
      </p>

      <h3 className="mt-5 text-sm font-semibold">Antwoorden die het maatje niet herkende</h3>
      <p className="text-xs text-beheer-zacht">
        Zonder naam van het kind. Hiermee kunnen later nieuwe bekende fouten worden toegevoegd.
      </p>
      {onbekend.length === 0 ? (
        <p className="mt-2 text-sm text-beheer-zacht">Nog niets.</p>
      ) : (
        <ul className="mt-2 max-h-72 overflow-y-auto text-sm">
          {onbekend.map((o, i) => (
            <li key={i} className="border-b border-beheer-rand py-1.5">
              <span className="font-semibold">{o.antwoord}</span>{" "}
              <span className="text-beheer-zacht">
                bij “{o.vraagtekst ?? "?"}” — {o.leerdoel ?? "?"} — {o.aangemaaktOp.slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Paneel>
  );
}
