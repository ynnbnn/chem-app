import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.application.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: {
        product: true,
        field: true,
        member: { include: { user: true } },
        organization: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.application.findFirst({
      where: { id, organizationId: session.user.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.signatureUrl && { signatureUrl: body.signatureUrl }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.quantityUsed && { quantityUsed: parseFloat(body.quantityUsed) }),
        ...(body.quantityUnit && { quantityUnit: body.quantityUnit }),
        ...(body.targetOrganism !== undefined && { targetOrganism: body.targetOrganism }),
        ...(body.applicationMethod && { applicationMethod: body.applicationMethod }),
      },
      include: {
        product: true,
        field: true,
        member: { include: { user: true } },
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.application.findFirst({
      where: { id, organizationId: session.user.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }

    // Soft delete
    await prisma.application.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
