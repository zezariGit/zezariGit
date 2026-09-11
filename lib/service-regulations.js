export const SERVICE_REGULATION_TYPES = ["privacy", "service", "notification"];

export const SERVICE_REGULATION_META = {
  privacy: { title: "개인정보처리방침", tabLabel: "개인정보" },
  service: { title: "이용약관", tabLabel: "서비스이용" },
  notification: { title: "알림동의", tabLabel: "알림" },
};

const paragraph = (text, bold = false, fontSize = 16) => ({ text, bold, fontSize });

export const DEFAULT_SERVICE_REGULATIONS = {
  privacy: {
    id: "privacy",
    title: SERVICE_REGULATION_META.privacy.title,
    blocks: [
      paragraph("1. 수집하는 개인정보", true, 20),
      paragraph("제자리는 회원가입과 서비스 제공을 위해 이름, 성별, 생년월일, 휴대전화번호, 아이디 및 서비스 이용 기록을 수집할 수 있습니다."),
      paragraph("2. 개인정보 이용 목적", true, 20),
      paragraph("수집한 정보는 회원 확인, 대상자 페이지 운영, 상품 결제, 보호자 연락 및 온라인 실종 광고 제공을 위해 이용합니다."),
      paragraph("3. 대상자 정보 처리", true, 20),
      paragraph("보호자가 등록한 대상자의 사진, 이름, 생년월일, 성별, 보호자 메시지 및 선택한 음성 정보는 대상자 전용 페이지 제공에 이용됩니다."),
      paragraph("4. 위치정보 처리", true, 20),
      paragraph("발견자가 위치 공유에 동의한 경우 해당 위치는 보호자에게 전달하는 목적으로만 이용합니다."),
      paragraph("5. 개인정보 제공 및 위탁", true, 20),
      paragraph("서비스 제공에 필요한 경우 사전에 안내하고 동의를 받은 범위에서 개인정보를 제공하거나 처리 업무를 위탁합니다."),
      paragraph("6. 보유 및 파기", true, 20),
      paragraph("개인정보는 이용 목적이 달성되거나 보유 기간이 종료되면 관련 법령에 따라 안전하게 파기합니다."),
      paragraph("7. 이용자의 권리", true, 20),
      paragraph("이용자는 개인정보의 열람, 정정, 삭제 및 처리 정지를 요청할 수 있습니다."),
    ],
  },
  service: {
    id: "service",
    title: SERVICE_REGULATION_META.service.title,
    blocks: [
      paragraph("제1조 서비스 이용", true, 20),
      paragraph("제자리는 보호자와 대상자의 안전을 지원하기 위한 서비스를 제공합니다. 회원은 본 약관을 확인하고 서비스가 정한 절차에 따라 이용합니다."),
      paragraph("제2조 회원가입 및 계정 관리", true, 20),
      paragraph("회원은 정확한 정보를 입력해야 하며, 계정과 비밀번호를 안전하게 관리할 책임이 있습니다."),
      paragraph("제3조 대상자 정보", true, 20),
      paragraph("보호자는 대상자의 사진, 이름, 생년월일, 성별, 보호자 메시지 및 선택한 음성 정보를 등록하고 관리할 수 있습니다."),
      paragraph("제4조 QR 상품 및 안심번호", true, 20),
      paragraph("QR 상품과 보호자 안심번호는 대상자 발견 시 보호자와의 연락을 지원하기 위해 제공됩니다."),
      paragraph("제5조 온라인 실종 광고", true, 20),
      paragraph("온라인 실종 광고는 선택한 지역, 범위 및 기간을 기준으로 진행되며 META의 검토가 완료된 후 게재됩니다."),
      paragraph("제6조 결제·취소·환불", true, 20),
      paragraph("결제 금액과 제공 조건은 결제 전에 안내합니다. 이미 집행된 광고 비용 등 환불이 제한되는 항목은 결제 전에 별도로 고지합니다."),
    ],
  },
  notification: {
    id: "notification",
    title: SERVICE_REGULATION_META.notification.title,
    blocks: [
      paragraph("1. 알림 제공 목적", true, 20),
      paragraph("제자리는 서비스 이용에 필요한 진행 상황과 중요한 안전 정보를 보호자에게 안내합니다."),
      paragraph("2. 서비스 알림", true, 20),
      paragraph("회원가입, 대상자 등록, QR 상품, 결제, 안심번호 및 계정 관련 안내를 앱 푸시 또는 문자로 제공할 수 있습니다."),
      paragraph("3. 실종 신고 및 광고 알림", true, 20),
      paragraph("실종 신고 접수, 광고 검토, 광고 게재, 변경, 일시정지 및 종료 상태를 안내할 수 있습니다."),
      paragraph("4. 안전 관련 알림", true, 20),
      paragraph("대상자 QR 코드가 확인되거나 발견자가 위치 공유에 동의한 경우 관련 내용을 보호자에게 알릴 수 있습니다."),
      paragraph("5. 선택적 알림", true, 20),
      paragraph("혜택, 이벤트 및 서비스 소식 등 선택적 알림은 별도의 동의를 받은 경우에만 발송합니다."),
      paragraph("6. 수신 거부", true, 20),
      paragraph("선택적 알림은 기기 또는 서비스 설정에서 수신을 거부할 수 있습니다. 다만 서비스 운영과 안전에 필요한 필수 안내는 계속 제공될 수 있습니다."),
    ],
  },
};

export function normalizeServiceRegulationDocument(value, type) {
  const fallback = DEFAULT_SERVICE_REGULATIONS[type] || DEFAULT_SERVICE_REGULATIONS.privacy;
  const source = value && typeof value === "object" ? value : {};
  const sourceBlocks = Array.isArray(source.blocks) ? source.blocks : [];
  const blocks = sourceBlocks
    .slice(0, 120)
    .map((block) => ({
      text: String(block?.text || "").replace(/\r\n/g, "\n").slice(0, 4000),
      bold: Boolean(block?.bold),
      fontSize: [14, 16, 18, 20, 24].includes(Number(block?.fontSize)) ? Number(block.fontSize) : 16,
    }))
    .filter((block) => block.text.trim());

  return {
    id: type,
    title: SERVICE_REGULATION_META[type]?.title || fallback.title,
    blocks: blocks.length ? blocks : fallback.blocks,
  };
}

export function parseServiceRegulationJson(value, type) {
  try {
    return normalizeServiceRegulationDocument(JSON.parse(String(value || "")), type);
  } catch {
    return normalizeServiceRegulationDocument(null, type);
  }
}
