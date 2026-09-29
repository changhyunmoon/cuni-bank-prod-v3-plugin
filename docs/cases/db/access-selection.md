# DB 접근 방식 선택 기준

> 범위: 신규 DB 코드·기존 기능 확장 | 성격: 코드 관찰을 바탕으로 정리한 신규 작성 기준

기존 기능은 사용 중인 방식을 유지하고, 새 기능은 처리 목적에 따라 선택한다.
이 프로젝트의 QueryDSL은 JPA 위에서 쿼리를 작성하는 도구다. JPA와 별개의 DB 연결 방식이 아니다.

## 어떤 상황에 무엇을 쓰는가

| 상황 | 우선 선택 | 판단 이유 |
|---|---|---|
| 기존 쿼리·저장 기능 수정 | 기존 Repository·Support·DAO 재사용 | 같은 기능을 다른 기술로 중복 구현하지 않음 |
| CMP 엔티티의 단건 조회·존재 확인·기본 저장·삭제 | Spring Data JPA Repository | 이미 정의된 엔티티·PK와 CRUD 기능 활용 |
| CMP 검색 조건·조인·정렬·페이지 조회 | QueryDSL Support | 조건을 조합하고 필요한 DTO를 조회 |
| 기존 엔티티의 화면 전용 목록 | 기존 QueryDSL Support 확장 | 화면 때문에 엔티티·매퍼를 새로 만들 필요가 없음 |
| SQL 중심 집계·DB 함수·복잡한 통계 | MyBatis DAO + XML | SQL 형태와 실행 계획을 직접 관리 |
| 배치의 업무 테이블 일괄 반영 | 기존 MyBatis DAO + XML 우선 | 배치의 서비스→DAO 패턴과 집합 연산 활용 |
| interface의 연계 테이블 반영 | 해당 기능의 Mapper 또는 Repository 유지 | 모듈 내부에도 두 방식이 공존 |
| 외부 고객 DB 조회 | ExternalDbUtil 경로 | 메인 DB와 분리된 연결·SELECT 제한 유지 |

## 실제 코드에서 확인한 패턴

- `DictionaryService`: JPA로 저장하고, `DictionarySupport`의 QueryDSL로 목록·상세·조건 삭제를 처리한다.
- `DataMonitoringService`: 테이블 종류를 허용 목록으로 분기하고 기존 Support에서 조회한다.
- `AwsEc2UsgDao`: MyBatis XML로 기간별 사용량을 집계한다.
- batch의 `BatchSampleDao`: SqlSessionTemplate으로 XML의 조회·일괄 저장을 실행한다.
- interface의 `ApprCntMapper`: `@Mapper` 인터페이스를 사용한다. DAO 클래스 패턴과 구분한다.

## 선택할 때 오해하지 말 것

- '조회는 전부 QueryDSL', '저장은 전부 JPA'는 아니다. QueryDSL 조건 삭제와 MyBatis 조회·변경이 모두 존재한다.
- 조인이 있다는 이유만으로 MyBatis로 바꾸지 않는다. SQL 기능·성능·기존 구현을 함께 판단한다.
- 데이터가 많다는 이유만으로 MyBatis가 항상 빠르다고 단정하지 않는다. 실행 SQL·계획·건수를 확인한다.
- batch의 실행 이력 등 기존 JPA 사용 영역은 유지한다. 모듈 전체를 한 기술로 통일하지 않는다.
- admin·user에는 새 DB 접근을 추가하지 않고 백엔드 API를 호출한다.
- 새 기술을 추가하거나 기존 방식을 바꿀 때는 이유와 영향 범위를 작업 결과에 남긴다.

근거: `cmp:src/main/java/kr/datasolution/cuni/basic/service/DictionaryService.java`, `datamonitoring/service/DataMonitoringService.java`, `cmp/repository/AwsEc2UsgDao.java`; batch·interface는 각 모듈의 기존 DAO·Mapper.
- 상세: [JPA](jpa.md), [QueryDSL](querydsl.md), [MyBatis](mybatis.md).
- 구현 순서·검증: [DB 코드 작성 절차](implementation.md).
