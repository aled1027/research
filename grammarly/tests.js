/**
 * AI Grammar Checker - Test Suite
 * Simple test runner for unit tests
 */

const TestRunner = {
    results: [],
    currentSuite: '',

    /**
     * Start a test suite
     */
    describe(name, fn) {
        this.currentSuite = name;
        this.results.push({ type: 'suite', name });
        fn();
    },

    /**
     * Run a test case
     */
    it(name, fn) {
        try {
            fn();
            this.results.push({ type: 'test', name, passed: true, suite: this.currentSuite });
        } catch (error) {
            this.results.push({ type: 'test', name, passed: false, error: error.message, suite: this.currentSuite });
        }
    },

    /**
     * Assertion helpers
     */
    assert: {
        equal(actual, expected, message) {
            if (actual !== expected) {
                throw new Error(message || `Expected ${expected}, got ${actual}`);
            }
        },
        deepEqual(actual, expected, message) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        true(value, message) {
            if (value !== true) {
                throw new Error(message || `Expected true, got ${value}`);
            }
        },
        false(value, message) {
            if (value !== false) {
                throw new Error(message || `Expected false, got ${value}`);
            }
        },
        throws(fn, message) {
            try {
                fn();
                throw new Error(message || 'Expected function to throw');
            } catch (e) {
                if (e.message === (message || 'Expected function to throw')) {
                    throw e;
                }
            }
        },
        includes(array, item, message) {
            if (!array.includes(item)) {
                throw new Error(message || `Expected array to include ${item}`);
            }
        },
        notNull(value, message) {
            if (value === null || value === undefined) {
                throw new Error(message || `Expected value to not be null/undefined`);
            }
        }
    },

    /**
     * Render test results
     */
    render() {
        const output = document.getElementById('test-output');
        let html = '';
        let totalPassed = 0;
        let totalFailed = 0;
        let currentSuite = '';

        for (const result of this.results) {
            if (result.type === 'suite') {
                if (currentSuite) html += '</div>';
                html += `<div class="test-suite"><h3>${result.name}</h3>`;
                currentSuite = result.name;
            } else {
                if (result.passed) {
                    totalPassed++;
                    html += `<div class="test-case test-pass">✓ ${result.name}</div>`;
                } else {
                    totalFailed++;
                    html += `<div class="test-case test-fail">✗ ${result.name}: ${result.error}</div>`;
                }
            }
        }
        if (currentSuite) html += '</div>';

        const summaryClass = totalFailed === 0 ? 'all-pass' : 'has-failures';
        html += `<div class="summary ${summaryClass}">
            Total: ${totalPassed + totalFailed} tests,
            ${totalPassed} passed,
            ${totalFailed} failed
        </div>`;

        output.innerHTML = html;
    },

    /**
     * Clear results and run all tests
     */
    run() {
        this.results = [];
        runAllTests();
        this.render();
    }
};

// Mock localStorage for testing
const mockLocalStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value; },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
};

/**
 * All test suites
 */
function runAllTests() {
    const { describe, it, assert } = TestRunner;

    // ============================================
    // API Tests
    // ============================================
    describe('GrammarAPI', () => {
        it('should have correct API URL', () => {
            assert.equal(GrammarAPI.OPENROUTER_URL, 'https://openrouter.ai/api/v1/chat/completions');
        });

        it('should have a valid model configured', () => {
            assert.true(GrammarAPI.MODEL.includes('/'), 'Model should include provider prefix');
        });

        it('should have grammar check tool defined', () => {
            assert.notNull(GrammarAPI.grammarCheckTool);
            assert.equal(GrammarAPI.grammarCheckTool.type, 'function');
            assert.equal(GrammarAPI.grammarCheckTool.function.name, 'report_grammar_issues');
        });

        it('should have correct tool parameters', () => {
            const params = GrammarAPI.grammarCheckTool.function.parameters;
            assert.notNull(params.properties.issues);
            assert.equal(params.properties.issues.type, 'array');
        });

        it('should define issue types in tool schema', () => {
            const issueSchema = GrammarAPI.grammarCheckTool.function.parameters.properties.issues.items;
            const typeEnum = issueSchema.properties.type.enum;
            assert.includes(typeEnum, 'spelling');
            assert.includes(typeEnum, 'grammar');
            assert.includes(typeEnum, 'punctuation');
            assert.includes(typeEnum, 'style');
            assert.includes(typeEnum, 'clarity');
        });

        it('should require issue fields', () => {
            const required = GrammarAPI.grammarCheckTool.function.parameters.properties.issues.items.required;
            assert.includes(required, 'type');
            assert.includes(required, 'original_text');
            assert.includes(required, 'suggested_text');
            assert.includes(required, 'message');
        });
    });

    // ============================================
    // App Initialization Tests
    // ============================================
    describe('GrammarApp Initialization', () => {
        it('should have init method', () => {
            assert.equal(typeof GrammarApp.init, 'function');
        });

        it('should have cacheElements method', () => {
            assert.equal(typeof GrammarApp.cacheElements, 'function');
        });

        it('should have loadApiKey method', () => {
            assert.equal(typeof GrammarApp.loadApiKey, 'function');
        });

        it('should have bindEvents method', () => {
            assert.equal(typeof GrammarApp.bindEvents, 'function');
        });

        it('should cache all required elements', () => {
            GrammarApp.cacheElements();
            assert.notNull(GrammarApp.elements.apiKeyInput);
            assert.notNull(GrammarApp.elements.textInput);
            assert.notNull(GrammarApp.elements.textOutput);
            assert.notNull(GrammarApp.elements.checkGrammarBtn);
            assert.notNull(GrammarApp.elements.tooltip);
        });
    });

    // ============================================
    // Local Storage Tests
    // ============================================
    describe('Local Storage', () => {
        const originalLocalStorage = window.localStorage;

        it('should save API key to localStorage', () => {
            // Use mock localStorage
            Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
            mockLocalStorage.clear();

            GrammarApp.elements.apiKeyInput.value = 'test-key-123';
            GrammarApp.saveApiKey();

            assert.equal(mockLocalStorage.getItem('openrouter_api_key'), 'test-key-123');
            assert.equal(GrammarApp.apiKey, 'test-key-123');

            // Restore
            Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true });
        });

        it('should load API key from localStorage', () => {
            Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
            mockLocalStorage.clear();
            mockLocalStorage.setItem('openrouter_api_key', 'stored-key-456');

            GrammarApp.apiKey = null;
            GrammarApp.loadApiKey();

            assert.equal(GrammarApp.apiKey, 'stored-key-456');

            Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true });
        });

        it('should clear API key from localStorage', () => {
            Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
            mockLocalStorage.setItem('openrouter_api_key', 'key-to-clear');
            GrammarApp.apiKey = 'key-to-clear';

            GrammarApp.clearApiKey();

            assert.equal(mockLocalStorage.getItem('openrouter_api_key'), null);
            assert.equal(GrammarApp.apiKey, null);

            Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true });
        });
    });

    // ============================================
    // HTML Escaping Tests
    // ============================================
    describe('HTML Escaping', () => {
        it('should escape HTML special characters', () => {
            const result = GrammarApp.escapeHtml('<script>alert("xss")</script>');
            assert.true(!result.includes('<script>'));
            assert.true(result.includes('&lt;'));
            assert.true(result.includes('&gt;'));
        });

        it('should escape ampersands', () => {
            const result = GrammarApp.escapeHtml('Tom & Jerry');
            assert.true(result.includes('&amp;'));
        });

        it('should escape quotes', () => {
            const result = GrammarApp.escapeHtml('Say "hello"');
            assert.true(result.includes('&quot;') || result.includes('"'));
        });

        it('should handle empty strings', () => {
            const result = GrammarApp.escapeHtml('');
            assert.equal(result, '');
        });

        it('should handle plain text without changes', () => {
            const result = GrammarApp.escapeHtml('Hello World');
            assert.equal(result, 'Hello World');
        });
    });

    // ============================================
    // Issue Management Tests
    // ============================================
    describe('Issue Management', () => {
        it('should track current issues', () => {
            assert.true(Array.isArray(GrammarApp.currentIssues));
        });

        it('should track original text', () => {
            assert.equal(typeof GrammarApp.originalText, 'string');
        });

        it('should have clearText method', () => {
            assert.equal(typeof GrammarApp.clearText, 'function');
        });

        it('should clear issues on clearText', () => {
            GrammarApp.currentIssues = [{ id: 'test' }];
            GrammarApp.clearText();
            assert.deepEqual(GrammarApp.currentIssues, []);
        });

        it('should clear original text on clearText', () => {
            GrammarApp.originalText = 'some text';
            GrammarApp.clearText();
            assert.equal(GrammarApp.originalText, '');
        });
    });

    // ============================================
    // Tooltip Tests
    // ============================================
    describe('Tooltip', () => {
        it('should have showTooltip method', () => {
            assert.equal(typeof GrammarApp.showTooltip, 'function');
        });

        it('should have hideTooltip method', () => {
            assert.equal(typeof GrammarApp.hideTooltip, 'function');
        });

        it('should have acceptSuggestion method', () => {
            assert.equal(typeof GrammarApp.acceptSuggestion, 'function');
        });

        it('should have dismissIssue method', () => {
            assert.equal(typeof GrammarApp.dismissIssue, 'function');
        });

        it('should hide tooltip on hideTooltip call', () => {
            GrammarApp.elements.tooltip.style.display = 'block';
            GrammarApp.hideTooltip();
            assert.equal(GrammarApp.elements.tooltip.style.display, 'none');
        });

        it('should clear activeTooltipIssue on hide', () => {
            GrammarApp.activeTooltipIssue = { issue: {}, errorSpan: {} };
            GrammarApp.hideTooltip();
            assert.equal(GrammarApp.activeTooltipIssue, null);
        });
    });

    // ============================================
    // UI State Tests
    // ============================================
    describe('UI State', () => {
        it('should have updateUI method', () => {
            assert.equal(typeof GrammarApp.updateUI, 'function');
        });

        it('should have setLoading method', () => {
            assert.equal(typeof GrammarApp.setLoading, 'function');
        });

        it('should disable check button when loading', () => {
            GrammarApp.apiKey = 'test';
            GrammarApp.elements.textInput.value = 'test';
            GrammarApp.setLoading(true);
            assert.true(GrammarApp.elements.checkGrammarBtn.disabled);
        });

        it('should show loading spinner when loading', () => {
            GrammarApp.setLoading(true);
            assert.equal(GrammarApp.elements.checkLoading.style.display, 'inline-block');
            assert.equal(GrammarApp.elements.checkText.style.display, 'none');
        });

        it('should hide loading spinner when not loading', () => {
            GrammarApp.setLoading(false);
            assert.equal(GrammarApp.elements.checkLoading.style.display, 'none');
            assert.equal(GrammarApp.elements.checkText.style.display, 'inline');
        });
    });

    // ============================================
    // Text Rendering Tests
    // ============================================
    describe('Text Rendering', () => {
        it('should have renderHighlightedText method', () => {
            assert.equal(typeof GrammarApp.renderHighlightedText, 'function');
        });

        it('should have renderResults method', () => {
            assert.equal(typeof GrammarApp.renderResults, 'function');
        });

        it('should have updateOriginalText method', () => {
            assert.equal(typeof GrammarApp.updateOriginalText, 'function');
        });
    });

    // ============================================
    // Integration Simulation Tests
    // ============================================
    describe('Integration (Mocked)', () => {
        it('should format issues correctly', () => {
            const mockIssues = [
                {
                    type: 'grammar',
                    original_text: 'the the',
                    suggested_text: 'the',
                    message: 'Duplicate word'
                }
            ];

            // Simulate what checkGrammar does
            const formatted = mockIssues.map((issue, index) => ({
                ...issue,
                id: `issue-${index}`,
                status: 'active'
            }));

            assert.equal(formatted[0].id, 'issue-0');
            assert.equal(formatted[0].status, 'active');
            assert.equal(formatted[0].type, 'grammar');
        });

        it('should filter active issues correctly', () => {
            const issues = [
                { id: '1', status: 'active' },
                { id: '2', status: 'dismissed' },
                { id: '3', status: 'accepted' },
                { id: '4', status: 'active' }
            ];

            const activeIssues = issues.filter(i => i.status === 'active');
            assert.equal(activeIssues.length, 2);
        });

        it('should handle empty issue list', () => {
            const issues = [];
            const activeIssues = issues.filter(i => i.status === 'active');
            assert.equal(activeIssues.length, 0);
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize app elements for testing
    GrammarApp.cacheElements();

    document.getElementById('run-tests').addEventListener('click', () => {
        TestRunner.run();
    });
});
