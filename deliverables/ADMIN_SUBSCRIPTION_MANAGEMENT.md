# Admin Subscription Management

## Purpose
- 관리자페이지의 `구독 관리` 메뉴를 운영용 그리드 화면으로 재구성한다.
- 구독 상태, 결제 상태, 기간 조건으로 조회하고, 선택한 구독의 상세 정보를 오른쪽 카드에서 확인한다.
- 상세정보 카드는 `기본정보`, `결제내역` 두 탭으로 구성하며, 데이터가 길어져도 카드 내부에서 가로/세로 스크롤로 확인한다.

## Menu Position
- 관리자 왼쪽 메뉴: `구독 관리`
- URL: `/admin?section=subscriptions`
- 관리자 권한이 있는 사용자만 접근한다.

## Summary Cards
- `전체 구독`: 전체 구독 레코드 수
- `구독중`: 상태가 `active`인 구독 수
- `일시정지`: 상태가 `paused`인 구독 수
- `취소 / 환불`: 상태가 `cancelled`이거나 최근 구독 주문이 실패/취소된 구독 수

## Search Conditions
- 검색어: 구독번호, 최근 주문번호, 보호자명, 보호자 연락처, 보호자 이메일, 대상자명
- 구독상품: 구독 플랜 월수 기준
- 구독상태: 전체, 구독중, QR활성화 대기, 일시정지, 만료, 취소
- 결제상태: 전체, 결제완료, 결제대기, 결제실패
- 구독기간: 구독 시작일 기준 시작/종료일

## Grid Columns
- 선택
- 구독번호
- 대상자(보호자)
- 구독상품
- 구독기간
- 다음결제일
- 금액
- 구독상태
- 결제상태
- 관리

## Detail Card Tabs

### 기본정보
- 대상자정보
  - 대상자명
  - 생년월일
  - 보호자명
  - 연락처
  - 대상자 상세보기 링크
- 구독정보
  - 구독상품
  - 구독기간
  - 다음결제일
  - 구독상태
  - 결제상태
  - 금액
  - 결제관리 상세보기 링크
- 관리자 메모
  - `subscriptions.admin_memo`에 저장
  - 서버 액션에서 관리자 권한을 확인한 뒤 저장

### 결제내역
- 선택한 구독의 보호자 기준 최근 구독 주문 30건을 표시한다.
- 결제일시, 결제상품, 결제금액, 결제수단, 결제상태, 구독번호, 영수증 조회 링크를 보여준다.

## Data Source
- `subscriptions`: 구독 기본정보, 상태, 기간, 금액, 운영 메모
- `guardians`: 보호자명, 연락처, 이메일, 주소
- `product_orders`: 구독 주문/결제 상태, 결제수단, 최근 결제일
- `products`: 구독 상품명
- `subjects`: 대상자명, 성별, 생년월일, 사진
- `subscription_plans`: 관리자 설정 구독 플랜 목록

## Schema Change
- `subscriptions.admin_memo TEXT` 컬럼을 추가했다.
- 기존 DB에는 `ensureSchema()`에서 컬럼 존재 여부를 확인한 뒤 누락 시 안전하게 추가한다.

## Scroll Behavior
- 구독 목록 그리드는 최소 너비를 갖고 가로 스크롤로 확인한다.
- 오른쪽 상세정보 카드는 고정 최대 높이 안에서 세로 스크롤된다.
- 각 탭 패널도 고정 높이와 내부 스크롤을 갖는다.
- 긴 구독번호/주문번호는 `inline-scroll-value`로 줄바꿈 없이 가로 스크롤된다.

## Export
- 구독 목록의 현재 조회 결과를 `zezari-subscriptions.csv`로 다운로드한다.

## Verification Checklist
- `npm run build` 성공
- `git diff --check` 성공
- Turso `subscriptions.admin_memo` 컬럼 존재 확인
- Turso 구독 목록/최근 주문 조인 SQL 조회 성공
- 운영 배포 후 `/admin?section=subscriptions` HTTP 200 확인

