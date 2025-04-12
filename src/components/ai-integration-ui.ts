// DevSpark IDE - AI Integration UI Components
// This file contains the UI components for AI integration
interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface CodeSuggestion {
  code: string;
  description: string;
  confidence: number;
}

interface AIService {
  generateCompletion(prompt: string, context?: string): Promise<string>;
  generateInlineSuggestion(code: string, position: number): Promise<CodeSuggestion[]>;
  generateCodeAction(code: string, selection: string): Promise<string[]>;
}

declare global {
  interface Window {
    aiService: AIService;
  }
}

class AIIntegrationUI {
    private aiService: AIService;
    private chatPanel: HTMLElement | null;
    private chatMessages: HTMLElement | null;
    private chatInput: HTMLInputElement | null;
    private chatSendButton: HTMLButtonElement | null;
    private aiChatButton: HTMLElement | null;
    
    // Inline suggestion elements
    private inlineSuggestionContainer: HTMLElement | null;
    private currentInlineSuggestions: CodeSuggestion[];
    
    // Code action elements
    private codeActionContainer: HTMLElement | null;
    
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
    initialize(): AIIntegrationUI {
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
    private setupEventListeners(): void {
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
                this.hideChatPanel();
            });
        }
        
        // Chat send button
        if (this.chatSendButton) {
            this.chatSendButton.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }
        
        // Chat input enter key
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }
    
    // Toggle chat panel visibility
    private toggleChatPanel(): void {
        if (this.chatPanel) {
            this.chatPanel.classList.toggle('visible');
            
            if (this.chatPanel.classList.contains('visible')) {
                this.chatInput?.focus();
            }
        }
    }
    
    // Hide chat panel
    private hideChatPanel(): void {
        if (this.chatPanel) {
            this.chatPanel.classList.remove('visible');
        }
    }
    
    // Show chat panel
    private showChatPanel(): void {
        if (this.chatPanel) {
            this.chatPanel.classList.add('visible');
            this.chatInput?.focus();
        }
    }
    
    // Send chat message
    private async sendChatMessage(): Promise<void> {
        if (!this.chatInput || !this.chatInput.value.trim()) {
            return;
        }
        
        const userMessage = this.chatInput.value.trim();
        this.chatInput.value = '';
        
        // Add user message to chat
        this.addChatMessage('user', userMessage);
        
        try {
            // Get current editor content for context
            const editorContent = window.monaco?.editor?.getModels()[0]?.getValue() || '';
            
            // Get AI response
            const aiResponse = await this.aiService.generateCompletion(userMessage, editorContent);
            
            // Add AI response to chat
            this.addChatMessage('ai', aiResponse);
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.addChatMessage('ai', 'Sorry, I encountered an error processing your request.');
        }
    }
    
    // Add message to chat
    private addChatMessage(sender: 'user' | 'ai', message: string): void {
        if (!this.chatMessages) {
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        
        // Handle code blocks in messages
        const formattedMessage = this.formatMessageWithCodeBlocks(message);
        contentElement.innerHTML = formattedMessage;
        
        messageElement.appendChild(contentElement);
        
        // Add timestamp
        const timestampElement = document.createElement('div');
        timestampElement.classList.add('message-timestamp');
        const now = new Date();
        timestampElement.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        messageElement.appendChild(timestampElement);
        
        this.chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // Format message with code blocks
    private formatMessageWithCodeBlocks(message: string): string {
        // Replace code blocks with formatted HTML
        return message.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, (match, language, code) => {
            return `<pre class="code-block ${language}"><code>${this.escapeHtml(code)}</code></pre>`;
        });
    }
    
    // Escape HTML
    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Create inline suggestion container
    private createInlineSuggestionContainer(): void {
        this.inlineSuggestionContainer = document.createElement('div');
        this.inlineSuggestionContainer.classList.add('inline-suggestion-container');
        document.body.appendChild(this.inlineSuggestionContainer);
    }
    
    // Create code action container
    private createCodeActionContainer(): void {
        this.codeActionContainer = document.createElement('div');
        this.codeActionContainer.classList.add('code-action-container');
        document.body.appendChild(this.codeActionContainer);
    }
    
    // Show inline suggestions
    public async showInlineSuggestions(code: string, position: number): Promise<void> {
        if (!this.inlineSuggestionContainer) {
            return;
        }
        
        try {
            // Get suggestions from AI service
            this.currentInlineSuggestions = await this.aiService.generateInlineSuggestion(code, position);
            
            if (this.currentInlineSuggestions.length === 0) {
                this.hideInlineSuggestions();
                return;
            }
            
            // Clear previous suggestions
            this.inlineSuggestionContainer.innerHTML = '';
            
            // Add suggestions to container
            this.currentInlineSuggestions.forEach((suggestion, index) => {
                const suggestionElement = document.createElement('div');
                suggestionElement.classList.add('inline-suggestion');
                suggestionElement.innerHTML = `
                    <div class="suggestion-content">${this.escapeHtml(suggestion.code)}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                `;
                
                // Add click event to apply suggestion
                suggestionElement.addEventListener('click', () => {
                    this.applySuggestion(suggestion);
                });
                
                this.inlineSuggestionContainer?.appendChild(suggestionElement);
            });
            
            // Position container
            const cursorPosition = window.monaco?.editor?.getPosition();
            if (cursorPosition) {
                const editorCoords = window.monaco?.editor?.getScrolledVisiblePosition(cursorPosition);
                if (editorCoords) {
                    this.inlineSuggestionContainer.style.top = `${editorCoords.top + 20}px`;
                    this.inlineSuggestionContainer.style.left = `${editorCoords.left}px`;
                    this.inlineSuggestionContainer.classList.add('visible');
                }
            }
        } catch (error) {
            console.error('Error getting inline suggestions:', error);
            this.hideInlineSuggestions();
        }
    }
    
    // Hide inline suggestions
    public hideInlineSuggestions(): void {
        if (this.inlineSuggestionContainer) {
            this.inlineSuggestionContainer.classList.remove('visible');
        }
    }
    
    // Apply suggestion
    private applySuggestion(suggestion: CodeSuggestion): void {
        // Insert suggestion at current cursor position
        const editor = window.monaco?.editor;
        if (editor) {
            const position = editor.getPosition();
            if (position) {
                editor.executeEdits('ai-suggestion', [
                    {
                        range: new window.monaco.Range(
                            position.lineNumber,
                            position.column,
                            position.lineNumber,
                            position.column
                        ),
                        text: suggestion.code
                    }
                ]);
            }
        }
        
        // Hide suggestions
        this.hideInlineSuggestions();
    }
    
    // Show code actions
    public async showCodeActions(code: string, selection: string): Promise<void> {
        if (!this.codeActionContainer || !selection) {
            return;
        }
        
        try {
            // Get code actions from AI service
            const codeActions = await this.aiService.generateCodeAction(code, selection);
            
            if (codeActions.length === 0) {
                this.hideCodeActions();
                return;
            }
            
            // Clear previous actions
            this.codeActionContainer.innerHTML = '';
            
            // Add actions to container
            codeActions.forEach((action) => {
                const actionElement = document.createElement('div');
                actionElement.classList.add('code-action');
                actionElement.textContent = action;
                
                // Add click event to apply action
                actionElement.addEventListener('click', () => {
                    this.applyCodeAction(action);
                });
                
                this.codeActionContainer?.appendChild(actionElement);
            });
            
            // Position container
            const selectionPosition = window.monaco?.editor?.getSelection();
            if (selectionPosition) {
                const editorCoords = window.monaco?.editor?.getScrolledVisiblePosition({
                    lineNumber: selectionPosition.endLineNumber,
                    column: selectionPosition.endColumn
                });
                if (editorCoords) {
                    this.codeActionContainer.style.top = `${editorCoords.top + 20}px`;
                    this.codeActionContainer.style.left = `${editorCoords.left}px`;
                    this.codeActionContainer.classList.add('visible');
                }
            }
        } catch (error) {
            console.error('Error getting code actions:', error);
            this.hideCodeActions();
        }
    }
    
    // Hide code actions
    public hideCodeActions(): void {
        if (this.codeActionContainer) {
            this.codeActionContainer.classList.remove('visible');
        }
    }
    
    // Apply code action
    private applyCodeAction(action: string): void {
        // Show chat panel with action as message
        this.showChatPanel();
        
        // Add action as user message
        this.addChatMessage('user', `Apply action: ${action}`);
        
        // Hide code actions
        this.hideCodeActions();
    }
}

// Export the class
export default AIIntegrationUI;
