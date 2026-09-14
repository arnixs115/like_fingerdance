/* ==========================================================
   timer.js
   READY 3초 카운트다운과 PLAYING 30초 타이머를 담당합니다.
   ========================================================== */

let readyIntervalId = null;
let playRafId = null;
let playLastTimestamp = null;

/**
 * READY 상태의 3 → 2 → 1 → GO! 카운트다운을 시작합니다.
 * 완료되면 onComplete 콜백을 호출합니다 (PLAYING으로 전환하는 역할).
 */
function startReadyCountdown(onComplete) {
  stopReadyCountdown();

  gameState.readyCount = READY_DURATION;
  setScreen(SCREENS.READY);

  readyIntervalId = setInterval(() => {
    gameState.readyCount -= 1;

    if (gameState.readyCount > 0) {
      renderScreen();
      return;
    }

    if (gameState.readyCount === 0) {
      // "GO!" 표시
      renderScreen();
      return;
    }

    // readyCount가 -1이 되는 시점 = GO! 표시가 끝난 시점
    stopReadyCountdown();
    onComplete();
  }, 1000);
}

function stopReadyCountdown() {
  if (readyIntervalId !== null) {
    clearInterval(readyIntervalId);
    readyIntervalId = null;
  }
}

/**
 * PLAYING 상태의 카운트다운을 시작(또는 재개)합니다.
 * requestAnimationFrame으로 실제 경과 시간을 측정하여 timeLeft를 0.1초 단위로 갱신합니다.
 */
function startPlayTimer() {
  stopPlayTimer();
  playLastTimestamp = null;

  function tick(timestamp) {
    if (playLastTimestamp === null) {
      playLastTimestamp = timestamp;
    }
    const deltaSeconds = (timestamp - playLastTimestamp) / 1000;
    playLastTimestamp = timestamp;

    gameState.timeLeft = Math.max(0, gameState.timeLeft - deltaSeconds);
    renderPlayingStats();

    if (gameState.timeLeft <= 0) {
      stopPlayTimer();
      onGameTimeUp();
      return;
    }

    playRafId = requestAnimationFrame(tick);
  }

  playRafId = requestAnimationFrame(tick);
}

function stopPlayTimer() {
  if (playRafId !== null) {
    cancelAnimationFrame(playRafId);
    playRafId = null;
  }
  playLastTimestamp = null;
}
