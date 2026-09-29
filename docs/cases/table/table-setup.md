# 테이블 유형별 DataTables 함수 선택

> 범위: Admin·User | 상태: 소스 대조 완료, 실행 미검증 | 근거: 양 모듈 `src/main/resources/static/js/datatables/datatables.ex.js`

테이블은 데이터 소유 위치와 API 요청 형태로 생성 함수를 선택한다. 함수 이름이나 주석만으로 페이징·정렬 동작을 판단하지 않는다.

| 만들 테이블 | 재사용 함수 | 적용 조건·실제 동작 |
|---|---|---|
| 검색·페이지 이동이 있는 서버 목록 | 양쪽 `$.fn.dataTable.grid` | 기본 10건, 서버 페이징, `searchList` 조건. 일반 목록의 기본 선택 |
| 소량의 전체 서버 목록 | 양쪽 `$.fn.dataTable.exGrid` | 요청 `page=0`, `length=2147483647`. User는 기본 페이징 off, Admin은 on이므로 필요 시 명시적으로 끈다 |
| 검색 DTO 자체를 요청 body로 받는 서버 표 | Admin `$.fn.dataTable.exGridNoSearchList` | `searchData()` 결과로 요청 객체를 대체. `searchList`로 감싸지 않음. User에는 없음 |
| 처리 표시를 숨기는 대시보드 서버 목록 | Admin `$.fn.dataTable.dashboardGrid` | 서버 페이징 유지, `processing: false`. 자동 주기 갱신 기능은 없음. User에는 없음 |
| 업로드 미리보기·선택한 항목·위저드 요약·입력 표 | 양쪽 `$.fn.dataTable.emptyGrid` | AJAX 없는 클라이언트 표. 기본 multi 선택, 페이징·정렬·info off |
| 항목명과 단일 값만 보여주는 상세 표 | 일반 HTML table | 검색·선택·행 데이터 API가 필요 없으면 DataTables를 만들지 않음 |

## 화면에서 가져올 예

경로는 모듈의 `src/main/resources/templates/` 기준이다. 함수 사용 근거는 최초작성자 표준과 별도로 조사했다.

| 용도 | 근거 화면 |
|---|---|
| 일반 목록 | admin `cloud/k8sworkload/workloadList.html`, user `k8s/workloadList.html` |
| 좌우 선택 연동 | admin `k8s/projectlist.html`: 두 `grid`와 서로 다른 검색 함수 |
| 미리보기·요약 | admin `monitoring/vmManagerManagement/bluksave.html`, `task/createtask/k8s/createnamespace/summary.html` |
| 체크박스 입력 표 | user `serviceRequest/templates/K8sNamespaceProd.html`: `emptyGrid`, `select: false` |
| 전체 조회 | admin `helpdesk/management/list.html`: `exGrid` + `bPaginate: false`, `ordering: false`; user `serviceRequest/approvalDetail.html` |
| 최상위 DTO | admin `isolationsegement/searchisolationsegement.html`: `exGridNoSearchList` |
| 대시보드 | admin `clusterManagement/clusterManagementPage.html`: `dashboardGrid` |

## 선택 후 구현 순서

1. [요청·응답 계약](../../reference/datatables-contract.md)으로 API 적합성을 확인한다. 전체 조회는 데이터량이 제한된 경우에만 선택한다.
2. `<th>` 순서와 `columns.data`, 정렬 가능 필드, null 표시, 열 너비를 맞춘다.
3. 행 선택은 목적에 맞게 `select: false / {style: 'single'} / {style: 'multi'}`를 명시한다.
4. ready에서 한 번 생성하고 검색은 [reloadGrid](table-row-operations.md), 로컬 데이터 변경은 clear/add/draw로 처리한다.
5. 생성 완료 처리는 `initComplete`, 매번 그린 뒤 처리는 `drawCallback`을 사용한다. 기본 콜백을 대체하는 경우 기존 처리도 검토한다.

## 스크립트 재사용 경계

- `datatables.js`는 라이브러리 본체, `datatables.ex.js`는 프로젝트의 생성·조회·선택·행 추가 래퍼다. 신규 화면별로 래퍼를 복제하지 않는다.
- `dataTables.select.min.js`는 행 선택, `dataTables.colResize.js`는 열 너비 조절 확장이다. 실제 사용 레이아웃의 로딩 여부를 확인한다.
- Buttons·JSZip·HTML5 버튼은 내보내기 기능의 기반이다. 메인 레이아웃에 있다고 모든 popup/wizard에 있다고 가정하지 않는다.
- Admin 메인 레이아웃에는 `buttons.print.min.js`도 포함된다. User 메인 레이아웃과 동일 구성으로 취급하지 않는다.
- `dataTables.fixedColumns.min.js`, `datetime.js` 등 파일의 존재만으로 전역 로딩·자동 적용을 가정하지 않는다.
- 엑셀은 [화면 데이터 내보내기 표준](excel-export.md)에 따라 현재 페이지의 표시 데이터를 브라우저에서 생성한다. 선택 행·숨김 열·별도 전체 조회를 구분한다.

관련: [Admin 기준](../../reference/frontend-admin.md), [User 기준](../../reference/frontend-user.md), [목록 배치](../screen/list-screen.md).
