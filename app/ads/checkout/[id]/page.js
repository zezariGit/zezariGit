import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AdPaymentClient from "../../../ad-payment-client";
import StatusToast from "../../../status-toast";
import { isAdminSession } from "../../../../lib/admin";
import { authOptions } from "../../../../lib/auth";
import { getGuardianAdCheckoutData } from "../../../../lib/db";

export default async function AdCheckoutPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const previewMode = process.env.NODE_ENV === "development"
    ? String(resolvedSearchParams?.preview || "")
    : "";
  const preview = ["1", "admin"].includes(previewMode);

  if (preview) {
    return (
      <main className="ad-payment-page">
        <section className="ad-payment-phone">
          <header className="shop-topbar ad-payment-topbar">
            <Link className="shop-back-link" href="/?preview=ad-campaign" aria-label="광고 세팅으로 돌아가기">‹</Link>
            <h1>광고 결제</h1>
            <span aria-hidden="true" />
          </header>
          <AdPaymentClient
            ad={previewAd()}
            guardian={{ name: "김보호", email: "guardian@example.com" }}
            adminPaymentPassEnabled={previewMode === "admin"}
            preview
            initialPaymentError={String(resolvedSearchParams?.paymentError || "")}
          />
        </section>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) redirect("/?notice=로그인이 필요합니다.&noticeType=error");

  let data;
  try {
    data = await getGuardianAdCheckoutData(session, id);
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 결제 정보를 찾을 수 없습니다.", "error"));
  }

  const {
    meta_budget_amount: _metaBudgetAmount,
    meta_margin_percent: _metaMarginPercent,
    meta_budget_version: _metaBudgetVersion,
    ...guardianVisibleAd
  } = data.ad;

  return (
    <>
      <main className="ad-payment-page">
        <section className="ad-payment-phone">
          <header className="shop-topbar ad-payment-topbar">
            <Link className="shop-back-link" href={`/?adSubject=${encodeURIComponent(guardianVisibleAd.subject_id)}&newAd=1`} aria-label="광고 세팅으로 돌아가기">‹</Link>
            <h1>광고 결제</h1>
            <span aria-hidden="true" />
          </header>
          <AdPaymentClient
            ad={guardianVisibleAd}
            guardian={data.guardian}
            adminPaymentPassEnabled={isAdminSession(session) || Number(data.guardian?.is_admin || 0) === 1}
            initialPaymentError={String(resolvedSearchParams?.paymentError || "")}
          />
        </section>
      </main>
      <StatusToast message={resolvedSearchParams?.notice || ""} type={resolvedSearchParams?.noticeType || "success"} />
    </>
  );
}

function previewAd() {
  return {
    id: "preview-ad",
    subject_id: "preview-subject",
    subject_name: "김제자리",
    region: "서울특별시 강남구 역삼동",
    region_radius_km: 20,
    coverage_type: "radius",
    distance_label: "20km · 인근 지역",
    duration_label: "7일",
    days: 7,
    amount: 89900,
    creative_image_url: "/assets/missing-ad-template.png",
  };
}

function withNotice(path, message, type = "success") {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("notice", message);
  params.set("noticeType", type);
  return `${base}?${params.toString()}`;
}
