const DEFAULT_ADMIN_EMAILS = ["general@zezari.com", "soonsuboy10@gmail.com"];

export function getAdminEmails() {
  const configured = process.env.ADMIN_EMAILS || "";
  const emails = configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return emails.length > 0 ? emails : DEFAULT_ADMIN_EMAILS;
}

export function isAdminSession(session) {
  const email = session?.user?.email?.toLowerCase();
  if (!email) return false;
  return getAdminEmails().includes(email);
}

export function isDefaultAdminEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return false;
  return getAdminEmails().includes(normalized);
}
