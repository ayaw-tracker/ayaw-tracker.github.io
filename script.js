// Parlay Tracker Application
class ParlayTracker {
    // Static constants
    static MAX_UNDO_HISTORY = 10;
    static STORAGE_KEYS = {
        PARLAYS: 'parlays',
        SUCCESS_CALC_METHOD: 'successCalcMethod',
        HAS_VISITED: 'hasVisited',
        THEME: 'theme' // Added new storage key for theme
    };

    constructor() {
        this.parlays = [];
        this.currentSuccessCalcMethod = 'parlays';
        this.editingIndex = -1;
        this.undoStack = [];
        
        // Confirmation modal elements and state
        this.confirmationModal = null;
        this.confirmationModalTitle = null;
        this.confirmationModalMessage = null;
        this.cancelClearBtn = null;
        this.confirmClearBtn = null;
        this.pendingAction = null; // { type: 'clear' } or { type: 'delete', index: number } or { type: 'info' }

        // Validation error elements
        this.dateErrorSpan = null;
        this.amountWageredErrorSpan = null;
        this.amountWonLossErrorSpan = null;
        this.individualBetsErrorSpan = null;

        // Theme toggle element
        this.themeToggle = null; // Added reference for theme toggle button

        this.init();
    }

    // Main initialization method
    async init() {
        try {
            this.initializeElements();
            this.attachEventListeners();
            this.loadData();
            this.initializeUI(); // Initialize UI, including theme
        } catch (error) {
            console.error('Failed to initialize ParlayTracker:', error);
        }
    }

    // Initialize DOM element references with error checking
    initializeElements() {
        const elements = {
            // Form elements
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

            // Table and Card elements
            parlayTableBody: 'parlayTableBody',
            parlayHistoryContainer: 'parlayHistoryContainer',
            noParlaysMessage: 'noParlaysMessage',

            // Summary elements
            totalWageredSpan: 'totalWagered',
            netProfitLossSpan: 'netProfitLoss',
            totalWinsSpan: 'totalWins',
            totalLossesSpan: 'totalLosses',
            totalPushesSpan: 'totalPushes',
            totalParlaysSpan: 'totalParlays',
            successPercentageCalcSelect: 'successPercentageCalc',
            successPercentageSpan: 'successPercentage',

            // Modal elements
            welcomeModal: 'welcomeModal',
            closeModalBtn: 'closeModalBtn',
            confirmationModal: 'confirmationModal',
            confirmationModalTitle: 'confirmationModalTitle',
            confirmationModalMessage: 'confirmationModalMessage',
            cancelClearBtn: 'cancelClearBtn',
            confirmClearBtn: 'confirmClearBtn',
            welcomeModalTitle: 'welcomeModalTitle', // For ARIA

            // Theme toggle element
            themeToggle: 'themeToggle' // Added theme toggle button
        };

        // Assign elements to instance properties
        Object.entries(elements).forEach(([property, id]) => {
            this[property] = document.getElementById(id);
            if (!this[property]) {
                console.warn(`Element with ID '${id}' not found`);
            }
        });

        // Get references for validation error spans
        this.dateErrorSpan = document.getElementById('dateError');
        this.amountWageredErrorSpan = document.getElementById('amountWageredError');
        this.amountWonLossErrorSpan = document.getElementById('amountWonLossError');
        this.individualBetsErrorSpan = document.getElementById('individualBetsError');
        
        // For ARIA attributes on details/summary
        this.parlaySectionDetails = document.querySelector('.parlay-section');
        this.parlayFormSummary = this.parlaySectionDetails?.querySelector('summary');
    }

    // Attach all event listeners directly
    attachEventListeners() {
        // Input focus and money input handlers
        this.amountWageredInput?.addEventListener('focus', this.handleInputFocus.bind(this));
        this.amountWageredInput?.addEventListener('input', (e) => {
            this.sanitizeMoneyInput(e);
            this.updateWonLossBasedOnResult();
        });
        this.amountWageredInput?.addEventListener('blur', this.formatCurrencyOnBlur.bind(this));

        this.amountWonLossInput?.addEventListener('focus', this.handleInputFocus.bind(this));
        this.amountWonLossInput?.addEventListener('input', this.sanitizeMoneyInput.bind(this));
        this.amountWonLossInput?.addEventListener('blur', this.formatCurrencyOnBlur.bind(this));
        
        // Form and button handlers
        this.resultInput?.addEventListener('change', this.updateWonLossBasedOnResult.bind(this));
        this.parlayForm?.addEventListener('submit', this.handleFormSubmit.bind(this));
        this.addPlayerPropBtn?.addEventListener('click', () => this.addPlayerPropRow());
        this.clearAllBtn?.addEventListener('click', this.promptClearAll.bind(this));
        this.successPercentageCalcSelect?.addEventListener('change', this.handleSuccessCalcChange.bind(this));
        this.closeModalBtn?.addEventListener('click', this.closeWelcomeModal.bind(this));

        // Confirmation modal buttons
        this.cancelClearBtn?.addEventListener('click', this.hideConfirmationModal.bind(this));
        this.confirmClearBtn?.addEventListener('click', this.handleConfirmationClick.bind(this));
        
        // Theme toggle button
        this.themeToggle?.addEventListener('click', this.toggleTheme.bind(this)); // New event listener

        // Global keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Event listener for details element to toggle aria-expanded
        this.parlaySectionDetails?.addEventListener('toggle', () => {
            if (this.parlayFormSummary) {
                this.parlayFormSummary.setAttribute('aria-expanded', this.parlaySectionDetails.open);
            }
        });

        // Event delegation for Edit/Delete buttons in history table/cards
        document.body.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('edit-parlay-btn')) {
                const index = parseInt(target.dataset.index);
                if (!isNaN(index)) {
                    this.editParlay(index);
                }
            } else if (target.classList.contains('delete-parlay-btn')) {
                const index = parseInt(target.dataset.index);
                if (!isNaN(index)) {
                    this.promptDeleteParlay(index);
                }
            }
        });
    }

    // Data persistence methods
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
        } catch (error) {
            console.error("Error loading data from localStorage:", error);
            this.parlays = []; // Reset parlays if loading fails
        }
    }

    saveData() {
        try {
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.PARLAYS, JSON.stringify(this.parlays));
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.SUCCESS_CALC_METHOD, this.currentSuccessCalcMethod);
            // Theme preference is saved in toggleTheme method
        } catch (error) {
            console.error("Error saving data to localStorage:", error);
        }
    }

    // Save state for undo functionality
    saveStateForUndo() {
        const currentState = {
            parlays: JSON.parse(JSON.stringify(this.parlays)), // Deep copy to avoid reference issues
        };
        this.undoStack.push(currentState);
        if (this.undoStack.length > ParlayTracker.MAX_UNDO_HISTORY) {
            this.undoStack.shift(); // Remove the oldest state if history limit is reached
        }
        console.log(`State saved for undo. Stack size: ${this.undoStack.length}`);
    }

    // Input handling methods
    handleInputFocus(event) {
        // Select content if it's '0.00' or '0' to make typing easier
        if (event.target.value === '0.00' || event.target.value === '0') {
            event.target.select();
        }
    }

    sanitizeMoneyInput(event) {
        const input = event.target;
        const originalValue = input.value;
        let cleanedValue = originalValue.replace(/[^0-9.-]/g, ''); // Allow digits, decimal, and negative sign
    
        // Handle multiple decimals
        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            cleanedValue = parts[0] + '.' + parts.slice(1).join('');
        }
    
        // Ensure only one negative sign and it's at the beginning
        if (cleanedValue.indexOf('-') > 0) {
            cleanedValue = cleanedValue.replace(/-/g, ''); // Remove all hyphens if not at start
        }
        if (input.id === 'amountWonLoss' && originalValue.startsWith('-') && !cleanedValue.startsWith('-')) {
            cleanedValue = '-' + cleanedValue;
        } else if (input.id !== 'amountWonLoss' && cleanedValue.startsWith('-')) {
            cleanedValue = cleanedValue.substring(1); // Remove negative sign if not allowed (e.g., wagered amount)
        }

        // Remove leading zeros, unless it's "0" or "0."
        if (cleanedValue.length > 1 && cleanedValue[0] === '0' && cleanedValue[1] !== '.') {
            cleanedValue = cleanedValue.substring(1);
        }
        
        // Update value only if it changed to prevent cursor jump
        if (originalValue !== cleanedValue) {
            const cursorPosition = input.selectionStart;
            input.value = cleanedValue;
            // Restore cursor position as best as possible after sanitization
            input.setSelectionRange(cursorPosition, cursorPosition);
        }
    }
    
    formatCurrencyOnBlur(event) {
        const input = event.target;
        const value = input.value.trim();
        if (value === '') {
            input.value = ''; // Keep empty if cleared by user
            return;
        }
        // Use parseFloat on the already sanitized value
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            input.value = ''; // Clear if it's still not a valid number after blur
            return;
        }
        input.value = numericValue.toFixed(2); // Format to two decimal places
    }

    updateWonLossBasedOnResult() {
        if (!this.resultInput || !this.amountWageredInput || !this.amountWonLossInput) {
            console.error("One or more required input elements for updateWonLossBasedOnResult are missing.");
            return;
        }
        const parlayResult = this.resultInput.value;
        const wageredValue = parseFloat(this.amountWageredInput.value || '0');
        const wonLossInput = this.amountWonLossInput;
        
        // Update placeholder and auto-calculate based on result
        if (parlayResult === 'Win') {
            wonLossInput.placeholder = "Enter win amount"; // Guide user to manually enter
            // Do not clear value automatically if user has already entered something for win
        } else if (parlayResult === 'Loss') {
            wonLossInput.value = (-Math.abs(wageredValue)).toFixed(2); // Ensure loss is negative
            wonLossInput.placeholder = "Auto-calculated";
        } else if (parlayResult === 'Push') {
            wonLossInput.value = '0.00';
            wonLossInput.placeholder = "Auto-calculated";
        }
    }

    // Validation feedback methods
    showValidationError(element, message, errorSpan) {
        if (element) {
            element.classList.add('border-red-500', 'ring-red-500'); // Add visual cue to input
        }
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden'); // Show error message
        }
    }

    clearValidationError(element, errorSpan) {
        if (element) {
            element.classList.remove('border-red-500', 'ring-red-500'); // Remove visual cue
        }
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.add('hidden'); // Hide error message
        }
    }

    clearAllValidationErrors() {
        this.clearValidationError(this.dateInput, this.dateErrorSpan);
        this.clearValidationError(this.amountWageredInput, this.amountWageredErrorSpan);
        this.clearValidationError(this.amountWonLossInput, this.amountWonLossErrorSpan);
        this.clearValidationError(null, this.individualBetsErrorSpan); // This one has no direct input element
    }

    // Player prop management
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

        // Attach event listener for the remove button
        div.querySelector('.remove-prop-btn').addEventListener('click', (e) => {
            const row = e.target.closest('.player-prop-row');
            if (row) {
                row.classList.add('removing');
                row.addEventListener('animationend', () => row.remove());
            }
        });
    }
    
    clearPlayerPropRows() {
        if (this.playerPropInputsContainer) {
            this.playerPropInputsContainer.innerHTML = '';
        }
    }

    // Form submission and data handling
    handleFormSubmit(event) {
        event.preventDefault();
        this.clearAllValidationErrors(); // Clear previous errors visually

        let isValid = true; // Flag to track overall form validity

        // Input Validation for main form fields
        const date = this.dateInput?.value;
        const amountWagered = parseFloat(this.amountWageredInput?.value || '0');
        const amountWonLoss = parseFloat(this.amountWonLossInput?.value || '0');
        const result = this.resultInput?.value;
        const playType = this.playTypeInput?.value;


        if (!date) {
            this.showValidationError(this.dateInput, 'Date is required.', this.dateErrorSpan);
            isValid = false;
        }

        if (isNaN(amountWagered) || amountWagered <= 0) { // Wagered amount must be positive
            this.showValidationError(this.amountWageredInput, 'Enter a positive amount.', this.amountWageredErrorSpan);
            isValid = false;
        }
        if (isNaN(amountWonLoss)) { // Won/Loss can be negative, but must be a number
            this.showValidationError(this.amountWonLossInput, 'Enter a valid number.', this.amountWonLossErrorSpan);
            isValid = false;
        }
        // Result and PlayType are dropdowns with default selections, so they should always have values.
        // No explicit validation needed for them unless empty option is added later.


        const individualBets = [];
        if (this.playerPropInputsContainer) {
            const playerPropRows = this.playerPropInputsContainer.querySelectorAll('.player-prop-row');
            let allPropsValid = true;
            playerPropRows.forEach(row => {
                const playerInput = row.querySelector('.player-name');
                const propInput = row.querySelector('.prop-type');
                const propResultInput = row.querySelector('.prop-result');

                // Validate individual bet fields
                if (!playerInput?.value.trim() || !propInput?.value.trim()) {
                    allPropsValid = false;
                    // This would be harder to show per-row error, but overall message is fine for now
                }
                individualBets.push({ 
                    player: playerInput?.value || '', 
                    prop: propInput?.value || '', 
                    result: propResultInput?.value || 'Win' 
                });
            });

            if (!allPropsValid && playerPropRows.length > 0) { // Only show if there are rows but some are invalid
                this.showValidationError(null, 'Fill all Player/Team & Prop Type fields in individual bets.', this.individualBetsErrorSpan);
                isValid = false;
            }
        }

        if (!isValid) {
            // Scroll to the first visible error message for user guidance
            const firstErrorElement = document.querySelector('.text-red-500:not(.hidden)');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return; // Stop form submission if validation fails
        }

        // If form is valid, proceed with saving and updating
        this.saveStateForUndo(); // Save current state before modifying parlays

        const newParlay = {
            date,
            result,
            playType,
            amountWagered,
            amountWonLoss,
            individualBets
        };

        if (this.editingIndex > -1) {
            // Update existing parlay if in editing mode
            this.parlays[this.editingIndex] = newParlay;
            this.editingIndex = -1; // Exit editing mode
            if (this.submitBtn) {
                this.submitBtn.textContent = 'Add Parlay Entry'; // Reset button text
            }
        } else {
            // Add new parlay to the beginning of the array (newest first)
            this.parlays.unshift(newParlay);
        }

        this.saveData(); // Persist changes to localStorage
        this.renderParlays(); // Re-render the history
        this.updateSummary(); // Update summary statistics
        this.resetForm(); // Clear and reset the form
    }

    resetForm() {
        if (this.parlayForm) {
            this.parlayForm.reset();
        }
        // Explicitly clear numerical input values as form.reset() might not clear them if they were set by JS
        if (this.amountWageredInput) {
            this.amountWageredInput.value = '';
        }
        if (this.amountWonLossInput) {
            this.amountWonLossInput.value = '';
            this.amountWonLossInput.placeholder = '0.00'; // Reset placeholder to default
        }
        // Set the date input to today's date upon reset
        if (this.dateInput) {
            this.dateInput.valueAsDate = new Date();
        }

        this.clearPlayerPropRows();
        this.addPlayerPropRow(); // Ensure at least one empty prop row is present
        this.editingIndex = -1; // Reset editing index
        if (this.submitBtn) {
            this.submitBtn.textContent = 'Add Parlay Entry'; // Reset button text
        }
        // Collapse the form after submission
        const parlaySection = document.querySelector('.parlay-section');
        if (parlaySection) {
            parlaySection.open = false;
        }
        this.clearAllValidationErrors(); // Clear any validation errors that might be visible
    }

    editParlay(index) {
        this.clearAllValidationErrors(); // Clear any validation errors before populating for edit
        const parlay = this.parlays[index];
        this.editingIndex = index; // Set editing index

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
            this.updateWonLossBasedOnResult(); // Update placeholder based on the loaded result
        }

        this.clearPlayerPropRows(); // Clear existing prop rows
        parlay.individualBets.forEach(bet => {
            this.addPlayerPropRow(bet.player, bet.prop, bet.result); // Add rows with existing data
        });

        if (this.submitBtn) {
            this.submitBtn.textContent = 'Update Parlay Entry'; // Change button text to indicate editing
        }
        const parlaySection = document.querySelector('.parlay-section');
        if (parlaySection) {
            parlaySection.open = true; // Expand form for editing
        }
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for easy editing
    }

    // Prompts for clearing all parlays
    promptClearAll() {
        this.pendingAction = { type: 'clear' };
        this.showConfirmationModal('Confirm Clear All', 'Are you sure you want to clear all parlay entries? This action cannot be undone.');
    }

    // Prompts for deleting a single parlay
    promptDeleteParlay(index) {
        this.pendingAction = { type: 'delete', index: index };
        this.showConfirmationModal('Confirm Delete', 'Are you sure you want to delete this parlay entry? This action cannot be undone.');
    }

    // Shows the generic confirmation modal with dynamic content
    // type: 'confirm' (default, with Cancel/Confirm buttons) or 'info' (with only OK button)
    showConfirmationModal(title, message, type = 'confirm') {
        if (this.confirmationModal && this.confirmationModalTitle && this.confirmationModalMessage) {
            this.confirmationModalTitle.textContent = title;
            this.confirmationModalMessage.textContent = message;
            
            // Show/hide buttons based on type
            if (type === 'info') {
                if (this.cancelClearBtn) this.cancelClearBtn.classList.add('hidden');
                if (this.confirmClearBtn) {
                    this.confirmClearBtn.textContent = 'OK';
                    this.confirmClearBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
                    this.confirmClearBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                }
            } else { // type === 'confirm'
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
            // Set focus to the confirm button for accessibility
            this.confirmClearBtn?.focus();
        }
    }

    // A dedicated modal for showing information/alerts (no undo)
    showInfoModal(title, message) {
        this.pendingAction = { type: 'info' }; // Set pending action type to info
        this.showConfirmationModal(title, message, 'info');
    }

    // Hides the generic confirmation modal
    hideConfirmationModal() {
        if (this.confirmationModal) {
            this.confirmationModal.classList.remove('show');
            // Add a transitionend listener to truly hide the modal after animation
            this.confirmationModal.addEventListener('transitionend', () => {
                this.confirmationModal.classList.add('hidden');
                // Reset button styles when hidden
                if (this.cancelClearBtn) this.cancelClearBtn.classList.remove('hidden');
                if (this.confirmClearBtn) {
                    this.confirmClearBtn.textContent = 'Confirm'; // Reset text
                    this.confirmClearBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700'); // Reset colors
                    this.confirmClearBtn.classList.add('bg-red-500', 'hover:bg-red-600');
                }
            }, { once: true }); // Ensure the listener runs only once
        }
    }

    // Handles the click on the generic confirmation modal's confirm button
    handleConfirmationClick() {
        const action = this.pendingAction;
        this.hideConfirmationModal(); // Hide the modal first
        
        // Process the action after the modal starts hiding
        if (action) {
            if (action.type === 'clear') {
                this.executeClearAllParlays();
            } else if (action.type === 'delete' && typeof action.index === 'number') {
                this.executeDeleteParlay(action.index);
            } else if (action.type === 'info') {
                // For info modals, just hide the modal. No further action needed.
            }
            this.pendingAction = null; // Reset pending action
        }
    }

    // Executes clearing all parlays (formerly content of clearAllParlays)
    executeClearAllParlays() {
        this.saveStateForUndo(); // Save state for undo
        this.parlays = []; // Clear all parlays
        this.saveData(); // Persist change
        this.renderParlays(); // Update UI
        this.updateSummary(); // Update summary
        this.resetForm(); // Reset form state
    }

    // Executes deleting a single parlay (formerly content of deleteParlay)
    executeDeleteParlay(index) {
        this.saveStateForUndo(); // Save state for undo
        this.parlays.splice(index, 1); // Remove parlay at specified index
        this.saveData(); // Persist change
        this.renderParlays(); // Update UI
        this.updateSummary(); // Update summary
    }

    // Rendering methods
    renderParlays() {
        // Clear existing content in both table and card containers
        if (this.parlayTableBody) {
            this.parlayTableBody.innerHTML = '';
        }
        if (this.parlayHistoryContainer) {
            this.parlayHistoryContainer.innerHTML = '';
        }

        // Show/hide the "No parlays" message based on data existence
        if (this.parlays.length === 0) {
            if (this.noParlaysMessage) {
                this.noParlaysMessage.classList.remove('hidden');
            }
            return;
        } else {
            if (this.noParlaysMessage) {
                this.noParlaysMessage.classList.add('hidden');
            }
        }

        // Iterate through parlays and render them
        this.parlays.forEach((parlay, index) => {
            // Helper function to get text color based on result (Win, Loss, Push)
            const getResultTextColor = (result) => {
                if (result === 'Win') return 'text-green-600';
                if (result === 'Loss') return 'text-red-600';
                if (result === 'Push') return 'text-yellow-600';
                return ''; // Default or no color
            };

            // Format date for display consistently (to avoid timezone issues)
            const formattedDate = new Date(parlay.date + 'T00:00:00').toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });


            // HTML for Table View (Desktop)
            const tableRow = `
                <tr data-index="${index}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${parlay.result}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parlay.playType}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${parlay.amountWagered.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$${parlay.amountWonLoss.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                        ${parlay.individualBets.map(bet => `<div>${bet.player}: ${bet.prop} (<span class="${getResultTextColor(bet.result)}">${bet.result}</span>)</div>`).join('')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="edit-parlay-btn text-indigo-600 hover:text-indigo-900 mr-3" data-index="${index}" aria-label="Edit parlay entry from ${formattedDate}">Edit</button>
                        <button class="delete-parlay-btn text-red-600 hover:text-red-900" data-index="${index}" aria-label="Delete parlay entry from ${formattedDate}">Delete</button>
                    </td>
                </tr>
            `;
            if (this.parlayTableBody) {
                this.parlayTableBody.insertAdjacentHTML('beforeend', tableRow);
            }

            // HTML for Card View (Mobile)
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
                        <button class="edit-parlay-btn btn-primary bg-indigo-500 text-white text-sm py-1.5 px-4 rounded-md hover:bg-indigo-600" data-index="${index}" aria-label="Edit parlay entry from ${formattedDate}">Edit</button>
                        <button class="delete-parlay-btn btn-primary bg-red-500 text-white text-sm py-1.5 px-4 rounded-md hover:bg-red-600" data-index="${index}" aria-label="Delete parlay entry from ${formattedDate}">Delete</button>
                    </div>
                </div>
            `;
            if (this.parlayHistoryContainer) {
                this.parlayHistoryContainer.insertAdjacentHTML('beforeend', cardHtml);
            }
        });

        // Add event listeners for toggling card details for mobile view
        if (this.parlayHistoryContainer) {
            this.parlayHistoryContainer.querySelectorAll('.parlay-card-summary').forEach(summaryDiv => {
                summaryDiv.addEventListener('click', (event) => {
                    // Prevent toggling if a button within the card summary was clicked directly
                    if (!event.target.closest('.parlay-card-actions')) {
                        const detailsDiv = summaryDiv.nextElementSibling;
                        if (detailsDiv && detailsDiv.classList.contains('parlay-card-toggle-details')) {
                            detailsDiv.classList.toggle('hidden');
                            summaryDiv.classList.toggle('expanded'); // Toggle expanded class for visual arrow animation
                        }
                    }
                });
            });
        }

        this.updateSummary(); // Ensure summary statistics are up-to-date
    }

    // Summary calculations and updates
    updateSummary() {
        let totalWagered = 0;
        let netProfitLoss = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let totalPushes = 0;
        let totalIndividualProps = 0;
        let individualPropWins = 0;

        // Iterate through all parlays to calculate summary statistics
        this.parlays.forEach(parlay => {
            totalWagered += parlay.amountWagered;
            netProfitLoss += parlay.amountWonLoss;
            if (parlay.result === 'Win') {
                totalWins++;
            } else if (parlay.result === 'Loss') {
                totalLosses++;
            } else if (parlay.result === 'Push') {
                totalPushes++;
            }

            // Also calculate statistics for individual bets (props)
            parlay.individualBets.forEach(bet => {
                totalIndividualProps++;
                if (bet.result === 'Win') {
                    individualPropWins++;
                }
            });
        });

        // Update DOM elements with calculated values
        if (this.totalWageredSpan) {
            this.totalWageredSpan.textContent = totalWagered.toFixed(2);
        }
        if (this.netProfitLossSpan) {
            this.netProfitLossSpan.textContent = netProfitLoss.toFixed(2);
            // Apply color based on net profit/loss value
            this.netProfitLossSpan.classList.remove('text-green-600', 'text-red-600', 'text-yellow-600'); // Remove all first
            if (netProfitLoss > 0) {
                this.netProfitLossSpan.classList.add('text-green-600');
            } else if (netProfitLoss < 0) {
                this.netProfitLossSpan.classList.add('text-red-600');
            } else {
                this.netProfitLossSpan.classList.add('text-yellow-600'); // Neutral color for zero profit/loss
            }
        }

        if (this.totalWinsSpan) {
            this.totalWinsSpan.textContent = totalWins;
        }
        if (this.totalLossesSpan) {
            this.totalLossesSpan.textContent = totalLosses;
        }
        if (this.totalPushesSpan) {
            this.totalPushesSpan.textContent = totalPushes;
        }
        if (this.totalParlaysSpan) {
            this.totalParlaysSpan.textContent = this.parlays.length;
        }

        // Calculate and display success rate based on selected method (Parlays vs. Individual Props)
        let successRate = 0;
        if (this.currentSuccessCalcMethod === 'parlays') {
            if (this.parlays.length > 0) {
                successRate = (totalWins / this.parlays.length) * 100;
            }
        } else { // 'props'
            if (totalIndividualProps > 0) {
                successRate = (individualPropWins / totalIndividualProps) * 100;
            }
        }
        if (this.successPercentageSpan) {
            this.successPercentageSpan.textContent = successRate.toFixed(2);
        }
    }

    handleSuccessCalcChange(event) {
        this.currentSuccessCalcMethod = event.target.value;
        this.saveData(); // Save selected method to localStorage
        this.updateSummary(); // Recalculate and display summary
    }

    // Theme Toggle Functionality
    toggleTheme() {
        document.body.classList.toggle('dark');
        const isDarkMode = document.body.classList.contains('dark');
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light'); // Save preference

        // Update the icon based on the current theme
        const icon = this.themeToggle?.querySelector('i');
        if (icon) {
            if (isDarkMode) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }

    // Welcome Modal functionality
    initializeUI() {
        this.addPlayerPropRow(); // Ensure at least one prop row is present on initial load
        this.renderParlays(); // Render any existing parlays from storage
        this.updateSummary(); // Update summary statistics based on loaded data
        this.showWelcomeModal(); // Show welcome modal if it's the first visit
        // Set default date input value to today's date
        if (this.dateInput) {
            this.dateInput.valueAsDate = new Date();
        }

        // Apply saved theme on initial UI load
        const savedTheme = localStorage.getItem(ParlayTracker.STORAGE_KEYS.THEME);
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            // Ensure the moon icon is shown initially if dark mode is active
            const icon = this.themeToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        } else {
            // Ensure the sun icon is shown initially if light mode or no preference
            // This handles cases where user clears localStorage or no preference is set
            const icon = this.themeToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }

        // Set initial aria-expanded state for the details/summary element for accessibility
        if (this.parlayFormSummary && this.parlaySectionDetails) {
            this.parlayFormSummary.setAttribute('aria-expanded', this.parlaySectionDetails.open);
        }
    }

    showWelcomeModal() {
        const hasVisited = localStorage.getItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED);
        if (!hasVisited) { // Only show if user hasn't visited before
            if (this.welcomeModal) {
                this.welcomeModal.classList.remove('hidden');
                setTimeout(() => {
                    this.welcomeModal.classList.add('show');
                }, 10); // Small delay for CSS transition
                // Set initial focus for accessibility
                this.closeModalBtn?.focus();
            }
        }
    }

    closeWelcomeModal() {
        if (this.welcomeModal) {
            this.welcomeModal.classList.remove('show');
            this.welcomeModal.addEventListener('transitionend', () => {
                this.welcomeModal.classList.add('hidden');
            }, { once: true }); // Ensure listener runs only once
        }
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED, 'true'); // Mark as visited
    }

    // UNDO IMPLEMENTATION (Ctrl/Cmd + Z)
    undo() {
        if (this.undoStack.length > 0) {
            const prevState = this.undoStack.pop(); // Get the last saved state
            this.parlays = prevState.parlays; // Revert parlays to previous state
            this.saveData(); // Persist the reverted state
            this.renderParlays(); // Update UI to reflect undo
            this.updateSummary(); // Update summary statistics
            console.log(`Undo performed. Stack size: ${this.undoStack.length}`);
        } else {
            console.log('Undo stack is empty. Nothing to undo.');
        }
    }

    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault(); // Prevent default browser undo behavior
            this.undo(); // Call custom undo logic
        }
    }
}

// Instantiate the tracker when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make the tracker instance globally accessible for event delegation and easier debugging
    window.tracker = new ParlayTracker(); 
});
