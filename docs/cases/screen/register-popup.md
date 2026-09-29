# 등록 팝업과 업로드 미리보기

> 범위: Admin 팝업 | 근거: monitoring/vmManagerManagement/bluksave.html
>
> 언제 읽나: 등록·수정 팝업, 파일 업로드·미리보기 팝업을 만들 때 | 읽지 않는 경우: Admin 작업 위저드·진행 조회 팝업(→ reference/frontend-admin.md)

파일을 고르는 동작, 내용을 미리 보는 동작, 최종 저장을 구분한다.

## 화면 배치

| 영역 | 구성 |
|---|---|
| 레이아웃 | `layout_final/popup_layout` |
| 바깥 | `contents`, `layout:fragment="content"` |
| `popup-head` | `h2#pageTitle`, 제목 + 등록·수정 구분 |
| `popup-body` | 입력 폼, 파일 선택·미리보기 요청, 결과 그리드 |
| `popup-foot` | 닫기와 저장 버튼 |

- 입력 폼은 기존 `tbl-type4 vertical`, 미리보기 표는 참고 화면의 `tbl-type6` 구조를 활용한다.
- 화면 전용 CSS는 기존 클래스만으로 해결하기 어려운 부분에 한정한다.

## 업로드 처리 순서

1. ready에서 제목·빈 그리드·파일 변경·닫기·저장 이벤트를 준비한다.
2. 파일 선택 시 파일명 표시를 갱신하고 확장자·크기·개수를 확인한다. 허용값은 대상 API 기준이다.
3. `FormData`로 업로드한다. 참고 코드는 `contentType: false`, `processData: false`로 전송한다.
4. 성공한 파싱 결과를 미리보기 표와 저장할 데이터에 반영한다.
5. 저장 시 유효한 행이 있는지 확인하고 `saveData()`를 호출한다.
6. 성공하면 해당 팝업의 부모 갱신·닫기 규약에 맞춰 처리한다.

## 그대로 복사하지 않을 부분

- 참고 화면의 50MB·허용 확장자·API URL은 이 기능의 값이다. 공통 업로드 규칙으로 고정하지 않는다.
- 빈 목록 알림 후 반드시 `return`한다. 참고 `save()`는 이 부분을 보완해야 한다.
- 파일을 다시 선택하거나 업로드가 실패하면 이전 `fileList`를 저장하지 않도록 상태를 정리한다.
- 업로드 중·저장 중에는 중복 실행을 제어하고 실패 상태를 보여준다.
- 서버의 파일 검증도 필요하다. 브라우저의 accept·크기 검사만으로 검증 완료라 하지 않는다.
- 미리보기 생성은 `emptyGrid()`를 사용한다. 행이 많으면 여러 행을 넣은 후 한 번 그리는 방식을 검토한다.
- 미선언 그리드 변수, 사용하지 않는 함수 인자, 빈 콜백은 신규 화면에 복사하지 않는다.
- 하드코딩된 제목·열·안내문은 [사전 사용법](../display-value/usage.md)과 [임시값 규칙](../display-value/temporary-value.md)을 따른다.

근거 경로: [참고 화면 목록](../../reference/screen-references.md). 공통 함수의 인자는 대상 모듈 `static/js/common.js`에서 확인한다.
- 검증: 파일 없음·빈 결과·형식 오류·재선택·서버 오류·중복 저장·부모 목록 갱신.
- `emptyGrid` 데이터 교체·일괄 추가와 동명 함수 주의사항은 [DataTables 행 조작](../table/table-row-operations.md)을 따른다. 작업 위저드·진행 조회 팝업은 [Admin frontend](../../reference/frontend-admin.md)에 별도로 정리한다.
