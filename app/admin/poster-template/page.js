import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { isAdminSession } from "../../../lib/admin";
import { authOptions } from "../../../lib/auth";
import { getPosterTemplateAdminData, isDbAdminSession } from "../../../lib/db";
import AdminWorkspace from "../admin-workspace";
import PosterTemplateEditor from "../poster-template-editor";

export const dynamic = "force-dynamic";

export default async function PosterTemplateAdminPage({ searchParams }) {
  const params = await searchParams;
  const previewMode = process.env.NODE_ENV === "development" && params?.preview === "1";
  const session = previewMode ? null : await getServerSession(authOptions);
  const authorized = previewMode || (session && (isAdminSession(session) || (await isDbAdminSession(session))));
  if (!authorized) redirect("/admin");

  const data = await getPosterTemplateAdminData();
  return (
    <AdminWorkspace activeSection="poster-template">
      <main className="poster-template-admin">
        <header className="poster-template-admin-header">
          <div>
            <p>온라인 실종 광고</p>
            <h1>포스터 템플릿 관리</h1>
          </div>
          <span>활성 버전 v{data.template.version}</span>
        </header>
        <PosterTemplateEditor
          initialTemplate={data.template}
          initialHistory={data.history}
          previewMode={previewMode}
        />
      </main>
    </AdminWorkspace>
  );
}
