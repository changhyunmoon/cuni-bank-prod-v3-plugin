# 기능별 화면·백엔드·DB 연결 지도

기존 기능의 화면에서 DB 접근까지 따라가며 재사용 후보와 변경 영향을 찾는 진입점이다.

> 범위: 아래 대표 기능 3개 | 상태: 소스 경로 확인, 서버·DB 실행 미검증 | 확인: 2026-09-29, [소스 기준](../maintenance/source-baseline.md)

## 기능 선택

| 기능·검색 키워드 | 화면·포탈 진입점 | CMP 진입점 | 데이터 접근 | 상세 |
|---|---|---|---|---|
| User 서비스 현황·워크로드·프로젝트별 조회 | GET/POST `/user/workload-list/list`, `k8s/workloadList.html` | POST `/cmp/workload/service-status/list` | `WorkloadSupport.getServiceStatusWorkloadListPage`, QueryDSL 조인·멤버 하위 쿼리 | [워크로드 연결](flows/workload-list.md) |
| Admin 클라우드 작업관리·워크로드 목록 | GET/POST `/admin/workload-list/list`, `cloud/k8sworkload/workloadList.html` | POST `/cmp/workload/admin/list` | `WorkloadSupport.getAdminWorkloadList`, QueryDSL 조인 | [워크로드 연결](flows/workload-list.md) |
| Admin 자료사전 목록·상세·등록·수정·삭제 | GET/POST `/admin/dictionaries/list`, `/detail`, `/save`; POST `/delete` | `/basic/dictionaries`의 각 POST API | 조회·삭제 `DictionarySupport`, 저장 `DictionaryRepository` → `dictionary_tp` | [자료사전 연결](flows/dictionary-management.md) |

GET은 HTML 반환, 같은 URL의 POST는 데이터 처리다. CMP `/cmp`·`/basic`은 여기서 Controller 경로이며 포탈의 `/user`·`/admin` 컨텍스트와 구분한다.

## 따라가는 순서

1. 상세 문서에서 같은 모듈·같은 기능을 선택하고 실제 템플릿의 요청 URL·payload·응답 필드를 읽는다.
2. 포탈 Controller에서 클래스·메서드 매핑을 합친다. 세션 정보 주입과 입력 변형 여부를 확인한다.
3. Client의 호출 메서드와 `@Value` 설정 키를 찾아 `application-msa.yml`의 기본 URL·상대 경로를 합친다. 실제 프로필의 재정의도 확인한다.
4. CMP Controller → Service → Support/Repository를 추적한다. 상속 메서드는 공통 `ApiController`·`ApiService` 구현까지 확인한다.
5. 엔티티의 `@Table`·키·조인 조건으로 DB 대상을 확인한다. 명시 테이블 매핑이 없으면 엔티티 이름을 물리 테이블명으로 단정하지 않는다.
6. 같은 Client 메서드·API 경로·DTO·Support의 다른 호출자를 검색해 변경 범위를 넓힌다. 표에 있는 호출자가 전부라고 가정하지 않는다.

## 재사용과 변경 판단

| 바꾸려는 내용 | 함께 확인할 계층 |
|---|---|
| 표시 문구만 변경 | 템플릿·자료사전·해당 포탈 캐시 |
| 열 추가·필드명 변경 | 화면 columns·CMP DTO/projection·조인·기존 API 호출자 |
| 검색 조건·정렬·페이징 | searchData·공통 grid·Controller 계약·Support 조건 |
| 사용자별 조회 범위 | 세션·서버 권한·Proxy 사용자 전달·CMP 필터 |
| 등록·수정·삭제 | payload·서버 검증·트랜잭션·키/중복 처리·캐시 |

- 현재 경로를 설명하는 지도다. 기존 코드의 누락·취약한 입력 가정까지 신규 개발 표준으로 복사하지 않는다.
- 전체 기능 목록이나 전체 API 명세가 아니다. 새 기능을 조사할 때 실제 추적이 끝난 항목만 표와 상세 문서에 추가한다.
- 추가 시 화면·URL·Controller 메서드·Proxy 설정 키·CMP 메서드·DB 접근·핵심 계약·영향·근거 파일을 기록한다. 미확인 연결은 추측해서 채우지 않는다.
- 관련: [포탈 호출 규칙](backend-calls.md), [CMP 구조](../foundation/modules/cmp.md), [데이터 접근 범위](data-access.md), [docs 라우터](../README.md).
