# 검증 및 한계 기록

검사 작업 디렉터리: `/workspace/Fire-Protection-Equipment-Engineer-Electrical--CBT`. 2026-10-24 수행.

| 항목 | 결과와 근거 |
| --- | --- |
| 최신 스킬 | main `76b990b8720adfa85c22a0a8f699b17094aa357b`의 v1.4.0 및 references 전부 읽음. 전체 폴더의 경로 집합·파일 바이트 일치 검증 통과 |
| 원본 앱 | 고정 `b9a682ccff1b460334b78d5bfad9375b7ec4fbb6` archive 재사용. 원본 MIT 고지 유지. 원본 원격 변경·배포 없음 |
| 최초 저장소 | README만 존재, AGENTS 없음, git status clean. 초기 커밋 e2153b5b0c7a8161101f6742df673560772931e5 |
| npm ci | lockfile 기반 설치 성공, 종료 0. TLS·서명 우회 없음 |
| npm run check | 최종 단위 검사 822개 통과(기존 기능18 + 확장 검증804, 이 중 계산별800), TypeScript 및 Vite build 성공, 종료 0 |
| Playwright 전체 | `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`: 최종 29 passed, 1 skipped, 종료 0. 데스크톱 터치 검사만 해당 없음으로 skip, 모바일 터치 검사는 통과 |
| 두 모드 Space | 실제 keyboard.press의 keydown/keyup으로 확인. 미응답·Shift·반복 이벤트·입력 요소·북마크 네이티브 Space·대화상자 보호·실전 마지막 문제 자동 제출 방지 포함 |
| 실전 | 80개 번호, 과목별 12개 정답 총 48개 제출/합격·32개 오답·전체 해설·오답 필터/복습·답안 수정/새로고침·7200초 만료/재접속·중복 제출 방지 |
| 과락 | 과목별 정답 [12,12,12,12] 합격, [7,13,14,14] 총48이어도 과락, [8,12,13,14] 총47 불합격, [8,12,14,14] 총48 합격. 47/80 표시58.8을 반올림 합격으로 처리하지 않음 |
| 랜덤/기록 | 즉시 채점 한번, 순회 중 중복 방지, 정답 복습 시 오답 제거, 북마크, 통계, 이어하기 |
| 문제은행 | 1000개 표시·800변형/20유형 안내·부족0·마지막 신규 문항 검색·JSON1000개 실제 다운로드 내용 대조·신규 문항 정답 클릭/Space 검증. JSON/CSV·중복·로컬 검수 승인·오류 행 전체 거부·검색·페이지·초기화. CSV/JSON 양식 대상 과목·출처·자료 ID로 갱신 |
| 저장 오류 | 손상 원본 보존·QuotaExceededError 경고. 백업 내보내기 실제 download 이벤트, 초기화 확인/취소 및 기본 은행 유지 |
| 메뉴 실제 휠 | 390×480 / 740×360 / 390×480 글자 확대. mouse.wheel 아래/위 입력으로 scrollTop 변화 관측, 하단 버튼 viewport·백업 클릭·초기화 취소·상단 대시보드 클릭 |
| 메뉴 실제 터치 | Pixel 7 Chromium 에뮬레이션 CDP Input.dispatchTouchEvent의 touchStart/move/end. 작은 세로·가로 모두 하단 초기화 tap과 상단 대시보드 tap 성공. scrollTop을 코드로 설정하지 않음 |
| 시각 확인 | Chromium 1440×1000 PC / 390×844 모바일 대시보드 캡처 검토, 가로 넘침 없음. 학습 기준 메뉴와 상단 criteria-note 제거 확인. 브라우저 흐름에서 실전·랜덤·결과·은행·통계 조작 |
| 개발 서버 | Vite dev 5173 기동과 해당 base 경로 HTTP 응답·자격증 title 확인. 프로덕션 preview는 브라우저 검증에 사용 |
| 번들 | 데이터 포함 JS 1,825.23 kB, gzip274.19 kB. Vite의 500kB 초과 경고가 있으나 빌드 성공이며 경고를 숨기지 않음. 정적 은행 동기 로드 구조 유지 |
| 기존80 보존 | 새 JSON의 앞80개가 기존 커밋 JSON과 전 속성 동일. 정규 직렬화 SHA256을 회귀 테스트로 고정. 과거 기록의 ID 참조 유지 |
| 은행 재현 | author_bank.py 재실행 전후 SHA256 동일: 0e85958359d756b8860ff35658d1415d50f8961726259e72bc5f8fe730663817 |
| 수량 | 기본 JSON 내부 검토1000. 원론300/전기일반340/법규20/시설340. 개념200 + 숫자변형800(20family×40조건). 원문기출0/복원0/자체1000, pending0, 부족0. 법규20은 일반 독해 연습 |
| 중복 | ID 및 NFKC 본문+정렬보기 fingerprint 고유1000. 숫자 조건 변형은 family로 명시. 의미·학습 목표의 인접성은 존재, 외부 독립 의미 검수 미실행. 1000개 독립 유형을 의미하지 않음 |
| 검수 한계 | AI 일반 지식 기반 자체 작성과 내부 문장·답안 대조. 외부 전문가0, 공식 출제기준 대조0. Python Decimal 생성과 별도 TypeScript 계산으로 800개 수치·단위·정답/동치보기·반올림·해설/입력 표기를 검증. 현행 법령 수치 문제는 만들지 않음 |
| 공식 자료 | Q-Net 종목 안내 후보 조회 curl 종료56, CONNECT proxy403. 본문 및 이용 조건 확보 불가. 공식 시험 규칙 확인은 pending, 외부 기출 재배포 허용 확인0 |
| 배포 첫 차단 | GitHub API 저장소 metadata GET의 CONNECT proxy403, curl56/HTTP000. API 접근 재시도 없음. GitHub 권한/Pages Source/Actions 상태 조회 미실행 |
| CI/Pages | main push·workflow 실행을 시작하지 않음. 배포 성공/기존 게시 여부/공개 화면 확인 모두 미확인. 비배포 보존 브랜치만 원격 반영 |
| 실기기 등 | 실기기, Safari/Firefox, 블로그 iframe 내부 직접 검증, fresh cloud snapshot 복원은 미실행 |

로컬 개발 중 초기 타입 검사 오류(원본 테스트의 옛 자료 ID/문항 수)와 일시적인 preview 포트 중복은 수정·종료 상태 확인 후 검증했습니다. 이를 원격 배포 실패나 배포 재시도로 세지 않습니다. 최종 코드 검사 결과만 위에 통과로 기록했습니다. 배포 사전 차단 후 추가 배포 시도는 없습니다.

이번 1000문항 확장은 이전 사전 차단 이후의 배포 재시도 요청이 아니다. main·Actions·Pages는 건드리지 않고 기존 codex/fire-cbt-standard에만 원격 반영한다. 초기 80문항 상태를 최신 수량으로 오인하지 않도록 README·문제은행 화면·본 문서를 함께 갱신했다. 상세 원고 검토 및 유형별 수량은 [bank-audit.md](bank-audit.md)에 기록했다.
