# Pax-Man

A browser-based Pac-Man clone with [Pax](https://www.pax.ch) branding.

![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-f7df1e) ![No Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

## Play

Open `index.html` in any modern browser. No build step, no dependencies, no server required.

**Controls:**
- **Desktop:** Arrow keys or WASD
- **Mobile:** Swipe or use the on-screen buttons

## Gameplay

- Collect all dots to win
- Eat power dots to turn ghosts blue and eat them for bonus points (200, 400, 800, 1600)
- 4 ghosts with unique AI personalities: Blinky, Pinky, Inky, and Clyde
- High score saved automatically

## Tech

Three files, zero dependencies:

| File | Purpose |
|------|---------|
| `index.html` | Game shell, canvas, UI overlays |
| `style.css` | Pax-themed styling, responsive layout |
| `game.js` | All game logic (~780 lines) |

Built with vanilla JavaScript, HTML5 Canvas, and CSS custom properties.
