#!/usr/bin/env node
// 이 플러그인의 설치 방식·현재 버전·최신 버전을 확인하고(status), 최신으로 업데이트한다(apply).
// 사용: node update_plugin.mjs status
//       node update_plugin.mjs apply [--dry-run]
// apply는 막는 문제(로컬 변경, fast-forward 불가 등)가 있으면 아무것도 실행하지 않는다.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_NAME = "cuni-bank-v3-prod-plugin-v3";

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, {
    cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" && cmd === "claude",
  }).trim();
}

function tryRun(cmd, args, cwd) {
  try {
    return run(cmd, args, cwd);
  } catch {
    return null;
  }
}

const git = (dir, ...args) => tryRun("git", ["-C", dir, ...args]);

function samePath(a, b) {
  return Boolean(a && b) && relative(resolve(a), resolve(b)) === "";
}

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function readVersion(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, ".claude-plugin", "plugin.json"), "utf8")).version;
  } catch {
    return null;
  }
}

// git 클론의 로컬·원격 상태. fetch로 원격 추적 브랜치만 갱신하고 작업 트리는 건드리지 않는다.
function cloneState(dir) {
  const top = git(dir, "rev-parse", "--show-toplevel");
  if (!samePath(top, dir)) return { git: false };
  const fetched = git(dir, "fetch", "--quiet") !== null;
  const upstream = git(dir, "rev-parse", "--abbrev-ref", "@{u}");
  const state = {
    git: true,
    branch: git(dir, "rev-parse", "--abbrev-ref", "HEAD"),
    head: git(dir, "rev-parse", "--short", "HEAD"),
    upstream,
    fetched,
    tracked_changes: Boolean(git(dir, "status", "--porcelain", "--untracked-files=no")),
    local_version: readVersion(dir),
  };
  if (upstream) {
    state.behind = Number(git(dir, "rev-list", "--count", "HEAD..@{u}") ?? 0);
    state.ahead = Number(git(dir, "rev-list", "--count", "@{u}..HEAD") ?? 0);
    try {
      state.upstream_version = JSON.parse(git(dir, "show", "@{u}:.claude-plugin/plugin.json") ?? "").version;
    } catch {
      state.upstream_version = null;
    }
    state.incoming = state.behind ? (git(dir, "log", "--oneline", "HEAD..@{u}") ?? "").split("\n").filter(Boolean) : [];
    // 받아올 파일과 이름이 같은 미추적 파일은 pull을 실패시킨다.
    const lines = (s) => (s ?? "").split("\n").filter(Boolean);
    const incomingFiles = new Set(lines(git(dir, "diff", "--name-only", "HEAD", "@{u}")));
    state.untracked_conflicts = lines(git(dir, "ls-files", "--others", "--exclude-standard")).filter((f) => incomingFiles.has(f));
  }
  return state;
}

function clonePullStep(dir, state, blockers, label) {
  if (!state.git) {
    blockers.push(`${label}: git 저장소가 아니다 (${dir}). 원본 폴더를 직접 최신으로 만든 뒤 다시 실행한다.`);
    return null;
  }
  if (!state.fetched) blockers.push(`${label}: 원격 fetch 실패 — 네트워크·git 자격 증명을 확인한다.`);
  if (!state.upstream) {
    blockers.push(`${label}: 현재 브랜치(${state.branch})에 추적 원격 브랜치가 없다.`);
    return null;
  }
  if (state.tracked_changes) blockers.push(`${label}: 커밋하지 않은 변경이 있다. 커밋·정리 후 다시 실행한다.`);
  if (state.untracked_conflicts?.length) blockers.push(`${label}: 받아올 파일과 겹치는 미추적 파일이 있다: ${state.untracked_conflicts.join(", ")}`);
  if (state.ahead && state.behind) blockers.push(`${label}: 로컬 커밋 ${state.ahead}개와 원격 커밋 ${state.behind}개가 갈라져 fast-forward 할 수 없다.`);
  if (!state.behind) return null;
  return { what: `${label} 원격 변경 ${state.behind}개 받기`, cmd: "git", args: ["-C", dir, "pull", "--ff-only"] };
}

function status() {
  const skillPlugin = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
  const normalized = skillPlugin.replace(/\\/g, "/");
  const sessionFromCache = /\/\.claude\/plugins\/cache\//.test(normalized);
  const cwd = process.cwd();
  const blockers = [];
  const warnings = [];
  const steps = [];
  const result = { cwd, session_plugin_root: skillPlugin, session_source: sessionFromCache ? "installed-cache" : "plugin-dir" };

  // --plugin-dir로 불러온 클론: 클론만 최신으로 만들면 다음 세션에 반영된다.
  if (!sessionFromCache) {
    const state = cloneState(skillPlugin);
    result.plugin_dir = { path: skillPlugin, version: readVersion(skillPlugin), ...state };
    const step = clonePullStep(skillPlugin, state, blockers, "--plugin-dir 클론");
    if (step) steps.push(step);
  }

  // 마켓플레이스 설치본.
  let installs = [];
  let marketplaces = [];
  try {
    installs = JSON.parse(run("claude", ["plugin", "list", "--json"]));
    marketplaces = JSON.parse(run("claude", ["plugin", "marketplace", "list", "--json"]));
  } catch (error) {
    warnings.push(`claude plugin 명령 실행 실패 — 설치본은 확인하지 못했다: ${error.message.split("\n")[0]}`);
  }
  const mine = installs.filter((p) => p.id.startsWith(`${PLUGIN_NAME}@`));
  const touched = new Set();
  result.installs = mine.map((p) => {
    const mkName = p.id.split("@")[1];
    const mk = marketplaces.find((m) => m.name === mkName) ?? null;
    const relevant = !p.projectPath || inside(p.projectPath, cwd) || samePath(p.projectPath, cwd);
    const entry = {
      id: p.id, scope: p.scope, installed_version: p.version, project_path: p.projectPath ?? null,
      enabled: p.enabled, applies_here: relevant, marketplace: mk && { name: mk.name, source: mk.source, location: mk.installLocation },
    };
    if (!relevant) return entry;
    if (mk && !touched.has(mk.name)) {
      touched.add(mk.name);
      if (mk.source === "directory") {
        const dir = mk.path ?? mk.installLocation;
        const state = samePath(dir, skillPlugin) && result.plugin_dir ? result.plugin_dir : cloneState(dir);
        entry.marketplace.clone = state;
        if (!samePath(dir, skillPlugin) || sessionFromCache) {
          const step = clonePullStep(dir, state, blockers, `마켓플레이스 원본 폴더(${mk.name})`);
          if (step) steps.push(step);
        }
      }
      steps.push({ what: `마켓플레이스 ${mk.name} 목록 갱신`, cmd: "claude", args: ["plugin", "marketplace", "update", mk.name] });
    }
    const clone = entry.marketplace?.clone;
    const latest = clone?.upstream_version ?? clone?.local_version ?? null;
    entry.latest_version = latest;
    if (latest && latest === p.version && clone?.behind) {
      warnings.push(`${p.id}: 원격에 새 커밋 ${clone.behind}개가 있지만 plugin.json 버전이 ${latest} 그대로다. 버전이 같으면 설치 캐시가 갱신되지 않을 수 있다 — 플러그인 관리자에게 버전 올리기를 요청한다.`);
    }
    steps.push({ what: `${p.id} (${p.scope}) 업데이트`, cmd: "claude", args: ["plugin", "update", p.id, "--scope", p.scope, "--json"], cwd: p.projectPath ?? cwd });
    return entry;
  });
  const pulls = steps.filter((s) => s.cmd === "git");
  const relevant = result.installs.filter((i) => i.applies_here);
  result.up_to_date = !pulls.length && relevant.every((i) => i.latest_version && i.latest_version === i.installed_version);
  if (result.up_to_date) steps.length = 0;
  if (!mine.length && sessionFromCache) warnings.push("설치 목록에서 이 플러그인을 찾지 못했다.");
  if (mine.length && !result.installs.some((i) => i.applies_here)) warnings.push("현재 폴더에 적용되는 설치본이 없다. 업무 루트에서 실행했는지 확인한다.");

  return { ...result, blockers, warnings, steps };
}

function apply(dryRun) {
  const plan = status();
  const log = [];
  if (plan.blockers.length || dryRun) return { ...plan, applied: false, dry_run: dryRun, log };
  for (const step of plan.steps) {
    try {
      const out = run(step.cmd, step.args, step.cwd);
      log.push({ step: step.what, ok: true, output: out.split("\n").slice(-5).join("\n") });
    } catch (error) {
      log.push({ step: step.what, ok: false, output: `${error.stdout ?? ""}${error.stderr ?? error.message}`.trim().split("\n").slice(-8).join("\n") });
      return { ...plan, applied: false, failed_at: step.what, log };
    }
  }
  return { ...plan, applied: true, log, next: "Claude Code를 재시작해야 새 버전이 적용된다." };
}

const command = process.argv[2];
const out = command === "apply" ? apply(process.argv.includes("--dry-run")) : command === "status" ? status() : null;
if (!out) {
  console.error("사용: node update_plugin.mjs status | apply [--dry-run]");
  process.exit(2);
}
console.log(JSON.stringify(out, null, 2));
process.exit(out.failed_at ? 1 : 0);
