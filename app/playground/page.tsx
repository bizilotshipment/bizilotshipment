'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Key,
  Send,
  Eye,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AIContext } from '@/lib/ai';

export default function PlaygroundPage() {
  // Registration
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regWebhook, setRegWebhook] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Create Shipment
  const [shipmentApiKey, setShipmentApiKey] = useState('');
  const [shipmentPickup, setShipmentPickup] = useState(
    JSON.stringify(AIContext.examples.createShipment.pickup, null, 2)
  );
  const [shipmentDrops, setShipmentDrops] = useState(
    JSON.stringify(AIContext.examples.createShipment.drops, null, 2)
  );
  const [shipmentResult, setShipmentResult] = useState<string | null>(null);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [shipmentError, setShipmentError] = useState('');

  // Check Status
  const [statusApiKey, setStatusApiKey] = useState('');
  const [statusShipmentId, setStatusShipmentId] = useState('');
  const [statusResult, setStatusResult] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // UI
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('register');

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  // --- Register ---
  const handleRegister = async () => {
    setRegError('');
    setRegLoading(true);
    try {
      const res = await fetch('/api/v1/api-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          contactMobile: regMobile,
          webhookUrl: regWebhook || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setRegError(data.error || 'Registration failed');
      } else {
        setApiKey(data.data.apiKey);
        setShipmentApiKey(data.data.apiKey);
        setStatusApiKey(data.data.apiKey);
      }
    } catch {
      setRegError('Request failed');
    } finally {
      setRegLoading(false);
    }
  };

  // --- Create Shipment ---
  const handleCreateShipment = async () => {
    setShipmentError('');
    setShipmentLoading(true);
    try {
      const pickup = JSON.parse(shipmentPickup);
      const drops = JSON.parse(shipmentDrops);
      const res = await fetch('/api/v1/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${shipmentApiKey}`,
        },
        body: JSON.stringify({ pickup, drops }),
      });
      const data = await res.json();
      setShipmentResult(JSON.stringify(data, null, 2));
      if (data.success && data.data?.shipmentId) {
        setStatusShipmentId(data.data.shipmentId);
      }
    } catch (err) {
      setShipmentError(err instanceof Error ? err.message : 'Invalid JSON or request failed');
    } finally {
      setShipmentLoading(false);
    }
  };

  // --- Check Status ---
  const handleCheckStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/v1/shipments/${statusShipmentId}/status`, {
        headers: { Authorization: `Bearer ${statusApiKey}` },
      });
      const data = await res.json();
      setStatusResult(JSON.stringify(data, null, 2));
    } catch {
      setStatusResult('{"error": "Request failed"}');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-dvh pb-8">
      {/* Header */}
      <div className="glass sticky top-0 z-30">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">API Playground</h1>
            <p className="text-xs text-slate-500">Test the Delivery API interactively</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-4 space-y-3">
        {/* 1. Register */}
        <Card className="overflow-hidden">
          <button
            onClick={() => toggleSection('register')}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-400" />
              <span className="font-semibold text-white text-sm">1. Get API Key</span>
            </div>
            {expandedSection === 'register' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {expandedSection === 'register' && (
            <div className="px-4 pb-4 space-y-3 animate-slide-up">
              <Input
                label="System Name"
                placeholder="e.g., My ERP System"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
              <Input
                label="Contact Mobile"
                placeholder="9876543210"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                type="tel"
                inputMode="numeric"
              />
              <Input
                label="Webhook URL (optional)"
                placeholder="https://your-system.com/webhook"
                value={regWebhook}
                onChange={(e) => setRegWebhook(e.target.value)}
              />

              {regError && <p className="text-sm text-red-400">{regError}</p>}

              <Button
                fullWidth
                onClick={handleRegister}
                loading={regLoading}
                disabled={!regName || regMobile.length < 10}
              >
                Register & Get API Key
              </Button>

              {apiKey && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-medium mb-1">
                    ✓ Your API Key (save this!)
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-emerald-200 font-mono break-all flex-1">
                      {apiKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey)}
                      className="p-1.5 rounded-lg hover:bg-emerald-500/20"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* 2. Create Shipment */}
        <Card className="overflow-hidden">
          <button
            onClick={() => toggleSection('create')}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white text-sm">2. Create Shipment</span>
            </div>
            {expandedSection === 'create' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {expandedSection === 'create' && (
            <div className="px-4 pb-4 space-y-3 animate-slide-up">
              <Input
                label="API Key"
                placeholder="dk_live_xxx"
                value={shipmentApiKey}
                onChange={(e) => setShipmentApiKey(e.target.value)}
                className="font-mono text-xs"
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Pickup Details (JSON)
                </label>
                <textarea
                  value={shipmentPickup}
                  onChange={(e) => setShipmentPickup(e.target.value)}
                  className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-y min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Drops (JSON Array)
                </label>
                <textarea
                  value={shipmentDrops}
                  onChange={(e) => setShipmentDrops(e.target.value)}
                  className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-y min-h-[160px]"
                />
              </div>

              {shipmentError && <p className="text-sm text-red-400">{shipmentError}</p>}

              <Button
                fullWidth
                onClick={handleCreateShipment}
                loading={shipmentLoading}
                disabled={!shipmentApiKey}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Create Shipment
              </Button>

              {shipmentResult && (
                <div className="p-3 rounded-xl bg-surface-700/50 border border-white/5">
                  <p className="text-xs text-slate-400 font-medium mb-1">Response</p>
                  <pre className="text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre">
                    {shipmentResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* 3. Check Status */}
        <Card className="overflow-hidden">
          <button
            onClick={() => toggleSection('status')}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white text-sm">3. Check Shipment Status</span>
            </div>
            {expandedSection === 'status' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {expandedSection === 'status' && (
            <div className="px-4 pb-4 space-y-3 animate-slide-up">
              <Input
                label="API Key"
                placeholder="dk_live_xxx"
                value={statusApiKey}
                onChange={(e) => setStatusApiKey(e.target.value)}
                className="font-mono text-xs"
              />
              <Input
                label="Shipment ID"
                placeholder="shp_xxx"
                value={statusShipmentId}
                onChange={(e) => setStatusShipmentId(e.target.value)}
                className="font-mono text-xs"
              />

              <Button
                fullWidth
                onClick={handleCheckStatus}
                loading={statusLoading}
                disabled={!statusApiKey || !statusShipmentId}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {statusLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Check Status
              </Button>

              {statusResult && (
                <div className="p-3 rounded-xl bg-surface-700/50 border border-white/5">
                  <p className="text-xs text-slate-400 font-medium mb-1">Response</p>
                  <pre className="text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre">
                    {statusResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Links */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/docs"
            className="flex-1 text-center text-sm text-brand-400 hover:text-brand-300 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 transition-colors"
          >
            API Documentation →
          </Link>
          <Link
            href="/signin/driver"
            className="flex-1 text-center text-sm text-emerald-400 hover:text-emerald-300 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 transition-colors"
          >
            Driver Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
