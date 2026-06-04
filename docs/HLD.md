# LifeOS — High Level Design (HLD)

> **Project:** LifeOS — AI Chief of Staff for Students  
> **Hackathon:** iQOO AgentKit Hackathon · June 6, 2026  
> **Track:** PS1 — Student · Agents (AgentKit)  
> **Stack:** Next.js 16 · Clerk · Supabase · Gemini 2.0 Flash · Groq

---

## 1. Problem Statement

Students receive critical information — placement notices, assignment deadlines, exam schedules, fee reminders — fragmented across WhatsApp groups, emails, PDFs, college notice boards, and voice notes. No existing tool:

- Understands **multimodal input** (image, PDF, text)
- Converts information to **actions automatically**
- **Checks eligibility** against the student's profile
- Works **phone-first**, the way students actually live

---

## 2. Solution Overview

LifeOS is a **phone-first, multi-agent AI system** that ingests any student document and automatically generates structured action: tasks, calendar events, study plans, placement prep, and reminders — without the student typing anything.

```
Student drops a screenshot →  LifeOS returns a complete action plan in < 10 seconds
```

---

## 3. System Architecture

```mermaid
graph TB
    subgraph CLIENT["Client Layer (PWA — iQOO Phone)"]
        UI["Next.js PWA\nMobile Chrome"]
        UPLOAD["Upload Zone\nCamera · File · Text"]
        ANIM["Agent Thinking\nAnimation"]
        CARDS["Action Cards\nTasks · Events · Placement · Reminders"]
    end

    subgraph SERVER["Server Layer (Vercel Edge)"]
        INTAKE["/api/intake\nOrchestrator Entry Point"]
        PROFILE["/api/profile\nStudent Profile CRUD"]
        ORCH["Orchestrator Agent\nGemini 2.0 Flash"]
    end

    subgraph AGENTS["AI Agent Layer"]
        TASK["Task Agent\nGemini Flash"]
        SCHED["Schedule Agent\nGemini Flash"]
        PLACE["Placement Agent\nGemini Flash"]
        REM["Reminder Agent\nGroq llama-3.1-8b"]
    end

    subgraph DATA["Data Layer"]
        SB["Supabase\nPostgres + Storage"]
        CLERK["Clerk\nAuth + User Identity"]
    end

    UI --> INTAKE
    UI --> PROFILE
    INTAKE --> ORCH
    ORCH -->|"parallel invoke"| TASK
    ORCH -->|"parallel invoke"| SCHED
    ORCH -->|"if placement_notice"| PLACE
    ORCH -->|"parallel invoke"| REM
    TASK --> SB
    SCHED --> SB
    PLACE --> SB
    REM --> SB
    SB --> UI
    CLERK --> SERVER
```

---

## 4. Agent Ecosystem

| Agent | Model | Input | Output | When Invoked |
|---|---|---|---|---|
| **Orchestrator** | Gemini 2.0 Flash (vision) | Raw image / PDF / text | Intent classification + extracted JSON + routing decision | Always — first step |
| **Task Agent** | Gemini 2.0 Flash | Orchestrator output + profile | 3–6 prioritized tasks with due dates | All intents |
| **Schedule Agent** | Gemini 2.0 Flash | Orchestrator output + profile | 3–8 calendar events (deadlines + study blocks) | All intents |
| **Placement Agent** | Gemini 2.0 Flash | Orchestrator output + profile | Eligibility check + doc checklist + prep plan | `placement_notice` only |
| **Reminder Agent** | Groq llama-3.1-8b-instant | Orchestrator output + profile | 3 context-aware reminder messages with timing | All intents |

### Why Groq for Reminders?

Reminder message generation is **pure text** — no vision, no complex reasoning. Groq's llama-3.1-8b-instant runs at ~500 tokens/second, generating reminder messages in ~200ms vs ~1.5s on Gemini. This keeps total pipeline latency under 8 seconds.

---

## 5. Data Flow

```mermaid
sequenceDiagram
    participant S as Student (Phone)
    participant API as /api/intake
    participant O as Orchestrator
    participant A as Agents (parallel)
    participant DB as Supabase

    S->>API: Upload screenshot / paste text
    API->>API: Fetch student profile from Supabase
    API->>O: Send image + profile + today's date
    O->>O: Gemini Vision — classify intent + extract entities
    O-->>API: { intent, extracted, invoke_agents[] }
    API->>A: Invoke Task + Schedule + Placement + Reminder agents (Promise.allSettled)
    A-->>API: All agent outputs (parallel)
    API->>DB: Save intake + tasks + events + reminders
    API-->>S: Full JSON response with all outputs
    S->>S: Render Action Cards
```

---

## 6. Intent Classification

The Orchestrator classifies every input into one of 6 intents:

| Intent | Example Trigger | Agents Invoked |
|---|---|---|
| `placement_notice` | "TCS NQT Drive — Register by Friday" | Task + Schedule + Placement + Reminder |
| `assignment` | "DBMS project due this Friday" | Task + Schedule + Reminder |
| `exam` | Exam timetable PDF | Task + Schedule + Reminder |
| `timetable` | Weekly class schedule | Schedule + Reminder |
| `fee_notice` | "Fee payment deadline June 30" | Task + Reminder |
| `general` | Any other student notice | Task + Reminder |

---

## 7. Tech Stack

```mermaid
graph LR
    subgraph Frontend
        NX["Next.js 16\nApp Router"]
        TW["Tailwind CSS v3\nUtility-first"]
        CL["Clerk\nAuth + Session"]
    end

    subgraph AI
        GEM["Gemini 2.0 Flash\nVision + JSON output"]
        GROQ["Groq\nllama-3.1-8b-instant"]
    end

    subgraph Backend
        VER["Vercel\nEdge deployment"]
        SUP["Supabase\nPostgres + Storage + RLS"]
    end

    NX --> GEM
    NX --> GROQ
    NX --> SUP
    NX --> CL
    VER --> NX
```

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | API routes + SSR + PWA in one repo |
| Styling | Tailwind CSS v3 | Mobile-first responsive utilities, rapid dev |
| Auth | Clerk | 5-minute setup, student profile identity |
| Database | Supabase (Postgres) | Tasks, events, reminders, profile storage |
| File Storage | Supabase Storage | Screenshot/PDF uploads |
| Primary AI | Gemini 2.0 Flash | Native multimodal (image+text), structured JSON output |
| Fast Text AI | Groq (llama-3.1-8b-instant) | Ultra-fast pure-text generation for reminders |
| Deployment | Vercel | Zero-config, env vars, preview URLs |

---

## 8. Phone-First Design Principles

LifeOS is built for **demo on an iQOO phone**, bridged to laptop via **iQOO Office Kit**.

| Principle | Implementation |
|---|---|
| Touch-first interactions | Large tap targets (min 44px), FAB for primary action |
| Camera capture | `react-dropzone` accepts `image/*` — triggers camera on mobile |
| Safe areas | `env(safe-area-inset-*)` for notch/chin handling |
| No-scroll key flows | Critical upload → processing → output fits one viewport |
| PWA installable | `manifest.json` + `apple-mobile-web-app-capable` meta |
| Dark mode default | Dark-only UI — hides imperfections on phone OLED screens |

---

## 9. Scoring Strategy (Hackathon)

| Criteria | Weight | Our Approach |
|---|---|---|
| iQOO Office Kit Usage | 25% | Demo live on phone, mirror via Office Kit to laptop |
| Phone-First Execution | 25% | PWA runs in mobile Chrome, camera capture primary input |
| AI-Native Build | 20% | 5 Gemini+Groq agents, structured output, real-time pipeline |
| Problem Fit | 20% | Directly solves PS1 — student agents, placement workflow |
| Craft & Pitch | 10% | TCS NQT demo scenario, eligibility check as wow moment |

---

## 10. Deployment Architecture

```mermaid
graph TB
    subgraph PHONE["iQOO Phone"]
        CHROME["Mobile Chrome\nlifeos.vercel.app"]
        PWA["Installed PWA\nHomescreen icon"]
        CAM["Camera API\nScreenshot capture"]
    end

    subgraph LAPTOP["Laptop (Green Light)"]
        OFFICE["iQOO Office Kit\nScreen mirroring"]
        DEV["Dev tools\nbuild + polish"]
    end

    subgraph CLOUD["Cloud"]
        VERCEL["Vercel\nNext.js deployment"]
        SB["Supabase\nDatabase + Storage"]
        CLERK["Clerk\nAuth"]
        GEMINI["Google AI\nGemini API"]
        GROQ_C["Groq Cloud\nFast inference"]
    end

    CHROME --> VERCEL
    OFFICE --> CHROME
    VERCEL --> SB
    VERCEL --> CLERK
    VERCEL --> GEMINI
    VERCEL --> GROQ_C
```
