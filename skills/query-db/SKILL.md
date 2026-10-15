---
name: query-db
description: 업무 DB(PostgreSQL)를 조회 전용 계정으로 읽어 자료사전·코드사전·설정·메뉴·권한 등 DB로 관리하는 값의 등록 여부와 실제 값을 확인한다. 화면·백엔드 작업 중 "이 키가 등록돼 있나", "메뉴·권한 구성이 어떻게 돼 있나", "테이블 컬럼이 뭐지"를 코드만으로 확정할 수 없을 때 사용한다. DB 쓰기·수정은 하지 않고, 필요하면 사람이 검토·실행할 SQL만 작성한다.
---

# DB 조회 (읽기 전용)

업무 루트에서 실행한다. 아래 상대 링크는 이 SKILL.md 위치 기준이다. 조회할 테이블과 대표 쿼리는 [DB 조회 지도](../../docs/reference/db-lookup.md)를 본다.

## 원칙

1. **읽기만 한다.** 계정 권한(SELECT만)과 별개로 스크립트도 조회 문장 외에는 실행 전에 거부한다. 거부를 우회하는 SQL을 만들지 않는다.
2. **쓰기가 필요하면 SQL 파일을 작성해 사람에게 넘긴다.** 아래 [쓰기가 필요할 때](#쓰기가-필요할-때)를 따른다.
3. **필요한 만큼만 읽는다.** 조건·컬럼을 좁혀 조회한다. `SELECT *`는 컬럼 확인용 소량 조회에만 쓴다.
4. **비밀·개인정보는 읽지 않는다.** `credential`, `users`, `activedirectory`, `managementserver`의 비밀번호·키·토큰 컬럼은 조회하지 않는다. 스크립트가 이름으로 의심되는 컬럼 값을 `***`로 가리지만 그것에 기대지 않는다.
5. **조회 결과를 문서·코드에 복사하지 않는다.** 등록 여부·키·구조만 기록한다. 운영 데이터 값을 docs에 남기지 않는다.
6. **DB는 개발 환경 기준이다.** 조회한 DB(`check`의 `database`)를 결과에 함께 적는다. 다른 환경에도 같은 값이 있다고 단정하지 않는다.

## 준비

```bash
node <이 스킬>/scripts/db_query.mjs setup   # 최초 1회: pg 패키지를 ~/.claude/cuni-db에 설치
node <이 스킬>/scripts/db_query.mjs check   # 접속 계정·DB·읽기 전용 여부·권한 확인
```

- 접속 IP·포트·계정·비밀번호는 `config/db.local.json`에 둔다. 이 파일은 `.gitignore` 대상이라 커밋되지 않는다. 없으면 `config/db.local.example.json`을 복사해 DB 담당자에게 받은 값을 채운다.
- `missing` 오류가 나면 사용자에게 위 파일 작성을 요청한다. 값을 추측하거나 업무 설정·대화 기록에서 가져오지 않으며, 받은 값을 docs·SKILL·커밋에 적지 않는다. `db.local.json`을 `git add`하지 않는다.
- 플러그인 업데이트로 설치 위치가 바뀌면 `db.local.json`도 새 위치에 있어야 한다. 로컬 폴더 마켓플레이스 설치는 클론의 파일이 함께 복사되고, GitHub로 설치했으면 새 설치 위치에 다시 만든다. 환경변수 `CUNI_DB_HOST/PORT/USER/PASSWORD`가 있으면 그 값을 먼저 쓴다.
- DB 이름(`cuni_prg`)과 SSL 옵션은 `config/db.json`에 있고 환경변수 `CUNI_DB_NAME/SSL_VERIFY/SSL_CA`로 바꿀 수 있다.
- 서버는 SSL 접속만 허용하고 자체 서명 인증서를 쓴다. 사내망 전용이라 사용자 결정으로 `ssl_verify: false`(암호화는 유지, 인증서 검증 생략)로 둔다. 검증하려면 `ssl_verify: true`와 `ssl_ca`(PEM 경로)를 지정한다.
- `check`의 `table_privileges.writable`이 0이 아니면 조회를 멈추고 사용자에게 계정 권한 확인을 요청한다.
- 접속에 실패하면 출력의 `hint`를 사용자에게 전달하고 기다린다. VPN·사내망, 계정 상태, 인증서 순으로 원인을 좁힌다. 다른 계정이나 업무 설정(`application-datasource.yml`)의 자격증명으로 대신 접속하지 않는다.

## 조회

```bash
node <이 스킬>/scripts/db_query.mjs tables %_tp                 # 테이블 찾기 (ILIKE 패턴)
node <이 스킬>/scripts/db_query.mjs columns dictionary_tp        # 컬럼·PK
node <이 스킬>/scripts/db_query.mjs query "SELECT ... " --format table
node <이 스킬>/scripts/db_query.mjs query --file <조회.sql> --limit 500
```

- 한 번에 한 문장만 실행한다. 허용: `SELECT / WITH / EXPLAIN / SHOW / TABLE / VALUES`. `EXPLAIN ANALYZE`, `FOR UPDATE`, 쓰기 키워드·부작용 함수는 거부된다.
- 세션은 `BEGIN READ ONLY`로 열고 끝나면 `ROLLBACK`한다. 문장 제한 시간은 15초, 기본 200행(상한 5000)이다. `truncated: true`면 조건을 좁힌다.
- 조회 값에 따옴표가 들어가면 `'`를 `''`로 바꾼다. 긴 SQL은 스크래치 폴더에 파일로 써서 `--file`로 넘긴다.
- 결과 보고: 실행한 SQL, 조회한 DB, 결론(예: `확인됨 / 미등록`)을 짧게 적는다. 코드 근거와 DB 결과가 다르면 둘 다 적는다.

## 쓰기가 필요할 때

값 등록·수정·삭제, 메뉴·권한 추가 등은 직접 하지 않는다. 사람이 검토하고 실행할 SQL을 만든다.

1. 대상 테이블의 컬럼·PK를 `columns`로 확인하고, 같은 종류의 기존 행을 조회해 값 형식(언어 코드, 순서, `Y/N`, 작성자 컬럼)을 맞춘다.
2. 작업 산출물 폴더(`outputs/<작업>/db/`, 없으면 사용자에게 위치를 묻는다)에 `NN-<내용>.sql`로 저장한다. 파일 구성:
   - 머리 주석: 목적, 대상 DB, 작성일, 영향 화면·코드, 실행자 확인 사항
   - 실행 전 확인 SELECT (현재 상태)
   - `BEGIN;` → 변경문 → 확인 SELECT → `-- COMMIT;` / `ROLLBACK;` (기본은 ROLLBACK, 확인 후 사람이 COMMIT으로 바꾼다)
   - 변경문은 다시 실행해도 안전하게 쓴다. 예: `INSERT ... ON CONFLICT (<PK>) DO NOTHING`, `UPDATE ... WHERE <PK> AND <현재 값>`
   - 되돌리는 SQL (주석)
3. 사용자에게 파일 경로, 바뀌는 행 수 예상, 실행 후 할 일(캐시 갱신: [캐시 반영](../../docs/cases/display-value/cache-refresh.md))을 안내하고 "검토 후 직접 실행해 달라"고 요청한다. Admin 등록 화면으로 넣을 수 있는 값이면 그 경로도 함께 알린다.
4. 사용자가 실행했다고 하면 `query`로 반영을 확인하고 결과를 보고한다. 실행 전에는 등록 완료로 보고하지 않는다.

- 운영 DB용 SQL은 개발 DB에서 확인한 형식을 근거로 쓰되, 운영 반영 여부·시점은 사용자가 정한다.
- 대량 삭제·스키마 변경(DDL)은 SQL 작성 전에 범위와 필요성을 사용자와 먼저 확인한다.
