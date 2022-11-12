// For finer-grained introspection (see Cooperative Intercept Mode below), you may also call request.interceptResolutionState synchronously before using abort/continue/respond.

import puppeteer, { InterceptResolutionAction } from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
  });

  const page = await browser.newPage();

  /*
  This first handler will succeed in calling request.continue because the request interception has never been resolved.
  */

  page.on('request', (request) => {
    const { action } = request.interceptResolutionState();

    if (action === InterceptResolutionAction.AlreadyHandled) return;

    // It is not strictly necessary to return a promise, but doing so will allow Puppeteer to await this handler.

    return new Promise((resolve) => {
      setTimeout(() => {
        // Inside, check synchronously to verify that the intercept wasn't handled already.
        // It might have been handled during the 500ms while the other handler awaited an async op of its own.
        const { action } = request.interceptResolutionState();

        if (action === InterceptResolutionAction.AlreadyHandled) {
          resolve();
          return;
        }
        request.continue();
      }, 500);
    });
  });

  page.on('request', async (interceptedRequest) => {
    // The interception has not been handled yet. Control will pass through this guard.
    if (
      interceptedRequest.interceptResolutionState().action ===
      InterceptResolutionAction.AlreadyHandled
    )
      return;

    await someLongAsyncOperation();
    // The interception *MIGHT* have been handled by the first handler, we can't be sure.
    // Therefore, we must check again before calling continue() or we risk Puppeteer raising an exception.
    if (
      interceptedRequest.interceptResolutionState().action ===
      InterceptResolutionAction.AlreadyHandled
    )
      return;
    interceptedRequest.continue();
  });
})();
