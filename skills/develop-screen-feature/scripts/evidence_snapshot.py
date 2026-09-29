"""승인·검증 대상 파일 및 독립 모듈 Git 상태를 기록/대조한다. 승인을 생성하지 않는다."""
import argparse
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def within(root, path):
    resolved = path.resolve()
    if not resolved.is_relative_to(root):
        raise ValueError(f"업무 루트 밖 경로: {path}")
    return resolved


def git_state(module):
    def run(*args):
        result = subprocess.run(["git", "-C", str(module), *args], capture_output=True, check=True)
        return result.stdout
    try:
        head = run("rev-parse", "HEAD").decode().strip()
        status = run("status", "--porcelain=v1", "-z", "--untracked-files=all")
        # 동일 경로의 미커밋 파일이 다시 바뀌는 경우도 검출한다.
        diff = run("diff", "HEAD", "--binary", "--no-ext-diff")
        untracked = run("ls-files", "--others", "--exclude-standard", "-z")
        unhashed = []
        for name in untracked.decode("utf-8", errors="strict").split("\0"):
            if name:
                path = within(module.resolve(), module / name)
                if path.is_file():
                    unhashed.append([name, digest(path)])
        return {"head": head, "dirty": bool(status),
                "status_sha256": hashlib.sha256(status).hexdigest(),
                "diff_sha256": hashlib.sha256(diff).hexdigest(), "untracked": unhashed}
    except (OSError, subprocess.CalledProcessError, UnicodeError, ValueError) as error:
        return {"unavailable": str(error)}


def record(args):
    root = Path(args.root).resolve(strict=True)
    output = within(root, Path(args.output))
    if output.exists():
        raise ValueError("기존 snapshot은 덮어쓰지 않는다. 새 버전 파일을 지정한다.")
    paths = []
    for item in args.files:
        path = within(root, root / item)
        if path.is_dir():
            paths.extend(p for p in path.rglob("*") if p.is_file())
        else:
            paths.append(path)
    files = {}
    for path in sorted(set(paths)):
        path = within(root, path)
        if path == output:
            raise ValueError("snapshot 자신은 대상으로 지정할 수 없다.")
        if not path.is_file():
            raise ValueError(f"파일 없음: {path}")
        files[path.relative_to(root).as_posix()] = digest(path)
    modules = {}
    for name in args.modules:
        module = within(root, root / name)
        if not (module / ".git").exists():
            raise ValueError(f"독립 Git 모듈 아님: {module}")
        state = git_state(module)
        if "unavailable" in state:
            raise ValueError(f"Git 기준 확인 불가: {name}: {state['unavailable']}")
        modules[module.relative_to(root).as_posix()] = state
    data = {"schema": 1, "root": str(root), "created_at": datetime.now(timezone.utc).isoformat(),
            "kind": args.kind, "version": args.version, "approval": "not-recorded-by-this-tool",
            "files": files, "modules": modules,
            "directories": [within(root, root / x).relative_to(root).as_posix()
                            for x in args.files if (root / x).is_dir()]}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "recorded", "files": len(files), "snapshot": str(output)}, ensure_ascii=False))


def verify(args):
    data = json.loads(Path(args.snapshot).read_text(encoding="utf-8"))
    if data.get("schema") != 1:
        raise ValueError("미지원 snapshot schema")
    root = Path(data["root"]).resolve(strict=True)
    changes = []
    for name, expected in data["files"].items():
        path = within(root, root / name)
        if not path.is_file() or digest(path) != expected:
            changes.append({"file": name, "reason": "missing-or-changed"})
    for folder in data.get("directories", []):
        for path in within(root, root / folder).rglob("*"):
            if path.is_file() and path.relative_to(root).as_posix() not in data["files"]:
                changes.append({"file": path.relative_to(root).as_posix(), "reason": "added"})
    for name, expected in data["modules"].items():
        if git_state(within(root, root / name)) != expected:
            changes.append({"module": name, "reason": "git-state-changed-or-unavailable"})
    print(json.dumps({"status": "stale" if changes else "current", "changes": changes}, ensure_ascii=False, indent=2))
    return 1 if changes else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    rec = commands.add_parser("record")
    rec.add_argument("--root", required=True)
    rec.add_argument("--files", nargs="+", required=True)
    rec.add_argument("--modules", nargs="*", default=[])
    rec.add_argument("--output", required=True)
    rec.add_argument("--kind", choices=["approval-target", "verification-target"], default="approval-target")
    rec.add_argument("--version", default="v1")
    ver = commands.add_parser("verify")
    ver.add_argument("--snapshot", required=True)
    args = parser.parse_args()
    try:
        return record(args) or 0 if args.command == "record" else verify(args)
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as error:
        print(json.dumps({"status": "error", "message": str(error)}, ensure_ascii=False))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
