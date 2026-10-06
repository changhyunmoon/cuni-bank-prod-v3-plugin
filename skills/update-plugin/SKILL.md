---
name: update-plugin
description: 업무 프로젝트에서 쓰는 cuni-bank-v3-prod-plugin-v3 플러그인을 최신 버전으로 수동 업데이트한다. 설치 방식(로컬 폴더 마켓플레이스·GitHub 마켓플레이스·--plugin-dir 클론)을 판별해 필요한 git pull·marketplace update·plugin update를 실행하고 재시작을 안내한다. "플러그인 업데이트해줘", "최신 플러그인으로 바꿔줘" 요청에 사용한다.
disable-model-invocation: true
---

# 플러그인 업데이트

`/cuni-bank-v3-prod-plugin-v3:update-plugin`으로 사용자가 직접 호출할 때만 실행한다. 업무 루트에서 실행한다. 아래 상대 링크는 이 SKILL.md 위치 기준이다.

## 1. 상태 확인

```bash
node <이 스킬>/scripts/update_plugin.mjs status
```

결과를 아래 표로 요약해 보여준다.

| 항목 | 출처 |
|---|---|
| 이 세션의 플러그인 출처 | `session_source`: `installed-cache`(마켓플레이스 설치) / `plugin-dir`(클론) |
| 설치본별 현재 → 최신 버전 | `installs[].installed_version` → `latest_version`, `scope`, `applies_here` |
| 받아올 커밋 | `plugin_dir.incoming` 또는 `installs[].marketplace.clone.incoming` |
| 실행할 단계 | `steps[].what` |
| 막는 문제 / 주의 | `blockers`, `warnings` |

- `up_to_date`가 true면 이미 최신이라고 알리고 끝낸다.
- `blockers`가 있으면 실행하지 않는다. 각 문제와 해결 방법(커밋·정리, 원격 확인)을 안내하고 끝낸다. 사용자의 로컬 변경을 stash·reset·삭제하지 않는다.
- `warnings`의 "버전이 그대로"는 원격에 새 커밋이 있어도 설치 캐시가 바뀌지 않을 수 있다는 뜻이다. 그대로 전달한다.

## 2. 업데이트

막는 문제가 없으면 바로 실행한다. 사용자가 이 스킬을 호출한 것이 실행 승인이다.

```bash
node <이 스킬>/scripts/update_plugin.mjs apply
```

스크립트는 상태를 다시 확인한 뒤 다음을 차례로 실행하고, 하나라도 실패하면 거기서 멈춘다.

1. 클론(로컬 폴더 마켓플레이스 원본, `--plugin-dir` 폴더)이 원격보다 뒤처졌으면 `git pull --ff-only`
2. `claude plugin marketplace update <마켓플레이스>`
3. 현재 폴더에 적용되는 설치본마다 `claude plugin update <플러그인> --scope <범위>`

- `failed_at`이 있으면 `log`의 마지막 출력과 함께 실패 단계를 보고한다. 원인이 확실하지 않으면 다시 시도하지 않는다.
- `plugin update` 출력이 마켓플레이스 명령 확인(`shownCommand`)을 요구하면 실행하지 않고 그 명령을 사용자에게 보여준 뒤 직접 확인하도록 안내한다.

## 3. 보고

- 이전 → 새 버전, 받아온 커밋 목록(한 줄씩), 실행한 단계.
- **Claude Code를 재시작해야 새 버전이 적용된다.** 현재 세션의 스킬·에이전트는 이전 버전 그대로다.
- `--plugin-dir`로 연 세션이면 같은 `--plugin-dir` 옵션으로 다시 시작하라고 안내한다.
- 수동 확인 방법: `/plugin` 설치 목록의 버전, [README의 연결 확인](../../README.md#연결-확인).
