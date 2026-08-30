import { withEdgeCache } from "@/lib/http/edge-cache";
import {
  getAccessToken,
  getClientId,
  getApiUrl,
} from "@/lib/quran/token-manager";

async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    console.log(
      "📡 /api/quran/recitations: Fetching available recitations with params:",
      queryString
    );

    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();

    const url = `${apiUrl}/resources/recitations${
      queryString ? `?${queryString}` : ""
    }`;
    console.log("📡 /api/quran/recitations: Request URL:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-auth-token": token,
        "x-client-id": clientId,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ /api/quran/recitations: API request failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url,
      });
      return Response.json(
        { error: "Failed to fetch recitations from Quran API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      "✅ /api/quran/recitations: Successfully fetched",
      data.recitations?.length || 0,
      "recitations"
    );

    return Response.json(data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("❌ /api/quran/recitations: Error:", error);
    return Response.json(
      { error: "Internal server error while fetching recitations" },
      { status: 500 }
    );
  }
}

export const GET = withEdgeCache(handler);
