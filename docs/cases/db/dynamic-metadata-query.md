# DB 메타데이터로 테이블·컬럼을 동적으로 조회하기

> 범위: cmp MyBatis 조회 | 상태: 구현·실행 확인(CUNI-536, 2026-10-15) | 근거: cmp `CUNI-536` 브랜치(미커밋) `cmp/service/DataMonitoringService.java`, `cmp/repository/DataMonitoringDao.java`, `resources/mapper/cmp/DataMonitoringMapper.xml`
>
> 언제 읽나: 조회할 테이블이 설정·요청으로 실행 중에 정해지고, 실제 DB 컬럼을 그대로 보여 줄 때(대상에 엔티티가 있어도 해당) | 읽지 않는 경우: 고정 테이블 조회(→ [DB 접근 방식 선택](access-selection.md), 엔티티 목록은 QueryDSL Support)

구현 전에 요구사항 단계에서 대안을 함께 제시한다.
- 대상이 고정된 소수 테이블로 충분하면 기존 엔티티·Support 재사용.
- 대상은 설정으로 바뀌지만 엔티티 필드 값으로 보여 줘도 되면 JPA 메타모델 + QueryDSL `PathBuilder`.
- 이 문서의 MyBatis 방식은 DB 표현값·DB 컬럼 순서·`ctid` 정렬·엔티티 없는 테이블이 필요할 때 쓴다([선택 기준](access-selection.md)).

식별자는 허용 목록과 DB 메타데이터로 확인한 이름만 큰따옴표로 감싸 `${}`로 넣고, 값은 모두 `#{}`로 자료형을 맞춰 바인딩한다.

## 먼저 볼 것

- [MyBatis 신규 작성 기준](mybatis.md), [DB 코드 작성 순서](implementation.md), [하드코딩 경계](../display-value/hardcoding-boundary.md)(허용 목록은 코드사전·설정)

## 구현 순서

1. **허용 목록**: 조회할 테이블(과 날짜 컬럼)은 코드사전·설정 값으로 받고, 요청마다 형식·중복·존재를 검증한다. 목록에 없는 테이블 요청은 `BaseException`으로 거부한다.
2. **메타데이터**: `information_schema.columns`(`table_schema = current_schema()`, `ordinal_position` 순)에서 컬럼명·자료형을 읽는다. 요청의 컬럼·정렬 컬럼은 이 목록과 정확히 일치할 때만 쓴다.
3. **식별자**: 메타데이터에서 읽은 문자열을 `"` + 내부 `"`→`""` + `"`로 감싸 `${}`에 넣는다. 요청 문자열을 그대로 넣지 않는다.
4. **값**: 모두 `#{}`. Service에서 자료형에 맞게 변환한다. 일시 `java.sql.Timestamp`(분 단위 범위는 Java에서 `plusMinutes(1)`), 숫자 `BigDecimal`, UUID `java.util.UUID`, 문자열 `lower(t."c") = lower(#{v})`(LIKE를 쓰지 않으므로 `%`·`_`는 일반 문자).
5. **정렬**: 방향은 `asc`/`desc`만 받아 XML `<choose>`에서 고정 `ASC`/`DESC`로 쓴다. 다중 정렬 문자열(쉼표)은 거부한다.
6. **기본 정렬 키**: 기본키 제약 → 첫 유니크 인덱스(`pg_index`: `indisunique AND indisvalid AND indpred IS NULL AND indexprs IS NULL`, `indisprimary DESC, 인덱스명`) → `ctid`. 유니크 키 뒤에도 `ctid`를 붙여 동률을 고정한다.
7. **페이지**: 같은 WHERE로 `count(*)`와 `LIMIT #{limit} OFFSET #{offset}`를 따로 실행하고 Service에서 `PageImpl`을 조립한다(동적 컬럼이라 `Pagination` DTO를 쓸 수 없는 경우).

## 규칙

| 구분 | 규칙 |
|---|---|
| 지침 | 값을 `t."c"::text AS "c"`로 꺼낼 때 WHERE·ORDER BY는 테이블 별칭 `t."c"`로 쓴다. 별칭이 없으면 같은 이름의 `::text` 출력 컬럼으로 정렬돼 문자열 순서가 된다(EXPLAIN `Sort Key: ((c)::text)` vs `Sort Key: c`). |
| 지침 | 날짜 컬럼은 존재뿐 아니라 날짜 자료형(`date`·`timestamp`)인지도 검사한다. 이름만 날짜 같은 문자열 컬럼이 DB에 수십 개 있다(개발 DB 사본 이름 패턴 기준 83~108개). |
| 관찰 | MyBatis `resultType="map"`은 NULL 컬럼 키를 빼고, 모든 값이 NULL인 행은 `null` 원소로 준다(`callSettersOnNulls` 미설정). 메타데이터 컬럼 순서로 행을 다시 만들어 빈 키를 null로 채운다. 전역 MyBatis 설정은 바꾸지 않는다. |
| 관찰 | 기본키 제약 유무는 DB마다 다르다. CUNI-536 작업 DB는 0개(`*_pkey` 유니크 인덱스만), 2026-10-15 query-db 사본은 public 245개(336개 테이블 중 91개 없음). 그래서 6의 순서로 정한다. |
| 관찰 | 문장 시간 제한은 기존 `default-statement-timeout: 30`뿐이다. 큰 테이블의 `count(*)`·'전체' 조회 위험을 설계에 적는다. |

## 복사하지 않을 기존 패턴

- 테이블별로 Support·Mapper를 하드코딩해 늘리는 방식(이전 feature 브랜치 `c71af726`).
- 정렬 방향·컬럼을 요청 문자열 그대로 `${}`에 넣는 것.

## 검증 체크리스트

- [ ] 조작 요청(목록 밖 테이블, 없는 컬럼, `"; drop` 컬럼명, `sortColumn:"a,b"`, `sortOrderType:"desc; select 1"`)이 모두 거부되고 SQL 실행 로그가 없다.
- [ ] 작성한 SELECT를 예시 값으로 [query-db](../../../skills/query-db/SKILL.md) `EXPLAIN`해 Sort Key가 원래 컬럼인지 확인했다.
- [ ] 마지막 페이지까지 넘겨 행 합계 = count, 페이지 사이 중복 없음.
- [ ] NULL 값·모든 값이 NULL인 행·문자열 날짜 컬럼 설정을 확인했다(데이터가 없으면 미실행으로 기록).
