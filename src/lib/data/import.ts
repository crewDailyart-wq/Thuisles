import "server-only";

/**
 * Bulk-upload: CSV-rijen omzetten naar echte vragen.
 *
 * Uitgangspunt: liever een duidelijke melding dan een halve import. Elke rij
 * wordt apart beoordeeld; goede rijen worden opgeslagen, foute rijen worden
 * overgeslagen met een reden in gewone taal. Er gaat dus nooit stilzwijgend
 * iets mis.
 *
 * De koppeling aan de leerdoelstructuur gebeurt op de leerdoelcode of de
 * exacte titel. Klopt vak, domein of subdomein daar niet mee, dan is dat een
 * fout — geen aanname.
 */

import { leesCsv, type CsvRij } from "@/lib/csv";
import { bewaarVraag, haalLeerdoelen, type NieuweVraag } from "@/lib/data/vragen";
import type { AntwoordOptie, Vraagvorm } from "@/lib/vraagtypes";

/** Letters bij de antwoordopties: optie_a hoort bij het eerste antwoord. */
export const OPTIE_LETTERS = ["a", "b", "c", "d", "e", "f"] as const;

export const CSV_KOLOMMEN = [
  "vak",
  "domein",
  "subdomein",
  "leerdoel",
  "groep",
  "vraagtype",
  "vraagtekst",
  "antwoord",
  "hint",
  "uitleg",
  "afbeelding",
  "uitleg_afbeelding",
  ...OPTIE_LETTERS.map((l) => `optie_${l}_afbeelding` as const),
] as const;

export type RijUitslag = {
  regelnummer: number;
  vraagtekst: string;
  gelukt: boolean;
  fouten: string[];
};

export type ImportUitslag = {
  gelezen: number;
  gelukt: number;
  mislukt: number;
  rijen: RijUitslag[];
  /** Fout in het bestand als geheel, bijv. een ontbrekende kolom. */
  bestandsfout?: string;
};

const VORM_ALIASSEN: Record<string, Vraagvorm> = {
  meerkeuze: "meerkeuze",
  multiplechoice: "meerkeuze",
  keuze: "meerkeuze",
  open: "open",
  invul: "open",
  invulvraag: "open",
  tekst: "open",
  waarnietwaar: "waar_niet_waar",
  "waar/nietwaar": "waar_niet_waar",
  waar_niet_waar: "waar_niet_waar",
  juistonjuist: "waar_niet_waar",
};

function normaliseer(waarde: string): string {
  return waarde.toLowerCase().replace(/[\s._-]/g, "");
}

function leesAntwoord(
  vorm: Vraagvorm,
  ruw: string,
  rij: CsvRij,
): { opties: AntwoordOptie[]; antwoord: string; fout?: string } {
  if (vorm === "meerkeuze") {
    const delen = ruw.split("|").map((d) => d.trim());
    const afbeeldingen = OPTIE_LETTERS.map((l) =>
      (rij[`optie_${l}_afbeelding`] ?? "").trim(),
    );

    // Een optie bestaat zodra er tekst OF een afbeelding is. Zo kun je ook
    // een vraag maken waarbij de antwoorden alleen uit plaatjes bestaan.
    const aantal = Math.max(
      delen.filter(Boolean).length,
      afbeeldingen.filter(Boolean).length,
    );

    const opties: AntwoordOptie[] = Array.from({ length: aantal }, (_, i) => ({
      tekst: (delen[i] ?? "").replace(/^\*/, "").trim(),
      afbeelding: afbeeldingen[i] || null,
    }));

    const goed = delen.findIndex((d) => d.startsWith("*"));
    if (goed === -1) {
      return {
        opties,
        antwoord: "",
        fout: "Zet een sterretje voor het goede antwoord, bijvoorbeeld: 12|*14|16. Bij antwoorden zonder tekst gebruik je alleen een sterretje op die plek, bijvoorbeeld: |*||",
      };
    }
    return { opties, antwoord: String(goed) };
  }

  if (vorm === "waar_niet_waar") {
    const n = normaliseer(ruw);
    if (["waar", "juist", "true", "ja"].includes(n)) {
      return { opties: [], antwoord: "waar" };
    }
    if (["nietwaar", "onjuist", "false", "nee"].includes(n)) {
      return { opties: [], antwoord: "niet_waar" };
    }
    return { opties: [], antwoord: "", fout: 'Vul "waar" of "niet waar" in.' };
  }

  return { opties: [], antwoord: ruw.split("|").map((a) => a.trim()).filter(Boolean).join("|") };
}

function beoordeelRij(rij: CsvRij, regelnummer: number): RijUitslag & { vraag?: NieuweVraag } {
  const fouten: string[] = [];
  const vraagtekst = rij.vraagtekst ?? "";

  // 1. Vraagtype
  const vorm = VORM_ALIASSEN[normaliseer(rij.vraagtype ?? "")];
  if (!vorm) {
    fouten.push(
      `Onbekend vraagtype "${rij.vraagtype ?? ""}". Gebruik: meerkeuze, open of waar/niet waar.`,
    );
  }

  // 2. Leerdoel opzoeken op code of exacte titel
  const zoek = normaliseer(rij.leerdoel ?? "");
  const leerdoelen = haalLeerdoelen();
  const leerdoel = leerdoelen.find(
    (l) => normaliseer(l.code) === zoek || normaliseer(l.titel) === zoek,
  );

  if (!zoek) {
    fouten.push("Het leerdoel ontbreekt.");
  } else if (!leerdoel) {
    fouten.push(`Leerdoel "${rij.leerdoel}" bestaat niet. Gebruik de code of de exacte titel.`);
  } else {
    // 3. Klopt de rest van de keten met dat leerdoel?
    if (rij.vak && normaliseer(rij.vak) !== normaliseer(leerdoel.vakNaam)) {
      fouten.push(`Vak "${rij.vak}" hoort niet bij dit leerdoel (dat is ${leerdoel.vakNaam}).`);
    }
    if (rij.domein && normaliseer(rij.domein) !== normaliseer(leerdoel.domeinNaam)) {
      fouten.push(`Domein "${rij.domein}" hoort niet bij dit leerdoel (dat is ${leerdoel.domeinNaam}).`);
    }
    if (rij.subdomein && normaliseer(rij.subdomein) !== normaliseer(leerdoel.subdomeinNaam)) {
      fouten.push(
        `Subdomein "${rij.subdomein}" hoort niet bij dit leerdoel (dat is ${leerdoel.subdomeinNaam}).`,
      );
    }
  }

  // 4. Groep
  const groep = Number(String(rij.groep ?? "").replace(/\D/g, ""));
  if (!groep) fouten.push("De groep ontbreekt of is geen getal.");

  // 5. Antwoord
  let opties: AntwoordOptie[] = [];
  let antwoord = "";
  if (vorm) {
    const gelezen = leesAntwoord(vorm, rij.antwoord ?? "", rij);
    opties = gelezen.opties;
    antwoord = gelezen.antwoord;
    if (gelezen.fout) fouten.push(gelezen.fout);
  }

  if (fouten.length || !vorm || !leerdoel) {
    return { regelnummer, vraagtekst, gelukt: false, fouten };
  }

  return {
    regelnummer,
    vraagtekst,
    gelukt: true,
    fouten: [],
    vraag: {
      leerdoelId: leerdoel.id,
      groep,
      vorm,
      vraagtekst,
      opties,
      antwoord,
      hint: rij.hint,
      uitleg: rij.uitleg,
      afbeelding: rij.afbeelding,
      uitlegAfbeelding: rij.uitleg_afbeelding,
      status: "concept",
    },
  };
}

export function importeerCsv(tekst: string): ImportUitslag {
  const { kolommen, rijen } = leesCsv(tekst);

  if (rijen.length === 0) {
    return { gelezen: 0, gelukt: 0, mislukt: 0, rijen: [], bestandsfout: "Het bestand bevat geen rijen." };
  }

  const verplicht = ["leerdoel", "groep", "vraagtype", "vraagtekst", "antwoord"];
  const ontbreekt = verplicht.filter((k) => !kolommen.includes(k));
  if (ontbreekt.length) {
    return {
      gelezen: rijen.length,
      gelukt: 0,
      mislukt: rijen.length,
      rijen: [],
      bestandsfout: `Deze kolommen ontbreken in het bestand: ${ontbreekt.join(", ")}. Gebruik het voorbeeldbestand.`,
    };
  }

  const uitslagen: RijUitslag[] = [];

  rijen.forEach((rij, i) => {
    // +2: regel 1 is de kopregel, en mensen tellen vanaf 1.
    const beoordeeld = beoordeelRij(rij, i + 2);

    const { vraag, ...uitslag } = beoordeeld;

    if (uitslag.gelukt && vraag) {
      const bewaard = bewaarVraag(vraag);
      if (bewaard.ok) {
        uitslagen.push(uitslag);
        return;
      }
      uitslagen.push({ ...uitslag, gelukt: false, fouten: bewaard.fouten });
      return;
    }

    uitslagen.push(uitslag);
  });

  return {
    gelezen: rijen.length,
    gelukt: uitslagen.filter((r) => r.gelukt).length,
    mislukt: uitslagen.filter((r) => !r.gelukt).length,
    rijen: uitslagen,
  };
}
