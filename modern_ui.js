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
    const safeMountedAt = escapeHtml(options && options.mountedAt ? options.mountedAt : "等待挂载");
    const safeRouteCount = escapeHtml(options && options.routeCount ? options.routeCount : 0);

    return `
      <main class="trojan-ui" aria-label="现代化旧系统界面">
        <section class="hero-card">
          <p class="eyebrow">混合界面中转器 / 影子 DOM 概念验证</p>
          <div class="hero-layout">
            <div>
              <h1>TrojanUI 接管界面</h1>
              <p class="lede">
                现代界面覆盖在旧 ERP 之上，底层旧业务函数仍然可以被安全调用。
              </p>
            </div>
            <div class="system-badge" title="页面级宋体和棕色 !important 规则无法穿透这个边界。">
              <span class="badge-dot"></span>
              样式已隔离
            </div>
          </div>
        </section>

        <section class="workspace-grid">
          <article class="action-card">
            <div class="card-heading">
              <span class="card-index">01</span>
              <div>
                <h2>库存查询</h2>
                <p>把 <code>inventory.query</code> 路由到 <code>legacyQueryAction</code>。</p>
              </div>
            </div>

            <label class="field-label" for="modern-inventory-input">物料编码</label>
            <div class="field-row">
              <input id="modern-inventory-input" value="SKU-MODERN-777" autocomplete="off">
              <button type="button" data-intent="inventory.query" data-input-target="#modern-inventory-input">
                查询库存
              </button>
            </div>
          </article>

          <article class="action-card">
            <div class="card-heading">
              <span class="card-index">02</span>
              <div>
                <h2>创建订单</h2>
                <p>把 <code>order.create</code> 路由到 <code>legacyOrderAction</code>。</p>
              </div>
            </div>

            <label class="field-label" for="modern-order-input">订单名称</label>
            <div class="field-row">
              <input id="modern-order-input" value="深色卡片补货订单" autocomplete="off">
              <button type="button" data-intent="order.create" data-input-target="#modern-order-input">
                创建订单
              </button>
            </div>
          </article>
        </section>

        <section class="telemetry-card">
          <div class="status-line">
            <span class="pulse"></span>
            <strong id="modern-status" data-state="idle">已就绪，等待现代界面发起意图。</strong>
          </div>

          <dl class="telemetry-grid">
            <div>
              <dt>挂载时间</dt>
              <dd>${safeMountedAt}</dd>
            </div>
            <div>
              <dt>意图路由数</dt>
              <dd>${safeRouteCount}</dd>
            </div>
            <div>
              <dt>最近意图</dt>
              <dd id="last-intent">-</dd>
            </div>
            <div>
              <dt>最近输入值</dt>
              <dd id="last-value">-</dd>
            </div>
            <div>
              <dt>最近同步</dt>
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
