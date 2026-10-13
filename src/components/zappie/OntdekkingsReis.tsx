"use client";

import Link from "next/link";
import { useState } from "react";
import { Zappie } from "@/components/zappie/Zappie";
import { IcoonKompas, IcoonPijl, IcoonSlot, IcoonSter } from "@/components/zappie/Iconen";
import { AccessoireBeeld, VakBeeld, type AccessoireId, type VakId } from "@/components/zappie/reis/Beelden";
import { VoertuigBeeld, WerkplaatsBeeld, type VoertuigId } from "@/components/zappie/reis/WerkplaatsBeeld";
import { useVoortgang } from "@/lib/zappie/opslag";
import { WERELDEN, type WereldId } from "@/lib/zappie/werelden";

const VAKKEN: readonly { id: VakId; naam: string; kleur: string; href?: string }[] = [
  { id: "rekenen", naam: "Rekenen", kleur: "blauw", href: "/rekenen" },
  { id: "taal", naam: "Taal", kleur: "roze" },
  { id: "lezen", naam: "Begrijpend lezen", kleur: "goud" },
  { id: "spelling", naam: "Spelling", kleur: "violet" },
  { id: "aardrijkskunde", naam: "Aardrijkskunde", kleur: "groen" },
  { id: "geschiedenis", naam: "Geschiedenis", kleur: "brons" },
  { id: "natuur", naam: "Natuur", kleur: "groen" },
  { id: "woordenschat", naam: "Woordenschat", kleur: "roze" },
  { id: "engels", naam: "Engels", kleur: "blauw" },
];

const VOERTUIGEN: readonly { id: VoertuigId; naam: string; wereld: WereldId; zin: string }[] = [
  { id: "onderzeeer", naam: "Onderzeeër", wereld: "oceaan", zin: "Een nieuw avontuur onder de golven." },
  { id: "vliegtuig", naam: "Vliegtuig", wereld: "aarde", zin: "Boven de bergen wacht meer wereld." },
  { id: "raket", naam: "Raket", wereld: "heelal", zin: "De sterren zijn nog maar het begin." },
];

const ACCESSOIRES: readonly { id: AccessoireId; naam: string; groep: string }[] = [
  { id: "pet", naam: "Ontdekkerspet", groep: "Petjes" },
  { id: "oceaan", naam: "Oceaanblauw", groep: "Kleuren" },
  { id: "kroon", naam: "Sterrenkroon", groep: "Petjes" },
  { id: "bril", naam: "Ruimtebril", groep: "Extra’s" },
  { id: "antenne", naam: "Sterrenantenne", groep: "Extra’s" },
];

/**
 * De nieuwe onderdelen blijven uit de bestaande leer- en beloningsdatalaag.
 * Alleen Rekenen is beschikbaar. Werkplaats = bouwplan; atelier = echt passen,
 * nog geen aankopen. Geen testvragen, fake saldo of wijzigingen in de database.
 */
export function OntdekkingsReis() {
  const voortgang = useVoortgang();
  const [voertuig, kiesVoertuig] = useState<VoertuigId>("onderzeeer");
  const [filter, zetFilter] = useState("Alles");
  const [accessoire, pasAccessoire] = useState<AccessoireId>("standaard");
  const [vakBericht, zetVakBericht] = useState("");
  const bouwplan = VOERTUIGEN.find((v) => v.id === voertuig)!;
  const wereld = WERELDEN.find((w) => w.id === bouwplan.wereld)!;
  const ruw = Number(voortgang.missies[bouwplan.wereld]);
  const aantal = Number.isFinite(ruw) ? Math.min(wereld.missies, Math.max(0, Math.floor(ruw))) : 0;
  const gekozenNaam = ACCESSOIRES.find((a) => a.id === accessoire)?.naam ?? "Je eigen Zappie";

  return (
    <div className="zr-reis">
      <div className="zr-hoofdstuklijn" aria-hidden="true"><span/><IcoonSter/><span/></div>
      <section className="zr-sectie zr-leren" id="vrij-oefenen" aria-labelledby="zr-vakkenkop">
        <header className="zr-sectieintro">
          <span className="zr-hoofdstuk">01 <span/> OP ONTDEKKING</span>
          <h2 id="zr-vakkenkop" className="zp-titel">Waar ben jij nieuwsgierig naar?</h2>
          <p>Kies een vak. Er valt nog zoveel te ontdekken.</p>
        </header>
        <div className="zr-leergrid">
          <div className="zr-vakkenpaneel">
            <div className="zr-paneelkop"><IcoonKompas/><h3 className="zp-titel">Vrij oefenen</h3></div>
            <div className="zr-vakken">
              {VAKKEN.map((vak) => {
                const inhoud = <><span className="zr-vakicoon"><VakBeeld soort={vak.id}/></span><span className="zr-vaknaam zp-titel">{vak.naam}</span><span className="zr-vakpijl" aria-hidden="true"><IcoonPijl/></span>{!vak.href && <span className="zr-later">Later</span>}</>;
                return vak.href
                  ? <Link key={vak.id} className="zr-vak" data-kleur={vak.kleur} href={vak.href}>{inhoud}</Link>
                  : <button key={vak.id} type="button" className="zr-vak" data-kleur={vak.kleur} aria-label={`${vak.naam}, binnenkort`} onClick={() => zetVakBericht(`${vak.naam} komt later. Met rekenen kun je al beginnen!`)}>{inhoud}</button>;
              })}
            </div>
            <div className="zr-vakbericht" role="status">{vakBericht || "Rekenen staat voor je klaar. De andere vakken groeien mee."}</div>
            <Link href="/zappie/oefenen?vrij=1" className="zr-extra-missie">Liever meteen een vrije missie? <IcoonPijl/></Link>
          </div>

          <aside className="zr-werkplaats zr-paneel" aria-labelledby="zr-werkplaatskop">
            <div className="zr-paneelkop"><span className="zr-gereedschap" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="m29 7-9 9 4 8 8 4 9-9c5 17-13 20-18 16L10 45 3 38l12-13C9 15 19 2 29 7z"/></svg></span><div><h3 id="zr-werkplaatskop" className="zp-titel">Zappies werkplaats</h3><p>Grote plannen. Kleine bouwers.</p></div><span className="zr-statuslabel">Bouwplan</span></div>
            <WerkplaatsBeeld voertuig={voertuig}/>
            <div className="zr-bouwstand">
              <div><span className="zr-kleine-kop">OP DE TEKENTAFEL</span><h4 className="zp-titel">{bouwplan.naam}</h4></div>
              <span className="zr-telstand"><strong>{aantal}</strong> / {wereld.missies}<small>{wereld.naam.toLowerCase()}missies</small></span>
              <progress max={wereld.missies} value={aantal} aria-label={`${aantal} van ${wereld.missies} missies in ${wereld.naam} voltooid`}/>
              <p>{bouwplan.zin}</p>
            </div>
            <div className="zr-voertuigen" aria-label="Bouwplannen bekijken">
              {VOERTUIGEN.map((v) => <button type="button" key={v.id} onClick={() => kiesVoertuig(v.id)} aria-pressed={voertuig === v.id} className="zr-voertuigkeuze"><VoertuigBeeld soort={v.id} klein/><span>{v.naam}</span><IcoonSlot/></button>)}
            </div>
            <p className="zr-eerlijk">De werkplaats is in ontwikkeling. Je bekijkt de bouwplannen; de voertuigen zijn nog niet speelbaar.</p>
          </aside>
        </div>
        <a href="#zappies-atelier" className="zr-volgende-halte"><span>Beneden wacht jouw atelier</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg></a>
      </section>

      <section className="zr-sectie zr-atelier" id="zappies-atelier" aria-labelledby="zr-atelierkop">
        <header className="zr-sectieintro"><span className="zr-hoofdstuk">02 <span/> THUIS OP AARDE</span><h2 id="zr-atelierkop" className="zp-titel">Helemaal jouw Zappie.</h2><p>Een nieuwe look voor je volgende avontuur.</p></header>
        <div className="zr-ateliergrid">
          <div className="zr-paspodium">
            <div className="zr-atelier-boog" aria-hidden="true"/>
            <span className="zr-paslabel">ZAPPIES ATELIER</span>
            <div className="zr-avatar" data-accessoire={accessoire}>
              <Zappie stemming="blij" houding="zwaai"/>
              {accessoire !== "standaard" && accessoire !== "oceaan" && <AccessoireBeeld soort={accessoire} className={`zr-gepast zr-gepast--${accessoire}`}/>}
            </div>
            <div className="zr-podiumringen" aria-hidden="true"><span/><span/><span/></div>
            <div className="zr-pasbijschrift"><strong className="zp-titel">{gekozenNaam}</strong><button type="button" onClick={() => pasAccessoire("standaard")} disabled={accessoire === "standaard"}>Terug naar je eigen look</button></div>
          </div>
          <div className="zr-winkelpaneel zr-paneel">
            <div className="zr-paneelkop"><IcoonSter/><div><h3 className="zp-titel">Wat past bij jou?</h3><p>Probeer het op Zappie.</p></div><span className="zr-statuslabel">Paskamer</span></div>
            <div className="zr-filters" aria-label="Accessoires filteren">{["Alles", "Petjes", "Kleuren", "Extra’s"].map((naam) => <button type="button" key={naam} aria-pressed={filter === naam} onClick={() => zetFilter(naam)}>{naam}</button>)}</div>
            <div className="zr-producten">{ACCESSOIRES.filter((a) => filter === "Alles" || a.groep === filter).map((a) => <button type="button" className="zr-product" key={a.id} aria-label={`${a.naam} passen`} aria-pressed={accessoire === a.id} onClick={() => pasAccessoire(a.id)}><span className="zr-productbeeld"><AccessoireBeeld soort={a.id}/></span><span className="zr-productnaam zp-titel">{a.naam}</span><span className="zr-productactie">{accessoire === a.id ? "Past bij jou!" : "Passen"}<IcoonPijl/></span></button>)}</div>
            <p className="zr-passtatus" role="status">{accessoire === "standaard" ? "Tik op een accessoire om het op Zappie te zien." : `${gekozenNaam} gepast! Je originele Zappie blijft bewaard.`}</p>
            <p className="zr-eerlijk">Dit is een pasvoorbeeld. Kopen en bewaren volgen later; er worden geen tokens afgeschreven. Echte beloningen staan apart bij <Link href="/zappie/beloningen">Beloningen</Link>.</p>
          </div>
        </div>
      </section>
      <footer className="zr-bestemming">
        <img src="/achtergrond-wereld.png" alt="Een zonnig landschap met bergen, een rivier en een kasteel" loading="lazy" decoding="async"/>
        <div className="zr-bestemming-tekst"><span className="zr-hoofdstuk">ER WACHT NOG EEN HELE WERELD</span><p className="zp-hand">Tot je volgende avontuur.</p><a href="#" className="zr-terug">Terug naar de sterren <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 15 7-7 7 7"/></svg></a></div>
      </footer>
    </div>
  );
}
