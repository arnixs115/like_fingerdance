# Finger Shift

30초 동안 랜덤하게 제시되는 키보드 패턴(A/S/D/F)을 정확히 맞춰 최대한 많이 성공시키는
브라우저 키보드 미니게임입니다. 프레임워크 없이 순수 HTML/CSS/JS로 작성했습니다.

## 실행 방법

- 로컬: `index.html` 파일을 더블클릭해서 브라우저로 열면 바로 실행됩니다. 별도 서버가 필요 없습니다.
- GitHub Pages 배포: 이 폴더 전체를 저장소 루트(또는 `docs/` 폴더)에 올린 뒤,
  Settings → Pages에서 배포 브랜치/폴더를 지정하면 됩니다. 추가 빌드 과정이 없습니다.

## 파일 구조

```
index.html          모든 화면(HOME/SETTINGS/RANKING/READY/PLAYING/PAUSED/RESULT) 마크업
style.css           전체 스타일 (반응형 포함)
js/storage.js        LocalStorage 읽기/쓰기 (Key Settings, Difficulty, Ranking, Reduce Motion)
js/state.js           전역 게임 상태(gameState) 정의 및 화면 전환(setScreen)
js/patterns.js        난이도별 랜덤 키 패턴 생성 (직전 패턴 중복 방지 포함)
js/ranking.js          난이도별 TOP 10 랭킹 계산/저장
js/timer.js            READY 3초 카운트다운 + PLAYING 30초 타이머
js/input.js             키보드 입력 처리(keydown/keyup), 설정 화면 키 리매핑, 창 포커스 이탈 처리
js/render.js            gameState를 DOM에 반영하는 렌더링 함수 모음
js/main.js              앱 초기화, 버튼 이벤트 연결, 게임 흐름(시작/재개/일시정지/종료) 제어
```

## 핵심 게임 로직

- **상태 관리**: `gameState.screen`이 HOME/SETTINGS/RANKING/READY/PLAYING/PAUSED/RESULT
  중 하나를 가지며, `setScreen()`을 호출할 때마다 `render.js`가 해당 화면만 보여주고 내용을 채웁니다.
- **패턴 성공 판정**: `pressedKeys`(현재 누르고 있는 키의 인덱스 Set)와 `targetPattern`(목표 인덱스 배열)을
  집합으로 비교합니다(`patternsMatch`). 정확히 일치할 때만 Score +1, 그 외에는 실패 처리 없이 입력 상태만 갱신됩니다.
- **패턴 생성**: 난이도(1~4)에 따라 1~난이도 개수 중 랜덤하게 키 개수를 정하고, A/S/D/F 중 그만큼을
  중복 없이 랜덤 선택합니다. 직전 패턴과 완전히 같으면 다시 생성합니다.
- **타이머**: READY는 `setInterval`로 1초 단위 카운트다운(3→2→1→GO!), PLAYING은
  `requestAnimationFrame`으로 실제 경과 시간을 측정해 0.1초 단위로 표시합니다.
- **PAUSE/RESUME**: PAUSE 시 타이머만 멈추고 Score/Time/Pattern은 그대로 유지합니다.
  RESUME을 누르면 곧바로 재개하지 않고 다시 3초 READY를 거친 뒤, 유지된 상태로 PLAYING을 재개합니다.
- **포커스 이탈 대응**: 창이 `blur`되면 눌려 있던 키 입력을 모두 초기화하고,
  PLAYING 중이었다면 자동으로 PAUSED 상태로 전환해 입력이 꼬이지 않게 합니다.
- **영속 데이터**: Key Settings, Difficulty, Ranking(난이도별 TOP 10)은 LocalStorage에 저장되어
  새 게임/재접속 후에도 유지됩니다. Score/Time/Pattern은 매 게임 시작 시 항상 초기화됩니다.

## 주의할 점 / 알려진 제약

- 랭킹 동점 처리: 동점자가 여러 명이면 RESULT 화면의 순위는 정렬된 배열에서 해당 점수가
  처음 등장하는 위치를 기준으로 계산합니다(즉, 동점이면 방금 넣은 기록이 가장 앞쪽 순위로 표시될 수 있음).
- 키 리매핑은 `KeyboardEvent.code`(물리적 키 위치) 기준으로 저장합니다. 즉, 키보드 레이아웃이
  달라도(QWERTY/기타) 같은 물리적 키 위치를 사용합니다.
- Reduce Motion 옵션을 켜면 성공 이펙트가 페이드 애니메이션 없이 짧게 텍스트만 표시되고 사라집니다.
- 로직은 Node.js + jsdom 기반의 자체 테스트 스크립트로 주요 흐름(시작/성공/부분입력/일시정지/재개/
  시간종료/랭킹저장/재시작/키설정 저장·복원/포커스 이탈)을 검증했습니다.
