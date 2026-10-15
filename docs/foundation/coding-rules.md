# 범용 코딩 규칙의 적용 범위

> 범위: 5개 업무 모듈의 Java·Thymeleaf·JS·CSS 신규 작성·수정 | 상태: 초안 | 근거: 아래 소스

외부 범용 규칙 템플릿(init-claude-rules의 core·java·springboot·html·javascript·css)은 **제안**으로만 참고한다. 프로젝트 지침과 기존 구조 규칙이 우선하며, Java 8에서 쓸 수 없는 규칙은 적용하지 않는다.

## 우선순위

1. 지침: 업무 루트 `CLAUDE.md`의 전역 컨벤션(한글 주석·개정이력 헤더 유지·생성자 주입·한글 산출물)과 아래 [기존 구조 재사용 원칙](#기존-구조-재사용-원칙-지침).
2. 관찰 기반 기준: [CMP API 작성 규칙](../cases/backend/cmp-new-api.md), [DB 기술 선택](../cases/db/access-selection.md), [화면 작성 순서](../cases/screen/new-screen.md) 등 주제별 문서.
3. 제안: 아래 표에서 '적용'으로 분류한 범용 규칙.

## 기존 구조 재사용 원칙 (지침)

사용자 지시(2026-10-15): **기존 코드·구조를 재사용하거나 유지하는 것이 최우선이다. 기존 방식으로 구현할 수 없는 부분만 새로 구현한다.**

1. 요청을 받으면 같은 모듈의 기존 화면·공통 함수·공통 클래스로 할 수 있는지 먼저 찾는다(예: grid 기본 옵션, 엑셀 기존 방식, `createPageRequest`·`createPageDto`, 인터셉터 메뉴 권한, `callAjax` 기본 실패 처리).
2. 요청이 공통 방식과 다르면 구현하기 전에, 요구사항 단계에서 "공통 방식 대안"을 결정 사항으로 먼저 제시한다. 새 구현은 사용자가 공통 방식으로는 부족하다고 정했을 때만 한다.
3. 기존 코드가 하드코딩하지 않는 종류의 값은 새 코드에서도 하드코딩하지 않는다([하드코딩 경계](../cases/display-value/hardcoding-boundary.md)).
4. 새로 만든 부분은 설계·완료 보고에 "기존 방식으로 안 되는 이유"를 한 줄로 남긴다.

- 사례(CUNI-536): 엑셀 셀 서식, 페이지 건수 '전체' 제외, POST 메뉴 권한 검사를 먼저 새로 구현했지만 사용자 요청으로 모두 공통 방식으로 되돌렸다. 해당 기준은 [엑셀](../cases/table/excel-export.md), [표 생성](../cases/table/table-setup.md), [포탈 Controller](../cases/backend/portal-controller-proxy.md)에 있다.

## 범용 규칙 분류

| 범용 규칙 | 분류 | 이유·관찰 |
|---|---|---|
| Java 17+, record·sealed·pattern matching·`List.of()`·`toList()` | 적용 불가 | 5개 모듈 모두 Java toolchain 8, Spring Boot 2.7.18 |
| Kotlin 예제(확장 함수, `lateinit`) | 적용 불가 | 템플릿의 Spring Boot 규칙이 Kotlin 기준이다. 개념만 참고한다 |
| 생성자 주입, 필드 `@Autowired` 금지 | 지침과 일치 | 필드 주입이 남은 파일: admin 45·cmp 32·interface 22·user 7·batch 4개 |
| 기존 코드 스타일을 따르지 말고 건드린 부분을 리팩터링 | 적용 안 함 | 기존 Controller·Service 상속 구조와 공통 래퍼를 먼저 재사용한다. 리팩터링은 요청 범위에서만 한다 |
| 함수 30줄·파일 300줄·파라미터 4개·중첩 3단계 | 신규 코드 권장 | 기존 파일을 줄이려고 분리하지 않는다. 새로 추가하는 메서드에 적용한다 |
| Service 인터페이스 + `Impl` 분리 | 적용 안 함 | `*ServiceImpl` 0개. 구체 클래스 + `ApiService` 상속 구조를 따른다 |
| Controller에서 try/catch 금지, 전역 핸들러로 위임 | 적용 안 함 | CMP는 Controller에서 `BaseException`으로 감싸 던지는 패턴이다 |
| `@Valid` + Bean Validation | 신규 API 권장 | `@Valid`·`@Validated` 사용 파일은 cmp 2개뿐이다. 적용 시 실패 경로까지 구현한다 |
| `@ConfigurationProperties` 우선, 흩어진 `@Value` 금지 | 신규 설정 권장 | `@Value` 사용 파일 수백 개, `@ConfigurationProperties`는 cmp 2개. 기존 설정은 유지 |
| 읽기 전용 `@Transactional(readOnly = true)` | 적용 | cmp 159개 파일에서 이미 사용한다 |
| `catch (Exception e)` 금지, 빈 catch 금지 | 신규 코드 권장 | 기존에 광범위 catch가 많다(cmp 375건). 빈 catch·예외 삼킴은 새로 만들지 않는다 |
| 엔티티 직접 반환 금지, DTO 사용 | 적용 | 기존 DTO·`ResultData` 응답 구조를 따른다 |
| 비밀값 커밋 금지, 프로필별 설정 분리 | 적용 | [설정 문서](configuration.md)의 Jasypt·프로필 규칙 참고 |
| 매직 넘버·문자열 상수화, 의미 있는 이름, boolean `is/has` 접두어 | 적용 | 화면 문구·옵션·운영 값은 상수보다 자료사전·코드사전·설정을 우선한다. 경계는 [하드코딩 경계](../cases/display-value/hardcoding-boundary.md) |
| 과한 추상화·일회성 유틸 금지 | 적용 | 공통 래퍼(`datatables.ex.js` 등)가 있으면 새 유틸 대신 재사용한다 |
| "항상 영어로 응답" | 적용 안 함 | 지침상 산출물·설명은 한글이다 |

## 화면(HTML·JS·CSS)

- 화면 규칙은 범용 템플릿이 아니라 [Admin frontend](../reference/frontend-admin.md)·[User frontend](../reference/frontend-user.md) 표준을 따른다.
- 범용 JS 규칙 중 모듈·빌드 도구 전제 항목은 제외한다. 포탈은 Thymeleaf 템플릿과 `static/` 스크립트를 직접 로드한다.
- CSS는 기존 `css_nh`·`css_popup` 등 레이아웃별 파일을 유지하고 새 전역 스타일 파일을 만들지 않는다.

## 개발 시 확인할 점

- 범용 규칙과 기존 구조가 충돌하면 기존 구조를 유지하고, 다르게 작성한 이유를 작업 결과에 남긴다.
- 수치는 2026-09-29 `src/main/java` 파일 검색 결과다. 규칙 준수 여부 전체를 감사한 것은 아니다.

근거: 각 모듈 `build.gradle`(`JavaLanguageVersion.of(8)`), `*/src/main/java/kr/datasolution/cuni/common/handler/GlobalExceptionHandler.java`, 업무 루트 `CLAUDE.md`.
- 관련: [커밋 규칙](commit-conventions.md), [소스 기준](../maintenance/source-baseline.md).
