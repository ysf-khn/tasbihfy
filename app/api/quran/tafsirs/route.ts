import { getAccessToken, getClientId, getApiUrl } from '@/lib/quran/token-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log('📡 /api/quran/tafsirs: Fetching available tafsirs with params:', queryString);
    
    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();
    
    const url = `${apiUrl}/resources/tafsirs${queryString ? `?${queryString}` : ''}`;
    console.log('📡 /api/quran/tafsirs: Request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-auth-token': token,
        'x-client-id': clientId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ /api/quran/tafsirs: API request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url
      });
      return Response.json(
        { error: 'Failed to fetch tafsirs from Quran API' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ /api/quran/tafsirs: Successfully fetched', data.tafsirs?.length || 0, 'tafsirs');
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error('❌ /api/quran/tafsirs: Error:', error);
    return Response.json(
      { error: 'Internal server error while fetching tafsirs' }, 
      { status: 500 }
    );
  }
}