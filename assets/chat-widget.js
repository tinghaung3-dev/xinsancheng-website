(function () {
  if (window.XSCContactWidgetLoaded) return;
  window.XSCContactWidgetLoaded = true;

  const chatApi = 'https://openclaw.xinsancheng.cn:8443/api/chat';
  const leadApi = 'https://openclaw.xinsancheng.cn:8443/api/lead';
  const history = [];
  let lastQuestion = '';
  let lastReply = '';

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
          <div><strong>新三程 AI 咨询</strong><small>租车、买车、司机合作，先问 AI 再电话确认</small></div>
        </div>
        <button class="xsc-chat-close" type="button" aria-label="关闭">×</button>
      </div>
      <div class="xsc-chat-body">
        <div class="xsc-chat-messages" role="log" aria-live="polite" aria-label="AI 咨询对话"></div>
        <form class="xsc-chat-form">
          <label class="xsc-chat-input-label" for="xsc-chat-input">输入咨询问题</label>
          <textarea id="xsc-chat-input" rows="2" maxlength="180" placeholder="比如：120度车多少钱？试跑怎么结算？"></textarea>
          <button type="submit">发送</button>
        </form>
        <div class="xsc-chat-actions">
          <a href="tel:13086677171">拨打 13086677171</a>
          <a href="/zuling.html">查看租赁方案</a>
        </div>
        <form class="xsc-lead-form">
          <strong>让销售跟进</strong>
          <div class="xsc-lead-grid">
            <input name="name" maxlength="30" placeholder="称呼">
            <input name="phone" maxlength="11" inputmode="tel" placeholder="手机号">
            <input name="city" maxlength="20" placeholder="用车城市">
            <select name="needType" aria-label="需求类型">
              <option value="租车">租车</option>
              <option value="买车">买车</option>
              <option value="司机合作">司机合作</option>
              <option value="7天试跑">7天试跑</option>
            </select>
          </div>
          <button type="submit">提交线索</button>
          <span class="xsc-lead-status" aria-live="polite"></span>
        </form>
      </div>
    </section>
  `;

  document.body.appendChild(widget);

  const panel = widget.querySelector('.xsc-chat-panel');
  const openButton = widget.querySelector('.xsc-chat-button');
  const closeButton = widget.querySelector('.xsc-chat-close');
  const messages = widget.querySelector('.xsc-chat-messages');
  const form = widget.querySelector('.xsc-chat-form');
  const input = widget.querySelector('#xsc-chat-input');
  const submitButton = form.querySelector('button');
  const leadForm = widget.querySelector('.xsc-lead-form');
  const leadStatus = widget.querySelector('.xsc-lead-status');

  function addMessage(role, text) {
    const item = document.createElement('div');
    item.className = `xsc-chat-message is-${role}`;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  function setBusy(busy) {
    widget.classList.toggle('is-busy', busy);
    input.disabled = busy;
    submitButton.disabled = busy;
    submitButton.textContent = busy ? '思考中' : '发送';
  }

  addMessage('assistant', '你好，我是新三程 AI 咨询助手。可以先问车型价格、押金、7天试跑、二手车或司机合作；合同和库存细节请电话最终确认。');

  function setOpen(open) {
    widget.classList.toggle('is-open', open);
    panel.hidden = !open;
    panel.toggleAttribute('inert', !open);
    if (open) input.focus();
  }

  openButton.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
  closeButton.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || widget.classList.contains('is-busy')) return;

    input.value = '';
    addMessage('user', text);
    const pending = addMessage('assistant', '正在查询新三程知识库...');
    lastQuestion = text;
    setBusy(true);

    try {
      const response = await fetch(chatApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-8) })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const reply = data.reply || '这个问题需要销售确认，建议拨打 13086677171。';
      pending.textContent = reply;
      lastReply = reply;
      history.push({ role: 'user', content: text }, { role: 'assistant', content: reply });
    } catch (error) {
      pending.textContent = 'AI 咨询暂时连不上。你可以直接拨打 13086677171，或稍后再试。';
    } finally {
      setBusy(false);
      input.focus();
    }
  });

  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(leadForm);
    const payload = {
      name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      city: String(data.get('city') || '').trim(),
      needType: String(data.get('needType') || '').trim(),
      message: lastQuestion,
      aiReply: lastReply
    };

    if (!/^1[3-9]\d{9}$/.test(payload.phone)) {
      leadStatus.textContent = '请填写正确手机号';
      return;
    }

    leadStatus.textContent = '正在提交...';
    leadForm.querySelector('button').disabled = true;

    try {
      const response = await fetch(leadApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'submit failed');
      leadStatus.textContent = '已提交，销售会跟进';
      leadForm.reset();
    } catch (error) {
      leadStatus.textContent = '提交失败，请直接拨打电话';
    } finally {
      leadForm.querySelector('button').disabled = false;
    }
  });
})();
