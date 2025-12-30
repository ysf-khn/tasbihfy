import { getAccessToken, getClientId, getApiUrl } from '@/lib/quran/token-manager';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ translationId: string; ayahKey: string }> }
) {
  try {
    const { translationId, ayahKey } = await params;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log(`📡 /api/quran/translations/${translationId}/by_ayah/${ayahKey}: Fetching translation with params:`, queryString);
    
    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();
    
    const url = `${apiUrl}/translations/${translationId}/by_ayah/${ayahKey}${queryString ? `?${queryString}` : ''}`;
    console.log(`📡 /api/quran/translations/${translationId}/by_ayah/${ayahKey}: Request URL:`, url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-auth-token': token,
        'x-client-id': clientId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ /api/quran/translations/${translationId}/by_ayah/${ayahKey}: API request failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url
      });
      return Response.json(
        { error: `Failed to fetch translation for ayah ${ayahKey} from Quran API` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ /api/quran/translations/${translationId}/by_ayah/${ayahKey}: Successfully fetched translation:`, {
      hasTranslationText: !!data.translation?.text,
      textLength: data.translation?.text?.length || 0
    });
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' // Cache for 24 hours
      }
    });
  } catch (error) {
    const { translationId, ayahKey } = await params;
    console.error(`❌ /api/quran/translations/${translationId}/by_ayah/${ayahKey}: Error:`, error);
    return Response.json(
      { error: `Internal server error while fetching translation for ayah ${ayahKey}` }, 
      { status: 500 }
    );
  }
}