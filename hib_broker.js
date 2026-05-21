(function bootHybridInterfaceBroker() {
  "use strict";

  if (new URLSearchParams(window.location.search).get("legacy") === "1") {
    console.info("[HIB] Legacy-only mode enabled by ?legacy=1.");
    return;
  }

  const INTENT_MAP = {
    "inventory.query": { namespace: "legacyApp.v1", handler: "legacyQueryAction" },
    "order.create": { namespace: "legacyApp.v1", handler: "legacyOrderAction" }
  };

  const HIB_STATE = {
    shadowRoot: null,
    mountedAt: null
  };

  function resolveNamespace(path) {
    return path.split(".").reduce(function resolve(scope, segment) {
      return scope && scope[segment];
    }, window);
  }

  function getLegacyHandler(intent) {
    const route = INTENT_MAP[intent];

    if (!route) {
      throw new Error("No route registered for intent: " + intent);
    }

    const namespace = resolveNamespace(route.namespace);
    const handler = namespace && namespace[route.handler];

    if (typeof handler !== "function") {
      throw new Error("Legacy handler missing: " + route.namespace + "." + route.handler);
    }

    return handler.bind(namespace);
  }

  function eraseLegacyDom() {
    const legacyApp = document.querySelector("#legacy-app");

    if (!legacyApp) {
      throw new Error("Cannot find #legacy-app target.");
    }

    legacyApp.setAttribute("aria-hidden", "true");
    legacyApp.style.display = "none";
    return legacyApp;
  }

  function mountShadowDom() {
    const host = document.createElement("div");
    host.id = "hib-root";
    host.setAttribute("data-hib-role", "shadow-host");
    document.body.appendChild(host);

    const shadowRoot = host.attachShadow({ mode: "open" });
    HIB_STATE.shadowRoot = shadowRoot;
    HIB_STATE.mountedAt = new Date().toISOString();

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "modern_ui.css";

    const template = document.createElement("template");
    template.innerHTML = window.TrojanUIModernUI.render({
      mountedAt: HIB_STATE.mountedAt,
      routeCount: Object.keys(INTENT_MAP).length
    });

    shadowRoot.appendChild(stylesheet);
    shadowRoot.appendChild(template.content.cloneNode(true));
    return shadowRoot;
  }

  function getIntentValue(shadowRoot, trigger) {
    const targetInput = trigger.getAttribute("data-input-target");

    if (!targetInput) {
      return "";
    }

    const input = shadowRoot.querySelector(targetInput);
    return input ? input.value : "";
  }

  function setStatus(shadowRoot, state, text) {
    const status = shadowRoot.querySelector("#modern-status");

    if (!status) {
      return;
    }

    status.dataset.state = state;
    status.textContent = text;
  }

  function registerIntentProxy(shadowRoot) {
    shadowRoot.addEventListener("click", function handleIntentClick(event) {
      const trigger = event.target.closest("[data-intent]");

      if (!trigger) {
        return;
      }

      const intent = trigger.dataset.intent;
      const value = getIntentValue(shadowRoot, trigger);

      try {
        setStatus(shadowRoot, "pending", "Routing intent to legacy system: " + intent);
        const handler = getLegacyHandler(intent);
        handler(value);
      } catch (error) {
        console.error("[HIB] Intent routing failed", error);
        setStatus(shadowRoot, "error", error.message);
      }
    });
  }

  function registerBackWriting(shadowRoot) {
    window.addEventListener("legacy:response", function handleLegacyResponse(event) {
      const detail = event.detail || {};
      const text = detail.message
        ? "Legacy sync complete: " + detail.message
        : "Legacy sync complete.";

      setStatus(shadowRoot, "success", text);

      const lastIntent = shadowRoot.querySelector("#last-intent");
      const lastValue = shadowRoot.querySelector("#last-value");
      const lastUpdated = shadowRoot.querySelector("#last-updated");

      if (lastIntent) {
        lastIntent.textContent = detail.intent || "unknown";
      }

      if (lastValue) {
        lastValue.textContent = detail.value || "-";
      }

      if (lastUpdated) {
        lastUpdated.textContent = new Date().toLocaleTimeString();
      }
    });
  }

  function assertModernUiAvailable() {
    if (!window.TrojanUIModernUI || typeof window.TrojanUIModernUI.render !== "function") {
      throw new Error("modern_ui.js must be loaded before hib_broker.js.");
    }
  }

  function boot() {
    assertModernUiAvailable();
    eraseLegacyDom();
    const shadowRoot = mountShadowDom();
    registerIntentProxy(shadowRoot);
    registerBackWriting(shadowRoot);
    console.info("[HIB] TrojanUI PoC mounted with Shadow DOM.", {
      intents: Object.keys(INTENT_MAP),
      mountedAt: HIB_STATE.mountedAt
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
