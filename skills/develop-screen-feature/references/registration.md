# 등록 값 목록과 테이블별 등록 SQL

5단계 완료 보고의 **등록 안내**를 이 형식으로 만든다. 순서는 ① 테이블별 등록 목록 → ② 테이블별 등록 SQL 파일 → ③ 실행 안내다. 등록 대상이 없는 테이블은 목록에 "없음"으로만 적고 SQL을 만들지 않는다.

## 1. 등록 값 모으기

- 구현한 파일에서 `[임시값]`·`TEMP-DISPLAY-VALUE` 표식과 그 아래 주석의 조회 코드(`getDicValue`·`getCode`·`getCodeValue`·`getConfString` 등)를 모두 찾는다.
- 설계 6절(사용 값)과 대조한다. 빠진 키, 설계에만 있고 코드에 없는 키를 정리한다.
- 값 형식(작성자 컬럼, 순서, `Y/N`, 언어)은 같은 카테고리의 기존 행을 조회해 맞춘다.

### 이미 저장되어 있는지 확인 (필수)

목록·SQL을 만들기 전에 **모든 키를 [query-db](../../query-db/SKILL.md)로 조회**한다. 코드 검색이나 기억으로 판단하지 않는다. 접속하지 못하면 목록·SQL을 만들되 전체를 `확인 필요`로 표시하고, 실행 전 확인 SELECT를 먼저 돌려 달라고 안내한다.

| 확인 | 조회 | 결과 처리 |
|---|---|---|
| 같은 키가 있는가 | 테이블별 키 전체를 `IN (...)` 한 번으로 조회 | 있고 값이 같으면 `확인됨` → 목록·SQL에서 뺀다 |
| 키는 있는데 값이 다른가 | 위 조회의 값 컬럼 비교 | `값 다름`으로 표시하고 INSERT에 넣지 않는다. 바꿀지 사용자에게 묻고, 바꾸기로 하면 별도 UPDATE 파일(`WHERE <키> AND <현재 값>`)로 만든다 |
| 같은 문구가 다른 키로 있는가(자료사전) | `dictionarysettingvalue`를 문구로 조회([대표 조회](../../../docs/reference/db-lookup.md#대표-조회)) | 기존 키를 쓰도록 구현을 고치고 새 키를 만들지 않는다. 고치지 않으면 이유를 적는다 |
| 메뉴 ID·URL이 이미 있는가 | `menu_tp`의 `menuidentity`, `menuurl` 조회 | URL이 다른 ID로 이미 등록됐으면 새 메뉴를 만들지 않고 그 메뉴를 쓴다. 형제 메뉴의 표시 순서와 겹치는지도 본다 |
| 권한 연결이 이미 있는가 | `rolemenu_tp`(권한 그룹 ID, 메뉴 ID) | 있으면 `확인됨` |

- 조회한 DB 이름·일시와 SQL은 작업 폴더(`evidence/db/registration-check-<날짜>.txt`)에 남기고, 목록의 상태 열(`확인됨 / 미등록 / 값 다름 / 확인 필요`)과 맞춘다.
- query-db DB는 개발 DB 사본이라 실행할 DB와 다를 수 있다. 그래서 SQL 파일의 실행 전 확인 SELECT와 `WHERE NOT EXISTS`로 실행 시점에 한 번 더 막는다. 확인 SELECT의 기대 건수(0건 등)를 주석으로 적는다.
- 완료 보고에는 "등록 필요 n건 / 이미 있음 n건 / 값 다름 n건 / 확인 필요 n건"을 테이블별로 적는다.

## 2. 테이블별 등록 목록 (사용자에게 보여 줄 표)

DB 테이블 하나에 표 하나를 만든다. 순서: 자료사전 → 코드사전 → 설정 → 메뉴 → 메뉴 이름 → 권한 그룹별 메뉴.

| 테이블 | 표 열 |
|---|---|
| `dictionary_tp` 자료사전 | 카테고리 / 이름 / 언어 / 값 / 순서 / 사용 위치(파일:줄) / 상태 |
| `code_tp` 코드사전 | 카테고리 / 이름(식별값) / 언어 / 값 / 순서 / 사용 여부 / 용도(표시·서버 로직) / 사용 위치 / 상태 |
| `configuration_tp` 설정 | 카테고리 / 이름 / 값 / 설명 / 사용 위치 / 상태 |
| `menu_tp` 메뉴 | 메뉴 ID / 상위 메뉴 ID / URL / 유형 / 적용 대상(`menusystem`) / 표시 순서 / 표시 여부 / 상태 |
| `menudictionary_tp` 메뉴 이름 | 메뉴 ID / 언어 / 표시명 / 상태 |
| `rolemenu_tp` 권한 그룹별 메뉴 | 권한 그룹 ID(이름) / 메뉴 ID / 상태 |

- 표 위에 테이블마다 한 줄 요약을 적는다: `자료사전 21건(Term 9, Title 1, Operation 11) — ko-KR`.
- 표 아래에 `[임시값]` 전환 위치(파일:줄)와 전환 방법(임시값 삭제, 바로 아래 주석 해제)을 적는다.
- 서버 로직이 읽는 코드사전·설정 값(허용 목록 등)은 "용도: 서버 로직"으로 표시하고, 로컬 검증 전에 등록이 필요함을 함께 적는다.

## 3. 테이블별 등록 SQL

[query-db 쓰기 절차](../../query-db/SKILL.md#쓰기가-필요할-때)를 따르되, **테이블 하나에 파일 하나, 변경문 하나**로 만든다. 그 테이블의 모든 행을 한 번에 등록한다.

- 위치: `outputs/<작업>/db/NN-<테이블>.sql`. 번호는 실행 순서다. 메뉴는 `menu_tp` → `menudictionary_tp` → `rolemenu_tp` 순서로 실행한다. 사전·코드·설정 파일은 순서와 무관하다.
- 파일 구성: 머리 주석(목적·대상 DB·작성일·영향 화면·실행자 확인 사항) → 실행 전 확인 SELECT → `BEGIN;` → INSERT 1개 → 실행 후 확인 SELECT → `ROLLBACK;`(기본. 확인 후 사람이 `COMMIT;`으로 바꾼다) → 되돌리는 DELETE(주석).
- 변경문은 `INSERT INTO <테이블> (...) SELECT ... FROM (VALUES (...), (...)) AS v(...) WHERE NOT EXISTS (SELECT 1 FROM <테이블> t WHERE t.<키> = v.<키> ...)` 형태로 쓴다. 기본키 제약이 없는 DB가 있으므로(CUNI-536 작업 DB) `ON CONFLICT`에 기대지 않는다. 다시 실행해도 이미 있는 행은 건너뛴다.
- 키 컬럼: `dictionary_tp`(category, name, languagecode), `code_tp`(category, name, languagecode), `configuration_tp`(category, name), `menu_tp`(menuidentity), `menudictionary_tp`(menuidentity, languagecode), `rolemenu_tp`(roleidentity, menuidentity). 컬럼 전체는 [DB 조회 지도](../../../docs/reference/db-lookup.md)와 `columns <테이블>`로 확인한다.
- NOT NULL 컬럼은 모두 채운다: 생성·수정 일시 `CURRENT_TIMESTAMP`, 생성·수정자는 같은 카테고리 기존 행의 값, 번역 여부 `N`, 코드 사용 여부 `Y`, 메뉴 `menuclassify`·`menudisplayyn`·`menuopenwindowyn`은 형제 메뉴 행과 같게.
- 사전 `description` 컬럼에는 `<화면명> - <사용 위치>`를 넣어 나중에 용도를 찾을 수 있게 한다.
- 외부 접속·인증 설정(`DB`·`SSO`·`LdapUrl`·API 계열)과 비밀값은 SQL에 실제 값을 넣지 않는다. `'<입력 필요>'`로 두고 실행자가 채우게 한다.
- 작성 후 확인 SELECT와 INSERT의 `SELECT ... FROM (VALUES ...)` 부분만 query-db로 실행해 문법·건수를 확인할 수 있다. INSERT 자체는 실행하지 않는다.

```sql
BEGIN;
INSERT INTO dictionary_tp (dictionarycategory, dictionarylanguagecode, dictionaryname, dictionarysettingvalue,
       dictionarydescription, dictionaryorder, dictionarytranslationyn, dictionarycreatedate, dictionarymodifydate,
       dictionarycreateoperator, dictionarycreateoperatorname, dictionarymodifyoperator, dictionarymodifyoperatorname)
SELECT v.c, 'ko-KR', v.n, v.val, v.d, 1, 'N', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '<작성자ID>', '<작성자명>', '<작성자ID>', '<작성자명>'
  FROM (VALUES ('Term', 'Apply', '적용', '<화면명> - 팝업 적용 버튼'),
               ('Operation', 'NoExportData', '내보낼 데이터가 없습니다.', '<화면명> - 내보내기 안내')) AS v(c, n, val, d)
 WHERE NOT EXISTS (SELECT 1 FROM dictionary_tp t WHERE t.dictionarycategory = v.c AND t.dictionaryname = v.n
                                                   AND t.dictionarylanguagecode = 'ko-KR');
SELECT count(*) FROM dictionary_tp WHERE dictionarylanguagecode = 'ko-KR' AND (dictionarycategory, dictionaryname) IN (('Term','Apply'), ('Operation','NoExportData'));
ROLLBACK; -- 확인 후 COMMIT; 으로 바꿔 실행
-- 되돌리기: DELETE FROM dictionary_tp WHERE dictionarylanguagecode = 'ko-KR' AND (dictionarycategory, dictionaryname) IN (...);
```

## 4. 실행 안내 (완료 보고에 그대로 넣는다)

| 순서 | 할 일 |
|---|---|
| 1 | 파일 목록과 테이블별 예상 등록 건수를 보여 준다(`01-dictionary_tp.sql` 21건 등) |
| 2 | 실행할 DB를 사용자가 고른다(로컬 개발 DB·공용 개발 DB·운영). 운영 반영 여부·시점은 사용자가 정한다 |
| 3 | 파일을 검토하고 `ROLLBACK;`을 `COMMIT;`으로 바꿔 실행한다. 확인 SELECT의 건수가 예상과 같은지 본다 |
| 4 | 실행 후 레이아웃 [캐시 초기화]를 누른다(Admin·CMP 캐시, [캐시 반영](../../../docs/cases/display-value/cache-refresh.md)). 메뉴·권한을 등록했으면 다시 로그인한다 |
| 5 | `[임시값]`을 지우고 아래 주석을 해제한 뒤 화면을 다시 확인한다(`Unknown`이 보이지 않는지) |

- SQL 대신 Admin 화면으로 등록해도 된다: 자료사전 `/admin/dictionaries/save`, 코드사전 `/admin/codes/save`, 설정 `/admin/configurations/save`, 메뉴 `/admin/menus/list`, 권한 `/admin/auth-menus/list`.
- 사용자가 실행했다고 하면 로컬 화면 표시로 반영을 확인한다. query-db는 개발 DB 사본이라 새 등록이 보이지 않는다. 실행 전에는 등록 완료로 보고하지 않는다.
