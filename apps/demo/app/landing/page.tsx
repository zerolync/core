'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  const theme = isDark ? {
    bg: '#000000',
    bgSecondary: '#0a0a0a',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#1a1a1a',
    card: '#0a0a0a',
    cardHover: '#111111',
    primary: '#ffffff',
    primaryHover: '#e0e0e0',
    gradient: '#ffffff',
    navBg: 'rgba(0, 0, 0, 0.98)',
    codeBg: '#0a0a0a',
  } : {
    bg: '#ffffff',
    bgSecondary: '#fafafa',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e0e0e0',
    card: '#ffffff',
    cardHover: '#f8f8f8',
    primary: '#000000',
    primaryHover: '#1a1a1a',
    gradient: '#000000',
    navBg: 'rgba(255, 255, 255, 0.98)',
    codeBg: '#fafafa',
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
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
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
                backgroundColor: t.primary,
                borderRadius: '1rem',
                textDecoration: 'none',
                color: isDark ? '#000' : '#fff',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'transform 0.2s, opacity 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
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
                e.currentTarget.style.color = isDark ? '#000' : '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = t.primary;
              }}
            >
              GitHub →
            </a>
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
          gap: '2rem'
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
            }}>Supported Chains</h2>
            <p style={{
              fontSize: '1.1rem',
              color: t.textSecondary,
              maxWidth: '600px',
              margin: '0 auto'
            }}>Build on multiple blockchains with a single passkey</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Solana */}
            <div style={{
              backgroundColor: t.card,
              borderRadius: '1.5rem',
              border: `1px solid ${t.border}`,
              padding: '2.5rem',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = t.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = t.border;
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                filter: isDark ? 'brightness(1.2)' : 'none'
              }}>
                <Image
                  src="/assets/solana.svg"
                  alt="Solana"
                  width={120}
                  height={120}
                  style={{ width: '120px', height: 'auto' }}
                />
              </div>
            </div>

            {/* Sui */}
            <div style={{
              backgroundColor: t.card,
              borderRadius: '1.5rem',
              border: `1px solid ${t.border}`,
              padding: '2.5rem',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = t.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = t.border;
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                filter: isDark ? 'brightness(1.2)' : 'none'
              }}>
                <Image
                  src="/assets/sui.png"
                  alt="Sui"
                  width={120}
                  height={120}
                  style={{ width: '120px', height: 'auto' }}
                />
              </div>
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

