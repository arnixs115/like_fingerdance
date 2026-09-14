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
  gameState.resultOutcome = null;
  gameState.goalSaveDecision = null;

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
 * - 기록 모드: 도달한 Score를 자동으로 해당 난이도 랭킹에 저장합니다.
 * - 목표 모드: 목표 점수 도달 여부로 성공/실패를 정하고, 저장 여부는
 *   RESULT 화면에서 사용자가 '저장'/'패스'로 직접 선택합니다.
 */
function onGameTimeUp() {
  if (gameState.mode === "GOAL") {
    gameState.resultOutcome = gameState.score >= gameState.targetScore ? "SUCCESS" : "FAIL";
    gameState.resultRank = null;
    gameState.goalSaveDecision = null;
    setScreen(SCREENS.RESULT);
    return;
  }

  const rank = addScoreToRanking(gameState.difficulty, gameState.score);
  gameState.resultRank = rank;
  gameState.resultOutcome = "RECORDED";
  setScreen(SCREENS.RESULT);
}

/**
 * 목표 모드에서 30초가 다 되기 전에 목표 점수에 도달했을 때 input.js에서 호출합니다.
 * 시간이 남아 있어도 즉시 성공으로 게임을 종료합니다.
 */
function finishGoalSuccessEarly() {
  stopPlayTimer();
  gameState.resultOutcome = "SUCCESS";
  gameState.resultRank = null;
  gameState.goalSaveDecision = null;
  setScreen(SCREENS.RESULT);
}

/**
 * 목표 모드 RESULT 화면에서 '저장'을 눌렀을 때 호출합니다.
 * 기록 모드와 동일한 난이도별 랭킹에 이번 판 Score를 추가합니다.
 */
function saveGoalRecord() {
  if (gameState.goalSaveDecision !== null) return; // 이미 결정한 경우 중복 저장 방지
  const rank = addScoreToRanking(gameState.difficulty, gameState.score);
  gameState.resultRank = rank;
  gameState.goalSaveDecision = "SAVED";
  renderResult();
}

/**
 * 목표 모드 RESULT 화면에서 '패스'를 눌렀을 때 호출합니다. 랭킹에 저장하지 않습니다.
 */
function passGoalRecord() {
  if (gameState.goalSaveDecision !== null) return;
  gameState.goalSaveDecision = "PASSED";
  renderResult();
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

  document.getElementById("select-mode").addEventListener("change", (e) => {
    gameState.mode = e.target.value === "GOAL" ? "GOAL" : "RECORD";
    saveMode(gameState.mode);
    renderHome(); // 목표 점수 입력칸 표시 여부를 갱신
  });

  document.getElementById("input-target-score").addEventListener("change", (e) => {
    let value = Math.floor(Number(e.target.value));
    if (!Number.isFinite(value) || value < 1) value = 1;
    if (value > 99) value = 99;
    gameState.targetScore = value;
    saveTargetScore(value);
    e.target.value = value;
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
  document.getElementById("btn-save-record").addEventListener("click", saveGoalRecord);
  document.getElementById("btn-pass-record").addEventListener("click", passGoalRecord);
}

function initApp() {
  initStateFromStorage();
  setupInputListeners();
  setupUIEvents();
  setScreen(SCREENS.HOME);
}

document.addEventListener("DOMContentLoaded", initApp);
