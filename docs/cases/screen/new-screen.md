# 화면 파일을 작성하는 순서

> 범위: 신규 포탈 화면 | 성격: 지정 참고 화면을 바탕으로 한 작성 기준
>
> 언제 읽나: Admin·User에 새 Thymeleaf 화면 파일을 만들거나 기존 화면의 스크립트 구조를 크게 바꿀 때 | 읽지 않는 경우: 문구·열 한두 개만 고칠 때, 백엔드만 바꿀 때

파일 상단에는 초기화와 함수를, 하단에는 화면 구조를 모아 읽는 순서를 일정하게 유지한다.

## 파일 배치

| 순서 | 내용 |
|---|---|
| 1 | 설명·관련 모듈·작성자·날짜·버전·변경 이력 헤더 |
| 2 | 완성 페이지라면 DOCTYPE·html namespace·`layout:decorate` |
| 3 | 필요한 경우 화면 전용 최소 스타일 |
| 4 | `<script th:inline="javascript">`: 서버 전달값·사전값·화면 상태 선언 |
| 5 | ready 함수: 이벤트 등록과 최초 목록 생성 |
| 6 | 기능별 함수: 목록 생성 → 검색 데이터 → 상세·저장 등 동작 → 보조 함수 |
| 7 | body의 `layout:fragment="content"`: 검색·버튼·표 또는 팝업 내용 |

- 조회 조각은 완성 페이지 껍데기 대신 `layout:fragment="template"`을 사용한다. [조각 규칙](lookup-fragment.md) 참고.
- ready에는 시작 순서만 보이게 하고 긴 API·검증 로직은 이름 있는 함수로 분리한다.
- 변경되지 않는 값은 `const`, 재할당되는 상태는 `let`으로 선언한다. 기존 `var` 혼용은 필수 규칙이 아니다.
- 전역 상태는 그리드 참조·선택 ID·업로드 결과 등 실제 공유할 값만 둔다. 의미 없는 카운터·미선언 변수는 추가하지 않는다.

## 공통 함수와 데이터

- 서버 목록: `$.fn.dataTable.grid(selector, url, options, searchData)`.
- 클라이언트 미리보기: `$.fn.dataTable.emptyGrid(selector, options)`.
- 일반 요청은 `callAjax`, 저장 확인은 `saveData`, 알림은 `$.alert`, 닫기는 `closePopup`의 해당 모듈 구현을 먼저 확인한다.
- 공통 스크립트가 이미 포함된 레이아웃에 jQuery·DataTables를 다시 넣지 않는다.
- 함수 선택은 [DataTables 유형별 가이드](../table/table-setup.md), 요청·옵션은 [계약](../../reference/datatables-contract.md), 재조회·선택·행 변경은 [조작 가이드](../table/table-row-operations.md)를 따른다.
- 문구·선택값은 [사전 사용법](../display-value/usage.md)을 따른다. 미등록이면 [임시값 바로 아래 실제 코드 주석](../display-value/temporary-value.md) 방식을 사용한다.
- 서버 데이터 표시는 기본적으로 `.text()`를 사용한다. `.html()`은 필요한 고정 마크업과 안전하게 처리한 값에만 사용한다.
- 이벤트는 한 곳에서 한 번 등록한다. 같은 버튼에 ready의 click과 HTML onclick을 중복 연결하지 않는다.
- 검증 실패 시 알림 후 `return`으로 후속 요청을 중단한다. 성공·실패·빈 결과를 나눠 처리한다.

근거: [참고 화면 목록](../../reference/screen-references.md), `admin:src/main/resources/static/js/common.js`, `static/js/datatables/datatables.ex.js`.
- 완료 전: 검색 1회 요청, 빈 결과, 미선택, 오류, 재조회·재열기, 문구·열 순서, 가로 넘침을 확인한다.
- 모듈 적용: [Admin frontend](../../reference/frontend-admin.md)의 위저드·진행 팝업, [User frontend](../../reference/frontend-user.md)의 입력 조각 계약을 함께 확인한다.
