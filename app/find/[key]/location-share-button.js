"use client";

import { useState } from "react";

export default function LocationShareButton({ qrKey }) {
  const [loading, setLoading] = useState(false);
  const [finderContact, setFinderContact] = useState("");
  const [addressLabel, setAddressLabel] = useState("");
  const [message, setMessage] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  const shareLocation = async () => {
    setMessage("");
    setMapUrl("");

    if (!navigator.geolocation) {
      setMessage("이 브라우저에서는 위치공유를 사용할 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const position = await getCurrentPosition();
      const response = await fetch(`/api/find/${encodeURIComponent(qrKey)}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          finderContact,
          addressLabel,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "위치공유에 실패했습니다.");
      }
      setMapUrl(data.mapUrl || "");
      setMessage(data.message || "위치공유가 완료되었습니다.");
    } catch (error) {
      setMessage(locationErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="find-location-share">
      <div className="find-location-fields">
        <label>
          발견자 연락처 <span>(선택)</span>
          <input
            value={finderContact}
            onChange={(event) => setFinderContact(event.target.value)}
            placeholder="010-0000-0000"
            inputMode="tel"
            maxLength={40}
          />
        </label>
        <label>
          위치 설명 <span>(선택)</span>
          <input
            value={addressLabel}
            onChange={(event) => setAddressLabel(event.target.value)}
            placeholder="예: 서울 송파구 올림픽공원 북문 근처"
            maxLength={200}
          />
        </label>
      </div>
      <button className="primary-button" type="button" onClick={shareLocation} disabled={loading}>
        {loading ? "위치 확인중" : "위치공유"}
      </button>
      {message && <p className="find-notify-message">{message}</p>}
      {mapUrl && (
        <a className="find-map-link" href={mapUrl} target="_blank" rel="noreferrer">
          공유한 위치 지도 열기
        </a>
      )}
    </div>
  );
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  });
}

function locationErrorMessage(error) {
  if (error?.code === 1) return "위치권한이 거부되었습니다. 브라우저 설정에서 위치권한을 허용해 주세요.";
  if (error?.code === 2) return "현재 위치를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  if (error?.code === 3) return "위치 확인 시간이 초과되었습니다. 다시 시도해 주세요.";
  return error?.message || "위치공유에 실패했습니다.";
}
