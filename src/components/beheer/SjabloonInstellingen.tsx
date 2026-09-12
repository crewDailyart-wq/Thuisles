"use client";

/**
 * Het instellingenformulier van een sjabloon.
 *
 * Bouwt zichzelf op uit wat de generator opgeeft. Komt er later een nieuw
 * soort sjabloon bij, dan verschijnt het formulier vanzelf — hier hoeft niets
 * aan te veranderen.
 */

import { stijl } from "@/components/beheer/Bouwstenen";
import type { Instellingen, Veld } from "@/lib/generatoren/soort";

export function SjabloonInstellingen({
  velden,
  waarden,
  onWijzig,
}: {
  velden: Veld[];
  waarden: Instellingen;
  onWijzig: (sleutel: string, waarde: Instellingen[string]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {velden.map((veld) => {
        if (veld.soort === "vinkje") {
          return (
            <label key={veld.sleutel} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(waarden[veld.sleutel])}
                onChange={(e) => onWijzig(veld.sleutel, e.target.checked)}
                className="mt-0.5 size-4 accent-[#5b3fd6]"
              />
              <span>
                {veld.label}
                {veld.hulp && (
                  <span className="block text-xs text-beheer-zacht">{veld.hulp}</span>
                )}
              </span>
            </label>
          );
        }

        if (veld.soort === "keuze") {
          return (
            <label key={veld.sleutel} className="block">
              <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                {veld.label}
              </span>
              <select
                value={String(waarden[veld.sleutel] ?? "")}
                onChange={(e) => onWijzig(veld.sleutel, e.target.value)}
                className={stijl.veld}
              >
                {veld.opties.map((o) => (
                  <option key={o.waarde} value={o.waarde}>
                    {o.label}
                  </option>
                ))}
              </select>
              {veld.hulp && <span className="mt-1 block text-xs text-beheer-zacht">{veld.hulp}</span>}
            </label>
          );
        }

        if (veld.soort === "getal") {
          return (
            <label key={veld.sleutel} className="block">
              <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                {veld.label}
              </span>
              <input
                type="number"
                min={veld.min}
                max={veld.max}
                value={Number(waarden[veld.sleutel] ?? veld.min)}
                onChange={(e) => onWijzig(veld.sleutel, Number(e.target.value))}
                className={`${stijl.veld} w-32`}
              />
              {veld.hulp && <span className="mt-1 block text-xs text-beheer-zacht">{veld.hulp}</span>}
            </label>
          );
        }

        if (veld.soort === "tekst") {
          return (
            <label key={veld.sleutel} className="block">
              <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                {veld.label}
              </span>
              <input
                type="text"
                value={String(waarden[veld.sleutel] ?? "")}
                placeholder={veld.plaatshouder}
                onChange={(e) => onWijzig(veld.sleutel, e.target.value)}
                className={stijl.veld}
              />
              {veld.hulp && (
                <span className="mt-1 block text-xs text-beheer-zacht">{veld.hulp}</span>
              )}
            </label>
          );
        }

        // vinkjes: meerdere aan te vinken
        const gekozen = Array.isArray(waarden[veld.sleutel])
          ? (waarden[veld.sleutel] as string[])
          : [];

        return (
          <div key={veld.sleutel}>
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              {veld.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {veld.opties.map((o) => {
                const aan = gekozen.includes(o.waarde);
                return (
                  <button
                    key={o.waarde}
                    type="button"
                    aria-pressed={aan}
                    onClick={() =>
                      onWijzig(
                        veld.sleutel,
                        aan ? gekozen.filter((g) => g !== o.waarde) : [...gekozen, o.waarde],
                      )
                    }
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                      aan
                        ? "border-viool bg-viool/8 text-viool"
                        : "border-beheer-rand bg-white hover:border-viool/50"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            {veld.hulp && <span className="mt-1 block text-xs text-beheer-zacht">{veld.hulp}</span>}
          </div>
        );
      })}
    </div>
  );
}
