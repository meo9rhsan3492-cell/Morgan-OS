
// ==========================================
// Morgan RAG System (Smart Context / MoE-Style Retrieval)
// ==========================================

// Global Knowledge State
window.ragState = {
    chunks: [],      // { id, text, source, tokens }
    isIngesting: false,
    totalTokens: 0
};

// 1. Ingest & Chunking Logic
// ------------------------------------------
async function submitPasteContent() {
    const textarea = document.getElementById('paste-content');
    const text = textarea.value.trim();
    if (!text) {
        showToast('内容不能为空', 'error');
        return;
    }

    // Process as a manual file
    const newChunks = smartChunking(text, "User_Pasted_Content");
    window.ragState.chunks.push(...newChunks);

    updateRAGStats();
    showToast(`成功吸收 ${newChunks.length} 个文本片段`, 'success');
    if (window.renderNetwork) window.renderNetwork(window.ragState.chunks.length);

    // Close Modal
    textarea.value = '';
    document.getElementById('paste-modal').classList.add('hidden');
}

async function ingestKnowledge(input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    const overlay = document.getElementById('kb-ingesting');
    if (overlay) overlay.classList.remove('hidden');

    try {
        for (let file of files) {
            const text = await readFileAsText(file);
            const newChunks = smartChunking(text, file.name);
            window.ragState.chunks.push(...newChunks);
        }

        updateRAGStats();
        showToast(`成功吸收 ${files.length} 个文件`, 'success');

        // Render Visual Graph
        if (window.renderNetwork) window.renderNetwork(window.ragState.chunks.length);

    } catch (e) {
        console.error("Ingest Error:", e);
        showToast('读取文件失败: ' + e.message, 'error');
    } finally {
        if (overlay) overlay.classList.add('hidden');
        input.value = ''; // Reset
    }
}

function readFileAsText(file) {
    return new Promise(async (resolve, reject) => {
        // PDF Handling (Added for NotebookLM Experience)
        if (file.type === 'application/pdf') {
            try {
                // Ensure PDF.js is loaded
                if (typeof pdfjsLib === 'undefined') {
                    throw new Error('PDF.js library not loaded.');
                }

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let fullText = '';

                // Show Progress
                const overlay = document.getElementById('kb-ingesting');
                const loadingText = overlay ? overlay.querySelector('.font-mono') : null;

                for (let i = 1; i <= pdf.numPages; i++) {
                    if (loadingText) loadingText.innerText = `Parsing PDF Page ${i}/${pdf.numPages}...`;
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += `\n[Page ${i}]\n` + pageText;
                }
                resolve(fullText);
            } catch (e) {
                console.error("PDF Parse Error:", e);
                reject(e);
            }
            return;
        }

        // Text/Markdown/CSV Handling
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

function smartChunking(text, sourceName) {
    // Strategy: Split by double newlines (paragraphs) to keep context intact
    // MoE Analogy: These are the "Experts" (specialized knowledge blocks)
    const rawSegments = text.split(/\n\s*\n/);
    const chunks = [];

    rawSegments.forEach((seg, index) => {
        const clean = seg.trim();
        if (clean.length > 20) { // Ignore noise
            chunks.push({
                id: `${sourceName}_${index}`,
                text: clean,
                source: sourceName,
                // Rough token est (1 token ~= 1.5 Chinese chars or 4 English chars)
                tokens: Math.ceil(clean.length / 1.5)
            });
        }
    });
    return chunks;
}

function updateRAGStats() {
    const count = window.ragState.chunks.length;
    const countEl = document.getElementById('kb-count');
    if (countEl) countEl.innerText = count;

    // Update list
    const listEl = document.getElementById('kb-file-list');
    if (listEl) {
        listEl.innerHTML = window.ragState.chunks.length > 0
            ? window.ragState.chunks.map(c => `<div class="truncate" title="${c.text.substring(0, 100)}">📄 [${c.source}] ID:${c.id}</div>`).slice(-10).join('')
            : '<div class="italic text-center py-4">暂无知识库文件</div>';
    }
}

function clearKnowledge() {
    window.ragState.chunks = [];
    updateRAGStats();
    showToast('知识库已清空', 'info');
    if (window.renderNetwork) window.renderNetwork(0);
}

// 2. Retrieval Logic (The "Router/Gatekeeper")
// ------------------------------------------
function retrieveRelevantContext(query) {
    // TF-IDF simplified algorithm
    // We score each chunk based on keyword overlap with the query

    const queryTerms = query.toLowerCase().split(/\s+|[,.，。]/).filter(t => t.length > 1);

    if (window.ragState.chunks.length === 0) return null;

    const scoredChunks = window.ragState.chunks.map(chunk => {
        let score = 0;
        const textLower = chunk.text.toLowerCase();

        queryTerms.forEach(term => {
            if (textLower.includes(term)) {
                // Boost score for exact matches
                // Boost score more if the term is rare? (Skipping for simplicity)
                score += 10;
                // Add density bonus
                const count = (textLower.match(new RegExp(term, 'g')) || []).length;
                score += count * 2;
            }
        });

        return { ...chunk, score };
    });

    // Top-K selection (MoE: Activating top experts)
    // We take top 5 chunks
    const topK = scoredChunks
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return topK;
}

// 3. User Interaction
// ------------------------------------------
async function askKnowledgeBase() {
    const inputEl = document.getElementById('kb-query');
    const query = inputEl.value.trim();
    if (!query) return;

    // UI Updates
    const historyEl = document.getElementById('kb-chat-history');
    historyEl.innerHTML += `
        <div class="flex gap-4 flex-row-reverse">
            <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">You</div>
            <div class="bg-blue-900/50 p-3 rounded-lg rounded-tr-none text-sm text-white border border-blue-500/30">${query}</div>
        </div>
    `;
    inputEl.value = '';

    // Show "Thinking" status
    const workingEl = document.getElementById('kb-ai-working');
    if (workingEl) workingEl.classList.remove('hidden');

    try {
        // [Stage 1] Retrieval (Routing)
        const relevantChunks = retrieveRelevantContext(query);
        let contextText = '';

        const inspector = document.getElementById('kb-context-inspector');

        if (!relevantChunks || relevantChunks.length === 0) {
            // No context found? Fallback or General Chat
            // Or if KB is empty
            contextText = "No specific knowledge base context. Answer based on general knowledge.";
            if (inspector) inspector.classList.add('hidden');
        } else {
            contextText = relevantChunks.map(c => `[Source: ${c.source}]\n${c.text}`).join('\n\n');

            // Show Context Inspector
            const inspectorContent = document.getElementById('kb-context-content');
            if (inspectorContent) {
                inspectorContent.innerHTML = relevantChunks.map(c =>
                    `<div class="p-2 bg-black/30 rounded border-l-2 border-blue-500 truncate text-[10px]">${c.text.substring(0, 100)}...</div>`
                ).join('');
            }
            if (inspector) inspector.classList.remove('hidden');
        }

        const prompt = `
        Role: Corporate Knowledge Expert.
        
        [STRICT CONTEXT FROM DATABASE]
        ${contextText}
        [END CONTEXT]

        User Question: "${query}"

        Instructions:
        1. Answer the question using ONLY the provided context above. 
        2. If the context contains the answer, be precise and cite the source file if possible.
        3. If the context does NOT contain the answer, explicitly state: "知识库中未找到相关信息 (Not found in knowledge base)." Do not make up facts.
        4. Keep the tone professional and helpful.
        `;

        // [Stage 2] Generation
        const response = await callGeminiAPI(prompt);

        if (response) {
            historyEl.innerHTML += `
                <div class="flex gap-4">
                    <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs">AI</div>
                    <div class="bg-gray-800 p-3 rounded-lg rounded-tl-none text-sm text-gray-300 border border-gray-700">
                        ${marked.parse(response)} 
                    </div>
                </div>
            `;
        }

    } catch (e) {
        showToast('AI 响应异常', 'error');
        console.error(e);
    } finally {
        if (workingEl) workingEl.classList.add('hidden');
        historyEl.scrollTo(0, historyEl.scrollHeight);
    }
}

// Add Mock 'marked' if not present (simple text formatter)
if (typeof marked === 'undefined') {
    window.marked = {
        parse: (text) => text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    };
}

// 4. Visualization (Neural Network Graph)
// ------------------------------------------
const canvas = document.getElementById('rag-graph');
const ctx = canvas ? canvas.getContext('2d') : null;
let nodes = [];

function initGraph() {
    if (!ctx) return;
    resizeGraph();
    window.addEventListener('resize', resizeGraph);
    animateGraph();
}

function resizeGraph() {
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

window.renderNetwork = function (count) {
    if (!ctx) return;
    // Create nodes based on chunk count (capped at 50 for performance)
    const nodeCount = Math.min(count, 50);
    nodes = [];

    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }
}

function animateGraph() {
    if (!ctx) return;
    requestAnimationFrame(animateGraph);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';

    // Update and Draw Nodes
    nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Connections
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }
}

// Initialize on load
if (canvas) {
    initGraph();
    // Start with a few idle nodes
    window.renderNetwork(5);
}