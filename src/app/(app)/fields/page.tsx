"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Map } from "lucide-react";

interface Field {
  id: string;
  name: string;
  areaSqMeters: number | null;
  createdAt: string;
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", areaSqMeters: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/fields").then(r => r.json()).then(setFields).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const field = await res.json();
      setFields([...fields, field]);
      setShowAdd(false);
      setForm({ name: "", areaSqMeters: "" });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Flächen verwalten</h1>
        <Button className="bg-[var(--primary)]" onClick={() => setShowAdd(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Fläche hinzufügen
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Card key={i}><CardContent className="p-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>)}
        </div>
      ) : fields.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Noch keine Flächen angelegt.</p>
            <Button className="mt-4 bg-[var(--primary)]" onClick={() => setShowAdd(true)}>Erste Fläche anlegen</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fields.map(f => (
            <Card key={f.id}>
              <CardHeader><CardTitle className="text-base">{f.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {f.areaSqMeters ? `${f.areaSqMeters.toLocaleString("de-DE")} m²` : "Fläche nicht angegeben"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogHeader><DialogTitle>Fläche hinzufügen</DialogTitle></DialogHeader>
        <DialogContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="z.B. Parzelle 7 - Nordwest" className="mt-1" /></div>
            <div><Label>Fläche in m²</Label><Input type="number" value={form.areaSqMeters} onChange={e => setForm({...form, areaSqMeters: e.target.value})} placeholder="Optional" className="mt-1" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Abbrechen</Button>
              <Button type="submit" className="bg-[var(--primary)]" disabled={saving}>{saving ? "Wird gespeichert..." : "Speichern"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
