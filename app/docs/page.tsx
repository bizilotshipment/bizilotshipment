import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-dvh pb-12">
      {/* Header */}
      <div className="glass sticky top-0 z-30">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">API Documentation</h1>
            <p className="text-xs text-slate-500">v1 — Delivery Platform</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-6 space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Overview</h2>
          <div className="glass rounded-xl p-4 text-sm text-slate-300 space-y-2">
            <p>
              The Delivery Platform API lets any system create delivery jobs, track their status,
              and receive real-time webhook notifications.
            </p>
            <p>
              <strong className="text-white">Base URL:</strong>{' '}
              <code className="text-brand-300 bg-surface-700 px-2 py-0.5 rounded font-mono text-xs">
                /api/v1
              </code>
            </p>
            <p>
              <strong className="text-white">Auth:</strong> API Key via{' '}
              <code className="text-brand-300 bg-surface-700 px-2 py-0.5 rounded font-mono text-xs">
                Authorization: Bearer dk_live_xxx
              </code>
            </p>
          </div>
        </section>

        {/* Endpoints */}
        {[
          {
            method: 'POST',
            path: '/api/v1/register',
            title: 'Register API Client',
            desc: 'Register your system and get an API key.',
            auth: 'None',
            body: `{
  "name": "My ERP System",
  "contactMobile": "9876543210",
  "webhookUrl": "https://example.com/webhook"
}`,
            response: `{
  "success": true,
  "data": {
    "clientId": "cli_xxx",
    "apiKey": "dk_live_xxx",
    "businessId": "bus_xxx",
    "rateLimit": 60
  }
}`,
          },
          {
            method: 'POST',
            path: '/api/v1/jobs',
            title: 'Create Delivery Job',
            desc: 'Submit a new delivery job with pickup and drop locations.',
            auth: 'Bearer API Key',
            body: `{
  "pickup": {
    "businessName": "ABC Mobiles",
    "ownerName": "Ravi Kumar",
    "fullAddress": "123 MG Road, Bangalore",
    "mapLink": "https://maps.google.com/...",
    "pincode": "560001"
  },
  "drops": [
    {
      "customerName": "John Doe",
      "completeAddress": "456 Park Ave, Bangalore",
      "googleMapsLink": "https://maps.google.com/...",
      "pincode": "560002"
    }
  ]
}`,
            response: `{
  "success": true,
  "data": {
    "jobId": "job_xxx",
    "status": "pending",
    "dropsCount": 1,
    "createdAt": "2026-07-10T..."
  }
}`,
          },
          {
            method: 'GET',
            path: '/api/v1/jobs',
            title: 'List Jobs',
            desc: 'List all delivery jobs for your API client. Supports filtering and pagination.',
            auth: 'Bearer API Key',
            body: null,
            response: `{
  "success": true,
  "data": {
    "jobs": [...],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}`,
          },
          {
            method: 'GET',
            path: '/api/v1/jobs/:jobId/status',
            title: 'Check Job Status',
            desc: 'Lightweight status check ideal for polling.',
            auth: 'Bearer API Key',
            body: null,
            response: `{
  "success": true,
  "data": {
    "jobId": "job_xxx",
    "status": "accepted",
    "driver": {
      "name": "Driver Name",
      "vehicleNumber": "KA01AB1234"
    },
    "updatedAt": "2026-07-10T..."
  }
}`,
          },
          {
            method: 'GET',
            path: '/api/v1/drivers',
            title: 'List Drivers',
            desc: 'Get list of drivers with availability status.',
            auth: 'Bearer API Key',
            body: null,
            response: `{
  "success": true,
  "data": {
    "drivers": [
      {
        "id": "usr_xxx",
        "name": "Driver Name",
        "vehicleNumber": "KA01AB1234",
        "status": "available"
      }
    ]
  }
}`,
          },
          {
            method: 'PUT',
            path: '/api/v1/webhooks',
            title: 'Configure Webhooks',
            desc: 'Set your webhook URL and choose which events to receive.',
            auth: 'Bearer API Key',
            body: `{
  "webhookUrl": "https://your-system.com/webhook",
  "events": [
    "job.accepted",
    "job.picked_up",
    "job.completed"
  ]
}`,
            response: `{
  "success": true,
  "data": {
    "webhookUrl": "https://...",
    "events": ["job.accepted", "job.picked_up", "job.completed"]
  }
}`,
          },
        ].map((endpoint) => (
          <section key={endpoint.path + endpoint.method}>
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
            <p className="text-sm text-slate-400 mb-3">{endpoint.desc}</p>

            <div className="space-y-2">
              <div className="text-xs text-slate-500">
                Auth: <span className="text-slate-400">{endpoint.auth}</span>
              </div>

              {endpoint.body && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Request Body</p>
                  <pre className="glass rounded-xl p-3 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre">
                    {endpoint.body}
                  </pre>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Response</p>
                <pre className="glass rounded-xl p-3 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre">
                  {endpoint.response}
                </pre>
              </div>
            </div>
          </section>
        ))}

        {/* Job Statuses */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Job Status Lifecycle</h2>
          <div className="glass rounded-xl p-4">
            <div className="space-y-2">
              {[
                { status: 'pending', desc: 'Job created, waiting for driver', color: 'text-amber-400' },
                { status: 'accepted', desc: 'Driver accepted the job', color: 'text-blue-400' },
                { status: 'picked_up', desc: 'Driver collected goods from pickup', color: 'text-purple-400' },
                { status: 'out_for_delivery', desc: 'Driver is delivering', color: 'text-cyan-400' },
                { status: 'completed', desc: 'All drops delivered', color: 'text-emerald-400' },
              ].map((s, i) => (
                <div key={s.status} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${s.color} bg-current`} />
                    {i < 4 && <div className="w-0.5 h-4 bg-surface-500 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <code className={`text-xs font-mono ${s.color}`}>{s.status}</code>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Webhook Events */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Webhook Events</h2>
          <div className="glass rounded-xl p-4">
            <div className="space-y-2 text-sm">
              {[
                { event: 'job.created', desc: 'Fired when a new job is created' },
                { event: 'job.accepted', desc: 'Fired when a driver accepts the job' },
                { event: 'job.picked_up', desc: 'Fired when driver confirms pickup' },
                { event: 'job.completed', desc: 'Fired when all drops are delivered' },
              ].map((e) => (
                <div key={e.event} className="flex items-center gap-3">
                  <code className="text-xs text-brand-300 font-mono bg-surface-700 px-2 py-0.5 rounded">
                    {e.event}
                  </code>
                  <span className="text-xs text-slate-400">{e.desc}</span>
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
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all"
          >
            Open Playground
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
