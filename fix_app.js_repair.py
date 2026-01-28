import os

file_path = r"C:\Users\33589\.gemini\antigravity\scratch\tds_marketing_os\app.js"

# 1. Read lines
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 2. Truncate to 2825
kept_lines = lines[:2825]

# 3. Define missing functions
missing_code = """

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
    ${deliverables.join('\\n    ')}

    Return STRICT JSON with keys: "core_concept", ${selectedPlatforms.map(p => `"${p === 'twitter' ? 'twitter_thread' : (p === 'instagram' ? 'instagram_caption' : (p === 'blog' ? 'blog_outline' : (p === 'youtube' ? 'youtube_desc' : p + '_post')))}"`).join(', ')}.
    `;

    try {
        const result = await callGeminiAPI(prompt + "\\n\\nEnsure valid JSON.");
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
    if(!contentEl) return;
    
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
            if(contentDiv) {
                contentDiv.innerText = result;
                contentDiv.classList.remove('animate-pulse');
            }
            showToast('今日简报已生成', 'success');
        } else {
            throw new Error('Empty response');
        }
    } catch (e) {
        console.error("Briefing Error:", e);
        if(contentEl) contentEl.innerText = "生成失败，请检查网络或 API Key。";
        showToast('简报生成失败', 'error');
    }
}
"""

# 4. Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(kept_lines)
    f.write(missing_code)

print(f"Repaired app.js. Lines reduced from {len(lines)} to {2825 + missing_code.count('\\n')}")
