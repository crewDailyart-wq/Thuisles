/**
 * Nakijken van een antwoord.
 *
 * Eén functie voor alle vraagvormen, zodat er maar één plek is waar bepaald
 * wordt wat goed is.
 *
 * Let op: dit draait nu in de browser, zodat het kind meteen antwoord krijgt
 * zonder wachten. Voor oefenen is dat prima. Zodra een antwoord meetelt voor
 * de voortgang of voor beloningen, moet het nakijken naar de server — dan is
 * alleen deze functie verhuizen genoeg.
 */

import type { OefenVraag } from "@/lib/vraagtypes";

/**
 * Maakt getypte antwoorden vergelijkbaar: hoofdletters, extra spaties, een
 * punt aan het eind en een komma in een kommagetal mogen het verschil niet
 * maken.
 */
function normaliseer(tekst: string): string {
  return tekst
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .replace(/(\d),(\d)/g, "$1.$2");
}

export function isGoed(vraag: OefenVraag, gegeven: string): boolean {
  if (gegeven.trim() === "") return false;

  if (vraag.vorm === "meerkeuze") {
    return gegeven === vraag.antwoord;
  }

  if (vraag.vorm === "waar_niet_waar") {
    return gegeven === vraag.antwoord;
  }

  /*
    Getallen slepen: één getal per afbeelding, met komma's ertussen en in de
    volgorde van de afbeeldingen. Alles moet kloppen — twee verwisselde getallen
    is dus fout, ook al staan de goede getallen er wel.
  */
  if (vraag.vorm === "sleepgetallen") {
    return gegeven.split(",").join(",") === vraag.antwoord.split(",").join(",");
  }

  /*
    Stapstenen: één getal per lege steen, van links naar rechts. Alles moet
    kloppen, ook de volgorde — twee goede getallen op de verkeerde steen is een
    fout die dit type juist zichtbaar maakt.
  */
  if (vraag.vorm === "stapstenen") {
    const ingevuld = gegeven.split(",").map((w) => w.trim());
    const juist = vraag.antwoord.split(",").map((w) => w.trim());
    return ingevuld.length === juist.length && ingevuld.every((w, i) => w === juist[i]);
  }

  // Open vraag: elk van de opgegeven schrijfwijzen mag.
  const toegestaan = vraag.antwoord.split("|").map(normaliseer).filter(Boolean);
  return toegestaan.includes(normaliseer(gegeven));
}

/** Het goede antwoord in gewone taal, om te tonen na twee mislukte pogingen. */
export function goedeAntwoordInTekst(vraag: OefenVraag): string {
  if (vraag.vorm === "meerkeuze") {
    const optie = vraag.opties?.[Number(vraag.antwoord)];
    return optie ? optie.tekst || optie.afbeelding || "" : "";
  }
  if (vraag.vorm === "waar_niet_waar") {
    return vraag.antwoord === "waar" ? "Waar" : "Niet waar";
  }
  if (vraag.vorm === "sleepgetallen" || vraag.vorm === "stapstenen") {
    return vraag.antwoord.split(",").join(" · ");
  }
  return vraag.antwoord.split("|")[0] ?? "";
}

// ---------------------------------------------------------------------------
// Hoe breed moet een antwoordvak zijn?
// ---------------------------------------------------------------------------

/**
 * Het aantal cijfers van het langste antwoord, of `null` als het geen kort
 * getal is.
 *
 * Waar dit voor dient: een vak van schermbreedte voor een antwoord als "7"
 * klopt niet. Het suggereert dat er een zin verwacht wordt, terwijl er één
 * cijfer in moet. Een klein vierkant vakje zegt vanzelf hoeveel er van je
 * gevraagd wordt — dat scheelt een kind een aarzeling.
 *
 * Alleen hele getallen tot vier cijfers tellen als "kort". Zodra er iets
 * anders tussen zit — een woord, een kommagetal, een som als "3 + 4" — komt er
 * `null` uit en blijft het brede veld staan. Liever een keer te breed dan een
 * antwoord dat niet past.
 *
 * Werkt op een lijst, zodat hetzelfde geldt voor de schrijfwijzen van een open
 * vraag (`"8|acht"` telt dus niet als kort) en voor de keuzes van een
 * meerkeuzevraag.
 */
export function kortGetalLengte(waarden: string[]): number | null {
  if (waarden.length === 0) return null;

  let langste = 0;
  for (const waarde of waarden) {
    const schoon = waarde.trim();
    if (!/^\d{1,4}$/.test(schoon)) return null;
    langste = Math.max(langste, schoon.length);
  }
  return langste;
}
