# cuni-bank-v3-prod-plugin-v3

CUNi 개발 표준을 따르는 화면·백엔드 개발 스킬과 독립 검증 에이전트를 묶은 Claude Code 플러그인이다. 이 문서는 GitHub에서 플러그인을 가져와 업무 프로젝트에 연결하는 방법을 설명한다. 플러그인 내부 문서 구조는 [docs 라우터](docs/README.md)를 본다.

## 구성

| 구분 | 이름 | 용도 |
|---|---|---|
| 스킬 | `develop-screen-feature` | 요구사항 → HTML 시안 → 구현 설계 승인 후 CMP 백엔드까지 구현 |
| 스킬 | `prototype-screen` | 서버 연동 없이 배치·디자인만 확인하는 `prototype.html` 한 파일 작성 |
| 에이전트 | `screen-reviewer` | 요구사항 누락, 승인 화면과의 차이, 사용자 흐름 검토 (읽기 전용) |
| 에이전트 | `convention-reviewer` | docs 개발 표준·기존 구조 준수 검토 (읽기 전용) |
| 에이전트 | `backend-reviewer` | CMP API 계약·권한·데이터 접근·트랜잭션 검토 (읽기 전용) |

| 항목 | 값 |
|---|---|
| GitHub 저장소 | `changhyunmoon/cuni-bank-prod-v3-plugin` |
| 마켓플레이스 이름 | `cuni-bank-v3-prod-plugin-v3-marketplace` |
| 플러그인 이름 | `cuni-bank-v3-prod-plugin-v3` |

## 사전 준비

- Claude Code가 설치되어 있고 `/plugin` 명령을 쓸 수 있어야 한다.
- 비공개 저장소이면 `git clone https://github.com/changhyunmoon/cuni-bank-prod-v3-plugin.git`가 터미널에서 인증 없이 성공해야 한다. Claude Code는 로컬 git 자격 증명(Git Credential Manager, `gh auth login` 등)을 그대로 사용한다.
- 연결 대상은 **업무 루트**다. 업무 루트는 admin·user·cmp·batch·interface 5개 저장소를 담은 컨테이너 디렉터리이며(예: `C:\workspace\cuni-bank-v3-prod`), 자세한 구조는 [프로젝트 지도](docs/foundation/project-map.md)를 본다.

## 방법 1. GitHub 마켓플레이스로 설치 (권장)

업무 루트에서 Claude Code를 실행한 뒤 다음을 입력한다.

```text
/plugin marketplace add changhyunmoon/cuni-bank-prod-v3-plugin
/plugin install cuni-bank-v3-prod-plugin-v3@cuni-bank-v3-prod-plugin-v3-marketplace
```

- 첫 줄은 저장소의 `.claude-plugin/marketplace.json`을 마켓플레이스로 등록한다. 전체 URL(`https://github.com/changhyunmoon/cuni-bank-prod-v3-plugin.git`)을 써도 된다.
- 둘째 줄은 플러그인을 설치한다. 설치 범위를 물으면 아래 기준으로 고른다.

| 범위 | 저장 위치 | 언제 |
|---|---|---|
| user | `~/.claude/settings.json` | 내 PC의 모든 프로젝트에서 사용 |
| project | `<업무 루트>/.claude/settings.json` | 업무 루트에서만 사용 (권장) |
| local | `<업무 루트>/.claude/settings.local.json` | 업무 루트에서 나만 사용 |

터미널에서 한 번에 하려면 다음과 같이 실행한다.

```bash
claude plugin marketplace add changhyunmoon/cuni-bank-prod-v3-plugin
claude plugin install cuni-bank-v3-prod-plugin-v3@cuni-bank-v3-prod-plugin-v3-marketplace --scope project
```

설치 후 Claude Code를 재시작하면 적용된다.

## 방법 2. 업무 루트 설정 파일로 연결

여러 개발자가 같은 설정을 쓰려면 `<업무 루트>/.claude/settings.json`에 직접 적는다. 이 폴더에서 Claude Code를 열고 폴더를 신뢰하면 마켓플레이스 등록과 플러그인 설치를 안내받는다.

```json
{
  "extraKnownMarketplaces": {
    "cuni-bank-v3-prod-plugin-v3-marketplace": {
      "source": {
        "source": "github",
        "repo": "changhyunmoon/cuni-bank-prod-v3-plugin"
      }
    }
  },
  "enabledPlugins": {
    "cuni-bank-v3-prod-plugin-v3@cuni-bank-v3-prod-plugin-v3-marketplace": true
  }
}
```

- 특정 브랜치·태그를 쓰려면 `source`에 `"ref": "main"`처럼 추가한다.
- 업무 루트는 Git 저장소가 아니므로 이 파일은 공유되지 않는다. 각 개발자 PC에 같은 내용을 두거나 방법 1을 사용한다.

## 방법 3. 로컬 클론으로 연결

플러그인을 직접 수정하거나 네트워크 없이 쓰려면 클론한 폴더를 마켓플레이스로 등록한다.

```bash
git clone https://github.com/changhyunmoon/cuni-bank-prod-v3-plugin.git C:/workspace/cuni-bank-v3-prod-plugin-v3
```

```text
/plugin marketplace add C:/workspace/cuni-bank-v3-prod-plugin-v3
/plugin install cuni-bank-v3-prod-plugin-v3@cuni-bank-v3-prod-plugin-v3-marketplace
```

설치 없이 이번 세션에서만 불러오려면 업무 루트에서 다음처럼 실행한다. 플러그인 수정 내용을 바로 확인할 때 쓴다.

```bash
cd C:/workspace/cuni-bank-v3-prod
claude --plugin-dir C:/workspace/cuni-bank-v3-prod-plugin-v3
```

## 연결 확인

업무 루트에서 Claude Code를 열고 확인한다.

1. `/plugin`의 설치 목록에 `cuni-bank-v3-prod-plugin-v3`가 활성 상태로 보인다.
2. `/`를 입력하면 `/cuni-bank-v3-prod-plugin-v3:develop-screen-feature`, `/cuni-bank-v3-prod-plugin-v3:prototype-screen`이 보인다.
3. `/agents` 목록에 `screen-reviewer`, `convention-reviewer`, `backend-reviewer`가 보인다.

## 사용

반드시 **업무 루트**에서 Claude Code를 실행한다. 스킬은 업무 루트의 `CLAUDE.md`·`.claude/rules`와 5개 모듈 소스를 기준으로 동작한다.

```text
/cuni-bank-v3-prod-plugin-v3:develop-screen-feature Admin에 워크로드 사용량 목록 화면 추가해줘
/cuni-bank-v3-prod-plugin-v3:prototype-screen User 프로젝트 멤버 등록 팝업 시안 만들어줘
```

슬래시 명령 없이 화면 개발을 요청해도 스킬이 적용될 수 있다. 검증 에이전트는 스킬이 단계마다 호출한다.

- 작업 산출물(요구사항·시안·설계·검증 기록)은 플러그인이 아닌 업무 루트의 `outputs/<YYYYMMDD-feature-slug>/`에 저장된다. 기준은 [진행 기록 규칙](skills/develop-screen-feature/references/progress.md)을 본다.
- 커밋은 변경한 하위 저장소(admin·cmp 등)에서 각각 한다.

## 업데이트와 제거

```text
/plugin marketplace update cuni-bank-v3-prod-plugin-v3-marketplace
/plugin uninstall cuni-bank-v3-prod-plugin-v3@cuni-bank-v3-prod-plugin-v3-marketplace
```

- 새 버전을 배포할 때는 `.claude-plugin/plugin.json`의 `version`을 올린다. 버전이 같으면 설치된 캐시가 갱신되지 않을 수 있다.
- 방법 3으로 등록했으면 클론 폴더에서 `git pull` 후 마켓플레이스를 업데이트한다.

## 문제 해결

| 증상 | 확인 |
|---|---|
| 마켓플레이스 추가 시 인증·404 오류 | 터미널에서 `git clone`이 되는지 확인한다. 비공개 저장소 권한과 git 자격 증명을 점검한다. |
| 스킬이 목록에 없음 | 설치 범위가 현재 폴더에 적용되는지(`project`면 업무 루트에서 실행했는지) 확인하고 Claude Code를 재시작한다. |
| 스킬이 업무 코드를 찾지 못함 | 플러그인 폴더가 아니라 업무 루트에서 실행했는지 확인한다. |
| 업데이트가 반영되지 않음 | `plugin.json`의 `version`이 올라갔는지 확인하고 `/plugin marketplace update` 후 재시작한다. |
