#!/usr/bin/env bash
set -euo pipefail

: "${DEEPSEEK_API_KEY:?DEEPSEEK_API_KEY is verplicht}"
: "${OPENCODE_SERVER_PASSWORD:?OPENCODE_SERVER_PASSWORD is verplicht}"
: "${GITHUB_TOKEN:?GITHUB_TOKEN is verplicht voor repo-updates}"

mkdir -p /root/.config/opencode
cat > /root/.config/opencode/opencode.json <<'JSON'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "deepseek-custom/deepseek-v4-pro",
  "small_model": "deepseek-custom/deepseek-v4-pro",
  "provider": {
    "deepseek-custom": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepSeek API",
      "options": {
        "baseURL": "https://api.deepseek.com",
        "apiKey": "{env:DEEPSEEK_API_KEY}"
      },
      "models": {
        "deepseek-v4-pro": {
          "name": "DeepSeek V4 Pro",
          "tool_call": true
        }
      }
    }
  }
}
JSON

mkdir -p /workspace
cd /workspace
if [ ! -d /workspace/Thuisles/.git ]; then
  git clone --depth=1 https://github.com/crewDailyart-wq/Thuisles.git /workspace/Thuisles
fi
cd /workspace/Thuisles
git config user.name "Thuisles AI Studio"
git config user.email "ai-studio@users.noreply.github.com"

# Laat de hoofdbranch onaangeroerd en werk alleen op een werkbranch.
if [ -z "$(git branch --show-current)" ] || [ "$(git branch --show-current)" = main ]; then
  git switch -c ai-opencode-workspace 2>/dev/null || git switch ai-opencode-workspace
fi

# Alleen bereikbaar via Railway private networking. Geen publiek domein toevoegen.
exec opencode serve --hostname 0.0.0.0 --port "${PORT:-4096}"
