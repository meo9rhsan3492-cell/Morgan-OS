/**
 * Morgan Marketing OS - Agent Runtime v1.0
 * 真正的自主 AI Agent：Function Calling + Tool Use + ReAct Loop
 */
const AgentRuntime = {

    // 最大循环次数，防止无限执行
    MAX_ITERATIONS: 8,

    // ================================================================
    // Tool Registry — 7 个外贸实战工具
    // ================================================================
    tools: {
        web_search: {
            declaration: {
                name: 'web_search',
                description: '搜索互联网获取实时信息。用于调研市场、查询客户、了解行业动态、查找竞品信息等。',
                parameters: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: '搜索关键词，建议用英文以获得更广泛的结果' },
                        search_type: { type: 'string', enum: ['general', 'news', 'company'], description: '搜索类型：general=通用, news=新闻, company=公司调研' }
                    },
                    required: ['query']
                }
            },
            execute: async function (args) {
                var tavilyKey = localStorage.getItem('tds_tavily_key');
                if (!tavilyKey) return { error: '未配置 Tavily API Key，请在设置中配置', results: [] };
                try {
                    var res = await fetch('https://api.tavily.com/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            api_key: tavilyKey,
                            query: args.query,
                            search_depth: 'basic',
                            max_results: 5,
                            include_answer: true
                        })
                    });
                    var data = await res.json();
                    return {
                        answer: data.answer || '',
                        results: (data.results || []).map(function (r) {
                            return { title: r.title, url: r.url, snippet: r.content ? r.content.substring(0, 200) : '' };
                        })
                    };
                } catch (e) {
                    return { error: '搜索失败: ' + e.message, results: [] };
                }
            }
        },

        price_calculate: {
            declaration: {
                name: 'price_calculate',
                description: '计算外贸报价。根据工厂价、数量、汇率等计算 FOB/CIF 价格。',
                parameters: {
                    type: 'object',
                    properties: {
                        factory_price_rmb: { type: 'number', description: '工厂出厂价(人民币)' },
                        quantity: { type: 'number', description: '数量' },
                        exchange_rate: { type: 'number', description: '美元汇率(1USD=?RMB)，如不确定填7.2' },
                        tax_rebate_rate: { type: 'number', description: '退税率(小数)，如0.13表示13%' },
                        domestic_fee_rmb: { type: 'number', description: '国内费用(人民币)，含内运+报关+杂费' },
                        profit_rate: { type: 'number', description: '目标利润率(小数)，如0.15表示15%' },
                        shipping_cost_usd: { type: 'number', description: '海运费(美元/票)，用于计算CIF' },
                        insurance_rate: { type: 'number', description: '保险费率(小数)，通常0.003' }
                    },
                    required: ['factory_price_rmb', 'quantity']
                }
            },
            execute: async function (args) {
                var rate = args.exchange_rate || 7.2;
                var rebate = args.tax_rebate_rate || 0.13;
                var domestic = args.domestic_fee_rmb || 500;
                var profit = args.profit_rate || 0.15;
                var shipping = args.shipping_cost_usd || 0;
                var insurance = args.insurance_rate || 0.003;
                var qty = args.quantity || 1;

                var costPerUnit = args.factory_price_rmb / (1 + 0.13) * (1 - rebate);
                var domesticPerUnit = domestic / qty;
                var fobRmb = (costPerUnit + domesticPerUnit) / (1 - profit);
                var fobUsd = fobRmb / rate;
                var totalFob = fobUsd * qty;
                var cifUsd = fobUsd + (shipping / qty) + (fobUsd * insurance);
                var totalCif = cifUsd * qty;

                return {
                    unit_fob_usd: Math.round(fobUsd * 100) / 100,
                    total_fob_usd: Math.round(totalFob * 100) / 100,
                    unit_cif_usd: Math.round(cifUsd * 100) / 100,
                    total_cif_usd: Math.round(totalCif * 100) / 100,
                    breakdown: {
                        cost_after_rebate_rmb: Math.round(costPerUnit * 100) / 100,
                        domestic_per_unit_rmb: Math.round(domesticPerUnit * 100) / 100,
                        profit_rate: (profit * 100) + '%',
                        exchange_rate: rate
                    }
                };
            }
        },

        get_exchange_rate: {
            declaration: {
                name: 'get_exchange_rate',
                description: '查询实时汇率',
                parameters: {
                    type: 'object',
                    properties: {
                        from_currency: { type: 'string', description: '源货币代码，如 USD' },
                        to_currency: { type: 'string', description: '目标货币代码，如 CNY' }
                    },
                    required: ['from_currency', 'to_currency']
                }
            },
            execute: async function (args) {
                try {
                    var res = await fetch('https://api.exchangerate-api.com/v4/latest/' + args.from_currency);
                    var data = await res.json();
                    var rate = data.rates[args.to_currency];
                    if (rate) {
                        return { from: args.from_currency, to: args.to_currency, rate: rate, date: data.date };
                    }
                    return { error: '未找到货币 ' + args.to_currency };
                } catch (e) {
                    return { error: '汇率查询失败: ' + e.message, fallback_rate: args.from_currency === 'USD' && args.to_currency === 'CNY' ? 7.2 : null };
                }
            }
        },

        draft_email: {
            declaration: {
                name: 'draft_email',
                description: '生成外贸邮件草稿。用于写开发信、询盘回复、报价邮件、跟进邮件等。这个工具不会真的发送邮件，只是生成草稿供用户复制使用。',
                parameters: {
                    type: 'object',
                    properties: {
                        email_type: { type: 'string', enum: ['cold_outreach', 'rfq_reply', 'quotation', 'follow_up', 'thank_you'], description: '邮件类型' },
                        recipient_info: { type: 'string', description: '收件人信息(公司名/联系人/市场等)' },
                        product: { type: 'string', description: '产品信息' },
                        key_points: { type: 'string', description: '需要包含的要点' },
                        tone: { type: 'string', enum: ['professional', 'friendly', 'urgent'], description: '语气风格' },
                        language: { type: 'string', enum: ['en', 'zh'], description: '语言' }
                    },
                    required: ['email_type', 'product']
                }
            },
            execute: async function (args) {
                // 这个工具由 AI 自己通过 prompt 生成内容，这里只组装上下文
                return {
                    status: 'ready',
                    context: args,
                    instruction: '请根据以上信息生成一封专业的外贸' + args.email_type + '邮件草稿，包含 Subject 和 Body。'
                };
            }
        },

        crm_query: {
            declaration: {
                name: 'crm_query',
                description: '查询 CRM 客户管道数据。获取客户列表、询盘记录、跟进状态等。',
                parameters: {
                    type: 'object',
                    properties: {
                        query_type: { type: 'string', enum: ['all_customers', 'pipeline_stats', 'overdue_followups', 'recent_inquiries', 'top_customers'], description: '查询类型' },
                        filter: { type: 'string', description: '可选的过滤条件，如客户名称或地区' }
                    },
                    required: ['query_type']
                }
            },
            execute: async function (args) {
                // 从 localStorage 读取 CRM 数据
                var customers = [];
                try { customers = JSON.parse(localStorage.getItem('tds_crm_customers') || '[]'); } catch (e) { }
                var now = Date.now();

                if (args.query_type === 'all_customers') {
                    return { total: customers.length, customers: customers.slice(0, 20).map(function (c) { return { name: c.company || c.name, stage: c.stage, value: c.value, country: c.country }; }) };
                }
                if (args.query_type === 'pipeline_stats') {
                    var stats = {};
                    customers.forEach(function (c) { stats[c.stage || 'unknown'] = (stats[c.stage || 'unknown'] || 0) + 1; });
                    return { total: customers.length, by_stage: stats };
                }
                if (args.query_type === 'overdue_followups') {
                    var overdue = customers.filter(function (c) { return c.nextFollowup && new Date(c.nextFollowup).getTime() < now; });
                    return { count: overdue.length, customers: overdue.slice(0, 10).map(function (c) { return { name: c.company || c.name, due: c.nextFollowup }; }) };
                }
                if (args.query_type === 'top_customers') {
                    var sorted = customers.slice().sort(function (a, b) { return (b.value || 0) - (a.value || 0); });
                    return { customers: sorted.slice(0, 5).map(function (c) { return { name: c.company || c.name, value: c.value, country: c.country }; }) };
                }
                return { total: customers.length, message: '查询完成' };
            }
        },

        read_signals: {
            declaration: {
                name: 'read_signals',
                description: '读取信号哨站已扫描的行业情报数据。获取之前扫描到的市场趋势、竞品动态等。',
                parameters: {
                    type: 'object',
                    properties: {
                        keyword: { type: 'string', description: '过滤关键词' }
                    }
                }
            },
            execute: async function (args) {
                var signals = [];
                try { signals = JSON.parse(localStorage.getItem('tds_signal_results') || '[]'); } catch (e) { }
                if (args.keyword) {
                    signals = signals.filter(function (s) {
                        return JSON.stringify(s).toLowerCase().indexOf(args.keyword.toLowerCase()) !== -1;
                    });
                }
                return { total: signals.length, signals: signals.slice(0, 10) };
            }
        },

        analyze_data: {
            declaration: {
                name: 'analyze_data',
                description: '分析数据并生成洞察。对传入的数据进行统计分析、趋势判断、异常检测。这个工具会把数据交给AI来分析。',
                parameters: {
                    type: 'object',
                    properties: {
                        data_description: { type: 'string', description: '数据描述' },
                        analysis_type: { type: 'string', enum: ['trend', 'anomaly', 'comparison', 'summary'], description: '分析类型' },
                        data: { type: 'string', description: '要分析的数据(JSON格式字符串)' }
                    },
                    required: ['data_description', 'analysis_type']
                }
            },
            execute: async function (args) {
                return { status: 'ready', context: args, instruction: '请分析以上数据并给出专业洞察。' };
            }
        }
    },

    // ================================================================
    // Gemini Function Calling — ReAct 循环
    // ================================================================
    executeTask: async function (taskPrompt, onStep) {
        var geminiKey = localStorage.getItem('tds_gemini_api_key');
        if (!geminiKey) {
            onStep({ type: 'error', message: '需要先配置 Gemini API Key（Agent 使用 Gemini Function Calling）' });
            return null;
        }

        // 组装 system prompt
        var agentPrompt = window.getActiveAgentPrompt ? window.getActiveAgentPrompt() : '';
        var systemInstruction = agentPrompt + '\n\n## Agent 模式\n你现在是一个自主执行任务的 AI Agent。你可以调用工具来获取信息、计算数据、生成内容。\n请按以下步骤工作：\n1. 分析用户任务，拆解为步骤\n2. 调用合适的工具获取所需信息\n3. 基于工具返回的结果继续推理\n4. 如果需要更多信息，继续调用工具\n5. 所有必要信息收集完毕后，给出完整详细的最终回答\n\n重要规则：\n- 所有回复使用简体中文\n- 每次只调用一个工具\n- 不要编造数据，必须通过工具获取\n- 最终回答要结构化、可执行';

        // 构建 tools 声明
        var toolDeclarations = [];
        var self = this;
        Object.keys(this.tools).forEach(function (name) {
            toolDeclarations.push(self.tools[name].declaration);
        });

        // 对话历史
        var contents = [
            { role: 'user', parts: [{ text: systemInstruction }] },
            { role: 'model', parts: [{ text: '好的，我已进入 Agent 模式，准备执行任务。请下达指令。' }] },
            { role: 'user', parts: [{ text: taskPrompt }] }
        ];

        onStep({ type: 'thinking', message: '📋 正在分析任务...' });

        var iteration = 0;
        while (iteration < this.MAX_ITERATIONS) {
            iteration++;

            try {
                var response = await fetch(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + geminiKey,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: contents,
                            tools: [{ function_declarations: toolDeclarations }],
                            generationConfig: { temperature: 0.3 }
                        })
                    }
                );

                if (!response.ok) {
                    var errData = await response.json();
                    onStep({ type: 'error', message: 'API 错误: ' + (errData.error?.message || response.status) });
                    return null;
                }

                var data = await response.json();
                var candidate = data.candidates && data.candidates[0];
                if (!candidate || !candidate.content || !candidate.content.parts) {
                    onStep({ type: 'error', message: 'AI 返回为空' });
                    return null;
                }

                var parts = candidate.content.parts;
                var functionCall = null;
                var textPart = '';

                for (var i = 0; i < parts.length; i++) {
                    if (parts[i].functionCall) functionCall = parts[i].functionCall;
                    if (parts[i].text) textPart += parts[i].text;
                }

                // 把 model 的回复加入历史
                contents.push({ role: 'model', parts: parts });

                // 如果有 function_call → 执行工具
                if (functionCall) {
                    var toolName = functionCall.name;
                    var toolArgs = functionCall.args || {};

                    onStep({
                        type: 'tool_call',
                        tool: toolName,
                        args: toolArgs,
                        icon: this._getToolIcon(toolName),
                        message: '🔧 调用工具: ' + this._getToolLabel(toolName)
                    });

                    // 执行工具
                    var toolResult;
                    if (this.tools[toolName]) {
                        try {
                            toolResult = await this.tools[toolName].execute(toolArgs);
                        } catch (e) {
                            toolResult = { error: '工具执行失败: ' + e.message };
                        }
                    } else {
                        toolResult = { error: '未知工具: ' + toolName };
                    }

                    onStep({
                        type: 'tool_result',
                        tool: toolName,
                        result: toolResult,
                        message: '✅ 工具返回结果'
                    });

                    // 把工具结果加入历史
                    contents.push({
                        role: 'user',
                        parts: [{
                            functionResponse: {
                                name: toolName,
                                response: toolResult
                            }
                        }]
                    });

                    continue; // 继续循环让 AI 处理结果
                }

                // 没有 function_call → AI 给出了最终回答
                if (textPart) {
                    onStep({ type: 'final', message: textPart });
                    return textPart;
                }

            } catch (e) {
                onStep({ type: 'error', message: '执行出错: ' + e.message });
                return null;
            }
        }

        onStep({ type: 'warning', message: '⚠️ 达到最大执行步骤数(' + this.MAX_ITERATIONS + ')，已停止' });
        return null;
    },

    // 工具图标映射
    _getToolIcon: function (name) {
        var map = { web_search: '🔍', price_calculate: '💰', get_exchange_rate: '🧮', draft_email: '📧', crm_query: '📊', read_signals: '📡', analyze_data: '📈' };
        return map[name] || '🔧';
    },
    _getToolLabel: function (name) {
        var map = { web_search: '搜索互联网', price_calculate: '计算报价', get_exchange_rate: '查询汇率', draft_email: '生成邮件草稿', crm_query: '查询CRM', read_signals: '读取情报信号', analyze_data: '分析数据' };
        return map[name] || name;
    }
};

window.AgentRuntime = AgentRuntime;
