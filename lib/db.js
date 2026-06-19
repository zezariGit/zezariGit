import { createClient } from "@libsql/client";
import { randomBytes } from "crypto";
import { hashPassword, verifyPassword } from "./security";

const DEFAULT_SUBSCRIPTION_PLANS = [
  { months: 1, name: "1개월 구독", amount: 9900 },
  { months: 3, name: "3개월 구독", amount: 27000 },
  { months: 6, name: "6개월 구독", amount: 50000 },
];
const DEFAULT_AD_DAILY_RATE = 10000;

let client;
let schemaReady;

function getDb() {
  if (!client) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error("Turso environment variables are missing.");
    }

    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  return client;
}

export async function ensureSchema() {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const db = getDb();
    await db.batch([
      {
        sql: `CREATE TABLE IF NOT EXISTS guardians (
          id TEXT PRIMARY KEY,
          google_id TEXT NOT NULL UNIQUE,
          google_email TEXT,
          name TEXT,
          login_id TEXT,
          password_hash TEXT,
          phone TEXT,
          safe_phone TEXT,
          address TEXT,
          birth_date TEXT,
          phone_verified_at TEXT,
          terms_privacy_agreed_at TEXT,
          terms_service_agreed_at TEXT,
          email TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          is_admin INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS subjects (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL,
          name TEXT NOT NULL,
          birth_date TEXT NOT NULL,
          gender TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT '문제없음',
          photo_data_url TEXT,
          photo_name TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_subjects_guardian_id ON subjects(guardian_id)",
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS qr_codes (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          public_key TEXT NOT NULL UNIQUE,
          target_url TEXT NOT NULL,
          guardian_id TEXT,
          subject_id TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        args: [],
      },
      {
        sql: "CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_codes_subject_id ON qr_codes(subject_id)",
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_qr_codes_guardian_id ON qr_codes(guardian_id)",
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_qr_codes_public_key ON qr_codes(public_key)",
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active)",
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL UNIQUE,
          customer_key TEXT NOT NULL UNIQUE,
          billing_key TEXT,
          status TEXT NOT NULL DEFAULT 'none',
          plan_name TEXT NOT NULL DEFAULT 'guardian_monthly',
          plan_months INTEGER NOT NULL DEFAULT 1,
          amount INTEGER NOT NULL DEFAULT 9900,
          currency TEXT NOT NULL DEFAULT 'KRW',
          current_period_start TEXT,
          current_period_end TEXT,
          paused_at TEXT,
          resumed_at TEXT,
          last_order_id TEXT,
          last_payment_key TEXT,
          last_payment_status TEXT,
          error_code TEXT,
          error_message TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_subscriptions_guardian_id ON subscriptions(guardian_id)",
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_key ON subscriptions(customer_key)",
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS subscription_plans (
          months INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          amount INTEGER NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS push_subscriptions (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL,
          endpoint TEXT NOT NULL UNIQUE,
          subscription_json TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_push_subscriptions_guardian_id ON push_subscriptions(guardian_id)",
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS ad_settings (
          id TEXT PRIMARY KEY,
          daily_rate INTEGER NOT NULL DEFAULT 10000,
          currency TEXT NOT NULL DEFAULT 'KRW',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS subject_ads (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL,
          subject_id TEXT NOT NULL,
          region TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          days INTEGER NOT NULL,
          daily_rate INTEGER NOT NULL,
          amount INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'KRW',
          status TEXT NOT NULL DEFAULT 'active',
          meta_campaign_id TEXT,
          meta_status TEXT,
          paused_at TEXT,
          ended_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
          FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_subject_ads_guardian_id ON subject_ads(guardian_id)",
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_subject_ads_subject_id ON subject_ads(subject_id)",
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_subject_ads_status ON subject_ads(status)",
        args: [],
      },
    ]);

    const columns = await db.execute("PRAGMA table_info(subjects)");
    const hasStatus = columns.rows.some((column) => column.name === "status");
    if (!hasStatus) {
      await db.execute("ALTER TABLE subjects ADD COLUMN status TEXT NOT NULL DEFAULT '문제없음'");
    }

    const guardianColumns = await db.execute("PRAGMA table_info(guardians)");
    const hasActive = guardianColumns.rows.some((column) => column.name === "is_active");
    if (!hasActive) {
      await db.execute("ALTER TABLE guardians ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1");
    }
    const hasAdmin = guardianColumns.rows.some((column) => column.name === "is_admin");
    if (!hasAdmin) {
      await db.execute("ALTER TABLE guardians ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
    }
    const hasAddress = guardianColumns.rows.some((column) => column.name === "address");
    if (!hasAddress) {
      await db.execute("ALTER TABLE guardians ADD COLUMN address TEXT");
    }
    const hasSafePhone = guardianColumns.rows.some((column) => column.name === "safe_phone");
    if (!hasSafePhone) {
      await db.execute("ALTER TABLE guardians ADD COLUMN safe_phone TEXT");
    }
    const hasBirthDate = guardianColumns.rows.some((column) => column.name === "birth_date");
    if (!hasBirthDate) {
      await db.execute("ALTER TABLE guardians ADD COLUMN birth_date TEXT");
    }
    const hasPhoneVerifiedAt = guardianColumns.rows.some((column) => column.name === "phone_verified_at");
    if (!hasPhoneVerifiedAt) {
      await db.execute("ALTER TABLE guardians ADD COLUMN phone_verified_at TEXT");
    }
    const hasPrivacyAgreedAt = guardianColumns.rows.some((column) => column.name === "terms_privacy_agreed_at");
    if (!hasPrivacyAgreedAt) {
      await db.execute("ALTER TABLE guardians ADD COLUMN terms_privacy_agreed_at TEXT");
    }
    const hasServiceAgreedAt = guardianColumns.rows.some((column) => column.name === "terms_service_agreed_at");
    if (!hasServiceAgreedAt) {
      await db.execute("ALTER TABLE guardians ADD COLUMN terms_service_agreed_at TEXT");
    }

    const qrColumns = await db.execute("PRAGMA table_info(qr_codes)");
    await addColumnIfMissing(qrColumns, "guardian_id", "ALTER TABLE qr_codes ADD COLUMN guardian_id TEXT");
    await addColumnIfMissing(qrColumns, "subject_id", "ALTER TABLE qr_codes ADD COLUMN subject_id TEXT");

    const subscriptionColumns = await db.execute("PRAGMA table_info(subscriptions)");
    await addColumnIfMissing(subscriptionColumns, "plan_months", "ALTER TABLE subscriptions ADD COLUMN plan_months INTEGER NOT NULL DEFAULT 1");
    await addColumnIfMissing(subscriptionColumns, "current_period_start", "ALTER TABLE subscriptions ADD COLUMN current_period_start TEXT");
    await addColumnIfMissing(subscriptionColumns, "current_period_end", "ALTER TABLE subscriptions ADD COLUMN current_period_end TEXT");
    await addColumnIfMissing(subscriptionColumns, "paused_at", "ALTER TABLE subscriptions ADD COLUMN paused_at TEXT");
    await addColumnIfMissing(subscriptionColumns, "resumed_at", "ALTER TABLE subscriptions ADD COLUMN resumed_at TEXT");

    await seedSubscriptionPlans(db);
    await seedAdSettings(db);
  })();

  return schemaReady;
}

export function getGuardianKey(session) {
  return String(session?.user?.id || session?.user?.email || "").trim();
}

export async function getDashboardData(session) {
  await ensureSchema();
  const db = getDb();
  const googleId = getGuardianKey(session);
  if (!googleId) throw new Error("Authenticated user id is missing.");

  const guardianResult = await db.execute({
    sql: "SELECT * FROM guardians WHERE google_id = ?",
    args: [googleId],
  });

  let guardian = guardianResult.rows[0] || null;
  if (!guardian) {
    const id = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO guardians (id, google_id, google_email, name, email)
        VALUES (?, ?, ?, ?, ?)`,
      args: [
        id,
        googleId,
        session.user?.email || "",
        session.user?.name || "",
        session.user?.email || "",
      ],
    });
    const created = await db.execute({
      sql: "SELECT * FROM guardians WHERE id = ?",
      args: [id],
    });
    guardian = created.rows[0];
  }

  const subjects = await db.execute({
    sql: `SELECT
        s.*,
        q.id AS qr_id,
        q.code AS qr_code,
        q.public_key AS qr_public_key,
        q.is_active AS qr_is_active,
        a.id AS ad_id,
        a.region AS ad_region,
        a.start_date AS ad_start_date,
        a.end_date AS ad_end_date,
        a.days AS ad_days,
        a.daily_rate AS ad_daily_rate,
        a.amount AS ad_amount,
        a.currency AS ad_currency,
        a.status AS ad_status,
        a.meta_campaign_id AS ad_meta_campaign_id,
        a.meta_status AS ad_meta_status
      FROM subjects s
      LEFT JOIN qr_codes q ON q.subject_id = s.id
      LEFT JOIN subject_ads a ON a.id = (
        SELECT sa.id
        FROM subject_ads sa
        WHERE sa.subject_id = s.id
        ORDER BY
          CASE sa.status
            WHEN 'active' THEN 0
            WHEN 'paused' THEN 1
            WHEN 'ready' THEN 2
            ELSE 3
          END,
          sa.created_at DESC
        LIMIT 1
      )
      WHERE s.guardian_id = ?
      ORDER BY s.created_at ASC`,
    args: [guardian.id],
  });
  const subscription = await getSubscriptionByGuardianId(guardian.id);
  const subscriptionPlans = await getSubscriptionPlans();
  const adDailyRate = await getAdDailyRate();

  return {
    guardian,
    subjects: subjects.rows.map((subject) => ({
      ...subject,
      qr_target_url: subject.qr_public_key ? getFindUrl(subject.qr_public_key) : "",
    })),
    subscription,
    subscriptionPlans,
    adDailyRate,
  };
}

export async function authenticateGuardianCredentials(loginId, password) {
  await ensureSchema();
  const db = getDb();
  const normalizedLoginId = String(loginId || "").trim();
  const rawPassword = String(password || "");
  if (!normalizedLoginId || !rawPassword) return null;

  const result = await db.execute({
    sql: `SELECT *
      FROM guardians
      WHERE lower(COALESCE(login_id, '')) = lower(?)
      ORDER BY updated_at DESC
      LIMIT 1`,
    args: [normalizedLoginId],
  });
  const guardian = result.rows[0] || null;
  if (!guardian || !guardian.password_hash || !verifyPassword(rawPassword, guardian.password_hash)) return null;
  if (guardian.is_active === 0) throw new Error("비활성화된 보호자 계정입니다.");

  return {
    id: guardian.google_id,
    name: guardian.name || guardian.login_id || "보호자",
    email: guardian.email || guardian.google_email || "",
    provider: "credentials",
  };
}

export async function createGuardianSignup(payload) {
  await ensureSchema();
  const db = getDb();
  const name = String(payload?.name || "").trim();
  const birthDate = String(payload?.birthDate || "").trim();
  const phone = normalizePhone(payload?.phone);
  const loginId = String(payload?.loginId || "").trim();
  const password = String(payload?.password || "");
  const privacyAgreed = Boolean(payload?.privacyAgreed);
  const serviceAgreed = Boolean(payload?.serviceAgreed);

  if (!name || !birthDate || !phone || !loginId || !password) {
    throw new Error("필수 가입 정보를 입력해 주세요.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    throw new Error("생년월일 형식을 확인해 주세요.");
  }
  if (!/^[A-Za-z0-9_]{4,20}$/.test(loginId)) {
    throw new Error("아이디는 영문, 숫자, 밑줄로 4~20자 입력해 주세요.");
  }
  if (!isStrongPassword(password)) {
    throw new Error("비밀번호는 8~16자 영문, 숫자, 특수문자를 포함해 주세요.");
  }
  if (!privacyAgreed || !serviceAgreed) {
    throw new Error("필수 약관에 동의해 주세요.");
  }

  const duplicateLogin = await db.execute({
    sql: "SELECT id FROM guardians WHERE lower(COALESCE(login_id, '')) = lower(?) LIMIT 1",
    args: [loginId],
  });
  if (duplicateLogin.rows.length > 0) {
    throw new Error("이미 사용 중인 아이디입니다.");
  }

  const duplicatePhone = await db.execute({
    sql: "SELECT id FROM guardians WHERE phone = ? LIMIT 1",
    args: [phone],
  });
  if (duplicatePhone.rows.length > 0) {
    throw new Error("이미 가입된 휴대폰 번호입니다.");
  }

  const id = crypto.randomUUID();
  const authKey = `credentials:${crypto.randomUUID()}`;
  const passwordHash = hashPassword(password);

  await db.execute({
    sql: `INSERT INTO guardians (
        id, google_id, google_email, name, login_id, password_hash,
        phone, birth_date, phone_verified_at, terms_privacy_agreed_at,
        terms_service_agreed_at, email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`,
    args: [id, authKey, "", name, loginId, passwordHash, phone, birthDate, ""],
  });

  return {
    id,
    loginId,
    name,
  };
}

export async function saveGuardianProfile(session, formData) {
  await ensureSchema();
  const db = getDb();
  const googleId = getGuardianKey(session);
  if (!googleId) throw new Error("Authenticated user id is missing.");

  const current = await getDashboardData(session);
  const name = getText(formData, "guardianName");
  const loginId = getText(formData, "loginId");
  const password = getText(formData, "password");
  const phone = getText(formData, "phone");
  const safePhone = getText(formData, "safePhone");
  const address = getText(formData, "address");
  const birthDate = getText(formData, "birthDate");
  const email = getText(formData, "email");
  const passwordHash = password ? hashPassword(password) : current.guardian.password_hash;

  await db.execute({
    sql: `UPDATE guardians
      SET name = ?, login_id = ?, password_hash = ?, phone = ?, safe_phone = ?, address = ?, birth_date = ?, email = ?, google_email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE google_id = ?`,
    args: [name, loginId, passwordHash, phone, safePhone, address, birthDate, email, session.user?.email || "", googleId],
  });
}

export async function saveSubject(session, formData) {
  await ensureSchema();
  const db = getDb();
  const { guardian, subjects } = await getDashboardData(session);
  const id = getText(formData, "subjectId") || crypto.randomUUID();
  const isExisting = subjects.some((subject) => subject.id === id);

  if (!isExisting && subjects.length >= 4) {
    throw new Error("대상자는 보호자 1명당 최대 4명까지 입력할 수 있습니다.");
  }

  const name = getText(formData, "subjectName");
  const birthDate = getText(formData, "birthDate");
  const gender = getText(formData, "gender");
  const status = getText(formData, "status") || "문제없음";
  const photoFile = formData.get("photo");
  const existingPhoto = getText(formData, "existingPhoto");
  const existingPhotoName = getText(formData, "existingPhotoName");

  if (!name || !birthDate || !gender) {
    throw new Error("대상자 이름, 생년월일, 성별은 필수입니다.");
  }

  const photo = await fileToDataUrl(photoFile);
  const photoDataUrl = photo?.dataUrl || existingPhoto || "";
  const photoName = photo?.name || existingPhotoName || "";

  if (isExisting) {
    await db.execute({
      sql: `UPDATE subjects
        SET name = ?, birth_date = ?, gender = ?, status = ?, photo_data_url = ?, photo_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND guardian_id = ?`,
      args: [name, birthDate, gender, status, photoDataUrl, photoName, id, guardian.id],
    });
    await assignQrToSubject(db, guardian.id, id);
    return;
  }

  await db.execute({
    sql: `INSERT INTO subjects (id, guardian_id, name, birth_date, gender, status, photo_data_url, photo_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, guardian.id, name, birthDate, gender, status, photoDataUrl, photoName],
  });
  await assignQrToSubject(db, guardian.id, id);
}

export async function deleteSubject(session, formData) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session);
  const id = getText(formData, "subjectId");
  if (!id) return;

  await db.execute({
    sql: "DELETE FROM subjects WHERE id = ? AND guardian_id = ?",
    args: [id, guardian.id],
  });
  await db.execute({
    sql: "UPDATE qr_codes SET guardian_id = NULL, subject_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE subject_id = ?",
    args: [id],
  });
}

export async function getAdminData(selectedGuardianId = "") {
  await ensureSchema();
  const db = getDb();

  const guardians = await db.execute({
      sql: `SELECT
        g.id,
        g.name,
        g.login_id,
        g.phone,
        g.address,
        g.email,
        g.google_email,
        g.is_active,
        g.is_admin,
        g.updated_at,
        COUNT(s.id) AS subject_count
      FROM guardians g
      LEFT JOIN subjects s ON s.guardian_id = g.id
      GROUP BY g.id
      ORDER BY g.updated_at DESC, g.created_at DESC`,
    args: [],
  });

  const selectedId = selectedGuardianId || guardians.rows[0]?.id || "";
  const selectedGuardian =
    guardians.rows.find((guardian) => guardian.id === selectedId) || guardians.rows[0] || null;

  const subjects = selectedGuardian
    ? await db.execute({
        sql: "SELECT * FROM subjects WHERE guardian_id = ? ORDER BY created_at ASC",
        args: [selectedGuardian.id],
      })
    : { rows: [] };

  return {
    guardians: guardians.rows,
    selectedGuardian,
    subjects: subjects.rows,
  };
}

export async function isDbAdminSession(session) {
  await ensureSchema();
  const db = getDb();
  const googleId = getGuardianKey(session);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!googleId && !email) return false;

  const result = await db.execute({
    sql: `SELECT is_admin
      FROM guardians
      WHERE google_id = ?
        OR lower(COALESCE(google_email, '')) = ?
        OR lower(COALESCE(email, '')) = ?
      LIMIT 1`,
    args: [googleId, email, email],
  });

  return Number(result.rows[0]?.is_admin || 0) === 1;
}

export async function getAdminUsersData() {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT
        g.id,
        g.name,
        g.login_id,
        g.phone,
        g.email,
        g.google_email,
        g.is_active,
        g.is_admin,
        g.created_at,
        g.updated_at,
        COUNT(s.id) AS subject_count
      FROM guardians g
      LEFT JOIN subjects s ON s.guardian_id = g.id
      GROUP BY g.id
      ORDER BY g.is_admin DESC, g.updated_at DESC, g.created_at DESC`,
    args: [],
  });

  return {
    users: result.rows,
    adminCount: result.rows.filter((user) => Number(user.is_admin || 0) === 1).length,
  };
}

export async function setGuardianAdmin(formData) {
  await ensureSchema();
  const db = getDb();
  const guardianId = getText(formData, "guardianId");
  const admin = getText(formData, "admin") === "1" ? 1 : 0;
  if (!guardianId) throw new Error("guardianId is required.");

  await db.execute({
    sql: "UPDATE guardians SET is_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [admin, guardianId],
  });
}

export async function setGuardianActive(formData) {
  await ensureSchema();
  const db = getDb();
  const guardianId = getText(formData, "guardianId");
  const active = getText(formData, "active") === "1" ? 1 : 0;
  if (!guardianId) throw new Error("guardianId is required.");

  await db.execute({
    sql: "UPDATE guardians SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [active, guardianId],
  });
}

export function getPublicBaseUrl() {
  return (process.env.PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://zezari.vercel.app")
    .replace(/\/+$/, "")
    .trim();
}

export function getFindUrl(publicKey) {
  return `${getPublicBaseUrl()}/find/${encodeURIComponent(publicKey)}`;
}

export async function ensureInitialQrCodes(targetCount = 30) {
  await ensureSchema();
  const db = getDb();
  const countResult = await db.execute("SELECT COUNT(*) AS total FROM qr_codes");
  const total = Number(countResult.rows[0]?.total || 0);
  const missing = Math.max(0, Number(targetCount) - total);

  if (missing > 0) {
    await insertQrCodes(db, missing);
  }
}

export async function getQrAdminData(filters = {}) {
  await ensureInitialQrCodes(30);
  const db = getDb();
  const matchFilter = ["matched", "unmatched"].includes(filters.match) ? filters.match : "all";
  const activeFilter = ["active", "inactive"].includes(filters.active) ? filters.active : "all";
  const assignQrId = String(filters.assignQr || "").trim();
  const guardianQuery = String(filters.guardianQuery || "").trim();
  const subjectQuery = String(filters.subjectQuery || "").trim();

  const codes = await db.execute({
    sql: `SELECT
        q.id,
        q.code,
        q.public_key,
        q.target_url,
        q.guardian_id,
        q.subject_id,
        q.is_active,
        q.created_at,
        q.updated_at,
        s.name AS subject_name,
        g.name AS guardian_name
      FROM qr_codes q
      LEFT JOIN subjects s ON s.id = q.subject_id
      LEFT JOIN guardians g ON g.id = q.guardian_id
      ORDER BY q.created_at DESC, q.code ASC`,
    args: [],
  });
  const stats = await db.execute({
    sql: `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive_count,
        SUM(CASE WHEN subject_id IS NOT NULL THEN 1 ELSE 0 END) AS matched_count,
        SUM(CASE WHEN subject_id IS NULL THEN 1 ELSE 0 END) AS unmatched_count
      FROM qr_codes`,
    args: [],
  });
  const matchCandidates = assignQrId
    ? await searchUnmatchedSubjectsForQr(db, { guardianQuery, subjectQuery })
    : { rows: [] };

  const allQrCodes = codes.rows.map((row) => ({
    ...row,
    target_url: getFindUrl(row.public_key),
  }));
  const filteredQrCodes = allQrCodes.filter((row) => {
    const matchOk =
      matchFilter === "matched" ? Boolean(row.subject_id) : matchFilter === "unmatched" ? !row.subject_id : true;
    const activeOk =
      activeFilter === "active" ? Number(row.is_active) === 1 : activeFilter === "inactive" ? Number(row.is_active) === 0 : true;
    return matchOk && activeOk;
  });

  return {
    qrCodes: filteredQrCodes,
    selectedQr: allQrCodes.find((row) => row.id === assignQrId) || null,
    matchCandidates: matchCandidates.rows,
    matchSearch: {
      qrId: assignQrId,
      guardianQuery,
      subjectQuery,
    },
    filters: {
      match: matchFilter,
      active: activeFilter,
    },
    total: Number(stats.rows[0]?.total || 0),
    activeCount: Number(stats.rows[0]?.active_count || 0),
    inactiveCount: Number(stats.rows[0]?.inactive_count || 0),
    matchedCount: Number(stats.rows[0]?.matched_count || 0),
    unmatchedCount: Number(stats.rows[0]?.unmatched_count || 0),
    filteredCount: filteredQrCodes.length,
  };
}

async function searchUnmatchedSubjectsForQr(db, { guardianQuery, subjectQuery }) {
  const where = ["q.id IS NULL"];
  const args = [];
  const guardian = String(guardianQuery || "").trim();
  const subject = String(subjectQuery || "").trim();

  if (guardian) {
    where.push("(g.name LIKE ? OR g.email LIKE ? OR g.google_email LIKE ?)");
    args.push(`%${guardian}%`, `%${guardian}%`, `%${guardian}%`);
  }
  if (subject) {
    where.push("s.name LIKE ?");
    args.push(`%${subject}%`);
  }

  return db.execute({
    sql: `SELECT
        s.id,
        s.guardian_id,
        s.name,
        s.birth_date,
        g.name AS guardian_name,
        g.email AS guardian_email,
        g.google_email AS guardian_google_email
      FROM subjects s
      JOIN guardians g ON g.id = s.guardian_id
      LEFT JOIN qr_codes q ON q.subject_id = s.id
      WHERE ${where.join(" AND ")}
      ORDER BY g.name ASC, g.email ASC, s.name ASC
      LIMIT 30`,
    args,
  });
}

export async function generateQrCodes(formData) {
  await ensureSchema();
  const db = getDb();
  const requested = Number(getText(formData, "count") || 1);
  const count = Math.min(Math.max(Math.floor(requested), 1), 200);

  return insertQrCodes(db, count);
}

export async function setQrActive(formData) {
  await ensureSchema();
  const db = getDb();
  const qrId = getText(formData, "qrId");
  const active = getText(formData, "active") === "1" ? 1 : 0;
  if (!qrId) throw new Error("qrId is required.");

  await db.execute({
    sql: "UPDATE qr_codes SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [active, qrId],
  });
}

export async function setQrSubject(formData) {
  await ensureSchema();
  const db = getDb();
  const qrId = getText(formData, "qrId");
  const subjectId = getText(formData, "subjectId");
  if (!qrId) throw new Error("qrId is required.");

  const qr = await db.execute({
    sql: "SELECT id FROM qr_codes WHERE id = ? LIMIT 1",
    args: [qrId],
  });
  if (qr.rows.length === 0) throw new Error("QR 코드를 찾을 수 없습니다.");

  if (!subjectId) {
    await db.execute({
      sql: "UPDATE qr_codes SET guardian_id = NULL, subject_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [qrId],
    });
    return;
  }

  const subject = await db.execute({
    sql: "SELECT id, guardian_id FROM subjects WHERE id = ? LIMIT 1",
    args: [subjectId],
  });
  const subjectRow = subject.rows[0];
  if (!subjectRow) throw new Error("관리대상자를 찾을 수 없습니다.");

  await db.batch([
    {
      sql: "UPDATE qr_codes SET guardian_id = NULL, subject_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE subject_id = ? AND id <> ?",
      args: [subjectId, qrId],
    },
    {
      sql: "UPDATE qr_codes SET guardian_id = ?, subject_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [subjectRow.guardian_id, subjectRow.id, qrId],
    },
  ]);
}

export async function getSubscriptionByGuardianId(guardianId) {
  await ensureSchema();
  const db = getDb();
  if (!guardianId) return null;

  const result = await db.execute({
    sql: "SELECT * FROM subscriptions WHERE guardian_id = ? LIMIT 1",
    args: [guardianId],
  });

  return result.rows[0] || null;
}

export async function prepareSubscriptionForGuardian(session, planMonths = 1) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session);
  const plan = await getSubscriptionPlanByMonths(planMonths);
  if (!plan) throw new Error("선택한 구독 옵션을 찾을 수 없습니다.");

  const amount = Number(plan.amount);
  const existing = await getSubscriptionByGuardianId(guardian.id);

  if (existing) {
    await db.execute({
      sql: `UPDATE subscriptions
        SET plan_name = ?,
          plan_months = ?,
          amount = ?,
          currency = 'KRW',
          error_code = NULL,
          error_message = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE guardian_id = ?`,
      args: [plan.name, plan.months, amount, guardian.id],
    });
    return {
      guardian,
      subscription: {
        ...existing,
        plan_name: plan.name,
        plan_months: plan.months,
        amount,
      },
      plan,
    };
  }

  const subscription = {
    id: crypto.randomUUID(),
    guardian_id: guardian.id,
    customer_key: `guardian_${guardian.id}`,
    status: "ready",
    plan_name: plan.name,
    plan_months: plan.months,
    amount,
  };

  await db.execute({
    sql: `INSERT INTO subscriptions (id, guardian_id, customer_key, status, plan_name, plan_months, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      subscription.id,
      subscription.guardian_id,
      subscription.customer_key,
      subscription.status,
      subscription.plan_name,
      subscription.plan_months,
      subscription.amount,
    ],
  });

  return {
    guardian,
    subscription,
    plan,
  };
}

export async function getSubscriptionByCustomerKey(customerKey) {
  await ensureSchema();
  const db = getDb();
  const key = String(customerKey || "").trim();
  if (!key) return null;

  const result = await db.execute({
    sql: "SELECT * FROM subscriptions WHERE customer_key = ? LIMIT 1",
    args: [key],
  });

  return result.rows[0] || null;
}

export async function markSubscriptionActive({ customerKey, billingKey, payment }) {
  await ensureSchema();
  const db = getDb();
  const key = String(customerKey || "").trim();
  if (!key) throw new Error("customerKey is required.");
  const subscription = await getSubscriptionByCustomerKey(key);
  const periodStart = new Date();
  const periodEnd = addMonths(periodStart, Number(subscription?.plan_months || 1));

  await db.execute({
    sql: `UPDATE subscriptions
      SET billing_key = ?,
        status = 'active',
        current_period_start = ?,
        current_period_end = ?,
        paused_at = NULL,
        resumed_at = CURRENT_TIMESTAMP,
        last_order_id = ?,
        last_payment_key = ?,
        last_payment_status = ?,
        error_code = NULL,
        error_message = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE customer_key = ?`,
    args: [
      billingKey || "",
      periodStart.toISOString(),
      periodEnd.toISOString(),
      payment?.orderId || "",
      payment?.paymentKey || "",
      payment?.status || "DONE",
      key,
    ],
  });
}

export async function pauseSubscriptionForGuardian(session) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session);

  await db.execute({
    sql: `UPDATE subscriptions
      SET status = 'paused',
        paused_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE guardian_id = ? AND status = 'active'`,
    args: [guardian.id],
  });
}

export async function resumeSubscriptionForGuardian(session) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session);

  await db.execute({
    sql: `UPDATE subscriptions
      SET status = 'active',
        resumed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE guardian_id = ? AND status = 'paused'`,
    args: [guardian.id],
  });
}

export async function markSubscriptionFailed({ customerKey, code, message }) {
  await ensureSchema();
  const db = getDb();
  const key = String(customerKey || "").trim();
  if (!key) return;

  await db.execute({
    sql: `UPDATE subscriptions
      SET status = 'failed',
        error_code = ?,
        error_message = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE customer_key = ?`,
    args: [String(code || ""), String(message || ""), key],
  });
}

export function getSubscriptionAmount() {
  const value = Number(process.env.TOSS_SUBSCRIPTION_AMOUNT || 9900);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 9900;
}

export async function getSubscriptionPlans() {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY months ASC",
    args: [],
  });

  return result.rows;
}

export async function getAdminSubscriptionPlansData() {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM subscription_plans ORDER BY months ASC",
    args: [],
  });

  return {
    plans: result.rows,
  };
}

export async function setSubscriptionPlanPrice(formData) {
  await ensureSchema();
  const db = getDb();
  const months = Number(getText(formData, "months"));
  const amount = Number(getText(formData, "amount"));

  if (![1, 3, 6].includes(months)) {
    throw new Error("지원하지 않는 구독 옵션입니다.");
  }
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("가격은 0 이상의 숫자여야 합니다.");
  }

  await db.execute({
    sql: "UPDATE subscription_plans SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE months = ?",
    args: [Math.floor(amount), months],
  });
}

export async function getAdDailyRate() {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT daily_rate FROM ad_settings WHERE id = 'default' LIMIT 1",
    args: [],
  });

  const rate = Number(result.rows[0]?.daily_rate || DEFAULT_AD_DAILY_RATE);
  return Number.isFinite(rate) && rate >= 0 ? Math.floor(rate) : DEFAULT_AD_DAILY_RATE;
}

export async function getAdminAdsData() {
  await ensureSchema();
  const db = getDb();
  const [settingResult, adsResult] = await Promise.all([
    db.execute({
      sql: "SELECT * FROM ad_settings WHERE id = 'default' LIMIT 1",
      args: [],
    }),
    db.execute({
      sql: `SELECT
          a.*,
          g.name AS guardian_name,
          g.email AS guardian_email,
          g.google_email AS guardian_google_email,
          g.phone AS guardian_phone,
          s.name AS subject_name,
          s.birth_date AS subject_birth_date,
          s.status AS subject_status
        FROM subject_ads a
        JOIN guardians g ON g.id = a.guardian_id
        JOIN subjects s ON s.id = a.subject_id
        ORDER BY a.updated_at DESC, a.created_at DESC`,
      args: [],
    }),
  ]);

  return {
    setting: settingResult.rows[0] || {
      id: "default",
      daily_rate: DEFAULT_AD_DAILY_RATE,
      currency: "KRW",
    },
    ads: adsResult.rows,
  };
}

export async function setAdDailyRate(formData) {
  await ensureSchema();
  const db = getDb();
  const dailyRate = Number(getText(formData, "dailyRate"));

  if (!Number.isFinite(dailyRate) || dailyRate < 0) {
    throw new Error("광고 일 단가는 0 이상의 숫자여야 합니다.");
  }

  await db.execute({
    sql: `INSERT INTO ad_settings (id, daily_rate, currency)
      VALUES ('default', ?, 'KRW')
      ON CONFLICT(id) DO UPDATE SET
        daily_rate = excluded.daily_rate,
        updated_at = CURRENT_TIMESTAMP`,
    args: [Math.floor(dailyRate)],
  });
}

export async function createSubjectAd(session, formData) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session);
  const subjectId = getText(formData, "subjectId");
  const region = getText(formData, "region");
  const startDate = getText(formData, "startDate");
  const endDate = getText(formData, "endDate");

  if (!subjectId) throw new Error("관리대상을 선택해 주세요.");
  if (!region) throw new Error("광고지역을 입력해 주세요.");
  if (!startDate || !endDate) throw new Error("광고기간을 입력해 주세요.");

  const subject = await db.execute({
    sql: "SELECT id FROM subjects WHERE id = ? AND guardian_id = ? LIMIT 1",
    args: [subjectId, guardian.id],
  });
  if (subject.rows.length === 0) throw new Error("관리대상 정보를 찾을 수 없습니다.");

  const running = await db.execute({
    sql: `SELECT id
      FROM subject_ads
      WHERE subject_id = ? AND status IN ('active', 'paused', 'ready')
      LIMIT 1`,
    args: [subjectId],
  });
  if (running.rows.length > 0) {
    throw new Error("이미 진행 중인 광고가 있습니다. 기존 광고를 종료한 뒤 다시 신청해 주세요.");
  }

  const days = calculateAdDays(startDate, endDate);
  const dailyRate = await getAdDailyRate();
  const amount = days * dailyRate;

  await db.execute({
    sql: `INSERT INTO subject_ads (
        id, guardian_id, subject_id, region, start_date, end_date, days,
        daily_rate, amount, currency, status, meta_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'KRW', 'active', 'meta_api_pending')`,
    args: [crypto.randomUUID(), guardian.id, subjectId, region, startDate, endDate, days, dailyRate, amount],
  });
}

export async function pauseSubjectAd(session, formData) {
  await updateSubjectAdStatus(session, formData, {
    allowed: ["active"],
    nextStatus: "paused",
    timestampColumn: "paused_at",
  });
}

export async function resumeSubjectAd(session, formData) {
  await updateSubjectAdStatus(session, formData, {
    allowed: ["paused"],
    nextStatus: "active",
    timestampColumn: null,
  });
}

export async function endSubjectAd(session, formData) {
  await updateSubjectAdStatus(session, formData, {
    allowed: ["active", "paused", "ready"],
    nextStatus: "ended",
    timestampColumn: "ended_at",
  });
}

async function updateSubjectAdStatus(session, formData, { allowed, nextStatus, timestampColumn }) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session);
  const adId = getText(formData, "adId");
  if (!adId) throw new Error("광고 정보를 찾을 수 없습니다.");

  const result = await db.execute({
    sql: "SELECT id, status FROM subject_ads WHERE id = ? AND guardian_id = ? LIMIT 1",
    args: [adId, guardian.id],
  });
  const ad = result.rows[0];
  if (!ad) throw new Error("광고 정보를 찾을 수 없습니다.");
  if (!allowed.includes(String(ad.status))) {
    throw new Error("현재 상태에서는 광고 상태를 변경할 수 없습니다.");
  }

  const timestampSql = timestampColumn ? `, ${timestampColumn} = CURRENT_TIMESTAMP` : "";
  await db.execute({
    sql: `UPDATE subject_ads
      SET status = ?, updated_at = CURRENT_TIMESTAMP${timestampSql}
      WHERE id = ? AND guardian_id = ?`,
    args: [nextStatus, adId, guardian.id],
  });
}

async function getSubscriptionPlanByMonths(planMonths) {
  await ensureSchema();
  const db = getDb();
  const months = [1, 3, 6].includes(Number(planMonths)) ? Number(planMonths) : 1;
  const result = await db.execute({
    sql: "SELECT * FROM subscription_plans WHERE months = ? AND is_active = 1 LIMIT 1",
    args: [months],
  });

  return result.rows[0] || null;
}

export async function getQrByKey(publicKey) {
  await ensureSchema();
  const db = getDb();
  const key = String(publicKey || "").trim();
  if (!key) return null;

  const result = await db.execute({
    sql: "SELECT * FROM qr_codes WHERE public_key = ?",
    args: [key],
  });

  const row = result.rows[0] || null;
  return row
    ? {
        ...row,
        target_url: getFindUrl(row.public_key),
      }
    : null;
}

export async function getFindPageDataByKey(publicKey) {
  await ensureSchema();
  const db = getDb();
  const key = String(publicKey || "").trim();
  if (!key) return null;

  const result = await db.execute({
    sql: `SELECT
        q.id AS qr_id,
        q.code,
        q.public_key,
        q.target_url,
        q.is_active AS qr_active,
        s.id AS subject_id,
        s.name AS subject_name,
        s.birth_date,
        s.gender,
        s.status AS subject_status,
        s.photo_data_url,
        g.id AS guardian_id,
        g.name AS guardian_name,
        g.safe_phone,
        g.email,
        g.address
      FROM qr_codes q
      LEFT JOIN subjects s ON s.id = q.subject_id
      LEFT JOIN guardians g ON g.id = q.guardian_id
      WHERE q.public_key = ?
      LIMIT 1`,
    args: [key],
  });

  const row = result.rows[0] || null;
  return row
    ? {
        ...row,
        target_url: getFindUrl(row.public_key),
      }
    : null;
}

export async function savePushSubscription(session, subscription) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session);
  const endpoint = String(subscription?.endpoint || "").trim();
  if (!endpoint) throw new Error("Push endpoint is required.");

  await db.execute({
    sql: `INSERT INTO push_subscriptions (id, guardian_id, endpoint, subscription_json)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET
        guardian_id = excluded.guardian_id,
        subscription_json = excluded.subscription_json,
        updated_at = CURRENT_TIMESTAMP`,
    args: [crypto.randomUUID(), guardian.id, endpoint, JSON.stringify(subscription)],
  });
}

export async function getPushSubscriptionsByGuardianId(guardianId) {
  await ensureSchema();
  const db = getDb();
  if (!guardianId) return [];

  const result = await db.execute({
    sql: "SELECT * FROM push_subscriptions WHERE guardian_id = ? ORDER BY updated_at DESC",
    args: [guardianId],
  });

  return result.rows
    .map((row) => {
      try {
        return {
          id: row.id,
          endpoint: row.endpoint,
          subscription: JSON.parse(row.subscription_json),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export async function deletePushSubscription(subscriptionId) {
  await ensureSchema();
  const db = getDb();
  if (!subscriptionId) return;

  await db.execute({
    sql: "DELETE FROM push_subscriptions WHERE id = ?",
    args: [subscriptionId],
  });
}

async function insertQrCodes(db, count) {
  const created = [];

  while (created.length < count) {
    const record = await createUniqueQrRecord(db);
    await db.execute({
      sql: `INSERT INTO qr_codes (id, code, public_key, target_url, is_active)
        VALUES (?, ?, ?, ?, 1)`,
      args: [record.id, record.code, record.publicKey, record.targetUrl],
    });
    created.push(record);
  }

  return created;
}

async function assignQrToSubject(db, guardianId, subjectId) {
  const current = await db.execute({
    sql: "SELECT id FROM qr_codes WHERE subject_id = ? LIMIT 1",
    args: [subjectId],
  });
  if (current.rows.length > 0) return;

  let available = await db.execute({
    sql: "SELECT id FROM qr_codes WHERE subject_id IS NULL ORDER BY created_at ASC LIMIT 1",
    args: [],
  });

  if (available.rows.length === 0) {
    await insertQrCodes(db, 1);
    available = await db.execute({
      sql: "SELECT id FROM qr_codes WHERE subject_id IS NULL ORDER BY created_at ASC LIMIT 1",
      args: [],
    });
  }

  const qrId = available.rows[0]?.id;
  if (!qrId) throw new Error("관리대상에 배정할 QR 코드를 찾을 수 없습니다.");

  await db.execute({
    sql: "UPDATE qr_codes SET guardian_id = ?, subject_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [guardianId, subjectId, qrId],
  });
}

async function createUniqueQrRecord(db) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `ZRF-${randomString(4).toUpperCase()}-${randomString(4).toUpperCase()}`;
    const publicKey = `zrf-${randomString(14).toLowerCase()}`;
    const existing = await db.execute({
      sql: "SELECT id FROM qr_codes WHERE code = ? OR public_key = ? LIMIT 1",
      args: [code, publicKey],
    });

    if (existing.rows.length === 0) {
      return {
        id: crypto.randomUUID(),
        code,
        publicKey,
        targetUrl: getFindUrl(publicKey),
      };
    }
  }

  throw new Error("중복되지 않는 QR 문자열 생성에 실패했습니다.");
}

function randomString(length) {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  const bytes = randomBytes(length);
  let value = "";

  for (const byte of bytes) {
    value += alphabet[byte % alphabet.length];
  }

  return value;
}

async function addColumnIfMissing(columns, columnName, sql) {
  const exists = columns.rows.some((column) => column.name === columnName);
  if (!exists) {
    await getDb().execute(sql);
  }
}

async function seedSubscriptionPlans(db) {
  for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO subscription_plans (months, name, amount, is_active)
        VALUES (?, ?, ?, 1)`,
      args: [plan.months, plan.name, plan.amount],
    });
  }
}

async function seedAdSettings(db) {
  await db.execute({
    sql: `INSERT OR IGNORE INTO ad_settings (id, daily_rate, currency)
      VALUES ('default', ?, 'KRW')`,
    args: [DEFAULT_AD_DAILY_RATE],
  });
}

function addMonths(date, months) {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
}

function calculateAdDays(startDate, endDate) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) {
    throw new Error("광고기간 날짜 형식을 확인해 주세요.");
  }
  if (end < start) {
    throw new Error("광고 종료일은 시작일보다 빠를 수 없습니다.");
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
}

function parseDateOnly(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!/^01[016789]\d{7,8}$/.test(digits)) {
    throw new Error("휴대폰 번호 형식을 확인해 주세요.");
  }
  return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
}

function isStrongPassword(value) {
  const password = String(value || "");
  return (
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function getText(formData, key) {
  return String(formData.get(key) || "").trim();
}

async function fileToDataUrl(file) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("사진 파일은 이미지 형식만 업로드할 수 있습니다.");
  }
  if (file.size > 1024 * 1024) {
    throw new Error("사진은 1MB 이하만 업로드할 수 있습니다.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    dataUrl: `data:${file.type};base64,${buffer.toString("base64")}`,
    name: file.name,
  };
}
