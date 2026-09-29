# 자료사전·코드사전·설정

> 범위: Admin 중심 포탈 개발 | 상태: 코드 확인, DB 미확인 | 근거: 아래 소스

표시 문구·선택값·설정은 DB에 저장하고, 서버의 `cacheManager`를 통해 조회한다.

| 종류 | 저장 키 | 저장 값·주요 용도 | CMP 테이블 |
|---|---|---|---|
| 자료사전 | 카테고리 + 이름 + 언어 | 제목·열 제목·버튼·메시지·형식 | `dictionary_tp` |
| 코드사전 | 카테고리 + 이름 + 언어 | 식별값에 대응하는 표시명·선택 목록 | `code_tp` |
| 설정 | 카테고리 + 이름 | 언어와 무관한 프로그램 설정 문자열 | `configuration_tp` |

- 자료사전: `dictionaryname`은 참조 키, `dictionarysettingvalue`는 표시 문구다.
- 코드사전: `codename`은 서버로 전달하는 식별값, `codesettingvalue`는 표시명이다.
- 설정: `configurationvalue`를 문자열로 조회한다. 숫자·날짜 등은 사용처에서 형식 검증·변환한다.
- 자료사전 그룹: `Title` 제목, `Term` 공통 용어, `PlaceHolder` 입력 안내, `Operation` 메시지, `Format` 형식.
- `SearchConditionHeader`는 전체 선택 문구, 화면별 검색 그룹은 검색 키와 표시명을 관리한다.
- 카테고리는 등록 문자열이다. 등록만으로 화면에 연결되지 않으며 코드에서 정확한 키를 조회해야 한다.
- 키와 언어는 대소문자까지 일치해야 한다. 단일 값 조회에서 못 찾으면 `Unknown`을 반환한다.
- 언어는 세션의 `currentCulture`를 사용한다. 일치하는 번역이 없을 때 다른 언어로 대체 조회하지 않는다.
- 코드의 사용 여부·순서와 자료사전의 순서는 목록 조회에 영향을 준다. 번역 여부는 번역 관리 정보다.
- 열 제목은 자료사전, 셀 데이터는 업무 API, 코드 표시명은 코드사전에서 가져온다.
- API 필드명·DOM ID·업무 식별값까지 표시 문구로 바꾸지 않는다. 메뉴·권한 등록은 별도다.

근거: `admin:src/main/java/kr/datasolution/cuni/common/cache/CacheManager.java` 및 `cache/dto/`.
테이블 근거: `cmp:src/main/java/kr/datasolution/cuni/basic/domain/`의 `Dictionary.java`, `Code.java`, `Configuration.java`.

- 관련: [코드 사용법](../cases/display-value/usage.md), [등록 방법](../cases/display-value/registration-admin.md), [소스 기준](../maintenance/source-baseline.md).
