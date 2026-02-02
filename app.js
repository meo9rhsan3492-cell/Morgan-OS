/**
 * Morgan Marketing OS - Core Logic (app.js)
 * v18.2 Phase 11 Deep Optimization
 */
// ==========================================
// 1. Global State & Initialization
// ==========================================
let productDB = JSON.parse(localStorage.getItem('tds_product_db') || '[]');
let expos = JSON.parse(localStorage.getItem('tds_expos') || '[]');
let knowledgeBase = JSON.parse(localStorage.getItem('tds_knowledge_base') || '[]');
// Chart Instances
let budgetChartIns = null;
let cplChartIns = null;
(function init() {
    loadTheme();
    updateDropdowns();
    renderExpos(); // Ensures expo list is rendered
    renderDB();
    renderKeywords();
    renderKnowledgeDocs();
    updateKnowledgeStats();
    // Budget Init
    const total = localStorage.getItem('tds_total') || 266664;
    const spent = localStorage.getItem('tds_spent') || 79600;
    const totalInput = document.getElementById('total-budget');
    const spentInput = document.getElementById('spent-amount');
    // Check if elements exist before setting values to avoid null errors
    if (totalInput) totalInput.value = total;
    if (spentInput) spentInput.value = spent;
    initCharts(); // Init Charts first
    updateDashboard(); // Then update data
    setInterval(updateDashboard, 5000);
    // Initial API Check
    if (!localStorage.getItem('tds_gemini_api_key')) {
        showToast('⚠️ 未配置 Gemini API Key，部分 AI 功能不可用', 'warning');
    }
})();
// ==========================================
// 0. Pro UI: Charts
// ==========================================
function initCharts() {
    // 1. Budget Chart (Doughnut/Pie simplified to Bar for "Burn Rate")
    const ctxBudget = document.getElementById('budgetChart');
    if (ctxBudget) {
        budgetChartIns = new Chart(ctxBudget, {
            type: 'bar',
            data: {
                labels: ['Total', 'Spent'],
                datasets: [{
                    label: 'Budget',
                    data: [0, 0],
                    backgroundColor: ['#3b82f6', '#ef4444'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false, beginAtZero: true }
                }
            }
        });
    }
    // 2. CPL Chart (Line Trend)
    const ctxCPL = document.getElementById('cplChart');
    if (ctxCPL) {
        // Mock Trend Data
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = [45, 42, 48, 35, 38, 30, 32]; // Mock data trending down
        cplChartIns = new Chart(ctxCPL, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'CPL ($)',
                    data: data,
                    borderColor: '#22c55e', // Green
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }
}
// ==========================================
// 2. UI & Navigation Logic
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById('nav-' + tabId).classList.add('active');
    if (tabId === 'exhibition') renderExpos();
    if (tabId === 'dashboard') updateDashboard();
}
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-mode');
    if (isLight) {
        body.classList.remove('light-mode');
        document.getElementById('theme-icon').innerText = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        document.getElementById('theme-icon').innerText = '☀️';
        localStorage.setItem('theme', 'light');
    }
}
function loadTheme() {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.innerText = '☀️';
    }
}
function toggleProductForm() {
    const container = document.getElementById('product-form-container');
    const icon = document.getElementById('form-toggle-icon');
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        icon.innerText = '▲';
    } else {
        container.classList.add('hidden');
        icon.innerText = '▼';
    }
}
// Toast Notification System (UX Upgrade)
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    const colors = {
        'info': 'border-blue-500 text-blue-400',
        'success': 'border-green-500 text-green-400',
        'warning': 'border-yellow-500 text-yellow-400',
        'error': 'border-red-500 text-red-400'
    };
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 z-50 p-4 rounded bg-slate-800 border ${colors[type] || colors.info} shadow-lg transition-all transform translate-y-[-20px] opacity-0 flex items-center gap-3`;
    toast.innerHTML = `
        <span class="text-xl">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span class="font-bold text-sm">${message}</span>
    `;
    document.body.appendChild(toast);
    // Animate in
    setTimeout(() => toast.classList.remove('translate-y-[-20px]', 'opacity-0'), 10);
    // Auto remove
    setTimeout(() => {
        toast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
// Replace all alerts with showToast where appropriate
window.alert = function (msg) { showToast(msg, 'info'); }
// ==========================================
// 3. Product Database Functions
// ==========================================
function saveProduct() {
    const name = document.getElementById('db-name').value;
    const pain = document.getElementById('db-pain').value;
    const feat = document.getElementById('db-feat').value;
    if (!name) return showToast('请输入产品型号', 'error');
    productDB.push({ name, pain, feat });
    localStorage.setItem('tds_product_db', JSON.stringify(productDB));
    renderDB();
    document.getElementById('db-name').value = '';
    document.getElementById('db-pain').value = '';
    document.getElementById('db-feat').value = '';
    showToast('产品已存入知识库', 'success');
}
function renderDB() {
    const list = document.getElementById('product-list');
    updateDropdowns();
    if (productDB.length === 0) {
        list.innerHTML = '<div class="col-span-3 text-center py-10 text-sm" style="color: var(--text-secondary);">暂无产品数据</div>';
        return;
    }
    list.innerHTML = productDB.map((p, i) => `
        <div class="p-4 rounded border" style="background: var(--bg-secondary); border-color: var(--border-primary);">
            <div class="flex justify-between mb-2">
                <h4 class="font-bold" style="color: var(--text-primary);">${p.name}</h4>
                <button onclick="delProd(${i})" class="text-red-500 hover:text-red-400">×</button>
            </div>
            <p class="text-xs" style="color: var(--text-secondary);">${p.pain}</p>
        </div>
    `).join('');
}
function updateDropdowns() {
    const opts = '<option value="">-- 选择 --</option>' + productDB.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
    const planProd = document.getElementById('plan-prod');
    const expoProd = document.getElementById('expo-prod');
    if (planProd) planProd.innerHTML = opts;
    if (expoProd) expoProd.innerHTML = opts;
}
function delProd(i) {
    if (confirm('确定删除?')) {
        productDB.splice(i, 1);
        localStorage.setItem('tds_product_db', JSON.stringify(productDB));
        renderDB();
        showToast('已删除', 'info');
    }
}
function loadProdToPlan() {
    const idx = document.getElementById('plan-prod').value;
    if (idx === "") return;
    const p = productDB[idx];
    localStorage.setItem('current_plan_product', JSON.stringify(p));
}
// ==========================================
// 4. Exhibition War Room (Fixed Logic)
// ==========================================
// ==========================================
// 4. Exhibition War Room (Upgraded Layout)
// ==========================================
function addExpo() {
    const name = document.getElementById('expo-name').value;
    const booth = document.getElementById('expo-booth').value;
    const date = document.getElementById('expo-date').value;
    const prodIdx = document.getElementById('expo-prod').value;
    let prodName = '全系列';
    if (prodIdx !== "") {
        prodName = productDB[prodIdx].name;
    }
    if (!name || !date) return showToast('请填写展会名称和日期', 'error');
    // New: Checklist init
    const checklist = {
        visa: false, flight: false, hotel: false,
        poster: false, namecard: false, catalogue: false,
        samples: false, gift: false
    };
    expos.push({ name, booth, date, prod: prodName, checklist });
    localStorage.setItem('tds_expos', JSON.stringify(expos));
    renderExpos();
    updateDashboard();
    document.getElementById('expo-name').value = '';
    document.getElementById('expo-booth').value = '';
    document.getElementById('expo-date').value = '';
    document.getElementById('expo-prod').value = '';
    showToast('作战计划已添加', 'success');
}
function renderExpos() {
    const list = document.getElementById('expo-list-container');
    if (!list) return;
    if (expos.length === 0) {
        list.innerHTML = '<div class="text-center py-10" style="color: var(--text-secondary);">暂无计划</div>';
        return;
    }
    expos.sort((a, b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = expos.map((ex, i) => `
        <div class="panel mb-2 p-3 cursor-pointer hover:bg-slate-800 transition border-l-4 border-transparent hover:border-blue-500" onclick="showExpoDetail(${i})">
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-bold text-sm" style="color: var(--text-primary);">${ex.name}</div>
                    <div class="text-xs mt-1" style="color: var(--text-secondary);">
                        <span>📅 ${ex.date}</span>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); removeExpo(${i})" class="text-red-500 hover:text-red-400 text-xs">×</button>
            </div>
        </div>
    `).join('');
}
function showExpoDetail(i) {
    const ex = expos[i];
    document.getElementById('detail-title').innerText = ex.name + ` (Booth: ${ex.booth || 'TBD'})`;
    // Actions header
    document.getElementById('detail-actions').innerHTML = `
        <button onclick="renderExpoKit(${i})" class="btn-primary text-xs py-1 px-3 bg-purple-600">⚡ AI 作战包</button>
        <button onclick="renderExpoChecklist(${i})" class="btn-primary text-xs py-1 px-3 bg-blue-600">📋 筹备检查单</button>
    `;
    // Default view: Checklist or Kit? Let's show Checklist by default
    renderExpoChecklist(i);
}
function renderExpoChecklist(i) {
    const ex = expos[i];
    // Ensure checklist object exists for legacy data
    if (!ex.checklist) {
        ex.checklist = {
            visa: false, flight: false, hotel: false,
            poster: false, namecard: false, catalogue: false,
            samples: false, gift: false
        };
    }
    const items = [
        { k: 'visa', l: '🛂 签证办理' },
        { k: 'flight', l: '✈️ 机票预订' },
        { k: 'hotel', l: '🏨 酒店确认' },
        { k: 'poster', l: '🖼️ 海报设计' },
        { k: 'namecard', l: '📇 名片印刷' },
        { k: 'catalogue', l: '📚 目录手册' },
        { k: 'samples', l: '📦 样品打包' },
        { k: 'gift', l: '🎁 伴手礼' }
    ];
    let html = `
        <div class="grid grid-cols-2 gap-4 animate-fade-in">
    `;
    items.forEach(item => {
        const checked = ex.checklist[item.k] ? 'checked' : '';
        const bg = ex.checklist[item.k] ? 'bg-green-900/30 border-green-500/50' : 'bg-slate-800 border-gray-700';
        html += `
            <div class="p-4 rounded border ${bg} cursor-pointer transition flex items-center gap-3 hover:bg-slate-700" 
                 onclick="toggleExpoCheck(${i}, '${item.k}')">
                <input type="checkbox" ${checked} class="w-5 h-5 cursor-pointer">
                <span class="${checked ? 'line-through text-gray-500' : 'text-gray-200'} font-bold">${item.l}</span>
            </div>
        `;
    });
    html += `</div>`;
    // Progress bar
    const done = Object.values(ex.checklist).filter(v => v).length;
    const total = 8;
    const pct = Math.round((done / total) * 100);
    html = `
        <div class="mb-6">
            <div class="flex justify-between text-xs mb-1 text-gray-400">
                <span>筹备进度</span>
                <span>${pct}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2.5">
                <div class="bg-green-500 h-2.5 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
        </div>
    ` + html;
    document.getElementById('detail-content').innerHTML = html;
}
function toggleExpoCheck(i, key) {
    expos[i].checklist[key] = !expos[i].checklist[key];
    localStorage.setItem('tds_expos', JSON.stringify(expos));
    renderExpoChecklist(i); // Re-render to update UI state
}
// Wrapper for existing AI Kit logic to fit new layout
function renderExpoKit(i) {
    const div = document.getElementById('detail-content');
    div.innerHTML = `<div id="expo-kit-container-${i}" class="text-sm"></div>`;
    // Call original logic but target the new container
    generateExpoKit(i, `expo-kit-container-${i}`);
}
function removeExpo(i) {
    if (confirm('确定删除?')) {
        expos.splice(i, 1);
        localStorage.setItem('tds_expos', JSON.stringify(expos));
        renderExpos(); // Refresh list
        document.getElementById('detail-content').innerHTML = '<div class="text-center py-20 text-gray-500">已删除</div>';
        updateDashboard();
        showToast('计划已删除', 'info');
    }
}
// ==========================================
// 5. Keyword Vault (Fixed Syntax)
// ==========================================
function saveKeywords() {
    localStorage.setItem('tds_keywords', document.getElementById('vault-input').value);
    renderKeywords();
    showToast('关键词库已更新', 'success');
}
function renderKeywords() {
    const txt = localStorage.getItem('tds_keywords') || "";
    const input = document.getElementById('vault-input');
    const display = document.getElementById('vault-display');
    const count = document.getElementById('kw-count');
    if (input) input.value = txt;
    if (display) display.innerText = txt || "暂无数据";
    if (count) count.innerText = txt.split('\n').filter(l => l.trim()).length;
}
function formatKeywords(type) {
    const input = document.getElementById('vault-input');
    const v = input.value;
    if (!v) return;
    const lines = v.split('\n').filter(l => l.trim());
    let res = '';
    if (type === 'exact') {
        res = lines.map(l => `[${l}]`).join('\n');
    } else if (type === 'phrase') {
        res = lines.map(l => `"${l}"`).join('\n');
    }
    input.value = res;
    saveKeywords();
}
// ==========================================
// 6. Analytics & Budget
// ==========================================
function calcDoctor() {
    const s = parseFloat(document.getElementById('ad-spend').value);
    const l = parseFloat(document.getElementById('leads-count').value);
    if (s && l) {
        const cpl = s / l;
        document.getElementById('val-cpl').innerText = '$' + cpl.toFixed(1);
        localStorage.setItem('tds_last_cpl', '$' + cpl.toFixed(1));
        updateDashboard();
    } else {
        showToast('请输入有效的花费和线索数', 'warning');
    }
}
function updateBudget() {
    const t = parseFloat(document.getElementById('total-budget').value) || 266664;
    const s = parseFloat(document.getElementById('spent-amount').value) || 79600;
    document.getElementById('remaining-amount').innerText = '¥' + (t - s).toLocaleString();
    localStorage.setItem('tds_total', t);
    localStorage.setItem('tds_spent', s);
    updateDashboard();
}
// [Moved to app_part_radar.js]
function updateDashboard() {
    renderRadar(); // Call Radar Update
    // 1. Budget
    const total = parseFloat(localStorage.getItem('tds_total') || 266664);
    const spent = parseFloat(localStorage.getItem('tds_spent') || 79600);
    const remaining = total - spent;
    const dashBudget = document.getElementById('dash-budget');
    if (dashBudget) {
        dashBudget.innerText = '¥' + remaining.toLocaleString();
        document.getElementById('dash-budget-detail').innerText = `总:¥${total.toLocaleString()} · 已用:¥${spent.toLocaleString()}`;
    }
    // 2. Expos
    const dashExpoName = document.getElementById('dash-expo-name');
    if (dashExpoName) {
        if (expos.length > 0) {
            const now = new Date();
            let nearestExpo = null;
            let minDays = Infinity;
            expos.forEach(ex => {
                const expoDate = new Date(ex.date);
                const diffDays = Math.ceil((expoDate - now) / (1000 * 60 * 60 * 24));
                const lastCPL = localStorage.getItem('tds_last_cpl') || '---';
                const cplEl = document.getElementById('dash-cpl');
                const statusEl = document.getElementById('dash-cpl-status');
                if (cplEl) {
                    cplEl.innerText = lastCPL;
                    if (lastCPL !== '---') {
                        const cplValue = parseFloat(lastCPL.replace('$', '').replace('¥', ''));
                        // Update Chart Color based on health
                        if (cplChartIns) {
                            const color = cplValue <= 400 ? '#22c55e' : (cplValue <= 600 ? '#eab308' : '#ef4444');
                            cplChartIns.data.datasets[0].borderColor = color;
                            cplChartIns.data.datasets[0].backgroundColor = color + '20';
                            cplChartIns.update();
                        }
                        if (cplValue <= 400) {
                            // cplEl.className = 'text-4xl font-black mt-2 text-green-500'; // Removed for Chart UI
                            statusEl.innerText = '✅ 健康 - 继续保持';
                            statusEl.className = 'text-xs mt-2 text-right text-green-400';
                        } else if (cplValue <= 600) {
                            // cplEl.className = 'text-4xl font-black mt-2 text-yellow-500';
                            statusEl.innerText = '⚠️ 警告 - 需优化';
                            statusEl.className = 'text-xs mt-2 text-right text-yellow-400';
                        } else {
                            // cplEl.className = 'text-4xl font-black mt-2 text-red-500';
                            statusEl.innerText = '🚨 危险 - 立即优化';
                            statusEl.className = 'text-xs mt-2 text-right text-red-400';
                        }
                    } else {
                        statusEl.innerText = '等待数据...';
                    }
                }
                // 4. Update Charts
                if (budgetChartIns) {
                    budgetChartIns.data.datasets[0].data = [total, spent];
                    budgetChartIns.update();
                }
            });
            // ==========================================
            // 7. Data Backup & Resume (Robust)
            // ==========================================
            function exportData() {
                const backup = {};
                // Auto-capture all TDS keys
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('tds_')) {
                        backup[key] = localStorage.getItem(key);
                    }
                }
                // Metadata
                backup['_meta'] = {
                    version: '18.2',
                    date: new Date().toISOString(),
                    user: 'admin'
                };
                const b = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(b);
                a.download = `tds_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                showToast('全站数据备份已下载', 'success');
            }
            function importData(input) {
                const r = new FileReader();
                r.onload = e => {
                    try {
                        const data = JSON.parse(e.target.result);
                        let count = 0;
                        // Restore keys
                        Object.keys(data).forEach(k => {
                            if (k.startsWith('tds_')) {
                                localStorage.setItem(k, data[k]);
                                count++;
                            }
                        });
                        showToast(`成功恢复 ${count} 项数据，系统即将重启`, 'success');
                        setTimeout(() => location.reload(), 1500);
                    } catch (err) {
                        showToast('备份文件损坏或格式无效', 'error');
                    }
                };
                r.readAsText(input.files[0]);
            }
            // ==========================================
            // 8. Knowledge Base Core
            // ==========================================
            let kbViewMode = 'list'; // 'list' or 'qa'
            function toggleKBView() {
                kbViewMode = kbViewMode === 'list' ? 'qa' : 'list';
                document.getElementById('kb-view-btn').innerText = kbViewMode === 'qa' ? '📋 切换到 列表模式' : '📋 切换到 QA话术模式';
                // Refresh view
                const query = document.getElementById('search-input').value;
                if (query) {
                    searchKnowledge(query);
                } else {
                    renderKnowledgeDocs(); // Fallback if no search
                }
            }
            function handleKnowledgeFileUpload(event) {
                const files = event.target.files;
                if (!files || files.length === 0) return;
                let processed = 0;
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const content = e.target.result;
                        const doc = {
                            id: Date.now() + Math.random(),
                            filename: file.name,
                            type: file.name.split('.').pop().toLowerCase(),
                            uploadDate: new Date().toISOString().split('T')[0],
                            content: content,
                            size: content.length,
                            qaPairs: [] // New: Store extracted QAs
                        };
                        knowledgeBase.push(doc);
                        localStorage.setItem('tds_knowledge_base', JSON.stringify(knowledgeBase));
                        processed++;
                        if (processed === files.length) {
                            renderKnowledgeDocs();
                            updateKnowledgeStats();
                            showToast(`成功上传 ${files.length} 个文档`, 'success');
                        }
                    };
                    reader.readAsText(file);
                });
            }
            function renderKnowledgeDocs() {
                const container = document.getElementById('knowledge-docs');
                if (!container) return;
                if (knowledgeBase.length === 0) {
                    container.innerHTML = '<div class="text-center py-16 text-sm" style="color: var(--text-secondary);"><div class="text-4xl mb-2">📄</div>暂无文档</div>';
                    return;
                }
                container.innerHTML = knowledgeBase.map((doc, i) => `
        <div class="mb-3 p-3 rounded border hover:border-blue-500 transition" style="background: var(--bg-secondary); border-color: var(--border-primary);">
            <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                    <div class="font-bold text-sm truncate" style="color: var(--text-primary);" title="${doc.filename}">${doc.filename}</div>
                    <div class="text-xs mt-1" style="color: var(--text-secondary);">${doc.uploadDate} · ${(doc.size / 1024).toFixed(1)}KB</div>
                </div>
                <button onclick="viewDocument(${i})" class="ml-2 text-blue-400 hover:text-blue-300 text-xs">查看</button>
                <button onclick="deleteDocument(${i})" class="ml-2 text-red-400 hover:text-red-300 text-xs">删除</button>
            </div>
            <div class="flex gap-2 mt-2 mb-2">
                <button onclick="extractUSP(${i})" class="flex-1 py-1 rounded border border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/20 text-xs transition">
                    🔑 提取卖点
                </button>
                <button onclick="generateAutoFAQ(${i})" class="flex-1 py-1 rounded border border-purple-600/50 text-purple-400 hover:bg-purple-600/20 text-xs transition">
                    ❓ 生成 Q&A
                </button>
            </div>
            <div id="kb-ai-result-${i}" class="text-xs text-gray-300 hidden mt-2 p-2 bg-black/40 rounded border border-gray-700"></div>
            <div class="text-xs truncate" style="color: var(--text-secondary);">${doc.content.substring(0, 60)}...</div>
        </div>
    `).join('');
            }
            function deleteDocument(index) {
                if (confirm('确定删除这个文档吗？')) {
                    knowledgeBase.splice(index, 1);
                    localStorage.setItem('tds_knowledge_base', JSON.stringify(knowledgeBase));
                    renderKnowledgeDocs();
                    updateKnowledgeStats();
                    showToast('文档已删除', 'info');
                }
            }
            function updateKnowledgeStats() {
                const docCount = document.getElementById('doc-count');
                const totalChars = document.getElementById('total-chars');
                if (docCount) docCount.innerText = knowledgeBase.length;
                if (totalChars) totalChars.innerText = knowledgeBase.reduce((sum, doc) => sum + doc.size, 0).toLocaleString();
            }
            function viewDocument(index) {
                const doc = knowledgeBase[index];
                const modal = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onclick="this.remove()">
            <div class="panel max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl" onclick="event.stopPropagation()">
                <div class="flex justify-between items-start mb-4 border-b border-gray-700 pb-2">
                    <div>
                        <h3 class="text-xl font-bold text-white">${doc.filename}</h3>
                        <p class="text-xs mt-1 text-gray-400">${doc.uploadDate} · ${(doc.size / 1024).toFixed(1)}KB</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-lg text-gray-400 hover:text-white transition">✕</button>
                </div>
                <div class="flex-1 overflow-auto p-4 bg-[#0f172a] rounded font-mono text-sm leading-relaxed text-gray-300">
                    ${doc.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
            </div>
        </div>
    `;
                document.body.insertAdjacentHTML('beforeend', modal);
            }
            function searchKnowledge(query) {
                const resultsContainer = document.getElementById('search-results');
                if (!query || query.trim() === '') {
                    // If in QA mode, show random/all QAs? For now just show prompt
                    resultsContainer.innerHTML = '<div class="text-center py-16 text-sm" style="color: var(--text-secondary);"><div class="text-4xl mb-2">🔎</div>输入关键词开始搜索</div>';
                    return;
                }
                const results = knowledgeBase.filter(doc => {
                    const searchText = (doc.filename + ' ' + doc.content).toLowerCase();
                    return searchText.includes(query.toLowerCase());
                });
                if (results.length === 0) {
                    resultsContainer.innerHTML = '<div class="text-center py-10 text-sm" style="color: var(--text-secondary);">未找到相关内容</div>';
                    return;
                }
                if (kbViewMode === 'qa') {
                    // QA Card View
                    resultsContainer.innerHTML = results.map(doc => {
                        // Priority: stored QA pairs > simple match extraction
                        let contentHtml = '';
                        if (doc.qaPairs && doc.qaPairs.length > 0) {
                            // Format stored QAs
                            contentHtml = doc.qaPairs.map(qa => `
                    <div class="mb-2 pb-2 border-b border-gray-700 last:border-0">
                        <div class="font-bold text-yellow-500 mb-1">Q: ${qa.q}</div>
                        <div class="text-gray-300">A: ${qa.a}</div>
                        <button onclick="navigator.clipboard.writeText('${qa.a}'); showToast('话术已复制', 'success')" class="mt-1 text-[10px] text-blue-400 hover:text-white cursor-pointer">[复制话术]</button>
                    </div>
                 `).join('');
                        } else {
                            // Fallback to snippet
                            const snippet = extractSnippet(doc.content, query);
                            contentHtml = `
                    <div class="text-xs text-gray-400 mb-2">
                        暂无结构化 QA (请先点击 "生成 Q&A")
                    </div>
                    <div class="text-sm p-2 bg-black/20 rounded border border-gray-700">
                        ${highlightText(snippet, query)}
                    </div>
                `;
                        }
                        return `
                <div class="mb-3 p-4 rounded border border-purple-500/30 bg-purple-900/10">
                    <div class="font-bold text-sm mb-3 text-white flex items-center gap-2">
                        📄 ${doc.filename}
                    </div>
                    <div class="max-h-60 overflow-y-auto pr-1">
                        ${contentHtml}
                    </div>
                </div>
            `;
                    }).join('');
                } else {
                    // List View (Original)
                    resultsContainer.innerHTML = results.map((doc) => {
                        const snippet = extractSnippet(doc.content, query);
                        const index = knowledgeBase.findIndex(d => d.id === doc.id);
                        return `
                <div class="mb-3 p-3 rounded border hover:border-blue-500 transition cursor-pointer" 
                     style="background: var(--bg-secondary); border-color: var(--border-primary);"
                     onclick="viewDocument(${index})">
                    <div class="font-bold text-sm mb-1" style="color: var(--text-primary);">📄 ${doc.filename}</div>
                    <div class="text-xs" style="color: var(--text-secondary);">${highlightText(snippet, query)}</div>
                </div>
            `;
                    }).join('');
                }
            }
            function extractSnippet(content, query) {
                const index = content.toLowerCase().indexOf(query.toLowerCase());
                if (index === -1) return content.substring(0, 100) + '...';
                const start = Math.max(0, index - 40);
                const end = Math.min(content.length, index + query.length + 60);
                return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
            }
            function highlightText(text, query) {
                const regex = new RegExp(`(${query})`, 'gi');
                return text.replace(regex, '<span class="bg-yellow-500/30 text-yellow-200 px-1 rounded">$1</span>');
            }
            // ==========================================
            // 9. AI Integration (Gemini)
            // ==========================================
            function configureSettings() {
                const currentKey = localStorage.getItem('tds_gemini_api_key') || '';
                const currentPersona = localStorage.getItem('tds_target_audience') || '';
                // Using a cleaner modal
                const modal = `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onclick="this.remove()">
            <div class="panel w-full max-w-lg m-4 shadow-2xl" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">⚙️ 全局设置</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">✕</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-blue-400 uppercase mb-2">Google Gemini API Key</label>
                        <input type="password" id="settings-api-key" class="input-box bg-slate-900 border-slate-700" value="${currentKey}" placeholder="必填，用于驱动所有智能功能">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-blue-400 uppercase mb-2">目标受众 (Target Audience)</label>
                        <textarea id="settings-persona" class="input-box h-32 bg-slate-900 border-slate-700 leading-relaxed" placeholder="例如：北美中小企业主，关注降本增效，风格专业...">${currentPersona}</textarea>
                        <p class="text-xs mt-2 text-gray-500">💡 设定后，所有 AI 将自动扮演适应此受众的角色。</p>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-8">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 rounded text-gray-400 hover:text-white transition">取消</button>
                    <button onclick="saveSettings()" class="btn-primary">💾 保存配置</button>
                </div>
            </div>
        </div>
    `;
                document.body.insertAdjacentHTML('beforeend', modal);
            }
            function saveSettings() {
                const key = document.getElementById('settings-api-key').value;
                const persona = document.getElementById('settings-persona').value;
                localStorage.setItem('tds_gemini_api_key', key);
                localStorage.setItem('tds_target_audience', persona);
                showToast('全局配置已保存！AI 已更新', 'success');
                document.querySelector('.fixed.inset-0').remove();
            }
            async function callGeminiAPI(prompt) {
                const apiKey = localStorage.getItem('tds_gemini_api_key');
                if (!apiKey) {
                    if (confirm('需配置 API Key 才能使用此功能。去配置？')) {
                        configureSettings();
                    }
                    return null;
                }
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.7 }
                        })
                    });
                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.error?.message || 'Unknown API Error');
                    }
                    const data = await response.json();
                    return data.candidates[0]?.content?.parts[0]?.text || '';
                } catch (error) {
                    console.error('Gemini API Error:', error);
                    showToast(`AI 调用失败: ${error.message}`, 'error');
                    return null;
                }
            }
            function marked(text) {
                if (!text) return '';
                // A simplified markdown parser ensuring safety
                let html = text
                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-5 mb-3">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-blue-200">$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em class="text-gray-300">$1</em>')
                    .replace(/`([^`]+)`/gim, '<code class="bg-gray-800 text-pink-300 px-1 rounded font-mono text-xs">$1</code>')
                    .replace(/\n\n/gim, '</p><p class="mb-2">')
                    .replace(/\n/gim, '<br>');
                return html;
            }
            // ----------------------------------------
            // AI: Exhibition Kit
            // ----------------------------------------
            async function generateExpoKit(i, containerId) {
                const ex = expos[i];
                // Support dynamic container target or fallback to legacy ID
                const targetId = containerId || `expo-kit-${i}`;
                const kitDiv = document.getElementById(targetId);
                if (!kitDiv) return;
                const persona = localStorage.getItem('tds_target_audience') || '通用专业观众';
                kitDiv.innerHTML = '<div class="animate-pulse text-blue-400 flex items-center gap-2">🔄 AI 正在设计展会物料 (Slogan, Email, Pitch)...</div>';
                kitDiv.classList.remove('hidden');
                const prompt = `展会: ${ex.name} (展位: ${ex.booth})\n产品: ${ex.prod || '全系列'}\n受众: ${persona}\n\n请生成JSON:\n1.slogan(3个)\n2.email(subject,body)\n3.pitch(30秒演讲)`;
                const result = await callGeminiAPI(prompt + "\n\nResponse MUST be valid JSON.");
                if (result) {
                    try {
                        const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
                        const data = JSON.parse(jsonStr);
                        kitDiv.innerHTML = `
                <div class="space-y-4 mt-3 p-4 bg-slate-800/50 rounded-lg border border-blue-500/20">
                    <div>
                        <div class="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider">📢 Slogan Ideas</div>
                        <ul class="list-disc pl-4 space-y-1 text-gray-300">${data.slogan?.map(s => `<li>${s}</li>`).join('') || ''}</ul>
                    </div>
                    <div>
                        <div class="text-xs font-bold text-green-400 mb-2 uppercase tracking-wider">📧 Cold Email</div>
                        <div class="p-3 bg-black/20 rounded text-gray-300 text-xs">
                            <div class="font-bold border-b border-gray-700 pb-2 mb-2">${data.email?.subject}</div>
                            <div class="whitespace-pre-wrap opacity-90">${data.email?.body}</div>
                        </div>
                    </div>
                    <div>
                        <div class="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">🗣️ Elevator Pitch</div>
                        <div class="p-3 bg-indigo-900/20 rounded border-l-2 border-purple-500 text-gray-300 italic">"${data.pitch}"</div>
                    </div>
                </div>
            `;
                    } catch (e) {
                        kitDiv.innerHTML = `<div class="p-3 bg-gray-800 rounded mb-2 text-xs">${marked(result)}</div>`;
                    }
                } else {
                    kitDiv.innerText = '生成中断';
                }
            }
            // ----------------------------------------
            // AI: Knowledge Base
            // ----------------------------------------
            async function extractUSP(i) {
                const doc = knowledgeBase[i];
                const div = document.getElementById(`kb-ai-result-${i}`);
                const persona = localStorage.getItem('tds_target_audience') || '行业客户';
                div.innerHTML = '<div class="animate-pulse text-yellow-500">🔄 AI 正在提炼 USP...</div>';
                div.classList.remove('hidden');
                const prompt = `基于文档 "${doc.filename}"，针对 "${persona}"，提炼 3-5 个核心卖点 (USP) 和 3 个应用场景。Markdown 列表格式。`;
                const result = await callGeminiAPI(prompt + `\n\nContent:\n${doc.content.substring(0, 5000)}...`);
                if (result) div.innerHTML = marked(result);
                else div.innerText = 'AI 无响应';
            }
            async function generateAutoFAQ(i) {
                const doc = knowledgeBase[i];
                const div = document.getElementById(`kb-ai-result-${i}`);
                div.innerHTML = '<div class="animate-pulse text-purple-400">🔄 AI 正在生成 FAQ 话术库...</div>';
                div.classList.remove('hidden');
                const prompt = `基于文档 "${doc.filename}"，生成 5 个客户最关心的刁钻问题 (Q) 及专业回答 (A)。
    Respond in STRICT JSON format array: [{"q": "Question", "a": "Short Answer for Scripts"}]`;
                try {
                    const result = await callGeminiAPI(prompt + `\n\nContent:\n${doc.content.substring(0, 5000)}...`);
                    if (result) {
                        // Attempt to parse JSON
                        try {
                            const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
                            const qaData = JSON.parse(jsonStr);
                            // Save to document
                            doc.qaPairs = qaData;
                            localStorage.setItem('tds_knowledge_base', JSON.stringify(knowledgeBase));
                            // Render simple preview
                            div.innerHTML = `
                    <div class="text-green-400 mb-2">✅ 已生成 ${qaData.length} 条话术 (切换到 "QA模式" 查看)</div>
                    <ul class="list-disc pl-4 text-gray-400">
                        ${qaData.slice(0, 2).map(i => `<li>${i.q}</li>`).join('')}
                        <li>...</li>
                    </ul>
                 `;
                        } catch (e) {
                            // Fallback text render if JSON fails
                            div.innerHTML = marked(result);
                        }
                    } else {
                        div.innerText = 'AI 无响应';
                    }
                } catch (e) {
                    div.innerText = '生成失败';
                }
            }
            async function askAIWithKnowledge() {
                const query = document.getElementById('search-input').value;
                if (!query) return showToast('请输入问题', 'warning');
                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = '<div class="p-8 text-center"><div class="animate-pulse text-blue-400 text-lg mb-2">🧠 思考中...</div><div class="text-xs text-slate-500">正在查阅知识库构建答案</div></div>';
                const context = knowledgeBase.map(doc => `[${doc.filename}]: ${doc.content.substring(0, 2000)}`).join('\n\n').substring(0, 20000);
                const prompt = `基于已知文档回答: "${query}"\n\n资料库:\n${context}`;
                const answer = await callGeminiAPI(prompt);
                if (answer) {
                    resultsContainer.innerHTML = `
            <div class="p-5 rounded-lg border border-blue-500/30 bg-blue-900/10 mb-4 animate-fade-in">
                <div class="font-bold text-blue-400 mb-3 flex items-center gap-2">
                   <span>🤖 AI 回答</span>
                </div>
                <div class="text-sm leading-7 text-gray-200">${marked(answer)}</div>
            </div>
        `;
                } else {
                    resultsContainer.innerHTML = '<div class="text-center py-10 text-red-500">服务繁忙，请重试</div>';
                }
            }
            // ----------------------------------------
            // AI: Weekly Plan
            // ----------------------------------------
            async function generateWeeklyPlan() {
                const prodIndex = document.getElementById('plan-prod').value;
                if (prodIndex === "") return showToast('请先选择一个产品', 'warning');
                const prod = productDB[prodIndex];
                const btn = document.querySelector('#weekly-plan .btn-primary');
                const originalText = btn.innerText;
                btn.disabled = true;
                btn.innerText = '🧠 正在策划中...';
                document.getElementById('day1').innerHTML = '<div class="animate-pulse opacity-50">Content generating...</div>';
                document.getElementById('day3').innerHTML = '<div class="animate-pulse opacity-50">Content generating...</div>';
                const keywords = localStorage.getItem('tds_keywords') || '';
                const prompt = `Product: ${prod.name}\nPain: ${prod.pain}\nFeat: ${prod.feat}\nKeywords: ${keywords.substring(0, 200)}\n\nGenerate 2 posts (Monday: Pain-point focused, Wednesday: Feature/Data focused). Return JSON { "monday": "...", "wednesday": "..." }.`;
                try {
                    const result = await callGeminiAPI(prompt);
                    if (result) {
                        const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
                        const plan = JSON.parse(jsonStr);
                        document.getElementById('day1').innerHTML = marked(plan.monday);
                        document.getElementById('day3').innerHTML = marked(plan.wednesday);
                        showToast('周计划生成完毕', 'success');
                    } else {
                        throw new Error('Empty result');
                    }
                } catch (e) {
                    showToast('生成失败，请重试', 'error');
                    document.getElementById('day1').innerText = 'Failed';
                    document.getElementById('day3').innerText = 'Failed';
                } finally {
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            }
            // ----------------------------------------
            // AI: Ad Doctor
            // ----------------------------------------
            async function analyzeAdsWithAI() {
                const spend = document.getElementById('ad-spend').value;
                const leads = document.getElementById('leads-count').value;
                const platform = document.getElementById('platform-select').value;
                if (!spend || !leads) return showToast('请输入完整数据', 'warning');
                const adviceDiv = document.getElementById('doctor-advice');
                const persona = localStorage.getItem('tds_target_audience') || '通用受众';
                const cpl = (spend / leads).toFixed(2);
                adviceDiv.innerHTML = '<div class="animate-pulse text-purple-400">🧠 正在诊断 Campaign 数据...</div>';
                const prompt = `Analyze Ads: Platform=${platform}, Spend=$${spend}, Leads=${leads}, CPL=$${cpl}. Target Audience: ${persona}.\nProvide 3 specific optimization tips to lower CPL. Brief list.`;
                const result = await callGeminiAPI(prompt);
                if (result) {
                    localStorage.setItem('tds_last_advice', result);
                    adviceDiv.innerHTML = `
            <div class="text-left text-xs p-3 space-y-2 bg-slate-800 rounded">${marked(result)}</div>
            <button onclick="generateOptimizedContent('${platform}', '${cpl}')" 
                class="btn-primary w-full mt-3 animate-pulse" 
                style="background: linear-gradient(90deg, #ec4899, #8b5cf6); padding: 8px;">
                ⚡ 生成优化素材
            </button>
            <div id="optimization-result" class="mt-2 text-xs text-gray-300"></div>
        `;
                } else {
                    adviceDiv.innerText = '分析超时';
                }
            }
            async function generateOptimizedContent(platform, cpl) {
                const advice = localStorage.getItem('tds_last_advice');
                const resultDiv = document.getElementById('optimization-result');
                resultDiv.innerHTML = '<div class="animate-pulse text-pink-400">⚡ 正在重绘素材...</div>';
                const prompt = `Based on advice: ${advice}\nPlatform: ${platform}\nCPL: $${cpl}\n\nCreate 3 optimized ad headlines and 1 short ad body text. Use emojis.`;
                const content = await callGeminiAPI(prompt);
                if (content) resultDiv.innerHTML = `<div class="p-3 border border-pink-500/30 bg-pink-500/10 rounded mt-2">${marked(content)}</div>`;
                else resultDiv.innerText = '生成失败';
            }
            // ----------------------------------------
            // AI: Keyword Alchemy
            // ----------------------------------------
            async function expandKeywords() {
                const input = document.getElementById('keyword-input'); // NOTE: Check ID in HTML
                // Wait, in previous HTML view it was 'vault-input' in tab 'keyword-vault'. The ID 'keyword-input' might be wrong if copied from old code.
                // Let's verify: In HTML line 355 it is: <textarea id="vault-input" ...
                // So 'expandKeywords' in previous HTML was referring to 'keyword-input' which MIGHT BE WRONG or checking the wrong element.
                // The Input Box in Keyword Vault is 'vault-input'
                const vaultInput = document.getElementById('vault-input');
                if (!vaultInput) return; // safety
                const seeds = vaultInput.value.split('\n').filter(k => k.trim());
                if (seeds.length === 0) return showToast('请先输入种子词', 'warning');
                const seed = seeds[0];
                vaultInput.value = `⏳ 正在裂变 "${seed}" 的长尾流量词...`;
                const prompt = `SEO Task: Generate 20 high-commercial-intent long-tail keywords based on seed "${seed}". List only. No numbering.`;
                const result = await callGeminiAPI(prompt);
                if (result) {
                    vaultInput.value = result.trim();
                    saveKeywords();
                    showToast('裂变完成', 'success');
                } else {
                    vaultInput.value = seeds.join('\n');
                }
            }
            async function analyzeKeywordIntent() {
                const vaultInput = document.getElementById('vault-input');
                const keywords = vaultInput.value.trim();
                if (!keywords) return showToast('空列表无法分析', 'warning');
                vaultInput.value = '⏳ 正在透视搜索意图...';
                const prompt = `Classify user intent for these keywords:\n${keywords.substring(0, 3000)}\n\nAppend tag [Buy] or [Learn] or [General] to each line. Return list.`;
                const result = await callGeminiAPI(prompt);
                if (result) {
                    vaultInput.value = result.trim();
                    saveKeywords();
                    showToast('意图透视完成', 'success');
                } else {
                    vaultInput.value = keywords;
                }
                // ----------------------------------------
                // AI: Social Matrix
                // ----------------------------------------
                async function generateSocialMatrix() {
                    const topic = document.getElementById('matrix-topic').value;
                    const lang = document.getElementById('matrix-lang').value || 'English';
                    if (!topic) return showToast('请输入核心主题', 'warning');
                    const container = document.getElementById('matrix-container');
                    const loading = document.getElementById('matrix-loading');
                    container.classList.add('hidden');
                    loading.classList.remove('hidden');
                    const persona = localStorage.getItem('tds_target_audience') || 'General';
                    const prompt = `Topic: ${topic}. Audience: ${persona}. Target Language: ${lang}.\nGenerate social posts for 5 platforms in Valid JSON:\n{"fb":"...","ins":"...","li":"...","tk":"Script...","yt":"Desc..."}\nEnsure the content is written in ${lang}.`;
                    try {
                        const result = await callGeminiAPI(prompt + "\n\nEnsure valid JSON.");
                        if (result) {
                            const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
                            const data = JSON.parse(jsonStr);
                            ['fb', 'ins', 'li', 'tk', 'yt'].forEach(p => {
                                const el = document.getElementById(`matrix-${p}`);
                                if (el && data[p]) el.innerText = data[p];
                            });
                            loading.classList.add('hidden');
                            container.classList.remove('hidden');
                        } else {
                            throw new Error('API Empty');
                        }
                    } catch (e) {
                        showToast('矩阵生成失败', 'error');
                        loading.classList.add('hidden');
                    }
                }
                function copyAndGo(platform, elementId) {
                    const text = document.getElementById(elementId).innerText;
                    if (!text) return;
                    navigator.clipboard.writeText(text).then(() => {
                        showToast('文案已复制，正在跳转...', 'success');
                        const urls = {
                            'fb': 'https://www.facebook.com/composer/message/',
                            'ins': 'https://www.instagram.com/',
                            'li': 'https://www.linkedin.com/feed/',
                            'tk': 'https://www.tiktok.com/upload',
                            'yt': 'https://studio.youtube.com/'
                        };
                        setTimeout(() => window.open(urls[platform], '_blank'), 1000);
                    });
                }
                // ----------------------------------------
                // 10. Automation & Workflows (Morgan Edition)
                // ----------------------------------------
                function loadAutomation() {
                    const url = localStorage.getItem('morgan_n8n_webhook') || '';
                    const input = document.getElementById('n8n-webhook-url');
                    if (input) input.value = url;
                }
                function saveN8nConfig() {
                    const url = document.getElementById('n8n-webhook-url').value;
                    localStorage.setItem('morgan_n8n_webhook', url);
                    showToast('n8n Webhook 配置已保存', 'success');
                }
                async function testN8nConnection() {
                    const url = localStorage.getItem('morgan_n8n_webhook');
                    if (!url) return showToast('请先输入 Webhook URL', 'warning');
                    logAutomation(`正在连接: ${url}...`);
                    try {
                        const start = Date.now();
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                event: 'ping',
                                timestamp: new Date().toISOString(),
                                source: 'Morgan.OS'
                            })
                        });
                        const duration = Date.now() - start;
                        if (res.ok) {
                            logAutomation(`✅ 连接成功 (${duration}ms) - Status: ${res.status}`);
                            showToast('连接成功！', 'success');
                        } else {
                            throw new Error(`HTTP ${res.status}`);
                        }
                    } catch (e) {
                        logAutomation(`❌ 连接失败: ${e.message}`);
                        showToast('连接失败，请检查 URL 和 CORS 设置', 'error');
                    }
                }
                async function triggerWorkflow(type) {
                    const url = localStorage.getItem('morgan_n8n_webhook');
                    if (!url) return showToast('未配置 Webhook URL，无法触发', 'error');
                    let payload = {};
                    let desc = '';
                    // Simulate meaningful data based on workflow type
                    switch (type) {
                        case 'lead_capture':
                            desc = '模拟线索捕获';
                            payload = {
                                event: 'new_lead',
                                data: {
                                    name: 'John Doe',
                                    email: `john.doe.${Date.now()}@example.com`,
                                    interest: productDB[0]?.name || 'Unknown Product',
                                    source: 'Landing Page A'
                                }
                            };
                            break;
                        case 'weekly_report':
                            desc = '周报生成';
                            const total = localStorage.getItem('tds_total') || 0;
                            const spent = localStorage.getItem('tds_spent') || 0;
                            payload = {
                                event: 'report_generation',
                                data: {
                                    period: 'Week 42',
                                    budget_total: total,
                                    budget_spent: spent,
                                    remaining: total - spent,
                                    cpl_health: localStorage.getItem('tds_last_cpl') || 'N/A'
                                }
                            };
                            break;
                        case 'social_sync':
                            desc = '社媒同步';
                            // Get last generated matrix if available
                            const fbContent = document.getElementById('matrix-fb')?.innerText || 'Sample Content...';
                            payload = {
                                event: 'social_publish',
                                data: {
                                    platform: ['facebook', 'linkedin'],
                                    content_snippet: fbContent.substring(0, 100),
                                    scheduled_time: new Date().toISOString()
                                }
                            };
                            break;
                        default:
                            return;
                    }
                    logAutomation(`🚀 触发工作流: ${desc}...`);
                    try {
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                            // No-cors mode might be needed if n8n doesn't return CORS headers, 
                            // but for now standard POST is better for debugging.
                        });
                        if (res.ok) {
                            logAutomation(`✅ [${type}] 发送成功!`);
                            showToast('请求已发送至 n8n', 'success');
                        } else {
                            logAutomation(`⚠️ [${type}] 发送异常: ${res.status}`);
                        }
                    } catch (e) {
                        logAutomation(`❌ [${type}] 发送失败: ${e.message}`);
                        // Often CORS error in browser simulation
                        if (e.message.includes('Failed to fetch')) {
                            logAutomation(`⚠️ 可能因 CORS 失败，但也可能已发送。检查 n8n。`);
                        }
                    }
                }
                function logAutomation(msg) {
                    const log = document.getElementById('automation-log');
                    if (!log) return;
                    const time = new Date().toLocaleTimeString();
                    log.innerHTML = `<div class="mb-1"><span class="opacity-50">[${time}]</span> ${msg}</div>` + log.innerHTML;
                }
                // Add to init
                (function initAutomation() {
                    // Wait for DOM
                    setTimeout(loadAutomation, 500);
                })();
                // ----------------------------------------
                // 11. RFQ Decoder (First Principles)
                // ----------------------------------------
                async function analyzeRFQ() {
                    const input = document.getElementById('rfq-input').value;
                    const context = document.getElementById('rfq-context').value;
                    if (!input || input.length < 10) return showToast('请输入有效的邮件内容', 'warning');
                    const resultPanel = document.getElementById('rfq-content');
                    const placeholder = document.getElementById('rfq-placeholder');
                    const loading = document.getElementById('rfq-loading');
                    // Reset UI
                    placeholder.classList.add('hidden');
                    resultPanel.classList.add('hidden');
                    loading.classList.remove('hidden');
                    const prompt = `
    Role: Senior B2B Sales Director.
    Task: Analyze this inbound email inquiry using First Principles. 
    Context: ${context || 'General Inquiry'}
    Email Content:
    """
    ${input}
    """
    Analyze for:
    1. **Intent**: Is this spam, price checking (competitor), or a genuine project need?
    2. **Professionalism**: Domain terms used? Corporate email domain? Clear specs?
    3. **Urgency**: Any timeline mentioned?
    Return STRICT JSON format:
    {
        "score": number (0-100, 100 is best),
        "intent_type": "string" (e.g. "High Potential Lead", "Price Shopper", "Spam Risk"),
        "intent_color": "string" (hex color code, e.g. "#4ade80" for green, "#f87171" for red, "#facc15" for yellow),
        "analysis_points": ["string", "string", "string"] (3-4 bullet points of pros/cons),
        "reply_strategy": "string" (Short paragraph on how to reply)
    }
    `;
                    try {
                        const result = await callGeminiAPI(prompt + "\n\nEnsure valid JSON.");
                        if (result) {
                            try {
                                const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
                                const data = JSON.parse(jsonStr);
                                renderRFQResult(data);
                                // Show Action Area (v18.2)
                                document.getElementById('rfq-action-area').classList.remove('hidden');
                                // Clear previous draft
                                document.getElementById('rfq-reply-draft').value = '';
                            } catch (e) {
                                // Fallback for parsing error
                                console.error("JSON Parse Error", e);
                                renderRFQResult({
                                    score: 50,
                                    intent_type: "Parse Error / Manual Review",
                                    intent_color: "#94a3b8",
                                    analysis_points: ["AI Output was not valid JSON", "Please review manually"],
                                    reply_strategy: result.substring(0, 200) + "..."
                                });
                            }
                        } else {
                            throw new Error("Empty API Response");
                        }
                    } catch (e) {
                        showToast('解码失败: ' + e.message, 'error');
                        loading.classList.add('hidden');
                        placeholder.classList.remove('hidden');
                    }
                }
                function renderRFQResult(data) {
                    const loading = document.getElementById('rfq-loading');
                    const content = document.getElementById('rfq-content');
                    loading.classList.add('hidden');
                    content.classList.remove('hidden');
                    // Score
                    const circle = document.getElementById('rfq-score-circle');
                    circle.innerText = data.score;
                    // Dynamic color for score border
                    let scoreColor = '#ef4444'; // red
                    if (data.score > 70) scoreColor = '#22c55e'; // green
                    else if (data.score > 40) scoreColor = '#eab308'; // yellow
                    circle.style.borderColor = scoreColor;
                    circle.style.color = scoreColor;
                    // Intent Tag
                    const tag = document.getElementById('rfq-intent-tag');
                    tag.innerText = data.intent_type;
                    tag.style.backgroundColor = data.intent_color + '40'; // 25% opacity
                    tag.style.color = data.intent_color;
                    tag.style.border = `1px solid ${data.intent_color}`;
                    // Analysis List
                    const list = document.getElementById('rfq-analysis-list');
                    list.innerHTML = data.analysis_points.map(p => `<li>${p}</li>`).join('');
                    // Strategy
                    const strat = document.getElementById('rfq-reply-strategy');
                    strat.innerText = data.reply_strategy;
                }
                // ----------------------------------------
                // 2. Dashboard Logic (Smart Briefing 2.0)
                // ----------------------------------------
                async function generateDailyBriefing() {
                    const title = document.getElementById('briefing-title');
                    const content = document.getElementById('briefing-content');
                    content.innerHTML = '<span class="animate-pulse">⚡ 正在聚合全网数据 (Radar, Calendar, Finance)...</span>';
                    // 1. Gather Radar Data (Who is awake?)
                    const now = new Date();
                    const zones = [
                        { id: 'ny', zone: 'America/New_York', name: 'North America' },
                        { id: 'ldn', zone: 'Europe/London', name: 'Europe' },
                        { id: 'dxb', zone: 'Asia/Dubai', name: 'Middle East' },
                        { id: 'bj', zone: 'Asia/Shanghai', name: 'APAC' }
                    ];
                    let activeZones = [];
                    zones.forEach(z => {
                        const timeStr = now.toLocaleTimeString('en-US', { timeZone: z.zone, hour12: false, hour: '2-digit' });
                        const hour = parseInt(timeStr);
                        if (hour >= 9 && hour < 18) activeZones.push(z.name);
                    });
                    const radarContext = activeZones.length > 0
                        ? `Active Markets (${activeZones.join(', ')} are online)`
                        : "Global markets are mostly offline";
                    // 2. Gather Calendar Data (What's the plan?)
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const today = days[now.getDay()];
                    // Simple mock logic for theme if not generated yet, can be enhanced to read DOM
                    let planContext = `Today is ${today}.`;
                    if (today === 'Monday') planContext += " Focus: Pain Point Attack.";
                    if (today === 'Wednesday') planContext += " Focus: Hardcore Demo.";
                    if (today === 'Friday') planContext += " Focus: Case Study / Testimonial.";
                    // 3. Gather Budget Data
                    // We try to read DOM, fallback to default
                    const budgetTotal = document.getElementById('total-budget')?.value || 266664;
                    const budgetSpent = document.getElementById('spent-amount')?.value || 79600;
                    const percentLeft = Math.round(((budgetTotal - budgetSpent) / budgetTotal) * 100);
                    const budgetContext = `Budget Remaining: ${percentLeft}%`;
                    // 4. AI Synthesis
                    const prompt = `
    Role: Chief of Staff / Strategic Advisor.
    Context:
    - [Time/Radar]: ${radarContext} (It is now ${now.getHours()}:${now.getMinutes()} Local)
    - [Content Plan]: ${planContext}
    - [Finance]: ${budgetContext}
    Task: Generate a 3-bullet daily morning briefing for the Sales Director.
    Tone: Professional, urgent, result-oriented.
    Format: HTML unordered list (<ul><li>...</li></ul>). Use <b> tags for emphasis.
    Language: Chinese (中文).
    `;
                    try {
                        // We use callGeminiAPI for the synthesis
                        const suggestion = await callGeminiAPI(prompt);
                        // Clean up markdown if present
                        const cleanHtml = suggestion.replace(/```html/g, '').replace(/```/g, '').trim();
                        title.innerText = `Good Morning, Director.`;
                        content.innerHTML = cleanHtml;
                        // Save history (optional, currently just ephemeral)
                        // localStorage.setItem('last_briefing', cleanHtml);
                    } catch (e) {
                        console.error("Briefing Error", e);
                        // Fallback Rule-based
                        title.innerText = "System Offline (Fallback Mode)";
                        content.innerHTML = `
            <ul class="list-disc pl-4 space-y-1">
                <li><b>Radar</b>: ${activeZones.length} zones active. Priority on responding to IDs.</li>
                <li><b>Plan</b>: ${planContext}</li>
                <li><b>Budget</b>: Health at ${percentLeft}%.</li>
            </ul>
        `;
                    }
                }
                // ----------------------------------------
                // 12. Global Market Radar
                // ----------------------------------------
                function updateGlobalRadar() {
                    const zones = [
                        { id: 'ny', zone: 'America/New_York', name: 'New York' },
                        { id: 'ldn', zone: 'Europe/London', name: 'London' },
                        { id: 'dxb', zone: 'Asia/Dubai', name: 'Dubai' },
                        { id: 'bj', zone: 'Asia/Shanghai', name: 'Beijing' }
                    ];
                    const now = new Date();
                    document.getElementById('radar-utc').innerText = 'UTC ' + now.toISOString().substring(11, 16);
                    zones.forEach(z => {
                        try {
                            const timeStr = now.toLocaleTimeString('en-US', { timeZone: z.zone, hour12: false, hour: '2-digit', minute: '2-digit' });
                            const hour = parseInt(timeStr.split(':')[0]);
                            // DOM Elements
                            const timeEl = document.getElementById(`time-${z.id}`);
                            const statusDot = document.getElementById(`status-dot-${z.id}`);
                            const actionEl = document.getElementById(`action-${z.id}`);
                            if (timeEl) timeEl.innerText = timeStr;
                            // Logic: Working Hours (9-18), Evening (18-22), Night (22-9)
                            let statusColor = 'bg-gray-500';
                            let actionText = 'Sleeping';
                            let actionClass = 'text-gray-500 bg-gray-800';
                            if (hour >= 9 && hour < 18) {
                                statusColor = 'bg-green-500 animate-pulse';
                                actionText = '🟢 Best for Calls';
                                actionClass = 'text-green-400 bg-green-900/30 border border-green-500/30';
                            } else if (hour >= 18 && hour < 22) {
                                statusColor = 'bg-yellow-500';
                                actionText = '🟡 Email Only';
                                actionClass = 'text-yellow-400 bg-yellow-900/30 border border-yellow-500/30';
                            } else {
                                statusColor = 'bg-red-500';
                                actionText = '🔴 Do Not Disturb';
                                actionClass = 'text-red-400 bg-red-900/30 border border-red-500/30';
                            }
                            if (statusDot) statusDot.className = `w-2 h-2 rounded-full ${statusColor}`;
                            if (actionEl) {
                                actionEl.innerText = actionText;
                                actionEl.className = `text-[10px] uppercase font-bold px-2 py-1 rounded inline-block ${actionClass}`;
                            }
                        } catch (e) {
                            console.error('Radar Error', e);
                        }
                    });
                }
                // Init Radar Loop
                setInterval(updateGlobalRadar, 60000); // Every minute
                setTimeout(updateGlobalRadar, 1000); // Initial call
                // ----------------------------------------
                // 13. Competitor Scout (Battle Card)
                // ----------------------------------------
                async function analyzeCompetitor() {
                    const name = document.getElementById('scout-name').value;
                    const info = document.getElementById('scout-info').value;
                    if (!name || !info) return showToast('请输入对手名称和相关信息', 'warning');
                    const resultPanel = document.getElementById('scout-content');
                    const placeholder = document.getElementById('scout-placeholder');
                    const loading = document.getElementById('scout-loading');
                    // Reset UI
                    placeholder.classList.add('hidden');
                    resultPanel.classList.add('hidden');
                    loading.classList.remove('hidden');
                    const prompt = `
    Role: Strategic B2B Sales Consultant.
    Task: Create a "Battle Card" to help a sales rep win against a competitor.
    Competitor Name: ${name}
    Competitor Info/Context:
    """
    ${info}
    """
    Analyze and Return STRICT JSON:
    {
        "weaknesses": ["point 1", "point 2", "point 3"],
        "strengths_to_avoid": ["point 1", "point 2"],
        "kill_scripts": [
            { "situation": "When customer says X...", "script": "You reply Y..." },
            { "situation": "When they mention price...", "script": "You reply..." }
        ]
    }
    `;
                    try {
                        const result = await callGeminiAPI(prompt + "\\n\\nEnsure valid JSON.");
                        if (result) {
                            try {
                                const jsonStr = result.replace(/'```json/g, '').replace(/```/g, '').trim();
                                let data;
                                // Simple cleanup if MD block remains
                                if (jsonStr.startsWith('```json')) {
                                    data = JSON.parse(jsonStr.substring(7, jsonStr.length - 3));
                                } else if (jsonStr.startsWith('```')) {
                                    data = JSON.parse(jsonStr.substring(3, jsonStr.length - 3));
                                } else {
                                    data = JSON.parse(jsonStr);
                                }
                                renderScoutResult(name, data);
                            } catch (e) {
                                console.error("JSON Parse Error", e);
                                showToast('解析失败，请重试', 'error');
                                loading.classList.add('hidden');
                                placeholder.classList.remove('hidden');
                            }
                        }
                    } catch (e) {
                        showToast('分析失败: ' + e.message, 'error');
                        loading.classList.add('hidden');
                        placeholder.classList.remove('hidden');
                    }
                }
                function renderScoutResult(name, data) {
                    const loading = document.getElementById('scout-loading');
                    const content = document.getElementById('scout-content');
                    loading.classList.add('hidden');
                    content.classList.remove('hidden');
                    document.getElementById('scout-target-name').innerText = name;
                    // Lists
                    document.getElementById('scout-weakness-list').innerHTML = data.weaknesses.map(p => `<li>${p}</li>`).join('');
                    document.getElementById('scout-strength-list').innerHTML = data.strengths_to_avoid.map(p => `<li>${p}</li>`).join('');
                    // Scripts
                    const scriptsContainer = document.getElementById('scout-scripts');
                    scriptsContainer.innerHTML = data.kill_scripts.map(item => `
        <div class="p-3 bg-black/40 rounded border border-yellow-500/20">
            <div class="text-xs text-gray-400 mb-1 italic">Customer: "${item.situation}"</div>
            <div class="text-sm text-yellow-100 font-bold">💬 "${item.script}"</div>
        </div>
    `).join('');
                }
                // [Moved to app_part_calc.js]
                // ----------------------------------------
                // 17. Local RAG Knowledge Base (AI Brain)
                // ----------------------------------------
                // State
                let kbChunks = [];
                const KB_STORAGE_KEY = 'morgan_kb_chunks';
                const KB_FILES_KEY = 'morgan_kb_files';
                // Load on Init
                function initKnowledgeBase() {
                    const stored = localStorage.getItem(KB_STORAGE_KEY);
                    if (stored) kbChunks = JSON.parse(stored);
                    updateKBStats();
                    renderFileList();
                }
                // Ingest
                async function ingestKnowledge(input) {
                    const files = input.files;
                    if (!files.length) return;
                    const overlay = document.getElementById('kb-ingesting');
                    overlay.classList.remove('hidden');
                    // Load File List
                    let storedFiles = JSON.parse(localStorage.getItem(KB_FILES_KEY) || "[]");
                    for (let file of files) {
                        try {
                            const text = await readFileText(file);
                            const chunks = chunkText(text, file.name);
                            kbChunks.push(...chunks);
                            storedFiles.push({ name: file.name, size: file.size, date: new Date().toISOString() });
                        } catch (e) {
                            console.error("File Read Error", e);
                            showToast(`读取失败: ${file.name}`, 'error');
                        }
                    }
                    // Save
                    localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(kbChunks));
                    localStorage.setItem(KB_FILES_KEY, JSON.stringify(storedFiles));
                    updateKBStats();
                    renderFileList();
                    overlay.classList.add('hidden');
                    showToast(`成功学习 ${kbChunks.length} 个知识片段`, 'success');
                }
                function readFileText(file) {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = (e) => reject(e);
                        reader.readAsText(file);
                    });
                }
                function chunkText(text, source) {
                    // Simple sliding window chunker
                    // Chunk Size: ~300 chars, Overlap: 50 chars
                    const CHUNK_SIZE = 300;
                    const OVERLAP = 50;
                    const chunks = [];
                    // Clean text
                    const clean = text.replace(/\s+/g, ' ').trim();
                    for (let i = 0; i < clean.length; i += (CHUNK_SIZE - OVERLAP)) {
                        const content = clean.substring(i, i + CHUNK_SIZE);
                        if (content.length < 50) continue; // Skip tiny chunks
                        chunks.push({
                            id: Date.now() + Math.random(),
                            content: content,
                            source: source
                        });
                    }
                    return chunks;
                }
                function updateKBStats() {
                    const countEl = document.getElementById('kb-count');
                    if (countEl) countEl.innerText = kbChunks.length;
                }
                function renderFileList() {
                    const list = JSON.parse(localStorage.getItem(KB_FILES_KEY) || "[]");
                    const container = document.getElementById('kb-file-list');
                    if (!container) return;
                    if (list.length === 0) {
                        container.innerHTML = '<div class="italic text-center py-4">暂无知识库文件</div>';
                        return;
                    }
                    container.innerHTML = list.map(f => `
        <div class="flex justify-between items-center bg-gray-800 p-2 rounded">
            <span class="truncate w-32" title="${f.name}">📄 ${f.name}</span>
            <span class="text-[10px] text-gray-500">${(f.size / 1024).toFixed(1)}KB</span>
        </div>
    `).join('');
                }
                function clearKnowledge() {
                    if (!confirm('确定清空所有知识库吗？')) return;
                    kbChunks = [];
                    localStorage.removeItem(KB_STORAGE_KEY);
                    localStorage.removeItem(KB_FILES_KEY);
                    updateKBStats();
                    renderFileList();
                    showToast('知识库已重置', 'info');
                }
                // Retrieval & Ask
                async function askKnowledgeBase() {
                    const input = document.getElementById('kb-query');
                    const query = input.value.trim();
                    if (!query) return;
                    // UI: User Msg
                    appendKBChat('user', query);
                    input.value = '';
                    const working = document.getElementById('kb-ai-working');
                    working.classList.remove('hidden');
                    try {
                        // 1. Retrieve
                        const context = retrieveContext(query);
                        renderContextInspector(context);
                        // 2. Generate
                        if (context.length === 0) {
                            appendKBChat('ai', "抱歉，知识库中没有找到相关信息。请尝试上传相关文档。");
                            working.classList.add('hidden');
                            return;
                        }
                        const contextText = context.map(c => `- ${c.content} [Source: ${c.source}]`).join('\n');
                        const prompt = `
        Role: Expert Support Agent.
        Task: Answer the question using ONLY the provided context. If the answer is not in the context, say "I don't know based on the knowledge base".
        Question: "${query}"
        Context:
        """
        ${contextText}
        """
        Answer (Keep it concise, professional, and cite the source file if possible):
        `;
                        const answer = await callGeminiAPI(prompt);
                        appendKBChat('ai', answer);
                    } catch (e) {
                        console.error("KB Error", e);
                        appendKBChat('ai', "Error: 知识库大脑过载，请重试。");
                    }
                    working.classList.add('hidden');
                }
                function retrieveContext(query) {
                    if (kbChunks.length === 0) return [];
                    // Simple Bag-of-Words Scoring
                    // Enhance: Use vector embeddings if bringing in tfjs-universal-sentence-encoder (future)
                    const qTokens = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
                    const scored = kbChunks.map(chunk => {
                        let score = 0;
                        const text = chunk.content.toLowerCase();
                        qTokens.forEach(t => {
                            if (text.includes(t)) score += 1;
                        });
                        return { ...chunk, score };
                    });
                    // Filter & Sort
                    return scored.filter(c => c.score > 0)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5); // Top 5
                }
                function appendKBChat(role, text) {
                    const history = document.getElementById('kb-chat-history');
                    const isUser = role === 'user';
                    const html = `
    <div class="flex gap-4 ${isUser ? 'flex-row-reverse' : ''}">
        <div class="w-8 h-8 rounded-full ${isUser ? 'bg-gray-600' : 'bg-blue-600'} flex items-center justify-center text-xs">
            ${isUser ? 'You' : 'AI'}
        </div>
        <div class="flex-1 space-y-2 text-${isUser ? 'right' : 'left'}">
            <div class="${isUser ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-gray-800'} p-3 rounded-lg ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} inline-block text-sm text-gray-300 text-left">
                ${isUser ? text : marked.parse(text)}
            </div>
        </div>
    </div>
    `;
                    history.insertAdjacentHTML('beforeend', html);
                    history.scrollTop = history.scrollHeight;
                }
                function renderContextInspector(chunks) {
                    const inspector = document.getElementById('kb-context-inspector');
                    const content = document.getElementById('kb-context-content');
                    if (chunks.length > 0) {
                        inspector.classList.remove('hidden');
                        content.innerHTML = chunks.map(c => `
            <div class="p-2 bg-black/40 rounded border border-gray-700 hover:border-blue-500/50 transition-colors">
                <div class="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>${c.source}</span>
                    <span class="text-green-500">Match Score: ${c.score}</span>
                </div>
                <div class="truncate text-gray-400">"...${c.content.substring(0, 100)}..."</div>
            </div>
        `).join('');
                    } else {
                        inspector.classList.add('hidden');
                    }
                }
                // Init KB on load
                setTimeout(initKnowledgeBase, 1000);
                // ==========================================
                // 11.1 Smart Responder (RFQ 2.0)
                // ==========================================
                async function generateRFQReply() {
                    const input = document.getElementById('rfq-input').value;
                    const draftArea = document.getElementById('rfq-reply-draft');
                    const loading = document.getElementById('rfq-reply-loading');
                    if (!input) return showToast('没有可分析的邮件内容', 'warning');
                    if (loading) loading.classList.remove('hidden');
                    // 1. Retrieve Context from Knowledge Base
                    // Use the existing 'retrieveContext' function if available, otherwise mock it
                    let kbContext = "General B2B Professional reply.";
                    if (typeof retrieveContext === 'function') {
                        const chunks = retrieveContext(input); // Basic RAG
                        if (chunks && chunks.length > 0) {
                            kbContext = chunks.map(c => c.content).join('\n---\n');
                            showToast(`已引用 ${chunks.length} 条知识库内容`, 'success');
                        }
                    }
                    const prompt = `
    Role: Expert International Sales Manager.
    Task: Write a high-converting reply email to the client.
    Client Original Inquiry:
    """
    ${input}
    """
    Internal Knowledge / Product Specs (Use this if relevant):
    """
    ${kbContext}
    """
    Requirements:
    1. Tone: Professional, Warm, and Efficient.
    2. Structure: 
       - Acknowledge receipt and thank them.
       - Answer specific questions using the Internal Knowledge.
       - If knowledge is missing, ask clarifying questions.
       - Clear Call to Action (CTA).
    3. Output: Email Body ONLY. No subject line.
    `;
                    try {
                        const reply = await callGeminiAPI(prompt);
                        if (reply) {
                            typewriterEffect(draftArea, reply);
                        }
                    } catch (e) {
                        draftArea.value = "Error generating reply: " + e.message;
                    } finally {
                        if (loading) loading.classList.add('hidden');
                    }
                }
                function typewriterEffect(element, text, speed = 5) {
                    if (!element) return;
                    element.value = '';
                    let i = 0;
                    const timer = setInterval(() => {
                        if (i < text.length) {
                            element.value += text.charAt(i);
                            element.scrollTop = element.scrollHeight;
                            i++;
                        } else {
                            clearInterval(timer);
                        }
                    }, speed);
                }
                function copyRFQReply() {
                    const text = document.getElementById('rfq-reply-draft').value;
                    if (!text) return;
                    navigator.clipboard.writeText(text).then(() => {
                        showToast('已复制到剪贴板', 'success');
                    });
                }
// ==========================================



// ==========================================
// Phase 17: Multi-User Permission System (Fixed)
// ==========================================

// ⚠️ PLACEHOLDERS - Replace with actual values from user
const SUPABASE_URL = 'https://ftcaijvfvypcwjgetkvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Y2FpanZmdnlwY3dqZ2V0a3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzM0MDYsImV4cCI6MjA4MDE0OTQwNn0.TQ-ayMDAVizgCxEly_ahflzZYXnBYhQ1sBjQnZ636gQ';

let supabase = null;
let currentUser = null;
let userRole = null;
let allowedModules = [];

// Initialize Auth
async function initAuth() {
    // 🎯 GUEST MODE: If global flag is set, skip all auth logic
    if (window.isGuestMode === true) {
        console.log('🧪 initAuth: Guest Mode detected, skipping auth initialization');
        return;
    }
    
    // 🚀 GUEST MODE CHECK: If window.sb already exists (set by Guest mode in index.html), use it!
    if (window.sb) {
        console.log('✅ Using existing auth client (Guest Mode or pre-initialized)');
        supabase = window.sb;
        
        // Guest mode: Check if we're in guest mode by URL param
        if (window.location.search.includes('guest=true')) {
            console.log('🔓 Guest Mode Active - Hiding auth modal and entering app');
            hideAuthModal();
            const appMain = document.getElementById('app-main');
            if(appMain) appMain.classList.remove('hidden');
            
            // Set mock user data
            currentUser = { id: 'guest-007', email: 'guest@morgan.com' };
            userRole = 'admin'; // Give full access in guest mode
            updateUserDisplay({ display_name: 'Guest (Demo)', role: 'admin' });
            if (typeof showToast === 'function') showToast('🧪 Guest Mode Active', 'success');
            return;
        }
        
        // Not guest mode but sb exists - proceed with normal session check
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session) {
                await handleSessionSuccess(session);
            } else {
                showAuthModal();
            }
        } catch(e) {
            console.error('Session check error:', e);
            showAuthModal();
        }
        return;
    }

    // Normal flow: Create new Supabase client if window.sb doesn't exist
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase SDK not loaded');
        if (typeof showToast === 'function') showToast('System Error: Auth SDK failed to load', 'error');
        return;
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.sb = supabase;
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Session check error:', error);
            showAuthModal();
        } else if (session) {
            await handleSessionSuccess(session);
        } else {
            showAuthModal();
        }

        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                showAuthModal();
                const appMain = document.getElementById('app-main');
                if(appMain) appMain.classList.add('hidden');
                currentUser = null;
                updateUserDisplay(null);
            } else if (event === 'SIGNED_IN' && session) {
                if (!currentUser || currentUser.id !== session.user.id) {
                    handleSessionSuccess(session);
                }
            }
        });

    } catch (e) {
        console.error('Supabase init critical error:', e);
        showAuthModal();
    }
}

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('hidden');
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
}

async function handleSessionSuccess(session) {
    currentUser = session.user;
    hideAuthModal();
    // Reveal Main App
    const appMain = document.getElementById('app-main');
    if(appMain) appMain.classList.remove('hidden');
    
    // Load Profile
    await loadUserProfile(currentUser.id);
    if (typeof showToast === 'function') showToast('欢迎回来, ' + (userRole || 'User'), 'success');
}

async function loadUserProfile(uid) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role, display_name')
            .eq('id', uid)
            .single();
            
        if (data) {
            userRole = data.role;
            updateUserDisplay(data);
            applyPermissions();
        }
    } catch (e) {
        console.error('Profile load error', e);
    }
}

function updateUserDisplay(profile) {
    const el = document.getElementById('user-info-display');
    if (!el) return;
    if (profile) {
        el.innerHTML = `
            <div class="text-xs text-gray-400">Current User</div>
            <div class="font-bold text-blue-400">${profile.display_name || 'User'}</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider">${userRole || 'Guest'}</div>
        `;
    } else {
        el.innerHTML = '';
    }
}

function applyPermissions() {
    // 1. Define Role Matrix
    const matrix = {
        'admin': ['all'],
        'manager': ['dashboard', 'crm', 'rfq', 'email', 'analytics'],
        'sales': ['dashboard', 'crm', 'rfq', 'email']
    };
    
    const role = userRole || 'sales'; // Default to sales
    const allowed = matrix[role] || ['dashboard'];
    
    // 2. Hide/Show Nav Items
    document.querySelectorAll('.nav-item').forEach(btn => {
        const moduleId = btn.id.replace('nav-', '');
        // Exceptions
        if (moduleId === 'settings' || moduleId === 'logout') return; 
        
        if (allowed.includes('all') || allowed.includes(moduleId)) {
            btn.classList.remove('hidden');
        } else {
            // btn.classList.add('hidden'); // Optional: Hide or disable
        }
    });
}

// Ensure initAuth is called
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAuth, 500); // Small delay to ensure SDK load
});



// ==========================================
// 10. Navigation & UI Utilities (Restored)
// ==========================================

// Global Navigation Function
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);
    // 1. Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // 2. Show target tab
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    } else {
        console.error('Target tab not found:', tabId);
    }
    
    // 3. Update nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + tabId);
    if (navBtn) navBtn.classList.add('active');

    // 4. Trigger specific module logic
    // Add safety checks
    if (tabId === 'exhibition' && typeof renderExpos === 'function') renderExpos();
    if (tabId === 'dashboard' && typeof updateDashboard === 'function') updateDashboard();
    if (tabId === 'email-templates' && typeof renderTemplateList === 'function') renderTemplateList();
}

// Global Theme Toggle
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-mode');
    if (isLight) {
        body.classList.remove('light-mode');
        const icon = document.getElementById('theme-icon');
        if(icon) icon.innerText = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        const icon = document.getElementById('theme-icon');
        if(icon) icon.innerText = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// Global ShowTab Alias
window.showTab = switchTab;


﻿// ==========================================
// Morgan AI: Customer Deep Dive (Intelligence Center)
// ==========================================

async function startDeepDive() {
    const urlInput = document.getElementById('dive-url');
    const resultPanel = document.getElementById('dive-result-panel');
    const searchHero = document.getElementById('dive-hero-section');
    const resultContainer = document.getElementById('dive-dashboard');

    if (!urlInput || !urlInput.value.trim()) {
        showToast('请输入目标网址 (Target URL)', 'warning');
        return;
    }

    let url = urlInput.value.trim();
    if (!url.startsWith('http')) url = 'https://' + url;

    // UI Transition: Hero -> Loading
    searchHero.classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('dive-loading').classList.remove('hidden');
    resultContainer.classList.add('hidden'); // Hide previous results

    try {
        showToast('正在派遣 AI 侦探访问目标...', 'info');

        // 1. Scrape with Jina Reader (Free, clean Markdown)
        const jinaUrl = `https://r.jina.ai/${url}`;
        const scrapeRes = await fetch(jinaUrl);
        if (!scrapeRes.ok) throw new Error('Jina Reader Access Failed');
        const markdown = await scrapeRes.text();

        if (markdown.length < 500) {
            throw new Error('Website content too short or blocked.');
        }

        // 2. AI Analysis
        showToast('网站访问成功，正在进行尽职调查...', 'success');

        const mode = document.querySelector('.dive-mode-active')?.dataset.mode || 'audit';

        const prompt = `
        Role: Private Equity Due Diligence Officer (Chinese Speaker).
        Task: Analyze this B2B company website content and provide a report in CHINESE (中文).
        Target URL: ${url}
        Mode: ${mode} (If 'hunter', focus on contacts. If 'audit', full analysis.)
        
        Website Content (Markdown):
        ${markdown.substring(0, 25000)}

        Required Output (Strict JSON):
        {
            "identity": "Factory (工厂) / Brand (品牌商) / Distributor (分销商) / Retailer (零售商)",
            "identity_confidence": 85, 
            "trust_score": 90,
            "scale_estimate": "100-500人",
            "location": "城市, 国家",
            "key_products": ["产品A", "产品B"],
            "business_model": "为大品牌代工...",
            "red_flags": ["无物理地址", "只使用Gmail邮箱"],
            "green_lights": ["ISO认证", "10年以上域名", "展示工厂照片"],
            "contacts": ["sales@...", "info@..."],
            "social_links": ["linkedin.com/...", "facebook.com/..."],
            "pitch_strategy": "他们看重质量而非价格，建议强调研发能力..."
        }
        `;

        const aiRes = await callGeminiAPI(prompt + "\n\nReturn strict JSON.");
        if (!aiRes) throw new Error('AI Analysis Failed');

        const data = JSON.parse(aiRes.replace(/```json/g, '').replace(/```/g, '').trim());

        // 3. Render Results
        renderDeepDiveResults(data);

        // UI Transition: Loading -> Results
        document.getElementById('dive-loading').classList.add('hidden');
        searchHero.classList.remove('opacity-50', 'pointer-events-none');
        searchHero.classList.add('hidden'); // Optional: hide hero fully or keep it small
        // Actually, let's keep search accessible but move it or let results overlay
        // For Google style: animate search bar up? For now, let's just show results below.
        resultContainer.classList.remove('hidden');

        // Google-style polish: Maybe scroll to results
        resultContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        console.error("Deep Dive Error:", e);
        showToast('背调失败: ' + e.message, 'error');
        document.getElementById('dive-loading').classList.add('hidden');
        searchHero.classList.remove('opacity-50', 'pointer-events-none');
    }
}

function renderDeepDiveResults(data) {
    // Identity & Score
    document.getElementById('dive-identity').innerText = data.identity || 'Unknown';
    document.getElementById('dive-location').innerText = data.location || 'Unknown Location';

    // Score Circle Color
    const score = data.trust_score || 0;
    const scoreEl = document.getElementById('dive-score');
    scoreEl.innerText = score;
    const circle = document.getElementById('trust-circle');

    if (score >= 80) circle.style.borderColor = '#10b981'; // Green
    else if (score >= 60) circle.style.borderColor = '#fbbf24'; // Yellow
    else circle.style.borderColor = '#ef4444'; // Red

    // Lists
    renderList('dive-pro-list', data.green_lights, 'text-green-400', '✅');
    renderList('dive-con-list', data.red_flags, 'text-red-400', '⚠️');
    renderList('dive-contact-list', data.contacts, 'text-blue-300', '📧');
    renderList('dive-social-list', data.social_links, 'text-blue-300', '🔗');

    // Strategy
    document.getElementById('dive-pitch').innerText = data.pitch_strategy || 'No specific strategy generated.';
    document.getElementById('dive-model').innerText = data.business_model || 'N/A';
    document.getElementById('dive-scale').innerText = data.scale_estimate || 'Unknown';
    document.getElementById('dive-products').innerText = Array.isArray(data.key_products) ? data.key_products.join(', ') : (data.key_products || '--');
}

function renderList(id, items, colorClass, icon) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    if (!items || items.length === 0) {
        el.innerHTML = '<li class="opacity-50 text-xs">None detected</li>';
        return;
    }
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = `text-xs ${colorClass} truncate`;
        li.innerHTML = `${icon} ${item}`;
        el.appendChild(li);
    });
}

function toggleDiveMode(btn, mode) {
    // Reset active state
    document.querySelectorAll('.dive-mode-btn').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'dive-mode-active');
        b.classList.add('bg-slate-800', 'text-gray-400');
    });
    // Set active
    btn.classList.remove('bg-slate-800', 'text-gray-400');
    btn.classList.add('bg-blue-600', 'text-white', 'dive-mode-active');
    btn.dataset.mode = mode;
}

// Make functions global
window.startDeepDive = startDeepDive;
window.toggleDiveMode = toggleDiveMode;

// ==========================================
// Phase 13: Mini CRM Logic
// ==========================================
let lastDeepDiveData = null; // Store latest result for saving
let crmLeads = JSON.parse(localStorage.getItem('tds_crm_leads') || '[]');

// Hook into render to save state
const originalRender = renderDeepDiveResults;
renderDeepDiveResults = function (data) {
    lastDeepDiveData = data; // Capture data
    originalRender(data);
}

function saveToCRM() {
    if (!lastDeepDiveData) return showToast('没有可保存的报告', 'warning');

    const url = document.getElementById('dive-url')?.value || 'Unknown URL';
    const existing = crmLeads.find(l => l.website === url || l.companyName === lastDeepDiveData.identity);

    if (existing) {
        if (!confirm('该客户已存在，是否覆盖旧报告？')) return;
        // Remove old to re-add new at top
        crmLeads = crmLeads.filter(l => l.id !== existing.id);
    }

    const lead = {
        id: Date.now(),
        companyName: lastDeepDiveData.identity || 'Unknown Company',
        website: url,
        location: lastDeepDiveData.location,
        score: lastDeepDiveData.trust_score,
        data: lastDeepDiveData, // Store full object
        savedAt: new Date().toLocaleString()
    };

    crmLeads.unshift(lead); // Add to top
    localStorage.setItem('tds_crm_leads', JSON.stringify(crmLeads));
    showToast('✅ 客户档案已存档', 'success');

    // Refresh list if open
    renderCRMList();
}

function toggleCRMList() {
    const p = document.getElementById('crm-list-panel');
    const icon = document.getElementById('crm-toggle-icon');
    if (p.classList.contains('hidden')) {
        p.classList.remove('hidden');
        icon.innerText = '▼';
        renderCRMList();
    } else {
        p.classList.add('hidden');
        icon.innerText = '▶';
    }
}

function renderCRMList() {
    const container = document.getElementById('crm-list-content');
    if (!container) return;

    if (crmLeads.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-4 text-xs">暂无存档记录</div>';
        return;
    }

    container.innerHTML = crmLeads.map(lead => `
        <div class="flex items-center justify-between p-3 rounded bg-slate-800/50 hover:bg-slate-800 border border-gray-700/50 transition cursor-pointer group"
             onclick="loadCRMReport(${lead.id})">
            
            <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getScoreColor(lead.score)}">
                    ${lead.score}
                </div>
                <div>
                    <div class="font-bold text-gray-200 text-sm group-hover:text-blue-400 transition">${lead.companyName}</div>
                    <div class="text-[10px] text-gray-500 font-mono">${lead.website || 'No URL'} · ${lead.savedAt}</div>
                </div>
            </div>

            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onclick="event.stopPropagation(); deleteCRMLead(${lead.id})" 
                    class="p-1 text-gray-500 hover:text-red-400 text-xs">🗑️</button>
                <div class="text-blue-400 text-xs">查看报告 →</div>
            </div>
        </div>
    `).join('');
}

function getScoreColor(score) {
    if (score >= 80) return 'bg-green-900/50 text-green-400 border border-green-500/30';
    if (score >= 60) return 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30';
    return 'bg-red-900/50 text-red-400 border border-red-500/30';
}

function loadCRMReport(id) {
    const lead = crmLeads.find(l => l.id === id);
    if (!lead) return;

    // Restore UI state
    document.getElementById('dive-url').value = lead.website;
    // Hide search, show result
    document.getElementById('dive-hero-section').classList.add('hidden');
    document.getElementById('dive-dashboard').classList.remove('hidden');

    // Render
    renderDeepDiveResults(lead.data);
    showToast(`已加载 ${lead.companyName} 的历史报告`, 'info');
}

function deleteCRMLead(id) {
    if (!confirm('确定删除此档案？')) return;
    crmLeads = crmLeads.filter(l => l.id !== id);
    localStorage.setItem('tds_crm_leads', JSON.stringify(crmLeads));
    renderCRMList();
    showToast('已删除', 'info');
}

// Expose
window.saveToCRM = saveToCRM;
window.toggleCRMList = toggleCRMList;
window.loadCRMReport = loadCRMReport;
window.deleteCRMLead = deleteCRMLead;
