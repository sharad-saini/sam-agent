import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { ApprovalRequest } from '../types';

interface HumanApprovalModalProps {
  approval: ApprovalRequest | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  approval,
  onApprove,
  onReject,
}) => {
  if (!approval || approval.status !== 'pending') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-amber-500/50 shadow-2xl p-6 relative overflow-hidden">
        {/* Glowing safety accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-bold uppercase tracking-wider">
                Human-in-the-loop Safety Gate
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Risk: {approval.riskLevel.toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              Action Requires Operator Approval
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {approval.description}
        </p>

        {/* Action Payload Box */}
        <div className="mb-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Proposed Action Payload:
          </div>
          <div className="text-cyan-300 font-bold">{approval.title}</div>
          <pre className="text-[11px] text-slate-400 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(approval.payload, null, 2)}
          </pre>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-300/90 mb-5 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/50 font-sans">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Controlled Autonomy Policy: Sensitive actions pause execution until human verification is provided.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onReject(approval.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Reject / Re-plan</span>
          </button>

          <button
            type="button"
            onClick={() => onApprove(approval.id)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Action</span>
          </button>
        </div>
      </div>
    </div>
  );
};
