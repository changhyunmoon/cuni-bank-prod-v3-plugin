# 작업 특성별 문서 적용 확인

[docs 지도](../../../docs/README.md)를 먼저 읽는다. 이 표는 문서 선택의 누락을 막는 최소 확인표이며 규칙 본문을 대체하지 않는다. 작업 시작·시안 제출·설계 제출·최종 검증에 해당 단계의 행을 갱신한다. 파일 경로는 docs 기준이며 지도의 링크로 원문을 연다.

| 작업 특성 | 확인할 문서 | 확인 시점 |
|---|---|---|
| 모든 작업 | project-map.md, source-baseline.md, 업무 CLAUDE.md와 적용 규칙 | 시작·재개 |
| 화면 작성·시안 | 대상 모듈의 modules/admin/frontend/README.md 또는 modules/user/frontend/README.md, common/portal/screen-references.md, common/portal/screen-structure.md | 요구사항·시안·구현 |
| 목록·좌우 화면 | common/portal/screen-lists.md | 시안·구현 |
| DataTables 표 생성·검색·행 조작 | common/portal/datatables-selection.md, common/portal/datatables-contract.md, common/portal/datatables-operations.md | 시안·설계·구현·검증 |
| 엑셀 내보내기 | common/portal/datatables-excel-export.md | 요구사항·시안·설계·구현·검증 |
| 등록 팝업 | common/portal/screen-popups.md | 시안·구현 |
| 조회 fragment | common/portal/screen-fragments.md | 시안·구현 |
| 문구·코드·설정 표시 | common/portal/display-values.md, display-value-usage.md, 대상 modules/admin 또는 modules/user/display-value-registration.md | 시안·설계·구현 |
| 값 미등록·등록 미확인 | common/portal/temporary-display-values.md | 시안·설계·구현 |
| 등록값·캐시 반영 | system/flows/display-value-cache.md | 설계·구현·검증 |
| API 호출·추가·변경 | system/architecture.md, common/portal/backend-calls.md, modules/cmp/architecture.md, modules/cmp/conventions/api-development.md | 요구사항 조사·설계·구현 |
| 로그인·메뉴·사용자별 데이터 | system/data-access.md | 요구사항·설계·검증 |
| DB 조회·저장 | common/conventions/persistence-selection.md, 선택 기술의 jpa.md/querydsl.md/mybatis.md, common/workflows/database-development.md | 설계·구현·검증 |
| 설정·서비스 경로 변경 | common/configuration.md | 설계·구현 |
| 배치·연계 변경 | 해당 modules/batch 또는 modules/interface/architecture.md | 조사·설계·구현 |
| 실행 검증 | common/workflows/build-and-run.md, testing.md | 설계·검증 |

각 산출물에 `특성 | 적용/해당 없음/확인 불가 | 원문·소스 경로 | 적용 내용 또는 사유 | 미해결 차이`를 남긴다. 해당 없음은 기능 범위 근거를 적고, 확인 불가는 파일 부재·접근 불가 등 원인과 영향을 적는다. 읽기만 하고 적용 확인을 통과로 표시하지 않는다. User 작업에 Admin 예제가 적용 가능한지는 User 실제 코드로 대조한다.

개발 표준 리뷰어는 메인의 선택 목록을 답으로 받아들이지 않는다. 요구사항과 변경 파일을 보고 특성을 독립 분류하고, 지도에서 추가 관련 원문을 선택하며 누락·부당한 해당 없음 판정을 지적한다. 문서·코드 충돌은 명시된 기준, 적용 범위, 현재 코드 근거를 함께 제시해 해결한다.
