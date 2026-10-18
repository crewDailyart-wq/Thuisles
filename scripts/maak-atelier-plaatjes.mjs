/**
 * Maakt de plaatjes van het atelier voor de lichte weergave (19 oktober 2026;
 * telefoon, tablet en trage apparaten, zie src/lib/lichte-weergave.ts):
 * public/atelier/licht/<breed|smal>-<knop>-<aan|uit>.webp en
 * src/components/zappie/atelier/plaatjes-data.ts.
 *
 * Het zijn schermfoto's van het echte 3D-atelier, per knop (Het geheel, Het
 * podium, De vitrine, De koepel, Lintjes) met de gloed aan en uit, in een brede
 * vorm (1440 x 900) en een smalle (telefoon, 390 x 844), op 1,5 keer de
 * pixeldichtheid. De knoppen, Bliepo en de rest van de pagina worden voor de
 * foto even verborgen; waar Bliepo staat, wordt uit de 3D-scène overgenomen.
 *
 * Nodig: Chrome met --remote-debugging-port=9333, sharp (zit via Next.js al in
 * node_modules) en een draaiende site met 3D (bijv. npm run dev).
 *   node scripts/maak-atelier-plaatjes.mjs http://localhost:3000
 * Achter het wachtwoordslot: zet het wachtwoord in WW.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const basis = process.argv[2] ?? 'http://localhost:3000';
const uitMap = 'public/atelier/licht';
fs.mkdirSync(uitMap, { recursive: true });
const VIEWS = ['samen', 'podium', 'vitrine', 'koepel', 'lintjes'];
const KNOP = { samen: 'Het geheel', podium: 'Het podium', vitrine: 'De vitrine', koepel: 'De koepel', lintjes: 'Lintjes' };
const VORMEN = { breed: [1440, 900], smal: [390, 844] };

const v = await fetch('http://127.0.0.1:9333/json/version').then((r) => r.json());
const ws = new WebSocket(v.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let n = 0; const wacht = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && wacht.has(m.id)) { const { res, rej } = wacht.get(m.id); wacht.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } });
const st = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; wacht.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId })); });
const pauze = (ms) => new Promise((r) => setTimeout(r, ms));
const js = async (s, expression) => (await st('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, s)).result.value;

const data = {};
for (const [vorm, [b, h]] of Object.entries(VORMEN)) {
  const { targetId } = await st('Target.createTarget', { url: 'about:blank', newWindow: true });
  const { sessionId: s } = await st('Target.attachToTarget', { targetId, flatten: true });
  await st('Page.enable', {}, s); await st('Network.enable', {}, s); await st('Page.bringToFront', {}, s);
  if (process.env.WW) await st('Network.setExtraHTTPHeaders', { headers: { Authorization: 'Basic ' + Buffer.from('thuisles:' + process.env.WW).toString('base64') } }, s);
  await st('Emulation.setDeviceMetricsOverride', { width: b, height: h, deviceScaleFactor: 1.5, mobile: false }, s);
  await st('Page.navigate', { url: `${basis}/zappie?weergave=vol` }, s);
  await pauze(6000);
  await js(s, `(async()=>{const st=document.createElement('style');st.textContent='.as-footer,.as-badges,.as-mascot,.as-status,header,nextjs-portal,.zs-bewegingsknop{visibility:hidden!important}';document.head.append(st);for(const el of document.querySelectorAll('body *')){const p=getComputedStyle(el).position;if((p==='fixed'||p==='sticky')&&!el.closest('.as'))el.style.visibility='hidden';}
    const a=document.querySelector('.zs-live-atelier');scrollTo(0,a.getBoundingClientRect().top+scrollY-(innerHeight-a.offsetHeight)/2);
    const t=performance.now();while(document.querySelector('.as')?.dataset.status!=='ready'&&performance.now()-t<30000)await new Promise(r=>setTimeout(r,200));await new Promise(r=>setTimeout(r,2000));})()`);
  data[vorm] = { views: {} };
  for (const view of VIEWS) {
    await js(s, `[...document.querySelectorAll('.as-footer nav button')].find(b=>b.textContent.trim()==='${KNOP[view]}').click()`);
    await pauze(1500);
    for (const gloed of [true, false]) {
      await js(s, `(()=>{const g=document.querySelector('.as-glow');if((g.getAttribute('aria-pressed')==='true')!==${gloed})g.click();})()`);
      await pauze(1200);
      const r = await js(s, `(()=>{const c=document.querySelector('.as-canvas').getBoundingClientRect();const m=document.querySelector('.as-mascot');const as=document.querySelector('.as').getBoundingClientRect();
        const zicht=m&&m.style.visibility==='visible';
        return {x:c.left+scrollX,y:c.top+scrollY,b:c.width,h:c.height,m:zicht?{x:(parseFloat(m.style.left)-(c.left-as.left))/c.width*100,y:(parseFloat(m.style.top)-(c.top-as.top))/c.height*100,h:parseFloat(m.style.height)/c.height*100}:null};})()`);
      const foto = await st('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.b, height: r.h, scale: 1 } }, s);
      const bestand = path.join(uitMap, `${vorm}-${view}-${gloed ? 'aan' : 'uit'}.webp`);
      const info = await sharp(Buffer.from(foto.data, 'base64')).webp({ quality: 82, effort: 6 }).toFile(bestand);
      if (gloed) data[vorm].views[view] = { breedte: info.width, hoogte: info.height, mascot: r.m && { x: +r.m.x.toFixed(2), y: +r.m.y.toFixed(2), h: +r.m.h.toFixed(2) } };
      console.log(bestand, info.width + 'x' + info.height, Math.round(info.size / 1024) + ' KB');
    }
  }
  await st('Target.closeTarget', { targetId });
}
ws.close();

const regels = (vorm) => `  ${vorm}: {\n${VIEWS.map((w) => `    ${w}: { breedte: ${data[vorm].views[w].breedte}, hoogte: ${data[vorm].views[w].hoogte}, mascot: ${JSON.stringify(data[vorm].views[w].mascot)} },`).join('\n')}\n  },`;
const doel = 'src/components/zappie/atelier/plaatjes-data.ts';
const oud = fs.readFileSync(doel, 'utf8');
const kop = oud.slice(0, oud.indexOf('export const PLAATJES'));
fs.writeFileSync(doel, `${kop}export const PLAATJES: Record<Vorm, Record<StudyView, { breedte: number; hoogte: number; mascot: Plek }>> = {\n${regels('breed')}\n${regels('smal')}\n};\n`);
console.log(doel);
