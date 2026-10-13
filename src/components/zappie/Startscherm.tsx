"use client";

/**
 * De Zappie-startpagina voor groep 3, tweede ontwerp.
 *
 * Voorbeeld: ontwerp/zappie/voorbeeld-startpagina-2.webp. Op een groot scherm
 * staat alles op vaste plekken in een 16:9-vlak dat met het scherm meeschaalt
 * (zie `zappie.css`); op telefoon en staande tablet staat alles onder elkaar.
 *
 * Wat er leeft:
 * - de werelden zweven, elk op een eigen tempo; het gouden ontdekpad laat zien
 *   hoeveel missies er in de huidige wereld klaar zijn (één lichtje per missie);
 * - Zappie rolt binnen, zwaait en wijst daarna naar "Begin je missie". Een tik
 *   op hem, op een dichte wereld of op IEP Sprong en hij zegt iets;
 * - na een missie (fase 5): de tokens tellen op, een gouden lichtje vliegt naar
 *   de wereld, die licht even op, en het nieuwe lichtje op het pad gaat aan.
 *   Komt er een plek vrij in Jouw wereld, dan valt daar een gouden lichtstraal.
 *   Dat volgt uit de opgeslagen voortgang, niet uit een klik.
 */

import Link from "next/link";
import { OntdekkingsReis } from "@/components/zappie/OntdekkingsReis";
import { ScrollReis } from "@/components/zappie/ScrollReis";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  HandPijl,
  IcoonBerg,
  IcoonBlad,
  IcoonBoeken,
  IcoonCadeau,
  IcoonGolf,
  IcoonKompas,
  IcoonPijl,
  IcoonRaket,
  IcoonSlot,
  IcoonSpiraal,
} from "@/components/zappie/Iconen";
import { Tekstballon, Wereldbeeld } from "@/components/zappie/Onderdelen";
import { Tokenteller } from "@/components/zappie/Schil";
import { Zappie, type Houding, type Stemming } from "@/components/zappie/Zappie";
import { useVoortgang, wisGebeurtenis } from "@/lib/zappie/opslag";
import {
  beloningStand,
  volgendeMissie,
  wereldStanden,
  type Gebeurtenis,
  type WereldStand,
} from "@/lib/zappie/voortgang";
import { ASSETS, type WereldId } from "@/lib/zappie/werelden";

type Bericht = { tekst: string; stemming: Stemming };

const HULP: Bericht[] = [
  { tekst: "Druk op Begin je missie. Dan gaan we samen oefenen!", stemming: "blij" },
  { tekst: "Met elke missie gaat er een lichtje aan op het pad.", stemming: "kijk" },
  { tekst: "Verzamel tokens. Dan komen er plekken vrij in jouw wereld!", stemming: "blij" },
];

const WERELDICOON: Record<WereldId, (p: { className?: string }) => React.ReactNode> = {
  oceaan: IcoonGolf,
  aarde: IcoonBlad,
  heelal: IcoonSpiraal,
};

/*
  Het ontdekpad: per stuk een gebogen lijn (begin, buigpunt, eind) in de maat
  van het wereldenvlak. Groot scherm: 78 bij 34; telefoon: 78 bij 48.
*/
type Punt = [number, number];
const PADEN: Record<"breed" | "smal", { vak: Punt; stukken: [Punt, Punt, Punt][] }> = {
  breed: {
    vak: [78, 34],
    stukken: [
      [[31.4, 22.3], [34.8, 28.2], [38.2, 20.5]],
      [[51.6, 12.8], [55, 7.2], [58.2, 14.4]],
    ],
  },
  smal: {
    vak: [78, 48],
    stukken: [
      [[41, 18.6], [45, 11.6], [49.8, 13.4]],
      [[61, 23.4], [66.4, 26.2], [64.6, 31.4]],
    ],
  },
};
const LICHTJES = 12;

function opBocht([a, b, c]: [Punt, Punt, Punt], t: number): Punt {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
}

const geenAbonnement = () => () => {};

export function Startscherm() {
  const router = useRouter();
  const v = useVoortgang();
  const inBrowser = useSyncExternalStore(geenAbonnement, () => true, () => false);
  const standen = wereldStanden(v);
  const huidig = standen.find((s) => s.huidig) ?? standen[0];
  const volgende = volgendeMissie(v);
  const missieAdres = `/zappie/oefenen?wereld=${volgende.wereld}&missie=${volgende.nummer}`;
  const beloning = beloningStand(v.punten);

  const [bericht, zetBericht] = useState<Bericht | null>(null);
  const [praat, zetPraat] = useState(false);
  const [tik, zetTik] = useState(0);
  const [hulp, zetHulp] = useState(0);
  const [houding, zetHouding] = useState<Houding>("zwaai");
  const [glimlach, zetGlimlach] = useState(false);
  const [schud, zetSchud] = useState<WereldId | null>(null);
  const [glans, zetGlans] = useState(false);
  const [oplicht, zetOplicht] = useState<WereldId | null>(null);
  const [nieuwLichtje, zetNieuwLichtje] = useState<WereldId | null>(null);
  const [straal, zetStraal] = useState(false);
  const wereldRefs = useRef<Partial<Record<WereldId, HTMLElement | null>>>({});
  const stilte = useRef<number | undefined>(undefined);
  /* De gebeurtenis als tekst, zodat het effect alleen opnieuw start als er echt iets nieuws is. */
  const gebeurtenisSleutel = v.gebeurtenis ? JSON.stringify(v.gebeurtenis) : null;

  /** Zappie iets laten zeggen: ballon, golf beweegt, sprongetje. Daarna weer stil. */
  function zeg(b: Bericht) {
    zetBericht(b);
    zetTik((n) => n + 1);
    zetPraat(true);
    window.clearTimeout(stilte.current);
    const duur = 2200 + b.tekst.length * 35;
    window.setTimeout(() => zetPraat(false), Math.min(duur, 3600));
    stilte.current = window.setTimeout(() => zetBericht(null), duur + 1200);
  }

  /* Zappie zwaait eerst en wijst daarna naar de missieknop; af en toe zwaait hij weer. */
  useEffect(() => {
    const wijs = window.setTimeout(() => zetHouding("wijs"), 3400);
    const opnieuw = window.setInterval(() => {
      zetHouding("zwaai");
      window.setTimeout(() => zetHouding("wijs"), 2600);
    }, 26000);
    return () => {
      window.clearTimeout(wijs);
      window.clearInterval(opnieuw);
    };
  }, []);

  /* Af en toe verandert zijn uitdrukking even: een tevreden glimlach. */
  useEffect(() => {
    const keer = window.setInterval(() => {
      zetGlimlach(true);
      window.setTimeout(() => zetGlimlach(false), 1400);
    }, 9000);
    return () => window.clearInterval(keer);
  }, []);

  /*
   * Fase 5: wat er net verdiend is, één keer laten zien. De gebeurtenis wordt
   * pas gewist als alles is afgespeeld: zou dat eerder gebeuren, dan start dit
   * effect opnieuw en ruimt het de eigen timers op voordat er iets te zien was.
   * Wie halverwege weggaat, krijgt het de volgende keer alsnog te zien.
   */
  useEffect(() => {
    if (!inBrowser || !gebeurtenisSleutel) return;
    const g: Gebeurtenis = JSON.parse(gebeurtenisSleutel);
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const later = (ms: number, f: () => void) => timers.push(window.setTimeout(f, ms));
    let stopVlucht = () => {};

    const aankomst = () => {
      zetOplicht(g.wereld);
      if (!g.vrij) zetNieuwLichtje(g.wereld);
      later(1600, () => zetOplicht(null));
      later(g.nieuwePlekken > 0 ? 4000 : 1800, wisGebeurtenis);
      if (g.nieuwePlekken > 0) {
        later(700, () => {
          zetStraal(true);
          zeg({ tekst: "Er is een nieuwe plek vrij in jouw wereld!", stemming: "juich" });
        });
        later(3800, () => zetStraal(false));
      } else {
        later(400, () =>
          zeg(
            g.vrij
              ? { tekst: `Knap! Je hebt ${g.tokens} tokens verdiend.`, stemming: "juich" }
              : { tekst: "Goed gedaan! Er is weer een lichtje aan op het pad.", stemming: "juich" },
          ),
        );
      }
    };

    later(rustig ? 0 : 500, () => {
      const van = document.querySelector<HTMLElement>(".zp-tokens [data-tokenmunt]");
      const naar = wereldRefs.current[g.wereld];
      if (rustig || !van || !naar) {
        aankomst();
        return;
      }
      stopVlucht = vliegLichtje(van, naar, aankomst);
    });
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      stopVlucht();
    };
  }, [inBrowser, gebeurtenisSleutel]);

  function kiesWereld(s: WereldStand) {
    if (s.open) return;
    zetSchud(s.wereld.id);
    window.setTimeout(() => zetSchud(null), 600);
    zeg({ tekst: "Maak meer missies om deze wereld te ontdekken!", stemming: "kijk" });
  }

  /** Begin je missie: kort lichtje over de knop, dan naar de missie. */
  function beginMissie(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    zetGlans(true);
    window.setTimeout(() => router.push(missieAdres), 320);
  }

  return (
    <><ScrollReis /><main className="zp-podium" aria-label="Start">
      <h1 className="sr-only">Zappie: begin je missie</h1>

      {/* Zappie en zijn briefje. */}
      <p className="zp-hand zp-notitie zp-notitie-hulp" aria-hidden="true">
        Iets niet duidelijk?
        <br />
        Ik help je graag!
        <HandPijl className="zp-notitie-pijl" />
      </p>
      <div className="zp-zappieplek">
        <button
          type="button"
          className="zp-zappie"
          aria-label="Zappie, tik voor hulp"
          onClick={() => {
            zeg(HULP[hulp % HULP.length]);
            zetHulp((n) => n + 1);
          }}
        >
          <Zappie
            stemming={bericht?.stemming ?? (glimlach ? "blij" : "kijk")}
            praat={praat}
            tik={tik}
            houding={houding}
            binnenrollen
            kijkMee
          />
        </button>
        {bericht && <Tekstballon tekst={bericht.tekst} className="zp-zappieballon" />}
      </div>

      {/* De drie werelden met het ontdekpad ertussen. */}
      <section
        className="zp-werelden"
        aria-label="Werelden"
        data-diepte="voor"
      >
        {(["breed", "smal"] as const).map((soort) => (
          <svg
            key={soort}
            viewBox={`0 0 ${PADEN[soort].vak[0]} ${PADEN[soort].vak[1]}`}
            className={`zp-pad zp-pad-${soort}`}
            aria-hidden="true"
          >
            {PADEN[soort].stukken.map((stuk, i) => {
              const stand = standen[i];
              const aan = stand.open ? stand.klaar : 0;
              return (
                <g key={i} className="zp-padstuk" data-open={stand.open ? "ja" : "nee"}>
                  {Array.from({ length: LICHTJES }, (_, k) => {
                    const [x, y] = opBocht(stuk, (k + 0.5) / LICHTJES);
                    const status = k < aan ? "aan" : stand.huidig && k === aan ? "volgende" : "uit";
                    const nieuw = status === "aan" && k === aan - 1 && nieuwLichtje === stand.wereld.id;
                    return (
                      <circle
                        key={k}
                        cx={x}
                        cy={y}
                        r={soort === "breed" ? 0.3 : 0.42}
                        className={`zp-lichtje${nieuw ? " zp-lichtje-nieuw" : ""}`}
                        data-status={status}
                        style={{ animationDelay: `${(k * 0.28).toFixed(2)}s` }}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        ))}
        {standen.map((s, i) => (
          <WereldKnop
            key={s.wereld.id}
            stand={s}
            plek={i}
            schud={schud === s.wereld.id}
            oplicht={oplicht === s.wereld.id}
            href={s.huidig ? missieAdres : "/zappie/wereld"}
            onDicht={() => kiesWereld(s)}
            refje={(el) => {
              wereldRefs.current[s.wereld.id] = el;
            }}
          />
        ))}
      </section>

      {/* De belangrijkste knop van het scherm. */}
      <div className="zp-missieplek">
        <Link
          href={missieAdres}
          className={`zp-missieknop zp-titel${glans ? " zp-glans" : ""}`}
          onClick={beginMissie}
        >
          <span className="zp-missieknop-kompas">
            <IcoonKompas className="size-full" />
          </span>
          <span>Begin je missie</span>
          <IcoonPijl className="zp-missieknop-pijl" />
        </Link>
      </div>

      {/* Vandaag op ontdekking. */}
      <section className="zp-ontdekking zp-glaspaneel" aria-labelledby="zp-kop-ontdekking">
        <h2 id="zp-kop-ontdekking" className="zp-paneelkop zp-titel">
          <IcoonKompas className="zp-paneelkop-icoon" />
          Vandaag op ontdekking
        </h2>
        <p className="zp-hand zp-notitie zp-notitie-drie" aria-hidden="true">
          <HandPijl className="zp-notitie-pijl" />
          Drie missies voor vandaag.
        </p>
        <ul className="zp-kaarten">
          <li>
            <Link href="/oefenen/rekenen/methode" className="zp-kaart" data-kleur="geel">
              <IcoonBoeken className="zp-kaart-beeld" />
              <span className="zp-kaart-tekst">
                <span className="zp-kaart-naam zp-titel">Schoolpad</span>
                <span className="zp-kaart-zin">Oefen met jouw schoolmethode.</span>
              </span>
              <span className="zp-kaart-pijl" aria-hidden="true">
                <IcoonPijl className="size-[60%]" />
              </span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="zp-kaart"
              data-kleur="groen"
              onClick={() => zeg({ tekst: "IEP Sprong komt er binnenkort aan. Kies nu Schoolpad of Vrije Missie!", stemming: "kijk" })}
            >
              <span className="zp-binnenkort">Binnenkort</span>
              <IcoonBerg className="zp-kaart-beeld" />
              <span className="zp-kaart-tekst">
                <span className="zp-kaart-naam zp-titel">IEP Sprong</span>
                <span className="zp-kaart-zin">Een paar opdrachten voor IEP-voorbereiding.</span>
              </span>
              <span className="zp-kaart-pijl" aria-hidden="true">
                <IcoonPijl className="size-[60%]" />
              </span>
            </button>
          </li>
          <li>
            <Link href="/zappie/oefenen?vrij=1" className="zp-kaart" data-kleur="paars">
              <IcoonRaket className="zp-kaart-beeld" />
              <span className="zp-kaart-tekst">
                <span className="zp-kaart-naam zp-titel">Vrije Missie</span>
                <span className="zp-kaart-zin">Extra oefenen voor meer tokens.</span>
              </span>
              <span className="zp-kaart-pijl" aria-hidden="true">
                <IcoonPijl className="size-[60%]" />
              </span>
            </Link>
          </li>
        </ul>
      </section>

      {/* Tokens en de volgende beloning. */}
      <section className="zp-tokens zp-glaspaneel" aria-label="Jouw tokens">
        <Link href="/zappie/beloningen" className="zp-tokens-link" aria-label="Jouw tokens, naar Beloningen">
          <Tokenteller soort="strook" />
          <span className="zp-rondpijl" aria-hidden="true">
            <IcoonPijl className="size-[55%]" />
          </span>
        </Link>
        <div className="zp-tokens-weg">
          <span className="zp-tokens-wegtekst">Op weg naar je volgende beloning!</span>
          <span
            className="zp-voortgangsbalk"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={beloning.stap}
            aria-valuenow={beloning.opWeg}
            aria-label={`${beloning.opWeg} van de ${beloning.stap} tokens tot de volgende beloning`}
          >
            <span className="zp-voortgangsbalk-vol" style={{ width: `${(beloning.opWeg / beloning.stap) * 100}%` }} />
          </span>
          <IcoonCadeau className="zp-tokens-cadeau" />
        </div>
      </section>

      {/* Jouw wereld: het hele paneel is klikbaar. */}
      <Link
        href="/zappie/mijn-wereld"
        className={`zp-jouwpaneel zp-glaspaneel${straal ? " zp-straal" : ""}`}
        aria-label={`Jouw wereld, ${huidig.wereld.naam}: ga naar mijn wereld`}
      >
        <span className="zp-jouw-eiland" aria-hidden="true">
          <picture>
            <source type="image/avif" srcSet={`${ASSETS}/my-world-island.avif`} />
            <img src={`${ASSETS}/my-world-island.webp`} alt="" loading="lazy" decoding="async" />
          </picture>
          <span className="zp-jouw-water" />
          <span className="zp-jouw-wolk zp-jouw-wolk-1" />
          <span className="zp-jouw-wolk zp-jouw-wolk-2" />
          <span className="zp-jouw-lichtje" style={{ left: "87%", top: "19%" }} />
          <span className="zp-jouw-lichtje" style={{ left: "62%", top: "56%", animationDelay: "-1.3s" }} />
          <span className="zp-jouw-lichtje" style={{ left: "70%", top: "61%", animationDelay: "-2.1s" }} />
          <span className="zp-jouw-twinkel" style={{ left: "44%", top: "36%" }} />
          <span className="zp-jouw-bord zp-titel">
            Jouw
            <br />
            wereld
          </span>
          <span className="zp-jouw-straal" />
        </span>
        <span className="zp-jouw-tekst">
          <span className="zp-jouw-kop">
            <IcoonGolf className="zp-jouw-icoon" />
            <span>
              <span className="zp-jouw-klein zp-titel">Jouw wereld</span>
              <span className="zp-jouw-naam zp-titel">{huidig.wereld.naam}</span>
            </span>
          </span>
          <span className="zp-hand zp-jouw-motto">{huidig.wereld.motto}</span>
          <span className="zp-jouw-uitleg">
            Dit is jouw wereld. Verzamel tokens, ontgrendel nieuwe plekken en maak het helemaal van jou!
          </span>
          <span className="zp-jouw-knop zp-titel">
            Ga naar mijn wereld
            <IcoonPijl className="size-[0.9em]" />
          </span>
        </span>
        <span className="zp-hand zp-notitie zp-notitie-bouw" aria-hidden="true">
          Bouw,
          <br />
          ontdek, groei! ♡
        </span>
      </Link>

      <p className="zp-hand zp-notitie zp-notitie-stappen" aria-hidden="true">
        Kleine stappen.
        <br />
        Grote werelden.
      </p>
    </main><OntdekkingsReis /></>
  );
}

/**
 * Eén wereld: het losse beeld met de naam eronder. Een open wereld is een link;
 * een dichte wereld heeft een slotje en laat Zappie uitleggen hoe je hem opent.
 */
function WereldKnop({
  stand,
  plek,
  schud,
  oplicht,
  href,
  onDicht,
  refje,
}: {
  stand: WereldStand;
  plek: number;
  schud: boolean;
  oplicht: boolean;
  href: string;
  onDicht: () => void;
  refje: (el: HTMLElement | null) => void;
}) {
  const { wereld, open, klaar, huidig } = stand;
  const Icoon = WERELDICOON[wereld.id];
  const zin = huidig ? "Jouw huidige wereld" : open && klaar >= wereld.missies ? "Helemaal ontdekt!" : wereld.uitnodiging;
  const inhoud = (
    <>
      <span className="zp-wereld-parallax">
        <span className="zp-wereld-zweef">
          <Wereldbeeld beeld={wereld.beeld} className="zp-wereld-beeld" />
          {wereld.id === "heelal" && (
            <svg viewBox="0 0 100 100" className="zp-baan" aria-hidden="true">
              <ellipse cx="50" cy="50" rx="47" ry="15" />
              <circle cx="97" cy="50" r="1.6" />
              <circle cx="12" cy="40" r="1.1" />
              <circle cx="60" cy="65" r="1.3" />
            </svg>
          )}
          {!open && (
            <span className="zp-wereldslot">
              <IcoonSlot className="size-[60%]" />
            </span>
          )}
        </span>
      </span>
      <span className="zp-wereldlabel" data-huidig={huidig ? "ja" : "nee"}>
        <Icoon className="zp-wereldlabel-icoon" />
        <span>
          <span className="zp-wereldlabel-naam zp-titel">{wereld.naam}</span>
          <span className="zp-wereldlabel-zin">{zin}</span>
        </span>
      </span>
    </>
  );

  const klassen = `zp-wereld zp-wereld-${plek}${oplicht ? " zp-oplicht" : ""}`;
  if (open) {
    return (
      <Link
        ref={refje}
        href={href}
        className={klassen}
        data-open="ja"
        aria-label={`${wereld.naam}${huidig ? `, jouw huidige wereld, ${klaar} van de ${wereld.missies} missies` : ""}`}
      >
        {inhoud}
      </Link>
    );
  }
  return (
    <button
      ref={refje}
      type="button"
      className={klassen}
      data-open="nee"
      data-schud={schud ? "ja" : "nee"}
      aria-label={`${wereld.naam}, nog op slot`}
      onClick={onDicht}
    >
      {inhoud}
    </button>
  );
}

/**
 * Een gouden lichtje dat van de munt naar de wereld vliegt, in een boog, met
 * een korte staart van vonkjes erachter. Alleen `transform` en `opacity`
 * bewegen.
 */
function vliegLichtje(van: HTMLElement, naar: HTMLElement, klaar: () => void): () => void {
  const a = van.getBoundingClientRect();
  const b = naar.getBoundingClientRect();
  const x0 = a.left + a.width / 2;
  const y0 = a.top + a.height / 2;
  const x1 = b.left + b.width / 2;
  const y1 = b.top + b.height * 0.45;
  /* Een boog: het lichtje stijgt eerst op en daalt dan in de wereld. */
  const cx = x0 + (x1 - x0) * 0.25;
  const cy = Math.min(y0, y1) - 220;
  const STAPPEN = 18;
  const zacht = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const baan = (grootte: number, licht: number): Keyframe[] =>
    Array.from({ length: STAPPEN + 1 }, (_, i) => {
      const t = zacht(i / STAPPEN);
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      const f = i / STAPPEN;
      const schaal = grootte * (f < 0.15 ? 0.5 + f * 4.5 : f > 0.85 ? 1.2 - (f - 0.85) * 4 : 1.2);
      const zicht = licht * (f < 0.1 ? f * 10 : f > 0.9 ? 1 - (f - 0.9) * 7 : 1);
      return { transform: `translate(${x}px, ${y}px) scale(${schaal})`, opacity: zicht, offset: f };
    });

  const stukjes = [
    { grootte: 1, licht: 1, wacht: 0 },
    { grootte: 0.6, licht: 0.75, wacht: 55 },
    { grootte: 0.45, licht: 0.55, wacht: 110 },
    { grootte: 0.32, licht: 0.4, wacht: 165 },
  ];
  const lichtjes = stukjes.map(() => {
    const el = document.createElement("span");
    el.className = "zp-vlieglichtje";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    return el;
  });
  const animaties = stukjes.map((st, i) =>
    lichtjes[i].animate(baan(st.grootte, st.licht), {
      duration: 1250,
      delay: st.wacht,
      easing: "linear",
      fill: "both",
    }),
  );
  const weg = () => lichtjes.forEach((el) => el.remove());
  /* Aankomen zodra het grote lichtje er is; de staart dooft daarna vanzelf. */
  animaties[0].onfinish = () => klaar();
  animaties[animaties.length - 1].onfinish = weg;
  /* Stoppen zonder aan te komen, als het scherm verdwijnt. */
  return () => {
    animaties.forEach((an) => {
      an.onfinish = null;
      an.cancel();
    });
    weg();
  };
}
