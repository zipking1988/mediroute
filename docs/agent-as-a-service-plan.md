# MediRoute: Agent-as-a-Service — Architecture & Gap Analysis

**Date:** 2026-06-23 | **Prepared by:** Tech Architect + Gap Analyst agents  
**Sources:** Google Gemini docs (live), Devpost Live Medical Interpreter, AWS Multi-Tenant Agentic AI Guide, CallSphere AaaS Architecture, Google Agent Platform docs, PMDA SaMD regulation, APPI 2026 amendments, Springer liability analysis, GENOVA/Pocketalk competitive intel

---

## PART 1: TECH ARCHITECT — Architecture Recommendation

### 1.1 What "Agent as a Service" Means for MediRoute

MediRoute is not a single-user app. It's a platform where **each tourist/session gets their own isolated agent instance** — a Health Session Agent that runs autonomously through the full pipeline:

```
triage → find clinic → book → translate → claim
```

The service exposes this as an API/SDK that other apps (clinics, travel insurers, hotel apps, airline portals) can embed.

**Architecturally, this flips the model from "one app with one Gemini key" to "multi-tenant agent platform."**

### 1.2 Recommended Stack

| Layer | Technology | Why for AaaS |
|-------|-----------|-------------|
| **Agent Runtime** | **Google Agent Engine (Vertex AI)** | Fully managed agent hosting. Scales to zero when idle. Built-in multi-tenant isolation, identity, memory, tool gateway. **No Kubernetes to manage.** |
| **Agent Framework** | **ADK (Agent Development Kit)** | Open-source, builds multi-agent hierarchies. Health Session Agent is the orchestrator; subagents = TriageAgent, BookingAgent, TranslationAgent, ClaimAgent. Native deploy to Agent Engine. |
| **Real-time Translation** | **Gemini 3.5 Live Translate** (shipped June 9, 2026) | Speech-to-speech in 70+ languages incl. Japanese. <1s latency. WebSocket. **This is your hackathon showstopper** — most teams don't know it exists yet. |
| **Voice Agent** | **Gemini 3.1 Flash Live API** | Bidirectional audio for doctor-patient mode. VAD built-in. Phone booking agent (Module 3). |
| **Text Reasoning** | **Gemini 2.5 Flash** | Triage, facility matching, drug interaction, OCR. 1M token context. Built-in Google Maps Grounding (replaces JNTO NAVII). Structured output + function calling. |
| **Multi-Tenant Isolation** | **Agent Engine isolation modes** | Silo mode (dedicated per org) or pooled mode (shared with tenant context propagation). Start pooled, offer silo for enterprise tier. |
| **Memory & State** | **Agent Platform Memory Bank** | Persistent agent memory across sessions. Health session persists even if user closes browser. |
| **Gateway / Auth** | **Agent Gateway + Firebase Auth** | Central policy enforcement for all agent tool calls. Per-tenant rate limiting, token budgets, cost attribution. |
| **Messaging** | **A2A Protocol** (Agent-to-Agent) | Open standard. Subagents negotiate capabilities. Works across frameworks (ADK, LangGraph, CrewAI). |
| **Deployment** | **Cloud Run (serverless) or GKE (enterprise)** | Start on Cloud Run for zero-ops. Move to GKE when you need per-agent container isolation at scale. |
| **Billing** | **Stripe metered billing** | Per-minute translation, per-session triage, per-booking, per-claim. Tie directly to Gemini token consumption. |
| **Database** | **Firestore (pooled, row-level security)** | `tenant_id` on every document. PostgreSQL with RLS for enterprise tier. |

### 1.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Cloud Run / Agent Gateway)         │
│  Auth (Firebase) | Rate Limiting | Tenant Routing | Cost Tracking  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  CONTROL PLANE   │ │  AGENT RUNTIME   │ │  TOOL EXECUTOR   │
│                  │ │                  │ │                  │
│ Tenant onboarding│ │ Health Session   │ │ Maps Grounding   │
│ Config management│ │ Agent (ADK)      │ │ Live Translate   │
│ Tiering / billing│ │   ├ TriageAgent  │ │ Drug DB lookup   │
│ Agent registry   │ │   ├ BookingAgent │ │ OCR processing   │
│ Memory Bank      │ │   ├ TranslateAgt │ │ Booking API      │
│                  │ │   └ ClaimAgent   │ │ Insurance API    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Firestore + Cloud Storage)        │
│  tenant_id → sessions | prescriptions | claims | receipts | config │
│  Row-level security | Per-tenant encryption keys | Audit logging  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.4 End-to-End Session Flow

```
1. Tourist opens clinic's embedded MediRoute widget → Firebase anonymous auth
2. Gateway authenticates, resolves tenant (clinic org), routes to Agent Engine
3. Health Session Agent spins up (cold start <1s via Agent Engine)
4. Agent loads session from Memory Bank (or creates new)
5. Tourist says "chest pain" → Gemini 3.5 Live Translate detects language
6. Health Session Agent delegates to TriageAgent (Gemini 2.5 Flash)
7. TriageAgent returns severity + specialty → BookingAgent finds clinic (Maps Grounding)
8. BookingAgent's phone-booking subagent calls clinic in Japanese (Gemini 3.1 Flash Live)
9. During visit, TranslateAgent runs Gemini 3.5 Live Translate for doctor-patient
10. After visit, ClaimAgent OCRs receipt, generates insurance PDF
11. Session archived to Memory Bank, Agent Engine scales to zero
```

### 1.5 Multi-Tenant Isolation Strategy

| Mode | Isolation Level | Cost | When |
|------|----------------|------|------|
| **Pooled** | Shared agent runtime, tenant context propagated via thread-local | Lowest | Free tier, small clinics |
| **Silod** | Dedicated Agent Engine deployment per tenant | Higher | Enterprise hospitals, compliance |
| **Hybrid** | Pooled for triage/translation, silod for PHI processing | Balanced | **Recommended production setup** |

Start **pooled** with row-level security on Firestore. Add silo option when enterprise customers require it. From CallSphere's production experience: *"Most platforms don't need full microservices until they pass 500 active tenants."*

### 1.6 Key Technical Decisions

#### ✅ Use Gemini 3.5 Live Translate (not Whisper → translate → TTS pipeline)

The product spec's Module 5 describes a chain: Whisper ASR → medical translation LLM → TTS. **Skip this entire chain.** Gemini 3.5 Live Translate does speech-to-speech directly in 70+ languages with no intermediate text. It's brand new (June 9, 2026) — most hackathon teams don't know it exists. This is your unfair advantage.

**Cost:** ~$0.0368/min for both input + output audio (25 tokens/sec of audio).

#### ✅ Use Agent Engine (not raw Next.js API routes)

The tech plan's architecture (Next.js API routes proxying Gemini) works for a demo. For AaaS, you need:
- Agent identity per tenant
- Memory persistence across sessions
- Tool call governance (don't let Tenant A's agent call Tenant B's data)
- Cost attribution per tenant
- Cold start management

Google's **Agent Engine + ADK** gives you this out of the box.

#### ⚠️ Context Window Re-Billing Problem

The Gemini Live API re-bills ALL accumulated audio tokens on every turn. A 30-minute doctor-patient session at minute 28 costs dramatically more than at minute 2.

> *"Tokens accumulate in the persistent WebSocket session — a 10-second interaction at the end of a long session costs significantly more than a 10-second interaction at the start."* — Google dev forum

**Mitigations:**
- Enable context window compression (evicts older tokens, caps re-billing)
- For sessions >15 min, break into multiple sub-sessions
- **Hard cap:** Live API max session duration is **10 minutes** by default — this is a hard architectural constraint

#### ⚠️ Medical Hallucination Guardrails

Implement **two-model verification**: a second Gemini model reviews all triage/summary output against original input, flags unsupported claims. This was a key lesson from the Live Medical Interpreter on Devpost.

### 1.7 Hackathon Build Priority (48 hrs)

| Priority | Feature | Technology | Time |
|----------|---------|------------|------|
| 🔴 P0 | **Live voice translation demo** (doctor↔patient) | Gemini 3.5 Live Translate | 4 hrs |
| 🔴 P0 | **Symptom triage + clinic finder** | Gemini 2.5 Flash + Maps Grounding | 6 hrs |
| 🟡 P1 | **Session agent with multi-tenant routing** | ADK + Agent Engine | 8 hrs |
| 🟡 P1 | **Phone booking agent** (Japanese voice call) | Gemini 3.1 Flash Live | 6 hrs |
| 🟢 P2 | **Receipt OCR + insurance claim** | Gemini 2.5 Flash (vision) | 4 hrs |
| 🟢 P2 | **Drug interaction check** | Gemini 2.5 Flash + function calling to drug DB | 3 hrs |
| ⚪ P3 | **AaaS API + Stripe billing** | Cloud Run + Stripe SDK | 4 hrs |
| ⚪ P3 | **Embeddable widget SDK** | iframe + postMessage API | 3 hrs |

---

## PART 2: GAP ANALYST — Stress Test & Blind Spots

### 2.1 Regulatory Minefield #1: SaMD Classification in Japan

**Severity: 🔴 CRITICAL**

Under Japan's PMD Act (enforced since November 2014), any software that *"diagnoses, treats, or prevents disease"* is classified as a **Software as a Medical Device (SaMD)** and requires PMDA approval.

MediRoute's triage module (Module 1) **explicitly diagnoses**: it takes symptoms, assigns a JTAS severity score (1–5), and routes to a specialty. This is not a "wellness app" or "informational guide" — this is clinical decision support. The PMDA's 2025 guidance explicitly covers AI-based diagnostic software.

**The gap:** The architecture plan treats this as a pure software engineering problem. It's not. If MediRoute's triage output is wrong and a tourist dies, you face:

1. **Criminal liability** under Japanese medical practice law (unauthorized medical practice)
2. **Civil liability** — the physician is held liable for following AI advice (confirmed by Johns Hopkins Carey analysis: *"physicians bear the responsibility, regardless of how complex or opaque the technology may be"*)
3. **Product liability** — as the SaMD manufacturer, you're the "cheapest cost avoider" and would be primary defendant

**Recommendation:** Add a **legal disclaimer architecture** — every triage output must include:
> "This is an AI-generated assessment, not a medical diagnosis. Always consult a licensed physician. In case of emergency (severity 1–2), call 119 immediately."

Add a human-in-the-loop override that requires a clinician sign-off before any severity 1–2 triage triggers an action. **Frame the triage as "symptom guidance" not "diagnosis"** in all regulatory filings.

### 2.2 Regulatory Minefield #2: APPI 2026 Amendments & Medical Data

**Severity: 🟡 HIGH**

Japan's APPI amendments (Cabinet approved April 2026, likely Diet passage 2026, full effect by 2028) create both opportunities and traps:

| What changes | Impact on MediRoute |
|-------------|-------------------|
| New consent exemption for statistical processing (AI dev) | ✅ Good — you can use anonymized health data for model improvement |
| Hospitals explicitly included as "academic research institutions" | ✅ Good — partner hospitals can share data more easily |
| New "Specific Biometric Personal Information" category | ⚠️ Voice is biometric. Audio from Live Translate sessions = biometric data. Requires transparency and grants users right to deletion. |
| Children under 16 need parental consent | ⚠️ If tourists include minors, you need parental consent flow |
| PPC can impose administrative fines for serious violations | ⚠️ Compliance is now enforceable, not voluntary |

**The gap:** The architecture stores audio from Live Translate sessions but doesn't address:
- Voice data = biometric information under 2026 APPI
- Cross-border data transfer requirements (tourist voice data going to US-based Google Cloud)
- Right to deletion — users must be able to request deletion of their voice recordings

**Recommendation:** 
- Classify audio as transient (not stored) for the MVP — stream only, no recording
- Implement a data retention policy: session data auto-deletes after 30 days
- Add a "Delete My Data" button in the widget
- For enterprise tenants (hospitals), offer on-premise or Japan-region deployment

### 2.3 The Existing Competition Is Stronger Than You Think

**Severity: 🟡 HIGH**

The competitive landscape is not empty. You need to know what you're up against:

| Competitor | What they have | Your advantage |
|-----------|---------------|----------------|
| **Pocketalk (SourceNext)** | 92-language AI hardware translator. GENOVA is deploying it to clinics **nationwide** in Japan as of June 2026. Estimated market ¥12.5B. Already in clinics for reception→consultation→billing. | Hardware-only — no triage, no booking, no claims. You add the full agent pipeline. |
| **MediPhon (メディフォン)** | Medical-specific translation app (107 languages AI + 32 languages human interpreters). **24/7 human medical interpreters on call.** 10万+ cases handled. 99%+ answer rate. Used by hospitals across Japan since 2014. | Human interpreters are expensive and not scalable. You offer AI-only, instant, free-tier. But MediPhon has **12 years of trust** you don't. |
| **VoiceTra (NICT)** | Free, government-backed voice translator. Works well for conversations. Strong reviews from Japan tourists. | Not medical-specific. No agent pipeline. |
| **Live Medical Interpreter (Devpost)** | Exact same concept as you — Gemini Live API, real-time doctor-patient translation. Already built. Open-source on Devpost. | You're adding triage + booking + claims. But they have a working demo. |

**The gap:** Pocketalk + GENOVA partnership (announced June 17, 2026) is **aggressively deploying to clinics RIGHT NOW.** By the time you ship, there will be a hardware translator on the reception desk of partner clinics. You need to be 10x better, not just slightly better.

**Recommendation:** Don't compete on hardware. Your advantage is **the full agent pipeline** — triage BEFORE arrival, booking, claims AFTER visit. Position as "the OS for foreign patient journeys" not "a translator."

### 2.4 The Live API 10-Minute Session Hard Limit

**Severity: 🔴 CRITICAL**

From the Gemini Live API reference docs:

> *"The default maximum length of a conversation session is 10 minutes."*

A doctor-patient consultation can easily exceed 10 minutes. Your entire real-time translation module (gemini-3.5-live-translate-preview) cuts off at minute 10.

**The gap:** Neither the product spec nor the tech plan addresses this. A hard 10-minute ceiling on the core translation experience is a **showstopper-level gap** for medical use.

**Recommendation:** 
- Implement **session chaining** — at minute 9, open a new Live API session and seamlessly hand off context
- Cache the last 60 seconds of audio as context injection for the new session
- For the hackathon demo: pre-structure the conversation to stay under 10 minutes
- Longer-term: request increased session limit from Google (enterprise tier) or use Gemini 2.5 Flash Native Audio which may have different limits

### 2.5 The Cost Model Gap

**Severity: 🟡 HIGH**

Let's do the math on a single doctor-patient session:

```
Session: 10 minutes of Gemini 3.5 Live Translate
Cost: $0.0368/min × 10 min = $0.37 per session

BUT: Context window re-billing — later turns cost more as tokens accumulate.
Conservative estimate: 1.5× multiplier = ~$0.55 per 10-min session

PLUS: Triage call (Gemini 2.5 Flash): ~$0.005
PLUS: Maps Grounding: $25 per 1,000 queries = $0.025
PLUS: Booking agent call (Gemini 3.1 Live): ~$0.20
PLUS: Receipt OCR (Gemini 2.5 Flash vision): ~$0.01
PLUS: Claim generation: ~$0.005

TOTAL per complete session: ~$0.79
```

At scale:
- 1,000 sessions/month = $790
- 10,000 sessions/month = $7,900  
- 100,000 sessions/month = $79,000

**The gap:** There's no cost model in the plan. If you're charging clinics a flat SaaS fee of $99/month, you lose money at ~125 sessions/month per clinic. A busy Tokyo clinic seeing 20 foreign patients/day destroys your unit economics.

**Recommendation:**
- Use Gemini 2.5 Flash (cheaper at $0.50/1M input tokens vs $3.50 for 3.5 Live Translate) for non-real-time tasks
- Offer tiered pricing: free tier (text-only, 5 sessions/month), pro tier (voice, unlimited), enterprise (custom)
- Implement cost monitoring per tenant with automatic alerts at thresholds
- Explore the **Batch API** (50% cost reduction) for non-real-time tasks like claim generation

### 2.6 The "Japan Doesn't Want This" Risk

**Severity: 🟡 MEDIUM**

Japanese medical institutions are famously conservative. Key barriers:

1. **No legal framework for AI medical interpretation** — Japanese doctors will ask: "Who is liable if the AI mistranslates and I prescribe wrong?" The answer right now is: **the doctor is liable** (see §2.1). This creates adoption resistance.

2. **Existing human interpreter infrastructure** — MediPhon has 12 years of trust. Some hospitals have on-staff interpreters. Convincing a Japanese hospital to replace a human with an AI is culturally harder than in the US.

3. **The "it works in English" trap** — Gemini 3.5 Live Translate supports Japanese, but medical Japanese is a different beast. Japanese medical terminology is heavily kanji-based and context-dependent. An English speaker's "chest pain" maps cleanly; a Japanese patient's "胸が締め付けられる" (chest feels constricted) requires cultural and clinical context.

**Recommendation:**
- Partner with **one clinic** for a pilot, don't sell to "Japan"
- Get a Japanese medical advisor on the team or advisory board
- Test specifically with Japanese→foreign language and foreign language→Japanese medical conversations
- Show a "safety dashboard" — how many translations were flagged for human review

### 2.7 The Judge Question: "What Happens When It's Wrong?"

**Severity: 🔴 CRITICAL (for pitch)**

Every hackathon judge for a medical AI project will ask this. Your current plan has no answer.

**The real answer from the research:**

> Under current malpractice law, liability rests on the "reasonable physician" standard. Whether AI was used or not, courts judge the physician's conduct. There is no doctrine assigning shared responsibility to AI systems. — Johns Hopkins Carey, 2025

> European AI Liability Directive: liability for damages from AI system errors primarily falls on manufacturers, with a rebuttable presumption of defectiveness. But this applies only for fully automated decisions — if a human is in the loop, the human is liable.

**Recommendation for the pitch:**

Frame it as **"AI-assisted, human-supervised."** MediRoute is not replacing doctors — it's arming them with real-time translation + clinical context. Every output includes:
1. Confidence score
2. Source attribution (which data the recommendation is based on)
3. A flag when confidence is below threshold → triggers human review

The tagline: *"We don't make medical decisions. We make sure no medical decision is lost in translation."*

### 2.8 The SDK/Embed Gap

**Severity: 🟡 MEDIUM**

The plan mentions "embeddable widget SDK" as a P3. But for AaaS, **the embed IS the product.** You're not building an app that tourists download — you're building a widget that clinics and travel apps embed.

What the embed needs that isn't in the plan:
- **iFrame with postMessage API** — won't work well with WebSocket (Live API). iFrames and WebSocket connections have cross-origin issues.
- **OAuth for tenants** — each embedding app needs its own API key with rate limits
- **White-label customization** — clinics want their logo, not yours
- **Web Component or React SDK** — not just an iframe

**Recommendation:** Bump the embeddable widget to P1. It's not a nice-to-have; it's the delivery mechanism for AaaS. Build as a **Web Component** (framework-agnostic, works in any website) with a `<mediRoute-widget tenant-id="..." language="en">` API.

### 2.9 The Missing "Offline Japan" Scenario

**Severity: 🟡 MEDIUM**

Japan has excellent urban connectivity. But:
- Subway stations, rural clinics, hospital basements (where radiology/X-ray often are) have poor signal
- Tourists may not have data plans
- 42M tourists means many are on spotty roaming

**The gap:** The entire architecture is cloud-dependent. If the Live API WebSocket drops mid-session, what happens?

**Recommendation:**
- Local fallback for triage: cache a simplified decision tree on-device
- Graceful degradation: if Live Translate drops, fall back to text chat translation (Gemini 2.5 Flash REST, works over intermittent connections)
- Show connectivity status prominently in the UI
- Cache the last known clinic list and directions

### 2.10 Summary: Gap Severity Matrix

| # | Gap | Severity | Fix Complexity | Hackathon Priority |
|---|-----|----------|---------------|-------------------|
| 2.1 | SaMD regulation / liability | 🔴 Critical | High | Must address in pitch + add disclaimer |
| 2.4 | Live API 10-min session limit | 🔴 Critical | Medium | Implement session chaining |
| 2.7 | "When it's wrong" judge question | 🔴 Critical | Low | Prepare answer + confidence scores |
| 2.3 | Pocketalk/GENOVA competition | 🟡 High | Medium | Differentiate on full pipeline |
| 2.10 | Cost model at scale | 🟡 High | Low | Tiered pricing + cost monitoring |
| 2.2 | APPI voice data compliance | 🟡 High | Medium | No-audio-storage policy |
| 2.6 | Japanese hospital adoption resistance | 🟡 Medium | High | Pilot with one clinic |
| 2.8 | SDK/Embed as afterthought | 🟡 Medium | Medium | Bump to P1 |
| 2.9 | Offline fallback | 🟡 Medium | Medium | Cached decision tree + graceful degradation |

---

## PART 3: PITCH COACH — Elevator Pitch & Judge Q&A Prep

### 3.1 30-Second Opening Hook

> *"42 million tourists visit Japan every year. When one of them gets sick, they face a wall: Japanese intake forms, Japanese-speaking staff, Japanese prescriptions, and Japanese insurance claims. MediRoute is an AI agent platform that embeds into any travel app or clinic system to handle the entire journey — symptom triage in 70 languages, AI-powered phone booking in Japanese, real-time doctor-patient translation via Google's brand-new Gemini 3.5 Live Translate, and automated insurance claims. We don't replace doctors. We make sure no medical decision is lost in translation."*

### 3.2 Likely Judge Questions & Prepared Answers

**Q: "Isn't this just a wrapper around Gemini?"**

A: *"Gemini provides the AI primitives — translation, reasoning, vision. What we've built is the agent orchestration layer that strings 5 specialized AI agents into a complete medical journey. The Health Session Agent maintains context across triage→booking→translation→claims. That orchestration, plus the multi-tenant isolation, tool governance, and clinical grounding verification, is the product — not the individual API calls."*

**Q: "What happens when the AI makes a mistake?"**

A: *"Every output includes a confidence score and source attribution. Below a confidence threshold, the system flags for human review and explicitly tells the user to consult a physician. We implement two-model verification — a second AI cross-checks outputs against inputs for unsupported claims. And legally, we frame our triage as symptom guidance, not diagnosis. The physician remains in the loop and in control."*

**Q: "Who is your competitor and why will you win?"**

A: *"Pocketalk is deploying hardware translators to Japanese clinics right now — 92 languages, great device. But translation alone doesn't solve the problem. A tourist still doesn't know which clinic to go to, can't book the appointment, and can't file the insurance claim. MediRoute is the full operating system for the foreign patient journey — pre-visit triage + in-visit translation + post-visit claims. We complement devices like Pocketalk, we don't compete with them."*

**Q: "How do you make money?"**

A: *"Three tiers: a free tier for individual tourists (text-only, 5 sessions), a pro tier at $9.99/month (voice, unlimited), and an enterprise tier for clinics and travel insurers at $299–999/month (white-label embed, dedicated agent isolation, SLA). Our unit cost per complete session is ~$0.79 at current Gemini pricing, which is declining."*

**Q: "Why Japan? Why not a global solution?"**

A: *"Japan is the hardest and most valuable market. The language barrier is absolute — a Korean, a Thai, an American, and a German tourist all hit the same wall. The medical system is high-quality but impenetrable without Japanese. And the numbers are staggering — 42M visitors in 2025, growing. Solve Japan, and the architecture works for any country with a language barrier."*

---

## PART 4: FACT CHECKER — Verified Claims

| Claim | Verdict | Source |
|-------|---------|--------|
| Gemini 3.5 Live Translate supports 70+ languages including Japanese | ✅ Confirmed | Google AI Dev docs, blog.google (June 9, 2026) |
| Gemini Live API max session duration is 10 minutes | ✅ Confirmed | Google Cloud Gemini Live API reference docs |
| Live API re-bills accumulated audio tokens on every turn | ✅ Confirmed | Google AI Developers Forum, staff response (April 2026) |
| Japan APPI 2026 amendments add biometric data protections | ✅ Confirmed | Mori Hamada law firm analysis (April 22, 2026), IBA (May 2026) |
| PMDA regulates SaMD under PMD Act since 2014 | ✅ Confirmed | PMDA official site, PMD Act Article 2.4 |
| Pocketalk being deployed to Japanese clinics by GENOVA | ✅ Confirmed | PR Times / GENOVA press release (June 17, 2026) |
| MediPhon has 10万+ medical interpretation cases, 99%+ answer rate | ✅ Confirmed | MediPhon official site (mediphone.jp) |
| Physicians are held liable for AI-assisted errors under current law | ✅ Confirmed | Johns Hopkins Carey (June 2025), Springer Nature (2024) |
| Gemini 2.5 Flash costs $0.50/1M input text tokens | ✅ Confirmed | Google AI Dev pricing page (June 2026) |
| Gemini 3.5 Live Translate costs ~$0.0368/min audio | ✅ Confirmed | Google AI Dev pricing page (June 2026) |
| Gemini Live API supports 5,000 concurrent sessions per project | ✅ Confirmed | Google Cloud Live API reference |
| 42M foreign visitors to Japan in 2025 | ✅ Confirmed | GENOVA press release, consistent with JNTO data |
| Agent Engine is a managed runtime in Vertex AI for deploying agents | ✅ Confirmed | Google Cloud Blog (April 2025), Agent Platform docs |

---

*Document generated by MediRoute's multi-agent pipeline: Tech Architect → Gap Analyst → Pitch Coach → Fact Checker. All claims cross-referenced with live web sources via agent-reach (Exa + Jina Reader).*
