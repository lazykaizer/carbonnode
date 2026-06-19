# CarbonNode — Architecture Guide

## Why This Document Exists
This file helps reviewers and contributors quickly understand every architectural decision in CarbonNode without reading the full codebase. Each section explains what we did and why.

---

## 1. Zod as Single Source of Truth

All data shapes in the app — API request/response contracts, Zustand store types, localStorage rehydration — are defined once in `src/schemas/index.ts` using Zod schemas. TypeScript types are derived from these schemas using `z.infer<>`, never written separately.

Why: eliminates the class of bugs where TypeScript types and runtime data diverge. If data coming from localStorage, the Gemini API, or a form doesn't match the schema, it is rejected at the boundary — not discovered later as a runtime crash.

Flow:
User Input / API Response / localStorage

↓

Zod schema.safeParse()

↓

✅ Valid → typed data enters app state

❌ Invalid → safe default returned, error logged

Key file: `src/schemas/index.ts`

---

## 2. Domain-Driven Server Structure

The Express backend is organized by feature domain, not by technical layer:
server/

├── domain/

│   ├── mirror/handler.ts       ← Carbon Mirror (NLP journal)

│   ├── receipt/handler.ts      ← Receipt Scanner (multimodal)

│   ├── subtitles/handler.ts    ← Carbon Subtitles (URL analysis)

│   └── story/handler.ts        ← Carbon Story (weekly AI narrative)

└── shared/

├── middleware/

│   ├── rateLimit.ts        ← 15 req/min per IP

│   └── validate.ts         ← body field presence checks

└── geminiClient.ts         ← single Gemini model instance

Why: each domain handler is independently readable, testable, and deployable. A new feature is a new folder — no existing file needs to change.

Every handler follows the same contract:
1. Zod validates the request body → 400 if invalid
2. getGeminiModel() checked → fallback if null
3. Gemini called inside try/catch → fallback on any error
4. Response always includes `source: "gemini" | "fallback"`

---

## 3. Graceful Fallback Chain

CarbonNode never returns a 500 or shows a broken state. Every AI-powered route has a rule-based fallback that activates when:
- GEMINI_API_KEY is not set (Demo Mode)
- Gemini API throws or times out
- Response JSON fails to parse
Request

↓

API Key present? → No  → Rule-based mock response (source: "fallback")

↓ Yes

Gemini call → Error? → Rule-based mock response (source: "fallback")

↓ Success

Parse JSON → Invalid? → Rule-based mock response (source: "fallback")

↓ Valid

Return real response (source: "gemini")

This means the app is 100% evaluable without any API credentials.

---

## 4. State Management

Zustand manages all client state across 3 stores:

| Store | Persisted | Zod Rehydration |
|-------|-----------|-----------------|
| `carbonStore` | ✅ localStorage | `safeParseEntries()` on every load |
| `gamificationStore` | ✅ localStorage | Zod schema validated on rehydration |
| `uiStore` | ❌ session only | No persistence needed |

Why Zustand over Redux: minimal boilerplate, built-in persistence middleware, no provider wrapping needed in React 19.

Why Zod rehydration: localStorage can contain stale schema versions or user-tampered data. Every rehydration passes through Zod — invalid entries are silently discarded rather than crashing the app.

---

## 5. Testing Strategy

Tests are organized by type, not by feature:
src/tests/

├── unit/

│   ├── carbonCalculator.test.ts   ← pure function determinism

│   ├── emissionFactors.test.ts    ← constants match cited sources

│   ├── schemas.test.ts            ← Zod valid/invalid/boundary cases

│   ├── stores.test.ts             ← Zustand state mutations

│   ├── hooks.test.ts              ← custom hook logic

│   ├── formatters.test.ts         ← formatting utilities

│   └── validators.test.ts         ← input validation

└── integration/

├── serverRoutes.test.ts       ← supertest: 400/429/200-fallback

└── apiProxy.test.ts           ← client→server fetch contract

Coverage thresholds enforced in CI:
- Statements: 90%
- Functions: 90%
- Lines: 90%
- Branches: 85%

Coverage report is uploaded as a CI artifact on every push — independently verifiable without running the project locally.

---

## 6. Security Architecture

Threat model and mitigations:

| Threat | Mitigation |
|--------|-----------|
| API key exposure | Express proxy — key never leaves server |
| XSS | DOMPurify on all user input (client), Zod on all API input (server) |
| CSRF / origin abuse | CORS allowlist (no wildcard), credentials: true |
| Brute force / abuse | express-rate-limit 15 req/min per IP |
| Oversized payloads | 5mb body parser limit + 4MB base64 image validation |
| Stale/tampered localStorage | Zod rehydration discards invalid state silently |
| Supply chain | npm audit in CI, pinned lockfile |

Full policy: see `SECURITY.md`

---

## 7. India-First Design Decisions

Emission factors are sourced from Indian government data, not global averages:

| Factor | Source | Value |
|--------|--------|-------|
| Grid electricity | CEA India 2023 | 0.716 kg CO₂/kWh |
| Train/metro | Indian Railways GHG Inventory 2022 | per km values |
| Daily average | MoEFCC India GHG Inventory 2023 | 4.8 kg/day |

AI prompts include Indian context: Swiggy/Zomato receipts, auto-rickshaw, two-wheeler, Indian meal portions. This is not a Western app reskinned — the emission model is built ground-up for Indian users.

---

## 8. Key Design Decisions Log

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| State | Zustand 5 | Redux, Jotai | Minimal boilerplate, persistence built-in |
| Validation | Zod | Yup, manual types | z.infer eliminates type duplication |
| Styling | Tailwind v4 | CSS modules, styled-components | Zero dead CSS, no runtime overhead |
| AI | Gemini 2.0 Flash | OpenAI, Anthropic | Google challenge requirement + multimodal |
| Deployment | Cloud Run | Vercel, Railway | Google ecosystem, Docker portability |
| Auth | None (anonymous) | Firebase Auth | Zero friction for awareness app — no signup barrier |
