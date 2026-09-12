import "server-only";

/**
 * Uit een pagina of schoolgids halen wat we nodig hebben.
 *
 * We bewaren nooit de hele pagina of de hele schoolgids — alleen de ene zin
 * waarin de methodenaam staat, plus de link ernaartoe. Dat is genoeg om het
 * met de hand te kunnen controleren, en het is het minste wat daarvoor nodig is.
 */

import { normaliseer } from "@/lib/zoeknaam";

// ---------------------------------------------------------------------------
// HTML naar leesbare tekst
// ---------------------------------------------------------------------------

/** Haalt de opmaak weg en houdt de leesbare tekst over. */
export function tekstUitHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|br)>/gi, ". ")
    .replace(/<br\s*\/?>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Alle links op een pagina, omgezet naar volledige adressen. */
export function linksUitHtml(html: string, basis: string): string[] {
  const uit = new Set<string>();

  for (const treffer of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    try {
      const adres = new URL(treffer[1], basis);
      adres.hash = "";
      if (adres.protocol === "http:" || adres.protocol === "https:") {
        uit.add(adres.toString());
      }
    } catch {
      // Een onbruikbaar adres slaan we stil over.
    }
  }
  return [...uit];
}

/**
 * Welke links zijn de moeite waard?
 *
 * We gaan gericht op zoek naar de schoolgids en naar pagina's die over het
 * onderwijs gaan. Alles wat daar niet op lijkt, laten we met rust — dat scheelt
 * de school verkeer en ons tijd.
 */
const KANSRIJK = [
  "schoolgids", "schoolplan", "onderwijs", "methode", "methodes", "vakken",
  "rekenen", "leerstof", "ons-onderwijs", "onderwijsaanbod", "documenten",
  "downloads", "praktisch", "informatie", "over-ons", "over-de-school",
];

export type Kandidaat = { url: string; soort: "schoolgids" | "pagina"; score: number };

/** Hoort dit adres bij dezelfde school? www ervoor telt niet mee. */
function zelfdeSite(host: string, eigenHost: string): boolean {
  return host.toLowerCase().replace(/^www\./, "") === eigenHost.replace(/^www\./, "");
}

export function kiesKandidaten(
  links: string[],
  eigenHost: string,
  maximaal = 6,
): Kandidaat[] {
  const uit: Kandidaat[] = [];

  for (const link of links) {
    let url: URL;
    try {
      url = new URL(link);
    } catch {
      continue;
    }

    const pad = decodeURIComponent(url.pathname + url.search).toLowerCase();
    const isPdf = pad.endsWith(".pdf");
    const eigen = zelfdeSite(url.host, eigenHost);

    /*
      In principe blijven we op de website van de school zelf. Eén uitzondering:
      de schoolgids staat vaak als PDF op een documentenplek of een cdn van het
      schoolbestuur. Dat is precies het document waar we naar op zoek zijn, dus
      dat volgen we wel — maar alleen als het een PDF is die zich ook als
      schoolgids of schoolplan aandient. robots.txt van díe plek wordt net zo
      goed gelezen en gevolgd.
    */
    if (!eigen && !(isPdf && /schoolgids|schoolplan/.test(pad))) continue;

    if (!isPdf && /\.(jpg|jpeg|png|gif|svg|webp|zip|docx?|xlsx?|pptx?|mp4|mp3)$/.test(pad)) {
      continue;
    }

    let score = 0;
    for (const woord of KANSRIJK) if (pad.includes(woord)) score += 2;
    if (pad.includes("schoolgids")) score += 6;
    if (isPdf) score += 3;
    // Een jaartal in de naam wijst vaak op de actuele schoolgids.
    if (/20\d\d/.test(pad)) score += 2;

    if (score > 0) {
      uit.push({
        url: url.toString(),
        soort: pad.includes("schoolgids") || isPdf ? "schoolgids" : "pagina",
        score,
      });
    }
  }

  return uit.sort((a, b) => b.score - a.score).slice(0, maximaal);
}

/**
 * De PDF's die vanaf een gevonden pagina te bereiken zijn.
 *
 * Nodig omdat een schoolgids zelden rechtstreeks op de startpagina staat: daar
 * staat een link naar een pagina "Schoolgids", en pas dáár staat de PDF. Eén
 * stap dieper dus, en alleen voor PDF's — verder gaan we niet.
 */
export function pdfsOpPagina(
  html: string,
  basis: string,
  maximaal = 3,
): Kandidaat[] {
  const uit: Kandidaat[] = [];

  for (const link of linksUitHtml(html, basis)) {
    let url: URL;
    try {
      url = new URL(link);
    } catch {
      continue;
    }
    const pad = decodeURIComponent(url.pathname + url.search).toLowerCase();
    if (!pad.endsWith(".pdf")) continue;

    let score = 1;
    if (/schoolgids|schoolplan/.test(pad)) score += 6;
    for (const woord of KANSRIJK) if (pad.includes(woord)) score += 1;
    if (/20\d\d/.test(pad)) score += 2;

    uit.push({ url: url.toString(), soort: "schoolgids", score });
  }

  return uit.sort((a, b) => b.score - a.score).slice(0, maximaal);
}

// ---------------------------------------------------------------------------
// De methodenaam terugvinden
// ---------------------------------------------------------------------------

export type Treffer = {
  methodeId: string;
  /** De zin waarin de naam staat. Dit is het enige wat we bewaren. */
  zin: string;
};

/** Knipt een tekst in zinnen. Ruw, maar genoeg om er één uit te lichten. */
function zinnen(tekst: string): string[] {
  return tekst.split(/(?<=[.!?])\s+|\n+/).filter((z) => z.trim().length > 0);
}

/**
 * Zoekt de namen van de methodes uit de admin terug in een tekst.
 *
 * Er wordt vergeleken op de genormaliseerde vorm, zodat "Wereld in getallen",
 * "wereld-in-getallen" en "Wereld in Getallen" allemaal dezelfde treffer
 * opleveren. De naam moet als heel woord voorkomen; anders levert een korte
 * methodenaam treffers op in woorden waar hij toevallig in zit.
 */
export function zoekMethodes(
  tekst: string,
  methodes: { id: string; naam: string }[],
): Treffer[] {
  const uit = new Map<string, Treffer>();
  const stukken = zinnen(tekst);

  for (const methode of methodes) {
    const naald = normaliseer(methode.naam);
    if (naald.length < 4) continue; // te kort om betrouwbaar te zijn

    for (const zin of stukken) {
      const genormaliseerd = normaliseer(zin);
      const plek = genormaliseerd.indexOf(naald);
      if (plek === -1) continue;

      // Heel woord: ervoor en erna geen letter of cijfer.
      const ervoor = genormaliseerd[plek - 1];
      const erna = genormaliseerd[plek + naald.length];
      if ((ervoor && /[a-z0-9]/.test(ervoor)) || (erna && /[a-z0-9]/.test(erna))) {
        continue;
      }

      if (!uit.has(methode.id)) {
        uit.set(methode.id, { methodeId: methode.id, zin: kortZin(zin) });
      }
      break;
    }
  }

  return [...uit.values()];
}

/** Eén zin, hooguit 300 tekens, zodat er nooit een halve pagina wordt bewaard. */
function kortZin(zin: string): string {
  const schoon = zin.replace(/\s+/g, " ").trim();
  return schoon.length <= 300 ? schoon : `${schoon.slice(0, 297)}…`;
}

// ---------------------------------------------------------------------------
// Uit welk jaar komt dit document?
// ---------------------------------------------------------------------------

/**
 * Zoekt het schooljaar of jaartal van een document.
 *
 * Eerst in het webadres (schoolgidsen heten vaak "schoolgids-2025-2026.pdf"),
 * daarna in het begin van de tekst. Wordt er niets gevonden, dan blijft het
 * leeg — we vullen nooit een jaartal in dat er niet staat.
 */
export function vindJaartal(url: string, tekst: string): string | null {
  const bronnen = [decodeURIComponent(url), tekst.slice(0, 4000)];

  /*
    Een schooljaar bestaat uit twee opeenvolgende jaren. Die eis is nodig,
    want een webadres zit vol met getallen die er net zo uitzien:
    "uploads/2026/07/..." zou anders "2026/2007" opleveren. Alleen een paar
    dat écht opvolgt telt mee.
  */
  for (const bron of bronnen) {
    /*
      Let op de kijk-vooruit en kijk-achteruit in plaats van \b: een
      woordgrens werkt niet naast een underscore, en juist die staat overal in
      bestandsnamen ("schoolgids_2025-2026.pdf").
    */
    for (const treffer of bron.matchAll(/(?<!\d)(20\d\d)\s*[-/–]\s*(20\d\d|\d\d)(?!\d)/g)) {
      const eerste = Number(treffer[1]);
      const tweede =
        treffer[2].length === 2
          ? Number(`${String(eerste).slice(0, 2)}${treffer[2]}`)
          : Number(treffer[2]);

      if (tweede === eerste + 1) return `${eerste}/${tweede}`;
    }
  }

  /*
    Geen schooljaar gevonden? Dan alleen een los jaartal als het woord
    "schooljaar" of "schoolgids" er vlak voor staat. Een willekeurig jaartal op
    een pagina is meestal een copyrightregel of een nieuwsbericht, en dat zegt
    niets over wanneer dit document is gemaakt. Liever niets dan iets wat niet
    klopt.
  */
  for (const bron of bronnen) {
    const bijNaam = bron.match(/school(?:jaar|gids)\s+(20\d\d)\b/i);
    if (bijNaam) return bijNaam[1];
  }

  /*
    Laatste kans: twee opeenvolgende jaren van twee cijfers, zoals
    "schoolgids-26-27". Alleen als ze echt opvolgen, anders zou elk paar
    getallen een schooljaar worden.
  */
  for (const bron of bronnen) {
    for (const treffer of bron.matchAll(/(?<!\d)(\d\d)\s*[-/–]\s*(\d\d)(?!\d)/g)) {
      const eerste = Number(treffer[1]);
      const tweede = Number(treffer[2]);
      if (tweede === eerste + 1 && eerste >= 20 && eerste <= 40) {
        return `20${treffer[1]}/20${treffer[2]}`;
      }
    }
  }

  return null;
}
