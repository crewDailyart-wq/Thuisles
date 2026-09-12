"use client";

/**
 * Zoekveld en vraagtype: de twee filters die alleen bij het vragenscherm horen.
 *
 * Stonden eerder in `Filterbalk` samen met domein en leerdoel. Die twee zijn
 * verhuisd naar de gedeelde `Stapfilter`, zodat ze op elk beheerscherm
 * hetzelfde werken. Wat hier overblijft is wat écht alleen over vragen gaat.
 *
 * Net als de rest staan de keuzes in het webadres, niet in het geheugen van de
 * pagina, zodat een gefilterd overzicht te bewaren en door te sturen is.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { VORM_LABEL, VRAAGVORMEN } from "@/lib/vraagtypes";

const veld =
  "h-9 rounded-md border border-beheer-rand bg-white px-2.5 text-sm text-beheer-inkt outline-none transition focus:border-viool focus:ring-2 focus:ring-viool/20";

export function Zoekvelden({ basisPad }: { basisPad: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, start] = useTransition();

  function wijzig(naam: string, waarde: string) {
    const nieuw = new URLSearchParams(params.toString());
    if (waarde) nieuw.set(naam, waarde);
    else nieuw.delete(naam);
    nieuw.delete("toegevoegd");
    start(() => router.replace(`${basisPad}?${nieuw.toString()}`));
  }

  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="text-[0.68rem] font-medium uppercase tracking-wide text-beheer-zacht">
          Vraagtype
        </span>
        <select
          value={params.get("vorm") ?? ""}
          onChange={(e) => wijzig("vorm", e.target.value)}
          className={`${veld} min-w-[9rem]`}
        >
          <option value="">Alle types</option>
          {VRAAGVORMEN.map((v) => (
            <option key={v} value={v}>
              {VORM_LABEL[v]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 min-w-[13rem]">
        <span className="text-[0.68rem] font-medium uppercase tracking-wide text-beheer-zacht">
          Zoeken
        </span>
        <input
          type="search"
          defaultValue={params.get("zoek") ?? ""}
          placeholder="Zoek in vraagtekst of leerdoel"
          onChange={(e) => wijzig("zoek", e.target.value)}
          className={veld}
        />
      </label>
    </>
  );
}
