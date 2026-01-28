// ==========================================
// 10. Global Market Radar (Logic)
// ==========================================
function renderRadar() {
    const zones = [
        { id: 'ny', offset: -5, name: 'North America' }, // EST
        { id: 'ldn', offset: 0, name: 'Europe' },       // GMT
        { id: 'dxb', offset: 4, name: 'Middle East' },  // GST
        { id: 'bj', offset: 8, name: 'APAC' }           // CST
    ];

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);

    zones.forEach(z => {
        const t = new Date(utc + (3600000 * z.offset));
        const hour = t.getHours();
        const minute = t.getMinutes();

        // 1. Time String (Format: 14:30)
        const timeStr = t.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const elTime = document.getElementById(`time-${z.id}`);
        if (elTime) elTime.innerText = timeStr;

        // 2. AM/PM Indicator
        const elAmPm = document.getElementById(`ampm-${z.id}`);
        if (elAmPm) elAmPm.innerText = hour >= 12 ? 'PM' : 'AM';

        // 3. Status Logic & UI Feedback
        const elAction = document.getElementById(`action-${z.id}`);
        const elDot = document.getElementById(`status-dot-${z.id}`);
        const elProgress = document.getElementById(`progress-${z.id}`);

        // Progress Bar (00:00 = 0%, 24:00 = 100%)
        if (elProgress) {
            const dayPct = ((hour * 60 + minute) / 1440) * 100;
            elProgress.style.width = `${dayPct}%`;
        }

        // Business Hours Logic (9:00 - 18:00)
        const isBiz = hour >= 9 && hour < 18;

        if (isBiz) {
            if (elAction) {
                elAction.innerText = 'OPEN FOR BIZ';
                elAction.className = 'text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-green-500/20 text-green-400 inline-block border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse';
            }
            if (elDot) elDot.className = 'w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse';
            if (elProgress) elProgress.className = 'h-full bg-green-500 transition-all duration-1000 shadow-[0_0_10px_#22c55e]';
        } else {
            let statusText = 'CLOSED';
            if (hour >= 18 && hour < 22) statusText = 'EVENING';
            if (hour >= 22 || hour < 6) statusText = 'SLEEPING'; // Late night

            if (elAction) {
                elAction.innerText = statusText;
                elAction.className = 'text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-slate-700/50 text-slate-400 inline-block border border-slate-600/30';
            }
            if (elDot) elDot.className = 'w-2 h-2 rounded-full bg-slate-600';
            if (elProgress) elProgress.className = 'h-full bg-slate-600 transition-all duration-1000';
        }
    });

    // Update UTC Display in Header
    const utcTime = new Date(utc).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const elUtc = document.getElementById('radar-utc');
    if (elUtc) elUtc.innerText = `UTC ${utcTime}`;
}
