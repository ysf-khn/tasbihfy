import { getAccessToken, getClientId, getApiUrl } from '@/lib/quran/token-manager';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string; tafsirId: string }> }
) {
  try {
    const { chapterId, tafsirId } = await params;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log(`📡 /api/quran/chapters/${chapterId}/tafsirs/${tafsirId}: Fetching chapter tafsir with params:`, queryString);
    
    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();
    
    const url = `${apiUrl}/tafsirs/${tafsirId}/by_chapter/${chapterId}${queryString ? `?${queryString}` : ''}`;
    console.log(`📡 /api/quran/chapters/${chapterId}/tafsirs/${tafsirId}: Request URL:`, url);
    
    const response = await fetch(url, {
      headers: {
        'x-auth-token': token,
        'x-client-id': clientId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ /api/quran/chapters/${chapterId}/tafsirs/${tafsirId}: API request failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url
      });
      return Response.json(
        { error: `Failed to fetch tafsir for chapter ${chapterId} from Quran API` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ /api/quran/chapters/${chapterId}/tafsirs/${tafsirId}: Successfully fetched tafsirs:`, 
      data.tafsirs?.length || 0, 'entries');
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' // Cache for 1 hour
      }
    });
  } catch (error) {
    const { chapterId, tafsirId } = await params;
    console.error(`❌ /api/quran/chapters/${chapterId}/tafsirs/${tafsirId}: Error:`, error);
    return Response.json(
      { error: `Internal server error while fetching tafsir for chapter ${chapterId}` }, 
      { status: 500 }
    );
  }
}