import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId?: string;
      organizationName?: string;
      role?: string;
      memberId?: string;
    } & DefaultSession["user"];
  }
}
