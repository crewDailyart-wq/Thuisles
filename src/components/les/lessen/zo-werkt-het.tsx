/**
 * Lessen: de introductie — naar Synthesis "Getting Started · Inputs" en
 * "Getting Started · Customizing the Tutor" (INSPIRATIE.md, ronde 1 en 2).
 * Groep 3 en 4.
 *
 * ZO WERKT HET (Inputs)
 *
 * Een korte eerste les over de bediening:
 * 1. op de blauwe pijl tikken (of op Enter drukken);
 * 2. kiezen en bevestigen met het vinkje;
 * 3. "Weet ik niet" als je iets niet weet;
 * 4. een getal typen in het vakje;
 * 5. een tegel slepen, of eerst tikken en dan in het vak tikken.
 * Aan het eind de kaart.
 *
 *
 * Tweede bouwronde (10 oktober 2026), aangevuld naar de aantekeningen:
 * - "Leer je liever snel of langzaam?" aan het begin, en "Zal ik de keuzes
 *   voorlezen?" bij het kiezen. Beide keuzes worden bewaard in de
 *   voorkeuren van dit apparaat (`voorkeuren.ts`), zodat het lesscherm ze
 *   kan gebruiken.
 * - Kiezen met de pijltjestoetsen en Enter, in een eigen vlak (IntroKeuzes).
 * - Het schermpje met het paarse vierkant: zonder hamer lukt het niet, de
 *   hand roept hulp, de hamer slaat het in twee, het vinkje zegt "klaar"
 *   (IntroVierkant). Omdat het lesscherm zelf geen hulpknop heeft, zegt de
 *   mascotte erbij dat je in de lessen hulp vraagt met "Weet ik niet".
 * Nog steeds niet overgenomen: "Wil je met de microfoon praten?" (Thuisles
 * heeft geen microfoon).
 *
 * JOUW INSTELLINGEN (Customizing the Tutor)
 * Het kind kiest zelf de volgorde uit drie knoppen: de woorden laten
 * oplichten (aan/uit), de naam (klinkt hij goed?) en de letters (gewoon of
 * groot). Na elke keer Bewaar: "nog twee te gaan". Aan het eind de vraag
 * "hoe vind je dat?" met vijf gezichtjes, en de kaart. De keuzes staan alleen
 * op dit apparaat (localStorage, `voorkeuren.ts`), niet in de database.
 * Anders dan Synthesis: geen stemkeuze en geen tempo (er is één stem), geen
 * OpenDyslexic maar gewone of grote letters (opdracht van de eigenaar).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import {
  bewaarUitspraak,
  bewaarVoorkeuren,
  leesVoorkeuren,
  uitspraakVan,
  uitspraakVarianten,
} from "../voorkeuren";
import { IntroInstellingen, type Instelonderdeel, type InstelProps } from "../vlakken/intro-instellingen";
import { IntroKeuzes, type KeuzesProps } from "../vlakken/intro-keuzes";
import { IntroVierkant, type VierkantProps } from "../vlakken/intro-vierkant";

/** Een getekend schermpje: een pijlknop, een invulvak met een 3 en een tegel. */
function KaartBediening() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.2">
      <rect x="18" y="22" width="208" height="146" rx="14" stroke="#7fa9ee" />
      <circle cx="58" cy="64" r="20" stroke="#4b8af5" />
      <path d="M58 54v18M51 65l7 7 7-7" stroke="#4b8af5" />
      <rect x="96" y="44" width="58" height="40" rx="8" stroke="#d6d8e1" />
      <text x="125" y="74" textAnchor="middle" fill="#fde01a" stroke="none" fontSize="28" fontWeight="800">
        3
      </text>
      <rect x="40" y="110" width="80" height="34" rx="8" stroke="#d6d8e1" />
      <path d="M58 127l8 8 14-16" stroke="#3fb34f" />
      <rect x="172" y="96" width="24" height="24" rx="3" stroke="#3bbfe6" />
      <rect x="196" y="96" width="24" height="24" rx="3" stroke="#3bbfe6" />
      <rect x="172" y="120" width="24" height="24" rx="3" stroke="#3bbfe6" />
      <rect x="196" y="120" width="24" height="24" rx="3" stroke="#3bbfe6" />
      <rect x="196" y="72" width="24" height="24" rx="3" stroke="#3bbfe6" />
    </g>
  );
}

/** Kaarttekening voor "Jouw instellingen": een schakelaar, een naamsticker en Aa. */
function KaartInstellingen() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.2">
      <rect x="18" y="22" width="208" height="146" rx="14" stroke="#7fa9ee" />
      <rect x="40" y="46" width="64" height="32" rx="16" stroke="#e0459f" />
      <circle cx="88" cy="62" r="11" stroke="#e0459f" />
      <rect x="126" y="40" width="80" height="54" rx="8" stroke="#e2343f" />
      <path d="M126 56h80" stroke="#e2343f" />
      <path d="M138 80q6-10 11 0t11 0 11-4" stroke="#d6d8e1" />
      <text x="44" y="146" fill="#f5862f" stroke="none" fontSize="26" fontWeight="800">
        a
      </text>
      <text x="64" y="148" fill="#f5862f" stroke="none" fontSize="40" fontWeight="800">
        A
      </text>
      <path d="M136 128l10 10 20-22" stroke="#3fb34f" />
    </g>
  );
}

/** Kiezen met de pijltjestoetsen, in een eigen vlak. Geeft de keuze en of er pijltjes gebruikt zijn. */
async function kiesMetPijltjes(l: Lesgids, opties: string[]): Promise<{ keuze: string; toetsen: boolean }> {
  l.vlak<KeuzesProps>(IntroKeuzes, { opties, actief: false });
  await l.zeg(
    "Met een toetsenbord kun je ook kiezen met de pijltjes.",
    "Pijltje omlaag, pijltje omhoog.",
    "Druk op *Enter* als je gekozen hebt.",
    "Hoe vind je het hier tot nu toe?",
  );
  l.pasVlakAan<KeuzesProps>({ actief: true });
  const g = await l.wachtOpVlak<{ soort: string; keuze: string; toetsen: boolean }>("keuze");
  l.pasVlakAan<KeuzesProps>({ actief: false });
  return { keuze: g.keuze, toetsen: g.toetsen };
}

/** Het schermpje met het vierkant: vastzitten, hulp vragen, de hamer, het vinkje. */
async function vierkantSlaan(l: Lesgids): Promise<void> {
  const zet = (p: Partial<VierkantProps>) => l.pasVlakAan<VierkantProps>(p);
  l.vlak<VierkantProps>(IntroVierkant, { actief: false, hamer: false, wijsHand: false, vinkje: false });
  await l.zeg("Tot slot: je ziet vaak een schermpje.", "Zoals dit.", "Sla het vierkant kapot.");

  /* Zonder hamer gebeurt er niets; tik je op de hand, dan kom je verder. */
  for (let tikken = 0; ; ) {
    zet({ actief: true });
    const g = await l.wachtOpVlak<{ soort: string }>(["vierkant", "hand"]);
    zet({ actief: false });
    if (g.soort === "hand") break;
    tikken++;
    if (tikken === 1) {
      await l.zeg("Er gebeurt niets.", "Zit je vast?", "Tik dan op de hand.");
      zet({ wijsHand: true });
    } else {
      await l.zeg("Tik op de hand.", "Die staat linksboven.");
    }
  }

  zet({ wijsHand: false });
  await l.zeg("Tot je dienst!", "Zit je vast, dan mag je altijd hulp vragen.", "In de lessen doe je dat met *Weet ik niet*.");
  await l.zeg("O, ik ben vergeten je een hamer te geven.");
  zet({ hamer: true });
  await l.zeg("Alsjeblieft.", "Sla maar!");
  for (;;) {
    zet({ actief: true });
    const g = await l.wachtOpVlak<{ soort: string; kapot?: boolean }>(["vierkant", "hand"]);
    zet({ actief: false });
    if (g.soort === "vierkant" && g.kapot) break;
    await l.zeg("Je hebt de hamer al.", "Tik op het vierkant.");
  }

  await l.zeg("Ja, zo!", "Het vierkant is in twee stukken.", "Ben je klaar?", "Tik dan op het blauwe vinkje.");
  zet({ vinkje: true });
  for (;;) {
    zet({ actief: true });
    const g = await l.wachtOpVlak<{ soort: string }>(["klaar", "hand"]);
    zet({ actief: false });
    if (g.soort === "klaar") break;
    await l.zeg("Je bent al klaar.", "Tik op het blauwe vinkje.");
  }
  await l.zeg("Mooi.", "Met het vinkje laat je weten dat je klaar bent.");
  l.vlak(null);
}

export const LESSEN_ZO_WERKT_HET: Lesdraaiboek[] = [
  {
    id: "intro-zo-werkt-het",
    titel: "Zo werkt het",
    synthesis: "Getting Started · Inputs",
    kaarttekening: KaartBediening,

    async speel(l) {
      /* 0. Snel of langzaam. */
      await l.zeg(
        l.naam ? `Hoi ${l.naam}!` : "Hoi!",
        "Misschien heeft iemand het je al verteld.",
        "Je leert hier in je eigen tempo.",
        "Leer jij liever snel of langzaam?",
      );
      const tempo = await l.kies(["Snel", "Langzaam"]);
      if (tempo === null) {
        await l.zeg("Geen zorgen.", "Dat merken we vanzelf.");
      } else {
        bewaarVoorkeuren({ tempo: tempo === "Snel" ? "snel" : "langzaam" });
        await l.zeg(tempo === "Snel" ? "Mooi, snel dus." : "Mooi, rustig aan dus.");
      }

      /* 1. De pijl. */
      await l.zeg("Ik laat je eerst zien hoe alles werkt.");
      await l.zeg("Zie je de blauwe pijl?", "Tik erop om verder te gaan.");
      await l.verder();
      await l.zeg("Goed zo.", "Met een toetsenbord kan het ook.", "Druk dan op *Enter*.", "Probeer maar.");
      await l.verder();
      await l.zeg("Mooi.", "Tikken of Enter, het mag allebei.");
      await l.verder();

      /* 2. Kiezen en bevestigen. */
      await l.zeg("Soms mag je kiezen.", "Tik op een knop.", "Tik daarna op het blauwe vinkje.", "Welk getal vind jij het mooist?");
      const mooi = await l.kies(["3", "5", "8"]);
      if (mooi === null) {
        await l.zeg("Je tikte op *Weet ik niet*.", "Dat mag ook!", "Daar kom ik zo op terug.");
      } else {
        await l.zeg(`De {${mooi}}?`, "Dat is een mooi getal.", "Pas als je op het vinkje tikt, telt je keuze.");
      }
      await l.verder();

      /* 2b. Keuzes voorlezen? */
      await l.zeg("Sommige kinderen willen dat ik de keuzes voorlees.", "Wil jij dat ook?");
      const voorlezen = await l.kies(["Ja, graag", "Nee, hoeft niet"]);
      if (voorlezen === null) {
        await l.zeg("Geen zorgen.", "Dan lees ik ze niet voor.", "Je kunt het later nog veranderen.");
        bewaarVoorkeuren({ keuzesVoorlezen: false });
      } else if (voorlezen === "Ja, graag") {
        bewaarVoorkeuren({ keuzesVoorlezen: true });
        await l.zeg("Goed, dat onthoud ik.");
      } else {
        bewaarVoorkeuren({ keuzesVoorlezen: false });
        await l.zeg("Geen probleem.");
      }

      /* 2c. Kiezen met de pijltjes en Enter. */
      const p = await kiesMetPijltjes(l, ["Leuk", "Gaaf", "Prachtig", "Fantastisch"]);
      await l.zeg(`Fijn dat je het ${p.keuze.toLowerCase()} vindt.`);
      if (!p.toetsen) await l.zeg("Tikken mag ook.", "Op een tablet is dat het makkelijkst.");
      await l.zeg("Met *Enter* zeg je dat je gekozen hebt.");
      l.vlak(null);
      await l.verder();

      /* 3. Weet ik niet. */
      await l.zeg("Weet je iets niet?", "Tik dan op *Weet ik niet*.", "Dan help ik je.", "Probeer het maar eens.");
      for (let poging = 1; ; poging++) {
        const k = await l.kies(["1", "2", "3"]);
        if (k === null) {
          await l.zeg("Ja, precies.", "Zo vraag je om hulp.", "Dat is helemaal niet erg.");
          break;
        }
        if (poging >= 2) {
          await l.zeg("Ook goed.", "Onthoud: *Weet ik niet* staat altijd onder de knoppen.");
          break;
        }
        await l.zeg(`Je koos de {${k}}.`, "Tik nu eens op de knop *Weet ik niet*.");
      }
      await l.verder();

      /* 4. Een getal typen. */
      await l.zeg("Soms typ je een getal.", "Er komt dan een vakje.", "Typ maar een {3}.", "Tik daarna op het vinkje.");
      for (let poging = 1; ; poging++) {
        const x = await l.getal();
        if (x === 3) {
          await l.zeg("Goed zo!", "Op een tablet komt het toetsenbord vanzelf.", "Op een laptop mag je ook op Enter drukken.");
          break;
        }
        if (poging >= 3) {
          await l.zeg("Goed geprobeerd.", "Je weet nu waar het vakje staat.");
          break;
        }
        if (x === null) await l.zeg("Geen zorgen.", "Tik in het vakje.", "Typ dan een {3}.");
        else await l.zeg(`Je typte {${x}}.`, "Typ nu een {3}.", "Dat is het getal met de gele kleur.");
      }
      await l.verder();

      /* 5. Een tegel slepen. */
      l.bak([1, 2, 3, 4, 5]);
      await l.zeg("Dit zijn tegels.", "Pak een tegel uit de bak.", "Sleep hem naar het grote vak.");
      const a = await l.pak({ hand: true, hulp: ["Zet je vinger op een tegel.", "Schuif hem naar het vak."] });
      l.leg(a);
      await l.zeg("Goed zo!", `Je hebt de {${a}} in het vak gezet.`);
      await l.leeg();
      l.uitBak(a);
      await l.zeg("Het kan ook anders.", "Tik eerst op een tegel.", "Tik daarna in het vak.");
      const b = await l.pak({ hulp: ["Tik op een tegel in de bak.", "Tik dan in het vak."] });
      l.leg(b);
      await l.zeg("Zo kan het ook.", "Slepen of tikken, het mag allebei.");
      await l.verder();
      await l.leeg();

      /* 6. Een schermpje: het vierkant. */
      l.bak([]);
      await vierkantSlaan(l);

      /* Einde: de kaart. */
      l.bak([]);
      const tik = l.kaart();
      await l.zeg("Nu weet je hoe alles werkt.", "Je hebt het helemaal goed gedaan.", "Tik op de kaart om hem af te vinken.");
      await tik;
    },
  },

  {
    id: "intro-instellingen",
    titel: "Jouw instellingen",
    synthesis: "Getting Started · Customizing the Tutor",
    kaarttekening: KaartInstellingen,

    async speel(l) {
      let v = leesVoorkeuren();
      const gedaan: Instelonderdeel[] = [];
      const zet = (p: Partial<InstelProps>) => l.pasVlakAan<InstelProps>(p);
      const wachtOpBewaar = async () => {
        zet({ actief: true });
        const g = await l.wachtOpVlak<{ soort: string; waarde: unknown }>("bewaar");
        zet({ actief: false });
        return g.waarde;
      };

      l.vlak<InstelProps>(IntroInstellingen, {
        scherm: "menu",
        actief: false,
        gedaan: [],
        oplichten: v.oplichten,
        letters: v.letters,
        naam: l.naam,
        uitspraak: uitspraakVan(l.naam, v),
        varianten: [],
      });
      await l.zeg(
        l.naam ? `Hoi ${l.naam}.` : "Hoi.",
        "We kennen elkaar al een beetje.",
        "Maar we kunnen samen nog wat instellen.",
      );
      await l.zeg(
        "De roze knop is voor het oplichten van de woorden.",
        "De groene knop is voor je naam.",
        "De oranje knop is voor de letters.",
        "Wat wil je eerst doen?",
      );

      while (gedaan.length < 3) {
        zet({ scherm: "menu", gedaan: [...gedaan], actief: true });
        const { keuze } = await l.wachtOpVlak<{ soort: string; keuze: Instelonderdeel }>("menu");
        zet({ actief: false });
        if (gedaan.includes(keuze)) continue;

        if (keuze === "oplichten") {
          zet({ scherm: "oplichten", oplichten: v.oplichten });
          await l.zeg(
            "Mogen de woorden oplichten als ik voorlees?",
            "Zoals hier.",
            "Tik op *Aan* of *Uit*.",
            "Tik daarna op de groene knop.",
          );
          const aan = (await wachtOpBewaar()) === true;
          v = bewaarVoorkeuren({ oplichten: aan });
          await l.zeg(aan ? "Goed, de woorden lichten op." : "Goed, de woorden lichten niet op.", "Een prima keuze.");
        } else if (keuze === "letters") {
          zet({ scherm: "letters", letters: v.letters });
          await l.zeg(
            "Wil je gewone letters, of grote letters?",
            "Tik op *Gewoon* of *Groot*.",
            "Dan zie je hoe het eruitziet.",
            "Tik daarna op de groene knop.",
          );
          const groot = (await wachtOpBewaar()) === "groot";
          v = bewaarVoorkeuren({ letters: groot ? "groot" : "gewoon" });
          await l.zeg(groot ? "Goed, ik gebruik grote letters." : "Goed, de letters blijven gewoon.", "Goed gedaan.");
        } else if (!l.naam) {
          await l.zeg("Ik weet je naam nog niet.", "Een grote mens kan hem invullen bij je profiel.");
        } else {
          zet({ scherm: "naam", varianten: [], uitspraak: uitspraakVan(l.naam, v) });
          await l.zeg(
            `Ik noem je ${l.naam}.`,
            "Tik op *Luister*.",
            "Dan hoor je hoe ik je naam zeg.",
            "Klopt dat?",
          );
          zet({ actief: true });
          const klopt = await l.kies(["Ja", "Nee"]);
          zet({ actief: false });
          if (klopt === "Ja") {
            await l.zeg(`Mooi zo, ${l.naam}!`);
          } else if (klopt === null) {
            await l.zeg("Geen zorgen.", "We laten het zo.");
          } else {
            const huidig = uitspraakVan(l.naam, v);
            const varianten = [...new Set([huidig, ...uitspraakVarianten(l.naam)])].slice(0, 6);
            zet({ varianten });
            await l.zeg(
              "Dan proberen we het anders.",
              "Tik op een knop en luister.",
              "Kies de knop die goed klinkt.",
              "Tik daarna op de groene knop.",
            );
            const w = await wachtOpBewaar();
            if (typeof w === "string" && w.trim()) {
              v = bewaarUitspraak(l.naam, w);
              await l.zeg("Dank je.", "Zo zeg ik je naam vanaf nu.");
            } else {
              await l.zeg("Goed, we laten het zo.", "Een grote mens kan het later nog typen.");
            }
          }
        }

        gedaan.push(keuze);
        const over = 3 - gedaan.length;
        if (over === 2) await l.zeg("Nog twee te gaan.");
        else if (over === 1) await l.zeg("Nog één te gaan.");
      }

      /* Hoe voel je je erbij? */
      zet({ scherm: "gevoel" });
      await l.zeg("Ik ga je helpen met leren.", "Hoe vind je dat?", "Tik op een gezichtje.", "Tik daarna op de groene knop.");
      zet({ actief: true });
      const { n } = await l.wachtOpVlak<{ soort: string; n: number }>("gevoel");
      zet({ actief: false });
      if (n >= 3) await l.zeg("Mooi!", "Ik heb er ook zin in.");
      else if (n === 2) await l.zeg("Dank je dat je het zegt.", "We gaan het rustig samen doen.");
      else await l.zeg("Dank je dat je het zegt.", "Het is ook allemaal nieuw.", "We doen het rustig, samen.");

      /* Einde: de kaart. */
      l.vlak(null);
      l.bak([]);
      const tik = l.kaart();
      await l.zeg("Nu staat alles goed voor jou.", "Tik op de kaart om hem af te vinken.");
      await tik;
    },
  },
];
