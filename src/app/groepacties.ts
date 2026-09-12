"use server";

/**
 * De groep van het actieve kind wisselen vanaf de kinderkant.
 *
 * Dit is GEEN aparte testmodus en geen tijdelijke weergavelaag. Het schrijft
 * naar precies dezelfde kolom als het formulier in de ouderomgeving
 * (`wijzigKind`), dus de wijziging is blijvend en overal zichtbaar: op de
 * kinderkant, in het ouderdashboard en in de voortgang.
 *
 * Wélk kind er verandert, bepaalt de SERVER — nooit de browser. Een
 * serveractie is een openbaar eindpunt; kwam het kind-id uit het scherm, dan
 * kon iemand de groep van een willekeurig profiel omzetten.
 */

import { revalidatePath } from "next/cache";
import { vereisKind, vereisOuder } from "@/lib/auth/sessie";
import { controleerKind, wijzigKind } from "@/lib/data/kinderen";

export async function wisselGroep(groep: number): Promise<{ ok: boolean }> {
  const ouder = await vereisOuder();
  const kind = await vereisKind();

  /*
    Naam en avatar gaan onveranderd mee: `wijzigKind` schrijft het profiel in
    één keer weg. De kindcode blijft weg uit de invoer, en blijft daardoor
    staan zoals hij was.
  */
  const invoer = { roepnaam: kind.roepnaam, groep, avatar: kind.avatar };

  // Dezelfde controle als in de ouderomgeving: groep 3 tot en met 8.
  if (controleerKind(invoer) !== null) return { ok: false };

  const gelukt = wijzigKind(ouder.id, kind.id, invoer);
  if (!gelukt) return { ok: false };

  /*
    Alles wat van de groep afhangt opnieuw ophalen: welke leerdoelen een kind
    ziet, de aanbeveling, de voortgang en de schermen van de ouder.
  */
  revalidatePath("/start");
  revalidatePath("/oefenen", "layout");
  revalidatePath("/wereld");
  revalidatePath("/voortgang");
  revalidatePath("/kies");
  revalidatePath("/ouder", "layout");

  return { ok: true };
}
