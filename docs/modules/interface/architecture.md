# 운영망과 개발망 사이의 데이터 연계

> 범위: interface | 상태: 대표 스케줄러·전송·저장 코드 확인, 운영 경계 미검증

interface는 사용자 화면보다 망 사이의 데이터 전달을 담당하는 애플리케이션이다.

## 대표 처리 흐름

1. `cmpinterface/scheduler/`의 스케줄러가 연계 작업을 시작한다.
2. 원천 데이터를 조회하고 설정의 `TCP / IP`, `TCP / Port`로 반대망 주소를 구성한다.
3. `HttpClientUtil`로 반대망의 `/cmp/devinterlock/...`에 전달한다.
4. 수신 서비스가 DB에 반영하거나 CMP의 관련 API를 호출한다.

- 확인한 인사·IP 등 스케줄러에는 `production`·`dr` 실행 조건이 있다. 모든 잡의 조건이 같다고 가정하지 않는다.
- 연계 대상은 사용자·인사·ITSM/CI·IP·컨테이너 관련 데이터 등이다. 실제 대상과 주기는 해당 스케줄러에서 확인한다.
- 자체 DB 접근과 proxy 호출이 함께 있다. 일부 서비스는 기존 데이터를 삭제한 뒤 다시 저장한다.
- 단순 조회 서비스로 취급하지 않는다. 변경할 때 원천·수신 방향과 삭제·재적재 범위를 먼저 확인한다.

## 인증·연결을 확인할 곳

- 확인한 Java 소스에서 CMP·batch와 같은 `AuthInterceptor`·웹 보안 필터 등록은 발견되지 않았다.
- `SelectOnlyInterceptor` Bean 등록은 주석 처리되어 있다. 이 이름만 보고 읽기 전용 DB 접근으로 판단하지 않는다.
- `HttpClientUtil`에는 인증서·호스트 검증을 생략하는 구현이 있다. 신규 연결 방식의 권장 규칙으로 복사하지 않는다.
- 반대망 전송의 인증과 CMP proxy의 서비스 JWT는 별개 경로다.
- '내부망에서만 접근 가능', '호출자는 반대망 interface뿐'이라는 제공 설명은 운영망·배포 설정 추가 확인이 필요하다.
- DB 계정 권한은 운영 DB에서 확인하지 않았다. 설정의 사용자명만으로 실제 권한을 단정하지 않는다.

## 수정 전 확인

- 어느 프로필에서 실행되는가? 대상 IP·포트는 어느 환경의 값인가?
- 전체 교체인가, 일부 갱신인가? 빈 데이터·중간 실패 때 기존 데이터는 어떻게 되는가?
- 수신 요청의 인증과 실제 네트워크 접근 제한은 어디에서 보장되는가?

근거: `interface:src/main/java/kr/datasolution/cuni/cmpinterface/scheduler/DaejikInterfaceScheduler.java`, `cmpinterface/service/DevInterlockService.java`, `cmpinterface/service/ApprCntService.java`, `common/util/HttpClientUtil.java`, `common/config/MyBatisConfiguration.java`.
- 관련: [설정](../../common/configuration.md).
- DB 구현: [모듈별 MyBatis 차이](../../common/conventions/mybatis.md), [트랜잭션·검증](../../common/workflows/database-development.md).
