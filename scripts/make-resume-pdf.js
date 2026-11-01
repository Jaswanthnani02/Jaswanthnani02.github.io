// Renders resume.html to Jaswanth-Gaddam-Resume.pdf (US Letter, one page).
// Serve the site first so the font loads, then run from the repository root:
//   python3 -m http.server 8765 &   node scripts/make-resume-pdf.js
const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:8765';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${base}/resume.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: 'Jaswanth-Gaddam-Resume.pdf', format: 'Letter', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('Jaswanth-Gaddam-Resume.pdf written');
})();
