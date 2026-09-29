# Admin 프런트엔드 개발 기준

> 범위: admin Thymeleaf 화면 | 상태: 소스 대조 완료, 실행 미검증 | 근거: [참고 화면](screen-references.md)

유승민 최초작성 이력이 확인된 Admin 화면을 유형별 개발 표준으로 사용한다. 기존 구현의 결함까지 복사하는 기준은 아니다.

| 작업 | 먼저 읽을 문서 |
|---|---|
| 기준 화면 선택·작성 순서 | [참고 화면](screen-references.md) → [공통 구조](../cases/screen/new-screen.md) |
| 일반 목록·좌우 연동 | [목록 배치](../cases/screen/list-screen.md) → [DataTables 선택](../cases/table/table-setup.md) |
| 파일 등록·미리보기 | [팝업 표준](../cases/screen/register-popup.md) → [행 조작](../cases/table/table-row-operations.md) |
| 엑셀 내보내기 | [화면 데이터 엑셀 표준](../cases/table/excel-export.md): 현재 페이지, 브라우저 생성 |
| 승인 내용 표시 | [조회 조각](../cases/screen/lookup-fragment.md) |
| 작업 생성·진행 이력 | 아래 위저드·진행 팝업 기준 |
| 제목·코드·선택 목록 | [사전 사용법](../cases/display-value/usage.md) → [Admin 등록](../cases/display-value/registration-admin.md) |

## 모듈 적용 기준

- 일반 목록은 `layout_final/layout_admin`의 `contents → section → head_option type2 → tbl-type1` 구성을 사용한다.
- 좌우 화면은 `k8s/projectlist.html`의 프로젝트 선택 → 구성원 조회 흐름을 따른다. 표마다 ID와 검색 함수를 분리한다.
- 데이터 조회·저장은 화면 → 포탈 Controller → Proxy 흐름을 유지한다. [포탈 호출](backend-calls.md)을 참고한다.
- `grid` 기본 선택은 single이다. 조회 전용은 `select: false`, 다중 작업은 `select: {style: 'multi'}`를 명시한다.
- Admin `grid`는 정렬 시 `columns.name`이 있으면 사용하고 없으면 `columns.data`를 사용한다. 표시 필드와 서버 정렬 필드가 다르면 API와 맞춘다.
- `dashboardGrid`, `exGridNoSearchList`는 Admin에만 있다. [요청 계약](datatables-contract.md)을 확인한 뒤 선택한다.

## 작업 위저드

근거: `admin:src/main/resources/templates/task/createtask/k8s/createnamespace/`의 `createk8snamespace.html`, `task.html`, `summary.html`.

1. 부모 화면은 `wizard_layout`, 단계 본문은 `basicInfo / task / summary`로 분리한다. 조각의 `layout:fragment` 이름과 부모의 `layout:replace`를 맞춘다.
2. ready에서 요약 그리드를 한 번 만들고 현재 단계·이벤트·수정 모드 데이터 로드를 준비한다.
3. 다음 단계는 `checkStep()`의 현재 단계 검증 성공 후 이동한다. 단계 표시와 제목 처리는 `setStep()`으로 모은다.
4. 요약 진입 시 `setSummaryTaskItem()`과 기존 입력 데이터로 내용을 다시 구성한다. 이전 요약 행은 비우고 `emptyGrid`에 채운다.
5. submit에서 `preventDefault()`와 최종 검증 후 `getFormData()`·`getTaskInfo()`로 요청을 만들고 `saveData()`를 호출한다.
6. 저장 성공 후 이 위저드의 `reloadTask()` → `closePopup(true, true)` 계약을 따른다. 다른 팝업에는 인자를 무조건 복사하지 않는다.

## 진행 이력 팝업

근거: `admin:src/main/resources/templates/task/viewprogresscreatek8snamespace.html` 및 [최초작성 목록](screen-references.md)의 진행 팝업 6개.

- `popup_layout_typeB`의 head/body/foot과 `grid`를 사용한다. 검색 조건에는 대상 작업 식별자를 넣는다.
- 버튼과 행 더블클릭은 동일한 상세 표시 함수로 모으고 선택 여부를 확인한다.
- 기존 코드는 `reloadHistoryFN()`에서 주기적으로 재조회하고 상세 진입 시 타이머를 해제한다.
- 신규 구현에서는 닫기·제거·재열기에도 타이머를 정리하고 중복 생성을 방지한다. 페이지 유지가 필요하면 `reloadGrid(id, false)`를 사용한다.

## 완료 확인

- 검색·선택·빈 결과·좌우 선택 해제, 위저드 이전/다음·수정 데이터·최종 저장, 팝업 닫기 이후 요청 중단을 확인한다.
- [미등록 문구 처리](../cases/display-value/temporary-value.md), [테스트 현황](../foundation/testing.md), [소스 기준](../maintenance/source-baseline.md)을 함께 적용한다.
- User 이식 시 [User 기준](frontend-user.md)을 확인한다. 외곽 CSS와 공통 JS 기본값은 동일하지 않다.
