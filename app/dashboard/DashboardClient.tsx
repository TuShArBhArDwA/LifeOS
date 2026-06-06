'use client';

import Link from 'next/link';
import InstallPWA from '@/components/InstallPWA';
import { useEffect, useRef, useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { format, parseISO, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import {
  Camera, Sparkles, AlertTriangle, AlertCircle,
  BookOpen, Bell, Mic, Pin, Plus,
  CheckSquare, Calendar, Clock, TrendingUp,
  ChevronRight, Zap, Target
} from 'lucide-react';
import type { Profile, Task, CalendarEvent, Reminder, Intake } from '@/lib/supabase';

type Props = {
  profile: Profile;
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  intakes: Intake[];
};

/* ─── Priority config ────────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  1: { label: 'High',   dot: 'bg-red-400',    badge: 'bg-red-500/12 text-red-400 border-red-500/20',    bar: 'bg-red-400',    glow: 'shadow-[0_0_8px_rgba(248,113,113,0.3)]' },
  2: { label: 'Medium', dot: 'bg-yellow-400', badge: 'bg-yellow-500/12 text-yellow-400 border-yellow-500/20', bar: 'bg-yellow-400', glow: '' },
  3: { label: 'Low',    dot: 'bg-emerald-400',badge: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20', bar: 'bg-emerald-400', glow: '' },
} as const;

const EVENT_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  deadline:    { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400',     bg: 'bg-red-500/10',    border: 'border-red-500/20' },
  study_block: { icon: <BookOpen    className="w-4 h-4" />, color: 'text-brand-400',   bg: 'bg-brand-500/10',  border: 'border-brand-500/20' },
  reminder:    { icon: <Bell        className="w-4 h-4" />, color: 'text-yellow-400',  bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  interview:   { icon: <Mic         className="w-4 h-4" />, color: 'text-purple-400',  bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  placement_notice: { label: 'Placement', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  assignment:       { label: 'Assignment', color: 'text-brand-400',   bg: 'bg-brand-500/10 border-brand-500/20' },
  exam:             { label: 'Exam',        color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  timetable:        { label: 'Timetable',  color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  fee_notice:       { label: 'Fee',         color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  general:          { label: 'General',    color: 'text-white/50',    bg: 'bg-white/5 border-white/10' },
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatEventDate(dateStr: string) {
  try {
    const d = parseISO(dateStr);
    if (isToday(d))    return `Today · ${format(d, 'h:mm a')}`;
    if (isTomorrow(d)) return `Tomorrow · ${format(d, 'h:mm a')}`;
    return format(d, 'EEE, MMM d · h:mm a');
  } catch { return dateStr; }
}

function getDueBadge(due: string | null) {
  if (!due) return null;
  try {
    const d = parseISO(due);
    if (isPast(d)) return { text: 'Overdue', cls: 'text-red-400' };
    const days = differenceInDays(d, new Date());
    if (days === 0) return { text: 'Due today', cls: 'text-red-400' };
    if (days === 1) return { text: 'Due tomorrow', cls: 'text-yellow-400' };
    return { text: `Due ${format(d, 'MMM d')}`, cls: 'text-white/35' };
  } catch { return null; }
}

/* ─── Animated stat card ─────────────────────────────────────────── */
function StatCard({ value, label, icon: Icon, accent = false, alert = false }:
  { value: number; label: string; icon: React.ElementType; accent?: boolean; alert?: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const step = value / 20;
      const t = setInterval(() => {
        cur += step;
        if (cur >= value) { setDisplayed(value); clearInterval(t); }
        else setDisplayed(Math.floor(cur));
      }, 30);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className={`relative flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 group ${
        alert
          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/35'
          : accent
          ? 'bg-brand-500/5 border-brand-500/20 hover:border-brand-500/35'
          : 'bg-surface-card border-surface-border hover:border-white/15'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
        alert ? 'bg-red-500/15' : accent ? 'bg-brand-500/15' : 'bg-surface-elevated'
      }`}>
        <Icon className={`w-4.5 h-4.5 ${alert ? 'text-red-400' : accent ? 'text-brand-400' : 'text-white/40'}`} />
      </div>
      <div>
        <p className={`text-2xl font-black tabular-nums ${alert && value > 0 ? 'text-red-400' : 'text-white'}`}>
          {displayed}
        </p>
        <p className="text-xs text-white/35 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────────── */
function SectionHeader({ title, count, href, hrefLabel }: {
  title: string; count?: number; href?: string; hrefLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <h2 className="font-semibold text-white text-sm tracking-tight">{title}</h2>
        {count !== undefined && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-elevated text-white/40 tabular-nums">
            {count}
          </span>
        )}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
          {hrefLabel ?? 'See all'} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/* ─── Main dashboard ─────────────────────────────────────────────── */
export default function DashboardClient({ profile, tasks, events, reminders, intakes }: Props) {
  const pendingTasks    = tasks.filter((t) => t.status === 'pending');
  const highPriorityCount = pendingTasks.filter((t) => t.priority === 1).length;
  const upcomingEvents  = events.filter((e) => !isPast(parseISO(e.start_time)));
  const completedTasks  = tasks.filter((t) => t.status === 'done').length;
  const completionRate  = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const firstName = profile.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-surface">
      <InstallPWA />

      {/* ── Background decoration ── */}
      <div className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-brand-500/6 blur-[100px]" />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-surface-border/50 backdrop-blur-xl bg-surface/80">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-brand-500/20 blur-md" />
              <img src="/favicon.png" alt="LifeOS" className="relative w-9 h-9 rounded-xl object-contain" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">LifeOS</span>
              <span className="hidden sm:inline text-xs text-white/30 ml-2">/ Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              id="dashboard-upload-btn"
              className="group flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-brand hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>Capture</span>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8 pb-24 space-y-8">

        {/* ── Welcome banner ── */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-brand-500/40 via-transparent to-accent-green/20">
            <div className="w-full h-full rounded-3xl bg-surface-card" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-32 bg-brand-500/8 blur-3xl rounded-full" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-white/40 text-sm font-medium">{getGreeting()}</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2.5">
                  {firstName}
                  <Sparkles className="w-6 h-6 text-brand-400" />
                </h1>
                <p className="text-sm text-white/35 mt-1">{profile.branch} · Year {profile.year} · {profile.college || 'College'}</p>
              </div>

              <div className="flex items-center gap-6 sm:gap-8">
                {/* CGPA ring */}
                <div className="text-center">
                  <div className="text-3xl font-black gradient-text">{profile.cgpa}</div>
                  <div className="text-[10px] text-white/30 font-medium mt-0.5 uppercase tracking-wider">CGPA</div>
                </div>

                {/* Completion mini-ring */}
                <div className="text-center hidden sm:block">
                  <div className="relative w-14 h-14 mx-auto mb-1">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                      <circle
                        cx="28" cy="28" r="22" fill="none"
                        stroke="#3b82f6" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 22}`}
                        strokeDashoffset={`${2 * Math.PI * 22 * (1 - completionRate / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Done</div>
                </div>
              </div>
            </div>

            {/* Skill chips */}
            {profile.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5 pt-5 border-t border-white/6">
                {profile.skills.slice(0, 6).map((skill) => (
                  <span key={skill} className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-elevated border border-white/6 text-white/40 font-medium">
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 6 && (
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-elevated border border-white/6 text-white/30">
                    +{profile.skills.length - 6} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={pendingTasks.length} label="Pending tasks"    icon={CheckSquare} />
          <StatCard value={highPriorityCount}   label="High priority"    icon={AlertTriangle} alert={highPriorityCount > 0} />
          <StatCard value={upcomingEvents.length} label="Upcoming events" icon={Calendar}  accent />
          <StatCard value={completedTasks}       label="Tasks completed"  icon={TrendingUp} />
        </div>

        {/* ── Empty state ── */}
        {intakes.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-3xl bg-brand-500/10 animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-surface-card border border-surface-border flex items-center justify-center">
                <Camera className="w-10 h-10 text-white/25" />
              </div>
            </div>
            <h2 className="font-bold text-white text-xl mb-2">Nothing captured yet</h2>
            <p className="text-white/35 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Upload a screenshot, placement notice, or PDF and let 5 AI agents go to work instantly.
            </p>
            <Link
              href="/upload"
              id="empty-upload-btn"
              className="inline-flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white px-7 py-3.5 rounded-2xl font-semibold transition-all hover:shadow-brand hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              Capture something
            </Link>
          </div>
        )}

        {intakes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column (2/3) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Recent captures */}
              <section>
                <SectionHeader title="Recent Captures" count={intakes.length} href="/upload" hrefLabel="+ New" />
                <div className="space-y-2.5">
                  {intakes.map((intake, i) => {
                    const cfg = INTENT_CONFIG[intake.intent] ?? INTENT_CONFIG.general;
                    return (
                      <div
                        key={intake.id}
                        className="group flex gap-4 p-4 rounded-2xl border border-surface-border bg-surface-card hover:border-white/12 hover:bg-surface-elevated/50 transition-all duration-200"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-md border text-[10px] font-bold self-start ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/75 leading-relaxed line-clamp-2">{intake.summary}</p>
                          <p className="text-[11px] text-white/25 mt-1.5 font-medium">
                            {format(parseISO(intake.created_at), 'EEE, MMM d · h:mm a')}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/15 flex-shrink-0 self-center group-hover:text-white/35 transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Pending tasks */}
              {pendingTasks.length > 0 && (
                <section>
                  <SectionHeader title="Pending Tasks" count={pendingTasks.length} />
                  <div className="space-y-2.5">
                    {pendingTasks.slice(0, 8).map((task, i) => {
                      const cfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG[3];
                      const due = getDueBadge(task.due_date ?? null);
                      const overdue = due?.text === 'Overdue';
                      return (
                        <div
                          key={task.id}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 group ${
                            overdue
                              ? 'bg-red-500/5 border-red-500/15 hover:border-red-500/25'
                              : 'bg-surface-card border-surface-border hover:border-white/12'
                          }`}
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          {/* Priority dot */}
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${cfg.dot} ${cfg.glow}`} />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-white/35 mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                            {due && (
                              <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-semibold ${due.cls}`}>
                                {overdue && <AlertTriangle className="w-3 h-3" />}
                                <Clock className="w-3 h-3" />
                                {due.text}
                              </div>
                            )}
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* ── Right column (1/3) ── */}
            <div className="space-y-6">

              {/* Upcoming events timeline */}
              {upcomingEvents.length > 0 && (
                <section>
                  <SectionHeader title="Upcoming Events" count={upcomingEvents.length} />
                  <div className="relative space-y-0">
                    {/* Timeline line */}
                    <div className="absolute left-[18px] top-3 bottom-3 w-px bg-surface-border" />

                    {upcomingEvents.slice(0, 6).map((event, i) => {
                      const cfg = EVENT_CONFIG[event.event_type] ?? {
                        icon: <Pin className="w-4 h-4" />, color: 'text-white/40', bg: 'bg-surface-elevated', border: 'border-surface-border'
                      };
                      return (
                        <div key={event.id} className="relative flex gap-4 pl-0 pb-4 last:pb-0 group">
                          {/* Node */}
                          <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.color} transition-all group-hover:scale-110`}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <p className="text-sm font-medium text-white leading-snug truncate">{event.title}</p>
                            <p className={`text-[11px] mt-0.5 font-medium ${cfg.color}`}>
                              {formatEventDate(event.start_time)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Reminders */}
              {reminders.length > 0 && (
                <section>
                  <SectionHeader title="Reminders" count={reminders.length} />
                  <div className="space-y-2.5">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="p-4 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 hover:border-yellow-500/25 transition-all">
                        <p className="text-sm text-white/75 leading-relaxed">{reminder.message}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-yellow-500/60 mt-2 font-medium">
                          <Bell className="w-3.5 h-3.5" />
                          {formatEventDate(reminder.remind_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Quick actions */}
              <section>
                <SectionHeader title="Quick Actions" />
                <div className="space-y-2">
                  {[
                    { href: '/upload', icon: Camera,   label: 'New capture',      sub: 'Upload or paste content',  accent: true },
                    { href: '/upload', icon: Target,   label: 'Placement notice', sub: 'Check eligibility',        accent: false },
                    { href: '/upload', icon: BookOpen, label: 'Study material',   sub: 'Build a study plan',       accent: false },
                  ].map((action, i) => (
                    <Link
                      key={i}
                      href={action.href}
                      id={`quick-action-${i}`}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 group ${
                        action.accent
                          ? 'bg-brand-500/8 border-brand-500/20 hover:border-brand-500/35'
                          : 'bg-surface-card border-surface-border hover:border-white/12'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${action.accent ? 'bg-brand-500/20' : 'bg-surface-elevated'}`}>
                        <action.icon className={`w-4 h-4 ${action.accent ? 'text-brand-400' : 'text-white/35'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{action.label}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{action.sub}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* ── Floating capture button ── */}
      <div className="fixed bottom-6 right-6 z-30">
        <Link
          href="/upload"
          id="fab-upload-btn"
          className="group flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-5 py-3.5 rounded-2xl font-semibold shadow-brand hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:scale-105 active:scale-95"
        >
          <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm">Capture</span>
        </Link>
      </div>
    </div>
  );
}
