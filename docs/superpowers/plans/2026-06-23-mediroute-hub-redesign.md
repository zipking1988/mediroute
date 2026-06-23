# MediRoute Hub Redesign — Modern App-Style Home Screen

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the MediRoute hub screen as a modern mobile-app home screen with bento-grid category cards, status banner, quick actions, and full Phosphor icon coverage — within the existing vanilla HTML/CSS/JS single-file architecture.

**Architecture:** Single-file modification to `mediroute-mock.html`. Only `renderHub()`, `bindHubEvents()`, and new CSS classes are changed. No other JS, no CHAT_TREES, no route definitions, no state management touched. The hub becomes an app-style dashboard: greeting banner → emergency action → search → bento category grid → recent activity.

**Tech Stack:** Vanilla HTML/CSS/JS, Phosphor Icons (CDN), Outfit + DM Sans + JetBrains Mono (Google Fonts CDN), CSS Grid + Flexbox, no frameworks.

## Global Constraints

- **No emojis anywhere in the hub** — all Phosphor icons
- **Left-aligned headers per VARIANCE=8** — no centered text blocks
- **Single accent color (teal #0D9488)** — consistent throughout
- **CSS-only transitions** — `cubic-bezier(0.16,1,0.3,1)` spring timing
- **Tactile `:active` states** — `scale(0.98)` or `translateY(1px)` on press
- **No pure black** — `#1D1D1F` for text, `#2D2D30` for phone frame
- **Keep all existing functionality** — search, expand/collapse, route navigation, keyboard shortcuts, localStorage
- **JS must compile clean** — verify with `node --check` after each task

---
```

## File Structure

```
mediroute-mock.html
├── <style> block           ← ADD ~80 lines of new hub CSS classes
├── CATEGORIES array        ← NO CHANGE (already uses Phosphor icons)
├── renderHub() function    ← REWRITE — new HTML structure
└── bindHubEvents()         ← MODIFY — adapt selectors to new structure
```

## Task 1: Add Hub CSS

**Files:**
- Modify: `mediroute-mock.html` — add new CSS classes before the `</style>` closing tag

**Interfaces:**
- Produces: CSS classes `.hub-hero`, `.hub-emergency-cta`, `.hub-bento`, `.hub-bento-card`, `.hub-bento-icon`, `.hub-bento-label`, `.hub-bento-count`, `.hub-quick-actions`, `.hub-quick-btn`, `.hub-section-title`, `.hub-recent-item`

**What we build:** Modern app-style CSS for the hub. A bento grid of 4 cards (2×2 on top, 1 wide on bottom) plus a hero banner, emergency CTA, and quick actions row. No emojis.

**CSS to add** — insert BEFORE the `/* ── Responsive ── */` comment:

```css
    /* ── Hub: Modern App Home ── */
    .hub-hero {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 4px 0 12px; gap: 16px;
    }
    .hub-hero-text { flex: 1; }
    .hub-hero-greeting { font-size: 12px; color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 4px; }
    .hub-hero-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--primary); letter-spacing: -0.04em; line-height: 1.1; }
    .hub-hero-sub { font-size: 12px; color: var(--on-surface-variant); margin-top: 4px; max-width: 240px; line-height: 1.5; }

    .hub-emergency-cta {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 18px; background: var(--error); color: white;
      border-radius: var(--radius-lg); cursor: pointer; border: none;
      font-family: var(--font-body); font-size: 13px; font-weight: 700;
      box-shadow: 0 4px 16px rgba(220,38,38,0.25);
      transition: all var(--transition-fast);
      flex-shrink: 0; white-space: nowrap;
    }
    .hub-emergency-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(220,38,38,0.35); }
    .hub-emergency-cta:active { transform: translateY(0) scale(0.97); }
    .hub-emergency-cta .ph { font-size: 22px; }

    .hub-search-app {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 18px; background: var(--surface);
      border: 1px solid var(--outline); border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xs); margin-bottom: 4px;
      transition: all var(--transition-fast);
    }
    .hub-search-app:focus-within { border-color: var(--primary); box-shadow: var(--shadow-sm); }
    .hub-search-app input {
      flex: 1; border: none; outline: none;
      font-family: var(--font-body); font-size: 14px; background: transparent;
    }
    .hub-search-app .ph { color: var(--on-surface-variant); font-size: 18px; }

    .hub-section-title {
      font-size: 10px; color: var(--on-surface-variant);
      text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
      margin: 20px 0 10px; font-family: var(--font-mono);
    }

    .hub-bento {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto;
      gap: 10px;
    }
    .hub-bento-card {
      background: var(--surface); border: 1px solid var(--outline);
      border-radius: var(--radius-lg); padding: 18px 16px;
      cursor: pointer; transition: all var(--transition-fast);
      display: flex; flex-direction: column; gap: 8px;
      position: relative; overflow: hidden;
    }
    .hub-bento-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); border-color: var(--primary); }
    .hub-bento-card:active { transform: translateY(0) scale(0.98); }
    .hub-bento-card.wide { grid-column: 1 / -1; flex-direction: row; align-items: center; gap: 16px; padding: 20px; }
    .hub-bento-icon {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .hub-bento-label {
      font-family: var(--font-display); font-size: 15px; font-weight: 700;
      letter-spacing: -0.02em; color: var(--on-surface);
    }
    .hub-bento-count {
      font-size: 11px; color: var(--on-surface-variant);
      font-family: var(--font-mono); font-weight: 500;
    }
    .hub-bento-subtitle {
      font-size: 11px; color: var(--on-surface-variant); line-height: 1.5;
    }
    .hub-bento-expand {
      position: absolute; top: 12px; right: 14px;
      width: 24px; height: 24px; border-radius: 50%;
      background: var(--surface-variant); display: flex;
      align-items: center; justify-content: center;
      font-size: 14px; cursor: pointer; color: var(--on-surface-variant);
      transition: all var(--transition-fast);
      font-family: var(--font-mono); font-weight: 700;
    }
    .hub-bento-expand:hover { background: var(--primary); color: white; }
    .hub-bento-subs {
      display: none; padding-top: 4px;
      border-top: 1px solid var(--outline); margin-top: 4px;
    }
    .hub-bento-subs.open { display: block; }
    .hub-bento-subitem {
      padding: 7px 0; font-size: 12px; cursor: pointer;
      color: var(--on-surface-variant); transition: all var(--duration-fast);
      display: flex; align-items: center; gap: 6px;
    }
    .hub-bento-subitem:hover { color: var(--primary); padding-left: 4px; }
    .hub-bento-subitem::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--outline); flex-shrink: 0; }
    .hub-bento-subitem:hover::before { background: var(--primary); }

    .hub-quick-actions {
      display: flex; gap: 8px; margin-top: 4px;
    }
    .hub-quick-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 14px 8px; background: var(--surface); border: 1px solid var(--outline);
      border-radius: var(--radius-md); cursor: pointer;
      transition: all var(--transition-fast); font-family: var(--font-body);
    }
    .hub-quick-btn:hover { border-color: var(--primary); background: #F0FDFA; transform: translateY(-1px); }
    .hub-quick-btn:active { transform: translateY(0) scale(0.97); }
    .hub-quick-btn .ph { font-size: 22px; }
    .hub-quick-btn span { font-size: 11px; font-weight: 600; color: var(--on-surface); }

    .hub-recent-section { margin-top: 20px; }
    .hub-recent-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      cursor: pointer; border-radius: var(--radius-sm);
      transition: all var(--duration-fast);
    }
    .hub-recent-item:hover { background: var(--surface-variant); }
    .hub-recent-item .ph { color: var(--primary); font-size: 16px; flex-shrink: 0; }
    .hub-recent-item-label { font-size: 12px; font-weight: 500; }
    .hub-recent-item-time { font-size: 10px; color: var(--on-surface-variant); margin-left: auto; }

    .hub-footer-action {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px; margin-top: 16px; cursor: pointer;
      border-radius: var(--radius-md); font-size: 12px; font-weight: 600;
      color: var(--on-surface-variant); transition: all var(--duration-fast);
      border: 1px dashed var(--outline); font-family: var(--font-body);
    }
    .hub-footer-action:hover { color: var(--primary); border-color: var(--primary); background: #F0FDFA; }

    @media (max-width: 767px) {
      .hub-bento { gap: 8px; }
      .hub-bento-card { padding: 14px 12px; }
      .hub-bento-label { font-size: 13px; }
      .hub-emergency-cta { padding: 12px 14px; font-size: 12px; }
    }
```

---

## Task 2: Rewrite renderHub()

**Files:**
- Modify: `mediroute-mock.html` — replace the entire `renderHub()` function body (lines ~1915-1949)

**Interfaces:**
- Consumes: `CATEGORIES` array (already Phosphor, Task 0), `ROUTES`, `sessionState.pastRoutes`, `timeAgo()`
- Produces: New hub HTML rendered into `#phoneScreen`

**What to do:** Replace the renderHub function to generate the modern app-style hub. The new hub has:
1. **Greeting banner** — "Good morning/afternoon" + user name + subtitle
2. **Emergency CTA** — prominent red "Call 119" button (top-right)
3. **Search bar** — rounded pill with Phosphor magnifying glass
4. **Section title** — "QUICK ACCESS" in monospace uppercase
5. **Bento grid** — 4 cards (Emergency, Clinic, Medication, Translation) in 2×2, Cost as 1 wide spanning card
6. **Quick actions** — 3 small buttons (Clinic Finder, Drug Check, Translate)
7. **Recent sessions** — if history exists
8. **Footer** — "New Session" dashed button

**Full replacement code for renderHub function (lines 1914-1948):**

```javascript
    function renderHub() {
      const hasHistory = sessionState.pastRoutes.length > 0;
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      document.getElementById("phoneScreen").innerHTML = `
        <div class="screen" style="background:var(--surface);padding:20px 18px;gap:0;min-height:100%;">
          <div class="hub-hero">
            <div class="hub-hero-text">
              <div class="hub-hero-greeting">${greeting}</div>
              <div class="hub-hero-title">MediRoute</div>
              <div class="hub-hero-sub">AI medical companion for travelers in Japan</div>
            </div>
            <button class="hub-emergency-cta" onclick="startRoute('chest-pain')" title="Emergency">
              <i class="ph ph-phone-call"></i> 119
            </button>
          </div>
          <div class="hub-search-app"><i class="ph ph-magnifying-glass"></i><input type="text" id="hubSearch" placeholder="Describe symptoms or name a medication..."></div>
          <div class="hub-section-title">Quick Access</div>
          <div class="hub-bento">
            ${CATEGORIES.slice(0, 4).map(cat => `
              <div class="hub-bento-card" data-category="${cat.id}" id="bento-${cat.id}">
                <div class="hub-bento-icon" style="background:${cat.color}15;color:${cat.color};"><i class="${cat.icon}"></i></div>
                <div class="hub-bento-label">${cat.label}</div>
                <div class="hub-bento-count">${cat.count} routes available</div>
                <div class="hub-bento-expand" id="bento-expand-${cat.id}" data-cat="${cat.id}">+</div>
                <div class="hub-bento-subs" id="bento-subs-${cat.id}">
                  ${cat.routeOrder.map(rk => `<div class="hub-bento-subitem" data-route="${rk}">${ROUTES[rk].label}</div>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          <div class="hub-quick-actions">
            <div class="hub-quick-btn" data-route="chest-pain"><i class="ph ph-heartbeat" style="color:var(--error);"></i><span>Chest Pain</span></div>
            <div class="hub-quick-btn" data-route="moderate-fever"><i class="ph ph-thermometer" style="color:var(--warning);"></i><span>Fever</span></div>
            <div class="hub-quick-btn" data-route="pharmacy-translate"><i class="ph ph-translate" style="color:var(--primary);"></i><span>Translate</span></div>
            <div class="hub-quick-btn" data-route="pre-travel-check"><i class="ph ph-airplane-takeoff" style="color:var(--primary);"></i><span>Travel Meds</span></div>
          </div>
          ${hasHistory ? `
            <div class="hub-recent-section">
              <div class="hub-section-title">Recent Sessions</div>
              ${sessionState.pastRoutes.slice(-3).reverse().map(p => `
                <div class="hub-recent-item" data-route="${p.route}">
                  <i class="ph ph-clock-counter-clockwise"></i>
                  <span class="hub-recent-item-label">${ROUTES[p.route]?.label||p.route}</span>
                  <span class="hub-recent-item-time">${timeAgo(p.timestamp)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <div class="hub-footer-action" id="hubNewSession">
            <i class="ph ph-arrow-counter-clockwise"></i> New Session
          </div>
        </div>`;
      bindHubEvents();
    }
```

---

## Task 3: Rewrite bindHubEvents()

**Files:**
- Modify: `mediroute-mock.html` — replace `bindHubEvents()` function (lines ~1955-1990)

**Interfaces:**
- Consumes: `CATEGORIES`, `ROUTES`, `startRoute()`, `matchKeywordRoute()`, Hub CSS classes from Task 1
- Produces: Event listeners bound to new hub DOM elements

**What to do:** Update event listener selectors to match the new hub structure. The old selectors targeted `.hub-category-main`, `.hub-expand`, `.hub-subitem`, `.hub-recent`. New selectors target `.hub-bento-card`, `.hub-bento-expand`, `.hub-bento-subitem`, `.hub-recent-item`, `.hub-quick-btn`.

**Full replacement:**

```javascript
    function bindHubEvents() {
      // Bento card click → start first route in category
      document.querySelectorAll('.hub-bento-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.hub-bento-expand') || e.target.closest('.hub-bento-subitem')) return;
          const catId = card.dataset.category;
          const cat = CATEGORIES.find(c => c.id === catId);
          if (cat) startRoute(cat.routeOrder[0]);
        });
      });

      // Bento expand button → toggle submenu
      document.querySelectorAll('.hub-bento-expand').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const catId = btn.dataset.cat;
          const subs = document.getElementById('bento-subs-' + catId);
          const isOpen = subs.classList.contains('open');
          // Close all others
          document.querySelectorAll('.hub-bento-subs.open').forEach(s => s.classList.remove('open'));
          document.querySelectorAll('.hub-bento-expand').forEach(b => b.textContent = '+');
          if (!isOpen) { subs.classList.add('open'); btn.textContent = '\u2212'; }
        });
      });

      // Bento subitem click → start specific route
      document.querySelectorAll('.hub-bento-subitem').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          startRoute(item.dataset.route);
        });
      });

      // Quick action buttons
      document.querySelectorAll('.hub-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => startRoute(btn.dataset.route));
      });

      // Recent session items
      document.querySelectorAll('.hub-recent-item').forEach(item => {
        item.addEventListener('click', () => startRoute(item.dataset.route));
      });

      // Search
      const searchInput = document.getElementById('hubSearch');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const match = matchKeywordRoute(searchInput.value);
          document.querySelectorAll('.hub-bento-card').forEach(c => {
            c.style.opacity = match ? '0.4' : '1';
            c.style.transition = 'opacity 200ms';
          });
          if (match) {
            const catId = ROUTES[match].category;
            const card = document.getElementById('bento-' + catId);
            if (card) { card.style.opacity = '1'; card.style.boxShadow = '0 0 0 2px var(--primary)'; }
          }
        });
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { const match = matchKeywordRoute(searchInput.value); if (match) startRoute(match); }
        });
      }

      // New session
      const newBtn = document.getElementById('hubNewSession');
      if (newBtn) newBtn.addEventListener('click', () => { clearState(); renderHub(); });
    }
```

---

## Task 4: JS Syntax Verification

**Files:**
- Verify: `mediroute-mock.html`

- [ ] **Step 1: Extract and syntax-check JS**

```bash
cd /Applications/MAMP/htdocs/agent-pipeline && node -e "
const fs=require('fs');const h=fs.readFileSync('mediroute-mock.html','utf8');
const m=h.match(/<script>([\s\S]*?)<\/script>/);
fs.writeFileSync('/tmp/hub-check.js',m[1]);
" && node --check /tmp/hub-check.js 2>&1
```

Expected: No output (clean compile)

- [ ] **Step 2: Verify key functions exist**

```bash
grep -c "function renderHub\|function bindHubEvents\|function timeAgo\|function startRoute\|function goToHub" mediroute-mock.html
```

Expected: 5

- [ ] **Step 3: Verify no broken references**

```bash
grep -c "ph ph-" mediroute-mock.html
```

Expected: > 100 (Phosphor icon usage preserved)

- [ ] **Step 4: Verify hub is functional**

Open `mediroute-mock.html` in browser:
- [ ] Greeting banner shows with time-based greeting
- [ ] Emergency 119 button visible (top right, red)
- [ ] 4 bento cards in 2×2 grid with icons
- [ ] Cost card spans full width below
- [ ] Click card → starts route
- [ ] Click `+` expand → shows route submenu
- [ ] Click `−` → collapses submenu  
- [ ] Click route in submenu → starts that route
- [ ] Quick action buttons work (Chest Pain, Fever, Translate, Travel Meds)
- [ ] Search filters highlight matching category
- [ ] Recent sessions show (if history exists)
- [ ] "New Session" clears state and re-renders hub
- [ ] Keyboard shortcuts `1-5`, ← →, H, R still work
- [ ] localStorage persists sessions across refresh

## Task 5: Self-Review Checklist

- [ ] Spec coverage: All hub requirements met (bento grid, emergency CTA, search, quick actions, recent sessions, new session)
- [ ] No emojis in hub HTML/CSS — verified with grep
- [ ] No centered text in hub — all left-aligned
- [ ] All interactive elements have `:active` tactile feedback
- [ ] Spring-like transitions on hover/active
- [ ] Grain overlay still visible (body::after preserved)
- [ ] Top bar frosted glass still works
- [ ] Nav bar frosted glass still works
- [ ] All existing routes functional
- [ ] No phantom imports or missing dependencies
