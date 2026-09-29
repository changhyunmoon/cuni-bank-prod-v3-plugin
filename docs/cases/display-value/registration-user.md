# User 화면용 자료사전·코드사전·설정 준비와 반영

> 범위: User 포탈 개발 | 상태: 코드 확인, DB·실행 미검증 | 근거: 아래 소스
>
> 언제 읽나: User 화면에서 쓸 사전·설정 값을 준비하고 User 캐시에 반영할 때 | 읽지 않는 경우: Admin 화면만 대상일 때

User 화면에서 사용하는 자료사전·코드사전·설정도 Admin 관리 화면에서 등록한다. User 모듈은 CMP에서 값을 조회해 자체 캐시에 보관하고 화면에 표시한다. 현재 User 소스에는 대응하는 사전·설정 등록 화면과 Controller가 없다.

1. User 화면에 필요한 카테고리·이름·언어와 API에 전달할 코드 식별값을 정한다. 같은 의미와 용도의 기존 키가 있으면 재사용한다.
2. 없는 값은 [Admin 등록 가이드](registration-admin.md)에 따라 등록한다. User용이라는 이유로 `/user/dictionaries/save` 등의 등록 경로를 만들거나 가정하지 않는다.
3. User 템플릿·Java 코드에서 아래 조회 메서드로 연결한다. 예시 키는 실제 환경에 등록되어 있는지 확인한다.
4. Admin의 캐시 초기화 기능을 실행하고 User 모듈까지 갱신됐는지 확인한다. User 서버 캐시 반영 후 화면을 다시 로드한다.
5. 실제 사용자 언어에서 표시 문구·선택 목록·정렬·API 전달값을 확인하고, 임시값을 사용했다면 실제 조회로 전환한다.

| 필요 값 | User 조회 코드 | 확인 사항 |
|---|---|---|
| 제목·공통 문구 | `getDicValue("Title", "Project")`, `getDicValue("Term", "Name")` | 카테고리·이름·현재 언어 일치 |
| 선택 목록 | `getCode("Culture")` | 현재 언어, 사용 여부 `Y`, 코드 순서 |
| 단일 코드 표시명 | `getCodeValue(category, name, languageCode)` | 언어를 명시하며 사용 여부 필터는 없음 |
| 설정 | `getConfString(category, name)` | 문자열 반환, 사용처에서 형식 검증·변환 |

```html
<th th:text="${@cacheManager.getDicValue('Term', 'Name')}"></th>
<select id="culture">
  <option th:each="item : ${@cacheManager.getCode('Culture')}"
          th:value="${item.key}" th:text="${item.value}"></option>
</select>
```

- `@cacheManager`는 User의 `ProxyClientCacheManager` Bean이다. Thymeleaf 표현식은 서버에서 처리하므로 정적 `.js` 파일에 그대로 넣지 않는다.
- 표시명은 화면에 보여주고, 선택값은 `item.key`로 전달한다. 표시 문구로 업무 상태를 판단하지 않는다.
- 언어 조회는 `sessionAdminUserInfo`가 있으면 우선하고, 없으면 `sessionUserInfo`의 `currentCulture`를 사용한다. 기본값은 `ko-KR`이지만 사용자 정보에 `currentCulture`만 없으면 문자열 `null`이 될 수 있다.
- 단일 자료사전·코드·설정 조회에서 키가 없으면 `Unknown`, 선택 목록에 해당 항목이 없으면 빈 Map이 반환된다. 키 대소문자·사용자 언어·코드 사용 여부·실제 저장 결과를 확인한다.
- User의 `settings/dictionary_culture.html`은 공통 메시지를 JavaScript 변수로 읽는 조각이며 등록 화면이 아니다.

## User 캐시 반영

- User는 자체 메모리 캐시를 사용한다. Admin에서 저장한 사실만으로 모든 User 인스턴스의 캐시가 즉시 바뀌지는 않는다.
- User의 `SettingController`는 시작 시 자료사전·코드·설정을 선조회한다. `GET /user/settings/refresh-cache`는 User 컨텍스트를 포함한 갱신 경로이며, Controller 매핑은 `/settings/refresh-cache`다.
- 이 갱신 메서드는 코드·자료사전·설정·헬프데스크 분류·프로젝트 역할 캐시를 갱신한다. 05시 스케줄 선언도 있으나 실제 활성화·실행 성공은 환경에서 확인한다.
- 운영 반영은 [모듈 간 캐시 반영](cache-refresh.md) 절차를 따른다. 여러 User 인스턴스가 있으면 대상별 갱신 결과를 확인한다. 브라우저 새로고침만으로 서버 캐시가 갱신되지는 않는다.
- 성공 기준: 실제 User 화면에서 `Unknown` 없이 표시되고 올바른 식별값이 서버에 전달된다. Admin에서는 보이는데 User에서만 이전 값이면 User 인스턴스의 캐시와 사용자 언어를 확인한다.

근거: `user:src/main/java/kr/datasolution/cuni/common/cache/`의 `CacheManager.java`, `ProxyClientCacheManager.java`.
갱신 근거: `user:src/main/java/kr/datasolution/cuni/user/controller/setting/SettingController.java`.
화면 근거: `user:src/main/resources/templates/`의 `applist/applist.html`, `fragments/header_user.html`, `settings/dictionary_culture.html`.
- 관련: [개념](../../reference/display-values.md), [Admin 등록](registration-admin.md), [임시값 해제](temporary-value.md).
