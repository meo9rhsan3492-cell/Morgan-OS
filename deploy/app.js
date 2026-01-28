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

    try {

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

    } catch (e) {

        console.error("Critical System Init Error", e);

        // Ensure showToast is available or fallback

        if (typeof showToast === 'function') {

            showToast('System Init Error: ' + e.message, 'error');

        } else {

            alert('System Init Error: ' + e.message);

        }

    }

})();

// ==========================================

// 0. Pro UI: Charts

// ==========================================

function initCharts() {

    // 1. Budget Chart (Doughnut/Pie simplified to Bar for "Burn Rate")

    const ctxBudget = document.getElementById('budgetChart');

    if (typeof Chart === 'undefined') {

        console.warn('Chart.js not loaded. Charts disabled.');

        return;

    }

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

    const content = document.getElementById(tabId);

    if (!content) return console.warn(`Tab content not found: ${tabId}`);



    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

    content.classList.add('active');



    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    const navBtn = document.getElementById('nav-' + tabId);

    if (navBtn) navBtn.classList.add('active');

    if (tabId === 'exhibition') renderExpos();

    if (tabId === 'budget') renderBudgetChannels(); // New Multi-Channel Init

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

    if (!list) return; // Robust Check

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

    if (count) count.innerText = txt.split('\n').filter(l => l.trim()).length || 0;

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

// ==========================================

// 6. Analytics & Budget (Multi-Channel)

// ==========================================

let budgetChannels = JSON.parse(localStorage.getItem('tds_budget_channels')) || [

    { name: 'Google Ads', budget: 50000, spent: 12000 },

    { name: 'TikTok', budget: 30000, spent: 8500 },

    { name: 'Exhibition', budget: 100000, spent: 45000 }

];



function renderBudgetChannels() {

    const container = document.getElementById('budget-channel-list');

    if (!container) return; // Guard clause



    // Save Logic

    localStorage.setItem('tds_budget_channels', JSON.stringify(budgetChannels));



    // Render

    container.innerHTML = budgetChannels.map((ch, i) => {

        const pct = ch.budget > 0 ? (ch.spent / ch.budget) * 100 : 0;

        let color = 'bg-green-500';

        if (pct > 50) color = 'bg-yellow-500';

        if (pct > 80) color = 'bg-red-500';



        return `

        <div class="panel grid grid-cols-12 gap-4 items-center group hover:border-blue-500/50 transition-all">

            <!-- Channel Name -->

            <div class="col-span-3">

                <input type="text" value="${ch.name}" 

                    class="bg-transparent border-none font-bold w-full focus:outline-none focus:text-blue-400"

                    style="color: var(--text-primary);"

                    onchange="updateChannel(${i}, 'name', this.value)">

                <div class="text-[10px] text-gray-500 group-hover:text-blue-400/50 transition-colors">Click to edit</div>

            </div>



            <!-- Budget Input -->

            <div class="col-span-3 text-right">

                <input type="number" value="${ch.budget}" 

                    class="bg-transparent border-none text-right font-mono w-full focus:outline-none focus:text-blue-400"

                    style="color: var(--text-primary);"

                    onchange="updateChannel(${i}, 'budget', this.value)">

            </div>



            <!-- Spent Input -->

            <div class="col-span-3 text-right">

                <input type="number" value="${ch.spent}" 

                    class="bg-transparent border-none text-yellow-500 text-right font-mono w-full focus:outline-none focus:text-yellow-400"

                    onchange="updateChannel(${i}, 'spent', this.value)">

            </div>



            <!-- Progress Bar -->

            <div class="col-span-2 flex flex-col justify-center h-full">

                <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">

                    <div class="${color} h-full transition-all duration-500" style="width: ${Math.min(pct, 100)}%"></div>

                </div>

                <div class="text-[10px] text-center mt-1 text-gray-500 font-mono">${pct.toFixed(1)}%</div>

            </div>



            <!-- Remove Action -->

            <div class="col-span-1 text-center">

                <button onclick="removeChannel(${i})" class="text-gray-600 hover:text-red-500 transition">×</button>

            </div>

        </div>

        `;

    }).join('');



    renderGlobalBudgetSummary();

}



function updateChannel(index, key, value) {

    if (key === 'budget' || key === 'spent') {

        budgetChannels[index][key] = parseFloat(value) || 0;

    } else {

        budgetChannels[index][key] = value;

    }

    renderBudgetChannels();

}



function addChannel() {

    budgetChannels.push({ name: 'New Channel', budget: 0, spent: 0 });

    renderBudgetChannels();

    showToast('新渠道已添加', 'success');

}



function removeChannel(index) {

    if (confirm('确定删除该渠道吗？')) {

        budgetChannels.splice(index, 1);

        renderBudgetChannels();

    }

}



function renderGlobalBudgetSummary() {

    const total = budgetChannels.reduce((sum, ch) => sum + ch.budget, 0);

    const spent = budgetChannels.reduce((sum, ch) => sum + ch.spent, 0);

    const remain = total - spent;



    const elTotal = document.getElementById('global-total');

    const elSpent = document.getElementById('global-spent');

    const elRemain = document.getElementById('global-remain');



    if (elTotal) elTotal.innerText = '¥' + total.toLocaleString();

    if (elSpent) elSpent.innerText = '¥' + spent.toLocaleString();

    if (elRemain) elRemain.innerText = '¥' + remain.toLocaleString();



    // Sync to LocalStorage for Dashboard (Legacy Support)

    localStorage.setItem('tds_total', total);

    localStorage.setItem('tds_spent', spent);

    updateDashboard();

}



// Keep updateDashboard for compatibility, but don't call it recursively

// [Moved to app_part_radar.js] is kept as comment reference

// ... existing updateDashboard ...

// [Moved to app_part_radar.js]

function updateDashboard() {

    if (typeof renderRadar === 'function') {

        try {

            renderRadar(); // Call Radar Update

        } catch (e) {

            console.error("Radar Render Error", e);

        }

    } else {

        console.warn("renderRadar function not found");

    }



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

                if (diffDays >= 0 && diffDays < minDays) {

                    minDays = diffDays;

                    nearestExpo = ex;

                }

            });



            if (nearestExpo) {

                dashExpoName.innerText = nearestExpo.name;

                // High contrast active state

                dashExpoName.className = 'text-2xl font-bold text-gray-800 dark:text-white truncate';

                document.getElementById('dash-expo-days').innerText = minDays;

            } else {

                dashExpoName.innerText = '无近期展会';

                // Muted inactive state (darker for light mode)

                dashExpoName.className = 'text-2xl font-bold text-gray-500 dark:text-gray-500';

                document.getElementById('dash-expo-days').innerText = '--';

            }

        } else {

            dashExpoName.innerText = 'No Plan';

            dashExpoName.className = 'text-2xl font-bold text-gray-400 dark:text-gray-600';

            document.getElementById('dash-expo-days').innerText = '0';

        }

    }



    // 3. CPL Health

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

                statusEl.innerText = '✅ 健康 - 继续保持';

                statusEl.className = 'text-xs mt-2 text-right text-green-400';

            } else if (cplValue <= 600) {

                statusEl.innerText = '⚠️ 警告 - 需优化';

                statusEl.className = 'text-xs mt-2 text-right text-yellow-400';

            } else {

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

}

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

const delay = ms => new Promise(res => setTimeout(res, ms));



async function callGeminiAPI(prompt) {

    const apiKey = localStorage.getItem('tds_gemini_api_key');

    if (!apiKey) {

        if (confirm('需配置 API Key 才能使用此功能。去配置？')) configureSettings();

        return null;

    }



    // Full Spectrum Cluster (Starting with User Requested 2.5)

    const models = [

        'gemini-2.5-flash',          // Requested by User

        'gemini-2.0-flash',

        'gemini-2.0-flash-001',

        'gemini-2.0-flash-lite-001',

        'gemini-2.0-flash-exp'

    ];



    for (let i = 0; i < models.length; i++) {

        const model = models[i];

        try {

            console.log(`Trying model: ${model}...`);

            // Dynamic URL for Cluster Bomb Strategy

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({

                    contents: [{ parts: [{ text: prompt }] }],

                    generationConfig: { temperature: 0.7 }

                })

            });



            // 429 (Rate Limit) or 503 (Overloaded)

            if (response.status === 429 || response.status === 503) {

                console.warn(`${model} hit limit (${response.status}).`);



                if (i === models.length - 1) {

                    showToast('所有通道均繁忙 (429)，请休息 1 分钟后再试', 'error');

                    throw new Error('All models exhaustion');

                }



                const waitTime = (i + 1) * 2000; // Exponential: 2s, 4s, 6s...

                showToast(`通道 ${model} 拥堵，${waitTime / 1000}秒后切换备用线路...`, 'info');

                await delay(waitTime);

                continue;

            }



            if (!response.ok) {

                const err = await response.json();

                throw new Error(err.error?.message || 'Unknown API Error');

            }



            const data = await response.json();

            return data.candidates[0]?.content?.parts[0]?.text || '';



        } catch (error) {

            console.error(`Error with ${model}:`, error);

            // If last model failed

            if (i === models.length - 1) {

                showToast(`生成失败: ${error.message}`, 'error');

                return null;

            }

        }

    }

    return null;

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
// AI: Ad Doctor 2.0 (Deep Diagnosis)
// ----------------------------------------

async function analyzeAdsWithAI() {
    const dataInput = document.getElementById('ad-data-input');
    const platform = document.getElementById('platform-select').value;

    if (!dataInput || !dataInput.value.trim()) {
        return showToast('请先贴入数据或上传表格', 'warning');
    }

    const rawData = dataInput.value.trim();
    const resultContainer = document.getElementById('ad-doctor-result');
    const placeholder = document.getElementById('ad-doctor-placeholder');
    const loading = document.getElementById('ad-doctor-loading');
    const content = document.getElementById('ad-doctor-content');

    // UI State: Loading
    if (placeholder) placeholder.classList.add('hidden');
    if (content) content.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');

    const persona = localStorage.getItem('tds_target_audience') || 'General Audience';

    const prompt = `
    Role: Senior Media Buyer (10+ years exp).
    Task: Diagnose this ad campaign data for ${platform}.
    Target Audience: ${persona}.
    Output Language: Simplified Chinese (简体中文).
    
    Data:
    ${rawData.substring(0, 10000)}

    Output Requirement (Strict JSON):
    {
        "score": 85,
        "health_tag": "优质 / 良好 / 风险 / 严重",
        "gems": [
            "广告组 A (ROAS 3.5) 表现优异...",
            "素材 B 点击率极高 (2.1%)..."
        ],
        "wasters": [
            "计划 X 消耗 $500 且 0 转化...",
            "视频 Y CPM 过高 ($40)..."
        ],
        "strategy": {
            "evaluation": "整体健康，但出现素材疲劳迹象...",
            "suggestions": [
                "立即关停计划 X",
                "每日按 20% 预算扩量广告组 A",
                "测试新的 UGC 视频以对抗疲劳"
            ],
            "judgment": "GO: 继续持有（加大投入）" OR "NO-GO: 暂停整顿（止损）"
        }
    }
    
    IMPORTANT RULES:
    1. **Prioritize CPA/ROAS/ROI**: Do NOT judge efficiency solely by CPM or CPC. A high CPM is acceptable if the CPA (Cost per Result) is low. 
       - Example: If Campaign A has CPM $10 but CPA $5, and Campaign B has CPM $2 but CPA $8, Campaign A is BETTER.
    2. **Explicitly Calculate Metrics**: For "gems" and "wasters", calculate and mention the Reference Metric (e.g., "(CPA $3.50 vs Avg $5.00)").
    3. **Context Matters**: Identify the goal (e.g., Fan Growth vs Sales). Use the appropriate metric (Cost Per Follower vs Cost Per Purchase).
    `;

    try {
        const result = await callGeminiAPI(prompt + "\n\nEnsure valid JSON.");
        if (result) {
            const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
            const diagnosis = JSON.parse(jsonStr);
            renderAdDoctorResult(diagnosis);
        } else {
            throw new Error('API Empty');
        }
    } catch (e) {
        console.error("Ad Doctor Error:", e);
        showToast('诊断失败，请检查数据格式', 'error');
        if (loading) loading.classList.add('hidden');
        if (placeholder) placeholder.classList.remove('hidden');
    }
}

async function askAdDoctor() {
    const input = document.getElementById('ad-qa-input');
    const resultDiv = document.getElementById('ad-qa-result');
    const question = input.value.trim();
    const data = document.getElementById('ad-data-input').value.trim();

    if (!question) return showToast('请输入问题', 'warning');
    if (!data) return showToast('请先导入数据', 'warning');

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = '<span class="animate-pulse">🤔 正在分析数据...</span>';

    const prompt = `
    Data Context:
    ${data.substring(0, 5000)}

    User Question: "${question}"

    Task: Answer the question based on the data. Perform calculations (e.g., CPM = Cost/Impressions*1000) if needed. 
    Output Language: Simplified Chinese. Keep it concise.
    `;

    const answer = await callGeminiAPI(prompt);

    if (answer) {
        resultDiv.innerHTML = marked(answer);
        input.value = ''; // Clear input
    } else {
        resultDiv.innerText = '无法回答，请重试';
    }
}

function renderAdDoctorResult(data) {
    const loading = document.getElementById('ad-doctor-loading');
    const content = document.getElementById('ad-doctor-content');

    if (loading) loading.classList.add('hidden');
    if (content) content.classList.remove('hidden');

    // 1. Score & Status
    const scoreEl = document.getElementById('ad-health-score');
    const tagEl = document.getElementById('ad-health-tag');

    if (scoreEl) {
        scoreEl.innerText = data.score;
        scoreEl.className = `text-4xl font-black ${data.score >= 80 ? 'text-green-500' : (data.score >= 60 ? 'text-yellow-500' : 'text-red-500')}`;
    }

    if (tagEl) {
        tagEl.innerText = data.health_tag;
        tagEl.className = `px-3 py-1 rounded text-sm font-bold border ${data.score >= 80 ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30' : (data.score >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30' : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30')}`;
    }

    // 2. Gems (Hidden Gems)
    const gemsList = document.getElementById('ad-gems-list');
    if (gemsList) {
        gemsList.innerHTML = data.gems.map(g => `<li class="text-green-900 dark:text-green-200">${g}</li>`).join('');
    }

    // 3. Wasters (Budget Wasters)
    const wastersList = document.getElementById('ad-wasters-list');
    if (wastersList) {
        wastersList.innerHTML = data.wasters.map(w => `<li class="text-red-900 dark:text-red-200">${w}</li>`).join('');
    }

    // 4. Strategy & Judgment
    const strategyContent = document.getElementById('ad-strategy-content');
    if (strategyContent) {
        const strategyHtml = `
            <div class="mb-4 text-gray-800 dark:text-gray-200">
                <span class="text-blue-600 dark:text-blue-400 font-bold">[评估]:</span> ${data.strategy.evaluation}
            </div>
            <div class="mb-4">
                <div class="text-blue-600 dark:text-blue-400 font-bold mb-1">[建议]:</div>
                <ul class="list-decimal pl-4 space-y-1 text-gray-700 dark:text-gray-300">
                    ${data.strategy.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            <div class="p-2 rounded border-l-4 ${data.strategy.judgment.includes('GO') ? 'bg-green-50 border-green-500 text-green-900 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-300'} font-bold">
                ${data.strategy.judgment}
            </div>
        `;
        strategyContent.innerHTML = strategyHtml;
    }
}

function clearAdData() {
    const input = document.getElementById('ad-data-input');
    if (input) input.value = '';
    const file = document.getElementById('ad-file-upload');
    if (file) file.value = '';
    showToast('数据已清空', 'info');
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

}

// ----------------------------------------

// AI: Daily Briefing

// ----------------------------------------

async function generateDailyBriefing() {

    const btn = document.querySelector('#briefing-title').parentNode.nextElementSibling; // Finding the button relative to title

    const contentDiv = document.getElementById('briefing-content');

    // UI

    contentDiv.innerHTML = '<div class="animate-pulse text-purple-400">🛰️ 正在从各模块聚合情报...</div>';

    // Data

    const budgetLeft = (parseFloat(localStorage.getItem('tds_total') || 266664) - parseFloat(localStorage.getItem('tds_spent') || 79600));

    const nextExpo = expos.length > 0 ? expos[0].name : "无";

    const cpl = localStorage.getItem('tds_last_cpl') || 'N/A';

    const persona = localStorage.getItem('tds_target_audience') || 'General';

    const prompt = `Role: CMO. Context: Budget Left ¥${budgetLeft}, Next Expo ${nextExpo}, CPL ${cpl}, Audience ${persona}.\nTask: Write a 3-bullet morning briefing (Alert, Insight, Action). Professional tone. Under 100 words.`;

    const result = await callGeminiAPI(prompt);

    if (result) {

        contentDiv.innerHTML = `<div class="prose prose-invert max-w-none text-sm leading-6">${marked(result)}</div>`;

        localStorage.setItem('tds_last_briefing', result);

    } else {

        contentDiv.innerText = '暂时无法连接战略中心';

    }

}

// ----------------------------------------

// AI: Social Matrix

// ----------------------------------------

async function generateSocialMatrix() {
    const topic = document.getElementById('brand-theme').value; // Changed from matrix-topic to valid ID in index.html (wait, let me check index.html again)
    // Actually index.html has <input id="brand-theme"> and <input id="brand-product">
    // The previous code had `document.getElementById('matrix-topic')`. This was definitely a bug.
    // I need to use the correct IDs from index.html.

    const theme = document.getElementById('brand-theme').value;
    const product = document.getElementById('brand-product').value;
    const tone = document.getElementById('brand-tone').value;
    const lang = document.getElementById('brand-lang').value || 'Chinese';

    if (!theme) return showToast('请输入核心主题', 'warning');

    // UI Loading State
    const outputArea = document.querySelector('.col-span-12.lg\\:col-span-8'); // Rough selector for area
    const loading = document.getElementById('brand-loading');
    const placeholder = document.getElementById('brand-placeholder');
    const channels = document.getElementById('brand-channels');
    const coreCard = document.getElementById('brand-core-card');

    placeholder.classList.add('hidden');
    channels.classList.add('hidden');
    coreCard.classList.add('hidden');
    loading.classList.remove('hidden');

    // Platforms
    const platforms = ['linkedin', 'twitter', 'instagram', 'blog', 'facebook', 'youtube'];

    const prompt = `
        Role: Senior Content Marketing Manager.
        Task: Generate a social media content matrix efficiently.
        
        Context:
        - Big Idea (Theme): "${theme}"
        - Product/Service: "${product}"
        - Tone of Voice: ${tone}
        - Target Audience: Professional / Gen Z (depends on platform)
        - Output Language: ${lang}

        Requirements:
        1. **Core Concept**: A single, powerful campaign slogan (1 sentence).
        2. **Platform Content**:
           - **LinkedIn**: Professional insight, industry trends. (150 words)
           - **Twitter (X)**: Short, viral hook, hashtag. (280 chars)
           - **Instagram**: Visual description + Caption with emojis.
           - **Blog/Newsletter**: Outline with 3 key takeaways.
           - **Facebook**: Community focused, engaging question.
           - **YouTube**: Video Title + Description (SEO optimized).

        Output Format (Strict JSON):
        {
            "core_concept": "...",
            "linkedin": "...",
            "twitter": "...",
            "instagram": "...",
            "blog": "...",
            "facebook": "...",
            "youtube": "..."
        }
    `;

    try {
        const result = await callGeminiAPI(prompt + "\n\nEnsure valid JSON.");
        if (!result) throw new Error('API Empty');

        const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Render Core
        document.getElementById('brand-core-text').innerText = data.core_concept || theme;
        coreCard.classList.remove('hidden');

        // Render Platforms
        platforms.forEach(p => {
            const el = document.getElementById(`content-${p}`);
            if (el) el.innerText = data[p] || 'Content generation failed.';

            // Show parent card if hidden
            const card = document.getElementById(`card-${p}`);
            if (card) card.classList.remove('hidden');
        });

        loading.classList.add('hidden');
        channels.classList.remove('hidden');
        showToast('全网矩阵内容生成成功！', 'success');

    } catch (e) {
        console.error("Matrix Error", e);
        showToast('生成失败: ' + e.message, 'error');
        loading.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }
}

function copyAndGo(platform, elementId) {
    const text = document.getElementById(elementId).innerText;
    if (!text) return showToast('没有可复制的内容', 'warning');

    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制！正在前往发布页面...', 'success');

        const urls = {
            'linkedin': 'https://www.linkedin.com/feed/',
            'twitter': 'https://twitter.com/compose/tweet',
            'instagram': 'https://www.instagram.com/',
            'blog': 'https://wordpress.com/post', // Generic fallback
            'facebook': 'https://www.facebook.com/',
            'youtube': 'https://studio.youtube.com/'
        };

        const url = urls[platform] || 'https://google.com';
        setTimeout(() => window.open(url, '_blank'), 1500);
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


// ==========================================
// AI: Brand Content (Guarded)
// ==========================================
async function generateBrandContent() {
    const themeEl = document.getElementById('brand-theme');
    const prodEl = document.getElementById('brand-product');
    const toneEl = document.getElementById('brand-tone');

    if (!themeEl || !prodEl || !toneEl) {
        console.warn("Brand generation elements missing in this view.");
        return;
    }

    const theme = themeEl.value;
    const product = prodEl.value;
    const tone = toneEl.value;

    if (!theme || !product) return showToast('请输入核心主题和产品名称', 'warning');

    // Get Selected Platforms
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-checkbox:checked')).map(cb => cb.value);
    if (selectedPlatforms.length === 0) return showToast('请至少选择一个发布平台', 'warning');

    // UI Loading
    document.getElementById('brand-placeholder').classList.add('hidden');
    document.getElementById('brand-loading').classList.remove('hidden');
    document.getElementById('brand-channels').classList.add('hidden');
    document.getElementById('brand-core-card').classList.add('hidden');

    // Reset output visibilities
    ['linkedin', 'twitter', 'instagram', 'blog', 'facebook', 'youtube'].forEach(p => {
        const el = document.getElementById(`card-${p}`);
        if (el) el.classList.add('hidden');
    });

    // Construct Dynamic Prompt
    let deliverables = [];
    deliverables.push(`1. core_concept: A 1-sentence "Big Idea" slogan/hook.`);

    if (selectedPlatforms.includes('linkedin')) deliverables.push(`- linkedin_post: Professional B2B insight.`);
    if (selectedPlatforms.includes('twitter')) deliverables.push(`- twitter_thread: Viral hook + 3 bullets.`);
    if (selectedPlatforms.includes('instagram')) deliverables.push(`- instagram_caption: Lifestyle vibe + visual cue.`);
    if (selectedPlatforms.includes('blog')) deliverables.push(`- blog_outline: Title + 3 headers.`);
    if (selectedPlatforms.includes('facebook')) deliverables.push(`- facebook_post: Engaging community question + soft sell.`);
    if (selectedPlatforms.includes('youtube')) deliverables.push(`- youtube_desc: SEO optimized video description + title.`);

    const prompt = `
    Role: Chief Content Officer (CCO).
    Task: Create multi-channel content.
    Theme: "${theme}"
    Product: "${product}"
    Tone: "${tone}"

    Deliverables (JSON):
    ${deliverables.join('\n    ')}

    Return STRICT JSON with keys: "core_concept", ${selectedPlatforms.map(p => `"${p === 'twitter' ? 'twitter_thread' : (p === 'instagram' ? 'instagram_caption' : (p === 'blog' ? 'blog_outline' : (p === 'youtube' ? 'youtube_desc' : p + '_post')))}"`).join(', ')}.
    `;

    try {
        const result = await callGeminiAPI(prompt + "\n\nEnsure valid JSON.");
        if (result) {
            const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr);

            // Render Core
            document.getElementById('brand-core-text').innerText = data.core_concept || '生成中...';
            document.getElementById('brand-core-card').classList.remove('hidden');
            document.getElementById('brand-channels').classList.remove('hidden');

            // Render Channels
            const mapping = {
                'linkedin': 'linkedin_post',
                'twitter': 'twitter_thread',
                'instagram': 'instagram_caption',
                'blog': 'blog_outline',
                'facebook': 'facebook_post',
                'youtube': 'youtube_desc'
            };

            selectedPlatforms.forEach(p => {
                const key = mapping[p];
                if (data[key]) {
                    const el = document.getElementById(`content-${p}`);
                    const card = document.getElementById(`card-${p}`);
                    if (el && card) {
                        el.innerText = data[key];
                        card.classList.remove('hidden');
                    }
                }
            });

            document.getElementById('brand-channels').classList.remove('hidden');
            showToast('全渠道内容矩阵已生成', 'success');
        }
    } catch (e) {
        console.error(e);
        showToast('生成失败，请重试', 'error');
    } finally {
        document.getElementById('brand-loading').classList.add('hidden');
    }
}

// ==========================================
// Dashboard Briefing Logic
// ==========================================
async function generateBriefing() {
    const contentEl = document.getElementById('briefing-content');
    if (!contentEl) return;

    const originalText = contentEl.innerText;

    // UI Loading State
    contentEl.innerText = "🤖 正在分析全盘数据，生成今日战略简报...";
    contentEl.classList.add('animate-pulse');

    // Gather Context
    const budget = document.getElementById('dash-budget')?.innerText || '¥0';
    const cpl = document.getElementById('dash-cpl')?.innerText || '¥0';

    const prompt = `
    Role: Strategic Marketing Advisor.
    Context:
    - Current Burn Rate: ${budget}
    - Average CPL: ${cpl}
    - Date: ${new Date().toLocaleDateString()}
    
    Task: Generate a 1-paragraph "Morning Briefing" for the Marketing Director.
    Style: Professional, concise, actionable. No yapping.
    Focus: Any anomalies in budget or CPL (if zero, assume new setup), and one strategic tip for B2B lead gen today.
    Language: Chinese.
    `;

    try {
        const result = await callGeminiAPI(prompt);
        if (result) {
            contentDiv = document.getElementById('briefing-content'); // Re-grab to be safe
            if (contentDiv) {
                contentDiv.innerText = result;
                contentDiv.classList.remove('animate-pulse');
            }
            showToast('今日简报已生成', 'success');
        } else {
            throw new Error('Empty response');
        }
    } catch (e) {
        console.error("Briefing Error:", e);
        if (contentEl) contentEl.innerText = "生成失败，请检查网络或 API Key。";
        showToast('简报生成失败', 'error');
    }
}

// ----------------------------------------
// Ad Doctor: File Handling
// ----------------------------------------
function handleAdFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = e.target.result;
        let textResult = "";

        if (file.name.endsWith('.csv') || file.type === 'text/csv') {
            textResult = data; // Simple CSV text
        } else {
            // Assume Excel (requires XLSX)
            try {
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheet];
                // Convert to CSV format for Gemini to read easily
                textResult = XLSX.utils.sheet_to_csv(worksheet);
            } catch (err) {
                console.error(err);
                if (typeof XLSX === 'undefined') {
                    showToast('错误: XLSX 库未加载', 'error');
                } else {
                    showToast('Excel 解析失败，请检查格式', 'error');
                }
                return;
            }
        }

        const textArea = document.getElementById('ad-data-input');
        if (textArea) {
            textArea.value = textResult;
            showToast('数据导入成功 (' + file.name + ')', 'success');
        }
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
}

// ==========================================
// 9. Mobile Adaptation & UX (Phase 12)
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    // Check if showing or hiding
    const isClosed = sidebar.classList.contains('-translate-x-full');

    if (isClosed) {
        // Open
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        // Close
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

// Inject Skeleton CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes pulse-fast {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    .skeleton {
        background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
        color: transparent !important;
        user-select: none;
    }
    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
`;
document.head.appendChild(styleSheet);

// Helper to show skeleton
function showSkeleton(elementId, height = 'h-24') {
    const el = document.getElementById(elementId);
    if (el) {
        el.dataset.originalContent = el.innerHTML; // Save content
        el.innerHTML = `<div class="skeleton w-full ${height}"></div>`;
    }
}

function hideSkeleton(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        // AI usually replaces content, so we might not need to restore.
        // But if needed: el.innerHTML = el.dataset.originalContent;
        el.classList.remove('skeleton'); // Just in case
    }
}

// ==========================================
// 10. Competitor Watch (Phase 12)
// ==========================================
async function analyzeCompetitor() {
    const name = document.getElementById('comp-name').value;
    const text = document.getElementById('comp-text').value;

    if (!name || !text) return showToast('请填写竞对名称和文案素材', 'warning');

    showSkeleton('comp-result', 'h-64');

    const prompt = `
        你是一位顶级战略营销专家。
        我们的产品核心信息（从知识库提取）：
        ${JSON.stringify(productDB.slice(0, 3).map(p => p.name + ':' + p.pain))}

        竞争对手名称: ${name}
        竞争对手文案:
        "${text}"

        请进行深度分析并输出为 HTML (无 Markdown)：
        1. **SWOT 分析**: 针对该竞对文案的优劣势。
        2. **降维打击策略**: 我们应该如何反击？提供 3 个具体的切入点。
        3. **差异化话术**: 生成一段针对性的销售话术 (Pitch)，突出我们的优势，压制对方的劣势。

        格式要求：
        使用 <div class="p-4 bg-slate-800 rounded mb-4"> 包裹每个板块。
        标题使用 <h3 class="text-lg font-bold text-blue-400 mb-2">。
        列表使用 <ul class="list-disc pl-5 space-y-1 text-sm text-gray-300">。
    `;

    const result = await callGeminiAPI(prompt);

    hideSkeleton('comp-result');

    if (result) {
        document.getElementById('comp-result').innerHTML = result;
        showToast('竞对分析报告已生成', 'success');
    } else {
        document.getElementById('comp-result').innerHTML = '<span class="text-red-500">生成失败，请重试</span>';
    }
}


// ==========================================
// Phase 15: Data Intelligence - Inquiry Trend & Lead Scoring
// ==========================================

// Helper: Get last N days
function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

function isThisWeek(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return date >= weekStart;
}

function isLastWeek(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const lastWeekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
    const lastWeekEnd = new Date(now.setDate(now.getDate() - now.getDay()));
    return date >= lastWeekStart && date < lastWeekEnd;
}

// Initialize sample data if none exists
function initInquiryData() {
    if (localStorage.getItem('tds_inquiries')) return;

    const sample = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Random 0-3 inquiries per day
        const count = Math.floor(Math.random() * 4);
        for (let j = 0; j < count; j++) {
            sample.push({
                id: Date.now() + i * 100 + j,
                date: dateStr,
                source: ['website', 'email', 'exhibition'][Math.floor(Math.random() * 3)],
                company: `Sample Corp ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                value: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                score: 30 + Math.floor(Math.random() * 70)
            });
        }
    }
    localStorage.setItem('tds_inquiries', JSON.stringify(sample));
}

// Render Inquiry Trend Chart
function renderInquiryTrend() {
    const inquiries = JSON.parse(localStorage.getItem('tds_inquiries') || '[]');
    const last30Days = getLast30Days();
    const dataByDate = {};

    last30Days.forEach(date => dataByDate[date] = 0);
    inquiries.forEach(inq => {
        if (dataByDate.hasOwnProperty(inq.date)) {
            dataByDate[inq.date]++;
        }
    });

    const labels = Object.keys(dataByDate).map(d => {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const data = Object.values(dataByDate);

    // Render Chart
    const canvas = document.getElementById('inquiry-trend-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '询盘数量',
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                x: {
                    ticks: { color: '#9ca3af', maxRotation: 0 },
                    grid: { display: false }
                }
            }
        }
    });

    updateInquiryStats(inquiries);
}

function updateInquiryStats(inquiries) {
    const thisWeek = inquiries.filter(inq => isThisWeek(inq.date)).length;
    const lastWeek = inquiries.filter(inq => isLastWeek(inq.date)).length;

    const weekCountEl = document.getElementById('week-count');
    const weekChangeEl = document.getElementById('week-change');
    const highValueRatioEl = document.getElementById('high-value-ratio');

    if (weekCountEl) weekCountEl.innerText = thisWeek;

    if (weekChangeEl) {
        const change = lastWeek === 0 ? 'N/A' : `${((thisWeek - lastWeek) / lastWeek * 100).toFixed(0)}%`;
        weekChangeEl.innerText = change;
        weekChangeEl.className = `text-lg font-bold ${thisWeek >= lastWeek ? 'text-green-400' : 'text-red-400'}`;
    }

    if (highValueRatioEl) {
        const highValueCount = inquiries.filter(inq => inq.value === 'high').length;
        const ratio = inquiries.length === 0 ? 0 : (highValueCount / inquiries.length * 100).toFixed(0);
        highValueRatioEl.innerText = `${ratio}%`;
    }
}

// Lead Scoring System
function calculateLeadScore(parsedData) {
    let score = 30; // Base score

    // 1. Quantity (max 30 points)
    const qty = parseInt(parsedData.quantity) || 0;
    if (qty >= 10000) score += 30;
    else if (qty >= 1000) score += 20;
    else if (qty >= 100) score += 10;

    // 2. Budget mentioned (20 points)
    if (parsedData.budget_mentioned || parsedData.budget) score += 20;

    // 3. Urgency (15 points)
    const urgency = (parsedData.urgency || '').toLowerCase();
    if (urgency.includes('urgent') || urgency.includes('asap')) score += 15;

    // 4. Company info completeness (15 points)
    if (parsedData.company_name || parsedData.company) score += 5;
    if (parsedData.website) score += 5;
    if (parsedData.phone || parsedData.telephone) score += 5;

    // 5. Decision maker level (10 points)
    const title = (parsedData.contact_title || parsedData.title || '').toLowerCase();
    if (title.includes('ceo') || title.includes('owner') || title.includes('director') || title.includes('president')) {
        score += 10;
    } else if (title.includes('manager') || title.includes('head')) {
        score += 5;
    }

    // 6. Returning customer bonus (10 points)
    if (parsedData.is_repeat || isExistingCustomer(parsedData.email)) {
        score += 10;
    }

    return Math.min(score, 100);
}

function getScoreLabel(score) {
    if (score >= 70) return { text: '🔥 高价值线索', class: 'red', bg: 'bg-red-500' };
    if (score >= 40) return { text: '⚡ 中等线索', class: 'yellow', bg: 'bg-yellow-500' };
    return { text: '❄️ 低优先级', class: 'gray', bg: 'bg-gray-500' };
}

function isExistingCustomer(email) {
    const crmLeads = JSON.parse(localStorage.getItem('tds_crm_leads') || '[]');
    return crmLeads.some(lead => lead.email === email);
}

// Save inquiry to trend data
function saveInquiryRecord(record) {
    const inquiries = JSON.parse(localStorage.getItem('tds_inquiries') || '[]');
    inquiries.unshift({ id: Date.now(), ...record });
    // Keep only last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const filtered = inquiries.filter(inq => new Date(inq.date) >= cutoff);
    localStorage.setItem('tds_inquiries', JSON.stringify(filtered));
}

// Expose for external modules (like RFQ decoder)
window.calculateLeadScore = calculateLeadScore;
window.getScoreLabel = getScoreLabel;
window.saveInquiryRecord = saveInquiryRecord;

// Initialize on load
(function () {
    initInquiryData();
    // Render trend chart after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderInquiryTrend);
    } else {
        renderInquiryTrend();
    }
})();

// ==========================================
// Phase 16: Follow-up Reminder System
// ==========================================

// Get today's date string
function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

// Get all followups
function getFollowups() {
    return JSON.parse(localStorage.getItem('tds_followups') || '[]');
}

// Save followups
function saveFollowups(followups) {
    localStorage.setItem('tds_followups', JSON.stringify(followups));
}

// Get today's and overdue followups
function getTodayFollowups() {
    const followups = getFollowups();
    const today = getTodayStr();

    return followups.filter(f =>
        f.status === 'pending' && f.dueDate <= today
    ).sort((a, b) => {
        // Overdue first, then by priority
        if (a.dueDate < today && b.dueDate >= today) return -1;
        if (b.dueDate < today && a.dueDate >= today) return 1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

// Render today's followups in dashboard
function renderTodayFollowups() {
    const container = document.getElementById('followup-list');
    if (!container) return;

    const tasks = getTodayFollowups();
    const today = getTodayStr();

    if (tasks.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-sm text-center py-4">✅ 暂无跟进任务</div>';
        return;
    }

    container.innerHTML = tasks.slice(0, 5).map(task => {
        const isOverdue = task.dueDate < today;
        const priorityColor = {
            high: 'bg-red-500',
            medium: 'bg-yellow-500',
            low: 'bg-gray-500'
        }[task.priority];

        return `
        <div class="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition cursor-pointer" onclick="showFollowupDetail('${task.id}')">
            <div class="w-2 h-2 rounded-full ${priorityColor}"></div>
            <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-white truncate">${task.customerName || '未命名客户'}</div>
                <div class="text-xs text-gray-400 truncate">${task.action || '跟进'} ${isOverdue ? '<span class="text-red-400">· 已逾期</span>' : ''}</div>
            </div>
            <button onclick="event.stopPropagation(); completeFollowup('${task.id}')" class="text-green-500 hover:text-green-400 text-lg" title="完成">✓</button>
        </div>
        `;
    }).join('');

    if (tasks.length > 5) {
        container.innerHTML += `<div class="text-center text-xs text-gray-500 mt-2">还有 ${tasks.length - 5} 个任务...</div>`;
    }
}

// Create new followup
function createFollowup(data) {
    const followups = getFollowups();
    const newTask = {
        id: Date.now().toString(),
        customerId: data.customerId || '',
        customerName: data.customerName || '',
        action: data.action || 'follow_up',
        dueDate: data.dueDate || addDaysToDate(new Date(), 3),
        priority: data.priority || 'medium',
        status: 'pending',
        notes: data.notes || '',
        createdAt: getTodayStr()
    };
    followups.unshift(newTask);
    saveFollowups(followups);
    renderTodayFollowups();
    return newTask;
}

// Helper: Add days to date
function addDaysToDate(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
}

// Complete a followup
function completeFollowup(id) {
    const followups = getFollowups();
    const idx = followups.findIndex(f => f.id === id);
    if (idx !== -1) {
        followups[idx].status = 'done';
        followups[idx].completedAt = getTodayStr();
        saveFollowups(followups);
        renderTodayFollowups();
        showToast('✅ 跟进任务已完成', 'success');
    }
}

// Check for overdue followups (call on page load)
function checkOverdueFollowups() {
    const followups = getFollowups();
    const today = getTodayStr();

    const overdue = followups.filter(f =>
        f.status === 'pending' && f.dueDate < today
    );

    if (overdue.length > 0) {
        showToast(`⚠️ 您有 ${overdue.length} 个逾期跟进任务!`, 'warning');
    }
}

// Show add followup modal
function showAddFollowupModal() {
    const modal = document.createElement('div');
    modal.id = 'followup-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
    <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">📝 添加跟进任务</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm text-gray-400 mb-1">客户名称</label>
                <input type="text" id="followup-customer" class="input-box w-full" placeholder="输入客户名称...">
            </div>
            <div>
                <label class="block text-sm text-gray-400 mb-1">跟进类型</label>
                <select id="followup-action" class="input-box w-full">
                    <option value="initial_followup">首次跟进</option>
                    <option value="quote_followup">报价跟进</option>
                    <option value="sample_followup">样品跟进</option>
                    <option value="order_followup">订单跟进</option>
                    <option value="payment_reminder">付款提醒</option>
                    <option value="other">其他</option>
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">截止日期</label>
                    <input type="date" id="followup-date" class="input-box w-full" value="${addDaysToDate(new Date(), 3)}">
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">优先级</label>
                    <select id="followup-priority" class="input-box w-full">
                        <option value="high">🔴 高</option>
                        <option value="medium" selected>🟡 中</option>
                        <option value="low">⚪ 低</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm text-gray-400 mb-1">备注</label>
                <textarea id="followup-notes" class="input-box w-full" rows="2" placeholder="备注信息..."></textarea>
            </div>
        </div>
        <div class="flex gap-3 mt-6">
            <button onclick="saveNewFollowup()" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition">保存</button>
            <button onclick="closeFollowupModal()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition">取消</button>
        </div>
    </div>
    `;
    document.body.appendChild(modal);
}

// Save new followup from modal
function saveNewFollowup() {
    const customer = document.getElementById('followup-customer').value.trim();
    if (!customer) {
        showToast('请输入客户名称', 'warning');
        return;
    }

    createFollowup({
        customerName: customer,
        action: document.getElementById('followup-action').value,
        dueDate: document.getElementById('followup-date').value,
        priority: document.getElementById('followup-priority').value,
        notes: document.getElementById('followup-notes').value
    });

    closeFollowupModal();
    showToast('✅ 跟进任务已创建', 'success');
}

// Close modal
function closeFollowupModal() {
    const modal = document.getElementById('followup-modal');
    if (modal) modal.remove();
}

// Show all followups (placeholder - could open a dedicated view)
function showAllFollowups() {
    const followups = getFollowups().filter(f => f.status === 'pending');
    if (followups.length === 0) {
        showToast('暂无待处理的跟进任务', 'info');
        return;
    }

    const list = followups.map(f => `• ${f.customerName} - ${f.action} (${f.dueDate})`).join('\n');
    alert(`📋 全部待跟进任务 (${followups.length})\n\n${list}`);
}

// Show followup detail (placeholder)
function showFollowupDetail(id) {
    const followups = getFollowups();
    const task = followups.find(f => f.id === id);
    if (task) {
        alert(`📝 跟进详情\n\n客户: ${task.customerName}\n类型: ${task.action}\n日期: ${task.dueDate}\n优先级: ${task.priority}\n备注: ${task.notes || '无'}`);
    }
}

// Expose for CRM integration
window.createFollowup = createFollowup;

// Initialize on load
(function () {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderTodayFollowups();
            setTimeout(checkOverdueFollowups, 2000); // Check after 2s
        });
    } else {
        renderTodayFollowups();
        setTimeout(checkOverdueFollowups, 2000);
    }
})();

// ==========================================
// Phase 16: Email Template Library
// ==========================================

let currentEditingTemplateId = null;

// Get all templates
function getEmailTemplates() {
    return JSON.parse(localStorage.getItem('tds_email_templates') || '[]');
}

// Save templates
function saveEmailTemplates(templates) {
    localStorage.setItem('tds_email_templates', JSON.stringify(templates));
}

// Render template list
function renderTemplateList() {
    const container = document.getElementById('template-list');
    if (!container) return;

    const filter = document.getElementById('template-category-filter')?.value || 'all';
    let templates = getEmailTemplates();

    if (filter !== 'all') {
        templates = templates.filter(t => t.category === filter);
    }

    if (templates.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-sm text-center py-8">暂无模板</div>';
        return;
    }

    const categoryNames = {
        inquiry_reply: '询盘回复',
        follow_up: '跟进邮件',
        quote_send: '报价发送',
        sample_confirm: '样品确认',
        holiday: '节日问候',
        post_exhibition: '展后感谢'
    };

    container.innerHTML = templates.map(t => `
    <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition cursor-pointer ${currentEditingTemplateId === t.id ? 'ring-2 ring-blue-500' : ''}" onclick="loadTemplate('${t.id}')">
        <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">${t.name}</div>
            <div class="text-xs text-gray-500">${categoryNames[t.category] || t.category} · ${t.language}</div>
        </div>
        <button onclick="event.stopPropagation(); deleteTemplate('${t.id}')" class="text-red-400 hover:text-red-300 text-sm" title="删除">🗑️</button>
    </div>
    `).join('');
}

// Filter templates
function filterTemplates() {
    renderTemplateList();
}

// Create new template
function createNewTemplate() {
    currentEditingTemplateId = null;
    document.getElementById('tpl-name').value = '';
    document.getElementById('tpl-category').value = 'inquiry_reply';
    document.getElementById('tpl-lang').value = 'English';
    document.getElementById('tpl-subject').value = '';
    document.getElementById('tpl-content').value = '';
    document.getElementById('tpl-preview').innerHTML = '<em class="text-gray-500">编辑内容后在此预览...</em>';
    showToast('✏️ 开始编辑新模板', 'info');
}

// Load template for editing
function loadTemplate(id) {
    const templates = getEmailTemplates();
    const template = templates.find(t => t.id === id);
    if (!template) return;

    currentEditingTemplateId = id;
    document.getElementById('tpl-name').value = template.name;
    document.getElementById('tpl-category').value = template.category;
    document.getElementById('tpl-lang').value = template.language;
    document.getElementById('tpl-subject').value = template.subject || '';
    document.getElementById('tpl-content').value = template.content || '';

    updateTemplatePreview();
    renderTemplateList();
}

// Save template
function saveTemplate() {
    const name = document.getElementById('tpl-name').value.trim();
    if (!name) {
        showToast('请输入模板名称', 'warning');
        return;
    }

    const template = {
        id: currentEditingTemplateId || Date.now().toString(),
        name: name,
        category: document.getElementById('tpl-category').value,
        language: document.getElementById('tpl-lang').value,
        subject: document.getElementById('tpl-subject').value,
        content: document.getElementById('tpl-content').value,
        updatedAt: getTodayStr()
    };

    const templates = getEmailTemplates();
    const existingIdx = templates.findIndex(t => t.id === template.id);

    if (existingIdx !== -1) {
        templates[existingIdx] = template;
    } else {
        template.createdAt = getTodayStr();
        templates.unshift(template);
    }

    saveEmailTemplates(templates);
    currentEditingTemplateId = template.id;
    renderTemplateList();
    showToast('💾 模板已保存', 'success');
}

// Delete template
function deleteTemplate(id) {
    if (!confirm('确定删除此模板？')) return;

    let templates = getEmailTemplates();
    templates = templates.filter(t => t.id !== id);
    saveEmailTemplates(templates);

    if (currentEditingTemplateId === id) {
        createNewTemplate();
    }

    renderTemplateList();
    showToast('🗑️ 模板已删除', 'info');
}

// Insert variable at cursor
function insertVariable(variable) {
    const textarea = document.getElementById('tpl-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    textarea.value = text.substring(0, start) + variable + text.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + variable.length, start + variable.length);

    updateTemplatePreview();
}

// Update preview
function updateTemplatePreview() {
    const content = document.getElementById('tpl-content').value;
    const subject = document.getElementById('tpl-subject').value;
    const preview = document.getElementById('tpl-preview');

    if (!content && !subject) {
        preview.innerHTML = '<em class="text-gray-500">编辑内容后在此预览...</em>';
        return;
    }

    // Replace variables with sample values
    const sampleValues = {
        '{{客户名}}': '<span class="text-blue-400">[John Smith]</span>',
        '{{公司名}}': '<span class="text-blue-400">[Your Company]</span>',
        '{{产品名}}': '<span class="text-blue-400">[LED Strip Light]</span>',
        '{{报价金额}}': '<span class="text-blue-400">[$5,000]</span>',
        '{{交期}}': '<span class="text-blue-400">[30 days]</span>',
        '{{我方姓名}}': '<span class="text-blue-400">[Morgan]</span>'
    };

    let previewContent = content;
    let previewSubject = subject;

    for (const [key, value] of Object.entries(sampleValues)) {
        previewContent = previewContent.split(key).join(value);
        previewSubject = previewSubject.split(key).join(value);
    }

    preview.innerHTML = `
        <div class="mb-2 pb-2 border-b border-gray-700">
            <span class="text-gray-500 text-xs">主题:</span>
            <span class="text-white">${previewSubject || '(无主题)'}</span>
        </div>
        <div class="whitespace-pre-wrap">${previewContent.replace(/\n/g, '<br>')}</div>
    `;
}

// Copy template content
function copyTemplateContent() {
    const subject = document.getElementById('tpl-subject').value;
    const content = document.getElementById('tpl-content').value;

    const fullContent = subject ? `Subject: ${subject}\n\n${content}` : content;

    navigator.clipboard.writeText(fullContent).then(() => {
        showToast('📋 邮件内容已复制', 'success');
    });
}

// AI Generate Template
async function aiGenerateTemplate() {
    const category = document.getElementById('tpl-category').value;
    const lang = document.getElementById('tpl-lang').value;

    const categoryDescriptions = {
        inquiry_reply: '回复客户询盘，感谢询问并提供产品信息',
        follow_up: '跟进未回复的客户，礼貌提醒并询问需求',
        quote_send: '发送报价单，介绍价格和付款条款',
        sample_confirm: '确认样品订单细节，包括规格和运费',
        holiday: '节日问候，表达祝福和合作期待',
        post_exhibition: '展会结束后感谢来访，继续保持联系'
    };

    const prompt = `
作为资深外贸销售专家，生成一封专业的外贸邮件模板。

类型: ${categoryDescriptions[category]}
语言: ${lang}

要求:
1. 语言必须是 ${lang}
2. 专业、友好但不过度热情
3. 包含明确的行动号召(CTA)
4. 使用以下变量占位符（保持双花括号格式）:
   - {{客户名}} - 客户姓名
   - {{产品名}} - 产品名称
   - {{公司名}} - 我方公司名
   - {{我方姓名}} - 销售人员姓名

输出格式:
第一行: 邮件主题（不要Subject:前缀）
空一行后: 邮件正文

只输出邮件内容，不要任何解释。
`;

    showToast('🤖 AI正在生成模板...', 'info');

    const result = await callGeminiAPI(prompt);

    if (result) {
        // Parse result: first line is subject, rest is content
        const lines = result.trim().split('\n');
        let subject = '';
        let content = '';

        if (lines.length > 0) {
            // First non-empty line is subject
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim()) {
                    subject = lines[i].trim().replace(/^Subject:\s*/i, '');
                    content = lines.slice(i + 1).join('\n').trim();
                    break;
                }
            }
        }

        document.getElementById('tpl-subject').value = subject;
        document.getElementById('tpl-content').value = content;
        updateTemplatePreview();

        showToast('✅ AI模板已生成', 'success');
    } else {
        showToast('❌ 生成失败，请重试', 'error');
    }
}

// Add event listener for live preview
document.addEventListener('DOMContentLoaded', () => {
    const contentInput = document.getElementById('tpl-content');
    const subjectInput = document.getElementById('tpl-subject');

    if (contentInput) {
        contentInput.addEventListener('input', updateTemplatePreview);
    }
    if (subjectInput) {
        subjectInput.addEventListener('input', updateTemplatePreview);
    }

    // Initial render
    renderTemplateList();
});

// ==========================================
// Phase 17: Multi-User Permission System
// ==========================================

// ⚠️ PLACEHOLDERS - Replace with actual values from user
const SUPABASE_URL = 'https://ftcaijvfvypcwjgetkvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Y2FpanZmdnlwY3dqZ2V0a3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzM0MDYsImV4cCI6MjA4MDE0OTQwNn0.TQ-ayMDAVizgCxEly_ahflzZYXnBYhQ1sBjQnZ636gQ';

let supabase = null;
let currentUser = null;
let userRole = null;
let allowedModules = [];

// Initialize Auth
function initAuth() {
    // Check if Supabase SDK is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase SDK not loaded');
        return;
    }

    // Check if credentials are configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        // Show config modal or alert
        console.warn('Supabase credentials not configured');
        // Temporarily bypass for demo/dev if needed, or enforce login
        // showAuthModal(); 
        return;
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Check session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                handleSessionSuccess(session);
            } else {
                showAuthModal();
            }
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                showAuthModal();
                currentUser = null;
                updateUserDisplay(null);
            } else if (event === 'SIGNED_IN' && session) {
                handleSessionSuccess(session);
            }
        });

    } catch (e) {
        console.error('Supabase init error:', e);
    }
}

async function handleSessionSuccess(session) {
    currentUser = session.user;
    hideAuthModal();
    await loadUserProfile();
    applyPermissions();
    showToast(`欢迎回来, ${currentUser.email}`, 'success');
}

// Load User Profile & Roles
async function loadUserProfile() {
    if (!supabase || !currentUser) return;

    // Fetch profile with roles
    // Note: This assumes the database structure is set up as per plan
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
                *,
                roles (name, display_name, allowed_modules)
            `)
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        if (profile) {
            // Flatten role data
            userRole = profile.roles?.name || 'sales';
            allowedModules = profile.roles?.allowed_modules || [];

            updateUserDisplay(profile);
        }
    } catch (e) {
        console.error('Error loading profile:', e);
        // Fallback for new users without profile yet
        userRole = 'sales';
        allowedModules = ['dashboard', 'rfq-decoder', 'email-templates', 'price-calculator', 'customer-deep-dive'];
        updateUserDisplay({ email: currentUser.email, roles: { display_name: '新用户' } });
    }
}

// Apply Permissions to UI
function applyPermissions() {
    if (!userRole) return;
    if (allowedModules.includes('all')) {
        // Show everything
        document.querySelectorAll('.nav-item').forEach(el => el.style.display = 'flex');
        return;
    }

    // Hide unauthorized modules
    document.querySelectorAll('.nav-item').forEach(item => {
        const onclick = item.getAttribute('onclick') || '';
        const match = onclick.match(/switchTab\(['"]([^'"]+)['"]\)/);

        // Default always show some basic items or check Tab ID
        if (match && match[1]) {
            const tabId = match[1];
            if (!allowedModules.includes(tabId)) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        }
    });
}

// UI Handlers
function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function showAuthError(msg) {
    const el = document.getElementById('auth-error');
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
    }
}

function updateUserDisplay(profile) {
    const el = document.getElementById('user-info');
    if (!el) return;

    if (profile) {
        el.innerHTML = `
            <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-white truncate">${profile.full_name || profile.email}</div>
                <div class="text-[10px] text-blue-400 truncate">${profile.roles?.display_name || userRole}</div>
            </div>
            <button onclick="handleLogout()" class="text-gray-500 hover:text-red-400" title="退出登录">
                🚪
            </button>
        `;
    } else {
        el.innerHTML = '<span class="text-xs text-gray-500">未登录</span>';
    }
}


// Auth Actions
window.handleLogin = async function () {
    if (!supabase) {
        alert('请先配置 Supabase URL 和 Key');
        return;
    }

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        showAuthError('请输入邮箱和密码');
        return;
    }

    showAuthError('登录中...'); // Reuse error box for status temporarily

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        showAuthError(error.message);
    }
    // Success is handled by onAuthStateChange
};

window.handleSignup = async function () {
    if (!supabase) return;

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if (password.length < 6) {
        showAuthError('密码至少6位');
        return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        showAuthError(error.message);
    } else {
        showAuthError('注册确认邮件已发送，请查收！');
    }
};

window.handleLogout = async function () {
    if (!supabase) return;
    await supabase.auth.signOut();
};

// Initialize on DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
