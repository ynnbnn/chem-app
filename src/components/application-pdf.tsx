"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, borderBottom: "1 solid #1B5E20", paddingBottom: 10 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#1B5E20" },
  subtitle: { fontSize: 8, color: "#666", marginTop: 2 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6, color: "#1B5E20", borderBottom: "0.5 solid #ccc", paddingBottom: 3 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: "40%", color: "#666" },
  value: { width: "60%", fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTop: "0.5 solid #ccc", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#999" },
  warning: { backgroundColor: "#FFF3E0", padding: 8, borderRadius: 4, marginBottom: 12, border: "0.5 solid #F57C00" },
  warningText: { color: "#E65100", fontFamily: "Helvetica-Bold" },
});

interface ApplicationPDFProps {
  application: {
    id: string;
    appliedAt: string;
    quantityUsed: number;
    quantityUnit: string;
    areaTreatedSqM: number | null;
    targetOrganism: string | null;
    applicationMethod: string | null;
    notes: string | null;
    latitude: number | null;
    longitude: number | null;
    weatherTemp: number | null;
    weatherHumidity: number | null;
    weatherWindSpeed: number | null;
    weatherWindDir: string | null;
    weatherCondition: string | null;
    reentryDeadline: string | null;
    product: { name: string; activeIngredient: string; concentration: string | null; applicationRate: string | null };
    field: { name: string } | null;
    member: { user: { name: string | null; email: string } };
    organization: { name: string };
  };
}

function PDFDocument({ application: app }: ApplicationPDFProps) {
  const appliedDate = new Date(app.appliedAt).toLocaleString("de-DE");
  const reentryDate = app.reentryDeadline ? new Date(app.reentryDeadline).toLocaleString("de-DE") : null;
  const now = new Date().toLocaleString("de-DE");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Anwendungsprotokoll</Text>
            <Text style={styles.subtitle}>Pflanzenschutzmittel-Dokumentation gem. PflSchG</Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, textAlign: "right" }}>{app.organization.name}</Text>
            <Text style={{ fontSize: 8, color: "#666", textAlign: "right" }}>Protokoll-Nr: {app.id.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produkt</Text>
          <View style={styles.row}><Text style={styles.label}>Produktname</Text><Text style={styles.value}>{app.product.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Wirkstoff</Text><Text style={styles.value}>{app.product.activeIngredient}</Text></View>
          {app.product.concentration && <View style={styles.row}><Text style={styles.label}>Konzentration</Text><Text style={styles.value}>{app.product.concentration}</Text></View>}
          {app.product.applicationRate && <View style={styles.row}><Text style={styles.label}>Ausbringungsrate</Text><Text style={styles.value}>{app.product.applicationRate}</Text></View>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anwendung</Text>
          <View style={styles.row}><Text style={styles.label}>Zeitpunkt</Text><Text style={styles.value}>{appliedDate}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Menge</Text><Text style={styles.value}>{app.quantityUsed} {app.quantityUnit}</Text></View>
          {app.areaTreatedSqM && <View style={styles.row}><Text style={styles.label}>Behandelte Fläche</Text><Text style={styles.value}>{app.areaTreatedSqM} m²</Text></View>}
          {app.field && <View style={styles.row}><Text style={styles.label}>Parzelle</Text><Text style={styles.value}>{app.field.name}</Text></View>}
          {app.targetOrganism && <View style={styles.row}><Text style={styles.label}>Zielorganismus</Text><Text style={styles.value}>{app.targetOrganism}</Text></View>}
          {app.applicationMethod && <View style={styles.row}><Text style={styles.label}>Methode</Text><Text style={styles.value}>{app.applicationMethod}</Text></View>}
          <View style={styles.row}><Text style={styles.label}>Techniker</Text><Text style={styles.value}>{app.member.user.name || app.member.user.email}</Text></View>
        </View>

        {(app.latitude || app.weatherTemp !== null) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Standort & Wetter</Text>
            {app.latitude && app.longitude && <View style={styles.row}><Text style={styles.label}>GPS-Koordinaten</Text><Text style={styles.value}>{app.latitude.toFixed(4)}° N, {app.longitude.toFixed(4)}° E</Text></View>}
            {app.weatherTemp !== null && <View style={styles.row}><Text style={styles.label}>Temperatur</Text><Text style={styles.value}>{app.weatherTemp}°C</Text></View>}
            {app.weatherHumidity !== null && <View style={styles.row}><Text style={styles.label}>Luftfeuchtigkeit</Text><Text style={styles.value}>{app.weatherHumidity}%</Text></View>}
            {app.weatherWindSpeed !== null && <View style={styles.row}><Text style={styles.label}>Wind</Text><Text style={styles.value}>{app.weatherWindSpeed} m/s {app.weatherWindDir}</Text></View>}
            {app.weatherCondition && <View style={styles.row}><Text style={styles.label}>Bedingungen</Text><Text style={styles.value}>{app.weatherCondition}</Text></View>}
          </View>
        )}

        {reentryDate && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>Wiederbetretungsfrist</Text>
            <Text style={{ marginTop: 3 }}>Sperrzone bis: {reentryDate}</Text>
          </View>
        )}

        {app.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notizen</Text>
            <Text>{app.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Erstellt mit ChemComply — {now}</Text>
          <Text style={styles.footerText}>Dieses Dokument wurde digital erstellt und ist ohne Unterschrift gültig.</Text>
        </View>
      </Page>
    </Document>
  );
}

export function ApplicationPDF({ application }: ApplicationPDFProps) {
  return (
    <div className="p-4 border rounded-lg bg-muted">
      <PDFDownloadLink
        document={<PDFDocument application={application} />}
        fileName={`protokoll-${application.id.slice(0, 8)}.pdf`}
      >
        {({ loading }) => (
          <Button className="bg-[var(--primary)]" disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            {loading ? "PDF wird erstellt..." : "PDF herunterladen"}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
}
