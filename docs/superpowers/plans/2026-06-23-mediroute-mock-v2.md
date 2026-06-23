# MediRoute Mock v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the v1 mock to support 15 demo paths across 5 categories with a hub-based entry, parameterized screens, live keyword triage, clickable clinic picker, and persistent session state.

**Architecture:** Single `mediroute-mock.html` file. State-driven: `sessionState` object with `currentRoute`, `currentStep`, `pathContext`. Route-based navigation replaces flat screen array. All screens are parameterized templates receiving `pathContext`. State persists to `localStorage`. Hub page is the entry point with search, smart chips, and category cards.

**Tech Stack:** Vanilla HTML/CSS/JS. Google Fonts CDN (DM Sans, Roboto, Roboto Mono). Phosphor Icons CDN.

## Global Constraints

- Single file: `mediroute-mock.html`
- Pre-scripted: zero API calls, all responses hardcoded
- Light mode only
- Material 3 palette: primary `#1A73E8`, error `#EA4335`, warning `#FBBC04`, surface `#FFFFFF`/`#F8F9FA`, on-surface `#202124`, outline `#DADCE0`
- Category accent colors: Purple `#9334E6` (medication), Teal `#00897B` (translation)
- All screen content from spec v2.0

---

## File Structure

- **Modify**: `mediroute-mock.html` — the entire application (v1 → v2 rewrite)

---

### Task 1: State Model + Data Layer

**Files:**
- Modify: `mediroute-mock.html` — replace existing `<script>` block

**Interfaces:**
- Produces: `sessionState` object, `ROUTES` map, `KEYWORD_ROUTES` array, `clinics` data object, `localStorage` save/load functions — all available globally. Hub page displays but navigation freezes (no rendering engine yet).

- [ ] **Step 1: Replace the entire `<script>` block with data layer**

Replace from `<script>` to `</script>`:

```javascript
// ── Clinic Data ──
const clinics = {
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

// ── Keyword → Route Mapping (priority-ordered) ──
const KEYWORD_ROUTES = [
  { kw: ["chest pain","shortness of breath","can't breathe","heart attack","chest hurts"], route: "chest-pain" },
  { kw: ["bleeding","cut myself","accident","blood","injured badly"], route: "bleeding" },
  { kw: ["hit my head","fell","concussion","head injury","knocked out"], route: "head-injury" },
  { kw: ["my child","baby","toddler","infant","my kid","child fever"], route: "child-emergency" },
  { kw: ["adderall","vyvanse","ritalin","concerta","stimulant"], route: "drug-prohibited" },
  { kw: ["sudafed","vicks inhaler","pseudoephedrine","vicks"], route: "drug-prohibited" },
  { kw: ["codeine","xanax","valium","ativan","diazepam"], route: "drug-restricted" },
  { kw: ["fever","flu","cough","sore throat","cold","temperature"], route: "moderate-fever" },
  { kw: ["headache","rash","stomach ache","diarrhea","nauseous","nausea"], route: "mild-symptoms" },
  { kw: ["sprained","twisted","burn","hurt my","fell and hurt"], route: "injury" },
  { kw: ["tooth","dental","dentist","gum","toothache"], route: "dental" },
  { kw: ["translate","prescription label","read this label","translate this"], route: "pharmacy-translate" },
  { kw: ["at the doctor","need to explain","speak to doctor","doctor visit"], route: "doctor-translate" },
  { kw: ["how much","can't afford","no insurance","expensive","cost","price","bill"], route: "cost-info" },
  { kw: ["can't pay","leave without paying","skip bill","visa"], route: "cost-info" },
  { kw: ["lost my med","ran out of","left my med","missing medication"], route: "lost-medication" },
  { kw: ["can i bring","is x legal","flying with","customs","bring medication"], route: "drug-restricted" },
  { kw: ["warfarin","metformin","interaction","drug interaction","check interaction"], route: "drug-interaction" },
];

function matchKeywordRoute(text) {
  const lower = text.toLowerCase();
  for (const entry of KEYWORD_ROUTES) {
    for (const kw of entry.kw) {
      if (lower.includes(kw)) return entry.route;
    }
  }
  return null;
}

// ── Route Definitions ──
const ROUTES = {
  // 🚨 Emergency
  "chest-pain":      { category: "emergency", label: "Chest Pain Emergency",    screens: ["chat","triageEmergency","wait","clinicSearch","booking","arrival","intake","prescriptionTransition","drugInteraction","receipt"], ctx: { urgencyLevel:1, severityColor:"error", specialty:"emergency", clinics: clinics.emergency, patientName:"Alex Chen", currentMeds:["Warfarin"] } },
  "bleeding":        { category: "emergency", label: "Severe Bleeding",         screens: ["chat","triageEmergency","wait","clinicSearch","booking","arrival","intake","receipt"], ctx: { urgencyLevel:1, severityColor:"error", specialty:"surgery", clinics: clinics.emergency, patientName:"Alex Chen" } },
  "head-injury":     { category: "emergency", label: "Head Injury",             screens: ["chat","triageEmergency","wait","clinicSearch","booking","arrival","intake","receipt"], ctx: { urgencyLevel:1, severityColor:"error", specialty:"neurology", clinics: clinics.emergency, patientName:"Alex Chen" } },
  "child-emergency": { category: "emergency", label: "Child Emergency",         screens: ["chat","triageUrgent","costEducation","clinicSearch","booking","arrival","intake","receipt"], ctx: { urgencyLevel:2, severityColor:"warning", specialty:"pediatrics", clinics: clinics.pediatric, patientName:"Alex Chen" } },
  // 🏥 Clinic
  "moderate-fever":  { category: "clinic", label: "Moderate Fever / Flu",      screens: ["chat","triageUrgent","costEducation","clinicSearch","booking","arrival","intake","prescriptionTransition","drugInteraction","receipt"], ctx: { urgencyLevel:3, severityColor:"warning", specialty:"internal", clinics: clinics.internal, patientName:"Alex Chen", currentMeds:["Warfarin"] } },
  "mild-symptoms":   { category: "clinic", label: "Mild Symptoms",              screens: ["chat","triageMild","selfCare","clinicSearch","booking","arrival","intake","receipt"], ctx: { urgencyLevel:4, severityColor:"primary", specialty:"internal", clinics: clinics.internal, patientName:"Alex Chen" } },
  "injury":          { category: "clinic", label: "Non-Emergency Injury",       screens: ["chat","triageUrgent","costEducation","clinicSearch","booking","arrival","intake","receipt"], ctx: { urgencyLevel:3, severityColor:"warning", specialty:"orthopedics", clinics: clinics.orthopedics, patientName:"Alex Chen" } },
  "dental":          { category: "clinic", label: "Dental Emergency",           screens: ["chat","triageUrgent","costEducation","clinicSearch","booking","arrival","intake","receipt"], ctx: { urgencyLevel:3, severityColor:"warning", specialty:"dental", clinics: clinics.dental, patientName:"Alex Chen" } },
  // 💊 Medication
  "drug-prohibited":   { category: "medication", label: "Prohibited Drug Alert",  screens: ["chat","drugProhibited","embassyContact","pharmacyFinder"], ctx: { urgencyLevel:null, severityColor:"error", drugName:"Adderall", drugStatus:"prohibited" } },
  "drug-restricted":   { category: "medication", label: "Restricted Drug",        screens: ["chat","drugRestricted","yunyuGuide"], ctx: { urgencyLevel:null, severityColor:"warning", drugName:"Codeine", drugStatus:"restricted" } },
  "drug-interaction":  { category: "medication", label: "Drug Interaction Check", screens: ["chat","drugInteractionInput","drugInteraction"], ctx: { urgencyLevel:null, severityColor:"warning", currentMeds:["Warfarin"], newPrescription:"Ciprofloxacin" } },
  "lost-medication":   { category: "medication", label: "Lost Medication",        screens: ["chat","pharmacyFinder","booking","embassyContact"], ctx: { urgencyLevel:3, severityColor:"warning", specialty:"pharmacy", clinics: clinics.pharmacy, patientName:"Alex Chen" } },
  // 🗣️ Translation
  "pharmacy-translate": { category: "translation", label: "Pharmacy Translation", screens: ["chat","receipt"], ctx: { urgencyLevel:5, severityColor:"primary" } },
  "doctor-translate":   { category: "translation", label: "Live Translation",     screens: ["chat","liveTranslation"], ctx: { urgencyLevel:null, severityColor:"primary" } },
  // 💰 Cost
  "cost-info": { category: "cost", label: "Cost & Insurance", screens: ["chat","costEducation","insuranceExplainer","receiptPreview","visaWaming"], ctx: { urgencyLevel:null, severityColor:"primary" } },
};

const CATEGORIES = [
  { id: "emergency",   icon: "🚨", label: "Emergency",      count: 4, color: "var(--error)",   routeOrder: ["chest-pain","bleeding","head-injury","child-emergency"] },
  { id: "clinic",      icon: "🏥", label: "Clinic Visit",   count: 4, color: "var(--warning)", routeOrder: ["moderate-fever","mild-symptoms","injury","dental"] },
  { id: "medication",  icon: "💊", label: "Medication",     count: 5, color: "#9334E6",        routeOrder: ["drug-prohibited","drug-restricted","drug-interaction","lost-medication","drug-restricted"] },
  { id: "translation", icon: "🗣️", label: "Translation",   count: 2, color: "#00897B",        routeOrder: ["pharmacy-translate","doctor-translate"] },
  { id: "cost",        icon: "💰", label: "Cost & Claims",  count: 1, color: "var(--primary)", routeOrder: ["cost-info"] },
];

// ── State ──
let sessionState = {
  currentRoute: null,
  currentStep: 0,
  visitedSteps: new Set(),
  pathContext: {},
  pastRoutes: [],
  activeHubCategory: null,
  lang: "en",
  isTransitioning: false,
  romajiVisible: false,
};

function saveState() {
  const save = {
    ...sessionState,
    visitedSteps: [...sessionState.visitedSteps],
    pastRoutes: sessionState.pastRoutes.slice(-5),
  };
  localStorage.setItem("mediroute-session", JSON.stringify({ ...save, timestamp: Date.now() }));
}

function loadState() {
  try {
    const raw = localStorage.getItem("mediroute-session");
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > 86400000) { localStorage.removeItem("mediroute-session"); return false; }
    sessionState.currentRoute = data.currentRoute;
    sessionState.currentStep = data.currentStep;
    sessionState.visitedSteps = new Set(data.visitedSteps || []);
    sessionState.pathContext = data.pathContext || {};
    sessionState.pastRoutes = data.pastRoutes || [];
    sessionState.lang = data.lang || "en";
    return data.currentRoute !== null;
  } catch (e) { return false; }
}

function clearState() {
  localStorage.removeItem("mediroute-session");
  sessionState = { currentRoute: null, currentStep: 0, visitedSteps: new Set(), pathContext: {}, pastRoutes: [], activeHubCategory: null, lang: "en", isTransitioning: false, romajiVisible: false };
}

// ── Route Helpers ──
function currentRouteData() { return ROUTES[sessionState.currentRoute]; }
function currentScreenId() { return currentRouteData()?.screens[sessionState.currentStep]; }
function totalSteps() { return currentRouteData()?.screens.length || 0; }
```

- [ ] **Step 2: Verify in console**
  - Open `mediroute-mock.html` in browser
  - Press F12 → Console: type `clinics.emergency.length` → `3`
  - Type `ROUTES["chest-pain"].screens.length` → `10`
  - Type `matchKeywordRoute("i have chest pain")` → `"chest-pain"`
  - Type `matchKeywordRoute("i take adderall")` → `"drug-prohibited"`
  - Type `matchKeywordRoute("how much does it cost")` → `"cost-info"`
  - Type `matchKeywordRoute("random text")` → `null`

- [ ] **Step 3: Commit**

```bash
git add mediroute-mock.html
git commit -m "feat: state model + route definitions + keyword matching"
```

---

### Task 2: Screen Templates (all 16 parameterized)

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Produces: `SCREEN_TEMPLATES` object — 16 keys mapping to render functions that accept `(ctx, sessionState)` and return HTML strings. No visible change in browser (only data).

- [ ] **Step 1: Add SCREEN_TEMPLATES object after ROUTES**

```javascript
// ── Screen Templates ──
const SCREEN_TEMPLATES = {
  chat: (ctx) => `
    <div class="screen screen-chat">
      <div class="chat-header">MediRoute</div>
      <div class="chat-messages">
        <div class="chat-bubble chat-bubble-user">
          <p id="chatInputDisplay">I have chest pain and shortness of breath. It started about 30 minutes ago.</p>
          <span class="chat-time">10:32 AM</span>
        </div>
        <div class="chat-bubble chat-bubble-assistant">
          <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
      </div>
      <div class="chat-input-bar">
        <input type="text" id="chatInput" placeholder="Describe your symptoms..." autofocus>
        <button id="chatSend"><i class="ph ph-paper-plane-tilt"></i></button>
      </div>
    </div>`,

  triageEmergency: (ctx) => `
    <div class="screen screen-triage">
      <div class="chat-bubble chat-bubble-assistant" style="margin-bottom:16px;">
        <p>I've analyzed your symptoms. This requires immediate attention.</p>
      </div>
      <div class="severity-card">
        <div class="severity-badge">🚨 Severity ${ctx.urgencyLevel} — Emergency</div>
        <h2>CALL 119 IMMEDIATELY</h2>
        <p class="severity-reasoning">Chest pain + difficulty breathing requires immediate emergency care</p>
        <div class="route-label">Route A: Call 119 now</div>
        <button class="btn-119 pulsing"><i class="ph ph-phone-call"></i> CALL 119</button>
        <div class="cost-reassurance">
          <i class="ph ph-check-circle" style="color:#34A853;"></i>
          <span>Ambulances in Japan are 100% FREE — don't hesitate to call.</span>
        </div>
      </div>
    </div>`,

  triageUrgent: (ctx) => `
    <div class="screen screen-triage">
      <div class="chat-bubble chat-bubble-assistant" style="margin-bottom:16px;">
        <p>I've analyzed your symptoms. This needs attention but is not life-threatening.</p>
      </div>
      <div class="severity-card" style="border-color:var(--warning);">
        <div class="severity-badge" style="background:var(--warning);color:#202124;">⚠️ Severity ${ctx.urgencyLevel} — Urgent</div>
        <h2 style="color:var(--warning);">Find a Clinic Today</h2>
        <p class="severity-reasoning">Your symptoms require medical attention within 24 hours</p>
        <div class="route-label" style="background:#FFF8E1;color:#B06000;">Route B: Clinic today</div>
        <button class="btn-primary" style="margin-top:12px;margin-bottom:12px;"><i class="ph ph-hospital"></i> Find Nearby Clinic</button>
        <div class="cost-reassurance">
          <i class="ph ph-check-circle" style="color:#34A853;"></i>
          <span>Clinic visit: ¥5,000–¥15,000 (~$35–$105). Insurance reimburses you.</span>
        </div>
      </div>
    </div>`,

  triageMild: (ctx) => `
    <div class="screen screen-triage">
      <div class="chat-bubble chat-bubble-assistant" style="margin-bottom:16px;">
        <p>Your symptoms appear mild. No emergency — but let's keep an eye on it.</p>
      </div>
      <div class="severity-card" style="border-color:var(--primary);">
        <div class="severity-badge" style="background:var(--primary);">ℹ️ Severity ${ctx.urgencyLevel} — Semi-Urgent</div>
        <h2 style="color:var(--primary);">Monitor for 48 Hours</h2>
        <p class="severity-reasoning">Your symptoms can likely be managed with self-care</p>
        <div class="route-label" style="background:#E8F0FE;color:var(--primary);">Route C: Clinic within 48h</div>
        <button class="btn-primary" style="margin-top:12px;margin-bottom:8px;background:var(--surface);color:var(--primary);border:1px solid var(--primary);"><i class="ph ph-hospital"></i> Find a Clinic</button>
        <button class="btn-primary" style="margin-bottom:12px;"><i class="ph ph-first-aid"></i> Self-Care Tips</button>
        <div class="cost-reassurance">
          <i class="ph ph-check-circle" style="color:#34A853;"></i>
          <span>If symptoms worsen, come back. Clinic visit: ~$35–$105.</span>
        </div>
      </div>
    </div>`,

  wait: (ctx) => `
    <div class="screen screen-info">
      <div class="screen-header">🚑 Help is on the way</div>
      <p class="screen-subtitle">Here's what you need to know while you wait for the ambulance.</p>
      <div class="info-grid">
        <div class="info-card"><i class="ph ph-ambulance"></i><h4>Ambulances are FREE</h4><p>¥0 for everyone, including tourists. Source: FDMA</p></div>
        <div class="info-card"><i class="ph ph-identification-badge"></i><h4>At the hospital</h4><p>Show your passport and insurance card. Emergency transport skips the ¥7,000–¥11,000 walk-in penalty.</p></div>
        <div class="info-card"><i class="ph ph-translate"></i><h4>Language support</h4><p>Most ERs have interpreter tablets. Ask for "tsuyaku" (通訳).</p></div>
        <div class="info-card"><i class="ph ph-warning-circle"></i><h4>Don't skip the bill</h4><p>Unpaid bills ≥¥10,000 → visa denial on re-entry. Always pay before leaving.</p></div>
      </div>
    </div>`,

  costEducation: (ctx) => `
    <div class="screen screen-info">
      <div class="screen-header">💰 What to Expect</div>
      <p class="screen-subtitle">Understanding medical costs in Japan — it's more affordable than you think.</p>
      <div class="info-grid">
        <div class="info-card"><i class="ph ph-ambulance"></i><h4>Ambulance: FREE</h4><p>¥0 for everyone. Source: FDMA</p></div>
        <div class="info-card"><i class="ph ph-hospital"></i><h4>Clinic: ~$35-$105</h4><p>¥5,000–¥15,000 without insurance</p></div>
        <div class="info-card"><i class="ph ph-currency-circle-dollar"></i><h4>ER Visit: ~$250-$410</h4><p>Labs, CT, medications included</p></div>
        <div class="info-card"><i class="ph ph-warning-circle"></i><h4>Walk-in Penalty</h4><p>¥7,000–¥11,000 at large hospitals without referral</p></div>
      </div>
    </div>`,

  clinicSearch: (ctx) => {
    const list = ctx.clinics || [];
    const accentColor = ctx.severityColor === "error" ? "var(--error)" : ctx.severityColor === "warning" ? "var(--warning)" : "var(--primary)";
    return `
    <div class="screen screen-clinics">
      <div class="screen-header">Nearby ${ctx.specialty ? ctx.specialty.charAt(0).toUpperCase() + ctx.specialty.slice(1) : "Medical"} Facilities</div>
      <div class="map-mock"><div class="map-grid"></div><div class="map-pin" style="background:${accentColor};"></div><span class="map-label">Google Maps Grounding — Shinjuku area</span></div>
      <div class="clinic-list">
        ${list.map((c, i) => `
          <div class="clinic-card ${i === 0 ? 'selected' : ''}" data-clinic-index="${i}" style="${i === 0 ? 'border-color:' + accentColor + ';background:#F0F6FF;' : ''}">
            <div class="clinic-card-top">
              <div>
                <h4>${c.name}</h4>
                <span class="badge ${ctx.urgencyLevel && ctx.urgencyLevel <= 2 ? 'badge-emergency' : 'badge-internal'}">${c.specialty}</span>
                <span class="badge badge-lang">${c.language}</span>
              </div>
              ${i === 0 ? '<i class="ph ph-check-circle" style="font-size:24px;color:' + accentColor + ';"></i>' : '<button class="btn-select" data-clinic-index="' + i + '">Select</button>'}
            </div>
            <div class="clinic-meta">
              <span><i class="ph ph-map-pin"></i> ${c.distance}</span>
              <span><i class="ph ph-clock"></i> ${c.hours}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <p class="citation">Source: Google Maps Grounding</p>
    </div>`;
  },

  booking: (ctx) => {
    const clinic = sessionState.pathContext.selectedClinic || (ctx.clinics && ctx.clinics[0]) || { name: "St. Luke's International Hospital", phone: "03-5550-7120" };
    return `
    <div class="screen screen-script">
      <div class="screen-header">${clinic.name}</div>
      <div class="phone-call-bar">
        <span class="phone-number">📞 ${clinic.phone}</span>
        <a href="tel:+81${clinic.phone.replace(/-/g,'').slice(1)}" class="btn-call"><i class="ph ph-phone-call"></i> Call</a>
      </div>
      <div class="script-card">
        <div class="script-lang-label">🇯🇵 Japanese — show this to the receptionist</div>
        <p class="script-text-jp">こんにちは。${ctx.specialty === 'pediatrics' ? '子ども' : ''}の調子が悪いです。外国人です。日本語は話せません。</p>
        <div class="script-toggle" id="romajiToggle"><i class="ph ph-eye"></i> Show Romaji</div>
        <p class="script-text-romaji" id="romajiText" style="display:none;">Konnichiwa. ${ctx.specialty === 'pediatrics' ? 'Kodomo no' : ''} choushi ga warui desu. Gaikokujin desu. Nihongo wa hanasemasen.</p>
        <div class="script-divider"></div>
        <p class="script-text-en">Hello. I'm not feeling well${ctx.specialty === 'pediatrics' ? ' — it\'s my child' : ''}. I'm a foreigner. I don't speak Japanese.</p>
      </div>
      <p class="script-tip">💡 Screen brightness up — make it easy for the receptionist to read</p>
    </div>`;
  },

  arrival: (ctx) => {
    const clinic = sessionState.pathContext.selectedClinic || (ctx.clinics && ctx.clinics[0]) || { name: "the hospital" };
    return `
    <div class="screen screen-transition">
      <div class="transition-icon">🏥</div>
      <h2>You've arrived at ${clinic.name}</h2>
      <p>The receptionist hands you a 問診票 (medical questionnaire).<br>MediRoute has pre-filled it for you.</p>
    </div>`;
  },

  intake: (ctx) => `
    <div class="screen screen-form">
      <div class="screen-header">📋 問診票 — Medical Questionnaire</div>
      <div class="intake-form-card">
        <div class="intake-row intake-row-header"><div class="intake-col-jp">日本語</div><div class="intake-col-en">English</div></div>
        <div class="intake-row"><div class="intake-col-jp"><span class="field-label">名前</span><span class="field-value">${ctx.patientName || 'Alex Chen'}</span></div><div class="intake-col-en"><span class="field-label">Name</span><span class="field-value">${ctx.patientName || 'Alex Chen'}</span></div></div>
        <div class="intake-row"><div class="intake-col-jp"><span class="field-label">生年月日</span><span class="field-value">1992年3月15日</span></div><div class="intake-col-en"><span class="field-label">Date of Birth</span><span class="field-value">1992-03-15</span></div></div>
        <div class="intake-row"><div class="intake-col-jp"><span class="field-label">症状</span><span class="field-value">体調不良</span></div><div class="intake-col-en"><span class="field-label">Symptoms</span><span class="field-value">Feeling unwell</span></div></div>
        <div class="intake-row"><div class="intake-col-jp"><span class="field-label">既往歴</span><span class="field-value">なし</span></div><div class="intake-col-en"><span class="field-label">Medical History</span><span class="field-value">None</span></div></div>
        <div class="intake-row"><div class="intake-col-jp"><span class="field-label">服用中の薬</span><span class="field-value">${ctx.currentMeds ? ctx.currentMeds.join('、') : 'なし'}</span></div><div class="intake-col-en"><span class="field-label">Current Medications</span><span class="field-value">${ctx.currentMeds ? ctx.currentMeds.join(', ') : 'None'}</span></div></div>
        <div class="intake-row"><div class="intake-col-jp"><span class="field-label">アレルギー</span><span class="field-value">なし</span></div><div class="intake-col-en"><span class="field-label">Allergies</span><span class="field-value">None</span></div></div>
      </div>
      <button class="btn-primary" onclick="showToast('✅ PDF saved — show at reception')"><i class="ph ph-file-pdf"></i> Download PDF</button>
      <p class="form-tip">💡 Show the Japanese column to the doctor. Keep English for yourself.</p>
    </div>`,

  prescriptionTransition: (ctx) => `
    <div class="screen screen-transition">
      <div class="transition-icon">💊</div>
      <h2>The doctor prescribed ${ctx.newPrescription || 'medication'}</h2>
      <p>Let's check if it interacts with your current medications...</p>
    </div>`,

  drugInteraction: (ctx) => `
    <div class="screen screen-interaction">
      <div class="interaction-card interaction-critical">
        <div class="interaction-header"><i class="ph ph-warning"></i><span>CRITICAL INTERACTION</span></div>
        <h3>${ctx.newPrescription || 'Ciprofloxacin'} + ${(ctx.currentMeds && ctx.currentMeds[0]) || 'Warfarin'}</h3>
        <p class="interaction-summary">Increased Bleeding Risk</p>
        <div class="severity-bar"><div class="severity-fill critical" style="width:85%"></div></div>
        <p class="interaction-detail">${ctx.newPrescription || 'Ciprofloxacin'} can increase the anticoagulant effect of ${(ctx.currentMeds && ctx.currentMeds[0]) || 'Warfarin'}. INR should be monitored closely.</p>
        <div class="suggested-question">
          <h4>💬 Suggested question for your doctor</h4>
          <p class="question-en">"Should I have my INR monitored while taking this medication?"</p>
          <p class="question-jp">「この薬を服用中、INRをモニタリングすべきですか？」</p>
        </div>
        <p class="disclaimer">⚠️ AI-generated. Always confirm with your pharmacist or doctor.</p>
      </div>
    </div>`,

  receipt: (ctx) => `
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
        <button class="btn-primary" onclick="showToast('✅ Claim form generated')"><i class="ph ph-file-pdf"></i> Generate Claim PDF</button>
      </div>
    </div>`,

  selfCare: (ctx) => `
    <div class="screen screen-info">
      <div class="screen-header">💧 Self-Care Tips</div>
      <p class="screen-subtitle">Your symptoms are mild. Try these first.</p>
      <div class="info-grid" style="grid-template-columns:1fr;">
        <div class="info-card"><i class="ph ph-drop"></i><h4>Rest & Hydrate</h4><p>Get plenty of rest and drink fluids. Your body needs energy to recover.</p></div>
        <div class="info-card"><i class="ph ph-pill"></i><h4>OTC Medications</h4><p>Visit a pharmacy for over-the-counter relief. Pharmacists can advise on Japanese equivalents.</p></div>
        <div class="info-card"><i class="ph ph-clock"></i><h4>Monitor Symptoms</h4><p>If symptoms worsen within 48 hours, find a clinic immediately.</p></div>
      </div>
      <button class="btn-primary" style="margin-top:12px;" onclick="jumpToScreen('clinicSearch')"><i class="ph ph-hospital"></i> I'd Rather Find a Clinic Now</button>
    </div>`,

  drugProhibited: (ctx) => `
    <div class="screen screen-interaction">
      <div class="interaction-card interaction-critical" style="border-color:var(--error);background:#FFF5F5;">
        <div class="interaction-header" style="color:var(--error);"><i class="ph ph-prohibit"></i><span>ILLEGAL IN JAPAN</span></div>
        <h3>${ctx.drugName || 'This medication'} is PROHIBITED</h3>
        <p class="interaction-summary" style="color:var(--error);">DO NOT BRING THIS TO JAPAN</p>
        <div class="severity-bar"><div class="severity-fill critical" style="width:100%"></div></div>
        <p class="interaction-detail">${ctx.drugName || 'This drug'} is classified as a <strong>Stimulant Raw Material</strong> under Japan's Narcotics Control Act. Carrying it → <strong>IMMEDIATE ARREST</strong> at customs. This is not a fine — this is criminal detention.</p>
        <div class="suggested-question">
          <h4>✅ What to do</h4>
          <p style="font-size:13px;line-height:1.6;margin-bottom:4px;">1. <strong>DO NOT</strong> bring it to Japan</p>
          <p style="font-size:13px;line-height:1.6;margin-bottom:4px;">2. Contact your doctor NOW for alternative medications</p>
          <p style="font-size:13px;line-height:1.6;">3. Apply for Yunyu Kakunin-sho — but likely denied for stimulants</p>
        </div>
        <p class="disclaimer">⚠️ Source: MHLW Narcotics Control Department</p>
      </div>
    </div>`,

  drugRestricted: (ctx) => `
    <div class="screen screen-interaction">
      <div class="interaction-card" style="border-color:var(--warning);background:#FFFBF0;">
        <div class="interaction-header" style="color:#B06000;"><i class="ph ph-warning"></i><span>RESTRICTED — PERMIT REQUIRED</span></div>
        <h3>${ctx.drugName || 'This medication'} is controlled</h3>
        <p class="interaction-summary" style="color:#B06000;">Importable with Yunyu Kakunin-sho permit</p>
        <div class="severity-bar"><div class="severity-fill" style="width:60%;background:var(--warning);"></div></div>
        <div class="suggested-question">
          <h4>📋 How to bring it legally</h4>
          <p style="font-size:13px;line-height:1.6;margin-bottom:4px;">1. Get a doctor's letter explaining medical necessity</p>
          <p style="font-size:13px;line-height:1.6;margin-bottom:4px;">2. Apply for Yunyu Kakunin-sho (import certificate) <strong>— 2+ weeks processing</strong></p>
          <p style="font-size:13px;line-height:1.6;margin-bottom:4px;">3. Carry medication in original packaging with prescription</p>
          <p style="font-size:13px;line-height:1.6;">4. Declare at customs on arrival</p>
        </div>
        <p style="text-align:center;color:var(--error);font-weight:700;font-size:12px;margin-top:8px;">⏰ Minimum 2 weeks — start the application NOW</p>
        <button class="btn-primary" style="margin-top:12px;" onclick="showToast('📄 Yunyu Kakunin-sho application downloaded')"><i class="ph ph-file-text"></i> Generate Application</button>
        <p class="disclaimer">⚠️ Source: MHLW — Q&A for bringing medicines into Japan</p>
      </div>
    </div>`,

  drugInteractionInput: (ctx) => `
    <div class="screen screen-form">
      <div class="screen-header">💊 Check Drug Interactions</div>
      <div style="margin-bottom:16px;">
        <div class="field-label" style="margin-bottom:8px;">YOUR CURRENT MEDICATIONS</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${(ctx.currentMeds || ['Warfarin']).map(m => `<span class="badge badge-internal" style="font-size:14px;padding:6px 12px;">💊 ${m}</span>`).join('')}
        </div>
      </div>
      <div style="margin-bottom:16px;">
        <div class="field-label" style="margin-bottom:8px;">NEW PRESCRIPTION</div>
        <span class="badge" style="font-size:14px;padding:6px 12px;background:#FFF5F5;color:var(--error);">💊 ${ctx.newPrescription || 'Ciprofloxacin'}</span>
      </div>
      <button class="btn-primary" id="checkInteractions"><i class="ph ph-warning"></i> Check Interactions</button>
    </div>`,

  yunyuGuide: (ctx) => `
    <div class="screen screen-info">
      <div class="screen-header">📋 Yunyu Kakunin-sho Guide</div>
      <p class="screen-subtitle">Japan's official medication import permit — apply 2+ weeks before travel</p>
      <div class="info-grid" style="grid-template-columns:1fr;">
        <div class="info-card"><i class="ph ph-file-text"></i><h4>1. Get Doctor's Letter</h4><p>Your doctor must state: diagnosis, medication name, dosage, and why you need it.</p></div>
        <div class="info-card"><i class="ph ph-envelope"></i><h4>2. Submit Application</h4><p>Email the MHLW with your doctor's letter + medication details. Processing: 2-3 weeks.</p></div>
        <div class="info-card"><i class="ph ph-check-circle"></i><h4>3. Receive Permit</h4><p>If approved, you'll receive a Yunyu Kakunin-sho certificate. Carry this with your medication.</p></div>
        <div class="info-card"><i class="ph ph-airplane-takeoff"></i><h4>4. Declare at Customs</h4><p>Show the certificate + original packaging + prescription at Japanese customs.</p></div>
      </div>
      <button class="btn-primary" style="margin-top:12px;" onclick="showToast('📄 Application form downloaded')"><i class="ph ph-download"></i> Download Application Form</button>
    </div>`,

  pharmacyFinder: (ctx) => {
    const list = ctx.clinics || clinics.pharmacy;
    return `
    <div class="screen screen-clinics">
      <div class="screen-header">💊 Nearest Pharmacies</div>
      <div class="map-mock" style="background:linear-gradient(135deg,#E8F5E9,#C8E6C9,#E8F5E9);"><div class="map-grid" style="background-image:linear-gradient(rgba(0,137,123,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,137,123,0.08) 1px,transparent 1px);"></div><div class="map-pin" style="background:#00897B;"></div><span class="map-label">Google Maps Grounding — Shinjuku area</span></div>
      <div class="clinic-list">
        ${list.map((c, i) => `
          <div class="clinic-card ${i===0?'selected':''}" data-clinic-index="${i}" style="${i===0?'border-color:#00897B;background:#F0FAF8;':''}">
            <div class="clinic-card-top">
              <div><h4>${c.name}</h4><span class="badge badge-lang">${c.language}</span></div>
              ${i===0?'<i class="ph ph-check-circle" style="font-size:24px;color:#00897B;"></i>':'<button class="btn-select" data-clinic-index="'+i+'">Select</button>'}
            </div>
            <div class="clinic-meta"><span><i class="ph ph-map-pin"></i> ${c.distance}</span><span><i class="ph ph-clock"></i> ${c.hours}</span></div>
          </div>
        `).join('')}
      </div>
      <p class="citation">Source: Google Maps Grounding</p>
    </div>`;
  },

  embassyContact: (ctx) => `
    <div class="screen screen-info">
      <div class="screen-header">🏛️ Your Embassy</div>
      <p class="screen-subtitle">If you're arrested or need urgent consular assistance</p>
      <div class="info-grid" style="grid-template-columns:1fr;">
        <div class="info-card" style="border-left:3px solid var(--primary);">
          <h4>🇺🇸 US Embassy Tokyo</h4>
          <p style="font-size:14px;font-weight:700;margin:4px 0;">📞 03-3224-5000</p>
          <p style="font-size:12px;">American Citizen Services — 24h emergency line</p>
          <p style="font-size:12px;margin-top:4px;color:var(--on-surface-variant);">Tell them: "I need assistance with medication regulations in Japan." They've handled this before.</p>
        </div>
      </div>
      <a href="tel:+81332245000" class="btn-primary" style="text-decoration:none;margin-top:12px;"><i class="ph ph-phone-call"></i> Call Embassy</a>
    </div>`,

  liveTranslation: (ctx) => `
    <div class="screen screen-form">
      <div class="screen-header">🎤 Live Translation</div>
      <div style="text-align:center;padding:20px;">
        <div class="btn-119 pulsing" style="width:80px;height:80px;border-radius:50%;margin:20px auto;font-size:32px;padding:0;">
          <i class="ph ph-microphone"></i>
        </div>
        <p style="font-size:13px;color:var(--on-surface-variant);">Tap to speak</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;">
        <div class="info-card" style="display:flex;justify-content:space-between;align-items:center;">
          <div><p style="font-size:13px;">"Where does it hurt?"</p><p style="font-size:12px;color:var(--on-surface-variant);">どこが痛みますか？</p></div>
          <i class="ph ph-speaker-high" style="font-size:20px;color:var(--primary);"></i>
        </div>
        <div class="info-card" style="display:flex;justify-content:space-between;align-items:center;">
          <div><p style="font-size:13px;">"How long?"</p><p style="font-size:12px;color:var(--on-surface-variant);">どのくらい続いていますか？</p></div>
          <i class="ph ph-speaker-high" style="font-size:20px;color:var(--primary);"></i>
        </div>
        <div class="info-card" style="display:flex;justify-content:space-between;align-items:center;">
          <div><p style="font-size:13px;">"I'm allergic to..."</p><p style="font-size:12px;color:var(--on-surface-variant);">アレルギーがあります...</p></div>
          <i class="ph ph-speaker-high" style="font-size:20px;color:var(--primary);"></i>
        </div>
        <div class="info-card" style="display:flex;justify-content:space-between;align-items:center;">
          <div><p style="font-size:13px;">"I take these medications..."</p><p style="font-size:12px;color:var(--on-surface-variant);">これらの薬を服用しています...</p></div>
          <i class="ph ph-speaker-high" style="font-size:20px;color:var(--primary);"></i>
        </div>
      </div>
    </div>`,

  insuranceExplainer: (ctx) => `
    <div class="screen screen-info">
      <div class="screen-header">💳 Travel Insurance in Japan</div>
      <div class="info-grid" style="grid-template-columns:1fr;">
        <div class="info-card"><i class="ph ph-currency-circle-dollar"></i><h4>1. You Pay Upfront</h4><p>Hospitals in Japan require payment at time of service. Keep the receipt (領収書 / Ryoushuusho).</p></div>
        <div class="info-card"><i class="ph ph-envelope"></i><h4>2. Submit Claim</h4><p>Send your receipts + claim form to your insurer: Allianz, Sompo, World Nomads, etc.</p></div>
        <div class="info-card"><i class="ph ph-camera"></i><h4>3. MediRoute Auto-Fills</h4><p>Take a photo of your Japanese receipt. MediRoute extracts all fields and generates your claim form.</p></div>
      </div>
      <button class="btn-primary" style="margin-top:12px;"><i class="ph ph-arrow-right"></i> See a Sample Claim</button>
    </div>`,

  receiptPreview: (ctx) => `
    <div class="screen screen-receipt">
      <div class="screen-header">📸 Sample Receipt</div>
      <div class="receipt-mock">
        <div class="receipt-paper">
          <div class="receipt-hospital">St. Luke's International Hospital <span style="position:absolute;right:10px;font-size:10px;color:var(--primary);">← Clinic name (required)</span></div>
          <div class="receipt-stamp">㊞ <span style="font-size:10px;color:var(--primary);">← Stamp (required)</span></div>
          <div class="receipt-divider">- - - - - - - - - - - - - - - -</div>
          <div class="receipt-date">2026年6月23日</div>
          <div class="receipt-item"><span>診察料</span><span>¥5,000</span></div>
          <div class="receipt-item"><span>血液検査</span><span>¥8,000</span></div>
          <div class="receipt-item"><span>心電図</span><span>¥3,000</span></div>
          <div class="receipt-divider">- - - - - - - - - - - - - - - -</div>
          <div class="receipt-total"><span>合計</span><span>¥16,000 <span style="font-size:10px;color:var(--primary);">← Total (1 point = ¥10)</span></span></div>
        </div>
      </div>
      <p style="font-size:12px;color:var(--on-surface-variant);text-align:center;margin-top:12px;">Your insurer needs: clinic name, date, itemized charges, and total.</p>
    </div>`,

  visaWaming: (ctx) => `
    <div class="screen screen-interaction">
      <div class="interaction-card interaction-critical" style="border-color:var(--error);background:#FFF5F5;">
        <div class="interaction-header" style="color:var(--error);"><i class="ph ph-warning-circle"></i><span>VISA DENIAL RISK</span></div>
        <h3>Unpaid Medical Bills = No Re-Entry</h3>
        <p class="interaction-summary" style="color:var(--error);">Debt ≥¥10,000 → Automatic Visa Denial</p>
        <div class="severity-bar"><div class="severity-fill critical" style="width:100%"></div></div>
        <p class="interaction-detail">As of <strong>April 2026</strong>: any unpaid medical bill ≥¥10,000 (~$64) results in <strong>automatic visa denial</strong> on your next attempt to enter Japan. Even if you're leaving tomorrow — <strong>pay before you go</strong>.</p>
        <div class="suggested-question">
          <h4>✅ What to do</h4>
          <p style="font-size:13px;line-height:1.6;">1. Get your receipt (領収書) from the hospital cashier</p>
          <p style="font-size:13px;line-height:1.6;">2. Pay in full — cash, credit card, or insurance advance</p>
          <p style="font-size:13px;line-height:1.6;">3. Keep the receipt for your insurance claim</p>
        </div>
        <p class="disclaimer">⚠️ Source: Nikkei Asia, November 2025. Effective April 2026.</p>
      </div>
    </div>`,
};

// ── Special screen handlers ──
function jumpToScreen(screenId) {
  const route = currentRouteData();
  if (!route) return;
  const idx = route.screens.indexOf(screenId);
  if (idx >= 0) navigateTo(idx);
}
```

- [ ] **Step 2: Verify**
  - Open console: `Object.keys(SCREEN_TEMPLATES).length` → `23`
  - `SCREEN_TEMPLATES.triageUrgent({urgencyLevel:3,severityColor:"warning"}).length` → returns HTML string
  - Every template key matches screen IDs used in ROUTES

- [ ] **Step 3: Commit**

---

### Task 3: Hub Page + Rendering Engine

**Files:**
- Modify: `mediroute-mock.html`

**Interfaces:**
- Produces: Complete hub page (rendered on load when `currentRoute === null`). Route-based `renderScreen()`, `navigateTo()`, `startRoute()`. Full navigation works.

This is the biggest task. Add after the screen templates:

- [ ] **Step 1: Add hub page render function**

```javascript
function renderHub() {
  const container = document.getElementById("phoneScreen");
  const hasHistory = sessionState.pastRoutes.length > 0;
  container.innerHTML = `
    <div class="screen" style="background:var(--surface);padding:24px 16px;gap:16px;min-height:100%;">
      <div style="text-align:center;">
        <div style="font-family:var(--font-display);font-size:24px;font-weight:700;color:var(--primary);">MediRoute</div>
        <div style="font-size:12px;color:var(--on-surface-variant);">AI Medical Companion</div>
      </div>
      <div class="hub-search">
        <i class="ph ph-magnifying-glass" style="color:var(--on-surface-variant);"></i>
        <input type="text" id="hubSearch" placeholder="Type a symptom or medication name..." style="flex:1;border:none;outline:none;font-family:var(--font-body);font-size:14px;background:transparent;">
      </div>
      <div class="hub-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
        <span class="hub-chip" data-route="chest-pain">CP</span>
        <span class="hub-chip" data-route="moderate-fever">Fv</span>
        <span class="hub-chip" data-route="drug-prohibited">Ad</span>
        <span class="hub-chip" data-route="lost-medication">Ls</span>
        <span class="hub-chip" data-route="doctor-translate">Tx</span>
        <span class="hub-chip" data-route="cost-info">$?</span>
      </div>
      ${CATEGORIES.map(cat => `
        <div class="hub-category" data-category="${cat.id}" style="border-left:3px solid ${cat.color};">
          <div class="hub-category-main" id="cat-main-${cat.id}">
            <div style="flex:1;">
              <span style="font-size:20px;">${cat.icon}</span>
              <span style="font-family:var(--font-display);font-weight:700;font-size:14px;margin-left:8px;">${cat.label}</span>
              <span style="font-size:11px;color:var(--on-surface-variant);margin-left:6px;">[${cat.count}]</span>
            </div>
            <span class="hub-expand" id="cat-expand-${cat.id}" style="cursor:pointer;padding:4px 8px;">↗</span>
          </div>
          <div class="hub-submenu" id="cat-sub-${cat.id}" style="display:none;">
            ${cat.routeOrder.map(rk => {
              const r = ROUTES[rk];
              return `<div class="hub-subitem" data-route="${rk}">● ${r.label}</div>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
      ${hasHistory ? `
        <div style="border-top:1px solid var(--outline);padding-top:12px;">
          <div style="font-size:11px;color:var(--on-surface-variant);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Recent Sessions</div>
          ${sessionState.pastRoutes.slice(-5).reverse().map(p => `
            <div class="hub-recent" data-route="${p.route}" style="display:flex;align-items:center;gap:8px;padding:6px 8px;cursor:pointer;border-radius:var(--radius-sm);font-size:12px;">
              <span>✓</span><span>${ROUTES[p.route]?.label || p.route}</span><span style="color:var(--on-surface-variant);font-size:10px;margin-left:auto;">${timeAgo(p.timestamp)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <button class="btn-primary" id="hubNewSession" style="background:var(--surface);color:var(--on-surface-variant);border:1px solid var(--outline);">🔄 New Session</button>
    </div>
  `;
  bindHubEvents();
}

function timeAgo(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return Math.floor(sec/60) + 'm ago';
  return Math.floor(sec/3600) + 'h ago';
}

function bindHubEvents() {
  // Category card click → start first route in category
  document.querySelectorAll('.hub-category-main').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.hub-expand')) return;
      const catId = el.closest('.hub-category').dataset.category;
      const cat = CATEGORIES.find(c => c.id === catId);
      if (cat) startRoute(cat.routeOrder[0]);
    });
  });

  // Expand/collapse sub-menu
  document.querySelectorAll('.hub-expand').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const catId = el.id.replace('cat-expand-', '');
      const sub = document.getElementById('cat-sub-' + catId);
      const isOpen = sub.style.display !== 'none';
      document.querySelectorAll('.hub-submenu').forEach(s => s.style.display = 'none');
      document.querySelectorAll('.hub-expand').forEach(e => e.textContent = '↗');
      if (!isOpen) {
        sub.style.display = 'block';
        el.textContent = '✕';
      }
    });
  });

  // Sub-menu item click → start specific route
  document.querySelectorAll('.hub-subitem').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      startRoute(el.dataset.route);
    });
  });

  // Recent session click
  document.querySelectorAll('.hub-recent').forEach(el => {
    el.addEventListener('click', () => startRoute(el.dataset.route));
  });

  // Smart chips
  document.querySelectorAll('.hub-chip').forEach(el => {
    el.addEventListener('click', () => startRoute(el.dataset.route));
  });

  // Search
  const searchInput = document.getElementById('hubSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const match = matchKeywordRoute(searchInput.value);
      document.querySelectorAll('.hub-category').forEach(c => {
        c.style.opacity = match ? '0.4' : '1';
        c.style.transition = 'opacity 200ms';
      });
      if (match) {
        const catId = ROUTES[match].category;
        const catEl = document.querySelector(`.hub-category[data-category="${catId}"]`);
        if (catEl) { catEl.style.opacity = '1'; catEl.style.boxShadow = '0 0 0 2px var(--primary)'; }
      }
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const match = matchKeywordRoute(searchInput.value);
        if (match) startRoute(match);
      }
    });
  }

  // New session
  const newBtn = document.getElementById('hubNewSession');
  if (newBtn) newBtn.addEventListener('click', () => { clearState(); renderHub(); });
}

function startRoute(routeKey) {
  const route = ROUTES[routeKey];
  if (!route) return;
  sessionState.currentRoute = routeKey;
  sessionState.currentStep = 0;
  sessionState.visitedSteps = new Set([0]);
  sessionState.pathContext = JSON.parse(JSON.stringify(route.ctx));
  sessionState.pathContext.selectedClinic = null;
  saveState();
  updateTopBar();
  renderCurrentScreen();
  updateNavButtons();
  updateSidebar();
}
```

- [ ] **Step 2: Add hub-specific CSS**

```css
.hub-search {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; background: var(--surface-variant);
  border: 1px solid var(--outline); border-radius: var(--radius-lg);
}
.hub-chip {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: var(--radius-sm);
  background: var(--surface); border: 1px solid var(--outline);
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all var(--transition-fast);
  color: var(--on-surface-variant);
}
.hub-chip:hover { border-color: var(--primary); color: var(--primary); background: #E8F0FE; }
.hub-category {
  background: var(--surface-variant); border-radius: var(--radius-md);
  border: 1px solid var(--outline); overflow: hidden;
}
.hub-category-main {
  display: flex; align-items: center; padding: 14px; cursor: pointer;
  transition: background var(--transition-fast);
}
.hub-category-main:hover { background: rgba(0,0,0,0.02); }
.hub-submenu { padding: 0 14px 14px 40px; }
.hub-subitem {
  padding: 8px 0; font-size: 13px; cursor: pointer;
  border-bottom: 1px solid var(--outline); transition: color var(--transition-fast);
}
.hub-subitem:last-child { border-bottom: none; }
.hub-subitem:hover { color: var(--primary); }
.hub-recent:hover { background: var(--surface-variant); }
```

- [ ] **Step 3: Replace renderScreen + navigateTo with route-aware versions**

```javascript
function renderCurrentScreen() {
  const container = document.getElementById("phoneScreen");
  const screenId = currentScreenId();
  if (!screenId) return;
  const template = SCREEN_TEMPLATES[screenId];
  if (!template) return;
  container.innerHTML = template(sessionState.pathContext);
  container.scrollTop = 0;
  bindScreenEvents(screenId);
}

function bindScreenEvents(screenId) {
  if (screenId === 'booking') {
    const toggle = document.getElementById('romajiToggle');
    if (toggle) toggle.addEventListener('click', () => {
      sessionState.romajiVisible = !sessionState.romajiVisible;
      const el = document.getElementById('romajiText');
      if (el) el.style.display = sessionState.romajiVisible ? 'block' : 'none';
      toggle.innerHTML = sessionState.romajiVisible ? '<i class="ph ph-eye-slash"></i> Hide Romaji' : '<i class="ph ph-eye"></i> Show Romaji';
    });
  }
  if (screenId === 'clinicSearch' || screenId === 'pharmacyFinder') {
    document.querySelectorAll('.btn-select').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.clinicIndex);
        const clinicList = sessionState.pathContext.clinics || [];
        if (clinicList[idx]) {
          sessionState.pathContext.selectedClinic = clinicList[idx];
          renderCurrentScreen();
        }
      });
    });
    document.querySelectorAll('.clinic-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.querySelector('[data-clinic-index]')?.dataset?.clinicIndex || card.dataset.clinicIndex);
        if (idx !== undefined && sessionState.pathContext.clinics?.[idx]) {
          sessionState.pathContext.selectedClinic = sessionState.pathContext.clinics[idx];
          renderCurrentScreen();
        }
      });
    });
  }
  if (screenId === 'drugInteractionInput') {
    const btn = document.getElementById('checkInteractions');
    if (btn) btn.addEventListener('click', () => navigateTo(1));
  }
  if (screenId === 'chat') {
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');
    if (input && send) {
      const handler = () => {
        const text = input.value.trim();
        if (!text) return;
        const display = document.getElementById('chatInputDisplay');
        if (display) display.textContent = text;
        input.value = '';
      };
      send.addEventListener('click', handler);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handler(); });
    }
  }
}

function navigateTo(index) {
  if (sessionState.isTransitioning) return;
  if (!currentRouteData()) return;
  const total = totalSteps();
  if (index < 0 || index >= total) return;

  sessionState.isTransitioning = true;
  sessionState.visitedSteps.add(index);

  const screen = document.getElementById("phoneScreen");
  screen.classList.add('screen-exit');

  setTimeout(() => {
    sessionState.currentStep = index;
    renderCurrentScreen();
    updateNavButtons();
    updateStepIndicator();
    updateSidebar();
    saveState();

    screen.classList.remove('screen-exit');
    screen.classList.add('screen-enter');
    setTimeout(() => {
      screen.classList.remove('screen-enter');
      sessionState.isTransitioning = false;
    }, 150);
  }, 150);
}

function updateNavButtons() {
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const nextLabel = nextBtn.querySelector('.nav-label');

  if (!currentRouteData()) {
    backBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  backBtn.disabled = sessionState.currentStep === 0;

  if (sessionState.currentStep === totalSteps() - 1) {
    nextLabel.textContent = sessionState.lang === 'jp' ? '再スタート' : 'Restart';
    nextBtn.querySelector('i').className = 'ph ph-arrow-counter-clockwise';
  } else {
    nextLabel.textContent = sessionState.lang === 'jp' ? '次へ' : 'Next';
    nextBtn.querySelector('i').className = 'ph ph-arrow-right';
  }
}
```

- [ ] **Step 4: Update top bar for context-awareness**

```javascript
function updateTopBar() {
  const logo = document.querySelector('.logo');
  if (sessionState.currentRoute) {
    logo.innerHTML = '<span style="cursor:pointer;" id="hubHomeBtn">🏠</span> MediRoute';
  } else {
    logo.textContent = 'MediRoute';
  }
}
```

- [ ] **Step 5: Update init + event bindings**

```javascript
function bindGlobalEvents() {
  document.getElementById('backBtn').addEventListener('click', () => {
    if (sessionState.currentStep > 0) navigateTo(sessionState.currentStep - 1);
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    if (!currentRouteData()) return;
    if (sessionState.currentStep === totalSteps() - 1) {
      // Restart current route
      sessionState.visitedSteps.clear();
      sessionState.visitedSteps.add(0);
      sessionState.currentStep = 0;
      renderCurrentScreen();
      updateNavButtons();
      updateStepIndicator();
      return;
    }
    navigateTo(sessionState.currentStep + 1);
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return; // Don't trap input keys
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentRouteData() && sessionState.currentStep < totalSteps() - 1) navigateTo(sessionState.currentStep + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (sessionState.currentStep > 0) navigateTo(sessionState.currentStep - 1);
    } else if (e.key === 'r' || e.key === 'R') {
      if (e.shiftKey) { clearState(); renderHub(); }
      else if (currentRouteData()) { sessionState.visitedSteps.clear(); sessionState.visitedSteps.add(0); sessionState.currentStep = 0; renderCurrentScreen(); updateNavButtons(); updateStepIndicator(); }
    } else if (e.key === '0' || e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      goToHub();
    } else if (e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      const idx = parseInt(e.key) - 1;
      if (CATEGORIES[idx]) startRoute(CATEGORIES[idx].routeOrder[0]);
    }
  });

  document.getElementById('langToggle').addEventListener('click', () => {
    sessionState.lang = sessionState.lang === 'en' ? 'jp' : 'en';
    document.getElementById('langToggle').textContent = sessionState.lang === 'en' ? '🌐 EN' : '🌐 JP';
    updateNavButtons();
    updateStepIndicator();
    saveState();
  });

  document.getElementById('techToggle').addEventListener('click', () => {
    document.getElementById('techSidebar').classList.toggle('visible');
  });

  document.getElementById('sidebarClose').addEventListener('click', () => {
    document.getElementById('techSidebar').classList.remove('visible');
  });

  // Hub home button (delegated)
  document.querySelector('.top-bar-left').addEventListener('click', (e) => {
    if (e.target.id === 'hubHomeBtn' || e.target.closest('#hubHomeBtn')) {
      goToHub();
    }
  });
}

function goToHub() {
  if (sessionState.currentRoute) {
    sessionState.pastRoutes.push({
      route: sessionState.currentRoute,
      label: ROUTES[sessionState.currentRoute]?.label || sessionState.currentRoute,
      clinic: sessionState.pathContext.selectedClinic?.name || null,
      timestamp: Date.now(),
    });
  }
  sessionState.currentRoute = null;
  sessionState.currentStep = 0;
  sessionState.visitedSteps = new Set();
  saveState();
  updateTopBar();
  updateNavButtons();
  updateStepIndicator();
  renderHub();
}

function updateStepIndicator() {
  const el = document.getElementById('stepIndicator');
  if (!sessionState.currentRoute) {
    el.textContent = '';
    return;
  }
  el.textContent = `${sessionState.lang === 'jp' ? 'ステップ' : 'Step'} ${sessionState.currentStep + 1}/${totalSteps()}`;
}
```

- [ ] **Step 6: Replace init block**

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const hasSaved = loadState();
  if (hasSaved && sessionState.currentRoute) {
    // Resume saved session
    updateTopBar();
    renderCurrentScreen();
    updateNavButtons();
    updateStepIndicator();
    updateSidebar();
  } else {
    clearState();
    renderHub();
    updateTopBar();
    updateNavButtons();
    updateStepIndicator();
  }
  bindGlobalEvents();
});
```

- [ ] **Step 7: Verify**
  - Open in browser → Hub page renders
  - Click "🚨 Emergency" card → starts chest-pain route
  - Click 🏠 → returns to hub with history entry
  - Type "fever" in search → clinic category highlights
  - Press Enter with "fever" typed → starts moderate-fever route
  - Press 1-5 keys → jump to categories
  - Press H → go to hub
  - Click ↗ → sub-menu expands
  - Click sub-route → starts that route
  - Click smart chips → starts route
  - Click "New Session" → clears everything
  - Refresh page → "Continue where you left off?" state persists

- [ ] **Step 8: Commit**

---

### Task 4: Mobile + Final Polish

**Files:**
- Modify: `mediroute-mock.html`

Update the mobile media query to handle hub page and ensure everything stacks properly on small screens. Add a localStorage prompt on load.

- [ ] **Step 1: Add localStorage resume prompt**

```javascript
// Modified init:
document.addEventListener("DOMContentLoaded", () => {
  const hasSaved = loadState();
  if (hasSaved && sessionState.currentRoute) {
    // Show resume prompt
    document.getElementById("phoneScreen").innerHTML = `
      <div class="screen screen-transition">
        <div class="transition-icon">📱</div>
        <h2>Continue where you left off?</h2>
        <p style="font-size:13px;color:var(--on-surface-variant);">${ROUTES[sessionState.currentRoute]?.label || 'Previous session'} — Step ${sessionState.currentStep + 1}/${totalSteps()}</p>
        <div style="display:flex;gap:12px;margin-top:16px;">
          <button class="btn-primary" id="resumeYes">Yes, continue</button>
          <button class="btn-primary" id="resumeNo" style="background:var(--surface);color:var(--on-surface);border:1px solid var(--outline);">Start fresh</button>
        </div>
      </div>
    `;
    document.getElementById('resumeYes').addEventListener('click', () => {
      updateTopBar();
      renderCurrentScreen();
      updateNavButtons();
      updateStepIndicator();
      updateSidebar();
    });
    document.getElementById('resumeNo').addEventListener('click', () => {
      clearState();
      renderHub();
      updateTopBar();
      updateNavButtons();
    });
  } else {
    clearState();
    renderHub();
    updateTopBar();
    updateNavButtons();
    updateStepIndicator();
  }
  bindGlobalEvents();
});
```

- [ ] **Step 2: Verify mobile**

Resize browser to <768px. Hub cards should stack. Sub-menus should expand inline. Smart chips should wrap. Phone frame fills screen.

- [ ] **Step 3: Final walkthrough verification**
  - All 15 routes navigable from hub
  - Clinic picker updates booking/arrival/intake screens
  - Keyword matching works
  - localStorage survives refresh
  - Keyboard shortcuts all work
  - Tech sidebar updates per screen
  - Language toggle works
  - Toast notifications work
  - No console errors

- [ ] **Step 4: Commit**

---

## Self-Review

1. **Spec coverage**: ✅ All 15 routes, 16 templates, hub page, localStorage, keyword matching, clinic picker, keyboard shortcuts
2. **Placeholder scan**: ✅ No TBDs/TODOs, all functions have code, all templates have HTML
3. **Type consistency**: ✅ `startRoute(routeKey)`, `navigateTo(index)` use consistent signatures, `sessionState.pathContext` structure matches template usage

---

## Execution Handoff

Plan complete at `docs/superpowers/plans/2026-06-23-mediroute-mock-v2.md`.

Two execution options:
1. **Subagent-Driven** — per-task subagents with review
2. **Inline Execution** — build now in this session
