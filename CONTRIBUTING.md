# Contributing to CarbonNode

## Project layout

src/ React 19 + TypeScript frontend

components/ UI components — each paired with a test file

common/ Reusable primitives (Button, Input, Modal, Loader)

carbon-budget/ Budget tracker and manual entry form

carbon-mirror/ NLP journal analysis card

receipt-scanner/ Multimodal receipt scanner card

dashboard/ WorldVisual, CarbonTimeline, Sidebar, FeatureGrid

gamification/ CarbonStory, AchievementsModal, StoryHistory

landing/ Landing page sections

hooks/ Custom React hooks — pure logic, zero JSX

services/ carbonCalculator.ts (pure domain), geminiService.ts (API client)

schemas/ Zod schemas — single source of truth for all data shapes

stores/ Zustand stores with Zod-validated localStorage persistence

utils/ formatters, validators, constants, emissionFactors, sanitize

types/ TypeScript types derived from Zod schemas via z.infer<>

pages/ Page-level components (DashboardPage, LandingPage, CarbonSubtitlesPage)

server/

domain/ One folder per feature (mirror, receipt, subtitles, story)

shared/ Cross-cutting concerns (geminiClient, middleware)

## Design rules

- **One responsibility per file.** Components are JSX only. Logic lives in hooks. Math lives in services. Constants cite their sources.
- **Zod is the single source of truth.** All data shapes are defined once in `src/schemas/index.ts`. TypeScript types come from `z.infer<>` — never written separately.
- **No raw numbers in logic.** Every emission factor is a named constant in `src/utils/emissionFactors.ts` citing its primary source.
- **No `any`.** TypeScript strict mode is enabled. ESLint enforces `no-explicit-any` as an error.
- **Every domain handler has a fallback.** If Gemini is unavailable, all four server routes return rule-based responses — the app never fails silently.
- **Accessibility is non-negotiable.** Every component test includes an axe assertion. A failing axe check fails the build.
- **localStorage is never trusted.** All Zustand state rehydrated from localStorage passes through Zod `safeParse` — invalid data is silently discarded.

## Quality gates (all enforced in CI on every push)

| Gate              | Command                      | Threshold                                    |
| ----------------- | ---------------------------- | -------------------------------------------- |
| Lint              | `npm run lint`               | 0 errors                                     |
| Type check        | `npm run build`              | 0 TypeScript errors                          |
| Tests             | `npm run test`               | All pass                                     |
| Coverage          | `npx vitest run --coverage`  | 90% statements/functions/lines, 85% branches |
| Coverage artifact | Uploaded to CI on every push | Independently verifiable                     |

## Running locally

```bash
npm install
cp .env.example .env      # add GEMINI_API_KEY (or leave blank for Demo Mode)
npm run dev:full           # starts Vite + Express concurrently
```

All AI features fall back to rule-based responses when no API key is set — the app is fully usable in Demo Mode.
