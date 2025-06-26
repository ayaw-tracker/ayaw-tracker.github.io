// Parlay Tracker Application
class ParlayTracker {
    // Static constants for localStorage keys and undo history limit
    static MAX_UNDO_HISTORY = 10;
    static STORAGE_KEYS = {
        PARLAYS: 'parlays',
        SUCCESS_CALC_METHOD: 'successCalcMethod',
        THEME: 'theme',
        DATE_FILTER_FROM: 'dateFilterFrom',
        DATE_FILTER_TO: 'dateFilterTo',
        TIMELINE_SUMMARY_TEXT: 'timelineSummaryText',
        HAS_VISITED_BEFORE: 'hasVisitedBefore' // Key for welcome modal dismissal
        // Removed ADVANCED_FIELDS_VISIBLE from here, as it will not be persisted
    };

    // Replace with your actual email address
    static FEEDBACK_EMAIL = '4ayaw55@gmail.com'; 

    constructor() {
        this.parlays = [];
        this.currentSuccessCalcMethod = 'parlays';
        this.editingIndex = -1;
        this.undoStack = [];
        this.playerPropCounter = 0; // New counter for unique IDs of player prop rows
        this.advancedFieldsVisible = false; // Always start as false (hidden)

        // Date filtering properties
        this.filterFromDate = '';
        this.filterToDate = '';
        this.currentTimelineSummaryText = 'All Time'; // Default text for timeline summary

        // Initialize all element properties to null initially for safety
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
        this.toggleAdvancedDetailsBtn = null; // Reference for the new button

        // Error span references
        this.dateErrorSpan = null;
        this.amountWageredErrorSpan = null;
        this.amountWonLossErrorSpan = null;
        this.individualBetsErrorSpan = null;

        this.parlaySectionDetails = null;
        this.parlayFormSummary = null;

        this.pendingAction = null; // To store action details for confirmation modal

        // Date filter elements
        this.timelineDetails = null;
        this.currentTimelineDisplay = null;
        this.filterFromDateInput = null;
        this.filterToDateInput = null;
        this.filterLast7DaysBtn = null;
        this.filterLast30DaysBtn = null;
        this.clearDateFilterBtn = null;
        this.dateFilterError = null;

        // Import/Export Elements
        this.importDataBtn = null;
        this.exportCsvBtn = null;
        this.exportJsonBtn = null;
        this.importFileInput = null;

        // Consent buttons for welcome modal
        this.keepLocalBtn = null;
        this.participateBtn = null;

        // Feedback Chatbox Elements
        this.feedbackChatbox = null;
        this.openChatBtn = null;
        this.chatFormContainer = null;
        this.closeChatBtn = null;
        this.feedbackForm = null;
        this.feedbackMessageInput = null;
        this.sendFeedbackBtn = null;

        // New: Individual Bet Details Modal elements
        this.individualBetDetailsModal = null;
        this.individualBetDetailsTitle = null;
        this.individualBetsList = null;
        this.closeIndividualBetDetailsModalBtn = null;

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
        // Map of property names to their HTML element IDs
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
            toggleAdvancedDetailsBtn: 'toggleAdvancedDetailsBtn', // New element reference
            timelineDetails: 'timelineDetails',
            currentTimelineDisplay: 'currentTimelineDisplay',
            filterFromDateInput: 'filterFromDate',
            filterToDateInput: 'filterToDate',
            filterLast7DaysBtn: 'filterLast7Days',
            filterLast30DaysBtn: 'filterLast30Days',
            clearDateFilterBtn: 'clearDateFilterBtn',
            dateFilterError: 'dateFilterError',
            importDataBtn: 'importDataBtn',
            exportCsvBtn: 'exportCsvBtn',
            exportJsonBtn: 'exportJsonBtn',
            importFileInput: 'importFileInput',
            keepLocalBtn: 'keepLocalBtn',
            participateBtn: 'participateBtn',
            // New feedback chatbox elements
            feedbackChatbox: 'feedbackChatbox',
            openChatBtn: 'openChatBtn',
            chatFormContainer: 'chatFormContainer',
            closeChatBtn: 'closeChatBtn',
            feedbackForm: 'feedbackForm',
            feedbackMessageInput: 'feedbackMessage',
            sendFeedbackBtn: 'sendFeedbackBtn',
            // New: Individual Bet Details Modal elements
            individualBetDetailsModal: 'individualBetDetailsModal',
            individualBetDetailsTitle: 'individualBetDetailsTitle',
            individualBetsList: 'individualBetsList',
            closeIndividualBetDetailsModalBtn: 'closeIndividualBetDetailsModalBtn'
        };

        // Iterate through the map to get element references and log errors if not found
        Object.entries(elementsMap).forEach(([propertyName, id]) => {
            const element = document.getElementById(id);
            if (element) {
                this[propertyName] = element;
                // console.log(`Element found: ${propertyName} (${id})`); // Uncomment for detailed debugging
            } else {
                console.error(`ERROR: Element with ID '${id}' for property '${propertyName}' not found. Functionality relying on this element may be broken.`);
                this[propertyName] = null; // Explicitly set to null if not found
            }
        });

        // Specific handling for error message spans
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
                // console.log(`Error Span found: ${propertyName} (${id})`); // Uncomment for detailed debugging
            } else {
                console.warn(`WARNING: Error span with ID '${id}' for property '${propertyName}' not found. Validation messages may not display.`);
                this[propertyName] = null;
            }
        });

        // Special query for elements not having an ID directly
        this.parlaySectionDetails = document.querySelector('details.parlay-section');
        if (this.parlaySectionDetails) {
            this.parlayFormSummary = this.parlaySectionDetails.querySelector('summary');
            if (!this.parlayFormSummary) {
                console.error("ERROR: Summary element within '.parlay-section' not found. Form toggle may not function.");
            }
        } else {
            console.error("ERROR: Element with class 'details.parlay-section' not found. Add New Parlay section may not function.");
        }
    }

    // Attach all event listeners to their respective DOM elements
    attachEventListeners() {
        if (this.amountWageredInput) {
            this.amountWageredInput.addEventListener('focus', this.handleInputFocus.bind(this));
            this.amountWageredInput.addEventListener('input', (e) => {
                this.sanitizeMoneyInput(e);
                this.updateWonLossBasedOnResult(); // Update won/loss as wagered changes
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

        // Welcome modal buttons now just close the modal (participation logic would go here if using Firebase)
        if (this.keepLocalBtn) {
            this.keepLocalBtn.addEventListener('click', this.closeWelcomeModal.bind(this));
        }
        if (this.participateBtn) {
            // For now, this also just closes the modal.
            // When integrating Firebase, this button would trigger authentication/data sync.
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
        
        // New: Toggle Advanced Details button
        if (this.toggleAdvancedDetailsBtn) {
            this.toggleAdvancedDetailsBtn.addEventListener('click', () => this.toggleAdvancedBetDetails());
        } else {
            console.warn("Toggle Advanced Details button not found.");
        }


        // Global keyboard shortcuts (e.g., Ctrl+Z for undo)
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Event listener for <details> element to toggle aria-expanded attribute
        if (this.parlaySectionDetails && this.parlayFormSummary) {
            this.parlaySectionDetails.addEventListener('toggle', () => {
                this.parlayFormSummary.setAttribute('aria-expanded', this.parlaySectionDetails.open);
            });
        }

        // Event delegation for dynamically added/removed elements (Edit/Delete buttons, Card toggles)
        document.body.addEventListener('click', (event) => {
            const target = event.target;
            // Edit button click
            if (target.closest('.edit-parlay-btn')) {
                const button = target.closest('.edit-parlay-btn');
                const index = parseInt(button.dataset.index);
                if (!isNaN(index)) {
                    this.editParlay(index);
                }
            // Delete button click
            } else if (target.closest('.delete-parlay-btn')) {
                const button = target.closest('.delete-parlay-btn');
                const index = parseInt(button.dataset.index);
                if (!isNaN(index)) {
                    this.promptDeleteParlay(index);
                }
            // Mobile card summary toggle click
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
            // New: View Individual Bets Details button click
            else if (target.closest('.view-individual-bets-btn')) {
                const button = target.closest('.view-individual-bets-btn');
                const index = parseInt(button.dataset.index);
                if (!isNaN(index)) {
                    this.showIndividualBetDetailsModal(index);
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

        // Feedback chatbox event listeners
        if (this.openChatBtn) {
            this.openChatBtn.addEventListener('click', this.toggleFeedbackChatbox.bind(this));
        }
        if (this.closeChatBtn) {
            this.closeChatBtn.addEventListener('click', this.toggleFeedbackChatbox.bind(this));
        }
        if (this.feedbackForm) {
            this.feedbackForm.addEventListener('submit', this.sendFeedback.bind(this));
        }

        // New: Close Individual Bet Details Modal button
        if (this.closeIndividualBetDetailsModalBtn) {
            this.closeIndividualBetDetailsModalBtn.addEventListener('click', this.hideIndividualBetDetailsModal.bind(this));
        }
    }

    // Load data from localStorage on app initialization
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
            this.parlays = []; // Reset parlays if loading fails to prevent broken state
        }
    }

    // Save current application data to localStorage
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

    // Save the current state of parlays to the undo stack
    saveStateForUndo() {
        const currentState = {
            parlays: JSON.parse(JSON.stringify(this.parlays)), // Deep copy to prevent reference issues
        };
        this.undoStack.push(currentState);
        // Trim undo stack to max history limit
        if (this.undoStack.length > ParlayTracker.MAX_UNDO_HISTORY) {
            this.undoStack.shift(); // Remove the oldest state
        }
        console.log(`State saved for undo. Stack size: ${this.undoStack.length}`);
    }

    // Handles focus event on money input fields, selecting text if value is '0.00' or '0'
    handleInputFocus(event) {
        if (event.target && (event.target.value === '0.00' || event.target.value === '0')) {
            event.target.select();
        }
    }

    // Sanitizes money input to allow only numbers, one decimal, and optional leading minus sign for won/loss
    sanitizeMoneyInput(event) {
        const input = event.target;
        if (!input) return;
        const originalValue = input.value;
        let cleanedValue = originalValue.replace(/[^0-9.-]/g, '');

        // Handle multiple decimal points
        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            cleanedValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // Handle multiple minus signs or minus sign not at the beginning
        if (cleanedValue.indexOf('-') > 0) {
            cleanedValue = cleanedValue.replace(/-/g, '');
        }
        // Ensure minus sign is only at the beginning for amountWonLoss
        if (input.id === 'amountWonLoss' && originalValue.startsWith('-') && !cleanedValue.startsWith('-')) {
            cleanedValue = '-' + cleanedValue;
        } else if (input.id !== 'amountWonLoss' && cleanedValue.startsWith('-')) {
            // For other inputs (e.g., amountWagered), remove leading minus
            cleanedValue = cleanedValue.substring(1);
        }

        // Update input value and maintain cursor position if value changed
        if (originalValue !== cleanedValue) {
            const cursorPosition = input.selectionStart;
            input.value = cleanedValue;
            // Restore cursor position after value update
            if (input.setSelectionRange) {
                input.setSelectionRange(cursorPosition, cursorPosition);
            }
        }
    }

    // Formats money input to two decimal places on blur (when input loses focus)
    formatCurrencyOnBlur(event) {
        const input = event.target;
        if (!input) return;
        const value = input.value.trim();
        if (value === '') {
            input.value = ''; // Keep empty if cleared
            return;
        }
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            input.value = ''; // Clear if invalid number
            return;
        }
        input.value = numericValue.toFixed(2); // Format to two decimal places
    }

    // Updates the 'Amount Won/Loss' input based on the selected 'Parlay Result'
    // If 'Loss' or 'Push', auto-calculates based on 'Amount Wagered'.
    updateWonLossBasedOnResult() {
        if (!this.resultInput || !this.amountWageredInput || !this.amountWonLossInput) {
            console.error("One or more required input elements for updateWonLossBasedOnResult are missing.");
            return;
        }
        const parlayResult = this.resultInput.value;
        const wageredValue = parseFloat(this.amountWageredInput.value || '0');
        const wonLossInput = this.amountWonLossInput;

        // Reset any previous manual input/placeholder
        wonLossInput.readOnly = false; // Allow editing for 'Win'
        wonLossInput.classList.remove('bg-gray-200', 'text-gray-500'); // Remove disabled styling

        if (parlayResult === 'Win') {
            wonLossInput.placeholder = "Enter win amount";
        } else if (parlayResult === 'Loss') {
            wonLossInput.value = (-Math.abs(wageredValue)).toFixed(2); // Set to negative wagered amount
            wonLossInput.placeholder = "Auto-calculated";
            wonLossInput.readOnly = true; // Make read-only for 'Loss'
            wonLossInput.classList.add('bg-gray-200', 'text-gray-500'); // Add disabled styling
        } else if (parlayResult === 'Push') {
            wonLossInput.value = '0.00'; // Set to 0.00 for 'Push'
            wonLossInput.placeholder = "Auto-calculated";
            wonLossInput.readOnly = true; // Make read-only for 'Push'
            wonLossInput.classList.add('bg-gray-200', 'text-gray-500'); // Add disabled styling
        }
    }

    // Displays a validation error message below an input field
    showValidationError(element, message, errorSpan) {
        if (element) {
            element.classList.add('border-red-500', 'ring-red-500');
        }
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden');
        }
    }

    // Clears validation error messages and styling from an input field
    clearValidationError(element, errorSpan) {
        if (element) {
            element.classList.remove('border-red-500', 'ring-red-500');
        }
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.add('hidden');
        }
    }

    // Clears all validation error messages across the form
    clearAllValidationErrors() {
        this.clearValidationError(this.dateInput, this.dateErrorSpan);
        this.clearValidationError(this.amountWageredInput, this.amountWageredErrorSpan);
        this.clearValidationError(this.amountWonLossInput, this.amountWonLossErrorSpan);
        this.clearValidationError(null, this.individualBetsErrorSpan); // Individual bets error doesn't have an associated input
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError);
    }

    /**
     * Sets or toggles the visibility of advanced input fields (Sport, League, Prop Category)
     * and simultaneously hides/shows basic fields within individual player/team bet rows.
     * @param {boolean|null} show - If true, shows advanced and hides basic fields.
     * If false, hides advanced and shows basic fields.
     * If null (default), toggles current visibility.
     */
    toggleAdvancedBetDetails(show = null) {
        if (show !== null) {
            this.advancedFieldsVisible = show;
        } else {
            this.advancedFieldsVisible = !this.advancedFieldsVisible;
        }

        // Update button text and icon
        if (this.toggleAdvancedDetailsBtn) {
            const icon = this.toggleAdvancedDetailsBtn.querySelector('i');
            const textSpan = this.toggleAdvancedDetailsBtn.querySelector('span');
            if (this.advancedFieldsVisible) {
                icon.className = 'fas fa-minus mr-1';
                textSpan.textContent = 'Hide Details';
            } else {
                icon.className = 'fas fa-plus mr-1';
                textSpan.textContent = 'More Details';
            }
        }

        // Apply visibility to currently rendered rows
        if (this.playerPropInputsContainer) {
            const currentRows = this.playerPropInputsContainer.querySelectorAll('.player-prop-row');
            currentRows.forEach(row => {
                const basicContainer = row.querySelector('.basic-fields-container');
                const advancedContainer = row.querySelector('.advanced-fields-container');

                if (basicContainer) {
                    if (this.advancedFieldsVisible) {
                        basicContainer.classList.add('hidden'); // Hide basic fields
                    } else {
                        basicContainer.classList.remove('hidden'); // Show basic fields
                    }
                }
                if (advancedContainer) {
                    if (this.advancedFieldsVisible) {
                        advancedContainer.classList.remove('hidden'); // Show advanced fields
                    } else {
                        advancedContainer.classList.add('hidden'); // Hide advanced fields
                    }
                }
            });
        }
    }

    // Adds a new row for individual player/team bet input
    addPlayerPropRow(player = '', prop = '', result = 'Win', sport = '', league = '', propCategory = '') {
        if (!this.playerPropInputsContainer) {
            console.error("Player prop inputs container not found. Cannot add player prop row.");
            return;
        }
        
        const uniqueId = `player-prop-${this.playerPropCounter++}`;

        // Create the main row div
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('player-prop-row', 'flex', 'items-center', 'gap-3', 'p-3', 'bg-gray-50', 'rounded-md', 'shadow-sm', 'mb-3', 'fade-in');

        // Create the flex-grow container for inputs
        const inputsContainer = document.createElement('div');
        inputsContainer.classList.add('flex-grow', 'flex', 'items-center', 'gap-3');

        // Create Basic Fields Container
        const basicFieldsContainer = document.createElement('div');
        basicFieldsContainer.classList.add('flex', 'flex-grow', 'items-center', 'gap-3', 'basic-fields-container');
        if (this.advancedFieldsVisible) {
            basicFieldsContainer.classList.add('hidden');
        }

        // Player/Team Name Input
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('flex-grow');
        const playerLabel = document.createElement('label');
        playerLabel.htmlFor = `${uniqueId}-player`;
        playerLabel.classList.add('sr-only');
        playerLabel.textContent = 'Player/Team Name';
        const playerInput = document.createElement('input');
        playerInput.type = 'text';
        playerInput.id = `${uniqueId}-player`;
        playerInput.placeholder = 'Player/Team Name (e.g., LeBron James)';
        playerInput.value = player;
        playerInput.classList.add('player-name', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent', 'text-sm', 'bg-white', 'text-gray-800');
        playerInput.required = true;
        playerDiv.appendChild(playerLabel);
        playerDiv.appendChild(playerInput);
        basicFieldsContainer.appendChild(playerDiv);

        // Prop Type Input
        const propDiv = document.createElement('div');
        propDiv.classList.add('flex-grow');
        const propLabel = document.createElement('label');
        propLabel.htmlFor = `${uniqueId}-prop`;
        propLabel.classList.add('sr-only');
        propLabel.textContent = 'Prop Type';
        const propInput = document.createElement('input');
        propInput.type = 'text';
        propInput.id = `${uniqueId}-prop`;
        propInput.placeholder = 'Prop Type (e.g., Over 25.5 Pts)';
        propInput.value = prop;
        propInput.classList.add('prop-type', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent', 'text-sm', 'bg-white', 'text-gray-800');
        propInput.required = true;
        propDiv.appendChild(propLabel);
        propDiv.appendChild(propInput);
        basicFieldsContainer.appendChild(propDiv);

        // Prop Result Select
        const propResultDiv = document.createElement('div');
        propResultDiv.classList.add('flex-grow');
        const propResultLabel = document.createElement('label');
        propResultLabel.htmlFor = `${uniqueId}-result`;
        propResultLabel.classList.add('sr-only');
        propResultLabel.textContent = 'Prop Result';
        const propResultSelect = document.createElement('select');
        propResultSelect.id = `${uniqueId}-result`;
        propResultSelect.classList.add('prop-result', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent', 'text-sm', 'bg-white', 'text-gray-800');
        ['Win', 'Loss', 'Push'].forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            if (optionText === result) {
                option.selected = true;
            }
            propResultSelect.appendChild(option);
        });
        propResultDiv.appendChild(propResultLabel);
        propResultDiv.appendChild(propResultSelect);
        basicFieldsContainer.appendChild(propResultDiv);
        inputsContainer.appendChild(basicFieldsContainer);


        // Create Advanced Fields Container
        const advancedFieldsContainer = document.createElement('div');
        advancedFieldsContainer.classList.add('flex', 'flex-grow', 'items-center', 'gap-3', 'advanced-fields-container');
        if (!this.advancedFieldsVisible) {
            advancedFieldsContainer.classList.add('hidden');
        }

        // Sport Input
        const sportDiv = document.createElement('div');
        sportDiv.classList.add('flex-grow');
        const sportLabel = document.createElement('label');
        sportLabel.htmlFor = `${uniqueId}-sport`;
        sportLabel.classList.add('sr-only');
        sportLabel.textContent = 'Sport';
        const sportInput = document.createElement('input');
        sportInput.type = 'text';
        sportInput.id = `${uniqueId}-sport`;
        sportInput.placeholder = 'Sport (e.g., NBA)';
        sportInput.value = sport;
        sportInput.classList.add('sport-input', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent', 'text-sm', 'bg-white', 'text-gray-800');
        sportDiv.appendChild(sportLabel);
        sportDiv.appendChild(sportInput);
        advancedFieldsContainer.appendChild(sportDiv);

        // League Input
        const leagueDiv = document.createElement('div');
        leagueDiv.classList.add('flex-grow');
        const leagueLabel = document.createElement('label');
        leagueLabel.htmlFor = `${uniqueId}-league`;
        leagueLabel.classList.add('sr-only');
        leagueLabel.textContent = 'League';
        const leagueInput = document.createElement('input');
        leagueInput.type = 'text';
        leagueInput.id = `${uniqueId}-league`;
        leagueInput.placeholder = 'League (e.g., EuroLeague)';
        leagueInput.value = league;
        leagueInput.classList.add('league-input', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent', 'text-sm', 'bg-white', 'text-gray-800');
        leagueDiv.appendChild(leagueLabel);
        leagueDiv.appendChild(leagueInput);
        advancedFieldsContainer.appendChild(leagueDiv);

        // Prop Category Input
        const propCategoryDiv = document.createElement('div');
        propCategoryDiv.classList.add('flex-grow');
        const propCategoryLabel = document.createElement('label');
        propCategoryLabel.htmlFor = `${uniqueId}-prop-category`;
        propCategoryLabel.classList.add('sr-only');
        propCategoryLabel.textContent = 'Prop Category';
        const propCategoryInput = document.createElement('input');
        propCategoryInput.type = 'text';
        propCategoryInput.id = `${uniqueId}-prop-category`;
        propCategoryInput.placeholder = 'Category (e.g., Points)';
        propCategoryInput.value = propCategory;
        propCategoryInput.classList.add('prop-category-input', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent', 'text-sm', 'bg-white', 'text-gray-800');
        propCategoryDiv.appendChild(propCategoryLabel);
        propCategoryDiv.appendChild(propCategoryInput);
        advancedFieldsContainer.appendChild(propCategoryDiv);
        inputsContainer.appendChild(advancedFieldsContainer);

        // Create Remove Button
        const removeBtnWrapper = document.createElement('div');
        removeBtnWrapper.classList.add('flex-shrink-0', 'ml-auto');
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.classList.add('remove-prop-btn', 'text-red-500', 'hover:text-red-700', 'p-2', 'rounded-full', 'transition-colors', 'duration-200');
        removeButton.setAttribute('aria-label', 'Remove this player prop bet');
        const removeIcon = document.createElement('i');
        removeIcon.classList.add('fas', 'fa-times-circle', 'text-xl');
        removeButton.appendChild(removeIcon);
        removeBtnWrapper.appendChild(removeButton);

        // Append all parts to the main row div
        rowDiv.appendChild(inputsContainer);
        rowDiv.appendChild(removeBtnWrapper);

        // Append the complete row to the container
        this.playerPropInputsContainer.appendChild(rowDiv);

        // Attach event listener to the newly created remove button
        removeButton.addEventListener('click', () => {
            // Add the 'removing' class to trigger the fadeOut animation
            rowDiv.classList.add('removing');
            // Listen for the animation to end, then remove the element from the DOM
            rowDiv.addEventListener('animationend', () => {
                rowDiv.remove();
            }, { once: true });
        });
    }

    // Clears all dynamically added player prop input rows
    clearPlayerPropRows() {
        if (this.playerPropInputsContainer) {
            this.playerPropInputsContainer.innerHTML = '';
            this.playerPropCounter = 0; // Reset counter when clearing all rows
            console.log('Cleared player prop rows.');
        }
    }

    // Handles the form submission for adding or updating a parlay entry
    handleFormSubmit(event) {
        event.preventDefault(); // Prevent default form submission behavior
        this.clearAllValidationErrors(); // Clear existing validation errors

        let isValid = true; // Flag to track overall form validity

        // Get values from form inputs
        const date = this.dateInput ? this.dateInput.value : '';
        const amountWagered = this.amountWageredInput ? parseFloat(this.amountWageredInput.value || '0') : 0;
        const amountWonLoss = this.amountWonLossInput ? parseFloat(this.amountWonLossInput.value || '0') : 0;
        const result = this.resultInput ? this.resultInput.value : '';
        const playType = this.playTypeInput ? this.playTypeInput.value : '';

        // Perform validation checks
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

        // Validate individual bets
        const individualBets = [];
        if (this.playerPropInputsContainer) {
            const playerPropRows = this.playerPropInputsContainer.querySelectorAll('.player-prop-row');
            let allPropsValid = true;
            playerPropRows.forEach(row => {
                // Determine which set of fields is currently visible to extract data from
                const basicContainer = row.querySelector('.basic-fields-container');
                const advancedContainer = row.querySelector('.advanced-fields-container');

                let playerVal = '';
                let propVal = '';
                let propResultVal = 'Win'; // Default

                let sportVal = '';
                let leagueVal = '';
                let propCategoryVal = '';

                // Always attempt to get values from both, as they might have been filled
                // and then the view toggled. We prioritize the *potentially* filled basic
                // fields for required data.
                const playerInput = row.querySelector('.player-name');
                const propInput = row.querySelector('.prop-type');
                const propResultInput = row.querySelector('.prop-result');
                const sportInput = row.querySelector('.sport-input');
                const leagueInput = row.querySelector('.league-input');
                const propCategoryInput = row.querySelector('.prop-category-input');
                
                playerVal = playerInput ? playerInput.value.trim() : '';
                propVal = propInput ? propInput.value.trim() : '';
                propResultVal = propResultInput ? propResultInput.value : 'Win';
                sportVal = sportInput ? sportInput.value.trim() : '';
                leagueVal = leagueInput ? leagueInput.value.trim() : '';
                propCategoryVal = propCategoryInput ? propCategoryInput.value.trim() : '';

                // Basic required fields are always required, regardless of advanced fields visibility
                if (!playerVal || !propVal) {
                    allPropsValid = false;
                }

                individualBets.push({
                    player: playerVal,
                    prop: propVal,
                    result: propResultVal,
                    sport: sportVal,
                    league: leagueVal,
                    propCategory: propCategoryVal
                });
            });

            // Show error if any individual bet fields are empty but rows exist
            if (!allPropsValid && playerPropRows.length > 0) {
                this.showValidationError(null, 'Fill all Player/Team & Prop Type fields in individual bets.', this.individualBetsErrorSpan);
                isValid = false;
            }
        }

        // If form is not valid, scroll to the first error and stop submission
        if (!isValid) {
            const firstErrorElement = document.querySelector('.text-red-500:not(.hidden)');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        this.saveStateForUndo(); // Save current state for undo functionality

        const newParlay = {
            date,
            result,
            playType,
            amountWagered,
            amountWonLoss,
            individualBets
        };

        // Add or update parlay based on editingIndex
        if (this.editingIndex > -1) {
            this.parlays[this.editingIndex] = newParlay; // Update existing entry
            this.editingIndex = -1; // Reset editing index
            if (this.submitBtn) {
                this.submitBtn.textContent = 'Add Parlay Entry'; // Reset button text
            }
        } else {
            this.parlays.unshift(newParlay); // Add new entry to the beginning of the array
        }

        this.saveData(); // Save updated parlays to localStorage
        this.resetForm(); // Reset form fields and close details
        this.applyPresetFilter('clear'); // Clear any date filters after successful submission
        this.renderParlays(); // Re-render table/cards with new data and cleared filters
        this.updateSummary(); // Update summary statistics
    }

    // Resets the parlay form to its initial state
    resetForm() {
        console.log('Resetting form...');
        if (this.parlayForm) {
            this.parlayForm.reset();
        }

        // Clear specific input values and reset placeholders
        if (this.amountWageredInput) {
            this.amountWageredInput.value = '';
        }
        if (this.amountWonLossInput) {
            this.amountWonLossInput.value = '';
            this.amountWonLossInput.placeholder = '0.00';
            this.amountWonLossInput.readOnly = false; // Ensure it's editable after reset
            this.amountWonLossInput.classList.remove('bg-gray-200', 'text-gray-500'); // Remove disabled styling
        }
        if (this.dateInput) {
            // Set date input to today's date
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            this.dateInput.value = `${year}-${month}-${day}`;
        }

        this.clearPlayerPropRows(); // Remove all existing player prop rows
        this.addPlayerPropRow(); // Add a single default player prop row
        console.log('Added initial player prop row.');
        
        this.editingIndex = -1; // Reset editing mode
        if (this.submitBtn) {
            this.submitBtn.textContent = 'Add Parlay Entry'; // Reset submit button text
        }
        if (this.parlaySectionDetails) {
            this.parlaySectionDetails.open = false; // Close the "Add New Parlay" section
        }
        this.clearAllValidationErrors(); // Clear any remaining validation errors
        this.toggleAdvancedBetDetails(false); // Explicitly hide advanced details on form reset
    }

    // Populates the form with data from a selected parlay for editing
    editParlay(index) {
        const parlay = this.parlays[index];
        if (!parlay) return; // Exit if parlay not found

        this.clearAllValidationErrors(); // Clear validation errors before editing
        this.editingIndex = index; // Set the index of the parlay being edited

        // Populate form fields with parlay data
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
            // Ensure proper readOnly/styling if result is Loss/Push for the edited parlay
            this.updateWonLossBasedOnResult(); 
        }

        this.clearPlayerPropRows(); // Clear existing player prop rows
        // Add player prop rows based on the individual bets in the parlay
        let hasAdvancedData = parlay.individualBets.some(bet => bet.sport || bet.league || bet.propCategory);

        parlay.individualBets.forEach(bet => {
            this.addPlayerPropRow(
                bet.player,
                bet.prop,
                bet.result,
                bet.sport, // Pass sport
                bet.league, // Pass league
                bet.propCategory // Pass propCategory
            );
        });

        // Set visibility of advanced details for the form based on whether any edited bet has advanced data
        this.toggleAdvancedBetDetails(hasAdvancedData);

        if (this.submitBtn) {
            this.submitBtn.textContent = 'Update Parlay Entry'; // Change button text to "Update"
        }
        if (this.parlaySectionDetails) {
            this.parlaySectionDetails.open = true; // Open the "Add New Parlay" section
        }
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top of the page
    }

    // Prompts the user for confirmation before clearing all parlay entries
    promptClearAll() {
        this.pendingAction = { type: 'clear' };
        this.showConfirmationModal('Confirm Clear All', 'Are you sure you want to clear all parlay entries? This action cannot be undone.');
    }

    // Prompts the user for confirmation before deleting a specific parlay entry
    promptDeleteParlay(index) {
        this.pendingAction = { type: 'delete', index: index };
        this.showConfirmationModal('Confirm Delete', 'Are you sure you want to delete this parlay entry? This action cannot be undone.');
    }

    /**
     * Handles the selection of a file for import.
     * Reads the file content and prompts for confirmation before importing.
     * @param {Event} event - The change event from the file input.
     */
    handleImportFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            return; // No file selected
        }

        if (file.type !== 'application/json') {
            this.showInfoModal('Invalid File Type', 'Please select a JSON file.');
            event.target.value = ''; // Clear the input field to allow re-selection
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                // Basic validation: Check if it's an array and contains expected properties
                if (!Array.isArray(importedData) || !importedData.every(item => 'date' in item && 'amountWagered' in item && 'individualBets' in item)) {
                    this.showInfoModal('Invalid Data Format', 'The JSON file does not appear to contain valid parlay data. Please ensure it follows the expected structure (array of objects with "date", "amountWagered", "individualBets" at minimum).');
                    event.target.value = '';
                    return;
                }

                this.pendingAction = { type: 'import', data: importedData };
                this.showConfirmationModal(
                    'Confirm Data Import',
                    'Importing data will REPLACE all your current parlay entries. Are you sure you want to proceed?',
                    'confirm'
                );
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                this.showInfoModal('File Read Error', 'Could not read the JSON file. It might be corrupted or not valid JSON.');
            } finally {
                event.target.value = ''; // Clear the input after processing to allow re-importing the same file
            }
        };
        reader.readAsText(file); // Read the file as text
    }

    /**
     * Executes the import of parlay data.
     * Replaces existing data with imported data and updates the UI.
     * @param {Array} data - The array of parlay objects to import.
     */
    executeImportParlayData(data) {
        this.saveStateForUndo(); // Save current state before overwriting
        this.parlays = data; // Replace existing parlays with imported data
        this.saveData(); // Persist the new data to localStorage
        this.renderParlays(); // Re-render the history table/cards
        this.updateSummary(); // Update summary statistics
        this.resetForm(); // Reset the form
        this.showInfoModal('Import Successful', 'Parlay data has been successfully imported and replaced your existing data.');
    }

    /**
     * Exports the current parlay data as a CSV file.
     * Includes headers for main parlay details and up to 5 individual bets.
     */
    exportParlayDataAsCsv() {
        if (this.parlays.length === 0) {
            this.showInfoModal('No Data to Export', 'There is no parlay data to export yet. Add some entries first!');
            return;
        }

        // Define CSV headers
        const headers = [
            "Date", "Result", "Play Type", "Amount Wagered", "Amount Won/Loss",
            // Dynamic headers for individual bets
            "Individual Bet 1 Player", "Individual Bet 1 Prop", "Individual Bet 1 Result", "Individual Bet 1 Sport", "Individual Bet 1 League", "Individual Bet 1 Prop Category", // New
            "Individual Bet 2 Player", "Individual Bet 2 Prop", "Individual Bet 2 Result", "Individual Bet 2 Sport", "Individual Bet 2 League", "Individual Bet 2 Prop Category", // New
            "Individual Bet 3 Player", "Individual Bet 3 Prop", "Individual Bet 3 Result", "Individual Bet 3 Sport", "Individual Bet 3 League", "Individual Bet 3 Prop Category", // New
            "Individual Bet 4 Player", "Individual Bet 4 Prop", "Individual Bet 4 Result", "Individual Bet 4 Sport", "Individual Bet 4 League", "Individual Bet 4 Prop Category", // New
            "Individual Bet 5 Player", "Individual Bet 5 Prop", "Individual Bet 5 Result", "Individual Bet 5 Sport", "Individual Bet 5 League", "Individual Bet 5 Prop Category"  // New
        ]; // Max 5 individual bets to keep headers reasonable

        let csvContent = headers.join(',') + '\n'; // Start CSV string with headers

        this.parlays.forEach(parlay => {
            let row = [
                parlay.date,
                parlay.result,
                parlay.playType,
                parlay.amountWagered.toFixed(2), // Format to 2 decimal places
                parlay.amountWonLoss.toFixed(2) // Format to 2 decimal places
            ];

            // Add individual bets dynamically, up to the defined max (5)
            for (let i = 0; i < 5; i++) {
                const bet = parlay.individualBets[i];
                if (bet) {
                    // Escape commas and double quotes within string fields for CSV safety
                    row.push(`"${bet.player.replace(/"/g, '""')}"`);
                    row.push(`"${bet.prop.replace(/"/g, '""')}"`);
                    row.push(`"${bet.result.replace(/"/g, '""')}"`);
                    row.push(`"${(bet.sport || '').replace(/"/g, '""')}"`); // New: add sport (empty string if undefined)
                    row.push(`"${(bet.league || '').replace(/"/g, '""')}"`); // New: add league (empty string if undefined)
                    row.push(`"${(bet.propCategory || '').replace(/"/g, '""')}"`); // New: add propCategory (empty string if undefined)
                } else {
                    row.push('', '', '', '', '', ''); // Add empty columns for missing bets (3 original + 3 new)
                }
            }
            csvContent += row.join(',') + '\n'; // Add row to CSV content
        });

        // Create Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'parlay_history.csv'; // Set download file name
        document.body.appendChild(a);
        a.click(); // Programmatically click the link to trigger download
        document.body.removeChild(a); // Clean up the temporary link
        URL.revokeObjectURL(url); // Release the object URL
        this.showInfoModal('Export Successful', 'Your parlay data has been exported as "parlay_history.csv". You can now import this file into Google Sheets.');
    }

    /**
     * Exports the current parlay data as a JSON file.
     */
    exportParlayDataAsJson() {
        if (this.parlays.length === 0) {
            this.showInfoModal('No Data to Export', 'There is no parlay data to export yet. Add some entries first!');
            return;
        }

        const dataStr = JSON.stringify(this.parlays, null, 2); // Pretty print JSON with 2-space indentation

        // Create Blob and download link
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'parlay_history.json'; // Set download file name
        document.body.appendChild(a);
        a.click(); // Programmatically click the link to trigger download
        document.body.removeChild(a); // Clean up the temporary link
        URL.revokeObjectURL(url); // Release the object URL
        this.showInfoModal('Export Successful', 'Your parlay data has been exported as "parlay_history.json".');
    }

    /**
     * Displays a confirmation or info modal.
     * @param {string} title - The title of the modal.
     * @param {string} message - The message content of the modal.
     * @param {'confirm'|'info'} type - The type of modal ('confirm' for two buttons, 'info' for one 'OK' button).
     */
    showConfirmationModal(title, message, type = 'confirm') {
        if (!this.confirmationModal || !this.confirmationModalTitle || !this.confirmationModalMessage) {
            console.error("Confirmation modal elements not found. Cannot show modal.");
            return;
        }
        this.confirmationModalTitle.textContent = title;
        this.confirmationModalMessage.textContent = message;

        // Adjust buttons and styling based on modal type
        if (type === 'info') {
            if (this.cancelClearBtn) this.cancelClearBtn.classList.add('hidden');
            if (this.confirmClearBtn) {
                this.confirmClearBtn.textContent = 'OK';
                this.confirmClearBtn.classList.remove('bg-red-500', 'hover:bg-red-600'); // Remove red styling
                this.confirmClearBtn.classList.add('bg-blue-600', 'hover:bg-blue-700'); // Add blue styling
            }
        } else { // 'confirm' type
            if (this.cancelClearBtn) this.cancelClearBtn.classList.remove('hidden');
            if (this.confirmClearBtn) {
                this.confirmClearBtn.textContent = 'Confirm';
                this.confirmClearBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700'); // Remove blue styling
                this.confirmClearBtn.classList.add('bg-red-500', 'hover:bg-red-600'); // Add red styling
            }
        }

        // Show the modal with a slight delay to allow CSS transitions
        this.confirmationModal.classList.remove('hidden');
        setTimeout(() => {
            this.confirmationModal.classList.add('show');
        }, 10);
        this.confirmClearBtn?.focus(); // Focus the confirm button for accessibility
    }

    // Displays an informational modal (a confirmation modal with only an 'OK' button)
    showInfoModal(title, message) {
        this.pendingAction = { type: 'info' }; // Set pending action type to info
        this.showConfirmationModal(title, message, 'info');
    }

    // Hides the confirmation modal with a transition
    hideConfirmationModal() {
        if (!this.confirmationModal) return;

        this.confirmationModal.classList.remove('show'); // Trigger fade-out transition
        // Listen for transition end to fully hide the modal
        this.confirmationModal.addEventListener('transitionend', () => {
            this.confirmationModal.classList.add('hidden'); // Fully hide after transition
            // Reset button states for future confirmations
            if (this.cancelClearBtn) this.cancelClearBtn.classList.remove('hidden');
            if (this.confirmClearBtn) {
                this.confirmClearBtn.textContent = 'Confirm';
                this.confirmClearBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                this.confirmClearBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            }
            this.pendingAction = null; // Clear pending action
        }, { once: true }); // Ensure the listener is removed after it fires
    }

    // Handles the click event on the modal's confirm button, executing the pending action
    handleConfirmationClick() {
        const action = this.pendingAction;
        this.hideConfirmationModal(); // Hide modal first

        // Add a slight delay to allow modal to hide visually before executing the action
        setTimeout(() => {
            if (action) {
                if (action.type === 'clear') {
                    this.executeClearAllParlays();
                } else if (action.type === 'delete' && typeof action.index === 'number') {
                    this.executeDeleteParlay(action.index);
                } else if (action.type === 'import' && action.data) {
                    this.executeImportParlayData(action.data);
                } else if (action.type === 'info') {
                    // For info modals, just hiding is the action. No further execution needed.
                }
            }
            // this.pendingAction is already cleared by hideConfirmationModal's transitionend
        }, 300); // Adjust delay as needed
    }

    // Executes the action to clear all parlay entries
    executeClearAllParlays() {
        this.saveStateForUndo(); // Save current state for undo
        this.parlays = []; // Clear the parlays array
        this.saveData(); // Persist changes to localStorage
        this.renderParlays(); // Re-render the UI
        this.updateSummary(); // Update summary statistics
        this.resetForm(); // Reset the form
    }

    // Executes the action to delete a specific parlay entry
    executeDeleteParlay(index) {
        this.saveStateForUndo(); // Save current state for undo
        this.parlays.splice(index, 1); // Remove the parlay at the given index
        this.saveData(); // Persist changes to localStorage
        this.renderParlays(); // Re-render the UI
        this.updateSummary(); // Update summary statistics
    }

    /**
     * Filters the parlays based on the current filterFromDate and filterToDate.
     * Includes validation for the date range.
     * @returns {Array} The array of filtered parlays.
     */
    filterParlaysByDate() {
        let filteredParlays = [...this.parlays]; // Start with all parlays
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError); // Clear previous error

        let fromDateObj = null;
        let toDateObj = null;

        // Apply "from" date filter
        if (this.filterFromDate) {
            // Create Date objects at the beginning of the day for accurate comparison
            fromDateObj = new Date(this.filterFromDate + 'T00:00:00');
            filteredParlays = filteredParlays.filter(parlay => {
                const parlayDate = new Date(parlay.date + 'T00:00:00');
                return parlayDate >= fromDateObj;
            });
        }

        // Apply "to" date filter
        if (this.filterToDate) {
            // Create Date object at the end of the day for accurate comparison
            toDateObj = new Date(this.filterToDate + 'T23:59:59'); 
            filteredParlays = filteredParlays.filter(parlay => {
                const parlayDate = new Date(parlay.date + 'T00:00:00');
                return parlayDate <= toDateObj;
            });
        }

        // Date range validation: If both are set, ensure fromDate is not after toDate
        if (fromDateObj && toDateObj && fromDateObj > toDateObj) {
            this.showValidationError(this.filterFromDateInput, 'Start date cannot be after end date.', this.dateFilterError);
            return []; // Return empty filtered parlays if date range is invalid
        }

        return filteredParlays; // Return the filtered (and potentially empty) array
    }

    // Renders the parlays into both the desktop table and mobile card views
    renderParlays() {
        console.log('Rendering parlays...');
        if (!this.parlayTableBody || !this.parlayHistoryContainer) {
            console.error("Parlay history containers not found. Cannot render parlays.");
            return;
        }
        console.log('Parlay table body and history container found.');

        // Clear existing content in both table and card containers
        this.parlayTableBody.innerHTML = '';
        this.parlayHistoryContainer.innerHTML = '';

        const filteredParlays = this.filterParlaysByDate(); // Get parlays based on current date filters
        console.log('Filtered parlays for rendering:', filteredParlays);

        // Display "No parlays" message if no entries
        if (filteredParlays.length === 0) {
            if (this.noParlaysMessage) {
                this.noParlaysMessage.classList.remove('hidden');
            }
            if (this.totalParlaysSpan) {
                this.totalParlaysSpan.textContent = '0'; // Update total parlays count
            }
            this.updateSummary(); // Ensure summary is updated for zero parlays
            return;
        } else {
            if (this.noParlaysMessage) {
                this.noParlaysMessage.classList.add('hidden');
            }
        }

        // Iterate through filtered parlays and create HTML elements for each
        filteredParlays.forEach((parlay, index) => {
            console.log(`Creating HTML for parlay at filtered index ${index}:`, parlay);

            // Helper function to get text color based on result (for Tailwind classes)
            const getResultTextColor = (result) => {
                if (result === 'Win') return 'text-green-600';
                if (result === 'Loss') return 'text-red-600';
                if (result === 'Push') return 'text-yellow-600';
                return ''; // Default if no match
            };

            // Format date for display
            const formattedDate = new Date(parlay.date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Helper to format advanced bet details (used within the modal)
            const formatAdvancedBetDetails = (bet) => {
                const details = [];
                if (bet.sport) details.push(`Sport: <strong>${bet.sport}</strong>`);
                if (bet.league) details.push(`League: <strong>${bet.league}</strong>`);
                if (bet.propCategory) details.push(`Category: <strong>${bet.propCategory}</strong>`);
                return details.length > 0 ? `<p class="text-xs text-gray-500 mt-1 space-x-2">${details.join(' | ')}</p>` : '';
            };

            // Generate HTML for individual bets to display directly in the table cell
            const individualBetsHtml = parlay.individualBets.map(bet => {
                const resultClass = getResultTextColor(bet.result);
                return `<li>${bet.player}: ${bet.prop} (<span class="${resultClass}">${bet.result}</span>)</li>`;
            }).join('');


            // HTML for desktop table row
            // Modified Individual Bets column to show a button
            const tableRow = `
                <tr data-index="${this.parlays.indexOf(parlay)}"> <!-- Use original index for editing/deleting -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${getResultTextColor(parlay.result)}">${parlay.result}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parlay.playType}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${parlay.amountWagered.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${getResultTextColor(parlay.amountWonLoss > 0 ? 'Win' : parlay.amountWonLoss < 0 ? 'Loss' : 'Push')}">$${parlay.amountWonLoss.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                        <ul class="list-disc list-inside text-xs space-y-0.5 mb-1">
                            ${individualBetsHtml}
                        </ul>
                        <button class="view-individual-bets-btn text-blue-600 hover:text-blue-800 font-medium mt-1" data-index="${this.parlays.indexOf(parlay)}">
                            View All Details
                        </button>
                    </td>
                    <td class="px-6 py-4 text-right text-sm font-medium">
                        <div class="flex flex-col space-y-2">
                            <button class="edit-parlay-btn bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors duration-200" data-index="${this.parlays.indexOf(parlay)}" aria-label="Edit parlay entry from ${formattedDate}">Edit</button>
                            <button class="delete-parlay-btn bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-200" data-index="${this.parlays.indexOf(parlay)}" aria-label="Delete parlay entry from ${formattedDate}">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
            this.parlayTableBody.insertAdjacentHTML('beforeend', tableRow);

            // HTML for mobile card view (remains unchanged, already has toggle)
            const cardHtml = `
                <div class="parlay-card border-gray-200 bg-white" data-index="${this.parlays.indexOf(parlay)}">
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
                            ${parlay.individualBets.map(bet => `<li>${bet.player}: ${bet.prop} (<span class="${getResultTextColor(bet.result)}">${bet.result}</span>)${formatAdvancedBetDetails(bet)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="parlay-card-actions mt-4 flex flex-col justify-end gap-2">
                        <button class="edit-parlay-btn bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors duration-200" data-index="${this.parlays.indexOf(parlay)}">Edit</button>
                        <button class="delete-parlay-btn bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-200" data-index="${this.parlays.indexOf(parlay)}">Delete</button>
                    </div>
                </div>
            `;
            this.parlayHistoryContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
        this.updateSummary(); // Update summary after rendering parlays
    }

    // Updates the summary statistics displayed on the page
    updateSummary() {
        if (!this.totalWageredSpan || !this.netProfitLossSpan || !this.totalWinsSpan ||
            !this.totalLossesSpan || !this.totalPushesSpan || !this.totalParlaysSpan || !this.successPercentageSpan) {
            console.error("One or more summary elements are missing. Cannot update summary.");
            return;
        }

        const filteredParlays = this.filterParlaysByDate(); // Get parlays based on current date filters

        let totalWagered = 0;
        let totalWonLoss = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let totalPushes = 0;
        let individualBetWins = 0;
        let individualBetLosses = 0;
        let individualBetPushes = 0;

        // Calculate totals from filtered parlays
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

            // Accumulate individual bet results
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

        // Update display for total wagered and net profit/loss
        this.totalWageredSpan.textContent = `${totalWagered.toFixed(2)}`;
        this.netProfitLossSpan.textContent = `${totalWonLoss.toFixed(2)}`;
        this.totalParlaysSpan.textContent = filteredParlays.length.toString();

        // Apply color to Net Profit/Loss based on value
        this.netProfitLossSpan.classList.remove('text-green-600', 'text-red-600', 'text-yellow-600');
        if (totalWonLoss > 0) {
            this.netProfitLossSpan.classList.add('text-green-600');
        } else if (totalWonLoss < 0) {
            this.netProfitLossSpan.classList.add('text-red-600');
        } else {
            this.netProfitLossSpan.classList.add('text-yellow-600');
        }

        // Update display for wins, losses, pushes
        this.totalWinsSpan.textContent = totalWins.toString();
        this.totalLossesSpan.textContent = totalLosses.toString();
        this.totalPushesSpan.textContent = totalPushes.toString();

        // Ensure these spans retain their base color classes from CSS
        this.totalWinsSpan.classList.add('text-green-700');
        this.totalLossesSpan.classList.add('text-red-700');
        this.totalPushesSpan.classList.add('text-yellow-700');

        // Calculate and update success percentage
        let totalCountForSuccess = 0;
        let successfulCount = 0;

        if (this.currentSuccessCalcMethod === 'parlays') {
            totalCountForSuccess = totalWins + totalLosses + totalPushes;
            successfulCount = totalWins;
        } else if (this.currentSuccessCalcMethod === 'individualBets') {
            totalCountForSuccess = individualBetWins + individualBetLosses + individualBetPushes; // Include pushes in total individual bets count
            successfulCount = individualBetWins;
        }

        let successPercentage = 0;
        if (totalCountForSuccess > 0) {
            successPercentage = (successfulCount / totalCountForSuccess) * 100;
        }
        this.successPercentageSpan.textContent = `${successPercentage.toFixed(2)}`;
    }

    // Handles change in the success calculation method dropdown
    handleSuccessCalcChange() {
        if (this.successPercentageCalcSelect) {
            this.currentSuccessCalcMethod = this.successPercentageCalcSelect.value;
            this.saveData(); // Save selected method to localStorage
            this.updateSummary(); // Recalculate and update summary
        }
    }

    /**
     * Handles changes to the manual date filter inputs.
     * Updates internal filter dates, validates the date range, and updates the timeline summary display.
     */
    handleDateFilterChange() {
        if (!this.filterFromDateInput || !this.filterToDateInput || !this.currentTimelineDisplay || !this.dateFilterError) {
            console.error("Required date filter elements are missing for handleDateFilterChange.");
            return;
        }

        // Update internal filter dates from input values
        this.filterFromDate = this.filterFromDateInput.value;
        this.filterToDate = this.filterToDateInput.value;
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError); // Clear previous error messages

        let fromDateObj = null;
        let toDateObj = null;
        let isValidDateRange = true;

        if (this.filterFromDate) {
            fromDateObj = new Date(this.filterFromDate + 'T00:00:00');
        }
        if (this.filterToDate) {
            toDateObj = new Date(this.filterToDate + 'T00:00:00');
        }

        // Date range validation: 'From' date cannot be after 'To' date
        if (fromDateObj && toDateObj && fromDateObj > toDateObj) {
            this.showValidationError(this.filterFromDateInput, 'Start date cannot be after end date.', this.dateFilterError);
            isValidDateRange = false;
        }

        if (isValidDateRange) {
            // Update the timeline summary text based on selected dates
            if (this.filterFromDate === '' && this.filterToDate === '') {
                this.currentTimelineSummaryText = 'All Time';
            } else {
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
        this.saveData(); // Save updated filter settings
        this.renderParlays(); // Re-render parlays with new filters
    }

    /**
     * Applies a preset date filter (e.g., 'Last 7 Days', 'Last 30 Days', 'Clear All') to the inputs
     * and triggers data refresh.
     * @param {string} presetType - 'last7Days', 'last30Days', 'clear'
     */
    applyPresetFilter(presetType) {
        this.clearAllValidationErrors(); // Clear any existing date filter validation errors

        const today = new Date();
        let from = '';
        let to = '';
        let displayString = '';

        // Helper to format date toYYYY-MM-DD for input fields
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
                displayString = 'All Time';
                break;
            case 'last7Days':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 6); // Go back 6 days to include today for 7 days total
                from = formatDate(sevenDaysAgo);
                to = formatDate(today);
                displayString = 'Last 7 Days';
                break;
            case 'last30Days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 29); // Go back 29 days to include today for 30 days total
                from = formatDate(thirtyDaysAgo);
                to = formatDate(today);
                displayString = 'Last 30 Days';
                break;
            default:
                console.warn("Unknown preset type:", presetType);
                return; // Exit if unknown preset
        }

        // Update date filter input fields and internal properties
        if (this.filterFromDateInput) {
            this.filterFromDateInput.value = from;
            this.filterFromDate = from;
        }
        if (this.filterToDateInput) {
            this.filterToDateInput.value = to;
            this.filterToDate = to;
        }

        // Update the timeline summary display text
        this.currentTimelineSummaryText = displayString;
        if (this.currentTimelineDisplay) {
            this.currentTimelineDisplay.textContent = this.currentTimelineSummaryText;
        }

        this.saveData(); // Save updated filter settings
        this.renderParlays(); // Re-render parlays with new filters
    }

    // Initializes the UI components on app load
    initializeUI() {
        this.applySavedTheme(); // Apply saved theme (dark/light)
        
        // Explicitly set advanced fields to hidden on UI initialization
        this.advancedFieldsVisible = false; 
        this.toggleAdvancedBetDetails(false); // Call with 'false' to ensure hidden state and correct button text

        // Re-apply date filters from localStorage and update display on initial load
        this.filterFromDate = localStorage.getItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_FROM) || '';
        this.filterToDate = localStorage.getItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_TO) || '';
        this.currentTimelineSummaryText = localStorage.getItem(ParlayTracker.STORAGE_KEYS.TIMELINE_SUMMARY_TEXT) || 'All Time';

        if (this.filterFromDateInput) {
            this.filterFromDateInput.value = this.filterFromDate;
        }
        if (this.filterToDateInput) {
            this.filterToDateInput.value = this.filterToDate;
        }

        // Update the displayed timeline summary text
        if (this.currentTimelineDisplay) {
            // Recalculate custom date range display if needed, or retain preset labels
            if (this.filterFromDate === '' && this.filterToDate === '') {
                this.currentTimelineSummaryText = 'All Time';
            } else if (this.currentTimelineSummaryText === 'Last 7 Days' || this.currentTimelineSummaryText === 'Last 30 Days') {
                // If it's a preset, retain the label (no need to reformat dates)
            } else {
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
        
        // Initial rendering and summary update based on loaded data and filters
        this.renderParlays();
        this.updateSummary();
        this.resetForm(); // Reset form to clear inputs and add one default prop row
        // Note: resetForm also calls toggleAdvancedBetDetails(false) to ensure they are hidden.

        // Show welcome modal on first load if it's never been dismissed
        this.checkAndShowWelcomeModal();
    }

    // Checks if the welcome modal should be shown and displays it
    checkAndShowWelcomeModal() {
        if (!this.welcomeModal) {
            console.warn("Welcome modal element not found, welcome modal functionality skipped.");
            return;
        }
        // Check if a flag exists in localStorage to see if the welcome modal has been shown/dismissed before.
        const hasVisited = localStorage.getItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED_BEFORE) === 'true';

        if (!hasVisited) {
            this.welcomeModal.classList.remove('hidden'); // Make it visible initially (for transition)
            setTimeout(() => {
                this.welcomeModal.classList.add('show'); // Add 'show' class to trigger fade-in
            }, 10); // Small delay for CSS transition to apply
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED_BEFORE, 'true'); // Set flag after showing it once
        }
    }

    // Closes the welcome modal with a fade-out animation
    closeWelcomeModal() {
        console.log('closeWelcomeModal called.');
        if (!this.welcomeModal) {
            console.error('Welcome modal element is null in closeWelcomeModal.');
            return;
        }
        this.welcomeModal.classList.remove('show'); // Trigger fade-out transition
        console.log('Removed "show" class from welcomeModal.');

        const transitionDuration = 300; // Matches the CSS transition duration (0.3s)
        setTimeout(() => {
            this.welcomeModal.classList.add('hidden'); // Fully hide after transition
            console.log('Added "hidden" class to welcomeModal after timeout.');
        }, transitionDuration);
    }

    // Handles global keyboard shortcuts (e.g., Ctrl+Z for undo)
    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') { // Ctrl+Z or Cmd+Z
            event.preventDefault(); // Prevent browser's default undo behavior
            this.undoLastAction();
        }
    }

    // Undoes the last action by restoring the previous state from the undo stack
    undoLastAction() {
        if (this.undoStack.length > 0) {
            const previousState = this.undoStack.pop(); // Get the last saved state
            this.parlays = previousState.parlays; // Restore parlays from previous state
            this.saveData(); // Persist the restored state
            this.renderParlays(); // Re-render the UI to reflect the undone state
            this.updateSummary(); // Update summary statistics
            this.resetForm(); // Reset the form to reflect the current (undone) state
            this.showInfoModal('Undo Successful', 'Last action has been undone.');
            console.log(`Undo successful. Remaining states in stack: ${this.undoStack.length}`);
        } else {
            this.showInfoModal('Undo Not Available', 'No more actions to undo.');
            console.log('Undo stack is empty.');
        }
    }

    // Toggles between light and dark themes
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark'); // Toggle 'dark' class on body
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.THEME, isDark ? 'dark' : 'light'); // Save theme preference
        // Update theme toggle button icon and aria-label
        if (this.themeToggle) {
            this.themeToggle.querySelector('i').className = isDark ? 'fas fa-moon text-xl' : 'fas fa-sun text-xl';
            this.themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
        }
    }

    // Applies the saved theme preference on page load
    applySavedTheme() {
        const savedTheme = localStorage.getItem(ParlayTracker.STORAGE_KEYS.THEME) || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        // Update theme toggle button icon and aria-label to match applied theme
        if (this.themeToggle) {
            this.themeToggle.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-moon text-xl' : 'fas fa-sun text-xl';
            this.themeToggle.setAttribute('aria-label', `Switch to ${savedTheme === 'dark' ? 'light' : 'dark'} mode`);
        }
    }

    /**
     * Toggles the visibility of the feedback chatbox.
     */
    toggleFeedbackChatbox() {
        if (!this.chatFormContainer || !this.openChatBtn) {
            console.error("Feedback chatbox elements not found. Cannot toggle.");
            return;
        }

        const isCurrentlyHidden = this.chatFormContainer.classList.contains('hidden');

        if (isCurrentlyHidden) {
            // SHOW chatbox
            this.chatFormContainer.classList.remove('hidden'); // Make it display (removes display:none)
            setTimeout(() => {
                this.chatFormContainer.classList.add('show'); // Triggers opacity/transform transition
            }, 10); // Small delay to allow 'hidden' removal to process before 'show' is added

            this.openChatBtn.innerHTML = '<i class="fas fa-times"></i>'; // Change icon to 'X'
            this.openChatBtn.setAttribute('aria-label', 'Close feedback chat');
            this.openChatBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            this.openChatBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            // Explicitly check before accessing .value
            if (this.feedbackMessageInput) {
                this.feedbackMessageInput.focus(); // Focus on textarea when chat opens
            }
        } else {
            // HIDE chatbox
            this.chatFormContainer.classList.remove('show'); // Triggers opacity/transform fade-out
            this.chatFormContainer.addEventListener('transitionend', () => {
                this.chatFormContainer.classList.add('hidden'); // Add display:none after transition
            }, { once: true }); // Ensure this listener only fires once

            this.openChatBtn.innerHTML = '<i class="fas fa-comment-dots"></i>'; // Change icon back to comment
            this.openChatBtn.setAttribute('aria-label', 'Open feedback chat');
            this.openChatBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            this.openChatBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            // Explicitly check before accessing .value
            if (this.feedbackMessageInput) {
                this.feedbackMessageInput.value = ''; // Clear message when closing
            }
        }
    }

    /**
     * Handles sending feedback via a mailto link.
     * This will open the user's default email client.
     */
    sendFeedback(event) {
        event.preventDefault(); // Prevent default form submission

        if (!this.feedbackMessageInput) {
            console.error("Feedback message input not found. Cannot send feedback.");
            return;
        }

        const message = this.feedbackMessageInput.value.trim();

        if (message) {
            const subject = encodeURIComponent('Feedback for Are You Actually Winning?');
            const body = encodeURIComponent(message);
            const mailtoLink = `mailto:${ParlayTracker.FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;

            window.location.href = mailtoLink; // Open mail client

            this.showInfoModal('Feedback Sent!', 'Your feedback has been sent. Thank you!');
            // Explicitly check before accessing .value
            if (this.feedbackMessageInput) {
                this.feedbackMessageInput.value = ''; // Clear textarea
            }
            this.toggleFeedbackChatbox(); // Close the chatbox
        } else {
            this.showInfoModal('Oops!', 'Please type a message before sending feedback.');
        }
    }

    /**
     * Displays the individual bet details for a specific parlay in a modal.
     * @param {number} parlayIndex - The index of the parlay in the `this.parlays` array.
     */
    showIndividualBetDetailsModal(parlayIndex) {
        if (!this.individualBetDetailsModal || !this.individualBetDetailsTitle || !this.individualBetsList) {
            console.error("Individual bet details modal elements not found. Cannot show modal.");
            return;
        }

        const parlay = this.parlays[parlayIndex];
        if (!parlay) {
            console.error(`Parlay not found at index: ${parlayIndex}`);
            return;
        }

        // Format date for modal title
        const formattedDate = new Date(parlay.date + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.individualBetDetailsTitle.textContent = `Individual Bets for ${formattedDate}`;
        this.individualBetsList.innerHTML = ''; // Clear previous list items

        // Helper function to get text color based on result (for Tailwind classes)
        const getResultTextColor = (result) => {
            if (result === 'Win') return 'text-green-600';
            if (result === 'Loss') return 'text-red-600';
            if (result === 'Push') return 'text-yellow-600';
            return ''; // Default if no match
        };

        parlay.individualBets.forEach(bet => {
            const listItem = document.createElement('li');
            listItem.classList.add('p-3', 'rounded-md', 'border', 'border-gray-200', 'bg-white', 'shadow-sm');

            // Basic details
            const basicInfo = document.createElement('p');
            basicInfo.classList.add('text-base', 'font-semibold');
            basicInfo.innerHTML = `<strong>${bet.player}</strong>: <span>${bet.prop}</span> (<span class="${getResultTextColor(bet.result)}">${bet.result}</span>)`;
            listItem.appendChild(basicInfo);

            // Advanced details (only if they exist)
            const advancedDetails = [];
            if (bet.sport) advancedDetails.push(`Sport: <strong>${bet.sport}</strong>`);
            if (bet.league) advancedDetails.push(`League: <strong>${bet.league}</strong>`);
            if (bet.propCategory) advancedDetails.push(`Category: <strong>${bet.propCategory}</strong>`);

            if (advancedDetails.length > 0) {
                const advancedInfo = document.createElement('p');
                advancedInfo.classList.add('text-xs', 'text-gray-500', 'mt-1', 'space-x-2');
                advancedInfo.innerHTML = advancedDetails.join(' | ');
                listItem.appendChild(advancedInfo);
            }

            this.individualBetsList.appendChild(listItem);
        });

        // Show the modal with a slight delay to allow CSS transitions
        this.individualBetDetailsModal.classList.remove('hidden');
        setTimeout(() => {
            this.individualBetDetailsModal.classList.add('show');
        }, 10);
    }

    /**
     * Hides the individual bet details modal.
     */
    hideIndividualBetDetailsModal() {
        if (!this.individualBetDetailsModal) return;

        this.individualBetDetailsModal.classList.remove('show'); // Trigger fade-out transition
        this.individualBetDetailsModal.addEventListener('transitionend', () => {
            this.individualBetDetailsModal.classList.add('hidden'); // Fully hide after transition
        }, { once: true });
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('ParlayTracker script loaded and DOMContentLoaded fired. Initializing app.');
    new ParlayTracker();
});
