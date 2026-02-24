/**
 * Morgan Marketing OS v19.0 - Customer Pipeline (Kanban CRM)
 * Stages: 新询盘(new) → 已报价(quoted) → 样品(sample) → 谈判(negotiation) → 成交(won) / 丢单(lost)
 */

const PIPELINE_KEY = 'tds_pipeline_customers';
const STAGES = [
    { id: 'new', label: '📥 新询盘', color: 'blue' },
    { id: 'quoted', label: '💰 已报价', color: 'yellow' },
    { id: 'sample', label: '📦 样品阶段', color: 'purple' },
    { id: 'negotiation', label: '🤝 谈判中', color: 'orange' },
    { id: 'won', label: '🏆 成交', color: 'green' },
    { id: 'lost', label: '❌ 丢单', color: 'red' }
];

function getPipelineCustomers() {
    return JSON.parse(localStorage.getItem(PIPELINE_KEY) || '[]');
}

function savePipelineCustomers(customers) {
    localStorage.setItem(PIPELINE_KEY, JSON.stringify(customers));
}

// ========================================
// Render Full Pipeline View
// ========================================
function renderPipeline() {
    const container = document.getElementById('pipeline-board');
    if (!container) return;

    const customers = getPipelineCustomers();
    const now = new Date();

    // Count stats
    const stats = {
        total: customers.length,
        overdue: customers.filter(c => c.stage !== 'won' && c.stage !== 'lost' && new Date(c.nextFollowUp) < now).length,
        newToday: customers.filter(c => {
            const created = new Date(c.createdAt);
            return created.toDateString() === now.toDateString();
        }).length
    };

    // Stats bar
    const statsBar = document.getElementById('pipeline-stats');
    if (statsBar) {
        statsBar.innerHTML = `
            <div class="flex items-center gap-6 text-xs">
                <div><span class="text-gray-500">总客户:</span> <span class="text-white font-bold">${stats.total}</span></div>
                <div><span class="text-gray-500">今日新增:</span> <span class="text-green-400 font-bold">${stats.newToday}</span></div>
                <div class="${stats.overdue > 0 ? 'animate-pulse' : ''}"><span class="text-gray-500">待跟进:</span> <span class="text-red-400 font-bold">${stats.overdue}</span></div>
            </div>`;
    }

    // Render Kanban columns
    const activeStages = STAGES.filter(s => s.id !== 'won' && s.id !== 'lost');
    const closedStages = STAGES.filter(s => s.id === 'won' || s.id === 'lost');

    container.innerHTML = `
    <div class="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        ${activeStages.map(stage => {
        const stageCustomers = customers.filter(c => c.stage === stage.id);
        const colorMap = { blue: 'blue', yellow: 'yellow', purple: 'purple', orange: 'orange' };
        const color = colorMap[stage.color] || 'gray';
        return `
            <div class="flex-shrink-0 w-72 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col">
                <div class="p-3 border-b border-slate-700 flex items-center justify-between">
                    <div class="font-bold text-sm text-${color}-400">${stage.label}</div>
                    <span class="text-xs bg-${color}-900/30 text-${color}-400 px-2 py-0.5 rounded-full font-bold">${stageCustomers.length}</span>
                </div>
                <div class="flex-1 p-2 space-y-2 overflow-y-auto max-h-[450px]">
                    ${stageCustomers.length === 0 ? `<div class="text-center text-gray-600 text-xs py-8">暂无客户</div>` : stageCustomers.map(c => renderCustomerCard(c, now)).join('')}
                </div>
            </div>`;
    }).join('')}
    </div>

    <!-- Closed deals section -->
    <div class="mt-6 grid grid-cols-2 gap-4">
        ${closedStages.map(stage => {
        const stageCustomers = customers.filter(c => c.stage === stage.id);
        const color = stage.id === 'won' ? 'green' : 'red';
        return `
            <div class="bg-slate-800/30 rounded-xl border border-${color}-500/20 p-3">
                <div class="font-bold text-sm text-${color}-400 mb-2">${stage.label} (${stageCustomers.length})</div>
                <div class="space-y-1 max-h-32 overflow-y-auto">
                    ${stageCustomers.length === 0 ? '<div class="text-xs text-gray-600">空</div>' : stageCustomers.slice(0, 5).map(c => `
                        <div class="flex items-center justify-between text-xs p-1.5 rounded bg-black/20">
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
    const isOverdue = customer.nextFollowUp && new Date(customer.nextFollowUp) < now;
    const daysSinceContact = customer.lastContact ? Math.floor((now - new Date(customer.lastContact)) / 86400000) : 0;
    const scoreColor = customer.score >= 80 ? 'green' : customer.score >= 60 ? 'yellow' : 'red';

    return `
    <div class="bg-slate-900/80 rounded-lg p-3 border ${isOverdue ? 'border-red-500/50 shadow-red-500/10 shadow-lg animate-pulse' : 'border-slate-600/50'} hover:border-blue-500/50 transition cursor-pointer group"
         onclick="openCustomerDetail(${customer.id})">
        <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0">
                <div class="font-bold text-white text-sm truncate group-hover:text-blue-400 transition">${customer.company || customer.name}</div>
                <div class="text-[10px] text-gray-500">${customer.country || ''} ${customer.email ? '· ' + customer.email : ''}</div>
            </div>
            <div class="w-7 h-7 rounded-full bg-${scoreColor}-900/40 border border-${scoreColor}-500/30 flex items-center justify-center text-[10px] font-bold text-${scoreColor}-400 flex-shrink-0">
                ${customer.score || '--'}
            </div>
        </div>
        <div class="text-xs text-yellow-400/80 truncate mb-2">🏷️ ${customer.product || '未知产品'}</div>
        <div class="flex items-center justify-between text-[10px]">
            <span class="text-gray-500">${daysSinceContact}天前联系</span>
            ${isOverdue ? '<span class="text-red-400 font-bold">⚠️ 需跟进</span>' : `<span class="text-gray-600">${customer.nextFollowUp ? new Date(customer.nextFollowUp).toLocaleDateString() : ''}</span>`}
        </div>
        <!-- Quick Actions (on hover) -->
        <div class="mt-2 pt-2 border-t border-slate-700/50 hidden group-hover:flex gap-1">
            <button onclick="event.stopPropagation(); advanceStage(${customer.id})" class="flex-1 text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded py-1 transition">推进 →</button>
            <button onclick="event.stopPropagation(); quickFollowUp(${customer.id})" class="flex-1 text-[10px] bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded py-1 transition">跟进 ✉️</button>
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
        showToast(`✅ ${customer.company || customer.name} 推进到 → ${STAGES.find(s => s.id === customer.stage)?.label}`, 'success');
    }
}

function markAsLost(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    customer.stage = 'lost';
    savePipelineCustomers(customers);
    renderPipeline();
    showToast('已标记为丢单', 'info');
}

async function quickFollowUp(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    showToast('🤖 AI 正在生成跟进邮件...', 'info');

    const stageLabelMap = {};
    STAGES.forEach(s => stageLabelMap[s.id] = s.label);

    const prompt = `
    Task: Write a B2B follow-up email for an existing lead.
    
    Customer Info:
    - Company: ${customer.company || customer.name}
    - Country: ${customer.country || 'Unknown'}
    - Product Interest: ${customer.product || 'N/A'}
    - Current Stage: ${stageLabelMap[customer.stage] || customer.stage}
    - Days Since Last Contact: ${Math.floor((Date.now() - new Date(customer.lastContact).getTime()) / 86400000)}
    
    Previous Notes: ${customer.notes || 'None'}
    
    Guidelines:
    - Be professional but warm
    - Reference the specific product/inquiry context
    - Stage-appropriate: ${customer.stage === 'new' ? 'Initial outreach, show interest' : customer.stage === 'quoted' ? 'Check if quote was received, address concerns' : customer.stage === 'sample' ? 'Check sample status, push to order' : 'Negotiate terms, close the deal'}
    - Clear CTA
    - Language: English
    
    Output: Email body only.`;

    try {
        const reply = await callGeminiAPI(prompt);
        if (reply) {
            openFollowUpModal(customer, reply.trim());
        } else {
            showToast('生成失败', 'error');
        }
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

function openFollowUpModal(customer, emailDraft) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
    modal.id = 'followup-modal';
    modal.innerHTML = `
    <div class="bg-slate-900 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-white">✉️ 跟进邮件 — ${customer.company || customer.name}</h2>
            <button onclick="document.getElementById('followup-modal').remove()" class="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div class="bg-slate-800 p-2 rounded"><span class="text-gray-500">国家:</span> <span class="text-white">${customer.country || 'N/A'}</span></div>
            <div class="bg-slate-800 p-2 rounded"><span class="text-gray-500">产品:</span> <span class="text-yellow-400">${customer.product || 'N/A'}</span></div>
            <div class="bg-slate-800 p-2 rounded"><span class="text-gray-500">阶段:</span> <span class="text-blue-400">${customer.stage}</span></div>
        </div>
        <textarea id="followup-draft" class="w-full bg-black/30 border border-gray-600 rounded-lg p-4 font-mono text-sm text-gray-300 resize-none focus:border-blue-500 focus:outline-none transition" rows="12">${emailDraft}</textarea>
        <div class="flex gap-3 mt-4">
            <button onclick="copyFollowUpDraft()" class="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-sm">📋 复制邮件</button>
            <button onclick="markFollowedUp(${customer.id})" class="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-sm">✅ 标记已跟进</button>
            <button onclick="document.getElementById('followup-modal').remove()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded text-sm">取消</button>
        </div>
    </div>`;
    document.body.appendChild(modal);
}

function copyFollowUpDraft() {
    const draft = document.getElementById('followup-draft');
    if (draft?.value) {
        navigator.clipboard.writeText(draft.value).then(() => showToast('已复制到剪贴板', 'success'));
    }
}

function markFollowedUp(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    customer.lastContact = new Date().toISOString();
    customer.nextFollowUp = new Date(Date.now() + 3 * 86400000).toISOString();
    savePipelineCustomers(customers);

    const modal = document.getElementById('followup-modal');
    if (modal) modal.remove();

    renderPipeline();
    showToast('✅ 已标记跟进完成，下次跟进日期已自动设置', 'success');
}

// ========================================
// Customer Detail Modal
// ========================================
function openCustomerDetail(customerId) {
    const customers = getPipelineCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const stageLabel = STAGES.find(s => s.id === customer.stage)?.label || customer.stage;
    const daysSinceContact = customer.lastContact ? Math.floor((Date.now() - new Date(customer.lastContact).getTime()) / 86400000) : 0;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
    modal.id = 'customer-detail-modal';
    modal.innerHTML = `
    <div class="bg-slate-900 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-white">${customer.company || customer.name}</h2>
            <button onclick="document.getElementById('customer-detail-modal').remove()" class="text-gray-400 hover:text-white text-xl">✕</button>
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
            <div class="flex gap-4 text-xs">
                <span>FOB: <strong class="text-green-400">$${customer.quoteData.fobUSD}</strong></span>
                <span>CIF: <strong class="text-blue-400">$${customer.quoteData.cifUSD}</strong></span>
                <span>利润率: <strong class="text-purple-400">${customer.quoteData.margin}</strong></span>
            </div>
        </div>` : ''}

        <!-- Notes -->
        <div class="mb-4">
            <label class="text-xs text-gray-500 mb-1 block">📝 备注</label>
            <textarea id="customer-notes-${customer.id}" class="w-full bg-black/20 border border-gray-700 rounded p-2 text-xs text-gray-300 resize-none" rows="3">${customer.notes || ''}</textarea>
        </div>

        <!-- Email History -->
        ${customer.emails?.length > 0 ? `
        <div class="mb-4">
            <div class="text-xs font-bold text-gray-400 mb-2">📬 邮件记录 (${customer.emails.length})</div>
            <div class="space-y-2 max-h-40 overflow-y-auto">
                ${customer.emails.map(e => `
                    <div class="bg-black/20 rounded p-2 text-[10px] border-l-2 ${e.type === 'inquiry' ? 'border-blue-500' : 'border-green-500'}">
                        <div class="text-gray-500">${e.type === 'inquiry' ? '📩 客户询盘' : '📤 我方回复'} · ${new Date(e.date).toLocaleString()}</div>
                        <div class="text-gray-400 mt-1">${e.content.substring(0, 200)}...</div>
                    </div>
                `).join('')}
            </div>
        </div>` : ''}

        <!-- Actions -->
        <div class="flex gap-2 mt-4 flex-wrap">
            <button onclick="saveCustomerNotes(${customer.id})" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold">💾 保存备注</button>
            <button onclick="document.getElementById('customer-detail-modal').remove(); quickFollowUp(${customer.id})" class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold">✉️ AI跟进邮件</button>
            <button onclick="advanceStage(${customer.id}); document.getElementById('customer-detail-modal').remove()" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold">⏩ 推进阶段</button>
            <button onclick="markAsLost(${customer.id}); document.getElementById('customer-detail-modal').remove()" class="px-4 py-2 bg-red-600/50 hover:bg-red-600 text-white rounded text-xs font-bold">❌ 丢单</button>
            <button onclick="deleteCustomer(${customer.id}); document.getElementById('customer-detail-modal').remove()" class="px-4 py-2 bg-slate-700 hover:bg-red-700 text-gray-400 rounded text-xs">🗑️ 删除</button>
            <button onclick="document.getElementById('customer-detail-modal').remove()" class="px-4 py-2 bg-slate-800 text-gray-400 rounded text-xs ml-auto">关闭</button>
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
        showToast('✅ 备注已保存', 'success');
    }
}

function deleteCustomer(customerId) {
    if (!confirm('确定删除此客户？')) return;
    let customers = getPipelineCustomers();
    customers = customers.filter(c => c.id !== customerId);
    savePipelineCustomers(customers);
    renderPipeline();
    showToast('已删除', 'info');
}

// ========================================
// Add Customer Manually
// ========================================
function showAddCustomerForm() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
    modal.id = 'add-customer-modal';
    modal.innerHTML = `
    <div class="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-white">➕ 手动添加客户</h2>
            <button onclick="document.getElementById('add-customer-modal').remove()" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="space-y-3">
            <input id="add-cust-name" class="w-full p-2 rounded bg-slate-800 border border-gray-600 text-white text-sm" placeholder="联系人姓名">
            <input id="add-cust-company" class="w-full p-2 rounded bg-slate-800 border border-gray-600 text-white text-sm" placeholder="公司名称">
            <input id="add-cust-country" class="w-full p-2 rounded bg-slate-800 border border-gray-600 text-white text-sm" placeholder="国家">
            <input id="add-cust-email" class="w-full p-2 rounded bg-slate-800 border border-gray-600 text-white text-sm" placeholder="邮箱">
            <input id="add-cust-product" class="w-full p-2 rounded bg-slate-800 border border-gray-600 text-white text-sm" placeholder="感兴趣产品">
            <input id="add-cust-qty" class="w-full p-2 rounded bg-slate-800 border border-gray-600 text-white text-sm" placeholder="数量">
            <textarea id="add-cust-notes" class="w-full p-2 rounded bg-slate-800 border border-gray-600 text-white text-sm resize-none" rows="2" placeholder="备注"></textarea>
            <button onclick="addCustomerManual()" class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-sm">添加到管道</button>
        </div>
    </div>`;
    document.body.appendChild(modal);
}

function addCustomerManual() {
    const customer = {
        id: Date.now(),
        name: document.getElementById('add-cust-name')?.value || '未知',
        company: document.getElementById('add-cust-company')?.value || '未知公司',
        country: document.getElementById('add-cust-country')?.value || '',
        email: document.getElementById('add-cust-email')?.value || '',
        product: document.getElementById('add-cust-product')?.value || '',
        quantity: document.getElementById('add-cust-qty')?.value || '',
        stage: 'new',
        score: 50,
        lastContact: new Date().toISOString(),
        nextFollowUp: new Date(Date.now() + 3 * 86400000).toISOString(),
        notes: document.getElementById('add-cust-notes')?.value || '',
        emails: [],
        quoteData: null,
        createdAt: new Date().toISOString()
    };

    const customers = getPipelineCustomers();
    customers.unshift(customer);
    savePipelineCustomers(customers);

    document.getElementById('add-customer-modal')?.remove();
    renderPipeline();
    showToast('✅ 客户已添加到管道', 'success');
}

// ========================================
// Dashboard: Today's Follow-ups
// ========================================
function checkTodayFollowUps() {
    const customers = getPipelineCustomers();
    const now = new Date();
    const overdue = customers.filter(c => {
        if (c.stage === 'won' || c.stage === 'lost') return false;
        if (!c.nextFollowUp) return false;
        return new Date(c.nextFollowUp) <= now;
    });
    return overdue;
}

function renderTodayFollowUps() {
    const container = document.getElementById('today-followup');
    if (!container) return;

    const overdue = checkTodayFollowUps();
    if (overdue.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
    <div class="panel border-l-4 border-red-500 mb-6 bg-red-900/10">
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
                <span class="text-2xl animate-pulse">🔔</span>
                <div>
                    <div class="font-bold text-red-400">今日待跟进 (${overdue.length})</div>
                    <div class="text-xs text-gray-500">以下客户已超过跟进日期</div>
                </div>
            </div>
            <button onclick="switchTab('customer-pipeline')" class="text-xs bg-red-600/30 hover:bg-red-600/50 text-red-400 px-3 py-1 rounded font-bold transition">
                查看管道 →
            </button>
        </div>
        <div class="space-y-2">
            ${overdue.slice(0, 5).map(c => {
        const daysOverdue = Math.floor((Date.now() - new Date(c.nextFollowUp).getTime()) / 86400000);
        return `
                <div class="flex items-center justify-between bg-black/20 rounded-lg p-2 hover:bg-black/30 transition">
                    <div class="flex items-center gap-3">
                        <div class="w-6 h-6 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center text-[10px] font-bold text-red-400">${c.score || '--'}</div>
                        <div>
                            <div class="text-sm text-white font-bold">${c.company || c.name}</div>
                            <div class="text-[10px] text-gray-500">${c.country || ''} · ${c.product?.substring(0, 20) || ''}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-red-400 text-xs font-bold">超期${daysOverdue}天</span>
                        <button onclick="quickFollowUp(${c.id})" class="px-2 py-1 bg-green-600/30 hover:bg-green-600/50 text-green-400 text-[10px] rounded font-bold transition">AI跟进</button>
                    </div>
                </div>`;
    }).join('')}
        </div>
    </div>`;
}

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
