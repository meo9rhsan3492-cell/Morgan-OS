/**
 * Morgan Marketing OS v19.0 - Customer Pipeline (Kanban CRM)
 * Stages: 新询盘(new) → 已报价(quoted) → 样品(sample) → 谈判(negotiation) → 成交(won) / 丢单(lost)
 */

const PIPELINE_KEY = 'tds_pipeline_customers';
const STAGES = [
    { id: 'new', label: '📥 新询盘', color: 'blue', bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-500/30' },
    { id: 'quoted', label: '💰 已报价', color: 'yellow', bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    { id: 'sample', label: '📦 样品阶段', color: 'purple', bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-500/30' },
    { id: 'negotiation', label: '🤝 谈判中', color: 'orange', bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-500/30' },
    { id: 'won', label: '🏆 成交', color: 'green', bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-500/30' },
    { id: 'lost', label: '❌ 丢单', color: 'red', bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-500/30' }
];

let pipelineSearchTerm = '';

function getPipelineCustomers() {
    return JSON.parse(localStorage.getItem(PIPELINE_KEY) || '[]');
}

function savePipelineCustomers(customers) {
    localStorage.setItem(PIPELINE_KEY, JSON.stringify(customers));
}

// ========================================
// Pipeline Analytics
// ========================================
function calcPipelineAnalytics(customers) {
    const now = new Date();
    const active = customers.filter(c => c.stage !== 'won' && c.stage !== 'lost');
    const won = customers.filter(c => c.stage === 'won');
    const lost = customers.filter(c => c.stage === 'lost');
    const overdue = active.filter(c => c.nextFollowUp && new Date(c.nextFollowUp) < now);

    // Estimate pipeline value
    let totalValue = 0;
    customers.forEach(c => {
        if (c.quoteData?.cifUSD) totalValue += parseFloat(c.quoteData.cifUSD) || 0;
        else if (c.quoteData?.fobUSD) totalValue += parseFloat(c.quoteData.fobUSD) || 0;
    });

    // Conversion rate
    const closed = won.length + lost.length;
    const conversionRate = closed > 0 ? Math.round((won.length / closed) * 100) : 0;

    // Avg days per stage
    const avgDaysInPipeline = active.length > 0
        ? Math.round(active.reduce((sum, c) => sum + Math.floor((now - new Date(c.createdAt)) / 86400000), 0) / active.length)
        : 0;

    return { total: customers.length, active: active.length, won: won.length, lost: lost.length, overdue: overdue.length, totalValue, conversionRate, avgDaysInPipeline };
}

// ========================================
// Render Full Pipeline View
// ========================================
function renderPipeline() {
    const container = document.getElementById('pipeline-board');
    if (!container) return;

    const allCustomers = getPipelineCustomers();
    const now = new Date();

    // Filter by search
    const customers = pipelineSearchTerm
        ? allCustomers.filter(c => {
            const term = pipelineSearchTerm.toLowerCase();
            return (c.company || '').toLowerCase().includes(term)
                || (c.name || '').toLowerCase().includes(term)
                || (c.email || '').toLowerCase().includes(term)
                || (c.product || '').toLowerCase().includes(term)
                || (c.country || '').toLowerCase().includes(term);
        })
        : allCustomers;

    // Analytics
    const stats = calcPipelineAnalytics(allCustomers);
    const statsBar = document.getElementById('pipeline-stats');
    if (statsBar) {
        statsBar.innerHTML = `
        <!-- Search Bar -->
        <div class="mb-4">
            <input type="text" id="pipeline-search-input" value="${pipelineSearchTerm}"
                oninput="pipelineSearchTerm = this.value; renderPipeline();"
                class="w-full md:w-80 px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
                placeholder="🔍 搜索客户（公司名/姓名/产品/国家）...">
        </div>
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
            <div class="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 text-center">
                <div class="text-[10px] text-gray-500 uppercase mb-1">总客户</div>
                <div class="text-xl font-black text-white">${stats.total}</div>
            </div>
            <div class="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 text-center">
                <div class="text-[10px] text-gray-500 uppercase mb-1">活跃中</div>
                <div class="text-xl font-black text-blue-400">${stats.active}</div>
            </div>
            <div class="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 text-center">
                <div class="text-[10px] text-gray-500 uppercase mb-1">已成交</div>
                <div class="text-xl font-black text-green-400">${stats.won}</div>
            </div>
            <div class="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 text-center ${stats.overdue > 0 ? 'border-red-500/50 animate-pulse' : ''}">
                <div class="text-[10px] text-gray-500 uppercase mb-1">待跟进</div>
                <div class="text-xl font-black text-red-400">${stats.overdue}</div>
            </div>
            <div class="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 text-center">
                <div class="text-[10px] text-gray-500 uppercase mb-1">转化率</div>
                <div class="text-xl font-black text-purple-400">${stats.conversionRate}%</div>
            </div>
            <div class="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 text-center">
                <div class="text-[10px] text-gray-500 uppercase mb-1">管道价值</div>
                <div class="text-lg font-black text-emerald-400">$${stats.totalValue > 1000 ? (stats.totalValue / 1000).toFixed(1) + 'K' : stats.totalValue.toFixed(0)}</div>
            </div>
            <div class="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 text-center">
                <div class="text-[10px] text-gray-500 uppercase mb-1">平均天数</div>
                <div class="text-xl font-black text-orange-400">${stats.avgDaysInPipeline}d</div>
            </div>
        </div>`;
    }

    // Stage funnel bar (visual conversion funnel)
    const activeStages = STAGES.filter(s => s.id !== 'won' && s.id !== 'lost');
    const closedStages = STAGES.filter(s => s.id === 'won' || s.id === 'lost');

    const funnelHTML = `
    <div class="flex items-center gap-1 mb-4 text-[10px] text-gray-500">
        ${activeStages.map((stage, i) => {
        const count = customers.filter(c => c.stage === stage.id).length;
        return `
            <div class="flex items-center gap-1">
                <span class="${stage.text} font-bold">${count}</span>
                <span>${stage.label.split(' ')[1] || stage.label}</span>
                ${i < activeStages.length - 1 ? '<span class="text-gray-600 mx-1">→</span>' : ''}
            </div>`;
    }).join('')}
        <span class="text-gray-600 mx-1">→</span>
        <span class="text-green-400 font-bold">${customers.filter(c => c.stage === 'won').length}</span>
        <span>成交</span>
    </div>`;

    // Render Kanban columns
    container.innerHTML = `
    ${funnelHTML}
    <div class="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory" style="min-height: 480px;">
        ${activeStages.map(stage => {
        const stageCustomers = customers.filter(c => c.stage === stage.id);
        return `
            <div class="flex-shrink-0 w-64 md:w-72 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col snap-center">
                <div class="p-3 border-b border-slate-700/50 flex items-center justify-between">
                    <div class="font-bold text-sm ${stage.text}">${stage.label}</div>
                    <span class="text-xs ${stage.bg} ${stage.text} px-2 py-0.5 rounded-full font-bold">${stageCustomers.length}</span>
                </div>
                <div class="flex-1 p-2 space-y-2 overflow-y-auto" style="max-height: 420px;">
                    ${stageCustomers.length === 0
                ? '<div class="text-center text-gray-600 text-xs py-8">暂无客户</div>'
                : stageCustomers.map(c => renderCustomerCard(c, now)).join('')}
                </div>
            </div>`;
    }).join('')}
    </div>

    <!-- Closed deals section -->
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        ${closedStages.map(stage => {
        const stageCustomers = customers.filter(c => c.stage === stage.id);
        return `
            <div class="bg-slate-800/30 rounded-xl border ${stage.border} p-3">
                <div class="font-bold text-sm ${stage.text} mb-2">${stage.label} (${stageCustomers.length})</div>
                <div class="space-y-1 max-h-32 overflow-y-auto">
                    ${stageCustomers.length === 0 ? '<div class="text-xs text-gray-600">空</div>' : stageCustomers.slice(0, 8).map(c => `
                        <div class="flex items-center justify-between text-xs p-1.5 rounded bg-black/20 cursor-pointer hover:bg-black/30 transition" onclick="openCustomerDetail(${c.id})">
                            <span class="text-gray-300">${c.company || c.name}</span>
                            <span class="text-gray-500">${c.product?.substring(0, 15) || ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }).join('')}
    </div>`;
}

function renderCustomerCard(customer, now) {
    const isOverdue = customer.nextFollowUp && new Date(customer.nextFollowUp) < now && customer.stage !== 'won' && customer.stage !== 'lost';
    const daysSinceContact = customer.lastContact ? Math.floor((now - new Date(customer.lastContact)) / 86400000) : 0;

    // Score color (hardcoded classes)
    let scoreColorClasses = 'bg-red-900/40 border-red-500/30 text-red-400';
    if (customer.score >= 80) scoreColorClasses = 'bg-green-900/40 border-green-500/30 text-green-400';
    else if (customer.score >= 60) scoreColorClasses = 'bg-yellow-900/40 border-yellow-500/30 text-yellow-400';

    return `
    <div class="bg-slate-900/80 rounded-lg p-3 border ${isOverdue ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-slate-600/30'} hover:border-blue-500/50 transition cursor-pointer group"
         onclick="openCustomerDetail(${customer.id})">
        <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0 mr-2">
                <div class="font-bold text-white text-sm truncate group-hover:text-blue-400 transition">${customer.company || customer.name}</div>
                <div class="text-[10px] text-gray-500 truncate">${customer.country || ''} ${customer.email ? '· ' + customer.email : ''}</div>
            </div>
            <div class="w-7 h-7 rounded-full ${scoreColorClasses} border flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                ${customer.score || '--'}
            </div>
        </div>
        <div class="text-xs text-yellow-400/80 truncate mb-2">🏷️ ${customer.product || '未知产品'}</div>
        ${customer.quoteData?.hasQuote ? '<div class="text-[10px] text-green-400 mb-1">💰 已报价 $' + (customer.quoteData.fobUSD || '?') + '</div>' : ''}
        <div class="flex items-center justify-between text-[10px]">
            <span class="text-gray-500">${daysSinceContact}天前联系</span>
            ${isOverdue
            ? '<span class="text-red-400 font-bold animate-pulse">⚠️ 需跟进</span>'
            : customer.nextFollowUp
                ? '<span class="text-gray-600">' + new Date(customer.nextFollowUp).toLocaleDateString() + '</span>'
                : ''}
        </div>
        <!-- Quick Actions (on hover) -->
        <div class="mt-2 pt-2 border-t border-slate-700/50 hidden group-hover:flex gap-1">
            <button onclick="event.stopPropagation(); advanceStage(${customer.id})" class="flex-1 text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded py-1 transition">推进 →</button>
            <button onclick="event.stopPropagation(); quickFollowUp(${customer.id})" class="flex-1 text-[10px] bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded py-1 transition">跟进 ✉️</button>
            <button onclick="event.stopPropagation(); markAsLost(${customer.id})" class="text-[10px] bg-red-600/10 hover:bg-red-600/30 text-red-400/60 rounded py-1 px-2 transition">✕</button>
        </div>
    </div>`;
}

// ========================================
// Customer Actions
// ========================================
function advanceStage(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const stageOrder = ['new', 'quoted', 'sample', 'negotiation', 'won'];
    const currentIdx = stageOrder.indexOf(customer.stage);
    if (currentIdx < stageOrder.length - 1) {
        customer.stage = stageOrder[currentIdx + 1];
        customer.lastContact = new Date().toISOString();
        customer.nextFollowUp = new Date(Date.now() + 3 * 86400000).toISOString();
        savePipelineCustomers(customers);
        renderPipeline();
        if (typeof showToast === 'function') showToast('✅ ' + (customer.company || customer.name) + ' → ' + (STAGES.find(s => s.id === customer.stage)?.label || ''), 'success');
    }
}

function markAsLost(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    if (!confirm('确定将 ' + (customer.company || customer.name) + ' 标记为丢单？')) return;
    customer.stage = 'lost';
    customer.lostAt = new Date().toISOString();
    savePipelineCustomers(customers);
    renderPipeline();
    if (typeof showToast === 'function') showToast('已标记为丢单', 'info');
}

async function quickFollowUp(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    if (typeof showToast === 'function') showToast('🤖 AI 正在生成跟进邮件...', 'info');

    const stageLabelMap = {};
    STAGES.forEach(s => stageLabelMap[s.id] = s.label);
    const daysSince = Math.floor((Date.now() - new Date(customer.lastContact).getTime()) / 86400000);

    const stageStrategy = {
        new: 'First touch: show genuine interest in their inquiry, ask qualifying questions about volume/specs/timeline',
        quoted: 'Quote follow-up: check if they received the quote, address potential concerns about price/MOQ/delivery',
        sample: 'Sample stage: ask about sample receipt & evaluation, offer to address quality concerns, gently push toward order',
        negotiation: 'Negotiation: be flexible on terms, offer value-adds (faster delivery, payment terms), create urgency'
    };

    const prompt = `
You are an expert B2B foreign trade email writer. Write a follow-up email for this lead.

Customer Context:
- Company: ${customer.company || customer.name}
- Country: ${customer.country || 'Unknown'}
- Contact: ${customer.name || 'Unknown'}
- Product Interest: ${customer.product || 'N/A'}
- Current Stage: ${stageLabelMap[customer.stage] || customer.stage}
- Days Since Last Contact: ${daysSince}
- Previous Notes: ${customer.notes || 'None'}
${customer.quoteData?.hasQuote ? '- Quote: FOB $' + customer.quoteData.fobUSD + ', CIF $' + customer.quoteData.cifUSD : ''}

Strategy: ${stageStrategy[customer.stage] || 'Be professional and warm'}

Rules:
- Professional but warm tone, not robotic
- Reference specific product/inquiry context naturally
- ${daysSince > 7 ? 'Acknowledge the gap since last contact diplomatically' : 'Keep momentum going'}
- Include a clear, specific call-to-action
- Keep it concise (under 150 words)
- Language: English
- Subject line + body only, no meta commentary`;

    try {
        const reply = await callGeminiAPI(prompt);
        if (reply) {
            openFollowUpModal(customer, reply.trim());
        } else {
            if (typeof showToast === 'function') showToast('生成失败', 'error');
        }
    } catch (e) {
        if (typeof showToast === 'function') showToast('Error: ' + e.message, 'error');
    }
}

function openFollowUpModal(customer, emailDraft) {
    // Remove existing modal
    document.getElementById('followup-modal')?.remove();

    const stageLabel = STAGES.find(s => s.id === customer.stage)?.label || customer.stage;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.id = 'followup-modal';
    modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
    <div class="bg-slate-900 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto shadow-2xl" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-white">✉️ 跟进邮件 — ${customer.company || customer.name}</h2>
            <button onclick="document.getElementById('followup-modal').remove()" class="text-gray-400 hover:text-white text-xl transition">✕</button>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div class="bg-slate-800 p-2 rounded"><span class="text-gray-500">国家:</span> <span class="text-white">${customer.country || 'N/A'}</span></div>
            <div class="bg-slate-800 p-2 rounded"><span class="text-gray-500">产品:</span> <span class="text-yellow-400">${customer.product || 'N/A'}</span></div>
            <div class="bg-slate-800 p-2 rounded"><span class="text-gray-500">阶段:</span> <span class="text-blue-400">${stageLabel}</span></div>
        </div>
        <textarea id="followup-draft" class="w-full bg-black/30 border border-gray-600 rounded-lg p-4 font-mono text-sm text-gray-300 resize-none focus:border-blue-500 focus:outline-none transition" rows="14">${emailDraft}</textarea>
        <div class="flex gap-3 mt-4">
            <button onclick="copyFollowUpDraft()" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-1">📋 复制邮件</button>
            <button onclick="markFollowedUp(${customer.id})" class="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-1">✅ 已跟进</button>
            <button onclick="document.getElementById('followup-modal').remove()" class="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition">取消</button>
        </div>
    </div>`;
    document.body.appendChild(modal);
}

function copyFollowUpDraft() {
    const draft = document.getElementById('followup-draft');
    if (draft?.value) {
        navigator.clipboard.writeText(draft.value).then(() => {
            if (typeof showToast === 'function') showToast('✅ 已复制到剪贴板', 'success');
        });
    }
}

function markFollowedUp(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    customer.lastContact = new Date().toISOString();
    // Smart follow-up scheduling: shorter intervals for hotter leads
    const daysMap = { new: 2, quoted: 3, sample: 5, negotiation: 2 };
    const daysUntilNext = daysMap[customer.stage] || 3;
    customer.nextFollowUp = new Date(Date.now() + daysUntilNext * 86400000).toISOString();
    customer.followUpCount = (customer.followUpCount || 0) + 1;
    savePipelineCustomers(customers);

    document.getElementById('followup-modal')?.remove();
    renderPipeline();
    if (typeof showToast === 'function') showToast('✅ 已跟进 · 下次: ' + daysUntilNext + '天后', 'success');
}

// ========================================
// Customer Detail Modal
// ========================================
function openCustomerDetail(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Remove existing detail modal
    document.getElementById('customer-detail-modal')?.remove();

    const stageLabel = STAGES.find(s => s.id === customer.stage)?.label || customer.stage;
    const daysSinceContact = customer.lastContact ? Math.floor((Date.now() - new Date(customer.lastContact).getTime()) / 86400000) : 0;
    const createdDays = customer.createdAt ? Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / 86400000) : 0;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.id = 'customer-detail-modal';
    modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
    <div class="bg-slate-900 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto shadow-2xl" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h2 class="text-xl font-bold text-white">${customer.company || customer.name}</h2>
                <span class="text-xs text-gray-500">加入管道 ${createdDays} 天 · 跟进 ${customer.followUpCount || 0} 次</span>
            </div>
            <button onclick="document.getElementById('customer-detail-modal').remove()" class="text-gray-400 hover:text-white text-xl transition">✕</button>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-800 p-3 rounded"><span class="text-gray-500 block mb-1">联系人</span><span class="text-white font-bold">${customer.name}</span></div>
            <div class="bg-slate-800 p-3 rounded"><span class="text-gray-500 block mb-1">国家</span><span class="text-white font-bold">${customer.country || 'N/A'}</span></div>
            <div class="bg-slate-800 p-3 rounded"><span class="text-gray-500 block mb-1">邮箱</span><span class="text-blue-400">${customer.email || 'N/A'}</span></div>
            <div class="bg-slate-800 p-3 rounded"><span class="text-gray-500 block mb-1">产品</span><span class="text-yellow-400">${customer.product || 'N/A'}</span></div>
            <div class="bg-slate-800 p-3 rounded"><span class="text-gray-500 block mb-1">数量</span><span class="text-white">${customer.quantity || 'TBD'}</span></div>
            <div class="bg-slate-800 p-3 rounded"><span class="text-gray-500 block mb-1">当前阶段</span><span class="text-blue-400 font-bold">${stageLabel}</span></div>
            <div class="bg-slate-800 p-3 rounded"><span class="text-gray-500 block mb-1">询盘得分</span><span class="text-white font-bold">${customer.score}/100</span></div>
            <div class="bg-slate-800 p-3 rounded"><span class="text-gray-500 block mb-1">上次联系</span><span class="text-white">${daysSinceContact}天前</span></div>
        </div>

        <!-- Quote Data -->
        ${customer.quoteData?.hasQuote ? `
        <div class="bg-green-900/20 rounded-lg p-3 mb-4 border border-green-500/20">
            <div class="text-xs font-bold text-green-400 mb-2">💰 报价记录</div>
            <div class="flex gap-4 text-xs flex-wrap">
                <span>FOB: <strong class="text-green-400">$${customer.quoteData.fobUSD}</strong></span>
                <span>CIF: <strong class="text-blue-400">$${customer.quoteData.cifUSD}</strong></span>
                <span>利润率: <strong class="text-purple-400">${customer.quoteData.margin}</strong></span>
            </div>
        </div>` : ''}

        <!-- Notes -->
        <div class="mb-4">
            <label class="text-xs text-gray-500 mb-1 block">📝 备注</label>
            <textarea id="customer-notes-${customer.id}" class="w-full bg-black/20 border border-gray-700 rounded-lg p-2 text-xs text-gray-300 resize-none focus:border-blue-500 focus:outline-none transition" rows="3">${customer.notes || ''}</textarea>
        </div>

        <!-- Email History -->
        ${customer.emails?.length > 0 ? `
        <div class="mb-4">
            <div class="text-xs font-bold text-gray-400 mb-2">📬 邮件记录 (${customer.emails.length})</div>
            <div class="space-y-2 max-h-40 overflow-y-auto">
                ${customer.emails.map(e => `
                    <div class="bg-black/20 rounded p-2 text-[10px] border-l-2 ${e.type === 'inquiry' ? 'border-blue-500' : 'border-green-500'}">
                        <div class="text-gray-500">${e.type === 'inquiry' ? '📩 客户询盘' : '📤 我方回复'} · ${new Date(e.date).toLocaleString()}</div>
                        <div class="text-gray-400 mt-1 whitespace-pre-wrap">${(e.content || '').substring(0, 300)}${(e.content || '').length > 300 ? '...' : ''}</div>
                    </div>
                `).join('')}
            </div>
        </div>` : ''}

        <!-- Actions -->
        <div class="flex gap-2 mt-4 flex-wrap">
            <button onclick="saveCustomerNotes(${customer.id})" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition">💾 保存备注</button>
            <button onclick="document.getElementById('customer-detail-modal').remove(); quickFollowUp(${customer.id})" class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition">✉️ AI跟进邮件</button>
            <button onclick="advanceStage(${customer.id}); document.getElementById('customer-detail-modal').remove()" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition">⏩ 推进阶段</button>
            <button onclick="markAsLost(${customer.id}); document.getElementById('customer-detail-modal').remove()" class="px-4 py-2 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition">❌ 丢单</button>
            <button onclick="deleteCustomer(${customer.id}); document.getElementById('customer-detail-modal').remove()" class="px-4 py-2 bg-slate-700 hover:bg-red-700 text-gray-400 rounded-lg text-xs transition">🗑️ 删除</button>
            <button onclick="document.getElementById('customer-detail-modal').remove()" class="px-4 py-2 bg-slate-800 text-gray-400 rounded-lg text-xs ml-auto transition">关闭</button>
        </div>
    </div>`;
    document.body.appendChild(modal);
}

function saveCustomerNotes(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const textarea = document.getElementById('customer-notes-' + customerId);
    if (textarea) {
        customer.notes = textarea.value;
        savePipelineCustomers(customers);
        if (typeof showToast === 'function') showToast('✅ 备注已保存', 'success');
    }
}

function deleteCustomer(customerId) {
    if (!confirm('确定删除此客户？此操作不可恢复。')) return;
    let customers = getPipelineCustomers();
    customers = customers.filter(c => c.id !== customerId);
    savePipelineCustomers(customers);
    renderPipeline();
    if (typeof showToast === 'function') showToast('已删除', 'info');
}

// ========================================
// Add Customer Manually
// ========================================
function showAddCustomerForm() {
    document.getElementById('add-customer-modal')?.remove();

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.id = 'add-customer-modal';
    modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
    <div class="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-white">➕ 手动添加客户</h2>
            <button onclick="document.getElementById('add-customer-modal').remove()" class="text-gray-400 hover:text-white transition">✕</button>
        </div>
        <div class="space-y-3">
            <input id="add-cust-name" class="w-full p-2.5 rounded-lg bg-slate-800 border border-gray-600 text-white text-sm focus:border-blue-500 focus:outline-none transition" placeholder="联系人姓名 *">
            <input id="add-cust-company" class="w-full p-2.5 rounded-lg bg-slate-800 border border-gray-600 text-white text-sm focus:border-blue-500 focus:outline-none transition" placeholder="公司名称 *">
            <div class="grid grid-cols-2 gap-3">
                <input id="add-cust-country" class="w-full p-2.5 rounded-lg bg-slate-800 border border-gray-600 text-white text-sm focus:border-blue-500 focus:outline-none transition" placeholder="国家">
                <input id="add-cust-email" class="w-full p-2.5 rounded-lg bg-slate-800 border border-gray-600 text-white text-sm focus:border-blue-500 focus:outline-none transition" placeholder="邮箱">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <input id="add-cust-product" class="w-full p-2.5 rounded-lg bg-slate-800 border border-gray-600 text-white text-sm focus:border-blue-500 focus:outline-none transition" placeholder="感兴趣产品">
                <input id="add-cust-qty" class="w-full p-2.5 rounded-lg bg-slate-800 border border-gray-600 text-white text-sm focus:border-blue-500 focus:outline-none transition" placeholder="数量">
            </div>
            <select id="add-cust-source" class="w-full p-2.5 rounded-lg bg-slate-800 border border-gray-600 text-white text-sm focus:border-blue-500 focus:outline-none transition">
                <option value="">来源渠道</option>
                <option value="website">官网询盘</option>
                <option value="alibaba">阿里巴巴</option>
                <option value="exhibition">展会</option>
                <option value="referral">客户推荐</option>
                <option value="linkedin">LinkedIn</option>
                <option value="email">主动开发邮件</option>
                <option value="other">其他</option>
            </select>
            <textarea id="add-cust-notes" class="w-full p-2.5 rounded-lg bg-slate-800 border border-gray-600 text-white text-sm resize-none focus:border-blue-500 focus:outline-none transition" rows="2" placeholder="备注"></textarea>
            <button onclick="addCustomerManual()" class="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-lg font-bold text-sm transition-all hover:scale-[1.02] shadow-lg">添加到管道</button>
        </div>
    </div>`;
    document.body.appendChild(modal);
}

function addCustomerManual() {
    const nameVal = document.getElementById('add-cust-name')?.value?.trim();
    const companyVal = document.getElementById('add-cust-company')?.value?.trim();

    if (!nameVal && !companyVal) {
        if (typeof showToast === 'function') showToast('请至少填写联系人姓名或公司名称', 'error');
        return;
    }

    const customer = {
        id: Date.now(),
        name: nameVal || '未知',
        company: companyVal || '未知公司',
        country: document.getElementById('add-cust-country')?.value?.trim() || '',
        email: document.getElementById('add-cust-email')?.value?.trim() || '',
        product: document.getElementById('add-cust-product')?.value?.trim() || '',
        quantity: document.getElementById('add-cust-qty')?.value?.trim() || '',
        source: document.getElementById('add-cust-source')?.value || '',
        stage: 'new',
        score: 50,
        lastContact: new Date().toISOString(),
        nextFollowUp: new Date(Date.now() + 2 * 86400000).toISOString(),
        notes: document.getElementById('add-cust-notes')?.value?.trim() || '',
        emails: [],
        quoteData: null,
        followUpCount: 0,
        createdAt: new Date().toISOString()
    };

    const customers = getPipelineCustomers();
    customers.unshift(customer);
    savePipelineCustomers(customers);

    document.getElementById('add-customer-modal')?.remove();
    renderPipeline();
    if (typeof showToast === 'function') showToast('✅ ' + (customer.company) + ' 已添加到管道', 'success');
}

// ========================================
// Dashboard: Today's Follow-ups
// ========================================
function checkTodayFollowUps() {
    const customers = getPipelineCustomers();
    const now = new Date();
    return customers.filter(c => {
        if (c.stage === 'won' || c.stage === 'lost') return false;
        if (!c.nextFollowUp) return false;
        return new Date(c.nextFollowUp) <= now;
    });
}

function renderTodayFollowUps() {
    const container = document.getElementById('today-followup');
    if (!container) return;

    const overdue = checkTodayFollowUps();
    if (overdue.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
    <div class="bg-slate-800/50 border border-red-500/30 rounded-xl p-4 mb-6 border-l-4 border-l-red-500">
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
                <span class="text-2xl">🔔</span>
                <div>
                    <div class="font-bold text-red-400">今日待跟进 (${overdue.length})</div>
                    <div class="text-xs text-gray-500">以下客户已超过跟进日期，点击可直接生成AI跟进邮件</div>
                </div>
            </div>
            <button onclick="switchTab('customer-pipeline')" class="text-xs bg-red-600/30 hover:bg-red-600/50 text-red-400 px-3 py-1.5 rounded-lg font-bold transition">
                管道看板 →
            </button>
        </div>
        <div class="space-y-2">
            ${overdue.slice(0, 6).map(c => {
        const daysOverdue = Math.floor((Date.now() - new Date(c.nextFollowUp).getTime()) / 86400000);
        const stageLabel = STAGES.find(s => s.id === c.stage)?.label || c.stage;
        return `
                <div class="flex items-center justify-between bg-black/20 rounded-lg p-2.5 hover:bg-black/30 transition">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="w-7 h-7 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center text-[10px] font-bold text-red-400 flex-shrink-0">${c.score || '--'}</div>
                        <div class="min-w-0">
                            <div class="text-sm text-white font-bold truncate">${c.company || c.name}</div>
                            <div class="text-[10px] text-gray-500 truncate">${c.country || ''} · ${c.product?.substring(0, 20) || ''} · ${stageLabel}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span class="text-red-400 text-xs font-bold">超期${daysOverdue}天</span>
                        <button onclick="quickFollowUp(${c.id})" class="px-2.5 py-1 bg-green-600/30 hover:bg-green-600/50 text-green-400 text-[10px] rounded-lg font-bold transition">AI跟进</button>
                    </div>
                </div>`;
    }).join('')}
            ${overdue.length > 6 ? '<div class="text-center text-xs text-gray-500 pt-1">还有 ' + (overdue.length - 6) + ' 位客户需要跟进...</div>' : ''}
        </div>
    </div>`;
}

// ========================================
// Auto-init on page load
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        if (typeof renderTodayFollowUps === 'function') renderTodayFollowUps();
    }, 1500);
});

// ========================================
// Expose all functions
// ========================================
window.renderPipeline = renderPipeline;
window.advanceStage = advanceStage;
window.markAsLost = markAsLost;
window.quickFollowUp = quickFollowUp;
window.openCustomerDetail = openCustomerDetail;
window.saveCustomerNotes = saveCustomerNotes;
window.deleteCustomer = deleteCustomer;
window.showAddCustomerForm = showAddCustomerForm;
window.addCustomerManual = addCustomerManual;
window.checkTodayFollowUps = checkTodayFollowUps;
window.renderTodayFollowUps = renderTodayFollowUps;
window.copyFollowUpDraft = copyFollowUpDraft;
window.markFollowedUp = markFollowedUp;
