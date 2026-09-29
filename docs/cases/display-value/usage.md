# 코드에서 값 사용하기

> 범위: Admin Thymeleaf·Java·JavaScript | 상태: 코드 확인 | 근거: 아래 소스
>
> 언제 읽나: 화면·Java·JS에서 자료사전·코드사전·설정 값을 조회해 표시할 때 | 읽지 않는 경우: 값을 등록하는 절차(→ registration-admin.md)

| 필요 값 | 서버 조회 | 사용 기준 |
|---|---|---|
| 제목·열 제목 | `getDicValue("Title", "BatchTask")`, `getDicValue("Term", "Name")` | 단일 문구 반환 |
| 표시 설명 | `getDicDisplayDesValue(category, name)` | 자료사전의 표시 설명 반환 |
| 검색 항목 | `getDicList(category)` | 이름→문구 Map, 자료사전 순서로 정렬 |
| 선택 목록 | `getCode(category)` | 현재 언어·사용 여부 Y, 코드 순서로 정렬 |
| 전체 선택 포함 | `getCode(category, "AllStatus")` | 빈 키에 `SearchConditionHeader / AllStatus` 문구 추가 |
| JS 코드 변환 | `getRenderCode(category)` | JSON 문자열 반환; 공통 JS `getCode(json, value)`로 표시명 조회 |
| JS 자료사전 목록 | `getRenderDic(category)` | JSON 문자열 반환; 객체가 필요하면 명시적으로 파싱 |
| 설정 | `getConfString(category, name)` | 문자열 반환; Java에서는 `cacheManager.getConfString(...)` |

```html
<th th:text="${@cacheManager.getDicValue('Term', 'Name')}"></th>
<select id="useYn">
  <option th:each="item : ${@cacheManager.getCode('YesNo')}"
          th:value="${item.key}" th:text="${item.value}"></option>
</select>
<script th:inline="javascript">
  const pageTitle = /*[[${@cacheManager.getDicValue("Title", "BatchTask")}]]*/;
  const codeYesNo = /*[[${@cacheManager.getRenderCode("YesNo")}]]*/;
</script>
```

- `@cacheManager`는 Spring Bean이다. Thymeleaf가 서버에서 평가하며 정적 `.js`에 같은 표현식을 넣어도 조회되지 않는다.
- DataTables의 `columns.data`는 API 필드명이다. 열 순서와 `<th>` 순서를 일치시킨다.
- 코드 열의 render는 `getCode(codeYesNo, data)`처럼 사용한다. 코드 문자열을 먼저 객체로 바꾸면 기존 함수와 맞지 않는다.
- `getCodeValue(category, name, language)`는 단일 값 조회이며, 목록용 `getCode`와 달리 사용 여부를 필터링하지 않는다.
- 검색 목록의 이름은 백엔드가 허용하는 검색 키와 맞춘다. 표시명으로 업무 분기를 하지 않는다.
- `getCode`/`getDicList`에 해당 항목이 없으면 빈 Map, 단일 값·JS 코드 변환 실패는 `Unknown`이다.
- `getLocale()`의 기본값은 `ko-KR`이나 사용자 정보만 있고 `currentCulture`가 없으면 문자열 `null`이 될 수 있다.
- 레이아웃 메뉴 경로는 세션 메뉴 정보를 사용한다. `Title` 등록만으로 메뉴·권한은 생성되지 않는다.

근거: `admin:src/main/java/kr/datasolution/cuni/common/cache/CacheManager.java`.
화면·JS 근거: `admin:src/main/resources/templates/batchtask/list.html`, `admin:src/main/resources/static/js/common.js`의 `getCode`.
- 관련: [등록](registration-admin.md), [미등록 값 개발](temporary-value.md).
