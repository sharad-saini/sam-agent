import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Sliders,
  Shield,
  Search,
  Code2,
  Calculator,
  FileText,
  Database,
  ArrowRight,
} from 'lucide-react';
import type { AgentConfig, ToolType } from '../types';

interface GoalInputPanelProps {
  onRunGoal: (goal: string, config: AgentConfig) => void;
  onRunDemo: () => void;
  isExecuting: boolean;
}

export const GoalInputPanel: React.FC<GoalInputPanelProps> = ({
  onRunGoal,
  onRunDemo,
  isExecuting,
}) => {
  const [goalText, setGoalText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<AgentConfig>({
    autonomy: 'autonomous',
    requireApproval: true,
    maxSteps: 5,
    maxRetries: 2,
    enabledTools: {
      web_search: true,
      calculator: true,
      code_executor: true,
      document_generator: true,
      data_processor: true,
      memory: true,
      human_approval: true,
    },
    webAccess: true,
    codeExecution: true,
  });

  const promptPresets = [
    {
      label: '🚀 Hackathon Demo: Student Team Productivity Stack',
      prompt: 'Research and compare the best productivity tools for a student team and prepare a recommendation.',
      isDemoTrigger: true,
    },
    {
      label: '💻 CS Student Laptop Comparison (Under ₹70k)',
      prompt: 'Research the best laptops for a computer science student under ₹70,000 and prepare a comparison.',
    },
    {
      label: '⚡ EV Adoption Trends in India',
      prompt: 'Prepare a comprehensive research report about EV adoption in India, analyzing 2W vs 4W market share and battery localization.',
    },
    {
      label: '📊 SaaS Cloud Cost Optimization',
      prompt: 'Analyze high-impact strategies to reduce AWS / GCP cloud infrastructure costs for a growing SaaS platform.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim() || isExecuting) return;
    onRunGoal(goalText.trim(), config);
  };

  const toggleTool = (tool: ToolType) => {
    setConfig(prev => ({
      ...prev,
      enabledTools: {
        ...prev.enabledTools,
        [tool]: !prev.enabledTools[tool],
      },
    }));
  };

  return (
    <div className="w-full bg-[#0E1526]/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-md">
      <form onSubmit={handleSubmit}>
        {/* Input Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <label
            htmlFor="goal-textarea"
            className="flex items-center gap-2 text-sm font-semibold text-slate-200 tracking-tight"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>What do you want SAM to accomplish?</span>
          </label>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition cursor-pointer font-mono"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Controls' : 'Autonomy Controls'}</span>
          </button>
        </div>

        {/* Text Area */}
        <div className="relative mb-3">
          <textarea
            id="goal-textarea"
            rows={3}
            value={goalText}
            onChange={e => setGoalText(e.target.value)}
            disabled={isExecuting}
            placeholder="State your high-level objective (e.g., 'Research the best laptops for a computer science student under ₹70,000 and prepare a comparison')..."
            className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 p-3.5 text-sm text-slate-100 placeholder-slate-500 resize-none font-sans outline-none transition disabled:opacity-50"
          />
        </div>

        {/* Prompt Presets / Inspiration Pills */}
        <div className="mb-4">
          <div className="text-[11px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
            Curated Goal Scenarios:
          </div>
          <div className="flex flex-wrap gap-2">
            {promptPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (preset.isDemoTrigger) {
                    onRunDemo();
                  } else {
                    setGoalText(preset.prompt);
                  }
                }}
                disabled={isExecuting}
                className={`text-xs px-3 py-1.5 rounded-lg border transition text-left cursor-pointer flex items-center gap-1.5 ${
                  preset.isDemoTrigger
                    ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-700/60 text-cyan-300 font-medium'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-slate-100'
                }`}
              >
                <span>{preset.label}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Controls Accordion */}
        {showAdvanced && (
          <div className="mb-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Autonomy Level */}
              <div>
                <span className="block font-mono text-slate-400 mb-1.5 font-semibold">
                  Autonomy Level
                </span>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(['manual', 'assisted', 'autonomous'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConfig({ ...config, autonomy: lvl })}
                      className={`py-1 rounded text-center capitalize font-mono text-[11px] transition ${
                        config.autonomy === lvl
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Gate Toggle */}
              <div>
                <span className="block font-mono text-slate-400 mb-1.5 font-semibold">
                  Human-in-the-Loop Safety
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, requireApproval: !config.requireApproval })
                  }
                  className={`w-full py-1.5 px-3 rounded-lg border flex items-center justify-between font-mono text-[11px] transition ${
                    config.requireApproval
                      ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Require Approval
                  </span>
                  <span className="font-bold">
                    {config.requireApproval ? 'ON (Safe)' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* Max Steps */}
              <div>
                <span className="block font-mono text-slate-400 mb-1.5 font-semibold">
                  Maximum Execution Steps: {config.maxSteps}
                </span>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={config.maxSteps}
                  onChange={e =>
                    setConfig({ ...config, maxSteps: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Active Tool Inventory */}
            <div>
              <span className="block font-mono text-slate-400 mb-1.5 font-semibold">
                Available Tools to Authorize:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'web_search', label: 'Web Search', icon: Search },
                  { id: 'code_executor', label: 'Code Executor', icon: Code2 },
                  { id: 'calculator', label: 'Calculator', icon: Calculator },
                  { id: 'data_processor', label: 'Data Processor', icon: Database },
                  { id: 'document_generator', label: 'Doc Generator', icon: FileText },
                ].map(tool => {
                  const Icon = tool.icon;
                  const isEnabled = config.enabledTools[tool.id as ToolType];
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => toggleTool(tool.id as ToolType)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition ${
                        isEnabled
                          ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Autonomous Closed-Loop Execution with Self-Healing</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="btn-run-hackathon-demo-alt"
              onClick={onRunDemo}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold tracking-wide transition cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              <span>▶ Run Hackathon Demo</span>
            </button>

            <button
              type="submit"
              id="btn-run-with-sam"
              disabled={!goalText.trim() || isExecuting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold tracking-wide shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run with SAM</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
