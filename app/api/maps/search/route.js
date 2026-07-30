import { NextResponse } from "next/server";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get("query") || "").trim();
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (searchParams.has("lat") && searchParams.has("lng") && Number.isFinite(lat) && Number.isFinite(lng)) {
    return reverseGeocode(lat, lng);
  }

  if (query.length < 2) {
    return NextResponse.json({ message: "검색어를 2글자 이상 입력해 주세요." }, { status: 400 });
  }

  const url = new URL(NOMINATIM_SEARCH_URL);
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
        "User-Agent": "REAL_QR_FIND/1.0 (https://zezari.family)",
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

async function reverseGeocode(lat, lng) {
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ message: "위치 좌표를 확인해 주세요." }, { status: 400 });
  }

  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "12");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Language": "ko,en;q=0.8",
        "User-Agent": "REAL_QR_FIND/1.0 (https://zezari.family)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ message: "선택한 위치의 도시를 확인하지 못했습니다." }, { status: 502 });
    }

    const item = await response.json();
    const result = normalizeMapResult(item);
    if (!result) {
      return NextResponse.json({ message: "선택한 위치의 도시를 확인하지 못했습니다." }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ message: "선택한 위치의 도시를 확인하는 중 오류가 발생했습니다." }, { status: 502 });
  }
}

function normalizeMapResult(item) {
  const lat = Number(item?.lat);
  const lng = Number(item?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const address = item?.address || {};
  const label = buildApproximateRegionLabel(address)
    || String(item?.name || item?.display_name || "선택 지역");

  return {
    id: String(item?.place_id || `${lat},${lng}`),
    label,
    address: String(item?.display_name || ""),
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
  };
}

function buildApproximateRegionLabel(address = {}) {
  const region = address.state || address.city || address.province || address.county;
  const city = address.city && address.city !== region ? address.city : "";
  const district = address.city_district || address.borough
    || (address.county !== region ? address.county : "")
    || address.town || address.municipality;
  const locality = address.suburb || address.village || address.neighbourhood || address.quarter;
  return [...new Set([region, city, district, locality].filter(Boolean))].slice(0, 3).join(" ");
}
