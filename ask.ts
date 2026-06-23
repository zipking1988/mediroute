/**
 * ask.ts — Simple single-agent Q&A for MediRoute hackathon planning
 *
 * Usage:
 *   node --import tsx ask.ts gap "Is 42M tourists a legit number?"
 *   node --import tsx ask.ts tech "Can Gemini Live API do real-time Japanese translation?"
 *   node --import tsx ask.ts pitch "What's a good opening hook for our demo?"
 *   node --import tsx ask.ts fact "Japan ambulance transport is free for tourists"
 */

import { AuthStorage, ModelRegistry, createAgentSession, SessionManager,
         SettingsManager, createExtensionRuntime, type ResourceLoader } from "@earendil-works/pi-coding-agent";

const authStorage = AuthStorage.create();
const modelRegistry = ModelRegistry.create(authStorage);
const model = modelRegistry.find("deepseek", "deepseek-chat");
if (!model) { console.error("DeepSeek not configured."); process.exit(1); }

const agent = process.argv[2];  // "gap" | "tech" | "pitch" | "fact"
const question = process.argv.slice(3).join(" ");

if (!agent || !question) {
  console.log("Usage: node --import tsx ask.ts <agent> \"your question\"");
  console.log("");
  console.log("Agents:");
  console.log("  gap   — Finds missing info, gaps, risks in your plan");
  console.log("  tech  — Recommends Gemini APIs, tech stack, architecture");
  console.log("  pitch — Helps with demo flow, pitch deck, judge questions");
  console.log("  fact  — Fact-checks a claim with web search");
  console.log("");
  console.log("Examples:");
  console.log("  node --import tsx ask.ts tech \"Best Gemini model for voice?\"");
  console.log("  node --import tsx ask.ts fact \"Japan has 42M tourists/year\"");
  process.exit(0);
}

const PROMPTS: Record<string, string> = {
  gap: `You help a hackathon team plan MediRoute — an AI medical companion for tourists in Japan.
Read /Applications/MAMP/htdocs/agent-pipeline/docs/product-spec.md and docs/pain-points.md for context.
Be direct. Find gaps, risks, missing info. Answer concisely.`,

  tech: `You are a Gemini/Google hackathon tech advisor.
MediRoute is a medical AI for tourists in Japan. Built with Gemini APIs.
Recommend specific Gemini models, APIs, architecture. Be practical — hackathon timeline.
Search the web via: mcporter call 'exa.web_search_exa(query: "...", numResults: 5)'
Read pages via: curl -s "https://r.jina.ai/URL"
Answer concisely with specific API names.`,

  pitch: `You are a hackathon pitch coach for MediRoute (AI medical companion for Japan tourists).
Help with demo scripts, pitch slides, judge Q&A, presentation strategy.
Read /Applications/MAMP/htdocs/agent-pipeline/docs/product-spec.md for context.
Be punchy and practical.`,

  fact: `Fact-check claims using live web search.
Search via: mcporter call 'exa.web_search_exa(query: "...", numResults: 5)'
Read pages via: curl -s "https://r.jina.ai/URL"
Cross-reference multiple sources. Rate: TRUE/FALSE/MISLEADING/UNVERIFIABLE.
Output: Verdict + evidence + sources.`
};

function loader(): ResourceLoader {
  return {
    getExtensions: () => ({ extensions: [], errors: [], runtime: createExtensionRuntime() }),
    getSkills: () => ({ skills: [], diagnostics: [] }),
    getPrompts: () => ({ prompts: [], diagnostics: [] }),
    getThemes: () => ({ themes: [], diagnostics: [] }),
    getAgentsFiles: () => ({ agentsFiles: [] }),
    getSystemPrompt: () => PROMPTS[agent] ?? PROMPTS.gap,
    getAppendSystemPrompt: () => [],
    extendResources: () => {},
    reload: async () => {},
  };
}

async function main() {
  const { session } = await createAgentSession({
    cwd: process.cwd(),
    model,
    thinkingLevel: "off",
    authStorage,
    modelRegistry,
    resourceLoader: loader(),
    tools: agent === "tech" || agent === "fact" ? ["read", "bash"] : ["read"],
    sessionManager: SessionManager.inMemory(),
    settingsManager: SettingsManager.inMemory({ compaction: { enabled: false } }),
  });

  session.subscribe((event) => {
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      process.stdout.write(event.assistantMessageEvent.delta);
    }
  });

  await session.prompt(question);
  session.dispose();
  console.log();
}

main().catch((err) => { console.error("Error:", err); process.exit(1); });
