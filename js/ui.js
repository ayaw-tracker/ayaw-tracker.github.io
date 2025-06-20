<script>
// Parlay Tracker Application - Enhanced with Theme Toggle & Reflection
class ParlayTracker {
    // Static constants
    static MAX_UNDO_HISTORY = 10;
    static STORAGE_KEYS = {
        PARLAYS: 'parlays',
        SUCCESS_CALC_METHOD: 'successCalcMethod',
        HAS_VISITED: 'hasVisited',
        THEME: 'theme'
    };

    constructor() {
        this.parlays = [];
        this.currentSuccessCalcMethod = 'parlays';
        this.editingIndex = -1;
        this.undoStack = [];

        // Elements
        this.initializeElements();
        this.attachEventListeners();
        this.loadData();
        this.initializeUI();
    }

    initializeElements() {
        // Core UI elements
        this.parlayForm = document.getElementById('parlayForm');
        this.dateInput = document.getElementById('date');
        this.resultInput = document.getElementById('result');
        this.playTypeInput = document.getElementById('playType');
        this.amountWageredInput = document.getElementById('amountWagered');
        this.amountWonLossInput = document.getElementById('amountWonLoss');
        this.playerPropInputsContainer = document.getElementById('playerPropInputs');
        this.addPlayerPropBtn = document.getElementById('addPlayerPropBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.historySection = document.getElementById('history-section');
        // Summary elements
        this.totalWageredSpan = document.getElementById('totalWagered');
        this.netProfitLossSpan = document.getElementById('netProfitLoss');
        this.totalParlaysSpan = document.getElementById('totalParlays');
        this.totalWinsSpan = document.getElementById('totalWins');
        this.totalLossesSpan = document.getElementById('totalLosses');
        this.totalPushesSpan = document.getElementById('totalPushes');
        this.successPercentageCalcSelect = document.getElementById('successPercentageCalc');
        this.successPercentageSpan = document.getElementById('successPercentage');
        // Modals
        this.welcomeModal = document.getElementById('welcomeModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.confirmationModal = document.getElementById('confirmationModal');
        this.confirmationModalTitle = document.getElementById('confirmationModalTitle');
        this.confirmationModalMessage = document.getElementById('confirmationModalMessage');
        this.cancelClearBtn = document.getElementById('cancelClearBtn');
        this.confirmClearBtn = document.getElementById('confirmClearBtn');
        // Theme toggle
        this.themeBtn = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
    }

    attachEventListeners() {
        // Form and bet inputs
        this.parlayForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        this.addPlayerPropBtn.addEventListener('click', () => this.addPlayerPropRow());
        this.clearAllBtn.addEventListener('click', () => this.promptClearAll());
        this.successPercentageCalcSelect.addEventListener('change', this.handleSuccessCalcChange.bind(this));
        // Theme toggle
        this.themeBtn.addEventListener('click', this.toggleTheme.bind(this));
        // Modal actions
        this.closeModalBtn.addEventListener('click', this.closeWelcomeModal.bind(this));
        this.cancelClearBtn.addEventListener('click', this.hideConfirmationModal.bind(this));
        this.confirmClearBtn.addEventListener('click', this.handleConfirmationClick.bind(this));
        // Keyboard undo
        document.addEventListener('keydown', (e) => { if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault(); this.undo();} });
    }

    loadData() {
        // Parlays
        const stored = localStorage.getItem(ParlayTracker.STORAGE_KEYS.PARLAYS);
        if(stored) this.parlays = JSON.parse(stored);
        // Success calc
        const method = localStorage.getItem(ParlayTracker.STORAGE_KEYS.SUCCESS_CALC_METHOD);
        if(method) this.currentSuccessCalcMethod = method;
        // Theme
        const theme = localStorage.getItem(ParlayTracker.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.classList.toggle('dark', theme==='dark');
        this.themeIcon.src = `assets/icons/${theme==='dark'? 'sun':'moon'}.svg`;
    }

    initializeUI() {
        // Default date & one prop row
        this.dateInput.valueAsDate = new Date();
        this.addPlayerPropRow();
        // Render existing
        this.renderSummary();
        this.renderHistory();
        this.showWelcomeModal();
    }

    saveData() {
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.PARLAYS, JSON.stringify(this.parlays));
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.SUCCESS_CALC_METHOD, this.currentSuccessCalcMethod);
    }

    toggleTheme() {
        const dark = document.documentElement.classList.toggle('dark');
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.THEME, dark? 'dark':'light');
        this.themeIcon.src = `assets/icons/${dark? 'sun':'moon'}.svg`;
    }

    promptReflection(entry) {
        const note = prompt('Why did you place this parlay? What would you do differently?');
        entry.reflection = note || '';
    }

    handleFormSubmit(e) {
        e.preventDefault();
        // gather data
        const newParlay = {
            id: Date.now().toString(),
            date: this.dateInput.value,
            result: this.resultInput.value,
            type: this.playTypeInput.value,
            wagered: parseFloat(this.amountWageredInput.value),
            net: parseFloat(this.amountWonLossInput.value),
            reflection: ''
        };
        // prompt reflection
        this.promptReflection(newParlay);
        // add & save
        this.parlays.unshift(newParlay);
        this.saveData();
        // rerender
        this.renderSummary();
        this.renderHistory();
        this.resetForm();
    }

    resetForm() {
        this.parlayForm.reset();
        this.dateInput.valueAsDate = new Date();
        this.playerPropInputsContainer.innerHTML = '';
        this.addPlayerPropRow();
    }

    renderHistory() {
        if (!this.parlays.length) {
            this.historySection.innerHTML = '<p class="text-center text-gray-500">No parlays tracked yet.</p>';
            return;
        }
        this.historySection.innerHTML = this.parlays.map(p => `
            <div class="p-4 mb-2 bg-gray-100 dark:bg-gray-800 rounded">
              <div class="flex justify-between">
                <span>${p.date}</span>
                <span>${p.net>=0?'+':''}${p.net.toFixed(2)}</span>
              </div>
              <button class="mt-2 text-sm text-blue-500" onclick="alert('${p.reflection.replace(/'/g,"\\'")}')">Reflection</button>
            </div>
        `).join('');
    }

    renderSummary() {
        const totals = this.parlays.reduce((acc, p) => {
            acc.wagered += p.wagered;
            acc.net += p.net;
            if(p.result==='Win') acc.wins++;
            if(p.result==='Loss') acc.losses++;
            if(p.result==='Push') acc.pushes++;
            return acc;
        }, {wagered:0, net:0, wins:0, losses:0, pushes:0});
        const count = this.parlays.length;
        const success = count? (totals.wins/count*100).toFixed(2): '0.00';
        // update DOM
        this.totalWageredSpan.textContent = totals.wagered.toFixed(2);
        this.netProfitLossSpan.textContent = totals.net.toFixed(2);
        this.totalParlaysSpan.textContent = count;
        this.totalWinsSpan.textContent = totals.wins;
        this.totalLossesSpan.textContent = totals.losses;
        this.totalPushesSpan.textContent = totals.pushes;
        this.successPercentageSpan.textContent = success;
    }

    // ... existing methods (addPlayerPropRow, clearPlayerPropRows, promptClearAll, confirmations, undo, etc.) remain unchanged
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
    window.tracker = new ParlayTracker();
});
</script>
