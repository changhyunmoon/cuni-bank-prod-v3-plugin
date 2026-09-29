# 목록 화면과 좌우 연동 화면 배치

> 범위: Admin·User 목록 | 근거: workloadList.html, Admin k8s/projectlist.html

검색과 동작 버튼은 표 위에 두고, 데이터는 공통 그리드로 표시한다.

## 모듈별 바깥 구조

| 영역 | Admin | User 참고 목록 |
|---|---|---|
| 레이아웃 | `layout_final/layout_admin` | `layout_final/layout_user` |
| 내용 | `contents → section` | `content-area` |
| 표 위 영역 | `head_option type2` | `tbl-top → tit_cont → head_option right_box` |
| 목록 표 | `tbl-type1`, `uk-table uk-table-hover` | `tbl-type5` 안의 table |

- Admin은 `head_optionLeft`에 검색 조건·검색어·검색 버튼, `head_optionRight`에 화면 동작 버튼을 둔다.
- User는 같은 API·함수 구조를 참고하더라도 Admin의 외곽 클래스까지 그대로 가져오지 않는다.
- 간격은 참고 화면의 `mt15`·`mt20`, 긴 열은 `dt-body-ellipsis`, 필요한 표 래퍼는 `scrollX`를 우선 활용한다.

## 목록 생성과 검색

1. ready에서 검색 버튼·Enter 이벤트를 연결하고 목록 생성 함수를 한 번 호출한다.
2. 목록 함수는 URL, `columns`, `columnDefs`를 구성하고 공통 `grid()`를 호출한다.
3. `searchData()`는 현재 입력값을 읽어 요청 조건만 반환한다. 여기서 별도 AJAX를 실행하지 않는다.
4. 이후 검색은 기존 그리드를 `reloadGrid(실제표ID)`로 갱신한다. 기본 ID는 `#grid`이므로 다른 ID를 사용한 단일 표도 selector를 명시한다.

- `columns.data`는 응답 필드, `<th>`는 표시 제목이다. 개수·순서와 API의 대소문자를 맞춘다.
- 검색값은 API가 받는 키로 변환한다. 참고 화면의 숫자 선택값·키 이름은 새 API의 계약으로 다시 확인한다.
- workload 참고 코드의 click + onclick 중복은 신규 화면에서 한 방식으로 정리한다.
- 긴 열은 말줄임, ID·상태 등은 용도에 따라 정렬한다. 너비는 실제 컨테이너와 작은 화면에서 검증한다.

## 좌우 연동 목록

`row → 왼쪽 col-md-4 프로젝트 목록 / 오른쪽 col-md-8 구성원 목록`

- 왼쪽 선택 → 프로젝트 ID 보관 → 오른쪽 검색 조건에 ID 포함 → 오른쪽 표 생성 또는 재조회 순서다.
- 왼쪽 초기 로딩 후 첫 행 자동 선택은 데이터가 있을 때만 수행한다.
- 선택 해제·검색 결과 0건이면 오른쪽 목록과 선택 ID를 지운다. 이전 프로젝트 결과를 남기지 않는다.
- 오른쪽 표는 최초 한 번 만들고 이후 갱신한다. 참고 코드의 `loadcount` 대신 명확한 초기화 상태를 사용해도 된다.
- 빠르게 선택을 바꿨을 때 이전 요청 응답이 새 선택을 덮어쓰지 않는지 확인한다.
- 동기화 등 동작은 선택 행을 확인한 후 요청한다. 미선택이면 알림 후 종료한다.

근거 파일 경로: [참고 화면 목록](screen-references.md). 관련: [공통 작성 순서](screen-structure.md).
- 표 종류별 함수는 [DataTables 선택](datatables-selection.md), 페이지 유지·선택·초기화는 [행 조작](datatables-operations.md), 서버 필드는 [요청 계약](datatables-contract.md)을 확인한다.
