/** Previewbuild: maximaal twee herkansingen, uitsluitend bij de bekende font-URL-fout.
 * Zie https://github.com/vercel/next.js/issues/99114.
 * Geen fouten negeren, geen andere bundler en geen wijziging van productieconfiguratie.
 */
import { spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
await mkdir('preview-artifacts', { recursive: true });
for (let poging = 1; poging <= 3; poging++) {
  console.log(`Productiebuild, poging ${poging}/3`);
  const resultaat = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: process.env,
  });
  const log = `${resultaat.stdout ?? ''}\n${resultaat.stderr ?? ''}`;
  process.stdout.write(log);
  await writeFile(`preview-artifacts/build-${poging}.log`, log);
  if (resultaat.status === 0) process.exit(0);
  if (resultaat.error) { console.error(resultaat.error); process.exit(1); }
  const fontFout = log.includes('next/font/google queries have exactly one entry');
  if (!fontFout || poging === 3) process.exit(resultaat.status || 1);
  console.warn('::warning::De bekende upstream Google-Fonts-URL-fout trad op; één schone herkansing.');
  // Alleen de tijdelijke bouwmap op de CI-runner. Geen inhoud of database.
  await rm('.next', { recursive: true, force: true });
  await new Promise(r => setTimeout(r, 1500));
}
process.exit(1);
