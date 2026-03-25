"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Stats {
  totalApplications: number;
  weekApplications: number;
  monthApplications: number;
  activeReentries: number;
  complianceScore: number;
  recentApplications: Array<{
    id: string;
    appliedAt: string;
    status: string;
    quantityUsed: number;
    quantityUnit: string;
    product: { name: string };
    member: { user: { name: string | null; email: string } };
  }>;
  productUsage: Array<{
    productName: string;
    totalUsed: number;
    count: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          + Neue Anwendung
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Diese Woche</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekApplications}</div>
            <p className="text-xs text-muted-foreground">{stats.monthApplications} diesen Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Dokumentierte Anwendungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Sperrzonen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-[var(--accent)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--accent)]">{stats.activeReentries}</div>
            <p className="text-xs text-muted-foreground">Offene Wiederbetretungsfristen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">Vollständig dokumentiert</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Letzte Anwendungen</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Anwendungen erfasst.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">{app.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {app.quantityUsed} {app.quantityUnit} — {formatDate(app.appliedAt)}
                      </div>
                    </div>
                    <Badge variant={app.status === "COMPLETED" ? "success" : app.status === "FLAGGED" ? "warning" : "secondary"}>
                      {app.status === "COMPLETED" ? "Abgeschlossen" : app.status === "FLAGGED" ? "Prüfen" : "Entwurf"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produktverbrauch</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.productUsage.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Daten verfügbar.</p>
            ) : (
              <div className="space-y-3">
                {stats.productUsage.map((pu) => (
                  <div key={pu.productName} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{pu.productName}</div>
                      <div className="text-xs text-muted-foreground">{pu.count} Anwendungen</div>
                    </div>
                    <div className="text-sm font-medium">{pu.totalUsed.toFixed(1)} l/kg</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
