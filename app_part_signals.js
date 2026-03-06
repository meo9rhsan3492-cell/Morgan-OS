/**
 * Morgan OS - Strategic Signals Outpost
 * Industry Intelligence Hub - Part of v19.x AGENT Update
 */

const SignalsEngine = {
    state: {
        isScanning: false,
        signals: [] // Array of { id, title, source, time, impactScore, url, insight: { meaning, action }, rawContent }
    },

    init: function () {
        console.log('📡 SignalsEngine initialized');
        // Expose to window for inline onclick handlers
        window.fetchSignals = this.fetchSignals.bind(this);
        window.toggleInsight = this.toggleInsight.bind(this);
        window.signalActionEmail = this.signalActionEmail.bind(this);
        window.signalActionLinkedIn = this.signalActionLinkedIn.bind(this);
        window.setSignalPreset = this.setSignalPreset.bind(this);
        window.dismissSignal = this.dismissSignal.bind(this);
        window.saveSignal = this.saveSignal.bind(this);
        window.copyInsight = this.copyInsight.bind(this);
        window.setRadarMode = this.setRadarMode.bind(this);
    },

    setRadarMode: function (mode) {
        this.state.radarMode = mode;
        const btnIndustry = document.getElementById('mode-industry');
        const btnProduct = document.getElementById('mode-product');

        if (mode === 'industry') {
            btnIndustry.className = "flex-1 py-1.5 text-xs font-bold rounded-md transition bg-blue-600 text-white shadow";
            btnProduct.className = "flex-1 py-1.5 text-xs font-bold rounded-md transition text-gray-400 hover:text-white";
        } else {
            btnProduct.className = "flex-1 py-1.5 text-xs font-bold rounded-md transition bg-blue-600 text-white shadow";
            btnIndustry.className = "flex-1 py-1.5 text-xs font-bold rounded-md transition text-gray-400 hover:text-white";
        }
    },

    setSignalPreset: function (text) {
        const input = document.getElementById('signal-keywords');
        if (input) {
            input.value = text;
            input.focus();
            // Automatically run scan on preset click
            this.fetchSignals();
        }
    },

    fetchSignals: async function () {
        const input = document.getElementById('signal-keywords').value;
        const keywords = input.trim() ? input : '光伏, 欧洲供应链, 碳排放';
        const apiKeyInput = document.getElementById('tavily-api-key');
        const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
        const apiStatusDot = document.getElementById('api-status-dot');

        if (!apiKey) {
            window.showToast?.('⚠️ 请先输入 Tavily API Key 以启用真实全网抓取', 'error');
            // If no key, default to fallback immediately for demo purposes
            setTimeout(() => this.renderFallbackData(keywords), 1500);
            return;
        }

        this.setLoadingState(true);

        try {
            // STEP 1: Fetch Real Data from Tavily Search API
            if (apiStatusDot) {
                apiStatusDot.classList.remove('bg-gray-500', 'bg-red-500');
                apiStatusDot.classList.add('bg-yellow-500', 'animate-pulse');
                apiStatusDot.nextSibling.textContent = "正在穿透全网...";
            }

            const tavilyRes = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: apiKey,
                    query: keywords + " 最新行业动态",
                    search_depth: "basic",
                    max_results: 5,
                    days_back: 3
                })
            });

            if (!tavilyRes.ok) {
                if (apiStatusDot) {
                    apiStatusDot.classList.remove('bg-yellow-500', 'animate-pulse');
                    apiStatusDot.classList.add('bg-red-500');
                    apiStatusDot.nextSibling.textContent = "连接失败";
                }
                throw new Error('Tavily API Key 无效或请求失败 (HTTP ' + tavilyRes.status + ')');
            }

            const tavilyData = await tavilyRes.json();

            if (apiStatusDot) {
                apiStatusDot.classList.remove('bg-yellow-500', 'animate-pulse');
                apiStatusDot.classList.add('bg-green-500');
                apiStatusDot.nextSibling.textContent = "已连接并抓取成功";
            }

            if (!tavilyData.results || tavilyData.results.length === 0) {
                window.showToast?.('未抓取到相关的最新全网信息', 'info');
                this.setLoadingState(false);
                return;
            }

            // Extract context for AI
            const searchContext = tavilyData.results.map((r, i) => `[情报 ${i + 1}]\n标题: ${r.title}\n来源链接: ${r.url}\n内容摘要: ${r.content}`).join('\n\n');

            // STEP 2: Feed Real Data to AI for Insight Extraction
            const industryPrompt = `
            作为顶级商业战略参谋，我刚用网络爬虫为你抓取了关于【${keywords}】的最新的 ${tavilyData.results.length} 条真实网络情报。
            ====================
            真实情报内容：
            ${searchContext}
            ====================
            请仔细分析这些【真实的最新情报】，提炼出对我们外贸业务最有价值的商业信号。
            对于每条被你选中的信号，你必须提供：
            1. "title": 标题（简明扼要，直击要害）。
            2. "source": 提取来源网站名称或域名。
            3. "impactScore": 影响情况，数字 3 到 5（5 为最高危险/机遇）。
            4. "sentimentScore": 对这条动态的情感打分，整数 (-100 为极度悲观/重大危机，0 为中性，100 为极度乐观/重大利好)。
            5. "insight_meaning": 这对我们意味着什么？（1-2句话，分析这对销售或供应链的影响）。
            6. "insight_action": 推荐行动？（1句话，我们可以采取什么行动获益或避险）。
            
            请仅返回一个有效的 JSON 对象，包含 'macro_trend' 和 'signals'。所有文本使用简体中文。
            格式：
            {
              "macro_trend": "综合近期全网动态看...",
              "signals": [{"title": "...", "source": "...", "impactScore": 4, "sentimentScore": 30, "insight_meaning": "...", "insight_action": "..."}]
            }
            `;

            const productPrompt = `
            作为顶级产品情报侦察官，我刚全网抓取了与竞品/产品【${keywords}】相关的最新 ${tavilyData.results.length} 条真实网页。
            ====================
            真实数据内容：
            ${searchContext}
            ====================
            请深度解析该产品的特征变动、价格策略及市场动向。
            对于每条选中的信号，你必须提供：
            1. "title": 标题 (明确指出产品名称或公司名，如"XX新款发售")。
            2. "source": 来源域名或网站名。
            3. "impactScore": 影响指数 (3-5)。
            4. "sentimentScore": 市场对该商品的情感倾向 (-100 代表负面客诉/价格雪崩，100 代表极其抢手/技术突破)。
            5. "product_tags": 抽取1个结构化简短词组 (必须是以下之一: "参数升级", "价格变动", "重磅首发", "负面预警", "供应链动态", "常规更新")。
            6. "insight_meaning": 产品/市场推演 (1-2句话，如果竞品发新品，指出其核心卖点对我们的威胁；如果是降价，指出对我方利润空间的挤压)。
            7. "insight_action": 应对的产销动作 (1句话，如"建议跟进促销"或"挖掘差异化宣发")。
            
            仅返回 JSON 格式：
            {
              "macro_trend": "关于该产品线近期的核心变局总结...",
              "signals": [{"title": "...", "source": "...", "impactScore": 5, "sentimentScore": -60, "product_tags": "价格变动", "insight_meaning": "...", "insight_action": "..."}]
            }
            `;

            const prompt = this.state.radarMode === 'product' ? productPrompt : industryPrompt;

            let rawResponse;
            if (window.callAIAPI) {
                rawResponse = await window.callAIAPI(prompt);
            } else {
                // Fallback for demo without AI connected
                throw new Error('未检测到 AI 引擎，无法提炼洞察');
            }
            if (!rawResponse) throw new Error('No data received from intelligence network.');

            const cleanedResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const responseData = JSON.parse(cleanedResponse);

            if (!responseData.signals || !Array.isArray(responseData.signals)) throw new Error('Intelligence format error.');

            this.state.signals = responseData.signals.map((d, idx) => ({
                id: 'sig_' + Date.now() + '_' + idx,
                ...d
            }));

            // Handle Macro Trend
            const trendPanel = document.getElementById('macro-trend-panel');
            const trendText = document.getElementById('macro-trend-text');
            const macroTitle = document.getElementById('macro-trend-title');

            if (trendPanel && trendText && responseData.macro_trend) {
                if (macroTitle) {
                    macroTitle.innerText = this.state.radarMode === 'product' ? '竞品与产品核心局势 (Product Context)' : '全局宏观趋势 (Macro Trend)';
                }
                trendText.innerText = responseData.macro_trend;
                trendPanel.classList.remove('hidden');

                // Render Sentiment Chart
                this.renderSentimentChart();
            } else if (trendPanel) {
                trendPanel.classList.add('hidden');
            }

            this.renderFeed();

            document.getElementById('signal-count').innerText = this.state.signals.length;
            window.showToast?.('信号扫描完成', 'success');

        } catch (err) {
            console.error('Signals Fetch Error:', err);
            window.showToast?.('信号捕捉失败，请检查雷达网络 (API Key/Network)', 'error');
            this.renderFallbackData(keywordsText); // Render something for demo purposes if it fails
        } finally {
            this.state.isScanning = false;
            this.setLoadingState(false);
        }
    },

    setLoadingState: function (isLoading) {
        const loadingEl = document.getElementById('signals-loading');
        const emptyEl = document.getElementById('signals-empty');
        const feedEl = document.getElementById('signals-feed');
        const trendEl = document.getElementById('macro-trend-panel');

        if (isLoading) {
            loadingEl.classList.remove('hidden');
            emptyEl.classList.add('hidden');
            if (trendEl) trendEl.classList.add('hidden');
            feedEl.classList.add('opacity-50');
            feedEl.classList.add('pointer-events-none');
        } else {
            loadingEl.classList.add('hidden');
            feedEl.classList.remove('opacity-50');
            feedEl.classList.remove('pointer-events-none');
            if (this.state.signals.length === 0) {
                emptyEl.classList.remove('hidden');
            }
        }
    },

    renderFeed: function () {
        const feedContainer = document.getElementById('signals-feed');
        feedContainer.innerHTML = '';

        if (this.state.signals.length === 0) return;

        this.state.signals.forEach((signal, index) => {
            const stars = '★'.repeat(signal.impactScore) + '☆'.repeat(5 - signal.impactScore);
            const timeStr = index === 0 ? '刚刚' : index === 1 ? '45 分钟前' : '2 小时前';

            const colorClass = signal.impactScore >= 5 ? 'text-red-400 border-red-500/30' :
                signal.impactScore === 4 ? 'text-orange-400 border-orange-500/30' : 'text-blue-400 border-blue-500/30';

            const html = `
                <div class="relative overflow-hidden rounded-xl border border-gray-700/50 bg-slate-900/50 hover:bg-slate-800/80 transition-colors group shadow-lg">
                    <!-- Impact Accent Line -->
                    <div class="absolute left-0 top-0 bottom-0 w-1 ${signal.impactScore >= 5 ? 'bg-red-500 shadow-[0_0_10px_red]' : signal.impactScore == 4 ? 'bg-orange-500' : 'bg-blue-500'}"></div>
                    
                    <div class="p-5 pl-6">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-3">
                                ${signal.product_tags ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-500/30">🏷️ ${signal.product_tags}</span>` : ''}
                                <span class="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">${signal.source}</span>
                                <span class="text-xs text-gray-500 flex items-center gap-1">🕒 ${timeStr}</span>
                            </div>
                            <div class="flex items-center gap-4">
                                ${signal.sentimentScore !== undefined ? `
                                <div class="flex flex-col items-end">
                                    <span class="text-[9px] text-gray-500 uppercase font-bold tracking-widest">情绪度</span>
                                    <span class="text-sm font-mono font-bold ${signal.sentimentScore > 0 ? 'text-green-400' : signal.sentimentScore < 0 ? 'text-red-400' : 'text-gray-400'}">
                                        ${signal.sentimentScore > 0 ? '▲' : signal.sentimentScore < 0 ? '▼' : '−'} ${Math.abs(signal.sentimentScore)}
                                    </span>
                                </div>` : ''}
                                
                                <div class="flex flex-col items-end">
                                    <span class="text-[9px] text-gray-500 uppercase font-bold tracking-widest">影响指数</span>
                                    <span class="tracking-widest ${colorClass} text-lg drop-shadow-md leading-none mt-1">${stars}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between items-start mb-4">
                            <h4 class="text-xl font-bold text-gray-100 pr-4 leading-tight">${signal.title}</h4>
                            <div class="flex gap-2 shrink-0">
                                <button onclick="saveSignal('${signal.id}')" class="text-gray-500 hover:text-yellow-500 transition" title="收藏至知识库">⭐</button>
                                <button onclick="dismissSignal('${signal.id}')" class="text-gray-500 hover:text-red-500 transition" title="忽略该信号">✕</button>
                            </div>
                        </div>

                        <!-- Morgan Insight Panel -->
                        <div class="mt-4 bg-black/40 rounded-lg border border-gray-700/50 overflow-hidden">
                            <button onclick="toggleInsight('${signal.id}')" class="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/20 to-transparent hover:bg-blue-900/40 transition">
                                <div class="flex items-center gap-2 text-blue-400 text-sm font-bold">
                                    <span>🧠</span> 核心洞察推演
                                </div>
                                <span id="insight-chevron-${signal.id}" class="text-gray-500 transition-transform transform rotate-0">▼</span>
                            </button>
                            
                            <!-- Expandable Content -->
                            <div id="insight-content-${signal.id}" class="hidden p-4 border-t border-gray-700/50 bg-slate-900/30">
                                <div class="mb-4">
                                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">指引意义</div>
                                    <div class="text-sm text-gray-300 leading-relaxed border-l-2 border-gray-600 pl-3">${signal.insight_meaning}</div>
                                </div>
                                <div class="mb-4">
                                    <div class="flex justify-between items-center mb-1">
                                        <div class="text-[10px] text-green-500 uppercase tracking-wider font-bold drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]">推荐破局行动</div>
                                        <button onclick="copyInsight('${signal.id}')" class="text-xs text-gray-400 hover:text-white transition flex items-center gap-1"><span>📋</span> 复制内参</button>
                                    </div>
                                    <div class="text-sm text-green-100 leading-relaxed border-l-2 border-green-600 pl-3 bg-green-900/10 py-1 rounded-r">${signal.insight_action}</div>
                                </div>
                                
                                <!-- Action Triggers -->
                                <div class="flex gap-3 pt-3 mt-2 border-t border-gray-700/50">
                                    <button onclick="signalActionEmail('${signal.id}')" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-bold rounded border border-gray-600 transition flex items-center justify-center gap-2 group-hover:border-blue-500/50">
                                        <span>✉️</span> 转化为开发信切入点
                                    </button>
                                    <button onclick="signalActionLinkedIn('${signal.id}')" class="flex-1 py-2 bg-[#0a66c2]/20 hover:bg-[#0a66c2]/40 text-blue-300 text-xs font-bold rounded border border-[#0a66c2]/30 transition flex items-center justify-center gap-2">
                                        <span>in</span> 生成 LinkedIn 洞察帖
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            `;
            feedContainer.insertAdjacentHTML('beforeend', html);
        });
    },

    toggleInsight: function (id) {
        const content = document.getElementById(`insight-content-${id}`);
        const chevron = document.getElementById(`insight-chevron-${id}`);
        if (content && chevron) {
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                chevron.classList.add('rotate-180');
            } else {
                content.classList.add('hidden');
                chevron.classList.remove('rotate-180');
            }
        }
    },

    signalActionEmail: function (id) {
        const signal = this.state.signals.find(s => s.id === id);
        if (!signal) return;

        // Use Global Toast
        window.showToast?.('⚡ 正在调取 CRM 与模板库...', 'info');

        // Simulate jumping to Email Template with the context
        setTimeout(() => {
            if (window.switchTab) {
                window.switchTab('email-templates');

                // Try to set variables in the email template module
                const varReason = document.getElementById('var-reason');
                if (varReason) {
                    varReason.value = `我注意到了近期关于 ${signal.title} 的动态。鉴于${signal.insight_meaning}`;
                    window.showToast?.('已将信号自动带入开发信 [联系缘由] 变量！', 'success');
                }
            }
        }, 800);
    },

    signalActionLinkedIn: function (id) {
        const signal = this.state.signals.find(s => s.id === id);
        if (!signal) return;

        // Ensure Social Matrix exists
        setTimeout(() => {
            if (window.switchTab) {
                window.switchTab('social-matrix'); // Or brand-content if they are merged
                // Try to pre-fill the topic
                const themeInput = document.getElementById('brand-theme');
                if (themeInput) {
                    themeInput.value = `关于行业最新动态的探讨：${signal.title}。点评：${signal.insight_meaning}`;

                    // Auto-select LinkedIn
                    const liCheckbox = document.querySelector('input[value="linkedin"]');
                    if (liCheckbox) liCheckbox.checked = true;

                    // Trigger highlight
                    themeInput.focus();
                    window.showToast?.('情报已载入社媒生成器，请点击生成！', 'success');
                } else {
                    window.showToast?.('请在社媒矩阵中发布：\n' + signal.insight_action, 'info');
                }
            }
        }, 800);
    },

    renderFallbackData: function (query) {
        const trendPanel = document.getElementById('macro-trend-panel');
        const trendText = document.getElementById('macro-trend-text');
        if (trendPanel && trendText) {
            trendText.innerText = `结合当前动态分析，${query.split(',')[0]} 相关的资源壁垒正在急剧收缩。市场参与者的容错率正在降低，先行者红利仅剩约 3-6 个月窗口期。`;
            trendPanel.classList.remove('hidden');
        }

        this.state.signals = [
            {
                id: 'sig_fallback_1',
                title: `突发：${query.split(',')[0]} 领域发生重大供应链转移`,
                source: '全球贸易内参',
                impactScore: 5,
                insight_meaning: '此次中断迫使区域分销商的交货时间增加15%，导致第三季度出现巨大的库存缺口。',
                insight_action: '立即联系我们的前5大A级客户，提供我们的快速运输选项作为他们当前供应商的高级替代方案。'
            },
            {
                id: 'sig_fallback_2',
                title: '欧盟新碳税法规提前实施',
                source: '欧洲政策观察',
                impactScore: 4,
                insight_meaning: '使用传统不合规材料的竞争对手将面临8%的关税激增，使其定价失去竞争力。',
                insight_action: '发起一波邮件营销，强调我们的环保认证产品，并展示应对新税收的直接投资回报率(ROI)计算。'
            }
        ];
        this.renderFeed();

        // Mock chart rendering
        this.renderSentimentChart();

        document.getElementById('signal-count').innerText = this.state.signals.length;
    },

    renderSentimentChart: function () {
        const ctx = document.getElementById('sentiment-chart');
        if (!ctx) return;

        if (this.state.chartInstance) {
            this.state.chartInstance.destroy();
        }

        // Aggregate sentiment scores from signals if available, or mock it
        let sentimentData = [];
        let labels = [];

        if (this.state.signals.length > 0 && this.state.signals[0].sentimentScore !== undefined) {
            sentimentData = this.state.signals.map(s => s.sentimentScore);
            labels = this.state.signals.map((s, i) => `T-${this.state.signals.length - i}`);
        } else {
            // Mock data depending on mode
            if (this.state.radarMode === 'industry') {
                sentimentData = [-20, 10, -50, -10, 30, 60, 40];
            } else {
                sentimentData = [80, 40, -10, -60, -80, -30, 20];
            }
            labels = ['-6d', '-5d', '-4d', '-3d', '-2d', '-1d', 'Now'];
        }

        const isPositiveOverall = sentimentData[sentimentData.length - 1] >= 0;
        const color = isPositiveOverall ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)';
        const bgColor = isPositiveOverall ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';

        this.state.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sentiment',
                    data: sentimentData,
                    borderColor: color,
                    backgroundColor: bgColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false, min: -100, max: 100 }
                },
                layout: { padding: 0 }
            }
        });
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    SignalsEngine.init();
});
