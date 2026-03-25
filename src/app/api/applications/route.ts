import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId || !session.user.memberId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await req.json();

    // Calculate reentry deadline
    let reentryDeadline: Date | null = null;
    if (body.productId) {
      const product = await prisma.product.findUnique({
        where: { id: body.productId },
      });
      if (product?.reentryInterval) {
        const hours = parseInt(product.reentryInterval, 10);
        if (!isNaN(hours)) {
          reentryDeadline = new Date(
            new Date(body.appliedAt || Date.now()).getTime() + hours * 60 * 60 * 1000
          );
        }
      }
    }

    const application = await prisma.application.create({
      data: {
        organizationId: session.user.organizationId,
        memberId: session.user.memberId,
        productId: body.productId,
        fieldId: body.fieldId || null,
        appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
        quantityUsed: parseFloat(body.quantityUsed),
        quantityUnit: body.quantityUnit || "l",
        areaTreatedSqM: body.areaTreatedSqM ? parseFloat(body.areaTreatedSqM) : null,
        targetOrganism: body.targetOrganism || null,
        applicationMethod: body.applicationMethod || null,
        notes: body.notes || null,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        weatherTemp: body.weatherTemp ? parseFloat(body.weatherTemp) : null,
        weatherHumidity: body.weatherHumidity ? parseFloat(body.weatherHumidity) : null,
        weatherWindSpeed: body.weatherWindSpeed ? parseFloat(body.weatherWindSpeed) : null,
        weatherWindDir: body.weatherWindDir || null,
        weatherCondition: body.weatherCondition || null,
        weatherRainMm: body.weatherRainMm ? parseFloat(body.weatherRainMm) : null,
        reentryDeadline,
        signatureUrl: body.signatureUrl || null,
        status: body.status || "DRAFT",
      },
      include: {
        product: true,
        field: true,
        member: { include: { user: true } },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const productId = searchParams.get("productId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, unknown> = {
      organizationId: session.user.organizationId,
      status: { not: "ARCHIVED" as const },
    };

    if (status) where.status = status;
    if (productId) where.productId = productId;
    if (from || to) {
      where.appliedAt = {};
      if (from) (where.appliedAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.appliedAt as Record<string, unknown>).lte = new Date(to);
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          product: true,
          field: true,
          member: { include: { user: true } },
        },
        orderBy: { appliedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({ applications, total, page, limit });
  } catch (error) {
    console.error("List applications error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
