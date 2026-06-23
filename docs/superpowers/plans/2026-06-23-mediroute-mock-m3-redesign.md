# MediRoute M3 Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `mediroute-mock.html` from Taste-v1 aesthetic to Material 3 Google-native — new color tokens, typography, elevation, component shapes, and motion. All 15 routes preserved. Zero new dependencies.

**Architecture:** Single HTML file. CSS in `<style>`, JS in `<script>`. Edit operations target specific CSS blocks and JS class strings via exact-text replacement. Each task produces visually verifiable changes without breaking existing screen logic.

**Tech Stack:** Vanilla HTML/CSS/JS, Roboto Flex (Google Fonts CDN), JetBrains Mono (Google Fonts CDN), Phosphor Icons (CDN, already loaded).

**Spec:** `docs/superpowers/specs/2026-06-23-mediroute-mock-m3-redesign.md`

## Global Constraints

- Single file: `mediroute-mock.html` (~2720 lines) — all changes in this file only
- Zero dependencies beyond CDN fonts + Phosphor icons (already loaded)
- All 15 routes must navigate correctly after each task
- All keyboard shortcuts must work (`1-5`, `← →`, `H`, `R`, `Shift+R`)
- localStorage session persistence must survive refresh
- No build step — open in browser to verify
- M3 easing: `cubic-bezier(0.2, 0.0, 0, 1.0)`, durations 250ms/300ms
- M3 corner radii: 8px (chips), 12px (cards), 16px (FAB), 28px (buttons/inputs), 48px (phone frame)

---

### Task 1: CSS Variables, Fonts & Body — The Foundation

**Files:**
- Modify: `mediroute-mock.html` (lines 5-50 — `<link>` tags, `:root` block, `body` styles, grain texture)

**Produces:** M3 token system, Roboto Flex typography, clean Surface background

- [ ] **Step 1: Swap font CDN links**

Replace the Google Fonts `<link>` tags (Outfit + DM Sans + JetBrains Mono) with Roboto Flex + JetBrains Mono only:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace `:root` CSS variables with M3 tokens**

Replace the entire `:root { ... }` block with:

```css
:root {
  /* M3 Primary */
  --m3-primary: #1A73E8;
  --m3-on-primary: #FFFFFF;
  --m3-primary-container: #D3E3FD;
  --m3-on-primary-container: #041E49;
  /* M3 Error */
  --m3-error: #EA4335;
  --m3-error-container: #FCE8E6;
  --m3-on-error: #FFFFFF;
  /* M3 Tertiary */
  --m3-tertiary: #00897B;
  --m3-tertiary-container: #B2DFDB;
  /* M3 Surface */
  --m3-surface: #FFFBFE;
  --m3-surface-container: #F0F4F9;
  --m3-on-surface: #1F1F1F;
  --m3-on-surface-variant: #5F6368;
  /* M3 Outline */
  --m3-outline: #C4C7C5;
  --m3-outline-variant: #E2E2E2;
  /* M3 Success & Warning */
  --m3-success: #137333;
  --m3-success-container: #E6F4EA;
  --m3-warning: #FBBC04;
  --m3-warning-container: #FEF7E0;
  /* Elevation */
  --m3-elevation-0: none;
  --m3-elevation-1: 0 1px 2px rgba(0,0,0,0.08), 0 1px 3px 1px rgba(0,0,0,0.04);
  --m3-elevation-2: 0 1px 2px rgba(0,0,0,0.08), 0 2px 6px 2px rgba(0,0,0,0.04);
  --m3-elevation-3: 0 4px 8px 3px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06);
  /* Shape */
  --m3-radius-sm: 8px;
  --m3-radius-md: 12px;
  --m3-radius-lg: 16px;
  --m3-radius-xl: 28px;
  /* Typography */
  --m3-font-body: 'Roboto Flex', 'DM Sans', sans-serif;
  --m3-font-mono: 'JetBrains Mono', 'Roboto Mono', monospace;
  /* Motion */
  --m3-easing: cubic-bezier(0.2, 0.0, 0, 1.0);
  --m3-duration-short: 250ms;
  --m3-duration-medium: 300ms;
}
```

- [ ] **Step 3: Replace `body` styles**

Replace current body CSS (with `#FAF9F7` background, `font-family: var(--font-body)`, etc.) with:

```css
body {
  font-family: var(--m3-font-body); color: var(--m3-on-surface);
  background: var(--m3-surface); min-height: 100dvh;
  display: flex; flex-direction: column; align-items: center;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Remove grain texture**

Delete the `body::after` block entirely (the fixed pseudo-element with SVG turbulence filter).

- [ ] **Step 5: Remove skip-link (optional accessibility element — keep but update tokens)**

The `.skip-link` class stays but update it to use M3 tokens:

```css
.skip-link {
  position: absolute; top: -100px; left: 24px; z-index: 200;
  background: var(--m3-primary); color: var(--m3-on-primary);
  padding: 10px 20px; border-radius: var(--m3-radius-md);
  font-family: var(--m3-font-body); font-size: 14px; font-weight: 600;
  text-decoration: none; transition: top 200ms ease;
}
.skip-link:focus { top: 16px; outline: 2px solid var(--m3-primary); outline-offset: 2px; }
```

- [ ] **Step 6: Verify**

Open `mediroute-mock.html` in browser. The page should have:
- White/clean `#FFFBFE` background (no warm off-white `#FAF9F7`)
- No grain texture overlay
- Roboto Flex font rendering
- Blue `#1A73E8` accent visible where old `--primary` was referenced (may show in some elements that still use old var names — expected at this stage)

---

### Task 2: Structural CSS — Top Bar, Bottom Bar, Phone Frame, Sidebar

**Files:**
- Modify: `mediroute-mock.html` (CSS blocks for `.top-bar`, `.nav-bar`, `.phone-frame`, `.tech-sidebar` + HTML for nav bar)

**Produces:** M3 top app bar, M3 bottom bar with linear progress, clean phone frame, M3 sidebar

- [ ] **Step 1: Replace top bar CSS**

Replace current `.top-bar` block:

```css
/* M3 Top App Bar */
.m3-top-app-bar {
  width: 100%; height: 64px; display: flex; align-items: center;
  justify-content: space-between; padding: 0 16px;
  background: var(--m3-surface); border-bottom: 1px solid var(--m3-outline-variant);
  position: sticky; top: 0; z-index: 100;
}
.m3-top-app-bar .leading { display: flex; align-items: center; gap: 12px; }
.m3-top-app-bar .logo {
  font-family: var(--m3-font-body); font-weight: 700; font-size: 20px;
  color: var(--m3-primary); letter-spacing: -0.02em;
}
.m3-top-app-bar .trailing { display: flex; align-items: center; gap: 8px; }
.m3-icon-button {
  width: 40px; height: 40px; border-radius: 50%;
  background: none; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: var(--m3-on-surface-variant);
  transition: background var(--m3-duration-short) var(--m3-easing);
}
.m3-icon-button:hover { background: var(--m3-surface-container); }
.m3-step-indicator {
  font-family: var(--m3-font-mono); font-size: 11px;
  color: var(--m3-on-surface-variant); font-weight: 500;
}
```

- [ ] **Step 2: Replace top bar HTML**

Replace `<header class="top-bar">...</header>` with:

```html
<header class="m3-top-app-bar">
  <div class="leading"><span class="logo">MediRoute</span></div>
  <div class="trailing">
    <span class="m3-step-indicator" id="stepIndicator"></span>
  </div>
</header>
```

- [ ] **Step 3: Replace bottom nav bar CSS**

Replace current `.nav-bar` and `.nav-btn` blocks:

```css
/* M3 Bottom Bar */
.m3-bottom-bar {
  width: 100%; height: 72px; display: flex; align-items: center;
  justify-content: space-between; padding: 0 16px;
  background: var(--m3-surface); border-top: 1px solid var(--m3-outline-variant);
  position: sticky; bottom: 0; z-index: 100;
}
.m3-progress-bar {
  flex: 1; height: 4px; background: var(--m3-surface-container);
  border-radius: 2px; margin: 0 16px; overflow: hidden;
}
.m3-progress-bar-fill {
  height: 100%; background: var(--m3-primary); border-radius: 2px;
  transition: width var(--m3-duration-medium) var(--m3-easing);
}
.m3-nav-btn {
  display: flex; align-items: center; gap: 6px; padding: 10px 16px;
  background: none; border: none; border-radius: var(--m3-radius-xl);
  font-family: var(--m3-font-body); font-size: 14px; font-weight: 500;
  color: var(--m3-primary); cursor: pointer;
  transition: background var(--m3-duration-short) var(--m3-easing);
}
.m3-nav-btn:hover:not(:disabled) { background: var(--m3-primary-container); }
.m3-nav-btn:disabled { color: var(--m3-on-surface); opacity: 0.38; cursor: not-allowed; }
.m3-nav-btn .ph { font-size: 18px; }
```

- [ ] **Step 4: Replace bottom nav HTML**

Replace `<nav class="nav-bar">...</nav>` with:

```html
<nav class="m3-bottom-bar">
  <button class="m3-nav-btn" id="backBtn" disabled><i class="ph ph-arrow-left"></i> <span class="nav-label">Back</span></button>
  <div class="m3-progress-bar"><div class="m3-progress-bar-fill" id="progressFill" style="width:0%"></div></div>
  <button class="m3-nav-btn" id="nextBtn"><span class="nav-label">Next</span> <i class="ph ph-arrow-right"></i></button>
</nav>
```

- [ ] **Step 5: Update phone frame surface**

Replace `.phone-screen` background:

```css
.phone-screen {
  width: 100%; height: 100%; overflow-y: auto;
  padding-top: 40px; background: var(--m3-surface); position: relative;
}
```

- [ ] **Step 6: Replace tech sidebar CSS**

Replace all `.tech-sidebar`, `.sidebar-*` classes using M3 tokens:

```css
.m3-sidebar {
  width: 280px; flex-shrink: 0; background: var(--m3-surface);
  border-radius: var(--m3-radius-md); border: 1px solid var(--m3-outline);
  padding: 20px; box-shadow: var(--m3-elevation-1);
  display: none; max-height: 700px; overflow-y: auto;
}
.m3-sidebar.visible { display: block; }
.m3-sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.m3-sidebar-header h3 { font-family: var(--m3-font-body); font-size: 16px; font-weight: 700; color: var(--m3-on-surface); }
.m3-sidebar-close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--m3-on-surface-variant); }
.m3-sidebar-body { font-size: 13px; line-height: 1.6; }
.m3-sidebar-item { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--m3-outline-variant); }
.m3-sidebar-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.m3-sidebar-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--m3-primary); margin-bottom: 4px; }
.m3-sidebar-item p { font-size: 13px; line-height: 1.5; color: var(--m3-on-surface-variant); }
.m3-sidebar-item code { display: block; background: var(--m3-surface-container); padding: 6px 8px; border-radius: var(--m3-radius-sm); font-family: var(--m3-font-mono); font-size: 11px; margin-top: 4px; word-break: break-all; }
.m3-sidebar-empty { font-size: 13px; color: var(--m3-on-surface-variant); font-style: italic; text-align: center; padding: 24px 0; }
```

- [ ] **Step 7: Update sidebar HTML**

Replace `<aside class="tech-sidebar" id="techSidebar">` with `<aside class="m3-sidebar" id="techSidebar">` and all child `sidebar-*` classes → `m3-sidebar-*`.

- [ ] **Step 8: Verify**

Open in browser. Confirm: top bar is white/clean 64px with blue logo, bottom bar shows Back + progress bar + Next, phone screen has white background. Progress bar is visible (width 0% on hub screen).

---

### Task 3: Chat Component CSS

**Files:**
- Modify: `mediroute-mock.html` (all chat-related CSS blocks)

**Produces:** M3 chat bubbles, input field, option chips, verdict card, typing indicator

- [ ] **Step 1: Replace chat screen container + header**

```css
/* M3 Chat */
.m3-screen-chat { background: var(--m3-surface); padding-bottom: 0; height: 100%; }
.m3-chat-header {
  padding: 12px 16px; font-family: var(--m3-font-body); font-weight: 600;
  font-size: 16px; color: var(--m3-primary); border-bottom: 1px solid var(--m3-outline-variant);
  text-align: left; background: var(--m3-surface);
}
.m3-chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
```

- [ ] **Step 2: Replace chat bubble styles**

```css
.m3-chat-bubble { max-width: 85%; padding: 12px 14px; border-radius: var(--m3-radius-lg); font-size: 14px; line-height: 1.5; }
.m3-chat-bubble--user {
  align-self: flex-end; background: var(--m3-primary-container);
  color: var(--m3-on-primary-container); border-bottom-right-radius: var(--m3-radius-sm);
}
.m3-chat-bubble--assistant {
  align-self: flex-start; background: var(--m3-surface);
  color: var(--m3-on-surface); border: 1px solid var(--m3-outline);
  border-bottom-left-radius: var(--m3-radius-sm);
}
.m3-chat-time { display: block; font-size: 11px; opacity: 0.7; margin-top: 4px; }
```

- [ ] **Step 3: Replace typing dots (keep animation, restyle)**

```css
.m3-typing-dots { display: flex; gap: 4px; padding: 4px 0; }
.m3-typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--m3-on-surface-variant); animation: typingBounce 1.4s infinite ease-in-out; }
.m3-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.m3-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
```

- [ ] **Step 4: Replace chat input bar**

```css
.m3-chat-input {
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid var(--m3-outline-variant); background: var(--m3-surface);
}
.m3-outlined-text-field {
  flex: 1; padding: 10px 14px; border: 1px solid var(--m3-outline);
  border-radius: var(--m3-radius-xl); font-family: var(--m3-font-body);
  font-size: 14px; outline: none; background: var(--m3-surface);
  transition: border-color var(--m3-duration-short) var(--m3-easing);
}
.m3-outlined-text-field:focus { border-color: var(--m3-primary); }
.m3-chat-input .m3-icon-button {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--m3-primary); color: var(--m3-on-primary);
  border: none; cursor: pointer; display: flex;
  align-items: center; justify-content: center; font-size: 18px;
}
```

- [ ] **Step 5: Replace chat options (choice chips)**

```css
.m3-chat-options {
  display: flex; flex-direction: column; gap: 6px;
  padding: 0 16px 12px 16px;
}
.m3-chip--choice {
  width: 100%; padding: 10px 14px;
  background: var(--m3-surface); border: 1px solid var(--m3-outline);
  border-radius: var(--m3-radius-md);
  font-family: var(--m3-font-body); font-size: 13px; text-align: left;
  cursor: pointer; color: var(--m3-on-surface);
  transition: all var(--m3-duration-short) var(--m3-easing);
}
.m3-chip--choice:hover { border-color: var(--m3-primary); background: var(--m3-primary-container); }
.m3-chip--choice.type { text-align: center; color: var(--m3-on-surface-variant); font-size: 12px; padding: 8px; }
```

- [ ] **Step 6: Replace verdict card**

```css
.m3-card--verdict {
  margin: 12px 16px; padding: 16px;
  border-radius: var(--m3-radius-lg);
  background: var(--m3-surface); box-shadow: var(--m3-elevation-1);
}
.m3-card--verdict .header { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.m3-card--verdict .body { font-size: 14px; color: var(--m3-on-surface-variant); margin-bottom: 8px; line-height: 1.5; }
.m3-card--verdict .confidence { font-size: 11px; color: var(--m3-on-surface-variant); margin: 8px 0; font-style: italic; }
.m3-chip--assist {
  display: inline-block; padding: 6px 14px; border-radius: var(--m3-radius-xl);
  color: white; font-size: 12px; font-weight: 600; margin: 8px 0;
  background: var(--m3-primary);
}
.m3-card--summary {
  margin: 0 16px 12px 16px; padding: 8px 12px;
  background: var(--m3-primary-container); border-radius: var(--m3-radius-sm);
  font-size: 11px; color: var(--m3-primary); line-height: 1.5;
  border: none;
}
.m3-card--summary span { font-weight: 700; }
```

- [ ] **Step 7: Verify**

Open in browser. Navigate to a chat triage screen (e.g., press `1` for Emergency → Chest Pain). Confirm: chat header is clean, user bubbles are light blue (`#D3E3FD`), assistant bubbles are white with grey border, input bar has pill-shaped field, option chips have M3 hover effect.

---

### Task 4: Card, List & Info Grid CSS

**Files:**
- Modify: `mediroute-mock.html` (`.info-grid`, `.info-card`, `.clinic-*`, `.screen-info`, `.screen-clinics` CSS blocks)

**Produces:** M3 elevated cards, M3 list items, M3 assist chips for badges

- [ ] **Step 1: Replace screen-info and screen-clinics base**

```css
.m3-screen-info { padding: 16px; background: var(--m3-surface); gap: 16px; min-height: 100%; display: flex; flex-direction: column; }
.m3-screen-clinics { padding: 16px; background: var(--m3-surface); gap: 12px; min-height: 100%; display: flex; flex-direction: column; }
.m3-headline { font-size: 22px; font-weight: 500; color: var(--m3-on-surface); text-align: left; }
.m3-subtitle { font-size: 14px; color: var(--m3-on-surface-variant); line-height: 1.5; }
```

- [ ] **Step 2: Replace info grid and cards**

```css
.m3-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.m3-card {
  background: var(--m3-surface); border-radius: var(--m3-radius-md);
  padding: 14px; box-shadow: var(--m3-elevation-1);
  border: none;
}
.m3-card .icon { font-size: 22px; color: var(--m3-primary); margin-bottom: 6px; }
.m3-card .title { font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--m3-on-surface); }
.m3-card .body { font-size: 12px; color: var(--m3-on-surface-variant); line-height: 1.4; }
```

- [ ] **Step 3: Replace clinic list and cards**

```css
.m3-list { display: flex; flex-direction: column; gap: 8px; }
.m3-list-item--card {
  background: var(--m3-surface); box-shadow: var(--m3-elevation-1);
  border-radius: var(--m3-radius-md); padding: 12px;
  cursor: pointer; transition: box-shadow var(--m3-duration-short) var(--m3-easing);
  border: none;
}
.m3-list-item--card:hover { box-shadow: var(--m3-elevation-2); }
.m3-list-item--card.selected { outline: 2px solid var(--m3-primary); outline-offset: -2px; }
.m3-list-item--card .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.m3-list-item--card .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; color: var(--m3-on-surface); }
.m3-list-item--card .meta { display: flex; gap: 12px; font-size: 12px; color: var(--m3-on-surface-variant); }
.m3-list-item--card .meta .ph { font-size: 12px; margin-right: 2px; }
```

- [ ] **Step 4: Replace badge chips**

```css
.m3-chip--assist {
  display: inline-block; padding: 4px 12px; border-radius: var(--m3-radius-sm);
  font-size: 11px; font-weight: 600; margin-right: 4px;
}
.m3-chip--assist.error { background: var(--m3-error-container); color: var(--m3-error); }
.m3-chip--assist.primary { background: var(--m3-primary-container); color: var(--m3-primary); }
.m3-chip--assist.tertiary { background: var(--m3-tertiary-container); color: var(--m3-tertiary); }
```

- [ ] **Step 5: Replace clinic detail card**

```css
.m3-card--detail {
  background: var(--m3-surface); border-radius: var(--m3-radius-md);
  box-shadow: var(--m3-elevation-1); overflow: hidden;
}
.m3-card--detail .row {
  display: flex; gap: 10px; padding: 10px 14px;
  border-bottom: 1px solid var(--m3-outline-variant); align-items: center;
}
.m3-card--detail .row:last-child { border-bottom: none; }
.m3-card--detail .row .ph { font-size: 18px; color: var(--m3-primary); flex-shrink: 0; }
.m3-label { display: block; font-size: 10px; color: var(--m3-on-surface-variant); text-transform: uppercase; letter-spacing: 0.04em; }
.m3-value { font-size: 13px; font-weight: 500; color: var(--m3-on-surface); }
```

- [ ] **Step 6: Replace map mock**

```css
.m3-map {
  width: 100%; height: 100px; border-radius: var(--m3-radius-md);
  background: var(--m3-primary-container); position: relative; overflow: hidden;
}
.m3-map .grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(26,115,232,0.08) 1px,transparent 1px),
                    linear-gradient(90deg,rgba(26,115,232,0.08) 1px,transparent 1px);
  background-size: 30px 30px;
}
.m3-map .pin {
  position: absolute; top: 35px; left: 50%; width: 14px; height: 14px;
  background: var(--m3-error); border-radius: 50% 50% 50% 0;
  transform: translateX(-50%) rotate(-45deg); box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.m3-map .label {
  position: absolute; bottom: 8px; right: 10px; font-size: 10px;
  color: var(--m3-on-surface-variant); background: rgba(255,255,255,0.85);
  padding: 2px 6px; border-radius: var(--m3-radius-sm);
}
```

- [ ] **Step 7: Verify**

Open in browser. Navigate to Clinic → Fever/Flu → Find Nearby Clinic. Confirm: clinic cards have M3 elevation shadow, selected card has blue outline, info grid cards have shadow not border, badges show as colored chips.

---

### Task 5: Severity, Alert & Emergency CSS

**Files:**
- Modify: `mediroute-mock.html` (`.screen-triage`, `.severity-*`, `.emergency-call-*`, `.ec-*` CSS blocks)

**Produces:** M3 filled tonal cards for severity, M3 error button, M3 progress steps for emergency call

- [ ] **Step 1: Replace severity card CSS**

```css
.m3-screen-triage { padding: 16px; background: var(--m3-surface); min-height: 100%; gap: 12px; display: flex; flex-direction: column; }
.m3-card--tonal {
  border-radius: var(--m3-radius-lg); padding: 20px;
  border: none;
}
.m3-card--tonal.error { background: var(--m3-error-container); }
.m3-card--tonal.warning { background: var(--m3-warning-container); }
.m3-card--tonal.primary { background: var(--m3-primary-container); }
.m3-card--tonal.success { background: var(--m3-success-container); }
.m3-card--tonal h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.m3-card--tonal.error h2 { color: var(--m3-error); }
.m3-card--tonal.warning h2 { color: #B06000; }
.m3-card--tonal .body { font-size: 13px; color: var(--m3-on-surface-variant); margin-bottom: 12px; line-height: 1.5; }
```

- [ ] **Step 2: Replace emergency 119 button**

```css
.m3-btn-filled.error {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 16px; background: var(--m3-error); color: var(--m3-on-error);
  border: none; border-radius: var(--m3-radius-xl);
  font-family: var(--m3-font-body); font-size: 16px; font-weight: 600;
  cursor: pointer; transition: box-shadow var(--m3-duration-short) var(--m3-easing);
  box-shadow: var(--m3-elevation-1);
}
.m3-btn-filled.error:hover { box-shadow: var(--m3-elevation-2); }
.m3-btn-filled.error.pulse { animation: m3Pulse 2s var(--m3-easing) infinite; }
@keyframes m3Pulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(234,67,53,0.3); }
  50% { box-shadow: 0 4px 24px rgba(234,67,53,0.55); }
}
```

- [ ] **Step 3: Replace cost reassurance**

```css
.m3-card--tonal.cost {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: var(--m3-success-container);
  border-radius: var(--m3-radius-sm); font-size: 12px;
  color: var(--m3-success); text-align: left;
}
```

- [ ] **Step 4: Replace emergency call screen CSS**

```css
.m3-emergency-header {
  text-align: center; padding: 16px;
  background: var(--m3-error-container); border-radius: var(--m3-radius-lg);
}
.m3-emergency-status { font-size: 18px; font-weight: 700; color: var(--m3-error); }
.m3-timer { font-family: var(--m3-font-mono); font-size: 24px; color: var(--m3-on-surface-variant); margin-top: 4px; }
.m3-progress-steps { display: flex; flex-direction: column; gap: 6px; padding: 8px 0; }
.m3-progress-step {
  font-size: 13px; color: var(--m3-on-surface-variant); padding: 10px;
  border-left: 3px solid var(--m3-outline-variant);
  transition: all var(--m3-duration-medium) var(--m3-easing);
}
.m3-progress-step.active { color: var(--m3-error); border-left-color: var(--m3-error); font-weight: 600; }
```

- [ ] **Step 5: Verify**

Open browser. Press `1` → Chest Pain → answer questions to get Severity 1 result. Confirm: severity card has red-tinted background (`#FCE8E6`), "Call 119" button is red filled with pulsing shadow, emergency call screen shows progress steps with active red left border.

---

### Task 6: Button System CSS

**Files:**
- Modify: `mediroute-mock.html` (all button CSS blocks: `.btn-primary`, `.btn-secondary`, `.btn-select`, `.btn-call`, `.btn-scan`)

**Produces:** Unified M3 button system — filled, outlined, text, icon

- [ ] **Step 1: Replace primary and secondary buttons**

```css
/* M3 Buttons */
.m3-btn-filled {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 14px 24px; height: 56px;
  background: var(--m3-primary); color: var(--m3-on-primary);
  border: none; border-radius: var(--m3-radius-xl);
  font-family: var(--m3-font-body); font-size: 14px; font-weight: 600;
  cursor: pointer; box-shadow: var(--m3-elevation-1);
  transition: box-shadow var(--m3-duration-short) var(--m3-easing);
}
.m3-btn-filled:hover { box-shadow: var(--m3-elevation-2); }
.m3-btn-filled:active { box-shadow: var(--m3-elevation-1); }

.m3-btn-outlined {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 10px 24px; height: 40px;
  background: transparent; color: var(--m3-primary);
  border: 1px solid var(--m3-outline); border-radius: var(--m3-radius-xl);
  font-family: var(--m3-font-body); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all var(--m3-duration-short) var(--m3-easing);
}
.m3-btn-outlined:hover { background: var(--m3-primary-container); border-color: var(--m3-primary); }
.m3-btn-outlined.small { width: auto; padding: 6px 14px; font-size: 12px; height: 32px; }
.m3-btn-outlined.dashed { border-style: dashed; }

.m3-text-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 8px; background: none; border: none;
  font-family: var(--m3-font-body); font-size: 12px; font-weight: 600;
  color: var(--m3-primary); cursor: pointer; border-radius: var(--m3-radius-sm);
  transition: background var(--m3-duration-short) var(--m3-easing);
}
.m3-text-btn:hover { background: var(--m3-primary-container); }
```

- [ ] **Step 2: Replace scan button**

```css
.m3-btn-scan {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px; background: var(--m3-surface); border: 2px dashed var(--m3-primary);
  border-radius: var(--m3-radius-md); font-family: var(--m3-font-body); font-size: 13px;
  font-weight: 600; color: var(--m3-primary); cursor: pointer;
  transition: background var(--m3-duration-short) var(--m3-easing);
}
.m3-btn-scan:hover { background: var(--m3-primary-container); }
```

- [ ] **Step 3: Verify**

Open browser. Navigate through screens to see all button types: "Book Now" (filled), "View Details" (outlined), "Skip" (text), scan button (dashed outlined), "Call 119" (filled error). All should have M3 styling.

---

### Task 7: Form, Script & Booking CSS

**Files:**
- Modify: `mediroute-mock.html` (`.screen-form`, `.intake-*`, `.ins-*`, `.screen-script`, `.script-*`, `.booking-*`, `.phone-call-*` CSS blocks)

**Produces:** M3 form fields, intake form cards, insurance forms, script cards, booking progress steps

- [ ] **Step 1: Replace form screen and intake form**

```css
.m3-screen-form { padding: 16px; background: var(--m3-surface); gap: 12px; min-height: 100%; display: flex; flex-direction: column; }
.m3-card--form { border-radius: var(--m3-radius-lg); overflow: hidden; box-shadow: var(--m3-elevation-1); background: var(--m3-surface); }
.m3-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid var(--m3-outline-variant); }
.m3-form-row:last-child { border-bottom: none; }
.m3-form-row.header { background: var(--m3-surface-container); font-size: 11px; font-weight: 700; color: var(--m3-on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; }
.m3-form-col--jp, .m3-form-col--en { padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.m3-form-col--jp { border-right: 1px solid var(--m3-outline-variant); }
.m3-assistive-text { font-size: 11px; color: var(--m3-on-surface-variant); text-align: center; padding: 8px; background: var(--m3-warning-container); border-radius: var(--m3-radius-sm); line-height: 1.4; }
```

- [ ] **Step 2: Replace insurance form**

```css
.m3-form { display: flex; flex-direction: column; gap: 12px; }
.m3-form-field { display: flex; flex-direction: column; gap: 4px; }
.m3-outlined-select {
  padding: 10px 12px; border: 1px solid var(--m3-outline);
  border-radius: var(--m3-radius-md); font-family: var(--m3-font-body);
  font-size: 14px; background: var(--m3-surface); width: 100%;
  cursor: pointer;
}
.m3-coverage-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
.m3-status-text { font-size: 11px; margin-top: 6px; font-weight: 500; }
.m3-status-text.success { color: var(--m3-success); }
.m3-status-text.error { color: var(--m3-error); }
.m3-card.error-outline { box-shadow: 0 0 0 2px var(--m3-error); }
```

- [ ] **Step 3: Replace script/booking CSS**

```css
.m3-screen-script { padding: 16px; background: var(--m3-surface); gap: 12px; min-height: 100%; display: flex; flex-direction: column; }
.m3-call-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--m3-surface-container); border-radius: var(--m3-radius-md); }
.m3-call-number { font-family: var(--m3-font-mono); font-size: 14px; font-weight: 500; }
.m3-script-text { font-size: 16px; line-height: 1.7; font-weight: 500; margin-bottom: 8px; color: var(--m3-on-surface); }
.m3-script-romaji { font-size: 13px; color: var(--m3-on-surface-variant); font-style: italic; margin-bottom: 8px; line-height: 1.5; }
.m3-divider { height: 1px; background: var(--m3-outline-variant); margin: 10px 0; }
.m3-script-en { font-size: 13px; color: var(--m3-on-surface-variant); line-height: 1.5; }
.m3-btn-row { display: flex; gap: 8px; }
```

- [ ] **Step 4: Verify**

Open browser. Navigate to Clinic → Fever/Flu → through to intake form, insurance form, booking. Confirm: forms have clean M3 fields, intake form card has elevation shadow, insurance dropdown looks M3, booking progress steps have active state.

---

### Task 8: Medication & Receipt CSS

**Files:**
- Modify: `mediroute-mock.html` (`.rx-*`, `.interaction-*`, `.pickup-*`, `.receipt-*`, `.claim-*`, `.ocr-*` CSS blocks)

**Produces:** M3 prescription document, drug interaction alerts, pharmacy match, receipt claim forms

- [ ] **Step 1: Replace Rx document CSS**

```css
.m3-card--rx {
  background: var(--m3-surface); border-radius: var(--m3-radius-md);
  box-shadow: var(--m3-elevation-1); overflow: hidden;
}
.m3-card--rx .header { padding: 16px; border-bottom: 2px solid var(--m3-on-surface); }
.m3-card--rx .title { text-align: center; font-size: 22px; font-weight: 800; letter-spacing: 0.3em; color: var(--m3-on-surface); margin-bottom: 12px; }
.m3-card--rx .meta { display: flex; flex-direction: column; gap: 4px; }
.m3-card--rx .meta-row { display: flex; gap: 8px; font-size: 12px; }
.m3-card--rx .meta-row span:first-child { color: var(--m3-on-surface-variant); min-width: 60px; }
.m3-card--rx .meta-row span:last-child { font-weight: 700; }
.m3-card--rx .footer { padding: 12px 14px; background: var(--m3-warning-container); border-top: 2px solid var(--m3-on-surface); font-size: 10px; color: var(--m3-on-surface-variant); line-height: 1.5; text-align: center; }
```

- [ ] **Step 2: Replace Rx med list items**

```css
.m3-list-item { display: flex; align-items: center; gap: 10px; padding: 10px 8px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid var(--m3-outline-variant); }
.m3-list-item:last-child { border-bottom: none; }
.m3-list-item:hover { background: var(--m3-surface-container); }
.m3-list-item .top { display: flex; align-items: center; gap: 10px; }
.m3-chip--circle { width: 22px; height: 22px; border-radius: 50%; background: var(--m3-on-surface); color: var(--m3-surface); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.m3-list-item .content { flex: 1; }
.m3-list-item .headline { font-size: 14px; font-weight: 700; color: var(--m3-on-surface); }
.m3-list-item .supporting { font-size: 10px; color: var(--m3-on-surface-variant); }
.m3-list-item .trailing { font-size: 15px; font-weight: 900; color: var(--m3-on-surface); }
.m3-detail-row { display: flex; gap: 8px; font-size: 11px; padding: 2px 0; }
.m3-detail-row span:first-child { color: var(--m3-on-surface-variant); min-width: 30px; }
```

- [ ] **Step 3: Replace drug interaction CSS**

```css
.m3-screen-interaction { padding: 16px; background: var(--m3-surface); gap: 12px; min-height: 100%; display: flex; flex-direction: column; }
.m3-card--tonal.warning .header { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; margin-bottom: 12px; color: #B06000; }
.m3-card--tonal.error .header { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; margin-bottom: 12px; color: var(--m3-error); }
.m3-card--tonal .summary { font-size: 14px; font-weight: 500; margin-bottom: 12px; }
.m3-card--tonal.error .summary { color: var(--m3-error); }
.m3-progress-linear {
  width: 100%; height: 6px; background: var(--m3-surface-container);
  border-radius: 3px; margin-bottom: 12px; overflow: hidden;
}
.m3-progress-linear .fill { height: 100%; border-radius: 3px; }
.m3-progress-linear .fill.error { background: var(--m3-error); }
.m3-card--outlined {
  background: var(--m3-surface); border: 1px solid var(--m3-outline);
  border-radius: var(--m3-radius-md); padding: 12px; margin-bottom: 12px;
}
.m3-card--outlined .title { font-size: 12px; font-weight: 700; margin-bottom: 8px; color: var(--m3-on-surface-variant); }
.m3-disclaimer { font-size: 10px; color: var(--m3-on-surface-variant); text-align: center; font-style: italic; }
```

- [ ] **Step 4: Replace pharmacy & pickup CSS**

```css
.m3-drug-icon { font-size: 32px; }
.m3-drug-name { font-size: 16px; font-weight: 700; color: var(--m3-on-primary-container); }
.m3-drug-detail { font-size: 12px; color: var(--m3-on-surface-variant); margin-top: 2px; }
.m3-code-display { font-family: var(--m3-font-mono); font-size: 32px; font-weight: 700; color: var(--m3-primary); letter-spacing: 0.1em; }
.m3-body { font-size: 13px; color: var(--m3-on-surface-variant); }
```

- [ ] **Step 5: Replace receipt & claim CSS**

```css
.m3-card--receipt { background: #fafaf5; border-radius: var(--m3-radius-md); overflow: hidden; box-shadow: var(--m3-elevation-1); }
.m3-receipt-paper { padding: 20px 16px; }
.m3-receipt-hospital { text-align: center; font-family: var(--m3-font-mono); font-size: 13px; font-weight: 700; color: var(--m3-on-surface); margin-bottom: 12px; }
.m3-receipt-stamp { text-align: center; font-size: 28px; color: var(--m3-error); margin-bottom: 10px; opacity: 0.5; }
.m3-receipt-divider { text-align: center; font-family: var(--m3-font-mono); font-size: 10px; color: #ccc; margin: 8px 0; }
.m3-receipt-date { text-align: center; font-family: var(--m3-font-mono); font-size: 12px; color: var(--m3-on-surface-variant); margin-bottom: 10px; }
.m3-receipt-item { display: flex; justify-content: space-between; padding: 4px 0; font-family: var(--m3-font-mono); font-size: 13px; }
.m3-receipt-total { display: flex; justify-content: space-between; padding: 4px 0; font-family: var(--m3-font-mono); font-size: 14px; font-weight: 700; border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 4px; }
.m3-claim-row { display: flex; justify-content: space-between; padding: 10px 14px; font-size: 13px; border-bottom: 1px solid var(--m3-outline-variant); }
.m3-claim-row:last-child { border-bottom: none; }
.m3-claim-row.total { font-weight: 700; font-size: 14px; background: var(--m3-surface-container); }
.m3-claim-field { display: flex; justify-content: space-between; padding: 10px 14px; font-size: 13px; border-bottom: 1px solid var(--m3-outline-variant); }
.m3-claim-field:last-child { border-bottom: none; }
.m3-claim-field span:first-child { color: var(--m3-on-surface-variant); }
.m3-claim-field span:last-child { font-weight: 500; text-align: right; }
.m3-claim-field.total { background: var(--m3-primary-container); font-weight: 700; }
.m3-claim-field.total span { font-weight: 700; color: var(--m3-primary); }
.m3-btn-group { display: flex; flex-direction: column; gap: 8px; }
```

- [ ] **Step 6: Verify**

Open browser. Navigate to Medication → Get a Prescription, Drug Interaction, or Lost Medication. Confirm: Rx document has elevation shadow, med list items are clean M3, drug interaction uses tonal cards, receipt has paper texture preserved, claim form has M3 fields.

---

### Task 9: Translation & Scan CSS

**Files:**
- Modify: `mediroute-mock.html` (`.translate-mini`, `.lt-*`, `.scan-*`, `.rx-camera` CSS blocks)

**Produces:** M3 translation UI, M3 scan interface

- [ ] **Step 1: Replace translation CSS**

```css
.m3-card--translate { background: var(--m3-surface); border-radius: var(--m3-radius-lg); box-shadow: var(--m3-elevation-1); overflow: hidden; }
.m3-card--translate .header { padding: 12px 14px; font-size: 14px; font-weight: 600; color: var(--m3-primary); border-bottom: 1px solid var(--m3-outline-variant); display: flex; align-items: center; gap: 8px; background: var(--m3-surface-container); }
.m3-mic-area { text-align: center; padding: 20px 0 12px; }
.m3-fab.small { width: 56px; height: 56px; border-radius: var(--m3-radius-lg); background: var(--m3-primary); color: var(--m3-on-primary); border: none; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; margin: 0 auto; box-shadow: var(--m3-elevation-2); }
.m3-fab.small.pulse { animation: m3Pulse 2s var(--m3-easing) infinite; }
.m3-translation-pair { display: flex; flex-direction: column; gap: 4px; padding: 0 14px; margin-bottom: 8px; }
.m3-translation-bubble { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: var(--m3-radius-md); cursor: pointer; font-size: 13px; gap: 8px; transition: background var(--m3-duration-short) var(--m3-easing); }
.m3-translation-bubble--user { background: var(--m3-primary-container); color: var(--m3-on-primary-container); align-self: flex-start; max-width: 85%; border-bottom-left-radius: var(--m3-radius-sm); }
.m3-translation-bubble--user:hover { background: #B8D0FA; }
.m3-translation-bubble--jp { background: var(--m3-surface-container); color: var(--m3-on-surface); align-self: flex-end; max-width: 85%; border-bottom-right-radius: var(--m3-radius-sm); text-align: right; }
.m3-translation-bubble--jp:hover { background: #DDE3EA; }
.m3-translation-bubble .ph { font-size: 14px; flex-shrink: 0; opacity: 0.5; }
```

- [ ] **Step 2: Replace scan CSS**

```css
.m3-card--camera { background: #1a1a1c; border-radius: var(--m3-radius-lg); padding: 24px; text-align: center; }
.m3-scan-viewfinder { width: 100%; }
.m3-scan-corners { width: 240px; height: 120px; margin: 0 auto 16px; border: 2px solid rgba(26,115,232,0.4); border-radius: var(--m3-radius-md); animation: scanPulse 2s ease-in-out infinite; }
.m3-scan-hint { font-size: 14px; color: white; font-weight: 500; }
.m3-scan-overlay { display: flex; align-items: center; justify-content: center; padding: 24px; background: #1a1a1c; border-radius: var(--m3-radius-lg); min-height: 200px; position: relative; overflow: hidden; }
.m3-scan-text { font-size: 14px; color: white; font-weight: 500; min-height: 20px; }
```

- [ ] **Step 3: Verify**

Open browser. Navigate to Translation → Pharmacy or Doctor Visit. Confirm: translation bubbles use M3 tone, mic button is a small FAB, scan camera view has M3 styling.

---

### Task 10: Hub CSS + FAB

**Files:**
- Modify: `mediroute-mock.html` (all `.hub-*` CSS blocks + add FAB CSS and JS)

**Produces:** M3 hub home screen with elevated cards, search bar, FAB

- [ ] **Step 1: Replace hub hero**

```css
.m3-hub-hero {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 4px 0 12px; gap: 16px;
}
.m3-hub-hero .text { flex: 1; }
.m3-display-small { font-size: 12px; color: var(--m3-on-surface-variant); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 4px; }
.m3-headline-medium { font-size: 24px; font-weight: 500; color: var(--m3-primary); letter-spacing: -0.02em; line-height: 1.1; }
.m3-body-medium { font-size: 12px; color: var(--m3-on-surface-variant); margin-top: 4px; max-width: 240px; line-height: 1.5; }
```

- [ ] **Step 2: Replace hub search**

```css
.m3-search-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px; background: var(--m3-surface-container);
  border: none; border-radius: var(--m3-radius-xl);
  margin-bottom: 4px; transition: box-shadow var(--m3-duration-short) var(--m3-easing);
}
.m3-search-bar:focus-within { box-shadow: var(--m3-elevation-1); }
.m3-search-bar input {
  flex: 1; border: none; outline: none;
  font-family: var(--m3-font-body); font-size: 14px;
  background: transparent; color: var(--m3-on-surface);
}
.m3-search-bar input::placeholder { color: var(--m3-on-surface-variant); }
.m3-search-bar .ph { color: var(--m3-on-surface-variant); font-size: 18px; }
```

- [ ] **Step 3: Replace hub grid (was bento, now M3 card grid)**

```css
.m3-label-large { font-size: 12px; color: var(--m3-on-surface-variant); font-weight: 600; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.04em; }
.m3-hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.m3-card--hub {
  background: var(--m3-surface); box-shadow: var(--m3-elevation-1);
  border-radius: var(--m3-radius-md); padding: 18px 16px;
  cursor: pointer; transition: box-shadow var(--m3-duration-short) var(--m3-easing);
  display: flex; flex-direction: column; gap: 8px;
  border: none;
}
.m3-card--hub:hover { box-shadow: var(--m3-elevation-2); }
.m3-card--hub:active { box-shadow: var(--m3-elevation-1); }
.m3-card--hub .icon {
  width: 40px; height: 40px; border-radius: var(--m3-radius-md);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.m3-card--hub .title { font-size: 15px; font-weight: 600; color: var(--m3-on-surface); }
.m3-card--hub .count { font-size: 11px; color: var(--m3-on-surface-variant); font-family: var(--m3-font-mono); font-weight: 500; }
.m3-card--hub .subtitle { font-size: 11px; color: var(--m3-on-surface-variant); line-height: 1.5; }
```

- [ ] **Step 4: Replace hub quick actions (chips)**

```css
.m3-chip-row { display: flex; gap: 8px; margin-top: 4px; }
```

- [ ] **Step 5: Replace hub recent section**

```css
.m3-section { margin-top: 20px; }
.m3-list-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  cursor: pointer; border-radius: var(--m3-radius-sm);
  transition: background var(--m3-duration-short) var(--m3-easing);
}
.m3-list-item:hover { background: var(--m3-surface-container); }
.m3-list-item .ph { color: var(--m3-primary); font-size: 16px; flex-shrink: 0; }
.m3-list-item .headline { font-size: 12px; font-weight: 500; }
.m3-list-item .trailing { font-size: 10px; color: var(--m3-on-surface-variant); margin-left: auto; }
```

- [ ] **Step 6: Replace hub footer**

```css
.m3-hub-footer { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; margin-top: 16px; cursor: pointer; border-radius: var(--m3-radius-md); font-size: 12px; font-weight: 600; color: var(--m3-on-surface-variant); transition: color var(--m3-duration-short) var(--m3-easing); }
.m3-hub-footer:hover { color: var(--m3-primary); background: var(--m3-primary-container); }
```

- [ ] **Step 7: Add FAB CSS**

```css
.m3-fab {
  position: fixed; bottom: 96px; right: calc((100vw - 390px) / 2 + 24px);
  width: 56px; height: 56px; border-radius: var(--m3-radius-lg);
  background: var(--m3-error); color: var(--m3-on-error);
  box-shadow: var(--m3-elevation-2); z-index: 150;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  transition: all var(--m3-duration-medium) var(--m3-easing);
}
.m3-fab:hover { box-shadow: var(--m3-elevation-3); transform: scale(1.05); }
.m3-fab:active { box-shadow: var(--m3-elevation-1); transform: scale(0.97); }
.m3-fab.pulse { animation: m3FabPulse 2s var(--m3-easing) infinite; }
@keyframes m3FabPulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(234,67,53,0.3); }
  50% { box-shadow: 0 4px 32px rgba(234,67,53,0.55); }
}
.m3-fab.hidden { transform: scale(0); opacity: 0; pointer-events: none; }
```

- [ ] **Step 8: Add FAB HTML+JS**

Add the FAB element inside the `.main-content` div, after the phone-wrapper:

```html
<button class="m3-fab pulse" id="emergencyFab" title="Emergency — Call 119" onclick="startEmergencyFromFab()">
  <i class="ph ph-ambulance"></i>
</button>
```

Add JS functions (add to the `<script>` block):

```javascript
function startEmergencyFromFab() {
  sessionState.currentRoute = 'chest-pain';
  sessionState.currentStep = 0;
  sessionState.visitedSteps = new Set([0]);
  sessionState.pathContext = { urgencyLevel: 1, severityColor: 'error' };
  document.getElementById('emergencyFab').classList.add('hidden');
  renderCurrentScreen();
  renderProgress();
  saveSession();
}

// Show/hide FAB based on current screen
function updateFabVisibility() {
  var fab = document.getElementById('emergencyFab');
  if (!fab) return;
  if (sessionState.currentRoute === 'hub' || sessionState.currentRoute === null) {
    fab.classList.remove('hidden');
  } else {
    fab.classList.add('hidden');
  }
}
```

- [ ] **Step 9: Verify**

Open browser. Confirm: hub home shows 4 M3 elevated cards with shadows, search bar has Surface Container fill, FAB pulses at bottom-right of phone frame. Press FAB → goes to Emergency chat. Press `H` to return to hub → FAB reappears.

---

### Task 11: JS Class Reference Migration

**Files:**
- Modify: `mediroute-mock.html` (all JS `render` functions — every `class="..."` string in template literals)

**Produces:** All JS-rendered HTML uses `.m3-*` class names, all 15 routes work

- [ ] **Step 1: Replace chat-rendered classes in JS**

Find the `renderChat` function and replace all CSS class strings:

| Old | New |
|---|---|
| `screen screen-chat` | `m3-screen m3-screen-chat` |
| `chat-header` | `m3-chat-header` |
| `chat-messages` | `m3-chat-messages` |
| `chat-bubble chat-bubble-user` | `m3-chat-bubble m3-chat-bubble--user` |
| `chat-bubble chat-bubble-assistant` | `m3-chat-bubble m3-chat-bubble--assistant` |
| `chat-time` | `m3-chat-time` |
| `chat-options` | `m3-chat-options` |
| `chat-option` | `m3-chip--choice` |
| `chat-option chat-option-type` | `m3-chip--choice type` |
| `typing-dots` | `m3-typing-dots` |
| `chat-input-bar` | `m3-chat-input` |
| `verdict-card` | `m3-card--verdict` |
| `verdict-header` | `header` |
| `verdict-confidence` | `confidence` |
| `verdict-action` | `m3-chip--assist` |
| `btn-primary` | `m3-btn-filled` |
| `chat-history-summary` | `m3-card--summary` |

- [ ] **Step 2: Replace severity/triage rendered classes**

In all triage screen render functions:

| Old | New |
|---|---|
| `screen screen-triage` | `m3-screen m3-screen-triage` |
| `severity-card` | `m3-card--tonal error` |
| `severity-badge` | `m3-chip--assist error` |
| `severity-reasoning` | `body` |
| `route-label` | `m3-chip--assist primary` |
| `btn-119 pulsing` | `m3-btn-filled error pulse` |
| `cost-reassurance` | `m3-card--tonal cost` |
| `emergency-call-header` | `m3-emergency-header` |
| `ec-status` | `m3-emergency-status` |
| `ec-timer` | `m3-timer` |
| `ec-progress` | `m3-progress-steps` |
| `ec-step` | `m3-progress-step` |
| `ec-instructions` | `m3-card` |
| `info-grid` | `m3-grid` |
| `info-card` | `m3-card` |
| `btn-secondary` | `m3-btn-outlined` |

- [ ] **Step 3: Replace info/clinic rendered classes**

| Old | New |
|---|---|
| `screen screen-info` | `m3-screen m3-screen-info` |
| `screen-header` | `m3-headline` |
| `screen-subtitle` | `m3-subtitle` |
| `screen screen-clinics` | `m3-screen m3-screen-clinics` |
| `clinic-list` | `m3-list` |
| `clinic-card` | `m3-list-item--card` |
| `clinic-card-top` | `top` |
| `badge` | `m3-chip--assist` |
| `badge badge-emergency` → | `m3-chip--assist error` |
| `badge badge-internal` → | `m3-chip--assist primary` |
| `badge badge-lang` → | `m3-chip--assist tertiary` |
| `clinic-meta` | `meta` |
| `btn-select` | `m3-btn-outlined small` |
| `map-mock` | `m3-map` |
| `map-grid` | `grid` |
| `map-pin` | `pin` |
| `map-label` | `label` |

- [ ] **Step 4: Replace form/script/booking rendered classes**

| Old | New |
|---|---|
| `screen screen-form` | `m3-screen m3-screen-form` |
| `intake-form-card` | `m3-card--form` |
| `intake-row` | `m3-form-row` |
| `intake-row intake-row-header` | `m3-form-row header` |
| `intake-col-jp` | `m3-form-col--jp` |
| `intake-col-en` | `m3-form-col--en` |
| `field-label` | `m3-label` |
| `field-value` | `m3-value` |
| `form-tip` | `m3-assistive-text` |
| `screen screen-script` | `m3-screen m3-screen-script` |
| `phone-call-bar` | `m3-call-bar` |
| `phone-number` | `m3-call-number` |
| `script-card` | `m3-card` |
| `script-text-jp` | `m3-script-text` |
| `script-text-romaji` | `m3-script-romaji` |
| `script-text-en` | `m3-script-en` |
| `script-divider` | `m3-divider` |
| `script-toggle` | `m3-text-btn` |
| `script-tip` | `m3-card--tonal warning` |
| `booking-progress` | `m3-progress-steps` |
| `booking-step` | `m3-progress-step` |
| `booking-tips` | `m3-card--tonal warning` |

- [ ] **Step 5: Replace medication/receipt/claim rendered classes**

| Old | New |
|---|---|
| `screen screen-receipt` | `m3-screen m3-screen-receipt` |
| `receipt-mock` | `m3-card--receipt` |
| `receipt-paper` | `m3-receipt-paper` |
| `receipt-hospital` | `m3-receipt-hospital` |
| `receipt-stamp` | `m3-receipt-stamp` |
| `receipt-divider` | `m3-receipt-divider` |
| `receipt-date` | `m3-receipt-date` |
| `receipt-item` | `m3-receipt-item` |
| `receipt-total` | `m3-receipt-total` |
| `ocr-result` | `m3-card` |
| `ocr-status` | `m3-card--tonal success` |
| `claim-summary` | `m3-card` |
| `claim-row` | `m3-claim-row` |
| `claim-row claim-total` | `m3-claim-row total` |
| `claim-form-card` | `m3-card` |
| `claim-form-header` | `m3-card .header` |
| `claim-section` | `m3-card .section` |
| `claim-section-title` | `m3-label` |
| `claim-field` | `m3-claim-field` |
| `claim-field claim-total-field` | `m3-claim-field total` |
| `claim-actions` | `m3-btn-group` |

- [ ] **Step 6: Replace medication/Rx rendered classes**

| Old | New |
|---|---|
| `screen screen-interaction` | `m3-screen m3-screen-interaction` |
| `interaction-card` | `m3-card--tonal warning` |
| `interaction-card interaction-critical` | `m3-card--tonal error` |
| `interaction-header` | `header` |
| `interaction-summary` | `summary` |
| `interaction-detail` | `body` |
| `severity-bar` | `m3-progress-linear` |
| `severity-fill` | `fill` |
| `severity-fill critical` | `fill error` |
| `suggested-question` | `m3-card--outlined` |
| `disclaimer` | `m3-disclaimer` |
| `rx-document` | `m3-card--rx` |
| `rx-doc-header` | `header` |
| `rx-doc-title` | `title` |
| `rx-doc-meta` | `meta` |
| `rx-meta-row` | `meta-row` |
| `rx-meds-list` | `m3-list` |
| `rx-med-item` | `m3-list-item` |
| `rx-med-top` | `top` |
| `rx-med-num` | `m3-chip--circle` |
| `rx-med-info` | `content` |
| `rx-med-name` | `headline` |
| `rx-med-en` | `supporting` |
| `rx-med-qty` | `trailing` |
| `rx-med-detail` | `m3-card--tonal primary` |
| `rx-detail-row` | `m3-detail-row` |
| `rx-doc-footer` | `footer` |
| `pickup-code-card` | `m3-card--tonal primary` |
| `puckup-label` | `m3-label` |
| `pickup-code` | `m3-code-display` |
| `pickup-drug` | `m3-body` |

- [ ] **Step 7: Replace translation/pharmacy rendered classes**

| Old | New |
|---|---|
| `translate-mini` | `m3-card--translate` |
| `translate-mini-header` | `header` |
| `lt-mic-area` | `m3-mic-area` |
| `lt-mic-btn pulsing` | `m3-fab small pulse` |
| `lt-mic-hint` | `m3-assistive-text` |
| `lt-bubbles` | `m3-translation-pair` |
| `lt-bubble lt-bubble-user` | `m3-translation-bubble m3-translation-bubble--user` |
| `lt-bubble lt-bubble-jp` | `m3-translation-bubble m3-translation-bubble--jp` |
| `rx-camera` | `m3-card--camera` |
| `rx-viewfinder` | `m3-scan-viewfinder` |
| `rx-corners` | `m3-scan-corners` |
| `rx-hint` | `m3-scan-hint` |
| `rx-result` | `m3-card` |
| `rx-drug-card` | `m3-card--tonal primary` |
| `rx-drug-icon` | `m3-drug-icon` |
| `rx-drug-name` | `m3-drug-name` |
| `rx-drug-detail` | `m3-drug-detail` |
| `pharmacy-progress` | `m3-progress-steps` |
| `pharmacy-step` | `m3-progress-step` |

- [ ] **Step 8: Replace insurance/cost rendered classes**

| Old | New |
|---|---|
| `ins-form` | `m3-form` |
| `ins-field` | `m3-form-field` |
| `ins-label` | `m3-label` |
| `ins-select` | `m3-outlined-select` |
| `ins-input` | `m3-outlined-text-field` |
| `ins-result` | `m3-card--tonal success` |
| `ins-result-header` | `header` |
| `ins-coverage-item` | `m3-coverage-row` |
| `cost-card` | `m3-card` |
| `cost-status` | `m3-status-text` |
| `covered-text` | `success` |
| `uncovered-text` | `error` |

- [ ] **Step 9: Replace other rendered classes**

| Old | New |
|---|---|
| `screen` (generic) | `m3-screen` |
| `screen-transition` | `m3-screen m3-screen-transition` |
| `transition-icon` | `m3-screen-transition .icon` |
| `btn-call` | `m3-btn-filled` |
| `btn-scan` | `m3-btn-scan` |
| `scan-overlay` | `m3-scan-overlay` |
| `scan-viewfinder` | `m3-scan-viewfinder` |
| `scan-corners` | `m3-scan-corners` |
| `scan-text` | `m3-scan-text` |
| `insurance-cover-card` | `m3-card` |
| `insurance-cover-header` | `header` |
| `insurance-cover-grid` | `m3-cover-grid` |
| `insurance-cover-item` | `m3-cover-item` |
| `insurance-cover-item yes` | `m3-cover-item success` |
| `insurance-cover-item warn` | `m3-cover-item warning` |
| `insurance-toggle-bar` | `m3-toggle-bar` |
| `toggle-switch` | `m3-toggle` |
| `toggle-btn` | `m3-toggle-btn` |
| `toggle-btn active` | `m3-toggle-btn active` |
| `intake-actions` | `m3-btn-row` |
| `route-map` | `m3-route-map` |
| `route-start` | `m3-route-start` |
| `route-end` | `m3-route-end` |
| `route-line` | `m3-route-line` |
| `clinic-detail-card` | `m3-card--detail` |
| `clinic-detail-row` | `row` |
| `detail-label` | `m3-label` |
| `detail-value` | `m3-value` |
| `confirm-label` | `m3-label` |
| `confirm-detail` | `m3-body` |
| `cost-amount` | `m3-cost` |
| `symptom-confirm` | `m3-card--tonal primary` |
| `no-insurance-card` | `m3-card--tonal warning` |
| `question-en` | `m3-question-en` |
| `question-jp` | `m3-question-jp` |

- [ ] **Step 10: Verify all 15 routes**

Open browser. Walk through every route:
1. Press `1` → Emergency → Chest Pain → triage → result → 119 call → end → `H` to hub
2. Clinic → Fever → triage → coverage → insurance → clinic search → booking → confirmed → intake → translate → Rx → pharmacy → pickup → drug check → receipt → claim → end
3. Medication → Get a Prescription → past visits → clinic detail → Rx document → pharmacist → end
4. Medication → Drug Interaction → input → alert → pharmacist → end
5. Medication → Lost Medication → pharmacy finder → replacement → booking → confirmed → end
6. Medication → Pre-Travel Check → select med → result → end
7. Translation → Pharmacy → live translate → receipt → end
8. Translation → Doctor Visit → live translate → phrases → end
9. Cost & Admin → coverage → insurance → explainer → receipt → visa warning → end

Keyboard shortcuts must work. All screens must render with M3 styling — no broken layouts, no missing styles, no teal elements remaining.

---

### Task 12: JS Progress Bar + Sidebar Cleanup

**Files:**
- Modify: `mediroute-mock.html` (JS: `renderProgressDots` → `renderProgress`, sidebar class references)

**Produces:** Working M3 linear progress bar, working M3 sidebar with correct JS references

- [ ] **Step 1: Replace renderProgressDots with renderProgress**

Add new function:

```javascript
function renderProgress() {
  var route = ROUTES[sessionState.currentRoute];
  var total = route ? route.screens.length : 1;
  var pct = total > 1 ? Math.round((sessionState.currentStep / (total - 1)) * 100) : 0;
  var fill = document.getElementById('progressFill');
  if (fill) fill.style.width = pct + '%';
}
```

- [ ] **Step 2: Update all calls to renderProgressDots**

Replace every `renderProgressDots()` call in the codebase with `renderProgress()`.

- [ ] **Step 3: Update sidebar JS references**

In JS, update `document.getElementById('techSidebar')` and any `sidebar-*` class references to `.m3-sidebar*`. The ID `techSidebar` stays the same. Update sidebar toggle logic to use `.m3-sidebar.visible` class.

- [ ] **Step 4: Verify**

Navigate through screens. Progress bar should fill from 0% to 100% as you advance. Sidebar ("What Gemini did") should toggle correctly.

---

### Task 13: Responsive & Print + Final Polish

**Files:**
- Modify: `mediroute-mock.html` (CSS: `@media` blocks, remaining old token references)

**Produces:** Mobile-responsive M3 layout, print-friendly output, zero old CSS tokens remaining

- [ ] **Step 1: Update responsive media query**

Replace the `@media (max-width: 767px)` block with updated selectors:

```css
@media (max-width: 767px) {
  .m3-top-app-bar { padding: 0 12px; height: 56px; }
  .m3-top-app-bar .logo { font-size: 17px; }
  .m3-step-indicator { display: none; }
  .main-content { flex-direction: column; align-items: center; padding: 16px 0; gap: 0; }
  .phone-wrapper { width: 100%; }
  .phone-frame { width: 100%; height: calc(100dvh - 56px - 72px); border-radius: 0; border: none; box-shadow: none; }
  .phone-notch { display: none; }
  .phone-screen { padding-top: 0; }
  .m3-sidebar { display: none !important; }
  .m3-bottom-bar { padding: 0 12px; height: 64px; }
  .m3-nav-btn { padding: 8px 14px; font-size: 13px; }
  .m3-grid { grid-template-columns: 1fr; }
  .m3-form-row { grid-template-columns: 1fr; }
  .m3-form-col--jp { border-right: none; border-bottom: 1px solid var(--m3-outline-variant); }
  .m3-card--tonal, .m3-card { border-radius: 0; }
  .m3-fab { right: 16px; bottom: 88px; }
}
```

- [ ] **Step 2: Update print media query**

```css
@media print {
  .m3-top-app-bar, .m3-bottom-bar, .phone-frame, .m3-sidebar { display: none !important; }
  .main-content { padding: 0; }
  body { background: white; }
  .phone-screen { width: 100%; max-width: 800px; margin: 0 auto; overflow: visible; height: auto; }
}
```

- [ ] **Step 3: Final sweep — remove any remaining old CSS variables**

Search the file for any remaining `var(--primary)`, `var(--error)`, `var(--warning)`, `var(--surface)`, `var(--surface-variant)`, `var(--on-surface)`, `var(--on-surface-variant)`, `var(--outline)`, `var(--font-display)`, `var(--font-body)`, `var(--shadow-card)`, `var(--shadow-elevated)`, `var(--transition-fast)`, `var(--transition-normal)`, `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-xl)`.

Replace each with the corresponding `--m3-*` variable.

Also search for any hardcoded teal `#0D9488` or `#0F766E` — replace with `var(--m3-primary)`.

- [ ] **Step 4: Update keyboard shortcut hints**

In the `showKeyboardHelp` or any toast/help function, update UI references to match M3 classes.

- [ ] **Step 5: Full verification pass**

Open in browser:
- Hub screen: M3 cards, FAB, search bar — all correct
- Press `1`: Emergency flow — all 4 sub-routes (Chest Pain, Bleeding, Head Injury, Child Emergency) — correct
- Press `2`: Clinic flow — Fever, Mild Symptoms, Injury, Dental — correct
- Press `3`: Medication — Prescription, Drug Interaction, Lost Med, Pre-Travel Check — correct
- Press `4`: Translation — Pharmacy, Doctor Visit — correct
- Press `5`: Cost & Admin — full flow — correct
- Keyboard shortcuts: `1-5`, `← →`, `H`, `R`, `Shift+R` — all work
- localStorage: refresh page, "Continue?" prompt appears
- Mobile: resize to < 767px, phone frame collapses to full-width
- Dark mode: not applicable (light mode only per spec)

- [ ] **Step 6: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: Material 3 redesign — Google-native tokens, typography, elevation, components"
```
