# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PAX MAN is a browser-based Pac-Man clone styled with PAX brand colors (purple and neon green). It's a vanilla HTML/CSS/JavaScript project with zero dependencies and no build system.

## Running the Game

Open `index.html` in a modern browser. There is no build step, no package manager, and no dev server required.

## Codebase Structure

The entire project is three files:

- **`index.html`** — HTML shell with canvas element, score/lives UI, start overlay, and mobile controls container
- **`style.css`** — Theming via CSS custom properties, responsive layout, mobile touch controls (shown via `pointer: coarse` media query)
- **`game.js`** — All game logic (~780 lines) wrapped in an IIFE with `"use strict"`

## Architecture (game.js)

The game follows a classic game-loop architecture:

**State machine** — `gameState` drives flow: `"start"` → `"playing"` → `"dying"` / `"won"` / `"gameover"`

**Maze** — 28x31 tile grid defined as `MAZE_TEMPLATE` (2D number array). Tile types: 0=path, 1=wall, 2=dot, 3=power dot, 4=ghost gate, 5=tunnel (wraps horizontally).

**Entities** — Paxman and 4 ghosts (Blinky, Pinky, Inky, Clyde) each track grid position, direction, and a `progress` value (0–1) for smooth inter-tile animation.

**Ghost AI** — Each ghost has unique targeting behavior. Movement uses A* pathfinding with Manhattan distance heuristic. Ghosts cycle between scatter/chase modes on timers, enter scared mode when Paxman eats a power dot.

**Game loop** — `requestAnimationFrame` at ~60 FPS with delta-time capping at 50ms. Each frame: process input → update movement → check collisions → render.

**Rendering** — All drawing is Canvas 2D API. Maze walls use adjacent-edge outline rendering. Paxman mouth animates via sine wave. Ghost eyes track movement direction.

**Input** — Arrow keys / WASD for desktop. Touch swipe detection + on-screen directional buttons for mobile.

**Persistence** — High score stored in `localStorage`.

## Key Constants

Speeds (tiles/frame): Paxman 0.11, Ghost 0.09, Scared ghost 0.055, Tunnel 0.05. Mode durations: Scatter 7s, Chase 20s, Scared 8s (flashing starts at 5s). Ghost release: Blinky immediate, Pinky 0s, Inky 3s, Clyde 6s.
