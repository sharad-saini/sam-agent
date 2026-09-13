import React from 'react';
import {
  Search,
  Calculator,
  Code2,
  Database,
  FileText,
  Brain,
  Shield,
  Activity,
  CheckCircle,
} from 'lucide-react';
import type { ToolType, ToolExecutionRecord } from '../types';

interface ToolPanelProps {
  activeTool: ToolType | null;
  toolHistory: ToolExecutionRecord[];
  memoryFactsCount: number;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  activeTool,
  toolHistory,
  memoryFactsCount,
}) => {
  const safeToolHistory = Array.isArray(toolHistory) ? toolHistory : [];
  const tools: {
    id: ToolType;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
    description: string;
  }[] = [
    {
      id: 'web_search',
      name: 'Web Search',
      icon: Search,
      category: 'Perception',
      description: 'Grounded research & academic sources',
    },
    {
      id: 'code_executor',
      name: 'Code Executor',
      icon: Code2,
      category: 'Computation',
      description: 'Sandboxed JS runtime for numerical analysis',
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: Calculator,
      category: 'Arithmetic',
      description: 'Deterministic math, percentages, ratios',
    },
    {
      id: 'data_processor',
      name: 'Data Processor',
      icon: Database,
      category: 'Telemetry',
      description: 'Multi-criteria ranking and filtering',
    },
    {
      id: 'document_generator',
      name: 'Doc Generator',
      icon: FileText,
      category: 'Synthesis',
      description: 'Executive briefing and report formatting',
    },
    {
      id: 'memory',
      name: 'Working Memory',
      icon: Brain,
      category: 'Context',
      description: 'In-loop state and fact accumulation',
    },
    {
      id: 'human_approval',
      name: 'Safety Gate',
      icon: Shield,
      category: 'Governance',
      description: 'Human authorization check for sensitive writes',
    },
  ];

  return (
    <div className="w-full bg-[#0E1526]/90 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
            Tool Orchestration Grid
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {safeToolHistory.length} Invocations Executed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          const totalCalls = safeToolHistory.filter(r => r.tool === tool.id).length;
          const lastCall = safeToolHistory.filter(r => r.tool === tool.id).slice(-1)[0];

          return (
            <div
              key={tool.id}
              className={`p-3.5 rounded-xl border transition-all relative ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : totalCalls > 0
                  ? 'bg-slate-900/80 border-slate-700/80'
                  : 'bg-slate-950/40 border-slate-850 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : totalCalls > 0
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950 animate-pulse'
                        : totalCalls > 0
                        ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isActive ? 'ACTIVE' : totalCalls > 0 ? 'USED' : 'READY'}
                  </span>
                </div>
              </div>

              <div className="font-bold text-xs text-slate-200 mb-0.5">
                {tool.name}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                {tool.description}
              </div>

              {/* Status Footer */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Calls: {tool.id === 'memory' ? memoryFactsCount : totalCalls}</span>
                {lastCall && (
                  <span className="text-slate-400">
                    {lastCall.execution_time}s
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
