// ----------------------------------------
// 13. Exhibition Standby Mode (v18.2)
// ----------------------------------------
let standbyTimer = null;

function toggleStandbyMode(active) {
    const overlay = document.getElementById('standby-overlay');

    if (active) {
        overlay.classList.remove('hidden');
        // Small delay to allow transition
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);

        updateStandbyClock();
        standbyTimer = setInterval(updateStandbyClock, 1000); // Live clock

        // Go full screen if possible
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen denied:', err));
        }
    } else {
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 1000); // Match duration-1000

        clearInterval(standbyTimer);

        // Exit full screen
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.log('Exit fullscreen err:', err));
        }
    }
}

function updateStandbyClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const clockEl = document.getElementById('standby-clock');
    if (clockEl) clockEl.innerText = timeStr;
}
