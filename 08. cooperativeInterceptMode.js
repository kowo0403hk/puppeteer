/*
request.abort, request.continue, and request.respond can accept an optional priority to work in Cooperative Intercept Mode. When all handlers are using Cooperative Intercept Mode, Puppeteer guarantees that all intercept handlers will run and be awaited in order of registration. The interception is resolved to the highest-priority resolution.

Here are the rules of Cooperative Intercept Mode:

1. All resolutions must supply a numeric priority argument to abort/continue/respond.
2. If any resolution does not supply a numeric priority, Legacy Mode is active and Cooperative Intercept Mode is inactive.
3. Async handlers finish before intercept resolution is finalized.
4. The highest priority interception resolution "wins", i.e. the interception is ultimately aborted/responded/continued according to which resolution was given the highest priority.
5. In the event of a tie, abort > respond > continue.

For Cooperative Intercept Mode to work, all resolutions must use a priority. In practice, this means you must still test for request.isInterceptResolutionHandled because a handler beyond your control may have called abort/continue/respond without a priority (Legacy Mode).
*/
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
  });

  const page = await browser.newPage();

  page.setRequestInterceptions(true);

  // In this example, Legacy Mode prevails and the request is aborted immediately because at least one handler omits priority when resolving the intercept:
  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // Legacy Mode: intercept is aborted immediately
    request.abort('failed');
  });

  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // Control will never reach this point because the request was already aborted in Legacy Mode

    // Cooperative Intercept Mode: votes for continue at priority 0.
    request.continue({}, 0);
  });

  browser.close();
})();

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
  });

  const page = await browser.newPage();

  page.setRequestInterceptions(true);

  // In this example, Legacy Mode prevails and the request is continued because at least one handler does not specify a priority:
  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    request.abort('failed', 0);
  });

  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;
    // Control reaches this point because the request was cooperatively aborted which postpones resolution.

    // { action: InterceptResolutionAction.Abort, priority: 0 }, because abort @ 0 is the current winning resolution
    console.log(request.interceptResolutionState());

    // Legacy Mode: intercept continues immediately.
    request.continue({});
  });

  page.on('request', (request) => {
    // { action: InterceptResolutionAction.AlreadyHandled }, because continue in Legacy Mode was called
    console.log(request.interceptResolutionState());
  });
})();

// In this example, Cooperative Intercept Mode is active because all handlers specify a priority. continue() wins because it has a higher priority than abort().

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
  });

  const page = await browser.newPage();

  page.setRequestInterceptions(true);

  // Final outcome: cooperative continue() @ 5
  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // Cooperative Intercept Mode: votes to abort at priority 10
    request.abort('failed', 0);
  });
  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // Cooperative Intercept Mode: votes to continue at priority 5
    request.continue(request.continueRequestOverrides(), 5);
  });
  page.on('request', (request) => {
    // { action: InterceptResolutionAction.Continue, priority: 5 }, because continue @ 5 > abort @ 0
    console.log(request.interceptResolutionState());
  });
})();

// In this example, Cooperative Intercept Mode is active because all handlers specify priority. respond() wins because its priority ties with continue(), but respond() beats continue().

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
  });

  const page = await browser.newPage();

  // Final outcome: cooperative respond() @ 15
  page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // Cooperative Intercept Mode: votes to abort at priority 10
    request.abort('failed', 10);
  });
  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // Cooperative Intercept Mode: votes to continue at priority 15
    request.continue(request.continueRequestOverrides(), 15);
  });
  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // Cooperative Intercept Mode: votes to respond at priority 15
    request.respond(request.responseForRequest(), 15);
  });
  page.on('request', (request) => {
    if (request.isInterceptResolutionHandled()) return;

    // Cooperative Intercept Mode: votes to respond at priority 12
    request.respond(request.responseForRequest(), 12);
  });
  page.on('request', (request) => {
    // { action: InterceptResolutionAction.Respond, priority: 15 }, because respond @ 15 > continue @ 15 > respond @ 12 > abort @ 10
    console.log(request.interceptResolutionState());
  });
})();
