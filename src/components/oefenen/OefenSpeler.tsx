"use client";

/**
 * De oefening: één vraag tegelijk, controleren, feedback, volgende.
 *
 * Uitgangspunten uit het project:
 *   - nooit een harde melding of een schrikkleur;
 *   - bij een fout antwoord een voorzichtige uitleg van de waarschijnlijke
 *     denkfout ("Misschien heb je…"), en niet meteen het hele antwoord;
 *   - het kind hoeft de vraag niet opnieuw te maken; we gaan door. Wat lastig
 *     was komt terug in de herhaalronde en later in "Voor jou";
 *   - een hint is er altijd, vóór het antwoorden, zonder straf.
 *
 * Wat er achter de schermen bijgehouden wordt (en pas aan het eind van de
 * ronde in één keer wordt opgestuurd): per antwoord het leerdoel, goed of
 * fout, welk foutpatroon herkend is, of er hulp is gebruikt, en hoe lang het
 * duurde. Meer niet.
 */

import Link from "next/link";
import { BosSpel } from "@/components/oefenen/BosSpel";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { beloonGoedAntwoord, bewaarAntwoord, meldLastig, rondAf } from "@/app/oefenacties";
import { Icoon } from "@/components/kind/Icoon";
import { Feestscherm } from "@/components/oefenen/Feestscherm";
import { SleepGetallen } from "@/components/oefenen/SleepGetallen";
import { Stapstenen } from "@/components/oefenen/Stapstenen";
import { Plaatjesraster } from "@/components/oefenen/Plaatjesraster";
import { Blokkenvak, type Blokkenstand } from "@/components/oefenen/Mabblokken";
import { Cijferinvoer } from "@/components/oefenen/Cijferinvoer";
import { Huizenrij } from "@/components/oefenen/Huizenrij";
import { Visvijver } from "@/components/oefenen/Visvijver";
import { Trein } from "@/components/oefenen/Trein";
import { Vakken } from "@/components/oefenen/Vakken";
import { Bioscoop } from "@/components/oefenen/Bioscoop";
import { Oefenbalk, type Bolstand } from "@/components/oefenen/Oefenbalk";
import {
  Figuurtekening,
  beschrijfFiguur,
  figuurIsTekenbaar,
} from "@/components/oefenen/Figuurtekening";
import { InvulFiguur } from "@/components/oefenen/InvulFiguur";
import { Uitlegweergave } from "@/components/oefenen/Uitlegweergave";
import { leesGroepsvorm, vormBijGroep } from "@/lib/generatoren/uitlegscript";
import { goedeAntwoordInTekst, isGoed, kortGetalLengte } from "@/lib/antwoord";
import {
  abonneerOpgavegeluid,
  opgavegeluidOpServer,
  opgavegeluidStaatAan,
  wekGeluid,
  zetOpgavegeluid,
} from "@/lib/geluid";
import { Luidspreker, LuidsprekerUit } from "@/components/oefenen/Symbolen";
import { nuInMs } from "@/lib/klok";
import {
  bewaarSessie,
  leesSessie,
  sessieSleutel,
  wisSessie,
} from "@/lib/oefensessie";
import { zetSaldo } from "@/lib/sleutelwinkel";
import { zoekGenerator } from "@/lib/generatoren";
import {
  ALGEMENE_OPENING,
  ZONDER_GEGEVENS,
  herkenFout,
  leeftijdsgroepVan,
  type Foutpatroon,
  type Somgegevens,
  type Uitlegstap,
} from "@/lib/generatoren/foutpatroon";
import type { RondeAntwoord } from "@/app/oefenacties";
import { type AntwoordOptie, type OefenVraag } from "@/lib/vraagtypes";

/**
 * De som met daarbij wat het kind heeft ingevuld, als dat meer dan één getal is.
 *
 * Alleen bij vraagvormen waar één antwoord uit meerdere getallen bestaat. De
 * foutpatronen van zo'n type kunnen daarmee zien wát er misging — of er twee
 * verwisseld zijn bijvoorbeeld, en dat is aan één getal niet te merken.
 */
function metGegevenGetallen(vraag: OefenVraag, gegeven: string): Somgegevens | null {
  if ((vraag.vorm !== "sleepgetallen" && vraag.vorm !== "bosspel") || !vraag.somgegevens) return vraag.somgegevens;

  const extra: Record<string, number> = { ...(vraag.somgegevens.extra ?? {}) };
  gegeven.split(",").forEach((deel, i) => {
    const w = Number(deel);
    if (Number.isFinite(w) && deel !== "") extra[`gegeven${i}`] = w;
  });

  return { ...vraag.somgegevens, extra };
}

/**
 * Het antwoord zoals de foutpatronen het verwachten: als getal.
 *
 * Bij meerkeuze is het antwoord de plék in de rij knoppen — "2" betekent de
 * derde knop, niet het getal twee. De foutpatronen rekenen met het getal zelf:
 * "is dit precies één staaf te weinig?". Zonder deze omzetting vergeleken ze
 * een plek met een getal, en ging er dus zo goed als nooit een patroon af —
 * dan kreeg een kind bij een fout antwoord alleen de algemene aanpak te zien
 * in plaats van wat er misging.
 */
function gegevenWaarde(vraag: OefenVraag, gekozen: string): string {
  if (vraag.vorm !== "meerkeuze") return gekozen;
  const plek = Number(gekozen);
  const optie = vraag.opties?.[plek];
  return optie ? optie.tekst : gekozen;
}

type Fase = "bezig" | "goed" | "fout";

/**
 * De maat van een compact antwoordvak, naar het aantal cijfers dat erin moet.
 *
 * Bij twee cijfers is het vak vierkant; bij drie en vier wordt het alleen
 * breder en niet hoger, zodat de rij vakjes op één lijn blijft.
 */
function vakmaat(cijfers: number): { doos: string; tekst: string } {
  if (cijfers <= 2) return { doos: "h-24 w-24", tekst: "text-4xl" };
  if (cijfers === 3) return { doos: "h-24 w-28", tekst: "text-4xl" };
  return { doos: "h-24 w-32", tekst: "text-3xl" };
}

/** Onder deze tijd én fout: waarschijnlijk gegokt. */
const GOKGRENS_SECONDEN = 3;

/**
 * Hoe lang een gekozen vak oplicht voordat het wordt nagekeken.
 *
 * Kort genoeg om niet als wachten te voelen, lang genoeg om een misser te
 * herstellen: op een tablet tikt een kind zo net naast het vak dat het bedoelde.
 * Tikt het binnen deze tijd een ander vak aan, dan telt dat laatste.
 */
const KIESPAUZE_MS = 500;

// ---------------------------------------------------------------------------

export function OefenSpeler({
  vragen,
  terugHref,
  terugLabel,
  groep,
  aandachtVooraf,
  herhaalHref,
  beginsaldo,
  kindId,
  oefenpad,
  hervat,
}: {
  vragen: OefenVraag[];
  terugHref: string;
  terugLabel: string;
  groep: number;
  /** Leerdoelen die vóór deze ronde al aandacht vroegen. */
  aandachtVooraf: string[];
  /** Waar de knop "Oefen wat nog lastig was" naartoe gaat; inclusief leerdoel. */
  herhaalHref: string;
  /** Het sleutelsaldo bij het openen; de teller in de balk telt vanaf hier. */
  beginsaldo: number;
  /** Van wie deze sessie is; meerdere kinderen kunnen hetzelfde apparaat delen. */
  kindId: string;
  /** Het onderwerp, zonder zoekreeks. Daaronder bewaart de server de stand. */
  oefenpad: string;
  /*
    Was dit kind hier al mee bezig?

    Komt van de SERVER, uit de database — niet uit de browser. Daardoor staat
    de juiste vraag met de juiste bolletjes er al bij het eerste beeldje, op elk
    apparaat. `vragen` is dan de bewaarde serie en niet een nieuwe greep.
  */
  hervat: { rondeId: string; antwoorden: RondeAntwoord[] } | null;
}) {
  const leeftijd = leeftijdsgroepVan(groep);
  /*
    Groep 3-4 krijgt bij een fout geen tekstblokken maar kleur: het eigen
    antwoord rood, het goede antwoord groen, en meteen de uitleg-animatie. Op
    die leeftijd wordt lange tekst toch niet gelezen, en drie blokken tekst
    onder elkaar duwen de animatie bovendien van het scherm.

    Groep 5-6 en 7-8 houden de tekstuele aanpak.
  */
  const kortFeedback = leeftijd === "34";

  /*
    De serie waar dit kind mee bezig is.

    Die komt kant-en-klaar van de server: was het kind hier al mee bezig, dan
    is dit de bewaarde serie in dezelfde volgorde, zodat "vraag 4 van 15" ook
    echt vraag 4 uit dezelfde serie is.
  */
  const serie = vragen;
  /*
    Waar het kind gebleven is: de eerste vraag die nog niet beantwoord is.

    Bewust afgeleid uit het aantal antwoorden en niet apart bewaard. Stopte het
    kind ná het nakijken maar vóór "Volgende", dan zou een apart bewaarde
    positie die vraag opnieuw voorschotelen — en stond er aan het eind één
    antwoord te veel bij één vraag te weinig.
  */
  const [gelogd, setGelogd] = useState<RondeAntwoord[]>(hervat?.antwoorden ?? []);
  const [index, setIndex] = useState(() =>
    Math.min(hervat?.antwoorden.length ?? 0, Math.max(0, vragen.length - 1)),
  );
  const [antwoord, setAntwoord] = useState("");
  const [fase, setFase] = useState<Fase>("bezig");
  const [start, setStart] = useState(() => nuInMs());

  const [hintOpen, setHintOpen] = useState(false);
  const [uitlegOpen, setUitlegOpen] = useState(false);
  /*
    Groep 3-4 krijgt de animatie meteen te zien; deze vlag onthoudt alleen of
    het kind hem zelf heeft weggeklikt. Bewust geen effect dat `uitlegOpen`
    omzet: dat zou een extra render kosten en de animatie laten flikkeren.
  */
  const [uitlegWeggeklikt, setUitlegWeggeklikt] = useState(false);
  const [patroon, setPatroon] = useState<Foutpatroon | null>(null);

  const [feestje, setFeestje] = useState(0);

  /*
    De teller mag pas omhoog als de sleutel er is. De server is meestal sneller
    dan de vlucht, maar niet altijd — daarom wachten we op allebei en telt
    degene die als laatste klaar is de teller op.
  */
  const landing = useRef<{ geland: boolean; saldo: number | null }>({
    geland: false,
    saldo: null,
  });

  function telOpAlsAllesKlaarIs() {
    const stand = landing.current;
    if (!stand.geland || stand.saldo === null) return;
    zetSaldo(stand.saldo);
    stand.saldo = null;
  }

  /*
    Eén id voor deze oefenronde. Samen met het vraag-id vormt het de bron van
    de sleutel, zodat dezelfde vraag in deze ronde nooit twee sleutels oplevert
    — ook niet als het vangnet aan het eind van de ronde nog eens uitbetaalt.

    Pas aangemaakt bij het eerste antwoord, en niet bij het opbouwen van het
    scherm: dan draait `randomUUID` alleen in de browser en kan de server geen
    ander id verzinnen dan de browser.
  */
  const rondeId = useRef(hervat?.rondeId ?? "");

  /*
    Welke antwoorden al veilig in de database staan.

    Gevuld zodra de server "ok" heeft gezegd. Wat er aan het eind van de ronde
    niet in staat, ging onderweg verloren — geen verbinding, tabblad dicht — en
    wordt dan alsnog in één keer opgestuurd.

    Begint NIET leeg bij een hervatte ronde. De antwoorden die de server net
    heeft aangeleverd, staan daar per definitie al in; zou dat hier niet bekend
    zijn, dan stuurde het vangnet ze aan het eind van de ronde nog een keer op.
    Dat gebeurde ook echt: een ronde van vijftien vragen leverde zeventien
    antwoorden op, met de twee vragen van vóór het hervatten dubbel — en de
    ouder zag daardoor meer gemaakte sommen dan het kind had gedaan.
  */
  const bewaard = useRef<Set<string> | null>(null);
  if (bewaard.current === null) {
    bewaard.current = new Set((hervat?.antwoorden ?? []).map((a) => a.beloningsbron));
  }
  /*
    Bij welke vraag er al is nagekeken en doorgeklikt.

    De knoppen kijken naar `fase`, maar dat is een toestand: bij twee klikken
    binnen hetzelfde beeldje staat die nog op "bezig" en wordt er twee keer
    nagekeken. Dat gebeurde ook echt — in een bewaarde sessie stonden zestien
    antwoorden bij vijftien vragen, met vraag 7 en 8 dubbel. Een ref verandert
    meteen, dus die houdt de tweede klik wél tegen.
  */
  const nagekeken = useRef(-1);
  const doorgeklikt = useRef(-1);
  /*
    Wacht het feestscherm nog op de mascotte?

    Bij de stapstenen springt de vos na een goed antwoord eerst naar de overkant
    en pakt daar de sleutel op. Zou het feestscherm meteen komen, dan ligt dat er
    overheen en ziet een kind van die sprong niets. Voor alle andere vraagvormen
    blijft het precies zoals het was: het feest begint direct.
  */
  const [wachtOpVos, setWachtOpVos] = useState(false);
  /* De aan/uit-stand van de geluidjes in de opgave; los van het uitlegfilmpje. */
  const opgavegeluid = useSyncExternalStore(
    abonneerOpgavegeluid,
    opgavegeluidStaatAan,
    opgavegeluidOpServer,
  );
  const [klaar, setKlaar] = useState(false);
  const [snelFout, setSnelFout] = useState(0);
  const [rustBericht, setRustBericht] = useState("");

  /*
    Waar deze sessie onder bewaard wordt. Pas in de browser bekend, want het pad
    hoort erbij — en dat kent alleen de browser.
  */
  const sleutel = useRef("");

  /*
    Het vangnet in de browser.

    De stand staat in de database, bij het kind, en die is de baas. Maar een
    antwoord kan onderweg blijven steken: even geen verbinding, of het tabblad
    gaat dicht op het verkeerde moment. Daarom houdt de browser er een kopie
    van bij.

    Bij verschil wint de database. Alleen als hier antwoorden van DEZELFDE ronde
    staan die de server nog niet kende, worden die overgenomen — dan is er
    onderweg iets misgegaan en zou het kind die vragen anders opnieuw krijgen.
  */
  useEffect(() => {
    sleutel.current = sessieSleutel(kindId, oefenpad);
    const lokaal = leesSessie(sleutel.current);
    if (!lokaal) return;

    /* Een andere ronde: die hoort bij een serie die allang is afgesloten. */
    if (lokaal.rondeId === "" || lokaal.rondeId !== rondeId.current) return;
    if (lokaal.gelogd.length <= (hervat?.antwoorden.length ?? 0)) return;

    setGelogd(lokaal.gelogd);
    setIndex(Math.min(lokaal.gelogd.length, Math.max(0, vragen.length - 1)));
    nagekeken.current = -1;
    doorgeklikt.current = -1;
    setStart(nuInMs());
  }, [kindId, oefenpad, hervat, vragen.length]);

  /*
    Bewaren zodra er iets beantwoord is, niet pas aan het eind. Gaat het kind
    halverwege weg, dan staat de stand er al — ook als de server op dat moment
    niet bereikbaar was.
  */
  useEffect(() => {
    if (!sleutel.current || gelogd.length === 0 || klaar) return;
    bewaarSessie(sleutel.current, {
      rondeId: rondeId.current,
      vraagIds: serie.map((v) => v.id),
      gelogd,
    });
  }, [gelogd, serie, klaar]);


  const vraag = serie[index];

  /*
    Hoeveel er in deze ronde al goed zijn bij ditzelfde leerdoel.

    Voor de emmer bij "Vos gaat vissen": elke vis die het kind vangt, ligt er
    zichtbaar in. Het telt uit `gelogd`, wat er toch al bijgehouden wordt, dus
    er komt geen tweede boekhouding naast de voortgang te staan.
  */
  const gevangen = vraag
    ? gelogd.filter((r) => r.goed && r.leerdoelId === vraag.leerdoelId).length
    : 0;
  const generator = vraag?.somgegevens ? zoekGenerator(vraag.somgegevens.soort) : null;

  /*
    Kiezen uit vakken: de tik ís het antwoord.

    Bij deze vraagtypes staat er geen knop Controleer meer. Het kind tikt een
    vak aan, dat licht op, en een halve tel later wordt het nagekeken. Die
    pauze is er met opzet: op een tablet is een vak zo mis getikt, en in die
    tijd kan het kind nog een ander vak kiezen — dan telt dat laatste.

    Bij de types waar zelf iets ingevuld of gesleept wordt, blijft de knop
    gewoon staan: daar moet een kind eerst klaar zijn.
  */
  const kiestUitVakken = vraag?.vorm === "meerkeuze" || vraag?.vorm === "waar_niet_waar";
  const kiesklok = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopKiesklok() {
    if (kiesklok.current) {
      clearTimeout(kiesklok.current);
      kiesklok.current = null;
    }
  }

  function kies(waarde: string) {
    setAntwoord(waarde);
    if (!kiestUitVakken || fase !== "bezig") return;
    /* Nog een vak aangetikt binnen de pauze: het vorige klokje vervalt. */
    stopKiesklok();
    kiesklok.current = setTimeout(() => {
      kiesklok.current = null;
      controleer(waarde);
    }, KIESPAUZE_MS);
  }

  /* Weggaan of doorklikken terwijl er nog een klokje loopt: dat stopt hier. */
  useEffect(() => stopKiesklok, []);

  /*
    Hoort er een mascotte bij deze vraag?
    
    Zo ja, dan blijft er onderaan in het kaartje een strook voor hem vrij. Elk
    type dat Vos in zijn eigen vak zet, hoort hier bij te staan: zonder die
    strook komt hij over de knoppen te staan of valt hij buiten het kaartje.
  */
  const metMascotte =
    (vraag?.figuur?.soort === "plaatjesraster" || vraag?.figuur?.soort === "mabblokken") &&
    Boolean(vraag.figuur.vos.vangend);

  const invulbaar = vraag?.vorm === "bosspel" || (
    vraag?.vorm === "open" &&
    vraag.figuur !== null &&
    beschrijfFiguur(vraag.figuur).invulvak !== null);

  // De hint van de vraag zelf, of anders die van het herkende patroon.
  const hinttekst = vraag?.hint ?? patroon?.hint ?? null;

  /**
   * Nakijken.
   *
   * Het antwoord komt als waarde binnen en niet uit de toestand. Reden: bij de
   * vraagtypes waar je uit vakken kiest, kijkt een klokje even later na wat er
   * is aangetikt. Dat klokje wordt gezet in dezelfde stap waarin de keuze wordt
   * doorgegeven, en op dat moment staat de nieuwe keuze nog niet in de
   * toestand — die komt pas bij het volgende beeld. Zonder de waarde erbij zou
   * het dus het vórige antwoord nakijken.
   */
  function controleer(gekozen: string = antwoord) {
    if (gekozen.trim() === "") return;
    /* Deze vraag is al nagekeken; een tweede klik telt niet nog eens mee. */
    if (nagekeken.current === index) return;
    nagekeken.current = index;

    const seconden = (nuInMs() - start) / 1000;
    const goed = isGoed(vraag, gekozen);

    if (goed) {
      setFase("goed");
      /*
        Even wachten met het feestscherm zolang Vos nog bezig is: bij de
        stapstenen springt hij naar de overkant, bij het plaatjesraster vliegen
        de plaatjes eerst terug in zijn mand. Zou het feest er meteen overheen
        komen, dan ziet een kind daar niets van.
      */
      if (
        vraag.vorm === "stapstenen" ||
        vraag.vorm === "bosspel" ||
        vraag.figuur?.soort === "plaatjesraster" ||
        /* En bij het vissen: eerst komt de vis boven, daarna pas het feest. */
        vraag.figuur?.soort === "visvijver"
      ) {
        setWachtOpVos(true);
      }
      setFeestje((n) => n + 1);
      setSnelFout(0);
      vierGoedAntwoord();
      leg({
        goed: true,
        uitkomst: uitlegOpen ? "goed_na_uitleg" : hintOpen ? "goed_na_hint" : "direct_goed",
        foutpatroon: null,
        seconden,
        gegokt: false,
      });
      return;
    }

    // Fout: kijken welke denkfout hier waarschijnlijk achter zit.
    const gevonden =
      generator && vraag.somgegevens
        ? herkenFout(
            generator.foutpatronen,
            metGegevenGetallen(vraag, gekozen) ?? vraag.somgegevens,
            gegevenWaarde(vraag, gekozen),
          )
        : null;

    const gegokt = seconden < GOKGRENS_SECONDEN;
    const opeenvolgend = gegokt ? snelFout + 1 : 0;
    setSnelFout(opeenvolgend);

    if (opeenvolgend >= 2) {
      setRustBericht("Even rustig aan, je kunt het. Neem de tijd om te kijken.");
    }

    setPatroon(gevonden);
    setFase("fout");
    leg({
      goed: false,
      uitkomst: "fout",
      foutpatroon: gevonden?.id ?? null,
      seconden,
      gegokt,
    });
  }

  /**
   * Het feestje bij een goed antwoord: sleutel en teller.
   *
   * De confetti zit hier niet bij: die hangt aan `feestje` en start vanzelf.
   *
   * Het geluid ook niet meer. Dat klinkt nu in het feestscherm zelf, op het
   * moment dat de sleutel in beeld komt. Hier stond het aan het nakijken vast,
   * en dat is niet hetzelfde moment: bij het plaatjesraster vliegen eerst alle
   * plaatjes terug in de mand en bij de stapstenen springt Vos eerst naar de
   * overkant, dus klonk de plop een paar tellen te vroeg. Zie `Feestscherm`.
   *
   * De sleutel gaat hier wél meteen op weg, gemeten vanaf het antwoord dat het
   * kind net heeft gegeven. En pas als die aankomt, gaat de teller omhoog.
   *
   * Het bijschrijven in de database gaat meteen mee — niet pas aan het eind van
   * de ronde. Wat het kind ziet gebeuren, staat op dat moment ook echt vast.
   */
  function vierGoedAntwoord() {
    /*
      De geluidsmotor wakker maken, nog binnen de tik van het kind.

      Het sleutelgeluid zelf klinkt pas in het feestscherm, en dat kan bij
      sommige types seconden later zijn. Een telefoon laat geluid dat buiten een
      aanraking om begint niet zomaar toe; door hem hier alvast aan te zetten,
      klinkt de plop straks gewoon. Dit maakt zelf geen geluid.
    */
    wekGeluid();

    const bron = `${zorgVoorRondeId()}:${vraag.id}`;

    landing.current = { geland: false, saldo: null };

    void beloonGoedAntwoord(bron).then((uitslag) => {
      landing.current.saldo = uitslag.saldo;
      telOpAlsAllesKlaarIs();
    });
  }

  /**
   * Het id van deze oefenronde, en het wordt er één zodra dat nodig is.
   *
   * Pas bij het eerste antwoord aangemaakt en niet bij het opbouwen van het
   * scherm: dan draait `randomUUID` alleen in de browser en kan de server geen
   * ander id verzinnen dan de browser. Hervat het kind een ronde, dan staat het
   * er al in vanaf de server.
   */
  function zorgVoorRondeId(): string {
    if (rondeId.current === "") rondeId.current = crypto.randomUUID();
    return rondeId.current;
  }

  /**
   * Eén antwoord vastleggen.
   *
   * Het gaat meteen naar de database — niet pas aan het eind van de ronde.
   * Stopt een kind bij vraag 7, dan staan die zeven antwoorden er gewoon, ziet
   * de ouder ze, en gaat het kind op elk ander apparaat verder bij vraag 8 met
   * dezelfde gekleurde bolletjes.
   *
   * De lijst wordt hier zonder updaterfunctie opgebouwd, omdat diezelfde lijst
   * in dezelfde stap naar de server moet. Dat mag: `nagekeken` zorgt ervoor dat
   * dit per vraag precies één keer gebeurt.
   */
  function leg(
    deel: Omit<
      RondeAntwoord,
      "leerdoelId" | "vraagId" | "hintGebruikt" | "uitlegGebruikt" | "beloningsbron"
    >,
  ) {
    const regel: RondeAntwoord = {
      leerdoelId: vraag.leerdoelId,
      vraagId: vraag.id,
      hintGebruikt: hintOpen,
      uitlegGebruikt: uitlegOpen,
      /*
        Dezelfde bron als bij de directe uitbetaling hierboven. Aan het eind
        van de ronde wordt hiermee nog één keer geprobeerd uit te betalen;
        dat is alleen raak als de live-aanroep toen niet is aangekomen.
      */
      ...deel,
      beloningsbron: `${zorgVoorRondeId()}:${vraag.id}`,
    };

    const lijst = [...gelogd, regel];
    setGelogd(lijst);

    void bewaarAntwoord(
      oefenpad,
      {
        rondeId: rondeId.current,
        vraagIds: serie.map((v) => v.id),
        antwoorden: lijst,
      },
      regel,
    )
      .then(() => {
        bewaard.current?.add(regel.beloningsbron);
      })
      .catch(() => {
        /*
          Niet aangekomen. Geen ramp en geen melding: het staat in het vangnet
          in de browser, en aan het eind van de ronde gaat het alsnog mee.
        */
      });
  }

  function volgende() {
    /*
      Eén keer doorgaan per vraag. Zonder dit zou een dubbele klik een vraag
      overslaan, en op de laatste vraag de ronde twee keer opslaan.
    */
    if (doorgeklikt.current === index) return;
    doorgeklikt.current = index;

    // Vermoeidheid: veel fouten tegen het eind van de ronde.
    const laatste = [...gelogd].slice(-4);
    const veelFout = laatste.length === 4 && laatste.filter((a) => !a.goed).length >= 3;
    if (veelFout && index >= 6) {
      setRustBericht("Goed gewerkt! Je hebt al veel gedaan. Morgen verder?");
    }

    if (index + 1 >= serie.length) {
      /*
        Alles staat al in de database; per antwoord weggeschreven. Wat er niet
        in staat, is onderweg blijven steken en gaat hier alsnog mee.
      */
      const nietBewaard = gelogd.filter((a) => !bewaard.current?.has(a.beloningsbron));
      void rondAf(
        oefenpad,
        gelogd.map((a) => a.leerdoelId),
        nietBewaard,
      );
      /*
        De serie is af: het vangnet in de browser mag weg, zodat een volgende
        keer een nieuwe serie begint in plaats van deze te herhalen. De regel in
        de database ruimt `rondAf` hierboven op.
      */
      if (sleutel.current) wisSessie(sleutel.current);
      setKlaar(true);
      return;
    }

    stopKiesklok();
    setIndex(index + 1);
    setAntwoord("");
    setFase("bezig");
    setWachtOpVos(false);
    /*
      Klikt het kind door terwijl de sleutel nog onderweg is, dan telt hij hier
      alsnog mee. De sleutel stond op dat moment allang in de database; dit
      gaat alleen over het getal in de teller, dat anders een keer zou
      overslaan.
    */
    landing.current.geland = true;
    telOpAlsAllesKlaarIs();
    setHintOpen(false);
    setUitlegOpen(false);
    setUitlegWeggeklikt(false);
    setPatroon(null);
    setStart(nuInMs());
  }

  if (klaar) {
    return (
      <Uitslag
        vragen={serie}
        antwoorden={gelogd}
        aandachtVooraf={new Set(aandachtVooraf)}
        terugHref={terugHref}
        terugLabel={terugLabel}
        herhaalHref={herhaalHref}
      />
    );
  }

  const magControleren = antwoord.trim() !== "" && fase === "bezig";

  /*
    De bolletjes in de balk: één per vraag van deze sessie.

    `gelogd` staat in dezelfde volgorde als de vragen — er wordt per vraag
    precies één antwoord bijgeschreven en er wordt nooit teruggesprongen — dus
    de index in die lijst is ook de index van de vraag.
  */
  const bolstanden: Bolstand[] = serie.map((_, i) => {
    const gedaan = gelogd[i];
    if (gedaan) return gedaan.goed ? "goed" : "fout";
    return i === index ? "nu" : "open";
  });

  /*
    Bij elke fout is er een "waarom". Is er een denkfout herkend, dan die.
    Anders de "zo los je het op"-uitleg van het type. Heeft een handgemaakte
    vraag een eigen uitleg uit het beheer, dan gaat die voor.
  */
  const som = vraag.somgegevens;

  const zachteZin = patroon
    ? patroon.kindtekst[leeftijd]
    : vraag.uitleg
      ? vraag.uitleg
      : generator && som
        ? generator.aanpak.zin(som)[leeftijd]
        : ZONDER_GEGEVENS[leeftijd];

  /*
    De uitleg-animatie, als die er voor deze groepsvorm al is. Zo niet, dan
    valt hij terug op de stappenlijst — het kind ziet dus altijd iets.
  */
  /*
    De vorm die dit kind krijgt. Heeft het leerdoel een eigen vorm ingesteld,
    dan die; anders die van de groep zelf.

    `leesGroepsvorm` vangt de oude blokwaarden op ("34", "56", "78") van
    leerdoelen die sinds de overgang naar losse groepen niet opnieuw zijn
    opgeslagen. Die leveren dezelfde uitleg als voorheen.
  */
  const groepsvorm = leesGroepsvorm(vraag.uitlegvorm) ?? vormBijGroep(groep);
  const animatie =
    generator && som
      ? generator.uitleganimatie.script(
          som,
          groepsvorm,
          generator.uitleganimatie.standaardStrategie(groepsvorm),
        )
      : null;

  // "Laat het me zien" bestaat altijd zodra we weten hoe de som in elkaar zit.
  const uitlegStappen: Uitlegstap[] | null = som
    ? patroon
      ? patroon.uitleg(som)
      : (generator?.aanpak.stappen(som) ?? null)
    : null;

  // Het goede antwoord nooit kaal, maar met de controle erbij.
  const antwoordZin =
    generator && som
      ? generator.aanpak.controle(som)
      : `Het goede antwoord is ${goedeAntwoordInTekst(vraag)}.`;

  /*
    Heeft deze vraag een beeld dat bovenaan hoort? Een geüploade afbeelding of
    een getekende figuur. Bij een figuur waar je in typt telt hij ook mee: die
    is dan het beeld én het invoerveld.
  */
  /*
    Alleen een vak om het beeld als er ook echt iets in komt. Een figuur dat
    hier niet getekend wordt — bij "Tellen en slepen" staan de figuren bij hun
    eigen antwoordvakje — gaf anders een leeg afgerond balkje boven de vraag.
  */
  const heeftBeeld = Boolean(
    vraag.afbeelding ||
      (vraag.figuur && (invulbaar || figuurIsTekenbaar(vraag.figuur))),
  );

  /*
    De opgeslagen vraagtekst is leidend. Hij wordt bij het genereren bepaald uit
    het sjabloon: de standaardzin van het type, of wat de beheerder daarvan
    heeft gemaakt, in de woorden die bij de groep van dat sjabloon passen.

    Bewust niet hier nog eens overschrijven: dan zou een beheerder een zin
    kunnen invullen die het kind vervolgens niet te zien krijgt.
  */
  const vraagtekst = vraag.vraagtekst;

  return (
    <>
      {/*
        Het feestscherm legt zich over de vraag heen zodra het antwoord goed is.
        `key` per feestje, zodat elk goed antwoord een eigen, opnieuw beginnende
        animatie krijgt in plaats van dat de tweede de eerste overneemt.
      */}
      {fase === "goed" && !wachtOpVos && (
        <Feestscherm
          key={`feest-${feestje}`}
          onAfgelopen={volgende}
          onGeland={() => {
            landing.current.geland = true;
            telOpAlsAllesKlaarIs();
          }}
        />
      )}

      <Oefenbalk
        terugHref={terugHref}
        standen={bolstanden}
        index={index}
        beginsaldo={beginsaldo}
      />

      {/*
        Eén rustig wit vlak met ruime marges. Daarin staat alleen waar het om
        gaat: de vraag, de tekening en het antwoord. Geen leerdoelnaam, geen
        kruimelpad — dat hoort bij kiezen wát je gaat oefenen, niet bij het
        oefenen zelf.
      */}
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/*
          Onderaan blijft een strook vrij zodra er een mascotte bij hoort.

          Vos hoort binnen dit witte vlak te blijven — daarbuiten valt hij weg
          achter de balk van het besturingssysteem — maar hij mag ook geen knop
          bedekken. Een strook die alleen voor hem is, lost allebei op: hij
          staat erin, en de antwoordknoppen houden hun eigen ruimte.

          De maat staat er bij elke breedte apart bij (`sm:` en `lg:`), want
          `sm:p-8` en `lg:p-10` zetten ook de onderkant. Zonder die twee valt de
          strook op een grotere breedte weg en staat Vos alsnog over de knop
          Controleer heen.
        */}
        <div
          className={`relative rounded-groot border border-rand bg-kaart p-5 shadow-op sm:p-8 lg:p-10 ${
            metMascotte ? "pb-32 sm:pb-32 lg:pb-32" : ""
          }`}
        >
          {/*
            De geluidsknop van de opgave zelf, rechtsboven in de hoek.

            Precies hetzelfde knopje als in het uitlegfilmpje, zodat een kind
            hem herkent. Hij regelt alleen de geluidjes tijdens het maken; de
            knop in het filmpje blijft over de stem daar gaan. De keuze wordt
            op dit apparaat onthouden, ook voor de volgende keer.
          */}
          <button
            type="button"
            onClick={() => zetOpgavegeluid(!opgavegeluid)}
            aria-pressed={opgavegeluid}
            aria-label={opgavegeluid ? "Geluid aan" : "Geluid uit"}
            title={opgavegeluid ? "Geluid aan" : "Geluid uit"}
            className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-white/80 text-inkt-zacht transition hover:text-huisstijl sm:right-4 sm:top-4"
          >
            {opgavegeluid ? (
              <Luidspreker className="size-6" />
            ) : (
              <LuidsprekerUit className="size-6" />
            )}
          </button>

          {/*
            Vaste opbouw bij elke vraag met een tekening: eerst het beeld, groot
            en gecentreerd, dan pas de vraag en het antwoord. Onder elkaar, nooit
            in kolommen.

            Waarom: bij dit soort vragen zit de vraag ín het plaatje. Een kind
            dat eerst een regel tekst moet lezen om daarna een klein plaatje
            ernaast te zoeken, leest twee keer. Het beeld is hier het onderwerp;
            de tekst zegt alleen wat je ermee moet.

            Dit geldt voor élke getekende figuur — kralenrek, splitsboom, en de
            klok, breuken en getallenlijn die er later bij komen — en ook voor
            een geüploade afbeelding bij een vraag.

            Bij een tekening waar het antwoord ín getypt wordt (de splitsboom)
            hoort het invoerveld bij het beeld. Die staat daarom als één geheel
            bovenaan, met de vraag eronder.
          */}
          <div className="mt-4 flex flex-col gap-5">
            {heeftBeeld && (
              /*
                Het plaatjesraster en de blokken krijgen géén kader eromheen:
                die hebben hun eigen vak, met een eigen rand. Twee kaders om elkaar heen
                maakt onduidelijk wat er nu bij elkaar hoort — en juist dat moet
                bij dit type glashelder zijn, want alles binnen het vak telt mee.
              */
              <div
                className={
                  vraag.figuur?.soort === "plaatjesraster" ||
                  vraag.figuur?.soort === "mabblokken" ||
                  vraag.figuur?.soort === "huizenrij"
                    ? "mx-auto w-full max-w-[30rem]"
                    : "mx-auto w-full max-w-[30rem] rounded-groot border border-rand bg-room/50 p-4 sm:p-5"
                }
              >
                {invulbaar && vraag.figuur ? (
                  <Antwoordvelden
                    vraag={vraag}
                    antwoord={antwoord}
                    fase={fase}
                    markeer={kortFeedback}
                    gevangen={gevangen}
                    invulbaar={invulbaar}
                    onKies={kies}
                    onBevestig={() => {
                      if (magControleren) controleer();
                    }}
                    onSprongKlaar={() => setWachtOpVos(false)}
                  />
                ) : vraag.afbeelding ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/vragen/${vraag.afbeelding}`}
                    alt=""
                    className="mx-auto h-auto w-full rounded-xl object-contain"
                  />
                ) : vraag.figuur?.soort === "plaatjesraster" ? (
                  /*
                    Niet via `Figuurtekening` maar hier, want dit raster moet de
                    fase weten: Vos vangt de plaatjes op, wacht, en wipt op als
                    het antwoord goed is. Die fase kent alleen de speler.
                  */
                  <Plaatjesraster
                    /*
                      Een eigen sleutel per vraag, zodat het raster bij elke
                      nieuwe vraag opnieuw begint. Zonder dit bleef de stand van
                      de vórige vraag hangen: die was net "ophalen", dus vlogen
                      de plaatjes van de nieuwe vraag meteen weer weg en bleef
                      het vak leeg.
                    */
                    key={vraag.id}
                    aantal={vraag.figuur.aantal}
                    plaatje={vraag.figuur.plaatje}
                    afbeelding={vraag.figuur.afbeelding}
                    perRij={vraag.figuur.perRij}
                    groepsruimte={vraag.figuur.groepsruimte}
                    vos={vraag.figuur.vos}
                    fase={fase}
                    antwoordGekozen={antwoord !== ""}
                    onKlaar={() => setWachtOpVos(false)}
                  />
                ) : vraag.figuur?.soort === "huizenrij" ? (
                  /*
                    De straat hoort niet in `Figuurtekening` thuis: hij moet
                    weten of het antwoord goed was, want dan loopt Vos naar het
                    buurhuis en gaat de deur open.
                  */
                  <Huizenrij
                    key={vraag.id}
                    huizen={vraag.figuur.huizen}
                    gevraagd={vraag.figuur.gevraagd}
                    vos={vraag.figuur.vos}
                    fase={fase}
                  />
                ) : vraag.figuur?.soort === "mabblokken" ? (
                  /*
                    Ook dit vak hoort niet in `Figuurtekening` thuis: bij de
                    stand waarin Vos de staven bouwt, moet het weten wanneer het
                    kind aan de beurt is — en dat weet alleen de speler.
                  */
                  <Blokkenvak
                    /*
                      Een eigen sleutel per vraag, zodat het vak bij elke nieuwe
                      vraag opnieuw begint in plaats van de stand van de vorige
                      vast te houden.
                    */
                    key={vraag.id}
                    tientallen={vraag.figuur.tientallen}
                    eenheden={vraag.figuur.eenheden}
                    stand={vraag.figuur.stand as Blokkenstand}
                    vos={vraag.figuur.vos}
                  />
                ) : (
                  vraag.figuur && <Figuurtekening figuur={vraag.figuur} />
                )}
              </div>
            )}

            {/*
              Groep 3-4 krijgt de kortste zin én de grootste letters. Hoe minder
              woorden er staan, hoe groter ze mogen zijn.
            */}
            {/*
              Altijd gecentreerd, ook zonder tekening: in de focusstand staan de
              tekening, het antwoordvak en de knop al op één middellijn. Een
              vraag die daar links van begint, staat scheef in het vlak.
            */}
            <h1
              className={`text-center font-extrabold leading-snug ${
                leeftijd === "34" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              }`}
            >
              {vraagtekst}
            </h1>

            {!invulbaar && (
              <Antwoordvelden
                vraag={vraag}
                antwoord={antwoord}
                fase={fase}
                markeer={kortFeedback}
                gevangen={gevangen}
                invulbaar={invulbaar}
                onKies={kies}
                onBevestig={() => {
                  if (magControleren) controleer();
                }}
                onSprongKlaar={() => setWachtOpVos(false)}
              />
            )}
          </div>

          {/* Hint vragen mag altijd, ook vooraf. */}
          {fase === "bezig" && hinttekst && (
            <div className="mt-4">
              {hintOpen ? (
                <p className="rounded-2xl bg-amber-zacht px-4 py-3 text-sm font-semibold text-inkt-zacht">
                  <span className="font-extrabold text-oranje-diep">Tip van Vos: </span>
                  {hinttekst}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setHintOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-inkt-zacht underline-offset-2 transition hover:text-huisstijl hover:underline"
                >
                  <Icoon naam="gloeilamp" className="size-4" />
                  Ik wil een tip
                </button>
              )}
            </div>
          )}

          {/*
            Bij een goed antwoord staat hier niets meer. Het feestscherm ligt er
            dan overheen en zegt het al; een regel tekst eronder zou toch nooit
            gelezen worden. Het antwoord zelf blijft wel groen gemarkeerd.
          */}

          {/*
            Bij een fout antwoord: groep 3-4 krijgt alleen kleur en de animatie,
            groep 5 en hoger de tekstuele opbouw (zachte zin, "Laat het me
            zien", en het goede antwoord met de controle erbij).
          */}
          {fase === "fout" && kortFeedback && (
            <>
              {/*
                Het eigen antwoord staat hierboven al rood. Bij een open vraag
                is het goede antwoord nog nergens te zien; dat komt hier in het
                groen, als getal en zonder zin eromheen. Bij meerkeuze en
                waar/niet-waar staat het goede antwoord al groen tussen de
                keuzes, dus dan hoeft dit niet.
              */}
              {vraag.vorm === "open" && (
                <div className="mt-4 flex justify-center">
                  <GoedAntwoordvak vraag={vraag} />
                </div>
              )}

              {/* De animatie hoort erbij en staat er meteen; geen knop. */}
              {(animatie || uitlegStappen) && !uitlegWeggeklikt && (
                <Uitlegweergave
                  vorm={groepsvorm}
                  script={animatie}
                  terugval={uitlegStappen ?? undefined}
                  onSluit={() => setUitlegWeggeklikt(true)}
                  /*
                    De afbeelding van de vraag gaat mee naar de uitleg, zodat
                    het kind daar hetzelfde plaatje terugziet: de vos op de
                    stenen, of de plaatjes die het net heeft zitten tellen. In
                    de somgegevens passen alleen getallen, dus de bestandsnaam
                    kan alleen langs deze weg.
                  */
                  mascotte={
                    vraag.figuur?.soort === "stapstenen"
                      ? vraag.figuur.mascotte
                      : vraag.figuur?.soort === "plaatjesraster"
                        ? vraag.figuur.afbeelding
                        : null
                  }
                  telplaatje={
                    vraag.figuur?.soort === "plaatjesraster"
                      ? vraag.figuur.plaatje
                      : vraag.figuur?.soort === "vakken"
                        ? vraag.figuur.plaatje
                        : null
                  }
                  vakmateriaal={
                    vraag.figuur?.soort === "vakken" ? vraag.figuur.materiaal : null
                  }
                  vakperRij={vraag.figuur?.soort === "vakken" ? vraag.figuur.perRij : null}
                />
              )}
            </>
          )}

          {fase === "fout" && !kortFeedback && (
            <>
              <div className="mt-5 rounded-2xl bg-amber-zacht px-4 py-3.5">
                <p className="text-base font-extrabold text-oranje-diep">
                  {patroon ? "" : ALGEMENE_OPENING[leeftijd]}
                </p>
                <p
                  className={`text-base font-extrabold text-oranje-diep ${patroon ? "" : "mt-1 text-sm font-semibold text-inkt-zacht"}`}
                >
                  {zachteZin}
                </p>
                {hinttekst && (
                  <p className="mt-1.5 text-sm font-semibold text-inkt-zacht">
                    <span className="font-extrabold text-oranje-diep">Tip: </span>
                    {hinttekst}
                  </p>
                )}
              </div>

              {vraag.uitlegAfbeelding && (
                <div className="mt-3 w-full max-w-[18rem] rounded-2xl border border-rand bg-room/50 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/vragen/${vraag.uitlegAfbeelding}`}
                    alt=""
                    className="h-auto w-full rounded-xl object-contain"
                  />
                </div>
              )}

              {(animatie || uitlegStappen) &&
                (uitlegOpen ? (
                  <Uitlegweergave
                    vorm={groepsvorm}
                    script={animatie}
                    terugval={uitlegStappen ?? undefined}
                    onSluit={() => setUitlegOpen(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setUitlegOpen(true)}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-lucht px-5 py-2.5 text-sm font-extrabold text-lucht transition hover:bg-lucht-zacht"
                  >
                    <Icoon naam="gloeilamp" className="size-4" />
                    Laat het me zien
                  </button>
                ))}

              <p className="mt-4 rounded-2xl bg-lucht-zacht px-4 py-3 text-sm font-bold text-lucht">
                {antwoordZin}
              </p>
            </>
          )}

          {rustBericht && !kortFeedback && (
            <p className="mt-4 rounded-2xl bg-lucht-zacht px-4 py-3 text-sm font-bold text-lucht">
              {rustBericht}
            </p>
          )}

          {/*
            Gecentreerd, net als de tekening, de vraag en het antwoordvak
            erboven. In de focusstand loopt alles over één middellijn.
          */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/*
              Geen knop bij de vraagtypes waar je uit vakken kiest: daar wordt
              de tik zelf nagekeken, een halve tel later.
            */}
            {fase === "bezig" && !kiestUitVakken && (
              <button
                type="button"
                onClick={() => controleer()}
                disabled={!magControleren}
                className="inline-flex items-center gap-2 rounded-full bg-huisstijl-diep px-6 py-3 text-base font-extrabold text-white transition hover:bg-huisstijl-donker disabled:cursor-not-allowed disabled:opacity-45"
              >
                Controleer
              </button>
            )}

            {/*
              Alleen bij een FOUT antwoord een knop. Dan bepaalt het kind zelf
              hoe lang het naar de rode en groene markering en naar de uitleg
              kijkt. Na een goed antwoord gaat het scherm vanzelf door zodra
              het feestscherm is afgelopen; daar valt niets te lezen.
            */}
            {fase === "fout" && (
              <button
                type="button"
                onClick={volgende}
                className="inline-flex items-center gap-2 rounded-full bg-groen px-6 py-3 text-base font-extrabold text-white transition hover:bg-groen-diep"
              >
                {index + 1 >= serie.length ? "Bekijk je uitslag" : "Volgende vraag"}
                <Icoon naam="pijl" className="size-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------

/**
 * Het juiste antwoord in het groen, naast of onder het foute antwoord.
 *
 * Even groot als het invoerveld erboven, zodat de twee als een paar lezen:
 * dit tikte je, en dit was het. Geen zin eromheen — op deze leeftijd doet de
 * kleur het werk.
 */
function GoedAntwoordvak({ vraag }: { vraag: OefenVraag }) {
  const tekst = goedeAntwoordInTekst(vraag);
  const cijfers = kortGetalLengte([tekst]);

  if (cijfers === null) {
    // Geen kort getal: dan maar gewoon een regel, die mag wel breed zijn.
    return (
      <p className="flex items-center gap-2.5 rounded-2xl border-2 border-groen bg-groen-zacht px-4 py-3 text-2xl font-extrabold text-groen-diep">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-groen text-white">
          <Icoon naam="vinkje" className="size-5" />
        </span>
        {tekst}
      </p>
    );
  }

  const maat = vakmaat(cijfers);
  return (
    <div
      className={`${maat.doos} flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-groen bg-groen-zacht`}
    >
      <span className="grid size-6 place-items-center rounded-full bg-groen text-white">
        <Icoon naam="vinkje" className="size-4" />
      </span>
      <span className={`${maat.tekst} font-extrabold leading-none text-groen-diep`}>
        {tekst}
      </span>
    </div>
  );
}

function Antwoordvelden({
  vraag,
  antwoord,
  fase,
  markeer,
  gevangen = 0,
  invulbaar,
  onKies,
  onBevestig,
  onSprongKlaar,
}: {
  vraag: OefenVraag;
  antwoord: string;
  fase: Fase;
  /** Groep 3-4: fout rood, goed groen, zonder tekst eromheen. */
  markeer: boolean;
  /** Hoeveel er in deze ronde al goed zijn; de emmer bij het vissen vult zich ermee. */
  gevangen?: number;
  invulbaar: boolean;
  onKies: (v: string) => void;
  onBevestig: () => void;
  /** Alleen bij de stapstenen: de mascotte is aan de overkant. */
  onSprongKlaar?: () => void;
}) {
  const uit = fase !== "bezig";
  const toonKleur = markeer && fase === "fout";
  /*
    Bij een goed antwoord kleurt het antwoord zelf groen — voor elke groep, en
    bij elk vraagtype. Dat is het eerste wat een kind ziet, nog voor de
    confetti: "dit wat ik heb ingevuld, dat klopt".
  */
  const goedGemarkeerd = fase === "goed";

  if (vraag.vorm === "bosspel" && vraag.figuur?.soort === "bosspel") {
    return <BosSpel key={vraag.id} figuur={vraag.figuur} fase={fase} onWijzig={onKies} onBevestig={onBevestig} onKlaar={onSprongKlaar} />;
  }

  /*
    De vijver is zelf het antwoordveld: het kind tikt de vis aan die het
    bedoelt. Er komt dus geen rijtje knoppen onder de vraag — dat zou een
    tweede keer hetzelfde vragen.
  */
  /*
    De manden zijn zelf het antwoordveld: het kind tikt de mand aan die het
    bedoelt. Er komt dus geen rijtje knoppen onder de vraag.
  */
  /*
    De zaal is zelf het antwoordveld: het kind tikt de stoel aan. Twintig losse
    knoppen onder de vraag zou onleesbaar zijn, en het gaat er juist om dat het
    kind de plek in het veld vindt.
  */
  if (vraag.figuur?.soort === "bioscoop") {
    return (
      <Bioscoop
        aantal={vraag.figuur.aantal}
        perRij={vraag.figuur.perRij}
        zichtbaar={vraag.figuur.zichtbaar}
        gezocht={vraag.figuur.gezocht}
        gekozen={antwoord}
        fase={fase}
        markeer={markeer}
        vos={vraag.figuur.vos}
        onKies={onKies}
      />
    );
  }


  /*
    De vakken zijn zelf het antwoordveld: het kind tikt het vak aan dat het
    bedoelt. Er komt dus geen rijtje knoppen onder de vraag.
  */
  if (vraag.figuur?.soort === "vakken") {
    return (
      <Vakken
        vakken={vraag.figuur.vakken}
        soort={vraag.figuur.materiaal as "telplaatjes" | "kralen" | "blokken"}
        plaatje={vraag.figuur.plaatje}
        perRij={vraag.figuur.perRij}
        gevraagd={vraag.figuur.kaart}
        gekozen={antwoord}
        fase={fase}
        markeer={markeer}
        vos={vraag.figuur.vos}
        onKies={onKies}
      />
    );
  }

  if (vraag.figuur?.soort === "visvijver") {
    return (
      <Visvijver
        vissen={vraag.figuur.vissen}
        gekozen={antwoord}
        fase={fase}
        markeer={markeer}
        vos={vraag.figuur.vos}
        hengel={vraag.figuur.hengel}
        /*
          Welke vis het wél was, onder dezelfde voorwaarde als de kleuren bij de
          keuzeknoppen: alleen als er bij een fout antwoord getoond mag worden
          wat goed was. Het antwoord is de plek in de rij vissen.
        */
        goedeVis={toonKleur ? Number(vraag.antwoord) : null}
        gevangen={gevangen}
        /* Pas als de vis boven water hangt, mag het feestscherm eroverheen. */
        onKlaar={onSprongKlaar}
        onKies={onKies}
      />
    );
  }

  if (vraag.vorm === "meerkeuze") {
    return (
      <MeerkeuzeAntwoorden
        opties={vraag.opties ?? []}
        gekozen={antwoord}
        uitgeschakeld={uit}
        goedeWaarde={toonKleur ? vraag.antwoord : null}
        gekozenGoed={goedGemarkeerd}
        onKies={onKies}
      />
    );
  }

  /*
    De blokken als open vraag: het kind vult het getal zelf in, met het
    cijfertoetsenbord op het scherm.

    Hetzelfde toetsenbord als bij de stapstenen, om dezelfde reden: op een
    tablet zou het toetsenbord van het apparaat over de blokken heen schuiven,
    precies over wat het kind moet tellen. De knop Controleer blijft hier wél
    staan — het kind moet eerst klaar zijn met invullen.
  */
  if (
    vraag.vorm === "open" &&
    (vraag.figuur?.soort === "mabblokken" || vraag.figuur?.soort === "huizenrij")
  ) {
    return (
      <Cijferinvoer
        waarde={antwoord}
        fase={fase}
        markeer={markeer}
        onWijzig={onKies}
        onBevestig={onBevestig}
      />
    );
  }

  /*
    Stapstenen: het antwoord wordt op de stenen zelf ingevuld, dus is de
    tekening tegelijk het antwoordveld. Eén getal per lege steen, met komma's
    ertussen — net als bij het slepen, en zo kijkt `isGoed` het ook na.
  */
  if (vraag.vorm === "stapstenen" && vraag.figuur?.soort === "stapstenen") {
    const aantalLeeg = vraag.figuur.stenen.filter((w) => w === null).length;
    const delen = antwoord.split(",");
    const ingevuld = Array.from({ length: aantalLeeg }, (_, i) => delen[i] ?? "");
    const goede = vraag.antwoord.split(",").map(Number);

    return (
      <Stapstenen
        figuur={vraag.figuur}
        ingevuld={ingevuld}
        fase={fase}
        /*
          Ook bij een goed antwoord meegeven, niet alleen bij een fout.

          De tekening leidt hieruit af of het klopt, en kleurt groen of rood.
          Kreeg hij bij een goed antwoord `null`, dan las hij "geen gegevens" als
          "fout" en kleurde de steen rood terwijl het kind het juist goed had.
          Tijdens het invullen blijft het null: dan valt er nog niets te kleuren,
          en zou het goede antwoord af te lezen zijn uit de tekening.
        */
        goedeWaarden={fase === "bezig" ? null : goede}
        onSprongKlaar={onSprongKlaar}
        onWijzig={(nieuw: string[]) =>
          onKies(nieuw.every((w) => w === "") ? "" : nieuw.map((w) => w.trim()).join(","))
        }
      />
    );
  }

  /*
    Getallen slepen: de figuren met hun vakjes, plus de losse getallen. Het
    antwoord is één getal per figuur, met komma's ertussen — zo gaat het ook de
    database in, en zo kijkt `isGoed` het na.
  */
  /*
    De trein: dezelfde bediening als bij "Tellen en slepen", maar met wagons in
    plaats van losse vakjes. Het antwoord heeft dezelfde vorm — één getal per
    plek, met komma's ertussen — dus het nakijken en opslaan gaat hier
    hetzelfde als daar.
  */
  if (vraag.vorm === "sleepgetallen" && vraag.figuur?.soort === "trein") {
    const goede = vraag.antwoord.split(",").map(Number);
    const ingevuld = goede.map((_, i) => {
      const deel = antwoord.split(",")[i];
      return deel === undefined || deel === "" ? null : Number(deel);
    });

    return (
      <Trein
        wagons={vraag.figuur.wagons}
        ingevuld={ingevuld}
        fase={fase}
        /* Ook bij goed meegeven; zie de toelichting bij Stapstenen hieronder. */
        goedeWaarden={fase === "bezig" ? null : goede}
        vos={vraag.figuur.vos}
        onWijzig={(nieuw: (number | null)[]) =>
          onKies(nieuw.every((w) => w === null) ? "" : nieuw.map((w) => w ?? "").join(","))
        }
      />
    );
  }

  if (vraag.vorm === "sleepgetallen" && vraag.figuur?.soort === "telrij") {
    const keuzes = (vraag.opties ?? []).map((o) => Number(o.tekst)).filter(Number.isFinite);
    const goede = vraag.antwoord.split(",").map(Number);
    const ingevuld = vraag.figuur.items.map((_, i) => {
      const deel = antwoord.split(",")[i];
      return deel === undefined || deel === "" ? null : Number(deel);
    });

    return (
      <SleepGetallen
        figuur={vraag.figuur}
        keuzes={keuzes}
        ingevuld={ingevuld}
        fase={fase}
        /* Ook bij goed meegeven; zie de toelichting bij Stapstenen hierboven. */
        goedeWaarden={fase === "bezig" ? null : goede}
        onWijzig={(nieuw: (number | null)[]) =>
          onKies(nieuw.every((w) => w === null) ? "" : nieuw.map((w) => w ?? "").join(","))
        }
      />
    );
  }

  if (vraag.vorm === "waar_niet_waar") {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2">
        {[
          { waarde: "waar", label: "Waar" },
          { waarde: "niet_waar", label: "Niet waar" },
        ].map((o) => (
          <button
            key={o.waarde}
            type="button"
            disabled={uit}
            onClick={() => onKies(o.waarde)}
            className={`rounded-2xl border-2 px-4 py-4 text-lg font-extrabold transition disabled:cursor-not-allowed ${
              goedGemarkeerd && antwoord === o.waarde
                ? "border-groen bg-groen-zacht text-groen-diep"
                : toonKleur && o.waarde === vraag.antwoord
                  ? "border-groen bg-groen-zacht text-groen-diep"
                  : toonKleur && antwoord === o.waarde
                    ? "border-roze bg-roze-zacht text-roze"
                    : antwoord === o.waarde
                      ? "border-huisstijl bg-huisstijl-zacht text-huisstijl-diep"
                      : "border-rand bg-room/50 hover:border-huisstijl hover:bg-huisstijl-zacht/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  if (invulbaar && vraag.figuur) {
    return (
      <InvulFiguur
        figuur={vraag.figuur}
        waarde={antwoord}
        vraagId={vraag.id}
        label="Vul hier het getal in"
        fase={
          fase === "goed"
            ? "goed"
            : fase === "bezig"
              ? "bezig"
              : toonKleur
                ? "fout"
                : "bijna"
        }
        onWijzig={onKies}
        onBevestig={onBevestig}
      />
    );
  }

  /*
    Verwacht de vraag een kort getal, dan hoort daar een klein vierkant vakje
    bij en geen veld over de volle breedte. Bij alles wat langer kan zijn — een
    woord, een zin — blijft het brede veld staan.
  */
  const cijfers = kortGetalLengte(vraag.antwoord.split("|"));

  const kleur = goedGemarkeerd
    ? "border-groen bg-groen-zacht text-groen-diep"
    : toonKleur
      ? "border-roze bg-roze-zacht text-roze"
      : "border-rand bg-room/50";

  if (cijfers !== null) {
    const maat = vakmaat(cijfers);
    return (
      /*
        Geen labeltje boven het vak: een leeg invoervak onder een vraag spreekt
        voor zich, en op deze leeftijd wordt "Typ je antwoord" toch niet gelezen.

        De naam verdwijnt daarmee niet — hij staat als `aria-label`, zodat een
        voorleesprogramma blijft zeggen wat er van je gevraagd wordt. Zonder dat
        zou het vak daar als naamloos veld binnenkomen.
      */
      <div className="flex flex-col items-center">
        <input
          type="text"
          aria-label="Typ je antwoord"
          value={antwoord}
          disabled={uit}
          autoComplete="off"
          inputMode="numeric"
          /*
            Eén cijfer meer dan nodig. Zo kan een kind een tikfout maken en die
            zien staan, in plaats van dat het toetsenbord stil lijkt te vallen.
          */
          maxLength={cijfers + 1}
          onChange={(e) => onKies(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onBevestig();
            }
          }}
          className={`${maat.doos} ${maat.tekst} rounded-2xl border-2 text-center font-extrabold outline-none transition focus:border-huisstijl disabled:cursor-not-allowed ${kleur}`}
        />
      </div>
    );
  }

  return (
    <div className="block">
      <input
        type="text"
        aria-label="Typ je antwoord"
        value={antwoord}
        disabled={uit}
        autoComplete="off"
        onChange={(e) => onKies(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onBevestig();
          }
        }}
        className={`w-full rounded-2xl border-2 px-4 py-3.5 text-xl font-extrabold outline-none transition focus:border-huisstijl disabled:cursor-not-allowed ${kleur}`}
      />
    </div>
  );
}

/**
 * De antwoorden bij een meerkeuzevraag.
 *
 * Heeft minstens één antwoord een afbeelding, dan worden het kaarten met het
 * plaatje groot in beeld en de tekst eronder. Anders gewone tekstknoppen.
 */
function MeerkeuzeAntwoorden({
  opties,
  gekozen,
  uitgeschakeld,
  goedeWaarde = null,
  gekozenGoed = false,
  onKies,
}: {
  opties: AntwoordOptie[];
  gekozen: string;
  uitgeschakeld: boolean;
  /**
   * Het goede antwoord, om na een fout groep 3-4 in kleur te laten zien:
   * het gekozen antwoord rood, het goede groen. `null` = niets kleuren.
   */
  goedeWaarde?: string | null;
  /** Het kind had het goed: de gekozen knop groen. */
  gekozenGoed?: boolean;
  onKies: (waarde: string) => void;
}) {
  const metPlaatjes = opties.some((o) => o.afbeelding);

  const omlijsting = (waarde: string) => {
    if (gekozenGoed) {
      return waarde === gekozen
        ? "border-groen bg-groen-zacht text-groen-diep"
        : "border-rand bg-room/50 opacity-60";
    }
    if (goedeWaarde !== null) {
      if (waarde === goedeWaarde) return "border-groen bg-groen-zacht text-groen-diep";
      if (waarde === gekozen) return "border-roze bg-roze-zacht text-roze";
      return "border-rand bg-room/50 opacity-60";
    }
    return waarde === gekozen
      ? "border-huisstijl bg-huisstijl-zacht text-huisstijl-diep"
      : "border-rand bg-room/50 hover:border-huisstijl hover:bg-huisstijl-zacht/50";
  };

  if (!metPlaatjes) {
    /*
      Zijn alle keuzes korte getallen, dan worden het kleine vierkante vakjes
      op een rij in het midden — net als het invoerveld bij een open vraag.
      Knoppen van een halve schermbreedte voor het antwoord "7" zeggen iets
      anders dan er te kiezen valt.

      Staat er tekst in de keuzes, dan blijft de brede opzet staan: daar moet
      een zin in passen.
    */
    const cijfers = kortGetalLengte(opties.map((o) => o.tekst));

    if (cijfers !== null) {
      const maat = vakmaat(cijfers);
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {opties.map((optie, i) => (
            <button
              key={i}
              type="button"
              disabled={uitgeschakeld}
              onClick={() => onKies(String(i))}
              className={`${maat.doos} ${maat.tekst} rounded-2xl border-2 text-center font-extrabold transition disabled:cursor-not-allowed ${omlijsting(String(i))}`}
            >
              {optie.tekst}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-2.5 sm:grid-cols-2">
        {opties.map((optie, i) => (
          <button
            key={i}
            type="button"
            disabled={uitgeschakeld}
            onClick={() => onKies(String(i))}
            className={`rounded-2xl border-2 px-4 py-3.5 text-left text-lg font-extrabold transition disabled:cursor-not-allowed ${omlijsting(String(i))}`}
          >
            {optie.tekst}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {opties.map((optie, i) => (
        <button
          key={i}
          type="button"
          disabled={uitgeschakeld}
          onClick={() => onKies(String(i))}
          aria-label={optie.tekst || `Antwoord ${i + 1}`}
          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition disabled:cursor-not-allowed ${omlijsting(String(i))}`}
        >
          {optie.afbeelding ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`/vragen/${optie.afbeelding}`}
              alt=""
              className="aspect-square w-full rounded-xl bg-kaart object-contain p-1.5"
            />
          ) : (
            <span className="grid aspect-square w-full place-items-center rounded-xl bg-kaart text-2xl font-extrabold">
              {optie.tekst}
            </span>
          )}
          {optie.afbeelding && optie.tekst && (
            <span className="text-sm font-extrabold leading-tight">{optie.tekst}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Het eindscherm
// ---------------------------------------------------------------------------

function Uitslag({
  vragen,
  antwoorden,
  aandachtVooraf,
  terugHref,
  terugLabel,
  herhaalHref,
}: {
  vragen: OefenVraag[];
  antwoorden: RondeAntwoord[];
  aandachtVooraf: Set<string>;
  terugHref: string;
  terugLabel: string;
  herhaalHref: string;
}) {
  const [lastigGemeld, setLastigGemeld] = useState<string[]>([]);

  // Per vaardigheid (leerdoel) tellen, niet per vraag.
  const perLeerdoel = new Map<string, { titel: string; goed: number; totaal: number }>();
  for (const a of antwoorden) {
    const titel = vragen.find((v) => v.leerdoelId === a.leerdoelId)?.leerdoelTitel ?? "Onbekend";
    const huidig = perLeerdoel.get(a.leerdoelId) ?? {
      titel,
      goed: 0,
      totaal: 0,
    };
    huidig.totaal += 1;
    if (a.goed) huidig.goed += 1;
    perLeerdoel.set(a.leerdoelId, huidig);
  }

  const regels = [...perLeerdoel.entries()].map(([id, r]) => ({
    id,
    ...r,
    gaatGoed: r.totaal > 0 && r.goed / r.totaal >= 0.8,
  }));

  const lastig = regels.filter((r) => !r.gaatGoed);
  const comeback = regels.filter((r) => r.gaatGoed && aandachtVooraf.has(r.id));
  const totaalGoed = antwoorden.filter((a) => a.goed).length;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="rounded-groot border border-rand bg-kaart p-8 text-center shadow-op">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-groen-zacht text-groen">
          <Icoon naam="ster" className="size-9" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">Goed gedaan! 🎉</h1>
        <p className="mt-1 text-base font-bold">
          Je hebt {antwoorden.length} {antwoorden.length === 1 ? "vraag" : "vragen"} gemaakt,{" "}
          {totaalGoed} goed.
        </p>

        <ul className="mt-5 flex flex-col gap-2 text-left">
          {regels.map((r) => (
            <li
              key={r.id}
              className={`flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3 ${
                r.gaatGoed ? "bg-groen-zacht" : "bg-amber-zacht"
              }`}
            >
              <span aria-hidden="true">{r.gaatGoed ? "✅" : "🟡"}</span>
              <span className="min-w-0 flex-1 text-sm font-extrabold">
                {r.titel}
                <span className="ml-1.5 font-bold text-inkt-zacht">
                  — {r.gaatGoed ? "gaat goed" : "nog even oefenen"}
                </span>
              </span>

              {!lastigGemeld.includes(r.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    setLastigGemeld((l) => [...l, r.id]);
                    void meldLastig(r.id);
                  }}
                  className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[0.68rem] font-bold text-inkt-zacht transition hover:text-huisstijl"
                >
                  Dit snapte ik niet
                </button>
              ) : (
                <span className="shrink-0 text-[0.68rem] font-bold text-inkt-zacht">
                  Genoteerd — dit komt terug
                </span>
              )}
            </li>
          ))}
        </ul>

        {comeback.length > 0 && (
          <div className="mt-4 rounded-2xl border-2 border-groen/30 bg-groen-zacht px-4 py-3.5 text-left">
            <p className="text-base font-extrabold text-groen-diep">
              Je hebt {comeback[0].titel.toLowerCase()} gefikst! 🦊
            </p>
            <p className="mt-0.5 text-sm font-semibold text-inkt-zacht">
              Dit ging eerst nog niet, en nu wel. Vos is trots op je — je krijgt er een edelsteen
              bij.
            </p>
          </div>
        )}

        {lastig.length > 0 && (
          <>
            <Link
              /*
                Het leerdoel zit al in `herhaalHref`, dus `herhaal=1` komt er met
                een & achter. Zonder die controle werd het een tweede vraagteken
                en raakte het leerdoel kwijt — dan kreeg het kind bij "Oefen wat
                nog lastig was" ineens sommen van een ander leerdoel.
              */
              href={`${herhaalHref}${herhaalHref.includes("?") ? "&" : "?"}herhaal=1`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-huisstijl-diep px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-huisstijl-donker"
            >
              🔄 Oefen wat nog lastig was
            </Link>
            <p className="mt-2 text-sm font-semibold text-inkt-zacht">
              Morgen komen er een paar sommen van {lastig[0].titel.toLowerCase()} terug, om te
              kijken of het blijft hangen.
            </p>
          </>
        )}

        <Link
          href={terugHref}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border-2 border-rand px-6 py-2.5 text-sm font-extrabold transition hover:border-huisstijl hover:text-huisstijl"
        >
          Terug naar {terugLabel}
        </Link>
      </div>
    </div>
  );
}
