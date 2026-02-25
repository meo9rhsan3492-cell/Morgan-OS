/**
 * Morgan Marketing OS v19.0 - Exhibition Business Card Scanner
 * Features: Gemini Vision OCR, batch scan queue, lead list, auto follow-up plan, export to CRM
 */

const EXPO_LEADS_KEY = 'tds_expo_leads';
let currentExpoId = null;
let pendingCardBase64 = null;

// ========================================
// Render the Exhibition Leads Panel
// ========================================
function renderBizcardPanel(expoId) {
    currentExpoId = expoId;

    const container = document.getElementById('expo-bizcard-panel');
    if (!container) return;

    const leads = getExpoLeads(expoId);
    const stats = calcLeadStats(leads);

    container.innerHTML = `
    <div class="space-y-4">
        <!-- Stats Bar -->
        <div class="grid grid-cols-4 gap-3">
            ${[
            { label: '收集名片', val: stats.total, color: 'blue', icon: '🪪' },
            { label: '🔥 高意向', val: stats.high, color: 'red', icon: '' },
            { label: '✅ 已跟进', val: stats.followed, color: 'green', icon: '' },
            { label: '⏳ 待跟进', val: stats.pending, color: 'yellow', icon: '' }
        ].map(s => `
                <div class="bg-slate-800/50 rounded-xl p-3 border border-slate-700 text-center">
                    <div class="text-xl font-black text-${s.color}-400">${s.val}</div>
                    <div class="text-[10px] text-gray-400 mt-0.5">${s.icon}${s.label}</div>
                </div>`).join('')}
        </div>

        <!-- Action Bar -->
        <div class="flex gap-2">
            <button onclick="openCardScanner()" class="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition">
                📸 拍照扫描名片
            </button>
            <button onclick="generateAllFollowUps()" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition">
                🤖 批量生成跟进计划
            </button>
            <button onclick="exportLeadsToCRM()" class="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition">
                💾 导入客户管道
            </button>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-1 bg-slate-800/40 rounded-lg p-1">
            ${['all', 'high', 'medium', 'low', 'followed'].map((f, i) => {
            const labels = ['全部', '🔥 高意向', '❄️ 中', '🧊 低', '✅ 已跟进'];
            return `<button onclick="filterExpoLeads('${f}')" id="lead-filter-${f}"
                    class="flex-1 py-1 text-xs rounded-md transition ${i === 0 ? 'bg-slate-600 text-white' : 'text-gray-400 hover:text-white'}">${labels[i]}</button>`;
        }).join('')}
        </div>

        <!-- Lead List -->
        <div id="expo-lead-list" class="space-y-2 max-h-96 overflow-y-auto pr-1">
            ${renderLeadCards(leads, 'all')}
        </div>
    </div>`;
}

function calcLeadStats(leads) {
    return {
        total: leads.length,
        high: leads.filter(l => l.interest === 'High').length,
        followed: leads.filter(l => l.followUpSent).length,
        pending: leads.filter(l => !l.followUpSent).length
    };
}

function filterExpoLeads(filterVal) {
    document.querySelectorAll('[id^="lead-filter-"]').forEach(btn => {
        btn.className = btn.className.replace('bg-slate-600 text-white', 'text-gray-400 hover:text-white');
    });
    const activeBtn = document.getElementById('lead-filter-' + filterVal);
    if (activeBtn) activeBtn.className = activeBtn.className.replace('text-gray-400 hover:text-white', 'bg-slate-600 text-white');

    const leads = getExpoLeads(currentExpoId);
    const listEl = document.getElementById('expo-lead-list');
    if (listEl) listEl.innerHTML = renderLeadCards(leads, filterVal);
}

function renderLeadCards(leads, filter) {
    let filtered = leads;
    if (filter === 'high') filtered = leads.filter(l => l.interest === 'High');
    else if (filter === 'medium') filtered = leads.filter(l => l.interest === 'Medium');
    else if (filter === 'low') filtered = leads.filter(l => l.interest === 'Low');
    else if (filter === 'followed') filtered = leads.filter(l => l.followUpSent);

    if (filtered.length === 0) {
        return '<div class="text-gray-500 text-xs text-center py-8">暂无名片数据 — 点击"拍照扫描名片"开始采集</div>';
    }

    const interestColors = { High: 'border-red-500/50 bg-red-900/10', Medium: 'border-yellow-500/30 bg-yellow-900/10', Low: 'border-gray-600/50 bg-slate-800/30' };
    const interestBadges = { High: 'text-red-400 bg-red-900/40', Medium: 'text-yellow-400 bg-yellow-900/40', Low: 'text-gray-400 bg-gray-800' };

    return filtered.map(lead => `
    <div class="rounded-xl border p-3 ${interestColors[lead.interest] || interestColors.Low} transition hover:brightness-110">
        <div class="flex items-start gap-3">
            <!-- Card thumbnail -->
            ${lead.cardImage ? `<img src="${lead.cardImage}" class="w-14 h-9 object-cover rounded-md flex-shrink-0 border border-gray-600">` :
            `<div class="w-14 h-9 bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0"><span class="text-xl">🪪</span></div>`}
            <!-- Info -->
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="font-bold text-sm text-white truncate">${lead.name || '未识别'}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded ${interestBadges[lead.interest] || interestBadges.Low}">${lead.interest}</span>
                    ${lead.followUpSent ? '<span class="text-[9px] text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">✓ 已跟进</span>' : ''}
                </div>
                <div class="text-xs text-gray-400 truncate">${lead.company || '—'} · ${lead.country || lead.email || '—'}</div>
                <div class="text-[10px] text-gray-500">${lead.product ? `意向: ${lead.product}` : ''}</div>
            </div>
            <!-- Actions -->
            <div class="flex flex-col gap-1 flex-shrink-0">
                <button onclick="viewLeadDetail('${lead.id}')" class="text-[10px] px-2 py-1 bg-blue-600/30 hover:bg-blue-600/60 text-blue-400 rounded transition">详情</button>
                <button onclick="quickFollowUp('${lead.id}')" class="text-[10px] px-2 py-1 bg-purple-600/30 hover:bg-purple-600/60 text-purple-400 rounded transition">跟进</button>
            </div>
        </div>
        ${lead.followUpPlan ? `
        <div class="mt-2 pt-2 border-t border-gray-700/50 text-[10px] text-gray-500">
            <span class="text-purple-400">📋 跟进计划:</span> ${lead.followUpPlan[0]?.action || ''}
            <span class="text-gray-600 ml-2">${lead.followUpPlan.length}步骤</span>
        </div>` : ''}
    </div>`).join('');
}

// ========================================
// Card Scanner Modal
// ========================================
function openCardScanner() {
    document.getElementById('card-scanner-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'card-scanner-modal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.onclick = e => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
    <div class="bg-slate-900 rounded-2xl w-full max-w-3xl border border-gray-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="flex justify-between items-center p-5 border-b border-gray-700 bg-slate-800/40">
            <div>
                <h2 class="text-lg font-black text-white">📸 名片扫描仪</h2>
                <p class="text-xs text-gray-500 mt-0.5">Gemini Vision AI · 自动提取姓名/公司/邮箱/电话/意向产品</p>
            </div>
            <button onclick="document.getElementById('card-scanner-modal').remove()" class="text-gray-400 hover:text-white text-xl transition">✕</button>
        </div>

        <div class="flex flex-1 overflow-hidden">
            <!-- Left: Upload & Preview -->
            <div class="w-80 flex-shrink-0 p-5 border-r border-gray-700 flex flex-col gap-4">
                <!-- Drop Zone -->
                <div id="card-drop-zone"
                    class="border-2 border-dashed border-gray-600 hover:border-yellow-500 rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer transition relative"
                    onclick="document.getElementById('card-file-input').click()"
                    ondragover="event.preventDefault(); this.classList.add('border-yellow-400')"
                    ondragleave="this.classList.remove('border-yellow-400')"
                    ondrop="handleCardDrop(event)">
                    <div id="card-drop-content" class="text-center">
                        <div class="text-4xl mb-2">📷</div>
                        <p class="text-sm font-bold text-gray-300">点击拍照/上传名片</p>
                        <p class="text-[10px] text-gray-500 mt-1">JPG / PNG / 支持拖拽</p>
                    </div>
                    <img id="scanner-card-preview" class="hidden absolute inset-0 w-full h-full object-contain bg-black/40 rounded-xl p-1">
                    <input type="file" id="card-file-input" accept="image/*" capture="environment" class="hidden" onchange="handleScannerUpload(this)">
                </div>

                <!-- OCR Loading -->
                <div id="ocr-status" class="hidden bg-slate-800 rounded-xl p-3 text-center">
                    <div class="text-2xl animate-spin mb-1">⚡</div>
                    <div class="text-xs text-yellow-400 animate-pulse">AI 正在识别名片...</div>
                </div>

                <!-- Batch Queue -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-gray-400 uppercase">批量队列</span>
                        <span id="queue-count" class="text-xs text-blue-400">0 张待处理</span>
                    </div>
                    <div id="card-queue" class="space-y-1 max-h-32 overflow-y-auto">
                        <div class="text-[10px] text-gray-600 text-center py-3">上传名片后出现在此处</div>
                    </div>
                </div>
            </div>

            <!-- Right: Extracted Info Form -->
            <div class="flex-1 p-5 overflow-y-auto">
                <div class="text-xs font-bold text-blue-400 uppercase mb-3">📋 提取的信息 (可手动修正)</div>
                <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] text-gray-500 mb-1 block">姓名 *</label>
                            <input id="scan-name" type="text" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none" placeholder="识别后自动填入">
                        </div>
                        <div>
                            <label class="text-[10px] text-gray-500 mb-1 block">职位</label>
                            <input id="scan-title" type="text" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none" placeholder="Title / Position">
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] text-gray-500 mb-1 block">公司 *</label>
                        <input id="scan-company" type="text" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none" placeholder="Company Name">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] text-gray-500 mb-1 block">邮箱</label>
                            <input id="scan-email" type="email" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none" placeholder="email@example.com">
                        </div>
                        <div>
                            <label class="text-[10px] text-gray-500 mb-1 block">电话/WhatsApp</label>
                            <input id="scan-phone" type="text" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none" placeholder="+1 (xxx) xxx-xxxx">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] text-gray-500 mb-1 block">国家/地区</label>
                            <input id="scan-country" type="text" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none" placeholder="Country">
                        </div>
                        <div>
                            <label class="text-[10px] text-gray-500 mb-1 block">网站</label>
                            <input id="scan-website" type="text" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none" placeholder="www.example.com">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] text-gray-500 mb-1 block">意向产品</label>
                            <input id="scan-product" type="text" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none" placeholder="展会中谈到的产品">
                        </div>
                        <div>
                            <label class="text-[10px] text-gray-500 mb-1 block">意向等级</label>
                            <select id="scan-interest" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-sm text-white rounded-lg focus:border-blue-500 focus:outline-none">
                                <option value="High">🔥 High — 强意向</option>
                                <option value="Medium" selected>❄️ Medium — 一般</option>
                                <option value="Low">🧊 Low — 随便看看</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] text-gray-500 mb-1 block">备注 (展会现场记录)</label>
                        <textarea id="scan-notes" rows="2" class="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-xs text-white rounded-lg focus:border-blue-500 focus:outline-none resize-none" placeholder="例如：想要打样、询问MOQ 500pcs、下周给我发规格书..."></textarea>
                    </div>
                </div>

                <!-- Save Button -->
                <div class="flex gap-3 mt-4">
                    <button onclick="saveScannedLead()" class="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl transition">
                        💾 保存并下一张
                    </button>
                    <button onclick="saveScannedLeadAndPlan()" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition">
                        🤖 保存 + 生成跟进计划
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.appendChild(modal);
}

// ========================================
// Handle Card Image Upload & OCR
// ========================================
function handleCardDrop(event) {
    event.preventDefault();
    document.getElementById('card-drop-zone')?.classList.remove('border-yellow-400');
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
        processCardImage(file);
    }
}

function handleScannerUpload(input) {
    const file = input.files[0];
    if (file) processCardImage(file);
    input.value = '';
}

function processCardImage(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target.result;
        pendingCardBase64 = base64;

        // Show preview
        const preview = document.getElementById('scanner-card-preview');
        const dropContent = document.getElementById('card-drop-content');
        if (preview) { preview.src = base64; preview.classList.remove('hidden'); }
        if (dropContent) dropContent.classList.add('hidden');

        // Show OCR loading
        const ocrStatus = document.getElementById('ocr-status');
        if (ocrStatus) ocrStatus.classList.remove('hidden');

        // Add to queue display
        addToQueueDisplay(file.name, base64);

        // Run Gemini Vision OCR
        await runCardOCR(base64);

        if (ocrStatus) ocrStatus.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

async function runCardOCR(base64DataUrl) {
    try {
        // Extract base64 content
        const parts = base64DataUrl.split(',');
        const mimeType = parts[0].match(/:(.*?);/)[1];
        const base64Data = parts[1];

        const prompt = `You are a business card OCR expert. Extract all information from this business card image.

Return ONLY valid JSON, no markdown:
{
  "name": "Full name",
  "title": "Job title",
  "company": "Company name",
  "email": "Email address",
  "phone": "Phone number",
  "country": "Country inferred from address/phone/domain",
  "website": "Website URL",
  "address": "Address if visible"
}

If a field is not visible, use null. Extract exactly as written on the card.`;

        // Call Gemini with vision - use multimodal
        const result = await callGeminiAPIWithImage(prompt, base64Data, mimeType);

        if (result) {
            const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleaned);
            fillScanForm(data);
            if (typeof showToast === 'function') showToast('✅ AI 识别完毕！请确认并补充信息', 'success');
        }
    } catch (e) {
        console.warn('OCR Error:', e);
        if (typeof showToast === 'function') showToast('AI识别失败，请手动填写', 'warning');
    }
}

// Gemini Multimodal API call
async function callGeminiAPIWithImage(prompt, base64Data, mimeType) {
    const apiKey = localStorage.getItem('morgan_gemini_key') || window.GEMINI_API_KEY || '';
    if (!apiKey) {
        if (typeof showToast === 'function') showToast('请先设置 Gemini API Key', 'error');
        return null;
    }

    const model = localStorage.getItem('morgan_ai_model') || 'gemini-2.0-flash-exp';

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
            })
        }
    );

    if (!response.ok) throw new Error(`API Error ${response.status}`);
    const json = await response.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

function fillScanForm(data) {
    const fields = { name: 'scan-name', title: 'scan-title', company: 'scan-company', email: 'scan-email', phone: 'scan-phone', country: 'scan-country', website: 'scan-website' };
    Object.entries(fields).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el && data[key]) el.value = data[key];
    });
}

function addToQueueDisplay(filename, base64) {
    const queue = document.getElementById('card-queue');
    const count = document.getElementById('queue-count');
    if (!queue) return;

    // Remove placeholder
    const placeholder = queue.querySelector('div');
    if (placeholder && placeholder.textContent.includes('上传名片')) placeholder.remove();

    const item = document.createElement('div');
    item.className = 'flex items-center gap-2 bg-slate-800/50 rounded p-1.5';
    item.innerHTML = `
        <img src="${base64}" class="w-10 h-6 object-cover rounded">
        <span class="text-[10px] text-gray-400 truncate flex-1">${filename}</span>
        <span class="text-[10px] text-green-400">✓</span>`;
    queue.appendChild(item);

    const items = queue.querySelectorAll('div:not(.placeholder)').length;
    if (count) count.textContent = `${items} 张已扫`;
}

// ========================================
// Save Lead
// ========================================
function collectScanFormData() {
    return {
        id: 'lead_' + Date.now(),
        expoId: currentExpoId,
        name: document.getElementById('scan-name')?.value.trim() || '',
        title: document.getElementById('scan-title')?.value.trim() || '',
        company: document.getElementById('scan-company')?.value.trim() || '',
        email: document.getElementById('scan-email')?.value.trim() || '',
        phone: document.getElementById('scan-phone')?.value.trim() || '',
        country: document.getElementById('scan-country')?.value.trim() || '',
        website: document.getElementById('scan-website')?.value.trim() || '',
        product: document.getElementById('scan-product')?.value.trim() || '',
        interest: document.getElementById('scan-interest')?.value || 'Medium',
        notes: document.getElementById('scan-notes')?.value.trim() || '',
        cardImage: pendingCardBase64 || null,
        followUpSent: false,
        followUpPlan: null,
        createdAt: new Date().toISOString()
    };
}

function saveScannedLead() {
    const lead = collectScanFormData();
    if (!lead.name && !lead.company) {
        if (typeof showToast === 'function') showToast('请至少填写姓名或公司名', 'warning');
        return;
    }

    appendExpoLead(lead);
    resetScanForm();
    pendingCardBase64 = null;
    if (typeof showToast === 'function') showToast(`✅ 已保存: ${lead.name || lead.company}`, 'success');

    // Refresh panel
    if (currentExpoId) renderBizcardPanel(currentExpoId);
}

async function saveScannedLeadAndPlan() {
    const lead = collectScanFormData();
    if (!lead.name && !lead.company) {
        if (typeof showToast === 'function') showToast('请至少填写姓名或公司名', 'warning');
        return;
    }

    if (typeof showToast === 'function') showToast('🤖 AI 正在生成跟进计划...', 'info');

    try {
        lead.followUpPlan = await generateFollowUpPlan(lead);
    } catch (e) {
        console.warn('Follow-up plan generation failed:', e);
    }

    appendExpoLead(lead);
    resetScanForm();
    pendingCardBase64 = null;

    // Show plan in toast if generated
    if (lead.followUpPlan) {
        if (typeof showToast === 'function') showToast(`✅ 已保存 + 生成 ${lead.followUpPlan.length} 步跟进计划`, 'success');
    } else {
        if (typeof showToast === 'function') showToast(`✅ 已保存: ${lead.name || lead.company}`, 'success');
    }

    if (currentExpoId) renderBizcardPanel(currentExpoId);
}

function resetScanForm() {
    ['scan-name', 'scan-title', 'scan-company', 'scan-email', 'scan-phone', 'scan-country', 'scan-website', 'scan-product', 'scan-notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const interestEl = document.getElementById('scan-interest');
    if (interestEl) interestEl.value = 'Medium';

    const preview = document.getElementById('scanner-card-preview');
    const dropContent = document.getElementById('card-drop-content');
    if (preview) { preview.src = ''; preview.classList.add('hidden'); }
    if (dropContent) dropContent.classList.remove('hidden');
}

// ========================================
// Follow-Up Plan Generation
// ========================================
async function generateFollowUpPlan(lead) {
    const prompt = `
You are a B2B foreign trade sales expert. Create a 4-step follow-up plan for this exhibition contact:

Contact: ${lead.name || 'Unknown'} | ${lead.title || ''} | ${lead.company || ''}
Interest Level: ${lead.interest}
Product Interest: ${lead.product || 'General'}
Notes: ${lead.notes || 'None'}

Generate a 4-step follow-up sequence. Return ONLY valid JSON array:
[
  {
    "step": 1,
    "timing": "当天/展后24小时内",
    "action": "发送感谢邮件",
    "subject": "Great Meeting You at [展会] - [公司名]",
    "keyPoints": ["感谢相遇", "附上产品资料", "提出下一步"],
    "channel": "email"
  },
  {
    "step": 2,
    "timing": "展后3-5天",
    "action": "发送报价/样品邀请",
    "subject": "...",
    "keyPoints": ["...", "..."],
    "channel": "email"
  },
  {
    "step": 3,
    "timing": "展后2周",
    "action": "WhatsApp/电话跟进",
    "subject": null,
    "keyPoints": ["...", "..."],
    "channel": "whatsapp"
  },
  {
    "step": 4,
    "timing": "展后1个月",
    "action": "最终跟进/放弃评估",
    "subject": "...",
    "keyPoints": ["...", "..."],
    "channel": "email"
  }
]`;

    const result = await callGeminiAPI(prompt + '\n\nReturn valid JSON array ONLY.');
    if (!result) return null;

    const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
}

async function generateAllFollowUps() {
    const leads = getExpoLeads(currentExpoId).filter(l => !l.followUpPlan);
    if (leads.length === 0) {
        if (typeof showToast === 'function') showToast('所有联系人已有跟进计划', 'info');
        return;
    }

    if (typeof showToast === 'function') showToast(`🤖 正在为 ${leads.length} 位联系人生成跟进计划...`, 'info');

    for (const lead of leads) {
        try {
            const plan = await generateFollowUpPlan(lead);
            if (plan) {
                updateExpoLead(lead.id, { followUpPlan: plan });
            }
        } catch (e) {
            console.warn('Failed for', lead.name, e);
        }
    }

    if (typeof showToast === 'function') showToast('✅ 批量跟进计划生成完毕', 'success');
    if (currentExpoId) renderBizcardPanel(currentExpoId);
}

// ========================================
// View Lead Detail & Quick Follow-up
// ========================================
function viewLeadDetail(leadId) {
    const leads = getExpoLeads(currentExpoId);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    document.getElementById('lead-detail-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'lead-detail-modal';
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.onclick = e => { if (e.target === modal) modal.remove(); };

    const planHtml = lead.followUpPlan ? `
    <div class="mt-4">
        <div class="text-xs font-bold text-purple-400 uppercase mb-2">📋 跟进计划</div>
        <div class="space-y-2">
            ${lead.followUpPlan.map(step => `
            <div class="flex gap-3 bg-slate-800/50 rounded-lg p-3">
                <div class="w-7 h-7 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400 flex-shrink-0">${step.step}</div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-xs font-bold text-white">${step.action}</span>
                        <span class="text-[10px] text-gray-500">${step.timing}</span>
                        <span class="text-[10px] ${step.channel === 'email' ? 'text-blue-400' : 'text-green-400'}">${step.channel === 'email' ? '📧' : '💬'}</span>
                    </div>
                    ${step.subject ? `<div class="text-[10px] text-gray-400 mb-1">主题: ${step.subject}</div>` : ''}
                    <div class="text-[10px] text-gray-500">${(step.keyPoints || []).join(' · ')}</div>
                </div>
            </div>`).join('')}
        </div>
    </div>` : `<div class="mt-4 text-center py-4">
        <button onclick="quickFollowUp('${lead.id}')" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition">🤖 立即生成跟进计划</button>
    </div>`;

    modal.innerHTML = `
    <div class="bg-slate-900 rounded-2xl w-full max-w-xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center p-5 border-b border-gray-700">
            <h2 class="font-bold text-white">${lead.name || '未知联系人'} — 详情</h2>
            <button onclick="document.getElementById('lead-detail-modal').remove()" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-5 space-y-3">
            ${lead.cardImage ? `<img src="${lead.cardImage}" class="w-full h-32 object-contain bg-slate-800 rounded-xl border border-gray-700 mb-4">` : ''}
            <div class="grid grid-cols-2 gap-3 text-sm">
                ${[
            ['姓名', lead.name], ['职位', lead.title], ['公司', lead.company],
            ['国家', lead.country], ['邮箱', lead.email], ['电话', lead.phone],
            ['网站', lead.website], ['意向产品', lead.product]
        ].filter(([, v]) => v).map(([k, v]) => `
                <div class="bg-slate-800/50 rounded-lg p-2">
                    <div class="text-[10px] text-gray-500">${k}</div>
                    <div class="text-white text-xs font-medium mt-0.5">${v}</div>
                </div>`).join('')}
            </div>
            ${lead.notes ? `<div class="bg-slate-800/50 rounded-lg p-3"><div class="text-[10px] text-gray-500 mb-1">备注</div><div class="text-xs text-gray-300">${lead.notes}</div></div>` : ''}
            ${planHtml}

            <div class="flex gap-2 pt-2">
                <button onclick="markFollowUpSent('${lead.id}')" class="flex-1 py-2 bg-green-600/30 hover:bg-green-600/50 text-green-400 text-sm rounded-lg transition ${lead.followUpSent ? 'opacity-50' : ''}">
                    ${lead.followUpSent ? '✅ 已标记跟进' : '✔️ 标记已跟进'}
                </button>
                <button onclick="exportSingleLeadToCRM('${lead.id}')" class="flex-1 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 text-sm rounded-lg transition">
                    💾 加入客户管道
                </button>
            </div>
        </div>
    </div>`;

    document.body.appendChild(modal);
}

async function quickFollowUp(leadId) {
    const leads = getExpoLeads(currentExpoId);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (typeof showToast === 'function') showToast('🤖 AI 生成跟进计划...', 'info');
    try {
        const plan = await generateFollowUpPlan(lead);
        if (plan) {
            updateExpoLead(leadId, { followUpPlan: plan });
            if (typeof showToast === 'function') showToast('✅ 跟进计划已生成，点击"详情"查看', 'success');
            if (currentExpoId) renderBizcardPanel(currentExpoId);
        }
    } catch (e) {
        if (typeof showToast === 'function') showToast('生成失败: ' + e.message, 'error');
    }
}

function markFollowUpSent(leadId) {
    updateExpoLead(leadId, { followUpSent: true });
    document.getElementById('lead-detail-modal')?.remove();
    if (typeof showToast === 'function') showToast('✅ 已标记为已跟进', 'success');
    if (currentExpoId) renderBizcardPanel(currentExpoId);
}

// ========================================
// Export to CRM
// ========================================
function exportLeadsToCRM() {
    const leads = getExpoLeads(currentExpoId);
    if (leads.length === 0) {
        if (typeof showToast === 'function') showToast('暂无名片数据', 'warning');
        return;
    }

    const pipeline = JSON.parse(localStorage.getItem('tds_pipeline_customers') || '[]');
    let added = 0;

    leads.forEach(lead => {
        if (!pipeline.find(p => p.email && p.email === lead.email)) {
            pipeline.unshift({
                id: Date.now() + Math.random(),
                name: lead.name || '未知',
                company: lead.company || '',
                country: lead.country || '',
                email: lead.email || '',
                phone: lead.phone || '',
                product: lead.product || '',
                stage: 'new',
                score: lead.interest === 'High' ? 80 : lead.interest === 'Medium' ? 50 : 20,
                notes: `[展会联系人] ${lead.notes || ''}`,
                source: 'exhibition',
                followUpCount: 0,
                lastContact: new Date().toISOString(),
                nextFollowUp: new Date(Date.now() + 2 * 86400000).toISOString(),
                createdAt: new Date().toISOString()
            });
            added++;
        }
    });

    localStorage.setItem('tds_pipeline_customers', JSON.stringify(pipeline));
    if (typeof renderPipeline === 'function') renderPipeline();
    if (typeof showToast === 'function') showToast(`✅ 已导入 ${added} 位联系人到客户管道`, 'success');
}

function exportSingleLeadToCRM(leadId) {
    const leads = getExpoLeads(currentExpoId);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const pipeline = JSON.parse(localStorage.getItem('tds_pipeline_customers') || '[]');
    pipeline.unshift({
        id: Date.now(),
        name: lead.name || '未知',
        company: lead.company || '',
        country: lead.country || '',
        email: lead.email || '',
        phone: lead.phone || '',
        product: lead.product || '',
        stage: 'new',
        score: lead.interest === 'High' ? 80 : lead.interest === 'Medium' ? 50 : 20,
        notes: `[展会联系人] ${lead.notes || ''}`,
        source: 'exhibition',
        followUpCount: 0,
        lastContact: new Date().toISOString(),
        nextFollowUp: new Date(Date.now() + 2 * 86400000).toISOString(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('tds_pipeline_customers', JSON.stringify(pipeline));
    if (typeof renderPipeline === 'function') renderPipeline();
    document.getElementById('lead-detail-modal')?.remove();
    if (typeof showToast === 'function') showToast('✅ 已加入客户管道', 'success');
}

// ========================================
// Lead Storage Helpers
// ========================================
function getExpoLeads(expoId) {
    const all = JSON.parse(localStorage.getItem(EXPO_LEADS_KEY) || '[]');
    return expoId ? all.filter(l => l.expoId === expoId) : all;
}

function appendExpoLead(lead) {
    const all = JSON.parse(localStorage.getItem(EXPO_LEADS_KEY) || '[]');
    all.unshift(lead);
    localStorage.setItem(EXPO_LEADS_KEY, JSON.stringify(all));
}

function updateExpoLead(leadId, updates) {
    const all = JSON.parse(localStorage.getItem(EXPO_LEADS_KEY) || '[]');
    const idx = all.findIndex(l => l.id === leadId);
    if (idx >= 0) {
        all[idx] = { ...all[idx], ...updates };
        localStorage.setItem(EXPO_LEADS_KEY, JSON.stringify(all));
    }
}

// ========================================
// Expose globally
// ========================================
window.renderBizcardPanel = renderBizcardPanel;
window.openCardScanner = openCardScanner;
window.handleCardDrop = handleCardDrop;
window.handleScannerUpload = handleScannerUpload;
window.saveScannedLead = saveScannedLead;
window.saveScannedLeadAndPlan = saveScannedLeadAndPlan;
window.filterExpoLeads = filterExpoLeads;
window.viewLeadDetail = viewLeadDetail;
window.quickFollowUp = quickFollowUp;
window.markFollowUpSent = markFollowUpSent;
window.generateAllFollowUps = generateAllFollowUps;
window.exportLeadsToCRM = exportLeadsToCRM;
window.exportSingleLeadToCRM = exportSingleLeadToCRM;
