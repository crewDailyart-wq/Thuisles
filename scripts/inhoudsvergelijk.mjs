// Vergelijkt elke Squla-les met een eerdere stand en meldt wat VERDWIJNT
// (BOUWREGELS 1.25/1.26): minder vragen, minder keuzes/voorwerpen/opties,
// verdwenen Bliepo-zinnen. Toevoegingen worden alleen informatief gemeld.
//
//   npm run inhoudsvergelijk                      (REV=backup-squla~0, werkmap)
//   REV=HEAD node scripts/inhoudsvergelijk.mjs    (werkmap tegen laatste commit)
//   REV=a450dc0 NU=33c6c3d node scripts/inhoudsvergelijk.mjs   (twee commits)
//   --json  geeft JSON-uitvoer.  Exitcode 1 als er iets verdwenen is.
// Bewust weggehaald? Zet een regel met "·" in WEGGEHAALD.md (les-id + tekst).
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAP = "src/components/les/lessen";
const REV = process.env.REV || "backup-squla~0";
const NU = process.env.NU || "";
const JSON_UIT = process.argv.includes("--json");

const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const isLes = (f) => /^squla-.*\.tsx?$/.test(f);

function bestanden(rev) {
  if (!rev) return readdirSync(join(ROOT, MAP)).filter(isLes);
  return git("ls-tree", "--name-only", rev, MAP + "/").split("\n").map((p) => p.split("/").pop()).filter((f) => f && isLes(f));
}
function bron(rev, f) {
  if (!rev) return readFileSync(join(ROOT, MAP, f), "utf8");
  return git("show", `${rev}:${MAP}/${f}`);
}

// ---- vingerafdruk ----
const TEKSTSLEUTELS = new Set(["vraag", "tip", "goedZin", "uitleg", "welkom", "zinnen", "hint", "verhaal", "noem", "reactie"]);
const KEUZESLEUTELS = new Set(["keuzes", "opties", "kaarten", "voorwerpen", "bellen", "kies", "dingen", "losse", "labels", "delen", "zones", "namen", "reserve", "juist", "fout", "vast", "vastDingen", "streepjes", "oplossing"]);
const VRAAGSLEUTELS = new Set(["vragen", "opgaven"]);
const norm = (s) => s.replace(/\s+/g, " ").trim();
const isPad = (s) => /^[MmLlCcZzHhVvQqAaSsTt0-9 .,\-]+$/.test(s);

function nodeTekst(n, sf) {
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
  if (ts.isTemplateExpression(n)) return n.head.text + n.templateSpans.map((s) => "${}" + s.literal.text).join("");
  return null;
}
const regel = (n, sf) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;

function vingerafdruk(code, naam) {
  const sf = ts.createSourceFile(naam, code, ts.ScriptTarget.Latest, true, naam.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const ids = []; // { id, pos, regel }
  const zinnen = []; // { tekst, regel, pos }
  const lijsten = []; // { key, soort, decl, regel, pos, items:[] }
  let objVraag = 0;

  const topNaam = (n) => {
    let p = n;
    while (p.parent && !ts.isSourceFile(p.parent)) p = p.parent;
    if (ts.isVariableStatement(p)) return p.declarationList.declarations[0].name.getText(sf);
    if (ts.isFunctionDeclaration(p) && p.name) return p.name.text;
    return "(bestand)";
  };
  const label = (el) => {
    const t = nodeTekst(el, sf);
    if (t !== null) return norm(t);
    if (ts.isObjectLiteralExpression(el) || ts.isCallExpression(el) || ts.isArrowFunction(el) || ts.isParenthesizedExpression(el)) {
      let eerste = null;
      const zoek = (x) => {
        if (eerste) return;
        const t2 = nodeTekst(x, sf);
        if (t2 !== null && /\s/.test(t2)) { eerste = norm(t2); return; }
        ts.forEachChild(x, zoek);
      };
      zoek(el);
      if (eerste) return eerste.slice(0, 70);
    }
    return norm(el.getText(sf)).slice(0, 70);
  };
  const lijstVan = (arr, key, soort) => {
    lijsten.push({ key, soort, decl: topNaam(arr), regel: regel(arr, sf), pos: arr.getStart(sf), items: arr.elements.map(label) });
  };

  const bezoek = (n) => {
    if (ts.isPropertyAssignment(n)) {
      const k = n.name.getText(sf).replace(/["']/g, "");
      if (k === "id" && ts.isStringLiteral(n.initializer) && n.initializer.text.startsWith("squla-")) ids.push({ id: n.initializer.text, pos: n.getStart(sf), regel: regel(n, sf) });
      if (k === "vraag") objVraag++;
      if (ts.isArrayLiteralExpression(n.initializer)) {
        if (KEUZESLEUTELS.has(k)) lijstVan(n.initializer, k, "keuze");
        else if (VRAAGSLEUTELS.has(k)) lijstVan(n.initializer, k, "vragen");
      }
    }
    if (ts.isVariableDeclaration(n) && n.initializer && ts.isArrayLiteralExpression(n.initializer) && ts.isIdentifier(n.name)) {
      const els = n.initializer.elements;
      if (els.length >= 2 && els.every((e) => ts.isObjectLiteralExpression(e) || ts.isCallExpression(e))) lijstVan(n.initializer, n.name.text, "vragen");
      else if (els.length >= 2 && KEUZESLEUTELS.has(n.name.text)) lijstVan(n.initializer, n.name.text, "keuze");
    }
    const t = nodeTekst(n, sf);
    if (t !== null && !ts.isImportDeclaration(n.parent) && !ts.isExternalModuleReference(n.parent)) {
      const s = norm(t);
      if (s.length >= 4 && /[A-Za-zÀ-ÿ]/.test(s) && /\s/.test(s) && !isPad(s) && !/^(rgba?|hsla?|translate|scale|linear-gradient)\(/.test(s) && !/^[a-z-]+(\s+[a-z-]+)*$/.test(s) === false || (s.length >= 4 && /\s/.test(s) && /[A-Za-zÀ-ÿ]/.test(s) && !isPad(s) && !/^(rgba?|hsla?|translate|scale)\(/.test(s) && /[.!?,]|^[A-ZÀ-Ý]/.test(s)))
        zinnen.push({ tekst: s, regel: regel(n, sf), pos: n.getStart(sf) });
    }
    ts.forEachChild(n, bezoek);
  };
  bezoek(sf);
  ids.sort((a, b) => a.pos - b.pos);
  return { ids, zinnen, lijsten, objVraag };
}

// les-id bij een positie: de eerstvolgende id erna (opgaven staan boven hun les)
function lesBij(fp, pos) {
  const na = fp.ids.find((i) => i.pos >= pos);
  return (na || fp.ids[fp.ids.length - 1] || { id: "(geen les-id)" }).id;
}

// ---- vergelijken ----
const telMap = (arr) => { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; };
const isGetal = (s) => /^-?\d+([.,]\d+)?$/.test(s);

function vergelijkBestand(oud, nu) {
  const meld = []; // verdwenen
  const info = []; // toegevoegd / gewijzigd
  // lessen
  const nuIds = new Set(nu.ids.map((i) => i.id));
  for (const i of oud.ids) if (!nuIds.has(i.id)) meld.push({ soort: "les", les: i.id, regel: i.regel, tekst: i.id, uitleg: "les-id staat er niet meer in" });
  const oudIds = new Set(oud.ids.map((i) => i.id));
  for (const i of nu.ids) if (!oudIds.has(i.id)) info.push({ soort: "les-erbij", les: i.id, regel: i.regel, tekst: i.id });

  // zinnen als multiset
  const nuZ = telMap(nu.zinnen.map((z) => z.tekst));
  const gebruikt = new Map();
  for (const z of oud.zinnen) {
    const nodig = (gebruikt.get(z.tekst) || 0) + 1;
    gebruikt.set(z.tekst, nodig);
    if ((nuZ.get(z.tekst) || 0) < nodig) meld.push({ soort: "zin", les: lesBij(oud, z.pos), regel: z.regel, tekst: z.tekst, uitleg: "zin of tekst is verdwenen" });
  }
  const oudZ = telMap(oud.zinnen.map((z) => z.tekst));
  const gebruikt2 = new Map();
  for (const z of nu.zinnen) {
    const nodig = (gebruikt2.get(z.tekst) || 0) + 1;
    gebruikt2.set(z.tekst, nodig);
    if ((oudZ.get(z.tekst) || 0) < nodig) info.push({ soort: "zin-erbij", les: lesBij(nu, z.pos), regel: z.regel, tekst: z.tekst });
  }
  if (nu.objVraag < oud.objVraag) meld.push({ soort: "vragen", les: "(hele bestand)", regel: 0, tekst: `${oud.objVraag} -> ${nu.objVraag}`, uitleg: `aantal vraag-onderdelen in dit bestand ging van ${oud.objVraag} naar ${nu.objVraag}` });

  // lijsten: koppel oud -> nieuw (zelfde sleutel, meeste overlap)
  const vrij = nu.lijsten.map((l, i) => ({ ...l, i, bezet: false }));
  const score = (a, b) => {
    const m = telMap(b.items); let s = 0;
    for (const x of a.items) { const c = m.get(x) || 0; if (c > 0) { s++; m.set(x, c - 1); } }
    return s + (a.decl === b.decl ? 0.5 : 0) + (a.items.length === b.items.length ? 0.1 : 0);
  };
  const paren = [];
  for (const a of oud.lijsten) {
    let best = null, bs = -1;
    for (const b of vrij) {
      if (b.bezet || b.key !== a.key || b.soort !== a.soort) continue;
      const s = score(a, b);
      if (s > bs) { bs = s; best = b; }
    }
    if (best && (bs >= 0.5 || a.items.length === 0)) { best.bezet = true; paren.push([a, best]); }
    else paren.push([a, null]);
  }
  for (const [a, b] of paren) {
    const les = lesBij(oud, a.pos);
    const wat = `${a.key} in ${a.decl}`;
    if (!b) { meld.push({ soort: a.soort === "vragen" ? "vragen" : "keuzes", les, regel: a.regel, tekst: `${a.key} [${a.items.length}]`, uitleg: `hele lijst ${wat} is verdwenen (${a.items.length} stuks)` }); continue; }
    if (b.items.length < a.items.length) meld.push({ soort: a.soort === "vragen" ? "vragen" : "keuzes", les, regel: a.regel, tekst: `${a.key}: ${a.items.length} -> ${b.items.length}`, uitleg: `${a.soort === "vragen" ? "minder vragen" : "minder keuzes"} in ${wat}: ${a.items.length} -> ${b.items.length} (nu regel ${b.regel})` });
    if (a.soort === "keuze") {
      const m = telMap(b.items);
      for (const x of a.items) {
        const c = m.get(x) || 0;
        if (c > 0) { m.set(x, c - 1); continue; }
        if (isGetal(x) && b.items.length >= a.items.length) { info.push({ soort: "waarde-gewijzigd", les, regel: a.regel, tekst: x }); continue; }
        meld.push({ soort: "keuze-weg", les, regel: a.regel, tekst: x, uitleg: `keuze/voorwerp weg uit ${wat}` });
      }
    }
    if (b.items.length > a.items.length) info.push({ soort: "meer-in-lijst", les, regel: b.regel, tekst: `${b.key}: ${a.items.length} -> ${b.items.length} in ${b.decl}` });
  }
  return { meld, info };
}

// ---- WEGGEHAALD.md ----
function leesWeggehaald() {
  const p = join(ROOT, "WEGGEHAALD.md");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").filter((r) => r.includes("·")).map((r) => r.toLowerCase());
}
const weggehaald = leesWeggehaald();
function bewust(f, lesIds) {
  const t = f.tekst.toLowerCase();
  const woorden = (t.match(/[a-zà-ÿ]{5,}/g) || []);
  return weggehaald.some((r) => {
    if (!lesIds.some((id) => r.includes(id.toLowerCase()))) return false;
    if (r.includes(t.slice(0, 40))) return true;
    return t.length < 25 && woorden.some((w) => r.includes(w)) || (t.length <= 12 && r.includes(t));
  });
}

// ---- uitvoeren ----
const oudLijst = bestanden(REV);
const nuLijst = bestanden(NU);
const uitkomst = { rev: REV, nu: NU || "werkmap", bestanden: {}, verdwenen: 0, bewust: 0, toegevoegd: 0 };
for (const f of oudLijst) {
  let oud;
  try { oud = vingerafdruk(bron(REV, f), f); } catch { continue; }
  if (!nuLijst.includes(f)) {
    uitkomst.bestanden[f] = { meld: [{ soort: "bestand", les: oud.ids[0]?.id || f, regel: 0, tekst: f, uitleg: "heel bestand is verdwenen" }], info: [] };
    continue;
  }
  const nu = vingerafdruk(bron(NU, f), f);
  const r = vergelijkBestand(oud, nu);
  const lesIds = [...new Set([...oud.ids, ...nu.ids].map((i) => i.id))];
  for (const m of r.meld) if (bewust(m, [m.les, ...lesIds])) m.bewust = true;
  uitkomst.bestanden[f] = r;
}
for (const f of nuLijst) if (!oudLijst.includes(f)) uitkomst.bestanden[f] = { meld: [], info: [{ soort: "bestand-erbij", les: f, regel: 0, tekst: f }] };
for (const r of Object.values(uitkomst.bestanden)) {
  uitkomst.verdwenen += r.meld.filter((m) => !m.bewust).length;
  uitkomst.bewust += r.meld.filter((m) => m.bewust).length;
  uitkomst.toegevoegd += r.info.length;
}

if (JSON_UIT) {
  console.log(JSON.stringify(uitkomst, null, 2));
} else {
  console.log(`Inhoudsvergelijking Squla-lessen: ${REV} -> ${NU || "werkmap"}`);
  for (const [f, r] of Object.entries(uitkomst.bestanden)) {
    const echt = r.meld.filter((m) => !m.bewust), bew = r.meld.filter((m) => m.bewust);
    if (!echt.length && !bew.length) continue;
    console.log(`\n${f}`);
    for (const m of echt) console.log(`  VERDWENEN  [${m.les}] regel ${m.regel}: ${m.uitleg || m.soort} -- "${m.tekst.slice(0, 80)}"`);
    for (const m of bew) console.log(`  bewust weggehaald, in WEGGEHAALD.md  [${m.les}] regel ${m.regel}: "${m.tekst.slice(0, 80)}"`);
  }
  if (process.env.INFO || process.argv.includes("--info")) {
    console.log("\nToegevoegd of gewijzigd (informatief):");
    for (const [f, r] of Object.entries(uitkomst.bestanden)) for (const i of r.info) console.log(`  ${f} [${i.les}] r${i.regel} ${i.soort}: ${String(i.tekst).slice(0, 80)}`);
  }
  console.log(`\nTotaal: ${uitkomst.verdwenen} verdwenen, ${uitkomst.bewust} bewust weggehaald (WEGGEHAALD.md), ${uitkomst.toegevoegd} toegevoegd/gewijzigd (alleen info; --info toont ze).`);
  console.log(uitkomst.verdwenen ? "FOUT: er is iets verdwenen. Zet het terug, of zet het met reden in WEGGEHAALD.md (BOUWREGELS 1.25/1.26)." : "OK: er is niets verdwenen.");
}
process.exit(uitkomst.verdwenen ? 1 : 0);
