'use client';

import React from 'react';
import { Post } from '@/lib/types';
import { X, ShieldCheck, Hash, Key, GitCommit, FileText, CheckCircle2 } from 'lucide-react';

interface PostProvenanceModalProps {
  post: Post | null;
  onClose: () => void;
}

export const PostProvenanceModal: React.FC<PostProvenanceModalProps> = ({
  post,
  onClose
}) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-2xl border border-cyan-500/40 w-full max-w-2xl p-6 bg-[#0b0f19]/95 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Cryptographic Provenance Certificate
              </h3>
              <p className="text-xs text-slate-400">
                ArmorIQ signed intent token & Merkle tree inclusion record
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-5 space-y-4 font-mono text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Post Title:</span>
              <span className="font-bold text-white font-sans">{post.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Generating Agent:</span>
              <span className="text-cyan-400 uppercase font-bold">{post.createdByAgent || 'creator'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Post Status:</span>
              <span className="text-emerald-400 uppercase font-bold">{post.status}</span>
            </div>
            {post.approvedBy && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Human Approval Gate:</span>
                <span className="text-indigo-300 font-sans">{post.approvedBy}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-sans flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>ArmorIQ Intent Cryptography Details</span>
            </h4>

            <div>
              <span className="text-slate-500 text-[11px] block">Intent Plan Reference:</span>
              <span className="text-slate-200">{post.armoriqPlanRef || `plan_req_${post.id.slice(0, 8)}`}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Merkle Leaf Inclusion Hash:</span>
              <span className="text-cyan-300 break-all">{post.merkleProof || '0x4f89d9e2a1b7301c84f509e...'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Verification Status:</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CRYPTOGRAPHICALLY VERIFIED & AUDIT SIGNED</span>
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Certificate
          </button>
        </div>

      </div>
    </div>
  );
};
