# DataTables 재조회·선택·행 조작 가이드

> 범위: Admin·User | 상태: 소스 대조 완료, 실행 미검증 | 근거: 양 모듈 `src/main/resources/static/js/datatables/datatables.ex.js`

서버 표는 재조회하고 로컬 표는 행 데이터를 바꾼다. 모든 조작에는 실제 표 ID를 전달하는 것을 기본으로 한다.

| 목적 | 재사용 함수 | 반환·주의 |
|---|---|---|
| 검색·저장 후 조회 | `reloadGrid(gridId, resetPaging, callback)` | ID 생략은 `#grid`, 페이지 초기화 기본 true. 페이지 유지 시 false |
| 현재 페이지 | `getPage(id)` | 0부터 시작. 실패 시 0; Admin은 비정상 page도 검사 |
| 선택 건수 | `selectedCount(gridId)` | 숫자, 미선택 0 |
| 첫 선택 행 | `selectedRowData(gridId)` | 행 객체 또는 null |
| 선택 행 전체 | `selectedRowDatas(gridId)` | DataTables API 컬렉션 또는 null. 순수 배열 필요 시 `.toArray()` |
| 로드된 전체 행 | `getGridDatas(gridId)` | API 컬렉션 또는 null. 서버 표에서는 DB 전체가 아님 |
| 첫 선택 행의 필드 | `selectedColumnValue(columnName, gridId)` | 값 또는 null. 첫 인자가 필드명 |
| 선택 행의 필드 배열 | `selectedColumnValuesByKey(columnName, gridId)` | 배열 또는 null; 각 필드의 존재는 호출자가 확인 |
| 중복 확인 | `isGridExist(gridId, data, containKeys)` | 공통 `contains`로 검사. 키 문자열 또는 키 배열 지정 |
| 중복 방지 단건 추가 | `addGridRow(gridId, data, containKeys, fromGridId)` | 성공 true, 중복 false. 원본 표 옵션은 표시·선택 해제 처리 |
| 여러 행 추가 | User `addGridRows(gridId, data)` | 중복 검사 없이 각 행마다 draw. Admin에는 활성 구현 없음 |

## 로컬 표의 사용 예

아래 `rows`는 이미 파싱·검증한 객체 배열, `columns`는 대상 응답 필드 정의다. 파일 업로드 미리보기·요약·조회 조각에 적용한다.

```javascript
const preview = $.fn.dataTable.emptyGrid('#previewGrid', {
    columns: columns,
    select: false
});
function replacePreview(rows) {
    preview.clear();
    preview.rows.add(rows).draw();
}
```

- 생성은 한 번, 데이터 교체는 clear → rows.add → draw 한 번으로 처리한다. `emptyGrid`에는 기본 AJAX가 없으므로 `reloadGrid`를 쓰지 않는다.
- 단건 선택 이동에 중복 방지가 필요하면 `addGridRow`를 사용하고 업무 고유 키를 지정한다. 대량 추가는 먼저 키로 중복을 걸러 일괄 추가한다.
- 로컬 선택 행 제거는 `table.rows({selected: true}).remove().draw()`로 처리한다. 서버 삭제는 API 성공 후 재조회해야 한다.
- 서버 페이징 표의 선택·전체 행 함수는 로드 범위만 본다. 여러 페이지에 걸친 선택은 별도 ID 상태와 서버 검증이 필요하다.
- 엑셀 내보내기는 [전용 표준](excel-export.md)에 따라 현재 페이지의 모든 행을 추출한다. `selectedRowDatas()`로 내보내기 범위를 제한하지 않는다.

## 그대로 사용하지 않을 함수·패턴

- `setCheckAll(gridId)`는 양쪽 모두 본문이 주석뿐이다. 호출해도 전체 선택은 구현되지 않는다.
- `selectRowFromGrid`·`deselectRowFromGrid`는 `row-added` CSS만 변경한다. DataTables Select의 select/deselect와 다른 기능이다.
- 두 함수가 사용하는 `containRow`는 단일 키면 인덱스를 반환하지만 복합 키 일치 시 true를 반환한다. 복합 키에서 행 위치 판정용으로 재사용하지 않는다.
- `row-added`는 DOM 위치를 사용하므로 정렬·페이징 후에도 같은 행인지 확인해야 한다.
- 체크박스 입력 표는 `select: false`와 input 상태 수집을 사용한다. `selectedRowDatas()`가 HTML checkbox의 체크를 읽어주지 않는다.
- `bluksave.html`에는 전역 공통 함수와 동명인 화면 `addGridRow`가 있다. 공통 중복 검사가 실행된다고 가정하지 말고 신규 함수에는 화면별 이름을 사용한다.

## 완료 확인

- 미선택 null 처리, 단일/다중 선택, 중복 키, 재검색·페이지 이동, 0건, 로컬 재주입, disabled 체크박스, 입력값 보존을 확인한다.
- 관련: [함수 선택](table-setup.md), [요청 계약](../../reference/datatables-contract.md), [좌우 목록](../screen/list-screen.md), [업로드](../screen/register-popup.md), [User 입력 표](../../reference/frontend-user.md).
