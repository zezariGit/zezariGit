import { SolapiMessageService } from "solapi";

export function isSmsDevBypassEnabled() {
  const code = String(process.env.SMS_DEV_BYPASS_CODE || "").replace(/\D/g, "");
  return process.env.NODE_ENV !== "production" && /^\d{6}$/.test(code);
}

export function getSmsDevBypassCode() {
  return String(process.env.SMS_DEV_BYPASS_CODE || "").replace(/\D/g, "").slice(0, 6);
}

export function isSignupSmsVerificationEnabled() {
  return String(process.env.SIGNUP_SMS_VERIFICATION_ENABLED || "true").trim().toLowerCase() === "true";
}

export function getSolapiFailureDetails(value) {
  const failedMessages = Array.isArray(value?.failedMessageList) ? value.failedMessageList : [];
  const firstFailure = failedMessages[0] || {};
  const count = value?.groupInfo?.count || {};
  const total = Number(count.total || 0);
  const registeredSuccess = Number(count.registeredSuccess || 0);
  const registeredFailed = Number(count.registeredFailed || 0);
  const providerCode = String(
    firstFailure.statusCode || value?.errorCode || value?.statusCode || "",
  ).trim();
  const providerMessage = String(
    firstFailure.statusMessage || value?.errorMessage || value?.message || "",
  ).trim();
  const failed = failedMessages.length > 0
    || registeredFailed > 0
    || (total > 0 && registeredSuccess === 0);

  if (!failed) return null;

  return {
    reason: providerCode === "1062" ? "unregistered_sender" : "sms_send_failed",
    providerCode,
    providerMessage,
  };
}

export async function sendSignupVerificationSms({ phone, code, purpose = "signup" }) {
  if (isSmsDevBypassEnabled()) {
    return {
      ok: true,
      provider: "dev-bypass",
      devMode: true,
    };
  }

  const provider = "solapi";
  const apiKey = String(process.env.SOLAPI_API_KEY || process.env.SMS_API_KEY || "").trim();
  const apiSecret = String(process.env.SOLAPI_API_SECRET || process.env.SMS_API_SECRET || "").trim();
  const senderNo = normalizePhoneNumber(process.env.SOLAPI_SENDER_NUMBER || process.env.SMS_SENDER_NO);

  if (!apiKey || !apiSecret || !senderNo) {
    return {
      ok: false,
      provider,
      reason: "missing_sms_config",
    };
  }

  const verificationLabel = purpose === "guardian_phone_change"
    ? "연락처 변경"
    : purpose === "social_account_link"
      ? "SNS 계정 연결"
      : "회원가입";
  const message = `[제자리] ${verificationLabel} 인증번호는 ${code}입니다. 3분 안에 입력해 주세요.`;

  try {
    const messageService = new SolapiMessageService(apiKey, apiSecret);
    const response = await messageService.send({
      to: normalizePhoneNumber(phone),
      from: senderNo,
      text: message,
    });
    const failure = getSolapiFailureDetails(response);

    if (failure) {
      return {
        ok: false,
        provider,
        messageId: String(response?.groupInfo?.groupId || response?.groupId || ""),
        ...failure,
      };
    }

    return {
      ok: true,
      provider,
      messageId: String(response?.groupInfo?.groupId || response?.groupId || ""),
    };
  } catch (error) {
    const failure = getSolapiFailureDetails(error);
    return {
      ok: false,
      provider,
      reason: failure?.reason || "sms_send_failed",
      providerCode: failure?.providerCode || "",
      providerMessage: failure?.providerMessage || String(error?.message || ""),
    };
  }
}

function normalizePhoneNumber(value) {
  return String(value || "").replace(/\D/g, "");
}
