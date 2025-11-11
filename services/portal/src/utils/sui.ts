import { Buffer } from 'buffer';
import { secp256r1 } from '@noble/curves/p256';
import { PasskeyPublicKey } from '@mysten/sui/keypairs/passkey';

/**
 * Derive Sui address from the passkey public key
 * According to SIP-9, passkey addresses are derived using PasskeyPublicKey (flag 0x06)
 * @param compressedPublicKey - Base64 encoded compressed public key from passkey
 * @returns Sui address (0x...)
 */
export function deriveSuiAddress(compressedPublicKey: string): string {
  try {
    // Decode the compressed public key
    const publicKeyBytes = Buffer.from(compressedPublicKey, 'base64');

    // Create Sui PasskeyPublicKey from the compressed bytes
    // This uses flag 0x06 for address derivation (passkey scheme)
    const suiPublicKey = new PasskeyPublicKey(publicKeyBytes);

    // Get Sui address
    const suiAddress = suiPublicKey.toSuiAddress();

    console.log('✅ [Portal] Derived Sui address:', suiAddress);
    console.log('   📋 Public key bytes:', publicKeyBytes.length);

    return suiAddress;
  } catch (error) {
    console.error('Failed to derive Sui address:', error);
    throw error;
  }
}

/**
 * Sign a message for Sui using the passkey
 * @param credentialId - The passkey credential ID
 * @param messageBytes - The message bytes to sign
 * @returns Signature data for Sui
 */
export async function signSuiMessage(
  credentialId: string,
  messageBytes: Uint8Array
): Promise<{
  signature: Uint8Array;
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
}> {
  try {
    // Use WebAuthn to sign with the passkey
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: messageBytes,
        allowCredentials: [{
          type: "public-key",
          id: new Uint8Array(Buffer.from(credentialId, "base64"))
        }],
      },
    })) as PublicKeyCredential;

    if (!credential) {
      throw new Error("No credential returned during signing");
    }

    const assertionResponse = credential.response as AuthenticatorAssertionResponse;

    return {
      signature: new Uint8Array(assertionResponse.signature),
      authenticatorData: new Uint8Array(assertionResponse.authenticatorData),
      clientDataJSON: new Uint8Array(assertionResponse.clientDataJSON),
    };
  } catch (error) {
    console.error('Failed to sign Sui message:', error);
    throw error;
  }
}

/**
 * Prepare Sui signature for transaction submission
 * This converts the raw WebAuthn signature into Sui's expected format
 */
export function prepareSuiSignature(
  signature: Uint8Array,
  publicKey: string
): {
  normalizedSignature: string;
  publicKeyBase64: string;
} {
  // Parse and normalize the DER signature
  const sig = secp256r1.Signature.fromDER(signature);
  const normalized = sig.normalizeS();

  return {
    normalizedSignature: Buffer.from(normalized.toCompactRawBytes()).toString('base64'),
    publicKeyBase64: publicKey,
  };
}
