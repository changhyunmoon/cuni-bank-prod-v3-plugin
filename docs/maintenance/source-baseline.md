# 문서의 소스 기준

> 확인일: 2026-09-23 | 범위: 사전·설정, 모듈 구조·빌드·테스트, 대표 인증·proxy·배치·망 연계 경로

| 저장소 | 확인 시 HEAD | 작업 트리 |
|---|---|---|
| admin | `a84254d464e6e6f21ac4dabba97da444fc17fc6c` | 변경 항목 5개 존재 |
| cmp | `99327c73112a0949062b4f745bd271407b5346bb` | 변경 항목 5개 존재 |
| user | `55aab70542ccd31fa61bc4a2f4df5817c433dbcf` | 변경 없음 |
| batch | `939f7aeb59d15bf0f66bc1b178c3d73679916955` | 변경 없음 |
| interface | `8d4ae7e1a8649a672638a046882a694d6f441172` | 변경 없음 |

- 문서는 위 커밋만이 아니라 확인 당시 로컬 작업 트리의 소스를 기준으로 작성했다.
- 업무 루트의 하위 저장소를 `admin:상대 경로`, `cmp:상대 경로`로 표기한다. 실제 위치는 작업 환경에서 확인한다.
- 예: `admin:src/main/resources/templates/settings/dictionary/save.html`.
- 운영 DB·실행 서버는 조회하지 않았다. 예시 키·표시값은 등록 여부가 확인된 데이터가 아니다.
- 사용자 포탈·다른 모듈에 적용할 때는 해당 모듈의 CacheManager·레이아웃·갱신 경로를 추가 확인한다.
- 기존 구현을 설명하는 문서와 새 개발 절차 제안을 구분한다. 임시값 가이드는 사용자 요청에 따른 개발 절차다.
- 스케줄·다중 인스턴스 갱신은 코드상 경로를 확인한 것이며 실제 환경의 성공을 보증하지 않는다.
- 빌드·테스트는 실행하지 않았다. 사용자 제공 분석과 로컬 설정·테스트 소스를 대조했으며 내부 CA 요구는 제공된 운영 정보다.
- 아키텍처 관련 제공 분석은 대표 소스와 대조했다. 현재 TaskService에는 실행자 누락 시 관리자 대체가 없으며 오류를 반환한다.
- 전체 API의 권한 검사, 배포망 접근 제한, DB 계정 실권한, 호출자의 유일성은 검증하지 않았다.
- DB 작성 기준은 CMP의 JPA·Support·집계 DAO, batch 샘플 DAO·XML, interface Mapper와 각 모듈 DB 설정을 대조했다. 전체 쿼리·성능·혼용 롤백은 실행 검증하지 않았다.
- 화면 기준은 사용자 지정 HTML의 최초작성 이력·레이아웃·스크립트를 대조했다. 기준 파일과 작성자 미확인 예외는 screen-references.md에 기록하며, 브라우저 렌더링은 검증하지 않았다.

## 2026-09-29 기능별 연결 지도 추가 확인

- 범위: [User·Admin 워크로드 목록](../reference/flows/workload-list.md), [Admin 자료사전 관리](../reference/flows/dictionary-management.md)의 화면·포탈 Controller·Proxy 설정·CMP Controller/Service·Support/Repository·엔티티 연결.
- admin/user/cmp의 HEAD는 위 표와 동일하다. user 작업 트리는 깨끗하다. admin은 설정 파일 2개 수정과 미추적 데이터 모니터링 코드·템플릿, cmp는 기존 Java 파일 4개 수정과 미추적 데이터 모니터링 디렉터리가 있다. 이번 지도는 현재 로컬 파일을 읽었으며 이 변경들을 수정하지 않았다.
- `application-msa.yml`의 기본 URL·API 경로를 확인했다. 실제 실행 프로필·메뉴 등록·서버 권한 전체·물리 DB·API 실행·브라우저는 확인하지 않았다.
- `Project`·`ProjectMember`는 명시 `@Table`이 없어 엔티티와 조인 필드까지만 기록했다. 전체 기능/호출자를 조사한 목록은 아니다.

## 2026-09-29 프런트엔드 개발 표준 확인

- 범위: admin/user의 templates에서 유승민 관련 헤더·최초작성 이력을 검색하고 기준 대상 27개(Admin 19·User 8)의 구조·함수·표 사용을 확인했다. 선정·예외는 [참고 화면](../reference/screen-references.md), 적용은 [Admin](../reference/frontend-admin.md)·[User](../reference/frontend-user.md)에 기록했다.
- 양 모듈 `static/js/datatables/datatables.ex.js` 전체와 차이, 대표 호출부, `templates/layout_final`의 스크립트 로딩을 대조했다. 프로젝트 래퍼를 중심으로 조사했으며 vendor 라이브러리 전체를 감사한 결과는 아니다.
- HEAD는 기존 표와 동일하다. 이번 확인 시 admin은 설정 2개 수정, `templates/k8s/tmp_list.html` staged 추가, 데이터 모니터링 관련 미추적 경로 3개가 있다. user는 변경 없다. 업무 소스는 수정하지 않았다.
- 기존 화면의 중복 이벤트·잘못된 기본 selector·동명 함수와 래퍼의 모듈 차이·빈 함수·복합 키 반환 문제를 표준에서 구분했다. 보완 지침은 기존 구현의 정상 동작을 주장하는 것이 아니다.
- 문서만 변경했으며 빌드·브라우저 렌더링·실제 API·데이터량·운영 동작은 실행 검증하지 않았다. 문서 상대 링크·근거 파일 존재·선정 목록은 로컬 파일로 검사한다.

## 2026-09-29 엑셀 내보내기 표준

- 사용자 지정으로 [화면 데이터 엑셀 내보내기](../cases/table/excel-export.md)를 개발 표준으로 정했다. 현재 페이지의 모든 행을 선택 여부와 무관하게 브라우저에서 생성하는 규칙이며 기존 전체 화면이 준수한다는 의미는 아니다.
- 근거: Admin 로그인 이력·User 서비스 상세의 `excelHtml5`, 양 모듈 Buttons의 `buttons.exportData()`와 메인 레이아웃 로딩. 비교 대상은 Admin Hyper-V 템플릿의 `excelDown()`·`TemplatesController`의 별도 조회/POI 생성, 일일 점검 보고서의 임시 표 내보내기다.
- 문서와 연결만 변경했다. 기존 서버 내보내기·화면 구현은 변경하지 않았으며 실제 다운로드 및 Excel 파일 내용은 실행 검증하지 않았다.

## 2026-09-29 범용 코딩 규칙 대조

- 범위: init-claude-rules 템플릿(core·git·java·springboot·html·javascript·css)을 [범용 코딩 규칙의 적용 범위](../foundation/coding-rules.md)와 [커밋·브랜치 작업 규칙](../foundation/commit-conventions.md)으로 분류했다. 템플릿 원문은 복사하지 않았다.
- 5개 모듈 `build.gradle`의 Java toolchain 8과 `src/main/java`의 필드 주입·`@Valid`·`@Value`·`@ConfigurationProperties`·`catch (Exception`·`*ServiceImpl` 사용 파일 수를 검색했다. 검색 수치이며 개별 사용 맥락은 검토하지 않았다.
- 커밋 형식은 각 저장소 최근 20건, 브랜치 운용은 cmp 브랜치 목록 기준 관찰이다. 팀 공식 커밋 규칙 문서는 확인하지 못했다.
- 업무 소스는 수정하지 않았으며 빌드·테스트는 실행하지 않았다.
