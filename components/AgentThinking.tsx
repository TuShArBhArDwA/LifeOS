'use client';

import { useEffect, useState } from 'react';

type AgentStep = {
  id: string;
  label: string;
  emoji: string;
  status: 'waiting' | 'active' | 'done';
};

type AgentThinkingProps = {
  intent?: string;
};

const BASE_STEPS: AgentStep[] = [
  { id: 'intake',       label: 'Intake Agent reading document',       emoji: '👁️',  status: 'waiting' },
  { id: 'orchestrator', label: 'Orchestrator routing to agents',      emoji: '🧠',  status: 'waiting' },
  { id: 'task',         label: 'Task Agent extracting deadlines',     emoji: '📋',  status: 'waiting' },
  { id: 'schedule',     label: 'Schedule Agent building calendar',    emoji: '📅',  status: 'waiting' },
  { id: 'placement',    label: 'Placement Agent checking eligibility',emoji: '🎯',  status: 'waiting' },
  { id: 'reminder',     label: 'Reminder Agent crafting nudges',      emoji: '🔔',  status: 'waiting' },
];

export default function AgentThinking({ intent }: AgentThinkingProps) {
  const [steps, setSteps] = useState<AgentStep[]>(BASE_STEPS);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Filter steps based on intent
  const visibleSteps =
    intent && intent !== 'placement_notice'
      ? steps.filter((s) => s.id !== 'placement')
      : steps;

  useEffect(() => {
    if (currentIdx >= visibleSteps.length) return;

    const timer = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) => {
          const idx = visibleSteps.findIndex((vs) => vs.id === s.id);
          if (idx === currentIdx) return { ...s, status: 'active' };
          if (idx < currentIdx) return { ...s, status: 'done' };
          return s;
        })
      );
      setCurrentIdx((i) => i + 1);
    }, currentIdx === 0 ? 400 : 900);

    return () => clearTimeout(timer);
  }, [currentIdx, visibleSteps.length]);

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-brand-500/30 animate-pulse" />
          <span className="relative text-2xl">🤖</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Agents collaborating</h3>
        <p className="text-sm text-white/40 mt-1">Processing your document...</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {visibleSteps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
              step.status === 'active'
                ? 'bg-brand-500/10 border-brand-500/40 shadow-brand'
                : step.status === 'done'
                ? 'bg-surface-elevated border-accent-green/20 opacity-70'
                : 'bg-surface-card border-surface-border opacity-40'
            }`}
          >
            {/* Icon */}
            <span className="text-xl w-8 text-center">{step.emoji}</span>

            {/* Label */}
            <span
              className={`flex-1 text-sm font-medium ${
                step.status === 'active'
                  ? 'text-white'
                  : step.status === 'done'
                  ? 'text-white/60'
                  : 'text-white/30'
              }`}
            >
              {step.label}
              {step.status === 'active' && (
                <span className="inline-flex gap-0.5 ml-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-brand-400 animate-bounce-soft"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              )}
            </span>

            {/* Status indicator */}
            <div className="w-5 h-5 flex items-center justify-center">
              {step.status === 'done' && (
                <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {step.status === 'active' && (
                <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
              )}
              {step.status === 'waiting' && (
                <div className="w-3 h-3 rounded-full bg-surface-border" />
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-white/25 mt-6 font-mono">
        Powered by Gemini 2.0 Flash + Groq
      </p>
    </div>
  );
}
