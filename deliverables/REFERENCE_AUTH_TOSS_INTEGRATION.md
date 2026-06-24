# REAL_QR_FIND 구버전 로그인·토스 연동 산출물

## 참조 원본
- `reference/wp.sql`
- WordPress `wp-content`는 외부 심볼릭 링크여서 플러그인 PHP 소스는 포함되지 않았다.
- SQL 설정에서 `mshop-members-s2` OAuth 및 `pgall-for-woocommerce` Toss Payments 구성을 확인했다.
- 원본에는 운영키와 개인정보가 포함되어 `reference/` 전체를 Git에서 제외한다.

## 소셜 로그인
### 구버전 확인
- 카카오 로그인 활성
- 카카오 요청 범위: `profile_nickname`
- 카카오 Client Secret 미사용
- 네이버 로그인 활성
- 네이버 Client ID/Secret 사용

### 현재 사이트 반영
- 카카오는 `KAKAO_CLIENT_ID`만 필수로 허용한다.
- 카카오 Client Secret이 없으면 OAuth 공개 클라이언트 방식으로 토큰을 요청한다.
- 네이버는 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`을 모두 요구한다.
- 신규 SNS 사용자는 SNS 이름·이메일을 미리 채운 기존 추가정보 입력 과정을 거친다.
- 기존 SNS 사용자는 즉시 대시보드로 이동한다.

### 등록할 운영 콜백 URL
- Kakao: `https://zezari.vercel.app/api/auth/callback/kakao`
- Naver: `https://zezari.vercel.app/api/auth/callback/naver`

### 로컬 검증
- `/api/auth/providers`: credentials, google, kakao, naver 확인
- Kakao 인증 호스트: `kauth.kakao.com`
- Naver 인증 호스트: `nid.naver.com`
- Kakao scope: `profile_nickname`
- 각 콜백 경로 생성 확인

### 운영 반영
- Vercel Production/Development 환경에 Kakao와 Naver 설정 등록 완료
- `https://zezari.vercel.app/api/auth/providers`에서 Google, Kakao, Naver 확인
- 운영 Kakao/Naver 로그인 시작 시 각 공식 인증 호스트 이동 확인

## Toss Payments
### 구버전 확인
- 운영 모드
- 카드, 계좌이체, 가상계좌 결제수단
- 구버전 운영키는 보안상 문서와 Git에 기록하지 않는다.

### 현재 사이트 반영
- 구독 결제: 카드 빌링키 방식 유지
- 상품 단독 구매: 카드, 실시간 계좌이체, 가상계좌 지원
- 서버에서 결제수단 화이트리스트 검증
- 결제 성공 처리 전 로그인 보호자와 주문 소유권 검증
- 상품 주문번호, 요청금액, 승인금액, 승인상태 검증
- 구독 customerKey와 로그인 보호자 소유권 검증
- 결제 완료 콜백 재진입 시 중복 승인 방지
- 다른 보호자의 상품주문 및 구독 콜백 접근 차단 확인
- 계좌이체·가상계좌 주문 준비 성공, 미지원 결제수단 차단 확인
- 검증용 임시 주문은 모두 삭제 완료

### 키 운영 방침
- 2026-06-24 사용자 승인에 따라 로컬 `.env.local`과 Vercel Production은 Toss 라이브 키로 전환했다.
- Vercel Development는 안전한 개발 결제를 위해 기존 Toss 테스트 키를 유지한다.
- 실제 키 값은 문서, Git, 로그에 기록하지 않는다.
- 라이브 키는 읽기 전용 API 인증으로 확인했으며 자동 실결제는 수행하지 않았다.

### 2026-06-24 운영 검증
- Next.js 프로덕션 빌드 성공
- Toss 라이브 시크릿 인증 성공: 존재하지 않는 결제키 조회 시 `404 NOT_FOUND_PAYMENT`
- 실제 결제 승인, 과금, 취소, 환불은 실행하지 않음
- Vercel Production 배포: `https://zezari-171s2oo07-zezari.vercel.app`
- 운영 주소: `https://zezari.vercel.app`

## 보안 주의사항
- `reference/`, `wp.sql`, `.env.local`, `env.txt`를 Git 또는 Vercel 업로드에 추가하지 않는다.
- `.gitignore`와 `.vercelignore`에서 `reference/`를 이중으로 제외한다.
- Kakao/Naver 개발자 콘솔에서 새 Vercel 콜백 URL을 반드시 허용해야 실제 로그인이 완료된다.
- Toss 운영키 전환 후에는 실제 소액 결제, 취소, 환불까지 별도 운영 검증이 필요하다.
