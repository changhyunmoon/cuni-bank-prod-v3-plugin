# 저장소와 모듈 구성

> 범위: 업무 프로젝트 5개 모듈 | 상태: 구조·설정 확인, 실행 미검증 | 근거: 아래 소스

CUNi는 (주)데이타솔루션의 클라우드 관리 플랫폼(CMP)이다.

- 업무 루트는 Git 저장소가 아닌 컨테이너 디렉터리이며, 각 모듈에 독립된 `.git`·`.gitlab-ci.yml`·이력이 있다.
- 커밋·Git 작업은 변경한 하위 저장소에서 수행한다. 여러 모듈의 변경을 한 저장소 커밋으로 취급하지 않는다.
- 현재 확인 경로는 `C:\workspace\cuni-bank-v3-prod`다. 제공 자료의 `C:\workspace\bank\maintenance`는 환경별 경로 예시로 구분하며 이번 확인 대상은 아니다.
- 공통 빌드 설정: group `kr.datasolution.cuni`, version `3.0.0`, Spring Boot `2.7.18`, Java toolchain `8`.

| 모듈 | 애플리케이션 클래스 | local 포트 | 컨텍스트 | 역할 |
|---|---|---|---|---|
| admin | `CuniAdminApplication` | 20290 | `/admin` | Thymeleaf 관리자 포탈, proxy 기반 백엔드 호출 |
| user | `CuniUserApplication` | 20190 | `/user` | Thymeleaf 사용자 포탈, 동일한 proxy 패턴 |
| cmp | `CuniCmpApplication` | 20590 | 별도 설정 없음 | 주요 도메인 로직·DB·클라우드 provider 연동을 담당하는 REST 백엔드 |
| batch | `CuniBatchApplication` | 21891 | `/batch` | Spring Batch 잡·동적 스케줄러 |
| interface | `CuniInterfaceApplication` | 9001 | `/cmp` | 운영망↔개발망 데이터 연계 브로커 |

- 포트는 local 설정 기준이다. 환경 변수·실행 인자·프로필별 설정으로 달라질 수 있다.
- interface의 `rndtest`·`rnd`·`dr` 프로필은 포트 20590이다. 다른 서비스와 동시 실행 시 확인한다.
- cmp의 `/basic` 등 여러 API 접두사는 컨트롤러 경로다. 여러 servlet context가 있다는 의미가 아니다.
- admin·user는 포탈·proxy 책임을 유지하고 도메인 로직을 백엔드에 둔다. 세션·화면 제어 코드는 존재한다.
- batch·interface에도 데이터 접근 코드가 있으므로 모든 DB 처리가 cmp에만 있다고 가정하지 않는다.
- interface의 확인한 소스에는 CMP와 같은 인증 인터셉터 등록이 없다. 실제 네트워크 노출 범위는 별도 확인한다. [연계 구조](modules/interface.md) 참고.

근거: 각 모듈의 `build.gradle`, `src/main/resources/application.yml`, `src/main/java/kr/datasolution/cuni/Cuni*Application.java` 및 업무 루트 `CLAUDE.md`.
- 관련: [빌드·실행](build-and-run.md), [테스트 현황](testing.md), [소스 기준](../maintenance/source-baseline.md).
