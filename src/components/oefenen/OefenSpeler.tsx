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
import { useRef, useState } from "react";
import { beloonGoedAntwoord, bewaarRonde, meldLastig } from "@/app/oefenacties";
import { Icoon } from "@/components/kind/Icoon";
import { Feestscherm } from "@/components/oefenen/Feestscherm";
import { Oefenbalk, type Bolstand } from "@/components/oefenen/Oefenbalk";
import { Figuurtekening, beschrijfFiguur } from "@/components/oefenen/Figuurtekening";
import { InvulFiguur } from "@/components/oefenen/InvulFiguur";
import { Uitlegweergave } from "@/components/oefenen/Uitlegweergave";
import { leesGroepsvorm, vormBijGroep } from "@/lib/generatoren/uitlegscript";
import { goedeAntwoordInTekst, isGoed, kortGetalLengte } from "@/lib/antwoord";
import { feestje as feestgeluid, geluidStaatAan } from "@/lib/geluid";
import { nuInMs } from "@/lib/klok";
import { zetSaldo } from "@/lib/sleutelwinkel";
import { zoekGenerator } from "@/lib/generatoren";
import {
  ALGEMENE_OPENING,
  ZONDER_GEGEVENS,
  herkenFout,
  leeftijdsgroepVan,
  type Foutpatroon,
  type Uitlegstap,
} from "@/lib/generatoren/foutpatroon";
import type { RondeAntwoord } from "@/app/oefenacties";
import { type AntwoordOptie, type OefenVraag } from "@/lib/vraagtypes";

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

// ---------------------------------------------------------------------------

export function OefenSpeler({
  vragen,
  terugHref,
  terugLabel,
  groep,
  aandachtVooraf,
  herhaalHref,
  beginsaldo,
}: {
  vragen: OefenVraag[];
  terugHref: string;
  terugLabel: string;
  groep: number;
  /** Leerdoelen die vóór deze ronde al aandacht vroegen. */
  aandachtVooraf: string[];
  /** Waar de knop "Oefen wat nog lastig was" naartoe gaat. */
  herhaalHref: string;
  /** Het sleutelsaldo bij het openen; de teller in de balk telt vanaf hier. */
  beginsaldo: number;
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

  const [index, setIndex] = useState(0);
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
  const rondeId = useRef("");
  const [klaar, setKlaar] = useState(false);
  const [gelogd, setGelogd] = useState<RondeAntwoord[]>([]);
  const [snelFout, setSnelFout] = useState(0);
  const [rustBericht, setRustBericht] = useState("");

  const vraag = vragen[index];
  const generator = vraag?.somgegevens ? zoekGenerator(vraag.somgegevens.soort) : null;

  const invulbaar =
    vraag?.vorm === "open" &&
    vraag.figuur !== null &&
    beschrijfFiguur(vraag.figuur).invulvak !== null;

  // De hint van de vraag zelf, of anders die van het herkende patroon.
  const hinttekst = vraag?.hint ?? patroon?.hint ?? null;

  function controleer() {
    if (antwoord.trim() === "") return;

    const seconden = (nuInMs() - start) / 1000;
    const goed = isGoed(vraag, antwoord);

    if (goed) {
      setFase("goed");
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
        ? herkenFout(generator.foutpatronen, vraag.somgegevens, antwoord)
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
   * Het feestje bij een goed antwoord: geluid, sleutel, teller.
   *
   * De confetti zit hier niet bij: die hangt aan `feestje` en start vanzelf.
   *
   * Volgorde is bewust. Eerst het geluidje, want dat hoort bij het moment van
   * "goed". Dan de sleutel op weg, gemeten vanaf het antwoord dat het kind net
   * heeft ingevuld. En pas als die aankomt, gaat de teller omhoog.
   *
   * Het bijschrijven in de database gaat meteen mee — niet pas aan het eind van
   * de ronde. Wat het kind ziet gebeuren, staat op dat moment ook echt vast.
   */
  function vierGoedAntwoord() {
    if (geluidStaatAan()) feestgeluid();

    if (rondeId.current === "") rondeId.current = crypto.randomUUID();
    const bron = `${rondeId.current}:${vraag.id}`;

    landing.current = { geland: false, saldo: null };

    void beloonGoedAntwoord(bron).then((uitslag) => {
      landing.current.saldo = uitslag.saldo;
      telOpAlsAllesKlaarIs();
    });
  }

  function leg(
    deel: Omit<
      RondeAntwoord,
      "leerdoelId" | "vraagId" | "hintGebruikt" | "uitlegGebruikt" | "beloningsbron"
    >,
  ) {
    setGelogd((lijst) => [
      ...lijst,
      {
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
        beloningsbron: `${rondeId.current}:${vraag.id}`,
      },
    ]);
  }

  function volgende() {
    // Vermoeidheid: veel fouten tegen het eind van de ronde.
    const laatste = [...gelogd].slice(-4);
    const veelFout = laatste.length === 4 && laatste.filter((a) => !a.goed).length >= 3;
    if (veelFout && index >= 6) {
      setRustBericht("Goed gewerkt! Je hebt al veel gedaan. Morgen verder?");
    }

    if (index + 1 >= vragen.length) {
      void bewaarRonde(gelogd);
      setKlaar(true);
      return;
    }

    setIndex(index + 1);
    setAntwoord("");
    setFase("bezig");
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
        vragen={vragen}
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
  const bolstanden: Bolstand[] = vragen.map((_, i) => {
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
  const heeftBeeld = Boolean(vraag.afbeelding || vraag.figuur);

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
      {fase === "goed" && (
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
        <div className="rounded-groot border border-rand bg-kaart p-5 shadow-op sm:p-8 lg:p-10">

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
              <div className="mx-auto w-full max-w-[30rem] rounded-groot border border-rand bg-room/50 p-4 sm:p-5">
                {invulbaar && vraag.figuur ? (
                  <Antwoordvelden
                    vraag={vraag}
                    antwoord={antwoord}
                    fase={fase}
                    markeer={kortFeedback}
                    invulbaar={invulbaar}
                    onKies={setAntwoord}
                    onBevestig={() => {
                      if (magControleren) controleer();
                    }}
                  />
                ) : vraag.afbeelding ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/vragen/${vraag.afbeelding}`}
                    alt=""
                    className="mx-auto h-auto w-full rounded-xl object-contain"
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
                invulbaar={invulbaar}
                onKies={setAntwoord}
                onBevestig={() => {
                  if (magControleren) controleer();
                }}
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
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-inkt-zacht underline-offset-2 transition hover:text-viool hover:underline"
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
            {fase === "bezig" && (
              <button
                type="button"
                onClick={controleer}
                disabled={!magControleren}
                className="inline-flex items-center gap-2 rounded-full bg-viool px-6 py-3 text-base font-extrabold text-white transition hover:bg-viool-diep disabled:cursor-not-allowed disabled:opacity-45"
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
                {index + 1 >= vragen.length ? "Bekijk je uitslag" : "Volgende vraag"}
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
  invulbaar,
  onKies,
  onBevestig,
}: {
  vraag: OefenVraag;
  antwoord: string;
  fase: Fase;
  /** Groep 3-4: fout rood, goed groen, zonder tekst eromheen. */
  markeer: boolean;
  invulbaar: boolean;
  onKies: (v: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";
  const toonKleur = markeer && fase === "fout";
  /*
    Bij een goed antwoord kleurt het antwoord zelf groen — voor elke groep, en
    bij elk vraagtype. Dat is het eerste wat een kind ziet, nog voor de
    confetti: "dit wat ik heb ingevuld, dat klopt".
  */
  const goedGemarkeerd = fase === "goed";

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
                      ? "border-viool bg-viool-zacht text-viool-diep"
                      : "border-rand bg-room/50 hover:border-viool hover:bg-viool-zacht/50"
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
          className={`${maat.doos} ${maat.tekst} rounded-2xl border-2 text-center font-extrabold outline-none transition focus:border-viool disabled:cursor-not-allowed ${kleur}`}
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
        className={`w-full rounded-2xl border-2 px-4 py-3.5 text-xl font-extrabold outline-none transition focus:border-viool disabled:cursor-not-allowed ${kleur}`}
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
      ? "border-viool bg-viool-zacht text-viool-diep"
      : "border-rand bg-room/50 hover:border-viool hover:bg-viool-zacht/50";
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
                  className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[0.68rem] font-bold text-inkt-zacht transition hover:text-viool"
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
              href={`${herhaalHref}?herhaal=1`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-viool px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-viool-diep"
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
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border-2 border-rand px-6 py-2.5 text-sm font-extrabold transition hover:border-viool hover:text-viool"
        >
          Terug naar {terugLabel}
        </Link>
      </div>
    </div>
  );
}
