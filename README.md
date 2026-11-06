# jaswanthnani02.github.io

Portfolio site for **Jaswanth Gaddam**, Cloud and AI Solutions Engineer (Chicago).

**Live:** https://jaswanthnani02.github.io/ · [Resume (PDF)](Jaswanth-Gaddam-Resume.pdf) · [LinkedIn](https://www.linkedin.com/in/gaddamjaswanth/)

## What's on it

- **Hero** with the key results, then **selected work**: BWT Brain (RAG knowledge platform), the ticket dispatcher (with a live model of its two assignment rules), the client intelligence platform (with an architecture diagram), the operations dashboard, n8n onboarding, doc-link-check, and earlier data pipelines
- **How I build:** three design decisions and three production lessons from the [case study](https://github.com/Jaswanthnani02/client-intelligence-platform)
- **Experience, education, certification, skills** (with logos), a conference photo ticker, and contact

The hero has a WebGL2 wave field (an original fragment shader in `script.js`) behind a cut-out portrait (`portrait-cutout.webp`, made from `profile.jpg` with an offline background-removal model). It follows the mouse, pauses off screen, draws one still frame with reduced motion, and falls back to a CSS gradient without WebGL2.

The layout scales with the screen: the root font size grows from 16px on phones to 24px on large monitors, and every size uses `rem`.

## Stack

Plain HTML, CSS, and a little JavaScript. No framework, no build step, no tracking.
GitHub Actions deploys `main` to GitHub Pages (`.github/workflows/static.yml`).

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `script.js` | The portfolio and the dispatcher model |
| `Jaswanth-Gaddam-Resume.pdf` | The resume. Replace this file to update it; every link points here |
| `fonts/` | Geist (SIL Open Font License, `fonts/OFL.txt`) |
| `icons/` | Technology logos: Microsoft Azure architecture icons, svg-logos (CC0), devicon and VS Code icons (MIT), vendor marks from MIT-licensed n8n nodes |
| `scripts/make-og.js` | Renders `scripts/og-card.html` to `og-card.png`, the link preview |

## Run locally

```sh
npm install
npm run dev   # serves on http://localhost:8080
```

Serve over HTTP, not `file://`, so the fonts load.
