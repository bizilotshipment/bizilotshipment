import Link from 'next/link';
import { LogIn, UserPlus, Truck, Store, Zap, Globe, ShieldCheck } from 'lucide-react';
import { BizilotLogo } from '@/components/ui/BizilotLogo';

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-surface-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <BizilotLogo variant="icon" height={32} />
          <Link href="/docs" className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
            Developer API &rarr;
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/6 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <BizilotLogo variant="full" height={130} linked={false} />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            One platform for every delivery.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
            Bizilot Shipment connects <span className="text-white font-medium">local shops, businesses, and apps</span> to 
            a live network of drivers — through a simple dashboard or a powerful API.
          </p>

          {/* Two-liner badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-14 text-xs font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Store className="w-3.5 h-3.5" /> Shop & Parcel Bookings
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Truck className="w-3.5 h-3.5" /> Live Driver Network
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Globe className="w-3.5 h-3.5" /> ERP / POS / Shopify API
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="w-3.5 h-3.5" /> Real-time Tracking
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left">

            {/* Customers / Shops */}
            <div className="glass rounded-2xl p-7 border border-slate-700/50 hover:border-brand-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 to-purple-500" />

              <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center mb-5">
                <Store className="w-5 h-5 text-brand-400" />
              </div>

              <h2 className="text-lg font-bold text-white mb-1">Customers & Shops</h2>
              <p className="text-sm text-slate-400 mb-7 leading-relaxed">
                Book a delivery, manage multiple drops, and track your packages — all from a simple web dashboard. 
                No technical knowledge needed.
              </p>

              <div className="flex gap-2.5">
                <Link
                  href="/signin/customer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/20 active:scale-[0.98]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/signup/customer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50 text-white font-semibold text-sm transition-all active:scale-[0.98]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Drivers */}
            <div className="glass rounded-2xl p-7 border border-slate-700/50 hover:border-emerald-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />

              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>

              <h2 className="text-lg font-bold text-white mb-1">Delivery Drivers</h2>
              <p className="text-sm text-slate-400 mb-7 leading-relaxed">
                See available shipments in your area, accept jobs, get pickup and drop directions, and track your 
                earnings — all from the driver dashboard.
              </p>

              <div className="flex gap-2.5">
                <Link
                  href="/signin/driver"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/signup/driver"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50 text-white font-semibold text-sm transition-all active:scale-[0.98]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            </div>
          </div>

          {/* Platform integration strip */}
          <div className="mt-16 pt-10 border-t border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-6 font-semibold">
              Also available for systems & developers
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-400 mb-8">
              {['Shopify', 'WooCommerce', 'ERP Systems', 'POS Software', 'Custom Apps', 'Bizilot Platform'].map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50">
                  {t}
                </span>
              ))}
            </div>
            <Link href="/docs" className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors">
              <ShieldCheck className="w-4 h-4" /> View the Public API & Developer Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
