/**
 * MediRoute Hackathon Planning Pipeline
 *
 * Three specialized planning agents for hackathon prep (NO development — planning only):
 *   Agent A (Gap Analyst)  → What's missing? What decisions are unmade?
 *   Agent B (Tech Architect) → What Gemini APIs + stack? What's hackathon-feasible?
 *   Agent C (Pitch Coach)   → Demo flow, presentation, judge questions
 *
 * Usage:
 *   node --import tsx plan.ts          # Full streaming output
 *   node --import tsx plan.ts --quiet  # Progress-only, clean output
 */

import { getModel } from "@earendil-works/pi-ai";
import {
  AuthStorage,
  createAgentSession,
  createExtensionRuntime,
  ModelRegistry,
  type AgentSession,
  type ResourceLoader,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";

// ─── Setup ───────────────────────────────────────────────────────────────────
const QUIET = process.argv.includes("--quiet") || process.argv.includes("-q");

const authStorage = AuthStorage.create();
const modelRegistry = ModelRegistry.create(authStorage);
const model = modelRegistry.find("deepseek", "deepseek-chat");  // V3 — faster, handles long context better

if (!model) {
  console.error("DeepSeek model not found. Check ~/.pi/agent/models.json");
  process.exit(1);
}

function log(msg: string) { if (!QUIET) console.error(msg); }
function progress(msg: string) { console.error(msg); } // Always show progress

function createLoader(systemPrompt: string): ResourceLoader {
  return {
    getExtensions: () => ({ extensions: [], errors: [], runtime: createExtensionRuntime() }),
    getSkills: () => ({ skills: [], diagnostics: [] }),
    getPrompts: () => ({ prompts: [], diagnostics: [] }),
    getThemes: () => ({ themes: [], diagnostics: [] }),
    getAgentsFiles: () => ({ agentsFiles: [] }),
    getSystemPrompt: () => systemPrompt,
    getAppendSystemPrompt: () => [],
    extendResources: () => {},
    reload: async () => {},
  };
}

async function collectOutput(session: AgentSession, label: string): Promise<string> {
  let output = "";
  let lastDot = Date.now();
  return new Promise<string>((resolve) => {
    session.subscribe((event) => {
      if (event.type === "message_update") {
        const d = event.assistantMessageEvent;
        if (d.type === "text_delta") {
          if (!QUIET) process.stderr.write(d.delta);
          else if (Date.now() - lastDot > 3000) { process.stderr.write("."); lastDot = Date.now(); }
          output += d.delta;
        }
      }
      if (event.type === "agent_end") {
        if (QUIET) process.stderr.write("\n");
        resolve(output);
      }
    });
  });
}

async function spawnAgent(opts: {
  role: string;
  systemPrompt: string;
  tools: string[];
}): Promise<{ session: AgentSession; run: (prompt: string, label: string) => Promise<string> }> {
  const { session } = await createAgentSession({
    cwd: process.cwd(),
    model,
    thinkingLevel: "off",
    authStorage,
    modelRegistry,
    resourceLoader: createLoader(opts.systemPrompt),
    tools: opts.tools,
    sessionManager: SessionManager.inMemory(),
    settingsManager: SettingsManager.inMemory({
      compaction: { enabled: false },
      retry: { enabled: true, maxRetries: 2 },
    }),
  });

  const run = async (prompt: string, label: string): Promise<string> => {
    const outputPromise = collectOutput(session, label);
    await session.prompt(prompt);
    return outputPromise;
  };

  return { session, run };
}

// ─── Agent Prompts ───────────────────────────────────────────────────────────

const GAP_ANALYST_PROMPT = `You are a HACKATHON GAP ANALYST. Your job: read a product spec and pain points doc, then identify EVERYTHING that is missing or undecided before development can start.

## Rules
- Read the product spec and pain points carefully
- Identify gaps in 5 categories:
  1. USER RESEARCH — what user behaviors, preferences, or needs are still unknown?
  2. TECHNICAL UNKNOWNS — which APIs aren't ready, which models need testing, which integrations are unproven?
  3. REGULATORY/LEGAL — medical compliance, data privacy (Japan's APPI), liability questions?
  4. DESIGN DECISIONS — what UX flows, state machines, or edge cases haven't been designed yet?
  5. BUSINESS MODEL — monetization, go-to-market, partnerships needed?
- For each gap: state WHY it matters and WHAT the consequence is of not answering it
- Prioritize: P0 (blocks development), P1 (blocks launch), P2 (nice to have)
- Be brutally honest — don't sugarcoat missing pieces
- This is a HACKATHON — flag what must be done before Friday demo vs. what can wait

## Output Format
## Gap Analysis for MediRoute

### P0 — Blocks Development
[gap name]: [why it matters + what happens if skipped]

### P1 — Blocks Launch
[gap name]: [why it matters + what happens if skipped]

### P2 — Nice to Have
[gap name]: [why it matters + what happens if skipped]

## Pre-Development Checklist
- [ ] Item 1
- [ ] Item 2
...

## Critical Assumptions to Validate
[list assumptions that, if wrong, break the product]`;

const TECH_ARCHITECT_PROMPT = `You are a HACKATHON TECH ARCHITECT specializing in Google/Gemini ecosystem. Your job: recommend the tech stack, architecture, and implementation plan for a Gemini-powered hackathon project.

## Context
- This is a Google/Gemini hackathon
- The product is MediRoute — a medical companion for tourists in Japan
- You have 24-48 hours to build a demo
- The demo must impress judges — working prototype > complete product
- Prefer Google Cloud / Firebase / Vertex AI / Gemini APIs wherever possible

## Rules
1. For each module in the spec, recommend:
   - Which Gemini/Google API or model to use (Gemini 2.5 Flash for speed? Pro for reasoning? Gemini on Vertex?)
   - What to build vs. what to mock/fake for the demo
   - Estimated build time per module

2. Architecture decisions:
   - Frontend framework (recommend something fast to build)
   - Backend (Firebase? Cloud Functions? something simpler?)
   - Database (Firestore? SQLite-on-device? both?)
   - How agents/modules communicate (function calling? direct API? orchestration?)

3. Hackathon-specific advice:
   - What to pre-build before the hackathon
   - What's the minimum viable demo flow?
   - What will make judges say "wow"?
   - What Gemini capabilities to showcase (multimodal? real-time voice? function calling? long context?)

4. Risk assessment:
   - What's most likely to fail?
   - What has the highest demo impact per hour of work?

## Output Format
## Recommended Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| ... | ... | ... |

## Module Implementation Plan (per module)
### Module N: [name]
- Gemini API: [which model, which capability]
- Build vs. Mock: [what to actually code vs. fake for demo]
- Demo Script: [how to show it off]
- Estimated hours: X

## Architecture Diagram (describe in text)
[data flow, how modules connect, where state lives]

## Pre-Hackathon Prep List
[what to set up before the hackathon starts]

## Minimum Viable Demo Flow
[the ONE user journey judges will see]

## Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ... | ... | ... | ... |`;

const PITCH_COACH_PROMPT = `You are a HACKATHON PITCH COACH. Your job: take the gap analysis and tech plan, then produce EVERYTHING the team needs to win — demo flow, pitch deck outline, judge Q&A prep, and presentation strategy.

## Rules
1. **Demo Flow** — script the EXACT demo judges will see, second by second
   - Opening hook (first 10 seconds — make them care)
   - Core demo (the one user journey)
   - "Wow" moment (the thing that makes them lean forward)
   - Closing pitch

2. **Pitch Deck Outline** — slide-by-slide structure
   - Problem slide (use the pain points data — make it visceral)
   - Solution slide
   - Demo slide (what to show live vs. pre-recorded)
   - Tech slide (Gemini integration highlights)
   - Market slide (42M tourists, $X addressable)
   - Business model slide
   - Team slide (what to include)

3. **Judge Q&A Prep** — the 10 hardest questions judges will ask + your answers
   - "How is this different from Google Translate + WebMD?"
   - "What about liability if the triage is wrong?"
   - "How do you get clinics to accept bookings from an AI?"
   - [7 more tough questions]

4. **Presentation Strategy**
   - What to pre-record vs. do live
   - Backup plan if APIs fail
   - One thing to cut if you run out of time
   - The one sentence judges should remember

## Output Format
## Demo Flow Script
[00:00-00:10] ...
[00:10-00:40] ...
[00:40-01:30] ...
[01:30-02:00] ...
[02:00-02:30] — Closing

## Pitch Deck (10 slides)
### Slide 1: Title
### Slide 2: Problem
...
### Slide 10: Ask / Closing

## Judge Q&A — The Hard Questions
### Q1: [tough question]
**Answer:** [your response]

### Q2: [tough question]
**Answer:** [your response]
...

## Presentation Strategy
- **Pre-record**: [what to film ahead]
- **Live**: [what to demo in real-time]
- **Backup plan**: [if API/network fails]
- **Cut if time**: [the one thing to drop]
- **One-liner**: [the sentence judges remember]`;

// ─── Main Pipeline ───────────────────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";

async function main() {
  const docsDir = path.join(process.cwd(), "docs");

  // Load reference docs
  const productSpec = fs.readFileSync(path.join(docsDir, "product-spec.md"), "utf-8");
  const painPoints = fs.readFileSync(path.join(docsDir, "pain-points.md"), "utf-8");

  progress("\n🏥 MediRoute Hackathon Planning Pipeline");
  progress("=" .repeat(50));
  progress(`Mode: ${QUIET ? "quiet (progress only)" : "verbose (full output)"}`);

  // ── Agent A: Gap Analyst ──────────────────────────────────────────────
  progress("\n🔍 Agent A (Gap Analyst) — Finding what's missing...");
  const gapAgent = await spawnAgent({
    role: "gap-analyst",
    systemPrompt: GAP_ANALYST_PROMPT,
    tools: ["read"],
  });
  const gapReport = await gapAgent.run(
    `Analyze this product for a Gemini hackathon. Identify EVERY gap.\n\n` +
    `## Product Spec\n${productSpec}\n\n## Pain Points\n${painPoints}`,
    "Agent A"
  );
  gapAgent.session.dispose();
  fs.writeFileSync(path.join(docsDir, "gap-analysis.md"), gapReport);
  progress("✅ docs/gap-analysis.md saved\n");

  // ── Agent B: Tech Architect ───────────────────────────────────────────
  progress("🔧 Agent B (Tech Architect) — Designing the stack...");
  const techAgent = await spawnAgent({
    role: "tech-architect",
    systemPrompt: TECH_ARCHITECT_PROMPT,
    tools: ["read", "bash"],
  });
  const techReport = await techAgent.run(
    `Design the tech stack and implementation plan.\n\n` +
    `## Product Spec\n${productSpec}\n\n` +
    `## Gap Analysis\n${gapReport.slice(0, 3000)}...\n\n` +
    `CRITICAL: This is a GOOGLE/GEMINI hackathon. Prefer Gemini APIs, Vertex AI, ` +
    `Firebase, and Google Cloud. Search the web via mcporter or curl to verify API ` +
    `availability, pricing, and capabilities for each recommendation.`,
    "Agent B"
  );
  techAgent.session.dispose();
  fs.writeFileSync(path.join(docsDir, "tech-plan.md"), techReport);
  progress("✅ docs/tech-plan.md saved\n");

  // ── Agent C: Pitch Coach ──────────────────────────────────────────────
  progress("🎤 Agent C (Pitch Coach) — Crafting the winning pitch...");
  const pitchAgent = await spawnAgent({
    role: "pitch-coach",
    systemPrompt: PITCH_COACH_PROMPT,
    tools: ["read"],
  });
  const pitchReport = await pitchAgent.run(
    `Create the demo flow, pitch deck, and judge Q&A.\n\n` +
    `## Product Spec\n${productSpec.slice(0, 2000)}...\n\n` +
    `## Pain Points\n${painPoints.slice(0, 1500)}...\n\n` +
    `## Tech Plan Summary\n${techReport.slice(0, 2000)}...`,
    "Agent C"
  );
  pitchAgent.session.dispose();
  fs.writeFileSync(path.join(docsDir, "pitch-plan.md"), pitchReport);
  progress("✅ docs/pitch-plan.md saved\n");

  // ── Summary ───────────────────────────────────────────────────────────
  progress("=" .repeat(50));
  progress("\n📁 All planning docs generated:");
  progress("  docs/gap-analysis.md   — What's missing (P0/P1/P2)");
  progress("  docs/tech-plan.md      — Gemini stack + architecture");
  progress("  docs/pitch-plan.md     — Demo flow + pitch deck + judge Q&A");
  progress("\n🚀 Ready for hackathon.\n");
}

main().catch((err) => {
  console.error("Planning pipeline failed:", err);
  process.exit(1);
});
