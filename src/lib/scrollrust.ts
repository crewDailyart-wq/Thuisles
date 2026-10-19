/**
 * Wordt er net gescrold? (19 oktober 2026, voor vloeiend scrollen op de laptop)
 *
 * Zwaar werk dat kan wachten (het atelier vooraf klaarzetten, een 3D-Bliepo
 * opstarten) wacht hiermee tot er minstens 1 seconde niet gescrold is, zodat het scrollen
 * nooit hapert. Telt ook het nalopen van vloeiend scrollen (Lenis) mee, want
 * dat geeft gewone scroll-gebeurtenissen.
 */

let laatste = -Infinity;
let luistert = false;

function luister() {
  if (luistert || typeof window === "undefined") return;
  luistert = true;
  const zet = () => {
    laatste = performance.now();
  };
  window.addEventListener("scroll", zet, { passive: true });
  window.addEventListener("wheel", zet, { passive: true });
  window.addEventListener("touchmove", zet, { passive: true });
}

/** Is er in de laatste `ms` milliseconden gescrold? */
export function scrolltNet(ms = 1000): boolean {
  luister();
  return performance.now() - laatste < ms;
}

/** Wacht tot er `ms` milliseconden niet gescrold is. */
export async function wachtOpScrollrust(ms = 1000): Promise<void> {
  luister();
  while (performance.now() - laatste < ms) await new Promise((r) => setTimeout(r, 100));
}
