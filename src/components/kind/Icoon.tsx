/**
 * Iconenset voor interface-elementen.
 *
 * Alles is met de hand als SVG-pad opgeschreven: geen externe iconenbibliotheek
 * en geen afbeeldingen die nog moeten worden aangeleverd. Zo blijft de stijl
 * van Thuisles van Thuisles.
 */

export type IcoonNaam =
  | "start"
  | "oefenen"
  | "voortgang"
  | "wereld"
  | "maatje"
  | "profiel"
  | "slot"
  | "vinkje"
  | "pijl"
  | "ster"
  | "vlam"
  | "munt"
  | "edelsteen"
  | "school"
  | "gloeilamp";

const PADEN: Record<IcoonNaam, string[]> = {
  start: [
    "M3 10.6 12 3.2l9 7.4",
    "M5.6 9.4V19a1.4 1.4 0 0 0 1.4 1.4h10a1.4 1.4 0 0 0 1.4-1.4V9.4",
  ],
  oefenen: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
    "M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z",
    "M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z",
  ],
  voortgang: ["M5 20.2v-6.4", "M12 20.2V5.6", "M19 20.2v-9.6"],
  wereld: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
    "M3.3 12h17.4",
    "M12 3c2.4 2.5 3.7 5.6 3.7 9s-1.3 6.5-3.7 9c-2.4-2.5-3.7-5.6-3.7-9S9.6 5.5 12 3Z",
  ],
  maatje: ["M12 20.4 4.9 13.5a4.4 4.4 0 0 1 6.2-6.2l.9.9.9-.9a4.4 4.4 0 1 1 6.2 6.2Z"],
  profiel: [
    "M12 12.4a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z",
    "M4.6 20.4a7.4 7.4 0 0 1 14.8 0",
  ],
  slot: [
    "M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5",
    "M6.4 10.5h11.2a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H6.4a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1Z",
  ],
  vinkje: ["m5.5 12.6 4.3 4.3L18.5 8"],
  pijl: ["M5 12h13", "m12.5 5.5 6.5 6.5-6.5 6.5"],
  ster: ["m12 3.6 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.3-4.2 6-.9Z"],
  vlam: [
    "M12 3.2c3.1 3.4 4.7 6.3 4.7 8.6a4.7 4.7 0 1 1-9.4 0c0-2.3 1.6-5.2 4.7-8.6Z",
    "M12 20a2.3 2.3 0 0 0 2.3-2.3c0-1.1-.8-2.2-2.3-3.6-1.5 1.4-2.3 2.5-2.3 3.6A2.3 2.3 0 0 0 12 20Z",
  ],
  munt: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
    "M14 9.4a2.4 2.4 0 0 0-3.7 1.1c0 2.3 4 1.2 4 3.5a2.4 2.4 0 0 1-3.7 1.1",
    "M12 7.6v8.8",
  ],
  edelsteen: [
    "m12 20.6-8-11 3.4-5.2h9.2L20 9.6l-8 11Z",
    "M4 9.6h16",
    "m8.7 9.6 3.3 11 3.3-11",
  ],
  school: [
    "M3.5 20.5h17",
    "M6 20.5V10l6-3.8 6 3.8v10.5",
    "M10.3 20.5v-4.8h3.4v4.8",
  ],
  gloeilamp: [
    "M12 3.5a5.5 5.5 0 0 1 3.3 9.9c-.6.5-.9 1.1-.9 1.8v.3H9.6v-.3c0-.7-.3-1.3-.9-1.8A5.5 5.5 0 0 1 12 3.5Z",
    "M9.8 18h4.4",
    "M10.4 20.6h3.2",
  ],
};

export function Icoon({
  naam,
  className = "size-6",
}: {
  naam: IcoonNaam;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PADEN[naam].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
