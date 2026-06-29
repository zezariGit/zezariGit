import { createClient } from "@libsql/client";
import { randomBytes } from "crypto";
import { hashPassword, verifyPassword } from "./security";

const DEFAULT_SUBSCRIPTION_PLANS = [
  { months: 1, name: "1개월 이용권", amount: 9900 },
  { months: 3, name: "3개월 이용권", amount: 27000 },
  { months: 6, name: "6개월 이용권", amount: 50000 },
];
const DEFAULT_AD_DAILY_RATE = 10000;
const DB_SCHEMA_VERSION = 8;
const DEFAULT_PRODUCTS = [
  { slug: "sticker", name: "스티커", unitPrice: 5000, sortOrder: 1 },
  { slug: "bracelet", name: "팔찌", unitPrice: 5000, sortOrder: 2 },
  { slug: "necklace", name: "목걸이", unitPrice: 5000, sortOrder: 3 },
  { slug: "keyring", name: "키링", unitPrice: 5000, sortOrder: 4 },
];

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
    const schemaVersionResult = await db.execute({
      sql: "SELECT version FROM schema_meta WHERE id = 'app' LIMIT 1",
      args: [],
    }).catch(() => null);
    if (Number(schemaVersionResult?.rows[0]?.version || 0) >= DB_SCHEMA_VERSION) {
      return;
    }

    await db.batch([
      {
        sql: `CREATE TABLE IF NOT EXISTS schema_meta (
          id TEXT PRIMARY KEY,
          version INTEGER NOT NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        args: [],
      },
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
          address_detail TEXT,
          admin_memo TEXT,
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
          status TEXT NOT NULL DEFAULT '상품구매필요',
          photo_data_url TEXT,
          photo_name TEXT,
          guardian_message TEXT,
          voice_data_url TEXT,
          voice_name TEXT,
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
          activated_at TEXT,
          lifecycle_status TEXT NOT NULL DEFAULT 'unused',
          discarded_at TEXT,
          admin_memo TEXT,
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
          admin_memo TEXT,
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
        sql: `CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          description TEXT,
          image_data_url TEXT,
          image_name TEXT,
          unit_price INTEGER NOT NULL DEFAULT 5000,
          is_active INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products(is_active, sort_order)",
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS product_orders (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL,
          subject_id TEXT,
          product_id TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          order_type TEXT NOT NULL,
          plan_months INTEGER,
          design_index INTEGER NOT NULL DEFAULT 0,
          shipping_address TEXT,
          shipping_address_detail TEXT,
          payment_method TEXT,
          toss_order_id TEXT,
          payment_key TEXT,
          amount INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'draft',
          fulfillment_status TEXT NOT NULL DEFAULT 'pending',
          recipient_name TEXT,
          recipient_phone TEXT,
          carrier TEXT,
          tracking_number TEXT,
          admin_memo TEXT,
          paid_at TEXT,
          shipped_at TEXT,
          delivered_at TEXT,
          activated_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
          FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_product_orders_guardian_id ON product_orders(guardian_id, created_at)",
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
        sql: `CREATE TABLE IF NOT EXISTS guardian_coupons (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          discount_label TEXT,
          status TEXT NOT NULL DEFAULT 'available',
          used_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
        )`,
        args: [],
      },
      {
        sql: "CREATE UNIQUE INDEX IF NOT EXISTS idx_guardian_coupons_guardian_code ON guardian_coupons(guardian_id, code)",
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_guardian_coupons_guardian_status ON guardian_coupons(guardian_id, status)",
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS guardian_payment_methods (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL,
          provider TEXT NOT NULL,
          nickname TEXT NOT NULL,
          last4 TEXT NOT NULL,
          method_type TEXT NOT NULL DEFAULT 'card',
          is_default INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_guardian_payment_methods_guardian_id ON guardian_payment_methods(guardian_id, is_default)",
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS guardian_notifications (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT,
          url TEXT,
          read_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_guardian_notifications_guardian_id ON guardian_notifications(guardian_id, created_at)",
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS location_shares (
          id TEXT PRIMARY KEY,
          qr_id TEXT NOT NULL,
          guardian_id TEXT NOT NULL,
          subject_id TEXT NOT NULL,
          public_key TEXT NOT NULL,
          subject_name TEXT,
          guardian_name TEXT,
          guardian_safe_phone TEXT,
          finder_contact TEXT,
          address_label TEXT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          accuracy REAL,
          kakao_map_url TEXT,
          naver_map_url TEXT,
          user_agent TEXT,
          ip_address TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (qr_id) REFERENCES qr_codes(id) ON DELETE CASCADE,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
          FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_location_shares_created_at ON location_shares(created_at)",
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_location_shares_guardian_id ON location_shares(guardian_id, created_at)",
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
          click_count INTEGER NOT NULL DEFAULT 0,
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
      {
        sql: `CREATE TABLE IF NOT EXISTS customer_inquiries (
          id TEXT PRIMARY KEY,
          guardian_id TEXT,
          title TEXT NOT NULL,
          body TEXT,
          status TEXT NOT NULL DEFAULT 'received',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE SET NULL
        )`,
        args: [],
      },
      {
        sql: "CREATE INDEX IF NOT EXISTS idx_customer_inquiries_created_at ON customer_inquiries(created_at)",
        args: [],
      },
    ]);

    const columns = await db.execute("PRAGMA table_info(subjects)");
    const hasStatus = columns.rows.some((column) => column.name === "status");
    if (!hasStatus) {
      await db.execute("ALTER TABLE subjects ADD COLUMN status TEXT NOT NULL DEFAULT '상품구매필요'");
    }
    await addColumnIfMissing(columns, "guardian_message", "ALTER TABLE subjects ADD COLUMN guardian_message TEXT");
    await addColumnIfMissing(columns, "voice_data_url", "ALTER TABLE subjects ADD COLUMN voice_data_url TEXT");
    await addColumnIfMissing(columns, "voice_name", "ALTER TABLE subjects ADD COLUMN voice_name TEXT");
    await db.execute("UPDATE subjects SET status = '안전' WHERE status = '문제없음'");

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
    await addColumnIfMissing(guardianColumns, "address_detail", "ALTER TABLE guardians ADD COLUMN address_detail TEXT");
    await addColumnIfMissing(guardianColumns, "admin_memo", "ALTER TABLE guardians ADD COLUMN admin_memo TEXT");
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
    await addColumnIfMissing(qrColumns, "activated_at", "ALTER TABLE qr_codes ADD COLUMN activated_at TEXT");
    await addColumnIfMissing(qrColumns, "lifecycle_status", "ALTER TABLE qr_codes ADD COLUMN lifecycle_status TEXT NOT NULL DEFAULT 'unused'");
    await addColumnIfMissing(qrColumns, "discarded_at", "ALTER TABLE qr_codes ADD COLUMN discarded_at TEXT");
    await addColumnIfMissing(qrColumns, "admin_memo", "ALTER TABLE qr_codes ADD COLUMN admin_memo TEXT");
    await db.execute(`UPDATE qr_codes
      SET lifecycle_status = CASE
        WHEN lifecycle_status = 'discarded' THEN 'discarded'
        WHEN subject_id IS NOT NULL THEN 'in_use'
        ELSE 'unused'
      END
      WHERE lifecycle_status IS NULL
        OR lifecycle_status = ''
        OR lifecycle_status NOT IN ('in_use', 'unused', 'discarded')`);

    const subscriptionColumns = await db.execute("PRAGMA table_info(subscriptions)");
    await addColumnIfMissing(subscriptionColumns, "plan_months", "ALTER TABLE subscriptions ADD COLUMN plan_months INTEGER NOT NULL DEFAULT 1");
    await addColumnIfMissing(subscriptionColumns, "current_period_start", "ALTER TABLE subscriptions ADD COLUMN current_period_start TEXT");
    await addColumnIfMissing(subscriptionColumns, "current_period_end", "ALTER TABLE subscriptions ADD COLUMN current_period_end TEXT");
    await addColumnIfMissing(subscriptionColumns, "paused_at", "ALTER TABLE subscriptions ADD COLUMN paused_at TEXT");
    await addColumnIfMissing(subscriptionColumns, "resumed_at", "ALTER TABLE subscriptions ADD COLUMN resumed_at TEXT");
    await addColumnIfMissing(subscriptionColumns, "admin_memo", "ALTER TABLE subscriptions ADD COLUMN admin_memo TEXT");

    const productColumns = await db.execute("PRAGMA table_info(products)");
    await addColumnIfMissing(productColumns, "description", "ALTER TABLE products ADD COLUMN description TEXT");
    await addColumnIfMissing(productColumns, "image_data_url", "ALTER TABLE products ADD COLUMN image_data_url TEXT");
    await addColumnIfMissing(productColumns, "image_name", "ALTER TABLE products ADD COLUMN image_name TEXT");
    await addColumnIfMissing(productColumns, "unit_price", "ALTER TABLE products ADD COLUMN unit_price INTEGER NOT NULL DEFAULT 5000");
    await addColumnIfMissing(productColumns, "is_active", "ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1");
    await addColumnIfMissing(productColumns, "sort_order", "ALTER TABLE products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");

    const productOrderColumns = await db.execute("PRAGMA table_info(product_orders)");
    await addColumnIfMissing(productOrderColumns, "design_index", "ALTER TABLE product_orders ADD COLUMN design_index INTEGER NOT NULL DEFAULT 0");
    await addColumnIfMissing(productOrderColumns, "shipping_address", "ALTER TABLE product_orders ADD COLUMN shipping_address TEXT");
    await addColumnIfMissing(productOrderColumns, "shipping_address_detail", "ALTER TABLE product_orders ADD COLUMN shipping_address_detail TEXT");
    await addColumnIfMissing(productOrderColumns, "payment_method", "ALTER TABLE product_orders ADD COLUMN payment_method TEXT");
    await addColumnIfMissing(productOrderColumns, "toss_order_id", "ALTER TABLE product_orders ADD COLUMN toss_order_id TEXT");
    await addColumnIfMissing(productOrderColumns, "payment_key", "ALTER TABLE product_orders ADD COLUMN payment_key TEXT");
    await addColumnIfMissing(productOrderColumns, "paid_at", "ALTER TABLE product_orders ADD COLUMN paid_at TEXT");
    await addColumnIfMissing(productOrderColumns, "activated_at", "ALTER TABLE product_orders ADD COLUMN activated_at TEXT");
    await addColumnIfMissing(productOrderColumns, "fulfillment_status", "ALTER TABLE product_orders ADD COLUMN fulfillment_status TEXT NOT NULL DEFAULT 'pending'");
    await addColumnIfMissing(productOrderColumns, "recipient_name", "ALTER TABLE product_orders ADD COLUMN recipient_name TEXT");
    await addColumnIfMissing(productOrderColumns, "recipient_phone", "ALTER TABLE product_orders ADD COLUMN recipient_phone TEXT");
    await addColumnIfMissing(productOrderColumns, "carrier", "ALTER TABLE product_orders ADD COLUMN carrier TEXT");
    await addColumnIfMissing(productOrderColumns, "tracking_number", "ALTER TABLE product_orders ADD COLUMN tracking_number TEXT");
    await addColumnIfMissing(productOrderColumns, "admin_memo", "ALTER TABLE product_orders ADD COLUMN admin_memo TEXT");
    await addColumnIfMissing(productOrderColumns, "shipped_at", "ALTER TABLE product_orders ADD COLUMN shipped_at TEXT");
    await addColumnIfMissing(productOrderColumns, "delivered_at", "ALTER TABLE product_orders ADD COLUMN delivered_at TEXT");
    await db.execute(`UPDATE product_orders
      SET fulfillment_status = 'preparing'
      WHERE fulfillment_status = 'pending'
        AND status IN ('paid', 'paid_waiting_activation', 'activated')`);
    await db.execute("CREATE INDEX IF NOT EXISTS idx_product_orders_fulfillment ON product_orders(fulfillment_status, created_at)");

    const adColumns = await db.execute("PRAGMA table_info(subject_ads)");
    await addColumnIfMissing(adColumns, "click_count", "ALTER TABLE subject_ads ADD COLUMN click_count INTEGER NOT NULL DEFAULT 0");
    await addColumnIfMissing(adColumns, "impression_count", "ALTER TABLE subject_ads ADD COLUMN impression_count INTEGER NOT NULL DEFAULT 0");
    await addColumnIfMissing(adColumns, "reach_count", "ALTER TABLE subject_ads ADD COLUMN reach_count INTEGER NOT NULL DEFAULT 0");
    await addColumnIfMissing(adColumns, "contact_count", "ALTER TABLE subject_ads ADD COLUMN contact_count INTEGER NOT NULL DEFAULT 0");
    await addColumnIfMissing(adColumns, "spent_amount", "ALTER TABLE subject_ads ADD COLUMN spent_amount INTEGER NOT NULL DEFAULT 0");
    await addColumnIfMissing(adColumns, "admin_memo", "ALTER TABLE subject_ads ADD COLUMN admin_memo TEXT");

    const locationShareColumns = await db.execute("PRAGMA table_info(location_shares)");
    if (locationShareColumns.rows.length === 0) {
      await db.execute({
        sql: `CREATE TABLE IF NOT EXISTS location_shares (
          id TEXT PRIMARY KEY,
          qr_id TEXT NOT NULL,
          guardian_id TEXT NOT NULL,
          subject_id TEXT NOT NULL,
          public_key TEXT NOT NULL,
          subject_name TEXT,
          guardian_name TEXT,
          guardian_safe_phone TEXT,
          finder_contact TEXT,
          address_label TEXT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          accuracy REAL,
          kakao_map_url TEXT,
          naver_map_url TEXT,
          user_agent TEXT,
          ip_address TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (qr_id) REFERENCES qr_codes(id) ON DELETE CASCADE,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
          FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )`,
        args: [],
      });
    } else {
      await addColumnIfMissing(locationShareColumns, "public_key", "ALTER TABLE location_shares ADD COLUMN public_key TEXT");
      await addColumnIfMissing(locationShareColumns, "subject_name", "ALTER TABLE location_shares ADD COLUMN subject_name TEXT");
      await addColumnIfMissing(locationShareColumns, "guardian_name", "ALTER TABLE location_shares ADD COLUMN guardian_name TEXT");
      await addColumnIfMissing(locationShareColumns, "guardian_safe_phone", "ALTER TABLE location_shares ADD COLUMN guardian_safe_phone TEXT");
      await addColumnIfMissing(locationShareColumns, "finder_contact", "ALTER TABLE location_shares ADD COLUMN finder_contact TEXT");
      await addColumnIfMissing(locationShareColumns, "address_label", "ALTER TABLE location_shares ADD COLUMN address_label TEXT");
      await addColumnIfMissing(locationShareColumns, "accuracy", "ALTER TABLE location_shares ADD COLUMN accuracy REAL");
      await addColumnIfMissing(locationShareColumns, "kakao_map_url", "ALTER TABLE location_shares ADD COLUMN kakao_map_url TEXT");
      await addColumnIfMissing(locationShareColumns, "naver_map_url", "ALTER TABLE location_shares ADD COLUMN naver_map_url TEXT");
      await addColumnIfMissing(locationShareColumns, "user_agent", "ALTER TABLE location_shares ADD COLUMN user_agent TEXT");
      await addColumnIfMissing(locationShareColumns, "ip_address", "ALTER TABLE location_shares ADD COLUMN ip_address TEXT");
    }
    await db.execute("CREATE INDEX IF NOT EXISTS idx_location_shares_created_at ON location_shares(created_at)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_location_shares_guardian_id ON location_shares(guardian_id, created_at)");

    await seedSubscriptionPlans(db);
    await seedAdSettings(db);
    await seedProducts(db);
    await db.execute({
      sql: `INSERT INTO schema_meta (id, version)
        VALUES ('app', ?)
        ON CONFLICT(id) DO UPDATE SET
          version = excluded.version,
          updated_at = CURRENT_TIMESTAMP`,
      args: [DB_SCHEMA_VERSION],
    });
  })();

  return schemaReady;
}

export function getGuardianKey(session) {
  return String(session?.user?.id || session?.user?.email || "").trim();
}

export async function getDashboardData(session, options = {}) {
  await ensureSchema();
  const db = getDb();
  const googleId = getGuardianKey(session);
  if (!googleId) throw new Error("Authenticated user id is missing.");

  const {
    includeSubjects = true,
    includeSubjectDetails = true,
    includeSubscription = true,
    includeSubscriptionPlans = true,
    includeAdDailyRate = true,
  } = options;

  const detailColumns = includeSubjectDetails
    ? `s.guardian_message,
        s.voice_data_url,
        s.voice_name,`
    : `NULL AS guardian_message,
        NULL AS voice_data_url,
        NULL AS voice_name,`;
  const statements = [{
    sql: "SELECT * FROM guardians WHERE google_id = ? LIMIT 1",
    args: [googleId],
  }];
  const subjectResultIndex = includeSubjects ? statements.length : -1;
  if (includeSubjects) {
    statements.push({
      sql: `SELECT
        s.id,
        s.guardian_id,
        s.name,
        s.birth_date,
        s.gender,
        s.status,
        s.photo_name,
        CASE WHEN LENGTH(COALESCE(s.photo_data_url, '')) > 0 THEN 1 ELSE 0 END AS has_photo,
        ${detailColumns}
        s.created_at,
        s.updated_at,
        q.id AS qr_id,
        q.code AS qr_code,
        q.public_key AS qr_public_key,
        q.is_active AS qr_is_active,
        q.activated_at AS qr_activated_at,
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
      JOIN guardians owner ON owner.id = s.guardian_id
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
      WHERE owner.google_id = ?
      ORDER BY s.created_at ASC`,
      args: [googleId],
    });
  }
  const subscriptionResultIndex = includeSubscription ? statements.length : -1;
  if (includeSubscription) {
    statements.push({
      sql: `SELECT sub.*
        FROM subscriptions sub
        JOIN guardians g ON g.id = sub.guardian_id
        WHERE g.google_id = ?
        LIMIT 1`,
      args: [googleId],
    });
  }
  const plansResultIndex = includeSubscriptionPlans ? statements.length : -1;
  if (includeSubscriptionPlans) {
    statements.push({
      sql: "SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY months ASC",
      args: [],
    });
  }
  const adRateResultIndex = includeAdDailyRate ? statements.length : -1;
  if (includeAdDailyRate) {
    statements.push({
      sql: "SELECT daily_rate FROM ad_settings WHERE id = 'default' LIMIT 1",
      args: [],
    });
  }

  const results = await db.batch(statements);
  const guardian = results[0].rows[0] || null;
  if (!guardian) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO guardians (id, google_id, google_email, name, email)
        VALUES (?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        googleId,
        session.user?.email || "",
        session.user?.name || "",
        session.user?.email || "",
      ],
    });
    return getDashboardData(session, options);
  }

  const subjects = subjectResultIndex >= 0 ? results[subjectResultIndex].rows : [];
  const storedSubscription = subscriptionResultIndex >= 0 ? results[subscriptionResultIndex].rows[0] || null : null;
  const subscription = storedSubscription ? await normalizeSubscriptionExpiry(db, storedSubscription) : null;
  const subscriptionPlans = plansResultIndex >= 0 ? results[plansResultIndex].rows : [];
  const adDailyRate = adRateResultIndex >= 0
    ? Number(results[adRateResultIndex].rows[0]?.daily_rate || DEFAULT_AD_DAILY_RATE)
    : DEFAULT_AD_DAILY_RATE;

  return {
    guardian,
    subjects: subjects.map((subject) => ({
      ...subject,
      photo_data_url: "",
      photo_url: Number(subject.has_photo || 0) === 1 ? getSubjectPhotoUrl(subject.id, subject.updated_at) : "",
      qr_target_url: subject.qr_public_key ? getFindUrl(subject.qr_public_key) : "",
    })),
    subscription,
    subscriptionPlans,
    adDailyRate,
  };
}

export async function getGuardianBillingData(session) {
  await ensureSchema();
  const db = getDb();
  const dashboardData = await getDashboardData(session, {
    includeSubjectDetails: false,
    includeSubscriptionPlans: false,
    includeAdDailyRate: false,
  });
  const orderResult = await db.execute({
    sql: `SELECT
        o.*,
        p.name AS product_name,
        p.slug AS product_slug,
        s.name AS subject_name
      FROM product_orders o
      JOIN products p ON p.id = o.product_id
      LEFT JOIN subjects s ON s.id = o.subject_id
      WHERE o.guardian_id = ?
      ORDER BY o.created_at DESC
      LIMIT 20`,
    args: [dashboardData.guardian.id],
  });

  return {
    ...dashboardData,
    productOrders: orderResult.rows,
  };
}

export async function getGuardianCoupons(session) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  const result = await db.execute({
    sql: `SELECT *
      FROM guardian_coupons
      WHERE guardian_id = ?
      ORDER BY
        CASE status WHEN 'available' THEN 0 WHEN 'used' THEN 1 ELSE 2 END,
        created_at DESC`,
    args: [guardian.id],
  });

  return {
    guardian,
    coupons: result.rows,
  };
}

export async function registerGuardianCoupon(session, formData) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  const code = getText(formData, "code").replace(/\s/g, "").toUpperCase();
  if (!code) throw new Error("쿠폰 번호를 입력해 주세요.");
  if (!/^[A-Z0-9-]{4,40}$/.test(code)) {
    throw new Error("쿠폰 번호는 영문, 숫자, 하이픈으로 입력해 주세요.");
  }

  const duplicate = await db.execute({
    sql: "SELECT id FROM guardian_coupons WHERE guardian_id = ? AND code = ? LIMIT 1",
    args: [guardian.id, code],
  });
  if (duplicate.rows[0]) throw new Error("이미 등록된 쿠폰입니다.");

  const discountLabel = code.includes("100") ? "100% 할인" : "할인";
  await db.execute({
    sql: `INSERT INTO guardian_coupons (id, guardian_id, code, name, discount_label, status)
      VALUES (?, ?, ?, ?, ?, 'available')`,
    args: [crypto.randomUUID(), guardian.id, code, `제자리 ${discountLabel} 쿠폰`, discountLabel],
  });
}

export async function getGuardianPaymentMethods(session) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  const result = await db.execute({
    sql: `SELECT *
      FROM guardian_payment_methods
      WHERE guardian_id = ?
      ORDER BY is_default DESC, created_at DESC`,
    args: [guardian.id],
  });

  return {
    guardian,
    paymentMethods: result.rows,
  };
}

export async function saveGuardianPaymentMethod(session, formData) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  const provider = getText(formData, "provider") || "카드";
  const nickname = getText(formData, "nickname") || provider;
  const last4 = getText(formData, "last4").replace(/\D/g, "");
  const isDefault = getText(formData, "isDefault") === "1" ? 1 : 0;

  if (!/^\d{4}$/.test(last4)) {
    throw new Error("카드 끝 4자리를 입력해 주세요.");
  }

  const current = await db.execute({
    sql: "SELECT COUNT(*) AS count FROM guardian_payment_methods WHERE guardian_id = ?",
    args: [guardian.id],
  });
  const defaultFlag = Number(current.rows[0]?.count || 0) === 0 ? 1 : isDefault;
  if (defaultFlag) {
    await db.execute({
      sql: "UPDATE guardian_payment_methods SET is_default = 0, updated_at = CURRENT_TIMESTAMP WHERE guardian_id = ?",
      args: [guardian.id],
    });
  }

  await db.execute({
    sql: `INSERT INTO guardian_payment_methods (
        id, guardian_id, provider, nickname, last4, method_type, is_default
      )
      VALUES (?, ?, ?, ?, ?, 'card', ?)`,
    args: [crypto.randomUUID(), guardian.id, provider, nickname, last4, defaultFlag],
  });
}

export async function getGuardianAdDashboardData(session) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  const result = await db.execute({
    sql: `SELECT
        a.*,
        s.name AS subject_name,
        s.birth_date AS subject_birth_date,
        CASE WHEN LENGTH(COALESCE(s.photo_data_url, '')) > 0 THEN 1 ELSE 0 END AS subject_has_photo,
        s.updated_at AS subject_updated_at,
        s.status AS subject_status
      FROM subject_ads a
      JOIN subjects s ON s.id = a.subject_id
      WHERE a.guardian_id = ?
      ORDER BY a.updated_at DESC, a.created_at DESC`,
    args: [guardian.id],
  });

  return {
    guardian,
    ads: result.rows.map((ad) => ({
      ...ad,
      subject_photo_url: Number(ad.subject_has_photo || 0) === 1
        ? getSubjectPhotoUrl(ad.subject_id, ad.subject_updated_at)
        : "",
    })),
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

export async function completeGuardianSignup(session, payload) {
  await ensureSchema();
  const db = getDb();
  const googleId = getGuardianKey(session);
  if (!googleId) throw new Error("로그인이 필요합니다.");

  const current = await getDashboardData(session, guardianOnlyOptions());
  const guardian = current.guardian;
  const name = String(payload?.name || "").trim();
  const birthDate = String(payload?.birthDate || "").trim();
  const phone = normalizePhone(payload?.phone);
  const loginId = String(payload?.loginId || "").trim();
  const password = String(payload?.password || "");
  const email = String(payload?.email || guardian.email || guardian.google_email || session.user?.email || "").trim();
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
    sql: "SELECT id FROM guardians WHERE lower(COALESCE(login_id, '')) = lower(?) AND id <> ? LIMIT 1",
    args: [loginId, guardian.id],
  });
  if (duplicateLogin.rows.length > 0) {
    throw new Error("이미 사용 중인 아이디입니다.");
  }

  const duplicatePhone = await db.execute({
    sql: "SELECT id FROM guardians WHERE phone = ? AND id <> ? LIMIT 1",
    args: [phone, guardian.id],
  });
  if (duplicatePhone.rows.length > 0) {
    throw new Error("이미 가입된 휴대폰 번호입니다.");
  }

  await db.execute({
    sql: `UPDATE guardians
      SET name = ?,
          login_id = ?,
          password_hash = ?,
          phone = ?,
          birth_date = ?,
          email = ?,
          google_email = ?,
          phone_verified_at = COALESCE(phone_verified_at, CURRENT_TIMESTAMP),
          terms_privacy_agreed_at = COALESCE(terms_privacy_agreed_at, CURRENT_TIMESTAMP),
          terms_service_agreed_at = COALESCE(terms_service_agreed_at, CURRENT_TIMESTAMP),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    args: [
      name,
      loginId,
      hashPassword(password),
      phone,
      birthDate,
      email,
      session.user?.email || guardian.google_email || "",
      guardian.id,
    ],
  });

  return {
    id: guardian.id,
    loginId,
    name,
  };
}

export async function saveGuardianProfile(session, formData) {
  await ensureSchema();
  const db = getDb();
  const googleId = getGuardianKey(session);
  if (!googleId) throw new Error("Authenticated user id is missing.");

  const current = await getDashboardData(session, guardianOnlyOptions());
  const name = getText(formData, "guardianName");
  const loginId = getText(formData, "loginId");
  const password = getText(formData, "password");
  const phone = getText(formData, "phone");
  const safePhone = getText(formData, "safePhone");
  const address = getText(formData, "address");
  const addressDetail = getText(formData, "addressDetail");
  const birthDate = getText(formData, "birthDate");
  const email = getText(formData, "email");
  const passwordHash = password ? hashPassword(password) : current.guardian.password_hash;

  await db.execute({
    sql: `UPDATE guardians
      SET name = ?, login_id = ?, password_hash = ?, phone = ?, safe_phone = ?, address = ?, address_detail = ?, birth_date = ?, email = ?, google_email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE google_id = ?`,
    args: [name, loginId, passwordHash, phone, safePhone, address, addressDetail, birthDate, email, session.user?.email || "", googleId],
  });
}

export async function saveSubject(session, formData) {
  await ensureSchema();
  const db = getDb();
  const { guardian, subjects } = await getDashboardData(session, {
    includeSubjectDetails: false,
    includeSubscription: false,
    includeSubscriptionPlans: false,
    includeAdDailyRate: false,
  });
  const id = getText(formData, "subjectId") || crypto.randomUUID();
  const isExisting = subjects.some((subject) => subject.id === id);

  if (!isExisting && subjects.length >= 4) {
    throw new Error("대상자는 보호자 1명당 최대 4명까지 입력할 수 있습니다.");
  }

  const name = getText(formData, "subjectName");
  const birthDate = getText(formData, "birthDate");
  const gender = getText(formData, "gender");
  const status = normalizeSubjectStatus(getText(formData, "status") || "상품구매필요");
  const guardianMessage = getText(formData, "guardianMessage");
  const photoFile = formData.get("photo");
  const existingPhoto = getText(formData, "existingPhoto");
  const existingPhotoName = getText(formData, "existingPhotoName");
  const voiceDataUrlInput = getText(formData, "voiceDataUrl");
  const voiceNameInput = getText(formData, "voiceName");
  const existingVoice = getText(formData, "existingVoiceDataUrl");
  const existingVoiceName = getText(formData, "existingVoiceName");

  if (!name || !birthDate || !gender) {
    throw new Error("대상자 이름, 생년월일, 성별은 필수입니다.");
  }

  const currentSubjectResult = isExisting
    ? await db.execute({
      sql: `SELECT photo_data_url, photo_name, voice_data_url, voice_name
        FROM subjects
        WHERE id = ? AND guardian_id = ?
        LIMIT 1`,
      args: [id, guardian.id],
    })
    : { rows: [] };
  const currentSubject = currentSubjectResult.rows[0] || null;
  const photo = await fileToDataUrl(photoFile);
  const photoDataUrl = photo?.dataUrl || currentSubject?.photo_data_url || existingPhoto || "";
  const photoName = photo?.name || currentSubject?.photo_name || existingPhotoName || "";
  const voiceDataUrl = normalizeVoiceDataUrl(voiceDataUrlInput) || currentSubject?.voice_data_url || existingVoice || "";
  const voiceName = voiceDataUrlInput
    ? voiceNameInput || `${name}-guardian-voice.webm`
    : currentSubject?.voice_name || existingVoiceName || "";

  if (isExisting) {
    await db.execute({
      sql: `UPDATE subjects
        SET name = ?, birth_date = ?, gender = ?, status = ?, photo_data_url = ?, photo_name = ?, guardian_message = ?, voice_data_url = ?, voice_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND guardian_id = ?`,
      args: [name, birthDate, gender, status, photoDataUrl, photoName, guardianMessage, voiceDataUrl, voiceName, id, guardian.id],
    });
    const qr = await assignQrToSubject(db, guardian.id, id);
    return { isNew: false, subjectId: id, qr };
  }

  await db.execute({
    sql: `INSERT INTO subjects (
        id, guardian_id, name, birth_date, gender, status,
        photo_data_url, photo_name, guardian_message, voice_data_url, voice_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, guardian.id, name, birthDate, gender, status, photoDataUrl, photoName, guardianMessage, voiceDataUrl, voiceName],
  });
  const qr = await assignQrToSubject(db, guardian.id, id);
  return { isNew: true, subjectId: id, qr };
}

export async function deleteSubject(session, formData) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
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

export async function getAdminData(selectedGuardianId = "", filters = {}) {
  await ensureSchema();
  const db = getDb();
  const query = String(filters.query || "").trim();
  const status = ["active", "inactive"].includes(filters.status) ? filters.status : "all";
  const type = ["vip", "normal", "admin"].includes(filters.type) ? filters.type : "all";
  const startDate = normalizeDateInput(filters.startDate);
  const endDate = normalizeDateInput(filters.endDate);
  const clauses = [];
  const args = [];

  if (query) {
    const pattern = `%${query}%`;
    clauses.push(`(
      g.id LIKE ? OR
      COALESCE(g.name, '') LIKE ? OR
      COALESCE(g.phone, '') LIKE ? OR
      COALESCE(NULLIF(g.email, ''), g.google_email, '') LIKE ?
    )`);
    args.push(pattern, pattern, pattern, pattern);
  }
  if (status === "active") clauses.push("g.is_active = 1");
  if (status === "inactive") clauses.push("g.is_active = 0");
  if (type === "vip") {
    clauses.push("EXISTS (SELECT 1 FROM subscriptions sub WHERE sub.guardian_id = g.id AND sub.status = 'active')");
  }
  if (type === "normal") {
    clauses.push("g.is_admin = 0 AND NOT EXISTS (SELECT 1 FROM subscriptions sub WHERE sub.guardian_id = g.id AND sub.status = 'active')");
  }
  if (type === "admin") clauses.push("g.is_admin = 1");
  if (startDate) {
    clauses.push("date(g.created_at, '+9 hours') >= date(?)");
    args.push(startDate);
  }
  if (endDate) {
    clauses.push("date(g.created_at, '+9 hours') <= date(?)");
    args.push(endDate);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const [summaryResult, guardiansResult] = await db.batch([
    {
      sql: `SELECT
          (SELECT COUNT(*) FROM guardians) AS total_guardians,
          (SELECT COUNT(*) FROM guardians WHERE is_active = 1) AS active_guardians,
          (SELECT COUNT(*) FROM guardians WHERE is_active = 0) AS inactive_guardians,
          (SELECT COUNT(*) FROM guardians WHERE date(created_at, '+9 hours') = date('now', '+9 hours')) AS today_guardians,
          (SELECT COUNT(*) FROM guardians WHERE date(created_at, '+9 hours') = date('now', '+9 hours', '-1 day')) AS yesterday_guardians,
          (SELECT COUNT(DISTINCT guardian_id) FROM subjects) AS registered_guardians,
          (SELECT COUNT(*) FROM guardians g2 WHERE NOT EXISTS (SELECT 1 FROM subjects s2 WHERE s2.guardian_id = g2.id)) AS unregistered_guardians,
          (SELECT COUNT(*) FROM subjects) AS total_subjects`,
      args: [],
    },
    {
      sql: `SELECT
        g.id,
        g.name,
        g.login_id,
        g.phone,
        g.safe_phone,
        g.email,
        g.google_email,
        g.google_id,
        g.birth_date,
        g.address,
        g.address_detail,
        g.is_active,
        g.is_admin,
        g.created_at,
        g.updated_at,
        (SELECT COUNT(*) FROM subscriptions sub WHERE sub.guardian_id = g.id AND sub.status = 'active') AS active_subscription_count,
        (SELECT COUNT(*) FROM subjects s WHERE s.guardian_id = g.id) AS subject_count
      FROM guardians g
      ${where}
      ORDER BY g.created_at DESC, g.updated_at DESC
      LIMIT 200`,
      args,
    },
  ]);

  const guardians = guardiansResult.rows;
  const summaryRow = summaryResult.rows[0] || {};
  const summary = {
    totalGuardians: Number(summaryRow.total_guardians || 0),
    activeGuardians: Number(summaryRow.active_guardians || 0),
    inactiveGuardians: Number(summaryRow.inactive_guardians || 0),
    newGuardiansToday: Number(summaryRow.today_guardians || 0),
    newGuardiansYesterday: Number(summaryRow.yesterday_guardians || 0),
    registeredGuardians: Number(summaryRow.registered_guardians || 0),
    unregisteredGuardians: Number(summaryRow.unregistered_guardians || 0),
    totalSubjects: Number(summaryRow.total_subjects || 0),
  };
  const selectedId = guardians.some((guardian) => guardian.id === selectedGuardianId)
    ? selectedGuardianId
    : guardians[0]?.id || "";
  if (!selectedId) {
    return {
      summary,
      guardians,
      selectedGuardian: null,
      subjects: [],
      subscription: null,
      payments: [],
      ads: [],
      activities: [],
      filters: { query, status, type, startDate, endDate },
    };
  }

  const [guardianResult, subjectsResult, subscriptionResult, paymentsResult, adsResult, activitiesResult] = await db.batch([
    {
      sql: "SELECT * FROM guardians WHERE id = ? LIMIT 1",
      args: [selectedId],
    },
    {
      sql: `SELECT
          s.id,
          s.name,
          s.status,
          s.birth_date,
          s.gender,
          s.created_at,
          q.id AS qr_id,
          q.is_active AS qr_is_active,
          q.activated_at AS qr_activated_at
        FROM subjects s
        LEFT JOIN qr_codes q ON q.subject_id = s.id
        WHERE s.guardian_id = ?
        ORDER BY s.created_at ASC`,
      args: [selectedId],
    },
    {
      sql: `SELECT * FROM subscriptions
        WHERE guardian_id = ?
        LIMIT 1`,
      args: [selectedId],
    },
    {
      sql: `SELECT
          o.id,
          o.toss_order_id,
          o.order_type,
          o.amount,
          o.status,
          o.fulfillment_status,
          o.payment_method,
          o.plan_months,
          o.quantity,
          o.paid_at,
          o.activated_at,
          o.created_at,
          p.name AS product_name,
          s.name AS subject_name
        FROM product_orders o
        JOIN products p ON p.id = o.product_id
        LEFT JOIN subjects s ON s.id = o.subject_id
        WHERE o.guardian_id = ?
        ORDER BY o.created_at DESC
        LIMIT 10`,
      args: [selectedId],
    },
    {
      sql: `SELECT
          a.id,
          a.region,
          a.status,
          a.amount,
          a.days,
          a.daily_rate,
          a.click_count,
          a.meta_campaign_id,
          a.meta_status,
          a.start_date,
          a.end_date,
          a.created_at,
          s.name AS subject_name
        FROM subject_ads a
        JOIN subjects s ON s.id = a.subject_id
        WHERE a.guardian_id = ?
        ORDER BY a.created_at DESC
      LIMIT 10`,
      args: [selectedId],
    },
    {
      sql: `SELECT id, title, body, url, read_at, created_at
        FROM guardian_notifications
        WHERE guardian_id = ?
        ORDER BY created_at DESC
        LIMIT 12`,
      args: [selectedId],
    },
  ]);

  return {
    summary,
    guardians,
    selectedGuardian: guardianResult.rows[0] || null,
    subjects: subjectsResult.rows,
    subscription: subscriptionResult.rows[0] || null,
    payments: paymentsResult.rows,
    ads: adsResult.rows,
    activities: activitiesResult.rows,
    filters: { query, status, type, startDate, endDate },
  };
}

export async function getAdminSubjectsData(selectedSubjectId = "", filters = {}) {
  await ensureSchema();
  const db = getDb();
  const query = String(filters.query || "").trim();
  const status = ["상품구매필요", "QR활성화필요", "안전", "찾는중"].includes(filters.status)
    ? filters.status
    : "all";
  const qr = ["active", "pending", "inactive", "unassigned"].includes(filters.qr) ? filters.qr : "all";
  const subscription = ["active", "paused", "none"].includes(filters.subscription) ? filters.subscription : "all";
  const startDate = normalizeDateInput(filters.startDate);
  const endDate = normalizeDateInput(filters.endDate);
  const guardianId = String(filters.guardianId || "").trim();
  const clauses = [];
  const args = [];

  if (query) {
    const pattern = `%${query}%`;
    clauses.push("(COALESCE(s.name, '') LIKE ? OR COALESCE(g.name, '') LIKE ? OR COALESCE(g.phone, '') LIKE ?)");
    args.push(pattern, pattern, pattern);
  }
  if (status !== "all") {
    clauses.push("s.status = ?");
    args.push(status);
  }
  if (guardianId) {
    clauses.push("s.guardian_id = ?");
    args.push(guardianId);
  }
  if (qr === "active") clauses.push("q.is_active = 1 AND q.activated_at IS NOT NULL");
  if (qr === "pending") clauses.push("q.is_active = 1 AND q.activated_at IS NULL");
  if (qr === "inactive") clauses.push("q.id IS NOT NULL AND q.is_active = 0");
  if (qr === "unassigned") clauses.push("q.id IS NULL");
  if (subscription === "active") clauses.push("sub.status = 'active'");
  if (subscription === "paused") clauses.push("sub.status = 'paused'");
  if (subscription === "none") clauses.push("(sub.id IS NULL OR COALESCE(sub.status, '') NOT IN ('active', 'paused'))");
  if (startDate) {
    clauses.push("date(s.created_at, '+9 hours') >= date(?)");
    args.push(startDate);
  }
  if (endDate) {
    clauses.push("date(s.created_at, '+9 hours') <= date(?)");
    args.push(endDate);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const [summaryResult, subjectsResult] = await db.batch([
    {
      sql: `SELECT
          COUNT(*) AS total_subjects,
          SUM(CASE WHEN date(s.created_at, '+9 hours') = date('now', '+9 hours') THEN 1 ELSE 0 END) AS new_subjects_today,
          SUM(CASE WHEN date(s.created_at, '+9 hours') = date('now', '+9 hours', '-1 day') THEN 1 ELSE 0 END) AS new_subjects_yesterday,
          SUM(CASE WHEN s.status = '안전' THEN 1 ELSE 0 END) AS safe_subjects,
          SUM(CASE WHEN s.status = '상품구매필요' THEN 1 ELSE 0 END) AS purchase_needed_subjects,
          SUM(CASE WHEN s.status = 'QR활성화필요' THEN 1 ELSE 0 END) AS qr_needed_subjects,
          SUM(CASE WHEN s.status = '찾는중' THEN 1 ELSE 0 END) AS searching_subjects,
          SUM(CASE WHEN q.id IS NOT NULL AND q.is_active = 0 THEN 1 ELSE 0 END) AS inactive_qr_subjects,
          0 AS deleted_subjects
        FROM subjects s
        LEFT JOIN qr_codes q ON q.subject_id = s.id`,
      args: [],
    },
    {
      sql: `SELECT
        s.id,
        s.guardian_id,
        s.name,
        s.gender,
        s.birth_date,
        s.status,
        s.created_at,
        s.updated_at,
        g.name AS guardian_name,
        g.phone AS guardian_phone,
        sub.status AS subscription_status,
        q.id AS qr_id,
        q.code AS qr_code,
        q.public_key AS qr_public_key,
        q.is_active AS qr_is_active,
        q.activated_at AS qr_activated_at
      FROM subjects s
      JOIN guardians g ON g.id = s.guardian_id
      LEFT JOIN subscriptions sub ON sub.guardian_id = g.id
      LEFT JOIN qr_codes q ON q.subject_id = s.id
      ${where}
      ORDER BY s.created_at DESC, s.updated_at DESC
      LIMIT 300`,
      args,
    },
  ]);
  const summaryRow = summaryResult.rows[0] || {};
  const summary = {
    totalSubjects: Number(summaryRow.total_subjects || 0),
    newSubjectsToday: Number(summaryRow.new_subjects_today || 0),
    newSubjectsYesterday: Number(summaryRow.new_subjects_yesterday || 0),
    safeSubjects: Number(summaryRow.safe_subjects || 0),
    purchaseNeededSubjects: Number(summaryRow.purchase_needed_subjects || 0),
    qrNeededSubjects: Number(summaryRow.qr_needed_subjects || 0),
    searchingSubjects: Number(summaryRow.searching_subjects || 0),
    inactiveQrSubjects: Number(summaryRow.inactive_qr_subjects || 0),
    deletedSubjects: Number(summaryRow.deleted_subjects || 0),
  };
  const subjects = subjectsResult.rows;
  const selectedId = subjects.some((subject) => subject.id === selectedSubjectId)
    ? selectedSubjectId
    : subjects[0]?.id || "";
  if (!selectedId) {
    return {
      summary,
      subjects,
      selectedSubject: null,
      subscription: null,
      orders: [],
      ads: [],
      activities: [],
      filters: { query, status, qr, subscription, startDate, endDate, guardianId },
    };
  }

  const detailResult = await db.execute({
    sql: `SELECT
        s.*,
        CASE WHEN LENGTH(COALESCE(s.photo_data_url, '')) > 0 THEN 1 ELSE 0 END AS has_photo,
        g.name AS guardian_name,
        g.phone AS guardian_phone,
        g.email AS guardian_email,
        g.google_email AS guardian_google_email,
        g.address AS guardian_address,
        g.address_detail AS guardian_address_detail,
        g.login_id AS guardian_login_id,
        g.created_at AS guardian_created_at,
        g.is_active AS guardian_is_active,
        q.id AS qr_id,
        q.code AS qr_code,
        q.public_key AS qr_public_key,
        q.target_url AS qr_target_url_raw,
        q.is_active AS qr_is_active,
        q.activated_at AS qr_activated_at,
        q.updated_at AS qr_updated_at
      FROM subjects s
      JOIN guardians g ON g.id = s.guardian_id
      LEFT JOIN qr_codes q ON q.subject_id = s.id
      WHERE s.id = ?
      LIMIT 1`,
    args: [selectedId],
  });
  const selectedSubject = detailResult.rows[0] || null;
  let subscriptionRow = null;
  let orders = [];
  let ads = [];
  let activities = [];

  if (selectedSubject) {
    const notificationPattern = `%${selectedSubject.name || selectedSubject.qr_public_key || selectedSubject.id}%`;
    const [subscriptionResult, ordersResult, adsResult, notificationsResult] = await db.batch([
      {
        sql: `SELECT *
          FROM subscriptions
          WHERE guardian_id = ?
          LIMIT 1`,
        args: [selectedSubject.guardian_id],
      },
      {
        sql: `SELECT
            o.*,
            p.name AS product_name,
            p.slug AS product_slug
          FROM product_orders o
          LEFT JOIN products p ON p.id = o.product_id
          WHERE o.subject_id = ?
          ORDER BY o.created_at DESC
          LIMIT 50`,
        args: [selectedSubject.id],
      },
      {
        sql: `SELECT *
          FROM subject_ads
          WHERE subject_id = ?
          ORDER BY created_at DESC
          LIMIT 50`,
        args: [selectedSubject.id],
      },
      {
        sql: `SELECT id, title, body, url, created_at
          FROM guardian_notifications
          WHERE guardian_id = ?
            AND (
              COALESCE(title, '') LIKE ?
              OR COALESCE(body, '') LIKE ?
              OR COALESCE(url, '') LIKE ?
            )
          ORDER BY created_at DESC
          LIMIT 30`,
        args: [selectedSubject.guardian_id, notificationPattern, notificationPattern, notificationPattern],
      },
    ]);

    subscriptionRow = subscriptionResult.rows[0] || null;
    orders = ordersResult.rows;
    ads = adsResult.rows;
    activities = buildSubjectAdminActivities(selectedSubject, orders, ads, notificationsResult.rows);
  }

  return {
    summary,
    subjects,
    selectedSubject: selectedSubject
      ? {
          ...selectedSubject,
          photo_data_url: "",
          photo_url: Number(selectedSubject.has_photo || 0) === 1
            ? getSubjectPhotoUrl(selectedSubject.id, selectedSubject.updated_at)
            : "",
          qr_target_url: selectedSubject.qr_public_key ? getFindUrl(selectedSubject.qr_public_key) : "",
        }
      : null,
    subscription: subscriptionRow,
    orders,
    ads,
    activities,
    filters: { query, status, qr, subscription, startDate, endDate, guardianId },
  };
}

function buildSubjectAdminActivities(subject, orders = [], ads = [], notifications = []) {
  const items = [];
  if (subject?.created_at) {
    items.push({
      id: `${subject.id}-created`,
      at: subject.created_at,
      title: "대상자 등록",
      body: `${subject.name || "관리대상"} 정보가 등록되었습니다.`,
    });
  }
  if (subject?.updated_at && subject.updated_at !== subject.created_at) {
    items.push({
      id: `${subject.id}-updated`,
      at: subject.updated_at,
      title: "대상자 정보 수정",
      body: `${subject.name || "관리대상"} 정보가 수정되었습니다.`,
    });
  }
  if (subject?.qr_activated_at) {
    items.push({
      id: `${subject.qr_id}-activated`,
      at: subject.qr_activated_at,
      title: "QR 활성화 완료",
      body: `${subject.qr_code || "QR"} 코드가 활성화되었습니다.`,
    });
  } else if (subject?.qr_id) {
    items.push({
      id: `${subject.qr_id}-assigned`,
      at: subject.qr_updated_at || subject.updated_at || subject.created_at,
      title: "QR 매칭",
      body: `${subject.qr_code || "QR"} 코드가 매칭되었습니다.`,
    });
  }
  for (const order of orders) {
    items.push({
      id: `${order.id}-order`,
      at: order.created_at,
      title: "상품/구독 주문",
      body: `${order.product_name || "상품"} ${Number(order.quantity || 1)}개 주문이 생성되었습니다.`,
    });
    if (order.paid_at) {
      items.push({
        id: `${order.id}-paid`,
        at: order.paid_at,
        title: "결제 완료",
        body: `${order.product_name || "상품"} 결제가 완료되었습니다.`,
      });
    }
  }
  for (const ad of ads) {
    items.push({
      id: `${ad.id}-ad`,
      at: ad.created_at,
      title: "광고 등록",
      body: `${ad.region || "광고지역 미입력"} 광고가 ${ad.status || "상태 미확인"} 상태로 등록되었습니다.`,
    });
  }
  for (const notification of notifications) {
    items.push({
      id: `${notification.id}-notification`,
      at: notification.created_at,
      title: notification.title || "보호자 알림",
      body: notification.body || "",
    });
  }
  return items
    .filter((item) => item.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 60);
}

export async function getAdminDashboardData(requestedMonth = "") {
  await ensureSchema();
  const db = getDb();
  const month = normalizeAdminMonth(requestedMonth);
  const previousMonth = getRelativeMonth(month, -1);
  const last30Start = getRelativeKstDateKey(-29);
  const paidStatuses = "'paid', 'paid_waiting_activation', 'activated'";
  const [
    countsResult,
    growthResult,
    revenueResult,
    adRevenueResult,
    orderStatusResult,
    adStatusResult,
    subscriptionStatusResult,
    riskResult,
    orderTrendResult,
    adTrendResult,
    locationTrendResult,
    recentGuardiansResult,
    recentOrdersResult,
    recentNotificationsResult,
    pendingQrResult,
    missingReportsResult,
    recentInquiriesResult,
    recentMissingAdsResult,
  ] = await db.batch([
    {
      sql: `SELECT
        (SELECT COUNT(*) FROM guardians) AS total_guardians,
        (SELECT COUNT(*) FROM subjects) AS total_subjects,
        (SELECT COUNT(*) FROM qr_codes) AS total_qr_count,
        (SELECT COUNT(*) FROM qr_codes WHERE is_active = 1 AND activated_at IS NOT NULL) AS active_qr_count,
        (SELECT COUNT(*) FROM qr_codes WHERE activated_at IS NULL OR is_active = 0) AS inactive_qr_count,
        (SELECT COUNT(*) FROM subjects WHERE status = '찾는중') AS missing_report_count,
        (SELECT COUNT(*) FROM subject_ads WHERE status = 'active') AS active_ad_count,
        (SELECT COUNT(*) FROM subject_ads WHERE lower(COALESCE(meta_status, '')) LIKE '%reject%') AS ad_rejected_count`,
      args: [],
    },
    {
      sql: `SELECT
        SUM(CASE WHEN date(g.created_at, '+9 hours') = date('now', '+9 hours') THEN 1 ELSE 0 END) AS today_guardians,
        SUM(CASE WHEN date(g.created_at, '+9 hours') = date('now', '+9 hours', '-1 day') THEN 1 ELSE 0 END) AS yesterday_guardians,
        (SELECT SUM(CASE WHEN date(s.created_at, '+9 hours') = date('now', '+9 hours') THEN 1 ELSE 0 END) FROM subjects s) AS today_subjects,
        (SELECT SUM(CASE WHEN date(s.created_at, '+9 hours') = date('now', '+9 hours', '-1 day') THEN 1 ELSE 0 END) FROM subjects s) AS yesterday_subjects
      FROM guardians g`,
      args: [],
    },
    {
      sql: `SELECT
        COALESCE(SUM(CASE WHEN order_type = 'standalone' AND strftime('%Y-%m', paid_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS product_revenue,
        COALESCE(SUM(CASE WHEN order_type = 'subscription' AND strftime('%Y-%m', paid_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS subscription_revenue,
        COALESCE(SUM(CASE WHEN date(paid_at, '+9 hours') = date('now', '+9 hours') THEN amount ELSE 0 END), 0) AS today_revenue,
        COALESCE(SUM(CASE WHEN date(paid_at, '+9 hours') = date('now', '+9 hours', '-1 day') THEN amount ELSE 0 END), 0) AS yesterday_revenue,
        COALESCE(SUM(CASE WHEN strftime('%Y-%m', paid_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS previous_month_revenue,
        COALESCE(SUM(CASE WHEN status IN ('failed', 'cancelled') AND strftime('%Y-%m', updated_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS refund_amount
      FROM product_orders
      WHERE (status IN (${paidStatuses}) AND paid_at IS NOT NULL)
        OR status IN ('failed', 'cancelled')`,
      args: [month, month, previousMonth, month],
    },
    {
      sql: `SELECT
        COALESCE(SUM(CASE WHEN strftime('%Y-%m', created_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS ad_revenue,
        COALESCE(SUM(CASE WHEN date(created_at, '+9 hours') = date('now', '+9 hours') THEN amount ELSE 0 END), 0) AS today_ad_revenue,
        COALESCE(SUM(CASE WHEN date(created_at, '+9 hours') = date('now', '+9 hours', '-1 day') THEN amount ELSE 0 END), 0) AS yesterday_ad_revenue,
        COALESCE(SUM(CASE WHEN strftime('%Y-%m', created_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS previous_month_ad_revenue
      FROM subject_ads`,
      args: [month, previousMonth],
    },
    {
      sql: `SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN date(created_at, '+9 hours') = date('now', '+9 hours') THEN 1 ELSE 0 END) AS new_orders,
        SUM(CASE WHEN fulfillment_status = 'preparing' THEN 1 ELSE 0 END) AS preparing,
        SUM(CASE WHEN fulfillment_status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
        SUM(CASE WHEN fulfillment_status = 'delivered' THEN 1 ELSE 0 END) AS delivered
      FROM product_orders`,
      args: [],
    },
    {
      sql: `SELECT
        COUNT(*) AS total_ads,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS ready,
        SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) AS paused,
        SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) AS ended,
        SUM(CASE WHEN lower(COALESCE(meta_status, '')) LIKE '%reject%' THEN 1 ELSE 0 END) AS rejected
      FROM subject_ads`,
      args: [],
    },
    {
      sql: `SELECT
        COUNT(*) AS total_subscriptions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS ready,
        SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) AS paused,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS expired,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
      FROM subscriptions`,
      args: [],
    },
    {
      sql: `SELECT
        (SELECT COUNT(*)
          FROM qr_codes q
          JOIN subjects s ON s.id = q.subject_id
          WHERE q.is_active = 1
            AND q.activated_at IS NULL
            AND julianday('now') - julianday(COALESCE(q.updated_at, s.updated_at, q.created_at)) >= 10
        ) AS qr_pending_over_10,
        (SELECT COUNT(*)
          FROM product_orders
          WHERE fulfillment_status = 'preparing'
            AND julianday('now') - julianday(COALESCE(paid_at, updated_at, created_at)) >= 2
        ) AS shipping_waiting_over_2,
        (SELECT COUNT(*)
          FROM subscriptions
          WHERE status = 'active'
            AND current_period_end IS NOT NULL
            AND date(current_period_end, '+9 hours') BETWEEN date('now', '+9 hours') AND date('now', '+9 hours', '+7 day')
        ) AS subscription_expiring_7,
        (SELECT COUNT(*)
          FROM subject_ads
          WHERE (status = 'ready' OR lower(COALESCE(meta_status, '')) IN ('pending', 'review', 'in_review'))
            AND julianday('now') - julianday(created_at) >= 1
        ) AS ad_review_over_1,
        (SELECT COUNT(*)
          FROM product_orders
          WHERE status IN ('failed', 'cancelled')
            AND julianday('now') - julianday(updated_at) >= 1
        ) AS refund_waiting_over_1`,
      args: [],
    },
    {
      sql: `SELECT
        date(paid_at, '+9 hours') AS day,
        COALESCE(SUM(amount), 0) AS revenue,
        COUNT(*) AS orders
      FROM product_orders
      WHERE status IN (${paidStatuses})
        AND paid_at IS NOT NULL
        AND date(paid_at, '+9 hours') >= date(?)
      GROUP BY date(paid_at, '+9 hours')`,
      args: [last30Start],
    },
    {
      sql: `SELECT
        date(created_at, '+9 hours') AS day,
        COALESCE(SUM(amount), 0) AS ad_revenue,
        COUNT(*) AS ads
      FROM subject_ads
      WHERE date(created_at, '+9 hours') >= date(?)
      GROUP BY date(created_at, '+9 hours')`,
      args: [last30Start],
    },
    {
      sql: `SELECT
        date(created_at, '+9 hours') AS day,
        COUNT(*) AS shares
      FROM location_shares
      WHERE date(created_at, '+9 hours') >= date(?)
      GROUP BY date(created_at, '+9 hours')`,
      args: [last30Start],
    },
    {
      sql: `SELECT id, name, login_id, phone, email, google_email, birth_date, created_at
        FROM guardians
        ORDER BY created_at DESC
        LIMIT 4`,
      args: [],
    },
    {
      sql: `SELECT
          o.id,
          o.toss_order_id,
          o.amount,
          o.created_at,
          p.name AS product_name,
          s.name AS subject_name,
          g.name AS guardian_name
        FROM product_orders o
        JOIN products p ON p.id = o.product_id
        JOIN guardians g ON g.id = o.guardian_id
        LEFT JOIN subjects s ON s.id = o.subject_id
        ORDER BY o.created_at DESC
        LIMIT 4`,
      args: [],
    },
    {
      sql: `SELECT
          n.id,
          n.title,
          n.body,
          n.created_at,
          COALESCE(g.name, g.email, g.google_email) AS guardian_name
        FROM guardian_notifications n
        LEFT JOIN guardians g ON g.id = n.guardian_id
        ORDER BY n.created_at DESC
        LIMIT 4`,
      args: [],
    },
    {
      sql: `SELECT
          q.id,
          s.name AS subject_name,
          COALESCE(o.paid_at, q.updated_at, s.updated_at) AS requested_at
        FROM qr_codes q
        JOIN subjects s ON s.id = q.subject_id
        LEFT JOIN product_orders o ON o.id = (
          SELECT po.id
          FROM product_orders po
          WHERE po.subject_id = s.id
            AND po.status IN (${paidStatuses})
          ORDER BY COALESCE(po.paid_at, po.updated_at) DESC
          LIMIT 1
        )
        WHERE q.is_active = 1
          AND q.activated_at IS NULL
          AND s.status = 'QR활성화필요'
        ORDER BY COALESCE(o.paid_at, q.updated_at, s.updated_at) DESC
        LIMIT 4`,
      args: [],
    },
    {
      sql: `SELECT
          s.id,
          s.name,
          s.updated_at AS reported_at,
          g.name AS guardian_name
        FROM subjects s
        JOIN guardians g ON g.id = s.guardian_id
        WHERE s.status = '찾는중'
        ORDER BY s.updated_at DESC
        LIMIT 4`,
      args: [],
    },
    {
      sql: `SELECT id, title, created_at
        FROM customer_inquiries
        ORDER BY created_at DESC
        LIMIT 4`,
      args: [],
    },
    {
      sql: `SELECT
          a.id,
          a.region,
          a.status,
          a.start_date,
          a.end_date,
          a.click_count,
          a.created_at,
          s.name AS subject_name,
          s.birth_date AS subject_birth_date,
          g.name AS guardian_name,
          g.phone AS guardian_phone
        FROM subject_ads a
        JOIN subjects s ON s.id = a.subject_id
        JOIN guardians g ON g.id = a.guardian_id
        ORDER BY a.created_at DESC
        LIMIT 4`,
      args: [],
    },
  ]);

  const counts = countsResult.rows[0] || {};
  const growth = growthResult.rows[0] || {};
  const revenue = revenueResult.rows[0] || {};
  const adRevenue = adRevenueResult.rows[0] || {};
  const orderStatus = orderStatusResult.rows[0] || {};
  const adStatus = adStatusResult.rows[0] || {};
  const subscriptionStatus = subscriptionStatusResult.rows[0] || {};
  const risks = riskResult.rows[0] || {};
  const productRevenue = Number(revenue.product_revenue || 0);
  const subscriptionRevenue = Number(revenue.subscription_revenue || 0);
  const advertisingRevenue = Number(adRevenue.ad_revenue || 0);
  const refundAmount = Number(revenue.refund_amount || 0);
  const todayRevenue = Number(revenue.today_revenue || 0) + Number(adRevenue.today_ad_revenue || 0);
  const yesterdayRevenue = Number(revenue.yesterday_revenue || 0) + Number(adRevenue.yesterday_ad_revenue || 0);
  const previousMonthRevenue = Number(revenue.previous_month_revenue || 0) + Number(adRevenue.previous_month_ad_revenue || 0);
  const monthlyRevenue = productRevenue + subscriptionRevenue + advertisingRevenue;

  return {
    month,
    totalGuardians: Number(counts.total_guardians || 0),
    totalSubjects: Number(counts.total_subjects || 0),
    totalQrCount: Number(counts.total_qr_count || 0),
    activeQrCount: Number(counts.active_qr_count || 0),
    inactiveQrCount: Number(counts.inactive_qr_count || 0),
    missingReportCount: Number(counts.missing_report_count || 0),
    activeAdCount: Number(counts.active_ad_count || 0),
    adRejectedCount: Number(counts.ad_rejected_count || 0),
    newGuardiansToday: Number(growth.today_guardians || 0),
    newGuardiansYesterday: Number(growth.yesterday_guardians || 0),
    newSubjectsToday: Number(growth.today_subjects || 0),
    newSubjectsYesterday: Number(growth.yesterday_subjects || 0),
    todayRevenue,
    yesterdayRevenue,
    previousMonthRevenue,
    productRevenue,
    subscriptionRevenue,
    advertisingRevenue,
    refundAmount,
    netRevenue: monthlyRevenue - refundAmount,
    monthlyRevenue,
    orderStatus: {
      total: Number(orderStatus.total_orders || 0),
      newOrders: Number(orderStatus.new_orders || 0),
      preparing: Number(orderStatus.preparing || 0),
      shipped: Number(orderStatus.shipped || 0),
      delivered: Number(orderStatus.delivered || 0),
    },
    adStatus: {
      total: Number(adStatus.total_ads || 0),
      active: Number(adStatus.active || 0),
      ready: Number(adStatus.ready || 0),
      paused: Number(adStatus.paused || 0),
      ended: Number(adStatus.ended || 0),
      rejected: Number(adStatus.rejected || 0),
    },
    subscriptionStatus: {
      total: Number(subscriptionStatus.total_subscriptions || 0),
      active: Number(subscriptionStatus.active || 0),
      ready: Number(subscriptionStatus.ready || 0),
      paused: Number(subscriptionStatus.paused || 0),
      expired: Number(subscriptionStatus.expired || 0),
      cancelled: Number(subscriptionStatus.cancelled || 0),
    },
    risks: {
      qrPendingOver10: Number(risks.qr_pending_over_10 || 0),
      shippingWaitingOver2: Number(risks.shipping_waiting_over_2 || 0),
      subscriptionExpiring7: Number(risks.subscription_expiring_7 || 0),
      adReviewOver1: Number(risks.ad_review_over_1 || 0),
      refundWaitingOver1: Number(risks.refund_waiting_over_1 || 0),
    },
    dailyTrend: buildAdminDailyTrend(orderTrendResult.rows, adTrendResult.rows, locationTrendResult.rows),
    recentGuardians: recentGuardiansResult.rows,
    recentOrders: recentOrdersResult.rows,
    recentNotifications: recentNotificationsResult.rows,
    pendingQrActivations: pendingQrResult.rows,
    missingReports: missingReportsResult.rows,
    recentInquiries: recentInquiriesResult.rows,
    recentMissingAds: recentMissingAdsResult.rows,
  };
}

export async function getAdminMissingReportsData(filters = {}) {
  await ensureSchema();
  const db = getDb();
  const query = String(filters.query || "").trim();
  const startDate = normalizeDateInput(filters.startDate);
  const endDate = normalizeDateInput(filters.endDate);
  const reportedAtExpr = "COALESCE(CASE WHEN s.status = '찾는중' THEN s.updated_at END, a.created_at, s.updated_at)";
  const clauses = ["(s.status = '찾는중' OR a.id IS NOT NULL)"];
  const args = [];

  if (query) {
    const pattern = `%${query}%`;
    clauses.push(`(
      COALESCE(s.name, '') LIKE ? OR
      COALESCE(g.name, '') LIKE ? OR
      COALESCE(g.phone, '') LIKE ? OR
      COALESCE(NULLIF(g.email, ''), g.google_email, '') LIKE ?
    )`);
    args.push(pattern, pattern, pattern, pattern);
  }
  if (startDate) {
    clauses.push(`date(${reportedAtExpr}, '+9 hours') >= date(?)`);
    args.push(startDate);
  }
  if (endDate) {
    clauses.push(`date(${reportedAtExpr}, '+9 hours') <= date(?)`);
    args.push(endDate);
  }

  const result = await db.execute({
    sql: `SELECT
        s.id AS subject_id,
        s.name AS subject_name,
        s.status AS subject_status,
        s.updated_at AS subject_updated_at,
        g.id AS guardian_id,
        g.name AS guardian_name,
        g.email AS guardian_email,
        g.google_email AS guardian_google_email,
        g.phone AS guardian_phone,
        a.id AS ad_id,
        a.status AS ad_status,
        a.region AS ad_region,
        a.start_date AS ad_start_date,
        a.end_date AS ad_end_date,
        a.amount AS ad_amount,
        a.click_count AS ad_click_count,
        a.created_at AS ad_created_at,
        a.updated_at AS ad_updated_at,
        ${reportedAtExpr} AS reported_at
      FROM subjects s
      JOIN guardians g ON g.id = s.guardian_id
      LEFT JOIN subject_ads a ON a.id = (
        SELECT sa.id
        FROM subject_ads sa
        WHERE sa.subject_id = s.id
        ORDER BY sa.created_at DESC, sa.updated_at DESC
        LIMIT 1
      )
      WHERE ${clauses.join(" AND ")}
      ORDER BY datetime(${reportedAtExpr}) DESC
      LIMIT 200`,
    args,
  });

  return {
    reports: result.rows,
    filters: { query, startDate, endDate },
  };
}

export async function getAdminLocationSharesData(filters = {}, selectedShareId = "") {
  await ensureSchema();
  const db = getDb();
  const query = String(filters.query || "").trim();
  const startDate = normalizeDateInput(filters.startDate);
  const endDate = normalizeDateInput(filters.endDate);
  const clauses = [];
  const args = [];

  if (query) {
    const pattern = `%${query}%`;
    clauses.push(`(
      COALESCE(ls.subject_name, s.name, '') LIKE ? OR
      COALESCE(ls.guardian_name, g.name, '') LIKE ? OR
      COALESCE(ls.finder_contact, '') LIKE ? OR
      COALESCE(ls.address_label, '') LIKE ?
    )`);
    args.push(pattern, pattern, pattern, pattern);
  }
  if (startDate) {
    clauses.push("date(ls.created_at, '+9 hours') >= date(?)");
    args.push(startDate);
  }
  if (endDate) {
    clauses.push("date(ls.created_at, '+9 hours') <= date(?)");
    args.push(endDate);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await db.execute({
    sql: `SELECT
        ls.*,
        COALESCE(ls.subject_name, s.name) AS subject_display_name,
        COALESCE(ls.guardian_name, g.name, g.email, g.google_email) AS guardian_display_name
      FROM location_shares ls
      LEFT JOIN subjects s ON s.id = ls.subject_id
      LEFT JOIN guardians g ON g.id = ls.guardian_id
      ${where}
      ORDER BY ls.created_at DESC
      LIMIT 200`,
    args,
  });
  const shares = result.rows;
  const selectedShare = shares.find((share) => share.id === selectedShareId) || shares[0] || null;

  return {
    shares,
    selectedShare,
    filters: { query, startDate, endDate },
  };
}

export async function getAdminInquiriesData() {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT
        i.*,
        COALESCE(NULLIF(g.name, ''), NULLIF(g.login_id, ''), NULLIF(g.email, ''), g.google_email) AS guardian_name
      FROM customer_inquiries i
      LEFT JOIN guardians g ON g.id = i.guardian_id
      ORDER BY i.created_at DESC
      LIMIT 100`,
    args: [],
  });

  return { inquiries: result.rows };
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

export async function setGuardianAdminMemo(formData) {
  await ensureSchema();
  const db = getDb();
  const guardianId = getText(formData, "guardianId");
  const adminMemo = getText(formData, "adminMemo");
  if (!guardianId) throw new Error("보호자 정보를 찾을 수 없습니다.");
  if (adminMemo.length > 2000) throw new Error("관리 메모는 2,000자 이하로 입력해 주세요.");

  await db.execute({
    sql: "UPDATE guardians SET admin_memo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [adminMemo, guardianId],
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

export function getSubjectPhotoUrl(subjectId, updatedAt = "") {
  const version = encodeURIComponent(String(updatedAt || "1"));
  return `/api/subjects/${encodeURIComponent(subjectId)}/photo?v=${version}`;
}

export async function getSubjectPhotoData(session, subjectId, allowAdmin = false) {
  await ensureSchema();
  const db = getDb();
  const id = String(subjectId || "").trim();
  const googleId = getGuardianKey(session);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!id || (!googleId && !email)) return null;

  const result = await db.execute({
    sql: `SELECT
        s.photo_data_url,
        s.photo_name,
        s.updated_at
      FROM subjects s
      JOIN guardians g ON g.id = s.guardian_id
      WHERE s.id = ?
        AND (
          ? = 1
          OR g.google_id = ?
          OR lower(COALESCE(g.google_email, '')) = ?
          OR lower(COALESCE(g.email, '')) = ?
        )
      LIMIT 1`,
    args: [id, allowAdmin ? 1 : 0, googleId, email, email],
  });

  return result.rows[0] || null;
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
  const statusFilter = ["in_use", "unused", "discarded"].includes(filters.status) ? filters.status : "all";
  const query = String(filters.query || "").trim();
  const startDate = normalizeDateInput(filters.startDate);
  const endDate = normalizeDateInput(filters.endDate);
  const selectedQrId = String(filters.selectedQr || "").trim();
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
        q.activated_at,
        q.lifecycle_status,
        q.discarded_at,
        q.admin_memo,
        q.created_at,
        q.updated_at,
        s.name AS subject_name,
        s.birth_date AS subject_birth_date,
        s.gender AS subject_gender,
        s.status AS subject_status,
        s.created_at AS subject_created_at,
        g.name AS guardian_name,
        g.phone AS guardian_phone,
        g.safe_phone AS guardian_safe_phone,
        g.email AS guardian_email,
        g.google_email AS guardian_google_email,
        sub.status AS subscription_status,
        sub.current_period_start AS subscription_started_at,
        sub.current_period_end AS subscription_ends_at
      FROM qr_codes q
      LEFT JOIN subjects s ON s.id = q.subject_id
      LEFT JOIN guardians g ON g.id = q.guardian_id
      LEFT JOIN subscriptions sub ON sub.guardian_id = q.guardian_id
      ORDER BY q.created_at DESC, q.code ASC`,
    args: [],
  });
  const matchCandidates = assignQrId
    ? await searchUnmatchedSubjectsForQr(db, { guardianQuery, subjectQuery })
    : { rows: [] };

  const allQrCodes = codes.rows.map((row) => ({
    ...row,
    lifecycle_status: normalizeQrLifecycleStatus(row),
    target_url: getFindUrl(row.public_key),
  }));
  const filteredQrCodes = allQrCodes.filter((row) => {
    const queryTarget = [
      row.code,
      row.public_key,
      row.subject_name,
      row.subject_gender,
      row.guardian_name,
      row.guardian_phone,
      row.guardian_email,
      row.guardian_google_email,
    ].join(" ").toLowerCase();
    const queryOk = query ? queryTarget.includes(query.toLowerCase()) : true;
    const matchOk =
      matchFilter === "matched" ? Boolean(row.subject_id) : matchFilter === "unmatched" ? !row.subject_id : true;
    const activeOk =
      activeFilter === "active" ? Number(row.is_active) === 1 : activeFilter === "inactive" ? Number(row.is_active) === 0 : true;
    const statusOk = statusFilter === "all" ? true : row.lifecycle_status === statusFilter;
    const activatedDate = normalizeDateInput(row.activated_at);
    const startOk = startDate ? activatedDate && activatedDate >= startDate : true;
    const endOk = endDate ? activatedDate && activatedDate <= endDate : true;
    return queryOk && matchOk && activeOk && statusOk && startOk && endOk;
  });
  const explicitSelectedQr = selectedQrId || assignQrId;
  const selectedQr = explicitSelectedQr
    ? allQrCodes.find((row) => row.id === explicitSelectedQr) || null
    : filteredQrCodes[0] || null;
  const qrActivities = selectedQr ? buildQrAdminActivities(selectedQr) : [];
  const total = allQrCodes.length;
  const inUseCount = allQrCodes.filter((row) => row.lifecycle_status === "in_use").length;
  const unusedCount = allQrCodes.filter((row) => row.lifecycle_status === "unused").length;
  const discardedCount = allQrCodes.filter((row) => row.lifecycle_status === "discarded").length;
  const activeCount = allQrCodes.filter((row) => Number(row.is_active || 0) === 1).length;
  const inactiveCount = Math.max(0, total - activeCount);
  const matchedCount = allQrCodes.filter((row) => Boolean(row.subject_id)).length;
  const unmatchedCount = Math.max(0, total - matchedCount);

  return {
    qrCodes: filteredQrCodes,
    selectedQr,
    selectedQrActivities: qrActivities,
    matchCandidates: matchCandidates.rows,
    matchSearch: {
      qrId: assignQrId,
      guardianQuery,
      subjectQuery,
    },
    filters: {
      query,
      status: statusFilter,
      match: matchFilter,
      active: activeFilter,
      startDate,
      endDate,
    },
    total,
    inUseCount,
    unusedCount,
    discardedCount,
    activeCount,
    inactiveCount,
    matchedCount,
    unmatchedCount,
    filteredCount: filteredQrCodes.length,
  };
}

function normalizeQrLifecycleStatus(row) {
  const status = String(row?.lifecycle_status || "").trim();
  if (status === "discarded") return "discarded";
  if (status === "in_use" || row?.subject_id) return "in_use";
  return "unused";
}

function buildQrAdminActivities(qr) {
  const items = [];
  if (qr.created_at) {
    items.push({
      id: `${qr.id}-created`,
      at: qr.created_at,
      title: "QR 생성",
      body: `${qr.code || "QR"} 코드가 생성되었습니다.`,
    });
  }
  if (qr.subject_id) {
    items.push({
      id: `${qr.id}-matched`,
      at: qr.updated_at || qr.subject_created_at || qr.created_at,
      title: "대상자 매칭",
      body: `${qr.subject_name || "관리대상"} 대상자와 연결되었습니다.`,
    });
  }
  if (qr.activated_at) {
    items.push({
      id: `${qr.id}-activated`,
      at: qr.activated_at,
      title: "QR 활성화",
      body: `${qr.subject_name || "관리대상"} QR 서비스가 활성화되었습니다.`,
    });
  }
  if (qr.discarded_at) {
    items.push({
      id: `${qr.id}-discarded`,
      at: qr.discarded_at,
      title: "QR 폐기",
      body: "관리자가 QR을 폐기 처리했습니다.",
    });
  }
  if (qr.updated_at && qr.updated_at !== qr.created_at) {
    items.push({
      id: `${qr.id}-updated`,
      at: qr.updated_at,
      title: "QR 정보 수정",
      body: "QR 상태 또는 매칭 정보가 변경되었습니다.",
    });
  }
  return items
    .filter((item) => item.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 40);
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
    sql: `UPDATE qr_codes
      SET is_active = ?,
          lifecycle_status = CASE WHEN lifecycle_status = 'discarded' THEN 'discarded' ELSE lifecycle_status END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    args: [active, qrId],
  });
}

export async function setQrLifecycle(formData) {
  await ensureSchema();
  const db = getDb();
  const qrId = getText(formData, "qrId");
  const lifecycle = getText(formData, "lifecycleStatus");
  if (!qrId) throw new Error("qrId is required.");
  if (!["unused", "discarded"].includes(lifecycle)) throw new Error("지원하지 않는 QR 상태입니다.");

  if (lifecycle === "discarded") {
    await db.execute({
      sql: `UPDATE qr_codes
        SET lifecycle_status = 'discarded',
            is_active = 0,
            guardian_id = NULL,
            subject_id = NULL,
            discarded_at = COALESCE(discarded_at, CURRENT_TIMESTAMP),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      args: [qrId],
    });
    return;
  }

  await db.execute({
    sql: `UPDATE qr_codes
      SET lifecycle_status = CASE WHEN subject_id IS NOT NULL THEN 'in_use' ELSE 'unused' END,
          discarded_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    args: [qrId],
  });
}

export async function setQrAdminMemo(formData) {
  await ensureSchema();
  const db = getDb();
  const qrId = getText(formData, "qrId");
  const adminMemo = getText(formData, "adminMemo");
  if (!qrId) throw new Error("QR 정보를 찾을 수 없습니다.");
  if (adminMemo.length > 2000) throw new Error("관리 메모는 2,000자 이하로 입력해 주세요.");

  await db.execute({
    sql: "UPDATE qr_codes SET admin_memo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [adminMemo, qrId],
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
      sql: `UPDATE qr_codes
        SET guardian_id = NULL,
            subject_id = NULL,
            lifecycle_status = CASE WHEN lifecycle_status = 'discarded' THEN 'discarded' ELSE 'unused' END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
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
      sql: `UPDATE qr_codes
        SET guardian_id = NULL,
            subject_id = NULL,
            lifecycle_status = CASE WHEN lifecycle_status = 'discarded' THEN 'discarded' ELSE 'unused' END,
            updated_at = CURRENT_TIMESTAMP
        WHERE subject_id = ? AND id <> ?`,
      args: [subjectId, qrId],
    },
    {
      sql: `UPDATE qr_codes
        SET guardian_id = ?,
            subject_id = ?,
            lifecycle_status = 'in_use',
            discarded_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
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

  const subscription = result.rows[0] || null;
  return subscription ? normalizeSubscriptionExpiry(db, subscription) : null;
}

export async function pauseSubscriptionForGuardian(session) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());

  const result = await db.execute({
    sql: `UPDATE subscriptions
      SET status = 'paused',
        paused_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE guardian_id = ? AND status = 'active'`,
    args: [guardian.id],
  });
  if (Number(result.rowsAffected || 0) !== 1) {
    throw new Error("일시정지할 이용권이 없습니다.");
  }
}

export async function resumeSubscriptionForGuardian(session) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());

  const result = await db.execute({
    sql: `SELECT id, paused_at, current_period_end
      FROM subscriptions
      WHERE guardian_id = ? AND status = 'paused'
      LIMIT 1`,
    args: [guardian.id],
  });
  const subscription = result.rows[0];
  if (!subscription) throw new Error("재개할 이용권이 없습니다.");

  const now = new Date();
  const pausedAt = parseStoredDate(subscription.paused_at) || now;
  const currentEnd = parseStoredDate(subscription.current_period_end);
  if (!currentEnd) throw new Error("이용권 만료일을 확인할 수 없습니다.");
  const pausedDuration = Math.max(0, now.getTime() - pausedAt.getTime());
  const extendedEnd = new Date(currentEnd.getTime() + pausedDuration);

  await db.execute({
    sql: `UPDATE subscriptions
      SET status = 'active',
        current_period_end = ?,
        paused_at = NULL,
        resumed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE guardian_id = ? AND status = 'paused'`,
    args: [extendedEnd.toISOString(), guardian.id],
  });
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

export async function getAdminSubscriptionsData(filters = {}, selectedSubscriptionId = "") {
  await ensureSchema();
  const db = getDb();
  const query = String(filters.query || "").trim();
  const plan = ["1", "3", "6"].includes(String(filters.plan || "")) ? String(filters.plan) : "all";
  const status = ["active", "ready", "paused", "expired", "cancelled"].includes(filters.status) ? filters.status : "all";
  const payment = ["paid", "pending", "failed"].includes(filters.payment) ? filters.payment : "all";
  const startDate = String(filters.startDate || "").trim();
  const endDate = String(filters.endDate || "").trim();
  const clauses = [];
  const args = [];

  await db.execute(`UPDATE subscriptions
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'active'
      AND current_period_end IS NOT NULL
      AND datetime(current_period_end) <= datetime('now')`);

  if (query) {
    const pattern = `%${query}%`;
    clauses.push(`(
      subscription_id LIKE ? OR
      latest_order_number LIKE ? OR
      guardian_name LIKE ? OR
      guardian_phone LIKE ? OR
      guardian_email LIKE ? OR
      subject_name LIKE ?
    )`);
    args.push(pattern, pattern, pattern, pattern, pattern, pattern);
  }
  if (plan !== "all") {
    clauses.push("plan_months = ?");
    args.push(Number(plan));
  }
  if (status !== "all") {
    clauses.push("status = ?");
    args.push(status);
  }
  if (payment === "paid") clauses.push("latest_order_status IN ('paid', 'paid_waiting_activation', 'activated')");
  if (payment === "pending") clauses.push("latest_order_status IN ('draft', 'payment_pending', 'subscription_pending', 'subscription_processing')");
  if (payment === "failed") clauses.push("latest_order_status IN ('failed', 'cancelled')");
  if (startDate) {
    clauses.push("DATE(COALESCE(current_period_start, created_at)) >= DATE(?)");
    args.push(startDate);
  }
  if (endDate) {
    clauses.push("DATE(COALESCE(current_period_start, created_at)) <= DATE(?)");
    args.push(endDate);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const subscriptionRowsSql = `WITH latest_orders AS (
      SELECT
        o.*,
        COALESCE(NULLIF(o.toss_order_id, ''), o.id) AS latest_order_number,
        p.name AS product_name,
        s.name AS subject_name,
        s.birth_date AS subject_birth_date,
        s.gender AS subject_gender,
        s.photo_data_url AS subject_photo_data_url,
        ROW_NUMBER() OVER (
          PARTITION BY o.guardian_id
          ORDER BY datetime(COALESCE(o.paid_at, o.updated_at, o.created_at)) DESC
        ) AS rn
      FROM product_orders o
      JOIN products p ON p.id = o.product_id
      LEFT JOIN subjects s ON s.id = o.subject_id
      WHERE o.order_type = 'subscription'
    ),
    subscription_rows AS (
      SELECT
        sub.id AS subscription_id,
        sub.guardian_id,
        sub.customer_key,
        sub.status,
        sub.plan_name,
        sub.plan_months,
        sub.amount,
        sub.currency,
        sub.current_period_start,
        sub.current_period_end,
        sub.paused_at,
        sub.resumed_at,
        sub.last_order_id,
        sub.last_payment_status,
        sub.admin_memo,
        sub.created_at,
        sub.updated_at,
        g.name AS guardian_name,
        g.phone AS guardian_phone,
        COALESCE(NULLIF(g.email, ''), g.google_email, '') AS guardian_email,
        g.address AS guardian_address,
        g.address_detail AS guardian_address_detail,
        lo.id AS latest_order_id,
        lo.latest_order_number,
        lo.status AS latest_order_status,
        lo.payment_method AS latest_payment_method,
        lo.paid_at AS latest_paid_at,
        lo.activated_at AS latest_activated_at,
        lo.product_name,
        lo.subject_id,
        lo.subject_name,
        lo.subject_birth_date,
        lo.subject_gender,
        lo.subject_photo_data_url
      FROM subscriptions sub
      JOIN guardians g ON g.id = sub.guardian_id
      LEFT JOIN latest_orders lo ON lo.guardian_id = sub.guardian_id AND lo.rn = 1
    )
    SELECT *
    FROM subscription_rows
    ${where}
    ORDER BY datetime(COALESCE(updated_at, created_at)) DESC
    LIMIT 200`;

  const [summaryResult, subscriptionsResult, plansResult] = await Promise.all([
    db.execute(`SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) AS paused,
        SUM(CASE
          WHEN status = 'cancelled'
            OR EXISTS (
              SELECT 1
              FROM product_orders po
              WHERE po.guardian_id = sub.guardian_id
                AND po.order_type = 'subscription'
                AND po.status IN ('failed', 'cancelled')
            )
          THEN 1 ELSE 0
        END) AS cancelled_refund
      FROM subscriptions sub`),
    db.execute({ sql: subscriptionRowsSql, args }),
    db.execute("SELECT * FROM subscription_plans ORDER BY months ASC"),
  ]);

  const subscriptions = subscriptionsResult.rows;
  const selectedSubscription = subscriptions.find((item) => item.subscription_id === selectedSubscriptionId) || subscriptions[0] || null;
  let selectedOrders = [];
  if (selectedSubscription?.guardian_id) {
    const ordersResult = await db.execute({
      sql: `SELECT
          o.*,
          COALESCE(NULLIF(o.toss_order_id, ''), o.id) AS payment_number,
          p.name AS product_name,
          s.name AS subject_name,
          s.birth_date AS subject_birth_date,
          s.gender AS subject_gender
        FROM product_orders o
        JOIN products p ON p.id = o.product_id
        LEFT JOIN subjects s ON s.id = o.subject_id
        WHERE o.guardian_id = ?
          AND o.order_type = 'subscription'
        ORDER BY datetime(COALESCE(o.paid_at, o.updated_at, o.created_at)) DESC
        LIMIT 30`,
      args: [selectedSubscription.guardian_id],
    });
    selectedOrders = ordersResult.rows;
  }

  const summary = summaryResult.rows[0] || {};
  return {
    summary: {
      total: Number(summary.total || 0),
      active: Number(summary.active || 0),
      paused: Number(summary.paused || 0),
      cancelledRefund: Number(summary.cancelled_refund || 0),
    },
    subscriptions,
    selectedSubscription,
    selectedOrders,
    plans: plansResult.rows,
    filters: { query, plan, status, payment, startDate, endDate },
  };
}

export async function getAdminPaymentsData(filters = {}) {
  await ensureSchema();
  const db = getDb();
  const query = String(filters.query || "").trim();
  const type = ["product", "subscription", "ad"].includes(filters.type) ? filters.type : "all";
  const clauses = [];
  const args = [];

  if (query) {
    const pattern = `%${query}%`;
    clauses.push(`(
      payment_number LIKE ? OR
      guardian_name LIKE ? OR
      guardian_phone LIKE ? OR
      guardian_email LIKE ? OR
      subject_name LIKE ? OR
      payment_item LIKE ? OR
      payment_method LIKE ?
    )`);
    args.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern);
  }
  if (type !== "all") {
    clauses.push("payment_kind = ?");
    args.push(type);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await db.execute({
    sql: `WITH payment_rows AS (
        SELECT
          o.id,
          COALESCE(NULLIF(o.toss_order_id, ''), o.id) AS payment_number,
          CASE WHEN o.order_type = 'standalone' THEN 'product' ELSE 'subscription' END AS payment_kind,
          CASE WHEN o.order_type = 'standalone' THEN '상품' ELSE '이용권' END AS payment_group,
          CASE
            WHEN o.order_type = 'standalone' THEN COALESCE(NULLIF(p.name, ''), '상품')
            ELSE (CAST(COALESCE(o.plan_months, 1) AS TEXT) || '개월 이용권 - ' || COALESCE(NULLIF(p.name, ''), '상품'))
          END AS payment_item,
          COALESCE(NULLIF(g.name, ''), NULLIF(g.login_id, ''), NULLIF(g.email, ''), g.google_email, '보호자 미입력') AS guardian_name,
          COALESCE(g.phone, '') AS guardian_phone,
          COALESCE(NULLIF(g.email, ''), g.google_email, '') AS guardian_email,
          COALESCE(NULLIF(s.name, ''), '대상자 미선택') AS subject_name,
          COALESCE(NULLIF(o.payment_method, ''), '결제위젯') AS payment_method,
          COALESCE(o.amount, 0) AS amount,
          COALESCE(o.paid_at, o.updated_at, o.created_at) AS payment_date,
          o.status AS payment_status
        FROM product_orders o
        JOIN guardians g ON g.id = o.guardian_id
        JOIN products p ON p.id = o.product_id
        LEFT JOIN subjects s ON s.id = o.subject_id
        WHERE o.status IN ('paid', 'paid_waiting_activation', 'activated')

        UNION ALL

        SELECT
          a.id,
          a.id AS payment_number,
          'ad' AS payment_kind,
          '광고' AS payment_group,
          COALESCE(NULLIF(a.region, ''), '온라인 실종광고') AS payment_item,
          COALESCE(NULLIF(g.name, ''), NULLIF(g.login_id, ''), NULLIF(g.email, ''), g.google_email, '보호자 미입력') AS guardian_name,
          COALESCE(g.phone, '') AS guardian_phone,
          COALESCE(NULLIF(g.email, ''), g.google_email, '') AS guardian_email,
          COALESCE(NULLIF(s.name, ''), '관리대상 미입력') AS subject_name,
          '광고 결제 준비' AS payment_method,
          COALESCE(a.amount, 0) AS amount,
          COALESCE(a.updated_at, a.created_at) AS payment_date,
          a.status AS payment_status
        FROM subject_ads a
        JOIN guardians g ON g.id = a.guardian_id
        JOIN subjects s ON s.id = a.subject_id
      )
      SELECT *
      FROM payment_rows
      ${where}
      ORDER BY datetime(payment_date) DESC
      LIMIT 300`,
    args,
  });

  return {
    payments: result.rows,
    filters: { query, type },
  };
}

export async function getProducts({ includeInactive = false } = {}) {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT *
      FROM products
      ${includeInactive ? "" : "WHERE is_active = 1"}
      ORDER BY sort_order ASC, created_at ASC`,
    args: [],
  });
  return result.rows;
}

export async function getAdminProductsData() {
  return {
    products: await getProducts({ includeInactive: true }),
  };
}

export async function getAdminOrdersData(filters = {}, selectedOrderId = "") {
  await ensureSchema();
  const db = getDb();
  const query = String(filters.query || "").trim();
  const product = String(filters.product || "").trim();
  const startDate = String(filters.startDate || "").trim();
  const endDate = String(filters.endDate || "").trim();
  const payment = ["paid", "pending", "failed"].includes(filters.payment) ? filters.payment : "all";
  const fulfillment = ["pending", "preparing", "shipped", "delivered", "cancelled"].includes(filters.fulfillment)
    ? filters.fulfillment
    : "all";
  const clauses = [];
  const args = [];

  if (query) {
    const pattern = `%${query}%`;
    clauses.push(`(
      o.id LIKE ? OR
      COALESCE(o.toss_order_id, '') LIKE ? OR
      COALESCE(o.tracking_number, '') LIKE ? OR
      COALESCE(g.name, '') LIKE ? OR
      COALESCE(g.phone, '') LIKE ? OR
      COALESCE(NULLIF(g.email, ''), g.google_email, '') LIKE ? OR
      COALESCE(s.name, '') LIKE ? OR
      COALESCE(p.name, '') LIKE ?
    )`);
    args.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern);
  }
  if (payment === "paid") clauses.push("o.status IN ('paid', 'paid_waiting_activation', 'activated')");
  if (payment === "pending") clauses.push("o.status IN ('draft', 'payment_pending', 'subscription_pending')");
  if (payment === "failed") clauses.push("o.status IN ('failed', 'cancelled')");
  if (product) {
    clauses.push("p.name LIKE ?");
    args.push(`%${product}%`);
  }
  if (fulfillment !== "all") {
    clauses.push("o.fulfillment_status = ?");
    args.push(fulfillment);
  }
  if (startDate) {
    clauses.push("DATE(o.created_at) >= DATE(?)");
    args.push(startDate);
  }
  if (endDate) {
    clauses.push("DATE(o.created_at) <= DATE(?)");
    args.push(endDate);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const [orders, summary] = await Promise.all([
    db.execute({
      sql: `SELECT
          o.*,
          p.name AS product_name,
          p.slug AS product_slug,
          p.image_data_url AS product_image_data_url,
          g.name AS guardian_name,
          g.phone AS guardian_phone,
          g.email AS guardian_email,
          g.google_email AS guardian_google_email,
          s.name AS subject_name,
          COALESCE(NULLIF(o.recipient_name, ''), g.name) AS display_recipient_name,
          COALESCE(NULLIF(o.recipient_phone, ''), g.phone) AS display_recipient_phone
        FROM product_orders o
        JOIN products p ON p.id = o.product_id
        JOIN guardians g ON g.id = o.guardian_id
        LEFT JOIN subjects s ON s.id = o.subject_id
        ${where}
        ORDER BY o.created_at DESC
        LIMIT 200`,
      args,
    }),
    db.execute(`SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status IN ('paid', 'paid_waiting_activation', 'activated') THEN 1 ELSE 0 END) AS paid,
        SUM(CASE WHEN fulfillment_status = 'preparing' THEN 1 ELSE 0 END) AS preparing,
        SUM(CASE WHEN fulfillment_status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
        SUM(CASE WHEN fulfillment_status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN status IN ('failed', 'cancelled') OR fulfillment_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refunded
      FROM product_orders`),
  ]);

  const orderRows = orders.rows;
  const selectedOrder = orderRows.find((order) => order.id === selectedOrderId) || orderRows[0] || null;

  return {
    orders: orderRows,
    selectedOrder,
    summary: summary.rows[0] || {},
    filters: { query, product, payment, fulfillment, startDate, endDate },
  };
}

export async function setProductOrderFulfillment(formData) {
  await ensureSchema();
  const db = getDb();
  const orderId = getText(formData, "orderId");
  const fulfillmentStatus = getText(formData, "fulfillmentStatus");
  const carrier = getText(formData, "carrier");
  const trackingNumber = getText(formData, "trackingNumber");
  const adminMemo = getText(formData, "adminMemo");
  const allowedStatuses = ["pending", "preparing", "shipped", "delivered", "cancelled"];

  if (!orderId) throw new Error("주문 ID가 없습니다.");
  if (!allowedStatuses.includes(fulfillmentStatus)) throw new Error("배송 상태를 확인해 주세요.");

  const result = await db.execute({
    sql: `SELECT id, guardian_id, status, fulfillment_status
      FROM product_orders
      WHERE id = ?
      LIMIT 1`,
    args: [orderId],
  });
  const order = result.rows[0];
  if (!order) throw new Error("주문을 찾을 수 없습니다.");

  const paid = ["paid", "paid_waiting_activation", "activated"].includes(order.status);
  if (!paid && !["pending", "cancelled"].includes(fulfillmentStatus)) {
    throw new Error("결제가 완료된 주문만 배송 처리할 수 있습니다.");
  }
  if (["shipped", "delivered"].includes(fulfillmentStatus) && (!carrier || !trackingNumber)) {
    throw new Error("배송중 또는 배송완료 처리에는 택배사와 송장번호가 필요합니다.");
  }

  await db.execute({
    sql: `UPDATE product_orders
      SET fulfillment_status = ?,
        carrier = ?,
        tracking_number = ?,
        admin_memo = ?,
        shipped_at = CASE
          WHEN ? IN ('shipped', 'delivered') THEN COALESCE(shipped_at, CURRENT_TIMESTAMP)
          WHEN ? = 'preparing' THEN NULL
          ELSE shipped_at
        END,
        delivered_at = CASE
          WHEN ? = 'delivered' THEN COALESCE(delivered_at, CURRENT_TIMESTAMP)
          WHEN ? IN ('preparing', 'shipped') THEN NULL
          ELSE delivered_at
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    args: [
      fulfillmentStatus,
      carrier,
      trackingNumber,
      adminMemo,
      fulfillmentStatus,
      fulfillmentStatus,
      fulfillmentStatus,
      fulfillmentStatus,
      orderId,
    ],
  });

  if (order.fulfillment_status !== fulfillmentStatus && fulfillmentStatus === "shipped") {
    await createGuardianNotification({
      guardianId: order.guardian_id,
      title: "상품이 발송되었습니다",
      body: `${carrier} ${trackingNumber}`,
      url: "/account/billing",
    });
  }
  if (order.fulfillment_status !== fulfillmentStatus && fulfillmentStatus === "delivered") {
    await createGuardianNotification({
      guardianId: order.guardian_id,
      title: "배송이 완료되었습니다",
      body: trackingNumber ? `${carrier} ${trackingNumber}` : "주문 상품의 배송이 완료되었습니다.",
      url: "/account/billing",
    });
  }
}

export async function setProductCatalogItem(formData) {
  await ensureSchema();
  const db = getDb();
  const productId = getText(formData, "productId");
  const name = getText(formData, "name");
  const description = getText(formData, "description");
  const unitPrice = Number(getText(formData, "unitPrice") || 0);
  const sortOrder = Number(getText(formData, "sortOrder") || 0);
  const isActive = getText(formData, "isActive") === "1" ? 1 : 0;
  const existingImage = getText(formData, "existingImage");
  const existingImageName = getText(formData, "existingImageName");
  const removeImage = getText(formData, "removeImage") === "1";
  const imageFile = formData.get("image");

  if (!productId) throw new Error("상품 ID가 없습니다.");
  if (!name) throw new Error("상품명을 입력해 주세요.");
  if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error("상품 가격을 확인해 주세요.");

  const current = await db.execute({
    sql: "SELECT id FROM products WHERE id = ? LIMIT 1",
    args: [productId],
  });
  if (!current.rows[0]) throw new Error("상품을 찾을 수 없습니다.");

  const uploadedImage = removeImage ? null : await fileToDataUrl(imageFile);
  const imageDataUrl = removeImage ? "" : uploadedImage?.dataUrl || existingImage || "";
  const imageName = removeImage ? "" : uploadedImage?.name || existingImageName || "";

  await db.execute({
    sql: `UPDATE products
      SET name = ?,
        description = ?,
        image_data_url = ?,
        image_name = ?,
        unit_price = ?,
        is_active = ?,
        sort_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    args: [name, description, imageDataUrl, imageName, Math.floor(unitPrice), isActive, Math.floor(sortOrder), productId],
  });
}

export async function saveProductOrderDraft(session, payload = {}) {
  await ensureSchema();
  const db = getDb();
  const { guardian, subjects, subscription } = await getDashboardData(session, {
    includeSubjectDetails: false,
    includeSubscriptionPlans: false,
    includeAdDailyRate: false,
  });
  const productId = String(payload.productId || "").trim();
  const subjectId = String(payload.subjectId || "").trim();
  const orderType = payload.orderType === "standalone" ? "standalone" : "subscription";
  const quantity = Math.max(1, Math.min(99, Number(payload.quantity || 1)));
  const planMonths = orderType === "subscription" ? Number(payload.planMonths || 1) : null;
  const designIndex = Math.max(0, Math.min(20, Number(payload.designIndex || 0)));
  const shippingAddress = String(payload.shippingAddress || guardian.address || "").trim();
  const shippingAddressDetail = String(payload.shippingAddressDetail || guardian.address_detail || "").trim();
  const recipientName = String(payload.recipientName || guardian.name || "").trim();
  const recipientPhone = String(payload.recipientPhone || guardian.phone || "").trim();
  const requestedPaymentMethod = String(payload.paymentMethod || "CARD").trim() || "CARD";
  const allowedPaymentMethods = orderType === "subscription"
    ? ["CARD", "WIDGET"]
    : ["CARD", "TRANSFER", "VIRTUAL_ACCOUNT", "WIDGET"];
  if (!allowedPaymentMethods.includes(requestedPaymentMethod)) {
    throw new Error("지원하지 않는 결제수단입니다.");
  }
  const paymentMethod = requestedPaymentMethod;

  if (!productId) throw new Error("상품을 선택해 주세요.");
  if (!subjectId) throw new Error("대상자를 선택해 주세요.");
  if (!subjects.some((subject) => subject.id === subjectId)) {
    throw new Error("선택한 대상자를 확인할 수 없습니다.");
  }

  const productResult = await db.execute({
    sql: "SELECT * FROM products WHERE id = ? AND is_active = 1 LIMIT 1",
    args: [productId],
  });
  const product = productResult.rows[0];
  if (!product) throw new Error("선택한 상품을 찾을 수 없습니다.");

  if (orderType === "standalone" && subscription?.status !== "active") {
    throw new Error("상품 단독 구매는 이용권 사용중인 고객만 선택할 수 있습니다.");
  }
  if (orderType === "subscription" && subscription?.status === "ready") {
    throw new Error("QR 활성화를 기다리는 이용권이 있습니다. QR 활성화 후 추가 이용권을 구매해 주세요.");
  }

  const plan = orderType === "subscription" ? await getSubscriptionPlanByMonths(planMonths) : null;
  if (orderType === "subscription" && !plan) {
    throw new Error("선택한 이용기간을 확인할 수 없습니다.");
  }

  const amount = orderType === "standalone" ? Number(product.unit_price || 0) * quantity : Number(plan?.amount || 0);
  const id = crypto.randomUUID();
  const tossOrderId = `zrf_${Date.now()}_${randomString(8)}`;
  await db.execute({
    sql: `INSERT INTO product_orders (
        id, guardian_id, subject_id, product_id, quantity, order_type, plan_months,
        design_index, shipping_address, shipping_address_detail, recipient_name, recipient_phone,
        payment_method, toss_order_id, amount, status, fulfillment_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    args: [
      id,
      guardian.id,
      subjectId,
      product.id,
      quantity,
      orderType,
      planMonths,
      designIndex,
      shippingAddress,
      shippingAddressDetail,
      recipientName,
      recipientPhone,
      paymentMethod,
      tossOrderId,
      amount,
      "payment_pending",
    ],
  });

  return {
    id,
    guardian,
    product,
    amount,
    tossOrderId,
    orderType,
    plan,
  };
}

export async function getProductOrderById(orderId, guardianId = "") {
  await ensureSchema();
  const db = getDb();
  const id = String(orderId || "").trim();
  if (!id) return null;

  const result = await db.execute({
    sql: `SELECT
        o.*,
        p.name AS product_name,
        p.slug AS product_slug,
        p.image_data_url AS product_image_data_url,
        s.name AS subject_name,
        s.birth_date AS subject_birth_date,
        q.public_key AS qr_public_key,
        q.activated_at AS qr_activated_at
      FROM product_orders o
      JOIN products p ON p.id = o.product_id
      LEFT JOIN subjects s ON s.id = o.subject_id
      LEFT JOIN qr_codes q ON q.subject_id = o.subject_id
      WHERE o.id = ?
        ${guardianId ? "AND o.guardian_id = ?" : ""}
      LIMIT 1`,
    args: guardianId ? [id, guardianId] : [id],
  });
  const order = result.rows[0] || null;
  return order
    ? {
        ...order,
        qr_target_url: order.qr_public_key ? getFindUrl(order.qr_public_key) : "",
      }
    : null;
}

export async function getProductOrderForGuardian(session, orderId) {
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  return getProductOrderById(orderId, guardian.id);
}

export async function markProductOrderPaid({
  orderId,
  paymentKey = "",
  tossOrderId = "",
  status = "paid",
  paymentMethod = "",
}) {
  await ensureSchema();
  const db = getDb();
  const id = String(orderId || "").trim();
  if (!id) throw new Error("주문 ID가 없습니다.");

  await db.execute({
    sql: `UPDATE product_orders
      SET status = ?,
        fulfillment_status = CASE WHEN fulfillment_status = 'cancelled' THEN fulfillment_status ELSE 'preparing' END,
        payment_key = ?,
        toss_order_id = COALESCE(NULLIF(?, ''), toss_order_id),
        payment_method = COALESCE(NULLIF(?, ''), payment_method),
        paid_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND status IN ('draft', 'payment_pending', 'subscription_pending')`,
    args: [status, String(paymentKey || ""), String(tossOrderId || ""), String(paymentMethod || ""), id],
  });
  await db.execute({
    sql: `UPDATE subjects
      SET status = 'QR활성화필요',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (
        SELECT subject_id
        FROM product_orders
        WHERE id = ?
      )
      AND status IN ('상품구매필요', '문제없음')`,
    args: [id],
  });
}

export async function completePrepaidSubscriptionPurchase({ guardianId, productOrderId, payment }) {
  await ensureSchema();
  const db = getDb();
  const normalizedGuardianId = String(guardianId || "").trim();
  const normalizedOrderId = String(productOrderId || "").trim();
  if (!normalizedGuardianId || !normalizedOrderId) throw new Error("이용권 주문정보가 없습니다.");

  const orderResult = await db.execute({
    sql: `SELECT
        o.*,
        q.activated_at AS qr_activated_at
      FROM product_orders o
      LEFT JOIN qr_codes q ON q.subject_id = o.subject_id
      WHERE o.id = ? AND o.guardian_id = ?
      LIMIT 1`,
    args: [normalizedOrderId, normalizedGuardianId],
  });
  const order = orderResult.rows[0];
  if (!order || order.order_type !== "subscription") throw new Error("이용권 주문을 찾을 수 없습니다.");
  if (["paid", "paid_waiting_activation", "activated"].includes(order.status)) {
    return { alreadyCompleted: true, status: order.status };
  }
  if (!["draft", "payment_pending", "subscription_pending"].includes(order.status)) {
    throw new Error("처리할 수 없는 이용권 주문 상태입니다.");
  }

  const claim = await db.execute({
    sql: `UPDATE product_orders
      SET status = 'subscription_processing', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND guardian_id = ?
        AND status IN ('draft', 'payment_pending', 'subscription_pending')`,
    args: [normalizedOrderId, normalizedGuardianId],
  });
  if (Number(claim.rowsAffected || 0) !== 1) {
    return { alreadyCompleted: true, status: order.status };
  }

  try {
    const existing = await getSubscriptionByGuardianId(normalizedGuardianId);
    if (existing?.status === "ready") {
      throw new Error("QR 활성화를 기다리는 이용권이 이미 있습니다.");
    }

    const now = new Date();
    const months = Number(order.plan_months || 1);
    const currentEnd = parseStoredDate(existing?.current_period_end);
    const extendable = Boolean(
      existing
      && ["active", "paused"].includes(existing.status)
      && currentEnd
      && (existing.status === "paused" || currentEnd.getTime() > now.getTime())
    );
    const qrActivated = Boolean(order.qr_activated_at);
    let nextStatus = "ready";
    let periodStart = null;
    let periodEnd = null;

    if (extendable) {
      nextStatus = existing.status;
      periodStart = parseStoredDate(existing.current_period_start) || now;
      periodEnd = addCalendarMonths(currentEnd, months);
    } else if (qrActivated) {
      nextStatus = "active";
      periodStart = now;
      periodEnd = addCalendarMonths(now, months);
    }

    const subscriptionId = existing?.id || crypto.randomUUID();
    const customerKey = existing?.customer_key || `guardian_${normalizedGuardianId}`;
    const planName = `${months}개월 이용권`;
    const subscriptionArgs = [
      subscriptionId,
      normalizedGuardianId,
      customerKey,
      nextStatus,
      planName,
      months,
      Number(order.amount || 0),
      periodStart?.toISOString() || null,
      periodEnd?.toISOString() || null,
      nextStatus === "paused" ? existing?.paused_at || now.toISOString() : null,
      payment?.orderId || order.toss_order_id || "",
      payment?.paymentKey || "",
      payment?.status || "DONE",
    ];
    const nextOrderStatus = qrActivated ? "activated" : "paid_waiting_activation";
    const subjectStatus = qrActivated ? "안전" : "QR활성화필요";

    await db.batch([
      {
        sql: `INSERT INTO subscriptions (
            id, guardian_id, customer_key, status, plan_name, plan_months, amount,
            current_period_start, current_period_end, paused_at,
            last_order_id, last_payment_key, last_payment_status, billing_key,
            error_code, error_message
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', NULL, NULL)
          ON CONFLICT(guardian_id) DO UPDATE SET
            status = excluded.status,
            plan_name = excluded.plan_name,
            plan_months = excluded.plan_months,
            amount = excluded.amount,
            currency = 'KRW',
            current_period_start = excluded.current_period_start,
            current_period_end = excluded.current_period_end,
            paused_at = excluded.paused_at,
            resumed_at = CASE WHEN excluded.status = 'active' THEN CURRENT_TIMESTAMP ELSE resumed_at END,
            last_order_id = excluded.last_order_id,
            last_payment_key = excluded.last_payment_key,
            last_payment_status = excluded.last_payment_status,
            billing_key = '',
            error_code = NULL,
            error_message = NULL,
            updated_at = CURRENT_TIMESTAMP`,
        args: subscriptionArgs,
      },
      {
        sql: `UPDATE product_orders
          SET status = ?,
            fulfillment_status = CASE WHEN fulfillment_status = 'cancelled' THEN fulfillment_status ELSE 'preparing' END,
            payment_key = ?,
            toss_order_id = COALESCE(NULLIF(?, ''), toss_order_id),
            payment_method = COALESCE(NULLIF(?, ''), payment_method),
            paid_at = CURRENT_TIMESTAMP,
            activated_at = CASE WHEN ? = 'activated' THEN COALESCE(activated_at, CURRENT_TIMESTAMP) ELSE activated_at END,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND guardian_id = ? AND status = 'subscription_processing'`,
        args: [
          nextOrderStatus,
          payment?.paymentKey || "",
          payment?.orderId || "",
          payment?.method || "결제위젯",
          nextOrderStatus,
          normalizedOrderId,
          normalizedGuardianId,
        ],
      },
      {
        sql: `UPDATE subjects
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND guardian_id = ?`,
        args: [subjectStatus, order.subject_id, normalizedGuardianId],
      },
    ]);

    return {
      alreadyCompleted: false,
      status: nextStatus,
      currentPeriodStart: periodStart?.toISOString() || null,
      currentPeriodEnd: periodEnd?.toISOString() || null,
    };
  } catch (error) {
    await db.execute({
      sql: `UPDATE product_orders
        SET status = 'payment_pending', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND guardian_id = ? AND status = 'subscription_processing'`,
      args: [normalizedOrderId, normalizedGuardianId],
    });
    throw error;
  }
}

export async function markProductOrderFailedForGuardian(session, orderId) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  const id = String(orderId || "").trim();
  if (!id) return;

  await db.execute({
    sql: `UPDATE product_orders
      SET status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND guardian_id = ?
        AND status IN ('draft', 'payment_pending', 'subscription_pending', 'subscription_processing')`,
    args: [id, guardian.id],
  });
}

export async function activateQrForGuardian(session, publicKey) {
  await ensureSchema();
  const db = getDb();
  const { guardian, subscription } = await getDashboardData(session, {
    includeSubjects: false,
    includeSubjectDetails: false,
    includeSubscriptionPlans: false,
    includeAdDailyRate: false,
  });
  const key = String(publicKey || "").trim();
  if (!key) throw new Error("QR 식별값이 없습니다.");

  const result = await db.execute({
    sql: `SELECT q.*, s.id AS subject_id
      FROM qr_codes q
      JOIN subjects s ON s.id = q.subject_id
      WHERE q.public_key = ? AND q.guardian_id = ?
      LIMIT 1`,
    args: [key, guardian.id],
  });
  const qr = result.rows[0];
  if (!qr) throw new Error("보호자의 관리대상 QR을 찾을 수 없습니다.");
  if (Number(qr.is_active || 0) !== 1) throw new Error("관리자가 비활성화한 QR입니다.");

  if (subscription?.status === "ready") {
    const pendingOrderResult = await db.execute({
      sql: `SELECT id, subject_id
        FROM product_orders
        WHERE guardian_id = ?
          AND order_type = 'subscription'
          AND status = 'paid_waiting_activation'
        ORDER BY paid_at DESC, created_at DESC
        LIMIT 1`,
      args: [guardian.id],
    });
    const pendingOrder = pendingOrderResult.rows[0];
    if (!pendingOrder) {
      throw new Error("QR 활성화를 기다리는 이용권 주문을 찾을 수 없습니다.");
    }
    if (pendingOrder.subject_id !== qr.subject_id) {
      throw new Error("이용권 주문에서 선택한 관리대상자의 QR을 스캔해 주세요.");
    }
  }

  if (!qr.activated_at) {
    await db.execute({
      sql: "UPDATE qr_codes SET activated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [qr.id],
    });
  }

  if (subscription?.status === "ready") {
    const now = new Date();
    const periodEnd = addCalendarMonths(now, Number(subscription.plan_months || 1));
    await db.execute({
      sql: `UPDATE subscriptions
        SET status = 'active',
          current_period_start = ?,
          current_period_end = ?,
          billing_key = '',
          paused_at = NULL,
          resumed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE guardian_id = ? AND status = 'ready'`,
      args: [now.toISOString(), periodEnd.toISOString(), guardian.id],
    });
  }

  await db.execute({
    sql: `UPDATE product_orders
      SET status = 'activated',
        activated_at = COALESCE(activated_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
      WHERE guardian_id = ? AND subject_id = ? AND status = 'paid_waiting_activation' AND activated_at IS NULL`,
    args: [guardian.id, qr.subject_id],
  });
  await db.execute({
    sql: `UPDATE subjects
      SET status = '안전',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      AND guardian_id = ?
      AND status IN ('상품구매필요', 'QR활성화필요', '문제없음')`,
    args: [qr.subject_id, guardian.id],
  });

  return { publicKey: key, targetUrl: getFindUrl(key) };
}

export async function setSubscriptionPlanPrice(formData) {
  await ensureSchema();
  const db = getDb();
  const months = Number(getText(formData, "months"));
  const amount = Number(getText(formData, "amount"));

  if (![1, 3, 6].includes(months)) {
    throw new Error("지원하지 않는 이용권 옵션입니다.");
  }
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("가격은 0 이상의 숫자여야 합니다.");
  }

  await db.execute({
    sql: "UPDATE subscription_plans SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE months = ?",
    args: [Math.floor(amount), months],
  });
}

export async function setSubscriptionAdminMemo(formData) {
  await ensureSchema();
  const db = getDb();
  const subscriptionId = getText(formData, "subscriptionId");
  const adminMemo = getText(formData, "adminMemo");
  if (!subscriptionId) throw new Error("구독 정보를 선택해 주세요.");
  if (adminMemo.length > 2000) throw new Error("관리 메모는 2,000자 이하로 입력해 주세요.");

  await db.execute({
    sql: "UPDATE subscriptions SET admin_memo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [adminMemo, subscriptionId],
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

export async function getAdminAdsData(filters = {}, selectedAdId = "") {
  await ensureSchema();
  const db = getDb();
  const query = String(filters.query || "").trim();
  const status = ["ready", "active", "paused", "ended", "rejected"].includes(filters.status) ? filters.status : "all";
  const review = ["pending", "approved", "rejected"].includes(filters.review) ? filters.review : "all";
  const region = String(filters.region || "").trim();
  const startDate = String(filters.startDate || "").trim();
  const endDate = String(filters.endDate || "").trim();
  const clauses = [];
  const args = [];

  if (query) {
    const pattern = `%${query}%`;
    clauses.push(`(
      ad_number LIKE ? OR
      id LIKE ? OR
      subject_name LIKE ? OR
      guardian_name LIKE ? OR
      guardian_phone LIKE ? OR
      guardian_email LIKE ?
    )`);
    args.push(pattern, pattern, pattern, pattern, pattern, pattern);
  }
  if (status !== "all") {
    clauses.push("status = ?");
    args.push(status);
  }
  if (review !== "all") {
    clauses.push("review_status = ?");
    args.push(review);
  }
  if (region && region !== "all") {
    clauses.push("region = ?");
    args.push(region);
  }
  if (startDate) {
    clauses.push("DATE(end_date) >= DATE(?)");
    args.push(startDate);
  }
  if (endDate) {
    clauses.push("DATE(start_date) <= DATE(?)");
    args.push(endDate);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const currentMonth = normalizeAdminMonth();
  const currentYear = currentMonth.slice(0, 4);
  const previousMonth = getRelativeMonth(currentMonth, -1);

  const [settingResult, adsResult, summaryResult, regionResult] = await Promise.all([
    db.execute({
      sql: "SELECT * FROM ad_settings WHERE id = 'default' LIMIT 1",
      args: [],
    }),
    db.execute({
      sql: `${adminAdRowsCte()}
        SELECT *
        FROM ad_rows
        ${where}
        ORDER BY datetime(updated_at) DESC, datetime(created_at) DESC
        LIMIT 300`,
      args,
    }),
    db.execute({
      sql: `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
          SUM(CASE
            WHEN status = 'ready'
              OR lower(COALESCE(meta_status, '')) IN ('pending', 'review', 'in_review', 'meta_api_pending')
              OR lower(COALESCE(meta_status, '')) LIKE '%pending%'
              OR lower(COALESCE(meta_status, '')) LIKE '%review%'
            THEN 1 ELSE 0
          END) AS review_pending,
          SUM(CASE
            WHEN status = 'rejected'
              OR lower(COALESCE(meta_status, '')) LIKE '%reject%'
              OR lower(COALESCE(meta_status, '')) LIKE '%반려%'
            THEN 1 ELSE 0
          END) AS review_rejected,
          SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) AS paused,
          SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) AS ended,
          COALESCE(SUM(CASE WHEN strftime('%Y-%m', created_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS monthly_amount,
          COALESCE(SUM(CASE WHEN strftime('%Y-%m', created_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS previous_monthly_amount,
          COALESCE(SUM(CASE WHEN strftime('%Y', created_at, '+9 hours') = ? THEN amount ELSE 0 END), 0) AS yearly_amount
        FROM subject_ads`,
      args: [currentMonth, previousMonth, currentYear],
    }),
    db.execute("SELECT DISTINCT region FROM subject_ads WHERE COALESCE(region, '') <> '' ORDER BY region ASC"),
  ]);
  const ads = adsResult.rows;
  const selectedAd = ads.find((ad) => ad.id === selectedAdId) || ads[0] || null;
  let selectedSpendHistory = [];
  if (selectedAd?.id) {
    const historyResult = await db.execute({
      sql: `${adminAdRowsCte()}
        SELECT
          id,
          ad_number,
          region,
          start_date,
          end_date,
          amount,
          spent_amount,
          created_at,
          updated_at,
          status
        FROM ad_rows
        WHERE id = ?
        LIMIT 1`,
      args: [selectedAd.id],
    });
    selectedSpendHistory = historyResult.rows;
  }

  return {
    setting: settingResult.rows[0] || {
      id: "default",
      daily_rate: DEFAULT_AD_DAILY_RATE,
      currency: "KRW",
    },
    summary: {
      total: Number(summaryResult.rows[0]?.total || 0),
      active: Number(summaryResult.rows[0]?.active || 0),
      reviewPending: Number(summaryResult.rows[0]?.review_pending || 0),
      reviewRejected: Number(summaryResult.rows[0]?.review_rejected || 0),
      paused: Number(summaryResult.rows[0]?.paused || 0),
      ended: Number(summaryResult.rows[0]?.ended || 0),
      monthlyAmount: Number(summaryResult.rows[0]?.monthly_amount || 0),
      previousMonthlyAmount: Number(summaryResult.rows[0]?.previous_monthly_amount || 0),
      yearlyAmount: Number(summaryResult.rows[0]?.yearly_amount || 0),
    },
    regions: regionResult.rows.map((row) => row.region).filter(Boolean),
    ads,
    selectedAd,
    selectedSpendHistory,
    filters: { query, status, review, region: region || "all", startDate, endDate },
  };
}

function adminAdRowsCte() {
  return `WITH ad_rows AS (
      SELECT
        a.*,
        ('AD-' || upper(substr(replace(a.id, '-', ''), 1, 10))) AS ad_number,
        CASE
          WHEN a.status = 'rejected'
            OR lower(COALESCE(a.meta_status, '')) LIKE '%reject%'
            OR lower(COALESCE(a.meta_status, '')) LIKE '%반려%'
          THEN 'rejected'
          WHEN a.status = 'ready'
            OR lower(COALESCE(a.meta_status, '')) IN ('pending', 'review', 'in_review', 'meta_api_pending')
            OR lower(COALESCE(a.meta_status, '')) LIKE '%pending%'
            OR lower(COALESCE(a.meta_status, '')) LIKE '%review%'
          THEN 'pending'
          ELSE 'approved'
        END AS review_status,
        COALESCE(a.spent_amount, 0) AS display_spent_amount,
        COALESCE(a.impression_count, 0) AS display_impression_count,
        COALESCE(a.reach_count, 0) AS display_reach_count,
        COALESCE(a.contact_count, 0) AS display_contact_count,
        COALESCE(NULLIF(g.name, ''), NULLIF(g.login_id, ''), NULLIF(g.email, ''), g.google_email, '보호자 미입력') AS guardian_name,
        COALESCE(NULLIF(g.email, ''), g.google_email, '') AS guardian_email,
        g.google_email AS guardian_google_email,
        g.phone AS guardian_phone,
        g.address AS guardian_address,
        g.address_detail AS guardian_address_detail,
        s.name AS subject_name,
        s.birth_date AS subject_birth_date,
        s.gender AS subject_gender,
        s.status AS subject_status,
        s.photo_data_url AS subject_photo_data_url
      FROM subject_ads a
      JOIN guardians g ON g.id = a.guardian_id
      JOIN subjects s ON s.id = a.subject_id
    )`;
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

export async function setAdminSubjectAdMemo(formData) {
  await ensureSchema();
  const db = getDb();
  const adId = getText(formData, "adId");
  const adminMemo = getText(formData, "adminMemo");
  if (!adId) throw new Error("광고 정보를 선택해 주세요.");
  if (adminMemo.length > 2000) throw new Error("광고 메모는 2,000자 이하로 입력해 주세요.");

  await db.execute({
    sql: "UPDATE subject_ads SET admin_memo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [adminMemo, adId],
  });
}

export async function setAdminSubjectAdStatus(formData) {
  await ensureSchema();
  const db = getDb();
  const adId = getText(formData, "adId");
  const command = getText(formData, "command");
  if (!adId) throw new Error("광고 정보를 선택해 주세요.");

  const transitions = {
    approve: {
      allowed: ["ready", "active", "paused"],
      nextStatus: "active",
      timestampSql: ", paused_at = NULL, ended_at = NULL, meta_status = 'admin_approved'",
    },
    pause: {
      allowed: ["ready", "active"],
      nextStatus: "paused",
      timestampSql: ", paused_at = CURRENT_TIMESTAMP",
    },
    resume: {
      allowed: ["paused"],
      nextStatus: "active",
      timestampSql: ", paused_at = NULL, meta_status = COALESCE(NULLIF(meta_status, ''), 'admin_resumed')",
    },
  };
  const transition = transitions[command];
  if (!transition) throw new Error("지원하지 않는 광고 상태 변경입니다.");

  const result = await db.execute({
    sql: "SELECT id, status FROM subject_ads WHERE id = ? LIMIT 1",
    args: [adId],
  });
  const ad = result.rows[0];
  if (!ad) throw new Error("광고 정보를 찾을 수 없습니다.");
  if (!transition.allowed.includes(String(ad.status))) {
    throw new Error("현재 상태에서는 광고 상태를 변경할 수 없습니다.");
  }

  await db.execute({
    sql: `UPDATE subject_ads
      SET status = ?, updated_at = CURRENT_TIMESTAMP${transition.timestampSql}
      WHERE id = ?`,
    args: [transition.nextStatus, adId],
  });
}

export async function createSubjectAd(session, formData) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
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
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
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
        q.activated_at AS qr_activated_at,
        s.id AS subject_id,
        s.name AS subject_name,
        s.birth_date,
        s.gender,
        s.status AS subject_status,
        s.photo_data_url,
        s.guardian_message,
        s.voice_data_url,
        s.voice_name,
        g.id AS guardian_id,
        g.google_id AS guardian_google_id,
        g.name AS guardian_name,
        g.safe_phone,
        g.email,
        g.address,
        g.address_detail,
        sub.id AS subscription_id,
        sub.status AS subscription_status,
        sub.plan_months AS subscription_plan_months,
        sub.current_period_start AS subscription_period_start,
        sub.current_period_end AS subscription_period_end,
        sub.paused_at AS subscription_paused_at
      FROM qr_codes q
      LEFT JOIN subjects s ON s.id = q.subject_id
      LEFT JOIN guardians g ON g.id = q.guardian_id
      LEFT JOIN subscriptions sub ON sub.guardian_id = g.id
      WHERE q.public_key = ?
      LIMIT 1`,
    args: [key],
  });

  const row = result.rows[0] || null;
  if (!row) return null;

  let subscriptionStatus = row.subscription_status;
  if (row.subscription_id) {
    const normalizedSubscription = await normalizeSubscriptionExpiry(db, {
      id: row.subscription_id,
      status: row.subscription_status,
      current_period_end: row.subscription_period_end,
    });
    subscriptionStatus = normalizedSubscription.status;
  }

  return {
    ...row,
    subscription_status: subscriptionStatus,
    target_url: getFindUrl(row.public_key),
  };
}

export async function createLocationShareForFindPage(findData, payload = {}, requestMeta = {}) {
  await ensureSchema();
  const db = getDb();

  if (!findData) throw new Error("등록되지 않은 QR입니다.");
  if (!Number(findData.qr_active || 0)) throw new Error("비활성화된 QR입니다.");
  if (!findData.qr_activated_at) throw new Error("아직 보호자가 활성화하지 않은 QR입니다.");
  if (!findData.subject_id || !findData.guardian_id || !findData.qr_id) {
    throw new Error("관리대상과 연결되지 않은 QR입니다.");
  }
  if (!hasActiveSubscriptionAccess(findData.subscription_status, findData.subscription_period_end)) {
    throw new Error("활성 이용권이 있을 때만 위치를 공유할 수 있습니다.");
  }

  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  const accuracy = Number(payload.accuracy);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("위도 정보가 올바르지 않습니다.");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("경도 정보가 올바르지 않습니다.");
  }

  const finderContact = truncateText(String(payload.finderContact || "").trim(), 40);
  const addressLabel = truncateText(String(payload.addressLabel || "").trim(), 200) || "지도 링크에서 위치 확인";
  const kakaoMapUrl = buildKakaoMapUrl(latitude, longitude);
  const naverMapUrl = buildNaverMapUrl(latitude, longitude);
  const id = crypto.randomUUID();

  await db.execute({
    sql: `INSERT INTO location_shares (
        id, qr_id, guardian_id, subject_id, public_key, subject_name, guardian_name,
        guardian_safe_phone, finder_contact, address_label, latitude, longitude, accuracy,
        kakao_map_url, naver_map_url, user_agent, ip_address
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      findData.qr_id,
      findData.guardian_id,
      findData.subject_id,
      findData.public_key,
      findData.subject_name || "",
      findData.guardian_name || "",
      findData.safe_phone || "",
      finderContact,
      addressLabel,
      latitude,
      longitude,
      Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
      kakaoMapUrl,
      naverMapUrl,
      truncateText(String(requestMeta.userAgent || ""), 500),
      truncateText(String(requestMeta.ipAddress || ""), 80),
    ],
  });

  return {
    id,
    guardianId: findData.guardian_id,
    subjectName: findData.subject_name || "관리대상",
    finderContact,
    addressLabel,
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
    kakaoMapUrl,
    naverMapUrl,
  };
}

export async function savePushSubscription(session, subscription) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
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

export async function createGuardianNotification({ guardianId, title, body = "", url = "" }) {
  await ensureSchema();
  const db = getDb();
  if (!guardianId || !title) throw new Error("Guardian notification requires guardianId and title.");

  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO guardian_notifications (id, guardian_id, title, body, url)
      VALUES (?, ?, ?, ?, ?)`,
    args: [id, guardianId, title, body, url],
  });

  return {
    id,
    guardian_id: guardianId,
    title,
    body,
    url,
  };
}

export async function getGuardianNotifications(session, limit = 30) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);

  const result = await db.execute({
    sql: `SELECT id, title, body, url, read_at, created_at
      FROM guardian_notifications
      WHERE guardian_id = ?
      ORDER BY created_at DESC
      LIMIT ?`,
    args: [guardian.id, safeLimit],
  });

  return result.rows;
}

export async function markGuardianNotificationsRead(session) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());

  await db.execute({
    sql: `UPDATE guardian_notifications
      SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
      WHERE guardian_id = ?`,
    args: [guardian.id],
  });
}

export async function deleteGuardianNotification(session, notificationId) {
  await ensureSchema();
  const db = getDb();
  const { guardian } = await getDashboardData(session, guardianOnlyOptions());
  const id = String(notificationId || "").trim();
  if (!id) throw new Error("삭제할 알림을 찾을 수 없습니다.");

  const result = await db.execute({
    sql: "DELETE FROM guardian_notifications WHERE id = ? AND guardian_id = ?",
    args: [id, guardian.id],
  });
  if (Number(result.rowsAffected || 0) === 0) {
    throw new Error("삭제할 알림을 찾을 수 없습니다.");
  }
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
    sql: "SELECT id, code, public_key, is_active FROM qr_codes WHERE subject_id = ? LIMIT 1",
    args: [subjectId],
  });
  if (current.rows.length > 0) {
    const qr = current.rows[0];
    return {
      ...qr,
      target_url: getFindUrl(qr.public_key),
    };
  }

  let available = await db.execute({
    sql: "SELECT id, code, public_key, is_active FROM qr_codes WHERE subject_id IS NULL ORDER BY created_at ASC LIMIT 1",
    args: [],
  });

  if (available.rows.length === 0) {
    await insertQrCodes(db, 1);
    available = await db.execute({
      sql: "SELECT id, code, public_key, is_active FROM qr_codes WHERE subject_id IS NULL ORDER BY created_at ASC LIMIT 1",
      args: [],
    });
  }

  const qr = available.rows[0];
  const qrId = qr?.id;
  if (!qrId) throw new Error("관리대상에 배정할 QR 코드를 찾을 수 없습니다.");

  await db.execute({
    sql: "UPDATE qr_codes SET guardian_id = ?, subject_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [guardianId, subjectId, qrId],
  });
  return {
    ...qr,
    target_url: getFindUrl(qr.public_key),
  };
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
      sql: `INSERT INTO subscription_plans (months, name, amount, is_active)
        VALUES (?, ?, ?, 1)
        ON CONFLICT(months) DO UPDATE SET
          name = excluded.name,
          updated_at = CURRENT_TIMESTAMP`,
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

async function seedProducts(db) {
  for (const product of DEFAULT_PRODUCTS) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO products (id, slug, name, unit_price, is_active, sort_order)
        VALUES (?, ?, ?, ?, 1, ?)`,
      args: [`product-${product.slug}`, product.slug, product.name, product.unitPrice, product.sortOrder],
    });
  }
}

function parseStoredDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasActiveSubscriptionAccess(status, periodEnd) {
  if (status !== "active" || !periodEnd) return false;
  const end = parseStoredDate(periodEnd);
  return Boolean(end && end.getTime() > Date.now());
}

function buildKakaoMapUrl(latitude, longitude) {
  return `https://map.kakao.com/link/map/${encodeURIComponent("제자리 위치공유")},${latitude},${longitude}`;
}

function buildNaverMapUrl(latitude, longitude) {
  const query = encodeURIComponent(`${latitude},${longitude}`);
  return `https://map.naver.com/p/search/${query}`;
}

function truncateText(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function addCalendarMonths(date, months) {
  const next = new Date(date.getTime());
  const originalDay = next.getUTCDate();
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + Number(months || 0));
  const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
  next.setUTCDate(Math.min(originalDay, lastDay));
  return next;
}

async function normalizeSubscriptionExpiry(db, subscription) {
  if (!subscription || subscription.status !== "active") return subscription;
  const periodEnd = parseStoredDate(subscription.current_period_end);
  if (periodEnd && periodEnd.getTime() > Date.now()) return subscription;

  await db.execute({
    sql: `UPDATE subscriptions
      SET status = 'expired', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'active'`,
    args: [subscription.id],
  });
  return { ...subscription, status: "expired" };
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

function normalizeVoiceDataUrl(value) {
  const dataUrl = String(value || "").trim();
  if (!dataUrl) return "";
  if (!dataUrl.startsWith("data:audio/")) {
    throw new Error("보호자 음성은 오디오 녹음 파일만 저장할 수 있습니다.");
  }
  if (Buffer.byteLength(dataUrl, "utf8") > 2.5 * 1024 * 1024) {
    throw new Error("보호자 음성은 2.5MB 이하만 저장할 수 있습니다.");
  }
  return dataUrl;
}

function normalizeSubjectStatus(value) {
  const status = String(value || "").trim();
  if (status === "문제없음") return "안전";
  if (["상품구매필요", "QR활성화필요", "안전", "찾는중"].includes(status)) return status;
  return "상품구매필요";
}

function normalizeAdminMonth(value) {
  const requested = String(value || "").trim();
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(requested)) return requested;
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 7);
}

function getRelativeMonth(month, offset) {
  const [year, monthNumber] = String(month || normalizeAdminMonth()).split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + Number(offset || 0), 1));
  return date.toISOString().slice(0, 7);
}

function getRelativeKstDateKey(offsetDays = 0) {
  return new Date(Date.now() + 9 * 60 * 60 * 1000 + Number(offsetDays || 0) * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function buildAdminDailyTrend(orderRows = [], adRows = [], locationRows = []) {
  const days = Array.from({ length: 30 }, (_, index) => getRelativeKstDateKey(index - 29));
  const trendMap = new Map(days.map((day) => [day, { day, revenue: 0, orders: 0, activity: 0 }]));

  for (const row of orderRows) {
    const day = String(row.day || "");
    const target = trendMap.get(day);
    if (!target) continue;
    target.revenue += Number(row.revenue || 0);
    target.orders += Number(row.orders || 0);
  }
  for (const row of adRows) {
    const day = String(row.day || "");
    const target = trendMap.get(day);
    if (!target) continue;
    target.revenue += Number(row.ad_revenue || 0);
    target.activity += Number(row.ads || 0);
  }
  for (const row of locationRows) {
    const day = String(row.day || "");
    const target = trendMap.get(day);
    if (!target) continue;
    target.activity += Number(row.shares || 0);
  }

  return days.map((day) => trendMap.get(day));
}

function normalizeDateInput(value) {
  const requested = String(value || "").trim();
  return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(requested) ? requested : "";
}

function guardianOnlyOptions() {
  return {
    includeSubjects: false,
    includeSubjectDetails: false,
    includeSubscription: false,
    includeSubscriptionPlans: false,
    includeAdDailyRate: false,
  };
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
