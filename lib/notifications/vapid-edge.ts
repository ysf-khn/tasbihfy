/**
 * Edge-compatible VAPID (Voluntary Application Server Identification) utilities
 * Uses Web Crypto API for JWT signing with ES256 (P-256 curve)
 */

// Base64URL encoding/decoding utilities
export function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlDecode(str: string): Uint8Array {
  // Add padding if necessary
  const padding = (4 - (str.length % 4)) % 4;
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padding);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Text encoder for consistent encoding
const textEncoder = new TextEncoder();

/**
 * Import a VAPID private key for ES256 signing
 * VAPID private keys are base64url-encoded 32-byte raw EC private keys
 */
async function importVapidPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
  const privateKeyBytes = base64UrlDecode(privateKeyBase64);

  // For ES256 (P-256), the private key is 32 bytes
  // We need to create a JWK from the raw private key
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    d: base64UrlEncode(privateKeyBytes),
    // We need x and y coordinates, but for signing we can derive them
    // or use a placeholder since only 'd' is needed for signing
    x: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    y: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  };

  // Actually, we need to properly compute x,y from private key
  // Let's use a different approach - import as raw PKCS8

  // For P-256, create a proper JWK with computed public key
  // Since we have the private key, we need to derive the public key
  // This is complex, so let's use the PKCS8 format instead

  // Create PKCS8 wrapper for the raw private key
  // PKCS8 format for P-256:
  // SEQUENCE {
  //   INTEGER 0 (version)
  //   SEQUENCE { OID 1.2.840.10045.2.1 (ecPublicKey), OID 1.2.840.10045.3.1.7 (prime256v1) }
  //   OCTET STRING { OCTET STRING { private key bytes } }
  // }

  const pkcs8Header = new Uint8Array([
    0x30, 0x41, // SEQUENCE, 65 bytes
    0x02, 0x01, 0x00, // INTEGER 0 (version)
    0x30, 0x13, // SEQUENCE, 19 bytes
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID 1.2.840.10045.2.1 (ecPublicKey)
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID 1.2.840.10045.3.1.7 (prime256v1)
    0x04, 0x27, // OCTET STRING, 39 bytes
    0x30, 0x25, // SEQUENCE, 37 bytes
    0x02, 0x01, 0x01, // INTEGER 1 (version)
    0x04, 0x20, // OCTET STRING, 32 bytes (private key)
  ]);

  const pkcs8Key = new Uint8Array(pkcs8Header.length + privateKeyBytes.length);
  pkcs8Key.set(pkcs8Header);
  pkcs8Key.set(privateKeyBytes, pkcs8Header.length);

  try {
    return await crypto.subtle.importKey(
      'pkcs8',
      pkcs8Key,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
  } catch {
    // If PKCS8 import fails, try JWK approach with a workaround
    // Generate a new key pair and only use the private scalar
    throw new Error('Failed to import VAPID private key. Ensure VAPID_PRIVATE_KEY is a valid base64url-encoded P-256 private key.');
  }
}

/**
 * Create a VAPID JWT token
 */
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKey: CryptoKey,
  expiration: number
): Promise<string> {
  // JWT Header
  const header = {
    typ: 'JWT',
    alg: 'ES256',
  };

  // JWT Payload
  const payload = {
    aud: audience,
    exp: expiration,
    sub: subject,
  };

  // Encode header and payload
  const headerEncoded = base64UrlEncode(textEncoder.encode(JSON.stringify(header)));
  const payloadEncoded = base64UrlEncode(textEncoder.encode(JSON.stringify(payload)));

  // Create signature input
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;
  const signatureInputBytes = textEncoder.encode(signatureInput);

  // Sign with ECDSA P-256
  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    signatureInputBytes
  );

  // The signature from Web Crypto is in IEEE P1363 format (r || s)
  // JWT expects this format, so we can use it directly
  const signatureEncoded = base64UrlEncode(signatureBuffer);

  return `${signatureInput}.${signatureEncoded}`;
}

/**
 * Generate VAPID Authorization headers for a push request
 */
export async function generateVapidHeaders(
  endpoint: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<{ Authorization: string; 'Crypto-Key': string }> {
  // Extract the origin from the endpoint URL
  const endpointUrl = new URL(endpoint);
  const audience = endpointUrl.origin;

  // Set expiration to 12 hours from now (max is 24 hours)
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

  // Import the private key
  const cryptoKey = await importVapidPrivateKey(privateKey);

  // Create the JWT
  const jwt = await createVapidJwt(audience, subject, cryptoKey, expiration);

  return {
    Authorization: `vapid t=${jwt}, k=${publicKey}`,
    'Crypto-Key': `p256ecdsa=${publicKey}`,
  };
}

/**
 * Alternative VAPID header generation using a simpler approach
 * This creates the Authorization header in the newer format
 */
export async function generateVapidAuthHeader(
  endpoint: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<string> {
  const headers = await generateVapidHeaders(endpoint, subject, publicKey, privateKey);
  return headers.Authorization;
}
