"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Check } from "lucide-react";

const features = [
  "Etikett scannen & automatisch erfassen",
  "GPS + Wetter automatisch dokumentiert",
  "Behördentaugliche PDF-Protokolle",
  "14 Tage kostenlos — keine Kreditkarte nötig",
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, callbackUrl: "/dashboard" });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-2 text-[var(--primary)]">
            <Leaf className="h-8 w-8" />
            <span className="text-2xl font-bold">ChemComply</span>
          </div>
          <h1 className="text-3xl font-bold">
            Pflanzenschutz-Dokumentation.
            <br />
            <span className="text-[var(--primary)]">Digital. Automatisch. Konform.</span>
          </h1>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-[var(--primary)]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kostenlos starten</CardTitle>
            <CardDescription>14 Tage Trial — keine Kreditkarte nötig</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
                <p className="font-medium text-[var(--primary)]">E-Mail gesendet!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Prüfen Sie Ihren Posteingang für den Registrierungs-Link.
                </p>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Mit Google registrieren
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--card)] px-2 text-muted-foreground">oder</span>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ihre@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[var(--primary)]" disabled={loading}>
                    {loading ? "Wird gesendet..." : "Jetzt starten"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
