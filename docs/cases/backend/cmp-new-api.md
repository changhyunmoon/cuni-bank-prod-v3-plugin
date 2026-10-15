# CMP 새 REST API 작성 규칙

> 범위: cmp 신규 Controller·Service 작성 | 상태: 코드 확인, 실행 미검증 | 근거: 아래 소스
>
> 언제 읽나: cmp에 새 REST API(Controller·Service)를 추가하거나 기존 API 계약을 바꿀 때 | 읽지 않는 경우: 포탈에서 기존 API 호출만 추가할 때(→ reference/backend-calls.md)

`Controller(ApiController<S> 상속) → Service(ApiService<Entity,Pk,Support> 상속) → Repository/Support`의 구조를 따른다.

## Controller·URL

- URL은 `/<도메인>/<케밥케이스 복수 리소스>` 형태다. 예: `/basic/dictionaries`, `/member/virtual-vm`, `/approval/approval-request-lines`.
- `@RestController` + `ApiController<XxxService>` 상속, 클래스에 Swagger `@Tag`, 메서드마다 `@Operation(summary, description)`을 붙인다.
- 응답은 `ResponseEntity<ResultData<T>>`를 `responseEntity(response)`로 감싼다. `ResultData`는 `success/code/message/description/exception/result` 필드를 갖는다.

## 관찰된 동작별 URL 패턴

| 동작 | 메서드·경로 | 비고 |
|---|---|---|
| 전체 목록 | GET `/list-all` | 검색 없는 단순 목록 |
| 페이징 목록 | POST `/list` | 검색·정렬·페이지를 body Map으로 전달 |
| 상세 | POST `/detail` | 식별 DTO를 body로 전달 |
| 등록·수정 | POST `/save` | 생성일 유무 등으로 등록·수정 분기 |
| 삭제 | POST `/delete` | 식별 DTO를 body로 전달 |

- 다수 Controller에서 관찰한 패턴이며 강제 규칙으로 명문화된 별도 문서는 없다. 근거 없이 다른 이름을 새로 만들지 않는다.
- 페이징 파라미터는 `ApiController.createPageRequest(param, ...)`가 처리한다. body Map의 `page`·`length`·`sortColumn`·`sortOrderType`·`secondSortColumn`·`secondSortOrderType` 키를 그대로 따른다.

## 오류 처리

- 참고 기능의 방식을 따른다. 관찰된 방식은 저장·변경 메서드에서 try/catch로 원인 예외를 잡아 `BaseException(message, param.., cause)`로 다시 던지는 것이며(예: `cmp/controller/VmManagerController.java`의 `/save`), 목록 조회는 try/catch 없이 둔다. 메시지는 SLF4J 스타일 `{}` 플레이스홀더를 쓴다.
- `GlobalExceptionHandler`가 `BaseException`과 그 외 `Exception`을 모두 잡아 HTTP 500 + `ResultData(success=false, description, exception=클래스명)`으로 응답한다. 4xx로 구분되는 응답은 없다.
- `BaseException` 메시지는 `{}` 치환 후 **첫 `.`까지만** `description`이 된다(`GlobalExceptionHandler.java:67-68`). 사유는 `"…입니다(항목: {})."`처럼 한 문장으로 쓰고, 마침표가 들어갈 수 있는 요청 값(일시·소수·파일명)은 문구에 넣지 않는다. 그 밖의 `Exception`은 예외 메시지가 그대로 나간다.
- 화면까지의 실패 경로는 두 가지다.

  | 경로 | 발생 | 화면에서 받는 곳 |
  |---|---|---|
  | 예외 | CMP `BaseException`·기타 예외 → HTTP 500 → admin Proxy 예외 → admin `GlobalExceptionHandler`(93-111)가 XHR이면 CMP 응답 JSON을 500 그대로 중계 | `callAjax` onFailed. 기본 onFailed(`admin:static/js/common.js:306-316`)가 `description`을 안내한다. grid 목록은 공통 error 콜백의 고정 문구 |
  | 업무 실패 | Service·Controller가 예외 없이 `setSuccess(false)` 후 HTTP 200 반환(`development` 기준 cmp 193곳, admin 61곳) | onSuccess에서 `data.success`가 false. `message`는 `setResultMessage`의 공통 오류 문구 |

- 새 화면은 기존 화면과 같게 둘 다 처리한다. onSuccess에서는 `if (data.success)`로 분기하고(기존 admin 템플릿 약 300곳), 실패 시 `$.alert`로 `data.message`를 안내한다. 예외 경로는 기본 onFailed를 그대로 쓰며, 실패 시 화면 상태 복구가 필요할 때만 onFailed를 넘긴다(기본 처리와 같은 안내 + 복구).

## 입력 검증

- 일부 DTO(`MenuDto` 등)에 `@NotBlank`/`@NotNull`이 있지만, Controller에서 `@Valid`로 활성화한 사례는 코드에서 확인되지 않았다. 애노테이션만 달아 두면 실제로 검증되지 않는다.
- 새 API에서 서버 검증이 필요하면 `@Valid` 적용과 예외 처리 경로를 함께 구현하고 실패 케이스로 확인한다.

## 트랜잭션

- Service 클래스 레벨 기본은 `@Transactional(readOnly = true)`이고, 쓰기 메서드마다 `@Transactional`을 개별로 다시 붙인다.
- `ApiService<Entity, Pk, Support>`를 상속하면 기본 CRUD(`getAll`, `getList`, `save`)를 재사용할 수 있다. 전체를 새로 구현하기 전에 상속 구조부터 확인한다.

근거: `cmp:src/main/java/kr/datasolution/cuni/common/controller/ApiController.java`, `common/model/ResultData.java`, `common/handler/GlobalExceptionHandler.java`, `common/exception/BaseException.java`, `common/service/ApiService.java`, `basic/controller/DictionaryController.java`, `basic/service/DictionaryService.java`, `basic/dto/MenuDto.java`.
- 관련: [CMP 구조](../../foundation/modules/cmp.md), [DB 기술 선택](../db/access-selection.md), [DB 코드 작성](../db/implementation.md).
