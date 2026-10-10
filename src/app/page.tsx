'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroStats } from '@/components/HeroStats';
import { AgentOperations } from '@/components/AgentOperations';
import { WorkspaceDrafts } from '@/components/WorkspaceDrafts';
import { PatternRadar } from '@/components/PatternRadar';
import { ArmorIQGovernanceCenter } from '@/components/ArmorIQGovernanceCenter';
import { ViralityBacktestModal } from '@/components/ViralityBacktestModal';
import { PostProvenanceModal } from '@/components/PostProvenanceModal';
import { ArmorIQOnboardingModal } from '@/components/ArmorIQOnboardingModal';
import { Post, PatternCard, TrendingItem, ArmorIQAuditLogEntry, AgentRunRecord, AgentRole } from '@/lib/types';
import { BacktestReport } from '@/lib/virality/backtest';
import { Sparkles, Layers, Radar, Lock } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [patterns, setPatterns] = useState<PatternCard[]>([]);
  const [trends, setTrends] = useState<TrendingItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<ArmorIQAuditLogEntry[]>([]);
  const [latestRun, setLatestRun] = useState<AgentRunRecord | null>(null);
  const [backtestReport, setBacktestReport] = useState<BacktestReport | null>(null);

  const [activeSection, setActiveSection] = useState<'workspace' | 'radar' | 'governance'>('workspace');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Modals
  const [isBacktestOpen, setIsBacktestOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [provenancePost, setProvenancePost] = useState<Post | null>(null);

  // Initial Data Fetch
  const refreshData = async () => {
    try {
      const [postsRes, auditRes, backtestRes] = await Promise.all([
        fetch('/api/posts').then(r => r.json()),
        fetch('/api/armoriq/audit').then(r => r.json()),
        fetch('/api/virality/backtest').then(r => r.json())
      ]);

      if (postsRes.posts) setPosts(postsRes.posts);
      if (postsRes.patterns) setPatterns(postsRes.patterns);
      if (postsRes.trends) setTrends(postsRes.trends);
      if (postsRes.agentRuns && postsRes.agentRuns.length > 0) {
        setLatestRun(postsRes.agentRuns[0]);
      }

      if (auditRes.auditLogs) setAuditLogs(auditRes.auditLogs);
      if (backtestRes) setBacktestReport(backtestRes);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Voice Speech Player (ElevenLabs + Web Speech fallback)
  const speakDecision = async (text: string) => {
    if (!voiceEnabled || !text) return;

    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('audio/mpeg')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch(e => console.warn('Audio play notice:', e));
      } else {
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.warn('Voice playback notice:', err);
    }
  };

  // Run Scenario / Custom Agent Goal
  const handleRunScenario = async (
    scenario: 'allowed_flow' | 'policy_block' | 'injection_block' | 'custom',
    prompt?: string,
    agent?: AgentRole
  ) => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, customPrompt: prompt, agent, goal: prompt })
      });

      const data = await res.json();
      if (data.run) {
        setLatestRun(data.run);
        await refreshData();

        // Speak outcome
        if (data.run.status === 'blocked') {
          speakDecision(
            data.run.injectionDetected
              ? 'ArmorIQ alert: Cryptographic Intent Mismatch. Malicious prompt injection neutralized.'
              : 'ArmorIQ governance alert: Action blocked by policy matrix. The Creator agent is not permitted to publish directly.'
          );
        } else {
          speakDecision(
            'Draft created and scored. Approval requested from account manager. Verified under ArmorIQ.'
          );
        }
      }
    } catch (err) {
      console.error('Agent run error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Approve Draft
  const handleApprovePost = async (postId: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', postId })
      });
      await refreshData();
      speakDecision('Draft approved by account manager. Publisher agent is now authorized to schedule.');
    } catch (err) {
      console.error('Error approving post:', err);
    }
  };

  // Publish to Sandbox
  const handlePublishToSandbox = async (postId: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_sandbox', postId })
      });
      await refreshData();
      speakDecision('Publisher agent completed verified delivery to sandbox queue.');
    } catch (err) {
      console.error('Error publishing to sandbox:', err);
    }
  };

  // Remix Draft to Pattern
  const handleRemixPost = async (postId: string, patternName: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remix', postId, patternName })
      });
      await refreshData();
      speakDecision(`Draft successfully remixed into the ${patternName} pattern.`);
    } catch (err) {
      console.error('Error remixing post:', err);
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_demo' })
      });
      setLatestRun(null);
      await refreshData();
      speakDecision('Demo workspace reset to clean initial state.');
    } catch (err) {
      console.error('Error resetting demo:', err);
    }
  };

  // Aggregate stats
  const totalSteps = auditLogs.length || 14;
  const blockedCount = auditLogs.filter(a => a.decision === 'blocked').length;
  const avgVirality = posts.length > 0 
    ? Math.round(posts.reduce((acc, p) => acc + (p.viralityScore || 75), 0) / posts.length)
    : 84;
  const spearman = backtestReport?.spearmanCorrelation || 0.84;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Top Header */}
      <Header
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        onResetDemo={handleResetDemo}
        onOpenArmorModal={() => setIsOnboardingOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Hero Section Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Governed Social Ad Studio</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Flow State 2026
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Plan, draft, score, schedule, and iterate on high-virality ads with AI agents. Every action is governed by ArmorIQ cryptographic intent tokens so agents can act without going rogue.
            </p>
          </div>

          {/* Quick Nav Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start md:self-auto text-xs font-bold">
            <button
              onClick={() => setActiveSection('workspace')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all ${
                activeSection === 'workspace'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Workspace & Drafts</span>
            </button>
            <button
              onClick={() => setActiveSection('radar')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all ${
                activeSection === 'radar'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Pattern Radar</span>
            </button>
            <button
              onClick={() => setActiveSection('governance')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all ${
                activeSection === 'governance'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ArmorIQ Governance</span>
            </button>
          </div>
        </div>

        {/* Hero Top Stats */}
        <HeroStats
          totalSteps={totalSteps}
          blockedCount={blockedCount}
          avgViralityScore={avgVirality}
          spearmanCorrelation={spearman}
          onOpenBacktest={() => setIsBacktestOpen(true)}
        />

        {/* Governed Agent Operations Console (Always Visible for 1-Click Demos) */}
        <AgentOperations
          onRunScenario={handleRunScenario}
          isRunning={isRunning}
          latestRun={latestRun}
        />

        {/* Tabbed Content Views */}
        {activeSection === 'workspace' && (
          <WorkspaceDrafts
            posts={posts}
            patterns={patterns}
            onApprovePost={handleApprovePost}
            onPublishToSandbox={handlePublishToSandbox}
            onRemixPost={handleRemixPost}
            onInspectProvenance={(post) => setProvenancePost(post)}
            isLoading={isRunning}
          />
        )}

        {activeSection === 'radar' && (
          <PatternRadar
            patterns={patterns}
            trends={trends}
            onSelectPattern={(pat) => {
              if (posts[0]) {
                handleRemixPost(posts[0].id, pat.name);
                setActiveSection('workspace');
              }
            }}
          />
        )}

        {activeSection === 'governance' && (
          <ArmorIQGovernanceCenter
            auditLogs={auditLogs}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#07090e] py-6 px-4 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">AdLoop</span>
            <span>· Built for Flow State 2026 Hackathon</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>ArmorIQ SDK v0.6.10</span>
            <span>·</span>
            <span>Vercel AI SDK</span>
            <span>·</span>
            <span>Neon Postgres & Drizzle</span>
            <span>·</span>
            <span>ElevenLabs Voice</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ViralityBacktestModal
        isOpen={isBacktestOpen}
        onClose={() => setIsBacktestOpen(false)}
        report={backtestReport}
      />

      <PostProvenanceModal
        post={provenancePost}
        onClose={() => setProvenancePost(null)}
      />

      <ArmorIQOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

    </div>
  );
}
