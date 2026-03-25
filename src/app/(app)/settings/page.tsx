"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle>Betriebsinformationen</CardTitle>
          <CardDescription>Ihre Organisation und Kontodaten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Betriebsname</Label>
            <Input value={session?.user?.organizationName || ""} readOnly className="mt-1 bg-muted" />
          </div>
          <div>
            <Label>E-Mail</Label>
            <Input value={session?.user?.email || ""} readOnly className="mt-1 bg-muted" />
          </div>
          <div>
            <Label>Rolle</Label>
            <div className="mt-1">
              <Badge variant="secondary">{session?.user?.role || "—"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>Verwalten Sie Ihren Plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-lg">
            <div>
              <div className="font-medium">Trial-Plan</div>
              <div className="text-sm text-muted-foreground">14 Tage kostenlos testen</div>
            </div>
            <Badge variant="success">Aktiv</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium">Solo</div>
              <div className="text-2xl font-bold mt-1">€79<span className="text-sm font-normal text-muted-foreground">/Monat</span></div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>1 Benutzer</li>
                <li>Unbegrenzte Anwendungen</li>
                <li>PDF-Export</li>
                <li>OCR-Etikettscan</li>
              </ul>
              <Button className="w-full mt-4 bg-[var(--primary)]">Upgrade auf Solo</Button>
            </div>
            <div className="p-4 border rounded-lg border-[var(--primary)]">
              <div className="font-medium">Team</div>
              <div className="text-2xl font-bold mt-1">€149<span className="text-sm font-normal text-muted-foreground">/Monat</span></div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>Unbegrenzte Benutzer</li>
                <li>Manager-Dashboard</li>
                <li>Team-Verwaltung</li>
                <li>Alles aus Solo</li>
              </ul>
              <Button className="w-full mt-4 bg-[var(--primary)]">Upgrade auf Team</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
