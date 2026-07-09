import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AdPaymentClient from "../../../ad-payment-client";
import StatusToast from "../../../status-toast";
import { authOptions } from "../../../../lib/auth";
import { getGuardianAdCheckoutData } from "../../../../lib/db";

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

  return (
    <>
      <main className="ad-payment-page">
        <section className="ad-payment-phone">
          <header className="shop-topbar">
            <Link className="shop-back-link" href="/?tab=dashboard" aria-label="대시보드로 돌아가기">‹</Link>
            <h1>온라인 광고</h1>
            <span aria-hidden="true" />
          </header>
          <AdPaymentClient ad={data.ad} guardian={data.guardian} />
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
