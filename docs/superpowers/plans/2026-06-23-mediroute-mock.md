# MediRoute Mock Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file interactive HTML prototype showing MediRoute's 10-step flow in a phone-frame simulator.

**Architecture:** Single `mediroute-mock.html` file. CSS in `<style>`, JS in `<script>`. All screen content is hardcoded as data objects. Navigation is state-driven: `currentStep` index (0–9) renders the corresponding screen via innerHTML swap. CSS transitions handle screen changes. No framework, no build tool, no API calls.

**Tech Stack:** Vanilla HTML/CSS/JS. Google Fonts CDN (DM Sans, Roboto, Roboto Mono). Phosphor Icons CDN.

## Global Constraints

- Single file: `mediroute-mock.html` — no sub-files, no imports beyond CDN `<link>` tags
- Pre-scripted: zero API calls, all responses hardcoded
- Light mode only
- Material 3 palette: primary `#1A73E8`, error `#EA4335`, warning `#FBBC04`, surface `#FFFFFF`/`#F8F9FA`, on-surface `#202124`, outline `#DADCE0`
- All screen content from spec v1.1

---

## File Structure

- **Create**: `mediroute-mock.html` — the entire application
- No other files created

---

### Task 1: HTML Scaffold + CSS Foundations

**Files:**
- Create: `mediroute-mock.html`

**Interfaces:**
- Produces: CSS custom properties, base styles, body layout, Google Fonts + Phosphor Icons CDN links. Opens blank page with correct fonts and dark top bar.

- [ ] **Step 1: Create file with full HTML5 boilerplate**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MediRoute — AI Medical Companion</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Roboto+Mono:wght@400;500&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
  <style>
    /* CSS goes here */
  </style>
</head>
<body>
  <!-- HTML goes here -->
  <script>
    // JS goes here
  </script>
</body>
</html>
```

- [ ] **Step 2: Add CSS reset + custom properties**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --primary: #1A73E8;
  --primary-hover: #1557B0;
  --error: #EA4335;
  --warning: #FBBC04;
  --surface: #FFFFFF;
  --surface-variant: #F8F9FA;
  --on-surface: #202124;
  --on-surface-variant: #5F6368;
  --outline: #DADCE0;
  --font-display: 'DM Sans', sans-serif;
  --font-body: 'Roboto', sans-serif;
  --font-mono: 'Roboto Mono', monospace;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}

body {
  font-family: var(--font-body);
  color: var(--on-surface);
  background: #F1F3F4;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 3: Verify — open in browser**
  - Open `mediroute-mock.html` in Chrome/Firefox
  - Expected: Blank page with gray background (`#F1F3F4`), no console errors
  - Check DevTools → Network: fonts and Phosphor icons loaded (200 status)

- [ ] **Step 4: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: HTML scaffold with CSS foundations"
```

---

### Task 2: Phone Frame + Layout Structure

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Consumes: CSS custom properties from Task 1
- Produces: `.top-bar`, `.phone-wrapper`, `.phone-frame`, `.phone-notch`, `.phone-screen`, `.nav-bar` elements. Phone frame visible and centered. Layout skeleton complete.

- [ ] **Step 1: Add body HTML structure**

```html
<!-- Top Bar -->
<header class="top-bar">
  <div class="top-bar-left">
    <span class="logo">MediRoute</span>
  </div>
  <div class="top-bar-right">
    <button class="lang-toggle" id="langToggle">🌐 EN</button>
    <span class="step-indicator" id="stepIndicator">Step 1/10</span>
    <button class="tech-toggle" id="techToggle" title="Toggle tech view">?</button>
  </div>
</header>

<!-- Main Content -->
<main class="main-content">
  <!-- Phone -->
  <div class="phone-wrapper">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen" id="phoneScreen">
        <!-- Screen content rendered here -->
      </div>
    </div>
  </div>

  <!-- Tech Sidebar -->
  <aside class="tech-sidebar" id="techSidebar">
    <div class="sidebar-header">
      <h3>What Gemini did</h3>
      <button class="sidebar-close" id="sidebarClose">&times;</button>
    </div>
    <div class="sidebar-body" id="sidebarBody">
      <!-- Per-step content -->
    </div>
  </aside>
</main>

<!-- Navigation Bar -->
<nav class="nav-bar">
  <button class="nav-btn" id="backBtn" disabled>
    <i class="ph ph-arrow-left"></i> <span class="nav-label">Back</span>
  </button>
  <div class="progress-dots" id="progressDots">
    <!-- 10 dots rendered by JS -->
  </div>
  <button class="nav-btn" id="nextBtn">
    <span class="nav-label">Next</span> <i class="ph ph-arrow-right"></i>
  </button>
</nav>
```

- [ ] **Step 2: Add layout CSS**

```css
/* Top Bar */
.top-bar {
  width: 100%; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--outline);
  position: sticky; top: 0; z-index: 100;
}
.top-bar-left { display: flex; align-items: center; gap: 12px; }
.logo {
  font-family: var(--font-display); font-weight: 700; font-size: 20px;
  color: var(--primary); letter-spacing: -0.02em;
}
.top-bar-right { display: flex; align-items: center; gap: 16px; }
.lang-toggle, .tech-toggle {
  background: none; border: 1px solid var(--outline); border-radius: var(--radius-sm);
  padding: 4px 10px; font-size: 13px; cursor: pointer; font-family: var(--font-body);
  color: var(--on-surface-variant); transition: background var(--transition-fast);
}
.lang-toggle:hover, .tech-toggle:hover { background: var(--surface-variant); }
.step-indicator {
  font-size: 13px; color: var(--on-surface-variant); font-family: var(--font-mono);
}

/* Main Content */
.main-content {
  flex: 1; display: flex; align-items: flex-start; justify-content: center;
  gap: 32px; padding: 32px 24px; max-width: 1100px; width: 100%;
}

/* Phone Frame */
.phone-wrapper {
  flex-shrink: 0;
}
.phone-frame {
  width: 390px; height: 700px;
  border-radius: 48px;
  border: 8px solid #1a1a1c;
  background: var(--surface);
  box-shadow: 0 0 0 2px #333, 0 20px 60px rgba(0,0,0,0.25);
  position: relative;
  overflow: hidden;
}
.phone-notch {
  width: 120px; height: 30px;
  background: #1a1a1c;
  border-radius: 0 0 20px 20px;
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
.phone-screen {
  width: 100%; height: 100%;
  overflow-y: auto;
  padding-top: 40px; /* clear the notch */
  background: var(--surface-variant);
  position: relative;
}

/* Tech Sidebar */
.tech-sidebar {
  width: 280px; flex-shrink: 0;
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--outline);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: none; /* hidden by default */
  max-height: 700px; overflow-y: auto;
}
.tech-sidebar.visible { display: block; }
.sidebar-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.sidebar-header h3 {
  font-family: var(--font-display); font-size: 16px; font-weight: 700;
}
.sidebar-close {
  background: none; border: none; font-size: 20px; cursor: pointer;
  color: var(--on-surface-variant);
}
.sidebar-body { font-size: 13px; line-height: 1.6; }

/* Navigation Bar */
.nav-bar {
  width: 100%; height: 72px;
  display: flex; align-items: center; justify-content: center;
  gap: 24px;
  padding: 0 24px;
  background: var(--surface);
  border-top: 1px solid var(--outline);
  position: sticky; bottom: 0; z-index: 100;
}
.nav-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px;
  background: var(--surface); border: 1px solid var(--outline);
  border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 14px; font-weight: 500;
  color: var(--on-surface); cursor: pointer;
  transition: all var(--transition-fast);
}
.nav-btn:hover:not(:disabled) { background: var(--surface-variant); border-color: var(--primary); }
.nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.nav-btn .ph { font-size: 16px; }
.progress-dots {
  display: flex; gap: 8px; align-items: center;
}
.progress-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--outline); cursor: pointer;
  transition: all var(--transition-fast);
}
.progress-dot.visited { background: var(--primary); opacity: 0.5; }
.progress-dot.current { background: var(--primary); opacity: 1; transform: scale(1.3); }
.progress-dot:not(.visited):not(.current) { cursor: default; }
```

- [ ] **Step 3: Add initial JS placeholder**

```html
<script>
  // State
  let currentStep = 0;
  const TOTAL_STEPS = 10;
  const visitedSteps = new Set([0]);
  let lang = 'en'; // 'en' | 'jp'
  let isTransitioning = false;

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    renderProgressDots();
    renderScreen(0);
    updateNavButtons();
    bindEvents();
  });
</script>
```

- [ ] **Step 4: Verify — open in browser**
  - Phone frame visible (dark bezel, rounded corners, notch)
  - Top bar shows MediRoute logo, 🌐 EN, Step 1/10, ? button
  - Back button disabled (grayed out), Next button active
  - Tech sidebar hidden
  - These are all CSS-only checks — JS renders nothing yet (screen empty)

- [ ] **Step 5: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: phone frame + layout structure"
```

---

### Task 3: Screen Data Objects

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Consumes: Phone screen element from Task 2
- Produces: `SCREENS` array in JS — 10 objects, each with `id`, `title`, `render()` function returning HTML string. No visible change in browser yet (data only).

- [ ] **Step 1: Define all 10 screen data objects**

Add inside the `<script>` tag, before the state variables:

```javascript
const SCREENS = [
  { // Screen 0: Symptom Input
    id: 'symptom-input',
    title: 'Symptom Input',
    render: () => `
      <div class="screen screen-chat">
        <div class="chat-header">MediRoute</div>
        <div class="chat-messages">
          <div class="chat-bubble chat-bubble-user">
            <p>I have chest pain and shortness of breath. It started about 30 minutes ago.</p>
            <span class="chat-time">10:32 AM</span>
          </div>
          <div class="chat-bubble chat-bubble-assistant typing">
            <div class="typing-dots"><span></span><span></span><span></span></div>
          </div>
        </div>
        <div class="chat-input-bar">
          <input type="text" placeholder="Describe your symptoms..." disabled>
          <button disabled><i class="ph ph-paper-plane-tilt"></i></button>
        </div>
      </div>
    `
  },
  { // Screen 1: Triage Result
    id: 'triage-result',
    title: 'Triage Result',
    render: () => `
      <div class="screen screen-triage">
        <div class="chat-bubble chat-bubble-assistant" style="margin-bottom: 16px;">
          <p>I've analyzed your symptoms. This requires immediate attention.</p>
        </div>
        <div class="severity-card severity-1">
          <div class="severity-badge">🚨 Severity 1 — Emergency</div>
          <h2>CALL 119 IMMEDIATELY</h2>
          <p class="severity-reasoning">Chest pain + difficulty breathing requires immediate emergency care</p>
          <div class="route-label">Route A: Call 119 now</div>
          <button class="btn-119 pulsing">
            <i class="ph ph-phone-call"></i> CALL 119
          </button>
          <div class="cost-reassurance">
            <i class="ph ph-check-circle" style="color: #34A853;"></i>
            <span>Ambulances in Japan are 100% FREE — don't hesitate to call.</span>
          </div>
        </div>
      </div>
    `
  },
  { // Screen 2: While You Wait
    id: 'while-you-wait',
    title: 'While You Wait',
    render: () => `
      <div class="screen screen-info">
        <div class="screen-header">🚑 Help is on the way</div>
        <p class="screen-subtitle">Here's what you need to know while you wait for the ambulance.</p>
        <div class="info-grid">
          <div class="info-card">
            <i class="ph ph-ambulance"></i>
            <h4>Ambulances are FREE</h4>
            <p>¥0 for everyone, including tourists. Source: FDMA</p>
          </div>
          <div class="info-card">
            <i class="ph ph-identification-badge"></i>
            <h4>At the hospital</h4>
            <p>Show your passport and insurance card. Emergency transport skips the ¥7,000–¥11,000 walk-in penalty.</p>
          </div>
          <div class="info-card">
            <i class="ph ph-translate"></i>
            <h4>Language support</h4>
            <p>Most ERs have interpreter tablets. Ask for "tsuyaku" (通訳).</p>
          </div>
          <div class="info-card">
            <i class="ph ph-warning-circle"></i>
            <h4>Don't skip the bill</h4>
            <p>Unpaid bills ≥¥10,000 → visa denial on re-entry. Always pay before leaving.</p>
          </div>
        </div>
      </div>
    `
  },
  { // Screen 3: Clinic Search
    id: 'clinic-search',
    title: 'Clinic Search',
    render: () => `
      <div class="screen screen-clinics">
        <div class="screen-header">Nearby Emergency Hospitals</div>
        <div class="map-mock">
          <div class="map-grid"></div>
          <div class="map-pin"></div>
          <span class="map-label">Google Maps Grounding — Shinjuku area</span>
        </div>
        <div class="clinic-list">
          <div class="clinic-card selected">
            <div class="clinic-card-top">
              <div>
                <h4>St. Luke's International Hospital</h4>
                <span class="badge badge-emergency">Emergency</span>
                <span class="badge badge-lang">🇬🇧 English</span>
              </div>
              <i class="ph ph-check-circle" style="color: var(--primary); font-size: 24px;"></i>
            </div>
            <div class="clinic-meta">
              <span><i class="ph ph-map-pin"></i> 1.2km</span>
              <span><i class="ph ph-clock"></i> Open 24h</span>
            </div>
          </div>
          <div class="clinic-card">
            <div class="clinic-card-top">
              <div>
                <h4>Tokyo Medical University Hospital</h4>
                <span class="badge badge-emergency">Emergency</span>
                <span class="badge badge-lang">🇬🇧 English available</span>
              </div>
              <button class="btn-select">Select</button>
            </div>
            <div class="clinic-meta">
              <span><i class="ph ph-map-pin"></i> 2.8km</span>
              <span><i class="ph ph-clock"></i> Open 24h</span>
            </div>
          </div>
          <div class="clinic-card">
            <div class="clinic-card-top">
              <div>
                <h4>JCHO Tokyo Yamate Medical Center</h4>
                <span class="badge badge-internal">Internal Medicine</span>
                <span class="badge badge-lang">🇯🇵 Japanese only</span>
              </div>
              <button class="btn-select">Select</button>
            </div>
            <div class="clinic-meta">
              <span><i class="ph ph-map-pin"></i> 3.5km</span>
              <span><i class="ph ph-clock"></i> Until 22:00</span>
            </div>
          </div>
        </div>
        <p class="citation">Source: Google Maps Grounding</p>
      </div>
    `
  },
  { // Screen 4: Booking Script
    id: 'booking-script',
    title: 'Booking Script',
    render: () => `
      <div class="screen screen-script">
        <div class="screen-header">St. Luke's International Hospital</div>
        <div class="phone-call-bar">
          <span class="phone-number">📞 03-5550-7120</span>
          <a href="tel:+81355507120" class="btn-call">
            <i class="ph ph-phone-call"></i> Call
          </a>
        </div>
        <div class="script-card" id="scriptCard">
          <div class="script-lang-label">🇯🇵 Japanese — show this to the receptionist</div>
          <p class="script-text-jp">こんにちは。胸の痛みと息苦しさがあります。30分前から症状があります。外国人です。日本語は話せません。</p>
          <div class="script-toggle" id="romajiToggle">
            <i class="ph ph-eye"></i> Show Romaji
          </div>
          <p class="script-text-romaji" id="romajiText" style="display:none;">
            Konnichiwa. Mune no itami to ikigurushisa ga arimasu. Sanjuppun mae kara shoujou ga arimasu. Gaikokujin desu. Nihongo wa hanasemasen.
          </p>
          <div class="script-divider"></div>
          <p class="script-text-en">Hello. I have chest pain and difficulty breathing. Symptoms started 30 minutes ago. I'm a foreigner. I don't speak Japanese.</p>
        </div>
        <p class="script-tip">💡 Screen brightness up — make it easy for the receptionist to read</p>
      </div>
    `
  },
  { // Screen 5: Arrival Transition
    id: 'arrival-transition',
    title: 'Arrival',
    isTransition: true,
    render: () => `
      <div class="screen screen-transition">
        <div class="transition-icon">🏥</div>
        <h2>You've arrived at St. Luke's International Hospital</h2>
        <p>The receptionist hands you a 問診票 (medical questionnaire). MediRoute has pre-filled it for you.</p>
      </div>
    `
  },
  { // Screen 6: Intake Form
    id: 'intake-form',
    title: 'Intake Form',
    render: () => `
      <div class="screen screen-form">
        <div class="screen-header">📋 問診票 — Medical Questionnaire</div>
        <div class="intake-form-card">
          <div class="intake-row intake-row-header">
            <div class="intake-col-jp">日本語</div>
            <div class="intake-col-en">English</div>
          </div>
          <div class="intake-row">
            <div class="intake-col-jp"><span class="field-label">名前</span> <span class="field-value">Alex Chen</span></div>
            <div class="intake-col-en"><span class="field-label">Name</span> <span class="field-value">Alex Chen</span></div>
          </div>
          <div class="intake-row">
            <div class="intake-col-jp"><span class="field-label">生年月日</span> <span class="field-value">1992年3月15日</span></div>
            <div class="intake-col-en"><span class="field-label">Date of Birth</span> <span class="field-value">1992-03-15</span></div>
          </div>
          <div class="intake-row">
            <div class="intake-col-jp"><span class="field-label">症状</span> <span class="field-value">胸の痛み、息切れ — 30分前から</span></div>
            <div class="intake-col-en"><span class="field-label">Symptoms</span> <span class="field-value">Chest pain, shortness of breath — 30 min</span></div>
          </div>
          <div class="intake-row">
            <div class="intake-col-jp"><span class="field-label">既往歴</span> <span class="field-value">なし</span></div>
            <div class="intake-col-en"><span class="field-label">Medical History</span> <span class="field-value">None</span></div>
          </div>
          <div class="intake-row">
            <div class="intake-col-jp"><span class="field-label">服用中の薬</span> <span class="field-value">ワルファリン</span></div>
            <div class="intake-col-en"><span class="field-label">Current Medications</span> <span class="field-value">Warfarin</span></div>
          </div>
          <div class="intake-row">
            <div class="intake-col-jp"><span class="field-label">アレルギー</span> <span class="field-value">なし</span></div>
            <div class="intake-col-en"><span class="field-label">Allergies</span> <span class="field-value">None</span></div>
          </div>
        </div>
        <button class="btn-primary btn-pdf" onclick="showToast('✅ PDF saved — show at reception')">
          <i class="ph ph-file-pdf"></i> Download PDF
        </button>
        <p class="form-tip">💡 Show the Japanese column to the doctor. Keep the English column for yourself.</p>
      </div>
    `
  },
  { // Screen 7: Prescription Transition
    id: 'prescription-transition',
    title: 'Prescription',
    isTransition: true,
    render: () => `
      <div class="screen screen-transition">
        <div class="transition-icon">💊</div>
        <h2>The doctor prescribed Ciprofloxacin</h2>
        <p>Let's check if it interacts with your current medications...</p>
      </div>
    `
  },
  { // Screen 8: Drug Interaction
    id: 'drug-interaction',
    title: 'Drug Interaction',
    render: () => `
      <div class="screen screen-interaction">
        <div class="interaction-card interaction-critical">
          <div class="interaction-header">
            <i class="ph ph-warning"></i>
            <span>CRITICAL INTERACTION</span>
          </div>
          <h3>Ciprofloxacin + Warfarin</h3>
          <p class="interaction-summary">Increased Bleeding Risk</p>
          <div class="severity-bar">
            <div class="severity-fill critical" style="width:85%"></div>
          </div>
          <p class="interaction-detail">Ciprofloxacin can increase the anticoagulant effect of Warfarin. INR should be monitored closely.</p>
          <div class="suggested-question">
            <h4>💬 Suggested question for your doctor</h4>
            <p class="question-en">"Should I have my INR monitored while taking this antibiotic?"</p>
            <p class="question-jp">「この抗生物質を服用中、INRをモニタリングすべきですか？」</p>
          </div>
          <p class="disclaimer">⚠️ AI-generated. Always confirm with your pharmacist or doctor.</p>
        </div>
      </div>
    `
  },
  { // Screen 9: Receipt OCR
    id: 'receipt-ocr',
    title: 'Receipt OCR',
    render: () => `
      <div class="screen screen-receipt">
        <div class="screen-header">📸 Receipt Scanner</div>
        <div class="receipt-mock">
          <div class="receipt-paper">
            <div class="receipt-hospital">St. Luke's International Hospital</div>
            <div class="receipt-stamp">㊞</div>
            <div class="receipt-divider">- - - - - - - - - - - - - - - -</div>
            <div class="receipt-date">2026年6月23日</div>
            <div class="receipt-item"><span>診察料</span><span>¥5,000</span></div>
            <div class="receipt-item"><span>血液検査</span><span>¥8,000</span></div>
            <div class="receipt-item"><span>心電図</span><span>¥3,000</span></div>
            <div class="receipt-divider">- - - - - - - - - - - - - - - -</div>
            <div class="receipt-total"><span>合計</span><span>¥16,000</span></div>
          </div>
        </div>
        <div class="ocr-result">
          <div class="ocr-status">✅ Receipt analyzed — 1 point = ¥10</div>
          <div class="claim-summary">
            <div class="claim-row"><span>Consultation</span><span>¥5,000</span></div>
            <div class="claim-row"><span>Blood Test</span><span>¥8,000</span></div>
            <div class="claim-row"><span>ECG</span><span>¥3,000</span></div>
            <div class="claim-row claim-total"><span>Total</span><span>¥16,000</span></div>
          </div>
          <button class="btn-primary" onclick="showToast('✅ Claim form generated')">
            <i class="ph ph-file-pdf"></i> Generate Claim PDF
          </button>
        </div>
      </div>
    `
  }
];
```

- [ ] **Step 2: Verify**
  - Open in browser. No visible change (SCREENS array exists but not rendered).
  - Open console → type `SCREENS.length` → should output `10`
  - Type `SCREENS[0].render()` → should output HTML string

- [ ] **Step 3: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: all 10 screen data objects defined"
```

---

### Task 4: Rendering Engine + Navigation

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Consumes: `SCREENS` array, DOM elements from Task 2
- Produces: `renderScreen()`, `navigateTo()`, `updateNavButtons()`, `renderProgressDots()`, `bindEvents()`. Screens render on click. Back/Next navigation works. Keyboard arrows work.

- [ ] **Step 1: Replace JS placeholder with full engine**

Replace the entire `<script>` block content:

```javascript
// ── State ──
let currentStep = 0;
const TOTAL_STEPS = 10;
const visitedSteps = new Set([0]);
let lang = 'en';
let isTransitioning = false;
let romajiVisible = false;

// ── Screen Rendering ──
function renderScreen(index) {
  const screen = SCREENS[index];
  const container = document.getElementById('phoneScreen');
  container.innerHTML = screen.render();

  // Auto-advance transition screens after 1.5s
  if (screen.isTransition && index < TOTAL_STEPS - 1) {
    setTimeout(() => {
      if (currentStep === index && !isTransitioning) {
        navigateTo(index + 1);
      }
    }, 1500);
  }

  // Bind romaji toggle if on booking script screen
  if (screen.id === 'booking-script') {
    const toggle = document.getElementById('romajiToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        romajiVisible = !romajiVisible;
        const romaji = document.getElementById('romajiText');
        if (romaji) romaji.style.display = romajiVisible ? 'block' : 'none';
        toggle.innerHTML = romajiVisible
          ? '<i class="ph ph-eye-slash"></i> Hide Romaji'
          : '<i class="ph ph-eye"></i> Show Romaji';
      });
    }
  }
}

// ── Navigation ──
function navigateTo(index) {
  if (isTransitioning) return;
  if (index === currentStep) return;
  if (index < 0 || index >= TOTAL_STEPS) return;

  isTransitioning = true;
  visitedSteps.add(index);

  const screen = document.getElementById('phoneScreen');

  // Exit animation
  screen.classList.add('screen-exit');

  setTimeout(() => {
    currentStep = index;
    renderScreen(index);
    updateNavButtons();
    renderProgressDots();
    updateStepIndicator();
    updateSidebar();

    // Enter animation
    screen.classList.remove('screen-exit');
    screen.classList.add('screen-enter');
    setTimeout(() => {
      screen.classList.remove('screen-enter');
      isTransitioning = false;
    }, 150);
  }, 150);
}

function updateNavButtons() {
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const nextLabel = nextBtn.querySelector('.nav-label');
  const backLabel = backBtn.querySelector('.nav-label');

  // Back button
  backBtn.disabled = currentStep === 0;

  // Next button
  if (currentStep === TOTAL_STEPS - 1) {
    nextLabel.textContent = lang === 'jp' ? '再スタート' : 'Restart';
    nextBtn.querySelector('i').className = 'ph ph-arrow-counter-clockwise';
  } else {
    nextLabel.textContent = lang === 'jp' ? '次へ' : 'Next';
    nextBtn.querySelector('i').className = 'ph ph-arrow-right';
  }
}

function updateStepIndicator() {
  document.getElementById('stepIndicator').textContent =
    `${lang === 'jp' ? 'ステップ' : 'Step'} ${currentStep + 1}/${TOTAL_STEPS}`;
}

function renderProgressDots() {
  const container = document.getElementById('progressDots');
  container.innerHTML = '';
  for (let i = 0; i < TOTAL_STEPS; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i === currentStep) dot.classList.add('current');
    else if (visitedSteps.has(i)) dot.classList.add('visited');
    if (visitedSteps.has(i)) {
      dot.addEventListener('click', () => navigateTo(i));
    }
    container.appendChild(dot);
  }
}

// ── Toast ──
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.getElementById('phoneScreen').appendChild(toast);

  setTimeout(() => toast.classList.add('toast-visible'), 10);
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ── Sidebar ──
function updateSidebar() {
  const screen = SCREENS[currentStep];
  const body = document.getElementById('sidebarBody');
  const sidebarData = SIDEBAR_DATA[currentStep];

  if (sidebarData) {
    body.innerHTML = sidebarData.render();
  } else {
    body.innerHTML = '<p class="sidebar-empty">No AI call for this step — static content shown to user.</p>';
  }
}

// ── Events ──
function bindEvents() {
  document.getElementById('backBtn').addEventListener('click', () => {
    if (currentStep > 0) navigateTo(currentStep - 1);
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentStep === TOTAL_STEPS - 1) {
      // Restart
      visitedSteps.clear();
      visitedSteps.add(0);
      currentStep = 0;
      renderScreen(0);
      updateNavButtons();
      renderProgressDots();
      updateStepIndicator();
      return;
    }
    navigateTo(currentStep + 1);
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentStep < TOTAL_STEPS - 1) navigateTo(currentStep + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentStep > 0) navigateTo(currentStep - 1);
    } else if (e.key === 'r' || e.key === 'R') {
      // Restart
      visitedSteps.clear();
      visitedSteps.add(0);
      currentStep = 0;
      renderScreen(0);
      updateNavButtons();
      renderProgressDots();
      updateStepIndicator();
    }
  });

  // Language toggle
  document.getElementById('langToggle').addEventListener('click', () => {
    lang = lang === 'en' ? 'jp' : 'en';
    document.getElementById('langToggle').textContent = lang === 'en' ? '🌐 EN' : '🌐 JP';
    updateNavButtons();
    updateStepIndicator();
  });

  // Tech toggle
  document.getElementById('techToggle').addEventListener('click', () => {
    const sidebar = document.getElementById('techSidebar');
    sidebar.classList.toggle('visible');
  });

  document.getElementById('sidebarClose').addEventListener('click', () => {
    document.getElementById('techSidebar').classList.remove('visible');
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderScreen(0);
  renderProgressDots();
  updateNavButtons();
  updateSidebar();
  bindEvents();
});
```

- [ ] **Step 2: Add transition + animation CSS**

```css
/* Screen Transitions */
.screen-exit {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 150ms ease, transform 150ms ease;
}
.screen-enter {
  opacity: 0;
  transform: translateY(10px);
  animation: screenEnter 150ms ease forwards;
}
@keyframes screenEnter {
  to { opacity: 1; transform: translateY(0); }
}

/* Toast */
.toast {
  position: fixed; top: 60px; left: 50%; transform: translateX(-50%) translateY(-20px);
  background: var(--on-surface); color: white;
  padding: 8px 16px; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500;
  opacity: 0; transition: all 300ms ease;
  z-index: 50; white-space: nowrap;
}
.toast-visible { opacity: 1; transform: translateX(-50%) translateY(0); }
```

- [ ] **Step 4: Verify navigation**

```bash
open mediroute-mock.html
```

Manual tests:
- Click "Next" → screen changes to Screen 2 (triage). Step indicator says 2/10.
- Click "Back" → returns to Screen 1. Back button disabled.
- Press → (right arrow) → moves forward
- Press ← (left arrow) → moves back
- Progress dots: click visited dot → jumps to that screen
- Click "Next" all the way to Screen 10 → button shows "Restart"
- Click "Restart" → returns to Screen 1, dots reset
- Open console: `SCREENS.length` → 10
- Rapid-click "Next" multiple times → no double-navigation (transition lock works)

- [ ] **Step 5: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: rendering engine + navigation with keyboard support"
```

---

### Task 5: Screen CSS — Chat, Triage, Info Cards

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Consumes: Screen data from Task 3, rendering engine from Task 4
- Produces: Complete CSS for screens 0–2 (chat UI, severity card, info grid). Screens 1-3 look polished.

- [ ] **Step 1: Add screen base + chat CSS**

Insert after the transition CSS from Task 4:

```css
/* ── Screen Base ── */
.screen {
  padding: 16px;
  min-height: 100%;
  display: flex; flex-direction: column;
}

/* ── Chat (Screen 0) ── */
.screen-chat {
  background: var(--surface);
  padding-bottom: 0;
}
.chat-header {
  padding: 12px 16px;
  font-family: var(--font-display); font-weight: 700; font-size: 16px;
  color: var(--primary); border-bottom: 1px solid var(--outline);
  text-align: center; background: var(--surface);
}
.chat-messages {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.chat-bubble {
  max-width: 85%; padding: 12px 14px; border-radius: var(--radius-lg);
  font-size: 14px; line-height: 1.5;
}
.chat-bubble-user {
  align-self: flex-end;
  background: var(--primary); color: white;
  border-bottom-right-radius: var(--radius-sm);
}
.chat-bubble-assistant {
  align-self: flex-start;
  background: var(--surface); color: var(--on-surface);
  border: 1px solid var(--outline);
  border-bottom-left-radius: var(--radius-sm);
}
.chat-time {
  display: block; font-size: 11px; opacity: 0.7; margin-top: 4px;
}
.typing-dots {
  display: flex; gap: 4px; padding: 4px 0;
}
.typing-dots span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--on-surface-variant);
  animation: typingBounce 1.4s infinite ease-in-out;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
.chat-input-bar {
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid var(--outline); background: var(--surface);
}
.chat-input-bar input {
  flex: 1; padding: 10px 14px;
  border: 1px solid var(--outline); border-radius: 20px;
  font-family: var(--font-body); font-size: 14px; outline: none;
  background: var(--surface-variant);
}
.chat-input-bar button {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--primary); border: none; color: white;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}

/* ── Triage (Screen 1) ── */
.screen-triage { padding: 16px; background: var(--surface); }
.severity-card {
  background: white; border: 2px solid var(--error);
  border-radius: var(--radius-lg); padding: 20px;
  text-align: center;
}
.severity-badge {
  display: inline-block; background: var(--error); color: white;
  padding: 6px 14px; border-radius: 20px; font-size: 13px;
  font-weight: 700; margin-bottom: 12px;
}
.severity-card h2 {
  font-family: var(--font-display); font-size: 22px; font-weight: 700;
  color: var(--error); margin-bottom: 8px;
}
.severity-reasoning {
  font-size: 13px; color: var(--on-surface-variant); margin-bottom: 12px;
  line-height: 1.5;
}
.route-label {
  display: inline-block; background: #FCE8E6; color: var(--error);
  padding: 4px 12px; border-radius: var(--radius-sm);
  font-size: 12px; font-weight: 700; margin-bottom: 16px;
}
.btn-119 {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 16px;
  background: var(--error); color: white; border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display); font-size: 18px; font-weight: 700;
  cursor: pointer; margin-bottom: 12px;
}
.btn-119.pulsing {
  animation: pulseGlow 2s ease-in-out infinite;
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(234,67,53,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(234,67,53,0); }
}
.cost-reassurance {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: #E6F4EA; border-radius: var(--radius-sm);
  font-size: 12px; color: #137333; text-align: left;
}

/* ── Info Grid (Screen 2) ── */
.screen-info { padding: 16px; background: var(--surface); gap: 16px; }
.screen-header {
  font-family: var(--font-display); font-size: 20px; font-weight: 700;
  text-align: center;
}
.screen-subtitle {
  font-size: 13px; color: var(--on-surface-variant);
  text-align: center; line-height: 1.5;
}
.info-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.info-card {
  background: var(--surface-variant); border-radius: var(--radius-md);
  padding: 14px; border: 1px solid var(--outline);
}
.info-card .ph {
  font-size: 22px; color: var(--primary); margin-bottom: 6px;
}
.info-card h4 {
  font-family: var(--font-display); font-size: 13px; font-weight: 700;
  margin-bottom: 4px;
}
.info-card p {
  font-size: 11px; color: var(--on-surface-variant); line-height: 1.4;
}
```

- [ ] **Step 2: Verify in browser**
  - Screen 1: chat bubbles render, typing dots animate, input bar visible
  - Screen 2: severity card with pulsing red 119 button, green cost footer
  - Screen 3: 2×2 info grid with 4 cards, icons visible

- [ ] **Step 3: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: chat UI + triage card + info grid CSS"
```

---

### Task 6: Screen CSS — Clinics, Booking Script, Intake Form

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Consumes: Screen data from Task 3
- Produces: CSS for screens 3-5-6 (clinic search, booking script, intake form)

- [ ] **Step 1: Add CSS**

```css
/* ── Clinic Search (Screen 3) ── */
.screen-clinics { padding: 16px; background: var(--surface); gap: 12px; }
.map-mock {
  width: 100%; height: 100px; border-radius: var(--radius-md);
  background: linear-gradient(135deg, #E8F0FE 0%, #D2E3FC 50%, #E8F0FE 100%);
  position: relative; overflow: hidden;
}
.map-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(26,115,232,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26,115,232,0.08) 1px, transparent 1px);
  background-size: 30px 30px;
}
.map-pin {
  position: absolute; top: 35px; left: 50%;
  width: 14px; height: 14px; background: var(--error);
  border-radius: 50% 50% 50% 0;
  transform: translateX(-50%) rotate(-45deg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.map-label {
  position: absolute; bottom: 8px; right: 10px;
  font-size: 10px; color: var(--on-surface-variant);
  background: rgba(255,255,255,0.8); padding: 2px 6px;
  border-radius: var(--radius-sm);
}
.clinic-list { display: flex; flex-direction: column; gap: 8px; }
.clinic-card {
  background: var(--surface-variant); border: 1px solid var(--outline);
  border-radius: var(--radius-md); padding: 12px;
  transition: border-color var(--transition-fast);
}
.clinic-card.selected { border: 2px solid var(--primary); background: #F0F6FF; }
.clinic-card-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 8px;
}
.clinic-card-top h4 {
  font-family: var(--font-display); font-size: 14px; font-weight: 700;
  margin-bottom: 4px;
}
.badge {
  display: inline-block; padding: 2px 8px; border-radius: 10px;
  font-size: 10px; font-weight: 700; margin-right: 4px;
}
.badge-emergency { background: #FCE8E6; color: var(--error); }
.badge-internal { background: #E8F0FE; color: var(--primary); }
.badge-lang { background: #E6F4EA; color: #137333; }
.clinic-meta {
  display: flex; gap: 12px; font-size: 12px; color: var(--on-surface-variant);
}
.clinic-meta .ph { font-size: 12px; margin-right: 2px; }
.btn-select {
  padding: 6px 14px; background: var(--surface); border: 1px solid var(--outline);
  border-radius: var(--radius-sm); font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: var(--font-body);
  transition: all var(--transition-fast);
}
.btn-select:hover { border-color: var(--primary); color: var(--primary); }
.citation {
  font-size: 10px; color: var(--on-surface-variant); text-align: center;
  padding: 4px; border-top: 1px solid var(--outline);
}

/* ── Booking Script (Screen 4) ── */
.screen-script { padding: 16px; background: var(--surface); gap: 12px; }
.phone-call-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px; background: var(--surface-variant); border-radius: var(--radius-md);
  border: 1px solid var(--outline);
}
.phone-number { font-family: var(--font-mono); font-size: 14px; font-weight: 500; }
.btn-call {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; background: var(--primary); color: white; border: none;
  border-radius: var(--radius-md); font-family: var(--font-body);
  font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer;
}
.script-card {
  background: var(--surface); border: 1px solid var(--outline);
  border-radius: var(--radius-lg); padding: 16px;
  box-shadow: var(--shadow-card);
}
.script-lang-label {
  font-size: 12px; color: var(--on-surface-variant); margin-bottom: 8px;
  font-weight: 500;
}
.script-text-jp {
  font-size: 16px; line-height: 1.7; font-weight: 500; margin-bottom: 8px;
}
.script-toggle {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--primary); cursor: pointer;
  padding: 4px 8px; border-radius: var(--radius-sm); margin-bottom: 8px;
  transition: background var(--transition-fast);
}
.script-toggle:hover { background: #E8F0FE; }
.script-text-romaji {
  font-size: 13px; color: var(--on-surface-variant);
  font-style: italic; margin-bottom: 8px; line-height: 1.5;
}
.script-divider {
  height: 1px; background: var(--outline); margin: 10px 0;
}
.script-text-en {
  font-size: 13px; color: var(--on-surface-variant); line-height: 1.5;
}
.script-tip {
  font-size: 11px; color: var(--on-surface-variant); text-align: center;
  padding: 8px; background: #FFF8E1; border-radius: var(--radius-sm);
}

/* ── Intake Form (Screen 6) ── */
.screen-form { padding: 16px; background: var(--surface); gap: 12px; }
.intake-form-card {
  border: 1px solid var(--outline); border-radius: var(--radius-lg);
  overflow: hidden;
}
.intake-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  border-bottom: 1px solid var(--outline);
}
.intake-row:last-child { border-bottom: none; }
.intake-row-header {
  background: var(--surface-variant); font-size: 11px; font-weight: 700;
  color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em;
}
.intake-col-jp, .intake-col-en {
  padding: 10px 12px; display: flex; flex-direction: column; gap: 2px;
}
.intake-col-jp { border-right: 1px solid var(--outline); }
.field-label {
  font-size: 10px; color: var(--on-surface-variant); text-transform: uppercase;
  letter-spacing: 0.03em;
}
.field-value { font-size: 13px; font-weight: 500; }
.intake-col-jp .field-value { font-size: 14px; }
.btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 14px;
  background: var(--primary); color: white; border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: background var(--transition-fast);
}
.btn-primary:hover { background: var(--primary-hover); }
.form-tip {
  font-size: 11px; color: var(--on-surface-variant); text-align: center;
  padding: 8px; background: #FFF8E1; border-radius: var(--radius-sm);
}
```

- [ ] **Step 2: Verify in browser**
  - Screen 4: map mock with grid + red pin, 3 clinic cards (St. Luke's pre-selected), badges colored correctly
  - Screen 5: phone call bar, Japanese script card, romaji toggle works, English text below
  - Screen 6: two-column intake form, field labels visible, "Download PDF" button → toast appears

- [ ] **Step 3: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: clinic search + booking script + intake form CSS"
```

---

### Task 7: Transition Screens + Drug Interaction + Receipt CSS

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Consumes: Screen data from Task 3
- Produces: CSS for screens T1, 7, T2, 8, 9 (transition screens, drug interaction, receipt OCR)

- [ ] **Step 1: Add CSS**

```css
/* ── Transition Screens (Screens 5, 7) ── */
.screen-transition {
  justify-content: center; align-items: center; text-align: center;
  background: var(--surface); padding: 32px; gap: 16px;
}
.transition-icon { font-size: 56px; }
.screen-transition h2 {
  font-family: var(--font-display); font-size: 18px; font-weight: 700;
  line-height: 1.4;
}
.screen-transition p {
  font-size: 13px; color: var(--on-surface-variant); line-height: 1.6;
}

/* ── Drug Interaction (Screen 8) ── */
.screen-interaction { padding: 16px; background: var(--surface); gap: 12px; }
.interaction-card {
  border: 2px solid var(--warning); border-radius: var(--radius-lg);
  padding: 20px; background: #FFFBF0;
}
.interaction-card.interaction-critical {
  border-color: var(--error); background: #FFF5F5;
}
.interaction-header {
  display: flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: 13px; margin-bottom: 12px;
}
.interaction-card.interaction-critical .interaction-header { color: var(--error); }
.interaction-card h3 {
  font-family: var(--font-display); font-size: 18px; font-weight: 700;
  margin-bottom: 4px;
}
.interaction-summary {
  font-size: 14px; font-weight: 500; color: var(--error); margin-bottom: 12px;
}
.severity-bar {
  width: 100%; height: 6px; background: var(--outline);
  border-radius: 3px; margin-bottom: 12px; overflow: hidden;
}
.severity-fill {
  height: 100%; border-radius: 3px;
}
.severity-fill.critical { background: var(--error); }
.interaction-detail {
  font-size: 13px; color: var(--on-surface-variant); margin-bottom: 16px;
  line-height: 1.5;
}
.suggested-question {
  background: var(--surface); border: 1px solid var(--outline);
  border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px;
}
.suggested-question h4 {
  font-size: 12px; font-weight: 700; margin-bottom: 8px;
  color: var(--on-surface-variant);
}
.question-en {
  font-size: 13px; font-weight: 500; margin-bottom: 6px;
}
.question-jp {
  font-size: 13px; color: var(--on-surface-variant);
}
.disclaimer {
  font-size: 10px; color: var(--on-surface-variant); text-align: center;
  font-style: italic;
}

/* ── Receipt OCR (Screen 9) ── */
.screen-receipt { padding: 16px; background: var(--surface); gap: 12px; }
.receipt-mock {
  background: #fafaf5; border: 1px solid #e0dcd0;
  border-radius: var(--radius-md); padding: 0;
  overflow: hidden;
}
.receipt-paper {
  padding: 20px 16px;
  background: linear-gradient(to bottom, #fafaf5 0%, #f5f2ea 100%);
}
.receipt-hospital {
  text-align: center; font-family: var(--font-mono); font-size: 13px;
  font-weight: 700; color: #333; margin-bottom: 12px;
  letter-spacing: 0.02em;
}
.receipt-stamp {
  text-align: center; font-size: 28px; color: var(--error);
  margin-bottom: 10px; opacity: 0.5;
}
.receipt-divider {
  text-align: center; font-family: var(--font-mono); font-size: 10px;
  color: #ccc; margin: 8px 0;
}
.receipt-date {
  text-align: center; font-family: var(--font-mono); font-size: 12px;
  color: #666; margin-bottom: 10px;
}
.receipt-item {
  display: flex; justify-content: space-between; padding: 4px 0;
  font-family: var(--font-mono); font-size: 13px;
}
.receipt-total {
  display: flex; justify-content: space-between; padding: 4px 0;
  font-family: var(--font-mono); font-size: 14px; font-weight: 700;
  border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 4px;
}
.ocr-result { display: flex; flex-direction: column; gap: 10px; }
.ocr-status {
  text-align: center; font-size: 13px; font-weight: 500;
  padding: 8px; background: #E6F4EA; border-radius: var(--radius-sm);
  color: #137333;
}
.claim-summary {
  background: var(--surface-variant); border-radius: var(--radius-md);
  border: 1px solid var(--outline); overflow: hidden;
}
.claim-row {
  display: flex; justify-content: space-between; padding: 10px 14px;
  font-size: 13px; border-bottom: 1px solid var(--outline);
}
.claim-row:last-child { border-bottom: none; }
.claim-total {
  font-weight: 700; font-size: 14px;
  background: var(--surface);
}
```

- [ ] **Step 2: Verify in browser**
  - Navigate to Screen 6 (arrival transition) → shows hospital icon, auto-advances to intake form after 1.5s
  - Navigate to Screen 8 (prescription transition) → shows pill icon, auto-advances to drug interaction
  - Screen 9 (drug interaction): red border card, severity bar, Japanese + English suggested question
  - Screen 10 (receipt): CSS receipt mock renders, claim summary visible, "Generate Claim PDF" toast

- [ ] **Step 3: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: transitions + drug interaction + receipt OCR CSS"
```

---

### Task 8: Tech Sidebar Content

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Consumes: Sidebar element from Task 2, screen data from Task 3
- Produces: `SIDEBAR_DATA` array — 10 objects with `render()` functions. Sidebar populates per step.

- [ ] **Step 1: Add SIDEBAR_DATA object above the state variables**

```javascript
const SIDEBAR_DATA = [
  { // Screen 0
    render: () => `
      <div class="sidebar-item">
        <div class="sidebar-label">What it did</div>
        <p>Analyzed symptoms against JTAS triage protocol — checking for emergency indicators.</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Function called</div>
        <code>triageAssessment({symptoms, language})</code>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Latency</div>
        <p>~0.6s</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Source</div>
        <p>Gemini 2.5 Flash</p>
      </div>
    `
  },
  { // Screen 1
    render: () => `
      <div class="sidebar-item">
        <div class="sidebar-label">What it did</div>
        <p>Returned severity 1 — chest pain + dyspnea classified as emergency requiring immediate 119 call.</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Output format</div>
        <code>Structured output (JSON schema)</code>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Source</div>
        <p>JTAS clinical protocol</p>
      </div>
    `
  },
  null, // Screen 2 — no AI call (static content)
  { // Screen 3
    render: () => `
      <div class="sidebar-item">
        <div class="sidebar-label">What it did</div>
        <p>Searched hospitals near Shinjuku — filtered by emergency specialty + English support.</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Function called</div>
        <code>searchFacilities({specialty: "emergency", location, language: "en"})</code>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Latency</div>
        <p>~0.4s</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Source</div>
        <p>Google Maps Grounding</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Results</div>
        <p>3 facilities within 4km — St. Luke's (1.2km), Tokyo Med (2.8km), JCHO (3.5km)</p>
      </div>
    `
  },
  { // Screen 4
    render: () => `
      <div class="sidebar-item">
        <div class="sidebar-label">What it did</div>
        <p>Generated polite Japanese script tailored to: chest pain symptoms + St. Luke's clinic context.</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Method</div>
        <code>Text generation (system prompt: "polite Japanese, medical context")</code>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Latency</div>
        <p>~0.5s</p>
      </div>
    `
  },
  null, // Screen 5 — Arrival transition
  { // Screen 6
    render: () => `
      <div class="sidebar-item">
        <div class="sidebar-label">What it did</div>
        <p>Mapped health profile + symptom data to standard Japanese 問診票 template fields.</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Function called</div>
        <code>generateIntakeForm({profile, symptoms})</code>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Latency</div>
        <p>~0.3s</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Source</div>
        <p>Gemini 2.5 Flash</p>
      </div>
    `
  },
  null, // Screen 7 — Prescription transition
  { // Screen 8
    render: () => `
      <div class="sidebar-item">
        <div class="sidebar-label">What it did</div>
        <p>Cross-referenced Warfarin (current med) + Ciprofloxacin (new prescription) — flagged critical interaction.</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Function called</div>
        <code>checkDrugInteractions({currentMeds, newPrescription})</code>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Latency</div>
        <p>~0.4s</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Source</div>
        <p>Gemini knowledge base (WHO drug interaction data in pre-training)</p>
      </div>
    `
  },
  { // Screen 9
    render: () => `
      <div class="sidebar-item">
        <div class="sidebar-label">What it did</div>
        <p>Extracted Japanese receipt fields via multimodal vision — returned structured JSON.</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Method</div>
        <code>Vision: generateContent({image, prompt: "extract fields"})</code>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Latency</div>
        <p>~0.8s</p>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-label">Source</div>
        <p>Gemini 2.5 Flash (multimodal)</p>
      </div>
    `
  }
];
```

- [ ] **Step 2: Add sidebar item CSS**

```css
.sidebar-item {
  margin-bottom: 16px; padding-bottom: 16px;
  border-bottom: 1px solid var(--outline);
}
.sidebar-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.sidebar-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--primary); margin-bottom: 4px;
}
.sidebar-item p {
  font-size: 13px; line-height: 1.5; color: var(--on-surface-variant);
}
.sidebar-item code {
  display: block; background: var(--surface-variant); padding: 6px 8px;
  border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 11px;
  margin-top: 4px; word-break: break-all;
}
.sidebar-empty {
  font-size: 13px; color: var(--on-surface-variant);
  font-style: italic; text-align: center; padding: 24px 0;
}
```

- [ ] **Step 3: Verify in browser**
  - Click `?` button → sidebar slides in from right
  - Navigate through screens → sidebar content updates per step
  - Screens with `null` sidebar data show "No AI call for this step" message
  - Click `×` or `?` again → sidebar hides

- [ ] **Step 4: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: tech sidebar with per-step content"
```

---

### Task 9: Mobile Responsive + Final Polish

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Consumes: All previous tasks
- Produces: Mobile-responsive layout, favicon, final styling tweaks

- [ ] **Step 1: Add mobile responsive CSS**

```css
/* ── Mobile (<768px) ── */
@media (max-width: 767px) {
  .top-bar {
    padding: 0 12px; height: 56px;
  }
  .logo { font-size: 17px; }
  .step-indicator { display: none; }

  .main-content {
    flex-direction: column; align-items: center;
    padding: 16px 0; gap: 0;
  }

  .phone-wrapper { width: 100%; }
  .phone-frame {
    width: 100%; height: calc(100dvh - 56px - 72px); /* minus top bar + nav */
    border-radius: 0; border: none;
    box-shadow: none;
  }
  .phone-notch { display: none; }
  .phone-screen { padding-top: 0; }

  .tech-sidebar { display: none !important; } /* No sidebar on mobile */
  .tech-toggle { display: none; }

  .nav-bar {
    padding: 0 12px; height: 64px; gap: 12px;
  }
  .nav-btn { padding: 8px 14px; font-size: 13px; }

  /* Collapse info grid to single column */
  .info-grid { grid-template-columns: 1fr; }

  /* Stack intake form columns */
  .intake-row { grid-template-columns: 1fr; }
  .intake-col-jp { border-right: none; border-bottom: 1px solid var(--outline); }

  /* Full-width cards */
  .severity-card, .script-card, .interaction-card { border-radius: 0; border-left: none; border-right: none; }
}
```

- [ ] **Step 2: Add viewport meta and favicon**

Update the `<head>` to include (already have viewport meta, add favicon):

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏥</text></svg>">
```

- [ ] **Step 3: Add print styles (hide phone frame, show content only)**

```css
@media print {
  .top-bar, .nav-bar, .phone-frame, .tech-sidebar { display: none !important; }
  .main-content { padding: 0; }
  body { background: white; }
  .phone-screen {
    width: 100%; max-width: 800px; margin: 0 auto;
    overflow: visible; height: auto;
  }
}
```

- [ ] **Step 4: Final verification checklist**

Open in browser, run through all steps:

- [ ] All 10 screens render and look polished
- [ ] Back/Next navigation works correctly (no double-navigation)
- [ ] Keyboard arrows work (← →)
- [ ] Keyboard `R` restarts the flow
- [ ] Progress dots clickable (visited only)
- [ ] Transition screens auto-advance after 1.5s
- [ ] Romaji toggle works on booking script screen
- [ ] Toast notifications appear on PDF buttons
- [ ] Pulsing animation on CALL 119 button
- [ ] Language toggle swaps "Next/Back/Step" labels
- [ ] Tech sidebar shows correct per-step content
- [ ] Sidebar shows empty state message for transition screens
- [ ] Resize to mobile width → phone fills screen, sidebar hidden
- [ ] No console errors anywhere
- [ ] All icons load (Phosphor CDN)
- [ ] All fonts load (Google Fonts CDN)

- [ ] **Step 5: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: mobile responsive + final polish"
```

---

## Self-Review

### 1. Spec Coverage
- ✅ Single HTML file, no framework — Task 1
- ✅ Phone frame + layout — Task 2
- ✅ All 10 screens as data objects — Task 3
- ✅ Rendering engine + navigation — Task 4
- ✅ Chat UI + triage + info cards CSS — Task 5
- ✅ Clinics + booking script + intake form CSS — Task 6
- ✅ Transitions + drug interaction + receipt CSS — Task 7
- ✅ Tech sidebar — Task 8
- ✅ Mobile responsive + print — Task 9
- ✅ Transition lock (no rapid-click bugs) — Task 4
- ✅ Toast notifications — Task 4
- ✅ Pulsing 119 button — Task 5
- ✅ Romaji toggle — Task 3 (render) + Task 4 (bind)
- ✅ Language toggle — Task 4
- ✅ Keyboard navigation — Task 4
- ✅ CSS mock receipt — Task 7
- ✅ All Material 3 colors — Task 1 (CSS vars)
- ✅ DM Sans + Roboto fonts — Task 1

### 2. Placeholder Scan
- ✅ No TODOs, TBDs, or vague instructions
- ✅ Every step has concrete code
- ✅ Every task has a verification step

### 3. Type Consistency
- ✅ `SCREENS` used consistently across Tasks 3–8
- ✅ `SIDEBAR_DATA` used in Task 8, consumed in Task 4
- ✅ `navigateTo(index)` signature consistent in all call sites
- ✅ `currentStep` (0-indexed) used consistently

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-23-mediroute-mock.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
