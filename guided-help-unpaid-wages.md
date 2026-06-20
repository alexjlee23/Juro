# Guided Help — Pathway 1: "I wasn't paid" (임금체불)

*A deterministic, rule-based decision tree for Module 1 (Guided Help). Built from official content; surfaces rights + a checklist + the right human. Implement as `guided_paths` config — no AI, no individualized legal advice, no outcome prediction. Ships KR + EN (English shown here; mirror every string in Korean).*

**Persistent footer on every screen:** *"This is general legal information, not legal advice, and it can't predict your specific result. For your situation, talk to a 노무사 or the labor office shown below."*

---

## Entry
**Title:** "I wasn't paid — or I was paid less than agreed."
→ go to **Q1**

---

## Q1 — What's unpaid?
- **A. My regular wages/salary** (not paid, or less than agreed) → set `wage_type=regular` → **Q2**
- **B. Overtime / night / holiday extra pay** → set `wage_type=premium` → **Q1a**
- **C. Severance (퇴직금)** → set `wage_type=severance` (also link Library: *Severance*) → **Q2**
- **D. My last paycheck after I left** → set `wage_type=final`, `employment=left` → **Q2**

### Q1a — (only if B) How many people work at your workplace?
- **5 or more** → set `size=5plus` → note ▸ *"Overtime, night, and holiday work must be paid at +50% of your ordinary wage (근로기준법 제56조)."* → **Q2**
- **Fewer than 5** → set `size=under5` → note ▸ *"At workplaces with fewer than 5 employees, the +50% premium for overtime/night/holiday is generally **not** legally required. Your agreed base wage and the minimum wage are still owed."* → **Q2**

---

## Q2 — How are you employed?
- **A. Employee** (regular, part-time, or daily — set schedule, supervised) → `worker=employee` → **Q3**
- **B. Platform / delivery rider** (배민, 쿠팡이츠, etc.) → `worker=platform` → note ▸ *"Riders are usually protected as workers (근로자) or 노무제공자, so the complaint route below often still applies. If you're not sure, confirm with 1350 or a 노무사."* → **Q3**
- **C. "Freelancer" / 3.3% / not sure** → `worker=unsure` → note ▸ *"The label on your contract doesn't decide it — many people called 'freelancer' or '3.3%' are legally employees. Whether you count as a 근로자 is itself worth checking with a 노무사 or 1350. If you truly are an independent contractor, unpaid fees are usually a civil (court) matter rather than a labor-office complaint."* → **Q3**

---

## Q3 — Are you still working there?
- **A. Still working** → `employment=current` → note ▸ *"There are protections against being punished for claiming unpaid wages; if you're worried about retaliation, raise it with a 노무사 first."* → **Q4**
- **B. I left / quit / was let go** → `employment=left` → note ▸ *"Your final pay — including any unpaid wages — must be paid within **14 days** of leaving (근로기준법 제36조)."* → **Q4**

---

## Q4 — When did the unpaid work happen?
- **A. Within the last 3 years** → `intime=yes` → **Q5**
- **B. More than 3 years ago** → `intime=no` → note ▸ *"Wage claims expire after **3 years** (근로기준법 제49조). Some of it may be out of time — talk to a 노무사 soon to check what you can still claim."* → **Q5**

---

## Q5 — Anything that changes who can help you fastest?
- **I'm a foreign / migrant worker** → `flag=migrant` → note ▸ *"Korean labor law protects you **regardless of your visa status** (including if you're undocumented). Unpaid wages is also a recognized reason that can let an E-9 worker change workplaces. Multilingual help: 1644-0644, 1345."*
- **I'm 24 or younger** → `flag=youth` → note ▸ *"The 청소년 근로권익센터 gives free 노무사 help to young workers."*
- **Neither / skip** → continue
→ go to **Outcome**

---

## Outcome — "Here's what's true, and what to do"
*(Assemble from the notes collected above, then show these four blocks.)*

### ① Your right
You must be paid the wages you earned, in full, on the regular payday. Unpaid wages are **임금체불**. An employer who doesn't pay can face **up to 3 years in prison or a ₩30 million fine** (근로기준법 제43·109조). You generally have **3 years** to claim unpaid wages (제49조). *(If `wage_type=final`: final pay is due within 14 days of leaving — 제36조. If `wage_type=severance`: see the Severance page for how 퇴직금 is calculated.)*

### ② What to do — in order
1. **Gather your evidence** (block ③).
2. *(Optional)* Ask your employer for payment **in writing** (text/email) and keep it — not required, but useful later.
3. **File a complaint (진정)** with the Ministry of Employment and Labor — **online** through the **노동포털 (labor.moel.go.kr)**, or in person at the **지방고용노동관서 (local labor office)** for your workplace's area. A **근로감독관 (labor inspector)** is assigned and contacts both sides.
4. **If the employer still won't pay** after the inspector's order, the case can move to criminal referral. You may also be able to recover part of your unpaid wages from the government through the **근로복지공단 (COMWEL) 간이대지급금** — the labor-office process produces the confirmation you'll need (COMWEL ☎1588-0075).
5. **Get free help:** a **노무사** (incl. **국선노무사** if you qualify), a worker center, or the consultation schedule in the app. General guidance: **☎1350**. *(migrant: ☎1644-0644 / 1345 · youth: 청소년 근로권익센터.)*

### ③ Evidence to gather
*(Your in-app logbook can hold these, and "Evidence export" turns them into one PDF packet.)*
Written employment contract · pay slips · **bank deposit records** · your work schedule / attendance · **messages with your boss about pay** · names of coworkers who can confirm · your own day-by-day log of hours worked and amounts owed.

### ④ Talk to a real person
→ **[Open Find Help map, filtered to: unpaid wages + your language + open now]**
→ **Hotlines:** 1350 (labor) · 1644-0644 / 1345 (migrant, multilingual) · 청소년 근로권익센터 (≤24) · COMWEL 1588-0075 (substitute payment).

*(Repeat the persistent disclaimer.)*

---

## Implementation notes
- Model as nodes in `guided_paths` (versioned config), each: `id`, `question`, `options[] {label_kr, label_en, set_flags, next}`, plus terminal `outcome` blocks that render conditionally on collected flags.
- Fully **offline-capable** (no network needed to traverse) and **auditable** (every branch + claim traces to a statute/official source).
- Pull the live figures (minimum wage, penalties) and the "what to do" steps from the same sourced Library content (Rule B) so this tree updates with the daily sync.
- Localize **all** strings (KR + EN) and keep reading level low (Standard C); offer TTS.

*Sources (verify at build time; show in-app): 근로기준법 제36·43·49·56·109조 and 근로자퇴직급여보장법 via 국가법령정보센터 (law.go.kr) + 찾기쉬운 생활법령정보 (easylaw.go.kr); 고용노동부 노동포털 (labor.moel.go.kr); 근로복지공단 (comwel.or.kr, 1588-0075); EPS/외국인 (1644-0644), Immigration (1345); 최저임금위원회 (2026 minimum wage ₩10,320). Re-verify figures, the 간이대지급금 conditions, and the filing process before publishing.*
