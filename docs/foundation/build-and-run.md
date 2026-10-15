# 빌드와 로컬 실행

> 범위: 업무 프로젝트 5개 모듈 | 상태: 빌드 설정 확인, 명령 실행 미검증 | 근거: 각 모듈 build.gradle·pipeline

- 위치: 업무 루트가 아닌 대상 모듈 디렉터리. 아래 예시는 PowerShell이다.
- Gradle wrapper 스크립트는 있지만 `gradle/wrapper/`와 wrapper JAR이 없다. 설치된 `gradle`을 사용한다.
- Java 8 toolchain을 확보하고, 설치 Gradle이 해당 빌드와 호환되는지 확인한다. 권장 Gradle 버전은 아직 확정하지 않았다.
- Nexus: `https://10.3.200.51:8443/repository/cuni-public/`. `repoUsername`·`repoPassword` 프로젝트 속성이 필요하다.
- local 프로필은 내부망 자원(Nexus `10.3.200.51`, cmp DB `10.3.200.50:5432` 등)을 쓰므로 **VPN 연결이 필요하다**(사용자 제공 정보, 2026-10-14). 화면 확인에는 대상 포탈과 로그인·데이터를 처리하는 cmp(`application-msa.yml`의 `cmp.url: http://localhost:20590/cmp`)가 함께 떠 있어야 한다.
- 내부 CA truststore가 필요하다는 내용은 제공된 운영 정보다. 아래 환경변수에 해당 환경의 값을 준비한다.

```powershell
Set-Location '<업무 루트>/cmp' # 또는 admin / user / batch / interface
$gradleArgs = @(
  "-PrepoUsername=$env:REPO_USERNAME", "-PrepoPassword=$env:REPO_PASSWORD",
  "-Djavax.net.ssl.trustStore=$env:TRUST_STORE_PATH", '-Djavax.net.ssl.trustStoreType=PKCS12',
  "-Djavax.net.ssl.trustStorePassword=$env:TRUST_STORE_PASSWORD"
)
gradle build -x test @gradleArgs
gradle test @gradleArgs
gradle test --tests 'kr.datasolution.cuni.cmp.service.CredentialServiceTest' @gradleArgs
gradle bootRun '--args=--spring.profiles.active=local' @gradleArgs
```

- 마지막 네 명령은 목적별 선택 예시다. 모두 연속 실행해야 하는 절차가 아니다.
- 인증서 옵션은 환경 요구에 맞춘다. 자격증명·truststore 비밀번호의 실제 값은 문서·코드에 저장하지 않는다.
- `build -x test` 성공은 테스트 통과를 의미하지 않는다. 테스트 명령의 전제는 [테스트 현황](testing.md)을 확인한다.
- cmp·batch·interface는 `compileQuerydsl`과 `build/generated/querydsl`을 사용하며 생성 경로가 main 소스에 연결된다.
- Q 클래스는 생성 결과다. 소스와 생성 설정을 확인하고 다시 생성하며, 생성 파일을 직접 수정하지 않는다.
- cmp의 JavaCompile은 fork 실행하며 `-Xmx4g`, `-XX:MaxMetaspaceSize=3600m` 옵션이 있다.
- 확인한 `pipeline/.gitlab-ci-dev.yml`·`.gitlab-ci-prg.yml`에는 `gradle init` 후 `gradle build`가 있다.
- CI 진입점은 `.gitlab-ci.yml`의 분기별 include다. 이 사실만으로 로컬에서 `gradle init`을 실행하지 않는다.
## 로컬 실행 시 확인할 점 (admin, 2026-10-15 실행 확인)

- **기동 순서는 cmp → admin**이다. admin은 기동 시 `SettingController`의 `@PostConstruct`(`settingsStart`)에서 자료사전·코드·설정 캐시를 cmp에서 받아 오므로 cmp가 없으면 기동이 실패한다.
- 실행 중인 admin은 `build/resources/main`의 템플릿을 읽는다(`application.yml`의 `spring.thymeleaf.cache: false`). `src/main/resources/templates`를 고친 것만으로는 화면에 반영되지 않으므로 다시 빌드하거나 같은 파일을 `build/resources/main`에도 반영한다.
- `spring.thymeleaf.view-names`(`application.yml:18-24`)에 있는 최상위 폴더(`monitoring/*`, `system/*` 등)의 템플릿만 렌더링된다. 새 템플릿은 기존 폴더 아래에 두고, 새 최상위 폴더가 필요하면 이 목록에 추가해야 한다.

- 성공 기준: 빌드 산출물 생성 또는 해당 프로필의 기동 확인. 의존 서비스·설정은 모듈별로 추가 확인한다.
- 실패 시: Gradle/JDK → Nexus 접근·인증 → 인증서 → QueryDSL 생성 → 테스트 실행 설정 순으로 원인을 좁힌다.

- 관련: [모듈·포트](project-map.md), [확인 기준](../maintenance/source-baseline.md).
