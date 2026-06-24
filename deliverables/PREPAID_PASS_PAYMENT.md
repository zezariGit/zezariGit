# REAL_QR_FIND 선불 이용권 결제 전환 산출물

## 1. 구현 목적
- Toss Payments 자동결제 빌링 계약 없이 1개월, 3개월, 6개월 이용권을 한 번씩 결제한다.
- 최초 구매 이용기간은 상품 수령 후 보호자가 주문 대상자의 QR을 활성화한 시점부터 시작한다.
- 기존 이용권이 유효하면 추가 구매한 개월 수를 현재 만료일 뒤에 이어 붙인다.
- 이용권이 일시정지되면 정지 기간만큼 만료일을 뒤로 미루고, 만료 또는 비정상 상태에서는 공개 QR의 개인정보를 차단한다.

## 2. 사용자 흐름
1. 보호자가 상품과 관리대상자를 선택한다.
2. 1개월, 3개월, 6개월 중 이용기간을 선택한다.
3. 주문정보 화면에서 배송지와 Toss Payments 결제수단을 확인한다.
4. Toss 결제위젯이 일회성 결제를 인증하고 서버가 주문번호, 금액, 상태를 검증해 승인한다.
5. 최초 구매는 `QR 활성화 대기` 상태로 저장된다.
6. 보호자가 상품에 인쇄된 QR을 스캔하면 주문에서 선택한 관리대상자인지 확인한다.
7. 일치하는 QR을 활성화한 시점부터 이용기간이 시작되고 공개 찾기 페이지가 열린다.

## 3. 상태 규칙
| 상태 | 의미 | 허용 동작 | 공개 QR 개인정보 |
| --- | --- | --- | --- |
| `ready` | 결제 완료, QR 활성화 대기 | 주문 대상 QR 활성화 | 숨김 |
| `active` | 이용권 사용 중 | 일시정지, 추가 구매 | 만료일 전만 표시 |
| `paused` | 사용자 일시정지 | 이용 재개, 추가 구매 | 숨김 |
| `expired` | 이용기간 만료 | 새 이용권 구매 | 숨김 |
| `failed` | 결제 또는 처리 실패 | 재구매 | 숨김 |

## 4. 기간 계산
- 최초 시작: QR 활성화 시각부터 구매 개월 수를 달력 월 단위로 계산한다.
- 월말 보정: 7월 31일에서 1개월 연장하면 8월 31일처럼 대상 월의 마지막 날짜에 맞춘다.
- 추가 구매: `active` 또는 `paused`이고 기존 만료일이 유효하면 현재 만료일을 기준으로 연장한다.
- 일시정지: `paused_at`부터 재개 시각까지의 실제 경과 시간을 기존 만료일에 더한다.
- 만료 정규화: 활성 상태라도 만료일이 지났거나 만료일이 없으면 조회 시 `expired`로 정리한다.

## 5. 결제 및 보안 규칙
- 브라우저에는 결제위젯 클라이언트 키만 전달한다.
- 결제위젯 시크릿 키는 서버 승인 API에서만 사용한다.
- 서버가 로그인 보호자 소유권, 내부 주문 ID, Toss 주문번호, 금액, 결제상태 `DONE`을 모두 검증한다.
- 카드번호, 계좌번호, 인증정보는 서비스 DB에 저장하지 않는다.
- 자동결제 빌링키 발급과 `/v1/billing` 호출을 제거했다.
- 기존 `billing_key` 컬럼은 스키마 호환을 위해 남기되 새 결제 완료와 QR 활성화 시 빈 값으로 정리한다.
- 결제 실패 콜백은 해당 주문만 실패 처리하며 기존 이용권 상태를 변경하지 않는다.
- `ready` 이용권은 결제 주문에서 선택한 관리대상자의 QR로만 시작할 수 있다.

## 6. 주요 구현 위치
- 결제 준비 API: `app/api/payments/toss/subscription/prepare/route.js`
- 결제 성공/실패: `app/payments/toss/subscription/success/page.js`, `app/payments/toss/subscription/fail/page.js`
- 결제위젯 UI: `app/shop-checkout-client.js`
- 이용권 제어 UI: `app/account/subscription-controls.js`, `app/account/billing/page.js`
- QR 공개 및 활성화: `app/find/[key]/page.js`
- 기간·주문·상태 로직: `lib/db.js`
- Toss 서버 승인: `lib/toss-payments.js`

## 7. 데이터 변경
- DB 스키마 버전: `6`
- 이용권 옵션 이름을 `1개월 이용권`, `3개월 이용권`, `6개월 이용권`으로 통일했다.
- 관리자가 설정한 기존 옵션별 금액은 유지한다.
- 주문 상태 `paid_waiting_activation`은 결제 완료 후 QR 활성화를 기다리는 상태다.
- 주문 상태 `activated`는 주문 대상 QR 활성화까지 완료된 상태다.

## 8. 검증 결과
- 프로덕션 빌드 성공: Next.js 동적 페이지와 API 20개 생성.
- DB 통합 시나리오 7개 통과: 최초 대기, QR 시작, 월말 연장, 일시정지 유지, 3개월 연장, 재개 보정, 만료 정규화.
- 보안 경계 시나리오 5개 통과: 다른 대상자 QR 차단, 차단된 QR 미변경, 정상 대상 QR 시작, 주문 활성화, 만료일 없는 활성 상태 만료 처리.
- 실제 Toss 결제수단 및 약관 iframe 로딩과 결제 버튼 활성화 확인.
- 데스크톱 1440px, 모바일 390px에서 페이지 수준 가로 넘침 없음.
- 만료 QR에서 대상자명, 보호자명, 안심번호, 주소가 노출되지 않음을 확인.
- QR 활성화, 이용권 일시정지와 재개 화면 동작 확인.
- 자동 테스트에서는 최종 결제 요청과 실제 금전 거래를 실행하지 않았다.

## 9. 운영 체크리스트
- Vercel에 `TOSS_WIDGET_CLIENT_KEY`, `TOSS_WIDGET_SECRET_KEY`, `PUBLIC_APP_URL`이 설정되어 있어야 한다.
- 운영 도메인을 변경할 때 `PUBLIC_APP_URL`과 `NEXTAUTH_URL`을 함께 변경한다.
- 가격 변경은 관리자 이용권 옵션에서 수행한다.
- 운영 실결제 전 최소 금액의 승인·취소 테스트를 별도로 수행한다.
- 만료 처리, QR 활성화 대기, 일시정지 건수를 관리자 대시보드에서 관찰한다.

## 10. 발표용 이미지 생성 프롬프트
Create a polished Korean civic-tech flow diagram for "REAL_QR_FIND" prepaid QR safety passes. Show a guardian selecting a managed subject and a 1, 3, or 6 month pass, completing one-time payment through Toss Payments Widget, receiving a QR product, scanning the exact QR assigned to the ordered subject, and starting the pass only after QR activation. Add renewal extending from the current expiry date, pause freezing the remaining period, resume extending the expiry by the paused duration, and expired or paused states hiding all personal information on the public QR page. Include Next.js, Toss Payments confirm API, Turso tables `product_orders`, `subscriptions`, `subjects`, and `qr_codes`, plus server checks for guardian ownership, order ID, amount, payment status, and subject-to-QR match. Use white work surfaces, civic blue, green active, amber ready or paused, red expired, compact Korean labels, and no real credentials or personal information.
