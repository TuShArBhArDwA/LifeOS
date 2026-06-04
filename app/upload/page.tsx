'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UploadZone from '@/components/UploadZone';
import AgentThinking from '@/components/AgentThinking';
import { TasksCard, EventsCard, PlacementCard, RemindersCard } from '@/components/ActionCards';
import type { GeneratedTask } from '@/lib/agents/task-agent';
import type { GeneratedEvent } from '@/lib/agents/schedule-agent';
import type { PlacementAgentOutput } from '@/lib/agents/placement-agent';
import type { GeneratedReminder } from '@/lib/agents/reminder-agent';

type ProcessingState = 'idle' | 'processing' | 'done' | 'error';

type IntakeResult = {
  orchestrator: { intent: string; summary: string; confidence: number };
  tasks: GeneratedTask[];
  events: GeneratedEvent[];
  placement: PlacementAgentOutput | null;
  reminders: GeneratedReminder[];
};

export default function UploadPage() {
  const router = useRouter();
  const [state, setState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState<string>('');

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
        // Don't set Content-Type — browser sets multipart boundary automatically
      } else if (text) {
        body = JSON.stringify({ text, inputType: 'text' });
        contentType = 'application/json';
      } else {
        throw new Error('No input provided');
      }

      const res = await fetch('/api/intake', {
        method: 'POST',
        body,
        headers: contentType ? { 'Content-Type': contentType } : undefined,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Processing failed');
      }

      const data = await res.json();
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
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong border-b border-surface-border safe-top">
        <div className="flex items-center justify-between px-5 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" id="upload-back-btn" className="w-9 h-9 rounded-xl bg-surface-elevated flex items-center justify-center text-white/60 hover:text-white transition-colors">
              ←
            </Link>
            <div>
              <h1 className="font-bold text-sm">Upload to LifeOS</h1>
              <p className="text-xs text-white/40">Screenshot, PDF, or paste text</p>
            </div>
          </div>
          {state === 'done' && (
            <button
              id="upload-new-btn"
              onClick={handleReset}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium px-3 py-1.5 rounded-xl bg-brand-500/10"
            >
              + New Upload
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 pb-24">
        {/* IDLE — show upload zone */}
        {state === 'idle' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-2">
              <h2 className="text-xl font-bold text-white">Drop anything.</h2>
              <p className="text-white/40 text-sm mt-1">LifeOS handles the rest.</p>
            </div>
            <UploadZone onUpload={handleUpload} loading={false} />

            {/* Example inputs */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3 text-center">Try an example</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'example-tcs',
                    label: '🏢 Placement notice',
                    text: 'TCS NQT Drive — Register by June 7, 2026. Eligibility: 60% aggregate, No active backlogs. Required documents: Updated resume, College ID, 10th & 12th marksheets. Venue: Auditorium A. Reporting time: 9:00 AM.',
                  },
                  {
                    id: 'example-assignment',
                    label: '📚 Assignment deadline',
                    text: 'DBMS Mini Project submission is due this Friday. You need to submit a working prototype + 5-page report to the college portal. Late submissions will not be accepted.',
                  },
                  {
                    id: 'example-exam',
                    label: '📝 Exam schedule',
                    text: 'End Semester Exams start June 15, 2026. Data Structures: June 15, Operating Systems: June 18, Computer Networks: June 20, DBMS: June 22. Exam time: 10 AM - 1 PM.',
                  },
                ].map((ex) => (
                  <button
                    key={ex.id}
                    id={ex.id}
                    onClick={() => handleUpload(null, ex.text)}
                    className="w-full text-left px-4 py-3 glass border border-surface-border rounded-2xl text-sm text-white/60 hover:text-white hover:border-brand-500/30 transition-all"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROCESSING — agent thinking animation */}
        {state === 'processing' && (
          <div className="animate-fade-in">
            <AgentThinking />
          </div>
        )}

        {/* ERROR */}
        {state === 'error' && (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-sm text-white/40 mb-6">{error}</p>
            <button
              id="error-retry-btn"
              onClick={handleReset}
              className="px-6 py-3 bg-brand-500 text-white rounded-2xl font-medium hover:bg-brand-600 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* DONE — show action cards */}
        {state === 'done' && result && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary banner */}
            <div className="glass-strong border border-brand-500/20 rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl flex-shrink-0">✨</div>
                <div>
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-1">LifeOS Summary</p>
                  <p className="text-white font-medium text-sm leading-relaxed">{result.orchestrator.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-surface-elevated px-2 py-0.5 rounded-full text-white/40 capitalize">
                      {result.orchestrator.intent.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {Math.round(result.orchestrator.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent output cards */}
            <TasksCard tasks={result.tasks} />
            <EventsCard events={result.events} />
            {result.placement && <PlacementCard placement={result.placement} />}
            <RemindersCard reminders={result.reminders} />

            {/* Navigation */}
            <div className="pt-4 flex gap-3">
              <button
                id="done-new-upload-btn"
                onClick={handleReset}
                className="flex-1 py-4 glass border border-surface-border rounded-2xl text-white/60 hover:text-white font-medium text-sm transition-all"
              >
                + New upload
              </button>
              <Link
                href="/dashboard"
                id="done-dashboard-btn"
                className="flex-1 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-sm text-center transition-all"
              >
                View Dashboard →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
