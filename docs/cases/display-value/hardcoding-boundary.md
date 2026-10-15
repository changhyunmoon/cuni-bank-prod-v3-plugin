# 하드코딩할 값과 DB로 뺄 값의 경계

> 범위: Admin·User 화면, cmp 서버 코드 | 성격: 사용자 지정 개발 기준(2026-10-15) + 코드 관찰 | 상태: `development` 기준 재집계(2026-10-15)
>
> 언제 읽나: 화면 문구·선택 옵션·날짜 형식·업무 값을 코드에 직접 쓸지, 자료사전·코드사전·설정으로 뺄지 정할 때. 화면·코드를 새로 짜거나 시안을 구현으로 옮길 때 | 읽지 않는 경우: 이미 정한 값을 조회하는 문법만 필요할 때(→ [사전 사용법](usage.md))

기존 프로젝트가 DB로 관리하는 종류의 값은 새 코드에서도 하드코딩하지 않는다. 기존 프로젝트가 코드에 두는 종류의 값만 코드 상수로 둔다.

## 판단 질문

1. **운영자가 바꿔야 하는 값인가?** 문구·표시명·허용 목록·계정 ID·외부 주소처럼 배포 없이 바꿔야 하면 DB로 뺀다.
2. **바꾸면 코드가 따라오는가?** 바꾸는 순간 코드가 깨지는 값(자료형 이름, 서버의 날짜 해석 형식, 필드·키 이름)은 코드에 둔다.
3. 같은 종류의 값을 기존 코드가 어디에 두는지 찾아 그대로 따른다. 기존이 DB인데 새 코드만 하드코딩하지 않는다.

## DB로 빼는 것 (지침)

| 값 | 둘 곳 | 기존 근거 |
|---|---|---|
| 화면 문구: 제목·열 제목·버튼·placeholder·빈 결과 | 자료사전 | `getDicValue` 사용, [사전 사용법](usage.md) |
| select 옵션·코드 표시명·테마 목록 | 코드사전(값 목록)·자료사전(검색 항목) | [컴포넌트 표준](../../reference/ui-components.md) 검색 영역, [테마](../../reference/theme.md) |
| 화면 날짜 **표시** 형식 | 자료사전 `Format.Date`(`YYYY-MM-DD`)·`Format.DateTime`(`YYYY-MM-DD HH:mm`) | admin 125개 파일 128곳. 기준 `admin:templates/ipstatus/list.html:18` `var dateTime = /*[[${@cacheManager.getDicValue("Format", "DateTime")}]]*/;` |
| 운영자가 바꾸는 업무·환경 값: 허용 목록, 계정·그룹 ID, 외부 주소 | 코드사전·설정 | `cmp:HiwareService.java:112-114`·`AwsEc2Service.java:317`(`getCodeValue`), `K8sProjectService.java:337`(`getConfString("LdapUrl", …)`) |
| **신규** 화면 안내창(`$.alert`·`$.confirm`) 문구 | 자료사전. 미등록이면 [임시값](temporary-value.md) | 문서 기준과 같음. 아래 관찰 참고 |
| 공통 안내 제목·문구(오류·확인·서버 연결 실패) | 레이아웃이 주는 공통 사전 변수 `errorDicCache`·`confirmDicCache`·`serverConnectionErrorDicCache`를 재사용. 화면에서 같은 문구를 새로 정의하지 않는다 | 정의 `admin:templates/settings/dictionary_culture.html`(`Term.Confirm`·`Term.ServerConnectionError` 등), 사용 `static/js/common.js:306-316`(기본 onFailed), CUNI-536 리뷰 CV-07 |

## 코드에 두는 것 (관찰된 관례)

| 값 | 근거 |
|---|---|
| 서버 내부 날짜 해석 형식(`SimpleDateFormat`·`DateTimeFormatter.ofPattern`) | cmp 27곳 모두 코드, 설정·사전 조회 0곳 |
| datetimepicker 입력 형식 `'Y-m-d H:i'`·`'Y-m-d'` | 사용 화면 8개 파일 모두 직접 작성(`ipstatus/list.html:34`), 사전 조회 0곳 |
| 기술 계약 값: 필드·키 이름, DB 자료형 이름, 정규식, 사전·코드 조회 키(`KO_KR`, 카테고리명) | cmp `cmp/service`의 `private static final String` 91건 |
| 서버 오류 문구(`BaseException`) | `new BaseException("한글…")` 약 330건, 사전 조회 0건. 문구 규칙은 [CMP 오류 처리](../backend/cmp-new-api.md#오류-처리) |

## 기존 코드가 섞여 있는 영역

| 영역 | 현재 코드 | 새 코드 기준 |
|---|---|---|
| 화면 안내창 문구 | `$.alert` 787줄 중 한글 직접 작성 약 300건대(집계 방식에 따라 297~355) | 자료사전. 기존 하드코딩을 근거로 삼지 않는다 |
| 화면 날짜 표시 | 사전 128곳, `moment().format('YYYY-MM-DD…')` 리터럴 약 60곳 | 자료사전 `Format.*` |

- 주의: `Format.DateTime` 사전 값을 바꾸면 서버 해석 형식(`uuuu-MM-dd HH:mm` 등)과 어긋난다. 화면에서 서버로 보내는 날짜는 서버 형식과 같아야 하므로, 사전 형식은 표시에만 쓰고 전송 값의 형식은 서버 계약을 따른다.
- 값이 미등록이어도 하드코딩으로 대신하지 않는다. `[임시값]` + 실제 조회 주석으로 두고 완료 시 등록 안내를 한다([미등록 값](temporary-value.md)).

## 검증 체크리스트

- [ ] 새 템플릿에 한글 문구 리터럴이 `[임시값]` 표식 없이 남아 있지 않다(`rg -n "[가-힣]" <템플릿>`으로 확인 후 주석·임시값 제외).
- [ ] select 옵션·코드 표시명을 직접 쓰지 않았다. 분기는 표시명이 아닌 코드 키로 한다.
- [ ] 화면 날짜 표시는 `Format.*` 사전, 입력기 형식·서버 해석 형식은 코드 상수다.
- [ ] 운영자가 바꿀 값(허용 목록·ID·주소)을 Java·JS 상수로 두지 않았다.

근거 집계: admin·cmp `development` 브랜치 `git grep`(2026-10-15). 관련: [자료사전·코드사전·설정](../../reference/display-values.md), [코딩 규칙](../../foundation/coding-rules.md).
