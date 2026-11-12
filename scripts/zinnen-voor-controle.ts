/**
 * Maakt ZINNEN-VOOR-CONTROLE.md: ALLE zinnen die Bliepo en de lessen aan een kind laten horen of zien, alleen in de
 * 15 nieuwe gouden lessen. Zo kan het bestand opnieuw gemaakt worden als er zinnen veranderen:
 *
 *   npx tsx scripts/zinnen-voor-controle.ts
 *
 * Schrijft ALLEEN ZINNEN-VOOR-CONTROLE.md. Raakt de database, de lessen en de andere bestanden niet aan.
 *
 * Hoe het werkt (3 bronnen):
 *   A. De gedeelde rijtjes (lof, naam, einde, aanmoedigen, ...): echt geladen uit squla-klok-gouden-zinnen.ts.
 *      Ze staan 1 keer onder ALGEMEEN; per les staat welke de les gebruikt.
 *   B. De hele fouttabel: elk fouttabel-script (scripts/fouttabel-*-gouden.ts) rekent alle zinnen bij een foute poging
 *      uit en schrijft een .md. Dit script draait die scripts met een tijdelijke "omleiding" (de .md komt in een
 *      tijdelijke map, de echte FOUTTABEL-bestanden blijven onaangeraakt) en leest de tabellen.
 *   C. De vaste tekst van de les (begin, vragen, knoppen, eindkaart, bordjes): uit de bronbestanden van de les
 *      (zinnen.ts, gouden.tsx, gouden-vlak.tsx) gehaald met de TypeScript-lezer. Geen code of commentaar, alleen tekst
 *      die op het scherm komt of gezegd wordt. Zinnen die al volledig in de fouttabel staan, worden niet nog eens
 *      als sjabloon genoemd.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import * as ts from "typescript";

const ROOT = resolve(process.argv[1] ?? "scripts/x.ts", "..", "..");
const LESSEN = join(ROOT, "src/components/les/lessen");
const VLAKKEN = join(ROOT, "src/components/les/vlakken");
const UIT = join(ROOT, "ZINNEN-VOOR-CONTROLE.md");

type LesDef = { slug: string; titel: string; prefix: string; vlak?: string[] };
const LESSEN_LIJST: LesDef[] = [
  { slug: "tellen", titel: "Tellen", prefix: "TELLEN" },
  { slug: "splitsen", titel: "Splitsen", prefix: "SPLITSEN" },
  { slug: "plussommen", titel: "Plussommen", prefix: "PLUSSOMMEN" },
  { slug: "minsommen", titel: "Minsommen", prefix: "MINSOMMEN" },
  { slug: "meer-minder", titel: "Meer-minder", prefix: "MEERMINDER" },
  { slug: "huisnummers", titel: "Huisnummers", prefix: "HUISNUMMERS" },
  { slug: "getallenlijn", titel: "Getallenlijn", prefix: "GETALLENLIJN" },
  { slug: "meten", titel: "Meten", prefix: "METEN" },
  { slug: "klok", titel: "Klok", prefix: "KLOK" },
  { slug: "geld", titel: "Geld", prefix: "GELD" },
  { slug: "vormen", titel: "Vormen", prefix: "VORMEN" },
  { slug: "dagen", titel: "Dagen", prefix: "DAGEN" },
  { slug: "tijd", titel: "Tijd", prefix: "TIJD" },
  { slug: "rekentaal", titel: "Rekentaal", prefix: "REKENTAAL" },
  { slug: "rekenmix", titel: "Rekenmix", prefix: "REKENMIX" },
];

/** De gedeelde rijtjes uit de gouden klokles (alle lessen gebruiken ze). */
const GEDEELD = ["LOF", "MOMENT", "NAAM_LOF", "NAAM_GROET", "BEVESTIG", "SNEL", "EINDE", "EINDE_VEEL_FOUTEN", "ONDUIDELIJK", "AANMOEDIG", "OVERGANG"];
const GEDEELD_UITLEG: Record<string, string> = {
  LOF: "na een goed antwoord (gewone lof; hooguit 1 per vraag)",
  MOMENT: "na goed, bij een bijzonder moment",
  NAAM_LOF: "na goed, lof met de naam van het kind (zonder naam valt hij weg)",
  NAAM_GROET: "begin van de les, groet met de naam",
  BEVESTIG: "na een goed antwoord dat volgt op een foute poging",
  SNEL: "na een heel snel goed antwoord",
  EINDE: "eindkaart, afsluitende zin",
  EINDE_VEEL_FOUTEN: "eindkaart, als het kind veel hulp nodig had",
  ONDUIDELIJK: "na een foute poging als niet duidelijk is wat het kind dacht",
  AANMOEDIG: "als het kind even stilzit of bij het hulphandje",
  OVERGANG: "tussen 2 vragen in, voor de volgende vraag",
};

/* ------------------------------------------------------------------ helpers ------------------------------------ */

const kaal = (z: string) => z.replace(/\{(\d+):[a-zA-Z]+\}/g, "$1").replace(/\{\{([^{}]*)\}:\{[^{}]*\}\}/g, "[$1]");
const spatie = (z: string) => z.replace(/\s+/g, " ").trim();
const heeftWoorden = (z: string) => (z.match(/[A-Za-zÀ-ÿ]{2,}/g) ?? []).length;

type Zin = { zin: string; wanneer: string; keer: number };
class Lijst {
  items = new Map<string, Zin>();
  voeg(zin: string, wanneer: string) {
    const z = spatie(kaal(zin));
    if (!z) return;
    const bestaand = this.items.get(z);
    if (bestaand) bestaand.keer++;
    else this.items.set(z, { zin: z, wanneer, keer: 1 });
  }
}

/* ------------------------------------------------------------------ B. fouttabel ------------------------------- */

const tijdelijk = mkdtempSync(join(tmpdir(), "zinnen-controle-"));
const omleidMap = join(tijdelijk, "md");
mkdirSync(omleidMap);
const stub = join(tijdelijk, "omleiding.cjs");
writeFileSync(
  stub,
  `const fs = require("fs"), path = require("path");
const uit = process.env.ZIN_UIT;
const orig = fs.writeFileSync;
fs.writeFileSync = function (p, ...rest) { return orig.call(fs, path.join(uit, path.basename(String(p))), ...rest); };
try { require("module").syncBuiltinESMExports(); } catch (e) {}
`,
);

const fouttabelBestanden: Record<string, string> = {};
const problemen: string[] = [];
for (const les of LESSEN_LIJST) {
  const script = join(ROOT, "scripts", `fouttabel-${les.slug}-gouden.ts`);
  if (!existsSync(script)) {
    problemen.push(`${les.titel}: geen fouttabel-script (${script})`);
    continue;
  }
  const map = join(omleidMap, les.slug);
  mkdirSync(map);
  try {
    execFileSync("npx", ["--yes", "tsx", "--require", stub, script], { cwd: ROOT, env: { ...process.env, ZIN_UIT: map }, stdio: "pipe", timeout: 180000 });
  } catch (e) {
    /* Het script kan na het schrijven nog een controle doen die faalt; dan staat de .md er soms toch. */
    problemen.push(`${les.titel}: het fouttabel-script gaf een melding (${String((e as Error).message).split("\n")[0].slice(0, 120)})`);
  }
  const md = readdirSync(map).find((f) => f.endsWith(".md"));
  if (md) fouttabelBestanden[les.slug] = readFileSync(join(map, md), "utf8");
  else problemen.push(`${les.titel}: de fouttabel kon niet gelezen worden`);
}

function splitRij(rij: string): string[] {
  const t = rij.trim().replace(/^\|/, "").replace(/\|$/, "");
  return t.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}
function schoonCel(c: string): string {
  return spatie(c.replace(/<br\s*\/?>/gi, " ").replace(/`/g, "").replace(/\*\*/g, "").replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, " "));
}
const GEEN_ZIN = /^(—|-|–|niets|geen|\(|\[)/i;

function kolomSoort(kop: string): { soort: string; wanneer: string } | null {
  const k = kop.toLowerCase();
  if (/uitleg/.test(k) && !/^vraag/.test(k)) return { soort: "uitleg", wanneer: "na de 2e foute poging: Bliepo legt uit" };
  if (/samen/.test(k)) return { soort: "samen", wanneer: "na de 2e foute poging: Bliepo doet het samen voor" };
  if (/2 keer|zelfde denkfout|dezelfde denkfout|als de 1e fout/.test(k)) return { soort: "weer", wanneer: "2e foute poging met dezelfde denkfout als de 1e: Bliepo zegt het anders" };
  if (/eerste zin/.test(k)) return { soort: "eerste", wanneer: "na de 1e foute poging: Bliepo's eerste reactie" };
  if (/^hint/.test(k)) return { soort: "hint", wanneer: "bij de hint na de 1e foute poging" };
  return null;
}

function leesFouttabel(md: string, lijst: Lijst) {
  const regels = md.split("\n");
  for (let i = 0; i < regels.length - 1; i++) {
    if (!regels[i].startsWith("|") || !/^\|[\s:|-]+\|?\s*$/.test(regels[i + 1])) continue;
    const koppen = splitRij(regels[i]).map(schoonCel);
    const kolommen = koppen.map((k, idx) => ({ idx, ...(kolomSoort(k) ?? { soort: "", wanneer: "" }) })).filter((c) => c.soort);
    const vraagIdx = koppen.findIndex((k) => /^vraag|^stap en vraag/i.test(k));
    const foutIdx = koppen.findIndex((k) => /^fout antwoord|^2e fout/i.test(k));
    let j = i + 2;
    for (; j < regels.length && regels[j].startsWith("|"); j++) {
      const cellen = splitRij(regels[j]).map(schoonCel);
      const vraag = vraagIdx >= 0 ? cellen[vraagIdx] ?? "" : "";
      const fout = foutIdx >= 0 ? cellen[foutIdx] ?? "" : "";
      const context = [vraag ? `vraag: ${vraag.length > 110 ? vraag.slice(0, 107) + "..." : vraag}` : "", fout ? `gekozen: ${fout.length > 40 ? fout.slice(0, 37) + "..." : fout}` : ""].filter(Boolean).join("; ");
      /* De vraag zelf (tussen aanhalingstekens in de vraagkolom) is ook een zin voor het kind. */
      for (const m of vraag.matchAll(/"([^"]{4,})"/g)) lijst.voeg(m[1], "vraag aan het kind (zoals in de fouttabel)");
      for (const kol of kolommen) {
        const cel = cellen[kol.idx] ?? "";
        if (!cel || GEEN_ZIN.test(cel) || heeftWoorden(cel) < 1) continue;
        lijst.voeg(cel, `${kol.wanneer}${context ? " (" + context + ")" : ""}`);
      }
    }
    i = j - 1;
  }
}

/* ------------------------------------------------------------------ C. vaste tekst uit de bronbestanden --------- */

/** Namen van eigenschappen/variabelen waarvan de tekst voor een bouwer is, niet voor het kind. */
const NIET_KIND = new Set(["scherm", "denkfout", "noot", "soort", "code", "id", "key", "kleur", "type", "className", "style", "src", "href", "alt", "d", "fill", "stroke", "viewBox", "transform", "role", "name", "htmlFor", "target", "rel", "font", "fontFamily", "fontWeight", "cursor", "background", "border", "boxShadow", "transition", "filter", "animation", "pointerEvents", "inputMode", "pattern", "autoComplete", "lang", "mode", "wanneer", "bron", "reden", "goed", "naFout", "antwoord", "sleutel", "synthesis", "gouden", "sl", "bestand", "les", "lesId", "vraagId", "tag"]);
const NIET_KIND_VAR = new Set(["DENKFOUT_UITLEG", "SCHERM_TEKST", "DENKFOUTEN", "SCHERM", "RICHTINGWOORDEN", "OPDRACHT"]);
const ATTR_TEKST = new Set(["tekst", "text", "label", "titel", "title", "kop", "bordje", "regel", "zin", "placeholder", "knop", "opdracht", "vraag", "uitleg", "hint"]);

const WANNEER: Record<string, string> = {
  begin: "begin van de les (Bliepo opent)",
  vraag: "bij de vraag",
  vraagEerste: "bij de eerste vraag (uitleg wat het kind moet doen)",
  natellen: "bij de eerste vraag, samen natellen",
  natellenKlaar: "na het samen natellen",
  samenHelp: "na de 2e foute poging, Bliepo telt/doet samen",
  samenTik: "tijdens het samen doen",
  samenHand: "hulphandje tijdens het samen doen",
  samenKlaar: "na het samen doen",
  samenZelf: "als het kind 20 seconden niets doet bij het samen doen",
  slot: "eindkaart, wat het kind geleerd heeft",
  kaartTik: "eindkaart, Bliepo zegt wat het kind met de kaart doet",
  weerGekozen: "na dezelfde foute keuze 2 keer",
  AANMOEDIG_TIKKEN: "aanmoediging bij het hulphandje",
  AANMOEDIG_DOEN: "aanmoediging bij het hulphandje",
  TELREACTIE: "na een goed antwoord, reactie bij het tellen",
  DICHTBIJ: "na de 1e foute poging (eerste zin, sjabloon)",
};

/** Namen uit de code die op een vaste plek in de les wijzen; eerste treffer (van binnen naar buiten) wint. */
const PATRONEN: [RegExp, string][] = [
  [/Reactie$/, "na een goed antwoord: reactie van Bliepo (sjabloon)"],
  [/Hand$/, "hulphandje: wat het kind moet doen"],
  [/Klaar$/, "na het samen doen: Bliepo vat samen"],
  [/Stap$|StapZin$/, "bij het samen doen: Bliepo vraagt het kind iets te doen"],
  [/^hint/i, "hint na een foute poging (sjabloon)"],
  [/^uitleg/i, "uitleg na de 2e foute poging (sjabloon)"],
  [/^weer/i, "bij dezelfde foute poging 2 keer: Bliepo zegt het anders (sjabloon)"],
  [/^eerste$/i, "eerste reactie na een foute poging (sjabloon)"],
  [/^(intro)$/i, "toelichting bij een vraag"],
  [/^(kaarten|opties|losse|keuzes|antwoorden|labels?)$/i, "kaartje, keuze of label bij een vraag"],
  [/^(vraag|opdracht|vraagtekst)/i, "vraag aan het kind"],
  [/^(start|begin)/i, "begin van de les"],
  [/^(opnieuw)/i, "vraag, opnieuw gesteld"],
  [/^(terug|extra)/i, "bij een herhaalvraag aan het eind"],
  [/^(samen)/i, "bij het samen doen"],
  [/^(titel)$/i, "titel van de les op het scherm"],
];

function weergaveVan(expr: ts.Expression, sf: ts.SourceFile): string {
  /* Waarde die per vraag wisselt: tussen [blokhaken], zodat het niet lijkt op {naam} (de naam van het kind). */
  if (ts.isParenthesizedExpression(expr)) return weergaveVan(expr.expression, sf);
  if (ts.isNumericLiteral(expr)) return expr.text;
  if (ts.isIdentifier(expr)) return `[${expr.text}]`;
  if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression) && expr.arguments[0] && expr.arguments.length <= 2 && ts.isNumericLiteral(expr.arguments[0])) return expr.arguments[0].text;
  if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression) && ["gk", "g", "k"].includes(expr.expression.text) && expr.arguments[0]) return weergaveVan(expr.arguments[0], sf);
  if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression)) return `[${expr.expression.text}.${expr.name.text}]`;
  return "[…]";
}
/** Zet een tekst-uitdrukking om in leesbare tekst met {plaatshouders}; null als er geen tekst in zit. */
function tekstVan(node: ts.Node, sf: ts.SourceFile): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    let s = node.head.text;
    for (const sp of node.templateSpans) s += weergaveVan(sp.expression, sf) + sp.literal.text;
    return s;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const l = tekstVan(node.left, sf);
    const r = tekstVan(node.right, sf);
    if (l === null && r === null) return null;
    return (l ?? weergaveVan(node.left, sf)) + (r ?? weergaveVan(node.right, sf));
  }
  if (ts.isParenthesizedExpression(node)) return tekstVan(node.expression, sf);
  return null;
}

/** Lijkt dit op een zin of tekst voor het kind (en niet op een code, stijl of pad)? */
function isKindTekst(t: string, uitJsxTekst: boolean): boolean {
  const z = spatie(t);
  if (!z) return false;
  if (/^use (client|server)$/.test(z)) return false;
  if (/sans-serif|system-ui|\bpx\b|\d+px|^[MQHLVZ]\s?[\[\d]|\||\.\[|\{display|=>|\?\?|\bMath\./.test(z)) return false;
  /* Zonder de plaatshouders moeten er nog echte woorden overblijven (anders is het alleen een samenstelling van delen). */
  if (heeftWoorden(z.replace(/\[[^\]]*\]|\{[^}]*\}/g, " ")) < 1) return false;
  if (/^(https?:|\/|\.\/|#|rgb|hsl|url\(|var\(|calc\()/i.test(z)) return false;
  if (/^[\w-]+(\.[a-z]+)$/.test(z)) return false; /* bestandsnaam */
  if (/^[\d\s.,%+\-/*:()]+$/.test(z)) return false;
  if (heeftWoorden(z) < 1) return false;
  const heeftSpatie = /\s/.test(z);
  if (!heeftSpatie) {
    /* 1 woord: alleen als het echt als tekst getoond wordt (JSX-tekst of een tekst-eigenschap), met hoofdletter of leesteken. */
    return uitJsxTekst && /^[A-ZÀ-Þa-zß-ÿ][a-zß-ÿ'’-]*[.!?]?$/.test(z) && !/^[a-z]+[A-Z]/.test(z);
  }
  /* Meerdere woorden: minstens 2 echte woorden (geen stijl als "ease-in 0.3s" of "0 0 100 100"). */
  if (heeftWoorden(z) < 2) return false;
  if (/[{};]/.test(z) && !/\{(naam|\w+)\}/.test(z)) return false;
  if (/^[a-z-]+(\s[a-z-]+)*$/.test(z) && /(-|^(flex|grid|block|none|auto|inherit|solid|dashed|ease|linear|absolute|relative))/.test(z) && !/[.!?,]/.test(z)) return false;
  return true;
}

function kopVan(node: ts.Node): string {
  /* De naam van de eigenschap of variabele waarin de tekst staat (dichtstbijzijnde eerst). */
  const namen: string[] = [];
  for (let n: ts.Node | undefined = node.parent; n; n = n.parent) {
    if ((ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) && n.name && (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name))) namen.push(n.name.text);
    else if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) namen.push(n.name.text);
    else if (ts.isFunctionDeclaration(n) && n.name) namen.push(n.name.text);
    else if (ts.isJsxAttribute(n)) namen.push(n.name.getText());
  }
  return namen.join(" < ");
}

function vaste(bestand: string, uit: Lijst, overslaan: Set<string>, jsx: boolean) {
  const tekst = readFileSync(bestand, "utf8");
  const sf = ts.createSourceFile(bestand, tekst, ts.ScriptTarget.Latest, true, bestand.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const bestandsnaam = bestand.split("/").pop()!;
  const meld = (node: ts.Node, t: string, uitJsx: boolean) => {
    if (!isKindTekst(t, uitJsx)) return;
    const namen = kopVan(node).split(" < ").filter(Boolean);
    if (namen[0] && NIET_KIND.has(namen[0])) return;
    let wanneer = "";
    for (const n of namen) {
      const dank = WANNEER[n] ?? PATRONEN.find(([r]) => r.test(n))?.[1];
      if (dank) {
        wanneer = dank;
        break;
      }
    }
    if (!wanneer) wanneer = jsx || bestandsnaam.includes("vlak") ? `tekst op het scherm (bron: ${bestandsnaam}${namen[0] ? ", " + namen[0] : ""})` : `vaste zin van de les (bron: ${namen.slice(0, 2).join(" in ") || bestandsnaam})`;
    uit.voeg(t, wanneer);
  };
  const bezoek = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) || ts.isTypeNode(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && (overslaan.has(node.name.text) || NIET_KIND_VAR.has(node.name.text))) return;
    if (ts.isThrowStatement(node)) return;
    if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression)) return;
    if (ts.isCallExpression(node)) {
      const f = node.expression.getText(sf);
      if (/^(console\.|require$|import$|\w+\.(querySelector|getElementById|test|match|replace|split|includes|startsWith|endsWith|add|classList)|Error$|String$|Number$)/.test(f)) {
        /* Argumenten zijn geen tekst voor het kind, maar de aanroep zelf kan verder gaan. */
        ts.forEachChild(node.expression, bezoek);
        return;
      }
    }
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && /^(Error|RegExp|Map|Set|Audio|Image)$/.test(node.expression.text)) return;
    if (ts.isPropertyAssignment(node) && node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) && NIET_KIND.has(node.name.text)) return;
    if (ts.isJsxAttribute(node)) {
      const naam = node.name.getText();
      if (!ATTR_TEKST.has(naam) || !node.initializer) return;
      ts.forEachChild(node.initializer, bezoek);
      if (ts.isStringLiteral(node.initializer)) meld(node.initializer, node.initializer.text, true);
      return;
    }
    if (ts.isJsxText(node)) {
      const t = spatie(node.text);
      if (t) meld(node, t, true);
      return;
    }
    if (ts.isBinaryExpression(node) && ["===", "!==", "==", "!=", "&&", "||", "??", "<", ">", "<=", ">="].includes(node.operatorToken.getText(sf))) {
      /* vergelijkingen zijn geen tekst; maar a && "tekst" in JSX wel: dan het rechterdeel bekijken */
      if (node.operatorToken.getText(sf) === "&&" || node.operatorToken.getText(sf) === "||" || node.operatorToken.getText(sf) === "??") {
        bezoek(node.left);
        bezoek(node.right);
      }
      return;
    }
    if (ts.isCaseClause(node)) {
      node.statements.forEach(bezoek);
      return;
    }
    if (ts.isElementAccessExpression(node) || ts.isRegularExpressionLiteral(node)) return;
    const t = ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node) || (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) ? tekstVan(node, sf) : null;
    if (t !== null) {
      /* Vergelijking of sleutel van een object, geen tekst. */
      const p = node.parent;
      if (p && ts.isPropertyAssignment(p) && p.name === node) return;
      if (p && ts.isComputedPropertyName(p)) return;
      if (p && ts.isBinaryExpression(p) && ["===", "!==", "==", "!="].includes(p.operatorToken.getText(sf))) return;
      if (p && ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && /^(startsWith|endsWith|includes|split|replace|match|test)$/.test(p.expression.name.text)) return;
      meld(node, t, !!(p && (ts.isJsxExpression(p) || ts.isJsxAttribute(p))));
      return;
    }
    ts.forEachChild(node, bezoek);
  };
  bezoek(sf);
}

/** Maakt van een sjabloon (met {x}) een zoekpatroon om te zien of de fouttabel dezelfde zin al helemaal laat zien. */
function patroonVan(sjabloon: string): RegExp | null {
  const delen = sjabloon.split(/\{[^}]*\}|\[[^\]]*\]/).map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (delen.join("").length < 12) return null;
  try {
    return new RegExp(delen.join(".{1,40}?"), "i");
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ hoofdprogramma ------------------------------ */

const datum = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });
async function main() {
const klokGeladen = (await import(join(LESSEN, "squla-klok-gouden-zinnen.ts"))) as Record<string, unknown>;

/* A. gedeelde rijtjes */
const gedeeld: { sleutel: string; zin: string; wanneer: string }[] = [];
function rijtjeZinnen(v: unknown, pad: string): { zin: string; pad: string }[] {
  if (typeof v === "string") return [{ zin: v, pad }];
  if (Array.isArray(v)) return v.flatMap((x) => rijtjeZinnen(x, pad));
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.zinnen)) return rijtjeZinnen(o.zinnen, pad);
    return Object.entries(o).flatMap(([k, x]) => rijtjeZinnen(x, pad ? `${pad}: ${k}` : k));
  }
  return [];
}
const MOMENT_UITLEG: Record<string, string> = { drieOpRij: "3 keer op rij goed", moeilijk: "na een moeilijke vraag goed", eerste: "na de 1e vraag goed", laatste: "na de laatste vraag goed" };
const gezien = new Set<string>();
for (const s of GEDEELD) {
  const v = klokGeladen[s];
  if (v === undefined) {
    problemen.push(`Gedeeld rijtje ${s} niet gevonden in squla-klok-gouden-zinnen.ts`);
    continue;
  }
  for (const { zin, pad } of rijtjeZinnen(v, "")) {
    const z = spatie(kaal(zin));
    if (!z || gezien.has(`${s}|${z}`)) continue;
    gezien.add(`${s}|${z}`);
    gedeeld.push({ sleutel: s, zin: z, wanneer: `${GEDEELD_UITLEG[s]}${pad ? ` (${MOMENT_UITLEG[pad] ?? pad})` : ""}` });
  }
}

/* Per les */
type LesUitkomst = { les: LesDef; id: string; zinnen: Zin[]; gebruiktGedeeld: string[]; aantalFouttabel: number; aantalVast: number };
const uitkomsten: LesUitkomst[] = [];
for (const les of LESSEN_LIJST) {
  const zinnenBestand = join(LESSEN, `squla-${les.slug}-gouden-zinnen.ts`);
  const lesBestand = join(LESSEN, `squla-${les.slug}-gouden.tsx`);
  const vlakBestand = join(VLAKKEN, `squla-${les.slug}-gouden-vlak.tsx`);
  const bronnen = [zinnenBestand, lesBestand, vlakBestand].filter(existsSync);
  const lesTekst = existsSync(lesBestand) ? readFileSync(lesBestand, "utf8") : "";
  const id = /const LES_ID = "([^"]+)"/.exec(lesTekst)?.[1] ?? `squla-${les.slug}-gouden`;

  /* B. fouttabel */
  const fout = new Lijst();
  if (fouttabelBestanden[les.slug]) leesFouttabel(fouttabelBestanden[les.slug], fout);
  const foutTekst = [...fout.items.keys()].join(" \n ");

  /* C. vaste tekst */
  const vast = new Lijst();
  const overslaan = new Set<string>(les.slug === "klok" ? [...GEDEELD, "NAAM_GROET", "LOF_KIJK_INDEX", "metNaam", "ONDUIDELIJK_ANDERE", "ONDUIDELIJK_NOG_1_KEER", "AANMOEDIG_KIEST"] : []);
  for (const b of bronnen) vaste(b, vast, overslaan, b.endsWith("-vlak.tsx") || b.endsWith("gouden.tsx"));
  /* Sjablonen die de fouttabel al in alle echte varianten laat zien, niet nog eens als sjabloon. */
  const vastLijst: Zin[] = [];
  for (const z of vast.items.values()) {
    const heeftPlaats = /\[[^\]]*\]/.test(z.zin);
    if (z.zin.length >= 12 && (foutTekst.includes(z.zin) || (heeftPlaats && patroonVan(z.zin)?.test(foutTekst)))) continue;
    vastLijst.push(z);
  }
  const gebruikt = GEDEELD.filter((s) => bronnen.some((b) => new RegExp(`\\b${s}\\b`).test(readFileSync(b, "utf8").replace(/^import[\s\S]*?;\n/gm, ""))));
  /* Vaste tekst eerst, dan fouttabel. */
  const zinnen: Zin[] = [...vastLijst, ...fout.items.values()];
  uitkomsten.push({ les, id, zinnen, gebruiktGedeeld: gebruikt, aantalFouttabel: fout.items.size, aantalVast: vastLijst.length });
}

/* ------------------------------------------------------------------ schrijven ---------------------------------- */

const esc = (z: string) => z.replace(/\|/g, "\\|");
const totaal = uitkomsten.reduce((n, u) => n + u.zinnen.length, 0) + gedeeld.length;
const regels: string[] = [];
regels.push(`# ZINNEN VOOR DE CONTROLE — de 15 nieuwe gouden lessen`);
regels.push("");
regels.push(`Gemaakt op ${datum}, automatisch, met \`npx tsx scripts/zinnen-voor-controle.ts\`. Pas niets in dit bestand aan: verander de zin in de les en maak het bestand opnieuw.`);
regels.push("");
regels.push("**De regels waaraan de zinnen moeten voldoen staan in [REGELS-VOOR-CONTROLEUR.md](REGELS-VOOR-CONTROLEUR.md).** Verwijs in je oordeel naar het nummer van de zin (bijvoorbeeld TELLEN-014).");
regels.push("");
regels.push("## Aantal zinnen");
regels.push("");
regels.push("| Les | Vaste tekst van de les | Zinnen bij een foute poging | Samen |");
regels.push("|---|---|---|---|");
for (const u of uitkomsten) regels.push(`| ${u.les.titel} (${u.id}) | ${u.aantalVast} | ${u.aantalFouttabel} | ${u.zinnen.length} |`);
regels.push(`| ALGEMEEN (gedeelde rijtjes, 1 keer, voor alle lessen) | ${gedeeld.length} | 0 | ${gedeeld.length} |`);
regels.push(`| **Totaal** | ${uitkomsten.reduce((n, u) => n + u.aantalVast, 0) + gedeeld.length} | ${uitkomsten.reduce((n, u) => n + u.aantalFouttabel, 0)} | **${totaal}** |`);
regels.push("");
regels.push("## Zo is dit bestand gemaakt");
regels.push("");
regels.push("- **Nummers:** elke zin heeft een vast nummer per les (TELLEN-001, TELLEN-002, ...). Het nummer hoort bij deze versie van het bestand; na nieuw maken kunnen nummers verschuiven.");
regels.push("- **Eerst de vaste tekst** van de les (begin, vragen, knoppen, bordjes, eindkaart), **dan de zinnen bij een foute poging** (uit de hele fouttabel: elke vraag, elk fout antwoord).");
regels.push("- **Dubbele zinnen** binnen 1 les staan 1 keer, met erbij hoe vaak ze voorkomen.");
regels.push("- **{naam}** is de naam van het kind. Zonder naam valt dat stukje weg. Kleurcodes zijn weggelaten: een getal staat zoals het kind het leest.");
regels.push("- **Sjablonen:** staat er iets tussen blokhaken, zoals [n] of [f.naam], dan wisselt dat per vraag (een getal, een dag, een woord uit de vraag); de zin staat dan 1 keer als sjabloon. Is een zin al helemaal in echte varianten uitgeschreven bij de foute pogingen (de hele fouttabel), dan staan alleen die echte varianten erbij.");
regels.push("- **De gedeelde rijtjes** (lof, naam, einde, aanmoediging, overgang, ...) zijn voor alle 15 lessen gelijk. Ze staan 1 keer onder ALGEMEEN. Per les staat welke rijtjes de les gebruikt.");
regels.push("- **Wat niet in de lijst staat:** zinnen die pas door de computer tijdens het spelen worden samengesteld uit losse stukjes (die staan als sjabloon), tekst in plaatjes, en geluidjes. Zie ook de punten onderaan.");
regels.push("");
regels.push("---");
regels.push("");
regels.push("## ALGEMEEN — gedeelde zinnen (alle lessen)");
regels.push("");
regels.push("| Nr | Zin | Wanneer |");
regels.push("|---|---|---|");
gedeeld.forEach((g, i) => regels.push(`| ALGEMEEN-${String(i + 1).padStart(3, "0")} | ${esc(g.zin)} | ${esc(g.wanneer)} |`));
regels.push("");
for (const u of uitkomsten) {
  regels.push("---");
  regels.push("");
  regels.push(`## ${u.les.titel} (${u.id}) — ${u.zinnen.length} zinnen`);
  regels.push("");
  regels.push(`Gebruikt ook de gedeelde zinnen: ${u.gebruiktGedeeld.length ? u.gebruiktGedeeld.map((s) => `${s} (${GEDEELD_UITLEG[s]})`).join("; ") : "geen"}.`);
  regels.push("");
  regels.push("| Nr | Les | Zin | Wanneer |");
  regels.push("|---|---|---|---|");
  u.zinnen.forEach((z, i) => regels.push(`| ${u.les.prefix}-${String(i + 1).padStart(3, "0")} | ${u.les.titel} | ${esc(z.zin)} | ${esc(z.wanneer)}${z.keer > 1 ? ` — komt ${z.keer} keer voor` : ""} |`));
  regels.push("");
}
if (problemen.length) {
  regels.push("---");
  regels.push("");
  regels.push("## Meldingen bij het maken");
  regels.push("");
  for (const p of problemen) regels.push(`- ${p}`);
  regels.push("");
}
writeFileSync(UIT, regels.join("\n"));
rmSync(tijdelijk, { recursive: true, force: true });

console.log(`ZINNEN-VOOR-CONTROLE.md geschreven: ${totaal} zinnen.`);
for (const u of uitkomsten) console.log(`  ${u.les.titel.padEnd(14)} ${String(u.zinnen.length).padStart(5)} (vast ${u.aantalVast}, foutpogingen ${u.aantalFouttabel})`);
console.log(`  ${"ALGEMEEN".padEnd(14)} ${String(gedeeld.length).padStart(5)}`);
for (const p of problemen) console.log(`MELDING: ${p}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
