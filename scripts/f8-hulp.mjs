/**
 * Gedeelde hulp voor de F8-controle in de testscripts van de gouden lessen (19 november 2026).
 *
 * F8 (Sara, 10 nov 2026): dezelfde uiting 2 keer gestart zonder actie van het kind ertussen = fout. De scripts keken
 * alleen of er een actie lag tussen de 2 STARTS van de stem. Maar de stem start pas als Bliepo in beeld is
 * (wachtOpBliepo), en de les zegt de rest van een vraag of opdracht ook nog als het kind al antwoordde. Op een drukke
 * computer start de stem dan pas NA de tik van de speler: de vraag stond al in beeld en het kind had al geantwoord,
 * maar de controle zag geen actie tussen de 2 starts (zo bij Klok "Is het nu 7 uur?" en Dagen "Sleep de goede dag naar
 * de lege plek."). Daarom telt een actie mee vanaf het moment dat de les de uiting STELDE (de regel in window.__gouden
 * met dezelfde tekst: vraag, opdrachtzin, pijl-door, reactie), niet pas vanaf de start van de stem.
 * Is er geen passende regel in het logboek, dan blijft alles zoals het was (de start van de stem).
 */

const kaal = (s) =>
  String(s ?? "")
    .replace(/\{(\d+):[a-z]+\}/gi, "$1")
    .replace(/[^0-9a-zà-ÿ]+/gi, " ")
    .trim()
    .toLowerCase();

/** Wanneer stelde de les deze uiting (die op `start.t` begon)? Hooguit 15 s vóór de start; anders de start zelf. */
export function gesteldOp(log, start) {
  const z = kaal(start.z);
  if (!z) return start.t;
  let t = start.t;
  for (const x of log) {
    if (x.t > start.t) break;
    if (start.t - x.t > 15000 || !x.zin) continue;
    if (kaal(x.zin).includes(z)) t = x.t;
  }
  return Math.min(t, start.t);
}
