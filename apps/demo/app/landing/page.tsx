'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const toggleCode = (id: string) => {
    setExpandedCode(expandedCode === id ? null : id);
  };

  const theme = {
    bg: '#fafafa',
    bgSecondary: '#f5f5f5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    card: '#ffffff',
    cardHover: '#f8f8f8',
    primary: '#305669',
    primaryHover: '#244352',
    gradient: 'linear-gradient(135deg, #305669 0%, #4a6d7e 100%)',
    navBg: 'rgba(255, 255, 255, 0.98)',
    codeBg: '#f5f5f5',
  };

  const t = theme;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: t.bg,
      color: t.text,
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        backgroundColor: t.navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.border}`,
        zIndex: 50,
        transition: 'background-color 0.3s, border-color 0.3s'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: t.primary,
            letterSpacing: '-0.02em'
          }}>
            Zerolync SDK
          </div>
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <a href="#features" style={{
              color: t.textSecondary,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>Features</a>
            <a href="#quickstart" style={{
              color: t.textSecondary,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>Quick Start</a>
            <a href="#docs" style={{
              color: t.textSecondary,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>Docs</a>
            <Link
              href="/"
              style={{
                padding: '0.5rem 1.25rem',
                background: t.gradient,
                borderRadius: '0.75rem',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(48, 86, 105, 0.2)'
              }}
            >
              Live Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '7rem',
        paddingBottom: '4rem',
        padding: '7rem 1.5rem 4rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '48rem', margin: '0 auto' }}>
          {/* Animation Container */}
          <PasskeyAnimation />

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
            marginTop: '2rem'
          }}>
            One Passkey,{' '}
            <span style={{
              color: t.primary
            }}>
              Multiple Chains
            </span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: t.textSecondary,
            marginBottom: '2rem',
            lineHeight: '1.7',
            maxWidth: '42rem',
            margin: '0 auto 2rem'
          }}>
            A lightweight, cross-chain passkey SDK for Solana and Sui. Seamless authentication using WebAuthn with biometrics.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}>
            <a
              href="#quickstart"
              style={{
                padding: '0.875rem 2rem',
                background: t.gradient,
                borderRadius: '1rem',
                textDecoration: 'none',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 8px 24px rgba(48, 86, 105, 0.25)',
                display: 'inline-block'
              }}
            >
              Get Started
            </a>
            <a
              href="https://github.com"
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: 'transparent',
                border: `2px solid ${t.primary}`,
                borderRadius: '1rem',
                textDecoration: 'none',
                color: t.primary,
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = t.primary;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = t.primary;
              }}
            >
              GitHub →
            </a>
          </div>

          {/* Code Preview - Collapsible */}
          <div style={{
            backgroundColor: t.card,
            borderRadius: '1.5rem',
            border: `1px solid ${t.border}`,
            padding: '1.5rem',
            textAlign: 'left',
            maxWidth: '40rem',
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: expandedCode === 'hero' ? '1rem' : '0'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: t.textSecondary }}>Quick Example</span>
              <button
                onClick={() => toggleCode('hero')}
                style={{
                  padding: '0.5rem 1rem',
                  background: t.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {expandedCode === 'hero' ? 'Hide Code' : 'View Code'}
              </button>
            </div>
            {expandedCode === 'hero' && (
              <div style={{
                backgroundColor: t.codeBg,
                borderRadius: '0.75rem',
                padding: '1rem',
                marginTop: '1rem',
                transition: 'all 0.3s'
              }}>
                <pre style={{
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  color: t.text,
                  overflowX: 'auto',
                  margin: 0,
                  fontFamily: "'SF Mono', Monaco, monospace"
                }}>
                  <code>{`import { useSolanaPasskey } from '@zerolync/passkey-solana';
import { useSuiPasskey } from '@zerolync/passkey-sui';

function App() {
  const solana = useSolanaPasskey();
  const sui = useSuiPasskey();

  await solana.connect(); // Creates passkey
  await sui.connect();     // Reuses passkey
}`}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '4rem 1.5rem',
        backgroundColor: t.bgSecondary,
        transition: 'background-color 0.3s'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem',
            letterSpacing: '-0.02em'
          }}>Why Zerolync?</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <FeatureCard theme={t} icon="🔐" title="Passwordless" description="Use biometrics instead of seed phrases. No private keys to manage." accentColor={t.primary} />
            <FeatureCard theme={t} icon="🌐" title="Cross-Chain" description="Single passkey works across Solana and Sui blockchains." accentColor={t.primary} />
            <FeatureCard theme={t} icon="⚡" title="Portal-Based" description="Custom signing UI with full control over user experience." accentColor={t.primary} />
            <FeatureCard theme={t} icon="🎯" title="Developer-First" description="Simple React hooks. Drop-in replacement for wallet adapters." accentColor={t.primary} />
            <FeatureCard theme={t} icon="🔒" title="Secure" description="WebAuthn standard with hardware-backed security." accentColor={t.primary} />
            <FeatureCard theme={t} icon="📦" title="Lightweight" description="Minimal dependencies. Tree-shakeable. Optimized bundle." accentColor={t.primary} />
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="quickstart" style={{
        padding: '4rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>Quick Start</h2>
          <p style={{
            fontSize: '1.1rem',
            color: t.textSecondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>Get up and running in 3 simple steps</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <QuickStartCard
            number="1"
            title="Install Package"
            description="Add the SDK to your project using npm or pnpm"
            theme={t}
          />
          <QuickStartCard
            number="2"
            title="Setup Providers"
            description="Wrap your app with Solana and Sui providers"
            theme={t}
          />
          <QuickStartCard
            number="3"
            title="Use Hooks"
            description="Connect wallets with a single passkey authentication"
            theme={t}
          />
        </div>

        <div style={{
          backgroundColor: t.card,
          borderRadius: '1.5rem',
          border: `1px solid ${t.border}`,
          padding: '2.5rem',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => toggleCode('step1')}
              style={{
                padding: '0.75rem 1.5rem',
                background: expandedCode === 'step1' ? t.gradient : 'transparent',
                color: expandedCode === 'step1' ? 'white' : t.text,
                border: `2px solid ${expandedCode === 'step1' ? 'transparent' : t.border}`,
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              📦 Install
            </button>
            <button
              onClick={() => toggleCode('step2')}
              style={{
                padding: '0.75rem 1.5rem',
                background: expandedCode === 'step2' ? t.gradient : 'transparent',
                color: expandedCode === 'step2' ? 'white' : t.text,
                border: `2px solid ${expandedCode === 'step2' ? 'transparent' : t.border}`,
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              ⚙️ Setup
            </button>
            <button
              onClick={() => toggleCode('step3')}
              style={{
                padding: '0.75rem 1.5rem',
                background: expandedCode === 'step3' ? t.gradient : 'transparent',
                color: expandedCode === 'step3' ? 'white' : t.text,
                border: `2px solid ${expandedCode === 'step3' ? 'transparent' : t.border}`,
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🚀 Usage
            </button>
          </div>

          {expandedCode === 'step1' && (
            <CodeBlock theme={t} code={`npm install @zerolync/passkey-solana @zerolync/passkey-sui
# or
pnpm add @zerolync/passkey-solana @zerolync/passkey-sui`} />
          )}

          {expandedCode === 'step2' && (
            <CodeBlock theme={t} code={`import { SolanaPasskeyProvider } from '@zerolync/passkey-solana';
import { SuiPasskeyProvider } from '@zerolync/passkey-sui';

export default function App() {
  return (
    <SolanaPasskeyProvider rpcUrl="..." portalUrl="...">
      <SuiPasskeyProvider network="devnet" portalUrl="...">
        <YourApp />
      </SuiPasskeyProvider>
    </SolanaPasskeyProvider>
  );
}`} />
          )}

          {expandedCode === 'step3' && (
            <CodeBlock theme={t} code={`function Wallet() {
  const solana = useSolanaPasskey();
  const sui = useSuiPasskey();

  const connect = async () => {
    await solana.connect();  // Creates passkey
    await sui.connect();     // Reuses passkey
  };

  return <button onClick={connect}>Connect</button>;
}`} />
          )}

          {!expandedCode && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: t.textSecondary,
              fontSize: '0.95rem'
            }}>
              Select a tab above to view code examples
            </div>
          )}
        </div>
      </section>

      {/* Documentation Section */}
      <section id="docs" style={{
        padding: '4rem 1.5rem',
        backgroundColor: t.bgSecondary,
        transition: 'background-color 0.3s'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              letterSpacing: '-0.02em'
            }}>API Reference</h2>
            <p style={{
              fontSize: '1.1rem',
              color: t.textSecondary,
              maxWidth: '600px',
              margin: '0 auto'
            }}>Explore hooks for different blockchain networks</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '2rem'
          }}>
            {/* Solana Hook */}
            <div style={{
              backgroundColor: t.card,
              borderRadius: '1.5rem',
              border: `1px solid ${t.border}`,
              padding: '2.5rem',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.06)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 0 12px #14F195)'
                }}>◎</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '0.25rem'
                  }}>Solana</h3>
                  <code style={{
                    fontSize: '0.85rem',
                    color: t.textSecondary,
                    fontWeight: '600'
                  }}>useSolanaPasskey()</code>
                </div>
              </div>

              <p style={{
                color: t.textSecondary,
                lineHeight: '1.7',
                fontSize: '0.95rem',
                marginBottom: '1.5rem'
              }}>
                React hook for managing Solana wallets with passkey authentication. Includes methods for connecting, signing transactions, and sending SOL.
              </p>

              <button
                onClick={() => toggleCode(expandedCode === 'solana' ? '' : 'solana')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: expandedCode === 'solana' ? t.gradient : 'transparent',
                  color: expandedCode === 'solana' ? 'white' : t.primary,
                  border: `2px solid ${expandedCode === 'solana' ? 'transparent' : t.primary}`,
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s'
                }}
              >
                {expandedCode === 'solana' ? '✕ Hide Code' : '{ } View Code'}
              </button>

              {expandedCode === 'solana' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <CodeBlock theme={t} code={`const { address, isConnected, connect, signAndSendTransaction } = useSolanaPasskey();

// Transfer SOL
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const instruction = SystemProgram.transfer({
  fromPubkey: new PublicKey(address),
  toPubkey: new PublicKey(recipientAddress),
  lamports: 0.1 * LAMPORTS_PER_SOL,
});

await signAndSendTransaction(instruction);`} />
                </div>
              )}
            </div>

            {/* Sui Hook */}
            <div style={{
              backgroundColor: t.card,
              borderRadius: '1.5rem',
              border: `1px solid ${t.border}`,
              padding: '2.5rem',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.06)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 0 12px #6FBCF0)'
                }}>💧</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '0.25rem'
                  }}>Sui</h3>
                  <code style={{
                    fontSize: '0.85rem',
                    color: t.textSecondary,
                    fontWeight: '600'
                  }}>useSuiPasskey()</code>
                </div>
              </div>

              <p style={{
                color: t.textSecondary,
                lineHeight: '1.7',
                fontSize: '0.95rem',
                marginBottom: '1.5rem'
              }}>
                React hook for managing Sui wallets with passkey authentication. Includes methods for connecting, executing transactions, and transferring SUI.
              </p>

              <button
                onClick={() => toggleCode(expandedCode === 'sui' ? '' : 'sui')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: expandedCode === 'sui' ? t.gradient : 'transparent',
                  color: expandedCode === 'sui' ? 'white' : t.primary,
                  border: `2px solid ${expandedCode === 'sui' ? 'transparent' : t.primary}`,
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s'
                }}
              >
                {expandedCode === 'sui' ? '✕ Hide Code' : '{ } View Code'}
              </button>

              {expandedCode === 'sui' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <CodeBlock theme={t} code={`const { address, isConnected, connect, signAndExecuteTransaction } = useSuiPasskey();

// Transfer SUI
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [0.1 * 1e9]);
tx.transferObjects([coin], recipientAddress);

await signAndExecuteTransaction(tx);`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 1.5rem',
        borderTop: `1px solid ${t.border}`,
        transition: 'border-color 0.3s'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: t.textSecondary
        }}>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Built with ❤️ by Zerolync</p>
          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '1.5rem'
          }}>
            <a href="https://github.com" style={{ color: t.textSecondary, textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>GitHub</a>
            <a href="https://twitter.com" style={{ color: t.textSecondary, textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Twitter</a>
            <a href="https://discord.com" style={{ color: t.textSecondary, textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Discord</a>
            <a href="/docs" style={{ color: t.textSecondary, textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Docs</a>
          </div>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>© 2024 Zerolync. Open source under MIT License.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ theme, icon, title, description, accentColor }: any) {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: theme.card,
      borderRadius: '1.5rem',
      border: `1px solid ${theme.border}`,
      transition: 'all 0.3s',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = theme.cardHover;
      e.currentTarget.style.borderColor = accentColor;
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(48, 86, 105, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = theme.card;
      e.currentTarget.style.borderColor = theme.border;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '1rem',
        background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
        border: `2px solid ${accentColor}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.8rem',
        marginBottom: '1.25rem'
      }}>{icon}</div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', color: theme.text }}>{title}</h3>
      <p style={{ color: theme.textSecondary, lineHeight: '1.6', fontSize: '0.95rem' }}>{description}</p>
    </div>
  );
}

function QuickStartCard({ number, title, description, theme }: any) {
  return (
    <div style={{
      backgroundColor: theme.card,
      borderRadius: '1.5rem',
      border: `1px solid ${theme.border}`,
      padding: '2rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(48, 86, 105, 0.1)';
      e.currentTarget.style.borderColor = theme.primary;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
      e.currentTarget.style.borderColor = theme.border;
    }}>
      {/* Background Number */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-10px',
        fontSize: '8rem',
        fontWeight: '900',
        color: theme.bgSecondary,
        opacity: 0.5,
        lineHeight: 1,
        userSelect: 'none'
      }}>
        {number}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '0.75rem',
          background: theme.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '1.25rem',
          color: 'white',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(48, 86, 105, 0.2)'
        }}>
          {number}
        </div>

        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: '700',
          marginBottom: '0.75rem',
          color: theme.text
        }}>
          {title}
        </h3>

        <p style={{
          color: theme.textSecondary,
          lineHeight: '1.6',
          fontSize: '0.95rem'
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function CodeBlock({ theme, code }: any) {
  return (
    <div style={{
      backgroundColor: theme.codeBg,
      borderRadius: '1rem',
      border: `1px solid ${theme.border}`,
      padding: '1.25rem',
      overflowX: 'auto',
      transition: 'background-color 0.3s, border-color 0.3s'
    }}>
      <pre style={{
        fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
        color: theme.text,
        margin: 0,
        fontFamily: "'SF Mono', Monaco, monospace",
        lineHeight: '1.6'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function PasskeyAnimation() {
  const [activeWallet, setActiveWallet] = useState(0);
  const [activeAuth, setActiveAuth] = useState(0);

  useEffect(() => {
    const walletInterval = setInterval(() => {
      setActiveWallet((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(walletInterval);
  }, []);

  useEffect(() => {
    const authInterval = setInterval(() => {
      setActiveAuth((prev) => (prev + 1) % 3);
    }, 1800);
    return () => clearInterval(authInterval);
  }, []);

  const wallets = [
    { name: 'Solana', icon: '◎', color: '#14F195' },
    { name: 'Sui', icon: '💧', color: '#6FBCF0' },
    { name: 'Ethereum', icon: '⟠', color: '#627EEA' }
  ];

  const authMethods = [
    { icon: '👆', label: 'Fingerprint', color: '#305669' },
    { icon: '👤', label: 'Face ID', color: '#4a6d7e' },
    { icon: '🔑', label: 'Passkey', color: '#5a7d8e' }
  ];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '800px',
      height: '280px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: '3rem',
      padding: '2rem',
      paddingTop: '3rem'
    }}>
      {/* Left: Passkey Auth */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #305669 0%, #4a6d7e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(48, 86, 105, 0.3)',
          animation: 'pulse 2s ease-in-out infinite',
          position: 'relative'
        }}>
          {authMethods.map((auth, index) => (
            <div
              key={auth.label}
              style={{
                position: 'absolute',
                fontSize: '3.5rem',
                opacity: activeAuth === index ? 1 : 0,
                transform: activeAuth === index ? 'scale(1)' : 'scale(0.8)',
                transition: 'all 0.5s ease-in-out'
              }}
            >
              {auth.icon}
            </div>
          ))}
        </div>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#305669',
          textAlign: 'center',
          height: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#666',
            marginBottom: '0.25rem',
            transition: 'opacity 0.3s'
          }}>
            {authMethods[activeAuth].label}
          </div>
          <div>One Passkey</div>
        </div>
      </div>

      {/* Middle: Animated Flow */}
      <div style={{
        flex: 1,
        position: 'relative',
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '200px',
        alignSelf: 'flex-start'
      }}>
        {/* Static base line */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '60px',
          height: '2px',
          background: 'repeating-linear-gradient(90deg, #305669 0px, #305669 10px, transparent 10px, transparent 20px)',
          opacity: 0.3
        }} />

        {/* Animated particle/beam */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '60px',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, #305669, transparent)',
          animation: 'flow 2.5s ease-in-out infinite',
          opacity: 0.6
        }} />
      </div>

      {/* Right: Wallet Stack */}
      <div style={{
        flex: '0 0 auto',
        position: 'relative',
        width: '140px',
        height: '180px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}>
        {wallets.map((wallet, index) => (
          <div
            key={wallet.name}
            style={{
              position: 'absolute',
              left: '50%',
              top: `${index * 50}px`,
              transform: `translateX(-50%) scale(${activeWallet === index ? 1.1 : 0.95})`,
              transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              opacity: activeWallet === index ? 1 : 0.5,
              zIndex: activeWallet === index ? 10 : 5 - index,
              filter: activeWallet === index ? `drop-shadow(0 4px 16px ${wallet.color})` : 'none'
            }}
          >
            <div style={{
              padding: '1rem 1.5rem',
              background: 'white',
              borderRadius: '1rem',
              border: `2px solid ${activeWallet === index ? wallet.color : '#e0e0e0'}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              minWidth: '140px',
              transition: 'all 0.3s'
            }}>
              <div style={{
                fontSize: '1.8rem',
                filter: `drop-shadow(0 0 8px ${wallet.color})`
              }}>{wallet.icon}</div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#305669'
              }}>{wallet.name}</div>
            </div>
          </div>
        ))}

        {/* Label */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#305669',
          whiteSpace: 'nowrap'
        }}>
          Multiple Chains
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          @keyframes flow {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `
      }} />
    </div>
  );
}

function WalletCard({ name, icon, color }: { name: string; icon: string; color: string }) {
  return (
    <div style={{
      padding: '1rem 1.5rem',
      background: 'white',
      borderRadius: '1rem',
      border: '2px solid #e0e0e0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      minWidth: '100px'
    }}>
      <div style={{
        fontSize: '2rem',
        filter: `drop-shadow(0 0 8px ${color})`
      }}>{icon}</div>
      <div style={{
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#305669'
      }}>{name}</div>
    </div>
  );
}
