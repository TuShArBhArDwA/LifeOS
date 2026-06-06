'use client';

import { useEffect, useState } from 'react';
import { 
  Eye, 
  Cpu, 
  CheckSquare, 
  Calendar, 
  Target, 
  Bell 
} from 'lucide-react';

type AgentStep = {
  id: string;
  label: string;
  status: 'waiting' | 'active' | 'done';
};

const BASE_STEPS: AgentStep[] = [
  { id: 'intake',       label: 'Intake Agent reading document',       status: 'waiting' },
  { id: 'orchestrator', label: 'Orchestrator routing to agents',      status: 'waiting' },
  { id: 'task',         label: 'Task Agent extracting deadlines',     status: 'waiting' },
  { id: 'schedule',     label: 'Schedule Agent building calendar',    status: 'waiting' },
  { id: 'placement',    label: 'Placement Agent checking eligibility',status: 'waiting' },
  { id: 'reminder',     label: 'Reminder Agent crafting nudges',      status: 'waiting' },
];

function getStepIcon(id: string, status: 'waiting' | 'active' | 'done') {
  const cls = `w-5 h-5 flex-shrink-0 ${
    status === 'active' 
      ? 'text-brand-400' 
      : status === 'done' 
      ? 'text-accent-green' 
      : 'text-white/30'
  }`;

  switch (id) {
    case 'intake':
      return <Eye className={cls} />;
    case 'orchestrator':
      return <Cpu className={cls} />;
    case 'task':
      return <CheckSquare className={cls} />;
    case 'schedule':
      return <Calendar className={cls} />;
    case 'placement':
      return <Target className={cls} />;
    case 'reminder':
      return <Bell className={cls} />;
    default:
      return null;
  }
}

type AgentThinkingProps = {
  intent?: string;
};

export default function AgentThinking({ intent }: AgentThinkingProps) {
  const [phase, setPhase] = useState(0);

  // Map steps dynamically based on current phase to show parallel processing
  const steps = BASE_STEPS.map((step) => {
    let status: 'waiting' | 'active' | 'done' = 'waiting';

    if (step.id === 'intake') {
      if (phase === 0) status = 'active';
      else status = 'done';
    } else if (step.id === 'orchestrator') {
      if (phase === 0) status = 'waiting';
      else if (phase === 1) status = 'active';
      else status = 'done';
    } else {
      // Parallel execution for tasks, schedule, placement, reminder
      if (phase < 2) status = 'waiting';
      else if (phase === 2) status = 'active';
      else status = 'done';
    }

    return { ...step, status };
  });

  // Filter steps based on intent
  const visibleSteps =
    intent && intent !== 'placement_notice'
      ? steps.filter((s) => s.id !== 'placement')
      : steps;

  useEffect(() => {
    if (phase >= 3) return;

    const durations = [600, 1000, 1500];
    const timer = setTimeout(() => {
      setPhase((p) => p + 1);
    }, durations[phase]);

    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4">
      {/* Header with active logo wave animation */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-2xl bg-brand-500/10 animate-ping opacity-50" />
          <div className="absolute -inset-1.5 rounded-2xl border border-brand-500/20 animate-pulse opacity-80" />
          <div className="relative w-14 h-14 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center p-2.5">
            <img src="/favicon.png" alt="LifeOS" className="w-full h-full object-contain" />
          </div>
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
            {/* SVG Icon */}
            {getStepIcon(step.id, step.status)}

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
        Powered by Gemini 3.5 Flash + Groq
      </p>
    </div>
  );
}
