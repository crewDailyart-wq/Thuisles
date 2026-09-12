"use server";

/**
 * Serveracties van de beheeromgeving.
 *
 * Deze functies draaien op de server en schrijven rechtstreeks in de database.
 * Ze doen zelf geen controles: die staan in `controleerVraag`, zodat het
 * losse formulier en de bulk-upload gegarandeerd dezelfde regels volgen.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  bewaarUpload,
  verwijderAfbeelding,
  type UploadUitslag,
} from "@/lib/data/afbeeldingen";
import { importeerCsv, type ImportUitslag } from "@/lib/data/import";
import { xlsxAlsCsv } from "@/lib/xlsx";
import { bewaarVraag, verwijderVraag, wisselStatus } from "@/lib/data/vragen";
import { VRAAGVORMEN, type Vraagvorm } from "@/lib/vraagtypes";

export type FormulierUitslag = { fouten: string[] } | null;

export async function voegVraagToe(
  _vorige: FormulierUitslag,
  data: FormData,
): Promise<FormulierUitslag> {
  const vorm = String(data.get("vorm") ?? "") as Vraagvorm;
  if (!VRAAGVORMEN.includes(vorm)) return { fouten: ["Kies eerst een vraagtype."] };

  // Meerkeuze: per optie een tekstveld en een veld voor de afbeeldingsnaam.
  // Een optie telt mee zodra één van de twee is ingevuld.
  const opties = [0, 1, 2, 3, 4, 5]
    .map((i) => ({
      tekst: String(data.get(`optie-${i}`) ?? "").trim(),
      afbeelding: String(data.get(`optie-afbeelding-${i}`) ?? "").trim() || null,
    }))
    .filter((o) => o.tekst !== "" || o.afbeelding !== null);

  const uitslag = bewaarVraag({
    leerdoelId: String(data.get("leerdoelId") ?? ""),
    groep: Number(data.get("groep") ?? NaN),
    vorm,
    vraagtekst: String(data.get("vraagtekst") ?? ""),
    opties,
    antwoord: String(data.get("antwoord") ?? ""),
    hint: String(data.get("hint") ?? ""),
    afbeelding: String(data.get("afbeelding") ?? ""),
    uitleg: String(data.get("uitleg") ?? ""),
    uitlegAfbeelding: String(data.get("uitlegAfbeelding") ?? ""),
    status: data.get("status") === "gepubliceerd" ? "gepubliceerd" : "concept",
  });

  if (!uitslag.ok) return { fouten: uitslag.fouten };

  revalidatePath("/admin/vragen");
  redirect("/admin/vragen?toegevoegd=1");
}

export async function verwijder(data: FormData): Promise<void> {
  verwijderVraag(String(data.get("id") ?? ""));
  revalidatePath("/admin/vragen");
}

export async function wisselPublicatie(data: FormData): Promise<void> {
  wisselStatus(String(data.get("id") ?? ""));
  revalidatePath("/admin/vragen");
}

/**
 * Verwerkt een geüpload vragenbestand.
 *
 * CSV wordt als tekst gelezen; een Excel-bestand wordt eerst omgezet naar
 * dezelfde vorm. Daarna loopt alles door precies dezelfde controle, zodat een
 * Excel-bestand nooit anders wordt behandeld dan een CSV.
 */
export async function importeerBestand(data: FormData): Promise<ImportUitslag> {
  const bestand = data.get("bestand");
  if (!(bestand instanceof File)) {
    return { gelezen: 0, gelukt: 0, mislukt: 0, rijen: [], bestandsfout: "Er is geen bestand meegestuurd." };
  }

  const isExcel = /\.xlsx$/i.test(bestand.name);

  let tekst: string;
  if (isExcel) {
    try {
      tekst = xlsxAlsCsv(new Uint8Array(await bestand.arrayBuffer()));
    } catch {
      return {
        gelezen: 0, gelukt: 0, mislukt: 0, rijen: [],
        bestandsfout: "Dit Excel-bestand kon niet worden gelezen. Sla het opnieuw op als .xlsx of als CSV.",
      };
    }
  } else {
    tekst = await bestand.text();
  }

  const uitslag = importeerCsv(tekst);
  revalidatePath("/admin", "layout");
  return uitslag;
}

// ---------------------------------------------------------------------------
// Afbeeldingen
// ---------------------------------------------------------------------------

/**
 * Eén afbeelding opslaan. Wordt gebruikt door de losse uploadknop bij een
 * vraag of antwoord én door het bulkscherm — dat stuurt de bestanden één voor
 * één, zodat je per bestand ziet of het gelukt is.
 */
export async function uploadAfbeelding(data: FormData): Promise<UploadUitslag> {
  const bestand = data.get("bestand");
  if (!(bestand instanceof File)) {
    return { ok: false, fout: "Er is geen bestand meegestuurd." };
  }

  const uitslag = await bewaarUpload(bestand);
  if (uitslag.ok) {
    revalidatePath("/admin/afbeeldingen");
    revalidatePath("/admin/vragen/nieuw");
  }
  return uitslag;
}

export async function verwijderAfbeeldingActie(data: FormData): Promise<void> {
  verwijderAfbeelding(String(data.get("naam") ?? ""));
  revalidatePath("/admin/afbeeldingen");
  revalidatePath("/admin/vragen/nieuw");
}
