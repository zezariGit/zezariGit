"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import {
  generateQrCodes,
  isDbAdminSession,
  setGuardianActive,
  setGuardianAdmin,
  setQrActive,
  setQrSubject,
  setSubscriptionPlanPrice,
} from "../../lib/db";

export async function setGuardianActiveAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  await setGuardianActive(formData);
  revalidatePath("/admin");
}

export async function generateQrCodesAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  await generateQrCodes(formData);
  revalidatePath("/admin");
}

export async function setQrActiveAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  await setQrActive(formData);
  revalidatePath("/admin");
}

export async function setQrSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  await setQrSubject(formData);
  revalidatePath("/admin");
  const returnTo = String(formData.get("returnTo") || "").trim();
  if (returnTo) redirect(returnTo);
}

export async function setGuardianAdminAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  await setGuardianAdmin(formData);
  revalidatePath("/admin");
}

export async function setSubscriptionPlanPriceAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  await setSubscriptionPlanPrice(formData);
  revalidatePath("/admin");
  revalidatePath("/");
}
