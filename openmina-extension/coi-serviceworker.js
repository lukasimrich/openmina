/*! coi-serviceworker v0.1.7 - Guido Zuidhof and contributors, licensed under MIT */
// From: https://github.com/gzuidhof/coi-serviceworker
// Copied from working Angular frontend implementation

let coepCredentialless = false;
if (typeof window === 'undefined') {
  console.log('[COI SW] Service worker starting...');
  self.addEventListener("install", () => {
    console.log('[COI SW] Installing...');
    self.skipWaiting();
  });
  self.addEventListener("activate", (event) => {
    console.log('[COI SW] Activating...');
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener("message", (ev) => {
    if (!ev.data) {
      return;
    } else if (ev.data.type === "deregister") {
      self.registration
        .unregister()
        .then(() => {
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => client.navigate(client.url));
        });
    } else if (ev.data.type === "coepCredentialless") {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener("fetch", function (event) {
    const r = event.request;
    console.log('[COI SW] Intercepting request:', r.url);

    if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
      return;
    }

    const request = (coepCredentialless && r.mode === "no-cors")
      ? new Request(r, {
        credentials: "omit",
      })
      : r;
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }

          const newHeaders = new Headers(response.headers);
          newHeaders.set("Cross-Origin-Embedder-Policy",
            coepCredentialless ? "credentialless" : "require-corp"
          );
          newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

          // Add CSP header to allow WASM compilation (critical for OpenMina)
          newHeaders.set("Content-Security-Policy", "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'");

          console.log('[COI SW] Added headers to response for:', r.url);
          console.log('[COI SW] Headers:', {
            'Cross-Origin-Embedder-Policy': newHeaders.get('Cross-Origin-Embedder-Policy'),
            'Cross-Origin-Opener-Policy': newHeaders.get('Cross-Origin-Opener-Policy'),
            'Content-Security-Policy': newHeaders.get('Content-Security-Policy')
          });

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((e) => console.error('[COI SW] Fetch error:', e))
    );
  });

} else {
  (() => {
    const coi = {
      shouldRegister: () => !window.crossOriginIsolated,
      shouldDeregister: () => false,
      doDeregister: () => {
        const registration = navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.postMessage({ type: "deregister" });
        }
      },
      register: async () => {
        console.log('[COI] Starting service worker registration...');

        if (coi.shouldDeregister()) {
          console.log('[COI] Should deregister, deregistering...');
          coi.doDeregister();
          return;
        }

        if (!coi.shouldRegister()) {
          console.log('[COI] Should not register (already cross-origin isolated)');
          return;
        }

        console.log('[COI] Registering service worker...');
        const registration = await navigator.serviceWorker.register(
          chrome.runtime.getURL("coi-serviceworker.js")
        );

        console.log('[COI] Service worker registered:', registration);

        // If the registration is active, but it's not controlling the page
        if (registration.active && !navigator.serviceWorker.controller) {
          console.log('[COI] Service worker active but not controlling, reloading...');
          window.location.reload();
        }

        registration.addEventListener("updatefound", () => {
          console.log('[COI] Service worker update found');
          registration.installing.addEventListener("statechange", () => {
            console.log('[COI] Service worker state changed:', registration.installing.state);
            if (registration.installing.state === "activated") {
              console.log('[COI] Service worker activated, reloading...');
              window.location.reload();
            }
          });
        });

        // Send coepCredentialless setting to service worker
        const coepCredentialless = !window.chrome || !window.chrome.runtime;
        console.log('[COI] Sending coepCredentialless setting:', coepCredentialless);
        registration.active?.postMessage({
          type: "coepCredentialless",
          value: coepCredentialless,
        });
      },
    };

    // If we're already coi: do nothing. Perhaps it's due to this script doing its job, or COOP/COEP are
    // already set from the origin server. Also if the browser has no notion of crossOriginIsolated, just give up here.
    if (window.crossOriginIsolated !== false || !coi.shouldRegister()) return;

    if (!window.isSecureContext) {
      !coi.quiet && console.log("COOP/COEP Service Worker not registered, a secure context is required.");
      return;
    }

    // In some environments (e.g. Firefox private mode) this won't be available
    if (!window.navigator.serviceWorker) {
      !coi.quiet && console.error("COOP/COEP Service Worker not registered, perhaps due to private mode.");
      return;
    }

    coi.register();
  })();
}
