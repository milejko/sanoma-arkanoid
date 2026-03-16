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
let lastOutsideCanvasActionAt = 0;
let lastCanvasTouchActionAt = 0;

const LEADERBOARD_API_URL =
  "https://script.google.com/macros/s/AKfycbwjoeNIwfr1osYeAE5jLy_69eaVCosVN-KQcaLQ4VDIKmrnK6LZ6t1_RynHlwnk1wec/exec";
const MAX_HIGH_SCORES = 10;
const LEADERBOARD_CACHE_KEY = "arkanoid-leaderboard-cache";
const CANVAS_EDGE_MARGIN = 12;
const GRID_COLUMNS = 8;
const GRID_ROWS = 26;
const BRICK_ROW_COUNT = 5;
const BRICK_START_ROW = 2;
const PLAYFIELD_INSET = 4;

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
const APP_LAST_UPDATED =
  typeof window.APP_LAST_UPDATED === "string" && window.APP_LAST_UPDATED
    ? window.APP_LAST_UPDATED
    : "";

if (versionBadgeElement) {
  versionBadgeElement.textContent = APP_LAST_UPDATED
    ? `${APP_VERSION} · ${APP_LAST_UPDATED}`
    : APP_VERSION;
}

const audioState = {
  context: null,
  masterGain: null,
  enabled: typeof window.AudioContext === "function" || typeof window.webkitAudioContext === "function",
  lastPlayedAt: {},
};

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
  pendingLevelAdvance: false,
};

const paddle = {
  width: 140,
  baseWidth: 140,
  height: 18,
  speed: 560,
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
  gap: 3,
  topOffset: 0,
  sidePadding: 0,
  height: 22,
};

function getAudioContextClass() {
  return window.AudioContext || window.webkitAudioContext || null;
}

function ensureAudioContext() {
  if (!audioState.enabled) {
    return null;
  }

  if (!audioState.context) {
    const AudioContextClass = getAudioContextClass();

    if (!AudioContextClass) {
      audioState.enabled = false;
      return null;
    }

    const contextInstance = new AudioContextClass();
    const masterGain = contextInstance.createGain();
    masterGain.gain.value = 0.18;
    masterGain.connect(contextInstance.destination);
    audioState.context = contextInstance;
    audioState.masterGain = masterGain;
  }

  return audioState.context;
}

function unlockAudio() {
  const audioContext = ensureAudioContext();

  if (audioContext && audioContext.state === "suspended") {
    void audioContext.resume();
  }
}

function canPlayAudio(name, minInterval = 0.04) {
  const now = performance.now() / 1000;
  const lastPlayedAt = audioState.lastPlayedAt[name] || 0;

  if (now - lastPlayedAt < minInterval) {
    return false;
  }

  audioState.lastPlayedAt[name] = now;
  return true;
}

function playTone(startTime, {
  frequency,
  duration,
  type = "sine",
  volume = 0.25,
  attack = 0.005,
  release = 0.09,
  detune = 0,
  endFrequency = null,
}) {
  const audioContext = ensureAudioContext();

  if (!audioContext || !audioState.masterGain) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  oscillator.detune.setValueAtTime(detune, startTime);

  if (endFrequency && endFrequency !== frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), startTime + duration);
  }

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startTime + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

  oscillator.connect(gainNode);
  gainNode.connect(audioState.masterGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + release + 0.02);
}

function playSound(name) {
  const audioContext = ensureAudioContext();

  if (!audioContext || audioContext.state !== "running") {
    return;
  }

  const currentTime = audioContext.currentTime + 0.002;

  if (name === "launch") {
    if (!canPlayAudio(name, 0.08)) {
      return;
    }

    playTone(currentTime, { frequency: 320, endFrequency: 540, duration: 0.12, type: "triangle", volume: 0.18 });
    playTone(currentTime + 0.04, { frequency: 640, endFrequency: 860, duration: 0.08, type: "sine", volume: 0.11 });
  } else if (name === "paddleHit") {
    if (!canPlayAudio(name, 0.03)) {
      return;
    }

    playTone(currentTime, { frequency: 220, endFrequency: 300, duration: 0.05, type: "triangle", volume: 0.12 });
  } else if (name === "wallHit") {
    if (!canPlayAudio(name, 0.03)) {
      return;
    }

    playTone(currentTime, { frequency: 170, endFrequency: 140, duration: 0.045, type: "sine", volume: 0.08 });
  } else if (name === "brickHit") {
    if (!canPlayAudio(name, 0.02)) {
      return;
    }

    playTone(currentTime, { frequency: 420, endFrequency: 360, duration: 0.04, type: "square", volume: 0.06 });
  } else if (name === "positiveBonusCatch") {
    if (!canPlayAudio(name, 0.06)) {
      return;
    }

    playTone(currentTime, { frequency: 520, endFrequency: 760, duration: 0.09, type: "triangle", volume: 0.15 });
    playTone(currentTime + 0.05, { frequency: 780, endFrequency: 980, duration: 0.07, type: "sine", volume: 0.1 });
  } else if (name === "negativeBonusCatch") {
    if (!canPlayAudio(name, 0.06)) {
      return;
    }

    playTone(currentTime, { frequency: 430, endFrequency: 280, duration: 0.1, type: "sawtooth", volume: 0.13 });
    playTone(currentTime + 0.045, { frequency: 260, endFrequency: 190, duration: 0.09, type: "triangle", volume: 0.08 });
  } else if (name === "positiveSuperBonusCatch") {
    if (!canPlayAudio(name, 0.08)) {
      return;
    }

    playTone(currentTime, { frequency: 380, endFrequency: 720, duration: 0.14, type: "sawtooth", volume: 0.13 });
    playTone(currentTime + 0.06, { frequency: 880, endFrequency: 1260, duration: 0.1, type: "triangle", volume: 0.1 });
  } else if (name === "negativeSuperBonusCatch") {
    if (!canPlayAudio(name, 0.08)) {
      return;
    }

    playTone(currentTime, { frequency: 310, endFrequency: 170, duration: 0.16, type: "sawtooth", volume: 0.14 });
    playTone(currentTime + 0.05, { frequency: 220, endFrequency: 120, duration: 0.14, type: "square", volume: 0.1 });
  } else if (name === "laser") {
    if (!canPlayAudio(name, 0.04)) {
      return;
    }

    playTone(currentTime, { frequency: 920, endFrequency: 460, duration: 0.05, type: "sawtooth", volume: 0.07 });
  } else if (name === "lifeLost") {
    if (!canPlayAudio(name, 0.12)) {
      return;
    }

    playTone(currentTime, { frequency: 280, endFrequency: 140, duration: 0.16, type: "sawtooth", volume: 0.16 });
    playTone(currentTime + 0.07, { frequency: 160, endFrequency: 90, duration: 0.18, type: "triangle", volume: 0.1 });
  } else if (name === "levelUp") {
    if (!canPlayAudio(name, 0.2)) {
      return;
    }

    playTone(currentTime, { frequency: 360, duration: 0.08, type: "triangle", volume: 0.12 });
    playTone(currentTime + 0.08, { frequency: 540, duration: 0.08, type: "triangle", volume: 0.12 });
    playTone(currentTime + 0.16, { frequency: 760, duration: 0.11, type: "sine", volume: 0.13 });
  } else if (name === "pause") {
    if (!canPlayAudio(name, 0.08)) {
      return;
    }

    playTone(currentTime, { frequency: 300, endFrequency: 250, duration: 0.08, type: "triangle", volume: 0.09 });
  } else if (name === "resume") {
    if (!canPlayAudio(name, 0.08)) {
      return;
    }

    playTone(currentTime, { frequency: 250, endFrequency: 340, duration: 0.08, type: "triangle", volume: 0.09 });
  } else if (name === "gameOver") {
    if (!canPlayAudio(name, 0.25)) {
      return;
    }

    playTone(currentTime, { frequency: 240, endFrequency: 160, duration: 0.18, type: "sawtooth", volume: 0.13 });
    playTone(currentTime + 0.14, { frequency: 150, endFrequency: 72, duration: 0.3, type: "triangle", volume: 0.12 });
  }
}

function getBrickRows() {
  return BRICK_ROW_COUNT;
}

function getBrickColumns() {
  return GRID_COLUMNS;
}

function getTileWidth() {
  return getPlayfieldWidth() / GRID_COLUMNS;
}

function getTileHeight() {
  return getPlayfieldHeight() / GRID_ROWS;
}

function getCssPixelValue(variableName, fallback = 0) {
  const rawValue = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  const parsedValue = Number.parseFloat(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function getCssColorValue(variableName, fallback) {
  const rawValue = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return rawValue || fallback;
}

function getCanvasMetrics() {
  const leftInset = getCssPixelValue("--chrome-left-gap");
  const rightInset = getCssPixelValue("--chrome-right-gap");
  const bottomInset = getCssPixelValue("--viewport-bottom-gap");
  const chromeBottom = topChromeElement
    ? Math.ceil(topChromeElement.getBoundingClientRect().bottom)
    : getCssPixelValue("--chrome-top-gap");
  const minTop = chromeBottom + CANVAS_EDGE_MARGIN;
  const maxBottom = window.innerHeight - bottomInset - CANVAS_EDGE_MARGIN;
  const availableWidth = Math.max(
    0,
    window.innerWidth - leftInset - rightInset - CANVAS_EDGE_MARGIN * 2
  );
  const availableHeight = Math.max(
    0,
    maxBottom - minTop
  );
  const side = Math.floor(Math.max(0, Math.min(availableWidth, availableHeight)));
  const left = Math.round(
    leftInset + CANVAS_EDGE_MARGIN + Math.max(0, (availableWidth - side) / 2)
  );
  const top = Math.round(minTop + Math.max(0, (availableHeight - side) / 2));

  return {
    side,
    left,
    top,
  };
}

const wallTileSequence = [
  { row: 8, column: 1 },
  { row: 8, column: 6 },
  { row: 9, column: 3 },
  { row: 9, column: 4 },
  { row: 10, column: 1 },
  { row: 10, column: 6 },
];

function getLayoutWallTiles() {
  const levelInCycle = ((Math.max(1, game.level) - 1) % 12) + 1;

  if (levelInCycle < 2) {
    return [];
  }

  const wallCount = Math.min(Math.floor(levelInCycle / 2), wallTileSequence.length);
  return wallTileSequence.slice(0, wallCount);
}

function getPlayfieldTopBoundary() {
  return PLAYFIELD_INSET;
}

function getPlayfieldLeftBoundary() {
  return PLAYFIELD_INSET;
}

function getPlayfieldRightBoundary() {
  return Math.max(PLAYFIELD_INSET, canvas.width - PLAYFIELD_INSET);
}

function getPlayfieldBottomBoundary() {
  return Math.max(PLAYFIELD_INSET, canvas.height - PLAYFIELD_INSET);
}

function getPlayfieldWidth() {
  return Math.max(0, getPlayfieldRightBoundary() - getPlayfieldLeftBoundary());
}

function getPlayfieldHeight() {
  return Math.max(0, getPlayfieldBottomBoundary() - getPlayfieldTopBoundary());
}

function getBrickTopOffset() {
  return getPlayfieldTopBoundary() + getTileHeight() * BRICK_START_ROW;
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
    label: "Fireball",
    symbol: "*",
    color: "#ef4444",
  },
  suddenDeath: {
    label: "Utrata życia",
    symbol: "☠",
    color: "#ef4444",
  },
  pingPong: {
    label: "Piłka ping-pong",
    symbol: "⊘",
    color: "#f87171",
  },
  crystalCombo: {
    label: "+1 życie + fireball",
    symbol: "♥*",
    color: "#67e8f9",
  },
  shrinkHalf: {
    label: "Paletka -50%",
    symbol: "-",
    color: "#f87171",
  },
  speedDouble: {
    label: "Piłka -50%",
    symbol: ">",
    color: "#f97316",
  },
  speedTriple: {
    label: "Piłka +25%",
    symbol: ">>",
    color: "#ef4444",
  },
};

const positiveBonusTypes = ["widen", "sticky", "shooter", "extraLife", "speedDouble", "superBall", "crystalCombo"];
const standardNegativeBonusTypes = ["shrinkHalf", "speedTriple"];
const negativeBonusTypes = [...standardNegativeBonusTypes, "suddenDeath", "pingPong"];
const superBonusTypes = ["extraLife", "suddenDeath", "superBall", "pingPong", "crystalCombo"];
const standardBonusTypes = ["widen", "sticky", "shooter", ...standardNegativeBonusTypes];

let highScores = [];

function sanitizePlayerName(name) {
  return name.replace(/\s+/g, " ").trim().slice(0, 10).toUpperCase();
}

function normalizeDeviceType(deviceType) {
  if (deviceType === "phone" || deviceType === "tablet" || deviceType === "computer") {
    return deviceType;
  }

  return "computer";
}

function detectDeviceTypeFromResolution() {
  const screenWidth = Number(window.screen && window.screen.width) || window.innerWidth || canvas.width || 0;
  const screenHeight =
    Number(window.screen && window.screen.height) || window.innerHeight || canvas.height || 0;
  const shortestSide = Math.min(screenWidth, screenHeight);

  if (shortestSide > 0 && shortestSide < 600) {
    return "phone";
  }

  if (shortestSide > 0 && shortestSide < 900) {
    return "tablet";
  }

  return "computer";
}

function getDeviceTypeLabel(deviceType) {
  if (deviceType === "phone") {
    return "Telefon";
  }

  if (deviceType === "tablet") {
    return "Tablet";
  }

  return "Komputer";
}

function createDeviceTypeIconElement(deviceType) {
  const icon = document.createElement("span");
  icon.className = `device-icon device-icon-${normalizeDeviceType(deviceType)}`;
  icon.setAttribute("aria-hidden", "true");
  return icon;
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
    deviceType: normalizeDeviceType(entry.deviceType),
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
    const deviceCell = document.createElement("td");
    const nameCell = document.createElement("td");
    const levelCell = document.createElement("td");
    const scoreCell = document.createElement("td");

    deviceCell.className = "leaderboard-table-device";
    deviceCell.setAttribute("aria-label", getDeviceTypeLabel(entry.deviceType));
    deviceCell.title = getDeviceTypeLabel(entry.deviceType);
    deviceCell.appendChild(createDeviceTypeIconElement(entry.deviceType));
    nameCell.textContent = entry.name;
    levelCell.textContent = String(entry.level);
    scoreCell.textContent = String(entry.score);

    row.append(nameCell, levelCell, scoreCell, deviceCell);
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

  unlockAudio();
  game.paused = true;
  controls.left = false;
  controls.right = false;
  renderStartOverlay();
  renderPauseOverlay();
  playSound("pause");
  pauseResumeButton.focus();
}

function resumeGame() {
  if (!game.paused) {
    return;
  }

  unlockAudio();
  game.paused = false;
  controls.left = false;
  controls.right = false;
  lastPointerMoveTime = 0;
  renderPauseOverlay();
  renderStartOverlay();
  playSound("resume");
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
    deviceType: detectDeviceTypeFromResolution(),
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

  unlockAudio();
  const needsReset = leaderboardState.mode === "gameover";

  if (needsReset) {
    resetGame();
  }

  hideLeaderboard();
  launchBall();
}

function isPositiveBonus(type) {
  return positiveBonusTypes.includes(type);
}

function getBonusCatchSoundName(type) {
  const prefix = isPositiveBonus(type) ? "positive" : "negative";
  const suffix = superBonusTypes.includes(type) ? "SuperBonusCatch" : "BonusCatch";
  return `${prefix}${suffix}`;
}

function shuffleArray(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }

  return items;
}

const paddleSizeLevels = [0.2, 0.3, 0.5, 0.7, 0.9, 1, 1.25, 1.5, 1.75, 2, 2.5];
const neutralLevelIndex = 5;

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
  pingPongStacks: 0,
  shotCooldown: 0,
};

let bricks = [];
let fallingBonuses = [];
let projectiles = [];
let lastPointerMoveTime = 0;

function getDoublingBrickCount(startLevel, levelStep, initialCount) {
  if (game.level < startLevel) {
    return 0;
  }

  return initialCount * 2 ** Math.floor((game.level - startLevel) / levelStep);
}

function getBalancedBonusTypes(count, positiveType, negativeType) {
  const types = [];
  const positiveCount = Math.ceil(count / 2);
  const negativeCount = Math.floor(count / 2);

  for (let index = 0; index < positiveCount; index += 1) {
    types.push(positiveType);
  }

  for (let index = 0; index < negativeCount; index += 1) {
    types.push(negativeType);
  }

  return shuffleArray(types);
}

function setBrickMaterial(brick, material) {
  brick.material = material;
  brick.destructible = material !== "wall";

  if (material === "wall") {
    brick.hitPoints = 1;
    brick.maxHitPoints = 1;
    brick.bonusType = null;
    return;
  }

  if (material === "crystal") {
    brick.hitPoints = 4;
    brick.maxHitPoints = 4;
    return;
  }

  if (material === "concrete") {
    brick.hitPoints = 3;
    brick.maxHitPoints = 3;
    return;
  }

  if (material === "brick") {
    brick.hitPoints = 2;
    brick.maxHitPoints = 2;
    return;
  }

  brick.hitPoints = 1;
  brick.maxHitPoints = 1;
}

function resizeCanvas() {
  const previousBaseSpeed = getCurrentBallBaseSpeed();
  const { side, left, top } = getCanvasMetrics();
  canvas.style.width = `${side}px`;
  canvas.style.height = `${side}px`;
  canvas.style.left = `${left}px`;
  canvas.style.top = `${top}px`;
  canvas.width = side;
  canvas.height = side;
  brickConfig.height = getTileHeight();
  layoutBricks();
  paddle.height = getTileHeight() * 0.5;
  paddle.speed = getTileWidth() * 14.25;
  paddle.y = getPaddleY();
  paddle.baseWidth = getBasePaddleWidth();
  ball.radius = getBallRadius();
  ball.baseSpeed = getTileHeight() * 12.375;
  syncPaddleWidth();
  paddle.velocityX = 0;

  if (ball.attached) {
    attachBallToPaddle(ball.paddleOffsetX, ball.stickyAttachment);
  } else {
    ball.x = Math.min(
      Math.max(ball.x, getPlayfieldLeftBoundary() + ball.radius),
      getPlayfieldRightBoundary() - ball.radius
    );
    ball.y = Math.min(
      Math.max(ball.y, getPlayfieldTopBoundary() + ball.radius),
      getPlayfieldBottomBoundary() - ball.radius
    );
    syncBallSpeedWithBaseSpeed(previousBaseSpeed);
  }
}

function createBricks() {
  bricks = [];
  const rows = getBrickRows();
  const columns = getBrickColumns();

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      bricks.push({
        row: BRICK_START_ROW + row,
        column,
        alive: true,
        x: 0,
        y: 0,
        width: 0,
        height: brickConfig.height,
        material: "standard",
        destructible: true,
        hitPoints: 1,
        maxHitPoints: 1,
        bonusType: null,
      });
    }
  }

  const shuffledIndices = shuffleArray(Array.from({ length: bricks.length }, (_, index) => index));
  const standardBonusCount = Math.min(standardBonusTypes.length, bricks.length);
  const standardBonusIndices = shuffledIndices.slice(0, standardBonusCount);
  const durableCandidateIndices = shuffledIndices.slice(standardBonusCount);
  const durableSlotCount = durableCandidateIndices.length;
  const crystalCount = Math.min(getDoublingBrickCount(4, 4, 1), durableSlotCount);
  const remainingAfterCrystal = Math.max(0, durableSlotCount - crystalCount);
  const concreteCount = Math.min(getDoublingBrickCount(3, 3, 2), remainingAfterCrystal);
  const remainingAfterConcrete = Math.max(0, remainingAfterCrystal - concreteCount);
  const brickCount = Math.min(getDoublingBrickCount(2, 2, 2), remainingAfterConcrete);
  const crystalIndices = durableCandidateIndices.slice(0, crystalCount);
  const concreteIndices = durableCandidateIndices.slice(crystalCount, crystalCount + concreteCount);
  const brickIndices = durableCandidateIndices.slice(
    crystalCount + concreteCount,
    crystalCount + concreteCount + brickCount
  );
  const shuffledStandardBonusTypes = shuffleArray([...standardBonusTypes]);
  const brickSuperBonusTypes = getBalancedBonusTypes(brickIndices.length, "extraLife", "suddenDeath");
  const concreteSuperBonusTypes = getBalancedBonusTypes(concreteIndices.length, "superBall", "pingPong");

  for (const brickIndex of crystalIndices) {
    setBrickMaterial(bricks[brickIndex], "crystal");
  }

  for (const brickIndex of concreteIndices) {
    setBrickMaterial(bricks[brickIndex], "concrete");
  }

  for (const brickIndex of brickIndices) {
    setBrickMaterial(bricks[brickIndex], "brick");
  }

  for (let index = 0; index < standardBonusCount; index += 1) {
    bricks[standardBonusIndices[index]].bonusType = shuffledStandardBonusTypes[index];
  }

  for (let index = 0; index < brickSuperBonusTypes.length; index += 1) {
    bricks[brickIndices[index]].bonusType = brickSuperBonusTypes[index];
  }

  for (let index = 0; index < concreteSuperBonusTypes.length; index += 1) {
    bricks[concreteIndices[index]].bonusType = concreteSuperBonusTypes[index];
  }

  for (const brickIndex of crystalIndices) {
    bricks[brickIndex].bonusType = "crystalCombo";
  }

  for (const wallTile of getLayoutWallTiles()) {
    const wallBrick = {
      row: wallTile.row,
      column: wallTile.column,
      alive: true,
      x: 0,
      y: 0,
      width: 0,
      height: brickConfig.height,
      material: "wall",
      destructible: false,
      hitPoints: 1,
      maxHitPoints: 1,
      bonusType: null,
    };
    setBrickMaterial(wallBrick, "wall");
    bricks.push(wallBrick);
  }

  layoutBricks();
}

function layoutBricks() {
  if (!bricks.length || canvas.width === 0) {
    return;
  }

  const topOffset = getBrickTopOffset();
  const tileWidth = getTileWidth();
  const tileHeight = getTileHeight();
  const gap = Math.max(0, Math.min(brickConfig.gap, tileWidth - 2, tileHeight - 2));
  const inset = gap / 2;
  const brickWidth = Math.max(2, tileWidth - gap);
  const brickHeight = Math.max(2, tileHeight - gap);

  for (const brick of bricks) {
    brick.width = brickWidth;
    brick.height = brickHeight;
    brick.x = getPlayfieldLeftBoundary() + brick.column * tileWidth + inset;
    brick.y = topOffset + (brick.row - BRICK_START_ROW) * tileHeight + inset;
  }
}

function hasRemainingDestructibleBricks() {
  return bricks.some((brick) => brick.alive && brick.destructible !== false);
}

function bounceBallFromBrick(previousX, brick) {
  const wasLeftOfBrick = previousX + ball.radius <= brick.x;
  const wasRightOfBrick = previousX - ball.radius >= brick.x + brick.width;

  if (wasLeftOfBrick || wasRightOfBrick) {
    ball.velocityX *= -1;
    ball.spin *= 0.94;
    return;
  }

  ball.velocityY *= -1;
  ball.spin *= 0.97;
}

function getBasePaddleWidth() {
  return getTileWidth();
}

function getPaddleY() {
  return getPlayfieldBottomBoundary() - getTileHeight();
}

function getBallRadius() {
  return Math.max(5, getTileHeight() * 0.42);
}

function getBallAttachmentGap() {
  return Math.max(2, getTileHeight() * 0.12);
}

function getBonusSize() {
  return Math.max(16, Math.min(getTileWidth() * 0.65, getTileHeight() * 1.4));
}

function getBonusFallSpeed() {
  return Math.max(getTileHeight() * 8, getCurrentBallBaseSpeed() * 0.9);
}

function getProjectileWidth() {
  return Math.max(3, getTileWidth() * 0.08);
}

function getProjectileHeight() {
  return Math.max(12, getTileHeight() * 1.05);
}

function getProjectileSpeed() {
  return getTileHeight() * 41.5;
}

function getSmallDeviceBallSpeedFactor() {
  if (canvas.width <= 0 || canvas.height <= 0) {
    return 1;
  }

  const shortestSide = Math.min(canvas.width, canvas.height);
  const normalizedSide = Math.max(320, Math.min(960, shortestSide));

  return 0.68 + (normalizedSide - 320) / (960 - 320) * 0.28;
}

function getCurrentBallBaseSpeed() {
  const levelSpeedFactor = 1 + (game.level - 1) * 0.05;
  return (
    ball.baseSpeed *
    levelSpeedFactor *
    getSmallDeviceBallSpeedFactor() *
    (1 + effects.speedModifier)
  );
}

function syncBallSpeedWithBaseSpeed(previousBaseSpeed) {
  if (ball.attached || !Number.isFinite(previousBaseSpeed) || previousBaseSpeed <= 0) {
    return;
  }

  const nextBaseSpeed = getCurrentBallBaseSpeed();

  if (!Number.isFinite(nextBaseSpeed) || nextBaseSpeed <= 0) {
    return;
  }

  const velocityRatio = nextBaseSpeed / previousBaseSpeed;
  ball.velocityX *= velocityRatio;
  ball.velocityY *= velocityRatio;
  ball.spin *= velocityRatio;
}

function advanceToNextLevel() {
  if (leaderboardState.mode) {
    return;
  }

  playSound("levelUp");
  game.pendingLevelAdvance = false;
  game.running = false;
  game.level += 1;
  clearEffects({ preservePaddleSizeLevel: true, preserveShooter: true });
  createBricks();
  resetRound();
  game.message = `Poziom ${game.level}`;
  game.startOverlayMode = "levelStart";
  renderStartOverlay();
  updateHud();
}

function syncPaddleWidth() {
  const playfieldLeft = getPlayfieldLeftBoundary();
  const playfieldWidth = getPlayfieldWidth();
  const previousCenter = paddle.x + paddle.width / 2 || playfieldLeft + playfieldWidth / 2;
  const widenedWidth = Math.min(
    paddle.baseWidth * paddleSizeLevels[effects.paddleSizeLevel],
    playfieldWidth * 0.62
  );
  paddle.width = Math.max(getTileWidth() * paddleSizeLevels[0], widenedWidth);
  paddle.x = Math.max(
    playfieldLeft,
    Math.min(getPlayfieldRightBoundary() - paddle.width, previousCenter - paddle.width / 2)
  );

  if (ball.attached) {
    ball.paddleOffsetX = getClampedPaddleOffset(ball.paddleOffsetX);
    ball.x = paddle.x + paddle.width / 2 + ball.paddleOffsetX;
    ball.y = paddle.y - ball.radius - getBallAttachmentGap();
  }
}

function clearEffects({ preservePaddleSizeLevel = false, preserveShooter = false } = {}) {
  if (!preservePaddleSizeLevel) {
    effects.paddleSizeLevel = neutralLevelIndex;
  }
  effects.stickyActive = false;
  effects.stickyTimer = 0;
  effects.shooterActive = preserveShooter ? effects.shooterActive : false;
  effects.shooterTimer = 0;
  effects.superBallActive = false;
  effects.superBallTimer = 0;
  effects.speedModifier = 0;
  effects.speedTimer = 0;
  while (effects.pingPongStacks > 0) {
    for (const brick of bricks) {
      if (!brick.alive || brick.destructible === false) {
        continue;
      }

      brick.hitPoints = Math.max(1, Math.ceil(brick.hitPoints / 2));
      brick.maxHitPoints = Math.max(1, Math.ceil(brick.maxHitPoints / 2));
    }

    effects.pingPongStacks -= 1;
  }
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
  ball.y = paddle.y - ball.radius - getBallAttachmentGap();
}

function launchBall() {
  if (!ball.attached) {
    return;
  }

  unlockAudio();
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
  playSound("launch");
}

function resetRound() {
  const isLifeContinuation = game.running || game.message === "";
  fallingBonuses = [];
  projectiles = [];
  game.pendingLevelAdvance = false;
  game.paused = false;
  paddle.baseWidth = getBasePaddleWidth();
  syncPaddleWidth();
  paddle.x = getPlayfieldLeftBoundary() + (getPlayfieldWidth() - paddle.width) / 2;
  paddle.y = getPaddleY();
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
  game.pendingLevelAdvance = false;
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
  paddle.x = Math.max(
    getPlayfieldLeftBoundary(),
    Math.min(getPlayfieldRightBoundary() - paddle.width, paddle.x)
  );
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
  playSound("paddleHit");

  if (effects.stickyActive) {
    attachBallToPaddle(impactOffsetX, true);
    game.running = false;
    game.message = "";
  }
}

function bounceOffWalls() {
  const topBoundary = getPlayfieldTopBoundary();
  const leftBoundary = getPlayfieldLeftBoundary();
  const rightBoundary = getPlayfieldRightBoundary();

  if (ball.x + ball.radius >= rightBoundary) {
    ball.x = rightBoundary - ball.radius;
    ball.velocityX *= -1;
    ball.spin *= 0.92;
    playSound("paddleHit");
  } else if (ball.x - ball.radius <= leftBoundary) {
    ball.x = leftBoundary + ball.radius;
    ball.velocityX *= -1;
    ball.spin *= 0.92;
    playSound("paddleHit");
  }

  if (ball.y - ball.radius <= topBoundary) {
    ball.y = topBoundary + ball.radius;
    ball.velocityY *= -1;
    ball.spin *= 0.96;
    playSound("paddleHit");
  }
}

function hitBrick(brick, canDestroyWalls = false) {
  if (!brick.alive) {
    return;
  }

  if (brick.destructible === false) {
    if (canDestroyWalls) {
      brick.alive = false;
      playSound("brickHit");
    } else {
      playSound("wallHit");
    }

    return;
  }

  const previousBaseSpeed = getCurrentBallBaseSpeed();
  brick.hitPoints = Math.max(0, (brick.hitPoints || 1) - 1);

  if (brick.hitPoints > 0) {
    return;
  }

  brick.alive = false;
  playSound("brickHit");

  if (brick.bonusType) {
    fallingBonuses.push({
      type: brick.bonusType,
      x: brick.x + brick.width / 2,
      y: brick.y + brick.height / 2,
      size: getBonusSize(),
      speed: getBonusFallSpeed(),
      phase: Math.random() * Math.PI * 2,
    });
  }

  game.score += 100;
  updateHud();

  if (!hasRemainingDestructibleBricks()) {
    game.pendingLevelAdvance = fallingBonuses.length > 0;

    if (!game.pendingLevelAdvance) {
      game.running = false;
      advanceToNextLevel();
    }

    return;
  }

  syncBallSpeedWithBaseSpeed(previousBaseSpeed);
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

      if (brick.destructible === false) {
        hitBrick(brick, true);
      } else {
        hitBrick(brick, true);
      }

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

    bounceBallFromBrick(previousX, brick);
    hitBrick(brick);
    break;
  }
}

function loseLife() {
  game.lives -= 1;
  fallingBonuses = [];
  projectiles = [];
  game.pendingLevelAdvance = false;
  clearEffects();
  updateHud();

  if (game.lives <= 0) {
    game.running = false;
    ball.attached = true;
    ball.stickyAttachment = false;
    ball.stickyAutoLaunchTimer = 0;
    game.message = "";
    playSound("gameOver");
    showLeaderboard("gameover");
    return;
  }

  playSound("lifeLost");
  resetRound();
}

function activateBonus(type) {
  if (type === "widen") {
    effects.paddleSizeLevel = Math.min(effects.paddleSizeLevel + 1, paddleSizeLevels.length - 1);
    syncPaddleWidth();
  } else if (type === "shrinkHalf") {
    effects.paddleSizeLevel = Math.max(effects.paddleSizeLevel - 1, 0);
    syncPaddleWidth();
  } else if (type === "sticky") {
    effects.stickyActive = true;
    effects.stickyTimer = 15;
  } else if (type === "shooter") {
    effects.shooterActive = true;
    effects.shooterTimer = 0;
  } else if (type === "extraLife") {
    game.lives = Math.min(3, game.lives + 1);
  } else if (type === "superBall") {
    effects.superBallActive = true;
    effects.superBallTimer = 5;
  } else if (type === "suddenDeath") {
    loseLife();
    return true;
  } else if (type === "pingPong") {
    for (const brick of bricks) {
      if (!brick.alive || brick.destructible === false) {
        continue;
      }

      brick.hitPoints *= 2;
      brick.maxHitPoints *= 2;
    }
    effects.pingPongStacks += 1;
  } else if (type === "crystalCombo") {
    game.lives = Math.min(3, game.lives + 1);
    effects.superBallActive = true;
    effects.superBallTimer = 5;
  } else if (type === "speedDouble") {
    const previousSpeedFactor = 1 + effects.speedModifier;
    effects.speedModifier = -0.5;
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
  return false;
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
    bonus.speed = getBonusFallSpeed();
    bonus.y += bonus.speed * deltaSeconds;
    bonus.phase += deltaSeconds * 4.5;

    const caughtByPaddle =
      bonus.x + bonus.size / 2 >= paddle.x &&
      bonus.x - bonus.size / 2 <= paddle.x + paddle.width &&
      bonus.y + bonus.size / 2 >= paddle.y &&
      bonus.y - bonus.size / 2 <= paddle.y + paddle.height;

    if (caughtByPaddle) {
      game.score += isPositiveBonus(bonus.type) ? 200 : 400;
      playSound(getBonusCatchSoundName(bonus.type));
      const interruptedRound = activateBonus(bonus.type);

      if (interruptedRound) {
        return;
      }

      fallingBonuses.splice(index, 1);

      if (game.pendingLevelAdvance && fallingBonuses.length === 0) {
        advanceToNextLevel();
      }

      continue;
    }

    if (bonus.y - bonus.size / 2 > getPlayfieldBottomBoundary()) {
      fallingBonuses.splice(index, 1);

      if (game.pendingLevelAdvance && fallingBonuses.length === 0) {
        advanceToNextLevel();
      }
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

  if (ball.y - ball.radius > getPlayfieldBottomBoundary()) {
    loseLife();
    return;
  }

  ball.trail.unshift({ x: ball.x, y: ball.y });
  const maxTrailLength = effects.speedModifier < 0 ? 12 : 7;
  if (ball.trail.length > maxTrailLength) {
    ball.trail.length = maxTrailLength;
  }
}

function drawBackground() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = getCssColorValue("--playfield-bg-top", "#0f172a");
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPaddle() {
  const insetX = Math.max(1, Math.min(paddle.width * 0.12, 5));
  const insetY = Math.max(1, Math.min(paddle.height * 0.2, 3));
  const trimThickness = Math.max(1, Math.min(paddle.height * 0.18, 2));
  const innerWidth = Math.max(0, paddle.width - insetX * 2);
  const innerHeight = Math.max(0, paddle.height - insetY * 2);
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
  context.fillRect(paddle.x + insetX, paddle.y + insetY, innerWidth, trimThickness);
  context.fillRect(paddle.x + insetX, paddle.y + insetY, trimThickness, innerHeight);

  context.fillStyle = "rgba(8, 20, 38, 0.34)";
  context.fillRect(
    paddle.x + insetX,
    paddle.y + paddle.height - insetY - trimThickness,
    innerWidth,
    trimThickness
  );
  context.fillRect(
    paddle.x + paddle.width - insetX - trimThickness,
    paddle.y + insetY,
    trimThickness,
    innerHeight
  );

  const inset = context.createLinearGradient(
    paddle.x + insetX,
    paddle.y + insetY,
    paddle.x + paddle.width - insetX,
    paddle.y + paddle.height - insetY
  );
  inset.addColorStop(0, "rgba(255, 255, 255, 0.28)");
  inset.addColorStop(0.45, "rgba(255, 255, 255, 0.08)");
  inset.addColorStop(1, "rgba(8, 20, 38, 0.14)");
  context.fillStyle = inset;
  context.fillRect(paddle.x + insetX, paddle.y + insetY, innerWidth, innerHeight);

  context.strokeStyle = "rgba(255, 255, 255, 0.22)";
  context.lineWidth = 1;
  context.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

  if (isShooter) {
    const cannonBaseWidth = Math.max(8, Math.min(14, paddle.width * 0.32));
    const cannonCoreWidth = Math.max(4, Math.min(6, paddle.width * 0.14));
    const cannonBaseHeight = Math.max(4, Math.min(7, getTileHeight() * 0.45));
    const cannonCoreHeight = Math.max(6, Math.min(8, getTileHeight() * 0.52));
    const cannonBaseX = paddle.x + paddle.width / 2 - cannonBaseWidth / 2;
    const cannonCoreX = paddle.x + paddle.width / 2 - cannonCoreWidth / 2;

    context.fillStyle = "#cbd5e1";
    context.fillRect(cannonBaseX, paddle.y - cannonBaseHeight, cannonBaseWidth, cannonBaseHeight);
    context.fillStyle = "#38bdf8";
    context.fillRect(
      cannonCoreX,
      paddle.y - cannonBaseHeight - cannonCoreHeight * 0.85,
      cannonCoreWidth,
      cannonCoreHeight
    );
  }

  context.shadowBlur = 0;
}

function drawBall() {
  const speedTrailFactor =
    effects.speedModifier < 0 ? 3.2 : effects.speedModifier > 0 ? 0.55 : 1;
  const isSuperBall = effects.superBallActive;
  const isSpeedBoosted = effects.speedModifier > 0;
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
    } else if (isSpeedBoosted) {
      trailGradient.addColorStop(0, `rgba(255, 241, 241, ${alpha * 1.08})`);
      trailGradient.addColorStop(0.4, `rgba(248, 113, 113, ${alpha})`);
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
  } else if (type === "shrinkHalf") {
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
  } else if (type === "suddenDeath") {
    context.fillStyle = "#ffe4e6";
    context.strokeStyle = "#fff7ed";
    context.lineWidth = Math.max(1.8, size * 0.09);
    context.beginPath();
    context.arc(0, -size * 0.02, size * 0.18, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(-size * 0.18, size * 0.14);
    context.lineTo(size * 0.18, size * 0.14);
    context.moveTo(-size * 0.12, size * 0.14);
    context.lineTo(-size * 0.2, size * 0.28);
    context.moveTo(size * 0.12, size * 0.14);
    context.lineTo(size * 0.2, size * 0.28);
    context.stroke();
    context.beginPath();
    context.moveTo(-size * 0.08, -size * 0.04);
    context.lineTo(-size * 0.02, size * 0.02);
    context.moveTo(-size * 0.02, -size * 0.04);
    context.lineTo(-size * 0.08, size * 0.02);
    context.moveTo(size * 0.02, -size * 0.04);
    context.lineTo(size * 0.08, size * 0.02);
    context.moveTo(size * 0.08, -size * 0.04);
    context.lineTo(size * 0.02, size * 0.02);
    context.moveTo(-size * 0.06, size * 0.08);
    context.quadraticCurveTo(0, size * 0.13, size * 0.06, size * 0.08);
    context.stroke();
  } else if (type === "pingPong") {
    context.beginPath();
    context.arc(0, 0, size * 0.24, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(-size * 0.18, -size * 0.18);
    context.lineTo(size * 0.18, size * 0.18);
    context.stroke();
  } else if (type === "crystalCombo") {
    context.beginPath();
    context.moveTo(-size * 0.18, size * 0.18);
    context.bezierCurveTo(size * 0.04, 0, size * 0.12, -size * 0.14, 0, -size * 0.2);
    context.bezierCurveTo(-size * 0.08, -size * 0.3, -size * 0.24, -size * 0.22, -size * 0.18, -size * 0.08);
    context.bezierCurveTo(-size * 0.28, 0, -size * 0.26, size * 0.14, -size * 0.18, size * 0.18);
    context.closePath();
    context.fill();
    context.save();
    context.translate(size * 0.14, -size * 0.02);
    context.scale(0.68, 0.68);
    context.fillStyle = "#ff5a1f";
    context.beginPath();
    context.moveTo(0, -size * 0.28);
    context.bezierCurveTo(size * 0.16, -size * 0.22, size * 0.2, -size * 0.04, size * 0.12, size * 0.08);
    context.bezierCurveTo(size * 0.22, 0, size * 0.26, size * 0.18, size * 0.08, size * 0.26);
    context.bezierCurveTo(0, size * 0.18, -size * 0.02, size * 0.14, 0, size * 0.04);
    context.bezierCurveTo(-size * 0.04, size * 0.16, -size * 0.2, size * 0.18, -size * 0.16, size * 0.02);
    context.bezierCurveTo(-size * 0.22, -size * 0.04, -size * 0.16, -size * 0.18, 0, -size * 0.28);
    context.closePath();
    context.fill();
    context.restore();
  } else if (type === "resetPaddle") {
    context.beginPath();
    context.moveTo(-size * 0.22, -size * 0.22);
    context.lineTo(size * 0.22, size * 0.22);
    context.moveTo(size * 0.22, -size * 0.22);
    context.lineTo(-size * 0.22, size * 0.22);
    context.stroke();
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
  const bevel = Math.max(1.5, Math.min(getTileHeight() * 0.22, 4));

  for (const brick of bricks) {
    if (!brick.alive) {
      continue;
    }

    const isBrickBrick = brick.material === "brick";
    const isConcreteBrick = brick.material === "concrete";
    const isCrystalBrick = brick.material === "crystal";
    const isWallBrick = brick.material === "wall";
    const colorRow = Math.max(0, brick.row - BRICK_START_ROW);
    const baseColor = isWallBrick
        ? "#d1d5db"
        : isCrystalBrick
        ? "#67e8f9"
        : isConcreteBrick
        ? "#6b7280"
        : isBrickBrick
        ? "#c2410c"
        : rowColors[colorRow % rowColors.length];
    const face = context.createLinearGradient(
      brick.x,
      brick.y,
      brick.x,
      brick.y + brick.height
    );
    face.addColorStop(
      0,
      isWallBrick
          ? "rgba(255, 255, 255, 0.62)"
          : isCrystalBrick
          ? "rgba(240, 253, 255, 0.56)"
          : isConcreteBrick
          ? "rgba(255, 255, 255, 0.28)"
          : isBrickBrick
          ? "rgba(255, 237, 213, 0.38)"
          : "rgba(255, 255, 255, 0.34)"
    );
    face.addColorStop(0.15, baseColor);
    face.addColorStop(0.48, baseColor);
    face.addColorStop(0.72, isCrystalBrick ? "#22d3ee" : isBrickBrick ? "#ea580c" : baseColor);
    face.addColorStop(
      1,
      isWallBrick
          ? "rgba(100, 116, 139, 0.34)"
          : isCrystalBrick
          ? "rgba(8, 47, 73, 0.4)"
          : isConcreteBrick
          ? "rgba(31, 41, 55, 0.38)"
          : isBrickBrick
          ? "rgba(124, 45, 18, 0.36)"
          : "rgba(10, 14, 28, 0.32)"
    );

    context.shadowColor = isWallBrick
        ? "rgba(226, 232, 240, 0.4)"
        : isCrystalBrick
        ? "rgba(34, 211, 238, 0.45)"
        : isConcreteBrick
        ? "rgba(107, 114, 128, 0.42)"
        : isBrickBrick
        ? "rgba(194, 65, 12, 0.4)"
        : `${baseColor}66`;
    context.shadowBlur = 14;
    context.shadowOffsetY = 4;
    context.fillStyle = face;
    context.fillRect(brick.x, brick.y, brick.width, brick.height);
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;

    context.fillStyle = isWallBrick
        ? "rgba(255, 255, 255, 0.58)"
        : isCrystalBrick
        ? "rgba(240, 253, 255, 0.56)"
        : isConcreteBrick
        ? "rgba(255, 255, 255, 0.32)"
        : isBrickBrick
        ? "rgba(255, 237, 213, 0.42)"
        : "rgba(255, 255, 255, 0.45)";
    context.fillRect(brick.x + bevel, brick.y + bevel, brick.width - bevel * 2, 2);
    context.fillRect(brick.x + bevel, brick.y + bevel, 2, brick.height - bevel * 2);

    context.fillStyle = isWallBrick
        ? "rgba(100, 116, 139, 0.28)"
        : isCrystalBrick
        ? "rgba(8, 47, 73, 0.3)"
        : isConcreteBrick
        ? "rgba(31, 41, 55, 0.34)"
        : isBrickBrick
        ? "rgba(124, 45, 18, 0.28)"
        : "rgba(3, 7, 18, 0.3)";
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
    inset.addColorStop(
      0,
      isWallBrick
          ? "rgba(255, 255, 255, 0.22)"
          : isCrystalBrick
          ? "rgba(255, 255, 255, 0.3)"
          : isConcreteBrick
          ? "rgba(255, 255, 255, 0.14)"
          : isBrickBrick
          ? "rgba(254, 215, 170, 0.18)"
          : "rgba(255, 255, 255, 0.26)"
    );
    inset.addColorStop(
      0.4,
      isWallBrick
          ? "rgba(226, 232, 240, 0.16)"
          : isCrystalBrick
          ? "rgba(224, 242, 254, 0.18)"
          : isConcreteBrick
          ? "rgba(255, 255, 255, 0.05)"
          : isBrickBrick
          ? "rgba(251, 146, 60, 0.1)"
          : "rgba(255, 255, 255, 0.1)"
    );
    inset.addColorStop(
      1,
      isWallBrick
          ? "rgba(148, 163, 184, 0.14)"
          : isCrystalBrick
          ? "rgba(12, 74, 110, 0.18)"
          : isConcreteBrick
          ? "rgba(15, 23, 42, 0.18)"
          : isBrickBrick
          ? "rgba(124, 45, 18, 0.12)"
          : "rgba(4, 10, 24, 0.16)"
    );
    context.fillStyle = inset;
    context.fillRect(
      brick.x + bevel,
      brick.y + bevel,
      brick.width - bevel * 2,
      brick.height - bevel * 2
    );

    if (isBrickBrick) {
      context.strokeStyle = "rgba(255, 237, 213, 0.3)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(brick.x + bevel, brick.y + brick.height * 0.5);
      context.lineTo(brick.x + brick.width - bevel, brick.y + brick.height * 0.5);
      context.moveTo(brick.x + brick.width * 0.33, brick.y + bevel);
      context.lineTo(brick.x + brick.width * 0.33, brick.y + brick.height * 0.5);
      context.moveTo(brick.x + brick.width * 0.66, brick.y + brick.height * 0.5);
      context.lineTo(brick.x + brick.width * 0.66, brick.y + brick.height - bevel);
      context.stroke();

      if (brick.hitPoints === 1) {
        context.strokeStyle = "rgba(255, 248, 220, 0.5)";
        context.lineWidth = 1.2;
        context.beginPath();
        context.moveTo(brick.x + brick.width * 0.24, brick.y + brick.height * 0.18);
        context.lineTo(brick.x + brick.width * 0.46, brick.y + brick.height * 0.42);
        context.lineTo(brick.x + brick.width * 0.36, brick.y + brick.height * 0.78);
        context.moveTo(brick.x + brick.width * 0.62, brick.y + brick.height * 0.2);
        context.lineTo(brick.x + brick.width * 0.54, brick.y + brick.height * 0.5);
        context.lineTo(brick.x + brick.width * 0.7, brick.y + brick.height * 0.76);
        context.stroke();
      }
    }

    if (isWallBrick) {
      context.strokeStyle = "rgba(255, 255, 255, 0.42)";
      context.lineWidth = 1.1;
      context.strokeRect(brick.x + bevel, brick.y + bevel, brick.width - bevel * 2, brick.height - bevel * 2);
    }

    if (isConcreteBrick) {
      const dotPattern = [
        [0.22, 0.34, 1.6],
        [0.41, 0.62, 1.35],
        [0.61, 0.29, 1.1],
        [0.74, 0.56, 1.55],
        [0.84, 0.4, 0.95],
      ];

      for (const [offsetX, offsetY, radius] of dotPattern) {
        context.beginPath();
        context.fillStyle =
          brick.hitPoints === 1 ? "rgba(229, 231, 235, 0.22)" : "rgba(229, 231, 235, 0.3)";
        context.arc(
          brick.x + brick.width * offsetX,
          brick.y + brick.height * offsetY,
          radius,
          0,
          Math.PI * 2
        );
        context.fill();
      }

      if (brick.hitPoints <= 2) {
        const crackLines = brick.hitPoints === 2
          ? [
              [0.18, 0.22, 0.47, 0.52, 0.66, 0.34, 0.82, 0.71],
              [0.31, 0.14, 0.37, 0.36, 0.27, 0.66, 0.41, 0.86],
            ]
          : [
              [0.18, 0.22, 0.47, 0.52, 0.66, 0.34, 0.82, 0.71],
              [0.31, 0.14, 0.37, 0.36, 0.27, 0.66, 0.41, 0.86],
              [0.61, 0.18, 0.56, 0.44, 0.73, 0.58, 0.64, 0.85],
            ];

        context.strokeStyle = "rgba(241, 245, 249, 0.45)";
        context.lineWidth = 1.2;
        context.lineCap = "round";
        context.lineJoin = "round";

        for (const line of crackLines) {
          context.beginPath();
          context.moveTo(brick.x + brick.width * line[0], brick.y + brick.height * line[1]);

          for (let index = 2; index < line.length; index += 2) {
            context.lineTo(brick.x + brick.width * line[index], brick.y + brick.height * line[index + 1]);
          }

          context.stroke();
        }
      }
    }

    if (isCrystalBrick) {
      const facetLines = [
        [0.2, 0.18, 0.5, 0.06, 0.8, 0.18],
        [0.14, 0.36, 0.5, 0.2, 0.86, 0.36],
        [0.2, 0.18, 0.14, 0.36, 0.2, 0.78],
        [0.8, 0.18, 0.86, 0.36, 0.8, 0.78],
        [0.2, 0.78, 0.5, 0.94, 0.8, 0.78],
        [0.5, 0.06, 0.5, 0.94],
        [0.14, 0.36, 0.5, 0.56, 0.86, 0.36],
        [0.2, 0.78, 0.5, 0.56, 0.8, 0.78],
      ];

      context.strokeStyle = brick.hitPoints === 4 ? "rgba(255, 255, 255, 0.4)" : "rgba(224, 247, 255, 0.52)";
      context.lineWidth = 1.1;
      context.lineCap = "round";
      context.lineJoin = "round";

      for (const line of facetLines) {
        context.beginPath();
        context.moveTo(brick.x + brick.width * line[0], brick.y + brick.height * line[1]);

        for (let index = 2; index < line.length; index += 2) {
          context.lineTo(brick.x + brick.width * line[index], brick.y + brick.height * line[index + 1]);
        }

        context.stroke();
      }

      if (brick.hitPoints < brick.maxHitPoints) {
        const crackSets = brick.hitPoints === 3
          ? [
              [0.3, 0.2, 0.42, 0.4, 0.35, 0.66],
              [0.67, 0.26, 0.59, 0.48, 0.71, 0.7],
            ]
          : brick.hitPoints === 2
            ? [
                [0.24, 0.16, 0.36, 0.34, 0.31, 0.58, 0.44, 0.84],
                [0.72, 0.18, 0.6, 0.38, 0.69, 0.56, 0.57, 0.82],
                [0.3, 0.56, 0.5, 0.46, 0.72, 0.58],
              ]
          : [
                [0.22, 0.14, 0.34, 0.28, 0.29, 0.48, 0.4, 0.74, 0.34, 0.88],
                [0.74, 0.16, 0.62, 0.34, 0.7, 0.52, 0.56, 0.78],
                [0.28, 0.56, 0.5, 0.42, 0.74, 0.56],
                [0.48, 0.12, 0.5, 0.34, 0.54, 0.68, 0.5, 0.94],
              ];

        context.strokeStyle = brick.hitPoints === 3 ? "rgba(207, 250, 254, 0.5)" : "rgba(224, 247, 255, 0.7)";
        context.lineWidth = brick.hitPoints === 3 ? 1.15 : brick.hitPoints === 2 ? 1.25 : 1.4;

        for (const line of crackSets) {
          context.beginPath();
          context.moveTo(brick.x + brick.width * line[0], brick.y + brick.height * line[1]);

          for (let index = 2; index < line.length; index += 2) {
            context.lineTo(brick.x + brick.width * line[index], brick.y + brick.height * line[index + 1]);
          }

          context.stroke();
        }
      }
    }

    context.strokeStyle = isWallBrick
        ? "rgba(226, 232, 240, 0.34)"
        : isCrystalBrick
        ? "rgba(207, 250, 254, 0.3)"
        : isConcreteBrick
        ? "rgba(229, 231, 235, 0.18)"
        : isBrickBrick
        ? "rgba(254, 215, 170, 0.22)"
        : "rgba(255, 255, 255, 0.2)";
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
  paddle.x = Math.max(
    getPlayfieldLeftBoundary(),
    Math.min(getPlayfieldRightBoundary() - paddle.width, paddle.x)
  );
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
  unlockAudio();

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
      width: getProjectileWidth(),
      height: getProjectileHeight(),
      x: paddle.x + paddle.width / 2 - getProjectileWidth() / 2,
      y: paddle.y - getProjectileHeight(),
      speed: getProjectileSpeed(),
    });
    effects.shotCooldown = 0.28;
    playSound("laser");
  }
}

function isElementWithinActionExclusionZone(target) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        ".top-chrome, .leaderboard-overlay, .leaderboard-card, .leaderboard-button, .leaderboard-input, .leaderboard-table-scroll"
      )
    )
  );
}

function getEventClientY(event) {
  if (typeof event.clientY === "number") {
    return event.clientY;
  }

  if ("changedTouches" in event && event.changedTouches && event.changedTouches.length > 0) {
    return event.changedTouches[0].clientY;
  }

  if ("touches" in event && event.touches && event.touches.length > 0) {
    return event.touches[0].clientY;
  }

  return NaN;
}

function handleBelowCanvasAction(event) {
  if (event.defaultPrevented) {
    return;
  }

  if (event.type === "click" && performance.now() - lastOutsideCanvasActionAt < 450) {
    return;
  }

  if (isElementWithinActionExclusionZone(event.target)) {
    return;
  }

  const canvasRect = canvas.getBoundingClientRect();
  const pointerY = getEventClientY(event);

  if (!Number.isFinite(pointerY) || pointerY <= canvasRect.bottom) {
    return;
  }

  if (event.cancelable) {
    event.preventDefault();
  }

  lastOutsideCanvasActionAt = performance.now();
  handleAction();
}

function preventCanvasDefault(event) {
  if (event.cancelable) {
    event.preventDefault();
  }
}

function handleCanvasClickAction(event) {
  if (performance.now() - lastCanvasTouchActionAt < 450) {
    return;
  }

  handleAction();
}

function handleCanvasTouchAction(event) {
  preventCanvasDefault(event);
  lastCanvasTouchActionAt = performance.now();
  handleAction();
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
canvas.addEventListener("click", handleCanvasClickAction);
canvas.addEventListener("touchstart", preventCanvasDefault, { passive: false });
canvas.addEventListener("touchend", handleCanvasTouchAction, { passive: false });
canvas.addEventListener("pointerdown", preventCanvasDefault);
canvas.addEventListener("mousedown", preventCanvasDefault);
canvas.addEventListener("contextmenu", preventCanvasDefault);
canvas.addEventListener("dragstart", preventCanvasDefault);
canvas.addEventListener("selectstart", preventCanvasDefault);
window.addEventListener("touchend", handleBelowCanvasAction, { passive: false });
window.addEventListener("click", handleBelowCanvasAction);
window.addEventListener("blur", () => {
  pauseGame();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseGame();
  }
});
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

if (pauseToggleButton) {
  pauseToggleButton.addEventListener("click", () => {
    togglePause();
  });
}

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
