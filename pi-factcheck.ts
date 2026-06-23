/**
 * pi-factcheck — Multi-Agent Fact-Check Pipeline
 *
 * Architecture:
 *   Agent A (Researcher)  → gathers info, produces research report
 *   Agent B (Fact-Checker) → verifies claims, spots errors, annotates
 *   Agent C (Synthesizer)  → formats final output with verdict + confidence
 *
 * Usage:
 *   npx tsx pi-factcheck.ts "Is AI regulation moving faster than AI capability?"
 *   npx tsx pi-factcheck.ts --claim "claim here" --model sonnet
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

// ─── CLI argument parsing ────────────────────────────────────────────────────
const args = process.argv.slice(2);
let claim = "";
let modelPreference: "cheap" | "powerful" = "powerful";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--claim" || args[i] === "-c") {
    claim = args[++i];
  } else if (args[i] === "--model" || args[i] === "-m") {
    const val = args[++i];
    if (val === "cheap" || val === "powerful") modelPreference = val;
  } else if (!args[i].startsWith("--")) {
    claim = args[i];
  }
}

if (!claim) {
  console.error("Usage: npx tsx pi-factcheck.ts '<claim to verify>'");
  console.error("       npx tsx pi-factcheck.ts --claim '<claim>' [--model cheap|powerful]");
  process.exit(1);
}

// ─── Model selection ─────────────────────────────────────────────────────────
const authStorage = AuthStorage.create(); // uses ~/.pi/agent/auth.json
const modelRegistry = ModelRegistry.create(authStorage);

// ─── DeepSeek-only setup ─────────────────────────────────────────────────────
// Uses DeepSeek API key from ~/.pi/agent/auth.json (provider: "deepseek")
// Custom model definitions in ~/.pi/agent/models.json
//   - deepseek-chat    → DeepSeek V3  (fast, 0.27/1.10 per M tokens)
//   - deepseek-reasoner → DeepSeek R1 (reasoning, 0.55/2.19 per M tokens)

const researcherModel = modelRegistry.find("deepseek", "deepseek-chat");        // Agent A: fast research
const factCheckModel = modelRegistry.find("deepseek", "deepseek-reasoner") ??   // Agent B: reasoning for verification
                       modelRegistry.find("deepseek", "deepseek-chat");
const synthesizerModel = modelRegistry.find("deepseek", "deepseek-chat");       // Agent C: formatting only

if (!researcherModel || !factCheckModel || !synthesizerModel) {
  console.error("DeepSeek models not found. Check:");
  console.error("  1. ~/.pi/agent/auth.json has 'deepseek' key");
  console.error("  2. ~/.pi/agent/models.json has DeepSeek provider");
  console.error("  3. Or set: export DEEPSEEK_API_KEY=sk-...");
  process.exit(1);
}

// ─── Shared resource loader factory ──────────────────────────────────────────
function createRoleLoader(role: string, systemPrompt: string): ResourceLoader {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Collect full text output from a session. Returns the complete response text. */
async function collectOutput(session: AgentSession): Promise<string> {
  let output = "";
  return new Promise<string>((resolve) => {
    session.subscribe((event) => {
      if (event.type === "message_update") {
        const d = event.assistantMessageEvent;
        if (d.type === "text_delta") {
          process.stderr.write(d.delta); // stream to stderr so stdout stays clean
          output += d.delta;
        }
      }
      if (event.type === "agent_end") {
        resolve(output);
      }
    });
  });
}

/** Spawn an agent session for a specific role. */
async function spawnAgent(opts: {
  role: string;
  model: ReturnType<typeof getModel>;
  systemPrompt: string;
  tools: string[];
}): Promise<{ session: AgentSession; run: (prompt: string) => Promise<string> }> {
  const { session } = await createAgentSession({
    cwd: process.cwd(),
    model: opts.model,
    thinkingLevel: "off",
    authStorage,
    modelRegistry,
    resourceLoader: createRoleLoader(opts.role, opts.systemPrompt),
    tools: opts.tools,
    sessionManager: SessionManager.inMemory(),
    settingsManager: SettingsManager.inMemory({
      compaction: { enabled: false },
      retry: { enabled: true, maxRetries: 2 },
    }),
  });

  const run = async (prompt: string): Promise<string> => {
    const outputPromise = collectOutput(session);
    await session.prompt(prompt);
    return outputPromise;
  };

  return { session, run };
}

// ─── Agent system prompts ────────────────────────────────────────────────────

const RESEARCHER_PROMPT = `You are a thorough RESEARCH AGENT. Your only job: investigate a claim and produce a detailed, neutral research report.

## Web Search Tools (use these via bash)

You can search the live web and read pages. Use these commands:

1. SEARCH THE WEB (semantic search, no API key needed):
   mcporter call 'exa.web_search_exa(query: "your search query", numResults: 5)'

2. READ ANY WEBPAGE (extracts clean text):
   curl -s "https://r.jina.ai/URL_HERE"

3. For known authoritative sources, you may also access them directly with curl.

## Rules
- **Always search the web** — do not rely solely on your training data
- Run multiple searches with different angles (e.g., "evidence for X", "evidence against X", "expert consensus on X")
- For each search result that looks authoritative, read the full page with Jina Reader
- Gather facts from all sides — supporting AND opposing evidence
- Cite specific sources, dates, URLs, and data points whenever possible
- Distinguish between verified facts, expert consensus, and speculation
- Flag anything you're uncertain about explicitly
- Structure your output clearly: Background → Evidence For → Evidence Against → Uncertainties
- Do NOT offer a conclusion or verdict — leave that to the fact-checker
- If you cannot find enough information, say so honestly

Output format:
## Background
[context on the topic]

## Evidence Supporting (with sources)
[facts/data that support the claim, each with URL/source]

## Evidence Contradicting (with sources)
[facts/data that contradict or complicate the claim, each with URL/source]

## Key Uncertainties
[what remains unclear or disputed]`;

const FACTCHECKER_PROMPT = `You are an adversarial FACT-CHECK AGENT. Your job: rigorously verify a research report against the actual facts by searching the live web.

## Web Search Tools (use these via bash — they are your primary verification tools)

1. SEARCH THE WEB (semantic search, no API key needed):
   mcporter call 'exa.web_search_exa(query: "your search query", numResults: 5)'

2. READ ANY WEBPAGE (extracts clean text):
   curl -s "https://r.jina.ai/URL_HERE"

3. For known authoritative sources (Wikipedia, .gov, major news sites), you may also access them directly with curl.

## Verification Protocol (follow this order)

**Step 1 — Search for each claim**: For every factual assertion in the research report, run at least one targeted web search to verify it. Don't just trust the researcher's sources — find independent sources.

**Step 2 — Read the best sources**: For authoritative-looking results, read the full page with Jina Reader. Don't rely on search snippets alone.

**Step 3 — Cross-reference**: If the researcher cited a source, find OTHER sources that confirm or contradict the same fact. Single-source claims are weak evidence.

**Step 4 — Rate each claim**: For each factual assertion, determine: TRUE / FALSE / MISLEADING / UNVERIFIABLE. Explain your reasoning with specific URLs.

## Rules
- Challenge EVERY factual assertion in the research report
- You are a skeptic — assume nothing, verify everything with web search
- Point out: missing context, cherry-picked data, logical fallacies, outdated information
- If the researcher missed critical evidence, find it and add it
- If the researcher cited sources, verify those sources actually say what the researcher claims
- Be specific: "The report says X, but [source URL] shows Y, because Z"
- If a claim cannot be verified through web search, mark it UNVERIFIABLE and explain why

Output format:
## Claim-by-Claim Verification
[each assertion from the research report, rated with TRUE/FALSE/MISLEADING/UNVERIFIABLE + explanation + source URLs]

## Missing Evidence
[what the researcher should have included but didn't — with URLs to the missing evidence]

## Source Quality Assessment
[Are the sources cited authoritative? Any red flags?]

## Overall Assessment
- How accurate was the research? (1-10)
- What's the biggest problem with it?
- What's the strongest verified point?`;

const SYNTHESIZER_PROMPT = `You are a SYNTHESIS AGENT. Your job: take a fact-check report and produce a clean, reader-friendly final output.

Rules:
- Start with a clear VERDICT on the original claim (True / Mostly True / Mixed / Mostly False / False / Unverifiable)
- Include a CONFIDENCE score (Low / Medium / High)
- Summarize the key verified facts in 3-5 bullet points
- Summarize the key problems/errors in 3-5 bullet points
- Add a "What You Should Know" section for context
- Keep it concise and scannable — this is the final output the user reads

Output format:
## Verdict: [rating] (Confidence: [level])

### ✅ Verified Facts
- ...
- ...

### ⚠️ Issues Found
- ...
- ...

### 🧠 What You Should Know
[essential context, 2-4 sentences]

### 📊 Scorecard
| Metric | Rating |
|--------|--------|
| Factual accuracy | X/10 |
| Completeness | X/10 |
| Balance | X/10 |`;

// ─── Main pipeline ───────────────────────────────────────────────────────────

async function main() {
  console.error(`\n🔍 pi-factcheck pipeline starting...\n`);
  console.error(`📋 Claim: "${claim}"\n`);

  // ── Agent A: Research ──────────────────────────────────────────────────
  console.error("── Agent A (Researcher) gathering information... ──\n");
  const researcher = await spawnAgent({
    role: "researcher",
    model: researcherModel,
    systemPrompt: RESEARCHER_PROMPT,
    tools: ["read", "bash"],
  });

  const researchReport = await researcher.run(
    `Investigate this claim thoroughly:\n\n"${claim}"\n\n` +
    `CRITICAL: Use the web search tools (mcporter for Exa search, curl for Jina Reader) to find current, ` +
    `authoritative information. Run at least 3-5 different searches from multiple angles. ` +
    `Read the most promising pages with Jina Reader. ` +
    `Cite specific URLs for every factual claim in your report.`
  );
  researcher.session.dispose();
  console.error("\n✅ Research complete\n");

  // ── Agent B: Fact-Check ────────────────────────────────────────────────
  console.error("── Agent B (Fact-Checker) verifying claims... ──\n");
  const factChecker = await spawnAgent({
    role: "fact-checker",
    model: factCheckModel,
    systemPrompt: FACTCHECKER_PROMPT,
    tools: ["read", "bash"],
  });

  const factCheckReport = await factChecker.run(
    `Original claim: "${claim}"\n\n` +
    `Here is the research report to verify:\n\n${researchReport}\n\n` +
    `CRITICAL: For every factual assertion in this report, run a targeted web search to verify it. ` +
    `Use mcporter 'exa.web_search_exa(...)' to search, and curl -s "https://r.jina.ai/URL" to read pages. ` +
    `Find independent sources — do NOT just trust the researcher's citations. ` +
    `If the researcher cites a source, verify that source actually says what they claim. ` +
    `Rate every assertion as TRUE, FALSE, MISLEADING, or UNVERIFIABLE with specific evidence URLs. ` +
    `Be adversarial — find every problem, missing context, or error.`
  );
  factChecker.session.dispose();
  console.error("\n✅ Fact-check complete\n");

  // ── Agent C: Synthesize ────────────────────────────────────────────────
  console.error("── Agent C (Synthesizer) formatting final output... ──\n");
  const synthesizer = await spawnAgent({
    role: "synthesizer",
    model: synthesizerModel,
    systemPrompt: SYNTHESIZER_PROMPT,
    tools: [], // no tools needed — pure formatting
  });

  const finalOutput = await synthesizer.run(
    `Original claim: "${claim}"\n\n` +
    `Here is the fact-check report to synthesize:\n\n${factCheckReport}\n\n` +
    `Produce the final reader-friendly output.`
  );
  synthesizer.session.dispose();

  // ── Final output ───────────────────────────────────────────────────────
  console.error("\n═══════════════════════════════════════════════════════\n");
  console.log(finalOutput);
  console.error("\n✅ Pipeline complete.");
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
