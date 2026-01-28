// Auto-Flow Workflow Engine
// Handles Node Rendering, Connection Drawing, and AI Generation Mock

const FlowEngine = {
    nodes: [],
    connections: [],
    scale: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,

    init() {
        console.log("Auto-Flow Engine Initialized");
        this.canvas = document.getElementById('flow-canvas');
        this.ctx = document.getElementById('flow-connections'); // SVG layer

        // Mock Initial Data for Testing
        // this.renderMockData(); 
    },

    // AI Mock: Generate Workflow from Prompt
    async generateFromPrompt(prompt) {
        // Show Loading
        const canvas = document.getElementById('flow-canvas-container');
        canvas.innerHTML += `<div id="flow-loading" class="absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-900/80 backend-blur">
            <div class="text-4xl animate-bounce mb-4">⚡</div>
            <div class="text-blue-400 font-bold animate-pulse">Designing Workflow...</div>
        </div>`;

        return new Promise(resolve => {
            setTimeout(() => {
                // Remove Loading
                const loader = document.getElementById('flow-loading');
                if (loader) loader.remove();

                // Mock Response based on keywords
                let newNodes = [];
                let newConnections = [];

                if (prompt.includes('email') || prompt.includes('邮件')) {
                    newNodes = [
                        { id: 'n1', type: 'trigger', title: 'New Email Arrives', icon: '📧', x: 100, y: 200, status: 'idle', desc: 'Monitor Inbox: vip@client.com' },
                        { id: 'n2', type: 'action', title: 'Analyze Content', icon: '🧠', x: 400, y: 100, status: 'idle', desc: 'Extract key requirments' },
                        { id: 'n3', type: 'action', title: 'Check CRM', icon: '👥', x: 400, y: 300, status: 'idle', desc: 'Match sender with database' },
                        { id: 'n4', type: 'output', title: 'Draft Reply', icon: '✍️', x: 750, y: 200, status: 'idle', desc: 'Generate response draft' }
                    ];
                    newConnections = [
                        { from: 'n1', to: 'n2' },
                        { from: 'n1', to: 'n3' },
                        { from: 'n2', to: 'n4' },
                        { from: 'n3', to: 'n4' }
                    ];
                } else {
                    // Default / Social Media Example
                    newNodes = [
                        { id: 'n1', type: 'trigger', title: 'Topic Theme', icon: '💡', x: 50, y: 250, status: 'idle', desc: 'User Input: "Summer Sale"' },
                        { id: 'n2', type: 'action', title: 'Generate Social Media', icon: '✨', x: 350, y: 150, status: 'idle', desc: 'Create copy for Instagram' },
                        { id: 'n3', type: 'action', title: 'Generate Trend Report', icon: '📊', x: 350, y: 350, status: 'idle', desc: 'Analyze market trends' },
                        { id: 'n4', type: 'action', title: 'Extract Post Ideas', icon: '📝', x: 650, y: 150, status: 'idle', desc: 'List top 5 angles' },
                        { id: 'n5', type: 'output', title: 'Generate Images', icon: '🎨', x: 950, y: 150, status: 'idle', desc: 'Create visual assets' }
                    ];
                    newConnections = [
                        { from: 'n1', to: 'n2' },
                        { from: 'n1', to: 'n3' },
                        { from: 'n2', to: 'n4' },
                        { from: 'n4', to: 'n5' },
                        { from: 'n3', to: 'n5' }
                    ];
                }

                this.nodes = newNodes;
                this.connections = newConnections;
                this.render();
                resolve();
            }, 1500);
        });
    },

    render() {
        const container = document.getElementById('flow-nodes-layer');
        const svg = document.getElementById('flow-connections-layer');
        if (!container || !svg) return;

        container.innerHTML = '';
        svg.innerHTML = ''; // Clear lines

        // 1. Render Connections (SVG Bezier)
        this.connections.forEach(conn => {
            const fromNode = this.nodes.find(n => n.id === conn.from);
            const toNode = this.nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return;

            // Simple calculation for port positions (Right of From, Left of To)
            // Assuming Node Width ~250px, Height ~120px
            const startX = fromNode.x + 240;
            const startY = fromNode.y + 60;
            const endX = toNode.x;
            const endY = toNode.y + 60;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            // Bezier Curve
            const controlOffset = Math.abs(endX - startX) * 0.5;
            const d = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;

            path.setAttribute("d", d);
            path.setAttribute("stroke", "#64748b"); // Slate-500
            path.setAttribute("stroke-width", "2");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke-dasharray", "5,5"); // Dashed line style
            path.classList.add("flow-connection");

            svg.appendChild(path);
        });

        // 2. Render Nodes
        this.nodes.forEach(node => {
            const el = document.createElement('div');
            el.className = `absolute w-[240px] bg-[#1e293b] rounded-xl border border-gray-700 shadow-xl flex flex-col overflow-hidden hover:border-blue-500 transition-colors cursor-move group select-none`;
            // Color coding top bar
            let colorClass = 'bg-gray-500';
            if (node.type === 'trigger') colorClass = 'bg-yellow-400';
            if (node.type === 'action') colorClass = 'bg-blue-500';
            if (node.type === 'output') colorClass = 'bg-green-500';

            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;
            el.innerHTML = `
                <div class="h-1 w-full ${colorClass}"></div>
                <div class="p-4 flex-1 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">${node.icon}</span>
                        <span class="font-bold text-sm text-gray-200">${node.title}</span>
                        <div class="ml-auto w-2 h-2 rounded-full ${node.status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}"></div>
                    </div>
                    <p class="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">${node.desc}</p>
                    
                    <!-- Used In Tags -->
                    <div class="mt-auto pt-2 flex flex-wrap gap-1">
                        ${this.getUsedInTags(node)}
                    </div>
                </div>
                
                <!-- Ports -->
                ${node.type !== 'trigger' ? '<div class="absolute left-0 top-1/2 -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full border-2 border-[#0f172a]"></div>' : ''}
                ${node.type !== 'output' ? '<div class="absolute right-0 top-1/2 translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full border-2 border-[#0f172a]"></div>' : ''}
            `;

            // Interaction: Simple Drag (Mock)
            this.makeDraggable(el, node);

            container.appendChild(el);
        });
    },

    getUsedInTags(node) {
        // Mock checking upstream dependencies
        // Just return a generic tag for visual style
        if (node.type === 'trigger') return '';
        return `<span class="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-gray-300 font-mono">🔗 upstream_data</span>`;
    },

    makeDraggable(el, node) {
        let isDown = false;
        let startX, startY, initialLeft, initialTop;

        el.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = node.x;
            initialTop = node.y;
            el.style.zIndex = 100;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            node.x = initialLeft + dx;
            node.y = initialTop + dy;
            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;
            this.render(); // Re-render lines
        });

        window.addEventListener('mouseup', () => {
            isDown = false;
            el.style.zIndex = '';
        });
    },

    // Simulation Runner
    async runSimulation() {
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];

            // Highlight Node
            node.status = 'running';
            this.render();

            // Highlight connections leaving this node
            const outgoing = this.connections.filter(c => c.from === node.id);
            // In a real app we would animate svg strokedashoffset

            await new Promise(r => setTimeout(r, 800)); // Wait

            // Finish Node
            node.status = 'done';
            this.render();
        }
    }
};

// Global Access
window.FlowEngine = FlowEngine;
