# Admin 자료사전 관리의 연결

Admin 자료사전 화면은 Proxy를 통해 CMP의 조회·저장·삭제를 호출하며, 최종 저장 대상은 `dictionary_tp`다.

> 범위: 자료사전 목록·상세·등록·수정·삭제 | 상태: 코드 확인, 저장·DB 실행 미검증 | 확인: 2026-09-29, [소스 기준](../../maintenance/source-baseline.md)

## 화면·API 연결

| 기능 | Admin 화면·POST URL | Admin Controller → Proxy | CMP POST → Service |
|---|---|---|---|
| 목록 | `settings/dictionary/list.html`, `/admin/dictionaries/list` | `getDictionaryList` → `DictionaryClient.list` | `/basic/dictionaries/list` → `getDictionaryPage` |
| 상세 | `settings/dictionary/detail.html`, `/admin/dictionaries/detail` | `getDictionaryDetail` → `DictionaryClient.detail` | `/basic/dictionaries/detail` → `getDictionaryList(DictionaryDto)` |
| 등록·수정 | `settings/dictionary/save.html`, `/admin/dictionaries/save` | `saveDictionary(List<Map<...>>)` → `DictionaryClient.save` | `/basic/dictionaries/save` → `saveDictionary` |
| 삭제 | 목록 화면, `/admin/dictionaries/delete` | `deleteDictionary` → `DictionaryClient.remove` | `/basic/dictionaries/delete` → `deleteDictionary` |

화면 진입은 같은 `/list`, `/detail`, `/save`의 GET이다. 양쪽 Controller 이름이 `DictionaryController`이므로 Admin `admin/controller/settings`와 CMP `basic/controller`를 구분한다.

`DictionaryClient`는 `BaseProxy.postRestTemplate(basicUrl + 상대 경로, payload)`을 사용한다. 설정 키 `app.basic.dictionary-list/detail/save/delete`는 각각 `/dictionaries/list/detail/save/delete`이며 확인한 `app.basic.url`은 `/basic`으로 끝난다.

## CMP에서 DB까지

| 기능 | Service 이후 실제 접근 | 결과 |
|---|---|---|
| 목록 | `ApiService.getList` → `DictionarySupport.findByWhatEverWithPage` → QueryDSL | `Page<DictionaryDto>` |
| 상세 | `DictionarySupport.detailDictionary` → 카테고리·이름 조건 | 해당 언어별 `List<DictionaryDto>` |
| 신규 | 첫 DTO 생성일 null → 엔티티 변환 → 첫 엔티티 PK `findById` → 미존재 시 `repository.saveAll` | Boolean |
| 수정 | 첫 DTO 생성일 non-null → `ApiService.save(List, Dictionary.class)` → `repository.saveAll` | Boolean |
| 삭제 | `DictionarySupport.removeDictionary` → 카테고리·이름 기준 QueryDSL delete | 영향 행 수 > 0 여부 |

Repository는 `DictionaryRepository extends JpaRepository<Dictionary, DictionaryPk>`이며 공통 `ApiService`의 repository로 사용된다. `Dictionary`의 명시 테이블은 `dictionary_tp`, PK는 `DictionaryPk`의 카테고리·이름·언어다.

## 등록 요청과 반영

1. `save.html`의 `save()`가 언어별 DTO 배열을 만든다. `id.dictionarycategory`, `id.dictionaryname`, `id.dictionarylanguagecode`와 표시값·번역 여부·설명·순서·생성일을 보낸다.
2. Admin Controller는 `sessionAdminUserInfo`에서 생성/수정 작업자의 식별자·이름을 payload에 넣는다.
3. CMP Controller가 `List<DictionaryDto>`를 받고 Service의 `@Transactional` 저장을 호출한다. 신규 중복이면 `result=false`가 될 수 있다.
4. Admin은 `success`와 Boolean `result`를 함께 확인해 해당 인스턴스의 자료사전 캐시를 제거한다. 사용자 메시지는 `setResultMessageWithCacheManager(..., "DataAlreadyExists")`로 설정한다.
5. 다른 포탈·인스턴스까지 적용하는 절차는 [캐시 반영](../../cases/display-value/cache-refresh.md)을 따른다. 저장 호출만으로 모든 캐시가 갱신됐다고 판단하지 않는다.

## 재사용·변경 시 확인

- 목록 요청은 공통 grid의 검색·페이지 계약을 사용한다. `DictionarySupport`는 `searchList`의 `dictionarylanguagecode`, `searchColumn`, `searchText`를 읽는다.
- 등록/수정 구분은 동일 키 존재 여부만이 아니라 **첫 DTO의 생성일 유무**에 의존한다. 신규 중복 확인도 첫 엔티티 PK를 조회한다. 이 관찰을 모든 언어에 대한 완전한 중복 검증으로 확대하지 않는다.
- 빈 배열, 언어 누락, 생성일 조작에 대한 입력 검증은 별도 확인한다. 기존 화면을 우회한 임의 payload를 안전한 재사용 계약으로 간주하지 않는다.
- 수정은 공통 `ApiService.save(List, Class)`를 거친다. 이 메서드에 RuntimeException 로그 처리 분기가 있으므로 `success=true`만으로 저장 보장을 단정하지 않는다. 실제 실패·롤백은 실행 검증하지 않았다.
- 키·DTO·저장 방식을 바꾸면 Admin 저장/상세·CMP 서비스/엔티티·포탈 캐시 조회를 함께 확인한다. User는 등록 화면의 복사 대상이 아니라 [값 사용·반영](../../cases/display-value/registration-user.md)의 소비자다.

## 근거 소스

Java 경로의 기준은 각 모듈 `src/main/java/kr/datasolution/cuni/`다.

- `admin`: `admin/controller/settings/DictionaryController.java`, `proxy/basic/DictionaryClient.java`, `proxy/BaseProxy.java`.
- `cmp`: `basic/controller/DictionaryController.java`, `basic/service/DictionaryService.java`, `basic/repository/DictionarySupport.java`, `basic/repository/DictionaryRepository.java`, `basic/domain/Dictionary.java`, `basic/domain/DictionaryPk.java`, `common/service/ApiService.java`.
- HTML은 `admin:src/main/resources/templates/settings/dictionary/`의 `list.html`, `detail.html`, `save.html`; Proxy 설정은 `admin:src/main/resources/application-msa.yml`.
- 관련: [기능 지도](../feature-map.md), [등록 절차](../../cases/display-value/registration-admin.md), [CMP API 기준](../../cases/backend/cmp-new-api.md).
- 목록 공통 함수는 [DataTables 요청 계약](../datatables-contract.md), 저장 후 페이지 유지·재조회는 [행 조작 가이드](../../cases/table/table-row-operations.md)를 따른다. 이 화면은 기능 추적 근거이며 유승민 최초작성 표준 목록과는 별개다.
