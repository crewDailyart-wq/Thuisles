/**
 * Wordt één keer uitgevoerd als de server start.
 *
 * Twee taken:
 *
 *   1. Zorgen dat de schoollijst er is. Bij een lege database wordt hij
 *      automatisch opgehaald bij DUO, zodat er nooit aan gedacht hoeft te
 *      worden. Staat er al een lijst, dan gebeurt er niets — vernieuwen is een
 *      bewuste handeling in de admin.
 *   2. De methodezoeker weer oppakken als hij aan stond. Die keuze staat in de
 *      database en overleeft dus een herstart, maar de lus zelf leeft in het
 *      geheugen en is na een herstart weg.
 *
 * Bewust NIET afgewacht: `register` houdt de server tegen tot hij klaar is, en
 * een download van een paar megabyte zou het opstarten merkbaar vertragen. De
 * lijst vult zich dus kort na de start. Zolang dat loopt, toont de admin dat de
 * lijst nog leeg is.
 */

export async function register() {
  // Alleen op de Node-server; niet in de edge-omgeving.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { vulSchoollijstAlsLeeg } = await import("@/lib/data/scholen");
  const { hervatZoekerAlsActief } = await import("@/lib/data/zoeker");

  void vulSchoollijstAlsLeeg()
    .catch((fout) => {
      // Stil falen: zonder internet moet de app gewoon starten.
      console.warn("[thuisles] schoollijst kon niet worden geladen:", fout);
    })
    .finally(() => {
      // Pas hierna: zonder scholen valt er niets te zoeken.
      try {
        hervatZoekerAlsActief();
      } catch (fout) {
        console.warn("[thuisles] methodezoeker niet hervat:", fout);
      }
    });
}
