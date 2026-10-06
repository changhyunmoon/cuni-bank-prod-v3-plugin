#!/usr/bin/env node
// docs를 수정할 플러그인 루트, 코드를 읽을 업무 루트, 실행 모드(A/B/plan-only)를 판별한다. 파일을 수정하지 않는다.
// 사용: node resolve_roots.mjs [--business-root <경로>] [--plugin-root <플러그인 클론 경로>]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const MODULES = ["admin", "user", "cmp", "batch", "interface"];
const PLUGIN_NAME = "cuni-bank-v3-prod-plugin-v3";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null;
}

function git(dir, ...args) {
  try {
    return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function samePath(a, b) {
  return a && b && relative(resolve(a), resolve(b)) === "";
}

function gitState(dir) {
  const head = git(dir, "rev-parse", "HEAD");
  if (!head) return { git: false };
  const status = git(dir, "status", "--porcelain=v1") ?? "";
  return {
    git: true,
    head,
    branch: git(dir, "rev-parse", "--abbrev-ref", "HEAD"),
    dirty: status.length > 0,
    changed: status ? status.split("\n").length : 0,
  };
}

function checkPlugin(root) {
  const manifest = join(root, ".claude-plugin", "plugin.json");
  const problems = [];
  if (!existsSync(manifest)) problems.push("plugin.json 없음");
  else {
    try {
      const name = JSON.parse(readFileSync(manifest, "utf8")).name;
      if (name !== PLUGIN_NAME) problems.push(`플러그인 이름 불일치: ${name}`);
    } catch {
      problems.push("plugin.json 해석 실패");
    }
  }
  if (!existsSync(join(root, "docs", "README.md"))) problems.push("docs/README.md 없음");
  const normalized = root.replace(/\\/g, "/");
  const cached = /\/\.claude\/plugins\/(cache|marketplaces)\//.test(normalized);
  const top = git(root, "rev-parse", "--show-toplevel");
  const isClone = !cached && samePath(top, root);
  if (cached) problems.push("설치 캐시 경로 — 수정해도 저장소에 남지 않음");
  else if (!isClone) problems.push("git 작업 트리 루트가 아님");
  return { root, cached, writable: problems.length === 0, problems };
}

function looksLikeBusinessRoot(dir) {
  return MODULES.some((m) => existsSync(join(dir, m, ".git")));
}

const skillPlugin = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const override = arg("--plugin-root");
const plugin = checkPlugin(override ?? skillPlugin);
const cwd = process.cwd();

let business = arg("--business-root");
if (!business && !inside(plugin.root, cwd) && looksLikeBusinessRoot(cwd)) business = cwd;

const mode = !plugin.writable ? "plan-only" : inside(plugin.root, cwd) ? "A" : "B";
const notes = [];
if (override) notes.push("--plugin-root로 지정한 클론을 사용");
if (mode === "plan-only") notes.push("docs를 수정할 수 없다. 클론 경로를 --plugin-root로 받아 다시 실행하거나 계획 표까지만 진행한다.");
if (!business) notes.push("업무 루트 미확인 — 코드 추출이 필요하면 --business-root로 지정한다.");
else if (!looksLikeBusinessRoot(business)) notes.push(`업무 루트에 ${MODULES.join("·")} 저장소가 없다: ${business}`);

const repos = {};
if (business) for (const m of MODULES) {
  const dir = join(business, m);
  repos[m] = existsSync(dir) ? gitState(dir) : { exists: false };
}

console.log(JSON.stringify({
  mode,
  cwd,
  plugin_root: plugin.root,
  plugin_writable: plugin.writable,
  plugin_problems: plugin.problems,
  plugin_git: plugin.writable ? gitState(plugin.root) : null,
  skill_plugin_root: skillPlugin,
  business_root: business,
  repos,
  notes,
}, null, 2));
