import { getFindPageDataByKey } from "../../../lib/db";
import GuardianNotifyButton from "./notify-button";

export const dynamic = "force-dynamic";

export default async function FindPage({ params }) {
  const resolvedParams = await params;
  const data = await getFindPageDataByKey(resolvedParams?.key);

  if (!data) {
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

  if (!data.qr_active) {
    return (
      <main className="find-page">
        <section className="find-shell">
          <p className="intro-kicker">QR 비활성</p>
          <h1>현재 사용할 수 없는 QR입니다</h1>
          <p>관리자가 비활성화한 QR 코드입니다. 필요한 경우 보호자 또는 관리자에게 문의해 주세요.</p>
          <div className="find-key-box">
            <span>식별 문자열</span>
            <strong>{data.public_key}</strong>
          </div>
        </section>
      </main>
    );
  }

  if (!data.subject_id || !data.guardian_id) {
    return (
      <main className="find-page">
        <section className="find-shell">
          <p className="intro-kicker">QR 확인 완료</p>
          <h1>아직 관리대상과 연결되지 않은 QR입니다</h1>
          <p>보호자가 관리대상을 등록하면 이 QR에서 대상자 정보와 보호자 안심번호를 확인할 수 있습니다.</p>
          <div className="find-key-box">
            <span>QR 코드</span>
            <strong>{data.code}</strong>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="find-page">
      <section className="find-shell">
        <p className="intro-kicker">REAL_QR_FIND</p>
        <h1>{data.subject_name}</h1>

        <div className="find-profile">
          <div className="find-profile-photo">
            {data.photo_data_url ? <img src={data.photo_data_url} alt={`${data.subject_name} 사진`} /> : <span />}
          </div>
          <div className="find-profile-info">
            <span>생년월일: {formatDate(data.birth_date)}</span>
            <span>성별: {data.gender || "-"}</span>
            <span>현재 상태: {data.subject_status || "문제없음"}</span>
          </div>
        </div>

        <div className="find-contact-grid">
          <div className="find-key-box">
            <span>보호자</span>
            <strong>{data.guardian_name || "이름 미입력"}</strong>
          </div>
          <div className="find-key-box">
            <span>안심번호</span>
            <strong>{data.safe_phone || "안심번호 준비중"}</strong>
          </div>
          <div className="find-key-box">
            <span>이메일</span>
            <strong>{data.email || "이메일 미입력"}</strong>
          </div>
          <div className="find-key-box">
            <span>주소</span>
            <strong>{data.address || "주소 미입력"}</strong>
          </div>
        </div>

        <GuardianNotifyButton qrKey={data.public_key} />
      </section>
    </main>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}
