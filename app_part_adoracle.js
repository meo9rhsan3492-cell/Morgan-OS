// AdOracle Logic Module
// Connects UI to Gemini API for Multi-modal Ad Analysis

// Configuration
const PLATFORM_CRITERIA = {
    "TikTok": {
        "core_dna": "Dopamine Driven: High visual impact, fast pace, sound/music cues.",
        "high_score_traits": "Strong hook in first 0.5s (spark/noise/mud), BGM sync, 1st person POV, raw/native feel.",
        "low_score_traits": "Static PPT, traditional corporate promo style, silent, no info in first 3s.",
        "system_prompt": "You are a TikTok Algorithm Expert. Analyze if this content stops the scroll. Focus on 'Hook', 'Pacing', and 'Native Feel'."
    },
    "LinkedIn": {
        "core_dna": "Trust & Authority Driven: Professionalism, industry insight, credibility.",
        "high_score_traits": "Real engineer on camera, clear machine specs, solving specific pain points, industry data, professional clarity.",
        "low_score_traits": "Blurry selfies, zero-info hard ads, excessive emojis, 'spammy' copy.",
        "system_prompt": "You are a B2B Marketing Director. Analyze if this builds trust. Focus on 'Professionalism', 'Clarity', and 'Value Prop'."
    },
    "WhatsApp": {
        "core_dna": "Intimacy & Real-time Driven: Authenticity, close social distance, FOMO.",
        "high_score_traits": "Factory shipping raw shots, mobile photography, short text ('Busy day!'), 'Happening Now' vibe.",
        "low_score_traits": "Polished posters, long essays, robotic broadcast messages.",
        "system_prompt": "You are a personal connection. Analyze if this feels authentic. Focus on 'Rawness', 'Brevity', and 'Urgency'."
    },
    "YouTube": {
        "core_dna": "Search & Utility Driven: Info density, search intent match, CTR.",
        "high_score_traits": "Cover: High contrast, Text Overlay, Visual Focal Point. Content: 'How to', 'Review', 'Price' in title.",
        "low_score_traits": "Random screen grab cover, misleading title, low info density.",
        "system_prompt": "You are a detailed Youtube Analyst. Analyze CTR potential. Focus on 'Thumbnail Pop', 'Keywords', and 'Information Density'."
    }
};

// Global State
let selectedPlatform = '';
let currentImageBase64 = '';

// 1. UI Interaction
function selectPlatform(platformName) {
    selectedPlatform = platformName;

    // Update UI Cards
    document.querySelectorAll('.platform-card').forEach(el => el.classList.remove('selected'));
    // Find matching card text content or logic, simpler to use onclick 'this' if passed, but here we redraw 
    // or assume list order, but better:
    // Let's iterate and find the one with matching text or pass 'this' from HTML.
    // For simplicity with string arg:
    const cards = Array.from(document.querySelectorAll('.platform-card'));
    const target = cards.find(c => c.innerText.includes(platformName));
    if (target) target.classList.add('selected');

    document.getElementById('current-platform-label').innerText = platformName;
    document.getElementById('status-indicator').className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    handleFiles([file]);
}

function handleFiles(files) {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        // Display Preview
        const img = document.getElementById('preview-img');
        img.src = e.target.result;
        img.classList.remove('hidden');
        document.getElementById('dropzone-content').classList.add('hidden');

        // Store Base64 (remove prefix)
        currentImageBase64 = e.target.result.split(',')[1];
    };
    reader.readAsDataURL(file);
}

// 2. Core Prediction Logic
async function runPrediction() {
    const copy = document.getElementById('ad-copy').value;

    // Validation
    if (!selectedPlatform) return alert('请先选择投放平台 (Step 1)');
    if (!copy && !currentImageBase64) return alert('请输入文案或上传图片 (Step 2)');

    const apiKey = localStorage.getItem('tds_gemini_api_key');
    if (!apiKey) return alert('请先在主应用设置 API Key');

    // UI Loading
    document.getElementById('loading-overlay').classList.remove('hidden');

    try {
        const criteria = PLATFORM_CRITERIA[selectedPlatform];

        const prompt = `
        Role: ${criteria.system_prompt}
        
        Platform DNA: ${criteria.core_dna}
        High Scores: ${criteria.high_score_traits}
        Low Scores: ${criteria.low_score_traits}
        
        Task: Analyze the attached image and/or text.
        Ad Copy: "${copy}"
        
        Return STRICT JSON format:
        {
            "platform_fit_score": (integer 0-10, 10 is perfect match),
            "predicted_ctr_level": "High" | "Medium" | "Low",
            "visual_analysis": "string (Why visual fits/fails)",
            "copy_analysis": "string (Why copy fits/fails)",
            "critical_flaw": "string (The biggest dealbreaker or 'None')",
            "optimization_suggestions": ["tip 1", "tip 2", "tip 3"]
        }
        `;

        const parts = [{ text: prompt }];
        if (currentImageBase64) {
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: currentImageBase64
                }
            });
        }

        // Call Gemini
        const result = await callGemini(apiKey, parts);
        renderResult(result);

    } catch (e) {
        console.error(e);
        alert('预测失败: ' + e.message);
    } finally {
        document.getElementById('loading-overlay').classList.add('hidden');
    }
}

async function callGemini(key, parts) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: parts }]
        })
    });

    if (!response.ok) throw new Error('API Error: ' + response.status);

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // Parse JSON
    try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Raw Text:", text);
        throw new Error("Invalid JSON from AI");
    }
}

// 3. Render
function renderResult(data) {
    document.getElementById('result-empty').classList.add('hidden');
    document.getElementById('result-content').classList.remove('hidden');

    // Score Animation
    animateValue('score-circle', 0, data.platform_fit_score, 1000);
    const scoreEl = document.getElementById('score-circle');

    // Color Coding
    let color = '#ef4444'; // red
    if (data.platform_fit_score > 7) color = '#22c55e'; // green
    else if (data.platform_fit_score > 4) color = '#eab308'; // yellow
    scoreEl.style.borderColor = color;
    scoreEl.style.color = color;

    // CTR
    document.getElementById('ctr-level').innerText = data.predicted_ctr_level;

    // Analysis
    document.getElementById('visual-analysis').innerText = data.visual_analysis;
    document.getElementById('copy-analysis').innerText = data.copy_analysis;

    // Flaw
    const flawBox = document.getElementById('flaw-box');
    if (data.critical_flaw && data.critical_flaw !== 'None' && data.critical_flaw !== '无') {
        flawBox.classList.remove('hidden');
        document.getElementById('critical-flaw').innerText = data.critical_flaw;
    } else {
        flawBox.classList.add('hidden');
    }

    // Suggestions
    document.getElementById('suggestion-list').innerHTML =
        data.optimization_suggestions.map(s => `
            <li class="flex items-start gap-2">
                <span class="text-yellow-400 mt-1">⚡</span>
                <span>${s}</span>
            </li>
        `).join('');
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
