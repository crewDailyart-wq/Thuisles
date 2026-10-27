"use client";

/**
 * Flitskaarten als hologrammen in Bliepo's ruimte (27 oktober 2026, opdracht
 * eigenaar; LESSENPLAN.md G1 en de andere flitslessen). Zelfde verloop en
 * zelfde meldingen als het oude flitskaartvenster (`flitsen-kaart.tsx`, blijft
 * bestaan), naar Synthesis "Flashcards":
 *
 * - geen donker bord: de blauwe ruimte blijft de achtergrond; Bliepo tovert
 *   met een lichtstraal uit de vloer een gloeiende hologramkaart tevoorschijn;
 * - op de kaart stippen in een vast patroon (dobbelsteen voor 1 t/m 6,
 *   tienveld voor 7 t/m 10, met lege plekken), of een som;
 * - het kind kiest uit 4 grote cijferknoppen; een foute knop wordt grijs en
 *   het kind kiest opnieuw (zoals Synthesis); goed = een rustige lichtgolf;
 * - oefenen met bolletjes onderaan, en een race tegen een lichtvisje;
 * - gloed uit de centrale instelling (lib/phaser/gloed.ts), in Phaser
 *   (HARDE REGEL 7).
 *
 * Meldingen: `keuze`, `oefenKlaar`, `raceKlaar`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { antwoordVan, RACE_STAPPEN, tijdTekst, type Flitskaart, type FlitsProps, type Flitsknop } from "./flitsen-kaart";
import { holoBasis, WERELDKLEUR, WARM } from "../holo/basis";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { KeuzeKnoppen, vierKeuzes } from "../holo/keuzes";
import { IkoonKnop, type Ikoon } from "../ikonen";
import s from "./flitsen-hologram.module.css";

export type HologramProps = FlitsProps & {
  /** Waar het kind tegen racet (standaard een lichtvisje). */
  tegenstander?: string;
  /** In welke wereld de les speelt (kleur van het hologram). */
  wereld?: keyof typeof WERELDKLEUR;
};

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

const KAART = { x: 490, y: 250, b: 400, h: 250 };
const BAAN = { y: 652, van: 150, tot: 800 };

/** Stippen in een vast patroon: dobbelsteen (1–6) of tienveld (7–10), met de lege plekken. */
function stipPlekken(n: number): { x: number; y: number; vol: boolean }[] {
  const dob: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-56, 50], [56, -50]],
    3: [[-70, 54], [0, 0], [70, -54]],
    4: [[-56, -50], [56, -50], [-56, 50], [56, 50]],
    5: [[-62, -54], [62, -54], [0, 0], [-62, 54], [62, 54]],
    6: [[-56, -62], [56, -62], [-56, 0], [56, 0], [-56, 62], [56, 62]],
  };
  if (n <= 6) return (dob[n] ?? []).map(([x, y]) => ({ x, y, vol: true }));
  return Array.from({ length: 10 }, (_, i) => ({ x: -136 + (i % 5) * 68, y: i < 5 ? -38 : 38, vol: i < n }));
}

/* ---------- de scène ---------- */

interface FlitsScene {
  toonKaart(kaart: Flitskaart | null, toveren?: boolean): void;
  goed(): void;
  fout(): void;
  weg(): void;
  voortgang(lijst: ("goed" | "fout" | null)[] | null): void;
  race(zichtbaar: boolean, kind?: number, tegen?: number): void;
}

function maakFlitsScene(kleur: number) {
  return (Phaser: typeof import("phaser"), rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    class Flits extends Basis implements FlitsScene {
      kaart: import("phaser").GameObjects.Container | null = null;
      bollen: import("phaser").GameObjects.Image[] = [];
      baan: import("phaser").GameObjects.Container | null = null;
      kindPion: import("phaser").GameObjects.Image | null = null;
      tegenPion: import("phaser").GameObjects.Image | null = null;

      constructor() {
        super("flits");
      }

      maak() {
        const hex = `#${kleur.toString(16).padStart(6, "0")}`;
        /* De hologramkaart: een afgeronde rechthoek met een dunne, lichte rand en scanlijntjes. */
        this.canvasPlaatje("kaart", KAART.b, KAART.h, (c) => {
          const pad = () => {
            c.beginPath();
            c.roundRect(3, 3, KAART.b - 6, KAART.h - 6, 26);
          };
          pad();
          c.fillStyle = "rgba(10,40,95,0.55)";
          c.fill();
          c.save();
          pad();
          c.clip();
          c.strokeStyle = "rgba(190,240,255,0.07)";
          c.lineWidth = 1;
          for (let y = 0; y < KAART.h; y += 6) {
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(KAART.b, y);
            c.stroke();
          }
          c.restore();
          pad();
          c.strokeStyle = hex;
          c.lineWidth = 3;
          c.stroke();
        });
        this.bak("kaart", "kaart-gloed", kleur);
        /* Een stip: helder en egaal (goed te tellen), met een smal lichtje. */
        this.canvasPlaatje("stip", 52, 52, (c) => {
          const g = c.createRadialGradient(20, 18, 2, 26, 26, 24);
          g.addColorStop(0, "#ffffff");
          g.addColorStop(0.5, "#c9fbf4");
          g.addColorStop(1, "#45d6c4");
          c.fillStyle = g;
          c.beginPath();
          c.arc(26, 26, 23, 0, Math.PI * 2);
          c.fill();
        });
        this.bak("stip", "stip-gloed", 0x7ff0e2);
        /* Een lege plek in het tienveld: goed zichtbaar, zodat je ziet hoeveel er aan 10 ontbreken. */
        this.canvasPlaatje("plek", 52, 52, (c) => {
          c.fillStyle = "rgba(20,60,120,0.45)";
          c.beginPath();
          c.arc(26, 26, 21, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = "rgba(190,240,255,0.8)";
          c.lineWidth = 2.5;
          c.setLineDash([5, 4]);
          c.beginPath();
          c.arc(26, 26, 21, 0, Math.PI * 2);
          c.stroke();
        });
        /* Bolletjes voor de voortgang. */
        for (const [sl, kl] of [
          ["bol-leeg", "rgba(160,220,255,0.4)"],
          ["bol-goed", "#8ff0c0"],
          ["bol-fout", "#ff9eab"],
        ] as const) {
          this.canvasPlaatje(sl, 30, 30, (c) => {
            c.beginPath();
            c.arc(15, 15, 11, 0, Math.PI * 2);
            if (sl === "bol-leeg") {
              c.strokeStyle = kl;
              c.lineWidth = 2;
              c.stroke();
            } else {
              c.fillStyle = kl;
              c.fill();
            }
          });
        }
        /* Race: jij bent een stip, de tegenstander een lichtvisje. */
        this.canvasPlaatje("visje", 70, 40, (c) => {
          c.fillStyle = "rgba(255,211,110,0.95)";
          c.beginPath();
          c.ellipse(32, 20, 22, 12, 0, 0, Math.PI * 2);
          c.fill();
          c.beginPath();
          c.moveTo(10, 20);
          c.lineTo(0, 8);
          c.lineTo(0, 32);
          c.closePath();
          c.fill();
          c.fillStyle = "#1b2a44";
          c.beginPath();
          c.arc(44, 17, 2.6, 0, Math.PI * 2);
          c.fill();
        });
        this.bak("visje", "visje-gloed", WARM);
      }

      toonKaart(kaart: Flitskaart | null, toveren = true) {
        this.kaart?.destroy();
        this.kaart = null;
        if (!kaart) return;
        const groep = this.add.container(KAART.x, KAART.y);
        groep.add(this.plaats("kaart-gloed", 0, 0));
        if (kaart.soort === "stippen") for (const p of stipPlekken(kaart.n)) groep.add(this.plaats(p.vol ? "stip-gloed" : "plek", p.x, p.y));
        this.kaart = groep;
        if (toveren) this.tover(groep);
      }

      goed() {
        if (this.kaart) this.golf(KAART.x, KAART.y);
      }

      fout() {
        if (this.kaart) this.schud(this.kaart);
      }

      weg() {
        const k = this.kaart;
        this.kaart = null;
        if (k) this.verdwijn(k);
      }

      voortgang(lijst: ("goed" | "fout" | null)[] | null) {
        this.bollen.forEach((b) => b.destroy());
        this.bollen = [];
        if (!lijst) return;
        const stap = lijst.length > 12 ? 34 : 44;
        lijst.forEach((u, k) => {
          const sl = u === "goed" ? "bol-goed" : u === "fout" ? "bol-fout" : "bol-leeg";
          this.bollen.push(this.plaats(sl, KAART.x - ((lijst.length - 1) * stap) / 2 + k * stap, 656));
        });
      }

      race(zichtbaar: boolean, kind = 0, tegen = 0) {
        if (!zichtbaar) {
          this.baan?.destroy();
          this.baan = null;
          this.kindPion = null;
          this.tegenPion = null;
          return;
        }
        if (!this.baan) {
          const lijn = this.add.graphics();
          lijn.lineStyle(3, kleur, 0.5);
          for (let x = BAAN.van; x < BAAN.tot; x += 18) lijn.lineBetween(x, BAAN.y, x + 10, BAAN.y);
          const finish = this.add.graphics();
          finish.lineStyle(3, 0xffffff, 0.85);
          finish.lineBetween(BAAN.tot + 30, BAAN.y - 40, BAAN.tot + 30, BAAN.y + 30);
          this.kindPion = this.plaats("stip-gloed", BAAN.van, BAAN.y - 18);
          this.tegenPion = this.plaats("visje-gloed", BAAN.van, BAAN.y + 22);
          this.baan = this.add.container(0, 0, [lijn, finish, this.kindPion, this.tegenPion]);
        }
        const x = (f: number) => BAAN.van + Math.min(1, f) * (BAAN.tot - BAAN.van);
        if (this.kindPion) this.tweens.add({ targets: this.kindPion, x: x(kind), duration: this.rustig ? 1 : 260, ease: "Cubic.easeOut" });
        this.tegenPion?.setX(x(tegen));
      }

      demo(ms: number) {
        const eind = performance.now() + ms;
        let n = 3;
        const stap = () => {
          if (performance.now() > eind) return;
          this.toonKaart({ soort: "stippen", n: (n++ % 10) + 1 });
          this.time.delayedCall(420, () => this.goed());
          this.time.delayedCall(800, stap);
        };
        stap();
      }
    }
    return Flits as unknown as new () => import("phaser").Scene;
  };
}

/* ---------- de inhoud van een somkaart (scherpe HTML-tekst op de hologramkaart) ---------- */

function SomOpKaart({ kaart, opgelost }: { kaart: Flitskaart; opgelost: boolean }) {
  if (kaart.soort === "stippen") return null;
  return (
    <div className={s.som} aria-hidden>
      {kaart.soort === "som" ? (
        <span>
          {kaart.a} {kaart.op} {kaart.b}
        </span>
      ) : (
        <span>
          {kaart.a} + <span className={s.gat}>{opgelost ? kaart.doel - kaart.a : ""}</span> = {kaart.doel}
        </span>
      )}
    </div>
  );
}

/* ---------- oefenen of racen ---------- */

function Spel({
  race,
  stapel,
  haasTijd,
  meld,
  scene,
}: {
  race: boolean;
  stapel: Flitskaart[];
  haasTijd: number;
  meld: Vlakbasis["meld"];
  scene: FlitsScene | null;
}) {
  const aantal = race ? RACE_STAPPEN : stapel.length;
  const [aftel, setAftel] = useState(race ? 4 : 0);
  const [nu, setNu] = useState(0);
  const [i, setI] = useState(0);
  const [uitslagen, setUitslagen] = useState<("goed" | "fout" | null)[]>(() => Array(aantal).fill(null));
  const [stappen, setStappen] = useState(0);
  const [uit, setUit] = useState<number[]>([]);
  const [opgelost, setOpgelost] = useState(false);
  const [klaar, setKlaar] = useState(false);

  const begin = useRef<number | null>(null);
  const bezig = useRef(false);
  const fouten = useRef(0);
  const stappenRef = useRef(0);
  const goedRef = useRef(0);
  const afgelopen = useRef(false);

  const kaart = stapel[i % stapel.length];
  const antwoord = antwoordVan(kaart);
  const speelt = !race || aftel === 0;
  /* Vier keuzes per kaart, vast zolang de kaart staat. */
  const keuzes = useMemo(() => vierKeuzes(antwoord, kaart.soort === "stippen" ? 1 : 0, kaart.soort === "stippen" ? 10 : 20), [antwoord, kaart.soort]);

  useEffect(() => {
    if (!scene || !speelt || afgelopen.current) return;
    scene.toonKaart(kaart);
    /* Voor de automatische test: welk antwoord er nu hoort. */
    window.__phaser = { ...window.__phaser, antwoord };
  }, [scene, speelt, kaart, i, antwoord]);

  useEffect(() => {
    scene?.voortgang(race ? null : uitslagen);
  }, [scene, race, uitslagen]);

  useEffect(() => {
    scene?.race(race, stappen / RACE_STAPPEN, race ? Math.min(1, nu / haasTijd) : 0);
  }, [scene, race, stappen, nu, haasTijd]);

  useEffect(
    () => () => {
      scene?.weg();
      scene?.voortgang(null);
      scene?.race(false);
    },
    [scene],
  );

  useEffect(() => {
    if (!race || aftel === 0 || aftel === 4) return;
    const t = setTimeout(() => {
      if (aftel === 1) begin.current = performance.now();
      setAftel(aftel - 1);
    }, 850);
    return () => clearTimeout(t);
  }, [race, aftel]);

  useEffect(() => {
    if (!race || aftel > 0 || klaar) return;
    const t = setInterval(() => {
      if (begin.current === null || afgelopen.current) return;
      const sec = (performance.now() - begin.current) / 1000;
      setNu(sec);
      if (sec >= haasTijd) {
        afgelopen.current = true;
        setKlaar(true);
        meld({ soort: "raceKlaar", gewonnen: false, tijd: haasTijd });
      }
    }, 100);
    return () => clearInterval(t);
  }, [race, aftel, klaar, haasTijd, meld]);

  function volgende() {
    bezig.current = true;
    if (race) {
      stappenRef.current += 1;
      setStappen(stappenRef.current);
    }
    setTimeout(() => scene?.weg(), 300);
    setTimeout(() => {
      if (afgelopen.current) return;
      const klaarNu = race ? stappenRef.current >= RACE_STAPPEN : i + 1 >= aantal;
      if (klaarNu) {
        afgelopen.current = true;
        setKlaar(true);
        if (race) {
          const tijd = begin.current === null ? 0 : (performance.now() - begin.current) / 1000;
          setNu(tijd);
          meld({ soort: "raceKlaar", gewonnen: tijd < haasTijd, tijd });
        } else {
          meld({ soort: "oefenKlaar", goed: goedRef.current, van: aantal });
        }
        return;
      }
      fouten.current = 0;
      setUit([]);
      setOpgelost(false);
      setI((x) => x + 1);
      bezig.current = false;
    }, 560);
  }

  function kies(o: number | string) {
    if (bezig.current || !speelt || klaar) return;
    const x = Number(o);
    if (x === antwoord) {
      if (fouten.current === 0) goedRef.current += 1;
      if (!race) setUitslagen((u) => u.map((v, j) => (j === i ? (v === "fout" ? "fout" : "goed") : v)));
      setOpgelost(true);
      scene?.goed();
      volgende();
      return;
    }
    /* Fout: de knop wordt grijs, de kaart schudt even, het kind kiest opnieuw (zoals Synthesis). */
    fouten.current += 1;
    if (!race) setUitslagen((u) => u.map((v, j) => (j === i ? "fout" : v)));
    setUit((l) => [...l, x]);
    scene?.fout();
  }

  return (
    <>
      {race && <div className={s.klok}>{tijdTekst(nu)} s</div>}
      {speelt && !klaar && <SomOpKaart kaart={kaart} opgelost={opgelost} />}

      {race && aftel === 4 && (
        <div className={s.midden}>
          <IkoonKnop ikoon="start" label="Start" knop="start" kleur="groen" className={s.groot} autoFocus onClick={() => setAftel(3)} />
        </div>
      )}
      {race && aftel > 0 && aftel < 4 && (
        <div key={aftel} className={s.aftellen}>
          {aftel}
        </div>
      )}

      {speelt && !klaar && <KeuzeKnoppen className={s.keuzes} opties={keuzes} uit={uit} goed={opgelost ? antwoord : null} kies={kies} />}
    </>
  );
}

/* ---------- het vlak ---------- */

const KNOP: Record<Flitsknop, { tekst: string; ikoon: Ikoon; kleur: "groen" | "oranje" | "roze" }> = {
  race: { tekst: "Race", ikoon: "race", kleur: "groen" },
  oefenen: { tekst: "Oefenen", ikoon: "start", kleur: "oranje" },
  verder: { tekst: "Nog eens oefenen", ikoon: "opnieuw", kleur: "oranje" },
  opnieuw: { tekst: "Nog eens racen", ikoon: "race", kleur: "groen" },
  klaar: { tekst: "Klaar", ikoon: "klaar", kleur: "roze" },
};

export function FlitsHologram(p: HologramProps & Vlakbasis) {
  const { titel, stapel, voorbeeld, fase, ronde, actief, best, haasTijd, uitslag, knoppen, meld, schaal, wereld = "oceaan" } = p;
  const { plek, scene } = useHoloMotor<FlitsScene>(schaal, maakFlitsScene(WERELDKLEUR[wereld]));

  /* Op het startscherm staat de voorbeeldkaart; bij de uitslag niets. */
  useEffect(() => {
    if (!scene) return;
    if (fase === "start") scene.toonKaart(voorbeeld);
    if (fase === "uitslag") scene.toonKaart(null);
  }, [scene, fase, voorbeeld]);

  const knop = (k: Flitsknop) => (
    <IkoonKnop
      key={k}
      ikoon={KNOP[k].ikoon}
      label={KNOP[k].tekst}
      knop={k}
      kleur={KNOP[k].kleur}
      className={s.groot}
      disabled={!actief}
      onClick={() => meld({ soort: "keuze", keuze: k })}
    />
  );

  return (
    <div className={s.vlak}>
      <div ref={plek} style={HOLO_CANVAS} aria-hidden />

      {fase === "start" && (
        <>
          <SomOpKaart kaart={voorbeeld} opgelost={false} />
          <div className={s.start}>
            <h2 className={s.titel}>{titel}</h2>
            {best !== null && <p className={s.best}>{`${tijdTekst(best)} s`}</p>}
            <div className={s.knoppen}>{knoppen.map(knop)}</div>
          </div>
        </>
      )}

      {(fase === "oefenen" || fase === "race") && (
        <Spel key={`${fase}-${ronde}`} race={fase === "race"} stapel={stapel} haasTijd={haasTijd} meld={meld} scene={scene} />
      )}

      {fase === "uitslag" && uitslag && (
        <div className={s.uitslag}>
          <h2>{uitslag.kop}</h2>
          <div className={s.knoppen}>{knoppen.map(knop)}</div>
        </div>
      )}
    </div>
  );
}
