import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

const providers: NextAuthOptions["providers"] = [];

// Google OAuth (if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Dev-Login: allows testing without external auth providers
if (process.env.NODE_ENV === "development") {
  providers.push(
    CredentialsProvider({
      name: "Dev Login",
      credentials: {
        email: { label: "E-Mail", type: "email", placeholder: "test@chemcomply.app" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
            },
          });

          // Auto-create organization
          const org = await prisma.organization.create({
            data: {
              name: `${user.name}'s Betrieb`,
              plan: "TRIAL",
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          });

          await prisma.member.create({
            data: {
              userId: user.id,
              organizationId: org.id,
              role: "OWNER",
            },
          });
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers,
  callbacks: {
    async session({ session, user, token }) {
      // Credentials provider uses JWT, so user comes from token
      const userId = user?.id || token?.sub;
      if (!userId) return session;

      session.user.id = userId;

      const member = await prisma.member.findFirst({
        where: { userId },
        include: { organization: true },
      });

      if (member) {
        session.user.organizationId = member.organizationId;
        session.user.organizationName = member.organization.name;
        session.user.role = member.role;
        session.user.memberId = member.id;
      }

      return session;
    },
    async signIn({ user }) {
      // Auto-create organization for new OAuth users
      if (user.id) {
        const existingMember = await prisma.member.findFirst({
          where: { userId: user.id },
        });

        if (!existingMember) {
          const org = await prisma.organization.create({
            data: {
              name: `${user.name || user.email?.split("@")[0]}'s Betrieb`,
              plan: "TRIAL",
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          });

          await prisma.member.create({
            data: {
              userId: user.id,
              organizationId: org.id,
              role: "OWNER",
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    // Use JWT when credentials provider is present (required by NextAuth)
    strategy: process.env.NODE_ENV === "development" ? "jwt" : "database",
  },
};
