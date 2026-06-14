import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";

const providerConfigs = [
  {
    id: "google",
    name: "Google",
    clientId: "GOOGLE_CLIENT_ID",
    clientSecret: "GOOGLE_CLIENT_SECRET",
    create: GoogleProvider,
  },
  {
    id: "kakao",
    name: "Kakao",
    clientId: "KAKAO_CLIENT_ID",
    clientSecret: "KAKAO_CLIENT_SECRET",
    create: KakaoProvider,
  },
  {
    id: "naver",
    name: "Naver",
    clientId: "NAVER_CLIENT_ID",
    clientSecret: "NAVER_CLIENT_SECRET",
    create: NaverProvider,
  },
];

function createAuthProviders() {
  return providerConfigs
    .filter((provider) => process.env[provider.clientId] && process.env[provider.clientSecret])
    .map((provider) =>
      provider.create({
        clientId: process.env[provider.clientId],
        clientSecret: process.env[provider.clientSecret],
      })
    );
}

export function getConfiguredProviderIds() {
  return providerConfigs
    .filter((provider) => process.env[provider.clientId] && process.env[provider.clientSecret])
    .map((provider) => provider.id);
}

export const authOptions = {
  providers: createAuthProviders(),
  callbacks: {
    async jwt({ token, account }) {
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
        session.user.provider = token.authProvider || "google";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
