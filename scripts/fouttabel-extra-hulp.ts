/**
 * Gedeelde hulp voor de fouttabel-scripts van de 3 EXTRA gouden lessen (12 november 2026): maakt de tabel en doet de
 * controles (verklappen 15.17, geen opdracht in de zinnen bij de 2e fout, elke fout heeft een eerste zin).
 * Schrijft alleen het ene FOUTTABEL-bestand van de les. Raakt de database en de lessen niet aan.
 */
import { writeFileSync } from "node:fs";
import type { Fout } from "../src/components/les/lessen/squla-extra-basis";

export type Rij = { vraag: string; antwoord: string; f: Fout; opties?: string[]; goed?: string; bewering?: (f: Fout) => string | null };

export const kaal = (z: string) => z.replace(/\{([^}:]+):[a-z]+\}/g, "$1").replace(/\{(\d+)\}/g, "$1");
const MEER = /te weinig|niet genoeg|nog niet (allemaal|genoeg)/i;
const MINDER = /te veel/i;
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zet|Kies|Maak|Verander|Lees)\b/;
export const RICHTINGWOORDEN = /\bover\b|niet geteld|\bmeer\b|te veel|te weinig|dubbel|laatste rij|net iets/i;

export function controleer(rijen: Rij[]): { beweringen: number } {
  const problemen: string[] = [];
  let beweringen = 0;
  for (const r of rijen) {
    const waar = `${r.vraag} ${r.antwoord}`;
    const f = r.f;
    if (!f.eerste && f.code !== "onduidelijk") problemen.push(`${waar}: geen eerste zin`);
    if (f.eerste === "" && f.code === "onduidelijk" && !f.hint) problemen.push(`${waar}: onduidelijk zonder hint`);
    for (const z of [f.uitleg, ...f.weer]) if (z && OPDRACHT.test(kaal(z))) problemen.push(`${waar}: opdracht in een zin bij de 2e fout: "${kaal(z)}"`);
    if (f.noot && RICHTINGWOORDEN.test(kaal(f.hint))) problemen.push(`${waar}: hint geeft toch een richting: "${kaal(f.hint)}"`);
    if (r.opties && r.goed) {
      beweringen++;
      const x = Number(r.antwoord);
      const getallen = r.opties.every((o) => /^\d+$/.test(o));
      const tekst = kaal(`${f.eerste} ${f.hint}`);
      let over = r.opties.filter((k) => k !== r.antwoord);
      if (getallen && Number.isFinite(x)) {
        if (MEER.test(tekst)) over = over.filter((k) => Number(k) > x);
        if (MINDER.test(tekst)) over = over.filter((k) => Number(k) < x);
      }
      if (over.length <= 1) problemen.push(`${waar}: na "${tekst}" blijft alleen ${over.join("")} over (verklapt het antwoord, 15.17)`);
    }
    const b = r.bewering?.(f);
    if (b) problemen.push(`${waar}: ${b}`);
  }
  if (problemen.length) {
    console.error("PROBLEMEN:\n" + problemen.join("\n"));
    process.exit(1);
  }
  return { beweringen };
}

export function tabel(rijen: Rij[]): string {
  const kop = "| Vraag | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Uitleg bij de 2e fout | Als dezelfde denkfout nog eens komt | Wat op het scherm |\n|---|---|---|---|---|---|---|---|";
  const regels = rijen.map((r) => `| ${r.vraag} | ${r.antwoord} | \`${r.f.code}\` — ${r.f.denkfout}${r.f.noot ? ` *(${r.f.noot})*` : ""} | ${kaal(r.f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(r.f.hint) || "—"} | ${kaal(r.f.uitleg) || "—"} | ${r.f.weer.length ? r.f.weer.map(kaal).join(" ") : "—"} | ${r.f.scherm || "—"} |`);
  return `${kop}\n${regels.join("\n")}`;
}

export function schrijf(bestand: string, tekst: string) {
  writeFileSync(new URL(`../${bestand}`, import.meta.url), tekst);
  console.log(`${bestand} geschreven`);
}
