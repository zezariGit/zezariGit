import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 | zezari",
  description: "REAL_QR_FIND 제자리 서비스 개인정보처리방침",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      <article className="privacy-shell">
        <header className="privacy-header">
          <Link className="privacy-back-link" href="/" aria-label="사용자페이지로 돌아가기">‹</Link>
          <div>
            <p className="intro-kicker">REAL_QR_FIND</p>
            <h1>개인정보처리방침</h1>
            <p>
              제자리(이하 &quot;회사&quot;)는 이용자의 개인정보를 중요하게 생각하며 개인정보 보호법 등
              관련 법령을 준수합니다. 이 방침은 REAL_QR_FIND 서비스에서 어떤 정보를 왜 처리하고
              어떻게 보호하는지 안내합니다.
            </p>
            <span>시행일자: 2026년 7월 24일</span>
          </div>
        </header>

        <nav className="privacy-toc" aria-label="개인정보처리방침 목차">
          <a href="#privacy-purpose">1. 처리 목적과 항목</a>
          <a href="#privacy-retention">2. 보유기간과 파기</a>
          <a href="#privacy-public">3. 공개 및 제3자 제공</a>
          <a href="#privacy-consignment">4. 처리위탁과 외부 서비스</a>
          <a href="#privacy-location">5. 위치정보 처리</a>
          <a href="#privacy-rights">6. 이용자 권리</a>
          <a href="#privacy-children">7. 아동·관리대상 정보</a>
          <a href="#privacy-cookie">8. 쿠키와 자동수집</a>
          <a href="#privacy-security">9. 안전성 확보조치</a>
          <a href="#privacy-officer">10. 보호책임자</a>
          <a href="#privacy-remedy">11. 권익침해 구제</a>
          <a href="#privacy-change">12. 방침 변경</a>
        </nav>

        <section className="privacy-section" id="privacy-purpose">
          <h2>1. 개인정보의 처리 목적과 항목</h2>
          <p>회사는 서비스 제공에 필요한 범위에서 다음 정보를 처리합니다.</p>
          <div className="privacy-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>처리 목적</th>
                  <th>처리 항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>회원가입·로그인</td>
                  <td>회원 식별, 로그인, 계정 및 관리자 권한 관리</td>
                  <td>로그인 ID, 비밀번호 해시, 이름, 이메일, 휴대전화번호, 생년월일, SNS 제공자 식별값</td>
                </tr>
                <tr>
                  <td>SNS 간편로그인</td>
                  <td>Google·Kakao·Naver·Facebook 계정 인증</td>
                  <td>선택한 제공자가 전달하는 식별값, 이름, 이메일, 프로필 정보</td>
                </tr>
                <tr>
                  <td>휴대전화 인증</td>
                  <td>가입자 연락처 확인과 부정가입 방지</td>
                  <td>휴대전화번호, 인증번호 해시, 인증 토큰, 발송·검증 일시와 시도 횟수</td>
                </tr>
                <tr>
                  <td>보호자 정보</td>
                  <td>보호자 연락, 배송, 안심번호 연결, 고객 응대</td>
                  <td>이름, 연락처, 이메일, 주소와 상세주소, 안심번호, 관리 메모</td>
                </tr>
                <tr>
                  <td>관리대상 정보</td>
                  <td>QR 기반 발견 지원과 보호자 안내</td>
                  <td>이름, 생년월일, 성별, 사진, 상태, 보호자 메시지와 음성 녹음</td>
                </tr>
                <tr>
                  <td>QR 서비스</td>
                  <td>QR 배정·활성화·공개페이지 연결과 이용권 관리</td>
                  <td>QR 번호, 공개 키, 활성화 상태·일시, 관리대상 연결정보, 이용 이력</td>
                </tr>
                <tr>
                  <td>상품·구독·결제·배송</td>
                  <td>주문, 이용권, 결제, 환불, 배송과 고객지원</td>
                  <td>상품·디자인·수량·대상자, 주문번호, 결제금액·수단·결제키, 쿠폰, 수령인·연락처·배송지·송장번호</td>
                </tr>
                <tr>
                  <td>위치공유</td>
                  <td>관리대상 발견 위치를 보호자에게 알리고 운영 이력을 확인</td>
                  <td>위도, 경도, 위치 정확도, 지도 링크, QR·관리대상 연결정보, 접속 IP와 브라우저 정보</td>
                </tr>
                <tr>
                  <td>푸시 알림</td>
                  <td>발견, 위치공유, 운영 메시지 전송</td>
                  <td>브라우저 푸시 구독정보, 기기 구분정보, 알림 제목·내용·링크, 읽음 여부</td>
                </tr>
                <tr>
                  <td>온라인 실종광고</td>
                  <td>광고 신청·결제·심사·집행과 성과 확인</td>
                  <td>관리대상 광고소재, 선택 지역·좌표·반경, 기간·예산·결제정보, Meta 캠페인 식별값과 성과</td>
                </tr>
                <tr>
                  <td>서비스 운영</td>
                  <td>보안, 장애 대응, 부정이용 방지, 통계와 고객문의 처리</td>
                  <td>접속기록, IP, 브라우저·기기정보, 서비스 이용기록, 문의 제목·내용과 처리상태</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="privacy-note">
            결제카드 번호와 계좌 원문은 회사가 직접 저장하지 않으며, 결제 과정은 결제대행사의
            보안 화면에서 처리됩니다. 선택정보를 입력하지 않으면 일부 기능 이용이 제한될 수 있습니다.
          </p>
        </section>

        <section className="privacy-section" id="privacy-retention">
          <h2>2. 개인정보의 보유기간과 파기</h2>
          <p>
            개인정보는 원칙적으로 회원 탈퇴, 처리목적 달성 또는 동의 철회 시 지체 없이 파기합니다.
            다만 관계 법령에 따라 다음 기간 동안 별도로 보관할 수 있습니다.
          </p>
          <ul>
            <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
            <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
            <li>사이트 접속 기록: 3개월</li>
            <li>회원·관리대상·QR·위치·푸시 정보: 서비스 이용 중 보유하며 탈퇴 또는 목적 달성 후 법정 보존항목을 제외하고 파기</li>
          </ul>
          <p>
            전자적 파일은 복구하기 어려운 방법으로 삭제하고, 출력물은 분쇄 또는 소각합니다.
            법령상 보존이 필요한 정보는 다른 정보와 분리하여 보관합니다.
          </p>
        </section>

        <section className="privacy-section" id="privacy-public">
          <h2>3. 공개 QR 페이지와 제3자 제공</h2>
          <p>
            보호자가 QR을 활성화하고 유효한 이용권을 보유한 경우, QR을 스캔한 발견자에게 관리대상의
            이름, 생년월일, 성별, 사진, 현재 상태, 보호자 메시지·음성 및 안심번호가 표시될 수 있습니다.
            이는 관리대상 식별과 신속한 보호자 연락을 위한 기능입니다.
          </p>
          <p>
            공개 QR 페이지에는 보호자의 이름, 이메일, 주소 및 원래 휴대전화번호를 표시하지 않습니다.
            안심번호가 준비된 경우에만 해당 번호를 제공합니다.
          </p>
          <p>
            회사는 이용자의 동의 없이 처리 목적을 초과하여 제3자에게 개인정보를 제공하지 않습니다.
            다만 생명·신체에 대한 급박한 위험, 실종자 수색, 재난 대응 또는 법령에 근거한 적법한 요청이
            있는 경우 관계기관에 필요한 최소 정보를 제공할 수 있습니다.
          </p>
        </section>

        <section className="privacy-section" id="privacy-consignment">
          <h2>4. 개인정보 처리위탁과 외부 서비스</h2>
          <p>서비스 운영을 위해 다음 외부 서비스를 이용할 수 있으며 실제 설정·계약 범위에서만 처리합니다.</p>
          <div className="privacy-table-wrap">
            <table>
              <thead>
                <tr><th>서비스</th><th>이용 목적</th><th>관련 정보</th></tr>
              </thead>
              <tbody>
                <tr><td>Vercel</td><td>웹 서비스 호스팅과 서버 실행</td><td>접속정보와 서비스 처리 데이터</td></tr>
                <tr><td>Turso/libSQL</td><td>서비스 데이터베이스 저장</td><td>회원, 관리대상, QR, 주문, 알림 등 서비스 데이터</td></tr>
                <tr><td>Google·Kakao·Naver·Meta</td><td>SNS 로그인 인증</td><td>OAuth 식별값과 제공 동의한 프로필 정보</td></tr>
                <tr><td>Toss Payments</td><td>상품·구독·광고 결제와 취소·환불</td><td>주문번호, 금액, 결제수단과 결제 승인정보</td></tr>
                <tr><td>Bizcall</td><td>보호자 원전화번호를 대신하는 050 안심번호 연결</td><td>보호자 전화번호와 안심번호 연결정보</td></tr>
                <tr><td>문자 발송 사업자</td><td>회원가입 휴대전화 인증번호 발송</td><td>휴대전화번호와 인증 메시지</td></tr>
                <tr><td>Meta Marketing API</td><td>보호자가 신청한 온라인 실종광고 집행</td><td>광고소재, 대상 지역·반경·기간과 캠페인 성과</td></tr>
                <tr><td>브라우저 푸시 제공자</td><td>설치형 웹앱과 브라우저 알림 전송</td><td>푸시 엔드포인트와 암호화된 알림 데이터</td></tr>
              </tbody>
            </table>
          </div>
          <p className="privacy-note">
            일부 사업자의 서버가 국외에 위치할 수 있습니다. 회사는 외부 서비스의 변경이나 처리범위
            변경 시 이 방침 또는 별도 공지를 통해 안내합니다.
          </p>
        </section>

        <section className="privacy-section" id="privacy-location">
          <h2>5. 위치정보 처리</h2>
          <p>
            발견자가 공개 QR 페이지에서 <strong>위치공유</strong>를 직접 누르고 브라우저의 위치 권한을
            허용한 경우에만 위도, 경도와 정확도를 수집합니다. 좌표는 카카오맵·네이버지도 링크 생성,
            보호자 푸시 알림 및 관리자 이력 확인에 사용됩니다.
          </p>
          <p>
            현재 화면은 발견자의 전화번호나 위치 설명을 요구하지 않습니다. 다만 이전 버전에서 이용자가
            직접 입력한 발견자 연락처나 위치 메모가 이미 저장된 경우에는 관련 요청 처리와 운영 확인을
            위해 보유될 수 있습니다.
          </p>
        </section>

        <section className="privacy-section" id="privacy-rights">
          <h2>6. 이용자와 법정대리인의 권리</h2>
          <p>
            이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지 및 동의 철회를 요구할 수 있습니다.
            보호자는 로그인 후 보호자·관리대상 정보를 직접 수정할 수 있으며, 그 밖의 요청은 개인정보
            보호책임자에게 이메일로 접수할 수 있습니다.
          </p>
          <p>
            회사는 요청자가 본인 또는 정당한 대리인인지 확인할 수 있으며, 다른 법령에서 보존 의무를
            정한 정보는 해당 기간 동안 삭제가 제한될 수 있습니다.
          </p>
        </section>

        <section className="privacy-section" id="privacy-children">
          <h2>7. 아동 및 관리대상 개인정보</h2>
          <p>
            관리대상에는 아동, 고령자, 장애인 등 보호가 필요한 사람이 포함될 수 있습니다. 보호자는
            관리대상 정보를 등록하고 공개 QR·광고 기능을 사용할 적법한 권한과 필요한 동의를 갖추어야
            합니다. 회사는 서비스 목적에 필요한 최소 정보만 공개하도록 기능과 권한을 관리합니다.
          </p>
          <p>
            만 14세 미만 이용자의 개인정보를 회원가입 목적으로 직접 처리해야 하는 경우에는 관련 법령에
            따라 법정대리인의 동의를 확인합니다.
          </p>
        </section>

        <section className="privacy-section" id="privacy-cookie">
          <h2>8. 쿠키와 자동수집 정보</h2>
          <p>
            로그인 유지, 온보딩 다시 보지 않기, 관리자 메뉴 상태 및 서비스 편의 기능을 위해 쿠키와
            브라우저 저장소를 사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 또는 사이트 데이터
            저장을 제한할 수 있으나 로그인과 일부 기능이 정상 동작하지 않을 수 있습니다.
          </p>
        </section>

        <section className="privacy-section" id="privacy-security">
          <h2>9. 개인정보의 안전성 확보조치</h2>
          <ul>
            <li>비밀번호, 인증번호와 인증 토큰의 해시 처리</li>
            <li>HTTPS를 통한 전송구간 보호와 서버 전용 비밀키 관리</li>
            <li>로그인 사용자·관리자 권한별 접근 통제</li>
            <li>공개 QR 페이지의 보호자 원전화번호·이메일·주소 미노출</li>
            <li>결제대행사 보안 결제창과 서버 승인 검증 사용</li>
            <li>개인정보 접근자 최소화와 운영 로그 점검</li>
          </ul>
        </section>

        <section className="privacy-section" id="privacy-officer">
          <h2>10. 개인정보 보호책임자와 문의</h2>
          <dl className="privacy-contact-list">
            <div><dt>책임자</dt><dd>이진선</dd></div>
            <div><dt>소속</dt><dd>제자리</dd></div>
            <div><dt>이메일</dt><dd><a href="mailto:general@zezari.com">general@zezari.com</a></dd></div>
            <div><dt>대표전화</dt><dd><a href="tel:16681290">1668-1290</a></dd></div>
          </dl>
        </section>

        <section className="privacy-section" id="privacy-remedy">
          <h2>11. 개인정보 권익침해 구제</h2>
          <p>개인정보 침해에 대한 상담이나 신고가 필요한 경우 다음 기관에 문의할 수 있습니다.</p>
          <ul className="privacy-external-links">
            <li><a href="https://www.kopico.go.kr" target="_blank" rel="noreferrer">개인정보분쟁조정위원회</a> · 1833-6972</li>
            <li><a href="https://www.privacy.go.kr" target="_blank" rel="noreferrer">개인정보침해신고센터</a> · 118</li>
            <li><a href="https://www.spo.go.kr" target="_blank" rel="noreferrer">대검찰청</a> · 1301</li>
            <li><a href="https://ecrm.police.go.kr" target="_blank" rel="noreferrer">경찰청 사이버범죄 신고시스템</a> · 182</li>
          </ul>
        </section>

        <section className="privacy-section" id="privacy-change">
          <h2>12. 개인정보처리방침 변경</h2>
          <p>
            법령, 서비스 또는 처리항목이 변경되는 경우 시행 전에 서비스 화면을 통해 안내합니다.
            중요한 변경은 적용일 전에 별도 알림으로 안내할 수 있습니다.
          </p>
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
