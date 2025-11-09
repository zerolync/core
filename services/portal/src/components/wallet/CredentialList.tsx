import { Shield, Check } from "lucide-react";
import { Badge } from "../ui/badge";

interface Credential {
  credentialId: string;
  publicKey: string;
}

interface CredentialListProps {
  credentials: Credential[];
  selectedCredentialId?: string;
  onSelect?: (credentialId: string) => void;
}

export function CredentialList({ credentials, selectedCredentialId, onSelect }: CredentialListProps) {
  if (credentials.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No passkeys found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">
        Your Passkeys
        {credentials.length > 1 && onSelect && (
          <span className="text-xs text-muted-foreground ml-2">(Select one to use)</span>
        )}
      </h4>
      <div className="space-y-2">
        {credentials.map((cred, index) => {
          const isSelected = selectedCredentialId === cred.credentialId;
          const isClickable = credentials.length > 1 && onSelect;

          return (
            <div
              key={cred.credentialId}
              onClick={() => isClickable && onSelect(cred.credentialId)}
              className={`flex items-center gap-2 p-3 border rounded transition-colors ${
                isClickable ? 'cursor-pointer hover:bg-accent' : ''
              } ${isSelected ? 'border-primary bg-accent' : ''}`}
            >
              <Shield className="h-4 w-4" />
              <div className="flex-1">
                <span className="text-sm font-mono block">
                  {cred.credentialId.slice(0, 16)}...
                </span>
                <span className="text-xs text-muted-foreground">
                  Passkey #{index + 1}
                </span>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-primary" />
              )}
              {!isSelected && credentials.length === 1 && (
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
