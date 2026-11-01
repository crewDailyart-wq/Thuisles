/**
 * De vaste stijl voor elke Magnific-generatie (Sara, nacht van 31 oktober 2026:
 * "Gebruik vanaf nu voor ELKE Magnific-generatie exact deze instellingen").
 * Model Google Nano Banana 2 (imagen-nano-banana-2-flash), resolutie 1K, formaat 16:9.
 */
export const MODEL = { mode: "imagen-nano-banana-2-flash", resolution: "1k", aspectRatio: "16:9" };
export const STIJL =
  "simple flat illustration for a children's math app: solid flat colors, one soft highlight, thin dark outline, minimal details, no gradients, no shadow, no face, no eyes, no text. Single object centered on a plain pure white background.";
/** Bij een dier (Sara: "bij dieren wel simpele ogen"): alleen simpele ogen, verder geen gezicht. */
export const STIJL_DIER =
  "simple flat illustration for a children's math app: solid flat colors, one soft highlight, thin dark outline, minimal details, no gradients, no shadow, simple dot eyes only, no other facial features, no text. Single animal centered on a plain pure white background.";

export const prompt = (v) => `${v.onderwerp}, ${v.dier ? STIJL_DIER : STIJL}`;

/** De tijdelijke tekening: vlak, één donkere rand, op 512 × 512 met lege rand. */
export const placeholderSvg = (v) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 200 200"><style>.r{stroke:#1d2340;stroke-width:6;stroke-linejoin:round;stroke-linecap:round}</style>${v.schets}</svg>`;
