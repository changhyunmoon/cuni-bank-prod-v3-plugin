# User 프런트엔드 개발 기준

> 범위: user Thymeleaf 화면 | 상태: 소스 대조 완료, 실행 미검증 | 근거: [참고 화면](../../../common/portal/screen-references.md)

유승민 최초작성 이력이 확인된 User 화면에서 목록·서비스 요청 입력·조회 조각의 구조를 표준으로 추출한다.

| 작업 | 먼저 읽을 문서 |
|---|---|
| 기준 파일·공통 작성 순서 | [참고 화면](../../../common/portal/screen-references.md) → [공통 구조](../../../common/portal/screen-structure.md) |
| 사용자 목록 | [목록 배치](../../../common/portal/screen-lists.md) → [DataTables 선택](../../../common/portal/datatables-selection.md) |
| 쿼타 입력·행 체크 | 아래 입력 조각 기준 → [행 조작](../../../common/portal/datatables-operations.md) |
| 엑셀 내보내기 | [화면 데이터 엑셀 표준](../../../common/portal/datatables-excel-export.md): 현재 페이지, 브라우저 생성 |
| 변경 내용 표시 | [조회 조각](../../../common/portal/screen-fragments.md) |
| 제목·코드·선택 목록 | [사전 사용법](../../../common/portal/display-value-usage.md) → [User 등록 의뢰](../display-value-registration.md) |

## 모듈 적용 기준

- 일반 페이지는 `layout_final/layout_user`를 사용한다. `k8s/workloadList.html`의 `content-area`, `tbl-top`, `tbl-type5`를 우선 참고한다.
- ready는 최초 그리드 생성·검색 이벤트 연결, 목록 함수는 열·URL·옵션, `searchData()`는 조건 반환을 담당한다.
- User `grid`에는 기본 single 선택 설정이 주석 처리되어 있다. 선택 화면은 `select: {style: 'single'}` 또는 multi를 직접 명시한다.
- User `grid`는 정렬 필드를 `columns.data`에서 얻는다. Admin의 `columns.name` 대체 규칙을 기대하지 않는다.
- `serviceRequest/k8sManagementList.html`은 `#k8sProjectGrid`, `k8sReturnManagementList.html`은 `#grid2022`를 생성하지만 검색은 인자 없는 `reloadGrid()`를 호출한다. 신규 코드에서는 실제 ID를 전달한다.
- 요청 흐름·멤버 범위는 [워크로드 기능 연결](../../../system/flows/workload-list.md)과 [데이터 접근](../../../system/data-access.md)을 함께 확인한다.

## 서비스 요청 입력 조각

근거: `user:src/main/resources/templates/serviceRequest/templates/`의 `K8sProjectEdit.html`, `K8sNamespaceEdit.html`, `K8sNamespaceProd.html`.

1. `layout:fragment="template"` 안에 script와 입력 표를 둔다. 독립 popup 레이아웃을 덧씌우지 않는다.
2. 서버에서 받은 프로젝트·관리서버 식별자로 기존 정보를 읽고 입력·표시 상태를 준비한다. 필요한 조회 완료 전에는 검증·제출을 막는다.
3. CPU·Memory 단위 선택은 코드사전을 사용한다. 비교할 때 같은 단위로 환산하고 빈 값·잘못된 값·허용 범위를 검증한다.
4. 네임스페이스 입력 표는 `emptyGrid`와 `select: false`를 사용한다. 실제 input checkbox 상태와 DataTables Select 상태를 혼용하지 않는다.
5. 동적 행 이벤트는 표에 위임한다. 선택에 따라 입력을 활성화하고 해제하면 값을 초기화한다. 운영 생성 예시는 disabled 행을 전체 선택에서 제외한다.
6. 부모가 호출하는 `validComponent()`에서 검증 성공 후 `componoentData`와 `taskData`를 구성하고 `true`를 반환한다. `componoentData`는 기존 계약의 실제 철자이므로 단독으로 이름을 바꾸지 않는다.
7. 조회 조각의 `loadComponent(data)`가 받을 객체·배열과 `taskcontents`를 맞춘다. 실패 시 후속 제출이 진행되지 않도록 부모의 반환값 검사까지 확인한다.

## 보조 참고와 복사 제외

- `k8s/k8sProjectSelectPopup.html`, `k8s/namespaceSearchPopup.html`은 작성자만 확인되며 최초작성 이력은 비어 있다. 선택 팝업의 기능 참고로만 사용한다.
- 해당 팝업은 검색·단일 선택·더블클릭 → 부모 콜백 → 닫기 순서다. 부모 콜백 이름과 데이터 형태를 대상 화면에 맞춘다.
- 문자열로 만든 input/select/HTML에 서버 값을 그대로 삽입하지 않는다. 표시 값은 `.text()` 또는 안전한 DOM 조립을 사용한다.
- 행 입력 변경은 DataTables 원본 데이터에 자동 반영되지 않는다. 저장 전 현재 입력값을 수집하거나 데이터 모델에 동기화한다.
- 행 이름·행 번호만으로 대상을 찾는 코드는 고유 ID 기준으로 보완한다. 공통 함수와 같은 이름의 화면 함수를 추가하지 않는다.

## 완료 확인

- 프로젝트 변경 후 이전 행·쿼타 초기화, 미선택·전체 선택·disabled 행, 단위 환산·빈 값, 입력→요약→조회 데이터 일치, 재열기를 확인한다.
- [미등록 문구 처리](../../../common/portal/temporary-display-values.md), [테스트 현황](../../../common/workflows/testing.md), [소스 기준](../../../source-baseline.md)을 함께 적용한다.
- [Admin 기준](../../admin/frontend/README.md)의 레이아웃·함수 기본값은 User에 그대로 적용하지 않는다.
