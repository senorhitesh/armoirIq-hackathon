'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Volume2, VolumeX, RotateCcw, Cpu, Lock } from 'lucide-react';

interface HeaderProps {
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onResetDemo: () => void;
  onOpenArmorModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  voiceEnabled,
  onToggleVoice,
  onResetDemo,
  onOpenArmorModal
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Workspace */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  AdLoop
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ArmorIQ Governed
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Multi-Agent Social Ad Studio & Governance Spine
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-200">
            <div className="text-xs">
              <span className="text-slate-500">Workspace:</span>{' '}
              <span className="font-medium text-slate-800">NovaScale Agency</span>
            </div>
            <span className="text-slate-300">/</span>
            <div className="text-xs">
              <span className="text-slate-500">Client:</span>{' '}
              <span className="font-semibold text-blue-600">ScaleFlow SaaS (Q4)</span>
            </div>
          </div>
        </div>

        {/* Action Badges & Controls */}
        <div className="flex items-center space-x-3">
          
          {/* ArmorIQ Status Pill */}
          <button
            onClick={onOpenArmorModal}
            id="armoriq-status-badge"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer"
            title="Inspect ArmorIQ Platform Connection & Policies"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">ArmorIQ Active:</span>
            <span className="font-mono font-semibold">Merkle Intent Verified</span>
            <Lock className="w-3.5 h-3.5 text-emerald-600 ml-1" />
          </button>

          {/* Voice Feedback Toggle */}
          <button
            onClick={onToggleVoice}
            id="toggle-voice-btn"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
              voiceEnabled
                ? 'bg-violet-50 border-violet-200 text-violet-700 shadow-sm'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle Spoken Governance Outcomes (ElevenLabs)"
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                <span className="hidden sm:inline">Voice:</span> Spoken
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice:</span> Muted
              </>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            id="reset-demo-btn"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
            title="Reset Seed Demo Data for clean recording"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

      </div>
    </header>
  );
};
