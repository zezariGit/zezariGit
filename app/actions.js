"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import {
  activateQrForGuardian,
  createSubjectAd,
  deleteSubject,
  endSubjectAd,
  pauseSubjectAd,
  resumeSubjectAd,
  saveGuardianProfile,
  saveSubject,
} from "../lib/db";

export async function saveGuardianAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await saveGuardianProfile(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=guardian", error.message || "필수값을 확인해주세요.", "error"));
  }
  redirect(withNotice("/?tab=guardian", "보호자 정보가 저장되었습니다."));
}

export async function saveSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  let result;
  try {
    result = await saveSubject(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=subjects", error.message || "필수값을 확인해주세요.", "error"));
  }
  if (result?.isNew) {
    redirect(withNotice(`/?tab=subjects&registered=${encodeURIComponent(result.subjectId)}`, "관리대상 등록이 완료되었습니다."));
  }
  redirect(withNotice("/?tab=subjects", "관리대상 정보가 수정되었습니다."));
}

export async function deleteSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await deleteSubject(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=subjects", error.message || "삭제하지 못했습니다.", "error"));
  }
  redirect(withNotice("/?tab=subjects", "관리대상 정보가 삭제되었습니다."));
}

export async function createSubjectAdAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await createSubjectAd(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 신청 정보를 확인해 주세요.", "error"));
  }
  redirect(withNotice("/?tab=dashboard", "광고 신청이 저장되었습니다."));
}

export async function pauseSubjectAdAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await pauseSubjectAd(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 일시정지에 실패했습니다.", "error"));
  }
  redirect(withNotice("/?tab=dashboard", "광고가 일시정지되었습니다."));
}

export async function resumeSubjectAdAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await resumeSubjectAd(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 재개에 실패했습니다.", "error"));
  }
  redirect(withNotice("/?tab=dashboard", "광고가 재개되었습니다."));
}

export async function endSubjectAdAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await endSubjectAd(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 종료에 실패했습니다.", "error"));
  }
  redirect(withNotice("/?tab=dashboard", "광고가 종료되었습니다."));
}

export async function activateQrAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  const publicKey = String(formData.get("publicKey") || "").trim();
  try {
    await activateQrForGuardian(session, publicKey);
    revalidatePath(`/find/${publicKey}`);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(`/find/${publicKey}`, error.message || "QR 활성화에 실패했습니다.", "error"));
  }
  redirect(withNotice(`/find/${publicKey}`, "QR 코드가 활성화되었습니다. 오늘부터 구독기간이 시작됩니다."));
}

function withNotice(path, message, type = "success") {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("notice", message);
  params.set("noticeType", type);
  return `${base}?${params.toString()}`;
}
