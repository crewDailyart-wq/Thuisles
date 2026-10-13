/** Alleen een tijdelijke lokale preview. Geen productieaccount/database, geen content-seed. */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const uit = path.resolve("preview-artifacts");
await mkdir(uit, { recursive: true });
const tijdelijk = await mkdtemp(path.join(tmpdir(), "zappie-ui-"));
const poort = 4317;
const basis = `http://127.0.0.1:${poort}`;
const env = { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1", THUISLES_DB: path.join(tijdelijk, "preview.db") };
for (const naam of ["THUISLES_WACHTWOORD", "THUISLES_GEBRUIKER", "THUISLES_GODOT", "THUISLES_URL"]) delete env[naam];
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(poort), "-H", "127.0.0.1"], { env, stdio: ["ignore", "pipe", "pipe"] });
let log = "";
server.stdout.on("data", (d) => { log += d.toString(); });
server.stderr.on("data", (d) => { log += d.toString(); });
const rapport = { tijd: new Date().toISOString(), schermen: [], controles: [], fouten: [], opmerkingen: ["Geen productiegegevens gebruikt. Alleen bestaande lege/gastweergave.", "Screenshots met minder beweging; animatiebediening afzonderlijk gecontroleerd.", "WebGL op de CI-runner kan softwarematig werken. Dit meet geen prestaties op een echte schooltablet."] };
let browser;
try {
  let klaar = false;
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(`${basis}/zappie`)).ok) { klaar = true; break; } } catch { /* start */ }
    if (server.exitCode !== null) throw new Error(`Previewserver stopte: ${server.exitCode}`);
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(klaar, "De previewserver moet starten");
  browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [naam, width, height] of [["desktop", 1440, 1000], ["tablet", 1024, 768], ["mobiel", 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", locale: "nl-NL" });
    const pagina = await context.newPage();
    pagina.on("pageerror", (e) => rapport.fouten.push(`${naam}: ${e.message}`));
    await pagina.goto(`${basis}/zappie`, { waitUntil: "networkidle" });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.locator("#vrij-oefenen").waitFor();
    await pagina.locator("#zappies-atelier").waitFor();
    const totaal = await pagina.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < totaal; y += height * .75) {
      await pagina.evaluate((top) => window.scrollTo(0, top), y);
      await pagina.waitForTimeout(130);
    }
    await pagina.evaluate(() => window.scrollTo(0, 0));
    await pagina.waitForTimeout(350);
    for (const item of await pagina.locator(".zp-menu a").all()) {
      const vrij = await item.evaluate(el => {
        const r = el.getBoundingClientRect();
        return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest("a") === el;
      });
      assert.ok(vrij, `${naam}: menuknop ${await item.innerText()} wordt niet bedekt`);
    }
    await pagina.screenshot({ path: path.join(uit, `${naam}-start.png`) });
    const saldoVoor = await pagina.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith("zappie:v1")).map(k => [k,localStorage.getItem(k)])));
    const breedte = await pagina.evaluate(() => ({ inhoud: document.documentElement.scrollWidth, venster: innerWidth, hoogte: document.documentElement.scrollHeight, viewport: innerHeight }));
    assert.ok(breedte.inhoud <= breedte.venster + 2, `${naam}: geen horizontale overflow (${JSON.stringify(breedte)})`);
    assert.ok(breedte.hoogte > breedte.viewport * 1.7, `${naam}: homepage is echt scrollbaar`);
    assert.equal(await pagina.locator(".zs-vak").count(), 9);
    assert.equal(await pagina.locator('.zs-vak[href="/rekenen"]').count(), 1);
    await pagina.locator('#vrij-oefenen').evaluate(el => el.scrollIntoView({block:"start"}));
    await pagina.waitForTimeout(300);
    const vakkenBeeld = await pagina.screenshot({ path: path.join(uit, `${naam}-vrij-oefenen.png`) });
    // Controleer ook de werkelijk getekende pixels. Een transparante decorlaag
    // kan knoppen visueel bedekken terwijl elementFromPoint nog steeds slaagt.
    const rozeTegel = pagina.locator('.zs-vak[data-kleur="rood"]').first();
    const vakRand = await rozeTegel.boundingBox();
    const kleur = await pagina.evaluate(async ({ png, x, y }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      const doek = document.createElement('canvas');
      doek.width = img.width; doek.height = img.height;
      const ctx = doek.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return Array.from(ctx.getImageData(x, y, 1, 1).data);
    }, { png: vakkenBeeld.toString('base64'), x: Math.floor(vakRand.x + vakRand.width * .12), y: Math.floor(vakRand.y + vakRand.height * .58) });
    assert.ok(kleur[0] > kleur[2], `${naam}: de roze tegel moet zichtbaar zijn, niet overschilderd door blauwe ruimte (${kleur})`);
    const rekenknop = pagina.locator('.zs-vak[href="/rekenen"]');
    await rekenknop.scrollIntoViewIfNeeded();
    assert.ok(await rekenknop.evaluate(el => {
      const r = el.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width/2,r.y + r.height/2)?.closest("a") === el;
    }), "De eerste vaktegel is niet bedekt");
    await pagina.getByRole("button", { name: "Geschiedenis, binnenkort", exact: true }).click();
    assert.match(await pagina.locator(".zs-vakbericht").innerText(), /komt binnenkort/);
    await pagina.getByRole("button", { name: /^Vliegtuig/ }).click();
    assert.equal(await pagina.locator(".zs-bouwplan h4").innerText(), "Vliegtuig");
    await pagina.getByRole("button", { name: "Petjes", exact: true }).click();
    assert.equal(await pagina.locator(".zs-product").count(), 2);
    await pagina.getByRole("button", { name: "Sterrenkroon passen", exact: true }).click();
    assert.equal(await pagina.locator(".zs-pasrobot .zs-gepast-kroon").count(), 1);
    await pagina.locator(".zs-pasrobot").scrollIntoViewIfNeeded();
    await pagina.screenshot({ path: path.join(uit, `${naam}-kroon-passen.png`) });
    await pagina.getByRole("button", { name: "Terug naar je eigen Zappie", exact: true }).click();
    assert.equal(await pagina.locator(".zs-pasrobot .zs-gepast").count(), 0);
    await pagina.getByRole("button", { name: "Alles", exact: true }).click();
    await pagina.getByRole("button", { name: "Oceaanblauw passen", exact: true }).click();
    const stop = await pagina.locator('.zs-pasrobot radialGradient[id$="-wit"] stop').nth(1).evaluate((el) => getComputedStyle(el).stopColor);
    assert.equal(stop, "rgb(105, 207, 250)", "De kleur wordt op het robotlichaam toegepast");
    await pagina.screenshot({ path: path.join(uit, `${naam}-atelier-passen.png`) });
    await pagina.getByRole("button", { name: "Terug naar je eigen Zappie", exact: true }).click();
    for (const href of ["/rekenen", "/meer", "/profiel", "/zappie/mijn-wereld", "/zappie/beloningen"]) assert.ok(await pagina.locator(`a[href="${href}"]`).count(), `Route behouden: ${href}`);
    const saldoNa = await pagina.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith("zappie:v1")).map(k => [k,localStorage.getItem(k)])));
    assert.deepEqual(saldoNa, saldoVoor, "Passen en bouwplannen wijzigen de opgeslagen voortgang niet");
    await pagina.getByRole("button", { name: /^Onderzeeër/ }).click();
    await pagina.evaluate(() => window.scrollTo(0, 0));
    await pagina.waitForTimeout(350);
    // fullPage verandert tijdelijk de afmetingen van de compositor. Daarom is
    // dit de LAATSTE opname in deze browsercontext, na alle viewportcontroles.
    await pagina.screenshot({ path: path.join(uit, `${naam}-hele-pagina.png`), fullPage: true });
    rapport.schermen.push({ naam, width, height, ...breedte, status: "geslaagd" });
    await context.close();
  }
  const beweging = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const p = await beweging.newPage();
  p.on("pageerror", (e) => rapport.fouten.push(`beweging: ${e.message}`));
  await p.goto(`${basis}/zappie`, { waitUntil: "networkidle" });
  await p.getByRole("button", { name: "Beweging uit", exact: true }).click();
  await p.waitForFunction(() => document.querySelector('.zp')?.getAttribute("data-beweging") === "rustig");
  await p.getByRole("button", { name: "Beweging aan", exact: true }).click();
  await p.waitForFunction(() => document.querySelector('.zp')?.getAttribute("data-beweging") === "aan");
  await p.evaluate(() => document.querySelector("#zappies-atelier").scrollIntoView());
  await p.waitForTimeout(800);
  const positie = await p.locator(".zp").evaluate((el) => Number(el.style.getPropertyValue("--zr-scroll")));
  assert.ok(positie > .5, `Scroll stuurt de reis: ${positie}`);
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.waitForFunction(() => document.querySelector('.zp')?.getAttribute("data-beweging") === "rustig");
  rapport.controles.push("Desktop/tablet/mobiel: scroll, geen horizontale overflow, negen vakken, geen nep-beschikbaarheid", "Menuknoppen bereikbaar en roze vaktegel zichtbaar in de daadwerkelijke pixels", "Bouwplanselectie werkt; bestaande routes behouden", "Filters, petjes/kroon/kleur passen en herstellen werken; opgeslagen voortgang blijft gelijk", "Beweging handmatig pauzeren/hervatten en systeemvoorkeur tijdens bezoek wijzigen werken", `Scrollstand bereikt ${positie}`);
  await beweging.close();
  assert.equal(rapport.fouten.length, 0, "Geen JavaScript-paginafouten");
} catch (e) {
  rapport.fouten.push(e.stack || String(e));
  process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await writeFile(path.join(uit, "testrapport.json"), JSON.stringify(rapport, null, 2));
  await writeFile(path.join(uit, "preview-server.log"), log);
  await rm(tijdelijk, { recursive: true, force: true }).catch(() => {});
  console.log(JSON.stringify(rapport, null, 2));
}
