# N0VA — Personal Archive

A cyberpunk/retro personal portfolio built with React, TypeScript, Vite, Framer Motion, and Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Desktop OS feature

The Desktop OS is an additional overlay; it does not replace the original portfolio page. Use **LAUNCH OS** in the top navigation or **ENTER VOID OS** in the hero section.

- Double-click a desktop shortcut to open its app window.
- Drag a window by its title bar.
- Use the window controls to minimize, maximize/restore, or close it.
- Use the bottom dock to reopen apps.
- Use **EXIT OS**, the dock's X button, or `Escape` to return to the portfolio.
- The Terminal app opens the existing terminal modal.

## Main files

- `src/App.tsx` — portfolio content, cipher, terminal, and Desktop OS interactions.
- `src/styles.css` — original styling, visual polish, Off-duty section, and Desktop OS styling.
- `src/main.tsx` — React entry point.

## Portfolio content and environment

The primary Selected Work section now highlights the real project details provided by Yuvraj: InvestWise (in progress) and Detective Mystery Game (working prototype). Repository/demo links are intentionally omitted until they are available. The N0VA terminal, Caesar cipher, VOID OS, Arcade, Classified room, favorites, live status, and EmailJS contact form remain part of the experience.

The social links point to Yuvraj's supplied GitHub and LinkedIn profiles. A resume is intentionally not linked yet.

Copy `.env.example` to `.env.local` and enter your own EmailJS values to enable the contact form. Never publish `.env.local` or share its values. If updating an existing local copy, preserve your current `.env.local` separately; the distributable project ZIP omits it for safety.

## N0VA Arcade update

The VOID OS desktop now includes an **Arcade** app in the desktop shortcuts and dock.

Included games:
- **Tic-tac-toe:** local two-player game with win/draw detection and reset.
- **Reaction test:** wait for the green signal and click as quickly as possible; early clicks count as a false start.

To run locally:

```bash
npm install
npm run dev
```

Open the local Vite URL, click **LAUNCH OS**, then double-click **Arcade** (or click its dock icon). The games run in the browser and do not upload scores.

## Adding cover artwork (music, games, movies, shows)

Open `src/App.tsx` and edit the `FAVORITE_MEDIA` object near the Live Status configuration. Paste a direct image URL into each `imageUrl` field, for example:

```ts
const FAVORITE_MEDIA = {
  currentGame: { title: 'Your current game', details: 'Replace this with whatever you are playing right now.', imageUrl: 'https://example.com/game-cover.jpg' },
  music: { title: 'Music', detail: 'Track / artist goes here', imageUrl: 'https://example.com/album-cover.jpg' },
  movie: { title: 'Movies & shows', detail: 'Favorite title goes here', imageUrl: 'https://example.com/movie-poster.jpg' },
  game: { title: 'Games', detail: 'Favorite game goes here', imageUrl: 'https://example.com/game-cover.jpg' },
};
```

Use a direct, publicly accessible image URL (ending in `.jpg`, `.png`, or `.webp` where possible). For the recently played music list, add `imageUrl` to each item in `RECENT_TRACKS`. For the manually configured current game in Live Status, set `MANUAL_GAME.imageUrl`. Spotify's currently playing card already uses the album art URL returned by Discord/Lanyard automatically. If an image URL is blank, the UI falls back to its existing icon design.
