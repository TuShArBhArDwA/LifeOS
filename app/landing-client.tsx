'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import {
  Camera, Brain, Zap, CheckCircle2,
  Cpu, CheckSquare, Target, Calendar, Bell,
  ArrowRight, Sparkles, ChevronDown
} from 'lucide-react';

/* ─── Animated counter hook ─────────────────────────────────────── */
function useCountUp(end: number, duration = 1200, suffix = '') {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let start = 0;
        const step = end / (duration / 16);
        const t = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(t); }
          else setVal(Math.floor(start));
        }, 16);
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return { val, ref, display: `${val}${suffix}` };
}

/* ─── Scroll fade-in hook ────────────────────────────────────────── */
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    },
  };
}

/* ─── Typewriter ─────────────────────────────────────────────────── */
const WORDS = ['organized.', 'automated.', 'simplified.', 'handled.'];
function Typewriter() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIdx];
    if (!deleting && displayed.length < word.length) {
      const t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 70);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === word.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % WORDS.length);
    }
  }, [displayed, deleting, wordIdx]);

  return (
    <span className="gradient-text">
      {displayed}
      <span className="animate-pulse text-brand-400">|</span>
    </span>
  );
}

/* ─── Floating particle ──────────────────────────────────────────── */
function Orb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />;
}

/* ─── Agent flow card ────────────────────────────────────────────── */
const AGENTS = [
  { icon: Cpu,         label: 'Orchestrator',  color: 'text-brand-400',   bg: 'bg-brand-500/10',   delay: 0 },
  { icon: CheckSquare, label: 'Task Agent',     color: 'text-accent-green',bg: 'bg-accent-green/10', delay: 150 },
  { icon: Target,      label: 'Placement',      color: 'text-accent-purple',bg: 'bg-accent-purple/10',delay: 300 },
  { icon: Calendar,    label: 'Schedule',       color: 'text-accent-yellow',bg: 'bg-accent-yellow/10',delay: 450 },
  { icon: Bell,        label: 'Reminders',      color: 'text-accent-orange',bg: 'bg-accent-orange/10',delay: 600 },
];

/* ─── Main component ─────────────────────────────────────────────── */
export default function LandingClient() {
  const s1 = useFadeIn(0);
  const s2 = useFadeIn(100);
  const s3 = useFadeIn(0);
  const s4 = useFadeIn(0);
  const s5 = useFadeIn(0);

  const c1 = useCountUp(10, 1000, 's');
  const c3 = useCountUp(0, 800);

  return (
    <main className="min-h-screen bg-surface flex flex-col overflow-hidden relative">

      {/* ── Background orbs ── */}
      <Orb className="top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-500/12 animate-pulse-glow" />
      <Orb className="top-[40%] right-[-150px] w-[500px] h-[500px] bg-accent-purple/8" />
      <Orb className="bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-accent-green/6" />

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-brand-500/20 blur-md" />
            <img src="/favicon.png" alt="LifeOS" className="relative w-9 h-9 rounded-xl object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight">LifeOS</span>
        </div>
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <button id="nav-signin-btn" className="text-sm text-white/55 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-surface-elevated">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button id="nav-signup-btn" className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all hover:shadow-brand hover:scale-105 active:scale-95 flex items-center gap-1.5">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 max-w-5xl mx-auto w-full">

        {/* Badge */}
        <div
          ref={s1.ref}
          style={s1.style}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-brand-300 mb-8 border border-brand-500/25 bg-brand-500/8 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Chief of Staff for Students
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
        </div>

        {/* Headline */}
        <div ref={s2.ref} style={s2.style}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            Your campus chaos,
            <br />
            <Typewriter />
          </h1>
          <p className="text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed">
            Drop a screenshot, notice, or PDF. LifeOS reads it, checks your eligibility,
            creates tasks, sets reminders, and builds your study plan — in under 10 seconds.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <SignUpButton mode="modal">
              <button
                id="hero-cta-btn"
                className="group relative px-9 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                {/* Shimmer sweep */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2 justify-center">
                  Try LifeOS free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </SignUpButton>
            <Link
              href="#how-it-works"
              id="hero-learn-btn"
              className="px-9 py-4 glass border border-white/10 text-white/65 hover:text-white rounded-2xl font-medium text-lg transition-all hover:border-brand-500/40 hover:bg-brand-500/5"
            >
              See how it works
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {[
              { ref: c1.ref, display: `< ${c1.display}`, label: 'Processing time' },
              { ref: undefined, display: '5', label: 'AI Agents' },
              { ref: c3.ref, display: `${c3.display} clicks`, label: 'Manual effort' },
            ].map((stat, i) => (
              <div key={i} className="text-center" ref={stat.ref}>
                <div className="text-3xl font-black gradient-text">{stat.display}</div>
                <div className="text-xs text-white/35 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <a href="#how-it-works" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 hover:text-white/50 transition-colors animate-bounce-soft">
          <ChevronDown className="w-5 h-5" />
        </a>
      </section>

      {/* ── AGENT PIPELINE VISUALIZATION ── */}
      <section ref={s3.ref} style={s3.style} className="relative z-10 px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="glass-strong rounded-3xl border border-white/6 p-8 md:p-12 overflow-hidden relative">
          {/* Glow behind */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-500/10 blur-3xl" />

          <div className="relative">
            <p className="text-xs text-brand-400 font-mono font-semibold uppercase tracking-widest text-center mb-2">Live pipeline</p>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Five Specialized Agents, One Unified Brain</h2>

            {/* Input → agents flow */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 justify-center">

              {/* Input node */}
              <div className="flex flex-col items-center gap-2 min-w-[100px]">
                <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-2xl bg-brand-500/10 animate-pulse" />
                  <Camera className="w-6 h-6 text-brand-300 relative" />
                </div>
                <span className="text-[10px] text-white/35 font-medium">Your input</span>
              </div>

              {/* Arrow + line */}
              <div className="hidden md:flex items-center gap-0 mx-2">
                <div className="w-10 h-px bg-gradient-to-r from-white/10 to-brand-500/50" />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              </div>

              {/* Orchestrator */}
              <div className="flex flex-col items-center gap-2 min-w-[110px]">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-brand-400" />
                </div>
                <span className="text-[10px] text-white/35 font-medium">Orchestrator</span>
              </div>

              {/* Fork lines */}
              <div className="hidden md:block w-10 mx-2">
                <div className="h-px bg-gradient-to-r from-brand-500/50 to-white/5 w-full" />
              </div>

              {/* Parallel agents */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-2.5">
                {AGENTS.slice(1).map((agent, i) => {
                  const Icon = agent.icon;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-white/6 ${agent.bg} hover:border-white/15 transition-all duration-300`}
                      style={{ animationDelay: `${agent.delay}ms` }}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${agent.color}`} />
                      <span className="text-xs font-medium text-white/70">{agent.label}</span>
                      <div className={`ml-auto w-1.5 h-1.5 rounded-full ${agent.color.replace('text-', 'bg-')} opacity-60 animate-pulse`}
                        style={{ animationDelay: `${agent.delay}ms` }} />
                    </div>
                  );
                })}
              </div>

              {/* Output */}
              <div className="hidden md:flex items-center gap-0 mx-2">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <div className="w-10 h-px bg-gradient-to-r from-accent-green/50 to-white/10" />
              </div>

              <div className="flex flex-col items-center gap-2 min-w-[100px]">
                <div className="w-14 h-14 rounded-2xl bg-accent-green/10 border border-accent-green/25 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-accent-green" />
                </div>
                <span className="text-[10px] text-white/35 font-medium">Plan ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" ref={s4.ref} style={s4.style} className="relative z-10 px-6 py-16 max-w-5xl mx-auto w-full">
        <p className="text-xs text-brand-400 font-mono font-semibold uppercase tracking-widest text-center mb-2">How it works</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">From mess to plan in seconds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-9 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
          {[
            { step: '01', Icon: Camera,       title: 'Capture',    desc: 'Screenshot, PDF, text, or voice recording' },
            { step: '02', Icon: Brain,         title: 'Understand', desc: 'AI extracts intent, entities, and deadlines' },
            { step: '03', Icon: Zap,           title: 'Act',        desc: '5 agents collaborate in parallel instantly' },
            { step: '04', Icon: CheckCircle2,  title: 'Done',       desc: 'Tasks, schedule, reminders — all ready' },
          ].map((item, i) => (
            <div
              key={item.step}
              className="group relative glass rounded-2xl p-6 text-center hover:border-brand-500/30 transition-all hover:-translate-y-1.5 border border-transparent flex flex-col items-center gap-3"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="relative w-[52px] h-[52px] rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto group-hover:bg-brand-500/20 transition-colors">
                <item.Icon className="w-6 h-6 text-brand-400" />
              </div>
              <div className="text-[10px] text-brand-500/70 font-mono font-bold tracking-widest">{item.step}</div>
              <div className="font-semibold text-white">{item.title}</div>
              <div className="text-sm text-white/45 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="relative z-10 px-6 py-12 max-w-5xl mx-auto w-full">
        <p className="text-xs text-brand-400 font-mono font-semibold uppercase tracking-widest text-center mb-2">Real scenarios</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Built for real student moments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              tag: 'Placement',
              icon: Target,
              title: '"TCS NQT notice just dropped in WhatsApp"',
              result: 'Eligibility checked, tasks created, full prep plan generated in 8 seconds.',
              accent: 'accent-green',
            },
            {
              tag: 'Assignment',
              icon: CheckSquare,
              title: '"Prof\'s email: Submit by this Friday"',
              result: 'Task created, study blocks scheduled, reminder set for Thursday 9AM.',
              accent: 'accent-yellow',
            },
            {
              tag: 'Exam',
              icon: Brain,
              title: '"End-sem exam schedule PDF uploaded"',
              result: '2-week subject-wise study plan, daily time blocks, countdown reminders.',
              accent: 'accent-purple',
            },
          ].map((uc, i) => {
            const Icon = uc.icon;
            const accentColor = {
              'accent-green':  { border: 'border-accent-green/20',  bg: 'bg-accent-green/5',  tag: 'text-accent-green',  icon: 'text-accent-green' },
              'accent-yellow': { border: 'border-accent-yellow/20', bg: 'bg-accent-yellow/5', tag: 'text-accent-yellow', icon: 'text-accent-yellow' },
              'accent-purple': { border: 'border-accent-purple/20', bg: 'bg-accent-purple/5', tag: 'text-accent-purple', icon: 'text-accent-purple' },
            }[uc.accent]!;
            return (
              <div
                key={i}
                className={`group glass rounded-2xl p-6 border ${accentColor.border} hover:-translate-y-2 transition-all duration-300 flex flex-col gap-4`}
              >
                <div className={`w-10 h-10 rounded-xl ${accentColor.bg} border ${accentColor.border} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${accentColor.icon}`} />
                </div>
                <div>
                  <span className={`text-[10px] font-bold ${accentColor.tag} uppercase tracking-widest`}>{uc.tag}</span>
                  <p className="text-white/85 font-semibold mt-1.5 leading-snug">{uc.title}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/45 leading-relaxed">{uc.result}</p>
                </div>
                <div className={`h-px w-full ${accentColor.bg} rounded-full`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section ref={s5.ref} style={s5.style} className="relative z-10 px-6 py-20 max-w-3xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient border beam */}
          <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-brand-500/60 via-accent-purple/30 to-accent-green/40">
            <div className="w-full h-full rounded-3xl bg-surface-card" />
          </div>

          {/* Glow */}
          <div className="absolute inset-0 bg-brand-500/5 rounded-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-brand-500/15 blur-3xl" />

          <div className="relative text-center px-8 py-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold text-accent-green border border-accent-green/20 bg-accent-green/8 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              Free to start, no credit card
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Stop missing deadlines.
              <br />
              <span className="gradient-text">Start today.</span>
            </h2>
            <p className="text-white/45 mb-10 max-w-md mx-auto leading-relaxed">
              Join students who've automated their campus chaos. Takes 30 seconds to set up.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton mode="modal">
                <button
                  id="footer-cta-btn"
                  className="group relative px-10 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 hover:shadow-brand overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-2 justify-center">
                    Start for free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button id="footer-signin-btn" className="px-10 py-4 glass border border-white/10 hover:border-white/20 text-white/65 hover:text-white rounded-2xl font-medium text-lg transition-all">
                  Already have an account
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer bar ── */}
      <footer className="relative z-10 text-center pb-8 text-xs text-white/20">
        © 2025 LifeOS · Built for students, by students
      </footer>
    </main>
  );
}
