# Jurio 주리오 — Beginner Build & Publish Playbook
*Step-by-step for two people with little coding experience, using GitHub + Claude Code. Personal developer accounts (no business entity). Goal: a complete, usable app on the first release. Pairs with the plan (v9), design system, content manifest (in the pre-build pack), and `CLAUDE.md`.*

> Read `jurio-START-HERE.md` first for the big picture. This is the "how to actually do it" guide.

---

## 0. Flutter or React Native (Expo)? → Use **Expo (React Native)**

You asked about Flutter. Both are great, but for *your* situation **Expo is easier**, for three concrete reasons:
1. **No Mac needed for the iPhone version.** Expo's cloud build (EAS) compiles the iOS app for you. Flutter usually needs a Mac (or a paid CI like Codemagic) to build for iOS.
2. **Ship a real web version instantly.** One Expo codebase → **web + iPhone + Android**, and the web build is a normal website you can share by link today (great for a public-good app people find by searching). Flutter web works but is heavier and less search-friendly.
3. **Claude Code + the ecosystem.** React/TypeScript has the largest helper ecosystem and Claude Code is extremely strong at it, so you'll get unstuck faster.

Flutter is an excellent choice if you later want maximum native performance and don't mind a Mac/Codemagic — but it isn't *easier* for a beginner shipping web-first without a Mac. **Recommendation: Expo.** (Everything below assumes Expo.)

---

## 1. Install your tools (each person, once)
Do these in order; each is a normal installer.
1. **Node.js (LTS)** — https://nodejs.org → verify in a terminal: `node --version` (want 20+).
2. **Git** — https://git-scm.com → `git --version`.
3. **GitHub Desktop** (so you click instead of type Git) — https://desktop.github.com
4. **VS Code** (the editor) — https://code.visualstudio.com
5. **Claude Code** — Anthropic's AI that writes/runs code in your project:
   - Mac/Linux: `curl -fsSL https://claude.ai/install.sh | bash`
   - Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`
   - Run `claude` once and log in (needs a paid Claude plan). Prefer a GUI? Use Anthropic's **Desktop app**.
6. On your phone, install **Expo Go** (App Store / Play Store) — it previews your app live as you build.

---

## 2. Create your accounts (the personal-account reality)
You're using **personal** accounts (no business entity). Here's exactly what that means:

- **GitHub** (free): both make accounts at https://github.com. One creates a repository (or a free Organization) and adds the other (Settings → Collaborators). This is just for the code — no business needed.
- **Apple Developer Program** ($99/year): enroll as an **Individual** — **no D-U-N-S number needed** (that's only for companies). One catch: your **legal name shows publicly as the "seller."** If that's a concern, forming a non-profit later lets the org name show instead.
- **Google Play Console** ($25 one-time): a **personal** account works, **but** Google requires new personal accounts to **run a closed test with at least 12 testers who stay opted-in for 14 continuous days before you can publish to everyone.** This is normal and fine — **your interested workers are your 12 testers** (see Step 8). Forming a non-profit/organization account later removes this requirement, but you don't need it to launch.

> Start the Apple enrollment early (it can take a few days to verify identity).

---

## 3. Set up the project for Claude Code
1. Both **clone** the repo (GitHub Desktop → Clone, or `git clone <url>`).
2. Put these files in the repo root so Claude Code follows your plan automatically: **`CLAUDE.md`**, `worker-rights-app-plan.md`, `jurio-design-system.md`, `guided-help-unpaid-wages.md`. (Claude Code reads `CLAUDE.md` every session.)
3. The two-person rule that prevents chaos: never both edit `main`. Each works on a branch → opens a **Pull Request** → the other reviews + merges. GitHub Desktop and Claude Code both do this with buttons/prompts.
4. Split the work in the repo's **Issues** tab (one issue per screen), so you don't build the same thing twice.

---

## 4. Build the app with Claude Code — exact prompts to paste
`cd` into the repo, run `claude`, and work through these in order. Each prompt is something you can paste; review the result, run it, then open a PR.

1. **Scaffold:** *"Read CLAUDE.md and jurio-design-system.md. Create an Expo app with TypeScript and expo-router. Add a bottom tab navigator with four tabs — Home (홈), Map (지도), Community (커뮤니티), My (내). Set up i18n with i18next for Korean and English, with a language toggle in the header."*
2. **Design tokens + base components:** *"Create a theme file from jurio-design-system.md (colors incl. brand #2563EB and button #1D4ED8, Pretendard+Inter typography, spacing). Build base components: Button (primary/secondary/destructive), Card, ListRow, SourceBlock (shows a law name + law.go.kr link + 'updated' date), NextStepCard, and a persistent 'Information, not legal advice' Banner. Include loading, empty, and error states."*
3. **Home:** *"Build the Home screen per the design system: greeting, a search bar, a 'Get help / 도움 받기' primary button, quick actions (권리 가이드 / 상담 신청 / 긴급 신고), four issue tiles (임금 못 받음 / 산재 / 부당해고 / 위험한 일), and a 'Today's info / 오늘의 정보' card. Large text, text-to-speech ready."*
4. **Guided Help (build first, it's the core):** *"Implement Guided Help as a rule-based engine that loads decision trees from JSON in /content/guided-paths. Use guided-help-unpaid-wages.md as the first tree. Show one question per screen with progress dots, then a Next-step card with the checklist, evidence to gather, and the right phone number. It must work offline."*
5. **Rights Library:** *"Create the Rights Library: a browse/list screen and a detail template (plain summary, key facts, '<5 employees?' flag, migrant note, what-to-do-next, recommended help, SourceBlock, updated date). Seed it from the 12 pages in /content/rights (see the v1 content manifest)."*
6. **Map + help:** *"Build the Map screen with react-native-maps (Google) and a Kakao fallback. Show the seeded institutions from /content/directory as pins; tapping opens a bottom sheet with call, directions, and languages. Compute the user's location on-device only — never send coordinates to a server. Always show the hardcoded hotlines even with no location."*
7. **Tools:** *"Add Tools: a wage/overtime calculator and a severance calculator (pull the minimum wage from content, with a 2026 fallback), a work logbook (on-device), an Evidence export to PDF, and a contract checker that flags missing items vs 근로기준법 제17조."*
8. **My + Privacy Center:** *"Build the My tab: profile, saved & My Cases, alerts, and settings (language, large text). Add a Privacy Center screen showing data collected, consent status, a 'Download my data' button, and a 'Delete account' button that actually deletes. Add a simple public web page for account deletion too."*
9. **AI finder (after the core works):** *"Add the Ask/AI search: it calls our backend, which retrieves over the rights content and returns the matching statute plus a 'talk to a real 노무사' handoff. Show an AI-use disclosure + consent the first time. Never give legal advice or interpret; if there's no confident match, say so and route to a human."*

> Tip: build, then **test on your phone with Expo Go** after each step (`npx expo start`, scan the QR). Small steps + frequent PRs = fewer bugs.

---

## 5. Wire the day-one content (so it's complete + self-updating)
Have Claude Code add a **daily sync job** (serverless) that pulls statute + minimum-wage updates from the law.go.kr API into your database and re-stamps "updated" dates, and seed the app with the v1 content (the manifest in the pre-build pack) so it's **fully usable offline on first launch** even before the first sync. Backend: **Supabase** (free tier) for the database, simple accounts (no national ID), and storage.

---

## 6. Put it online (web first — a link people can use today)
- **Vercel** (https://vercel.com): sign in with GitHub → import the repo → it builds and gives you a live URL, and **redeploys automatically when you merge to `main`.** (Or `npx eas deploy` for Expo's own hosting.)
- Make it a **PWA** so phone users can "Add to Home Screen." Optionally point a domain (jurio.kr) at it.
➡️ Now your interested workers can use Jurio immediately — and they become your Play Store testers in Step 8.

---

## 7. Get ready to submit (both stores)
- `npm install -g eas-cli` → `eas login`.
- Build: `eas build -p android` and `eas build -p ios` (cloud builds — no Mac needed).
- Prepare the store listing assets and the compliance items (next steps). Start **Android first** (faster review).

---

## 8. Publish to Google Play (the personal-account path, step by step)
1. In **Play Console**, create the app; upload the build to the **Internal testing** track first (instant, up to 100 testers) — use this to check it installs and runs.
2. Create a **Closed testing** track and add your testers' emails. **You need ≥12 people opted in, using the app for 14 continuous days.** Send them the opt-in link; ask them to install on a **real phone** and open it a few times over the two weeks. *(Your interested workers are perfect for this — and they get early access.)*
3. Fill in: **Data safety** form (declare every SDK honestly), **privacy policy URL**, **content rating** questionnaire, **app icon + screenshots + descriptions (KR + EN)**, and the **account-deletion URL**.
4. After the 14 days with 12+ engaged testers, **apply for production access** (Google reviews in ~7 days).
5. Release to production with a **staged rollout** (e.g., 10% → 50% → 100%); make sure the build **targets Android 16 / API 36** (required for new users from Aug 31, 2026).

## 9. Publish to the Apple App Store
1. In **App Store Connect**, create the app. Upload via `eas submit -p ios`.
2. Set up: **App Privacy "nutrition labels"** (accurate, including analytics/crash/AI SDKs), **privacy manifests** for SDKs, **privacy policy URL**, **account deletion in-app**, **screenshots that show the real app** (up to 10), **export-compliance** answer, and a **demo account + notes** in "Notes for App Review."
3. Disclose **AI use + consent**; make sure the app is **not just a website wrapper** (it isn't — it has real native features). Submit. Review is usually 1–3 days; a first-pass rejection is common — fix and resubmit.

## 10. After launch
- Add **crash monitoring** (Sentry) — a crashy app gets rejected and uninstalled.
- Watch the crash-free rate during the staged rollout before going wide.
- Run the **pilot feedback loop** with your testers/workers (pre-build pack) and fix the copy.
- **OTA updates** (Expo) let you push small content/copy fixes without a new store review; bigger/native changes still need a resubmit.

---

### Handy links
GitHub https://github.com · Node.js https://nodejs.org · Claude Code setup https://code.claude.com/docs/en/setup · Expo https://expo.dev · EAS https://docs.expo.dev/eas · Vercel https://vercel.com · Supabase https://supabase.com · Claude API console https://console.anthropic.com · Play Console https://play.google.com/console · Apple Developer https://developer.apple.com · Codemagic (only if you ever choose Flutter) https://codemagic.io
