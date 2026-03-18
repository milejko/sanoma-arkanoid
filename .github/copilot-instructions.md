# Copilot Instructions

## Commands

- There are no repo-defined build, lint, or test commands in this repository.
- Validate changes manually in a browser by opening `index.html` and exercising the flows you changed, especially keyboard input, pointer/touch input, pause/start overlays, leaderboard behavior, level progression, and bonus interactions.

## High-level architecture

- This repository is a single-page browser game with no bundler or module system. `index.html` provides the fixed HUD, leaderboard overlay, and canvas; `styles.css` supplies the neon HUD/branding and responsive presentation; `script.js` contains the full game runtime.
- `script.js` is organized around shared mutable state near the top of the file: DOM handles, then `game`, `paddle`, `ball`, `brickConfig`, `bonusCatalog`, and `effects`, followed by runtime arrays such as `bricks`, `fallingBonuses`, and `projectiles`.
- The game loop is `animate()`, which advances input-driven movement and timers first, updates ball physics only while `game.running` is true, then renders in a fixed order with `drawBackground()`, `drawBricks()`, `drawFallingBonuses()`, `drawProjectiles()`, `drawPaddle()`, `drawBall()`, and `drawMessage()`.
- Layout is derived at runtime, with `getBrickRows()`/`getBrickColumns()` currently returning a fixed `5x8` grid. `resizeCanvas()` recalculates canvas dimensions and attached-ball positioning, while `createBricks()` and `layoutBricks()` size and position that grid and then randomly assign bonus bricks.
- Game flow is split between round-level reset and whole-game reset. `resetRound()` recenters the paddle/ball and preserves the current board, while `resetGame()` also resets score, lives, level, effects, and bricks. `loseLife()` clears active effects and falling entities before either starting the next round or showing the leaderboard overlay.
- The leaderboard now uses Supabase via its REST API. The bootstrap in `index.html` defines the Supabase URL / anon key / table on `window`, and `script.js` reads that config.
- The square canvas now contains a real inner playfield inset of `4px` on every side via `PLAYFIELD_INSET`. Geometry helpers such as `getTileWidth()`, `getTileHeight()`, `getPlayfield*Boundary()`, `getBrickTopOffset()`, and `getPaddleY()` all work from that inset playfield, not from the raw canvas edges.

## Key conventions

- Player-facing copy is now localized through external files in `locales/*.js`. Keep identifiers in English, but add or change UI strings via the locale files and preserve the browser-language auto-selection flow.
- When adding mechanics, thread them through the existing state/update/render/reset structure instead of adding isolated logic. Features usually need coordinated changes in state objects, `update*()` functions, `draw*()` functions, `handleAction()`, and reset paths such as `resetRound()`, `resetGame()`, and `loseLife()`.
- Bonus behavior follows existing gameplay rules: brick bonuses are hidden until a brick breaks, collected bonuses affect `effects`, and losing a life clears both positive and negative active effects via `clearEffects()`.
- Special durable bricks are fixed singletons by level: one brick tile from level 2 gives `extraLife`, one concrete tile from level 4 gives `superBall`, one crystal tile from level 6 gives a 15-second super-shooter, and one black-diamond tile from level 8 gives a 15-second triple cannon with a super center shot and normal side shots.
- Bonus brick density is randomized in `createBricks()` at roughly 18% of the board, with at least one bonus brick per layout.
- Bricks now start on the 3rd logical row (`BRICK_START_ROW = 2`), leaving two empty rows above the brick grid, and the paddle sits on the bottom row of the inset playfield.
- Wall layouts have no tiles on levels 1-4. Levels 5-15 use distinct but mirror-symmetric predefined patterns, and from level 5 onward every level keeps walls by looping that 11-layout cycle.
- Paddle size changes are discrete levels, not arbitrary pixel math. Reuse `effects.paddleSizeLevel`, `paddleSizeLevels`, and `syncPaddleWidth()` instead of setting paddle width directly.
- `syncPaddleWidth()` preserves the paddle center and clamps any attached-ball offset. Reuse it after size/base-width changes instead of writing ad hoc width/position code.
- Ball speed changes are temporary modifiers applied relative to the current base speed. Reuse `effects.speedModifier`, `effects.speedTimer`, and `getCurrentBallBaseSpeed()` so level scaling and temporary speed effects continue to compose correctly.
- Sticky behavior has two timers: the effect itself lives in `effects.stickyTimer`, and an attached sticky ball auto-launches after 3 seconds via `ball.stickyAutoLaunchTimer`. Preserve that split when changing glue mechanics.
- Input handling is centralized. UI start/continue flows route through `handleAction({ allowUiStart: true })`, gameplay actions route through `handleAction()`, pause is entered by `pauseGame()` from blur/visibility loss or `Escape`, and horizontal movement comes from keyboard state or pointer/touch movement. New control behavior should usually plug into those paths rather than adding parallel handlers.
- The animation loop freezes gameplay updates while paused. If you add timers or time-based effects, wire them through the existing pause-aware update flow so they stop during pause as well.
- DOM visibility is driven by CSS classes and specific IDs already wired in `script.js`, especially `.hidden`, `#leaderboardOverlay`, `#pauseOverlay`, `#startOverlay`, and `#scoreForm`. If you change overlay/HUD structure in HTML, update the matching selectors and event wiring together.
- The current branding is a non-interactive `Arkanoid` wordmark built from `.brand-chip` spans with a white glow. Do not reintroduce pause behavior or other interactions on the logo unless explicitly requested.
- High-score entries are normalized before storage: names are trimmed, uppercased, and limited to 10 characters. Preserve that sanitization path when touching leaderboard code.
- Leaderboard reads and writes use a localStorage cache first (`arkanoid-leaderboard-cache`), then synchronize with Supabase over the REST API. Frontend/backend changes have to stay in sync across both the cache/payload handling in `script.js` and the `leaderboard_entries` table contract (`name`, `device_type`, `level`, `score`).
- `history.md` is the main record of the user's past instructions and product decisions, not just a scratch log. Read it before changing gameplay, visuals, copy, or bonus behavior so new work stays aligned with earlier decisions.
- If future work involves maintaining `history.md`, append new commands instead of rewriting or summarizing the file.
