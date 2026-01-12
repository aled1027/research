/**
 * OpenRouter API integration for grammar checking
 * Uses tool calls for structured grammar issue extraction
 */

const GrammarAPI = {
    OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: 'anthropic/claude-3.5-sonnet',

    // Tool definition for grammar checking
    grammarCheckTool: {
        type: 'function',
        function: {
            name: 'report_grammar_issues',
            description: 'Report all grammar, spelling, punctuation, style, and clarity issues found in the text',
            parameters: {
                type: 'object',
                properties: {
                    issues: {
                        type: 'array',
                        description: 'List of grammar issues found',
                        items: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['spelling', 'grammar', 'punctuation', 'style', 'clarity'],
                                    description: 'The category of the issue'
                                },
                                original_text: {
                                    type: 'string',
                                    description: 'The exact text that contains the error (as it appears in the original)'
                                },
                                suggested_text: {
                                    type: 'string',
                                    description: 'The corrected version of the text'
                                },
                                message: {
                                    type: 'string',
                                    description: 'A brief explanation of the issue'
                                },
                                context_before: {
                                    type: 'string',
                                    description: 'A few words before the error for context (to help locate it)'
                                },
                                context_after: {
                                    type: 'string',
                                    description: 'A few words after the error for context (to help locate it)'
                                }
                            },
                            required: ['type', 'original_text', 'suggested_text', 'message']
                        }
                    },
                    summary: {
                        type: 'string',
                        description: 'A brief overall summary of the text quality'
                    }
                },
                required: ['issues']
            }
        }
    },

    /**
     * Check grammar using OpenRouter API with tool calls
     * @param {string} text - The text to check
     * @param {string} apiKey - OpenRouter API key
     * @returns {Promise<{issues: Array, summary: string}>}
     */
    async checkGrammar(text, apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        if (!text || text.trim().length === 0) {
            throw new Error('Text is required');
        }

        const systemPrompt = `You are an expert grammar and writing checker. Analyze the provided text for:

1. **Spelling errors**: Misspelled words, typos
2. **Grammar errors**: Subject-verb agreement, tense consistency, pronoun errors, double words (e.g., "the the"), missing words
3. **Punctuation errors**: Missing or incorrect commas, periods, apostrophes, quotation marks
4. **Style issues**: Awkward phrasing, passive voice overuse, wordiness
5. **Clarity issues**: Confusing sentences, ambiguous references, unclear meaning

Be thorough but avoid being overly pedantic. Focus on issues that genuinely impact readability and correctness.

IMPORTANT:
- The 'original_text' field must contain the EXACT text from the original, including any errors
- Include context_before and context_after when the same error text might appear multiple times
- Don't flag stylistic choices unless they genuinely harm clarity`;

        const response = await fetch(this.OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Grammar Checker'
            },
            body: JSON.stringify({
                model: this.MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Please check the following text for grammar, spelling, punctuation, style, and clarity issues:\n\n${text}` }
                ],
                tools: [this.grammarCheckTool],
                tool_choice: { type: 'function', function: { name: 'report_grammar_issues' } }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        }

        const data = await response.json();

        // Extract tool call results
        const message = data.choices?.[0]?.message;

        if (message?.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            if (toolCall.function?.name === 'report_grammar_issues') {
                try {
                    const result = JSON.parse(toolCall.function.arguments);
                    // Ensure issues is always an array
                    const issues = Array.isArray(result?.issues) ? result.issues : [];
                    return {
                        issues: issues,
                        summary: result?.summary || 'Analysis complete'
                    };
                } catch (e) {
                    console.error('Failed to parse tool call arguments:', e);
                    throw new Error('Failed to parse grammar check results');
                }
            }
        }

        // Fallback: if no tool call, return empty results
        return {
            issues: [],
            summary: 'No issues found'
        };
    },

    /**
     * Validate API key by making a minimal request
     * @param {string} apiKey - OpenRouter API key
     * @returns {Promise<boolean>}
     */
    async validateApiKey(apiKey) {
        try {
            const response = await fetch(this.OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'AI Grammar Checker'
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 1
                })
            });

            return response.ok;
        } catch (e) {
            return false;
        }
    }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarAPI;
}
