# WIJZIGINGEN-ZINNEN-RIJTJES — oud naast nieuw

19 november 2026 (B9, rijtjes nalopen). De gedeelde rijtjes van alle gouden lessen (`src/components/les/lessen/squla-klok-gouden-zinnen.ts`: lof, momenten, naam, goed na een fout, snel, einde, groet, onduidelijk, aanmoedigen, overgang) zijn nagelopen. Het overzicht oud (gewone Squla-lessen) naast nieuw (gouden lessen) staat in RIJTJES-OUD-NAAST-NIEUW.md.

**Alleen duidelijke fouten zijn verbeterd.** De zinnen in de rijtjes zelf zijn niet veranderd; twijfelgevallen en voorstellen om ze warmer te maken staan als vraag in KEUZES-VOOR-SARA.md, Ronde 51. De oude lessen en `nooit-dubbel.ts` zijn niet aangeraakt.

## Verbeterd: de zin als er geen naam is

De functie `metNaam` haalt `{naam}` weg als er geen naam is. Daarbij ging de komma mis. Op het scherm met een naam verandert er niets; de stem (lib/stem-server.ts, `zonderNaam`) deed het al goed.

| Zin in het rijtje | Oud (zonder naam) | Nieuw (zonder naam) | Waarom |
|---|---|---|---|
| Goed zo, {naam}! | Goed zo,! | Goed zo! | losse komma voor het uitroepteken |
| Knap gedaan, {naam}! | Knap gedaan,! | Knap gedaan! | idem |
| Wat goed, {naam}! | Wat goed,! | Wat goed! | idem |
| Jij weet het, {naam}! | Jij weet het,! | Jij weet het! | idem |
| Ja {naam}, zo is het! | Ja zo is het! | Ja, zo is het! | na "Ja" hoort een komma |

Ongewijzigd goed bleven: "{naam}, dat is helemaal goed!" → "Dat is helemaal goed!", "Hoi {naam}! Fijn dat je er bent." → "Hoi! Fijn dat je er bent.", "Dat onthoud ik, {naam}: jij kunt dit!" → "Dat onthoud ik: jij kunt dit!", "{naam}, je snapt het al goed." → "Je snapt het al goed.".

Kinderen zagen de foute vorm nog niet: een les kiest een naamzin alleen als het kind een naam heeft. Maar de functie wordt door alle gouden lessen gebruikt, dus nu klopt het ook als dat ooit anders loopt.
