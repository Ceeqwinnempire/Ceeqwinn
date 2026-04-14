// Core functionality
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const ambientToggle = document.querySelector('.ambient-toggle');
    const readingColumn = document.querySelector('.reading-column');
    const crystalBar = document.querySelector('.crystal-bar');
    const hallPanel = document.querySelector('.hall-panel');
    const closeHall = document.querySelector('.close-hall');
    const dockItems = document.querySelectorAll('.dock-item');
    
    // State
    let currentMode = 'calm';
    let scrollTimeout;
    let lastScrollPosition = 0;
    
    // Ambient Mode Toggle
    ambientToggle.addEventListener('click', () => {
        currentMode = (currentMode === 'calm') ? 'dramatic' : 
                     (currentMode === 'dramatic') ? 'night' : 'calm';
        updateAmbientMode();
        localStorage.setItem('ambientMode', currentMode);
    });
    
    function updateAmbientMode() {
        const sky = document.querySelector('.sky-gradient');
        const particles = document.querySelector('.particle-layer');
        const chandelier = document.querySelector('.chandelier');
        
        switch(currentMode) {
            case 'calm':
                sky.style.background = 'var(--sky-gradient)';
                particles.style.opacity = '0.2';
                chandelier.style.opacity = '0.6';
                break;
            case 'dramatic':
                sky.style.background = 'var(--dramatic-gradient)';
                particles.style.opacity = '0.4';
                chandelier.style.opacity = '0.8';
                break;
            case 'night':
                sky.style.background = 'var(--night-gradient)';
                particles.style.opacity = '0.1';
                chandelier.style.opacity = '0.4';
                break;
        }
    }
    
    // Scroll Indicator
    readingColumn.addEventListener('scroll', () => {
        const scrollPercent = readingColumn.scrollTop / 
                             (readingColumn.scrollHeight - readingColumn.clientHeight);
        crystalBar.style.transform = `scaleY(${scrollPercent})`;
        
        // Stillness detection
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.querySelector('.particle-layer').style.opacity = '0.1';
            crystalBar.style.opacity = '0.5';
        }, 10000);
        
        // Restore when scrolling
        document.querySelector('.particle-layer').style.opacity = '0.3';
        crystalBar.style.opacity = '1';
    });
    
    // Hall Panel
    document.querySelector('[data-action="hall"]').addEventListener('click', () => {
        hallPanel.classList.add('active');
    });
    
    closeHall.addEventListener('click', () => {
        hallPanel.classList.remove('active');
    });
    
    // Dock Interactions
    dockItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.target.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.target.style.transform = 'scale(1)';
            }, 200);
            
            // Handle actions
            const action = e.target.dataset.action;
            switch(action) {
                case 'home':
                    // Navigate home
                    break;
                case 'back':
                    // Go back
                    break;
                case 'settings':
                    // Open settings
                    break;
                case 'install':
                    // Trigger PWA install
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                    }
                    break;
                case 'hall':
                    // Already handled
                    break;
            }
        });
    });
    
    // Reading Flow Memory
    function saveReadingPosition() {
        localStorage.setItem('scrollPosition', readingColumn.scrollTop);
        localStorage.setItem('ambientMode', currentMode);
    }
    
    function restoreReadingPosition() {
        const savedPosition = localStorage.getItem('scrollPosition');
        const savedMode = localStorage.getItem('ambientMode');
        
        if (savedPosition) {
            readingColumn.scrollTop = savedPosition;
            crystalBar.style.transform = `scaleY(${savedPosition / 
                (readingColumn.scrollHeight - readingColumn.clientHeight)})`;
        }
        
        if (savedMode) {
            currentMode = savedMode;
            updateAmbientMode();
        }
        
        // Fade in effect
        readingColumn.style.opacity = '0';
        readingColumn.style.transition = 'opacity 500ms ease-in-out';
        setTimeout(() => {
            readingColumn.style.opacity = '1';
        }, 100);
    }
    
    // PWA Installation
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });
    
    // Initialize
    restoreReadingPosition();
    updateAmbientMode();
});
