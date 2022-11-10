import puppeteer from 'puppeteer';

// We might want to intervene and filter the outgoing requests. For example, when scraping web pages, we might want to block unnecessary elements from loading in order to speed up the procedure and lower bandwidth usage.

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 250 });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on('request', (request) => {
    request.resourceType() === 'image' ? request.abort() : request.continue();
  });

  await page.goto('https://danube-web.shop/');

  await page.screenshot({
    path: './screenshots/02. requestInterception-intervene.png',
  });

  await browser.close();
})();
