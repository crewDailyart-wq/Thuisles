# Thuisles — Projectcontext (Fase 1 → start development)

## Wat Thuisles is
Digitaal leerplatform voor Nederlandse basisschoolkinderen (groep 3 t/m 8).
Commercieel EdTech-platform, abonnementsmodel. Moet qua kwaliteit kunnen
concurreren met platforms als Squla, maar mag geen kopie zijn — eigen
identiteit en leerervaring.

## Scope nu
**Alleen Rekenen.** Geen Taal/Spelling/Begrijpend lezen/Engels content nu,
maar architectuur moet uitbreidbaar zijn zonder herbouw.

Binnen Rekenen: start met de domeinen **Getallen** en **Bewerkingen**
(optellen/aftrekken, vermenigvuldigen/delen, tafels), diep uitgewerkt over
groep 3–8, in plaats van breed-maar-oppervlakkig over alle domeinen.

## Twee gebruikers
- **Kind**: speelse, motiverende leeromgeving.
- **Ouder**: hoofdaccount, kinderen toevoegen, groep instellen, school +
  (indien bekend) rekenmethode koppelen, voortgang bekijken, abonnement
  beheren. Ouderomgeving moet rustig/betrouwbaar/professioneel aanvoelen.

## Leerstructuur
Vak → Domein → Subdomein → Leerdoel → Oefening → Vraag.
Een leerdoel heeft een groepsrange (bijv. "relevant groep 4–5"), geen vaste
groep — voor differentiatie binnen dezelfde groep.

Mastery-model per leerdoel (eenvoudig, uitlegbaar, geen AI nu):
nog niet gestart → oefent → bijna beheerst → beheerst.
Onderscheid bijhouden tussen: direct goed / goed na hulp / goed na meerdere
pogingen / nog niet beheerst.

## Schoolaansluiting (belangrijk differentiator)
Ouder kan een basisschool selecteren. Als de gebruikte rekenmethode
betrouwbaar bekend is, wordt dat getoond en gebruikt als **afstemmingslaag**
voor aanbevolen oefeningen — NIET als bron van de content zelf.

**Harde regel:** schoolgegevens en methode-info nooit verzinnen. Onbekend =
expliciet tonen als "Rekenmethode nog niet bekend." Herkomst van data moet
controleerbaar zijn. Door ouders aangeleverde info is niet automatisch
geverifieerd.

## Juridische kernregel content
Eigen, originele Thuisles-oefeningen. Nooit gekopieerde vragen/teksten/
uitleg/illustraties van bestaande methodes. Methodes alleen gebruiken als
metadata/afstemmingslaag, voor zover juridisch toegestaan. Geen logo's/
covers/branding van uitgevers zonder rechten. Nooit suggereren dat er een
officiële samenwerking is met een school/methode/uitgever als dat niet zo
is. Bij onzekerheid: **LEGAL REVIEW REQUIRED**, niet zelf aannemen dat iets mag.

## Fouten maken
Nooit hard "Fout." — wel bijv. "Nog niet helemaal. Probeer het nog eens.",
gevolgd door hint/uitleg/visuele steun/nieuwe poging.

## Privacy
Privacy-by-design, dataminimalisatie, geen onnodige tracking, geen
advertentieprofilering van kinderen, ouder als beheerder waar passend.
Bij twijfel: **PRIVACY REVIEW REQUIRED**.

## Startscherm van het kind (goedgekeurde richting, screen 1)
Structuur (zie meegeleverde mockup-schermen in de chat):
- Navigatie: Start, Oefenen, Voortgang, Wereld, Maatje, Profiel
- Header: begroeting + lichte statusindicatoren (streak/munten/edelstenen)
- 3 hoofdkeuzes: **Oefenen** (zelf kiezen), **Voor jou** (aanbevolen,
  visueel uitgelicht als hoofdactie), **Mijn wereld**
- Vakkenmenu (Rekenen actief, overige vakken zichtbaar maar "later")
- Rekenpaneel: "Vrij oefenen" (subdomeinen) naast "Oefenen in volgorde van
  je methode" (blokken met status: voltooid/bezig/gesloten)
- Wereldpad onderaan: dorpen/gebieden, deels vergrendeld — visuele laag,
  nog niet gekoppeld aan een uitgewerkt gamification-systeem

## Nog NIET besloten (behandel als PROPOSED totdat expliciet goedgekeurd)
- Volledige gamification-mechaniek (wat ontgrendelt wat, munten-economie,
  rol van het "maatje")
- Abonnementsprijzen, gratis vs. premium indeling
- Exacte techstack/hosting (nu te bepalen in Claude Code, met analyse eerst
  bij grote keuzes — niet zomaar kiezen)
- Interactieve schoolkaart van Nederland (mag naar latere fase)

## Werkwijze-afspraak
Fase voor fase. Bij grote/onomkeerbare beslissingen (architectuur, data-
model, auth-aanpak, privacygevoelige keuzes): eerst analyse + opties +
voor-/nadelen + aanbeveling voorleggen, dan pas bouwen. Kleine implementatie-
details mogen zelfstandig professioneel worden ingevuld. Nieuwste expliciete
beslissing van de opdrachtgever heeft altijd voorrang op eerdere ideeën.
