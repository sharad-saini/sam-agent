import React from 'react';
import { X, Sliders, Shield, Zap, Wrench, Check } from 'lucide-react';
import type { AgentConfig, ToolType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgentConfig;
  onSaveConfig: (config: AgentConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = React.useState<AgentConfig>(config);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const toggleTool = (tool: ToolType) => {
    setLocalConfig(prev => ({
      ...prev,
      enabledTools: {
        ...prev.enabledTools,
        [tool]: !prev.enabledTools[tool],
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-slate-700 shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-base text-slate-100">Agent Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono text-slate-300">
          {/* Autonomy Level */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
              Autonomy Level
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {(['manual', 'assisted', 'autonomous'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLocalConfig({ ...localConfig, autonomy: lvl })}
                  className={`py-2 rounded-lg text-center capitalize transition cursor-pointer ${
                    localConfig.autonomy === lvl
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Safety Gate */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-0.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Human-in-the-Loop Safety Gate</span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Pauses agent on write/publish actions to require operator authorization.
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setLocalConfig({
                  ...localConfig,
                  requireApproval: !localConfig.requireApproval,
                })
              }
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer ${
                localConfig.requireApproval
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {localConfig.requireApproval ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Max Retries */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Max Self-Healing Retries per Task</span>
              <span className="font-bold text-cyan-400">{localConfig.maxRetries}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={localConfig.maxRetries}
              onChange={e =>
                setLocalConfig({
                  ...localConfig,
                  maxRetries: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Enabled Tools */}
          <div>
            <span className="block text-slate-400 mb-2 font-semibold uppercase text-[11px]">
              Available Tools
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'web_search', label: 'Web Search' },
                { id: 'calculator', label: 'Calculator' },
                { id: 'code_executor', label: 'Code Executor' },
                { id: 'data_processor', label: 'Data Processor' },
                { id: 'document_generator', label: 'Doc Generator' },
                { id: 'memory', label: 'Working Memory' },
              ].map(t => {
                const isEnabled = localConfig.enabledTools[t.id as ToolType];
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTool(t.id as ToolType)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      isEnabled
                        ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300 font-semibold'
                        : 'bg-slate-950 border-slate-900 text-slate-600'
                    }`}
                  >
                    <span>{t.label}</span>
                    {isEnabled && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 mt-5 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
