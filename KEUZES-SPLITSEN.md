# KEUZES-SPLITSEN — voor Sara (wordt later samengevoegd in KEUZES-VOOR-SARA.md)

18 november 2026. Hoort bij: warmere zinnen en variatie in de gouden les Splitsen en de extra les Splitsen (zelfde aanpak als de proefles Tellen, Ronde 49). Oud naast nieuw: WIJZIGINGEN-ZINNEN-SPLITSEN.md.

## 1. Stem van Ruth: schatting (er is NIETS gemaakt)

De nieuwe zinnen zijn nog niet door Ruth ingesproken. Tot dan zegt Bliepo ze met de browserstem.

| | Nieuwe losse zinnen | Tekens | Als hele stukken (2 zinnen aan elkaar, zoals de site ze nu maakt) |
|---|---|---|---|
| Gouden les Splitsen | ongeveer 530 | ongeveer 17.700 | ongeveer 665 stukken, 32.900 tekens |
| Extra les Splitsen | ongeveer 500 | ongeveer 11.200 | ongeveer 560 stukken, 21.600 tekens |
| **Samen** | **ongeveer 1.030** | **ongeveer 28.900** | **ongeveer 1.225 stukken, 54.500 tekens** |

- Het zijn er veel omdat elke zin met elk getal apart telt ("Je legde 4 pionnen in het paarse vak.", "Je legde 5 pionnen …").
- Kosten bij ElevenLabs: 1 tegoed per teken (of een half, hangt af van het model). Dus tussen ongeveer 14.500 en ongeveer 54.500 tegoed.
- Hoeveel tegoed er nu nog is, heb ik niet opgevraagd (ik heb ElevenLabs niet aangeraakt).
- Dit is meer dan 5.000 tegoed: ik maak niets zonder jouw ja (harde regel 9).

**Vraag 1:** wil je deze zinnen laten inspreken, en zo ja: nu, of pas als alle lessen deze aanpak hebben (dan is het 1 bestelling)?

## 2. Keuzes die ik gemaakt heb (zeg het als je het anders wilt)

1. **Doos met de doek (vraag 11 t/m 15).** Er stond "Sleep die ballen naar het vak." Maar de ballen onder de doek kun je niet pakken; het kind sleept ballen uit het rijtje onderaan. Nu: "De andere liggen onder de doek. Sleep net zoveel ballen naar het vak." Het getal, het antwoord en wat het kind doet zijn gelijk gebleven.
2. **"Ontbreken" in plaats van "missen"** (jouw voorbeeld): "Sleep in elk leeg vakje de ballen die nog ontbreken." en "de ballen die nog ontbreken tot 10". Is "ontbreken" goed voor groep 3, of wil je liever "de ballen die er nog bij moeten"?
3. **"Natuurlijk."** (na het goede antwoord op "Hoeveel pionnen zijn er samen?") is "Ja, dat klopt!" geworden. "Natuurlijk." klonk alsof de vraag te makkelijk was.
4. **Na "Nee" op de startvraag** zegt Bliepo nu de zin van Synthesis: "Dat geeft niet, we komen er wel. We kijken eerst samen hoe splitsen gaat." (was: "Geen probleem. …").
5. **3 huisjes, 2 keer mis:** "Bij het huisje met 6 klopt het weer niet." zegt Bliepo nu alleen als het hetzelfde huisje is als de 1e keer. Bij een ander huisje klopte "weer" niet.
6. **Extra les, na het kiezen van 8 of 10:** Bliepo zei "Goede keuze. Splits 8 in 2 delen." en meteen daarna nog eens "Splits 8 in 2 delen." Nu: "Goede keuze!" en dan 1 keer de opdracht.
7. **Extra les, hint bij "de delen samen":** erbij gekomen "Er moeten nog stippen bij. Tik op een plus." / "Er moeten stippen af. Tik op een min." Dat zegt de richting, niet het antwoord (er zijn dan nog veel goede antwoorden). "Probeer een ander deel." is weg: te vaag.
8. **Hulphandje bij samen voordoen (doos en 3 huisjes):** bij het handje zei Bliepo de hele lange zin nog een keer. Nu kort: "Sleep de laatste bal naar het vak."

9. **Extra les, de hint na de 1e keer bij een keuzevraag:** na de hint stond er alleen "Kijk naar de cirkel bovenaan." in beeld, zonder vraag (de nieuwe controle F16 van vandaag vond dat). Nu eindigt de hint met de vraag, anders verwoord: "Het totaal is alles samen. Hoeveel stippen staan er in de cirkel bovenaan?"
10. **Bliepo werd even kleiner** bij de langste zin na een 1e keer mis ("Toe maar, probeer het nog eens. Sleep 6 pionnen …"). Die variant is korter gemaakt: "Toe maar, nog 1 keer."

## 2b. Nog open (niet van deze klus, wel gezien)

- **Begin van de gouden les Splitsen (F16):** als er nog niet getikt is, staat alleen "Hoi Testkind! Fijn dat je er bent." met Ja en Nee in beeld; de startvraag komt pas na de eerste tik. Dat was al zo vóór deze klus (de eerste zin wacht op de eerste tik). Ik heb het niet veranderd: het hoort bij de controle F16 voor alle gouden lessen.
- **F16 kent het woord "verander" niet** als opdracht ("Verander een deel. Samen moet het 7 zijn."). Voorstel: "verander" toevoegen aan de lijst in `scripts/vraag-aanwezig-controle.mjs` (niet mijn bestand).

## 3. Voorstel voor een regel (ik heb BOUWREGELS.md niet aangeraakt)

- **De opdracht zegt wat het kind echt kan pakken.** Niet "Sleep de ballen onder de doek" als die ballen niet te pakken zijn, maar "Sleep net zoveel ballen naar het vak." (Hoort bij 15.36 en 3.12.)
- **Bij het hulphandje nooit de hele opdracht nog een keer:** 1 korte zin (hoort bij 15.19 en 3.23).

## 4. Getest

Zie het rapport bij de commit (fouttabel-scripts, opgaven, inhoudsvergelijk, stemdubbel, de 2 tests en de speelcontrole).
