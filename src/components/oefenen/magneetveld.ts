/** Vrij bouwen met maximaal dertig bolletjes. Geen antwoordlogica of opslag. */
export type Punt = { x: number; y: number };
type Groep = Punt & { id: number; leden: number[]; vorm: Punt[]; pad: SVGPathElement; label: HTMLSpanElement; licht: boolean; nummer: number };
type Bal = Punt & { el: HTMLButtonElement; gestart: boolean };
type Sleep = { pointer: number; bal: number | null; groep: Groep; start: Punt; laatst: Punt; dx: number; dy: number; beweegt: boolean; oudeGroep: Groep | null };
const NS = "http://www.w3.org/2000/svg";

export function magneetvorm(n: number, breedte = Infinity): Punt[] {
  if (n === 1) return [{ x: 0, y: 0 }];
  if (n === 2) return [{ x: -25, y: 0 }, { x: 25, y: 0 }];
  if (n === 3) return [{ x: 0, y: -28.87 }, { x: -25, y: 14.43 }, { x: 25, y: 14.43 }];
  if (n === 4) return [{ x: -25, y: -25 }, { x: 25, y: -25 }, { x: -25, y: 25 }, { x: 25, y: 25 }];
  const punten: Punt[] = [];
  for (let rij = -5; rij <= 5; rij++) for (let kol = -5; kol <= 5; kol++) punten.push({ x: (kol + rij * .5) * 50, y: rij * 43.301 });
  punten.sort((a, b) => a.x * a.x + a.y * a.y - b.x * b.x - b.y * b.y || a.y - b.y || a.x - b.x);
  const vorm = punten.slice(0, n), x = vorm.reduce((s, p) => s + p.x, 0) / n, y = vorm.reduce((s, p) => s + p.y, 0) / n;
  const compact = vorm.map(p => ({ x: p.x - x, y: p.y - y }));
  if (Math.max(...compact.map(p => p.x)) - Math.min(...compact.map(p => p.x)) + 70 <= breedte) return compact;
  // Ook een verkeerd groepje met alle bolletjes blijft binnen een smal speelveld.
  const kolommen = Math.max(1, Math.floor((breedte - 70) / 50) + 1), rijen = Math.ceil(n / kolommen);
  return Array.from({ length: n }, (_, i) => ({ x: ((i % kolommen) - (kolommen - 1) / 2) * 50, y: (Math.floor(i / kolommen) - (rijen - 1) / 2) * 50 }));
}

function omtrek(vorm: Punt[]) {
  const punten: Punt[] = [];
  for (const p of vorm) for (let i = 0; i < 16; i++) punten.push({ x: p.x + 33 * Math.cos(i * Math.PI / 8), y: p.y + 33 * Math.sin(i * Math.PI / 8) });
  punten.sort((a, b) => a.x - b.x || a.y - b.y);
  const kruis = (a: Punt, b: Punt, c: Punt) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const laag: Punt[] = [], hoog: Punt[] = [];
  for (const p of punten) { while (laag.length > 1 && kruis(laag.at(-2)!, laag.at(-1)!, p) <= 0) laag.pop(); laag.push(p); }
  for (const p of [...punten].reverse()) { while (hoog.length > 1 && kruis(hoog.at(-2)!, hoog.at(-1)!, p) <= 0) hoog.pop(); hoog.push(p); }
  return "M" + laag.slice(0, -1).concat(hoog.slice(0, -1)).map(p => `${p.x},${p.y}`).join("L") + "Z";
}

export function startMagneetveld(vak: HTMLDivElement, geheel: number, deler: number, zaad: number, bijWijzig: () => void) {
  if (!Number.isInteger(geheel) || geheel < 1 || geheel > 30) throw new Error("Een magneetveld heeft 1 tot en met 30 bolletjes.");
  let groepen: Groep[] = [], ballen: Bal[] = [], id = 0, breedte = vak.clientWidth, hoogte = vak.clientHeight;
  let gekozen: number | null = null, sleep: Sleep | null = null, uit = false, gestopt = false, zichtbaar = true, laatsteTijd = 0, frame = 0;
  const timers: ReturnType<typeof setTimeout>[] = [], opruimen = new AbortController();
  const minder = matchMedia("(prefers-reduced-motion: reduce)");
  const svg = document.createElementNS(NS, "svg"), pads = document.createElementNS(NS, "g");
  svg.classList.add("magneet-randen"); svg.setAttribute("aria-hidden", "true"); svg.append(pads); vak.append(svg);
  const nummerlaag = document.createElement("div"); vak.append(nummerlaag);
  function binnen(g: Groep) {
    const xs = g.vorm.map(p => p.x), ys = g.vorm.map(p => p.y);
    g.x = Math.max(35 - Math.min(...xs), Math.min(breedte - 35 - Math.max(...xs), g.x));
    g.y = Math.max(35 - Math.min(...ys), Math.min(hoogte - 35 - Math.max(...ys), g.y));
  }
  function maak(leden: number[], x: number, y: number) {
    const pad = document.createElementNS(NS, "path"), label = document.createElement("span"), vorm = magneetvorm(leden.length, breedte);
    const g: Groep = { id: ++id, leden, x, y, vorm, pad, label, licht: false, nummer: 0 };
    pad.classList.add("magneet-rand"); pad.dataset.groep = String(g.id); pad.setAttribute("d", omtrek(vorm)); pad.style.display = leden.length > 1 ? "" : "none"; pads.append(pad);
    label.classList.add("magneet-nummer"); label.setAttribute("aria-hidden", "true"); nummerlaag.append(label); groepen.push(g); binnen(g); return g;
  }
  function verwijder(g: Groep) { groepen = groepen.filter(a => a !== g); g.pad.remove(); g.label.remove(); }
  const zoek = (bal: number) => groepen.find(g => g.leden.includes(bal));
  const plek = (g: Groep, i: number): Punt => ({ x: g.x + g.vorm[i].x, y: g.y + g.vorm[i].y });
  function scheid() {
    for (let a = 0; a < groepen.length; a++) for (let b = a + 1; b < groepen.length; b++) {
      const ga = groepen[a], gb = groepen[b]; if (sleep?.beweegt && (sleep.groep === ga || sleep.groep === gb)) continue;
      let x = 0, y = 0, aantal = 0;
      for (const pa of ga.vorm) for (const pb of gb.vorm) {
        const dx = gb.x + pb.x - ga.x - pa.x, dy = gb.y + pb.y - ga.y - pa.y, d = Math.hypot(dx, dy);
        if (d < 64) { const hoek = d < .001 ? (ga.id + gb.id) * 2.3 : Math.atan2(dy, dx), duw = (64 - d) * .52; x += Math.cos(hoek) * duw; y += Math.sin(hoek) * duw; aantal++; }
      }
      if (aantal) { const vast = sleep?.groep, wa = vast === ga ? 0 : vast === gb ? 1 : .5, wb = vast === gb ? 0 : vast === ga ? 1 : .5; ga.x -= x / aantal * wa; ga.y -= y / aantal * wa; gb.x += x / aantal * wb; gb.y += y / aantal * wb; binnen(ga); binnen(gb); }
    }
    groepen.forEach(binnen);
  }
  function meld() { bijWijzig(); }
  function samen(a: Groep, b: Groep) {
    if (a === b || uit) return a;
    const leden = [...a.leden, ...b.leden], x = a.x, y = a.y; verwijder(a); verwijder(b);
    const g = maak(leden, x, y); gekozen = null; for (let i = 0; i < 30; i++) scheid(); meld(); return g;
  }
  function los(bal: number, p?: Punt) {
    const g = zoek(bal); if (!g || g.leden.length === 1) return g;
    const oud = plek(g, g.leden.indexOf(bal)); verwijder(g); maak(g.leden.filter(n => n !== bal), g.x, g.y);
    gekozen = null; const nieuw = maak([bal], p?.x ?? oud.x, p?.y ?? oud.y); meld(); return nieuw;
  }
  function tik(bal: number) {
    if (uit) return; const g = zoek(bal); if (!g) return;
    if (gekozen === bal) {
      if (g.leden.length > 1) { const p = plek(g, g.leden.indexOf(bal)), dx = p.x - g.x, dy = p.y - g.y, d = Math.hypot(dx, dy) || 1; los(bal, { x: p.x + (dx / d || 1) * 72, y: p.y + dy / d * 72 }); for (let i = 0; i < 60; i++) scheid(); }
      gekozen = null;
    } else if (gekozen !== null) { const a = zoek(gekozen); if (a && a !== g) samen(a, g); else gekozen = bal; }
    else gekozen = bal;
    meld(); teken(.3);
  }
  function raak(g: Groep) {
    let beste: Groep | null = null, afstand = 71;
    for (const ander of groepen) if (ander !== g) for (let i = 0; i < g.leden.length; i++) for (let j = 0; j < ander.leden.length; j++) { const a = plek(g, i), b = plek(ander, j), d = Math.hypot(a.x - b.x, a.y - b.y); if (d < afstand) { afstand = d; beste = ander; } }
    return beste;
  }
  const punt = (e: PointerEvent) => { const r = vak.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  vak.addEventListener("pointerdown", e => {
    if (uit || sleep || e.button !== 0 || !(e.target instanceof Element)) return;
    const bol = e.target.closest<HTMLElement>("[data-bal]"), rand = e.target.closest<SVGPathElement>("[data-groep]");
    if (!bol && !rand) { gekozen = null; return; }
    const bal = bol ? Number(bol.dataset.bal) : null, g = bal !== null ? zoek(bal) : groepen.find(g => g.id === Number(rand?.dataset.groep)); if (!g) return;
    e.preventDefault(); vak.setPointerCapture(e.pointerId); const p = punt(e);
    sleep = { pointer: e.pointerId, bal, groep: g, start: p, laatst: p, dx: p.x - g.x, dy: p.y - g.y, beweegt: false, oudeGroep: null };
  }, { signal: opruimen.signal });
  vak.addEventListener("pointermove", e => {
    if (!sleep || sleep.pointer !== e.pointerId) return; e.preventDefault(); const p = punt(e);
    if (!sleep.beweegt && Math.hypot(p.x - sleep.start.x, p.y - sleep.start.y) > 7) {
      sleep.beweegt = true; vak.dataset.sleep = "true"; gekozen = null; meld();
      if (sleep.bal !== null && sleep.groep.leden.length > 1) { const rest = sleep.groep.leden.filter(i => i !== sleep!.bal); sleep.groep = los(sleep.bal, p)!; sleep.oudeGroep = groepen.find(g => rest.includes(g.leden[0])) ?? null; sleep.dx = sleep.dy = 0; }
    }
    if (sleep.beweegt) { sleep.groep.x = p.x - sleep.dx; sleep.groep.y = p.y - sleep.dy; binnen(sleep.groep); teken(1); } sleep.laatst = p;
  }, { signal: opruimen.signal });
  function einde(e: PointerEvent, annuleren = false) {
    if (!sleep || e.pointerId !== sleep.pointer) return; const s = sleep; sleep = null; vak.dataset.sleep = "false";
    if (vak.hasPointerCapture(e.pointerId)) vak.releasePointerCapture(e.pointerId);
    if (!annuleren && s.beweegt) { let doel = raak(s.groep); if (doel === s.oudeGroep && Math.hypot(s.laatst.x - s.start.x, s.laatst.y - s.start.y) > 28) doel = null; if (doel) samen(doel, s.groep); }
    else if (!annuleren && s.bal !== null) tik(s.bal);
    for (let i = 0; i < 60; i++) scheid(); meld(); teken(.3);
  }
  vak.addEventListener("pointerup", e => einde(e), { signal: opruimen.signal });
  vak.addEventListener("pointercancel", e => einde(e, true), { signal: opruimen.signal });
  vak.addEventListener("dragstart", e => e.preventDefault(), { signal: opruimen.signal });
  function teken(snelheid: number) {
    for (const g of groepen) {
      g.pad.setAttribute("transform", `translate(${g.x} ${g.y})`); g.pad.dataset.licht = String(g.licht); g.label.textContent = g.nummer ? String(g.nummer) : ""; g.label.dataset.zichtbaar = String(g.nummer > 0); g.label.style.transform = `translate(${g.x - 18}px,${g.y - 18}px)`;
      g.leden.forEach((id, i) => { const b = ballen[id], p = plek(g, i); if (!b.gestart) { b.x = p.x; b.y = p.y; b.gestart = true; } else { b.x += (p.x - b.x) * snelheid; b.y += (p.y - b.y) * snelheid; }
        b.el.style.transform = `translate(${b.x - 24}px,${b.y - 24}px)`; b.el.dataset.gekozen = String(gekozen === id); b.el.dataset.licht = String(g.licht); b.el.setAttribute("aria-pressed", String(gekozen === id)); b.el.setAttribute("aria-label", `Bolletje ${id + 1}${g.leden.length > 1 ? ", in een groepje" : ""}`);
      });
    }
  }
  for (let i = 0; i < geheel; i++) {
    const el = document.createElement("button"); el.type = "button"; el.className = "magneet-bal"; el.dataset.bal = String(i); el.draggable = false; el.setAttribute("aria-label", `Bolletje ${i + 1}`); vak.append(el);
    el.addEventListener("click", e => { if (e.detail === 0) tik(i); }, { signal: opruimen.signal }); ballen.push({ el, x: 0, y: 0, gestart: false });
    const hoek = i * 2.399963 + zaad * .73, r = Math.sqrt((i + .6) / geheel); maak([i], breedte / 2 + Math.cos(hoek) * r * (breedte / 2 - 42), hoogte / 2 + Math.sin(hoek) * r * (hoogte / 2 - 42));
  }
  for (let i = 0; i < 100; i++) scheid(); teken(1);
  function stap(t: number) {
    if (gestopt) return; const dt = Math.min(32, t - laatsteTijd || 16); laatsteTijd = t;
    if (zichtbaar) { if (!uit && !minder.matches) for (const g of groepen) { if (sleep?.groep === g || (gekozen !== null && g.leden.includes(gekozen))) continue; g.x += Math.sin(t / 3200 + g.id * 2.399) * dt * .003; g.y += Math.cos(t / 3800 + g.id * 2.399) * dt * .0027; } for (let i = 0; i < 3; i++) scheid(); teken(minder.matches ? 1 : Math.min(1, dt / 60)); }
    frame = requestAnimationFrame(stap);
  }
  frame = requestAnimationFrame(stap);
  const meten = new ResizeObserver(() => { const b = vak.clientWidth, h = vak.clientHeight; if (!b || !h) return; groepen.forEach(g => { g.x = g.x / breedte * b; g.y = g.y / hoogte * h; }); breedte = b; hoogte = h; groepen.forEach(g => { g.vorm = magneetvorm(g.leden.length, breedte); g.pad.setAttribute("d", omtrek(g.vorm)); }); svg.setAttribute("viewBox", `0 0 ${b} ${h}`); for (let i = 0; i < 100; i++) scheid(); teken(1); }); meten.observe(vak);
  const kijken = new IntersectionObserver(es => { zichtbaar = es[0].isIntersecting; }); kijken.observe(vak);
  return {
    klopt: () => groepen.length > 0 && groepen.every(g => g.leden.length === deler),
    zetUit(waarde: boolean) { uit = waarde; if (uit) gekozen = null; ballen.forEach(b => { b.el.disabled = uit; }); },
    telMee(klaar: () => void) {
      const volgorde = [...groepen].sort((a, b) => Math.round(a.y / 100) - Math.round(b.y / 100) || a.x - b.x);
      volgorde.forEach((g, i) => timers.push(setTimeout(() => { g.licht = true; g.nummer = i + 1; teken(1); }, minder.matches ? 0 : 350 + i * 650)));
      timers.push(setTimeout(klaar, minder.matches ? 800 : 350 + volgorde.length * 650 + 600));
    },
    stop() { gestopt = true; cancelAnimationFrame(frame); timers.forEach(clearTimeout); opruimen.abort(); meten.disconnect(); kijken.disconnect(); vak.replaceChildren(); groepen = []; ballen = []; },
  };
}
