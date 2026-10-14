"use client";

/**
 * De Zappie-startpagina: één lange pagina die je van de ruimte naar de kust
 * brengt (derde ontwerp, 13 oktober 2026).
 *
 * Voorbeeld: ontwerp/zappie/voorbeeld-startpagina-3.webp, met de vier
 * goedgekeurde illustraties in public/assets/zappie/illustraties. Van boven
 * naar beneden:
 *
 * 1. de ruimte met de drie werelden in vakken en "Mijn leerpad" (op een groot
 *    scherm een eigen compositie in eenheden van het voorbeeld, zie zappie.css);
 * 2. "Vandaag op ontdekking" met de tokens, naast de grote "Jouw wereld";
 * 3. vrij oefenen met de vakken, naast de werkplaats (OntdekkingsReis);
 * 4. de wolkenovergang, Zappies atelier en het kustpanorama.
 *
 * De achtergrond reist mee (ScrollReis): de aarde komt dichterbij, er komen
 * wolken voorbij en onderaan ligt de kust. Dat volgt de plek van de secties,
 * niet de muis of een timer, en staat stil bij "minder beweging".
 *
 * Wat er leeft, net als in het vorige ontwerp:
 * - de werelden zweven, elk op een eigen tempo; het gouden ontdekpad laat zien
 *   hoeveel missies er in de huidige wereld klaar zijn (één lichtje per missie);
 * - Zappie rolt binnen, zwaait en wijst daarna naar "Begin je missie". Een tik
 *   op hem, op een dichte wereld of op Toetssprong en hij zegt iets;
 * - na een missie: de tokens tellen op, een gouden lichtje vliegt naar de
 *   wereld, die licht even op, en het nieuwe lichtje op het pad gaat aan. Komt
 *   er een plek vrij in Jouw wereld, dan valt daar een gouden lichtstraal. Dat
 *   volgt uit de opgeslagen voortgang, niet uit een klik.
 */

import Link from "next/link";
import { Illustratie } from "@/components/zappie/reis/Illustratie";
import { OntdekkingsReis } from "@/components/zappie/OntdekkingsReis";
import { Bewegingsknop, ScrollReis } from "@/components/zappie/ScrollReis";
import "@/components/zappie/startpagina.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  HandPijl,
  IcoonBeker,
  IcoonBlad,
  IcoonBoek,
  IcoonCadeau,
  IcoonGolf,
  IcoonKompas,
  IcoonPijl,
  IcoonRekenen,
  IcoonSlot,
  IcoonSpiraal,
  IcoonStapjes,
  IcoonVinkRond,
} from "@/components/zappie/Iconen";
import { Tekstballon, Wereldbeeld } from "@/components/zappie/Onderdelen";
import { Tokenteller } from "@/components/zappie/Schil";
import { Zappie, type Houding, type Stemming } from "@/components/zappie/Zappie";
import { useVoortgang, wisGebeurtenis } from "@/lib/zappie/opslag";
import {
  beloningStand,
  vandaagKlaar,
  volgendeMissie,
  type Dagmissie,
  wereldStanden,
  type Gebeurtenis,
  type WereldStand,
} from "@/lib/zappie/voortgang";
import { type WereldId } from "@/lib/zappie/werelden";

type Bericht = { tekst: string; stemming: Stemming };

/*
  Zappie de robot en "Iets niet duidelijk? Ik help je graag!" staan sinds
  14 oktober 2026 niet meer in de ruimte, op verzoek van de eigenaar. De code
  blijft staan: zet dit op true en hij is terug. Wat Zappie zegt (bij een dichte
  wereld of een verdiende beloning) verschijnt nog wel als tekstballon.
*/
const TOON_ZAPPIE = false;

/*
  Het gouden stippenpad tussen de werelden en de notitie "Kleine stappen.
  Grote werelden." staan sinds 14 oktober 2026 niet meer in beeld, op verzoek
  van de eigenaar (voorbeeld met de werelden in drie vakken). Zet dit op true
  en ze zijn terug.
*/
const TOON_PAD = false;

const HULP: Bericht[] = [
  { tekst: "Druk op Mijn leerpad. Dan gaan we samen oefenen!", stemming: "blij" },
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
  const klaarVandaag = useSyncExternalStore(geenAbonnement, () => vandaagKlaar(v).join(","), () => "")
    .split(",")
    .filter(Boolean) as Dagmissie[];

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
    <>
      <ScrollReis />
      <main className="zp-start" id="zappie-start" aria-label="Start">
        <h1 className="sr-only">Zappie: begin je missie</h1>

        {/*
          1. De ruimte. Zappie, de drie werelden met het ontdekpad en de
          belangrijkste knop van de pagina. Op een groot scherm een eigen
          compositie in eenheden van het voorbeeld (zie zappie.css); daaronder
          loopt de pagina gewoon door.
        */}
        <section className="zp-podium" aria-label="Je werelden" data-reis="ruimte">
          {TOON_ZAPPIE && (
          <p className="zp-hand zp-notitie zp-notitie-hulp" aria-hidden="true">
            Iets niet duidelijk?
            <br />
            Ik help je graag!
            <HandPijl className="zp-notitie-pijl" />
          </p>
          )}
          <div className="zp-zappieplek" data-zappie={TOON_ZAPPIE ? "ja" : "nee"}>
            {TOON_ZAPPIE && (
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
            )}
            {bericht && <Tekstballon tekst={bericht.tekst} className="zp-zappieballon" />}
          </div>

          <div className="zp-werelden" data-diepte="voor">
            {TOON_PAD && (["breed", "smal"] as const).map((soort) => (
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
          </div>

          <div className="zp-missieplek">
            <Link
              href={missieAdres}
              className={`zp-missieknop zp-titel${glans ? " zp-glans" : ""}`}
              onClick={beginMissie}
            >
              <span className="zp-missieknop-kompas zp-missieknop-stapjes">
                <IcoonStapjes className="size-full" />
              </span>
              <span>Mijn leerpad</span>
              <IcoonPijl className="zp-missieknop-pijl" />
            </Link>
          </div>

          {TOON_PAD && (
            <p className="zp-hand zp-notitie zp-notitie-stappen" aria-hidden="true">
              Kleine stappen.
              <br />
              Grote werelden.
            </p>
          )}
          <Bewegingsknop />
        </section>

        {/* 2. Vandaag: links de missies en de tokens, rechts de eigen bouwwereld. */}
        <section className="zs-vandaag" aria-label="Vandaag" data-reis="vandaag">
          <div className="zs-binnen zs-vandaag-raster">
            <div className="zs-vandaag-links">
              <section className="zs-paneel zs-ontdekking" aria-labelledby="zp-kop-ontdekking">
                <header className="zs-paneelkop">
                  <IcoonKompas className="zs-paneelkop-icoon" />
                  <div>
                    <h2 id="zp-kop-ontdekking" className="zp-titel">
                      Vandaag op ontdekking
                    </h2>
                    <p className="zs-paneelzin">Drie missies voor vandaag.</p>
                  </div>
                </header>
                <DagMissies
                  klaar={klaarVandaag}
                  adres={{ rekenen: missieAdres, herhalen: "/zappie/oefenen?vrij=1", uitdaging: null }}
                  onBinnenkort={() =>
                    zeg({ tekst: "Uitdaging komt er binnenkort aan. Kies nu Rekenen of Herhalen!", stemming: "kijk" })
                  }
                />
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
            </div>

            {/*
              Jouw wereld: de persoonlijke bouwplek, groot. Het beeld is een
              voorbeeld van hoe een wereld vol gebouwen eruit kan zien; dat
              staat er eerlijk bij, want een beginnend kind heeft nog niets
              gebouwd. Het hele paneel is klikbaar.
            */}
            <Link
              href="/zappie/mijn-wereld"
              className={`zp-jouwpaneel zs-jouw${straal ? " zp-straal" : ""}`}
              aria-label={`Jouw wereld, ${huidig.wereld.naam}: ga naar mijn wereld`}
            >
              <span className="zs-jouw-beeld" aria-hidden="true">
                <Illustratie naam="wereld" sizes="(min-width: 1100px) 46vw, 94vw" />
              </span>
              <span className="zs-jouw-voorbeeld" aria-hidden="true">
                Zo kan jouw wereld worden
              </span>
              <span className="zp-jouw-bord zp-titel" aria-hidden="true">
                Jouw
                <br />
                wereld
              </span>
              <span className="zp-jouw-straal" aria-hidden="true" />
              <span className="zs-jouw-tekst">
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
          </div>
        </section>

        {/* 3 tot en met 6: vakken en werkplaats, wolken, atelier, de kust. */}
        <OntdekkingsReis standen={standen} />
      </main>
    </>
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
          <Wereldbeeld beeld={`${wereld.beeld}-tegel`} className="zp-wereld-beeld" />
          {TOON_PAD && wereld.id === "heelal" && (
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

/*
  Vandaag op ontdekking (14 oktober 2026, voorbeeld van de eigenaar): drie
  dagmissies naast elkaar, met een vinkje als ze vandaag klaar zijn, het
  percentage en één Start-knop.
  - Rekenen: de volgende missie in de huidige wereld.
  - Herhalen: een vrije missie (heette eerder Vrije Missie).
  - Uitdaging: bestaat nog niet; tikken laat de tekstballon "binnenkort" zien.
  Een tik op een tabje kiest het; Start gaat naar het gekozen tabje. Zonder
  keuze kiest Start de eerste die vandaag nog niet klaar is.
*/
const DAGMISSIES: { id: Dagmissie; naam: string; Icoon: (p: { className?: string }) => React.ReactNode }[] = [
  { id: "rekenen", naam: "Rekenen", Icoon: IcoonRekenen },
  { id: "herhalen", naam: "Herhalen", Icoon: IcoonBoek },
  { id: "uitdaging", naam: "Uitdaging", Icoon: IcoonBeker },
];

function DagMissies({
  klaar,
  adres,
  onBinnenkort,
}: {
  klaar: Dagmissie[];
  adres: Record<Dagmissie, string | null>;
  onBinnenkort: () => void;
}) {
  const router = useRouter();
  const [gekozen, zetGekozen] = useState<Dagmissie | null>(null);
  const procent = Math.round((klaar.length / DAGMISSIES.length) * 100);
  const doel = gekozen ?? DAGMISSIES.find((d) => !klaar.includes(d.id) && adres[d.id])?.id ?? "rekenen";

  function start(id: Dagmissie) {
    const a = adres[id];
    if (a) router.push(a);
    else onBinnenkort();
  }

  return (
    <div className="zs-dag">
      <span className="zs-dag-procent" aria-label={`${procent} procent van vandaag klaar`}>
        {procent}%
      </span>
      <div className="zs-dag-rij">
        <div className="zs-dag-tabs" role="radiogroup" aria-label="Kies een missie voor vandaag">
          {DAGMISSIES.map(({ id, naam, Icoon }) => {
            const af = klaar.includes(id);
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={doel === id}
                className="zs-dag-tab"
                data-klaar={af ? "ja" : "nee"}
                data-gekozen={doel === id ? "ja" : "nee"}
                onClick={() => (adres[id] ? zetGekozen(id) : onBinnenkort())}
              >
                <Icoon className="zs-dag-icoon" />
                <span className="zs-dag-naam">{naam}</span>
                <IcoonVinkRond className="zs-dag-vink" aan={af} />
                <span className="sr-only">{af ? ", vandaag klaar" : adres[id] ? "" : ", binnenkort"}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="zs-dag-start zp-titel" onClick={() => start(doel)}>
          Start
        </button>
      </div>
    </div>
  );
}
