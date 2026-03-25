"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Package, MapPin, Cloud, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  activeIngredient: string;
  concentration: string | null;
  applicationRate: string | null;
  reentryInterval: string | null;
}

interface Field {
  id: string;
  name: string;
  areaSqMeters: number | null;
}

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  condition: string;
  rainMm: number;
}

interface OcrData {
  productName: string;
  activeIngredient: string;
  concentration: string | null;
  applicationRate: string | null;
  reentryInterval: string | null;
  ppiNumber: string | null;
}

type Step = "product" | "details" | "auto" | "confirm";
const steps: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "product", label: "Produkt", icon: Package },
  { key: "details", label: "Daten", icon: Camera },
  { key: "auto", label: "Auto-Daten", icon: Cloud },
  { key: "confirm", label: "Bestätigung", icon: CheckCircle },
];

export default function NewApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("product");
  const [products, setProducts] = useState<Product[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Product step
  const [selectedProductId, setSelectedProductId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Details step
  const [quantityUsed, setQuantityUsed] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("l");
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [areaTreatedSqM, setAreaTreatedSqM] = useState("");
  const [targetOrganism, setTargetOrganism] = useState("");
  const [applicationMethod, setApplicationMethod] = useState("Sprühgerät");
  const [appliedAt, setAppliedAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");

  // Auto data
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(console.error);
    fetch("/api/fields").then(r => r.json()).then(setFields).catch(console.error);
  }, []);

  // GPS
  function fetchGPS() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsLoading(false);
        // Auto-fetch weather
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true }
    );
  }

  function fetchWeather(lat: number, lon: number) {
    setWeatherLoading(true);
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(setWeather)
      .catch(console.error)
      .finally(() => setWeatherLoading(false));
  }

  // OCR scan
  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const mediaType = file.type || "image/jpeg";

      try {
        const res = await fetch("/api/ocr/label", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mediaType }),
        });
        const data = await res.json();
        if (data.product) {
          setSelectedProductId(data.product.id);
          setOcrResult(data.ocrData);
          // Refresh products list
          const prods = await fetch("/api/products").then(r => r.json());
          setProducts(prods);
        }
      } catch (err) {
        console.error("OCR error:", err);
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  }

  // Signature canvas
  function initCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1B5E20";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasSigned(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDraw() {
    setIsDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }

  // Submit
  async function handleSubmit() {
    setSubmitting(true);

    const signatureUrl = canvasRef.current?.toDataURL("image/png") || null;
    const selectedProduct = products.find(p => p.id === selectedProductId);

    const body = {
      productId: selectedProductId,
      fieldId: selectedFieldId || null,
      appliedAt: new Date(appliedAt).toISOString(),
      quantityUsed,
      quantityUnit,
      areaTreatedSqM: areaTreatedSqM || null,
      targetOrganism: targetOrganism || null,
      applicationMethod: applicationMethod || null,
      notes: notes || null,
      latitude,
      longitude,
      weatherTemp: weather?.temp ?? null,
      weatherHumidity: weather?.humidity ?? null,
      weatherWindSpeed: weather?.windSpeed ?? null,
      weatherWindDir: weather?.windDir ?? null,
      weatherCondition: weather?.condition ?? null,
      weatherRainMm: weather?.rainMm ?? null,
      signatureUrl,
      status: "COMPLETED",
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const app = await res.json();
        router.push(`/applications/${app.id}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
    setSubmitting(false);
  }

  const stepIndex = steps.findIndex(s => s.key === currentStep);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Calculate reentry deadline
  let reentryDeadline: string | null = null;
  if (selectedProduct?.reentryInterval) {
    const hours = parseInt(selectedProduct.reentryInterval, 10);
    if (!isNaN(hours)) {
      const deadline = new Date(new Date(appliedAt).getTime() + hours * 60 * 60 * 1000);
      reentryDeadline = deadline.toLocaleString("de-DE");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Neue Anwendung erfassen</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              i <= stepIndex ? "bg-[var(--primary)] text-white" : "bg-muted text-muted-foreground"
            }`}>
              <step.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-6 h-0.5 mx-1 ${i < stepIndex ? "bg-[var(--primary)]" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Product */}
      {currentStep === "product" && (
        <Card>
          <CardHeader>
            <CardTitle>Produkt wählen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
              >
                {scanning ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                <span className="text-xs">{scanning ? "Wird analysiert..." : "Etikett scannen"}</span>
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} />

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => {}}
              >
                <Package className="h-6 w-6" />
                <span className="text-xs">Aus Bibliothek</span>
              </Button>
            </div>

            {ocrResult && (
              <div className="p-3 bg-[var(--secondary)] rounded-lg space-y-1 text-sm">
                <div className="font-medium text-[var(--primary)]">Erkannt:</div>
                <div>Produkt: {ocrResult.productName}</div>
                <div>Wirkstoff: {ocrResult.activeIngredient}</div>
                {ocrResult.concentration && <div>Konzentration: {ocrResult.concentration}</div>}
                {ocrResult.applicationRate && <div>Rate: {ocrResult.applicationRate}</div>}
                {ocrResult.reentryInterval && <div>Wiederbetretungsfrist: {ocrResult.reentryInterval}h</div>}
              </div>
            )}

            {products.length > 0 && (
              <div>
                <Label>Oder Produkt auswählen</Label>
                <Select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="mt-1">
                  <option value="">— Produkt wählen —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.activeIngredient})</option>
                  ))}
                </Select>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                className="bg-[var(--primary)]"
                disabled={!selectedProductId}
                onClick={() => setCurrentStep("details")}
              >
                Weiter <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Details */}
      {currentStep === "details" && (
        <Card>
          <CardHeader>
            <CardTitle>Anwendungsdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity">Menge</Label>
                <Input id="quantity" type="number" step="0.1" value={quantityUsed} onChange={(e) => setQuantityUsed(e.target.value)} placeholder="z.B. 3.5" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="unit">Einheit</Label>
                <Select id="unit" value={quantityUnit} onChange={(e) => setQuantityUnit(e.target.value)} className="mt-1">
                  <option value="l">Liter (l)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="kg">Kilogramm (kg)</option>
                  <option value="g">Gramm (g)</option>
                </Select>
              </div>
            </div>

            {fields.length > 0 && (
              <div>
                <Label htmlFor="field">Fläche</Label>
                <Select id="field" value={selectedFieldId} onChange={(e) => setSelectedFieldId(e.target.value)} className="mt-1">
                  <option value="">— Optional: Fläche wählen —</option>
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.name} {f.areaSqMeters ? `(${f.areaSqMeters} m²)` : ""}</option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="area">Behandelte Fläche (m²)</Label>
              <Input id="area" type="number" value={areaTreatedSqM} onChange={(e) => setAreaTreatedSqM(e.target.value)} placeholder="Optional" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="target">Zielorganismus</Label>
              <Input id="target" value={targetOrganism} onChange={(e) => setTargetOrganism(e.target.value)} placeholder="z.B. Blattläuse, Unkraut" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="method">Methode</Label>
              <Select id="method" value={applicationMethod} onChange={(e) => setApplicationMethod(e.target.value)} className="mt-1">
                <option value="Sprühgerät">Sprühgerät</option>
                <option value="Gießen">Gießen</option>
                <option value="Streuen">Streuen</option>
                <option value="Injizieren">Injizieren</option>
                <option value="Nebeln">Nebeln</option>
                <option value="Sonstiges">Sonstiges</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="datetime">Zeitpunkt</Label>
              <Input id="datetime" type="datetime-local" value={appliedAt} onChange={(e) => setAppliedAt(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optionale Anmerkungen..." className="mt-1" />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("product")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Zurück
              </Button>
              <Button
                className="bg-[var(--primary)]"
                disabled={!quantityUsed}
                onClick={() => { setCurrentStep("auto"); fetchGPS(); }}
              >
                Weiter <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Auto Data */}
      {currentStep === "auto" && (
        <Card>
          <CardHeader>
            <CardTitle>Automatische Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* GPS */}
            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                GPS-Standort
              </div>
              {gpsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Standort wird ermittelt...
                </div>
              ) : latitude && longitude ? (
                <div className="text-sm">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={fetchGPS}>
                  Standort erfassen
                </Button>
              )}
            </div>

            {/* Weather */}
            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Cloud className="h-4 w-4 text-[var(--primary)]" />
                Wetterdaten
              </div>
              {weatherLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Wetter wird abgerufen...
                </div>
              ) : weather ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Temperatur: <span className="font-medium">{weather.temp}°C</span></div>
                  <div>Luftfeuchtigkeit: <span className="font-medium">{weather.humidity}%</span></div>
                  <div>Wind: <span className="font-medium">{weather.windSpeed} m/s {weather.windDir}</span></div>
                  <div>Bedingungen: <span className="font-medium">{weather.condition}</span></div>
                  {weather.rainMm > 0 && <div>Niederschlag: <span className="font-medium">{weather.rainMm} mm</span></div>}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {latitude ? "Wetter konnte nicht geladen werden." : "GPS-Standort für Wetterdaten benötigt."}
                </div>
              )}
            </div>

            {/* Reentry */}
            {reentryDeadline && (
              <div className="p-4 rounded-lg border border-[var(--accent)] bg-orange-50 space-y-1">
                <div className="flex items-center gap-2 font-medium text-[var(--accent)]">
                  Wiederbetretungsfrist
                </div>
                <div className="text-sm">
                  Sperrzone bis: <span className="font-bold">{reentryDeadline}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("details")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Zurück
              </Button>
              <Button className="bg-[var(--primary)]" onClick={() => { setCurrentStep("confirm"); initCanvas(); }}>
                Weiter <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {currentStep === "confirm" && (
        <Card>
          <CardHeader>
            <CardTitle>Zusammenfassung & Unterschrift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-sm p-4 bg-muted rounded-lg">
              <div className="flex justify-between"><span className="text-muted-foreground">Produkt</span><span className="font-medium">{selectedProduct?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Wirkstoff</span><span>{selectedProduct?.activeIngredient}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Menge</span><span className="font-medium">{quantityUsed} {quantityUnit}</span></div>
              {targetOrganism && <div className="flex justify-between"><span className="text-muted-foreground">Zielorganismus</span><span>{targetOrganism}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Methode</span><span>{applicationMethod}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Zeitpunkt</span><span>{new Date(appliedAt).toLocaleString("de-DE")}</span></div>
              {latitude && <div className="flex justify-between"><span className="text-muted-foreground">GPS</span><span>{latitude?.toFixed(4)}° N, {longitude?.toFixed(4)}° E</span></div>}
              {weather && <div className="flex justify-between"><span className="text-muted-foreground">Wetter</span><span>{weather.temp}°C, {weather.humidity}% Feuchte</span></div>}
              {reentryDeadline && <div className="flex justify-between"><span className="text-muted-foreground text-[var(--accent)]">Sperre bis</span><span className="font-bold text-[var(--accent)]">{reentryDeadline}</span></div>}
            </div>

            {/* Signature */}
            <div>
              <Label>Digitale Unterschrift</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg overflow-hidden" style={{ touchAction: "none" }}>
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={150}
                  className="w-full cursor-crosshair bg-white"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>
              {hasSigned && (
                <Button variant="ghost" size="sm" onClick={clearSignature} className="mt-1">
                  Unterschrift löschen
                </Button>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("auto")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Zurück
              </Button>
              <Button
                className="bg-[var(--primary)]"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Wird gespeichert...</> : <><CheckCircle className="h-4 w-4 mr-2" /> Protokoll abschließen</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
