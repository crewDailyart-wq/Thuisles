/**
 * De homepagina: de voordeur van Zappie voor wie via Google binnenkomt.
 *
 * Eén doel: laten zien dat dit geen standaard oefensite is. Zappie sluit aan
 * op de methode van de school van het kind, op de kerndoelen en op de
 * referentieniveaus van de doorstroomtoets, en is toegankelijk voor ieder kind.
 *
 * Een apparaat waarop al een kind gekozen is, gaat zoals vroeger meteen door
 * naar Zappie (keuze eigenaar, 13 oktober 2026). Ouders komen via Inloggen in
 * hun omgeving.
 */

import Image from "next/image";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import {
  IcoonDoel,
  IcoonDownload,
  IcoonFocus,
  IcoonHart,
  IcoonLezen,
  IcoonOor,
  IcoonPijl,
  IcoonSchool,
  IcoonSpeld,
  IcoonStreep,
  IcoonTaal,
  IcoonToets,
  IcoonToetsenbord,
  IcoonVink,
} from "@/components/site/Iconen";
import { MiniKaart } from "@/components/site/MiniKaart";
import { kindOpDitApparaat } from "@/lib/auth/sessie";
import { aantalZichtbareWerkbladen } from "@/lib/data/werkbladen";
import { MERKNAAM } from "@/lib/merk";
import { getal, niveautestBeschikbaar, scholenoverzicht } from "@/lib/site/inhoud";

async function stuurKindDoor() {
  let kind = false;
  try {
    kind = await kindOpDitApparaat();
  } catch (fout) {
    unstable_rethrow(fout);
  }
  if (kind) redirect("/zappie");
}

const METHODES: { vak: string; namen: string[] }[] = [
  { vak: "Rekenen", namen: ["Pluspunt", "Wereld in getallen", "Getal & Ruimte Junior", "Rekenrijk", "Reken Zeker"] },
  { vak: "Taal", namen: ["Taal actief", "Staal", "Taal in beeld", "Taalverhaal.nu"] },
  { vak: "Spelling", namen: ["Staal Spelling", "Spelling in beeld", "Taal actief Spelling"] },
  { vak: "Lezen", namen: ["Veilig leren lezen", "Lijn 3", "Estafette", "Atlantis"] },
];

const TOEGANKELIJK = [
  {
    titel: "Dyslexie",
    kleur: "#52d9ff",
    Icoon: IcoonLezen,
    tekst: "Elke tekst kan worden voorgelezen, terwijl een markering meeleest. Rustige opmaak, grote letters en geen tijdsdruk.",
    punten: ["Voorlezen met meelezende markering", "Grote letters en ruime regelafstand", "Nooit tegen de klok"],
  },
  {
    titel: "Slechthorend",
    kleur: "#4fdc9b",
    Icoon: IcoonOor,
    tekst: "Alles wat Bliepo zegt, staat ook in beeld. Geluid is nooit nodig om een opdracht te begrijpen of te maken.",
    punten: ["Ondertiteling bij elke uitleg", "Feedback in beeld, niet alleen met geluid", "Geluid per onderdeel uit te zetten"],
  },
  {
    titel: "ADHD en concentratie",
    kleur: "#ffcf4d",
    Icoon: IcoonFocus,
    tekst: "Eén opdracht tegelijk, korte rondes en een focusmodus zonder afleiding. Beweging op het scherm kan helemaal uit.",
    punten: ["Focusmodus zonder afleiding", "Korte rondes met duidelijke pauzes", "Minder beweging met één schakelaar"],
  },
  {
    titel: "Meertalig",
    kleur: "#9b7bff",
    Icoon: IcoonTaal,
    tekst: "Uitleg in de eigen taal, oefenen in het Nederlands. Zo kan iedere ouder meekijken en meehelpen.",
    punten: ["Uitleg in het Nederlands, Turks, Arabisch en Pools", "Ouderomgeving in dezelfde talen", "Arabisch van rechts naar links"],
  },
  {
    titel: "Toetsenbord en tablet",
    kleur: "#ff7eb6",
    Icoon: IcoonToetsenbord,
    tekst: "Werkt op laptop, tablet en telefoon, met echte invoervelden. Het eigen toetsenbord, Tab tussen vakken en voorleessoftware werken gewoon.",
    punten: ["Volledig met het toetsenbord te bedienen", "Geschikt voor voorleessoftware", "Het scherm schuift mee met het toetsenbord"],
  },
  {
    titel: "En ieder ander kind",
    kleur: "#8fdcff",
    Icoon: IcoonHart,
    tekst: "Hoogbegaafd, een achterstand, net verhuisd of gewoon wat extra nodig: tempo en niveau stellen zich in op het kind.",
    punten: ["Eigen tempo, eigen niveau", "Extra uitdaging of extra herhaling", "Ouders zien precies waar het staat"],
  },
];

export default async function Homepagina() {
  await stuurKindDoor();

  const scholen = scholenoverzicht();
  const aantal = getal(scholen.aantal);
  const werkbladen = aantalZichtbareWerkbladen() > 0;
  const test = niveautestBeschikbaar();
  const { rekenen, lezen } = scholen.landelijk;

  const gegevens = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: MERKNAAM,
    description:
      "Oefenen voor groep 3 tot en met 8, afgestemd op de lesmethode van school, de kerndoelen en de referentieniveaus van de doorstroomtoets.",
    inLanguage: "nl-NL",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gegevens) }} />

      {/* ------------------------------------------------------------------ */}
      <section className="st-opening" aria-labelledby="kop-opening">
        <div className="st-binnen st-opening-raster">
          <div>
            <p className="st-label">
              <b>Groep 3 t/m 8</b> Afgestemd op de school van je kind
            </p>
            <h1 id="kop-opening" className="st-h1 st-titel">
              Oefenen met precies wat er <em>deze week</em> in de klas gebeurt.
            </h1>
            <p className="st-opening-tekst">
              {MERKNAAM} volgt de lesmethode van de school van je kind, de landelijke kerndoelen en de referentieniveaus
              van de doorstroomtoets. Geen generieke opdrachten, maar gerichte oefening die aansluit. Toegankelijk voor
              ieder kind.
            </p>
            <div className="st-opening-knoppen">
              <Link href="/scholen" className="st-knop st-knop-goud">
                <IcoonSpeld />
                Zoek je school
              </Link>
              {test ? (
                <Link href="/niveautest" className="st-knop st-knop-glas">
                  Doe de gratis niveautest
                </Link>
              ) : (
                <Link href="/#zo-werkt-het" className="st-knop st-knop-glas">
                  Zo werkt het
                  <IcoonPijl />
                </Link>
              )}
            </div>
            <ul className="st-opening-noot">
              <li>
                <IcoonVink /> Gratis te beginnen
              </li>
              <li>
                <IcoonVink /> Alle {aantal} basisscholen
              </li>
              <li>
                <IcoonVink /> Maandelijks opzegbaar
              </li>
            </ul>
          </div>

          <div className="st-beeld">
            <div className="st-scherm">
              <Image
                src="/assets/site/bliepo-start.webp"
                alt={`De startpagina van ${MERKNAAM} voor een kind: kies je vak, start een missie of volg je leerpad, met de robot Bliepo ernaast.`}
                width={1280}
                height={720}
                priority
                sizes="(min-width: 1000px) 600px, 100vw"
              />
            </div>
            <div className="st-kaartje st-kaartje-1">
              <span className="st-kaartje-icoon" style={{ background: "rgb(82 217 255 / 0.16)", color: "#52d9ff" }}>
                <IcoonSchool />
              </span>
              <span>
                <b>School gekoppeld</b>
                <span>Methode en lesblok herkend</span>
              </span>
            </div>
            <div className="st-kaartje st-kaartje-2">
              <span className="st-kaartje-icoon" style={{ background: "rgb(255 207 77 / 0.16)", color: "#ffcf4d" }}>
                <IcoonDoel />
              </span>
              <span>
                <b>Lezen: op weg naar 2F</b>
                <span>Streefniveau van de doorstroomtoets</span>
              </span>
            </div>
            <div className="st-kaartje st-kaartje-3">
              <span className="st-kaartje-icoon" style={{ background: "rgb(79 220 155 / 0.16)", color: "#4fdc9b" }}>
                <IcoonLezen />
              </span>
              <span>
                <b>Voorlezen staat aan</b>
                <span>Met een markering die meeleest</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section aria-label="In cijfers">
        <div className="st-binnen">
          <div className="st-feiten">
            <div className="st-feit">
              <span className="st-feit-getal st-titel">{aantal}</span>
              <p>basisscholen op de kaart, elk met hun eigen methode en doorstroomtoets</p>
            </div>
            <div className="st-feit">
              <span className="st-feit-getal st-titel">
                3 <small>t/m</small> 8
              </span>
              <p>alle groepen van de basisschool, rekenen en taal</p>
            </div>
            <div className="st-feit">
              <span className="st-feit-getal st-titel">
                1F <small>·</small> 2F <small>·</small> 1S
              </span>
              <p>de referentieniveaus en kerndoelen als meetlat, elk leerjaar</p>
            </div>
            <div className="st-feit">
              <span className="st-feit-getal st-titel">
                IEP <small>&amp;</small> Cito
              </span>
              <p>voorbereiding op elke doorstroomtoets, ook ROUTE 8, DIA en AMN</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="zo-werkt-het" className="st-sectie" aria-labelledby="kop-werkt">
        <div className="st-binnen">
          <div className="st-sectie-kop">
            <p className="st-boventitel">Zo werkt het</p>
            <h2 id="kop-werkt" className="st-h2 st-titel">
              Geen standaardpakket. <em>Jouw school</em> is het uitgangspunt.
            </h2>
            <p className="st-inleiding">
              De meeste oefensites geven ieder kind hetzelfde. Op school werkt het anders: elke school kiest een eigen
              methode, met een eigen volgorde, eigen woorden en een eigen aanpak. {MERKNAAM} sluit daar precies op aan.
            </p>
          </div>

          <ol className="st-stappen">
            <li className="st-stap st-glas">
              <span className="st-stap-nummer st-titel">1</span>
              <h3 className="st-titel">Kies de school</h3>
              <p>Zoek de basisschool van je kind op de kaart. Alle {aantal} basisscholen van Nederland staan erop.</p>
            </li>
            <li className="st-stap st-glas">
              <span className="st-stap-nummer st-titel">2</span>
              <h3 className="st-titel">Wij koppelen de methode</h3>
              <p>
                {MERKNAAM} koppelt automatisch de methodes van die school, het leerjaar en de doorstroomtoets die de
                school afneemt.
              </p>
            </li>
            <li className="st-stap st-glas">
              <span className="st-stap-nummer st-titel">3</span>
              <h3 className="st-titel">Je kind oefent gericht</h3>
              <p>
                Precies het lesblok waar de klas nu mee bezig is, in dezelfde volgorde en met dezelfde aanpak. Jij ziet
                wat goed gaat en waar het nog schuurt.
              </p>
            </li>
          </ol>

          <div className="st-tegenstelling">
            <div className="st-vergelijk" data-soort="anders">
              <h3 className="st-titel">Een gewone oefensite</h3>
              <ul>
                {[
                  "Dezelfde opdrachten voor ieder kind",
                  "Een volgorde die niet past bij de klas",
                  "Andere uitleg dan de juf of meester",
                  "Geen zicht op de doorstroomtoets",
                ].map((t) => (
                  <li key={t}>
                    <IcoonStreep /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="st-vergelijk" data-soort="zappie">
              <h3 className="st-titel">{MERKNAAM}</h3>
              <ul>
                {[
                  "Afgestemd op de methode van jouw school",
                  "Dezelfde volgorde als het lesblok in de klas",
                  "Uitleg in de aanpak van die methode",
                  "Kerndoelen en referentieniveaus als meetlat",
                ].map((t) => (
                  <li key={t}>
                    <IcoonVink /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="st-methodes st-glas">
            <div className="st-methodes-raster">
              {METHODES.map((m) => (
                <div key={m.vak}>
                  <h3>{m.vak}</h3>
                  <ul className="st-pillen">
                    {m.namen.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="st-voetnoot">
              {MERKNAAM} is niet verbonden aan de uitgevers van deze methodes. De namen zijn merken van hun eigenaars en
              staan hier alleen om aan te geven waarop {MERKNAAM} aansluit. De oefeningen zijn van {MERKNAAM} zelf; de
              methode wordt gebruikt om de volgorde en de aanpak af te stemmen.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="scholenkaart" className="st-sectie" aria-labelledby="kop-kaart">
        <div className="st-binnen">
          <div className="st-kaartblok st-glas">
            <div className="st-kaartblok-tekst">
              <p className="st-boventitel">De scholenkaart</p>
              <h2 id="kop-kaart" className="st-h2 st-titel">
                Elke basisschool van Nederland op <em>één kaart</em>.
              </h2>
              <p className="st-inleiding">
                Kies de school van je kind en {MERKNAAM} weet direct hoe daar geleerd wordt. Per school zie je ook welke
                doorstroomtoets er wordt afgenomen en welke niveaus de leerlingen halen.
              </p>
              <ul className="st-kaartblok-lijst">
                {[
                  ["Methodes automatisch gekoppeld", "rekenen, taal, spelling en lezen, per school."],
                  ["De doorstroomtoets van de school", "IEP, Leerling in Beeld, ROUTE 8, DIA of AMN."],
                  ["Resultaten per school", "welk deel van de leerlingen 1F en het streefniveau haalt, naast het landelijk gemiddelde."],
                  ["Een doel voor je kind", `kies het niveau dat je wilt halen; ${MERKNAAM} werkt ernaartoe.`],
                ].map(([kop, tekst]) => (
                  <li key={kop}>
                    <span className="st-vink">
                      <IcoonVink />
                    </span>
                    <span>
                      <b>{kop}</b>: {tekst}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/scholen" className="st-knop st-knop-goud">
                Open de scholenkaart
                <IcoonPijl />
              </Link>
            </div>
            <MiniKaart aantal={aantal} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="doorstroomtoets" className="st-sectie" aria-labelledby="kop-toets">
        <div className="st-binnen">
          <div className="st-sectie-kop">
            <p className="st-boventitel">Doorstroomtoets en kerndoelen</p>
            <h2 id="kop-toets" className="st-h2 st-titel">
              Toewerken naar de toets van groep 8, <em>vanaf groep 3</em>.
            </h2>
            <p className="st-inleiding">
              Elke basisschool neemt in groep 8 een doorstroomtoets af, zoals de IEP of Leerling in Beeld van Cito. Al
              die toetsen meten hetzelfde: de referentieniveaus voor taal en rekenen. {MERKNAAM} gebruikt die niveaus en
              de landelijke kerndoelen als meetlat, elk leerjaar opnieuw.
            </p>
          </div>
          <div className="st-toets">
            <div className="st-niveaus st-glas">
              <h3 className="st-titel">De referentieniveaus</h3>
              <p>Wat een kind aan het eind van de basisschool beheerst.</p>
              <div className="st-niveau">
                <span className="st-niveau-naam st-titel" style={{ background: "rgb(79 220 155 / 0.16)", color: "#4fdc9b" }}>
                  1F
                </span>
                <p>
                  <b>Fundamenteel niveau.</b> De basis voor taal en rekenen die ieder kind nodig heeft.
                </p>
              </div>
              <div className="st-niveau">
                <span className="st-niveau-naam st-titel" style={{ background: "rgb(82 217 255 / 0.16)", color: "#52d9ff" }}>
                  2F
                </span>
                <p>
                  <b>Streefniveau taal.</b> Voor lezen en taalverzorging: wat een kind dat meer aankan, haalt.
                </p>
              </div>
              <div className="st-niveau">
                <span className="st-niveau-naam st-titel" style={{ background: "rgb(255 207 77 / 0.16)", color: "#ffcf4d" }}>
                  1S
                </span>
                <p>
                  <b>Streefniveau rekenen.</b> Het hogere rekenniveau aan het eind van groep 8.
                </p>
              </div>
              <ul className="st-toetsen" aria-label="Doorstroomtoetsen">
                {["IEP", "Leerling in Beeld (Cito)", "ROUTE 8", "DIA", "AMN"].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="st-voetnoot">
                Landelijk haalde in {scholen.peiljaar} {rekenen[1]}% van de leerlingen het streefniveau rekenen (1S) en{" "}
                {lezen[1]}% het streefniveau lezen (2F). Bron: DUO.
              </p>
            </div>

            <div className="st-testblok st-glas">
              <span className="st-kaart-icoon" style={{ color: "#ffcf4d" }}>
                <IcoonToets />
              </span>
              <h3 className="st-titel">Gratis digitale niveautest</h3>
              <p>
                Ontdek in één korte toets op welk niveau je kind rekent en leest, gemeten met de referentieniveaus waar
                ook de IEP en Cito mee werken.
              </p>
              <ul>
                {[
                  "Gratis en zonder account",
                  "Per onderdeel: beheerst, bijna of nog oefenen",
                  "Met advies waar je het beste op kunt inzetten",
                ].map((t) => (
                  <li key={t}>
                    <span className="st-vink">
                      <IcoonVink />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              {test ? (
                <Link href="/niveautest" className="st-knop st-knop-goud">
                  Start de gratis niveautest
                  <IcoonPijl />
                </Link>
              ) : (
                <Link href="/#prijzen" className="st-knop st-knop-glas">
                  Bekijk de abonnementen
                  <IcoonPijl />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="toegankelijk" className="st-sectie" aria-labelledby="kop-toegankelijk">
        <div className="st-binnen">
          <div className="st-sectie-kop">
            <p className="st-boventitel">Toegankelijk</p>
            <h2 id="kop-toegankelijk" className="st-h2 st-titel">
              Gemaakt voor <em>ieder</em> kind.
            </h2>
            <p className="st-inleiding">
              Kinderen leren verschillend. Daarom past {MERKNAAM} zich aan het kind aan, en niet andersom. De
              instellingen staan in de ouderomgeving en blijven bewaard.
            </p>
          </div>
          <div className="st-raster" data-kolommen="3">
            {TOEGANKELIJK.map(({ titel, kleur, Icoon, tekst, punten }) => (
              <div key={titel} className="st-kaart st-glas">
                <span className="st-kaart-icoon" style={{ color: kleur }}>
                  <Icoon />
                </span>
                <h3 className="st-titel">{titel}</h3>
                <p>{tekst}</p>
                <ul>
                  {punten.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="werkbladen" className="st-sectie" aria-labelledby="kop-werkbladen">
        <div className="st-binnen st-posters">
          <div>
            <p className="st-boventitel">Gratis voor iedereen</p>
            <h2 id="kop-werkbladen" className="st-h2 st-titel">
              Moeilijke onderwerpen, <em>eenvoudig</em> uitgelegd.
            </h2>
            <p className="st-inleiding">
              Werkbladen en posters die de lastigste onderwerpen van de basisschool helder maken, zoals breuken en
              werkwoordspelling. Gratis te downloaden en te printen, voor ouders, leerkrachten en iedereen die helpt.
            </p>
            <ul className="st-kaartblok-lijst">
              {[
                ["Gratis", "ook zonder account."],
                ["Printklaar", "op A4, en als poster voor aan de muur."],
                ["Kloppend", "met de kerndoelen en de aanpak op school."],
              ].map(([kop, tekst]) => (
                <li key={kop}>
                  <span className="st-vink">
                    <IcoonVink />
                  </span>
                  <span>
                    <b>{kop}</b>, {tekst}
                  </span>
                </li>
              ))}
            </ul>
            {werkbladen && (
              <Link href="/werkbladen" className="st-knop st-knop-goud">
                <IcoonDownload />
                Bekijk de werkbladen
              </Link>
            )}
          </div>
          <div className="st-posterwand" aria-hidden="true">
            <div className="st-poster st-poster-1">
              <span>Rekenen · groep 5 t/m 8</span>
              <b>Breuken</b>
              <div className="st-poster-lijnen">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="st-poster st-poster-2">
              <span>Taal · groep 6 t/m 8</span>
              <b>Werkwoord&shy;spelling</b>
              <div className="st-poster-lijnen">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="st-poster st-poster-3">
              <span>Rekenen · groep 4 en 5</span>
              <b>De tafels</b>
              <div className="st-poster-lijnen">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="prijzen" className="st-sectie" aria-labelledby="kop-prijzen">
        <div className="st-binnen">
          <div className="st-sectie-kop" data-midden="">
            <p className="st-boventitel">Abonnementen</p>
            <h2 id="kop-prijzen" className="st-h2 st-titel">
              Begin gratis. Kies later <em>wat past</em>.
            </h2>
            <p className="st-inleiding">Drie mogelijkheden, zonder kleine lettertjes. Alle prijzen zijn inclusief btw.</p>
          </div>
          <div className="st-prijzen">
            <Prijs
              naam="Gratis"
              wat="Proberen, printen en de school vinden"
              bedrag="€0"
              per="altijd"
              onder="Geen betaalgegevens nodig"
              punten={[
                ["Alle werkbladen en posters", true],
                ["Oefenen op de methode van school", true],
                ["De scholenkaart met methodes en resultaten", true],
                ["De gratis digitale niveautest", true],
                ["Voortgang wordt niet bewaard", false],
              ]}
              knop="Begin gratis"
              href="/ouder/overzicht"
            />
            <Prijs
              naam="Maand"
              wat="Elke week gericht oefenen"
              bedrag="€6,95"
              per="per maand"
              onder="Maandelijks opzegbaar"
              punten={[
                ["Alles van Gratis", true],
                ["Voortgang en resultaten worden bewaard", true],
                ["Ouderoverzicht per leerdoel en referentieniveau", true],
                ["Alle toegankelijkheidsopties", true],
                ["Zonder de Bliepo-box", false],
              ]}
              knop="Kies Maand"
              href="/ouder/abonnement"
            />
            <Prijs
              uitgelicht
              naam="Jaar"
              wat="Het hele schooljaar, compleet"
              bedrag="€89"
              per="per jaar"
              onder="Na het eerste jaar maandelijks opzegbaar"
              punten={[
                ["Alles van Maand", true],
                ["De Bliepo-box thuisbezorgd: leermiddelen en oefentoetsboekjes", true],
                ["Uitgebreide niveaumeting voor de doorstroomtoets, met rapport", true],
                ["Zie waar je kind staat ten opzichte van IEP en Cito", true],
              ]}
              knop="Kies Jaar"
              href="/ouder/abonnement"
            />
          </div>
          <p className="st-prijsnoot">
            Prijzen in euro&apos;s, inclusief btw. Je kunt een abonnement binnen 14 dagen kosteloos herroepen.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="vragen" className="st-sectie" aria-labelledby="kop-vragen">
        <div className="st-binnen">
          <div className="st-sectie-kop" data-midden="">
            <p className="st-boventitel">Veelgestelde vragen</p>
            <h2 id="kop-vragen" className="st-h2 st-titel">
              Goed om te weten
            </h2>
          </div>
          <div className="st-vragen">
            <Vraag vraag={`Is ${MERKNAAM} verbonden aan Cito of aan de IEP?`}>
              <p>
                Nee. {MERKNAAM} is onafhankelijk. We bereiden voor op wat alle doorstroomtoetsen meten: de
                referentieniveaus voor taal en rekenen.
              </p>
              <p>
                IEP, Cito en Leerling in Beeld zijn merken van hun eigenaars (Bureau ICE en Cito). We noemen ze alleen om
                aan te geven waar {MERKNAAM} op voorbereidt; de oefeningen zijn van {MERKNAAM} zelf.
              </p>
            </Vraag>
            <Vraag vraag={`Hoe weet ${MERKNAAM} welke methode de school gebruikt?`}>
              <p>
                Per school houden we bij welke methodes er worden gebruikt, en we controleren dat bij de school zelf,
                bijvoorbeeld in de schoolgids. Klopt het niet meer, dan geef je de juiste methode in twee klikken door;
                na controle staat het voor iedereen goed.
              </p>
            </Vraag>
            <Vraag vraag="Waar komen de gegevens op de scholenkaart vandaan?">
              <p>
                Uit open data van DUO (Dienst Uitvoering Onderwijs): de adressen van alle basisscholen, welke
                doorstroomtoets ze afnemen en welke referentieniveaus de leerlingen halen. Er staan geen gegevens over
                individuele leerlingen in. Kleine aantallen schermt DUO af; dan staat er &ldquo;ongeveer&rdquo; bij.
              </p>
            </Vraag>
            <Vraag vraag="Wat gebeurt er met de gegevens van mijn kind?">
              <p>
                We bewaren zo weinig mogelijk: van je kind alleen een voornaam en de groep. Geen advertenties, geen
                tracking, en we verkopen niets door. Je kunt alles inzien, downloaden en laten verwijderen.
              </p>
            </Vraag>
            <Vraag vraag="Kan ik op elk moment opzeggen?">
              <p>
                Het maandabonnement zeg je op per maand. Het jaarabonnement loopt een jaar en is daarna maandelijks
                opzegbaar. Binnen 14 dagen na het afsluiten kun je kosteloos herroepen.
              </p>
            </Vraag>
            <Vraag vraag="Voor welke groepen en vakken is het?">
              <p>
                Voor groep 3 tot en met 8, voor rekenen en taal: spelling, lezen en taalverzorging. Precies de
                onderdelen waar de doorstroomtoets over gaat.
              </p>
            </Vraag>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section className="st-sectie" aria-labelledby="kop-slot">
        <div className="st-binnen">
          <div className="st-slot st-glas">
            <h2 id="kop-slot" className="st-h2 st-titel">
              Klaar om te beginnen?
            </h2>
            <p className="st-inleiding">Zoek de school van je kind en zie meteen hoe {MERKNAAM} daarop aansluit.</p>
            <div className="st-opening-knoppen">
              <Link href="/scholen" className="st-knop st-knop-goud">
                <IcoonSpeld />
                Zoek je school
              </Link>
              <Link href="/ouder/overzicht" prefetch={false} className="st-knop st-knop-glas">
                Begin gratis
              </Link>
            </div>
            <span className="st-slot-hand st-hand">Leren vandaag, groter morgen.</span>
          </div>
        </div>
      </section>
    </>
  );
}

function Prijs({
  naam,
  wat,
  bedrag,
  per,
  onder,
  punten,
  knop,
  href,
  uitgelicht = false,
}: {
  naam: string;
  wat: string;
  bedrag: string;
  per: string;
  onder: string;
  punten: [string, boolean][];
  knop: string;
  href: string;
  uitgelicht?: boolean;
}) {
  return (
    <div className="st-prijs st-glas" data-uitgelicht={uitgelicht ? "" : undefined}>
      {uitgelicht && <span className="st-prijs-label">Compleet</span>}
      <h3 className="st-titel">{naam}</h3>
      <p className="st-prijs-wat">{wat}</p>
      <p className="st-prijs-bedrag">
        <b className="st-titel">{bedrag}</b>
        <span>{per}</span>
      </p>
      <p className="st-prijs-onder">{onder}</p>
      <ul>
        {punten.map(([tekst, wel]) => (
          <li key={tekst} data-niet={wel ? undefined : ""}>
            {wel ? <IcoonVink /> : <IcoonStreep />}
            <span>
              {!wel && <span className="st-sr">Niet: </span>}
              {tekst}
            </span>
          </li>
        ))}
      </ul>
      {/* Achter het slot (ouderomgeving): niet vooruit ophalen. */}
      <Link href={href} prefetch={false} className={`st-knop ${uitgelicht ? "st-knop-goud" : "st-knop-glas"}`}>
        {knop}
      </Link>
    </div>
  );
}

function Vraag({ vraag, children }: { vraag: string; children: React.ReactNode }) {
  return (
    <details className="st-vraag st-glas">
      <summary>{vraag}</summary>
      <div>{children}</div>
    </details>
  );
}
