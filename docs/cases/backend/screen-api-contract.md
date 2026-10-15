# 시안의 서버 호출을 API 계약으로 바꾸기

> 범위: Admin·User 화면 → 포탈 → CMP | 상태: 코드 확인, 실행 미검증 | 근거: admin `monitoring/vmManagerManagement/list.html`, `admin/controller/monitoring/MonitoringController.java`, `proxy/cmp/VmManagerClient.java`, cmp `cmp/controller/VmManagerController.java`, `common/controller/ApiController.java` (모두 `development`, 2026-10-14)
>
> 언제 읽나: 승인된 `prototype.html`로 구현 설계를 만들 때, 화면의 요청·응답 필드 이름을 정할 때 | 읽지 않는 경우: 서버 호출이 없는 화면 수정

시안의 `[프로토타입]` 함수 하나가 서버 호출 하나다. 설계는 이 함수들을 빠짐없이 API로 옮기며, 시안의 요청 키·응답 필드 이름을 그대로 계약으로 삼는다.

## 먼저 볼 것

- [포탈 Controller·Proxy 추가](portal-controller-proxy.md), [CMP 새 API](cmp-new-api.md), [DataTables 요청·응답 계약](../../reference/datatables-contract.md)

## 구현 순서

1. `prototype.html`에서 `// [프로토타입] 서버 호출 대체` 함수를 모두 찾는다. 목록 조회, 선택 목록 조회, 상세, 저장, 삭제, 엑셀(서버 조회일 때), 팝업 저장이 대상이다.
2. 함수마다 서버 호출 대응표에 한 행씩 적는다.

   | 시안 함수 | 포탈 URL | Proxy 메서드·설정 키 | CMP API | 요청 키 | 응답 필드 |
   |---|---|---|---|---|---|
   | `loadRows()` | POST `/admin/monitoring/vm-manager-managements/list` | `VmManagerClient.getVmManagerPage` · `app.cmp.vm-managers-list` | POST `/cmp/vm-managers/list` | `searchData()` 반환 키 + grid 공통 키 | `content[]`의 `vmname`… , `totalElements` |

3. 요청 키는 `searchData()`의 반환 키, 응답 필드는 시안 `columns.data`와 샘플 행의 필드명이다. 기존 API를 재사용하면 그 API의 이름을 따르고, 시안의 이름이 다르면 **시안을 고친다**(새 매핑 코드를 만들지 않는다).
4. 서버 표는 공통 grid가 붙이는 키(`page`, `length`, `searchList`, `sortColumn`, `sortOrderType`)를 그대로 받는다. CMP는 `createPageRequest(param)`로 페이지·정렬을 만든다.
5. 정렬 연결을 한 줄로 적는다: Admin grid는 `columns.name`(없으면 `columns.data`)을 `sortColumn`으로 보냄 → `createPageRequest`가 `Sort.Order(direction, sortColumn)` 생성 → Support가 그 이름을 실제 정렬 필드로 처리. 정렬할 수 없는 열은 화면에서 `orderable: false`.
6. 응답은 `ResultData.result`에 `{content, totalElements}`(서버 표) 또는 배열·객체(그 밖)로 둔다. 실패 판단은 `success`.

## 규칙

| 구분 | 규칙 |
|---|---|
| 지침 | 대응표에 없는 서버 호출을 구현에서 추가하지 않는다. 필요해지면 설계를 고쳐 재승인한다. |
| 관찰 | 참고 화면의 응답 필드는 DB 컬럼명 그대로의 소문자(`vmname`, `platformdvscode`)다. 새 API도 참고 API의 이름 방식을 따른다. |
| 관찰 | 포탈 URL은 화면 경로와 같은 경로에 POST, CMP는 `/cmp/<복수 리소스>/<동작>`이며 상대 경로는 `application-msa.yml`의 `app.cmp.*`에 둔다. |

## 복사하지 않을 기존 패턴

- 화면에서 응답 필드명을 다른 이름으로 바꿔 쓰는 변환 함수. 이름은 계약에서 맞춘다.

## 검증 체크리스트

- [ ] `[프로토타입]` 함수 수 = 대응표 행 수, 구현 후 남은 `[프로토타입]` 0건.
- [ ] `searchData()` 키·`columns.data`가 API 요청 DTO·응답 DTO 필드와 같다.
- [ ] 정렬 가능한 열마다 `sortColumn` 값이 Support에서 처리된다. 정렬 불가 열은 `orderable: false`.
- [ ] 브라우저 네트워크 탭에서 요청 body·응답 `content`·`totalElements` 확인.
