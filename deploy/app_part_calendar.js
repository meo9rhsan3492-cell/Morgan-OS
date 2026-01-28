// Smart Content Calendar Logic (Strategy V21)
// ============================================

async function generateWeeklyPlan() {
    console.log("Generating Weekly Plan...");
    const grid = document.getElementById('calendar-grid');
    const strategy = document.getElementById('calendar-strategy').value;

    // 1. Loading State
    grid.innerHTML = Array(7).fill(0).map(() => `
        <div class="day-card p-3 rounded-lg bg-gray-800/50 border border-gray-700 min-w-[140px] animate-pulse flex flex-col gap-2">
            <div class="h-4 bg-gray-700 rounded w-1/2"></div>
            <div class="h-20 bg-gray-700 rounded w-full"></div>
        </div>
    `).join('');

    try {
        // 2. Read Strategy Document
        // Since we are in browser, we'll fetch the file content.
        // In a real local app, this might be a file read. 
        // For this demo, we assume the file sits in the root as strategy_v21.html
        let strategyContent = "";
        try {
            const response = await fetch('strategy_v21.html');
            if (response.ok) {
                strategyContent = await response.text();
            } else {
                console.warn("Strategy file not found, using generic.");
            }
        } catch (e) {
            console.warn("Could not load strategy file:", e);
        }

        // 3. Construct Prompt
        const prompt = `
            You are a Senior Content Strategist.
            Based on the attached "TDS2026 Brand Penetration Execution Plan (V21)" (HTML), generate a 7-Day Content Schedule.
            
            Current Focus: ${strategy} (Aggressive/Value/Educational).
            
            Key Rules:
            1. Strictly follow the "Water Well" vs "Mining" distinction in the strategy.
            2. Mix content types (Facebook, TikTok, LinkedIn, YouTube) as per the plan.
            3. Ensure each day has a specific "Theme/Angle" and "Platform".
            
            Return JSON Array of 7 objects (Monday to Sunday):
            [{
                "day": "Mon",
                "title": "Short Headline",
                "platform": "LinkedIn", 
                "angle": "Specific approach from strategy",
                "content_idea": "Brief description of the content"
            }, ...]

            STRATEGY CONTEXT:
            ${strategyContent.substring(0, 15000)} // Truncate to avoid limit, usually enough
        `;

        // 4. Call Gemini
        const resultText = await callGeminiAPI(prompt);
        // Clean markdown json
        const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const plan = JSON.parse(cleanJson);

        // 5. Render
        renderCalendar(plan);
        showToast('周计划生成完毕', 'success');

    } catch (error) {
        console.error("Calendar Error:", error);
        grid.innerHTML = `<div class="col-span-7 text-red-500 text-center py-10">生成失败: ${error.message}</div>`;
        showToast('生成失败，请重试', 'error');
    }
}

function renderCalendar(plan) {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    // Platform Icons
    const icons = {
        'LinkedIn': '<i class="ri-linkedin-box-fill text-blue-500"></i>',
        'Facebook': '<i class="ri-facebook-circle-fill text-blue-600"></i>',
        'TikTok': '<i class="ri-tiktok-fill text-black dark:text-white"></i>',
        'YouTube': '<i class="ri-youtube-fill text-red-600"></i>',
        'Instagram': '<i class="ri-instagram-fill text-pink-500"></i>',
        'Blog': '<i class="ri-article-fill text-orange-500"></i>'
    };

    plan.forEach((item, index) => {
        const icon = icons[item.platform] || '📄';

        const card = document.createElement('div');
        // World Class Card Style: White bg (light), Gray-800 bg (dark), subtle shadow, clean border
        card.className = "day-card flex flex-col justify-between min-w-[180px] h-[280px] relative cursor-pointer group transition-all duration-300 " +
            "bg-white dark:bg-gray-800 " +
            "rounded-xl border border-gray-100 dark:border-gray-700 " +
            "shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800";

        card.onclick = () => transferToContentMatrix(item.title, item.platform, item.content_idea);

        // Day Label
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayLabel = days[index] || item.day;

        card.innerHTML = `
            <div class="pointer-events-none p-5 h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">${dayLabel}</span>
                    <span class="text-lg opacity-80 group-hover:opacity-100 transition-opacity">${icon}</span>
                </div>
                
                <h4 class="font-bold text-base text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    ${item.title}
                </h4>
                
                <div class="mb-3">
                     <span class="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800">
                        ${item.angle}
                    </span>
                </div>
                
                <p class="text-xs text-gray-500 dark:text-gray-400 overflow-y-auto pr-1 leading-relaxed flex-grow scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    ${item.content_idea}
                </p>
                
                <!-- Hover Action Hint -->
                <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span>⚡ Click to Draft</span>
                    <i class="ri-arrow-right-line ml-auto"></i>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function transferToContentMatrix(title, platform, idea) {
    // 1. Switch Tab
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activate Brand Matrix Tab
    // Assuming the button for Brand Matrix has specific ID or we find it by text
    // The ID in index.html is likely not set for the button, but the tab id is 'social-matrix'
    document.getElementById('social-matrix').classList.add('active');
    // Find the button that triggers this tab. Rough heuristic:
    const tabBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.innerText.includes('品牌') || b.innerText.includes('Brand'));
    if (tabBtn) tabBtn.classList.add('active');

    // 2. Pre-fill Inputs
    const themeInput = document.getElementById('brand-theme');
    const prodInput = document.getElementById('brand-product'); // Optional

    // Set the Core Theme to the specific idea
    themeInput.value = `[${platform} Exclusive] ${title}: ${idea}`;

    // Set Platform checkboxes
    document.querySelectorAll('.platform-checkbox').forEach(cb => {
        // Simple logic: if platform matches, check it. Else uncheck? 
        // Or maybe just check the target one + Blog?
        // Let's check target only for focus.
        const pVal = cb.value.toLowerCase();
        const pTarget = platform.toLowerCase();

        // Map common names
        let isMatch = false;
        if (pTarget.includes(pVal)) isMatch = true;
        if (pTarget.includes('twitter') && pVal === 'twitter') isMatch = true;
        if (pTarget.includes('x') && pVal === 'twitter') isMatch = true;

        cb.checked = isMatch;
    });

    // 3. Highlight
    themeInput.focus();
    themeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 4. Toast
    showToast(`已加载 "${title}" 到创作台，请点击生成`, 'success');
}
