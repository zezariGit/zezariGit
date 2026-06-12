"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import { setGuardianActive } from "../../lib/db";

export async function setGuardianActiveAction(formData) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) throw new Error("관리자 권한이 필요합니다.");

  await setGuardianActive(formData);
  revalidatePath("/admin");
}
