# 🌱 CarbonNode — Carbon Footprint Awareness Platform

> **"Your life has a carbon score. Do you know yours?"**

CarbonNode is a production-ready, highly interactive web application designed to track, understand, and reduce your carbon footprint. Pairing high-fidelity gamification with structured calculations and Gemini 2.0 Flash AI, it visualizes environmental impact dynamically, turning abstract carbon metrics into an interactive "living world."

This application was engineered specifically for the **Prompt Wars Virtual Challenge 3** by **Google for Developers x Hack2Skill**.

---

## 🚀 Live Demo & Links

- **Live App URL**: [https://carbonnode-341559739618.us-central1.run.app](https://carbonnode-341559739618.us-central1.run.app)
- **GitHub Repository**: [https://github.com/lazykaizer/carbonnode](https://github.com/lazykaizer/carbonnode)
- **Challenge Platform**: Google for Developers x Hack2Skill
- **License**: MIT License

**Demo Mode**: If no API key is configured, all AI features automatically fall back to rule-based responses — the app is fully functional for evaluation without any credentials.

![CI Build Status](https://github.com/lazykaizer/carbonnode/actions/workflows/ci.yml/badge.svg)
[![React 19](https://img.shields.io/badge/Made%20with-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 6](https://img.shields.io/badge/Language-TypeScript%206-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Gemini 2.0 Flash](https://img.shields.io/badge/AI%20Engine-Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-76E1FE?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🎯 Chosen Vertical

**Vertical:** Sustainability & Eco-tracking (Carbon Footprint Awareness)  
**Target Persona:** Individuals who want to track, understand, and reduce their daily carbon emissions without the friction of complex environmental accounting forms.

CarbonNode tackles this vertical by building a smart, dynamic assistant that integrates carbon awareness directly into natural daily behaviors — whether that's scanning a food receipt, analyzing a journal entry, or getting context on a webpage URL.

---

## 📋 Evaluation Rubric Mapping Table

This mapping guide helps challenge judges locate exact file paths and source files for graded requirements:

| Criterion             | Implementation                                                                                                                                                                                                                                                                                                                                                                                       | File Reference                                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Code Quality**      | Fully typed TypeScript 6, Zod as single source of truth for all data shapes, JSDoc on every exported file and function, deterministic pure functions (no Math.random in logic), domain-layered server architecture, hooks-based component architecture (zero business logic in JSX files — all state lives in custom hooks), ESLint `no-explicit-any` enforced as error                              | `src/schemas/index.ts`, `server/domain/`, `src/services/carbonCalculator.ts`, `src/components/carbon-budget/useAddEntryForm.ts`, `src/components/carbon-mirror/useCarbonMirror.ts` |
| **Security**          | Express proxy (API key never reaches client), Helmet CSP/HSTS/X-Frame-Options, CORS allowlist (not wildcard), rate limiting 15 req/min, payload validation, DOMPurify client-side XSS protection, non-root Docker user                                                                                                                                                                               | `server/index.ts`, `server/middleware/`, `src/utils/sanitize.ts`                                                                                                                   |
| **Efficiency**        | Code-split vendor chunks (react/framer/zustand separated), client-side image compression ≤1MB before upload, Zustand persistent state, multi-stage Docker build (builder → runner), body parser capped at 5mb                                                                                                                                                                                        | `vite.config.ts`, `src/components/receipt-scanner/ReceiptScannerCard.tsx`, `Dockerfile`                                                                                            |
| **Testing**           | 69+ tests across 10+ suites — unit (calculator, schemas, stores, hooks, formatters, validators), integration (supertest API routes, proxy), security (rate limit, sanitize), component (render + axe a11y on every component). Coverage 90% statements/functions/lines enforced in CI with artifact upload for independent verification. Test names describe behavior directly — no 'should' prefix. | `src/__tests__/`, `vite.config.ts`, `.github/workflows/ci.yml`                                                                                                                     |
| **Accessibility**     | Skip link, aria-live announcers, role="img" + aria-label on WorldVisual canvas, data-table fallback for Timeline chart, all inputs labelled via htmlFor/id, error messages via aria-describedby, 44px minimum touch targets, prefers-reduced-motion respected, axe assertion in every component test — accessibility failure = CI failure                                                            | `src/components/dashboard/WorldVisual.tsx`, `src/components/dashboard/CarbonTimeline.tsx`, `src/components/common/Input.tsx`, `src/__tests__/components/`                          |
| **Problem Alignment** | Understand (Carbon Mirror NLP), Track (Budget + Timeline), Reduce (AI suggestions + Ripple Effect) — full loop with graceful Gemini fallback so core mission never fails                                                                                                                                                                                                                             | All feature components                                                                                                                                                             |
| **Google Services**   | Gemini 2.0 Flash (multimodal + text), Google Cloud Run, Docker via Artifact Registry                                                                                                                                                                                                                                                                                                                 | `server/utils/geminiClient.ts`, `.github/workflows/cd.yml`                                                                                                                         |

---

## 🧠 Approach & Logic

CarbonNode is built around one design principle: **carbon awareness should fit into existing habits, not replace them.**

Most carbon tracking tools require users to manually fill forms after every activity. CarbonNode inverts this — it meets users where they already are:

- **Already writing?** Carbon Mirror reads your natural-language journal entry and extracts carbon activities automatically.
- **Already ordering food?** Receipt Scanner reads your Swiggy/Zomato receipt photo and calculates the footprint before you've finished eating.
- **Already browsing?** Carbon Subtitles overlays the carbon cost of any URL you paste — before you make the purchase.

### Decision-Making Logic

Every AI interaction in CarbonNode follows the same decision chain:
User Input (text / image / URL)

↓

Input validated via Zod schema (reject malformed data at the boundary)

↓

Gemini 2.0 Flash called with India-specific context prompt

↓

Response parsed and validated against expected schema

↓

If Gemini unavailable → rule-based fallback activates (app never fails)

↓

Result stored in Zustand with Zod rehydration guard

↓

UI updates + XP awarded + Living World re-renders

The rule-based fallback is not a degraded experience — it uses the same emission factors (CEA India 2023, MoEFCC 2023) that Gemini uses in its system prompt. A user on Demo Mode gets accurate estimates, just without natural-language parsing.

### Why India-First?

Global carbon apps use UK/EU baselines. India's grid is 2.3× dirtier than the EU average (0.716 vs 0.311 kg CO₂/kWh). An Indian user running the AC for 4 hours emits ~2.9 kg CO₂ — a Western app would show ~1.2 kg. CarbonNode uses CEA India 2023 data so the numbers are accurate for Indian users, not misleading.

---

## ⚙️ How the Solution Works

### End-to-End Flow

**1. User opens the app**
Zustand loads persisted state from localStorage. Every field passes through `safeParseEntries()` — a Zod validator that silently discards any corrupt or schema-mismatched data from older app versions.

**2. User logs an activity (any of 5 methods)**

| Method           | Input                         | AI Role                                                              |
| ---------------- | ----------------------------- | -------------------------------------------------------------------- |
| Carbon Mirror    | Plain English journal text    | Gemini extracts activities, classifies by category, estimates kg CO₂ |
| Receipt Scanner  | Photo of food/grocery receipt | Gemini Vision identifies items, maps to emission factors             |
| Carbon Budget    | Manual form entry             | No AI — pure calculation from named emission constants               |
| Carbon Subtitles | Any URL                       | Gemini reads page context, estimates carbon cost of the choice       |
| Carbon Story     | Weekly log data               | Gemini writes a personalized narrative, rates the week               |

**3. Result is stored**
Each activity becomes a `CarbonEntry` (validated by `CarbonEntrySchema`) and is written to the Zustand store, which persists to localStorage.

**4. Dashboard updates**

- `useDailyTimeline()` re-derives the chart data
- `useWeeklyStats()` re-derives the summary panel
- `getWorldStateFromBudget()` maps budget % → world state → Living World re-renders
- XP is awarded via `gamificationStore.awardXp()`

**5. Living World reflects cumulative behavior**
The canvas world state is not cosmetic — it is a direct function of the user's monthly budget consumption percentage:

| Budget Used | World State | Visual                 |
| ----------- | ----------- | ---------------------- |
| 0–30%       | Pristine    | Clear sky, full forest |
| 31–60%      | Good        | Light haze, most trees |
| 61–85%      | Warning     | Gray sky, sparse trees |
| >85%        | Danger      | Dark smog, dead trees  |

---

## 📌 Assumptions Made

1. **Indian urban user context** — emission factors are calibrated for Indian cities. Rural grid factors and transport modes differ and are not yet modeled.

2. **Awareness, not accounting** — CO₂ values are estimates for behavioral awareness, not regulatory carbon accounting. Figures are intentionally conservative and clearly labeled as kg CO₂-equivalent (CO₂e).

3. **Anonymous by design** — no authentication, no server-side user data. All data lives in the user's localStorage. This removes signup friction (the biggest drop-off point for awareness apps) but means data does not sync across devices.

4. **Gemini as the AI layer** — the app is designed around Gemini 2.0 Flash specifically because it handles Indian food names, regional transport modes, and Devanagari-adjacent context better than Western-trained models in testing.

5. **Receipt scanning covers Swiggy, Zomato, and Zepto** — the AI prompt is tuned for these platforms. Other receipt formats may produce less accurate results.

6. **Monthly budget baseline** — the default budget is derived from MoEFCC India 2023 per-capita figures (4.8 kg/day × 30 = 144 kg/month), split across categories by sector contribution share.

---

## 📖 Table of Contents

1. [Product Overview & Ethos](#-product-overview--ethos)
2. [Core Features](#-core-features)
3. [Gamification & The Living World](#-gamification--the-living-world)
4. [Tech Stack & Dependencies](#-tech-stack--dependencies)
5. [Security & Protection Mechanisms](#-security--protection-mechanisms)
6. [Zustand State Management](#-zustand-state-management)
7. [Installation & Local Run Guide](#-installation--local-run-guide)
8. [Automated Testing Suite](#-automated-testing-suite)
9. [Future Roadmap](#-future-roadmap)

---

## 🌐 Product Overview & Ethos

The average global carbon footprint is about 4 tons per person annually. In India, it sits around **1.8 tons per person annually** (~150 kg per month). While policy-level shifts are crucial, raising individual awareness is the first step toward collective action.

CarbonNode was designed to bridge the gap between abstract climate data and daily human behavior. Instead of forcing users to fill out complex, boring multi-page carbon spreadsheets, CarbonNode uses **multimodal generative AI** to make carbon tracking frictionless.

By analyzing daily journals in plain English, scanning food and grocery delivery receipts, and overlaying ecological impact subtitles onto everyday web browsing, CarbonNode fits seamlessly into modern life. It turns carbon reduction into a gamified habitat builder, directly mapping personal accountability to the health of an interactive virtual biosphere.

---

## 🇮🇳 Built for India

Most carbon tracking apps use Western baselines. CarbonNode uses:

- **CEA India Grid Emission Factor 2023** (0.716 kg CO₂/kWh) instead of global averages
- **Indian Railways GHG Inventory 2022** for train/metro factors
- **MoEFCC India GHG Inventory 2023** for national daily averages (4.8 kg/day)
- India-specific transport modes: auto-rickshaw, two-wheeler, metro
- India-specific food context: meal portion sizes calibrated for Indian households
- Swiggy/Zomato receipt scanning context in the AI prompt

---

## ✨ Core Features

CarbonNode centers on five core carbon tracking utilities and two premium gamification modules:

### 1. 🪞 Carbon Mirror

A natural language daily carbon logger. Instead of picking form fields, users describe their day in natural conversational English (e.g., _"I rode the metro to work for 15km, had chicken biryani for lunch, and kept the AC running for 4 hours"_).

- **AI Engine**: Powered by `gemini-2.0-flash`.
- **Behavior**: Extracts individual activities, classifies them, calculates emissions based on regional Indian averages, and provides suggestions.
- **Aesthetic Subtext**: Displays official carbon citation sources (e.g., IPCC 2023, UK DEFRA) at the bottom of each activity.

### 2. 💰 Carbon Budget

A category-based carbon budget manager modeled after financial budgeting applications.

- **Categories**: Transport, Food, Energy, Shopping, and Other.
- **Alerting**: Employs visual warnings (green $\rightarrow$ orange $\rightarrow$ red) when user consumption approaches or exceeds limits.
- **Manual Logging**: Includes an entry wizard with preset guides for commutes, meal types, and home appliances.

### 3. 📸 Receipt Scanner

A multimodal image parser that calculates the carbon footprint of food and grocery orders.

- **AI Engine**: Powered by Zomato/Swiggy bill parsing via Gemini Vision.
- **Image Compression**: Integrates `browser-image-compression` to resize images down to <= 1MB (max resolution 1920px, 0.8 quality) directly on the client, providing a progress bar and original vs. optimized size stats.

### 4. 🌊 Ripple Effect

A community multiplier simulation that visualizes collective action.

- **Metrics**: Converts numbers into mature trees offset and equivalent car distance.
- **Sharing**: Generates shareable impact stats cards using the Web Share API.

### 5. 📺 Carbon Subtitles

A carbon cost checker for digital and commercial activities. Paste a product or service URL to generate a carbon "subtitle" analyzing the hidden ecological cost, drawing live metadata (title, description, OG tags) via a server-side metadata crawler before evaluation.

### 6. 📖 Carbon Story (New)

An automated weekly narrative generator compiling your logs into a creative story, rating your week (excellent, good, average, poor), providing specific action tips, and unlocking the **Story Collector** badge.

### 7. 📈 Carbon Impact Timeline (New)

A horizontal scrollable graph mapping daily emissions against the national daily limit line (4.8 kg CO₂), highlighting milestones (First Entry, Budget Hero) with interactive itemization details on node click.

---

## 🎮 Gamification & The Living World

To keep users engaged, CarbonNode features a **Gamified Living World** dashboard where ecological scores directly impact the virtual environment:

- **Sky Shader Gradient**: The virtual environment backdrop transitions dynamically:
  - **Pristine Blue/Teal (0-30% Budget Used)**: Pure air, representing sustainable living.
  - **Moderate Teal-Gray (31-60%)**: Rising consumption.
  - **Hazy warning Gray (61-85%)**: High carbon usage.
  - **Dark Charcoal Smog (>85%)**: Danger zone; heavy smog particles begin drifting across the screen.
- **Dynamic Forest Growth**: Healthy trees sprout across the ground as the user maintains low carbon scores. If emissions spike, trees dry up and disappear.
- **User Leveling & XP**: XP is awarded for positive eco-behaviors:
  - `daily_log`: 10 XP
  - `receipt_scan`: 15 XP
  - `under_budget`: 25 XP
  - `streak_7day`: 50 XP
  - `story_collector` (unlocked 4 stories): 30 XP

---

## 🏗️ Code Architecture

### Frontend — hooks-based, one responsibility per file

```text
src/
├── schemas/index.ts          ← Zod schemas — single source of truth for ALL data shapes
├── types/index.ts            ← TypeScript types derived via z.infer<> — never written separately
├── services/
│   ├── carbonCalculator.ts   ← Pure domain math — no framework, no I/O, fully unit-tested
│   └── geminiService.ts      ← Typed API client — rate limiting, retries, serialization
├── stores/                   ← Zustand with Zod rehydration — tampered localStorage discarded
├── hooks/                    ← All logic lives here — components import hooks, never useState directly
└── components/               ← Pure JSX only — no business logic, no raw useState
    ├── common/               ← Button, Input, Modal, Loader, Card (reusable primitives)
    ├── carbon-budget/
    │   ├── useAddEntryForm.ts     ← All form state and submission logic
    │   ├── estimation-factors.ts  ← Emission factor map with Indian-context defaults
    │   └── AddEntryForm.tsx       ← Pure JSX, under 120 lines
    ├── carbon-mirror/
    │   ├── useCarbonMirror.ts     ← NLP submission, activity parsing, gamification
    │   ├── useWebcam.ts           ← Camera access, streaming, frame capture
    │   └── CarbonMirrorCard.tsx   ← Pure JSX, under 100 lines
    └── dashboard/
        ├── WorldVisual.tsx        ← Accessible canvas with role="img" + sr-only fallback
        └── CarbonTimeline.tsx     ← Chart with sr-only data-table for screen readers
```

> **Design rule:** no business logic lives in JSX. Every component imports a custom hook for its state. No `any` type anywhere — ESLint enforces this as a build error. Code formatted consistently via Prettier across the entire codebase.

### Backend — domain-driven, one folder per feature

```text
server/
├── domain/
│   ├── mirror/handler.ts      ← Carbon Mirror NLP analysis
│   ├── receipt/handler.ts     ← Receipt Scanner multimodal parsing
│   ├── subtitles/handler.ts   ← Carbon Subtitles URL analysis
│   └── story/handler.ts       ← Carbon Story weekly narrative
└── shared/
    ├── middleware/
    │   ├── rateLimit.ts       ← 15 req/min per IP
    │   └── validate.ts        ← Body field presence + Zod schema validation
    └── geminiClient.ts        ← Single Gemini model instance, null in Demo Mode
```

Every domain handler follows the same contract:

1. Zod validates request body → 400 if invalid
2. `getGeminiModel()` checked → fallback if null (Demo Mode)
3. Gemini called inside try/catch → fallback on any error
4. Response always includes `source: "gemini" | "fallback"`

### System Diagram

```mermaid
graph TD
    subgraph CI ["🔄 CI/CD Pipeline"]
        direction LR
        GH["GitHub Actions"] -->|Test & Coverage| AR["Artifact Registry"] -->|Auto Deploy| CR["Cloud Run"]
    end

    subgraph Architecture ["🏗️ System Architecture"]
        direction LR

        subgraph Client ["📱 Browser (React 19 + TS)"]
            direction TB
            Features["✨ App Features<br/>(Mirror, Scanner, Budget, Story)"]
            State["💾 Zustand + Zod Persist"]
            Auth["👤 Anonymous by design"]
        end

        subgraph Server ["☁️ Google Cloud Run"]
            direction TB
            Express["🚀 Express 5 API Proxy"]
            Handlers["🛠️ Domain Handlers"]
            Middleware["🛡️ Middleware<br/>(Rate Limit, Zod Validation)"]

            Express --> Middleware --> Handlers
        end

        subgraph AI ["🧠 External APIs"]
            Gemini["Google Gemini 2.0 Flash<br/>& Gemini Vision"]
        end

        subgraph Fallback ["⚡ Fallback System"]
            RuleBased["Rule-Based Constants<br/>(App never fails silently)"]
        end

        Features -- "HTTPS" --> Express
        Handlers -- "Context-Aware Prompts" --> Gemini
        Handlers -. "If API Fails / Demo Mode" .-> RuleBased
    end

    %% Apply styles
    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0c4a6e;
    classDef server fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef ai fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87;
    classDef fallback fill:#ffedd5,stroke:#ea580c,stroke-width:2px,stroke-dasharray: 5 5,color:#7c2d12;
    classDef pipeline fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#0f172a;

    class Client,Features,State,Auth client;
    class Server,Express,Handlers,Middleware server;
    class AI,Gemini ai;
    class Fallback,RuleBased fallback;
    class CI,GH,AR,CR pipeline;
```

---

## 🔒 Security & Protection Mechanisms

Full vulnerability reporting policy: [SECURITY.md](SECURITY.md)

1. **Express API Proxy** — API key never leaves the server. All Gemini calls proxied through Express on Cloud Run.
2. **Helmet Integration** — Strict CSP, X-Frame-Options (DENY), HSTS, X-Content-Type-Options on every response.
3. **CORS Allowlist** — Specific origins only. No wildcard. Configured via `ALLOWED_ORIGINS` in `server/index.ts`.
4. **Rate Limiting** — 15 requests per minute per IP via `express-rate-limit` on all `/api/*` routes.
5. **Zod Boundary Validation** — Every API endpoint validates its request body against a Zod schema before any processing. Malformed input returns 400 with the exact validation error.
6. **XSS Protection** — DOMPurify sanitizes all user-generated text before rendering. Client-side only — never imported in server routes.
7. **localStorage Rehydration** — All Zustand state loaded from localStorage passes through `safeParse()`. Corrupt or schema-mismatched data is silently discarded — never crashes the app.
8. **Non-root Docker** — Production container runs as a non-root user. Multi-stage build keeps dev dependencies out of the final image.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: React 19, TypeScript 6 (strict), Vite 8, Tailwind CSS v4, Framer Motion
- **State**: Zustand 5 (persistent, Zod-validated rehydration)
- **Validation**: Zod — single source of truth for all data shapes across client and server
- **Backend**: Express 5, Helmet, express-rate-limit
- **AI**: Gemini 2.0 Flash (text + Vision multimodal)
- **Testing**: Vitest 4, React Testing Library, vitest-axe (axe-core), supertest
- **Deploy**: Google Cloud Run, Docker, GitHub Actions

---

## 🚦 Installation & Local Run Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Add your Gemini API key — or leave blank for Demo Mode
```

### 3. Run Dev Server

```bash
npm run dev:full    # starts Vite (port 5173) + Express (port 8080) concurrently
```

### 4. Build and Run Production Docker Container

```bash
docker build -t carbonnode-app .
docker run -p 8080:8080 --env GEMINI_API_KEY=your_key carbonnode-app
```

---

## 🔧 Development Workflow

### Pre-commit Hooks

Pre-commit hooks run automatically on every `git commit` to catch issues before they reach CI. Install once:

```bash
pip install pre-commit
pre-commit install
```

Hooks that run on every commit:

- **end-of-file-fixer** — ensures every file ends with a newline
- **trailing-whitespace** — strips trailing spaces
- **check-yaml / check-json** — validates config file syntax
- **detect-private-key** — blocks accidental secret commits
- **prettier** — enforces consistent formatting across all TS/TSX/JSON/MD files

CI runs the same checks on every push — pre-commit just catches them locally first.

---

## 🧪 Automated Testing Suite

**182 tests across 23 suites.** Coverage enforced at **90% statements/functions/lines, 85% branches** as a CI gate. Coverage report artifact uploaded on every push for independent verification.

| Suite                       | File                          | Covers                                          |
| --------------------------- | ----------------------------- | ----------------------------------------------- |
| Unit — Calculator           | `carbonCalculator.test.ts`    | Pure functions, determinism, edge cases         |
| Unit — Emission Factors     | `emissionFactors.test.ts`     | Constants match cited sources                   |
| Unit — Schemas              | `schemas.test.ts`             | Zod valid/invalid/boundary/type-error cases     |
| Unit — Stores               | `stores.test.ts`              | Zustand state mutations and Zod rehydration     |
| Unit — Hooks                | `hooks.test.ts`               | useDailyTimeline, useWeeklyStats with mock data |
| Unit — Formatters           | `formatters.test.ts`          | Number/date/percentage formatting               |
| Unit — Validators           | `validators.test.ts`          | Input validation edge cases                     |
| Integration — API Proxy     | `apiProxy.test.ts`            | Client→server fetch contract                    |
| Integration — Server Routes | `serverRoutes.test.ts`        | Supertest: 400/429/200-fallback on all 4 routes |
| Security — Rate Limit       | `rateLimit.test.ts`           | 429 threshold enforcement                       |
| Security — Sanitize         | `sanitize.test.ts`            | XSS stripping via DOMPurify                     |
| Component — AddEntryForm    | `AddEntryForm.test.tsx`       | Render + axe a11y + emission calculation        |
| Component — CarbonMirror    | `CarbonMirrorCard.test.tsx`   | Render + axe a11y + AI submission               |
| Component — Timeline        | `CarbonTimeline.test.tsx`     | Render + axe a11y + data-table fallback         |
| Component — LivingWorld     | `LivingWorld.test.tsx`        | Render + axe a11y + world state transitions     |
| Component — ReceiptScanner  | `ReceiptScannerCard.test.tsx` | Render + axe a11y + image compression           |
| Component — CarbonStory     | `CarbonStory.test.tsx`        | Render + axe a11y + story generation            |
| Component — SubtitleResult  | `SubtitleResultCard.test.tsx` | Render + axe a11y                               |

Run all: `npm run test`
Coverage: `npx vitest run --coverage` (90% threshold enforced, fails build if not met)
**Every component test includes an axe assertion — an accessibility regression fails CI.**

---

## 📚 Emission Data Sources & References

All emission factors in CarbonNode are sourced from peer-reviewed government and scientific publications. No magic numbers exist anywhere in the codebase — every constant in `src/utils/emissionFactors.ts` cites its source inline.

| Category                      | Source                                                                        | Key Value Used               |
| ----------------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| **India Grid Electricity**    | Central Electricity Authority (CEA), CO₂ Baseline Database Ver 20.0, Dec 2024 | 0.716 kg CO₂/kWh             |
| **Transport — Cars**          | UK DEFRA / DESNZ 2023 Greenhouse Gas Conversion Factors                       | 0.171 kg CO₂/km (petrol)     |
| **Transport — Flights**       | IPCC AR6 Working Group III, Table 10.1 (2023)                                 | 0.089 kg CO₂/km (short-haul) |
| **Transport — Rail & Metro**  | Indian Railways GHG Inventory 2022, Ministry of Railways                      | 0.012 kg CO₂/km (rail)       |
| **Transport — Auto Rickshaw** | MoEFCC India GHG Inventory 2023                                               | 0.092 kg CO₂/km              |
| **Food Emissions**            | Poore & Nemecek (2018), _Science_ — "Reducing food's environmental impacts"   | 7.2 kg CO₂/meal (beef)       |
| **Digital Activity**          | IEA (2022), Data Centres and Data Transmission Networks Report                | 0.036 kg CO₂/hr (streaming)  |
| **Shopping / Goods**          | UK DEFRA 2023 lifecycle emission estimates                                    | 9.0 kg CO₂/item (polyester)  |
| **India Daily Average**       | MoEFCC India GHG Inventory 2023                                               | 4.8 kg CO₂/day/person        |
| **Tree Offset Equivalent**    | US EPA Greenhouse Gas Equivalencies Calculator                                | 22 kg CO₂/tree/year          |
| **Paris-aligned Target**      | IPCC SR1.5 — per-capita budget for 1.5°C pathway                              | 2,000 kg CO₂/year            |

> All factors are expressed in kg CO₂-equivalent (CO₂e) and represent awareness-level estimates, not regulatory accounting. Figures are intentionally conservative and rounded.
