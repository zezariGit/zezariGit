"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { deleteSubject, saveGuardianProfile, saveSubject } from "../lib/db";

export async function saveGuardianAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await saveGuardianProfile(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=info", error.message || "필수값을 확인해주세요.", "error"));
  }
  redirect(withNotice("/?tab=info", "보호자 정보가 저장되었습니다."));
}

export async function saveSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await saveSubject(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=info", error.message || "필수값을 확인해주세요.", "error"));
  }
  redirect(withNotice("/?tab=info", "관리대상 정보가 저장되었습니다."));
}

export async function deleteSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await deleteSubject(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=info", error.message || "삭제하지 못했습니다.", "error"));
  }
  redirect(withNotice("/?tab=info", "관리대상 정보가 삭제되었습니다."));
}

function withNotice(path, message, type = "success") {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("notice", message);
  params.set("noticeType", type);
  return `${base}?${params.toString()}`;
}
