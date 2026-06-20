"use client";

import { useEffect, useRef, useState } from "react";

const POSTCODE_SCRIPT_URL = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

let postcodeScriptPromise;

function postcodeReady() {
  return typeof window !== "undefined" && typeof window.daum?.Postcode === "function";
}

function loadPostcodeScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
  if (postcodeReady()) return Promise.resolve();
  if (postcodeScriptPromise) return postcodeScriptPromise;

  postcodeScriptPromise = new Promise((resolve, reject) => {
    let settled = false;
    let script = document.querySelector(`script[src="${POSTCODE_SCRIPT_URL}"]`);

    const finish = (error) => {
      if (settled) return;
      settled = true;
      window.clearInterval(pollTimer);
      window.clearTimeout(timeoutTimer);
      if (!error && postcodeReady()) {
        resolve();
        return;
      }
      script?.remove();
      postcodeScriptPromise = undefined;
      reject(error || new Error("postcode namespace unavailable"));
    };

    const pollTimer = window.setInterval(() => {
      if (postcodeReady()) finish();
    }, 50);
    const timeoutTimer = window.setTimeout(
      () => finish(new Error("postcode script load timeout")),
      10000
    );

    if (!script) {
      script = document.createElement("script");
      script.src = POSTCODE_SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", () => finish(), { once: true });
    script.addEventListener("error", () => finish(new Error("postcode script load failed")), { once: true });
  });

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
    if (extraAddress) extraAddress = ` (${extraAddress})`;
  }

  return [data.zonecode ? `(${data.zonecode})` : "", baseAddress, extraAddress]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export default function KakaoPostcodeAddress({
  defaultValue = "",
  defaultDetailValue = "",
  addressName = "address",
  detailName = "addressDetail",
  onAddressChange,
  onDetailChange,
}) {
  const [address, setAddress] = useState(defaultValue);
  const [detailAddress, setDetailAddress] = useState(defaultDetailValue);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const postcodeContainerRef = useRef(null);
  const detailInputRef = useRef(null);

  useEffect(() => {
    loadPostcodeScript().catch(() => {
      // A later button click retries and shows the user-facing error.
    });
  }, []);

  useEffect(() => {
    if (!open || !postcodeContainerRef.current || !postcodeReady()) return undefined;
    const container = postcodeContainerRef.current;
    container.replaceChildren();

    const postcode = new window.daum.Postcode({
      oncomplete(data) {
        const nextAddress = buildAddress(data);
        setAddress(nextAddress);
        setDetailAddress("");
        onAddressChange?.(nextAddress);
        onDetailChange?.("");
        setMessage("주소가 선택되었습니다.");
        setOpen(false);
        window.setTimeout(() => detailInputRef.current?.focus(), 0);
      },
      width: "100%",
      height: "100%",
    });
    postcode.embed(container, { autoClose: false });

    return () => container.replaceChildren();
  }, [open, onAddressChange, onDetailChange]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const openPostcode = async () => {
    setLoading(true);
    setMessage("");

    try {
      await loadPostcodeScript();
      setOpen(true);
    } catch {
      setMessage("주소 검색을 불러오지 못했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const changeAddress = (value) => {
    setAddress(value);
    onAddressChange?.(value);
  };

  const changeDetailAddress = (value) => {
    setDetailAddress(value);
    onDetailChange?.(value);
  };

  return (
    <div className="postcode-address-field">
      <div className="postcode-address-row">
        <input
          name={addressName}
          value={address}
          onChange={(event) => changeAddress(event.target.value)}
          placeholder="주소를 검색해 주세요"
          autoComplete="address-line1"
          required
        />
        <button className="action secondary postcode-search-button" type="button" onClick={openPostcode} disabled={loading}>
          {loading ? "불러오는 중" : "주소 검색"}
        </button>
      </div>
      <input
        ref={detailInputRef}
        className="postcode-detail-input"
        name={detailName}
        value={detailAddress}
        onChange={(event) => changeDetailAddress(event.target.value)}
        placeholder="상세주소를 입력해 주세요 (동·호수 등)"
        autoComplete="address-line2"
      />
      {message && <p className="field-helper" role="status">{message}</p>}

      {open && (
        <div className="postcode-modal-backdrop" role="dialog" aria-modal="true" aria-label="주소 검색">
          <section className="postcode-modal">
            <header>
              <strong>주소 검색</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="주소 검색 닫기">닫기</button>
            </header>
            <div className="postcode-embed" ref={postcodeContainerRef} />
          </section>
        </div>
      )}
    </div>
  );
}
