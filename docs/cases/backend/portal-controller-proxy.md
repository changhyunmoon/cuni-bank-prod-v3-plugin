# 포탈 Controller·Proxy·설정 키 추가

> 범위: admin·user 포탈의 새 화면·데이터 엔드포인트 | 상태: Admin 코드 확인, User는 구조만 확인, 실행 미검증 | 근거: admin `admin/controller/monitoring/MonitoringController.java:329-475`, `proxy/cmp/VmManagerClient.java`, `proxy/BaseProxy.java`, `common/controller/CommonController.java:85-104`, `common/interceptor/CheckSessionInterceptor.java`, `application-msa.yml` (`development`, 2026-10-14)
>
> 언제 읽나: 새 화면 URL이나 포탈 데이터 엔드포인트, 새 Proxy 메서드·`application-msa.yml` 키를 추가할 때 | 읽지 않는 경우: CMP 내부만 바꿀 때(→ [CMP 새 API](cmp-new-api.md))

포탈은 화면을 반환하고 요청을 CMP로 전달만 한다. 같은 경로로 GET은 템플릿, POST는 Proxy 호출 결과를 반환한다.

## 먼저 볼 것

- [포탈에서 백엔드를 호출하는 방법](../../reference/backend-calls.md), [설정 파일](../../foundation/configuration.md), [시안의 서버 호출을 API 계약으로](screen-api-contract.md)

## 구현 순서

1. **Controller 위치**: 메뉴 영역에 맞는 기존 Controller(예: 모니터링 메뉴 → `MonitoringController`, `@RequestMapping("/monitoring")`)에 메서드를 추가한다. 새 Controller는 맞는 영역이 없을 때만 `CommonController`를 상속해 만든다.
2. **화면 GET**: `@GetMapping("/<화면 경로>/list")`가 템플릿 이름(`"monitoring/vmManagerManagement/list"`)을 반환한다. 화면에 필요한 세션 값은 `model.addAttribute`로 넘긴다(Admin 세션 키 `sessionAdminUserInfo`).
3. **데이터 POST**: 같은 경로에 `@PostMapping` + `@ResponseBody ResultData`, 인자는 `@RequestBody Map<String, Object> param`. 본문은 Proxy 호출 → `setResultMessage(result)` → 반환. 입력 변환·추가 검증은 참고 메서드에 있을 때만 둔다.
4. **Proxy**: 대상 서비스의 기존 Client(`proxy/cmp/XxxClient`, `BaseProxy` 상속 `@Component`)에 메서드를 추가한다. 경로는 `@Value("${app.cmp.<키>}")` 필드, 호출은 `postRestThreadTemplate(cmpUrl + 경로, paramMap)`.
5. **설정 키**: `application-msa.yml` 맨 위 기본 문서의 `app.cmp:` 아래에 `<키>: /<복수 리소스>/<동작>`을 추가한다. 프로필 문서(`on-profile: local` 등)는 서비스 기본 URL만 바꾸므로 경로 키를 넣지 않는다.

## 규칙

| 구분 | 규칙 |
|---|---|
| 관찰 | 메뉴 권한 검사는 `CheckSessionInterceptor`가 **GET 요청**에만, 등록된 메뉴 URL과 같거나 그 URL로 시작할 때만 한다. POST 데이터 URL은 세션 존재만 확인한다. 등록된 메뉴 URL은 `menu_tp.menuurl`이며, 같은 URL이 이미 있는지 [DB 조회](../../reference/db-lookup.md)로 확인한다. |
| 지침 | 데이터 범위·권한이 필요한 조회·변경은 화면·메뉴 권한에 기대지 말고 CMP에서 검사하는지 설계에 적는다. |
| 관찰 | 같은 Client 안에서 키 이름은 `<리소스>-<동작>` 케밥 표기(`vm-managers-list`)다. |
| 관찰 | 화면 경로와 CMP 경로는 이름이 달라도 된다(`/monitoring/vm-manager-managements/list` → `/cmp/vm-managers/list`). |

## 복사하지 않을 기존 패턴

- Controller 필드에 쓰지 않는 Client를 계속 늘리는 것. 새 Client는 기존 Client에 맞는 곳이 없을 때만 만든다.
- 응답을 Controller에서 가공해 필드 이름을 바꾸는 것. 이름은 [API 계약](screen-api-contract.md)에서 맞춘다.

## 검증 체크리스트

- [ ] GET 화면이 메뉴 등록 전·후 각각 예상대로 열리거나 "권한없는 메뉴" 알림이 뜬다(메뉴 등록 후 재로그인).
- [ ] POST 응답의 `success`·`message`가 `setResultMessage` 규칙대로 채워진다.
- [ ] 새 설정 키가 기본 문서에 있고 local 프로필에서 CMP 주소로 합쳐진다(기동 로그·실제 호출로 확인).
- [ ] User 모듈은 같은 구조를 User 실제 Controller·`sessionUserInfo`로 대조했다.
