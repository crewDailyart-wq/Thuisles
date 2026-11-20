# Keuring Plussommen (squla-plus-bakkerij-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 2). Er is **niets** aan de les, de code of de zinnen veranderd; dit is alleen een rapport.
Gespeeld als Testkind via `/voorbeeld/les/squla-plus-bakkerij-1-gouden?naam=Testkind`.

## Uitslag: AFGEKEURD

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-plussommen-gouden.ts` | goed: 16 vragen, 51 foute antwoorden, 618 combinaties eerste zin + hint (nooit maar 1 keuze over), 804 beweringen waar, nergens "fout" |
| `node scripts/speelcontrole.mjs` GOED | goed tot het eind (41 stappen); F16 0, 15.47 0, F11 0; 11 goed met zin, 5 stil (15.39) |
| `node scripts/speelcontrole.mjs` ALLEFOUT | goed tot het eind (143 stappen); F16 0, 15.47 0 (62 keer telwoord mét opdracht erboven), F11 0; 14 keer goed na hulp, altijd met zin, `goed-na-hulp` 14 keer (15.49) |
| `RUSTIG=1` speelcontrole GOED | F16 0 bij 26 wachtmomenten van 3 s |
| Begin zonder tik (`vraag-aanwezig-controle.mjs`) | alleen de lesachtergrond met de ronde afspeelknop (15.38) |
| `test-plussommen-gouden.mjs` kleur, goed, fouten, allefout, anderefout | alle "Alles in orde"; eindkaart raakt de tekst niet (15.46); overlap en sprongen 0; F7/F8 0; database 0 nieuwe regels. Route vangnet ook "Alles in orde". |
| Inhoud t.o.v. de oude les `squla-plus-bakkerij-1` (15.8) | gelijk: 16 vragen, zelfde getallen en keuzes; de 3 disco-vragen zijn de toonbank (15.35, besluit Sara) |
| grep "nagekeken", disco, "vinkje", getallen in woorden | leeg in gesproken zinnen (de oude pijl-zinnen staan alleen nog ongebruikt in `squla-plussommen-gouden-zinnen.ts:174-175`) |
| Einde (15.50) | goed: eindzin + "Tik op de kaart." laatste, afscheid na de tik |

Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/k20d2/foto-goed/`, `foto-fout/`, `tfoto/plussommen/`.

## Fouten

1. **Antwoordknoppen staan niet rechts onder Bliepo's zin (15.32, F12). Ernst: middel.**
   Bij de verhaaltjes ("Hoeveel taartjes zijn het samen?") en "Welke som hoort erbij?" staan de cijfertegels en de 4 sommen
   onder de tafel in het midden van het speelvlak. Dat zijn gewone keuzes, geen voorwerpen in het beeld. In dezelfde les
   staan de kaartjes van de toonbank wel terecht in het beeld (uitzondering 15.32).
   Plek: `src/components/les/lessen/squla-plussommen-gouden.tsx:103` (`MIDDEN_KEUZES = 578`) en `:317-318`
   (`l.kies(opties, { ..., midden: MIDDEN_KEUZES })`); het lesscherm volgt dat (`Lesscherm.tsx:1259`).
   Foto's: `foto-goed/.../001.jpg` (4 1 6 5 onder de tafel), `foto-fout/.../021.jpg` (sommen onder de tafel).
   Zelfde fout als in Minsommen (en vermoedelijk dezelfde oorzaak: de keuze "Antwoorden groot in het midden" van 7 november voor de oude lessen).

## Opmerkingen (geen afkeur)

- **Kaartjes boven de toonbank hangen in de lucht** (15.34/14.23, twijfel): de 3 kaartjes staan los boven de toonbank met de kassa, zonder iets waar ze aan hangen of op staan. Foto `foto-goed/.../003.jpg`. Sara laten kijken of dat als "zweven" telt.
- **Rondje bij samen tellen** valt half over de laatste oranje stip en het lege vakje (`tfoto/plussommen/allefout-13-samen.png`, 2 + 6): 7.8 "op het goede ding". Klein.
- **Taal (15.48)**: naast "3 en 4 zijn samen 7" komt ook "Dat klopt, 3 en 4 is samen 7." voor. "zijn samen" is beter en staat er al; kies 1 vorm (14.3).
- De hint bij "Welke som hoort erbij?" na een fout ("Tel eerst de koekjes hier. Tel dan de koekjes daar.") zegt niet dat het kind daarna een som moet kiezen; de knoppen staan er wel (15.37 grensgeval).

## Goed bevonden (kort)

- Fouttabel per denkfout klopt met wat het kind koos (getal uit de som, min in plaats van plus, 1 te veel/te weinig); hints verklappen niets.
- Kleur: 1 roze en 4 geel bij de taartjes, oranje en blauw bij de stippen; kale sommen wit.
- Samen tellen: opdracht blijft boven, het getal eronder (15.47); daarna groen en `goed-na-hulp` (15.49).

## Wat ik niet kon nagaan

- Echte stem en woord-oplichten (headless, zonder geluid); de geluiden zijn alleen geteld.
- Route "vangnet" van het testscript: "Alles in orde". De routes "verbindrust", "snel" en "wachten" zijn niet gedraaid.
- Vloeiendheid (bewust niet), telefoon en tablet.


## Herstel (20 november 2026)

Overal "… en … zijn samen …" (ook "Dat klopt, 3 en 4 zijn samen 7."); in Plussommen extra hetzelfde. Niet veranderd: de antwoordknoppen in het midden (vraag voor Sara, KEUZES-VOOR-SARA.md Ronde 53 punt 3). Fouttabel-script en speelcontrole GOED: in orde.
