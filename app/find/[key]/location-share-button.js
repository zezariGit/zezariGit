"use client";

import { useState } from "react";

export default function LocationShareButton({ qrKey }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [consented, setConsented] = useState(false);

  const shareLocation = async () => {
    setMessage("");
    setMapUrl("");

    if (!consented) {
      setMessage("위치정보 수집·이용 및 보호자 제공에 동의해 주세요.");
      return;
    }

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
          consent: true,
          consentVersion: "2026-08-09",
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
      <div className="find-location-consent">
        <label>
          <input
            type="checkbox"
            checked={consented}
            onChange={(event) => setConsented(event.target.checked)}
          />
          <span>현재 위치의 수집·이용 및 지정 보호자 제공에 동의합니다.</span>
        </label>
        <p>위도·경도·정확도는 안전한 인계를 위해 보호자에게 전달되며 24시간 후 자동 파기됩니다.</p>
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
