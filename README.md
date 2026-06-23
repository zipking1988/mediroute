# 🏥 MediRoute — AI Medical Companion for Tourists in Japan

A **Google/Gemini hackathon project** that helps international tourists navigate Japan's healthcare system — from symptom triage to pharmacy pickup, with live translation at every step.

> **Live Demo:** [agent-pipeline-ten.vercel.app](https://agent-pipeline-ten.vercel.app) or open [`index.html`](index.html) in any browser — 15 interactive paths, no server needed.

---

## What It Does

MediRoute guides tourists through 5 medical scenarios:

| Scenario | Flow |
|----------|------|
| 🚨 **Emergency** | Chat triage → severity assessment → 📞 Call 119 → ambulance dispatch |
| 🏥 **Clinic Visit** | Triage → insurance check → clinic search → booking → intake form scan → live doctor translation → Rx → pharmacy pickup → insurance claim |
| 💊 **Medication** | Prescription lookup, drug interaction checker, lost medication replacement, pre-travel medication check |
| 🗣️ **Live Translation** | Real-time Japanese↔English medical translation at pharmacies and doctor visits |
| 💰 **Cost & Admin** | Insurance coverage cards, cost estimation, receipt scanning, visa warnings |

## Project Structure

```
.
├── index.html               # 🎮 Interactive 15-path phone prototype (open in browser)
├── plan.ts                  # 🔄 3-agent hackathon planning pipeline
├── ask.ts                   # 💬 Single-agent Q&A CLI
├── pi-factcheck.ts          # ✅ Multi-agent fact-check pipeline (Researcher → Checker → Synthesizer)
├── docs/                    # 📚 Research, specs, market analysis
│   ├── product-spec.md      #   Full product specification (8 modules)
│   ├── pain-points.md       #   Target user pain points
│   ├── hackathon-master.md  #   Consolidated hackathon master document
│   ├── tech-plan.md         #   Generated tech stack + architecture
│   ├── market-landscape-verified.md
│   ├── data-feasibility-verified.md
│   ├── impact-metrics-corrected.md
│   └── ...
├── config/                  # ⚙️ Agent configuration
└── AGENTS.md                # 📖 Agent usage guide
```

## Quick Start

### Interactive Mock (no install needed)
```bash
open index.html
```
**Keyboard shortcuts:** `1`-`5` jump categories, `←` `→` navigate, `H` return to hub.

### Planning Pipeline (requires Node.js)
```bash
npm install
npx tsx plan.ts           # Run all 3 agents: Gap → Tech → Pitch
npx tsx plan.ts --quiet   # Progress-only mode
```

### Ask a Single Agent
```bash
npx tsx ask.ts tech "Best Gemini model for real-time medical translation?"
npx tsx ask.ts fact "Japan has 42M annual tourists"
npx tsx ask.ts pitch "Give me a 30-second demo opening hook"
npx tsx ask.ts gap "What regulatory issues for medical AI in Japan?"
```

### Fact-Check Any Claim
```bash
npx tsx pi-factcheck.ts "Japan ambulance transport is free for tourists"
```

## The 4 Agents

| Agent | Role | Invoke via |
|-------|------|-----------|
| 🕵️ **Gap Analyst** | Finds missing info, risks, blind spots | `ask.ts gap`, `plan.ts` (Agent A) |
| 🔧 **Tech Architect** | Gemini APIs, stack, architecture | `ask.ts tech`, `plan.ts` (Agent B) |
| 🎤 **Pitch Coach** | Demo flow, pitch deck, judge Q&A | `ask.ts pitch`, `plan.ts` (Agent C) |
| ✅ **Fact Checker** | Verifies claims with live web search | `ask.ts fact`, `pi-factcheck.ts` |

All agents use **agent-reach** (Exa semantic search + Jina Reader) for live web research and cross-reference sources with evidence.

## Tech Stack

- **Runtime:** Node.js + TypeScript (via `tsx`)
- **AI SDK:** `@earendil-works/pi-coding-agent` + `@earendil-works/pi-ai`
- **Model:** DeepSeek V3 (`deepseek-chat`)
- **Mock:** Vanilla HTML/CSS/JS — single file, zero dependencies
- **Web Search:** agent-reach (Exa + Jina Reader)

## Hackathon Context

This project was built for a **Google/Gemini hackathon**. The planning pipeline (`plan.ts`) is designed to:

1. **Gap Analyst** reads the product spec → identifies P0/P1/P2 gaps before development
2. **Tech Architect** recommends specific Gemini APIs, Firebase, Vertex AI integrations
3. **Pitch Coach** produces demo flow scripts, pitch deck outlines, and judge Q&A prep

The interactive mock (`index.html`) demonstrates the complete 15-path user experience as a clickable prototype suitable for demos.

---

*Built with pi coding agent + agent-reach. Hackathon-ready.*
