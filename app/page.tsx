import Link from 'next/link';
import { ArrowRight, Truck, Zap, Shield, Code2, Webhook } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-md px-4 pt-12 pb-16">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-lg">🚚</span>
            </div>
            <span className="text-lg font-bold text-white">Delivery</span>
          </div>

          {/* Hero text */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            Connect Your System.{' '}
            <span className="gradient-text">Deliver Anywhere.</span>
          </h1>

          <p className="text-base text-slate-400 mb-8 leading-relaxed">
            A universal delivery API. Any system — ERP, ecommerce, custom software — can 
            send delivery jobs and track drivers in real-time. One integration, unlimited deliveries.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Link
              href="/playground"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-all shadow-lg shadow-brand-600/20 active:scale-[0.98]"
            >
              <Code2 className="w-5 h-5" />
              Get Your API Key
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-surface-700 hover:bg-surface-600 text-white font-medium text-base transition-all active:scale-[0.98]"
            >
              <Truck className="w-5 h-5" />
              Sign In as Driver
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-md px-4 pb-16">
        <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>

        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Register your system',
              desc: 'Get an API key in seconds. No approval needed.',
              gradient: 'from-brand-500/20 to-brand-600/20',
              textColor: 'text-brand-400',
            },
            {
              step: '2',
              title: 'Send delivery jobs',
              desc: 'POST pickup + drops to our API. We handle the rest.',
              gradient: 'from-purple-500/20 to-purple-600/20',
              textColor: 'text-purple-400',
            },
            {
              step: '3',
              title: 'Driver accepts & delivers',
              desc: 'Drivers see jobs, accept, pickup, and deliver.',
              gradient: 'from-emerald-500/20 to-emerald-600/20',
              textColor: 'text-emerald-400',
            },
            {
              step: '4',
              title: 'Track in real-time',
              desc: 'Get status via polling or webhooks. Simple.',
              gradient: 'from-cyan-500/20 to-cyan-600/20',
              textColor: 'text-cyan-400',
            },
          ].map((item) => (
            <div key={item.step} className="glass rounded-xl p-4 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-sm font-bold ${item.textColor}`}>{item.step}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-md px-4 pb-16">
        <h2 className="text-xl font-bold text-white mb-6">Why Choose Us</h2>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Zap, label: 'Instant Setup', desc: 'API key in 30 seconds', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { icon: Shield, label: 'Secure', desc: 'API key + JWT auth', color: 'text-brand-400', bg: 'bg-brand-500/10' },
            { icon: Code2, label: 'API First', desc: 'RESTful, versioned', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: Webhook, label: 'Webhooks', desc: 'Real-time updates', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((feat) => (
            <div key={feat.label} className="glass rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${feat.bg} flex items-center justify-center mb-2.5`}>
                <feat.icon className={`w-4.5 h-4.5 ${feat.color}`} />
              </div>
              <h3 className="font-semibold text-white text-sm">{feat.label}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code Preview */}
      <section className="mx-auto max-w-md px-4 pb-16">
        <h2 className="text-xl font-bold text-white mb-4">Simple Integration</h2>
        <div className="glass rounded-xl p-4 font-mono text-xs overflow-x-auto">
          <div className="text-slate-500 mb-2"># Create a delivery job</div>
          <div>
            <span className="text-emerald-400">POST</span>{' '}
            <span className="text-slate-300">/api/v1/jobs</span>
          </div>
          <div className="text-slate-500 mt-2">Authorization: Bearer dk_live_xxx</div>
          <div className="mt-2 text-slate-300">{'{'}</div>
          <div className="text-slate-300 pl-4">
            <span className="text-brand-300">&quot;pickup&quot;</span>: {'{'} <span className="text-amber-300">&quot;businessName&quot;</span>: <span className="text-emerald-300">&quot;ABC Store&quot;</span> {'}'},
          </div>
          <div className="text-slate-300 pl-4">
            <span className="text-brand-300">&quot;drops&quot;</span>: [{'{'} <span className="text-amber-300">&quot;customerName&quot;</span>: <span className="text-emerald-300">&quot;John&quot;</span> {'}'}]
          </div>
          <div className="text-slate-300">{'}'}</div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-md px-4 pb-12">
        <div className="glass rounded-2xl p-6 text-center gradient-border">
          <h3 className="text-lg font-bold text-white mb-2">Ready to get started?</h3>
          <p className="text-sm text-slate-400 mb-4">
            Get your API key and start delivering in minutes.
          </p>
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-lg shadow-brand-600/20"
          >
            Try the API Playground
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-md px-4 py-6 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Delivery Platform</span>
          <div className="flex gap-4">
            <Link href="/docs" className="hover:text-slate-400">API Docs</Link>
            <Link href="/playground" className="hover:text-slate-400">Playground</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
