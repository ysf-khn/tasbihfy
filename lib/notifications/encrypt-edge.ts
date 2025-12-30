/**
 * Edge-compatible Web Push payload encryption
 * Implements RFC 8291 (Message Encryption for Web Push) using Web Crypto API
 */

import { base64UrlDecode, base64UrlEncode } from './vapid-edge';

const textEncoder = new TextEncoder();

/**
 * Concatenate multiple Uint8Arrays
 */
function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * HKDF (HMAC-based Key Derivation Function) implementation
 * Uses SHA-256 as the hash function
 */
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  // Import IKM as key material
  const ikmKey = await crypto.subtle.importKey(
    'raw',
    ikm,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  // Derive bits using HKDF
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt,
      info: info,
    },
    ikmKey,
    length * 8
  );

  return new Uint8Array(derivedBits);
}

/**
 * Create info string for HKDF according to RFC 8291
 */
function createInfo(
  type: 'aesgcm' | 'nonce',
  clientPublicKey: Uint8Array,
  serverPublicKey: Uint8Array
): Uint8Array {
  // Info format: "Content-Encoding: <type>\0" + "P-256\0" +
  // len(clientPublicKey) + clientPublicKey + len(serverPublicKey) + serverPublicKey

  const contentEncoding = textEncoder.encode(`Content-Encoding: ${type}\0`);
  const keyLabel = textEncoder.encode('P-256\0');

  // Client public key length (2 bytes, big endian)
  const clientKeyLength = new Uint8Array([0, clientPublicKey.length]);
  // Server public key length (2 bytes, big endian)
  const serverKeyLength = new Uint8Array([0, serverPublicKey.length]);

  return concatUint8Arrays(
    contentEncoding,
    keyLabel,
    clientKeyLength,
    clientPublicKey,
    serverKeyLength,
    serverPublicKey
  );
}

/**
 * Import a P-256 public key from raw bytes (65 bytes, uncompressed format)
 */
async function importP256PublicKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
}

/**
 * Export a P-256 public key to raw bytes (65 bytes, uncompressed format)
 */
async function exportP256PublicKey(key: CryptoKey): Promise<Uint8Array> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/**
 * Generate a new P-256 key pair for ECDH
 */
async function generateP256KeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
}

/**
 * Perform ECDH key agreement
 */
async function ecdhDeriveBits(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<Uint8Array> {
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: publicKey },
    privateKey,
    256
  );
  return new Uint8Array(sharedSecret);
}

/**
 * Encrypt a Web Push message payload according to RFC 8291
 *
 * @param payload - The message payload to encrypt (as string)
 * @param subscriptionPublicKey - Base64URL-encoded P-256 public key from the subscription
 * @param subscriptionAuth - Base64URL-encoded auth secret from the subscription
 * @returns Encrypted payload with headers
 */
export async function encryptPayload(
  payload: string,
  subscriptionPublicKey: string,
  subscriptionAuth: string
): Promise<{
  ciphertext: Uint8Array;
  salt: Uint8Array;
  serverPublicKey: Uint8Array;
}> {
  // Decode subscription keys
  const clientPublicKeyBytes = base64UrlDecode(subscriptionPublicKey);
  const authSecret = base64UrlDecode(subscriptionAuth);

  // Generate ephemeral server key pair
  const serverKeyPair = await generateP256KeyPair();
  const serverPublicKeyBytes = await exportP256PublicKey(serverKeyPair.publicKey);

  // Import client public key
  const clientPublicKey = await importP256PublicKey(clientPublicKeyBytes);

  // Perform ECDH to get shared secret
  const sharedSecret = await ecdhDeriveBits(serverKeyPair.privateKey, clientPublicKey);

  // Generate random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive PRK (Pseudo-Random Key) using HKDF
  // IKM = auth_secret, salt = shared_secret, info = "WebPush: info\0" + client_public + server_public
  const authInfo = concatUint8Arrays(
    textEncoder.encode('WebPush: info\0'),
    clientPublicKeyBytes,
    serverPublicKeyBytes
  );

  // First HKDF: Extract PRK from auth secret and shared secret
  const ikm = await hkdf(authSecret, sharedSecret, authInfo, 32);

  // Derive CEK (Content Encryption Key) - 16 bytes for AES-128-GCM
  const cekInfo = createInfo('aesgcm', clientPublicKeyBytes, serverPublicKeyBytes);
  const cek = await hkdf(salt, ikm, cekInfo, 16);

  // Derive nonce - 12 bytes
  const nonceInfo = createInfo('nonce', clientPublicKeyBytes, serverPublicKeyBytes);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // Prepare plaintext with padding
  // Format: padding_length (2 bytes) + padding + payload
  const payloadBytes = textEncoder.encode(payload);
  const paddingLength = 0; // No additional padding for simplicity
  const paddingHeader = new Uint8Array([paddingLength >> 8, paddingLength & 0xff]);
  const padding = new Uint8Array(paddingLength);
  const plaintext = concatUint8Arrays(paddingHeader, padding, payloadBytes);

  // Import CEK for AES-GCM encryption
  const aesKey = await crypto.subtle.importKey(
    'raw',
    cek,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Encrypt with AES-128-GCM
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 },
    aesKey,
    plaintext
  );

  return {
    ciphertext: new Uint8Array(ciphertext),
    salt,
    serverPublicKey: serverPublicKeyBytes,
  };
}

/**
 * Build the encrypted request body with proper headers
 * Returns the body as Uint8Array and the required headers
 */
export async function buildEncryptedRequest(
  payload: string,
  subscriptionPublicKey: string,
  subscriptionAuth: string
): Promise<{
  body: Uint8Array;
  headers: {
    'Content-Encoding': string;
    Encryption: string;
    'Crypto-Key': string;
    'Content-Type': string;
    'Content-Length': string;
  };
}> {
  const encrypted = await encryptPayload(payload, subscriptionPublicKey, subscriptionAuth);

  // For aes128gcm encoding, the body format is:
  // salt (16 bytes) + record_size (4 bytes) + server_public_key_length (1 byte) +
  // server_public_key (65 bytes) + ciphertext

  const recordSize = new Uint8Array([0, 0, 0x10, 0x00]); // 4096 in big-endian
  const serverKeyLength = new Uint8Array([encrypted.serverPublicKey.length]);

  const body = concatUint8Arrays(
    encrypted.salt,
    recordSize,
    serverKeyLength,
    encrypted.serverPublicKey,
    encrypted.ciphertext
  );

  return {
    body,
    headers: {
      'Content-Encoding': 'aes128gcm',
      Encryption: `salt=${base64UrlEncode(encrypted.salt)}`,
      'Crypto-Key': `dh=${base64UrlEncode(encrypted.serverPublicKey)}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': body.length.toString(),
    },
  };
}
