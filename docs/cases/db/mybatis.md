# MyBatis로 SQL 중심 처리하기

> 범위: cmp·batch·interface | 성격: 기존 패턴 + 신규 작성 기준

복잡한 집계나 SQL 중심 일괄 처리는 기존 DAO·Mapper와 XML 매퍼를 확장한다.

## 모듈별 차이

| 모듈 | 확인한 호출 구조 | XML 경로 | 밑줄→camelCase 자동 변환 |
|---|---|---|---|
| cmp | Service → Dao → SqlSessionTemplate | `resources/mapper/**/*.xml` | 활성 |
| batch | Service → Dao → SqlSessionTemplate | `resources/mapper/**/*.xml` | 활성 |
| interface | Service → `@Mapper` 인터페이스 사용 예 | `resources/mappers/**/*.xml` | 비활성 |

- 경로는 `src/main/` 아래다. interface는 `mappers` 복수형이므로 다른 모듈의 경로를 그대로 복사하지 않는다.
- DAO 방식은 `NAMESPACE = XxxDao.class.getName()`과 XML namespace·statement id를 일치시킨다.
- Mapper 인터페이스 방식은 전체 인터페이스명과 XML namespace, 메서드명과 statement id를 맞춘다.

## 신규 작성 기준

- 업무 입력 검증·처리 순서·트랜잭션은 Service에, SQL 실행은 DAO·Mapper에 둔다.
- 데이터 값은 `#{...}`로 바인딩한다. 사용자 입력을 `${...}`나 문자열 덧붙이기로 SQL에 넣지 않는다.
- 테이블·열·정렬 이름은 값 바인딩과 다르다. 서버 허용 목록 또는 XML의 고정 분기로 선택한다.
- SELECT 컬럼과 INSERT 대상 컬럼을 명시한다. 샘플의 `SELECT *`·컬럼 없는 INSERT를 신규 기준으로 삼지 않는다.
- 결과 타입·별칭·resultMap을 확인한다. 특히 interface는 camelCase 자동 변환을 기대하지 않는다.
- 페이지 조회는 SQL의 limit·offset과 동일 필터의 count를 작성한다. Page 객체로 감싸기만 해서는 SQL에 페이징이 생기지 않는다.
- 집계는 시간 단위·타입 변환·NULL·중복 조인·인덱스 사용을 검증한다.
- 일괄 입력은 빈 목록을 먼저 처리하고, 건수·파라미터 한도에 맞춰 분할한다.
- UPDATE·DELETE는 필수 조건과 영향 건수를 확인한다. 전체 삭제 후 재적재는 의도·실패 복구·트랜잭션을 별도 설계한다.
- 메인 DB는 기존 SqlSessionTemplate을 사용한다. 외부 DB는 ExternalDbUtil의 SELECT 제한을 유지한다.
- 관리되는 SqlSession에 수동 commit·rollback·close를 추가하지 않는다. [MyBatis-Spring 트랜잭션](https://mybatis.org/spring/transactions.html)을 따른다.

## 참고할 실제 구현

- 집계: `cmp:src/main/java/kr/datasolution/cuni/cmp/repository/AwsEc2UsgDao.java`와 `src/main/resources/mapper/cmp/AwsEc2UsgMapper.xml`.
- 일괄 입력 구조: `batch:src/main/java/kr/datasolution/cuni/sample/repository/BatchSampleDao.java`와 `src/main/resources/mapper/sample/BatchSampleMapper.xml`.
- Mapper 인터페이스: `interface:src/main/java/kr/datasolution/cuni/cmpinterface/repository/ApprCntMapper.java`와 `src/main/resources/mappers/cmpinterface/apprcntMapper.xml`.
- 설정 근거: 각 모듈 `src/main/resources/application-datasource.yml`.
- 관련: [선택 기준](access-selection.md), [트랜잭션·검증](implementation.md).
