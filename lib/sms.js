export function isSmsDevBypassEnabled() {
  const code = String(process.env.SMS_DEV_BYPASS_CODE || "").replace(/\D/g, "");
  return process.env.NODE_ENV !== "production" && /^\d{6}$/.test(code);
}

export function getSmsDevBypassCode() {
  return String(process.env.SMS_DEV_BYPASS_CODE || "").replace(/\D/g, "").slice(0, 6);
}

export async function sendSignupVerificationSms({ phone, code }) {
  if (isSmsDevBypassEnabled()) {
    return {
      ok: true,
      provider: "dev-bypass",
      devMode: true,
    };
  }

  const provider = String(process.env.SMS_PROVIDER || "generic").trim().toLowerCase();
  const apiUrl = String(process.env.SMS_API_URL || "").trim();
  const apiKey = String(process.env.SMS_API_KEY || "").trim();
  const apiSecret = String(process.env.SMS_API_SECRET || "").trim();
  const senderNo = String(process.env.SMS_SENDER_NO || "").trim();

  if (!apiUrl || !apiKey) {
    return {
      ok: false,
      provider,
      reason: "missing_sms_config",
    };
  }

  const message = `[제자리] 회원가입 인증번호는 ${code}입니다. 3분 안에 입력해 주세요.`;
  const payload = {
    provider,
    to: phone,
    receiver: phone,
    phone,
    from: senderNo,
    senderNo,
    title: "제자리 회원가입 인증번호",
    message,
    body: message,
    code,
    template: "signup_phone_verification",
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
        "x-api-secret": apiSecret,
      },
      body: JSON.stringify(payload),
    });

    return {
      ok: response.ok,
      provider,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      provider,
      reason: error.message || "sms_send_failed",
    };
  }
}
