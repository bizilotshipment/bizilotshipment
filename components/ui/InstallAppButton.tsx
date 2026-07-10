'use client'

import { useState } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

/* ------------------------------------------------------------------ */
/* iOS Instructions Bottom Sheet                                        */
/* ------------------------------------------------------------------ */
function IOSSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#ffffff',
          borderRadius: '20px 20px 0 0',
          padding: '2rem 1.5rem 2.5rem',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: 36,
            height: 4,
            background: '#e2e8f0',
            borderRadius: 2,
            margin: '0 auto 1.5rem',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <img
            src="/icon-192.png"
            alt="Bizilot"
            style={{ width: 44, height: 44, borderRadius: '50%' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
              Install Bizilot
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Add to your Home Screen
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { step: '1', icon: '⎙', label: 'Tap the', highlight: 'Share button', note: 'at the bottom of Safari' },
            { step: '2', icon: '➕', label: 'Select', highlight: 'Add to Home Screen', note: 'from the menu' },
            { step: '3', icon: '✓', label: 'Tap', highlight: 'Add', note: 'to install Bizilot' },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '0.875rem 1rem',
                background: '#f8fafc',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                {item.step}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                {item.label}{' '}
                <strong style={{ color: '#0f172a' }}>{item.highlight}</strong>{' '}
                <span style={{ color: '#64748b' }}>{item.note}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Install App Button                                                   */
/* ------------------------------------------------------------------ */
interface InstallAppButtonProps {
  variant?: 'card' | 'button'
  onDismiss?: () => void
}

export function InstallAppButton({ variant = 'button', onDismiss }: InstallAppButtonProps) {
  const { canInstall, isInstalled, platform, install } = usePWAInstall()
  const [showIOSSheet, setShowIOSSheet] = useState(false)

  // Already installed or cannot install — hide the button
  if (isInstalled || (!canInstall && platform !== 'ios')) {
    return null;
  }

  const handleInstall = async () => {
    if (platform === 'ios') {
      setShowIOSSheet(true)
    } else {
      await install()
    }
  }

  if (variant === 'card') {
    return (
      <>
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: 16,
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontSize: '2rem', flexShrink: 0 }}>📱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.95rem', marginBottom: 2 }}>
              Install Bizilot
            </div>
            <div style={{ color: '#3b82f6', fontSize: '0.82rem' }}>
              Faster access, offline support &amp; full-screen experience
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleInstall}
              style={{
                padding: '0.5rem 1rem',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Install
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                }}
                aria-label="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {showIOSSheet && <IOSSheet onClose={() => setShowIOSSheet(false)} />}
      </>
    )
  }

  return (
    <>
      <button
        onClick={handleInstall}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '0.5rem 1.25rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1.5px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          borderRadius: 20,
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ marginRight: '2px', verticalAlign: 'middle' }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Install App
      </button>
      {showIOSSheet && <IOSSheet onClose={() => setShowIOSSheet(false)} />}
    </>
  )
}
