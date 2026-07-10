'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';
import { OTPBanner } from '@/components/ui/OTPBanner';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

type Step = 'mobile' | 'otp';

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [devOTP, setDevOTP] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, role: 'driver' }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setDevOTP(data._dev_otp);
      setStep('otp');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, role: 'driver' }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      router.push('/dashboard/driver');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <OTPBanner otp={devOTP} onDismiss={() => setDevOTP(null)} />

      <Card className="p-6">
        {step === 'mobile' ? (
          <form onSubmit={handleSendOTP}>
            <h2 className="text-xl font-bold text-white mb-1">Driver Login</h2>
            <p className="text-sm text-slate-400 mb-6">
              Enter your mobile number to sign in as a driver
            </p>

            <Input
              label="Mobile Number"
              type="tel"
              inputMode="numeric"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              icon={<Phone className="w-4 h-4" />}
              error={error}
              maxLength={15}
              autoFocus
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={mobile.length < 10}
              className="mt-6"
            >
              Send OTP
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup/driver"
                className="text-brand-400 hover:text-brand-300 font-medium"
              >
                Sign up as Driver
              </Link>
            </p>
          </form>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Enter OTP</h2>
            <p className="text-sm text-slate-400 mb-6">
              We sent a code to{' '}
              <span className="text-white font-medium">{mobile}</span>
            </p>

            <OTPInput onComplete={handleVerifyOTP} disabled={loading} />

            {error && (
              <p className="text-center text-sm text-red-400 mt-4">{error}</p>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => {
                  setStep('mobile');
                  setError('');
                  setDevOTP(null);
                }}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Change number
              </button>
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
