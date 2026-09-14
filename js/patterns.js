/* ==========================================================
   patterns.js
   목표 키 패턴을 랜덤 생성하는 로직을 담당합니다.
   ========================================================== */

/**
 * 두 패턴(인덱스 배열)이 동일한지 비교합니다.
 * 순서는 상관없이, 포함된 키 인덱스 집합이 같으면 동일한 패턴입니다.
 */
function isSamePattern(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, i) => value === sortedB[i]);
}

/**
 * 현재 난이도(difficulty)에 맞는 새로운 랜덤 패턴을 생성합니다.
 * - Level 1: 항상 1개
 * - Level 2: 1~2개 랜덤
 * - Level 3: 1~3개 랜덤
 * - Level 4: 1~4개 랜덤
 *
 * 직전 패턴(prevPattern)과 완전히 동일하면 다시 생성합니다.
 */
function generatePattern(difficulty, prevPattern) {
  let pattern;
  do {
    pattern = generateRandomPatternOnce(difficulty);
  } while (isSamePattern(pattern, prevPattern));
  return pattern;
}

function generateRandomPatternOnce(difficulty) {
  const maxKeys = Math.min(Math.max(difficulty, 1), 4);

  // 1 ~ maxKeys 중 랜덤하게 개수를 선택
  const count = 1 + Math.floor(Math.random() * maxKeys);

  // [0,1,2,3] 중 count개를 중복 없이 랜덤 선택 (셔플 후 앞에서 count개 사용)
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, count).sort();
}
