import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireOrg() {
  const session = await requireAuth();
  if (!session.user.organizationId) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireOrg();
  if (!session.user.role || !roles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}
