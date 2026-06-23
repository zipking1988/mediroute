# MediRoute — Hackathon Demo Spec

> **Decision:** 3 live modules + 5 mocked. 12-hour build. One emotional arc.
> **Date:** 2026-06-23 | **Hackathon:** Google/Gemini

---

## 1. The Demo Architecture Decision

We have 8 modules in the product spec. We can build **2-3 well** or 8 badly. Bad demo = wasted hackathon.

### What We Build (3 modules)

| # | Module | Why | Gemini API | Hours |
|---|--------|-----|------------|-------|
| 1 | **Triage Classifier** | Core magic — the "AI doctor" moment | Gemini 2.5 Flash + structured outputs | 2h |
| 2 | **Facility Matching** | Real-world utility, maps are visual | Google Maps Grounding | 1.5h |
| 5 | **Live Translation** | THE showstopper — Gemini 3.5 Live Translate is 2 weeks old | Gemini 3.5 Live Translate (WebSocket) | 3h |

These three form one complete emotional arc: **symptom → guidance → communication**.

### What We Mock (5 modules)

| Module | How We Fake It | Cost |
|--------|---------------|------|
| 3. Booking | Japanese script card + phone deep-link (no real call) | 0.5h |
| 4. Intake Forms | Pre-render one PDF. Show as static card. | 0.5h |
| 6. Drug Interactions | Hardcode 2 scenarios as warning banners | 0.5h |
| 7. OCR Claims | ONE pre-tested receipt photo → pre-extracted JSON | 0.5h |
| 8. Reminders | Mention in pitch. Don't demo. | 0h |
| Emergency Button | Static red button, always visible, shows cost info | 0.5h |

**Total build time: ~10 hours.** 2 hours buffer for bugs, polish, demo rehearsal.

---

## 2. The Demo Narrative (3 Minutes)

```
0:00  HOOK
     "42 million tourists visit Japan. 5,750 get sick every day.
      None speak Japanese. Most don't know ambulances are free.
      MediRoute closes the loop — from symptom to recovery."

0:15  TRIGGER: User types "I have severe stomach pain, I'm in Shinjuku"
      → Chat UI with text input, clean design

0:25  TRIAGE RESPONSE
      → "JTAS Severity 3 — Urgent. Route B: Visit a clinic today.
         Specialty: Gastroenterology."
      → Reasoning shown inline. Confidence badge.

0:35  COST TRANSPARENCY
      → Card slides in: "Clinic visit: ~¥5,000 ($35). Ambulance: FREE.
         Don't wait — seek care now."
      → Red 🚨 CALL 119 button pulsing subtly at bottom.

0:50  FACILITY MATCHING
      → Map expands. 3 real clinics from Google Maps.
      → Each shows: name, distance, hours, English support flag, rating.
      → Citations: "Source: Google Maps"

1:10  BOOKING (mocked)
      → Tap clinic → Japanese script card: "Show this at reception."
      → "📞 Call 03-XXXX-XXXX" button (phone deep-link)

1:25  INTAKE FORM (mocked)
      → Pre-rendered bilingual 問診票 card.
      → Japanese on left, English on right. Designed to hand to receptionist.

1:40  LIVE TRANSLATION (the showstopper)
      → "Now let me show you what happens at the doctor."
      → User speaks English → Japanese audio plays back (real-time WebSocket)
      → Doctor audio (pre-recorded Japanese) → English transcript streams in
      → "Gemini 3.5 Live Translate — announced June 9th. 70+ languages."

2:10  DRUG INTERACTION (mocked)
      → "I take Warfarin." Doctor prescribes Ciprofloxacin.
      → ⚠️ CRITICAL alert: "Increased bleeding risk. Ask: INR monitoring?"

2:25  OCR CLAIMS (mocked)
      → Photo of Japanese receipt uploaded.
      → Pre-extracted JSON → claim summary card.
      → "Download PDF" button.

2:50  CLOSE
      → Timeline summary: Symptom → Triage → Clinic → Translation → Claim
      → "One route. Your language. MediRoute."
```

---

## 3. Module 1: Triage Classifier (BUILD)

### What It Does
User types symptoms in any language → Gemini returns severity score (1-5), route (A/B/C/D), specialty, reasoning, and whether to call 119.

### Technical Implementation

**API:** Gemini 2.5 Flash via `@google/genai` SDK
**Endpoint:** `POST /api/mediroute/triage`
**Key technique:** Structured output with JSON schema

```typescript
// lib/triage-schema.ts — JSON Schema for Gemini structured output
export const triageResponseSchema = {
  type: "object",
  properties: {
    severity: { type: "number", enum: [1, 2, 3, 4, 5] },
    route: { type: "string", enum: ["A", "B", "C", "D"] },
    routeLabel: { type: "string" },
    specialty: { type: "string" },
    reasoning: { type: "string" },
    call119: { type: "boolean" },
    nextSteps: { type: "array", items: { type: "string" } },
    disclaimer: { type: "string" }
  },
  required: ["severity", "route", "routeLabel", "specialty", "reasoning", "call119"]
};
```

**System prompt** (embedded in API route, not configurable at runtime for demo safety):

```
You are a medical triage assistant for tourists in Japan. You use JTAS
(Japan Triage and Acuity Scale) principles adapted for consumer self-triage.

SEVERITY LEVELS:
- 1 (Immediate): Chest pain, severe breathing difficulty, severe bleeding,
  neck stiffness + fever, loss of consciousness → CALL 119 NOW
- 2 (Emergent): Severe abdominal pain, fever >39°C, head injury with vomiting,
  suspected fracture → Go to ER or call 119
- 3 (Urgent): Moderate fever, persistent vomiting, moderate pain not controlled
  by OTC → Visit clinic today (Route B)
- 4 (Semi-urgent): Mild fever, mild pain, rash → Visit clinic within 48h (Route C)
- 5 (Non-urgent): Minor cough, small cut, mild cold → Pharmacy or home care (Route D)

ROUTES:
- A: Call 119 (ambulance) — emergency department
- B: Visit clinic today — internal medicine / specialty clinic
- C: Visit clinic within 48h — general practitioner
- D: Pharmacy or self-care at home

CRITICAL RULES:
- Ambulances in Japan are 100% FREE for everyone including tourists.
  If severity is 1 or 2, ALWAYS recommend calling 119.
- Walk-in penalty at large hospitals (200+ beds): ¥7,000-¥11,000.
  For severity 3-4, guide toward clinics, not large hospitals.
- If the user mentions chest pain, difficulty breathing, or head injury,
  always assign severity 1 or 2.
- Always include a disclaimer.
- Respond in the user's language.
```

**API route structure:**

```typescript
// app/api/mediroute/triage/route.ts
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  const { message, sessionId, language } = await req.json();

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: message }] }],
    config: {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      responseMimeType: "application/json",
      responseSchema: triageResponseSchema,
      temperature: 0.3,  // Low temp for medical consistency
    },
  });

  const result = JSON.parse(response.text!);
  return Response.json(result);
}
```

### UI States

| State | What User Sees |
|-------|---------------|
| **Loading** | Skeleton pulse on chat bubble. "Analyzing symptoms..." |
| **Severity 1-2** | Red alert card. 🚨 CALL 119 button LARGE + pulsing. "Ambulance is FREE." |
| **Severity 3** | Amber card. "Visit a clinic today." Map of nearby clinics below. |
| **Severity 4-5** | Green card. "Not urgent — you can wait." Self-care tips. |
| **Error** | "Unable to assess. Please call 119 if this is an emergency." |

### Demo Script (30 seconds)
1. Open app → chat UI visible
2. Type: *"I have severe stomach pain, I'm in Shinjuku"*
3. Gemini responds in <2 seconds: *"Severity 3 — Urgent. Route B. Gastroenterology. Visit a clinic today. Nearby clinics loading..."*
4. Point to the reasoning text. Point to cost card.

---

## 4. Module 2: Facility Matching (BUILD)

### What It Does
After triage, Gemini queries Google Maps for real clinics matching the specialty, near the user's location, with language support and operating hours.

### Technical Implementation

**API:** Google Maps Grounding (built into Gemini 2.5 Flash — no separate API key)
**Endpoint:** Same `/api/mediroute/triage` route, or separate `/api/mediroute/facilities`
**Key technique:** Enable `googleSearch` tool in Gemini config

```typescript
// Enable Maps Grounding in the Gemini config
const response = await genai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  config: {
    systemInstruction: { parts: [{ text: FACILITY_SYSTEM_PROMPT }] },
    tools: [{ googleSearch: {} }],  // ← This enables Maps Grounding
    temperature: 0.3,
  },
});

// Gemini returns groundingChunks with maps data:
// groundingChunks[0].maps { uri, placeId, title }
// groundingSupports[] linking recommendation text to map citations
```

**System prompt addition:**

```
When recommending medical facilities, use Google Maps to find REAL clinics.
Return:
- Clinic name, address, phone number
- Distance from user (approximate)
- Operating hours (are they open NOW?)
- Languages supported (English, Chinese, Korean, etc.)
- Rating and review count
- Google Maps deep link
- Whether a referral is needed (large hospitals may charge walk-in fee)

Prioritize: specialty match > open now > language support > distance.

IMPORTANT: Always cite your sources. Each clinic recommendation must
reference the Google Maps data it came from.
```

### Fallback Data (if Maps Grounding fails)

Hardcoded Tokyo clinics in `lib/fallback-clinics.json`:

```json
[
  {
    "name": "Tokyo Station International Clinic",
    "specialty": "Internal Medicine, General Practice",
    "address": "1-9-1 Marunouchi, Chiyoda-ku, Tokyo",
    "phone": "03-5220-5500",
    "languages": ["English", "Chinese"],
    "hours": "Mon-Fri 9:00-17:00",
    "note": "700+ overseas patients/month"
  },
  {
    "name": "Tokyo Medical University Hospital",
    "specialty": "Emergency, All Specialties",
    "address": "6-7-1 Nishishinjuku, Shinjuku-ku, Tokyo",
    "phone": "03-3342-6111",
    "languages": ["English", "Chinese", "Korean"],
    "hours": "24/7 Emergency",
    "note": "Large hospital — walk-in fee may apply"
  },
  {
    "name": "Sanno Hospital",
    "specialty": "Internal Medicine, Surgery",
    "address": "8-10-16 Akasaka, Minato-ku, Tokyo",
    "phone": "03-3402-3151",
    "languages": ["English"],
    "hours": "Mon-Sat 9:00-12:00, 13:00-17:00",
    "note": "International patient services"
  }
]
```

### UI States

| State | What User Sees |
|-------|---------------|
| **Loading** | Map placeholder with skeleton cards |
| **Results** | 3-5 clinic cards. Each: name, distance, hours, languages, rating, "Open in Maps" |
| **After Hours** | "⚠️ These clinics are closed now. Here are 24h emergency options." |
| **No Results** | "No matching clinics found. Try expanding your search. Or call 119." |
| **Maps Error** | Fallback to hardcoded clinic list with clear "(cached data)" label |

### Demo Script (20 seconds)
1. After triage result, map section animates in
2. 3 real clinic cards appear from Google Maps
3. Point to a citation: *"Source: Google Maps — real-time data."*
4. Tap one → Japanese script card appears

---

## 5. Module 5: Live Translation (BUILD — THE SHOWSTOPPER)

### What It Does
User speaks in their language → Gemini streams back translated speech in Japanese. Doctor speaks Japanese → Gemini streams back English transcript. Real-time, bidirectional, WebSocket-based.

### Technical Implementation

**API:** Gemini 3.5 Live Translate Preview (`gemini-3.5-live-translate-preview`)
**Connection:** WebSocket at `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService/BidiGenerateContent`
**Key technique:** Bidirectional audio streaming via WebSocket

```typescript
// lib/live-translate.ts — WebSocket client for Gemini 3.5 Live Translate

const LIVE_TRANSLATE_WS =
  "wss://generativelanguage.googleapis.com/ws/" +
  "google.ai.generativelanguage.v1alpha.GenerativeService/" +
  "BidiGenerateContent?key=" + process.env.GEMINI_API_KEY;

interface TranslationSession {
  ws: WebSocket;
  sourceLanguage: string;   // e.g., "en"
  targetLanguage: string;   // e.g., "ja"
  onTranscript: (text: string, lang: string) => void;
  onAudio: (audioData: ArrayBuffer) => void;
}

function createTranslationSession(config: {
  sourceLanguage: string;
  targetLanguage: string;
  onTranscript: (text: string, lang: string) => void;
  onAudio: (audioData: ArrayBuffer) => void;
}): TranslationSession {
  const ws = new WebSocket(LIVE_TRANSLATE_WS);

  ws.onopen = () => {
    // Send setup config
    ws.send(JSON.stringify({
      setup: {
        model: "models/gemini-3.5-live-translate-preview",
        generationConfig: {
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" }  // Japanese voice
            }
          }
        }
      }
    }));
  };

  ws.onmessage = (event) => {
    // Gemini streams back: translated audio + transcript
    const data = JSON.parse(event.data);

    if (data.serverContent?.modelTurn?.parts) {
      for (const part of data.serverContent.modelTurn.parts) {
        if (part.text) {
          config.onTranscript(part.text, config.targetLanguage);
        }
        if (part.inlineData?.data) {
          // Base64-encoded audio
          const audioBytes = base64ToArrayBuffer(part.inlineData.data);
          config.onAudio(audioBytes);
        }
      }
    }
  };

  return {
    ws,
    sourceLanguage: config.sourceLanguage,
    targetLanguage: config.targetLanguage,
    onTranscript: config.onTranscript,
    onAudio: config.onAudio,
  };
}

// Send audio from microphone
function sendAudio(session: TranslationSession, audioChunk: ArrayBuffer) {
  session.ws.send(JSON.stringify({
    realtimeInput: {
      mediaChunks: [{
        mimeType: "audio/pcm;rate=16000",
        data: arrayBufferToBase64(audioChunk)
      }]
    }
  }));
}
```

### Client-Side Audio Capture

```typescript
// hooks/use-live-translate.ts
export function useLiveTranslate() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const session = useRef<TranslationSession | null>(null);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);

    session.current = createTranslationSession({
      sourceLanguage: "en",
      targetLanguage: "ja",
      onTranscript: (text, lang) => {
        setTranslatedText(prev => prev + text);
      },
      onAudio: (audioData) => {
        // Play translated speech through speakers
        playAudio(audioData);
      }
    });

    mediaRecorder.current.ondataavailable = (event) => {
      event.data.arrayBuffer().then(buf => {
        sendAudio(session.current!, buf);
      });
    };

    mediaRecorder.current.start(100); // 100ms chunks
    setIsListening(true);
  }

  function stop() {
    mediaRecorder.current?.stop();
    session.current?.ws.close();
    setIsListening(false);
  }

  return { isListening, transcript, translatedText, start, stop };
}
```

### Pre-Recorded Fallback (CRITICAL)

The Live Translate API is a **preview** (announced June 9, 2026 — 2 weeks ago). It may be flaky, rate-limited, or unavailable.

**Fallback strategy:**
1. Test WebSocket connection FIRST THING at the hackathon
2. Record a 30-second screen capture of it working
3. If the live demo fails: *"The Live Translate API is brand new — let me show you exactly what happened when I tested it earlier this morning."* → Play video
4. Have a text-only fallback: user types → Gemini 2.5 Flash translates text → TTS plays it. Less impressive but always works.

### UI States

| State | What User Sees |
|-------|---------------|
| **Ready** | "Tap to speak" button with language labels (English → Japanese) |
| **Listening** | Pulsing microphone icon. Waveform animation. |
| **Translating** | Streaming transcript appears in target language. Audio plays. |
| **Doctor Speaking** | Pre-recorded Japanese audio plays. English transcript streams in real-time. |
| **Error** | "Live translation unavailable. Use text translation instead." → fallback mode |

### Demo Script (30 seconds)
1. Tap microphone → *"I have a fever of 38.5 degrees and a headache for 2 days"*
2. Japanese audio plays back through speakers. Transcript appears in Japanese.
3. Play pre-recorded doctor response in Japanese
4. English translation streams in real-time: *"Have you taken any medication? When did the fever start?"*
5. *"Gemini 3.5 Live Translate. Announced June 9th. 70+ languages. Real-time."*

---

## 6. Mocked Modules (QUICK WINS)

### Module 3: Booking → Script Card (0.5h)
Instead of building a phone agent or browser automation:
- Gemini generates a polite Japanese conversation script
- Card shows: clinic phone number (from Maps) + "📞 Call" deep-link + Japanese script
- Script title: *"Show this at reception or read aloud"*
- Totally sufficient for a demo. Judges don't need to hear a phone call.

### Module 4: Intake Forms → Static Card (0.5h)
- Pre-generate ONE bilingual 問診票 (medical questionnaire) PDF
- Show as a two-column card: Japanese left, English right
- "Download PDF" button using `window.print()` or `html2pdf.js`
- Title: *"Your AI-prepared intake form — hand this to the receptionist"*

### Module 6: Drug Interactions → Hardcoded Banner (0.5h)
- Hardcode 2 scenarios as React components:
  1. **Warfarin + Ciprofloxacin:** ⚠️ CRITICAL — bleeding risk. Ask about INR monitoring.
  2. **Sudafed (pseudoephedrine):** 🚫 PROHIBITED in Japan. Do not bring.
- Trigger based on keyword matching in the chat (no AI needed for demo)
- Add disclaimer: *"AI-generated advisory. Always consult a pharmacist."*

### Module 7: OCR Claims → Pre-Extracted JSON (0.5h)
- Bring ONE well-lit, clear photo of a Japanese medical receipt
- Pre-process it through Gemini: extract all fields → save JSON
- In demo: user taps "Upload Receipt" → picks photo → app shows pre-extracted data instantly
- Show claim summary card: clinic, date, items, total → "Download PDF"
- **If you have extra time:** actually wire up the Gemini multimodal call. It's only ~20 lines of code. But have the pre-extracted fallback ready.

### Module 8: Reminders → Mention Only (0h)
- Don't build it. Don't demo it.
- Mention in closing: *"And for prescribed medications, MediRoute handles reminders and re-triage if symptoms worsen."*
- One sentence. Move on.

### Emergency Button → Static UI (0.5h)
- Big red 🚨 CALL 119 button fixed to bottom of EVERY screen
- Tapping it shows cost transparency card:
  - *"Ambulance in Japan: 100% FREE"*
  - *"Clinic visit: ~¥5,000 ($35)"*
  - *"Do NOT hesitate. Call 119."*
- Deep-link to phone dialer: `tel:119`
- This is the #1 life-saving feature. Make it impossible to miss.

---

## 7. Pre-Build Checklist (Before Hackathon Starts)

```
□ Gemini API key from aistudio.google.com/apikey
  - Enable billing for higher rate limits ($5-10 credit)
  - Test: curl the API, verify 200 response

□ Test Google Maps Grounding
  - Prompt: "Find internal medicine clinics in [hackathon city] open now"
  - Verify: returns real clinic names, addresses, hours, citations

□ Test Gemini 3.5 Live Translate WebSocket
  - Verify bidirectional English↔Japanese works
  - Record 30-second screen capture as fallback

□ Scaffold Next.js project
  npx create-next-app@latest mediroute --typescript --tailwind --app --src-dir
  cd mediroute
  npm install @google/genai
  npx shadcn@latest init
  npx shadcn@latest add button card input textarea badge dialog

□ Create .env.local
  GEMINI_API_KEY=...
  NEXT_PUBLIC_APP_NAME=MediRoute

□ Prepare demo assets
  - Clean photo of Japanese medical receipt → pre-extract JSON
  - Pre-recorded Live Translate fallback video (30 sec)
  - Know the hackathon venue address (for Maps Grounding demo)

□ First git commit
  git init && git add . && git commit -m "scaffold"
```

---

## 8. Build Order (Sequential — Don't Parallelize These)

```
HOUR 0-1:    Scaffold complete. shadcn/ui working. .env loaded.
             Test Gemini API key with one simple call.

HOUR 1-3:    MODULE 1 — Triage Classifier
             → API route + schema + chat UI + severity cards
             → TEST: "chest pain" returns severity 1, 🚨 button appears

HOUR 3-4.5:  MODULE 2 — Facility Matching
             → Maps Grounding enabled + clinic cards + fallback JSON
             → TEST: "stomach pain in Shinjuku" returns real clinics

HOUR 4.5-7.5: MODULE 5 — Live Translation
             → WebSocket client + audio capture + playback
             → TEST: speak English → hear Japanese, play pre-recorded response
             → FALLBACK: record video if WebSocket is flaky

HOUR 7.5-8:  Emergency button + cost cards (quick win, high impact)

HOUR 8-9:    Mocked modules (script card, intake form card, drug banners)
             → Quick UI components, no backend needed

HOUR 9-9.5:  OCR claims (pre-extracted JSON → claim summary card)

HOUR 9.5-10.5: Polish
             → Loading states, transitions, mobile responsive
             → Error handling for API failures
             → Test full flow end-to-end

HOUR 10.5-11.5: Demo rehearsal
             → Run the 3-minute demo 5+ times
             → Time each section
             → Prepare answers for obvious judge questions

HOUR 11.5-12: Deploy (Firebase Hosting or Vercel)
             → One-command deploy
             → Test on phone
```

---

## 9. Judge Q&A Prep

| Question | Answer |
|----------|--------|
| "Is this actually working or is it mocked?" | "Triage, facility matching, and live translation are all live Gemini API calls. Booking, intake forms, drug interactions, and OCR are mocked for this demo — but the API capabilities exist. Let me show you which APIs each would use." |
| "What's the biggest technical risk?" | "Gemini 3.5 Live Translate is a preview API — announced June 9th. We built a text-only fallback using Gemini 2.5 Flash in case the WebSocket is flaky. The core triage pipeline is rock solid." |
| "How do you handle medical liability?" | "Every screen carries a disclaimer. We're a guidance tool, not a diagnostic device. The emergency 119 button is always visible. We route to real doctors — we don't replace them." |
| "What happens offline?" | "The emergency button and Japan healthcare 101 card are cached locally. Triaging requires connectivity — but Wi-Fi is near-universal in urban Japan." |
| "Why not just use Google Translate?" | "Google Translate translates words. MediRoute translates the entire medical journey — triage, facility routing, intake forms, prescriptions, and insurance claims. We close the loop." |
| "Would this work outside Japan?" | "The architecture is country-agnostic. Swap JTAS for another triage system, Maps Grounding for local facilities, and the translation works in 70+ languages. The Japan-specific layer is the healthcare system knowledge." |

---

## 10. What We're NOT Doing (And Why)

| Thing We're Not Doing | Reason |
|----------------------|--------|
| Phone booking agent | Multi-week project. Script card is visually equivalent for judges. |
| Headless browser for clinic portals | High failure rate. Japanese web forms are notoriously complex. |
| Real drug interaction database (WHO/FDA/PMDA) | Integration alone is 4+ hours. Gemini's pre-training knowledge is sufficient for a demo with disclaimer. |
| Fine-tuning any model | Hackathon timeframe doesn't allow it. Structured outputs + system prompts achieve the same demo effect. |
| Firebase/Firestore | Adds complexity. Demo can run entirely client-side + API routes. localStorage for session persistence. |
| PWA/offline mode | Nice-to-have, not demo-critical. The 119 button is cached; that's enough. |
| Multi-language UI | Build English-only. Translation module proves multi-language capability. |
| Real user auth | No login wall. Judges shouldn't have to sign up to see your demo. |

---

## 11. Success Metrics for This Demo

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Triage latency | < 2 seconds | Time from send to first response text |
| Maps results | Real clinics with citations | Grounding supports visible in response |
| Translation latency | < 3 seconds end-to-end | Speak → hear Japanese audio |
| Demo flow | Under 3 minutes | Rehearse with timer |
| No errors | 0 visible errors | Test full flow 5+ times |
| Mobile responsive | Works on phone | Deploy and test on actual phone |

---

*This spec freezes decisions. No new modules. No scope creep. Build what's here, mock the rest, rehearse the demo, ship it.*
