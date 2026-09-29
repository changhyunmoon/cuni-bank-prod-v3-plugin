# CMP의 업무 처리와 DB 접근

> 범위: cmp | 상태: 대표 계층·설정 확인

CMP는 여러 업무 영역을 하나의 Spring Boot 애플리케이션에서 제공하는 백엔드다.

## 코드를 찾는 순서

| 계층 | 하는 일 | 기본 위치 |
|---|---|---|
| Controller | 요청을 받아 서비스에 전달 | `<domain>/controller` |
| Service | 업무 규칙·처리 순서·트랜잭션 | `<domain>/service` |
| Repository·매퍼 | DB 조회·저장 | `<domain>/repository`, `resources/mapper/` |
| Entity·DTO | 저장 모델·전달 데이터 | `<domain>/domain`, `<domain>/dto` |

- 기준 패키지는 `kr.datasolution.cuni`다. `cmp`, `basic`, `member`, `approval`, `vra`, `pas` 등으로 나뉜다.
- REST Controller는 공통 `ApiController`를 사용하는 패턴이며 응답은 주로 `ResultData<T>`다.
- 클라우드 연동은 `thirdparty`, `hyperv`, `openstack`, `rancher`, `terraform` 등 관련 영역에서 찾는다. 패키지 구조는 영역마다 다르다.

## DB 구현 선택

- PostgreSQL에 JPA/Hibernate와 MyBatis를 함께 사용한다. 변경 대상 기능이 이미 사용하는 방식을 먼저 따른다.
- `application-datasource.yml`에 `CustomPostgreSQLDialect`, Hibernate `jdbc.batch_size: 500`이 설정되어 있다.
- MyBatis 매퍼 경로는 `classpath:mapper/**/*.xml`, 밑줄 이름을 camelCase로 바꾸는 설정은 활성화되어 있다.
- QueryDSL 생성·빌드 방법은 [빌드 가이드](../build-and-run.md)를 따른다.
- 모든 DB 변경이 CMP에 모이는 것은 아니다. batch·interface의 직접 변경 경로도 영향 범위에 포함한다.

## 변경 전에 확인

- 컨트롤러 입력 → 서비스 규칙 → DB 변경 → 외부 호출 순서로 추적한다.
- 사용자·프로젝트 ID가 있다는 이유만으로 권한 검사가 끝났다고 판단하지 않는다.
- 포탈과 배치 등 호출자가 여럿이면 각각의 요청 데이터 계약을 확인한다.

근거: `cmp:src/main/java/kr/datasolution/cuni/basic/controller/DictionaryController.java`, `basic/service/DictionaryService.java`, `src/main/resources/application-datasource.yml`.
- 관련: [전체 구조](../architecture.md), [데이터 접근 범위](../../reference/data-access.md).
- DB 구현: [기술 선택 기준](../../cases/db/access-selection.md), [DB 코드 작성 절차](../../cases/db/implementation.md).
