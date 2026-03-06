/**
 * Morgan Marketing OS - AI Agent v2.0
 * 外贸全流程 AI 智囊团
 */
const AgentEngine = {
    activeAgentId: 'default',
    _dropdownListener: null,

    moduleAgentMap: {
        'dashboard':'default','signals':'trend_researcher','competitor-watch':'trend_researcher',
        'social-matrix':'social_media_strategist','email-templates':'content_creator',
        'weekly-plan':'content_creator','ad-doctor':'growth_hacker','budget':'sales_analyst',
        'customer-pipeline':'sales_analyst','rfq-decoder':'rfq_specialist',
        'customer-deep-dive':'sales_analyst','price-calculator':'rfq_specialist',
        'exhibition':'growth_hacker','seo-keywords':'content_creator',
    },

    personas: {
        default: {
            id:'default', name:'🤖 通用助手', shortName:'通用', color:'#6366f1', icon:'🤖',
            description:'外贸全流程通用型 AI 参谋', modules:['所有模块'],
            systemPrompt:'# 角色：外贸营销全能参谋\n\n你是 Morgan Marketing OS 的内置 AI 参谋，一位拥有 15 年经验的外贸营销专家。\n\n## 外贸核心知识体系\n你精通 B2B 国际贸易全链路：\n- **获客**: Google Ads / SEO / 社媒引流 / 展会 / B2B 平台\n- **询盘**: 询盘解码 / 客户背调 / 需求分析 / 报价策略\n- **成交**: PI 制作 / 付款方式 (T/T, L/C, D/P) / Incoterms\n- **交付**: 生产跟单 / 验货 / 报关报检 / 物流\n- **维护**: 售后跟进 / 客户分层 / 复购策略\n\n## 沟通规则\n1. 所有回复使用**简体中文**\n2. 回复简洁、专业、可直接落地执行\n3. 涉及金额时注明币种\n4. 涉及贸易术语时使用标准缩写并附带解释'
        },
        trend_researcher: {
            id:'trend_researcher', name:'🔍 市场情报官', shortName:'情报', color:'#0ea5e9', icon:'🔍',
            description:'行业趋势·竞品监控·政策预警', modules:['战略信号哨站','竞对情报局'],
            systemPrompt:'# 角色：外贸市场情报官\n\n你是一位深耕国际贸易的市场情报分析师。\n\n## 核心监控维度\n- **行业动态**: 目标市场供需变化、新技术应用、行业标准更新\n- **政策法规**: 关税调整(反倾销税)、进出口管制、认证要求(CE/FDA/UL)\n- **竞品动作**: 竞争对手新品、价格策略、市场扩张\n- **汇率与物流**: 汇率波动、海运费走势、港口拥堵\n- **客户端信号**: 采购周期变化、供应商替换信号\n\n## 分析框架\n- **影响等级**: 🔴 紧急/🟡 关注/🟢 储备\n- **置信度**: 高/中/低 (附信息源)\n- **影响链**: A → B → C 连锁反应推导\n- **行动窗口**: 需要在多少天内响应\n- **建议动作**: 具体可执行的下一步\n\n所有回复使用简体中文'
        },
        content_creator: {
            id:'content_creator', name:'✍️ 内容军师', shortName:'内容', color:'#8b5cf6', icon:'✍️',
            description:'开发信·社媒文案·产品描述', modules:['邮件模板库','内容日历'],
            systemPrompt:'# 角色：外贸内容军师\n\n你是专精于 B2B 外贸场景的内容策略专家。\n\n## 核心创作场景\n- **开发信**: 首封触达信(CTR>25%,<150字) / 跟进序列(Day3/7/14/30)\n- **LinkedIn**: 个人品牌帖 / 行业洞察帖 / 互动引导帖\n- **产品描述**: B2B 平台标题优化 / 详情页卖点提炼 / 关键词嵌入\n- **展会物料**: 易拉宝文案 / 名片话术 / 展会邀请函\n\n## 创作原则\n- **Hook 法则**: 标题/首句3秒抓住注意力\n- **AIDA 结构**: Attention → Interest → Desire → Action\n- **本地化意识**: 考虑目标市场文化差异\n- **CTA 必备**: 每段内容都有行动号召\n\n## 输出格式\n- 至少提供 2 个风格变体\n- 标注适合的平台和最佳发布时间\n- 所有回复使用简体中文'
        },
        growth_hacker: {
            id:'growth_hacker', name:'🚀 获客增长官', shortName:'获客', color:'#f43f5e', icon:'🚀',
            description:'流量获取·广告投放·展会获客', modules:['广告诊断','展会作战'],
            systemPrompt:'# 角色：外贸获客增长官\n\n你是专精于外贸 B2B 获客的增长战略家。\n\n## 核心获客渠道\n- **Google Ads**: 搜索广告/展示广告/PMAX, 外贸CPC基准$1.5-$5\n- **SEO**: 产品页+行业长尾词+多语种站点\n- **B2B 平台**: 阿里国际站P4P / MIC推广\n- **社媒引流**: LinkedIn InMail + Facebook 行业群组\n- **展会**: 展前邀约→展中快速筛选→展后48h黄金跟进\n\n## 获客漏斗健康指标\n| 阶段 | 指标 | 健康值 |\n|------|------|--------|\n| 曝光→点击 | CTR | > 2% |\n| 点击→询盘 | 转化率 | > 3% |\n| 询盘→报价 | 响应率 | > 80%(24h内) |\n| 报价→样品 | 推进率 | > 20% |\n| 样品→订单 | 成交率 | > 30% |\n\n所有回复使用简体中文'
        },
        social_media_strategist: {
            id:'social_media_strategist', name:'📱 社媒操盘手', shortName:'社媒', color:'#0a66c2', icon:'📱',
            description:'LinkedIn·Facebook·Instagram运营', modules:['社媒矩阵'],
            systemPrompt:'# 角色：外贸社媒操盘手\n\n你是专精于外贸B2B社交媒体运营的操盘手。\n\n## LinkedIn 策略\n- **内容金字塔**: 40%行业洞察 / 30%幕后故事 / 20%产品价值 / 10%互动引导\n- **发帖节奏**: 周二-四 上午 8-10 点(按目标市场时区)\n- **互动策略**: 每天评论10个目标客户的帖子\n- **帖子结构**: 钩子句→故事→洞察→CTA\n\n## 社交销售漏斗\n关注→互动(评论/点赞)→建立联系→私聊破冰→转询盘\n\n## 输出格式\n- 帖子内容可直接复制发布\n- 附带话题标签(3-5个)\n- 标注最佳发布时间\n- 所有回复使用简体中文'
        },
        sales_analyst: {
            id:'sales_analyst', name:'📊 销售参谋', shortName:'销售', color:'#10b981', icon:'📊',
            description:'客户管理·业绩分析·管线诊断', modules:['客户管道(CRM)','资金看板'],
            systemPrompt:'# 角色：外贸销售参谋\n\n你是精通外贸销售全流程的战略参谋。\n\n## 询盘分级(24h内完成)\n- A级(热询盘): 明确品名+数量+交期→2h内报价\n- B级(温询盘): 有意向但不具体→引导需求确认\n- C级(冷询盘): 群发/比价→标准报价+公司简介\n- D级(无效): 同行套价→礼貌拒绝\n\n## 关键销售指标\n| 指标 | 健康范围 | 警戒线 |\n|------|----------|--------|\n| 询盘响应时间 | <4h | >24h ⚠️ |\n| 报价转化率 | >15% | <5% ⚠️ |\n| 客户复购率 | >30% | <10% ⚠️ |\n| 前5客户占比 | <40% | >60% ⚠️ |\n\n## 分析风格\n- 先给一句话结论再展开\n- 异常数据用 ⚠️ 标记\n- 每个分析附带可落地的行动建议\n- 所有回复使用简体中文'
        },
        rfq_specialist: {
            id:'rfq_specialist', name:'🧩 询盘军师', shortName:'询盘', color:'#f59e0b', icon:'🧩',
            description:'询盘解码·报价策略·谈判话术', modules:['询盘流水线(RFQ)','报价计算器'],
            systemPrompt:'# 角色：外贸询盘军师\n\n你是专精于外贸询盘处理和商务谈判的资深顾问。\n\n## 询盘解码\n1. **买家画像推断**: 从邮件签名/域名/措辞判断\n   - 终端用户: 量小利润高，决策快\n   - 批发商: 量大压价，关注持续供货\n   - 进口商: 专业度高，关注认证合规\n   - 电商卖家: 小批量多SKU\n\n2. **需求真实度评估**:\n   - ✅ 真实: 指定型号/数量/交期/目的港\n   - ⚠️ 可疑: 只要目录/无具体参数\n   - ❌ 无效: 免费样品/同行套价\n\n## 报价策略\n- **新客首单**: 让利5-8%，重在建立关系\n- **竞品替换**: 强调差异化，价格持平或略低\n- **老客复购**: 维持价格+增值服务\n- FOB = 工厂价÷(1-退税率)×汇率+国内费用+利润\n- CIF = FOB+海运费+保险费\n\n所有回复使用简体中文'
        }
    },

    init: function() {
        var saved = localStorage.getItem('tds_active_agent');
        if (saved && this.personas[saved]) this.activeAgentId = saved;

        window.getActiveAgentPrompt = this.getActiveAgentPrompt.bind(this);
        window.setActiveAgent = this.setActiveAgent.bind(this);
        window.getActiveAgentId = function() { return AgentEngine.activeAgentId; };
        window.getAgentPersonas = function() { return AgentEngine.personas; };
        window.getRecommendedAgent = this.getRecommendedAgent.bind(this);

        this.renderSelector();
        this._hookTabSwitch();
        this.updateStatusBar();

        console.log('🎭 AgentEngine v2.0 | Active: ' + this.personas[this.activeAgentId].name);
    },

    getActiveAgentPrompt: function() {
        return this.personas[this.activeAgentId] ? this.personas[this.activeAgentId].systemPrompt : this.personas.default.systemPrompt;
    },

    getRecommendedAgent: function(tabId) {
        return this.moduleAgentMap[tabId] || 'default';
    },

    setActiveAgent: function(agentId) {
        if (!this.personas[agentId]) agentId = 'default';
        this.activeAgentId = agentId;
        localStorage.setItem('tds_active_agent', agentId);
        this.renderSelector();
        this.updateStatusBar();
        var agent = this.personas[agentId];
        if (window.showToast) window.showToast('🎭 已切换为「' + agent.name + '」模式', 'success');
        var dropdown = document.getElementById('agent-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
    },

    _hookTabSwitch: function() {
        var origSwitch = window.switchTab;
        if (!origSwitch) return;
        var self = this;
        window.switchTab = function(tabId) {
            origSwitch(tabId);
            var recommended = self.moduleAgentMap[tabId];
            if (recommended && recommended !== self.activeAgentId && recommended !== 'default') {
                var autoOn = localStorage.getItem('tds_agent_auto_switch') === 'true';
                if (autoOn) {
                    self.setActiveAgent(recommended);
                } else {
                    var agent = self.personas[recommended];
                    if (agent) self._showRecommendation(agent, tabId);
                }
            }
            self.renderSelector(tabId);
        };
    },

    _showRecommendation: function(agent, tabId) {
        var key = '_agent_rec_' + tabId;
        var last = parseInt(sessionStorage.getItem(key) || '0');
        if (Date.now() - last < 300000) return;
        sessionStorage.setItem(key, Date.now().toString());

        var bar = document.createElement('div');
        bar.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] px-4 py-2.5 rounded-xl bg-slate-800/95 border border-blue-500/30 shadow-2xl backdrop-blur flex items-center gap-3 text-sm transition-all transform translate-y-4 opacity-0';
        bar.innerHTML = '<span class="text-lg">' + agent.icon + '</span>'
            + '<span class="text-gray-300">建议切换到 <b class="text-white">' + agent.name + '</b> 获得更专业的分析</span>'
            + '<button onclick="setActiveAgent(\'' + agent.id + '\');this.closest(\'.fixed\').remove()" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-bold transition">立即切换</button>'
            + '<button onclick="this.closest(\'.fixed\').remove()" class="text-gray-500 hover:text-white text-lg leading-none">&times;</button>';
        document.body.appendChild(bar);
        requestAnimationFrame(function() { bar.classList.remove('translate-y-4', 'opacity-0'); });
        setTimeout(function() { bar.classList.add('translate-y-4', 'opacity-0'); setTimeout(function() { bar.remove(); }, 300); }, 8000);
    },

    renderSelector: function(currentTab) {
        var container = document.getElementById('agent-selector-container');
        if (!container) return;
        var active = this.personas[this.activeAgentId];
        var recommendedId = currentTab ? this.moduleAgentMap[currentTab] : null;
        var self = this;

        var options = Object.values(this.personas).map(function(p) {
            var isActive = p.id === self.activeAgentId;
            var isRec = recommendedId && p.id === recommendedId && !isActive;
            var badge = '';
            if (isActive) badge = '<span class="ml-auto text-[10px] text-blue-300 shrink-0">✓ 激活</span>';
            else if (isRec) badge = '<span class="ml-auto text-[10px] text-amber-400 shrink-0">★ 推荐</span>';
            var cls = isActive ? 'bg-blue-600/20 text-white border border-blue-500/40' : isRec ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5';
            return '<button onclick="setActiveAgent(\'' + p.id + '\')" class="w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center gap-2 ' + cls + '" title="' + p.description + '">'
                + '<span class="shrink-0">' + p.icon + '</span><span class="truncate">' + p.shortName + '</span>'
                + '<span class="text-[9px] text-gray-600 truncate hidden sm:inline">' + p.modules[0] + '</span>' + badge + '</button>';
        }).join('');

        container.innerHTML = '<div class="relative">'
            + '<button id="agent-toggle-btn" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition border border-gray-600/40 hover:border-blue-500/50 bg-slate-800/60 hover:bg-slate-700/50" style="color:' + active.color + '">'
            + '<span>' + active.icon + '</span><span class="truncate text-left flex-1">' + active.shortName + '</span>'
            + '<svg class="w-3 h-3 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></button>'
            + '<div id="agent-dropdown" class="hidden absolute bottom-full left-0 mb-2 w-64 bg-slate-800 border border-gray-700 rounded-xl shadow-2xl z-[100] p-2 flex flex-col gap-1">'
            + '<div class="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-700/50 mb-1">🎭 外贸 AI 智囊团</div>' + options
            + '<div class="px-3 pt-2 pb-1 text-[9px] text-gray-600 border-t border-gray-700/50 mt-1">切换后所有 AI 功能将采用对应角色的专业视角</div></div></div>';

        if (this._dropdownListener) document.removeEventListener('click', this._dropdownListener);
        this._dropdownListener = function(e) {
            var dd = document.getElementById('agent-dropdown');
            var tb = document.getElementById('agent-toggle-btn');
            if (!dd) return;
            if (tb && tb.contains(e.target)) { dd.classList.toggle('hidden'); e.stopPropagation(); }
            else if (!dd.contains(e.target)) dd.classList.add('hidden');
        };
        document.addEventListener('click', this._dropdownListener);
        this.updateStatusBar();
    },

    updateStatusBar: function() {
        var bar = document.getElementById('agent-status-bar');
        if (!bar) return;
        var agent = this.personas[this.activeAgentId];
        if (!agent) return;
        bar.style.display = 'flex';
        bar.style.borderColor = agent.color + '40';
        var icon = document.getElementById('agent-bar-icon');
        var name = document.getElementById('agent-bar-name');
        var desc = document.getElementById('agent-bar-desc');
        if (icon) icon.textContent = agent.icon;
        if (name) { name.textContent = agent.name; name.style.color = agent.color; }
        if (desc) desc.textContent = agent.description;
        var cb = document.getElementById('agent-auto-switch');
        if (cb) cb.checked = localStorage.getItem('tds_agent_auto_switch') === 'true';
    },

    toggleAutoSwitch: function(enabled) {
        localStorage.setItem('tds_agent_auto_switch', enabled ? 'true' : 'false');
        if (window.showToast) window.showToast(enabled ? '🔄 已开启自动匹配' : '🔒 已关闭自动匹配', 'info');
    },

    showInfoPanel: function() {
        var agent = this.personas[this.activeAgentId];
        if (!agent) return;
        var lines = agent.systemPrompt.split('\n');
        var caps = [], inC = false;
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf('核心') !== -1 && (lines[i].indexOf('能力') !== -1 || lines[i].indexOf('监控') !== -1 || lines[i].indexOf('获客') !== -1 || lines[i].indexOf('创作') !== -1)) { inC = true; continue; }
            if (inC && lines[i].indexOf('## ') === 0) break;
            if (inC && lines[i].indexOf('- **') === 0) caps.push(lines[i].replace(/^- \*\*/, '').replace(/\*\*.*$/, '').trim());
        }
        var capHtml = caps.length > 0 ? caps.map(function(c) { return '<span class="px-2 py-0.5 bg-slate-700 rounded text-[10px] text-gray-300">' + c + '</span>'; }).join('') : '';
        var modHtml = agent.modules.map(function(m) { return '<span class="px-2 py-0.5 rounded text-[10px] font-bold border" style="color:' + agent.color + ';border-color:' + agent.color + '40">' + m + '</span>'; }).join('');
        var promptEsc = agent.systemPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        var modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4';
        modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
        modal.innerHTML = '<div class="bg-slate-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">'
            + '<div class="px-6 py-4 border-b border-gray-700/50 flex items-center gap-3"><span class="text-3xl">' + agent.icon + '</span><div><h3 class="text-lg font-bold text-white">' + agent.name + '</h3><p class="text-xs text-gray-400">' + agent.description + '</p></div><button onclick="this.closest(\'.fixed\').remove()" class="ml-auto text-gray-400 hover:text-white text-xl">✕</button></div>'
            + '<div class="px-6 py-4 space-y-4 overflow-y-auto flex-1">'
            + '<div><div class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">适用模块</div><div class="flex flex-wrap gap-1.5">' + modHtml + '</div></div>'
            + '<div><div class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">核心能力</div><div class="flex flex-wrap gap-1.5">' + capHtml + '</div></div>'
            + '<div><div class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">System Prompt</div><pre class="text-[11px] text-gray-400 bg-slate-800 rounded-lg p-3 whitespace-pre-wrap max-h-48 overflow-y-auto">' + promptEsc + '</pre></div></div>'
            + '<div class="px-6 py-3 border-t border-gray-700/50 flex gap-2"><button onclick="AgentEngine.quickTest();this.closest(\'.fixed\').remove()" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold">⚡ 快速测试</button><button onclick="this.closest(\'.fixed\').remove()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm">关闭</button></div></div>';
        document.body.appendChild(modal);
    },

    quickTest: function() {
        var agent = this.personas[this.activeAgentId];
        if (!agent) return;
        var testQ = {
            default:'我是一家做户外家具的工厂，刚做外贸，建议先从哪些渠道获客？给3条核心建议。',
            trend_researcher:'光伏行业出口有什么新趋势？欧盟碳关税的影响？用影响等级框架分析。',
            content_creator:'写一封给美国户外家具进口商的开发信，优势：铝合金、10年质保、自有工厂。150字内，2个变体。',
            growth_hacker:'户外灯具出口，Google Ads月预算$2000，CPC=$3，月询盘20条，成交2单。诊断漏斗。',
            social_media_strategist:'生成一条LinkedIn帖子："中国工厂如何保证产品质量"，目标欧美采购经理。',
            sales_analyst:'上季度出口$450K，前5客户占比68%，询盘响应22h，报价转化率8%。用健康指标诊断。',
            rfq_specialist:'询盘：Hi, need 500pcs aluminum garden chairs, FOB price, delivery time, MOQ. From Germany. 解码+报价策略。'
        };
        var question = testQ[this.activeAgentId] || testQ.default;
        var panel = document.createElement('div');
        panel.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4';
        panel.onclick = function(e) { if (e.target === panel) panel.remove(); };
        panel.innerHTML = '<div class="bg-slate-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">'
            + '<div class="px-6 py-4 border-b border-gray-700/50 flex items-center gap-3"><span class="text-2xl">' + agent.icon + '</span><div><h3 class="text-base font-bold text-white">⚡ 快速测试「' + agent.name + '」</h3><p class="text-[10px] text-gray-500">展示该 Agent 的专业回复风格</p></div><button onclick="this.closest(\'.fixed\').remove()" class="ml-auto text-gray-400 hover:text-white text-xl">✕</button></div>'
            + '<div class="px-6 py-4 space-y-3 overflow-y-auto flex-1">'
            + '<div><div class="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">📝 示范问题</div><div class="p-3 bg-slate-800 rounded-lg text-sm text-gray-300 border border-gray-700/50">' + question + '</div></div>'
            + '<div><div class="text-[10px] uppercase tracking-wider font-bold mb-1.5" style="color:' + agent.color + '">💬 ' + agent.name + ' 的回复</div>'
            + '<div id="agent-test-result" class="p-4 bg-slate-800 rounded-lg text-sm text-gray-300 border min-h-[120px]" style="border-color:' + agent.color + '30"><div class="flex items-center gap-2 text-gray-500 animate-pulse"><span class="text-lg">' + agent.icon + '</span><span>正在以「' + agent.shortName + '」角色思考...</span></div></div></div></div>'
            + '<div class="px-6 py-3 border-t border-gray-700/50"><button onclick="this.closest(\'.fixed\').remove()" class="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm">关闭</button></div></div>';
        document.body.appendChild(panel);
        this._runQuickTest(question);
    },

    _runQuickTest: async function(question) {
        var resultDiv = document.getElementById('agent-test-result');
        if (!resultDiv) return;
        try {
            if (typeof window.callAIAPI === 'function') {
                var response = await window.callAIAPI(question);
                if (response) {
                    var html = response.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\n/g, '<br>');
                    resultDiv.innerHTML = '<div class="leading-relaxed">' + html + '</div>';
                } else {
                    resultDiv.innerHTML = '<div class="text-yellow-400">⚠️ 需要先在设置中配置 AI API Key</div>';
                }
            } else {
                resultDiv.innerHTML = '<div class="text-yellow-400">⚠️ AI API 未就绪</div>';
            }
        } catch (err) {
            resultDiv.innerHTML = '<div class="text-red-400">❌ 测试失败: ' + err.message + '</div>';
        }
    }
};

document.addEventListener('DOMContentLoaded', function() { AgentEngine.init(); });
