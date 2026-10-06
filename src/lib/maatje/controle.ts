/**
 * De automatische controles uit hoofdstuk 11 van MAATJE-HANDLEIDING.md.
 *
 * Een tekst die hier een melding krijgt, wordt niet als "gecontroleerd"
 * opgeslagen en het maatje gebruikt hem niet. Het script dat de teksten
 * schrijft (`scripts/maatje-schrijf.mjs`) laat zien welke controle faalde.
 */

import { GEEN_PLAATJE, type Controlegegevens, type MaatjeTeksten, type Zin } from "@/lib/maatje/types";

/** Getallen in een tekst: 13, € 2,50 telt als 2,50 en 2:30 als één tijd. */
function getallenIn(tekst: string): string[] {
  return tekst.match(/\d+(?:[,:]\d+)?/g) ?? [];
}

/** De getallen als losse waarden: "2,50" geeft ook 2 en 50, "2:30" ook 2 en 30. */
function waardenIn(tekst: string): number[] {
  const uit: number[] = [];
  for (const g of getallenIn(tekst)) {
    for (const deel of g.split(/[,:]/)) uit.push(Number(deel));
    if (g.includes(",")) {
      const [e, c] = g.split(",");
      uit.push(Number(e) * 100 + Number(c));
    }
  }
  return uit;
}

export function zinnenVan(tekst: string): string[] {
  return tekst
    .split(/(?<=[.!?])\s+/)
    .map((z) => z.trim())
    .filter(Boolean);
}

function woordenVan(zin: string): string[] {
  return zin.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w));
}

const VERBODEN = [
  "fout", "foute", "slecht", "dom", "domme", "helaas", "jammer", "nee", "stom", "stomme",
  "makkelijk", "makkelijke", "moeilijk", "slim", "slimme", "super", "briljant",
  "optellen", "aftrekken", "vermenigvuldigen", "maal", "tientaloverschrijding",
  "erbijsom", "erafsom", "deeltafel", "vergelijking",
  /* Engelse woorden die er in een kindertekst het snelst in sluipen. */
  "ok", "oké", "okay", "yes", "cool", "wow", "oops", "sorry", "great", "nice", "good", "well", "done",
];

/** "Dit was een moeilijke" gaat over de som, niet over het kind; dat mag wel. */
const UITZONDERINGEN = [/dit was een moeilijke/i];

/** Enkelvoud en meervoud: [enkelvoud, meervoud]. */
const PAREN: [string, string][] = [
  ["groepje", "groepjes"],
  ["kraal", "kralen"],
  ["staaf", "staven"],
  ["bolletje", "bolletjes"],
  ["blokje", "blokjes"],
  ["sprong", "sprongen"],
  ["munt", "munten"],
  ["briefje", "briefjes"],
  ["minuut", "minuten"],
  ["bordje", "bordjes"],
  ["rij", "rijen"],
  ["plaatje", "plaatjes"],
  ["dag", "dagen"],
  ["week", "weken"],
  ["maand", "maanden"],
  ["kwartier", "kwartieren"],
  ["stip", "stippen"],
  ["vakje", "vakjes"],
];

const EMOJI = /\p{Extended_Pictographic}/u;

export type Melding = { controle: number; tekst: string };

function alleZinnen(t: MaatjeTeksten): { soort: number; zin: Zin; fout?: string }[] {
  const uit: { soort: number; zin: Zin; fout?: string }[] = [];
  uit.push({ soort: 1, zin: t.voorlezen });
  if (t.bouw) uit.push({ soort: 2, zin: t.bouw });
  for (const o of t.goed.openers) uit.push({ soort: 3, zin: { tekst: o, stap: GEEN_PLAATJE } });
  for (const z of t.goed.zinnen) uit.push({ soort: 3, zin: z });
  for (const o of t.fouten.openers) uit.push({ soort: 4, zin: { tekst: o, stap: GEEN_PLAATJE } });
  for (const f of t.fouten.lijst) for (const z of f.zinnen) uit.push({ soort: 4, zin: z, fout: f.code });
  for (const z of t.uitleg) uit.push({ soort: 5, zin: z });
  uit.push({ soort: 6, zin: t.tip });
  return uit;
}

/** Alle meldingen bij deze teksten. Een lege lijst betekent: door de controle. */
export function controleer(t: MaatjeTeksten, g: Controlegegevens): Melding[] {
  const meldingen: Melding[] = [];
  const meld = (controle: number, tekst: string) => meldingen.push({ controle, tekst });

  const opgave = new Set(g.opgave);
  const toegestaan = new Set([...g.opgave, ...g.tussen, ...g.antwoord]);

  for (const { soort, zin, fout } of alleZinnen(t)) {
    const tekst = zin.tekst;
    const eigenVraag = soort === 1 && g.voorlezenIsVraag === true;

    // 1. Geen antwoord vóór Controleer.
    if (soort === 1 || soort === 2 || soort === 6) {
      for (const w of waardenIn(tekst)) {
        if (g.antwoord.includes(w) && !opgave.has(w)) {
          meld(1, `Tekst ${soort} verklapt het antwoord (${w}): "${tekst}"`);
        }
      }
    }

    if (eigenVraag) continue;

    // 2. Getallen kloppen.
    const hierToegestaan = fout ? new Set([...toegestaan, ...(g.perFout[fout] ?? [])]) : toegestaan;
    for (const ruw of getallenIn(tekst)) {
      const delen = ruw.split(/[,:]/).map(Number);
      const geheel = ruw.includes(",") ? Number(ruw.split(",")[0]) * 100 + Number(ruw.split(",")[1]) : null;
      const goed =
        (geheel !== null && hierToegestaan.has(geheel)) ||
        delen.every((d) => hierToegestaan.has(d)) ||
        /* Een tijd als 2:30 telt als één getal: de minuten tellen mee. */
        (ruw.includes(":") && hierToegestaan.has(delen[0] * 60 + delen[1]));
      if (!goed) meld(2, `Getal ${ruw} komt niet uit de opgave: "${tekst}"`);
    }

    // 3. Lengte van elke zin.
    for (const z of zinnenVan(tekst)) {
      if (woordenVan(z).length > 10) meld(3, `Zin langer dan 10 woorden: "${z}"`);
    }

    // 4. Verboden woorden.
    if (!UITZONDERINGEN.some((u) => u.test(tekst))) {
      for (const w of woordenVan(tekst.toLowerCase())) {
        const schoon = w.replace(/[^\p{L}]/gu, "");
        if (VERBODEN.includes(schoon)) meld(4, `Verboden woord "${schoon}": "${tekst}"`);
      }
    }

    // 5. Schrijfwijze.
    if (/[÷*]/.test(tekst) || /\d\s*x\s*\d/i.test(tekst)) meld(5, `Gebruik × en : : "${tekst}"`);
    if (/€\d/.test(tekst) || /\d,\d{2}\s*euro/.test(tekst) || /\d\.\d{2}/.test(tekst)) meld(5, `Geld als € 1,50: "${tekst}"`);
    if (EMOJI.test(tekst)) meld(5, `Emoji in de tekst: "${tekst}"`);
    if (/!\s*!/.test(tekst)) meld(5, `Twee uitroeptekens: "${tekst}"`);

    // 6. Enkelvoud en meervoud.
    for (const [enkel, meer] of PAREN) {
      if (new RegExp(`(^|[^\\d,])1 ${meer}\\b`).test(tekst)) meld(6, `"1 ${meer}" moet "1 ${enkel}" zijn: "${tekst}"`);
      if (new RegExp(`\\b([02-9]|\\d{2,}) ${enkel}\\b`).test(tekst)) meld(6, `Meervoud bij "${enkel}": "${tekst}"`);
    }

    // 8. Plaatje-stappen bij tekst 4 en 5.
    if ((soort === 4 || soort === 5) && !zin.stap) meld(8, `Zin zonder plaatje-stap: "${tekst}"`);
  }

  // 3. Aantal zinnen per tekst.
  const telZinnen = (zinnen: Zin[]) => zinnen.reduce((n, z) => n + zinnenVan(z.tekst).length, 0);
  if (!g.voorlezenIsVraag && zinnenVan(t.voorlezen.tekst).length > 2) meld(3, "Tekst 1 heeft meer dan 2 zinnen.");
  if (t.bouw && zinnenVan(t.bouw.tekst).length > 1) meld(3, "Tekst 2 heeft meer dan 1 zin.");
  if (zinnenVan(t.tip.tekst).length > 1) meld(3, "Tekst 6 heeft meer dan 1 zin.");
  for (const o of t.goed.openers) {
    if (zinnenVan(o).length + telZinnen(t.goed.zinnen) > 3) meld(3, "Tekst 3 heeft meer dan 3 zinnen.");
  }
  for (const f of t.fouten.lijst) {
    for (const o of t.fouten.openers) {
      if (zinnenVan(o).length + telZinnen(f.zinnen) > 3) meld(3, `Tekst 4 (${f.code}) heeft meer dan 3 zinnen.`);
    }
  }
  if (telZinnen(t.uitleg) > 4) meld(3, "Tekst 5 heeft meer dan 4 zinnen.");

  // 7. Alles aanwezig.
  if (!t.voorlezen.tekst) meld(7, "Tekst 1 ontbreekt.");
  if (t.goed.openers.length !== 3 || t.goed.zinnen.length === 0) meld(7, "Tekst 3 is niet compleet (3 openers en een uitleg).");
  if (t.fouten.openers.length !== 3) meld(7, "Tekst 4 heeft geen 3 openers.");
  if (t.uitleg.length === 0) meld(7, "Tekst 5 ontbreekt.");
  if (!t.tip.tekst) meld(7, "Tekst 6 ontbreekt.");
  for (const code of g.bekend) {
    const f = t.fouten.lijst.find((x) => x.code === code);
    if (!f) meld(7, `Geen tekst 4 voor de bekende fout "${code}".`);
    else if (f.antwoorden.length === 0) meld(7, `Fout "${code}" heeft geen antwoord om aan te herkennen.`);
  }

  return meldingen;
}
