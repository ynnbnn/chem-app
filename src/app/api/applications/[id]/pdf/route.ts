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

    // Return application data as JSON for client-side PDF generation
    // (using @react-pdf/renderer on the client)
    return NextResponse.json({
      application,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PDF data error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
