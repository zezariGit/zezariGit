import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { getDashboardData } from "../../lib/db";
import MissingReportSelector from "./missing-report-selector";

export default async function MissingReportPage() {
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
      <MissingReportSelector subjects={subjects} />
    </main>
  );
}
