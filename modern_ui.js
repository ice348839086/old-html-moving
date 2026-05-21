(function registerModernUiTemplate() {
  "use strict";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function render(options) {
    const safeMountedAt = escapeHtml(options && options.mountedAt ? options.mountedAt : "pending");
    const safeRouteCount = escapeHtml(options && options.routeCount ? options.routeCount : 0);

    return `
      <main class="trojan-ui" aria-label="Modernized legacy interface">
        <section class="hero-card">
          <p class="eyebrow">Hybrid Interface Broker / Shadow DOM PoC</p>
          <div class="hero-layout">
            <div>
              <h1>TrojanUI Control Surface</h1>
              <p class="lede">
                A modern interface is mounted over the legacy ERP while legacy business logic remains callable underneath.
              </p>
            </div>
            <div class="system-badge" title="The page-level SimSun/brown !important rule cannot cross this boundary.">
              <span class="badge-dot"></span>
              Shadow isolated
            </div>
          </div>
        </section>

        <section class="workspace-grid">
          <article class="action-card">
            <div class="card-heading">
              <span class="card-index">01</span>
              <div>
                <h2>Inventory Query</h2>
                <p>Routes <code>inventory.query</code> into <code>legacyQueryAction</code>.</p>
              </div>
            </div>

            <label class="field-label" for="modern-inventory-input">Material code</label>
            <div class="field-row">
              <input id="modern-inventory-input" value="SKU-MODERN-777" autocomplete="off">
              <button type="button" data-intent="inventory.query" data-input-target="#modern-inventory-input">
                Query Stock
              </button>
            </div>
          </article>

          <article class="action-card">
            <div class="card-heading">
              <span class="card-index">02</span>
              <div>
                <h2>Create Order</h2>
                <p>Routes <code>order.create</code> into <code>legacyOrderAction</code>.</p>
              </div>
            </div>

            <label class="field-label" for="modern-order-input">Order name</label>
            <div class="field-row">
              <input id="modern-order-input" value="Dark Card Emergency Refill" autocomplete="off">
              <button type="button" data-intent="order.create" data-input-target="#modern-order-input">
                Create Order
              </button>
            </div>
          </article>
        </section>

        <section class="telemetry-card">
          <div class="status-line">
            <span class="pulse"></span>
            <strong id="modern-status" data-state="idle">Ready. Waiting for a modern UI intent.</strong>
          </div>

          <dl class="telemetry-grid">
            <div>
              <dt>Mounted at</dt>
              <dd>${safeMountedAt}</dd>
            </div>
            <div>
              <dt>Intent routes</dt>
              <dd>${safeRouteCount}</dd>
            </div>
            <div>
              <dt>Last intent</dt>
              <dd id="last-intent">-</dd>
            </div>
            <div>
              <dt>Last value</dt>
              <dd id="last-value">-</dd>
            </div>
            <div>
              <dt>Last sync</dt>
              <dd id="last-updated">-</dd>
            </div>
          </dl>
        </section>
      </main>
    `;
  }

  window.TrojanUIModernUI = {
    render: render
  };
})();
