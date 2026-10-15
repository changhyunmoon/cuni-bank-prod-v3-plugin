# DB 접근 방식 선택 기준

> 범위: 신규 DB 코드·기존 기능 확장 | 성격: 코드 관찰을 바탕으로 정리한 신규 작성 기준
>
> 언제 읽나: 새 DB 조회·저장 코드를 쓰기 전 JPA·QueryDSL·MyBatis 중 무엇을 쓸지 정할 때 | 읽지 않는 경우: 이미 정해진 Repository·Support·DAO를 그대로 고칠 때

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
| 조회 대상 테이블을 설정으로 고르고 실제 DB 컬럼을 그대로 보여 줌(대상 엔티티가 실행 중에 정해짐) | MyBatis DAO + XML, [동적 조회](dynamic-metadata-query.md) | DB 표현값(`::text`)·DB 컬럼 순서·`ctid` 정렬·엔티티 없는 테이블이 필요할 때. 그렇지 않으면 JPA 메타모델 + QueryDSL `PathBuilder` 방식과, 대상이 고정된 소수일 때의 기존 엔티티·Support 재사용을 대안으로 함께 제시한다 |
| 배치의 업무 테이블 일괄 반영 | 기존 MyBatis DAO + XML 우선 | 배치의 서비스→DAO 패턴과 집합 연산 활용 |
| interface의 연계 테이블 반영 | 해당 기능의 Mapper 또는 Repository 유지 | 모듈 내부에도 두 방식이 공존 |
| 외부 고객 DB 조회 | ExternalDbUtil 경로 | 메인 DB와 분리된 연결·SELECT 제한 유지 |

## 실제 코드에서 확인한 패턴

- `DictionaryService`: JPA로 저장하고, `DictionarySupport`의 QueryDSL로 목록·상세·조건 삭제를 처리한다.
- `DataMonitoringService`는 두 구현이 있고, 둘 다 `development`에는 없다.
  - 이전 구현(cmp `feature/cloud-data-monitoring-v5`, c71af726): 고정 테이블 3개를 기존 Support(`VmSupport`·`CiInformationSupport`·`ProjectVraUuidSupport`)로 분기해 조회한다. 기존 구조를 재사용하지만 대상을 추가하려면 코드를 고쳐야 한다.
  - CUNI-536(cmp `CUNI-536`, 미커밋): 코드사전에 적힌 테이블을 MyBatis로 동적 조회한다. 대상 테이블(`virtualvm`·`code_tp`·`menu_tp`)에는 엔티티가 있다. 그래도 MyBatis를 쓴 이유는 요구사항이 DB 값을 그대로 보여 주는 것이기 때문이다(실제 DB 컬럼·순서, `::text` 표현, NULL과 빈 문자열 구분, `ctid` 동률 정렬). QueryDSL로 할 수 없어서가 아니라 설계 판단이었고, JPA·QueryDSL 대안과 비교해 승인받지는 않았다.
- `AwsEc2UsgDao`: MyBatis XML로 기간별 사용량을 집계한다.
- batch의 `BatchSampleDao`: SqlSessionTemplate으로 XML의 조회·일괄 저장을 실행한다.
- interface의 `ApprCntMapper`: `@Mapper` 인터페이스를 사용한다. DAO 클래스 패턴과 구분한다.

## 선택할 때 오해하지 말 것

- '조회는 전부 QueryDSL', '저장은 전부 JPA'는 아니다. QueryDSL 조건 삭제와 MyBatis 조회·변경이 모두 존재한다.
- 엔티티가 있으면 일반 조회는 JPA·QueryDSL이다. Q클래스는 빌드 때 `compileQuerydsl`이 모든 엔티티에 대해 생성한다(cmp `build/generated/querydsl`). 조회할 엔티티가 실행 중에 정해져도 JPA 메타모델(`getMetamodel().getEntities()`)로 `@Table` 이름에 맞는 엔티티를 찾고 `PathBuilder`로 컬럼을 문자열 이름으로 지정하면 테이블별 분기 없이 조회할 수 있다. 다만 이 방식의 기존 사례는 cmp에 없다. `ScriptSupport.java:213`의 `PathBuilder`는 고정 엔티티의 동적 정렬이다.
- 이 방식의 한계: 결과는 엔티티 객체라 DB 표현값으로 다시 바꿔야 한다. 컬럼 순서는 DB 순서가 아니고, 매핑되지 않은 컬럼은 빠진다. `ctid`를 쓸 수 없고, 연관관계 조회가 추가될 수 있으며, 엔티티 없는 테이블(DB 336개 중 엔티티 183개)은 대상이 될 수 없다. 이런 요구가 있을 때만 MyBatis를 쓴다.
- JPA native query(`createNativeQuery`, `DailyVmStatusHistorySupport.java:138` 등 5개 파일)도 SQL을 직접 실행한다. 다만 기존 사용처는 결과를 엔티티로 받고 SQL을 문자열 연결로 만든다. 값 바인딩·XML 분기가 필요한 새 SQL 조회는 MyBatis를 쓴다.
- 조인이 있다는 이유만으로 MyBatis로 바꾸지 않는다. SQL 기능·성능·기존 구현을 함께 판단한다.
- 데이터가 많다는 이유만으로 MyBatis가 항상 빠르다고 단정하지 않는다. 실행 SQL·계획·건수를 확인한다.
- batch의 실행 이력 등 기존 JPA 사용 영역은 유지한다. 모듈 전체를 한 기술로 통일하지 않는다.
- admin·user에는 새 DB 접근을 추가하지 않고 백엔드 API를 호출한다.
- 새 기술을 추가하거나 기존 방식을 바꿀 때는 이유와 영향 범위를 작업 결과에 남긴다.

근거: `cmp:src/main/java/kr/datasolution/cuni/basic/service/DictionaryService.java`, `cmp/service/DataMonitoringService.java`(feature 브랜치, 커밋 c71af726), `cmp/repository/AwsEc2UsgDao.java`; batch·interface는 각 모듈의 기존 DAO·Mapper.
- 상세: [JPA](jpa.md), [QueryDSL](querydsl.md), [MyBatis](mybatis.md).
- 구현 순서·검증: [DB 코드 작성 절차](implementation.md).
