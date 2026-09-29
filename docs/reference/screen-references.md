# 화면 구현 기준과 참고 파일

> 범위: admin·user 화면 | 기준: 사용자가 지정한 최초 작성자 유승민의 화면 | 확인: 소스 구조, 실행 화면 미검증

새 화면은 아래 파일 중 같은 모듈·같은 화면 유형을 먼저 참고한다. 최초작성 이력에서 확인한 구조를 개발 표준으로 삼되 기존 결함까지 복사하지 않는다.

- 모듈별 적용 진입점: [Admin frontend](frontend-admin.md), [User frontend](frontend-user.md).
- 선정은 파일 상단 History의 `유승민 : 최초작성`을 기준으로 한다. author 필드나 중간 수정 주석만으로 최초작성자를 확정하지 않는다.
- 2026-09-29 양 모듈 templates 검색 결과 기준 Admin 19개, User 8개를 확인했다. Git 최초 커밋 작성자나 운영 배포 목록을 의미하지 않는다.

## 확인한 참고 화면

경로는 각 모듈의 `src/main/resources/templates/` 기준이다.

| 모듈·경로 | 화면 유형 | 가져올 구조 |
|---|---|---|
| admin `k8s/projectlist.html` | Rancher 구성원 동기화 | 좌측 프로젝트·우측 구성원, 4:8 분할 |
| admin `cloud/k8sworkload/workloadList.html` | 일반 목록 | 상단 검색·동작 영역 + 아래 표 |
| user `k8s/workloadList.html` | 사용자 목록 | User 전용 레이아웃·목록 클래스 |
| admin `monitoring/vmManagerManagement/bluksave.html` | 일괄 등록 팝업 | 파일 입력 → 미리보기 → 저장 |
| admin `serviceRequest/templates/K8sProjectEditView.html` | 변경 내용 조회 조각 | 변경 전·후 쿼타, `loadComponent(data)` |
| user `serviceRequest/templates/K8sProjectEditView.html` | 사용자 조회 조각 | User 테이블 스타일, 같은 데이터 표시 패턴 |
| admin `serviceRequest/templates/K8sProjectRemoveView.html` | 반납 대상 조회 조각 | 클러스터·프로젝트 읽기 전용 표시 |

- 위 파일은 상단 이력에서 유승민 최초작성을 확인했다. Rancher 화면의 모듈 내 위치는 `templates/k8s/projectlist.html`이다.
- user의 `serviceRequest/templates/K8sProjectRemoveView.html`에는 작성 이력이 없어 최초 작성자 기준 파일로 확정하지 않았다.
- `bluksave.html`은 실제 파일명이다. 참조할 때 임의로 `bulksave.html`로 고치지 않는다.
- 파일 헤더의 작성일은 소스 기재값이다. 실제 생성 시점이나 현재 배포 여부를 보증하지 않는다.

## 추가 확인한 최초작성 화면

위 7개와 아래 20개가 이번 기준 대상이다. 경로는 동일하게 각 모듈의 `src/main/resources/templates/` 기준이다.

| 모듈·경로 | 유형·표준으로 가져올 구조 |
|---|---|
| admin `serviceRequest/templates/K8sAppRemoveView.html` | 반납 목록 조각, emptyGrid |
| admin `serviceRequest/templates/K8sNamespaceView.html` | 생성 내용 조각, 전달 배열 표시 |
| admin `serviceRequest/templates/K8sNamespaceEditView.html` | 변경 전후 행 표시 |
| admin `serviceRequest/templates/K8sNamespaceRemoveView.html` | 반납 목록, 선택 비활성 |
| admin `serviceRequest/templates/K8sServicePowerOptionView.html` | 재배포 목록 조각 |
| admin `task/viewprogresscreatek8snamespace.html` | 생성 진행 팝업, 주기 재조회 |
| admin `task/viewprogresscreateprok8snamespace.html` | 운영 생성 진행 팝업 |
| admin `task/viewprogressreconfigurek8spower.html` | 재배포 진행 팝업 |
| admin `task/viewprogressremovek8sapp.html` | 워크로드 반납 진행 팝업 |
| admin `task/viewprogressremovek8snamespace.html` | 네임스페이스 반납 진행 팝업 |
| admin `task/viewprogressremovek8sproject.html` | 프로젝트 반납 진행 팝업 |
| admin `task/createtask/k8s/createnamespace/createk8snamespace.html` | 위저드 부모, 단계·저장 제어 |
| admin `task/createtask/k8s/createnamespace/task.html` | 입력 단계, 검증·데이터 조립 |
| admin `task/createtask/k8s/createnamespace/summary.html` | 요약 단계, 로컬 그리드 |
| user `serviceRequest/k8sManagementList.html` | 관리 목록, 검색·작업 연결 |
| user `serviceRequest/k8sReturnManagementList.html` | 반납 목록, 대상별 작업 연결 |
| user `serviceRequest/templates/K8sProjectEdit.html` | 입력 조각, validComponent 계약 |
| user `serviceRequest/templates/K8sNamespaceEdit.html` | 체크 행·변경 쿼타 검증 |
| user `serviceRequest/templates/K8sNamespaceProd.html` | 운영 생성, disabled 행·단위 검증 |
| user `serviceRequest/templates/K8sNamespaceEditView.html` | 변경 내용 조회 조각 |

## 기준에서 분리한 파일

- admin `task/viewprogressk8sprojectedit.html`, `task/viewprogressk8snamespaceedit.html`: 작성자 칸은 유승민이나 최초작성 이력은 천정훈이다. 유승민 최초작성 표준에는 포함하지 않는다.
- user `k8s/k8sProjectSelectPopup.html`, `k8s/namespaceSearchPopup.html`: 작성자 칸은 유승민이나 History가 비어 있다. 기능 보조 참고로만 분류한다.
- layout·TAS·업무관리 등의 중간 수정 주석은 최초작성 근거가 아니므로 기준 화면에 추가하지 않는다.

## 따라야 할 것과 보완할 것

- 레이아웃, 검색·버튼·표 배치, 함수 분리, 공통 그리드·팝업 함수 사용을 따른다.
- 기존 문구 하드코딩·중복 이벤트·사용하지 않는 변수까지 복사하지 않는다.
- 신규 파일에는 실제 작성 정보를 기록한다. 참고 파일의 작성자·날짜를 새 파일의 최초 작성자로 복사하지 않는다.
- 기존 파일 수정 시 원래 헤더를 유지하고 변경 이력을 추가한다.
- 시각적 완성 여부는 실제 화면에서 별도 확인한다. 현재 기준은 HTML·CSS 클래스·이벤트 구조 분석이다.

읽기 순서: [공통 작성 순서](../cases/screen/new-screen.md) → [목록·좌우 화면](../cases/screen/list-screen.md) / [팝업](../cases/screen/register-popup.md) / [조회 조각](../cases/screen/lookup-fragment.md).
