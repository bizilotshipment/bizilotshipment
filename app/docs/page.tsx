import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AIContext } from '@/lib/ai';

export default function DocsPage() {
  const { platform, endpoints, events } = AIContext;

  return (
    <div className="min-h-dvh pb-12">
      {/* Header */}
      <div className="glass sticky top-0 z-30 border-b border-white/5">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">API Documentation</h1>
            <p className="text-xs text-slate-500">v{platform.version} — {platform.name}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-6 space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Overview</h2>
          <div className="glass rounded-xl p-4 text-sm text-slate-300 space-y-2">
            <p>{platform.description}</p>
            <p>
              <strong className="text-white">Base URL:</strong>{' '}
              <code className="text-brand-300 bg-surface-700 px-2 py-0.5 rounded font-mono text-xs">
                /api/{platform.apiVersion}
              </code>
            </p>
          </div>
        </section>

        {/* Dynamic Endpoints */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-3">Endpoints</h2>
          {endpoints.map((endpoint, idx) => (
            <div key={idx} className="glass p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    endpoint.method === 'POST'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : endpoint.method === 'PUT'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-brand-500/15 text-brand-400'
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="text-sm text-slate-300 font-mono">{endpoint.path}</code>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{endpoint.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{endpoint.purpose}</p>

              <div className="space-y-4">
                <div className="text-xs text-slate-500">
                  Auth: <span className="text-slate-400">{endpoint.auth}</span>
                </div>

                {endpoint.request && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Request Payload</p>
                    <pre className="bg-surface-900/50 rounded-xl p-3 text-xs text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(endpoint.request, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Response</p>
                  <pre className="bg-surface-900/50 rounded-xl p-3 text-xs text-slate-300 font-mono overflow-x-auto">
                    {JSON.stringify(endpoint.response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Webhook Events */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Webhook Events</h2>
          <div className="glass rounded-xl p-4">
            <div className="space-y-4 text-sm">
              {events.map((e, idx) => (
                <div key={idx} className="flex flex-col gap-1 border-b border-white/5 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-3">
                    <code className="text-xs text-brand-300 font-mono bg-surface-700 px-2 py-0.5 rounded">
                      {e.event}
                    </code>
                    <span className="text-xs text-slate-400">{e.description}</span>
                  </div>
                  <pre className="mt-2 bg-surface-900/50 rounded-xl p-3 text-xs text-slate-300 font-mono">
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Try it */}
        <div className="glass rounded-2xl p-6 text-center gradient-border">
          <h3 className="text-lg font-bold text-white mb-2">Ready to integrate?</h3>
          <p className="text-sm text-slate-400 mb-4">
            Try it out in the API Playground — no setup required.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all"
            >
              Open Playground
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/developer/ai-integration"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-700 hover:bg-surface-600 text-white font-semibold transition-all"
            >
              AI Context
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
