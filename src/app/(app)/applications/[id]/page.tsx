"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Download, MapPin, Cloud, Clock, User } from "lucide-react";
import { ApplicationPDF } from "@/components/application-pdf";

interface ApplicationDetail {
  id: string;
  appliedAt: string;
  status: string;
  quantityUsed: number;
  quantityUnit: string;
  areaTreatedSqM: number | null;
  targetOrganism: string | null;
  applicationMethod: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  weatherTemp: number | null;
  weatherHumidity: number | null;
  weatherWindSpeed: number | null;
  weatherWindDir: string | null;
  weatherCondition: string | null;
  weatherRainMm: number | null;
  reentryDeadline: string | null;
  signatureUrl: string | null;
  product: { name: string; activeIngredient: string; concentration: string | null; applicationRate: string | null };
  field: { name: string; areaSqMeters: number | null } | null;
  member: { user: { name: string | null; email: string } };
  organization: { name: string };
}

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  COMPLETED: "Abgeschlossen",
  FLAGGED: "Prüfen",
};

const statusVariants: Record<string, "secondary" | "success" | "warning"> = {
  DRAFT: "secondary",
  COMPLETED: "success",
  FLAGGED: "warning",
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    fetch(`/api/applications/${params.id}`)
      .then((r) => r.json())
      .then(setApp)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleStatusChange(status: string) {
    if (!app) return;
    const res = await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setApp({ ...app, status: updated.status });
    }
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>;
  if (!app) return <div>Anwendung nicht gefunden.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{app.product.name}</h1>
          <p className="text-muted-foreground">{formatDate(app.appliedAt)}</p>
        </div>
        <Badge variant={statusVariants[app.status] || "secondary"} className="text-sm">
          {statusLabels[app.status] || app.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Produkt</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{app.product.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Wirkstoff</span><span className="font-medium">{app.product.activeIngredient}</span></div>
            {app.product.concentration && <div className="flex justify-between"><span className="text-muted-foreground">Konzentration</span><span>{app.product.concentration}</span></div>}
            {app.product.applicationRate && <div className="flex justify-between"><span className="text-muted-foreground">Ausbringungsrate</span><span>{app.product.applicationRate}</span></div>}
          </CardContent>
        </Card>

        {/* Application Data */}
        <Card>
          <CardHeader><CardTitle className="text-base">Anwendungsdaten</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Menge</span><span className="font-medium">{app.quantityUsed} {app.quantityUnit}</span></div>
            {app.areaTreatedSqM && <div className="flex justify-between"><span className="text-muted-foreground">Fläche</span><span>{app.areaTreatedSqM} m²</span></div>}
            {app.field && <div className="flex justify-between"><span className="text-muted-foreground">Parzelle</span><span>{app.field.name}</span></div>}
            {app.targetOrganism && <div className="flex justify-between"><span className="text-muted-foreground">Zielorganismus</span><span>{app.targetOrganism}</span></div>}
            {app.applicationMethod && <div className="flex justify-between"><span className="text-muted-foreground">Methode</span><span>{app.applicationMethod}</span></div>}
          </CardContent>
        </Card>

        {/* Weather & GPS */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="h-4 w-4" /> Wetter & Standort</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {app.latitude && app.longitude && (
              <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> GPS</span><span>{app.latitude.toFixed(4)}° N, {app.longitude.toFixed(4)}° E</span></div>
            )}
            {app.weatherTemp !== null && <div className="flex justify-between"><span className="text-muted-foreground">Temperatur</span><span>{app.weatherTemp}°C</span></div>}
            {app.weatherHumidity !== null && <div className="flex justify-between"><span className="text-muted-foreground">Luftfeuchtigkeit</span><span>{app.weatherHumidity}%</span></div>}
            {app.weatherWindSpeed !== null && <div className="flex justify-between"><span className="text-muted-foreground">Wind</span><span>{app.weatherWindSpeed} m/s {app.weatherWindDir}</span></div>}
            {app.weatherCondition && <div className="flex justify-between"><span className="text-muted-foreground">Bedingungen</span><span>{app.weatherCondition}</span></div>}
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Compliance</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {app.reentryDeadline && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wiederbetretungsfrist bis</span>
                <span className={`font-medium ${new Date(app.reentryDeadline) > new Date() ? "text-[var(--accent)]" : "text-emerald-600"}`}>
                  {formatDate(app.reentryDeadline)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Techniker</span>
              <span>{app.member.user.name || app.member.user.email}</span>
            </div>
            {app.notes && (
              <div className="pt-2 border-t">
                <span className="text-muted-foreground">Notizen:</span>
                <p className="mt-1">{app.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {app.status === "DRAFT" && (
          <Button className="bg-[var(--primary)]" onClick={() => handleStatusChange("COMPLETED")}>
            Als abgeschlossen markieren
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowPdf(!showPdf)}>
          <Download className="h-4 w-4 mr-2" />
          PDF exportieren
        </Button>
      </div>

      {showPdf && <ApplicationPDF application={app} />}
    </div>
  );
}
