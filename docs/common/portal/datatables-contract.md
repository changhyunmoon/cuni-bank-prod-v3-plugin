# DataTables 요청·응답과 옵션 계약

> 범위: Admin·User 서버 표 | 상태: 소스 대조 완료, 실행 미검증 | 근거: 양 모듈 `src/main/resources/static/js/datatables/datatables.ex.js`

공통 래퍼가 만드는 요청·응답 변환을 유지하고 화면에서는 열·선택·검색 조건을 정의한다.

## 생성 함수의 인자

- 서버 표: `$.fn.dataTable.grid(id, url, extendsOptions, searchData, callback)`; exGrid·Admin 전용 함수도 같은 인자 순서다.
- 로컬 표: `$.fn.dataTable.emptyGrid(id, extendsOptions)`.
- 반환값은 DataTables API 인스턴스다. 반복 생성하지 말고 참조를 보관한다.
- `grid`, `dashboardGrid`, User `exGrid`는 `searchData()`를 직접 호출한다. 조건이 없어도 `() => ({})`를 전달한다.
- Admin `exGrid`, `exGridNoSearchList`만 검색 함수 null 여부를 검사한다.

## 요청과 응답

| 항목 | 실제 계약 |
|---|---|
| 전송 | JSON POST, `addAntiForgeryToken(d)` 후 `JSON.stringify(d)` |
| grid·dashboardGrid | DataTables 요청에 0부터 시작하는 `page`, `searchList` 추가 |
| 정렬 | `sort: {SortColumn, SortOrderType}` 및 `sortColumn`, `sortOrderType` 추가. 여러 열이어도 방향은 첫 order의 dir을 공통 사용 |
| 정렬 필드 | Admin grid만 `columns.name` 우선. User grid·Admin dashboardGrid는 `columns.data` 사용. `rownumber`만의 정렬은 추가 변환 제외 |
| exGrid | `page=0`, `length=2147483647`, `searchList`; grid와 같은 sort 변환 코드는 없음 |
| exGridNoSearchList | 검색 함수가 있으면 그 결과가 body. 기본 DataTables 필드·page·length가 보존되거나 자동 추가된다고 가정하지 않음 |
| 표준 응답 | `{result: {content: [...], totalElements: N}}`를 `data`, `recordsTotal`, `recordsFiltered`로 변환 |
| 배열 응답 차이 | Admin grid·양쪽 exGrid·Admin exGridNoSearchList에 result fallback 코드가 있으나 배열의 totalElements는 보장되지 않음. User grid는 content만 사용 |
| dashboardGrid 응답 | result.content가 배열이 아니면 빈 배열, totalElements가 숫자가 아니면 content 길이. 변환 결과는 data와 두 count만 반환 |

- 공통 기본 계약은 content 배열과 정확한 totalElements를 반환하는 형태로 맞춘다. 배열 fallback을 모든 함수의 보장된 지원으로 간주하지 않는다.
- `exGrid`의 주석은 no paging/no ordering이지만 Admin 기본 `bPaginate`는 true이고 양쪽 모두 `ordering: false`가 없다. 전체 목록 UI가 필요하면 직접 지정한다.
- `grid`의 전체 길이 옵션도 큰 요청을 발생시킨다. UI의 전체 선택과 전체 서버 데이터 조회는 별개다.

## 옵션 확장 시 주의

- 옵션 병합은 `$.extend({}, options, extendsOptions)`의 얕은 병합이다. `ajax`, `language`, `select` 같은 객체는 통째로 교체된다.
- `ajax` 일부만 넘기면 POST·토큰·검색·응답 변환까지 사라질 수 있다. 먼저 기존 계약에 API를 맞출 수 있는지 확인한다.
- 5번째 `callback`은 `ajax.success`에 연결된다. 일반적인 “렌더 완료 콜백”으로 사용하지 않는다. 래핑된 DataTables 내부 처리와 충돌 여부를 확인한다.
- 새 화면은 `initComplete`·`drawCallback` 등 목적에 맞는 훅을 쓰되, initComplete 대체 시 기본 길이 선택 처리도 대체됨을 안다.
- 언어 URL은 Admin `/admin/js/datatables/cultures/Korean.json`, User `/user/js/datatables/cultures/Korean.json`이다.
- 공통 그리드 오류 알림은 User에서 `xhr.responseJSON` 존재 조건이 있다. 모든 네트워크 실패에 안내가 표시된다고 가정하지 않는다.

## 적용 확인

- 검색 1회당 요청 1회, page·length·searchList/body 위치, 정렬 키·방향, 결과 수·0건, 실패 후 상태를 네트워크 탭에서 확인한다.
- 원래 래퍼가 응답 draw를 보존하는지까지 포함해 빠른 연속 검색의 응답 순서를 검증한다. dashboardGrid 변환은 원래 응답 전체를 보존하지 않는다.
- 관련: [함수 선택](datatables-selection.md), [행 조작](datatables-operations.md), [포탈 호출](backend-calls.md), [워크로드 API 흐름](../../system/flows/workload-list.md).
