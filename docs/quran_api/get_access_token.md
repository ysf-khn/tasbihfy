const axios = require('axios');

async function getAccessToken() {
  const clientId = 'YOUR_CLIENT_ID';
  const clientSecret = 'YOUR_CLIENT_SECRET';

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios({
      method: 'post',
      url: 'https://prelive-oauth2.quran.foundation/oauth2/token',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: 'grant_type=client_credentials&scope=content'
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
  }
}

Response

{
  "access_token": "YOUR_ACCESS_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "content"
}

#The Quran Foundation API uses OAuth2 Client Credentials flow. Access tokens are valid for 1 hour (3600 seconds).

Include the token in your API request headers:

x-auth-token: YOUR_ACCESS_TOKEN
x-client-id: YOUR_CLIENT_ID  # Always include your client ID with each request