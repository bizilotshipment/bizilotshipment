'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, X } from 'lucide-react';

interface OTPBannerProps {
  otp: string | null;
  onDismiss?: () => void;
}

export function OTPBanner({ otp, onDismiss }: OTPBannerProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (otp) {
      setVisible(true);
      setCopied(false);
    }
  }, [otp]);

  if (!otp || !visible) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="otp-banner-glow rounded-2xl bg-amber-950/90 border border-amber-500/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
                <span className="text-amber-400 text-sm">🔑</span>
              </div>
              <div>
                <p className="text-xs font-medium text-amber-300/80">
                  DEV MODE — Your OTP
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-amber-100 tracking-[0.3em] font-mono">
                    {otp}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-amber-500/20 transition-colors"
                    aria-label="Copy OTP"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-amber-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-amber-500/20 transition-colors"
              aria-label="Dismiss OTP banner"
            >
              <X className="w-4 h-4 text-amber-300/60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
