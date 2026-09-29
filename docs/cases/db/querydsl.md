# QueryDSL로 검색·페이지 조회하기

> 범위: JPA 기반 Support 클래스 | 성격: 기존 패턴 + 신규 작성 기준
>
> 언제 읽나: 검색 조건·조인·정렬·페이지 목록을 Support 클래스에 구현할 때 | 읽지 않는 경우: SQL 중심 집계·DB 함수(→ mybatis.md)

검색 조건이 달라지는 목록이나 여러 엔티티를 묶는 조회는 기존 `XxxSupport`에서 구현한다.

## 기본 구조

`Service → XxxSupport → JPAQueryFactory + Q클래스 → Entity 또는 DTO`

- `Querydsl4Repository`를 상속하는 기존 구조와 생성자 주입을 따른다.
- `BooleanBuilder`로 필요한 조건을 조합하고, `applyPagination`으로 페이지 결과를 만든다.
- 목록에 필요한 컬럼만 반환할 때 DTO projection을 사용한다. 별칭과 DTO 필드명이 맞아야 한다.
- Q클래스는 엔티티에서 생성한다. 화면용으로 직접 만들거나 생성 결과를 수정하지 않는다.

## 신규 작성 기준

- null·빈 문자열·잘못된 날짜를 먼저 구분한다. `String.valueOf(null)`을 정상 검색값으로 쓰지 않는다.
- 검색 필드·정렬 필드는 서버의 허용 목록에서 Q필드로 변환한다. 요청 문자열을 그대로 필드 경로로 만들지 않는다.
- 정렬 방향도 허용값으로 제한하고 기본 정렬을 정한다. 같은 값이 반복되면 PK 등 보조 정렬로 순서를 고정한다.
- 페이지 크기와 조회 기간의 한도를 확인한다. 조직·프로젝트 접근 조건은 선택적 화면 필터와 별개다.
- 날짜 검색은 컬럼 타입·시간대·포함 범위를 명시한다. 하루 전체라면 다음 날 시작 미만 방식 등을 검토해 소수초 누락을 막는다.
- 조회와 count에 같은 필터를 적용한다. 조인·그룹 집계는 중복 행과 실제 페이지 총건수를 검증한다.
- `applyPagination`이 복잡한 집계의 count까지 항상 해결한다고 가정하지 않는다. 필요한 경우 별도 count 방식을 구현한다.
- 기존 예제의 임의 정렬 문자열·입력 검증 생략까지 표준으로 복사하지 않는다.

## 조건 변경·삭제가 필요한 경우

- `DictionarySupport.removeDictionary()`처럼 QueryDSL delete도 사용된다. 조회 전용 도구로 제한하지 않는다.
- 신규 대량 변경은 조건·영향 건수·Service 트랜잭션을 명시한다. 빈 조건으로 전체 테이블을 변경하지 않는다.
- bulk 변경 후 같은 엔티티를 다시 사용하면 DB와 영속성 컨텍스트가 다를 수 있다. 미반영 변경을 고려해 flush·재조회·clear 필요성을 검토한다.
- `clear`는 일괄 삽입할 상용구가 아니다. 아직 저장되지 않은 변경을 잃지 않도록 순서를 설계한다.

근거: `cmp:src/main/java/kr/datasolution/cuni/basic/repository/DictionarySupport.java`, `cmp/repository/CiInformationSupport.java`, `common/repository/Querydsl4Repository.java`.
- 관련: [Q클래스 생성](../../foundation/build-and-run.md), [DB 코드 작성 절차](implementation.md).
