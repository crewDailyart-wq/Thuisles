// Maakt public/geld/getekend/briefje-10-euro-hersteld.svg: een KOPIE van het getekende briefje van 10 euro
// zonder de losse '8' rechts (foutje in het plaatje, besluit Sara 12 november 2026).
// Het origineel (briefje-10-euro.svg) blijft ongewijzigd. De 8 wordt weggehaald door het grijze vlakje
// eromheen over de 8 door te trekken (per rij van links naar rechts), met een beetje korrel.
import fs from "node:fs";
import sharp from "sharp";

const dir = new URL("../public/geld/getekend/", import.meta.url).pathname;
const svg = fs.readFileSync(dir + "briefje-10-euro.svg", "utf8");
const m = svg.match(/<image x="(-?\d+)" y="(-?\d+)" width="(\d+)" height="(\d+)" href="data:image\/png;base64,([^"]+)"/);
const [ox, oy] = [-Number(m[1]), -Number(m[2])];
const png = Buffer.from(m[5], "base64");
const B = 785, H = 389;
const { data } = await sharp(png).extract({ left: ox, top: oy, width: B, height: H }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => (y * B + x) * 3;
// gebied van de 8 (met ruimte eromheen), binnen het grijze vlakje (x 681..730, y 83..154)
const X0 = 688, X1 = 722, Y0 = 92, Y1 = 146;
const donker = (x, y) => {
  const i = px(x, y), r = data[i], g = data[i + 1], b = data[i + 2];
  return r - b > 25 || r + g + b < 380; // roodbruin of donker = de 8; grijs is r~g~b en licht
};
let mask = new Uint8Array(B * H);
for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) if (donker(x, y)) mask[y * B + x] = 1;
for (let ronde = 0; ronde < 2; ronde++) { // 2 pixels groter (de rand van de 8 is zacht)
  const nw = mask.slice();
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++)
    if (mask[y * B + x]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) nw[(y + dy) * B + x + dx] = 1;
  mask = nw;
}
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
const uit = Buffer.from(data);
for (let y = 0; y < H; y++) {
  let x = 0;
  while (x < B) {
    if (!mask[y * B + x]) { x++; continue; }
    let e = x; while (e < B && mask[y * B + e]) e++;
    const l = px(x - 1, y), r = px(e, y);
    for (let k = x; k < e; k++) {
      const t = (k - x + 1) / (e - x + 1), n = rnd() * 6;
      for (let c = 0; c < 3; c++) uit[px(k, y) + c] = Math.max(0, Math.min(255, Math.round(data[l + c] * (1 - t) + data[r + c] * t + n)));
    }
    x = e;
  }
}
// strepen wegwerken: de ingevulde pixels een paar keer zacht uitsmeren (ook van boven naar beneden)
for (let ronde = 0; ronde < 6; ronde++) {
  const kopie = Buffer.from(uit);
  for (let y = Y0 - 3; y <= Y1 + 3; y++) for (let x = X0 - 3; x <= X1 + 3; x++) {
    if (!mask[y * B + x]) continue;
    for (let c = 0; c < 3; c++) {
      let som = 0, n = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { som += kopie[px(x + dx, y + dy) + c]; n++; }
      uit[px(x, y) + c] = Math.round(som / n);
    }
  }
}
const nieuw = await sharp(uit, { raw: { width: B, height: H, channels: 3 } }).png().toBuffer();
const out = `<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${H}" viewBox="0 0 ${B} ${H}"><defs><clipPath id="papier"><rect width="${B}" height="${H}" rx="2"/></clipPath></defs><image x="0" y="0" width="${B}" height="${H}" href="data:image/png;base64,${nieuw.toString("base64")}" clip-path="url(#papier)"/></svg>`;
fs.writeFileSync(dir + "briefje-10-euro-hersteld.svg", out);
await sharp(nieuw).extract({ left: 650, top: 50, width: 90, height: 130 }).resize(360, 520).toFile(process.argv[2] || "/dev/null.png").catch(() => {});
console.log("klaar", out.length);
