# 화면 컴포넌트 표준 마크업

> 범위: admin·user 화면의 검색·기간·선택·버튼·표·팝업·알림 | 상태: 소스 대조 완료, 브라우저 렌더링 미검증 | 근거: 아래 파일, [참고 화면](screen-references.md)

화면과 시안(prototype)은 이 문서의 마크업과 클래스만 사용한다. 새 클래스·새 인라인 style을 만들지 않는다. 여기 없는 컴포넌트는 [참고 화면](screen-references.md) → 같은 모듈의 기존 화면 순서로 찾고, 그래도 없으면 사용자에게 제안해 확정한 뒤 이 문서에 추가한다.

- 근거 경로는 각 모듈의 `src/main/resources/templates/` 기준이다. 문구는 실제 화면에서 자료사전 조회([사전 사용법](../cases/display-value/usage.md))로 넣는다. 아래 예시는 구조만 보이기 위해 한글을 직접 적었다.
- "참고 화면"은 유승민 최초작성 기준 화면, "확정"은 기준 화면에 없어 모듈 내 사용 빈도를 근거로 사용자가 2026-10-14에 정한 표준이다.
- 기존 화면에 있는 인라인 style(예: 너비 `style="width: 100px;"`)은 표준 마크업에 포함된 경우만 그대로 쓴다.
- 표준 클래스는 다크·화이트 테마 규칙을 모두 가진다. 색을 직접 지정하지 않는다([테마](theme.md)).

## 공통 자원

| 항목 | Admin | User |
|---|---|---|
| CSS·JS 목록과 순서 | `layout_final/layout_admin.html`의 `<link>`·`<script>` (주석 제외) | `layout_final/layout_user.html`의 `<link>`·`<script>` (주석 제외) |
| 표 언어 | `static/js/datatables/cultures/Korean.json` (grid가 `/admin/js/...` 절대 경로로 로드) | 같은 위치, `/user/js/...` |
| 날짜 입력 초기화 | `static/js/common.js` ready에서 `.datepicker`(Y-m-d), `.datetimepicker`(Y-m-d H:i)를 자동 초기화 | 동일 |
| 알림·확인 | `$.alert(title, message, callback)`, `$.confirm(...)`, `showNotification(k, t, msg)`(gritter) — `common.js` | 해당 모듈 `common.js`에서 확인 |

## 검색 영역

Admin — 참고 화면 `cloud/k8sworkload/workloadList.html:96-111`, 검색·기간·동작 버튼이 함께 있는 줄은 `monitoring/vmManagerManagement/list.html:514-560`

```html
<div class="head_option type2 mt20">
    <div class="head_optionLeft" style="font-size: 14px;">
        <select id="targetType" class="form-control">...</select>          <!-- 대상 선택(있으면) -->
        <input type="text" id="searchStartDate" class="form-control datepicker" style="width: 100px;"/>
        ~
        <input type="text" id="searchEndDate" class="form-control datepicker" style="width: 100px;"/>
        <select id="searchCondition" class="form-control mr10">...</select> <!-- 검색 조건 -->
        <input type="search" id="searchText" class="form-control" placeholder="검색어를 입력하세요" autocomplete="off">
        <button type="button" id="search" class="btn-search"></button>
    </div>
    <div class="head_optionRight">
        <a href="#" id="save" class="btn-type5 small blue js-open rec">등록</a>
        <a href="#" id="edit" class="btn-type5 small js-open modify">수정</a>
        <a href="#" id="delete" class="btn-type5 small del">삭제</a>
        <a href="#" id="export" class="btn-type5 export">내보내기</a>
    </div>
</div>
```

- 줄 구성(요소 순서, 동작 버튼 위치·순서, 너비)은 [목록 배치](../cases/screen/list-screen.md#검색-줄-구성-admin)를 따른다.
- `head_option`은 CSS에서 `font-size: 0`이다. `~` 같은 글자가 있으면 `head_optionLeft`에 `style="font-size: 14px;"`를 둔다(Admin 21개 화면 사용).
- `btn-search`는 아이콘 버튼이다(`text-indent: -9999px`). 글자를 넣어도 보이지 않으므로 비워 두거나 자료사전 `Term.Search`를 넣는다.

User — 참고 화면 `k8s/workloadList.html:100-117`

```html
<div class="content-area">
    <div class="tbl-top">
        <div class="tit_cont">
            <div class="head_option right_box">
                <select id="searchCondition" class="form-control">...</select>
                <input type="search" id="searchText" class="form-control" placeholder="검색어를 입력하세요" autocomplete="off">
                <button type="button" id="search" class="btn-search">검색</button>
            </div>
        </div>
    </div>
    <!-- 표 -->
</div>
```

- **라벨을 두지 않는다**(확정). 조건의 의미는 select 옵션·placeholder로 보인다. 라벨이 꼭 필요하면 사용자에게 제안한다. `<span>` 라벨을 임의로 넣지 않는다.
- 검색 조건이 여러 개면 같은 `head_optionLeft` 안에 `select.form-control.mr10`을 이어 둔다.
- select 옵션은 하드코딩하지 않는다. 검색 항목은 자료사전 `getDicList(category)`, 값 목록(상태·유형 등)은 코드사전 `getCode(category)`로 만든다([사전 사용법](../cases/display-value/usage.md)). 위 예시의 한글 옵션은 구조를 보이기 위한 것이다.
- 좌우 분할 화면의 검색은 참고 화면 `k8s/projectlist.html`의 `head_option type2` 구성을 그대로 따른다.

## 기간 (시작~종료)

기간 검색은 **A. 날짜**(`YYYY-MM-DD`) 또는 **B. 날짜·시간**(`YYYY-MM-DD HH:mm`) 중 하나로만 만든다. 방식 고르는 기준, 마크업, 기본값·검증 스크립트는 [기간 검색 가이드](../cases/screen/period-search.md)를 따른다.

| 방식 | 입력 | 달력 초기화 | 근거 |
|---|---|---|---|
| A. 날짜 | `input.form-control.datepicker` `style="width: 100px;"` ~ 같은 입력 | `common.js` 자동 초기화 | `cloudresource/cloudresourcehistory/list.html:164-168`, `task/list.html:610-612` |
| B. 날짜·시간 | `input.form-control` `style="width:180px;"` ~ 같은 입력 (`datepicker`·`datetimepicker` 클래스 없음) | id로 `datetimepicker({format: 'Y-m-d H:i'})`, 시작·종료 연동 | `ipstatus/list.html:33-52, 164-166` |

- "기간 사용 여부" select, 감싸는 `div`·새 클래스를 추가하지 않는다. 요구사항에 있으면 사용자에게 제안한다.
- 등록·수정 폼의 단일 날짜 입력은 아래 폼 안 입력 기준(`input.w100p.datepicker`)을 따른다.

## 선택·입력 요소

| 요소 | 표준 | 근거 |
|---|---|---|
| 검색 영역 select | `select.form-control.mr10` (마지막 요소 앞) | workloadList(Admin) |
| 검색어 | `input.form-control` + `autocomplete="off"`, User는 `type="search"` | workloadList |
| 폼 안 select | `select.form-control` | `cloud/projectmember/save.html:169` |
| 폼 안 텍스트·날짜 | `input.w100p` (날짜는 `datepicker` 추가) | `cloud/projectmember/save.html:176-180` |
| 너비 지정 | `w100p`, `w200`, `w300`, `w10p`, `w25p` 등 기존 유틸 클래스 | Admin templates 사용 빈도 |
| 간격 | `mt10`, `mt15`, `mt20`, `mr10`, `ml5` 등 기존 유틸 클래스 | 참고 화면 |

## 버튼

| 용도 | 위치 | 표준 클래스 | 근거 |
|---|---|---|---|
| 검색 | `head_optionLeft` 끝 | `button.btn-search` | 참고 화면 workloadList |
| 등록·추가 | `head_optionRight` | `a.btn-type5.small.blue.js-open.rec` | 참고 화면 `k8s/projectlist.html:171` |
| 기타 화면 동작(컬럼 선택 등) | `head_optionRight` | `a.btn-type5.small.js-open.modify`, 글자가 길면 `style="width: auto; margin-right: 15px;"` | `monitoring/vmManagerManagement/list.html:543` |
| 수정 | `head_optionRight` | `a.btn-type5.small.js-open.modify` | `alarmManagement/alarmmessageManagement.html:169` |
| 삭제 | `head_optionRight` | `a.btn-type5.small.del` | 동일 화면 |
| 상세 | 표 위 오른쪽 | `a.btn-type1.detail.js-open` | 참고 화면 `task/viewprogresscreatek8snamespace.html` |
| 엑셀 내보내기 | `head_optionRight` 맨 끝 | `a.btn-type5.export` (확정), 문구는 자료사전 `Term.Export`("내보내기") | `monitoring/vmManagerManagement/list.html:558-560` 외. 동작은 [엑셀 표준](../cases/table/excel-export.md) |
| 팝업 닫기(하단) | `popup-foot` | `button.btn-type2.js-close` | `cloud/projectmember/save.html:186` |
| 팝업 저장(하단) | `popup-foot` | `input[type=submit].btn-type2.blue` 또는 `button.btn-type2.blue` | `cloud/projectmember/save.html:187` |

- 이벤트는 ready에서 한 번만 연결한다. 같은 버튼에 `onclick` 속성을 함께 쓰지 않는다([공통 작성 순서](../cases/screen/new-screen.md)).
- `btn-type5` 버튼 사이 세로 구분선과 `small` 버튼의 고정 폭은 기본 디자인이다. 지우거나 바꾸지 않는다.
- `small` 고정 폭(100px)에 아이콘과 4글자 이상(예: "컬럼 선택")이 들어가면 줄바꿈된다. 이때 `width: auto`만 주면 버튼이 글자 폭으로 줄어 다음 버튼의 구분선(`|`)에 붙으므로 `margin-right: 15px`를 함께 준다.
- 팝업은 `popup-head`에 제목만 두고 하단 `popup-foot`의 닫기·취소 버튼으로 닫는다. 우상단 `btn-popupClose`(×)는 넣지 않는다(확정, 사용자 결정 2026-10-14 — `layout_final/popup_layout` 화면 130개 중 96개가 ×없이 하단 버튼만 사용).
- 버튼에 비활성 모양을 만들지 않는다(`btn-type5`에는 비활성 스타일이 없다). 지금 할 수 없는 동작이면 누를 때 조건을 확인해 `$.alert`로 알리고 멈춘다. 숨겨야 하는 요구가 있으면 기존처럼 `.hide()`/`.show()`로 한다(`monitoring/monthlyReport.html:67`).

## 표

| 용도 | Admin | User |
|---|---|---|
| 서버 목록 | `div.tbl-type1.sortable.scrollX.width100.mt20` > `table#grid.uk-table.uk-table-hover` (workloadList) | `div.tbl-type5` > `table#grid` + `<caption>` (workloadList) |
| 팝업 안 목록 | `div.tbl-type1.sortable` > `table.uk-table.uk-table-hover` | `div.tbl-type6` |
| 미리보기·입력 행 | `div.tbl-type6` > `table.uk-table.uk-table-hover` (bluksave) | `div.tbl-type6` |

- `<thead>`의 `<th scope="col">` 수·순서는 `columns`와 맞춘다. 긴 열은 `dt-body-ellipsis`.
- 단, Admin의 `dt-body-ellipsis` 규칙은 `static/css/content.css`에만 있고 `layout_admin`은 이 파일을 로드하지 않아 클래스만으로는 말줄임이 되지 않는다(2026-10-14 확인). 말줄임이 요구사항이면 처리 방식을 사용자와 정한다.
- 컬럼 수가 많아 가로 스크롤이 필요한 표는 `scrollX width100` 래퍼만으로는 열이 좁아져 머리글이 겹친다. 열을 줄이지 않고 스크롤시키는 방법은 사용자와 정하고 두 테마에서 머리글 겹침을 확인한다.
- 표 옵션(페이징 `full_numbers`, `dom`, 건수 선택, 선택 스타일, 빈 결과 문구)은 공통 함수가 정한다. 화면에서 다시 지정하지 않는다([DataTables 선택](../cases/table/table-setup.md)).

## 등록·수정 폼 (팝업)

확정 — 근거 `cloud/projectmember/save.html:143-188`

```html
<div class="popup-head">
    <h2 id="pageTitle"></h2>
</div>
<div class="popup-body">
    <div class="tbl-type2 vertical">
        <table class="basic">
            <colgroup><col class="w20p" /><col /></colgroup>
            <tbody>
            <tr>
                <th class="asterisk">이름</th>
                <td><input type="text" class="w100p" id="name" name="name"></td>
            </tr>
            </tbody>
        </table>
    </div>
</div>
<div class="popup-foot">
    <button type="button" id="close" class="btn-type2 js-close">닫기</button>
    <input id="save" type="submit" class="btn-type2 blue" value="저장"/>
</div>
```

- 필수 항목은 `th.asterisk`로 표시한다. 파일 업로드 영역은 `bluksave.html`의 `tbl-type4 vertical` 구성을 따른다([팝업 표준](../cases/screen/register-popup.md)).
- 진행·조회 팝업은 참고 화면 `task/viewprogresscreatek8snamespace.html:123-154`의 `popup-head` / `popup-body` / `popup-foot`을 따른다.
- 팝업은 별도 템플릿 페이지다. `showPopup(url, width, height)`(Admin `common.js:376`)가 `#bPopup .bpopup-content`에 iframe으로 열고, 그 페이지는 `popup_layout*`이 `body`(다크면 `dark`) > `#wrap.w-pop`(+`bg-black`/`bg-white`) > `.w-popup.wide.js-layer`로 감싼다. 닫기는 `closePopup`.
- 크기는 `showPopup`의 width·height로만 정한다(기존 사용 빈도: 1200×600, 1000×750, 1100×900). 화면 안에 자체 모달·배경 막(dim)·팝업 전용 CSS를 만들지 않는다. 그런 요소는 팝업 레이아웃 CSS와 충돌하고 다크 색도 따로 필요해진다.
- 너비는 1000 이상으로 한다. `layout_final/popup_layout`의 CSS(`css_nh/style_final.css:1812`)가 `.w-pop{min-width:1000px}`이라 더 좁으면 내용이 iframe 밖으로 잘린다.
- `popup-foot`은 팝업 맨 아래에 고정(`position: absolute; bottom: 0`)이라 본문이 길면 버튼과 겹친다. 고정 높이 영역(목록 스크롤·textarea)은 하단 버튼 위에 간격이 남도록 높이를 정한다.

### 팝업 안 요소의 다크 테마

`layout_final/popup_layout`은 메인 화면과 다른 `css_nh/*.css`를 쓰고, 다크 규칙이 붙는 위치가 정해져 있다. 아래 위치에 두면 두 테마에서 기존 팝업과 같게 보인다.

| 용도 | 마크업 | 다크 모양 | 근거 |
|---|---|---|---|
| 팝업 안 목록 검색 | `div.tit_cont`(`style="height:35px"`) > `div.head_option.right_box.mb20` > `select.form-control` + `input[type=search].form-control`(`style="width: 190px"`) + `button.btn-search`, 라벨 없음 | 어두운 배경·밑줄 (`style_final.css:775`) | `cloud/project/popup.html:119-139`, `cloudresource/managementserver/popup.html` |
| 긴 값·여러 줄 입력 | `div.tbl-type4.vertical` > `table` > `tr.type1` > `td` > `textarea.w100p` | 어두운 배경·테두리 (`style_final.css:1303-1304`) | `cloudresource/managementScript/save.html:127-152` |

- `tbl-type2` 폼 표 안의 input·textarea에는 다크 규칙이 없어 다크에서도 흰 칸이다. 검색 칸·긴 값 칸을 `tbl-type2` 안에 두지 않는다.
- 검색 줄(`head_option`)은 float라 아래 목록이 DataTables 표가 아니면(`.dataTables_wrapper`의 `clear: both`가 없으면) 검색 줄 옆으로 올라간다. 일반 표를 두면 사이에 `<div class="clear"></div>`를 둔다.
- 팝업 다크 textarea 글자색(`#888888`)은 회색 표시용 `col-gray`와 같다. 값과 회색 표시(예: `[NULL]`)를 구분해야 하면 회색 표시는 textarea 밖에 둔다.

## 빈 결과·알림

- 빈 결과는 표 안 DataTables 빈 결과 문구(`Korean.json`)로 보인다. 표 밖에 별도 안내 영역·클래스를 만들지 않는다. 요구사항상 필요하면 사용자에게 제안한다.
- 검증 실패·미선택은 `$.alert`, 삭제 등 확인은 `$.confirm`, 저장 결과는 `saveData`·`showNotification`의 기존 흐름을 따른다.

관련: [Admin frontend](frontend-admin.md), [User frontend](frontend-user.md), [목록 배치](../cases/screen/list-screen.md), [공통 작성 순서](../cases/screen/new-screen.md).
