import {
  getAccessToken,
  getClientId,
  getApiUrl,
} from "@/lib/quran/token-manager";
import { QURAN_SCRIPTS } from "@/lib/quran/constants";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ script: string }> }
) {
  try {
    const { script } = await params;

    // Validate script parameter
    const validScripts = Object.values(QURAN_SCRIPTS).map((s) => s.apiEndpoint);
    if (!validScripts.includes(script as any)) {
      console.error(`❌ Invalid script parameter: ${script}`);
      return Response.json(
        {
          error: `Invalid script type: ${script}. Valid options: ${validScripts.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    console.log(
      `📡 /api/quran/verses/${script}: Proxying request with params:`,
      queryString
    );

    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();

    // Construct the external API URL with query parameters
    // Note: Script endpoints use /quran/verses/{script} path
    const url = `${apiUrl}/quran/verses/${script}${
      queryString ? "?" + queryString : ""
    }`;
    console.log(`📡 /api/quran/verses/${script}: External API URL:`, url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-auth-token": token,
        "x-client-id": clientId,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ /api/quran/verses/${script}: API request failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url,
      });
      return Response.json(
        { error: `Failed to fetch ${script} verses from Quran API` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      `✅ /api/quran/verses/${script}: Successfully fetched`,
      data.verses?.length || 0,
      "verses"
    );

    // Log first verse for debugging
    if (data.verses && data.verses.length > 0) {
      const firstVerse = data.verses[0];
      console.log(`📖 /api/quran/verses/${script}: First verse sample:`, {
        verse_key: firstVerse.verse_key,
        hasText: !!firstVerse.text,
        textPreview: firstVerse.text?.substring(0, 50) + "...",
      });
    }

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200", // Cache for 1 hour
      },
    });
  } catch (error) {
    const { script } = await params;
    console.error(`❌ /api/quran/verses/${script}: Error:`, error);
    return Response.json(
      { error: `Internal server error while fetching ${script} verses` },
      { status: 500 }
    );
  }
}
