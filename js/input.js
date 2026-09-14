/* ==========================================================
   input.js
   1) PLAYING 상태의 키 입력(keydown/keyup) 처리
   2) SETTINGS 화면의 키 재설정(리매핑) 처리
   3) 창 포커스 이탈 시 입력 상태 초기화
   ========================================================== */

/* ---------- SETTINGS 화면용 임시(draft) 키 설정 ---------- */
// SAVE를 누르기 전까지는 draft 값만 변경하고, gameState.keyCodes/keyLabels(실제 저장값)는 건드리지 않습니다.
function initKeySettingsDraft() {
  gameState.draftKeyCodes = gameState.keyCodes.slice();
  gameState.draftKeyLabels = gameState.keyLabels.slice();
  gameState.listeningForKeyIndex = null;
  clearSettingsMessage();
}

function clearSettingsMessage() {
  gameState.settingsMessage = { text: "", isSuccess: false };
}

function setSettingsMessage(text, isSuccess) {
  gameState.settingsMessage = { text, isSuccess: Boolean(isSuccess) };
}

function beginListeningForKey(index) {
  gameState.listeningForKeyIndex = index;
  clearSettingsMessage();
  renderScreen();
}

/**
 * 리매핑 중 새 키를 받아 draft에 반영합니다.
 * 다른 3개 키와 중복되면 안내 메시지를 띄우고 반영하지 않습니다.
 */
function assignDraftKey(index, code, label) {
  const isDuplicate = gameState.draftKeyCodes.some(
    (existingCode, i) => i !== index && existingCode === code
  );

  if (isDuplicate) {
    setSettingsMessage(`이미 사용 중인 키입니다: ${label}`, false);
    gameState.listeningForKeyIndex = null;
    renderScreen();
    return;
  }

  gameState.draftKeyCodes[index] = code;
  gameState.draftKeyLabels[index] = label;
  gameState.listeningForKeyIndex = null;
  clearSettingsMessage();
  renderScreen();
}

function resetDraftKeysToDefault() {
  gameState.draftKeyCodes = DEFAULT_KEYS.slice();
  gameState.draftKeyLabels = DEFAULT_KEY_LABELS.slice();
  gameState.listeningForKeyIndex = null;
  setSettingsMessage("기본값(ASDF)으로 되돌렸습니다. SAVE를 눌러 저장하세요.", true);
  renderScreen();
}

function saveDraftKeys() {
  gameState.keyCodes = gameState.draftKeyCodes.slice();
  gameState.keyLabels = gameState.draftKeyLabels.slice();
  saveKeySettings(gameState.keyCodes, gameState.keyLabels);
  setSettingsMessage("저장되었습니다.", true);
  renderScreen();
}

/* ---------- 게임 플레이 키 입력 ---------- */

/**
 * 현재 눌려 있는 키(pressedKeys)와 목표 패턴이 정확히 일치하는지 확인합니다.
 */
function patternsMatch(pressedSet, targetPattern) {
  if (pressedSet.size !== targetPattern.length) return false;
  return targetPattern.every((idx) => pressedSet.has(idx));
}

/**
 * 입력 상태가 바뀔 때마다 호출됩니다.
 * 목표 패턴과 정확히 일치하면 성공 처리를 합니다.
 */
function onInputChanged() {
  renderPlayingKeys();

  if (patternsMatch(gameState.pressedKeys, gameState.targetPattern)) {
    handlePatternSuccess();
  }
}

function handlePatternSuccess() {
  gameState.score += 1;

  const newPattern = generatePattern(gameState.difficulty, gameState.targetPattern);
  gameState.prevPattern = gameState.targetPattern;
  gameState.targetPattern = newPattern;

  renderPlayingStats();
  renderPlayingKeys();
  showMatchEffect();
}

function handleGameKeyDown(e) {
  if (gameState.screen !== SCREENS.PLAYING) return;
  if (e.repeat) return; // 키 반복 입력(auto-repeat)은 무시

  const idx = gameState.keyCodes.indexOf(e.code);
  if (idx === -1) return;

  e.preventDefault();

  if (!gameState.pressedKeys.has(idx)) {
    gameState.pressedKeys.add(idx);
    onInputChanged();
  }
}

function handleGameKeyUp(e) {
  if (gameState.screen !== SCREENS.PLAYING) return;

  const idx = gameState.keyCodes.indexOf(e.code);
  if (idx === -1) return;

  e.preventDefault();

  if (gameState.pressedKeys.has(idx)) {
    gameState.pressedKeys.delete(idx);
    onInputChanged();
  }
}

/* ---------- 전역 키보드 이벤트 등록 ---------- */

function setupInputListeners() {
  document.addEventListener("keydown", (e) => {
    // SETTINGS 화면에서 키 리매핑을 기다리는 중이면 그 입력을 우선 처리
    if (gameState.screen === SCREENS.SETTINGS && gameState.listeningForKeyIndex !== null) {
      e.preventDefault();
      assignDraftKey(gameState.listeningForKeyIndex, e.code, formatKeyLabel(e));
      return;
    }

    handleGameKeyDown(e);
  });

  document.addEventListener("keyup", (e) => {
    handleGameKeyUp(e);
  });

  // 창이 포커스를 잃으면 입력 상태를 안전하게 초기화합니다.
  // PLAYING 중이었다면 자동으로 PAUSED 상태로 전환합니다.
  window.addEventListener("blur", () => {
    gameState.pressedKeys.clear();

    if (gameState.screen === SCREENS.PLAYING) {
      stopPlayTimer();
      setScreen(SCREENS.PAUSED);
    }
  });
}

/**
 * KeyboardEvent로부터 사람이 읽기 쉬운 라벨(예: "A", "Space", "Enter")을 만듭니다.
 */
function formatKeyLabel(e) {
  if (e.code.startsWith("Key")) return e.code.slice(3);
  if (e.code.startsWith("Digit")) return e.code.slice(5);
  const specialLabels = {
    Space: "Space",
    Enter: "Enter",
    Escape: "Esc",
    ShiftLeft: "Shift",
    ShiftRight: "Shift",
    ControlLeft: "Ctrl",
    ControlRight: "Ctrl",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
  };
  return specialLabels[e.code] || e.code;
}
