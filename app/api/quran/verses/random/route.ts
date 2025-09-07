import { getAccessToken, getClientId, getApiUrl } from '@/lib/quran/token-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters (translations, language, words, etc.)
    const queryString = searchParams.toString();
    console.log('📡 /api/quran/verses/random: Fetching random verse with params:', queryString);
    
    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();
    
    const url = `${apiUrl}/verses/random${queryString ? `?${queryString}` : ''}`;
    console.log('📡 /api/quran/verses/random: Request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'x-auth-token': token,
        'x-client-id': clientId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ /api/quran/verses/random: API request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: url
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch random verse from Quran API',
          details: errorText,
          status: response.status 
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('✅ /api/quran/verses/random: Successfully fetched random verse:', data.verse?.verse_key);
    
    return Response.json(data);
    
  } catch (error) {
    console.error('❌ /api/quran/verses/random: Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error while fetching random verse',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}