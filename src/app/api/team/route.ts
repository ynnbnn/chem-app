import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const members = await prisma.member.findMany({
      where: { organizationId: session.user.organizationId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("List team error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId || !["OWNER", "MANAGER"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { email, role } = await req.json();

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    // Check if already member
    const existingMember = await prisma.member.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: session.user.organizationId } },
    });

    if (existingMember) {
      return NextResponse.json({ error: "Benutzer ist bereits Mitglied" }, { status: 409 });
    }

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        organizationId: session.user.organizationId,
        role: role || "TECHNICIAN",
      },
      include: { user: true },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Add team member error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
