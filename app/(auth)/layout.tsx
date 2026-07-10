import React from 'react';
import { BizilotLogo } from '@/components/ui/BizilotLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      {/* Brand */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="flex justify-center mb-3">
          <BizilotLogo variant="full" height={100} />
        </div>
        <p className="text-xs text-slate-500 mt-2">Fast, reliable local deliveries</p>
      </div>

      {/* Content */}
      <div className="w-full max-w-sm animate-slide-up">
        {children}
      </div>
    </div>
  );
}
