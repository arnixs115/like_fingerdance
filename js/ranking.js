/* ==========================================================
   ranking.js
   난이도별 랭킹(TOP 10) 관리를 담당합니다.
   ========================================================== */

const RANKING_MAX_ENTRIES = 10;

/**
 * 특정 난이도의 랭킹에 점수를 추가하고, 정렬 후 TOP 10만 유지합니다.
 * 저장까지 완료한 뒤, 방금 넣은 점수의 순위(1부터 시작)를 반환합니다.
 */
function addScoreToRanking(level, score) {
  const list = gameState.rankings[level] ? gameState.rankings[level].slice() : [];
  list.push(score);
  list.sort((a, b) => b - a);

  const trimmed = list.slice(0, RANKING_MAX_ENTRIES);
  gameState.rankings[level] = trimmed;
  saveRankings(gameState.rankings);

  // 방금 넣은 점수의 순위를 계산 (동점이면 가장 먼저 등장하는 자리를 기준으로 함)
  const rankIndex = trimmed.findIndex((s) => s === score);
  return rankIndex === -1 ? null : rankIndex + 1;
}

function getRankingForLevel(level) {
  return gameState.rankings[level] || [];
}
