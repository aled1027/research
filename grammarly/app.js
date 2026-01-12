/**
 * AI Grammar Checker - Main Application
 */

const GrammarApp = {
    // State
    apiKey: null,
    currentIssues: [],
    originalText: '',

    // DOM Elements
    elements: {},

    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.loadApiKey();
        this.bindEvents();
        this.updateUI();
    },

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            // API Key
            apiKeyInput: document.getElementById('api-key-input'),
            apiKeyStatus: document.getElementById('api-key-status'),
            saveApiKeyBtn: document.getElementById('save-api-key'),
            clearApiKeyBtn: document.getElementById('clear-api-key'),
            apiKeyDetails: document.getElementById('api-key-details'),

            // Editor
            textInput: document.getElementById('text-input'),
            textOutput: document.getElementById('text-output'),
            checkGrammarBtn: document.getElementById('check-grammar'),
            checkText: document.getElementById('check-text'),
            checkLoading: document.getElementById('check-loading'),
            clearTextBtn: document.getElementById('clear-text'),

            // Results
            resultsSection: document.getElementById('results-section'),
            errorCount: document.getElementById('error-count'),
            issuesList: document.getElementById('issues-list'),
            legendSection: document.getElementById('legend-section'),

            // Tooltip
            tooltip: document.getElementById('tooltip'),
            tooltipType: document.querySelector('.tooltip-type'),
            tooltipMessage: document.querySelector('.tooltip-message'),
            tooltipSuggestion: document.querySelector('.tooltip-suggestion-text'),
            tooltipAccept: document.querySelector('.tooltip-accept'),
            tooltipDismiss: document.querySelector('.tooltip-dismiss')
        };
    },

    /**
     * Load API key from local storage
     */
    loadApiKey() {
        const stored = localStorage.getItem('openrouter_api_key');
        if (stored) {
            this.apiKey = stored;
            this.elements.apiKeyInput.value = stored;
            this.setApiKeyStatus('API key loaded from storage', 'success');
        }
    },

    /**
     * Save API key to local storage
     */
    saveApiKey() {
        const key = this.elements.apiKeyInput.value.trim();
        if (!key) {
            this.setApiKeyStatus('Please enter an API key', 'error');
            return;
        }

        localStorage.setItem('openrouter_api_key', key);
        this.apiKey = key;
        this.setApiKeyStatus('API key saved successfully', 'success');
        this.updateUI();

        // Close the details panel
        this.elements.apiKeyDetails.open = false;
    },

    /**
     * Clear API key from local storage
     */
    clearApiKey() {
        localStorage.removeItem('openrouter_api_key');
        this.apiKey = null;
        this.elements.apiKeyInput.value = '';
        this.setApiKeyStatus('API key cleared', 'success');
        this.updateUI();
    },

    /**
     * Set API key status message
     */
    setApiKeyStatus(message, type) {
        this.elements.apiKeyStatus.textContent = message;
        this.elements.apiKeyStatus.className = type;
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // API Key events
        this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.elements.clearApiKeyBtn.addEventListener('click', () => this.clearApiKey());

        // Editor events
        this.elements.checkGrammarBtn.addEventListener('click', () => this.checkGrammar());
        this.elements.clearTextBtn.addEventListener('click', () => this.clearText());
        this.elements.textInput.addEventListener('input', () => this.updateUI());

        // Tooltip events
        this.elements.tooltipAccept.addEventListener('click', () => this.acceptSuggestion());
        this.elements.tooltipDismiss.addEventListener('click', () => this.dismissIssue());

        // Close tooltip on outside click
        document.addEventListener('click', (e) => {
            if (!this.elements.tooltip.contains(e.target) &&
                !e.target.classList.contains('grammar-error')) {
                this.hideTooltip();
            }
        });

        // Close tooltip on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTooltip();
            }
        });
    },

    /**
     * Update UI state based on current data
     */
    updateUI() {
        const hasApiKey = !!this.apiKey;
        const hasText = this.elements.textInput.value.trim().length > 0;

        this.elements.checkGrammarBtn.disabled = !hasApiKey || !hasText;

        if (!hasApiKey) {
            this.elements.apiKeyDetails.open = true;
        }
    },

    /**
     * Clear text and reset
     */
    clearText() {
        this.elements.textInput.value = '';
        this.elements.textInput.style.display = 'block';
        this.elements.textOutput.style.display = 'none';
        this.elements.textOutput.innerHTML = '';
        this.elements.resultsSection.style.display = 'none';
        this.elements.legendSection.style.display = 'none';
        this.currentIssues = [];
        this.originalText = '';
        this.updateUI();
    },

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.elements.checkGrammarBtn.disabled = loading;
        this.elements.checkText.style.display = loading ? 'none' : 'inline';
        this.elements.checkLoading.style.display = loading ? 'inline-block' : 'none';
    },

    /**
     * Check grammar using API
     */
    async checkGrammar() {
        const text = this.elements.textInput.value.trim();
        if (!text || !this.apiKey) return;

        this.originalText = text;
        this.setLoading(true);
        this.hideTooltip();

        try {
            const result = await GrammarAPI.checkGrammar(text, this.apiKey);
            this.currentIssues = result.issues.map((issue, index) => ({
                ...issue,
                id: `issue-${index}`,
                status: 'active' // active, dismissed, accepted
            }));

            this.renderHighlightedText();
            this.renderResults();
        } catch (error) {
            console.error('Grammar check failed:', error);
            alert(`Grammar check failed: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Render text with highlighted errors
     */
    renderHighlightedText() {
        let html = this.escapeHtml(this.originalText);

        // Sort issues by position (we'll find and mark them in reverse order to preserve positions)
        const activeIssues = this.currentIssues.filter(i => i.status === 'active');

        // Create a map to track replacements and avoid conflicts
        const replacements = [];

        for (const issue of activeIssues) {
            const escapedOriginal = this.escapeHtml(issue.original_text);

            // Find all occurrences
            let searchStart = 0;
            while (true) {
                const index = html.indexOf(escapedOriginal, searchStart);
                if (index === -1) break;

                // Check if this position is already marked
                const alreadyMarked = replacements.some(r =>
                    (index >= r.start && index < r.end) ||
                    (index + escapedOriginal.length > r.start && index + escapedOriginal.length <= r.end)
                );

                if (!alreadyMarked) {
                    // If context is provided, verify it matches
                    let matches = true;
                    if (issue.context_before) {
                        const contextBefore = this.escapeHtml(issue.context_before);
                        const beforeInHtml = html.substring(Math.max(0, index - contextBefore.length - 10), index);
                        if (!beforeInHtml.includes(contextBefore)) {
                            matches = false;
                        }
                    }
                    if (issue.context_after && matches) {
                        const contextAfter = this.escapeHtml(issue.context_after);
                        const afterInHtml = html.substring(index + escapedOriginal.length,
                            Math.min(html.length, index + escapedOriginal.length + contextAfter.length + 10));
                        if (!afterInHtml.includes(contextAfter)) {
                            matches = false;
                        }
                    }

                    if (matches) {
                        replacements.push({
                            start: index,
                            end: index + escapedOriginal.length,
                            original: escapedOriginal,
                            issue: issue
                        });
                        break; // Found a match for this issue
                    }
                }

                searchStart = index + 1;
            }
        }

        // Sort replacements by position (descending) to replace from end to start
        replacements.sort((a, b) => b.start - a.start);

        // Apply replacements
        for (const r of replacements) {
            const span = `<span class="grammar-error error-${r.issue.type}" data-issue-id="${r.issue.id}">${r.original}</span>`;
            html = html.substring(0, r.start) + span + html.substring(r.end);
        }

        // Convert newlines to <br>
        html = html.replace(/\n/g, '<br>');

        this.elements.textOutput.innerHTML = html;
        this.elements.textInput.style.display = 'none';
        this.elements.textOutput.style.display = 'block';

        // Add click handlers to error spans
        this.elements.textOutput.querySelectorAll('.grammar-error').forEach(span => {
            span.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showTooltip(span);
            });
        });
    },

    /**
     * Render results summary and issue list
     */
    renderResults() {
        const activeIssues = this.currentIssues.filter(i => i.status === 'active');
        this.elements.errorCount.textContent = activeIssues.length;

        // Render issue list
        this.elements.issuesList.innerHTML = activeIssues.map(issue => `
            <div class="issue-item ${issue.type}" data-issue-id="${issue.id}">
                <span class="issue-type-badge ${issue.type}">${issue.type}</span>
                <div class="issue-content">
                    <div class="issue-text">"${this.escapeHtml(issue.original_text)}" → "${this.escapeHtml(issue.suggested_text)}"</div>
                    <div class="issue-message">${this.escapeHtml(issue.message)}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers to issue items
        this.elements.issuesList.querySelectorAll('.issue-item').forEach(item => {
            item.addEventListener('click', () => {
                const issueId = item.dataset.issueId;
                const errorSpan = this.elements.textOutput.querySelector(`[data-issue-id="${issueId}"]`);
                if (errorSpan) {
                    errorSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    this.showTooltip(errorSpan);
                }
            });
        });

        this.elements.resultsSection.style.display = 'block';
        this.elements.legendSection.style.display = 'block';
    },

    /**
     * Currently active tooltip data
     */
    activeTooltipIssue: null,

    /**
     * Show tooltip for an error
     */
    showTooltip(errorSpan) {
        const issueId = errorSpan.dataset.issueId;
        const issue = this.currentIssues.find(i => i.id === issueId);
        if (!issue || issue.status !== 'active') return;

        this.activeTooltipIssue = { issue, errorSpan };

        // Update tooltip content
        this.elements.tooltipType.textContent = issue.type;
        this.elements.tooltipType.className = `tooltip-type ${issue.type}`;
        this.elements.tooltipMessage.textContent = issue.message;
        this.elements.tooltipSuggestion.textContent = issue.suggested_text;

        // Position tooltip near the error
        const rect = errorSpan.getBoundingClientRect();
        const tooltip = this.elements.tooltip;

        // Show tooltip to calculate its dimensions
        tooltip.style.display = 'block';
        tooltip.style.visibility = 'hidden';

        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate position
        let left = rect.left;
        let top = rect.bottom + 8;

        // Adjust if tooltip would overflow right edge
        if (left + tooltipRect.width > viewportWidth - 20) {
            left = viewportWidth - tooltipRect.width - 20;
        }

        // Adjust if tooltip would overflow left edge
        if (left < 20) {
            left = 20;
        }

        // If tooltip would overflow bottom, show above
        if (top + tooltipRect.height > viewportHeight - 20) {
            top = rect.top - tooltipRect.height - 8;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.visibility = 'visible';

        // Highlight the current error
        document.querySelectorAll('.grammar-error').forEach(el => el.classList.remove('focused'));
        errorSpan.classList.add('focused');
    },

    /**
     * Hide the tooltip
     */
    hideTooltip() {
        this.elements.tooltip.style.display = 'none';
        this.activeTooltipIssue = null;
        document.querySelectorAll('.grammar-error.focused').forEach(el => el.classList.remove('focused'));
    },

    /**
     * Accept the current suggestion
     */
    acceptSuggestion() {
        if (!this.activeTooltipIssue) return;

        const { issue, errorSpan } = this.activeTooltipIssue;

        // Update the text in the output
        errorSpan.textContent = issue.suggested_text;
        errorSpan.classList.add('accepted');
        errorSpan.classList.remove(`error-${issue.type}`);

        // Update issue status
        issue.status = 'accepted';

        // Update the original text for potential re-checking
        this.updateOriginalText();

        // Update results
        this.renderResults();
        this.hideTooltip();
    },

    /**
     * Dismiss the current issue
     */
    dismissIssue() {
        if (!this.activeTooltipIssue) return;

        const { issue, errorSpan } = this.activeTooltipIssue;

        // Mark as dismissed visually
        errorSpan.classList.add('dismissed');

        // Update issue status
        issue.status = 'dismissed';

        // Update results
        this.renderResults();
        this.hideTooltip();
    },

    /**
     * Update original text based on current output state
     */
    updateOriginalText() {
        // Get text content from output, converting <br> back to newlines
        let text = this.elements.textOutput.innerHTML;
        text = text.replace(/<br\s*\/?>/gi, '\n');

        // Create temp element to extract text
        const temp = document.createElement('div');
        temp.innerHTML = text;
        this.originalText = temp.textContent || temp.innerText;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GrammarApp.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarApp;
}
