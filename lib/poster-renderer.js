import React from "react";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { extname, join, normalize } from "path";
import { fitPosterText, parsePosterLayout, serializePosterTemplate } from "./poster-template";

const FONT_PATH = join(process.cwd(), "assets", "fonts", "Pretendard-Regular.woff");
const DEFAULT_BACKGROUND_PATH = "/assets/missing-ad-template.png";
const MAX_REMOTE_IMAGE_BYTES = 8 * 1024 * 1024;
let fontPromise;

function getFontData() {
  fontPromise ||= readFile(FONT_PATH);
  return fontPromise;
}

function imageMimeType(pathname) {
  const extension = extname(String(pathname || "")).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  return "image/png";
}

async function imageSourceToDataUrl(source, fallback = "") {
  const value = String(source || fallback || "").trim();
  if (!value) return "";
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(value)) return value;

  if (value.startsWith("/")) {
    const relative = normalize(value).replace(/^[/\\]+/, "");
    const publicRoot = normalize(join(process.cwd(), "public"));
    const absolute = normalize(join(publicRoot, relative));
    if (!absolute.startsWith(publicRoot)) throw new Error("허용되지 않은 포스터 이미지 경로입니다.");
    const buffer = await readFile(absolute);
    return `data:${imageMimeType(value)};base64,${buffer.toString("base64")}`;
  }

  if (!/^https?:\/\//i.test(value)) throw new Error("포스터 이미지 주소 형식을 확인해 주세요.");
  const response = await fetch(value, { signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!response.ok) throw new Error(`포스터 이미지를 불러오지 못했습니다. (${response.status})`);
  const contentType = String(response.headers.get("content-type") || "").split(";")[0];
  if (!contentType.startsWith("image/")) throw new Error("포스터 이미지 형식을 확인해 주세요.");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_REMOTE_IMAGE_BYTES) throw new Error("포스터 이미지 용량은 8MB 이하여야 합니다.");
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

function absoluteBox(field) {
  return {
    position: "absolute",
    left: field.x,
    top: field.y,
    width: field.width,
    height: field.height,
  };
}

function renderImageField(key, field, src, alt) {
  if (!src) {
    return React.createElement("div", {
      key,
      style: {
        ...absoluteBox(field),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6b7280",
        backgroundColor: "#f3f4f6",
        borderRadius: field.borderRadius,
        fontSize: 28,
      },
    }, alt);
  }
  return React.createElement("img", {
    key,
    src,
    alt: "",
    style: {
      ...absoluteBox(field),
      objectFit: field.objectFit,
      borderRadius: field.borderRadius,
    },
  });
}

function renderTextField(key, field, value) {
  const fitted = fitPosterText(value, field);
  const justifyContent = field.textAlign === "center"
    ? "center"
    : field.textAlign === "right" ? "flex-end" : "flex-start";
  return React.createElement("div", {
    key,
    style: {
      ...absoluteBox(field),
      display: "flex",
      alignItems: key === "memo" ? "flex-start" : "center",
      justifyContent,
      whiteSpace: "pre-wrap",
      overflow: "hidden",
      fontFamily: "Pretendard",
      fontSize: fitted.fontSize,
      fontWeight: field.fontWeight,
      lineHeight: field.lineHeight,
      color: field.color,
      textAlign: field.textAlign,
    },
  }, fitted.text);
}

export async function renderPoster(caseData, templateRow) {
  const template = serializePosterTemplate(templateRow) || {
    id: "default",
    name: "기본 포스터",
    version: 1,
    layout: parsePosterLayout(null),
    backgroundImageUrl: DEFAULT_BACKGROUND_PATH,
  };
  const layout = parsePosterLayout(template.layout);
  const [fontData, background, photo, qr] = await Promise.all([
    getFontData(),
    imageSourceToDataUrl(template.backgroundImageUrl, DEFAULT_BACKGROUND_PATH),
    imageSourceToDataUrl(caseData?.photoUrl || ""),
    imageSourceToDataUrl(caseData?.qrCodeUrl || ""),
  ]);

  const root = React.createElement(
    "div",
    {
      style: {
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      },
    },
    background
      ? React.createElement("img", {
        src: background,
        alt: "",
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
      })
      : null,
    renderImageField("photo", layout.photo, photo, "대상자 사진"),
    renderImageField("qr", layout.qr, qr, "QR 코드"),
    renderTextField("name", layout.name, caseData?.name || "이름"),
    renderTextField("age", layout.age, caseData?.age || "나이 미상"),
    renderTextField("gender", layout.gender, caseData?.gender || "성별 미상"),
    renderTextField("memo", layout.memo, caseData?.guardianMemo || "보호자 메모가 없습니다."),
  );

  const response = new ImageResponse(root, {
    width: layout.canvas.width,
    height: layout.canvas.height,
    fonts: [
      { name: "Pretendard", data: fontData, weight: 400, style: "normal" },
      { name: "Pretendard", data: fontData, weight: 700, style: "normal" },
      { name: "Pretendard", data: fontData, weight: 800, style: "normal" },
    ],
  });
  return Buffer.from(await response.arrayBuffer());
}

export async function renderPosterDataUrl(caseData, template) {
  const buffer = await renderPoster(caseData, template);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export const POSTER_RENDERER_DEFAULT_BACKGROUND = DEFAULT_BACKGROUND_PATH;
