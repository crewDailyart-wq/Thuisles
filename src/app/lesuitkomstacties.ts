"use server";

/**
 * De uitkomst van een vraag in een les bewaren (besluit Sara, 9 november 2026).
 *
 * Bij welk kind het hoort, bepaalt de SERVER (het koekje van het apparaat), nooit de browser. Is er geen kind gekozen,
 * of gaat er iets mis, dan gebeurt er niets en merkt het kind niets: de les gaat gewoon door. Deze actie gooit nooit
 * een fout en stuurt nooit door.
 */

import { headers } from "next/headers";
import { huidigKind } from "@/lib/auth/sessie";
import { voorbeeldMagBewaren } from "@/lib/data/lesuitkomsten-voorbeeld";
import { bewaarLesUitkomst, type LesUitkomst } from "@/lib/data/lesuitkomsten";
import { beloonInEenKeer } from "@/lib/data/sleutels";
import { beloonSter, haalSterren } from "@/lib/data/sterren";
import { bewaarStand, haalStand, sluitStand } from "@/lib/data/lestussenstanden";
import { bewaarResultaat, haalResultaten } from "@/lib/data/lesresultaten";
import { netteStand, type Hervatstand } from "@/lib/hervatstand";

export async function bewaarUitkomst(invoer: { lesId: string; vraagId: string; uitkomst: LesUitkomst; denkfouten: string[]; pogingen: number }): Promise<{ ok: boolean; nieuweSleutel?: boolean }> {
  try {
    const kind = await huidigKind();
    if (!kind) return { ok: false };
    /* PRIVACY.md punt C (besluit Sara 19 nov 2026, B5): de voorbeeldpagina bewaart alleen voor Testkind, ook zonder Referer. */
    const kop = await headers();
    if (!voorbeeldMagBewaren(kop.get("referer"), kind.roepnaam, kop.get("next-router-state-tree"))) return { ok: false };
    /* Vraagnamen met een "+" of spatie (bijvoorbeeld "vraag4-2+6-krentenbol" bij Plussommen) werden stil geweigerd (gevonden 28 nov 2026). */
    const vraagId = String(invoer.vraagId).toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 80);
    const ok = bewaarLesUitkomst({ kindId: kind.id, ...invoer, vraagId, denkfouten: Array.isArray(invoer.denkfouten) ? invoer.denkfouten.map(String) : [] });
    /* Sleutel alleen bij 'goed in één keer' (pogingen 1, geen denkfout); bij een fout verliest het kind nooit iets. */
    const nieuweSleutel = ok && invoer.uitkomst === "goed in één keer" && invoer.pogingen === 1 ? beloonInEenKeer(kind.id, invoer.lesId, vraagId) : false;
    return { ok, nieuweSleutel };
  } catch {
    return { ok: false };
  }
}

/** Aan het einde van een les: de ster voor het afmaken (1 keer per les per kind). Zelfde regels als hierboven. */
export async function bewaarLesAfgemaakt(lesId: string): Promise<{ ok: boolean; nieuweSter?: boolean }> {
  try {
    if (!/^[a-z0-9-]{1,80}$/.test(String(lesId))) return { ok: false };
    const kind = await huidigKind();
    if (!kind) return { ok: false };
    const kop = await headers();
    if (!voorbeeldMagBewaren(kop.get("referer"), kind.roepnaam, kop.get("next-router-state-tree"))) return { ok: false };
    return { ok: true, nieuweSter: beloonSter(kind.id, lesId) };
  } catch {
    return { ok: false };
  }
}

/** Het totaal aantal sterren van het kind (voor de teller rechtsboven). Zonder gekozen kind: 0. Gooit nooit een fout. */
export async function haalSterrenTotaal(): Promise<{ aantal: number }> {
  try {
    const kind = await huidigKind();
    return { aantal: kind ? haalSterren(kind.id).aantal : 0 };
  } catch {
    return { aantal: 0 };
  }
}

/**
 * Na de tik op de kaart (26 nov 2026): het resultaat van de les bewaren: alleen de kleur (volgt uit het percentage), het
 * percentage goed in 1 keer, de denkfouten en de datum. Zelfde regels als hierboven: alleen voor het gekozen kind, op de
 * voorbeeldpagina alleen voor Testkind, nooit een fout of doorsturen. Een herhaling kan de kleur alleen verbeteren; haalt
 * de herhaling de beste kleur, dan komt de tweede ster erbij (`nieuweHerhalingsster`).
 */
export async function bewaarLesResultaat(invoer: { lesId: string; percentage: number; denkfouten: string[] }): Promise<{ ok: boolean; nieuweHerhalingsster?: boolean }> {
  try {
    if (!/^[a-z0-9-]{1,80}$/.test(String(invoer.lesId))) return { ok: false };
    const kind = await huidigKind();
    if (!kind) return { ok: false };
    const kop = await headers();
    if (!voorbeeldMagBewaren(kop.get("referer"), kind.roepnaam, kop.get("next-router-state-tree"))) return { ok: false };
    const r = bewaarResultaat(kind.id, invoer.lesId, Number(invoer.percentage), Array.isArray(invoer.denkfouten) ? invoer.denkfouten.map(String) : []);
    /* De les is af: opnieuw doen begint bij het begin (zoals Synthesis). */
    sluitStand(kind.id, invoer.lesId);
    return { ok: true, nieuweHerhalingsster: r.nieuweHerhalingsster };
  } catch {
    return { ok: false };
  }
}

/** Het gekozen kind dat hier mag bewaren (zelfde regels als hierboven), of null. */
async function bewaarKind() {
  const kind = await huidigKind();
  if (!kind) return null;
  const kop = await headers();
  return voorbeeldMagBewaren(kop.get("referer"), kind.roepnaam, kop.get("next-router-state-tree")) ? kind : null;
}

/** Na elke afgeronde vraag (28 nov 2026): waar het kind is, voor het verdergaan en het rondje op het onderwerpenscherm. */
export async function bewaarLesStap(invoer: { lesId: string; af: number; stand: Hervatstand }): Promise<{ ok: boolean }> {
  try {
    if (!/^[a-z0-9-]{1,80}$/.test(String(invoer.lesId))) return { ok: false };
    const stand = netteStand(invoer.stand);
    const af = Number(invoer.af);
    if (!stand || !(af >= 0 && af <= 100)) return { ok: false };
    const kind = await bewaarKind();
    if (!kind) return { ok: false };
    bewaarStand(kind.id, invoer.lesId, af, stand);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Bij het openen van een les: waar het kind was, en of het de les al eens afmaakte (met welk percentage). */
export async function haalLesStart(lesId: string): Promise<{ stand: Hervatstand | null; eerder: number | null }> {
  try {
    if (!/^[a-z0-9-]{1,80}$/.test(String(lesId))) return { stand: null, eerder: null };
    const kind = await bewaarKind();
    if (!kind) return { stand: null, eerder: null };
    const eerder = haalResultaten(kind.id).find((r) => r.lesId === lesId)?.percentage ?? null;
    return { stand: haalStand(kind.id, lesId), eerder };
  } catch {
    return { stand: null, eerder: null };
  }
}
