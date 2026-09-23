export const POSTER_TEMPLATE_POLICY = Object.freeze({
  publishedCreativeIsImmutable: true,
  retryWithoutMetaAdUsesLatestTemplate: true,
  description:
    "Meta에 최초 발행할 때 활성 템플릿을 소재에 스냅샷으로 저장합니다. 이미 발행된 소재는 템플릿 변경으로 다시 만들지 않으며, Meta 광고 ID가 없는 발행 재시도만 최신 활성 템플릿을 사용합니다.",
});

export const DEFAULT_POSTER_LAYOUT = Object.freeze({
  canvas: { width: 1080, height: 1350 },
  photo: {
    x: 36, y: 396, width: 462, height: 558,
    objectFit: "cover", borderRadius: 0,
  },
  qr: {
    x: 58, y: 1079, width: 236, height: 236,
    objectFit: "contain", borderRadius: 0,
  },
  name: {
    x: 765, y: 390, width: 270, height: 82,
    fontSize: 62, minFontSize: 34, fontWeight: 800,
    color: "#111111", textAlign: "left", maxLines: 1, lineHeight: 1.1,
  },
  age: {
    x: 765, y: 534, width: 270, height: 82,
    fontSize: 52, minFontSize: 30, fontWeight: 700,
    color: "#111111", textAlign: "left", maxLines: 1, lineHeight: 1.1,
  },
  gender: {
    x: 765, y: 678, width: 270, height: 82,
    fontSize: 52, minFontSize: 30, fontWeight: 700,
    color: "#111111", textAlign: "left", maxLines: 1, lineHeight: 1.1,
  },
  memo: {
    x: 660, y: 842, width: 350, height: 154,
    fontSize: 35, minFontSize: 22, fontWeight: 700,
    color: "#111111", textAlign: "left", maxLines: 4, lineHeight: 1.24,
  },
});

export const POSTER_FIELD_LABELS = Object.freeze({
  photo: "사진",
  qr: "QR 코드",
  name: "이름",
  age: "나이",
  gender: "성별",
  memo: "보호자 메모",
});

const IMAGE_FIELDS = new Set(["photo", "qr"]);
const TEXT_FIELDS = new Set(["name", "age", "gender", "memo"]);
const ALIGNMENTS = new Set(["left", "center", "right"]);
const OBJECT_FITS = new Set(["cover", "contain"]);

function finiteNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function integer(value, fallback, min, max) {
  return Math.round(finiteNumber(value, fallback, min, max));
}

function color(value, fallback) {
  const normalized = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : fallback;
}

export function normalizePosterLayout(input) {
  const source = input && typeof input === "object" ? input : {};
  const canvas = {
    width: integer(source.canvas?.width, DEFAULT_POSTER_LAYOUT.canvas.width, 600, 1600),
    height: integer(source.canvas?.height, DEFAULT_POSTER_LAYOUT.canvas.height, 315, 2000),
  };
  const normalized = { canvas };

  for (const field of Object.keys(POSTER_FIELD_LABELS)) {
    const fallback = DEFAULT_POSTER_LAYOUT[field];
    const current = source[field] && typeof source[field] === "object" ? source[field] : {};
    const base = {
      x: integer(current.x, fallback.x, 0, canvas.width - 1),
      y: integer(current.y, fallback.y, 0, canvas.height - 1),
      width: integer(current.width, fallback.width, 20, canvas.width),
      height: integer(current.height, fallback.height, 20, canvas.height),
    };

    base.width = Math.min(base.width, canvas.width - base.x);
    base.height = Math.min(base.height, canvas.height - base.y);

    if (IMAGE_FIELDS.has(field)) {
      normalized[field] = {
        ...base,
        objectFit: OBJECT_FITS.has(current.objectFit) ? current.objectFit : fallback.objectFit,
        borderRadius: integer(current.borderRadius, fallback.borderRadius, 0, 200),
      };
      continue;
    }

    if (TEXT_FIELDS.has(field)) {
      const fontSize = integer(current.fontSize, fallback.fontSize, 12, 160);
      normalized[field] = {
        ...base,
        fontSize,
        minFontSize: integer(current.minFontSize, fallback.minFontSize, 10, fontSize),
        fontWeight: integer(current.fontWeight, fallback.fontWeight, 400, 900),
        color: color(current.color, fallback.color),
        textAlign: ALIGNMENTS.has(current.textAlign) ? current.textAlign : fallback.textAlign,
        maxLines: integer(current.maxLines, fallback.maxLines, 1, 12),
        lineHeight: finiteNumber(current.lineHeight, fallback.lineHeight, 1, 2),
      };
    }
  }

  return normalized;
}

export function parsePosterLayout(value) {
  if (typeof value === "string") {
    try {
      return normalizePosterLayout(JSON.parse(value));
    } catch {
      return normalizePosterLayout(null);
    }
  }
  return normalizePosterLayout(value);
}

function estimatedCharacterWidth(character, fontSize) {
  if (/\s/.test(character)) return fontSize * 0.32;
  if (/^[\x00-\x7F]$/.test(character)) return fontSize * 0.56;
  return fontSize;
}

function wrapPosterText(text, width, fontSize, maxLines) {
  const source = String(text || "").replace(/\r/g, "").trim();
  if (!source) return [""];
  const lines = [];
  let line = "";
  let lineWidth = 0;

  for (const character of source) {
    if (character === "\n") {
      lines.push(line.trimEnd());
      line = "";
      lineWidth = 0;
      continue;
    }
    const characterWidth = estimatedCharacterWidth(character, fontSize);
    if (line && lineWidth + characterWidth > width) {
      lines.push(line.trimEnd());
      line = character.trimStart();
      lineWidth = estimatedCharacterWidth(line, fontSize);
    } else {
      line += character;
      lineWidth += characterWidth;
    }
  }
  if (line || lines.length === 0) lines.push(line.trimEnd());

  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  let last = visible[maxLines - 1].trimEnd();
  const ellipsisWidth = estimatedCharacterWidth("…", fontSize);
  let estimatedWidth = [...last].reduce((sum, character) => sum + estimatedCharacterWidth(character, fontSize), 0);
  while (last && estimatedWidth + ellipsisWidth > width) {
    const removed = last.slice(-1);
    last = last.slice(0, -1);
    estimatedWidth -= estimatedCharacterWidth(removed, fontSize);
  }
  visible[maxLines - 1] = `${last.trimEnd()}…`;
  return visible;
}

export function fitPosterText(value, field) {
  const config = field && typeof field === "object" ? field : DEFAULT_POSTER_LAYOUT.memo;
  const maxLines = integer(config.maxLines, 1, 1, 12);
  const lineHeight = finiteNumber(config.lineHeight, 1.2, 1, 2);
  const minFontSize = integer(config.minFontSize, 12, 10, 160);
  const initialFontSize = integer(config.fontSize, minFontSize, minFontSize, 160);
  const width = Math.max(20, Number(config.width || 20));
  const height = Math.max(20, Number(config.height || 20));

  for (let fontSize = initialFontSize; fontSize >= minFontSize; fontSize -= 1) {
    const lines = wrapPosterText(value, width, fontSize, maxLines + 1);
    if (lines.length <= maxLines && lines.length * fontSize * lineHeight <= height) {
      return { text: lines.join("\n"), fontSize, truncated: false };
    }
  }

  const lines = wrapPosterText(value, width, minFontSize, maxLines);
  return {
    text: lines.join("\n"),
    fontSize: minFontSize,
    truncated: String(value || "").trim() !== lines.join("\n").replace(/…$/, "").trim(),
  };
}

export function serializePosterTemplate(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name || "광고 포스터"),
    version: Number(row.version || 1),
    layout: parsePosterLayout(row.layout_json ?? row.layout),
    backgroundImageUrl: String(row.background_image_url || row.backgroundImageUrl || ""),
    isActive: Boolean(row.is_active ?? row.isActive),
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
  };
}
