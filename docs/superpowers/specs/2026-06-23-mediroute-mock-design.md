# MediRoute Interactive Mock Page — Design Spec

**Date:** 2026-06-23 | **Type:** Single static HTML file
**Version:** 1.1 (gap analysis applied)

## Goal

Build a clickable, pre-scripted prototype of the full MediRoute flow — an app-screen simulator in a phone frame — so teammates can walk through the product narrative without any backend or API calls.

## Architecture

Single self-contained HTML file. No framework, no build step. Dependencies: Google Fonts CDN, Phosphor Icons CDN. CSS in `<style>`, JS in `<script>`. All screen content hardcoded as data objects. Navigation is state-driven: a single `currentStep` variable renders the corresponding screen via DOM swapping.

## Design System

### Dials

- **DESIGN_VARIANCE:** 5 — phone frame centered, clean Material 3 symmetry, single-column content inside the phone
- **MOTION_INTENSITY:** 4 — CSS transitions on screen changes (250ms fade), pulsing animation on 119 button, progress dot fills. No GSAP. No scroll-jack.
- **VISUAL_DENSITY:** 4 — phone-size content, airy spacing, one interaction per screen

### Brand: Material 3 (Google)

| Token | Value | Role |
|---|---|---|
| Primary | `#1A73E8` | CTAs, active dots, severity badges |
| Error | `#EA4335` | Severity 1 badge, CALL 119 button |
| Warning | `#FBBC04` | Severity 2, drug interaction alerts |
| Surface | `#FFFFFF` / `#F8F9FA` | Phone background, cards |
| On Surface | `#202124` | Text, icons |
| Outline | `#DADCE0` | Borders, dividers |

### Typography

- **DM Sans** — display/headlines (`https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap`). Chosen over Google Sans (not publicly available on CDN). Close aesthetic match — geometric, clean, modern.
- **Roboto** — body text, chat, labels
- **Roboto Mono** — technical sidebar only

### Icons

Phosphor Icons via CDN. Exact URL: `https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css`

Icons used:
- `ph-phone-call`, `ph-warning`, `ph-check-circle`, `ph-map-pin`, `ph-translate`, `ph-camera`, `ph-receipt`, `ph-first-aid`, `ph-arrow-left`, `ph-arrow-right`, `ph-info`, `ph-hospital`, `ph-clock`, `ph-globe`, `ph-ambulance`

### Dark mode

Light mode only for this mock.

### Language Toggle (mock)

A `🌐 EN` toggle in the top bar. Clicking it swaps a few key UI strings to Japanese to demonstrate multilingual capability:
- "Next" / "次へ"
- "Back" / "戻る"
- "Step" / "ステップ"

This is a visual nod — it doesn't translate all content. It reinforces MediRoute's 70+ language value prop without adding build complexity.

---

## Layout

### Desktop (≥768px)

```
┌──────────────────────────────────────────────────────────┐
│  [MediRoute]       🌐 EN     Step 3/8       [?] Tech    │  ← 64px top bar
│                                                          │
│                ┌─────────────────┐  ┌──────────────────┐ │
│                │ ┌─────────────┐ │  │  What Gemini did  │ │
│                │ │ Dynamic Isl.│ │  │  ─────────────── │ │
│                │ ├─────────────┤ │  │  Function called  │ │
│                │ │             │ │  │  Latency: ~0.6s   │ │
│                │ │  APP SCREEN │ │  │  Source: Maps     │ │
│                │ │  (scrollable│ │  │  Grounding        │ │
│                │ │   content)  │ │  │                   │ │
│                │ │             │ │  └──────────────────┘ │
│                │ └─────────────┘ │                        │
│                └─────────────────┘                        │
│                                                          │
│                         ● ● ○ ○ ○ ○ ○ ○                  │  ← progress dots
│                     [← Back]     [Next →]                │  ← nav buttons
└──────────────────────────────────────────────────────────┘
```

- **Phone frame**: iPhone 15 Pro proportions (390×844), scaled to fit viewport. Max-height: 70vh. Frame is a CSS-drawn rounded rectangle with dark bezel and a simplified Dynamic Island notch (small pill at top center). Not photo-realistic — clean and recognizable.
- **App screen content**: `overflow-y: auto` inside the phone frame. Screens with long content (clinic cards, intake form) scroll naturally within the phone.
- **Sidebar**: hidden by default. Toggle button `[?]` in top bar. Width: 280px. Slides in from right via CSS transition (`transform: translateX`). Content is a `<template>` swapped per step.
- **Progress dots**: 10 dots (see screen count below). Filled = visited, current = primary fill, future = outline.
- **Nav**: keyboard support (← → arrow keys). Transition lock prevents double-clicks during fade.

### Mobile (<768px)

- Phone frame fills the screen. No desktop bezel. No sidebar.
- Progress dots + nav remain.
- Swipe left/right to navigate (stretch goal, see end of spec).

---

## Screens (10 total — 8 core + 2 narrative transitions)

### Screen 1: Symptom Input
- Chat UI inside phone frame. Message bubbles — user right-aligned, assistant left-aligned.
- Pre-filled conversation:
  - **User** (right, blue bubble): "I have chest pain and shortness of breath. It started about 30 minutes ago."
  - **Assistant** (left, gray bubble, animated typing dots → resolves): "I'm analyzing your symptoms..."
- Chat input bar at bottom (disabled, visual-only).

### Screen 2: Triage Result
- Severity alert card slides in: **Severity 1 — Emergency**
- Red badge: 🚨 **CALL 119 IMMEDIATELY**
- CALL 119 button — pulsing red glow (CSS `@keyframes pulse-glow`, 2s cycle)
- Reasoning: "Chest pain + difficulty breathing requires immediate emergency care"
- Route label: "Route A: Call 119 immediately"
- **Cost reassurance footer** (smaller text, green check icon, lower visual weight — appears 1s after the emergency alert):
  "💡 Ambulances in Japan are 100% FREE — don't hesitate to call."

### Screen 3: While You Wait
- Bridges the emotional gap between emergency alert and clinic search.
- Header: 🚑 **Help is on the way**
- Info cards (2x2 grid):
  - Card 1: "Ambulances are **FREE** — ¥0 for everyone, including tourists" (source: FDMA)
  - Card 2: "At the hospital — show your passport and insurance card. Walk-in penalty is **¥7,000–¥11,000** at large hospitals, but emergency transport skips this."
  - Card 3: "Language support — most ERs have interpreter tablets. Ask for 'tsuyaku' (通訳)"
  - Card 4: "Unpaid bills ≥¥10,000 → **visa denial on re-entry**. Always pay before leaving."
- Tone: reassuring, informative, not alarmist. The emergency has been called — this is the "what to expect" screen.

### Screen 4: Clinic Search
- Mock map placeholder at top — a CSS gradient simulating a map (light blue background, grid lines, a red pin marker drawn with CSS). Label overlay: "Google Maps Grounding — Shinjuku area"
- 3 clinic cards (scrollable if needed):
  - Card 1: **St. Luke's International Hospital** — 🏥 Emergency · 🇬🇧 English · 📍 1.2km · 🕐 Open 24h · [SELECTED — green check]
  - Card 2: **Tokyo Medical University Hospital** — 🏥 Emergency · 🇬🇧 English available · 📍 2.8km · 🕐 Open 24h · [Select]
  - Card 3: **JCHO Tokyo Yamate Medical Center** — 🩺 Internal Medicine · 🇯🇵 Japanese only · 📍 3.5km · 🕐 Until 22:00 · [Select]
- Each card: name, specialty badge, language badge, distance, hours, "Select" button.
- Citations footnote: *"Source: Google Maps Grounding"*
- Card 1 is pre-selected (green check) — this flows into Screen 5.

### Screen 5: Booking Script
- Clinic name header: "St. Luke's International Hospital"
- Phone number: `📞 03-5550-7120` with "Call" button (mock — `tel:` link)
- Japanese script card (large, readable — 18px+):
  - **Japanese**: こんにちは。胸の痛みと息苦しさがあります。30分前から症状があります。外国人です。日本語は話せません。
  - **Romaji** (toggle button to show/hide): *"Konnichiwa. Mune no itami to ikigurushisa ga arimasu. Sanjuppun mae kara shoujou ga arimasu. Gaikokujin desu. Nihongo wa hanasemasen."*
  - **English** (smaller, below): "Hello. I have chest pain and difficulty breathing. Symptoms started 30 minutes ago. I'm a foreigner. I don't speak Japanese."
- Tip: "Show this card to the receptionist or read it aloud"
- Tip: "Screen brightness up — make it easy for the receptionist to read"

### Screen 5→6 Transition: Arrival at Hospital
- Brief interstitial screen (auto-advances after 1.5s or on click)
- Icon: 🏥
- Text: **"You've arrived at St. Luke's International Hospital"**
- Subtext: "The receptionist hands you a 問診票 (medical questionnaire). MediRoute has pre-filled it for you."

### Screen 6: Intake Form (問診票)
- Two-column card layout:
  - Left column (Japanese): field labels in Japanese, values in Japanese
  - Right column (English): field labels in English, values in English
- Pre-filled fields:
  | Japanese | English | Value |
  |---|---|---|
  | 名前 | Name | Alex Chen |
  | 生年月日 | Date of Birth | 1992-03-15 |
  | 症状 | Symptoms | Chest pain, shortness of breath — 30 min |
  | 既往歴 | Medical History | None |
  | 服用中の薬 | Current Medications | None |
  | アレルギー | Allergies | None |
- "Download PDF" button (mock — shows a brief toast at top of phone: ✅ "PDF saved — show at reception")
- Tip: "Show the Japanese column to the doctor. Keep the English column for yourself."

### Screen 6→7 Transition: Prescription Received
- Brief interstitial (auto-advances after 1.5s or on click)
- Icon: 💊
- Text: **"The doctor prescribed Ciprofloxacin"**
- Subtext: "Let's check if it interacts with your current medications..."

### Screen 7: Drug Interaction
- ⚠️ Warning card — amber/orange accent
- Scenario: User takes Warfarin daily (pre-loaded in health profile); doctor just prescribed Ciprofloxacin
- Alert: **"⚠️ CRITICAL: Ciprofloxacin + Warfarin — Increased Bleeding Risk"**
- Severity bar: ████████░░ Critical (red)
- Details: "Ciprofloxacin can increase the anticoagulant effect of Warfarin. INR should be monitored closely."
- Suggested question (in both languages):
  - English: "Should I have my INR monitored while taking this antibiotic?"
  - Japanese: "この抗生物質を服用中、INRをモニタリングすべきですか？"
- Disclaimer: "AI-generated. Always confirm with your pharmacist or doctor."
- **Note**: This screen is fully pre-scripted. No custom drug input — keeps scope clean.

### Screen 8: Receipt OCR → Claim
- Top: camera icon placeholder → shows a **CSS-drawn mock receipt** (white rectangle with Japanese text placeholder lines, stamp circle, item rows — looks like a real receipt without needing an image file)
- Loading state: "Analyzing receipt..." with animated dots
- Then resolves to a structured claim summary card:
  - Clinic: St. Luke's International Hospital
  - Date: 2026-06-23
  - Items:
    - Consultation: ¥5,000
    - Blood Test: ¥8,000
    - ECG: ¥3,000
  - **Total: ¥16,000**
- "Generate Claim PDF" button (mock — toast: ✅ "Claim form generated")
- Footnote: "Decoded from Japanese medical receipt — 1 point = ¥10"
- Flag: "Send to Allianz / Sompo for reimbursement"

---

## Navigation State Machine

```
S1 ⇄ S2 ⇄ S3 ⇄ S4 ⇄ S5 ⇄ [T1] ⇄ S6 ⇄ [T2] ⇄ S7 ⇄ S8
```

Where `T1` = Arrival at Hospital transition, `T2` = Prescription Received transition.

- `currentStep` index: 0–9
- **Screen count for progress dots**: 10 dots to match all screens including transitions.
- **Back button**: hidden on step 0. Greyed-out appearance when disabled.
- **Next button**: on step 9 (last screen), shows **"↻ Restart"** instead of "Next →". Clicking Restart resets `currentStep` to 0, clears visited state, and fades back to Screen 1. Keyboard shortcut: R key also triggers Restart from any screen.
- **Progress dots**: clickable — jump to any visited step. Unvisited steps are non-clickable (prevent skipping ahead).
- **Transition screens** (T1, T2): auto-advance after 1.5s, or advance immediately on click/tap. They count as visited steps and appear in the progress dots.
- **Keyboard**: ← goes back, → goes forward. Transition lock: 250ms cooldown after each navigation to prevent double-triggering during fade animation.
- **Transition animation**: CSS class swap — `screen-exit` (150ms fade-out + slide-up 10px) → swap content → `screen-enter` (150ms fade-in + slide-down 10px).

---

## Sidebar Content (per step)

Toggle with `[?]` button in top bar or keyboard shortcut `T`.

| Step | What Gemini Did | Function | Latency | Source |
|---|---|---|---|---|
| 1 | Analyzed symptoms against JTAS triage protocol | `triageAssessment({symptoms, language})` | ~0.6s | Gemini 2.5 Flash |
| 2 | Returned severity 1 — chest pain + dyspnea = emergency | Structured output (JSON schema) | — | JTAS clinical protocol |
| 3 | *(No AI call — static educational content)* | — | — | MHLW / FDMA |
| 4 | Searched facilities near Shinjuku — filtered by emergency specialty + English support | `searchFacilities({specialty, location, language})` | ~0.4s | Google Maps Grounding |
| 5 | Generated polite Japanese script tailored to symptom + clinic context | Text generation (system prompt: "polite Japanese, medical context") | ~0.5s | Gemini 2.5 Flash |
| T1 | *(Transition — no AI call)* | — | — | — |
| 6 | Mapped health profile + symptom data to 問診票 template fields | `generateIntakeForm({profile, symptoms})` | ~0.3s | Gemini 2.5 Flash |
| T2 | *(Transition — no AI call)* | — | — | — |
| 7 | Cross-referenced Warfarin + Ciprofloxacin — flagged critical interaction | `checkDrugInteractions({currentMeds, newPrescription})` | ~0.4s | Gemini knowledge base (WHO interaction data in pre-training) |
| 8 | Extracted Japanese receipt fields via multimodal vision — returned structured JSON | Vision: `generateContent({image, prompt})` | ~0.8s | Gemini 2.5 Flash (multimodal) |

**Sidebar empty state**: For steps with "No AI call", the sidebar shows a muted message: "No AI call for this step — static content shown to user." It does NOT show an empty panel.

---

## Implementation Notes

### Phone Frame CSS Strategy
The phone frame is a CSS-only approximation — not photo-realistic:
```css
.phone-frame {
  width: 390px; height: 844px;
  border-radius: 48px;
  border: 8px solid #1a1a1a;
  background: #fff;
  box-shadow: 0 0 0 2px #333, 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
  position: relative;
}
.phone-notch {
  width: 120px; height: 30px;
  background: #1a1a1a;
  border-radius: 0 0 20px 20px;
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
```
The Dynamic Island is simplified to a black pill. No speaker grille, no camera dot. Clean and recognizable without being a CSS nightmare.

### Scrollable Content
Each app screen container inside the phone frame has `overflow-y: auto` and `height: 100%`. Screens with long content (S4: clinic cards, S6: intake form) scroll naturally. The phone frame itself never scrolls.

### Mock Receipt (Screen 8)
Purely CSS — no image file needed:
```html
<div class="receipt-mock">
  <div class="receipt-header">St. Luke's International Hospital</div>
  <div class="receipt-stamp">㊞</div>
  <div class="receipt-items">
    <div class="receipt-row"><span>診察料</span><span>¥5,000</span></div>
    <div class="receipt-row"><span>血液検査</span><span>¥8,000</span></div>
    <div class="receipt-row"><span>心電図</span><span>¥3,000</span></div>
  </div>
  <div class="receipt-total"><span>合計</span><span>¥16,000</span></div>
</div>
```
Styled with a slightly off-white background (`#fafaf5`), monospace font for Japanese text, and a dashed border at top/bottom (like a real Japanese receipt).

### Toast Notification
A small fixed-position banner at the top of the phone screen. Slides down, shows for 2s, slides up. Used for: "PDF generated" and "Claim form generated". Uses `transform: translateY` with CSS transition — no JS animation.

---

## Stretch Goals (if time)

- Swipe gestures on mobile (touchstart/touchend detection with min 50px horizontal drag)
- Slide transition between screens (translateX slide left/right instead of fade)
- Keyboard shortcut `T` to toggle tech sidebar
- "Share" button that copies the page URL
- Progressive web app manifest for "Add to Home Screen" on mobile
