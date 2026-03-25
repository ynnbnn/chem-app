"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { UserPlus } from "lucide-react";

interface TeamMember {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

const roleLabels: Record<string, string> = {
  OWNER: "Inhaber",
  MANAGER: "Manager",
  TECHNICIAN: "Techniker",
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  OWNER: "default",
  MANAGER: "secondary",
  TECHNICIAN: "outline",
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TECHNICIAN");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/team").then(r => r.json()).then(setMembers).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    if (res.ok) {
      const member = await res.json();
      setMembers([...members, member]);
      setShowInvite(false);
      setEmail("");
    } else {
      const data = await res.json();
      setError(data.error || "Fehler beim Einladen");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team verwalten</h1>
        <Button className="bg-[var(--primary)]" onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Mitglied einladen
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.user.name || "—"}</TableCell>
                    <TableCell>{m.user.email}</TableCell>
                    <TableCell><Badge variant={roleBadgeVariant[m.role] || "outline"}>{roleLabels[m.role] || m.role}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogHeader><DialogTitle>Mitglied einladen</DialogTitle></DialogHeader>
        <DialogContent>
          <form onSubmit={handleInvite} className="space-y-3">
            <div><Label>E-Mail-Adresse *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" /></div>
            <div>
              <Label>Rolle</Label>
              <Select value={role} onChange={e => setRole(e.target.value)} className="mt-1">
                <option value="TECHNICIAN">Techniker</option>
                <option value="MANAGER">Manager</option>
              </Select>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Abbrechen</Button>
              <Button type="submit" className="bg-[var(--primary)]" disabled={saving}>{saving ? "Wird eingeladen..." : "Einladen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
