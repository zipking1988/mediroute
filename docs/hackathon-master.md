# MediRoute — Hackathon Master Document

> **All claims fact-checked & verified:** 2026-06-23 via agent-reach (Exa + Jina Reader)
> **Sources:** MHLW, Nikkei Asia, Japan Times, Asahi Shimbun, JNTO, Google AI docs, BMJ Emergency Medicine Journal, Japan Tourism Agency
> **Math corrected. Unverifiable anecdotes removed. All caveats noted.**

---

## 1. The Problem

### 42M visitors. 5,750 medical incidents daily. Zero guidance.

Japan receives 42+ million foreign visitors annually. Statistically, ~5% (~1 in 20) will fall ill or be injured — that's **5,750 medical incidents every day** among a population that can't speak Japanese, doesn't understand Japan's clinic-first medical system, and is terrified of ambulance costs they assume are American-sized.

### The "Panic Spiral"

When a tourist gets sick in Japan, they face a compounding cascade of failures:

| Step | What Happens | Verified |
|---|---|---|
| Fear | Assume ambulance costs thousands (US reality: $600–$2,100). Japan's ambulance is **100% free** | ✅ MHLW / FDMA |
| Delay | "Tough it out" in a hotel room, unaware a clinic visit is only ~$35–$105 | ✅ LO-PAL / JTA survey |
| Wrong choice | Go to a large hospital by taxi → charged **¥7,000–¥11,000 (~$45–70)** "walk-in penalty" without a referral | ✅ MHLW official documents |
| Refusal | Turned away from multiple hospitals — language barrier is the #1 reason | ✅ Japan Cultural Journal / Asahi Shimbun |
| Confusion | Even if they call 119, can't describe their location (Japan uses block-based addresses, not street names) | ✅ Wikipedia / Japan Handbook |
| Arrest risk | Bring common OTC medications like Sudafed → prohibited in Japan as "Stimulant Raw Material." Adderall = immediate arrest | ✅ MHLW Q&A / Narcotics Control Dept |
| Unpaid debt | Leave with unpaid bill → **visa denial on re-entry** (threshold: ¥10,000 as of April 2026) | ✅ Nikkei Asia / Asahi Shimbun |

### User Personas (Verified)

**Alex — Risk-Averse American Tourist**
Solo traveler, Software Engineer, San Francisco. 14-day Tokyo/Kyoto trip. Takes Sudafed (prohibited in Japan — pseudoephedrine >10%). Terrified of being arrested at customs. Assumes ambulance = thousands of dollars.

**Sarah — Stressed Parent**
Marketing Manager, Auckland. Traveling with 3-year-old. Child develops fever at 2AM Sunday. Clinics closed. Doesn't know if she should go to a hospital (and get charged ¥7,700+ for walking in). Hotel staff don't speak medical Japanese.

### Real Traveler Quotes (Reddit — illustrative, not independently verified)

> *"Woke up at 2am crying... we thought about calling an ambulance, but were worried about costs... we believed hospitals were closed so we waited until 1pm Sunday."*

> *"My Japanese friend helped me call 3 other hospital emergency departments... all of which said they couldn't get a specialist in... after a few hours I gave up."*

> *"I'm considering canceling my trip altogether because I don't know if the risk is worth it bringing Citalopram and Bupropion."*

### The Problem Statement (User's Words)

> *"If I get sick in Japan, I have no idea if I should go to a tiny clinic or a giant hospital, and I'm terrified that if I call an ambulance, I'll be stuck with a massive bill I can't pay. Even if I find a doctor, I can't precisely explain my symptoms or understand the Japanese prescription, so I'd rather wait in pain at my hotel than risk being turned away or arrested."*

---

## 2. The Solution

MediRoute is an AI medical companion that closes the entire loop — from first symptom to insurance reimbursement — in the user's native language.

### One-Liner

> *"We uniquely provide an end-to-end, multimodal medical session — orchestrating AI triage, real-time Google Maps facility matching, bidirectional voice translation, and OCR-automated insurance claims — to close the entire loop from first symptom to final reimbursement in the user's native language."*

### Core Flow

```
User describes symptoms (voice/text in any language)
    ↓
JTAS Triage → Severity Score (1–5) → Route A/B/C/D
    ↓
Google Maps Grounding → Real-time facility matching (specialty + hours + language + GPS)
    ↓
Gemini 3.5 Live Translate → Bidirectional doctor-patient conversation
    ↓
OCR → Japanese receipt → Structured JSON → Insurance claim form
```

### Why It's Different

| Existing Solution | Limitation | MediRoute |
|---|---|---|
| JNTO Official Guide | Static facility list; warns users to verify hours themselves | Real-time Google Maps Grounding with operating hours |
| Google Translate / VoiceTra | Translation only — no medical triage, no facility routing | JTAS clinical triage + facility matching + translation |
| Travel Insurance (Allianz/Sompo) | Pay-and-claim; insured pays upfront; phone support hard to reach | Automated OCR claims from Japanese receipts |
| International Clinics | Tokyo/Kyoto only; appointment-based; closed nights | 24/7 AI-first, works anywhere with internet |
| HOTEL de DOCTOR 24 (competitor) | Human doctors via video call, ¥55,000 fee, no claims automation | AI-automated, triage-first, end-to-end claims loop |

---

## 3. Impact & Market

### Problem Scale

- **5,750** medical incidents daily among tourists in Japan
- **4–5%** per-trip illness/injury rate (JTA survey, 3,069 respondents)
- **¥7,000–¥11,000** walk-in penalty at 200+ bed hospitals (MHLW mandate since 2016)
- **$45–70** equivalent at June 2026 exchange rate (~¥157/$)

### User Savings

| Metric | Value | Source |
|---|---|---|
| Avoided walk-in fee | ¥7,000–¥11,000 per incident | MHLW |
| Correct care routing | Ambulance when needed, clinic when not | JTAS-based |
| Claims automation | Eliminates pay-and-claim friction | Allianz/Sompo require upfront payment |
| Error prevention | Japanese billing (1 point = ¥10, Japanese-only receipts) decoded automatically | Japan Handbook |

### Hotel B2B Opportunity

- **50 hotels** × 200 rooms × 70% occupancy = **7,000 active travelers/day**
- At 5% incident rate: **350 medical sessions/day**
- Hotel front desk burden verified: Asahi Shimbun (Feb 2026) — Tobu Hotel Levant Tokyo staff call ambulances *"up to twice a week"* for foreign tourists. Only 3 clerks on night duty. 20–30 minutes per incident *"severely disrupts front desk operations."*
- Reclaimed: ~175 staff hours/day across partnered hotels

### Demo Metrics

| Metric | Target | Basis |
|---|---|---|
| AI triage latency | <2 seconds | Gemini 2.5 Flash: 649ms raw inference (AILatency benchmark) |
| Workflow reduction | ~75% | 8 manual steps → 2 user actions |
| Languages | 70+ | Gemini 3.5 Live Translate (announced June 9, 2026) |

---

## 4. Technical Stack (All Verified)

### "Native Google" Strategy

Every component uses Google-native APIs — single `GEMINI_API_KEY` from Google AI Studio unlocks everything.

| Component | API | Status |
|---|---|---|
| Triage engine | Gemini 2.5 Flash + structured outputs | ✅ GA, June 2025 |
| Facility matching | Google Maps Grounding (public API) | ✅ Supported on 2.5 Flash |
| Voice translation | Gemini 3.5 Live Translate Preview | ✅ Announced June 9, 2026 |
| Medical receipt OCR | Gemini 2.5 Flash multimodal vision | ✅ PDF/images up to 50MB/1000 pages |
| Session persistence | Firebase (Firestore + Auth) | ✅ Google Cloud product |
| Frontend | Next.js 15 App Router | ✅ v15.5.19 (June 2026) |

### Gemini 3.5 Live Translate — Cutting-Edge

- Announced **June 9, 2026** — brand new
- WebSocket-based: `wss://generativelanguage.googleapis.com/ws/...`
- 70+ languages, continuous streaming (not turn-by-turn)
- "Stays just a few seconds behind the speaker"
- Model code: `gemini-3.5-live-translate-preview`

### Google Maps Grounding — Real Facilities, Real Hours

- Public API at `ai.google.dev/gemini-api/docs/maps-grounding`
- Returns: places, reviews, photos, addresses, **opening hours**, `placeId`, Maps URIs
- Accepts user `latitude` / `longitude` for distance-aware queries
- Provides `groundingSupports` — inline citations linking recommendations to map data

### Hackathon Fallbacks

- 5 hardcoded Tokyo/Shinjuku clinics (JSON) if Maps Grounding unavailable
- 5 controlled drug interaction scenarios for consistent demos
- Pre-recorded translation video as backup
- Single well-lit Japanese medical receipt photo for OCR

### Key Caveats (Transparently Noted)

| Item | Caveat |
|---|---|
| JTAS self-triage | JTAS validated for trained ED nurses (BMJ 2018, 27K patients). Consumer self-triage is novel and untested |
| Drug interactions | Hackathon: pre-training only. Production would need WHO/PMDA/FDA databases (as in original Module 6 spec) |
| Google Maps "real-time" | Hours can be outdated. Google Maps is closer to real-time than JNTO but not guaranteed |
| 3.5 Live Translate | General-purpose, not medically fine-tuned. Medical term accuracy depends on model's general knowledge |
| Demo metrics | "75% workflow reduction" and "<2s" are design targets, not benchmarked against real users |

---

## 5. Product Architecture

### 8 AI Modules

| Module | Function | Key Technology |
|---|---|---|
| 1. Triage Classifier | Symptom → JTAS severity (1–5) → Route A/B/C/D | Gemini 2.5 Flash + structured outputs |
| 2. Facility Matching | Specialty + hours + language + GPS → ranked list | Google Maps Grounding |
| 3. Booking Agent | Voice/headless browser booking | LLM voice + web automation |
| 4. Intake Forms | Japanese 問診票 auto-filled from symptom data | Gemini 2.5 Flash text generation |
| 5. Live Translation | Bidirectional doctor-patient speech | Gemini 3.5 Live Translate |
| 6. Drug Interactions | Home meds × new prescriptions → severity | Hackathon: 5 scenarios. Production: WHO/PMDA |
| 7. OCR Claims | Japanese receipt → JSON → insurance form | Gemini 2.5 Flash multimodal vision |
| 8. Medication Reminders | Dosing schedule + push notifications | Firebase + OS notifications |

### Central Orchestrator: Health Session Agent

- Persistent session per trip (SQLite + encrypted cloud)
- Symptom history, triage results, bookings, prescriptions, receipts, claims
- 1M token context window (Gemini 2.5 Pro)

---

## 6. Verified Key Facts

### Japan's Healthcare System

- Ambulance transport: **100% free** for everyone including foreigners (FDMA)
- Clinic visit (uninsured): **~$32–$105** (LO-PAL, March 2026)
- Walk-in penalty at 200+ bed hospitals: **¥7,000–¥11,000** (MHLW)
- Unpaid medical bills ≥¥10,000 → **visa denial** (Nikkei Asia, Nov 2025; effective April 2026)
- Adderall: **immediate arrest** (MHLW Narcotics Control Dept)
- Sudafed / Vicks Inhaler: **prohibited** (pseudoephedrine >10% = Stimulant Raw Material)
- Concerta shortage: **ongoing nationwide since late 2025** (Japan Times, March 2026)

### Market Validation

- 4–5% tourist illness rate (JTA survey 2023–2024)
- JNTO facility search: static, warns users to verify hours manually
- Hotel burden: 2 ambulance calls/week, 3 night clerks, 20–30 min/incident (Asahi Shimbun)
- VoiceTra: 33 languages, travel-optimized, NOT medical (NICT)
- Existing competitors: HOTEL de DOCTOR 24 (28 prefectures), Traveler's Hospital (Tokyo + 9)

---

## 7. Sources

| # | Source | Key Finding |
|---|---|---|
| 1 | MHLW — Fee for Treatment of Patients' Choice | ¥7,000+ referral fee mandate |
| 2 | MHLW — Q&A for bringing medicines into Japan | Adderall prohibited; pseudoephedrine >10% restricted |
| 3 | Narcotics Control Department, MHLW | Prohibited substances list |
| 4 | Travelers Hospital (Feb 2026) | Ambulance free; treatment costs by insurance status |
| 5 | LO-PAL (Mar 2026) | Clinic ¥2,000–5,000; hospital ¥7,000+ walk-in penalty |
| 6 | Nikkei Asia (Nov 2025) | Visa denial threshold ¥10,000 |
| 7 | Asahi Shimbun (Feb 2026) | Hotel staff burden: 2 ambulance calls/week, 3 night clerks |
| 8 | Japan Times (Mar 2026) | Concerta shortage ongoing |
| 9 | JNTO/japan.travel | "1 in 20" sick/injured while abroad |
| 10 | Japan Tourism Agency survey (2023–2024) | ~4% illness/injury rate in Japan |
| 11 | US Embassy Japan (May 2026) | Yunyu Kakunin-sho: apply 2+ weeks before travel |
| 12 | UK GOV | Medical treatment in Japan — emergency guidance |
| 13 | Emergency Medicine Journal (BMJ, 2018) | JTAS validation: 27,120 patients, AUC 0.792 |
| 14 | Google AI — Grounding with Google Maps | Public API: places, hours, reviews, citations |
| 15 | Google AI — Gemini 2.5 Flash model spec | GA, Maps Grounding, structured outputs, multimodal |
| 16 | Google AI — Gemini 3.5 Live Translate | WebSocket, 70+ languages, announced June 9, 2026 |
| 17 | Google Blog (June 9, 2026) | "Gemini 3.5 Live Translate is here" |
| 18 | AILatency (June 2026) | Gemini 2.5 Flash: 649ms total, 632ms TTFT |
| 19 | Artificial Analysis | Gemini 2.5 Flash: 0.56s TTFT, 161 tok/s |
| 20 | NICT VoiceTra | 33 languages, travel-optimized, free |
| 21 | Sompo Japan Travel Insurance | ¥10M coverage, ~800 hospitals, cashless |
| 22 | Japan Handbook (May 2026) | Billing: 1 point = ¥10; Ryoushuusho required |
| 23 | PR Times (Mar 2025) | HOTEL de DOCTOR 24 competitor |
| 24 | Tokyo Station International Clinic | 700+ overseas patients/month |
| 25 | Next.js GitHub | v15.5.19 (June 1, 2026), LTS |
