(function () {
  if (window.XSCContactWidgetLoaded) return;
  window.XSCContactWidgetLoaded = true;

  const widget = document.createElement('div');
  widget.className = 'xsc-chat';
  widget.innerHTML = `
    <button class="xsc-chat-button" type="button" aria-label="打开在线咨询">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 19.5V17H4a2 2 0 0 1-2-2V6.8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2H9.6L5 19.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M7 10.5h.01M12 10.5h.01M17 10.5h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <span>在线咨询</span>
    </button>
    <section class="xsc-chat-panel" hidden inert aria-label="成都新三程在线咨询">
      <div class="xsc-chat-head">
        <div class="xsc-chat-title">
          <span class="xsc-chat-mark"><img src="assets/brand/xinsancheng-logo-mark.png" width="256" height="256" loading="lazy" decoding="async" alt=""></span>
          <div><strong>新三程在线咨询</strong><small>租车、买车、司机合作，直接电话沟通更快</small></div>
        </div>
        <button class="xsc-chat-close" type="button" aria-label="关闭">×</button>
      </div>
      <div class="xsc-chat-body">
        <p>想了解车型价格、押金、短租试跑、二手车或司机合作流程，建议直接拨打电话。我们会按你的线路、预算和用车时间给方案。</p>
        <div class="xsc-chat-actions">
          <a href="tel:13086677171">拨打 13086677171</a>
          <a href="/zuling.html">查看租赁方案</a>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(widget);

  const panel = widget.querySelector('.xsc-chat-panel');
  const openButton = widget.querySelector('.xsc-chat-button');
  const closeButton = widget.querySelector('.xsc-chat-close');

  function setOpen(open) {
    widget.classList.toggle('is-open', open);
    panel.hidden = !open;
    panel.toggleAttribute('inert', !open);
    if (open) closeButton.focus();
  }

  openButton.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
  closeButton.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
})();
