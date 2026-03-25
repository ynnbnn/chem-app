import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const orgId = session.user.organizationId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalApplications,
      weekApplications,
      monthApplications,
      activeReentries,
      completedCount,
      totalCount,
      recentApplications,
      productUsage,
    ] = await Promise.all([
      prisma.application.count({
        where: { organizationId: orgId, status: { not: "ARCHIVED" } },
      }),
      prisma.application.count({
        where: { organizationId: orgId, appliedAt: { gte: weekAgo }, status: { not: "ARCHIVED" } },
      }),
      prisma.application.count({
        where: { organizationId: orgId, appliedAt: { gte: monthAgo }, status: { not: "ARCHIVED" } },
      }),
      prisma.application.count({
        where: {
          organizationId: orgId,
          reentryDeadline: { gt: now },
          status: { not: "ARCHIVED" },
        },
      }),
      prisma.application.count({
        where: { organizationId: orgId, status: "COMPLETED" },
      }),
      prisma.application.count({
        where: { organizationId: orgId, status: { not: "ARCHIVED" } },
      }),
      prisma.application.findMany({
        where: { organizationId: orgId, status: { not: "ARCHIVED" } },
        include: { product: true, member: { include: { user: true } } },
        orderBy: { appliedAt: "desc" },
        take: 5,
      }),
      prisma.application.groupBy({
        by: ["productId"],
        where: { organizationId: orgId, status: { not: "ARCHIVED" } },
        _sum: { quantityUsed: true },
        _count: true,
      }),
    ]);

    // Enrich product usage with names
    const productIds = productUsage.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const complianceScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

    return NextResponse.json({
      totalApplications,
      weekApplications,
      monthApplications,
      activeReentries,
      complianceScore,
      recentApplications,
      productUsage: productUsage.map((pu) => ({
        productId: pu.productId,
        productName: productMap[pu.productId]?.name || "Unbekannt",
        totalUsed: pu._sum.quantityUsed || 0,
        count: pu._count,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
