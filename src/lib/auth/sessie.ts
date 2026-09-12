import "server-only";

/**
 * Wie is de ouder, en over welk kind gaat dit scherm?
 *
 * ===========================================================================
 * TIJDELIJK: GEEN INLOG. ALLES STAAT OPEN.
 *
 * Zolang Thuisles niet online staat, is er geen inlogscherm en geen wachtwoord.
 * Iedereen die de app opent, is meteen de ouder. Dat scheelt gedoe tijdens het
 * bouwen en testen.
 *
 * Dit is GEEN beveiliging. Wie bij de app kan, kan bij alle gegevens.
 *
 * De structuur eronder is er wel al op gebouwd: kinderen hangen aan een
 * ouderaccount, en elke opzoeking loopt via `ouder.id`. Er is nu één zo'n
 * account, dat vanzelf wordt aangemaakt. Zodra er echt ingelogd wordt, komen er
 * meer ouders bij en verandert er verder niets aan de rest van de app.
 *
 * Wat er terug moet vóór livegang:
 *
 *   1. Supabase Auth aansluiten (de goedgekeurde keuze). Die neemt
 *      e-mailadres, wachtwoord en wachtwoordherstel over.
 *   2. `huidigeOuder` hieronder haalt de ouder dan uit de sessie van Supabase
 *      in plaats van "de enige die er is". Dat is het enige wat er hoeft te
 *      veranderen — alles wat deze functies gebruikt, blijft werken.
 *   3. Schermen om te registreren en in te loggen terugzetten.
 *   4. De beheeromgeving (/admin) moet er óók achter.
 * ===========================================================================
 */

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { haalOfMaakOuder } from "@/lib/data/ouders";
import { haalKinderen, haalKindVanOuder } from "@/lib/data/kinderen";
import type { Kind, Ouder } from "@/lib/types";

/** Welk kindprofiel er op dit apparaat aan het oefenen is. */
const KIND_COOKIE = "thuisles_kind";
/** Welk kind de OUDER in zijn eigen omgeving bekijkt. Los van wie er oefent. */
const BEKEKEN_COOKIE = "thuisles_bekeken_kind";

const DAGEN_GELDIG = 365;

/** Op localhost is er geen https; `secure` zou het koekje dan blokkeren. */
const VEILIG = process.env.NODE_ENV === "production";

function koekjesinstellingen() {
  return {
    httpOnly: true,
    secure: VEILIG,
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(Date.now() + DAGEN_GELDIG * 24 * 60 * 60 * 1000),
  };
}

// ---------------------------------------------------------------------------
// De ouder
// ---------------------------------------------------------------------------

/**
 * De ouder. Zolang er geen inlog is, is dat er precies één, en die wordt bij
 * de eerste keer openen vanzelf aangemaakt.
 *
 * `cache` zorgt dat dit binnen één paginaweergave maar één keer gebeurt.
 */
export const huidigeOuder = cache(async (): Promise<Ouder> => {
  return haalOfMaakOuder();
});

/**
 * Hetzelfde als `huidigeOuder`.
 *
 * Bestaat apart zodat straks, wanneer er wél wordt ingelogd, alleen deze
 * functie hoeft door te sturen naar het inlogscherm. Alles wat hem nu al
 * gebruikt — schermen én serveracties — hoeft dan niet aangepast te worden.
 */
export async function vereisOuder(): Promise<Ouder> {
  return huidigeOuder();
}

// ---------------------------------------------------------------------------
// Welk kind is aan het oefenen?
// ---------------------------------------------------------------------------

/**
 * Het kindprofiel dat op dit apparaat actief is.
 *
 * Staat er niets in het koekje en is er precies één kind zónder kindcode, dan
 * is dat kind het antwoord: er valt niets te kiezen, dus vragen we niets.
 *
 * Twee gevallen waarin er wél eerst gekozen moet worden:
 *   - er zijn meerdere kinderen. Anders zouden de antwoorden bij het verkeerde
 *     kind terechtkomen;
 *   - het kind heeft een kindcode. Die heeft de ouder zelf ingesteld, en die
 *     mogen we niet stilzwijgend overslaan.
 */
export const huidigKind = cache(async (): Promise<Kind | null> => {
  const ouder = await huidigeOuder();
  const kindId = (await cookies()).get(KIND_COOKIE)?.value;

  if (kindId) {
    const gekozen = haalKindVanOuder(ouder.id, kindId);
    if (gekozen) return gekozen;
  }

  const kinderen = haalKinderen(ouder.id);
  if (kinderen.length === 1 && !kinderen[0].heeftKindcode) return kinderen[0];
  return null;
});

/**
 * Het actieve kind, met doorsturen als dat er niet is.
 *
 * Geen kinderen: naar Instellingen, want daar maak je er een aan. Meerdere
 * kinderen en nog geen keuze: naar het keuzescherm.
 */
export async function vereisKind(): Promise<Kind> {
  const kind = await huidigKind();
  if (kind) return kind;

  const ouder = await huidigeOuder();
  redirect(haalKinderen(ouder.id).length === 0 ? "/ouder/instellingen" : "/kies");
}

/** Zet het actieve kindprofiel. Alleen na controle van de kindcode. */
export async function kiesKind(kindId: string): Promise<void> {
  (await cookies()).set(KIND_COOKIE, kindId, koekjesinstellingen());
}

/** Het kind verlaat zijn profiel en gaat terug naar de ouderomgeving. */
export async function verlaatKind(): Promise<void> {
  (await cookies()).delete(KIND_COOKIE);
}

// ---------------------------------------------------------------------------
// Welk kind bekijkt de ouder?
// ---------------------------------------------------------------------------

/**
 * Het kind waar de ouderomgeving nu over gaat.
 *
 * Bewust iets anders dan `huidigKind`: op de kinderkant bepaalt het koekje wie
 * er oefent, in de ouderomgeving kiest de ouder zelf welk kind hij bekijkt.
 * Die keuze staat in een eigen koekje, zodat hij blijft staan terwijl de ouder
 * tussen Overzicht, Voortgang en School wisselt.
 *
 * Het koekje wordt nooit op zijn woord geloofd: hoort het kind niet bij deze
 * ouder, dan valt de keuze terug op het eerste eigen kind.
 */
export const bekekenKind = cache(async (ouderId: string): Promise<Kind | null> => {
  const gevraagdId = (await cookies()).get(BEKEKEN_COOKIE)?.value;
  if (gevraagdId) {
    const gevraagd = haalKindVanOuder(ouderId, gevraagdId);
    if (gevraagd) return gevraagd;
  }
  return haalKinderen(ouderId)[0] ?? null;
});

/** De ouder kiest welk kind hij bekijkt. Zegt niets over wie er mag oefenen. */
export async function bekijkKind(ouderId: string, kindId: string): Promise<void> {
  if (!haalKindVanOuder(ouderId, kindId)) return;
  (await cookies()).set(BEKEKEN_COOKIE, kindId, koekjesinstellingen());
}

/** Alle keuzes op dit apparaat vergeten. Gebruikt na het wissen van gegevens. */
export async function vergeetKeuzes(): Promise<void> {
  const koekjes = await cookies();
  koekjes.delete(KIND_COOKIE);
  koekjes.delete(BEKEKEN_COOKIE);
}
