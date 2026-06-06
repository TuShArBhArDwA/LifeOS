'use client';

import { useState } from 'react';
import Link from 'next/link';
import UploadZone from '@/components/UploadZone';
import AgentThinking from '@/components/AgentThinking';
import { TasksCard, EventsCard, PlacementCard, RemindersCard } from '@/components/ActionCards';
import {
  AlertCircle, Sparkles, Briefcase, BookOpen,
  Calendar, ArrowLeft, Plus, CheckCircle2,
  ChevronRight, Zap, Target, IndianRupee, TrendingDown, Lightbulb,
  Brain, FileEdit, Copy, Check, X, ArrowRight
} from 'lucide-react';
import type { GeneratedTask } from '@/lib/agents/task-agent';
import type { GeneratedEvent } from '@/lib/agents/schedule-agent';
import type { PlacementAgentOutput } from '@/lib/agents/placement-agent';
import type { GeneratedReminder } from '@/lib/agents/reminder-agent';
import type { ExpenseAgentOutput } from '@/lib/agents/expense-agent';
import type { StudyAgentOutput } from '@/lib/agents/study-agent';
import type { ContentAgentOutput } from '@/lib/agents/content-agent';

type ProcessingState = 'idle' | 'processing' | 'done' | 'error';

type IntakeResult = {
  orchestrator: { intent: string; summary: string; confidence: number };
  tasks: GeneratedTask[];
  events: GeneratedEvent[];
  placement: PlacementAgentOutput | null;
  reminders: GeneratedReminder[];
  expense: ExpenseAgentOutput | null;
  study: StudyAgentOutput | null;
  content: ContentAgentOutput | null;
};

const INTENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  placement_notice: { label: 'Placement',   color: 'text-emerald-400', bg: 'bg-emerald-500/12 border-emerald-500/25' },
  assignment:       { label: 'Assignment',  color: 'text-brand-400',   bg: 'bg-brand-500/12 border-brand-500/25' },
  exam:             { label: 'Exam',        color: 'text-red-400',     bg: 'bg-red-500/12 border-red-500/25' },
  timetable:        { label: 'Timetable',   color: 'text-yellow-400',  bg: 'bg-yellow-500/12 border-yellow-500/25' },
  fee_notice:       { label: 'Fee Notice',  color: 'text-orange-400',  bg: 'bg-orange-500/12 border-orange-500/25' },
  expense_receipt:  { label: 'Expense',     color: 'text-pink-400',    bg: 'bg-pink-500/12 border-pink-500/25' },
  study_notes:      { label: 'Study Kit',   color: 'text-violet-400',  bg: 'bg-violet-500/12 border-violet-500/25' },
  content_request:  { label: 'Draft Ready', color: 'text-cyan-400',    bg: 'bg-cyan-500/12 border-cyan-500/25' },
  general:          { label: 'General',     color: 'text-white/50',    bg: 'bg-white/5 border-white/10' },
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

/* ── EXAMPLE CARDS ── */
const EXAMPLES = [
  {
    id: 'example-all',
    icon: Sparkles,
    label: 'Multi-Agent Mega Demo',
    sub: 'All 7 agents in one shot',
    color: 'text-yellow-300',
    iconBg: 'bg-yellow-500/15',
    border: 'border-yellow-500/25 hover:border-yellow-500/50',
    bg: 'bg-yellow-950/30 hover:bg-yellow-950/50',
    glow: 'hover:shadow-[0_8px_30px_rgba(234,179,8,0.12)]',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    badgeText: 'Featured',
    text: `ALERT: TCS NQT campus placement notice received! Registration deadline: June 9, 2026. Venue: Auditorium B at 10:00 AM. Eligibility requirements: Minimum 6.5 CGPA, no active backlogs. Documents needed: Resume draft, Marks card.\n\nLet's also summarize the required placement study topics: "Aptitude consists of Quantitative reasoning, logical puzzles, and verbal sections. DBMS study requires understanding SQL Joins, Indexing, Normalization (1NF to BCNF), and ACID properties."\n\nLastly, spent ₹120 for HOD signatures travel auto fare and Xerox printouts. Draft a request letter to the HOD for NOC certificate to attend the campus drive on June 12.`,
  },
  {
    id: 'example-tcs',
    icon: Briefcase,
    label: 'Placement notice',
    sub: 'TCS NQT Drive',
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/12',
    border: 'border-white/6 hover:border-emerald-500/30',
    bg: 'bg-zinc-900/60 hover:bg-zinc-800/60',
    glow: 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
    badge: null,
    badgeText: null,
    text: 'TCS NQT Drive — Register by June 7, 2026. Eligibility: 60% aggregate, No active backlogs. Required documents: Updated resume, College ID, 10th & 12th marksheets. Venue: Auditorium A. Reporting time: 9:00 AM.',
  },
  {
    id: 'example-assignment',
    icon: BookOpen,
    label: 'Assignment deadline',
    sub: 'DBMS Mini Project',
    color: 'text-brand-400',
    iconBg: 'bg-brand-500/12',
    border: 'border-white/6 hover:border-brand-500/30',
    bg: 'bg-zinc-900/60 hover:bg-zinc-800/60',
    glow: 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
    badge: null,
    badgeText: null,
    text: 'DBMS Mini Project submission is due this Friday. You need to submit a working prototype + 5-page report to the college portal. Late submissions will not be accepted.',
  },
  {
    id: 'example-exam',
    icon: Calendar,
    label: 'Exam schedule',
    sub: 'End semester exams',
    color: 'text-red-400',
    iconBg: 'bg-red-500/12',
    border: 'border-white/6 hover:border-red-500/30',
    bg: 'bg-zinc-900/60 hover:bg-zinc-800/60',
    glow: 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
    badge: null,
    badgeText: null,
    text: 'End Semester Exams start June 15, 2026. Data Structures: June 15, Operating Systems: June 18, Computer Networks: June 20, DBMS: June 22. Exam time: 10 AM - 1 PM.',
  },
  {
    id: 'example-expense',
    icon: TrendingDown,
    label: 'Expense receipt',
    sub: 'Track spending',
    color: 'text-pink-400',
    iconBg: 'bg-pink-500/12',
    border: 'border-white/6 hover:border-pink-500/30',
    bg: 'bg-zinc-900/60 hover:bg-zinc-800/60',
    glow: 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
    badge: null,
    badgeText: null,
    text: 'Spent today: Canteen lunch ₹80, Auto to college ₹45, Xerox of notes ₹30, Amazon order — DSA book ₹350. Total: ₹505.',
  },
  {
    id: 'example-study',
    icon: Brain,
    label: 'Study notes',
    sub: 'Process Scheduling',
    color: 'text-violet-400',
    iconBg: 'bg-violet-500/12',
    border: 'border-white/6 hover:border-violet-500/30',
    bg: 'bg-zinc-900/60 hover:bg-zinc-800/60',
    glow: 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
    badge: null,
    badgeText: null,
    text: 'CPU Scheduling Notes: Scheduling is the process of deciding which process gets CPU time. Preemptive scheduling allows interrupting a process mid-execution (e.g. Round Robin, SRTF), while Non-Preemptive runs until done (e.g. FCFS, SJF). Gantt charts are used to calculate average waiting time and turnaround time. Turnaround Time = Completion Time - Arrival Time. Waiting Time = Turnaround Time - Burst Time.',
  },
  {
    id: 'example-content',
    icon: FileEdit,
    label: 'Content request',
    sub: 'Leave application',
    color: 'text-cyan-400',
    iconBg: 'bg-cyan-500/12',
    border: 'border-white/6 hover:border-cyan-500/30',
    bg: 'bg-zinc-900/60 hover:bg-zinc-800/60',
    glow: 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
    badge: null,
    badgeText: null,
    text: "Draft a leave application to the HOD of CSE department requesting 2 days of leave (June 8th and 9th) because I have to travel out of station for a cousin's wedding.",
  },
];

/* ── EXPENSE CARD ── */
function ExpenseCard({ expense }: { expense: ExpenseAgentOutput }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-pink-500/20 bg-zinc-900/80">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(236,72,153,0.15)]">
          <IndianRupee className="w-4.5 h-4.5 text-pink-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Expense Agent</p>
          <p className="text-sm text-white/70 truncate mt-0.5">{expense.summary}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-black text-white">₹{expense.total.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-white/25 mt-0.5">Total</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-2.5">
        {expense.expenses.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-white/4 last:border-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border capitalize flex-shrink-0 ${
                CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other
              }`}>
                {item.category}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{item.merchant}</p>
                <p className="text-[11px] text-white/30 truncate">{item.description}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-white flex-shrink-0">₹{item.amount.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {expense.budget_tip && (
        <div className="mx-5 mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-yellow-500/8 border border-yellow-500/15">
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
      if (contentType) headers['Content-Type'] = contentType;
      if (isGuest) headers['x-guest-mode'] = 'true';

      const res = await fetch('/api/intake', { method: 'POST', body, headers });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 429 && data.error === 'rate_limited') {
          throw new Error(data.message ?? 'Rate limited — please wait a moment.');
        }
        throw new Error(data.error ?? 'Processing failed');
      }

      const data = await res.json();

      if (isGuest && typeof window !== 'undefined') {
        const storedTasks     = JSON.parse(localStorage.getItem('lifeos_guest_tasks')     || '[]');
        const storedEvents    = JSON.parse(localStorage.getItem('lifeos_guest_events')    || '[]');
        const storedReminders = JSON.parse(localStorage.getItem('lifeos_guest_reminders') || '[]');
        const storedIntakes   = JSON.parse(localStorage.getItem('lifeos_guest_intakes')   || '[]');

        const formattedTasks = (data.tasks || []).map((t: any, idx: number) => ({
          id: `task_new_${Date.now()}_${idx}`,
          user_id: 'guest_user', title: t.title, description: t.description,
          priority: t.priority, due_date: t.due_date, status: 'pending',
          agent_source: t.agent_source || 'task_agent',
          created_at: new Date().toISOString()
        }));

        const formattedEvents = (data.events || []).map((e: any, idx: number) => ({
          id: `event_new_${Date.now()}_${idx}`,
          user_id: 'guest_user', title: e.title, start_time: e.start_time,
          end_time: e.end_time, event_type: e.event_type, description: e.description,
          created_at: new Date().toISOString()
        }));

        const formattedReminders = (data.reminders || []).map((r: any, idx: number) => ({
          id: `rem_new_${Date.now()}_${idx}`,
          user_id: 'guest_user', message: r.message, remind_at: r.remind_at, sent: false
        }));

        const newIntake = {
          id: data.intake_id || `intake_new_${Date.now()}`,
          user_id: 'guest_user',
          input_type: file ? 'screenshot' : 'text',
          intent: data.orchestrator?.intent || 'general',
          summary: data.orchestrator?.summary || 'Mock summary',
          raw_extracted: data.orchestrator?.extracted || {},
          placement: data.placement || null,
          expense: data.expense || null,
          study: data.study || null,
          content: data.content || null,
          created_at: new Date().toISOString()
        };

        localStorage.setItem('lifeos_guest_tasks',     JSON.stringify([...formattedTasks,     ...storedTasks]));
        localStorage.setItem('lifeos_guest_events',    JSON.stringify([...formattedEvents,    ...storedEvents]));
        localStorage.setItem('lifeos_guest_reminders', JSON.stringify([...formattedReminders, ...storedReminders]));
        localStorage.setItem('lifeos_guest_intakes',   JSON.stringify([newIntake,              ...storedIntakes]));
      }

      setResult(data);
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  };

  const handleReset = () => { setState('idle'); setResult(null); setError(''); };

  return (
    <div className="min-h-screen bg-[#07070a]">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.022]"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-white/5 backdrop-blur-2xl"
        style={{ background: 'rgba(7,7,10,0.80)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href={isGuest ? "/dashboard?guest=true" : "/dashboard"}
              id="upload-back-btn"
              className="w-9 h-9 rounded-xl bg-white/5 border border-zinc-800/80 flex items-center justify-center text-white/40 hover:text-white hover:border-zinc-700 hover:bg-white/8 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bold text-sm text-white">
                {state === 'done' ? 'Results' : 'Capture'}
              </h1>
              <p className="text-[11px] text-white/30">
                {state === 'done' ? 'AI agents finished processing' : 'Screenshot · PDF · Text · Voice'}
              </p>
            </div>
          </div>

          {state === 'done' && (
            <button
              id="upload-new-btn"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-white transition-colors font-bold px-3.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">

        {/* ── IDLE ── */}
        {state === 'idle' && (
          <div className="space-y-8 animate-fade-in">

            {/* Hero */}
            <div className="text-center space-y-4">
              {/* Agent badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-brand-300 border border-brand-500/25 bg-brand-500/8">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                7 AI agents ready
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Drop anything.</h2>
                <p className="text-white/35 text-sm mt-2 leading-relaxed">
                  LifeOS reads it and routes it to the right agents instantly.
                </p>
              </div>
            </div>

            <UploadZone onUpload={handleUpload} loading={false} />

            {/* Examples */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-white/5" />
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-bold">Try an example</p>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Featured example (full width) */}
              {(() => {
                const FeaturedIcon = EXAMPLES[0].icon;
                return (
                  <button
                    id={EXAMPLES[0].id}
                    onClick={() => handleUpload(null, EXAMPLES[0].text)}
                    className={`w-full group text-left p-4 rounded-2xl border transition-all duration-200 mb-3
                      ${EXAMPLES[0].border} ${EXAMPLES[0].bg} ${EXAMPLES[0].glow} hover:-translate-y-0.5`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl ${EXAMPLES[0].iconBg} border border-yellow-500/20 flex items-center justify-center flex-shrink-0`}>
                        <FeaturedIcon className={`w-5 h-5 ${EXAMPLES[0].color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white group-hover:text-yellow-200 transition-colors">{EXAMPLES[0].label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${EXAMPLES[0].badge}`}>{EXAMPLES[0].badgeText}</span>
                        </div>
                        <p className="text-xs text-white/35 mt-0.5">{EXAMPLES[0].sub}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${EXAMPLES[0].color} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                    </div>
                    <p className="text-[11px] text-white/30 line-clamp-2 pl-12">
                      Placement + study notes + expense + leave letter — all at once
                    </p>
                  </button>
                );
              })()}

              {/* Grid of remaining examples */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {EXAMPLES.slice(1).map((ex) => {
                  const ExampleIcon = ex.icon;
                  return (
                    <button
                      key={ex.id}
                      id={ex.id}
                      onClick={() => handleUpload(null, ex.text)}
                      className={`group text-left p-3.5 rounded-2xl border transition-all duration-200 ${ex.border} ${ex.bg} ${ex.glow} hover:-translate-y-0.5`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${ex.iconBg} border border-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <ExampleIcon className={`w-4 h-4 ${ex.color}`} />
                      </div>
                      <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors leading-snug">{ex.label}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{ex.sub}</p>
                      <div className="flex items-center gap-1 mt-2.5 text-[10px] text-white/20 group-hover:text-white/50 transition-colors font-semibold">
                        Try <ChevronRight className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
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
          <div className="text-center py-20 animate-fade-in flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-3xl bg-red-500/10 blur-xl" />
              <div className="relative w-20 h-20 rounded-3xl bg-red-950/50 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-red-400" />
              </div>
            </div>
            <h3 className="font-black text-white text-xl mb-2">Something went wrong</h3>
            <p className="text-sm text-white/40 mb-8 max-w-sm mx-auto leading-relaxed">{error}</p>
            <button
              id="error-retry-btn"
              onClick={handleReset}
              className="px-8 py-3.5 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
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
              {/* Gradient border shell */}
              <div className="absolute inset-0 rounded-3xl p-[1px]"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.5) 0%, rgba(139,92,246,0.3) 50%, rgba(16,185,129,0.3) 100%)' }}>
                <div className="w-full h-full rounded-3xl"
                  style={{ background: 'linear-gradient(135deg, rgba(12,12,18,0.98) 0%, rgba(10,10,16,0.99) 100%)' }} />
              </div>

              {/* Glow */}
              <div className="absolute top-0 right-0 w-48 h-32 blur-3xl rounded-full"
                style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />

              <div className="relative p-6">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">LifeOS Analysis</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {Math.round(result.orchestrator.confidence * 100)}% confidence
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const cfg = INTENT_LABELS[result.orchestrator.intent] ?? INTENT_LABELS.general;
                    return (
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>

                <p className="text-white/85 font-medium leading-relaxed mb-5 text-[15px]">
                  {result.orchestrator.summary}
                </p>

                {/* Stat chips */}
                <div className="flex flex-wrap gap-2">
                  {result.tasks.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-xs font-bold text-brand-400">{result.tasks.length} tasks</span>
                    </div>
                  )}
                  {result.events.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">{result.events.length} events</span>
                    </div>
                  )}
                  {result.reminders.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <Target className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-bold text-purple-400">{result.reminders.length} reminders</span>
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
                      <span className="text-xs font-bold">
                        {result.placement.eligibility.eligible ? 'Eligible' : 'Not eligible'}
                      </span>
                    </div>
                  )}
                  {result.expense && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <IndianRupee className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs font-bold text-pink-400">₹{result.expense.total.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Agent output cards */}
            {result.expense   && <ExpenseCard expense={result.expense} />}
            {result.study     && <StudyCard study={result.study} />}
            {result.content   && <ContentCard content={result.content} />}
            <TasksCard tasks={result.tasks} />
            <EventsCard events={result.events} />
            {result.placement && <PlacementCard placement={result.placement} />}
            <RemindersCard reminders={result.reminders} />

            {/* Bottom nav */}
            <div className="flex gap-3 pt-2">
              <button
                id="done-new-upload-btn"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 rounded-2xl text-white/50 hover:text-white font-semibold text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                New upload
              </button>
              <Link
                href={isGuest ? "/dashboard?guest=true" : "/dashboard"}
                id="done-dashboard-btn"
                className="flex-1 flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-bold text-sm text-center transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_24px_rgba(59,130,246,0.3)]"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
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

/* ══════════════════════════════════════════════════════════════════════
   STUDY CARD
══════════════════════════════════════════════════════════════════════ */
function StudyCard({ study }: { study: StudyAgentOutput }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const [cardIdx, setCardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const activeCard = study.flashcards[cardIdx];

  const handleNextCard = () => { setShowAnswer(false); setCardIdx((p) => (p + 1) % study.flashcards.length); };
  const handlePrevCard = () => { setShowAnswer(false); setCardIdx((p) => (p - 1 + study.flashcards.length) % study.flashcards.length); };

  const TAB_STYLES = {
    active: 'border-violet-500 text-violet-400 font-black',
    inactive: 'border-transparent text-white/35 hover:text-white/60',
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-violet-500/20 bg-zinc-900/80">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.15)]">
          <Brain className="w-4.5 h-4.5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Study Agent</p>
          <p className="text-sm text-white font-bold truncate mt-0.5">{study.subject}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-5">
        {(['summary', 'flashcards', 'quiz'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-xs font-semibold uppercase tracking-widest border-b-2 px-4 transition-colors ${
              activeTab === tab ? TAB_STYLES.active : TAB_STYLES.inactive
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="p-5 min-h-[200px]">
        {activeTab === 'summary' && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-3">Key Highlights</h4>
            <ul className="space-y-3">
              {study.summary_points.map((pt, i) => (
                <li key={i} className="flex gap-3 items-start text-sm text-white/80 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'flashcards' && study.flashcards.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-full bg-zinc-800/60 border border-zinc-800 rounded-2xl p-6 min-h-[160px] flex flex-col justify-between items-center text-center relative overflow-hidden">
              <span className="text-[10px] text-white/20 font-mono absolute top-3 left-4">
                {cardIdx + 1} / {study.flashcards.length}
              </span>
              <div className="my-auto py-4 w-full">
                {!showAnswer
                  ? <p className="text-sm font-semibold text-white">{activeCard.question}</p>
                  : <p className="text-sm text-violet-300 font-medium animate-fade-in">{activeCard.answer}</p>
                }
              </div>
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="mt-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 px-4 py-1.5 rounded-xl border border-violet-500/20"
              >
                {showAnswer ? 'Show Question' : 'Reveal Answer'}
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handlePrevCard} className="px-4 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/8 text-white transition-colors font-semibold">← Prev</button>
              <button onClick={handleNextCard} className="px-4 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/8 text-white transition-colors font-semibold">Next →</button>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && study.quiz.length > 0 && (
          <div className="space-y-6">
            {study.quiz.map((q, qIdx) => (
              <div key={qIdx} className="space-y-2 pb-5 border-b border-white/5 last:border-0 last:pb-0">
                <p className="text-sm text-white font-semibold">{qIdx + 1}. {q.question}</p>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[qIdx] === oIdx;
                    const isCorrect  = q.correct === oIdx;
                    let btnStyle = 'border-zinc-800 bg-zinc-800/40 text-white/65 hover:bg-zinc-800/60';
                    if (showResults) {
                      if (isCorrect) btnStyle = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
                      else if (isSelected) btnStyle = 'border-red-500/40 bg-red-500/10 text-red-300';
                    } else if (isSelected) {
                      btnStyle = 'border-violet-500/50 bg-violet-500/12 text-violet-300';
                    }
                    return (
                      <button
                        key={oIdx}
                        disabled={showResults}
                        onClick={() => setSelectedAnswers((p) => ({ ...p, [qIdx]: oIdx }))}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {showResults && isCorrect  && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        {showResults && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-red-400" />}
                      </button>
                    );
                  })}
                </div>
                {showResults && (
                  <p className="text-[11px] text-white/40 bg-white/4 p-2.5 rounded-xl border border-zinc-800/60 mt-2 animate-fade-in leading-relaxed">
                    <strong className="text-violet-400">Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              {!showResults ? (
                <button
                  disabled={Object.keys(selectedAnswers).length < study.quiz.length}
                  onClick={() => setShowResults(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all shadow-[0_0_16px_rgba(139,92,246,0.25)]"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => { setSelectedAnswers({}); setShowResults(false); }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/8 text-white transition-colors"
                >
                  Reset Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {study.study_tip && (
        <div className="mx-5 mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-violet-500/8 border border-violet-500/15">
          <Lightbulb className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-violet-300/80 leading-relaxed">{study.study_tip}</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CONTENT CARD
══════════════════════════════════════════════════════════════════════ */
function ContentCard({ content }: { content: ContentAgentOutput }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-cyan-500/20 bg-zinc-900/80">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <FileEdit className="w-4.5 h-4.5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Content Agent</p>
            <p className="text-sm text-white font-bold truncate mt-0.5">{content.subject}</p>
          </div>
        </div>
        <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full capitalize flex-shrink-0">
          {content.content_type.replace('_', ' ')}
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="relative">
          <textarea
            readOnly
            value={content.draft}
            className="w-full min-h-[220px] max-h-[380px] p-4 pr-24 bg-zinc-800/40 border border-zinc-800/80 rounded-2xl text-xs font-mono text-white/80 leading-relaxed focus:outline-none overflow-y-auto resize-y"
          />
          <button
            onClick={handleCopy}
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-800 border-zinc-800 text-white/50 hover:text-white hover:border-zinc-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/30">
          <span>Recipient: <strong className="text-white/55">{content.recipient}</strong></span>
          <span>Tone: <strong className="text-white/55 capitalize">{content.tone}</strong></span>
          <span>Words: <strong className="text-white/55">{content.word_count}</strong></span>
        </div>
      </div>

      {content.usage_tip && (
        <div className="mx-5 mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-cyan-500/8 border border-cyan-500/15">
          <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-cyan-300/80 leading-relaxed">{content.usage_tip}</p>
        </div>
      )}
    </div>
  );
}
