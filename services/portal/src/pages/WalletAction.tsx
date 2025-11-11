"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Credential, getStoredCredentials, saveCredential } from "../utils/storage"
import { authenticateWithPasskey, signMessage, signIn, signUp, signSuiTransaction } from "../utils/webauthn"
import { deriveSuiAddress } from "../utils/sui"
import { detectPlatform, applyPlatformOptimizations, PlatformInfo } from "../utils/platform-detector"
import { quickPlatformTest } from "../utils/platform-tester"
import { useRedirect } from '../hooks/useRedirect'
import { useWindowManager } from '../hooks/useWindowManager'
import { 
  StatusAlert, 
  PlatformWarnings, 
  CredentialList, 
  ActionButtons, 
  LoadingState 
} from "../components/wallet"
import { StatusMessage } from "../types/wallet"
import { isIframe, requestCredentialsFromParent, setupCredentialSyncHandler } from "../utils/credentialSync"

// Using StatusMessage from types/wallet instead of local Status interface

export default function WalletAction() {
  const [status, setStatus] = useState<StatusMessage>({ message: '', type: 'info' })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null)
  const [action, setAction] = useState("")
  const [, setExpo] = useState("")
  const [isSigning, setIsSigning] = useState(false)
  const [, setReadyToSign] = useState(false)
  const [, setEnvironment] = useState<"browser" | "expo" | "unknown">("unknown")
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null)
  const { /* handleRedirect, getAutoCloseDelay */ } = useRedirect()
  const { /* autoClose */ } = useWindowManager()

  // Initialize platform detection and optimizations
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        console.log('🔄 Initializing platform detection...')
        
        // Detect and optimize for current platform
        const platform = detectPlatform()
        setPlatformInfo(platform)
        
        // Apply platform-specific optimizations
        applyPlatformOptimizations(platform)
        
        console.log(`✅ Platform initialized: ${platform.type} (${platform.browser})`)
        console.log('🎯 Applied optimizations:', platform.optimizations)
        
        // Run quick platform test in background for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
          quickPlatformTest().catch(console.error)
        }
        
      } catch (error) {
        console.error('❌ Platform initialization failed:', error)
      }
    }
    
    initializePlatform()
  }, [])

  // Legacy environment detection for backward compatibility
  const detectEnvironment = (): "browser" | "expo" | "unknown" => {
    if (typeof window !== "undefined") {
      if (window.navigator.userAgent.includes("Expo")) {
        return "expo"
      }
      if (window.ReactNativeWebView) {
        return "expo"
      }
      if (window.expo || window.__expo) {
        return "expo"
      }
      
      // Additional checks for Expo
      if (window.location.protocol === "file:" || 
          window.navigator.userAgent.includes("expo") ||
          window.navigator.userAgent.includes("ExponentJS")) {
        return "expo"
      }
      
      return "browser"
    }
    
    return "unknown"
  }
  // Load stored credentials on mount - NO iframe sync to localStorage
  const loadCredentials = useCallback(async () => {
    try {
      // Only load from local storage, no cross-context sync
      const storedCreds = await getStoredCredentials()
      setCredentials(storedCreds)
      // Auto-select the first credential if none is selected
      if (storedCreds.length > 0 && !selectedCredentialId) {
        setSelectedCredentialId(storedCreds[0].credentialId)
      }
    } catch (error) {
      console.error('Error loading credentials:', error)
      setCredentials([])
    }
  }, [selectedCredentialId])

  // Set up credential sync handler for parent window
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Only set up the handler in the parent window
    if (!isIframe()) {
      return setupCredentialSyncHandler(() => credentials)
    }
  }, [credentials])
  
  // Initial credential load
  useEffect(() => {
    loadCredentials()
  }, [loadCredentials])

  // Handle URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const messageParam = urlParams.get('message') || ''
    const autoConnect = urlParams.get('auto_connect')
    const autoSign = urlParams.get('auto_sign')
    const actionParam = urlParams.get('action') || ''
    const expoParam = urlParams.get('expo') || ''
    const suiTx = urlParams.get('sui_tx')
    const stored = getStoredCredentials()

    // Set state from URL params
    setMessage(messageParam)
    setAction(actionParam)
    setExpo(expoParam)
    
    // Detect environment if not explicitly set
    const detectedEnv = detectEnvironment()
    setEnvironment(detectedEnv)

    // Handle actions based on URL parameters
    const handleAction = async () => {
      try {
        if (actionParam === 'connect' || autoConnect === 'true') {
          setCredentials(stored)
          if (stored.length > 0) {
            displayStatus(`Connecting with existing Passkey...`, 'loading')
            await handleUniversalConnect(detectedEnv, expoParam || undefined)
          } else {
            displayStatus('No Passkey found. Please create one.', 'info')
          }
        } else if ((actionParam === 'sign' || autoSign === 'true') && messageParam) {
          // For sign action: Different handling for iframe vs standalone
          if (isIframe()) {
            // Iframe: request credentials from parent and show UI list
            displayStatus('Connecting to parent window...', 'loading')
            try {
              const parentCredential = await requestCredentialsFromParent(3, (message, attempt) => {
                if (attempt) {
                  displayStatus(`${message} (Attempt ${attempt}/3)`, 'loading')
                } else {
                  displayStatus(message, 'loading')
                }
              })
              if (parentCredential) {
                setCredentials([parentCredential])
                setReadyToSign(true)
                displayStatus('Ready to sign. Click approve.', 'info')
              } else {
                handleError('Unable to get credentials from parent window', undefined, true)
              }
            } catch (error) {
              handleError('Failed to sync credentials from parent', error, true)
            }
          } else {
            // Standalone/popup: use stored credentials immediately
            setCredentials(stored)
            if (stored.length > 0) {
              setReadyToSign(true)
              displayStatus('Ready to sign. Click approve.', 'info')
            } else {
              handleError('No stored credentials found for signing', undefined, true)
            }
          }
        } else if (suiTx && actionParam === 'sign_sui') {
          // Handle Sui transaction signing
          setCredentials(stored)
          if (stored.length > 0) {
            displayStatus('Ready to sign Sui transaction', 'info')
            setReadyToSign(true)
          } else {
            displayStatus('No Passkey found. Please create one.', 'info')
          }
        } else if (actionParam === 'create_sui') {
          // Handle Sui passkey creation - show UI, don't auto-trigger
          displayStatus('Ready to create Sui passkey', 'info')
          // Set a flag to show the create button
          setAction('create_sui')
        } else {
          displayStatus('Error: Invalid action or missing message', 'error')
        }
      } catch (error) {
        console.error('Error handling action:', error)
        handleError('Failed to process action', error, false)
      }
    }
    
    handleAction()
  }, [])

  // Create a displayStatus function to pass to WebAuthn functions
  const displayStatus = (message: string, type: string) => {
    setStatus({ 
      message, 
      type: type === 'loading' ? 'info' : type as StatusMessage['type']
    })
  }

  // Handle success response
  const handleSuccess = async (responseData: any, successMessage: string) => {
    try {
      if (responseData?.credential) {
        await saveCredential(responseData.credentialId, responseData.publicKey)
        const updatedCreds = await getStoredCredentials()
        setCredentials(updatedCreds)
      }
      
      setStatus({ message: successMessage, type: 'success' })

      // const redirectUrl = handleRedirect({
      //   success: true,
      //   isSignature: responseData.type === 'SIGNATURE_CREATED' || responseData.type === 'sui-sign-result',
      //   responseData,
      //   messageType: responseData.type === 'SIGNATURE_CREATED' ? 'SIGNATURE_CREATED' : responseData.type === 'sui-sign-result' ? 'sui-sign-result' : responseData.type === 'sui-create-result' ? 'sui-create-result' : 'WALLET_CONNECTED'
      // })

      // Send data to parent/opener
      let messageData: any;

      // For Sui operations, send the data directly without wrapping
      if (responseData.type === 'sui-sign-result' || responseData.type === 'sui-create-result') {
        messageData = responseData;
      } else {
        messageData = {
          type: responseData.type === 'SIGNATURE_CREATED' ? 'SIGNATURE_CREATED' : 'WALLET_CONNECTED',
          data: responseData.type === 'SIGNATURE_CREATED' ? responseData.data : responseData
        }
      }

      // In iframe, send message to parent
      if (isIframe()) {
        window.parent.postMessage(messageData, '*')
        return
      }

      // In Expo WebView
      if (responseData.environment === 'expo' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(messageData))
        return
      }

      // In popup window
      if (window.opener && window.opener !== window) {
        window.opener.postMessage(messageData, '*')
      }

      // Handle redirect or auto-close
      // TEMPORARILY DISABLED FOR DEBUGGING - Window will NOT auto-close
      console.log('🔍 [DEBUG] Auto-close disabled. Window will stay open for log inspection.');
      console.log('🔍 [DEBUG] Response data:', responseData);

      // Uncomment below to re-enable auto-close
      // const delay = responseData.type === 'sui-sign-result' ? 10000 : getAutoCloseDelay();
      // if (redirectUrl) {
      //   setTimeout(() => {
      //     window.location.href = redirectUrl
      //   }, Math.min(delay, 3000))
      // } else {
      //   autoClose(responseData.environment || 'browser', delay)
      // }
      
    } catch (error) {
      console.error('Success handler error:', error)
      setStatus({ message: 'Error saving credentials', type: 'error' })
    }
  }

  // Handle error response
  const handleError = (errorMessage: string, error?: any, isSignatureError = false) => {
    console.error('Operation failed:', error)
    setStatus({ message: errorMessage, type: 'error' })

    const errorResponse = {
      type: 'error',
      error: errorMessage,
      details: error?.message || ''
    }

    // In iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(errorResponse, '*')
      return
    }

    // In Expo WebView
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(errorResponse))
      return
    }

    // In popup window
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(errorResponse, '*')
      if (isSignatureError) {
        // TEMPORARILY DISABLED FOR DEBUGGING - Keep window open
        // autoClose('browser', getAutoCloseDelay())
        console.log('🔍 [DEBUG] Auto-close disabled in error handler. Window will stay open for log inspection.');
      }
    }
  }

  // Handle universal connect action - just prepares the environment for authentication
  const handleUniversalConnect = async (environment: string = 'browser', expoParam?: string) => {
    // Just set the environment parameters and prepare UI
    setCurrentEnvironment(environment)
    setCurrentExpoParam(expoParam || null)
    
    const credentialId = localStorage.getItem("CREDENTIAL_ID")
    
    if (!credentialId) {
      // If no credential ID exists, show appropriate message for sign in/sign up
      setStatus({ 
        message: 'No passkey found. Please sign in with an existing passkey or create a new one.', 
        type: 'info' 
      })
    } else {
      // If credential exists, show message prompting user to click Sign In
      setStatus({ 
        message: 'Passkey found. Please click Sign In to connect.', 
        type: 'info' 
      })
    }
  }

  // Handle sign message action - Use already loaded credentials
  const handleSign = async () => {
    if (!message) return

    setIsLoading(true)
    setIsSigning(true)
    try {
      // Use already loaded credentials (both iframe and standalone)
      if (credentials.length === 0) {
        throw new Error('No credentials available for signing')
      }

      // Use selected credential or fall back to first one
      const credentialId = selectedCredentialId || credentials[0].credentialId

      displayStatus('Signing message...', 'info')
      const signatureData = await signMessage(credentialId, message, displayStatus)

      const responseData = {
        data: signatureData,
        credentialId: credentialId,
        originalMessage: message,
        timestamp: new Date().toISOString(),
        type: 'SIGNATURE_CREATED'
      }

      await handleSuccess(responseData, 'Message signed successfully!')
    } catch (error: any) {
      handleError('Failed to sign message', error, true)
    } finally {
      setIsLoading(false)
      setIsSigning(false)
    }
  }

  const handleSignSui = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const txBytes = urlParams.get('sui_tx')
    const requestedCredentialId = urlParams.get('credential_id')

    if (!txBytes) {
      handleError('No Sui transaction data provided', new Error('Missing sui_tx parameter'), true)
      return
    }

    setIsLoading(true)
    setIsSigning(true)
    try {
      if (credentials.length === 0) {
        throw new Error('No credentials available for signing')
      }

      // Use credential from URL, or selected credential, or fall back to first one
      const credentialId = requestedCredentialId || selectedCredentialId || credentials[0].credentialId
      console.log('🔑 [Portal] Signing with credential:', credentialId)
      console.log('🔑 [Portal] Requested credential ID:', requestedCredentialId)
      console.log('🔑 [Portal] Available credentials:', credentials.map(c => c.credentialId))
      console.log('🔑 [Portal] Selected credential ID:', selectedCredentialId)

      const signResult = await signSuiTransaction(credentialId, txBytes, displayStatus)

      const responseData = {
        type: 'sui-sign-result',
        signature: signResult.signature,
        authenticatorData: signResult.authenticatorData,
        clientDataJSON: signResult.clientDataJSON,
        timestamp: new Date().toISOString()
      }

      await handleSuccess(responseData, 'Sui transaction signed successfully!')
    } catch (error: any) {
      handleError('Failed to sign Sui transaction', error, true)
    } finally {
      setIsLoading(false)
      setIsSigning(false)
    }
  }

  // This was previously handleCreatePasskey, now handled directly by handleSignUp

  const isCustomTabsOpen = () => {
    return platformInfo?.type === 'android' && platformInfo.browser === 'chrome'
  }

  const checkWebAuthnSupport = () => {
    return typeof window !== 'undefined' && !!(window.PublicKeyCredential)
  }

  // Loading state will be handled in the main return statement

  // Function to handle sign in option
  const handleSignIn = async (environment: string = 'browser', expoParam?: string) => {
    try {
      setIsLoading(true)
      setStatus({ message: 'Signing in with passkey...', type: 'info' })
      
      const signInData = await signIn(displayStatus)
      
      // signIn function already saves credential, just refresh UI
      const updatedCreds = await getStoredCredentials()
      setCredentials(updatedCreds)
      
      // Create response data and proceed to success
      const responseData = {
        credentialId: signInData.credentialId,
        expo: expoParam || null,
        timestamp: new Date().toISOString(),
        connectionType: 'universal',
        environment,
        platform: environment === 'expo' ? 'mobile' : 'web'
      }

      await handleSuccess(responseData, `Signed in successfully via ${environment}!`)
    } catch (err) {
      handleError('Failed to sign in', err, false)
      setIsLoading(false)
    }
  }
  
  // Function to handle sign up option
  const handleSignUp = async (environment: string = 'browser', expoParam?: string, isSuiOnly: boolean = false) => {
    try {
      setIsLoading(true)
      setStatus({ message: 'Creating new passkey...', type: 'info' })

      const signUpData = await signUp(displayStatus)

      // Save credential ID and public key to local storage
      await saveCredential(signUpData.credentialId, signUpData.publickey)
      const updatedCreds = await getStoredCredentials()
      setCredentials(updatedCreds)

      const responseData = {
        type: isSuiOnly ? 'sui-create-result' : undefined,
        data: isSuiOnly ? {
          suiAddress: signUpData.suiAddress,
          credentialId: signUpData.credentialId,
          publicKey: signUpData.publickey
        } : undefined,
        credentialId: signUpData.credentialId,
        publickey: signUpData.publickey,
        suiAddress: signUpData.suiAddress, // Include Sui address
        expo: expoParam || null,
        timestamp: new Date().toISOString(),
        connectionType: 'universal',
        environment,
        platform: environment === 'expo' ? 'mobile' : 'web',
        status: signUpData.status
      }

      await handleSuccess(responseData, `New account created successfully!`)
    } catch (err) {
      handleError('Failed to create new account', err, false)
      setIsLoading(false)
    }
  }
  
  // Function to authenticate with existing passkey
  const handleAuthenticate = async (environment: string = 'browser', expoParam?: string) => {
    try {
      setIsLoading(true)
      setStatus({ message: 'Authenticating with passkey...', type: 'info' })

      // Use authenticateWithPasskey for existing credentials
      const authData = await authenticateWithPasskey(displayStatus)

      // Derive Sui address from stored public key
      let suiAddress;
      if (authData.publickey) {
        try {
          suiAddress = deriveSuiAddress(authData.publickey);
        } catch (error) {
          console.error('Failed to derive Sui address:', error);
        }
      }

      const responseData = {
        ...authData,
        suiAddress, // Include Sui address
        expo: expoParam || null,
        timestamp: new Date().toISOString(),
        connectionType: 'universal',
        environment,
        platform: environment === 'expo' ? 'mobile' : 'web'
      }

      await handleSuccess(responseData, `Connected successfully via ${environment}!`)
    } catch (err) {
      handleError(`Failed to authenticate`, err, false)
      setIsLoading(false)
    }
  }
  
  // Store environment and expoParam for Sign In/Sign Up handlers
  const [currentEnvironment, setCurrentEnvironment] = useState('browser')
  const [currentExpoParam, setCurrentExpoParam] = useState<string | null>(null)

  // Render credential management UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {isLoading ? (
        <LoadingState message={status.message || "Processing..."} />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Passkey Sharing Hub</span>
              {credentials.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {credentials.length} Passkey{credentials.length !== 1 ? 's' : ''}
                </span>
              )}
            </CardTitle>
            <CardDescription>
             Manage your passkeys on this device
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <StatusAlert status={status} />
            
            <PlatformWarnings 
              isCustomTabs={isCustomTabsOpen()} 
              webAuthnSupport={{
                supported: checkWebAuthnSupport(),
                reason: "Your browser does not support WebAuthn. Please use a modern browser that supports passkeys."
              }}
              platformInfo={platformInfo}
            />

            <CredentialList
              credentials={credentials}
              selectedCredentialId={selectedCredentialId || undefined}
              onSelect={(credId) => setSelectedCredentialId(credId)}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <ActionButtons
              hasCredentials={credentials.length > 0}
              isLoading={isLoading}
              hasMessage={!!message}
              hasSuiTx={!!new URLSearchParams(window.location.search).get('sui_tx')}
              isSigning={isSigning}
              isCreateSui={action === 'create_sui'}
              onSign={(() => {
                const urlParams = new URLSearchParams(window.location.search)
                const suiTx = urlParams.get('sui_tx')
                return suiTx ? handleSignSui : handleSign
              })()}
              onSignIn={() => {
                // Check if we have a stored public key
                const storedPublicKey = localStorage.getItem("PUBLIC_KEY");
                if (credentials.length > 0 && storedPublicKey) {
                  // If we have both credential and public key, authenticate
                  handleAuthenticate(currentEnvironment, currentExpoParam || undefined);
                } else if (credentials.length > 0 && !storedPublicKey) {
                  // If we have credential but no public key, create new passkey
                  console.warn('No public key stored. Creating new passkey...');
                  handleSignUp(currentEnvironment, currentExpoParam || undefined);
                } else {
                  // No credentials at all, use sign in flow
                  handleSignIn(currentEnvironment, currentExpoParam || undefined);
                }
              }}
              onSignUp={() => handleSignUp(currentEnvironment, currentExpoParam || undefined)}
              onCreateSui={() => handleSignUp(currentEnvironment, currentExpoParam || undefined, true)}
            />
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
