'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import type { Profile, Task, CalendarEvent, Reminder, Intake } from '@/lib/supabase';

type Props = {
  profile: Profile;
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  intakes: Intake[];
};

const PRIORITY_CONFIG = {
  1: { label: 'High', dot: 'bg-red-400', badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
  2: { label: 'Med', dot: 'bg-yellow-400', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  3: { label: 'Low', dot: 'bg-green-400', badge: 'bg-green-500/15 text-green-400 border-green-500/25' },
} as const;

const EVENT_ICONS: Record<string, string> = {
  deadline: '🔴', study_block: '📚', reminder: '🔔', interview: '🎤',
};

function formatEventDate(dateStr: string) {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return `Today · ${format(d, 'h:mm a')}`;
    if (isTomorrow(d)) return `Tomorrow · ${format(d, 'h:mm a')}`;
    return format(d, 'MMM d · h:mm a');
  } catch { return dateStr; }
}

function formatIntentTag(intent: string) {
  const map: Record<string, string> = {
    placement_notice: '🏢 Placement',
    assignment: '📚 Assignment',
    exam: '📝 Exam',
    timetable: '📅 Timetable',
    fee_notice: '💰 Fee',
    general: '📋 General',
  };
  return map[intent] ?? intent;
}

export default function DashboardClient({ profile, tasks, events, reminders, intakes }: Props) {
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const highPriorityCount = pendingTasks.filter((t) => t.priority === 1).length;
  const upcomingEvents = events.filter((e) => !isPast(parseISO(e.start_time)));

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong border-b border-surface-border safe-top">
        <div className="flex items-center justify-between px-5 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">L</div>
            <span className="font-bold text-sm">LifeOS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              id="dashboard-upload-btn"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-brand"
            >
              <span>+</span>
              <span>Capture</span>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 pb-24 space-y-6">
        {/* Welcome / Profile widget */}
        <div className="glass-strong rounded-3xl p-5 border border-brand-500/15 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm">Good {getGreeting()},</p>
              <h1 className="text-xl font-bold text-white mt-0.5">{profile.name.split(' ')[0]} 👋</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 mb-1">CGPA</p>
              <p className="text-2xl font-bold gradient-text">{profile.cgpa}</p>
              <p className="text-[10px] text-white/30">{profile.branch} · Year {profile.year}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-surface-border">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{pendingTasks.length}</p>
              <p className="text-[11px] text-white/40">Pending tasks</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${highPriorityCount > 0 ? 'text-red-400' : 'text-white'}`}>{highPriorityCount}</p>
              <p className="text-[11px] text-white/40">High priority</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{upcomingEvents.length}</p>
              <p className="text-[11px] text-white/40">Upcoming events</p>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {intakes.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-surface-elevated border border-surface-border flex items-center justify-center text-4xl mx-auto mb-4">📸</div>
            <h2 className="font-semibold text-white text-lg mb-2">Nothing here yet</h2>
            <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
              Upload a screenshot, placement notice, or PDF to let LifeOS go to work.
            </p>
            <Link
              href="/upload"
              id="empty-upload-btn"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all hover:shadow-brand"
            >
              📸 Capture something
            </Link>
          </div>
        )}

        {/* Recent intakes */}
        {intakes.length > 0 && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white text-sm">Recent Captures</h2>
              <Link href="/upload" id="dash-new-capture" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">+ New</Link>
            </div>
            <div className="space-y-2">
              {intakes.map((intake) => (
                <div key={intake.id} className="glass rounded-2xl p-4 border border-surface-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/70">{formatIntentTag(intake.intent)}</span>
                    <span className="text-[10px] text-white/30">{format(parseISO(intake.created_at), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-sm text-white/60 mt-1 line-clamp-2">{intake.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white text-sm">Pending Tasks</h2>
              <span className="text-xs text-white/30">{pendingTasks.length} total</span>
            </div>
            <div className="space-y-2">
              {pendingTasks.slice(0, 6).map((task) => {
                const cfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG[3];
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-4 glass-strong rounded-2xl border border-surface-border hover:border-brand-500/30 transition-all"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
                      {task.due_date && (
                        <p className={`text-xs mt-1 font-medium ${isPast(parseISO(task.due_date)) ? 'text-red-400' : 'text-white/40'}`}>
                          {isPast(parseISO(task.due_date)) ? '⚠️ Overdue · ' : ''}
                          {format(parseISO(task.due_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge} flex-shrink-0`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white text-sm">Upcoming Events</h2>
            </div>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-4 glass rounded-2xl border border-surface-border">
                  <span className="text-xl w-8 text-center">{EVENT_ICONS[event.event_type] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{event.title}</p>
                    <p className="text-xs text-white/40">{formatEventDate(event.start_time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reminders */}
        {reminders.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="font-semibold text-white text-sm mb-3">Upcoming Reminders</h2>
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="p-4 glass rounded-2xl border border-yellow-500/15 bg-yellow-500/5">
                  <p className="text-sm text-white/80 leading-relaxed">{reminder.message}</p>
                  <p className="text-xs text-yellow-500/60 mt-1">
                    🔔 {formatEventDate(reminder.remind_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating action button for mobile */}
      <div className="fixed bottom-6 right-6 z-30 safe-bottom">
        <Link
          href="/upload"
          id="fab-upload-btn"
          className="flex items-center gap-2 bg-gradient-brand text-white px-5 py-4 rounded-2xl font-semibold shadow-brand hover:opacity-90 transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
        >
          <span className="text-lg">📸</span>
          <span className="text-sm">Capture</span>
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
