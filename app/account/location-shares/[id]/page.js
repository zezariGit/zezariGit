import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { getGuardianLocationShare } from "../../../../lib/db";
import SharedLocationView from "./shared-location-view";

export const dynamic = "force-dynamic";

const PREVIEW_SHARE = {
  id: "preview",
  subject_name: "김제자리",
  subject_photo_url: "/assets/subject-registration/photo-placeholder.png",
  latitude: 37.5665,
  longitude: 126.978,
  accuracy: 18,
  address_label: "서울특별시 중구 세종대로 110",
  kakao_map_url: "https://map.kakao.com/link/map/%EC%A0%9C%EC%9E%90%EB%A6%AC%20%EC%9C%84%EC%B9%98%EA%B3%B5%EC%9C%A0,37.5665,126.978",
  created_at: "2026-09-13T05:30:00.000Z",
  destroyed_at: null,
};

export default async function GuardianLocationSharePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const preview = process.env.NODE_ENV === "development" && resolvedParams?.id === "preview" && resolvedSearchParams?.preview === "1";
  const session = preview ? { user: { provider: "credentials" } } : await getServerSession(authOptions);
  if (!session) redirect("/");

  const share = preview ? PREVIEW_SHARE : await getGuardianLocationShare(session, resolvedParams?.id);
  if (!share) notFound();

  return <SharedLocationView share={share} />;
}
