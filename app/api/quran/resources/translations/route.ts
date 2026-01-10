import {
  getAccessToken,
  getClientId,
  getApiUrl,
} from "@/lib/quran/token-manager";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    console.log(
      "📡 /api/quran/resources/translations: Fetching available translations with params:",
      queryString
    );

    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();

    const url = `${apiUrl}/resources/translations${
      queryString ? `?${queryString}` : ""
    }`;
    console.log("📡 /api/quran/resources/translations: Request URL:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-auth-token": token,
        "x-client-id": clientId,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ /api/quran/resources/translations: API request failed:",
        {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
        }
      );
      return Response.json(
        { error: "Failed to fetch translations from Quran API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      "✅ /api/quran/resources/translations: Successfully fetched",
      data.translations?.length || 0,
      "translations"
    );

    return Response.json(data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("❌ /api/quran/resources/translations: Error:", error);
    return Response.json(
      { error: "Internal server error while fetching translations" },
      { status: 500 }
    );
  }
}
