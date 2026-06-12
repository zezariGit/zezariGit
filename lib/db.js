import { createClient } from "@libsql/client";
import { hashPassword } from "./security";

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
          email TEXT,
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
    ]);
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
    sql: "SELECT * FROM subjects WHERE guardian_id = ? ORDER BY created_at ASC",
    args: [guardian.id],
  });

  return {
    guardian,
    subjects: subjects.rows,
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
  const email = getText(formData, "email");
  const passwordHash = password ? hashPassword(password) : current.guardian.password_hash;

  await db.execute({
    sql: `UPDATE guardians
      SET name = ?, login_id = ?, password_hash = ?, phone = ?, email = ?, google_email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE google_id = ?`,
    args: [name, loginId, passwordHash, phone, email, session.user?.email || "", googleId],
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
        SET name = ?, birth_date = ?, gender = ?, photo_data_url = ?, photo_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND guardian_id = ?`,
      args: [name, birthDate, gender, photoDataUrl, photoName, id, guardian.id],
    });
    return;
  }

  await db.execute({
    sql: `INSERT INTO subjects (id, guardian_id, name, birth_date, gender, photo_data_url, photo_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, guardian.id, name, birthDate, gender, photoDataUrl, photoName],
  });
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
