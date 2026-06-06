<div align="center">

<img src="public/favicon.png" alt="LifeOS Logo" width="80" height="80" style="border-radius: 50%;" />

# LifeOS

### AI Chief of Staff for Students

**A phone-first, multi-agent AI system that converts student chaos — screenshots, PDFs, emails, receipts, notices — into structured action: tasks, schedules, study kits, placement workflows, and finance ledgers.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Groq](https://img.shields.io/badge/Groq-llama--3.1-orange)](https://groq.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

</div>

---

## What is LifeOS?

Students receive critical information — placement notices, assignment deadlines, exam schedules, and notes — scattered across WhatsApp groups, emails, PDFs, and paper receipts. No existing tool translates this context to action automatically.

**LifeOS does.** Drop a photo or paste a forward. In under 15 seconds, LifeOS:

- **Orchestrates 7 AI Agents** working in parallel to parse study materials, calculate bills, schedule events, and check placement criteria.
- **Renders a Beautiful Interactive Dashboard** showcasing active tasks, high priority deadlines, and study plans.
- **Drives Live Active Recall**: Auto-generates summary highlights, flashcards, and quizzes from course slides.
- **Drafts Communication**: Generates formal request letters to college HODs or professors based on notices.
- **Ensures Privacy**: Operates fully in **Guest Mode** (with Local Storage backups) for frictionless testing.

---

## Features

### 7 Specialized AI Agents

| Agent | Responsibility | Model |
|---|---|---|
| **Orchestrator** | Reads input, classifies intent, routes to agents | Gemini 2.0 Flash (vision) |
| **Task Agent** | Generates prioritized tasks with deadlines | Gemini 2.0 Flash |
| **Schedule Agent** | Creates calendar events and study blocks | Gemini 2.0 Flash |
| **Placement Agent** | Eligibility check, document checklist, prep plan | Gemini 2.0 Flash |
| **Reminder Agent** | Context-aware nudges with timing | Groq llama-3.1-8b |
| **Expense Agent** | Scans receipts, groups categories, budget advice | Gemini 2.0 Flash |
| **Study Agent** | Summarizes text, builds flashcards and quizzes | Gemini 2.0 Flash |
| **Content Agent** | Writes emails, NOC drafts, leave applications | Gemini 2.0 Flash |

### Dynamic Processing Flow

1. **Upload**: Drop any screenshot, receipt, PDF, or forward.
2. **Synchronized Stage**: The UI shows agent collaboration phases in real-time. The results display only after both the API response settles and the animation completes.
3. **Control Panel Settings**: Preconfigured settings UI for **Google Calendar**, **Gmail Scanners**, and **WhatsApp Business Bot** integrations.

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/TuShArBhArDwA/LifeOS.git
cd LifeOS
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run locally
```bash
npm run dev
```

Open [http://localhost:3000/dashboard?guest=true](http://localhost:3000/dashboard?guest=true) on your phone browser for the best experience.
