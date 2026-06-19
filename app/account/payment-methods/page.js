import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { savePaymentMethodAction } from "../../actions";
import FormSubmitButton from "../../form-submit-button";
import StatusToast from "../../status-toast";
import { authOptions } from "../../../lib/auth";
import { getGuardianPaymentMethods } from "../../../lib/db";
import { AccountTopbar } from "../account-ui";

export default async function PaymentMethodsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const params = await searchParams;
  const notice = params?.notice || "";
  const noticeType = params?.noticeType || "success";
  const { paymentMethods } = await getGuardianPaymentMethods(session);

  return (
    <main className="account-page">
      <section className="account-panel">
        <AccountTopbar title="결제수단" action={<span className="account-plus-mark" aria-hidden="true">+</span>} />

        <section className="account-section">
          <h2>기본 결제수단</h2>
          <div className="payment-method-list">
            {paymentMethods.map((method) => (
              <article className="payment-method-card" key={method.id}>
                <div className="payment-method-brand">{method.provider.slice(0, 4)}</div>
                <div>
                  <strong>{method.nickname}</strong>
                  <span>{method.provider} · 끝자리 {method.last4}</span>
                  <span>{method.is_default ? "기본 결제수단" : "보조 결제수단"}</span>
                </div>
                <span>{method.is_default ? "기본" : "등록"}</span>
              </article>
            ))}
            {paymentMethods.length === 0 && (
              <p className="account-empty-text">등록된 결제수단 표시 정보가 없습니다.</p>
            )}
          </div>
        </section>

        <form className="payment-method-form" action={savePaymentMethodAction}>
          <h2>결제수단 표시 정보 추가</h2>
          <label>
            별칭
            <input name="nickname" type="text" placeholder="예: 생활비 카드" maxLength={30} />
          </label>
          <label>
            카드사
            <select name="provider" defaultValue="신한카드">
              <option value="신한카드">신한카드</option>
              <option value="국민카드">국민카드</option>
              <option value="카카오페이">카카오페이</option>
              <option value="네이버페이">네이버페이</option>
              <option value="토스페이">토스페이</option>
              <option value="기타">기타</option>
            </select>
          </label>
          <label>
            끝 4자리
            <input name="last4" type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="1234" />
          </label>
          <label className="payment-default-check">
            <input name="isDefault" type="checkbox" value="1" />
            기본 결제수단으로 표시
          </label>
          <p>실제 카드번호와 CVC는 저장하지 않습니다. 실제 결제는 Toss Payments 보안 결제창에서 진행됩니다.</p>
          <FormSubmitButton pendingText="저장 중">저장</FormSubmitButton>
        </form>
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}
