import { getQrByKey } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default async function FindPage({ params }) {
  const resolvedParams = await params;
  const qr = await getQrByKey(resolvedParams?.key);

  if (!qr) {
    return (
      <main className="find-page">
        <section className="find-shell">
          <p className="intro-kicker">REAL_QR_FIND</p>
          <h1>등록되지 않은 QR입니다</h1>
          <p>관리자가 생성한 QR 코드인지 확인해 주세요.</p>
          <a className="admin-link" href="/">
            처음 화면
          </a>
        </section>
      </main>
    );
  }

  if (!qr.is_active) {
    return (
      <main className="find-page">
        <section className="find-shell">
          <p className="intro-kicker">QR 비활성</p>
          <h1>현재 사용할 수 없는 QR입니다</h1>
          <p>관리자가 비활성화한 QR 코드입니다. 필요한 경우 보호자 또는 관리자에게 문의해 주세요.</p>
          <div className="find-key-box">
            <span>식별 문자열</span>
            <strong>{qr.public_key}</strong>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="find-page">
      <section className="find-shell">
        <p className="intro-kicker">QR 확인 완료</p>
        <h1>사람찾기 페이지로 연결되었습니다</h1>
        <p>
          이 QR은 REAL_QR_FIND에서 발급한 활성 QR입니다. 대상자 연결, 실종 신고 접수, 보호자 알림 기능은
          다음 구현 단계에서 이 화면에 연결됩니다.
        </p>
        <div className="find-key-box">
          <span>QR 코드</span>
          <strong>{qr.code}</strong>
        </div>
        <div className="find-key-box">
          <span>URL 마지막 문자열</span>
          <strong>{qr.public_key}</strong>
        </div>
      </section>
    </main>
  );
}
