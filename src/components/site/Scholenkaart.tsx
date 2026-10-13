"use client";

/**
 * De scholenkaart: alle basisscholen van Nederland, te zoeken en te kiezen.
 *
 * Links (op telefoon eronder) zoeken en het gekozen schoolpaneel, rechts de
 * kaart. Elke school is een stip in de kleur van de doorstroomtoets die de
 * school afneemt. Slepen, scrollen of knijpen om te zoomen; tikken op een stip
 * kiest de school.
 *
 * Toegankelijk: de kaart is een extraatje. Alles kan ook met zoeken en de
 * lijst, met het toetsenbord en met voorleessoftware.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IcoonDoel, IcoonKruis, IcoonPijl, IcoonSchool, IcoonZoek } from "@/components/site/Iconen";
import {
  kleurVan,
  laadKaart,
  NL,
  TOETSGROEPEN,
  zoekvorm,
  type KaartSchool,
  type Kaartdata,
  type Uitslag,
} from "@/components/site/kaartdata";

type Beeld = { k: number; tx: number; ty: number };
type Methode = {
  herkomst: "geverifieerd" | "opgegeven_door_ouder" | "onbekend";
  methode: { naam: string; uitgever: string } | null;
  aantalOpgaven: number;
  zin: string;
};
type Doel = "basis" | "streef";

const MAX_ZOOM = 40;

export function Scholenkaart() {
  const [data, zetData] = useState<Kaartdata | null>(null);
  const [fout, zetFout] = useState(false);
  const [zoekterm, zetZoekterm] = useState("");
  const [uit, zetUit] = useState<Set<string>>(new Set());
  const [gekozen, zetGekozen] = useState<KaartSchool | null>(null);
  const [zweef, zetZweef] = useState<{ school: KaartSchool; x: number; y: number } | null>(null);

  const vak = useRef<HTMLDivElement>(null);
  const doek = useRef<HTMLCanvasElement>(null);
  const beeld = useRef<Beeld>({ k: 1, tx: 0, ty: 0 });
  const maat = useRef({ breed: 0, hoog: 0, schaal: 1, dx: 0, dy: 0 });
  const frame = useRef(0);

  useEffect(() => {
    laadKaart()
      .then(zetData)
      .catch(() => zetFout(true));
  }, []);

  /* Welke toetscodes uit staan in de filter. */
  const uitCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const g of TOETSGROEPEN) if (uit.has(g.sleutel)) g.codes.forEach((c) => codes.add(c));
    return codes;
  }, [uit]);
  const zichtbaar = useCallback((s: KaartSchool) => !uitCodes.has(s.toets ?? ""), [uitCodes]);

  /* RD-meters naar schermpunten, met zoom en verschuiving. */
  const naarScherm = useCallback((x: number, y: number) => {
    const m = maat.current;
    const b = beeld.current;
    return [(m.dx + (x - NL.minX) * m.schaal) * b.k + b.tx, (m.dy + (NL.maxY - y) * m.schaal) * b.k + b.ty];
  }, []);

  const teken = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const c = doek.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx || !data) return;
      const { breed, hoog } = maat.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, breed, hoog);

      ctx.lineJoin = "round";
      for (const p of data.provincies) {
        ctx.beginPath();
        for (const ring of p.ringen) {
          for (let i = 0; i < ring.length; i += 2) {
            const [sx, sy] = naarScherm(ring[i], ring[i + 1]);
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
        }
        ctx.fillStyle = "rgba(82, 160, 255, 0.07)";
        ctx.fill("evenodd");
        ctx.strokeStyle = "rgba(140, 214, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const k = beeld.current.k;
      const r = Math.min(7, Math.max(1.3, 1.1 * Math.sqrt(k)));
      for (const s of data.scholen) {
        if (!zichtbaar(s)) continue;
        const [sx, sy] = naarScherm(s.x, s.y);
        if (sx < -10 || sy < -10 || sx > breed + 10 || sy > hoog + 10) continue;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = kleurVan(s.toets);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /*
        Namen erbij als er ver genoeg is ingezoomd. Alleen als een naam niet
        over een andere valt; de gekozen school krijgt als eerste ruimte.
      */
      if (k >= 12) {
        ctx.font = "700 12px system-ui, sans-serif";
        const bezet: [number, number, number, number][] = [];
        const vrij = (x: number, y: number, b: number, h: number) =>
          !bezet.some(([x2, y2, b2, h2]) => x < x2 + b2 && x + b > x2 && y < y2 + h2 && y + h > y2);
        const lijst = gekozen ? [gekozen, ...data.scholen] : data.scholen;
        for (const s of lijst) {
          if (!zichtbaar(s)) continue;
          if (s !== gekozen && s.id === gekozen?.id) continue;
          const [sx, sy] = naarScherm(s.x, s.y);
          if (sx < 0 || sy < 0 || sx > breed || sy > hoog) continue;
          const b = ctx.measureText(s.naam).width + 6;
          const lx = sx + r + 4;
          const ly = sy - 8;
          if (!vrij(lx, ly, b, 16)) continue;
          bezet.push([lx, ly, b, 16]);
          ctx.fillStyle = s === gekozen ? "#ffd447" : "rgba(236, 244, 255, 0.82)";
          ctx.fillText(s.naam, lx, sy + 4);
        }
      }

      if (gekozen) {
        const [sx, sy] = naarScherm(gekozen.x, gekozen.y);
        ctx.fillStyle = kleurVan(gekozen.toets);
        ctx.beginPath();
        ctx.arc(sx, sy, r + 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sx, sy, r + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 207, 77, 0.6)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(sx, sy, r + 11, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [data, gekozen, naarScherm, zichtbaar]);

  /* Maat van het doek volgen. */
  useEffect(() => {
    const c = doek.current;
    if (!c) return;
    const meet = () => {
      const { width, height } = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(width * dpr);
      c.height = Math.round(height * dpr);
      const schaal = Math.min(width / (NL.maxX - NL.minX), height / (NL.maxY - NL.minY));
      maat.current = {
        breed: width,
        hoog: height,
        schaal,
        dx: (width - (NL.maxX - NL.minX) * schaal) / 2,
        dy: (height - (NL.maxY - NL.minY) * schaal) / 2,
      };
      teken();
    };
    meet();
    const r = new ResizeObserver(meet);
    r.observe(c);
    return () => r.disconnect();
  }, [teken]);

  useEffect(() => teken(), [teken]);

  /* Zoomen rond een punt op het scherm. */
  const zoom = useCallback(
    (factor: number, px: number, py: number) => {
      const b = beeld.current;
      const k = Math.min(MAX_ZOOM, Math.max(1, b.k * factor));
      const f = k / b.k;
      beeld.current = { k, tx: px - (px - b.tx) * f, ty: py - (py - b.ty) * f };
      if (k === 1) beeld.current = { k: 1, tx: 0, ty: 0 };
      teken();
    },
    [teken],
  );

  const vliegNaar = useCallback(
    (s: KaartSchool, k = 16) => {
      const m = maat.current;
      const bx = m.dx + (s.x - NL.minX) * m.schaal;
      const by = m.dy + (NL.maxY - s.y) * m.schaal;
      beeld.current = { k, tx: m.breed / 2 - bx * k, ty: m.hoog / 2 - by * k };
      teken();
    },
    [teken],
  );

  /* De dichtstbijzijnde zichtbare school bij een schermpunt. */
  const dichtstbij = useCallback(
    (px: number, py: number, binnen = 14): KaartSchool | null => {
      if (!data) return null;
      let beste: KaartSchool | null = null;
      let afstand = binnen * binnen;
      for (const s of data.scholen) {
        if (!zichtbaar(s)) continue;
        const [sx, sy] = naarScherm(s.x, s.y);
        const d = (sx - px) ** 2 + (sy - py) ** 2;
        if (d < afstand) {
          afstand = d;
          beste = s;
        }
      }
      return beste;
    },
    [data, naarScherm, zichtbaar],
  );

  /* Slepen, knijpen, tikken. */
  useEffect(() => {
    const c = doek.current;
    if (!c) return;
    const wijzers = new Map<number, { x: number; y: number }>();
    let start: { x: number; y: number; t: number } | null = null;
    let gesleept = false;
    let knijpAfstand = 0;

    const punt = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const neer = (e: PointerEvent) => {
      c.setPointerCapture(e.pointerId);
      const p = punt(e);
      wijzers.set(e.pointerId, p);
      if (wijzers.size === 1) {
        start = { ...p, t: Date.now() };
        gesleept = false;
      } else if (wijzers.size === 2) {
        const [a, b] = [...wijzers.values()];
        knijpAfstand = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const beweeg = (e: PointerEvent) => {
      const p = punt(e);
      const vorige = wijzers.get(e.pointerId);
      if (!vorige) {
        if (e.pointerType === "mouse") {
          const s = dichtstbij(p.x, p.y, 10);
          zetZweef(s ? { school: s, x: p.x, y: p.y } : null);
          c.style.cursor = s ? "pointer" : "grab";
        }
        return;
      }
      wijzers.set(e.pointerId, p);
      if (wijzers.size === 2) {
        const [a, b] = [...wijzers.values()];
        const nieuw = Math.hypot(a.x - b.x, a.y - b.y);
        if (knijpAfstand > 0) zoom(nieuw / knijpAfstand, (a.x + b.x) / 2, (a.y + b.y) / 2);
        knijpAfstand = nieuw;
        gesleept = true;
        return;
      }
      const dx = p.x - vorige.x;
      const dy = p.y - vorige.y;
      if (start && Math.hypot(p.x - start.x, p.y - start.y) > 4) gesleept = true;
      if (beeld.current.k > 1) {
        beeld.current = { ...beeld.current, tx: beeld.current.tx + dx, ty: beeld.current.ty + dy };
        teken();
      }
      zetZweef(null);
    };
    const op = (e: PointerEvent) => {
      const p = punt(e);
      wijzers.delete(e.pointerId);
      if (wijzers.size === 0 && start && !gesleept) {
        const s = dichtstbij(p.x, p.y, e.pointerType === "mouse" ? 12 : 20);
        if (s) {
          zetGekozen(s);
          if (beeld.current.k < 8) vliegNaar(s, 10);
        }
      }
      if (wijzers.size === 0) start = null;
    };
    const wiel = (e: WheelEvent) => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      zoom(Math.exp(-e.deltaY * 0.0018), e.clientX - r.left, e.clientY - r.top);
    };
    const dubbel = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      zoom(2.2, e.clientX - r.left, e.clientY - r.top);
    };
    const weg = () => zetZweef(null);

    c.addEventListener("pointerdown", neer);
    c.addEventListener("pointermove", beweeg);
    c.addEventListener("pointerup", op);
    c.addEventListener("pointercancel", op);
    c.addEventListener("pointerleave", weg);
    c.addEventListener("wheel", wiel, { passive: false });
    c.addEventListener("dblclick", dubbel);
    return () => {
      c.removeEventListener("pointerdown", neer);
      c.removeEventListener("pointermove", beweeg);
      c.removeEventListener("pointerup", op);
      c.removeEventListener("pointercancel", op);
      c.removeEventListener("pointerleave", weg);
      c.removeEventListener("wheel", wiel);
      c.removeEventListener("dblclick", dubbel);
    };
  }, [dichtstbij, teken, vliegNaar, zoom]);

  /* Zoeken: naam, plaats of postcode. Naam die begint met de zoekterm eerst. */
  const resultaten = useMemo(() => {
    const q = zoekvorm(zoekterm);
    if (!data || q.length < 2) return [];
    const woorden = q.split(" ");
    const gevonden: { s: KaartSchool; score: number }[] = [];
    for (const s of data.scholen) {
      if (!woorden.every((w) => s.zoek.includes(w))) continue;
      const naam = zoekvorm(s.naam);
      gevonden.push({ s, score: naam.startsWith(q) ? 0 : zoekvorm(s.plaats).startsWith(woorden[0]) ? 1 : 2 });
    }
    gevonden.sort((a, b) => a.score - b.score || a.s.naam.localeCompare(b.s.naam, "nl"));
    return gevonden.slice(0, 40).map((g) => g.s);
  }, [data, zoekterm]);

  function kies(s: KaartSchool) {
    zetGekozen(s);
    vliegNaar(s);
  }

  function wissel(sleutel: string) {
    zetUit((oud) => {
      const nieuw = new Set(oud);
      if (nieuw.has(sleutel)) nieuw.delete(sleutel);
      else nieuw.add(sleutel);
      return nieuw;
    });
  }

  const aantalZichtbaar = data ? data.scholen.filter(zichtbaar).length : 0;

  return (
    <div className="st-kaartapp">
      <aside className="st-kaartpaneel st-glas" aria-label="Zoek een school">
        {gekozen && data ? (
          <Schoolpaneel key={gekozen.id} school={gekozen} data={data} onSluit={() => zetGekozen(null)} />
        ) : (
          <>
            <label htmlFor="st-zoek" className="st-zoeklabel">
              Zoek de school van je kind
            </label>
            <div className="st-zoekveld">
              <IcoonZoek />
              <input
                id="st-zoek"
                type="search"
                placeholder="Naam, plaats of postcode"
                autoComplete="off"
                value={zoekterm}
                onChange={(e) => zetZoekterm(e.target.value)}
                aria-describedby="st-zoekuitleg"
              />
            </div>
            <p id="st-zoekuitleg" className="st-zoekuitleg" aria-live="polite">
              {fout
                ? "De kaart kon niet worden geladen. Probeer het later nog eens."
                : !data
                  ? "Scholen laden…"
                  : zoekterm.trim().length < 2
                    ? `${aantalZichtbaar.toLocaleString("nl-NL")} scholen op de kaart. Typ minstens twee letters.`
                    : resultaten.length === 0
                      ? "Geen school gevonden. Probeer de plaats of de postcode."
                      : `${resultaten.length === 40 ? "40+" : resultaten.length} ${resultaten.length === 1 ? "school" : "scholen"} gevonden`}
            </p>
            {resultaten.length > 0 && (
              <ul className="st-zoeklijst">
                {resultaten.map((s) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => kies(s)}>
                      <i style={{ background: kleurVan(s.toets) }} aria-hidden="true" />
                      <span>
                        <b>{s.naam}</b>
                        <span>
                          {s.adres}, {s.plaats}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <fieldset className="st-filter">
              <legend>Doorstroomtoets</legend>
              {TOETSGROEPEN.map((g) => (
                <label key={g.sleutel}>
                  <input type="checkbox" checked={!uit.has(g.sleutel)} onChange={() => wissel(g.sleutel)} />
                  <i style={{ background: kleurVan(g.codes[0]) }} aria-hidden="true" />
                  {g.naam}
                </label>
              ))}
            </fieldset>
          </>
        )}
      </aside>

      <div ref={vak} className="st-kaartvlak st-glas">
        <canvas ref={doek} className="st-kaartdoek" aria-hidden="true" />
        <div className="st-kaartknoppen">
          <button type="button" aria-label="Inzoomen" onClick={() => zoom(1.8, maat.current.breed / 2, maat.current.hoog / 2)}>
            +
          </button>
          <button type="button" aria-label="Uitzoomen" onClick={() => zoom(1 / 1.8, maat.current.breed / 2, maat.current.hoog / 2)}>
            −
          </button>
          <button
            type="button"
            aria-label="Heel Nederland"
            onClick={() => {
              beeld.current = { k: 1, tx: 0, ty: 0 };
              teken();
            }}
          >
            NL
          </button>
        </div>
        {zweef && (
          <div className="st-kaarttip" style={{ left: zweef.x, top: zweef.y }} aria-hidden="true">
            <b>{zweef.school.naam}</b>
            <span>{zweef.school.plaats}</span>
          </div>
        )}
        {!data && !fout && <p className="st-kaartladen">Kaart laden…</p>}
      </div>
    </div>
  );
}

function Schoolpaneel({ school, data, onSluit }: { school: KaartSchool; data: Kaartdata; onSluit: () => void }) {
  const [methode, zetMethode] = useState<Methode | null>(null);
  const [doel, zetDoel] = useState<Doel>("streef");
  const kop = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let weg = false;
    fetch(`/scholen/methode?id=${encodeURIComponent(school.id)}`)
      .then((r) => r.json())
      .then((m) => !weg && zetMethode(m))
      .catch(() => {});
    kop.current?.focus();
    return () => {
      weg = true;
    };
  }, [school.id]);

  const toets = school.toets ? data.toetsen[school.toets] : null;
  const toetsnaam = toets === "Leerling in Beeld" ? "Leerling in Beeld (Cito)" : toets;

  return (
    <div className="st-schoolpaneel">
      <button type="button" className="st-paneelterug" onClick={onSluit}>
        <IcoonKruis /> Andere school zoeken
      </button>
      <p className="st-boventitel">
        {school.denominatie} · {school.provincie}
      </p>
      <h2 ref={kop} tabIndex={-1} className="st-titel st-schoolnaam">
        {school.naam}
      </h2>
      <p className="st-schooladres">
        {school.adres}, {school.postcode} {school.plaats}
        {school.website && (
          <>
            {" · "}
            <a href={`https://${school.website}`} target="_blank" rel="noopener noreferrer">
              Website
            </a>
          </>
        )}
      </p>

      <div className="st-schoolblok">
        <h3>
          <IcoonSchool /> Methode
        </h3>
        {!methode ? (
          <p className="st-stil">Even kijken…</p>
        ) : methode.methode ? (
          <p>
            <b>Rekenen: {methode.methode.naam}</b>
            <span className="st-stand" data-stand={methode.herkomst}>
              {methode.herkomst === "geverifieerd"
                ? "Gecontroleerd"
                : `Doorgegeven door ${methode.aantalOpgaven === 1 ? "een ouder" : `${methode.aantalOpgaven} ouders`}`}
            </span>
          </p>
        ) : (
          <p className="st-stil">
            De methode van deze school is nog niet bekend. Koppel de school aan je kind en geef hem in twee klikken door.
          </p>
        )}
      </div>

      <div className="st-schoolblok">
        <h3>
          <IcoonDoel /> Doorstroomtoets
        </h3>
        <p>
          {toetsnaam ? (
            <>
              Deze school neemt de <b>{toetsnaam}</b> af.
            </>
          ) : (
            "Over deze school zijn bij DUO geen toetsgegevens bekend."
          )}
        </p>
      </div>

      {(school.rekenen || school.lezen || school.taalverzorging) && (
        <div className="st-schoolblok">
          <h3>Wat leerlingen hier halen ({data.peiljaar})</h3>
          <fieldset className="st-doelkeuze">
            <legend>Ons doel voor ons kind</legend>
            <label>
              <input type="radio" name="doel" checked={doel === "basis"} onChange={() => zetDoel("basis")} />
              Basis (1F)
            </label>
            <label>
              <input type="radio" name="doel" checked={doel === "streef"} onChange={() => zetDoel("streef")} />
              Streefniveau (2F of 1S)
            </label>
          </fieldset>
          <Uitslagbalk naam="Rekenen" niveau={doel === "basis" ? "1F" : "1S"} u={school.rekenen} landelijk={data.landelijk.rekenen} doel={doel} />
          <Uitslagbalk naam="Lezen" niveau={doel === "basis" ? "1F" : "2F"} u={school.lezen} landelijk={data.landelijk.lezen} doel={doel} />
          <Uitslagbalk
            naam="Taalverzorging"
            niveau={doel === "basis" ? "1F" : "2F"}
            u={school.taalverzorging}
            landelijk={data.landelijk.taalverzorging}
            doel={doel}
          />
          <p className="st-voetnoot">
            Deel van de leerlingen in groep 8 dat dit niveau haalde; het streepje is het landelijk gemiddelde. Bron: DUO.
            &ldquo;Ongeveer&rdquo;: DUO schermt aantallen onder de vijf af.
          </p>
        </div>
      )}

      <Link
        prefetch={false}
        href={`/ouder/school?zoek=${encodeURIComponent(`${school.naam} ${school.plaats}`)}`}
        className="st-knop st-knop-goud st-paneelknop"
      >
        Koppel deze school aan mijn kind
        <IcoonPijl />
      </Link>
    </div>
  );
}

function Uitslagbalk({
  naam,
  niveau,
  u,
  landelijk,
  doel,
}: {
  naam: string;
  niveau: string;
  u: Uitslag | null;
  landelijk: [number, number];
  doel: Doel;
}) {
  const index = doel === "basis" ? 0 : 1;
  if (!u) {
    return (
      <div className="st-uitslag">
        <span className="st-uitslag-naam">
          {naam} <small>{niveau}</small>
        </span>
        <span className="st-stil">geen gegevens</span>
      </div>
    );
  }
  const waarde = u[index];
  const land = landelijk[index];
  return (
    <div className="st-uitslag">
      <span className="st-uitslag-naam">
        {naam} <small>{niveau}</small>
      </span>
      <span className="st-balk" role="img" aria-label={`${u[2] ? "ongeveer " : ""}${waarde}% haalt ${niveau}, landelijk ${land}%`}>
        <span style={{ width: `${waarde}%` }} data-boven={waarde >= land ? "ja" : "nee"} />
        <i style={{ left: `${land}%` }} />
      </span>
      <span className="st-uitslag-getal">
        {u[2] ? "±" : ""}
        {waarde}%
      </span>
    </div>
  );
}
