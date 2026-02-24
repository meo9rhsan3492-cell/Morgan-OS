/**
 * Morgan Marketing OS v19.0 - RFQ Pipeline Module
 * Semi-automated: Inquiry → Decode → Match Product → Quote → Draft Reply → Save to CRM
 */

let lastRFQAnalysis = null;
let lastRFQContent = '';
let lastPipelineResult = null;

// ========================================
// P0: One-Click RFQ Pipeline (核心升级)
// ========================================
async function runRFQPipeline() {
    const input = document.getElementById('rfq-input');
    const content = input?.value.trim();
    const context = document.getElementById('rfq-context')?.value.trim();

    if (!content) return showToast('请先粘贴询盘内容', 'warning');
    lastRFQContent = content;

    // UI: Show pipeline progress
    const placeholder = document.getElementById('rfq-placeholder');
    const loading = document.getElementById('rfq-loading');
    const resultContent = document.getElementById('rfq-content');
    const pipelinePanel = document.getElementById('pipeline-result');

    if (placeholder) placeholder.classList.add('hidden');
    if (resultContent) resultContent.classList.add('hidden');
    if (pipelinePanel) pipelinePanel.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');

    // Update loading text for pipeline steps
    const loadingText = document.querySelector('#rfq-loading .text-blue-400');
    const loadingSteps = document.querySelector('#rfq-loading .text-xs');

    try {
        // ===== Step 1: AI Deep Decode =====
        if (loadingText) loadingText.textContent = '🔍 Step 1/4: 正在解码询盘意图...';
        if (loadingSteps) loadingSteps.innerHTML = '<span>[Intent Analysis]</span><span class="animate-pulse">[Processing...]</span>';

        const decodePrompt = `
        Role: Senior Global Sales Director (20 years exp, B2B Manufacturing).
        Task: Deeply analyze this B2B inquiry. Extract ALL structured information.

        Inquiry Content:
        """
        ${content}
        """
        Context: ${context || 'N/A'}

        Output strict JSON:
        {
            "score": 0-100,
            "intent_category": "Spam" | "Student" | "Competitor" | "Weak Lead" | "High Potential",
            "intent_color": "red" | "gray" | "yellow" | "blue" | "green",
            "detective_report": ["Point 1...", "Point 2...", "Point 3...", "Point 4..."],
            "reply_strategy": "Concrete strategy for replying",
            "is_worth_replying": true/false,
            "extracted_info": {
                "customer_name": "Name or null",
                "company": "Company name or null",
                "country": "Country or null",
                "email": "Email or null",
                "products_requested": ["product keywords"],
                "quantity": "Quantity mentioned or null",
                "destination_port": "Port or country or null",
                "urgency": "urgent/normal/low",
                "special_requirements": "Any special reqs or null"
            }
        }`;

        const decodeResult = await callGeminiAPI(decodePrompt + "\n\nReturn strict JSON only.");
        if (!decodeResult) throw new Error('AI 解码失败');

        const decoded = JSON.parse(decodeResult.replace(/```json/g, '').replace(/```/g, '').trim());
        lastRFQAnalysis = decoded;

        // Render basic analysis results
        renderRFQResults(decoded);

        // If not worth replying, stop pipeline here
        if (!decoded.is_worth_replying) {
            if (loading) loading.classList.add('hidden');
            showToast('⚠️ 该询盘质量较低，流水线已停止', 'warning');
            return;
        }

        // ===== Step 2: Match Products from Knowledge Base =====
        if (loadingText) loadingText.textContent = '📦 Step 2/4: 正在匹配产品信息...';
        if (loadingSteps) loadingSteps.innerHTML = '<span>[✅ Intent Decoded]</span><span class="animate-pulse">[Product Matching...]</span>';

        const productMatch = matchProductFromKB(decoded.extracted_info?.products_requested || []);

        // ===== Step 3: Auto Calculate Quote =====
        if (loadingText) loadingText.textContent = '💰 Step 3/4: 正在计算报价...';
        if (loadingSteps) loadingSteps.innerHTML = '<span>[✅ Products Matched]</span><span class="animate-pulse">[Calculating...]</span>';

        const quoteData = autoCalculateQuote(decoded.extracted_info, productMatch);

        // ===== Step 4: Generate Professional Reply Email =====
        if (loadingText) loadingText.textContent = '✉️ Step 4/4: 正在生成专业回复...';
        if (loadingSteps) loadingSteps.innerHTML = '<span>[✅ Quote Ready]</span><span class="animate-pulse">[Drafting Reply...]</span>';

        const replyPrompt = `
        Task: Write a high-conversion professional B2B email reply.
        Original Inquiry: "${content}"
        
        Analysis: Score ${decoded.score}/100, Category: ${decoded.intent_category}
        Strategy: ${decoded.reply_strategy}
        
        Customer Info:
        - Name: ${decoded.extracted_info?.customer_name || 'Dear Customer'}
        - Company: ${decoded.extracted_info?.company || 'N/A'}
        - Country: ${decoded.extracted_info?.country || 'Unknown'}
        - Products: ${decoded.extracted_info?.products_requested?.join(', ') || 'Various'}
        - Quantity: ${decoded.extracted_info?.quantity || 'TBD'}
        
        ${quoteData.hasQuote ? `Reference Quote: FOB $${quoteData.fobUSD}/unit, CIF $${quoteData.cifUSD}/unit` : 'No exact pricing available - ask for more details.'}
        ${productMatch.found ? `Matched Products: ${productMatch.summary}` : ''}
        
        Guidelines:
        - ${decoded.extracted_info?.urgency === 'urgent' ? 'Reply urgently, show readiness' : 'Professional, not rushed'}
        - Use the customer's name if available
        - If quote available, mention it; otherwise ask for specs/quantity
        - Clear CTA (schedule call, send catalog, confirm specs)
        - Language: English (unless original inquiry is in another language, then match it)
        
        Output: ONLY the email body text (no subject line).`;

        const replyDraft = await callGeminiAPI(replyPrompt);

        // ===== Pipeline Complete: Show Results =====
        if (loading) loading.classList.add('hidden');

        lastPipelineResult = {
            decoded,
            productMatch,
            quoteData,
            replyDraft: replyDraft?.trim() || '生成失败'
        };

        renderPipelineResult(lastPipelineResult);
        showToast('🚀 流水线完成！询盘已一键处理', 'success');

    } catch (e) {
        console.error('Pipeline Error:', e);
        if (loading) loading.classList.add('hidden');
        showToast('流水线执行失败: ' + e.message, 'error');
        // Still show partial results if available
        if (lastRFQAnalysis) {
            const resultContent = document.getElementById('rfq-content');
            if (resultContent) resultContent.classList.remove('hidden');
        }
    }
}

// ========================================
// Product Matching from Knowledge Base
// ========================================
function matchProductFromKB(keywords) {
    const kbChunks = JSON.parse(localStorage.getItem('morgan_kb_chunks') || '[]');
    const kbFiles = JSON.parse(localStorage.getItem('morgan_kb_files') || '[]');

    if (kbChunks.length === 0) {
        return { found: false, summary: '知识库为空，请先上传产品资料', matches: [] };
    }

    const matches = [];
    const searchTerms = keywords.map(k => k.toLowerCase());

    kbChunks.forEach((chunk, idx) => {
        const text = (chunk.text || chunk || '').toLowerCase();
        let score = 0;
        const hits = [];

        searchTerms.forEach(term => {
            if (text.includes(term)) {
                score += 10;
                hits.push(term);
            }
            // Partial match
            term.split(' ').forEach(word => {
                if (word.length > 2 && text.includes(word)) score += 3;
            });
        });

        if (score > 0) {
            matches.push({
                text: (chunk.text || chunk || '').substring(0, 300),
                score,
                hits,
                source: kbFiles[chunk.fileIndex] || `Chunk #${idx}`
            });
        }
    });

    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 3);

    return {
        found: topMatches.length > 0,
        summary: topMatches.map(m => m.text.substring(0, 100)).join(' | '),
        matches: topMatches,
        totalFound: matches.length
    };
}

// ========================================
// Auto Quote Calculation
// ========================================
function autoCalculateQuote(extractedInfo, productMatch) {
    // Try to get saved pricing from calculator defaults
    const rate = parseFloat(localStorage.getItem('tds_calc_rate')) || 7.2;
    const rebateRate = parseFloat(localStorage.getItem('tds_calc_rebate')) || 13;
    const margin = parseFloat(localStorage.getItem('tds_calc_margin')) || 20;

    // If we don't have enough info, return empty quote
    if (!extractedInfo) return { hasQuote: false, reason: '无法提取产品信息' };

    // Try to extract numeric quantity
    let qty = 1;
    if (extractedInfo.quantity) {
        const nums = extractedInfo.quantity.match(/\d+/);
        if (nums) qty = parseInt(nums[0]) || 1;
    }

    // Check if productMatch has pricing hints
    let factoryPrice = 0;
    if (productMatch.found && productMatch.matches.length > 0) {
        // Try to extract price from matched text
        const priceMatch = productMatch.matches[0].text.match(/[¥￥](\d+[\.,]?\d*)|(\d+[\.,]?\d*)\s*(元|RMB|rmb|CNY)/);
        if (priceMatch) {
            factoryPrice = parseFloat(priceMatch[1] || priceMatch[2]) || 0;
        }
    }

    if (factoryPrice === 0) {
        return { hasQuote: false, reason: '知识库中未找到价格信息，建议手动报价' };
    }

    // Calculate
    const totalFactory = factoryPrice * qty;
    const vatRate = 1.13;
    const rebateAmount = (totalFactory / vatRate) * (rebateRate / 100);
    const realCost = totalFactory - rebateAmount;
    const fobCostRMB = realCost;
    const fobCostUSD = fobCostRMB / rate;
    const divisor = 1 - (margin / 100);
    const targetFobUSD = divisor > 0 ? (fobCostUSD / divisor) : 0;
    const unitFobUSD = qty > 0 ? (targetFobUSD / qty) : 0;
    const unitCifUSD = unitFobUSD * 1.1; // Rough CIF estimate

    return {
        hasQuote: true,
        factoryPrice,
        qty,
        fobUSD: unitFobUSD.toFixed(2),
        cifUSD: unitCifUSD.toFixed(2),
        totalFobUSD: targetFobUSD.toFixed(2),
        margin: margin + '%',
        rate
    };
}

// ========================================
// Render Pipeline Results
// ========================================
function renderPipelineResult(result) {
    const panel = document.getElementById('pipeline-result');
    if (!panel) return;

    const { decoded, productMatch, quoteData, replyDraft } = result;
    const info = decoded.extracted_info || {};

    panel.classList.remove('hidden');
    panel.innerHTML = `
    <div class="space-y-4 animate-fadeIn">
        <!-- Pipeline Success Banner -->
        <div class="bg-gradient-to-r from-green-900/40 to-blue-900/40 rounded-xl p-4 border border-green-500/30 flex items-center gap-3">
            <span class="text-3xl">🚀</span>
            <div>
                <div class="font-bold text-green-400">流水线完成 — 4步全自动处理</div>
                <div class="text-xs text-gray-400">解码 → 匹配 → 报价 → 邮件，一键搞定</div>
            </div>
        </div>

        <!-- Extracted Customer Info -->
        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <h4 class="text-xs font-bold text-blue-400 uppercase mb-3">📋 提取的客户信息</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div><span class="text-gray-500">客户:</span> <span class="text-white font-bold">${info.customer_name || '未识别'}</span></div>
                <div><span class="text-gray-500">公司:</span> <span class="text-white font-bold">${info.company || '未识别'}</span></div>
                <div><span class="text-gray-500">国家:</span> <span class="text-white font-bold">${info.country || '未识别'}</span></div>
                <div><span class="text-gray-500">邮箱:</span> <span class="text-blue-400">${info.email || '未识别'}</span></div>
                <div><span class="text-gray-500">产品:</span> <span class="text-yellow-400">${info.products_requested?.join(', ') || '未明确'}</span></div>
                <div><span class="text-gray-500">数量:</span> <span class="text-white">${info.quantity || '待确认'}</span></div>
                <div><span class="text-gray-500">目的港:</span> <span class="text-white">${info.destination_port || '未提及'}</span></div>
                <div><span class="text-gray-500">紧急度:</span> <span class="${info.urgency === 'urgent' ? 'text-red-400 font-bold' : 'text-gray-300'}">${info.urgency === 'urgent' ? '🔴 紧急' : info.urgency === 'low' ? '🟢 不急' : '🟡 正常'}</span></div>
            </div>
        </div>

        <!-- Product Match Result -->
        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <h4 class="text-xs font-bold text-purple-400 uppercase mb-3">📦 知识库匹配结果</h4>
            ${productMatch.found ? `
                <div class="text-xs text-green-400 mb-2">✅ 匹配到 ${productMatch.totalFound} 条相关记录</div>
                <div class="space-y-2">
                    ${productMatch.matches.map(m => `
                        <div class="bg-black/20 rounded p-2 text-xs text-gray-300 border-l-2 border-purple-500">
                            ${m.text.substring(0, 150)}...
                            <div class="text-[10px] text-gray-500 mt-1">来源: ${m.source} | 匹配词: ${m.hits.join(', ')}</div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="text-xs text-yellow-400">⚠️ ${productMatch.summary}</div>
            `}
        </div>

        <!-- Auto Quote -->
        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <h4 class="text-xs font-bold text-green-400 uppercase mb-3">💰 自动报价</h4>
            ${quoteData.hasQuote ? `
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="bg-green-900/30 rounded-lg p-3 border border-green-500/20">
                        <div class="text-[10px] text-gray-400 uppercase">FOB 单价</div>
                        <div class="text-2xl font-black text-green-400">$${quoteData.fobUSD}</div>
                    </div>
                    <div class="bg-blue-900/30 rounded-lg p-3 border border-blue-500/20">
                        <div class="text-[10px] text-gray-400 uppercase">CIF 估价</div>
                        <div class="text-2xl font-black text-blue-400">$${quoteData.cifUSD}</div>
                    </div>
                    <div class="bg-purple-900/30 rounded-lg p-3 border border-purple-500/20">
                        <div class="text-[10px] text-gray-400 uppercase">利润率</div>
                        <div class="text-2xl font-black text-purple-400">${quoteData.margin}</div>
                    </div>
                </div>
                <div class="text-[10px] text-gray-500 mt-2">基于: 工厂价¥${quoteData.factoryPrice} × ${quoteData.qty}pcs | 汇率 ${quoteData.rate}</div>
            ` : `
                <div class="text-xs text-yellow-400">⚠️ ${quoteData.reason}</div>
                <div class="text-xs text-gray-500 mt-1">💡 您可以前往"报价计算器"手动输入后返回</div>
            `}
        </div>

        <!-- AI Reply Draft -->
        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <h4 class="text-xs font-bold text-orange-400 uppercase mb-3 flex items-center justify-between">
                <span>✉️ AI 生成的回复邮件</span>
                <div class="flex gap-2">
                    <button onclick="copyPipelineReply()" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-bold">📋 复制</button>
                    <button onclick="savePipelineToCRM()" class="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded font-bold">💾 存入客户管道</button>
                </div>
            </h4>
            <textarea id="pipeline-reply-draft" class="w-full bg-black/30 border border-gray-600 rounded-lg p-4 font-mono text-xs text-gray-300 resize-none focus:border-blue-500 focus:outline-none transition" rows="10">${replyDraft}</textarea>
        </div>
    </div>`;

    // Scroll to results
    panel.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// Legacy: Single Analysis (keep working)
// ========================================
async function analyzeRFQ() {
    // Standalone analysis (no pipeline, no quote, no email)

    const input = document.getElementById('rfq-input');
    const content = input?.value.trim();
    const context = document.getElementById('rfq-context')?.value.trim();

    if (!content) return showToast('请先粘贴询盘内容', 'warning');
    lastRFQContent = content;

    const placeholder = document.getElementById('rfq-placeholder');
    const loading = document.getElementById('rfq-loading');
    const resultContent = document.getElementById('rfq-content');
    const actionArea = document.getElementById('rfq-action-area');

    if (placeholder) placeholder.classList.add('hidden');
    if (resultContent) resultContent.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    if (actionArea) actionArea.classList.add('hidden');

    const prompt = `
    Role: Senior Global Sales Director (20 years exp).
    Task: Deeply analyze this B2B inquiry.
    Inquiry: """${content}"""
    Context: ${context || 'N/A'}
    Output JSON: { "score":0-100, "intent_category":"Spam"|"Student"|"Competitor"|"Weak Lead"|"High Potential", "intent_color":"red"|"gray"|"yellow"|"blue"|"green", "detective_report":["..."], "reply_strategy":"...", "is_worth_replying":true/false }`;

    try {
        const result = await callGeminiAPI(prompt + "\n\nStrict JSON.");
        if (result) {
            const data = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
            lastRFQAnalysis = data;
            renderRFQResults(data);
        } else throw new Error("Empty API Result");
    } catch (e) {
        console.error("API Error", e);
        showToast('分析失败', 'error');
        if (loading) loading.classList.add('hidden');
        if (placeholder) placeholder.classList.remove('hidden');
    }
}

function renderRFQResults(data) {
    const loading = document.getElementById('rfq-loading');
    const resultContent = document.getElementById('rfq-content');
    const actionArea = document.getElementById('rfq-action-area');

    if (loading) loading.classList.add('hidden');
    if (resultContent) resultContent.classList.remove('hidden');

    const scoreCircle = document.getElementById('rfq-score-circle');
    if (scoreCircle) {
        scoreCircle.innerText = data.score;
        let bc = 'border-red-500/30';
        if (data.score >= 80) bc = 'border-green-500/30';
        else if (data.score >= 60) bc = 'border-yellow-500/30';
        scoreCircle.className = `w-20 h-20 rounded-full border-[6px] ${bc} flex items-center justify-center text-3xl font-black text-white bg-slate-900 shadow-xl`;
    }

    const intentTag = document.getElementById('rfq-intent-tag');
    if (intentTag) {
        intentTag.innerText = data.intent_category;
        const cm = { 'red': 'text-red-400 bg-red-900/20 border-red-500/30', 'gray': 'text-gray-400 bg-gray-800 border-gray-600', 'yellow': 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30', 'blue': 'text-blue-400 bg-blue-900/20 border-blue-500/30', 'green': 'text-green-400 bg-green-900/20 border-green-500/30' };
        intentTag.className = `px-5 py-2 rounded-full border text-sm font-bold shadow-lg ${cm[data.intent_color] || cm['gray']}`;
    }

    const list = document.getElementById('rfq-analysis-list');
    if (list) list.innerHTML = data.detective_report.map(item => `<li class="flex items-start gap-2"><span class="text-blue-500 mt-1">▸</span><span>${item}</span></li>`).join('');

    const strategy = document.getElementById('rfq-reply-strategy');
    if (strategy) strategy.innerText = data.reply_strategy;

    if (data.is_worth_replying && actionArea) {
        actionArea.classList.remove('hidden');
    } else if (actionArea) {
        actionArea.classList.add('hidden');
    }
}

// ========================================
// Helper Functions
// ========================================
async function generateRFQReply() {
    const draftArea = document.getElementById('rfq-reply-draft');
    if (!draftArea || !lastRFQAnalysis || !lastRFQContent) return showToast('请先进行分析', 'warning');
    draftArea.value = "🤖 AI正在撰写高转化回复...";
    try {
        const reply = await callGeminiAPI(`Write a professional B2B email reply to: "${lastRFQContent}". Strategy: ${lastRFQAnalysis.reply_strategy}. Output: email body only.`);
        draftArea.value = reply?.trim() || "生成失败";
    } catch (e) { draftArea.value = "Error: " + e.message; }
}

function copyReply() {
    const draft = document.getElementById('rfq-reply-draft');
    if (draft?.value) navigator.clipboard.writeText(draft.value).then(() => showToast('已复制到剪贴板', 'success'));
}

function copyPipelineReply() {
    const draft = document.getElementById('pipeline-reply-draft');
    if (draft?.value) navigator.clipboard.writeText(draft.value).then(() => showToast('已复制到剪贴板', 'success'));
}

function savePipelineToCRM() {
    if (!lastPipelineResult || !lastRFQAnalysis) return showToast('无数据可保存', 'warning');
    const info = lastRFQAnalysis.extracted_info || {};

    // Save to customer pipeline
    const customers = JSON.parse(localStorage.getItem('tds_pipeline_customers') || '[]');
    const newCustomer = {
        id: Date.now(),
        name: info.customer_name || '未知客户',
        company: info.company || '未知公司',
        country: info.country || '未知',
        email: info.email || '',
        product: info.products_requested?.join(', ') || '未明确',
        quantity: info.quantity || '',
        stage: 'new',           // new → quoted → sample → negotiation → won/lost
        score: lastRFQAnalysis.score || 0,
        lastContact: new Date().toISOString(),
        nextFollowUp: new Date(Date.now() + 3 * 86400000).toISOString(), // +3 days
        notes: lastRFQAnalysis.reply_strategy || '',
        emails: [{
            type: 'inquiry',
            content: lastRFQContent.substring(0, 500),
            date: new Date().toISOString()
        }, {
            type: 'reply_draft',
            content: lastPipelineResult.replyDraft.substring(0, 500),
            date: new Date().toISOString()
        }],
        quoteData: lastPipelineResult.quoteData,
        source: 'rfq_pipeline',
        followUpCount: 0,
        createdAt: new Date().toISOString()
    };

    customers.unshift(newCustomer);
    localStorage.setItem('tds_pipeline_customers', JSON.stringify(customers));
    showToast('✅ 客户已存入管道 → 可在"客户管道"中查看', 'success');

    // Refresh pipeline if function exists
    if (typeof renderPipeline === 'function') renderPipeline();
}

// ========================================
// Expose all functions globally
// ========================================
window.runRFQPipeline = runRFQPipeline;
window.analyzeRFQ = analyzeRFQ;
window.generateRFQReply = generateRFQReply;
window.copyReply = copyReply;
window.copyPipelineReply = copyPipelineReply;
window.savePipelineToCRM = savePipelineToCRM;
window.matchProductFromKB = matchProductFromKB;
window.autoCalculateQuote = autoCalculateQuote;
