/* ==========================================================
   main.js
   앱 초기화 + 화면 전환/버튼 이벤트 연결(게임 흐름 제어)을 담당합니다.
   ========================================================== */

/**
 * 새 게임을 시작합니다. (START 또는 PLAY AGAIN에서 호출)
 * Score, Time, Pattern, 입력 상태를 초기화하고 READY → PLAYING으로 진행합니다.
 * Key Settings / Difficulty / Ranking은 건드리지 않습니다.
 */
function startNewGame() {
  gameState.score = 0;
  gameState.timeLeft = GAME_DURATION;
  gameState.pressedKeys.clear();
  gameState.prevPattern = null;
  gameState.targetPattern = generatePattern(gameState.difficulty, null);
  gameState.resultRank = null;

  startReadyCountdown(() => {
    setScreen(SCREENS.PLAYING);
    startPlayTimer();
  });
}

/**
 * PAUSED 상태에서 RESUME을 누르면 호출됩니다.
 * Score/Time/Pattern은 그대로 유지한 채, 3초 READY를 다시 거친 뒤 PLAYING을 재개합니다.
 */
function resumeGameAfterReady() {
  startReadyCountdown(() => {
    setScreen(SCREENS.PLAYING);
    startPlayTimer();
  });
}

/**
 * 30초가 종료되었을 때 timer.js에서 호출합니다.
 */
function onGameTimeUp() {
  const rank = addScoreToRanking(gameState.difficulty, gameState.score);
  gameState.resultRank = rank;
  setScreen(SCREENS.RESULT);
}

function goHome() {
  stopReadyCountdown();
  stopPlayTimer();
  gameState.pressedKeys.clear();
  setScreen(SCREENS.HOME);
}

function setupUIEvents() {
  // ---------- HOME ----------
  document.getElementById("btn-start").addEventListener("click", startNewGame);

  document.getElementById("select-difficulty").addEventListener("change", (e) => {
    const level = Number(e.target.value);
    gameState.difficulty = level;
    saveDifficulty(level);
  });

  document.getElementById("checkbox-reduce-motion").addEventListener("change", (e) => {
    gameState.reduceMotion = e.target.checked;
    saveReduceMotion(gameState.reduceMotion);
  });

  document.getElementById("btn-goto-settings").addEventListener("click", () => {
    initKeySettingsDraft();
    setScreen(SCREENS.SETTINGS);
  });

  document.getElementById("btn-goto-ranking").addEventListener("click", () => {
    gameState.rankingSelectedLevel = gameState.difficulty;
    setScreen(SCREENS.RANKING);
  });

  // ---------- SETTINGS ----------
  for (let i = 0; i < 4; i++) {
    document.getElementById(`key-btn-${i}`).addEventListener("click", () => {
      beginListeningForKey(i);
    });
  }

  document.getElementById("btn-reset-keys").addEventListener("click", resetDraftKeysToDefault);
  document.getElementById("btn-save-keys").addEventListener("click", saveDraftKeys);
  document.getElementById("btn-settings-back").addEventListener("click", () => {
    setScreen(SCREENS.HOME);
  });

  // ---------- RANKING ----------
  document.querySelectorAll(".ranking-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      gameState.rankingSelectedLevel = Number(tab.dataset.level);
      renderRanking();
    });
  });

  document.getElementById("btn-ranking-back").addEventListener("click", () => {
    setScreen(SCREENS.HOME);
  });

  // ---------- PLAYING ----------
  document.getElementById("btn-pause").addEventListener("click", () => {
    if (gameState.screen !== SCREENS.PLAYING) return;
    stopPlayTimer();
    gameState.pressedKeys.clear();
    setScreen(SCREENS.PAUSED);
  });

  // ---------- PAUSED ----------
  document.getElementById("btn-resume").addEventListener("click", resumeGameAfterReady);
  document.getElementById("btn-paused-home").addEventListener("click", goHome);

  // ---------- RESULT ----------
  document.getElementById("btn-play-again").addEventListener("click", startNewGame);
  document.getElementById("btn-result-home").addEventListener("click", goHome);
}

function initApp() {
  initStateFromStorage();
  setupInputListeners();
  setupUIEvents();
  setScreen(SCREENS.HOME);
}

document.addEventListener("DOMContentLoaded", initApp);
