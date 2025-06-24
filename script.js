// Parlay Tracker Application
class ParlayTracker {
    // Static constants
    static MAX_UNDO_HISTORY = 10;
    static STORAGE_KEYS = {
        PARLAYS: 'parlays',
        SUCCESS_CALC_METHOD: 'successCalcMethod',
        THEME: 'theme',
        DATE_FILTER_FROM: 'dateFilterFrom',
        DATE_FILTER_TO: 'dateFilterTo',
        TIMELINE_SUMMARY_TEXT: 'timelineSummaryText',
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

        this.pendingAction = null; // To store action details for confirmation modal

        // New date filter elements
        this.timelineDetails = null; // Reference to the new <details> element for timeline
        this.currentTimelineDisplay = null; // Reference to the span inside timeline summary
        this.filterFromDateInput = null;
        this.filterToDateInput = null;
        this.filterLast7DaysBtn = null;
        this.filterLast30DaysBtn = null;
        this.clearDateFilterBtn = null;
        this.dateFilterError = null;

        // New Import/Export Elements
        this.importDataBtn = null;
        this.exportCsvBtn = null; // Changed to CSV specific export
        this.exportJsonBtn = null; // Added for JSON export
        this.importFileInput = null;

        // Consent buttons
        this.keepLocalBtn = null;
        this.participateBtn = null;

        this.init();
    }

    // Main initialization method
    async init() {
        try {
            this.initializeElements();
            this.attachEventListeners();
            this.loadData();
            this.initializeUI();
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

            // New Import/Export Elements
            importDataBtn: 'importDataBtn',
            exportCsvBtn: 'exportCsvBtn',
            exportJsonBtn: 'exportJsonBtn',
            importFileInput: 'importFileInput',

            // Consent buttons
            keepLocalBtn: 'keepLocalBtn',
            participateBtn: 'participateBtn',
        };

        Object.entries(elementsMap).forEach(([propertyName, id]) => {
            const element = document.getElementById(id);
            if (element) {
                this[propertyName] = element;
                // Add specific log for playerPropInputsContainer
                if (propertyName === 'playerPropInputsContainer') {
                    console.log(`playerPropInputsContainer element found:`, this.playerPropInputsContainer);
                }
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

        // Welcome modal buttons now just close the modal
        if (this.keepLocalBtn) {
            this.keepLocalBtn.addEventListener('click', this.closeWelcomeModal.bind(this));
        }
        if (this.participateBtn) {
            this.participateBtn.addEventListener('click', this.closeWelcomeModal.bind(this));
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

        // Import/Export Button Event Listeners
        if (this.exportCsvBtn) {
            this.exportCsvBtn.addEventListener('click', this.exportParlayDataAsCsv.bind(this));
        }
        if (this.exportJsonBtn) {
            this.exportJsonBtn.addEventListener('click', this.exportParlayDataAsJson.bind(this));
        }
        if (this.importDataBtn) {
            this.importDataBtn.addEventListener('click', () => this.importFileInput.click()); // Trigger hidden file input click
        }
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', this.handleImportFileSelect.bind(this));
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
        this.clearValidationError(this.amountWonLossInput, this.amountWonLossErrorS
