# MediRoute — Product Flow Specification

## 1. Product Vision

MediRoute is a full-stack AI medical companion that routes, guides, translates, and closes the loop on every step of a tourist's medical journey in Japan. Designed for the 42+ million foreign visitors who arrive in Japan each year unable to communicate in Japanese, MediRoute eliminates the single most stressful emergency a traveler can face — getting sick in a country where you don't speak the language, don't understand the medical system, and have no one to help you navigate from symptom to recovery to reimbursement.

The language barrier in Japanese healthcare is universal — a Korean speaker, a Chinese speaker, an English-speaking American, a Thai tourist, or a German backpacker all face the same wall: Japanese intake forms, Japanese-only clinic staff, Japanese prescription packets, and a Japanese insurance claim process. MediRoute's AI infrastructure solves all of this once, and simply outputs the answer in whatever language the user speaks.

From the moment a user describes their first symptom to the moment their insurance claim is settled, MediRoute acts as an always-on, multilingual health concierge: triaging with clinical intelligence, booking with Japanese fluency, translating in real time, catching dangerous drug interactions, nudging medication adherence, and automating paperwork that would otherwise be lost in translation.

## 2. AI Agent Architecture

The MediRoute backend is organized as a set of specialized AI modules, all orchestrated by a central Health Session Agent.

### Central Orchestrator: Health Session Agent
- Maintains a persistent health session object per trip (symptom history, triage result, bookings, consultation records, prescription data, dosing schedule, receipt data, claim status)
- Exposes unified context to all downstream modules
- Built on a long-context LLM with tool-calling capability
- State persisted locally on device (SQLite) + optionally synced to encrypted cloud

### Module 1: Triage NLP Classifier
- Input: Raw symptom text or transcribed voice in user's language
- Processing: NER (body part, symptom, duration, severity) → symptom vector → severity scoring
- Model: Fine-tuned on JTAS (Japan Triage and Acuity Scale) dataset + multilingual triage training data
- Output: Severity score (1–5) → mapped to Route A/B/C/D + specialty recommendation

### Module 2: Facility Matching Engine
- Data source: JNTO NAVII API + crowdsourced language-support ratings
- Filters: Specialty match → Operating hours (real-time) → Language support flag → GPS distance sort → Wait time estimate
- Output: Ranked facility list with metadata

### Module 3: Booking Agent
- Phone booking: LLM-powered Japanese voice agent (TTS with natural prosody)
- Web form booking: Headless browser agent for Japanese clinic booking portals
- Telehealth API: REST integration with IC Care and FastDoctor APIs

### Module 4: Intake Form Generator
- Template library: Standardized Japanese 問診票 templates per specialty
- Filler: Structured mapping from health profile + symptom data to form fields
- Output: Rendered PDF + on-screen show-card (Japanese + user's language)

### Module 5: Real-Time Bidirectional Translation
- Multi-language ASR: Whisper large-v3 fine-tuned for medical terminology
- Medical translation LLM: Context-primed, optimized for medical term accuracy
- Japanese ASR: Standard Japanese medical ASR
- TTS output: Natural TTS in user's language
- Latency target: < 2 seconds end-to-end

### Module 6: Drug Interaction Engine
- Databases: WHO Drug Interaction, Japan PMDA, FDA, Korea MFDS
- Interaction matrix: All pairwise (home medications) × (new prescriptions)
- Severity: Critical / Moderate / Mild / No interaction
- Output: Interaction report with plain-language alerts + suggested Japanese questions

### Module 7: OCR + Claim Generator
- Receipt OCR: Vision model fine-tuned on Japanese medical receipts → structured JSON
- Field mapping: Japanese billing codes → insurance claim categories
- Form pre-fill: Template engine matching insurer-specific claim form schemas
- Output: Completed claim PDF + optional API submission payload

### Module 8: Medication Reminder Scheduler
- Input: Dosing schedule + user timezone + travel itinerary
- Scheduling: Local device notifications via OS push notification API
- Check-in logic: Rule-based escalation tree (Worse → retrigger triage; Missed doses → escalating reminders)
