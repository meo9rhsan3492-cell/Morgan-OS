
// ==========================================
// 10. Navigation & UI Utilities (Restored)
// ==========================================

// Global Navigation Function
function switchTab(tabId) {
    // 1. Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // 2. Show target tab
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');

    // 3. Update nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + tabId);
    if (navBtn) navBtn.classList.add('active');

    // 4. Trigger specific module logic
    if (tabId === 'exhibition') renderExpos();
    if (tabId === 'dashboard') updateDashboard();
    if (tabId === 'email-templates') renderTemplateList();
    if (tabId === 'rfq-decoder') {
        // Auto focus or init if needed
    }
}

// Global Theme Toggle
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-mode');
    if (isLight) {
        body.classList.remove('light-mode');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.innerText = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.innerText = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// Global ShowTab Alias for Legacy Inline Scripts
window.showTab = switchTab;
