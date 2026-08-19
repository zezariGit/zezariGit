"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import {
  addSafePhonePoolNumber,
  assignSafePhonePoolNumberForAdmin,
  createProductCatalogItem,
  deleteSafePhonePoolNumber,
  generateQrCodes,
  createAdminPaymentRefund,
  getAdminMessageById,
  getAdminMessageRecipients,
  isDbAdminSession,
  markAdminMessageSent,
  releaseSafePhonePoolNumberForAdmin,
  saveAdminCoupon,
  saveAdminMessage,
  saveAdminMessageTemplate,
  recordLocationDisclosure,
  saveLocationStaffPermission,
  setAdminSubjectAdMemo,
  setAdminSubjectAdStatus,
  setAdPricingSettings,
  setGuardianActive,
  setGuardianAdminMemo,
  setGuardianAdmin,
  setProductCatalogItem,
  setProductOrderFulfillment,
  setQrAdminMemo,
  setQrActive,
  setQrAdminTestActivation,
  setQrLifecycle,
  setQrStoreSaleReservation,
  setQrSubject,
  setSubscriptionAdminMemo,
  setSubscriptionAdminTest,
  setSubscriptionPlanPrice,
} from "../../lib/db";
import { notifyGuardiansFromAdmin } from "../../lib/push";

export async function saveLocationStaffPermissionAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let result;
  try {
    const requestHeaders = await headers();
    result = await saveLocationStaffPermission(formData, session, {
      ipAddress: (requestHeaders.get("x-forwarded-for") || "").split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "",
      userAgent: requestHeaders.get("user-agent") || "",
    });
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=location-security"), error.message || "위치정보 권한 저장에 실패했습니다.", "error"));
  }
  const roleLabel = result.role === "manager" ? "위치정보관리책임자" : "위치정보취급자";
  redirect(withNotice(getReturnTo(formData, "/admin?section=location-security"), `${result.guardianName} 계정의 ${roleLabel} 권한이 저장되었습니다.`));
}

export async function recordLocationDisclosureAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    const requestHeaders = await headers();
    await recordLocationDisclosure(formData, session, {
      ipAddress: (requestHeaders.get("x-forwarded-for") || "").split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "",
      userAgent: requestHeaders.get("user-agent") || "",
    });
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice("/admin?section=location-security", error.message || "열람·고지 사실을 기록하지 못했습니다.", "error"));
  }
  redirect(withNotice("/admin?section=location-security", "열람·고지 사실이 취급대장에 기록되었습니다."));
}

export async function setGuardianActiveAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setGuardianActive(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin"), error.message || "상태 변경에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin"), "보호자 상태가 수정되었습니다."));
}

export async function setGuardianAdminMemoAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setGuardianAdminMemo(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=guardians"), error.message || "관리 메모 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=guardians"), "관리 메모가 저장되었습니다."));
}

export async function addSafePhonePoolNumberAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await addSafePhonePoolNumber(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=safe-phones"), error.message || "안심번호를 추가하지 못했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=safe-phones"), "안심번호가 풀에 추가되었습니다."));
}

export async function assignSafePhonePoolNumberAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let result;
  try {
    result = await assignSafePhonePoolNumberForAdmin(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=safe-phones"), error.message || "안심번호를 매칭하지 못했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=safe-phones"), `${result.safePhone} 번호가 보호자에게 24시간 매칭되었습니다.`));
}

export async function releaseSafePhonePoolNumberAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let result;
  try {
    result = await releaseSafePhonePoolNumberForAdmin(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=safe-phones"), error.message || "안심번호 매칭을 해제하지 못했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=safe-phones"), `${result.safePhone} 번호의 매칭이 해제되었습니다.`));
}

export async function deleteSafePhonePoolNumberAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let result;
  try {
    result = await deleteSafePhonePoolNumber(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=safe-phones"), error.message || "안심번호를 삭제하지 못했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=safe-phones"), `${result.safePhone} 번호가 풀에서 삭제되었습니다.`));
}

export async function generateQrCodesAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await generateQrCodes(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 생성에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), "QR 코드가 생성되었습니다."));
}

export async function setQrActiveAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let result;
  try {
    result = await setQrActive(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 상태 변경에 실패했습니다.", "error"));
  }
  const message = !result?.changed
    ? "QR 상태가 이미 요청한 상태입니다."
    : !result.active && result.holdStarted
      ? "QR이 비활성화되었습니다. 24시간 초과 시 구독기간 보정을 시작합니다."
      : !result.active
        ? "QR이 비활성화되었습니다."
        : Number(result.creditedDays || 0) > 0
          ? `QR이 활성화되었습니다. 비활성화 ${result.creditedDays}일이 구독기간에 반영되었습니다.`
          : Number(result.holdElapsedMs || 0) > 0
            ? "QR이 활성화되었습니다. 24시간 이내 비활성화는 구독기간에 포함하지 않았습니다."
            : "QR이 활성화되었습니다.";
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), message));
}

export async function setQrAdminTestActivationAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let result;
  try {
    result = await setQrAdminTestActivation(formData);
    revalidatePath("/admin");
    revalidatePath("/find/[key]", "page");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=subjects"), error.message || "QR 수동 활성화에 실패했습니다.", "error"));
  }
  const message = result?.active
    ? "구매 없이 QR이 수동 활성화되었습니다. 주문·결제 내역은 생성되지 않았습니다."
    : "QR의 관리자 테스트 활성화가 해제되었습니다.";
  redirect(withNotice(getReturnTo(formData, "/admin?section=subjects"), message));
}

export async function setQrLifecycleAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  const lifecycle = String(formData.get("lifecycleStatus") || "");
  try {
    await setQrLifecycle(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 처리에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), lifecycle === "discarded" ? "QR이 폐기 처리되었습니다." : "QR 상태가 복구되었습니다."));
}

export async function setQrAdminMemoAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setQrAdminMemo(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 메모 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), "QR 메모가 저장되었습니다."));
}

export async function setQrStoreSaleReservationAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let result;
  try {
    result = await setQrStoreSaleReservation(formData);
    revalidatePath("/admin");
    revalidatePath("/find/[key]", "page");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "스토어 판매용 QR 선점 설정에 실패했습니다.", "error"));
  }
  const message = !result?.changed
    ? "QR의 스토어 판매 선점 상태가 이미 요청한 값입니다."
    : result.reserved
      ? `${result.code} QR이 스토어 판매용으로 선점되었습니다.`
      : `${result.code} QR의 스토어 판매 선점이 해제되었습니다.`;
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), message));
}

export async function setQrSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  const hasSubject = Boolean(String(formData.get("subjectId") || "").trim());
  try {
    await setQrSubject(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 매칭 변경에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), hasSubject ? "QR 매칭이 저장되었습니다." : "QR 매칭이 해제되었습니다."));
}

export async function setGuardianAdminAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setGuardianAdmin(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=admins"), error.message || "관리자 권한 수정에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=admins"), "관리자 권한이 수정되었습니다."));
}

export async function setSubscriptionPlanPriceAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setSubscriptionPlanPrice(formData);
    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), error.message || "가격 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), "이용권 가격이 저장되었습니다."));
}

export async function createAdminPaymentRefundAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await createAdminPaymentRefund(formData);
    revalidatePath("/admin");
    revalidatePath("/account/billing");
    revalidatePath("/account/ads");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), error.message || "취소/환불 처리에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), "취소/환불이 접수되었습니다."));
}

export async function saveAdminCouponAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await saveAdminCoupon(formData);
    revalidatePath("/admin");
    revalidatePath("/account/coupons");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=coupons"), error.message || "쿠폰 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=coupons"), "쿠폰 정보가 저장되었습니다."));
}

export async function saveAdminMessageAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  const command = String(formData.get("command") || "save");
  let messageId = "";

  try {
    messageId = await saveAdminMessage(formData);
    if (command === "send") {
      const message = await getAdminMessageById(messageId);
      if (!message) throw new Error("저장된 알림 메시지를 찾을 수 없습니다.");
      const recipients = await getAdminMessageRecipients(message);
      const result = await notifyGuardiansFromAdmin({
        recipients,
        channel: message.channel,
        title: message.title,
        body: message.body || "",
        url: message.url || "/",
      });
      await markAdminMessageSent(messageId, result);
      if (message.channel === "push" && result.successCount === 0) {
        if (result.subscriptionTargetCount === 0) {
          throw new Error("푸시 알림을 받을 수 있는 등록 기기가 없습니다. 보호자가 기기에서 푸시 알림을 다시 연결해야 합니다.");
        }
        throw new Error("등록 기기로 푸시를 전송하지 못했습니다. 서버 발송 로그를 확인해 주세요.");
      }
    }
    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=notifications"), error.message || "알림 메시지 저장에 실패했습니다.", "error"));
  }

  const message = command === "send" ? "알림 메시지를 발송했습니다." : "알림 메시지가 저장되었습니다.";
  redirect(withNotice(`/admin?section=notifications&message=${encodeURIComponent(messageId)}`, message));
}

export async function saveAdminMessageTemplateAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let templateId = "";
  try {
    templateId = await saveAdminMessageTemplate(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=message-templates"), error.message || "메시지 템플릿 저장에 실패했습니다.", "error"));
  }

  redirect(withNotice(`/admin?section=message-templates&template=${encodeURIComponent(templateId)}`, "메시지 템플릿이 저장되었습니다."));
}

export async function setSubscriptionAdminMemoAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setSubscriptionAdminMemo(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=subscriptions"), error.message || "구독 메모 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=subscriptions"), "구독 메모가 저장되었습니다."));
}

export async function setSubscriptionAdminTestAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setSubscriptionAdminTest(formData);
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/account/billing");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=subscriptions"), error.message || "테스트 구독 설정에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=subscriptions"), "테스트 구독 상태와 기간이 저장되었습니다."));
}

export async function setProductCatalogItemAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setProductCatalogItem(formData);
    revalidatePath("/admin");
    revalidatePath("/shop");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=products"), error.message || "상품 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=products"), "상품 정보가 저장되었습니다."));
}

export async function createProductCatalogItemAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let productId = "";
  try {
    productId = await createProductCatalogItem(formData);
    revalidatePath("/admin");
    revalidatePath("/shop");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=products"), error.message || "상품 추가에 실패했습니다.", "error"));
  }
  const returnTo = productId
    ? `/admin?section=products&product=${encodeURIComponent(productId)}`
    : getReturnTo(formData, "/admin?section=products");
  redirect(withNotice(returnTo, "새 상품이 추가되었습니다."));
}

export async function setProductOrderFulfillmentAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setProductOrderFulfillment(formData);
    revalidatePath("/admin");
    revalidatePath("/account/billing");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=orders"), error.message || "배송 정보 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=orders"), "배송 정보가 저장되었습니다."));
}

export async function setAdPricingAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setAdPricingSettings(formData);
    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=ad-pricing"), error.message || "광고 마진율·거리·기간 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=ad-pricing"), "광고 마진율·거리·기간 설정이 저장되었습니다."));
}

export async function setAdminSubjectAdStatusAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  const command = String(formData.get("command") || "");
  const messages = {
    approve: "광고가 승인되었습니다.",
    pause: "광고가 정지되었습니다.",
    resume: "광고가 재개되었습니다.",
  };

  try {
    await setAdminSubjectAdStatus(formData);
    revalidatePath("/admin");
    revalidatePath("/account/ads");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), error.message || "광고 상태 변경에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), messages[command] || "광고 상태가 수정되었습니다."));
}

export async function setAdminSubjectAdMemoAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setAdminSubjectAdMemo(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), error.message || "광고 메모 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), "광고 메모가 저장되었습니다."));
}

function getReturnTo(formData, fallback) {
  const value = String(formData.get("returnTo") || "").trim();
  const isLocalAdminPath =
    value === "/admin" ||
    value.startsWith("/admin?") ||
    value.startsWith("/admin#") ||
    value.startsWith("/admin/");
  if (!isLocalAdminPath || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return fallback;
  }
  return value;
}

function withNotice(path, message, type = "success") {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.delete("assignQr");
  params.delete("guardianQuery");
  params.delete("subjectQuery");
  params.set("notice", message);
  params.set("noticeType", type);
  return `${base}?${params.toString()}`;
}
