/** Prototype UI checks: in-memory outfit, fixed cameras, keyboard, mobile, WebGL fallback. */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const dir = 'preview-artifacts/atelier';
await mkdir(dir, { recursive: true });
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '4320'], {
  env: { ...process.env, THUISLES_WACHTWOORD: '', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '', browser;
server.stdout.on('data', d => { log += d; }); server.stderr.on('data', d => { log += d; });
const report = { screens: [], checks: [], errors: [] };
try {
  let up = false;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch('http://127.0.0.1:4320/atelier-prototype')).ok) { up = true; break; } } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  assert.ok(up, 'Prototype server must start');
  browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, width, height] of [['desktop',1440,1000],['tablet',1024,768],['mobile',390,844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(`${name}: ${e.message}`));
    await page.goto('http://127.0.0.1:4320/atelier-prototype');
    try {
      await page.locator('.za[data-status="ready"]').waitFor({ timeout: 60000 });
      await page.waitForTimeout(1200);
      assert.equal(await page.locator('.za-scene canvas').count(), 1, 'One WebGL canvas');
      const initialStorage = await page.evaluate(() => JSON.stringify({ ...localStorage }));
      await page.screenshot({ path: `${dir}/${name}-podium.png` });
      for (const [index, id, item] of [[1,'petjes','Ontdekkerspet'],[2,'kleuren','Oceaanblauw'],[3,'extras','Ruimtebril']]) {
        await page.locator('.za-nav button').nth(index).click();
        await page.locator(`.za[data-station="${id}"]`).waitFor();
        const button = page.getByRole('button', { name: `${item} + Pas`, exact: true });
        await button.waitFor({ state: 'visible' });
        await page.waitForTimeout(300);
        const bounds = await button.boundingBox();
        assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0 && bounds.y + bounds.height <= height, 'Object control is inside viewport');
        await button.click();
        assert.equal(await page.getByRole('button', { name: `${item} ✓ Aan`, exact: true }).getAttribute('aria-pressed'), 'true');
        await page.screenshot({ path: `${dir}/${name}-${id}.png` });
      }
      await page.getByRole('button', { name: 'Bekijk Zappie' }).click();
      await page.waitForTimeout(300);
      assert.equal(await page.locator('.za-chosen span').count(), 3);
      await page.screenshot({ path: `${dir}/${name}-outfit.png` });
      assert.equal(await page.evaluate(() => JSON.stringify({ ...localStorage })), initialStorage, 'Outfit is not persisted');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
      await page.getByRole('button',{name:'Opnieuw',exact:true}).click();
      assert.equal(await page.locator('.za-chosen span').count(), 0);
      await page.locator('.za-nav button').nth(1).focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.za').getAttribute('data-station'), 'petjes');
      await page.getByRole('button',{name:'Sterrenkroon + Pas',exact:true}).click();
      await page.reload(); await page.locator('.za[data-status="ready"]').waitFor();
      assert.equal(await page.locator('.za-chosen span').count(),0,'Reload resets outfit');
      report.screens.push({ name, width, height, result:'passed' });
    } catch (error) { console.error('Original failure:',error); report.errors.push(String(error)); await page.screenshot({ path:`${dir}/${name}-failure.png`,timeout:5000 }).catch(()=>{}); throw error; }
    finally { await context.close(); }
  }
  for (const [name,width,height] of [['desktop',1440,1000],['tablet',1024,768],['mobile',390,844]]) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    page.on('pageerror',e=>report.errors.push(`study ${name}: ${e.message}`));
    await page.goto('http://127.0.0.1:4320/atelier-prototype/studie');
    await page.locator('.as[data-status="ready"]').waitFor({timeout:60000});
    for (const [view,label] of [['samen','Het geheel'],['podium','Het podium'],['vitrine','De vitrine']]) {
      await page.getByRole('button',{name:label,exact:true}).click();
      await page.waitForTimeout(500);
      assert.equal(await page.locator('.as').getAttribute('data-view'),view);
      await page.screenshot({path:`${dir}/study-${name}-${view}.png`});
    }
    await page.getByRole('button',{name:'Gloed aan'}).click();
    assert.equal(await page.getByRole('button',{name:'Gloed uit'}).getAttribute('aria-pressed'),'false');
    await page.screenshot({path:`${dir}/study-${name}-no-glow.png`});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.close();
  }
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type,...args) { if(type.startsWith('webgl')) return null; return get.call(this,type,...args); };
  });
  await fallback.goto('http://127.0.0.1:4320/atelier-prototype');
  await fallback.locator('.za[data-status="error"]').waitFor();
  assert.ok(await fallback.getByRole('button',{name:'Probeer opnieuw'}).isVisible());
  await fallback.close();
  report.checks.push('Three camera stations and podium', 'Three outfit slots and reset', 'Keyboard selection', 'No persistence and reload reset', 'No overflow', 'WebGL fallback');
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify(report,null,2));
} finally {
  await browser?.close(); server.kill('SIGTERM');
  await writeFile(`${dir}/report.json`,JSON.stringify(report,null,2));
  await writeFile(`${dir}/server.log`,log);
}
