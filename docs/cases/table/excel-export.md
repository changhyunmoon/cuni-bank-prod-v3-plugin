# 화면 데이터 엑셀 내보내기 표준

> 범위: Admin·User 프런트엔드 | 성격: 사용자 지정 개발 표준 | 상태: 소스 대조 완료, 다운로드 실행 미검증
>
> 언제 읽나: 화면 목록에 엑셀 내려받기 버튼을 추가하거나 기존 내보내기를 고칠 때 | 읽지 않는 경우: 서버에서 만드는 별도 보고서·전체 데이터 추출(데이터 범위를 요구사항에서 따로 정의)

일반 목록의 엑셀 내보내기는 DataTables `excelHtml5`와 JSZip으로 현재 화면의 그리드 데이터를 브라우저에서 `.xlsx`로 생성한다.

## 내보낼 데이터 범위

| 항목 | 개발 표준 |
|---|---|
| 행 | 현재 페이지의 모든 데이터 행. 스크롤 밖에 있어도 같은 페이지의 행은 포함 |
| 선택 상태 | 선택된 행 유무에 관계없이 현재 페이지 전체 행을 내보냄 |
| 검색·정렬 | 그리드에 마지막으로 적용되어 표시된 검색 결과와 정렬 순서 유지 |
| 열 | 화면에서 표시하는 데이터 열. 숨긴 내부 식별자·선택 체크박스·동작 버튼 열은 제외 |
| 표시값 | 코드 원문보다 화면에 표시한 명칭·날짜·단위 기준. 링크·HTML 장식은 텍스트로 변환 |
| 조회 | 내보내기 클릭으로 별도 목록 조회·전체 조회·페이지 크기 변경을 하지 않음 |
| 빈 결과·조회 중 | 0건은 사전 문구로 안내하고 종료. 조회 중에는 내보내기를 막아 표시 데이터와 파일이 달라지지 않게 함 |

- 서버 페이징 표와 클라이언트 페이징 표 모두 현재 페이지를 명시한다. 페이징이 없는 표는 현재 표시 대상 행 전체가 범위다.
- 사용자가 목록 길이를 '전체'로 변경해 조회를 마친 경우 그 표시 결과를 내보낸다. 내보내기 함수가 자동으로 '전체' 조회를 실행하지 않는다.

## 구현 순서

1. 실제 사용하는 레이아웃에 DataTables → Buttons → JSZip → `buttons.html5.min.js`가 로드되는지 확인한다. 기존 포함 파일은 중복 로드하지 않는다.
2. [그리드 생성 옵션](table-setup.md)에 `buttons`를 추가하고 `dom`에 Buttons 초기화를 위한 `B`를 포함한다. 기존 검색·페이징·열 크기 조절용 dom 구성은 유지한다.
3. 아래처럼 현재 페이지와 선택 무시를 **명시**한다. 기존 화면의 `excelHtml5`·title만 있는 옵션을 그대로 복사하지 않는다.

```javascript
buttons: [{
    extend: 'excelHtml5', title: pageTitle,
    exportOptions: {
        columns: ':visible',
        modifier: {page: 'current', search: 'applied', order: 'applied', selected: null},
        orthogonal: 'display', stripHtml: true
    }
}]
```

4. 위 예시는 표시 열이 모두 데이터 열인 표 기준이다. 체크박스·동작 열이 있으면 해당 열을 제외하도록 `columns` 선택자를 추가 조정한다. DataTables 열 가시성과 CSS로만 숨긴 열은 다를 수 있으므로 결과를 확인한다.
5. 기존 화면 버튼을 쓰면 생성된 Excel 버튼은 해당 표 컨테이너 안에서 숨긴다. 클릭 이벤트는 한 번만 연결한다.
6. 화면의 `exportData()`에서는 0건·조회 중 여부를 검사한 후 `$('#grid').DataTable().button('.buttons-excel').trigger()`로 **대상 표만** 실행한다. 여러 Excel 버튼이면 고유 버튼 선택자를 사용한다.
7. 파일 제목·버튼·안내 문구는 [사전 사용법](../display-value/usage.md)을 따른다. `pageTitle`도 실제 화면 제목의 사전값으로 준비한다.

## 복사하지 않을 기존 패턴

- 전역 `$('.buttons-excel').click()`은 여러 표의 내보내기를 함께 실행할 수 있으므로 표 API로 범위를 제한한다.
- Buttons 기본 export는 선택 행이 있으면 선택 행만 추출할 수 있다. `selected: null`을 생략하지 않는다.
- 브라우저에 모든 행이 로드된 표도 `page: 'current'`를 생략하면 다른 페이지가 포함될 수 있다.
- 서버의 엑셀용 조회 API → form 제출 → Apache POI 파일 생성은 기존 구현 방식이다. 일반 화면 내보내기의 신규 표준으로 사용하지 않는다.
- 숨겨진 별도 그리드·임시 그리드에 전체/추가 데이터를 넣는 방식도 현재 화면 내보내기 표준에 포함하지 않는다. 별도 보고서·전체 추출 요구는 기능의 데이터 범위를 따로 명시한다.
- `orthogonal: 'display'`는 렌더링 데이터 기준이며 화면 캡처가 아니다. 편집 input/select의 현재 값이나 HTML 상태 배지가 자동으로 원하는 텍스트가 되는 것은 아니다. 해당 열은 `exportOptions.format.body` 등으로 실제 표시값을 추출한다.

## 적용 확인과 근거

- 25건을 10건씩 표시할 때 2페이지는 10건, 마지막 페이지는 5건인지 확인한다. 한 행을 선택해도 같은 페이지의 전체 행이 나와야 한다.
- 검색·정렬·표시 길이 변경 후 행 순서·수량, 숨김/동작 열 제외, 날짜·코드명·한글·입력값을 확인한다.
- 여러 표에서 대상 파일만 한 번 생성되는지, 클릭 시 추가 조회 요청이 없는지, 0건·조회 중 처리가 되는지 확인한다.
- 구현 근거: `admin:src/main/resources/templates/system/loginHistory/list.html`, `user:src/main/resources/templates/serviceList/detail.html`의 `excelHtml5`. 이 파일들이 위의 모든 표준 옵션을 이미 갖춘 것은 아니다.
- 기본 선택 동작 근거: 양 모듈 `src/main/resources/static/js/datatables/dataTables.buttons.min.js`의 `buttons.exportData()`. 로딩 근거: 양 모듈 `templates/layout_final/layout_admin.html` 또는 `layout_user.html`(templates는 `src/main/resources/` 아래).
- 관련: [표 조작](table-row-operations.md), [Admin frontend](../../reference/frontend-admin.md), [User frontend](../../reference/frontend-user.md), [소스 기준](../../maintenance/source-baseline.md).
