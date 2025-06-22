// Parlay Tracker Application
class ParlayTracker {
    // Static constants
    static MAX_UNDO_HISTORY = 10;
    static STORAGE_KEYS = {
        PARLAYS: 'parlays',
        SUCCESS_CALC_METHOD: 'successCalcMethod',
        HAS_VISITED: 'hasVisited',
        THEME: 'theme',
        DATE_FILTER_FROM: 'dateFilterFrom',
        DATE_FILTER_TO: 'dateFilterTo',
        TIMELINE_SUMMARY_TEXT: 'timelineSummaryText' // New key for timeline summary
    };

    constructor() {
        this.parlays = [];
        this.currentSuccessCalcMethod = 'parlays';
        this.editingIndex = -1;
        this.undoStack = [];

        // Date filtering properties
        this.filterFromDate = '';
        this.filterToDate = '';
        this.currentTimelineSummaryText = 'All Time'; // Default text for timeline summary

        // Feature Tour properties
        this.tourSteps = [];
        this.currentTourStepIndex = 0;
        this.isTourActive = false;

        // Initialize all element properties to null initially
        this.parlayForm = null;
        this.dateInput = null;
        this.resultInput = null;
        this.playTypeInput = null;
        this.amountWageredInput = null;
        this.amountWonLossInput = null;
        this.playerPropInputsContainer = null;
        this.addPlayerPropBtn = null;
        this.submitBtn = null;
        this.clearAllBtn = null;
        this.parlayTableBody = null;
        this.parlayHistoryContainer = null;
        this.noParlaysMessage = null;
        this.totalWageredSpan = null;
        this.netProfitLossSpan = null;
        this.netProfitLossDisplay = null; // Span for net profit/loss amount
        this.totalWinsSpan = null;
        this.totalLossesSpan = null;
        this.totalPushesSpan = null;
        this.totalParlaysSpan = null;
        this.successPercentageCalcSelect = null;
        this.successPercentageSpan = null;
        this.welcomeModal = null;
        this.startTrackingBtn = null; // New button for welcome modal
        this.guideMeBtn = null; // New button for welcome modal
        this.confirmationModal = null;
        this.confirmationModalTitle = null;
        this.confirmationModalMessage = null;
        this.cancelClearBtn = null;
        this.confirmClearBtn = null;
        this.welcomeModalTitle = null;
        this.themeToggle = null;

        this.dateErrorSpan = null;
        this.amountWageredErrorSpan = null;
        this.amountWonLossErrorSpan = null;
        this.individualBetsErrorSpan = null;

        this.parlaySectionDetails = null;
        this.parlayFormSummary = null;

        this.pendingAction = null;

        // New date filter elements
        this.timelineDetails = null; // Reference to the new <details> element for timeline
        this.currentTimelineDisplay = null; // Reference to the span inside timeline summary
        this.filterFromDateInput = null;
        this.filterToDateInput = null;
        this.filterLast7DaysBtn = null;
        this.filterLast30DaysBtn = null;
        this.clearDateFilterBtn = null;
        this.dateFilterError = null;


        // Tour elements
        this.tourOverlay = null;
        this.tourBubble = null;
        this.tourBubbleText = null;
        this.tourNextBtn = null;
        this.tourSkipBtn = null;
        this.tourFinishBtn = null;
        this.tourBubbleArrow = null;

        this.init();
    }

    // Main initialization method
    async init() {
        try {
            this.initializeElements();
            this.attachEventListeners();
            this.loadData();
            this.initializeUI();
            this.setupTourSteps(); // Setup tour steps after elements are initialized
        } catch (error) {
            console.error('Failed to initialize ParlayTracker:', error);
        }
    }

    // Initialize DOM element references with error checking
    initializeElements() {
        const elementsMap = {
            parlayForm: 'parlayForm',
            dateInput: 'date',
            resultInput: 'result',
            playTypeInput: 'playType',
            amountWageredInput: 'amountWagered',
            amountWonLossInput: 'amountWonLoss',
            playerPropInputsContainer: 'playerPropInputs',
            addPlayerPropBtn: 'addPlayerPropBtn',
            submitBtn: 'submitBtn',
            clearAllBtn: 'clearAllBtn',
            parlayTableBody: 'parlayTableBody',
            parlayHistoryContainer: 'parlayHistoryContainer',
            noParlaysMessage: 'noParlaysMessage',
            totalWageredSpan: 'totalWagered',
            netProfitLossSpan: 'netProfitLoss',
            totalWinsSpan: 'totalWins',
            totalLossesSpan: 'totalLosses',
            totalPushesSpan: 'totalPushes',
            totalParlaysSpan: 'totalParlays',
            successPercentageCalcSelect: 'successPercentageCalc',
            successPercentageSpan: 'successPercentage',
            welcomeModal: 'welcomeModal',
            startTrackingBtn: 'startTrackingBtn',
            guideMeBtn: 'guideMeBtn',
            confirmationModal: 'confirmationModal',
            confirmationModalTitle: 'confirmationModalTitle',
            confirmationModalMessage: 'confirmationModalMessage',
            cancelClearBtn: 'cancelClearBtn',
            confirmClearBtn: 'confirmClearBtn',
            welcomeModalTitle: 'welcomeModalTitle',
            themeToggle: 'themeToggle',
            // New date filter inputs and buttons
            timelineDetails: 'timelineDetails', // Reference to the new <details> element
            currentTimelineDisplay: 'currentTimelineDisplay', // Span within the summary
            filterFromDateInput: 'filterFromDate',
            filterToDateInput: 'filterToDate',
            filterLast7DaysBtn: 'filterLast7Days',
            filterLast30DaysBtn: 'filterLast30Days',
            clearDateFilterBtn: 'clearDateFilterBtn',
            dateFilterError: 'dateFilterError', // For date range validation message

            // Tour elements
            tourOverlay: 'tourOverlay',
            tourBubble: 'tourBubble',
            tourBubbleText: 'tourBubbleText',
            tourNextBtn: 'tourNextBtn',
            tourSkipBtn: 'tourSkipBtn',
            tourFinishBtn: 'tourFinishBtn',
            tourBubbleArrow: 'tourBubbleArrow'
        };

        Object.entries(elementsMap).forEach(([propertyName, id]) => {
            const element = document.getElementById(id);
            if (element) {
                this[propertyName] = element;
            } else {
                console.error(`ERROR: Element with ID '${id}' for property '${propertyName}' not found. Functionality relying on this element may be broken.`);
                this[propertyName] = null;
            }
        });

        const errorSpanElements = {
            dateErrorSpan: 'dateError',
            amountWageredErrorSpan: 'amountWageredError',
            amountWonLossErrorSpan: 'amountWonLossError',
            individualBetsErrorSpan: 'individualBetsError'
        };

        Object.entries(errorSpanElements).forEach(([propertyName, id]) => {
            const element = document.getElementById(id);
            if (element) {
                this[propertyName] = element;
            } else {
                console.warn(`WARNING: Error span with ID '${id}' for property '${propertyName}' not found. Validation messages may not display.`);
                this[propertyName] = null;
            }
        });

        this.parlaySectionDetails = document.querySelector('.parlay-section');
        if (!this.parlaySectionDetails) {
            console.error("ERROR: Element with class '.parlay-section' not found. Add New Parlay section may not function.");
        }
        this.parlayFormSummary = this.parlaySectionDetails ? this.parlaySectionDetails.querySelector('summary') : null;
        if (this.parlaySectionDetails && !this.parlayFormSummary) {
            console.error("ERROR: Summary element within '.parlay-section' not found. Form toggle may not function.");
        }
    }

    attachEventListeners() {
        if (this.amountWageredInput) {
            this.amountWageredInput.addEventListener('focus', this.handleInputFocus.bind(this));
            this.amountWageredInput.addEventListener('input', (e) => {
                this.sanitizeMoneyInput(e);
                this.updateWonLossBasedOnResult();
            });
            this.amountWageredInput.addEventListener('blur', this.formatCurrencyOnBlur.bind(this));
        }

        if (this.amountWonLossInput) {
            this.amountWonLossInput.addEventListener('focus', this.handleInputFocus.bind(this));
            this.amountWonLossInput.addEventListener('input', this.sanitizeMoneyInput.bind(this));
            this.amountWonLossInput.addEventListener('blur', this.formatCurrencyOnBlur.bind(this));
        }

        if (this.resultInput) {
            this.resultInput.addEventListener('change', this.updateWonLossBasedOnResult.bind(this));
        }
        if (this.parlayForm) {
            this.parlayForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        if (this.addPlayerPropBtn) {
            this.addPlayerPropBtn.addEventListener('click', () => this.addPlayerPropRow());
        }
        if (this.clearAllBtn) {
            this.clearAllBtn.addEventListener('click', this.promptClearAll.bind(this));
        }
        if (this.successPercentageCalcSelect) {
            this.successPercentageCalcSelect.addEventListener('change', this.handleSuccessCalcChange.bind(this));
        }

        // Welcome Modal Buttons
        if (this.startTrackingBtn) {
            this.startTrackingBtn.addEventListener('click', this.closeWelcomeModal.bind(this));
        }
        if (this.guideMeBtn) {
            this.guideMeBtn.addEventListener('click', this.startTour.bind(this));
        }


        if (this.cancelClearBtn) {
            this.cancelClearBtn.addEventListener('click', this.hideConfirmationModal.bind(this));
        }
        if (this.confirmClearBtn) {
            this.confirmClearBtn.addEventListener('click', this.handleConfirmationClick.bind(this));
        }

        // Theme toggle button
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        } else {
            console.warn("Theme toggle button not found, theme toggle functionality will not work.");
        }

        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Event listener for details element to toggle aria-expanded
        if (this.parlaySectionDetails && this.parlayFormSummary) {
            this.parlaySectionDetails.addEventListener('toggle', () => {
                this.parlayFormSummary.setAttribute('aria-expanded', this.parlaySectionDetails.open);
            });
        }

        document.body.addEventListener('click', (event) => {
            const target = event.target;
            if (target.closest('.edit-parlay-btn')) {
                const button = target.closest('.edit-parlay-btn');
                const index = parseInt(button.dataset.index);
                if (!isNaN(index)) {
                    this.editParlay(index);
                }
            } else if (target.closest('.delete-parlay-btn')) {
                const button = target.closest('.delete-parlay-btn');
                const index = parseInt(button.dataset.index);
                if (!isNaN(index)) {
                    this.promptDeleteParlay(index);
                }
            } else if (target.closest('.parlay-card-summary')) {
                const summary = target.closest('.parlay-card-summary');
                const card = summary.closest('.parlay-card');
                if (card) {
                    const details = card.querySelector('.parlay-card-toggle-details');
                    if (details) {
                        details.classList.toggle('hidden');
                    }
                }
            }
        });

        // Date filter event listeners
        if (this.filterFromDateInput) {
            this.filterFromDateInput.addEventListener('change', this.handleDateFilterChange.bind(this));
        }
        if (this.filterToDateInput) {
            this.filterToDateInput.addEventListener('change', this.handleDateFilterChange.bind(this));
        }
        if (this.filterLast7DaysBtn) {
            this.filterLast7DaysBtn.addEventListener('click', () => this.applyPresetFilter('last7Days'));
        }
        if (this.filterLast30DaysBtn) {
            this.filterLast30DaysBtn.addEventListener('click', () => this.applyPresetFilter('last30Days'));
        }
        if (this.clearDateFilterBtn) {
            this.clearDateFilterBtn.addEventListener('click', () => this.applyPresetFilter('clear'));
        }

        // Timeline details toggle to update aria-expanded
        if (this.timelineDetails && this.currentTimelineDisplay) {
            this.timelineDetails.addEventListener('toggle', () => {
                this.timelineDetails.setAttribute('aria-expanded', this.timelineDetails.open);
            });
        }


        // Tour navigation buttons
        if (this.tourNextBtn) {
            this.tourNextBtn.addEventListener('click', this.nextTourStep.bind(this));
        }
        if (this.tourSkipBtn) {
            this.tourSkipBtn.addEventListener('click', this.endTour.bind(this));
        }
        if (this.tourFinishBtn) {
            this.tourFinishBtn.addEventListener('click', this.endTour.bind(this));
        }
        if (this.tourOverlay) {
            this.tourOverlay.addEventListener('click', (e) => {
                // Only allow closing tour if clicking the overlay, not the bubble itself
                if (e.target === this.tourOverlay && this.isTourActive) {
                    this.endTour();
                }
            });
        }
    }

    loadData() {
        try {
            const storedParlays = localStorage.getItem(ParlayTracker.STORAGE_KEYS.PARLAYS);
            if (storedParlays) {
                this.parlays = JSON.parse(storedParlays);
            }
            const storedCalcMethod = localStorage.getItem(ParlayTracker.STORAGE_KEYS.SUCCESS_CALC_METHOD);
            if (storedCalcMethod) {
                this.currentSuccessCalcMethod = storedCalcMethod;
                if (this.successPercentageCalcSelect) {
                    this.successPercentageCalcSelect.value = storedCalcMethod;
                }
            }

            // Load date filters
            this.filterFromDate = localStorage.getItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_FROM) || '';
            this.filterToDate = localStorage.getItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_TO) || '';
            this.currentTimelineSummaryText = localStorage.getItem(ParlayTracker.STORAGE_KEYS.TIMELINE_SUMMARY_TEXT) || 'All Time';


            if (this.filterFromDateInput) {
                this.filterFromDateInput.value = this.filterFromDate;
            }
            if (this.filterToDateInput) {
                this.filterToDateInput.value = this.filterToDate;
            }
            if (this.currentTimelineDisplay) {
                this.currentTimelineDisplay.textContent = this.currentTimelineSummaryText;
            }


        } catch (error) {
            console.error("Error loading data from localStorage:", error);
            this.parlays = [];
        }
    }

    saveData() {
        try {
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.PARLAYS, JSON.stringify(this.parlays));
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.SUCCESS_CALC_METHOD, this.currentSuccessCalcMethod);
            // Save date filters
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_FROM, this.filterFromDate);
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_TO, this.filterToDate);
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.TIMELINE_SUMMARY_TEXT, this.currentTimelineSummaryText);
        } catch (error) {
            console.error("Error saving data to localStorage:", error);
        }
    }

    saveStateForUndo() {
        const currentState = {
            parlays: JSON.parse(JSON.stringify(this.parlays)),
        };
        this.undoStack.push(currentState);
        if (this.undoStack.length > ParlayTracker.MAX_UNDO_HISTORY) {
            this.undoStack.shift();
        }
        console.log(`State saved for undo. Stack size: ${this.undoStack.length}`);
    }

    handleInputFocus(event) {
        if (event.target && (event.target.value === '0.00' || event.target.value === '0')) {
            event.target.select();
        }
    }

    sanitizeMoneyInput(event) {
        const input = event.target;
        if (!input) return;
        const originalValue = input.value;
        let cleanedValue = originalValue.replace(/[^0-9.-]/g, '');

        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            cleanedValue = parts[0] + '.' + parts.slice(1).join('');
        }

        if (cleanedValue.indexOf('-') > 0) {
            cleanedValue = cleanedValue.replace(/-/g, '');
        }
        if (input.id === 'amountWonLoss' && originalValue.startsWith('-') && !cleanedValue.startsWith('-')) {
            cleanedValue = '-' + cleanedValue;
        } else if (input.id !== 'amountWonLoss' && cleanedValue.startsWith('-')) {
            cleanedValue = cleanedValue.substring(1);
        }

        if (cleanedValue.length > 1 && cleanedValue[0] === '0' && cleanedValue[1] !== '.') {
            cleanedValue = cleanedValue.substring(1);
        }

        if (originalValue !== cleanedValue) {
            const cursorPosition = input.selectionStart;
            input.value = cleanedValue;
            if (input.setSelectionRange) {
                input.setSelectionRange(cursorPosition, cursorPosition);
            }
        }
    }

    formatCurrencyOnBlur(event) {
        const input = event.target;
        if (!input) return;
        const value = input.value.trim();
        if (value === '') {
            input.value = '';
            return;
        }
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            input.value = '';
            return;
        }
        input.value = numericValue.toFixed(2);
    }

    updateWonLossBasedOnResult() {
        if (!this.resultInput || !this.amountWageredInput || !this.amountWonLossInput) {
            console.error("One or more required input elements for updateWonLossBasedOnResult are missing.");
            return;
        }
        const parlayResult = this.resultInput.value;
        const wageredValue = parseFloat(this.amountWageredInput.value || '0');
        const wonLossInput = this.amountWonLossInput;

        if (parlayResult === 'Win') {
            wonLossInput.placeholder = "Enter win amount";
        } else if (parlayResult === 'Loss') {
            wonLossInput.value = (-Math.abs(wageredValue)).toFixed(2);
            wonLossInput.placeholder = "Auto-calculated";
        } else if (parlayResult === 'Push') {
            wonLossInput.value = '0.00';
            wonLossInput.placeholder = "Auto-calculated";
        }
    }

    showValidationError(element, message, errorSpan) {
        if (element) {
            element.classList.add('border-red-500', 'ring-red-500');
        }
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden');
        }
    }

    clearValidationError(element, errorSpan) {
        if (element) {
            element.classList.remove('border-red-500', 'ring-red-500');
        }
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.add('hidden');
        }
    }

    clearAllValidationErrors() {
        this.clearValidationError(this.dateInput, this.dateErrorSpan);
        this.clearValidationError(this.amountWageredInput, this.amountWageredErrorSpan);
        this.clearValidationError(this.amountWonLossInput, this.amountWonLossErrorSpan);
        this.clearValidationError(null, this.individualBetsErrorSpan);
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError); // Clear date filter error
    }

    addPlayerPropRow(player = '', prop = '', result = 'Win') {
        if (!this.playerPropInputsContainer) {
            console.error("playerPropInputsContainer not found. Cannot add player prop row.");
            return;
        }
        const div = document.createElement('div');
        div.className = 'player-prop-row';
        div.innerHTML = `
            <div>
                <label class="block text-xs font-medium text-gray-600 mb-0.5">Player/Team</label>
                <input type="text" placeholder="e.g., Lakers" class="player-name mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-800" value="${player}" required>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-600 mb-0.5">Prop Type</label>
                <input type="text" placeholder="e.g., Over 25.5 Pts" class="prop-type mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-800" value="${prop}" required>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-600 mb-0.5">Result</label>
                <select class="prop-result mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-800">
                    <option value="Win" ${result === 'Win' ? 'selected' : ''}>Win</option>
                    <option value="Loss" ${result === 'Loss' ? 'selected' : ''}>Loss</option>
                    <option value="Push" ${result === 'Push' ? 'selected' : ''}>Push</option>
                </select>
            </div>
            <div class="flex items-end">
                <button type="button" class="remove-prop-btn bg-gray-200 text-gray-800 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-300 transition-all duration-200" aria-label="Remove player/team bet">-</button>
            </div>
        `;
        this.playerPropInputsContainer.appendChild(div);

        const removeButton = div.querySelector('.remove-prop-btn');
        if (removeButton) {
            removeButton.addEventListener('click', (e) => {
                const row = e.target.closest('.player-prop-row');
                if (row) {
                    row.classList.add('removing');
                    row.addEventListener('animationend', () => row.remove());
                }
            });
        }
    }

    clearPlayerPropRows() {
        if (this.playerPropInputsContainer) {
            this.playerPropInputsContainer.innerHTML = '';
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();
        this.clearAllValidationErrors();

        let isValid = true;

        const date = this.dateInput ? this.dateInput.value : '';
        const amountWagered = this.amountWageredInput ? parseFloat(this.amountWageredInput.value || '0') : 0;
        const amountWonLoss = this.amountWonLossInput ? parseFloat(this.amountWonLossInput.value || '0') : 0;
        const result = this.resultInput ? this.resultInput.value : '';
        const playType = this.playTypeInput ? this.playTypeInput.value : '';


        if (!date) {
            this.showValidationError(this.dateInput, 'Date is required.', this.dateErrorSpan);
            isValid = false;
        }

        if (isNaN(amountWagered) || amountWagered <= 0) {
            this.showValidationError(this.amountWageredInput, 'Enter a positive amount.', this.amountWageredErrorSpan);
            isValid = false;
        }
        if (isNaN(amountWonLoss)) {
            this.showValidationError(this.amountWonLossInput, 'Enter a valid number.', this.amountWonLossErrorSpan);
            isValid = false;
        }

        const individualBets = [];
        if (this.playerPropInputsContainer) {
            const playerPropRows = this.playerPropInputsContainer.querySelectorAll('.player-prop-row');
            let allPropsValid = true;
            playerPropRows.forEach(row => {
                const playerInput = row.querySelector('.player-name');
                const propInput = row.querySelector('.prop-type');
                const propResultInput = row.querySelector('.prop-result');

                if (!playerInput || !playerInput.value.trim() || !propInput || !propInput.value.trim()) {
                    allPropsValid = false;
                }
                individualBets.push({
                    player: playerInput ? playerInput.value || '' : '',
                    prop: propInput ? propInput.value || '' : '',
                    result: propResultInput ? propResultInput.value || 'Win' : 'Win'
                });
            });

            if (!allPropsValid && playerPropRows.length > 0) {
                this.showValidationError(null, 'Fill all Player/Team & Prop Type fields in individual bets.', this.individualBetsErrorSpan);
                isValid = false;
            }
        }

        if (!isValid) {
            const firstErrorElement = document.querySelector('.text-red-500:not(.hidden)');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        this.saveStateForUndo();

        const newParlay = {
            date,
            result,
            playType,
            amountWagered,
            amountWonLoss,
            individualBets
        };

        if (this.editingIndex > -1) {
            this.parlays[this.editingIndex] = newParlay;
            this.editingIndex = -1;
            if (this.submitBtn) {
                this.submitBtn.textContent = 'Add Parlay Entry';
            }
        } else {
            this.parlays.unshift(newParlay);
        }

        this.saveData();
        this.renderParlays();
        this.updateSummary();
        this.resetForm();
    }

    resetForm() {
        if (this.parlayForm) {
            this.parlayForm.reset();
        }

        if (this.amountWageredInput) {
            this.amountWageredInput.value = '';
        }
        if (this.amountWonLossInput) {
            this.amountWonLossInput.value = '';
            this.amountWonLossInput.placeholder = '0.00';
        }
        if (this.dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            this.dateInput.value = `${year}-${month}-${day}`;
        }

        this.clearPlayerPropRows();
        this.addPlayerPropRow();
        this.editingIndex = -1;
        if (this.submitBtn) {
            this.submitBtn.textContent = 'Add Parlay Entry';
        }
        if (this.parlaySectionDetails) {
            this.parlaySectionDetails.open = false;
        }
        this.clearAllValidationErrors();
    }

    editParlay(index) {
        const parlay = this.parlays[index];
        if (!parlay) return;

        this.clearAllValidationErrors();
        this.editingIndex = index;

        if (this.dateInput) {
            this.dateInput.value = parlay.date;
        }
        if (this.resultInput) {
            this.resultInput.value = parlay.result;
        }
        if (this.playTypeInput) {
            this.playTypeInput.value = parlay.playType;
        }
        if (this.amountWageredInput) {
            this.amountWageredInput.value = parlay.amountWagered.toFixed(2);
        }
        if (this.amountWonLossInput) {
            this.amountWonLossInput.value = parlay.amountWonLoss.toFixed(2);
            this.updateWonLossBasedOnResult();
        }

        this.clearPlayerPropRows();
        parlay.individualBets.forEach(bet => {
            this.addPlayerPropRow(bet.player, bet.prop, bet.result);
        });

        if (this.submitBtn) {
            this.submitBtn.textContent = 'Update Parlay Entry';
        }
        if (this.parlaySectionDetails) {
            this.parlaySectionDetails.open = true;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    promptClearAll() {
        this.pendingAction = { type: 'clear' };
        this.showConfirmationModal('Confirm Clear All', 'Are you sure you want to clear all parlay entries? This action cannot be undone.');
    }

    promptDeleteParlay(index) {
        this.pendingAction = { type: 'delete', index: index };
        this.showConfirmationModal('Confirm Delete', 'Are you sure you want to delete this parlay entry? This action cannot be undone.');
    }

    showConfirmationModal(title, message, type = 'confirm') {
        if (!this.confirmationModal || !this.confirmationModalTitle || !this.confirmationModalMessage) {
            console.error("Confirmation modal elements not found. Cannot show modal.");
            return;
        }
        this.confirmationModalTitle.textContent = title;
        this.confirmationModalMessage.textContent = message;

        if (type === 'info') {
            if (this.cancelClearBtn) this.cancelClearBtn.classList.add('hidden');
            if (this.confirmClearBtn) {
                this.confirmClearBtn.textContent = 'OK';
                this.confirmClearBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
                this.confirmClearBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }
        } else {
            if (this.cancelClearBtn) this.cancelClearBtn.classList.remove('hidden');
            if (this.confirmClearBtn) {
                this.confirmClearBtn.textContent = 'Confirm';
                this.confirmClearBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                this.confirmClearBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            }
        }

        this.confirmationModal.classList.remove('hidden');
        setTimeout(() => {
            this.confirmationModal.classList.add('show');
        }, 10);
        this.confirmClearBtn?.focus();
    }

    showInfoModal(title, message) {
        this.pendingAction = { type: 'info' };
        this.showConfirmationModal(title, message, 'info');
    }

    hideConfirmationModal() {
        if (!this.confirmationModal) return;

        this.confirmationModal.classList.remove('show');
        this.confirmationModal.addEventListener('transitionend', () => {
            this.confirmationModal.classList.add('hidden');
            if (this.cancelClearBtn) this.cancelClearBtn.classList.remove('hidden');
            if (this.confirmClearBtn) {
                this.confirmClearBtn.textContent = 'Confirm';
                this.confirmClearBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                this.confirmClearBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            }
        }, { once: true });
    }

    handleConfirmationClick() {
        const action = this.pendingAction;
        this.hideConfirmationModal();

        if (action) {
            if (action.type === 'clear') {
                this.executeClearAllParlays();
            } else if (action.type === 'delete' && typeof action.index === 'number') {
                this.executeDeleteParlay(action.index);
            } else if (action.type === 'info') {
                // For info modals, just hiding is the action.
            }
            this.pendingAction = null;
        }
    }

    executeClearAllParlays() {
        this.saveStateForUndo();
        this.parlays = [];
        this.saveData();
        this.renderParlays();
        this.updateSummary();
        this.resetForm();
    }

    executeDeleteParlay(index) {
        this.saveStateForUndo();
        this.parlays.splice(index, 1);
        this.saveData();
        this.renderParlays();
        this.updateSummary();
    }

    /**
     * Filters the parlays based on the current filterFromDate and filterToDate.
     * Includes validation for the date range.
     * @returns {Array} The array of filtered parlays.
     */
    filterParlaysByDate() {
        let filteredParlays = [...this.parlays];
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError); // Clear previous error

        let fromDateObj = null;
        let toDateObj = null;

        if (this.filterFromDate) {
            fromDateObj = new Date(this.filterFromDate + 'T00:00:00');
            filteredParlays = filteredParlays.filter(parlay => {
                const parlayDate = new Date(parlay.date + 'T00:00:00');
                return parlayDate >= fromDateObj;
            });
        }

        if (this.filterToDate) {
            toDateObj = new Date(this.filterToDate + 'T23:59:59'); // Include end of the 'to' day
            filteredParlays = filteredParlays.filter(parlay => {
                const parlayDate = new Date(parlay.date + 'T00:00:00');
                return parlayDate <= toDateObj;
            });
        }

        // Date range validation: If both are set, ensure fromDate is not after toDate
        if (fromDateObj && toDateObj && fromDateObj > toDateObj) {
            this.showValidationError(this.filterFromDateInput, 'Start date cannot be after end date.', this.dateFilterError);
            // Return empty filtered parlays to show no data for invalid range
            return [];
        }

        return filteredParlays;
    }


    renderParlays() {
        if (!this.parlayTableBody || !this.parlayHistoryContainer) {
            console.error("Parlay history containers not found. Cannot render parlays.");
            return;
        }

        this.parlayTableBody.innerHTML = '';
        this.parlayHistoryContainer.innerHTML = '';

        const filteredParlays = this.filterParlaysByDate(); // This method no longer updates currentTimelineSummaryText

        if (filteredParlays.length === 0) {
            if (this.noParlaysMessage) {
                this.noParlaysMessage.classList.remove('hidden');
            }
            // Ensure the main total parlay count reflects the filtered count
            if (this.totalParlaysSpan) {
                this.totalParlaysSpan.textContent = '0';
            }
            return;
        } else {
            if (this.noParlaysMessage) {
                this.noParlaysMessage.classList.add('hidden');
            }
        }

        filteredParlays.forEach((parlay, index) => {
            const getResultTextColor = (result) => {
                if (result === 'Win') return 'text-green-600';
                if (result === 'Loss') return 'text-red-600';
                if (result === 'Push') return 'text-yellow-600';
                return '';
            };

            const formattedDate = new Date(parlay.date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });


            const tableRow = `
                <tr data-index="${index}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${getResultTextColor(parlay.result)}">${parlay.result}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parlay.playType}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${parlay.amountWagered.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${getResultTextColor(parlay.amountWonLoss > 0 ? 'Win' : parlay.amountWonLoss < 0 ? 'Loss' : 'Push')}">$${parlay.amountWonLoss.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                        ${parlay.individualBets.map(bet => `<div>${bet.player}: ${bet.prop} (<span class="${getResultTextColor(bet.result)}">${bet.result}</span>)</div>`).join('')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="edit-parlay-btn text-indigo-600 hover:text-indigo-900 mr-3" data-index="${index}" aria-label="Edit parlay entry from ${formattedDate}">Edit</button>
                        <button class="delete-parlay-btn text-red-600 hover:text-red-900" data-index="${index}" aria-label="Delete parlay entry from ${formattedDate}">Delete</button>
                    </td>
                </tr>
            `;
            this.parlayTableBody.insertAdjacentHTML('beforeend', tableRow);

            const cardHtml = `
                <div class="parlay-card border-gray-200 bg-white" data-index="${index}">
                    <div class="parlay-card-summary">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">${formattedDate} - ${parlay.playType}</h3>
                        <div class="parlay-card-detail">
                            <span>Result:</span>
                            <strong class="text-gray-800 ${getResultTextColor(parlay.result)}">${parlay.result}</strong>
                        </div>
                        <div class="parlay-card-detail">
                            <span>Wagered:</span>
                            <strong>$${parlay.amountWagered.toFixed(2)}</strong>
                        </div>
                        <div class="parlay-card-detail">
                            <span>Profit/Loss:</span>
                            <strong class="text-gray-800 ${getResultTextColor(parlay.amountWonLoss > 0 ? 'Win' : parlay.amountWonLoss < 0 ? 'Loss' : 'Push')}">$${parlay.amountWonLoss.toFixed(2)}</strong>
                        </div>
                    </div>
                    <div class="parlay-card-toggle-details hidden">
                        <p class="text-sm font-medium text-gray-700 mb-1">Individual Bets:</p>
                        <ul class="parlay-card-bets">
                            ${parlay.individualBets.map(bet => `<li>${bet.player}: ${bet.prop} (<span class="${getResultTextColor(bet.result)}">${bet.result}</span>)</li>`).join('')}
                        </ul>
                    </div>
                    <div class="parlay-card-actions">
                        <button class="edit-parlay-btn bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors duration-200" data-index="${index}">Edit</button>
                        <button class="delete-parlay-btn bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-200" data-index="${index}">Delete</button>
                    </div>
                </div>
            `;
            this.parlayHistoryContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
        this.updateSummary();
    }

    updateSummary() {
        if (!this.totalWageredSpan || !this.netProfitLossSpan || !this.totalWinsSpan ||
            !this.totalLossesSpan || !this.totalPushesSpan || !this.totalParlaysSpan || !this.successPercentageSpan) {
            console.error("One or more summary elements are missing. Cannot update summary.");
            return;
        }

        const filteredParlays = this.filterParlaysByDate();

        let totalWagered = 0;
        let totalWonLoss = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let totalPushes = 0;
        let individualBetWins = 0;
        let individualBetLosses = 0;
        let individualBetPushes = 0;

        filteredParlays.forEach(parlay => {
            totalWagered += parlay.amountWagered;
            totalWonLoss += parlay.amountWonLoss;

            if (parlay.result === 'Win') {
                totalWins++;
            } else if (parlay.result === 'Loss') {
                totalLosses++;
            } else if (parlay.result === 'Push') {
                totalPushes++;
            }

            parlay.individualBets.forEach(bet => {
                if (bet.result === 'Win') {
                    individualBetWins++;
                } else if (bet.result === 'Loss') {
                    individualBetLosses++;
                } else if (bet.result === 'Push') {
                    individualBetPushes++;
                }
            });
        });

        // Removed the '$' from the HTML, so add it here.
        this.totalWageredSpan.textContent = `${totalWagered.toFixed(2)}`;
        this.netProfitLossSpan.textContent = `${totalWonLoss.toFixed(2)}`;
        this.totalParlaysSpan.textContent = filteredParlays.length.toString();

        this.netProfitLossSpan.classList.remove('text-green-600', 'text-red-600', 'text-yellow-600');
        if (totalWonLoss > 0) {
            this.netProfitLossSpan.classList.add('text-green-600');
        } else if (totalWonLoss < 0) {
            this.netProfitLossSpan.classList.add('text-red-600');
        } else {
            this.netProfitLossSpan.classList.add('text-yellow-600');
        }

        this.totalWinsSpan.textContent = totalWins.toString();
        this.totalLossesSpan.textContent = totalLosses.toString();
        this.totalPushesSpan.textContent = totalPushes.toString();

        this.totalWinsSpan.classList.add('text-green-700');
        this.totalLossesSpan.classList.add('text-red-700');
        this.totalPushesSpan.classList.add('text-yellow-700');


        let totalCountForSuccess = 0;
        let successfulCount = 0;

        if (this.currentSuccessCalcMethod === 'parlays') {
            totalCountForSuccess = totalWins + totalLosses + totalPushes;
            successfulCount = totalWins;
        } else if (this.currentSuccessCalcMethod === 'individualBets') {
            // For individual props, typically success rate excludes pushes from the total considered
            totalCountForSuccess = individualBetWins + individualBetLosses;
            successfulCount = individualBetWins;
        }

        let successPercentage = 0;
        if (totalCountForSuccess > 0) {
            successPercentage = (successfulCount / totalCountForSuccess) * 100;
        }
        // Removed the '%' as it's already in the HTML
        this.successPercentageSpan.textContent = `${successPercentage.toFixed(2)}`;
    }

    handleSuccessCalcChange() {
        if (this.successPercentageCalcSelect) {
            this.currentSuccessCalcMethod = this.successPercentageCalcSelect.value;
            this.saveData();
            this.updateSummary();
        }
    }

    /**
     * Handles changes to the manual date filter inputs.
     * Validates the date range and updates the timeline summary display.
     */
    handleDateFilterChange() {
        if (!this.filterFromDateInput || !this.filterToDateInput || !this.currentTimelineDisplay || !this.dateFilterError) {
            console.error("Required date filter elements are missing for handleDateFilterChange.");
            return;
        }

        this.filterFromDate = this.filterFromDateInput.value;
        this.filterToDate = this.filterToDateInput.value;
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError); // Clear previous error

        let fromDateObj = null;
        let toDateObj = null;
        let isValidDateRange = true;

        if (this.filterFromDate) {
            fromDateObj = new Date(this.filterFromDate + 'T00:00:00');
        }
        if (this.filterToDate) {
            toDateObj = new Date(this.filterToDate + 'T00:00:00');
        }

        if (fromDateObj && toDateObj && fromDateObj > toDateObj) {
            this.showValidationError(this.filterFromDateInput, 'Start date cannot be after end date.', this.dateFilterError);
            isValidDateRange = false;
        }

        if (isValidDateRange) {
            if (this.filterFromDate === '' && this.filterToDate === '') {
                this.currentTimelineSummaryText = 'All Time';
            } else {
                // Format dates for display as Month/Day/Year
                const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
                let formattedFrom = this.filterFromDate ? new Date(this.filterFromDate + 'T00:00:00').toLocaleDateString('en-US', options) : '';
                let formattedTo = this.filterToDate ? new Date(this.filterToDate + 'T00:00:00').toLocaleDateString('en-US', options) : '';

                if (formattedFrom && formattedTo) {
                    this.currentTimelineSummaryText = `${formattedFrom} - ${formattedTo}`;
                } else if (formattedFrom) {
                    this.currentTimelineSummaryText = `From: ${formattedFrom}`;
                } else if (formattedTo) {
                    this.currentTimelineSummaryText = `To: ${formattedTo}`;
                }
            }
            this.currentTimelineDisplay.textContent = this.currentTimelineSummaryText;
        } else {
            // If range is invalid, but previously valid dates were set,
            // keep the previous valid display text. The renderParlays will show no data.
        }

        this.saveData();
        this.renderParlays(); // Re-renders and updates summary based on the current filters
    }

    /**
     * Applies a preset date filter to the inputs and triggers data refresh.
     * @param {string} presetType - 'last7Days', 'last30Days', 'clear'
     */
    applyPresetFilter(presetType) {
        this.clearAllValidationErrors(); // Clear any date range errors

        const today = new Date();
        let from = '';
        let to = '';
        let displayString = '';

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        switch (presetType) {
            case 'clear':
                from = '';
                to = '';
                displayString = 'All Time'; // Set display string directly
                break;
            case 'last7Days':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 6); // -6 to include today
                from = formatDate(sevenDaysAgo);
                to = formatDate(today);
                displayString = 'Last 7 Days'; // Set display string directly
                break;
            case 'last30Days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 29); // -29 to include today
                from = formatDate(thirtyDaysAgo);
                to = formatDate(today);
                displayString = 'Last 30 Days'; // Set display string directly
                break;
            default:
                console.warn("Unknown preset type:", presetType);
                return;
        }

        if (this.filterFromDateInput) {
            this.filterFromDateInput.value = from;
            this.filterFromDate = from;
        }
        if (this.filterToDateInput) {
            this.filterToDateInput.value = to;
            this.filterToDate = to;
        }

        this.currentTimelineSummaryText = displayString; // Update the summary text property
        if (this.currentTimelineDisplay) {
            this.currentTimelineDisplay.textContent = this.currentTimelineSummaryText; // Update the UI element
        }
        this.saveData();
        this.renderParlays(); // This will trigger updateSummary too
    }

    initializeUI() {
        // Order matters here: load filters first, then set up UI based on loaded data
        this.applySavedTheme(); // Apply theme first
        
        // Load the stored date filter values and summary text
        this.filterFromDate = localStorage.getItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_FROM) || '';
        this.filterToDate = localStorage.getItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_TO) || '';
        this.currentTimelineSummaryText = localStorage.getItem(ParlayTracker.STORAGE_KEYS.TIMELINE_SUMMARY_TEXT) || 'All Time';

        // Update the date input fields
        if (this.filterFromDateInput) {
            this.filterFromDateInput.value = this.filterFromDate;
        }
        if (this.filterToDateInput) {
            this.filterToDateInput.value = this.filterToDate;
        }

        // Update the timeline display text based on loaded state
        if (this.currentTimelineDisplay) {
            if (this.filterFromDate === '' && this.filterToDate === '') {
                this.currentTimelineSummaryText = 'All Time';
            } else if (this.currentTimelineSummaryText === 'Last 7 Days' || this.currentTimelineSummaryText === 'Last 30 Days') {
                // If it's a preset, retain the label
            } else {
                // For custom date ranges, re-format the dates to M/D/YYYY
                const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
                let formattedFrom = this.filterFromDate ? new Date(this.filterFromDate + 'T00:00:00').toLocaleDateString('en-US', options) : '';
                let formattedTo = this.filterToDate ? new Date(this.filterToDate + 'T00:00:00').toLocaleDateString('en-US', options) : '';

                if (formattedFrom && formattedTo) {
                    this.currentTimelineSummaryText = `${formattedFrom} - ${formattedTo}`;
                } else if (formattedFrom) {
                    this.currentTimelineSummaryText = `From: ${formattedFrom}`;
                } else if (formattedTo) {
                    this.currentTimelineSummaryText = `To: ${formattedTo}`;
                }
            }
            this.currentTimelineDisplay.textContent = this.currentTimelineSummaryText;
        }
        
        this.renderParlays(); // Renders with initial/loaded filters
        this.updateSummary(); // Updates summary with initial/loaded filters
        this.resetForm(); // Sets the form date
        this.checkAndShowWelcomeModal();
    }

    checkAndShowWelcomeModal() {
        if (!this.welcomeModal) {
            console.warn("Welcome modal element not found, welcome modal functionality skipped.");
            return;
        }
        const hasVisited = localStorage.getItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED);
        if (!hasVisited) {
            this.welcomeModal.classList.remove('hidden');
            setTimeout(() => {
                this.welcomeModal.classList.add('show');
            }, 10);
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED, 'true');
        }
    }

    closeWelcomeModal() {
        if (!this.welcomeModal) return;
        this.welcomeModal.classList.remove('show');
        this.welcomeModal.addEventListener('transitionend', () => {
            this.welcomeModal.classList.add('hidden');
        }, { once: true });
    }

    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault();
            this.undoLastAction();
        }
    }

    undoLastAction() {
        if (this.undoStack.length > 0) {
            const previousState = this.undoStack.pop();
            this.parlays = previousState.parlays;
            this.saveData();
            this.renderParlays();
            this.updateSummary();
            this.resetForm();
            this.showInfoModal('Undo Successful', 'Last action has been undone.');
            console.log(`Undo successful. Remaining states in stack: ${this.undoStack.length}`);
        } else {
            this.showInfoModal('Undo Not Available', 'No more actions to undo.');
            console.log('Undo stack is empty.');
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        if (this.themeToggle) {
            this.themeToggle.querySelector('i').className = isDark ? 'fas fa-moon text-xl' : 'fas fa-sun text-xl';
            this.themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
        }
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem(ParlayTracker.STORAGE_KEYS.THEME) || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        if (this.themeToggle) {
            this.themeToggle.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-moon text-xl' : 'fas fa-sun text-xl';
            this.themeToggle.setAttribute('aria-label', `Switch to ${savedTheme === 'dark' ? 'light' : 'dark'} mode`);
        }
    }

    // --- Feature Tour Methods ---
    setupTourSteps() {
        this.tourSteps = [
            {
                element: document.querySelector('.parlay-section summary'),
                text: "This is where you'll log your parlays. Click this bar to expand the form and start entering your data.",
                position: 'bottom'
            },
            {
                element: document.querySelector('.parlay-section .parlay-content #addPlayerPropBtn'),
                text: "Add individual player or team bets to your parlay entry here. This helps you track specific prop performance!",
                position: 'top'
            },
            {
                element: this.totalWageredSpan?.closest('.bg-white.p-4.rounded-lg'), // Target the parent div of totalWageredSpan
                text: "This 'Summary Statistics' section gives you the overall picture: total money wagered, net profit/loss, and more.",
                position: 'bottom'
            },
            {
                element: this.timelineDetails, // Target the new timeline details element
                text: "This 'Timeline' section allows you to filter your data by specific date ranges or quick presets, giving you focused insights. It's collapsed by default for a cleaner view.",
                position: 'bottom'
            },
            {
                element: this.parlayTableBody?.closest('section.bg-white'),
                text: "All your recorded parlays appear here, in both table (desktop) and card (mobile) views. You can edit or delete entries.",
                position: 'top'
            },
            {
                element: this.themeToggle,
                text: "Easily switch between light and dark modes here to suit your preference.",
                position: 'left' // Position to the left of the button
            }
        ].filter(step => step.element !== null); // Filter out steps where element might not be found

        if (this.tourSteps.length > 0) {
            if (this.tourNextBtn) this.tourNextBtn.classList.remove('hidden');
            if (this.tourFinishBtn) this.tourFinishBtn.classList.add('hidden');
        } else {
            console.warn("No tour steps found, tour functionality might be limited or unavailable.");
            if (this.tourBubble) this.tourBubble.classList.add('hidden');
            if (this.tourOverlay) this.tourOverlay.classList.add('hidden');
        }
    }

    startTour() {
        if (!this.welcomeModal || !this.tourOverlay || !this.tourBubble) {
            console.error("Tour elements not fully initialized.");
            return;
        }

        this.isTourActive = true;
        this.currentTourStepIndex = 0;
        this.closeWelcomeModal(); // Close the welcome modal immediately

        setTimeout(() => {
            this.tourOverlay.classList.remove('hidden');
            this.tourBubble.classList.remove('hidden');
            this.showCurrentTourStep();
        }, 300); // Small delay to allow welcome modal to transition out
    }

    showCurrentTourStep() {
        if (this.currentTourStepIndex >= this.tourSteps.length) {
            this.endTour();
            return;
        }

        const step = this.tourSteps[this.currentTourStepIndex];
        if (!step.element || !this.tourBubble || !this.tourBubbleText || !this.tourBubbleArrow) {
            console.error(`Tour step ${this.currentTourStepIndex} element is null, skipping step.`);
            this.nextTourStep(); // Skip to next step
            return;
        }

        this.tourBubbleText.textContent = step.text;

        // Reset previous highlight
        document.querySelectorAll('.highlight-element').forEach(el => el.classList.remove('highlight-element'));
        // Highlight current element
        step.element.classList.add('highlight-element');
        step.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        this.positionTourBubble(step.element, this.tourBubble, step.position);

        if (this.currentTourStepIndex === this.tourSteps.length - 1) {
            if (this.tourNextBtn) this.tourNextBtn.classList.add('hidden');
            if (this.tourFinishBtn) this.tourFinishBtn.classList.remove('hidden');
        } else {
            if (this.tourNextBtn) this.tourNextBtn.classList.remove('hidden');
            if (this.tourFinishBtn) this.tourFinishBtn.classList.add('hidden');
        }
    }

    positionTourBubble(targetElement, bubbleElement, position) {
        const targetRect = targetElement.getBoundingClientRect();
        const bubbleRect = bubbleElement.getBoundingClientRect();
        const arrow = this.tourBubbleArrow;

        // Reset arrow class
        arrow.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');
        bubbleElement.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');

        let top, left;

        // Offset to prevent direct overlap and position the arrow well
        const offset = 20; // Distance from target element

        switch (position) {
            case 'bottom':
                top = targetRect.bottom + window.scrollY + offset;
                left = targetRect.left + window.scrollX + (targetRect.width / 2);
                arrow.style.top = `-0.5rem`; // Arrow points upwards
                arrow.style.left = `50%`;
                arrow.style.transform = `translate(-50%, -50%) rotate(45deg)`;
                bubbleElement.classList.add('position-bottom');
                break;
            case 'top':
                top = targetRect.top + window.scrollY - bubbleRect.height - offset;
                left = targetRect.left + window.scrollX + (targetRect.width / 2);
                arrow.style.top = `100%`; // Arrow points downwards
                arrow.style.left = `50%`;
                arrow.style.transform = `translate(-50%, -50%) rotate(45deg)`;
                bubbleElement.classList.add('position-top');
                break;
            case 'left':
                top = targetRect.top + window.scrollY + (targetRect.height / 2);
                left = targetRect.left + window.scrollX - bubbleRect.width - offset;
                arrow.style.top = `50%`;
                arrow.style.left = `100%`; // Arrow points left
                arrow.style.transform = `translate(-50%, -50%) rotate(45deg)`;
                bubbleElement.classList.add('position-left');
                break;
            case 'right':
                top = targetRect.top + window.scrollY + (targetRect.height / 2);
                left = targetRect.right + window.scrollX + offset;
                arrow.style.top = `50%`;
                arrow.style.left = `-0.5rem`; // Arrow points right
                arrow.style.transform = `translate(-50%, -50%) rotate(45deg)`;
                bubbleElement.classList.add('position-right');
                break;
            default: // Default to bottom if position is not specified or invalid
                top = targetRect.bottom + window.scrollY + offset;
                left = targetRect.left + window.scrollX + (targetRect.width / 2);
                arrow.style.top = `-0.5rem`;
                arrow.style.left = `50%`;
                arrow.style.transform = `translate(-50%, -50%) rotate(45deg)`;
                bubbleElement.classList.add('position-bottom');
        }

        bubbleElement.style.top = `${top}px`;
        bubbleElement.style.left = `${left}px`;
        bubbleElement.style.transform = `translate(-50%, -50%)`; // Center bubble on its own calculated position
        // Adjust for edge cases - ensure bubble stays on screen
        if (left < 0) {
            bubbleElement.style.left = `0px`;
            bubbleElement.style.transform = `translate(0, -50%)`;
            arrow.style.left = `${targetRect.left + targetRect.width / 2 - window.scrollX}px`; // Adjust arrow to point to center of target
        }
        if (left + bubbleRect.width > window.innerWidth) {
            bubbleElement.style.left = `${window.innerWidth - bubbleRect.width}px`;
            bubbleElement.style.transform = `translate(0, -50%)`;
            arrow.style.left = `${targetRect.left + targetRect.width / 2 - (window.innerWidth - bubbleRect.width)}px`;
        }
        if (top < window.scrollY) {
                bubbleElement.style.top = `${window.scrollY}px`;
                bubbleElement.style.transform = `translate(-50%, 0)`;
        }
        if (top + bubbleRect.height > window.innerHeight + window.scrollY) {
            bubbleElement.style.top = `${window.innerHeight + window.scrollY - bubbleRect.height}px`;
            bubbleElement.style.transform = `translate(-50%, 0)`;
        }
    }


    nextTourStep() {
        this.currentTourStepIndex++;
        this.showCurrentTourStep();
    }

    endTour() {
        this.isTourActive = false;
        if (this.tourOverlay) this.tourOverlay.classList.add('hidden');
        if (this.tourBubble) this.tourBubble.classList.add('hidden');
        document.querySelectorAll('.highlight-element').forEach(el => el.classList.remove('highlight-element'));
        if (this.tourBubble) {
            this.tourBubble.style.top = ''; // Clear inline styles
            this.tourBubble.style.left = '';
            this.tourBubble.style.transform = '';
            this.tourBubble.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');
        }
    }
}

// Instantiate the tracker when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParlayTracker();
});
