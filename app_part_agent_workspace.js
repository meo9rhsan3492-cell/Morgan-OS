/**
 * Morgan Marketing OS - Agent Workspace UI
 * Agent Workspace tab content + step rendering
 */
var AgentWorkspaceUI = {

    initWorkspace: function () {
        if (document.getElementById('agent-workspace')) return;

        // 找到所有 tab-content 所在的容器
        var allTabs = document.querySelectorAll('.tab-content');
        if (allTabs.length === 0) return;
        var parent = allTabs[0].parentElement;
        if (!parent) return;

        var div = document.createElement('div');
        div.id = 'agent-workspace';
        div.className = 'tab-content';

        div.innerHTML = '<h2 class="text-4xl font-black mb-2" style="color:var(--text-primary)">\uD83E\uDDE0 AI Agent \u5DE5\u4F5C\u53F0</h2>'
            + '<p class="text-sm mb-6" style="color:var(--text-secondary)">\u771F\u6B63\u7684\u81EA\u4E3B AI Agent \u00B7 \u4E0B\u8FBE\u4EFB\u52A1\u81EA\u52A8\u6267\u884C \u00B7 Gemini Function Calling + Tool Use</p>'
            + '<div class="panel mb-6 p-5 border border-blue-500/20 bg-blue-500/5 rounded-2xl">'
            + '<div class="flex items-center gap-3 mb-3"><span class="text-2xl">\uD83D\uDCA1</span><span class="text-sm font-bold text-blue-300">\u8FD9\u4E0D\u662F\u804A\u5929\u673A\u5668\u4EBA\uFF0C\u800C\u662F\u80FD\u6267\u884C\u4EFB\u52A1\u7684 AI Agent</span></div>'
            + '<div class="text-xs text-gray-400">\u5B83\u53EF\u4EE5\u81EA\u52A8\u8C03\u7528\u5DE5\u5177\uFF08\u641C\u7D22\u4E92\u8054\u7F51\u3001\u8BA1\u7B97\u62A5\u4EF7\u3001\u67E5\u6C47\u7387\u3001\u8BFB\u53D6CRM\u6570\u636E\u3001\u751F\u6210\u90AE\u4EF6\uFF09\u6765\u5B8C\u6210\u4F60\u7684\u6307\u4EE4\u3002\u6BCF\u4E00\u6B65\u4F1A\u5B9E\u65F6\u5C55\u793A\u6267\u884C\u8FC7\u7A0B\u3002</div></div>'
            + '<div class="mb-6"><div class="text-xs font-bold text-gray-500 uppercase mb-3">\u26A1 \u5FEB\u6377\u4EFB\u52A1</div>'
            + '<div class="grid grid-cols-2 md:grid-cols-3 gap-2" id="agent-quick-tasks"></div></div>'
            + '<div class="panel mb-6 p-4"><div class="flex gap-3">'
            + '<textarea id="agent-task-input" rows="2" class="flex-1 bg-slate-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u8F93\u5165\u4EFB\u52A1\u6307\u4EE4\uFF0C\u5982\uFF1A\u5E2E\u6211\u8C03\u7814\u5FB7\u56FD\u6237\u5916\u5BB6\u5177\u5E02\u573A\u5E76\u7ED9\u51FA\u5F00\u53D1\u5EFA\u8BAE"></textarea>'
            + '<button onclick="AgentWorkspaceUI.runTask()" id="agent-run-btn" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 whitespace-nowrap">\uD83D\uDE80 \u6267\u884C</button>'
            + '</div></div>'
            + '<div id="agent-execution-panel" style="display:none">'
            + '<div class="flex items-center justify-between mb-3"><div class="text-xs font-bold text-gray-500 uppercase">\uD83D\uDD04 \u6267\u884C\u8FC7\u7A0B</div>'
            + '<button onclick="AgentWorkspaceUI.clearExec()" class="text-xs text-gray-600 hover:text-gray-400">\u6E05\u7A7A</button></div>'
            + '<div id="agent-steps" class="space-y-2"></div></div>'
            + '<div id="agent-result-panel" style="display:none" class="mt-4">'
            + '<div class="panel p-5 border-l-4 border-green-500">'
            + '<div class="text-xs font-bold text-green-400 uppercase mb-3">\u2705 \u6700\u7EC8\u7ED3\u679C</div>'
            + '<div id="agent-final-result" class="text-sm text-gray-300 leading-relaxed"></div></div></div>';

        parent.appendChild(div);
        this.renderQuickTasks();
        console.log('[AgentWorkspace] UI initialized successfully');
    },

    renderQuickTasks: function () {
        var c = document.getElementById('agent-quick-tasks');
        if (!c) return;
        var tasks = [
            { i: '\uD83D\uDD0D', l: '\u8C03\u7814\u76EE\u6807\u5E02\u573A', p: '\u5E2E\u6211\u8C03\u7814\u6B27\u6D32\u6237\u5916\u5BB6\u5177\u5E02\u573A\u7684\u6700\u65B0\u8D8B\u52BF\u548C\u673A\u4F1A\uFF0C\u5305\u62EC\u5E02\u573A\u89C4\u6A21\u3001\u4E3B\u8981\u7ADE\u4E89\u5BF9\u624B\u548C\u8FDB\u5165\u7B56\u7565\u3002' },
            { i: '\uD83D\uDCE7', l: '\u5199\u5F00\u53D1\u4FE1', p: '\u94DD\u5408\u91D1\u6237\u5916\u5BB6\u5177\u5DE5\u5382\uFF0C\u4F18\u52BF\u662F10\u5E74\u8D28\u4FDD\u548C\u81EA\u6709\u5DE5\u5382\u3002\u5E2E\u6211\u5199\u4E00\u5C01\u5F00\u53D1\u4FE1\u7ED9\u7F8E\u56FD\u8FDB\u53E3\u5546\uFF0C\u5148\u641C\u7D22\u4E00\u4E0B\u7F8E\u56FD\u6237\u5916\u5BB6\u5177\u5E02\u573A\u3002' },
            { i: '\uD83D\uDCB0', l: '\u67E5\u6C47\u7387\u62A5\u4EF7', p: '\u67E5\u8BE2\u6700\u65B0\u7F8E\u5143\u5BF9\u4EBA\u6C11\u5E01\u6C47\u7387\uFF0C\u7136\u540E\u5E2E\u6211\u8BA1\u7B97\u4E00\u6B3E\u51FA\u5382\u4EF7200\u5143\u4EBA\u6C11\u5E01\u7684\u4EA7\u54C1\u7684FOB\u548CCIF\u62A5\u4EF7\uFF0C\u6570\u91CF500\u4EF6\u3002' },
            { i: '\uD83E\uDDE9', l: '\u89E3\u7801\u8BE2\u76D8', p: '\u6536\u5230\u8BE2\u76D8\uFF1AHi, we are a German distributor looking for 1000pcs aluminum garden chairs. Need FOB Ningbo price, MOQ, lead time, and certifications. \u5E2E\u6211\u5206\u6790\u8FD9\u4E2A\u8BE2\u76D8\u5E76\u7ED9\u51FA\u62A5\u4EF7\u7B56\u7565\u548C\u56DE\u590D\u5EFA\u8BAE\u3002' },
            { i: '\uD83D\uDCCA', l: '\u8BCA\u65AD\u9500\u552E\u6570\u636E', p: '\u67E5\u770B\u6211\u7684CRM\u5BA2\u6237\u7BA1\u9053\u6570\u636E\uFF0C\u5206\u6790\u5404\u9636\u6BB5\u8F6C\u5316\u7387\u662F\u5426\u5065\u5EB7\uFF0C\u627E\u51FA\u95EE\u9898\u5E76\u7ED9\u51FA\u6539\u8FDB\u5EFA\u8BAE\u3002' },
            { i: '\uD83D\uDCF0', l: '\u884C\u4E1A\u8D44\u8BAF\u641C\u7D22', p: '\u641C\u7D22\u6700\u65B0\u7684\u5149\u4F0F\u884C\u4E1A\u51FA\u53E3\u653F\u7B56\u53D8\u5316\uFF0C\u5305\u62EC\u6B27\u76DF\u7684\u53CD\u503E\u9500\u8C03\u67E5\u548C\u7F8E\u56FD\u7684\u5173\u7A0E\u653F\u7B56\uFF0C\u5206\u6790\u5BF9\u6211\u4EEC\u7684\u5F71\u54CD\u3002' }
        ];
        c.innerHTML = tasks.map(function (t) {
            return '<button onclick="AgentWorkspaceUI.quickTask(this)" data-prompt="' + t.p.replace(/"/g, '&quot;') + '" class="px-3 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-gray-700/40 hover:border-blue-500/40 rounded-xl text-left transition-all group">'
                + '<span class="text-base mr-1.5">' + t.i + '</span><span class="text-xs text-gray-400 group-hover:text-white">' + t.l + '</span></button>';
        }).join('');
    },

    quickTask: function (btn) {
        var input = document.getElementById('agent-task-input');
        if (input) input.value = btn.getAttribute('data-prompt');
        this.runTask();
    },

    runTask: function () {
        var input = document.getElementById('agent-task-input');
        if (!input || !input.value.trim()) { if (window.showToast) window.showToast('请输入任务指令', 'warning'); return; }

        var task = input.value.trim();
        var ep = document.getElementById('agent-execution-panel');
        var sd = document.getElementById('agent-steps');
        var rp = document.getElementById('agent-result-panel');
        var rd = document.getElementById('agent-final-result');
        var rb = document.getElementById('agent-run-btn');
        var sb = document.getElementById('agent-stop-btn');

        if (ep) ep.style.display = 'block';
        if (sd) sd.innerHTML = '';
        if (rp) rp.style.display = 'none';
        if (rd) rd.innerHTML = '';
        if (rb) { rb.disabled = true; rb.classList.add('opacity-50', 'cursor-not-allowed'); rb.innerHTML = '<span class="animate-spin inline-block mr-1">⚙️</span>执行中'; }
        if (sb) sb.classList.remove('hidden');

        var self = this;
        AgentRuntime.executeTask(task, function (step) {
            self.renderStep(step);
        }).then(function (result) {
            if (rb) { rb.disabled = false; rb.classList.remove('opacity-50', 'cursor-not-allowed'); rb.innerHTML = '🚀 执行'; }
            if (sb) sb.classList.add('hidden');
            if (result && rp && rd) {
                rp.style.display = 'block';
                // 使用全局的 marked() 如果有的话，否则回退简易正则
                var html = typeof window.marked === 'function' ? window.marked(result) : result
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                    .replace(/### (.*?)$/gm, '<h3 class="text-blue-400 font-bold mt-3 mb-1">$1</h3>')
                    .replace(/## (.*?)$/gm, '<h2 class="text-blue-300 font-bold mt-4 mb-2 text-lg">$1</h2>')
                    .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 rounded text-xs text-blue-300">$1</code>')
                    .replace(/\n/g, '<br>');
                rd.innerHTML = html;
                rp.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    },

    stopTask: function () {
        AgentRuntime.abortTask();
        var rb = document.getElementById('agent-run-btn');
        var sb = document.getElementById('agent-stop-btn');
        if (rb) { rb.disabled = false; rb.classList.remove('opacity-50', 'cursor-not-allowed'); rb.innerHTML = '🚀 执行'; }
        if (sb) sb.classList.add('hidden');
        this.renderStep({ type: 'error', message: '⚠️ 用户手动终止了任务' });
        if (window.showToast) window.showToast('任务已终止', 'info');
    },

    copyResult: function () {
        var rd = document.getElementById('agent-final-result');
        if (!rd || !rd.innerText) return;
        navigator.clipboard.writeText(rd.innerText).then(function () {
            if (window.showToast) window.showToast('结果已复制到剪贴板', 'success');
        });
    },

    renderStep: function (step) {
        var sd = document.getElementById('agent-steps');
        if (!sd) return;
        var el = document.createElement('div');

        var styles = {
            thinking: { bg: 'bg-blue-500/5 border-blue-500/20', icon: '\uD83E\uDDE0', color: 'text-blue-300' },
            tool_call: { bg: 'bg-purple-500/5 border-purple-500/20', icon: '\uD83D\uDD27', color: 'text-purple-300' },
            tool_result: { bg: 'bg-green-500/5 border-green-500/20', icon: '\u2705', color: 'text-green-300' },
            error: { bg: 'bg-red-500/5 border-red-500/20', icon: '\u274C', color: 'text-red-300' },
            warning: { bg: 'bg-yellow-500/5 border-yellow-500/20', icon: '\u26A0\uFE0F', color: 'text-yellow-300' },
            'final': { bg: 'bg-blue-500/5 border-blue-500/20', icon: '\uD83C\uDFC1', color: 'text-blue-300' }
        };

        var s = styles[step.type] || styles.thinking;
        el.className = 'flex items-start gap-3 px-4 py-3 rounded-xl border ' + s.bg;

        var icon = step.icon || s.icon;
        var extra = '';

        if (step.type === 'tool_call' && step.args) {
            extra = '<details class="mt-2"><summary class="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300 outline-none select-none">查看参数详情 (JSON)</summary><pre class="text-[10px] text-gray-400 mt-1 bg-slate-900/50 p-2 rounded max-h-32 overflow-auto">' + JSON.stringify(step.args, null, 2) + '</pre></details>';
        }
        if (step.type === 'tool_result' && step.result) {
            var preview = JSON.stringify(step.result, null, 2);
            extra = '<details class="mt-2"><summary class="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300 outline-none select-none">查看返回数据 (JSON)</summary><pre class="text-[10px] text-gray-400 mt-1 bg-slate-900/50 p-2 rounded max-h-48 overflow-auto">' + preview + '</pre></details>';
        }

        el.innerHTML = '<span class="text-lg shrink-0">' + icon + '</span>'
            + '<div class="flex-1">'
            + '<div class="text-sm ' + s.color + (step.type === 'tool_call' ? ' font-bold' : '') + '">' + step.message + '</div>'
            + extra + '</div>';

        sd.appendChild(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    clearExec: function () {
        var sd = document.getElementById('agent-steps');
        var rp = document.getElementById('agent-result-panel');
        var ep = document.getElementById('agent-execution-panel');
        if (sd) sd.innerHTML = '';
        if (rp) rp.style.display = 'none';
        if (ep) ep.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () { AgentWorkspaceUI.initWorkspace(); }, 500);
});
