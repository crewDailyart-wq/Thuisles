# KEURING gouden les Getallenlijn — squla-getallenlijn-kat-1-gouden ("Het raketje op de getallenlijn")

Onafhankelijke keurder, 10 november 2026, branch backup-squla, basis commit c0eb4ba (de bouwer). Kind-test: zie
KINDTEST-GETALLENLIJN-GOUDEN.md. Geen betaald tegoed, geen ElevenLabs, niets online, oude lessen (regel 8) niet aangeraakt,
geen helpers ingezet. Gedeelde code (Lesscherm.tsx, BliepoTekst.tsx, lib/stem.ts, holo/basis.ts) en de oude les niet
veranderd. De halve wijzigingen van een andere sessie (Tellen, Splitsen, gouden-pijl.ts) niet aangeraakt en niet
gecommit.

## UITSLAG: GOEDGEKEURD (na 4 herstellingen in deze les)

In 1 zin: de inhoud is precies die van Squla (15 vragen), elke vraag heeft precies 1 goed antwoord, de hints verklappen
niets en de les stopt nooit; maar de kaarten bij "op volgorde" waren onzichtbaar (ernstig), en er waren 3 kleinere
punten. Alle 4 zijn hersteld in de bestanden van deze les en opnieuw getest.

Telling: 1 ernstig (hersteld), 1 middel (hersteld), 2 klein (hersteld), 1 nieuwe vraag aan Sara (KEUZES Ronde 27b punt 8).

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (vooral 3.7, 3.12, 3.15, 3.16, 4, 5, 6.10, 14.20–14.37, 15.1–15.30), LESRECEPT.md
  (alle "Geleerd bij"-blokken), BLIEPO-KARAKTER.md, FOUTEN-VOORBEELDEN.md (F1–F9), KEUZES Ronde 26b en 27, het draaiboek
  Getallenlijn (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/getallenlijn.md, vooral §8 en §11), de les, de zinnen, het gouden
  vlak, holo/basis.ts (`tover`), de oude les `squla-getallenlijn-kat-1` (alleen gelezen) en de diff van de bouwer.
- `npx tsx scripts/fouttabel-getallenlijn-gouden.ts`: reken-, verklap- en waarheidscontrole in orde, vóór en na mijn
  herstel (15 vragen + de uitlegvraag, 37 foute antwoorden; na herstel 83 beweringen nagelopen, ook de nieuwe zinnen).
  FOUTTABEL opnieuw gemaakt.
- `npm run opgaven`: groen. `REV=96ce067 npm run inhoudsvergelijk`: 0 verdwenen.
- Speelcontrole na herstel: `F7=1 GOED=1 npm run speel` (49 stappen) en `F7=1 ALLEFOUT=1 npm run speel` (170 stappen):
  allebei tot het eind, 0 fouten, F7 = 0, F8 = 0.
- `scripts/test-getallenlijn-gouden.mjs`: goed (Nee), ja (proef goed), proefmis (2 fouten in de proef), anderefout,
  vangnet, wachten, tik-door, kleur; allefout op 1440×900 (met schermfoto's), 1280×720, 1536×864 en 1024×768 (met
  schermfoto's); fouten en woorden in een zichtbare Chrome met de echte stem via het lesoverzicht.
- `les_uitkomsten`: hoogste id vóór en na alles **143**. Er is niets bijgekomen.
- Vloeiend na herstel (`ALLEEN=squla-getallenlijn-kat-1-gouden npm run vloeiend`, gestart bij belasting ± 3,7, geen test
  ernaast): laptop 60 beelden/s, langste beeld 41 ms; trage telefoon 61 beelden/s, langste beeld 45 ms. Openen in de
  ontwikkelversie 2,6 s / 5,1 s (alleen een waarschuwing; op de echte site moet het onder 1 s, niet gemeten: niets online).

## Inhoud (15.22) en rekenen (14.30, 11.9)

- Zelfde 15 vragen als `squla-getallenlijn-kat-1`, zelfde volgorde, lijnen, goede antwoorden en keuzes (het script
  vergelijkt het per vraag met de oude les). De oude les (`squla-getallenlijn.tsx`) en zijn vlak zijn sinds 34ac9eb niet
  veranderd (git log leeg daarna).
- **Precies 1 juist antwoord** bij alle 15 vragen: bij "bij welk getal" staat alleen het getal onder het raketje níet
  op de lijn en het staat precies 1 keer tussen de keuzes; "na 10" = 11; "meer" = 14; op volgorde komt de goede
  volgorde precies 1 keer voor; bij "wat staat er bij" staat precies 1 ding bij 17 en 14; "het dichtst bij" 18 (2 van
  de 20) en 11 (1 van de 10), geen gelijke afstand; "ongeveer" 11 en 19 precies onder het raketje.
- Uitlegvraag na Nee: 3 bogen van 0 naar 3, keuzes 2 / 3 / 4, goed = 3.

## Hints en verklappen (15.17, 14.31, 14.36)

- Per fout antwoord blijven er na eerste zin + hint altijd 2 keuzes over (script; bij "wat is meer" zijn er maar 2
  keuzes, dan noemt Bliepo alleen de regel). Geen zin noemt het antwoord of 2 buren.
- Het rode rondje staat om het getal waar je vanaf telt (de 5, de 13, de 15) of om het bordje/vak dat Bliepo noemt,
  nooit om het antwoord; bij "ongeveer" geen rondje (de 10 ligt te dicht bij 11). Het handje wijst bij op volgorde
  alleen een leeg vak aan. Kleur verklapt niets: alle getallen wit, zoals op de lijn (gemeten: rgb 255,255,255).
- **Hersteld:** de hint "Kijk naar de 1/13. Het raketje staat 1 streepje verder." zei waar het raketje staat (zoals de
  klokzin uit 15.17). Nu: "Tel vanaf daar de streepjes tot het raketje."
- **Open vraag aan Sara (punt 8):** eerste zinnen als "15 is het streepje na het raketje." laten het antwoord met 1
  stapje vinden. Huisnummers doet hetzelfde ("9 ligt 1 huis te ver.") en is goedgekeurd; daarom niet veranderd.

## Was het terecht dat de bouwer de oude hints heeft veranderd? (WEGGEHAALD.md)

Ja. Nagerekend:
- "Zoek het getal dat vlak na 10 komt." bij "ongeveer" (raketje bij 11; keuzes 11 / 16 / 19): laat alleen 11 over → verklapt.
- "Tot en met 6 staat het goed." bij op volgorde (5 _ _ _ met 3 kaarten): als 5, 6 goed staan, blijft alleen 7, 8 over
  → verklapt.
- "5 is het streepje net vóór het raketje. Het raketje staat 1 streepje verder dan dat streepje." en "Kijk naar het
  streepje direct voor het raketje. Tel daar 1 bij." zeiden waar het raketje staat; nu een eerste zin uit de fouttabel en
  een telhint.
- Het handje dat de goede kaart naar het eerste vak schoof, wees het antwoord aan (15.17).
- Het groene getal op de witte lijn klopte niet met 2.1/2.2; nu wit met een lichtgolf.
- Het vinkje bij "wat staat er bij" en op volgorde volgt 6.5/7.8a.
Alles staat in WEGGEHAALD.md en KEUZES Ronde 27; de oude les is niet aangeraakt.

## "Bliepo verspringt" bij vraag 5: gebaar of fout?

Het vaste gebaar. Het testscript meet Bliepo's buitenrand; die verandert van [1116,590,236] naar [1121,605,225] bij de
uiting "… Wat is meer: 13 of 14?" en terug bij de lofzin, en opnieuw bij "Zet de getallen op volgorde. Van klein naar
groot." In `lib/bliepo-gebaren.ts` staat het betekenisgebaar `meer` (woorden "meer", "meeste", "groter dan") en het
gebaar voor groot/klein; 3.16 staat een groot gebaar toe "als een woord erom vraagt (… groot/klein …)". De overlap met
tekst, knoppen en pijl bleef 0 op alle 4 schermmaten. Geen fout; het sprongen-script telt gebaren mee (bekend sinds
Meer-minder).

## 15.16: het draaiboek past maar deels — mijn oordeel

Het draaiboek (Count the Jumps) is "helemaal gespeeld" maar zegt zelf: "deels bouwklaar voor het raketje"; geen van de 7
soorten vragen van de Squla-les zit erin. Strikt genomen zegt 15.16 dan "niets bouwen". Maar 15.3 staat een les "met
dezelfde soort interactie" toe als dat erbij staat, 15.22 punt 5 regelt vragen zonder Synthesis-voorbeeld (zelfde skelet,
hints als "eigen invulling"), en 15.25 zet Getallenlijn in de bouwvolgorde. De bouwer heeft het eerlijk gemarkeerd (elke
fouttabelrij "eigen invulling") en Sara de keuze gegeven (Ronde 27 punt 1). **Oordeel: verdedigbaar en netjes gemeld; geen
reden om af te keuren. Het is Sara's beslissing.** Wat echt van Synthesis komt (startvraag met proef, springen per 1 met
blijvende bogen, "steeds 1 streepje", de vraag "hoeveel sprongen?" met de denkfout "getallen geteld", samen springen)
klopt met het draaiboek.

## Per regel: wat afwijkt

| Regel | Oordeel |
|---|---|
| 15.22 inhoud Squla / 14.30 1 juist antwoord | goed |
| 15.9 fouttabel / 14.36–14.37 | goed (37 rijen + uitlegvraag; alle foute keuzes gespeeld) |
| 15.17 niets verklappen | goed na herstel (punt 3); vraag 8 aan Sara |
| 15.11 2 pogingen, voortgang | goed (goed in één keer / goed na een fout / samen gedaan; niets in de database zonder kind) |
| 15.18 nooit stoppen | goed (ook vangnet: 20 s niets) |
| 15.19 hulphandje | goed: alleen bij springen, op volgorde en de kleine stap, ± 6 s na de opdrachtzin, 1 zin, geen knop |
| 15.27 pijl | goed: nooit wachten op de pijl; geen pijl bij vraag, opdracht, handje en eindkaart; tik = meteen door (34–54 ms) |
| 15.28 / F7, 15.29 / F8 | goed: 0 in elke run, ook met de echte stem |
| 15.30 / F9 vaste zones | goed: 0 overlap, 0 sprongen van tekst en pijl, speelvlak 34 px links van het tekstvak, eindkaart 0 woorden eronder |
| 3.7 woorden mee met de stem | eerste woord 51 ms na de start (goed); einde niet aantoonbaar binnen ± 150 ms met de Google-stem (gedeelde schatting, bekend) |
| 3.12 1 woord voor 1 ding | **klein, hersteld** (stapjes → sprongen) |
| 3.15 knop 1 keer uitleggen | het vinkje wordt niet uitgelegd ("mag", zoals Meer-minder); advies in KEUZES 27b punt 4 |
| 3.16 gebaren | goed (zie boven) |
| 3.20 cijfers | goed ("1 streepje", "2 cijfers", "1 boog") |
| 4 startvraag | goed: het draaiboek heeft "laten zien wat je weet?"; Ja = proef van 2, 2 fouten = uitleg + alle 15 |
| 4.5 Nee = 6 stappen | goed: geruststellen, lijn uitleggen en tonen, zelf springen, vraag + wachten, waarom, "Nu jij" |
| 5.3 rood/groen, geen rood op keuze, geen fout-geluid | goed |
| 6.10 heel snel / tempo | goed: niets bij snel (Getallenlijn); door na ± 0,73–0,82 s |
| 3.17 naam | goed: groet + hooguit 1 lof |
| 2.1, 2.2, 14.27 kleur | goed: alle getallen wit, zoals op de witte lijn (gemeten) |
| 1.1–1.4, 14.23 beeld | **ernstig, hersteld** (onzichtbare kaarten, punt 1); verder goed |
| 1.23 plek goede antwoord wisselt | goed (keuzes, bordjes en kaarten geschud; kaarten nooit al op volgorde) |
| LESRECEPT Splitsen: 2e-fout-zin is uitleg | **middel, hersteld** (punt 2) |
| 10.1 vloeiend | goed: 60 beelden/s, langste beeld 41 ms (laptop) en 45 ms (trage telefoon) |
| F1–F9 | na herstel geen gevonden in deze les |
| Harde regel 2 | goed: 143 vóór en na |

## Gevonden punten (alle 4 hersteld in deze les)

1. **ERNSTIG — de kaarten bij "Zet de getallen op volgorde" (vraag 6 en 7, ook bij het samen voordoen) waren
   onzichtbaar.** `tover()` (holo/basis.ts) maakt een ding eerst doorzichtig en plat; de les legde de kaarten meteen
   daarna terug (`legKaart` → `killTweensOf`), en dan bleven ze doorzichtig. Het testscript tikt op onzichtbare
   HTML-knoppen over het vlak en merkte niets; alleen de schermfoto liet het zien. Herstel in
   `squla-getallenlijn-gouden-vlak.tsx`: na `killTweensOf` weer `setAlpha(1)` en de eigen schaal (kaarten én raketje).
   Schermfoto na herstel: de kaarten zijn er.
2. **MIDDEL — opdracht in de zin bij de 2e fout** ("Tel …", "Begin met …", "Wijs …") terwijl Bliepo het meteen samen
   voordoet. Nu uitleg (lijst in KINDTEST punt 2 en KEUZES Ronde 27b).
3. **KLEIN — hint die zegt waar het raketje staat** ("Het raketje staat 1 streepje verder.") → telhint.
4. **KLEIN — taal:** "stapjes" en "sprongen" voor hetzelfde → "sprongen"; "Tel vanaf de 10 1 streepje verder." →
   "… nog 1 streepje verder."; in de fouttabel "het raketje, die" → "dat".

Ook aangepast: `scripts/fouttabel-getallenlijn-gouden.ts` (de nieuwe zinnen worden nagelopen),
`scripts/test-getallenlijn-gouden.mjs` (schuift de link in het lesoverzicht opnieuw in beeld als hij onder de rand ligt).

## Dezelfde fout in andere gouden lessen (alleen gemeten, niets veranderd)

- **Onzichtbaar na `killTweensOf` op iets van `tover()`:** 0 van de 7 gezien. Alleen in Huisnummers kan het in theorie
  (`losTerug`), maar dat gebeurt pas na een fout, lang na het verschijnen.
- **Opdracht in de "weer"-zin bij de 2e fout:** 3 van de 7 — Huisnummers ("Tel elk huis mee: steeds 1 verder.", "Tel maar
  1 stap verder."), klok ("Zoek de kleine, dikke wijzer en volg hem tot zijn punt.", "Tel maar mee: precies 1 stap.") en
  Tellen ("Tel ook de … in de laatste rij.").
- **Hint die zegt waar het antwoord staat:** 1 van de 7 — de klok ("Na de 6 ga je maar 1 getal verder." en "Over 1 uur
  schuift de kleine wijzer 1 getal verder."), precies de zinnen die 15.17 al noemt; ze staan nog in de code.
- **2 woorden voor dezelfde stap:** niet gezocht buiten deze les.
Gemeld in LESRECEPT.md ("Geleerd bij de keuring Getallenlijn"); veranderen pas na akkoord van Sara.
