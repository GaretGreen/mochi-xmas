# Mochi-Bär — Christmas Game

A tiny Christmas-present “game” for friends: you get three choices — pet Mochi, feed Mochi, or quit — and each choice shows a modal with a random Mochi photo + reaction.

## Add/replace Mochi photos
- Drop images into the top-level `photos/` folder.
- Supported formats: png, jpg/jpeg, webp, gif.
- The app loads them via Vite’s `import.meta.glob('../photos/*.{png,jpg,jpeg,webp,gif}')` in `src/App.jsx`.

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

In GitHub:
- Settings → Pages → set Source to GitHub Actions.

Note: `vite.config.js` uses `base: './'` so the app works when served from a sub-path.
