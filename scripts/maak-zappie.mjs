// Maakt de losse beelden voor de Zappie-startpagina uit de ontwerpen van de eigenaar.
//   node scripts/maak-zappie.mjs
//
// Bron: ontwerp/zappie/ (zie public/assets/zappie/BRON.md). Uit: public/assets/zappie/.
//
// - De ruimteachtergrond: 1672, 1280 en 828 breed, als AVIF en WebP.
// - De drie werelden: de plaatjes van de eigenaar hebben een eigen sterrenhemel,
//   een ingebakken naam ("Oceaan"), een voortgangsbalk en gele stippen. Die
//   moeten eruit; de naam, de balk en het pad maakt de website zelf. Daarom wordt
//   uit elke wereld een ronde uitsnede genomen die onder de ingebakken tekst
//   blijft. Die uitsnede wordt een bol: het midden iets uitvergroot zoals bij een
//   globe, de rand donkerder met een blauwe lichtrand, een glimlicht linksboven
//   en een zachte gloed eromheen. Alles buiten de bol is doorzichtig.
// - Jouw wereld: tijdelijk uit het voorbeeldplaatje gesneden, met de ingebakken
//   titel weggepoetst. Moet nog vervangen worden door een los gemaakt beeld.
import sharp from "sharp";
import fs from "node:fs";

const BRON = "ontwerp/zappie";
const UIT = "public/assets/zappie";
fs.mkdirSync(UIT, { recursive: true });

function meld(pad) {
  console.log(pad, Math.round(fs.statSync(pad).size / 1024), "KB");
}

// ---------------------------------------------------------------------------
// Achtergrond
// ---------------------------------------------------------------------------
for (const b of [1672, 1280, 828]) {
  for (const [ext, opt] of [["avif", { quality: 72, effort: 6 }], ["webp", { quality: 86, effort: 6 }]]) {
    const pad = `${UIT}/space-earth-background-${b}.${ext}`;
    await sharp(`${BRON}/ruimte-aarde.webp`).resize({ width: b })[ext](opt).toFile(pad);
    meld(pad);
  }
}

// ---------------------------------------------------------------------------
// Werelden als losse bollen
// ---------------------------------------------------------------------------
/*
  Per wereld: het midden en de straal van de uitsnede, in pixels van het
  origineel. Gemeten zo dat de bovenkant van de cirkel onder de ingebakken naam
  en voortgangsbalk blijft (die lopen tot ongeveer y = 205 bij de oceaan en
  y = 170 bij aarde en heelal) en de onderkant binnen het plaatje.
*/
const WERELDEN = [
  { naam: "ocean-world", bron: "wereld-oceaan.webp", x: 958, y: 572, r: 342, rand: [120, 230, 255] },
  { naam: "earth-world", bron: "wereld-aarde.webp", x: 842, y: 568, r: 356, rand: [150, 225, 255] },
  { naam: "universe-world", bron: "wereld-heelal.webp", x: 872, y: 568, r: 362, rand: [170, 170, 255] },
];

/** Hoeveel ruimte er om de bol blijft voor de gloed, als deel van de straal. */
const GLOEDRUIMTE = 0.1;
/** De maat van de bol in het uitvoerbestand (straal in pixels). */
const STRAAL_UIT = 340;

const glad = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

async function maakBol(w) {
  const { data, info } = await sharp(`${BRON}/${w.bron}`).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const B = info.width;
  const H = info.height;
  const R = STRAAL_UIT;
  const kant = Math.round(2 * R * (1 + GLOEDRUIMTE));
  const mid = kant / 2;
  const uit = Buffer.alloc(kant * kant * 4);
  const schaal = w.r / R;

  /* Bilineair een pixel uit de bron halen. */
  const haal = (sx, sy, kanaal) => {
    const x0 = Math.max(0, Math.min(B - 2, Math.floor(sx)));
    const y0 = Math.max(0, Math.min(H - 2, Math.floor(sy)));
    const fx = Math.min(1, Math.max(0, sx - x0));
    const fy = Math.min(1, Math.max(0, sy - y0));
    const i = (y0 * B + x0) * 4 + kanaal;
    const a = data[i];
    const b = data[i + 4];
    const c = data[i + B * 4];
    const d = data[i + B * 4 + 4];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };

  for (let py = 0; py < kant; py++) {
    for (let px = 0; px < kant; px++) {
      const dx = (px + 0.5 - mid) / R;
      const dy = (py + 0.5 - mid) / R;
      const rho = Math.hypot(dx, dy);
      const o = (py * kant + px) * 4;

      if (rho > 1) {
        /* Buiten de bol: alleen een zachte gloed in de randkleur. */
        const g = Math.pow(1 - glad(1, 1 + GLOEDRUIMTE, rho), 2.2) * 0.55;
        uit[o] = w.rand[0];
        uit[o + 1] = w.rand[1];
        uit[o + 2] = w.rand[2];
        uit[o + 3] = Math.round(g * 255);
        continue;
      }

      /* Globe: het midden iets groter, de rand iets samengedrukt. */
      const bol = Math.asin(Math.min(1, rho)) / (Math.PI / 2);
      const rhoBron = rho === 0 ? 0 : 0.55 * rho + 0.45 * bol;
      const f = rho === 0 ? 0 : rhoBron / rho;
      const sx = w.x + dx * f * R * schaal;
      const sy = w.y + dy * f * R * schaal;

      let r = haal(sx, sy, 0);
      let g = haal(sx, sy, 1);
      let b = haal(sx, sy, 2);

      /* Licht: naar de rand toe iets donkerder, zoals een bol. */
      const diepte = Math.sqrt(Math.max(0, 1 - rho * rho));
      const licht = 0.78 + 0.22 * diepte;
      r *= licht;
      g *= licht;
      b *= licht;

      /* Lichtrand van de atmosfeer. */
      const rand = glad(0.8, 1, rho) * 0.62;
      r = r * (1 - rand) + w.rand[0] * rand;
      g = g * (1 - rand) + w.rand[1] * rand;
      b = b * (1 - rand) + w.rand[2] * rand;

      /* Glimlicht linksboven. */
      const gx = dx + 0.42;
      const gy = dy + 0.5;
      const glim = Math.max(0, 1 - Math.hypot(gx * 1.25, gy * 1.9) / 0.42) ** 2 * 0.28;
      r += (255 - r) * glim;
      g += (255 - g) * glim;
      b += (255 - b) * glim;

      /* Een gladde rand van ongeveer anderhalve pixel. */
      const dekking = 1 - glad(1 - 1.5 / R, 1, rho);
      const gloed = Math.pow(1 - glad(1, 1 + GLOEDRUIMTE, rho), 2.2) * 0.55;
      const a = dekking + gloed * (1 - dekking);

      uit[o] = Math.round(Math.min(255, (r * dekking + w.rand[0] * gloed * (1 - dekking)) / Math.max(a, 1e-6)));
      uit[o + 1] = Math.round(Math.min(255, (g * dekking + w.rand[1] * gloed * (1 - dekking)) / Math.max(a, 1e-6)));
      uit[o + 2] = Math.round(Math.min(255, (b * dekking + w.rand[2] * gloed * (1 - dekking)) / Math.max(a, 1e-6)));
      uit[o + 3] = Math.round(a * 255);
    }
  }

  const beeld = () => sharp(uit, { raw: { width: kant, height: kant, channels: 4 } });
  for (const [ext, opt] of [["avif", { quality: 70, effort: 6 }], ["webp", { quality: 86, alphaQuality: 90, effort: 6 }]]) {
    const pad = `${UIT}/${w.naam}.${ext}`;
    await beeld()[ext](opt).toFile(pad);
    meld(pad);
  }
}

for (const w of WERELDEN) await maakBol(w);

// ---------------------------------------------------------------------------
// Jouw wereld (tijdelijk, uit het voorbeeldplaatje)
// ---------------------------------------------------------------------------
/*
  Het eiland in het paneel rechtsonder van het voorbeeld. Binnen de rand van het
  paneel en links van de ronde pijlknop. Bovenin staan het kasteeltje en de
  tekst "Jouw wereld / Bouw verder aan je wereld!"; daar is alleen lucht achter,
  dus die strook wordt per rij gevuld met een overgang tussen de lucht links en
  rechts van de tekst.
*/
{
  const UITSNEDE = { left: 1096, top: 637, width: 446, height: 252 };
  const POETS = { x0: 0, x1: 318, y0: 0, y1: 68 }; // binnen de uitsnede
  const { data, info } = await sharp(`${BRON}/voorbeeld-startpagina.webp`)
    .extract(UITSNEDE)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const B = info.width;
  for (let y = POETS.y0; y < POETS.y1; y++) {
    const rechts = (y * B + POETS.x1) * 4;
    for (let x = POETS.x0; x < POETS.x1; x++) {
      const o = (y * B + x) * 4;
      for (let k = 0; k < 3; k++) data[o + k] = data[rechts + k];
    }
  }
  /* De naad tussen gepoetst en echt een paar pixels laten overlopen. */
  const OVERLOOP = 8;
  for (let y = POETS.y1; y < POETS.y1 + OVERLOOP; y++) {
    const t = (y - POETS.y1 + 1) / (OVERLOOP + 1);
    const rechts = (y * B + POETS.x1) * 4;
    for (let x = POETS.x0; x < POETS.x1; x++) {
      const o = (y * B + x) * 4;
      for (let k = 0; k < 3; k++) data[o + k] = Math.round(data[rechts + k] * (1 - t) + data[o + k] * t);
    }
  }
  const beeld = () =>
    sharp(data, { raw: { width: B, height: info.height, channels: 4 } })
      .removeAlpha()
      .resize({ width: B * 2, kernel: "lanczos3" })
      .sharpen({ sigma: 0.8 });
  for (const [ext, opt] of [["avif", { quality: 70, effort: 6 }], ["webp", { quality: 86, effort: 6 }]]) {
    const pad = `${UIT}/my-world-island.${ext}`;
    await beeld()[ext](opt).toFile(pad);
    meld(pad);
  }
}
