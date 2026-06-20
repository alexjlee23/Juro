# Jurio 주리오 — Pre-Build Readiness Pack
*The last genuine gaps before building. Covers what the plan/design/build docs don't: how the content actually gets made, security for sensitive data, the legal documents you must ship, and how to test with real workers. Includes the first finished Guided Help flow as a worked example.*

> Honest note: after this, the **planning is essentially complete**. The highest-value next move is to **start building** — beginning with the decision tree in §2, which de-risks everything downstream. Keep refining in the repo, not in more docs.

---

## 1. Content production playbook (the biggest "doing" gap)

Jurio is a **content product** — its value is accurate, plain, bilingual, sourced legal content. That content has to be *made*, and that work is bigger than the code. Standardize it so two people can produce it consistently.

**Every Rights Library page uses this template:**
1. **Title** (KR + EN) — plain, not legal jargon ("임금을 못 받았어요 / You weren't paid").
2. **Plain summary** — 2–3 sentences, Body-L, low reading level.
3. **Key facts** — the numbers/deadlines (e.g., "≤3 yrs prison or ₩30M fine; claim within 3 years").
4. **"<5 employees?" flag** + **migrant note** where relevant.
5. **What to do next** — a short ordered checklist.
6. **Recommended help** — 1–3 nearby 노무사 / the right hotline (auto-attached).
7. **Source block** — governing statute + law.go.kr link + **"updated: [date]."**

**Production checklist per page (the quality gate, since there's no staff reviewer yet):**
- [ ] Drafted **only from official sources** (easylaw.go.kr / law.go.kr) — no invented interpretation.
- [ ] Statute number + link verified against law.go.kr.
- [ ] **KR and EN say the same thing** (parity check, not a loose translation).
- [ ] Reading level checked (would a worried, second-language reader understand it?).
- [ ] "What to do next" is concrete and ends in a real human/hotline.
- [ ] "Updated" date stamped; source link works.

**Style rules:** sentence case; active voice; define every legal term inline (glossary); never promise an outcome; one idea per sentence. **Roles:** one person owns drafting + sourcing, the other owns the bilingual parity + plain-language pass — then it ships. (Phase 2: verified 노무사 review/upgrade.)

**Guided Help trees** follow the same sourcing discipline but as **deterministic branches** (see §2) — questions a worker can answer, leading to a Next-step card. Build them as versioned JSON, reviewed the same way.

---

## 2. Worked example — the first Guided Help flow: "임금을 못 받았어요 / I wasn't paid"

This is the highest-traffic situation and the template for all the others. Rule-based, offline-capable, no AI. Build it, test it, then clone the pattern.

**Branching questions (plain, ≤4):**
- **Q1 — 아직 다니나요, 그만뒀나요? / Still working there, or left?** (Left → the 14-day final-pay rule applies.)
- **Q2 — 서면 근로계약서가 있나요? / Do you have a written contract?** (Shapes which evidence to gather; "no" is itself a separate violation to note.)
- **Q3 — 얼마나, 언제부터 못 받았나요? / How much, and since when?** (Flags the 3-year claim limit.)
- **Q4 — 외국인 노동자인가요? / Are you a migrant worker?** (Routes to multilingual hotlines; notes wage arrears is a valid E-9 workplace-change reason.)

**Result — the Next-step card:**
- **What's happening (plain):** Withholding wages is illegal; the employer can face up to **3 years in prison or a ₩30M fine**.
- **Do this, in order:**
  1. **Gather evidence** → contract, pay slips, work-hour records, bank deposit history, messages/KakaoTalk with the boss, coworker statements. *(Use the logbook → Evidence export.)*
  2. **Ask the employer to pay — in writing** (text/message), so there's a record.
  3. **File a complaint (진정)** with the Ministry of Employment and Labor online at **labor.moel.go.kr**, or call **1350**.
  4. If still unpaid, ask about the **간이대지급금 (substitute payment)** via **근로복지공단 / COMWEL ☎1588-0075**.
  5. **Free consult:** nearest 노무사 / 노동상담소 (open the Map), or **1350** / migrant **1644-0644**.
- **Deadlines:** wage claims must be filed **within 3 years**; final pay is due **within 14 days** of leaving.
- **Who to call now:** [nearest 노무사/center from Map] · 1350 · (migrant) 1644-0644.
- **Source:** 근로기준법 제43조 · 제36조 · 제49조 (link to law.go.kr). · *"Information, not legal advice. An AI is not a 노무사."*

**JSON skeleton for the dev (versioned in `guided_paths`):**
```json
{
  "id": "unpaid_wages",
  "version": "2026-06",
  "title": { "ko": "임금을 못 받았어요", "en": "I wasn't paid" },
  "questions": [
    { "id": "employment_status", "ko": "아직 다니나요, 그만뒀나요?", "options": ["재직 중", "퇴사함"] },
    { "id": "has_contract", "ko": "서면 근로계약서가 있나요?", "options": ["있음", "없음", "모름"] },
    { "id": "amount_period", "ko": "얼마나, 언제부터 못 받았나요?", "type": "text" },
    { "id": "is_migrant", "ko": "외국인 노동자인가요?", "options": ["예", "아니오"] }
  ],
  "result": {
    "checklist": ["evidence", "ask_in_writing", "file_jinjeong", "substitute_pay", "free_consult"],
    "deadlines": ["wage_claim_3yr", "final_pay_14d"],
    "route": ["map_nearest_nomusa", "hotline_1350", "hotline_1644_0644_if_migrant"],
    "statutes": ["근로기준법 제43조", "근로기준법 제36조", "근로기준법 제49조"],
    "disclaimer": true
  }
}
```
**Next trees to build (same pattern):** 산재(injury) · 부당해고(dismissal) · 위험한 일(dangerous work) · 계약/임금이 이상함(contract/pay looks wrong) · 비자 협박(visa threat).

---

## 3. Security & data-protection baseline (sensitive data = high stakes)

Jurio holds the most sensitive data a worker has — **evidence photos (pay slips, contracts), case details, and the fact that they're seeking help**. For an undocumented or precarious worker, a leak could be catastrophic. Treat security as a launch blocker.

- **Collect the absolute minimum.** No national ID, no visa number, anonymous/guest by default. Every field must justify itself.
- **Logbook & evidence on-device first;** if synced, **encrypt client-side** and let the user wipe it instantly.
- **Encrypt in transit (TLS) and at rest;** evidence images in encrypted object storage with signed, expiring URLs — never public.
- **Auth:** managed auth (e.g., Supabase/OAuth), passkeys where possible, no security-questions; rate-limit login + AI + community endpoints.
- **Secrets** (API keys) in environment/secret manager — **never in the repo**; rotate; use least-privilege keys.
- **Input validation + output encoding** on everything (community posts, search, uploads); size/type limits + malware scan on uploads.
- **Dependency hygiene:** enable automated dependency/vulnerability scanning (GitHub Dependabot) and review before merging.
- **Secure deletion:** account + data deletion actually erases (and propagates to backups within a stated window).
- **Access:** only you/admin touch production data; log admin access.

---

## 4. Incident & breach response (a legal duty in Korea)

Under the **개인정보 보호법**, a personal-data breach must be **notified to affected users and reported to the authorities (PIPC / KISA) without delay** (confirm the current threshold and timeframe). Have a one-page plan ready *before* launch: who is notified, how you assess scope, the user-notice template, and the report path (개인정보 포털). Keep it short — but having it is the point.

---

## 5. Legal documents you must ship (outlines — get a lawyer to finalize)

**Terms of Service** must include: **"information, not legal advice"**; **no 노무사–client relationship is formed**; **limitation of liability**; acceptable-use + community rules (anti-scam, anti-recruiter, anti-defamation); verified-노무사 conduct rules; content ownership/licensing; account suspension/termination; governing law (Korea). 

**Privacy Policy** must include: exactly what's collected and why; retention periods; third-party processors (hosting, AI, maps, analytics); user rights (access/download/delete); the **no-ID / no-reporting** stance; the **개인정보 보호책임자** contact; how to delete an account.

**Standing in-app disclaimer (KR + EN), shown on AI + Library:**
> "이 정보는 법률 자문이 아닌 일반 정보입니다. 정확한 판단은 노무사·변호사와 상담하세요." / "This is general information, not legal advice. For your situation, talk to a certified 노무사 or lawyer."

*(These are outlines, not legal advice — have a Korean lawyer review before launch; app stores require the privacy policy anyway.)*

---

## 6. Pilot & usability testing with real workers (you have the audience — use it)

You said workers are already interested. Turn that into a **small, structured beta** before wide release:
- **Comprehension test (most important):** can a worried, second-language, or low-literacy user *understand* a Rights page and the Next-step card? Watch 5–8 real users read one and explain it back. This validates the "comprehension is the job" standard better than any metric.
- **Task tests:** "you weren't paid — find what to do" / "find help near you" / "delete your account." Note where they get stuck; fix the copy.
- **Accessibility test with assistive-tech users:** screen reader, large text, keyboard — at least 1–2 real users.
- **Migrant-worker check:** test with someone from the actual target group (even in EN) — the visa/EPS content and tone especially.
- **Loop:** ship to a small group → collect feedback in-app and in person → fix → expand. Measure first-task success, comprehension, and "did they reach a real human."

---

## 7. Privacy-preserving analytics
Your analytics event map (in the design system) is good — keep it **PII-free and anonymized**. Prefer a privacy-respecting tool (e.g., self-hosted Plausible/Umami) over ad-tech SDKs, so measurement never conflicts with the privacy-first promise. No third-party ad/tracking SDKs.

---

## 8. v1 "definition of done" (so you know when MVP is finished)
Ship v1 when **all** of these are true:
- [ ] KR + EN; Home launchpad + the 4 tabs (Home/Map/Community*/My) working. *(*Community can be Phase 2.)*
- [ ] **Guided Help: ≥6 situation trees** live (starting with §2), each ending in a Next-step card + a real human.
- [ ] **≥12 Rights Library pages**, each sourced + "updated" stamped + footer.
- [ ] Map with the seed directory + hotlines; on-device location.
- [ ] Tools: wage + severance calculators, logbook, **Evidence export**, contract checker.
- [ ] Migrant Hub + multilingual hotlines; Consultation Schedule.
- [ ] **My + Privacy Center** (download + delete account, in-app and web).
- [ ] Daily content-update job + "updated" stamps running.
- [ ] AI finder = retrieval + statute + route, with the refuse-and-route behavior + auto-citation check.
- [ ] **Accessibility QA passed** (screen reader, large text, keyboard, contrast).
- [ ] **Legal pack done:** ToS + Privacy Policy + standing disclaimer; privacy entry point in-app.
- [ ] **Store compliance done:** Data-safety form, account deletion (in-app + web), UGC tools if community is in, demo account for Apple.
- [ ] **Security baseline (§3) met;** breach plan (§4) written.
- [ ] Trademark check run + domains reserved.

---

## 9. Then: build
The prep is comprehensive. Sequence from here: **finalize the logo → lock the design tokens in the repo → build the Home + the §2 decision tree → deploy the web version → test with your interested workers → expand.** Bring me back in to draft the next decision trees, the Rights-page content, the token file, or any screen — but the next real step is in the code, not another plan.

---

## 10. v1 Content Manifest — exactly what must exist for a complete day-one app

"Usable right away" means this content is *written and seeded* in the first release (the daily sync then keeps it current). This is the definitive day-one list.

**Rights Library — these 12 pages (highest-need first):**
1. 임금을 못 받았어요 / Unpaid wages — 근로기준법 제43·36·49조
2. 최저임금 / Minimum wage — 최저임금법 (2026: ₩10,320)
3. 근로계약서 / Written employment contract — 근로기준법 제17조
4. 근로시간·연장·야간 / Working hours, overtime & night — 제50·53·56조
5. 주휴수당 / Weekly holiday pay — 제55조
6. 연차휴가 / Annual leave — 제60조
7. 퇴직금 / Severance pay — 퇴직급여법 제8조
8. 해고·해고예고 / Dismissal & notice — 제26·27조
9. 부당해고 구제 / Unfair-dismissal remedy — 제23·28조 (노동위원회)
10. 직장 내 괴롭힘 / Workplace harassment — 제76조의2·3
11. 산업재해(산재) / Industrial accident — 산재보험법 (COMWEL)
12. 일터 안전·작업중지권 / Workplace safety & right to refuse dangerous work — 산업안전보건법
   *(+ anchor page: 외국인 노동자 권리·EPS / Migrant worker rights — 외국인고용법, lives in the Migrant Hub.)*

**Guided Help — these 6 situation trees:**
1. 임금을 못 받았어요 *(done — `guided-help-unpaid-wages.md`)*
2. 일하다 다쳤어요 (산재) / I was injured at work
3. 해고됐어요·해고될 것 같아요 / I was (or may be) fired
4. 위험한 일을 시켜요 / I'm told to do dangerous work
5. 근로계약·급여가 이상해요 / My contract or pay looks wrong
6. 사장이 비자로 협박해요 / My boss is threatening my visa *(migrant)*

**Directory / hotlines that ship hardcoded (always work, even offline):**
- Gov: 고용노동부 ☎1350 · 노동위원회 · COMWEL ☎1588-0075 · 최저임금위원회
- Migrant: 외국인종합안내센터 ☎1345 · 외국인력상담센터 ☎1644-0644 · 다누리 ☎1577-1366 · BBB ☎1588-5644
- Free consult: KCPLAA 우아한 노무 해결사 ☎02-6953-9828 · 서울노동권익센터 ☎1661-2020
- Unions: 민주노총 ☎1577-2260 · 알바노조
  *(+ a curated list of geocoded local 노무사/centers for the map — build this seed list before launch.)*

**Glossary — these ~15 core terms:** 통상임금, 평균임금, 임금체불, 부당해고, 진정, 산재, 주휴수당, 퇴직금, 근로계약서, 4대보험, 최저임금, 연차, 해고예고, 노동위원회, 노무사.

**Tools (all functional v1):** wage/overtime calculator · severance calculator · work logbook · evidence export (PDF) · contract checker.

> Every page in KR **and** EN (full parity), each with a source link + "updated" date. Produce them with the §1 playbook; this manifest is the checklist.

---

## 11. First-run & the first 60 seconds (the experience that must land)

**Onboarding — 3 screens max, all skippable:**
1. **Language** — big, simple KR / EN choice.
2. **What Jurio is + the promise** — one screen: "일하는 사람을 위한 앱. 당신을 신고하지 않아요. 신분증·비자번호를 묻지 않아요. / For workers. We never report you. We never ask for your ID." This trust line is the most important screen for migrant/precarious users.
3. **(Optional) Your work** — job type + region to personalize. Skippable; **no ID, ever.**
Then land on Home. **Guest by default** — an account is only needed to post or sync, never to read or get help.

**The first 60 seconds (the core promise):** a worried worker opens the app → calm Home with "무슨 일이 있나요?" + issue tiles + "도움 받기" → taps their situation → answers a few plain questions → gets a **Next-step card** with a clear checklist *and a real phone number to call* — **no signup wall, in under a minute.** Every path ends in either a clear answer or a real human; **no dead ends.**

---

## 12. What "usable on day one" means (acceptance bar for the first release)
The first release is complete when a real worker can, **without an account and offline for core pages:**
- [ ] Pick KR or EN and understand every screen (full parity, plain language, TTS).
- [ ] Find their situation and reach a **clear next step + a real hotline** in under a minute.
- [ ] Read all **12 Rights pages**, each sourced + dated.
- [ ] Use all **6 Guided Help** flows.
- [ ] Open the **Map / hotlines** and call for help (hotlines work with no location).
- [ ] Use the **calculators, logbook, evidence export, contract checker**.
- [ ] See the **Migrant Hub + multilingual hotlines**.
- [ ] Manage data in the **Privacy Center** (download + delete), with the **"not legal advice"** disclaimer visible.
- [ ] Trust it: "independent · we never report you · no ID asked" shown plainly.
*(Community is Phase 2 — the app is fully useful without it.)*
