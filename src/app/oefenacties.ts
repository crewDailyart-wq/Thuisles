"use server";

/**
 * Wat er na een oefenronde wordt bewaard.
 *
 * De antwoorden worden pas aan het eind van de ronde in één keer opgestuurd:
 * dat scheelt wachten tijdens het oefenen, en het kind merkt er niets van.
 *
 * Bij welk kind ze horen, bepaalt de SERVER — nooit de browser. Een
 * serveractie is een openbaar eindpunt; zou het kind-id meekomen uit het
 * scherm, dan kon iemand voortgang bij een willekeurig profiel wegschrijven.
 */

import { revalidatePath } from "next/cache";
import { vereisKind } from "@/lib/auth/sessie";
import { markeerKlaargezetGedaan } from "@/lib/data/dashboard";
import {
  isKindInstelling,
  zetKindInstelling,
} from "@/lib/data/kindinstellingen";
import {
  bewaarOefensessie,
  wisOefensessie,
  type Oefensessie,
} from "@/lib/data/oefensessies";
import { beloonGoedeAntwoorden, haalSleutels } from "@/lib/data/sleutels";
import {
  bewaarAntwoorden,
  meldZelfLastig,
  type AntwoordInvoer,
} from "@/lib/data/voortgang";

/** Wat het scherm aanlevert: alles behalve bij wie het hoort. */
export type RondeAntwoord = Omit<AntwoordInvoer, "kindId">;

/**
 * Eén sleutel bijschrijven, meteen na een goed antwoord.
 *
 * Waarom niet wachten tot het eind van de ronde: het kind ziet de sleutel naar
 * de teller vliegen en de teller omhoog gaan. Dat mag geen loze animatie zijn —
 * wat op het scherm gebeurt, moet op dat moment ook echt in de database staan.
 * Sluit het kind daarna de tablet, dan is de sleutel gewoon verdiend.
 *
 * `bron` is "<rondeId>:<vraagId>". Dezelfde bron gaat aan het eind van de ronde
 * nog een keer mee als vangnet; de unieke index op (reden, bron_id) zorgt dat
 * dat geen tweede sleutel oplevert.
 *
 * Geeft het nieuwe saldo terug, zodat de teller precies weet waar hij heen
 * telt en niet zelf hoeft te raden.
 */
export async function beloonGoedAntwoord(
  bron: string,
): Promise<{ ok: true; saldo: number }> {
  const kind = await vereisKind();

  beloonGoedeAntwoorden(kind.id, [bron]);

  /*
    Bewust géén revalidatePath hier. Dat zou het hele startscherm opnieuw
    laten opbouwen midden in een oefenronde, en de teller staat toch al goed
    doordat we het nieuwe saldo teruggeven. Aan het eind van de ronde doet
    `bewaarRonde` de revalidatie wel.
  */
  return { ok: true, saldo: haalSleutels(kind.id).saldo };
}

export async function bewaarRonde(antwoorden: RondeAntwoord[]): Promise<{ ok: true }> {
  const kind = await vereisKind();

  bewaarAntwoorden(antwoorden.map((a) => ({ ...a, kindId: kind.id })));

  // Wat de ouder had klaargezet en nu geoefend is, hoeft niet nog eens.
  for (const leerdoelId of new Set(antwoorden.map((a) => a.leerdoelId))) {
    markeerKlaargezetGedaan(kind.id, leerdoelId);
  }

  revalidatePath("/start");
  revalidatePath("/oefenen", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/ouder", "layout");
  return { ok: true };
}

/** Het kind wijst zelf een vaardigheid aan die het lastig vond. */
export async function meldLastig(leerdoelId: string): Promise<{ ok: true }> {
  const kind = await vereisKind();

  meldZelfLastig(kind.id, leerdoelId);

  revalidatePath("/start");
  revalidatePath("/ouder", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// De halve sessie: waar het kind gebleven is
// ---------------------------------------------------------------------------

/**
 * Hoeveel een halve sessie hoogstens mag bevatten.
 *
 * Een serieuze grens, want dit is een openbaar eindpunt. Zonder zo'n grens kon
 * iemand deze tabel als vrije opslag gebruiken door er duizenden id's in te
 * duwen. Een oefensessie is er in de praktijk hooguit een stuk of dertig.
 */
const MAX_VRAGEN = 200;

/**
 * Controleert of dit een echt oefenpad is.
 *
 * Het pad komt uit de browser en bepaalt onder welke regel de voortgang komt.
 * Zonder deze controle kon er onder een willekeurige naam geschreven worden.
 *
 * Er mag precies één ding achter het vraagteken staan: het leerdoel. Dat hoort
 * erbij, want onder één onderwerp hangen meerdere leerdoelen en die moeten elk
 * hun eigen halve sessie houden. Verder wordt er niets toegelaten, zodat er
 * geen willekeurige reeksen in de tabel kunnen belanden.
 */
const OEFENPAD = /^\/oefenen\/[a-z0-9\-/]+\/oefening(\?leerdoel=[A-Za-z0-9-]{1,64})?$/;

function geldigPad(pad: unknown): pad is string {
  return typeof pad === "string" && pad.length <= 200 && OEFENPAD.test(pad);
}

function geldigeSessie(sessie: Oefensessie): boolean {
  return (
    typeof sessie.rondeId === "string" &&
    sessie.rondeId.length <= 64 &&
    Array.isArray(sessie.vraagIds) &&
    sessie.vraagIds.length > 0 &&
    sessie.vraagIds.length <= MAX_VRAGEN &&
    sessie.vraagIds.every((id) => typeof id === "string" && id.length <= 64) &&
    Array.isArray(sessie.antwoorden) &&
    sessie.antwoorden.length <= MAX_VRAGEN
  );
}

/**
 * Eén antwoord wegschrijven, meteen — niet pas aan het eind van de ronde.
 *
 * Twee dingen tegelijk, want ze horen bij elkaar:
 *
 *   1. het antwoord gaat naar `antwoorden`, zodat de ouder het ziet en de
 *      beheersing meetelt, ook als het kind halverwege stopt. Vroeger ging dat
 *      pas bij vraag 15; wie bij vraag 7 ophield, liet geen spoor na;
 *   2. de stand van de ronde gaat naar `oefensessies`, zodat elk ander apparaat
 *      bij dezelfde vraag verdergaat met dezelfde gekleurde bolletjes.
 *
 * Bij wie het hoort, bepaalt de SERVER via `vereisKind()` — nooit de browser.
 */
export async function bewaarAntwoord(
  pad: string,
  sessie: Oefensessie,
  nieuw: RondeAntwoord,
): Promise<{ ok: true }> {
  const kind = await vereisKind();
  if (!geldigPad(pad) || !geldigeSessie(sessie)) return { ok: true };

  bewaarAntwoorden([{ ...nieuw, kindId: kind.id }]);
  bewaarOefensessie(kind.id, pad, sessie);

  /*
    Bewust geen revalidatePath: dat zou het startscherm midden in een ronde
    opnieuw opbouwen. Aan het eind doet `rondAf` dat wel.
  */
  return { ok: true };
}

/**
 * De ronde is uit.
 *
 * `nietBewaard` zijn de antwoorden die tijdens het oefenen niet zijn
 * aangekomen — geen verbinding, tabblad dicht. Die gaan hier alsnog mee. Zijn
 * ze er niet, dan staat alles al in de database en hoeft er niets meer bij.
 *
 * De halve sessie gaat weg: de serie is af, dus een volgende keer hoort er een
 * nieuwe te beginnen in plaats van deze te herhalen.
 */
export async function rondAf(
  pad: string,
  leerdoelIds: string[],
  nietBewaard: RondeAntwoord[],
): Promise<{ ok: true }> {
  const kind = await vereisKind();

  if (nietBewaard.length > 0) {
    bewaarAntwoorden(nietBewaard.slice(0, MAX_VRAGEN).map((a) => ({ ...a, kindId: kind.id })));
  }

  // Wat de ouder had klaargezet en nu geoefend is, hoeft niet nog eens.
  for (const leerdoelId of new Set(leerdoelIds)) {
    markeerKlaargezetGedaan(kind.id, leerdoelId);
  }

  if (geldigPad(pad)) wisOefensessie(kind.id, pad);

  revalidatePath("/start");
  revalidatePath("/oefenen", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/ouder", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Voorkeuren van het kind
// ---------------------------------------------------------------------------

/**
 * Het geluid aan of uit zetten, voor dit kind op al zijn apparaten.
 *
 * `sleutel` wordt gecontroleerd tegen de vaste lijst in `kindinstellingen.ts`.
 * Een serveractie is een openbaar eindpunt; zonder die controle kon er een
 * willekeurige sleutel en waarde in de tabel gezet worden.
 */
export async function zetGeluidsvoorkeur(
  sleutel: string,
  aan: boolean,
): Promise<{ ok: true }> {
  const kind = await vereisKind();
  if (!isKindInstelling(sleutel)) return { ok: true };

  zetKindInstelling(kind.id, sleutel, aan ? "aan" : "uit");
  return { ok: true };
}
