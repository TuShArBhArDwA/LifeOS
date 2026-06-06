'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Sparkles, Calendar, MessageSquare, Mail,
  Bell, Cpu, Mic, Shield, Zap, ChevronRight,
  CheckCircle2, Clock, Bot, Phone, AtSign,
  ToggleLeft, AlertCircle, Smartphone
} from 'lucide-react';

/* ─── Toggle component ────────────────────────────────────────── */
function Toggle({
  enabled,
  onChange,
  size = 'md',
}: {
  enabled: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
}) {
  const track = size === 'sm' ? 'w-8 h-4' : 'w-11 h-6';
  const thumb = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const translate = size === 'sm'
    ? (enabled ? 'translate-x-4' : 'translate-x-0.5')
    : (enabled ? 'translate-x-5' : 'translate-x-1');

  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={enabled}
      className={`relative inline-flex items-center ${track} rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 ${
        enabled ? 'bg-brand-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'bg-zinc-700'
      }`}
    >
      <div
        className={`${thumb} rounded-full bg-white shadow-md transform transition-transform duration-300 ${translate}`}
      />
    </button>
  );
}

/* ─── Status pill ─────────────────────────────────────────────── */
function StatusPill({ active, activeLabel = 'Connected', inactiveLabel = 'Disconnected' }: {
  active: boolean; activeLabel?: string; inactiveLabel?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
      active
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-zinc-800 text-white/30 border-zinc-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

/* ─── Section wrapper ─────────────────────────────────────────── */
function Section({ title, subtitle, icon: Icon, iconColor, children }: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/80">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="text-[11px] text-white/35 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="divide-y divide-zinc-800/60">{children}</div>
    </div>
  );
}

/* ─── Integration row ─────────────────────────────────────────── */
function IntegrationRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  enabled,
  onChange,
  badge,
  comingSoon = false,
  expandedContent,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  badge?: React.ReactNode;
  comingSoon?: boolean;
  expandedContent?: React.ReactNode;
}) {
  return (
    <div className={`transition-all duration-300 ${enabled && expandedContent ? '' : ''}`}>
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white">{title}</p>
            {badge}
            {comingSoon && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
                Soon
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{description}</p>
        </div>
        <Toggle enabled={enabled && !comingSoon} onChange={comingSoon ? () => {} : onChange} />
      </div>
      {enabled && expandedContent && (
        <div className="px-5 pb-4 pt-0">
          <div className="ml-14 p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/50 space-y-3">
            {expandedContent}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function SettingsClient() {
  // Guest mode detection
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setIsGuest(localStorage.getItem('lifeos_guest') === 'true');
  }, []);

  const dashboardHref = isGuest ? '/dashboard?guest=true' : '/dashboard';

  // Integration toggles
  const [googleCalendar, setGoogleCalendar] = useState(true);
  const [whatsappBot, setWhatsappBot] = useState(false);
  const [gmailScan, setGmailScan] = useState(true);

  // WhatsApp sub-settings
  const [waAutoReply, setWaAutoReply] = useState(true);
  const [waReminderNotif, setWaReminderNotif] = useState(true);
  const [waPlacementAlert, setWaPlacementAlert] = useState(true);

  // Gmail sub-settings
  const [gmailPlacementScan, setGmailPlacementScan] = useState(true);
  const [gmailDeadlineScan, setGmailDeadlineScan] = useState(false);

  // Notification toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [reminderNotifs, setReminderNotifs] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [placementAlerts, setPlacementAlerts] = useState(true);

  // Preferences
  const [debugMode, setDebugMode] = useState(false);
  const [voiceAssistant, setVoiceAssistant] = useState(false);
  const [agentLogs, setAgentLogs] = useState(false);

  return (
    <div className="min-h-screen bg-[#07070a]">

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 backdrop-blur-2xl"
        style={{ background: 'rgba(7,7,10,0.80)' }}>
        <div className="flex items-center gap-4 px-5 py-3.5 max-w-3xl mx-auto">
          <Link
            href={dashboardHref}
            id="settings-back-btn"
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-brand-500/30 blur-md" />
              <div className="relative w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="font-bold text-sm text-white">Settings</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">System Settings</h1>
          <p className="text-sm text-white/35 mt-1.5">
            Configure integrations, notifications, and agent behavior. Toggles are wired up — functionality comes live at launch.
          </p>
        </div>

        {/* ── Integrations ── */}
        <Section
          title="Integrations"
          subtitle="Connect external platforms to automate your workflow"
          icon={Zap}
          iconColor="bg-brand-500/15 border border-brand-500/25 text-brand-400"
        >
          {/* Google Calendar */}
          <IntegrationRow
            icon={Calendar}
            iconBg="bg-blue-500/10 border-blue-500/20"
            iconColor="text-blue-400"
            title="Google Calendar"
            description="Auto-create calendar events for exams, deadlines & study blocks extracted by agents"
            enabled={googleCalendar}
            onChange={() => setGoogleCalendar(!googleCalendar)}
            badge={<StatusPill active={googleCalendar} />}
            expandedContent={
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Sync options</p>
                {[
                  { label: 'Exam & deadline events', desc: 'Auto-block exam dates from placement notices' },
                  { label: 'Study time blocks', desc: 'Schedule AI-generated prep sessions' },
                  { label: 'Interview slots', desc: 'Add company HR interview reminders' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white/70">{item.label}</p>
                      <p className="text-[10px] text-white/30">{item.desc}</p>
                    </div>
                    <Toggle enabled size="sm" onChange={() => {}} />
                  </div>
                ))}
              </div>
            }
          />

          {/* WhatsApp Business */}
          <IntegrationRow
            icon={MessageSquare}
            iconBg="bg-emerald-500/10 border-emerald-500/20"
            iconColor="text-emerald-400"
            title="WhatsApp Business Bot"
            description="LifeOS bot sends smart reminders, placement alerts & replies to your messages on WhatsApp"
            enabled={whatsappBot}
            onChange={() => setWhatsappBot(!whatsappBot)}
            badge={<StatusPill active={whatsappBot} activeLabel="Bot Active" inactiveLabel="Offline" />}
            expandedContent={
              <div className="space-y-3">
                {/* Bot number preview */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-400">WhatsApp Business API</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Bot number: +91 XXXXX XXXXX · via Twilio</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    API Ready
                  </span>
                </div>

                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Bot capabilities</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <p className="text-xs font-semibold text-white/70">Auto-reply to queries</p>
                        <p className="text-[10px] text-white/30">Reply with tasks & deadlines on request</p>
                      </div>
                    </div>
                    <Toggle enabled={waAutoReply} onChange={() => setWaAutoReply(!waAutoReply)} size="sm" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-yellow-400" />
                      <div>
                        <p className="text-xs font-semibold text-white/70">Reminder notifications</p>
                        <p className="text-[10px] text-white/30">Push reminders 1 hr & 15 min before</p>
                      </div>
                    </div>
                    <Toggle enabled={waReminderNotif} onChange={() => setWaReminderNotif(!waReminderNotif)} size="sm" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-brand-400" />
                      <div>
                        <p className="text-xs font-semibold text-white/70">Placement alerts</p>
                        <p className="text-[10px] text-white/30">Instant WhatsApp ping when eligible</p>
                      </div>
                    </div>
                    <Toggle enabled={waPlacementAlert} onChange={() => setWaPlacementAlert(!waPlacementAlert)} size="sm" />
                  </div>
                </div>

                {/* Incoming data */}
                <div className="h-px bg-zinc-700/50" />
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Incoming data extraction</p>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-700/30">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Forward any WhatsApp message to the bot — LifeOS will parse placement notices, fee alerts, and timetables automatically.
                  </p>
                </div>
              </div>
            }
          />

          {/* Gmail */}
          <IntegrationRow
            icon={Mail}
            iconBg="bg-red-500/10 border-red-500/20"
            iconColor="text-red-400"
            title="Gmail Automations"
            description="Scan your inbox for placement emails, fee notices & deadline alerts — auto-process them as intakes"
            enabled={gmailScan}
            onChange={() => setGmailScan(!gmailScan)}
            badge={<StatusPill active={gmailScan} activeLabel="Scanning" />}
            expandedContent={
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/8 border border-red-500/15">
                  <AtSign className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-red-400">Gmail OAuth · Read-only access</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Only reads — never sends on your behalf</p>
                  </div>
                </div>

                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Scan filters</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white/70">Placement & job emails</p>
                      <p className="text-[10px] text-white/30">TCS, Infosys, campus HR notifications</p>
                    </div>
                    <Toggle enabled={gmailPlacementScan} onChange={() => setGmailPlacementScan(!gmailPlacementScan)} size="sm" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white/70">Deadline & fee notices</p>
                      <p className="text-[10px] text-white/30">Fee payment reminders, exam form alerts</p>
                    </div>
                    <Toggle enabled={gmailDeadlineScan} onChange={() => setGmailDeadlineScan(!gmailDeadlineScan)} size="sm" />
                  </div>
                </div>
              </div>
            }
          />
        </Section>

        {/* ── Notifications ── */}
        <Section
          title="Notifications"
          subtitle="Control when and how LifeOS alerts you"
          icon={Bell}
          iconColor="bg-yellow-500/15 border border-yellow-500/25 text-yellow-400"
        >
          {[
            {
              label: 'Push notifications',
              desc: 'In-app alerts for new agent results',
              enabled: pushNotifs,
              toggle: () => setPushNotifs(!pushNotifs),
              icon: Smartphone,
              color: 'text-brand-400',
              bg: 'bg-brand-500/10 border-brand-500/20',
            },
            {
              label: 'Reminder alerts',
              desc: '15 min & 1 hr before scheduled events',
              enabled: reminderNotifs,
              toggle: () => setReminderNotifs(!reminderNotifs),
              icon: Clock,
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10 border-yellow-500/20',
            },
            {
              label: 'Deadline warnings',
              desc: 'Alert when a task goes overdue',
              enabled: deadlineAlerts,
              toggle: () => setDeadlineAlerts(!deadlineAlerts),
              icon: AlertCircle,
              color: 'text-red-400',
              bg: 'bg-red-500/10 border-red-500/20',
            },
            {
              label: 'Placement alerts',
              desc: 'Notify when an eligible company is detected',
              enabled: placementAlerts,
              toggle: () => setPlacementAlerts(!placementAlerts),
              icon: CheckCircle2,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{item.desc}</p>
              </div>
              <Toggle enabled={item.enabled} onChange={item.toggle} />
            </div>
          ))}
        </Section>

        {/* ── Agent & Debug ── */}
        <Section
          title="Agent Preferences"
          subtitle="Customize AI engine behavior and debug options"
          icon={Cpu}
          iconColor="bg-purple-500/15 border border-purple-500/25 text-purple-400"
        >
          {[
            {
              label: 'Voice Assistant',
              desc: 'Text-to-speech readout of agent summaries',
              enabled: voiceAssistant,
              toggle: () => setVoiceAssistant(!voiceAssistant),
              icon: Mic,
              color: 'text-pink-400',
              bg: 'bg-pink-500/10 border-pink-500/20',
              soon: false,
            },
            {
              label: 'Agent Debug Mode',
              desc: 'View raw JSON output from each agent step',
              enabled: debugMode,
              toggle: () => setDebugMode(!debugMode),
              icon: Cpu,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10 border-purple-500/20',
              soon: false,
            },
            {
              label: 'Live Agent Logs',
              desc: 'Stream real-time pipeline execution to console',
              enabled: agentLogs,
              toggle: () => setAgentLogs(!agentLogs),
              icon: ToggleLeft,
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 border-cyan-500/20',
              soon: false,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{item.desc}</p>
              </div>
              <Toggle enabled={item.enabled} onChange={item.toggle} />
            </div>
          ))}
        </Section>

        {/* ── Privacy ── */}
        <Section
          title="Privacy & Security"
          subtitle="Your data stays on your device — no third-party sharing"
          icon={Shield}
          iconColor="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
        >
          {[
            {
              label: 'Data stored locally',
              desc: 'Guest session data never leaves your browser',
              icon: Shield,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              value: 'Enabled',
              valueColor: 'text-emerald-400',
            },
            {
              label: 'API key encryption',
              desc: 'Keys stored as server-side env variables only',
              icon: CheckCircle2,
              color: 'text-brand-400',
              bg: 'bg-brand-500/10 border-brand-500/20',
              value: 'Secure',
              valueColor: 'text-brand-400',
            },
            {
              label: 'WhatsApp read-only',
              desc: 'Bot only reads forwarded messages, never your contacts',
              icon: MessageSquare,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              value: 'Read-only',
              valueColor: 'text-white/40',
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{item.desc}</p>
              </div>
              <span className={`text-xs font-bold ${item.valueColor}`}>{item.value}</span>
            </div>
          ))}
        </Section>

        {/* Back to dashboard */}
        <Link
          href={dashboardHref}
          id="settings-footer-back-btn"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all text-sm font-semibold text-white/50 hover:text-white group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </main>
    </div>
  );
}
