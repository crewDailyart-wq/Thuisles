/**
 * Staat Bliepo al in beeld? (26 oktober 2026, opdracht eigenaar: "je ziet de
 * tekst en hoort de stem al terwijl Bliepo pas 3 seconden later in beeld
 * komt".)
 *
 * De 3D-Bliepo (of zijn filmpje op telefoon en tablet) moet eerst laden. Elke
 * Bliepo op de vloer (BliepoVloer) meldt zich hier aan en meldt het zodra hij
 * voor het eerst getekend is. Opdrachten (Maatje) en lessen (Lesscherm)
 * wachten daarop voordat de tekst verschijnt en de stem begint. Duurt het
 * laden te lang of lukt het niet, dan na een paar tellen toch: een kind
 * blijft nooit op een stil scherm zitten.
 */

let aanwezig = 0;
let getekend = 0;
const wachters = new Set<() => void>();

function roep() {
  if (aanwezig > 0 && getekend === 0) return;
  for (const w of [...wachters]) w();
}

/** Een Bliepo op de vloer staat op de pagina (nog niet getekend). Geeft een afmeld-functie terug. */
export function meldBliepoAan() {
  aanwezig++;
  let isGetekend = false;
  return {
    getekend() {
      if (isGetekend) return;
      isGetekend = true;
      getekend++;
      roep();
    },
    weg() {
      aanwezig--;
      if (isGetekend) getekend--;
      isGetekend = false;
      /*
        Even later kijken: wordt Bliepo vervangen door een nieuwe (zelfde
        scherm, ander bericht), dan staat die nieuwe er direct daarna al, en
        moet er nog op hem gewacht worden (anders begint de stem te vroeg).
      */
      window.setTimeout(roep, 0);
    },
  };
}

/** Wacht tot Bliepo in beeld staat (of er geen Bliepo op de pagina is), hooguit `maxMs`. */
export function wachtOpBliepo(maxMs = 6000): Promise<void> {
  if (aanwezig === 0 || getekend > 0) return Promise.resolve();
  return new Promise((res) => {
    const klaar = () => {
      wachters.delete(klaar);
      window.clearTimeout(t);
      res();
    };
    const t = window.setTimeout(klaar, maxMs);
    wachters.add(klaar);
  });
}
