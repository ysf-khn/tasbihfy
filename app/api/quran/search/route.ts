import { getAccessToken, getClientId, getApiUrl } from '@/lib/quran/token-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const query = searchParams.get('q');
    
    if (!query) {
      return Response.json(
        { error: 'Search query parameter "q" is required' }, 
        { status: 400 }
      );
    }
    
    console.log(`📡 /api/quran/search: Searching for "${query}" with params:`, queryString);
    
    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();
    
    const url = `${apiUrl}/search?${queryString}`;
    console.log('📡 /api/quran/search: Request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-auth-token': token,
        'x-client-id': clientId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ /api/quran/search: API request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url
      });
      return Response.json(
        { error: 'Failed to perform search on Quran API' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ /api/quran/search: Successfully found`, data.search?.results?.length || 0, 'results for query:', query);
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' // Cache for 30 minutes
      }
    });
  } catch (error) {
    console.error('❌ /api/quran/search: Error:', error);
    return Response.json(
      { error: 'Internal server error while performing search' }, 
      { status: 500 }
    );
  }
}