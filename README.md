# REAL_QR_FIND

QR 기반 대상자 안전 확인, 보호자 연락, 위치 공유, 상품 구매, 실종 광고 및 운영자 관리를 제공하는 Next.js 애플리케이션입니다.

## AI/개발자 인수인계 시작점

새 작업자는 아래 문서를 순서대로 읽습니다.

1. [`00_PROJECT_RULES.md`](00_PROJECT_RULES.md) - 저장소 작업 및 문서 갱신 규칙
2. [`deliverables/PROJECT_HANDOFF.md`](deliverables/PROJECT_HANDOFF.md) - 현재 구현 상태, 화면별 요구사항, 개발·배포 환경, 알려진 과제
3. [`logs/DEV_HANDOFF_LOG.md`](logs/DEV_HANDOFF_LOG.md) - 누적 기술 작업 이력
4. [`deliverables/README.md`](deliverables/README.md) - 기능별 상세 문서 색인

작업을 시작하기 전에 `git status --short`로 기존 변경사항을 확인하고, 사용자가 만든 미추적 파일이나 관련 없는 변경사항을 삭제하거나 되돌리지 않습니다.

## 로컬 실행

```powershell
npm install
npm run dev -- -p 3005
```

기본 확인 주소는 `http://localhost:3005`입니다. 환경변수 이름은 [`.env.example`](.env.example)을 참고하며 실제 키와 토큰은 저장소에 커밋하지 않습니다.

## 기본 검증

```powershell
npm run build
npm run security:check
```

변경한 기능에 해당하는 `package.json`의 `test:*` 회귀 테스트도 함께 실행합니다.
