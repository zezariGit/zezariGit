const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATABASE_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?$/;
const KOREA_TIME_ZONE = "Asia/Seoul";

export function formatDateOnly(value, fallback = "-") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (DATE_ONLY_PATTERN.test(raw)) return raw;

  const date = parseDateValue(raw);
  if (!date) return fallback;
  const parts = getDateParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatDateTime(value, fallback = "-") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  const date = parseDateValue(raw);
  if (!date) return fallback;
  const parts = getDateParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

export function toDateInputValue(value) {
  return formatDateOnly(value, "");
}

export function dateInputToIso(value, { endOfDay = false } = {}) {
  const raw = String(value || "").trim();
  const match = raw.match(DATE_ONLY_PATTERN);
  if (!match) return "";

  const time = endOfDay ? "23:59:59.999" : "00:00:00.000";
  const date = new Date(`${raw}T${time}+09:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function parseDateValue(raw) {
  const normalized = DATABASE_DATE_TIME_PATTERN.test(raw)
    ? `${raw.replace(" ", "T")}Z`
    : raw;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateParts(date, options) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: KOREA_TIME_ZONE,
      ...options,
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}
