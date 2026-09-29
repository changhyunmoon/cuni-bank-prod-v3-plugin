# DB 접근과 프로젝트 권한의 경계

> 범위: DB 변경 경로·메뉴 역할·프로젝트 역할 | 상태: 대표 모델·조회 코드 확인

어느 모듈이 DB를 바꾸는지와 어느 사용자가 데이터를 바꿔도 되는지는 별도로 확인해야 한다.

## DB에 접근하는 경로

| 경로 | 특징 | 변경 시 확인할 것 |
|---|---|---|
| 포탈 → CMP | API를 통해 업무 데이터 조회·변경 | 요청자와 대상 데이터의 관계 |
| batch → 메인 DB | 잡이 직접 조회·변경 | 중복 실행·재실행·트랜잭션 |
| batch → 외부 DB | ExternalDbUtil의 SELECT 제한 | 제한이 적용되는 연결인지 |
| interface → 메인 DB | 연계 데이터 반영, 일부 삭제 후 재적재 | 원천 데이터와 실패 시 보존 범위 |

## 두 종류의 역할

| 구분 | 연결 구조 | 주된 용도 |
|---|---|---|
| 포탈 메뉴 역할 | 사용자 → RoleMember → Role → RoleMenu → Menu | 로그인 후 메뉴 권한 목록 구성 |
| 프로젝트 역할 | Project → ProjectMember → ProjectRole, ProjectRoleMatrix | 프로젝트 구성원·역할 정보와 외부 역할 매핑 |

- 메뉴 역할과 프로젝트 역할은 같은 체계가 아니다. 메뉴 접근 허용이 프로젝트 변경 허용을 뜻하지 않는다.
- `ProjectMemberService.getThirdPartyRole()`에는 GitLab·TAS 등 외부 역할로 바꾸는 로직이 있다.
- 역할 데이터나 조직 필드가 있다는 이유만으로 요청마다 소유권·조직 경계가 검사된다고 판단하지 않는다.
- 확인한 `ProjectSupport.getMyProject()`는 요청 조건의 `projectmemberuseridentity`를 조회 필터로 사용한다.
- 조회 조건에 사용자 ID가 포함되는 것과 인증된 요청자의 ID인지 확인하는 것은 별도 문제다.

## 개발·리뷰 순서

1. 호출자가 누구인지, 신뢰할 사용자 정보가 어디서 오는지 확인한다.
2. 조회·변경 대상의 프로젝트와 요청자의 구성원·역할 관계를 확인한다.
3. 권한 검사가 Controller·Service·외부 시스템 중 어디에서 수행되는지 코드로 찾는다.
4. 배치·연계 등 포탈을 거치지 않는 경로에도 필요한 범위 제한이 있는지 확인한다.

- 제공 자료의 '프로젝트 인가는 전부 없다'는 설명은 전체 API를 재검증하기 전 확정하지 않는다.
- 현재의 검사 누락 가능성을 신규 구현의 규칙으로 삼지 않는다. 필요한 검증 위치를 명시한다.

근거: `cmp:src/main/java/kr/datasolution/cuni/basic/domain/`의 역할·메뉴 모델, `cmp/domain/`의 프로젝트 역할 모델, `cmp/repository/ProjectSupport.java`, `cmp/service/ProjectMemberService.java`.
- 관련: [배치](../foundation/modules/batch.md), [interface](../foundation/modules/interface.md).
