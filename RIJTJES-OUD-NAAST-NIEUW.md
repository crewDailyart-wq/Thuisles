# De vaste rijtjes: oud naast nieuw (B9, 19 november 2026)

Wat Bliepo zegt bij een goed antwoord, aan het begin en aan het eind.

- **Oud** = de gewone Squla-lessen (niet aangeraakt, alleen gelezen): `squla-uitleg.ts` (`BEVESTIGINGEN`, `terugAankondiging`, `terugAfsluiting`), `squla-hulp.ts` (`squlaBegin`, `squlaEind`) en de beginzinnen in `src/lib/lessen/beginzinnen.json`.
- **Nieuw** = de gedeelde rijtjes van alle gouden lessen: `src/components/les/lessen/squla-klok-gouden-zinnen.ts` (dezelfde als BLIEPO-KARAKTER.md §3, §5, §10, §11, §12).
- Wat er veranderd is: WIJZIGINGEN-ZINNEN-RIJTJES.md. Vragen voor Sara: KEUZES-VOOR-SARA.md, Ronde 51. **Bijgewerkt 19 november 2026:** de punten met advies ja uit Ronde 51 zijn doorgevoerd (de tabellen hieronder tonen de nieuwe zinnen). Voorstel voor warmere zinnen: RIJTJES-VOORSTEL-WARMER.md; **doorgevoerd op 19 november 2026 (16 van de 25, besluit Sara), zie RIJTJES-RESULTAAT-WARMER.md**. Het afscheid aan het eind komt sinds dan pas na de tik op de kaart (BOUWREGELS 15.50). De tabellen hieronder tonen de nieuwste zinnen.
- De zinnen van de lessen in Synthesis-stijl (zoals `klokkijken.tsx`) staan hier bewust niet (BOUWREGELS 15.41).

---

## 1. Lof bij een goed antwoord in 1 keer

| Oud (Squla-lessen) | Nieuw (gouden lessen) |
|---|---|
| 1 rijtje van 16 korte woorden, voor elk goed antwoord (ook na een fout): Klopt. · Precies. · Goed gezien. · Dat is 'm. · Heel goed. · Mooi. · Ja, dat is het. · Perfect. · Netjes. · Ja, zo is het. · Goed gedaan. · Dat klopt. · Prima. · Helemaal goed. · Goed zo. · Ja! | `LOF`: 40 zinnen, waarvan 10 robotzinnen (zie hieronder). "Dat heb je goed gezien." alleen bij een kijkvraag. |
| Bijna altijd een punt: rustig, kort. | Bijna altijd een uitroepteken: warmer. |
| Geen robotzinnen. | Robotzinnen over het groene scherm en het geheugen, spaarzaam. |
| "Goed gezien." bij elke vraag. | "Dat heb je goed gezien." alleen bij een kijkvraag. |

**Nieuw, `LOF` (40):** Ja, dat is goed! · Helemaal goed, knap van jou! · Super gedaan! · Dat heb je goed gezien, zeg! *(kijkvraag)* · Knap gedaan! · Ja, zo is het! · Heel goed, ik ben blij! · Wauw, goed zeg! · Dat zit goed! · Jij weet het! · Precies goed! · Goed zo, dat kun jij! · Ja, die klopt! · Mooi zo! · Ja, die is het! · Prima gedaan! · Netjes gedaan, hoor! · Klopt helemaal! · Ja hoor, goed! · Wat goed van jou! · Top, daar word ik blij van! · Heel knap! · Zo doe je dat! · Lekker bezig! · Dat ging goed! · Goed gekozen! *(alleen na een keuzevraag)* · Ja, dat is het goede antwoord! · Helemaal raak! · Dat weet jij al! · Fijn, die is goed! · *(robot)* Kijk, mijn scherm wordt er groen van! · *(robot)* Mijn scherm is helemaal groen. Dat komt door jou! · *(robotplek)* Inderdaad, zo moet het! · *(robotplek)* Zie je, jij snapt het! · *(robot)* Groen scherm! Die is goed. · *(robot)* Dat stop ik in mijn geheugen: jij kunt dit! · *(robot)* Mijn scherm straalt groen voor jou! · *(robotplek)* Even kijken… ja, goed! · *(robot)* Die bewaar ik in mijn geheugen. Fijn! · *(robot)* Mijn scherm kleurt groen. Knap!

Zelfde zin in oud en nieuw: "Helemaal goed", "Goed zo", "Netjes", "Ja, zo is het", "Heel goed", "Dat klopt"/"Klopt helemaal".

## 2. Lof op een speciaal moment

| Oud | Nieuw (`MOMENT`, per les hooguit 1 keer per soort) |
|---|---|
| Bestaat niet. | **3 goed op rij:** Al 3 goed achter elkaar! · 3 keer op rij goed. Wauw! · Het gaat lekker: al 3 goed! · *(robot)* 3 keer goed! Dat zet ik in mijn geheugen. |
| | **Moeilijke vraag:** Dit was een moeilijke, en jij weet het! · Wauw, ook de lastige is goed! · Die was echt lastig. Knap van jou! · *(robot)* Moeilijke vraag, groen scherm. Super! |
| | **Eerste vraag:** Goed begin! · De eerste is al goed! · Zo, wat een goede start! · *(robotplek)* Zie je, jij begint meteen goed! |
| | **Laatste vraag:** En de laatste is ook goed! · Goed tot het eind! · Ook de laatste klopt. Knap! · *(robot)* De laatste vraag, en een groen scherm! |

"Na lang nadenken" staat wel in BLIEPO-KARAKTER.md §3.2, maar (nog) niet in de code.

## 3. Lof met de naam van het kind

| Oud | Nieuw (`NAAM_LOF`, hooguit 2 keer per les, nooit bij of na een fout) |
|---|---|
| Soms (± 1 op 5) de naam achter het korte woord: "Klopt, Sam." Hooguit 2 keer per les. | Goed zo, {naam}! · Knap gedaan, {naam}! · {naam}, dat is helemaal goed! · Ja, {naam}, zo is het! · Wat goed, {naam}! · Jij weet het, {naam}! · *(robot)* {naam}, mijn scherm wordt groen van jou! · *(robot)* {naam}, dat zet ik in mijn geheugen! |

## 4. Goed na een fout

| Oud | Nieuw (`BEVESTIG`, alleen een korte bevestiging, geen naam) |
|---|---|
| Hetzelfde rijtje als bij lof (zie 1). | Ja, nu is het goed. · Nu heb je hem! · Die is goed. Fijn! · Zo is het. Goed doorgezet! · Ja, nu klopt het. · Gevonden! *(alleen na een keuzevraag)* · Nu zit het goed. Mooi! · Ja, deze is het. · *(robot)* Nu wordt mijn scherm groen. · *(robotplek)* Inderdaad, nu is hij raak. |

## 5. Heel snel geantwoord

| Oud | Nieuw (`SNEL`, alleen waar het draaiboek het heeft) |
|---|---|
| Bestaat niet in de Squla-lessen. | Dat ging snel! · Wat was jij snel! · Snel en goed! |

## 6. Begin van de les (groet)

| Oud | Nieuw |
|---|---|
| Geen groet. Bliepo begint meteen met zin 1 (wat je gaat doen, per les eigen, 135 lessen) en zin 2 (een persoonlijke vraag, per les eigen, bijvoorbeeld "Kun je verder tellen vanaf een huisnummer?"). | Groet `NAAM_GROET`: **"Hoi {naam}! Fijn dat je er bent."** (zonder naam: "Hoi! Fijn dat je er bent."). Daarna de eigen beginzin van de les. |
| Na **Ja**: "Mooi." "Laat maar eens zien." | Per les eigen zinnen (bij de klok: "Fijn! Dan kijken we eerst of het lukt." enzovoort). |
| Na **Nee**: 1 van 4 zinnen, vast per les: "We doen het samen, stap voor stap." · "Ik help je op weg." · "We bekijken eerst een voorbeeld." · "Laten we het samen uitzoeken." Of: "Geen probleem." "Ik leg het kort uit." | Per les eigen zinnen (bij de klok: "Dat geeft niks. We gaan het samen bekijken." enzovoort). |
| Na het samen oefenen: "Nu ga je verder met oefenen." of "Nu jij!" | Per les eigen zinnen. |

BLIEPO-KARAKTER.md §5 heeft nog 5 andere groeten (Hallo! Kom, we beginnen. · Hoi, daar ben je! · …). Die worden in de code niet gebruikt: alle gouden lessen gebruiken alleen `NAAM_GROET`.

## 7. Einde van de les

| Oud | Nieuw (`EINDE`, 1 zin aan het eind; daarna altijd "Tik op de kaart."; een afscheid pas na de tik, 15.50) |
|---|---|
| Bij de kaart: **"Alles goed!"** (geen enkele fout) of **"Goed gewerkt!"** (wel fouten), soms met de naam ("Goed gewerkt, Sam!"), en daarachter een eigen zin per les ("Je kent de munten en de briefjes."). | Goed gedaan! *(na de tik: Ik zie je graag de volgende keer.)* · De les is klaar. Wat heb jij goed gewerkt! · Klaar! Je hebt veel geoefend vandaag. · Dat was de laatste. Fijn dat je meedeed! · Je bent klaar. Ik vond het leuk met jou! · Klaar! Wat heb je goed je best gedaan! · Dat was de les. Ik vond het fijn. *(na de tik: Tot snel!)* · *(robotplek)* Alles is af. Wat ben jij goed bezig geweest! · *(robot)* Deze les bewaar ik in mijn geheugen. *(na de tik: Tot de volgende keer!)* |
| — | Na veel fouten (de helft of meer niet in 1 keer goed): **"Je hebt goed doorgezet. Volgende keer gaat het nog beter."** |

## 8. Vragen die terugkomen

| Oud | Nieuw (bij de klok, `VAR.terug`, `VAR.extra`, `VAR.terugLastig`) |
|---|---|
| "Nog 1 vraag van net krijg je opnieuw." · "Die ene vraag van daarnet mag je nog een keer proberen." · "Er komt nog 1 vraag terug die net lastig was." (en hetzelfde voor meer vragen) | "Er komt nog 1 klok van net terug." · "We doen nog 1 klok van net." · "Nog 1 klok van net. Die oefenen we nog even." Miste het kind niets: "Nog 1 klok om te oefenen." |
| Weer mis: "Dit was nog lastig. Dat oefen je een andere keer verder." · "Niet erg. Deze vragen komen een andere keer weer langs." · "Dit gaat nog niet vanzelf. Met oefenen komt dat goed." · "Dat was best moeilijk. Je mag het later nog eens proberen." | "Deze klokken oefenen we een andere keer nog eens." · "Dit oefenen we een andere keer nog eens. Dat komt goed." |

## 9. Overige gedeelde rijtjes (alleen nieuw)

De oude Squla-lessen hebben hier geen rijtje voor.

- **Eerste zin als de denkfout niet duidelijk is (`ONDUIDELIJK`, 13):** Die is lastig, hè. · We zoeken het samen. · Ik help je een stukje. · Goed dat je het probeert. · Kom, we kijken samen. · Ik geef je een tip. · Ik bedoelde een andere. *(alleen keuzevraag)* · Dat geeft niks, zo leer je het. · Rustig maar, we doen het stap voor stap. · Probeer het nog 1 keer, met een tip. *(alleen na de 1e fout)* · *(robot)* Even in mijn geheugen kijken… ik heb een tip! · *(robot)* Mijn geheugen zegt: samen lukt dit vast. · *(robotplek)* Ik weet een hulpje voor jou. — BLIEPO-KARAKTER.md §10 heeft er 15; "Er is nog een betere keuze." en "Ik zie een andere die beter past." staan niet in de code.
- **Aanmoedigen (`AANMOEDIG`, 10; alleen de klok gebruikt dit gedeelde rijtje, de andere gouden lessen hebben een eigen rijtje voor tikken en slepen):** Neem rustig de tijd. · Je mag goed kijken. · Denk maar even na. · Je bent goed bezig. · Geen haast, hoor. · Rustig kijken mag. · Ik wacht wel even. · Jij kunt dit. · *(robotplek)* Ik sta klaar voor jouw antwoord. · *(robotplek)* Als je kiest, zie ik meteen of het klopt. *(alleen keuzevraag)*
- **Overgang (`OVERGANG`, 20):** Daar komt de volgende. · Op naar de volgende! · Hier is er weer een. · Nu de volgende. · Kijk, een nieuwe. · We gaan door. · Daar gaan we weer. · En nu deze. · Dan de volgende vraag. · Let goed op bij deze. · Hop, verder! · Nieuwe vraag! · Kijk mee naar de volgende. · Deze is voor jou. · Verder maar weer. · *(robotplek)* Die zit erop. Daar komt er nog een. · *(robot)* Opgeslagen in mijn geheugen. Verder! · *(robotplek)* Die is af. Ik heb er nog een. · *(robot)* Mijn geheugen heeft nog een vraag voor jou. · *(robotplek)* Dat was hem. Door naar de volgende!

---

## 10. Wat de controle vond (19 november 2026)

- **"Nagekeken" / "nakijken":** komt in geen enkele zin van de gedeelde rijtjes meer voor (alleen nog in uitleg in de code). Goed.
- **Grammatica:** alle 131 zinnen lopen goed. 1 echte fout zat in de code die de naam weghaalt als er geen naam is: "Goed zo, {naam}!" werd "Goed zo,!" en "Ja {naam}, zo is het!" werd "Ja zo is het!". Verbeterd (WIJZIGINGEN-ZINNEN-RIJTJES.md). Kinderen zagen dit nog niet: de les kiest een naamzin alleen als er een naam is.
- **Dubbel of bijna dubbel:** geen 2 precies dezelfde zinnen in 1 rijtje. Wel zinnen die erg op elkaar lijken (5 keer het groene scherm, 3 keer "Goed zo!", "Heel goed!" en "Helemaal goed!"). Dat is een keuze voor Sara: Ronde 51.
- **Woorden die niet bij het beeld passen:** "Goed gekozen!" en "Gevonden!" komen ook als het kind niets koos of zocht (tikken, slepen, de wijzer zetten). "De laatste vraag, en weer een groen scherm!" zegt "weer", ook als de vraag ervoor mis was. Vragen in Ronde 51.
