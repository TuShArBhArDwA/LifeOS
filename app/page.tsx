import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { Camera, Brain, Zap, CheckCircle2, Cpu, CheckSquare, Target, Calendar, Bell } from 'lucide-react';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-surface flex flex-col overflow-hidden relative">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent-purple/8 blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="LifeOS Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-bold text-lg tracking-tight">LifeOS</span>
        </div>
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <button id="nav-signin-btn" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-surface-elevated">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button id="nav-signup-btn" className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-medium transition-all hover:shadow-brand">
              Get started →
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-4xl mx-auto w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-medium text-brand-300 mb-8 animate-fade-in border border-brand-500/20">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          AI Chief of Staff for Students
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 animate-slide-up">
          Your campus chaos,
          <br />
          <span className="gradient-text">finally organized.</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Drop a screenshot, notice, or PDF. LifeOS reads it, checks your eligibility,
          creates tasks, sets reminders, and builds your study plan — in under 10 seconds.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <SignUpButton mode="modal">
            <button id="hero-cta-btn" className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-lg transition-all hover:shadow-brand hover:scale-105 active:scale-95">
              Try LifeOS free →
            </button>
          </SignUpButton>
          <Link href="#how-it-works" id="hero-learn-btn" className="px-8 py-4 glass border border-white/10 text-white/70 hover:text-white rounded-2xl font-medium text-lg transition-all hover:border-brand-500/40">
            See how it works
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 w-full max-w-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { value: '< 10s', label: 'Processing time' },
            { value: '5', label: 'AI Agents' },
            { value: '0', label: 'Manual effort' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 px-6 py-20 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: <Camera className="w-8 h-8 text-brand-400 mx-auto" />, title: 'Capture', desc: 'Screenshot, PDF, text, or voice' },
            { step: '02', icon: <Brain className="w-8 h-8 text-brand-400 mx-auto" />, title: 'Understand', desc: 'AI extracts intent and data' },
            { step: '03', icon: <Zap className="w-8 h-8 text-brand-400 mx-auto" />, title: 'Act', desc: 'Agents collaborate in parallel' },
            { step: '04', icon: <CheckCircle2 className="w-8 h-8 text-brand-400 mx-auto" />, title: 'Done', desc: 'Tasks, schedule, plan — ready' },
          ].map((item) => (
            <div key={item.step} className="glass rounded-2xl p-6 text-center hover:border-brand-500/30 transition-all hover:-translate-y-1 border border-transparent flex flex-col items-center">
              <div className="mb-3">{item.icon}</div>
              <div className="text-xs text-brand-400 font-mono mb-1">{item.step}</div>
              <div className="font-semibold mb-2">{item.title}</div>
              <div className="text-sm text-white/50">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Five Specialized Agents */}
      <section className="relative z-10 px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Five Specialized Agents, One Unified Brain</h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            LifeOS orchestrates five dedicated intelligence layers that coordinate in parallel to manage your tasks, placement status, schedules, and alerts.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              icon: <Cpu className="w-5 h-5 text-brand-400" />,
              title: 'Orchestrator',
              desc: 'Parses inputs, classifies intent, and coordinates parallel execution.'
            },
            {
              icon: <CheckSquare className="w-5 h-5 text-brand-400" />,
              title: 'Task Agent',
              desc: 'Extracts deadlines, assigns priority scores, and creates time-blocked tasks.'
            },
            {
              icon: <Target className="w-5 h-5 text-brand-400" />,
              title: 'Placement Agent',
              desc: 'Monitors notices, checks eligibility, and schedules mock interviews.'
            },
            {
              icon: <Calendar className="w-5 h-5 text-brand-400" />,
              title: 'Schedule Agent',
              desc: 'Auto-builds weekly timetables synced to classes and deadlines.'
            },
            {
              icon: <Bell className="w-5 h-5 text-brand-400" />,
              title: 'Reminder Agent',
              desc: 'Context-aware alerts explaining why it matters and if it is missed.'
            }
          ].map((agent, index) => (
            <div key={index} className="glass rounded-2xl p-5 border border-surface-border hover:border-brand-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                  {agent.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{agent.title}</h3>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed mt-2">{agent.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="relative z-10 px-6 pb-20 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-12">Built for real student moments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              tag: 'Placement',
              title: 'TCS NQT notice in WhatsApp',
              result: 'Eligibility checked, tasks created, prep plan generated',
              color: 'text-accent-green',
              bg: 'border-accent-green/20',
            },
            {
              tag: 'Assignment',
              title: 'Prof\'s email: "Submit by Friday"',
              result: 'Task created, study blocks scheduled, reminder set for Thursday',
              color: 'text-accent-yellow',
              bg: 'border-accent-yellow/20',
            },
            {
              tag: 'Exam',
              title: 'Exam schedule PDF uploaded',
              result: '2-week subject-wise study plan, daily time blocks, countdown reminders',
              color: 'text-accent-purple',
              bg: 'border-accent-purple/20',
            },
          ].map((uc) => (
            <div key={uc.tag} className={`glass rounded-2xl p-6 border ${uc.bg} hover:-translate-y-1 transition-all`}>
              <span className={`text-xs font-bold ${uc.color} uppercase tracking-wider`}>{uc.tag}</span>
              <p className="text-white/80 font-medium mt-2 mb-3">"{uc.title}"</p>
              <p className="text-sm text-white/40">{uc.result}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 text-center px-6 pb-16">
        <div className="glass-strong rounded-3xl p-10 max-w-xl mx-auto border border-brand-500/20">
          <h2 className="text-2xl font-bold mb-3">Ready to take control?</h2>
          <p className="text-white/50 mb-6">Join students who&apos;ve stopped missing deadlines.</p>
          <SignUpButton mode="modal">
            <button id="footer-cta-btn" className="px-8 py-4 bg-gradient-brand text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity hover:shadow-brand">
              Start for free →
            </button>
          </SignUpButton>
        </div>
      </section>
    </main>
  );
}
