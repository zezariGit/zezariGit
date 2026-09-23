export function normalizeAdminPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!(/^010\d{8}$/.test(digits) || /^01[16789]\d{7,8}$/.test(digits))) return "";
  return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
}

export function getAdminPhones() {
  return [...new Set(
    String(process.env.ADMIN_PHONES || "")
      .split(",")
      .map(normalizeAdminPhone)
      .filter(Boolean),
  )];
}

export function isAdminSession(session) {
  if (session?.user?.supportMode) return false;
  const phone = normalizeAdminPhone(session?.user?.phone);
  return Boolean(phone && getAdminPhones().includes(phone));
}

export function isDefaultAdminPhone(phone) {
  const normalized = normalizeAdminPhone(phone);
  return Boolean(normalized && getAdminPhones().includes(normalized));
}

// Used only to migrate the former email allowlist into guardians.is_admin.
export function getLegacyAdminEmails() {
  return String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
