const DAY_MS = 24 * 60 * 60 * 1000;

function toValidDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateQrHoldCreditDays(startedAt, endedAt) {
  const start = toValidDate(startedAt);
  const end = toValidDate(endedAt);
  if (!start || !end || end.getTime() <= start.getTime()) {
    return { elapsedMs: 0, creditedDays: 0 };
  }

  const elapsedMs = end.getTime() - start.getTime();
  return {
    elapsedMs,
    creditedDays: elapsedMs <= DAY_MS ? 0 : Math.floor(elapsedMs / DAY_MS),
  };
}

export function extendDateByDays(value, days) {
  const date = toValidDate(value);
  const normalizedDays = Math.max(0, Math.floor(Number(days || 0)));
  if (!date || normalizedDays === 0) return date;
  return new Date(date.getTime() + normalizedDays * DAY_MS);
}
