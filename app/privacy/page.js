import BackButton from "../back-button";
import ServiceRegulationDocument from "../service-regulation-document";
import { getServiceRegulation } from "../../lib/db";
import { SERVICE_REGULATION_META } from "../../lib/service-regulations";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const type = regulationType(params?.type);
  const title = SERVICE_REGULATION_META[type].title;
  return {
    title: `${title} | zezari`,
    description: `제자리 서비스 ${title}`,
  };
}

export default async function PrivacyPolicyPage({ searchParams }) {
  const params = await searchParams;
  const type = regulationType(params?.type);
  const document = await getServiceRegulation(type);

  return (
    <main className="privacy-page">
      <article className="privacy-shell managed-regulation-shell">
        <header className="privacy-header managed-regulation-header">
          <BackButton className="privacy-back-link" href="/?panel=my" replace label="설정으로 돌아가기" />
          <div>
            <img className="privacy-brand-logo" src="/assets/finder/zezari-wordmark.png" alt="제자리" />
            <h1>{document.title}</h1>
          </div>
        </header>

        <section className="privacy-section managed-regulation-content" aria-label={document.title}>
          <ServiceRegulationDocument document={document} />
        </section>

        <footer className="privacy-company">
          <strong>제자리</strong>
          <span>대표자 이진영, 이진선 · 사업자등록번호 639-58-00963</span>
          <span>통신판매신고번호 2024-경기김포-8217</span>
          <span>경기도 김포시 김포한강10로133번길 127, 4층 438-G190호(구래동)</span>
          <span>대표메일 general@zezari.com · 대표전화 1668-1290</span>
        </footer>
      </article>
    </main>
  );
}

function regulationType(value) {
  return ["privacy", "service", "notification"].includes(value) ? value : "privacy";
}
