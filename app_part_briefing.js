
// ==========================================
// Dashboard Briefing Logic
// ==========================================
async function generateBriefing() {
    const contentEl = document.getElementById('briefing-content');
    const originalText = contentEl.innerText;

    // UI Loading State
    contentEl.innerText = "🤖 正在分析全盘数据，生成今日战略简报...";
    contentEl.classList.add('animate-pulse');

    // Gather Context (Mock context for now, but pulling from DOM values if available)
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
            // Typewriter effect could go here, but simple text for now
            contentEl.innerText = result;
            contentEl.classList.remove('animate-pulse');
            showToast('今日简报已生成', 'success');
        } else {
            throw new Error('Empty response');
        }
    } catch (e) {
        console.error("Briefing Error:", e);
        contentEl.innerText = "生成失败，请检查网络或 API Key。";
        showToast('简报生成失败', 'error');
        // Restore after 3s
        setTimeout(() => contentEl.innerText = originalText, 3000);
    }
}
