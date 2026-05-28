(function () {
  if (window.XSCChatWidgetLoaded) return;
  window.XSCChatWidgetLoaded = true;

  const apiUrl = 'https://openclaw.xinsancheng.cn/api/chat';
  const history = [];

  const widget = document.createElement('div');
  widget.className = 'xsc-chat';
  widget.innerHTML = `
    <button class="xsc-chat-button" type="button" aria-label="打开 AI 客服">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 19.5V17H4a2 2 0 0 1-2-2V6.8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2H9.6L5 19.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M7 10.5h.01M12 10.5h.01M17 10.5h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <span>AI 客服</span>
    </button>
    <section class="xsc-chat-panel" aria-hidden="true" aria-label="成都新三程 AI 客服">
      <div class="xsc-chat-head">
        <div class="xsc-chat-title">
          <span class="xsc-chat-mark"><img src="assets/brand/xinsancheng-logo-mark.png" alt=""></span>
          <div><strong>新三程 AI 客服</strong><small>租车、买车、司机合作都可以先问</small></div>
        </div>
        <button class="xsc-chat-close" type="button" aria-label="关闭">×</button>
      </div>
      <div class="xsc-chat-body">
        <div class="xsc-chat-messages" role="log" aria-live="polite"></div>
        <div class="xsc-chat-prompts">
          <button type="button">120度租金多少？</button>
          <button type="button">司机合作流程</button>
          <button type="button">我想看新车</button>
        </div>
        <form class="xsc-chat-form">
          <textarea name="message" rows="1" placeholder="输入你的问题"></textarea>
          <button type="submit">发送</button>
        </form>
      </div>
    </section>
  `;

  document.body.appendChild(widget);

  const openButton = widget.querySelector('.xsc-chat-button');
  const closeButton = widget.querySelector('.xsc-chat-close');
  const panel = widget.querySelector('.xsc-chat-panel');
  const messages = widget.querySelector('.xsc-chat-messages');
  const form = widget.querySelector('.xsc-chat-form');
  const input = form.querySelector('textarea');
  const submitButton = form.querySelector('button');
  const promptButtons = widget.querySelectorAll('.xsc-chat-prompts button');

  function setOpen(open) {
    widget.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if (open) input.focus();
  }

  function addMessage(text, type) {
    const item = document.createElement('div');
    item.className = `xsc-msg ${type || ''}`.trim();
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  function setLoading(loading) {
    submitButton.disabled = loading;
    input.disabled = loading;
  }

  async function sendMessage(text) {
    const message = text.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';
    input.style.height = '';
    setLoading(true);
    const loading = addMessage('正在帮你查询...', 'loading');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const reply = data.reply || '客服已收到你的问题，可以补充车型、城市和预算，我再继续帮你判断。';
      loading.remove();
      addMessage(reply, 'assistant');
      history.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
      if (history.length > 12) history.splice(0, history.length - 12);
    } catch (error) {
      loading.remove();
      addMessage('客服接口暂时连接不上。你也可以直接电话咨询：13086677171。', 'assistant');
    } finally {
      setLoading(false);
      input.focus();
    }
  }

  openButton.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
  closeButton.addEventListener('click', () => setOpen(false));
  promptButtons.forEach((button) => {
    button.addEventListener('click', () => sendMessage(button.textContent || '咨询车辆方案'));
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 92)}px`;
  });

  addMessage('你好，我是新三程 AI 客服。可以问租赁价格、车型电量、新车销售、二手车、司机合作流程。', 'assistant');
})();
