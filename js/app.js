class ParlayTracker {
    static MAX_UNDO_HISTORY = 10;
    static STORAGE_KEYS = {
        BETS: 'bets',
        SUCCESS_CALC_METHOD: 'successCalcMethod',
        THEME: 'theme',
        DATE_FILTER_FROM: 'dateFilterFrom',
        DATE_FILTER_TO: 'dateFilterTo',
        TIMELINE_SUMMARY_TEXT: 'timelineSummaryText',
        HAS_VISITED_BEFORE: 'hasVisitedBefore'
    };
    static FEEDBACK_EMAIL = '4ayaw55@gmail.com';

    constructor() {
        this.bets = [];
        this.currentSuccessCalcMethod = 'bets';
        this.currentBetType = 'straight';
        this.editingIndex = -1;
        this.undoStack = [];
        this.playerPropCounter = 0;
        this.feedbackToggleDebounce = null;
        this.advancedFieldsVisible = false;

        this.filterFromDate = '';
        this.filterToDate = '';
        this.currentTimelineSummaryText = 'All Time';

        this.pendingAction = null;
        this.showingROI = false;

        this._initElementRefs();
        this.init();
    }

    _initElementRefs() {
        const ids = {
            betForm: 'betForm',
            dateInput: 'date',
            resultInput: 'result',
            playTypeInput: 'playType',
            amountWageredInput: 'amountWagered',
            amountWonLossInput: 'amountWonLoss',
            playerPropInputsContainer: 'playerPropInputs',
            addPlayerPropBtn: 'addPlayerPropBtn',
            submitBtn: 'submitBtn',
            clearAllBtn: 'clearAllBtn',
            betTableBody: 'betTableBody',
            betHistoryContainer: 'betHistoryContainer',
            noBetsMessage: 'noBetsMessage',
            noBetsMessageDesktop: 'noBetsMessageDesktop',
            totalWageredSpan: 'totalWagered',
            netProfitLossSpan: 'netProfitLoss',
            totalWinsSpan: 'totalWins',
            totalLossesSpan: 'totalLosses',
            totalPushesSpan: 'totalPushes',
            totalBetsSpan: 'totalBets',
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
            optInBtn: 'optInBtn',
            caseStudyModal: 'caseStudyModal',
            joinCaseStudyBtn: 'joinCaseStudyBtn',
            closeCaseStudyBtn: 'closeCaseStudyBtn',
            toggleAdvancedDetailsBtn: 'toggleAdvancedDetailsBtn',
            selectStraightBetBtn: 'selectStraightBetBtn',
            selectParlayBtn: 'selectParlayBtn',
            straightBetOddsInput: 'straightOdds',
            straightBetOddsGroup: 'straightBetOddsGroup',
            parlayPayoutTypeGroup: 'parlayPayoutTypeGroup',
            parlayIndividualBetsSection: 'parlayIndividualBetsSection',
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
            feedbackChatbox: 'feedbackChatbox',
            openChatBtn: 'openChatBtn',
            chatFormContainer: 'chatFormContainer',
            closeChatBtn: 'closeChatBtn',
            feedbackForm: 'feedbackForm',
            feedbackMessageInput: 'feedbackMessage',
            sendFeedbackBtn: 'sendFeedbackBtn',
            individualBetDetailsModal: 'individualBetDetailsModal',
            individualBetDetailsTitle: 'individualBetDetailsTitle',
            individualBetsList: 'individualBetsList',
            closeIndividualBetDetailsModalBtn: 'closeIndividualBetDetailsModalBtn',
            profitLossToggle: 'profitLossToggle',
            profitLossLabel: 'profitLossLabel',
            profitLossValue: 'profitLossValue'
        };

        Object.entries(ids).forEach(([key, id]) => {
            this[key] = document.getElementById(id);
            if (!this[key]) console.warn(`Element with ID '${id}' for '${key}' not found.`);
        });

        const errorIds = {
            dateErrorSpan: 'dateError',
            amountWageredErrorSpan: 'amountWageredError',
            amountWonLossErrorSpan: 'amountWonLossError',
            individualBetsErrorSpan: 'individualBetsError',
            straightOddsErrorSpan: 'straightOddsError'
        };
        Object.entries(errorIds).forEach(([key, id]) => {
            this[key] = document.getElementById(id);
            if (!this[key]) console.warn(`Error span with ID '${id}' for '${key}' not found.`);
        });

        this.parlaySectionDetails = document.querySelector('details.parlay-section');
        this.parlayFormSummary = this.parlaySectionDetails ? this.parlaySectionDetails.querySelector('summary') : null;
    }

    async init() {
        this.attachEventListeners();
        this.loadData();
        this.initializeUI();
    }

    attachEventListeners() {
        if (this.amountWageredInput) {
            this.amountWageredInput.addEventListener('focus', e => {
                if (['0', '0.00'].includes(e.target.value)) e.target.select();
            });
            this.amountWageredInput.addEventListener('input', e => {
                e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                if (this.currentBetType === 'straight') this.updateWonLossForStraightBet();
                else this.updateWonLossBasedOnResult();
            });
            this.amountWageredInput.addEventListener('blur', this.formatCurrencyOnBlur.bind(this));
        }
        if (this.amountWonLossInput) this.amountWonLossInput.addEventListener('blur', this.formatCurrencyOnBlur.bind(this));
        if (this.straightBetOddsInput) {
            this.straightBetOddsInput.addEventListener('input', e => {
                e.target.value = e.target.value.replace(/[^0-9+-]/g, '');
                this.updateWonLossForStraightBet();
            });
            this.straightBetOddsInput.addEventListener('blur', () => {
                const value = this.straightBetOddsInput.value.trim();
                if (value && !value.startsWith('+') && !value.startsWith('-') && parseFloat(value) > 0) {
                    this.straightBetOddsInput.value = '+' + value;
                }
                this.updateWonLossForStraightBet();
            });
        }
        if (this.resultInput) this.resultInput.addEventListener('change', () => {
            if (this.currentBetType === 'straight') this.updateWonLossForStraightBet();
            else this.updateWonLossBasedOnResult();
        });
        if (this.betForm) this.betForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        if (this.addPlayerPropBtn) this.addPlayerPropBtn.addEventListener('click', () => this.addPlayerPropRow());
        if (this.clearAllBtn) this.clearAllBtn.addEventListener('click', this.promptClearAll.bind(this));
        if (this.successPercentageCalcSelect) this.successPercentageCalcSelect.addEventListener('change', this.handleSuccessCalcChange.bind(this));
        if (this.keepLocalBtn) this.keepLocalBtn.addEventListener('click', this.closeWelcomeModal.bind(this));
        if (this.participateBtn) this.participateBtn.addEventListener('click', this.closeWelcomeModal.bind(this));
        if (this.cancelClearBtn) this.cancelClearBtn.addEventListener('click', this.hideConfirmationModal.bind(this));
        if (this.confirmClearBtn) this.confirmClearBtn.addEventListener('click', this.handleConfirmationClick.bind(this));
        if (this.themeToggle) this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        if (this.toggleAdvancedDetailsBtn) this.toggleAdvancedDetailsBtn.addEventListener('click', () => this.toggleAdvancedBetDetails());
        // Opt-in button event listener is handled dynamically in updateOptInButtonState()
        if (this.joinCaseStudyBtn) this.joinCaseStudyBtn.addEventListener('click', this.joinCaseStudy.bind(this));
        if (this.closeCaseStudyBtn) this.closeCaseStudyBtn.addEventListener('click', this.hideCaseStudyModal.bind(this));
        if (this.selectStraightBetBtn) this.selectStraightBetBtn.addEventListener('click', () => this.handleBetTypeSelection('straight'));
        if (this.selectParlayBtn) this.selectParlayBtn.addEventListener('click', () => this.handleBetTypeSelection('parlay'));
        if (this.filterFromDateInput) this.filterFromDateInput.addEventListener('change', this.handleDateFilterChange.bind(this));
        if (this.filterToDateInput) this.filterToDateInput.addEventListener('change', this.handleDateFilterChange.bind(this));
        if (this.filterLast7DaysBtn) this.filterLast7DaysBtn.addEventListener('click', () => this.applyPresetFilter('last7Days'));
        if (this.filterLast30DaysBtn) this.filterLast30DaysBtn.addEventListener('click', () => this.applyPresetFilter('last30Days'));
        if (this.clearDateFilterBtn) this.clearDateFilterBtn.addEventListener('click', () => this.applyPresetFilter('clear'));
        if (this.timelineDetails && this.currentTimelineDisplay) {
            this.timelineDetails.addEventListener('toggle', () => {
                this.timelineDetails.setAttribute('aria-expanded', this.timelineDetails.open);
            });
        }
        if (this.exportCsvBtn) this.exportCsvBtn.addEventListener('click', this.exportBetDataAsCsv.bind(this));
        if (this.exportJsonBtn) this.exportJsonBtn.addEventListener('click', this.exportBetDataAsJson.bind(this));
        if (this.importDataBtn) this.importDataBtn.addEventListener('click', () => this.importFileInput?.click());
        if (this.importFileInput) this.importFileInput.addEventListener('change', this.handleImportFileSelect.bind(this));
        if (this.openChatBtn) {
            // Remove any existing listeners to prevent duplicates
            this.openChatBtn.removeEventListener('click', this.toggleFeedbackChatbox.bind(this));
            this.openChatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFeedbackChatbox();
            });
        }
        if (this.closeChatBtn) {
            this.closeChatBtn.removeEventListener('click', this.toggleFeedbackChatbox.bind(this));
            this.closeChatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFeedbackChatbox();
            });
        }
        if (this.feedbackForm) this.feedbackForm.addEventListener('submit', this.sendFeedback.bind(this));
        if (this.closeIndividualBetDetailsModalBtn) this.closeIndividualBetDetailsModalBtn.addEventListener('click', this.hideIndividualBetDetailsModal.bind(this));
        if (this.profitLossToggle) this.profitLossToggle.addEventListener('click', this.toggleProfitLossDisplay.bind(this));

        document.body.addEventListener('click', e => {
            const target = e.target;
            if (target.closest('.edit-parlay-btn')) {
                this.editBet(parseInt(target.closest('.edit-parlay-btn').dataset.index));
            } else if (target.closest('.delete-parlay-btn')) {
                this.promptDeleteBet(parseInt(target.closest('.delete-parlay-btn').dataset.index));
            } else if (target.closest('.parlay-card-summary')) {
                const details = target.closest('.parlay-card').querySelector('.parlay-card-toggle-details');
                if (details) details.classList.toggle('hidden');
            } else if (target.closest('.view-individual-bets-btn')) {
                this.showIndividualBetDetailsModal(parseInt(target.closest('.view-individual-bets-btn').dataset.index));
            } else if (target.id === 'individualBetDetailsModal') {
                // Close modal when clicking outside the modal content
                this.hideIndividualBetDetailsModal();
            } else if (target.id === 'confirmationModal') {
                // Close confirmation modal when clicking outside
                this.hideConfirmationModal();
            } else if (target.id === 'caseStudyModal') {
                // Close case study modal when clicking outside
                this.hideCaseStudyModal();
            } else if (!target.closest('#chatFormContainer') && !target.closest('#openChatBtn') && this.chatFormContainer && !this.chatFormContainer.classList.contains('hidden')) {
                // Close feedback chatbox when clicking outside
                this.toggleFeedbackChatbox();
            }
        });

        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undoLastAction();
            }
        });
    }

    loadData() {
        try {
            const stored = localStorage.getItem(ParlayTracker.STORAGE_KEYS.BETS);
            this.bets = stored ? JSON.parse(stored) : [];
            const storedMethod = localStorage.getItem(ParlayTracker.STORAGE_KEYS.SUCCESS_CALC_METHOD);
            if (storedMethod) this.currentSuccessCalcMethod = storedMethod;
            if (this.successPercentageCalcSelect) this.successPercentageCalcSelect.value = this.currentSuccessCalcMethod;
            this.filterFromDate = localStorage.getItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_FROM) || '';
            this.filterToDate = localStorage.getItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_TO) || '';
            this.currentTimelineSummaryText = localStorage.getItem(ParlayTracker.STORAGE_KEYS.TIMELINE_SUMMARY_TEXT) || 'All Time';
            if (this.filterFromDateInput) this.filterFromDateInput.value = this.filterFromDate;
            if (this.filterToDateInput) this.filterToDateInput.value = this.filterToDate;
            if (this.currentTimelineDisplay) this.currentTimelineDisplay.textContent = this.currentTimelineSummaryText;
        } catch {
            this.bets = [];
        }
    }

    saveData() {
        try {
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.BETS, JSON.stringify(this.bets));
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.SUCCESS_CALC_METHOD, this.currentSuccessCalcMethod);
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_FROM, this.filterFromDate);
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.DATE_FILTER_TO, this.filterToDate);
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.TIMELINE_SUMMARY_TEXT, this.currentTimelineSummaryText);
        } catch {}
    }

    saveStateForUndo() {
        this.undoStack.push({ bets: JSON.parse(JSON.stringify(this.bets)) });
        if (this.undoStack.length > ParlayTracker.MAX_UNDO_HISTORY) this.undoStack.shift();
    }

    formatCurrencyOnBlur(e) {
        const val = parseFloat(e.target.value);
        e.target.value = isNaN(val) ? '' : val.toFixed(2);
    }

    updateWonLossForStraightBet() {
        if (!this.resultInput || !this.amountWageredInput || !this.straightBetOddsInput || !this.amountWonLossInput) return;
        const result = this.resultInput.value;
        const wagered = parseFloat(this.amountWageredInput.value) || 0;
        const oddsInput = this.straightBetOddsInput.value.toString().trim();
        const wonLoss = this.amountWonLossInput;
        
        // Make field readonly for straight bets since it's calculated
        wonLoss.readOnly = true;
        wonLoss.classList.add('bg-gray-200', 'text-gray-500');
        wonLoss.placeholder = 'Enter wager & odds';
        
        if (result === 'Win' && wagered > 0 && oddsInput !== '') {
            // Parse odds (handle +/- format)
            const odds = parseFloat(oddsInput);
            let winAmount;
            
            if (odds > 0) {
                // Positive odds (+150 means you win $150 for every $100 bet)
                winAmount = wagered * (odds / 100);
            } else if (odds < 0) {
                // Negative odds (-150 means you bet $150 to win $100)
                winAmount = wagered / (Math.abs(odds) / 100);
            } else {
                winAmount = 0;
            }
            
            wonLoss.value = winAmount.toFixed(2);
        } else if (result === 'Loss') {
            wonLoss.value = (-Math.abs(wagered)).toFixed(2);
        } else if (result === 'Push') {
            wonLoss.value = '0.00';
        } else {
            wonLoss.value = '';
            wonLoss.placeholder = 'Enter wager & odds';
        }
    }

    updateWonLossBasedOnResult() {
        if (this.currentBetType === 'straight') return;
        if (!this.resultInput || !this.amountWageredInput || !this.amountWonLossInput) return;
        const result = this.resultInput.value;
        const wagered = parseFloat(this.amountWageredInput.value) || 0;
        const wonLoss = this.amountWonLossInput;
        wonLoss.readOnly = false;
        wonLoss.classList.remove('bg-gray-200', 'text-gray-500');
        if (result === 'Win') {
            wonLoss.placeholder = 'Enter win amount';
        } else if (result === 'Loss') {
            wonLoss.value = (-Math.abs(wagered)).toFixed(2);
            wonLoss.placeholder = 'Auto-calculated';
            wonLoss.readOnly = true;
            wonLoss.classList.add('bg-gray-200', 'text-gray-500');
        } else if (result === 'Push') {
            wonLoss.value = '0.00';
            wonLoss.placeholder = 'Auto-calculated';
            wonLoss.readOnly = true;
            wonLoss.classList.add('bg-gray-200', 'text-gray-500');
        }
    }

    showValidationError(element, message, errorSpan) {
        if (element) element.classList.add('border-red-500', 'ring-red-500');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden');
        }
    }

    clearValidationError(element, errorSpan) {
        if (element) element.classList.remove('border-red-500', 'ring-red-500');
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
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError);
        this.clearValidationError(this.straightBetOddsInput, this.straightOddsErrorSpan);
    }

    toggleAdvancedBetDetails(show = null) {
        this.advancedFieldsVisible = show === null ? !this.advancedFieldsVisible : show;
        if (this.toggleAdvancedDetailsBtn) {
            const icon = this.toggleAdvancedDetailsBtn.querySelector('i');
            const text = this.toggleAdvancedDetailsBtn.querySelector('span');
            icon.className = this.advancedFieldsVisible ? 'fas fa-minus mr-1' : 'fas fa-plus mr-1';
            text.textContent = this.advancedFieldsVisible ? 'Hide Details' : 'More Details';
        }
        if (!this.playerPropInputsContainer) return;
        this.playerPropInputsContainer.querySelectorAll('.player-prop-row').forEach(row => {
            const basic = row.querySelector('.basic-fields-container');
            const adv = row.querySelector('.advanced-fields-container');
            if (basic) basic.classList.toggle('hidden', this.advancedFieldsVisible);
            if (adv) adv.classList.toggle('hidden', !this.advancedFieldsVisible);
        });
    }

    addPlayerPropRow(player = '', prop = '', result = 'Win', sport = '', league = '', propCategory = '', isSingleLeg = false) {
        if (!this.playerPropInputsContainer) return;
        const id = `player-prop-${this.playerPropCounter++}`;

        const row = document.createElement('div');
        row.className = 'player-prop-row flex items-center gap-3 p-3 bg-gray-50 rounded-md shadow-sm mb-3 fade-in';

        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'flex-grow flex items-center gap-3';

        const basicFields = document.createElement('div');
        basicFields.className = `flex flex-grow items-center gap-3 basic-fields-container${this.advancedFieldsVisible ? ' hidden' : ''}`;

        const createInput = (type, id, placeholder, value, classes = '', required = false) => {
            const div = document.createElement('div');
            div.className = 'flex-grow';
            const label = document.createElement('label');
            label.htmlFor = id;
            label.className = 'sr-only';
            label.textContent = placeholder;
            const input = document.createElement('input');
            input.type = type;
            input.id = id;
            input.placeholder = placeholder;
            input.value = value;
            input.className = classes;
            if (required) input.required = true;
            div.append(label, input);
            return { div, input };
        };

        // Set placeholders based on bet type
        const playerPlaceholder = this.currentBetType === 'straight' ? 'Team/Player Name (e.g., Lakers, Mahomes)' : 'Player/Team Name (e.g., LeBron James)';
        const propPlaceholder = this.currentBetType === 'straight' ? 'Bet Type (e.g., Moneyline, Spread -3.5)' : 'Prop Type (e.g., Over 25.5 Pts)';
        
        const { div: playerDiv, input: playerInput } = createInput('text', `${id}-player`, playerPlaceholder, player, 'player-name w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-800', true);
        const { div: propDiv, input: propInput } = createInput('text', `${id}-prop`, propPlaceholder, prop, 'prop-type w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-800', true);

        const propResultDiv = document.createElement('div');
        propResultDiv.className = 'flex-grow';
        const propResultLabel = document.createElement('label');
        propResultLabel.htmlFor = `${id}-result`;
        propResultLabel.className = 'sr-only';
        propResultLabel.textContent = 'Prop Result';
        const propResultSelect = document.createElement('select');
        propResultSelect.id = `${id}-result`;
        propResultSelect.className = 'prop-result w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-800';
        ['Win', 'Loss', 'Push'].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if (opt === result) option.selected = true;
            propResultSelect.appendChild(option);
        });
        propResultDiv.append(propResultLabel, propResultSelect);

        basicFields.append(playerDiv, propDiv, propResultDiv);
        inputsContainer.appendChild(basicFields);

        const advancedFields = document.createElement('div');
        advancedFields.className = `flex flex-grow items-center gap-3 advanced-fields-container${this.advancedFieldsVisible ? '' : ' hidden'}`;

        const { div: sportDiv, input: sportInput } = createInput('text', `${id}-sport`, 'Sport (e.g., NBA)', sport, 'sport-input w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-800');
        const { div: leagueDiv, input: leagueInput } = createInput('text', `${id}-league`, 'League (e.g., EuroLeague)', league, 'league-input w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-800');
        // Set category placeholder based on bet type
        const categoryPlaceholder = this.currentBetType === 'straight' ? 'Category (e.g., Spread, Total, Moneyline)' : 'Category (e.g., Points)';
        
        const { div: propCategoryDiv, input: propCategoryInput } = createInput('text', `${id}-prop-category`, categoryPlaceholder, propCategory, 'prop-category-input w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-800');

        // Only add odds input for parlays, not for straight bets
        if (this.currentBetType === 'parlay' && !isSingleLeg) {
            const { div: oddsDiv, input: oddsInput } = createInput('text', `${id}-odds`, 'Odds (e.g., +150, -110)', '', 'odds-input w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-800');

            // Add input validation for odds
            oddsInput.addEventListener('input', e => {
                e.target.value = e.target.value.replace(/[^0-9+-]/g, '');
            });
            oddsInput.addEventListener('blur', () => {
                const value = oddsInput.value.trim();
                if (value && !value.startsWith('+') && !value.startsWith('-') && parseFloat(value) > 0) {
                    oddsInput.value = '+' + value;
                }
            });

            advancedFields.append(sportDiv, leagueDiv, propCategoryDiv, oddsDiv);
        } else {
            advancedFields.append(sportDiv, leagueDiv, propCategoryDiv);
        }
        inputsContainer.appendChild(advancedFields);

        const removeWrapper = document.createElement('div');
        removeWrapper.className = 'flex-shrink-0 ml-auto';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-prop-btn text-red-500 hover:text-red-700 p-2 rounded-full transition-colors duration-200';
        removeBtn.setAttribute('aria-label', 'Remove this player prop bet');
        const removeIcon = document.createElement('i');
        removeIcon.className = 'fas fa-times-circle text-xl';
        removeBtn.appendChild(removeIcon);
        removeWrapper.appendChild(removeBtn);

        row.append(inputsContainer, removeWrapper);
        this.playerPropInputsContainer.appendChild(row);

        if (isSingleLeg) {
            propResultDiv.classList.add('hidden');
            propResultSelect.required = false;
            removeWrapper.classList.add('hidden');
            this.resultInput.addEventListener('change', () => propResultSelect.value = this.resultInput.value);
            propResultSelect.value = this.resultInput.value;
        } else {
            removeBtn.addEventListener('click', () => {
                row.classList.add('removing');
                row.addEventListener('animationend', () => row.remove(), { once: true });
            });
        }
    }

    clearPlayerPropRows() {
        if (this.playerPropInputsContainer) {
            this.playerPropInputsContainer.innerHTML = '';
            this.playerPropCounter = 0;
        }
    }

   // Handles switching between 'straight' and 'parlay' bet types
handleBetTypeSelection(type) {
    this.currentBetType = type;
    this.clearAllValidationErrors();

    ['selectStraightBetBtn', 'selectParlayBtn'].forEach(btn => {
        if (this[btn]) {
            this[btn].classList.remove('active', 'bg-blue-600', 'text-white');
            this[btn].classList.add('bg-gray-200', 'text-gray-800');
        }
    });

    if (type === 'straight') {
        if (this.selectStraightBetBtn) {
            this.selectStraightBetBtn.classList.add('active', 'bg-blue-600', 'text-white');
            this.selectStraightBetBtn.classList.remove('bg-gray-200', 'text-gray-800');
        }
        this.parlayPayoutTypeGroup?.classList.add('hidden');
        this.straightBetOddsGroup?.classList.remove('hidden');
        this.parlayIndividualBetsSection?.classList.remove('hidden');
        this.toggleAdvancedDetailsBtn?.classList.remove('hidden');
        this.addPlayerPropBtn?.classList.add('hidden');
        if (this.submitBtn) this.submitBtn.textContent = 'Add Straight Bet Entry';
    } else {
        if (this.selectParlayBtn) {
            this.selectParlayBtn.classList.add('active', 'bg-blue-600', 'text-white');
            this.selectParlayBtn.classList.remove('bg-gray-200', 'text-gray-800');
        }
        this.parlayPayoutTypeGroup?.classList.remove('hidden');
        this.straightBetOddsGroup?.classList.add('hidden');
        this.parlayIndividualBetsSection?.classList.remove('hidden');
        this.toggleAdvancedDetailsBtn?.classList.remove('hidden');
        this.addPlayerPropBtn?.classList.remove('hidden');
        if (this.submitBtn) this.submitBtn.textContent = 'Add Parlay Entry';
    }

    // Keep the <details> element open to prevent collapsing on switch
    if (!this.betFormDetailsElement) {
        this.betFormDetailsElement = document.getElementById('betFormContent').closest('details');
    }
    if (this.betFormDetailsElement) {
        this.betFormDetailsElement.open = true;
    }

    // Reset form inputs and player props for the selected bet type
    this.resetFormInputs();
    this.resetPlayerProps();
}

// Resets general form inputs (date, odds, wagered, won/loss, etc.)
resetFormInputs() {
    this.betForm?.reset();

    this.amountWageredInput.value = '';
    this.amountWonLossInput.value = '';
    
    // Set styling based on bet type
    if (this.currentBetType === 'straight') {
        this.amountWonLossInput.placeholder = 'Calculated';
        this.amountWonLossInput.readOnly = true;
        this.amountWonLossInput.classList.add('bg-gray-200', 'text-gray-500');
    } else {
        this.amountWonLossInput.placeholder = '0.00';
        this.amountWonLossInput.readOnly = false;
        this.amountWonLossInput.classList.remove('bg-gray-200', 'text-gray-500');
    }

    this.straightBetOddsInput.value = '';
    this.straightBetOddsInput.placeholder = '+100';

    if (this.dateInput) {
        const d = new Date();
        this.dateInput.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    if (this.submitBtn) {
        this.submitBtn.textContent = `Add ${this.currentBetType === 'straight' ? 'Straight Bet' : 'Parlay'} Entry`;
    }
}

// Clears existing player prop input rows and adds the initial row based on bet type
resetPlayerProps() {
    this.clearPlayerPropRows();

    if (this.currentBetType === 'parlay') {
        // Add empty row for parlay bet (with empty odds input in advanced details if implemented)
        this.addPlayerPropRow();
    } else {
        // For straight bet, add one player prop row with default 'Win' result selected
        this.addPlayerPropRow('', '', 'Win', '', '', '', true);
    }
}




    handleFormSubmit(e) {
        e.preventDefault();
        this.clearAllValidationErrors();

        let valid = true;
        const date = this.dateInput?.value || '';
        const amountWagered = parseFloat(this.amountWageredInput?.value || '0');
        const result = this.resultInput?.value || '';
        let amountWonLoss = 0;
        let playType = null;
        let straightOdds = null;
        const individualBets = [];

        if (!date) {
            this.showValidationError(this.dateInput, 'Date is required.', this.dateErrorSpan);
            valid = false;
        }
        if (isNaN(amountWagered) || amountWagered <= 0) {
            this.showValidationError(this.amountWageredInput, 'Enter a positive amount.', this.amountWageredErrorSpan);
            valid = false;
        }

        if (this.currentBetType === 'parlay') {
            playType = this.playTypeInput?.value || '';
            amountWonLoss = parseFloat(this.amountWonLossInput?.value || '0');
            if (isNaN(amountWonLoss)) {
                this.showValidationError(this.amountWonLossInput, 'Enter a valid number.', this.amountWonLossErrorSpan);
                valid = false;
            }

            const rows = this.playerPropInputsContainer?.querySelectorAll('.player-prop-row') || [];
            if (rows.length === 0) {
                this.showValidationError(null, 'At least one individual bet is required for a Parlay.', this.individualBetsErrorSpan);
                valid = false;
            }
            let allValid = true;
            rows.forEach(row => {
                const player = row.querySelector('.player-name')?.value.trim() || '';
                const prop = row.querySelector('.prop-type')?.value.trim() || '';
                const res = row.querySelector('.prop-result')?.value || 'Win';
                const sport = row.querySelector('.sport-input')?.value.trim() || '';
                const league = row.querySelector('.league-input')?.value.trim() || '';
                const propCat = row.querySelector('.prop-category-input')?.value.trim() || '';
                if (!player || !prop) allValid = false;
                individualBets.push({ player, prop, result: res, sport, league, propCategory: propCat });
            });
            if (!allValid) {
                this.showValidationError(null, 'Fill all Player/Team & Prop Type fields in individual bets.', this.individualBetsErrorSpan);
                valid = false;
            }
        } else {
            straightOdds = parseFloat(this.straightBetOddsInput?.value || '0');
            if (isNaN(straightOdds) || straightOdds === 0) {
                this.showValidationError(this.straightBetOddsInput, 'Odds are required and cannot be zero.', this.straightOddsErrorSpan);
                valid = false;
            }
            if (result === 'Win') {
                if (amountWagered > 0 && straightOdds !== 0) {
                    amountWonLoss = straightOdds >= 100 ? amountWagered * (straightOdds / 100) : straightOdds < 0 ? amountWagered / Math.abs(straightOdds / 100) : amountWagered * (straightOdds / 100);
                }
            } else if (result === 'Loss') {
                amountWonLoss = -Math.abs(amountWagered);
            } else if (result === 'Push') {
                amountWonLoss = 0;
            }
            const rows = this.playerPropInputsContainer?.querySelectorAll('.player-prop-row') || [];
            if (rows.length !== 1) {
                this.showValidationError(null, rows.length === 0 ? 'One individual bet is required for a Straight Bet.' : 'Only one individual bet is allowed for a Straight Bet.', this.individualBetsErrorSpan);
                valid = false;
            } else {
                const row = rows[0];
                const player = row.querySelector('.player-name')?.value.trim() || '';
                const prop = row.querySelector('.prop-type')?.value.trim() || '';
                const sport = row.querySelector('.sport-input')?.value.trim() || '';
                const league = row.querySelector('.league-input')?.value.trim() || '';
                const propCat = row.querySelector('.prop-category-input')?.value.trim() || '';
                if (!player || !prop) {
                    this.showValidationError(null, 'Fill all Player/Team & Prop Type fields for the individual bet.', this.individualBetsErrorSpan);
                    valid = false;
                }
                individualBets.push({ player, prop, result, sport, league, propCategory: propCat });
            }
        }

        if (!valid) {
            const firstError = document.querySelector('.text-red-500:not(.hidden)');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        this.saveStateForUndo();
        const newBet = {
            type: this.currentBetType,
            date,
            result,
            amountWagered,
            amountWonLoss,
            playType: this.currentBetType === 'parlay' ? playType : null,
            straightOdds: this.currentBetType === 'straight' ? straightOdds : null,
            individualBets
        };

        if (this.editingIndex > -1) {
            this.bets[this.editingIndex] = newBet;
            this.editingIndex = -1;
            if (this.submitBtn) this.submitBtn.textContent = `Add ${this.currentBetType === 'straight' ? 'Straight Bet' : 'Parlay'} Entry`;
        } else {
            this.bets.unshift(newBet);
        }

        this.saveData();
        this.resetForm();
        this.applyPresetFilter('clear');
        this.renderBets();
        this.updateSummary();
        this.updateSmartInsights();
    }

    resetForm() {
        this.betForm?.reset();
        this.amountWageredInput.value = '';
        this.amountWonLossInput.value = '';
        
        // Set styling based on current bet type
        if (this.currentBetType === 'straight') {
            this.amountWonLossInput.placeholder = 'Enter wager & odds';
            this.amountWonLossInput.readOnly = true;
            this.amountWonLossInput.classList.add('bg-gray-200', 'text-gray-500');
        } else {
            this.amountWonLossInput.placeholder = '0.00';
            this.amountWonLossInput.readOnly = false;
            this.amountWonLossInput.classList.remove('bg-gray-200', 'text-gray-500');
        }
        
        this.straightBetOddsInput.value = '';
        this.straightBetOddsInput.placeholder = '+100';

        if (this.dateInput) {
            const d = new Date();
            this.dateInput.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        this.clearPlayerPropRows();

        if (this.currentBetType === 'parlay') {
            this.addPlayerPropRow();
        } else {
            this.addPlayerPropRow('', '', 'Win', '', '', '', true);
        }
        this.editingIndex = -1;
        if (this.submitBtn) this.submitBtn.textContent = `Add ${this.currentBetType === 'straight' ? 'Straight Bet' : 'Parlay'} Entry`;
        if (this.parlaySectionDetails) this.parlaySectionDetails.open = false;

        this.clearAllValidationErrors();
        this.toggleAdvancedBetDetails(false);
        this.updateWonLossForStraightBet();
    }

    editBet(index) {
        const bet = this.bets[index];
        if (!bet) return;

        this.clearAllValidationErrors();
        this.editingIndex = index;
        this.handleBetTypeSelection(bet.type);

        if (this.dateInput) this.dateInput.value = bet.date;
        if (this.resultInput) this.resultInput.value = bet.result;
        if (this.amountWageredInput) this.amountWageredInput.value = bet.amountWagered.toFixed(2);
        if (this.amountWonLossInput) this.amountWonLossInput.value = bet.amountWonLoss.toFixed(2);

        this.clearPlayerPropRows();

        if (bet.type === 'parlay') {
            if (this.playTypeInput) this.playTypeInput.value = bet.playType || '';
            const hasAdvanced = bet.individualBets.some(p => p.sport || p.league || p.propCategory);
            bet.individualBets.forEach(p => this.addPlayerPropRow(p.player, p.prop, p.result, p.sport, p.league, p.propCategory, false));
            this.toggleAdvancedBetDetails(hasAdvanced);
        } else {
            if (this.straightBetOddsInput) this.straightBetOddsInput.value = bet.straightOdds || '';
            if (bet.individualBets.length > 0) {
                const p = bet.individualBets[0];
                this.addPlayerPropRow(p.player, p.prop, bet.result, p.sport, p.league, p.propCategory, true);
            } else {
                this.addPlayerPropRow('', '', bet.result, '', '', '', true);
            }
            this.toggleAdvancedDetailsBtn?.classList.remove('hidden');
            this.updateWonLossForStraightBet();
        }

        if (this.submitBtn) this.submitBtn.textContent = 'Update Bet Entry';
        if (this.parlaySectionDetails) this.parlaySectionDetails.open = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    promptClearAll() {
        this.pendingAction = { type: 'clear' };
        this.showConfirmationModal('Confirm Clear All', 'Are you sure you want to clear all bet entries? This action cannot be undone.');
    }

    promptDeleteBet(index) {
        this.pendingAction = { type: 'delete', index };
        this.showConfirmationModal('Confirm Delete', 'Are you sure you want to delete this bet entry? This action cannot be undone.');
    }

    handleImportFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/json') {
            this.showInfoModal('Invalid File Type', 'Please select a JSON file.');
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!Array.isArray(data) || !data.every(item => 'date' in item && 'amountWagered' in item && 'type' in item)) {
                    this.showInfoModal('Invalid Data Format', 'JSON file does not contain valid bet data.');
                    e.target.value = '';
                    return;
                }
                this.pendingAction = { type: 'import', data };
                this.showConfirmationModal('Confirm Data Import', 'Importing data will REPLACE all current bet entries. Proceed?', 'confirm');
            } catch {
                this.showInfoModal('File Read Error', 'Could not read the JSON file. It may be corrupted or invalid.');
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    }

    executeImportBetData(data) {
        this.saveStateForUndo();
        this.bets = data;
        this.saveData();
        this.renderBets();
        this.updateSummary();
        this.resetForm();
        this.showInfoModal('Import Successful', 'Bet data imported and replaced existing data.');
    }

    exportBetDataAsCsv() {
        if (this.bets.length === 0) {
            this.showInfoModal('No Data to Export', 'Add some entries before exporting.');
            return;
        }
        const headers = [
            "Date", "Result", "Type", "Play Type (Parlay Only)", "Odds (Straight Only)", "Amount Wagered", "Amount Won/Loss",
            "Individual Bet 1 Player", "Individual Bet 1 Prop", "Individual Bet 1 Result", "Individual Bet 1 Sport", "Individual Bet 1 League", "Individual Bet 1 Prop Category",
            "Individual Bet 2 Player", "Individual Bet 2 Prop", "Individual Bet 2 Result", "Individual Bet 2 Sport", "Individual Bet 2 League", "Individual Bet 2 Prop Category",
            "Individual Bet 3 Player", "Individual Bet 3 Prop", "Individual Bet 3 Result", "Individual Bet 3 Sport", "Individual Bet 3 League", "Individual Bet 3 Prop Category",
            "Individual Bet 4 Player", "Individual Bet 4 Prop", "Individual Bet 4 Result", "Individual Bet 4 Sport", "Individual Bet 4 League", "Individual Bet 4 Prop Category",
            "Individual Bet 5 Player", "Individual Bet 5 Prop", "Individual Bet 5 Result", "Individual Bet 5 Sport", "Individual Bet 5 League", "Individual Bet 5 Prop Category"
        ];

        let csv = headers.join(',') + '\n';
        this.bets.forEach(bet => {
            const row = [
                bet.date, bet.result, bet.type,
                bet.type === 'parlay' ? bet.playType || '' : '',
                bet.type === 'straight' ? bet.straightOdds || '' : '',
                bet.amountWagered.toFixed(2),
                bet.amountWonLoss.toFixed(2)
            ];
            const betsToExport = bet.individualBets || [];
            for (let i = 0; i < 5; i++) {
                const b = betsToExport[i];
                if (b) {
                    row.push(`"${b.player.replace(/"/g, '""')}"`);
                    row.push(`"${b.prop.replace(/"/g, '""')}"`);
                    row.push(`"${(bet.type === 'straight' ? bet.result : b.result).replace(/"/g, '""')}"`);
                    row.push(`"${(b.sport || '').replace(/"/g, '""')}"`);
                    row.push(`"${(b.league || '').replace(/"/g, '""')}"`);
                    row.push(`"${(b.propCategory || '').replace(/"/g, '""')}"`);
                } else {
                    row.push('', '', '', '', '', '');
                }
            }
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bet_history.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showInfoModal('Export Successful', 'Your bet data has been exported as "bet_history.csv".');
    }

    exportBetDataAsJson() {
        if (this.bets.length === 0) {
            this.showInfoModal('No Data to Export', 'Add some entries before exporting.');
            return;
        }
        const jsonStr = JSON.stringify(this.bets, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bet_history.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showInfoModal('Export Successful', 'Your bet data has been exported as "bet_history.json".');
    }

    showConfirmationModal(title, message, type = 'confirm') {
        if (!this.confirmationModal || !this.confirmationModalTitle || !this.confirmationModalMessage) return;
        this.confirmationModalTitle.textContent = title;
        this.confirmationModalMessage.textContent = message;
        if (type === 'info') {
            this.cancelClearBtn?.classList.add('hidden');
            if (this.confirmClearBtn) {
                this.confirmClearBtn.textContent = 'OK';
                this.confirmClearBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
                this.confirmClearBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }
        } else {
            this.cancelClearBtn?.classList.remove('hidden');
            if (this.confirmClearBtn) {
                this.confirmClearBtn.textContent = 'Confirm';
                this.confirmClearBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                this.confirmClearBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            }
        }
        // Set appropriate text and button colors based on theme
        if (document.body.classList.contains('dark')) {
            this.confirmationModalTitle.style.color = '#e2e8f0';
            this.confirmationModalMessage.style.color = '#cbd5e0';
            // Force red confirm button in dark mode
            if (this.confirmClearBtn && type !== 'info') {
                this.confirmClearBtn.style.backgroundColor = '#ef4444';
                this.confirmClearBtn.style.color = '#ffffff';
            }
        } else {
            // Reset to default colors for light mode
            this.confirmationModalTitle.style.color = '';
            this.confirmationModalMessage.style.color = '';
            if (this.confirmClearBtn) {
                this.confirmClearBtn.style.backgroundColor = '';
                this.confirmClearBtn.style.color = '';
            }
        }

        this.confirmationModal.classList.remove('hidden');
        setTimeout(() => this.confirmationModal.classList.add('show'), 10);
        this.confirmClearBtn?.focus();
    }

    showInfoModal(title, message) {
        this.pendingAction = { type: 'info' };
        this.showConfirmationModal(title, message, 'info');
    }

    hideConfirmationModal() {
        if (!this.confirmationModal) return;
        this.confirmationModal.classList.add('hidden');
        this.cancelClearBtn?.classList.remove('hidden');
        if (this.confirmClearBtn) {
            this.confirmClearBtn.textContent = 'Confirm';
            this.confirmClearBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            this.confirmClearBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        }
        this.pendingAction = null;
    }

    handleConfirmationClick() {
        const action = this.pendingAction;
        this.hideConfirmationModal();
        setTimeout(() => {
            if (!action) return;
            if (action === 'optOut') {
                this.executeOptOut();
            } else if (action.type === 'clear') {
                this.executeClearAllBets();
            } else if (action.type === 'delete' && typeof action.index === 'number') {
                this.executeDeleteBet(action.index);
            } else if (action.type === 'import' && action.data) {
                this.executeImportBetData(action.data);
            }
        }, 300);
    }

    executeClearAllBets() {
        this.saveStateForUndo();
        this.bets = [];
        this.saveData();
        this.renderBets();
        this.updateSummary();
        this.resetForm();
    }

    executeDeleteBet(index) {
        this.saveStateForUndo();
        this.bets.splice(index, 1);
        this.saveData();
        this.renderBets();
        this.updateSummary();
    }

    filterParlaysByDate() {
        let filtered = [...this.bets];
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError);
        let fromDate = this.filterFromDate ? new Date(this.filterFromDate + 'T00:00:00') : null;
        let toDate = this.filterToDate ? new Date(this.filterToDate + 'T23:59:59') : null;

        if (fromDate && toDate && fromDate > toDate) {
            this.showValidationError(this.filterFromDateInput, 'Start date cannot be after end date.', this.dateFilterError);
            return [];
        }
        if (fromDate) filtered = filtered.filter(bet => new Date(bet.date + 'T00:00:00') >= fromDate);
        if (toDate) filtered = filtered.filter(bet => new Date(bet.date + 'T00:00:00') <= toDate);

        return filtered;
    }

    renderBets() {
        if (!this.betHistoryContainer) return;
        this.betHistoryContainer.innerHTML = '';
        if (this.betTableBody) this.betTableBody.innerHTML = '';

        const filtered = this.filterParlaysByDate();
        if (filtered.length === 0) {
            this.noBetsMessage?.classList.remove('hidden');
            this.noBetsMessageDesktop?.classList.remove('hidden');
            if (this.totalBetsSpan) this.totalBetsSpan.textContent = '0';
            this.updateSummary();
            return;
        }
        this.noBetsMessage?.classList.add('hidden');
        this.noBetsMessageDesktop?.classList.add('hidden');

        const getResultTextColor = r => r === 'Win' ? 'text-green-600' : r === 'Loss' ? 'text-red-600' : r === 'Push' ? 'text-yellow-600' : '';

        filtered.forEach(bet => {
            const idx = this.bets.indexOf(bet);
            const formattedDate = new Date(bet.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            let tableDetails = '';
            let cardDetails = '';
            let viewBtn = '';

            // Shared function for formatting advanced details
            const formatAdvanced = b => {
                const details = [];
                if (b.sport) details.push(`Sport: <strong>${b.sport}</strong>`);
                if (b.league) details.push(`League: <strong>${b.league}</strong>`);
                if (b.propCategory) details.push(`Category: <strong>${b.propCategory}</strong>`);
                return details.length ? ` | ${details.join(' | ')}` : '';
            };

            if (bet.type === 'parlay') {
                // Table details: show only basic bet info
                const listItems = bet.individualBets.map(b => `<li>${b.player}: ${b.prop} (<span class="${getResultTextColor(b.result)}">${b.result}</span>)</li>`).join('');
                tableDetails = `<ul class="text-sm space-y-0.5 mb-1">${listItems}</ul>`;
                viewBtn = `<button class="view-individual-bets-btn text-blue-600 hover:text-blue-800 font-medium mt-1" data-index="${idx}">View All</button>`;
                
                // Card details: show basic + advanced details
                cardDetails = `<p class="text-sm font-medium bet-card-heading mb-1">Individual Bets:</p><ul class="parlay-card-bets">${bet.individualBets.map(b => `<li>${b.player}: ${b.prop} (<span class="${getResultTextColor(b.result)}">${b.result}</span>)<br><span class="text-xs bet-card-details">${formatAdvanced(b).substring(3)}</span></li>`).join('')}</ul>`;
            } else {
                const b = bet.individualBets?.[0];
                if (b) {
                    // Table details: show only basic bet info and odds
                    tableDetails = `<p class="text-sm mb-1"><strong>${b.player}</strong>: ${b.prop}</p><p class="text-sm">Odds: ${bet.straightOdds > 0 ? '+' : ''}${bet.straightOdds}</p>`;
                    viewBtn = `<button class="view-individual-bets-btn text-blue-600 hover:text-blue-800 font-medium mt-1" data-index="${idx}">View All</button>`;
                    
                    // Card details: show basic + advanced details
                    cardDetails = `<p class="text-sm font-medium bet-card-heading mb-1">Bet Details:</p><ul class="parlay-card-bets"><li><strong>${b.player}</strong>: ${b.prop}<br><span class="text-xs bet-card-details">${formatAdvanced(b).substring(3)}</span></li></ul><p class="text-sm font-medium bet-card-heading mt-2 mb-1">Odds:</p><p class="text-base font-semibold bet-card-heading">${bet.straightOdds > 0 ? '+' : ''}${bet.straightOdds}</p>`;
                } else {
                    tableDetails = `Odds: ${bet.straightOdds > 0 ? '+' : ''}${bet.straightOdds}`;
                    cardDetails = `<p class="text-sm font-medium bet-card-heading mb-1">Odds:</p><p class="text-base font-semibold bet-card-heading">${bet.straightOdds > 0 ? '+' : ''}${bet.straightOdds}</p>`;
                }
            }

            const displayProfit = this.calculateDisplayProfit(bet);
            const profitColor = displayProfit > 0 ? 'Win' : displayProfit < 0 ? 'Loss' : 'Push';

            // Desktop table row
            if (this.betTableBody) {
                this.betTableBody.insertAdjacentHTML('beforeend', `
                    <tr data-index="${idx}">
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">${formattedDate}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm font-medium ${getResultTextColor(bet.result)} text-center">${bet.result}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">${bet.type === 'parlay' ? bet.playType : 'Straight'}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">$${bet.amountWagered.toFixed(2)}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm font-medium ${getResultTextColor(profitColor)} text-center">$${displayProfit.toFixed(2)}</td>
                        <td class="px-3 py-4 text-sm text-gray-900">
                            <div class="flex justify-between items-start">
                                <div class="text-center flex-1">${tableDetails}</div>
                                <div class="ml-2">${viewBtn}</div>
                            </div>
                        </td>
                        <td class="px-3 py-4 text-center text-sm font-medium">
                            <div class="flex flex-col space-y-2">
                                <button class="edit-parlay-btn bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors duration-200" data-index="${idx}" aria-label="Edit bet entry from ${formattedDate}">Edit</button>
                                <button class="delete-parlay-btn bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-200" data-index="${idx}" aria-label="Delete bet entry from ${formattedDate}">Delete</button>
                            </div>
                        </td>
                    </tr>
                `);
            }

            // Mobile card view
            this.betHistoryContainer.insertAdjacentHTML('beforeend', `
                <div class="parlay-card border-gray-200 bg-white" data-index="${idx}">
                    <div class="parlay-card-summary">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">${formattedDate} - ${bet.type === 'parlay' ? bet.playType : 'Straight'}</h3>
                        <div class="parlay-card-detail"><span>Result:</span> <strong class="text-gray-800 ${getResultTextColor(bet.result)}">${bet.result}</strong></div>
                        <div class="parlay-card-detail"><span>Wagered:</span> <strong>$${bet.amountWagered.toFixed(2)}</strong></div>
                        <div class="parlay-card-detail"><span>Profit/Loss:</span> <strong class="text-gray-800 ${getResultTextColor(profitColor)}">$${displayProfit.toFixed(2)}</strong></div>
                    </div>
                    <div class="parlay-card-toggle-details hidden">${cardDetails}</div>
                    <div class="parlay-card-actions mt-4 flex flex-col justify-end gap-2">
                        <button class="edit-parlay-btn bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors duration-200" data-index="${idx}">Edit</button>
                        <button class="delete-parlay-btn bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-200" data-index="${idx}">Delete</button>
                    </div>
                </div>
            `);
        });

        this.updateSummary();
        this.applyDarkModeButtonStyles();
    }

    applyDarkModeButtonStyles() {
        if (!document.body.classList.contains('dark')) return;
        
        // Apply styles to Edit buttons
        document.querySelectorAll('.edit-parlay-btn').forEach(btn => {
            btn.style.backgroundColor = '#3b82f6';
            btn.style.color = '#ffffff';
        });
        
        // Apply styles to Delete buttons
        document.querySelectorAll('.delete-parlay-btn').forEach(btn => {
            btn.style.backgroundColor = '#ef4444';
            btn.style.color = '#ffffff';
        });
    }

    updateSummary() {
        if (!this.totalWageredSpan || !this.netProfitLossSpan || !this.totalWinsSpan || !this.totalLossesSpan || !this.totalPushesSpan || !this.totalBetsSpan || !this.successPercentageSpan) return;

        const filtered = this.filterParlaysByDate();

        let totalWagered = 0, totalWonLoss = 0, wins = 0, losses = 0, pushes = 0;
        let indWins = 0, indLosses = 0, indPushes = 0;

        filtered.forEach(bet => {
            totalWagered += bet.amountWagered;
            totalWonLoss += this.calculateDisplayProfit(bet);

            if (bet.result === 'Win') wins++;
            else if (bet.result === 'Loss') losses++;
            else if (bet.result === 'Push') pushes++;

            bet.individualBets?.forEach(b => {
                if (b.result === 'Win') indWins++;
                else if (b.result === 'Loss') indLosses++;
                else if (b.result === 'Push') indPushes++;
            });
        });

        this.totalWageredSpan.textContent = totalWagered.toFixed(2);
        this.netProfitLossSpan.textContent = totalWonLoss.toFixed(2);
        this.totalBetsSpan.textContent = filtered.length.toString();

        this.netProfitLossSpan.classList.remove('text-green-600', 'text-red-600', 'text-yellow-600');
        if (totalWonLoss > 0) this.netProfitLossSpan.classList.add('text-green-600');
        else if (totalWonLoss < 0) this.netProfitLossSpan.classList.add('text-red-600');
        else this.netProfitLossSpan.classList.add('text-yellow-600');

        // Update the toggle display based on current mode
        if (this.showingROI) {
            this.updateROIDisplay();
        } else {
            this.updateProfitLossDisplay();
        }

        this.totalWinsSpan.textContent = wins.toString();
        this.totalLossesSpan.textContent = losses.toString();
        this.totalPushesSpan.textContent = pushes.toString();

        this.totalWinsSpan.classList.add('text-green-700');
        this.totalLossesSpan.classList.add('text-red-700');
        this.totalPushesSpan.classList.add('text-yellow-700');

        let totalCount = 0, successful = 0;

        if (this.currentSuccessCalcMethod === 'bets') {
            totalCount = wins + losses + pushes;
            successful = wins;
        } else if (this.currentSuccessCalcMethod === 'straight') {
            const straights = filtered.filter(b => b.type === 'straight');
            const sWins = straights.filter(b => b.result === 'Win').length;
            const sLosses = straights.filter(b => b.result === 'Loss').length;
            const sPushes = straights.filter(b => b.result === 'Push').length;
            totalCount = sWins + sLosses + sPushes;
            successful = sWins;
        } else if (this.currentSuccessCalcMethod === 'parlays') {
            const parlays = filtered.filter(b => b.type === 'parlay');
            const pWins = parlays.filter(b => b.result === 'Win').length;
            const pLosses = parlays.filter(b => b.result === 'Loss').length;
            const pPushes = parlays.filter(b => b.result === 'Push').length;
            totalCount = pWins + pLosses + pPushes;
            successful = pWins;
        } else if (this.currentSuccessCalcMethod === 'individualBets') {
            totalCount = indWins + indLosses + indPushes;
            successful = indWins;
        }

        const percent = totalCount > 0 ? (successful / totalCount) * 100 : 0;
        this.successPercentageSpan.textContent = percent.toFixed(2);
    }

    handleSuccessCalcChange() {
        if (!this.successPercentageCalcSelect) return;
        this.currentSuccessCalcMethod = this.successPercentageCalcSelect.value;
        this.saveData();
        this.updateSummary();
    }

    handleDateFilterChange() {
        if (!this.filterFromDateInput || !this.filterToDateInput || !this.currentTimelineDisplay || !this.dateFilterError) return;

        this.filterFromDate = this.filterFromDateInput.value;
        this.filterToDate = this.filterToDateInput.value;
        this.clearValidationError(this.filterFromDateInput, this.dateFilterError);

        let fromDate = this.filterFromDate ? new Date(this.filterFromDate + 'T00:00:00') : null;
        let toDate = this.filterToDate ? new Date(this.filterToDate + 'T00:00:00') : null;

        if (fromDate && toDate && fromDate > toDate) {
            this.showValidationError(this.filterFromDateInput, 'Start date cannot be after end date.', this.dateFilterError);
            this.currentTimelineSummaryText = 'Invalid Date Range';
        } else {
            if (!this.filterFromDate && !this.filterToDate) {
                this.currentTimelineSummaryText = 'All Time';
            } else {
                const opts = { month: 'numeric', day: 'numeric', year: 'numeric' };
                const fStr = fromDate ? fromDate.toLocaleDateString('en-US', opts) : '';
                const tStr = toDate ? toDate.toLocaleDateString('en-US', opts) : '';
                if (fStr && tStr) this.currentTimelineSummaryText = `${fStr} - ${tStr}`;
                else if (fStr) this.currentTimelineSummaryText = `From: ${fStr}`;
                else if (tStr) this.currentTimelineSummaryText = `To: ${tStr}`;
            }
        }

        this.currentTimelineDisplay.textContent = this.currentTimelineSummaryText;
        this.saveData();
        this.renderBets();
    }

    applyPresetFilter(type) {
        this.clearAllValidationErrors();

        const today = new Date();
        const formatDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        let from = '', to = '', display = '';

        switch (type) {
            case 'clear':
                display = 'All Time';
                break;
            case 'last7Days':
                const d7 = new Date(today);
                d7.setDate(today.getDate() - 6);
                from = formatDate(d7);
                to = formatDate(today);
                display = 'Last 7 Days';
                break;
            case 'last30Days':
                const d30 = new Date(today);
                d30.setDate(today.getDate() - 29);
                from = formatDate(d30);
                to = formatDate(today);
                display = 'Last 30 Days';
                break;
            default: return;
        }

        if (this.filterFromDateInput) {
            this.filterFromDateInput.value = from;
            this.filterFromDate = from;
        }
        if (this.filterToDateInput) {
            this.filterToDateInput.value = to;
            this.filterToDate = to;
        }

        this.currentTimelineSummaryText = display;
        if (this.currentTimelineDisplay) this.currentTimelineDisplay.textContent = display;

        this.saveData();
        this.renderBets();
    }

    initializeUI() {
        this.applySavedTheme();
        this.handleBetTypeSelection(this.currentBetType);

        if (this.filterFromDateInput) this.filterFromDateInput.value = this.filterFromDate;
        if (this.filterToDateInput) this.filterToDateInput.value = this.filterToDate;

        if (this.currentTimelineDisplay) {
            if (!this.filterFromDate && !this.filterToDate) {
                this.currentTimelineSummaryText = 'All Time';
            }
            this.currentTimelineDisplay.textContent = this.currentTimelineSummaryText;
        }

        this.renderBets();
        this.updateSummary();
        this.resetForm();
        this.updateOptInButtonState();
        this.updateSmartInsights();
        this.checkAndShowWelcomeModal();
    }

    checkAndShowWelcomeModal() {
        if (!this.welcomeModal) return;
        const visited = localStorage.getItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED_BEFORE) === 'true';
        if (!visited) {
            this.welcomeModal.classList.remove('hidden');
            setTimeout(() => this.welcomeModal.classList.add('show'), 10);
            localStorage.setItem(ParlayTracker.STORAGE_KEYS.HAS_VISITED_BEFORE, 'true');
        }
    }

    closeWelcomeModal() {
        if (!this.welcomeModal) return;
        this.welcomeModal.classList.remove('show');
        setTimeout(() => this.welcomeModal.classList.add('hidden'), 300);
    }

    showCaseStudyModal() {
        if (!this.caseStudyModal) return;
        this.caseStudyModal.classList.remove('hidden');
    }

    hideCaseStudyModal() {
        if (!this.caseStudyModal) return;
        this.caseStudyModal.classList.add('hidden');
    }

    joinCaseStudy() {
        // Here you could add logic to opt the user into the case study
        // For now, we'll just show a confirmation and close the modal
        this.showInfoModal('Thank You!', 'You have been opted into our case study. Your anonymous data will help us understand betting patterns better. You can opt-out anytime using the button in the bottom left.');
        this.hideCaseStudyModal();
        
        // Store the opt-in preference
        localStorage.setItem('caseStudyOptIn', 'true');
        this.updateOptInButtonState();
    }

    optOutCaseStudy() {
        this.showConfirmationModal(
            'Opt Out of Case Study',
            'Are you sure you want to opt out? Your data will no longer be included in our research.',
            'confirm'
        );
        this.pendingAction = 'optOut';
    }

    executeOptOut() {
        localStorage.setItem('caseStudyOptIn', 'false');
        this.updateOptInButtonState();
        this.showInfoModal('Opted Out', 'You have been removed from the case study. You can opt back in anytime.');
    }

    updateOptInButtonState() {
        const optInBtn = document.getElementById('optInBtn');
        if (!optInBtn) return;

        const isOptedIn = localStorage.getItem('caseStudyOptIn') === 'true';
        
        if (isOptedIn) {
            // Gray styling for opt-out button
            optInBtn.className = 'fixed bottom-6 left-6 bg-gray-500 text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 z-50';
            optInBtn.textContent = 'Opt Out?';
            optInBtn.title = 'Click to leave case study';
            optInBtn.setAttribute('aria-label', 'Leave case study');
            optInBtn.onclick = () => this.optOutCaseStudy();
        } else {
            // Original green for opt-in button
            optInBtn.className = 'fixed bottom-6 left-6 bg-green-600 text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 z-50';
            optInBtn.textContent = 'Opt In?';
            optInBtn.title = 'Learn about case study participation';
            optInBtn.setAttribute('aria-label', 'Learn about case study participation');
            optInBtn.onclick = () => this.showCaseStudyModal();
        }
    }

    updateSmartInsights() {
        const insightText = document.getElementById('smartInsightText');
        if (!insightText || this.bets.length === 0) {
            if (insightText) insightText.textContent = "Track your bets to unlock personalized insights";
            return;
        }

        const insights = this.generateSmartInsights();
        if (insights.length > 0) {
            // Rotate through insights based on current time to give variety
            const currentInsight = insights[Date.now() % insights.length];
            insightText.textContent = currentInsight;
        }
    }

    generateSmartInsights() {
        const insights = [];
        const recentBets = this.getRecentBets(30); // Last 30 days
        const recentWeek = this.getRecentBets(7); // Last 7 days
        
        if (recentBets.length < 3) return insights; // Need some data for meaningful insights

        // Current streak analysis
        const currentStreak = this.getCurrentStreak();
        if (currentStreak.type === 'losing' && currentStreak.count >= 3) {
            insights.push(`${currentStreak.count}-game losing streak - stay disciplined with your bankroll`);
        } else if (currentStreak.type === 'winning' && currentStreak.count >= 3) {
            insights.push(`${currentStreak.count}-game winning streak - don't get overconfident`);
        }

        // Recent performance
        const weekWins = recentWeek.filter(bet => bet.result === 'win').length;
        const weekTotal = recentWeek.length;
        if (weekTotal >= 5) {
            const weekRate = Math.round((weekWins / weekTotal) * 100);
            const weekProfit = recentWeek.reduce((sum, bet) => sum + bet.amountWonLoss, 0);
            if (weekProfit > 0) {
                insights.push(`This week: ${weekWins}-${weekTotal - weekWins} (+$${weekProfit.toFixed(0)})`);
            } else {
                insights.push(`This week: ${weekWins}-${weekTotal - weekWins} (-$${Math.abs(weekProfit).toFixed(0)})`);
            }
        }

        // Bet size analysis
        const avgWinAmount = this.getAverageWinAmount(recentBets);
        const avgLossAmount = this.getAverageLossAmount(recentBets);
        if (avgLossAmount > avgWinAmount * 1.5) {
            insights.push(`Your losses average $${avgLossAmount.toFixed(0)}, wins $${avgWinAmount.toFixed(0)} - betting bigger when chasing?`);
        }

        // Team/player analysis
        const teamInsights = this.analyzeTeamPerformance(recentBets);
        insights.push(...teamInsights);

        // Bet type performance
        const parlayWins = recentBets.filter(bet => bet.betType === 'parlay' && bet.result === 'win').length;
        const parlayTotal = recentBets.filter(bet => bet.betType === 'parlay').length;
        const straightWins = recentBets.filter(bet => bet.betType === 'straight' && bet.result === 'win').length;
        const straightTotal = recentBets.filter(bet => bet.betType === 'straight').length;
        
        if (parlayTotal >= 5 && straightTotal >= 5) {
            const parlayRate = Math.round((parlayWins / parlayTotal) * 100);
            const straightRate = Math.round((straightWins / straightTotal) * 100);
            if (Math.abs(parlayRate - straightRate) >= 20) {
                const better = parlayRate > straightRate ? 'parlays' : 'straight bets';
                insights.push(`You're much better at ${better} (${Math.max(parlayRate, straightRate)}% vs ${Math.min(parlayRate, straightRate)}%)`);
            }
        }

        return insights;
    }

    getRecentBets(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.bets.filter(bet => new Date(bet.date) >= cutoffDate);
    }

    getCurrentStreak() {
        if (this.bets.length === 0) return { type: 'none', count: 0 };
        
        let count = 0;
        const lastResult = this.bets[this.bets.length - 1].result;
        
        for (let i = this.bets.length - 1; i >= 0; i--) {
            if (this.bets[i].result === lastResult) {
                count++;
            } else {
                break;
            }
        }
        
        return { type: lastResult === 'win' ? 'winning' : 'losing', count };
    }

    getAverageWinAmount(bets) {
        const wins = bets.filter(bet => bet.result === 'win');
        if (wins.length === 0) return 0;
        return wins.reduce((sum, bet) => sum + bet.amountWonLoss, 0) / wins.length;
    }

    getAverageLossAmount(bets) {
        const losses = bets.filter(bet => bet.result === 'loss');
        if (losses.length === 0) return 0;
        return Math.abs(losses.reduce((sum, bet) => sum + bet.amountWonLoss, 0) / losses.length);
    }

    analyzeTeamPerformance(bets) {
        const insights = [];
        const teamStats = {};
        
        // Common team names to look for
        const teams = ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Knicks', 'Bulls', 'Nets', 'Sixers', 'Bucks', 'Raptors',
                      'Chiefs', 'Bills', 'Cowboys', 'Patriots', 'Packers', 'Steelers', 'Ravens', '49ers', 'Rams', 'Bengals'];
        
        bets.forEach(bet => {
            const description = bet.playerProps ? bet.playerProps.join(' ') : '';
            teams.forEach(team => {
                if (description.toLowerCase().includes(team.toLowerCase())) {
                    if (!teamStats[team]) teamStats[team] = { wins: 0, total: 0, profit: 0 };
                    teamStats[team].total++;
                    teamStats[team].profit += bet.amountWonLoss;
                    if (bet.result === 'win') teamStats[team].wins++;
                }
            });
        });
        
        // Find teams with enough data and poor performance
        Object.entries(teamStats).forEach(([team, stats]) => {
            if (stats.total >= 4) {
                const winRate = Math.round((stats.wins / stats.total) * 100);
                if (winRate <= 33) {
                    insights.push(`${team} bets: ${stats.wins}-${stats.total - stats.wins} (${winRate}%) - consider avoiding`);
                } else if (winRate >= 67 && stats.profit > 0) {
                    insights.push(`${team} bets: ${stats.wins}-${stats.total - stats.wins} (${winRate}%) - your strong pick`);
                }
            }
        });
        
        return insights.slice(0, 1); // Limit to 1 team insight to avoid clutter
    }

    undoLastAction() {
        if (this.undoStack.length === 0) {
            this.showInfoModal('Undo Not Available', 'No more actions to undo.');
            return;
        }
        const prev = this.undoStack.pop();
        this.bets = prev.bets;
        this.saveData();
        this.renderBets();
        this.updateSummary();
        this.resetForm();
        this.showInfoModal('Undo Successful', 'Last action has been undone.');
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem(ParlayTracker.STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            icon.className = isDark ? 'fas fa-moon text-xl' : 'fas fa-sun text-xl';
            this.themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
        }
        this.applyDarkModeButtonStyles();
    }

    applySavedTheme() {
        const theme = localStorage.getItem(ParlayTracker.STORAGE_KEYS.THEME) || 'light';
        if (theme === 'dark') document.body.classList.add('dark');
        else document.body.classList.remove('dark');
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-moon text-xl' : 'fas fa-sun text-xl';
            this.themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        }
    }

    toggleFeedbackChatbox() {
        // Debounce to prevent rapid clicking
        if (this.feedbackToggleDebounce) {
            clearTimeout(this.feedbackToggleDebounce);
        }
        
        this.feedbackToggleDebounce = setTimeout(() => {
            if (!this.chatFormContainer || !this.openChatBtn) {
                console.warn('Feedback elements not found');
                return;
            }
            
            const isHidden = this.chatFormContainer.classList.contains('hidden');
            
            if (isHidden) {
                // Show the feedback form
                this.chatFormContainer.classList.remove('hidden');
                this.openChatBtn.innerHTML = '<i class="fas fa-times"></i>';
                this.openChatBtn.setAttribute('aria-label', 'Close feedback chat');
                
                // Use more reliable class management
                this.openChatBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                this.openChatBtn.classList.add('bg-red-500', 'hover:bg-red-600');
                
                // Focus with a small delay to ensure element is visible
                setTimeout(() => {
                    this.feedbackMessageInput?.focus();
                }, 100);
            } else {
                // Hide the feedback form
                this.chatFormContainer.classList.add('hidden');
                this.openChatBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
                this.openChatBtn.setAttribute('aria-label', 'Open feedback chat');
                
                // Use more reliable class management
                this.openChatBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
                this.openChatBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                
                if (this.feedbackMessageInput) {
                    this.feedbackMessageInput.value = '';
                }
            }
        }, 100); // 100ms debounce
    }

    sendFeedback(e) {
        e.preventDefault();
        if (!this.feedbackMessageInput) return;
        const msg = this.feedbackMessageInput.value.trim();
        if (!msg) {
            this.showInfoModal('Oops!', 'Please type a message before sending feedback.');
            return;
        }
        const subject = encodeURIComponent('Feedback for Are You Actually Winning?');
        const body = encodeURIComponent(msg);
        window.location.href = `mailto:${ParlayTracker.FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
        this.showInfoModal('Feedback Sent!', 'Your feedback has been sent. Thank you!');
        this.feedbackMessageInput.value = '';
        this.toggleFeedbackChatbox();
    }

    showIndividualBetDetailsModal(betIndex) {
        if (!this.individualBetDetailsModal || !this.individualBetDetailsTitle || !this.individualBetsList) return;
        const bet = this.bets[betIndex];
        if (!bet || !bet.individualBets?.length) {
            this.showInfoModal('No Individual Bet Details', 'This bet does not have individual bet details.');
            return;
        }
        const formattedDate = new Date(bet.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Calculate and display ROI in the title
        const displayProfit = this.calculateDisplayProfit(bet);
        const betROI = bet.amountWagered > 0 ? ((displayProfit / bet.amountWagered) * 100) : 0;
        const roiColor = betROI > 0 ? 'text-green-600' : betROI < 0 ? 'text-red-600' : 'text-yellow-600';
        
        this.individualBetDetailsTitle.innerHTML = `Individual Bets for ${formattedDate} <span class="text-sm font-normal">| ROI: <span class="${roiColor} font-semibold">${betROI.toFixed(1)}%</span></span>`;
        this.individualBetsList.innerHTML = '';

        const getColor = r => r === 'Win' ? 'text-green-600' : r === 'Loss' ? 'text-red-600' : r === 'Push' ? 'text-yellow-600' : '';

        bet.individualBets.forEach(b => {
            const li = document.createElement('li');
            li.className = 'p-3 rounded-md border border-gray-200 bg-white shadow-sm';

            const basic = document.createElement('p');
            basic.className = 'text-base font-semibold';
            const dispRes = bet.type === 'straight' ? bet.result : b.result;
            basic.innerHTML = `<strong>${b.player}</strong>: <span>${b.prop}</span> (<span class="${getColor(dispRes)}">${dispRes}</span>)`;
            li.appendChild(basic);

            const adv = [];
            if (b.sport) adv.push(`Sport: <strong>${b.sport}</strong>`);
            if (b.league) adv.push(`League: <strong>${b.league}</strong>`);
            if (b.propCategory) adv.push(`Category: <strong>${b.propCategory}</strong>`);
            if (adv.length > 0) {
                const advP = document.createElement('p');
                advP.className = 'text-xs text-gray-500 mt-1 space-x-2';
                advP.innerHTML = adv.join(' | ');
                li.appendChild(advP);
            }

            this.individualBetsList.appendChild(li);
        });

        // Apply appropriate text colors based on theme
        if (document.body.classList.contains('dark')) {
            this.individualBetDetailsTitle.style.color = '#e2e8f0';
            const allElements = this.individualBetDetailsModal.querySelectorAll('*');
            allElements.forEach(el => {
                if (!el.classList.contains('text-green-600') && 
                    !el.classList.contains('text-red-600') && 
                    !el.classList.contains('text-yellow-600')) {
                    el.style.color = '#e2e8f0';
                }
            });
        } else {
            // Reset to default colors for light mode
            this.individualBetDetailsTitle.style.color = '';
            const allElements = this.individualBetDetailsModal.querySelectorAll('*');
            allElements.forEach(el => {
                if (!el.classList.contains('text-green-600') && 
                    !el.classList.contains('text-red-600') && 
                    !el.classList.contains('text-yellow-600')) {
                    el.style.color = '';
                }
            });
        }

        this.individualBetDetailsModal.classList.remove('hidden');
        setTimeout(() => this.individualBetDetailsModal.classList.add('show'), 10);
    }

    hideIndividualBetDetailsModal() {
        if (!this.individualBetDetailsModal) return;
        this.individualBetDetailsModal.classList.add('hidden');
    }

    calculateDisplayProfit(bet) {
        // For parlays, calculate profit by subtracting wager from total return
        // For straight bets, use the stored amount directly (already calculated)
        if (bet.type === 'parlay' && bet.result === 'Win') {
            return bet.amountWonLoss - bet.amountWagered;
        }
        return bet.amountWonLoss;
    }

    toggleProfitLossDisplay() {
        if (!this.profitLossLabel || !this.profitLossValue) return;
        
        this.showingROI = !this.showingROI;
        
        if (this.showingROI) {
            this.profitLossLabel.textContent = 'ROI';
            this.updateROIDisplay();
        } else {
            this.profitLossLabel.textContent = 'Net Profit/Loss';
            this.updateProfitLossDisplay();
        }
    }

    updateProfitLossDisplay() {
        if (!this.profitLossValue || !this.netProfitLossSpan) return;
        
        const filtered = this.filterParlaysByDate();
        let totalWonLoss = 0;
        
        filtered.forEach(bet => {
            totalWonLoss += this.calculateDisplayProfit(bet);
        });
        
        this.profitLossValue.textContent = `$${totalWonLoss.toFixed(2)}`;
        
        // Apply color coding
        this.profitLossValue.classList.remove('text-green-600', 'text-red-600', 'text-yellow-600');
        if (totalWonLoss > 0) this.profitLossValue.classList.add('text-green-600');
        else if (totalWonLoss < 0) this.profitLossValue.classList.add('text-red-600');
        else this.profitLossValue.classList.add('text-yellow-600');
    }

    updateROIDisplay() {
        if (!this.profitLossValue) return;
        
        const filtered = this.filterParlaysByDate();
        let totalWagered = 0, totalWonLoss = 0;
        
        filtered.forEach(bet => {
            totalWagered += bet.amountWagered;
            totalWonLoss += this.calculateDisplayProfit(bet);
        });
        
        const roi = totalWagered > 0 ? ((totalWonLoss / totalWagered) * 100) : 0;
        this.profitLossValue.textContent = `${roi.toFixed(1)}%`;
        
        // Apply color coding
        this.profitLossValue.classList.remove('text-green-600', 'text-red-600', 'text-yellow-600');
        if (roi > 0) this.profitLossValue.classList.add('text-green-600');
        else if (roi < 0) this.profitLossValue.classList.add('text-red-600');
        else this.profitLossValue.classList.add('text-yellow-600');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParlayTracker();
});
