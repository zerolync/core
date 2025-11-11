"use client"

import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"

interface ActionButtonsProps {
  hasCredentials: boolean
  isLoading: boolean
  hasMessage: boolean
  hasSuiTx?: boolean
  isSigning: boolean
  isCreateSui?: boolean
  onSign: () => void
  onSignIn: () => void
  onSignUp: () => void
  onCreateSui?: () => void
}

export function ActionButtons({
  hasCredentials,
  isLoading,
  hasMessage,
  hasSuiTx,
  isSigning,
  isCreateSui,
  onSign,
  onSignIn,
  onSignUp,
  onCreateSui,
}: ActionButtonsProps) {
  const LoadingIcon = () =>
    isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null

  // Show create sui passkey button
  if (isCreateSui && onCreateSui) {
    return (
      <div className="w-full">
        <Button
          onClick={onCreateSui}
          disabled={isLoading}
          className="w-full"
          variant="default"
        >
          <LoadingIcon />
          {isLoading ? 'Creating Passkey...' : 'Create Sui Passkey'}
        </Button>
      </div>
    )
  }

  // Show signing button when there's a message to sign OR a Sui transaction
  if (hasMessage || hasSuiTx) {
    return (
      <div className="w-full">
        <Button
          onClick={onSign}
          disabled={isLoading || !hasCredentials}
          className="w-full"
          variant="default"
        >
          <LoadingIcon />
          {isSigning ? 'Signing...' : (hasSuiTx ? 'Sign Transaction' : 'Sign Message')}
        </Button>
      </div>
    )
  }

  // Standard authentication flow
  return (
    <div className="flex gap-2 w-full">
      <Button
        onClick={onSignIn}
        disabled={isLoading}
        variant="outline"
        className="flex-1"
      >
        <LoadingIcon />
        Sign In
      </Button>
      
      <Button
        onClick={onSignUp}
        disabled={isLoading}
        variant="default"
        className="flex-1"
      >
        <LoadingIcon />
        Sign Up
      </Button>
    </div>
  )
}
