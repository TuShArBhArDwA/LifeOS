<div align="center">

<img src="public/favicon.png" alt="LifeOS Logo" width="80" height="80" style="border-radius: 50%;" />

# LifeOS

### AI-Powered Collaborative Student Command Center

**A phone-first, multi-agent AI system that converts student chaos — screenshots, PDFs, texts, receipts, study notes — into structured action: tasks, schedules, placement prep, expense tracking, study kits, and professional drafts. All in one drop.**

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange)](https://groq.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/TuShArBhArDwA/LifeOS/blob/main/LICENSE)

</div>

---

## What is LifeOS?

Students receive critical information — placement notices, assignment deadlines, exam schedules, fee reminders, expense receipts, and study notes — scattered across WhatsApp groups, emails, PDFs, and notice boards. No tool understands this chaos automatically.

**LifeOS does.** Drop anything. In ~15 seconds, 7 AI agents collaborate in parallel to:

- 📋 **Extract prioritized tasks** with due dates and urgency levels
- 📅 **Build a full calendar** — exams, deadlines, study blocks, interviews
- 🎯 **Check placement eligibility** automatically against your student profile
- 💸 **Parse expense receipts** into categories with smart budget tips
- 📚 **Generate study kits** — key summaries, flashcards, and interactive quizzes
- ✍️ **Draft professional content** — leave letters, NOC requests, emails to HOD
- 🔔 **Set context-aware reminders** that explain why they matter

**Zero typing. Zero app-switching. One upload.**

> **Try it instantly in Guest Mode** — no login required.  
> Visit `/dashboard?guest=true` → click **Capture** → try the **Multi-Agent Mega Demo** example.

---

## Demo

> **Featured scenario:** Multi-Agent Mega Demo — Placement notice + study notes + expense receipt + leave letter request — all at once.

| Step | What happens |
|---|---|
| Input | Text containing placement alert + study topics + expenses + draft request |
| Orchestrator | Groq classifies all intents, routes to relevant agents |
| 7 Agents activate | All run in parallel via `Promise.allSettled` |
| Output | Tasks, calendar events, eligibility check, expense breakdown, flashcards, quiz, drafted letter, reminders |
| Animation | Real-time collaborative agent thinking UI shows all 7 agents completing sequentially |
| Total time | ~15 seconds |

---

## Features

### Multi-Modal Input
- Drag and drop screenshot or PDF
- Camera capture (phone-native)
- Text paste for forwarded messages / WhatsApp forwards
- Voice note upload

### 7 AI Agents (Groq-Powered)

| Agent | Responsibility | Model |
|---|---|---|
| **Orchestrator** | Reads input, classifies intent, routes to agents | Groq llama-3.3-70b |
| **Task Agent** | Generates prioritized tasks with deadlines | Groq llama-3.3-70b |
| **Schedule Agent** | Creates calendar events and study blocks | Groq llama-3.3-70b |
| **Placement Agent** | Eligibility check, document checklist, prep plan | Groq llama-3.3-70b |
| **Expense Agent** | Parses receipts, categorizes spending, budget tips | Groq llama-3.3-70b |
| **Study Agent** | Summary, flashcards, interactive quiz from notes | Groq llama-3.3-70b |
| **Content Agent** | Drafts formal letters, emails, NOC requests | Groq llama-3.3-70b |
| **Reminder Agent** | Context-aware nudges with timing | Groq llama-3.1-8b-instant |

### Intent Detection

Automatically classifies input as:
- `placement_notice` — Full placement workflow
- `assignment` — Task, schedule, and reminder
- `exam` — Study plan and time blocks
- `expense_receipt` — Expense parsing + budget analysis
- `study_notes` — Study kit with flashcards + quiz
- `content_request` — Professional draft generation
- `fee_notice` — Deadline task and reminder
- `general` — Best-fit action generation

### Guest Mode
- Works instantly without any login or signup
- Full dashboard experience using `localStorage` for session data
- Data auto-cleared on tab close for privacy
- Access via `/dashboard?guest=true`

### Settings & Integration Toggles
- **Google Calendar Sync** — Auto-create calendar events from agent outputs
- **WhatsApp Business Bot** — Smart reminders + placement alerts via Twilio
- **Gmail Scanner** — Parse inbox for placement notices and deadlines
- All integrations are UI-complete and architecturally wired — going live post-launch

### Phone-First PWA
- Installable on homescreen
- Touch-optimized UI with 44px+ tap targets
- Camera API integration for direct capture
- Dark-mode OLED-optimized design with glassmorphism

---

## Tech Stack

```
Framework   ->  Next.js (App Router) + Vanilla CSS + Tailwind CSS
Auth        ->  Clerk (+ Guest Mode via localStorage)
Database    ->  Supabase (Postgres + Storage)
AI Engine   ->  Groq — llama-3.3-70b-versatile (6 agents) + llama-3.1-8b-instant (reminders)
Middleware  ->  proxy.ts (Clerk public route config)
Deployment  ->  Vercel
```

---

## Project Structure

```
lifeos/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Landing page
│   ├── landing-client.tsx    # Landing page client component
│   ├── onboarding/           # First-time profile setup
│   ├── dashboard/            # Main student dashboard (guest + auth)
│   │   ├── page.tsx
│   │   └── DashboardClient.tsx
│   ├── upload/               # Core upload + agent interaction + results
│   │   └── page.tsx
│   ├── settings/             # Integration settings + preferences
│   │   ├── page.tsx
│   │   └── SettingsClient.tsx
│   └── api/
│       ├── intake/           # POST — orchestrates all 7 agents
│       └── profile/          # GET/POST — student profile CRUD
├── components/
│   ├── UploadZone.tsx        # File drop / camera / text input
│   ├── AgentThinking.tsx     # 9-phase animated agent processing UI
│   ├── ActionCards.tsx       # Output cards (tasks, events, placement, reminders)
│   └── InstallPWA.tsx        # PWA install prompt
├── lib/
│   ├── groq.ts               # Groq client + JSON helpers
│   ├── supabase.ts           # Supabase client + TypeScript types
│   ├── prestored-answers.ts  # 7 demo example mock responses
│   └── agents/
│       ├── orchestrator.ts   # Intent classification + routing
│       ├── task-agent.ts     # Task generation
│       ├── schedule-agent.ts # Calendar event generation
│       ├── placement-agent.ts# Eligibility check + prep plan
│       ├── reminder-agent.ts # Reminder generation (Groq 8b)
│       ├── expense-agent.ts  # Expense parsing + budget tip
│       ├── study-agent.ts    # Study kit: summary + flashcards + quiz
│       └── content-agent.ts  # Professional draft generation
├── docs/
│   ├── HLD.md                # High Level Design
│   ├── LLD.md                # Low Level Design
│   └── LifeOS-pitch-deck.pdf # Hackathon pitch deck
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── favicon.png           # App favicon (used in all header logos)
│   ├── icon-192.png          # PWA icon
│   └── icon-512.png          # PWA splash icon
├── scripts/
│   ├── supabase-schema.sql   # Paste into Supabase SQL Editor
│   └── seed-demo-data.sql    # Optional: demo data for testing
├── proxy.ts                  # Clerk middleware (public routes config)
└── .env.local                # API keys (gitignored — see setup)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Groq](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/TuShArBhArDwA/LifeOS.git
cd LifeOS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI — Groq only (no Gemini required)
GROQ_API_KEY=your_groq_key
```

### 4. Set up Supabase database

Go to your Supabase project → **SQL Editor** → paste and run [`scripts/supabase-schema.sql`](scripts/supabase-schema.sql).

> **Optional:** Run [`scripts/seed-demo-data.sql`](scripts/seed-demo-data.sql) to populate demo data.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Quickest demo path:** Go to [http://localhost:3000/dashboard?guest=true](http://localhost:3000/dashboard?guest=true) — no login needed!

---

## Architecture

See [`docs/HLD.md`](docs/HLD.md) for the full system architecture with Mermaid diagrams.  
See [`docs/LLD.md`](docs/LLD.md) for database schema, API contracts, agent design, and component detail.

### Quick overview

```
Student Input (phone/desktop)
       |
/api/intake → Prestored demo check → if matched, return after 15.5s
       |                                              ↑
       → Orchestrator (Groq 70b)           Real AI path
       |
{ intent, extracted_data, agents_to_invoke[] }
       | (Promise.allSettled — parallel)
Task + Schedule + Placement + Reminder + Expense + Study + Content
       |
Save to Supabase (or localStorage for guest)
       |
Wait for AgentThinking animation to complete (sync gate)
       |
Render Result Cards
```

---

## Deployment

```bash
npx vercel --prod
```

Or connect the GitHub repo to [vercel.com](https://vercel.com) and add environment variables in the dashboard.

---

## License

MIT © [Tushar Bhardwaj](LICENSE)
