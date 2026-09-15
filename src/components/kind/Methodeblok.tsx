/**
 * Gedeelde onderdelen voor een methodeblok.
 *
 * Een blok komt op twee plekken terug: in het rekenpaneel op het startscherm
 * en op het scherm "Oefenen volgens school". Ze moeten er hetzelfde uitzien —
 * dezelfde kleuren, hetzelfde merkje, dezelfde woorden — dus staat dat hier
 * één keer.
 *
 *   groen vinkje            = voltooid
 *   oranje cirkel met nummer = waar het kind nu is
 *   hangslotje              = nog op slot
 */

import { Icoon } from "@/components/kind/Icoon";
import type { MethodeBlok, MethodeBlokStatus } from "@/lib/types";

export const BLOK_RAND: Record<MethodeBlokStatus, string> = {
  voltooid: "border-groen/25 bg-groen-zacht/60",
  bezig: "border-huisstijl bg-huisstijl-zacht",
  gesloten: "border-rand bg-room/40 opacity-70",
};

export const BLOK_LABEL: Record<MethodeBlokStatus, string> = {
  voltooid: "Voltooid",
  bezig: "Waar je nu bent",
  gesloten: "Nog niet open",
};

export function BlokMerk({ blok }: { blok: MethodeBlok }) {
  if (blok.status === "voltooid") {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-groen text-white">
        <Icoon naam="vinkje" className="size-5" />
      </span>
    );
  }
  if (blok.status === "bezig") {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-huisstijl-diep text-base font-extrabold text-white ring-4 ring-huisstijl-zacht">
        {blok.nummer}
      </span>
    );
  }
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rand text-inkt-zacht">
      <Icoon naam="slot" className="size-4" />
    </span>
  );
}

/**
 * De tekst die verschijnt als er geen betrouwbare methode bekend is.
 *
 * HARDE PROJECTREGEL: er wordt nooit een methode geraden of ingevuld. Zolang
 * de koppeling ontbreekt staat hier letterlijk dat de methode nog niet bekend
 * is, en verder niets.
 */
export function MethodeOnbekend() {
  return (
    <div className="rounded-2xl border border-dashed border-rand bg-room/50 px-5 py-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-kaart text-inkt-zacht shadow-zacht">
        <Icoon naam="school" className="size-7" />
      </span>
      <p className="mt-3 text-sm font-extrabold">Rekenmethode nog niet bekend.</p>
      <p className="mx-auto mt-1 max-w-xs text-sm font-semibold text-inkt-zacht">
        Zodra je ouder de school heeft ingesteld, kun je hier oefenen in
        dezelfde volgorde als op school. Tot die tijd werkt vrij oefenen gewoon.
      </p>
    </div>
  );
}
