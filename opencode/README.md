# OpenCode-agent voor Thuisles (aparte Railway-service)

Deze map bouwt een **afzonderlijke** programmeerengine met een echte git-werkmap.
Hij hoort NIET als vervanging van de bestaande Thuisles-website ingezet te worden.

## Railway
Maak in hetzelfde Railway-project een tweede service met GitHub-bron `crewDailyart-wq/Thuisles`.
Gebruik **Dockerfile Path**: `opencode/Dockerfile` en geef de service naam `opencode-agent`.
Maak voor deze service GEEN publiek domein aan. Railway private networking moet aan staan.

Variabelen van de agentservice:
- `DEEPSEEK_API_KEY`: je eigen DeepSeek API-token
- `OPENCODE_SERVER_PASSWORD`: een nieuw willekeurig sterk wachtwoord (NIET je AI Studio-inlogwachtwoord)
- `GITHUB_TOKEN`: uitsluitend minimaal noodzakelijke repo-rechten; gebruik een nieuwe sleutel als de oude ooit is gedeeld
- `PORT=4096`

Variabelen op de bestaande Thuisles-webservice:
- `OPENCODE_BASE_URL=http://opencode-agent.railway.internal:4096` (pas servicehostnaam aan indien afwijkend)
- `OPENCODE_SERVER_PASSWORD`: exact hetzelfde wachtwoord als op de agentservice.

In OpenCode kan DeepSeek als provider worden gekozen. De engine moet voor het eerste gebruik een model/providerconfiguratie krijgen die past bij het actuele DeepSeek-aanbod.

## Beveiliging en beperkingen

De server draait shell-commando's en kan bronbestanden wijzigen. Laat hem **nooit publiek** openstaan.
De AI Studio backend beschermt de proxy met het bestaande beheerderswachtwoord.
De broncode blijft in de aparte agentwerkmap. Publicatie naar GitHub/Railway moet later
als een aparte expliciete goedkeuractie worden gekoppeld; de huidige koppeling publiceert niets.
OpenCode-prompts hebben dus geen automatische rechten om productie te wijzigen.
