const canvas = document.getElementById("scene");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");
const topChromeElement = document.querySelector(".top-chrome");
const leaderboardOverlay = document.getElementById("leaderboardOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const startOverlay = document.getElementById("startOverlay");
const startOverlayTitleElement = document.getElementById("startOverlayTitle");
const startOverlaySubtitleElement = document.getElementById("startOverlaySubtitle");
const leaderboardTitleElement = document.getElementById("leaderboardTitle");
const leaderboardSubtitleElement = document.getElementById("leaderboardSubtitle");
const leaderboardStatusElement = document.getElementById("leaderboardStatus");
const leaderboardBodyElement = document.getElementById("leaderboardBody");
const leaderboardEmptyElement = document.getElementById("leaderboardEmpty");
const scoreFormElement = document.getElementById("scoreForm");
const playerNameInput = document.getElementById("playerName");
const scoreSubmitButton = document.getElementById("scoreSubmitButton");
const leaderboardStartButton = document.getElementById("leaderboardStartButton");
const pauseResumeButton = document.getElementById("pauseResumeButton");
const startOverlayButton = document.getElementById("startOverlayButton");
const pauseToggleButton = document.getElementById("pauseToggleButton");
const versionBadgeElement = document.getElementById("versionBadge");

const controls = {
  left: false,
  right: false,
};

const LEADERBOARD_API_URL =
  "https://script.google.com/macros/s/AKfycbxWd5-hm3rPJfLQKGG-sE76EJwuNa_e_QmULWgmPK0yZnfXRwLu7Td24FgnRwUFfZoy/exec";
const MAX_HIGH_SCORES = 10;
const LEADERBOARD_CACHE_KEY = "sanoma-arkanoid-leaderboard-cache";
const PADDLE_BOTTOM_OFFSET = 66;

function formatVersionFromHistoryEntry(entryNumber) {
  const major = Math.floor(entryNumber / 100);
  const minor = Math.floor((entryNumber % 100) / 10);
  const patch = entryNumber % 10;
  return `${major}.${minor}.${patch}`;
}

const HISTORY_ENTRY_NUMBER = Number.isFinite(Number(window.APP_HISTORY_ENTRY_NUMBER))
  ? Math.max(0, Math.floor(Number(window.APP_HISTORY_ENTRY_NUMBER)))
  : 0;
const APP_VERSION =
  typeof window.APP_VERSION === "string" && window.APP_VERSION
    ? window.APP_VERSION
    : formatVersionFromHistoryEntry(HISTORY_ENTRY_NUMBER);

if (versionBadgeElement) {
  versionBadgeElement.textContent = APP_VERSION;
}

const leaderboardState = {
  mode: null,
  scoreSaved: false,
  loading: false,
  saving: false,
  showingCachedCopy: false,
  statusMessage: "",
  statusTone: "info",
};

const game = {
  score: 0,
  lives: 3,
  level: 1,
  running: false,
  paused: false,
  won: false,
  message: "...",
  startOverlayMode: "levelStart",
};

const paddle = {
  width: 140,
  baseWidth: 140,
  height: 18,
  speed: 930,
  x: 0,
  y: 0,
  velocityX: 0,
};

const ball = {
  radius: 11,
  x: 0,
  y: 0,
  velocityX: 0,
  velocityY: 0,
  baseSpeed: 380,
  attached: true,
  stickyAttachment: false,
  stickyAutoLaunchTimer: 0,
  paddleOffsetX: 0,
  spin: 0,
  trail: [],
};

const brickConfig = {
  gap: 5,
  topOffset: 92,
  sidePadding: 28,
  height: 22,
};

function getBrickRows() {
  return 5;
}

function getBrickColumns() {
  return 8;
}

function getPlayfieldTopBoundary() {
  const chromeBottom = topChromeElement
    ? Math.ceil(topChromeElement.getBoundingClientRect().bottom)
    : 0;

  return Math.max(brickConfig.topOffset, chromeBottom + 20);
}

function getBrickTopOffset() {
  const extraTopGap = (brickConfig.height + brickConfig.gap) * 2;
  return getPlayfieldTopBoundary() + extraTopGap;
}

const bonusCatalog = {
  widen: {
    label: "Paletka +50%",
    symbol: "+",
    color: "#facc15",
  },
  sticky: {
    label: "Klej",
    symbol: "K",
    color: "#fb7185",
  },
  shooter: {
    label: "Działo",
    symbol: "S",
    color: "#38bdf8",
  },
  extraLife: {
    label: "+1 życie",
    symbol: "L",
    color: "#f472b6",
  },
  superBall: {
    label: "Super piłka",
    symbol: "*",
    color: "#ef4444",
  },
  shrinkHalf: {
    label: "Paletka -50%",
    symbol: "-",
    color: "#f87171",
  },
  shrinkThird: {
    label: "Paletka -50%",
    symbol: "=",
    color: "#fb7185",
  },
  speedDouble: {
    label: "Piłka -25%",
    symbol: ">",
    color: "#f97316",
  },
  speedTriple: {
    label: "Piłka +25%",
    symbol: ">>",
    color: "#ef4444",
  },
};

let highScores = [];

function sanitizePlayerName(name) {
  return name.replace(/\s+/g, " ").trim().slice(0, 10).toUpperCase();
}

function sortHighScores(first, second) {
  return second.score - first.score || second.level - first.level || first.name.localeCompare(second.name);
}

function normalizeHighScoreEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const name = sanitizePlayerName(typeof entry.name === "string" ? entry.name : "");
  const level = Math.max(1, Math.floor(Number(entry.level)));
  const score = Math.max(0, Math.floor(Number(entry.score)));

  if (!Number.isFinite(level) || !Number.isFinite(score)) {
    return null;
  }

  return {
    name: name || "ANONIM",
    level,
    score,
  };
}

function normalizeHighScoreEntries(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map(normalizeHighScoreEntry)
    .filter(Boolean)
    .sort(sortHighScores)
    .slice(0, MAX_HIGH_SCORES);
}

function doesHighScoreQualify(entry, entries = highScores) {
  const normalizedEntry = normalizeHighScoreEntry(entry);

  if (!normalizedEntry) {
    return false;
  }

  const normalizedEntries = normalizeHighScoreEntries(entries);

  if (normalizedEntries.length < MAX_HIGH_SCORES) {
    return true;
  }

  const cutoffEntry = normalizedEntries[normalizedEntries.length - 1];
  return (
    normalizedEntry.score > cutoffEntry.score ||
    (normalizedEntry.score === cutoffEntry.score && normalizedEntry.level >= cutoffEntry.level)
  );
}

function loadCachedHighScores() {
  const rawCache = window.localStorage.getItem(LEADERBOARD_CACHE_KEY);

  if (!rawCache) {
    return [];
  }

  try {
    const parsedCache = JSON.parse(rawCache);
    const cachedEntries = Array.isArray(parsedCache)
      ? parsedCache
      : parsedCache && typeof parsedCache === "object"
        ? parsedCache.entries
        : [];

    return normalizeHighScoreEntries(cachedEntries);
  } catch (error) {
    console.warn("Nie udało się odczytać lokalnej kopii leaderboardu.", error);
    window.localStorage.removeItem(LEADERBOARD_CACHE_KEY);
    return [];
  }
}

function saveCachedHighScores(entries) {
  const normalizedEntries = normalizeHighScoreEntries(entries);

  window.localStorage.setItem(
    LEADERBOARD_CACHE_KEY,
    JSON.stringify({
      entries: normalizedEntries,
      updatedAt: Date.now(),
    })
  );

  return normalizedEntries;
}

function useCachedHighScores() {
  highScores = loadCachedHighScores();
  leaderboardState.showingCachedCopy = highScores.length > 0;
  return leaderboardState.showingCachedCopy;
}

function isLeaderboardBackendConfigured() {
  return !LEADERBOARD_API_URL.includes("REPLACE_WITH_DEPLOYED_WEB_APP_ID");
}

function getLeaderboardStatusMessage() {
  if (leaderboardState.saving) {
    return {
      kind: "loading",
      tone: "info",
      label: "Zapisywanie",
    };
  }

  if (leaderboardState.loading) {
    return {
      kind: "loading",
      tone: "info",
      label: "Ładowanie",
    };
  }

  if (leaderboardState.statusMessage) {
    return {
      kind: "text",
      tone: leaderboardState.statusTone,
      text: leaderboardState.statusMessage,
    };
  }

  return null;
}

function renderLeaderboardStatus() {
  const status = getLeaderboardStatusMessage();

  leaderboardStatusElement.classList.add("hidden");
  leaderboardStatusElement.classList.remove(
    "leaderboard-status-loading",
    "leaderboard-status-text",
    "leaderboard-status-info",
    "leaderboard-status-error"
  );

  if (!status) {
    leaderboardStatusElement.textContent = "";
    return;
  }

  leaderboardStatusElement.replaceChildren();
  leaderboardStatusElement.classList.remove("hidden");
  leaderboardStatusElement.classList.add(
    status.tone === "error" ? "leaderboard-status-error" : "leaderboard-status-info"
  );

  if (status.kind === "loading") {
    leaderboardStatusElement.classList.add("leaderboard-status-loading");
    const dots = document.createElement("span");
    dots.className = "loading-dots";
    dots.setAttribute("aria-label", status.label || "Ładowanie");

    for (let index = 0; index < 3; index += 1) {
      const dot = document.createElement("span");
      dot.className = "loading-dot";
      dot.textContent = ".";
      dot.style.animationDelay = `${index * 0.18}s`;
      dots.appendChild(dot);
    }

    leaderboardStatusElement.appendChild(dots);
    return;
  }

  leaderboardStatusElement.classList.add("leaderboard-status-text");
  leaderboardStatusElement.textContent = status.text;
}

function parseLeaderboardPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Nieprawidłowa odpowiedź backendu leaderboardu.");
  }

  if (payload.ok === false) {
    throw new Error(
      typeof payload.error === "string" && payload.error
        ? payload.error
        : "Backend leaderboardu zwrócił błąd."
    );
  }

  if (!Array.isArray(payload.entries)) {
    throw new Error("Backend leaderboardu nie zwrócił listy wyników.");
  }

  return normalizeHighScoreEntries(payload.entries);
}

async function fetchLeaderboardEntries() {
  if (!isLeaderboardBackendConfigured()) {
    throw new Error(
      "Backend leaderboardu nie jest jeszcze skonfigurowany. Wdróż Apps Script i podmień LEADERBOARD_API_URL."
    );
  }

  const response = await window.fetch(
    `${LEADERBOARD_API_URL}?limit=${encodeURIComponent(MAX_HIGH_SCORES)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać wyników (${response.status}).`);
  }

  return parseLeaderboardPayload(await response.json());
}

async function refreshHighScores() {
  if (leaderboardState.loading || leaderboardState.saving) {
    return;
  }

  leaderboardState.loading = true;
  leaderboardState.statusMessage = "";
  renderLeaderboard();

  try {
    highScores = saveCachedHighScores(await fetchLeaderboardEntries());
    leaderboardState.showingCachedCopy = false;
    leaderboardState.statusMessage = "";
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Nie udało się pobrać leaderboardu.";
    leaderboardState.statusMessage = leaderboardState.showingCachedCopy
      ? `${errorMessage} Wyświetlam lokalną kopię wyników.`
      : errorMessage;
    leaderboardState.statusTone = leaderboardState.showingCachedCopy ? "info" : "error";
  } finally {
    leaderboardState.loading = false;
    renderLeaderboard();
  }
}

async function persistHighScore(entry) {
  if (!isLeaderboardBackendConfigured()) {
    throw new Error(
      "Backend leaderboardu nie jest jeszcze skonfigurowany. Wdróż Apps Script i podmień LEADERBOARD_API_URL."
    );
  }

  const response = await window.fetch(LEADERBOARD_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error(`Nie udało się zapisać wyniku (${response.status}).`);
  }

  return parseLeaderboardPayload(await response.json());
}

function renderHighScores() {
  leaderboardBodyElement.innerHTML = "";

  if (!highScores.length) {
    leaderboardEmptyElement.classList.toggle("hidden", leaderboardState.loading);
    return;
  }

  leaderboardEmptyElement.classList.add("hidden");

  for (const entry of highScores) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const levelCell = document.createElement("td");
    const scoreCell = document.createElement("td");

    nameCell.textContent = entry.name;
    levelCell.textContent = String(entry.level);
    scoreCell.textContent = String(entry.score);

    row.append(nameCell, levelCell, scoreCell);
    leaderboardBodyElement.appendChild(row);
  }
}

function renderLeaderboard() {
  const isIntro = leaderboardState.mode === "intro";
  const isGameOver = leaderboardState.mode === "gameover";
  const currentScoreQualifies = doesHighScoreQualify({
    name: playerNameInput.value,
    level: game.level,
    score: game.score,
  });
  const shouldShowForm = isGameOver && !leaderboardState.scoreSaved && currentScoreQualifies;

  leaderboardOverlay.classList.toggle("hidden", !leaderboardState.mode);

  if (!leaderboardState.mode) {
    return;
  }

  leaderboardTitleElement.textContent = isGameOver ? "Koniec gry" : "Tablica wyników";
  leaderboardSubtitleElement.textContent = isGameOver
    ? shouldShowForm
      ? `Wpisz imię i zapisz wynik: level ${game.level}, ${game.score} pkt.`
      : leaderboardState.scoreSaved
        ? `Wynik zapisany. Level ${game.level}, ${game.score} pkt.`
        : `Poza top ${MAX_HIGH_SCORES}. Level ${game.level}, ${game.score} pkt.`
    : "";
  leaderboardStartButton.textContent = isIntro ? "Start" : "Nowa gra";
  scoreFormElement.classList.toggle("hidden", !shouldShowForm);
  playerNameInput.disabled = leaderboardState.saving;
  scoreSubmitButton.disabled = leaderboardState.saving;
  leaderboardStartButton.disabled = leaderboardState.saving;
  renderLeaderboardStatus();
  renderHighScores();
}

function renderPauseOverlay() {
  pauseOverlay.classList.toggle("hidden", !game.paused);
}

function renderStartOverlay() {
  const shouldShowStartOverlay = Boolean(game.message) && !leaderboardState.mode && !game.paused;
  startOverlay.classList.toggle("hidden", !shouldShowStartOverlay);

  if (!shouldShowStartOverlay) {
    return;
  }

  startOverlayTitleElement.textContent = game.message;
  if (game.startOverlayMode === "continue") {
    startOverlaySubtitleElement.textContent = "Nic straconego. 🙂";
    startOverlayButton.textContent = "Kontynuuj";
  } else {
    startOverlaySubtitleElement.textContent = "Zaczynamy? 🚀";
    startOverlayButton.textContent = "Start";
  }
}

function pauseGame() {
  if (leaderboardState.mode || game.paused || !game.running) {
    return;
  }

  game.paused = true;
  controls.left = false;
  controls.right = false;
  renderStartOverlay();
  renderPauseOverlay();
  pauseResumeButton.focus();
}

function resumeGame() {
  if (!game.paused) {
    return;
  }

  game.paused = false;
  controls.left = false;
  controls.right = false;
  lastPointerMoveTime = 0;
  renderPauseOverlay();
  renderStartOverlay();
}

function togglePause() {
  if (game.paused) {
    resumeGame();
    return;
  }

  pauseGame();
}

function showLeaderboard(mode) {
  game.paused = false;
  leaderboardState.mode = mode;
  leaderboardState.scoreSaved = mode !== "gameover";
  controls.left = false;
  controls.right = false;

  if (mode === "gameover") {
    playerNameInput.value = "";
  }

  if (useCachedHighScores() && !leaderboardState.loading && !leaderboardState.saving) {
    leaderboardState.statusMessage = "Wyświetlam lokalną kopię tablicy wyników.";
    leaderboardState.statusTone = "info";
  } else if (!leaderboardState.loading && !leaderboardState.saving) {
    leaderboardState.statusMessage = "";
  }

  renderPauseOverlay();
  renderStartOverlay();
  renderLeaderboard();
  void refreshHighScores();

  if (
    mode === "gameover" &&
    !leaderboardState.scoreSaved &&
    doesHighScoreQualify({ name: playerNameInput.value, level: game.level, score: game.score })
  ) {
    playerNameInput.focus();
  } else {
    leaderboardStartButton.focus();
  }
}

function hideLeaderboard() {
  leaderboardState.mode = null;
  renderStartOverlay();
  renderLeaderboard();
}

async function saveCurrentScore() {
  const entry = normalizeHighScoreEntry({
    name: playerNameInput.value,
    level: game.level,
    score: game.score,
  });

  if (!entry || !doesHighScoreQualify(entry) || leaderboardState.scoreSaved) {
    return;
  }

  leaderboardState.saving = true;
  leaderboardState.statusMessage = "";
  highScores = saveCachedHighScores([entry, ...highScores]);
  leaderboardState.showingCachedCopy = true;
  playerNameInput.value = entry.name;
  renderLeaderboard();

  try {
    highScores = saveCachedHighScores(await persistHighScore(entry));
    leaderboardState.showingCachedCopy = false;
    leaderboardState.scoreSaved = true;
    leaderboardState.statusMessage = "";
    leaderboardState.statusTone = "info";
  } catch (error) {
    leaderboardState.statusMessage =
      error instanceof Error
        ? `${error.message} Wynik pozostał w lokalnej kopii.`
        : "Nie udało się zapisać wyniku w Google. Wynik pozostał w lokalnej kopii.";
    leaderboardState.statusTone = "info";
  } finally {
    leaderboardState.saving = false;
    renderLeaderboard();
  }

  if (leaderboardState.scoreSaved) {
    leaderboardStartButton.focus();
  }
}

function isTextEntryActive() {
  return document.activeElement === playerNameInput;
}

function startFromLeaderboard() {
  if (leaderboardState.saving) {
    return;
  }

  const needsReset = leaderboardState.mode === "gameover";

  if (needsReset) {
    resetGame();
  }

  hideLeaderboard();
  launchBall();
}

function isPositiveBonus(type) {
  return (
    type === "widen" ||
    type === "sticky" ||
    type === "shooter" ||
    type === "extraLife" ||
    type === "speedDouble" ||
    type === "superBall"
  );
}

const paddleSizeLevels = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5];
const neutralLevelIndex = 3;

const effects = {
  paddleSizeLevel: neutralLevelIndex,
  stickyActive: false,
  stickyTimer: 0,
  shooterActive: false,
  shooterTimer: 0,
  superBallActive: false,
  superBallTimer: 0,
  speedModifier: 0,
  speedTimer: 0,
  shotCooldown: 0,
};

let bricks = [];
let fallingBonuses = [];
let projectiles = [];
let lastPointerMoveTime = 0;

function resizeCanvas() {
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.floor(width);
  canvas.height = Math.floor(height);
  layoutBricks();
  paddle.y = canvas.height - PADDLE_BOTTOM_OFFSET;
  paddle.baseWidth = getBasePaddleWidth();
  syncPaddleWidth();
  paddle.velocityX = 0;

  if (ball.attached) {
    attachBallToPaddle(ball.paddleOffsetX, ball.stickyAttachment);
  } else {
    ball.x = Math.min(Math.max(ball.x, ball.radius), canvas.width - ball.radius);
    ball.y = Math.min(Math.max(ball.y, ball.radius), canvas.height - ball.radius);
  }
}

function createBricks() {
  bricks = [];
  const rows = getBrickRows();
  const columns = getBrickColumns();
  const standardBonusTypes = [
    "widen",
    "sticky",
    "shooter",
    "extraLife",
    "superBall",
    "shrinkHalf",
    "shrinkThird",
    "speedDouble",
    "speedTriple",
  ];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      bricks.push({
        row,
        column,
        alive: true,
        x: 0,
        y: 0,
        width: 0,
        height: brickConfig.height,
        bonusType: null,
      });
    }
  }

  const shuffledIndices = Array.from({ length: bricks.length }, (_, index) => index);

  for (let index = shuffledIndices.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledIndices[index], shuffledIndices[randomIndex]] = [
      shuffledIndices[randomIndex],
      shuffledIndices[index],
    ];
  }

  const bonusCount = Math.max(1, Math.round(bricks.length * 0.18));

  for (let index = 0; index < bonusCount; index += 1) {
    bricks[shuffledIndices[index]].bonusType =
      standardBonusTypes[Math.floor(Math.random() * standardBonusTypes.length)];
  }

  layoutBricks();
}

function layoutBricks() {
  if (!bricks.length || canvas.width === 0) {
    return;
  }

  const columns = getBrickColumns();
  const topOffset = getBrickTopOffset();
  const totalGapWidth = brickConfig.gap * (columns - 1);
  const availableWidth = Math.max(0, canvas.width - brickConfig.sidePadding * 2);
  const brickWidth = (availableWidth - totalGapWidth) / columns;
  const startX = brickConfig.sidePadding;

  for (const brick of bricks) {
    brick.width = brickWidth;
    brick.x = startX + brick.column * (brickWidth + brickConfig.gap);
    brick.y = topOffset + brick.row * (brickConfig.height + brickConfig.gap);
  }
}

function getBasePaddleWidth() {
  return canvas.width * 0.126;
}

function getCurrentBallBaseSpeed() {
  const levelSpeedFactor = 1 + (game.level - 1) * 0.1;
  return ball.baseSpeed * levelSpeedFactor * (1 + effects.speedModifier);
}

function syncPaddleWidth() {
  const previousCenter = paddle.x + paddle.width / 2 || canvas.width / 2;
  const widenedWidth = Math.min(
    paddle.baseWidth * paddleSizeLevels[effects.paddleSizeLevel],
    canvas.width * 0.62
  );
  paddle.width = Math.max(38, widenedWidth);
  paddle.x = Math.max(
    0,
    Math.min(canvas.width - paddle.width, previousCenter - paddle.width / 2)
  );

  if (ball.attached) {
    ball.paddleOffsetX = getClampedPaddleOffset(ball.paddleOffsetX);
    ball.x = paddle.x + paddle.width / 2 + ball.paddleOffsetX;
    ball.y = paddle.y - ball.radius - 2;
  }
}

function clearEffects() {
  effects.paddleSizeLevel = neutralLevelIndex;
  effects.stickyActive = false;
  effects.stickyTimer = 0;
  effects.shooterActive = false;
  effects.shooterTimer = 0;
  effects.superBallActive = false;
  effects.superBallTimer = 0;
  effects.speedModifier = 0;
  effects.speedTimer = 0;
  effects.shotCooldown = 0;
  syncPaddleWidth();
  updateHud();
}

function getClampedPaddleOffset(offsetX) {
  const maxOffset = Math.max(0, paddle.width / 2 - ball.radius);
  return Math.max(-maxOffset, Math.min(maxOffset, offsetX));
}

function attachBallToPaddle(offsetX = 0, stickyAttachment = false) {
  const preserveStickyTimer =
    ball.attached && ball.stickyAttachment && stickyAttachment;
  ball.attached = true;
  ball.stickyAttachment = stickyAttachment;
  ball.stickyAutoLaunchTimer = stickyAttachment
    ? preserveStickyTimer
      ? ball.stickyAutoLaunchTimer
      : 3
    : 0;
  ball.velocityX = 0;
  ball.velocityY = 0;
  ball.spin = 0;
  ball.trail = [];
  ball.paddleOffsetX = getClampedPaddleOffset(offsetX);
  ball.x = paddle.x + paddle.width / 2 + ball.paddleOffsetX;
  ball.y = paddle.y - ball.radius - 2;
}

function launchBall() {
  if (!ball.attached) {
    return;
  }

  const baseSpeed = getCurrentBallBaseSpeed();
  ball.attached = false;
  ball.stickyAttachment = false;
  ball.stickyAutoLaunchTimer = 0;
  ball.velocityX = baseSpeed * (Math.random() > 0.5 ? 1 : -1) * 0.75;
  ball.velocityY = -baseSpeed;
  ball.spin = ball.velocityX * 0.08;
  ball.trail = [];
  game.running = true;
  game.message = "";
  game.startOverlayMode = "levelStart";
  renderStartOverlay();
}

function resetRound() {
  const isLifeContinuation = game.running || game.message === "";
  fallingBonuses = [];
  projectiles = [];
  game.paused = false;
  paddle.baseWidth = getBasePaddleWidth();
  syncPaddleWidth();
  paddle.x = (canvas.width - paddle.width) / 2;
  paddle.y = canvas.height - PADDLE_BOTTOM_OFFSET;
  paddle.velocityX = 0;
  lastPointerMoveTime = 0;
  attachBallToPaddle(0, false);
  game.running = false;
  game.message =
    game.lives > 0
      ? `Poziom ${game.level}`
      : "Koniec gry";
  game.startOverlayMode = isLifeContinuation ? "continue" : "levelStart";
  renderStartOverlay();
  renderPauseOverlay();
}

function resetGame() {
  game.score = 0;
  game.lives = 3;
  game.level = 1;
  game.won = false;
  game.startOverlayMode = "levelStart";
  clearEffects();
  createBricks();
  resetRound();
  updateHud();
}

function updateHud() {
  scoreElement.textContent = String(game.score);
  livesElement.textContent = "♥ ".repeat(game.lives).trim();
  levelElement.textContent = String(game.level);
}

function movePaddle(deltaSeconds) {
  const direction = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
  const previousX = paddle.x;
  paddle.x += direction * paddle.speed * deltaSeconds;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
  paddle.velocityX =
    deltaSeconds > 0 ? (paddle.x - previousX) / deltaSeconds : paddle.velocityX;

  if (direction === 0) {
    paddle.velocityX *= 0.8;

    if (Math.abs(paddle.velocityX) < 12) {
      paddle.velocityX = 0;
    }
  }

  if (ball.attached) {
    attachBallToPaddle(ball.paddleOffsetX, ball.stickyAttachment);
  }
}

function bounceOffPaddle() {
  const withinHorizontalRange =
    ball.x + ball.radius >= paddle.x &&
    ball.x - ball.radius <= paddle.x + paddle.width;
  const withinVerticalRange =
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height;

  if (!withinHorizontalRange || !withinVerticalRange || ball.velocityY <= 0) {
    return;
  }

  const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
  const speed = Math.min(
    Math.hypot(ball.velocityX, ball.velocityY) * 1.02,
    getCurrentBallBaseSpeed() * 1.7
  );
  const maxBounceAngle = Math.PI / 3;
  const clampedOffset = Math.max(-0.92, Math.min(0.92, hitOffset));
  const bounceAngle = clampedOffset * maxBounceAngle;
  const steeringBoost = Math.max(-220, Math.min(220, paddle.velocityX * 0.16));
  const maxHorizontalSpeed = speed * 0.9;
  let nextVelocityX = speed * Math.sin(bounceAngle) + steeringBoost;
  nextVelocityX = Math.max(
    -maxHorizontalSpeed,
    Math.min(maxHorizontalSpeed, nextVelocityX)
  );
  const spinFromHit = clampedOffset * 180;
  const spinFromPaddle = Math.max(-140, Math.min(140, paddle.velocityX * 0.18));
  const impactOffsetX = ball.x - (paddle.x + paddle.width / 2);

  ball.y = paddle.y - ball.radius;
  ball.velocityX = nextVelocityX;
  ball.velocityY = -Math.sqrt(
    Math.max(speed * speed - nextVelocityX * nextVelocityX, 0)
  );
  ball.spin = Math.max(
    -260,
    Math.min(260, ball.spin * 0.35 + spinFromHit + spinFromPaddle)
  );

  if (effects.stickyActive) {
    attachBallToPaddle(impactOffsetX, true);
    game.running = false;
    game.message = "";
  }
}

function bounceOffWalls() {
  const topBoundary = getPlayfieldTopBoundary();

  if (ball.x + ball.radius >= canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.velocityX *= -1;
    ball.spin *= 0.92;
  } else if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.velocityX *= -1;
    ball.spin *= 0.92;
  }

  if (ball.y - ball.radius <= topBoundary) {
    ball.y = topBoundary + ball.radius;
    ball.velocityY *= -1;
    ball.spin *= 0.96;
  }
}

function hitBrick(brick) {
  if (!brick.alive) {
    return;
  }

  brick.alive = false;

  if (brick.bonusType) {
    fallingBonuses.push({
      type: brick.bonusType,
      x: brick.x + brick.width / 2,
      y: brick.y + brick.height / 2,
      size: 24,
      speed: 170,
      phase: Math.random() * Math.PI * 2,
    });
  }

  game.score += 100;
  updateHud();

  if (bricks.every((candidate) => !candidate.alive)) {
    game.running = false;
    game.level += 1;
    clearEffects();
    createBricks();
    resetRound();
    game.message = `Poziom ${game.level}`;
    game.startOverlayMode = "levelStart";
    renderStartOverlay();
    updateHud();
  }
}

function bounceOffBricks(previousX, previousY) {
  if (effects.superBallActive) {
    const pathLeft = Math.min(previousX, ball.x) - ball.radius;
    const pathRight = Math.max(previousX, ball.x) + ball.radius;
    const pathTop = Math.min(previousY, ball.y) - ball.radius;
    const pathBottom = Math.max(previousY, ball.y) + ball.radius;
    const collidedBricks = bricks.filter((brick) => {
      if (!brick.alive) {
        return false;
      }

      return (
        pathRight >= brick.x &&
        pathLeft <= brick.x + brick.width &&
        pathBottom >= brick.y &&
        pathTop <= brick.y + brick.height
      );
    });

    for (const brick of collidedBricks) {
      if (!brick.alive) {
        continue;
      }

      hitBrick(brick);

      if (!game.running || ball.attached) {
        break;
      }
    }

    return;
  }

  for (const brick of bricks) {
    if (!brick.alive) {
      continue;
    }

    const intersects =
      ball.x + ball.radius >= brick.x &&
      ball.x - ball.radius <= brick.x + brick.width &&
      ball.y + ball.radius >= brick.y &&
      ball.y - ball.radius <= brick.y + brick.height;

    if (!intersects) {
      continue;
    }

    const wasLeftOfBrick = previousX + ball.radius <= brick.x;
    const wasRightOfBrick = previousX - ball.radius >= brick.x + brick.width;

    if (wasLeftOfBrick || wasRightOfBrick) {
      ball.velocityX *= -1;
      ball.spin *= 0.94;
    } else {
      ball.velocityY *= -1;
      ball.spin *= 0.97;
    }

    hitBrick(brick);
    break;
  }
}

function loseLife() {
  game.lives -= 1;
  fallingBonuses = [];
  projectiles = [];
  clearEffects();
  updateHud();

  if (game.lives <= 0) {
    game.running = false;
    ball.attached = true;
    ball.stickyAttachment = false;
    ball.stickyAutoLaunchTimer = 0;
    game.message = "";
    showLeaderboard("gameover");
    return;
  }

  resetRound();
}

function activateBonus(type) {
  if (type === "widen") {
    effects.paddleSizeLevel = Math.min(effects.paddleSizeLevel + 1, paddleSizeLevels.length - 1);
    syncPaddleWidth();
  } else if (type === "shrinkHalf") {
    effects.paddleSizeLevel = Math.max(effects.paddleSizeLevel - 1, 0);
    syncPaddleWidth();
  } else if (type === "shrinkThird") {
    effects.paddleSizeLevel = Math.max(effects.paddleSizeLevel - 1, 0);
    syncPaddleWidth();
  } else if (type === "sticky") {
    effects.stickyActive = true;
    effects.stickyTimer = 15;
  } else if (type === "shooter") {
    effects.shooterActive = true;
    effects.shooterTimer = 15;
  } else if (type === "extraLife") {
    game.lives = Math.min(3, game.lives + 1);
  } else if (type === "superBall") {
    effects.superBallActive = true;
    effects.superBallTimer = 5;
  } else if (type === "speedDouble") {
    const previousSpeedFactor = 1 + effects.speedModifier;
    effects.speedModifier = -0.25;
    effects.speedTimer = 15;
    const velocityRatio = (1 + effects.speedModifier) / previousSpeedFactor;
    if (!ball.attached) {
      ball.velocityX *= velocityRatio;
      ball.velocityY *= velocityRatio;
      ball.spin *= velocityRatio;
    }
  } else if (type === "speedTriple") {
    const previousSpeedFactor = 1 + effects.speedModifier;
    effects.speedModifier = 0.25;
    effects.speedTimer = 15;
    const velocityRatio = (1 + effects.speedModifier) / previousSpeedFactor;
    if (!ball.attached) {
      ball.velocityX *= velocityRatio;
      ball.velocityY *= velocityRatio;
      ball.spin *= velocityRatio;
    }
  }

  updateHud();
}

function updateEffects(deltaSeconds) {
  let hudChanged = false;

  if (effects.shotCooldown > 0) {
    effects.shotCooldown = Math.max(0, effects.shotCooldown - deltaSeconds);
  }

  if (effects.stickyActive) {
    effects.stickyTimer = Math.max(0, effects.stickyTimer - deltaSeconds);
    if (effects.stickyTimer === 0) {
      effects.stickyActive = false;
      hudChanged = true;

      if (ball.attached && ball.stickyAttachment) {
        launchBall();
      }
    }
  }

  if (effects.shooterActive) {
    effects.shooterTimer = Math.max(0, effects.shooterTimer - deltaSeconds);
    if (effects.shooterTimer === 0) {
      effects.shooterActive = false;
      hudChanged = true;
    }
  }

  if (effects.superBallActive) {
    effects.superBallTimer = Math.max(0, effects.superBallTimer - deltaSeconds);
    if (effects.superBallTimer === 0) {
      effects.superBallActive = false;
      hudChanged = true;
    }
  }

  if (effects.speedModifier !== 0) {
    effects.speedTimer = Math.max(0, effects.speedTimer - deltaSeconds);
    if (effects.speedTimer === 0) {
      const previousSpeedFactor = 1 + effects.speedModifier;
      effects.speedModifier = 0;
      if (!ball.attached) {
        const velocityRatio = (1 + effects.speedModifier) / previousSpeedFactor;
        ball.velocityX *= velocityRatio;
        ball.velocityY *= velocityRatio;
        ball.spin *= velocityRatio;
      }
    }
  }

  if (ball.attached && ball.stickyAttachment) {
    ball.stickyAutoLaunchTimer = Math.max(0, ball.stickyAutoLaunchTimer - deltaSeconds);
    if (ball.stickyAutoLaunchTimer === 0) {
      launchBall();
    }
  }

  if (hudChanged) {
    updateHud();
  }
}

function updateFallingBonuses(deltaSeconds) {
  for (let index = fallingBonuses.length - 1; index >= 0; index -= 1) {
    const bonus = fallingBonuses[index];
    bonus.y += bonus.speed * deltaSeconds;
    bonus.phase += deltaSeconds * 4.5;

    const caughtByPaddle =
      bonus.x + bonus.size / 2 >= paddle.x &&
      bonus.x - bonus.size / 2 <= paddle.x + paddle.width &&
      bonus.y + bonus.size / 2 >= paddle.y &&
      bonus.y - bonus.size / 2 <= paddle.y + paddle.height;

    if (caughtByPaddle) {
      game.score += isPositiveBonus(bonus.type) ? 200 : 400;
      activateBonus(bonus.type);
      fallingBonuses.splice(index, 1);
      continue;
    }

    if (bonus.y - bonus.size / 2 > canvas.height) {
      fallingBonuses.splice(index, 1);
    }
  }
}

function updateProjectiles(deltaSeconds) {
  for (let index = projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = projectiles[index];
    projectile.y -= projectile.speed * deltaSeconds;

    if (projectile.y + projectile.height < 0) {
      projectiles.splice(index, 1);
      continue;
    }

    let hit = false;

    for (const brick of bricks) {
      if (!brick.alive) {
        continue;
      }

      const intersects =
        projectile.x < brick.x + brick.width &&
        projectile.x + projectile.width > brick.x &&
        projectile.y < brick.y + brick.height &&
        projectile.y + projectile.height > brick.y;

      if (!intersects) {
        continue;
      }

      hitBrick(brick);
      projectiles.splice(index, 1);
      hit = true;
      break;
    }

    if (hit) {
      continue;
    }
  }
}

function updateBall(deltaSeconds) {
  if (ball.attached) {
    return;
  }

  if (ball.spin !== 0) {
    ball.velocityX += ball.spin * deltaSeconds;

    const maxHorizontalSpeed = Math.max(
      Math.abs(ball.velocityY) * 1.35,
      getCurrentBallBaseSpeed()
    );
    ball.velocityX = Math.max(
      -maxHorizontalSpeed,
      Math.min(maxHorizontalSpeed, ball.velocityX)
    );
    ball.spin *= Math.max(0, 1 - 1.35 * deltaSeconds);

    if (Math.abs(ball.spin) < 4) {
      ball.spin = 0;
    }
  }

  const previousX = ball.x;
  const previousY = ball.y;

  ball.x += ball.velocityX * deltaSeconds;
  ball.y += ball.velocityY * deltaSeconds;

  bounceOffWalls();
  bounceOffPaddle();
  bounceOffBricks(previousX, previousY);

  if (ball.y - ball.radius > canvas.height) {
    loseLife();
    return;
  }

  ball.trail.unshift({ x: ball.x, y: ball.y });
  if (ball.trail.length > 7) {
    ball.trail.length = 7;
  }
}

function drawBackground() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const glow = context.createLinearGradient(0, 0, 0, canvas.height);
  glow.addColorStop(0, "rgba(30, 41, 59, 0.12)");
  glow.addColorStop(1, "rgba(15, 23, 42, 0.42)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPaddle() {
  const bodyGradient = context.createLinearGradient(
    paddle.x,
    paddle.y,
    paddle.x,
    paddle.y + paddle.height
  );
  const isSticky = effects.stickyActive;
  const isShooter = effects.shooterActive;

  if (isSticky) {
    bodyGradient.addColorStop(0, "#ecfccb");
    bodyGradient.addColorStop(0.18, "#86efac");
    bodyGradient.addColorStop(0.62, "#22c55e");
    bodyGradient.addColorStop(1, "#166534");
  } else {
    bodyGradient.addColorStop(0, "#dcf9ff");
    bodyGradient.addColorStop(0.18, "#67e8f9");
    bodyGradient.addColorStop(0.62, "#38bdf8");
    bodyGradient.addColorStop(1, "#0f4c81");
  }

  context.shadowColor = isSticky
    ? "rgba(74, 222, 128, 0.45)"
    : "rgba(34, 211, 238, 0.45)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 4;
  context.fillStyle = bodyGradient;
  context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  context.shadowBlur = 0;
  context.shadowOffsetY = 0;

  context.fillStyle = "rgba(255, 255, 255, 0.55)";
  context.fillRect(paddle.x + 5, paddle.y + 3, paddle.width - 10, 2);
  context.fillRect(paddle.x + 5, paddle.y + 3, 2, paddle.height - 6);

  context.fillStyle = "rgba(8, 20, 38, 0.34)";
  context.fillRect(paddle.x + 5, paddle.y + paddle.height - 4, paddle.width - 10, 2);
  context.fillRect(paddle.x + paddle.width - 7, paddle.y + 3, 2, paddle.height - 6);

  const inset = context.createLinearGradient(
    paddle.x + 4,
    paddle.y + 3,
    paddle.x + paddle.width - 4,
    paddle.y + paddle.height - 3
  );
  inset.addColorStop(0, "rgba(255, 255, 255, 0.28)");
  inset.addColorStop(0.45, "rgba(255, 255, 255, 0.08)");
  inset.addColorStop(1, "rgba(8, 20, 38, 0.14)");
  context.fillStyle = inset;
  context.fillRect(paddle.x + 4, paddle.y + 3, paddle.width - 8, paddle.height - 6);

  context.strokeStyle = "rgba(255, 255, 255, 0.22)";
  context.lineWidth = 1;
  context.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

  if (isShooter) {
    const cannonBaseWidth = 14;
    const cannonCoreWidth = 6;
    const cannonBaseX = paddle.x + paddle.width / 2 - cannonBaseWidth / 2;
    const cannonCoreX = paddle.x + paddle.width / 2 - cannonCoreWidth / 2;

    context.fillStyle = "#cbd5e1";
    context.fillRect(cannonBaseX, paddle.y - 7, cannonBaseWidth, 7);
    context.fillStyle = "#38bdf8";
    context.fillRect(cannonCoreX, paddle.y - 11, cannonCoreWidth, 8);
  }

  context.shadowBlur = 0;
}

function drawBall() {
  const speedTrailFactor =
    effects.speedModifier < 0 ? 1.95 : effects.speedModifier > 0 ? 0.55 : 1;
  const isSuperBall = effects.superBallActive;
  for (let index = ball.trail.length - 1; index >= 0; index -= 1) {
    const trailPoint = ball.trail[index];
    const alpha =
      ((ball.trail.length - index) / ball.trail.length) * 0.16 * speedTrailFactor;
    const scale =
      0.48 + ((ball.trail.length - index) / ball.trail.length) * 0.3 * speedTrailFactor;
    const trailRadius = ball.radius * scale;
    const trailGradient = context.createRadialGradient(
      trailPoint.x - trailRadius * 0.3,
      trailPoint.y - trailRadius * 0.34,
      trailRadius * 0.08,
      trailPoint.x,
      trailPoint.y,
      trailRadius
    );
    if (isSuperBall) {
      trailGradient.addColorStop(0, `rgba(255, 241, 241, ${alpha * 1.15})`);
      trailGradient.addColorStop(0.35, `rgba(255, 106, 106, ${alpha})`);
      trailGradient.addColorStop(0.72, `rgba(220, 38, 38, ${alpha * 0.82})`);
      trailGradient.addColorStop(1, "rgba(127, 29, 29, 0)");
    } else {
      trailGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      trailGradient.addColorStop(0.45, `rgba(159, 174, 192, ${alpha * 0.9})`);
      trailGradient.addColorStop(1, `rgba(31, 41, 55, 0)`);
    }
    context.beginPath();
    context.fillStyle = trailGradient;
    context.arc(trailPoint.x, trailPoint.y, trailRadius, 0, Math.PI * 2);
    context.fill();
  }

  const gradient = context.createRadialGradient(
    ball.x - ball.radius * 0.35,
    ball.y - ball.radius * 0.4,
    ball.radius * 0.12,
    ball.x,
    ball.y,
    ball.radius
  );
  if (isSuperBall) {
    gradient.addColorStop(0, "#fff1f1");
    gradient.addColorStop(0.18, "#fca5a5");
    gradient.addColorStop(0.45, "#ef4444");
    gradient.addColorStop(0.72, "#b91c1c");
    gradient.addColorStop(1, "#7f1d1d");
  } else {
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.18, "#dfe7ef");
    gradient.addColorStop(0.45, "#9aa7b5");
    gradient.addColorStop(0.72, "#556270");
    gradient.addColorStop(1, "#1f2937");
  }

  context.beginPath();
  context.fillStyle = gradient;
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.strokeStyle = isSuperBall
    ? "rgba(255, 232, 232, 0.72)"
    : "rgba(255, 255, 255, 0.5)";
  context.lineWidth = 1.5;
  context.arc(ball.x, ball.y, ball.radius - 0.75, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.fillStyle = isSuperBall
    ? "rgba(255, 244, 244, 0.36)"
    : "rgba(255, 255, 255, 0.42)";
  context.arc(
    ball.x - ball.radius * 0.28,
    ball.y - ball.radius * 0.32,
    ball.radius * 0.22,
    0,
    Math.PI * 2
  );
  context.fill();
}

function drawBonusIcon(type, centerX, centerY, size, isPositive) {
  const strokeColor = "#fffdf0";
  const fillColor = isPositive ? "#d9ff7a" : "#ffb0b0";
  context.save();
  context.translate(centerX, centerY);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = strokeColor;
  context.fillStyle = fillColor;
  context.lineWidth = Math.max(2, size * 0.12);

  if (type === "widen") {
    context.beginPath();
    context.moveTo(-size * 0.32, 0);
    context.lineTo(size * 0.32, 0);
    context.stroke();
    context.beginPath();
    context.moveTo(-size * 0.42, 0);
    context.lineTo(-size * 0.22, -size * 0.16);
    context.lineTo(-size * 0.22, size * 0.16);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(size * 0.42, 0);
    context.lineTo(size * 0.22, -size * 0.16);
    context.lineTo(size * 0.22, size * 0.16);
    context.closePath();
    context.fill();
  } else if (type === "sticky") {
    context.beginPath();
    context.moveTo(-size * 0.18, -size * 0.16);
    context.bezierCurveTo(size * 0.06, -size * 0.34, size * 0.26, -size * 0.2, size * 0.18, 0);
    context.bezierCurveTo(size * 0.32, size * 0.1, size * 0.2, size * 0.34, -size * 0.02, size * 0.28);
    context.bezierCurveTo(-size * 0.22, size * 0.38, -size * 0.34, size * 0.12, -size * 0.22, -size * 0.02);
    context.bezierCurveTo(-size * 0.34, -size * 0.08, -size * 0.3, -size * 0.26, -size * 0.18, -size * 0.16);
    context.closePath();
    context.fill();
    context.stroke();
  } else if (type === "shooter") {
    context.beginPath();
    context.arc(-size * 0.02, 0, size * 0.24, -Math.PI * 0.72, Math.PI * 0.72);
    context.stroke();
    context.beginPath();
    context.moveTo(-size * 0.14, -size * 0.18);
    context.lineTo(-size * 0.1, size * 0.2);
    context.stroke();
    context.beginPath();
    context.moveTo(-size * 0.18, 0);
    context.lineTo(size * 0.22, 0);
    context.stroke();
    context.beginPath();
    context.moveTo(size * 0.22, 0);
    context.lineTo(size * 0.04, -size * 0.14);
    context.lineTo(size * 0.04, size * 0.14);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(-size * 0.28, 0);
    context.lineTo(-size * 0.18, -size * 0.08);
    context.moveTo(-size * 0.28, 0);
    context.lineTo(-size * 0.18, size * 0.08);
    context.stroke();
  } else if (type === "extraLife") {
    context.beginPath();
    context.moveTo(0, size * 0.34);
    context.bezierCurveTo(size * 0.36, size * 0.12, size * 0.5, -size * 0.1, size * 0.32, -size * 0.28);
    context.bezierCurveTo(size * 0.18, -size * 0.42, 0, -size * 0.28, 0, -size * 0.14);
    context.bezierCurveTo(0, -size * 0.28, -size * 0.18, -size * 0.42, -size * 0.32, -size * 0.28);
    context.bezierCurveTo(-size * 0.5, -size * 0.1, -size * 0.36, size * 0.12, 0, size * 0.34);
    context.closePath();
    context.fill();
  } else if (type === "superBall") {
    context.fillStyle = "#ff5a1f";
    context.strokeStyle = "#fff2b3";
    context.lineWidth = Math.max(1.8, size * 0.1);
    context.beginPath();
    context.moveTo(0, -size * 0.34);
    context.bezierCurveTo(size * 0.18, -size * 0.28, size * 0.24, -size * 0.06, size * 0.14, size * 0.08);
    context.bezierCurveTo(size * 0.26, size * 0.02, size * 0.32, size * 0.24, size * 0.1, size * 0.34);
    context.bezierCurveTo(size * 0.02, size * 0.28, -size * 0.02, size * 0.26, 0, size * 0.14);
    context.bezierCurveTo(-size * 0.05, size * 0.28, -size * 0.24, size * 0.28, -size * 0.18, size * 0.08);
    context.bezierCurveTo(-size * 0.3, 0, -size * 0.22, -size * 0.2, 0, -size * 0.34);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = "#ffd54a";
    context.beginPath();
    context.moveTo(0, -size * 0.2);
    context.bezierCurveTo(size * 0.08, -size * 0.14, size * 0.12, -size * 0.02, size * 0.06, size * 0.08);
    context.bezierCurveTo(size * 0.12, size * 0.06, size * 0.14, size * 0.18, size * 0.03, size * 0.24);
    context.bezierCurveTo(0, size * 0.16, -size * 0.02, size * 0.12, -size * 0.01, size * 0.04);
    context.bezierCurveTo(-size * 0.04, size * 0.12, -size * 0.12, size * 0.14, -size * 0.08, size * 0.02);
    context.bezierCurveTo(-size * 0.14, -size * 0.04, -size * 0.1, -size * 0.14, 0, -size * 0.2);
    context.closePath();
    context.fill();
  } else if (type === "shrinkHalf" || type === "shrinkThird") {
    context.beginPath();
    context.moveTo(-size * 0.38, 0);
    context.lineTo(-size * 0.1, 0);
    context.moveTo(size * 0.38, 0);
    context.lineTo(size * 0.1, 0);
    context.stroke();
    context.beginPath();
    context.moveTo(-size * 0.02, 0);
    context.lineTo(-size * 0.2, -size * 0.16);
    context.lineTo(-size * 0.2, size * 0.16);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(size * 0.02, 0);
    context.lineTo(size * 0.2, -size * 0.16);
    context.lineTo(size * 0.2, size * 0.16);
    context.closePath();
    context.fill();
  } else if (type === "speedDouble" || type === "speedTriple") {
    const chevrons = 2;
    for (let index = 0; index < chevrons; index += 1) {
      const offset = (index - (chevrons - 1) / 2) * size * 0.18;
      context.beginPath();
      if (type === "speedDouble") {
        context.moveTo(offset + size * 0.14, -size * 0.18);
        context.lineTo(offset - size * 0.02, 0);
        context.lineTo(offset + size * 0.14, size * 0.18);
      } else {
        context.moveTo(offset - size * 0.14, -size * 0.18);
        context.lineTo(offset + size * 0.02, 0);
        context.lineTo(offset - size * 0.14, size * 0.18);
      }
      context.stroke();
    }
  }

  context.restore();
}

function drawFallingBonuses() {
  for (const bonus of fallingBonuses) {
    const isPositive = isPositiveBonus(bonus.type);
    const pillWidth = bonus.size * 1.75;
    const pillHeight = bonus.size * 0.9;
    const hoverOffset = Math.sin(bonus.phase * 1.35) * 2.2;
    const squash = 0.68 + Math.abs(Math.cos(bonus.phase)) * 0.42;
    const pillX = bonus.x - pillWidth / 2;
    const pillY = bonus.y + hoverOffset - pillHeight / 2;
    const cornerRadius = pillHeight / 2;
    const pulse = 0.88 + (Math.sin(bonus.phase) + 1) * 0.12;
    const highlightColor = isPositive ? "#d9ff7a" : "#ffb0b0";
    const midColor = isPositive ? "#45ff84" : "#ff5a5a";
    const baseColor = isPositive ? "#00d84f" : "#ff2020";
    const shadowColor = isPositive ? "#045f24" : "#7f0606";
    const fill = context.createLinearGradient(
      pillX,
      pillY,
      pillX,
      pillY + pillHeight
    );
    fill.addColorStop(0, highlightColor);
    fill.addColorStop(0.22, midColor);
    fill.addColorStop(0.62, baseColor);
    fill.addColorStop(1, shadowColor);

    context.save();
    context.shadowColor = isPositive ? "rgba(0, 216, 79, 0.82)" : "rgba(255, 32, 32, 0.82)";
    context.shadowBlur = 28 * pulse;
    context.shadowOffsetY = 4;
    context.translate(bonus.x, bonus.y + hoverOffset);
    context.scale(1, squash);
    context.beginPath();
    context.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, cornerRadius);
    context.fillStyle = fill;
    context.fill();

    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.beginPath();
    context.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, cornerRadius);
    context.lineWidth = 1.9;
    context.strokeStyle = isPositive ? "rgba(232, 255, 220, 0.98)" : "rgba(255, 228, 228, 0.98)";
    context.stroke();

    context.beginPath();
    context.roundRect(
      -pillWidth / 2 + 2,
      -pillHeight / 2 + 2,
      pillWidth - 4,
      Math.max(3, pillHeight * 0.38),
      Math.max(2, cornerRadius - 2)
    );
    context.fillStyle = "rgba(255, 255, 255, 0.34)";
    context.fill();
    context.restore();

    context.shadowColor = isPositive ? "rgba(0, 110, 36, 0.82)" : "rgba(145, 0, 0, 0.82)";
    context.shadowBlur = 10;
    drawBonusIcon(bonus.type, bonus.x, bonus.y + hoverOffset, bonus.size * 0.9, isPositive);
    context.shadowBlur = 0;
  }
}

function drawProjectiles() {
  for (const projectile of projectiles) {
    const beam = context.createLinearGradient(
      projectile.x,
      projectile.y,
      projectile.x,
      projectile.y + projectile.height
    );
    beam.addColorStop(0, "#f8fafc");
    beam.addColorStop(0.5, "#67e8f9");
    beam.addColorStop(1, "#0ea5e9");
    context.fillStyle = beam;
    context.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
  }
}

function drawBricks() {
  const rowColors = ["#ff7a18", "#ff3d81", "#8b5cff", "#39ff88", "#21d4fd"];
  const bevel = 4;

  for (const brick of bricks) {
    if (!brick.alive) {
      continue;
    }

    const isBonusBrick = Boolean(brick.bonusType);
    const baseColor = isBonusBrick ? "#facc15" : rowColors[brick.row % rowColors.length];
    const face = context.createLinearGradient(
      brick.x,
      brick.y,
      brick.x,
      brick.y + brick.height
    );
    face.addColorStop(0, isBonusBrick ? "rgba(255, 248, 196, 0.55)" : "rgba(255, 255, 255, 0.34)");
    face.addColorStop(0.15, baseColor);
    face.addColorStop(0.72, baseColor);
    face.addColorStop(1, isBonusBrick ? "rgba(120, 84, 10, 0.32)" : "rgba(10, 14, 28, 0.32)");

    context.shadowColor = isBonusBrick ? "rgba(250, 204, 21, 0.48)" : `${baseColor}66`;
    context.shadowBlur = 14;
    context.shadowOffsetY = 4;
    context.fillStyle = face;
    context.fillRect(brick.x, brick.y, brick.width, brick.height);
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;

    context.fillStyle = isBonusBrick ? "rgba(255, 252, 230, 0.62)" : "rgba(255, 255, 255, 0.45)";
    context.fillRect(brick.x + bevel, brick.y + bevel, brick.width - bevel * 2, 2);
    context.fillRect(brick.x + bevel, brick.y + bevel, 2, brick.height - bevel * 2);

    context.fillStyle = isBonusBrick ? "rgba(120, 84, 10, 0.28)" : "rgba(3, 7, 18, 0.3)";
    context.fillRect(
      brick.x + bevel,
      brick.y + brick.height - bevel - 2,
      brick.width - bevel * 2,
      2
    );
    context.fillRect(
      brick.x + brick.width - bevel - 2,
      brick.y + bevel,
      2,
      brick.height - bevel * 2
    );

    const inset = context.createLinearGradient(
      brick.x + bevel,
      brick.y + bevel,
      brick.x + brick.width - bevel,
      brick.y + brick.height - bevel
    );
    inset.addColorStop(0, isBonusBrick ? "rgba(255, 250, 205, 0.34)" : "rgba(255, 255, 255, 0.26)");
    inset.addColorStop(0.4, isBonusBrick ? "rgba(255, 245, 157, 0.18)" : "rgba(255, 255, 255, 0.1)");
    inset.addColorStop(1, isBonusBrick ? "rgba(120, 84, 10, 0.14)" : "rgba(4, 10, 24, 0.16)");
    context.fillStyle = inset;
    context.fillRect(
      brick.x + bevel,
      brick.y + bevel,
      brick.width - bevel * 2,
      brick.height - bevel * 2
    );

    context.strokeStyle = isBonusBrick ? "rgba(255, 244, 180, 0.38)" : "rgba(255, 255, 255, 0.2)";
    context.strokeRect(brick.x, brick.y, brick.width, brick.height);
  }
}

function drawMessage() {
  return;
}

function draw() {
  drawBackground();
  drawBricks();
  drawFallingBonuses();
  drawProjectiles();
  drawPaddle();
  drawBall();
  drawMessage();
}

function handlePointerMove(event) {
  if (leaderboardState.mode || game.paused) {
    return;
  }

  const previousX = paddle.x;
  const pointerClientX = "touches" in event ? event.touches[0].clientX : event.clientX;
  const pointerX = pointerClientX - canvas.getBoundingClientRect().left;
  paddle.x = pointerX - paddle.width / 2;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
  const currentTime = typeof event.timeStamp === "number" ? event.timeStamp : 0;
  const elapsedMs = lastPointerMoveTime
    ? Math.max(currentTime - lastPointerMoveTime, 1)
    : 16;
  paddle.velocityX = ((paddle.x - previousX) / elapsedMs) * 1000;
  lastPointerMoveTime = currentTime;

  if (ball.attached) {
    attachBallToPaddle(ball.paddleOffsetX, ball.stickyAttachment);
  }
}

function handleAction() {
  if (isTextEntryActive()) {
    return;
  }

  if (game.paused) {
    return;
  }

  if (leaderboardState.mode) {
    startFromLeaderboard();
    return;
  }

  if (game.lives <= 0) {
    resetGame();
    return;
  }

  if (ball.attached) {
    launchBall();
    return;
  }

  if (effects.shooterActive) {
    if (effects.shotCooldown > 0) {
      return;
    }

    projectiles.push({
      x: paddle.x + paddle.width / 2 - 2,
      y: paddle.y - 14,
      width: 4,
      height: 16,
      speed: 640,
    });
    effects.shotCooldown = 0.28;
  }
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (isTextEntryActive()) {
    return;
  }

  if (key === "p") {
    if (!leaderboardState.mode && (game.running || game.paused)) {
      event.preventDefault();
      togglePause();
    }
    return;
  }

  if (game.paused) {
    return;
  }

  if (leaderboardState.mode && key !== " " && key !== "spacebar") {
    return;
  }

  if (key === "arrowleft" || key === "a") {
    controls.left = true;
  } else if (key === "arrowright" || key === "d") {
    controls.right = true;
  } else if (key === " " || key === "spacebar") {
    event.preventDefault();
    handleAction();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (isTextEntryActive()) {
    return;
  }

  if (game.paused) {
    controls.left = false;
    controls.right = false;
    return;
  }

  if (leaderboardState.mode) {
    controls.left = false;
    controls.right = false;
    return;
  }

  if (key === "arrowleft" || key === "a") {
    controls.left = false;
  } else if (key === "arrowright" || key === "d") {
    controls.right = false;
  }
});

window.addEventListener("mousemove", handlePointerMove);
window.addEventListener(
  "touchmove",
  (event) => {
    if (leaderboardState.mode || game.paused) {
      return;
    }

    event.preventDefault();
    handlePointerMove(event);
  },
  { passive: false }
);
canvas.addEventListener("click", handleAction);
window.addEventListener("resize", resizeCanvas);

playerNameInput.addEventListener("input", () => {
  playerNameInput.value = sanitizePlayerName(playerNameInput.value);
});

scoreFormElement.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveCurrentScore();
});

leaderboardStartButton.addEventListener("click", () => {
  startFromLeaderboard();
});

pauseResumeButton.addEventListener("click", () => {
  resumeGame();
});

startOverlayButton.addEventListener("click", () => {
  handleAction();
});

pauseToggleButton.addEventListener("click", () => {
  togglePause();
});

let lastTimestamp = performance.now();

function animate(timestamp) {
  const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  if (!game.paused) {
    movePaddle(deltaSeconds);
    updateEffects(deltaSeconds);
    updateFallingBonuses(deltaSeconds);
    updateProjectiles(deltaSeconds);
  }

  if (game.running && !game.paused) {
    updateBall(deltaSeconds);
  }

  draw();
  window.requestAnimationFrame(animate);
}

resizeCanvas();
resetGame();
showLeaderboard("intro");
draw();
window.requestAnimationFrame(animate);
