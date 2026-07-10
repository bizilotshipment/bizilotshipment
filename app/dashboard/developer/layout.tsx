import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit } from 'lucide-react';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-surface-900">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">Developer Portal</h1>
                <p className="text-[10px] text-slate-400">Bizilot Shipment</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Link href="/docs" className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              Docs
            </Link>
            <Link href="/playground" className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              Playground
            </Link>
            <Link href="/dashboard/developer/ai-integration" className="text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-lg hover:bg-brand-500/20 transition-colors">
              AI Context
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
