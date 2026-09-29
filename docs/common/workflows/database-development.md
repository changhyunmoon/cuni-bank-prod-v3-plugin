# 바이브코딩으로 DB 코드를 작성하는 순서

> 범위: DB 조회·변경 구현 | 성격: 신규 작성·리뷰 기준, 스킬에서 재사용할 원문

먼저 기존 구현과 데이터 범위를 확인하고, 기술 선택 이유·검증 결과를 남긴다.

## 구현 전

1. [선택 기준](../conventions/persistence-selection.md)으로 JPA·QueryDSL·MyBatis 사용 위치를 정한다.
2. 기존 Entity·Repository·Support·DAO·XML을 찾는다. 같은 테이블의 중복 구현을 만들지 않는다.
3. 스키마·PK·필수값·인덱스 근거를 확인한다. 없으면 미확인 사항으로 남기며 임의 스키마를 사실처럼 구현하지 않는다.
4. 입력 조건·반환 DTO·페이지·정렬·대상 프로젝트와 사용자 범위를 정한다.
5. 변경 작업은 트랜잭션 경계·영향 건수·재실행 시 동작을 정한다.

## 트랜잭션과 혼용

- Service의 업무 단위에 `@Transactional`을 적용한다. 조회 전용은 `readOnly = true`를 검토하되 쓰기 차단 장치로 간주하지 않는다.
- 같은 클래스 내부 호출만으로 새 트랜잭션 설정이 적용된다고 가정하지 않는다. Spring Bean 호출 경계를 확인한다.
- 예외를 잡고 성공으로 반환하면 의도한 롤백이 안 될 수 있다. 예외 전파와 rollback 조건을 명시한다.
- cmp·batch의 확인한 기본 transactionManager는 `JpaTransactionManager`다. MyBatis 사용만으로 새 관리자를 추가하지 않는다.
- JPA와 MyBatis를 한 업무에서 섞을 때 DataSource·SqlSessionFactory·트랜잭션 관리자 연결을 확인하고 실제 롤백으로 검증한다.
- MyBatis나 QueryDSL bulk SQL 뒤에 이미 읽은 Entity가 자동으로 최신값이 된다고 가정하지 않는다. flush·재조회·clear 순서를 검토한다.
- 다른 DB·외부 API·클라우드 작업까지 로컬 트랜잭션 하나로 되돌려진다고 가정하지 않는다. 실패 후 복구·재시도를 별도 정의한다.
- 같은 DB라고 해서 모든 경로가 같은 트랜잭션에 참여하는 것도 아니다. 연결·관리자 설정이 근거다.

## 변경에 맞는 검증

| 변경 | 확인할 사례 |
|---|---|
| 검색·페이징 | 빈 조건·잘못된 정렬·동일 정렬값·빈 결과·마지막 페이지·count 일치 |
| 저장·삭제 | 없는 ID·중복 키·부분 수정·허용 범위 밖 데이터·영향 건수 |
| 집계 | 기간 경계·NULL·중복 조인·큰 데이터의 SQL 실행 계획 |
| 일괄·혼용 | 빈 목록·분할 경계·중간 실패 롤백·재실행·변경 후 재조회 |

- 실행 환경에 맞는 DB에서 SQL·매핑을 검증한다. Mock 테스트만으로 PostgreSQL 문법·트랜잭션을 검증했다고 보고하지 않는다.
- 실제 DB에 연결할 수 없으면 컴파일·정적 확인 범위와 DB 미검증 사항을 구분한다. 검증을 위한 운영 데이터 변경은 하지 않는다.
- 완료 보고: 선택 방식·이유, 재사용한 코드, 변경 데이터 범위, 실행한 검증, 남은 확인 사항.
- 스킬·에이전트는 이 절차를 참조하도록 나중에 연결한다. 현재 자동 연결은 구성하지 않았다.

근거: cmp·batch의 `src/main/java/kr/datasolution/cuni/common/config/DatabaseConfiguration.java`, CMP의 `common/service/ApiService.java`.
동작 참고: [MyBatis-Spring 트랜잭션](https://mybatis.org/spring/transactions.html), [JPA 변경 쿼리와 컨텍스트](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.modifying-queries). 최신 API를 도입하는 근거로 사용하지 않고 Java 8·Boot 2.7의 기존 의존성을 유지한다.
- 관련: [테스트 현황](testing.md), [데이터 접근 범위](../../system/data-access.md).
