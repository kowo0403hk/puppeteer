import puppeteer from 'puppeteer';

// Request interception enables us to observe which requests and responses are being exchanged as part of our script’s execution
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
    devtools: true,
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  // add event listeners and handlers
  page.on('request', (request) => {
    console.log('>>', request.method(), request.url());
    request.continue();
  });

  page.on('response', (response) => {
    console.log('<<', response.status(), response.url());
  });

  await page.goto('https://danube-web.shop/');

  await page.screenshot({ path: './screenshots/01. requestInterception.png' });

  await browser.close();
})();
