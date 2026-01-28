// ==========================================
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
