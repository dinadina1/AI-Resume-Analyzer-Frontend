import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiRobot2Line, RiKeyLine, RiEyeLine, RiEyeOffLine,
  RiCheckLine, RiToggleLine, RiToggleFill, RiBarChartLine,
  RiShieldCheckLine, RiInformationLine, RiServerLine,
} from 'react-icons/ri';
import { LlmService } from '@/services/analysis.service';
import { Button, Loader } from '@/components/atoms';
import { cn } from '@/utils/format';
import toast from 'react-hot-toast';

// ─── Provider Catalogue ───────────────────────────────────────────────────────

type ProviderId = 'OPENAI' | 'GEMINI' | 'ANTHROPIC' | 'OLLAMA' | 'MISTRAL' | 'GROQ';

interface ProviderMeta {
  id: ProviderId;
  label: string;
  icon: string;
  description: string;
  docUrl: string;
  models: { value: string; label: string }[];
  needsBaseUrl: boolean;
  apiKeyPlaceholder: string;
  apiKeyHint: string;
  free?: boolean;
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: 'OPENAI',
    label: 'OpenAI',
    icon: '🤖',
    description: 'GPT-4o, GPT-4.1 family',
    docUrl: 'https://platform.openai.com/api-keys',
    models: [
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini — fast, best value (recommended)' },
      { value: 'gpt-4o', label: 'GPT-4o — flagship multimodal' },
      { value: 'gpt-4.1', label: 'GPT-4.1 — latest (Apr 2025)' },
      { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini — latest, fast' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo — cheapest' },
    ],
    needsBaseUrl: false,
    apiKeyPlaceholder: 'sk-proj-...',
    apiKeyHint: 'Get your key at platform.openai.com/api-keys',
  },
  {
    id: 'GEMINI',
    label: 'Google Gemini',
    icon: '✨',
    description: 'Gemini 2.0 Flash / 1.5 Pro',
    docUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash — fast, free tier (recommended)' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite — cheapest, fastest' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash — stable' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro — large context (paid)' },
    ],
    needsBaseUrl: false,
    apiKeyPlaceholder: 'AIzaSy...',
    apiKeyHint: 'Get your free key at aistudio.google.com',
    free: true,
  },
  {
    id: 'ANTHROPIC',
    label: 'Anthropic Claude',
    icon: '🧠',
    description: 'Claude 3.5 / 3.7 Sonnet',
    docUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku — fast, affordable (recommended)' },
      { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet — latest, smartest' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet — highly capable' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus — previous flagship' },
    ],
    needsBaseUrl: false,
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeyHint: 'Get your key at console.anthropic.com',
  },
  {
    id: 'GROQ',
    label: 'Groq',
    icon: '⚡',
    description: 'Ultra-fast free inference',
    docUrl: 'https://console.groq.com/keys',
    models: [
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile — best (recommended)' },
      { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant — fastest' },
      { value: 'gemma2-9b-it', label: 'Gemma 2 9B — Google, fast' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B — long context (32k)' },
    ],
    needsBaseUrl: false,
    apiKeyPlaceholder: 'gsk_...',
    apiKeyHint: 'Free tier available at console.groq.com',
    free: true,
  },
  {
    id: 'MISTRAL',
    label: 'Mistral AI',
    icon: '🌪️',
    description: 'Mistral Small 3 / Large 2',
    docUrl: 'https://console.mistral.ai/api-keys',
    models: [
      { value: 'mistral-small-latest', label: 'Mistral Small 3 — fast, affordable (recommended)' },
      { value: 'mistral-large-latest', label: 'Mistral Large 2 — most capable' },
      { value: 'open-mixtral-8x22b', label: 'Open Mixtral 8x22B — open source' },
      { value: 'codestral-latest', label: 'Codestral — code-optimised' },
    ],
    needsBaseUrl: false,
    apiKeyPlaceholder: 'xxxxxxxx...',
    apiKeyHint: 'Get your key at console.mistral.ai',
  },
  {
    id: 'OLLAMA',
    label: 'Ollama (Local)',
    icon: '🦙',
    description: 'Run models locally — no key',
    docUrl: 'https://ollama.com/download',
    models: [
      { value: 'llama3.2', label: 'Llama 3.2 3B — fast, lightweight (recommended)' },
      { value: 'llama3.1', label: 'Llama 3.1 8B — balanced' },
      { value: 'gemma3', label: 'Gemma 3 — Google, compact' },
      { value: 'phi4', label: 'Phi-4 — Microsoft, smart small model' },
      { value: 'deepseek-r1', label: 'DeepSeek-R1 — reasoning model' },
      { value: 'qwen2.5', label: 'Qwen 2.5 — Alibaba, multilingual' },
      { value: 'mistral', label: 'Mistral 7B — classic open source' },
    ],
    needsBaseUrl: true,
    apiKeyPlaceholder: 'not-required',
    apiKeyHint: 'Ollama runs locally — no API key required. Enter any value.',
    free: true,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export const AiSettings: React.FC = () => {
  const qc = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('OPENAI');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434');
  const [showKey, setShowKey] = useState(false);
  const [editingKey, setEditingKey] = useState(false);

  const { data: config, isLoading } = useQuery({
    queryKey: ['llm-config'],
    queryFn: LlmService.getConfig,
  });

  const { data: usage } = useQuery({
    queryKey: ['llm-usage'],
    queryFn: LlmService.getUsage,
  });

  // Pre-populate from saved config
  useEffect(() => {
    if (config) {
      if (config.provider) setSelectedProvider(config.provider as ProviderId);
      if (config.model) setSelectedModel(config.model);
      if (config.baseUrl) setBaseUrl(config.baseUrl);
    }
  }, [config]);

  // Reset model when provider changes
  useEffect(() => {
    const meta = PROVIDERS.find((p) => p.id === selectedProvider);
    if (meta) setSelectedModel(meta.models[0].value);
  }, [selectedProvider]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const key = selectedProvider === 'OLLAMA' && !apiKey ? 'ollama' : apiKey;
      return LlmService.saveConfig(
        key,
        true,
        selectedProvider,
        selectedModel,
        selectedProvider === 'OLLAMA' ? baseUrl : undefined
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['llm-config'] });
      toast.success('AI configuration saved & enabled ✓');
      setApiKey('');
      setEditingKey(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to save'),
  });

  const toggleMutation = useMutation({
    mutationFn: (isEnabled: boolean) => LlmService.toggleLlm(isEnabled),
    onSuccess: (_, isEnabled) => {
      qc.invalidateQueries({ queryKey: ['llm-config'] });
      toast.success(`AI ${isEnabled ? 'enabled' : 'disabled'}`);
    },
    onError: () => toast.error('Failed to toggle AI'),
  });

  const isEnabled = config?.isEnabled ?? false;
  const hasKey = config?.hasKey ?? false;
  const providerMeta = PROVIDERS.find((p) => p.id === selectedProvider)!;
  const isOllama = selectedProvider === 'OLLAMA';

  const canSave = isOllama
    ? selectedModel.trim().length > 0
    : apiKey.trim().length > 0;

  if (isLoading) return <Loader label="Loading AI settings..." className="py-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <RiRobot2Line className="text-primary-400" />
          AI Settings
        </h1>
        <p className="text-surface-400 mt-1">
          Choose your AI provider and configure it to unlock intelligent resume analysis
        </p>
      </div>

      {/* Status Card */}
      <div className={cn(
        'card p-5 border-l-4 transition-all',
        isEnabled && hasKey ? 'border-l-accent-500' : 'border-l-surface-700'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
              isEnabled && hasKey ? 'bg-accent-500/20' : 'bg-surface-800'
            )}>
              {hasKey
                ? PROVIDERS.find((p) => p.id === (config?.provider ?? 'OPENAI'))?.icon ?? '🤖'
                : '⚙️'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {isEnabled && hasKey
                  ? `${PROVIDERS.find((p) => p.id === (config?.provider ?? 'OPENAI'))?.label} — Active`
                  : 'AI Inactive'}
              </p>
              <p className="text-xs text-surface-500">
                {hasKey
                  ? `Model: ${config?.model ?? '—'}`
                  : 'No provider configured'}
              </p>
            </div>
          </div>

          {hasKey && (
            <button
              onClick={() => toggleMutation.mutate(!isEnabled)}
              disabled={toggleMutation.isPending}
              className="flex items-center gap-2 text-sm font-medium transition-all"
            >
              {isEnabled
                ? <RiToggleFill className="text-3xl text-accent-400" />
                : <RiToggleLine className="text-3xl text-surface-500" />}
              <span className={isEnabled ? 'text-accent-400' : 'text-surface-500'}>
                {isEnabled ? 'On' : 'Off'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Provider Selection */}
      <div className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">1. Choose Provider</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={cn(
                'relative p-3 rounded-xl border-2 text-left transition-all',
                selectedProvider === p.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-surface-700 bg-surface-800/50 hover:border-surface-600'
              )}
            >
              {p.free && (
                <span className="absolute top-2 right-2 text-[10px] font-bold text-accent-400 bg-accent-400/10 px-1.5 py-0.5 rounded">
                  FREE
                </span>
              )}
              <div className="text-2xl mb-1.5">{p.icon}</div>
              <p className="text-xs font-semibold text-white">{p.label}</p>
              <p className="text-[10px] text-surface-500 mt-0.5">{p.description}</p>
              {selectedProvider === p.id && (
                <RiCheckLine className="absolute bottom-2 right-2 text-primary-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Model + Key Config */}
      <div className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">2. Configure {providerMeta.label}</h2>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="label">Model</label>
          <select
            className="input-field"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {providerMeta.models.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Ollama Base URL */}
        {isOllama && (
          <div className="space-y-1.5">
            <label className="label flex items-center gap-1.5">
              <RiServerLine />
              Ollama Base URL
            </label>
            <input
              type="url"
              className="input-field font-mono text-sm"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
            />
            <p className="text-xs text-surface-500">
              Default: <code>http://localhost:11434</code>. Make sure Ollama is running with{' '}
              <code>OLLAMA_ORIGINS=* ollama serve</code>
            </p>
          </div>
        )}

        {/* API Key */}
        <div className="space-y-1.5">
          <label className="label flex items-center gap-2">
            <RiKeyLine />
            {isOllama ? 'API Key (not required for local)' : 'API Key'}
            {hasKey && !editingKey && (
              <span className="badge badge-success text-xs">Saved</span>
            )}
          </label>

          {hasKey && !editingKey ? (
            <div className="flex items-center gap-3">
              <div className="input-field flex-1 text-surface-500 font-mono text-sm">
                {isOllama ? '(local — no key)' : '••••••••••••••••••••••••••••••••'}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditingKey(true)}>
                Update
              </Button>
            </div>
          ) : (
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="input-field pr-10 font-mono text-sm"
                placeholder={providerMeta.apiKeyPlaceholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
              />
              {!isOllama && (
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
                >
                  {showKey ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              )}
            </div>
          )}

          <p className="flex items-start gap-1.5 text-xs text-surface-500">
            <RiInformationLine className="flex-shrink-0 mt-0.5" />
            <span>
              {providerMeta.apiKeyHint}{' '}
              <a
                href={providerMeta.docUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary-400 hover:underline"
              >
                Get key →
              </a>
            </span>
          </p>

          {!isOllama && (
            <p className="flex items-center gap-1.5 text-xs text-surface-600">
              <RiShieldCheckLine />
              Keys are AES-256 encrypted and never exposed in API responses
            </p>
          )}
        </div>

        {/* Save */}
        {(!hasKey || editingKey) && (
          <Button
            className="w-full"
            loading={saveMutation.isPending}
            disabled={!canSave}
            onClick={() => saveMutation.mutate()}
          >
            Save & Enable {providerMeta.label}
          </Button>
        )}

        {hasKey && !editingKey && (
          <Button
            className="w-full"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Update Provider / Model
          </Button>
        )}
      </div>

      {/* Usage Stats */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <RiBarChartLine />
          Usage Statistics
        </h2>
        {usage ? (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Tokens', value: (usage.totalTokensUsed ?? 0).toLocaleString(), color: 'text-primary-400' },
              { label: 'API Requests', value: usage.totalRequests ?? 0, color: 'text-accent-400' },
              { label: 'Est. Cost (USD)', value: `$${usage.estimatedCostUsd ?? '0.00'}`, color: 'text-yellow-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-surface-800 rounded-lg p-3 text-center">
                <p className={cn('text-xl font-bold', color)}>{value}</p>
                <p className="text-xs text-surface-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-surface-500 text-sm">No usage data yet.</p>
        )}
      </div>
    </div>
  );
};
