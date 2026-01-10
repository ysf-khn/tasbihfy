import {
  getAccessToken,
  getClientId,
  getApiUrl,
} from "@/lib/quran/token-manager";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ recitationId: string; ayahKey: string }> }
) {
  try {
    const { recitationId, ayahKey } = await params;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    console.log(
      `📡 /api/quran/recitations/${recitationId}/by_ayah/${ayahKey}: Fetching audio with params:`,
      queryString
    );

    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();

    const url = `${apiUrl}/recitations/${recitationId}/by_ayah/${ayahKey}${
      queryString ? `?${queryString}` : ""
    }`;
    console.log(
      `📡 /api/quran/recitations/${recitationId}/by_ayah/${ayahKey}: Request URL:`,
      url
    );

    const response = await fetch(url, {
      headers: {
        "x-auth-token": token,
        "x-client-id": clientId,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ /api/quran/recitations/${recitationId}/by_ayah/${ayahKey}: API request failed:`,
        {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
        }
      );
      return Response.json(
        {
          error: `Failed to fetch recitation for ayah ${ayahKey} from Quran API`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      `✅ /api/quran/recitations/${recitationId}/by_ayah/${ayahKey}: Successfully fetched audio:`,
      {
        hasAudioUrl: !!data.audio_files?.[0]?.url,
        audioFormat: data.audio_files?.[0]?.format,
      }
    );

    return Response.json(data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800", // Cache for 24 hours
      },
    });
  } catch (error) {
    const { recitationId, ayahKey } = await params;
    console.error(
      `❌ /api/quran/recitations/${recitationId}/by_ayah/${ayahKey}: Error:`,
      error
    );
    return Response.json(
      {
        error: `Internal server error while fetching recitation for ayah ${ayahKey}`,
      },
      { status: 500 }
    );
  }
}
