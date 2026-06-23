# MediRoute — Impact & Metrics (Corrected)

> **Fact-checked & corrected:** 2026-06-23
> All math recalculated. Unverifiable claims removed or flagged.

---

## 1. Problem Frequency

**Per Trip Incidence:** Statistically, approximately 1 in 20 foreign travelers (4–5%) will fall ill or sustain an injury while traveling in Japan [1, 2].

**Aggregate Daily Pain:** Given the 42+ million annual visitors, this translates to approximately 5,750 medical incidents every day occurring within the tourist population [3].

**The "Panic Spiral" Cadence:** For a single user, the problem of a medical emergency typically occurs once per trip, but the resulting process friction — language barriers, triage confusion, and facility rejection — compounds over a 4-to-12 hour period of acute stress (based on traveler anecdotes, not a formal study).

---

## 2. Estimated Savings per User

### Time Saved

MediRoute compresses the medical facility search from an hours-long manual process — which can involve being turned away from multiple emergency departments — to an AI-powered triage and matching session. The AI processing (symptom classification + facility matching) targets completion in under 2 seconds [4], though the full end-to-end user experience includes ambulance transit and hospital intake time over which MediRoute has no control.

### Money Saved

**Avoiding Refusal Surcharges:** Prevents the ¥7,000–¥11,000 (~$45–70 at June 2026 rates) "selective medical treatment fee" charged to walk-ins at large hospitals (200+ beds) without a referral letter [5].

**Eliminating Translation Errors:** Japanese medical billing uses a point system (1 point = ¥10) on Japanese-language receipts (Ryoushuusho / Shinryo Meisaisho). Without a detailed breakdown, international insurers may reject claims outright [6]. MediRoute's OCR engine captures structured billing data to reduce translation errors and claim rejections.

> **📝 Note:** A specific anecdote about a "$2,100 / $210 decimal misread" was included in the original draft. This specific story could not be independently verified and has been removed. The general risk of billing errors due to Japanese-only receipts IS verified [6].

### Error Reduction

The JTAS (Japan Triage and Acuity Scale) integration provides medically-backed severity scoring (Levels 1–5), validated in a 27,120-patient cohort study (BMJ Emergency Medicine Journal, 2018) with an AUC of 0.792 for ICU admission prediction [7].

> **⚠️ Caveat:** JTAS was designed for trained triage nurses in emergency department settings. Consumer self-triage using JTAS is a novel application that would require separate clinical validation. The system reduces — but does not eliminate — the risk of "under-triaging" critical conditions like chest pain.

---

## 3. Scaling to a Realistic Market

### B2B Target (Hotels)

Partnering with 50 high-traffic hotels in Tokyo and Kyoto (avg. 200 rooms, 70% occupancy) would put MediRoute in the hands of approximately 7,000 active travelers per day [8].

> **🔧 Correction:** Original draft stated 14,000. The math is: 50 hotels × 200 rooms × 70% occupancy = 7,000. If assuming an average 2-night stay with daily check-in turnover, the reachable user base would be higher, but the base occupancy number is 7,000.

### Operational Impact

At a 5% incident rate, the AI would manage approximately 350 medical sessions daily among these hotel guests.

**Hotel Staff Burden (Verified):** Hotel front desks currently act as ad-hoc medical translators. The Asahi Shimbun (February 2026) documented the case of Tobu Hotel Levant Tokyo, where staff called ambulances *"up to twice a week"* for heatstroke-stricken foreign tourists. With only 3 clerks on night duty (9 PM–8 AM), *"spending 20 to 30 minutes dealing with a suddenly ill guest can severely disrupt front desk operations."* Staff reported difficulty *"precisely ascertaining guests' health condition and need for assistance"* [9].

At 350 sessions/day × ~30 minutes each, MediRoute could reclaim an estimated 175 staff hours per day across partnered hotels.

> **⚠️ Competitive note:** Existing services already address this gap — **HOTEL de DOCTOR 24** (M3 Career, deployed in 28 prefectures) and **Traveler's Hospital** (Medi-Engine Inc., Tokyo + 9 prefectures) both offer 24/7 multilingual online medical consultations for hotels at zero cost to the property. MediRoute differentiates through AI automation (vs. human doctor calls), JTAS triage, and the full claims-to-reimbursement loop.

### Regional Scaling

If deployed across the top 10 tourism hubs in Japan, the platform would address the "119 Gap" for millions of visitors. By diverting non-urgent cases to appropriate clinics, MediRoute could reduce strain on emergency services — though specific municipal cost savings have not been independently quantified and should be presented as a projected outcome, not an established fact.

---

## 4. Demo Metrics

### Triage Latency

The demo will show that Gemini 2.5 Flash can process complex symptoms and return a JTAS-backed severity score and facility recommendation with raw inference latency of approximately 650ms (AILatency benchmark, June 2026) to 560ms TTFT (Artificial Analysis) [4]. End-to-end pipeline latency — including facility matching API calls, translation, and Google Maps queries — is a development target of under 2 seconds.

### Workflow Step Reduction

**Legacy Process:** 8+ manual steps (Search → Call hotel desk → Call taxi → Clinic rejection → ER rejection → Manual form filling → Manual claim filing).

**MediRoute Process (target):** 2 primary user actions (Describe symptoms → Receive "Route A/B/C" navigation), representing a ~75% reduction in manual emergency actions.

> **⚠️ Note:** The "8 steps" represent a constructed worst-case legacy path. The "2 steps" are the user-facing actions and do not include ambulance transit, hospital intake, or claims submission time. This framing is a design target for demo purposes, not benchmarked data.

---

## 5. Corrections Applied (from original)

| # | Original | Corrected |
|---|---|---|
| 1 | 50 hotels × 200 rooms × 70% = **14,000** | **7,000** (math error: 2x overcount) |
| 2 | 700 medical sessions/day | **350** (corrected from fixed base) |
| 3 | 350 staff hours reclaimed/day | **~175** (corrected from fixed base) |
| 4 | ¥7,000–¥11,000 = **$50–$75** | **$45–$70** (at ¥157/$ June 2026 rate) |
| 5 | "$2,100 / $210 decimal misread" story | **Removed** — unverifiable anecdote |
| 6 | JTAS "deterministic" severity scoring | **"Medically-backed"** — JTAS is validated for ED nurses, consumer self-triage is novel |
| 7 | "<2 second triage and matching" (end-to-end) | **AI inference <2s target** — end-to-end includes external API calls and ambulance transit |
| 8 | No competitors mentioned | **Added** HOTEL de DOCTOR 24 and Traveler's Hospital |
| 9 | "Saving millions in overhead" as fact | **Reframed** as projected outcome, not established fact |

---

## Sources

1. JNTO — Travel Insurance in Japan: "one in twenty people suffers from sickness or injuries while abroad"
2. Japan Tourism Agency survey (2023–2024): ~4% of foreign travelers reported illness/injury
3. Calculation: 42M × 5% / 365 = 5,753 incidents/day
4. AILatency (June 2026): Gemini 2.5 Flash — 649ms total, 632ms TTFT. Artificial Analysis: 0.56s TTFT, 161 tok/s
5. MHLW — Fee for Treatment of Patients' Choice: ¥7,000 minimum at 200+ bed hospitals. Individual hospitals: ¥7,700 (Tohoku Univ.), ¥8,800 (St. Luke's), ¥11,000 (Red Cross)
6. Japan Handbook (May 2026): Japanese billing = 1 point / ¥10. Ryoushuusho + Shinryo Meisaisho required for insurance. Without detailed breakdown, insurers reject claims
7. Emergency Medicine Journal (BMJ, 2018): JTAS validation — 27,120 adults, AUC 0.792 for ICU admission, JTAS 1 OR = 117.93
8. Calculation: 50 × 200 × 0.70 = 7,000
9. Asahi Shimbun (Feb 11, 2026): Tobu Hotel Levant Tokyo — ambulance calls 2x/week, 3 night clerks, 20-30 min/incident
10. PR Times (Mar 2025): HOTEL de DOCTOR 24 — 28 prefectures, 24/7 multilingual online medical consultations
11. Third News (Apr 2026): HOTEL de DOCTOR 24 — 43 countries served, Tokyu Stay, Seibu Prince Hotels
