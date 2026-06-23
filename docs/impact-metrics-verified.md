# MediRoute — Impact & Metrics (Fact-Checked)

> **Fact-checked:** 2026-06-23 via agent-reach (Exa + Jina Reader)
> **Overall confidence:** ~55% confirmed, ~30% fixable math errors, ~15% unverifiable
> **⚠️ CRITICAL: Math error found in B2B scaling section (2x overcount)**

---

## 1. Problem Frequency

| Claim | Verdict | Evidence |
|---|---|---|
| 1 in 20 (5%) foreign travelers fall ill/injured in Japan | **✅ Confirmed** | JNTO: *"one in twenty people suffers from sickness or injuries while abroad."* JTA survey (2023–2024): ~4% of travelers reported illness/injury. 5% is a reasonable round number |
| 42+ million annual visitors | **✅ Confirmed** | Widely reported; JNTO and Japan Tourism Agency statistics |
| ~5,750 medical incidents daily | **✅ Math checks** | 42M × 5% = 2.1M / 365 = **5,753**. Correct calculation given inputs |
| "Panic spiral" lasts 4–12 hours | **⚠️ Qualitative** | Not a verifiable metric — this is a design assumption. Consistent with traveler anecdotes but no study measures "panic spiral duration" |

---

## 2. Estimated Savings per User

### Time Saved

| Claim | Verdict | Evidence |
|---|---|---|
| Hours-long facility search vs. <2 second triage | **⚠️ Overstated / apples-to-oranges** | The "hours-long" claim (traveler anecdotes: waiting from 2AM to 1PM, multiple hospital refusals) is directionally true but `<2 seconds` is the AI inference time, NOT the end-to-end user time (which includes ambulance arrival, hospital admission, etc.). These should not be directly compared. The AI processing speed is real but the framing is misleading |

### Money Saved — "Selective treatment fee" ¥7,000–¥11,000

| Claim | Verdict | Evidence |
|---|---|---|
| Fee: ¥7,000–¥11,000 | **✅ Confirmed** | MHLW + multiple hospital fee schedules verified in previous fact-check |
| USD equivalent: ~$50–$75 | **🔴 INCORRECT** | At June 2026 exchange rate (~¥157/$1): ¥7,000 = ~$44.59, ¥11,000 = ~$70.06. **Correct range: ~$45–$70.** The $50–75 is ~10% too high |

### Money Saved — "10x decimal misread" ($210 → $2,100)

| Claim | Verdict | Evidence |
|---|---|---|
| Tourist quoted $2,100 due to decimal misread of $210 bill | **🔴 UNVERIFIED** | No source found for this specific anecdote. Japan Handbook confirms billing confusion is real (1 point = 10 yen, receipts in Japanese, insurers reject non-detailed bills). The general risk of billing errors exists, but this specific "$2,100 / $210" story is unverifiable and should be removed or cited to a specific source |

### Error Reduction — JTAS

| Claim | Verdict | Evidence |
|---|---|---|
| JTAS deterministic severity scoring (1–5) | **⚠️ Partially confirmed** | JTAS validated for trained ED nurses (BMJ 2018). "Deterministic" is misleading — triage involves clinical judgment. Consumer self-triage using JTAS is **novel and unvalidated**. The "under-triaging chest pain" example is a design scenario, not a measured outcome |

---

## 3. Scaling to a Realistic Market

### 🔴 CRITICAL MATH ERROR

| Original | Corrected | Error |
|---|---|---|
| 50 hotels × 200 rooms × 70% occupancy = **14,000** active travelers / day | 50 × 200 × 0.70 = **7,000** | **2x overcount** |

**Downstream corrections needed:**

| Metric | Original (wrong) | Corrected | Impact |
|---|---|---|---|
| Daily active travelers | 14,000 | 7,000 | 2x overcount |
| Medical sessions daily (5%) | 700 | 350 | 2x overcount |
| Staff hours reclaimed | 350 hours/day | ~175 hours/day (if linear) | 2x overcount |

**Note:** If "active" is redefined as "guests checking in + currently staying" with an average 2-night stay, the 14,000 could be justified (7,000 check-ins × 2 nights average). But the document doesn't state this assumption — it just says "avg. 200 rooms, 70% occupancy." Fix the math or add the multi-night stay assumption.

### Hotel Staff Burden

| Claim | Verdict | Evidence |
|---|---|---|
| Hotel front desks act as ad-hoc medical translators | **✅ CONFIRMED** | **Asahi Shimbun (Feb 2026):** Tobu Hotel Levant Tokyo: *"staff had to phone for an ambulance up to twice a week"* for heatstroke tourists. Night staff = 3 clerks. *"Spending 20 to 30 minutes dealing with a suddenly ill guest can thus severely disrupt front desk operations."* Staff said: *"it is still difficult for them to precisely ascertain guests' health condition and need for assistance."* |
| "350 staff hours reclaimed per day" | **🔴 Overstated (due to math error above)** | Even with corrected 175 hours number: this assumes each incident consumes exactly 30 minutes of staff time. The Asahi article says 20–30 minutes per incident. At 350 incidents/day × 0.5 hours = 175 hours/day. This is a plausible estimate IF the base numbers are fixed |

### ⚠️ Existing competitors not mentioned

| Competitor | What they do |
|---|---|
| **HOTEL de DOCTOR 24** (M3 Career) | Online medical consultations in multiple languages, 24/7, deployed in 28 prefectures, used by Tokyu Stay, Seibu Prince Hotels. 55,000 yen fee. Zero cost to hotels. Served tourists from 43 countries |
| **Traveler's Hospital** (Medi-Engine Inc.) | Online consultations with 35 Japanese physicians in English/Chinese, 24-hour rotation. Medical interpreters for other languages. Already in Tokyo + 9 prefectures |

> **📝 The hotel burden problem is real and verified, but MediRoute is NOT the first to address it.** These competitors should be acknowledged in any competitive analysis.

### Regional Scaling

| Claim | Verdict | Evidence |
|---|---|---|
| "Saving municipal governments millions in emergency management overhead" | **⚠️ Aspirational** | No cost study found. Plausible but unsupported. The Asahi article notes the government is actively supporting these solutions (JNTO lists medical centers, projects underway for multilingual video consultations), suggesting the municipal burden is recognized |
| "Top 10 tourism hubs" + "millions of users" | **⚠️ Undefined** | "Millions" of what? Users? Sessions? Dollars saved? Needs specificity |

---

## 4. Demo Metrics

### Triage Latency: Under 2 Seconds

| Claim | Verdict | Evidence |
|---|---|---|
| Gemini 2.5 Flash can return results in <2 seconds | **✅ Plausible for raw inference** | AILatency (June 2026): total latency **649ms**, TTFT **632ms**. Artificial Analysis: TTFT **0.56s**, 161 tok/s. Dhanasvi: TTFT **0.56s**. Raw model inference is well under 2 seconds. **BUT** this doesn't include: symptom parsing, JTAS classification logic, facility matching API calls, translation, or Google Maps queries. The full pipeline's end-to-end latency is unverified |

### Workflow Step Reduction: 75%

| Claim | Verdict | Evidence |
|---|---|---|
| Legacy: 8+ steps → MediRoute: 2 steps = 75% reduction | **⚠️ Design claim, not measured** | Math: (8-2)/8 = 75%. This is a design aspiration, not measured data. The "8 steps" are a constructed worst-case path. Some legacy paths may be shorter (e.g., hotel calls ambulance directly). The "2 steps" omits real-world steps (waiting for ambulance, hospital intake, payment). **Framing is useful for demos but should not be presented as benchmarked data** |

---

## 5. Summary of All Issues

| Severity | Issue | Fix |
|---|---|---|
| 🔴 **Critical** | 50 × 200 × 70% = 7,000, not 14,000 | Fix math OR add assumption (e.g., 2-night avg stay) |
| 🔴 **Critical** | Downstream numbers (700 sessions, 350 hours) all 2x too high | Recalculate from corrected base |
| 🟡 **Moderate** | ¥7,000–¥11,000 = $50–$75 is wrong (~$45–$70) | Use current exchange rate ($1 = ¥157) |
| 🟡 **Moderate** | "$2,100 decimal misread" story unverifiable | Remove or cite specific source |
| 🟡 **Moderate** | JTAS "deterministic" + consumer self-triage unvalidated | Note JTAS is for trained ED nurses; consumer use is novel |
| 🟡 **Moderate** | Existing competitors (HOTEL de DOCTOR 24, Traveler's Hospital) not mentioned | Add to competitive landscape |
| 🟢 **Minor** | "Hours-long" vs "<2 seconds" comparison misleading | Compare end-to-end, not inference-only to full process |
| 🟢 **Minor** | 75% step reduction is design claim, not measured | Label as "target" or "design goal" |

---

## 6. Key Sources

| # | Source | Finding |
|---|---|---|
| 1 | AILatency (Jun 2026) | Gemini 2.5 Flash: 649ms total, 632ms TTFT |
| 2 | Artificial Analysis | Gemini 2.5 Flash: 0.56s TTFT, 161 tok/s |
| 3 | Asahi Shimbun (Feb 2026) | Hotel staff burden verified: ambulance calls 2x/week, 20-30 min per incident, 3 night clerks only |
| 4 | PR Times (Mar 2025) | HOTEL de DOCTOR 24: existing competitor, 28 prefectures, zero hotel cost |
| 5 | Third News (Apr 2026) | HOTEL de DOCTOR 24: 43 countries served, Tokyu Stay, Seibu Prince Hotels |
| 6 | Japan Handbook (May 2026) | Japanese billing: 1 point = 10 yen; Shinryo Meisaisho required for insurance; translation not always needed |
| 7 | JNTO / JTA survey | 4-5% illness rate confirmed |
