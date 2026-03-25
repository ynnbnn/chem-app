"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, CheckCircle } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Record<string, string | string[] | null> | null>(null);
  const [error, setError] = useState("");

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/ocr/label", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mediaType: file.type || "image/jpeg" }),
        });
        const data = await res.json();
        if (res.ok) {
          setResult(data.ocrData);
        } else {
          setError(data.error || "Fehler bei der Analyse");
        }
      } catch {
        setError("Netzwerkfehler");
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Etikett scannen</h1>

      <Card>
        <CardHeader><CardTitle>Produktetikett fotografieren</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Fotografieren Sie das Etikett des Pflanzenschutzmittels. Claude Vision erkennt automatisch alle relevanten Informationen.
          </p>

          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} />

          <Button
            className="w-full h-32 flex flex-col gap-3 bg-[var(--primary)]"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
          >
            {scanning ? (
              <><Loader2 className="h-8 w-8 animate-spin" /><span>Wird analysiert...</span></>
            ) : (
              <><Camera className="h-8 w-8" /><span>Foto aufnehmen oder Bild wählen</span></>
            )}
          </Button>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--primary)] font-medium">
                <CheckCircle className="h-5 w-5" />
                Produkt erkannt und gespeichert
              </div>
              <div className="p-4 bg-[var(--secondary)] rounded-lg space-y-1 text-sm">
                {Object.entries(result).map(([key, value]) => (
                  value && <div key={key}><span className="font-medium">{key}:</span> {typeof value === "object" ? JSON.stringify(value) : String(value)}</div>
                ))}
              </div>
              <Button className="w-full bg-[var(--primary)]" onClick={() => router.push("/products")}>
                Zur Produktbibliothek
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
