import { NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get("query") || "").trim();

  if (query.length < 2) {
    return NextResponse.json({ message: "검색어를 2글자 이상 입력해 주세요." }, { status: 400 });
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("countrycodes", "kr");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Language": "ko,en;q=0.8",
        "User-Agent": "REAL_QR_FIND/1.0 (https://zezari.vercel.app)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ message: "지도 검색 서비스 응답이 원활하지 않습니다." }, { status: 502 });
    }

    const data = await response.json();
    const results = Array.isArray(data)
      ? data
        .map((item) => normalizeMapResult(item))
        .filter(Boolean)
      : [];

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ message: "지역 검색 중 오류가 발생했습니다." }, { status: 502 });
  }
}

function normalizeMapResult(item) {
  const lat = Number(item?.lat);
  const lng = Number(item?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const address = item?.address || {};
  const label = [
    address.city || address.county || address.state,
    address.borough || address.city_district || address.town || address.suburb || address.village,
    address.neighbourhood || address.quarter || address.road,
  ].filter(Boolean).join(" ");

  return {
    id: String(item?.place_id || `${lat},${lng}`),
    label: label || String(item?.name || item?.display_name || "검색 위치"),
    address: String(item?.display_name || ""),
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
  };
}
