/**
 * Maakt de plaatjes per lintje voor de lintjeskast in de lichte weergave
 * (19 oktober 2026; telefoon en tablet, zie AtelierPlaatjes.tsx):
 * public/atelier/licht/<breed|smal>-lintje<0-5>-<gekozen|niet>-<open|dicht>-<aan|uit>.webp
 * en LINTJES in src/components/zappie/atelier/plaatjes-data.ts.
 *
 * Elk lintje heeft een paar standen: gekozen of niet (de blauwe ring), open of
 * op slot (het slotje, de kleinere medaille), en de gloed aan of uit. Per stand
 * wordt alleen het stukje rond dat lintje uit een schermfoto van het echte
 * 3D-atelier geknipt; AtelierPlaatjes legt die stukjes precies over het plaatje
 * van de kast.
 *
 * Nodig: Chrome met --remote-debugging-port=9333 en een draaiende site met 3D.
 *   node scripts/maak-atelier-lintjes.mjs http://localhost:3000
 * Draai eerst scripts/maak-atelier-plaatjes.mjs (dezelfde maten).
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const basis = process.argv[2] ?? 'http://localhost:3000';
const uitMap = 'public/atelier/licht';
const VORMEN = { breed: [1440, 900], smal: [390, 844] };
const RAND = 0; // extra ruimte rond elk lintje; het vak uit 3D bevat de onzichtbare tikvlakken al, dus genoeg ruimte voor de gloed (en geen overlap met de buren)

const v = await fetch('http://127.0.0.1:9333/json/version').then((r) => r.json());
const ws = new WebSocket(v.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let n = 0; const wacht = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && wacht.has(m.id)) { const { res, rej } = wacht.get(m.id); wacht.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } });
const st = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; wacht.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId })); });
const pauze = (ms) => new Promise((r) => setTimeout(r, ms));
const js = async (s, expression) => (await st('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, s)).result.value;

/* Welke standen je in welke stap ziet: [lintje, gekozen, open]. */
const STAPPEN = [
  { doe: null, pak: [[0, 1, 1], [1, 0, 1], [2, 0, 1], [3, 0, 0], [4, 0, 0], [5, 0, 0]] },
  { doe: [3], pak: [[3, 1, 0], [0, 0, 1]] },
  { doe: [4], pak: [[4, 1, 0]] },
  { doe: [5], pak: [[5, 1, 0]] },
  { doe: [1], pak: [[1, 1, 1]] },
  { doe: [2], pak: [[2, 1, 1]] },
  { doe: [3, 'open'], pak: [[3, 1, 1]] },
  { doe: [4, 'open'], pak: [[4, 1, 1]] },
  { doe: [5, 'open'], pak: [[5, 1, 1]] },
  { doe: [0], pak: [[3, 0, 1], [4, 0, 1], [5, 0, 1]] },
];

const data = {};
for (const [vorm, [b, h]] of Object.entries(VORMEN)) {
  const { targetId } = await st('Target.createTarget', { url: 'about:blank', newWindow: true });
  const { sessionId: s } = await st('Target.attachToTarget', { targetId, flatten: true });
  await st('Page.enable', {}, s); await st('Network.enable', {}, s); await st('Page.bringToFront', {}, s);
  if (process.env.WW) await st('Network.setExtraHTTPHeaders', { headers: { Authorization: 'Basic ' + Buffer.from('thuisles:' + process.env.WW).toString('base64') } }, s);
  await st('Emulation.setDeviceMetricsOverride', { width: b, height: h, deviceScaleFactor: 1.5, mobile: false }, s);
  await st('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__atelierMaakPlaatjes = true;' }, s);
  await st('Page.navigate', { url: `${basis}/zappie?weergave=vol` }, s);
  await pauze(6000);
  await js(s, `(async()=>{const st=document.createElement('style');st.textContent='.as-footer,.as-badges,.as-mascot,.as-status,nextjs-portal,.zs-bewegingsknop{visibility:hidden!important}';document.head.append(st);for(const el of document.querySelectorAll('body *')){const p=getComputedStyle(el).position;if((p==='fixed'||p==='sticky')&&!el.closest('.as'))el.style.visibility='hidden';}
    const a=document.querySelector('.zs-live-atelier');scrollTo(0,a.getBoundingClientRect().top+scrollY-(innerHeight-a.offsetHeight)/2);
    const t=performance.now();while(document.querySelector('.as')?.dataset.status!=='ready'&&performance.now()-t<30000)await new Promise(r=>setTimeout(r,200));await new Promise(r=>setTimeout(r,1500));
    [...document.querySelectorAll('.as-footer nav button')].find(b=>b.textContent.trim()==='Lintjes').click();await new Promise(r=>setTimeout(r,1500));})()`);
  const vakken = await js(s, 'window.__atelierLintjes()');
  const rechthoeken = vakken.map(([x, y, bb, hh]) => {
    const x0 = Math.max(0, x - bb * RAND), y0 = Math.max(0, y - hh * RAND);
    return [x0, y0, Math.min(100, x + bb * (1 + RAND)) - x0, Math.min(100, y + hh * (1 + RAND)) - y0];
  });
  data[vorm] = rechthoeken.map((r) => r.map((g) => +g.toFixed(3)));
  for (const stap of STAPPEN) {
    if (stap.doe) {
      await js(s, `document.querySelectorAll('.as-badges nav button')[${stap.doe[0]}].click()`);
      await pauze(500);
      if (stap.doe[1] === 'open') await js(s, `document.querySelector('.as-unlock').click()`);
      await pauze(1200);
    }
    for (const gloed of [true, false]) {
      await js(s, `(()=>{const g=document.querySelector('.as-glow');if((g.getAttribute('aria-pressed')==='true')!==${gloed})g.click();})()`);
      await pauze(1000);
      const c = await js(s, `(()=>{const c=document.querySelector('.as-canvas').getBoundingClientRect();return {x:c.left+scrollX,y:c.top+scrollY,b:c.width,h:c.height}})()`);
      const foto = Buffer.from((await st('Page.captureScreenshot', { format: 'png', clip: { x: c.x, y: c.y, width: c.b, height: c.h, scale: 1 } }, s)).data, 'base64');
      const { width: W, height: H } = await sharp(foto).metadata();
      for (const [j, gekozen, open] of stap.pak) {
        const [x, y, bb, hh] = rechthoeken[j];
        const knip = { left: Math.round((x / 100) * W), top: Math.round((y / 100) * H), width: Math.round((bb / 100) * W), height: Math.round((hh / 100) * H) };
        const bestand = path.join(uitMap, `${vorm}-lintje${j}-${gekozen ? 'gekozen' : 'niet'}-${open ? 'open' : 'dicht'}-${gloed ? 'aan' : 'uit'}.webp`);
        await sharp(foto).extract(knip).webp({ quality: 85 }).toFile(bestand);
      }
    }
    console.log(vorm, 'stap', stap.doe ?? 'begin');
  }
  await st('Target.closeTarget', { targetId });
}
ws.close();

const doel = 'src/components/zappie/atelier/plaatjes-data.ts';
let tekst = fs.readFileSync(doel, 'utf8');
const blok = `/** Waar elk lintje staat in het plaatje van de lintjeskast (x, y, breedte, hoogte in procenten); zie scripts/maak-atelier-lintjes.mjs. */\nexport const LINTJES: Record<Vorm, number[][]> = ${JSON.stringify(data)};\n`;
tekst = tekst.includes('export const LINTJES') ? tekst.replace(/\/\*\* Waar elk lintje[\s\S]*$/, blok) : tekst + '\n' + blok;
fs.writeFileSync(doel, tekst);
console.log(doel);
