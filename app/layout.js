import "./globals.css";

export const metadata = {
  title: "zezari",
  description: "Google login for REAL_QR_FIND",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
