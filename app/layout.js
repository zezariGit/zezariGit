import "../css/gov-style.css";
import "./globals.css";
import SessionKeepAlive from "./session-keep-alive";

export const metadata = {
  metadataBase: new URL("https://zezari.family"),
  title: "zezari",
  description: "QR people-finding service",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "zezari",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#26963f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <SessionKeepAlive />
        {children}
      </body>
    </html>
  );
}
