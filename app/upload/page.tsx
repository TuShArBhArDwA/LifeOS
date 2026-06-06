'use client';

import { useState } from 'react';
import Link from 'next/link';
import UploadZone from '@/components/UploadZone';
import AgentThinking from '@/components/AgentThinking';
import { TasksCard, EventsCard, PlacementCard, RemindersCard } from '@/components/ActionCards';
import {
  AlertCircle, Sparkles, Briefcase, BookOpen,
  Calendar, ArrowLeft, Plus, CheckCircle2,
  ChevronRight, Zap, Target, IndianRupee, TrendingDown, Lightbulb
} from 'lucide-react';
import type { GeneratedTask } from '@/lib/agents/task-agent';
import type { GeneratedEvent } from '@/lib/agents/schedule-agent';
import type { PlacementAgentOutput } from '@/lib/agents/placement-agent';
import type { GeneratedReminder } from '@/lib/agents/reminder-agent';
import type { ExpenseAgentOutput } from '@/lib/agents/expense-agent';

type ProcessingState = 'idle' | 'processing' | 'done' | 'error';

type IntakeResult = {
  orchestrator: { intent: string; summary: string; confidence: number };
  tasks: GeneratedTask[];
  events: GeneratedEvent[];
  placement: PlacementAgentOutput | null;
  reminders: GeneratedReminder[];
  expense: ExpenseAgentOutput | null;
};

const INTENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  placement_notice: { label: 'Placement',    color: 'text-emerald-400', bg: 'bg-emerald-500/12 border-emerald-500/25' },
  assignment:       { label: 'Assignment',   color: 'text-brand-400',   bg: 'bg-brand-500/12 border-brand-500/25' },
  exam:             { label: 'Exam',         color: 'text-red-400',     bg: 'bg-red-500/12 border-red-500/25' },
  timetable:        { label: 'Timetable',    color: 'text-yellow-400',  bg: 'bg-yellow-500/12 border-yellow-500/25' },
  fee_notice:       { label: 'Fee Notice',   color: 'text-orange-400',  bg: 'bg-orange-500/12 border-orange-500/25' },
  expense_receipt:  { label: '💸 Expense',   color: 'text-pink-400',    bg: 'bg-pink-500/12 border-pink-500/25' },
  general:          { label: 'General',      color: 'text-white/50',    bg: 'bg-white/5 border-white/10' },
};

const CATEGORY_COLORS: Record<string, string> = {
  food:          'bg-orange-500/15 text-orange-300 border-orange-500/25',
  transport:     'bg-blue-500/15 text-blue-300 border-blue-500/25',
  books:         'bg-brand-500/15 text-brand-300 border-brand-500/25',
  education:     'bg-purple-500/15 text-purple-300 border-purple-500/25',
  shopping:      'bg-pink-500/15 text-pink-300 border-pink-500/25',
  health:        'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  entertainment: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  other:         'bg-white/5 text-white/40 border-white/10',
};

function ExpenseCard({ expense }: { expense: ExpenseAgentOutput }) {
  return (
    <div className="glass border border-pink-500/20 rounded-3xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center flex-shrink-0">
          <IndianRupee className="w-4.5 h-4.5 text-pink-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">Expense Agent</p>
          <p className="text-sm text-white/70 truncate mt-0.5">{expense.summary}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-white">₹{expense.total.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-white/30">Total</p>
        </div>
      </div>

      <div className="px-5 pb-4 space-y-2">
        {expense.expenses.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-surface-border last:border-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border capitalize flex-shrink-0 ${
                CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other
              }`}>
                {item.category}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{item.merchant}</p>
                <p className="text-[11px] text-white/35 truncate">{item.description}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-white flex-shrink-0">₹{item.amount.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {expense.budget_tip && (
        <div className="mx-5 mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-yellow-500/8 border border-yellow-500/20">
          <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300/80 leading-relaxed">{expense.budget_tip}</p>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [state, setState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState<string>('');

  const isGuest = typeof window !== 'undefined' && (
    localStorage.getItem('lifeos_guest') === 'true' ||
    window.location.search.includes('guest=true')
  );

  const handleUpload = async (file: File | null, text?: string) => {
    setState('processing');
    setError('');
    setResult(null);

    try {
      let body: FormData | string;
      let contentType: string | undefined;

      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        body = fd;
      } else if (text) {
        body = JSON.stringify({ text, inputType: 'text' });
        contentType = 'application/json';
      } else {
        throw new Error('No input provided');
      }

      const headers: Record<string, string> = {};
      if (contentType) {
        headers['Content-Type'] = contentType;
      }
      if (isGuest) {
        headers['x-guest-mode'] = 'true';
      }

      const res = await fetch('/api/intake', {
        method: 'POST',
        body,
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 429 && data.error === 'rate_limited') {
          throw new Error(data.message ?? 'Rate limited — please wait a moment and try again.');
        }
        throw new Error(data.error ?? 'Processing failed');
      }

      const data = await res.json();

      // If guest, store result to localStorage
      if (isGuest && typeof window !== 'undefined') {
        const storedTasks = JSON.parse(localStorage.getItem('lifeos_guest_tasks') || '[]');
        const storedEvents = JSON.parse(localStorage.getItem('lifeos_guest_events') || '[]');
        const storedReminders = JSON.parse(localStorage.getItem('lifeos_guest_reminders') || '[]');
        const storedIntakes = JSON.parse(localStorage.getItem('lifeos_guest_intakes') || '[]');

        // Format and append incoming values
        const formattedTasks = (data.tasks || []).map((t: any, idx: number) => ({
          id: `task_new_${Date.now()}_${idx}`,
          user_id: 'guest_user',
          title: t.title,
          description: t.description,
          priority: t.priority,
          due_date: t.due_date,
          status: 'pending',
          agent_source: t.agent_source || 'task_agent',
          created_at: new Date().toISOString()
        }));

        const formattedEvents = (data.events || []).map((e: any, idx: number) => ({
          id: `event_new_${Date.now()}_${idx}`,
          user_id: 'guest_user',
          title: e.title,
          start_time: e.start_time,
          end_time: e.end_time,
          event_type: e.event_type,
          description: e.description,
          created_at: new Date().toISOString()
        }));

        const formattedReminders = (data.reminders || []).map((r: any, idx: number) => ({
          id: `rem_new_${Date.now()}_${idx}`,
          user_id: 'guest_user',
          message: r.message,
          remind_at: r.remind_at,
          sent: false
        }));

        const newIntake = {
          id: data.intake_id || `intake_new_${Date.now()}`,
          user_id: 'guest_user',
          input_type: file ? 'screenshot' : 'text',
          intent: data.orchestrator?.intent || 'general',
          summary: data.orchestrator?.summary || 'Mock summary',
          raw_extracted: data.orchestrator?.extracted || {},
          created_at: new Date().toISOString()
        };

        localStorage.setItem('lifeos_guest_tasks', JSON.stringify([...formattedTasks, ...storedTasks]));
        localStorage.setItem('lifeos_guest_events', JSON.stringify([...formattedEvents, ...storedEvents]));
        localStorage.setItem('lifeos_guest_reminders', JSON.stringify([...formattedReminders, ...storedReminders]));
        localStorage.setItem('lifeos_guest_intakes', JSON.stringify([newIntake, ...storedIntakes]));
      }

      setResult(data);
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-surface">

      {/* Background orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/6 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-surface-border/50 backdrop-blur-xl bg-surface/80">
        <div className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href={isGuest ? "/dashboard?guest=true" : "/dashboard"}
              id="upload-back-btn"
              className="w-9 h-9 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-semibold text-sm text-white">
                {state === 'done' ? 'Results' : 'Capture'}
              </h1>
              <p className="text-xs text-white/30">
                {state === 'done' ? 'AI agents have finished processing' : 'Screenshot, PDF, text, or voice'}
              </p>
            </div>
          </div>

          {state === 'done' && (
            <button
              id="upload-new-btn"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors font-semibold px-3.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/15"
            >
              <Plus className="w-3.5 h-3.5" />
              New upload
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-8 pb-24">

        {/* ── IDLE ── */}
        {state === 'idle' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-300 border border-brand-500/20 bg-brand-500/8 mb-5">
                <Zap className="w-3.5 h-3.5" />
                5 AI agents ready
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Drop anything.</h2>
              <p className="text-white/40 text-sm">LifeOS reads it and handles everything else.</p>
            </div>

            <UploadZone onUpload={handleUpload} loading={false} />

            {/* Examples */}
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-3 text-center">
                Try an example
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'example-tcs',
                    icon: Briefcase,
                    label: 'Placement notice',
                    sub: 'TCS NQT Drive',
                    color: 'text-emerald-400',
                    bg: 'hover:border-emerald-500/30 hover:bg-emerald-500/5',
                    text: 'TCS NQT Drive — Register by June 7, 2026. Eligibility: 60% aggregate, No active backlogs. Required documents: Updated resume, College ID, 10th & 12th marksheets. Venue: Auditorium A. Reporting time: 9:00 AM.',
                  },
                  {
                    id: 'example-assignment',
                    icon: BookOpen,
                    label: 'Assignment deadline',
                    sub: 'DBMS Mini Project',
                    color: 'text-brand-400',
                    bg: 'hover:border-brand-500/30 hover:bg-brand-500/5',
                    text: 'DBMS Mini Project submission is due this Friday. You need to submit a working prototype + 5-page report to the college portal. Late submissions will not be accepted.',
                  },
                  {
                    id: 'example-exam',
                    icon: Calendar,
                    label: 'Exam schedule',
                    sub: 'End semester exams',
                    color: 'text-red-400',
                    bg: 'hover:border-red-500/30 hover:bg-red-500/5',
                    text: 'End Semester Exams start June 15, 2026. Data Structures: June 15, Operating Systems: June 18, Computer Networks: June 20, DBMS: June 22. Exam time: 10 AM - 1 PM.',
                  },
                  {
                    id: 'example-expense',
                    icon: TrendingDown,
                    label: 'Expense receipt',
                    sub: 'Track spending',
                    color: 'text-pink-400',
                    bg: 'hover:border-pink-500/30 hover:bg-pink-500/5',
                    text: 'Spent today: Canteen lunch ₹80, Auto to college ₹45, Xerox of notes ₹30, Amazon order — DSA book ₹350. Total: ₹505.',
                  },
                ].map((ex) => (
                  <button
                    key={ex.id}
                    id={ex.id}
                    onClick={() => handleUpload(null, ex.text)}
                    className={`group text-left px-4 py-4 glass border border-surface-border rounded-2xl transition-all ${ex.bg} hover:-translate-y-0.5`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <ex.icon className={`w-4 h-4 ${ex.color}`} />
                      <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">{ex.label}</span>
                    </div>
                    <p className="text-[11px] text-white/30">{ex.sub}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-white/20 group-hover:text-white/40 transition-colors font-medium">
                      Try this <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {state === 'processing' && (
          <div className="animate-fade-in">
            <AgentThinking />
          </div>
        )}

        {/* ── ERROR ── */}
        {state === 'error' && (
          <div className="text-center py-16 animate-fade-in flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Something went wrong</h3>
            <p className="text-sm text-white/40 mb-8 max-w-sm mx-auto leading-relaxed">{error}</p>
            <button
              id="error-retry-btn"
              onClick={handleReset}
              className="px-7 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold transition-all hover:shadow-brand hover:scale-105 active:scale-95"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── DONE ── */}
        {state === 'done' && result && (
          <div className="space-y-5 animate-fade-in">

            {/* Summary hero card */}
            <div className="relative rounded-3xl overflow-hidden">
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-brand-500/50 via-transparent to-accent-green/30">
                <div className="w-full h-full rounded-3xl bg-surface-card" />
              </div>
              <div className="absolute top-0 right-0 w-48 h-24 bg-brand-500/10 blur-3xl rounded-full" />

              <div className="relative p-6">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">LifeOS Summary</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {Math.round(result.orchestrator.confidence * 100)}% confidence
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const cfg = INTENT_LABELS[result.orchestrator.intent] ?? INTENT_LABELS.general;
                    return (
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>

                <p className="text-white/85 font-medium leading-relaxed mb-5">
                  {result.orchestrator.summary}
                </p>

                {/* Stat chips */}
                <div className="flex flex-wrap gap-2">
                  {result.tasks.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-xs font-semibold text-brand-400">{result.tasks.length} tasks</span>
                    </div>
                  )}
                  {result.events.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">{result.events.length} events</span>
                    </div>
                  )}
                  {result.reminders.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
                      <Target className="w-3.5 h-3.5 text-accent-purple" />
                      <span className="text-xs font-semibold text-accent-purple">{result.reminders.length} reminders</span>
                    </div>
                  )}
                  {result.placement && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                      result.placement.eligibility.eligible
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {result.placement.eligibility.eligible
                        ? <CheckCircle2 className="w-3.5 h-3.5" />
                        : <AlertCircle className="w-3.5 h-3.5" />
                      }
                      <span className="text-xs font-semibold">
                        {result.placement.eligibility.eligible ? 'Eligible' : 'Not eligible'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Agent output cards */}
            {result.expense && <ExpenseCard expense={result.expense} />}
            <TasksCard tasks={result.tasks} />
            <EventsCard events={result.events} />
            {result.placement && <PlacementCard placement={result.placement} />}
            <RemindersCard reminders={result.reminders} />

            {/* Bottom nav */}
            <div className="flex gap-3 pt-2">
              <button
                id="done-new-upload-btn"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-4 glass border border-surface-border rounded-2xl text-white/50 hover:text-white font-medium text-sm transition-all hover:border-white/15"
              >
                <Plus className="w-4 h-4" />
                New upload
              </button>
              <Link
                href="/dashboard"
                id="done-dashboard-btn"
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-sm text-center transition-all hover:shadow-brand hover:scale-[1.02] active:scale-95"
              >
                View Dashboard
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
