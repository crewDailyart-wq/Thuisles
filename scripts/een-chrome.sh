#!/bin/bash
# Precies 1 Chrome-test tegelijk (de laptop liep vast bij meer; besluit Sara, 27 nov 2026). Gebruik: scripts/een-chrome.sh <opdracht...>
SLOT=/tmp/thuisles-chrome.slot
while ! mkdir "$SLOT" 2>/dev/null; do
  oud=$(cat "$SLOT/pid" 2>/dev/null)
  if [ -n "$oud" ] && ! kill -0 "$oud" 2>/dev/null; then rm -rf "$SLOT"; continue; fi
  perl -e 'select(undef,undef,undef,5)'
done
echo $$ > "$SLOT/pid"
trap 'pkill -f -- "--headless=new" 2>/dev/null; rm -rf "$SLOT"' EXIT
"$@"
