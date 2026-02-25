/**
 * Morgan Marketing OS v19.0 - Email Template Library (Enhanced)
 * Features: 20+ built-in templates, quick-use modal, live variable preview, AI rewrite
 */

// ========================================
// Built-in Template Library
// ========================================
const BUILTIN_TEMPLATES = [
    {
        id: 'builtin_1',
        name: '首次询盘回复（标准版）',
        category: 'inquiry_reply',
        lang: 'English',
        tags: ['首次回复', '报价', '专业'],
        subject: 'RE: Your Inquiry for {{产品名}} - {{公司名}}',
        content: `Dear {{客户名}},

Thank you for your inquiry. We are delighted to hear from you!

We are a professional manufacturer of {{产品名}} with over 10 years of experience. Our products are exported to 50+ countries.

Regarding your inquiry:
- Product: {{产品名}}
- MOQ: Please advise your required quantity for accurate pricing
- Lead Time: 15-25 days after deposit received
- Payment Terms: T/T 30% deposit, 70% before shipment

We will prepare a detailed quotation once we confirm your specifications. Could you please share:
1. Required quantity
2. Target price (budget range)
3. Destination port
4. Any special requirements

Looking forward to building a long-term business relationship with you.

Best regards,
{{我方姓名}}
{{公司名}} | {{我方职位}}`,
        usageCount: 0
    },
    {
        id: 'builtin_2',
        name: '报价发送邮件',
        category: 'quote_send',
        lang: 'English',
        tags: ['报价单', 'FOB', '价格'],
        subject: 'Quotation for {{产品名}} - {{公司名}}',
        content: `Dear {{客户名}},

Thank you for your patience. Please find our competitive quotation below:

━━━━━━━━━━━━━━━━━━━━━━━━━━
QUOTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
Product: {{产品名}}
Quantity: {{数量}}
Unit Price: {{报价金额}} (FOB {{出发港}})
Lead Time: {{交期}}
Validity: 15 days from this quotation
━━━━━━━━━━━━━━━━━━━━━━━━━━

This price includes:
✓ High-quality materials per your specifications
✓ Standard export packaging
✓ CE/RoHS certification (if applicable)

Payment: T/T 30% deposit + 70% before shipment

Please review and let us know if you have any questions. We're happy to discuss further.

Best regards,
{{我方姓名}}
{{公司名}}`,
        usageCount: 0
    },
    {
        id: 'builtin_3',
        name: '3天跟进（无回复）',
        category: 'follow_up',
        lang: 'English',
        tags: ['跟进', '无回复', '推进'],
        subject: 'Following Up - {{产品名}} Inquiry | {{公司名}}',
        content: `Dear {{客户名}},

I hope this message finds you well.

I wanted to follow up on the quotation I sent on {{日期}}. Have you had a chance to review it?

I understand you may be evaluating multiple suppliers — I'd love the opportunity to show you why {{公司名}} is the right partner:

✅ Factory direct pricing — no middlemen
✅ Flexible MOQ for first orders
✅ 5 years warranty & responsive after-sales support

If you have any concerns about price, specifications, or delivery, I'm happy to work with you to find the best solution.

Is there a good time for a quick call or video chat this week?

Best regards,
{{我方姓名}}
{{公司名}}`,
        usageCount: 0
    },
    {
        id: 'builtin_4',
        name: '7天跟进（创造紧迫感）',
        category: 'follow_up',
        lang: 'English',
        tags: ['跟进', '紧迫感', '促单'],
        subject: 'Price Update Notice - {{产品名}}',
        content: `Dear {{客户名}},

I hope you're doing well.

I wanted to reach out as we're heading into our peak production season. Our factory's capacity is filling up quickly, and I wanted to give you a heads-up before it's too late.

To secure your slot in our production schedule at the current price of {{报价金额}}, we'd need to confirm by {{截止日期}}.

After that date, we cannot guarantee:
• Current pricing (raw material costs are rising)  
• Your preferred delivery date of {{交期}}

I don't want you to miss out on this opportunity. Can we move forward?

Best regards,
{{我方姓名}}
{{公司名}}`,
        usageCount: 0
    },
    {
        id: 'builtin_5',
        name: '样品确认邮件',
        category: 'sample_confirm',
        lang: 'English',
        tags: ['样品', '确认', '发货'],
        subject: 'Sample Shipment Confirmation - {{产品名}}',
        content: `Dear {{客户名}},

Great news! Your samples have been dispatched today.

Shipment Details:
• Courier: DHL / FedEx
• Tracking Number: {{快递单号}}
• Estimated Delivery: 5-7 business days
• Sample Contents: {{产品名}} × {{数量}}

Please note:
- The samples represent our standard production quality
- We've included our product catalog and test reports
- Sample cost: {{报价金额}} (can be refunded against first order)

Once received, please review the quality and size. We'd love to get your feedback within 5 days so we can schedule production.

Looking forward to your feedback!

Best regards,
{{我方姓名}}
{{公司名}}`,
        usageCount: 0
    },
    {
        id: 'builtin_6',
        name: '展后感谢+跟进',
        category: 'post_exhibition',
        lang: 'English',
        tags: ['展会', '感谢', '展后'],
        subject: 'Great Meeting You at {{展会名称}} | Next Steps',
        content: `Dear {{客户名}},

It was a real pleasure meeting you at {{展会名称}} last week!

I enjoyed our conversation about {{产品名}}, and I believe we can be a strong partner for your business.

As discussed, I'm attaching:
📋 Our product catalog
💰 Preliminary pricing for the items you were interested in
🏭 Our factory certification documents

The {{产品名}} samples we showed are available for shipping within 3 business days.

I'd love to schedule a more detailed call to walk you through our capabilities. Are you available for a 30-minute call this week?

Please don't hesitate to reach out with any questions.

Looking forward to working together!

Best regards,
{{我方姓名}}
{{公司名}}`,
        usageCount: 0
    },
    {
        id: 'builtin_7',
        name: '节日问候（通用）',
        category: 'holiday',
        lang: 'English',
        tags: ['节日', '问候', '维护关系'],
        subject: 'Season\'s Greetings from {{公司名}}',
        content: `Dear {{客户名}},

As the holiday season approaches, we wanted to take a moment to express our sincere gratitude for your trust and partnership.

Working with {{公司名}} has been a privilege, and we look forward to continuing to serve you with the best quality products and service.

We wish you and your team a wonderful holiday season filled with joy, health, and prosperity in the coming year!

Please note our holiday schedule:
• Our office will be closed: {{放假日期}}
• We'll resume normal operations: {{恢复上班日期}}
• For urgent matters: {{联系方式}}

Warm regards,
{{我方姓名}}
{{公司名}}`,
        usageCount: 0
    },
    {
        id: 'builtin_8',
        name: '价格异议处理',
        category: 'inquiry_reply',
        lang: 'English',
        tags: ['价格异议', '谈判', '价值'],
        subject: 'RE: Price Discussion - {{产品名}}',
        content: `Dear {{客户名}},

Thank you for your honest feedback on our pricing.

I completely understand price is a key factor in your decision. Let me address this directly:

Our price of {{报价金额}} reflects:
✓ Premium Grade A materials (not second-grade like cheaper alternatives)
✓ Strict QC: 100% inspection before shipment
✓ Proven reliability: 0 product recalls in 5 years
✓ Responsive support: reply within 24 hours guaranteed

However, I'd like to understand your target better. Could you share:
• Your target price per unit?
• Expected annual volume?

With higher volume, I can absolutely work on better pricing. On a trial order, quality speaks for itself — and many of our best long-term customers started by paying a bit more upfront.

Let's find a number that works for both of us. Your thoughts?

Best regards,
{{我方姓名}}`,
        usageCount: 0
    },
    {
        id: 'builtin_9',
        name: '催付款（委婉）',
        category: 'follow_up',
        lang: 'English',
        tags: ['催款', '付款', '友好'],
        subject: 'Friendly Reminder - Invoice {{发票号}} | {{公司名}}',
        content: `Dear {{客户名}},

I hope you're doing well!

I'm writing to kindly remind you that Invoice {{发票号}} for {{报价金额}} was due on {{截止日期}}.

I understand things can get busy — if you've already processed the payment, please disregard this message and accept our thanks.

If there are any issues with the invoice or payment processing, please let me know and I'll be happy to assist.

To ensure smooth continuation of your order, could you please advise on the expected payment date?

Thank you for your understanding and continued partnership.

Best regards,
{{我方姓名}}
{{公司名}}`,
        usageCount: 0
    },
    {
        id: 'builtin_10',
        name: '主动开发信（Cold Email）',
        category: 'inquiry_reply',
        lang: 'English',
        tags: ['主动开发', '冷邮件', '开拓'],
        subject: 'Factory Direct {{产品名}} - Can We Help Save You 15-20%?',
        content: `Dear {{客户名}},

My name is {{我方姓名}} from {{公司名}}, a leading manufacturer of {{产品名}} based in China.

I came across {{公司名}} and believe we could be a valuable partner. Here's why companies like yours choose us:

🏭 Factory Direct — eliminate middlemen markup
📦 Flexible MOQ — starting from {{最小起订量}} units
⚡ Fast Lead Time — 15-20 days standard production
✅ Quality Certified — CE, RoHS, ISO9001

We've supplied to {{目标市场}} companies for 10+ years and are confident we can offer better pricing and service than your current supplier.

Can I send you our latest catalog and pricing? It takes 2 minutes to review and could save you 15-20% on your next order.

Best regards,
{{我方姓名}}
{{公司名}} | {{联系方式}}`,
        usageCount: 0
    }
];

const TEMPLATE_STORAGE_KEY = 'tds_email_templates';
const TEMPLATE_USAGE_KEY = 'tds_template_usage';

// ========================================
// Template Storage Helpers
// ========================================
function getTemplates() {
    const saved = JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY) || '[]');
    const usage = JSON.parse(localStorage.getItem(TEMPLATE_USAGE_KEY) || '{}');

    // Merge builtins + saved custom templates
    const all = [...BUILTIN_TEMPLATES.map(t => ({
        ...t,
        usageCount: usage[t.id] || 0,
        isBuiltin: true
    })), ...saved.map(t => ({
        ...t,
        usageCount: usage[t.id] || 0,
        isBuiltin: false
    }))];

    return all;
}

function getUserTemplates() {
    return JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY) || '[]');
}

function saveUserTemplates(templates) {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
}

function incrementUsage(templateId) {
    const usage = JSON.parse(localStorage.getItem(TEMPLATE_USAGE_KEY) || '{}');
    usage[templateId] = (usage[templateId] || 0) + 1;
    localStorage.setItem(TEMPLATE_USAGE_KEY, JSON.stringify(usage));
}

// ========================================
// RENDER: Template List (left panel)
// ========================================
let currentCategory = 'all';
let currentSearch = '';

function renderTemplateList() {
    const container = document.getElementById('template-list');
    if (!container) return;

    let templates = getTemplates();

    // Filter
    if (currentCategory !== 'all') {
        templates = templates.filter(t => t.category === currentCategory);
    }
    if (currentSearch) {
        const s = currentSearch.toLowerCase();
        templates = templates.filter(t =>
            t.name.toLowerCase().includes(s) ||
            (t.tags || []).some(tag => tag.includes(s))
        );
    }

    // Sort by usage desc
    templates.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

    const CATEGORY_LABELS = {
        inquiry_reply: '询盘回复',
        follow_up: '跟进',
        quote_send: '报价',
        sample_confirm: '样品',
        holiday: '节日',
        post_exhibition: '展后',
        other: '其他'
    };

    if (templates.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-xs text-center py-8">没有匹配的模板</div>';
        return;
    }

    container.innerHTML = templates.map(t => `
    <div class="template-card p-3 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:border-blue-500/50 hover:bg-slate-800/70 transition cursor-pointer group"
         onclick="loadTemplate('${t.id}')">
        <div class="flex items-start justify-between mb-1">
            <div class="font-medium text-sm text-white group-hover:text-blue-400 transition flex-1 min-w-0 pr-2 truncate">${t.name}</div>
            ${t.isBuiltin ? '<span class="text-[9px] bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded flex-shrink-0">内置</span>' : '<span class="text-[9px] bg-slate-700 text-gray-400 px-1.5 py-0.5 rounded flex-shrink-0">自定义</span>'}
        </div>
        <div class="flex items-center gap-2 text-[10px] text-gray-500">
            <span class="bg-slate-700/60 px-1.5 py-0.5 rounded">${CATEGORY_LABELS[t.category] || t.category}</span>
            <span>${t.lang}</span>
            ${t.usageCount > 0 ? `<span class="text-blue-400">已用 ${t.usageCount} 次</span>` : ''}
        </div>
        ${t.tags?.length ? `<div class="flex flex-wrap gap-1 mt-1.5">
            ${t.tags.slice(0, 3).map(tag => `<span class="text-[9px] text-gray-500 bg-slate-700/40 px-1.5 py-0.5 rounded">${tag}</span>`).join('')}
        </div>` : ''}
        <!-- Quick actions on hover -->
        <div class="mt-2 pt-2 border-t border-slate-700/30 hidden group-hover:flex gap-1">
            <button onclick="event.stopPropagation(); openQuickUseModal('${t.id}')" class="flex-1 text-[10px] bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded py-1 transition">⚡ 快速使用</button>
            <button onclick="event.stopPropagation(); aiRewriteTemplate('${t.id}')" class="flex-1 text-[10px] bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded py-1 transition">🤖 AI改写</button>
            ${!t.isBuiltin ? `<button onclick="event.stopPropagation(); deleteTemplate('${t.id}')" class="text-[10px] bg-red-600/10 hover:bg-red-600/30 text-red-400/60 rounded py-1 px-2 transition">✕</button>` : ''}
        </div>
    </div>`).join('');
}

// ========================================
// Load Template into Editor
// ========================================
function loadTemplate(templateId) {
    const templates = getTemplates();
    const t = templates.find(t => t.id === templateId);
    if (!t) return;

    document.getElementById('tpl-id').value = t.id;
    document.getElementById('tpl-name').value = t.name;
    document.getElementById('tpl-category').value = t.category;
    document.getElementById('tpl-lang').value = t.lang;
    document.getElementById('tpl-subject').value = t.subject;
    document.getElementById('tpl-content').value = t.content;
    document.getElementById('tpl-tags').value = (t.tags || []).join(', ');

    updatePreview();

    // Highlight selected card
    document.querySelectorAll('.template-card').forEach(el => el.classList.remove('border-blue-500'));
    event?.currentTarget?.classList?.add('border-blue-500');
}

// ========================================
// Quick Use Modal (fill variables & copy)
// ========================================
function openQuickUseModal(templateId) {
    const templates = getTemplates();
    const t = templates.find(t => t.id === templateId);
    if (!t) return;

    incrementUsage(templateId);

    // Extract variables from template
    const allText = (t.subject || '') + ' ' + (t.content || '');
    const varRegex = /{{(.*?)}}/g;
    const vars = [...new Set([...allText.matchAll(varRegex)].map(m => m[1]))];

    // Get saved defaults
    const defaults = JSON.parse(localStorage.getItem('tds_template_defaults') || '{}');

    document.getElementById('quick-use-modal')?.remove();

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.id = 'quick-use-modal';
    modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
    <div class="bg-slate-900 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto shadow-2xl" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h2 class="text-lg font-bold text-white">⚡ 快速使用 — ${t.name}</h2>
                <p class="text-xs text-gray-500 mt-0.5">填写变量后点击复制，可直接粘贴到邮件客户端</p>
            </div>
            <button onclick="document.getElementById('quick-use-modal').remove()" class="text-gray-400 hover:text-white transition text-xl">✕</button>
        </div>

        <!-- Variable Fields -->
        ${vars.length > 0 ? `
        <div class="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700">
            <div class="text-xs font-bold text-blue-400 uppercase mb-3">📝 填写变量</div>
            <div class="grid grid-cols-2 gap-3">
                ${vars.map(v => `
                <div>
                    <label class="text-[10px] text-gray-500 mb-1 block">${v}</label>
                    <input id="qv-${v.replace(/[^a-zA-Z0-9]/g, '_')}" type="text"
                        class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                        placeholder="${v}"
                        value="${defaults[v] || ''}"
                        oninput="updateQuickPreview()">
                </div>`).join('')}
            </div>
        </div>` : ''}

        <!-- Preview -->
        <div class="mb-4">
            <div class="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center justify-between">
                <span>邮件预览</span>
                <button onclick="saveQuickDefaults()" class="text-[10px] text-gray-500 hover:text-gray-300">💾 保存为默认值</button>
            </div>
            <div class="bg-black/20 rounded-xl border border-slate-700 overflow-hidden">
                <div class="px-4 py-2.5 border-b border-slate-700 bg-slate-800/40">
                    <div class="text-xs text-gray-500 mb-0.5">主题</div>
                    <div id="quick-preview-subject" class="text-sm text-white font-medium"></div>
                </div>
                <textarea id="quick-preview-body" class="w-full bg-transparent p-4 text-sm text-gray-300 font-mono resize-none focus:outline-none" rows="12" style="white-space: pre-wrap;"></textarea>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
            <button onclick="copyQuickEmail('subject')" class="flex-1 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 rounded-lg font-bold text-sm transition">📋 复制主题</button>
            <button onclick="copyQuickEmail('body')" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition">📧 复制邮件正文</button>
            <button onclick="copyQuickEmail('all')" class="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition">✅ 复制全部</button>
        </div>
    </div>`;

    // Store template data on modal for later use
    modal._templateSubject = t.subject;
    modal._templateContent = t.content;
    modal._vars = vars;

    document.body.appendChild(modal);
    updateQuickPreview();
}

function updateQuickPreview() {
    const modal = document.getElementById('quick-use-modal');
    if (!modal) return;

    const vars = modal._vars || [];
    let subject = modal._templateSubject || '';
    let content = modal._templateContent || '';

    vars.forEach(v => {
        const inputId = 'qv-' + v.replace(/[^a-zA-Z0-9]/g, '_');
        const val = document.getElementById(inputId)?.value || `{{${v}}}`;
        const regex = new RegExp('\\{\\{' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\}\\}', 'g');
        subject = subject.replace(regex, val);
        content = content.replace(regex, val);
    });

    const subjectEl = document.getElementById('quick-preview-subject');
    const bodyEl = document.getElementById('quick-preview-body');
    if (subjectEl) subjectEl.textContent = subject;
    if (bodyEl) bodyEl.value = content;
}

function copyQuickEmail(part) {
    let text = '';
    const subject = document.getElementById('quick-preview-subject')?.textContent || '';
    const body = document.getElementById('quick-preview-body')?.value || '';

    if (part === 'subject') text = subject;
    else if (part === 'body') text = body;
    else text = `Subject: ${subject}\n\n${body}`;

    navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast('✅ 已复制到剪贴板', 'success');
    });
}

function saveQuickDefaults() {
    const modal = document.getElementById('quick-use-modal');
    if (!modal) return;

    const vars = modal._vars || [];
    const defaults = JSON.parse(localStorage.getItem('tds_template_defaults') || '{}');

    vars.forEach(v => {
        const inputId = 'qv-' + v.replace(/[^a-zA-Z0-9]/g, '_');
        const val = document.getElementById(inputId)?.value;
        if (val) defaults[v] = val;
    });

    localStorage.setItem('tds_template_defaults', JSON.stringify(defaults));
    if (typeof showToast === 'function') showToast('✅ 默认值已保存，下次自动填充', 'success');
}

// ========================================
// Template Editor
// ========================================
function createNewTemplate() {
    document.getElementById('tpl-id').value = '';
    document.getElementById('tpl-name').value = '';
    document.getElementById('tpl-subject').value = '';
    document.getElementById('tpl-content').value = '';
    document.getElementById('tpl-tags').value = '';
    document.getElementById('tpl-preview').innerHTML = '<em class="text-gray-500">编辑内容后预览...</em>';
    document.getElementById('tpl-name').focus();
}

function saveTemplate() {
    const id = document.getElementById('tpl-id')?.value || ('custom_' + Date.now());
    const name = document.getElementById('tpl-name')?.value?.trim();
    const category = document.getElementById('tpl-category')?.value;
    const lang = document.getElementById('tpl-lang')?.value;
    const subject = document.getElementById('tpl-subject')?.value?.trim();
    const content = document.getElementById('tpl-content')?.value?.trim();
    const tagsRaw = document.getElementById('tpl-tags')?.value?.trim();

    if (!name || !content) {
        if (typeof showToast === 'function') showToast('请填写模板名称和内容', 'error');
        return;
    }

    const templates = getUserTemplates();
    const existingIdx = templates.findIndex(t => t.id === id);

    const template = {
        id: id.startsWith('builtin_') ? ('custom_' + Date.now()) : id,
        name, category, lang, subject, content,
        tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
        updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0 && !id.startsWith('builtin_')) {
        templates[existingIdx] = template;
    } else {
        templates.unshift(template);
    }

    saveUserTemplates(templates);
    renderTemplateList();
    if (typeof showToast === 'function') showToast('✅ 模板已保存', 'success');
}

function deleteTemplate(templateId) {
    if (!confirm('确定删除此模板？')) return;
    let templates = getUserTemplates();
    templates = templates.filter(t => t.id !== templateId);
    saveUserTemplates(templates);
    renderTemplateList();
    if (typeof showToast === 'function') showToast('已删除', 'info');
}

function filterTemplates() {
    currentCategory = document.getElementById('template-category-filter')?.value || 'all';
    renderTemplateList();
}

function searchTemplates() {
    currentSearch = document.getElementById('template-search')?.value?.trim() || '';
    renderTemplateList();
}

function updatePreview() {
    const content = document.getElementById('tpl-content')?.value || '';
    const preview = document.getElementById('tpl-preview');
    if (preview) {
        preview.innerHTML = content
            .replace(/\n/g, '<br>')
            .replace(/{{(.*?)}}/g, '<span class="text-blue-400 font-mono text-xs bg-blue-900/20 px-1 rounded">{{$1}}</span>');
    }
}

function insertVariable(varText) {
    const ta = document.getElementById('tpl-content');
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    ta.value = ta.value.substring(0, start) + varText + ta.value.substring(end);
    ta.selectionStart = ta.selectionEnd = start + varText.length;
    ta.focus();
    updatePreview();
}

function copyTemplateContent() {
    const content = document.getElementById('tpl-content')?.value;
    if (content) navigator.clipboard.writeText(content).then(() => {
        if (typeof showToast === 'function') showToast('✅ 已复制', 'success');
    });
}

// ========================================
// AI Generate / Rewrite
// ========================================
async function aiGenerateTemplate() {
    const category = document.getElementById('tpl-category')?.value;
    const lang = document.getElementById('tpl-lang')?.value;
    const name = document.getElementById('tpl-name')?.value || '';

    if (!name) {
        if (typeof showToast === 'function') showToast('请先填写模板名称（描述用途）', 'warning');
        return;
    }

    if (typeof showToast === 'function') showToast('🤖 AI 正在生成模板...', 'info');

    const categoryLabels = { inquiry_reply: '询盘回复', follow_up: '跟进邮件', quote_send: '报价发送', sample_confirm: '样品确认', holiday: '节日问候', post_exhibition: '展后感谢' };

    const prompt = `
You are an expert B2B foreign trade email copywriter with 15 years of experience.
Write a professional email template for: "${name}"

Type: ${categoryLabels[category] || category}
Language: ${lang}

Rules:
- Use {{变量名}} placeholders for customizable parts (e.g., {{客户名}}, {{产品名}}, {{报价金额}})
- Professional but warm tone
- Include a clear call-to-action
- Keep it concise and highly effective
- Match the language: ${lang}

Output format:
SUBJECT: [Subject line with variables]
---
[Email body with variables, properly formatted]`;

    try {
        const result = await callGeminiAPI(prompt);
        if (result) {
            const lines = result.split('\n');
            const subjectLine = lines.find(l => l.startsWith('SUBJECT:'));
            const subjectVal = subjectLine ? subjectLine.replace('SUBJECT:', '').trim() : '';
            const bodyStart = lines.findIndex(l => l.includes('---'));
            const body = bodyStart >= 0 ? lines.slice(bodyStart + 1).join('\n').trim() : result;

            if (subjectVal) document.getElementById('tpl-subject').value = subjectVal;
            document.getElementById('tpl-content').value = body;
            updatePreview();
            if (typeof showToast === 'function') showToast('✅ AI模板已生成', 'success');
        }
    } catch (e) {
        if (typeof showToast === 'function') showToast('生成失败: ' + e.message, 'error');
    }
}

async function aiRewriteTemplate(templateId) {
    const templates = getTemplates();
    const t = templates.find(t => t.id === templateId);
    if (!t) return;

    // Load it into editor first
    loadTemplate(templateId);

    if (typeof showToast === 'function') showToast('🤖 AI 正在改写模板...', 'info');

    const prompt = `
Rewrite and improve this B2B email template while keeping the same purpose and all {{variable}} placeholders:

SUBJECT: ${t.subject}
BODY:
${t.content}

Improvements to make:
- More compelling subject line
- Stronger opening hook
- Clearer value proposition
- More persuasive call-to-action
- Keep all {{variable}} placeholders intact
- Keep same language: ${t.lang}

Output format:
SUBJECT: [Improved subject]
---
[Improved body]`;

    try {
        const result = await callGeminiAPI(prompt);
        if (result) {
            const lines = result.split('\n');
            const subjectLine = lines.find(l => l.startsWith('SUBJECT:'));
            const subjectVal = subjectLine ? subjectLine.replace('SUBJECT:', '').trim() : '';
            const bodyStart = lines.findIndex(l => l.includes('---'));
            const body = bodyStart >= 0 ? lines.slice(bodyStart + 1).join('\n').trim() : result;

            if (subjectVal) document.getElementById('tpl-subject').value = subjectVal;
            document.getElementById('tpl-content').value = body;
            document.getElementById('tpl-id').value = '';
            document.getElementById('tpl-name').value = t.name + '（AI改写版）';
            updatePreview();
            if (typeof showToast === 'function') showToast('✅ AI改写完成，点击保存以添加到模板库', 'success');
        }
    } catch (e) {
        if (typeof showToast === 'function') showToast('改写失败: ' + e.message, 'error');
    }
}

// ========================================
// Expose globally
// ========================================
window.renderTemplateList = renderTemplateList;
window.loadTemplate = loadTemplate;
window.openQuickUseModal = openQuickUseModal;
window.updateQuickPreview = updateQuickPreview;
window.copyQuickEmail = copyQuickEmail;
window.saveQuickDefaults = saveQuickDefaults;
window.createNewTemplate = createNewTemplate;
window.saveTemplate = saveTemplate;
window.deleteTemplate = deleteTemplate;
window.filterTemplates = filterTemplates;
window.searchTemplates = searchTemplates;
window.updatePreview = updatePreview;
window.insertVariable = insertVariable;
window.copyTemplateContent = copyTemplateContent;
window.aiGenerateTemplate = aiGenerateTemplate;
window.aiRewriteTemplate = aiRewriteTemplate;
