import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat und lon sind erforderlich" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenWeather API nicht konfiguriert" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=de`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Wetterdaten nicht verfügbar" }, { status: 502 });
    }

    const data = await res.json();

    return NextResponse.json({
      temp: data.main?.temp,
      humidity: data.main?.humidity,
      windSpeed: data.wind?.speed,
      windDir: degToCompass(data.wind?.deg),
      condition: data.weather?.[0]?.description,
      rainMm: data.rain?.["1h"] || 0,
    });
  } catch {
    return NextResponse.json({ error: "Fehler beim Abrufen der Wetterdaten" }, { status: 500 });
  }
}

function degToCompass(deg: number | undefined): string {
  if (deg === undefined) return "N/A";
  const dirs = ["N", "NNO", "NO", "ONO", "O", "OSO", "SO", "SSO", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}
