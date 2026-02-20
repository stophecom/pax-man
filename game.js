// ============================================================
// PAX MAN — A Pac-Man clone with PAX brand styling
// ============================================================

(function () {
    "use strict";

    // --- Constants -----------------------------------------------------------
    const TILE = 20;
    const COLS = 28;
    const ROWS = 31;
    const WIDTH = COLS * TILE;
    const HEIGHT = ROWS * TILE;

    const COLORS = {
        bg: "#0a0020",
        wall: "#5a1aa0",
        wallStroke: "#8ccd0f",
        dot: "#8ccd0f",
        powerDot: "#8ccd0f",
        paxman: "#8ccd0f",
        paxmanMouth: "#0a0020",
        ghostScared: "#2233ff",
        ghostScaredEnd: "#ffffff",
        text: "#ffffff",
        gate: "#579e00",
    };

    const GHOST_COLORS = ["#ff3333", "#ffb3ff", "#00eeff", "#ffb852"];
    const GHOST_NAMES = ["blinky", "pinky", "inky", "clyde"];

    const DIR = {
        NONE: { x: 0, y: 0 },
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
    };

    const SPEEDS = {
        paxman: 0.11,
        ghost: 0.09,
        ghostScared: 0.055,
        ghostTunnel: 0.05,
    };

    const SCATTER_DURATION = 7000;
    const CHASE_DURATION = 20000;
    const SCARED_DURATION = 8000;
    const SCARED_FLASH_AT = 5000;
    const FRAME_MS = 1000 / 60;

    // --- Maze ----------------------------------------------------------------
    // 0 = empty/path, 1 = wall, 2 = dot, 3 = power dot, 4 = ghost gate, 5 = tunnel
    // prettier-ignore
    const MAZE_TEMPLATE = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [5,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,5],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    // --- DOM / Canvas --------------------------------------------------------
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const overlay = document.getElementById("overlay");
    const overlayTitle = document.getElementById("overlay-title");
    const overlayMsg = document.getElementById("overlay-message");
    const overlayBtn = document.getElementById("overlay-btn");
    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("high-score");
    const livesEl = document.getElementById("lives-display");

    // Add mobile controls
    const container = document.getElementById("game-container");
    const mobileControls = document.createElement("div");
    mobileControls.id = "mobile-controls";
    mobileControls.innerHTML = `
        <button class="mobile-btn" data-dir="up" style="grid-area:up">▲</button>
        <button class="mobile-btn" data-dir="left" style="grid-area:left">◀</button>
        <button class="mobile-btn" data-dir="right" style="grid-area:right">▶</button>
        <button class="mobile-btn" data-dir="down" style="grid-area:down">▼</button>
    `;
    container.appendChild(mobileControls);

    // --- Game State ----------------------------------------------------------
    let maze = [];
    let score = 0;
    let highScore = parseInt(localStorage.getItem("paxman-high") || "0", 10);
    let lives = 3;
    let totalDots = 0;
    let dotsEaten = 0;
    let gameState = "start"; // start, playing, dying, won, gameover
    let animFrame = 0;
    let lastTime = 0;
    let modeTimer = 0;
    let ghostMode = "scatter"; // scatter, chase, scared
    let scaredTimer = 0;
    let ghostsEatenCombo = 0;

    // --- Player --------------------------------------------------------------
    const paxman = {
        x: 14,
        y: 23,
        dir: DIR.NONE,
        nextDir: DIR.NONE,
        progress: 0,
        mouthAngle: 0,
        mouthOpen: true,
        alive: true,
        deathFrame: 0,
    };

    // --- Ghosts --------------------------------------------------------------
    function createGhost(name, color, startX, startY, scatterTarget) {
        return {
            name,
            color,
            x: startX,
            y: startY,
            startX,
            startY,
            dir: DIR.UP,
            progress: 0,
            mode: "house", // house, leaving, scatter, chase, scared, eaten
            scatterTarget,
            houseTimer: 0,
            eyeDir: DIR.UP,
        };
    }

    let ghosts = [];

    function initGhosts() {
        ghosts = [
            createGhost("blinky", GHOST_COLORS[0], 14, 11, { x: 25, y: 0 }),
            createGhost("pinky", GHOST_COLORS[1], 14, 14, { x: 2, y: 0 }),
            createGhost("inky", GHOST_COLORS[2], 12, 14, { x: 27, y: 30 }),
            createGhost("clyde", GHOST_COLORS[3], 16, 14, { x: 0, y: 30 }),
        ];
        ghosts[0].mode = "scatter";
        ghosts[0].dir = DIR.LEFT;
        ghosts[1].houseTimer = 0;
        ghosts[2].houseTimer = 3000;
        ghosts[3].houseTimer = 6000;
    }

    // --- Maze utils ----------------------------------------------------------
    function resetMaze() {
        maze = MAZE_TEMPLATE.map((row) => [...row]);
        totalDots = 0;
        dotsEaten = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (maze[r][c] === 2 || maze[r][c] === 3) totalDots++;
            }
        }
    }

    function tileAt(col, row) {
        if (row < 0 || row >= ROWS) return 1;
        if (col < 0 || col >= COLS) return 5; // tunnel wrapping
        return maze[row][col];
    }

    function isWalkable(col, row, isGhost, isEaten) {
        const t = tileAt(col, row);
        if (t === 1) return false;
        if (t === 4) return isGhost; // gate
        return true;
    }

    function wrapX(x) {
        if (x < -1) return COLS;
        if (x > COLS) return -1;
        return x;
    }

    // --- Drawing --------------------------------------------------------------
    function drawMaze() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const t = maze[r][c];
                const x = c * TILE;
                const y = r * TILE;

                if (t === 1) {
                    drawWallTile(c, r, x, y);
                } else if (t === 2) {
                    ctx.fillStyle = COLORS.dot;
                    ctx.beginPath();
                    ctx.arc(x + TILE / 2, y + TILE / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (t === 3) {
                    ctx.fillStyle = COLORS.powerDot;
                    const pulse = 0.6 + 0.4 * Math.sin(animFrame * 0.08);
                    ctx.globalAlpha = pulse;
                    ctx.beginPath();
                    ctx.arc(x + TILE / 2, y + TILE / 2, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                } else if (t === 4) {
                    ctx.fillStyle = COLORS.gate;
                    ctx.fillRect(x, y + TILE / 2 - 2, TILE, 4);
                }
            }
        }
    }

    function drawWallTile(c, r, x, y) {
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(x, y, TILE, TILE);

        ctx.strokeStyle = COLORS.wallStroke;
        ctx.lineWidth = 1;

        const u = tileAt(c, r - 1) !== 1;
        const d = tileAt(c, r + 1) !== 1;
        const l = tileAt(c - 1, r) !== 1;
        const ri = tileAt(c + 1, r) !== 1;

        if (u) { ctx.beginPath(); ctx.moveTo(x, y + 0.5); ctx.lineTo(x + TILE, y + 0.5); ctx.stroke(); }
        if (d) { ctx.beginPath(); ctx.moveTo(x, y + TILE - 0.5); ctx.lineTo(x + TILE, y + TILE - 0.5); ctx.stroke(); }
        if (l) { ctx.beginPath(); ctx.moveTo(x + 0.5, y); ctx.lineTo(x + 0.5, y + TILE); ctx.stroke(); }
        if (ri) { ctx.beginPath(); ctx.moveTo(x + TILE - 0.5, y); ctx.lineTo(x + TILE - 0.5, y + TILE); ctx.stroke(); }
    }

    function drawPaxman() {
        if (!paxman.alive) {
            drawDeathAnimation();
            return;
        }
        const px = (paxman.x + paxman.dir.x * paxman.progress) * TILE + TILE / 2;
        const py = (paxman.y + paxman.dir.y * paxman.progress) * TILE + TILE / 2;
        const r = TILE / 2 - 1;

        const mouth = 0.25 * Math.abs(Math.sin(animFrame * 0.15));
        let angle = 0;
        if (paxman.dir === DIR.RIGHT) angle = 0;
        else if (paxman.dir === DIR.DOWN) angle = Math.PI / 2;
        else if (paxman.dir === DIR.LEFT) angle = Math.PI;
        else if (paxman.dir === DIR.UP) angle = -Math.PI / 2;

        ctx.fillStyle = COLORS.paxman;
        ctx.beginPath();
        ctx.arc(px, py, r, angle + mouth * Math.PI, angle + (2 - mouth) * Math.PI);
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.fill();
    }

    function drawDeathAnimation() {
        const px = paxman.x * TILE + TILE / 2;
        const py = paxman.y * TILE + TILE / 2;
        const r = TILE / 2 - 1;
        const f = paxman.deathFrame / 60;

        if (f < 1) {
            const mouth = f * Math.PI;
            ctx.fillStyle = COLORS.paxman;
            ctx.beginPath();
            ctx.arc(px, py, r, mouth, 2 * Math.PI - mouth);
            ctx.lineTo(px, py);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawGhost(ghost) {
        const px = (ghost.x + ghost.dir.x * ghost.progress) * TILE + TILE / 2;
        const py = (ghost.y + ghost.dir.y * ghost.progress) * TILE + TILE / 2;
        const r = TILE / 2 - 1;

        if (ghost.mode === "eaten") {
            drawGhostEyes(px, py, ghost.dir);
            return;
        }

        let color = ghost.color;
        if (ghost.mode === "scared") {
            const remaining = SCARED_DURATION - scaredTimer;
            if (remaining < SCARED_FLASH_AT && Math.floor(animFrame / 8) % 2 === 0) {
                color = COLORS.ghostScaredEnd;
            } else {
                color = COLORS.ghostScared;
            }
        }

        ctx.fillStyle = color;
        // Head
        ctx.beginPath();
        ctx.arc(px, py - 2, r, Math.PI, 0);
        // Body with wavy bottom
        const waveOffset = animFrame * 0.2;
        ctx.lineTo(px + r, py + r - 2);
        for (let i = r; i >= -r; i -= 2) {
            const wave = Math.sin(i * 0.8 + waveOffset) * 2;
            ctx.lineTo(px + i, py + r - 2 + wave);
        }
        ctx.lineTo(px - r, py - 2);
        ctx.closePath();
        ctx.fill();

        // Eyes
        if (ghost.mode !== "scared") {
            drawGhostEyes(px, py - 2, ghost.dir);
        } else {
            // Scared eyes
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(px - 4, py - 4, 2, 0, Math.PI * 2);
            ctx.arc(px + 4, py - 4, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawGhostEyes(px, py, dir) {
        const ex = dir === DIR.LEFT ? -2 : dir === DIR.RIGHT ? 2 : 0;
        const ey = dir === DIR.UP ? -2 : dir === DIR.DOWN ? 2 : 0;

        // White
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(px - 4, py - 2, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(px + 4, py - 2, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = "#1a0040";
        ctx.beginPath();
        ctx.arc(px - 4 + ex, py - 2 + ey, 2, 0, Math.PI * 2);
        ctx.arc(px + 4 + ex, py - 2 + ey, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawLives() {
        livesEl.innerHTML = "";
        for (let i = 0; i < lives; i++) {
            const div = document.createElement("div");
            div.className = "life-icon";
            livesEl.appendChild(div);
        }
    }

    // --- Movement Logic ------------------------------------------------------
    function canMove(entity, dir, isGhost) {
        const nx = entity.x + dir.x;
        const ny = entity.y + dir.y;
        return isWalkable(nx < 0 ? COLS - 1 : nx >= COLS ? 0 : nx, ny, isGhost);
    }

    function movePaxman(dt) {
        if (!paxman.alive) return;

        // Try next direction first
        if (paxman.nextDir !== DIR.NONE && paxman.progress < 0.1) {
            if (canMove(paxman, paxman.nextDir, false)) {
                paxman.dir = paxman.nextDir;
                paxman.nextDir = DIR.NONE;
            }
        }

        if (paxman.dir === DIR.NONE) return;

        const speed = SPEEDS.paxman;
        paxman.progress += speed * (dt / FRAME_MS);

        if (paxman.progress >= 1) {
            paxman.progress = 0;
            paxman.x += paxman.dir.x;
            paxman.y += paxman.dir.y;
            paxman.x = wrapX(paxman.x);
            if (paxman.x < 0) paxman.x = COLS - 1;
            if (paxman.x >= COLS) paxman.x = 0;

            // Eat dot
            const t = maze[paxman.y]?.[paxman.x];
            if (t === 2) {
                maze[paxman.y][paxman.x] = 0;
                score += 10;
                dotsEaten++;
            } else if (t === 3) {
                maze[paxman.y][paxman.x] = 0;
                score += 50;
                dotsEaten++;
                activateScaredMode();
            }

            // Check win
            if (dotsEaten >= totalDots) {
                gameState = "won";
                showOverlay("You win!", "All dots collected! Score: " + score, "Play again");
                return;
            }

            // Can we keep going?
            if (!canMove(paxman, paxman.dir, false)) {
                paxman.dir = DIR.NONE;
            }
        }
    }

    // --- Ghost AI ------------------------------------------------------------
    function getGhostTarget(ghost) {
        if (ghost.mode === "scared") {
            return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        }
        if (ghost.mode === "scatter") {
            return ghost.scatterTarget;
        }
        // Chase mode - each ghost has different targeting
        switch (ghost.name) {
            case "blinky":
                return { x: paxman.x, y: paxman.y };
            case "pinky":
                return { x: paxman.x + paxman.dir.x * 4, y: paxman.y + paxman.dir.y * 4 };
            case "inky": {
                const ahead = { x: paxman.x + paxman.dir.x * 2, y: paxman.y + paxman.dir.y * 2 };
                const blinky = ghosts[0];
                return { x: ahead.x + (ahead.x - blinky.x), y: ahead.y + (ahead.y - blinky.y) };
            }
            case "clyde": {
                const dist = Math.hypot(ghost.x - paxman.x, ghost.y - paxman.y);
                return dist > 8 ? { x: paxman.x, y: paxman.y } : ghost.scatterTarget;
            }
            default:
                return { x: paxman.x, y: paxman.y };
        }
    }

    function getOpposite(dir) {
        if (dir === DIR.UP) return DIR.DOWN;
        if (dir === DIR.DOWN) return DIR.UP;
        if (dir === DIR.LEFT) return DIR.RIGHT;
        if (dir === DIR.RIGHT) return DIR.LEFT;
        return DIR.NONE;
    }

    function chooseDirection(ghost, target) {
        const dirs = [DIR.UP, DIR.LEFT, DIR.DOWN, DIR.RIGHT];
        const opposite = getOpposite(ghost.dir);
        let bestDir = null;
        let bestDist = Infinity;

        for (const d of dirs) {
            if (d === opposite) continue;
            const nx = ghost.x + d.x;
            const ny = ghost.y + d.y;
            const wnx = nx < 0 ? COLS - 1 : nx >= COLS ? 0 : nx;
            if (!isWalkable(wnx, ny, true, ghost.mode === "eaten")) continue;
            if (tileAt(wnx, ny) === 4 && ghost.mode !== "leaving" && ghost.mode !== "eaten") {
                // Only allow going through gate when leaving house or eaten
                if (ghost.mode !== "house" || d !== DIR.UP) continue;
            }
            const dist = Math.hypot(nx - target.x, ny - target.y);
            if (dist < bestDist) {
                bestDist = dist;
                bestDir = d;
            }
        }
        // Dead end: reverse rather than walk through a wall
        return bestDir !== null ? bestDir : opposite;
    }

    function moveGhost(ghost, dt) {
        // House logic
        if (ghost.mode === "house") {
            ghost.houseTimer -= dt;
            if (ghost.houseTimer <= 0) {
                ghost.mode = "leaving";
                ghost.x = 14;
                ghost.y = 14;
                ghost.dir = DIR.UP;
                ghost.progress = 0;
            }
            return;
        }

        if (ghost.mode === "leaving") {
            ghost.progress += SPEEDS.ghost * (dt / FRAME_MS);
            if (ghost.progress >= 1) {
                ghost.progress = 0;
                ghost.y += ghost.dir.y;
                ghost.x += ghost.dir.x;
                if (ghost.y <= 11) {
                    ghost.mode = ghostMode === "scared" ? "scared" : ghostMode;
                    ghost.dir = DIR.LEFT;
                }
            }
            return;
        }

        const isTunnel = ghost.x < 1 || ghost.x >= COLS - 1;
        let speed = ghost.mode === "scared" ? SPEEDS.ghostScared :
                    isTunnel ? SPEEDS.ghostTunnel :
                    ghost.mode === "eaten" ? SPEEDS.paxman * 1.5 :
                    SPEEDS.ghost;

        ghost.progress += speed * (dt / FRAME_MS);

        if (ghost.progress >= 1) {
            ghost.progress = 0;
            ghost.x += ghost.dir.x;
            ghost.y += ghost.dir.y;
            ghost.x = wrapX(ghost.x);
            if (ghost.x < 0) ghost.x = COLS - 1;
            if (ghost.x >= COLS) ghost.x = 0;

            // Check if eaten ghost reached home
            if (ghost.mode === "eaten" && ghost.x >= 12 && ghost.x <= 16 && ghost.y >= 13 && ghost.y <= 15) {
                ghost.mode = "leaving";
                ghost.x = 14;
                ghost.y = 14;
                ghost.dir = DIR.UP;
                ghost.progress = 0;
                return;
            }

            const target = ghost.mode === "eaten"
                ? { x: 14, y: 14 }
                : getGhostTarget(ghost);
            ghost.dir = chooseDirection(ghost, target);
        }
    }

    // --- Collision ------------------------------------------------------------
    function checkCollision() {
        for (const ghost of ghosts) {
            if (ghost.mode === "house" || ghost.mode === "leaving" || ghost.mode === "eaten") continue;

            const gx = ghost.x + ghost.dir.x * ghost.progress;
            const gy = ghost.y + ghost.dir.y * ghost.progress;
            const px = paxman.x + paxman.dir.x * paxman.progress;
            const py = paxman.y + paxman.dir.y * paxman.progress;

            if (Math.hypot(gx - px, gy - py) < 0.8) {
                if (ghost.mode === "scared") {
                    eatGhost(ghost);
                } else {
                    killPaxman();
                    return;
                }
            }
        }
    }

    function eatGhost(ghost) {
        ghost.mode = "eaten";
        ghostsEatenCombo++;
        const points = 200 * Math.pow(2, ghostsEatenCombo - 1);
        score += points;
    }

    function killPaxman() {
        paxman.alive = false;
        paxman.deathFrame = 0;
        paxman.dir = DIR.NONE;
        gameState = "dying";
    }

    function respawnAfterDeath() {
        lives--;
        if (lives <= 0) {
            gameState = "gameover";
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("paxman-high", String(highScore));
            }
            showOverlay("Game over", "Final score: " + score, "Try again");
            return;
        }
        resetPositions();
        gameState = "playing";
        drawLives();
    }

    function resetPositions() {
        paxman.x = 14;
        paxman.y = 23;
        paxman.dir = DIR.NONE;
        paxman.nextDir = DIR.NONE;
        paxman.progress = 0;
        paxman.alive = true;
        paxman.deathFrame = 0;

        initGhosts();
        ghostMode = "scatter";
        modeTimer = 0;
        scaredTimer = 0;
    }

    // --- Mode management -----------------------------------------------------
    function activateScaredMode() {
        scaredTimer = 0;
        ghostsEatenCombo = 0;
        for (const g of ghosts) {
            if (g.mode === "scatter" || g.mode === "chase") {
                g.mode = "scared";
                g.dir = getOpposite(g.dir);
            }
        }
    }

    function updateGhostModes(dt) {
        if (ghosts.some((g) => g.mode === "scared")) {
            scaredTimer += dt;
            if (scaredTimer >= SCARED_DURATION) {
                for (const g of ghosts) {
                    if (g.mode === "scared") g.mode = ghostMode;
                }
                scaredTimer = 0;
            }
            return;
        }

        modeTimer += dt;
        if (ghostMode === "scatter" && modeTimer >= SCATTER_DURATION) {
            ghostMode = "chase";
            modeTimer = 0;
            for (const g of ghosts) {
                if (g.mode === "scatter") {
                    g.mode = "chase";
                    g.dir = getOpposite(g.dir);
                }
            }
        } else if (ghostMode === "chase" && modeTimer >= CHASE_DURATION) {
            ghostMode = "scatter";
            modeTimer = 0;
            for (const g of ghosts) {
                if (g.mode === "chase") {
                    g.mode = "scatter";
                    g.dir = getOpposite(g.dir);
                }
            }
        }
    }

    // --- Overlay controls ----------------------------------------------------
    function showOverlay(title, message, btnText) {
        overlayTitle.textContent = title;
        overlayMsg.textContent = message;
        overlayBtn.textContent = btnText;
        overlay.classList.remove("hidden");
    }

    function hideOverlay() {
        overlay.classList.add("hidden");
    }

    // --- Input ---------------------------------------------------------------
    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowUp": case "w": case "W": paxman.nextDir = DIR.UP; e.preventDefault(); break;
            case "ArrowDown": case "s": case "S": paxman.nextDir = DIR.DOWN; e.preventDefault(); break;
            case "ArrowLeft": case "a": case "A": paxman.nextDir = DIR.LEFT; e.preventDefault(); break;
            case "ArrowRight": case "d": case "D": paxman.nextDir = DIR.RIGHT; e.preventDefault(); break;
        }
    });

    // Mobile controls
    mobileControls.addEventListener("pointerdown", (e) => {
        const btn = e.target.closest("[data-dir]");
        if (!btn) return;
        e.preventDefault();
        switch (btn.dataset.dir) {
            case "up": paxman.nextDir = DIR.UP; break;
            case "down": paxman.nextDir = DIR.DOWN; break;
            case "left": paxman.nextDir = DIR.LEFT; break;
            case "right": paxman.nextDir = DIR.RIGHT; break;
        }
    });

    // Touch swipe support
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });
    canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            paxman.nextDir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
        } else {
            paxman.nextDir = dy > 0 ? DIR.DOWN : DIR.UP;
        }
    });

    overlayBtn.addEventListener("click", startGame);

    // --- Game loop -----------------------------------------------------------
    function startGame() {
        hideOverlay();
        score = 0;
        lives = 3;
        resetMaze();
        resetPositions();
        gameState = "playing";
        drawLives();
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function gameLoop(timestamp) {
        const dt = Math.min(timestamp - lastTime, 50); // cap delta
        lastTime = timestamp;
        animFrame++;

        if (gameState === "playing") {
            updateGhostModes(dt);
            movePaxman(dt);
            for (const g of ghosts) moveGhost(g, dt);
            checkCollision();
        } else if (gameState === "dying") {
            paxman.deathFrame++;
            if (paxman.deathFrame > 70) {
                respawnAfterDeath();
            }
        }

        // Draw
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        drawMaze();
        if (gameState === "playing" || gameState === "dying") {
            drawPaxman();
            if (gameState !== "dying") {
                for (const g of ghosts) drawGhost(g);
            }
        }

        scoreEl.textContent = score;
        highScoreEl.textContent = Math.max(highScore, score);

        if (gameState !== "start" && gameState !== "won" && gameState !== "gameover") {
            requestAnimationFrame(gameLoop);
        }
    }

    // --- Init ----------------------------------------------------------------
    highScoreEl.textContent = highScore;
    drawLives();
    resetMaze();

    // Draw initial maze preview
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawMaze();

    showOverlay("Pax-Man", "Collect all dots. Avoid the ghosts!", "Start");
})();
