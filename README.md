# Savage Heist — Cold Storage

A one-mission, turn-based stealth puzzle that runs as a static website. No build step or server is required.

## Play locally

Open `index.html` in a modern browser. The short opening animation skips with any key or tap. Use WASD or the arrow keys to move one tile, or click/tap an adjacent floor tile. Red tiles show the guard's current sight. Select **Noise decoy**, then click an open floor tile you can walk to in four moves. Press Escape to cancel the selected tool.

Reach the amber ledger, then return to the green EXIT tile. The guard moves after every action. If it sees you, HEAT rises; at 100%, the run ends. Your best score is saved in this browser.

## Publish

The game is made of `index.html`, `style.css`, and `game.js`, so it can be hosted as a static site. Upload the three files to a static web host or serve this folder from any static hosting provider. The display fonts load from Google Fonts when online; the page has local system font fallbacks.

## Current build

This is the first playable slice: one crew member, one job, one patrol, and a two-decoy loadout. It includes a skippable opening animation, an in-game plain-language guide, a visible sight zone, and a saved best score. More missions and guard patterns, sound options, device testing, and a final visual pass are still planned.
