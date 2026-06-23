# MediRoute Mock — Material 3 Redesign Spec

**Date:** 2026-06-23 | **Version:** 4.0 (M3 redesign)
**Type:** Single static HTML file redesign

## Goal

Redesign the existing 15-path interactive prototype (`mediroute-mock.html`) from the current Taste-v1 aesthetic (teal primary, frosted glass, warm off-white, bento grid) to a **Material 3 Google-native** design — maximizing the Google/Gemini hackathon signal for judges.

## Design Read

- **Page kind:** Mobile app prototype (phone frame)
- **Audience:** Hackathon judges (Google/Gemini event)
- **Vibe:** Material 3 Google-native — clean, trustworthy, component-driven
- **Dials:** `VARIANCE: 5` / `MOTION: 5` / `DENSITY: 4`

## Design System

### Color — M3 Token Map

| Token | Hex | Role |
|---|---|---|
| Primary | `#1A73E8` | CTAs, FABs, active states, links |
| On Primary | `#FFFFFF` | Text/icons on primary |
| Primary Container | `#D3E3FD` | Tonal offset for selected states, chips |
| On Primary Container | `#041E49` | Text on primary container |
| Error | `#EA4335` | Severity 1, Emergency 119, destructive actions |
| Error Container | `#FCE8E6` | Severity alert backgrounds |
| On Error | `#FFFFFF` | Text on error buttons |
| Tertiary | `#00897B` | Translation category accent |
| Tertiary Container | `#B2DFDB` | Translation category backgrounds |
| Surface | `#FFFBFE` | Card, phone, app bar backgrounds |
| Surface Container | `#F0F4F9` | Elevated/variant surfaces, search bar fill |
| On Surface | `#1F1F1F` | Primary text |
| On Surface Variant | `#5F6368` | Secondary text, captions |
| Outline | `#C4C7C5` | Borders, dividers |
| Outline Variant | `#E2E2E2` | Subtle separators |
| Success | `#137333` | Positive indicators, cost reassurance |
| Success Container | `#E6F4EA` | Success background cards |
| Warning | `#FBBC04` | Severity 2-3, drug interactions |
| Warning Container | `#FEF7E0` | Warning background cards |

### Typography

**Strategy:** Roboto Flex everywhere (weight hierarchy) — the authentic Google product look. No separate display face.

| Token | Size / Line | Weight | Letter | Use |
|---|---|---|---|---|
| Display Small | 36/44px | 400 | -0.25px | Hub greeting |
| Headline Medium | 28/36px | 400 | 0 | Screen titles |
| Title Large | 22/28px | 500 | 0 | Card titles, section headers |
| Title Medium | 16/24px | 500 | 0.15px | Card headers, chat names |
| Body Large | 16/24px | 400 | 0.5px | Chat bubbles, descriptions |
| Body Medium | 14/20px | 400 | 0.25px | Card body, list items |
| Body Small | 12/16px | 400 | 0.4px | Captions, meta, timestamps |
| Label Large | 14/20px | 500 | 0.5px | Button labels, nav items |
| Label Medium | 12/16px | 500 | 0.5px | Chips, badges |
| Label Small | 11/16px | 500 | 0.5px | Overline, step indicator |

**Font stack:** `'Roboto Flex', 'DM Sans', sans-serif`

**Mono stack:** `'JetBrains Mono', 'Roboto Mono', monospace` — for prescription docs, code sidebar.

### Icons

Phosphor Icons — already loaded, keep. Google-neutral, clean.

### Elevation / Shadows (M3)

| Level | Box Shadow | Use |
|---|---|---|
| 0 | `none` | Surface (flat) |
| 1 | `0 1px 2px rgba(0,0,0,0.08), 0 1px 3px 1px rgba(0,0,0,0.04)` | Elevated cards |
| 2 | `0 1px 2px rgba(0,0,0,0.08), 0 2px 6px 2px rgba(0,0,0,0.04)` | Top app bar (scrolled), FAB |
| 3 | `0 4px 8px 3px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)` | Dialogs/modals (future) |

### Shape / Corner Radius (M3)

| Context | Radius | Token |
|---|---|---|
| Small components (chips, badges) | `8px` | `--radius-sm` |
| Cards, sheets | `12px` | `--radius-md` |
| FAB, large cards | `16px` | `--radius-lg` |
| Full-width buttons, input fields | `28px` (pill) | `--radius-xl` |
| Phone frame (outer) | `48px` | unchanged |

### Motion (M3 Easing)

```
Standard easing: cubic-bezier(0.2, 0.0, 0, 1.0)
Emphasized easing: cubic-bezier(0.2, 0.0, 0, 1.0) — M3 default
Duration: 300ms enter, 250ms exit
```

| Transition | Spec |
|---|---|
| Screen enter | opacity 0→1 + translateY(20px→0), 300ms, standard easing |
| Screen exit | opacity 1→0 + translateY(0→-20px), 250ms, standard easing |
| FAB pulse (emergency) | scale 1→1.05→1, 2s loop, emphasized easing |
| Card stagger enter | opacity + translateY(12px→0), 50ms cascade per card |
| Linear progress | indeterminate, primary color |
| Ripple effect | ::after pseudo-element, scale 0→1, 400ms, standard easing |

---

## Layout & Component Overhaul

### 1. Top App Bar → M3 Small Top App Bar

**From:** Frosted glass, backdrop-blur(20px), sticky
**To:** Solid M3 Surface `#FFFBFE`, flat (elevation 0) at rest, elevation 2 on scroll. Height: `64px`. Logo left-aligned. Step indicator trailing. No blur — Google apps don't blur.

**Structure:**
```
┌──────────────────────────────────────────┐
│  ← MediRoute                  Step 3/8  │  ← 64px, Surface #FFFBFE
├──────────────────────────────────────────┤
│  ━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░  │  ← M3 linear progress indicator (when needed)
```

### 2. Hub Home Screen — Full Redesign

**From:** Bento grid (2×2 asymmetric tiles, expand `+` buttons), red 119 button top-right, quick action pills
**To:** M3 layout with FAB

```
┌──────────────────────────────────┐
│                                  │
│  Good morning                    │  ← Display Small, Roboto Flex 400
│  MediRoute                      │  ← Headline Medium
│  Your AI medical companion       │  ← Body Medium, On Surface Variant
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🔍  Search symptoms...   │   │  ← M3 Search Bar, Surface Container fill
│  └──────────────────────────┘   │
│                                  │
│  ┌────────┐  ┌────────┐        │
│  │ 🚨    │  │ 🏥    │        │  ← M3 Elevated Card (level 1)
│  │Emergcy│  │ Clinic │        │     icon + Title Large + 1-line desc
│  └────────┘  └────────┘        │
│  ┌────────┐  ┌────────┐        │
│  │ 💊    │  │ 🗣️    │        │
│  │ Rx     │  │Transl. │        │
│  └────────┘  └────────┘        │
│                                  │
│  Recent                          │
│  ┌──────────────────────────┐   │  ← M3 List Items
│  │ 🕐  Chest Pain · 2m ago →│   │     leading icon, trailing time
│  │ 🕐  Fever · 15m ago    →│   │
│  │ 🕐  Drug Check · 1h ago →│   │
│  └──────────────────────────┘   │
│                           [🚑]  │  ← FAB, 56px, Error #EA4335, bottom-right
└──────────────────────────────────┘
```

### 3. Navigation Bar → M3 Bottom Navigation

**From:** Sticky bar with Back/Next buttons + progress dots
**To:** M3 Navigation Bar with destination icons. Back/Next move to top app bar.

```
┌──────────────────────────────────┐
│  [🏠]    [🗺️]    [🕐]    [⚙️]  │  ← 80px, 3-4 destinations
│  Home    Routes  History Settings│     icon + label
└──────────────────────────────────┘
```

Within a route, top bar shows **← Back** icon button + current step label. Progress dots replaced with **M3 linear progress indicator**.

### 4. Chat Triage Screens

**From:** Teal-bordered header, teal user bubbles, surface-variant assistant bubbles
**To:** M3 chat pattern

```
┌──────────────────────────────────┐
│ ←  Symptom Triage               │  ← M3 Small Top App Bar
│                                  │
│  ┌──────────────────────┐       │
│  │ I'm having chest     │       │  ← User: Primary Container #D3E3FD
│  │ pain right now       │       │     text On Primary Container #041E49
│  │                12:03 │       │     16px corner radius
│  └──────────────────────┘       │
│                                  │
│  ┌──────────────────────┐       │
│  │ I understand — this  │       │  ← Assistant: Surface #FFFBFE
│  │ could be serious.    │       │     Outline border
│  │                12:03 │       │
│  └──────────────────────┘       │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Type your response...    ▶│   │  ← M3 Outlined Text Field + Icon Button
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

### 5. Button System → M3 Hierarchy

| Context | M3 Component | Style |
|---|---|---|
| Primary action (e.g., "Call 119", "Book Now") | Filled Button | `56px` tall, full-width, Primary `#1A73E8` + white text |
| Emergency action | Filled Button (Error) | `56px` tall, Error `#EA4335` + white text |
| Secondary (e.g., "View Details") | Outlined Button | `40px` tall, Outline border, On Surface text |
| Text action (e.g., "Skip", "Learn more") | Text Button | `40px` tall, Primary text, no background |
| Emergency context | FAB | `56px` circle, Error `#EA4335`, bottom-right, elevation 2 |

**CSS for M3 filled button:**
```css
.m3-btn-filled {
  height: 56px; padding: 0 24px;
  background: var(--m3-primary); color: var(--m3-on-primary);
  border: none; border-radius: var(--radius-xl);
  font: 500 14px/20px var(--font-body);
  cursor: pointer; transition: box-shadow 200ms var(--m3-easing);
  box-shadow: var(--m3-elevation-1);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.m3-btn-filled:hover { box-shadow: var(--m3-elevation-2); }
.m3-btn-filled:active { box-shadow: var(--m3-elevation-1); }
```

### 6. Severity / Alert Screens

**From:** Bordered error card with badge
**To:** M3 filled tonal cards

```
┌──────────────────────────────────┐
│  ┌────────────────────────────┐  │
│  │  ⚠️  URGENT — Severity 1  │  │  ← Error Container #FCE8E6 background
│  │                            │  │
│  │  This sounds like it could │  │
│  │  be a heart attack. Please │  │
│  │  call emergency services   │  │
│  │  immediately.              │  │
│  │                            │  │
│  │  🚨 Call 119              │  │  ← M3 Filled Button (Error)
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  ✅  Ambulance transport   │  │  ← Success Container #E6F4EA
│  │  is free in Japan          │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### 7. Cards & Lists → M3 Elevation

**From:** Surface-variant `#F3F2F0` cards with `#E6E5E3` border
**To:** M3 elevated cards with tinted shadows

```css
.m3-card {
  background: var(--m3-surface); border-radius: 12px;
  padding: 16px; box-shadow: var(--m3-elevation-1);
}
.m3-card.selected {
  outline: 2px solid var(--m3-primary);
  outline-offset: -2px;
}
```

**List items:**
```css
.m3-list-item {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 16px; min-height: 56px;
  background: var(--m3-surface);
}
.m3-list-item .leading { /* icon or avatar, 24-40px */ }
.m3-list-item .content { flex: 1; /* headline + supporting text */ }
.m3-list-item .trailing { /* icon, time, badge */ }
```

### 8. Assist Chips (Badges, Category Tags)

```css
.m3-chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 16px; height: 32px;
  border: 1px solid var(--m3-outline); border-radius: 8px;
  font: 500 12px/16px var(--font-body);
  color: var(--m3-on-surface);
  background: transparent;
}
.m3-chip.error {
  background: var(--m3-error-container);
  color: var(--m3-error);
  border-color: transparent;
}
```

### 9. Progress & Loading → M3 Patterns

| Context | M3 Component |
|---|---|
| Screen-level progress | Linear progress indicator (primary, 4px, below top bar) |
| Card loading | Skeleton loader — Surface Container `#F0F4F9` pulsing, matching card corners |
| Pharmacy match | M3 circular progress + body text |
| Booking call | 3-step: dialing → speaking → confirmed. Each step animates in with stagger |

### 10. Translation Screens

```
┌──────────────────────────────────┐
│  ┌────────────────────────────┐  │
│  │  JA: 頭が痛いです          │  │  ← Surface Container #F0F4F9
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  EN: I have a headache     │  │  ← Primary Container #D3E3FD
│  └────────────────────────────┘  │
│                                  │
│  Common phrases:                 │
│  ┌──────────────────────────┐   │
│  │ 🗣️  胸が痛いです     ▶  │   │  ← M3 list items, trailing play
│  │     I have chest pain      │   │
│  │ 🗣️  熱があります       ▶  │   │
│  │     I have a fever         │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

---

## What Stays Unchanged

- All **15 routes** — same paths, same screen steps, same logic
- All **keyboard shortcuts** — `1-5`, `← →`, `H`, `R`, `Shift+R`
- **localStorage** session persistence — survives refresh
- **Phosphor Icons** — keep (already loaded, Google-neutral)
- **Single-file architecture** — zero dependencies, no build step
- **Phone frame** — 390×700px device mock
- **CSS animation base** — CSS transitions only, no GSAP/scroll-jack
- **All JavaScript logic** — route state machine, session, chat triage trees, clinic picker, booking mock, scan mock, pharmacy match, drug interactions, claim generator

---

## Removals

| Current Element | Reason |
|---|---|
| `body::after` SVG grain texture | Google products don't use grain |
| `backdrop-filter: blur(20px)` on top bar & nav bar | M3 uses solid surfaces, not glass |
| Warm off-white `#FAF9F7` | → M3 Surface `#FFFBFE` |
| Teal `#0D9488` as primary | → Google Blue `#1A73E8` |
| Bento grid with expand `+` buttons | → M3 elevated cards, direct navigation |
| Outfit display font | → Roboto Flex weight hierarchy |
| Tinted teal shadows | → M3 standard elevation shadows |

---

## CSS Variable Map (Old → New)

```
--primary: #0D9488        →  --m3-primary: #1A73E8
--primary-hover: #0F766E  →  (removed, use elevation on hover)
--error: #DC2626           →  --m3-error: #EA4335
--warning: #D97706         →  --m3-warning: #FBBC04
--surface: #FFFFFF         →  --m3-surface: #FFFBFE
--surface-variant: #F3F2F0 → --m3-surface-container: #F0F4F9
--on-surface: #1D1D1F      →  --m3-on-surface: #1F1F1F
--on-surface-variant: #6B6B73 → --m3-on-surface-variant: #5F6368
--outline: #E6E5E3         →  --m3-outline: #C4C7C5
--font-display: 'Outfit'   →  (removed, use Roboto Flex weights)
--font-body: 'DM Sans'     →  --font-body: 'Roboto Flex'
--shadow-card / --shadow-elevated → --m3-elevation-1 / -2 / -3
--transition-fast: 180ms   →  --m3-duration-short: 250ms
--transition-normal: 280ms →  --m3-duration-medium: 300ms
cubic-bezier(0.16,1,0.3,1) → cubic-bezier(0.2, 0.0, 0, 1.0) — M3 standard
--radius-sm/md/lg/xl       →  keep but recalibrate (8/12/16/28)
```

---

## Gap Audit Resolution (2026-06-23)

Findings from spec-vs-implementation audit. Addressed inline below.

---

## Complete CSS Class Migration Map

Every JS-referenced CSS class in the current mock → M3 replacement.

### Structural Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `body` background `#FAF9F7` | `#FFFBFE` | M3 Surface |
| `body::after` grain overlay | **removed** | Google doesn't use grain |
| `.top-bar` | `.m3-top-app-bar` | 64px, solid Surface, elevation scroll |
| `.top-bar-left` | `.m3-top-app-bar .leading` | |
| `.top-bar-right` | `.m3-top-app-bar .trailing` | |
| `.logo` | `.m3-top-app-bar .logo` | |
| `.lang-toggle` | `.m3-icon-button` in trailing slot | globe icon button |
| `.tech-toggle` | `.m3-icon-button` in trailing slot | code icon button |
| `.step-indicator` | `.m3-step-indicator` | Label Small style |
| `.nav-bar` | `.m3-bottom-bar` | Keep Back/Next, add Home icon. See section below. |
| `.nav-btn` | `.m3-nav-btn` | M3 text button style |
| `.nav-label` | stays | |
| `.progress-dots` | `.m3-progress-bar` | Linear progress, 4px, primary |
| `.progress-dot` | **removed** | Replaced by linear bar |
| `.tech-sidebar` | `.m3-sidebar` | M3 surface, see below |
| `.sidebar-*` | `.m3-sidebar-*` | Prefix rename |
| `.toast` | `.m3-snackbar` | M3 snackbar style |

### Screen & Layout Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.screen` | `.m3-screen` | Base screen padding |
| `.screen-chat` | `.m3-screen-chat` | |
| `.screen-triage` | `.m3-screen-triage` | |
| `.screen-info` | `.m3-screen-info` | |
| `.screen-clinics` | `.m3-screen-clinics` | |
| `.screen-script` | `.m3-screen-script` | |
| `.screen-form` | `.m3-screen-form` | |
| `.screen-receipt` | `.m3-screen-receipt` | |
| `.screen-transition` | `.m3-screen-transition` | |
| `.screen-interaction` | `.m3-screen-interaction` | |
| `.screen-header` | `.m3-headline` | Headline Medium, left-aligned |
| `.screen-subtitle` | `.m3-subtitle` | Body Medium, On Surface Variant |
| `.main-content` | keep | Layout unchanged |
| `.phone-wrapper` | keep | |
| `.phone-frame` | keep | |
| `.phone-notch` | keep | |
| `.phone-screen` | keep | |

### Chat Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.chat-header` | `.m3-chat-header` | M3 top app bar small |
| `.chat-messages` | `.m3-chat-messages` | |
| `.chat-bubble` | `.m3-chat-bubble` | Base bubble |
| `.chat-bubble-user` | `.m3-chat-bubble--user` | Primary Container bg |
| `.chat-bubble-assistant` | `.m3-chat-bubble--assistant` | Surface bg + outline |
| `.chat-time` | `.m3-chat-time` | Body Small |
| `.chat-input-bar` | `.m3-chat-input` | |
| `.chat-input-bar input` | `.m3-outlined-text-field` | M3 text field |
| `.chat-input-bar button` | `.m3-icon-button` | Send icon |
| `.chat-options` | `.m3-chat-options` | |
| `.chat-option` | `.m3-chip--choice` | M3 choice chips |
| `.chat-option-type` | `.m3-chip--choice .type` | |
| `.verdict-card` | `.m3-card--verdict` | Filled tonal card |
| `.verdict-header` | `.m3-card--verdict .header` | |
| `.verdict-confidence` | `.m3-card--verdict .confidence` | |
| `.verdict-action` | `.m3-chip--assist` | Assist chip for action |
| `.chat-history-summary` | `.m3-card--summary` | Tonal card, primary container bg |
| `.typing-dots` | `.m3-typing-dots` | Keep animation, restyle |

### Card & List Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.info-grid` | `.m3-grid` | 2-col grid |
| `.info-card` | `.m3-card` | M3 elevated card |
| `.info-card h4` | `.m3-card .title` | Title Medium |
| `.info-card p` | `.m3-card .body` | Body Small |
| `.clinic-list` | `.m3-list` | |
| `.clinic-card` | `.m3-list-item--card` | Elevated card variant |
| `.clinic-card.selected` | `.m3-list-item--card.selected` | Primary outline |
| `.clinic-card-top` | `.m3-list-item--card .top` | |
| `.clinic-card-top h4` | `.m3-list-item--card .title` | |
| `.badge` | `.m3-chip--assist` | |
| `.badge-emergency` | `.m3-chip--assist.error` | Error variant |
| `.badge-internal` | `.m3-chip--assist` | Primary variant |
| `.badge-lang` | `.m3-chip--assist.tertiary` | Tertiary variant |
| `.clinic-meta` | `.m3-list-item--card .meta` | |
| `.clinic-detail-card` | `.m3-card--detail` | |
| `.clinic-detail-row` | `.m3-card--detail .row` | |
| `.detail-label` | `.m3-label` | Label Small |
| `.detail-value` | `.m3-value` | Body Medium bold |

### Severity & Alert Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.severity-card` | `.m3-card--tonal` | Filled tonal card |
| `.severity-badge` | `.m3-chip--assist.error` | Error assist chip |
| `.severity-reasoning` | `.m3-card--tonal .body` | Body Medium |
| `.route-label` | `.m3-chip--assist` | Route indicator chip |
| `.btn-119` | `.m3-btn-filled.error` | Error filled button |
| `.cost-reassurance` | `.m3-card--tonal.success` | Success tonal card |
| `.emergency-call-header` | `.m3-card--tonal.error` | |
| `.ec-status` | `.m3-headline` error color | |
| `.ec-timer` | `.m3-timer` | Mono, error color |
| `.ec-progress` | `.m3-progress-steps` | |
| `.ec-step` | `.m3-progress-step` | |
| `.ec-step.active` | `.m3-progress-step.active` | |
| `.ec-instructions` | `.m3-card` elevated | |

### Button Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.btn-primary` | `.m3-btn-filled` | Primary filled button |
| `.btn-secondary` | `.m3-btn-outlined` | Outlined button |
| `.btn-select` | `.m3-btn-outlined.small` | Small outlined |
| `.btn-call` | `.m3-btn-filled` | |
| `.btn-scan` | `.m3-btn-outlined.dashed` | Dashed border scan button |
| `.btn-119.pulsing` | `.m3-btn-filled.error.pulse` | Pulsing error button |
| `.hub-emergency-cta` | `.m3-fab` | FAB, see section below |

### Form Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.intake-form-card` | `.m3-card--form` | |
| `.intake-row` | `.m3-form-row` | |
| `.intake-row-header` | `.m3-form-row.header` | |
| `.intake-col-jp` | `.m3-form-col--jp` | |
| `.intake-col-en` | `.m3-form-col--en` | |
| `.field-label` | `.m3-label` | Label Small |
| `.field-value` | `.m3-value` | Body Medium |
| `.form-tip` | `.m3-assistive-text` | Body Small, On Surface Variant |
| `.ins-form` | `.m3-form` | |
| `.ins-field` | `.m3-form-field` | |
| `.ins-label` | `.m3-label` | |
| `.ins-select` | `.m3-outlined-select` | |
| `.ins-input` | `.m3-outlined-text-field` | |
| `.ins-result` | `.m3-card--tonal.success` | |
| `.ins-result-header` | `.m3-card--tonal .header` | |
| `.ins-coverage-item` | `.m3-coverage-row` | |
| `.cost-card` | `.m3-card` | |
| `.cost-card.uncovered` | `.m3-card.error-outline` | |
| `.cost-status` | `.m3-status-text` | |
| `.covered-text` | `.m3-status-text.success` | |
| `.uncovered-text` | `.m3-status-text.error` | |

### Medication & Prescription Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.rx-document` | `.m3-card--rx` | M3 surface card, mono text |
| `.rx-doc-header` | `.m3-card--rx .header` | |
| `.rx-doc-title` | `.m3-card--rx .title` | |
| `.rx-doc-meta` | `.m3-card--rx .meta` | |
| `.rx-meta-row` | `.m3-card--rx .meta-row` | |
| `.rx-meds-list` | `.m3-list` | |
| `.rx-med-item` | `.m3-list-item` | |
| `.rx-med-top` | `.m3-list-item .top` | |
| `.rx-med-num` | `.m3-chip--circle` | Numbered circle |
| `.rx-med-info` | `.m3-list-item .content` | |
| `.rx-med-name` | `.m3-list-item .headline` | |
| `.rx-med-en` | `.m3-list-item .supporting` | |
| `.rx-med-qty` | `.m3-list-item .trailing` | |
| `.rx-med-detail` | `.m3-card--tonal` | Detail panel |
| `.rx-detail-row` | `.m3-detail-row` | |
| `.rx-doc-footer` | `.m3-card--rx .footer` | Warning container bg |

### Pharmacy & Pickup Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.rx-camera` | `.m3-card--camera` | Dark bg, scan area |
| `.rx-viewfinder` | `.m3-scan-viewfinder` | |
| `.rx-corners` | `.m3-scan-corners` | |
| `.rx-hint` | `.m3-scan-hint` | |
| `.rx-result` | `.m3-card` | |
| `.rx-drug-card` | `.m3-card--tonal.primary` | Primary container bg |
| `.rx-drug-icon` | `.m3-drug-icon` | |
| `.rx-drug-name` | `.m3-drug-name` | |
| `.rx-drug-detail` | `.m3-drug-detail` | |
| `.pharmacy-progress` | `.m3-progress-steps` | |
| `.pharmacy-step` | `.m3-progress-step` | |
| `.pharmacy-step.active` | `.m3-progress-step.active` | |
| `.pickup-code-card` | `.m3-card--tonal.primary` | Dashed border, primary |
| `.pickup-label` | `.m3-label` | |
| `.pickup-code` | `.m3-code-display` | Mono, large |
| `.pickup-drug` | `.m3-body` | |

### Translation Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.translate-mini` | `.m3-card--translate` | |
| `.translate-mini-header` | `.m3-card--translate .header` | |
| `.lt-mic-area` | `.m3-mic-area` | |
| `.lt-mic-btn` | `.m3-fab.small` | Small FAB, primary |
| `.lt-mic-btn.pulsing` | `.m3-fab.small.pulse` | |
| `.lt-mic-hint` | `.m3-assistive-text` | |
| `.lt-bubbles` | `.m3-translation-pair` | |
| `.lt-bubble` | `.m3-translation-bubble` | |
| `.lt-bubble-user` | `.m3-translation-bubble--user` | |
| `.lt-bubble-jp` | `.m3-translation-bubble--jp` | |

### Booking & Script Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.phone-call-bar` | `.m3-call-bar` | |
| `.phone-number` | `.m3-call-number` | |
| `.script-card` | `.m3-card` | |
| `.script-lang-label` | `.m3-label` | |
| `.script-text-jp` | `.m3-script-text` | |
| `.script-toggle` | `.m3-text-btn` | |
| `.script-text-romaji` | `.m3-script-romaji` | |
| `.script-divider` | `.m3-divider` | |
| `.script-text-en` | `.m3-script-en` | |
| `.script-tip` | `.m3-card--tonal.warning` | |
| `.booking-progress` | `.m3-progress-steps` | |
| `.booking-step` | `.m3-progress-step` | |
| `.booking-step.active` | `.m3-progress-step.active` | |
| `.booking-tips` | `.m3-card--tonal.warning` | |

### Receipt & Claim Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.receipt-mock` | `.m3-card--receipt` | |
| `.receipt-paper` | `.m3-receipt-paper` | |
| `.receipt-hospital` | `.m3-receipt-hospital` | |
| `.receipt-stamp` | `.m3-receipt-stamp` | |
| `.receipt-divider` | `.m3-receipt-divider` | |
| `.receipt-date` | `.m3-receipt-date` | |
| `.receipt-item` | `.m3-receipt-item` | |
| `.receipt-total` | `.m3-receipt-total` | |
| `.ocr-result` | `.m3-card` | |
| `.ocr-status` | `.m3-card--tonal.success` | |
| `.claim-summary` | `.m3-card` | |
| `.claim-row` | `.m3-claim-row` | |
| `.claim-total` | `.m3-claim-row.total` | |
| `.claim-form-card` | `.m3-card` | |
| `.claim-form-header` | `.m3-card .header` | |
| `.claim-section` | `.m3-card .section` | |
| `.claim-section-title` | `.m3-label` | |
| `.claim-field` | `.m3-claim-field` | |
| `.claim-total-field` | `.m3-claim-field.total` | |
| `.claim-actions` | `.m3-btn-group` | |

### Hub Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.hub-hero` | `.m3-hub-hero` | |
| `.hub-hero-text` | `.m3-hub-hero .text` | |
| `.hub-hero-greeting` | `.m3-display-small` | Overline or Display Small |
| `.hub-hero-title` | `.m3-headline-medium` | |
| `.hub-hero-sub` | `.m3-body-medium` | |
| `.hub-emergency-cta` | `.m3-fab` | **See FAB section below** |
| `.hub-search-app` | `.m3-search-bar` | M3 search bar |
| `.hub-section-title` | `.m3-label-large` | Section label |
| `.hub-bento` | `.m3-hub-grid` | 2×2 card grid |
| `.hub-bento-card` | `.m3-card--hub` | Elevated card, tap to navigate |
| `.hub-bento-card.wide` | `.m3-card--hub.wide` | Full-width variant |
| `.hub-bento-icon` | `.m3-card--hub .icon` | |
| `.hub-bento-label` | `.m3-card--hub .title` | |
| `.hub-bento-count` | `.m3-card--hub .count` | |
| `.hub-bento-subtitle` | `.m3-card--hub .subtitle` | |
| `.hub-bento-expand` | **removed** | No expand pattern, tap navigates directly |
| `.hub-bento-subs` | **removed** | Sub-routes shown in route list instead |
| `.hub-bento-subitem` | **removed** | |
| `.hub-quick-actions` | `.m3-chip-row` | Horizontal chip scroll |
| `.hub-quick-btn` | `.m3-chip--assist` | Assist chip for quick actions |
| `.hub-recent-section` | `.m3-section` | |
| `.hub-recent-item` | `.m3-list-item` | |
| `.hub-recent-item-label` | `.m3-list-item .headline` | |
| `.hub-recent-item-time` | `.m3-list-item .trailing` | |
| `.hub-footer-action` | `.m3-text-btn` | |
| `.hub-chip` | `.m3-chip--filter` | Filter chip for shortcuts |

### Utility Classes

| Old Class | New M3 Class | Notes |
|---|---|---|
| `.skeleton` | `.m3-skeleton` | M3 shimmer, Surface Container bg |
| `.skeleton-text` | `.m3-skeleton--text` | |
| `.skeleton-text.short` | `.m3-skeleton--text.short` | |
| `.skeleton-card` | `.m3-skeleton--card` | |
| `.skeleton-circle` | `.m3-skeleton--circle` | |
| `.skeleton-chip` | `.m3-skeleton--chip` | |
| `.citation` | `.m3-citation` | Body Small, muted |
| `.disclaimer` | `.m3-disclaimer` | Body Small, italic, muted |
| `.confirm-label` | `.m3-label` | |
| `.confirm-detail` | `.m3-body` | |
| `.cost-amount` | `.m3-cost` | Mono, bold |
| `.interaction-card` | `.m3-card--tonal.warning` | |
| `.interaction-card.interaction-critical` | `.m3-card--tonal.error` | |
| `.interaction-header` | `.m3-card--tonal .header` | |
| `.interaction-summary` | `.m3-card--tonal .summary` | |
| `.interaction-detail` | `.m3-card--tonal .body` | |
| `.severity-bar` | `.m3-progress-linear` | |
| `.severity-fill` | `.m3-progress-linear .fill` | |
| `.severity-fill.critical` | `.m3-progress-linear .fill.error` | |
| `.suggested-question` | `.m3-card--outlined` | |
| `.suggested-question h4` | `.m3-card--outlined .title` | |
| `.question-en` | `.m3-question-en` | |
| `.question-jp` | `.m3-question-jp` | |
| `.insurance-cover-card` | `.m3-card` | |
| `.insurance-cover-header` | `.m3-card .header` | |
| `.insurance-cover-grid` | `.m3-cover-grid` | |
| `.insurance-cover-item` | `.m3-cover-item` | |
| `.insurance-cover-item.yes` | `.m3-cover-item.success` | |
| `.insurance-cover-item.warn` | `.m3-cover-item.warning` | |
| `.no-insurance-card` | `.m3-card--tonal.warning` | |
| `.insurance-toggle-bar` | `.m3-toggle-bar` | |
| `.toggle-switch` | `.m3-toggle` | |
| `.toggle-btn` | `.m3-toggle-btn` | |
| `.toggle-btn.active` | `.m3-toggle-btn.active` | |
| `.intake-actions` | `.m3-btn-row` | |
| `.map-mock` | `.m3-map` | Keep gradient, restyle |
| `.map-grid` | `.m3-map .grid` | |
| `.map-pin` | `.m3-map .pin` | |
| `.map-label` | `.m3-map .label` | |
| `.route-map` | `.m3-route-map` | |
| `.route-start` | `.m3-route-start` | |
| `.route-end` | `.m3-route-end` | |
| `.route-line` | `.m3-route-line` | |
| `.scan-overlay` | `.m3-scan-overlay` | Dark bg, scan area |
| `.scan-viewfinder` | `.m3-scan-viewfinder` | |
| `.scan-corners` | `.m3-scan-corners` | |
| `.scan-text` | `.m3-scan-text` | |

---

## Navigation Bar Decision

**Decision: Keep Back/Next pattern, re-skin to M3. Do not add full tab bar.**

Rationale:
- The Back/Next + progress dots are the navigation mechanism for all 15 routes
- Adding a 4-tab bottom nav (Home, Routes, History, Settings) requires: a History view that doesn't exist, a Settings page that doesn't exist, and new JS tap handlers
- A full tab bar would cost ~50 lines of new JS and risk breaking route navigation
- For a hackathon demo, the simple Back/Next is clearer for judges walking through a linear flow

**M3 bottom bar design:**
```
┌──────────────────────────────────┐
│  [← Back]    ━━━━━░░░░░    [Next →]  │  ← 72px, Surface
└──────────────────────────────────┘
```
- Back/Next are M3 **text buttons** with icon + label
- Progress dots replaced with **M3 linear progress indicator** (4px, primary)
- Left-aligned "Back", right-aligned "Next", progress centered
- Back disabled on step 0 (M3 disabled state: 38% opacity)

---

## FAB Specification

**Decision: FAB on hub screen only, not a global element.**

The Emergency FAB appears only on the hub home screen — not on chat triage screens, not on result cards, not on end screens. This follows M3 FAB behavior: the FAB promotes the primary action on the current screen.

**Implementation:**
```css
.m3-fab {
  position: absolute; bottom: 24px; right: 24px;
  width: 56px; height: 56px; border-radius: 16px;
  background: var(--m3-error); color: var(--m3-on-error);
  box-shadow: var(--m3-elevation-2);
  border: none; cursor: pointer; z-index: 20;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  transition: box-shadow var(--m3-duration-medium) var(--m3-easing);
}
.m3-fab:hover { box-shadow: var(--m3-elevation-3); }
.m3-fab:active { box-shadow: var(--m3-elevation-1); }
.m3-fab.pulse { animation: fabPulse 2s var(--m3-easing) infinite; }
@keyframes fabPulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(234,67,53,0.3); }
  50% { box-shadow: 0 4px 24px rgba(234,67,53,0.55); }
}
```

The FAB is rendered inside the hub screen HTML, not in the global layout. JS: `onclick` navigates to the Emergency chest-pain triage route.

---

## Tech Sidebar — Keep & Re-skin

The "What Gemini did" sidebar is a key hackathon judge-facing feature. Keep it, but apply M3 tokens:
- Background: M3 Surface `#FFFBFE`
- Border: M3 Outline
- Typography: Roboto Flex + JetBrains Mono (code blocks)
- Class prefix: `.sidebar-*` → `.m3-sidebar-*`
- Toggle button: M3 outlined icon button in top app bar trailing slot

---

## Language Toggle — Keep & Restyle

The `🌐 EN` toggle stays. Placement: M3 icon button in top app bar trailing slot, with globe icon. Label shows current language code (`EN` / `JP`).

---

## Additional Token Mappings

| Old Variable | New Token | Value |
|---|---|---|
| `--emergency-subtle` | `--m3-error-container` | `#FCE8E6` |
| `--warning-subtle` | `--m3-warning-container` | `#FEF7E0` |
| `--accent-subtle` | `--m3-primary-container` | `#D3E3FD` |
| `--success` (color) | `--m3-success` | `#137333` |
| `--success-subtle` (bg) | `--m3-success-container` | `#E6F4EA` |
| `--shadow-xs` | `--m3-elevation-0` | `none` |
| `--shadow-sm` | `--m3-elevation-1` | |
| `--on-surface` (dark text) | `--m3-on-surface` | `#1F1F1F` |

---

## Mobile Responsive — Keep

The `@media (max-width: 767px)` block stays. Update class references to `.m3-*` equivalents. Phone frame collapses full-width on mobile.

---

## Print Stylesheet — Keep

The `@media print` block stays. Update selectors to `.m3-*` equivalents.

---

## Implementation Notes

1. **Complete CSS block refactor** — Replace the entire `<style>` section using the class mapping tables above. Every class referenced in JS gets an M3 definition.
2. **JavaScript class renames** — Find-and-replace all CSS class strings in JS `render` functions per the mapping tables. Function names, logic, routes, and state stay unchanged.
3. **New JS for FAB** — ~10 lines: render FAB inside hub screen, onclick → navigate to chest-pain route.
4. **New JS for progress bar** — Replace `renderProgressDots()` with a linear progress bar element. Width = `(currentStep / totalSteps) * 100%`.
5. **No other new JS** — No new screens, no new routes, no state changes.
6. **Font swap** — Replace Outfit + DM Sans CDN links with Roboto Flex. Keep JetBrains Mono for code areas.
7. **Test each category after refactor** — Emergency, Clinic, Medication, Translation, Cost/Admin. One category at a time.
