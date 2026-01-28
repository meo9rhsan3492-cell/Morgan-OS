# 生成 TDS Marketing OS v18.1 - 包含智能知识库
# 此脚本读取 v2 文件并整合知识库功能

import re

# 读取v2文件
with open('index_v2.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 更新版本号
content = content.replace('v18.0 数据联动版', 'v18.1 智能知识库版')

# 2. 替换产品知识库HTML部分（194-211行区域）
old_product_db = r'<!-- Product DB -->.*?</div>\s*</div>\s*</div>'
new_product_db = '''<!-- Product DB - Smart Knowledge Base -->
            <div id="product-db" class="tab-content">
                <h2 class="text-3xl font-black mb-2" style="color: var(--text-primary);">产品知识库 🧠</h2>
                <p class="text-sm mb-6" style="color: var(--text-secondary);">智能文档系统 · 上传学习检索</p>
                
                <!-- 主功能区 -->
                <div class="grid grid-cols-12 gap-6 mb-6">
                    <!-- 文件上传 -->
                    <div class="col-span-4">
                        <div class="panel">
                            <h3 class="text-lg font-bold mb-4" style="color: var(--text-primary);">📎 上传文档</h3>
                            <div id="drop-zone" class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-500 hover:bg-opacity-5" 
                                 style="border-color: var(--border-primary);" 
                                 onclick="document.getElementById('file-upload').click()">
                                <div class="text-5xl mb-3">📂</div>
                                <p class="font-bold mb-2" style="color: var(--text-primary);">拖拽或点击上传</p>
                                <p class="text-xs" style="color: var(--text-secondary);">支持: TXT, MD, JSON</p>
                            </div>
                            <input type="file" id="file-upload" class="hidden" accept=".txt,.md,.json" onchange="handleKnowledgeFileUpload(event)" multiple>
                            
                            <!-- 统计 -->
                            <div class="mt-4 p-4 rounded" style="background: var(--bg-secondary); border: 1px solid var(--border-primary);">
                                <div class="text-xs font-bold mb-3 text-blue-400 uppercase">知识库统计</div>
                                <div class="grid grid-cols-2 gap-3 text-sm">
                                    <div class="text-center p-2 rounded" style="background: var(--bg-panel);">
                                        <div class="text-2xl font-black text-blue-400" id="doc-count">0</div>
                                        <div class="text-xs mt-1" style="color: var(--text-secondary);">文档</div>
                                    </div>
                                    <div class="text-center p-2 rounded" style="background: var(--bg-panel);">
                                        <div class="text-2xl font-black text-green-400" id="total-chars">0</div>
                                        <div class="text-xs mt-1" style="color: var(--text-secondary);">字符</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            
                    <!-- 智能检索 -->
                    <div class="col-span-4">
                        <div class="panel">
                            <h3 class="text-lg font-bold mb-4" style="color: var(--text-primary);">🔍 智能检索</h3>
                            <input type="text" id="search-input" placeholder="搜索关键词..." class="input-box mb-4" oninput="searchKnowledge(this.value)">
                            <div id="search-results" style="max-height: 350px; overflow-y: auto;">
                                <div class="text-center py-16 text-sm" style="color: var(--text-secondary);">
                                    <div class="text-4xl mb-2">🔎</div>
                                    输入关键词开始搜索
                                </div>
                            </div>
                        </div>
                    </div>
            
                    <!-- 文档库 -->
                    <div class="col-span-4">
                        <div class="panel">
                            <h3 class="text-lg font-bold mb-4" style="color: var(--text-primary);">📚 文档库</h3>
                            <div id="knowledge-docs" style="max-height: 350px; overflow-y: auto;">
                                <div class="text-center py-16 text-sm" style="color: var(--text-secondary);">
                                    <div class="text-4xl mb-2">📄</div>
                                    暂无文档
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                <!-- 快速录入产品（保留原功能） -->
                <div class="panel">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold" style="color: var(--text-primary);">📋 快速录入产品</h3>
                        <button onclick="toggleProductForm()" class="text-sm px-3 py-1 rounded hover:bg-blue-500 hover:bg-opacity-20 transition" style="color: var(--text-secondary);">
                            <span id="form-toggle-icon">▼</span> 展开/折叠
                        </button>
                    </div>
                    <div id="product-form-container" class="hidden">
                        <div class="grid grid-cols-12 gap-4 mb-4">
                            <input type="text" id="db-name" placeholder="产品型号" class="input-box col-span-3">
                            <input type="text" id="db-pain" placeholder="核心痛点" class="input-box col-span-3">
                            <input type="text" id="db-feat" placeholder="详细参数" class="input-box col-span-4">
                            <button onclick="saveProduct()" class="btn-primary col-span-2">💾 存入</button>
                        </div>
                    </div>
                    <div id="product-list" class="grid grid-cols-3 gap-4 min-h-[100px]">
                        <div class="col-span-3 text-center py-10 text-sm" style="color: var(--text-secondary);">暂无产品数据</div>
                    </div>
                </div>
            </div>'''

content = re.sub(old_product_db, new_product_db, content, flags=re.DOTALL)

# 3. 添加知识库变量声明
content = content.replace(
    "let expos = JSON.parse(localStorage.getItem('tds_expos') || '[]');",
    "let expos = JSON.parse(localStorage.getItem('tds_expos') || '[]');\n        let knowledgeBase = JSON.parse(localStorage.getItem('tds_knowledge_base') || '[]');"
)

# 4. 更新renderDB函数以适应新布局
old_renderdb = r"list\.innerHTML = '\<div class=\"col-span-2 text-center py-20\".*?暂无数据\</div\>';"
new_renderdb = "list.innerHTML = '<div class=\"col-span-3 text-center py-10 text-sm\" style=\"color: var(--text-secondary);\">暂无产品数据</div>';"
content = re.sub(old_renderdb, new_renderdb, content)

# 5. 在window.onload之前添加知识库JavaScript代码
knowledge_js = '''
        // 知识库功能
        function handleKnowledgeFileUpload(event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;
        
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    const doc = {
                        id: Date.now() + Math.random(),
                        filename: file.name,
                        type: file.name.split('.').pop().toLowerCase(),
                        uploadDate: new Date().toISOString().split('T')[0],
                        content: content,
                        size: content.length
                    };
                    knowledgeBase.push(doc);
                    localStorage.setItem('tds_knowledge_base', JSON.stringify(knowledgeBase));
                    renderKnowledgeDocs();
                    updateKnowledgeStats();
                };
                reader.readAsText(file);
            });
        }
        
        function renderKnowledgeDocs() {
            const container = document.getElementById('knowledge-docs');
            if (knowledgeBase.length === 0) {
                container.innerHTML = '<div class="text-center py-16 text-sm" style="color: var(--text-secondary);"><div class="text-4xl mb-2">📄</div>暂无文档</div>';
                return;
            }
        
            container.innerHTML = knowledgeBase.map((doc, i) => `
                <div class="mb-3 p-3 rounded border hover:border-blue-500 transition" style="background: var(--bg-secondary); border-color: var(--border-primary);">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <div class="font-bold text-sm truncate" style="color: var(--text-primary);" title="${doc.filename}">${doc.filename}</div>
                            <div class="text-xs mt-1" style="color: var(--text-secondary);">${doc.uploadDate} · ${(doc.size / 1024).toFixed(1)}KB</div>
                        </div>
                        <button onclick="viewDocument(${i})" class="ml-2 text-blue-400 hover:text-blue-300 text-xs">查看</button>
                        <button onclick="deleteDocument(${i})" class="ml-2 text-red-400 hover:text-red-300 text-xs">删除</button>
                    </div>
                    <div class="text-xs truncate" style="color: var(--text-secondary);">${doc.content.substring(0, 60)}...</div>
                </div>
            `).join('');
        }
        
        function searchKnowledge(query) {
            const resultsContainer = document.getElementById('search-results');
            
            if (!query || query.trim() === '') {
                resultsContainer.innerHTML = '<div class="text-center py-16 text-sm" style="color: var(--text-secondary);"><div class="text-4xl mb-2">🔎</div>输入关键词开始搜索</div>';
                return;
            }
        
            const results = knowledgeBase.filter(doc => {
                const searchText = (doc.filename + ' ' + doc.content).toLowerCase();
                return searchText.includes(query.toLowerCase());
            });
        
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="text-center py-10 text-sm" style="color: var(--text-secondary);">未找到相关内容</div>';
                return;
            }
        
            resultsContainer.innerHTML = results.map((doc) => {
                const snippet = extractSnippet(doc.content, query);
                const index = knowledgeBase.findIndex(d => d.id === doc.id);
                return `
                    <div class="mb-3 p-3 rounded border hover:border-blue-500 transition cursor-pointer" 
                         style="background: var(--bg-secondary); border-color: var(--border-primary);"
                         onclick="viewDocument(${index})">
                        <div class="font-bold text-sm mb-1" style="color: var(--text-primary);">📄 ${doc.filename}</div>
                        <div class="text-xs" style="color: var(--text-secondary);">${highlightText(snippet, query)}</div>
                    </div>
                `;
            }).join('');
        }
        
        function extractSnippet(content, query) {
            const index = content.toLowerCase().indexOf(query.toLowerCase());
            if (index === -1) return content.substring(0, 100) + '...';
            
            const start = Math.max(0, index - 40);
            const end = Math.min(content.length, index + query.length + 60);
            let snippet = content.substring(start, end);
            
            if (start > 0) snippet = '...' + snippet;
            if (end < content.length) snippet = snippet + '...';
            
            return snippet;
        }
        
        function highlightText(text, query) {
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span class="bg-yellow-400 text-black px-1 rounded">$1</span>');
        }
        
        function viewDocument(index) {
            const doc = knowledgeBase[index];
            const modal = `
                <div class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.7);" onclick="this.remove()">
                    <div class="panel max-w-4xl w-full m-8 max-h-[80vh] overflow-auto" onclick="event.stopPropagation()">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-bold" style="color: var(--text-primary);">${doc.filename}</h3>
                                <p class="text-xs mt-1" style="color: var(--text-secondary);">${doc.uploadDate} · ${(doc.size / 1024).toFixed(1)}KB</p>
                            </div>
                            <button onclick="this.closest('.fixed').remove()" class="text-2xl hover:text-red-400" style="color: var(--text-secondary);">×</button>
                        </div>
                        <div class="p-4 rounded font-mono text-sm whitespace-pre-wrap" style="background: var(--bg-secondary); color: var(--text-secondary); max-height: 60vh; overflow-auto;">${doc.content}</div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modal);
        }
        
        function deleteDocument(index) {
            if (confirm('确定删除这个文档吗？')) {
                knowledgeBase.splice(index, 1);
                localStorage.setItem('tds_knowledge_base', JSON.stringify(knowledgeBase));
                renderKnowledgeDocs();
                updateKnowledgeStats();
            }
        }
        
        function updateKnowledgeStats() {
            document.getElementById('doc-count').innerText = knowledgeBase.length;
            const totalChars = knowledgeBase.reduce((sum, doc) => sum + doc.size, 0);
            document.getElementById('total-chars').innerText = totalChars.toLocaleString();
        }
        
        function toggleProductForm() {
            const form = document.getElementById('product-form-container');
            form.classList.toggle('hidden');
        }

'''

content = content.replace('        window.onload = function () {', knowledge_js + '        window.onload = function () {')

# 6. 更新window.onload以包含知识库初始化
old_onload = '''window.onload = function () {
            loadTheme();
            renderDB();
            renderKeywords();
            renderExpos();
            const total = localStorage.getItem('tds_total') || 266664;
            const spent = localStorage.getItem('tds_spent') || 79600;
            document.getElementById('total-budget').value = total;
            document.getElementById('spent-amount').value = spent;
            updateDashboard();
        }'''

new_onload = '''window.onload = function () {
            loadTheme();
            renderDB();
            renderKeywords();
            renderExpos();
            renderKnowledgeDocs();
            updateKnowledgeStats();
            const total = localStorage.getItem('tds_total') || 266664;
            const spent = localStorage.getItem('tds_spent') || 79600;
            document.getElementById('total-budget').value = total;
            document.getElementById('spent-amount').value = spent;
            updateDashboard();
        }'''

content = content.replace(old_onload, new_onload)

# 写入新文件
with open('index_v18.1_final.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ v18.1 文件生成成功！")
print("文件: index_v18.1_final.html")
