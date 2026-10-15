# 테스트 현황과 실행 전 확인

> 범위: 업무 프로젝트 5개 모듈 | 상태: 소스·Gradle 설정 확인, 테스트 미실행 | 근거: 각 모듈 build.gradle·src/test

| 모듈 | 확인한 테스트 소스 | `useJUnitPlatform()` |
|---|---|---|
| admin | JUnit Jupiter·Playwright 기반 화면 테스트 | 활성 |
| user | JUnit Jupiter·Playwright 기반 화면 테스트 | 활성 |
| cmp | 서비스·설정 테스트 6개 파일 | 주석 처리 |
| batch | `src/test`에서 테스트 파일 확인되지 않음 | 활성 |
| interface | `src/test`에서 테스트 파일 확인되지 않음 | 활성 |

- cmp에는 `CredentialServiceTest`, `JasyptConfigurationTest`, `TerraformApiServiceTest`가 있다.
- 추가로 `RndTaskCompletionServiceTest`, `VirtualNetworkServiceTest`, `VmServiceMultiVcenterTest`가 있다.
- 따라서 'cmp에만 테스트가 있다', 'batch의 JUnit Platform이 주석 처리되어 있다'는 제공 자료는 현재 코드와 다르다.
- cmp 테스트는 Jupiter를 사용하지만 Platform 설정이 주석 처리되어 있다. `gradle test` 성공만으로 테스트 실행을 단정하지 않는다.
- admin·user는 Playwright import가 있으나 해당 의존성 선언은 주석 처리되어 있다. 실제 의존성 해석·컴파일 가능 여부를 먼저 확인한다.
- 화면 테스트는 대상 서버·브라우저·계정·테스트 데이터를 확인한 후 선택 실행한다. 소스 존재와 실행 가능 여부는 다르다.

1. 변경과 관련된 테스트를 선택하고 해당 모듈 디렉터리로 이동한다.
2. [빌드 가이드](build-and-run.md)의 Nexus·인증서 공통 옵션을 테스트에도 적용한다.
3. JUnit 실행 설정과 테스트 의존성을 확인한다. 필요한 설정 변경은 별도 코드 변경으로 기록한다.
4. 실행 결과와 `build/reports/tests/test/`, `build/test-results/test/`의 실제 실행 건수·실패·skip을 확인한다.

## 화면 검증 시 주의 (admin 실행 관찰, 2026-10-15)

- 공통 bPopup은 `closePopup` 직후(약 0.3초 안)에 다시 `showPopup`하면 이전 iframe이 남아 팝업 두 개가 겹친다. 실제 사용 순서([닫기] 클릭 → 다시 열기)에서는 하나다. 자동화로 빠르게 연속 실행해서 생긴 겹침을 화면 결함으로 보고하지 않는다. 공통 동작이므로 화면에서 고치지 않는다.
- 코드사전·설정을 등록한 뒤 서버 로직 결과를 확인하려면 먼저 레이아웃 [캐시 초기화]를 누른다([캐시 반영](../cases/display-value/cache-refresh.md)).
- 템플릿을 고친 뒤에는 실행 중인 서버가 읽는 위치에 반영됐는지 확인한다([빌드와 로컬 실행](build-and-run.md)의 "로컬 실행 시 확인할 점").

- 성공 기준: 필요한 테스트가 실제 실행되고 통과한 경우. `NO-SOURCE`·실행 0건은 통과 근거가 아니다.
- 테스트를 실행하지 못하면 원인과 미검증 범위를 남긴다. 문서 조사만으로 빌드·테스트 성공을 보고하지 않는다.
- 관련: [모듈 구성](project-map.md), [소스 기준](../maintenance/source-baseline.md).
