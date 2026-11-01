# jaswanthnani02.github.io

Portfolio site for **Jaswanth Gaddam**, Cloud and AI Solutions Engineer (Chicago).

**Live:** https://jaswanthnani02.github.io/ · [Resume (PDF)](Jaswanth-Gaddam-Resume.pdf) · [LinkedIn](https://www.linkedin.com/in/gaddamjaswanth/)

## What's on it

- **Work:** the ticket dispatcher (100,000+ tickets assigned), the client intelligence platform (MCP tools with per-call authorization), the operations dashboard, n8n onboarding, and doc-link-check
- **A live model** of the dispatcher's two assignment rules, and an inline SVG architecture diagram drawn from the [case study](https://github.com/Jaswanthnani02/client-intelligence-platform)
- **Decisions and incidents** taken from the case study, then stack, history, certification, and contact
- Keyboard shortcuts: `E` email, `R` resume, `G` then `W/S/D/I/H` to go to a section, `?` for the list

## Stack

Plain HTML, CSS, and a little JavaScript. No framework, no build step, no tracking.
GitHub Actions deploys `main` to GitHub Pages (`.github/workflows/static.yml`).

| Path | Purpose |
| --- | --- |
| `index.html` | The portfolio |
| `styles.css` / `script.js` | Dark theme, clock, shortcuts, dispatcher model, image zoom |
| `resume.html` / `Jaswanth-Gaddam-Resume.pdf` | The resume as a web page and as a PDF |
| `fonts/` | Geist and Geist Mono (SIL Open Font License, `fonts/OFL.txt`) |
| `icons/` | Technology logos: Microsoft Azure architecture icons, svg-logos (CC0), VS Code icons (MIT) |
| `scripts/make-og.js` | Renders `scripts/og-card.html` to `og-card.png`, the link preview |

Colors follow Radix Colors (gray-dark, green-dark). Radii follow GitHub Primer.

## Run locally

```sh
npm install
npm run dev   # serves on http://localhost:8080
```

Serve over HTTP, not `file://`, so the fonts load.
