"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PlusCircle, Camera } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  activeIngredient: string;
  concentration: string | null;
  applicationRate: string | null;
  reentryInterval: string | null;
  ppiNumber: string | null;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", activeIngredient: "", concentration: "", applicationRate: "", reentryInterval: "", ppiNumber: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const product = await res.json();
      setProducts([...products, product]);
      setShowAdd(false);
      setForm({ name: "", activeIngredient: "", concentration: "", applicationRate: "", reentryInterval: "", ppiNumber: "" });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produktbibliothek</h1>
        <div className="flex gap-2">
          <Link href="/products/scan">
            <Button variant="outline"><Camera className="h-4 w-4 mr-2" /> Etikett scannen</Button>
          </Link>
          <Button className="bg-[var(--primary)]" onClick={() => setShowAdd(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Produkt hinzufügen
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Noch keine Produkte erfasst.</p>
              <p className="text-sm text-muted-foreground mt-1">Scannen Sie ein Etikett oder fügen Sie manuell ein Produkt hinzu.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Wirkstoff</TableHead>
                  <TableHead className="hidden md:table-cell">Konzentration</TableHead>
                  <TableHead className="hidden md:table-cell">Rate</TableHead>
                  <TableHead className="hidden lg:table-cell">Frist</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.activeIngredient}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.concentration || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.applicationRate || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{p.reentryInterval ? `${p.reentryInterval}h` : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogHeader><DialogTitle>Produkt hinzufügen</DialogTitle></DialogHeader>
        <DialogContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div><Label>Produktname *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="mt-1" /></div>
            <div><Label>Wirkstoff *</Label><Input value={form.activeIngredient} onChange={e => setForm({...form, activeIngredient: e.target.value})} required className="mt-1" /></div>
            <div><Label>Konzentration</Label><Input value={form.concentration} onChange={e => setForm({...form, concentration: e.target.value})} placeholder="z.B. 480 g/l" className="mt-1" /></div>
            <div><Label>Ausbringungsrate</Label><Input value={form.applicationRate} onChange={e => setForm({...form, applicationRate: e.target.value})} placeholder="z.B. 3-4 l/ha" className="mt-1" /></div>
            <div><Label>Wiederbetretungsfrist (Stunden)</Label><Input value={form.reentryInterval} onChange={e => setForm({...form, reentryInterval: e.target.value})} placeholder="z.B. 48" className="mt-1" /></div>
            <div><Label>Zulassungsnummer</Label><Input value={form.ppiNumber} onChange={e => setForm({...form, ppiNumber: e.target.value})} className="mt-1" /></div>
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
