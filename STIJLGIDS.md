# Stijlgids: de avontuurstijl

De nieuwe stijl van Thuisles, sinds oktober 2026. Het voorbeeld is
`ontwerp/startscherm.png`. Het startscherm en de pagina "Binnenkort!" zijn al
in deze stijl gebouwd. Na goedkeuring van de eigenaar volgt de rest van de
website.

Voor de code staat alles op één plek: `src/app/avontuur.css`. De onderdelen
staan in `src/components/avontuur/`.

## Achtergrond: de sterrenhemel

- **Het plaatje** `ontwerp/achtergrond-breed.png` van de eigenaar: diep
  koningsblauw, sterren, een planeet rechtsboven, wolkjes en heuvels onderaan.
- Het plaatje vult altijd het hele scherm, zonder randen. Het staat stil terwijl
  de inhoud eroverheen schuift.
- De website laadt lichte versies uit `public/hemel/`: AVIF, met WebP voor
  oudere browsers, elk in een paar maten. Een telefoon krijgt een bestand van
  10 tot 14 KB, een computer hoogstens 28 KB. Na een nieuw plaatje maak je die
  bestanden opnieuw met `node scripts/maak-hemel.mjs`.
- **Staand** (telefoon, staande tablet): het rechterdeel van het plaatje, met de
  planeet en de wolken. Er is nog geen echte staande versie.
- **Levendig:**
  - de sterren in het plaatje twinkelen zachtjes;
  - een zachte gloed ligt achter de titel (`av-gloed`);
  - een lichte donkere rand aan de zijkanten laat het midden oplichten.
- **Minder beweging:** staat dat aan op het apparaat, dan twinkelt er niets en
  pulseert de gloed niet.
- In de code: `<Hemel />` uit `components/avontuur/Hemel.tsx`, binnen een vlak
  met `data-stijl="avontuur"` en `isolate`.
- De eerder getekende sterren en wolkjes (`Sterrenhemel.tsx`) staan uit, maar
  zijn bewaard. Zet `GETEKENDE_HEMEL_AAN` op `true` om ze weer te tonen.

## Letters

Alle lettertypes komen van Google Fonts.

| Waarvoor | Letter | Hoe |
|---|---|---|
| Titels en namen op tegels | **Fredoka** | dik en rond, wit, met een donkerblauwe schaduw eronder |
| Gewone tekst | **Nunito** | goed leesbaar |
| Kleine zinnetjes | **Caveat** | handschrift, iets scheef, bijvoorbeeld "Kies een vak en ga op ontdekking!" |

In de code: `av-titel` voor Fredoka, `av-hand` voor Caveat. Handschrift
krijgt een zachte donkere schaduw, zodat het leesbaar blijft boven een lichte
wolk. Van Fredoka en Caveat wordt maar één dikte geladen (700 en 600). Dat
scheelt laadtijd.

## Tegels

- Een groot, afgerond vierkant.
- Een 3D-rand: de onderkant is een donkerdere tint van dezelfde kleur, met
  daaronder een zachte schaduw. Bovenin zit een lichte glans.
- Elke tegel staat een heel klein beetje scheef, tussen −2,5 en 2,5 graden, en
  elke tegel een andere kant op.
- In het midden een groot wit icoon, met kleine gele glitterstreepjes.
- De naam staat onderaan, wit en dik. Hij groeit mee met de tegel.
- Bij aanwijzen komt de tegel iets omhoog. Bij indrukken zakt hij in, zodat de
  rand bijna verdwijnt.
- **Witte letters op geel lezen slecht.** Een gele tegel krijgt daarom een
  donkerbruine rand om de letters (`av-tegel--licht`).
- Een tegel is altijd groter dan 48 pixels, zodat een vinger hem makkelijk raakt.
- Rijk, zoals op het voorbeeld:
  - een glanzende band bovenaan;
  - een kleurverloop van licht boven naar donker onder;
  - een dikke 3D-onderkant met een donker randje;
  - een harde en een zachte schaduw.

Vaste kleuren, met de donkerdere onderkant erbij:

| Kleur | Tegel | Onderkant | Voor |
|---|---|---|---|
| Paars | `--av-paars` | `--av-paars-rand` | Rekenen |
| Roze | `--av-roze` | `--av-roze-rand` | Taal |
| Oranje | `--av-oranje` | `--av-oranje-rand` | Spelling |
| Geel | `--av-geel` | `--av-geel-rand` | Begrijpend lezen |
| Groen | `--av-groen` | `--av-groen-rand` | knoppen, later Engels |
| Lichtblauw | `--av-lucht` | `--av-lucht-rand` | reserve |

## Knoppen

- Rond, met dezelfde 3D-rand als een tegel, maar plat en breed (`av-knop`).
- Minstens 48 pixels hoog.
- De kleur komt uit de tegelkleuren; standaard groen.

## Kaarten

- Een doorschijnend, afgerond vlak op de hemel, met een lichte witte rand
  (`av-kaart`).
- Een voorbeeld is het vakje "Hoi …! Fijn dat je er bent!" rechtsboven.

## Het tekstwolkje van het maatje

- Wit en rond, met donkerblauwe letters en een puntje naar het maatje
  (`av-wolkje`).
- Onder het wolkje zit een lichtblauwe rand, net als de 3D-rand van een tegel.

## Vaste plekken in de code

- **De naam van de website** staat in `src/lib/merk.ts`, net als het zinnetje
  en het motto. De naam verandert later, en dan pas je alleen dat bestand aan.
- **De mascotte** staat in `src/components/avontuur/HoofdMascotte.tsx`. Tot de
  echte mascotte er is, staat daar het tijdelijke bolletje-maatje.

## Werkt op elk scherm

- Computer en tablet liggend: vier tegels naast elkaar. De mascotte staat dan
  links en "Jij kunt het!" rechts.
- Tablet staand en telefoon: twee tegels naast elkaar. De mascotte en "Jij kunt
  het!" staan dan onder de tegels.
- Alles wat je kunt aantikken is minstens 48 pixels groot.
- Wie in de instellingen "minder beweging" heeft aangezet, ziet de tegels niet
  bewegen.
