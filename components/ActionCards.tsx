'use client';

import { format, parseISO } from 'date-fns';
import { 
  CheckSquare, 
  Calendar, 
  Target, 
  Bell, 
  AlertCircle, 
  BookOpen, 
  Mic, 
  Pin,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Flame,
  Check,
  X,
  Zap
} from 'lucide-react';
import type { GeneratedTask } from '@/lib/agents/task-agent';
import type { GeneratedEvent } from '@/lib/agents/schedule-agent';
import type { PlacementAgentOutput } from '@/lib/agents/placement-agent';
import type { GeneratedReminder } from '@/lib/agents/reminder-agent';

/* ─── Priority badge ────────────────────────────────── */
function PriorityBadge({ priority }: { priority: 1 | 2 | 3 }) {
  const map = {
    1: { label: 'High', cls: 'priority-1' },
    2: { label: 'Medium', cls: 'priority-2' },
    3: { label: 'Low', cls: 'priority-3' },
  };
  const { label, cls } = map[priority];
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

/* ─── Tasks card ────────────────────────────────────── */
export function TasksCard({ tasks }: { tasks: GeneratedTask[] }) {
  if (!tasks?.length) return null;
  return (
    <div className="glass-strong rounded-3xl p-5 border border-surface-border animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center">
          <CheckSquare className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Tasks Created</h3>
          <p className="text-xs text-white/40">{tasks.length} action items</p>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-surface-elevated rounded-2xl border border-surface-border hover:border-brand-500/30 transition-all group"
          >
            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
              task.priority === 1 ? 'bg-red-400' : task.priority === 2 ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
                <PriorityBadge priority={task.priority} />
              </div>
              <p className="text-xs text-white/40 mt-1 line-clamp-2">{task.description}</p>
              {task.due_date && (
                <p className="text-xs text-brand-400 mt-1.5 font-medium">
                  Due {format(parseISO(task.due_date), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Events card ────────────────────────────────────── */
function getEventIcon(type: string) {
  switch (type) {
    case 'deadline':
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    case 'study_block':
      return <BookOpen className="w-4 h-4 text-blue-400" />;
    case 'reminder':
      return <Bell className="w-4 h-4 text-yellow-400" />;
    case 'interview':
      return <Mic className="w-4 h-4 text-purple-400" />;
    default:
      return <Pin className="w-4 h-4 text-white/40" />;
  }
}

const EVENT_COLORS: Record<string, string> = {
  deadline: 'border-red-500/20 bg-red-500/5',
  study_block: 'border-brand-500/20 bg-brand-500/5',
  reminder: 'border-yellow-500/20 bg-yellow-500/5',
  interview: 'border-purple-500/20 bg-purple-500/5',
};

export function EventsCard({ events }: { events: GeneratedEvent[] }) {
  if (!events?.length) return null;
  return (
    <div className="glass-strong rounded-3xl p-5 border border-surface-border animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent-green/20 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-accent-green" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Calendar Events</h3>
          <p className="text-xs text-white/40">{events.length} events scheduled</p>
        </div>
      </div>
      <div className="space-y-2">
        {events.map((event, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${EVENT_COLORS[event.event_type] ?? 'border-surface-border bg-surface-elevated'}`}
          >
            <span className="flex-shrink-0">{getEventIcon(event.event_type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{event.title}</p>
              <p className="text-xs text-white/40">
                {format(parseISO(event.start_time), 'MMM d · h:mm a')}
              </p>
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
              {event.event_type.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Placement card ────────────────────────────────── */
export function PlacementCard({ placement }: { placement: PlacementAgentOutput }) {
  if (!placement) return null;
  const { eligible, cgpa_check, branch_check } = placement.eligibility;

  return (
    <div className="glass-strong rounded-3xl p-5 border border-surface-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent-yellow/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-accent-yellow" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Placement Analysis</h3>
          <p className="text-xs text-white/40">{placement.company}</p>
        </div>
        {/* Eligibility badge */}
        <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
          eligible
            ? 'bg-green-500/15 border-green-500/30 text-green-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {eligible ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          <span>{eligible ? 'Eligible' : 'Not Eligible'}</span>
        </div>
      </div>

      {/* Eligibility criteria */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className={`p-3 rounded-2xl border text-center ${cgpa_check.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
          <p className="text-xs text-white/40 mb-1">CGPA</p>
          <p className={`text-sm font-bold ${cgpa_check.passed ? 'text-green-400' : 'text-red-400'}`}>
            {cgpa_check.actual} / {cgpa_check.required ?? '—'}
          </p>
          <p className="text-[10px] text-white/30 mt-1">{cgpa_check.passed ? 'Meets requirement' : 'Below requirement'}</p>
        </div>
        <div className={`p-3 rounded-2xl border text-center ${branch_check.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
          <p className="text-xs text-white/40 mb-1">Branch</p>
          <p className={`text-sm font-bold ${branch_check.passed ? 'text-green-400' : 'text-red-400'}`}>
            {branch_check.actual}
          </p>
          <p className="text-[10px] text-white/30 mt-1">{branch_check.passed ? 'Branch eligible' : 'Branch not eligible'}</p>
        </div>
      </div>

      {/* Documents checklist */}
      {placement.documents_checklist?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Documents Checklist</p>
          <div className="space-y-1.5">
            {placement.documents_checklist.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-shrink-0">
                  {doc.status === 'needs_update' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Check className="w-4 h-4 text-green-400" />
                  )}
                </span>
                <span className={`text-sm ${doc.status === 'needs_update' ? 'text-yellow-300' : 'text-white/60'}`}>
                  {doc.doc}
                </span>
                {doc.status === 'needs_update' && (
                  <span className="text-[10px] text-yellow-500/60 ml-auto">Update needed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prep plan */}
      {placement.prep_plan?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Preparation Roadmap</p>
          <div className="space-y-2">
            {placement.prep_plan.map((week) => (
              <div key={week.week} className="p-3 bg-surface-elevated rounded-2xl border border-surface-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-400">{week.label}</span>
                  <span className="text-xs text-white/60">— {week.focus}</span>
                </div>
                <ul className="space-y-1">
                  {week.tasks.map((task, i) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                      <span className="text-brand-500 mt-0.5 flex-shrink-0">·</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reminders card ────────────────────────────────── */
const TONE_STYLES: Record<string, string> = {
  urgent:        'border-red-500/20 bg-red-500/5',
  encouraging:   'border-green-500/20 bg-green-500/5',
  informational: 'border-brand-500/20 bg-brand-500/5',
};

function getToneIcon(tone: string) {
  switch (tone) {
    case 'urgent':
      return <Flame className="w-4.5 h-4.5 text-red-400" />;
    case 'encouraging':
      return <Sparkles className="w-4.5 h-4.5 text-green-400" />;
    case 'informational':
      return <Lightbulb className="w-4.5 h-4.5 text-brand-400" />;
    default:
      return <Bell className="w-4.5 h-4.5 text-white/40" />;
  }
}

export function RemindersCard({ reminders }: { reminders: GeneratedReminder[] }) {
  if (!reminders?.length) return null;
  return (
    <div className="glass-strong rounded-3xl p-5 border border-surface-border animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent-purple/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-accent-purple" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Smart Reminders</h3>
          <p className="text-xs text-white/40">{reminders.length} context-aware nudges</p>
        </div>
      </div>
      <div className="space-y-3">
        {reminders.map((reminder, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl border ${TONE_STYLES[reminder.tone] ?? 'border-surface-border bg-surface-elevated'}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex-shrink-0">{getToneIcon(reminder.tone)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-relaxed">{reminder.message}</p>
                <p className="text-xs text-white/30 mt-1">
                  {format(parseISO(reminder.remind_at), 'EEE, MMM d · h:mm a')}
                </p>
                {reminder.why_it_matters && (
                  <p className="text-xs text-brand-400 flex items-center gap-1 font-medium mt-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-400" />
                    <span>{reminder.why_it_matters}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
