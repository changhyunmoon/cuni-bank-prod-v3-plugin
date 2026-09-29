# 시스템은 어떻게 나뉘어 있는가

> 범위: 5개 모듈 | 상태: 대표 코드 확인, 전체 호출·운영 환경 미검증

화면 요청은 주로 포탈에서 CMP로 전달된다. 배치와 망 연계는 별도 애플리케이션에서 동작한다.

## 모듈별 책임

| 모듈 | 맡는 일 | 데이터 접근 |
|---|---|---|
| admin·user | 화면 표시, 세션, 백엔드 요청 전달 | 주로 proxy 클라이언트로 호출 |
| cmp | 업무 처리, 데이터 저장, 클라우드 연동 | JPA·MyBatis와 외부 API·SDK |
| batch | 정해진 시간 또는 요청에 따른 일괄 작업 | 메인 DB 직접 접근, 외부 DB 조회, 일부 API·SDK |
| interface | 운영망과 개발망 사이 데이터 전달 | 반대망 HTTP 호출, 메인 DB 접근, CMP API |

## 대표 흐름

`브라우저 → 포탈 Controller → proxy Client → CMP Controller → Service → Repository → DB`

- Controller는 요청·응답을, Service는 업무 처리를, Repository·매퍼는 DB 접근을 담당한다.
- CMP는 여러 도메인을 한 애플리케이션에서 제공한다. `basic`, `member`, `approval` 등은 별도 실행 모듈과 구분한다.
- batch·interface는 포탈을 거치지 않고도 동작한다. 포탈의 세션·메뉴 검사만으로 모든 경로가 보호되지는 않는다.
- 각 모듈의 `common`에는 응답·설정·예외·유틸리티 등이 있지만, 같은 패키지명이라도 코드와 적용 설정은 다를 수 있다.
- `asis`는 이전 구현을 담는 영역이다. 신규 작업은 현재 도메인 코드를 먼저 찾고 실제 호출처를 확인한다.

## 작업별 다음 문서

- 화면에서 API 호출: [포탈과 proxy](../common/portal/backend-calls.md)
- 기존 기능 재사용·변경 영향: [기능별 화면·백엔드·DB 연결 지도](feature-map.md)
- 백엔드 구현: [CMP 계층과 DB](../modules/cmp/architecture.md)
- 정기 작업: [배치 구조](../modules/batch/architecture.md)
- 망 간 데이터 전달: [interface 구조](../modules/interface/architecture.md)
- 사용자 확인·권한: [데이터 접근 범위](data-access.md)

근거: 각 모듈의 `src/main/java/kr/datasolution/cuni/`와 [프로젝트 지도](../project-map.md).
