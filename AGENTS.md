# MediRoute Agents

You have **4 agents** available. Just tell me which role to play — I switch into that agent's prompt, search the web via `agent-reach`, and give you evidence-backed answers.

## Your Agents

| Agent | What it does | How to invoke |
|-------|-------------|---------------|
| 🕵️ **Gap Analyst** | Finds missing info, risks, blind spots | "Act as the gap agent: what am I missing about X?" |
| 🔧 **Tech Architect** | Recommends Gemini APIs, stack, architecture | "Act as the tech agent: which Gemini model for Y?" |
| 🎤 **Pitch Coach** | Demo flow, pitch deck, judge Q&A | "Act as the pitch agent: give me an opening hook" |
| ✅ **Fact Checker** | Verifies claims with live web search | "Fact-check: [claim]" |

## How It Works

Each agent is a **separate mental mode** with its own system prompt. I search the web via Exa (`mcporter`) + Jina Reader (`curl r.jina.ai`), cross-reference sources, and deliver a verdict with evidence.

## Examples

```
"Fact-check: Japan hospitals can refuse walk-in patients but must accept ambulance patients"
"Act as the tech agent: can Gemini Live API handle real-time medical translation?"
"Act as the gap agent: what regulatory issues for a medical AI app in Japan?"
"Act as the pitch agent: give me a 30-second demo opening"
```

## Interactive Mock — v4 (M3 Google Redesign)

**File:** [`index.html`](index.html) — single-file, open in any browser. 0 dependencies, no build step.

A clickable 15-path prototype simulating MediRoute's full product flow. Modern app-style home screen with **bento grid**, time-based greeting, quick actions, skeleton loading states, and prominent emergency CTA.

**Design system:**
- **Typography:** Roboto Flex (display + body) + JetBrains Mono (code) — Google-native
- **Palette:** Google Blue (#1A73E8), Material error (#EA4335) / warning (#FBBC04), tokenized CSS variables
- **Icons:** Phosphor exclusively — 210+ usages
- **Surfaces:** M3 surface (#FFFBFE) with subtle 0.012 opacity grain, no glass blur
- **Buttons:** All `btn-primary` (filled blue, icon+label, :active press) — single consistent style
- **Shadows:** Neutral tinted M3 elevation levels (0/1/2/3)
- **Motion:** M3 easing (cubic-bezier 0.2,0,0,1.0), 250-300ms transitions
- **Layout:** Left-aligned headers, asymmetric bento grid + 2×2 mini grid, airy spacing

### Quick start

```bash
open index.html
```

### Hub home screen

- **Greeting banner** — time-based ("Good morning") with "MediRoute" title
- **Emergency CTA** — red "119" button top-right, one-tap to chest pain triage
- **Bento grid** — 4 category cards (Emergency/Clinic/Medication/Translation) in 2x2 layout
- **Expand buttons** — `+` on any card reveals sub-routes inline
- **Quick access** — 2×2 mini grid (My Info / Insurance / Guide / Q&A) with elevated cards
- **Search bar** — pill-style input, highlights matching category card on type
- **Recent sessions** — last 3 with timestamps, tap to resume

### Keyboard shortcuts for demos

| Key | Action |
|-----|--------|
| `1-5` | Jump to category (Emergency / Clinic / Medication / Translation / Cost) |
| `← →` | Navigate within a route |
| `H` / `0` | Return to hub |
| `R` | Restart current route |
| `Shift+R` | New session (clear history) |

### 10 demo routes

| Category | Routes |
|----------|--------|
| 🚨 Emergency | Chest Pain, Bleeding, Head Injury, Child Emergency |
| 🏥 Clinic | Fever/Flu, Mild Symptoms, Injury, Dental |
| 💊 Medication | Get a Prescription, Drug Interaction, Lost Medication, Pre-Travel Check |
| 🗣️ Translation | Pharmacy Translation, Doctor Visit Translation |
| 💰 Cost & Admin | Coverage → Insurance → Receipt → Visa Warning |

### Emergency flow (5 screens)

```
Hub → Chat Triage → Triage Result → 📞 Call 119 → 🚑 Help is on the way → 🏠 End
```

### Clinic visit flow (18 screens)

```
Hub → Chat Triage → Triage → 💰 Coverage → 🛡️ Insurance → Clinic Search → 📞 Booking
  → ✅ Confirmed → 🏥 Arrival → 📋 Intake (📸 scan + auto-fill) → 🎤 Live Translate
  → 💊 Rx Upload → 🔍 Pharmacy Match → 📦 Pickup Ready → ⚠️ Drug Check
  → 📸 Receipt → 📋 Claim Generated → 🎉 End
```

### Medication flow

| Route | Screens |
|-------|---------|
| **Get a Prescription** | Past Visits (4 clinics) → Clinic Detail → 📋 処方箋 (4 meds, clickable) → Pharmacist → End |
| **Drug Interaction** | Input meds → Critical Alert → Pharmacist Translate → End |
| **Lost Medication** | Pharmacy Finder → Replacement Script → Booking → Confirmed → End |
| **Pre-Travel Check** | Select medication → 🟢 Safe / 🟡 Restricted / 🔴 Prohibited → End |

### Translation flow (2 routes)

| Route | Screens |
|-------|---------|
| **Pharmacy** | Live Translation → Receipt → End |
| **Doctor Visit** | Live Translation → Common Phrases (10 phrases) → End |

### Cost & Admin flow

```
Coverage Cards → Insurance Input (provider + policy + coverage type) → Insurance Explainer → Receipt Preview → Visa Warning → End
```

### Interactive features
- **Hub search** — pill-style input, highlights matching bento card on type, Enter to launch
- **Chat triage** — 10 symptom trees with branching questions, contextual verdict + confidence
- **Insurance input** — select provider + policy + coverage → per-item cost cards green/red
- **Clinic picker** — click any clinic card → downstream screens update
- **Mock booking** — 3-step call animation (Calling → Speaking → Booked) → auto-transition
- **Scan & Translate** — mock camera scans medical questionnaire, translates fields, auto-fills from chat
- **Contextual Live Translation** — phrases adapt to symptoms (fever, chest pain, headache, etc.)
- **Prescription → Pharmacy** — snap Rx → auto-detect drug → pharmacy → pickup code + map
- **Prescription document** — realistic Japanese prescription with 4 meds, clickable dosage/usage details
- **Claim Generator** — receipt → structured claim form → download/send to insurer
- **Skeleton loading states** — shimmer placeholders during pharmacy match, chat loading
- **Back navigation** — every screen has a way back (Back / Back to Main Page)
- **localStorage** — session survives refresh, shows "Continue?" prompt

## Reference Docs

| File | What |
|------|------|
| [`index.html`](index.html) | **Interactive mock v4** — 15-path phone frame, M3 Google redesign, bento hub, Phosphor icons |
| [`docs/hackathon-master.md`](docs/hackathon-master.md) | Hackathon master doc — all 5 verified docs consolidated |
| [`docs/product-spec.md`](docs/product-spec.md) | Full MediRoute product spec (8 modules) |
| [`docs/tech-plan.md`](docs/tech-plan.md) | Generated tech plan + stack recommendations |
| [`docs/market-landscape-verified.md`](docs/market-landscape-verified.md) | Market landscape & competitive analysis (fact-checked) |
| [`docs/data-feasibility-verified.md`](docs/data-feasibility-verified.md) | Data & feasibility — API stack verified |
| [`docs/impact-metrics-corrected.md`](docs/impact-metrics-corrected.md) | Impact & metrics — corrected version (math fixed) |
| [`docs/user-personas-validation-verified.md`](docs/user-personas-validation-verified.md) | User personas & problem validation (fact-checked) |
| [`docs/user-segments-pain-points-verified.md`](docs/user-segments-pain-points-verified.md) | Target users & pain points (fact-checked) |
| [`docs/superpowers/specs/2026-06-23-mediroute-mock-design.md`](docs/superpowers/specs/2026-06-23-mediroute-mock-design.md) | v1 mock design spec |
| [`docs/superpowers/specs/2026-06-23-mediroute-mock-v2-design.md`](docs/superpowers/specs/2026-06-23-mediroute-mock-v2-design.md) | v2 mock design spec (15 paths) |
| [`docs/superpowers/plans/2026-06-23-mediroute-mock-v2.md`](docs/superpowers/plans/2026-06-23-mediroute-mock-v2.md) | v2 implementation plan |
| [`docs/superpowers/plans/2026-06-23-mediroute-hub-redesign.md`](docs/superpowers/plans/2026-06-23-mediroute-hub-redesign.md) | Hub redesign plan — bento grid, taste-v1, Phosphor |
| [`docs/superpowers/specs/2026-06-23-mediroute-mock-m3-redesign.md`](docs/superpowers/specs/2026-06-23-mediroute-mock-m3-redesign.md) | v4 M3 redesign spec |
| [`docs/superpowers/plans/2026-06-23-mediroute-mock-m3-redesign.md`](docs/superpowers/plans/2026-06-23-mediroute-mock-m3-redesign.md) | v4 M3 redesign implementation plan |
| [`prompts/mediroute-brandkit-3x3.md`](prompts/mediroute-brandkit-3x3.md) | Brand kit image prompt — 3x3 identity deck |

## Setup

- **Model**: DeepSeek (deepseek-v4-pro) via pi
- **Web search**: agent-reach (Exa semantic search + Jina Reader)
- **Session**: Isolated per agent — no context pollution
- **Mock**: Open `index.html` in browser — no server needed
