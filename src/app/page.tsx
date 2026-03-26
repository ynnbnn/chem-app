import Link from "next/link";
import { Leaf, Camera, MapPin, Cloud, FileText, Shield, Users } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Etikett scannen",
    desc: "Fotografieren Sie das Produktetikett — KI erkennt Wirkstoff, Konzentration und Fristen automatisch.",
  },
  {
    icon: MapPin,
    title: "GPS-Erfassung",
    desc: "Standort wird automatisch per GPS dokumentiert — kein manuelles Eintragen nötig.",
  },
  {
    icon: Cloud,
    title: "Wetterdaten",
    desc: "Temperatur, Luftfeuchtigkeit und Wind werden in Echtzeit zum Protokoll hinzugefügt.",
  },
  {
    icon: FileText,
    title: "PDF-Protokolle",
    desc: "Behördentaugliche Dokumentation auf Knopfdruck — prüfungssicher und vollständig.",
  },
  {
    icon: Shield,
    title: "Compliance",
    desc: "Wiederbetretungsfristen, Sperrzonen und Auflagen automatisch berechnet und überwacht.",
  },
  {
    icon: Users,
    title: "Team-Verwaltung",
    desc: "Techniker, Manager und Inhaber — jeder hat die richtige Rolle und Übersicht.",
  },
];

const steps = [
  { num: "1", title: "Etikett fotografieren", desc: "Kamera öffnen, Produktetikett fotografieren — fertig." },
  { num: "2", title: "Daten ergänzen", desc: "Menge, Fläche und Zielorganismus eingeben." },
  { num: "3", title: "Automatisch dokumentiert", desc: "GPS, Wetter und Fristen werden automatisch erfasst." },
  { num: "4", title: "Unterschreiben & fertig", desc: "Digital unterschreiben — prüfungssicheres Protokoll in Sekunden." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1B5E20]">
            <Leaf className="h-6 w-6" />
            <span className="text-xl font-bold">ChemComply</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Anmelden
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-[#1B5E20] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B5E20]/90 transition-colors"
            >
              Kostenlos testen
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-[#f8faf8]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Pflanzenschutz-Dokumentation.
            <br />
            <span className="text-[#1B5E20]">Digital. Automatisch. Konform.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Etikett scannen, Daten automatisch erfassen, behördentaugliches Protokoll in Sekunden.
            Schluss mit Papier-Chaos und Excel-Listen.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-md bg-[#1B5E20] px-8 py-3 text-base font-medium text-white hover:bg-[#1B5E20]/90 transition-colors"
            >
              14 Tage kostenlos testen
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-gray-300 px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Preise ansehen
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">Keine Kreditkarte nötig. PflSchG DE, ChemV CH, EPA US konform.</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">Alles automatisch dokumentiert</h2>
          <p className="mt-4 text-center text-gray-600 max-w-xl mx-auto">
            Von der Etikett-Erkennung bis zum fertigen Protokoll — ChemComply automatisiert Ihre gesamte Pflanzenschutz-Dokumentation.
          </p>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#e8f5e9] flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-[#1B5E20]" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-[#f8faf8]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">So funktioniert es</h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-xl font-bold mx-auto">
                  {s.num}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1B5E20] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Bereit für digitale Compliance?</h2>
          <p className="mt-4 text-lg text-white/80">
            Starten Sie heute mit ChemComply und dokumentieren Sie Ihre Pflanzenschutz-Anwendungen effizient und gesetzeskonform.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-md bg-white text-[#1B5E20] px-8 py-3 text-base font-medium hover:bg-white/90 transition-colors"
          >
            Jetzt kostenlos starten
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            <span className="font-medium text-white">ChemComply</span>
          </div>
          <p className="text-sm">&copy; 2026 ChemComply. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
