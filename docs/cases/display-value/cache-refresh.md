# 값 저장 후 캐시 반영

> 범위: Admin·CMP 저장/조회, 포탈 캐시 갱신 | 상태: 코드 확인, 실행 미검증 | 근거: 아래 소스

1. Admin 관리 화면 → Admin Controller → Proxy Client → CMP API·Service → DB에 저장한다.
2. 성공한 저장 요청의 Admin 인스턴스는 해당 Dictionary·Code·Configuration 캐시를 제거한다.
3. 다음 조회에서 CMP 전체 목록 API로 데이터를 다시 읽어 Admin 메모리에 보관한다. 시작 시 선조회도 있다.
4. Thymeleaf가 캐시에서 문구·목록을 읽어 HTML·JavaScript에 넣는다. 이미 열린 화면은 다시 로드해야 한다.

- 캐시는 서버 인스턴스의 메모리에 있다. 한 Admin에서 저장해도 다른 인스턴스·모듈이 동시에 갱신되지는 않는다.
- `CacheBase`의 시간 만료 재조회는 주석 처리되어 있다. 기다리면 곧 반영된다고 가정하지 않는다.
- 최종 레이아웃의 캐시 초기화 버튼은 `/admin/settings/refreshCacheButton`을 호출한다.
- 이 경로는 Admin·User·CMP·Batch 갱신을 시도한다. Kubernetes 환경에서는 Pod별 호출 경로를 사용한다.
- 해당 경로에 interface 갱신은 포함되지 않는다. 다른 모듈 적용 시 별도 확인한다.
- Admin에는 05시 갱신 스케줄 선언도 있다. 실제 스케줄 활성화·실행 성공은 환경에서 확인한다.
- 갱신 실패 메시지가 있으면 완료로 처리하지 않는다. 대상 모듈·인스턴스를 확인한다.
- 브라우저 새로고침과 서버 캐시 갱신은 다르다. DB에 직접 등록한 경우에도 서버 캐시 반영을 확인한다.

근거: `admin:src/main/java/kr/datasolution/cuni/common/cache/`의 `ProxyClientCacheManager.java`, `CacheBase.java`.
저장·갱신 근거: `admin:src/main/java/kr/datasolution/cuni/admin/controller/settings/`의 각 Controller 및 `SettingController.java`.
버튼 근거: `admin:src/main/resources/templates/layout_final/layout_admin.html`의 `refreshCache`.
- 관련: [등록 방법](registration-admin.md), [소스 기준](../../maintenance/source-baseline.md).
