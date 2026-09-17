/** Rekenkundige controles in geheugen. Geen database of opgeslagen testvragen. */
import assert from "node:assert/strict";
import { bosGeneratoren } from "../src/lib/generatoren/bosspellen.ts";
import { BOSONTWERPEN } from "../src/lib/generatoren/bosspellen-catalogus.ts";
import { isGoed } from "../src/lib/antwoord.ts";
import { controleerUitleg } from "../src/lib/generatoren/uitlegscript.ts";
import { controleerPatronen } from "../src/lib/generatoren/foutpatroon.ts";

assert.equal(bosGeneratoren.length, 22);
assert.equal(new Set(bosGeneratoren.map((g) => g.id)).size, 22);
let gecontroleerd = 0;
for (const g of bosGeneratoren) {
  const ontwerp = BOSONTWERPEN.find((o) => o.id === g.id);
  assert.deepEqual(controleerPatronen(g.foutpatronen), [], g.id);
  for (const tot of [5, 10, 20, -10, 999]) {
    const inst = { ...g.standaard, tot };
    const gebruikt = new Set();
    const vragen = g.maak(inst, 35, gebruikt, 741, 4);
    assert.ok(vragen.length > 0, g.id);
    assert.deepEqual(vragen, g.maak(inst, 35, new Set(), 741, 4), "Zaad moet voorspelbaar zijn");
    const volgende = g.maak(inst, 35, gebruikt, 845, 4);
    assert.equal(new Set([...vragen, ...volgende].map((v) => v.handtekening)).size, vragen.length + volgende.length, "Geen dubbele vragen");
    for (const q of vragen) {
      const f = q.figuur;
      const bereik = q.somgegevens.extra.tot;
      assert.ok(f.getallen.every((n) => Number.isInteger(n) && n >= 0 && n <= bereik));
      let juist;
      if (f.modus === "rij") {
        assert.ok(f.leeg.length && f.leeg.length < f.getallen.length);
        f.getallen.slice(1).forEach((n, i) => assert.equal(n - f.getallen[i], ontwerp.sprong));
        juist = f.leeg.map((i) => f.getallen[i]);
      } else if (f.modus === "ordenen") {
        assert.equal(new Set(f.getallen).size, f.getallen.length);
        juist = [...f.getallen].sort((a, b) => ontwerp.richting === "omlaag" ? b - a : a - b);
      } else if (f.modus === "kiezen") juist = [f.stap === 1 ? Math.max(...f.getallen) : Math.min(...f.getallen)];
      else juist = [ontwerp.meerMinder ? f.doel + f.stap : f.doel - f.weg];
      assert.equal(q.antwoord, juist.join(","), g.id);
      assert.ok(isGoed(q, q.antwoord));
      assert.ok(!isGoed(q, ""));
      assert.ok(!isGoed(q, "999"));
      if (juist.length > 1) {
        assert.ok(!isGoed(q, String(juist[0])));
        assert.ok(!isGoed(q, [...juist].reverse().join(",")));
      }
      if (f.keuzes.length) {
        assert.equal(new Set(f.keuzes).size, f.keuzes.length);
        assert.equal(f.keuzes.filter((n) => n === juist[0]).length, 1);
        assert.ok(f.keuzes.every((n) => n >= 0 && n <= bereik));
      }
      assert.deepEqual(controleerUitleg(g.uitleganimatie, q.somgegevens), [], g.id);
      assert.ok(g.aanpak.stappen(q.somgegevens).length);
      gecontroleerd++;
    }
  }
}
console.log(`Bosspellen: ${bosGeneratoren.length} generators, ${gecontroleerd} opgaven gecontroleerd; antwoorden, grenzen, unieke varianten en uitleg voor groep 3–8 kloppen.`);
