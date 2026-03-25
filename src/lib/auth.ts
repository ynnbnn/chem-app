import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // Load organization membership
        const member = await prisma.member.findFirst({
          where: { userId: user.id },
          include: { organization: true },
        });

        if (member) {
          session.user.organizationId = member.organizationId;
          session.user.organizationName = member.organization.name;
          session.user.role = member.role;
          session.user.memberId = member.id;
        }
      }
      return session;
    },
    async signIn({ user }) {
      // Auto-create organization for new users
      const existingMember = await prisma.member.findFirst({
        where: { userId: user.id },
      });

      if (!existingMember) {
        const org = await prisma.organization.create({
          data: {
            name: `${user.name || user.email?.split("@")[0]}'s Betrieb`,
            plan: "TRIAL",
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
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

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
};
