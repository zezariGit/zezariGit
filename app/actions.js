"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { deleteSubject, saveGuardianProfile, saveSubject } from "../lib/db";

export async function saveGuardianAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  await saveGuardianProfile(session, formData);
  revalidatePath("/");
}

export async function saveSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  await saveSubject(session, formData);
  revalidatePath("/");
}

export async function deleteSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  await deleteSubject(session, formData);
  revalidatePath("/");
}
