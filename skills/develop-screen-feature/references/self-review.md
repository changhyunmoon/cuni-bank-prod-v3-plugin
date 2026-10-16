# 구현 자가 점검

구현을 마친 메인 Claude가 독립 검토를 요청하기 전에 직접 하는 점검이다. 기존 개발 표준·컨벤션에서 벗어난 부분을 스스로 찾아 고친다. 독립 검토([검증 에이전트 지침](verification.md))를 대신하지 않고, 결과를 독립 검토로 보고하지 않는다.

## 순서

1. 대상 모듈마다 `git status`·`git diff`로 변경 파일과 차이를 모은다. 기억이 아니라 실제 차이를 보고 점검한다.
2. 아래 점검 항목을 차례로 확인한다. 각 항목은 근거(참고 파일:줄, 검색 명령과 결과)를 보고 판정한다.
3. 위반은 바로 고친다. 고칠 때도 [작업 원칙](../SKILL.md#작업-원칙)을 따라 참고 기능과 같은 모양으로 되돌리는 방향으로만 고친다. 새 방어 코드·헬퍼를 더해 "개선"하지 않는다.
4. 고친 뒤 영향받은 항목만 다시 점검한다. 위반이 남지 않을 때까지 반복하되, 같은 항목이 2회 수정 후에도 남으면 원인과 선택지를 기록하고 사용자에게 묻는다.
5. 고치려면 승인된 설계의 파일·API 계약·흐름을 바꿔야 하면 고치지 말고 [재승인 기준](progress.md#전이-규칙)대로 해당 단계로 되돌린다.
6. 결과를 업무 결과 폴더 `verification.md`의 `자가 점검` 절에 남긴다: 항목 | 판정(통과/수정/해당 없음) | 근거 | 수정 파일. 통과 항목은 한 줄로 쓴다.

## 점검 항목

### 범위

- [ ] 변경 파일 목록이 설계 4절 파일 목록과 같다. 설계에 없는 파일·클래스·메서드·엔드포인트·DTO 필드·설정 키가 없다.
- [ ] 요구사항 ID(R-01…)마다 구현 위치를 하나씩 댈 수 있고, 요구사항에 없는 검증·옵션·기본값·제한·상태가 없다.
- [ ] 디버그 출력(`console.log`·`System.out`), 주석 처리한 옛 코드, 사용하지 않는 import·변수가 없다(임시값 아래 실제 조회 주석은 제외).

### 기존 구조와 나란히 비교

설계 2절 참고 기능 추적표의 파일을 열어 새 파일과 나란히 놓고 비교한다.

- [ ] 포탈 Controller·Proxy·CMP Controller·Service·Support/Mapper: 패키지 위치, 클래스·메서드·URL 명명, 어노테이션, 메서드 시그니처·반환 형식, 하위 계층 호출 방식이 참고 기능과 같다.
- [ ] 참고 기능에 없는 권한 확인, try/catch 예외 변환, 입력 보정·재검증, 정의 조회용 추가 엔드포인트, 상수·헬퍼 메서드가 없다([작업 원칙](../SKILL.md#작업-원칙) 2).
- [ ] 페이징·DB 접근은 설계에서 고른 기존 공통 코드(`createPageRequest`·`createPageDto`+`MybatisPaginationUtil`, 기존 Repository·Support)를 그대로 쓴다.
- [ ] 실패 처리는 공통 계약(예외 → `BaseException` 문구 → 기본 onFailed / 업무 실패 → `success=false` → onSuccess 분기)과 같다.
- [ ] 템플릿: 참고 화면과 같은 레이아웃·fragment 구조, 공통 함수(`grid`·`callAjax`·`saveData`·`showPopup`·`getCode`·`getDicList`·`getRenderCode`) 사용, 이벤트 등록 방식과 변수 명명이 같다.

### 공통 방식 재정의 검색

변경한 템플릿·JS에서 검색하고, 나온 것마다 사용자 결정 기록이 있는지 확인한다. 기록이 없으면 지운다.

- [ ] grid `pageLength`·`lengthMenu`·`language`, 엑셀 `customize`, `callAjax` `onFailed` 재정의 없음.
- [ ] 직접 `$.ajax`·`new DataTable`·`.DataTable(` 초기화, 자체 모달 없음.

### 하드코딩 검색

[하드코딩 경계](../../../docs/cases/display-value/hardcoding-boundary.md)의 "DB로 빼는 것"만 찾는다. "코드에 두는 것"은 지적하지 않는다.

- [ ] 변경한 템플릿·JS의 한글 리터럴(예: `[가-힣]` 검색)이 자료사전 조회 또는 `[임시값]` 표식이 붙은 임시값뿐이다.
- [ ] `$.alert`·`$.confirm` 인자, select 옵션, 코드 표시명, `Format.Date`·`Format.DateTime` 표시 형식이 리터럴이 아니다.
- [ ] `[임시값]`·`TEMP-DISPLAY-VALUE` 표식마다 바로 아래 실제 조회 코드 주석이 있다([미등록 값 개발 가이드](../../../docs/cases/display-value/temporary-value.md)).

### 시안 잔존

- [ ] `[프로토타입]` 함수·샘플 데이터·`<template>` 팝업·인라인 언어·자원 보정이 남지 않았다.
- [ ] 시안에 없던 class·`<style>`·인라인 style·요소를 더하지 않았다. 쓴 class가 모두 모듈 CSS나 표준에 있다.
- [ ] [일관성 점검표](../../../docs/cases/screen/consistency-check.md#점검표)를 실제 템플릿으로 확인했다.

### 프로젝트 규칙

- [ ] 대상 프로젝트 CLAUDE.md와 적용되는 .claude/rules를 지킨다.
- [ ] Java 8 문법만 쓴다(`var`, `List.of`·`Map.of`, `String.isBlank` 등 Java 9+ API 없음)([코딩 규칙](../../../docs/foundation/coding-rules.md)).
- [ ] 선택한 케이스 문서의 "복사하지 않을 기존 패턴"을 새 코드에 옮기지 않았다.
