// Renders scripts/og-card.html to og-card.png (the link-preview image).
// Run from the repository root: node scripts/make-og.js
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file://' + path.resolve(__dirname, 'og-card.html'));
  await page.screenshot({ path: 'og-card.png' });
  await browser.close();
  console.log('og-card.png written');
})();
