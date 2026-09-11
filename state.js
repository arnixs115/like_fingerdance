/* ==========================================================
   state.js
   게임 전체 상태를 한 곳에서 관리합니다.
   다른 파일들은 이 gameState 객체를 읽고 수정합니다.
   ========================================================== */

// 화면(게임 상태) 목록
const SCREENS = {
  HOME: "HOME",
  SETTINGS: "SETTINGS",
  RANKING: "RANKING",
  READY: "READY",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  RESULT: "RESULT",
};

const GAME_DURATION = 30; // 전체 게임 시간(초)
const READY_DURATION = 3; // READY 상태 시간(초)

const gameState = {
  screen: SCREENS.HOME,

  // 설정 (LocalStorage와 동기화됨)
  keyCodes: DEFAULT_KEYS.slice(),   // 예: ["KeyA","KeyS","KeyD","KeyF"]
  keyLabels: DEFAULT_KEY_LABELS.slice(), // 예: ["A","S","D","F"]
  difficulty: 1,
  reduceMotion: false,

  // 진행 중인 게임 데이터
  score: 0,
  timeLeft: GAME_DURATION,
  targetPattern: [],     // 예: [0, 2] -> KEY1, KEY3을 눌러야 함 (인덱스 배열)
  prevPattern: null,     // 직전 패턴(중복 방지용)
  pressedKeys: new Set(),// 현재 눌려 있는 key index 집합

  // READY 상태 카운트다운
  readyCount: READY_DURATION,

  // 설정 화면에서 "다음 키 입력을 기다리는 중"인 인덱스 (없으면 null)
  listeningForKeyIndex: null,

  // RANKING 화면에서 선택된 레벨
  rankingSelectedLevel: 1,

  // RESULT 화면에 표시할 값
  resultRank: null,

  // 랭킹 데이터 (LocalStorage와 동기화됨)
  rankings: { 1: [], 2: [], 3: [], 4: [] },
};

/**
 * 저장된 설정값들을 불러와 gameState에 반영합니다.
 * 페이지 로드 시 한 번 호출합니다.
 */
function initStateFromStorage() {
  const keySettings = loadKeySettings();
  gameState.keyCodes = keySettings.codes;
  gameState.keyLabels = keySettings.labels;

  gameState.difficulty = loadDifficulty();
  gameState.reduceMotion = loadReduceMotion();
  gameState.rankings = loadRankings();
}

/**
 * 화면을 전환합니다.
 */
function setScreen(screen) {
  gameState.screen = screen;
  renderScreen();
}
