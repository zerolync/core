import { Buffer } from 'buffer';
import { generateRandomChallenge, SECP256R1_SPKI_HEADER } from './utils';
import { secp256r1 } from '@noble/curves/p256';
import { sha256 } from '@noble/hashes/sha256';
import { blake2b } from '@noble/hashes/blake2b';
import { saveCredentialId } from './storage';
import { deriveSuiAddress } from './sui';

// Types and Interfaces
export interface WalletResult {
  credentialId: string;
  publickey: string;
  status: 'created' | 'existing';
  suiAddress?: string; // Added Sui address
}

export interface CustomWebAuthnOptions {
  authenticatorAttachment?: "platform" | "cross-platform" | undefined;
  userVerification?: "required" | "preferred" | "discouraged";
  residentKey?: "required" | "preferred" | "discouraged";
  timeout?: number;
  attestation?: "none" | "indirect" | "direct" | "enterprise";
}

interface WebAuthnEnvironment {
  isCustomTabs: boolean;
  options: CustomWebAuthnOptions;
}

// Constants
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_CHALLENGE = new Uint8Array([117, 61, 252, 231, 191, 241]);
const CREDENTIAL_STORAGE_KEYS = {
  id: "CREDENTIAL_ID",
  publicKey: "PUBLIC_KEY"
};

// Helper Functions
function getWebAuthnEnvironment(): WebAuthnEnvironment {
  const globalOptions = (window as any).__webauthn_options;
  const isCustomTabs = navigator.userAgent.includes('wv') && 
                      navigator.userAgent.includes('Chrome') &&
                      !(window as any).chrome?.runtime;

  const options = {
    // Don't force platform - let browser show all available options
    // This will show both local (Touch ID/fingerprint) and cross-platform (phone) options
    authenticatorAttachment: globalOptions?.authenticatorAttachment, // undefined = show all options
    userVerification: globalOptions?.userVerification ?? "preferred", // preferred = use if available
    residentKey: globalOptions?.residentKey ?? "preferred", // preferred = use if available
    timeout: globalOptions?.timeout ?? DEFAULT_TIMEOUT,
    attestation: globalOptions?.attestation ?? "none"
  };

  return { isCustomTabs, options };
}

function buildAuthenticatorSelection(options: CustomWebAuthnOptions): any {
  const selection: any = {
    userVerification: options.userVerification
  };

  if (options.authenticatorAttachment) {
    selection.authenticatorAttachment = options.authenticatorAttachment;
  }

  if (options.residentKey === "required") {
    selection.residentKey = "required";
    selection.requireResidentKey = true;
  } else if (options.residentKey === "preferred") {
    selection.residentKey = "preferred";
    selection.requireResidentKey = false;
  } else {
    selection.residentKey = "discouraged";
    selection.requireResidentKey = false;
  }

  return selection;
}

function processPublicKey(pubkeyBuffer: ArrayBuffer): string {
  const publicKey = new Uint8Array(pubkeyBuffer);
  const pubkeyUncompressed = publicKey.slice(SECP256R1_SPKI_HEADER.length);
  const pubkey = secp256r1.ProjectivePoint.fromHex(pubkeyUncompressed);
  return Buffer.from(pubkey.toRawBytes(true)).toString("base64");
}

function handleWebAuthnError(error: unknown, operation: string, displayStatus: (message: string, type: string) => void): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  const { isCustomTabs } = getWebAuthnEnvironment();
  
  console.error(`❌ ${operation} failed:`, {
    error: errorName,
    message: errorMessage,
    environment: isCustomTabs ? 'Custom Tabs' : 'Regular Browser'
  });
  
  displayStatus(`${operation} failed: ${errorMessage}`, "error");
  throw error;
}

// Main WebAuthn Functions
export async function signUp(
  displayStatus: (message: string, type: string) => void
): Promise<WalletResult> {
  try {
    const { isCustomTabs, options } = getWebAuthnEnvironment();
    const authenticatorSelection = buildAuthenticatorSelection(options);
    const userData = generateRandomChallenge();

    displayStatus(
      isCustomTabs ? "Creating passkey for Custom Tabs..." : "Creating passkey...", 
      "loading"
    );

    console.log('🔧 WebAuthn options:', {
      environment: isCustomTabs ? 'Custom Tabs' : 'Regular Browser',
      authenticatorSelection,
      timeout: options.timeout
    });
    console.log(window.location.hostname)
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: DEFAULT_CHALLENGE,
        rp: {
           name: "Passkey Sharing Hub",
           id: window.location.hostname
        },
        user: { id: userData, name: "Passkey Sharing Hub", displayName: "Passkey Sharing Hub" },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection, // Use the dynamically built authenticator selection
        attestation: options.attestation,
        timeout: options.timeout
      },
    })) as PublicKeyCredential;

    if (!credential) throw new Error("No credential returned");

    const response = credential.response as AuthenticatorAttestationResponse;
    const pubkeyBuffer = response.getPublicKey();
    if (!pubkeyBuffer) throw new Error("No public key returned");
    
    const compressedKey = processPublicKey(pubkeyBuffer);
    const credentialId = Buffer.from(credential.rawId).toString("base64");
   
    // Derive Sui address from the same public key
    const suiAddress = deriveSuiAddress(compressedKey);

    displayStatus("Account created successfully!", "success");
    console.log('✅ Passkey created successfully:', {
      credentialId: credentialId.substring(0, 16) + '...',
      suiAddress,
      environment: isCustomTabs ? 'Custom Tabs' : 'Regular Browser',
      authenticatorAttachment: options.authenticatorAttachment,
      userVerification: options.userVerification
    });

    return { credentialId, publickey: compressedKey, status: "created", suiAddress };
    
  } catch (error) {
    return handleWebAuthnError(error, "Passkey creation", displayStatus);
  }
}

export async function authenticateWithPasskey(
  displayStatus: (message: string, type: string) => void,
  options?: {
    customErrorMessage?: string;
    successMessage?: string;
  }
): Promise<{ publickey: string; credentialId: string }> {
  try {
    const credentialId = localStorage.getItem(CREDENTIAL_STORAGE_KEYS.id);
    const publickey = localStorage.getItem(CREDENTIAL_STORAGE_KEYS.publicKey);

    if (!credentialId) {
      throw new Error(
        options?.customErrorMessage || 
        "No stored credentials found. Please create a passkey first."
      );
    }
    
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: DEFAULT_CHALLENGE,
        allowCredentials: [{
          type: "public-key",
          id: new Uint8Array(Buffer.from(credentialId, "base64"))
        }],
      },
    })) as PublicKeyCredential;
    
    const response = credential.response as AuthenticatorAssertionResponse;
    console.log(response)
    
    displayStatus(
      options?.successMessage || "Wallet connected successfully!", 
      "success"
    );
    
    // Return publickey even if empty (for signIn case)
    return { 
      publickey: publickey || '', 
      credentialId 
    };

  } catch (error) {
    return handleWebAuthnError(error, "Authentication", displayStatus);
  }
}

export async function signMessage(
  credentialId: string,
  message: string,
  displayStatus: (message: string, type: string) => void
): Promise<{
  normalized: string;
  msg: string;
  clientDataJSONReturn: string;
  authenticatorDataReturn: string;
}> {
  try {
    const challenge = Buffer.from(message, "base64");
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          type: "public-key",
          id: new Uint8Array(Buffer.from(credentialId, "base64"))
        }],
      },
    })) as PublicKeyCredential;

    if (!credential) throw new Error("No credential returned");

    const assertionResponse = credential.response as AuthenticatorAssertionResponse;
    const sig = secp256r1.Signature.fromDER(new Uint8Array(assertionResponse.signature));
    const authenticatorData = new Uint8Array(assertionResponse.authenticatorData);
    const clientDataJSON = new Uint8Array(assertionResponse.clientDataJSON);
    
    const authenticatorDataReturn = Buffer.from(authenticatorData).toString("base64");
    const clientDataJSONReturn = Buffer.from(clientDataJSON).toString("base64");
    const clientDataJSONDigest = sha256(clientDataJSON);
    const msg = Buffer.from(
      new Uint8Array([...authenticatorData, ...clientDataJSONDigest])
    ).toString("base64");
    
    const normalized = Buffer.from(
      sig.normalizeS().toCompactRawBytes()
    ).toString("base64");

    displayStatus("Message signed successfully", "success");
    return { normalized, msg, clientDataJSONReturn, authenticatorDataReturn };

  } catch (error) {
    return handleWebAuthnError(error, "Message signing", displayStatus);
  }
}

export async function signIn(
  displayStatus: (message: string, type: string) => void
): Promise<{ credentialId: string }> {
  try {
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: DEFAULT_CHALLENGE,
        userVerification: "required",
        timeout: DEFAULT_TIMEOUT
      }
    })) as PublicKeyCredential;

    if (!credential) throw new Error("No key returned");
    const credentialId = Buffer.from(credential.rawId).toString("base64");
    saveCredentialId(credentialId);
    return { credentialId };

  } catch (error) {
    return handleWebAuthnError(error, "Passkey creation", displayStatus);
  }
}

export async function signSuiTransaction(
  credentialId: string,
  txBytes: string,
  displayStatus: (message: string, type: string) => void
): Promise<{
  signature: string;
  authenticatorData: string;
  clientDataJSON: string;
}> {
  try {
    displayStatus("Signing Sui transaction...", "info");

    // Construct the challenge according to SIP-9:
    // challenge = intent (3 bytes) || blake2b_hash(intent || tx_data) (32 bytes) = 35 bytes total
    const txData = Buffer.from(txBytes, "base64");
    const intentBytes = new Uint8Array([0, 0, 0]); // Transaction intent: scope=0, version=0, app_id=0

    // Create intent message: intent || tx_data
    const intentMessage = new Uint8Array([...intentBytes, ...txData]);
    // Hash the complete intent message
    const intentMessageHash = blake2b(intentMessage, { dkLen: 32 }); // 32-byte blake2b hash

    // Final challenge: intent (3 bytes) + hash (32 bytes) = 35 bytes
    const challenge = new Uint8Array([...intentBytes, ...intentMessageHash]);

    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          type: "public-key",
          id: new Uint8Array(Buffer.from(credentialId, "base64"))
        }],
        userVerification: "required",
        timeout: DEFAULT_TIMEOUT
      },
    })) as PublicKeyCredential;

    if (!credential) throw new Error("No credential returned");

    const assertionResponse = credential.response as AuthenticatorAssertionResponse;
    const sig = secp256r1.Signature.fromDER(new Uint8Array(assertionResponse.signature));
    const authenticatorData = new Uint8Array(assertionResponse.authenticatorData);
    const clientDataJSON = new Uint8Array(assertionResponse.clientDataJSON);

    const authenticatorDataReturn = Buffer.from(authenticatorData).toString("base64");
    const clientDataJSONReturn = Buffer.from(clientDataJSON).toString("base64");

    // Normalize signature for Sui
    const normalized = Buffer.from(
      sig.normalizeS().toCompactRawBytes()
    ).toString("base64");

    displayStatus("Sui transaction signed successfully", "success");
    return {
      signature: normalized,
      authenticatorData: authenticatorDataReturn,
      clientDataJSON: clientDataJSONReturn
    };

  } catch (error) {
    return handleWebAuthnError(error, "Sui transaction signing", displayStatus);
  }
}