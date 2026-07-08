# 관리자 쿠폰관리 산출물

## 요구내용
- 관리자페이지에 `쿠폰 관리` 메뉴와 화면을 추가한다.
- 첨부 화면처럼 조회 조건, 쿠폰 그리드, 오른쪽 쿠폰 수정/등록 폼을 구성한다.

## 반영내용
- 관리자 왼쪽 메뉴에 `쿠폰 관리`를 추가했다.
- `/admin?section=coupons` 화면을 추가했다.
- 조회 조건은 `검색어`, `할인 유형`, `상태`로 구성했다.
- 쿠폰 목록 그리드는 다음 컬럼을 표시한다.
  - 선택
  - 쿠폰번호
  - 쿠폰 코드
  - 할인 유형
  - 할인 금액
  - 할인 내용
  - 유효 기간
  - 발행 수
  - 사용 수
  - 상태
  - 관리
- 오른쪽 상세카드는 `쿠폰 등록` 또는 `쿠폰 수정` 폼으로 동작한다.
- 쿠폰 코드는 랜덤생성과 직접입력을 지원한다.
- 할인 유형은 `정률`, `정액`을 지원한다.
- 발행 설정은 최소금액, 최대금액, 적용 서비스, 발행수량, 1인당 사용 제한, 메모를 저장한다.
- 상태는 `사용 가능`, `사용 불가능`으로 관리한다.
- `+ 새 쿠폰` 버튼을 추가해 빈 등록 폼을 열 수 있게 했다.
- 쿠폰 목록 CSV 다운로드를 추가했다.

## DB 변경
- `coupons` 테이블을 추가했다.
- 기존 `guardian_coupons`에는 `coupon_id` 컬럼을 추가했다.
- `product_orders`에는 쿠폰 결제 추적용 컬럼을 추가했다.
  - `subtotal_amount`: 쿠폰 적용 전 주문금액
  - `discount_amount`: 쿠폰 할인금액
  - `guardian_coupon_id`: 보호자가 등록한 쿠폰 ID
  - `coupon_id`: 관리자 쿠폰 원장 ID
  - `coupon_code`, `coupon_name`, `coupon_discount_label`: 결제 당시 쿠폰 표시 정보
- 사용자가 쿠폰함에서 쿠폰을 등록할 때 `coupons` 원장을 우선 조회한다.
- 쿠폰이 없거나 비활성, 기간 외, 발행수량 초과이면 등록을 막는다.
- 정상 등록 시 `guardian_coupons`에 등록하고 `coupons.issued_count`를 증가시킨다.

## 사용자 결제 적용
- `/shop` 주문정보입력 단계에 쿠폰 선택 영역을 추가했다.
- 사용 가능한 쿠폰 중 현재 주문에 적용 가능한 쿠폰만 표시한다.
- 적용 조건은 쿠폰 상태, 유효기간, 최소 주문금액, 적용 서비스 범위로 검증한다.
- 정률 쿠폰은 주문 원금에 비율을 적용하고, 최대 할인금액이 있으면 그 금액을 상한으로 사용한다.
- 정액 쿠폰은 주문 원금보다 많이 할인되지 않도록 원금까지만 적용한다.
- 최종 결제금액은 `쿠폰 적용 전 금액 - 쿠폰 할인금액`으로 계산한다.
- 서버의 결제 준비 API에서도 같은 쿠폰 검증과 할인 계산을 다시 수행한다.
- 결제 성공 후에만 `guardian_coupons.status = used`로 변경하고 `coupons.used_count`를 증가시킨다.
- 100% 할인 등 최종 결제금액이 0원인 경우 Toss 결제위젯을 띄우지 않고 내부 완료 처리한다.
- 사용자 마이페이지 결제내역에는 쿠폰 할인금액을 표시한다.

## 주요 파일
- `lib/db.js`
  - `coupons` 테이블 생성
  - `product_orders` 쿠폰 결제 컬럼 추가
  - `getAdminCouponsData()`
  - `saveAdminCoupon()`
  - 주문 생성 시 쿠폰 검증 및 할인금액 계산
  - 결제 성공 시 쿠폰 사용완료 처리
  - 사용자 쿠폰 등록 검증 강화
- `app/shop/page.js`
  - 보호자의 사용가능 쿠폰을 결제 클라이언트로 전달
- `app/shop-checkout-client.js`
  - 주문정보입력 단계 쿠폰 선택 UI와 할인금액 표시
  - 전액 할인 주문 완료 흐름
- `app/api/payments/toss/product/prepare/route.js`
  - 상품 단독구매 쿠폰 적용
- `app/api/payments/toss/subscription/prepare/route.js`
  - 이용권 포함 상품구매 쿠폰 적용
- `app/payments/toss/product/success/page.js`
  - 상품 단독구매 전액 할인 완료 처리
- `app/payments/toss/subscription/success/page.js`
  - 이용권 포함 상품구매 전액 할인 완료 처리
- `app/account/billing/page.js`
  - 결제내역 쿠폰 할인금액 표시
- `app/admin/page.js`
  - 쿠폰관리 화면, 조회 폼, 그리드, 상세카드, CSV 매핑
- `app/admin/actions.js`
  - `saveAdminCouponAction()`
- `app/admin/admin-workspace.js`
  - 관리자 메뉴 `쿠폰 관리` 추가
- `app/globals.css`
  - 쿠폰관리 화면 스타일

## 검증
- `npm run build` 성공.
- `git diff --check` 통과.
- Turso `coupons` 테이블 및 `guardian_coupons.coupon_id` 확인 완료.

## 운영 메모
- 쿠폰은 결제 준비 단계에서 검증되며, 결제 성공 전에는 사용완료 처리하지 않는다.
- 결제 실패 또는 사용자가 결제를 중단한 경우 쿠폰은 계속 사용가능 상태로 남는다.
- Toss 결제위젯은 주문 화면 진입 시 한 번만 렌더링한다.
- 쿠폰 선택, 수량, 이용기간 변경으로 결제금액이 바뀔 때는 위젯을 다시 렌더링하지 않고 `setAmount`로 금액만 갱신한다.
- 이 구조는 Toss의 `하나의 약관 위젯만 사용할 수 있습니다` 오류를 방지한다.
