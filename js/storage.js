/* ==========================================================
   storage.js
   LocalStorage 읽기/쓰기를 담당합니다.
   - Key Settings, Difficulty, Ranking, Reduce Motion 옵션을
     브라우저 재접속 후에도 유지하기 위해 사용합니다.
   ========================================================== */

const STORAGE_KEYS = {
  KEYS: "fingerShift_keys",
  DIFFICULTY: "fingerShift_difficulty",
  RANKINGS: "fingerShift_rankings",
  REDUCE_MOTION: "fingerShift_reduceMotion",
  MODE: "fingerShift_mode",
  TARGET_SCORE: "fingerShift_targetScore",
};

const DEFAULT_KEYS = ["KeyA", "KeyS", "KeyD", "KeyF"];
const DEFAULT_KEY_LABELS = ["A", "S", "D", "F"];
const DEFAULT_MODE = "RECORD"; // "RECORD"(기록 모드) | "GOAL"(목표 모드)
const DEFAULT_TARGET_SCORE = 10;
const MIN_TARGET_SCORE = 1;
const MAX_TARGET_SCORE = 99;

/**
 * 저장된 값을 읽어옵니다. 값이 없거나 파싱에 실패하면 fallback을 반환합니다.
 */
function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("storageGet 실패, 기본값 사용:", key, err);
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("storageSet 실패:", key, err);
  }
}

/* ---------- Key Settings ---------- */
// 저장 형태: { codes: ["KeyA","KeyS","KeyD","KeyF"], labels: ["A","S","D","F"] }
function loadKeySettings() {
  const saved = storageGet(STORAGE_KEYS.KEYS, null);
  if (
    saved &&
    Array.isArray(saved.codes) &&
    saved.codes.length === 4 &&
    Array.isArray(saved.labels) &&
    saved.labels.length === 4
  ) {
    return saved;
  }
  return { codes: [...DEFAULT_KEYS], labels: [...DEFAULT_KEY_LABELS] };
}

function saveKeySettings(codes, labels) {
  storageSet(STORAGE_KEYS.KEYS, { codes, labels });
}

/* ---------- Difficulty ---------- */
function loadDifficulty() {
  const saved = storageGet(STORAGE_KEYS.DIFFICULTY, 1);
  const level = Number(saved);
  if (level >= 1 && level <= 4) return level;
  return 1;
}

function saveDifficulty(level) {
  storageSet(STORAGE_KEYS.DIFFICULTY, level);
}

/* ---------- Reduce Motion ---------- */
function loadReduceMotion() {
  return Boolean(storageGet(STORAGE_KEYS.REDUCE_MOTION, false));
}

function saveReduceMotion(value) {
  storageSet(STORAGE_KEYS.REDUCE_MOTION, value);
}

/* ---------- Mode (기록 모드 / 목표 모드) ---------- */
function loadMode() {
  const saved = storageGet(STORAGE_KEYS.MODE, DEFAULT_MODE);
  return saved === "GOAL" ? "GOAL" : "RECORD";
}

function saveMode(mode) {
  storageSet(STORAGE_KEYS.MODE, mode === "GOAL" ? "GOAL" : "RECORD");
}

/* ---------- Target Score (목표 모드 전용) ---------- */
function loadTargetScore() {
  const saved = Number(storageGet(STORAGE_KEYS.TARGET_SCORE, DEFAULT_TARGET_SCORE));
  if (Number.isFinite(saved) && saved >= MIN_TARGET_SCORE && saved <= MAX_TARGET_SCORE) {
    return Math.floor(saved);
  }
  return DEFAULT_TARGET_SCORE;
}

function saveTargetScore(value) {
  const clamped = Math.min(MAX_TARGET_SCORE, Math.max(MIN_TARGET_SCORE, Math.floor(Number(value) || DEFAULT_TARGET_SCORE)));
  storageSet(STORAGE_KEYS.TARGET_SCORE, clamped);
}

/* ---------- Rankings ---------- */
// 저장 형태: { "1": [score, score, ...], "2": [...], "3": [...], "4": [...] }
function loadRankings() {
  const saved = storageGet(STORAGE_KEYS.RANKINGS, null);
  const result = { 1: [], 2: [], 3: [], 4: [] };
  if (saved && typeof saved === "object") {
    for (const level of [1, 2, 3, 4]) {
      const list = saved[level];
      if (Array.isArray(list)) {
        result[level] = list.filter((n) => typeof n === "number");
      }
    }
  }
  return result;
}

function saveRankings(rankings) {
  storageSet(STORAGE_KEYS.RANKINGS, rankings);
}
