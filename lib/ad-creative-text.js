const MOBILE_PHONE_PATTERN = /(?:\+?82[-.\s]?(?:10|11|16|17|18|19)|0(?:10|11|16|17|18|19))[-.\s]?\d{3,4}[-.\s]?\d{4}/g;

export function sanitizeAdGuardianMessage(value) {
  return String(value || "")
    .replace(MOBILE_PHONE_PATTERN, "보호자 연락은 QR을 이용해 주세요")
    .replace(/보호자 연락은 QR을 이용해 주세요\s*(?:로|으로)\s*연락(?:해)?\s*주세요/g, "보호자 연락은 QR을 이용해 주세요")
    .replace(/\s+/g, " ")
    .trim();
}
