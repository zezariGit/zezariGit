"use client";

import { useRef, useState } from "react";

const POSTCODE_SCRIPT_URL = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

let postcodeScriptPromise;

function loadPostcodeScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
  if (window.kakao?.Postcode) return Promise.resolve();

  if (!postcodeScriptPromise) {
    postcodeScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${POSTCODE_SCRIPT_URL}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("postcode script load failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = POSTCODE_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("postcode script load failed"));
      document.head.appendChild(script);
    });
  }

  return postcodeScriptPromise;
}

function buildAddress(data) {
  const baseAddress = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
  let extraAddress = "";

  if (data.userSelectedType === "R") {
    if (data.bname && /[동로가]$/.test(data.bname)) {
      extraAddress += data.bname;
    }
    if (data.buildingName && data.apartment === "Y") {
      extraAddress += extraAddress ? `, ${data.buildingName}` : data.buildingName;
    }
    if (extraAddress) {
      extraAddress = ` (${extraAddress})`;
    }
  }

  return [data.zonecode ? `(${data.zonecode})` : "", baseAddress, extraAddress]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export default function KakaoPostcodeAddress({ defaultValue = "" }) {
  const [address, setAddress] = useState(defaultValue);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const openPostcode = async () => {
    setLoading(true);
    setMessage("");

    try {
      await loadPostcodeScript();
      new window.kakao.Postcode({
        oncomplete(data) {
          setAddress(buildAddress(data));
          setMessage("주소가 선택되었습니다. 상세주소가 있으면 이어서 입력해 주세요.");
          window.setTimeout(() => inputRef.current?.focus(), 0);
        },
      }).open();
    } catch {
      setMessage("주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="postcode-address-field">
      <div className="postcode-address-row">
        <input
          ref={inputRef}
          name="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="주소 검색 후 상세주소를 입력해 주세요"
        />
        <button className="action secondary postcode-search-button" type="button" onClick={openPostcode} disabled={loading}>
          {loading ? "불러오는 중" : "주소 검색"}
        </button>
      </div>
      {message && <p className="field-helper" role="status">{message}</p>}
    </div>
  );
}
