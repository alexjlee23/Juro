# Jurio 주리오 — Design System & UX Spec (v1, consolidated)
*The single design source of truth. Merges your two research reports (brand identity & logo; general app design & visual-UX system) and the four logo/brand mockups, with final decisions. Supersedes the earlier `design-brief.md`. Pairs with the product plan and build guide.*

> **Jurio 주리오** — *"Know your rights. Walk with confidence." / "당신의 권리를 알고, 당당하게."*
> A worker-rights app that makes legal information simple, accessible, and actionable — so every worker can know their rights and act with confidence.

---

## 1. Brand foundation

**Name:** **Jurio / 주리오** — treat English and Korean as **equal tiers**, never shrink one to a sub-label. Default lockup "Jurio 주리오" (EN-first) in product chrome; "주리오 Jurio" acceptable in Korean-first contexts (e.g., a Korean press headline).

**Positioning (from the research):** sit **between a government portal (authority/trust) and an anonymous community (participation)** — closer to the trust side, but **warmer**. The goal is *"trustworthy but not scary."* Look like a **credible legal-help app, never a law-firm ad** and never an enforcement agency. Avoid: promo clutter, expert-ego-over-user, procedural-but-context-poor portals, anonymous-feed chaos.

**Brand pillars (the spine):**
- **Guidance (길잡이)** — clear direction in confusing situations ("what do I do next?").
- **Protection (보호)** — we stand with the worker; know your rights.
- **Clarity (명료)** — understand simply, act with confidence.

**Personality:** Trustworthy · Human · Empowering (신뢰 · 사람 중심 · 임파워링).

**One-line definition:** *"일하는 사람의 권리를 겁주지 않고 끝까지 안내하는 법률 길잡이"* — a legal guide that walks working people through their rights without scaring them.

---

## 2. Logo system

**Recommended primary mark → "Compass-J Shield"** (the most-developed concept across your mockups). It carries two of the app's core jobs at once — **Guidance** (the compass) and **Protection** (the shield) — wrapped around the **J**. The compass needle doubles as a **direction/map-pin** cue, tying into the "find help nearby" map.

**Alternates (keep in the kit):**
- **Open Law** (open book + J) — for knowledge/Rights-Library contexts and a warmer, less "shield" feel.
- **Monogram J** — for the smallest sizes (favicon, notification badge, watch).
- Also valid from the reports: **Rights Door (권리문)**, **Field Pin (현장 핀)**, **Bridge J** — good if "shield" ever reads too enforcement-like; the Door/Pin are strong map-pin variants.

**Variants every kit must ship (separate files — "one master logo for everything" fails in practice):** full lockup, wordmark, symbol, monochrome, inverse, dark-mode, favicon, **app icon**, **map pin**, **notification badge**.

**Rules:** maintain clear space ≈ the height of the "J"; test legibility at **16px**; logo SVGs in both **stroke** and **expanded-outline** versions (thin strokes lose perceived contrast when rendered). Logo color may exceed normal contrast, **but** any logo used inside a **button/nav/badge** must meet accessible contrast.

**Motion (calm, never celebratory):** 160–220ms opacity+position only. Logo rises ~8px on home entry; map pin drops once; badge pulses **≤2×**. **No bounce or celebration** on wage-theft / harassment / dismissal / injury screens.

---

## 3. Color system

Blue is the **brand axis only**; neutrals carry information hierarchy; **never** use color alone to signal state (always add icon/label/border).

**Primary blue scale**
| Token | Hex | Use |
|---|---|---|
| Blue 900 | `#1E3A8A` | Pressed, darkest brand header |
| Blue 800 | `#1E40AF` | Hover, emphasis text |
| Blue 700 | `#1D4ED8` | **Primary button, active tab, links/small text on white** (max contrast ≈ 6.5:1) |
| **Blue 600 (Brand)** | `#2563EB` | **The Jurio brand blue** (logo, splash, large UI); white text on it ≈ 5.1:1 (AA) |
| Blue 500 | `#3B82F6` | Focus aids, chart secondary |
| Blue 100 | `#DBEAFE` | Selected background, info tint |
| Sky Blue 50 | `#E6F0FF` / `#EFF6FF` | Lightest info surface |

> **Reconciliation:** your mockups use **#2563EB** as the hero blue (keep it for brand/large UI); for **buttons, links, and small text on white**, step to **Blue 700 #1D4ED8** for a safe accessibility margin. Light blues are **tints only**, never text color.

**Neutrals** — Navy/strong **#0B1D3A**; Text `#0F172A`; Secondary text `#334155`; Caption `#64748B`; Border `#CBD5E1`; Surface tint `#F1F5F9`; **App background `#F8FAFC`** (Cloud Gray `#F2F4F7` is an alias).

**Semantic (functional only)** — Success `#22C55E` (use `#15803D` for success *text* on white) · Caution/Warning `#B45309` (with `#FFB547` as a fill/badge, navy text on it ≈ 9.3:1) · Alert/Error `#B42318` (brand `#C43A3A` ok for badges) · **Support Teal `#14B8A6`** = optional secondary accent for supportive/"human" touches, used sparingly.

**Dark mode (compact):** bg `#0B1320`, surface `#13203A`, text `#E8EEF7`, secondary `#9FB2CC`, primary `#3B82F6`, border `#24344C`; lighten semantics ~15%.

---

## 4. Typography

**Brand fonts: Pretendard (Korean + Latin) + Inter (Latin), both on Google Fonts and open-licensed (Pretendard = SIL OFL; Inter = OFL).** Headings **Pretendard SemiBold**; body **Pretendard Regular**; Inter optional for Latin-only UI. Pretendard GOV (fixed-width numerals, clearer I/l) is a good variant for data/legal screens.

**Performance/licensing fallback (document it):** `system-ui, "Apple SD Gothic Neo", "SF Pro", "Noto Sans KR", Roboto, sans-serif`.

**Type scale (px / line-height):**
| Token | Size/LH | Use |
|---|---|---|
| Display | 36 / 44 | Marketing hero only, 1 per screen |
| Heading XL | 30 / 38 | Section titles |
| Heading L | 24 / 32 | Screen titles |
| Heading M | 20 / 28 | Card/modal titles |
| **Body L** | 18 / 28 | **Default on reading-heavy / accessibility screens** |
| Body M | 16 / 24 | Base body (Korean body never below 16) |
| Body S | 14 / 20 | Secondary, labels |
| Caption | 12 / 18 | Helper, meta, "updated" dates |

Rules: sentence case; **tabular numbers** for wages/dates; **Large-text mode** scales up with reflow (no clipping); never rely on italics for Korean.

---

## 5. Spacing, grid, elevation

- **Spacing tokens:** 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 (8pt grid + 4pt micro).
- **Radius:** 8 (inputs/chips), 12 (cards), 16 (sheets/app icon).
- **Elevation:** soft, low (cards: small shadow; sheets/modals: medium). Thin decoration, strong hierarchy.
- **Responsive (Korea = high Galaxy/foldable share):** 0–599px single column; 600–767px allow two aux areas; 768px+ split-view or navigation rail; 1024px+ list-detail dual pane. Mobile grid 4-col, tablet/large 12-col.

---

## 6. Iconography, imagery, motion

- **Icons:** 24px base / 20px aux, **2px stroke, rounded ends, fill only on active**. Open set (Lucide / Material Symbols). **Text-supporting, not decorative** — use only icons with strong agreed meaning (search, save, share, filter, alert, security, privacy, accessibility); avoid ambiguous metaphors.
- **Imagery:** real **workers and workplaces** — store/factory/office-support/delivery/student-worker/parent/migrant-worker/counseling-room/documents/maps — **not** marble columns, gavels, or law-firm handshakes. (Worker Rights Consortium and Fair Work show empathy beats "legal authority.")
- **Motion:** see §2 — 160–220ms, restrained, never celebratory on distressing screens.

---

## 7. Components & states

Define each once with full states; hand to Claude Code as the component spec.

| Component | Rule | States |
|---|---|---|
| **Button** | primary / secondary / tertiary / destructive; **one primary action per section** | default, hover, pressed, focus-visible, disabled, loading |
| **Text field** | **visible label on top** (never placeholder-as-label), helper/error below | default, focus, filled, success, error, disabled |
| **Search bar** | recent + suggested terms, **voice input**, visible label | idle, typing, suggestions, no-result |
| **Tabs / chips** | ≤5; beyond that use filter chips | default, active, focus, disabled |
| **Card** | title + desc + meta + **≤1 CTA** | default, hover, selected |
| **Bottom sheet / modal** | mobile = bottom sheet; **legal/destructive = modal** with focus-trap | entering, open, focus-trap, dismissing |
| **Banner / toast** | info/success/warning/error; `aria-live`/`role` set | the four states |
| **Empty / Loading / Error / Offline** | defined for **every** screen | skeleton, empty (invites action), recoverable error, offline |

Button labels are **concrete verbs** ("저장 / Save", "진정 접수 / File complaint"), not "OK", and the same word carries through the flow.

---

## 8. Information architecture

**Bottom nav — 4 tabs (matches your mockups):**
```
[ 홈 Home ]   [ 지도 Map ]   [ 커뮤니티 Community ]   [ 내 My ]
```
- **홈 Home** — the launchpad: greeting, search, the **"도움 받기 / Get Help"** CTA, quick actions (**권리 가이드 / 상담 신청 / 긴급 신고**), issue tiles ("임금 못 받음 / 산재 / 부당해고 / 위험한 일"), and "오늘의 정보 / Today's info". This is where **Guided Help** and the **Rights Library** are entered.
- **지도 Map** — Find Help Near Me + Directory + Consultation Schedule (nearby 노무사 / centers / unions, filter, call/route).
- **커뮤니티 Community** — job-type channels, 실시간 인기글/HOT, 소식, verified-노무사 Q&A.
- **내 My (내정보)** — profile; **saved & My Cases** (Case Companion); **work logbook + evidence export**; **alerts inbox**; **accessibility settings**; **Privacy Center**; help/contact/legal; language (KR/EN). *Houses the calculators, Migrant/EPS preferences, and Alerts.*

*(Optional 5-tab variant: add **권리 Rights** if you want the Library at tab level. Recommended: keep 4 tabs + a strong Home launchpad — cleaner with bilingual labels.)*

**Main loop:** Home → search/browse → detail → core action (file 진정 / find help / use a tool) → **review/confirm** → done. Saved/Recent → Alerts → My run as the secondary axis.

---

## 9. Key flows (design end-to-end)

- **Crisis → resolution (signature):** Home tile ("I wasn't paid") → **Guided Help** rule-based questions → **Next-step card** (checklist + evidence to gather + the right human) → one-tap call/route → **Case Companion** tracks status + deadlines.
- **Detail pages** must show, in the first screen: **what it is / why you can trust it / what you can do now** (explanation + source block + one primary action). Don't split these across scrolls.
- **Forms (filing/applying):** stepped, with **back + save-and-resume**, helper/error text per field, and a **dedicated review/confirm step** before any legal/data submission (WCAG 3.3.4).
- **Permissions:** **just-in-time** — request location/notifications **right before the feature needs them**, with a one-line in-context reason. Never at first launch.

---

## 10. Accessibility (a hard requirement)

Baseline **WCAG 2.2 AA + KWCAG 2.2** (Korea's standard under 장애인차별금지법) + Android **48dp** touch targets. A design system alone does **not** make a service accessible — research, build, and testing do.

Concrete criteria to meet:
- **Contrast** ≥ 4.5:1 text / 3:1 large + meaningful UI (1.4.3, 1.4.11); body text is real text, not images (1.4.5).
- **Target size** ≥ 24px (2.5.8); design to **48dp** on mobile.
- **Focus appearance** large + ≥3:1 (2.4.13); full keyboard/switch operability (2.4.3/2.4.7).
- **Never color-only** state (1.4.1) — pair with icon/label.
- **Status messages** reach assistive tech without moving focus (4.1.3) — `role=status` / `aria-live`.
- **Error handling**: identify + suggest a fix + review step (3.3.3/3.3.4).
- **Redundant Entry** (3.3.7) — autofill/reselect info already given in a flow.
- **Accessible Authentication** (3.3.8) — no memory/puzzle gates; allow passkeys/paste.
- Plus **TTS on every page**, **voice input** for search, **large-text mode** (your comprehension standard).

---

## 11. Privacy, legal & app-store compliance (the gap the reports surfaced)

**Promote a "Privacy Center (개인정보 센터)" to a real product screen** (under My). It shows, in one place: **data collected, purpose, consent status, retention, third-party SDKs, data download, and account deletion**, plus a contact. This earns trust *and* satisfies store policy.

**Korea baseline:** in-app **개인정보처리방침**; specify collected items / purpose / retention / contact; **minimal collection, no national ID / visa number, anonymous or guest path**; if location is used, evaluate the **위치정보법 (LBS) report** (or qualify for the on-device-only exemption); show **official source links + "updated" dates** on legal content.

**Google Play:** in-app entry point to the privacy policy (not buried/web-only); **Data safety** section must match real behavior; **prominent in-app disclosure** for any unexpected sensitive-data use; **account-deletion path both in-app and on the web**.

**Apple App Review:** safety/design/legal are independent review axes; **UGC apps require content filtering, reporting, blocking, and a published contact**; prepare a **demo account + a written explanation of features** (incl. any visa-related fields) for reviewers.

**Trademark & domain (pre-launch task):** search **KIPRIS (Korea)** + **USPTO (US/EN)** for *Jurio / 주리오 / JURIO / JURIO LEGAL / JURIO APP* and phonetic look-alikes, **and figure-mark similarity** (shield / compass-J / door / pin marks). Reserve domains **jurio.kr · jurio.app · jurio.com · jurio.co.kr** in one pass. *This is a first-pass design-risk check, not legal advice — get a trademark professional's review before filing.*

---

## 12. Voice & microcopy
Plain, **active**, sentence case, **bilingual parity**, calm "explain like I'm worried." Buttons say what happens; the word that triggers an action matches the word in its result toast. Errors explain what happened + how to fix it, in the app's voice — no apologies, never vague. Empty screens invite action. Sample home/splash lines from your mockups: "당신의 권리를, 함께 찾다", "일하는 사람의 편에서 당신을 지킵니다", "정확한 정보로 더 나은 선택을 돕습니다".

---

## 13. Hand-off to developers (so Claude Code builds it cleanly)

**Ship tokens + specs, not just a design file.**
- **Foundation tokens** — color, type, spacing, radius, elevation, opacity, motion. Use **semantic** names, not primitives: `color.text.primary`, `color.bg.surface`, `color.action.primary.default`, `color.surface.info`, `color.alert`.
- **Component specs** — props, variants, sizes, every state (incl. disabled/loading/error).
- **Page templates** — Home, Map, Community, My, Detail, Form, Review/Confirm, Privacy Center, Empty/Loading/Error.
- **Content guide** — button/error/empty/consent/delete copy (KR + EN).
- **Accessibility annotations** — focus order, role/name, screen-reader labels, target sizes, keyboard behavior.
- **Privacy/legal pack** — privacy-policy entry point, permission scripts, consent copy, deletion flow.
- **Analytics event map** — `view_home`, `search_submit`, `guided_step_complete`, `detail_cta_click`, `case_started`, `privacy_open`, `delete_request_submit`, `help_call_tap`.

---

## 14. Brand asset deliverables (what to get from whoever finalizes the visuals)
Master vector (**SVG** first; PDF/EPS backup) · the full logo set (§2) · **typography doc** (KR/EN font names, fallbacks, weight mapping, variable-axis defaults) · **color doc** (hex/RGB/token names + forbidden combos like white-on-amber) · **motion doc** (logo intro / pin drop / badge pulse: duration + easing) · **icon set** (16/20/24/32/48, SVG outline+fill pairs).

---

## 15. Build order & open decisions

**Design → build sequence:** lock tokens (§3–5) → finalize the logo (§2) → wireframe the 4 nav screens + Home launchpad + Privacy Center → build the token set + components in Claude Code → assemble screens → accessibility/compliance QA (screen reader, large text, keyboard, contrast, permission flows, deletion/download paths) before store submission.

**Decisions to confirm:**
1. **Final logo** — recommend **Compass-J Shield** as primary (+ Open Law alternate, Monogram J for small). Your call.
2. **Brand blue handling** — #2563EB brand / #1D4ED8 for buttons+small text (recommended).
3. **Nav** — 4 tabs (recommended) vs add a 권리 Rights tab.
4. **Font** — Pretendard + Inter (recommended) vs system stack.
5. **Trademark/domain** — run KIPRIS/USPTO + reserve domains early.
6. **LBS** — confirm the on-device-only location exemption vs filing.

---

### Links
GOV.UK Design System https://design-system.service.gov.uk · WCAG 2.2 https://www.w3.org/TR/WCAG22 · Material 3 https://m3.material.io · One UI https://developer.samsung.com/one-ui · Fluent 2 https://fluent2.microsoft.design · Pretendard https://github.com/orioncactus/pretendard · Inter https://rsms.me/inter · Lucide https://lucide.dev · Google Play User Data https://support.google.com/googleplay/android-developer/answer/10144311 · Apple App Review https://developer.apple.com/app-store/review/guidelines · KIPRIS https://www.kipris.or.kr · PIPC https://www.pipc.go.kr
