'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MBA', 'MCA', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG'];
const SKILLS_OPTIONS = ['Python', 'Java', 'C++', 'JavaScript', 'React', 'SQL', 'ML/AI', 'Data Analysis', 'Node.js', 'Flutter'];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: user?.fullName ?? '',
    cgpa: '',
    branch: '',
    year: '',
    college: '',
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email: user?.primaryEmailAddress?.emailAddress,
          skills: selectedSkills,
        }),
      });
      if (res.ok) router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* BG orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/8 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="LifeOS Logo" className="w-12 h-12 rounded-xl object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Set up your profile</h1>
          <p className="text-white/50 text-sm">LifeOS uses this to check eligibility and personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-6 space-y-5 border border-brand-500/15">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-2 block uppercase tracking-wider">Full Name</label>
            <input
              id="onboard-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-brand-500 focus:outline-none transition-colors text-sm"
              placeholder="Riya Sharma"
            />
          </div>

          {/* College */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-2 block uppercase tracking-wider">College / University</label>
            <input
              id="onboard-college"
              type="text"
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-brand-500 focus:outline-none transition-colors text-sm"
              placeholder="Delhi Technological University"
            />
          </div>

          {/* Branch + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-white/60 mb-2 block uppercase tracking-wider">Branch</label>
              <select
                id="onboard-branch"
                required
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none transition-colors text-sm"
              >
                <option value="" disabled>Select branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 mb-2 block uppercase tracking-wider">Year</label>
              <select
                id="onboard-year"
                required
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none transition-colors text-sm"
              >
                <option value="" disabled>Select year</option>
                {YEARS.map((y, i) => <option key={y} value={i + 1}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* CGPA */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-2 block uppercase tracking-wider">CGPA (out of 10)</label>
            <input
              id="onboard-cgpa"
              type="number"
              required
              min="0"
              max="10"
              step="0.01"
              value={form.cgpa}
              onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
              className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-brand-500 focus:outline-none transition-colors text-sm"
              placeholder="7.8"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-3 block uppercase tracking-wider">Skills (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  id={`skill-${skill.toLowerCase().replace(/\//g, '-')}`}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                      : 'bg-surface-elevated border-surface-border text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            id="onboard-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-brand text-white rounded-2xl font-semibold transition-all hover:opacity-90 hover:shadow-brand disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Setting up LifeOS...' : 'Launch LifeOS →'}
          </button>
        </form>
      </div>
    </main>
  );
}
