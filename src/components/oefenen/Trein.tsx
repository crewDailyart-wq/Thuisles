"use client";

/**
 * Vos' trein: zet de wagons op volgorde.
 *
 * Een vrolijke locomotief links, met daarachter lege koppelplekken. De wagons
 * staan door elkaar op het rangeerspoor eronder, elk met een groot getal. Het
 * kind sleept ze op volgorde achter de locomotief.
 *
 * ---------------------------------------------------------------------------
 * Hetzelfde slepen als bij "Tellen en slepen"
 * ---------------------------------------------------------------------------
 * Bewust dezelfde bediening: oppakken met een tik of met een sleep, neerzetten
 * op een lege plek, en een wagon die al staat kun je weer oppakken. Een kind
 * dat het daar geleerd heeft, hoeft hier niets nieuws te leren.
 *
 * De ingebouwde `draggable` van HTML werkt niet op een touchscreen, en dit is
 * een app voor tablets. Daarom met pointer-gebeurtenissen, precies zoals bij
 * dat type.
 *
 * ---------------------------------------------------------------------------
 * Waarom een trein
 * ---------------------------------------------------------------------------
 * Ordenen is voor een kind geen som maar een handeling: iets op de goede plek
 * leggen. Een trein maakt die handeling zichtbaar — de wagons horen áchter
 * elkaar, en zodra het klopt rijdt hij weg. Dat is de beloning, en meteen de
 * controle.
 */

import { useEffect, useRef, useState } from "react";
import { Vosbeeld, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";
import { opgavegeluidStaatAan, treinfluit } from "@/lib/geluid";
import { MACHINIST } from "@/lib/generatoren/trein";

const RAND = "#33261c";
const RANDDIKTE = 4;

/**
 * De maten van de locomotief, in de eenheden van zijn eigen tekening.
 *
 * Honderdtwintig breed en honderdvijftig hoog: hoger dan breed, want de cabine
 * moet een raampje dragen waar een vossenkop met pet in past. Hij groeit
 * daarmee in de hoogte en niet in de breedte, zodat de wagons ernaast even
 * groot blijven als ze waren.
 */
const LOCO = { breedte: 120, hoogte: 155 };

/**
 * Hoe breed de locomotief in de rij staat.
 *
 * Ruimer dan hiervoor, want anders blijft het raampje een postzegel: de hele
 * locomotief is maar een vijfde van de rij, en het raampje daar weer een deel
 * van. Verder gaat niet zonder dat de wagons eronder lijden — die houden bij
 * vier wagons ruim twintig pixels aan cijferhoogte over, en dat is de grens.
 */
const LOCO_BREEDTE = "28%";

/**
 * Bij een lange trein krimpt de locomotief mee.
 *
 * De wagons verdelen wat de locomotief overlaat. Bij tien wagons zou 28 procent
 * voor de loco betekenen dat elke wagon nog maar zeven procent van de rij
 * krijgt, en dan past het getal er niet meer leesbaar in. Tot en met vijf
 * wagons verandert er niets, zodat bestaande sjablonen er precies zo uitzien
 * als altijd.
 */
function locoBreedte(wagons: number): string {
  if (wagons <= 5) return LOCO_BREEDTE;
  return `${Math.max(14, 28 - (wagons - 5) * 2.8).toFixed(1)}%`;
}

/* Waar het raampje zit; zie `MACHINIST` in de generator. Eén plek, dit is hem. */
const RAAMPJE = MACHINIST.raampje;

/** Hoe lang het koppelen duurt voordat de trein gaat rijden. */
const KOPPELTIJD = 420;

/** En hoe lang het hele vertrek duurt, tot het feestscherm mag komen. */
const VERTREKTIJD = 1750;

/**
 * Het voordoen met een handje.
 *
 * Deze kinderen lezen nog nauwelijks, dus de zin boven de opgave is maar de
 * helft van het verhaal. Zit het kind stil, dan pakt een handje één wagon op,
 * gaat een stukje richting het eerste lege vak en laat hem weer los — precies
 * het gebaar dat het zelf moet maken. Hoogstens twee keer, en meteen weg zodra
 * het kind zelf een wagon aanraakt. Hetzelfde voordoen als bij het tellen van
 * plaatjes; zie `Plaatjesraster`.
 */
const VOORDOEN = {
  /** Hoe lang het kind stil moet zitten voordat het handje komt. */
  eersteWacht: 4000,
  tweedeWacht: 8000,
  /** Oppakken, onderweg, weer loslaten. */
  pakken: 500,
  slepen: 900,
  loslaten: 600,
  /** Hoe ver het handje richting het vak gaat: een stukje, niet helemaal. */
  deel: 0.55,
};

/** Vrolijke wagonkleuren, in vaste volgorde zodat een wagon zijn kleur houdt. */
const KLEUREN = ["#f2a03d", "#6ec2a0", "#ef8080", "#87b9ee", "#c79ae8"];

/**
 * De locomotief, met een groot raampje voor de machinist.
 *
 * Het raampje is met opzet fors en vierkant: er moet een vossenkop met pet en
 * een zwaaiende poot in passen, en dat is het hele punt van deze tekening. Een
 * kind ziet Vos zitten en snapt meteen waarom die trein er staat.
 *
 * `stoomt` zet er extra pluimen bij als hij op het punt staat te vertrekken.
 */
function Locomotief({ stoomt = false }: { stoomt?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${LOCO.breedte} ${LOCO.hoogte}`}
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {/* Stoomwolkjes uit de schoorsteen. */}
      <g className="motion-safe:animate-stoom">
        <circle cx="14" cy="42" r="9" fill="#ffffff" opacity="0.95" stroke={RAND} strokeWidth="2.5" />
        <circle cx="28" cy="30" r="6.5" fill="#ffffff" opacity="0.8" stroke={RAND} strokeWidth="2.5" />
      </g>
      {stoomt && (
        <g className="motion-safe:animate-stoom" style={{ animationDelay: "0.45s" }}>
          <circle cx="20" cy="36" r="7.5" fill="#ffffff" opacity="0.9" stroke={RAND} strokeWidth="2.5" />
          <circle cx="36" cy="22" r="5" fill="#ffffff" opacity="0.75" stroke={RAND} strokeWidth="2.5" />
        </g>
      )}

      {/* Het dak van de cabine, met een overstek. */}
      <rect x="28" y="10" width="92" height="12" rx="4" fill="#c24a22" stroke={RAND} strokeWidth={RANDDIKTE} />
      {/* De cabine zelf: bijna de hele locomotief, want het raampje is de hoofdzaak. */}
      <path
        d="M36 20 h76 a5 5 0 0 1 5 5 v103 h-86 v-103 a5 5 0 0 1 5 -5 z"
        fill="#e2622f"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* Het raampje: het glas waar de machinist doorheen kijkt. */}
      <rect
        x={RAAMPJE.x}
        y={RAAMPJE.y}
        width={RAAMPJE.breedte}
        height={RAAMPJE.hoogte}
        rx="10"
        fill="#eaf6ff"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
      />

      {/* De ketel die er vooraan uitsteekt. */}
      <rect x="2" y="86" width="40" height="42" rx="12" fill="#f2a03d" stroke={RAND} strokeWidth={RANDDIKTE} />
      <path d="M8 93 h22 v6 h-22 z" fill="#ffffff" opacity="0.35" />
      {/* De schoorsteen. */}
      <rect x="6" y="56" width="17" height="32" rx="4" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      {/* Het lampje vooraan. */}
      <circle cx="10" cy="110" r="6" fill="#ffe9a8" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} />

      {/* Het onderstel en de wielen. */}
      <rect x="0" y="126" width="118" height="9" rx="4" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} />
      <circle cx="26" cy="138" r="13" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="26" cy="138" r="4.5" fill="#fdf6e8" />
      <circle cx="88" cy="139" r="14" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="88" cy="139" r="5" fill="#fdf6e8" />
    </svg>
  );
}

/**
 * De locomotief mét Vos in het raampje.
 *
 * De tekening en de afbeelding staan over elkaar heen: de eerste is een svg,
 * de tweede een gewoon plaatje. Beide rekenen met hetzelfde rechthoekje uit
 * `RAAMPJE`, omgerekend naar procenten van de locomotief — dus schuift het
 * raampje, dan schuift Vos mee.
 *
 * Hij wordt passend in het raampje gezet en niet bijgesneden: zo is zijn kop
 * met pet altijd helemaal te zien en valt er nooit iets over de rand, ook niet
 * als er later een andere afbeelding in gaat die anders van vorm is.
 */
function LocomotiefMetVos({
  machinist,
  stoomt = false,
  zwaait = false,
}: {
  machinist: string | null;
  stoomt?: boolean;
  zwaait?: boolean;
}) {
  return (
    <span className="relative block w-full">
      <Locomotief stoomt={stoomt} />
      {machinist && (
        <span
          aria-hidden="true"
          className="absolute overflow-hidden rounded-[10%] p-[4%]"
          style={{
            left: `${(RAAMPJE.x / LOCO.breedte) * 100}%`,
            top: `${(RAAMPJE.y / LOCO.hoogte) * 100}%`,
            width: `${(RAAMPJE.breedte / LOCO.breedte) * 100}%`,
            height: `${(RAAMPJE.hoogte / LOCO.hoogte) * 100}%`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/vragen/${machinist}`}
            alt=""
            draggable={false}
            className={`h-full w-full select-none object-contain ${
              zwaait ? "machinist-zwaait" : ""
            }`}
          />
        </span>
      )}
    </span>
  );
}

/** Eén wagon, met zijn getal groot op de zijkant. */
function Wagon({ getal, kleur }: { getal: number | null; kleur: number }) {
  const vlak = getal === null ? "#fdf6e8" : KLEUREN[kleur % KLEUREN.length];

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Koppelstuk */}
      <rect x="-6" y="52" width="12" height="7" rx="3" fill={RAND} />
      <rect
        x="4"
        y="24"
        width="92"
        height="48"
        rx="8"
        fill={vlak}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeDasharray={getal === null ? "9 7" : undefined}
      />
      {getal !== null && (
        <>
          <path d="M10 30 h76 v7 h-76 z" fill="#ffffff" opacity="0.35" />
          <text x="50" y="60" textAnchor="middle" fontSize="30" fontWeight="800" fill={RAND}>
            {getal}
          </text>
        </>
      )}
      <circle cx="28" cy="80" r="10" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="28" cy="80" r="3.5" fill="#fdf6e8" />
      <circle cx="72" cy="80" r="10" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="72" cy="80" r="3.5" fill="#fdf6e8" />
    </svg>
  );
}

type Plek = { soort: "spoor" } | { soort: "vak"; index: number };

/** Een plek op het scherm, in echte pixels. */
type Punt2 = { x: number; y: number };

/**
 * De hele trein, met het rangeerspoor eronder.
 *
 * `ingevuld` is per koppelplek het getal dat er staat, of `null`. Dat is ook
 * wat er als antwoord doorgegeven wordt — in dezelfde volgorde, met komma's
 * ertussen, net als bij "Tellen en slepen".
 */
export function Trein({
  wagons,
  ingevuld,
  goedeWaarden = null,
  fase = "bezig",
  vos = { vangend: null, wachtend: null, blij: null },
  machinist = null,
  onKlaar,
  onWijzig,
}: {
  /** De getallen zoals ze op het rangeerspoor klaarstaan. */
  wagons: number[];
  ingevuld: (number | null)[];
  /** Na het nakijken: wat er had moeten staan. */
  goedeWaarden?: number[] | null;
  fase?: "bezig" | "goed" | "fout";
  vos?: Voshoudingen;
  /**
   * Vos als machinist: de afbeelding die in het raampje komt te staan.
   *
   * Leeg = geen machinist; dan kijkt de gewone vos mee vanaf de kant, zoals het
   * was voordat deze afbeelding er was.
   */
  machinist?: { afbeelding: string | null } | null;
  /**
   * De trein is weggereden.
   *
   * Hiermee weet het scherm eromheen dat het feest mag beginnen. Zonder dit
   * valt de confetti over de trein heen op het moment dat hij wegrijdt, en ziet
   * het kind de beloning van zijn eigen werk niet.
   */
  onKlaar?: () => void;
  onWijzig?: (nieuw: (number | null)[]) => void;
}) {
  const uit = fase !== "bezig";
  const [bezig, setBezig] = useState<{ waarde: number; vanaf: Plek } | null>(null);
  const [zweef, setZweef] = useState<{ x: number; y: number } | null>(null);
  const vakken = useRef<(HTMLDivElement | null)[]>([]);
  const verplaatst = useRef(false);
  const beginpunt = useRef<{ x: number; y: number } | null>(null);

  /* Boven welk leeg vak de wagon nu zweeft; dat vak licht op. */
  const [boven, setBoven] = useState<number | null>(null);

  /*
    De maat van een koppelplek, in echte pixels.

    De wagons op het rangeerspoor krijgen precies die maat. Ze horen er immers
    in te passen, en dat zie je pas als ze even groot zijn — een wagon die
    kleiner is dan het gat eronder leest als iets anders, niet als hetzelfde
    ding op een andere plek.
  */
  const [vakmaat, setVakmaat] = useState<number | null>(null);
  useEffect(() => {
    const vak = vakken.current[0];
    if (!vak) return;
    function meet() {
      const breed = vak?.getBoundingClientRect().width ?? 0;
      if (breed > 0) setVakmaat((vorig) => (vorig !== null && Math.abs(vorig - breed) < 0.5 ? vorig : breed));
    }
    meet();
    const kijker = new ResizeObserver(meet);
    kijker.observe(vak);
    window.addEventListener("resize", meet);
    return () => {
      kijker.disconnect();
      window.removeEventListener("resize", meet);
    };
  }, [ingevuld.length]);

  /* Wat er nog op het rangeerspoor staat: alles wat niet gekoppeld is. */
  const opSpoor: number[] = [];
  const gebruikt = [...ingevuld];
  for (const w of wagons) {
    const plek = gebruikt.indexOf(w);
    if (plek >= 0) gebruikt[plek] = null;
    else opSpoor.push(w);
  }

  function leg(waarde: number, vanaf: Plek, naar: Plek) {
    const nieuw = [...ingevuld];
    if (vanaf.soort === "vak") nieuw[vanaf.index] = null;

    if (naar.soort === "vak") {
      /* Staat er al een wagon? Die gaat terug naar het spoor. */
      nieuw[naar.index] = waarde;
    }
    setBezig(null);
    setZweef(null);
    onWijzig?.(nieuw);
  }

  function startSleep(e: React.PointerEvent, waarde: number, vanaf: Plek) {
    if (uit) return;
    setBezig({ waarde, vanaf });
    setZweef({ x: e.clientX, y: e.clientY });
  }

  /** Boven welk vak ligt dit punt? `null` als het er geen is. */
  function vakOnder(x: number, y: number): number | null {
    let gevonden: number | null = null;
    vakken.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) gevonden = i;
    });
    return gevonden;
  }

  function beweeg(e: React.PointerEvent) {
    if (!bezig) return;
    const start = beginpunt.current;
    if (start && (Math.abs(e.clientX - start.x) > 6 || Math.abs(e.clientY - start.y) > 6)) {
      verplaatst.current = true;
    }
    if (verplaatst.current) {
      setZweef({ x: e.clientX, y: e.clientY });
      /* Waar hij terechtkomt als je nu loslaat: dat vak licht alvast op. */
      setBoven(vakOnder(e.clientX, e.clientY));
    }
  }

  function losLaten(e: React.PointerEvent) {
    if (!bezig) return;
    /* Een tik zonder beweging laat de wagon in de hand; die zet je met een
       tweede tik neer. Zo werkt het ook bij "Tellen en slepen". */
    if (!verplaatst.current) return;

    const doel = vakOnder(e.clientX, e.clientY);
    setBoven(null);

    if (doel !== null) {
      leg(bezig.waarde, bezig.vanaf, { soort: "vak", index: doel });
      return;
    }
    if (bezig.vanaf.soort === "vak") {
      leg(bezig.waarde, bezig.vanaf, { soort: "spoor" });
      return;
    }
    setBezig(null);
    setZweef(null);
    setBoven(null);
  }

  function tikVak(index: number) {
    if (uit) return;
    if (bezig) {
      leg(bezig.waarde, bezig.vanaf, { soort: "vak", index });
      return;
    }
    const erin = ingevuld[index];
    if (erin !== null) setBezig({ waarde: erin, vanaf: { soort: "vak", index } });
  }

  const goed = fase === "goed";
  const machinistBeeld = machinist?.afbeelding ?? null;

  /*
    Het voordoen: een handje dat één wagon oppakt en weer loslaat.

    Zonder tekst, want deze kinderen lezen nog nauwelijks. Het gebaar zelf is
    de uitleg: pakken, een stukje richting het eerste lege vak, loslaten — en
    de wagon springt terug, zodat duidelijk is dat er niets kapot gaat als je
    het probeert.

    Het speelt zich af in een los laagje boven de opgave, met dezelfde
    wagontekening. De echte wagon blijft staan waar hij staat; er wordt dus ook
    niets gewijzigd aan wat het kind heeft neergezet.
  */
  const spoorRef = useRef<HTMLButtonElement | null>(null);
  const [demo, setDemo] = useState<
    { waarde: number; kleur: number; maat: number; van: Punt2; naar: Punt2; stand: "op" | "heen" | "terug" } | null
  >(null);
  const voorgedaan = useRef(0);

  /* Zodra het kind zelf iets doet, is voordoen niet meer nodig. */
  const zelfBezig = bezig !== null || ingevuld.some((w) => w !== null);
  const demoWeg = demo === null;

  useEffect(() => {
    if (fase !== "bezig" || zelfBezig || !demoWeg) return;
    if (voorgedaan.current >= 2) return;

    const klokken: ReturnType<typeof setTimeout>[] = [];
    klokken.push(
      setTimeout(
        () => {
          const wagon = spoorRef.current;
          const vak = vakken.current.find((el, i) => el && ingevuld[i] === null) ?? null;
          const eerste = opSpoor[0];
          if (!wagon || !vak || eerste === undefined) return;

          const w = wagon.getBoundingClientRect();
          const v = vak.getBoundingClientRect();
          const van = { x: w.left, y: w.top };
          const naar = {
            x: w.left + (v.left - w.left) * VOORDOEN.deel,
            y: w.top + (v.top - w.top) * VOORDOEN.deel,
          };

          voorgedaan.current += 1;
          setDemo({ waarde: eerste, kleur: wagons.indexOf(eerste), maat: w.width, van, naar, stand: "op" });
        },
        voorgedaan.current === 0 ? VOORDOEN.eersteWacht : VOORDOEN.tweedeWacht,
      ),
    );

    return () => {
      for (const k of klokken) clearTimeout(k);
    };
    /* `opSpoor` en `wagons` veranderen niet zolang het kind niets doet. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, zelfBezig, demoWeg]);

  /*
    De stappen van het voordoen: oppakken, onderweg, weer loslaten.

    Met opzet in een eigen effect en niet bij het inplannen hierboven. Daar
    verandert `demo` immers zodra het handje verschijnt, en dan ruimt React dat
    effect op — inclusief de klokjes voor de volgende stappen. Het handje bleef
    dan met de wagon in de lucht hangen.
  */
  const demoStand = demo?.stand ?? null;
  useEffect(() => {
    if (demoStand === null) return;
    const duur =
      demoStand === "op"
        ? VOORDOEN.pakken
        : demoStand === "heen"
          ? VOORDOEN.slepen
          : VOORDOEN.loslaten;
    const klok = setTimeout(() => {
      setDemo((d) =>
        !d ? d : d.stand === "op" ? { ...d, stand: "heen" } : d.stand === "heen" ? { ...d, stand: "terug" } : null,
      );
    }, duur);
    return () => clearTimeout(klok);
  }, [demoStand]);

  /* Het kind pakt zelf iets: het handje verdwijnt meteen. */
  useEffect(() => {
    if (zelfBezig) setDemo(null);
  }, [zelfBezig]);

  /*
    Het eerste lege vak, zolang er nog helemaal niets staat.

    Alleen dan: staat er al een wagon, dan weet het kind hoe het werkt en hoeft
    er niets meer te knipperen.
  */
  const eersteLege = ingevuld.every((w) => w === null) ? 0 : null;

  /*
    Het vertrek, in drie stappen.

    Eerst koppelen de wagons vast — een korte klap waarbij de trein even
    terugveert. Dan komt de stoom, klinkt het fluitje en rijdt hij naar rechts
    het beeld uit. Pas als hij weg is, mag het feestscherm komen.

    Het fluitje hangt aan de bestaande geluidsknop in de opgave: staat die uit,
    dan blijft het stil en rijdt de trein gewoon zonder geluid weg.
  */
  const [vertrek, setVertrek] = useState<"nee" | "koppelt" | "rijdt">("nee");
  const klaarRef = useRef(onKlaar);
  klaarRef.current = onKlaar;
  useEffect(() => {
    if (fase !== "goed") {
      setVertrek("nee");
      return;
    }
    setVertrek("koppelt");
    let stopFluit: (() => void) | undefined;
    const rijden = setTimeout(() => {
      setVertrek("rijdt");
      if (opgavegeluidStaatAan()) stopFluit = treinfluit();
    }, KOPPELTIJD);
    const klaar = setTimeout(() => klaarRef.current?.(), VERTREKTIJD);
    return () => {
      stopFluit?.();
      clearTimeout(rijden);
      clearTimeout(klaar);
    };
  }, [fase]);

  return (
    <div
      className="flex flex-col gap-4"
      onPointerDown={(e) => {
        verplaatst.current = false;
        beginpunt.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={beweeg}
      onPointerUp={losLaten}
      onPointerCancel={losLaten}
    >
      {/* De trein zelf: locomotief met de koppelplekken erachter. */}
      <div className="overflow-hidden rounded-groot border-2 border-rand bg-[#eaf6ff] p-3 shadow-op sm:p-4">
        <div
          /*
            `overflow-hidden` op het vak hierboven zorgt dat de trein er netjes
            uit rijdt in plaats van over de rest van de bladzijde te schuiven.
          */
          className={`flex items-end gap-1 transition-transform duration-[1200ms] ease-in ${
            /*
              Naar links, want dat is waar de locomotief heen kijkt: de ketel,
              de schoorsteen en het lampje zitten vooraan links en de cabine
              erachter. Naar rechts wegrijden zou achteruit zijn — en daar kwam
              hij net vandaan.
            */
            vertrek === "rijdt" ? "-translate-x-[125%]" : ""
          } ${vertrek === "koppelt" ? "motion-safe:animate-trein-koppelt" : ""}`}
        >
          <span className="block shrink-0" style={{ width: locoBreedte(ingevuld.length) }}>
            <LocomotiefMetVos
              machinist={machinistBeeld}
              stoomt={vertrek !== "nee"}
              zwaait={vertrek === "rijdt"}
            />
          </span>

          {ingevuld.map((waarde, i) => (
            <div
              key={i}
              ref={(el) => {
                vakken.current[i] = el;
              }}
              onPointerDown={(e) => {
                const erin = ingevuld[i];
                if (!bezig && erin !== null) startSleep(e, erin, { soort: "vak", index: i });
              }}
              role="button"
              tabIndex={uit ? -1 : 0}
              aria-label={
                waarde === null ? `Lege plek ${i + 1}` : `Plek ${i + 1}: wagon ${waarde}`
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  tikVak(i);
                }
              }}
              className={`w-full cursor-pointer rounded-xl transition [touch-action:none] ${
                bezig && fase === "bezig" ? "ring-2 ring-huisstijl/40" : ""
              } ${
                /* Hier komt hij terecht als je nu loslaat. */
                boven === i ? "scale-105 ring-4 ring-huisstijl bg-huisstijl-zacht" : ""
              } ${
                /*
                  Het eerste lege vak pulseert zolang er nog niets staat: dat is
                  waar het kind moet beginnen. Niet meer zodra er één wagon staat.
                */
                eersteLege === i && !bezig && fase === "bezig"
                  ? "vak-pulseert"
                  : ""
              } ${
                /* Een wagon die er al staat, kun je weer oppakken. */
                waarde !== null && fase === "bezig" ? "hover:scale-105" : ""
              } ${
                fase === "fout" && goedeWaarden && waarde !== goedeWaarden[i]
                  ? "ring-4 ring-roze"
                  : ""
              }`}
            >
              <Wagon getal={waarde} kleur={waarde === null ? 0 : wagons.indexOf(waarde)} />
              {fase === "fout" && goedeWaarden && waarde !== goedeWaarden[i] && (
                <span className="block text-center text-sm font-extrabold text-groen-diep">
                  {goedeWaarden[i]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* De rails onder de trein. */}
        <span aria-hidden="true" className="mt-1 block h-1.5 w-full rounded-full bg-[#9aa7b4]" />
      </div>

      {/* Het rangeerspoor: de wagons die nog moeten worden ingedeeld. */}
      {fase === "bezig" && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {opSpoor.map((waarde, i) => (
            <button
              key={waarde}
              ref={i === 0 ? spoorRef : undefined}
              type="button"
              onPointerDown={(e) => startSleep(e, waarde, { soort: "spoor" })}
              onClick={() => setBezig({ waarde, vanaf: { soort: "spoor" } })}
              aria-label={`Wagon ${waarde}`}
              /*
                Even breed als een koppelplek hierboven, in gemeten pixels. Zo
                is met één blik te zien dat dit ding in dat gat past; verschilden
                ze van maat, dan leest het als twee verschillende dingen.
              */
              style={vakmaat ? { width: `${vakmaat}px` } : undefined}
              className={`block w-[19%] min-w-16 select-none rounded-xl transition [touch-action:none] ${
                bezig?.waarde === waarde && bezig.vanaf.soort === "spoor"
                  ? "scale-105 ring-4 ring-huisstijl"
                  : "hover:scale-110"
              }`}
            >
              <Wagon getal={waarde} kleur={wagons.indexOf(waarde)} />
            </button>
          ))}

          {/*
            Vos kijkt toe vanaf de perronkant; hij staat buiten de wagons.

            Alleen als hij niet al in de locomotief zit. Daar doet hij iets —
            hij is de machinist — en hier stond hij alleen maar te staan.
          */}
          {!machinistBeeld && vos.vangend && (
            <span aria-hidden="true" className="block w-[14%] min-w-12">
              <Vosbeeld houdingen={vos} stand="wachtend" />
            </span>
          )}
        </div>
      )}

      {/*
        De wagon die meereist met de vinger of de muis.

        Hij hangt scheef en werpt een schaduw: dat is hoe je in beeld laat zien
        dat iets ópgetild is en nog niet ergens ligt.
      */}
      {bezig && zweef && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-50 block w-20 -rotate-6 drop-shadow-[0_6px_6px_rgba(51,38,28,0.35)]"
          style={{ left: zweef.x - 40, top: zweef.y - 40 }}
        >
          <Wagon getal={bezig.waarde} kleur={wagons.indexOf(bezig.waarde)} />
        </span>
      )}

      {/*
        Het voordoen: een handje met een wagon eraan.

        Een los laagje boven alles heen, dat van de wagon op het spoor een
        stukje richting het eerste lege vak beweegt en weer terugkomt. De echte
        wagon blijft ondertussen gewoon staan.
      */}
      {demo && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-50 block transition-all duration-500 ease-in-out"
          style={{
            left: demo.stand === "heen" ? demo.naar.x : demo.van.x,
            top: demo.stand === "heen" ? demo.naar.y : demo.van.y,
            width: demo.maat,
            transform: demo.stand === "op" || demo.stand === "heen" ? "rotate(-6deg)" : undefined,
            filter:
              demo.stand === "op" || demo.stand === "heen"
                ? "drop-shadow(0 6px 6px rgba(51,38,28,0.35))"
                : undefined,
          }}
        >
          <Wagon getal={demo.waarde} kleur={demo.kleur} />
          <span
            className="absolute"
            style={{ left: "38%", top: "52%", fontSize: `${Math.max(16, demo.maat * 0.5)}px` }}
          >
            👆
          </span>
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dezelfde trein in het uitlegfilmpje
// ---------------------------------------------------------------------------

/**
 * De trein in de uitleg: de wagons springen één voor één op hun plek.
 *
 * `klaar` zegt hoeveel wagons er al gekoppeld zijn; `nadruk` welke er nu
 * oplicht. Zo is te zien dat ordenen stap voor stap gaat: eerst de kleinste,
 * dan de volgende.
 */
export function Uitlegtrein({
  volgorde,
  klaar,
  nadruk = null,
  bijschrift,
}: {
  /** De wagons in de goede volgorde. */
  volgorde: number[];
  klaar: number;
  nadruk?: number | null;
  bijschrift?: string;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="w-full max-w-sm rounded-groot border-2 border-rand bg-[#eaf6ff] p-3 shadow-op">
        <div className="flex items-end gap-1">
          <span className="block shrink-0" style={{ width: locoBreedte(volgorde.length) }}>
            <Locomotief />
          </span>
          {volgorde.map((waarde, i) => (
            <span
              key={i}
              className={`block w-full transition ${
                i < klaar ? "" : "opacity-25"
              } ${nadruk === i ? "scale-110" : ""}`}
            >
              <Wagon getal={i < klaar ? waarde : null} kleur={i} />
            </span>
          ))}
        </div>
        <span aria-hidden="true" className="mt-1 block h-1.5 w-full rounded-full bg-[#9aa7b4]" />
      </div>
      {bijschrift && (
        <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">{bijschrift}</p>
      )}
    </div>
  );
}
