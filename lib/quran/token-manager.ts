// OAuth2 token management for Quran API

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

/**
 * Get a valid access token for Quran API
 * Uses cached token if still valid, otherwise fetches a new one
 */
export async function getAccessToken(): Promise<string> {
  console.log("🔐 getAccessToken: Checking for valid token");

  // Check if cached token is still valid (with 1 minute buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    console.log("✅ getAccessToken: Using cached token");
    return cachedToken.token;
  }

  console.log("🔄 getAccessToken: Fetching new token");

  try {
    // Use appropriate credentials based on environment
    const isDev = process.env.NODE_ENV === "development";
    const clientId = isDev
      ? process.env.QURAN_API_CLIENT_ID
      : process.env.QURAN_API_CLIENT_ID_PROD;
    const clientSecret = isDev
      ? process.env.QURAN_API_CLIENT_SECRET
      : process.env.QURAN_API_CLIENT_SECRET_PROD;
    const authUrl = isDev
      ? process.env.QURAN_API_AUTH_URL
      : process.env.QURAN_API_AUTH_URL_PROD;

    if (!clientId || !clientSecret || !authUrl) {
      throw new Error("Missing Quran API credentials in environment variables");
    }

    console.log(
      "📡 getAccessToken: Making OAuth request with client ID:",
      clientId
    );

    // Create basic auth header
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${authUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=content",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ getAccessToken: OAuth request failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `OAuth request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ getAccessToken: OAuth response received:", {
      hasToken: !!data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      scope: data.scope,
    });

    if (!data.access_token) {
      throw new Error("No access token received from OAuth response");
    }

    // Cache the token with expiry time
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    console.log(
      "💾 getAccessToken: Token cached until",
      new Date(cachedToken.expiresAt)
    );
    return data.access_token;
  } catch (error) {
    console.error("❌ getAccessToken: Error fetching token:", error);
    throw error;
  }
}

/**
 * Get the client ID for API requests
 */
export function getClientId(): string {
  // Use appropriate client ID based on environment
  const isDev = process.env.NODE_ENV === "development";
  const clientId = isDev
    ? process.env.QURAN_API_CLIENT_ID
    : process.env.QURAN_API_CLIENT_ID_PROD;

  if (!clientId) {
    throw new Error("Missing Quran API client ID in environment variables");
  }

  return clientId;
}

/**
 * Get the base API URL for content (not OAuth)
 */
export function getApiUrl(): string {
  // Use appropriate API URL based on environment
  const isDev = process.env.NODE_ENV === "development";
  return isDev
    ? process.env.QURAN_API_URL ||
        "https://apis-prelive.quran.foundation/api/content/v4"
    : "https://apis.quran.foundation/content/api/v4";
}

/**
 * Clear cached token (useful for testing or error recovery)
 */
export function clearTokenCache(): void {
  console.log("🗑️ clearTokenCache: Clearing cached token");
  cachedToken = null;
}

/**
 * Check if we have a valid cached token
 */
export function hasValidToken(): boolean {
  return cachedToken !== null && Date.now() < cachedToken.expiresAt - 60000;
}
