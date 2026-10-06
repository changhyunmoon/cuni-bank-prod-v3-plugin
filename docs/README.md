# docs 라우터

스킬·에이전트·개발자는 이 파일에서 **뼈대 → 해당 케이스 문서** 순으로 필요한 것만 연다. 문서를 일괄 로드하지 않는다.

## 사용 순서

1. 작업을 시작하거나 재개하면 [뼈대](#뼈대-foundation) 중 작업과 관련된 문서를 읽는다. 작업 대상 모듈과 저장소는 항상 [프로젝트 지도](foundation/project-map.md)로 확인한다.
2. [케이스 트리거 표](#케이스-트리거-cases)에서 이번 작업에 해당하는 행을 **모두** 고른다. 예를 들어 "목록 화면 + 엑셀 + 새 API"는 세 행에 해당한다.
3. 케이스 문서 맨 위의 `언제 읽나 / 읽지 않는 경우`로 적용 여부를 확인한 뒤 본문을 따른다.
4. 케이스 문서가 링크하는 [reference](#공유-계약-reference)는 해당 내용이 필요할 때만 연다.
5. 표에 없는 작업이면 뼈대와 실제 소스로 진행하고, 반복될 작업이면 [문서 반영 기준](maintenance/document-rules.md)에 따라 케이스 문서를 추가한다.

## 뼈대 (foundation)

모든 작업의 전제다. 규칙보다 구조·경계를 담는다.

| 문서 | 답하는 질문 |
|---|---|
| [project-map.md](foundation/project-map.md) | 5개 독립 저장소, 모듈 역할, 포트·컨텍스트 |
| [architecture.md](foundation/architecture.md) | 포탈·CMP·배치·연계의 책임과 전체 흐름 |
| [modules/cmp.md](foundation/modules/cmp.md) · [batch.md](foundation/modules/batch.md) · [interface.md](foundation/modules/interface.md) | 모듈 내부 구조 (해당 모듈을 수정할 때) |
| [coding-rules.md](foundation/coding-rules.md) | 지침·기존 규칙·범용 규칙의 우선순위, Java 8 제약 |
| [configuration.md](foundation/configuration.md) | application 파일, 프로필, 서비스 경로, 시크릿 |
| [build-and-run.md](foundation/build-and-run.md) · [testing.md](foundation/testing.md) | 빌드·로컬 실행, 테스트 위치·실행 |
| [commit-conventions.md](foundation/commit-conventions.md) | 커밋 위치·브랜치·메시지 (커밋할 때) |

## 케이스 트리거 (cases)

| 이럴 때 | 케이스 문서 | 함께 볼 reference |
|---|---|---|
| 새 화면 파일 작성, 화면 스크립트 구조 변경 | [screen/new-screen.md](cases/screen/new-screen.md) | 대상 모듈 [frontend-admin](reference/frontend-admin.md) / [frontend-user](reference/frontend-user.md), [screen-references](reference/screen-references.md) |
| 검색+표 목록, 좌우 연동 목록 | [screen/list-screen.md](cases/screen/list-screen.md) | screen-references |
| 등록·수정 팝업, 파일 업로드·미리보기 | [screen/register-popup.md](cases/screen/register-popup.md) | screen-references |
| 부모 화면에 넣는 읽기 전용 조회 조각 | [screen/lookup-fragment.md](cases/screen/lookup-fragment.md) | screen-references |
| 새 DataTables 표 생성 | [table/table-setup.md](cases/table/table-setup.md) | [datatables-contract](reference/datatables-contract.md) |
| 표 재조회·선택·행 추가·전체 선택 | [table/table-row-operations.md](cases/table/table-row-operations.md) | datatables-contract |
| **엑셀 내려받기** | [table/excel-export.md](cases/table/excel-export.md) | datatables-contract |
| 화면·코드에서 사전·코드·설정 값 사용 | [display-value/usage.md](cases/display-value/usage.md) | [display-values](reference/display-values.md) |
| 사용할 값이 미등록·미확인 | [display-value/temporary-value.md](cases/display-value/temporary-value.md) | display-values |
| 작업 종료 시 값 등록 안내 (Admin / User) | [registration-admin.md](cases/display-value/registration-admin.md) / [registration-user.md](cases/display-value/registration-user.md) | display-values |
| 등록한 값이 화면에 반영되지 않음 | [display-value/cache-refresh.md](cases/display-value/cache-refresh.md) | [flows/dictionary-management](reference/flows/dictionary-management.md) |
| 포탈에서 백엔드 API 호출 추가 | — (reference만) | [backend-calls](reference/backend-calls.md) |
| cmp에 새 REST API 추가·계약 변경 | [backend/cmp-new-api.md](cases/backend/cmp-new-api.md) | backend-calls, [data-access](reference/data-access.md) |
| 새 DB 조회·저장 코드 (기술 선택) | [db/access-selection.md](cases/db/access-selection.md) → [jpa](cases/db/jpa.md) / [querydsl](cases/db/querydsl.md) / [mybatis](cases/db/mybatis.md) | data-access |
| DB 구현·리뷰 순서, 트랜잭션·검증 | [db/implementation.md](cases/db/implementation.md) | data-access |
| 로그인·메뉴 권한·사용자별 데이터 범위 | — (reference만) | data-access |
| 기존 기능 재사용·수정 영향 조사 | — (reference만) | [feature-map](reference/feature-map.md) → 해당 flows 문서 |

## 공유 계약 (reference)

여러 케이스가 링크로 참조하는 사실·계약이다. 케이스 문서에 내용을 복사하지 않는다.

| 문서 | 내용 |
|---|---|
| [screen-references.md](reference/screen-references.md) | 화면 유형별 기준 참고 파일(유승민 최초작성) |
| [frontend-admin.md](reference/frontend-admin.md) · [frontend-user.md](reference/frontend-user.md) | 모듈별 레이아웃·공통 함수 차이, 위저드·입력 조각 |
| [datatables-contract.md](reference/datatables-contract.md) | 공통 래퍼의 요청·응답·옵션 계약 |
| [display-values.md](reference/display-values.md) | 자료사전·코드사전·설정 개념과 저장 위치 |
| [backend-calls.md](reference/backend-calls.md) | 포탈 proxy·BaseProxy·ResultData |
| [data-access.md](reference/data-access.md) | DB 변경 경로, 메뉴 역할·프로젝트 역할 |
| [feature-map.md](reference/feature-map.md) | 기능별 화면→CMP→DB 연결 지도 |
| [flows/workload-list.md](reference/flows/workload-list.md) · [flows/dictionary-management.md](reference/flows/dictionary-management.md) | 워크로드 목록·자료사전 관리의 실제 호출 흐름 |

## 유지보수 (maintenance)

- [document-rules.md](maintenance/document-rules.md): 분석 자료 반영, 문서 분류(뼈대·케이스·reference) 기준
- [source-baseline.md](maintenance/source-baseline.md): 문서 검증 시점의 커밋·범위·미검증 사항
- 텍스트 자료나 업무 코드에서 정보를 추출해 docs에 반영할 때는 [update-docs 스킬](../skills/update-docs/SKILL.md)을 쓴다.

## 라우터 유지 규칙

- 케이스 문서를 추가·이동·삭제하면 같은 작업에서 트리거 표와 스킬·에이전트 참조를 갱신한다. 모든 `cases/` 파일은 트리거 표에 한 번 이상 나와야 한다.
- 문서 선택 매핑은 이 파일에만 둔다. 스킬·에이전트에는 이 파일로 가는 링크만 두고 별도 매핑표를 만들지 않는다.
- 본문 규칙·예제는 이 파일에 복사하지 않는다.
