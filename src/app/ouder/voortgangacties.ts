"use server";

/**
 * Wat een ouder vanuit het voortgangsdashboard kan doen.
 *
 * Nu is dat één ding: oefeningen klaarzetten voor het kind. Die komen bij het
 * kind terug in "Voor jou", met de reden erbij, zodat het kind snapt waarom
 * het er staat.
 */

import { revalidatePath } from "next/cache";
import { bekekenKind, vereisOuder } from "@/lib/auth/sessie";
import { haalKindVanOuder } from "@/lib/data/kinderen";
import { haalKlaarWeg, zetKlaar } from "@/lib/data/dashboard";

type Uitkomst = { fout: string } | { gelukt: string } | null;

function tekst(gegevens: FormData, naam: string): string {
  const waarde = gegevens.get(naam);
  return typeof waarde === "string" ? waarde.trim() : "";
}

/** Het kind waar dit over gaat — altijd opnieuw gecontroleerd. */
async function kindVanOuder(gegevens: FormData) {
  const ouder = await vereisOuder();
  const kindId = tekst(gegevens, "kindId");
  return kindId
    ? haalKindVanOuder(ouder.id, kindId)
    : await bekekenKind(ouder.id);
}

function ververs() {
  revalidatePath("/ouder", "layout");
  revalidatePath("/start");
}

/**
 * Eén of meer oefeningen klaarzetten.
 *
 * De leerdoelen komen als losse velden mee; wat er wordt klaargezet is dus
 * altijd zichtbaar op het scherm waar de ouder op klikt.
 */
export async function zetOefeningenKlaar(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const kind = await kindVanOuder(gegevens);
  if (!kind) return { fout: "Kies eerst een kind." };

  const leerdoelen = gegevens.getAll("leerdoelId").map(String).filter(Boolean);
  if (leerdoelen.length === 0) {
    return { fout: "Er is niets om klaar te zetten." };
  }

  const reden = tekst(gegevens, "reden") || "Even herhalen";
  for (const leerdoelId of leerdoelen) {
    zetKlaar(kind.id, leerdoelId, reden);
  }

  ververs();
  return {
    gelukt:
      leerdoelen.length === 1
        ? `Klaargezet. ${kind.roepnaam} ziet dit bij "Voor jou".`
        : `${leerdoelen.length} oefeningen klaargezet. ${kind.roepnaam} ziet ze bij "Voor jou".`,
  };
}

/** Een klaargezette oefening weer weghalen. */
export async function haalOefeningWeg(gegevens: FormData): Promise<void> {
  const kind = await kindVanOuder(gegevens);
  if (!kind) return;
  haalKlaarWeg(kind.id, tekst(gegevens, "klaargezetId"));
  ververs();
}
