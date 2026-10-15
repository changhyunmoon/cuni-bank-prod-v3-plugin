# DB로 관리하는 값과 조회 위치

> 범위: CMP 메인 DB(PostgreSQL 17, 개발 `cuni_prg`)의 설정성 테이블 | 상태: 초안, 엔티티와 DB 컬럼 대조 완료 | 근거: `cmp:src/main/java/kr/datasolution/cuni/basic/domain/`, DB `information_schema`

화면 문구·선택값·설정·메뉴·권한은 코드에 하드코딩하지 않고 아래 테이블에 둔다. 코드만으로 등록 여부를 확정할 수 없으면 [query-db 스킬](../../skills/query-db/SKILL.md)로 조회한다.

| 분류 | 테이블 | 키 (PK) | 주요 값 컬럼 | 코드에서 읽는 곳 |
|---|---|---|---|---|
| 자료사전 | `dictionary_tp` | `dictionarycategory`, `dictionaryname`, `dictionarylanguagecode` | `dictionarysettingvalue`, `dictionaryorder` | `cacheManager.getDicValue` 등 |
| 코드사전 | `code_tp` | `codecategory`, `codename`, `codelanguagecode` | `codesettingvalue`, `codeorder`, `codeenableyn` | `cacheManager.getRenderCode` 등 |
| 설정 | `configuration_tp` | `configurationcategory`, `configurationname` | `configurationvalue` (DB에만 `configurationidentity` 컬럼 추가로 있음) | `cacheManager.getConfString` |
| 메뉴 | `menu_tp` | `menuidentity` | `menuparentmenuidentity`, `menuurl`, `menudisplayorder`, `menudisplayyn`, `menusystem` | 로그인 후 메뉴 구성 |
| 메뉴 이름 | `menudictionary_tp` | `menudictionarymenuidentity`, `menudictionarylanguagecode` | `menudictionaryname` | 메뉴 표시명(언어별) |
| 권한 그룹 | `role_tp` | `roleidentity` | `rolename`, `rolehomemenuidentity` | 권한 그룹·첫 화면 |
| 그룹별 메뉴 | `rolemenu_tp` | `rolemenuroleidentity`, `rolemenuidentity` | — | 메뉴 권한 |
| 그룹 구성원 | `rolemember_tp` | `rolememberroleidentity`, `rolememberidentity`, `rolememberclassifycode` | `rolemembername` | 사용자·조직의 권한 그룹 |
| 알림 문구 | `alarmmessage` | `alarmmessagecategoryidentity`, `alarmmessagesubcategoryidentity` | `alarmmessagesubcategoryvalue` | 알림 메시지 |

- 배치 작업 정의 `batchtask_tp`도 같은 `_tp` 계열이다. 수정할 일이 있으면 batch 모듈 코드와 함께 확인한다.
- 그 밖의 기준 정보: 업무 분류 `business_main / business_mid / business_sub`·`business_team / business_owner / business_manager`, 서비스 카탈로그 `servicecatalog`·`vraservicecatalog`·`passervicecatalog`·`hypervservicecatalog`, 헬프데스크 분류(Helpdesk Classify 엔티티), `cuni_info`, `ip_master`, `mstr_sltn_prmtr`. 컬럼은 `columns <테이블>`로 확인한다.
- 모든 설정성 테이블에 `...createdate / createoperator / createoperatorname / modifydate / modifyoperator / modifyoperatorname`과 예비 컬럼 `...reserved1~5`가 있다. 등록 SQL을 쓸 때 같은 종류의 기존 행 값을 따른다.
- 엔티티에 `@Table`이 없는 테이블(예: `Project`)은 실제 이름을 `tables`로 찾는다. 스키마는 `check`·`tables` 결과로 확인한다.
- 조회하지 않는 테이블·컬럼: `credential`, `users`, `activedirectory`, `managementserver`의 비밀번호·키·토큰. 사람을 찾을 때도 식별자·이름 등 필요한 컬럼만 고른다.
- `configuration_tp`에는 `DB`·`SSO`·`LdapUrl`·`ActiveDirectory`·`API`·`K8sApi`·`VropsApi`·`ELK`·`TCP` 등 외부 접속 설정이 있다. 이 카테고리는 `configurationcategory`·`configurationname`만 조회하고 `configurationvalue`는 읽지 않는다.

## 메뉴 구조

- 트리: 최상위 `CUNI` 아래 `apm`(관리자)·`upm`(사용자). 메뉴 ID는 대체로 Admin `apm…`, User `upm…`로 시작하지만 예외가 있다(예: Admin 워크로드 목록 `upmWorkloadList`). 적용 대상은 ID가 아니라 `menusystem`으로 판단한다.
- `menusystem`은 코드사전 `PortalComponent`(`AdminPortal`·`UserPortal`), `menuclassify`는 `MenuType`(`Menu`·`Button` 등)이다. `Button` 행은 화면 안 버튼 권한이다(예: `apmDictionaryAdd`).
- 관리 화면(DB 메뉴 URL 확인): 메뉴관리 `/admin/menus/list`, 권한그룹별메뉴관리 `/admin/auth-menus/list`, 자료사전 `/admin/dictionaries/list`, 코드관리 `/admin/codes/list`, 포탈환경설정 `/admin/configurations/list`. 모두 `apmSystemManagement` 아래다.

## 대표 조회

```sql
-- 자료사전 키 등록 여부 (언어별)
SELECT dictionarylanguagecode, dictionarysettingvalue FROM dictionary_tp
WHERE dictionarycategory = 'Title' AND dictionaryname = 'BatchTask';
-- 화면 문구와 같은 기존 자료사전 키 찾기
SELECT dictionarycategory, dictionaryname, dictionarysettingvalue FROM dictionary_tp
WHERE dictionarylanguagecode = 'ko-KR' AND dictionarysettingvalue ILIKE '%<문구>%';
-- 코드사전 선택 목록
SELECT codename, codesettingvalue, codeorder, codeenableyn FROM code_tp
WHERE codecategory = '<카테고리>' AND codelanguagecode = '<언어>' ORDER BY codeorder;
-- 메뉴 트리와 표시명
SELECT m.menuidentity, m.menuparentmenuidentity, m.menuurl, m.menudisplayorder, d.menudictionaryname
FROM menu_tp m LEFT JOIN menudictionary_tp d ON d.menudictionarymenuidentity = m.menuidentity AND d.menudictionarylanguagecode = '<언어>'
WHERE m.menusystem = 'AdminPortal' ORDER BY m.menuparentmenuidentity, m.menudisplayorder;
-- 메뉴를 볼 수 있는 권한 그룹
SELECT r.roleidentity, r.rolename FROM rolemenu_tp rm JOIN role_tp r ON r.roleidentity = rm.rolemenuroleidentity
WHERE rm.rolemenuidentity = '<메뉴 ID>';
```

- 대소문자까지 일치해야 한다([자료사전·코드사전·설정](display-values.md)).

## 확인한 값

2026-10-15, `cuni_prg` 기준이다. 이 DB는 개발 서버 DB를 dump한 조회 전용 사본이라(사용자 제공 정보) dump 이후의 등록·변경은 없다. 다른 환경도 같다고 가정하지 않는다.

- 언어: 데이터의 언어 코드는 `ko-KR`·`en-US`·`zh-CN`이지만, 언어 코드사전 `Culture`는 `ko-KR`만 사용 여부 `Y`다. 자료사전 행은 `ko-KR` 2,318건, 다른 언어 각 1,062건이라 모든 키가 3개 언어로 있지 않다.
- 규모: 자료사전 93개 카테고리, 코드사전 178개 카테고리.
- 메뉴: `AdminPortal` 116개(버튼 6개 포함), `UserPortal` 161개.

- 키가 없으면 `미등록(사본 기준)`, 접속하지 못했으면 `확인 필요`로 둔다. 로컬 Admin에서 새로 등록한 값의 반영은 로컬 화면으로 확인한다. 조회한 DB 이름을 함께 기록한다.
- 등록·수정이 필요하면 직접 쓰지 않고 [query-db의 쓰기 절차](../../skills/query-db/SKILL.md#쓰기가-필요할-때)대로 검토용 SQL을 작성한다.

- 관련: [자료사전·코드사전·설정](display-values.md), [DB 접근과 권한](data-access.md), [미등록 값](../cases/display-value/temporary-value.md), [소스 기준](../maintenance/source-baseline.md).
