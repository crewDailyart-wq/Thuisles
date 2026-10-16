/**
 * Tesla's pen: bouwstenen voor tekeningen die er met de hand getekend uitzien.
 *
 * Wat een mens doet en een computer niet: lijnen schieten een paar pixels
 * door, cirkels sluiten net niet (of iets te ver), niets is helemaal recht.
 * Alles is "toevallig" met een vast zaadgetal, zodat de tekening bij elk
 * bezoek precies hetzelfde is.
 *
 * Elk lijnstuk krijgt pathLength=1, zodat Bouwtekening.tsx de tekening zich
 * lijn voor lijn kan laten tekenen (stroke-dashoffset van 1 naar 0).
 */

type Punt = [number, number];

export function maakToeval(zaad: number) {
  let z = Math.max(1, Math.floor(zaad * 9973) % 2147483646);
  return () => {
    z = (z * 16807) % 2147483647;
    return (z - 1) / 2147483646;
  };
}

const f = (n: number) => n.toFixed(1);

/** Een vloeiende lijn door punten (Catmull-Rom), eventueel gesloten. */
export function vloeiend(punten: Punt[], gesloten = false) {
  const p = gesloten ? [punten[punten.length - 1], ...punten, punten[0], punten[1]] : [punten[0], ...punten, punten[punten.length - 1]];
  let d = `M${f(p[1][0])} ${f(p[1][1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const c1: Punt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Punt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** Rechte stukken met een tikje speling; begin en eind schieten iets door. */
export function lijn(punten: Punt[], zaad: number, speling = 0.8, door = 3) {
  const r = maakToeval(zaad);
  const p = punten.map(([x, y]) => [x + (r() - 0.5) * speling * 2, y + (r() - 0.5) * speling * 2] as Punt);
  const verleng = (a: Punt, b: Punt, lengte: number): Punt => {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const l = Math.hypot(dx, dy) || 1;
    return [a[0] + (dx / l) * lengte, a[1] + (dy / l) * lengte];
  };
  if (p.length >= 2 && door > 0) {
    p[0] = verleng(p[0], p[1], door * (0.4 + r()));
    p[p.length - 1] = verleng(p[p.length - 1], p[p.length - 2], door * (0.4 + r()));
  }
  return `M${p.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}`;
}

/** Een cirkel uit de vrije hand: iets scheef en net niet precies dicht. */
export function kring(cx: number, cy: number, rx: number, zaad: number, ry = rx) {
  const r = maakToeval(zaad);
  const start = r() * Math.PI * 2;
  const extra = 0.18 + r() * 0.25;
  const n = Math.max(10, Math.round(rx / 2.2));
  const punten: Punt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = start + (i / n) * (Math.PI * 2 + extra);
    const w = 1 + (r() - 0.5) * 0.035;
    punten.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
  }
  return vloeiend(punten);
}

/** Een afgeronde rechthoek uit de vrije hand. */
export function blok(x: number, y: number, b: number, h: number, ronding: number, zaad: number) {
  const r = maakToeval(zaad);
  const punten: Punt[] = [];
  const hoek = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 3; i++) {
      const a = a0 + (i / 3) * (Math.PI / 2);
      punten.push([cx + Math.cos(a) * ronding + (r() - 0.5), cy + Math.sin(a) * ronding + (r() - 0.5)]);
    }
  };
  hoek(x + b - ronding, y + ronding, -Math.PI / 2);
  hoek(x + b - ronding, y + h - ronding, 0);
  hoek(x + ronding, y + h - ronding, Math.PI / 2);
  hoek(x + ronding, y + ronding, Math.PI);
  /* Iets voorbij het beginpunt eindigen: de pen stopt niet precies. */
  punten.push([punten[0][0] + 4, punten[0][1] + (r() - 0.5)]);
  return vloeiend(punten);
}

/** Een lijnstuk van de tekening; tekent zichzelf als de scène opent. */
export function L({ d, dik = 2, className, gestippeld }: { d: string; dik?: number; className?: string; gestippeld?: boolean }) {
  return <path d={d} pathLength={1} strokeWidth={dik} className={`bt-l${gestippeld ? " bt-stippel" : ""}${className ? ` ${className}` : ""}`} />;
}

/** Handgeschreven tekst in Tesla's blokletters. */
export function Schrift({ x, y, children, grootte = 12, anker = "start", draai = 0, className }: { x: number; y: number; children: React.ReactNode; grootte?: number; anker?: "start" | "middle" | "end"; draai?: number; className?: string }) {
  return (
    <text x={x} y={y} fontSize={grootte} textAnchor={anker} transform={draai ? `rotate(${draai} ${x} ${y})` : undefined} className={`bt-schrift${className ? ` ${className}` : ""}`}>
      {children}
    </text>
  );
}

/**
 * Een maatlijn zoals op een bouwtekening: hulplijntjes, schuine streepjes aan
 * de uiteinden en de maat in het midden.
 */
export function Maat({ van, tot, tekst, zaad, afstand = 0 }: { van: Punt; tot: Punt; tekst: string; zaad: number; afstand?: number }) {
  const dx = tot[0] - van[0];
  const dy = tot[1] - van[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  const a: Punt = [van[0] + nx * afstand, van[1] + ny * afstand];
  const b: Punt = [tot[0] + nx * afstand, tot[1] + ny * afstand];
  const streep = (p: Punt, z: number) => lijn([[p[0] - 4, p[1] + 4], [p[0] + 4, p[1] - 4]], z, 0.3, 0);
  const hoek = (Math.atan2(dy, dx) * 180) / Math.PI;
  const mx = (a[0] + b[0]) / 2 + nx * 8;
  const my = (a[1] + b[1]) / 2 + ny * 8;
  const leesbaar = hoek > 90 || hoek < -90 ? hoek + 180 : hoek;
  return (
    <g className="bt-maat">
      {afstand !== 0 && <L d={lijn([van, [a[0] + nx * 3, a[1] + ny * 3]], zaad + 1, 0.3, 0)} dik={0.8} />}
      {afstand !== 0 && <L d={lijn([tot, [b[0] + nx * 3, b[1] + ny * 3]], zaad + 2, 0.3, 0)} dik={0.8} />}
      <L d={lijn([a, b], zaad, 0.4, 5)} dik={0.9} />
      <L d={streep(a, zaad + 3)} dik={1.1} />
      <L d={streep(b, zaad + 4)} dik={1.1} />
      <Schrift x={mx} y={my} anker="middle" grootte={13} draai={leesbaar} className="bt-maattekst">
        {tekst}
      </Schrift>
    </g>
  );
}

/** Een pijltje met een schuin kopje aan het eind. */
export function Pijl({ punten, zaad, dik = 1.3 }: { punten: Punt[]; zaad: number; dik?: number }) {
  const eind = punten[punten.length - 1];
  const voor = punten[punten.length - 2];
  const a = Math.atan2(eind[1] - voor[1], eind[0] - voor[0]);
  const kop = (da: number): Punt => [eind[0] - Math.cos(a + da) * 9, eind[1] - Math.sin(a + da) * 9];
  return (
    <g>
      <L d={punten.length > 2 ? vloeiend(punten) : lijn(punten, zaad, 0.5, 0)} dik={dik} />
      <L d={lijn([kop(0.45), eind, kop(-0.45)], zaad + 1, 0.3, 0)} dik={dik} />
    </g>
  );
}

/** Een tandwiel: tanden rond een steekcirkel, met naaf en gaten. */
export function tandwiel(cx: number, cy: number, straal: number, tanden: number, zaad: number) {
  const r = maakToeval(zaad);
  const punten: Punt[] = [];
  const hoogte = Math.max(5, straal * 0.12);
  for (let i = 0; i < tanden; i++) {
    const a = (i / tanden) * Math.PI * 2;
    const w = (Math.PI * 2) / tanden;
    const op = (ra: number, da: number): Punt => [cx + Math.cos(a + da) * ra + (r() - 0.5) * 0.8, cy + Math.sin(a + da) * ra + (r() - 0.5) * 0.8];
    punten.push(op(straal - hoogte, -w * 0.5), op(straal - hoogte, -w * 0.28), op(straal + hoogte, -w * 0.17), op(straal + hoogte, w * 0.17), op(straal - hoogte, w * 0.28));
  }
  punten.push(punten[0], [punten[1][0] + 1, punten[1][1] + 1]);
  return `M${punten.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}`;
}

/** Een bliksemschicht van punt a naar punt b, met wat knikken. */
export function bliksem(a: Punt, b: Punt, knikken: number, zaad: number) {
  const r = maakToeval(zaad);
  const punten: Punt[] = [a];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < knikken; i++) {
    const t = i / knikken;
    const uit = (r() - 0.5) * l * 0.35;
    punten.push([a[0] + dx * t + (-dy / l) * uit, a[1] + dy * t + (dx / l) * uit]);
  }
  punten.push(b);
  return `M${punten.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}`;
}
