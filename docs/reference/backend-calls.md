# 포탈에서 백엔드를 호출하는 방법

> 범위: admin·user의 기본 proxy 패턴 | 상태: 대표 구현 확인

포탈은 화면과 요청 전달을 담당하고, 실제 업무 처리는 백엔드에 맡긴다.

## 요청이 지나가는 곳

1. 브라우저가 포탈 Controller를 호출한다.
2. 화면 요청은 Thymeleaf 템플릿을 반환하고, AJAX 요청은 `@ResponseBody`로 데이터를 반환한다.
3. Controller는 `BaseProxy`를 상속한 `@Component` 클라이언트를 호출한다.
4. 클라이언트는 설정에서 읽은 기본 URL과 API 경로를 합쳐 백엔드를 호출한다.
5. 백엔드 응답을 화면에 전달한다.

| 찾는 것 | 위치·역할 |
|---|---|
| 화면 | `src/main/resources/templates/` |
| API 호출 코드 | `src/main/java/kr/datasolution/cuni/proxy/` |
| 서비스 주소·API 경로 | `application-msa.yml`의 `app.<service>.*`, `portal.*` |
| 경로 주입 | 클라이언트 필드의 `@Value("${app.<service>.<key>}")` |
| 공통 응답 | `ResultData<T>`: `success`, `result`, `code`, `message`, `description`, `exception` |

## 구현할 때

- 유사 클라이언트와 설정 키를 먼저 찾는다. 포탈에 DB 접근·도메인 처리를 추가하지 않는다.
- 기본 RestTemplate Bean에는 `@LoadBalanced`가 있다. 특수 외부 연동의 별도 클라이언트와 구분한다.
- 일반 BaseProxy 호출은 `setThreadHeaders()`에서 서비스 JWT를 붙인다. 사용자 세션을 자동 전달하지 않는다.
- 사용자 정보가 필요한 요청은 Controller에서 세션 정보를 넣는 기존 계약을 확인한다.
- 예: Admin 작업 시작 Controller는 요청의 `userInfo`를 세션 값으로 덮어쓴다.
- BaseProxy의 이전 `setHeaders()`는 확인한 일반 호출 경로에서 사용되지 않는다. 이름만 보고 사용자 헤더 전달을 가정하지 않는다.
- HTTP 응답 수신과 업무 성공은 다르다. `success`와 해당 API의 `result` 의미를 확인한다.

근거: `admin:src/main/java/kr/datasolution/cuni/proxy/BaseProxy.java`, `proxy/basic/DictionaryClient.java`, `common/model/ResultData.java`, `admin/controller/task/TaskController.java`.
- 관련: [설정 파일](../foundation/configuration.md).
- 실제 기능의 호출·DB 경로는 [기능별 연결 지도](feature-map.md)에서 선택한다.
