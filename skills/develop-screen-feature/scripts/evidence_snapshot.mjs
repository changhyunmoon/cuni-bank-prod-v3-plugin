// 승인·검증 대상 파일 및 독립 모듈 Git 상태를 기록/대조한다. 승인을 생성하지 않는다.
// 사용: node evidence_snapshot.mjs record --root <업무 루트> --files <파일·폴더...> [--modules <모듈...>] --output <json> [--kind approval-target|verification-target] [--version v1]
//       node evidence_snapshot.mjs verify --snapshot <json>
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const digest = (file) => sha256(fs.readFileSync(file));
const posix = (p) => p.split(path.sep).join('/');
const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile();
const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();

function within(root, target) {
  const resolved = path.resolve(target);
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`업무 루트 밖 경로: ${target}`);
  return resolved;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

function gitState(module) {
  const run = (...args) => execFileSync('git', ['-C', module, ...args], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] });
  try {
    const head = run('rev-parse', 'HEAD').toString().trim();
    const status = run('status', '--porcelain=v1', '-z', '--untracked-files=all');
    // 동일 경로의 미커밋 파일이 다시 바뀌는 경우도 검출한다.
    const diff = run('diff', 'HEAD', '--binary', '--no-ext-diff');
    const untracked = run('ls-files', '--others', '--exclude-standard', '-z').toString('utf8');
    const unhashed = [];
    for (const name of untracked.split('\0')) {
      if (!name) continue;
      const p = within(path.resolve(module), path.join(module, name));
      if (isFile(p)) unhashed.push([name, digest(p)]);
    }
    return { head, dirty: status.length > 0, status_sha256: sha256(status), diff_sha256: sha256(diff), untracked: unhashed };
  } catch (error) {
    return { unavailable: String(error.message || error) };
  }
}

function record(args) {
  const root = fs.realpathSync(path.resolve(args.root));
  const output = within(root, path.resolve(args.output));
  if (fs.existsSync(output)) throw new Error('기존 snapshot은 덮어쓰지 않는다. 새 버전 파일을 지정한다.');
  const paths = [];
  for (const item of args.files) {
    const p = within(root, path.resolve(root, item));
    if (isDir(p)) paths.push(...walk(p));
    else paths.push(p);
  }
  const files = {};
  for (const p of [...new Set(paths)].sort()) {
    within(root, p);
    if (p === output) throw new Error('snapshot 자신은 대상으로 지정할 수 없다.');
    if (!isFile(p)) throw new Error(`파일 없음: ${p}`);
    files[posix(path.relative(root, p))] = digest(p);
  }
  const modules = {};
  for (const name of args.modules) {
    const module = within(root, path.resolve(root, name));
    if (!fs.existsSync(path.join(module, '.git'))) throw new Error(`독립 Git 모듈 아님: ${module}`);
    const state = gitState(module);
    if (state.unavailable) throw new Error(`Git 기준 확인 불가: ${name}: ${state.unavailable}`);
    modules[posix(path.relative(root, module))] = state;
  }
  const data = {
    schema: 1, root, created_at: new Date().toISOString(),
    kind: args.kind, version: args.version, approval: 'not-recorded-by-this-tool',
    files, modules,
    directories: args.files.filter((x) => isDir(path.resolve(root, x)))
      .map((x) => posix(path.relative(root, within(root, path.resolve(root, x))))),
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ status: 'recorded', files: Object.keys(files).length, snapshot: output }));
  return 0;
}

function verify(args) {
  const data = JSON.parse(fs.readFileSync(args.snapshot, 'utf8'));
  if (data.schema !== 1) throw new Error('미지원 snapshot schema');
  const root = fs.realpathSync(path.resolve(data.root));
  const self = posix(path.relative(root, path.resolve(args.snapshot)));
  const changes = [];
  for (const [name, expected] of Object.entries(data.files)) {
    const p = within(root, path.resolve(root, name));
    if (!isFile(p) || digest(p) !== expected) changes.push({ file: name, reason: 'missing-or-changed' });
  }
  for (const folder of data.directories || []) {
    const dir = within(root, path.resolve(root, folder));
    for (const p of isDir(dir) ? walk(dir) : []) {
      const rel = posix(path.relative(root, p));
      if (rel !== self && !(rel in data.files)) changes.push({ file: rel, reason: 'added' });
    }
  }
  for (const [name, expected] of Object.entries(data.modules)) {
    const state = gitState(within(root, path.resolve(root, name)));
    if (JSON.stringify(state) !== JSON.stringify(expected)) changes.push({ module: name, reason: 'git-state-changed-or-unavailable' });
  }
  console.log(JSON.stringify({ status: changes.length ? 'stale' : 'current', changes }, null, 2));
  return changes.length ? 1 : 0;
}

function parse(argv) {
  const [command, ...rest] = argv;
  const args = { command, files: [], modules: [], kind: 'approval-target', version: 'v1' };
  let key = null;
  for (const token of rest) {
    if (token.startsWith('--')) { key = token.slice(2); if (!['files', 'modules'].includes(key)) args[key] = undefined; continue; }
    if (key === 'files' || key === 'modules') args[key].push(token);
    else if (key) { args[key] = token; key = null; }
  }
  if (command === 'record') {
    if (!args.root || !args.output || !args.files.length) throw new Error('record에는 --root, --files, --output이 필요하다.');
    if (!['approval-target', 'verification-target'].includes(args.kind)) throw new Error(`알 수 없는 --kind: ${args.kind}`);
  } else if (command === 'verify') {
    if (!args.snapshot) throw new Error('verify에는 --snapshot이 필요하다.');
  } else {
    throw new Error('명령은 record 또는 verify다.');
  }
  return args;
}

try {
  const args = parse(process.argv.slice(2));
  process.exitCode = args.command === 'record' ? record(args) : verify(args);
} catch (error) {
  console.log(JSON.stringify({ status: 'error', message: String(error.message || error) }));
  process.exitCode = 2;
}
