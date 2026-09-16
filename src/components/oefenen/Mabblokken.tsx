"use client";

/**
 * MAB-blokken: staven van tien en losse blokjes.
 *
 * Hetzelfde materiaal dat op school in de kast staat. Tien losse blokjes aan
 * elkaar vormen één staaf; die staaf is een tiental. Precies dat verband is wat
 * hier geoefend wordt: 24 is niet "vier" en niet "twee en vier", maar twee
 * staven en vier losse.
 *
 * ---------------------------------------------------------------------------
 * Twee groepen in één vak
 * ---------------------------------------------------------------------------
 * De staven liggen links, horizontaal en onder elkaar, de losse blokjes rechts,
 * met een duidelijk gat ertussen. Vos staat rechts naast het vak, buiten het
 * kader, en legt de blokken er vandaan in. Geen lijn: op school ligt er ook niets tussen
 * — de staven liggen bij elkaar en de blokjes ernaast, en dát is wat een kind
 * als twee soorten leest. Wie links twee staven en rechts vier blokjes ziet
 * liggen, leest "twintig en vier" — en dat is de sprong die het moet maken.
 *
 * ---------------------------------------------------------------------------
 * Alles in dezelfde eenheid
 * ---------------------------------------------------------------------------
 * Elke maat hieronder staat in procenten van de BREEDTE van het vak, ook de
 * hoogtes. In CSS is `left` een percentage van de breedte en `top` een
 * percentage van de hoogte; zijn die twee niet even groot — en dat zijn ze
 * bijna nooit — dan zakken de blokken in elkaar. Door alles in breedte uit te
 * rekenen en pas bij het tekenen naar hoogte om te rekenen, klopt de afstand
 * altijd en raken de blokken elkaar nooit.
 *
 * ---------------------------------------------------------------------------
 * Ruimte voor een derde stand
 * ---------------------------------------------------------------------------
 * `Stand` is een lijst met namen, en alles wat per stand verschilt hangt aan
 * die ene waarde. Er komt later een stand bij waarin het kind zélf staven en
 * blokjes naar het vak sleept; die hoeft dan alleen een eigen tak te krijgen,
 * zonder dat "tellen" of "vosbouwt" verbouwd hoeft te worden.
 */

import { useEffect, useRef, useState } from "react";
import { Vosbeeld, useVosplek, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";

/**
 * Welke stand dit vak heeft.
 *
 *   tellen    de staven en blokjes liggen klaar; het kind telt ze
 *   vosbouwt  alles ligt eerst los; Vos schuift er staven van tien van
 *   slepen    (nog niet gebouwd) het kind legt zelf het getal neer
 */
export type Blokkenstand = "tellen" | "vosbouwt" | "slepen";

export const BLOKKENSTANDEN: { waarde: Blokkenstand; label: string }[] = [
  { waarde: "tellen", label: "Tellen" },
  { waarde: "vosbouwt", label: "Vos bouwt de staven" },
];

export type Plek = { x: number; y: number };

/** Hoogste getal dat nog in het vak past zonder dat er niets meer te zien is. */
export const MAX_GETAL = 100;

// ---------------------------------------------------------------------------
// De maatvoering
// ---------------------------------------------------------------------------

/** Marge binnen het vak. */
const KANT = 3;
/**
 * De ruimte tussen de staven en de losse blokjes.
 *
 * Een gat en geen lijn. Op school ligt er ook niets tussen: de staven liggen op
 * een hoopje bij elkaar en de losse blokjes ernaast, en dát is wat een kind als
 * twee soorten leest. Ruim genoeg gehouden om niet als één groep te lezen —
 * ruimer dan de afstand tussen twee losse blokjes onderling.
 */
const KLOOF = 9;
/** Het grootste dat één blokje mag worden. */
const MAX_BLOK = 8;
/** Hoeveel blokmaten lang een staaf is; volgt uit de tekening hieronder. */
const STAAF_LANG = 7.75;
/** Hart-op-hart tussen twee blokjes binnen een staaf. */
const IN_STAAF = 0.746;
/** Hart-op-hart tussen losse blokjes. */
const LOS_TUSSEN = 1.35;
/** Hart-op-hart tussen twee staven die onder elkaar liggen. */
const STAAF_ONDER = 1.35;
/**
 * Hoe hoog het vak hoogstens wordt, in procenten van zijn eigen breedte.
 *
 * Bij tien staven onder elkaar zou het anders een toren worden die niet meer op
 * een telefoonscherm past. Boven deze grens worden de blokken kleiner in plaats
 * van het vak hoger.
 */
const MAX_HOOG = 64;

/**
 * De tijden van het bouwen.
 *
 * Vlot gehouden: het kind moet snel kunnen beginnen met tellen. Hoe meer
 * blokjes er komen, hoe sneller Vos ze neerlegt — anders zou een getal van in
 * de negentig een halve minuut duren. Eén tik slaat alles over.
 */
const VLUCHT_MS = 300;
const SCHUIF_MS = 260;
const KLIK_MS = 160;

function legtempo(totaal: number): number {
  if (totaal > 40) return 32;
  if (totaal > 25) return 50;
  return 70;
}

/**
 * Hoe ver de tien blokjes uit elkaar liggen voordat ze aan elkaar klikken.
 *
 * Ruim genoeg om als tien lósse blokjes te lezen — anders lijkt het al een
 * staaf en valt er niets meer te zien bij het aanschuiven. Past die spreiding
 * niet binnen het vak, dan wordt hij krapper gemaakt; zie `blokkenPlan`.
 */
const SPREID = 1.08;

export type Blokplan = {
  /** De maat van één blokje, in procenten van de breedte. */
  maat: number;
  /**
   * Hart-op-hart tussen de tien blokjes zolang ze nog los liggen, in
   * blokmaten. Nooit ruimer dan er in het vak past.
   */
  spreid: number;
  /** De hoogte van het hele vak, ook in procenten van de BREEDTE. */
  hoogte: number;
  /** De linkerbovenhoek van elke staaf. */
  staven: Plek[];
  /** De linkerbovenhoek van elk los blokje. */
  losse: Plek[];
};

/**
 * Waar alles komt te liggen.
 *
 * De maat volgt uit de ruimte, niet andersom: passen er tien staven naast
 * elkaar, dan worden de blokken kleiner. Zo overlapt er nooit iets.
 */
export function blokkenPlan(tientallen: number, eenheden: number): Blokplan {
  const t = Math.max(0, Math.min(10, Math.round(tientallen)));
  const e = Math.max(0, Math.min(9, Math.round(eenheden)));

  /*
    De staven liggen horizontaal, als een rij van tien blokjes naast elkaar, en
    onder elkaar als het er meer zijn. Zo ligt het materiaal ook op een tafel in
    de klas, en zo leest een staaf als "tien" in plaats van als een paal.

    Links de staven, rechts de losse blokjes, met een gat ertussen. Eerst
    uitrekenen hoeveel plek er nodig is — in blokmaten, zowel in de breedte als
    in de hoogte — en daaruit volgt hoe groot een blokje mag worden.
  */
  const kolommen = e === 0 ? 0 : e <= 4 ? 2 : 3;
  const breedLinks = t > 0 ? STAAF_LANG : 0;
  const breedRechts = kolommen > 0 ? (kolommen - 1) * LOS_TUSSEN + 1 : 0;
  const kloof = breedLinks > 0 && breedRechts > 0 ? KLOOF : 0;

  const uitBreedte = (100 - 2 * KANT - kloof) / Math.max(1, breedLinks + breedRechts);

  const rijenLos = kolommen > 0 ? Math.ceil(e / kolommen) : 0;
  const hoogLinks = t > 0 ? (t - 1) * STAAF_ONDER + 1 : 0;
  const hoogRechts = rijenLos > 0 ? (rijenLos - 1) * LOS_TUSSEN + 1 : 0;
  const uitHoogte = MAX_HOOG / Math.max(1, hoogLinks, hoogRechts);

  const maat = Math.max(1.4, Math.min(MAX_BLOK, uitBreedte, uitHoogte));

  const stapelLinks = hoogLinks * maat;
  const stapelRechts = hoogRechts * maat;
  const inhoudHoog = Math.max(stapelLinks, stapelRechts);

  const werkHoog = inhoudHoog;
  const hoogte = werkHoog + 2 * KANT;

  /* Het geheel staat gecentreerd in het vak, met de twee groepen naast elkaar. */
  const inhoudBreed = breedLinks * maat + kloof + breedRechts * maat;
  const linkerrand = Math.max(KANT, (100 - inhoudBreed) / 2);

  const staven: Plek[] = Array.from({ length: t }, (_, i) => ({
    x: linkerrand,
    y: KANT + (werkHoog - stapelLinks) / 2 + i * STAAF_ONDER * maat,
  }));

  const losse: Plek[] = Array.from({ length: e }, (_, i) => {
    const rij = Math.floor(i / Math.max(1, kolommen));
    const kolom = i % Math.max(1, kolommen);
    return {
      x: linkerrand + breedLinks * maat + kloof + kolom * LOS_TUSSEN * maat,
      y: KANT + (werkHoog - stapelRechts) / 2 + rij * LOS_TUSSEN * maat,
    };
  });

  /*
    Ze mogen niet buiten het vak komen te liggen zolang ze nog los liggen. Bij
    een getal zonder losse blokjes staat de staaf gecentreerd, en dan is er
    rechts minder ruimte dan je zou denken.
  */
  const spreid = Math.max(
    IN_STAAF,
    Math.min(SPREID, (100 - KANT - linkerrand - maat) / (9 * maat)),
  );

  return { maat, spreid, hoogte, staven, losse };
}

/** Waar het blokje met dit nummer in zijn staaf terechtkomt. */
function plekInStaaf(plan: Blokplan, nummer: number): Plek {
  const staaf = plan.staven[Math.floor(nummer / 10)];
  const plaats = nummer % 10;
  return { x: staaf.x + plaats * IN_STAAF * plan.maat, y: staaf.y };
}

/**
 * Waar het blokje eerst los komt te liggen, vóórdat de staaf ontstaat.
 *
 * Op de rij van zijn eigen staaf, maar met een gaatje ertussen. Dat gaatje is
 * het hele punt: tien losse blokjes die daarna naar elkaar toe schuiven en
 * vastklikken. Zonder die tussenstap zou er gewoon een staaf verschijnen, en
 * dan mist het kind precies wat het moet zien.
 */
function plekLosInRij(plan: Blokplan, nummer: number): Plek {
  const staaf = plan.staven[Math.floor(nummer / 10)];
  const plaats = nummer % 10;
  return { x: staaf.x + plaats * plan.spreid * plan.maat, y: staaf.y };
}

// ---------------------------------------------------------------------------
// De tekening
// ---------------------------------------------------------------------------

/*
  De kleur van het materiaal: zacht abrikoos, met een donkerbruine rand.

  Waarom niet het oranje van de huisstijl: dat is de kleur van knoppen en
  randen, en alles wat erop lijkt leest voor een kind als "hier moet je op
  tikken". Deze blokken zijn er juist om te tellen. Ze staan daarom bewust ver
  van die knopkleur af — veel lichter, een stuk minder fel, en een tikje geler:

    knop      #b8480a   L* 45   C* 68   h  51°
    blokje    #f7d2a6   L* 86   C* 27   h  76°

  De rand is een bruin (#5e3a1c) en geen oranje, zodat ook de omtrek niet als
  knoprand leest. Tussen blokje en rand zit een verhouding van 7,0 : 1, dus ook
  op een klein scherm blijft elk blokje apart te zien.
*/
const RAND = "#5e3a1c";
const RANDDIKTE = 5;
const VOOR = "#f7d2a6";
const BOVEN = "#fdeacf";
const ZIJ = "#e9b177";

/**
 * Eén blokje: een kubus met een schuine bovenkant en zijkant.
 *
 * Lichtblauw met een donkerblauwe rand, net als het materiaal op school. De
 * schuine vlakken zijn wat het een blók maakt in plaats van een vierkantje —
 * en dat is precies waarom een kind het herkent van de tafel in de klas.
 */
export function Blokje({ gedimd = false }: { gedimd?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-full w-full ${gedimd ? "opacity-30" : ""}`}
      aria-hidden="true"
    >
      <polygon points="2,27 27,2 98,2 73,27" fill={BOVEN} stroke={RAND} strokeWidth={RANDDIKTE} strokeLinejoin="round" />
      <polygon points="73,27 98,2 98,73 73,98" fill={ZIJ} stroke={RAND} strokeWidth={RANDDIKTE} strokeLinejoin="round" />
      <rect x="2" y="27" width="71" height="71" fill={VOOR} stroke={RAND} strokeWidth={RANDDIKTE} strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Een staaf: tien blokjes aan elkaar.
 *
 * De streepjes tussen de blokjes zijn het hele punt. Zonder die verdeling is
 * het een paal, en dan moet een kind maar geloven dat het er tien zijn; met de
 * streepjes kan het ze naDtellen en zelf zien dat het klopt.
 */
export function Staaf({ gedimd = false, nadruk = false }: { gedimd?: boolean; nadruk?: boolean }) {
  const lang = 775;
  const vak = 74.6;
  const streepjes = Array.from({ length: 9 }, (_, i) => 2 + (i + 1) * vak);

  return (
    <svg
      viewBox={`0 0 ${lang} 100`}
      className={`h-full w-full ${gedimd ? "opacity-30" : ""}`}
      aria-hidden="true"
    >
      {/* Het gloedje bij de staaf die in de uitleg aan de beurt is. */}
      {nadruk && (
        <rect
          x="-3"
          y="-3"
          width={lang + 6}
          height="106"
          rx="14"
          fill="none"
          stroke="var(--color-huisstijl)"
          strokeWidth="9"
        />
      )}
      <polygon
        points={`2,27 27,2 ${lang - 2},2 ${lang - 27},27`}
        fill={BOVEN}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <polygon
        points={`${lang - 27},27 ${lang - 2},2 ${lang - 2},73 ${lang - 27},98`}
        fill={ZIJ}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <rect
        x="2"
        y="27"
        width={lang - 29}
        height="71"
        fill={VOOR}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {streepjes.map((x) => (
        <g key={x}>
          <line x1={x} y1="27" x2={x} y2="98" stroke={RAND} strokeWidth={RANDDIKTE * 0.62} />
          <line x1={x} y1="27" x2={x + 25} y2="2" stroke={RAND} strokeWidth={RANDDIKTE * 0.62} />
        </g>
      ))}
    </svg>
  );
}

/**
 * Een blokje of staaf op zijn plek, in breedteprocenten omgerekend.
 *
 * `vanaf` laat het van buiten het vak komen aanvliegen: de plek waar Vos het
 * vandaan pakt. De baan wordt gerekend in de breedte van het blokje zelf, want
 * `translate` met procenten rekent met het element en niet met het vlak
 * eromheen — zo klopt hij voor elk blokje apart, waar het ook moet landen.
 *
 * `vloeiend` is het schuiven binnen het vak: van los naar tegen elkaar aan.
 */
function OpPlek({
  plek,
  breedte,
  hoogte,
  vakhoogte,
  vloeiend = false,
  vanaf = null,
  klikt = false,
  children,
}: {
  plek: Plek;
  breedte: number;
  hoogte: number;
  vakhoogte: number;
  vloeiend?: boolean;
  vanaf?: Plek | null;
  klikt?: boolean;
  children: React.ReactNode;
}) {
  const vlucht = vanaf
    ? ({
        "--dx": `${((vanaf.x - plek.x) / breedte) * 100}%`,
        "--dy": `${((vanaf.y - plek.y) / breedte) * 100}%`,
      } as React.CSSProperties)
    : undefined;

  return (
    <span
      className={`absolute ${
        vloeiend ? "transition-[left,top] duration-300 ease-out motion-reduce:transition-none" : ""
      } ${vanaf ? "motion-safe:animate-blok-van-vos" : ""} ${
        klikt ? "motion-safe:animate-staaf-klikt" : ""
      }`}
      style={{
        left: `${plek.x}%`,
        top: `${(plek.y / vakhoogte) * 100}%`,
        width: `${breedte}%`,
        height: `${(hoogte / vakhoogte) * 100}%`,
        ...vlucht,
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Het vak in de vraag
// ---------------------------------------------------------------------------

/**
 * Het blokkenvak zoals het kind het ziet.
 *
 * Bij `tellen` ligt alles meteen klaar.
 *
 * Bij `vosbouwt` begint het vak leeg. Vos staat ernaast en legt er één voor één
 * losse blokjes in; elk blokje komt bij hém vandaan. Zodra er tien liggen,
 * schuift hij ze tegen elkaar aan en klikken ze vast tot één staaf — dat is het
 * moment waar deze hele oefening om draait. Wat er minder dan tien overblijft,
 * blijft los liggen, want daar kan geen staaf meer van.
 *
 * Het kind hoeft daar nooit op te wachten: één tik zet alles ineens klaar.
 */
export function Blokkenvak({
  tientallen,
  eenheden,
  stand = "tellen",
  vos = { vangend: null, wachtend: null, blij: null },
  beweegt = true,
  onKlaar,
}: {
  tientallen: number;
  eenheden: number;
  stand?: Blokkenstand;
  vos?: Voshoudingen;
  /** Uit in het beheer: daar hoeft Vos niets te bouwen. */
  beweegt?: boolean;
  /** Gaat af zodra alles klaarligt en het kind kan antwoorden. */
  onKlaar?: () => void;
}) {
  const plan = blokkenPlan(tientallen, eenheden);
  const t = plan.staven.length;
  const e = plan.losse.length;
  const totaal = t * 10 + e;

  const bouwt = beweegt && stand === "vosbouwt" && totaal > 0;

  /*
    Hoever Vos is.

      gelegd     zoveel blokjes heeft hij al in het vak gelegd
      geschoven  van zoveel staven zijn de tien blokjes tegen elkaar geschoven
      vast       zoveel staven zijn ook echt aan elkaar geklikt
      af         alles ligt klaar; Vos gaat opzij en het kind is aan de beurt
  */
  const [gelegd, setGelegd] = useState(bouwt ? 0 : totaal);
  const [geschoven, setGeschoven] = useState(bouwt ? 0 : t);
  const [vast, setVast] = useState(bouwt ? 0 : t);
  const [af, setAf] = useState(!bouwt);
  const gemeld = useRef(false);

  const klokken = useRef<ReturnType<typeof setTimeout>[]>([]);
  function stopKlokken() {
    for (const k of klokken.current) clearTimeout(k);
    klokken.current = [];
  }

  /*
    Het bouwen, in de volgorde waarin een kind het moet zien:

      1. het vak is leeg en Vos staat ernaast;
      2. hij legt één voor één losse blokjes neer, elk vliegt bij hem vandaan;
      3. zodra er tien liggen schuiven ze naar elkaar toe en klikken ze vast
         tot één staaf — dat is het moment waar deze hele oefening om draait;
      4. zo door tot het getal klaar is; wat er minder dan tien overblijft,
         blijft los liggen;
      5. daarna gaat Vos naar de hoek en kijkt hij toe.
  */
  useEffect(() => {
    if (!bouwt) return;

    const tempo = legtempo(totaal);
    let klok = 0;

    for (let r = 0; r < t; r++) {
      for (let j = 0; j < 10; j++) {
        const tot = r * 10 + j + 1;
        klokken.current.push(setTimeout(() => setGelegd(tot), klok + j * tempo));
      }
      /* Het laatste blokje is geland; nu schuiven ze naar elkaar toe. */
      klok += 10 * tempo + VLUCHT_MS;
      const staaf = r + 1;
      klokken.current.push(setTimeout(() => setGeschoven(staaf), klok));
      klok += SCHUIF_MS;
      klokken.current.push(setTimeout(() => setVast(staaf), klok));
      klok += KLIK_MS;
    }

    /* En de losse blokjes die overblijven: daar kan geen staaf meer van. */
    for (let m = 0; m < e; m++) {
      const tot = t * 10 + m + 1;
      klokken.current.push(setTimeout(() => setGelegd(tot), klok + m * tempo));
    }
    klok += e * tempo + VLUCHT_MS;

    klokken.current.push(setTimeout(() => setAf(true), klok));

    return () => {
      stopKlokken();
    };
  }, [bouwt, t, e, totaal]);

  /* Eén melding als alles klaarligt, ook als het kind het bouwen overslaat. */
  useEffect(() => {
    if (!af || gemeld.current) return;
    gemeld.current = true;
    onKlaar?.();
  }, [af, onKlaar]);

  /* Tikken tijdens het bouwen: alles staat meteen klaar. */
  function slaOver() {
    stopKlokken();
    setGelegd(totaal);
    setGeschoven(t);
    setVast(t);
    setAf(true);
  }

  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const vlakRef = useRef<HTMLDivElement>(null);
  const vosplek = useVosplek(vakRef, buitenRef, vosRef, vlakRef, Boolean(vos.vangend));

  /*
    Waar de blokjes vandaan komen: uit de handen van Vos.

    Zolang dat nog niet gemeten is — het eerste beeldje, of zijn plaatje laadt
    nog — wordt er een plek vlak links naast het vak genomen. Dan klopt de
    richting al wel.
  */
  const handen: Plek = vosplek?.handen ?? {
    x: 100 + plan.maat * 0.5,
    y: plan.hoogte - plan.maat * 2,
  };
  /* Het blokje komt met zijn midden op die plek, niet met zijn hoek. */
  const vanaf: Plek = { x: handen.x - plan.maat / 2, y: handen.y - plan.maat / 2 };

  /*
    Rechts van het vak blijft een strook vrij zolang Vos bouwt.

    Die strook is van hem alleen. Zo staat hij naast het vak zonder erin te
    komen, ook op een telefoon — daar is het vak namelijk zo breed als het
    scherm. Telt het kind alleen, dan is de strook niet nodig en krijgt het vak
    de volle breedte.
  */
  const metStrook = Boolean(vos.vangend) && stand === "vosbouwt";
  const strook = metStrook ? "max-w-xl pr-20 sm:pr-24 lg:pr-28" : "max-w-lg";

  /* Hoog naast het vak zolang hij bouwt, daarna opzij in de hoek. */
  const vosLaag = af;
  const vosstand = af ? "wachtend" : "vangend";

  return (
    <div ref={buitenRef} className={`mx-auto w-full ${strook}`}>
      {/*
        Het vak.

        Een eigen rand en een eigen achtergrond: alles hierbinnen telt mee,
        daarbuiten niet. Vos staat er met opzet helemaal buiten — anders telt
        een kind hem gewoon mee.
      */}
      <div
        ref={vakRef}
        /*
          `z-10`: het vak ligt boven Vos, zodat een blokje dat vlak langs hem
          schuift niet achter hem verdwijnt.
        */
        className="relative z-10 w-full rounded-groot border-2 border-rand bg-white p-3 shadow-op sm:p-4"
      >
        <div
          ref={vlakRef}
          className="relative w-full"
          style={{ aspectRatio: `100 / ${plan.hoogte}` }}
        >
          {/*
            De staven die al aan elkaar geklikt zijn.

            Ze veren even op als ze ontstaan: dat is het "klik" waar het kind op
            moet letten. Elke staaf komt maar één keer in beeld, dus het veertje
            speelt precies één keer af.
          */}
          {plan.staven.slice(0, vast).map((plek, i) => (
            <OpPlek
              key={`staaf-${i}`}
              plek={plek}
              breedte={plan.maat * STAAF_LANG}
              hoogte={plan.maat}
              vakhoogte={plan.hoogte}
              klikt={bouwt}
            >
              <Staaf />
            </OpPlek>
          ))}

          {/*
            De losse blokjes die nog een staaf moeten worden.

            Ze liggen op de rij van hun eigen staaf, met een gaatje ertussen,
            tot Vos ze tegen elkaar aan schuift. Zodra ze vastgeklikt zijn,
            neemt de staaf hierboven het over en verdwijnen ze hier.
          */}
          {Array.from({ length: Math.max(0, Math.min(gelegd, t * 10) - vast * 10) }, (_, k) => {
            const nummer = vast * 10 + k;
            const staaf = Math.floor(nummer / 10);
            const aangeschoven = staaf < geschoven;
            return (
              <OpPlek
                key={`blok-${nummer}`}
                plek={aangeschoven ? plekInStaaf(plan, nummer) : plekLosInRij(plan, nummer)}
                breedte={plan.maat}
                hoogte={plan.maat}
                vakhoogte={plan.hoogte}
                vloeiend={bouwt}
                vanaf={bouwt ? vanaf : null}
              >
                <Blokje />
              </OpPlek>
            );
          })}

          {/* En de losse blokjes die los blijven: daar kan geen staaf meer van. */}
          {Array.from({ length: Math.max(0, gelegd - t * 10) }, (_, i) => (
            <OpPlek
              key={`los-${i}`}
              plek={plan.losse[i]}
              breedte={plan.maat}
              hoogte={plan.maat}
              vakhoogte={plan.hoogte}
              vanaf={bouwt ? vanaf : null}
            >
              <Blokje />
            </OpPlek>
          ))}

          {/*
            Overslaan met één tik.

            Een doorzichtige knop over het hele vak, alleen zolang er iets te
            wachten valt. Een kind dat wil beginnen, hoeft nooit te kijken hoe
            een animatie afloopt.
          */}
          {!af && (
            <button
              type="button"
              onClick={slaOver}
              aria-label="Zet de staven meteen klaar"
              className="absolute inset-0 z-20 cursor-pointer rounded-groot focus:outline-none focus-visible:ring-2 focus-visible:ring-huisstijl"
            />
          )}
        </div>
      </div>

      {/*
        Vos, binnen het witte kaartje van de oefening.

        Rechts naast het vak terwijl hij bouwt, met zijn voeten op de onderkant
        ervan; daarna schuift hij opzij naar de hoek rechtsonder en blijft hij
        kijken. Allebei die plekken liggen buiten het vak en onder de vraagtekst,
        dus hij bedekt nooit een knop of de vraag.
      */}
      {vos.vangend && vosplek && (
        <div
          ref={vosRef}
          aria-hidden="true"
          className="pointer-events-none absolute z-0 w-16 origin-bottom transition-[right,bottom] duration-700 ease-in-out motion-reduce:transition-none sm:w-20 lg:w-24"
          style={{
            right: vosLaag || !metStrook ? "0.5rem" : `${vosplek.zijkant}px`,
            bottom: vosLaag || !metStrook ? "0.75rem" : `${vosplek.hoog}px`,
          }}
        >
          <Vosbeeld houdingen={vos} stand={vosstand} />
        </div>
      )}
      {/* Zonder meting nog niets tonen; één beeldje later staat hij goed. */}
      {vos.vangend && !vosplek && <span ref={vosRef} className="hidden" />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hetzelfde vak in het uitlegfilmpje
// ---------------------------------------------------------------------------

/**
 * Dezelfde blokken in hetzelfde vak, met wat er nu oplicht.
 *
 * Bewust geen andere weergave en geen ander materiaal: een kind dat net deze
 * staven zat te tellen, moet in de uitleg diezelfde staven terugzien. Zou daar
 * ineens een getallenlijn staan, dan moet het zelf bedenken dat die hetzelfde
 * voorstelt — en juist dat verband is wat hier geoefend wordt.
 *
 * `stavenOp` en `losseOp` tellen van voren af aan mee: wat al geteld is, staat
 * vol in beeld, de rest wacht gedimd. `nadruk` is de staaf die nu aan de beurt
 * is en een gloedje krijgt.
 */
export function Uitlegblokken({
  tientallen,
  eenheden,
  stavenOp,
  losseOp,
  nadruk = null,
  bijschrift,
}: {
  tientallen: number;
  eenheden: number;
  stavenOp: number;
  losseOp: number;
  nadruk?: number | null;
  bijschrift?: string;
}) {
  const plan = blokkenPlan(tientallen, eenheden);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="relative w-full max-w-sm rounded-groot border-2 border-rand bg-white p-3 shadow-op">
        <div className="relative w-full" style={{ aspectRatio: `100 / ${plan.hoogte}` }}>
          {plan.staven.map((plek, i) => (
            <OpPlek
              key={`staaf-${i}`}
              plek={plek}
              breedte={plan.maat * STAAF_LANG}
              hoogte={plan.maat}
              vakhoogte={plan.hoogte}
              vloeiend={false}
            >
              <Staaf gedimd={i >= stavenOp} nadruk={nadruk === i} />
            </OpPlek>
          ))}

          {plan.losse.map((plek, i) => (
            <OpPlek
              key={`los-${i}`}
              plek={plek}
              breedte={plan.maat}
              hoogte={plan.maat}
              vakhoogte={plan.hoogte}
              vloeiend={false}
            >
              <Blokje gedimd={i >= losseOp} />
            </OpPlek>
          ))}
        </div>
      </div>

      {bijschrift && (
        <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">{bijschrift}</p>
      )}
    </div>
  );
}
