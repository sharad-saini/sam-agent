import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Filter,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Cpu,
  Shield,
  Zap,
} from 'lucide-react';
import type { ActivityLogItem } from '../types';

interface ActivityLogStreamProps {
  logs: ActivityLogItem[];
  isExecuting: boolean;
}

export const ActivityLogStream: React.FC<ActivityLogStreamProps> = ({
  logs,
  isExecuting,
}) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const [filter, setFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [safeLogs, autoScroll]);

  const filteredLogs = safeLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'plan' && (log.type === 'goal' || log.type === 'plan')) return true;
    if (filter === 'tools' && (log.type === 'tool_select' || log.type === 'execute')) return true;
    if (filter === 'eval' && log.type === 'evaluate') return true;
    if (filter === 'adapt' && (log.type === 'failure' || log.type === 'replan' || log.type === 'retry')) return true;
    if (filter === 'safety' && log.type === 'approval') return true;
    return true;
  });

  const getLogIcon = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'goal':
      case 'plan':
        return <Zap className="w-3.5 h-3.5 text-blue-400" />;
      case 'tool_select':
        return <Search className="w-3.5 h-3.5 text-cyan-400" />;
      case 'execute':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case 'evaluate':
        return <CheckCircle className="w-3.5 h-3.5 text-purple-400" />;
      case 'failure':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'replan':
      case 'retry':
        return <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
      case 'approval':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'verify':
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getBadgeClass = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'failure':
        return 'bg-rose-950/80 border-rose-800/80 text-rose-300 font-bold';
      case 'replan':
      case 'retry':
        return 'bg-amber-950/80 border-amber-800/80 text-amber-300 font-bold';
      case 'evaluate':
        return 'bg-purple-950/60 border-purple-800/60 text-purple-300';
      case 'execute':
        return 'bg-amber-950/40 border-amber-800/40 text-amber-200';
      case 'approval':
        return 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-300';
    }
  };

  return (
    <div className="w-full bg-[#0E1526]/90 border border-slate-800/90 rounded-2xl p-5 shadow-sm flex flex-col h-[480px]">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
            Agent Activity Stream
          </span>
          {isExecuting && (
            <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              LIVE
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({safeLogs.length})
          </button>
          <button
            onClick={() => setFilter('adapt')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'adapt'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Adaptations
          </button>
          <button
            onClick={() => setFilter('eval')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'eval'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Evaluations
          </button>
          <button
            onClick={() => setFilter('tools')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'tools'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tools
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs font-mono select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            Awaiting telemetry feed...
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-2.5 rounded-lg border transition-all ${
                log.type === 'failure'
                  ? 'bg-rose-950/30 border-rose-900/60 ring-1 ring-rose-500/30'
                  : log.type === 'replan' || log.type === 'retry'
                  ? 'bg-amber-950/30 border-amber-900/60'
                  : 'bg-slate-950/60 border-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  <div
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider ${getBadgeClass(
                      log.type
                    )}`}
                  >
                    {getLogIcon(log.type)}
                    <span>{log.type.replace('_', ' ')}</span>
                  </div>
                  {log.taskId && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-1 rounded border border-cyan-800/40">
                      {log.taskId}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-slate-200 leading-snug font-sans text-xs">
                {log.message}
              </div>

              {log.detail && (
                <div className="mt-1 text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-1.5 rounded border border-slate-800 font-mono">
                  {log.detail}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Auto-scroll controller */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>SAM Execution Stream Telemetry</span>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1 transition ${
            autoScroll ? 'text-cyan-400' : 'text-slate-500'
          }`}
        >
          <ArrowDown className="w-3 h-3" />
          <span>Auto-Scroll: {autoScroll ? 'ON' : 'PAUSED'}</span>
        </button>
      </div>
    </div>
  );
};
