# Wachtrij — tijdelijke werkwijze

Alleen voor nu; staat met opzet niet in CLAUDE.md. Als alles af is, verdwijnt
deze map helemaal, en daarmee ook deze werkwijze.

- **"BEWAAR:"** — begint een bericht hiermee, dan wordt het NIET uitgevoerd. De
  tekst na "BEWAAR:" komt letterlijk in een nieuw bestand in deze map, met een
  volgnummer en een korte naam (bijvoorbeeld `02-geldnotatie-bouwen.md`). Dat
  wordt gecommit, en het antwoord is alleen: "Bewaard als 02."
- **"WERK DE WACHTRIJ AF"** — dan worden alle bestanden in deze map uitgevoerd,
  in volgorde van nummer:
  - Eerst `npm run backup`.
  - Geen vragen stellen. Bij vastlopen de veiligste oplossing kiezen, het
    noteren in NACHTRAPPORT.md en doorgaan.
  - Niets uit de database verwijderen en geen voortgang of antwoorden van
    kinderen aanpassen, tenzij een bestand dat uitdrukkelijk toestaat.
  - Alleen testen met het profiel "Testkind".
  - Na elk afgerond bestand committen en pushen.
  - Aan het eind onderaan NACHTRAPPORT.md per bestand één zin: gedaan of niet,
    en wat de eigenaar zelf moet testen.
- **Als alle bestanden af zijn:** de map `wachtrij/` helemaal verwijderen (ook
  dit bestand), committen en pushen. Daarna geldt deze werkwijze niet meer.
