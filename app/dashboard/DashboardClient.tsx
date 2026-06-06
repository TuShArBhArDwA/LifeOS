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
  ChevronRight, Zap, Target, Activity, ArrowUpRight,
  Mail, MessageSquare, Cpu, Settings2
} from 'lucide-react';
import type { Profile, Task, CalendarEvent, Reminder, Intake } from '@/lib/supabase';

type Props = {
  profile: Profile;
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  intakes: (Intake & {
    placement?: any;
    expense?: any;
    study?: any;
    content?: any;
  })[];
};

/* ─── Priority config ─────────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  1: {
    label: 'High',
    dot: 'bg-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    bar: 'bg-gradient-to-r from-red-500 to-red-400',
    accent: 'accent-bar-red',
    glow: 'hover:shadow-[0_2px_20px_rgba(239,68,68,0.12)]',
  },
  2: {
    label: 'Medium',
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    bar: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    accent: 'accent-bar-yellow',
    glow: '',
  },
  3: {
    label: 'Low',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    accent: 'accent-bar-green',
    glow: '',
  },
} as const;

const EVENT_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; glow: string }> = {
  deadline:    { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400',     bg: 'bg-red-500/12',     border: 'border-red-500/25',    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.15)]' },
  study_block: { icon: <BookOpen    className="w-4 h-4" />, color: 'text-brand-400',   bg: 'bg-brand-500/12',   border: 'border-brand-500/25',  glow: 'shadow-[0_0_12px_rgba(59,130,246,0.15)]' },
  reminder:    { icon: <Bell        className="w-4 h-4" />, color: 'text-yellow-400',  bg: 'bg-yellow-500/12',  border: 'border-yellow-500/25', glow: '' },
  interview:   { icon: <Mic         className="w-4 h-4" />, color: 'text-purple-400',  bg: 'bg-purple-500/12',  border: 'border-purple-500/25', glow: '' },
};

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string; accentBar: string }> = {
  placement_notice: { label: 'Placement', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', accentBar: 'accent-bar-green' },
  assignment:       { label: 'Assignment', color: 'text-brand-400',   bg: 'bg-brand-500/10 border-brand-500/20',    accentBar: 'accent-bar-blue' },
  exam:             { label: 'Exam',        color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',         accentBar: 'accent-bar-red' },
  timetable:        { label: 'Timetable',  color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20',  accentBar: 'accent-bar-yellow' },
  fee_notice:       { label: 'Fee',         color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20',  accentBar: 'accent-bar-yellow' },
  expense_receipt:  { label: 'Expense',     color: 'text-pink-400',   bg: 'bg-pink-500/10 border-pink-500/20',      accentBar: 'accent-bar-pink' },
  study_notes:      { label: 'Study Kit',   color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', accentBar: 'accent-bar-purple' },
  content_request:  { label: 'Draft Ready', color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20',     accentBar: 'accent-bar-cyan' },
  general:          { label: 'General',     color: 'text-white/50',   bg: 'bg-white/5 border-white/10',             accentBar: '' },
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Working late';
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
function StatCard({ value, label, icon: Icon, accent = false, alert = false, sublabel }: {
  value: number; label: string; icon: React.ElementType;
  accent?: boolean; alert?: boolean; sublabel?: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const step = Math.max(value / 20, 1);
      const t = setInterval(() => {
        cur += step;
        if (cur >= value) { setDisplayed(value); clearInterval(t); }
        else setDisplayed(Math.floor(cur));
      }, 28);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-300 overflow-hidden
        hover:-translate-y-1 hover:shadow-2xl cursor-default ${
        alert
          ? 'bg-red-950/40 border-red-500/20 hover:border-red-500/40 hover:shadow-red-950/50'
          : accent
          ? 'bg-brand-950/40 border-brand-500/20 hover:border-brand-500/40 hover:shadow-brand-950/50'
          : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:shadow-black/50'
      }`}
    >
      {/* Background shine on hover */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        alert ? 'bg-red-500/10' : accent ? 'bg-brand-500/8' : 'bg-white/3'
      }`} />

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${
        alert ? 'bg-red-500/15 shadow-[0_0_16px_rgba(239,68,68,0.15)]'
        : accent ? 'bg-brand-500/15 shadow-[0_0_16px_rgba(59,130,246,0.15)]'
        : 'bg-white/6'
      }`}>
        <Icon className={`w-5 h-5 ${alert ? 'text-red-400' : accent ? 'text-brand-400' : 'text-white/40'}`} />
      </div>

      <div>
        <p className={`text-3xl font-black tabular-nums tracking-tight ${
          alert && value > 0 ? 'text-red-400' : accent ? 'text-brand-300' : 'text-white'
        }`}>
          {displayed}
        </p>
        <p className="text-xs text-white/40 font-medium mt-1 leading-tight">{label}</p>
        {sublabel && <p className="text-[10px] text-white/20 mt-0.5">{sublabel}</p>}
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
        <h2 className="font-bold text-white text-sm tracking-tight">{title}</h2>
        {count !== undefined && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/6 text-white/35 tabular-nums border border-zinc-800">
            {count}
          </span>
        )}
      </div>
      {href && (
        <Link href={href} className="group flex items-center gap-1 text-xs text-brand-400 hover:text-white transition-colors font-semibold">
          {hrefLabel ?? 'See all'} <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

/* ─── Main dashboard ─────────────────────────────────────────────── */
export default function DashboardClient({ profile, tasks, events, reminders, intakes }: Props) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(events);
  const [localReminders, setLocalReminders] = useState<Reminder[]>(reminders);
  const [localIntakes, setLocalIntakes] = useState<Props['intakes']>(intakes);
  const [isClient, setIsClient] = useState(false);

  // Automated Integration toggle states (demo mode)
  const [googleCalendarSync, setGoogleCalendarSync] = useState(true);
  const [whatsappSync, setWhatsappSync] = useState(false);
  const [gmailSync, setGmailSync] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [voiceReadout, setVoiceReadout] = useState(true);

  useEffect(() => {
    setIsClient(true);
    if (profile.id === 'guest_user') {
      localStorage.setItem('lifeos_guest', 'true');
      const gTasks    = JSON.parse(localStorage.getItem('lifeos_guest_tasks')    || '[]');
      const gEvents   = JSON.parse(localStorage.getItem('lifeos_guest_events')   || '[]');
      const gReminders= JSON.parse(localStorage.getItem('lifeos_guest_reminders')|| '[]');
      const gIntakes  = JSON.parse(localStorage.getItem('lifeos_guest_intakes')  || '[]');
      setLocalTasks(gTasks);
      setLocalEvents(gEvents);
      setLocalReminders(gReminders);
      setLocalIntakes(gIntakes);

      const clearGuestData = () => {
        localStorage.removeItem('lifeos_guest_tasks');
        localStorage.removeItem('lifeos_guest_events');
        localStorage.removeItem('lifeos_guest_reminders');
        localStorage.removeItem('lifeos_guest_intakes');
        localStorage.removeItem('lifeos_guest');
      };
      window.addEventListener('beforeunload', clearGuestData);
      return () => window.removeEventListener('beforeunload', clearGuestData);
    } else {
      localStorage.setItem('lifeos_guest', 'false');
    }
  }, [profile.id]);

  const handleToggleTask = (taskId: string) => {
    setLocalTasks((prev) => {
      const next = prev.map((t) =>
        t.id === taskId
          ? ({ ...t, status: t.status === 'pending' ? 'done' : 'pending' } as Task)
          : t
      );
      if (profile.id === 'guest_user') {
        localStorage.setItem('lifeos_guest_tasks', JSON.stringify(next));
      }
      return next;
    });
  };

  const isGuestMode = profile.id === 'guest_user';
  const displayTasks     = isClient ? localTasks     : tasks;
  const displayEvents    = isClient ? localEvents    : events;
  const displayReminders = isClient ? localReminders : reminders;
  const displayIntakes   = isClient ? localIntakes   : intakes;

  const pendingTasks      = displayTasks.filter((t) => t.status === 'pending');
  const highPriorityCount = pendingTasks.filter((t) => t.priority === 1).length;
  const upcomingEvents    = displayEvents.filter((e) => !isPast(parseISO(e.start_time)));
  const completedTasks    = displayTasks.filter((t) => t.status === 'done').length;
  const completionRate    = displayTasks.length > 0 ? Math.round((completedTasks / displayTasks.length) * 100) : 0;

  const firstName = profile.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#07070a]">
      <InstallPWA />

      {/* ── Background decoration ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Primary orb */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        {/* Secondary orbs */}
        <div className="absolute top-[40%] -left-32 w-[500px] h-[500px] rounded-full opacity-20 animate-orb-float"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)', animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, transparent 70%)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-white/5 backdrop-blur-2xl"
        style={{ background: 'rgba(7,7,10,0.75)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-brand-500/30 blur-lg" />
              <div className="relative w-8 h-8 rounded-full bg-surface-card border border-white/8 flex items-center justify-center p-1.5 shadow-[0_0_16px_rgba(59,130,246,0.4)]">
                <img src="/favicon.png" alt="LifeOS Logo" className="w-full h-full object-contain rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white tracking-tight">LifeOS</span>
                <span className="hidden sm:inline text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-brand-500/15 text-brand-400 border border-brand-500/20">
                  Dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Settings icon — always visible */}
            <Link
              href="/settings"
              id="dashboard-settings-btn"
              title="Settings"
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/80 text-white/40 hover:text-white transition-all duration-200"
            >
              <Settings2 className="w-4 h-4" />
            </Link>

            <Link
              href={isGuestMode ? "/upload?guest=true" : "/upload"}
              id="dashboard-upload-btn"
              className="group flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>Capture</span>
            </Link>
            {isGuestMode ? (
              <Link
                href="/sign-in"
                className="text-xs border border-zinc-800 hover:border-brand-500/40 hover:bg-brand-500/8 px-3.5 py-2 rounded-xl text-white/60 hover:text-white transition-all font-semibold"
              >
                Sign In
              </Link>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 space-y-7">

        {/* ── Welcome banner ── */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-3xl p-[1px]"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.5) 0%, rgba(139,92,246,0.3) 50%, rgba(16,185,129,0.3) 100%)' }}>
            <div className="w-full h-full rounded-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(12,12,18,0.98) 100%)' }} />
          </div>

          {/* Internal glow blobs */}
          <div className="absolute top-0 right-0 w-80 h-48 blur-3xl rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-32 blur-3xl rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{getGreeting()}</p>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none flex items-center gap-3">
                  {firstName}
                  <span className="inline-block w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                  </span>
                </h1>
                <p className="text-sm text-white/35 mt-2 font-medium">
                  {profile.branch}
                  <span className="mx-2 text-white/15">·</span>
                  Year {profile.year}
                  <span className="mx-2 text-white/15">·</span>
                  {profile.college || 'College'}
                </p>
              </div>

              <div className="flex items-center gap-6 sm:gap-8">
                {/* CGPA display */}
                <div className="text-center">
                  <div className="text-4xl font-black gradient-text tabular-nums leading-none">
                    {profile.cgpa}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <span className="text-[10px] text-white/25 font-semibold">/10 CGPA</span>
                  </div>
                </div>

                {/* Completion ring */}
                <div className="text-center hidden sm:block">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke="url(#ringGrad)" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - completionRate / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">Done</div>
                </div>
              </div>
            </div>

            {/* Skill chips */}
            {profile.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5 pt-5 border-t border-white/5">
                {profile.skills.slice(0, 8).map((skill) => (
                  <span key={skill}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-zinc-800 bg-white/4 text-white/40 font-medium hover:border-brand-500/30 hover:text-white/70 transition-all cursor-default">
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 8 && (
                  <span className="text-[11px] px-2.5 py-1 rounded-lg border border-zinc-800 bg-white/3 text-white/25">
                    +{profile.skills.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={pendingTasks.length}    label="Pending tasks"    icon={CheckSquare} />
          <StatCard value={highPriorityCount}       label="High priority"   icon={AlertTriangle} alert={highPriorityCount > 0} />
          <StatCard value={upcomingEvents.length}   label="Upcoming events" icon={Calendar} accent />
          <StatCard value={completedTasks}          label="Tasks completed"  icon={TrendingUp} sublabel={`${completionRate}% rate`} />
        </div>

        {/* ── Empty state ── */}
        {displayIntakes.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="relative w-28 h-28 mx-auto mb-7">
              <div className="absolute inset-0 rounded-3xl bg-brand-500/10 blur-xl animate-pulse" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/15 to-brand-700/5 border border-brand-500/15" />
              <div className="relative w-28 h-28 rounded-3xl flex items-center justify-center">
                <Camera className="w-12 h-12 text-white/20" />
              </div>
            </div>
            <h2 className="font-black text-white text-2xl mb-3 tracking-tight">Nothing captured yet</h2>
            <p className="text-white/35 text-sm mb-9 max-w-sm mx-auto leading-relaxed">
              Upload a screenshot, placement notice, or PDF and let 7 AI agents go to work instantly.
            </p>
            <Link
              href={isGuestMode ? "/upload?guest=true" : "/upload"}
              id="empty-upload-btn"
              className="inline-flex items-center gap-2.5 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.35)]"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <Zap className="w-4.5 h-4.5" />
              Capture something
            </Link>
          </div>
        )}

        {displayIntakes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column (2/3) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Recent captures */}
              <section>
                <SectionHeader
                  title="Recent Captures"
                  count={displayIntakes.length}
                  href={isGuestMode ? "/upload?guest=true" : "/upload"}
                  hrefLabel="+ New"
                />
                <div className="space-y-3">
                  {displayIntakes.map((intake, i) => {
                    const cfg = INTENT_CONFIG[intake.intent] ?? INTENT_CONFIG.general;
                    return (
                      <div
                        key={intake.id}
                        className={`group relative flex gap-4 p-4 rounded-2xl border border-zinc-800 transition-all duration-200
                          bg-zinc-900/60 hover:bg-zinc-800/60 hover:border-zinc-700 hover:-translate-y-0.5
                          hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${cfg.accentBar}`}
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        {/* Intent badge */}
                        <div className={`flex-shrink-0 mt-0.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold self-start tracking-wide ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 leading-relaxed line-clamp-2">{intake.summary}</p>

                          {/* Inline Placement Detail */}
                          {intake.placement && (
                            <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/15 text-xs">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-emerald-400">Placement · {intake.placement.company}</p>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  intake.placement.eligibility.eligible
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                    : 'bg-red-500/15 text-red-400 border-red-500/25'
                                }`}>
                                  {intake.placement.eligibility.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                                </span>
                              </div>
                              <p className="text-white/50">Role: {intake.placement.role || 'N/A'}</p>
                              {intake.placement.eligibility.overall_reasons && (
                                <p className="text-white/35 mt-1 text-[11px] leading-relaxed">{intake.placement.eligibility.overall_reasons.join(', ')}</p>
                              )}
                            </div>
                          )}

                          {/* Inline Expense Detail */}
                          {intake.expense && (
                            <div className="mt-3 p-3.5 rounded-xl bg-pink-950/30 border border-pink-500/15 text-xs">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-pink-400">Expense Tracker</p>
                                <span className="text-sm font-black text-white">₹{intake.expense.total.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="space-y-1.5">
                                {intake.expense.expenses.map((exp: any, expIdx: number) => (
                                  <div key={expIdx} className="flex justify-between text-[11px] text-white/45">
                                    <span>{exp.merchant} <span className="text-white/25">({exp.category})</span></span>
                                    <span className="font-semibold text-white/65">₹{exp.amount}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Inline Study Detail */}
                          {intake.study && (
                            <div className="mt-3 p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/15 text-xs">
                              <p className="font-bold text-violet-400 mb-1.5">Study Kit · {intake.study.subject}</p>
                              <ul className="space-y-1">
                                {intake.study.summary_points.slice(0, 3).map((pt: string, ptIdx: number) => (
                                  <li key={ptIdx} className="flex gap-2 text-white/45 text-[11px] leading-relaxed">
                                    <span className="text-violet-500/60 flex-shrink-0 mt-0.5">›</span>
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Inline Draft Detail */}
                          {intake.content && (
                            <div className="mt-3 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/15 text-xs">
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="font-bold text-cyan-400">Draft Ready</p>
                                <span className="text-white/30 text-[10px]">To: {intake.content.recipient}</span>
                              </div>
                              <p className="text-white/45 text-[11px] leading-relaxed line-clamp-2">{intake.content.draft}</p>
                            </div>
                          )}

                          <p className="text-[11px] text-white/20 mt-2.5 font-medium">
                            {format(parseISO(intake.created_at), 'EEE, MMM d · h:mm a')}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-white/12 flex-shrink-0 self-center group-hover:text-white/30 group-hover:translate-x-0.5 transition-all" />
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
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 group
                            ${cfg.accent} ${cfg.glow} ${
                            overdue
                              ? 'bg-red-950/30 border-zinc-700 hover:border-red-500/25'
                              : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
                          }`}
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="mt-1 flex-shrink-0 w-5 h-5 rounded-md bg-zinc-800 border border-white/15 hover:border-brand-500 hover:bg-brand-500/15 flex items-center justify-center transition-all group/cb active:scale-90"
                            title="Mark complete"
                          >
                            <div className="w-2 h-2 rounded-sm bg-brand-500 opacity-0 group-hover/cb:opacity-60 transition-opacity" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white leading-snug">{task.title}</p>
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
                    {/* Timeline connector */}
                    <div className="absolute left-[18px] top-4 bottom-4 w-px"
                      style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.4), rgba(16,185,129,0.2), transparent)' }} />

                    {upcomingEvents.slice(0, 6).map((event, i) => {
                      const cfg = EVENT_CONFIG[event.event_type] ?? {
                        icon: <Pin className="w-4 h-4" />, color: 'text-white/40', bg: 'bg-white/6', border: 'border-white/10', glow: ''
                      };
                      return (
                        <div key={event.id} className="relative flex gap-4 pb-4 last:pb-0 group">
                          {/* Timeline node */}
                          <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} ${cfg.glow}
                            flex items-center justify-center ${cfg.color} transition-all duration-300 group-hover:scale-110`}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 pb-1">
                            <p className="text-sm font-semibold text-white leading-snug truncate">{event.title}</p>
                            <p className={`text-[11px] mt-0.5 font-semibold ${cfg.color} opacity-80`}>
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
              {displayReminders.length > 0 && (
                <section>
                  <SectionHeader title="Reminders" count={displayReminders.length} />
                  <div className="space-y-2.5">
                    {displayReminders.map((reminder) => (
                      <div key={reminder.id}
                        className="p-4 rounded-2xl border border-yellow-500/15 bg-yellow-950/20 hover:border-yellow-500/25 transition-all group accent-bar-yellow">
                        <p className="text-sm text-white/75 leading-relaxed">{reminder.message}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-yellow-500/60 mt-2.5 font-semibold">
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
                    { href: isGuestMode ? '/upload?guest=true' : '/upload', icon: Camera,   label: 'New capture',      sub: 'Upload or paste content',   accent: true },
                    { href: isGuestMode ? '/upload?guest=true' : '/upload', icon: Target,   label: 'Placement notice', sub: 'Check eligibility',          accent: false },
                    { href: isGuestMode ? '/upload?guest=true' : '/upload', icon: BookOpen, label: 'Study material',   sub: 'Build a study plan',         accent: false },
                  ].map((action, i) => (
                    <Link
                      key={i}
                      href={action.href}
                      id={`quick-action-${i}`}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 group ${
                        action.accent
                          ? 'bg-brand-500/8 border-brand-500/20 hover:border-brand-500/35 hover:bg-brand-500/12'
                          : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                        action.accent ? 'bg-brand-500/20' : 'bg-white/6'
                      }`}>
                        <action.icon className={`w-4 h-4 ${action.accent ? 'text-brand-400' : 'text-white/40'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white leading-tight">{action.label}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">{action.sub}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>

              {/* System Settings Section */}
              <section>
                <SectionHeader title="System Settings" />
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4">
                  {/* Category 1 */}
                  <div>
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">Integrations & Sync</p>
                    <p className="text-[9px] text-white/30 mt-0.5">Toggle live automated sync sources</p>
                  </div>

                  <div className="space-y-2">
                    {/* Google Calendar */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Google Calendar</p>
                          <p className="text-[10px] text-white/30 mt-0.5">Sync exams & classes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setGoogleCalendarSync(!googleCalendarSync)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                          googleCalendarSync ? 'bg-brand-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            googleCalendarSync ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* WhatsApp Bot */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">WhatsApp Bot</p>
                          <p className="text-[10px] text-white/30 mt-0.5">Send alerts & reminders</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setWhatsappSync(!whatsappSync)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                          whatsappSync ? 'bg-brand-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            whatsappSync ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Gmail Intake */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Gmail Automations</p>
                          <p className="text-[10px] text-white/30 mt-0.5">Scan placement alerts</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setGmailSync(!gmailSync)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                          gmailSync ? 'bg-brand-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            gmailSync ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800/80 my-3" />

                  {/* Category 2 */}
                  <div>
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">Preferences</p>
                    <p className="text-[9px] text-white/30 mt-0.5">Customize demo execution parameters</p>
                  </div>

                  <div className="space-y-2">
                    {/* Agent Debug Mode */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Agent Debug Mode</p>
                          <p className="text-[10px] text-white/30 mt-0.5">View real-time engine logs</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDebugMode(!debugMode)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                          debugMode ? 'bg-brand-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            debugMode ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Voice Readout */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Voice Assistant</p>
                          <p className="text-[10px] text-white/30 mt-0.5">Text-to-speech feedback</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setVoiceReadout(!voiceReadout)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                          voiceReadout ? 'bg-brand-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            voiceReadout ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activity summary widget */}
              {displayIntakes.length > 0 && (
                <section>
                  <SectionHeader title="Activity" />
                  <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-brand-400" />
                      <span className="text-xs font-semibold text-white/60">{displayIntakes.length} capture{displayIntakes.length !== 1 ? 's' : ''} this session</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {displayIntakes.map((intake, i) => {
                        const cfg = INTENT_CONFIG[intake.intent] ?? INTENT_CONFIG.general;
                        return (
                          <div key={i} className={`w-6 h-6 rounded-md border ${cfg.bg} flex items-center justify-center`} title={cfg.label}>
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Floating capture button ── */}
      <div className="fixed bottom-6 right-6 z-30">
        <Link
          href={isGuestMode ? "/upload?guest=true" : "/upload"}
          id="fab-upload-btn"
          className="group flex items-center gap-2.5 text-white px-5 py-3.5 rounded-2xl font-bold shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
        >
          <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm">Capture</span>
        </Link>
      </div>
    </div>
  );
}
