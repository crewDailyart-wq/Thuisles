/**
 * De volledige controle van verdergaan en opnieuw doen (BOUWREGELS 15.53), als Testkind, 1 les, 1 Chrome tegelijk:
 *   1. een paar vragen spelen en weggaan   2. het overzicht: rondje half   3. terugkomen: verder, niet vanaf het begin
 *   4. afmaken en op de kaart tikken       5. opnieuw doen: weer bij vraag 1, rondje blijft vol, geen 2e ster of dubbele sleutel
 *
 * Draait ALLEEN op een wegwerpkopie van de database: start de dev-server met THUISLES_DB=<kopie> en geef dezelfde DB mee.
 *   DB=backups/proef.db scripts/een-chrome.sh node scripts/hervat-controle.mjs <lesId>
 */
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const les = process.argv[2];
const DB = process.env.DB;
if (!les || !DB) throw new Error("gebruik: DB=<wegwerpkopie> node scripts/hervat-controle.mjs <lesId>");
if (resolve(DB) === resolve("data/thuisles.db")) throw new Error("niet op de echte database: geef een wegwerpkopie");
const db = new DatabaseSync(DB);
const kind = db.prepare("select id from kinderen where roepnaam = 'Testkind'").get().id;
db.exec("pragma busy_timeout = 5000");
for (const t of ["les_tussenstanden", "les_resultaten", "les_sterren"]) db.prepare(`delete from ${t} where kind_id = ? and les_id = ?`).run(kind, les);
/* De dagteller van uitkomsten (500 per kind) zou een lange testreeks stil laten vallen. Alleen in de wegwerpkopie. */
db.prepare("delete from les_uitkomsten where kind_id = ?").run(kind);

const stand = () => {
  const r = db.prepare("select af, percentage, stand from les_tussenstanden where kind_id = ? and les_id = ?").get(kind, les);
  return r ? { af: r.af, percentage: r.percentage, ids: r.stand ? JSON.parse(r.stand).antwoorden.map((a) => a[0]) : null } : null;
};
const resultaat = () => db.prepare("select percentage, kleur from les_resultaten where kind_id = ? and les_id = ?").get(kind, les);
const sterren = () => db.prepare("select count(*) as n from les_sterren where kind_id = ? and les_id = ?").get(kind, les).n;

function speel(extra) {
  const r = spawnSync("node", ["scripts/speelcontrole.mjs"], { env: { ...process.env, LESSEN: les, GOED: "1", UITLOG: "1", KIND_ID: kind, ...extra }, encoding: "utf8", timeout: 600_000 });
  spawnSync("pkill", ["-f", "--", "--headless=new"]);
  const uit = (r.stdout ?? "") + (r.stderr ?? "");
  const m = /^UITKOMSTEN \S+ (.*)$/m.exec(uit);
  const z = /^ZINNEN \S+ (.*)$/m.exec(uit);
  return { code: r.status, zinnen: z ? JSON.parse(z[1]).join(" | ") : "", ids: m ? JSON.parse(m[1]) : [], regels: uit.split("\n").filter((x) => /^(✓|✗)|✗|F\d+:/.test(x)).slice(0, 6) };
}
/* Het overzicht zoals het kind het ziet (met het koekje van Testkind): hoe vol is het rondje van deze les? */
async function rondje() {
  const html = await fetch("http://localhost:3000/voorbeeld/onderwerpen", { headers: { cookie: `thuisles_kind=${kind}` } }).then((r) => r.text());
  const kaart = new RegExp(`data-kaart="${les}"[^>]*>`).exec(html)?.[0] ?? "";
  return { af: Number(/data-af="(\d+)"/.exec(kaart)?.[1] ?? -1), kleur: /data-kleur="([^"]*)"/.exec(kaart)?.[1] ?? "" };
}
const fouten = [];
const eis = (ok, tekst) => {
  console.log(`${ok ? "ok " : "NEE"} ${tekst}`);
  if (!ok) fouten.push(tekst);
};

const a = speel({ STOPNA: "3" });
const s1 = stand();
eis(a.ids.length >= 3 && s1?.ids?.length >= 3, `1. een paar vragen gespeeld en weggegaan (bewaard: ${s1?.ids?.join(", ")})`);
eis(s1 && s1.af > 0 && s1.af < 100 && !resultaat(), `2. tussenstand voor het rondje: ${s1?.af}% (${s1?.percentage}% goed), nog geen resultaat`);
const o1 = await rondje();
eis(o1.af === s1?.af && o1.kleur !== "", `2. het overzicht toont het rondje voor ${o1.af}% in ${o1.kleur || "geen kleur"}`);

const b = speel({ TIKKAART: "1" });
const dubbel = b.ids.filter((x) => s1?.ids?.includes(x));
eis(b.ids.length > 0 && dubbel.length === 0, `3. verder waar het was: eerste vraag na terugkomen = ${b.ids[0] ?? "geen"}; opnieuw gesteld: ${dubbel.join(", ") || "niets"}`);
const r1 = resultaat();
eis(b.code === 0 && !!r1, `4. afgemaakt en op de kaart getikt (resultaat ${r1?.percentage}% ${r1?.kleur})${b.code ? " " + b.regels.join(" | ") : ""}`);
eis(stand()?.ids === null, "4. stand gesloten na het afmaken");
eis(/waar je was|samen af/i.test(b.zinnen), `3. Bliepo heet welkom terug (${b.zinnen.slice(0, 90)})`);
const o2 = await rondje();
eis(o2.af === 100, `4. na het afmaken is het rondje vol (${o2.af}%, ${o2.kleur})`);
const ster1 = sterren();

const c = speel({ STOPNA: "1" });
const s3 = stand();
eis(c.ids[0] !== undefined && c.ids[0] === a.ids[0], `5. opnieuw doen begint bij het begin (eerste vraag ${c.ids[0]}, de eerste keer ${a.ids[0]})`);
eis(resultaat()?.percentage === r1?.percentage && sterren() === ster1 && s3?.ids?.length >= 1, `5. oud resultaat blijft (${resultaat()?.percentage}%), sterren ${sterren()}, nieuwe stand ${s3?.ids?.length}`);
const o3 = await rondje();
eis(o3.af === 100, `5. tijdens het opnieuw doen blijft het rondje vol (${o3.af}%)`);
eis(/nog 1 keer|al eens|heel goed|ken je al/i.test(c.zinnen), `5. Bliepo zegt dat het kind de les al deed (${c.zinnen.slice(0, 90)})`);

mkdirSync("output/hervat", { recursive: true });
console.log(fouten.length ? `AFGEKEURD ${les}: ${fouten.length} punt(en)` : `GOEDGEKEURD ${les}`);
process.exit(fouten.length ? 1 : 0);
