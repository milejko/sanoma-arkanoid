# Copilot Instructions

## Commands

- There are no repo-defined build, lint, or test commands in this repository.
- Validate changes manually in a browser by opening `index.html` and exercising the flows you changed, especially keyboard input, pointer/touch input, leaderboard behavior, level progression, and bonus interactions.

## High-level architecture

- This repository is a single-page browser game with no bundler or module system. `index.html` provides the fixed HUD, leaderboard overlay, and canvas; `styles.css` supplies the neon HUD/branding and responsive presentation; `script.js` contains the full game runtime.
- `script.js` is organized around shared mutable state near the top of the file: DOM handles, then `game`, `paddle`, `ball`, `brickConfig`, `bonusCatalog`, and `effects`, followed by runtime arrays such as `bricks`, `fallingBonuses`, and `projectiles`.
- The game loop is `animate()`, which advances input-driven movement and timers first, updates ball physics only while `game.running` is true, then renders in a fixed order with `drawBackground()`, `drawBricks()`, `drawFallingBonuses()`, `drawProjectiles()`, `drawPaddle()`, `drawBall()`, and `drawMessage()`.
- Layout is derived at runtime, but the brick grid size is intentionally fixed at `5x10`. `resizeCanvas()` recalculates canvas dimensions and attached-ball positioning, while `createBricks()` and `layoutBricks()` size and position that fixed grid and then randomly assign bonus bricks.
- Game flow is split between round-level reset and whole-game reset. `resetRound()` recenters the paddle/ball and preserves the current board, while `resetGame()` also resets score, lives, level, effects, and bricks. `loseLife()` clears active effects and falling entities before either starting the next round or showing the leaderboard overlay.
- The leaderboard now uses a Google Sheets backend via a deployed Google Apps Script web app. The browser reads and writes through `LEADERBOARD_API_URL` in `script.js`, and the server-side script lives in `google-apps-script/Code.gs`.

## Key conventions

- Keep player-facing copy in Polish. Most identifiers are English, but HUD text, messages, and leaderboard labels are Polish and should stay consistent unless the task is explicitly about localization or UX text.
- When adding mechanics, thread them through the existing state/update/render/reset structure instead of adding isolated logic. Features usually need coordinated changes in state objects, `update*()` functions, `draw*()` functions, `handleAction()`, and reset paths such as `resetRound()`, `resetGame()`, and `loseLife()`.
- Bonus behavior follows existing gameplay rules: brick bonuses are hidden until a brick breaks, collected bonuses affect `effects`, and losing a life clears both positive and negative active effects via `clearEffects()`.
- Paddle size changes are discrete levels, not arbitrary pixel math. Reuse `effects.paddleSizeLevel`, `paddleSizeLevels`, and `syncPaddleWidth()` instead of setting paddle width directly.
- Ball speed changes are temporary modifiers applied relative to the current base speed. Reuse `effects.speedModifier`, `effects.speedTimer`, and `getCurrentBallBaseSpeed()` so level scaling and temporary speed effects continue to compose correctly.
- Input handling is centralized. Launch/start flows route through `handleAction()`, while horizontal movement comes from keyboard state or pointer movement. New control behavior should usually plug into those paths rather than adding parallel handlers.
- DOM visibility is driven by CSS classes and specific IDs already wired in `script.js`, especially `.hidden`, `#leaderboardOverlay`, and `#scoreForm`. If you change overlay/HUD structure in HTML, update the matching selectors and event wiring together.
- High-score entries are normalized before storage: names are trimmed, uppercased, and limited to 10 characters. Preserve that sanitization path when touching leaderboard code.
- Backend leaderboard changes have to stay in sync across both sides: the frontend payload/response handling in `script.js` and the Apps Script implementation in `google-apps-script/Code.gs`.
- `history.md` is the main record of the user's past instructions and product decisions, not just a scratch log. Read it before changing gameplay, visuals, copy, or bonus behavior so new work stays aligned with earlier decisions.
- If future work involves maintaining `history.md`, append new commands instead of rewriting or summarizing the file.
