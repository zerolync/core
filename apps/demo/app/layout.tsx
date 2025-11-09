import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zerolync Passkey SDK',
  description: 'Cross-chain passkey wallet SDK for Solana and Sui',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
