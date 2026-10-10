'use client';

import React from 'react';
import { X, ShieldCheck, CheckCircle2, Server, Bot, Key, ExternalLink } from 'lucide-react';

interface ArmorIQOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArmorIQOnboardingModal: React.FC<ArmorIQOnboardingModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                ArmorIQ Platform Onboarding & Infrastructure
              </h3>
              <p className="text-xs text-slate-500">
                Registered agent identities, MCP route handlers, and cryptographic proxy mapping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-5 space-y-4 text-xs font-mono">
          
          {/* Platform Status */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900 font-sans">
                ArmorIQ Platform Connected (platform.armoriq.ai)
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
              Security Scan: PASSED
            </span>
          </div>

          {/* 3 Registered Agents */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800 font-sans text-xs">
              <Bot className="w-4 h-4 text-violet-600" />
              <span>Registered Agent Identities</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Strategist Agent</span>
                <span className="text-blue-600 font-bold">agent_strat_q4</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Role: Read-Only Trends</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Creator Agent</span>
                <span className="text-violet-600 font-bold">agent_creator_v2</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Role: Draft & Score</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Publisher Agent</span>
                <span className="text-emerald-600 font-bold">agent_publisher_gate</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Role: Approvals & Sandbox</span>
              </div>
            </div>
          </div>

          {/* 3 Registered MCPs */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800 font-sans text-xs">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Registered MCP Route Handlers</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-slate-900">trends-mcp</span>
                <span className="text-slate-500 text-[11px]">/api/mcp/trends</span>
                <span className="text-emerald-700 font-medium text-[10px]">tools: fetch_trending, get_format_patterns</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-slate-900">workspace-mcp</span>
                <span className="text-slate-500 text-[11px]">/api/mcp/workspace</span>
                <span className="text-emerald-700 font-medium text-[10px]">tools: create_draft, score_virality, remix</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-slate-900">publisher-mcp</span>
                <span className="text-slate-500 text-[11px]">/api/mcp/publisher</span>
                <span className="text-emerald-700 font-medium text-[10px]">tools: request_approval, schedule_post, publish</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
