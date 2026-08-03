import { Resend } from "resend";

let resendClient;

export function isEmailDevBypassEnabled() {
  const code = getEmailDevBypassCode();
  return process.env.NODE_ENV !== "production" && /^\d{6}$/.test(code);
}

export function getEmailDevBypassCode() {
  return String(process.env.EMAIL_DEV_BYPASS_CODE || "").replace(/\D/g, "").slice(0, 6);
}

export async function sendSignupVerificationEmail({ email, code }) {
  if (isEmailDevBypassEnabled()) {
    return {
      ok: true,
      provider: "dev-bypass",
      devMode: true,
    };
  }

  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = getResendFromEmail();
  if (!apiKey || !from) {
    return {
      ok: false,
      provider: "resend",
      reason: "missing_email_config",
    };
  }

  if (!resendClient) resendClient = new Resend(apiKey);

  try {
    const { data, error } = await resendClient.emails.send({
      from,
      to: [email],
      subject: `[제자리] 이메일 인증번호 ${code}`,
      text: `제자리 회원가입 인증번호는 ${code}입니다. 3분 안에 입력해 주세요. 본인이 요청하지 않았다면 이 메일을 무시해 주세요.`,
      html: buildVerificationEmail(code),
    });

    if (error) {
      return {
        ok: false,
        provider: "resend",
        reason: "resend_rejected",
        providerMessage: String(error.message || ""),
      };
    }

    return {
      ok: true,
      provider: "resend",
      messageId: String(data?.id || ""),
    };
  } catch (error) {
    return {
      ok: false,
      provider: "resend",
      reason: "email_send_failed",
      providerMessage: String(error?.message || ""),
    };
  }
}

function getResendFromEmail() {
  const configured = String(process.env.RESEND_FROM_EMAIL || "").trim();
  if (configured) return configured;

  const domain = String(process.env.RESEND_EMAIL_DOMAIN || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return "";
  return `제자리 <auth@${domain}>`;
}

function buildVerificationEmail(code) {
  return `<!doctype html>
<html lang="ko">
  <body style="margin:0;background:#f4f7fb;font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#10233f;">
    <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
      <div style="border:1px solid #c7d9ea;background:#ffffff;padding:32px 28px;">
        <p style="margin:0 0 8px;color:#176b9b;font-size:13px;font-weight:700;">REAL_QR_FIND</p>
        <h1 style="margin:0 0 18px;font-size:24px;line-height:1.35;">이메일 인증번호</h1>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.7;">회원가입을 계속하려면 아래 6자리 인증번호를 입력해 주세요.</p>
        <div style="border:1px solid #9fc9e7;background:#eaf5fc;padding:18px;text-align:center;font-size:32px;font-weight:800;letter-spacing:8px;">${code}</div>
        <p style="margin:20px 0 0;color:#526273;font-size:12px;line-height:1.7;">인증번호는 3분 동안 유효합니다. 본인이 요청하지 않았다면 이 메일을 무시해 주세요.</p>
      </div>
    </div>
  </body>
</html>`;
}
