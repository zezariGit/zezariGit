import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import FacebookProvider from "next-auth/providers/facebook";
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
  {
    id: "facebook",
    name: "Facebook",
    clientId: "FACEBOOK_CLIENT_ID",
    clientSecret: "FACEBOOK_CLIENT_SECRET",
    fallbackClientId: "META_APP_ID",
    fallbackClientSecret: "META_APP_SECRET",
    requiredEnv: [["FACEBOOK_CLIENT_ID", "META_APP_ID"], ["FACEBOOK_CLIENT_SECRET", "META_APP_SECRET"]],
    create: FacebookProvider,
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
  return provider.requiredEnv.every(hasEnvValue);
}

function createProviderOptions(provider) {
  const clientSecret = readEnvValue([provider.clientSecret, provider.fallbackClientSecret]);
  const options = {
    clientId: readEnvValue([provider.clientId, provider.fallbackClientId]),
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

function hasEnvValue(keys) {
  return Boolean(readEnvValue(keys));
}

function readEnvValue(keys) {
  const candidates = Array.isArray(keys) ? keys : [keys];
  for (const key of candidates) {
    if (!key) continue;
    const value = String(process.env[key] || "").trim();
    if (value) return value;
  }
  return "";
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
