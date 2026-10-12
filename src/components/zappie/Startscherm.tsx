"use client";

/**
 * De Zappie-startpagina voor groep 3.
 *
 * Voorbeeld: ontwerp/zappie/voorbeeld-startpagina.webp. Op een groot scherm
 * staat alles op vaste plekken in een 16:9-vlak dat met het scherm meeschaalt
 * (zie `zappie.css`); op telefoon en staande tablet staat alles onder elkaar.
 *
 * Zappie reageert op wat het kind aanklikt: een dichte wereld, een vak dat er
 * nog niet is, of Zappie zelf. Wat hij zegt staat in `BERICHTEN`.
 */

import Link from "next/link";
import { useState } from "react";
import {
  BeeldRekenen,
  BeeldTaal,
  IcoonKalender,
  IcoonKasteel,
  IcoonLamp,
  IcoonPijl,
  IcoonSlot,
} from "@/components/zappie/Iconen";
import { Tekstballon, Wereldbeeld } from "@/components/zappie/Onderdelen";
import { Zappie, type Stemming } from "@/components/zappie/Zappie";
import { useVoortgang } from "@/lib/zappie/opslag";
import { volgendeMissie, wereldStanden, type WereldStand } from "@/lib/zappie/voortgang";
import { ASSETS } from "@/lib/zappie/werelden";

type Bericht = { kop?: string; tekst: string; stemming: Stemming };

const WELKOM: Bericht = { kop: "Hoi!", tekst: "Klaar om te oefenen?", stemming: "blij" };

const GROETEN: Bericht[] = [
  { kop: "Hoi!", tekst: "Ik ben Zappie. Zullen we samen oefenen?", stemming: "juich" },
  { tekst: "Druk op de gele knop. Dan gaan we!", stemming: "blij" },
  { tekst: "Met elke missie kom je verder in de Oceaan.", stemming: "kijk" },
];

/** De vakken onder "Vandaag oefenen". Alleen Rekenen is er al. */
const VAKKEN = [
  { id: "rekenen", naam: "Rekenen", Beeld: BeeldRekenen, klaar: true },
  { id: "taal", naam: "Taal", Beeld: BeeldTaal, klaar: false },
  { id: "denken", naam: "Denken", Beeld: () => <IcoonLamp className="zp-tegellamp" />, klaar: false },
] as const;

export function Startscherm() {
  const v = useVoortgang();
  const standen = wereldStanden(v);
  const volgende = volgendeMissie(v);
  const oefenAdres = `/zappie/oefenen?wereld=${volgende.wereld}&missie=${volgende.nummer}`;

  const [bericht, zetBericht] = useState<Bericht>(WELKOM);
  const [tik, zetTik] = useState(0);
  const [praat, zetPraat] = useState(false);
  const [groet, zetGroet] = useState(0);
  const [schud, zetSchud] = useState<string | null>(null);

  /** Zappie iets laten zeggen: tekst in de ballon, golf beweegt, sprongetje. */
  function zeg(b: Bericht) {
    zetBericht(b);
    zetTik((n) => n + 1);
    zetPraat(true);
    window.setTimeout(() => zetPraat(false), 1800 + b.tekst.length * 25);
  }

  function kiesWereld(s: WereldStand) {
    if (s.open) return;
    zetSchud(s.wereld.id);
    window.setTimeout(() => zetSchud(null), 600);
    zeg({ tekst: "Maak meer missies om deze wereld te ontdekken!", stemming: "kijk" });
  }

  return (
    <main className="zp-podium" aria-label="Start">
      <h1 className="sr-only">Zappie: kies wat je wilt doen</h1>

      {/* Zappie zelf: een tik op hem en hij zegt iets. */}
      <button
        type="button"
        className="zp-zappie"
        aria-label="Zappie, tik om hem iets te laten zeggen"
        onClick={() => {
          zeg(GROETEN[groet % GROETEN.length]);
          zetGroet((n) => n + 1);
        }}
      >
        <Zappie stemming={bericht.stemming} praat={praat} tik={tik} />
      </button>
      <Tekstballon kop={bericht.kop} tekst={bericht.tekst} className="zp-startballon" />

      {/* De drie werelden met het ontdekpad ertussen. */}
      <section className="zp-werelden" aria-label="Werelden" data-aarde-open={standen[1]?.open ? "ja" : "nee"}>
        {/* Het ontdekpad: op een groot scherm en op een telefoon liggen de werelden anders. */}
        <svg viewBox="0 0 68 26" className="zp-pad zp-pad-breed" aria-hidden="true">
          <path className="zp-pad-stippen" d="M27.9 11.6Q32.3 9.2 36.5 12.4" />
          <path className="zp-pad-stippen zp-pad-dicht" d="M49.1 14.2Q52.6 13.6 55 17" />
          <path className="zp-pad-licht" d="M27.9 11.6Q32.3 9.2 36.5 12.4" />
        </svg>
        <svg viewBox="0 0 68 40" className="zp-pad zp-pad-smal" aria-hidden="true">
          <path className="zp-pad-stippen" d="M34.2 17.4Q37 11.6 41.4 11.4" />
          <path className="zp-pad-stippen zp-pad-dicht" d="M52.3 19.6Q54.6 22 54.8 25" />
          <path className="zp-pad-licht" d="M34.2 17.4Q37 11.6 41.4 11.4" />
        </svg>
        {standen.map((s, i) => (
          <WereldKnop
            key={s.wereld.id}
            stand={s}
            plek={i}
            schud={schud === s.wereld.id}
            href={s.huidig ? oefenAdres : "/zappie/wereld"}
            onDicht={() => kiesWereld(s)}
          />
        ))}
      </section>

      {/* De belangrijkste knop van het scherm. */}
      <div className="zp-startplek">
        <Link href={oefenAdres} className="zp-start zp-titel" prefetch>
          <span>Start oefenen</span>
          <IcoonPijl className="zp-start-pijl" />
        </Link>
        <svg viewBox="0 0 40 40" className="zp-start-vonk zp-start-vonk-links" aria-hidden="true">
          <path d="M10 8l6 9M22 4v11M34 9l-6 8" stroke="#ffd447" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 40 40" className="zp-start-vonk zp-start-vonk-rechts" aria-hidden="true">
          <path d="M6 31l9-6M4 18l11 1M8 6l8 7" stroke="#ffd447" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* Vandaag oefenen. */}
      <section className="zp-vandaag zp-glaspaneel" aria-labelledby="zp-kop-vandaag">
        <h2 id="zp-kop-vandaag" className="zp-paneelkop zp-titel">
          <IcoonKalender className="zp-paneelkop-icoon" />
          Vandaag oefenen
        </h2>
        <ul className="zp-tegels">
          {VAKKEN.map(({ id, naam, Beeld, klaar }) => (
            <li key={id}>
              {klaar ? (
                <Link href={oefenAdres} className="zp-tegel">
                  <Beeld />
                  <span className="zp-tegelnaam zp-titel">
                    {naam}
                    <IcoonPijl className="zp-tegelpijl" />
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="zp-tegel"
                  data-binnenkort="ja"
                  onClick={() => zeg({ tekst: `${naam} komt er binnenkort aan. Kies nu Rekenen!`, stemming: "kijk" })}
                >
                  <span className="zp-binnenkort">Binnenkort</span>
                  <Beeld />
                  <span className="zp-tegelnaam zp-titel">
                    {naam}
                    <IcoonPijl className="zp-tegelpijl" />
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Jouw wereld: het hele paneel is klikbaar. */}
      <Link href="/zappie/mijn-wereld" className="zp-jouw zp-glaspaneel" aria-label="Jouw wereld: bouw verder aan je wereld">
        <picture>
          <source type="image/avif" srcSet={`${ASSETS}/my-world-island.avif`} />
          <img src={`${ASSETS}/my-world-island.webp`} alt="" className="zp-jouw-beeld" loading="lazy" decoding="async" />
        </picture>
        <span className="zp-jouw-tekst">
          <IcoonKasteel className="zp-jouw-icoon" />
          <span>
            <span className="zp-jouw-kop zp-titel">Jouw wereld</span>
            <span className="zp-jouw-zin">Bouw verder aan je wereld!</span>
          </span>
        </span>
        <span className="zp-jouw-pijl" aria-hidden="true">
          <IcoonPijl className="size-[55%]" />
        </span>
      </Link>
    </main>
  );
}

/**
 * Eén wereld: het losse beeld met de naam erboven. Een open wereld is een link;
 * een dichte wereld heeft een slotje en laat Zappie uitleggen hoe je hem opent.
 */
function WereldKnop({
  stand,
  plek,
  schud,
  href,
  onDicht,
}: {
  stand: WereldStand;
  plek: number;
  schud: boolean;
  href: string;
  onDicht: () => void;
}) {
  const { wereld, open, klaar, huidig } = stand;
  const inhoud = (
    <>
      <span className="zp-wereld-zweef">
        <Wereldbeeld beeld={wereld.beeld} className="zp-wereld-beeld" />
      </span>
      <span className="zp-wereldlabel zp-titel" data-huidig={huidig ? "ja" : "nee"}>
        {!open && <IcoonSlot className="zp-wereldslot" />}
        <span>{wereld.naam}</span>
        {huidig && (
          <span className="zp-wereldstand" aria-hidden="true">
            <span className="zp-wereldbalk">
              <span className="zp-wereldbalk-vol" style={{ width: `${(klaar / wereld.missies) * 100}%` }} />
            </span>
            <span className="zp-wereldtal">
              <b>{klaar}</b> / {wereld.missies}
            </span>
          </span>
        )}
      </span>
    </>
  );

  const klassen = `zp-wereld zp-wereld-${plek}`;
  if (open) {
    return (
      <Link href={href} className={klassen} data-open="ja" aria-label={`${wereld.naam}${huidig ? `, jij bent hier, ${klaar} van de ${wereld.missies} missies` : ""}`}>
        {inhoud}
      </Link>
    );
  }
  return (
    <button
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
