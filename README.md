# jaswanthnani02.github.io

Portfolio site for **Jaswanth Gaddam**, Cloud and AI Solutions Engineer (Chicago).

**Live:** https://jaswanthnani02.github.io/ · [Resume (PDF)](Jaswanth-Gaddam-Resume.pdf) · [LinkedIn](https://www.linkedin.com/in/gaddamjaswanth/)

## What's on it

- **Work:** Azure Functions ticket dispatcher (100k+ tickets auto-assigned), MCP tool servers with RBAC, a Cosmos DB ops dashboard, and n8n onboarding automation
- **Proof:** links to the public [architecture case study](https://github.com/Jaswanthnani02/client-intelligence-platform) and demo repos, plus a redacted architecture diagram and dashboard mock
- **Certifications, conferences, education, and contact**

## Stack

Plain HTML, CSS, and JavaScript. No build step. GSAP and Three.js load from a CDN for motion and the background canvas.
GitHub Actions deploys `main` to GitHub Pages (`.github/workflows/static.yml`).

| File | Purpose |
| --- | --- |
| `index.html` | The portfolio |
| `resume.html` / `resume.md` | The resume as a web page and as Markdown |
| `Jaswanth-Gaddam-Resume.pdf` | The downloadable resume |
| `script.js` / `styles.css` | Interactions (modals, lightbox, animations) and styles |
| `scripts/make-og.js` | Generates `og-card.jpg`, the link-preview image |

## Run locally

```sh
npm install
npm run dev   # serves on http://localhost:8080
```
