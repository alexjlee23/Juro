# Jurio 주리오 — Launch, Store & Benchmark Readiness
*The final layer for smooth implementation + publishing on Google Play and the App Store. Benchmarks excellent apps (beyond worker-rights), specifies the content/data that must be auto-wired from day one, and gives complete store-submission checklists. Pairs with the plan (v9), design system, build guide, and pre-build pack.*

---

## 0. Two findings that save you weeks (read first)

1. **Developer accounts — personal is fine; know the tradeoff.** Google forces **new *personal* accounts to run a closed test with ≥12 opted-in testers for 14 continuous days** before production; **organization accounts (legal entity + D-U-N-S) are exempt.** **Using a personal account (the default here) works** — line up your interested workers as the 12 testers and start the 14-day clock early (build guide §8). **Apple:** enroll as an **Individual** ($99/yr, **no D-U-N-S needed** — that's only for organizations; your legal name shows as seller). Forming a non-profit later removes Google's gate and shows an org name — optional, not required to launch.
2. **Your AI finder + sensitive data trigger extra store rules.** Both stores require **accurate privacy "labels"/Data-safety forms covering every SDK** (analytics, crash, AI), an **in-app + web account-deletion path**, and Apple expects **AI-use disclosure and user consent before any data is sent to an AI service**. Bake these in from the start, not at submission.

---

## 1. Benchmark — patterns to steal from excellent apps (not just worker-rights)

Your two research reports already studied legal/civic apps; here are the broader, best-in-class consumer patterns worth adopting, each mapped to a concrete Jurio move.

| App (category) | The pattern that makes it great | Jurio adopts |
|---|---|---|
| **토스 Toss** (fintech) | One clear action per screen, plain copy, calm trust | Home = one hero action ("도움 받기"); never crowd a screen |
| **당근 Karrot** (local community) | Lightweight, neighborhood trust, low-friction posting, no flashy clutter | Community stays quiet + local; posting is 2 taps; anonymity by default |
| **카카오맵 / 네이버지도** | Map + bottom-sheet conventions users already know | Don't reinvent map UX; reuse the familiar pin → sheet → call/route flow |
| **Duolingo** (education) | Onboarding that delivers value in <60s; **gentle, opt-in, well-timed** notifications; visible progress | First session ends with a real answer; notifications are opt-in + about *your case*, never nagging |
| **Nextdoor** (local social) | Verified-local trust + strong safety/reporting | Verified-노무사 badge + visible reporting/blocking; trust is the product |
| **지식iN / Stack Overflow / Reddit** | Accepted-answer + reputation + moderation surface the best answers | 채택 + upvotes + verified-expert weighting; automated moderation first line |
| **GOV.UK / Citizens Advice** | Task-first, plain language, accessibility as default | Guided Help "what do I do" flows; WCAG-grade from day one |
| **KakaoTalk / WhatsApp** | Offline-first, fast on low-end devices, tiny install | Core pages cached offline; performance budget for low-end phones (migrant users) |
| **Notion / Linear** | Perceived quality through polish, speed, empty-state care | Designed empty/loading/error states; fast, no jank |
| **Apple Health / Signal** | Privacy as a visible feature, on-device data | Privacy Center + on-device logbook + "we never report you," shown plainly |

**Cross-cutting lessons every top app shares:** value before signup (guest mode), no forced onboarding carousels, search *and* browse, instant feedback on every tap, and relentless consistency. All already in the plan/design — this confirms the direction.

---

## 2. Day-one auto-wired content & data (what must be live + self-updating at launch)

You want the content (law, maps, legal-aid access) automatically populated and maintained from the start. Each type below ships **wired to a source with an auto-update mechanism and a fallback** — no manual daily work.

| Content | Source (auto) | Update mechanism | Fallback at launch |
|---|---|---|---|
| **Statutes / law text** | law.go.kr Open API (+ KLRI English) | Daily sync job → your DB; "updated" stamp | Seeded snapshot bundled in the build |
| **Plain-language explanations** | easylaw.go.kr (paraphrased, sourced) | Periodic refresh + staleness check | ~12 core pages pre-written, shipped |
| **Minimum wage / figures** | minimumwage.go.kr | Annual auto-update | 2026 value hardcoded as fallback |
| **Legal-aid & institutions (map)** | Curated directory (geocoded) | "Report outdated" + periodic re-check | Full seed list shipped (§ plan §11) |
| **Hotlines (1350 / 1345 / 1644-0644 / COMWEL…)** | Curated, rarely change | Manual review on release | Hardcoded, always available offline |
| **Consultation schedule** | KCPLAA + worker centers (sourced links) | Daily refresh + curation | Seed schedule shipped |
| **Per-sector news (소식)** | RSS/official feeds, AI-summarized + source-linked | Daily ingest (excludes injury/fatality notices) | Empty-state until first ingest |
| **Guided Help decision trees** | Versioned JSON in repo (from official sources) | Flagged when underlying law changes | Shipped with the build (offline-capable) |

The **daily sync job (plan §9.1)** runs all of this; the **cache-and-serve design** means users read your DB (so external API rate limits never bite, and content shows instantly even offline for core pages).

---

## 3. Google Play — submission readiness checklist
- [ ] **Organization account** (skip the 12-tester/14-day closed-test gate that hits personal accounts). If personal: plan a **≥12-tester, 14-continuous-day closed test** before production, then apply for production access (~7-day review).
- [ ] **AAB** built and signed via **Play App Signing**; **target the current API level** (Android 16 / **API 36 required for new users from Aug 31, 2026**).
- [ ] **Data safety form** completed and **matching real behavior** (declare every SDK: analytics, crash, AI, maps).
- [ ] **Privacy policy URL** live + an **in-app entry point** (your Privacy Center).
- [ ] **Account deletion** reachable **in-app *and* via a public web URL**; data-deletion mechanism.
- [ ] **Content rating** via the IARC questionnaire; declare UGC (community).
- [ ] **Permissions minimal + justified**; location uses the system picker / just-in-time prompt; no broad contacts access.
- [ ] **Store listing assets:** app icon (512×512), feature graphic (1024×500), ≥2 phone screenshots (plus 7"/10" tablet if supported), short description (80 chars), full description (4000), **KR + EN listings**.
- [ ] **Testing tracks:** internal (fast, ≤100) → closed (the gate, if personal) → open beta → production with **staged rollout** (e.g., 10% → 50% → 100%).

## 4. Apple App Store — submission readiness checklist
- [ ] **Apple Developer Program** ($99/yr); enroll as **Organization** (needs a **D-U-N-S number** — start early).
- [ ] Build with the **current Xcode / iOS 26 SDK** (required since Apr 2026); **64-bit**; iPhone app should **also run on iPad** where possible.
- [ ] **App Privacy "nutrition labels"** accurate, covering **all data incl. third-party SDKs**; add **privacy manifests + signatures** for any SDK touching sensitive APIs (missing = rejection).
- [ ] **AI disclosure + consent:** disclose AI use and **get user consent before sending data to the AI service**.
- [ ] **Privacy policy URL** live; **account deletion in-app** (Guideline 5.1.1(v)); data deletion.
- [ ] **Screenshots** for each required device class (up to 10), **showing the actual app UI** (no misleading mockups); optional **app preview video** (≤30s, real UI).
- [ ] **Export compliance** answered (encryption beyond standard HTTPS?).
- [ ] **Demo account credentials + feature notes** (incl. any visa-related fields) in **"Notes for App Review."**
- [ ] **UGC requirements** met (filtering, reporting, blocking, contact) for the community.
- [ ] **Not a thin web wrapper** — ensure meaningful native functionality (relevant if you ship an Expo-web-wrapped build); apps that are "just a website" get rejected (2.3.1/4.0).
- [ ] **TestFlight** beta before submission; **age rating**; **support URL** + marketing URL.

## 5. ASO & store listing (KR + EN)
- **App name:** "Jurio 주리오 — 노동·권리 도움" (KR) / "Jurio — Worker Rights & Legal Help" (EN). Keep the brand first.
- **Subtitle/short (Apple subtitle ≤30, Play short ≤80):** "쉽게 알고, 바로 도움받는 노동 권리" / "Know your rights, get help fast."
- **Keywords (Apple field / Play via description):** 노동법, 임금체불, 부당해고, 산재, 근로계약, 노무사, 외국인 노동, labor law, wage, unfair dismissal, workers rights, legal aid, Korea.
- **Screenshot story (first 2 slots sell):** 1) "당신의 권리, 쉽게 / Know your rights" (Home), 2) "무슨 일이 있어도, 다음 단계 / What to do next" (Guided Help result), 3) Map/help, 4) Community, 5) Privacy/"we never report you." Localize both languages.
- Plan a **quarterly ASO refresh** (stores reward active, well-rated apps).

## 6. Release engineering & observability
- **Builds/submit:** EAS Build + EAS Submit (cloud, no Mac needed for iOS). Pin Node/SDK versions in the repo.
- **Versioning:** semantic version + build number bump per release; tag releases in GitHub.
- **Crash/error monitoring:** add **Sentry** (or Crashlytics) — crash-free rate is a store quality signal *and* an Apple rejection trigger (Guideline 2.1).
- **Performance budget:** target small install size, fast cold start, optimized/compressed images, and test on a **low-end Android device** (many migrant users are on budget phones).
- **Staged rollout** on Play; phased release on Apple; watch crash + ANR rates before going wide.
- **OTA updates (Expo):** fine for JS content/copy fixes, but **native changes still require a store submission** — keep OTA within store policy (no changing the app's core purpose via OTA).

## 7. Support & feedback (low-ops)
- A **support URL + email** (required by stores) and an in-app "도움말·문의 / Help & contact" with a short FAQ.
- **In-app feedback** form (routes to your inbox); an **in-app rating prompt** triggered *after* a successful task (e.g., completing a Guided Help flow), never on launch.
- Keep a one-line response SLA you can actually meet; auto-acknowledge.

## 8. Pre-submission QA gate (catches ~the 88% of rejections)
Run this before hitting "submit" on either store:
- [ ] No crashes/bugs in a full walkthrough on a **real device** (top rejection reason).
- [ ] **Privacy labels / Data-safety match reality**, incl. every SDK.
- [ ] **Account + data deletion** work, in-app and web.
- [ ] **All links live** (privacy policy, support, ToS); demo account works.
- [ ] **Screenshots/metadata accurate** (no misleading claims, real UI).
- [ ] **Permissions** prompt just-in-time with a reason; nothing requested at launch.
- [ ] **Accessibility pass** (screen reader, large text, keyboard, contrast).
- [ ] **AI disclosure + consent** present; the "not legal advice" disclaimer is visible.
- [ ] Meaningful native functionality (not a thin web wrapper).
- [ ] **Legal pack** (ToS, Privacy Policy) finalized by a lawyer.

## 9. Launch sequence (the order to actually do it)
1. **Register the org/non-profit + dev accounts** (Apple D-U-N-S, Google org) — unblocks everything and skips Google's tester gate.
2. **Finalize logo + design tokens**, build the MVP (plan §12 / build guide), wire the day-one content (§2 above).
3. **Internal test** (Play internal track + TestFlight) → fix.
4. **Prepare store assets + listings (KR/EN), privacy/Data-safety forms, account-deletion URL, demo account.**
5. **Run the pre-submission QA gate (§8).**
6. **Submit Android first** (faster review, 2–7 days), then **iOS** (24h–2 weeks; expect a possible first-pass rejection — fix and resubmit).
7. **Staged rollout + monitor** crash-free rate, then go wide.
8. **Pilot loop with your interested workers** (pre-build pack §6) feeds fixes before the wide rollout.

---

*Store rules change — verify against developer.apple.com and the Play Console help before submitting. The two levers that matter most: an **organization account** (skips the testing gate, builds trust) and **privacy/AI disclosure done from the start** (the #1 rejection area).*
