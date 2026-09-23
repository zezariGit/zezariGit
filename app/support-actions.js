"use server";

import { getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminSession } from "../lib/admin";
import { authOptions } from "../lib/auth";
import {
  endAdminSupportSession,
  isDbAdminSession,
  startAdminSupportSession,
} from "../lib/db";

const SUPPORT_SESSION_MAX_AGE_SECONDS = 2 * 60 * 60;

export async function startAdminSupportLoginAction(formData) {
  const session = await getServerSession(authOptions);
  const authorized = isAdminSession(session) || (await isDbAdminSession(session));
  if (!authorized) throw new Error("관리자 권한이 필요합니다.");

  const targetGuardianId = String(formData.get("targetGuardianId") || "").trim();
  let support;
  try {
    support = await startAdminSupportSession(session, targetGuardianId, await getRequestMeta());
    await setSessionCookie({
      sub: support.target.google_id,
      name: support.target.name || "보호자",
      email: support.target.email || support.target.google_email || "",
      authProvider: "support",
      authUserId: support.target.google_id,
      authPhone: support.target.phone || "",
      supportMode: true,
      supportSessionId: support.supportSessionId,
      adminActorGuardianId: support.actor.id,
      adminActorName: support.actor.name || "관리자",
      supportGuardianName: support.target.name || "보호자",
    }, SUPPORT_SESSION_MAX_AGE_SECONDS);
  } catch (error) {
    redirect(withNotice("/admin?section=support", error.message || "사용자지원 로그인을 시작하지 못했습니다.", "error"));
  }

  redirect(withNotice("/", `${support.target.name || "보호자"} 계정으로 사용자지원 로그인을 시작했습니다.`));
}

export async function endAdminSupportLoginAction() {
  const session = await getServerSession(authOptions);
  let actor;
  try {
    actor = await endAdminSupportSession(session, { reason: "admin_return" });
    await setSessionCookie({
      sub: actor.google_id,
      name: actor.name || "관리자",
      email: actor.email || actor.google_email || "",
      authProvider: "phone",
      authUserId: actor.google_id,
      authPhone: actor.phone || "",
    }, authOptions.session.maxAge);
  } catch (error) {
    redirect(withNotice("/", error.message || "관리자 계정으로 돌아가지 못했습니다.", "error"));
  }

  redirect(withNotice("/admin?section=support", "관리자 계정으로 돌아왔습니다."));
}

async function setSessionCookie(token, maxAge) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("인증 환경설정이 필요합니다.");

  const value = await encode({ token, secret, maxAge });
  const cookieStore = await cookies();
  cookieStore.set(authOptions.cookies.sessionToken.name, value, {
    ...authOptions.cookies.sessionToken.options,
    maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
  });
}

async function getRequestMeta() {
  const requestHeaders = await headers();
  return {
    ipAddress: (requestHeaders.get("x-forwarded-for") || "").split(",")[0]?.trim()
      || requestHeaders.get("x-real-ip")
      || "",
    userAgent: requestHeaders.get("user-agent") || "",
  };
}

function withNotice(path, message, type = "success") {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}notice=${encodeURIComponent(message)}&noticeType=${encodeURIComponent(type)}`;
}
