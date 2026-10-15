#!/usr/bin/env node
// 업무 DB(PostgreSQL)를 조회 전용으로 읽는다. 쓰기·변경 SQL은 실행 전에 거부한다.
// 사용: node db_query.mjs setup                      pg 패키지를 사용자 영역에 설치(최초 1회)
//       node db_query.mjs check                      접속·계정·읽기 전용 여부 확인
//       node db_query.mjs tables [패턴]              테이블 목록 (패턴: ILIKE, 예: %_tp)
//       node db_query.mjs columns <테이블>           컬럼·PK 목록
//       node db_query.mjs query "<SQL>" [--limit N] [--format json|table]
//       node db_query.mjs query --file <sql 파일> [--limit N] [--format json|table]
// 접속 값: IP·포트·계정·비밀번호는 환경변수 CUNI_DB_HOST/PORT/USER/PASSWORD → ../config/db.local.json(.gitignore 대상) 순으로 받는다.
//          DB 이름·SSL 옵션은 환경변수 CUNI_DB_NAME/SSL_VERIFY/SSL_CA → ../config/db.json 순으로 사용한다.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(SCRIPT_DIR, "..", "config", "db.json");
const LOCAL_PATH = join(SCRIPT_DIR, "..", "config", "db.local.json");
// 플러그인 설치 캐시는 업데이트할 때 바뀌므로 의존 패키지는 사용자 영역에 둔다.
const DEPS_DIR = join(homedir(), ".claude", "cuni-db");
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 5000;
// 계정에 statement_timeout이 없을 때만 쓰는 문장 제한 시간. 계정 설정이 있으면 덮어쓰지 않는다.
const FALLBACK_TIMEOUT = "15s";
// 서버 응답이 없을 때 클라이언트가 기다리는 최대 시간.
const CLIENT_TIMEOUT_MS = 20000;

// 사용자 지정 기준: SELECT·WITH로 시작하는 조회만 허용한다. EXPLAIN(ANALYZE 제외)은 SQL 점검용으로 허용한다.
const ALLOWED_FIRST = new Set(["select", "with", "explain"]);
// 문장 어디에 있어도 거부하는 단어: 데이터 변경(변경 CTE·SELECT INTO 포함)과 DDL·권한 변경.
const FORBIDDEN_WORDS = [
  "insert", "update", "delete", "merge", "truncate", "into",
  "drop", "alter", "create", "grant", "revoke",
];
const LOCKING = /\bfor\s+(no\s+key\s+update|update|key\s+share|share)\b/;
const FORBIDDEN_FUNCS = [
  "pg_terminate_backend", "pg_cancel_backend", "pg_reload_conf", "pg_rotate_logfile", "set_config",
  "nextval", "setval", "pg_sleep", "pg_read_file", "pg_read_binary_file", "pg_ls_dir", "pg_stat_file",
  "lo_import", "lo_export", "lo_create", "lo_unlink", "dblink", "dblink_exec", "pg_advisory_lock",
  "pg_advisory_xact_lock", "pg_notify", "txid_current", "pg_current_xact_id",
];
const SECRET_COLUMN = /password|passwd|pwd|secret|token|private_?key|api_?key|credential|salt/i;

function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, error: message, ...extra }, null, 2));
  process.exit(1);
}

function loadConfig() {
  const file = readJson(CONFIG_PATH);
  // 접속 비밀 정보는 커밋하지 않는 로컬 파일에만 둔다.
  const local = readJson(LOCAL_PATH);
  const env = process.env;
  return {
    host: env.CUNI_DB_HOST || local.host,
    port: Number(env.CUNI_DB_PORT || local.port),
    database: env.CUNI_DB_NAME || file.database,
    user: env.CUNI_DB_USER || local.user,
    password: env.CUNI_DB_PASSWORD || local.password,
    // 서버 pg_hba가 암호화 접속만 허용한다. ssl_verify가 true면 인증서를 검증하며, 사내 CA는 PEM 파일로 지정한다.
    ssl: sslOptions(env.CUNI_DB_SSL_CA || file.ssl_ca, (env.CUNI_DB_SSL_VERIFY ?? String(file.ssl_verify ?? true)) !== "false"),
  };
}

// ssl_verify=false는 사내망 전용 서버의 자체 서명 인증서를 쓰기 위한 사용자 결정이다(2026-10-15). 암호화는 유지한다.
function readJson(path) {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`설정 파일을 읽지 못했습니다: ${path} (${e.message})`);
  }
}

function sslOptions(caPath, verify) {
  if (!verify) return { rejectUnauthorized: false };
  if (!caPath) return true;
  if (!existsSync(caPath)) fail(`사내 CA 파일이 없습니다: ${caPath}`);
  return { ca: readFileSync(caPath, "utf8") };
}

function loadPg() {
  try {
    return createRequire(join(DEPS_DIR, "package.json"))("pg");
  } catch {
    fail("pg 패키지가 없습니다. 먼저 `node db_query.mjs setup`을 실행하세요.", { deps_dir: DEPS_DIR });
  }
}

function setup() {
  mkdirSync(DEPS_DIR, { recursive: true });
  const pkg = join(DEPS_DIR, "package.json");
  if (!existsSync(pkg)) {
    writeFileSync(pkg, JSON.stringify({ name: "cuni-db-deps", private: true }, null, 2));
  }
  execSync("npm install pg@8 --no-audit --no-fund", { cwd: DEPS_DIR, stdio: "inherit" });
  console.log(JSON.stringify({ ok: true, deps_dir: DEPS_DIR }, null, 2));
}

// 문자열·식별자 따옴표·주석을 비워서 키워드 검사가 값 안의 단어에 걸리지 않게 한다.
function maskSql(sql) {
  let out = "";
  for (let i = 0; i < sql.length;) {
    const c = sql[i];
    const next = sql[i + 1];
    if (c === "-" && next === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      out += " ";
    } else if (c === "/" && next === "*") {
      const end = sql.indexOf("*/", i + 2);
      if (end < 0) fail("닫히지 않은 주석이 있습니다.");
      i = end + 2;
      out += " ";
    } else if (c === "'" || c === '"') {
      let j = i + 1;
      for (;;) {
        if (j >= sql.length) fail("닫히지 않은 따옴표가 있습니다.");
        if (sql[j] === c) {
          if (sql[j + 1] === c) { j += 2; continue; }
          break;
        }
        j++;
      }
      out += c === "'" ? "''" : '"x"';
      i = j + 1;
    } else if (c === "$") {
      const tag = /^\$[A-Za-z_]*\$/.exec(sql.slice(i));
      if (!tag) { out += c; i++; continue; }
      const end = sql.indexOf(tag[0], i + tag[0].length);
      if (end < 0) fail("닫히지 않은 $ 문자열이 있습니다.");
      out += "''";
      i = end + tag[0].length;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

function checkReadOnly(sql) {
  const masked = maskSql(sql).trim().replace(/;\s*$/, "");
  if (!masked) fail("SQL이 비어 있습니다.");
  if (masked.includes(";")) fail("여러 문장은 실행하지 않습니다. 한 번에 한 문장만 보내세요.");
  const lower = masked.toLowerCase();
  const first = lower.match(/^[a-z]+/)?.[0];
  if (!ALLOWED_FIRST.has(first)) {
    fail(`조회 문장만 실행합니다(SELECT/WITH, 점검용 EXPLAIN). 받은 문장: ${first ?? "?"}`, WRITE_HINT);
  }
  if (first === "explain" && /\banalyze\b/.test(lower)) fail("EXPLAIN ANALYZE는 실제로 실행되므로 거부합니다. EXPLAIN만 사용하세요.");
  for (const word of FORBIDDEN_WORDS) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) fail(`조회 문장에 쓸 수 없는 키워드입니다: ${word.toUpperCase()}`, WRITE_HINT);
  }
  if (LOCKING.test(lower)) fail("행 잠금(FOR UPDATE/SHARE)은 쓰지 않습니다.");
  for (const fn of FORBIDDEN_FUNCS) {
    if (new RegExp(`\\b${fn}\\s*\\(`).test(lower)) fail(`조회에 쓸 수 없는 함수입니다: ${fn}`);
  }
  return { sql: sql.trim().replace(/;\s*$/, ""), first };
}

const WRITE_HINT = {
  hint: "DB 쓰기·수정은 하지 않는다. 사람이 검토·실행할 SQL 파일을 작성해 안내한다(query-db SKILL.md의 '쓰기가 필요할 때').",
};

function maskSecrets(fields, rows) {
  const secret = fields.filter((f) => SECRET_COLUMN.test(f)).map(String);
  if (!secret.length) return { rows, masked: [] };
  return {
    rows: rows.map((r) => {
      const copy = { ...r };
      for (const f of secret) if (copy[f] != null) copy[f] = "***";
      return copy;
    }),
    masked: secret,
  };
}

async function withClient(fn) {
  const { Client } = loadPg();
  const cfg = loadConfig();
  const missing = ["host", "port", "user", "password", "database"].filter((k) => !cfg[k]);
  if (missing.length) {
    fail("접속 정보가 없습니다. config/db.local.example.json을 db.local.json으로 복사해 값을 채워 달라고 사용자에게 요청한다. 값을 추측하거나 업무 설정에서 가져오지 않는다.", { missing, local_config: LOCAL_PATH });
  }
  if (!Number.isInteger(cfg.port)) fail("port는 숫자여야 합니다.");
  const client = new Client({
    ...cfg,
    connectionTimeoutMillis: 8000,
    query_timeout: CLIENT_TIMEOUT_MS,
    application_name: "claude-query-db",
  });
  try {
    await client.connect();
  } catch (e) {
    fail(`DB에 접속하지 못했습니다: ${e.message}`, {
      target: `${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}`,
      hint: connectHint(e),
    });
  }
  try {
    await client.query("BEGIN READ ONLY");
    const { statement_timeout: current } = (await client.query("SHOW statement_timeout")).rows[0];
    if (current === "0") await client.query(`SET LOCAL statement_timeout = '${FALLBACK_TIMEOUT}'`);
    return await fn(client);
  } catch (e) {
    fail(e.message, { code: e.code, position: e.position });
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    await client.end().catch(() => {});
  }
}

function connectHint(e) {
  if (e.code === "28P01" || e.code === "28000" && /password/.test(e.message)) {
    return "계정 또는 비밀번호가 맞지 않습니다. 사용자에게 계정 상태 확인을 요청한다. 다른 계정으로 대신 접속하지 않는다.";
  }
  if (e.code === "28000") return "서버 접속 허용(pg_hba) 목록에 없습니다. 사용자에게 DB 관리자 확인을 요청한다.";
  if (/certificate|self[- ]signed|CERT/i.test(e.message)) {
    return "서버 인증서를 검증하지 못했습니다. config/db.json의 ssl_verify·ssl_ca(또는 CUNI_DB_SSL_VERIFY·CUNI_DB_SSL_CA) 설정을 확인한다.";
  }
  return "사내망·VPN 연결을 확인한다. VPN이 필요하면 사용자에게 연결을 요청하고 기다린다.";
}

function parseArgs(argv) {
  const opts = { limit: DEFAULT_LIMIT, format: "json", positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") opts.limit = Number(argv[++i]);
    else if (a === "--format") opts.format = argv[++i];
    else if (a === "--file") opts.file = argv[++i];
    else opts.positional.push(a);
  }
  if (!Number.isInteger(opts.limit) || opts.limit < 1) fail("--limit는 1 이상의 정수여야 합니다.");
  opts.limit = Math.min(opts.limit, MAX_LIMIT);
  return opts;
}

function print(result, format) {
  if (format === "table") {
    const { fields, rows } = result;
    console.log(fields.join("\t"));
    for (const r of rows) console.log(fields.map((f) => (r[f] == null ? "" : String(r[f]).replace(/\s+/g, " "))).join("\t"));
    console.log(`-- ${rows.length}행${result.truncated ? ` (상한 ${result.limit}행에서 잘림)` : ""}`);
    if (result.masked.length) console.log(`-- 가린 컬럼: ${result.masked.join(", ")}`);
    return;
  }
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

async function runSelect(client, sql, first, limit) {
  // 행 수 상한: 조회 문장은 바깥에서 감싸 limit+1행만 가져온다. EXPLAIN은 그대로 실행한다.
  const wrap = first !== "explain";
  const text = wrap ? `SELECT * FROM (\n${sql}\n) AS _q LIMIT ${limit + 1}` : sql;
  const res = await client.query(text);
  const fields = res.fields.map((f) => f.name);
  const truncated = res.rows.length > limit;
  const rows = truncated ? res.rows.slice(0, limit) : res.rows;
  const secret = maskSecrets(fields, rows);
  return { fields, rows: secret.rows, row_count: secret.rows.length, truncated, limit, masked: secret.masked };
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const opts = parseArgs(rest);

  if (cmd === "setup") return setup();

  if (cmd === "check") {
    return withClient(async (c) => {
      const info = (await c.query(
        "SELECT current_user AS user, current_database() AS database, version() AS version, " +
        "current_setting('transaction_read_only') AS transaction_read_only",
      )).rows[0];
      // 권한은 상속 역할로 받을 수 있으므로 직접 부여 목록 대신 실제 권한을 센다.
      const roles = (await c.query(
        "SELECT rolname FROM pg_roles WHERE pg_has_role(current_user, oid, 'member') AND rolname <> current_user ORDER BY 1",
      )).rows.map((r) => r.rolname);
      const privs = (await c.query(
        "SELECT count(*)::int AS tables, " +
        "count(*) FILTER (WHERE has_table_privilege(c.oid, 'SELECT'))::int AS selectable, " +
        "count(*) FILTER (WHERE has_table_privilege(c.oid, 'INSERT,UPDATE,DELETE,TRUNCATE'))::int AS writable " +
        "FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace " +
        "WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname NOT LIKE 'pg_toast%' " +
        "AND c.relkind IN ('r', 'v', 'm', 'p')",
      )).rows[0];
      console.log(JSON.stringify({ ok: true, ...info, member_of: roles, table_privileges: privs }, null, 2));
    });
  }

  if (cmd === "tables") {
    const pattern = opts.positional[0] || "%";
    return withClient(async (c) => print(await runSelect(c,
      "SELECT table_schema, table_name, table_type FROM information_schema.tables " +
      `WHERE table_schema NOT IN ('pg_catalog','information_schema') AND table_name ILIKE ${literal(pattern)} ` +
      "ORDER BY table_schema, table_name", "select", opts.limit), opts.format));
  }

  if (cmd === "columns") {
    const table = opts.positional[0];
    if (!table) fail("테이블 이름을 주세요. 예: columns dictionary_tp");
    return withClient(async (c) => print(await runSelect(c,
      "SELECT c.table_schema, c.ordinal_position AS no, c.column_name, c.data_type, c.character_maximum_length AS len, " +
      "c.is_nullable AS nullable, c.column_default AS default_value, " +
      "EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage k " +
      "ON tc.constraint_name = k.constraint_name AND tc.table_schema = k.table_schema " +
      "WHERE tc.constraint_type = 'PRIMARY KEY' AND k.table_schema = c.table_schema AND k.table_name = c.table_name " +
      "AND k.column_name = c.column_name) AS pk " +
      `FROM information_schema.columns c WHERE c.table_name = ${literal(table)} ` +
      "ORDER BY c.table_schema, c.ordinal_position", "select", opts.limit), opts.format));
  }

  if (cmd === "query") {
    const raw = opts.file ? readFileSync(opts.file, "utf8") : opts.positional.join(" ");
    const { sql, first } = checkReadOnly(raw);
    return withClient(async (c) => print(await runSelect(c, sql, first, opts.limit), opts.format));
  }

  fail("명령을 알 수 없습니다. setup | check | tables | columns | query 중 하나를 사용하세요.");
}

function literal(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

main();
