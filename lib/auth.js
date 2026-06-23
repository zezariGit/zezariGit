import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateGuardianCredentials } from "./db";

const providerConfigs = [
  {
    id: "google",
    name: "Google",
    clientId: "GOOGLE_CLIENT_ID",
    clientSecret: "GOOGLE_CLIENT_SECRET",
    requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    create: GoogleProvider,
  },
  {
    id: "kakao",
    name: "Kakao",
    clientId: "KAKAO_CLIENT_ID",
    clientSecret: "KAKAO_CLIENT_SECRET",
    requiredEnv: ["KAKAO_CLIENT_ID"],
    create: KakaoProvider,
  },
  {
    id: "naver",
    name: "Naver",
    clientId: "NAVER_CLIENT_ID",
    clientSecret: "NAVER_CLIENT_SECRET",
    requiredEnv: ["NAVER_CLIENT_ID", "NAVER_CLIENT_SECRET"],
    create: NaverProvider,
  },
];

function createAuthProviders() {
  const socialProviders = providerConfigs
    .filter(isProviderConfigured)
    .map((provider) => provider.create(createProviderOptions(provider)));

  return [
    CredentialsProvider({
      id: "credentials",
      name: "아이디 로그인",
      credentials: {
        loginId: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        return authenticateGuardianCredentials(credentials?.loginId, credentials?.password);
      },
    }),
    ...socialProviders,
  ];
}

export function getConfiguredProviderIds() {
  return providerConfigs
    .filter(isProviderConfigured)
    .map((provider) => provider.id);
}

function isProviderConfigured(provider) {
  return provider.requiredEnv.every((key) => Boolean(String(process.env[key] || "").trim()));
}

function createProviderOptions(provider) {
  const clientSecret = String(process.env[provider.clientSecret] || "").trim();
  const options = {
    clientId: String(process.env[provider.clientId] || "").trim(),
  };

  if (clientSecret) options.clientSecret = clientSecret;
  if (provider.id === "kakao") {
    options.authorization = {
      params: {
        scope: String(process.env.KAKAO_SCOPE || "profile_nickname").trim(),
      },
    };
    if (!clientSecret) {
      options.client = { token_endpoint_auth_method: "none" };
    }
  }

  return options;
}

export const authOptions = {
  providers: createAuthProviders(),
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "credentials" && user?.id) {
        token.authProvider = "credentials";
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
        session.user.provider = token.authProvider || "credentials";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
