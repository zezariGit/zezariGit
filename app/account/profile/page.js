import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { getDashboardData } from "../../../lib/db";
import StatusToast from "../../status-toast";
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
  const previewState = ["phone-change", "completed"].includes(String(params?.state || "")) ? params.state : "";
  const session = preview ? { user: { provider: "phone" } } : await getServerSession(authOptions);
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
  return (
    <main className="account-page guardian-profile-page">
      <section className="account-panel guardian-profile-panel">
        <GuardianProfileForm
          guardian={guardian}
          preview={preview}
          previewState={previewState}
        />
      </section>
      <StatusToast message={params?.notice || ""} type={params?.noticeType || "success"} />
    </main>
  );
}
