# MediRoute Interactive Mock v2 — Design Spec

**Date:** 2026-06-23 | **Version:** 2.0 (full-path expansion)
**Type:** Single static HTML file

## Goal

Build an interactive, multi-path prototype of MediRoute covering 15 demo scenarios across 5 categories — with a hub-based entry, parameterized screens, live keyword triage, clickable clinic picker, and persistent session state. All pre-scripted, no backend.

## Architecture

Single self-contained HTML file. No framework, no build step. CSS in `<style>`, JS in `<script>`. All screen content is parameterized — functions receive `sessionState.pathContext` and render dynamic HTML. Navigation is route-based: `currentRoute` + `currentStep` within route. State persists to `localStorage`.

## Design System (unchanged from v1)

### Dials
- **DESIGN_VARIANCE:** 5
- **MOTION_INTENSITY:** 4
- **VISUAL_DENSITY:** 4

### Brand: Material 3 (Google)

| Token | Value | Role |
|---|---|---|
| Primary | `#1A73E8` | CTAs, clinic paths, mild severity |
| Error | `#EA4335` | Severity 1, CALL 119, prohibited drugs |
| Warning | `#FBBC04` | Severity 2-3, restricted drugs, interactions |
| Surface | `#FFFFFF` / `#F8F9FA` | Phone background, cards |
| On Surface | `#202124` | Text, icons |
| Outline | `#DADCE0` | Borders, dividers |
| Purple | `#9334E6` | Medication category (hub accent) |
| Teal | `#00897B` | Translation category (hub accent) |

### Typography
- **DM Sans** — display/headlines
- **Roboto** — body text, chat, labels
- **Roboto Mono** — technical sidebar

### Icons
Phosphor Icons via CDN: `https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css`

### Dark mode
Light mode only.

### Language toggle
`🌐 EN` in top bar swaps: Next/Back/Step labels, category labels.

---

## State Model

```javascript
sessionState = {
  currentRoute: "chest-pain",     // route key from ROUTES
  currentStep: 0,                 // index within route's screens array
  visitedSteps: new Set([0]),
  
  pathContext: {
    urgencyLevel: 1,              // 1-5 (JTAS scale)
    severityColor: "error",       // "error"|"warning"|"primary"|null
    specialty: "emergency",       // "emergency"|"internal"|"pediatrics"|"dental"|"orthopedics"|"pharmacy"|"surgery"|"neurology"
    clinics: [...],               // clinics for this route
    selectedClinic: null,         // set when user clicks a clinic card
    patientName: "Alex Chen",
    currentMeds: ["Warfarin"],
    newPrescription: null,
    drugName: null,               // for drug-prohibited/restricted routes
    drugStatus: null,             // "prohibited"|"restricted"
  },

  pastRoutes: [],                 // [{route, label, clinic, timestamp}]
  activeHubCategory: null,        // which hub card is expanded (or null)
  lang: "en",
};
```

State is saved to `localStorage` on every navigation. On page load, if `localStorage` has state, show "Continue where you left off?" prompt.

---

## Route System

### Route Map (15 routes, 5 categories)

```
🚨 Emergency (priority 1)
  ├─ chest-pain:   chat → triageEmergency → wait → clinicSearch → booking → arrival → intake → prescriptionTransition → drugInteraction → receipt
  ├─ bleeding:     chat → triageEmergency → wait → clinicSearch → booking → arrival → intake → receipt
  ├─ head-injury:  chat → triageEmergency → wait → clinicSearch → booking → arrival → intake → receipt
  └─ child-emergency: chat → triageUrgent → costEducation → clinicSearch → booking → arrival → intake → receipt

🏥 Clinic Visit (priority 3)
  ├─ moderate-fever: chat → triageUrgent → costEducation → clinicSearch → booking → arrival → intake → prescriptionTransition → drugInteraction → receipt
  ├─ mild-symptoms:  chat → triageMild → selfCare → clinicSearch → booking → arrival → intake → receipt
  ├─ injury:         chat → triageUrgent → costEducation → clinicSearch → booking → arrival → intake → receipt
  └─ dental:         chat → triageUrgent → costEducation → clinicSearch → booking → arrival → intake → receipt

💊 Medication (priority 2)
  ├─ drug-prohibited:   chat → drugProhibited → embassyContact → pharmacyFinder
  ├─ drug-restricted:   chat → drugRestricted → yunyuGuide
  ├─ drug-interaction:  chat → drugInteractionInput → drugInteraction
  ├─ lost-medication:   chat → pharmacyFinder → booking → embassyContact
  └─ pre-travel-check:  chat → drugRestricted → yunyuGuide

🗣️ Translation (priority 4)
  ├─ pharmacy-translate: chat → receipt
  └─ doctor-translate:   chat → liveTranslation

💰 Cost & Admin (priority 5)
  └─ cost-info: chat → costEducation → insuranceExplainer → receiptPreview → visaWarning
```

### Keyword → Route Mapping (priority-ordered)

```javascript
KEYWORD_ROUTES = [
  // Priority 1: Emergency
  { kw: ["chest pain","shortness of breath","can't breathe","heart attack"], route: "chest-pain" },
  { kw: ["bleeding","cut myself","accident","blood"], route: "bleeding" },
  { kw: ["hit my head","fell","concussion","head injury"], route: "head-injury" },
  { kw: ["my child","baby","toddler","infant","my kid"], route: "child-emergency" },

  // Priority 2: Prohibited / Restricted drugs
  { kw: ["adderall","vyvanse","ritalin","concerta"], route: "drug-prohibited" },
  { kw: ["sudafed","vicks inhaler","pseudoephedrine"], route: "drug-prohibited" },
  { kw: ["codeine","xanax","valium","ativan"], route: "drug-restricted" },

  // Priority 3: Clinic / Urgent
  { kw: ["fever","flu","cough","sore throat"], route: "moderate-fever" },
  { kw: ["headache","rash","stomach","diarrhea","nauseous"], route: "mild-symptoms" },
  { kw: ["sprained","twisted","burn","hurt my"], route: "injury" },
  { kw: ["tooth","dental","dentist","gum"], route: "dental" },

  // Priority 4: Translation
  { kw: ["translate","prescription label","read this"], route: "pharmacy-translate" },
  { kw: ["at the doctor","need to explain","speak to doctor"], route: "doctor-translate" },

  // Priority 5: Cost / Admin
  { kw: ["how much","can't afford","no insurance","expensive","cost"], route: "cost-info" },
  { kw: ["can't pay","leave without paying","skip bill","visa"], route: "cost-info" },
  { kw: ["lost my","ran out of","left my meds"], route: "lost-medication" },
  { kw: ["can i bring","is x legal","flying with"], route: "drug-restricted" },
  { kw: ["warfarin","metformin","interaction"], route: "drug-interaction" },
];
```

---

## Hub Page

### Layout (phone screen, scrollable)

```
┌──────────────────────────────┐
│  🏥                         │  ← Dynamic Island
│                              │
│        MediRoute             │  ← DM Sans 24px, primary blue
│    AI Medical Companion      │  ← Roboto 12px, gray
│                              │
│  ┌────────────────────────┐  │
│  │ 🔍 Type a symptom or   │  │  ← Text input with placeholder
│  │   medication name...   │  │     On input: live keyword match
│  └────────────────────────┘  │     highlights matching category
│                              │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐  │  ← Smart chips (tappable)
│  │CP││Fv││Ad││Ls││Tx││$?│  │     CP=Chest Pain, Fv=Fever,
│  └──┘└──┘└──┘└──┘└──┘└──┘  │     Ad=Adderall, Ls=Lost Meds,
│                              │     Tx=Translate, $?=Cost
│                              │
│  ┌────────────────────────┐  │  ← Category card (red left border)
│  │ 🚨 Emergency     [4] ↗│  │     [4] = sub-route count
│  │ Chest pain, bleeding,  │  │     ↗ = expand sub-menu
│  │ head injury, child...  │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │  ← Amber left border
│  │ 🏥 Clinic Visit   [4] ↗│  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │  ← Purple left border
│  │ 💊 Medication    [5] ↗│  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │  ← Teal left border
│  │ 🗣️ Translation  [2] ↗│  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │  ← Blue left border
│  │ 💰 Cost & Claims [1] ↗│  │
│  └────────────────────────┘  │
│                              │
│         🔄 New Session       │  ← Reset all state
│                              │
│   ─── Recent Sessions ───    │
│   ✓ Chest Pain (2 min ago)   │  ← Clickable history
│   ✓ Drug Check (5 min ago)   │
└──────────────────────────────┘
```

### Hub Interactions

- **Click category card (not ↗)**: Immediately starts the FIRST route in that category. One-click demo entry.
- **Click ↗**: Card expands inline to show sub-route buttons. Click sub-route to start. Click ✕ to collapse.
- **Type in search**: Live keyword matching. Matching category card gets a subtle glow border. Press Enter to start the best-matched route.
- **Click smart chip**: Auto-fills search and starts matching route.
- **"Recent Sessions"**: Shows last 5 completed routes with timestamps. Click to replay.
- **"New Session"**: Clears `localStorage`, resets to fresh hub.
- **🏠 icon in top bar** (visible during any route): Returns to hub without clearing history.

### Sub-menu (expanded state)

```
│  ┌────────────────────────┐  │
│  │ 🚨 Emergency     [4] ✕│  │  ← ✕ to collapse
│  │                        │  │
│  │ ● Chest Pain Emergency │  │  ← Click = start route
│  │ ● Severe Bleeding      │  │
│  │ ● Head Injury          │  │
│  │ ● Child Emergency      │  │
│  └────────────────────────┘  │
```

---

## Screen Templates (16 total)

### Carried forward (unchanged from v1, now parameterized)
`chat`, `triageEmergency` (was triage-result), `wait` (was while-you-wait), `costEducation`, `clinicSearch` (parameterized per specialty), `booking` (now uses `pathContext.selectedClinic` for phone + name), `arrival` (now shows selected clinic name), `intake`, `prescriptionTransition`, `drugInteraction`, `receipt`

### New screens

#### `triageUrgent`
- Severity card: "Severity [level] — Urgent" (amber)
- "Find a clinic today" CTA (primary button)
- Symptom reasoning text
- Cost reassurance footer (green, same as v1)
- **No** CALL 119 button
- Route label badge: "Route B: Clinic today"

#### `triageMild`
- Severity card: "Severity 4 — Semi-Urgent" (blue)
- "Monitor for 48 hours" header
- Two CTAs: "Find a clinic" (primary outline) + "Self-care tips" (primary filled)
- Symptom reasoning text
- Route label badge: "Route C: Clinic within 48h"

#### `selfCare`
- Header: "💧 Self-Care Tips"
- 3 info cards:
  1. "Rest & hydrate" — water icon, "Get plenty of rest and drink fluids"
  2. "OTC medications" — pill icon, "Visit a pharmacy for over-the-counter relief"
  3. "Monitor symptoms" — clock icon, "If symptoms worsen within 48 hours, find a clinic immediately"
- CTA: "I'd rather find a clinic now →" (jumps to clinicSearch within route)

#### `drugProhibited`
- ⚠️ ILLEGAL banner (red, full-width)
- Icon: 🚫 with drug name
- "Adderall is classified as a STIMULANT RAW MATERIAL in Japan."
- "⚠️ Carrying it → IMMEDIATE ARREST at customs."
- What to do section (3 items):
  1. "DO NOT bring it to Japan"
  2. "Contact your doctor NOW for alternative medications"
  3. "Apply for Yunyu Kakunin-sho — but likely denied for stimulants"
- CTA: "Contact Embassy →"
- CTA: "Find alternative medication →" (goes to pharmacyFinder)

#### `drugRestricted`
- ⚠️ RESTRICTED banner (amber)
- "[Drug name] is controlled but importable with a permit"
- 4 numbered steps:
  1. Get a doctor's letter explaining medical necessity
  2. Apply for Yunyu Kakunin-sho (import certificate) — 2+ weeks processing
  3. Carry medication in original packaging with prescription
  4. Declare at customs on arrival
- ⏰ Timeline warning: "Minimum 2 weeks — start the application NOW"
- CTA: "Generate Application →" (mock toast: "📄 Yunyu Kakunin-sho application downloaded")

#### `drugInteractionInput`
- Header: "💊 Check Drug Interactions"
- Section 1: "Your current medications" — pre-filled pill-shaped tags (Warfarin 5mg)
- Section 2: "New prescription" — pre-filled tag (Ciprofloxacin 500mg)  
- "Check Interactions →" button
- Clicking button transitions to `drugInteraction` screen (same as v1)

#### `yunyuGuide`
- Header: "📋 Yunyu Kakunin-sho Guide"
- Step-by-step card with numbered items and check icons
- "Download Application Form" button (mock toast)
- Link: "Apply at MHLW website →" (mock external link)

#### `pharmacyFinder`
- Same layout as `clinicSearch` but green accent (not red/blue)
- Header: "💊 Nearest Pharmacies"
- Map mock (same CSS)
- 3 pharmacy cards:
  - "Shinjuku Pharmacy" — 🇬🇧 English-speaking pharmacist — 0.6km — 9:00-22:00
  - "Matsumoto Kiyoshi" — 🇯🇵 Japanese only — 0.8km — 10:00-21:00
  - "Tomod's Shinjuku" — 🇬🇧 Some English — 1.0km — 9:00-23:00
- Each card has "Select" button — sets `selectedClinic` in state

#### `embassyContact`
- Header: "🏛️ Your Embassy"
- Card: US Embassy Tokyo
  - 📞 03-3224-5000
  - "American Citizen Services — 24h emergency line"
  - "Tell them: 'I need assistance with medication regulations in Japan.'"
  - "They've handled this situation before."
- 🇬🇧 UK, 🇦🇺 Australia, 🇨🇦 Canada embassy links (collapsed accordion)
- "Call Embassy →" link (`tel:`)

#### `liveTranslation`
- Header: "🎤 Live Translation"
- Split screen:
  - Top half: user language (EN) with mic icon (pulsing animation)
  - Bottom half: Japanese output
- "Tap to speak" button (mock — shows "Listening..." animation)
- Common phrases section (scrollable):
  - "Where does it hurt?" → "どこが痛みますか？"
  - "How long?" → "どのくらい続いていますか？"
  - "I'm allergic to..." → "アレルギーがあります..."
  - "I take these medications..." → "これらの薬を服用しています..."
- Each phrase has a speaker icon to "play" (mock)

#### `insuranceExplainer`
- Header: "💳 Travel Insurance in Japan"
- 3 step cards with numbers:
  1. "You pay upfront at the hospital — keep the receipt (領収書 / Ryoushuusho)"
  2. "Submit claim to your insurer — Allianz, Sompo, World Nomads, etc."
  3. "MediRoute auto-generates your claim form from a receipt photo"
- CTA: "See a sample claim →" (jumps to `receiptPreview`)

#### `receiptPreview`
- Same CSS receipt mock as v1
- Annotation arrows (CSS pseudo-elements or positioned spans) pointing to:
  - "🏥 Clinic name — required for claim"
  - "💰 Total in yen — 1 point = ¥10"
  - "㊞ Stamp — required by Japanese insurers"
- Below receipt: "This is what your insurer needs" text
- CTA: "Continue →" (jumps to `visaWaming`)

#### `visaWaming`
- ⚠️ Alert card (red border)
- Icon: 🚫 passport
- "Unpaid Medical Bills = Visa Denial"
- "As of April 2026: medical debt ≥¥10,000 → automatic visa denial on re-entry to Japan"
- "Even if you're leaving tomorrow — pay before you go"
- CTA: "Contact Embassy →"
- Disclaimer: "Source: Nikkei Asia, November 2025"

---

## Top Bar (context-aware)

| Route state | Top bar content |
|---|---|
| Hub | `MediRoute` | `🌐 EN` | *(no step indicator)* | `?` |
| In a route | `🏠 MediRoute` | `🌐 EN` | `Step 3/8` | `?` |

The 🏠 icon returns to hub. Clicking it saves current route state to `pastRoutes`.

---

## Navigation

### Within a route
- **Next/Back**: Move through route's screen array
- **← → keys**: Same as buttons
- **Progress dots**: Dynamic count = `ROUTES[currentRoute].screens.length`
- **R**: Restart current route (same path, back to first screen)
- **Shift+R**: New session → hub with cleared history
- **0 or H**: Go to hub (save current route to history)

### Hub
- **1-5 keys**: Jump to category (1=Emergency, 2=Clinic, 3=Medication, 4=Translation, 5=Cost)
- **Type in search + Enter**: Start matched route
- **Click smart chip**: Start that route

### Transition lock
250ms cooldown after each navigation (same as v1).

---

## Tech Sidebar (per screen, same as v1)

Sidebar content adapts to current screen's function. For new screens:

| Screen | What Gemini did | Function |
|---|---|---|
| triageUrgent | Severity 2-3 — urgent but not life-threatening | `triageAssessment()` |
| triageMild | Severity 4 — semi-urgent | `triageAssessment()` |
| drugProhibited | Matched drug against MHLW prohibited substances list | `checkDrugLegality()` |
| drugRestricted | Matched drug against controlled substances + permit eligibility | `checkDrugLegality()` |
| drugInteractionInput | Preparing interaction matrix | `checkDrugInteractions()` |
| yunyuGuide | Generated permit application instructions | Text generation |
| pharmacyFinder | Searched pharmacies near user location | Google Maps Grounding |
| embassyContact | — (static content) | Pre-loaded embassy data |
| liveTranslation | Streaming bidirectional speech translation | Gemini 3.5 Live Translate |
| insuranceExplainer | — (static content) | Insurance provider data |
| receiptPreview | Extracted fields from receipt image | Multimodal vision |
| visaWarning | — (static content) | Immigration law reference |

---

## Clinic Data

```javascript
clinics = {
  emergency: [
    { name: "St. Luke's International", specialty: "Emergency", language: "🇬🇧 English", distance: "1.2km", hours: "24h", phone: "03-5550-7120" },
    { name: "Tokyo Medical University", specialty: "Emergency", language: "🇬🇧 English available", distance: "2.8km", hours: "24h", phone: "03-3342-6111" },
    { name: "JCHO Tokyo Yamate", specialty: "Emergency", language: "🇯🇵 Japanese only", distance: "3.5km", hours: "24h", phone: "03-3205-7211" },
  ],
  internal: [
    { name: "Shinjuku Clinic", specialty: "Internal Medicine", language: "🇬🇧 English", distance: "0.8km", hours: "9:00-19:00", phone: "03-3350-1212" },
    { name: "Tokyo Midtown Medical", specialty: "Internal Medicine", language: "🇬🇧 English available", distance: "2.1km", hours: "9:00-21:00", phone: "03-5413-0080" },
  ],
  pediatric: [
    { name: "National Center for Child Health", specialty: "Pediatrics", language: "🇬🇧 English", distance: "3.0km", hours: "24h", phone: "03-3416-0181" },
    { name: "Tokyo Children's Clinic", specialty: "Pediatrics", language: "🇬🇧 Some English", distance: "1.5km", hours: "9:00-18:00", phone: "03-3355-2200" },
  ],
  dental: [
    { name: "Shinjuku Dental Office", specialty: "Dentistry", language: "🇬🇧 English", distance: "0.5km", hours: "10:00-19:00", phone: "03-3356-7890" },
  ],
  orthopedics: [
    { name: "Tokyo Sports Medicine Clinic", specialty: "Orthopedics", language: "🇬🇧 Some English", distance: "2.5km", hours: "9:00-18:00", phone: "03-3400-1111" },
  ],
  pharmacy: [
    { name: "Shinjuku Pharmacy", specialty: "Pharmacy", language: "🇬🇧 English pharmacist", distance: "0.6km", hours: "9:00-22:00", phone: "03-3350-9999" },
    { name: "Matsumoto Kiyoshi", specialty: "Pharmacy", language: "🇯🇵 Japanese only", distance: "0.8km", hours: "10:00-21:00", phone: "03-3351-2222" },
    { name: "Tomod's Shinjuku", specialty: "Pharmacy", language: "🇬🇧 Some English", distance: "1.0km", hours: "9:00-23:00", phone: "03-3352-3333" },
  ],
};
```

---

## localStorage Persistence

On every navigation and state change:
```javascript
localStorage.setItem('mediroute-session', JSON.stringify({
  currentRoute: sessionState.currentRoute,
  currentStep: sessionState.currentStep,
  pathContext: sessionState.pathContext,
  pastRoutes: sessionState.pastRoutes,
  lang: sessionState.lang,
  timestamp: Date.now(),
}));
```

On page load:
- Check `localStorage` for `mediroute-session`
- If found and < 24h old: show "Continue where you left off? [Yes] [Start Fresh]" prompt
- If > 24h old: auto-clear and start fresh

---

## Mobile (<768px)

- Phone frame fills screen (same as v1)
- Tech sidebar hidden, tech toggle hidden
- Hub cards: full width, sub-menus stack vertically
- Smart chips: horizontal scroll if overflow
- Keyboard shortcuts still work on devices with keyboards

---

## Stretch Goals

- Swipe gestures on mobile (horizontal drag to navigate within route)
- Smooth slide transitions between screens (instead of fade)
- Shareable URL hash (`#route=chest-pain&step=3`) for deep linking
- "Presentation mode" — auto-play timer per screen
- Dark mode toggle
