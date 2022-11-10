import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://developers.google.com/web/');

  await page.type('.devsite-search-field', 'Headless Chrome');

  // wait for the overlay to appear, then click search for all results
  const allResultsSelector = '.devsite-suggest-all-results';
  await page.waitForSelector(allResultsSelector);
  await page.click(allResultsSelector);

  // wait for the result page to loadnd display the results
  const resultSelector = '.gsc-results .gs-title';
  await page.waitForSelector(resultSelector);

  // extract the results from the page
  const links = await page.evaluate((resultsSelector) => {
    return [...document.querySelectorAll(resultsSelector)].map((anchor) => {
      const title = anchor.textContent.split('|')[0].trim();
      return `${title} - ${anchor.href}`;
    });
  }, resultSelector);

  // print all
  console.log(links.join('\n'));

  await browser.close();
})();
