import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { leesKeuzes } from "./keuzes-bewaren";
import { leesbareLesTekst } from "@/lib/lessen/tekstbewerking";
import { cijfersInTekst } from "@/lib/lessen/cijfertaal";
import { lesbeheerActief, lokaleLaptop } from "@/lib/lessen/lokaal-beheer";
import { activeerTekstkeuzes } from "./acties";
import { TekstKeuze } from "./TekstKeuze";
import s from "./voorbeelden.module.css";

export const metadata: Metadata = {
  title: "Kies de uitleg per les · Thuisles",
  robots: { index: false, follow: false },
};

export default async function Pagina({ searchParams }: {
  searchParams: Promise<{ zoek?: string; onderwerp?: string; les?: string; alleen?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { zoek = "", onderwerp = "", les: open = "", alleen = "" } = await searchParams;
  const [beheer, laptop] = await Promise.all([lesbeheerActief(), lokaleLaptop()]);
  const voorbeelden = leesKeuzes();
  const term = zoek.toLocaleLowerCase("nl").trim();
  const isVoorstel = (regel: typeof voorbeelden[number]["regels"][number]) =>
    regel.stand.kanTerug || cijfersInTekst(leesbareLesTekst(regel.stand.actueel)) !== regel.nieuw;
  const aantal = voorbeelden.reduce((n, les) => n + les.regels.filter(isVoorstel).length, 0);
  const gekozen = voorbeelden.reduce((n, les) => n + les.regels.filter((regel) => regel.stand.aan && regel.stand.kanTerug).length, 0);
  const zichtbaar = voorbeelden.filter((les) => (!onderwerp || onderwerp === les.onderwerp) &&
    (!alleen || alleen !== "open" || les.regels.some((regel) => isVoorstel(regel) && !regel.stand.aan)) &&
    `${les.titel} ${les.onderwerp} ${les.regels.map((regel) => `${regel.bron} ${regel.nieuw}`).join(" ")}`.toLocaleLowerCase("nl").includes(term));

  return <main className={s.pagina} id="boven">
    <header className={s.kop}>
      <Link className={s.terug} href="/voorbeeld/beginschermen" prefetch={false}>← Naar de beginschermen</Link>
      <p className={s.bovenregel}>THUISLES · {voorbeelden.length} SQULA-LESSEN · GROEP 3</p>
      <h1>Makkelijker uitgelegd</h1>
      <p className={s.inleiding}>Wat zegt Bliepo nadat het kind op <strong>Nee</strong> klikt?
        Links lees je de huidige tekst. Rechts kies je de eenvoudigere tekst die jij wilt gebruiken.</p>
      <p className={s.status}><strong>Aanvinken = meteen gebruiken in de les.</strong> De nieuwe tekst vervangt de oude tekst zodra ‘Opgeslagen’ verschijnt.
        Vink uit om de vorige tekst terug te zetten. Wil je zelf een zin verbeteren? Kies ‘Tekst aanpassen’ en daarna ‘Opslaan en gebruiken’.</p>
      {beheer ? <p className={s.beheer}>Beheerstand op jouw laptop staat aan. Je kunt hieronder teksten kiezen.</p> : laptop ?
        <form action={activeerTekstkeuzes} className={s.activeer}><p>Zet de beheerstand aan om teksten te kiezen.</p><button type="submit">Teksten kiezen op deze laptop</button></form> :
        <p className={s.beheer}>Je kunt dit overzicht lezen. Teksten kiezen kan alleen in de beheerstand op de lokale laptop.</p>}
      <p className={s.totaal}>{gekozen} van de {aantal} voorstellen gebruikt · {voorbeelden.length} lessen nagekeken</p>
      <div className={s.afspraak}>
        <p><strong>De afspraak:</strong> korte zinnen, gewone woorden en steeds een kleine stap.
          Zoals: ‘Er komt steeds 1 bij.’ Getallen schrijven we als cijfers.
          In ‘een munt’ blijft ‘een’ gewoon een woord. Deze schrijfwijze is al toegepast in de lessen en in beide kolommen hieronder.</p>
        <p>Je ziet per les de eerste uitleg na Nee, tot het kind iets kiest of doet.
          Bij ‘Groot en klein, vol en leeg’ staan ook het beginscherm en de hele uitlegroute, met de hulpteksten apart.
          De opdrachten, antwoorden en manier van nakijken blijven hetzelfde.
          De gewone tekstmomenten ertussen staan er ook bij, zodat je de uitleg in volgorde kunt lezen.</p>
      </div>
    </header>

    <form method="get" className={s.zoeken}>
      <label htmlFor="zoek">Zoek een les of woord</label>
      <div><input id="zoek" name="zoek" type="search" defaultValue={zoek} placeholder="Bijvoorbeeld knikkers, geld of klok" />
        <label className={s.filterlabel}>Onderwerp<select name="onderwerp" defaultValue={onderwerp}>
          <option value="">Alle onderwerpen</option>{[...new Set(voorbeelden.map((les) => les.onderwerp))].map((naam) => <option key={naam}>{naam}</option>)}
        </select></label>
        <label className={s.filterlabel}>Toon<select name="alleen" defaultValue={alleen}><option value="">Alle voorstellen</option><option value="open">Nog te kiezen</option></select></label>
        <button type="submit">Zoeken</button>
        {(zoek || onderwerp || alleen) && <Link href="/voorbeeld/uitleg-kindertaal" prefetch={false}>Toon alle lessen</Link>}
      </div>
      <p role="status">{zichtbaar.length} van de {voorbeelden.length} lessen</p>
    </form>

    <details className={s.inhoud}>
      <summary>Ga meteen naar een les</summary>
      <nav aria-label="Alle lessen">
        {voorbeelden.map((les, i) => <a key={les.id} href={`/voorbeeld/uitleg-kindertaal?les=${les.id}#${les.id}`}>
          <span>{i + 1}.</span> {les.titel}
        </a>)}
      </nav>
    </details>

    {zichtbaar.length === 0 && <p className={s.leeg}>Geen les gevonden. Probeer een ander woord.</p>}
    {zichtbaar.map((les) => {
      const gewijzigd = les.regels.filter(isVoorstel);
      const gebruikt = gewijzigd.filter((regel) => regel.stand.aan && regel.stand.kanTerug).length;
      const hoofdroute = les.regels.filter((regel) => !regel.hulp);
      const hulpteksten = les.regels.filter((regel) => regel.hulp);
      return <article className={s.les} key={les.id} id={les.id} aria-labelledby={`${les.id}-titel`}>
        <details open={open === les.id || (!open && zichtbaar.length === 1)} className={s.lesdetails}>
          <summary><span className={s.bovenregel}>{voorbeelden.indexOf(les) + 1} / {voorbeelden.length} · {les.onderwerp}</span>
            <h2 id={`${les.id}-titel`}>{les.titel}</h2>
            <span className={s.aantallen}>{gewijzigd.length ? `${gebruikt} van ${gewijzigd.length} voorstellen gebruikt` : "De tekst is al duidelijk"}</span>
          </summary>
          <div className={s.lesinhoud}>
            {les.volledigeUitleg && <section className={s.begin} aria-label="Beginscherm van deze les">
              <h3>Beginscherm</h3>
              <p>{cijfersInTekst(les.begin.zin1)}</p>
              <p>{cijfersInTekst(les.begin.zin2)}</p>
              <a className={s.leslink} href={`/voorbeeld/les/${les.id}?beheer=1`} target="_blank" rel="noreferrer">Bekijk het beginscherm ↗</a>
              <p className={s.kleineuitleg}>Daarna kiest het kind Ja of Nee. Je kunt de beginzinnen in de les bewerken.</p>
            </section>}
            <a className={s.leslink} href={`/voorbeeld/les/${les.id}?beheer=1&uitleg=nee`} target="_blank" rel="noreferrer">
              Bekijk de les met de opgeslagen teksten ↗<span className={s.srAlleen}>: {les.titel}</span>
            </a>
            <p className={s.kleineuitleg}>{les.volledigeUitleg ? "De hele uitleg na Nee: samen beginnen, voordoen, zelf iets doen, antwoorden, uitleg bij het goede antwoord en verder met minder hulp. Hieronder staat eerst de route bij goede antwoorden; bij elke vraag wacht Bliepo op het kind. De hulpteksten staan eronder." : "Uitleg na Nee, in de volgorde van de les."} Herhaalde teksten staan hier 1 keer. Een gekozen tekst wordt ook gebruikt als dezelfde zin in deze les terugkomt.</p>
            {hoofdroute.map((regel, i) =>
              <TekstKeuze key={regel.sleutel} lesId={les.id} sleutel={regel.sleutel} versie={regel.versie} nieuw={regel.nieuw} start={regel.stand} beheer={beheer} nummer={i + 1} />)}
            {hulpteksten.length > 0 && <section aria-label="Hulp als een stap nog niet lukt">
              <h3 className={s.hulpkop}>Hulp als een stap nog niet lukt</h3>
              <p className={s.kleineuitleg}>Bliepo geeft de hint die bij de vraag hoort en laat het kind opnieuw proberen. De pauzetekst komt alleen als het daarna nog niet lukt.</p>
              {hulpteksten.map((regel, i) => <TekstKeuze key={regel.sleutel} lesId={les.id} sleutel={regel.sleutel} versie={regel.versie} nieuw={regel.nieuw} start={regel.stand} beheer={beheer} nummer={hoofdroute.length + i + 1} />)}
            </section>}
          </div>
        </details>
      </article>;
    })}
    <footer className={s.voet}>{voorbeelden.length} actieve Squla-lessen · Jij kiest welke eenvoudigere formuleringen worden toegepast · De vorige tekst blijft beschikbaar om terug te zetten.</footer>
  </main>;
}
