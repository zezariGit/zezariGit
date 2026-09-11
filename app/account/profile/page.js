import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { getDashboardData } from "../../../lib/db";
import { isAdminSession } from "../../../lib/admin";
import StatusToast from "../../status-toast";
import { AccountTopbar } from "../account-ui";
import GuardianProfileForm from "../guardian-profile-form";

const previewGuardian = {
  id: "preview-guardian",
  name: "홍길동",
  gender: "남성",
  birth_date: "1990-01-01",
  phone: "010-1234-5678",
  login_id: "zezari01",
  password_hash: "preview",
  address: "",
  address_detail: "",
  email: "",
};

export default async function GuardianProfilePage({ searchParams }) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV === "development" && params?.preview === "1";
  const previewProvider = socialProvider(params?.provider) ? params.provider : "credentials";
  const session = preview ? { user: { provider: previewProvider } } : await getServerSession(authOptions);
  if (!session) redirect("/");
  const guardian = preview
    ? previewGuardian
    : (await getDashboardData(session, {
        includeSubjects: false,
        includeSubjectDetails: false,
        includeSubscription: false,
        includeSubscriptionPlans: false,
        includeAdDailyRate: false,
      })).guardian;
  const admin = isAdminSession(session) || Number(guardian?.is_admin || 0) === 1;

  return (
    <main className="account-page guardian-profile-page">
      <section className="account-panel guardian-profile-panel">
        <AccountTopbar title="보호자 정보" />
        <GuardianProfileForm
          guardian={guardian}
          provider={session.user?.provider || "credentials"}
          preview={preview}
          admin={admin}
        />
      </section>
      <StatusToast message={params?.notice || ""} type={params?.noticeType || "success"} />
    </main>
  );
}

function socialProvider(value) {
  return ["google", "naver", "kakao", "facebook"].includes(String(value || "").trim().toLowerCase());
}
