// Parlay Tracker Application
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
        this.totalWinsSpan = null;
        this.totalLossesSpan = null;
        this.totalPushesSpan = null;
        this.totalParlaysSpan = null;
        this.successPercentageCalcSelect = null;
        this.successPercentageSpan = null;
        this.welcomeModal = null;
        this.closeModalBtn = null;
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
            closeModalBtn: 'closeModalBtn',
            confirmationModal: 'confirmationModal',
            confirmationModalTitle: 'confirmationModalTitle',
            confirmationModalMessage: 'confirmationModalMessage',
            cancelClearBtn: 'cancelClearBtn',
            confirmClearBtn: 'confirmClearBtn',
            welcomeModalTitle: 'welcomeModalTitle', 
            themeToggle: 'themeToggle' 
        };

        Object.entries(elementsMap).forEach(([propertyName, id]) => {
            const element = document.getElementById(id);
            if (element) {
                this[propertyName] = element;
            } else {
                // Log an error if a critical element is not found
                console.error(`ERROR: Element with ID '${id}' for property '${propertyName}' not found. Functionality relying on this element may be broken.`);
                this[propertyName] = null; // Ensure the property is explicitly null
            }
        });

        // Specific element references for error spans (outside main map for clarity)
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
        
        // Query selectors for details/summary
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
        // Use explicit null checks before adding event listeners
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
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', this.closeWelcomeModal.bind(this));
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
            // Use .closest to check if the clicked element or its parent has the class
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
            }
        });
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
        } catch (error) {
            console.error("Error loading data from localStorage:", error);
            this.parlays = []; 
        }
    }

    saveData() {
        try {
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.PARLAYS, JSON.stringify(this.parlays));
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.SUCCESS_CALC_METHOD, this.currentSuccessCalcMethod);
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
        if (!input) return; // Defensive check
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
            if (input.setSelectionRange) { // Ensure method exists
                input.setSelectionRange(cursorPosition, cursorPosition);
            }
        }
    }
    
    formatCurrencyOnBlur(event) {
        const input = event.target;
        if (!input) return; // Defensive check
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

        // Ensure the remove button exists before adding listener
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

        // Use explicit checks before accessing .value
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

                // Check if inputs exist and have values before accessing .value.trim()
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
            console.log('resetForm: amountWageredInput value set to empty string'); 
        }
        if (this.amountWonLossInput) {
            this.amountWonLossInput.value = '';
            this.amountWonLossInput.placeholder = '0.00';
            console.log('resetForm: amountWonLossInput value set to empty string and placeholder reset'); 
        }
        // Set the date input to today's date upon reset
        if (this.dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); 
            const day = String(today.getDate()).padStart(2, '0');
            this.dateInput.value = `${year}-${month}-${day}`;
            console.log(`resetForm: dateInput value set to ${this.dateInput.value}`); 
        }

        this.clearPlayerPropRows();
        this.addPlayerPropRow();
        console.log('resetForm: Player prop rows cleared and one new row added'); 
        this.editingIndex = -1;
        if (this.submitBtn) {
            this.submitBtn.textContent = 'Add Parlay Entry';
            console.log('resetForm: Submit button text reset'); 
        }
        // Collapse the form after submission
        if (this.parlaySectionDetails) { // Check if element exists
            this.parlaySectionDetails.open = false;
            console.log('resetForm: Parlay section collapsed'); 
        }
        this.clearAllValidationErrors();
        console.log('resetForm: All validation errors cleared'); 
    }

    editParlay(index) {
        const parlay = this.parlays[index]; // Parlay should always exist if index is valid
        if (!parlay) return; // Defensive check

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
        if (this.parlaySectionDetails) { // Check if element exists
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
        this.confirmClearBtn?.focus(); // Use optional chaining here
    }

    showInfoModal(title, message) {
        this.pendingAction = { type: 'info' };
        this.showConfirmationModal(title, message, 'info');
    }

    hideConfirmationModal() {
        if (!this.confirmationModal) return; // Defensive check

        this.confirmationModal.classList.remove('show');
        this.confirmationModal.addEventListener('transitionend', () => {
            this.confirmationModal.classList.add('hidden');
            // Reset button styles when hidden, only if buttons exist
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

    renderParlays() {
        // Ensure containers exist before manipulating them
        if (!this.parlayTableBody || !this.parlayHistoryContainer) {
            console.error("Parlay history containers not found. Cannot render parlays.");
            return;
        }

        this.parlayTableBody.innerHTML = '';
        this.parlayHistoryContainer.innerHTML = '';

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

        this.parlays.forEach((parlay, index) => {
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
                        <button class="edit-parlay-btn btn-primary bg-indigo-500 text-white text-sm py-1.5 px-4 rounded-md hover:bg-indigo-600" data-index="${index}" aria-label="Edit parlay entry from ${formattedDate}">Edit</button>
                        <button class="delete-parlay-btn btn-primary bg-red-500 text-white text-sm py-1.5 px-4 rounded-md hover:bg-red-600" data-index="${index}" aria-label="Delete parlay entry from ${formattedDate}">Delete</button>
                    </div>
                </div>
            `;
            this.parlayHistoryContainer.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Add event listeners for toggling card details for mobile view
        // Ensure parlayHistoryContainer exists before querying its children
        if (this.parlayHistoryContainer) {
            this.parlayHistoryContainer.querySelectorAll('.parlay-card-summary').forEach(summaryDiv => {
                summaryDiv.addEventListener('click', (event) => {
                    if (!event.target.closest('.parlay-card-actions')) {
                        const detailsDiv = summaryDiv.nextElementSibling;
                        if (detailsDiv && detailsDiv.classList.contains('parlay-card-toggle-details')) {
                            detailsDiv.classList.toggle('hidden');
                            summaryDiv.classList.toggle('expanded');
                        }
                    }
                });
            });
        }

        this.updateSummary();
    }

    updateSummary() {
        let totalWagered = 0;
        let netProfitLoss = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let totalPushes = 0;
        let totalIndividualProps = 0;
        let individualPropWins = 0;

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

            parlay.individualBets.forEach(bet => {
                totalIndividualProps++;
                if (bet.result === 'Win') {
                    individualPropWins++;
                }
            });
        });

        if (this.totalWageredSpan) {
            this.totalWageredSpan.textContent = totalWagered.toFixed(2);
        }
        if (this.netProfitLossSpan) {
            this.netProfitLossSpan.textContent = netProfitLoss.toFixed(2);
            this.netProfitLossSpan.classList.remove('text-green-600', 'text-red-600', 'text-yellow-600');
            if (netProfitLoss > 0) {
                this.netProfitLossSpan.classList.add('text-green-600');
            } else if (netProfitLoss < 0) {
                this.netProfitLossSpan.classList.add('text-red-600');
            } else {
                this.netProfitLossSpan.classList.add('text-yellow-600');
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

        let successRate = 0;
        if (this.currentSuccessCalcMethod === 'parlays') {
            if (this.parlays.length > 0) {
                successRate = (totalWins / this.parlays.length) * 100;
            }
        } else {
            if (totalIndividualProps > 0) {
                successRate = (individualPropWins / totalIndividualProps) * 100;
            }
        }
        if (this.successPercentageSpan) {
            this.successPercentageSpan.textContent = successRate.toFixed(2);
        }
    }

    handleSuccessCalcChange(event) {
        if (!event.target) return; // Defensive check
        this.currentSuccessCalcMethod = event.target.value;
        this.saveData();
        this.updateSummary();
    }

    toggleTheme() {
        document.body.classList.toggle('dark');
        const isDarkMode = document.body.classList.contains('dark');
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');

        const icon = this.themeToggle?.querySelector('i'); // Use optional chaining here
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

    initializeUI() {
        this.addPlayerPropRow();
        this.renderParlays();
        this.updateSummary();
        this.showWelcomeModal();
        
        // Set default date input value to today's date
        if (this.dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); 
            const day = String(today.getDate()).padStart(2, '0');
            this.dateInput.value = `${year}-${month}-${day}`;
            console.log(`initializeUI: dateInput value set to ${this.dateInput.value}`); 
        }

        const savedTheme = localStorage.getItem(ParlayTracker.STORAGE_KEYS.THEME);
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            const icon = this.themeToggle?.querySelector('i'); // Use optional chaining here
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        } else {
            const icon = this.themeToggle?.querySelector('i'); // Use optional chaining here
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
        if (!hasVisited) {
            if (this.welcomeModal) {
                this.welcomeModal.classList.remove('hidden');
                setTimeout(() => {
                    this.welcomeModal.classList.add('show');
                }, 10);
                this.closeModalBtn?.focus(); // Use optional chaining here
            }
        }
    }

    closeWelcomeModal() {
        if (!this.welcomeModal) return; // Defensive check

        this.welcomeModal.classList.remove('show');
        this.welcomeModal.addEventListener('transitionend', () => {
            this.welcomeModal.classList.add('hidden');
        }, { once: true });
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED, 'true');
    }

    undo() {
        if (this.undoStack.length > 0) {
            const prevState = this.undoStack.pop();
            this.parlays = prevState.parlays;
            this.saveData();
            this.renderParlays();
            this.updateSummary();
            console.log(`Undo performed. Stack size: ${this.undoStack.length}`);
        } else {
            console.log('Undo stack is empty. Nothing to undo.');
        }
    }

    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault();
            this.undo();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new ParlayTracker(); 
});
