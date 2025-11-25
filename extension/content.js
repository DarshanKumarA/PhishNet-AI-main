let tooltip = null;
let hoverTimeout = null;
let currentLink = null;

function findUrlInElement(el) {
    if (!el) return null;

    // 1. Check Raw Attribute FIRST (This avoids the browser adding slashes)
    let rawHref = el.getAttribute('href');
    if (rawHref && rawHref.startsWith('http')) return rawHref;

    // 2. Fallback to standard property
    if (el.href && el.href.startsWith('http')) return el.href;
    }

// Create the Tooltip Element
function createTooltip() {
    const div = document.createElement('div');
    div.id = 'phishnet-hover-tooltip';
    div.style.position = 'absolute';
    div.style.zIndex = '2147483647'; // Max Z-Index
    div.style.padding = '8px 12px';
    div.style.borderRadius = '6px';
    div.style.fontFamily = 'Segoe UI, sans-serif';
    div.style.fontSize = '13px';
    div.style.fontWeight = '600';
    div.style.whiteSpace = 'nowrap'; // Prevent text wrapping
    div.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'; // Stronger shadow
    div.style.pointerEvents = 'none'; 
    div.style.display = 'none';
    div.style.transition = 'opacity 0.2s';
    document.body.appendChild(div);
    return div;
}

tooltip = createTooltip();

// Function to Scan
async function scanLink(url, x, y) {
    // Show Loading State
    tooltip.style.display = 'block';
    
    // CHANGE: Position ABOVE the cursor (y - 50px)
    tooltip.style.top = (y - 50) + 'px'; 
    tooltip.style.left = (x + 10) + 'px';
    
    tooltip.style.background = '#1e293b'; 
    tooltip.style.color = '#94a3b8'; 
    tooltip.style.border = '1px solid #334155';
    tooltip.innerHTML = `<span>⏳ Scanning...</span>`;

    try {
        const response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        const data = await response.json();

        // Update Tooltip with Result
        if (data.is_safe) {
            tooltip.style.background = 'rgba(16, 185, 129, 0.95)'; // Green
            tooltip.style.color = '#fff';
            tooltip.style.border = '1px solid #059669';
            tooltip.innerHTML = `<span>✅ Safe to Visit</span>`;
        } else {
            tooltip.style.background = 'rgba(239, 68, 68, 0.95)'; // Red
            tooltip.style.color = '#fff';
            tooltip.style.border = '1px solid #dc2626';
            tooltip.innerHTML = `<span>⚠️ PHISHING DETECTED</span>`;
        }

    } catch (err) {
        tooltip.innerHTML = `<span>🔌 Connection Error</span>`;
    }
}

// Event Listeners
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a');
    
    if (target && target.href) {
        const url = target.href;
        if (!url.startsWith('http')) return;

        currentLink = url;

        hoverTimeout = setTimeout(() => {
            scanLink(url, e.pageX, e.pageY);
        }, 500);
    }
});

document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a');
    if (target) {
        clearTimeout(hoverTimeout);
        tooltip.style.display = 'none';
        currentLink = null;
    }
});

// Update position if mouse moves inside the link
document.addEventListener('mousemove', (e) => {
    if (currentLink && tooltip.style.display === 'block') {
        // CHANGE: Keep it ABOVE the cursor while moving
        tooltip.style.top = (e.pageY - 50) + 'px';
        tooltip.style.left = (e.pageX + 10) + 'px';
    }
});