import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const LABEL_OCR_PROMPT = `Du bist ein Experte für Pflanzenschutzmittel-Etiketten. Analysiere dieses Produktetikett und extrahiere folgende Informationen im JSON-Format:

{
  "productName": "Vollständiger Produktname",
  "activeIngredient": "Wirkstoff(e) mit Konzentration",
  "concentration": "Konzentration z.B. '480 g/l'",
  "applicationRate": "Empfohlene Ausbringungsrate z.B. '3-4 l/ha'",
  "reentryInterval": "Wiederbetretungsfrist in Stunden z.B. '48'",
  "ppiNumber": "Zulassungsnummer falls sichtbar",
  "targetOrganisms": ["Liste der Zielorganismen"],
  "safetyInstructions": ["Wichtige Sicherheitshinweise"],
  "manufacturer": "Hersteller"
}

Wenn eine Information nicht lesbar oder nicht vorhanden ist, setze den Wert auf null. Antworte NUR mit dem JSON-Objekt, kein zusätzlicher Text.`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { image, mediaType } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Kein Bild übermittelt" }, { status: 400 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: LABEL_OCR_PROMPT,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Keine Antwort von Claude" }, { status: 500 });
    }

    let ocrData;
    try {
      const jsonStr = textBlock.text.replace(/```json\n?|\n?```/g, "").trim();
      ocrData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "Konnte OCR-Daten nicht parsen", raw: textBlock.text }, { status: 422 });
    }

    // Create product in DB
    const product = await prisma.product.create({
      data: {
        organizationId: session.user.organizationId,
        name: ocrData.productName || "Unbekanntes Produkt",
        activeIngredient: ocrData.activeIngredient || "Unbekannt",
        concentration: ocrData.concentration,
        applicationRate: ocrData.applicationRate,
        reentryInterval: ocrData.reentryInterval,
        ppiNumber: ocrData.ppiNumber,
        rawOcrData: ocrData,
      },
    });

    return NextResponse.json({ product, ocrData });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
