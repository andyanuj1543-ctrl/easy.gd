import React, { useState } from 'react';
import { X, Key, ShieldCheck, Sparkles, Volume2, Cpu, Check } from 'lucide-react';
import { ApiKeysConfig } from '../../types/gd';

interface ApiKeyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiKeysConfig;
  onSave: (config: ApiKeysConfig) => void;
}

export const ApiKeyConfigModal: React.FC<ApiKeyConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [form, setForm] = useState<ApiKeysConfig>({ ...config });
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">API Configurations</h3>
              <p className="text-xs text-slate-400">Grok AI & Sarvam AI Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="px-6 py-3 bg-emerald-950/20 border-b border-emerald-900/30 flex items-start gap-2.5 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            Keys are saved locally in your browser session. If you don't enter an API key, easy.gd automatically runs using the in-browser Web Speech engine and simulated dialogue generation.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Hackathon Privacy & Zero-Retention Notice */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Privacy & Zero-Retention Guarantee</span>
            </div>
            <p>
              We adhere strictly to hackathon data rules: All audio stays in your browser session. Audio streams are processed strictly in real-time and <strong>never stored on any disk or external database</strong>.
            </p>
          </div>

          {/* Quick Reference: Where to Sign Up */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Quick Reference: Free API Keys</span>
              <span className="text-[10px] text-emerald-400 font-normal">Instant Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <a
                href="https://www.sarvam.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors group"
              >
                <span>Sarvam AI (Hinglish/IN)</span>
                <span className="text-emerald-400 group-hover:underline">Free Credits ↗</span>
              </a>
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors group"
              >
                <span>Groq (Fast LLM)</span>
                <span className="text-emerald-400 group-hover:underline">14.4k req/day ↗</span>
              </a>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors group"
              >
                <span>Google Gemini</span>
                <span className="text-emerald-400 group-hover:underline">1.5k req/day ↗</span>
              </a>
              <a
                href="https://x.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors group"
              >
                <span>Grok AI (xAI)</span>
                <span className="text-indigo-400 group-hover:underline">API Portal ↗</span>
              </a>
            </div>
          </div>

          {/* Grok AI */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Grok AI (xAI API Key)</span>
              <span className="text-[10px] text-slate-500 font-normal ml-auto">grok-2 / grok-beta</span>
            </label>
            <input
              type="password"
              placeholder="xai-xxxxxxxxxxxxxxxxxxxx"
              value={form.grokApiKey}
              onChange={(e) => setForm({ ...form, grokApiKey: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">Used for inter-agent multi-turn dialogue generation and nuanced GD debates.</p>
          </div>

          {/* Sarvam AI */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sarvam AI Subscription Key</span>
              <span className="text-[10px] text-slate-500 font-normal ml-auto">Saarika & Bulbul</span>
            </label>
            <input
              type="password"
              placeholder="sarvam-subscription-key"
              value={form.sarvamApiKey}
              onChange={(e) => setForm({ ...form, sarvamApiKey: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">Powers authentic Indian English voices (Arvind, Meera, Pavithra, Amol) & Hinglish STT.</p>
          </div>

          {/* Groq / Gemini free fallbacks */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Groq API Key (Free Tier 14,400 req/day)</span>
              </label>
              <input
                type="password"
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                value={form.groqApiKey}
                onChange={(e) => setForm({ ...form, groqApiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Gemini API Key (Free Tier 1,500 req/day)</span>
              </label>
              <input
                type="password"
                placeholder="AIzaxxxxxxxxxxxxxxxxxxxx"
                value={form.geminiApiKey}
                onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configurations</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
