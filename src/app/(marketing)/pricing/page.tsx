import Link from "next/link";
import { Leaf, Check } from "lucide-react";

const plans = [
  {
    name: "Solo",
    price: "79",
    desc: "Für einzelne Anwender und kleine Betriebe",
    features: [
      "1 Benutzer",
      "Unbegrenzte Anwendungen",
      "Etikett-OCR mit KI",
      "GPS & Wetter automatisch",
      "PDF-Protokolle",
      "Wiederbetretungsfristen",
      "E-Mail-Support",
    ],
    cta: "Solo starten",
    highlighted: false,
  },
  {
    name: "Team",
    price: "149",
    desc: "Für Betriebe mit mehreren Technikern",
    features: [
      "Unbegrenzte Benutzer",
      "Alles aus Solo",
      "Manager-Dashboard",
      "Team-Verwaltung & Rollen",
      "Compliance-Score",
      "Sperrzonen-Übersicht",
      "Prioritäts-Support",
    ],
    cta: "Team starten",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f8faf8]">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#1B5E20]">
            <Leaf className="h-6 w-6" />
            <span className="text-xl font-bold">ChemComply</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Anmelden
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Einfache, transparente Preise</h1>
          <p className="mt-4 text-lg text-gray-600">14 Tage kostenlos testen — keine Kreditkarte nötig.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 ${
                plan.highlighted ? "bg-[#1B5E20] text-white ring-2 ring-[#1B5E20]" : "bg-white border"
              }`}
            >
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className={`mt-1 text-sm ${plan.highlighted ? "text-white/70" : "text-gray-600"}`}>{plan.desc}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">€{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-white/70" : "text-gray-600"}`}> / Monat</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? "text-green-300" : "text-[#1B5E20]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 block text-center rounded-md px-6 py-3 text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-white text-[#1B5E20] hover:bg-white/90"
                    : "bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          Alle Preise zzgl. MwSt. Jederzeit kündbar. Fragen? <a href="mailto:info@chemcomply.app" className="text-[#1B5E20] underline">Kontakt aufnehmen</a>
        </div>
      </div>
    </div>
  );
}
