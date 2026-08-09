# REAL_QR_FIND 주요설비 내역 및 설치장소

작성 기준: 2026-08-09 KST 운영 배포와 운영 DB 조회 결과

## 1. 설비 유형 판단

REAL_QR_FIND는 회사가 직접 물리 서버를 설치·운영하는 구조가 아니다. 위치정보시스템의 웹·API·DB·형상관리는 클라우드 사업자가 제공하는 논리설비를 사용한다. 따라서 신고서의 주요설비는 `클라우드 논리서버` 기준으로 작성하고, 자체 물리 서버 항목은 `해당 없음`으로 표시한다. 관리자 업무용 PC와 사업장 네트워크 장비는 서버가 아닌 운영·접근 단말 설비로 별도 기재한다.

## 2. 주요 논리설비 내역

| 구분 | 장비항목과 현재 규격 | 주요 활용기능 | 설치·운영장소 |
| --- | --- | --- | --- |
| 1 | Vercel Cloud 웹·애플리케이션 논리서버. 프로젝트 `zezari`, Next.js 16.3.0, Node.js 24.x, Production 배포 `READY` | 글로벌 CDN, HTTPS/TLS, PWA·정적자원, SSR, 인증, 관리자, QR 공개페이지, 결제·광고·위치공유 API | Vercel 관리형 클라우드. 운영 Function은 `iad1`(Washington, D.C., USA), 국내 요청은 `icn1` 서울 PoP를 경유할 수 있음 |
| 2 | Turso Cloud DB 논리서버. libSQL/SQLite 3.47.0, `aws-ap-northeast-1`, 스키마 37, 업무 테이블 37개, 확인 당시 논리용량 6.68 MB | 회원, 보호자, 관리대상, QR, 주문·결제, 광고, 쿠폰, 알림, 위치 암호문, 동의·취급대장·접근기록 저장 | Turso 관리형 클라우드. 현재 DB 엔드포인트 리전은 AWS `ap-northeast-1`(Tokyo, Japan) |
| 3 | GitHub Cloud 형상·배포이력 저장소. `zezariGit/zezariGit`, 운영 브랜치 `main` | 소스·변경·승인 이력, 배포 기준점, Vercel 자동 Production 배포 트리거 | GitHub 관리형 클라우드. 소스 저장소이며 원본 위치좌표 DB로 사용하지 않음 |

## 3. 운영·접근 설비

| 구분 | 설비 | 활용기능 | 제출 전 추가 기재·증빙 |
| --- | --- | --- | --- |
| 운영단말 | 위치정보관리책임자·취급자 업무용 PC | 관리자 로그인, 권한 관리, 취급대장·접근기록 확인, 민원·사고 대응 | 제조사·모델·OS·자산번호, 사업장 설치 사진, 백신·자동업데이트·화면잠금 캡처 |
| 네트워크 | 사업장 공유기·방화벽 또는 통신사 단말 | 관리자 단말의 인터넷 접속 | 제조사·모델·펌웨어, 관리자 암호·무선 암호화 설정 화면 |
| 이용자단말 | 발견자·보호자 스마트폰과 브라우저 | QR 스캔, 단발성 GPS 위치 산출, Web Push 수신 | 회사 보유 설비가 아닌 이용자 소유 외부 단말로 명시 |

## 4. 외부 연동 서비스

외부 연동은 주요 서버 장비와 구분하여 위탁·연계 서비스 목록으로 관리한다.

| 서비스 | 현재 용도 | 전달·처리 항목 |
| --- | --- | --- |
| Google·Kakao·Naver·Facebook OAuth | 회원 식별·로그인 | 공급자가 허용한 식별자, 이름, 이메일 |
| Toss Payments | 상품·광고 결제 | 주문번호, 결제금액, 결제상태 |
| Solapi | 휴대폰 인증 SMS | 수신 전화번호, 인증 안내문 |
| Bizcall | 통화 시점 임시 안심번호 | 보호자 전화번호, 임시 연결정보 |
| Meta Marketing API | 실종광고 생성·운영 | 광고 이미지, 대상 페이지 링크, 지역·기간·예산 |
| Web Push | 보호자 기기 알림 | 알림 제목·본문·이동 URL |
| Kakao Map | 발견 위치 표시 | 위치공유 시 생성한 좌표 링크 |

## 5. 설치장소와 현재 확인값

- Vercel 운영 Function의 확인 리전은 `iad1`이며 Vercel 공식 리전표에서 Washington, D.C., USA로 안내한다.
- Turso 운영 DB 호스트는 `aws-ap-northeast-1`을 포함하며 Tokyo, Japan 리전이다.
- 웹 Function과 DB가 서로 다른 국가·리전에 있으므로 네트워크 지연, 국외 처리 고지, 위탁·이전 근거를 함께 검토해야 한다.
- Vercel·Turso·GitHub의 정확한 물리 데이터센터 주소와 장비 일련번호는 이용자가 관리하지 않으므로 제공자 계정화면, 계약·Invoice, 공식 리전·보안 문서로 대체한다.
- 자체 물리 서버는 없으며, 관리자 PC와 사업장 네트워크 장비의 실제 모델·설치주소는 운영자가 제출 전에 추가한다.

## 6. 제출용 기재 문안

### 4.1 주요설비내역

1. **Vercel Cloud 논리 서버**
   - 활용기능: 웹 서버, WAS, 글로벌 CDN, HTTPS/TLS, PWA 정적자원, Next.js SSR 및 API 서버, 인증·QR·결제·광고·위치공유 처리
   - 현재규격: Next.js 16.3.0, Node.js 24.x, Production 배포, Function `iad1`
2. **Turso Cloud DB 논리 서버**
   - 활용기능: 회원·관리대상·QR·주문·결제·광고·알림·위치정보 암호문·동의·취급대장·접근기록 저장
   - 현재규격: libSQL/SQLite 3.47.0, `aws-ap-northeast-1`, 스키마 37, 업무 테이블 37개
3. **GitHub Cloud 형상관리 설비**
   - 활용기능: 소스코드, 변경이력, 배포 기준점, Vercel Production 자동 배포 연동
   - 현재규격: `zezariGit/zezariGit`, `main` 브랜치, `.env.local` 저장소 제외

### 4.2 설치장소 및 확인서류

서비스 서버는 Vercel·Turso·GitHub가 운영하는 국외 클라우드 데이터센터에 설치된 논리설비를 사용한다. 제출 시 프로젝트·데이터베이스·저장소 계정화면, 리전, 배포상태, 도메인, 계약·Invoice, 저장암호화·백업·Firewall/WAF 자료를 첨부한다. 비밀키·토큰·전체 연결문자열은 마스킹한다. 회사가 직접 설치한 물리 서버는 없으며 관리자 PC와 사업장 네트워크 장비는 실제 모델, 운영체제, 설치주소, 백신·업데이트·화면잠금 자료를 별도 첨부한다.

## 7. 증빙 이미지

- `evidence/04-vercel-project-deployment.png`: Vercel 프로젝트·런타임·Production 배포·리전·도메인
- `evidence/05-turso-database-status.png`: Turso 마스킹 호스트·리전·DB 엔진·스키마·논리용량
- `evidence/06-github-repository-deployment.png`: GitHub 저장소·운영 브랜치·커밋·배포연동·비밀정보 제외

## 8. 공식 확인자료

- Vercel Regions: https://vercel.com/docs/regions
- Vercel Deployments: https://vercel.com/docs/deployments/overview
- Turso DB Show: https://docs.turso.tech/cli/db/show
- Turso Cloud Encryption: https://docs.turso.tech/cloud/encryption
- Turso Database API: https://docs.turso.tech/api-reference/databases/list
- GitHub Repository Security: https://docs.github.com/en/enterprise-cloud@latest/code-security/getting-started/quickstart-for-securing-your-repository

## 9. 제출 전 운영자 확인

- Vercel 프로젝트의 Functions 설정에서 실제 운영 리전을 다시 캡처한다.
- Turso 포털의 DB 상세에서 데이터베이스명·Group·Primary location·크기·백업 정보를 캡처한다.
- GitHub 저장소의 접근권한·MFA·보안 설정을 캡처한다.
- Vercel·Turso 계약 또는 청구내역을 준비한다.
- 관리자 PC와 네트워크 장비의 모델·수량·설치주소를 입력한다.
- 국외 처리·이전 고지와 위치기반서비스 신고서의 국가·수탁자 기재를 전문가와 최종 확인한다.
