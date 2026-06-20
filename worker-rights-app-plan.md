# Jurio 주리오 — Final Build Spec (v9)

*A bilingual (KR/EN) labor-rights app for workers in Korea: **know your rights**, find help nearby, ask verified experts, and connect with a worker community — part **specialized Wikipedia**, part **지식iN for workers' legal rights**, part **Everytime-style community** — built to **run almost entirely on automation with a near-zero team.***

> **Jurio 주리오** — *"Know your rights. Walk with confidence." / "당신의 권리를 알고, 당당하게."* Brand, color/type tokens, the finalized logo, and the full UI design system live in **`jurio-design-system.md`**.
>
> **v9 additions (from the design research):** app named **Jurio**; bottom nav finalized to **4 tabs — 홈 Home · 지도 Map · 커뮤니티 Community · 내 My** (Guided Help + Rights Library are entered from Home); a **Privacy Center (개인정보 센터)** is now a first-class screen under **My**; **app-store compliance** (Google Play Data-safety + in-app *and* web account deletion; Apple UGC reporting/blocking + a reviewer demo account; just-in-time permission prompts) and **trademark + domain registration** (KIPRIS/USPTO; jurio.kr/.app/.com) are pre-launch tasks.

### Decisions locked
- **Core purpose front-and-center:** informing workers of their rights and protection measures. Rights Library + the situation-first Guided Help are first-class.
- **Visibly independent and worker-side:** openly *not* a recruiter, staffing agency, employer tool, or data-broker; **never reports users**; collects almost no personal data; **never asks national ID/visa number** (stated plainly in-app).
- **Languages:** Korean + English for v1 (i18n-ready; more languages later are a content task).
- **No staff legal reviewer; AI never interprets** — it surfaces the statute and routes to a human. Disclaimers + always-route-to-real-help.
- **No KCPLAA/union partnerships yet** — automate as much as possible now, partner later.
- **Maps:** Kakao Map primary + Google fallback. **Location processed on-device where possible** (privacy + lighter regulation — §9).
- **Community:** verified 노무사 + peers, 실시간 인기글, HOT 게시물, per-category 소식.
- **Reviews of 노무사/unions/institutions are DEFERRED** (legal exposure — see Directory / §15).
- **Three cross-cutting commitments:** (1) content **auto-updates daily**; (2) **everything brought in shows its source + links to the original**; (3) **comprehension is a hard standard**, not a label.
- **Run with a near-zero team:** moderation, content updates, AI quality checks, and contributor intake are **automated**; the verified-노무사 community + AI are the human/quasi-human layer, not paid staff (irreducible minimum in §9.7).

---

## 1. What the app is (positioning)

A single bilingual (KR/EN) app that does **three jobs** for any worker in Korea, in plain language:
1. **Tells me my rights in plain language, grounded in the actual law.**
2. **Connects me to the right human nearby** — a 노무사, union, worker center, or government office.
3. **Lets me talk to people like me** who do the same kind of work.

**Core themes the whole app keeps returning to:** the **conflict between employer and employee** felt while working; the **importance of a safe working environment**; and the **fairness/rationality of the wage system**.

**Stance:** the app is openly **for workers** — independent, never an employer/recruiter tool, never a data-broker, and it never reports its users. That independence is shown plainly in-app, because it's exactly what precarious and migrant workers need to trust before they'll use it.

The landscape shows *how* to be different, not whether to build: the gov AI bot (`ai.moel.go.kr`) passed **117,000+ uses in 2025**, embedded in 당근알바, **cut info-search time ~87.5%**, used **37.7% at night/weekends**; the MOEL labor portal (`labor.moel.go.kr`) has the statutes + guides + the 1350 line + online complaints, and even it notes its info **lags policy changes.** Your edge: bilingual + glossary, **always sourced**, **integrated** (situation → rights → nearby help → community → consultation schedule), **community-powered**, **migrant-aware**, **daily-fresh**, and **worker-side**.

---

## 2. Cross-cutting rules & standards (apply to every module)

**Rule A — Daily auto-update.** A scheduled job syncs statute changes (law.go.kr API), the minimum wage, 소식/news, and consultation schedules into your DB daily, then re-stamps each page's "updated: [date]." (§9.1; also defeats API traffic limits — §9.6/§14.)

**Rule B — Source everything.** Every imported item stores + displays a `source_name` + tappable `source_url`. AI answers cite the statute they surfaced; community posts show their author. (Satisfies attribution/licensing — §14.)

**Standard C — Comprehension is the job.** "Plain language" is a hard requirement, because for migrant and low-literacy workers comprehension *is* the informing. Every screen: low reading level + worked examples; icons/visuals; **text-to-speech on every page**; **voice input** for search; **bilingual side-by-side (KR/EN)** with an **inline tappable glossary**; a calm "explain like I'm worried" tone; offline access to core pages.

---

## 3. Who it's for + top use cases

**Audiences (one app):** Korean workers (esp. platform/gig — Coupang, 배달의민족, 쿠팡이츠 riders — and precarious/part-time/small-workplace) and migrant workers (EPS/E-9 manufacturing, construction, agriculture, fishing; H-2 service; E-7 who read English).

**Crisis use cases Home + Guided Help answer "what do I do *today*?" for:** "I wasn't paid" (#1 issue, #1 reason E-9 workers change jobs); "I got hurt at work" (산재); "I'm being made to do dangerous or forced work"; "I was fired"; "My boss is abusing me / threatening my visa"; "Is my pay/contract legal?"; "Where's help near me, in my language?"

Themes: **employer–employee conflict, safe workplaces, wage fairness.**

---

## 4. App architecture at a glance

| # | Module | One-liner | Source |
|---|--------|-----------|--------|
| 0 | **Home / Triage** | "What's wrong today?" → fastest path | — |
| 1 | **Guided Help (상황별 안내)** | Situation → right page + checklist + the right human | Rule-based trees from official content |
| 2 | **Find Help Near Me (지도)** | Map of nearby 노무사/unions/centers/gov offices | Curated directory + Kakao Map |
| 3 | **Rights Library (권리 도서관)** | Browsable + AI-searchable rights wiki *(core)* | easylaw.go.kr + law.go.kr |
| 4 | **Ask & Find the Law (AI)** | Retrieval-only: statute + routes to a human | RAG over library + law.go.kr |
| 5 | **Community (커뮤니티)** | 지식iN by job type + 실시간 인기글/HOT + 소식 | User-generated + experts |
| 6 | **Tools (계산기·점검)** | Calculators, work logbook, evidence export | Rules + minimumwage.go.kr |
| 7 | **Directory (노무사·기관 찾기)** | Filterable experts/orgs | Curated + 노무사 self-registration |
| 8 | **Alerts (알림)** | Daily law/wage-change push + case reminders | law.go.kr daily diff |
| 9 | **Migrant/EPS Hub (외국인 노동)** | Visa-aware rights + multilingual hotlines | EPS law + easylaw |
| 10 | **Consultation Schedule (상담 일정)** | Calendar of free consultations | KCPLAA + worker centers (sourced) |
| — | **My (내정보)** | Profile, saved & My Cases, logbook, alerts inbox, settings | — |
| — | **Privacy Center (개인정보 센터)** | Data collected, consent, download, delete account (under My) | First-class compliance screen |
| — | **Glossary (용어사전)** | KR↔EN legal-term dictionary | Curated |

---

## 5. Module-by-module spec

### Module 0 — Home / Triage
Search bar (→ the AI finder); issue tiles ("Not paid," "Injured," "Dangerous/forced work," "Fired," "Harassed," "Check my pay/contract," "Find help"); "Urgent help now" → relevant hotline; KR/EN toggle. Optional skippable onboarding (worker type, industry, region) — **never asks national ID/visa number.** Meets Standard C (large text, TTS).

### Module 1 — Guided Help (상황별 안내) — *the bridge from "what happened to me" to the right page + next step (the biggest missing piece)*
- **Why it's core:** workers don't think in legal topics ("Article 56") — they think *"my boss didn't pay me."* This module starts from the **situation** and carries the worker to the answer. It is the practical delivery of Job #1, especially for someone reading in a second language under stress.
- **How it works — rule-based, not AI:** deterministic **decision trees** built from official content. Pick a situation ("I wasn't paid," "I was hurt at work," "I was fired," "I'm being made to do dangerous/forced work," "My contract/pay looks wrong," "My boss is threatening my visa") → answer a few plain branching questions (written contract? how many work there? when did it happen?) → land on: the **matching Rights Library page**, a **concrete checklist** ("what to do, in order"), the **evidence to gather**, and the **right human to contact** (directory/hotline). Rule-based = **safe** (general info, no individualized advice), **auditable**, and **works offline**.
- **Case Companion (follow-through):** the pathway doesn't end at a phone number. Before a consult/filing it says **what to bring and what to say**; after, a simple **status tracker** sets expectations ("you filed a 진정 → a 근로감독관 is usually assigned → expect contact in ~X → your next step/deadline") and **reminders** fire. It pulls in the logbook + evidence export (Tools) and routing — so the app walks the worker toward a *resolution*, not just information.

### Module 2 — Find Help Near Me (지도)
Kakao Map (Google fallback), clustered markers, filters (issue, language, free/paid, open now), pin detail (name, distance, hours, languages, "helps with," one-tap call, directions). "Report outdated info" on each pin (feeds §9.1 staleness checks). Smart query: "nearest open office handling *unpaid wages* in *English*." **Location computed on-device** (§9.7).

### Module 3 — Rights Library (권리 도서관) — *core informing layer*
Topic taxonomy in §6. Each page = plain explanation + governing statute (linked to law.go.kr) + **"<5-employee workplaces?"** flag + migrant note + **mandatory footer: "what to do next" + 1–3 recommended 노무사/hotline** + **source link** + **"updated: [date]."** v1 sourcing: paraphrase official content from **easylaw.go.kr**, link statutes on **law.go.kr**. Phase 2: verified 노무사 enrich. Meets Standard C.

### Module 4 — Ask & Find the Law (AI) — *finder, not advisor*
Returns the relevant topic + the actual statute (RAG over library + law.go.kr). **No interpretation/prediction/assumed facts/gap-filling.** Low confidence → *"I don't have a matching law for that — here's who to ask."* **Always closes** with the statute + a recommended real union/노무사/institution + one tap to the map/hotline. Standing line: *"Legal information, not legal advice. An AI is not a certified 노무사."* Signposts the official process (file 진정 at labor.moel.go.kr; unfair dismissal → 노동위원회 within 3 months; 산재 → COMWEL 1588-0075). Auto-quality-checked (§9.3). For "what do I do" questions, it can also hand off into a Guided Help pathway.

### Module 5 — Community (커뮤니티) — *지식iN × wiki × Everytime*
- **Job-type channels:** 배달·퀵, 제조·공장 (incl. steel/metal), 건설, 농축산·어업, 서비스·매장, 돌봄·가사, 물류·창고, 플랫폼 기타.
- **지식iN Q&A:** workers ask; verified 노무사 + peers answer; "accepted answer" (채택), upvotes, reputation/badges.
- **실시간 인기글 (Trending now):** cross-channel live feed (recency-weighted views + upvotes + comments).
- **HOT 게시물:** posts crossing an engagement threshold get a HOT tag + tab.
- **소식 (News) per category:** curated, **source-linked** feed of policy/rights/wage/sector-condition updates inside each channel; auto-ingested daily (§9.1). **Does not include worker injury/fatality reports — the app runs no feed and pushes no daily/weekly notices about workers being hurt or killed.**
- **Cold-start automation (§9.5):** AI-seeded FAQ per channel; AI-suggested **(clearly labeled "AI — pending expert review", retrieval-only)** draft answer when no human has replied; duplicate-question detection; auto-categorization.
- **Guardrails:** anonymous handles; "peer info, not legal advice" labels; **no ID/visa required**; **automated moderation** (§9.2).

### Module 6 — Tools (계산기·점검)
- **Pay & overtime calculator:** 2026 min wage **₩10,320/hr** (≈ **₩2,156,880/month**, 209h incl. 주휴수당); overtime/night(22:00–06:00)/holiday each **+50%**, holiday >8h **+100%** — with the **"<5 employees → premiums don't apply"** caveat. Auto-updates yearly.
- **Severance (퇴직금) calculator:** ≥30 days' avg wage/yr (1+ yr); avg wage = last-3-months pay ÷ days (use ordinary wage if higher).
- **Work-hours & wage logbook:** shifts, pay promised vs received, payslip/contract photos, message screenshots. **On-device first**, optional encrypted sync.
- **Evidence export:** one tap turns the logbook into a clean PDF "evidence packet" (timeline + totals + attachments) ready for a 진정/complaint or a 노무사 — feeds the Case Companion.
- **Contract checker:** scan → OCR → check vs **제17조 mandatory items** + min wage + red flags → **"missing/▲/✓ + the rule,"** never a verdict; offer handoff to the gov's free contract/payslip review.
- **"Am I covered?" wizard:** 4대보험 + 산재 eligibility for gig/part-time/foreign workers.

### Module 7 — Directory (노무사·기관 찾기)
Searchable/filterable (region, specialty, language, free/paid, online consult); profile pages; powers the map + AI routing + Guided Help. v1 = curation + **노무사 self-registration with automated verification (§9.4)**. **No scraping of kcplaa.or.kr.** Surface free routes: 국선노무사, 마을변호사, 청소년 근로권익센터.
**Reviews — deferred (not in v1):** worker reviews of 노무사/unions/institutions are postponed (Korea's defamation rules are strict — a post naming a person can draw a claim **even if true**, 사실적시 명예훼손). When revisited: organization-level only, gated posting, no pay-to-remove, right-of-reply, lawyer-reviewed first.

### Module 8 — Alerts (알림)
Daily law/wage-change push (§9.1 diffs law.go.kr 시행일자/개정 + min-wage); case reminders from the Case Companion (e.g., unfair-dismissal 3-month deadline); "updated: [date]" stamps.

### Module 9 — Migrant/EPS Hub (외국인 노동)
**Equal protection** (Korean labor law applies regardless of nationality/visa status, incl. undocumented); **E-9 workplace change** (외국인고용법 제25조: max 3 changes in first 3 yrs, +2 in extension, region/sector-limited; #1 reason is wage arrears); **출국만기보험** (≈ severance, lump sum on departure) + **귀국비용보험**; employer duties (native-language contract, housing, 4대보험, **safety training**); **first steps after a workplace accident**; max stay 4 yrs 10 mos. **Multilingual hotlines up front:** 1345 (~20 langs), 1644-0644 (~18 langs), 1577-1366 (13 langs, 24/7), BBB 1588-5644 (24/7).

### Module 10 — Consultation Schedule (상담 일정)
Calendar/list of **free consultation opportunities**, each **source-linked**, filterable by region + format (phone/online/visit/video/pop-up). Aggregates (sourced): KCPLAA guidance + **"우아한 노무 해결사"** (배달의민족 × 한국공인노무사회, free real-time phone, ☎02-6953-9828); 서울노동권익센터 (☎1661-2020, **지하철 노동상담** at 25 stations, **Zoom** consults, group "찾아가는 노동상담"); 자치구 노동자종합지원센터; 민주노총 노동상담소 (auto-nearest). Refreshed daily + curated; KCPLAA pages block automated fetch (curate / partner later).

### Cross-cutting — Glossary (용어사전)
Tappable KR↔EN dictionary (통상임금 = ordinary wage, 평균임금 = average wage, 임금체불 = wage arrears, 부당해고 = unfair dismissal, 진정 = complaint, 산재 = industrial accident…).

---

## 6. Rights Library — content taxonomy

(Statutes link to law.go.kr; verify figures at build time; show source.)

| Topic | Governing law | Key facts | <5 employees? | Migrant note |
|-------|---------------|-----------|---------------|--------------|
| **Minimum wage** | 최저임금법 | 2026: **₩10,320/hr**; nearly all incl. foreign | ✅ | Applies regardless of status |
| **Written contract** | 근로기준법 제17조 | Written + given; wage/hours/weekly rest/annual leave/workplace; non-provision **≤₩5M** (제114조) | ✅ | E-9 in native language |
| **Pay rules** | 근로기준법 제43·36조 | Monthly, in full, directly; final pay within **14 days** | ✅ | Own account; payslip required |
| **Unpaid wages** | 근로기준법 (제43·109조) | **≤3 yrs / ≤₩30M**; file **진정** online; **간이대지급금** via COMWEL; **3-yr** limit (제49조) | ✅ | #1 E-9 issue; valid change ground |
| **Working hours** | 근로기준법 제50·53조 | 40/wk, 8/day; overtime capped → **52-hr week** | ❌ 52-hr cap | — |
| **Overtime/night/holiday pay** | 근로기준법 제56조 | Each **+50%**; night 22:00–06:00; holiday >8h **+100%**; stacks | ❌ **premiums** | — |
| **Rest & weekly rest** | 근로기준법 제54·55조 | 30 min/4h, 1h/8h; 1 rest day/wk | ✅ | — |
| **Weekly holiday pay (주휴수당)** | 근로기준법 제55조 | **15+ hrs/wk** + full week → 1 paid day | ✅ | — |
| **Annual leave (연차)** | 근로기준법 제60조 | 1 yr (80%+) → **15 days**; <1 yr → 1/month; cap 25 | ❌ | — |
| **Severance (퇴직금)** | 퇴직급여법 제8·9·10조 | 1+ yr → **≥30 days' avg wage/yr**; within 14 days; **3-yr** limit; ≤3 yrs/₩30M | ✅ (since 2010/13) | E-9 gets 출국만기보험 |
| **Dismissal notice (해고예고)** | 근로기준법 제26조 | **30 days' notice or pay**; ≤2 yrs/₩10M | ✅ | — |
| **Unfair dismissal (부당해고)** | 근로기준법 제23·27·28조 | Written w/ reasons; **노동위원회 within 3 months** | ❌ remedy | — |
| **Workplace harassment (직장 내 괴롭힘)** | 근로기준법 제76조의2·3 | Since 2019; employer must investigate, protect, no retaliation | ⚠️ partial | Abuse/coercion common |
| **Workplace safety / right to refuse dangerous work** | 산업안전보건법 (incl. 작업중지권, 제52조) | Workers can stop/refuse work in imminent danger; employers must provide safety/health training; how to report a hazard; first steps after an accident | ✅ (broadly) | Safety training matters esp. for migrant manufacturing/construction |
| **Industrial accident (산재)** | 산업재해보상보험법 | No-fault; medical+wage+disability; via **COMWEL 1588-0075**; **riders covered across platforms** since 2023 | ✅ | Covers foreigners |
| **4 social insurances (4대보험)** | respective acts | 국민연금·건강·고용·산재; varies for non-standard | varies | — |
| **EPS / workplace change** | 외국인고용법 제25조 | Max **3** in first 3 yrs (+2 extension), region/sector-limited | — | Core migrant page |

---

## 7. Roles & permissions

| Capability | Anonymous | Registered worker (no ID) | Verified 노무사 | Automated system | Admin (you) |
|---|---|---|---|---|---|
| Browse Library/Map/Schedule, Guided Help, AI & calculators | ✅ | ✅ | ✅ | — | ✅ |
| Logbook (local) + evidence export + Case Companion | ✅ | ✅ (+ sync) | ✅ | reminders | ✅ |
| Ask questions / accept answers / bookmark | — | ✅ | ✅ | — | ✅ |
| Answer / author Library articles | — | — | ✅ (badged) | suggests drafts (labeled) | ✅ |
| Moderate (hold/remove/triage reports) | — | — | — | ✅ (first line) | ✅ (escalations only) |
| Manage taxonomy/sources/roles/alerts | — | — | — | daily sync | ✅ |

---

## 8. Technical architecture & data

**Client:** cross-platform **React Native** (or Flutter); i18n via i18next (KR/EN, expandable); offline cache of Library + glossary + Guided Help trees (SQLite/Realm); Kakao Maps SDK (+ Google fallback); **location computed on-device** (don't send coordinates to the server); TTS + voice input (Standard C).

**Backend (managed/serverless — §9.6):** API service (Node/NestJS or Python/FastAPI) on a managed platform; **PostgreSQL + PostGIS** (managed); managed vector store (pgvector or hosted); encrypted object storage; serverless cron.

**Core entities:** `users`(+`roles`), `institutions`(geo, languages, specialties, hours, `source_url`), `library_articles`(topic, statute refs, locale, version, updated_at, `source_name/url`), `guided_paths`(situation, branching config — versioned), `news_items`(channel, `source_name/url`, published_at), `schedule_entries`(provider, format, region, time, `source_url`), `questions`/`answers`(channel, accepted, votes), `reports`, `moderation_actions`, `contributor_applications`(license #, status), `cases`(situation, status, next_step, reminders), `logbook_entries`(on-device).

**Guided Help engine:** decision trees are **data/config (`guided_paths`)**, not hard-coded — editable and versioned, sourced from official content, fully deterministic.

**AI / RAG (Module 4):** ingest statutes via **law.go.kr API (`lawSearch.do`, XML w/ 조문/시행일자/개정)** + Library pages + KLRI English (openlaw.klri.re.kr) → chunk + embed → vector index → retrieve top-k → answer **constrained to surface + cite the retrieved statute**; **hard rule:** low confidence → "no matching law — here's who to ask." Always append routing. Contract checker: OCR → field extraction → rule-based checklist → "missing/▲/✓ + rule."

**Auth & privacy:** anonymous-by-default; lightweight account (email/social, **no national ID/visa number**) to post/sync; separate verified-노무사 onboarding. Encrypt at rest + in transit; minimize PII; logbook on-device-first; explicit no-reporting stance.

---

## 9. Operations & automation — running it with a near-zero team

### 9.1 Content pipeline (daily, automated)
A scheduled job: (1) pulls statute + minimum-wage changes from law.go.kr, diffs, refreshes affected Library pages and **flags any Guided Help tree whose underlying rule changed**; (2) ingests **소식/news** (policy, rights, wage, sector-condition updates) via RSS/feeds from MOEL, unions, official sources, **AI-summarizes** with the **source link** attached, and **filters out worker injury/fatality/accident-casualty items** (no daily/weekly death or injury bulletins); (3) refreshes consultation-schedule entries; (4) re-stamps "updated" dates + fires alerts; (5) runs **link-rot + staleness checks** and queues only true anomalies. *No daily human curation.*

### 9.2 Moderation (automated first line)
Every post/answer passes **AI classifiers** (toxicity/harassment, spam, **scam/fake-recruiter**, PII leaks, off-topic). Thresholds → publish / **auto-hold** (ask author to edit) / **auto-remove** + notify. **Reports auto-triaged** (dedup, severity); only ambiguous or legally sensitive cases (defamation/illegal content) escalate to a human (§9.7). Rate-limits + "first post held" reduce brigading.

### 9.3 AI quality control (automated)
Each answer is auto-validated: **does it cite a real statute in the index?** If not → forced refuse-and-route. Thumbs-down auto-flags the query for a retrieval fix. A nightly **eval suite** replays a fixed question set and alerts if citation accuracy or appropriate-refusal rate drops. No transcript-reading required.

### 9.4 Contributor verification (low-volume, mostly automated)
노무사 applies in-app → submits **license/registration number + certificate** → system runs **Q-Net 자격증 진위확인** + a **KCPLAA membership cross-check** → on pass, the verified badge is granted. One-time, low-volume; a KCPLAA partnership later could make it fully automatic.

### 9.5 Cold-start & engagement (automated)
AI-seeded FAQ per channel; labeled **"AI — pending expert review"** draft answers when a question is unanswered (retrieval-only, statute-cited); duplicate-question detection; auto-categorization; scheduled reminder pushes.

### 9.6 Infra (no devops)
**Managed/serverless everything** — managed DB + vector store, serverless API + cron, autoscaling, **managed error monitoring + alerting**, automated backups. **Cache-and-serve** (users read your DB; external APIs hit only on the nightly refresh) → flat traffic, and rate limits never bite (§14).

### 9.7 The irreducible human/legal minimum (be honest) + content continuity
A few things **can't be fully automated** — mostly legal duties; keep them tiny:
- **Location-Based Service registration (위치정보법):** using location to provide a feature makes you a **위치기반서비스사업자**, which generally requires a **report (신고) to the KCC/방통위** (a light report-based regime, with a **simplified small-operator path** — file it if you run the service beyond ~1 month). **Possible exemption** if you process location **only on-device and never store/transmit it** — the architecture chosen above. *Confirm with a lawyer; if exempt, this disappears.* (File via lbsc.kr / emsit.go.kr.)
- **Privacy (개인정보 보호법):** publish a **개인정보처리방침** and designate a **개인정보 보호책임자** (can be you). Minimal PII collected.
- **UGC takedown duty (정보통신망법 임시조치):** on a defamation/privacy complaint about a post, you must be able to act (e.g., temporary blocking). Auto-moderation handles volume; a human handles rare escalations.
- **Periodic legal sanity-check:** a **노무사/lawyer reviews AI accuracy + key content on a cadence** (e.g., quarterly) — not daily ops.
- **Content continuity:** because stale labor info is *dangerous*, the daily pipeline + "updated" stamps + staleness alerts keep content from silently rotting even if you're hands-off; document a simple handoff/sunset path so the app never becomes a source of wrong, outdated rules.
- **App-store/policy responses** as they arise.

**How small this stays:** automated triage means a human sees only escalations (minutes/week); designate yourself as the officer; keep a **lawyer on as-needed retainer** for takedowns + the quarterly review; the **verified-노무사 community** handles content quality. That's the team.

---

## 10. Trust, safety & AI scope
**The #1 product risk: being wrong — or being misread — at scale, for a vulnerable person in a high-stakes moment.** A wrong/misapplied answer can cause real harm (quitting, confronting a boss, missing a deadline, jeopardizing a visa). Mitigations: **Guided Help pathways are rule-based and conservative**; the **AI is retrieval-only and refuses-and-routes**; a **loud, persistent human handoff** ("an AI is not a 노무사 — talk to a real one below"); a ToS **limitation-of-liability** + "**no 노무사–client relationship is formed**"; the periodic 노무사/lawyer review (§9.7).
**Duty of care:** if a user shows signs of serious distress (beyond a labor problem), surface **crisis-support resources**, not only labor help.
**AI:** retrieve + cite the statute only; no interpretation; refuse-and-route on low confidence; always recommend a real expert; auto-validated (§9.3).
**Community:** verified-노무사 gating; "peer info" labels; no ID/visa required; automated moderation (§9.2).
**Tools:** flag-and-point, never adjudicate. **Reviews:** deferred (§ Directory).

---

## 11. Institutions & resources — curation seed
**A. Government/official:** 고용노동부 고객상담센터 **☎1350**; 노동포털 **labor.moel.go.kr**; 노동위원회 **nlrc.go.kr**; COMWEL **☎1588-0075, total.comwel.or.kr**; 최저임금위원회 **minimumwage.go.kr**; 고용24 **work24.go.kr**; gov AI bot **ai.moel.go.kr**.
**B. Migrant support & hotlines:** 1345 (~20 langs); 1577-1366 (13 langs, 24/7); 1644-0644 (~18 langs); BBB 1588-5644 (24/7); 외국인노동자/외국인력 지원센터 (by region); 서울노동포털 **seoullabor.or.kr** + Seoul 글로벌센터 **global.seoul.go.kr**.
**C. Legal pros & free routes:** KCPLAA **kcplaa.or.kr** (verify via Q-Net; partner later); 국선노무사; 마을변호사; 청소년 근로권익센터.
**D. Unions & worker orgs:** 민주노총/KCTU **☎1577-2260** (nodong.org); 한국노총/FKTU; **공공운수노조 라이더유니온지부** + **서비스연맹 배달플랫폼노조**; 알바노조 **alba.or.kr**.
**E. Free consultation programs (Module 10):** KCPLAA 우아한 노무 해결사 (☎02-6953-9828); 서울노동권익센터 (☎1661-2020); 자치구 노동자종합지원센터; 민주노총 노동상담소.
**F. Content/data + filings:** Easy Law **easylaw.go.kr**; 국가법령정보센터 **law.go.kr**; KLRI English **openlaw.klri.re.kr**; 공공데이터포털 **data.go.kr**; LBS filing **lbsc.kr / emsit.go.kr**; Q-Net verification **q-net.or.kr**.

---

## 12. Build roadmap (automation built in from day one)
**Phase 1 — MVP:** KR + EN; Home/Triage (+Standard C); **Guided Help (rule-based trees) for the top ~6 situations**; Find Help map (on-device location); ~12 sourced Library pages (incl. workplace safety); Migrant Hub; Consultation Schedule; Glossary; **daily content pipeline (§9.1)** + **AI quality auto-checks (§9.3)**; the AI finder; Tools (calculators + logbook + **evidence export** + contract checker) + **Case Companion**; **managed/serverless infra (§9.6)**; complete **LBS/privacy setup (§9.7).**
**Phase 2 — Community (auto-moderated):** job-type channels, Q&A, 실시간 인기글/HOT, 소식 + **automated moderation (§9.2)** + **automated 노무사 verification (§9.4)** + **cold-start automation (§9.5)** + reputation; verified 노무사 enrich Library + Guided Help.
**Phase 3 — Scale & partnerships:** KCPLAA/union partnerships (directory + schedule feeds + auto-verification); add languages (Vietnamese, Chinese first; AI-assisted translation); deeper migrant/visa content; **revisit reviews (org-level, lawyer-reviewed)**; gov-bot interoperability.

## 13. Success metrics
Activation (% reaching a next step in session 1; **Guided Help completion rate**); routing (taps-to-help; % AI sessions ending in a routed expert/hotline); follow-through (**% of cases that reach a logged next step/filing**); trust/quality (% questions with accepted answer; **AI citation accuracy + appropriate-refusal rate**); **automation health (% content auto-updated cleanly; auto-moderation precision/recall; % reports auto-resolved; human-escalation rate per 1k posts)**; coverage (Library freshness); reach (night/weekend usage; migrant retention).

## 14. Cost & licensing
**Free, no ads, no revenue = the strongest "non-commercial" case, but "free" alone isn't automatic, so:**
- **Robust path:** take legal data from **공공데이터포털 (data.go.kr)**, where 법제처 datasets are typically under **공공누리(KOGL)** — often **Type 1 (출처표시/attribution)**, which permits use **including commercial** with **source credit** (you already link every source — Rule B).
- **open.law.go.kr** flags **some APIs as non-commercial-only**; a free public-interest app fits "non-commercial," but read each API's 이용허락 범위 and state your purpose on application (~1–2 day approval). Ask the provider if unsure.
- **If you ever monetize**, re-check terms. *General info, not legal advice — confirm each dataset/API's terms.*

**Traffic limits → solved by design:** caps are per-account (e.g., **dev ~100/day; a 운영계정 (production account) gets higher limits by registering its use case**). **Cache + daily sync** (§9.1/9.6): serve users from your DB, call APIs only on the nightly refresh. Traffic limits effectively never bite.

## 15. Open decisions
1. Confirm the **LBS exemption** (on-device-only location) vs filing the small-operator report — ask a lawyer early.
2. Auto-moderation thresholds + escalation rules; the human escalation contact.
3. AI statute-selection + low-confidence refusal behavior + eval set.
4. **Guided Help:** which top situations to ship first, and the exact branching for each (start with "I wasn't paid").
5. Contributor verification: Q-Net check only, or human confirm too.
6. Confirm dataset/API license terms (prefer data.go.kr 공공누리 Type 1).
7. Logbook storage: on-device only vs encrypted sync.
8. React Native vs Flutter; managed vector DB vs pgvector; hosting platform.
9. **(Later) Reviews:** if/when, org-level first, lawyer-reviewed.

---

*Sources (verify at build time; show in-app): MOEL (moel.go.kr, ai.moel.go.kr, labor.moel.go.kr, 1350); 근로기준법 / 최저임금법 / 근로자퇴직급여보장법 / 산업재해보상보험법 / 산업안전보건법 / 외국인근로자의 고용 등에 관한 법률 / 위치정보의 보호 및 이용 등에 관한 법률 / 개인정보 보호법 / 정보통신망법 via 국가법령정보센터 (law.go.kr) + 찾기쉬운 생활법령정보 (easylaw.go.kr) + 공공데이터포털 (data.go.kr, 공공누리); KLRI English (openlaw.klri.re.kr); Minimum Wage Commission (minimumwage.go.kr, 2026 = ₩10,320); COMWEL (1588-0075); Immigration (1345); HRD Korea/EPS (1644-0644); Danuri (1577-1366); BBB (1588-5644); NLRC (nlrc.go.kr); KCTU/민주노총 (nodong.org); KCPLAA (kcplaa.or.kr, 우아한 노무 해결사); 서울노동권익센터 (seoullabor.or.kr); KCC LBS (lbsc.kr); Q-Net (q-net.or.kr). Figures, deadlines, penalties, and registration rules change — re-verify, and get a lawyer's review on the LBS/privacy/takedown items before launch.*
