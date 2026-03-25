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

    const fields = await prisma.field.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error("List fields error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await req.json();

    const field = await prisma.field.create({
      data: {
        organizationId: session.user.organizationId,
        name: body.name,
        areaSqMeters: body.areaSqMeters ? parseFloat(body.areaSqMeters) : null,
        geoJson: body.geoJson || null,
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error("Create field error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
