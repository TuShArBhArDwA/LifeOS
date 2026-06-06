'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  CheckSquare, Calendar, Target, Bell,
  AlertCircle, BookOpen, Mic, Pin,
  AlertTriangle, Lightbulb, Sparkles,
  Flame, Check, X, Zap, ChevronDown,
  ChevronUp, Clock, FileCheck, ArrowRight
} from 'lucide-react';
import type { GeneratedTask } from '@/lib/agents/task-agent';
import type { GeneratedEvent } from '@/lib/agents/schedule-agent';
import type { PlacementAgentOutput } from '@/lib/agents/placement-agent';
import type { GeneratedReminder } from '@/lib/agents/reminder-agent';

/* ─── Shared section wrapper ─────────────────────────────────────── */
function SectionCard({
  icon, iconBg, title, subtitle, children, delay = 0,
}: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <div
      className="rounded-3xl border border-surface-border bg-surface-card overflow-hidden animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Card header */}
      <div className="flex items-center gap-3.5 px-6 py-5 border-b border-surface-border/60">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm tracking-tight">{title}</h3>
          <p className="text-xs text-white/35 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── Priority pill ──────────────────────────────────────────────── */
function PriorityPill({ priority }: { priority: 1 | 2 | 3 }) {
  const cfg = {
    1: { label: 'High',   cls: 'bg-red-500/12 text-red-400 border-red-500/25',     dot: 'bg-red-400' },
    2: { label: 'Medium', cls: 'bg-yellow-500/12 text-yellow-400 border-yellow-500/25', dot: 'bg-yellow-400' },
    3: { label: 'Low',    cls: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
  }[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── TasksCard ──────────────────────────────────────────────────── */
export function TasksCard({ tasks }: { tasks: GeneratedTask[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!tasks?.length) return null;

  const visible = expanded ? tasks : tasks.slice(0, 4);
  const highCount = tasks.filter((t) => t.priority === 1).length;

  return (
    <SectionCard
      icon={<CheckSquare className="w-5 h-5 text-brand-400" />}
      iconBg="bg-brand-500/15"
      title="Tasks Created"
      subtitle={`${tasks.length} action items${highCount > 0 ? ` · ${highCount} high priority` : ''}`}
      delay={50}
    >
      <div className="space-y-2.5">
        {visible.map((task, i) => (
          <div
            key={i}
            className="group flex items-start gap-3.5 p-4 bg-surface-elevated rounded-2xl border border-surface-border hover:border-brand-500/25 transition-all duration-200"
          >
            {/* Left accent bar */}
            <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${
              task.priority === 1 ? 'bg-red-400' : task.priority === 2 ? 'bg-yellow-400' : 'bg-emerald-400'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
                <PriorityPill priority={task.priority} />
              </div>
              {task.description && (
                <p className="text-xs text-white/40 mt-1.5 leading-relaxed line-clamp-2">{task.description}</p>
              )}
              {task.due_date && (
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-brand-400/80">
                  <Clock className="w-3.5 h-3.5" />
                  Due {format(parseISO(task.due_date), 'MMM d, yyyy')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 hover:bg-surface-elevated transition-all"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Show {tasks.length - 4} more tasks</>
          )}
        </button>
      )}
    </SectionCard>
  );
}

/* ─── EventsCard ─────────────────────────────────────────────────── */
const EVENT_CFG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  deadline:    { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    label: 'Deadline' },
  study_block: { icon: <BookOpen    className="w-4 h-4" />, color: 'text-brand-400',  bg: 'bg-brand-500/10',  border: 'border-brand-500/20',  label: 'Study block' },
  reminder:    { icon: <Bell        className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Reminder' },
  interview:   { icon: <Mic        className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Interview' },
};

export function EventsCard({ events }: { events: GeneratedEvent[] }) {
  if (!events?.length) return null;
  return (
    <SectionCard
      icon={<Calendar className="w-5 h-5 text-accent-green" />}
      iconBg="bg-accent-green/15"
      title="Calendar Scheduled"
      subtitle={`${events.length} events added to your timeline`}
      delay={100}
    >
      {/* Timeline */}
      <div className="relative space-y-0">
        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-surface-border" />
        {events.map((event, i) => {
          const cfg = EVENT_CFG[event.event_type] ?? {
            icon: <Pin className="w-4 h-4" />, color: 'text-white/40',
            bg: 'bg-surface-elevated', border: 'border-surface-border', label: 'Event',
          };
          return (
            <div key={i} className="relative flex gap-4 pb-4 last:pb-0 group">
              <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.color} transition-all group-hover:scale-110`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white leading-snug truncate">{event.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 font-medium ${cfg.color}`}>
                  {format(parseISO(event.start_time), 'EEE, MMM d · h:mm a')}
                </p>
                {event.description && (
                  <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{event.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ─── PlacementCard ──────────────────────────────────────────────── */
function EligCheck({ passed, label, value, sub }: {
  passed: boolean; label: string; value: string; sub: string;
}) {
  return (
    <div className={`p-4 rounded-2xl border text-center ${passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2 ${passed ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
        {passed
          ? <Check className="w-4 h-4 text-emerald-400" />
          : <X className="w-4 h-4 text-red-400" />
        }
      </div>
      <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-1">{label}</p>
      <p className={`text-base font-black ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
      <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>
    </div>
  );
}

export function PlacementCard({ placement }: { placement: PlacementAgentOutput }) {
  if (!placement) return null;
  const { eligible, cgpa_check, branch_check } = placement.eligibility;
  const [showPrep, setShowPrep] = useState(false);

  return (
    <SectionCard
      icon={<Target className="w-5 h-5 text-accent-yellow" />}
      iconBg="bg-accent-yellow/15"
      title={`Placement Analysis · ${placement.company}`}
      subtitle={placement.role ? `Role: ${placement.role}` : 'Eligibility & preparation plan'}
      delay={150}
    >
      {/* Eligibility verdict */}
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border mb-5 ${
        eligible
          ? 'bg-emerald-500/8 border-emerald-500/25'
          : 'bg-red-500/8 border-red-500/25'
      }`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${eligible ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          {eligible ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-red-400" />}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-bold ${eligible ? 'text-emerald-400' : 'text-red-400'}`}>
            {eligible ? 'You are eligible to apply' : 'You do not meet all criteria'}
          </p>
          {placement.eligibility.overall_reasons?.[0] && (
            <p className="text-xs text-white/35 mt-0.5">{placement.eligibility.overall_reasons[0]}</p>
          )}
        </div>
        {placement.registration_deadline && (
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-white/30 font-medium">Register by</p>
            <p className="text-xs font-bold text-white/70">{format(parseISO(placement.registration_deadline), 'MMM d')}</p>
          </div>
        )}
      </div>

      {/* Criteria grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <EligCheck
          passed={cgpa_check.passed}
          label="CGPA"
          value={`${cgpa_check.actual} / ${cgpa_check.required ?? '—'}`}
          sub={cgpa_check.passed ? 'Meets requirement' : 'Below cutoff'}
        />
        <EligCheck
          passed={branch_check.passed}
          label="Branch"
          value={branch_check.actual}
          sub={branch_check.passed ? 'Eligible branch' : 'Branch not listed'}
        />
      </div>

      {/* Documents checklist */}
      {placement.documents_checklist?.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" /> Documents Checklist
          </p>
          <div className="space-y-2">
            {placement.documents_checklist.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                  doc.status === 'needs_update' ? 'bg-yellow-500/15' : 'bg-emerald-500/15'
                }`}>
                  {doc.status === 'needs_update'
                    ? <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    : <Check className="w-3 h-3 text-emerald-400" />
                  }
                </div>
                <span className={`text-sm flex-1 ${doc.status === 'needs_update' ? 'text-yellow-300' : 'text-white/60'}`}>
                  {doc.doc}
                </span>
                {doc.status === 'needs_update' && (
                  <span className="text-[10px] text-yellow-500/60 font-semibold flex-shrink-0">Update needed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick tips */}
      {placement.quick_tips?.length > 0 && (
        <div className="mb-5 p-4 rounded-2xl border border-brand-500/15 bg-brand-500/5">
          <p className="text-[10px] font-bold text-brand-400/70 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Quick Tips
          </p>
          <ul className="space-y-1.5">
            {placement.quick_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                <ArrowRight className="w-3.5 h-3.5 text-brand-400/60 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prep plan collapsible */}
      {placement.prep_plan?.length > 0 && (
        <div>
          <button
            onClick={() => setShowPrep(!showPrep)}
            className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-surface-elevated border border-surface-border hover:border-white/15 transition-all text-xs font-semibold text-white/50 hover:text-white/80"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-accent-yellow" />
              {placement.prep_plan.length}-week preparation roadmap
            </span>
            {showPrep ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showPrep && (
            <div className="mt-3 space-y-2.5 animate-slide-up">
              {placement.prep_plan.map((week) => (
                <div key={week.week} className="p-4 rounded-2xl border border-surface-border bg-surface-elevated">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-xs font-bold text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-md">{week.label}</span>
                    <span className="text-xs text-white/50 font-medium">{week.focus}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {week.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/45">
                        <span className="w-1 h-1 rounded-full bg-brand-500/60 mt-1.5 flex-shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

/* ─── RemindersCard ──────────────────────────────────────────────── */
const TONE_CFG: Record<string, { icon: React.ReactNode; border: string; bg: string; label: string; color: string }> = {
  urgent:        { icon: <Flame      className="w-4 h-4" />, border: 'border-red-500/20',    bg: 'bg-red-500/6',    label: 'Urgent',        color: 'text-red-400' },
  encouraging:   { icon: <Sparkles   className="w-4 h-4" />, border: 'border-emerald-500/20',bg: 'bg-emerald-500/6',label: 'Encouraging',    color: 'text-emerald-400' },
  informational: { icon: <Lightbulb  className="w-4 h-4" />, border: 'border-brand-500/20',  bg: 'bg-brand-500/6',  label: 'Info',           color: 'text-brand-400' },
};

export function RemindersCard({ reminders }: { reminders: GeneratedReminder[] }) {
  if (!reminders?.length) return null;
  return (
    <SectionCard
      icon={<Bell className="w-5 h-5 text-accent-purple" />}
      iconBg="bg-accent-purple/15"
      title="Smart Reminders"
      subtitle={`${reminders.length} context-aware nudges scheduled`}
      delay={200}
    >
      <div className="space-y-3">
        {reminders.map((reminder, i) => {
          const cfg = TONE_CFG[reminder.tone] ?? TONE_CFG.informational;
          return (
            <div
              key={i}
              className={`p-4 rounded-2xl border ${cfg.border} ${cfg.bg} transition-all hover:brightness-110`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color} ${cfg.bg} border ${cfg.border} mt-0.5`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[10px] text-white/25">·</span>
                    <span className="text-[10px] text-white/30 font-medium">
                      {format(parseISO(reminder.remind_at), 'EEE, MMM d · h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{reminder.message}</p>
                  {reminder.why_it_matters && (
                    <p className={`text-xs font-medium mt-2 flex items-start gap-1.5 ${cfg.color}`}>
                      <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {reminder.why_it_matters}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
