/**
 * De iconen van de ouderomgeving.
 *
 * Bewust een vaste, korte lijst met eenvoudige lijn-iconen. Elk icoon heeft
 * één betekenis en wordt nergens anders voor gebruikt: zo hoeft een ouder een
 * icoon maar één keer te leren. Geen illustraties, geen mascotte, geen
 * versiering.
 */

export type OuderIcoonNaam =
  // Navigatie — de vijf vaste onderdelen
  | "overzicht"
  | "voortgang"
  | "school"
  | "instellingen"
  | "abonnement"
  // De drie statussen. Kleur is nooit het enige verschil; dit icoon hoort er
  // altijd bij, op dezelfde plek.
  | "sterk"
  | "aandacht"
  | "aanbevolen"
  // Kleine hulpjes
  | "kind"
  | "pijl"
  | "uitklap"
  | "info";

const PADEN: Record<OuderIcoonNaam, string> = {
  overzicht: "M4 4.5h6.5v6H4zM13.5 4.5H20v6h-6.5zM4 13.5h6.5v6H4zM13.5 13.5H20v6h-6.5z",
  voortgang: "M4 19.5V4.5M4 19.5h16M8 16.5v-5M12.5 16.5v-9M17 16.5v-3",
  school: "M12 3.5 21 8v1.5H3V8zM5.5 9.5v8M18.5 9.5v8M9.5 9.5v8M14.5 9.5v8M3.5 20.5h17",
  instellingen: "M5 7.5h14M5 12h14M5 16.5h14M9.5 5.5v4M15 10v4M8 14.5v4",
  abonnement: "M3.5 6.5h17v11h-17zM3.5 10.5h17M7 14.5h3",
  sterk: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17M8.5 12.2l2.4 2.4 4.6-4.9",
  aandacht: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17M12 8v4.8M12 15.7v.6",
  aanbevolen: "M12 3.8 14.4 9l5.6.7-4.1 3.9 1.1 5.6-5-2.8-5 2.8 1.1-5.6L4 9.7 9.6 9z",
  kind: "M12 4.5a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8M5 20a7 7 0 0 1 14 0",
  pijl: "M9.5 5.5 16 12l-6.5 6.5",
  uitklap: "M5.5 9.5 12 16l6.5-6.5",
  info: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17M12 11v5.2M12 7.6v.6",
};

export function Icoon({
  naam,
  className = "size-5",
}: {
  naam: OuderIcoonNaam;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PADEN[naam]} />
    </svg>
  );
}
