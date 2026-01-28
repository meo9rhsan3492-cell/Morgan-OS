import os

# Content Blocks

# 1. Base App Logic (from app_fixed.js which seems stable, OR better, let's construct it from known parts)
# Actually, I should use the FILE content if possible.
# But I can't easily read `app_fixed.js` in this script without running it.
# So I will read `app_fixed.js`, then append the new modules.

AUTH_MODULE = r'''
// ==========================================
// Phase 17: Multi-User Permission System (Fixed)
// ==========================================

// ⚠️ PLACEHOLDERS - Replace with actual values from user
const SUPABASE_URL = 'https://ftcaijvfvypcwjgetkvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Y2FpanZmdnlwY3dqZ2V0a3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzM0MDYsImV4cCI6MjA4MDE0OTQwNn0.TQ-ayMDAVizgCxEly_ahflzZYXnBYhQ1sBjQnZ636gQ';

let supabase = null;
let currentUser = null;
let userRole = null;
let allowedModules = [];

// Initialize Auth
async function initAuth() {
    // Check if Supabase SDK is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase SDK not loaded');
        // Fallback: Try to load it dynamically or show error
        if (typeof showToast === 'function') showToast('System Error: Auth SDK failed to load', 'error');
        return;
    }

    try {
        // Initialize Client
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Check session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Session check error:', error);
            showAuthModal(); // Default to login on error
        } else if (session) {
            await handleSessionSuccess(session);
        } else {
            showAuthModal();
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                showAuthModal();
                currentUser = null;
                updateUserDisplay(null);
            } else if (event === 'SIGNED_IN' && session) {
                // Avoid double-handling if already handled by getSession
                if (!currentUser || currentUser.id !== session.user.id) {
                    handleSessionSuccess(session);
                }
            }
        });

    } catch (e) {
        console.error('Supabase init critical error:', e);
        showAuthModal(); // Fallback to show modal so app isn't dead
    }
}

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('hidden');
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
}

async function handleSessionSuccess(session) {
    currentUser = session.user;
    hideAuthModal();
    // Load Profile
    await loadUserProfile(currentUser.id);
    if (typeof showToast === 'function') showToast('欢迎回来, ' + (userRole || 'User'), 'success');
}

async function loadUserProfile(uid) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role, display_name')
            .eq('id', uid)
            .single();
            
        if (data) {
            userRole = data.role;
            updateUserDisplay(data);
            applyPermissions();
        }
    } catch (e) {
        console.error('Profile load error', e);
    }
}

function updateUserDisplay(profile) {
    const el = document.getElementById('user-info-display');
    if (!el) return;
    if (profile) {
        el.innerHTML = `
            <div class="text-xs text-gray-400">Current User</div>
            <div class="font-bold text-blue-400">${profile.display_name || 'User'}</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider">${userRole || 'Guest'}</div>
        `;
    } else {
        el.innerHTML = '';
    }
}

function applyPermissions() {
    // 1. Define Role Matrix
    const matrix = {
        'admin': ['all'],
        'manager': ['dashboard', 'crm', 'rfq', 'email', 'analytics'],
        'sales': ['dashboard', 'crm', 'rfq', 'email']
    };
    
    const role = userRole || 'sales'; // Default to sales
    const allowed = matrix[role] || ['dashboard'];
    
    // 2. Hide/Show Nav Items
    document.querySelectorAll('.nav-item').forEach(btn => {
        const moduleId = btn.id.replace('nav-', '');
        // Exceptions
        if (moduleId === 'settings' || moduleId === 'logout') return; 
        
        if (allowed.includes('all') || allowed.includes(moduleId)) {
            btn.classList.remove('hidden');
        } else {
            // btn.classList.add('hidden'); // Optional: Hide or disable
        }
    });
}

// Ensure initAuth is called
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAuth, 500); // Small delay to ensure SDK load
});
'''

NAV_MODULE = r'''
// ==========================================
// 10. Navigation & UI Utilities (Restored)
// ==========================================

// Global Navigation Function
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);
    // 1. Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // 2. Show target tab
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    } else {
        console.error('Target tab not found:', tabId);
    }
    
    // 3. Update nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + tabId);
    if (navBtn) navBtn.classList.add('active');

    // 4. Trigger specific module logic
    // Add safety checks
    if (tabId === 'exhibition' && typeof renderExpos === 'function') renderExpos();
    if (tabId === 'dashboard' && typeof updateDashboard === 'function') updateDashboard();
    if (tabId === 'email-templates' && typeof renderTemplateList === 'function') renderTemplateList();
}

// Global Theme Toggle
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-mode');
    if (isLight) {
        body.classList.remove('light-mode');
        const icon = document.getElementById('theme-icon');
        if(icon) icon.innerText = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        const icon = document.getElementById('theme-icon');
        if(icon) icon.innerText = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// Global ShowTab Alias
window.showTab = switchTab;
'''

def rebuild_app():
    base_file = 'app_fixed.js'
    target_file = 'app.js'
    
    print(f"Reading base: {base_file}")
    with open(base_file, 'r', encoding='utf-8') as f:
        base_content = f.read()
        
    final_content = base_content + "\n\n" + AUTH_MODULE + "\n\n" + NAV_MODULE
    
    print(f"Writing target: {target_file}")
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print("Success! app.js rebuilt with UTF-8 encoding.")

if __name__ == '__main__':
    rebuild_app()
