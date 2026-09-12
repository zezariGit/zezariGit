import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { getDashboardData } from "../../lib/db";
import MissingReportSelector from "./missing-report-selector";

export default async function MissingReportPage({ searchParams }) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV === "development" && params?.preview === "1";

  if (preview) {
    return (
      <main className="missing-report-page">
        <MissingReportSelector subjects={PREVIEW_SUBJECTS} />
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { subjects } = await getDashboardData(session, {
    includeSubjectDetails: false,
    includeSubscription: false,
    includeSubscriptionPlans: false,
    includeAdDailyRate: false,
  });

  return (
    <main className="missing-report-page">
      <MissingReportSelector
        subjects={subjects}
        initialSubjectId={String(params?.subject || "")}
        forceNew={params?.newAd === "1"}
      />
    </main>
  );
}

const PREVIEW_SUBJECTS = [
  { id: "preview-safe", name: "김제자리", birth_date: "2019-06-20", status: "안전", photo_url: "/assets/subject-registration/photo-placeholder.png" },
  {
    id: "preview-searching",
    name: "박제자리",
    birth_date: "2022-09-02",
    status: "찾는중",
    photo_url: "/assets/subject-registration/photo-placeholder.png",
    ad_id: "preview-ad",
    ad_region: "서울특별시 강남구 역삼동",
    ad_start_date: "2026-09-01",
    ad_end_date: "2026-09-07",
    ad_amount: 30000,
    ad_reach_count: 6000,
    ad_creative_image_url: "/assets/missing-ad-template.png",
  },
  { id: "preview-purchase", name: "이제자리", birth_date: "2010-03-23", status: "상품구매필요", photo_url: "/assets/subject-registration/photo-placeholder.png" },
];
