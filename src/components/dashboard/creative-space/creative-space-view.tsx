'use client';

import React, { useState, useEffect } from 'react';
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
import { Sparkles, Layers, Radar, Lock, Volume2, VolumeX, RotateCcw, ShieldCheck } from 'lucide-react';
import { useKanbanStore } from '@/stores/kanban-store';

export default function CreativeSpaceView() {
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

  const addTask = useKanbanStore((state) => state.addTask);

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

        if (data.run.draftPost) {
          addTask({
            title: data.run.draftPost.content?.slice(0, 45) + '...',
            description: data.run.draftPost.content,
            priority: data.run.draftPost.viralityScore > 85 ? 'urgent' : 'normal',
            columnId: data.run.status === 'blocked' ? 'col-drafts' : 'col-review',
            tags: [data.run.draftPost.platform, 'Agent Run'],
            metadata: {
              viralityScore: data.run.draftPost.viralityScore,
              platform: data.run.draftPost.platform,
            }
          });
        }

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

  const handleApprovePost = async (postId: string) => {
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', postId })
      });
      await refreshData();
      speakDecision('Draft approved by account manager. Publisher agent authorized.');
    } catch (err) {
      console.error('Error approving post:', err);
    }
  };

  const handlePublishToSandbox = async (postId: string) => {
    try {
      await fetch('/api/posts', {
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

  const handleRemixPost = async (postId: string, patternName: string) => {
    try {
      await fetch('/api/posts', {
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

  const totalSteps = auditLogs.length || 14;
  const blockedCount = auditLogs.filter(a => a.decision === 'blocked').length;
  const avgVirality = posts.length > 0 
    ? Math.round(posts.reduce((acc, p) => acc + (p.viralityScore || 75), 0) / posts.length)
    : 84;
  const spearman = backtestReport?.spearmanCorrelation || 0.84;

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        {/* Header Controls for Creative Space */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="size-5 text-cyan-400" />
                Creative Space & Multi-Agent Studio
              </span>
              <span className="rounded-full bg-cyan-950/80 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-800/80">
                ArmorIQ Cryptographic Spine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous ad drafting, virality prediction, and Zero-Trust cryptographic policy gating.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? "Mute ElevenLabs Voice" : "Enable ElevenLabs Voice"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {voiceEnabled ? <Volume2 className="size-3.5 text-cyan-400" /> : <VolumeX className="size-3.5 text-slate-500" />}
              <span>{voiceEnabled ? "Voice Feedback ON" : "Muted"}</span>
            </button>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-800/80 bg-cyan-950/60 text-xs text-cyan-300 hover:bg-cyan-900/60 transition"
            >
              <ShieldCheck className="size-3.5" />
              <span>Verify Spine</span>
            </button>
            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Hero KPI Stats */}
        <HeroStats
          totalSteps={totalSteps}
          blockedCount={blockedCount}
          avgViralityScore={avgVirality}
          spearmanCorrelation={spearman}
          onOpenBacktest={() => setIsBacktestOpen(true)}
        />

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start text-xs font-medium">
          <button
            onClick={() => setActiveSection('workspace')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeSection === 'workspace'
                ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="size-3.5" />
            <span>Agent Operations & Drafts</span>
          </button>
          <button
            onClick={() => setActiveSection('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeSection === 'radar'
                ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radar className="size-3.5" />
            <span>Pattern Radar & Trends</span>
          </button>
          <button
            onClick={() => setActiveSection('governance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeSection === 'governance'
                ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="size-3.5" />
            <span>ArmorIQ Cryptographic Audit</span>
          </button>
        </div>

        {/* Tab Panes */}
        {activeSection === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <AgentOperations
                onRunScenario={handleRunScenario}
                isRunning={isRunning}
                latestRun={latestRun}
              />
            </div>
            <div className="lg:col-span-7">
              <WorkspaceDrafts
                posts={posts}
                patterns={patterns}
                onApprovePost={handleApprovePost}
                onPublishToSandbox={handlePublishToSandbox}
                onRemixPost={handleRemixPost}
                onInspectProvenance={(post) => setProvenancePost(post)}
                isLoading={isRunning}
              />
            </div>
          </div>
        )}

        {activeSection === 'radar' && (
          <PatternRadar
            patterns={patterns}
            trends={trends}
            onSelectPattern={(pattern) => {
              setActiveSection('workspace');
              handleRunScenario('custom', `Generate high-virality social post using pattern: ${pattern.name}`);
            }}
          />
        )}

        {activeSection === 'governance' && (
          <ArmorIQGovernanceCenter
            auditLogs={auditLogs}
          />
        )}
      </div>

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
