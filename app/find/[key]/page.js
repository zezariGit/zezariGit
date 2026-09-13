import { getServerSession } from "next-auth";
import { activateQrAction } from "../../actions";
import StatusToast from "../../status-toast";
import { authOptions, getConfiguredProviderIds } from "../../../lib/auth";
import { getGuardianKey } from "../../../lib/db";
import { getFindPageDataByKey } from "../../../lib/db";
import { formatDateOnly } from "../../../lib/date-format";
import LocationShareButton from "./location-share-button";
import GuardianVoicePlayer from "./guardian-voice-player";
import SafePhoneCallButton from "./safe-phone-call-button";
import EmergencyCallButton from "./emergency-call-button";
import QrClaimSignupActions from "./qr-claim-signup-actions";

export const dynamic = "force-dynamic";

export default async function FindPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const enabledProviders = getConfiguredProviderIds();
  const preview = resolvedParams?.key === "preview" && resolvedSearchParams?.preview === "1";
  const data = preview ? getLocationPreviewData(resolvedSearchParams?.state) : await getFindPageDataByKey(resolvedParams?.key);
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
    const storeSaleReserved = Number(data.store_sale_reserved || 0) === 1;
    if (!storeSaleReserved) {
      return <QrStatusScreen type="unassigned" />;
    }
    return (
      <main className="find-page">
        <section className="find-shell">
          <p className="intro-kicker">QR 확인 완료</p>
          <h1>아직 관리대상과 연결되지 않은 QR입니다</h1>
          <p>
            {storeSaleReserved
              ? "스토어 판매용 QR입니다. 가입 또는 로그인 후 첫 관리대상을 등록하면 이 QR과 바로 연결됩니다."
              : "관리자가 아직 스토어 판매용으로 선점하지 않은 QR입니다. QR 상태는 판매처 또는 관리자에게 확인해 주세요."}
          </p>
          <div className="find-key-box">
            <span>QR 코드</span>
            <strong>{data.code}</strong>
          </div>
          {storeSaleReserved ? (
            <QrClaimSignupActions
              publicKey={data.public_key}
              enabledProviders={enabledProviders}
              signedIn={Boolean(session)}
            />
          ) : (
            <a className="admin-link" href="/">처음 화면</a>
          )}
        </section>
        <StatusToast message={notice} type={noticeType} />
      </main>
    );
  }

  const owner = Boolean(session && getGuardianKey(session) === data.guardian_google_id);
  const adminTestActive = data.qr_activation_source === "admin_test";
  const subscriptionReady = !adminTestActive && data.subscription_status === "ready";
  const subscriptionActive = adminTestActive || hasActiveAccess(
    data.subscription_status,
    data.subscription_period_end,
    data.subscription_access_type
  );

  if (!subscriptionActive && !subscriptionReady) {
    const paused = data.subscription_status === "paused";
    const expired = data.subscription_status === "expired";
    if (expired) {
      return <QrStatusScreen type="expired" />;
    }
    return (
      <main className="find-page">
        <section className="find-shell">
          <p className="intro-kicker">서비스 확인 필요</p>
          <h1>{paused ? "현재 서비스가 일시정지되어 있습니다" : expired ? "기존 이용기간이 만료되었습니다" : "사용 가능한 QR 안심 서비스가 없습니다"}</h1>
          <p>상품 구매와 QR 활성화가 완료되기 전에는 대상자 정보가 표시되지 않습니다.</p>
          {owner ? (
            <a className="primary-button" href={paused ? "/account/billing" : "/shop"}>
              {paused ? "서비스 재개하기" : "상품 구매하기"}
            </a>
          ) : (
            <div className="find-key-box">
              <span>QR 코드</span>
              <strong>{data.code}</strong>
            </div>
          )}
        </section>
        <StatusToast message={notice} type={noticeType} />
      </main>
    );
  }

  if (!data.qr_activated_at || subscriptionReady) {
    return (
      <main className="find-page">
        <section className="find-shell qr-activation-shell">
          <p className="intro-kicker">상품 수령 후 활성화</p>
          <h1>{owner ? "QR 코드 활성화가 필요합니다" : "아직 활성화되지 않은 QR입니다"}</h1>
          {owner ? (
            <>
              <div className="find-profile qr-activation-profile">
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
              <p className="find-notify-message">활성화가 완료되면 이 QR에서 대상자 정보를 계속 조회할 수 있습니다.</p>
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
    <main className="find-page finder-public-page">
      <section className="find-shell finder-public-shell">
        <header className="finder-public-heading">
          <img src="/assets/finder/shield-check.png" alt="" />
          <h1>도움이 필요한 분의 정보입니다</h1>
          <p>함께 도와주세요.</p>
          <span aria-hidden="true" />
        </header>

        <div className="find-profile finder-public-profile">
          <div className="find-profile-photo">
            {data.photo_data_url ? <img src={data.photo_data_url} alt={`${data.subject_name} 사진`} /> : <span />}
          </div>
          <div className="find-profile-info">
            <strong>{data.subject_name}</strong>
            <span>{formatSubjectSummary(data.gender, data.birth_date)}</span>
          </div>
        </div>

        <SafePhoneCallButton qrKey={data.public_key} />

        <div className="finder-public-action-grid">
          <LocationShareButton
            qrKey={data.public_key}
            subjectName={data.subject_name}
            subjectPhoto={data.photo_data_url || ""}
            initialStep={previewStep(resolvedSearchParams?.location)}
            preview={preview}
          />
          <EmergencyCallButton />
        </div>

        <GuardianVoicePlayer
          src={data.voice_data_url || ""}
          name={data.voice_name || "보호자 음성 메시지"}
        />

        <div className="find-guardian-message">
          <h2><img src="/assets/finder/guardian-message.png" alt="" />보호자가 전하고픈 말</h2>
          {data.guardian_message && <p>{data.guardian_message}</p>}
          <small>위 메시지는 보호자가 직접 입력한 내용입니다.</small>
        </div>

        <footer className="finder-public-brand">
          <img src="/icons/zezari-wordmark-v1-512.png" alt="제자리" />
        </footer>
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function hasActiveAccess(status, periodEnd, accessType = "periodic") {
  if (status !== "active") return false;
  if (accessType === "product_lifetime") return true;
  if (!periodEnd) return false;
  const end = new Date(periodEnd);
  return !Number.isNaN(end.getTime()) && end.getTime() > Date.now();
}

function formatDate(value) {
  return formatDateOnly(value);
}

function formatSubjectSummary(gender, birthDate) {
  const normalizedBirthDate = formatDate(birthDate);
  const age = calculateAge(birthDate);
  return [
    gender || "성별 미입력",
    age === null ? null : `만 ${age}세`,
    normalizedBirthDate === "-" ? null : `(${normalizedBirthDate.replaceAll("-", ".")})`,
  ].filter(Boolean).join(" · ").replace(" · (", " (");
}

function calculateAge(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const nowParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)])
  );
  return nowParts.year - year - (nowParts.month < month || (nowParts.month === month && nowParts.day < day) ? 1 : 0);
}

function previewStep(value) {
  return ["intro", "permission", "confirm", "complete", "permission-denied", "location-error"].includes(value)
    ? value
    : "idle";
}

function getLocationPreviewData(state = "") {
  const data = {
    qr_id: "preview-qr",
    code: "PREVIEW",
    public_key: "preview",
    qr_active: 1,
    qr_activated_at: "2026-09-01T00:00:00.000Z",
    qr_activation_source: "admin_test",
    subject_id: "preview-subject",
    subject_name: "이하율",
    birth_date: "2016-05-10",
    gender: "여성",
    subject_status: "안전",
    photo_data_url: "/assets/subject-registration/photo-placeholder.png",
    guardian_message: "저희 아이는 대화가 조금 어려울 수 있어요. 보호자 음성을 들려주시고, 안전한 곳에서 보호자와 기다려주세요.",
    voice_data_url: "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAACAgICAgICAgICAgICAgA==",
    guardian_id: "preview-guardian",
    guardian_google_id: "preview-guardian",
    subscription_status: "active",
    subscription_access_type: "product_lifetime",
  };
  if (state === "unassigned") {
    return {
      ...data,
      subject_id: null,
      guardian_id: null,
      guardian_google_id: null,
      store_sale_reserved: 0,
    };
  }
  if (state === "expired") {
    return {
      ...data,
      qr_activation_source: "product",
      subscription_status: "expired",
      subscription_access_type: "periodic",
      subscription_period_end: "2026-08-31T23:59:59.000Z",
    };
  }
  return data;
}

function QrStatusScreen({ type }) {
  const expired = type === "expired";
  return (
    <main className="qr-status-page">
      <section className="qr-status-shell">
        <img
          className="qr-status-message"
          src={`/assets/qr-status/${expired ? "expired" : "unassigned"}.png?v=20260913-white`}
          alt={expired ? "사용할 수 없는 QR입니다. 관련된 문의는 관리자에게 문의해 주세요." : "미배정 QR입니다. 관리자에게 문의해 주세요."}
        />
        <a
          className="qr-status-kakao-link"
          href="https://pf.kakao.com/_xmuiln/chat"
          target="_blank"
          rel="noreferrer"
          aria-label="카카오톡으로 문의하기"
        >
          <img src="/assets/qr-status/kakao-inquiry.png?v=20260913-white" alt="카카오톡 문의" />
        </a>
      </section>
    </main>
  );
}
