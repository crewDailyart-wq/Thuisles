#!/bin/sh
# Exporteert een Godot-bouwsteen naar public/godot/<naam>/ (web, single-threaded).
# Gebruik: sh scripts/godot-export.sh groepjesmaker
set -e
NAAM="$1"
GODOT="${GODOT:-$HOME/Downloads/Godot.app/Contents/MacOS/Godot}"
HIER="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$HIER/public/godot/$NAAM"
"$GODOT" --headless --path "$HIER/godot/$NAAM" --import >/dev/null 2>&1
"$GODOT" --headless --path "$HIER/godot/$NAAM" --export-release "Web" "$HIER/public/godot/$NAAM/index.html"
ls -l "$HIER/public/godot/$NAAM"
