# Keuring Minsommen (squla-min-machine-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 2). Er is **niets** aan de les, de code of de zinnen veranderd; dit is alleen een rapport.
Gespeeld als Testkind via `/voorbeeld/les/squla-min-machine-1-gouden?naam=Testkind`.

## Uitslag: AFGEKEURD

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-minsommen-gouden.ts` | goed: 15 vragen, 30 foute antwoorden, rekenen klopt, geen hint verklapt het antwoord, nergens "fout" |
| `node scripts/speelcontrole.mjs` GOED | goed tot het eind (42 stappen); F16 0, 15.47 0, F11 0; 10 goed met zin, 7 stil (15.39) |
| `node scripts/speelcontrole.mjs` ALLEFOUT | goed tot het eind (164 stappen); F16 0, 15.47 0 (60 keer telwoord mét opdracht erboven), F11 0; 17 keer goed na hulp, altijd met zin; `goed-na-hulp` 17 keer (15.49 klopt) |
| `RUSTIG=1` speelcontrole GOED | F16 0 bij 20 wachtmomenten van 3 s |
| Begin zonder tik (`vraag-aanwezig-controle.mjs`) | alleen de lesachtergrond met de ronde afspeelknop (15.38) |
| `test-minsommen-gouden.mjs` kleur, goed, fouten, allefout, wachten | alle 5 "Alles in orde"; teller 0 keer in beeld bij een keuzevraag (15.20); hulphandje na ± 7 s alleen bij de opdracht (tik op de plus); 0 keer iets bij keuzevragen tijdens het wachten; F7/F8 0; overlap en sprongen 0; database: 0 nieuwe regels |
| Inhoud t.o.v. de oude les `squla-min-machine-1` (15.8) | gelijk: dezelfde 15 sommen in dezelfde volgorde met dezelfde keuzes; de 4 "disco"-vragen zijn nu een som in het midden (15.35, mag) |
| grep "nagekeken", disco, getallen in woorden | leeg in gesproken zinnen |
| Einde (15.50) | goed: eindzin + "Tik op de kaart." als laatste, afscheid pas na de tik; eindkaart links naast het tekstvak (15.46) |

Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/k20d2/foto-goed/`, `foto-fout/` en `tfoto/minsommen/`.

## Fouten

1. **Antwoordknoppen staan niet rechts onder Bliepo's zin (15.32, F12). Ernst: middel.**
   Alle keuzevragen van de les (de machine, het schoolbord, de som in het midden én de 2 uitlegvragen "Wordt het totaal
   dan groter of kleiner?" en "Hoe heet het als je er steeds stippen bij doet?") zetten de knoppen in het midden van het
   speelvlak, onder de tekening (`midden`). Het zijn gewone keuzes (cijfertegels en woorden), geen voorwerpen in het beeld,
   dus volgens 15.32 horen ze in de rechterkolom onder Bliepo's zin.
   Plek: `src/components/les/lessen/squla-minsommen-gouden.tsx:100-101` (`MIDDEN_MACHINE`, `MIDDEN_SOM`), `:334-335`
   (`l.kies(..., { midden })`), aanroepen `:547` en `:628`. Het lesscherm doet wat de les vraagt
   (`Lesscherm.tsx:1259`, `keuzesMidden`; `vastePlek` negeert alleen `raster`). Foto: `foto-goed/.../003.jpg` (3 | 4 | 2 onder het bord).
   Let op: dit was eerder (7 november, KEUZES-VOOR-SARA.md "Antwoorden groot in het midden") zo gekozen voor de oude lessen; 15.32 (18 november) zegt voor gouden lessen iets anders. Als Sara dit als uitzondering wil houden, moet dat bij 15.32 komen.

2. **De "stippenmachine" is niet te zien (3.12, 14.4, 15.36). Ernst: middel.**
   Bij de uitleg aan het begin zegt Bliepo "Kijk, dit is mijn stippenmachine." en "Tik op de plusknop onder de machine.",
   maar in beeld staan alleen het getal 0, losse stippen en een ronde plusknop. Er is geen machine getekend, dus "onder de
   machine" klopt niet met wat het kind ziet.
   Plek: zinnen `src/components/les/lessen/squla-minsommen-gouden-zinnen.ts:199` en `:201`; vlak
   `src/components/les/vlakken/squla-minsommen-gouden-vlak.tsx:73-121` (alleen stippen, teller en plusknop).
   Foto's: `tfoto/minsommen/goed-intro-plus-1-voor-tik-1.png`, `foto-fout/.../001.jpg`.

## Goed bevonden (kort)

- Rood scherm 1,5 s, knoppen weg, hint uit de fouttabel, vraag komt terug ("Reken het nog eens uit. Wat is 8 − 5?"); na de 2e fout samen stippen wegtikken, opdracht blijft bovenaan met het getal eronder (15.47), daarna groen en `goed-na-hulp` (15.49).
- Kleuren: bij de machine 10 roze (blokjes) en 3 geel (het getal op de machine); kale som op het bord wit (14.27).
- Hint verklapt niets (script + foto's); teller pas na het antwoord of bij samen doen (15.20).
- Taal: korte zinnen, cijfers (3.20). Twijfel: het woord "totaal" staat niet in WOORDEN-GROEP3.md.

## Wat ik niet kon nagaan

- Echte stem (Ruth/Google) en het woord-voor-woord oplichten: alles is zonder geluid gespeeld (headless). Ook de geluiden zelf niet gehoord; alleen geteld.
- De tijd tussen zinnen (doel ± 0,7 s): in de routes "fouten" en "wachten" waren er 3 en 5 pauzes buiten 550–950 ms (grootste 5,4 s en 5,9 s). Het testscript keurt dit niet af; vermoedelijk wachten op rood/groen of het hulphandje, niet verder uitgezocht.
- Vloeiendheid: bewust niet gemeten (pas aan het eind).
- Telefoon en tablet: niet bekeken.


## Herstel (20 november 2026)

Bliepo zei "dit is mijn stippenmachine" en "de plusknop onder de machine", maar er staat geen machine in beeld. De zinnen noemen nu wat er staat: "Kijk, hier zijn stippen en een plusknop. …" en "Tik op de plusknop onder de stippen." (15.36; oud naast nieuw in WIJZIGINGEN-ZINNEN-MINSOMMEN.md). Niet veranderd: de antwoordknoppen in het midden (15.32) is een vraag voor Sara (KEUZES-VOOR-SARA.md Ronde 53 punt 3). Fouttabel-script en speelcontrole GOED: in orde.
