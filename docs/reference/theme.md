# 다크·화이트 테마

> 범위: admin·user 화면 테마 | 상태: 소스 대조 완료, 브라우저 렌더링 미검증 | 근거: 아래 파일

Admin·User 화면은 다크/화이트 테마를 가진다. 테마는 레이아웃이 `body`·`#wrap` 클래스로 바꾸고, 색은 공통 CSS의 `.dark` 규칙이 정한다. 화면 파일은 표준 클래스만 쓰면 두 테마에 맞게 보인다.

## 동작

| 항목 | Admin | User |
|---|---|---|
| 저장 | 쿠키·세션 `admintheme` (path `/admin`, 30일) | 쿠키·세션 `usertheme` (path `/user`) |
| 기본값 | 쿠키가 없으면 `Dark` (`admin:.../service/login/LoginService.java:191-197`) | 쿠키가 없으면 `White` (`user:.../service/login/LoginService.java:206-208`) |
| 변경 | 헤더 `#userTheme` select(코드사전 `Theme`) → `POST /admin/settings/current-theme` → 새로고침 (`layout_admin.html:143-155`, `SettingController.java:84-99`) | `/user/settings/current-theme` (`layout_user.html:281-287`) |
| 적용 | `<body class="dark">` + `#wrap.bg-black`, 화이트는 class 없음 + `#wrap.bg-white` (`layout_admin.html:372-373`) | `<body class="dark">`, 화이트는 class 없음 (`layout_user.html:469`) |
| 팝업·위저드 | `popup_layout*`·`wizard_layout*`·`graph_layout`·`cluster_layout`도 같은 조건으로 `body.dark`를 붙인다 | `popup_layout.html:78` 같은 조건 |
| 색 규칙 | `static/css/style.css`의 `.dark ...` 규칙 약 1,200개(검색·select·버튼·표·페이징·팝업 등), `#wrap.bg-black{background:#2b2b2b}` | `static/css/style.css`의 `.dark` 규칙 약 300개 |

- 테마 값은 코드사전 `Theme`으로 관리한다. 선택 목록은 `getCode("Theme")`로 만들고(`layout_admin.html:415-417`), 세션·쿠키에는 선택한 코드 키가 저장된다. `Dark`는 이 코드 키다.
- 새 화면도 테마 목록·표시명을 하드코딩하지 않고 코드사전 `Theme`을 쓴다. 분기는 표시명이 아닌 코드 키 `Dark` 여부로만 한다. 화이트 쪽 키는 등록값을 확인하지 않았으므로 문자열로 가정하지 않는다.
- 새 테마 값이 필요하면 화면에 추가하지 말고 코드사전 등록과 해당 `.dark` 같은 CSS 규칙 추가를 사용자에게 제안한다.
- Admin 팝업(`layout_final/popup_layout`)은 메인 화면의 `static/css/*`가 아닌 `static/css_nh/*`(`style_final.css`)를 쓴다. 팝업 안 요소의 다크 모양은 이 파일 기준으로 확인한다([팝업 안 요소의 다크 테마](ui-components.md#팝업-안-요소의-다크-테마)).
- 날짜 선택 창(`jquery.datetimepicker`)은 `.dark` 규칙이 없어 두 테마 모두 밝은 창으로 보인다. 기존 동작이므로 화면에서 따로 바꾸지 않는다.

## 화면 작성 규칙

- [컴포넌트 표준](ui-components.md)의 클래스만 쓴다. 표준 클래스에는 `.dark` 규칙이 이미 있다. 단, 같은 클래스라도 놓인 위치에 따라 다크 규칙이 없을 수 있다(예: 팝업 `tbl-type2` 안의 input·textarea는 다크에서도 흰 칸). 표준의 위치·조합을 그대로 쓴다.
- 글자색·배경색·테두리색을 인라인 style이나 화면 `<style>`로 지정하지 않는다. 한 테마에서만 맞는 색이 된다. 꼭 필요하면 사용자에게 제안하고, 승인되면 화이트 규칙과 `.dark` 규칙을 함께 둔다.
- 차트 등 스크립트가 색을 정하는 화면은 `<input type="hidden" id="hdnSession" th:value="${session.admintheme}"/>`(User는 `session.usertheme`)를 두고 값이 `Dark`인지로 색을 고른다(`admin:static/js/d3-host.js:12-20`). 쿠키를 직접 읽는 방식(`d3-app.js:17`)은 새 화면에 쓰지 않는다.
- 이미지·아이콘을 새로 쓰면 두 테마 배경에서 모두 보이는지 확인한다.

## 확인 항목

- 두 테마에서 검색 영역·select·버튼·표(머리글·선택 행·페이징)·팝업·빈 결과 문구·알림창이 기존 화면과 같은 색으로 보이는지 확인한다.
- 테마를 바꿔 확인한 뒤에는 사용자의 원래 테마로 되돌린다(테마는 계정 쿠키·세션에 저장된다).

관련: [컴포넌트 표준](ui-components.md), [Admin frontend](frontend-admin.md), [User frontend](frontend-user.md).
