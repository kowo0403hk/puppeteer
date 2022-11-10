// This example demonstrates asynchronous handlers working together

import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  /*
  This first handler will succeed in calling request.continue because the request interception has never been resolved.
*/

  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // It is not strictly necessary to return a promise, but doing so will allow Puppeteer to await this handler.
    return new Promise((resolve) => {
      setTimeout(() => {
        // Inside, check synchronously to verify that the intercept wasn't handled already.
        // It might have been handled during the 500ms while the other handler awaited an async op of its own.
        if (request.isInterceptResolutionHandled()) return;
        resolve();
        return;
      }, 500);
    });
  });

  page.on('request', async (request) => {
    // The interception has not been handled yet. Control will pass through this guard.
    if (request.isInterceptResolutionHandled()) return;

    // for demo only
    const someLongAsyncOperations = () => {};

    await someLongAsyncOperations();

    // The interception *MIGHT* have been handled by the first handler, we can't be sure.
    // Therefore, we must check again before calling continue() or we risk Puppeteer raising an exception.
    if (request.isInterceptResolutionHandled()) return;

    request.continue();
  });
})();
