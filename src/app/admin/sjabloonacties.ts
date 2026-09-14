"use server";

/**
 * Serveracties voor sjablonen: opslaan, genereren, publiceren, verwijderen.
 */

import { revalidatePath } from "next/cache";
import {
  bewaarSjabloon,
  genereerUitSjabloon,
  publiceerSjabloon,
  verwijderSjabloon,
  werkVraagtekstenBij,
  wijzigSjabloon,
  type GenereerUitslag,
} from "@/lib/data/sjablonen";
import type { Instellingen } from "@/lib/generatoren/soort";

export type Antwoord<T> = { ok: true; waarde: T } | { ok: false; fout: string };

function ververs() {
  revalidatePath("/admin", "layout");
  revalidatePath("/oefenen", "layout");
}

function leesInstellingen(data: FormData): Instellingen {
  try {
    return JSON.parse(String(data.get("instellingen") ?? "{}")) as Instellingen;
  } catch {
    return {};
  }
}

export async function nieuwSjabloon(data: FormData): Promise<Antwoord<string>> {
  /*
    Leeg = niet aanraken, anders dan bij `bewerkSjabloon` waar leeg "volg de
    algemene standaard" betekent. Zie `bewaarSjabloon` voor waarom: bij een
    bestaand leerdoel zou leeg anders een al ingestelde waarde wissen.
  */
  const perSessie = String(data.get("vragenPerSessie") ?? "").trim();

  const uitslag = bewaarSjabloon({
    leerdoelId: String(data.get("leerdoelId") ?? ""),
    naam: String(data.get("naam") ?? ""),
    soort: String(data.get("soort") ?? ""),
    instellingen: leesInstellingen(data),
    hint: String(data.get("hint") ?? ""),
    groep: Number(data.get("groep") ?? NaN),
    vragenPerSessie: perSessie === "" ? undefined : Number(perSessie),
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function bewerkSjabloon(data: FormData): Promise<Antwoord<true>> {
  /*
    Leeg laten betekent: dit leerdoel volgt de algemene standaard. Daarom
    onderscheiden we "leeg" van "een getal".
  */
  const perSessie = String(data.get("vragenPerSessie") ?? "").trim();

  const uitslag = wijzigSjabloon(String(data.get("id") ?? ""), {
    naam: String(data.get("naam") ?? ""),
    instellingen: leesInstellingen(data),
    hint: String(data.get("hint") ?? ""),
    vragenPerSessie: perSessie === "" ? null : Number(perSessie),
  });
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function genereer(data: FormData): Promise<Antwoord<GenereerUitslag>> {
  const uitslag = genereerUitSjabloon(
    String(data.get("id") ?? ""),
    Number(data.get("aantal") ?? 20),
  );
  if (uitslag.ok) ververs();
  return uitslag;
}

export async function publiceerAlles(data: FormData): Promise<Antwoord<number>> {
  const uitslag = publiceerSjabloon(String(data.get("id") ?? ""));
  ververs();
  return uitslag;
}

export async function wegSjabloon(data: FormData): Promise<Antwoord<number>> {
  const uitslag = verwijderSjabloon(String(data.get("id") ?? ""));
  ververs();
  return uitslag;
}

/**
 * De vraagtekst van de al bestaande sommen van dit sjabloon bijwerken.
 *
 * Losse handeling, want het opslaan van de instellingen raakt bewust alleen
 * nieuwe sommen: onder de bestaande kunnen gepubliceerde vragen zitten die
 * kinderen al hebben gezien.
 */
export async function werkTekstenBij(data: FormData): Promise<Antwoord<number>> {
  const uitslag = werkVraagtekstenBij(String(data.get("id") ?? ""));
  if (uitslag.ok) ververs();
  return uitslag;
}
