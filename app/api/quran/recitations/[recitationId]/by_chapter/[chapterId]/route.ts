import { getAccessToken, getClientId, getApiUrl } from '@/lib/quran/token-manager';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ recitationId: string; chapterId: string }> }
) {
  try {
    const { recitationId, chapterId } = await params;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log(`📡 /api/quran/recitations/${recitationId}/by_chapter/${chapterId}: Fetching chapter audio with params:`, queryString);
    
    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();
    
    const url = `${apiUrl}/recitations/${recitationId}/by_chapter/${chapterId}${queryString ? `?${queryString}` : ''}`;
    console.log(`📡 /api/quran/recitations/${recitationId}/by_chapter/${chapterId}: Request URL:`, url);
    
    const response = await fetch(url, {
      headers: {
        'x-auth-token': token,
        'x-client-id': clientId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ /api/quran/recitations/${recitationId}/by_chapter/${chapterId}: API request failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url
      });
      return Response.json(
        { error: `Failed to fetch recitation for chapter ${chapterId} from Quran API` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ /api/quran/recitations/${recitationId}/by_chapter/${chapterId}: Successfully fetched audio files:`, 
      data.audio_files?.length || 0, 'files');
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' // Cache for 24 hours
      }
    });
  } catch (error) {
    const { recitationId, chapterId } = await params;
    console.error(`❌ /api/quran/recitations/${recitationId}/by_chapter/${chapterId}: Error:`, error);
    return Response.json(
      { error: `Internal server error while fetching recitation for chapter ${chapterId}` }, 
      { status: 500 }
    );
  }
}