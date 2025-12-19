# Copilot instructions (mochibaer-xmas)

## Project snapshot
- Vite + React (SWC) single-page app. Entry is `index.html` → `src/main.jsx` → `src/App.jsx`.
- JavaScript/JSX only (no TS). ESM modules (`"type": "module"` in `package.json`).

## Product intent (source prompt)
> I want to create a christmas-present for friends of mine using a bunch of images of their cat.
> The "game" should be a react app, so I can easily deploy it as a website.
> The basic idea is that you are presented with the choices to either pet or feed the cat or quit the game.
> Clicking each option shows a modal acknowledging the selection and after closing the modal returns the user to the selection screen again.
> The cat is called Mochi (alternatively "Mochi-Bär").

## Developer workflows (use these scripts)
- Install: `npm install`
- Dev server (HMR): `npm run dev`
- Production build: `npm run build` (outputs `dist/`)
- Preview build: `npm run preview`
- Lint: `npm run lint` (ESLint flat config)

## Repo-specific code patterns to follow
- App structure: today the UI lives mostly in `src/App.jsx` with local helpers.
  - `src/App.jsx` defines `Modal` inline and uses React hooks (`useState`, `useMemo`, `useEffect`).
  - As the app grows, prefer splitting into small components/modules (e.g., `Modal.jsx`, `useMochiPhotos.js`) rather than growing `App.jsx` indefinitely.
- Asset loading pattern (important):
  - Mochi images live in the top-level `photos/` folder and are loaded via `import.meta.glob('../photos/*.{png,jpg,jpeg,webp,gif}', { query: '?url', import: 'default', eager: true })` in `src/App.jsx`.
  - If you add new image types, keep the glob’s extension list in sync.
- Modal behavior conventions (keep consistent if you modify/extend it):
  - Close on `Escape` and close on backdrop click.
  - Uses basic a11y attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.

## Styling conventions
- Tailwind CSS is the primary styling approach; prefer utility classes over writing custom CSS.
- `src/index.css` should stay minimal (Tailwind directives + tiny global resets only).
- Tailwind config lives in `tailwind.config.js` and PostCSS config in `postcss.config.js`.
- PostCSS uses `@tailwindcss/postcss` (not `tailwindcss`) to match the installed Tailwind version.

## Deploy
- GitHub Pages deploy via GitHub Actions workflow: `.github/workflows/deploy-pages.yml`.
- `vite.config.js` sets `base: './'` so the built site works from sub-paths.

## Linting expectations
- ESLint is configured in `eslint.config.js` (flat config). It ignores `dist/`.
- `no-unused-vars` allows unused vars matching `^[A-Z_]` (useful for intentional placeholders/constants).
- Code should stay compatible with the current ESLint setup (JS/JSX only).

## When making changes
- Prefer editing existing files (`src/App.jsx`, `src/index.css`) unless there’s a clear need to introduce new modules.
- Keep the Vite/React SWC setup intact (`vite.config.js` uses `@vitejs/plugin-react-swc`).
