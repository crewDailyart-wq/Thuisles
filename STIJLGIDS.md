# Stijlgids: de avontuurstijl

De nieuwe stijl van Thuisles, sinds oktober 2026. Het voorbeeld is
`ontwerp/startscherm.png`. Het startscherm en de pagina "Binnenkort!" zijn al
in deze stijl gebouwd. Na goedkeuring van de eigenaar volgt de rest van de
website.

Voor de code staat alles op één plek: `src/app/avontuur.css`. De onderdelen
staan in `src/components/avontuur/`.

## Achtergrond: de sterrenhemel

- Diep koningsblauw, met in het midden een zachte, lichtere gloed.
- Kleine witte sterretjes en een paar grotere sterren met vier punten.
- Een planeet met een ring rechtsboven.
- Onderaan zachte wolkjes en een heuvel in lichter en donkerder blauw.
- Een scherm krijgt deze hemel met `data-stijl="avontuur"`. De sterren, de
  planeet en de wolkjes komen uit `<Sterrenhemel />`.

## Letters

Alle lettertypes komen van Google Fonts.

| Waarvoor | Letter | Hoe |
|---|---|---|
| Titels en namen op tegels | **Fredoka** | dik en rond, wit, met een donkerblauwe schaduw eronder |
| Gewone tekst | **Nunito** | goed leesbaar |
| Kleine zinnetjes | **Caveat** | handschrift, iets scheef, bijvoorbeeld "Kies een vak en ga op ontdekking!" |

In de code: `av-titel` voor Fredoka, `av-hand` voor Caveat.

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
