"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Search, Download, PlusCircle } from "lucide-react";

interface Application {
  id: string;
  appliedAt: string;
  status: string;
  quantityUsed: number;
  quantityUnit: string;
  targetOrganism: string | null;
  applicationMethod: string | null;
  reentryDeadline: string | null;
  product: { name: string; activeIngredient: string };
  field: { name: string } | null;
  member: { user: { name: string | null; email: string } };
}

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  COMPLETED: "Abgeschlossen",
  FLAGGED: "Prüfen",
  ARCHIVED: "Archiviert",
};

const statusVariants: Record<string, "secondary" | "success" | "warning" | "destructive"> = {
  DRAFT: "secondary",
  COMPLETED: "success",
  FLAGGED: "warning",
  ARCHIVED: "destructive",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/applications?${params}`)
      .then((r) => r.json())
      .then((data) => setApplications(data.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = applications.filter((a) =>
    search === "" || a.product.name.toLowerCase().includes(search.toLowerCase())
      || a.targetOrganism?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Anwendungen</h1>
        <Link href="/new">
          <Button className="bg-[var(--primary)]">
            <PlusCircle className="h-4 w-4 mr-2" />
            Neue Anwendung
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Produkt oder Zielorganismus suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-40">
              <option value="">Alle Status</option>
              <option value="DRAFT">Entwurf</option>
              <option value="COMPLETED">Abgeschlossen</option>
              <option value="FLAGGED">Prüfen</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Keine Anwendungen gefunden.</p>
              <Link href="/new">
                <Button className="mt-4 bg-[var(--primary)]">Erste Anwendung erfassen</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Produkt</TableHead>
                    <TableHead className="hidden md:table-cell">Fläche</TableHead>
                    <TableHead className="hidden md:table-cell">Menge</TableHead>
                    <TableHead className="hidden lg:table-cell">Techniker</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{formatDate(app.appliedAt)}</TableCell>
                      <TableCell>
                        <div>{app.product.name}</div>
                        <div className="text-xs text-muted-foreground">{app.product.activeIngredient}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{app.field?.name || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">{app.quantityUsed} {app.quantityUnit}</TableCell>
                      <TableCell className="hidden lg:table-cell">{app.member.user.name || app.member.user.email}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[app.status] || "secondary"}>
                          {statusLabels[app.status] || app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/applications/${app.id}`}>
                          <Button variant="ghost" size="sm">Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
