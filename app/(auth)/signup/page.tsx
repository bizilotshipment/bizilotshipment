'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Truck, Phone, ArrowRight, ArrowLeft, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';
import { OTPBanner } from '@/components/ui/OTPBanner';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

type Step = 'role' | 'details' | 'otp';
type Role = 'customer' | 'driver';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [devOTP, setDevOTP] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
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
      const signupData: Record<string, string | undefined> = {
        fullName,
        role: role!,
      };

      if (role === 'driver') {
        signupData.vehicleNumber = vehicleNumber;
        signupData.panNumber = panNumber;
        signupData.aadharNumber = aadharNumber;
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, signup: signupData }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Verification failed');
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (data.user.role === 'driver') {
        router.push('/dashboard/driver');
      } else {
        router.push('/dashboard/customer');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const isDetailsValid = () => {
    if (!fullName.trim() || mobile.length < 10) return false;
    if (role === 'driver' && (!vehicleNumber.trim() || !panNumber.trim() || !aadharNumber.trim())) return false;
    return true;
  };

  return (
    <>
      <OTPBanner otp={devOTP} onDismiss={() => setDevOTP(null)} />

      <Card className="p-6">
        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
            <p className="text-sm text-slate-400 mb-6">
              Choose how you want to use the platform
            </p>

            <div className="space-y-3">
              <button
                id="role-customer"
                onClick={() => handleRoleSelect('customer')}
                className="w-full glass-light rounded-xl p-4 text-left hover:bg-white/[0.06] transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-600/20 flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                    <User className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Customer</p>
                    <p className="text-xs text-slate-400">Track your deliveries</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
                </div>
              </button>

              <button
                id="role-driver"
                onClick={() => handleRoleSelect('driver')}
                className="w-full glass-light rounded-xl p-4 text-left hover:bg-white/[0.06] transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600/20 flex items-center justify-center group-hover:bg-emerald-600/30 transition-colors">
                    <Truck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Driver</p>
                    <p className="text-xs text-slate-400">Accept and deliver jobs</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-brand-400 hover:text-brand-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Details Form */}
        {step === 'details' && (
          <form onSubmit={handleSendOTP}>
            <button
              type="button"
              onClick={() => setStep('role')}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              {role === 'customer' ? 'Customer' : 'Driver'} details
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Fill in your information to get started
            </p>

            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                autoFocus
              />

              <Input
                label="Mobile Number"
                type="tel"
                inputMode="numeric"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                icon={<Phone className="w-4 h-4" />}
                maxLength={15}
              />

              {role === 'driver' && (
                <>
                  <Input
                    label="Vehicle Number"
                    placeholder="e.g., KA01AB1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    icon={<Truck className="w-4 h-4" />}
                  />

                  <Input
                    label="PAN Number"
                    placeholder="e.g., ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    icon={<CreditCard className="w-4 h-4" />}
                    maxLength={10}
                  />

                  <Input
                    label="Aadhar Number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="12-digit Aadhar number"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                    icon={<FileText className="w-4 h-4" />}
                    maxLength={12}
                  />
                </>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-400 mt-3">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={!isDetailsValid()}
              className="mt-6"
            >
              Send OTP
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* Step 3: OTP Verification */}
        {step === 'otp' && (
          <div>
            <button
              type="button"
              onClick={() => { setStep('details'); setError(''); setDevOTP(null); }}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Verify OTP</h2>
            <p className="text-sm text-slate-400 mb-6">
              Enter the code sent to{' '}
              <span className="text-white font-medium">{mobile}</span>
            </p>

            <OTPInput onComplete={handleVerifyOTP} disabled={loading} />

            {error && (
              <p className="text-center text-sm text-red-400 mt-4">{error}</p>
            )}

            <div className="flex justify-center mt-6">
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
