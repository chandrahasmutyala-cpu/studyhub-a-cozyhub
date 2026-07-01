# Plan: Groq migration + StudyHub World Explorer

## Part 1 — Swap Lovable AI → Groq (your own key)

Note: `LOVABLE_API_KEY` is a Lovable-managed secret and cannot be deleted from the tools panel, but I will stop using it entirely in code. All AI calls will use your new `GROQ_API_KEY` against `https://api.groq.com/openai/v1/chat/completions`.

Files to update:
- `src/lib/tutor.functions.ts` — call Groq (model: `llama-3.3-70b-versatile`).
- `src/lib/doodlekitty.functions.ts` — Groq doesn't do image generation. Options:
  a) Keep it disabled with a friendly "image editing coming soon" message, OR
  b) Remove DoodleKitty entirely.
  Please pick — I'll default to (a) so the route still exists but returns a clear notice.
- Any other AI server fn (`planner.functions.ts`, `translator.functions.ts`, `use-tutor-ai.ts`) → Groq.

## Part 2 — StudyHub World Explorer (free, lightweight)

New route: `/_authenticated/world-explorer`

Tech: `three`, `@react-three/fiber`, `@react-three/drei`. Pure procedural low-poly geometry (boxes, cylinders, planes) — no external map/asset downloads, no Google Maps.

### Scope (V1, ship-able)
- **3 districts** as separate scenes (dropdown to switch): Japan, Korea, China. Each is a small ~50×50 unit plaza with 3–5 low-poly buildings (school, library, store, station, gate) styled per country palette.
- **Player**: capsule avatar, third-person camera, WASD on desktop, on-screen joystick on mobile (touch), walk/run (shift).
- **Clickable landmarks**: click a building → popup with kanji/hangul/hanzi sign, reading, meaning, "Save word" button (stores in `localStorage`).
- **NPCs**: 2–3 static low-poly characters per district. Click → chat panel using StudyHub tutor (Groq) with a role prompt ("You are a Japanese student, speak simply, include romaji").
- **Quests**: 3 starter quests per district ("Talk to 1 NPC", "Learn 5 words", "Visit the library") tracked in `localStorage`, XP counter in HUD.
- **Universities**: at the "University Gate" landmark, open a drawer listing universities for that country from the existing `study-directory.json`.
- **Settings**: graphics Low/Med/High (toggles shadows + pixel ratio), FPS meter.

### Explicitly OUT of V1 (I'll flag as follow-ups)
- Full avatar customizer (V1 = fixed cute avatar with color picker).
- Offline map caching via service worker (V1 = maps are code, so already offline once loaded).
- Voice / speech NPCs.

## Questions before I build
1. **DoodleKitty**: keep disabled with a notice, or delete the route entirely?
2. **Groq model**: `llama-3.3-70b-versatile` (best quality, default) or `llama-3.1-8b-instant` (fastest, cheapest)?
3. **World Explorer navigation**: add as a new sidebar item under "Creative", or under "StudentHub"?

Once you answer, I'll ship both parts in the next turn.