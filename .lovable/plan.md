# StudyHub — Big Update Plan

Three workstreams shipped in parallel over several turns. Nothing existing is renamed or removed; Groq keeps powering all text AI, Supabase auth/database untouched, all routes preserved.

## Workstream A — Pixazo image API (DoodleKitty + Media Translator)

The `PICAZO_API_KEY` you pasted is saved as `PICAZO_API_KEY` (the service is spelled **Pixazo**; same key works).

- New server helper `src/lib/pixazo.server.ts` — submits a job to `https://gateway.pixazo.ai/...` with header `Ocp-Apim-Subscription-Key`, then polls `/v2/requests/status/{id}` until `COMPLETED`, returns the image URL, downloads it, returns base64 back to the browser. Handles 401/402/429/timeout with clean error messages and one automatic retry.
- Model choice: **Nano Banana 2** (image editing, ~$0.03/img) for DoodleKitty (needs image-in → image-out) and **Nano Banana 2 Lite text-to-image** as a fallback. Screenshot OCR in Media Translator uses Nano Banana 2's vision + JSON prompt to extract text + translate.
- Rewire only two server functions:
  - `src/lib/doodlekitty.functions.ts` → call `pixazoEdit()` instead of throwing "temporarily disabled".
  - `src/lib/translator.functions.ts` → rewire `translateScreenshot` to Pixazo; `translateTranscript` stays on Groq.
- Groq stays as the only provider for tutor, planner, essay reviewer, vocab, university/scholarship AI, notes AI, flashcards AI.

## Workstream B — World Explorer full rebuild

`/world-explorer` is rewritten in place — same route, same navigation entry, same save keys in `localStorage` (migrated forward). Split into modular files under `src/lib/world/`:

- `world/engine.tsx` — R3F canvas, camera, controls, DPR scaling, quality tiers (Low/Med/High shadows, LOD, fog).
- `world/player.tsx` — third-person avatar controller (WASD + virtual joystick), run/jump, stamina, animation states.
- `world/districts/{japan,korea,china}.tsx` — procedurally instanced low-poly districts. Each district emits the full building list you requested (houses, shrines, temples, cafés, schools, universities, konbini, vending machines, bookstores, shopping streets, train station, apartments, subway entrance, restaurants, study centers, traditional streets, modern towers, parks). Uses `InstancedMesh` heavily so we can render hundreds of props at 60fps on mobile.
- `world/env.tsx` — roads, sidewalks, streetlights, benches, trees, flowers, rivers, bridges, crosswalks, bus stops, signs.
- `world/npcs.tsx` — 30–60 NPCs per district using a simple state machine (walk/sit/wave/idle). Click → open Groq-powered chat with role prompts (student, teacher, librarian, shop owner, tourist).
- `world/interactions.tsx` — clickable POIs (library, university, cafe, shop, door, sign, bus stop, vending machine). Signs open a language card: original / romaji|pinyin|hangul / English / "Save vocab".
- `world/weather.tsx` + `world/time.tsx` — sun cycle (day/evening/night) with color-graded lighting; particle rain / snow; cloud plane. Smooth transitions via lerped uniforms.
- `world/hud.tsx` — glassmorphism HUD: top-left avatar/name/XP/country/district, top-center mission, top-right minimap + graphics + FPS + settings, bottom-left joystick, bottom-right run/jump/interact/backpack.
- `world/save.ts` — auto-save position, XP, quests, avatar, vocab to `localStorage` (throttled).
- `world/landscape.ts` — on entering `/world-explorer`, request Screen Orientation API lock to landscape on mobile + fullscreen; `AppShell` chrome is hidden inside the route; on unmount, unlock + restore.

Bundle stays reasonable: existing three/@react-three/fiber/drei deps reused.

## Workstream C — App-wide premium minimal redesign

New design system in `src/styles.css`:

- Palette: Soft Sky `#8FB8F5`, Lavender `#B9A9F0`, Mint `#A8E6CF`, Warm White `#FDFCFA`, Card `#FFFFFF`, Charcoal `#1C1D22`, Soft Gray `#EEF1F6`, Blue Accent `#4C8DFF`. Full oklch tokens for light + dark.
- Type: **Plus Jakarta Sans** (body) + **General Sans / Cabinet Grotesk** fallback (display) via `<link>` in `__root.tsx`.
- Tokens: rounded-3xl cards, `--shadow-soft`, `--shadow-glow`, glass `backdrop-blur-xl bg-white/70` utility, spring easing curve.

Chrome:

- New `AppShell` — floating glass side drawer (avatar / level / streak / XP / search / grouped menu / recent pages / sync footer) with spring open/close, plus a floating bottom pill nav (Home, Study, Explore, AI, Profile) with animated active pill.
- Every route re-skinned to the new system: Dashboard, Japanese/Chinese/Korean academies, Kanji viewer, Vocab, Flashcards, Notes, Tasks, Focus, Tutor (AI Elements chat with large bubbles + floating composer + quick-chip suggestions), University Advisor, Universities, Scholarships, Cost Calculator, Admission Roadmap, Scholarship Eligibility, Essay Reviewer, Language Goals, Media Translator, DoodleKitty (large canvas + floating tools), Profile, Settings, Onboarding, Auth, Landing.
- Reusable primitives: `PageHeader`, `FloatingCard`, `GlassPanel`, `ListRow`, `QuickAction`, `SectionTitle` — pages compose these instead of ad-hoc classes.
- Motion: fade/slide/scale/spring page transitions via Motion (already installable), skeleton loaders on data pages.

## Order of shipping

Because you chose "all three in parallel" and "full spec / full redesign", this will span multiple turns. Each turn ends with a working build. Rough sequence per turn:

1. **Turn 1 (this one after approval)** — Pixazo helper + rewire DoodleKitty + Media Translator screenshot; design tokens + `AppShell` + bottom nav + shared primitives.
2. **Turn 2** — Re-skin Dashboard, Tutor (with AI Elements), DoodleKitty, Media Translator, Landing, Auth, Onboarding.
3. **Turn 3** — Re-skin Japanese/Chinese/Korean academies, Kanji viewer, Vocab, Flashcards, Notes, Tasks, Focus, Language Goals.
4. **Turn 4** — Re-skin Universities, Scholarships, University Advisor, Cost Calculator, Admission Roadmap, Scholarship Eligibility, Essay Reviewer, Profile, Settings.
5. **Turn 5** — World Explorer engine + player + Japan district + HUD + landscape lock + save system.
6. **Turn 6** — Korea + China districts, NPCs, interactions, weather, time cycle, quests wiring.
7. **Turn 7** — Polish pass, perf tuning, verification.

## Non-goals / guardrails

- No route renames, no removed features, no Firebase (project uses Supabase / Lovable Cloud — that stays), no auth changes, no database migrations.
- Groq stays for every text AI feature. Only DoodleKitty edit + Media Translator screenshot switch to Pixazo.
- If Pixazo returns 402 (insufficient balance) or 401, the UI surfaces a clear message; nothing crashes.

Approve and I'll start Turn 1.
