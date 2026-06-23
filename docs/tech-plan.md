I'll research the current state of the project and available Google/Gemini APIs to build a solid tech stack recommendation.Now I have complete context. Let me research the latest Gemini API capabilities to ensure my recommendations are current.Now I have a complete picture. Let me produce the final comprehensive tech architecture plan.

---

# MEDIROUTE — DEFINITIVE TECH STACK & IMPLEMENTATION PLAN

**Date:** 2026-06-22 | **Hackathon:** Google/Gemini | **Build Window:** 24-48 hours

---

## Recommended Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | **Next.js 15 (App Router) + Tailwind CSS + shadcn/ui** | Fastest path to polished web app. SSR for performance, API routes proxy Gemini calls (protects API key), PWA-capable. shadcn/ui gives gorgeous pre-built chat, card, and form components. |
| **AI Orchestrator** | **Gemini 2.5 Flash** via `@google/genai` SDK | Best price-performance ($0.15/1M input tokens). Sub-second latency for triage reasoning. 1M token context keeps entire health session in memory. Built-in function calling + JSON structured output. **This IS the Health Session Agent.** |
| **Real-Time Voice Translation** | **Gemini 3.5 Live Translate Preview** | Brand new speech-to-speech translation model. 70+ languages. Under 1s latency. **This is your hackathon showstopper** — most teams don't know this exists. |
| **Voice Agent (Bidirectional)** | **Gemini 3.1 Flash Live Preview** | Native audio-in/audio-out via WebSocket. VAD (Voice Activity Detection) built in. Japanese language supported. For doctor-patient conversation mode. |
| **Clinic Data** | **Google Maps Grounding** (built into Gemini) | **NO external API needed.** Gemini natively queries Google Maps for clinics, hospitals, operating hours, distances. Returns citations. Handles "near me" queries with GPS. **Replaces JNTO NAVII API entirely.** |
| **Document OCR** | **Gemini 2.5 Flash (multimodal)** via `@google/genai` | Send receipt/PDF image directly to Gemini. Native image understanding. No separate OCR model. No fine-tuning. Works with Japanese text out of the box. |
| **Backend** | **Next.js API Routes** (`app/api/mediroute/route.ts`) | One file handles all Gemini orchestration. No Cloud Functions needed for hackathon. API key stays server-side. |
| **Database** | **Firestore** (cloud) + **localStorage** (offline fallback) | Firestore for session persistence across device refreshes. Security Rules handle user data scoping. |
| **Auth** | **Firebase Authentication** (Anonymous mode) | Zero-setup auth. User starts app → anonymous session created → persists in Firestore. No login wall for the demo. |
| **Deployment** | **Firebase Hosting** | Free tier. One-command deploy. Same GCP ecosystem. |
| **State Management** | **React Context + useReducer** | Single `HealthSessionContext` holds the session state + Gemini response history. |
| **Offline** | **localStorage** | Session data cached locally. Critical info (119 button, Japan 101 guide) available without internet. |

---

## Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Next.js 15 PWA)                           │
│                                                                             │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────────────────┐   │
│  │ Chat UI      │  │ 🚨 CALL 119 BTN  │  │ Google Maps Embed         │   │
│  │ (shadcn/ui)  │  │ (ALWAYS VISIBLE) │  │ (Clinic map + directions) │   │
│  └──────┬───────┘  └──────────────────┘  └────────────────────────────┘   │
│         │                      │                      │                    │
│         └──────────┬───────────┴──────────┬────────────┘                   │
│                    │                      │                                │
│         ┌──────────▼────────┐  ┌─────────▼───────────┐                   │
│         │ Next.js API Route │  │ Live Translate       │                   │
│         │ /api/mediroute    │  │ WebSocket Client     │                   │
│         │ (proxies to       │  │ (Gemini 3.5 Live     │                   │
│         │  Gemini REST API) │  │  Translate Preview)  │                   │
│         └──────────┬────────┘  └──────────────────────┘                   │
│                    │                                                       │
└────────────────────┼───────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     GEMINI API (Google AI Studio)                         │
│                                                                             │
│  ┌────────────────────────┐  ┌─────────────────────┐  ┌────────────────┐  │
│  │ Gemini 2.5 Flash       │  │ Gemini 3.1 Flash    │  │ Gemini 3.5     │  │
│  │ (Text + Function       │  │ Live Preview        │  │ Live Translate │  │
│  │  Calling + Structured  │  │ (Voice Agent:       │  │ (Real-time     │  │
│  │  Output + Vision)      │  │  bidirectional ASR) │  │  Speech2Speech)│  │
│  └───────────┬────────────┘  └──────────┬──────────┘  └───────┬────────┘  │
│              │                          │                      │           │
│              └──────────────────────────┼──────────────────────┘           │
│                                         │                                  │
│                            ┌────────────▼────────────┐                    │
│                            │ Google Maps Grounding   │                    │
│                            │ (Built-in Gemini Tool)  │                    │
│                            │ → clinics, hours,       │                    │
│                            │   ratings, phone numbers │                    │
│                            └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FIREBASE                                           │
│  ┌──────────────────────┐  ┌───────────────────┐  ┌────────────────────┐  │
│  │ Firestore            │  │ Firebase Auth     │  │ Firebase Hosting   │  │
│  │ (sessions/{uid} →    │  │ (Anonymous →      │  │ (mediroute.web.app) │  │
│  │   {symptoms, triage, │  │  persists across  │  │                    │  │
│  │    bookings, claim})  │  │  browser sessions) │  │                    │  │
│  └──────────────────────┘  └───────────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow (Single Chat Turn)

```
1. User types: "I have chest pain"
2. Next.js sends POST to /api/mediroute with { message, sessionId, language }
3. API route loads session from Firestore (or creates new)
4. API route calls Gemini 2.5 Flash with:
   - System prompt (triage criteria + function declarations + session history)
   - Conversation history (1M token context fits entire session)
   - New user message
5. Gemini decides to call function `triageAssessment(symptoms)`
   → Returns { severity: 1, route: "A", action: "CALL 119 NOW" }
6. Gemini also calls `searchFacilities("emergency", userLocation)` via Maps Grounding
   → Returns real clinic data with citations
7. Gemini returns combined response + function results as structured output
8. API route saves updated session to Firestore
9. API route streams response back to client via SSE (Server-Sent Events)
10. UI renders: chat bubble + 🚨 CALL 119 button (pulsing red) + map of hospitals
```

---

## Module Implementation Plan

### Module 0: Health Session Agent (Central Orchestrator)
- **Gemini API**: **Gemini 2.5 Flash** with **function calling** + **structured output** + **1M context window**
- **Build vs. Mock**: **BUILD** — This is the core. Single file `lib/mediroute-agent.ts`:
  - Define TypeScript interface: `HealthSession { symptoms, triageResult, selectedFacility, intakeForm, prescription, receipt, claimStatus }`
  - Define 5 function declarations: `triageAssessment`, `searchFacilities` (uses Maps Grounding), `generateIntakeForm`, `checkDrugInteractions`, `readReceipt`
  - System prompt includes: hardcoded JTAS-style triage protocol, disclaimer text, instruction to ALWAYS surface the 119 call button for severity 1-2
- **Why Gemini 2.5 Flash**: Sub-second latency is critical for real-time feel. 1M context keeps entire health session in memory — user can refresh the page and resume. Function calling makes it agentic (not just a chatbot).
- **Demo Script**: Start session. Show the agent asking clarifying questions. Each response shows which function was called. Refresh the page — session persists. *"This is the brain of MediRoute — one model that orchestrates triage, clinic search, translation, and claims."*
- **Estimated hours**: 4h (most critical — get this right first)

### Module 1: Triage NLP Classifier
- **Gemini API**: **Gemini 2.5 Flash** — **zero fine-tuning needed.** Use structured output mode (JSON schema) for deterministic severity responses.
- **Build vs. Mock**: **BUILD** — Define JSON schema:
  ```typescript
  const triageSchema = {
    severity: { type: "number", enum: [1,2,3,4,5] },
    route: { type: "string", enum: ["A","B","C","D"] },
    specialty: { type: "string" },
    reasoning: { type: "string" },
    call119: { type: "boolean" }
  };
  ```
  Hardcode decision boundaries in the system prompt based on JTAS principles:
  - **Severity 1** (Immediate): Chest pain, difficulty breathing, severe bleeding, neck stiffness + fever → Route A: CALL 119 NOW
  - **Severity 2** (Emergent): Severe abdominal pain, high fever >39°C, head injury with vomiting → Route A/B: Call 119 or go to ER
  - **Severity 3** (Urgent): Moderate fever, persistent vomiting, moderate pain → Route B: Clinic today
  - **Severity 4** (Semi-urgent): Mild fever, mild pain, rash → Route C: Clinic within 48h
  - **Severity 5** (Non-urgent): Minor cough, minor cut → Route D: Pharmacy/home care
- **Demo Script**: Type *"I have chest pain and shortness of breath"* → Gemini instantly returns severity 1 + 🚨 CALL 119 NOW button appears with pulsing animation. Judges see **<2 second response time**.
- **Estimated hours**: 1h

### Module 2: Facility Matching Engine
- **Gemini API**: **Google Maps Grounding** (built-in Gemini tool — enable `googleSearch: true`)
- **Build vs. Mock**: **BUILD** — When Gemini needs clinic recommendations, it automatically queries Google Maps. No separate API key. No JNTO NAVII. Results come back as structured citations with: name, address, phone, hours, distance, rating, Google Maps URL.
- **Implementation**: Add to system prompt: *"When the user needs a clinic, use Google Maps to find facilities matching their medical need, location, and language requirements. Return real-time operating hours and distances."*
- **Why this wins**: Every other hackathon team will be trying to integrate a third-party API that doesn't exist or has rate limits. You're using Gemini's native grounding — zero integration work, and it returns REAL data with citations judges can verify.
- **Demo Script**: After triage result (e.g., "Route B: Internal Medicine"), the app shows a map section with 3-5 real clinic cards from Google Maps. Each card has "Open in Google Maps" button. Citations: *"Source: Google Maps"*. **Pro tip:** Use the hackathon venue's address — the map will show clinics near the judges' physical location.
- **Estimated hours**: 1h

### Module 3: Booking Agent
- **Gemini API**: **Gemini 2.5 Flash** (generates Japanese booking script text)
- **Build vs. Mock**: **MOCK** — **CRITICAL CUT.** Do NOT build phone booking, headless browser, or telehealth API. These are multi-week projects that will fail. Replace with:
  - When user selects a clinic, Gemini generates a polite Japanese booking script tailored to their symptoms
  - App shows: clinic phone number (from Google Maps) + "📞 Call" button (deep link to phone dialer) + Japanese script card
  - The script card says: *"Show this to the receptionist or read it aloud:"*
  - Fallback: "📱 Tap to call" opens the phone dialer with pre-filled number
- **Why cut**: The spec's "LLM-powered Japanese voice agent" and "headless browser" are **the #1 most likely things to fail** in a hackathon. Judges won't see the difference between a real phone call and a perfectly crafted script card. But they WILL see a broken phone call.
- **Demo Script**: Tap a clinic → app shows "📞 Call 03-XXXX-XXXX" + Japanese script card. *"Your AI wrote this in perfect Japanese — read it to the receptionist."*
- **Estimated hours**: 1h (just UI + script generation)

### Module 4: Intake Form Generator
- **Gemini API**: **Gemini 2.5 Flash** (generates structured form JSON)
- **Build vs. Mock**: **BUILD** — Gemini generates a structured JSON object representing a Japanese 問診票 (medical inquiry form). Bilingual fields.
- **Implementation**: 
  - `generateIntakeForm(symptoms, userProfile)` function declaration
  - Gemini returns JSON with fields in both Japanese and user's language
  - Client renders as a two-column card (Japanese left, English right)
  - "Download PDF" button using `html2pdf.js` (or `window.print()`)
- **UX detail**: Make the Japanese text LARGE (18px+) and the card full-screen landscape — designed to be propped up on a clinic counter for a receptionist to read.
- **Demo Script**: *"Before you see the doctor, MediRoute generates your intake form. The Japanese version is for the doctor. The English version is for you. Show this at the reception counter."*
- **Estimated hours**: 2h

### Module 5: Real-Time Bidirectional Translation
- **Gemini API**: **Gemini 3.5 Live Translate Preview** (WebSocket-based Live API)
- **Build vs. Mock**: **BUILD** — **This is your hackathon showstopper.** Google's Live Translate API is brand new (preview) and does speech-to-speech in 70+ languages with <1s latency. Most teams won't know it exists. You'll stand out.
- **Implementation**:
  ```typescript
  // WebSocket connection to Gemini Live API
  const ws = new WebSocket("wss://generativelanguage.googleapis.com/ws/...");
  // Send audio chunks from microphone
  // Receive translated audio + transcript
  // Play audio through speakers
  // Display transcript in chat
  ```
  For demo: user speaks in English → Gemini streams back Japanese audio + transcript. Doctor speaks Japanese (pre-recorded) → Gemini streams back English translation.
- **Fallback**: **Gemini 3.1 Flash Live Preview** (voice agent with bidirectional ASR) if Live Translate Preview is unavailable. Or text-only translation via Gemini 2.5 Flash.
- **Demo Script**: *"This is MediRoute's most powerful feature."* Speak into mic: *"I have a fever of 38.5 degrees and a headache for 2 days."* App plays back fluent Japanese. Then play a pre-recorded Japanese doctor response and show the English translation appearing in real-time.
- **⚠️ Risk mitigation**: Pre-record a 30-second video of this working. If the Live API is flaky (it's a preview), play the video with: *"Let me show you exactly what happened when I tested this earlier."*
- **Estimated hours**: 3h (WebSocket handling, audio capture, playback — highest risk, start early)

### Module 6: Drug Interaction Engine
- **Gemini API**: **Gemini 2.5 Flash** with knowledge grounding (no external database)
- **Build vs. Mock**: **HYBRID** — DO NOT integrate real drug databases (WHO, PMDA, FDA). Instead:
  - Gemini's training data includes known drug interactions from its pre-training corpus
  - Use structured output to force consistent JSON response format
  - Constrain output to: `{ interactions: [{ drug1, drug2, severity, description, suggestedQuestion }] }`
  - Add prominent disclaimer: *"This is an AI-generated assessment based on publicly available medical knowledge. Always consult a pharmacist or doctor."*
  - Pre-test 5 common interaction scenarios (Warfarin + NSAIDs, MAOIs + SSRIs, etc.)
- **Demo Script**: User enters *"I take Metformin and Warfarin."* Doctor prescribes *"Ciprofloxacin."* Show: *"⚠️ CRITICAL: Ciprofloxacin + Warfarin increases bleeding risk. Ask your doctor: 'Should I have my INR monitored?'"*
- **Estimated hours**: 1.5h

### Module 7: OCR + Claim Generator
- **Gemini API**: **Gemini 2.5 Flash** (multimodal — send receipt image directly)
- **Build vs. Mock**: **BUILD** — Another Gemini superpower demo moment. No separate OCR model. No fine-tuning. Just send the image to Gemini and ask it to extract fields.
- **Implementation**:
  - User taps "Upload receipt" → camera/file picker opens
  - Image sent to Gemini via `client.models.generateContent()` with multimodal system prompt: *"Extract the following fields from this Japanese medical receipt: clinic name, date, items with codes, amounts, total"*
  - Gemini returns structured JSON
  - Client renders a claim summary card in user's language
  - "Download PDF" button generates a filled Japanese insurance claim form
- **Demo Tip**: Bring a clean, well-lit photo of a Japanese medical receipt. Test it beforehand. A crumpled/faded receipt will fail. **Have a backup image on your phone.**
- **Demo Script**: *"After your visit, take a photo of your receipt. MediRoute reads it — even in Japanese — and generates your insurance claim. Just download the PDF."*
- **Estimated hours**: 2h

### Module 8: Medication Reminder Scheduler
- **Gemini API**: None — pure client-side
- **Build vs. Mock**: **BUILD** — Simple local implementation:
  - User enters prescription details (medication name, dosage, frequency, duration)
  - Stores in localStorage
  - Uses `Notification API` + `setInterval` for reminders
  - Simple state machine: Dosed ✅ / Missed ⏰ / Escalated ⚠️
  - If "Missed" marked 2x in a row → suggest re-triage
- **Demo Script**: *"Set a reminder for your antibiotic."* Show browser notification popping up. Mark "Taken" → green check. Mark "Missed" → *"Are you feeling worse? Yes → re-trigger triage."*
- **Estimated hours**: 1h

### Module 9 (BONUS): Emergency + Cost Education
- **Gemini API**: None — static UI
- **Build vs. Mock**: **BUILD** (highest impact per hour)
- **Implementation**:
  - Big red "🚨 CALL 119" button fixed to the bottom of every screen
  - Cost transparency card shown after every triage:
    - Ambulance: **FREE** (emphasize this)
    - Clinic visit: **¥5,000–¥15,000 (~$35–$105)**
    - ER (labs + CT + meds): **¥36,000–¥59,000 (~$250–$410)**
    - *"You pay upfront, insurance reimburses you."*
  - Medical disclaimer on every screen
- **Demo Script**: At any point, point to the red button. *"This is the most important feature. Most tourists don't know 119 is free in Japan. We make it impossible to miss."*
- **Estimated hours**: 0.5h

---

## What to Pre-Build Before the Hackathon

### 2-3 Hours Before (or the night before)

1. **Get Gemini API key** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Create API key → save as `GEMINI_API_KEY`
   - Enable billing ($5-10 credit gives much higher rate limits — critical for live demo)

2. **Test Google Maps Grounding** with a single prompt:
   ```
   "Find internal medicine clinics in Shibuya, Tokyo that are open now"
   ```
   Verify it returns real clinic names, addresses, hours, ratings, and phone numbers WITH CITATIONS.

3. **Test Gemini 3.5 Live Translate Preview** — Verify bidirectional English↔Japanese works.

4. **Scaffold the Next.js project:**
   ```bash
   npx create-next-app@latest mediroute --typescript --tailwind --app --src-dir
   cd mediroute
   npm install @google/genai firebase firebase-admin
   npx shadcn@latest init
   npx shadcn@latest add button card input select badge textarea dialog
   ```

5. **Set up Firebase project:**
   - [console.firebase.google.com](https://console.firebase.google.com/) → New project
   - Enable: Firestore (test mode), Authentication (Anonymous), Hosting
   - Create `.env.local` with all keys

6. **Prepare demo assets:**
   - Clean photo of a Japanese medical receipt (for OCR demo)
   - Pre-record 30-second clip of Live Translate working (fallback)
   - Pre-test 5 drug interaction scenarios (so you know Gemini handles them)
   - Know the hackathon venue address (for clinic search demo)

7. **Set up Git** — First commit with scaffolded project.

---

## Minimum Viable Demo Flow

**Total time: 2:30 — THE ONLY JOURNEY THAT MATTERS**

| Time | What Happens | On Screen | Tech Behind It |
|------|-------------|-----------|---------------|
| 0:00 | **Hook** — *"42M tourists, none speak Japanese, ambulances are free, nobody knows this"* | 📱 Phone screen with app | — |
| 0:15 | **Symptom input** — *"I have chest pain and shortness of breath"* | Chat UI, text input | Gemini 2.5 Flash API call |
| 0:25 | **Triage response** — *"Severity 1 — CALL 119 NOW"* + reasoning | Chat bubble + 🚨 pulsing red button | Function calling → `triageAssessment()` |
| 0:40 | **Cost card** — *"Ambulance is FREE. Don't hesitate."* | Info card slides in | Static UI (but judge-impactful) |
| 0:50 | **Real clinic search** — *"Find emergency hospitals near me"* | Map with 3 real clinics from Google Maps | Google Maps Grounding (citations!) |
| 1:05 | **Japanese script** — *"Show this to the receptionist"* | Script card in Japanese + call button | Gemini generates script text |
| 1:20 | **Intake form** — *"Your AI-prepared 問診票"* | Two-column bilingual form | `generateIntakeForm()` function |
| 1:40 | **Live Translation** — *"Speak → Japanese → Doctor speaks → English"* | Voice recording + playback | Gemini 3.5 Live Translate Preview |
| 2:00 | **Drug interaction** — *"You take Warfarin + Ciprofloxacin? ⚠️"* | Alert card with severity + question | `checkDrugInteractions()` struct. output |
| 2:15 | **Receipt OCR** — *"Snap a photo → claim generated"* | Camera capture → structured JSON | Gemini multimodal vision |
| 2:25 | **Close** — *"From symptom to claim. One route. Your language."* | Summary timeline | — |

---

## Gemini Capabilities to Showcase (Rank for Judges)

| # | Capability | Where in Demo | Why Judges Care |
|---|-----------|--------------|-----------------|
| **1** | **Google Maps Grounding** | Clinic search with real, citable results | *"Wait, this is finding REAL clinics near us?"* — instant credibility |
| **2** | **Live Translation (Gemini 3.5)** | Doctor-patient voice translation | Brand new API, most teams don't know it exists — instant differentiation |
| **3** | **Function Calling** | Triage agent deciding which tool to use | Shows agentic behavior (not just a fancy chatbot) |
| **4** | **Structured Output (JSON)** | Drug interactions, intake form | Shows production reliability — deterministic, parseable output |
| **5** | **Multimodal Vision** | Receipt OCR from a photo | *"It read a Japanese receipt from a photo?"* — powerful demo |
| **6** | **Long Context (1M tokens)** | Session persists across page refresh | Shows engineering quality — not just a one-shot demo |
| **7** | **Sub-second latency** | Triage response in <2 seconds | Shows practical usability — real-time feel |
| **8** | **Multilingual** | Switch between English/Korean/Thai/German | Shows scale-to-any-market architecture |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Live API WebSocket flaky during demo** | Medium | **CRITICAL** — breaks translation demo | Pre-record 30s video of Live Translation working. Show live first, fallback to video. Say: *"Let me show you exactly what this looked like when I tested it."* |
| **Google Maps Grounding returns no clinics** | Low | High — clinic finder empty | Hardcode 5 Tokyo/Shinjuku clinics as JSON fallback. *"If Google Maps is unavailable, we show our verified partner clinics."* |
| **Gemini API rate limited** | Medium | **CRITICAL** — all features break | Use context caching. Have "demo mode" with pre-recorded responses for fallback. Test rate limits beforehand with your API key. |
| **API key leaked in client bundle** | High | **CRITICAL** — key revoked | **NEVER put API key in client.** Always use Next.js API routes (`app/api/mediroute/route.ts`) as proxy. |
| **Demo venue has no internet** | Medium | **CRITICAL** — no API works | Pre-record full demo as 2:30 video file on laptop. Have phone hotspot ready. 119 button works offline (static UI). |
| **Japanese receipt too complex for Gemini** | Medium | Medium — OCR fails live | Test with your receipt photo beforehand. Bring a pristine photo backup. Have manual-edit fallback UI. |
| **Judge asks "what about liability?"** | High | Medium — undermines trust | Rehearse: *"Every screen has a medical disclaimer. We over-triage (not under-triage). We route to real doctors. We never replace clinical judgment."* |
| **Team runs out of time** | High | **CRITICAL** — incomplete demo | **STRICT PRIORITY: Core chat + triage + clinic search + 119 button are MUST HAVE. Translation + OCR are NICE TO HAVE. Phone booking + headless browser are WON'T DO.** |

---

## Build Order (By Priority)

### Phase 1: Must-Have (First 12 Hours)
1. Next.js scaffold + shadcn/ui + Firebase setup (1h)
2. **Module 0: Health Session Agent** — Single orchestrator file (4h)
3. **Module 1: Triage** — System prompt + structured output (1h)
4. **Module 2: Facility Matching** — Google Maps Grounding (1h)
5. **Module 9: 119 Button + Cost Card** — Static UI (0.5h)
6. **Demo Mode** — Pre-recorded responses as fallback (1h)

**After Phase 1: You have a working demo that shows triage → call 119 → clinic search. Judges will be impressed.**

### Phase 2: Nice-to-Have (Next 8 Hours)
7. **Module 4: Intake Form Generator** — Bilingual form (2h)
8. **Module 6: Drug Interaction Engine** — Structured output (1.5h)
9. **Module 8: Medication Reminder** — Notifications (1h)
10. **Booking script generation** — Simple text output (1h)

### Phase 3: Showstopper (Last 4 Hours)
11. **Module 5: Live Translation** — Gemini 3.5 Live Translate (3h)
12. **Module 7: Receipt OCR** — Multimodal vision (1h)

---

## One-Line Summary for Judges

> **"MediRoute: a Gemini-powered medical concierge that routes a tourist from 'my chest hurts' to 'I'm treated and my claim is filed' — using Google Maps for real clinic data, Live Translation for real-time voice, and multimodal AI for forms and receipts — all in their language, with one model that never loses context."**