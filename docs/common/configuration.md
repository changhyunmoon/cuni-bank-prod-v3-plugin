# 어떤 설정 파일을 확인해야 하는가

> 범위: 모듈별 설정·서비스 주소·암호화 설정 | 상태: 대표 설정 확인, 운영 시크릿 미검증

설정 오류를 찾을 때는 실행 프로필과 그 프로필이 불러오는 파일부터 확인한다.

| 찾는 값 | 확인 위치 |
|---|---|
| 활성 프로필·포트·컨텍스트 | `application.yml` |
| 서비스 기본 주소·API 경로 | `application-msa.yml` |
| DB 연결·JPA·MyBatis | `application-datasource.yml` |
| Admin의 추가 서버 설정 | include된 `application-server.yml` |
| DB에서 관리하는 업무 설정 | Configuration과 `cacheManager.getConfString()` |

## 읽는 순서

1. 실행 인자·환경변수와 `spring.profiles.active`를 확인한다.
2. 해당 모듈의 `spring.profiles.include`를 확인한다. Admin에는 server·msa가 포함된다.
3. 필요한 키를 선언한 파일에서 `spring.config.activate.on-profile` 분기를 확인한다.
4. Java의 `@Value` 사용처와 실제 호출·변환 코드를 연결한다.

- 모듈마다 프로필 목록이 다르다. `maintenance` 등 제공 자료에 나온 이름을 모든 모듈이 지원한다고 가정하지 않는다.
- YAML 서비스 주소와 DB Configuration은 저장 위치가 다르다. 같은 '설정'이라는 이유로 혼용하지 않는다.
- `application-msa.yml`에 키가 있어도 실제 사용된다는 뜻은 아니다. 클라이언트 필드와 호출처까지 확인한다.

## 암호화 값과 서비스 키

- `ENC(...)` 값은 Jasypt 복호화 설정과 함께 사용한다. 암호문 자체를 평문으로 바꾸어 문서에 적지 않는다.
- 확인한 Admin 설정은 `PBEWithMD5AndDES`이며 JasyptConfiguration이 password·algorithm 속성을 읽는다.
- 실제 암호화 비밀번호·JWT 키·DB 자격증명은 복사하지 않는다. 어떤 설정 키를 사용하는지만 기록한다.
- 서비스 JWT의 서명 키 설정은 `api.auth.jwt.secret`이다. 전 환경의 실제 키 일치 여부는 이번 조사에서 검증하지 않았다.
- TLS 검증을 생략하는 기존 구현은 호출 경로별로 확인한다. 공통 통신 규칙으로 확대 적용하지 않는다.

근거: 각 모듈 `src/main/resources/application*.yml`, `admin:src/main/java/kr/datasolution/cuni/common/config/JasyptConfiguration.java`.
- 관련: [빌드용 인증서](workflows/build-and-run.md), [업무 설정 개념](portal/display-values.md).
