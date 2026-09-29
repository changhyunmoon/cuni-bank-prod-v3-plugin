# 배치 작업은 어떻게 실행되는가

> 범위: batch | 상태: 스케줄러·샘플·DB 설정 확인, 전체 잡 미검증

배치는 시간표에 따라 실행되거나 관리 요청으로 시작되며, 포탈 사용자 요청 없이도 DB와 외부 시스템을 변경할 수 있다.

## 세 가지 역할

| 구성 | 역할 |
|---|---|
| `DynamicAbstractScheduler` 상속 클래스 | 실행 시간과 중지·재시작·즉시 실행 요청 처리 |
| `DynamicAbstractJobConfig` 상속 클래스 | Tasklet 단계와 작업 이력 기록 |
| Service·DAO·매퍼 | 실제 업무와 DB 처리 |

- 새 잡은 `sample/job/BatchSampleJobConfig.java`를 출발점으로 사용한다.
- Tasklet에는 시작·성공·실패 기록과 서비스 호출을 두고, 상세 업무·DB 처리는 서비스로 분리한다.
- 메인 DB 연결은 자체 DataSource를 사용한다. 메인 테이블에 직접 변경하는 잡도 있다.
- 외부 고객 DB는 `ExternalDbUtil`이 `SelectOnlyInterceptor`를 연결해 SELECT 외 작업을 제한한다.
- 이 제한을 메인 DB 전체에 적용되는 규칙으로 오해하지 않는다.
- `BatchConfiguration`은 Spring Batch 메타 저장용 DataSource 설정을 생략한다. 업무 DB·실행 이력 저장과 구분한다.

## 관리 API

배치 컨텍스트 `/batch` 아래에서 잡 이름별로 다음 POST 경로를 사용한다.

| 동작 | 경로 |
|---|---|
| 중지 | `/{taskName}/scheduler/stop` |
| 재시작 | `/{taskName}/scheduler/restart` |
| 즉시 실행 | `/{taskName}/job/start` |

- 기존 README의 `/immediate-start`보다 현재 스케줄러 구현을 기준으로 확인한다.
- Admin `JobSchedulerClient`에는 Pod IP별 `:21891/batch` 호출 경로가 있다.
- batch의 AuthInterceptor가 적용되는 API는 서비스 JWT를 확인한다. 정기 실행은 포탈의 메뉴 검사를 거치지 않는다.
- 잡마다 직접 DB·SDK 호출과 CMP proxy 호출 여부가 다르다. 재실행·중복 실행과 변경 범위를 확인한다.

근거: `batch:src/main/java/kr/datasolution/cuni/common/scheduler/DynamicAbstractScheduler.java`, `common/config/BatchConfiguration.java`, `common/util/ExternalDbUtil.java`, `sample/job/BatchSampleJobConfig.java`.
호출 근거: `admin:src/main/java/kr/datasolution/cuni/proxy/batch/JobSchedulerClient.java`.
- 관련: [DB 접근 범위](../../reference/data-access.md).
- DB 구현: [MyBatis 규칙](../../cases/db/mybatis.md), [트랜잭션·검증](../../cases/db/implementation.md).
