const SPREADSHEET_ID = "1UaBU1XSWbO0gaPoZ6Xfx3qUPzQaZUZ92T-s9lPSnDo8";
const MAX_HIGH_SCORES = 10;

function doGet(event) {
  const limit = parseLimit_(event);
  return jsonResponse_({
    ok: true,
    entries: readLeaderboardEntries_(limit),
  });
}

function doPost(event) {
  if (!event || !event.postData || !event.postData.contents) {
    return jsonResponse_({
      ok: false,
      error: "Brak danych wyniku do zapisania.",
    });
  }

  try {
    const payload = JSON.parse(event.postData.contents);
    const entry = normalizeEntry_(payload);
    const sheet = getLeaderboardSheet_();

    sheet.appendRow([
      entry.name,
      entry.deviceType,
      entry.level,
      entry.score,
      new Date().toISOString(),
    ]);

    return jsonResponse_({
      ok: true,
      entries: readLeaderboardEntries_(MAX_HIGH_SCORES),
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error instanceof Error ? error.message : "Nie udało się zapisać wyniku.",
    });
  }
}

function getLeaderboardSheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
}

function parseLimit_(event) {
  const requested = Number(event && event.parameter ? event.parameter.limit : MAX_HIGH_SCORES);

  if (!Number.isFinite(requested)) {
    return MAX_HIGH_SCORES;
  }

  return Math.max(1, Math.min(MAX_HIGH_SCORES, Math.floor(requested)));
}

function normalizeEntry_(entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Nieprawidłowy format wyniku.");
  }

  const name = sanitizePlayerName_(typeof entry.name === "string" ? entry.name : "");
  const deviceType = normalizeDeviceType_(entry.deviceType);
  const level = Math.max(1, Math.floor(Number(entry.level)));
  const score = Math.max(0, Math.floor(Number(entry.score)));

  if (!Number.isFinite(level) || !Number.isFinite(score)) {
    throw new Error("Wynik ma nieprawidłowe pola.");
  }

  return {
    name: name || "ANONIM",
    deviceType: deviceType,
    level,
    score,
  };
}

function normalizeDeviceType_(deviceType) {
  return deviceType === "phone" || deviceType === "tablet" || deviceType === "computer"
    ? deviceType
    : "computer";
}

function sanitizePlayerName_(name) {
  return name.replace(/\s+/g, " ").trim().slice(0, 10).toUpperCase();
}

function normalizeRow_(row) {
  if (!Array.isArray(row) || row.length < 3) {
    return null;
  }

  try {
    return normalizeEntry_({
      name: row[0],
      deviceType:
        Array.isArray(row) && row.length >= 5
          ? row[1]
          : "computer",
      level: Array.isArray(row) && row.length >= 5 ? row[2] : row[1],
      score: Array.isArray(row) && row.length >= 5 ? row[3] : row[2],
    });
  } catch (error) {
    return null;
  }
}

function compareEntries_(first, second) {
  return second.score - first.score || second.level - first.level || first.name.localeCompare(second.name);
}

function readLeaderboardEntries_(limit) {
  const values = getLeaderboardSheet_().getDataRange().getValues();

  return values
    .map(normalizeRow_)
    .filter(function (entry) {
      return Boolean(entry);
    })
    .sort(compareEntries_)
    .slice(0, limit);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
