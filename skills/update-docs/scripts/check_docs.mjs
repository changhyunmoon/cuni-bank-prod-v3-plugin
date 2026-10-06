#!/usr/bin/env node
// 플러그인 문서의 상대 링크, 라우터 등록, 줄 수, 비밀값 의심 패턴을 검사한다. 파일을 수정하지 않는다.
// 사용: node check_docs.mjs [--plugin-root <경로>] [--files <docs 상대 경로...>]
// 링크 깨짐·라우터 누락이 있으면 종료 코드 1. 줄 수·비밀값은 경고로만 보고한다.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SPLIT_LINES = 80;
const SCAN_DIRS = ["docs", "skills", "agents"];
const SCAN_FILES = ["README.md"];
const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "개인 키"],
  [/AKIA[0-9A-Z]{16}/, "AWS 액세스 키"],
  [/\b(password|passwd|pwd|secret|token|api[_-]?key)\b\s*[:=]\s*["']?[^\s"'<>{}$`|]{6,}/i, "비밀값 대입"],
  [/[a-z]+:\/\/[^\s/:@]+:[^\s/@]+@/i, "URL 내 자격 증명"],
];

function arg(name) {
  const i = process.argv.indexOf(name);
  if (i < 0) return null;
  const values = [];
  for (let j = i + 1; j < process.argv.length && !process.argv[j].startsWith("--"); j++) values.push(process.argv[j]);
  return values;
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith(".md")) out.push(path);
  }
  return out;
}

function stripCode(text) {
  return text.replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, " ")).replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));
}

function links(text) {
  const result = [];
  const re = /\]\(([^)\s]+)\)/g;
  stripCode(text).split("\n").forEach((line, i) => {
    for (const m of line.matchAll(re)) result.push({ target: m[1], line: i + 1 });
  });
  return result;
}

const root = resolve(arg("--plugin-root")?.[0] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".."));
const rel = (p) => relative(root, p).replace(/\\/g, "/");
const files = [...SCAN_DIRS.flatMap((d) => walk(join(root, d))), ...SCAN_FILES.map((f) => join(root, f)).filter(existsSync)];
const focus = arg("--files")?.map((f) => resolve(root, f));
const errors = [];
const warnings = [];

for (const file of files) {
  for (const { target, line } of links(readFileSync(file, "utf8"))) {
    if (/^[a-z]+:/i.test(target) || target.startsWith("#") || target.includes("<")) continue;
    const path = resolve(dirname(file), decodeURI(target.split("#")[0]));
    if (!existsSync(path)) errors.push(`링크 깨짐: ${rel(file)}:${line} → ${target}`);
  }
}

const router = join(root, "docs", "README.md");
const routed = new Set(links(readFileSync(router, "utf8")).map(({ target }) => resolve(dirname(router), target.split("#")[0])));
for (const file of walk(join(root, "docs", "cases"))) {
  if (!routed.has(file)) errors.push(`라우터 미등록 케이스: ${rel(file)}`);
}

const targets = focus ?? walk(join(root, "docs"));
for (const file of targets) {
  if (!existsSync(file)) {
    errors.push(`파일 없음: ${rel(file)}`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  const name = rel(file);
  if (lines.length > SPLIT_LINES && !/docs\/(README|maintenance\/)/.test(name)) {
    warnings.push(`${SPLIT_LINES}줄 초과(${lines.length}줄) — 분리 검토: ${name}`);
  }
  lines.forEach((l, i) => {
    for (const [re, label] of SECRET_PATTERNS) if (re.test(l)) warnings.push(`비밀값 의심(${label}): ${name}:${i + 1}`);
  });
}

console.log(JSON.stringify({ plugin_root: root, checked: files.length, errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);
