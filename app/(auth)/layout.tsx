import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      {/* Brand */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <span className="text-xl">🚚</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Delivery</h1>
        </div>
        <p className="text-sm text-slate-500">Connect your system. Deliver anywhere.</p>
      </div>

      {/* Content */}
      <div className="w-full max-w-sm animate-slide-up">
        {children}
      </div>
    </div>
  );
}
