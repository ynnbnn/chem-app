import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChemComply — Digitale Pflanzenschutz-Dokumentation",
  description: "Compliance-Web-App für Betriebe, die Pflanzenschutzmittel, Herbizide oder Düngemittel ausbringen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
