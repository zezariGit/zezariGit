import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const ITERATIONS = 310000;
const MIN_ITERATIONS = 100000;
const MAX_ITERATIONS = 1000000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored?.startsWith("pbkdf2$")) return false;
  const [, iterations, salt, hash] = stored.split("$");
  const iterationCount = Number(iterations);
  if (
    !Number.isInteger(iterationCount)
    || iterationCount < MIN_ITERATIONS
    || iterationCount > MAX_ITERATIONS
    || !/^[a-f0-9]{32}$/i.test(salt || "")
    || !/^[a-f0-9]{64}$/i.test(hash || "")
  ) {
    return false;
  }
  const test = pbkdf2Sync(password, salt, iterationCount, KEY_LENGTH, DIGEST);
  const saved = Buffer.from(hash, "hex");
  return saved.length === test.length && timingSafeEqual(saved, test);
}
