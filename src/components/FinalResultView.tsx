import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Share2,
  Table,
  BookOpen,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import type { FinalResult, ExecutionStats } from '../types';

interface FinalResultViewProps {
  result: FinalResult;
  stats: ExecutionStats;
  goal: string;
  onReset: () => void;
}

export const FinalResultView: React.FC<FinalResultViewProps> = ({
  result,
  stats,
  goal,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'matrix' | 'recommendations' | 'sources' | 'verification'>('brief');
  const [copied, setCopied] = useState(false);

  const safeSections = Array.isArray(result?.sections) ? result.sections : [];
  const safeRecommendations = Array.isArray(result?.recommendations) ? result.recommendations : [];
  const safeSources = Array.isArray(result?.sources) ? result.sources : [];

  const handleCopyMarkdown = () => {
    let text = `# ${result?.title || 'Report'}\n\n${result?.executiveSummary || ''}\n\n`;
    for (const sec of safeSections) {
      text += `## ${sec.heading}\n\n${sec.content}\n\n`;
      if (sec.items?.length) {
        text += sec.items.map(it => `* ${it}`).join('\n') + '\n\n';
      }
    }
    if (result?.comparisonTable && Array.isArray(result.comparisonTable.headers)) {
      text += `### Comparison Matrix\n\n`;
      text += `| ${result.comparisonTable.headers.join(' | ')} |\n`;
      text += `| ${result.comparisonTable.headers.map(() => '---').join(' | ')} |\n`;
      for (const row of result.comparisonTable.rows || []) {
        text += `| ${row.join(' | ')} |\n`;
      }
      text += '\n';
    }
    text += `### Key Recommendations\n\n`;
    text += safeRecommendations.map(r => `* ${r}`).join('\n') + '\n\n';

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let text = `# ${result?.title || 'Report'}\n\n${result?.executiveSummary || ''}\n\n`;
    for (const sec of safeSections) {
      text += `## ${sec.heading}\n\n${sec.content}\n\n`;
      if (sec.items?.length) {
        text += sec.items.map(it => `* ${it}`).join('\n') + '\n\n';
      }
    }
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAM_${(result?.title || 'Report').replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-[#0E1526] border border-emerald-500/40 rounded-2xl p-5 lg:p-7 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold uppercase tracking-wider">
                ✓ Goal Completed & Verified
              </span>
              <span className="text-xs font-mono text-slate-400">
                Execution Time: {stats.executionTimeSec}s
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              {result.title}
            </h2>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer border border-slate-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied Markdown!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Execution Summary Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Total Tasks</span>
          <span className="text-base font-bold text-slate-200">{stats.totalTasks} Tasks</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Completed</span>
          <span className="text-base font-bold text-emerald-400">{stats.completedTasks} / {stats.totalTasks}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Self-Heal Retries</span>
          <span className="text-base font-bold text-amber-400">{stats.retries} Retries</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Tools Orchestrated</span>
          <span className="text-base font-bold text-cyan-400">{stats.toolsUsedCount} Tools</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Plan Adaptations</span>
          <span className="text-base font-bold text-purple-400">{stats.adaptationsCount} Adapted</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Total Duration</span>
          <span className="text-base font-bold text-teal-400">{stats.executionTimeSec}s</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 mb-6 text-xs font-mono">
        {[
          { id: 'brief', label: 'Executive Briefing', icon: BookOpen },
          { id: 'matrix', label: 'Decision Matrix', icon: Table },
          { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
          { id: 'sources', label: 'Verified Citations', icon: ExternalLink },
          { id: 'verification', label: 'Verification Audit', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'brief' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Executive Summary Card */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/50">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                Executive Summary
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {result.executiveSummary}
              </p>
            </div>

            {/* Structured Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeSections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800"
                >
                  <h4 className="text-sm font-semibold text-slate-200 mb-2 font-sans">
                    {sec.heading}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {sec.content}
                  </p>
                  {sec.items && sec.items.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {sec.items.map((it, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Empirical Data Points */}
            {result.dataPoints && result.dataPoints.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Validated Key Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.dataPoints.map((dp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs"
                    >
                      <span className="text-[10px] text-slate-500 block truncate">{dp.metric}</span>
                      <span className="text-sm font-bold text-cyan-300 block">{dp.value}</span>
                      <span className="text-[10px] text-slate-400 block mt-1 truncate">
                        Source: {dp.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="animate-in fade-in duration-150">
            {result.comparisonTable ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                    <tr>
                      {result.comparisonTable.headers.map((h, i) => (
                        <th key={i} className="p-3 font-semibold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {result.comparisonTable.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-900/40 transition">
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`p-3 ${
                              cellIdx === 0
                                ? 'font-bold text-cyan-300'
                                : typeof cell === 'number'
                                ? 'text-amber-300 font-bold'
                                : 'text-slate-300'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">
                No comparison matrix available for this objective.
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {safeRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans pt-0.5">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {safeSources.map((src, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{src.name}</div>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline font-mono"
                    >
                      {src.url}
                    </a>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
                  {src.credibility}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {result?.verification && Array.isArray(result.verification.checks) && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-900/50 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-emerald-400 font-bold">
                    VERIFICATION CONFIDENCE: {Math.round(result.verification.confidence * 100)}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                    AUDIT PASSED
                  </span>
                </div>
                <div className="space-y-2">
                  {result.verification.checks.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{c.criterion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(result?.verificationNotes || []).map((note, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 font-mono"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
