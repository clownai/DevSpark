// DevSpark IDE - AI Integration UI Components
// This file contains the UI components for AI integration

class AIIntegrationUI {
    constructor() {
        this.aiService = window.aiService;
        this.chatPanel = document.querySelector('.ai-chat-panel');
        this.chatMessages = document.querySelector('.chat-messages');
        this.chatInput = document.querySelector('.chat-input input');
        this.chatSendButton = document.querySelector('.chat-input button');
        this.aiChatButton = document.querySelector('.ai-chat-button');
        
        // Inline suggestion elements
        this.inlineSuggestionContainer = null;
        this.currentInlineSuggestions = [];
        
        // Code action elements
        this.codeActionContainer = null;
        
        // Initialize UI
        this.initialize();
    }
    
    // Initialize the AI Integration UI
    initialize() {
        console.log('AI Integration UI initialized');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Create inline suggestion container
        this.createInlineSuggestionContainer();
        
        // Create code action container
        this.createCodeActionContainer();
        
        return this;
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Chat panel toggle
        if (this.aiChatButton) {
            this.aiChatButton.addEventListener('click', () => {
                this.toggleChatPanel();
            });
        }
        
        // Chat panel close button
        const closeButton = document.querySelector('.ai-chat-panel .panel-actions i.fa-times');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.toggleChatPanel(false);
            });
        }
        
        // Chat input
        if (this.chatInput && this.chatSendButton) {
            // Send message on button click
            this.chatSendButton.addEventListener('click', () => {
                this.sendChatMessage();
            });
            
            // Send message on Enter key
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
        
        // Editor events for inline suggestions
        if (window.editor) {
            // Listen for cursor position changes
            window.editor.onDidChangeCursorPosition((e) => {
                this.hideInlineSuggestions();
            });
            
            // Listen for content changes
            window.editor.onDidChangeModelContent((e) => {
                this.checkForInlineSuggestions();
            });
            
            // Add keyboard shortcut for AI actions
            window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
                this.showCodeActions();
            });
        }
    }
    
    // Toggle the chat panel
    toggleChatPanel(show) {
        if (!this.chatPanel) return;
        
        if (show === undefined) {
            // Toggle
            this.chatPanel.classList.toggle('hidden');
        } else if (show) {
            // Show
            this.chatPanel.classList.remove('hidden');
        } else {
            // Hide
            this.chatPanel.classList.add('hidden');
        }
        
        // Focus input when showing
        if (!this.chatPanel.classList.contains('hidden') && this.chatInput) {
            this.chatInput.focus();
        }
    }
    
    // Send a chat message
    async sendChatMessage() {
        if (!this.chatInput || !this.chatMessages) return;
        
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addChatMessage('user', message);
        
        // Clear input
        this.chatInput.value = '';
        
        // Show loading indicator
        this.addChatMessage('ai', '...', true);
        
        try {
            // Process message with AI service
            const response = await this.aiService.processChatMessage(message);
            
            // Remove loading indicator
            this.removeLoadingIndicator();
            
            // Handle response based on type
            if (response.type === 'error') {
                this.addChatMessage('ai', `Error: ${response.message}`);
            } else if (response.type === 'code') {
                this.addChatMessage('ai', response.message, false, response.code, response.language);
            } else if (response.type === 'explanation') {
                this.addChatMessage('ai', response.message, false, response.explanation);
            } else if (response.type === 'refactoring') {
                this.addRefactoringSuggestions(response.suggestions);
            } else {
                this.addChatMessage('ai', response.message);
            }
        } catch (error) {
            // Remove loading indicator
            this.removeLoadingIndicator();
            
            // Show error
            this.addChatMessage('ai', `Error: ${error.message}`);
        }
    }
    
    // Add a message to the chat
    addChatMessage(sender, message, isLoading = false, codeOrExplanation = null, language = null) {
        if (!this.chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        if (sender === 'ai') {
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${message}</div>
                </div>
            `;
            
            // Add loading class if needed
            if (isLoading) {
                messageElement.classList.add('loading');
            }
            
            // Add code block if provided
            if (codeOrExplanation && language) {
                const codeElement = document.createElement('div');
                codeElement.className = 'message-code';
                codeElement.innerHTML = `
                    <pre><code class="language-${language}">${this.escapeHtml(codeOrExplanation)}</code></pre>
                    <button class="copy-code-button"><i class="fas fa-copy"></i> Copy</button>
                    <button class="insert-code-button"><i class="fas fa-file-import"></i> Insert</button>
                `;
                messageElement.querySelector('.message-content').appendChild(codeElement);
                
                // Add event listeners for buttons
                setTimeout(() => {
                    const copyButton = codeElement.querySelector('.copy-code-button');
                    const insertButton = codeElement.querySelector('.insert-code-button');
                    
                    if (copyButton) {
                        copyButton.addEventListener('click', () => {
                            this.copyToClipboard(codeOrExplanation);
                            this.showNotification('Code copied to clipboard');
                        });
                    }
                    
                    if (insertButton) {
                        insertButton.addEventListener('click', () => {
                            this.insertCodeToEditor(codeOrExplanation);
                            this.showNotification('Code inserted into editor');
                        });
                    }
                }, 0);
            } else if (codeOrExplanation) {
                // This is an explanation without code
                const explanationElement = document.createElement('div');
                explanationElement.className = 'message-explanation';
                explanationElement.textContent = codeOrExplanation;
                messageElement.querySelector('.message-content').appendChild(explanationElement);
            }
        } else {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${message}</div>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // Remove loading indicator
    removeLoadingIndicator() {
        const loadingMessage = this.chatMessages.querySelector('.message.ai.loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
    
    // Add refactoring suggestions to chat
    addRefactoringSuggestions(suggestions) {
        if (!this.chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai';
        
        let suggestionsHtml = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">Here are some refactoring suggestions:</div>
                <div class="refactoring-suggestions">
        `;
        
        suggestions.forEach((suggestion, index) => {
            suggestionsHtml += `
                <div class="refactoring-suggestion">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                    <div class="suggestion-code">
                        <div class="code-comparison">
                            <div class="code-before">
                                <div class="code-label">Before:</div>
                                <pre><code class="language-javascript">${this.escapeHtml(suggestion.before)}</code></pre>
                            </div>
                            <div class="code-after">
                                <div class="code-label">After:</div>
                                <pre><code class="language-javascript">${this.escapeHtml(suggestion.after)}</code></pre>
                            </div>
                        </div>
                        <button class="apply-refactoring-button" data-index="${index}">Apply Refactoring</button>
                    </div>
                </div>
            `;
        });
        
        suggestionsHtml += `
                </div>
            </div>
        `;
        
        messageElement.innerHTML = suggestionsHtml;
        this.chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Add event listeners for apply buttons
        setTimeout(() => {
            const applyButtons = messageElement.querySelectorAll('.apply-refactoring-button');
            applyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const index = parseInt(button.getAttribute('data-index'));
                    const suggestion = suggestions[index];
                    if (suggestion) {
                        this.applyRefactoring(suggestion);
                    }
                });
            });
        }, 0);
    }
    
    // Apply a refactoring suggestion
    applyRefactoring(suggestion) {
        if (!window.editor) return;
        
        // In a real implementation, this would use a more sophisticated approach
        // to find and replace the code. For now, we'll just insert the "after" code
        // at the current cursor position.
        
        const position = window.editor.getPosition();
        window.editor.executeEdits('ai-refactoring', [
            {
                range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                ),
                text: suggestion.after
            }
        ]);
        
        this.showNotification('Refactoring applied');
    }
    
    // Create inline suggestion container
    createInlineSuggestionContainer() {
        // Create container if it doesn't exist
        if (!this.inlineSuggestionContainer) {
            this.inlineSuggestionContainer = document.createElement('div');
            this.inlineSuggestionContainer.className = 'inline-suggestion-container hidden';
            document.body.appendChild(this.inlineSuggestionContainer);
        }
    }
    
    // Check for inline suggestions
    async checkForInlineSuggestions() {
        if (!window.editor) return;
        
        // Get current position and line
        const position = window.editor.getPosition();
        const model = window.editor.getModel();
        if (!model) return;
        
        const line = model.getLineContent(position.lineNumber);
        const prefix = line.substring(0, position.column);
        
        // Only check if prefix ends with a trigger character or after a delay
        const triggerCharacters = ['.', '(', '{', '[', ',', ' '];
        const lastChar = prefix.charAt(prefix.length - 1);
        
        if (!triggerCharacters.includes(lastChar)) return;
        
        try {
            // Get suggestions from AI service
            const suggestions = await this.aiService.getInlineSuggestions(prefix);
            
            if (suggestions && suggestions.length > 0) {
                this.showInlineSuggestions(suggestions, position);
            }
        } catch (error) {
            console.error('Error getting inline suggestions:', error);
        }
    }
    
    // Show inline suggestions
    showInlineSuggestions(suggestions, position) {
        if (!this.inlineSuggestionContainer || !window.editor) return;
        
        // Store current suggestions
        this.currentInlineSuggestions = suggestions;
        
        // Clear container
        this.inlineSuggestionContainer.innerHTML = '';
        
        // Create suggestion elements
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'inline-suggestion';
            suggestionElement.innerHTML = `
                <div class="suggestion-label">${suggestion.label}</div>
                <div class="suggestion-documentation">${suggestion.documentation || ''}</div>
            `;
            
            // Add click event
            suggestionElement.addEventListener('click', () => {
                this.applyInlineSuggestion(suggestion);
            });
            
            this.inlineSuggestionContainer.appendChild(suggestionElement);
        });
        
        // Position container
        const editorCoords = window.editor.getScrolledVisiblePosition(position);
        const editorContainer = document.getElementById('monaco-editor-container');
        const editorRect = editorContainer.getBoundingClientRect();
        
        this.inlineSuggestionContainer.style.left = (editorRect.left + editorCoords.left) + 'px';
        this.inlineSuggestionContainer.style.top = (editorRect.top + editorCoords.top + 20) + 'px';
        
        // Show container
        this.inlineSuggestionContainer.classList.remove('hidden');
    }
    
    // Hide inline suggestions
    hideInlineSuggestions() {
        if (!this.inlineSuggestionContainer) return;
        
        this.inlineSuggestionContainer.classList.add('hidden');
        this.currentInlineSuggestions = [];
    }
    
    // Apply an inline suggestion
    applyInlineSuggestion(suggestion) {
        if (!window.editor) return;
        
        // Get current position
        const position = window.editor.getPosition();
        
        // Insert text
        window.editor.executeEdits('ai-suggestion', [
            {
                range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                ),
                text: suggestion.insertText
            }
        ]);
        
        // Hide suggestions
        this.hideInlineSuggestions();
    }
    
    // Create code action container
    createCodeActionContainer() {
        // Create container if it doesn't exist
        if (!this.codeActionContainer) {
            this.codeActionContainer = document.createElement('div');
            this.codeActionContainer.className = 'code-action-container hidden';
            document.body.appendChild(this.codeActionContainer);
        }
    }
    
    // Show code actions
    showCodeActions() {
        if (!this.codeActionContainer || !window.editor) return;
        
        // Get current selection
        const selection = window.editor.getSelection();
        if (!selection) return;
        
        // Get selected text
        const model = window.editor.getModel();
        if (!model) return;
        
        const selectedText = model.getValueInRange(selection);
        if (!selectedText) return;
        
        // Clear container
        this.codeActionContainer.innerHTML = '';
        
        // Create action elements
        const actions = [
            { id: 'explain', label: 'Explain Code', icon: 'fa-question-circle' },
            { id: 'refactor', label: 'Suggest Refactoring', icon: 'fa-magic' },
            { id: 'optimize', label: 'Optimize Code', icon: 'fa-bolt' },
            { id: 'document', label: 'Generate Documentation', icon: 'fa-file-alt' }
        ];
        
        actions.forEach(action => {
            const actionElement = document.createElement('div');
            actionElement.className = 'code-action';
            actionElement.innerHTML = `
                <i class="fas ${action.icon}"></i>
                <span>${action.label}</span>
            `;
            
            // Add click event
            actionElement.addEventListener('click', () => {
                this.executeCodeAction(action.id, selectedText);
                this.hideCodeActions();
            });
            
            this.codeActionContainer.appendChild(actionElement);
        });
        
        // Position container
        const editorCoords = window.editor.getScrolledVisiblePosition({
            lineNumber: selection.endLineNumber,
            column: selection.endColumn
        });
        const editorContainer = document.getElementById('monaco-editor-container');
        const editorRect = editorContainer.getBoundingClientRect();
        
        this.codeActionContainer.style.left = (editorRect.left + editorCoords.left) + 'px';
        this.codeActionContainer.style.top = (editorRect.top + editorCoords.top + 20) + 'px';
        
        // Show container
        this.codeActionContainer.classList.remove('hidden');
        
        // Add click outside listener
        document.addEventListener('click', this.handleClickOutside);
    }
    
    // Hide code actions
    hideCodeActions() {
        if (!this.codeActionContainer) return;
        
        this.codeActionContainer.classList.add('hidden');
        
        // Remove click outside listener
        document.removeEventListener('click', this.handleClickOutside);
    }
    
    // Handle click outside code actions
    handleClickOutside = (e) => {
        if (this.codeActionContainer && !this.codeActionContainer.contains(e.target)) {
            this.hideCodeActions();
        }
    }
    
    // Execute a code action
    async executeCodeAction(actionId, code) {
        // Show AI chat panel
        this.toggleChatPanel(true);
        
        // Add user message
        let actionMessage = '';
        switch (actionId) {
            case 'explain':
                actionMessage = 'Please explain this code:';
                break;
            case 'refactor':
                actionMessage = 'Please suggest refactoring for this code:';
                break;
            case 'optimize':
                actionMessage = 'Please optimize this code:';
                break;
            case 'document':
                actionMessage = 'Please generate documentation for this code:';
                break;
        }
        
        this.addChatMessage('user', `${actionMessage}\n\n\`\`\`\n${code}\n\`\`\``);
        
        // Show loading indicator
        this.addChatMessage('ai', '...', true);
        
        try {
            let response;
            
            // Process action with AI service
            switch (actionId) {
                case 'explain':
                    response = await this.aiService.getCodeExplanation(code);
                    break;
                case 'refactor':
                    response = await this.aiService.getRefactoringSuggestions(code);
                    break;
                case 'optimize':
                case 'document':
                    // For demo purposes, use the chat message processing
                    response = await this.aiService.processChatMessage(actionMessage + ' ' + code);
                    break;
            }
            
            // Remove loading indicator
            this.removeLoadingIndicator();
            
            // Handle response based on type
            if (response.type === 'error') {
                this.addChatMessage('ai', `Error: ${response.message}`);
            } else if (response.type === 'explanation') {
                this.addChatMessage('ai', 'Here\'s an explanation of your code:', false, response.explanation);
            } else if (response.type === 'refactoring') {
                this.addRefactoringSuggestions(response.suggestions);
            } else if (response.type === 'code') {
                this.addChatMessage('ai', response.message, false, response.code, response.language);
            } else {
                this.addChatMessage('ai', response.message);
            }
        } catch (error) {
            // Remove loading indicator
            this.removeLoadingIndicator();
            
            // Show error
            this.addChatMessage('ai', `Error: ${error.message}`);
        }
    }
    
    // Copy text to clipboard
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    // Insert code to editor
    insertCodeToEditor(code) {
        if (!window.editor) return;
        
        // Get current position
        const position = window.editor.getPosition();
        
        // Insert code
        window.editor.executeEdits('ai-insert', [
            {
                range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                ),
                text: code
            }
        ]);
    }
    
    // Show notification
    showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.ai-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'ai-notification';
            document.body.appendChild(notification);
        }
        
        // Set message
        notification.textContent = message;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Escape HTML special characters
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Initialize AI Integration UI when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for AI service to be initialized
    const checkAIService = setInterval(() => {
        if (window.aiService) {
            clearInterval(checkAIService);
            window.aiIntegrationUI = new AIIntegrationUI();
        }
    }, 100);
});
