import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateGuardianPhone } from "./db";

const DEFAULT_SESSION_MAX_AGE_DAYS = 365;
const MAX_SESSION_MAX_AGE_DAYS = 365;
const SESSION_MAX_AGE_SECONDS = getSessionMaxAgeSeconds();
const USE_SECURE_COOKIES = process.env.NODE_ENV === "production";

function createAuthProviders() {
  return [
    CredentialsProvider({
      id: "phone",
      name: "휴대폰 번호 로그인",
      credentials: {
        phone: { label: "휴대폰 번호", type: "tel" },
        phoneVerificationToken: { label: "인증 토큰", type: "text" },
      },
      async authorize(credentials, request) {
        return authenticateGuardianPhone(credentials?.phone, credentials?.phoneVerificationToken, {
          ipAddress: getRequestHeader(request, "x-forwarded-for").split(",")[0]?.trim() || getRequestHeader(request, "x-real-ip"),
          userAgent: getRequestHeader(request, "user-agent"),
        });
      },
    }),
  ];
}

export function getConfiguredProviderIds() {
  return ["phone"];
}

function getRequestHeader(request, name) {
  const headers = request?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) || "");
  return String(headers[name] || headers[name.toLowerCase()] || "");
}

function getSessionMaxAgeSeconds() {
  const configuredDays = Number.parseInt(String(process.env.AUTH_SESSION_MAX_AGE_DAYS || ""), 10);
  const days = Number.isInteger(configuredDays) && configuredDays >= 1 && configuredDays <= MAX_SESSION_MAX_AGE_DAYS
    ? configuredDays
    : DEFAULT_SESSION_MAX_AGE_DAYS;
  return days * 24 * 60 * 60;
}

export const authOptions = {
  providers: createAuthProviders(),
  pages: {
    signIn: "/",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Invalid callback URLs return to the application root.
      }

      return baseUrl;
    },
    async jwt({ token, account, user }) {
      if (account?.provider === "phone" && user?.id) {
        token.authProvider = "phone";
        token.authUserId = user.id;
        return token;
      }

      if (account?.provider && account.providerAccountId) {
        token.authProvider = account.provider;
        token.authUserId =
          account.provider === "google"
            ? account.providerAccountId
            : `${account.provider}:${account.providerAccountId}`;
        if (account.provider === "google") {
          token.googleId = account.providerAccountId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.authUserId || token.googleId || token.sub || session.user.email;
        session.user.provider = token.authProvider || "phone";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  cookies: {
    sessionToken: {
      name: `${USE_SECURE_COOKIES ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: USE_SECURE_COOKIES,
        maxAge: SESSION_MAX_AGE_SECONDS,
      },
    },
  },
  useSecureCookies: USE_SECURE_COOKIES,
  secret: process.env.NEXTAUTH_SECRET,
};
