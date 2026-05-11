/* ═══════════════════════════════════════════
   LegalAI — app.js
   Full frontend logic: upload, analysis, chat
═══════════════════════════════════════════ */

// ─── State ───────────────────────────────
let currentDocumentId = null;
let chatHistory = [];
let isAnalyzing = false;

// ─── DOM References ───────────────────────
const uploadSection   = document.getElementById('upload-section');
const dashboardSection= document.getElementById('dashboard-section');
const dropZone        = document.getElementById('drop-zone');
const fileInput       = document.getElementById('file-input');
const dzIdle          = document.getElementById('dz-idle');
const dzLoading       = document.getElementById('dz-loading');
const loadingText     = document.getElementById('loading-text');
const errorAlert      = document.getElementById('error-alert');
const errorText       = document.getElementById('error-text');
const chatMessages    = document.getElementById('chat-messages');
const chatInput       = document.getElementById('chat-input');
const chatSendBtn     = document.getElementById('chat-send-btn');
const backBtn         = document.getElementById('back-btn');
const themeToggle     = document.getElementById('theme-toggle');

// ─── Theme Toggle ─────────────────────────
const html = document.documentElement;
themeToggle.addEventListener('click', () => {
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    themeToggle.innerHTML = isDark
        ? '<i class="bi bi-sun-fill"></i>'
        : '<i class="bi bi-moon-stars-fill"></i>';
});

// ─── Back Button ──────────────────────────
backBtn.addEventListener('click', () => {
    dashboardSection.classList.add('d-none');
    uploadSection.classList.remove('d-none');
    resetUploadZone();
    currentDocumentId = null;
    chatHistory = [];
    fileInput.value = '';
});

// ─── Drag & Drop ──────────────────────────
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt =>
    dropZone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); })
);
['dragenter', 'dragover'].forEach(evt =>
    dropZone.addEventListener(evt, () => dropZone.classList.add('dragover'))
);
['dragleave', 'drop'].forEach(evt =>
    dropZone.addEventListener(evt, () => dropZone.classList.remove('dragover'))
);
dropZone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});
fileInput.addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

// ─── File Handling ────────────────────────
function handleFile(file) {
    if (isAnalyzing) return;
    const allowed = /\.(pdf|docx|jpg|jpeg|png)$/i;
    if (!allowed.test(file.name)) {
        showError('Unsupported file type. Please upload PDF, DOCX, JPG, JPEG, or PNG.');
        return;
    }
    hideError();
    processFile(file);
}

async function processFile(file) {
    isAnalyzing = true;
    setLoading(true, 'Uploading and extracting text...');

    try {
        // ── Step 1: Upload ──
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed.');
        currentDocumentId = uploadData.document_id;

        // ── Step 2: Analyze ──
        setLoading(true, 'Analyzing contract with LLaMA 3.3...');
        const analyzeRes = await fetch('/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document_id: currentDocumentId })
        });
        const analysisData = await analyzeRes.json();
        if (!analyzeRes.ok) throw new Error(analysisData.error || 'Analysis failed.');

        // ── Step 3: Populate Dashboard ──
        document.getElementById('dash-filename').textContent = file.name;
        populateDashboard(analysisData);

        // ── Step 4: Switch to Dashboard ──
        uploadSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        dashboardSection.classList.add('fade-in');

    } catch (err) {
        console.error(err);
        showError(err.message || 'Something went wrong. Please try again.');
        resetUploadZone();
    } finally {
        isAnalyzing = false;
        setLoading(false);
    }
}

// ─── Populate Dashboard ───────────────────
function populateDashboard(data) {
    // Contract type badge
    const typeBadge = document.getElementById('contract-type-badge');
    typeBadge.textContent = data.contract_type || 'Contract';

    // Risk score
    const score = parseInt(data.risk_score) || 0;
    animateRiskScore(score);

    // Risk label & summary
    const labelEl = document.getElementById('risk-label');
    const riskHero = document.getElementById('risk-hero');
    if (score <= 3) {
        labelEl.textContent = '🟢 Low Risk';
        riskHero.style.background = 'linear-gradient(135deg, #0d2318, #0f1623)';
        document.getElementById('risk-circle').style.stroke = '#3fb950';
    } else if (score <= 6) {
        labelEl.textContent = '🟡 Medium Risk';
        riskHero.style.background = 'linear-gradient(135deg, #2a1f0a, #0f1623)';
        document.getElementById('risk-circle').style.stroke = '#e3b341';
    } else {
        labelEl.textContent = '🔴 High Risk';
        riskHero.style.background = 'linear-gradient(135deg, #2a0a0a, #0f1623)';
        document.getElementById('risk-circle').style.stroke = '#f85149';
    }
    document.getElementById('risk-summary-text').textContent = data.risk_summary || '';

    // Stats
    document.getElementById('stat-clauses').textContent   = (data.risky_clauses || []).length;
    document.getElementById('stat-recs').textContent      = (data.recommendations || []).length;
    document.getElementById('stat-deadlines').textContent = (data.deadlines || []).length;

    // Parties
    renderList('parties-list', data.parties, 'No parties identified.');

    // Deadlines
    renderList('deadlines-list', data.deadlines, 'No specific deadlines found.');

    // Summary
    document.getElementById('contract-summary').textContent =
        data.summary || 'No summary available.';

    // Key Obligations
    renderList('obligations-list', data.key_obligations, 'No key obligations identified.');

    // Risky Clauses
    renderRiskyClauses(data.risky_clauses || []);

    // Missing Protections
    renderList('missing-list', data.missing_protections, 'No missing protections identified.');

    // Recommendations
    renderList('recommendations-list', data.recommendations, 'No recommendations available.');

    // Favorable Clauses
    renderList('favorable-list', data.favorable_clauses, 'No favorable clauses identified.');
}

function animateRiskScore(score) {
    const el = document.getElementById('risk-score-val');
    const circle = document.getElementById('risk-circle');
    const circumference = 314; // 2 * pi * 50
    let current = 0;
    const step = score / 30;
    const timer = setInterval(() => {
        current = Math.min(current + step, score);
        el.textContent = Math.round(current);
        const offset = circumference - (circumference * current / 10);
        circle.style.strokeDashoffset = offset;
        if (current >= score) clearInterval(timer);
    }, 30);
}

function renderList(containerId, items, emptyMsg) {
    const el = document.getElementById(containerId);
    if (!items || items.length === 0) {
        el.innerHTML = `<li><span class="text-muted">${emptyMsg}</span></li>`;
        return;
    }
    el.innerHTML = items
        .map(item => `<li>${escHtml(String(item))}</li>`)
        .join('');
}

function renderRiskyClauses(clauses) {
    const container = document.getElementById('risky-clauses-container');
    if (!clauses.length) {
        container.innerHTML = '<p class="text-muted small">No risky clauses identified.</p>';
        return;
    }
    container.innerHTML = clauses.map((c, i) => {
        const sev = (c.severity || 'High').toLowerCase();
        const sevClass = sev === 'high' ? 'sev-high' : sev === 'medium' ? 'sev-med' : 'sev-low';
        const itemClass = sev === 'high' ? '' : sev === 'medium' ? 'severity-medium' : 'severity-low';
        return `
        <div class="risk-clause-item ${itemClass} fade-in">
            <div class="risk-clause-title">
                ${escHtml(c.title || `Clause ${i + 1}`)}
                <span class="severity-badge ${sevClass}">${escHtml(c.severity || 'High')}</span>
            </div>
            ${c.clause ? `<div class="risk-clause-text">"${escHtml(c.clause)}"</div>` : ''}
            <div class="risk-clause-reason">${escHtml(c.reason || '')}</div>
        </div>`;
    }).join('');
}

// ─── Chatbot ──────────────────────────────
chatSendBtn.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChat();
    }
});

// Auto-resize textarea
chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

// Quick suggestion chips
document.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        if (!currentDocumentId) return;
        chatInput.value = chip.dataset.q;
        sendChat();
    });
});

async function sendChat() {
    const question = chatInput.value.trim();
    if (!question || !currentDocumentId) {
        if (!currentDocumentId) showChatError('Please upload a contract first.');
        return;
    }

    appendChatMsg(question, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';

    const typingId = 'typing-' + Date.now();
    appendChatTyping(typingId);

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                document_id: currentDocumentId,
                question,
                history: chatHistory
            })
        });
        const data = await res.json();
        removeTyping(typingId);

        if (!res.ok) throw new Error(data.error || 'Chat failed.');

        appendChatMsg(data.response, 'bot');
        chatHistory.push({ role: 'user', content: question });
        chatHistory.push({ role: 'assistant', content: data.response });

        // Keep history manageable
        if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);

    } catch (err) {
        removeTyping(typingId);
        appendChatMsg('⚠️ ' + (err.message || 'Something went wrong.'), 'bot');
    }
}

function appendChatMsg(text, role) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role} fade-in`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendChatTyping(id) {
    const div = document.createElement('div');
    div.className = 'chat-msg bot typing fade-in';
    div.id = id;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function showChatError(msg) {
    appendChatMsg('⚠️ ' + msg, 'bot');
}

// ─── UI Helpers ───────────────────────────
function setLoading(show, message = '') {
    const fileInputEl = document.getElementById('file-input');
    if (show) {
        dzIdle.classList.add('d-none');
        dzLoading.classList.remove('d-none');
        loadingText.textContent = message;
        // Hide the invisible overlay so user can't re-trigger upload
        fileInputEl.style.display = 'none';
    } else {
        dzIdle.classList.remove('d-none');
        dzLoading.classList.add('d-none');
        // Restore overlay
        fileInputEl.style.display = '';
        fileInputEl.style.position = 'absolute';
    }
}

function resetUploadZone() {
    setLoading(false);
    dropZone.classList.remove('dragover');
    fileInput.value = '';
}

function showError(msg) {
    errorText.textContent = msg;
    errorAlert.classList.remove('d-none');
}

function hideError() {
    errorAlert.classList.add('d-none');
}

function escHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
