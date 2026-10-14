# 기간(시작~종료) 검색 두 방식

> 범위: Admin·User 목록의 기간 검색 | 근거: Admin `task/list.html`, `cloudresource/cloudresourcehistory/list.html`, `batchtask/list.html`, `ipstatus/list.html`, `monitoring/monthlyReport.html`
>
> 언제 읽나: 검색 영역에 시작~종료 기간 입력이 있는 화면을 만들거나 시안을 그릴 때 | 읽지 않는 경우: 등록·수정 폼의 단일 날짜 입력(→ [컴포넌트 표준](../../reference/ui-components.md)의 폼 안 입력)

기간 검색은 아래 **A. 날짜** 또는 **B. 날짜·시간** 중 하나로만 만든다. 한 화면의 시작·종료는 같은 방식을 쓰고, 두 방식을 섞거나 다른 형태(기간 사용 여부 select, 빠른 기간 버튼, 새 클래스)를 만들지 않는다. 필요하면 사용자에게 제안한다.

## 방식 고르기

| 방식 | 값 형식 | 고르는 경우 | 기존 예 |
|---|---|---|---|
| A. 날짜 | `YYYY-MM-DD` | 하루 단위로 거르면 충분한 목록(작업·이력·자원 변경 목록 등) | 작업 목록, 자원 변경 이력, 배치 실행 이력 |
| B. 날짜·시간 | `YYYY-MM-DD HH:mm` | 하루 안에서 시각까지 좁혀야 하는 데이터(생성 일시·모니터링 기록 등) | IP 현황(VM 생성 일시), 월간 보고 이력 |

- 방식은 요구사항 단계에서 정해 `requirements.md`에 "기간 방식: A 날짜 / B 날짜·시간"으로 기록한다. 요청에 없으면 위 기준으로 추천안을 붙여 사용자에게 둘 중 하나를 고르게 한다.
- 조회 API가 받는 값 형식과 맞춘다. A는 종료일 당일 데이터가 포함되는지(종료일 23:59까지인지) API 계약에서 확인한다.
- 기본 기간도 요구사항 항목이다. 요청에 없으면 기존 예(A: 최근 30일, B: 최근 1개월)를 "제안"으로 묻고 임의로 정하지 않는다.

## A. 날짜

마크업 — 근거 `cloudresource/cloudresourcehistory/list.html:164-168`, `task/list.html:610-612`

```html
<div class="head_option type2 mt20">
    <div class="head_optionLeft">
        <input type="text" id="searchStartDate" class="form-control datepicker" style="width: 100px;"/>
        ~
        <input type="text" id="searchEndDate" class="form-control datepicker" style="width: 100px;"/>
        <!-- 검색 조건 select·검색어가 있으면 이어서 -->
        <button type="button" id="search" class="btn-search">검색</button>
    </div>
</div>
```

스크립트 — 근거 `task/list.html:59-60, 592-600`, `batchtask/list.html:50-52`

```javascript
$(function () {
    $('#searchEndDate').val(moment().format('YYYY-MM-DD'));
    $('#searchStartDate').val(moment().subtract(30, 'days').format('YYYY-MM-DD')); // 기본 기간은 요구사항대로

    $('#search').click(function () {
        if (validateSearchDate()) {
            reloadGrid('#grid');
        }
    });
});

function validateSearchDate() {
    const startDate = $('#searchStartDate').val();
    const endDate = $('#searchEndDate').val();
    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
        $.alert(pageTitle, '조회할 날짜의 시작일은 종료일보다 이전이어야 합니다.');
        return false;
    }
    return true;
}
```

- 달력은 `common.js` ready가 `.datepicker`에 `timepicker: false, format: 'Y-m-d'`로 자동 초기화한다. 화면에서 `datetimepicker()`를 다시 호출하지 않는다.
- 기본값은 `moment()`로 넣는다. `toISOString()`은 UTC 기준이라 자정 전후로 날짜가 하루 어긋날 수 있어 쓰지 않는다(`cloudresourcehistory/list.html:29-34`의 방식은 복사하지 않는다).

## B. 날짜·시간

마크업 — 근거 `ipstatus/list.html:164-166`, `monitoring/monthlyReport.html:310-312`

```html
<div class="head_option type2 mt20">
    <div class="head_optionLeft">
        <input type="text" id="searchStartDate" class="form-control" style="width:180px;" autocomplete="off"/>
        ~
        <input type="text" id="searchEndDate" class="form-control" style="width:180px;" autocomplete="off"/>
        <button type="button" id="search" class="btn-search">검색</button>
    </div>
</div>
```

스크립트 — 근거 `ipstatus/list.html:21-25, 33-52, 139-148`

```javascript
$(function () {
    $('#searchStartDate').datetimepicker({
        format: 'Y-m-d H:i',
        onShow: function () {
            this.setOptions({maxDateTime: $('#searchEndDate').val() ? $('#searchEndDate').val() : false});
        }
    });
    $('#searchEndDate').datetimepicker({
        format: 'Y-m-d H:i',
        onShow: function () {
            this.setOptions({minDateTime: $('#searchStartDate').val() ? $('#searchStartDate').val() : false});
        }
    });
    $('#searchEndDate').val(moment().format('YYYY-MM-DD HH:mm'));
    $('#searchStartDate').val(moment().add(-1, 'months').format('YYYY-MM-DD HH:mm')); // 기본 기간은 요구사항대로

    $('#search').click(function () {
        if (validateSearchDate()) {
            reloadGrid('#grid');
        }
    });
});
// validateSearchDate()는 A와 같다. 문구만 "시작 일시는 종료 일시보다 이전이어야 합니다."로 맞춘다.
```

- 입력에 `datepicker`·`datetimepicker` 클래스를 붙이지 않는다. `common.js`가 그 클래스를 시작·종료 연동 없이 먼저 초기화한다.
- 기존 화면의 화면별 클래스(`ipStatusCal`, `hostHistoryCal`)는 CSS가 없는 클래스라 복사하지 않는다. `head_optionLeft`의 인라인 `font-size`, select의 `margin-left:50px`도 복사하지 않는다.
- 달력 선택 창의 시작·종료 연동(`minDateTime`·`maxDateTime`)과 검색 시 검증을 함께 둔다. 직접 입력한 값은 검증으로 막는다.

## 공통

- 검색 영역에는 라벨을 두지 않는다([컴포넌트 표준](../../reference/ui-components.md)). 기존 B 예시의 `<span>` 라벨은 복사하지 않으며, 어떤 날짜인지 구분이 필요하면 사용자에게 제안한다.
- `searchData()`는 입력값을 API 키로 넘기기만 한다. 형식 변환이 필요하면 `moment`로 하고 API 계약과 맞춘다.
- User는 기간 검색 기존 사례가 없다. 같은 마크업·스크립트를 User 검색 영역(`head_option right_box`)에 둔다.

## 확인 항목

- 첫 화면의 기본 기간, 달력 선택 창 형식(A는 시간 선택 없음, B는 시간 선택 있음), 시작 > 종료 입력 시 알림 후 조회 중단, 빈 값 조회, 종료일 당일 데이터 포함 여부.
- B는 시작을 고른 뒤 종료 달력에서 시작 이전 일시를 고를 수 없는지 확인한다.

관련: [목록 배치](list-screen.md), [컴포넌트 표준](../../reference/ui-components.md), [참고 화면](../../reference/screen-references.md).
