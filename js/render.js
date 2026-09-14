/* ==========================================================
   render.js
   gameState를 읽어 화면(DOM)에 반영하는 역할만 담당합니다.
   ========================================================== */

const screenElements = {
  [SCREENS.HOME]: document.getElementById("screen-home"),
  [SCREENS.SETTINGS]: document.getElementById("screen-settings"),
  [SCREENS.RANKING]: document.getElementById("screen-ranking"),
  [SCREENS.READY]: document.getElementById("screen-ready"),
  [SCREENS.PLAYING]: document.getElementById("screen-playing"),
  [SCREENS.PAUSED]: document.getElementById("screen-paused"),
  [SCREENS.RESULT]: document.getElementById("screen-result"),
};

/**
 * 현재 gameState.screen에 맞는 화면만 보여주고, 해당 화면의 내용을 채웁니다.
 */
function renderScreen() {
  for (const key in screenElements) {
    screenElements[key].classList.toggle("screen--active", key === gameState.screen);
  }

  switch (gameState.screen) {
    case SCREENS.HOME:
      renderHome();
      break;
    case SCREENS.SETTINGS:
      renderSettings();
      break;
    case SCREENS.RANKING:
      renderRanking();
      break;
    case SCREENS.READY:
      renderReady();
      break;
    case SCREENS.PLAYING:
      renderPlayingStats();
      renderPlayingKeys();
      break;
    case SCREENS.PAUSED:
      renderPaused();
      break;
    case SCREENS.RESULT:
      renderResult();
      break;
  }
}

/* ---------- HOME ---------- */
function renderHome() {
  document.getElementById("select-difficulty").value = String(gameState.difficulty);
  document.getElementById("checkbox-reduce-motion").checked = gameState.reduceMotion;
}

/* ---------- SETTINGS ---------- */
function renderSettings() {
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`key-btn-${i}`);
    const isListening = gameState.listeningForKeyIndex === i;
    btn.textContent = isListening ? "Press a key..." : gameState.draftKeyLabels[i];
    btn.classList.toggle("is-listening", isListening);
  }

  const msgEl = document.getElementById("settings-message");
  const msg = gameState.settingsMessage || { text: "", isSuccess: false };
  msgEl.textContent = msg.text;
  msgEl.classList.toggle("is-success", msg.isSuccess);
}

/* ---------- RANKING ---------- */
function renderRanking() {
  const tabs = document.querySelectorAll(".ranking-tab");
  tabs.forEach((tab) => {
    const level = Number(tab.dataset.level);
    tab.classList.toggle("is-active", level === gameState.rankingSelectedLevel);
  });

  const list = getRankingForLevel(gameState.rankingSelectedLevel);
  const listEl = document.getElementById("ranking-list");
  listEl.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("li");
    empty.className = "ranking-empty";
    empty.textContent = "아직 기록이 없습니다.";
    empty.style.listStyle = "none";
    listEl.appendChild(empty);
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];

  list.forEach((score, i) => {
    const item = document.createElement("li");

    const rankLabel = document.createElement("span");
    rankLabel.className = "rank-medal";
    rankLabel.textContent = medals[i] || `${i + 1}.`;

    const scoreLabel = document.createElement("span");
    scoreLabel.textContent = score;

    item.appendChild(rankLabel);
    item.appendChild(scoreLabel);
    listEl.appendChild(item);
  });
}

/* ---------- READY ---------- */
function renderReady() {
  const el = document.getElementById("ready-count");
  el.textContent = gameState.readyCount > 0 ? String(gameState.readyCount) : "GO!";
}

/* ---------- PLAYING ---------- */
function renderPlayingStats() {
  document.getElementById("stat-time").textContent = gameState.timeLeft.toFixed(1);
  document.getElementById("stat-score").textContent = String(gameState.score);
}

function renderPlayingKeys() {
  renderKeyDisplay("target-keys", gameState.targetPattern);
  renderKeyDisplay("input-keys", Array.from(gameState.pressedKeys));
}

function renderKeyDisplay(containerId, activeIndices) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const chip = document.createElement("div");
    chip.className = "key-chip" + (activeIndices.includes(i) ? " is-active" : "");
    chip.textContent = gameState.keyLabels[i];
    container.appendChild(chip);
  }
}

let matchEffectTimeoutId = null;

function showMatchEffect() {
  const el = document.getElementById("match-effect");

  if (gameState.reduceMotion) {
    // Reduce Motion: 애니메이션 없이 짧게 텍스트만 표시 후 바로 제거
    el.textContent = "Score +1";
    el.classList.remove("is-visible");
    el.classList.add("is-static");
    clearTimeout(matchEffectTimeoutId);
    matchEffectTimeoutId = setTimeout(() => {
      el.classList.remove("is-static");
      el.textContent = "";
    }, 400);
    return;
  }

  el.textContent = "Pattern Match! +1";
  el.classList.remove("is-visible");
  // 강제 리플로우로 애니메이션을 다시 트리거
  void el.offsetWidth;
  el.classList.add("is-visible");

  clearTimeout(matchEffectTimeoutId);
  matchEffectTimeoutId = setTimeout(() => {
    el.classList.remove("is-visible");
    el.textContent = "";
  }, 600);
}

/* ---------- PAUSED ---------- */
function renderPaused() {
  document.getElementById("paused-time").textContent = gameState.timeLeft.toFixed(1);
  document.getElementById("paused-score").textContent = String(gameState.score);
}

/* ---------- RESULT ---------- */
function renderResult() {
  document.getElementById("result-score").textContent = String(gameState.score);
  document.getElementById("result-level").textContent = `LEVEL ${gameState.difficulty}`;
  document.getElementById("result-rank").textContent = gameState.resultRank
    ? `RANK #${gameState.resultRank}`
    : "RANK -";
}
