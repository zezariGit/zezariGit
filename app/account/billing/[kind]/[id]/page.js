import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "../../../../../lib/auth";
import { formatDateOnly } from "../../../../../lib/date-format";
import { getGuardianPaymentDetail } from "../../../../../lib/db";
import { AccountTopbar, formatCurrency } from "../../../account-ui";
import { formatBillingDateTime, PaymentIcon, PaymentInfoSection, PaymentStatus } from "../../billing-ui";

const previewDetails = {
  "ad:preview-ad": {
    id: "preview-ad",
    payment_kind: "ad",
    payment_title: "온라인 실종 광고",
    payment_status: "paid",
    subject_name: "이하율",
    start_date: "2026-09-04",
    end_date: "2026-09-10",
    amount: 69900,
    payment_method: "CARD",
    payment_date: "2026-09-03 10:08:00",
  },
  "ad:preview-ad-old": {
    id: "preview-ad-old",
    payment_kind: "ad",
    payment_title: "온라인 실종 광고",
    payment_status: "paid",
    subject_name: "이하율",
    start_date: "2026-07-13",
    end_date: "2026-07-15",
    amount: 39900,
    payment_method: "CARD",
    payment_date: "2026-07-12 01:15:00",
  },
  "order:preview-bracelet": {
    id: "preview-bracelet",
    payment_kind: "order",
    payment_title: "제자리 QR 팔찌",
    payment_status: "delivered",
    subject_name: "이하율",
    product_name: "제자리 QR 팔찌",
    quantity: 1,
    recipient_name: "김보호",
    recipient_phone: "010-1234-5678",
    shipping_address: "서울특별시 강남구 테헤란로 123",
    shipping_address_detail: "101동 1001호",
    subtotal_amount: 25500,
    discount_amount: 0,
    amount: 29000,
    payment_method: "CARD",
    payment_date: "2026-08-21 05:32:00",
  },
  "order:preview-necklace": {
    id: "preview-necklace",
    payment_kind: "order",
    payment_title: "제자리 QR 목걸이",
    payment_status: "cancelled",
    subject_name: "이하율",
    product_name: "제자리 QR 목걸이",
    quantity: 1,
    recipient_name: "김보호",
    recipient_phone: "010-1234-5678",
    shipping_address: "서울특별시 강남구 테헤란로 123",
    shipping_address_detail: "101동 1001호",
    subtotal_amount: 20500,
    discount_amount: 0,
    amount: 24000,
    payment_method: "CARD",
    payment_date: "2026-06-28 07:47:00",
    cancelled_at: "2026-06-29 11:20:00",
  },
};

export default async function BillingDetailPage({ params, searchParams }) {
  const route = await params;
  const query = await searchParams;
  const preview = process.env.NODE_ENV === "development" && String(query?.preview || "") === "1";
  const session = preview ? { user: { provider: "credentials" } } : await getServerSession(authOptions);
  if (!session) redirect("/");

  const payment = preview
    ? previewDetails[`${route.kind}:${route.id}`]
    : await getGuardianPaymentDetail(session, route.kind, route.id);
  if (!payment) notFound();

  const isOrder = payment.payment_kind === "order";
  const shippingFee = isOrder
    ? Math.max(0, Number(payment.amount || 0) + Number(payment.discount_amount || 0) - Number(payment.subtotal_amount || 0))
    : 0;
  const detailRows = isOrder
    ? [
        { label: "대상자", value: payment.subject_name || "-" },
        { label: "상품", value: formatProductName(payment) },
        { label: "수량", value: `${Number(payment.quantity || 1)}개` },
      ]
    : [
        { label: "대상자", value: payment.subject_name || "-" },
        { label: "광고 기간", value: `${formatDateOnly(payment.start_date).replace(/-/g, ".")} - ${formatDateOnly(payment.end_date).replace(/-/g, ".")}` },
      ];
  const paymentRows = isOrder
    ? [
        { label: "상품 금액", value: formatCurrency(payment.subtotal_amount) },
        { label: "배송비", value: formatCurrency(shippingFee) },
        Number(payment.discount_amount || 0) > 0
          ? { label: "할인 금액", value: `-${formatCurrency(payment.discount_amount)}` }
          : null,
        { label: "총 결제 금액", value: formatCurrency(payment.amount), emphasis: true },
        { label: "결제 수단", value: paymentMethodLabel(payment.payment_method) },
        { label: "결제 일시", value: formatBillingDateTime(payment.payment_date) },
      ].filter(Boolean)
    : [
        { label: "결제 금액", value: formatCurrency(payment.amount), emphasis: true },
        { label: "결제 수단", value: paymentMethodLabel(payment.payment_method) },
        { label: "결제 일시", value: formatBillingDateTime(payment.payment_date) },
      ];

  return (
    <main className="account-page billing-detail-page">
      <section className="account-panel billing-detail-panel">
        <AccountTopbar title="결제 상세" backHref={`/account/billing${preview ? "?preview=1" : ""}`} />

        <article className="billing-detail-summary">
          <PaymentIcon kind={payment.payment_kind} cancelled={payment.payment_status === "cancelled"} />
          <div>
            <strong>{payment.payment_title}</strong>
            <PaymentStatus status={payment.payment_status} />
          </div>
        </article>

        <PaymentInfoSection title={isOrder ? "주문 상품" : "서비스 정보"} rows={detailRows} />
        {isOrder && (
          <PaymentInfoSection
            title="배송 정보"
            rows={[
              { label: "수령인", value: payment.recipient_name || "-" },
              { label: "연락처", value: payment.recipient_phone || "-" },
              { label: "배송지", value: formatAddress(payment) },
            ]}
          />
        )}
        <PaymentInfoSection title="결제 정보" rows={paymentRows} />
        {payment.payment_status === "cancelled" && (
          <PaymentInfoSection
            className="cancelled"
            title="취소 정보"
            rows={[
              { label: "취소 상태", value: "결제 취소", emphasis: true },
              { label: "취소 일시", value: formatBillingDateTime(payment.cancelled_at) },
            ]}
          />
        )}
      </section>
    </main>
  );
}

function formatProductName(payment) {
  const productName = payment.product_name || payment.payment_title || "제자리 QR 상품";
  return payment.design_name && !productName.includes(payment.design_name)
    ? `${productName} - ${payment.design_name}`
    : productName;
}

function formatAddress(payment) {
  return [payment.shipping_address, payment.shipping_address_detail].filter(Boolean).join(" ") || "-";
}

function paymentMethodLabel(method) {
  const normalized = String(method || "").toUpperCase();
  if (["CARD", "WIDGET", "EASYPAY"].includes(normalized)) return "신용·체크카드";
  if (["TRANSFER", "BANK_TRANSFER"].includes(normalized)) return "계좌이체";
  if (normalized === "VIRTUAL_ACCOUNT") return "가상계좌";
  if (normalized === "MOBILE_PHONE") return "휴대전화";
  return method || "-";
}
