import {
  getAccessToken,
  getClientId,
  getApiUrl,
} from "@/lib/quran/token-manager";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapterId = id;
    const { searchParams } = new URL(request.url);

    // Set default parameters for optimal API usage
    const defaultParams = new URLSearchParams({
      words: "false", // We don't need word-by-word breakdown
      per_page: "286", // Max verses in any surah (Al-Baqarah)
    });

    // Override defaults with any provided parameters
    for (const [key, value] of searchParams.entries()) {
      defaultParams.set(key, value);
    }

    const queryString = defaultParams.toString();
    console.log(
      `📡 /api/quran/verses/by_chapter/${chapterId}: Fetching verses with params:`,
      queryString
    );

    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();

    const url = `${apiUrl}/verses/by_chapter/${chapterId}?${queryString}`;
    console.log(
      `📡 /api/quran/verses/by_chapter/${chapterId}: Request URL:`,
      url
    );

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
        `❌ /api/quran/verses/by_chapter/${chapterId}: API request failed:`,
        {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
        }
      );
      return Response.json(
        {
          error: `Failed to fetch verses for chapter ${chapterId} from Quran API`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      `✅ /api/quran/verses/by_chapter/${chapterId}: Successfully fetched`,
      data.verses?.length || 0,
      "verses"
    );

    // Log first verse for debugging
    if (data.verses && data.verses.length > 0) {
      const firstVerse = data.verses[0];
      console.log(
        `📖 /api/quran/verses/by_chapter/${chapterId}: First verse sample:`,
        {
          verse_key: firstVerse.verse_key,
          hasArabicText: !!firstVerse.text_uthmani,
          translationsCount: firstVerse.translations?.length || 0,
          translationResourceIds:
            firstVerse.translations?.map((t: any) => t.resource_id) || [],
        }
      );

      // Log translation details
      if (firstVerse.translations && firstVerse.translations.length > 0) {
        console.log(
          `🌐 /api/quran/verses/by_chapter/${chapterId}: Translation details:`,
          firstVerse.translations.map((t: any) => ({
            resource_id: t.resource_id,
            hasText: !!t.text,
            textPreview: t.text?.substring(0, 30) + "...",
          }))
        );
      } else {
        console.warn(
          `⚠️ /api/quran/verses/by_chapter/${chapterId}: No translations in API response!`
        );
      }
    }

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600", // Cache for 30 minutes
      },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`❌ /api/quran/verses/by_chapter/${id}: Error:`, error);
    return Response.json(
      {
        error: `Internal server error while fetching verses for chapter ${id}`,
      },
      { status: 500 }
    );
  }
}
