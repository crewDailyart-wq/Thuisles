import { BOSONTWERPEN, type Bosontwerp, type Bosfiguur } from "@/lib/generatoren/bosspellen-catalogus";
import { bepaalVraagtekst, getal, heelGetal, husselen, kansGenerator, vraagtekstVelden, type Generator, type Gegenereerd, type Instellingen } from "@/lib/generatoren/soort";
import type { Aanpak, Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM, type Uitlegbron, type Uitlegscript } from "@/lib/generatoren/uitlegscript";

const ontwerpVan = (s: Somgegevens) => BOSONTWERPEN.find((o) => o.id === s.soort) ?? BOSONTWERPEN[0];
const begrens = (n: number, van: number, tot: number) => Math.min(tot, Math.max(van, Math.round(n)));

export function bosfiguurVan(s: Somgegevens): Bosfiguur {
  const o = ontwerpVan(s), e = s.extra ?? {};
  return { soort: "bosspel", ontwerp: o.id, modus: o.modus, thema: o.thema,
    getallen: s.getallen, leeg: s.getallen.map((_, i) => i).filter((i) => e[`leeg${i}`] === 1),
    keuzes: Array.from({ length: e.keuzes ?? 0 }, (_, i) => e[`keuze${i}`]),
    doel: e.doel ?? s.goed, weg: e.weg ?? 0, stap: e.stap ?? 1 };
}

export function bosAntwoorden(s: Somgegevens): number[] {
  const f = bosfiguurVan(s);
  if (f.modus === "rij") return f.leeg.map((i) => f.getallen[i]);
  if (f.modus === "ordenen") return [...f.getallen].sort((a, b) => f.stap * (a - b));
  return [s.goed];
}

function zin(s: Somgegevens): string {
  const o = ontwerpVan(s), f = bosfiguurVan(s);
  if (o.modus === "maken") return `Leg ${f.doel} kralen neer.`;
  if (o.modus === "rest") return "Hoeveel blaadjes blijven over?";
  if (o.modus === "ordenen") return f.stap === 1 ? "Van klein naar groot." : "Van groot naar klein.";
  if (o.modus === "kiezen") return f.stap === 1 ? "Kies het grootste getal." : "Kies het kleinste getal.";
  if (o.modus === "hoeveelheid") return o.meerMinder ? `Kies één ${f.stap === 1 ? "meer" : "minder"} dan ${f.doel}.` : `Waar zijn er ${f.doel}?`;
  if (o.modus === "rij") {
    if (o.leeg === "buren") return "Welke getallen staan ernaast?";
    if (o.leeg === "ervoorerna") {
      const richting = f.leeg[0] === 0 ? "vóór" : "na";
      return o.evenOneven ? `Welk ${f.getallen[1] % 2 === 0 ? "even" : "oneven"} getal komt ${richting} ${f.getallen[1]}?` : `Welk getal komt ${richting} ${f.getallen[1]}?`;
    }
    return o.sprong === 2 ? "Spring steeds twee verder." : "Help Vos naar de sleutel.";
  }
  return ({ kralen: "Hoeveel kralen tel je?", trein: "Hoeveel dieren reizen mee?", appels: "Hoeveel appels tel je?", blokken: "Hoeveel blokjes tel je?", sterren: "Hoeveel sterren tel je?", blaadjes: "Hoeveel blaadjes tel je?", huisjes: "Hoeveel huisjes tel je?", waterlelies: "Hoeveel waterlelies tel je?" })[o.thema];
}

/** Elke animatie gebruikt precies hetzelfde tafereel als de opgave. */
const uitleg: Uitlegbron = {
  modellen: ["bosspel", "som"],
  strategieen: [{ waarde: "kijken-tellen", label: "Kijken, tellen en controleren", uitleg: "Dezelfde afbeelding, stap voor stap met Vos." }],
  standaardStrategie: () => "kijken-tellen",
  vergelijkbaar: () => null,
  script(s, vorm) {
    const f = bosfiguurVan(s), o = ontwerpVan(s), antwoorden = bosAntwoorden(s);
    const stappen: Uitlegscript["stappen"] = [];
    const voeg = (tekst: string, opgelicht: number, opgelost = false, somtekst?: string) => {
      stappen.push({ zin: tekst, houding: opgelost ? "juichend" : "wijzend", feest: opgelost,
        model: MANIER_VAN_VORM[vorm] === "78"
          ? { soort: "som", tekst: somtekst ?? (opgelost ? antwoorden.join(" · ") : s.getallen.join(" · ")) }
          : { soort: "bosspel", figuur: f, opgelicht, opgelost } });
    };
    if (f.modus === "rij") {
      voeg(`Elke sprong is ${Math.abs(f.stap)}.`, 0);
      f.getallen.forEach((n, i) => voeg(i === 0 ? `Begin bij ${n}.` : `${f.getallen[i - 1]} plus ${f.stap} is ${n}.`, i + 1, false, i === 0 ? String(n) : `${f.getallen[i - 1]} + ${f.stap} = ${n}`));
    } else if (f.modus === "ordenen" || f.modus === "kiezen") {
      const rij = [...f.getallen].sort((a, b) => f.modus === "ordenen" ? f.stap * (a - b) : a - b);
      voeg(f.modus === "ordenen" && f.stap < 0 ? "Begin met het grootste getal." : "Begin met het kleinste getal.", 0);
      rij.forEach((n, i) => voeg(i === 0 ? `Dit is ${n}.` : `${n} is ${f.modus === "ordenen" && f.stap < 0 ? "kleiner" : "groter"} dan ${rij[i - 1]}.`, i + 1, false, rij.slice(0, i + 1).join(" → ")));
      if (f.modus === "kiezen") voeg(f.stap === 1 ? `${s.goed} is het grootste getal.` : `${s.goed} is het kleinste getal.`, f.getallen.length);
    } else {
      if (f.modus === "rest") voeg(`${f.weg} blaadjes zijn weggewaaid.`, 0);
      else if (o.meerMinder) voeg(`${f.doel} ${f.stap > 0 ? "plus" : "min"} 1 is ${s.goed}.`, 0, false, `${f.doel} ${f.stap > 0 ? "+" : "−"} 1 = ${s.goed}`);
      else voeg("Tel rustig één voor één.", 0);
      for (let n = 1; n <= s.goed; n++) voeg(String(n), n, false, `1 … ${n}`);
      if (s.goed === 0) voeg("Er zijn er nul over.", 0, false, "0");
    }
    voeg("Zo klopt het!", 100, true);
    return { vorm, strategie: "kijken-tellen", strategieNaam: "kijken en tellen", stappen };
  },
};

const aanpak: Aanpak = {
  zin(s) { const f = bosfiguurVan(s); const tekst = f.modus === "rij" ? `Tel steeds ${Math.abs(f.stap)} verder.` : f.modus === "ordenen" ? "Vergelijk de getallen één voor één." : "Kijk mee en tel rustig."; return { "34": tekst, "56": tekst, "78": tekst }; },
  stappen(s) { return [{ tekst: "Bekijk de opgave.", figuur: bosfiguurVan(s) }, { tekst: "Controleer stap voor stap.", som: bosAntwoorden(s).join(" · ") }]; },
  controle: (s) => `Het antwoord is ${bosAntwoorden(s).join(" en ")}.`,
};
const patronen: Foutpatroon[] = [{
  id: "bos-richting", naam: "De andere richting",
  herkent: (s, gegeven) => {
    const f = bosfiguurVan(s);
    if (f.modus === "ordenen") { const rij = bosAntwoorden(s); return rij.length > 1 && rij.every((_, i) => s.extra?.[`gegeven${i}`] === rij[rij.length - 1 - i]); }
    if (f.modus === "kiezen") return gegeven === (f.stap === 1 ? Math.min(...f.getallen) : Math.max(...f.getallen));
    return f.modus === "rij" && f.leeg.length === 1 && gegeven === 2 * f.doel - s.goed;
  },
  kindtekst: { "34": "Misschien keek je de andere kant op.", "56": "Controleer of je vooruit of terug moet.", "78": "Controleer de gevraagde richting of volgorde." },
  hint: "Kijk of je kleiner of groter zoekt.", uitleg: aanpak.stappen,
  ouder: { uitleg: "Het antwoord past bij de omgekeerde richting.", zinnen: ["Zoeken we groter of kleiner?", "Welk getal komt eerst?"], schoolwoord: "getalvolgorde" },
}, {
  id: "bos-weggeteld", naam: "Weggewaaide blaadjes meegeteld",
  herkent: (s, gegeven) => ontwerpVan(s).modus === "rest" && gegeven === s.getallen[0],
  kindtekst: { "34": "Misschien telde je de losse blaadjes mee.", "56": "Tel alleen wat er nog over is.", "78": "Haal de verdwenen blaadjes van het totaal af." },
  hint: "De doorgestreepte blaadjes tellen niet mee.", uitleg: aanpak.stappen,
  ouder: { uitleg: "Het oorspronkelijke totaal is gegeven in plaats van de rest.", zinnen: ["Welke blaadjes zijn weg?", "Welke blijven er over?"], schoolwoord: "aftrekken" },
}, {
  id: "bos-een-ernaast", naam: "Eén ernaast",
  herkent: (s, gegeven) => bosAntwoorden(s).length === 1 && Math.abs(s.goed - gegeven) === 1,
  kindtekst: { "34": "Misschien telde je één te veel of te weinig.", "56": "Misschien zit je één naast het juiste getal.", "78": "Controleer of je één positie te ver of te weinig hebt geteld." },
  hint: "Kijk naar de richting. Tel rustig mee.", uitleg: aanpak.stappen,
  ouder: { uitleg: "Het antwoord ligt één naast het juiste antwoord. Dat kan een telfout zijn.", zinnen: ["Waar begin je?", "Kun je de stappen aanwijzen?"], schoolwoord: "telrij" },
}];

function maakGenerator(o: Bosontwerp): Generator {
  const zinnen = { "34": "{som}", "56": "{som}", "78": "{som}" };
  const generator: Generator = {
    id: o.id, naam: o.naam, uitleg: o.idee, suggestie: `Groep 3–4 · ${o.vaardigheid} · tot ${o.tot ?? 20}`,
    velden: [{ soort: "getal", sleutel: "tot", label: "Hoogste getal", min: o.sprong === 2 ? 10 : 5, max: o.tot ?? 20 }, ...vraagtekstVelden(zinnen)],
    standaard: { tot: o.tot ?? 20 }, vraagteksten: { standaard: zinnen, som: zin },
    foutpatronen: patronen, aanpak, uitleganimatie: uitleg,
    maximum: () => null,
    maak(inst: Instellingen, aantal, alGebruikt, zaad, groep) {
      const kans = kansGenerator(zaad), uit: Gegenereerd[] = [];
      const tot = begrens(getal(inst, "tot", o.tot ?? 20), o.sprong === 2 ? 10 : 5, o.tot ?? 20);
      for (let poging = 0; poging < Math.min(100000, aantal * 100) && uit.length < aantal; poging++) {
        let getallen: number[] = [], leeg: number[] = [], keuzes: number[] = [];
        let goed = 0, doel = heelGetal(kans, 1, tot), weg = 0, stap = o.sprong ?? 1;
        if (o.modus === "rij") {
          const lengte = o.leeg === "buren" || o.leeg === "ervoorerna" ? 3 : 5;
          const begin = heelGetal(kans, 0, tot - (lengte - 1) * stap);
          getallen = Array.from({ length: lengte }, (_, i) => begin + i * stap);
          leeg = o.leeg === "buren" ? [0, 2] : o.leeg === "ervoorerna" ? [kans() < .5 ? 0 : 2] : o.leeg === "midden" ? [1, 3] : [lengte - 2, lengte - 1];
          goed = getallen[leeg[0]]; doel = getallen[1];
        } else if (o.modus === "ordenen" || o.modus === "kiezen") {
          getallen = husselen(kans, Array.from({ length: tot + 1 }, (_, i) => i)).slice(0, 4);
          stap = o.modus === "ordenen" ? (o.richting === "omlaag" ? -1 : 1) : (kans() < .5 ? -1 : 1);
          goed = o.modus === "kiezen" ? (stap === 1 ? Math.max(...getallen) : Math.min(...getallen)) : [...getallen].sort((a, b) => stap * (a - b))[0];
          if (o.modus === "kiezen") keuzes = getallen;
        } else {
          if (o.meerMinder) { doel = heelGetal(kans, 1, tot - 1); stap = kans() < .5 ? -1 : 1; }
          weg = o.modus === "rest" ? heelGetal(kans, 1, doel) : 0;
          goed = o.meerMinder ? doel + stap : doel - weg;
          getallen = [doel];
          if (o.keuze || o.modus === "hoeveelheid") keuzes = husselen(kans, [goed, ...husselen(kans, Array.from({ length: tot + 1 }, (_, i) => i).filter((n) => n !== goed)).slice(0, 2)]);
        }
        const handtekening = `${o.id}:${getallen.join("-")}:${leeg.join("-")}:${stap}:${weg}`;
        if (alGebruikt.has(handtekening)) continue;
        alGebruikt.add(handtekening);
        const som: Somgegevens = { soort: o.id, getallen, goed, extra: { doel, weg, stap, tot,
          ...Object.fromEntries(leeg.map((i) => [`leeg${i}`, 1])), keuzes: keuzes.length,
          ...Object.fromEntries(keuzes.map((n, i) => [`keuze${i}`, n])) } };
        uit.push({ handtekening, vorm: "bosspel", vraagtekst: bepaalVraagtekst(generator, inst, groep, som), antwoord: bosAntwoorden(som).join(","), figuur: bosfiguurVan(som), somgegevens: som });
      }
      return uit;
    },
  };
  return generator;
}

export const bosGeneratoren = BOSONTWERPEN.map(maakGenerator);
