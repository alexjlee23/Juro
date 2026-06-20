# Jurio 주리오 — START HERE (master index + critical path)
*The one page that ties the whole prep together. Read this first, then follow the critical path. Two people, GitHub + Claude Code.*

---

## The document set (read in this order)
1. **`worker-rights-app-plan.md` (v9)** — the product spec: what the app does, every module, the rights taxonomy, automation/ops, roadmap, compliance. *The source of truth for scope.*
2. **`jurio-design-system.md`** — brand, finalized logo direction, color/type tokens, components, information architecture, accessibility, voice. *The source of truth for how it looks + the dev token hand-off.*
3. **`guided-help-unpaid-wages.md`** — the first finished Guided Help flow ("I wasn't paid"). *Build this first; it's the template for the rest.*
4. **`jurio-prebuild-pack.md`** — content-production playbook, security & data-protection baseline, breach response, the legal documents (ToS/Privacy/disclaimer), pilot/usability testing, v1 "definition of done."
5. **`build-and-publish-guide.md`** — step-by-step: tools, GitHub two-person workflow, Expo scaffolding, web-first deploy, AI/backend, store publishing + compliance.
6. **`jurio-launch-readiness.md`** — benchmark patterns from excellent apps, the day-one auto-wired content/data spec, full Google Play + Apple submission checklists, ASO, release engineering, the pre-submission QA gate.
7. **`CLAUDE.md`** — the project rules file Claude Code reads automatically (drop it in the repo root).

> **Superseded — ignore/delete:** `design-brief.md` (the earlier WorkCompass-named draft; fully replaced by `jurio-design-system.md`).

---

## The critical path (do these in order)

### Phase 0 — Foundation (unblocks everything)
- [ ] **Create developer accounts (personal is fine):** **Apple Developer — enroll as an Individual** ($99/yr, **no D-U-N-S needed**; your legal name shows as the seller; start early — identity check takes a few days). **Google Play** ($25 one-time).
- [ ] **Plan Google's closed test:** new *personal* accounts must run a **12-tester / 14-continuous-day closed test** before production — line up **your interested workers as the 12 testers** (build guide §8). *(Forming a non-profit later removes this gate — optional, not needed to launch.)*
- [ ] **Reserve the brand:** trademark check (KIPRIS + USPTO) + domains (jurio.kr / .app / .com).
- [ ] **Confirm the final logo** (recommended: Compass-J Shield) → generate the icon/favicon/map-pin/badge set + the design-token file.
- [ ] **Set up GitHub** (org + repo + both collaborators), install tools + Claude Code, add `CLAUDE.md` + the plan to the repo. *(build guide §1–3)*

### Phase 1 — Build the MVP (web first)
- [ ] Scaffold **Expo + React Native + TypeScript**, i18n (KR/EN), the design tokens, the 4-tab shell. *(build guide §4)*
- [ ] **Wire the day-one content** so it's live + self-updating: law.go.kr sync, easylaw-sourced pages, institutions/legal-aid directory + map, hardcoded hotlines, consultation schedule, minimum wage. *(launch §2)*
- [ ] Build, in order: **Home → the "I wasn't paid" Guided Help flow → ~12 Rights pages → Map + hotlines → Glossary → Tools (calculators, logbook, evidence export) → Migrant Hub → My + Privacy Center.** *(plan §12)*
- [ ] Add the **AI finder** (retrieval-only, cite + route, refuse-and-route, AI disclosure + consent) and **Community** (Phase 2) once the core works.
- [ ] **Deploy the web version** (Vercel / EAS Hosting) — a shareable link. *(build guide §6)*

### Phase 2 — Pre-launch hardening
- [ ] **Security baseline** met (minimal data, client-side encryption, secrets, secure deletion, dependency scanning) + **breach plan** written. *(prebuild §3–4)*
- [ ] **Legal pack** finalized by a lawyer: ToS, Privacy Policy, standing disclaimer; the LBS (위치정보법) question resolved. *(prebuild §5)*
- [ ] **Account + data deletion** working **in-app and on the web.**
- [ ] **Accessibility QA** passed (screen reader, large text, keyboard, contrast). *(design system §10)*
- [ ] **Pilot with your interested workers** — comprehension + task testing; fix the copy. *(prebuild §6)*
- [ ] Hit the **v1 "definition of done."** *(prebuild §8)*

### Phase 3 — Submit & launch
- [ ] Prepare **store assets + KR/EN listings, Data-safety / App-Privacy forms, account-deletion URL, demo account.** *(launch §3–5)*
- [ ] Run the **pre-submission QA gate.** *(launch §8)*
- [ ] **Submit Android first** (2–7 day review), then **iOS** (24h–2 wks; expect a possible first-pass rejection). *(launch §9)*
- [ ] **Staged rollout + monitor** crash-free rate, then go wide.

---

## The 3 blockers that matter most
1. **Google's 12-tester closed test (personal account).** You must run a **12-tester, 14-continuous-day** closed test before you can publish to everyone — recruit your interested workers as testers and **start that clock early.** (Apple Individual enrollment has no such gate.)
2. **Privacy + AI disclosure built in from day one** — the #1 store-rejection area (accurate Data-safety/App-Privacy incl. SDKs, account deletion, AI consent).
3. **Accurate, sourced legal content** — the product *is* the content; the production playbook + the daily sync keep it correct and current.

## Your next 3 actions (today)
1. Start the **Apple Individual enrollment** (identity check takes a few days) and create the **Google Play** account; **line up your 12 testers** from your interested workers.
2. **Confirm the logo** so the icon/token set can be generated.
3. **Set up the GitHub repo** with `CLAUDE.md`, and have Claude Code scaffold the Expo app — then build the "I wasn't paid" flow.

> The planning is complete. From here, value comes from **building**, not more documents — bring me back to generate the icon/token files, draft the next Guided Help trees, write Rights-Library pages, or build any screen.
