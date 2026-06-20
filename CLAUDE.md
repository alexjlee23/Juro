# Jurio 주리오 — Claude Code project memory

Bilingual (KR/EN) labor-rights app for workers in Korea. Read these before planning or building:
- **Product spec:** @worker-rights-app-plan.md (v9)
- **Design system / tokens / UI:** @jurio-design-system.md
- **First Guided Help pathway (build this first):** @guided-help-unpaid-wages.md
- **Content/security/legal/testing:** @jurio-prebuild-pack.md · **Build & publish:** @build-and-publish-guide.md · **Store readiness:** @jurio-launch-readiness.md

## What we're building (one line)
Inform workers of their rights, connect them to the right human nearby, and let them ask a worker community — designed to run on automation with a near-zero team.

## Build order
- Build **Phase 1 (MVP)** first (plan §12). Don't start the community (Phase 2) until Phase 1 works.
- First feature: the **"I wasn't paid" Guided Help tree** (@guided-help-unpaid-wages.md).
- Ship the **web version first** (shareable link), then the native apps.

## Non-negotiable rules (YOU MUST follow)
- **The AI feature never gives legal advice and never interprets the law.** It retrieves and cites the relevant statute; no confident match → say so and route to a human. Every answer ends by recommending a real 노무사 / union / institution. **Disclose AI use and get consent before sending data to the AI service.**
- **Source everything:** any imported legal text, news, or schedule stores + displays its source name + a link to the original.
- **Collect almost no personal data. NEVER ask for a national ID or visa number.** Anonymous/guest by default; never expose or report users.
- **Guided Help is rule-based (deterministic decision trees), not AI.** Works offline; auditable; versioned JSON.
- **Comprehension standard:** low reading level, plain language, KR + EN side by side, tappable glossary, text-to-speech on every page, voice input for search.
- **Process location on-device where possible;** never send user coordinates to the server.
- **Privacy & deletion:** ship a **Privacy Center** (under the My tab) + **account/data deletion in-app and via web**. **Just-in-time permission prompts** (never at launch).
- **Design:** use the semantic design tokens from @jurio-design-system.md (brand blue #2563EB; buttons/links/small-text #1D4ED8; Pretendard + Inter). 4-tab nav: 홈 Home · 지도 Map · 커뮤니티 Community · 내 My. One primary action per screen; visible labels (never placeholder-as-label); define empty/loading/error states. Target WCAG 2.2 AA + KWCAG.

## Tech stack
- **Expo + React Native + TypeScript**, i18n (KR/EN), web + iOS + Android from one codebase.
- **Supabase** (Postgres + PostGIS + auth + storage); managed vector store for the law search (RAG over law.go.kr + the library).
- **Kakao Maps** (primary) + Google Maps (fallback).
- A **daily scheduled job** syncs statutes / minimum wage / news / schedules and re-stamps "updated" dates (cache-and-serve, so external API rate limits never bite). News ingest **excludes worker injury/fatality bulletins**.
- Crash monitoring (Sentry); privacy-preserving analytics (no PII; e.g. Plausible/Umami) — no third-party ad/tracking SDKs.

## Don't
- Don't build the deferred **reviews** feature (legal exposure — plan §15).
- Don't **hardcode legal figures** (e.g., minimum wage) — pull from sourced content so the daily sync updates them (keep a seeded fallback for offline).
- Don't **scrape kcplaa.or.kr** (blocks automated access); curate manually.
- Don't ship a **thin web wrapper** for the native apps (Apple rejects it) — ensure real native functionality.
- Don't use **localStorage/sessionStorage** assumptions in artifacts/previews; use real app storage.

## Commands
- (fill in once scaffolded: install / run / test / lint / deploy)
