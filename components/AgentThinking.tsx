'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, Cpu, CheckSquare, Calendar, Target, Bell, Receipt, BookOpen, FileEdit, Loader2 } from 'lucide-react';

const FINALIZING_MSGS = [
  'Compiling results…',
  'Structuring your tasks…',
  'Building timeline…',
  'Crafting smart reminders…',
  'Formatting your summary…',
  'Almost ready…',
];

/* ─── Phase timeline ───────────────────────────────────────────────────────
   0 → intake active                          2 500 ms
   1 → orchestrator active                    2 000 ms
   2 → all parallel agents start (active)     1 800 ms
   3 → Task Agent done                        1 500 ms
   4 → Schedule Agent done                    1 400 ms
   5 → Placement Agent done                   1 300 ms
   6 → Reminder Agent done                    1 200 ms
   7 → Expense Agent done                     1 100 ms
   8 → Study Agent done                       1 000 ms
   9 → Content Agent done → all complete
─────────────────────────────────────────────────────────────────────────── */
const DURATIONS = [2500, 2000, 1800, 1500, 1400, 1300, 1200, 1100, 1000];
const TOTAL_PHASES = 9;

// Which phase each parallel agent finishes at
const PARALLEL_DONE_AT: Record<string, number> = {
  task:      3,
  schedule:  4,
  placement: 5,
  reminder:  6,
  expense:   7,
  study:     8,
  content:   9,
};

function resolveStatus(id: string, phase: number): 'waiting' | 'active' | 'done' {
  if (id === 'intake') return phase === 0 ? 'active' : 'done';
  if (id === 'orchestrator') {
    if (phase === 1) return 'active';
    if (phase > 1)  return 'done';
    return 'waiting';
  }
  const doneAt = PARALLEL_DONE_AT[id];
  if (phase >= doneAt) return 'done';
  if (phase >= 2)      return 'active';
  return 'waiting';
}

/* ─── Icon helper ────────────────────────────────────────────────────────── */
function StepIcon({ id, status }: { id: string; status: 'waiting' | 'active' | 'done' }) {
  const cls = `w-5 h-5 flex-shrink-0 transition-colors duration-500 ${
    status === 'active' ? 'text-brand-400'
    : status === 'done' ? 'text-white/25'
    : 'text-white/15'
  }`;
  switch (id) {
    case 'intake':       return <Eye className={cls} />;
    case 'orchestrator': return <Cpu className={cls} />;
    case 'task':         return <CheckSquare className={cls} />;
    case 'schedule':     return <Calendar className={cls} />;
    case 'placement':    return <Target className={cls} />;
    case 'reminder':     return <Bell className={cls} />;
    case 'expense':      return <Receipt className={cls} />;
    case 'study':        return <BookOpen className={cls} />;
    case 'content':      return <FileEdit className={cls} />;
    default:             return null;
  }
}

/* ─── Status dot / check ─────────────────────────────────────────────────── */
function StatusDot({ status }: { status: 'waiting' | 'active' | 'done' }) {
  if (status === 'done') {
    return (
      <svg className="w-4 h-4 text-accent-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === 'active') {
    return <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />;
  }
  return <div className="w-2 h-2 rounded-full bg-white/10 flex-shrink-0" />;
}

/* ─── Main component ─────────────────────────────────────────────────────── */
type AgentThinkingProps = { intent?: string; onComplete?: () => void };

export default function AgentThinking({ intent, onComplete }: AgentThinkingProps) {
  const [phase, setPhase] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const msgTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase >= TOTAL_PHASES) {
      if (onComplete) {
        const timer = setTimeout(onComplete, 1200);
        return () => clearTimeout(timer);
      }
      return;
    }
    const timer = setTimeout(() => setPhase((p) => p + 1), DURATIONS[phase]);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  // Once all done, cycle through finalizing messages
  const allDone = phase >= TOTAL_PHASES;
  useEffect(() => {
    if (!allDone) return;
    msgTimer.current = setInterval(() => {
      setMsgIndex((i) => (i + 1) % FINALIZING_MSGS.length);
    }, 1800);
    return () => { if (msgTimer.current) clearInterval(msgTimer.current); };
  }, [allDone]);

  const ALL_IDS = ['intake', 'orchestrator', 'task', 'schedule', 'placement', 'reminder', 'expense', 'study', 'content'];

  const visibleIds =
    intent && intent !== 'placement_notice'
      ? ALL_IDS.filter((id) => id !== 'placement')
      : ALL_IDS;

  const LABELS: Record<string, string> = {
    intake:       'Intake Agent reading document',
    orchestrator: 'Orchestrator routing to agents',
    task:         'Task Agent extracting deadlines',
    schedule:     'Schedule Agent building calendar',
    placement:    'Placement Agent checking eligibility',
    reminder:     'Reminder Agent crafting nudges',
    expense:      'Expense Agent parsing receipts',
    study:        'Study Agent building study plan',
    content:      'Content Agent drafting messages',
  };

  const steps = visibleIds.map((id) => ({
    id,
    label: LABELS[id],
    status: resolveStatus(id, phase),
  }));

  const sequential = steps.filter((s) => ['intake', 'orchestrator'].includes(s.id));
  const parallel   = steps.filter((s) => !['intake', 'orchestrator'].includes(s.id));

  const progressPct   = Math.round((phase / TOTAL_PHASES) * 100);
  const parallelDone  = parallel.filter((s) => s.status === 'done').length;
  const parallelTotal = parallel.length;

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-6">

      {/* ── Logo + title ── */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-5">
          <div className="absolute inset-0 rounded-2xl bg-brand-500/10 animate-ping opacity-40" />
          <div className="absolute -inset-2 rounded-2xl border border-brand-500/20 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-surface-card border border-white/8 flex items-center justify-center p-3">
            <img src="/favicon.png" alt="LifeOS" className="w-full h-full object-contain" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white tracking-tight">Agents collaborating</h3>
        <p className="text-sm text-white/35 mt-1">Processing across {parallelTotal} parallel pipelines</p>
      </div>

      {/* ── Overall progress bar / Finalizing ticker ── */}
      <div className="mb-7">
        {!allDone ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40 font-medium">Overall progress</span>
              <span className="text-xs font-semibold text-brand-400 tabular-nums">{progressPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-1000 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/40 font-medium">Overall progress</span>
              <span className="text-xs font-semibold text-accent-green tabular-nums">100%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-accent-green/60 to-accent-green transition-all duration-700" />
            </div>
            <div className="flex items-center gap-3 mt-2 px-4 py-3.5 rounded-2xl border border-brand-500/15 bg-brand-500/5">
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin flex-shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p key={msgIndex} className="text-sm font-medium text-white/70 animate-fade-slide-in">
                  {FINALIZING_MSGS[msgIndex]}
                </p>
              </div>
              <div className="flex gap-1">
                {FINALIZING_MSGS.map((_, k) => (
                  <div
                    key={k}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      k === msgIndex ? 'w-4 bg-brand-400' : 'w-1 bg-white/15'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sequential agents (intake + orchestrator) ── */}
      <div className="space-y-2.5 mb-5">
        {sequential.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-700 ${
              step.status === 'active'  ? 'bg-brand-500/8 border-brand-500/25'
              : step.status === 'done' ? 'bg-surface-elevated/20 border-surface-border opacity-45'
              : 'bg-surface-card border-surface-border opacity-20'
            }`}
          >
            <StepIcon id={step.id} status={step.status} />
            <span className={`flex-1 text-sm font-medium transition-all duration-500 ${
              step.status === 'active' ? 'text-white'
              : step.status === 'done' ? 'text-white/30 line-through decoration-white/20'
              : 'text-white/20'
            }`}>
              {step.label}
            </span>
            <StatusDot status={step.status} />
          </div>
        ))}
      </div>

      {/* ── Parallel divider ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-[10px] text-white/25 uppercase tracking-widest font-medium">parallel execution</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      {/* ── Parallel agents — 3-column grid for all 7 ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {parallel.map((step, i) => {
          const isActive = step.status === 'active';
          const isDone   = step.status === 'done';
          return (
            <div
              key={step.id}
              className={`flex flex-col gap-2.5 p-3.5 rounded-2xl border transition-all duration-700 ${
                isActive ? 'bg-brand-500/8 border-brand-500/25'
                : isDone  ? 'bg-surface-elevated/20 border-surface-border opacity-45'
                : 'bg-surface-card border-surface-border opacity-20'
              }`}
            >
              <div className="flex items-center justify-between">
                <StepIcon id={step.id} status={step.status} />
                <StatusDot status={step.status} />
              </div>

              <p className={`text-[11px] font-medium leading-snug transition-all duration-500 ${
                isActive ? 'text-white/90'
                : isDone  ? 'text-white/25 line-through decoration-white/15'
                : 'text-white/15'
              }`}>
                {step.label}
              </p>

              {(isActive || isDone) && (
                <div className="h-0.5 w-full bg-surface-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-[1800ms] ease-out ${
                      isDone ? 'bg-accent-green/50 w-full' : 'bg-brand-500/60'
                    }`}
                    style={isActive ? {
                      width: '85%',
                      transition: `width ${DURATIONS[2 + i] ?? 1400}ms ease-out`,
                    } : undefined}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Completion summary ── */}
      {phase >= 2 && (
        <p className="text-center text-xs text-white/30 mt-5 font-medium tabular-nums">
          {parallelDone} of {parallelTotal} agents complete
        </p>
      )}

    </div>
  );
}
