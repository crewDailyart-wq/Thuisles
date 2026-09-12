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
