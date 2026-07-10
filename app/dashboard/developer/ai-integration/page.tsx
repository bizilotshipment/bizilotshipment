'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Terminal, 
  Database, 
  GitMerge, 
  BookOpen, 
  History, 
  Network, 
  Download,
  Copy,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// A mock fetch would normally pull from /api/v1/ai-context, 
// but since this is an internal dashboard, we can just import the AI Context directly 
// or fetch it from the API to prove it works dynamically.
export default function AIIntegrationDashboard() {
  const [context, setContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activePrompt, setActivePrompt] = useState('getPlatformOverview');
  const [copied, setCopied] = useState(false);
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    // Fetch from our newly created AI Context endpoint
    fetch('/api/v1/ai-context')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setContext(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // To simulate the Prompt Generator without executing code from the JSON payload,
  // we'll fetch the actual text by hitting a specific utility or just generate it here.
  // For the sake of this UI, we can build it directly from the context.
  useEffect(() => {
    if (!context) return;
    
    // Quick template generation for the UI
    const formatJson = (obj: any) => JSON.stringify(obj, null, 2);
    
    const generators: Record<string, () => string> = {
      getPlatformOverview: () => `# Platform Overview: ${context.platform.name}\n**Version:** ${context.platform.version}\n\n## Mission\n${context.platform.mission}\n\n## Known Limitations\n${context.platform.knownLimitations.map((l: string) => '- ' + l).join('\n')}`,
      getDeveloperIntegration: () => `# Developer Integration Guide\n\n## Authentication\n${formatJson(context.authentication)}\n\n## Core Concepts\n${formatJson(context.concepts)}`,
      getCurrentPlatformState: () => `# Current Platform State\n\n## Schemas\n${formatJson(context.schemas)}\n\n## Endpoints\n${formatJson(context.endpoints)}`,
      getBusinessWorkflow: () => `# Workflows\n\n## Lifecycle\n${context.workflows.generalLifecyle.join('\n')}`,
      getAIInstructions: () => `# AI Agent Instructions\n\n## Architecture Rules\n${context.instructions.architectureRules.join('\n')}\n\n## Development Rules\n${context.instructions.developmentRules.join('\n')}`
    };

    if (generators[activePrompt]) {
      setPromptText(generators[activePrompt]());
    }
  }, [activePrompt, context]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(context, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bizilot-shipment-ai-context.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!context) {
    return <div className="text-red-400">Failed to load AI Context.</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Platform Context', icon: Bot },
    { id: 'prompts', label: 'Prompt Generator', icon: Terminal },
    { id: 'api', label: 'API Context', icon: Network },
    { id: 'schema', label: 'Schema Explorer', icon: Database },
    { id: 'workflows', label: 'Workflow Explorer', icon: GitMerge },
    { id: 'examples', label: 'Examples', icon: BookOpen },
    { id: 'changelog', label: 'Version History', icon: History },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-slide-up">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 space-y-1">
        <div className="mb-6 px-3">
          <h2 className="text-xl font-bold text-white mb-1">AI Integration</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded font-mono">v{context.platform.version}</span>
            <span className="text-slate-500">Auto-generated</span>
          </div>
        </div>

        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-brand-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}

        <div className="pt-6 mt-6 border-t border-white/10 px-3">
          <Button variant="outline" fullWidth className="text-xs" onClick={downloadJson}>
            <Download className="w-3.5 h-3.5 mr-2" />
            Download AI JSON
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        
        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">{context.platform.name}</h3>
              <p className="text-sm text-slate-300 mb-6">{context.platform.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-700/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Mission</h4>
                  <p className="text-xs text-slate-400">{context.platform.mission}</p>
                </div>
                <div className="bg-surface-700/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Future Roadmap</h4>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                    {context.platform.futureRoadmap.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>
            </Card>

            <h3 className="text-lg font-bold text-white mt-8 mb-4">AI Instructions</h3>
            <Card className="p-0 overflow-hidden divide-y divide-white/10">
              {Object.entries(context.instructions).map(([key, rules]) => (
                <div key={key} className="p-4">
                  <h4 className="text-sm font-semibold text-brand-400 capitalize mb-2">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {(rules as string[]).map((rule, i) => <li key={i}>{rule}</li>)}
                  </ul>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Tab: Prompt Generator */}
        {activeTab === 'prompts' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'getPlatformOverview', label: 'Platform Overview' },
                { id: 'getDeveloperIntegration', label: 'Developer Integration' },
                { id: 'getCurrentPlatformState', label: 'Current State (Endpoints & Schemas)' },
                { id: 'getBusinessWorkflow', label: 'Workflows' },
                { id: 'getAIInstructions', label: 'AI Instructions' }
              ].map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => setActivePrompt(prompt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activePrompt === prompt.id ? 'bg-purple-600 text-white' : 'bg-surface-700 text-slate-400 hover:bg-surface-600'
                  }`}
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            <Card className="flex flex-col h-[600px] border-purple-500/20">
              <div className="flex items-center justify-between p-3 border-b border-white/5 bg-surface-900/50">
                <span className="text-xs font-mono text-slate-400">Generated Prompt</span>
                <Button size="sm" onClick={() => copyToClipboard(promptText)}>
                  {copied ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                  Copy for AI Agent
                </Button>
              </div>
              <textarea 
                readOnly
                value={promptText}
                className="flex-1 w-full bg-transparent p-4 text-xs font-mono text-slate-300 resize-none focus:outline-none"
              />
            </Card>
          </div>
        )}

        {/* Tab: API Context */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            {context.endpoints.map((ep: any, i: number) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    ep.method === 'POST' ? 'bg-emerald-500/15 text-emerald-400' 
                    : ep.method === 'PUT' ? 'bg-amber-500/15 text-amber-400' 
                    : 'bg-brand-500/15 text-brand-400'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-white">{ep.path}</code>
                </div>
                <h4 className="text-sm font-semibold text-slate-300">{ep.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{ep.purpose}</p>
                <div className="mt-3 text-xs">
                  <span className="text-slate-500">Auth:</span> <span className="text-slate-300 font-mono">{ep.auth}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Schema Explorer */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            {Object.entries(context.schemas).map(([name, schema]: [string, any]) => (
              <Card key={name} className="p-4">
                <h4 className="text-sm font-bold text-brand-400 mb-3">{name}</h4>
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
                  {JSON.stringify(schema, null, 2)}
                </pre>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Workflows Explorer */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="text-sm font-bold text-white mb-4">Shipment Lifecycle</h4>
              <div className="space-y-3">
                {context.workflows.generalLifecyle.map((step: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="text-sm font-bold text-white mb-4">Webhook Lifecycle</h4>
              <div className="space-y-3">
                {context.workflows.webhookWorkflow.map((step: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-900/50 flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Examples */}
        {activeTab === 'examples' && (
          <div className="space-y-4">
            {Object.entries(context.examples).map(([name, ex]) => (
              <Card key={name} className="p-4">
                <h4 className="text-sm font-bold text-white mb-3 capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <pre className="bg-surface-900/50 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                  {JSON.stringify(ex, null, 2)}
                </pre>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Changelog */}
        {activeTab === 'changelog' && (
          <div className="space-y-4">
            {context.changelog.map((log: any, i: number) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">v{log.version}</h4>
                  <span className="text-xs text-slate-500 font-mono">{log.date}</span>
                </div>
                <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                  {log.changes.map((change: string, idx: number) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
