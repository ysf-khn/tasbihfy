import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { getSurahInfo } from "@/data/surah-names";

// Special verses that get custom treatment
const specialVerses: Record<string, string> = {
  "2:255": "Ayat al-Kursi",
  "2:286": "Last verse of Al-Baqarah",
  "36:1": "Opening of Surah Yaseen",
  "67:1": "Opening of Surah Mulk",
  "112:1": "Surah Ikhlas",
  "1:1": "Opening of the Quran",
  "3:185": "Every soul shall taste death",
  "2:152": "Remember Me and I will remember you",
  "94:5": "Indeed with hardship comes ease",
  "93:5": "Your Lord has not abandoned you",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surahId = parseInt(searchParams.get("surah") || "1");
    const verseNum = parseInt(searchParams.get("verse") || "1");

    const surahInfo = getSurahInfo(surahId);
    if (!surahInfo) {
      return new Response("Surah not found", { status: 404 });
    }

    const verseKey = `${surahId}:${verseNum}`;
    const specialName = specialVerses[verseKey];

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a2e",
            backgroundImage:
              "linear-gradient(135deg, #1a1a2e 25%, transparent 25%), linear-gradient(225deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(315deg, #1a1a2e 25%, #16213e 25%)",
            backgroundPosition: "20px 0, 20px 0, 0 0, 0 0",
            backgroundSize: "40px 40px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "15px",
              }}
            >
              <span style={{ fontSize: "24px", color: "white" }}>📖</span>
            </div>
            <div
              style={{
                color: "white",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  margin: "0",
                  color: "#10b981",
                }}
              >
                Tasbihfy
              </h1>
              <p style={{ fontSize: "16px", margin: "0", opacity: 0.8 }}>
                Quran Online
              </p>
            </div>
          </div>

          {/* Special Badge if applicable */}
          {specialName && (
            <div
              style={{
                backgroundColor: "#10b981",
                color: "white",
                padding: "10px 20px",
                borderRadius: "25px",
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "30px",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {specialName}
            </div>
          )}

          {/* Verse Reference */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "white",
                margin: "0 0 15px 0",
              }}
            >
              Quran {verseKey}
            </h2>
            <p
              style={{
                fontSize: "28px",
                color: "#10b981",
                margin: "0",
                fontWeight: "600",
              }}
            >
              {surahInfo.name}
            </p>
            <p
              style={{
                fontSize: "20px",
                color: "white",
                margin: "10px 0 0 0",
                opacity: 0.8,
              }}
            >
              {surahInfo.translatedName} • Verse {verseNum}
            </p>
          </div>

          {/* Arabic Sample */}
          <div
            style={{
              padding: "30px",
              borderRadius: "15px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "2px solid rgba(16, 185, 129, 0.3)",
              marginBottom: "30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: "36px",
                color: "white",
                margin: "0",
                textAlign: "center",
              }}
            >
              In the name of Allah, Most Gracious, Most Merciful
            </p>
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: "30px",
              marginBottom: "30px",
            }}
          >
            {["Arabic Text", "Translation", "Tafsir", "Audio"].map(
              (feature) => (
                <div
                  key={feature}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    opacity: 0.9,
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      marginRight: "8px",
                      display: "flex",
                    }}
                  />
                  <span style={{ fontSize: "16px" }}>{feature}</span>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "30px",
              display: "flex",
              alignItems: "center",
              color: "white",
              opacity: 0.7,
            }}
          >
            <span style={{ fontSize: "16px" }}>
              Read with word-by-word translation & multiple interpretations
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
