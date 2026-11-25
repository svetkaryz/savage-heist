# Savage Heist — Cold Storage

A one-mission, turn-based stealth puzzle that runs as a static website. No build step or server is required.

## Play locally

Open `index.html` in a modern browser. Use WASD or the arrow keys to move one tile, or click/tap an adjacent floor tile. Select **Noise decoy**, then click an open floor tile within four steps to pull the patrol away. Press Escape to cancel the selected tool.

Reach the amber ledger, then return to the green extraction tile. The guard moves after every action. Keep out of its line of sight and watch the heat meter.

## Publish

The game is made of `index.html`, `style.css`, and `game.js`, so it can be hosted as a static site. Upload the three files to a static web host or serve this folder from any static hosting provider. The display fonts load from Google Fonts when online; the page has local system font fallbacks.

## Current build

This is the first playable slice: one crew member, one job, one patrol, and a two-decoy loadout. The next production steps are adding more missions and guard patterns, sound and accessibility options, a title/mission selection screen, device testing, and a final visual pass before public release.
