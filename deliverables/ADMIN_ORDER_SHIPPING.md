# REAL_QR_FIND 관리자 주문/배송 관리 산출물

## 목적
- 관리자에게 일반 쇼핑몰 운영에 필요한 주문 조회와 기본 물류 처리 기능을 제공한다.
- 결제 상태와 배송 상태를 분리해 주문 처리 오류를 줄인다.

## 관리자 경로
- `/admin?section=orders`

## 구현 기능
- 전체 주문, 결제 완료, 배송 준비, 배송 중, 배송 완료 건수 요약
- 주문번호, 보호자, 대상자, 상품명, 송장번호 통합 검색
- 결제 상태 및 배송 상태 필터
- 주문 상품, 수량, 구독기간, 결제금액, 결제수단, 결제일 조회
- 보호자와 수령인 연락처, 기본주소, 상세주소 조회
- 배송상태, 택배사, 송장번호, 관리자 메모 저장
- 발송일과 배송완료일 자동 기록
- 결제 전 주문의 배송 처리 차단
- 배송중 및 배송완료 상태 변경 시 보호자 종 알림 생성

## 배송 상태
| 값 | 관리자 표시 | 의미 |
| --- | --- | --- |
| `pending` | 결제 확인 전 | 결제가 끝나지 않아 배송할 수 없는 상태 |
| `preparing` | 배송 준비 | 결제 완료 후 포장 및 출고 준비 상태 |
| `shipped` | 배송 중 | 택배사와 송장번호가 입력되고 발송된 상태 |
| `delivered` | 배송 완료 | 고객에게 배송이 완료된 상태 |
| `cancelled` | 배송 취소 | 물류 처리가 취소된 상태 |

## DB 변경
- 스키마 버전: `3`
- `product_orders.fulfillment_status`
- `product_orders.recipient_name`
- `product_orders.recipient_phone`
- `product_orders.carrier`
- `product_orders.tracking_number`
- `product_orders.admin_memo`
- `product_orders.shipped_at`
- `product_orders.delivered_at`

## 처리 규칙
- 결제 완료 상태는 `paid`, `paid_waiting_activation`, `activated`이다.
- 결제가 완료되면 배송상태가 자동으로 `preparing`으로 변경된다.
- `shipped`, `delivered` 저장 시 택배사와 송장번호가 필수다.
- 보호자 화면의 결제 및 구독 현황에서 배송상태와 송장번호를 확인할 수 있다.

## 검증
- 로컬 및 Vercel 프로덕션 빌드 성공
- 인증된 관리자 주문/배송 페이지 HTTP 200
- 임시 주문을 통한 배송상태·택배사·송장·메모 서버 액션 저장 확인
- 임시 주문 삭제 후 잔여 데이터 0건 확인
- 운영 DB 스키마 버전 3 및 물류 컬럼 확인

## 후속 확장 후보
- 토스 결제 취소 및 부분 환불
- 주문 상세 페이지와 변경 이력 감사 로그
- 엑셀 다운로드 및 송장 일괄 업로드
- 택배사 배송조회 API 연결
- 재고, 품절, 반품 및 교환 관리
