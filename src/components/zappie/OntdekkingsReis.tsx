"use client";

import Link from "next/link";
import { useState } from "react";
import { Zappie } from "@/components/zappie/Zappie";
import { useVoortgang } from "@/lib/zappie/opslag";
import { ASSETS } from "@/lib/zappie/werelden";

const vakken = [
  { naam: "Rekenen", icoon: "✦", kleur: "blauw", href: "/rekenen", klaar: true },
  { naam: "Taal", icoon: "Aa", kleur: "roze", href: "/binnenkort/taal", klaar: false },
  { naam: "Begrijpend lezen", icoon: "📖", kleur: "goud", href: "/binnenkort/lezen", klaar: false },
  { naam: "Spelling", icoon: "ABC", kleur: "violet", href: "/binnenkort/spelling", klaar: false },
  { naam: "Aardrijkskunde", icoon: "🌍", kleur: "groen", href: "", klaar: false },
  { naam: "Geschiedenis", icoon: "⌛", kleur: "brons", href: "", klaar: false },
  { naam: "Natuur", icoon: "🌿", kleur: "groen", href: "", klaar: false },
  { naam: "Woordenschat", icoon: "✎", kleur: "roze", href: "", klaar: false },
  { naam: "Engels", icoon: "EN", kleur: "blauw", href: "", klaar: false },
] as const;

const accessoires = [
  { id: "pet", naam: "Zappie-pet", icoon: "🧢", prijs: 120, type: "Petjes" },
  { id: "blauw", naam: "Oceaanblauw", icoon: "💠", prijs: 80, type: "Kleuren" },
  { id: "kroon", naam: "Sterrenkroon", icoon: "👑", prijs: 300, type: "Petjes" },
  { id: "bril", naam: "Zonnebril", icoon: "🕶️", prijs: 100, type: "Extra’s" },
  { id: "antenne", naam: "Sterrenantenne", icoon: "✨", prijs: 150, type: "Extra’s" },
] as const;

export function OntdekkingsReis() {
  const voortgang = useVoortgang();
  const voltooid = voortgang.missies.oceaan;
  const [filter, zetFilter] = useState("Alles");
  const [gekozen, zetGekozen] = useState("pet");
  const [melding, zetMelding] = useState("");

  return (
    <div className="zr-reis">
      <div className="zr-atmosfeer" aria-hidden="true">
        <span className="zr-wolk zr-wolk-a" /><span className="zr-wolk zr-wolk-b" />
        <span className="zr-wolk zr-wolk-c" />
      </div>
      <section className="zr-leren zr-sectie" id="vrij-oefenen" aria-labelledby="zr-vakkenkop">
        <div className="zr-sectieintro">
          <span className="zr-bovenregel">VOLGENDE HALTE · DE AARDE</span>
          <h2 id="zr-vakkenkop" className="zp-titel">Wat wil je ontdekken?</h2>
          <p>Kies een vak en ga op avontuur!</p>
        </div>
        <div className="zr-leergrid">
          <div className="zr-vakkenpaneel">
            <div className="zr-paneeltop"><span className="zr-bolster">✦</span><strong>Vrij oefenen</strong><span>Voor nieuwsgierige ontdekkers</span></div>
            <div className="zr-vakken">
              {vakken.map(v => {
                const inhoud = <><span className="zr-vakicoon" aria-hidden="true">{v.icoon}</span><strong>{v.naam}</strong><span className="zr-vakpijl" aria-hidden="true">{v.klaar ? "➜" : "⌁"}</span>{!v.klaar && <span className="zr-later">Later</span>}</>;
                return v.klaar ? <Link key={v.naam} className="zr-vak" data-kleur={v.kleur} href={v.href}>{inhoud}</Link> : <div key={v.naam} className="zr-vak" data-kleur={v.kleur} aria-label={v.naam + ", binnenkort"}>{inhoud}</div>;
              })}
            </div>
          </div>
          <aside className="zr-werkplaats" aria-labelledby="zr-werkplaatskop">
            <div className="zr-paneeltop"><span className="zr-bolster">⚙</span><strong id="zr-werkplaatskop">De werkplaats</strong></div>
            <p>Zappies hulpjes bouwen jouw volgende voertuig.</p>
            <div className="zr-werfbeeld">
              <span className="zr-lichtkegel" aria-hidden="true" />
              <span className="zr-kraan" aria-hidden="true">⚙</span>
              <span className="zr-duikboot" aria-label="Onderzeeër in aanbouw">🚢</span>
              <span className="zr-hulpje zr-hulpje-een" aria-hidden="true">🤖</span>
              <span className="zr-hulpje zr-hulpje-twee" aria-hidden="true">🤖</span>
              <span className="zr-vonken" aria-hidden="true">✧ ✦</span>
            </div>
            <div className="zr-bouwvoortgang">
              <div><strong>Onderzeeër</strong><span>{voltooid} van 12 missies</span></div>
              <progress max={12} value={voltooid} aria-label="Voortgang onderzeeër" />
              <p>{voltooid >= 12 ? "De onderzeeër is klaar om te ontdekken!" : "Maak oceaanmissies om nieuwe onderdelen te verdienen."}</p>
            </div>
            <div className="zr-toekomst"><span>✈️ Vliegtuig <small>Op slot</small></span><span>🚀 Raket <small>Op slot</small></span></div>
          </aside>
        </div>
      </section>

      <section className="zr-atelier zr-sectie" id="zappies-atelier" aria-labelledby="zr-atelierkop">
        <div className="zr-sectieintro">
          <span className="zr-bovenregel">BESTEMMING BEREIKT · ZAPPIES THUISBASIS</span>
          <h2 id="zr-atelierkop" className="zp-titel">Zappies atelier</h2>
          <p>Jouw stijl. Jouw Zappie.</p>
        </div>
        <div className="zr-ateliergrid">
          <div className="zr-paspodium">
            <span className="zr-atelierglans" />
            <span className="zr-paslabel">PAS HET MAAR!</span>
            <Zappie stemming="blij" houding="zwaai" />
            <span className="zr-podiumvoet">✦ ZAPPIE ✦</span>
          </div>
          <div className="zr-winkelpaneel">
            <div className="zr-paneeltop"><span className="zr-bolster">★</span><strong>Maak Zappie van jou</strong></div>
            <div className="zr-filters" aria-label="Accessoires filteren">
              {["Alles", "Petjes", "Kleuren", "Extra’s"].map(naam => <button type="button" key={naam} aria-pressed={filter === naam} onClick={() => zetFilter(naam)}>{naam}</button>)}
            </div>
            <div className="zr-producten">
              {accessoires.filter(a => filter === "Alles" || a.type === filter).map(a => <button type="button" key={a.id} aria-pressed={gekozen === a.id} onClick={() => {zetGekozen(a.id);zetMelding("");}} className="zr-product"><span className="zr-productbeeld">{a.icoon}</span><strong>{a.naam}</strong><small>★ {a.prijs} tokens</small><span className="zr-productactie">{gekozen === a.id ? "Gekozen" : "Bekijken"}</span></button>)}
            </div>
            <p className="zr-winkelstatus" aria-live="polite">{melding || "Kies een accessoire om het te bekijken. Kopen en aantrekken worden later toegevoegd."}</p>
          </div>
        </div>
        <div className="zr-kust" aria-hidden="true">
          <div className="zr-bergen" />
          <div className="zr-stad">✦ &nbsp; Z A P P I E &nbsp; ✦</div>
          <div className="zr-water" />
        </div>
      </section>
    </div>
  );
}
