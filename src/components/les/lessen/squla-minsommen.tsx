/**
 * Lessen "Minsommen" naar Squla groep 3 Rekenen (30 oktober 2026, opdracht
 * eigenaar). Per Squla-oefening per level één les; elke les volgt hoe dat level
 * bij Squla is opgebouwd (zelfde soorten vragen in dezelfde volgorde, dezelfde
 * getallenreeks), met eigen getallen, eigen zinnen en eigen tekeningen. De
 * analyse staat in SQULA-ANALYSE/minsommen-*-volledig.md.
 *
 *   Minsommen, onderwater (16055)   squla-min-zee-1/2/3        hologrammen in de zee
 *   Bussommen 1 (7275)              squla-min-bus1-1/2/3       platte 2D-bus
 *   Bussommen 2 (7276)              squla-min-bus2-1/2/3       platte 2D-bus, rood rondje
 *   Minsommen (6919)                squla-min-machine-1/2/3/4  platte 2D: machine, bord, bakjes, geld
 *   Kale sommen (7277)              squla-min-kaal-1/2/3       platte 2D: schoolbord
 *
 * Keuzes van de hoofdagent (vooraf genoteerd):
 *  - Bij de bus klopt het beeld altijd met het verhaal: eerst zitten alle
 *    kinderen in de bus, wie uitstapt staat daarna buiten (of: een rood rondje
 *    met het getal, bij Bussommen 2); de rest blijft in de bus.
 *  - Luistervragen: Bliepo zegt de keuzes en ze staan als knop.
 *  - Bubbelspel en disco: alleen de vraag (tik de sommen met uitkomst 0 aan;
 *    kies het antwoord), zonder tijdsdruk of levens, zonder bonusspel.
 *  - Geld: alleen de officiële plaatjes uit public/geld/.
 *  - Over het tiental: de uitleg van Squla bij Minsommen level 3, "eerst terug
 *    naar 10, dan de rest eraf", is de basis van Bliepo's uitleg (samen), in
 *    beeld: eerst worden de dieren (of stippen) onder de tien grijs, dan de rest.
 *
 * De hulp is de vaste hulp van Bliepo (squla-hulp.ts). Squla laat bij een fout
 * alleen de som zien; Bliepo laat het in beeld zien: wat eraf gaat, wordt grijs
 * en half doorzichtig (ONTWERPREGELS.md, aftreksommen), en het kind telt zelf
 * wat er over is. Bliepo zegt het antwoord nooit voor.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { squlaBegin, squlaEind, squlaVraag } from "./squla-hulp";
import { KaartMinsommen, SqulaMinVlak, type Bakje, type Dier, type Eter, type Geld, type MinVlakProps, type Speelgoed, type Toneel } from "../vlakken/squla-minsommen-vlak";
import { DIER } from "../vlakken/squla-minsommen-tekenen";

/* =====================================================================
   Woorden
   ===================================================================== */

/** Een getal in de zin, in een kleur ({6:geel}). */
const g = (n: number, k = "wit") => `{${n}:${k}}`;
/** "7 − 4" in de zin (wit). */
const somZin = (a: number, b: number, k = "wit") => `${g(a, k)} − ${g(b, k)}`;
/** Een som als knop of in beeld. */
const somTekst = (a: number, b: number, teken: "−" | "+" = "−") => `${a} ${teken} ${b} = ${teken === "−" ? a - b : a + b}`;

/** Hoe de dieren in de zee bewegen (meervoud, enkelvoud). */
const ZEE: Record<Dier, { waar: string; weg: string; wegEen: string }> = {
  visje: { waar: "Er zwemmen {a} visjes in de zee.", weg: "{b} visjes zwemmen weg.", wegEen: "{b} visje zwemt weg." },
  kwal: { waar: "Er zwemmen {a} kwallen in de zee.", weg: "{b} kwallen zwemmen weg.", wegEen: "{b} kwal zwemt weg." },
  krab: { waar: "Er lopen {a} krabben op de bodem.", weg: "{b} krabben kruipen in het zand.", wegEen: "{b} krab kruipt in het zand." },
  zeepaardje: { waar: "Er zwemmen {a} zeepaardjes in de zee.", weg: "{b} zeepaardjes zwemmen weg.", wegEen: "{b} zeepaardje zwemt weg." },
  schildpad: { waar: "Er zwemmen {a} schildpadden in de zee.", weg: "{b} schildpadden zwemmen naar het strand.", wegEen: "{b} schildpad zwemt naar het strand." },
  zeester: { waar: "Er liggen {a} zeesterren op de bodem.", weg: "{b} zeesterren kruipen weg.", wegEen: "{b} zeester kruipt weg." },
  dolfijn: { waar: "Er zwemmen {a} dolfijnen in de zee.", weg: "{b} dolfijnen zwemmen weg.", wegEen: "{b} dolfijn zwemt weg." },
};
const ETERNAAM: Record<Eter, string> = { walvis: "De walvis", inktvis: "De inktvis" };

const vul = (zin: string, a: number, b: number, k: string) => zin.replace("{a}", g(a, k)).replace("{b}", g(b, k));

/** Het verhaaltje in de zee: wie er zijn, wat er weggaat. */
function zeeVerhaal(dier: Dier, a: number, b: number, eter?: Eter | null): string[] {
  const z = ZEE[dier];
  const k = DIER[dier].kleur;
  const eerste = vul(z.waar, a, b, k);
  if (!eter) return [eerste, vul(b === 1 ? z.wegEen : z.weg, a, b, k)];
  if (b === a) return [eerste, `${ETERNAAM[eter]} eet ze allemaal op.`];
  if (b === 0) return [eerste, `${ETERNAAM[eter]} eet er geen één op.`];
  return [eerste, `${ETERNAAM[eter]} eet er ${g(b, k)} op.`];
}
const hoeveelOver = (dier: Dier) => `Hoeveel ${DIER[dier].veel} blijven er over?`;

const SPEELGOED: Record<Speelgoed, string> = { ijsje: "het ijsje", bal: "de bal", boek: "het boek", ballon: "de ballon", vlieger: "de vlieger" };
const BAKJE: Record<Bakje, { veel: string }> = { beker: { veel: "bekers" }, bordje: { veel: "bordjes" } };
const hoofd = (z: string) => z[0].toUpperCase() + z.slice(1);

/* =====================================================================
   Vragen
   ===================================================================== */

type SomKeuze = [number, number, ("−" | "+")?];

type Vraag =
  /* Minsommen (onderwater) */
  | { t: "verhaal"; dier: Dier; a: number; b: number; keuzes: number[]; eter?: Eter }
  | { t: "kaal"; dier?: Dier; deco?: Dier | Eter; a: number; b: number; keuzes: number[] }
  | { t: "welke"; dier: Dier; a: number; b: number; eter?: Eter; keuzes: SomKeuze[] }
  | { t: "disco"; a: number; b: number; keuzes: number[]; luister?: boolean }
  | { t: "luister"; dier: Dier; a: number; b: number; keuzes: number[] }
  | { t: "typen"; a: number; b: number; deco?: Dier | Eter }
  | { t: "verbind"; sommen: [number, number][]; uitkomsten: number[] }
  | { t: "bubbels"; sommen: [number, number][] }
  /* Bussommen */
  | { t: "bus"; a: number; b: number; keuzes?: number[]; rondje: boolean }
  /* Minsommen (machine) en kale sommen */
  | { t: "machine"; b: number; keuzes: number[] }
  | { t: "bord"; a: number; b: number; keuzes?: number[] }
  | { t: "bakjes"; ding: Bakje; vol: number; leeg: number; keuzes: SomKeuze[] }
  | { t: "geld"; heb: Geld[]; prijs: Geld[]; ding: Speelgoed; keuzes: number[] };

type Stand = { huidig: string; nr: number; goed: number; fout: number; typUitgelegd: boolean; verbindKeer: number; bubbelKeer: number };

const zet = (l: Lesgids, p: Partial<MinVlakProps>) => l.pasVlakAan<MinVlakProps>(p);
const LEEG: Partial<MinVlakProps> = { som: null, grijs: 0, licht: null, stippen: null, uitkomst: null };

/** Een toneel in beeld zetten (nieuw: Bliepo tovert het tevoorschijn; zelfde: alleen de hulp weghalen). */
function toon(l: Lesgids, st: Stand, t: Toneel, extra: Partial<MinVlakProps> = {}) {
  /* Zelfde vraag (nog een keer, of na de uitleg): de hulp in beeld blijft staan. */
  if (st.huidig === t.id) return;
  st.huidig = t.id;
  zet(l, { toneel: t, ...LEEG, verbind: null, bubbels: null, ...extra });
  speelLesgeluid("verschijn");
}

const goedBeeld = (l: Lesgids, st: Stand, extra: Partial<MinVlakProps> = {}) => zet(l, { goed: ++st.goed, licht: null, ...extra });
const foutBeeld = (l: Lesgids, st: Stand) => zet(l, { fout: ++st.fout });

/** Kiezen uit getallen. */
async function kiesGetal(l: Lesgids, keuzes: number[]) {
  return Number(await l.kies(keuzes.map(String), { weetniet: false, direct: true }));
}

/** Een getal typen (echt invoerveld, HARDE REGEL 5). De eerste keer wijst Bliepo het vinkje aan. */
async function typGetal(l: Lesgids, st: Stand, tip: string[]): Promise<number> {
  const p = l.getal();
  if (!st.typUitgelegd) {
    st.typUitgelegd = true;
    await l.wijsAan("controleer", "Typ het getal.", "Tik dan op het vinkje.");
  }
  let x = await p;
  while (x === null) {
    await l.zeg("Geen probleem.", ...tip);
    x = await l.getal();
  }
  return x;
}

/* ---------- Bliepo's uitleg in beeld: wat eraf gaat wordt grijs ---------- */

type Beeld = "zee" | "bus" | "stippen";

/** Over het tiental terug (12 − 4, 15 − 8): eerst terug naar 10, dan de rest. */
const overTien = (a: number, b: number) => a > 10 && b > 0 && b < a && a - b < 10;

/** Tip na de uitleg (zonder het antwoord). */
function rekenTip(a: number, b: number, wat: string): string[] {
  if (overTien(a, b)) return [`Eerst terug naar ${g(10)}.`, b - (a - 10) === 1 ? `Dan gaat er nog ${g(1)} af.` : `Dan gaan er nog ${g(b - (a - 10))} af.`];
  return [telZin(wat)];
}

/** "Tel de visjes die over zijn."; bij de bus: "Tel de kinderen die nog in de bus zitten." */
const telZin = (wat: string) => (wat === "kinderen in de bus" ? "Tel de kinderen die nog in de bus zitten." : `Tel de ${wat} die over zijn.`);

/**
 * Samen uitrekenen: Bliepo laat zien wat er eraf gaat (grijs), bij een som over
 * het tiental eerst terug naar 10 en dan de rest. Het kind telt zelf wat er over
 * is. `k` = de kleur van de getallen.
 */
async function samenRekenen(l: Lesgids, a: number, b: number, beeld: Beeld, k: string, wat: string) {
  const stip = (grijs: number) => (beeld === "stippen" ? zet(l, { stippen: { n: a, grijs } }) : zet(l, { grijs }));
  /* "Er gaan er 3 af", "Er gaat er 1 af"; bij de bus "stappen uit". */
  const gaan = (n: number) => (beeld === "bus" ? (n === 1 ? "stapt" : "stappen") : n === 1 ? "gaat" : "gaan");
  const af = beeld === "bus" ? "uit" : "af";
  stip(0);
  zet(l, { licht: beeld === "stippen" ? null : "alle" });
  if (beeld === "bus") await l.zeg(`Er zaten ${g(a, k)} kinderen in de bus.`);
  else if (beeld === "zee") await l.zeg(`Eerst waren er ${g(a, k)} ${wat}.`);
  else await l.zeg(`Ik zet ${g(a, k)} stippen neer.`);
  zet(l, { licht: null });
  if (b === 0) {
    await l.zeg(beeld === "bus" ? "Er stapt niemand uit." : "Er gaat niets af.");
  } else if (overTien(a, b)) {
    const r1 = a - 10;
    const r2 = b - r1;
    await l.zeg(`Er ${gaan(b)} er ${g(b, k)} ${af}.`, `Eerst ${gaan(r1)} er ${g(r1, k)} ${af}.`);
    stip(r1);
    await l.wacht(r1 * 260 + 300);
    await l.zeg(beeld === "bus" ? `Dan zitten er nog ${g(10, k)} in.` : `Dan zijn er nog ${g(10, k)}.`, `Daarna ${gaan(r2)} er nog ${g(r2, k)} ${af}.`);
    stip(b);
    await l.wacht(r2 * 260 + 300);
  } else {
    await l.zeg(b === a && beeld !== "bus" ? `Ze gaan er alle ${g(b, k)} af.` : `Er ${gaan(b)} er ${g(b, k)} ${af}.`);
    stip(b);
    await l.wacht(Math.min(b, 10) * 260 + 300);
  }
  if (beeld !== "stippen") zet(l, { licht: "over" });
  await l.zeg(b === a ? "Wat blijft er dan over?" : telZin(wat));
}

/* ---------- de vragen zelf ---------- */

function zeeToneel(st: Stand, dier: Dier, n: number, eter?: Eter | null): Toneel {
  return { soort: "zee", id: `zee-${st.nr}`, dier, n, eter: eter ?? null };
}

async function speelVraag(l: Lesgids, v: Vraag, st: Stand): Promise<boolean> {
  st.nr++;
  const id = `v${st.nr}`;

  /* Verhaaltje in de zee (met de som in het plaatje), of een kale som naast de dieren. */
  if (v.t === "verhaal" || v.t === "kaal" || v.t === "luister") {
    const u = v.a - v.b;
    const dier = v.dier;
    const k = dier ? DIER[dier].kleur : "wit";
    const toneel: Toneel = dier ? zeeToneel(st, dier, v.a) : { soort: "som", id, deco: v.t === "kaal" ? (v.deco ?? null) : null };
    const somInBeeld = v.t === "verhaal" ? `${v.a} − ${v.b}` : v.t === "kaal" ? `${v.a} − ${v.b} = ?` : null;
    const vraag =
      v.t === "kaal"
        ? [`Hoeveel is ${somZin(v.a, v.b)}?`]
        : v.t === "verhaal"
          ? [...zeeVerhaal(v.dier, v.a, v.b), hoeveelOver(v.dier)]
          : [...zeeVerhaal(v.dier, v.a, v.b), hoeveelOver(v.dier), `Is het ${v.keuzes.slice(0, -1).map((n) => g(n, k)).join(", ")} of ${g(v.keuzes[v.keuzes.length - 1], k)}?`];
    const wat = dier ? DIER[dier].veel : "stippen";
    return squlaVraag<number>(l, {
      toon: () => toon(l, st, toneel, { som: somInBeeld }),
      vraag,
      antwoord: () => kiesGetal(l, v.keuzes),
      isGoed: (x) => x === u,
      noem: (x) => g(x, k),
      goed: async () => {
        goedBeeld(l, st, { som: `${v.a} − ${v.b} = ${u}`, grijs: v.b });
        if (dier && v.t !== "kaal") await l.zeg(`Ja! Er blijven ${g(u, k)} ${DIER[dier].veel} over.`);
        else await l.zeg(`Ja! ${somZin(v.a, v.b, k)} = ${g(u, k)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => samenRekenen(l, v.a, v.b, dier ? "zee" : "stippen", k, wat),
      tip: rekenTip(v.a, v.b, wat),
      testAntwoord: u,
    });
  }

  /* Welke som hoort bij het verhaaltje? */
  if (v.t === "welke") {
    const u = v.a - v.b;
    const k = DIER[v.dier].kleur;
    const goed = somTekst(v.a, v.b);
    const toneel = zeeToneel(st, v.dier, v.a, v.eter);
    const verhaal = zeeVerhaal(v.dier, v.a, v.b, v.eter);
    return squlaVraag<string>(l, {
      toon: () => toon(l, st, toneel),
      vraag: [...verhaal, hoeveelOver(v.dier), "Welke som hoort hierbij?"],
      antwoord: async () => (await l.kies(v.keuzes.map(([a, b, t]) => somTekst(a, b, t)), { weetniet: false, direct: true })) ?? "",
      isGoed: (x) => x === goed,
      noem: (x) => x,
      goed: async () => {
        goedBeeld(l, st, { som: goed, grijs: v.b });
        await l.zeg(`Ja! ${somZin(v.a, v.b, k)} = ${g(u, k)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { grijs: 0, licht: "alle" });
        await l.zeg(`Eerst waren er ${g(v.a, k)} ${DIER[v.dier].veel}.`, "Dat getal komt vooraan in de som.");
        zet(l, { licht: null, grijs: v.b });
        if (v.keuzes.some(([, , t]) => t === "+")) await l.zeg("Er gaan er een paar weg.", "Dus het is een minsom.");
        await l.wacht(Math.min(v.b, 10) * 260 + 300);
        zet(l, { licht: "eraf" });
        if (v.b === 0) await l.zeg("Er gaat er niet één weg.", `Dus na de min komt ${g(0, k)}.`);
        else await l.zeg(v.b === v.a ? `Ze gaan alle ${g(v.b, k)} weg.` : `Er gaan er ${g(v.b, k)} weg.`, "Dat getal komt na de min.");
        zet(l, { licht: "over" });
        await l.zeg("Wat overblijft, komt achter het is-teken.");
      },
      tip: ["Vooraan staat hoeveel er eerst waren.", "Na de min staat hoeveel er weggaan."],
      testAntwoord: goed,
    });
  }

  /* Een kale som: disco (kiezen) of typen; de som staat groot in beeld, of wordt alleen gezegd. */
  if (v.t === "disco" || v.t === "typen") {
    const u = v.a - v.b;
    const luister = v.t === "disco" && v.luister;
    const toneel: Toneel = { soort: "som", id, deco: luister ? "luister" : v.t === "typen" ? (v.deco ?? null) : null };
    const somInBeeld = luister ? null : `${v.a} − ${v.b} = ?`;
    const tip = rekenTip(v.a, v.b, "stippen");
    return squlaVraag<number>(l, {
      toon: () => toon(l, st, toneel, { som: somInBeeld }),
      vraag: luister ? ["Luister goed.", `Hoeveel is ${somZin(v.a, v.b)}?`] : v.t === "typen" ? [`Hoeveel is ${somZin(v.a, v.b)}?`, "Typ het getal."] : [`Hoeveel is ${somZin(v.a, v.b)}?`],
      antwoord: () => (v.t === "typen" ? typGetal(l, st, tip) : kiesGetal(l, v.keuzes)),
      isGoed: (x) => x === u,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { som: `${v.a} − ${v.b} = ${u}` });
        await l.zeg(`Ja! ${somZin(v.a, v.b)} = ${g(u)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        if (luister) zet(l, { som: `${v.a} − ${v.b} = ?` });
        await samenRekenen(l, v.a, v.b, "stippen", "wit", "stippen");
      },
      tip,
      testAntwoord: u,
    });
  }

  /* Verbinden: drie sommen met visjes, drie antwoorden. */
  if (v.t === "verbind") {
    const correct = v.sommen.map(([a, b]) => v.uitkomsten.indexOf(a - b));
    const toneel: Toneel = { soort: "verbind", id, sommen: v.sommen, uitkomsten: v.uitkomsten };
    let vast: (number | null)[] = [null, null, null];
    let laatsteFout = 0;
    /* De hulp van Bliepo: op één kaartje worden visjes grijs (blijft staan tot het goed is). */
    let hint: { kaart: number; n: number } | null = null;
    const stand = (actief: boolean, goed = false) => zet(l, { verbind: { actief, vast, keer: st.verbindKeer, goed, kaartGrijs: hint } });
    return squlaVraag<(number | null)[]>(l, {
      toon: () => {
        if (st.huidig !== id) {
          st.huidig = id;
          zet(l, { toneel, ...LEEG, bubbels: null, verbind: { actief: false, vast, keer: st.verbindKeer } });
          speelLesgeluid("verschijn");
        }
      },
      vraag: ["Verbind elke som met het goede antwoord.", "Tik op een som en dan op het antwoord."],
      antwoord: async () => {
        stand(true);
        const gb = await l.wachtOpVlak<{ soort: string; paren: (number | null)[] }>("verbonden");
        return gb.paren;
      },
      isGoed: (x) => x.every((j, i) => j === correct[i]),
      noem: (x) => {
        const i = x.findIndex((j, k) => j !== correct[k]);
        laatsteFout = Math.max(0, i);
        const [a, b] = v.sommen[laatsteFout];
        const j = x[laatsteFout];
        return `${somZin(a, b)} = ${g(j === null ? 0 : v.uitkomsten[j])}`;
      },
      goed: async () => {
        vast = [...correct];
        hint = null;
        stand(false, true);
        goedBeeld(l, st);
        await l.zeg("Ja! Alle sommen kloppen.");
        await l.wacht(400);
      },
      fout: (x) => {
        /* De goede lijnen blijven staan; de foute gaan weg. */
        vast = x.map((j, i) => (j === correct[i] ? j : null));
        st.verbindKeer++;
        stand(false);
        foutBeeld(l, st);
      },
      samen: async () => {
        const [a, b] = v.sommen[laatsteFout];
        hint = null;
        stand(false);
        await l.zeg(`Kijk naar ${somZin(a, b)}.`, `Op dat kaartje zwemmen ${g(a, "geel")} visjes.`);
        hint = { kaart: laatsteFout, n: b };
        stand(false);
        await l.zeg(`Er gaan er ${g(b, "geel")} af.`, "Tel de visjes die over zijn.", "Zoek dat getal rechts.");
      },
      tip: ["Tel de visjes die niet grijs zijn."],
      testAntwoord: null,
    });
  }

  /* Bubbels: tik de sommen waar 0 uitkomt (zonder tijdsdruk). Elke bubbel is een opgave. */
  if (v.t === "bubbels") {
    const nul = v.sommen.map(([a, b], i) => (a === b ? i : -1)).filter((i) => i >= 0);
    const weg: number[] = [];
    const toneel: Toneel = { soort: "bubbels", id, sommen: v.sommen };
    const bubbelStand = (actief: boolean, fout: { i: number; keer: number } | null = null) => zet(l, { bubbels: { actief, weg: [...weg], fout } });
    let allesGoed = true;
    for (let r = 0; r < nul.length; r++) {
      const nog = nul.length - r;
      const meteen = await squlaVraag<number>(l, {
        toon: () => {
          if (st.huidig !== id) {
            st.huidig = id;
            zet(l, { toneel, ...LEEG, verbind: null, bubbels: { actief: false, weg: [], fout: null } });
            speelLesgeluid("verschijn");
          }
        },
        vraag: r === 0 ? [`Tik op de sommen waar ${g(0)} uitkomt.`, `Er zijn er ${g(nul.length)}.`] : [nog === 1 ? "Er is er nog één." : `Er zijn er nog ${g(nog)}.`, `Tik op een som waar ${g(0)} uitkomt.`],
        antwoord: async () => {
          bubbelStand(true);
          const gb = await l.wachtOpVlak<{ soort: string; i: number }>("bubbel");
          bubbelStand(false);
          return gb.i;
        },
        isGoed: (i) => nul.includes(i) && !weg.includes(i),
        noem: (i) => somZin(v.sommen[i][0], v.sommen[i][1]),
        goed: async (i) => {
          weg.push(i);
          bubbelStand(false);
          await l.zeg(`Ja! ${somZin(v.sommen[i][0], v.sommen[i][1])} = ${g(0)}.`);
        },
        fout: (i) => bubbelStand(false, { i, keer: ++st.bubbelKeer }),
        samen: async () => {
          await l.zeg("Bij een som met uitkomst {0:wit} gaat alles eraf.", "Dan blijft er niets over.", "Je haalt er net zoveel af als er waren.", "Dan staat er twee keer hetzelfde getal.");
        },
        tip: ["Zoek een som met twee keer hetzelfde getal."],
        testAntwoord: `b${nul.find((i) => !weg.includes(i))}`,
      });
      if (!meteen) allesGoed = false;
    }
    goedBeeld(l, st);
    await l.zeg("Je hebt ze allemaal gevonden!");
    return allesGoed;
  }

  /* Bussommen: kinderen stappen uit. */
  if (v.t === "bus") {
    const u = v.a - v.b;
    const toneel: Toneel = { soort: "bus", id, in: v.a, rondje: v.rondje };
    const tip = rekenTip(v.a, v.b, "kinderen in de bus");
    let verteld = false;
    return squlaVraag<number>(l, {
      toon: () => {
        const nieuw = st.huidig !== id;
        toon(l, st, toneel, { grijs: nieuw ? 0 : v.b });
      },
      vraag: [`Er zitten ${g(v.a, "geel")} kinderen in de bus.`, v.b === 1 ? `${g(1, "geel")} kind stapt uit.` : `${g(v.b, "geel")} kinderen stappen uit.`, "Hoeveel kinderen zitten er nu in de bus?", ...(v.keuzes ? [] : ["Typ het getal."])],
      antwoord: async () => {
        /* Het beeld volgt het verhaal: eerst zitten ze er allemaal in, dan stappen ze uit. */
        if (!verteld) {
          verteld = true;
          zet(l, { grijs: v.b });
        }
        return v.keuzes ? kiesGetal(l, v.keuzes) : typGetal(l, st, tip);
      },
      isGoed: (x) => x === u,
      noem: (x) => g(x, "geel"),
      goed: async () => {
        goedBeeld(l, st, { som: `${v.a} − ${v.b} = ${u}`, grijs: v.b });
        await l.zeg(u === 1 ? `Ja! Er zit nog ${g(1, "geel")} kind in de bus.` : `Ja! Er zitten nog ${g(u, "geel")} kinderen in de bus.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => samenRekenen(l, v.a, v.b, "bus", "geel", "kinderen in de bus"),
      tip,
      testAntwoord: u,
    });
  }

  /* De min-machine: 10 erin, de machine haalt er wat af. */
  if (v.t === "machine") {
    const u = 10 - v.b;
    const toneel: Toneel = { soort: "machine", id, start: 10, eraf: v.b };
    return squlaVraag<number>(l, {
      toon: () => toon(l, st, toneel),
      vraag: [`${g(10)} gaat de machine in.`, `De machine haalt er ${g(v.b)} af.`, "Hoeveel komt eruit?"],
      antwoord: () => kiesGetal(l, v.keuzes),
      isGoed: (x) => x === u,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { uitkomst: u, som: `10 − ${v.b} = ${u}` });
        await l.zeg(`Ja! ${somZin(10, v.b)} = ${g(u)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => samenRekenen(l, 10, v.b, "stippen", "wit", "stippen"),
      tip: rekenTip(10, v.b, "stippen"),
      testAntwoord: u,
    });
  }

  /* Het schoolbord: kiezen of typen. */
  if (v.t === "bord") {
    const u = v.a - v.b;
    const toneel: Toneel = { soort: "bord", id };
    const tip = rekenTip(v.a, v.b, "stippen");
    return squlaVraag<number>(l, {
      toon: () => toon(l, st, toneel, { som: `${v.a} − ${v.b} = ?` }),
      vraag: v.keuzes ? [`Hoeveel is ${somZin(v.a, v.b)}?`] : [`Hoeveel is ${somZin(v.a, v.b)}?`, "Typ het getal."],
      antwoord: () => (v.keuzes ? kiesGetal(l, v.keuzes) : typGetal(l, st, tip)),
      isGoed: (x) => x === u,
      noem: (x) => g(x),
      goed: async () => {
        goedBeeld(l, st, { som: `${v.a} − ${v.b} = ${u}` });
        await l.zeg(`Ja! ${somZin(v.a, v.b)} = ${g(u)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: () => samenRekenen(l, v.a, v.b, "stippen", "wit", "stippen"),
      tip,
      testAntwoord: u,
    });
  }

  /* Welke som hoort bij het plaatje? (volle en lege bekers of bordjes) */
  if (v.t === "bakjes") {
    const n = v.vol + v.leeg;
    const goed = somTekst(n, v.leeg);
    const wat = BAKJE[v.ding].veel;
    const toneel: Toneel = { soort: "bakjes", id, ding: v.ding, vol: v.vol, leeg: v.leeg };
    return squlaVraag<string>(l, {
      toon: () => toon(l, st, toneel),
      vraag: [`Kijk naar de ${wat}.`, "Welke som hoort bij het plaatje?"],
      antwoord: async () => (await l.kies(v.keuzes.map(([a, b, t]) => somTekst(a, b, t)), { weetniet: false, direct: true })) ?? "",
      isGoed: (x) => x === goed,
      noem: (x) => x,
      goed: async () => {
        goedBeeld(l, st, { som: goed });
        await l.zeg(`Ja! ${somZin(n, v.leeg)} = ${g(v.vol)}.`);
        await l.wacht(400);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: "alle" });
        await l.zeg(`Tel eerst alle ${wat}.`, "Dat getal komt vooraan in de som.");
        zet(l, { licht: "leeg" });
        if (v.leeg === 1) await l.zeg(`${v.ding === "beker" ? "De lege beker gaat" : "Het lege bordje gaat"} eraf.`, "Dat getal komt na de min.");
        else await l.zeg(`De lege ${wat} gaan eraf.`, "Tel ze.", "Dat getal komt na de min.");
        zet(l, { licht: null });
      },
      tip: [`Vooraan staan alle ${wat}.`, `Na de min staan de lege ${wat}.`],
      testAntwoord: goed,
    });
  }

  /* Geld: hoeveel houd je over? */
  const heb = v.heb.reduce((t, x) => t + x, 0);
  const prijs = v.prijs.reduce((t, x) => t + x, 0);
  const u = heb - prijs;
  const toneel: Toneel = { soort: "geld", id, heb: v.heb, prijs: v.prijs, ding: v.ding };
  return squlaVraag<number>(l, {
    toon: () => toon(l, st, toneel),
    vraag: ["Kijk naar je geld.", `Je koopt ${SPEELGOED[v.ding]}.`, "Hoeveel euro houd je over?"],
    antwoord: () => kiesGetal(l, v.keuzes),
    isGoed: (x) => x === u,
    noem: (x) => `${g(x)} euro`,
    goed: async () => {
      goedBeeld(l, st, { som: `${heb} − ${prijs} = ${u}` });
      await l.zeg(`Ja! ${somZin(heb, prijs)} = ${g(u)}.`, `Je houdt ${g(u)} euro over.`);
      await l.wacht(400);
    },
    fout: () => foutBeeld(l, st),
    samen: async () => {
      const briefje = v.heb.find((x) => x >= 5);
      await l.zeg("We tellen eerst je geld.");
      if (briefje) await l.zeg(`Een briefje van ${g(briefje)} is ${g(briefje)} euro.`);
      await l.zeg(`Samen heb je ${g(heb)} euro.`, "Voor elke euro zet ik een stip.");
      zet(l, { stippen: { n: heb, grijs: 0 } });
      await l.wacht(heb * 25 + 400);
      await l.zeg(`${hoofd(SPEELGOED[v.ding])} kost ${g(prijs)} euro.`, prijs === 1 ? "Die gaat eraf." : "Die gaan eraf.");
      zet(l, { stippen: { n: heb, grijs: prijs } });
      await l.wacht(prijs * 200 + 400);
      await l.zeg("Tel de stippen die over zijn.");
    },
    tip: ["Tel de stippen die over zijn."],
    testAntwoord: u,
  });
}

/* =====================================================================
   Een hele les
   ===================================================================== */

type MinLes = {
  id: string;
  titel: string;
  oefening: string;
  level: number;
  welkom: string[];
  /** Het beeld bij het welkom (en de korte uitleg). */
  uitleg: (l: Lesgids, st: Stand) => Promise<void>;
  begin: Toneel;
  vragen: Vraag[];
  eind: string;
};

function minles(m: MinLes): Lesdraaiboek {
  return {
    id: m.id,
    titel: m.titel,
    synthesis: `Squla groep 3 · Minsommen · ${m.oefening} · level ${m.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    kaarttekening: KaartMinsommen,
    async speel(l) {
      const st: Stand = { huidig: m.begin.id, nr: 0, goed: 0, fout: 0, typUitgelegd: false, verbindKeer: 0, bubbelKeer: 0 };
      l.vlak<MinVlakProps>(SqulaMinVlak, { toneel: m.begin });
      speelLesgeluid("verschijn");
      await squlaBegin(l, { welkom: m.welkom, uitleg: () => m.uitleg(l, st) });
      let fouten = 0;
      for (const v of m.vragen) if (!(await speelVraag(l, v, st))) fouten++;
      zet(l, { toneel: null, ...LEEG, verbind: null, bubbels: null });
      await squlaEind(l, fouten, m.eind);
    },
  };
}

/* ---------- de korte uitleg (bij "Kun je dit al?" → Nee) ---------- */

/** In de zee: dieren, een paar zwemmen weg (grijs), tel wat er over is. */
function uitlegZee(dier: Dier, a: number, b: number) {
  return async (l: Lesgids, st: Stand) => {
    const k = DIER[dier].kleur;
    const veel = DIER[dier].veel;
    const u = a - b;
    toon(l, st, { soort: "zee", id: `uitleg-${dier}-${a}`, dier, n: a }, { som: `${a} − ${b}` });
    await l.zeg(...zeeVerhaal(dier, a, b));
    if (overTien(a, b)) {
      const r1 = a - 10;
      await l.zeg(`Eerst gaan er ${g(r1, k)} weg.`);
      zet(l, { grijs: r1 });
      await l.wacht(r1 * 260 + 300);
      await l.zeg(`Dan zijn er nog ${g(10, k)}.`, `Daarna gaan er nog ${g(b - r1, k)} weg.`);
      zet(l, { grijs: b });
      await l.wacht((b - r1) * 260 + 300);
    } else {
      zet(l, { grijs: b });
      await l.wacht(b * 260 + 300);
    }
    zet(l, { licht: "over" });
    await l.zeg(`Er blijven ${g(u, k)} ${veel} over.`);
    zet(l, { licht: null, som: `${a} − ${b} = ${u}` });
    await l.zeg(`Dat is de minsom ${somZin(a, b, k)} = ${g(u, k)}.`);
  };
}

/** De bus: alle kinderen zitten erin, een paar stappen uit. */
function uitlegBus(a: number, b: number, rondje: boolean) {
  return async (l: Lesgids, st: Stand) => {
    const u = a - b;
    toon(l, st, { soort: "bus", id: `uitleg-bus-${a}`, in: a, rondje }, { grijs: 0 });
    await l.zeg(`Er zitten ${g(a, "geel")} kinderen in de bus.`);
    if (overTien(a, b)) {
      const r1 = a - 10;
      await l.zeg(`Er stappen ${g(b, "geel")} kinderen uit.`, `Eerst stappen er ${g(r1, "geel")} uit.`);
      zet(l, { grijs: r1 });
      await l.wacht(r1 * 260 + 300);
      await l.zeg(`Dan zitten er nog ${g(10, "geel")} in.`, `Daarna stappen er nog ${g(b - r1, "geel")} uit.`);
      zet(l, { grijs: b });
      await l.wacht((b - r1) * 260 + 300);
    } else {
      await l.zeg(`${g(b, "geel")} kinderen stappen uit.`);
      zet(l, { grijs: b });
      await l.wacht(b * 260 + 300);
    }
    if (rondje) await l.zeg("Het rode rondje zegt hoeveel kinderen er uitstappen.");
    zet(l, { licht: "over" });
    await l.zeg(`Nu zitten er nog ${g(u, "geel")} kinderen in de bus.`);
    zet(l, { licht: null, som: `${a} − ${b} = ${u}` });
    await l.zeg(`Dat is de minsom ${somZin(a, b, "geel")} = ${g(u, "geel")}.`);
  };
}

/** Met stippen: eerst allemaal, dan wordt eraf grijs. Op het bord, bij de machine of zonder plaatje. */
function uitlegStippen(beeld: "bord" | "machine" | "som", a: number, b: number) {
  return async (l: Lesgids, st: Stand) => {
    const u = a - b;
    const toneel: Toneel = beeld === "bord" ? { soort: "bord", id: "uitleg-bord" } : beeld === "machine" ? { soort: "machine", id: "uitleg-machine", start: a, eraf: b } : { soort: "som", id: "uitleg-som" };
    toon(l, st, toneel, { som: beeld === "machine" ? null : `${a} − ${b} = ?` });
    if (beeld === "machine") await l.zeg(`${g(a)} gaat de machine in.`, `De machine haalt er ${g(b)} af.`);
    else await l.zeg(`Kijk, ${somZin(a, b)}.`);
    zet(l, { stippen: { n: a, grijs: 0 } });
    await l.zeg(`Ik zet ${g(a)} stippen neer.`);
    if (overTien(a, b)) {
      const r1 = a - 10;
      await l.zeg(`Er gaan er ${g(b)} af.`, `Eerst gaan er ${g(r1)} af.`);
      zet(l, { stippen: { n: a, grijs: r1 } });
      await l.wacht(r1 * 200 + 400);
      await l.zeg(`Dan zijn er nog ${g(10)}.`, `Daarna gaan er nog ${g(b - r1)} af.`);
    } else await l.zeg(`Er gaan er ${g(b)} af.`);
    zet(l, { stippen: { n: a, grijs: b } });
    await l.wacht((overTien(a, b) ? b - (a - 10) : b) * 200 + 400);
    await l.zeg(`Er blijven ${g(u)} stippen over.`);
    zet(l, beeld === "machine" ? { uitkomst: u, som: `${a} − ${b} = ${u}` } : { som: `${a} − ${b} = ${u}` });
    await l.zeg(`Dus ${somZin(a, b)} = ${g(u)}.`);
  };
}

/** Bekers: tel alles, de lege gaan eraf. */
function uitlegBakjes(vol: number, leeg: number) {
  return async (l: Lesgids, st: Stand) => {
    const n = vol + leeg;
    toon(l, st, { soort: "bakjes", id: "uitleg-bakjes", ding: "beker", vol, leeg });
    await l.zeg("Kijk, bekers met limonade.", "Een paar zijn al leeg.");
    zet(l, { licht: "alle" });
    await l.zeg(`Eerst waren er ${g(n)} bekers vol.`);
    zet(l, { licht: "leeg" });
    await l.zeg(`Er zijn ${g(leeg)} bekers leeg gedronken.`, "Die gaan eraf.");
    zet(l, { licht: null, som: somTekst(n, leeg) });
    await l.zeg(`De som is ${somZin(n, leeg)} = ${g(vol)}.`);
  };
}

/** Geld: hoeveel houd je over? */
function uitlegGeld(heb: Geld[], prijs: Geld[], ding: Speelgoed) {
  return async (l: Lesgids, st: Stand) => {
    const h = heb.reduce((t, x) => t + x, 0);
    const p = prijs.reduce((t, x) => t + x, 0);
    toon(l, st, { soort: "geld", id: "uitleg-geld", heb, prijs, ding });
    await l.zeg(`Kijk, je hebt ${g(h)} euro.`, `${hoofd(SPEELGOED[ding])} kost ${g(p)} euro.`);
    zet(l, { stippen: { n: h, grijs: 0 } });
    await l.zeg("Voor elke euro zet ik een stip.");
    zet(l, { stippen: { n: h, grijs: p } });
    await l.wacht(p * 200 + 400);
    await l.zeg(`Je betaalt ${g(p)} euro.`, p === 1 ? "Die gaat eraf." : "Die gaan eraf.", `Dan houd je ${g(h - p)} euro over.`);
    zet(l, { som: `${h} − ${p} = ${h - p}` });
    await l.zeg(`${somZin(h, p)} = ${g(h - p)}.`);
  };
}

/* =====================================================================
   Minsommen, onderwater (16055)
   ===================================================================== */

const ZEE_WELKOM = ["Hoi!", "We gaan naar de zee.", "Er zwemmen dieren weg.", "Hoeveel blijven er over?", "Dat noem je ook wel aftrekken."];

const zee1 = minles({
  id: "squla-min-zee-1",
  titel: "Minsommen in de zee",
  oefening: "Minsommen (onderwater)",
  level: 1,
  welkom: ZEE_WELKOM,
  begin: { soort: "zee", id: "uitleg-visje-6", dier: "visje", n: 6 },
  uitleg: uitlegZee("visje", 6, 2),
  /* Level 1: tot en met 10, eraf 1 t/m 6; verhaal, verhaal, kaal, kaal, welke som, welke som, disco, verbinden, verhaal, en daarna nog eens dezelfde soorten. */
  vragen: [
    { t: "verhaal", dier: "kwal", a: 7, b: 4, keuzes: [3, 2, 4, 11] },
    { t: "verhaal", dier: "krab", a: 9, b: 5, keuzes: [5, 4, 14, 3] },
    { t: "kaal", dier: "dolfijn", a: 8, b: 3, keuzes: [6, 5, 11, 4] },
    { t: "kaal", deco: "walvis", a: 10, b: 6, keuzes: [4, 3, 16, 5] },
    { t: "welke", dier: "zeester", a: 8, b: 3, eter: "inktvis", keuzes: [[5, 3], [8, 3], [8, 2], [5, 2]] },
    { t: "welke", dier: "schildpad", a: 9, b: 2, keuzes: [[9, 3], [7, 2], [9, 2], [7, 3]] },
    { t: "disco", a: 7, b: 5, keuzes: [2, 5, 3] },
    { t: "verbind", sommen: [[6, 5], [9, 6], [8, 4]], uitkomsten: [4, 1, 3] },
    { t: "verhaal", dier: "zeepaardje", a: 6, b: 1, keuzes: [4, 5, 7, 6] },
    { t: "verhaal", dier: "visje", a: 10, b: 3, keuzes: [7, 13, 6, 8] },
    { t: "kaal", dier: "krab", a: 9, b: 4, keuzes: [5, 13, 4, 6] },
    { t: "welke", dier: "dolfijn", a: 7, b: 4, keuzes: [[6, 4], [7, 4], [7, 3], [4, 3]] },
    { t: "disco", a: 10, b: 2, keuzes: [8, 7, 9] },
    { t: "kaal", dier: "zeepaardje", a: 5, b: 3, keuzes: [3, 2, 8, 1] },
    { t: "verhaal", dier: "kwal", a: 8, b: 6, keuzes: [2, 14, 3, 1] },
  ],
  eind: "Je kunt minsommen maken tot {10:wit}.",
});

const zee2 = minles({
  id: "squla-min-zee-2",
  titel: "Minsommen in de zee (moeilijker)",
  oefening: "Minsommen (onderwater)",
  level: 2,
  welkom: ZEE_WELKOM,
  begin: { soort: "zee", id: "uitleg-visje-15", dier: "visje", n: 15 },
  uitleg: uitlegZee("visje", 15, 3),
  /* Level 2: start 12 t/m 19, eraf 0 t/m 7, niet over het tiental; 3 keuzes; luistervragen, typen en bubbels erbij. */
  vragen: [
    { t: "verhaal", dier: "visje", a: 14, b: 3, keuzes: [11, 12, 10] },
    { t: "welke", dier: "zeepaardje", a: 16, b: 3, keuzes: [[13, 3], [16, 3], [16, 3, "+"]] },
    { t: "verhaal", dier: "krab", a: 19, b: 6, keuzes: [13, 14, 11] },
    { t: "luister", dier: "kwal", a: 15, b: 1, keuzes: [16, 14, 13] },
    { t: "luister", dier: "zeester", a: 17, b: 5, keuzes: [12, 11, 13] },
    { t: "welke", dier: "visje", a: 18, b: 5, eter: "walvis", keuzes: [[18, 5], [18, 6], [18, 2]] },
    { t: "welke", dier: "krab", a: 14, b: 2, eter: "inktvis", keuzes: [[14, 2], [14, 1], [12, 2], [13, 2]] },
    { t: "disco", a: 17, b: 4, keuzes: [13, 14, 11] },
    { t: "typen", a: 19, b: 7, deco: "schildpad" },
    { t: "bubbels", sommen: [[17, 17], [9, 8], [6, 6], [14, 4], [13, 13], [15, 0]] },
    { t: "verhaal", dier: "schildpad", a: 15, b: 2, keuzes: [13, 12, 17] },
    { t: "welke", dier: "dolfijn", a: 13, b: 2, keuzes: [[13, 2, "+"], [11, 2], [13, 2]] },
    { t: "luister", dier: "visje", a: 18, b: 4, keuzes: [14, 15, 12] },
    { t: "disco", a: 16, b: 5, keuzes: [10, 11, 12] },
    { t: "typen", a: 17, b: 6, deco: "dolfijn" },
  ],
  eind: "Je kunt minsommen maken tot {20:wit}.",
});

const zee3 = minles({
  id: "squla-min-zee-3",
  titel: "Minsommen in de zee (nog moeilijker)",
  oefening: "Minsommen (onderwater)",
  level: 3,
  welkom: ["Hoi!", "We gaan weer naar de zee.", "Nu gaan we over de {10:wit} heen.", "Eerst terug naar {10:wit}, dan de rest eraf."],
  begin: { soort: "zee", id: "uitleg-visje-13", dier: "visje", n: 13 },
  uitleg: uitlegZee("visje", 13, 5),
  /* Level 3: start 11 t/m 19, over het tiental terug, plus "alles eraf" en "niets eraf". */
  vragen: [
    { t: "verhaal", dier: "visje", a: 13, b: 6, keuzes: [7, 19, 8, 6] },
    { t: "verhaal", dier: "kwal", a: 15, b: 7, keuzes: [9, 8, 7, 6] },
    { t: "verhaal", dier: "krab", a: 12, b: 5, keuzes: [8, 17, 7, 6] },
    { t: "verhaal", dier: "visje", a: 17, b: 8, keuzes: [10, 9, 8, 11] },
    { t: "verhaal", dier: "zeepaardje", a: 14, b: 6, keuzes: [9, 8, 20, 7] },
    { t: "welke", dier: "visje", a: 16, b: 16, eter: "walvis", keuzes: [[16, 0], [16, 16], [16, 6], [16, 1]] },
    { t: "welke", dier: "kwal", a: 18, b: 0, eter: "inktvis", keuzes: [[18, 18], [18, 0], [18, 8], [18, 10]] },
    { t: "disco", a: 12, b: 8, keuzes: [4, 5, 3] },
    { t: "disco", a: 17, b: 9, keuzes: [9, 8, 7] },
    { t: "typen", a: 14, b: 9 },
    { t: "verhaal", dier: "schildpad", a: 11, b: 3, keuzes: [8, 14, 9, 7] },
    { t: "welke", dier: "krab", a: 13, b: 4, eter: "inktvis", keuzes: [[13, 3], [13, 4], [12, 4], [9, 4]] },
    { t: "disco", a: 15, b: 9, keuzes: [5, 7, 6] },
    { t: "typen", a: 16, b: 7 },
    { t: "verhaal", dier: "dolfijn", a: 16, b: 8, keuzes: [9, 8, 7, 6] },
  ],
  eind: "Je rekent terug over de {10:wit}.",
});

/* =====================================================================
   Bussommen 1 (7275) en Bussommen 2 (7276)
   ===================================================================== */

const BUS_WELKOM = ["Hoi!", "Kijk, een bus vol kinderen.", "Er stappen kinderen uit.", "Hoeveel zitten er dan nog in de bus?"];
const bus = (a: number, b: number, rondje = false, keuzes?: number[]): Vraag => ({ t: "bus", a, b, rondje, keuzes });

const bus11 = minles({
  id: "squla-min-bus1-1",
  titel: "Bussommen",
  oefening: "Bussommen 1",
  level: 1,
  welkom: BUS_WELKOM,
  begin: { soort: "bus", id: "uitleg-bus-6", in: 6, rondje: false },
  uitleg: uitlegBus(6, 2, false),
  /* Level 1 "tot 10": eerst kiezen uit 3 (startgetal en aftrekgetal als lokkers), daarna typen. */
  vragen: [bus(8, 3, false, [5, 3, 8]), bus(9, 7), bus(10, 4), bus(5, 1), bus(7, 3), bus(6, 4), bus(9, 2), bus(4, 2), bus(10, 6), bus(7, 5), bus(8, 1), bus(3, 2), bus(9, 8), bus(6, 1), bus(8, 6)],
  eind: "Je kunt bussommen maken tot {10:wit}.",
});

const bus12 = minles({
  id: "squla-min-bus1-2",
  titel: "Bussommen (moeilijker)",
  oefening: "Bussommen 1",
  level: 2,
  welkom: BUS_WELKOM,
  begin: { soort: "bus", id: "uitleg-bus-15", in: 15, rondje: false },
  uitleg: uitlegBus(15, 3, false),
  /* Level 2 "tot 20": alleen typen, start 12 t/m 19, eraf 1 t/m 6, niet over het tiental. */
  vragen: [bus(16, 4), bus(18, 5), bus(19, 3), bus(14, 2), bus(17, 1), bus(15, 4), bus(13, 3), bus(18, 6), bus(12, 1), bus(19, 6), bus(16, 5), bus(14, 3), bus(15, 2), bus(17, 4), bus(13, 1)],
  eind: "Je kunt bussommen maken tot {20:wit}.",
});

const bus13 = minles({
  id: "squla-min-bus1-3",
  titel: "Bussommen (nog moeilijker)",
  oefening: "Bussommen 1",
  level: 3,
  welkom: ["Hoi!", "Weer een bus vol kinderen.", "Nu gaan we over de {10:wit} heen.", "Eerst terug naar {10:wit}, dan de rest."],
  begin: { soort: "bus", id: "uitleg-bus-13", in: 13, rondje: false },
  uitleg: uitlegBus(13, 5, false),
  /* Level 3 "over het 10-tal": alleen typen, start 12 t/m 18, eraf 4 t/m 9, uitkomst onder de 10. */
  vragen: [bus(15, 7), bus(13, 5), bus(16, 9), bus(12, 6), bus(17, 8), bus(14, 6), bus(12, 7), bus(15, 9), bus(13, 4), bus(16, 7), bus(14, 9), bus(15, 6), bus(12, 8), bus(13, 9), bus(14, 7)],
  eind: "Je rekent terug over de {10:wit}.",
});

const BUS2_WELKOM = ["Hoi!", "Kijk, een bus vol kinderen.", "Het rode rondje zegt hoeveel er uitstappen.", "Hoeveel zitten er dan nog in de bus?"];

const bus21 = minles({
  id: "squla-min-bus2-1",
  titel: "Bussommen met een rondje",
  oefening: "Bussommen 2",
  level: 1,
  welkom: BUS2_WELKOM,
  begin: { soort: "bus", id: "uitleg-bus-6", in: 6, rondje: true },
  uitleg: uitlegBus(6, 2, true),
  /* Level 1 "tot 10": eerst kiezen uit 3, één keer met kinderen buiten, verder het rode rondje; typen. */
  vragen: [
    bus(10, 7, true, [3, 7, 10]),
    bus(7, 4, false),
    bus(9, 8, true),
    bus(6, 1, true),
    bus(8, 2, true),
    bus(5, 4, true),
    bus(9, 5, true),
    bus(4, 1, true),
    bus(10, 6, true),
    bus(8, 4, true),
    bus(7, 6, true),
    bus(6, 4, true),
    bus(9, 3, true),
    bus(5, 2, true),
    bus(10, 5, true),
  ],
  eind: "Je kunt bussommen maken tot {10:wit}.",
});

const bus22 = minles({
  id: "squla-min-bus2-2",
  titel: "Bussommen met een rondje (moeilijker)",
  oefening: "Bussommen 2",
  level: 2,
  welkom: BUS2_WELKOM,
  begin: { soort: "bus", id: "uitleg-bus-15", in: 15, rondje: true },
  uitleg: uitlegBus(15, 3, true),
  /* Level 2 "tot 20": alleen typen, start 12 t/m 19, eraf 1 t/m 7, niet over het tiental. */
  vragen: [bus(17, 5, true), bus(19, 4, true), bus(16, 2, true), bus(18, 3, true), bus(13, 2, true), bus(15, 1, true), bus(19, 7, true), bus(14, 4, true), bus(18, 6, true), bus(16, 3, true), bus(17, 7, true), bus(15, 2, true), bus(19, 5, true), bus(12, 1, true), bus(18, 1, true)],
  eind: "Je kunt bussommen maken tot {20:wit}.",
});

const bus23 = minles({
  id: "squla-min-bus2-3",
  titel: "Bussommen met een rondje (nog moeilijker)",
  oefening: "Bussommen 2",
  level: 3,
  welkom: ["Hoi!", "Weer een bus vol kinderen.", "Nu gaan we over de {10:wit} heen.", "Eerst terug naar {10:wit}, dan de rest."],
  begin: { soort: "bus", id: "uitleg-bus-13", in: 13, rondje: true },
  uitleg: uitlegBus(13, 5, true),
  /* Level 3 "over het 10-tal": alleen typen, start 11 t/m 19, eraf 6 t/m 10, uitkomst onder de 10. */
  vragen: [bus(16, 8, true), bus(13, 7, true), bus(11, 6, true), bus(17, 8, true), bus(14, 9, true), bus(18, 10, true), bus(15, 7, true), bus(12, 9, true), bus(16, 9, true), bus(13, 9, true), bus(15, 8, true), bus(11, 7, true), bus(12, 7, true), bus(14, 8, true), bus(16, 7, true)],
  eind: "Je rekent terug over de {10:wit}.",
});

/* =====================================================================
   Minsommen (6919): machine, schoolbord, bekers en bordjes, geld
   ===================================================================== */

const MACHINE_WELKOM = ["Hoi!", "We gaan minsommen maken.", "Er gaat iets af.", "Hoeveel heb je dan over?"];
const bord = (a: number, b: number, keuzes?: number[]): Vraag => ({ t: "bord", a, b, keuzes });
const machine = (b: number, keuzes: number[]): Vraag => ({ t: "machine", b, keuzes });
const disco = (a: number, b: number, keuzes: number[], luister = false): Vraag => ({ t: "disco", a, b, keuzes, luister });

const mach1 = minles({
  id: "squla-min-machine-1",
  titel: "Minsommen: hoeveel over?",
  oefening: "Minsommen",
  level: 1,
  welkom: MACHINE_WELKOM,
  begin: { soort: "machine", id: "uitleg-machine", start: 10, eraf: 2 },
  uitleg: uitlegStippen("machine", 10, 2),
  /* Level 1: de min-machine (10 min 1 t/m 5), dan schoolbord en disco (6 t/m 10 min 3 t/m 6); keuzes: 3 getallen op een rij. */
  vragen: [
    machine(3, [6, 7, 8]),
    machine(5, [4, 5, 6]),
    machine(1, [8, 9, 10]),
    machine(4, [5, 6, 7]),
    machine(2, [7, 8, 9]),
    bord(8, 5, [2, 3, 4]),
    disco(9, 3, [6, 7, 8]),
    bord(7, 3, [3, 4, 5]),
    bord(10, 6, [4, 5, 6]),
    disco(6, 4, [1, 2, 3]),
    bord(9, 6, [2, 3, 4]),
    disco(8, 4, [3, 4, 5]),
    bord(6, 5, [1, 2, 3]),
    bord(10, 5, [4, 5, 6]),
    disco(7, 5, [2, 3, 4]),
  ],
  eind: "Je weet hoeveel er over is.",
});

const bakjes = (ding: Bakje, vol: number, leeg: number, keuzes: SomKeuze[]): Vraag => ({ t: "bakjes", ding, vol, leeg, keuzes });

const mach2 = minles({
  id: "squla-min-machine-2",
  titel: "Minsommen: hoeveel over? (moeilijker)",
  oefening: "Minsommen",
  level: 2,
  welkom: ["Hoi!", "Kijk, bekers en bordjes.", "Een paar zijn leeg.", "Welke som hoort erbij?"],
  begin: { soort: "bakjes", id: "uitleg-bakjes", ding: "beker", vol: 4, leeg: 2 },
  uitleg: uitlegBakjes(4, 2),
  /* Level 2: welke som hoort bij het plaatje (volle en lege), dan de machine met 10 min 6 t/m 10; tot en met 10. */
  vragen: [
    bakjes("beker", 3, 2, [[5, 2], [4, 2], [5, 3]]),
    bakjes("bordje", 3, 5, [[7, 5], [8, 5], [9, 5]]),
    bakjes("beker", 2, 4, [[6, 3], [6, 4], [5, 4]]),
    bakjes("bordje", 8, 2, [[10, 1], [10, 2], [10, 3]]),
    bakjes("beker", 4, 3, [[7, 3], [6, 3], [10, 3]]),
    machine(8, [1, 2, 3]),
    machine(6, [3, 4, 5]),
    machine(10, [0, 1, 2]),
    machine(9, [0, 1, 2]),
    machine(7, [2, 3, 4]),
    bakjes("bordje", 6, 3, [[8, 3], [9, 3], [9, 4]]),
    bakjes("beker", 1, 3, [[3, 3], [4, 3], [5, 3]]),
    bakjes("beker", 5, 5, [[10, 5], [9, 5], [10, 4]]),
    bakjes("bordje", 6, 1, [[7, 2], [7, 1], [6, 1]]),
    bakjes("beker", 2, 7, [[8, 7], [9, 7], [10, 7]]),
  ],
  eind: "Je ziet welke som bij een plaatje hoort.",
});

const mach3 = minles({
  id: "squla-min-machine-3",
  titel: "Minsommen: hoeveel over? (nog moeilijker)",
  oefening: "Minsommen",
  level: 3,
  welkom: ["Hoi!", "Kijk, een schoolbord met een minsom.", "Reken hem uit.", "Je typt het antwoord zelf."],
  begin: { soort: "bord", id: "uitleg-bord" },
  uitleg: uitlegStippen("bord", 7, 3),
  /* Level 3: alleen het schoolbord en typen, tot en met 10. */
  vragen: [bord(7, 4), bord(10, 6), bord(9, 3), bord(6, 5), bord(5, 4), bord(10, 5), bord(7, 6), bord(6, 3), bord(9, 5), bord(7, 3), bord(6, 4), bord(7, 5), bord(9, 7), bord(8, 2), bord(10, 7)],
  eind: "Je kunt minsommen uitrekenen tot {10:wit}.",
});

const geld = (heb: Geld[], prijs: Geld[], ding: Speelgoed, keuzes: number[]): Vraag => ({ t: "geld", heb, prijs, ding, keuzes });

const mach4 = minles({
  id: "squla-min-machine-4",
  titel: "Minsommen: hoeveel over? (heel moeilijk)",
  oefening: "Minsommen",
  level: 4,
  welkom: ["Hoi!", "We gaan winkelen.", "Hoeveel geld houd je over?", "En luister goed naar de sommen."],
  begin: { soort: "geld", id: "uitleg-geld", heb: [2, 1, 1], prijs: [1], ding: "ballon" },
  uitleg: uitlegGeld([2, 1, 1], [1], "ballon"),
  /* Level 4: geld (hoeveel houd je over, tot 10 euro) en sommen die alleen gezegd worden; zelfde volgorde, drie keer. */
  vragen: [
    geld([2, 2, 1, 1], [2], "ijsje", [3, 4, 5]),
    disco(7, 2, [4, 5, 6], true),
    geld([5], [2, 1], "bal", [1, 2, 3]),
    geld([10], [2, 2, 1], "vlieger", [4, 5, 6]),
    disco(9, 7, [1, 2, 3], true),
    geld([2, 2, 2, 1], [2, 2], "boek", [2, 3, 4]),
    disco(10, 4, [5, 6, 7], true),
    geld([1, 1, 1, 1], [1], "ballon", [2, 3, 4]),
    geld([5, 2, 1], [2, 2, 2], "boek", [1, 2, 3]),
    disco(8, 5, [2, 3, 4], true),
    geld([10], [1], "ballon", [7, 8, 9]),
    disco(6, 5, [1, 2, 3], true),
    geld([2, 1, 1], [2], "ijsje", [1, 2, 3]),
    geld([5, 2, 2], [2, 2, 1], "vlieger", [3, 4, 5]),
    disco(9, 3, [5, 6, 7], true),
  ],
  eind: "Je weet hoeveel geld je overhoudt.",
});

/* =====================================================================
   Kale sommen (7277): schoolbord en typen
   ===================================================================== */

const KAAL_WELKOM = ["Hoi!", "Kijk, een minsom op het bord.", "Er hoort geen verhaaltje bij.", "Reken hem uit en typ het antwoord."];

const kaal1 = minles({
  id: "squla-min-kaal-1",
  titel: "Kale minsommen",
  oefening: "Kale sommen",
  level: 1,
  welkom: KAAL_WELKOM,
  begin: { soort: "bord", id: "uitleg-bord" },
  uitleg: uitlegStippen("bord", 7, 3),
  /* Level 1 "tot 10": start 3 t/m 10, eraf 1 t/m 6. */
  vragen: [bord(8, 3), bord(6, 2), bord(9, 6), bord(10, 4), bord(4, 1), bord(7, 6), bord(10, 3), bord(3, 2), bord(9, 1), bord(5, 2), bord(8, 4), bord(7, 3), bord(6, 5), bord(10, 2), bord(9, 4)],
  eind: "Je kunt kale minsommen maken tot {10:wit}.",
});

const kaal2 = minles({
  id: "squla-min-kaal-2",
  titel: "Kale minsommen (moeilijker)",
  oefening: "Kale sommen",
  level: 2,
  welkom: KAAL_WELKOM,
  begin: { soort: "bord", id: "uitleg-bord" },
  uitleg: uitlegStippen("bord", 16, 4),
  /* Level 2 "tot 20": start 14 t/m 20, eraf 2 t/m 8, meestal binnen het tiental (één keer erover), ook van 20 af. */
  vragen: [bord(20, 4), bord(19, 5), bord(17, 6), bord(18, 3), bord(16, 2), bord(14, 7), bord(20, 6), bord(16, 6), bord(15, 3), bord(18, 8), bord(19, 2), bord(20, 8), bord(17, 4), bord(15, 4), bord(18, 7)],
  eind: "Je kunt kale minsommen maken tot {20:wit}.",
});

const kaal3 = minles({
  id: "squla-min-kaal-3",
  titel: "Kale minsommen (nog moeilijker)",
  oefening: "Kale sommen",
  level: 3,
  welkom: ["Hoi!", "Weer minsommen op het bord.", "Nu gaan we over de {10:wit} heen.", "Eerst terug naar {10:wit}, dan de rest eraf."],
  begin: { soort: "bord", id: "uitleg-bord" },
  uitleg: uitlegStippen("bord", 13, 5),
  /* Level 3 "over het 10-tal": start 11 t/m 18, eraf 6 t/m 10, uitkomst onder de 10. */
  vragen: [bord(16, 9), bord(12, 7), bord(14, 8), bord(11, 6), bord(17, 9), bord(13, 8), bord(15, 9), bord(12, 6), bord(16, 10), bord(11, 8), bord(14, 6), bord(13, 9), bord(12, 9), bord(16, 7), bord(11, 7)],
  eind: "Je rekent terug over de {10:wit}.",
});

export const LESSEN_SQULA_MINSOMMEN: Lesdraaiboek[] = [zee1, zee2, zee3, bus11, bus12, bus13, bus21, bus22, bus23, mach1, mach2, mach3, mach4, kaal1, kaal2, kaal3];
