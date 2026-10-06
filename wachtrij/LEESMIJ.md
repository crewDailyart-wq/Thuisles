# Wachtrij — tijdelijke werkwijze

Alleen voor nu; staat met opzet niet in CLAUDE.md. Als alles af is, verdwijnt
deze map helemaal, en daarmee ook deze werkwijze.

- **"BEWAAR:"** — begint een bericht hiermee, dan wordt het NIET uitgevoerd. De
  tekst na "BEWAAR:" komt letterlijk in een nieuw bestand in deze map, met een
  volgnummer en een korte naam (bijvoorbeeld `00-geldnotatie-bouwen.md`). Dat
  wordt gecommit, en het antwoord is alleen: "Bewaard als 00." (met het juiste
  nummer).
- **"WERK DE WACHTRIJ AF"** — dan worden alle bestanden in deze map uitgevoerd,
  in volgorde van nummer, in één keer achter elkaar:
  - Eerst `npm run backup`.
  - Geen vragen stellen. Bij een vraag of twijfel de veiligste oplossing
    kiezen, de vraag in NACHTRAPPORT.md zetten onder "Vragen voor Sara" en
    doorgaan.
  - Niets uit de database verwijderen en geen antwoorden of voortgang van
    kinderen aanpassen.
  - Alleen testen met het profiel "Testkind".
  - Na elk afgerond bestand committen en pushen.
  - Aan het eind onderaan NACHTRAPPORT.md per bestand één zin: gedaan of niet,
    en wat de eigenaar zelf moet testen.
- **Als alle bestanden af zijn:** de map `wachtrij/` helemaal verwijderen (ook
  dit bestand), committen en pushen. Daarna geldt deze werkwijze niet meer.
