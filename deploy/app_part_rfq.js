/**
 * Morgan Marketing OS - RFQ Decoder Module
 * Handles AI analysis of inbound leads/inquiries.
 */

let lastRFQAnalysis = null;
let lastRFQContent = '';

async function analyzeRFQ() {
    const input = document.getElementById('rfq-input');
    const contextInput = document.getElementById('rfq-context');
    const content = input.value.trim();
    const context = contextInput.value.trim();

    if (!content) return showToast('请先粘贴询盘内容', 'warning');

    lastRFQContent = content;

    // UI States
    const placeholder = document.getElementById('rfq-placeholder');
    const loading = document.getElementById('rfq-loading');
    const resultContent = document.getElementById('rfq-content');
    const actionArea = document.getElementById('rfq-action-area');

    if (placeholder) placeholder.classList.add('hidden');
    if (resultContent) resultContent.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    if (actionArea) actionArea.classList.add('hidden'); // Hide reply area initially

    const prompt = `
    Role: Senior Global Sales Director (20 years exp).
    Task: Deeply analyze this B2B inquiry using First Principles. Detect validation, intent, and hidden risks.
    
    Inquiry Content:
    """
    ${content}
    """
    
    Context: ${context || 'N/A'}

    Output strict JSON:
    {
        "score": 0-100 (Integer),
        "intent_category": "Spam" | "Student" | "Competitor" | "Weak Lead" | "High Potential",
        "intent_color": "red" | "gray" | "yellow" | "blue" | "green",
        "detective_report": [
            "Analyze email domain/signature (valid corporate?)",
            "Analyze tone (professional vs amateur)",
            "Analyze specific requirements (vague vs specific specs)",
            "Identify implied needs (quality, price, speed?)"
        ],
        "reply_strategy": "Concrete advice on how to reply. E.g. 'Ask for specs', 'Ignore', 'Quote directly'.",
        "is_worth_replying": true/false
    }
    `;

    try {
        // Assume callGeminiAPI is defined in app.js and globally available
        const result = await callGeminiAPI(prompt + "\n\nResponse MUST be valid JSON.");

        if (result) {
            try {
                const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(jsonStr);
                lastRFQAnalysis = data;
                renderRFQResults(data);
            } catch (e) {
                console.error("JSON Parse Error", e);
                showToast('AI 解析失败，请重试', 'error');
                // Restore UI
                if (loading) loading.classList.add('hidden');
                if (placeholder) placeholder.classList.remove('hidden');
            }
        } else {
            throw new Error("Empty API Result");
        }
    } catch (e) {
        console.error("API Error", e);
        showToast('分析请求失败', 'error');
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

    // 1. Score
    const scoreCircle = document.getElementById('rfq-score-circle');
    if (scoreCircle) {
        scoreCircle.innerText = data.score;
        // Color coding
        let borderColor = 'border-red-500/30';
        let textColor = 'text-red-400';
        if (data.score >= 80) { borderColor = 'border-green-500/30'; textColor = 'text-green-400'; }
        else if (data.score >= 60) { borderColor = 'border-yellow-500/30'; textColor = 'text-yellow-400'; }

        scoreCircle.className = `w-20 h-20 rounded-full border-[6px] ${borderColor} flex items-center justify-center text-3xl font-black text-white bg-slate-900 shadow-xl`;
    }

    // 2. Intent Tag
    const intentTag = document.getElementById('rfq-intent-tag');
    if (intentTag) {
        intentTag.innerText = data.intent_category;
        // Map color names to tailwind classes
        const colorMap = {
            'red': 'text-red-400 bg-red-900/20 border-red-500/30',
            'gray': 'text-gray-400 bg-gray-800 border-gray-600',
            'yellow': 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
            'blue': 'text-blue-400 bg-blue-900/20 border-blue-500/30',
            'green': 'text-green-400 bg-green-900/20 border-green-500/30'
        };
        intentTag.className = `px-5 py-2 rounded-full border text-sm font-bold shadow-lg ${colorMap[data.intent_color] || colorMap['gray']}`;
    }

    // 3. Analysis List
    const list = document.getElementById('rfq-analysis-list');
    if (list) {
        list.innerHTML = data.detective_report.map(item =>
            `<li class="flex items-start gap-2"><span class="text-blue-500 mt-1">▸</span><span>${item}</span></li>`
        ).join('');
    }

    // 4. Strategy
    const strategy = document.getElementById('rfq-reply-strategy');
    if (strategy) {
        strategy.innerText = data.reply_strategy;
    }

    // 5. Show Action Area if worth replying
    if (data.is_worth_replying && actionArea) {
        actionArea.classList.remove('hidden');
        actionArea.classList.add('animate-fadeIn');
    } else if (actionArea) {
        actionArea.classList.add('hidden');
    }
}

async function generateRFQReply() {
    const draftArea = document.getElementById('rfq-reply-draft');
    if (!draftArea) return;

    if (!lastRFQAnalysis || !lastRFQContent) return showToast('请先进行分析', 'warning');

    draftArea.value = "🤖 AI正在撰写高转化回复...";

    const prompt = `
    Task: Write a high-conversion B2B email reply.
    Original Inquiry: "${lastRFQContent}"
    Analysis Insight: ${JSON.stringify(lastRFQAnalysis)}
    Strategy to follow: ${lastRFQAnalysis.reply_strategy}
    
    Guidelines:
    - Professional, concise, native English (or native language of inquiry).
    - Address specific points from the analysis.
    - Clear Call to Action (CTA).
    - If it's a price inquiry, verify quantity/specs first (don't quote blindly unless strategy says so).
    
    Output: ONLY the email body text.
    `;

    try {
        const reply = await callGeminiAPI(prompt);
        if (reply) {
            draftArea.value = reply.trim();
        } else {
            draftArea.value = "生成失败，请重试";
        }
    } catch (e) {
        console.error("Reply Gen Error", e);
        draftArea.value = "Error generating reply.";
    }
}

function copyReply() {
    const draft = document.getElementById('rfq-reply-draft');
    if (draft && draft.value) {
        navigator.clipboard.writeText(draft.value).then(() => {
            showToast('已复制到剪贴板', 'success');
        });
    }
}
