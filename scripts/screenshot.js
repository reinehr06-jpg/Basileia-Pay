// scripts/screenshot.js
// Uso: node screenshot.js <url> <output_path>

const puppeteer = require('puppeteer')

;(async () => {
  const [,, url, outputPath] = process.argv

  if (!url || !outputPath) {
    console.error('Uso: node screenshot.js <url> <output>')
    process.exit(1)
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await page.waitForTimeout(1500)  // aguarda animações
    await page.screenshot({ path: outputPath, fullPage: true })
  } finally {
    await browser.close()
  }
})()
