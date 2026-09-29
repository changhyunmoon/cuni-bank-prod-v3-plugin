# Admin에서 자료사전·코드사전·설정 등록

> 범위: Admin 관리 화면 | 상태: 코드 확인, 실행 미검증 | 근거: 아래 소스

- 준비: 대상 환경의 관리 권한, 기존 항목 검색, 신규 키·값 목록. 메뉴 노출은 계정 권한에 따라 달라진다.

| 종류 | 목록 경로 | 등록 화면 경로 |
|---|---|---|
| 자료사전 | `/admin/dictionaries/list` | `/admin/dictionaries/save` |
| 코드사전 | `/admin/codes/list` | `/admin/codes/save` |
| 설정 | `/admin/configurations/list` | `/admin/configurations/save` |

1. 목록에서 카테고리·이름·언어를 검색한다. 같은 의미와 용도의 기존 키를 우선 재사용한다.
2. 없으면 등록을 선택하고 아래 항목을 입력한다. 기존 항목 변경은 수정 화면을 사용한다.
3. 저장 결과를 확인한다. 수정 화면에서 카테고리·이름은 읽기 전용이므로 키 변경과 값 수정을 구분한다.
4. Admin의 캐시 초기화 버튼을 실행하고 결과를 확인한 뒤 사용하는 화면을 다시 로드한다.
5. 언어별 표시·선택값·정렬·API 전달값을 확인한다. 임시값이 있다면 실제 조회로 전환한다.

| 종류 | 입력 항목과 기준 |
|---|---|
| 자료사전 | 카테고리, 이름, 언어별 값, 번역 여부, 표시 설명, 설명, 순서 |
| 코드사전 | 카테고리, 이름, 언어별 값, 번역 여부, 참조명, 설명, 순서, 사용 여부 |
| 설정 | 카테고리, 이름, 값, 설명; 언어별 입력·코드 사용 여부는 없음 |

- 언어별 입력칸은 `getCode("Culture")`로 생성된다. 생성된 각 언어의 값은 폼에서 필수 입력이다.
- 자료사전 예: `Title / ExampleResource / ko-KR → 자원 관리`. 예시이며 실제 등록 여부는 확인해야 한다.
- 코드의 이름은 API·DB의 식별값과 맞춘다. 예: `ExampleStatus / READY → 준비`.
- 코드 목록에 표시하려면 사용 여부 `Y`로 등록한다. 참조명은 사용처에서 요구할 때 입력한다.
- 번역 여부는 표시 차단 조건이 아니다. 자료사전에는 코드와 같은 사용 여부 필드가 없다.
- 설정값은 사용처가 기대하는 형식으로 입력한다. 등록만으로 숫자·날짜 등의 유효성이 보장되지는 않는다.
- 화면 등록이 신규 업무 상태의 처리 로직이나 메뉴·권한까지 추가하지는 않는다.
- 신규 중복 판단은 CMP 서비스에서 수행하며, 등록/수정은 생성일 유무로 구분한다. 임의 payload 대신 기존 화면을 사용한다.
- 성공 기준: 실제 조회 코드로 `Unknown` 없이 표시되고, 올바른 식별값이 서버에 전달된다.
- 실패 시: 키 대소문자 → 언어 → 사용 여부 → 실제 저장 결과 → 대상 인스턴스 캐시를 확인한다.

근거: `admin:src/main/resources/templates/settings/`의 `dictionary/save.html`, `code/save.html`, `configuration/save.html`.
저장 근거: `admin:src/main/java/kr/datasolution/cuni/admin/controller/settings/`의 각 Controller 및 `cmp:src/main/java/kr/datasolution/cuni/basic/service/`의 각 Service.
- 관련: [개념](../../reference/display-values.md), [캐시 반영](cache-refresh.md), [임시값 해제](temporary-value.md).
- User 화면에 적용할 때는 [User 전용 가이드](registration-user.md)를 함께 확인한다.
