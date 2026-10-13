"use client";

/**
 * De draaiende aarde onderaan het scherm: een echte 3D-bol, getekend met WebGL.
 *
 * Waarom geen Three.js: voor één bol is een kleine shader genoeg, en dan hoeft
 * er geen pakket van een paar honderd kilobyte bij. Elke beeldpunt rekent zelf
 * uit waar hij op de bol ligt (een gewone bol, van opzij bekeken), en kleurt
 * zich daarnaar:
 *   - het oppervlak (zee, turquoise ondiepten, stranden, groene eilandjes) komt
 *     uit ruis op de bol zelf en draait langzaam mee;
 *   - de wolken zijn een eigen laag die iets sneller draait en zelf ook
 *     langzaam verandert;
 *   - het zonlicht komt steeds van links, zoals op het plaatje;
 *   - langs de rand ligt een zachte cyaanblauwe atmosfeer.
 *
 * De camera hangt vlak boven de bol en kijkt naar de horizon: dichtbij zie je
 * grote eilanden, verderop kleine. Alleen de gekromde horizon is te zien, op
 * ongeveer dezelfde hoogte als op het plaatje van de eigenaar. De aarde staat
 * achter alles en vangt geen klikken op.
 *
 * Snelheid: een rondje duurt `OMLOOP_SECONDEN`. Omdat we zo dicht bij de bol
 * zijn, schuift het oppervlak bij een omloop van 3 tot 5 minuten zo snel onder
 * je door dat het voelt als vliegen. Met 30 minuten glijdt het rustig.
 *
 * Zuinig en met een vangnet:
 *   - getekend op lagere resolutie en hoogstens 30 beelden per seconde; op een
 *     trager apparaat nog minder;
 *   - stil als het tabblad niet zichtbaar is;
 *   - bij "minder beweging" en tijdens een missie één stilstaand beeld;
 *   - werkt WebGL niet, dan blijft het canvas leeg en is de aarde uit het
 *     plaatje gewoon te zien.
 */

import { useEffect, useRef } from "react";
import { parallax } from "@/components/zappie/parallax";

/** Hoe lang één rondje duurt, in seconden. */
const OMLOOP_SECONDEN = 1800;
/** Waar de top van de horizon staat: als deel van de hoogte, van boven. */
const TOP = 0.495;
/** Waar het hoogste punt staat: als deel van de breedte, van links. */
const MIDDEN = 0.42;
/**
 * De camera: hoe hoog boven de bol (als deel van de straal) en hoe wijd hij
 * kijkt. Zo gekozen dat de horizon even sterk krom loopt als op het plaatje:
 * top op 49,5% van de hoogte, links ongeveer 57%, rechts ongeveer 60%.
 */
const HOOGTE = 0.04;
const KIJKHOEK = (55 * Math.PI) / 180;

const HOEKPUNTEN = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

/*
  Simplex-ruis in 3D: Ian McEwan, Ashima Arts, en Stefan Gustavson
  (webgl-noise, MIT-licentie, https://github.com/ashima/webgl-noise).
*/
const RUIS = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const BEELDPUNTEN = `
precision highp float;
uniform vec2 uMaat;
uniform float uTijd;
uniform vec2 uParallax;
uniform float uMidden;
uniform float uHoogte;
uniform float uKanteling;
uniform float uBrandpunt;
uniform float uHoek;
${RUIS}

float golvend(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    s += a * snoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}

float zacht(vec3 p) {
  float s = 0.0;
  float a = 0.55;
  for (int i = 0; i < 3; i++) {
    s += a * snoise(p);
    p = p * 2.1 + vec3(4.1, 2.3, 7.7);
    a *= 0.5;
  }
  return s;
}

mat3 draai(vec3 as, float h) {
  float c = cos(h);
  float s = sin(h);
  float t = 1.0 - c;
  return mat3(
    t * as.x * as.x + c,        t * as.x * as.y + s * as.z, t * as.x * as.z - s * as.y,
    t * as.x * as.y - s * as.z, t * as.y * as.y + c,        t * as.y * as.z + s * as.x,
    t * as.x * as.z + s * as.y, t * as.y * as.z - s * as.x, t * as.z * as.z + c
  );
}

void main() {
  float H = uMaat.y;
  /* Een camera vlak boven de bol, die naar de horizon kijkt. */
  vec2 s = vec2((gl_FragCoord.x - uMidden * uMaat.x) / H, (gl_FragCoord.y - 0.5 * H) / H) - uParallax;
  vec3 r = normalize(vec3(s.x, s.y, uBrandpunt));
  float cp = cos(uKanteling);
  float sp = sin(uKanteling);
  r = vec3(r.x, r.y * cp - r.z * sp, r.y * sp + r.z * cp);
  vec3 oog = vec3(0.0, 1.0 + uHoogte, 0.0);
  float b = dot(oog, r);
  float c = dot(oog, oog) - 1.0;
  float d = b * b - c;

  /* Boven de horizon: de gloed van de atmosfeer, of niets. */
  if (d < 0.0 || b > 0.0) {
    /* Hoe dicht de straal langs de bol scheert: dichtbij is de gloed sterk. */
    float hoogte = b > 0.0 ? uHoogte : max(sqrt(max(c + 1.0 - b * b, 0.0)) - 1.0, 0.0);
    float g = exp(-hoogte * 520.0) * 0.9 + exp(-hoogte * 110.0) * 0.28;
    float zon = exp(-pow((s.x + 0.49) * 4.0, 2.0)) * exp(-hoogte * 160.0);
    g += zon * 0.6;
    if (g < 0.004) { gl_FragColor = vec4(0.0); return; }
    vec3 kl = mix(vec3(0.66, 0.94, 1.0), vec3(0.3, 0.6, 1.0), clamp(hoogte * 60.0, 0.0, 1.0));
    kl = mix(kl, vec3(1.0), zon * 0.6);
    g = min(g, 1.0);
    gl_FragColor = vec4(kl * g, g);
    return;
  }

  float t = -b - sqrt(d);
  vec3 n = oog + r * t;
  float scheef = clamp(dot(n, -r), 0.0, 1.0);
  vec3 as = normalize(vec3(0.0, 0.25, 1.0));
  vec3 q = draai(as, uHoek) * n;
  vec3 qw = draai(as, uHoek * 1.35 + 0.8) * n;

  /* Eilanden in groepjes, met open zee ertussen. */
  float groep = zacht(q * 9.0);
  vec3 kronkel = vec3(zacht(q * 20.0 + 3.0), zacht(q * 20.0 + 11.0), 0.0) * 0.035;
  float hoogte = golvend((q + kronkel) * 48.0) + groep * 0.55 - 0.05;
  float fijn = zacht(q * 160.0 + 7.0);
  float land = smoothstep(0.42, 0.45, hoogte);
  float ondiep = smoothstep(0.2, 0.42, hoogte);
  vec3 diep = mix(vec3(0.02, 0.27, 0.72), vec3(0.07, 0.45, 0.9), 0.5 + 0.5 * zacht(q * 30.0));
  vec3 zee = mix(diep, vec3(0.2, 0.84, 0.94), ondiep * 0.92);
  vec3 groen = mix(vec3(0.16, 0.55, 0.22), vec3(0.45, 0.78, 0.3), 0.5 + 0.5 * fijn);
  float strand = smoothstep(0.42, 0.435, hoogte) * (1.0 - smoothstep(0.445, 0.48, hoogte));
  groen = mix(groen, vec3(0.09, 0.4, 0.17), smoothstep(0.5, 0.62, hoogte) * 0.8);
  vec3 grond = mix(groen, vec3(0.97, 0.91, 0.7), strand);
  grond = mix(grond, vec3(0.5, 0.47, 0.44), smoothstep(0.66, 0.8, hoogte) * 0.85);
  vec3 kleur = mix(zee, grond, land);

  /* Het zonlicht, steeds van links. */
  vec3 zon = normalize(vec3(-0.8, 0.42, 0.45));
  float licht = clamp(dot(n, zon) * 0.5 + 0.62, 0.0, 1.0);
  kleur *= 0.78 + 0.32 * licht;
  vec3 halverwege = normalize(zon - r);
  kleur += pow(max(dot(n, halverwege), 0.0), 90.0) * (1.0 - land) * 0.5;

  /* Wolken: een eigen laag, bol en wit, die zelf ook langzaam verandert. */
  float w = zacht(qw * 26.0 + vec3(0.0, 0.0, uTijd * 0.003)) + 0.4 * snoise(qw * 90.0);
  float wolk = smoothstep(0.32, 0.62, w);
  float schaduw = smoothstep(0.32, 0.62, zacht(qw * 26.0 + vec3(0.006, -0.004, uTijd * 0.003)) + 0.4 * snoise(qw * 90.0 + 0.5));
  kleur = mix(kleur, kleur * 0.72, schaduw * 0.35);
  vec3 wolkkleur = mix(vec3(0.8, 0.88, 1.0), vec3(1.0), smoothstep(0.32, 0.8, w));
  kleur = mix(kleur, wolkkleur, wolk * 0.92);

  /* De atmosfeer: hoe schuiner je kijkt, hoe lichter en blauwer. */
  float nevel = pow(1.0 - scheef, 6.0);
  kleur = mix(kleur, vec3(0.64, 0.91, 1.0), clamp(nevel * 1.15, 0.0, 0.92));
  float zonplek = exp(-pow((s.x + 0.49) * 3.0, 2.0)) * pow(1.0 - scheef, 5.0);
  kleur += vec3(0.85, 0.96, 1.0) * zonplek * 0.6;

  gl_FragColor = vec4(kleur, 1.0);
}
`;

function maakShader(gl: WebGLRenderingContext, soort: number, bron: string) {
  const s = gl.createShader(soort);
  if (!s) return null;
  gl.shaderSource(s, bron);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("[zappie] aarde-shader:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export function DraaiendeAarde({ rustig = false }: { rustig?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const doek = canvas.current;
    if (!doek) return;
    const gl = doek.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    const hv = maakShader(gl, gl.VERTEX_SHADER, HOEKPUNTEN);
    const bp = maakShader(gl, gl.FRAGMENT_SHADER, BEELDPUNTEN);
    if (!hv || !bp) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, hv);
    gl.attachShader(prog, bp);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    const plek = (naam: string) => gl.getUniformLocation(prog, naam);
    const uMaat = plek("uMaat");
    const uTijd = plek("uTijd");
    const uParallax = plek("uParallax");
    const uHoek = plek("uHoek");
    const brandpunt = 0.5 / Math.tan(KIJKHOEK / 2);
    const duik = Math.acos(1 / (1 + HOOGTE));
    gl.uniform1f(plek("uMidden"), MIDDEN);
    gl.uniform1f(plek("uHoogte"), HOOGTE);
    gl.uniform1f(plek("uBrandpunt"), brandpunt);
    gl.uniform1f(plek("uKanteling"), duik + Math.atan((0.5 - TOP) / brandpunt));
    gl.clearColor(0, 0, 0, 0);

    /* Trager apparaat: minder beeldpunten en minder beelden per seconde. */
    const nav = navigator as Navigator & { deviceMemory?: number };
    const traag = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    let schaal = traag ? 0.42 : 0.6;
    const fps = traag ? 20 : 30;

    const maat = () => {
      const w = Math.max(1, Math.round(window.innerWidth * schaal));
      const h = Math.max(1, Math.round(window.innerHeight * schaal));
      doek.width = w;
      doek.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uMaat, w, h);
    };
    maat();

    const begin = performance.now();
    const hoekBegin = (Date.now() / 1000) % OMLOOP_SECONDEN;
    const teken = (t: number) => {
      gl.uniform1f(uTijd, t);
      gl.uniform1f(uHoek, ((hoekBegin + t) / OMLOOP_SECONDEN) * Math.PI * 2);
      gl.uniform2f(uParallax, (parallax.x * 4) / window.innerHeight, (-parallax.y * 3) / window.innerHeight);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const stil = rustig || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    doek.dataset.klaar = "ja";
    if (stil) {
      teken(0);
      const opnieuw = () => {
        maat();
        teken(0);
      };
      window.addEventListener("resize", opnieuw);
      return () => window.removeEventListener("resize", opnieuw);
    }

    let frame = 0;
    let vorige = 0;
    let gemeten = 0;
    let duurSom = 0;
    const lus = (nu: number) => {
      frame = requestAnimationFrame(lus);
      if (nu - vorige < 1000 / fps) return;
      vorige = nu;
      const t0 = performance.now();
      teken((nu - begin) / 1000);
      /* Duurt tekenen te lang, dan één keer een stapje lager in resolutie. */
      if (gemeten < 30) {
        gl.finish();
        duurSom += performance.now() - t0;
        gemeten++;
        if (gemeten === 30 && duurSom / 30 > 18 && schaal > 0.35) {
          schaal = 0.35;
          maat();
        }
      }
    };
    const zichtbaar = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) frame = requestAnimationFrame(lus);
    };
    frame = requestAnimationFrame(lus);
    window.addEventListener("resize", maat);
    document.addEventListener("visibilitychange", zichtbaar);
    const kwijt = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frame);
      delete doek.dataset.klaar;
    };
    doek.addEventListener("webglcontextlost", kwijt);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", maat);
      document.removeEventListener("visibilitychange", zichtbaar);
      doek.removeEventListener("webglcontextlost", kwijt);
    };
  }, [rustig]);

  return <canvas ref={canvas} className="zp-laag zp-aarde" />;
}
