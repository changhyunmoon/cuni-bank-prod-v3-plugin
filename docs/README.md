# docs 문서 지도

스킬·에이전트·문서 작성자는 이 지도를 먼저 읽고 작업에 필요한 문서만 선택한다.
`project-map.md`는 업무 저장소 지도이며, 이 파일은 docs 문서 탐색의 진입점이다.

## 탐색·연결 순서

1. 아래 표에서 작업의 키워드와 적용 범위를 확인한다.
2. 후보 문서 본문을 읽어 적용 조건과 현재 상태를 확인한 뒤 사용·연결한다.
3. 문서의 관련 링크는 해당 작업에 필요한 경우에만 따라간다. 모든 문서를 일괄 로드하지 않는다.
4. 지도에 없거나 경로가 깨진 경우에만 파일 목록·관련 키워드를 검색하고 지도를 보완한다.
5. 다른 문서·스킬에서 연결할 때는 아래 경로를 링크 작성 파일 기준 상대 경로로 변환한다.

## 문서 목록

경로는 `docs/` 기준이다. 실제 작성된 문서만 등록하며 이 지도 자체는 목록에서 제외한다.

| 문서 경로 | 적용 범위 | 찾을 때의 질문·키워드 |
|---|---|---|
| [project-map.md](project-map.md) | 5개 업무 모듈 | 독립 Git 저장소, 역할, 애플리케이션, 포트·컨텍스트 |
| [source-baseline.md](source-baseline.md) | 문서 검증 기준 | 확인 커밋·날짜, 작업 트리, 조사 범위·미검증 사항 |
| [common/portal/screen-references.md](common/portal/screen-references.md) | 화면 참고 선택 | 유승민 최초작성 기준, 참고 파일·유형·모듈 |
| [common/portal/screen-structure.md](common/portal/screen-structure.md) | 화면 작성 공통 | 헤더·script·ready·함수·HTML 순서, 이벤트·공통 함수 |
| [common/portal/screen-lists.md](common/portal/screen-lists.md) | 목록·좌우 화면 | 검색·버튼·표 배치, Admin/User 차이, 선택 연동 |
| [common/portal/screen-popups.md](common/portal/screen-popups.md) | 등록 팝업 | 헤더·본문·버튼, 파일 업로드·미리보기·저장 |
| [common/portal/screen-fragments.md](common/portal/screen-fragments.md) | 조회 조각 | loadComponent, 변경 전후·반납, 부모 데이터 계약 |
| [modules/admin/frontend/README.md](modules/admin/frontend/README.md) | Admin frontend 표준 | 유승민 최초작성, 목록·위저드·진행 팝업, 모듈 적용 |
| [modules/user/frontend/README.md](modules/user/frontend/README.md) | User frontend 표준 | 유승민 최초작성, 입력 조각·체크박스·쿼타·부모 계약 |
| [common/portal/datatables-selection.md](common/portal/datatables-selection.md) | 테이블 함수 선택 | grid·exGrid·emptyGrid·dashboardGrid·exGridNoSearchList, JS 역할 |
| [common/portal/datatables-contract.md](common/portal/datatables-contract.md) | 서버 표 구현 | 인자·POST·searchList·응답·정렬·얕은 옵션 병합, 모듈 차이 |
| [common/portal/datatables-operations.md](common/portal/datatables-operations.md) | 표 조작 | 재조회·페이지 유지·선택·행 추가·중복·전체 선택, 함수 제한 |
| [common/portal/datatables-excel-export.md](common/portal/datatables-excel-export.md) | 엑셀 내보내기 표준 | excelHtml5·JSZip, 현재 페이지·표시 열, 선택 무시, 브라우저 생성 |
| [system/architecture.md](system/architecture.md) | 5개 모듈 | 전체 흐름, 포탈·CMP·배치·연계의 책임 |
| [system/feature-map.md](system/feature-map.md) | 대표 기능별 연결 지도 | 기존 기능 재사용, 화면 → Controller → Proxy → CMP → DB, 변경 영향 |
| [system/flows/workload-list.md](system/flows/workload-list.md) | User·Admin 워크로드 목록 | 서비스 현황, API 분기, 검색·페이징·멤버 범위, QueryDSL 조인 |
| [system/flows/dictionary-management.md](system/flows/dictionary-management.md) | Admin 자료사전 관리 | 목록·상세·등록·수정·삭제, 언어별 payload, JPA 저장·캐시 |
| [common/portal/backend-calls.md](common/portal/backend-calls.md) | admin·user | proxy, BaseProxy, URL 설정, ResultData, 사용자 정보 전달 |
| [modules/cmp/architecture.md](modules/cmp/architecture.md) | cmp | Controller·Service·Repository, JPA·MyBatis, 도메인 위치 |
| [modules/cmp/conventions/api-development.md](modules/cmp/conventions/api-development.md) | cmp 신규 API | URL·Controller 패턴, 응답·오류 계약, 입력 검증 활성화 여부, 트랜잭션 |
| [modules/batch/architecture.md](modules/batch/architecture.md) | batch | Tasklet, 스케줄러, 관리 API, 메인·외부 DB 차이 |
| [modules/interface/architecture.md](modules/interface/architecture.md) | interface | 망 간 전송, TCP 설정, 프로필, 삭제·재적재 |
| [system/data-access.md](system/data-access.md) | DB·프로젝트 역할 | 직접 DB 접근, 메뉴 역할과 프로젝트 역할, 소유권 검증 |
| [common/configuration.md](common/configuration.md) | 모듈별 설정 | application 파일, 프로필, 서비스 경로, Jasypt·시크릿 |
| [common/conventions/persistence-selection.md](common/conventions/persistence-selection.md) | DB 기술 선택 | JPA·QueryDSL·MyBatis 사용 상황, 기존 방식 재사용 |
| [common/conventions/jpa.md](common/conventions/jpa.md) | 기본 CRUD | Repository, 엔티티·PK, 부분 수정·저장·삭제 |
| [common/conventions/querydsl.md](common/conventions/querydsl.md) | 동적 조회 | Support, 검색·정렬·DTO·페이지·count, 조건 변경 |
| [common/conventions/mybatis.md](common/conventions/mybatis.md) | SQL 중심 처리 | DAO·Mapper·XML, 집계·일괄 작업, 모듈별 매핑 차이 |
| [common/conventions/general-coding-rules.md](common/conventions/general-coding-rules.md) | 코드 작성 공통 | 범용 코딩 규칙 적용 여부, Java 8 제약, 우선순위, 함수·파일 길이, 예외·설정·검증 |
| [common/workflows/commit-conventions.md](common/workflows/commit-conventions.md) | 5개 업무 저장소 Git | 커밋 위치·브랜치, 메시지 형식 `Feat:`·`Fix:`, 자동 커밋 금지 |
| [common/workflows/database-development.md](common/workflows/database-development.md) | DB 구현·리뷰 | 구현 순서, 트랜잭션, 혼용, 롤백·SQL 검증 |
| [common/workflows/build-and-run.md](common/workflows/build-and-run.md) | 5개 업무 모듈 | Gradle, Nexus, 인증서, QueryDSL, 빌드·로컬 실행 |
| [common/workflows/testing.md](common/workflows/testing.md) | 5개 업무 모듈 | 테스트 위치, JUnit, Playwright, 실행 전제·결과 확인 |
| [common/portal/display-values.md](common/portal/display-values.md) | Admin 중심 포탈 | 자료사전·코드사전·설정 중 어디에 저장하는가, 키·언어 |
| [common/portal/display-value-usage.md](common/portal/display-value-usage.md) | Admin 구현 기준 | cacheManager, Thymeleaf, pageTitle, 열 제목, 선택 목록·코드 변환 |
| [common/portal/temporary-display-values.md](common/portal/temporary-display-values.md) | 사전·설정 사용 작업 | 미등록 값, 임시값, 실제 코드 주석, 종료 시 등록 안내·전환 |
| [modules/admin/display-value-registration.md](modules/admin/display-value-registration.md) | Admin 관리 화면 | 등록·수정 경로, 입력 항목, 언어·순서·사용 여부 |
| [modules/user/display-value-registration.md](modules/user/display-value-registration.md) | User 포탈 개발 | User용 값 등록 의뢰·조회 연결, 사용자 언어, User 캐시 반영 |
| [system/flows/display-value-cache.md](system/flows/display-value-cache.md) | 모듈 간 캐시 반영 | 저장 후 미반영, 캐시 초기화, 인스턴스·모듈별 갱신 |
| [maintenance/document-rules.md](maintenance/document-rules.md) | 문서 유지보수 | 제공 자료 선별, 코드 대조, 중복 방지, 문서·지도 갱신 |

## 작업별 읽기 경로

- 신규 화면의 문구·코드 연결: 개념 → 코드 사용법 → 등록 가이드. 미등록·미확인이면 임시값 가이드를 추가한다.
- 기존 기능 재사용·수정 영향 조사: 기능별 연결 지도 → 해당 기능 상세 → 포탈 호출·CMP 구조 → 권한·데이터 접근. 지도에 없는 기능은 실제 소스를 추적해 보완한다.
- 화면 배치·구현: Admin / User frontend → 화면 참고 선택 → 공통 작성 순서 → 목록 / 팝업 / 조회 조각. 문구는 사전·임시값 규칙을 함께 적용한다.
- 테이블 구현: DataTables 함수 선택 → 요청·응답 계약 → 재조회·선택·행 조작. 모듈별 기본값과 실제 API를 확인한다.
- 엑셀 내보내기 구현: 화면 데이터 엑셀 표준 → 대상 모듈 레이아웃·그리드 옵션 확인 → 현재 페이지·표시값·추가 조회 없음 검증.
- 등록한 값이 보이지 않음: 등록 가이드 → 캐시 반영. 키·언어·조회 방식 문제면 코드 사용법을 추가한다.
- 빌드·테스트 작업: 프로젝트 지도 → 빌드 가이드 → 테스트 현황.
- API 구현: 전체 구조 → 포탈 proxy 또는 CMP 구조·신규 API 작성 규칙 → 데이터 접근 범위.
- 배치·망 연계 수정: 해당 모듈 구조 → 설정 파일 → DB 변경 범위.
- DB 코드 작성: DB 기술 선택 → 선택한 기술의 규칙 → DB 코드 작성 절차. 사용자 데이터이면 접근 범위도 확인한다.
- 코드 작성 공통 판단: 범용 코딩 규칙 적용 범위 → 해당 주제 규칙(API·DB·화면). 커밋 전에는 커밋·브랜치 규칙을 확인한다.
- 분석 자료 문서화: 문서 반영 기준 → 해당 주제의 기존 문서 → 소스 기준·지도 갱신.

## 지도 유지 규칙

- 문서 추가·이동·삭제·책임 변경 시 같은 작업에서 해당 행과 읽기 경로·참조 링크를 갱신한다.
- 본문 규칙·예제는 지도에 복사하지 않는다. 경로·범위·선택 기준만 유지한다.
- 문서가 많아지면 영역별 지도로 나누고 이 지도에는 하위 지도와 선택 기준을 남긴다.
- 스킬·에이전트에는 필요 시 `docs/README.md`를 먼저 읽도록 연결한다. 현재 자동 연결은 구성하지 않았다.
