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

  const verificationLabel = purpose === "guardian_phone_change" ? "연락처 변경" : "회원가입";
  const message = `[제자리] ${verificationLabel} 인증번호는 ${code}입니다. 3분 안에 입력해 주세요.`;

  try {
    const messageService = new SolapiMessageService(apiKey, apiSecret);
    const response = await messageService.send({
      to: normalizePhoneNumber(phone),
      from: senderNo,
      text: message,
    });

    return {
      ok: true,
      provider,
      messageId: String(response?.groupInfo?.groupId || response?.groupId || ""),
    };
  } catch (error) {
    return {
      ok: false,
      provider,
      reason: "sms_send_failed",
      providerMessage: String(error?.message || ""),
    };
  }
}

function normalizePhoneNumber(value) {
  return String(value || "").replace(/\D/g, "");
}
