import { getServerSession } from "next-auth";
import { activateQrAction } from "../../actions";
import StatusToast from "../../status-toast";
import { authOptions } from "../../../lib/auth";
import { getGuardianKey } from "../../../lib/db";
import { getFindPageDataByKey } from "../../../lib/db";
import GuardianNotifyButton from "./notify-button";

export const dynamic = "force-dynamic";

export default async function FindPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const data = await getFindPageDataByKey(resolvedParams?.key);
  const notice = resolvedSearchParams?.notice || "";
  const noticeType = resolvedSearchParams?.noticeType || "success";

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
        <StatusToast message={notice} type={noticeType} />
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
        <StatusToast message={notice} type={noticeType} />
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
        <StatusToast message={notice} type={noticeType} />
      </main>
    );
  }

  if (!data.qr_activated_at) {
    const owner = Boolean(session && getGuardianKey(session) === data.guardian_google_id);
    return (
      <main className="find-page">
        <section className="find-shell qr-activation-shell">
          <p className="intro-kicker">상품 수령 후 활성화</p>
          <h1>{owner ? "QR 코드 활성화가 필요합니다" : "아직 활성화되지 않은 QR입니다"}</h1>
          {owner ? (
            <>
              <div className="find-profile">
                <div className="find-profile-photo">
                  {data.photo_data_url ? <img src={data.photo_data_url} alt={`${data.subject_name} 사진`} /> : <span />}
                </div>
                <div className="find-profile-info">
                  <strong>{data.subject_name}</strong>
                  <span>{formatDate(data.birth_date)}</span>
                  <span>해당 대상자의 QR 코드를 활성화하시겠어요?</span>
                </div>
              </div>
              <form action={activateQrAction} className="qr-activation-form">
                <input type="hidden" name="publicKey" value={data.public_key} />
                <button className="shop-next-button" type="submit">
                  QR 코드 활성화하기
                </button>
              </form>
              <p className="find-notify-message">활성화가 완료되면 오늘부터 구독기간이 시작되고, 이 QR에서 대상자 정보가 조회됩니다.</p>
            </>
          ) : (
            <>
              <p>보호자가 상품 수령 후 QR 코드를 활성화하면 대상자 정보와 보호자 안심번호를 확인할 수 있습니다.</p>
              <div className="find-key-box">
                <span>QR 코드</span>
                <strong>{data.code}</strong>
              </div>
            </>
          )}
        </section>
        <StatusToast message={notice} type={noticeType} />
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

        {(data.guardian_message || data.voice_data_url) && (
          <div className="find-guardian-message">
            <h2>보호자 안내</h2>
            {data.guardian_message && <p>{data.guardian_message}</p>}
            {data.voice_data_url && (
              <div className="find-audio-box">
                <span>{data.voice_name || "보호자 음성 메시지"}</span>
                <audio controls src={data.voice_data_url} />
              </div>
            )}
          </div>
        )}

        <GuardianNotifyButton qrKey={data.public_key} />
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}
