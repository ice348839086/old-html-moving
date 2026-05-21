(function bootHybridInterfaceBroker() {
  "use strict";

  if (new URLSearchParams(window.location.search).get("legacy") === "1") {
    console.info("[HIB] 已通过 ?legacy=1 启用旧系统原始界面模式。");
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
      throw new Error("没有为该意图注册路由：" + intent);
    }

    const namespace = resolveNamespace(route.namespace);
    const handler = namespace && namespace[route.handler];

    if (typeof handler !== "function") {
      throw new Error("找不到旧系统处理函数：" + route.namespace + "." + route.handler);
    }

    return handler.bind(namespace);
  }

  function eraseLegacyDom() {
    const legacyApp = document.querySelector("#legacy-app");

    if (!legacyApp) {
      throw new Error("找不到 #legacy-app 目标容器。");
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
        setStatus(shadowRoot, "pending", "正在把意图路由到旧系统：" + intent);
        const handler = getLegacyHandler(intent);
        handler(value);
      } catch (error) {
        console.error("[HIB] 意图路由失败", error);
        setStatus(shadowRoot, "error", error.message);
      }
    });
  }

  function registerBackWriting(shadowRoot) {
    window.addEventListener("legacy:response", function handleLegacyResponse(event) {
      const detail = event.detail || {};
      const text = detail.message
        ? "旧系统同步完成：" + detail.message
        : "旧系统同步完成。";

      setStatus(shadowRoot, "success", text);

      const lastIntent = shadowRoot.querySelector("#last-intent");
      const lastValue = shadowRoot.querySelector("#last-value");
      const lastUpdated = shadowRoot.querySelector("#last-updated");

      if (lastIntent) {
        lastIntent.textContent = detail.intent || "未知";
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
      throw new Error("必须先加载 modern_ui.js，再加载 hib_broker.js。");
    }
  }

  function boot() {
    assertModernUiAvailable();
    eraseLegacyDom();
    const shadowRoot = mountShadowDom();
    registerIntentProxy(shadowRoot);
    registerBackWriting(shadowRoot);
    console.info("[HIB] TrojanUI 概念验证已通过 Shadow DOM 挂载。", {
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
