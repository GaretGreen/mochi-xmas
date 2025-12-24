# Mochi-Bär — Christmas Game

A tiny Christmas-present “game” for friends: you get three choices — pet Mochi, feed Mochi, or quit — and each choice shows a modal with a random Mochi photo + reaction.

Festive extras:
- Snowfall overlay.
- MIDI music toggle (starts only after clicking due to browser autoplay rules).

## Add/replace Mochi photos
- Drop images into the top-level `photos/` folder.
- Supported formats: png, jpg/jpeg, webp, gif.
- The app loads them via Vite’s `import.meta.glob('../photos/*.{png,jpg,jpeg,webp,gif}', { query: '?url', import: 'default', eager: true })` in `src/App.tsx`.

## Dev
    npm install
    npm run dev

## Build & preview
    npm run build
    npm run preview

## Lint
    npm run lint

## Deploy (GitHub Pages)
This repo includes a GitHub Actions workflow that builds `dist/` and deploys it to GitHub Pages on pushes to `main`.

In GitHub (one-time setup):
- Settings → Pages → Source: GitHub Actions
- Settings → Actions → General → Workflow permissions: Read and write permissions

Deploy:
- Push/merge to `main` (or change the workflow branch if you use a different default branch)
- GitHub → Actions → “Deploy to GitHub Pages” should run and publish the site

Note: `vite.config.js` uses `base: './'` so the app works when served from a sub-path.

## Deploy (Netlify)
Netlify is configured via `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist/`
- SPA fallback redirect to `/index.html`
