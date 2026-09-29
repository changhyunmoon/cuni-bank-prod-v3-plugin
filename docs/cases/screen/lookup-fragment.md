# 부모 화면에 넣는 조회 조각

> 범위: 서비스 요청의 변경·반납 내용 표시 | 근거: K8sProjectEditView.html, Admin K8sProjectRemoveView.html
>
> 언제 읽나: 부모 화면 안에 삽입되는 읽기 전용 조회 조각(loadComponent)을 만들 때 | 읽지 않는 경우: User 입력 조각(validComponent·componoentData → reference/frontend-user.md)

이 파일들은 독립 등록 화면이 아니라 부모 화면 안에 표시되는 읽기 전용 조각이다.

## 기본 구조

`상단 이력 → div layout:fragment="template" → script → 항목 표시용 table`

- 별도의 DOCTYPE·html·전체 레이아웃·popup-foot을 추가하지 않는다.
- 부모와 약속한 `loadComponent(data)`에서 전달 데이터를 받아 표시한다.
- 조각 안에서 같은 데이터를 다시 조회하지 않고, 추가 조회가 필요하면 부모와 책임을 먼저 정한다.
- Admin은 `tbl-type2 vertical`, User의 변경 조회 예시는 `table.no-topborder`를 사용한다.
- 항목명은 자료사전, 값은 ID가 있는 span 등에 `.text()`로 표시한다.

## 데이터 계약은 화면마다 다르다

| 참고 조각 | 전달받는 데이터 | 표시 |
|---|---|---|
| K8sProjectEditView | `data.project` 배열 | 클러스터·프로젝트·변경 전/후 CPU·Memory 쿼타 |
| K8sProjectRemoveView | `data.project` 객체 | 반납할 클러스터·프로젝트 |

- 파일명에 Edit가 있어도 이 조각 자체는 입력 폼이 아니다. 부모 화면의 용도를 확인한다.
- 변경 조회 예시는 배열을 순회해 마지막 항목을 사용한다. 신규 구현은 단건인지 여러 건인지 계약을 명시한다.
- 값이 없거나 배열이 비면 예외 대신 빈 표시·안내 등 정해진 처리를 한다.
- 숫자와 단위의 문자열 결합을 명확히 한다. 여러 값이 HTML로 합쳐질 때는 신뢰하지 않는 값을 그대로 `.html()`에 넣지 않는다.
- 열 개수·colgroup·colspan을 실제 표 구조에 맞춘다. 참고 파일의 숫자를 무조건 복사하지 않는다.
- 같은 부모에 여러 조각을 넣으면 ID와 전역 `loadComponent`가 충돌할 수 있다. 삽입 방식·동시 표시 여부를 확인한다.
- 서버가 렌더링한 조각인지, 정적 HTML인지 확인한다. Thymeleaf 표현식과 script 실행 순서가 달라질 수 있다.

## 부모와 함께 검증

- 삽입 완료 후 초기화 호출, 빈 데이터, 배열/객체 타입, 재열기, 이전 값 초기화, 변경 전후 값·단위를 확인한다.
- 기준 파일의 작성자 확인과 정확한 경로는 [참고 화면 목록](../../reference/screen-references.md)을 따른다.
- 관련: [공통 작성 순서](new-screen.md), [문구·코드 조회](../display-value/usage.md).
- 네임스페이스·워크로드처럼 전달받은 여러 행을 표시할 때는 [emptyGrid](../table/table-setup.md)를 사용하고 조회 전용 선택 여부를 명시한다. 재주입은 [행 교체 규칙](../table/table-row-operations.md)을 따른다.
- 입력 조각의 `validComponent()`·`componoentData`·`taskData` 계약은 [User frontend](../../reference/frontend-user.md)를 참고한다. 이 문서의 읽기 전용 `loadComponent()`와 역할을 구분한다.
