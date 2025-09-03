import { getAccessToken, getClientId, getApiUrl } from '@/lib/quran/token-manager';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const verseKey = key; // e.g., "1:1" or "2:255"
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters (translations, fields, etc.)
    const queryString = searchParams.toString();
    console.log(`📡 /api/quran/verses/by_key/${verseKey}: Fetching verse with params:`, queryString);
    
    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();
    
    const url = `${apiUrl}/verses/by_key/${verseKey}${queryString ? `?${queryString}` : ''}`;
    console.log(`📡 /api/quran/verses/by_key/${verseKey}: Request URL:`, url);
    
    const response = await fetch(url, {
      headers: {
        'x-auth-token': token,
        'x-client-id': clientId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ /api/quran/verses/by_key/${verseKey}: API request failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url
      });
      return Response.json(
        { error: `Failed to fetch verse ${verseKey} from Quran API` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ /api/quran/verses/by_key/${verseKey}: Successfully fetched verse:`, {
      verse_key: data.verse?.verse_key,
      hasArabicText: !!data.verse?.text_uthmani,
      hasTranslations: !!data.verse?.translations?.length
    });
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' // Cache for 1 hour
      }
    });
  } catch (error) {
    const { key } = await params;
    console.error(`❌ /api/quran/verses/by_key/${key}: Error:`, error);
    return Response.json(
      { error: `Internal server error while fetching verse ${key}` }, 
      { status: 500 }
    );
  }
}