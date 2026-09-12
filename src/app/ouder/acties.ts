"use server";

/**
 * Wat een ouder kan wijzigen.
 *
 * Elke actie begint met `vereisOuder()`. Serveracties zijn openbaar
 * bereikbaar, dus wie er aan de knoppen zit wordt hier opnieuw vastgesteld —
 * nooit op basis van wat de browser meestuurt. En elke wijziging aan een kind
 * gaat via `ouder.id`, zodat een ouder alleen bij de eigen kinderen kan.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bekijkKind, vereisOuder, vergeetKeuzes } from "@/lib/auth/sessie";
import {
  controleerKind,
  maakKind,
  verwijderKind,
  wijzigKind,
} from "@/lib/data/kinderen";
import {
  verwijderOuder,
  wijzigEmail,
  wijzigTaal,
  wijzigWeergavenaam,
} from "@/lib/data/ouders";
import type { Taal } from "@/lib/types";

type Uitkomst = { fout: string } | { gelukt: string } | null;

function tekst(gegevens: FormData, naam: string): string {
  const waarde = gegevens.get(naam);
  return typeof waarde === "string" ? waarde.trim() : "";
}

/** Alle schermen van de ouder gaan over hetzelfde kind; ververs ze samen. */
function ververs() {
  revalidatePath("/ouder", "layout");
  revalidatePath("/kies");
  revalidatePath("/start");
}

// ---------------------------------------------------------------------------
// Welk kind bekijkt de ouder?
// ---------------------------------------------------------------------------

/**
 * De kind-wisselaar bovenaan. Zet alleen wie de ouder BEKIJKT; het zegt niets
 * over wie er mag oefenen — daar gaat de profielkeuze over.
 */
export async function bekijkAnderKind(gegevens: FormData): Promise<void> {
  const ouder = await vereisOuder();
  await bekijkKind(ouder.id, tekst(gegevens, "kindId"));
  revalidatePath("/ouder", "layout");
}

// ---------------------------------------------------------------------------
// Kinderen
// ---------------------------------------------------------------------------

export async function voegKindToe(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const ouder = await vereisOuder();

  const invoer = {
    roepnaam: tekst(gegevens, "roepnaam"),
    groep: Number(gegevens.get("groep")),
    avatar: tekst(gegevens, "avatar"),
    kindcode: tekst(gegevens, "kindcode"),
  };

  const fout = controleerKind(invoer);
  if (fout) return { fout };

  maakKind(ouder.id, invoer);
  ververs();
  return { gelukt: `${invoer.roepnaam} is toegevoegd.` };
}

export async function wijzigKindprofiel(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const ouder = await vereisOuder();
  const kindId = tekst(gegevens, "kindId");

  /*
    Het codeveld kent drie betekenissen. Leeg laten verandert niets; een lege
    code instellen doe je met het vinkje "code weghalen".
  */
  const codeVeld = tekst(gegevens, "kindcode");
  const weghalen = gegevens.get("kindcodeWeg") === "ja";

  const invoer = {
    roepnaam: tekst(gegevens, "roepnaam"),
    groep: Number(gegevens.get("groep")),
    avatar: tekst(gegevens, "avatar"),
    kindcode: weghalen ? "" : codeVeld || undefined,
  };

  const fout = controleerKind(invoer);
  if (fout) return { fout };

  if (!wijzigKind(ouder.id, kindId, invoer)) {
    return { fout: "Dat profiel bestaat niet." };
  }

  ververs();
  return { gelukt: "Opgeslagen." };
}

export async function verwijderKindprofiel(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const ouder = await vereisOuder();
  const kindId = tekst(gegevens, "kindId");
  const roepnaam = tekst(gegevens, "bevestiging");
  const verwacht = tekst(gegevens, "roepnaam");

  // Verwijderen is onomkeerbaar; daarom eerst de naam overtypen.
  if (roepnaam.toLowerCase() !== verwacht.toLowerCase()) {
    return { fout: `Typ ${verwacht} over om te bevestigen.` };
  }

  if (!verwijderKind(ouder.id, kindId)) {
    return { fout: "Dat profiel bestaat niet." };
  }

  ververs();
  return { gelukt: "Het profiel en alle gegevens zijn verwijderd." };
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export async function wijzigInstellingen(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const ouder = await vereisOuder();

  wijzigWeergavenaam(ouder.id, tekst(gegevens, "weergavenaam"));
  wijzigEmail(ouder.id, tekst(gegevens, "email"));
  wijzigTaal(ouder.id, tekst(gegevens, "taal") as Taal);

  ververs();
  return { gelukt: "Opgeslagen." };
}

/**
 * Alles weg: de ouder, alle kindprofielen, alle antwoorden.
 *
 * Zolang er geen inlog is, wordt er meteen een leeg account teruggemaakt bij
 * de volgende paginaweergave. Wat verdwijnt zijn de gegevens, en dat is precies
 * de bedoeling.
 */
export async function verwijderJeAccount(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const ouder = await vereisOuder();

  if (tekst(gegevens, "bevestiging").toLowerCase() !== "verwijderen") {
    return { fout: "Typ het woord verwijderen over om te bevestigen." };
  }

  verwijderOuder(ouder.id);
  await vergeetKeuzes();
  redirect("/ouder/instellingen");
}
