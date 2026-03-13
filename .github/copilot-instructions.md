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
- The leaderboard now uses a Google Sheets backend via a deployed Google Apps Script web app. The browser reads and writes through `LEADERBOARD_API_URL` in `script.js`, and the server-side script lives in `google-apps-script/Code.gs`.
- The playfield top boundary is derived from the live HUD/logo height. `getPlayfieldTopBoundary()` keeps wall collisions below the top chrome, and `getBrickTopOffset()` intentionally leaves extra vertical space above the brick rows.

## Key conventions

- Keep player-facing copy in Polish. Most identifiers are English, but HUD text, messages, and leaderboard labels are Polish and should stay consistent unless the task is explicitly about localization or UX text.
- When adding mechanics, thread them through the existing state/update/render/reset structure instead of adding isolated logic. Features usually need coordinated changes in state objects, `update*()` functions, `draw*()` functions, `handleAction()`, and reset paths such as `resetRound()`, `resetGame()`, and `loseLife()`.
- Bonus behavior follows existing gameplay rules: brick bonuses are hidden until a brick breaks, collected bonuses affect `effects`, and losing a life clears both positive and negative active effects via `clearEffects()`.
- Bonus brick density is randomized in `createBricks()` at roughly 18% of the board, with at least one bonus brick per layout.
- Paddle size changes are discrete levels, not arbitrary pixel math. Reuse `effects.paddleSizeLevel`, `paddleSizeLevels`, and `syncPaddleWidth()` instead of setting paddle width directly.
- `syncPaddleWidth()` preserves the paddle center and clamps any attached-ball offset. Reuse it after size/base-width changes instead of writing ad hoc width/position code.
- Ball speed changes are temporary modifiers applied relative to the current base speed. Reuse `effects.speedModifier`, `effects.speedTimer`, and `getCurrentBallBaseSpeed()` so level scaling and temporary speed effects continue to compose correctly.
- Sticky behavior has two timers: the effect itself lives in `effects.stickyTimer`, and an attached sticky ball auto-launches after 3 seconds via `ball.stickyAutoLaunchTimer`. Preserve that split when changing glue mechanics.
- Input handling is centralized. Launch/start flows route through `handleAction()`, pause goes through `togglePause()`, and horizontal movement comes from keyboard state or pointer/touch movement. New control behavior should usually plug into those paths rather than adding parallel handlers.
- The animation loop freezes gameplay updates while paused. If you add timers or time-based effects, wire them through the existing pause-aware update flow so they stop during pause as well.
- DOM visibility is driven by CSS classes and specific IDs already wired in `script.js`, especially `.hidden`, `#leaderboardOverlay`, `#pauseOverlay`, `#startOverlay`, and `#scoreForm`. If you change overlay/HUD structure in HTML, update the matching selectors and event wiring together.
- High-score entries are normalized before storage: names are trimmed, uppercased, and limited to 10 characters. Preserve that sanitization path when touching leaderboard code.
- Leaderboard reads and writes use a localStorage cache first (`sanoma-arkanoid-leaderboard-cache`), then synchronize with the Apps Script backend. Frontend/backend changes have to stay in sync across both the cache/payload handling in `script.js` and the server implementation in `google-apps-script/Code.gs`.
- `history.md` is the main record of the user's past instructions and product decisions, not just a scratch log. Read it before changing gameplay, visuals, copy, or bonus behavior so new work stays aligned with earlier decisions.
- If future work involves maintaining `history.md`, append new commands instead of rewriting or summarizing the file.
