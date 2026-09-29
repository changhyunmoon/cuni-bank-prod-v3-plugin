# JPA로 기본 조회·저장하기

> 범위: CMP 중심 엔티티 CRUD | 성격: 기존 패턴 + 신규 작성 기준

엔티티와 PK가 이미 있고 기본 CRUD로 충분하면 기존 `JpaRepository`를 사용한다.

## 기본 구조

`Controller → Service → XxxRepository → Entity에 매핑된 테이블`

- Entity는 `<domain>/domain`, Repository는 `<domain>/repository`에서 먼저 찾는다.
- `DictionaryRepository extends JpaRepository<Dictionary, DictionaryPk>`가 복합 PK의 예다.
- 공통 `ApiService`에는 JPA Repository와 QueryDSL Support가 함께 있다. 대상 서비스의 상속 구조부터 확인한다.

## 신규 작성 기준

- 테이블명·PK·컬럼 타입·null 허용·연관관계는 기존 엔티티와 실제 스키마 근거로 확인한다. 추측해서 생성하지 않는다.
- 단건 조회·존재 확인은 `findById`, `existsById` 등 기존 Repository 기능을 우선 사용한다.
- 단순 고정 조건은 기존 파생 쿼리 메서드를 재사용한다. 선택적 검색 조건이 늘어나면 Support로 분리한다.
- 등록과 수정을 구분한다. 수정은 대상 존재를 확인하고 허용한 필드만 변경한다.
- DTO를 새 Entity로 일괄 매핑하면 전달되지 않은 값이 사라질 수 있다. 기존 `ApiService.save`를 무조건 복사하지 않는다.
- 삭제는 대상 범위·연관 데이터·감사 기록을 먼저 확인한다. 조회 없이 임의 ID를 신뢰하지 않는다.
- 목록 화면에 큰 테이블의 `findAll()`을 그대로 사용하지 않는다. 페이지 조회와 응답 필드를 정한다.
- Entity를 그대로 화면에 노출하기보다 기존 DTO 계약을 유지한다. 민감값과 불필요한 연관 데이터는 제외한다.
- 연관 객체 접근이 추가 쿼리를 만드는지 확인한다. 조회 건수만 보고 성능을 판단하지 않는다.

## 저장 전후 확인

- 업무 단위 트랜잭션은 Service에서 관리한다. 조회 전용과 변경 메서드의 설정을 구분한다.
- `saveAll()` 사용만으로 JDBC 일괄 처리가 보장되지는 않는다. 실제 SQL·식별자 전략·배치 설정을 확인한다.
- 대량 SQL·QueryDSL 변경과 같은 데이터를 섞어 읽고 쓰면 JPA가 기억하는 값과 DB 값의 차이를 확인한다.
- 빈 결과, 없는 ID, 중복 키, 부분 수정, 실패 시 롤백을 검증한다.

근거: `cmp:src/main/java/kr/datasolution/cuni/basic/repository/DictionaryRepository.java`, `basic/service/DictionaryService.java`, `common/service/ApiService.java`.
- 관련: [선택 기준](access-selection.md), [트랜잭션·검증](implementation.md).
