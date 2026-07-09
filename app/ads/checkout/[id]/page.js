import Link from "next/link";
import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { getGuardianAdCheckoutData } from "../../../../lib/db";
import StatusToast from "../../../status-toast";

export default async function AdCheckoutPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/?notice=로그인이 필요합니다.&noticeType=error");

  let data;
  try {
    data = await getGuardianAdCheckoutData(session, id);
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 결제 정보를 찾을 수 없습니다.", "error"));
  }

  const { ad } = data;
  const qrImage = ad.qr_target_url
    ? await QRCode.toDataURL(ad.qr_target_url, {
      margin: 1,
      width: 120,
      color: {
        dark: "#1f2d3d",
        light: "#ffffff",
      },
    })
    : "";
  const age = calculateAge(ad.subject_birth_date);

  return (
    <>
      <main className="dashboard-page ad-checkout-page">
        <section className="dashboard-shell ad-checkout-shell">
          <Link className="signup-back-button" href="/?tab=dashboard">
            <span aria-hidden="true">‹</span>
            <span className="visually-hidden">대시보드로 돌아가기</span>
          </Link>
          <header className="dashboard-header">
            <div>
              <p className="intro-kicker">온라인 광고</p>
              <h1 className="dashboard-title">광고 결제</h1>
              <p className="dashboard-subtitle">
                결제 완료 후 아래 광고 소재를 이미지화해 Meta 광고 등록 단계에서 사용할 수 있습니다.
              </p>
            </div>
          </header>

          <section className="ad-checkout-grid">
            <article
              className="missing-ad-poster ad-checkout-poster"
              data-ad-creative="missing-person-payment"
              data-subject-id={ad.subject_id}
              data-ad-id={ad.id}
            >
              <header className="missing-ad-poster-header">
                <strong>실종자를 찾습니다</strong>
                <span>여러분의 작은 제보가 가족을 만날 수 있게 합니다.</span>
              </header>
              <div className="missing-ad-poster-body">
                <div className="missing-ad-photos">
                  <div className="missing-ad-main-photo">
                    {ad.subject_photo_url ? <img src={ad.subject_photo_url} alt={`${ad.subject_name} 사진`} /> : <span aria-hidden="true" />}
                  </div>
                  <div className="missing-ad-thumb-row" aria-hidden="true">
                    {[0, 1, 2].map((index) => (
                      <span key={index}>
                        {ad.subject_photo_url ? <img src={ad.subject_photo_url} alt="" /> : null}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="missing-ad-info">
                  <dl>
                    <div>
                      <dt>이름</dt>
                      <dd>{ad.subject_name}</dd>
                    </div>
                    <div>
                      <dt>나이</dt>
                      <dd>{age ? `${age}세` : "-"}</dd>
                    </div>
                    <div>
                      <dt>성별</dt>
                      <dd>{formatGender(ad.subject_gender)}</dd>
                    </div>
                  </dl>
                  <div className="missing-ad-message">
                    <strong>보호자 메시지</strong>
                    <p>{ad.subject_guardian_message || "보호자가 작성한 메시지가 이 영역에 표시됩니다."}</p>
                  </div>
                </div>
              </div>
              <footer className="missing-ad-poster-footer">
                <div className="missing-ad-contact">
                  <strong>발견즉시 연락부탁드립니다</strong>
                  <span>qr을 스캔하시면 보호자에게 연락할 수 있습니다</span>
                </div>
                <div className="missing-ad-qr">
                  {qrImage ? <img src={qrImage} alt={`${ad.subject_name} QR 코드`} /> : <span>QR</span>}
                </div>
              </footer>
            </article>

            <aside className="ad-checkout-summary">
              <h2>주문 요약</h2>
              <dl>
                <div>
                  <dt>대상자</dt>
                  <dd>{ad.subject_name}</dd>
                </div>
                <div>
                  <dt>광고지역</dt>
                  <dd>{ad.region}</dd>
                </div>
                <div>
                  <dt>광고반경</dt>
                  <dd>{Number(ad.region_radius_km || 0)}km</dd>
                </div>
                <div>
                  <dt>광고기간</dt>
                  <dd>{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</dd>
                </div>
                <div>
                  <dt>일 단가</dt>
                  <dd>{formatCurrency(ad.daily_rate)}</dd>
                </div>
                <div>
                  <dt>결제예정금액</dt>
                  <dd>{formatCurrency(ad.amount)}</dd>
                </div>
              </dl>
              {ad.qr_target_url && (
                <a className="plain-button" href={ad.qr_target_url} target="_blank" rel="noreferrer">
                  관리대상정보 페이지 열기
                </a>
              )}
              <button type="button" className="action" disabled>
                Toss 광고 결제 연결 대기
              </button>
              <p>
                Meta API 키와 광고 결제 연동이 승인되면 이 버튼에서 결제 승인 후 광고 소재 이미지 등록을 진행합니다.
              </p>
              <Link className="outline-login-button" href="/account/ads">
                광고내역 보기
              </Link>
            </aside>
          </section>
        </section>
      </main>
      <StatusToast message={resolvedSearchParams?.notice || ""} type={resolvedSearchParams?.noticeType || "success"} />
    </>
  );
}

function withNotice(path, message, type = "success") {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("notice", message);
  params.set("noticeType", type);
  return `${base}?${params.toString()}`;
}

function calculateAge(birthDate) {
  const match = String(birthDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return 0;
  const now = new Date();
  let age = now.getFullYear() - Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (now.getMonth() < month || (now.getMonth() === month && now.getDate() < day)) {
    age -= 1;
  }
  return Math.max(0, age);
}

function formatGender(value) {
  if (value === "남" || value === "남성") return "남";
  if (value === "여" || value === "여성") return "여";
  return value || "-";
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}
