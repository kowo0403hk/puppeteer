/**By default Puppeteer will raise a Request is already handled! exception if request.abort, request.continue, or request.respond are called after any of them have already been called.

Always assume that an unknown handler may have already called abort/continue/respond. Even if your handler is the only one you registered, 3rd party packages may register their own handlers. It is therefore important to always check the resolution status using request.isInterceptResolutionHandled before calling abort/continue/respond.

Importantly, the intercept resolution may get handled by another listener while your handler is awaiting an asynchronous operation. Therefore, the return value of request.isInterceptResolutionHandled is only safe in a synchronous code block. Always execute request.isInterceptResolutionHandled and abort/continue/respond synchronously together.
*/

import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 250 });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  /*
  This first handler will succeed in calling request.continue because the request interception has never been resolved.
  */
  page.on('request', (interceptedRequest) => {
    if (interceptedRequest.isInterceptResolutionHandled()) return;
    else interceptedRequest.continue();
  });

  /*
  This second handler will return before calling request.abort because request.continue was already called by the first handler.
  */
  page.on('request', (interceptedRequest) => {
    if (interceptedRequest.isInterceptResolutionHandled()) return;
    interceptedRequest.abort();
  });
})();
