# User·Admin 워크로드 목록의 연결

두 화면은 같은 CMP 서비스·Support를 사용하지만 서로 다른 API와 조회 조건으로 연결된다.

> 범위: User 서비스 현황, Admin 클라우드 작업관리 워크로드 목록 | 상태: 코드 확인, API·DB·브라우저 미검증 | 확인: 2026-09-29, [소스 기준](../../source-baseline.md)

## 화면에서 CMP까지

| 계층 | User | Admin |
|---|---|---|
| 화면 | `k8s/workloadList.html`, `getList()`·`searchData()` | `cloud/k8sworkload/workloadList.html`, 같은 함수명 |
| 포탈 URL | GET/POST `/user/workload-list/list` | GET/POST `/admin/workload-list/list` |
| 포탈 Controller | `user/controller/k8sworkloadlist/K8sWorkloadListController`, GET `viewWorkloadList`, POST `getServiceStatusWorkloadList` | `admin/controller/k8s/K8sWorkloadListController`, GET `viewWorkloadList`, POST `getAdminWorkloadList` |
| Proxy | `proxy/cmp/WorkloadClient.getServiceStatusWorkloadList` | `proxy/cmp/WorkloadClient.getAdminWorkloadList` |
| 설정 키 | `app.cmp.k8s-service-status-workload-list` → `/workload/service-status/list` | `app.cmp.k8s-admin-workload-list` → `/workload/admin/list` |
| CMP POST | `/cmp/workload/service-status/list` | `/cmp/workload/admin/list` |
| CMP Controller | `WorkloadController.getServiceStatusWorkloadList` | `WorkloadController.getAdminWorkloadList` |
| Service → Support | `getServiceStatusWorkloadListPage` → 같은 이름의 메서드 | `getAdminWorkloadList` → 같은 이름의 메서드 |

Proxy는 `BaseProxy.postRestThreadTemplate(cmpUrl + 상대 경로, param)`을 사용한다. `app.cmp.url`의 확인한 기본값은 `/cmp`로 끝난다. 주소의 호스트·포트는 실행 환경 설정을 확인한다.

## 요청·응답과 DB 연결

1. 공통 `datatables.ex.js`가 `searchData()`를 `searchList`에 넣고 `page`, `length`, `sortColumn`, `sortOrderType`과 함께 JSON POST한다.
2. 포탈 Controller는 요청 Map을 Proxy로 전달한다. CMP는 `ApiController.createPageRequest`로 페이지를 만들고 Service의 읽기 전용 트랜잭션 메서드를 호출한다.
3. `WorkloadSupport`는 `workload`에서 `namespace`, `k8s_project`, `Project` 엔티티를 LEFT JOIN해 `ServiceStatusWorkloadDto`를 만든다.
4. User 경로는 요청에 `projectmemberuseridentity`가 있으면 `ProjectMember`의 멤버 프로젝트 하위 쿼리로 범위를 좁힌다. Admin 경로의 검색 switch에는 이 조건이 없다.
5. 응답은 `ResultData<Page<ServiceStatusWorkloadDto>>`이며 grid는 `result.content`와 `result.totalElements`를 DataTables 데이터·건수로 바꾼다.

| 계약 | 확인 내용 |
|---|---|
| 검색 키 | `projectNm`, `clusterNm`, `K8sProjectNm`, `namespaceNm`, `workloadNm`; 문자열 LIKE 검색 |
| User 추가 입력 | 화면이 세션의 `useridentity`를 `searchList.projectmemberuseridentity`로 전달 |
| 응답 열 순서 | `projectNm`, `clusterNm`, `k8sProjectNm`, `namespaceNm`, `workloadNm` |
| 기본 정렬 | Support에서 정렬 미지정 시 `project.projectname`, `asc` |
| 조인 | `workload.namespaceId = namespace.id` → `namespace.platPrjId = k8sProject.platPrjId` → `k8sProject.cmpPrjId = project.projectidentity` |
| 멤버 하위 쿼리 | `ProjectMember.projectmemberprojectidentity`를 선택하고 `projectmemberuseridentity`로 필터 |
| 명시 테이블 | `Workload` → `workload`, `Namespace` → `namespace`, `K8sProject` → `k8s_project` |

`Project`, `ProjectMember`에는 확인한 소스상 `@Table`이 없다. 물리 테이블명은 실제 JPA naming 설정·DB에서 추가 확인한다. 이 조회는 코드상 DB 엔티티를 읽으며 Kubernetes 실시간 API 호출로 취급하지 않는다.

## 재사용·변경 시 확인

- 검색 키 `K8sProjectNm`과 응답 키 `k8sProjectNm`의 대소문자가 다르다. 화면·Support를 함께 확인한다.
- User Controller는 입력된 사용자 식별자를 세션 값으로 덮어쓰지 않는다. 멤버 필터 존재만으로 서버 권한 검증이 완전하다고 판단하지 않는다. 재사용 시 [데이터 접근 범위](../data-access.md)를 추가 확인한다.
- `searchList`가 있다는 가정으로 순회한다. 누락 입력과 잘못된 정렬 필드의 실제 오류 응답은 미검증이다.
- 같은 CMP Controller의 `/cmp/workload/list`는 `WorkloadDto` 기반 목록이며 여기의 서비스 현황 Page API와 다른 계약이다.
- 조회 열·조인을 바꾸면 공용 DTO·Support 및 두 화면에 영향을 확인한다. 검색 click/onclick 중복 등 참고 소스의 주의점은 [목록 규칙](../../common/portal/screen-lists.md)을 따른다.

## 근거 소스

Java 경로의 기준은 각 모듈 `src/main/java/kr/datasolution/cuni/`이며 아래 경로를 그 뒤에 붙인다.

- `user`: `user/controller/k8sworkloadlist/K8sWorkloadListController.java`, `proxy/cmp/WorkloadClient.java`, `proxy/BaseProxy.java`.
- `admin`: `admin/controller/k8s/K8sWorkloadListController.java`, `proxy/cmp/WorkloadClient.java`.
- `cmp`: `cmp/controller/WorkloadController.java`, `cmp/service/WorkloadService.java`, `cmp/repository/WorkloadSupport.java`, `cmp/dto/ServiceStatusWorkloadDto.java`, `common/controller/ApiController.java`, `cmp/domain/`의 `Workload.java`, `Namespace.java`, `K8sProject.java`, `Project.java`, `ProjectMember.java`.
- 화면 경로는 각 모듈 `src/main/resources/templates/` 기준. 설정은 양쪽 `src/main/resources/application-msa.yml`, grid 근거는 `user:src/main/resources/static/js/datatables/datatables.ex.js`.
- 관련: [기능 지도](../feature-map.md), [포탈 호출](../../common/portal/backend-calls.md).
- 화면 표준: [User frontend](../../modules/user/frontend/README.md), [Admin frontend](../../modules/admin/frontend/README.md). 그리드 함수 변경 시 [DataTables 요청 계약](../../common/portal/datatables-contract.md)의 모듈별 정렬·응답 차이도 확인한다.
