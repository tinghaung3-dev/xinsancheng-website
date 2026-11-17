(function () {
  if (window.XSCContactWidgetLoaded) return;
  window.XSCContactWidgetLoaded = true;

  const chatApi = 'https://openclaw.xinsancheng.cn:8443/api/chat';
  const leadApi = 'https://openclaw.xinsancheng.cn:8443/api/lead';
  const history = [];

  // ── 本地兜底知识库：服务器连不上时用，内容与官网保持一致 ──
  const KB = [
    { k: ['多少钱','价格','月租','租金','收费','贵不贵'], a: '120度标准胎6,300元/月起，换750轮胎6,400，换235公制重载胎6,500；132度6,500起；140度标准胎6,800起，换750轮胎7,100，换235公制胎7,200。押金和条款签前逐条讲清。' },
    { k: ['120','140','差多少','哪个划算','怎么选'], a: '120度和140度配置完全一样，都是重载版，只差20度电。同样装235公制重载胎：120度6,500、140度7,200，一个月差700、一年差8,400。跑固定线路选120度更划算，线路不固定或跑远路上140度。' },
    { k: ['押金','退车','退押'], a: '押金金额、抵扣范围和退还时限都写进合同。退车验车由双方共同确认后才结算，不做单方面定损。折旧费怎么算、几个工作日退押金都写在同一份合同里，可以先索取样本回家看。' },
    { k: ['折旧'], a: '折旧费收不收、按什么公式算、有没有上限，都写在合同同一条里，不设"折旧费随便扣"的模糊条款。' },
    { k: ['现车','哪里','地址','看车','在哪个','位置'], a: '成都市新都区斑竹园街道竹园大道789号2栋1层101号。700+台在营、大部分在租、在库现车有限，可到店看车厢、看驾驶室、试驾。导航搜"新三程"。' },
    { k: ['电池','宁德','多少度电'], a: '120度、132度、140度三档，都是宁德时代电池。140度支持双枪快充，20%-80%约18分钟。' },
    { k: ['续航','能跑多远','跑多少公里','一天跑'], a: '140度重载山路实测约220-260公里，平路标载300公里以上；120度同配置约180-220公里。冬天再打七折左右。建议按自己线路先试跑一个月。' },
    { k: ['重载','能拉多重','拉货','载重'], a: '重载版是前3后8+7板簧、865mm加宽双层直通大梁、1710mm宽轮距、750胎、气刹、两档电驱桥。但4米2公告总质量4.495吨，额定载重有限，超吨属于超载——重载版是底盘抗造，不是能合法拉重货。' },
    { k: ['轮胎','750','235','公制胎'], a: '三档轮胎可选：标准胎、750轮胎、235公制重载胎。120度换750加100、换235加200；140度换750加300、换235加400。拉重货跑烂路选235，常规重载750够用。' },
    { k: ['纯租','以租代购','买还是租','反正'], a: '我们98%是纯租赁，客户不用买车、不担车辆残值。也支持以租代售和先跑后转。建议先纯租跑稳，确定长期干再谈转购。' },
    { k: ['保险','出险','免赔'], a: '交强险和商业险由哪方投保、保额多少、出险后免赔谁承担，合同里分开写清，不打包成一句"包含"。停运和备用车也写进合同。' },
    { k: ['备用车','修车','维修'], a: '车辆因质量问题维修超过约定期限，提供备用车或按约定减免租金。这一条很多同行不写，我们写进合同。' },
    { k: ['试跑','短租','先试'], a: '支持短期试跑和长期稳定运营两种方案，租期到店谈。建议先按自己线路跑一个月看电耗再定长租。' },
    { k: ['司机合作','跑车','合作模式','怎么合作'], a: '车租、保险、维修由公司承担，司机出电费和过路费。不承诺保底流水，不硬绑货源。合作前先到公司面谈，把车型、租金、押金、保险、路线、结算讲清楚。' },
    { k: ['保底','包货源','保流水'], a: '我们不做"包货源、保底流水"的承诺——流水取决于自己的线路和跑法，谁也不能替市场保证。成都套路运高发，凡是保底月入的都要当心。' },
    { k: ['平台','货拉拉','运满满'], a: '不硬绑平台，跑哪个平台你自己定。租车跑平台要问清四件事：有没有里程限制、是否强制绑定平台、出险免赔谁承担、提前退租违约金怎么算。' },
    { k: ['车源','来路','是不是中介','二道'], a: '车源以主机厂直供为主，不是中间商倒手。' },
    { k: ['多少台','规模','几台车','多大'], a: '700+台在营，成都、重庆、昆明、贵阳、长沙、西安都有在租车辆。' },
    { k: ['油车','电车','划算','省多少'], a: '电车百公里电费约11-42元，柴油轻卡约84-105元。电车便宜一半到八成，跑得越多省得越多。保养也便宜一半左右。一年跑5万公里以上明显划算。' },
    { k: ['电费','一度电','充电'], a: '百公里大概30度电。谷电0.4元/度算一公里约0.12元，快充1.2元/度算约0.36元，差三倍。能慢充就慢充，快充只做补充。' },
    { k: ['提车','验车','交接'], a: '提车八项检查：外观、轮胎、电池、货厢、灯光、随车工具、证件、仪表。拍照留证，里程和电量进群，后面有争议有据可查。' },
    { k: ['年审','违章','扣分'], a: '年审谁办、费用谁出、违章多久处理、逾期谁担责，合同里明确。到期前我们主动提醒。退车前违章要清零才退押金。' },
    { k: ['售后','服务','找不到人','响应'], a: '一个司机一个专属服务群，上户、保险、维修、理赔、年审、结算各有对应的群，有事群里说不用满世界找人。响应慢的话直接打13086677171。' },
    { k: ['电话','联系','怎么找你们'], a: '电话13086677171。地址：成都市新都区斑竹园街道竹园大道789号2栋1层101号。' },

    { k: ['132'], a: '132度标准胎6,500元/月起，是续航和成本的中间档。比120度多跑一截，比140度每月省300。适合成都周边150-250公里、不常跑山区的。' },
    { k: ['二手'], a: '退役车辆整备后出售，一车一价。车况、电池状态、手续性质都会讲清楚。二手车重点看电池健康度、里程真实性、事故记录、三电质保和营运性质。到新都斑竹园一排看。' },
    { k: ['新车','买新车'], a: '新车采购、上牌、交付都能对接。也可以先纯租跑稳，确定长期干再谈转购。' },
    { k: ['冷藏'], a: '冷藏车租赁需要单独确认车型和月租，具体看吨位和制冷要求，打13086677171问。' },
    { k: ['上户','上牌','办证'], a: '上户上牌有专人跟到出证，资料和流程我们在群里对接，不用你跑。' },
    { k: ['驾照','C照','B照'], a: '4米2轻卡C1可以开。6米8一般要B2，而且多数城市限行。选车先看驾照和进城需求。' },
    { k: ['6米8','大车','多大车'], a: '4米2约20方、C1可开、进城相对自由；6米8约40方、一般要B2、多数城市限行。先按现在的货源选，别为了"以后可能有大单"上大车。' },
    { k: ['多少方','装多少','能装'], a: '4米2仓栅内宽约2.45米，两个标准托盘并排推得进去。只到栏板高度约4-5方，堆到2米约20方，到2.5米约25方。装得多不等于合法载重多，按行驶证核定载质量来。' },
    { k: ['内宽','2.45','托盘'], a: '货厢内宽2.45米，两个1.2×1.0米标准托盘并排刚好。内宽2.2米的放不下两个托盘，只能斜着摆，装货效率差很多。' },
    { k: ['充电桩','哪里充','充电站'], a: '场地可以慢充（谷电最便宜），白天需要补电用公共快充。双枪快充20%-80%约18分钟。电费不含在租金里，司机自己出。' },
    { k: ['质保','保修','三电'], a: '电池、电机、电控的质保一般是5年或20万公里。具体条款和是否跟车走，签约时问清。' },
    { k: ['事故','撞了','出险怎么办'], a: '出事故先保证人安全、报警、拍照留证，然后在服务群里说一声，理赔有人跟。定损、维修、备用车都写进合同。' },
    { k: ['合同','能看合同','条款'], a: '八项条款都公开在官网上（合同条款页）：押金、租金租期、保险、维修责任、停运与备用车、退车验车、折旧费、年审违章。可以先索取样本合同回家看，看不明白可以不签。' },
    { k: ['试驾','能不能试'], a: '可以试驾。车在成都新都斑竹园场地，看车厢、看驾驶室、看底盘都行。电话13086677171预约。' },
    { k: ['导航','怎么走','在哪儿'], a: '导航搜"新三程"或"成都新三程汽车销售有限公司"，地址：成都市新都区斑竹园街道竹园大道789号2栋1层101号。' },
    { k: ['几点','上班时间','营业'], a: '日常8:30-18:30都有人，来之前打个电话13086677171确认，免得白跑。' },
    { k: ['老板','李总','负责人'], a: '具体对接打13086677171，会安排对应的人跟。' },
    { k: ['发票','开票'], a: '开票需求和抬头信息在签约时说明，财务对接处理。' },
    { k: ['异地','外地','跨省'], a: '成都、重庆、昆明、贵阳、长沙、西安都有在租车辆，跨省线路可以谈。外地户口在成都上牌需要居住证明，具体资料问销售。' },
    { k: ['货拉拉','运满满','跑平台'], a: '不硬绑平台，跑哪个你自己定。跑平台要问清四件事：里程限制、是否强制绑定平台、出险免赔谁承担、提前退租违约金。' },
  ];

  function localAnswer(q) {
    const s = String(q || '').replace(/\s/g, '');
    let best = null, score = 0;
    for (const item of KB) {
      let n = 0;
      for (const kw of item.k) if (s.indexOf(kw) >= 0) n++;
      if (n > score) { score = n; best = item; }
    }
    if (best && score > 0) return best.a;
    return '这个问题建议直接问销售最快。电话 13086677171，或者到成都新都斑竹园看现车——700+台在营，月租6,300起。';
  }

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
      const local = localAnswer(text);
      pending.textContent = local;
      lastReply = local;
      history.push({ role: 'user', content: text }, { role: 'assistant', content: local });
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
