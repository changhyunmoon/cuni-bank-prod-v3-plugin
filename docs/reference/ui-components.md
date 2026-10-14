# 화면 컴포넌트 표준 마크업

> 범위: admin·user 화면의 검색·기간·선택·버튼·표·팝업·알림 | 상태: 소스 대조 완료, 브라우저 렌더링 미검증 | 근거: 아래 파일, [참고 화면](screen-references.md)

화면과 시안(prototype)은 이 문서의 마크업과 클래스만 사용한다. 새 클래스·새 인라인 style을 만들지 않는다. 여기 없는 컴포넌트는 [참고 화면](screen-references.md) → 같은 모듈의 기존 화면 순서로 찾고, 그래도 없으면 사용자에게 제안해 확정한 뒤 이 문서에 추가한다.

- 근거 경로는 각 모듈의 `src/main/resources/templates/` 기준이다. 문구는 실제 화면에서 자료사전 조회([사전 사용법](../cases/display-value/usage.md))로 넣는다. 아래 예시는 구조만 보이기 위해 한글을 직접 적었다.
- "참고 화면"은 유승민 최초작성 기준 화면, "확정"은 기준 화면에 없어 모듈 내 사용 빈도를 근거로 사용자가 2026-10-14에 정한 표준이다.
- 기존 화면에 있는 인라인 style(예: 너비 `style="width: 100px;"`)은 표준 마크업에 포함된 경우만 그대로 쓴다.

## 공통 자원

| 항목 | Admin | User |
|---|---|---|
| CSS·JS 목록과 순서 | `layout_final/layout_admin.html`의 `<link>`·`<script>` (주석 제외) | `layout_final/layout_user.html`의 `<link>`·`<script>` (주석 제외) |
| 표 언어 | `static/js/datatables/cultures/Korean.json` (grid가 `/admin/js/...` 절대 경로로 로드) | 같은 위치, `/user/js/...` |
| 날짜 입력 초기화 | `static/js/common.js` ready에서 `.datepicker`(Y-m-d), `.datetimepicker`(Y-m-d H:i)를 자동 초기화 | 동일 |
| 알림·확인 | `$.alert(title, message, callback)`, `$.confirm(...)`, `showNotification(k, t, msg)`(gritter) — `common.js` | 해당 모듈 `common.js`에서 확인 |

## 검색 영역

Admin — 참고 화면 `cloud/k8sworkload/workloadList.html:96-111`

```html
<div class="head_option type2 mt20">
    <div class="head_optionLeft">
        <select id="searchCondition" class="form-control mr10">
            <option value="1">프로젝트명</option>
        </select>
        <input type="text" id="searchText" class="form-control" placeholder="검색어를 입력하세요" autocomplete="off">
        <button type="button" id="search" class="btn-search">검색</button>
    </div>
    <div class="head_optionRight">
        <!-- 화면 동작 버튼 -->
    </div>
</div>
```

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
- 좌우 분할 화면의 검색은 참고 화면 `k8s/projectlist.html`의 `head_option type2` 구성을 그대로 따른다.

## 기간 (시작~종료)

Admin — 확정, 근거 `cloudresource/cloudresourcehistory/list.html:164-168`, `batchtask/list.html:404-406`

```html
<div class="head_optionLeft">
    <input type="text" id="searchStartDate" class="form-control datepicker" style="width: 100px;"/>
    ~
    <input type="text" id="searchEndDate" class="form-control datepicker" style="width: 100px;"/>
    <select id="searchCondition" class="form-control mr10">...</select>
    ...
    <button type="button" id="search" class="btn-search">검색</button>
</div>
```

- 날짜만이면 `datepicker`, 시각까지면 `datetimepicker` 클래스를 쓴다. `common.js`가 자동 초기화하므로 화면에서 `datetimepicker()`를 다시 설정하지 않는다. 동적으로 만든 입력만 같은 옵션으로 초기화한다.
- "기간 사용 여부" select, 감싸는 `div`·새 클래스를 추가하지 않는다. 요구사항에 있으면 사용자에게 제안한다.
- User는 검색 영역 기간의 기존 사례가 없다. 같은 마크업을 User `head_option right_box` 안에 둔다.

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
| 수정 | `head_optionRight` | `a.btn-type5.small.js-open.modify` | `alarmManagement/alarmmessageManagement.html:169` |
| 삭제 | `head_optionRight` | `a.btn-type5.small.del` | 동일 화면 |
| 상세 | 표 위 오른쪽 | `a.btn-type1.detail.js-open` | 참고 화면 `task/viewprogresscreatek8snamespace.html` |
| 엑셀 내보내기 | `head_optionRight` | `a.btn-type5.export` (확정) | `batchtask/list.html:365` 외. 동작은 [엑셀 표준](../cases/table/excel-export.md) |
| 팝업 닫기(하단) | `popup-foot` | `button.btn-type2.js-close` | `cloud/projectmember/save.html:186` |
| 팝업 저장(하단) | `popup-foot` | `input[type=submit].btn-type2.blue` 또는 `button.btn-type2.blue` | `cloud/projectmember/save.html:187` |
| 팝업 닫기(우상단) | `popup-head` | `button.btn-popupClose.js-close` | `cloud/projectmember/save.html:145` |

- 이벤트는 ready에서 한 번만 연결한다. 같은 버튼에 `onclick` 속성을 함께 쓰지 않는다([공통 작성 순서](../cases/screen/new-screen.md)).

## 표

| 용도 | Admin | User |
|---|---|---|
| 서버 목록 | `div.tbl-type1.sortable.scrollX.width100.mt20` > `table#grid.uk-table.uk-table-hover` (workloadList) | `div.tbl-type5` > `table#grid` + `<caption>` (workloadList) |
| 팝업 안 목록 | `div.tbl-type1.sortable` > `table.uk-table.uk-table-hover` | `div.tbl-type6` |
| 미리보기·입력 행 | `div.tbl-type6` > `table.uk-table.uk-table-hover` (bluksave) | `div.tbl-type6` |

- `<thead>`의 `<th scope="col">` 수·순서는 `columns`와 맞춘다. 긴 열은 `dt-body-ellipsis`.
- 표 옵션(페이징 `full_numbers`, `dom`, 건수 선택, 선택 스타일, 빈 결과 문구)은 공통 함수가 정한다. 화면에서 다시 지정하지 않는다([DataTables 선택](../cases/table/table-setup.md)).

## 등록·수정 폼 (팝업)

확정 — 근거 `cloud/projectmember/save.html:143-188`

```html
<div class="popup-head">
    <h2 id="pageTitle"></h2>
    <button type="button" class="btn-popupClose js-close"></button>
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
- 팝업 열기는 `showPopup`·`showPopupTypeB`(Admin `common.js`), 닫기는 `closePopup`을 쓴다.

## 빈 결과·알림

- 빈 결과는 표 안 DataTables 빈 결과 문구(`Korean.json`)로 보인다. 표 밖에 별도 안내 영역·클래스를 만들지 않는다. 요구사항상 필요하면 사용자에게 제안한다.
- 검증 실패·미선택은 `$.alert`, 삭제 등 확인은 `$.confirm`, 저장 결과는 `saveData`·`showNotification`의 기존 흐름을 따른다.

관련: [Admin frontend](frontend-admin.md), [User frontend](frontend-user.md), [목록 배치](../cases/screen/list-screen.md), [공통 작성 순서](../cases/screen/new-screen.md).
