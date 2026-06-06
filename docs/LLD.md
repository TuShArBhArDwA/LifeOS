# LifeOS — Low Level Design (LLD)

> **Scope:** Internal component design, database schema, API contracts, agent prompt architecture, data models, and file structure.

---

## 1. Project File Structure

```
lifeos/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout — Clerk + PWA meta
│   ├── page.tsx                      # Landing page (public)
│   ├── globals.css                   # Tailwind + design tokens + animations
│   │
│   ├── sign-in/[[...sign-in]]/       # Clerk sign-in (catch-all)
│   │   └── page.tsx
│   ├── sign-up/[[...sign-up]]/       # Clerk sign-up (catch-all)
│   │   └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx                  # First-time profile setup
│   ├── dashboard/
│   │   ├── page.tsx                  # Server component — fetches data
│   │   └── DashboardClient.tsx       # Client component — renders UI
│   ├── upload/
│   │   └── page.tsx                  # Upload → process → action cards (sync wait)
│   ├── settings/
│   │   ├── page.tsx                  # Settings container
│   │   └── SettingsClient.tsx       # Settings configuration (integrations)
│   │
│   └── api/
│       ├── intake/
│       │   └── route.ts              # POST — main orchestration entry (with mock interceptor)
│       └── profile/
│           └── route.ts              # GET + POST — student profile
│
├── components/
│   ├── UploadZone.tsx                # File drop + camera + text paste
│   ├── AgentThinking.tsx             # Animated agent processing UI (9-phase)
│   ├── InstallPWA.tsx                # PWA install prompt trigger
│   └── ActionCards.tsx              # TasksCard + EventsCard + PlacementCard + RemindersCard
│
├── lib/
│   ├── gemini.ts                     # Gemini 2.0 Flash client + helpers
│   ├── groq.ts                       # Groq llama client + helpers
│   ├── supabase.ts                   # Supabase client + TypeScript types
│   ├── prestored-answers.ts          # Prestored high-quality answers for demo scenarios
│   └── agents/
│       ├── orchestrator.ts           # Intent classification + routing
│       ├── task-agent.ts             # Task generation
│       ├── schedule-agent.ts         # Calendar event generation
│       ├── placement-agent.ts        # Eligibility + prep plan
│       ├── reminder-agent.ts         # Context-aware reminders (Groq)
│       ├── expense-agent.ts          # Expense scanning & ledger splits
│       ├── study-agent.ts            # Active recall study plan & quiz builder
│       └── content-agent.ts          # HOD request drafting
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── favicon.png                   # Official favicon logo
│   ├── icon-192.png                  # PWA icon
│   └── icon-512.png                  # PWA splash icon
│
├── docs/
│   ├── HLD.md                        # High-Level Design
│   └── LLD.md                        # Low-Level Design (this file)
│
├── scripts/
│   ├── supabase-schema.sql           # Paste into Supabase SQL Editor
│   └── seed-demo-data.sql            # Optional demo data for testing
│
├── proxy.ts                          # Clerk auth proxy (Clerk public routes)
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.local                        # API keys (gitignored)
```

---

## 2. Low-Level Agent Specifications & Schemas

### 1. Expense Agent Output
```typescript
export type ExpenseItem = {
  merchant: string;
  amount: number;
  category: 'food' | 'transport' | 'books' | 'education' | 'shopping' | 'health' | 'entertainment' | 'other';
  description: string;
};

export type ExpenseAgentOutput = {
  total: number;
  summary: string;
  expenses: ExpenseItem[];
  budget_tip?: string;
};
```

### 2. Study Agent Output
```typescript
export type Flashcard = {
  question: string;
  answer: string;
};

export type QuizQuestion = {
  question: string;
  options: string[]; // exactly 4 options
  correct: number;   // 0-3 index
  explanation: string;
};

export type StudyAgentOutput = {
  subject: string;
  summary_points: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  study_tip?: string;
};
```

### 3. Content Agent Output
```typescript
export type ContentAgentOutput = {
  subject: string;
  content_type: 'leave_application' | 'noc_request' | 'official_email' | 'other';
  draft: string;
  recipient_tips?: string;
};
```

---

## 3. Frontend Sync State Machine

When a student triggers an ingest, the page transitions:
`idle -> processing -> done / error`

To avoid cutting off the agent workflow animation before results are displayed, the state transition is orchestrated via two flags:
1. `apiData`: Settled once the `/api/intake` HTTP call resolves.
2. `animationDone`: Sets to `true` when `<AgentThinking />` triggers its `onComplete` callback (1.2 seconds after all 9 phases complete).

```typescript
useEffect(() => {
  if (apiData && animationDone) {
    setResult(apiData);
    setState('done');
  }
}, [apiData, animationDone]);
```

---

## 4. Local Storage Schemas (Guest Mode Fallback)

When a guest user triggers an intake, data is structured and saved client-side:

| Storage Key | Type | Description |
|---|---|---|
| `lifeos_guest` | `string` | `"true"` if guest mode is active |
| `lifeos_guest_tasks` | `stringified JSON` | Array of task records with temporary IDs |
| `lifeos_guest_events` | `stringified JSON` | Array of calendar event records |
| `lifeos_guest_reminders` | `stringified JSON` | Array of context reminders |
| `lifeos_guest_intakes` | `stringified JSON` | List of mock intake history snapshots |
