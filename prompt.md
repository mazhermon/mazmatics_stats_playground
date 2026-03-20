# Task: Remotion — "What is Mazmatics NZ Stats Explorer" Video

## Context

Create a short promotional video using Remotion that explains what the Mazmatics NZ Stats Explorer is. This video embeds real clips from the landscape-recorded MP4 videos (`e2e/social-videos/landscape/`) to show the interactive charts in action.

**Read before starting:**
- `CLAUDE.md` — project conventions
- `brand.md` — brand colours, fonts, tone
- `.claude/skills/remotion` — Remotion framework patterns

**Dev server:** Assumed running on `localhost:3001` (or 3000 — check CLAUDE.md / prior context).

---

## Story & Narrative

The video tells this story, beat by beat:

1. **Title hook** — "What is Mazmatics NZ Stats Explorer?"
2. **The book** — "Mazmatics is a kids maths book — Fun Math for Kids"
3. **This is something else** — "But this site? It's a different kind of project."
4. **The data** — Show 2–3 chart clips: filter interactions, data changing, real NZ school data moving
5. **The human behind it** — "Built by a curious dad of 2 primary school kids — an outsider project, just like the book."
6. **CTA** — "Explore NZ school maths data at mazmatics.com"

**Tone:** Warm, accessible NZ English. Conversational. Not corporate. Not academic. Like a mate explaining something they're passionate about. Use NZ English (maths not math, colour not color, recognise not recognize).

---

## Technical Specs

### Two Compositions

**1. Instagram Reels (Primary)**
- ID: `MazmaticsInstagram`
- Dimensions: 1080 × 1920 (9:16 portrait)
- FPS: 30
- Duration: ~20–25 seconds (600–750 frames)

**2. LinkedIn (Secondary)**
- ID: `MazmaticsLinkedIn`
- Dimensions: 1920 × 1080 (16:9 landscape)
- FPS: 30
- Duration: ~20–25 seconds (600–750 frames)

Both: **Silent** (no audio — music added later in CapCut/DaVinci). No voiceover.

---

## Brand Styling

Apply the Mazmatics brand faithfully:

- **Background:** Deep slate/charcoal (`#0f172a` — slate-950)
- **Text:** Off-white (`#f1f5f9` — slate-100) for body, white `#fff` for headings
- **Gradient** (for title text and section headings): `linear-gradient(to left, #BA90FF, #47A5F1)` — applied via SVG linearGradient or CSS gradient-clip effect
- **Accent colour:** `#BA90FF` (Light Purple) for highlights, labels
- **Secondary accent:** `#47A5F1` (Sky Blue)
- **CTA highlight:** `#FFF73E` (Mazmatics Yellow) — use sparingly, for the CTA beat
- **Font — Headings:** Geist Sans (load via @remotion/google-fonts or embed)
- **Font — Data/Mono:** Geist Mono
- **Font — Wordmark only:** `Bungee Shade` (the MAZMATICS wordmark) — load via Google Fonts
- **Decorative offset shadow** (on key callout cards): `box-shadow: #BA90FF 8px 8px 0px, #47A5F1 -8px -8px 0px`
- **Subtle graph-paper grid** as background texture (faint lines — a nod to the maths exercise book feeling)

---

## Video Clips to Embed

Use `<Video>` from Remotion to embed clips from `e2e/social-videos/landscape/`. These are the landscape MP4 files recorded at 1024×768.

Preferred clips to use (pick the most visually striking moments):
- `landscape-video-4-nzqa-timeline.mp4` — shows timeline toggling between ethnicity groups
- `landscape-video-2-nmssa-equity.mp4` — shows equity gap chart toggling by ethnicity/gender/decile
- `landscape-video-5-regional-map.mp4` — shows NZ map with regional hover tooltips
- `landscape-video-1-timss-world.mp4` — shows NZ in international TIMSS rankings

Trim each clip to its best 3–5 seconds using Remotion's `startFrom` and `endAt` props on `<Video>`.

---

## Scene Breakdown

### Scene 1: Title Hook (0–3s, frames 0–90)
- Background: dark slate with faint graph-paper grid
- Large bold heading (gradient text): "NZ Stats Explorer"
- Subheading: "Interactive NZ school maths data"
- Mazmatics wordmark (Bungee Shade) fades in at bottom
- Fade in from black

### Scene 2: The Book (3–6s, frames 90–180)
- Text: "Mazmatics is a kids maths book"
- Subtext: "Fun Math for Kids — designed for home play"
- Simple, warm. Maybe a purple accent card with offset shadow.
- Animate in from below

### Scene 3: But This... (6–9s, frames 180–270)
- Text: "This site is something else."
- Subtext: "An explorer for the real data behind NZ school maths"
- Text slides in from right
- Slight pause

### Scene 4: Chart Clips (9–18s, frames 270–540)
- Show 2–3 embedded video clips in sequence
- Each clip: 3–4 seconds, fills most of the frame
- Label overlay at bottom: e.g. "NCEA Maths Achievement — by ethnicity" in Geist Mono, small, `#BA90FF`
- Clips fade in and out — no hard cuts

### Scene 5: The Human (18–22s, frames 540–660)
- Text: "Built by a curious dad of 2 primary school kids"
- Subtext: "An outsider project — just like the book."
- Warm, slightly smaller text. Personal.
- Subtle fade in

### Scene 6: CTA (22–25s, frames 660–750)
- Yellow background section (`#FFF73E`) or yellow text on dark
- Large text: "Explore the data"
- URL: "mazmatics.com"
- Mazmatics wordmark (Bungee Shade)
- Fade to black at end

---

## Project Structure

Create a Remotion project in `remotion/` at the project root:

```
remotion/
├── package.json          (Remotion-specific dependencies)
├── remotion.config.ts    (Remotion config)
├── src/
│   ├── index.ts          (entry point — registers compositions)
│   ├── Root.tsx          (composition registry)
│   ├── compositions/
│   │   ├── Instagram.tsx (9:16 portrait composition)
│   │   └── LinkedIn.tsx  (16:9 landscape composition)
│   ├── scenes/
│   │   ├── TitleScene.tsx
│   │   ├── BookScene.tsx
│   │   ├── TransitionScene.tsx
│   │   ├── ChartClipsScene.tsx
│   │   ├── HumanScene.tsx
│   │   └── CTAScene.tsx
│   └── components/
│       ├── GradientText.tsx   (gradient-clip text helper)
│       ├── GraphPaperBg.tsx   (faint grid background)
│       └── ClipPlayer.tsx     (video clip with label overlay)
```

---

## Installation

Install Remotion inside the `remotion/` subdirectory (NOT in the root Next.js project — keep dependencies isolated):

```bash
cd remotion
npm init -y
npm install remotion @remotion/cli
```

Add a convenience script to the ROOT `package.json`:
```json
"remotion:preview": "cd remotion && npx remotion preview src/index.ts",
"remotion:render:instagram": "cd remotion && npx remotion render src/index.ts MazmaticsInstagram --output ../e2e/social-videos/remotion/mazmatics-instagram.mp4",
"remotion:render:linkedin": "cd remotion && npx remotion render src/index.ts MazmaticsLinkedIn --output ../e2e/social-videos/remotion/mazmatics-linkedin.mp4"
```

Output directory: `e2e/social-videos/remotion/` — create this directory.

---

## Acceptance Criteria

- [ ] `remotion/` directory exists with valid Remotion project
- [ ] `remotion/src/Root.tsx` registers both `MazmaticsInstagram` and `MazmaticsLinkedIn` compositions
- [ ] All 6 scenes are implemented in separate scene components
- [ ] Video clips from `e2e/social-videos/landscape/` are embedded using `<Video>` with `startFrom`/`endAt` trimming
- [ ] Brand colours (`#8C5FD5`, `#BA90FF`, `#47A5F1`, `#FFF73E`) applied correctly
- [ ] Gradient text applied to title and section headings
- [ ] Graph-paper grid background rendered in `GraphPaperBg.tsx`
- [ ] Bungee Shade font used for Mazmatics wordmark
- [ ] Geist Sans used for headings and body; Geist Mono for data labels
- [ ] All text is NZ English (maths, colour, recognise, etc.)
- [ ] `remotion:preview` script added to root `package.json`
- [ ] `remotion:render:instagram` and `remotion:render:linkedin` scripts added to root `package.json`
- [ ] `e2e/social-videos/remotion/` directory created
- [ ] TypeScript compiles cleanly inside `remotion/` (`npx tsc --noEmit`)
- [ ] Compositions run without errors in preview (`npx remotion preview` shows video in browser)

## Completion Promise

When all acceptance criteria are met, output the exact text:

<promise>REMOTION_VIDEO_COMPLETE</promise>
