/**
 * Puppeteer requires request.continue() to be called explicitly or the request will hang. Even if your handler means to take no special action, or 'opt out', request.continue() must still be called.

With the introduction of Cooperative Intercept Mode, two use cases arise for cooperative request continuations: Unopinionated and Opinionated.
 */

/**With the introduction of Cooperative Intercept Mode, two use cases arise for cooperative request continuations: Unopinionated and Opinionated.

The first case (common) is that your handler means to opt out of doing anything special the request. It has no opinion on further action and simply intends to continue by default and/or defer to other handlers that might have an opinion. But in case there are no other handlers, we must call request.continue() to ensure that the request doesn't hang.

We call this an Unopinionated continuation because the intent is to continue the request if nobody else has a better idea. Use request.continue({...}, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY) (or 0) for this type of continuation.

The second case (uncommon) is that your handler actually does have an opinion and means to force continuation by overriding a lower-priority abort() or respond() issued elsewhere. We call this an Opinionated continuation. In these rare cases where you mean to specify an overriding continuation priority, use a custom priority.

To summarize, reason through whether your use of request.continue is just meant to be default/bypass behavior vs falling within the intended use case of your handler. Consider using a custom priority for in-scope use cases, and a default priority otherwise. Be aware that your handler may have both Opinionated and Unopinionated cases.

 */
